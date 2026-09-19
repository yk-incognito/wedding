"use client";
import React, { useEffect, useState, useRef } from "react";
import { FileText, X, MapPin, Send, Phone, Heart } from "lucide-react";

export default function TemplateOne({
  invitation,
  onRsvpSubmit,
  onWishSubmit,
  wishes = [],
  wishLoading = false,
  isSampleDemo = false
}) {
  const [gateOpened, setGateOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  // RSVP State
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Wishes State
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");

  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
  const audioRef = useRef(null);

  // ഓഡിയോ സെറ്റപ്പ്
  useEffect(() => {
    if (invitation?.music_url) {
      const audio = new Audio(invitation.music_url);
      audio.loop = true;
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [invitation?.music_url]);

  // ലൈവ് കൗണ്ട്ഡൗൺ
  useEffect(() => {
    if (!invitation?.wedding_date) return;
    const target = new Date(invitation.wedding_date).getTime();

    const interval = setInterval(() => {
      const distance = target - new Date().getTime();
      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
      } else {
        setTimeLeft({
          days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, "0"),
          hours: String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, "0"),
          minutes: String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0"),
          seconds: String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, "0")
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [invitation?.wedding_date]);

  // വീഴുന്ന റോസാപ്പൂവിതളുകൾ
  useEffect(() => {
    if (!gateOpened) return;
    const interval = setInterval(() => {
      const container = document.getElementById("petals");
      if (!container) return;
      const petal = document.createElement("div");
      petal.className = "petal";
      petal.style.left = Math.random() * 100 + "vw";
      petal.style.animationDuration = 7 + Math.random() * 6 + "s";
      petal.style.animationDelay = Math.random() * 1.5 + "s";
      container.appendChild(petal);
      setTimeout(() => petal.remove(), 14000);
    }, 900);

    return () => clearInterval(interval);
  }, [gateOpened]);

  const handleOpenGate = () => {
    setGateOpened(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleAddToCalendar = () => {
    const weddingDate = new Date(invitation?.wedding_date || Date.now());
    const year = weddingDate.getUTCFullYear();
    const month = String(weddingDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(weddingDate.getUTCDate()).padStart(2, "0");
    const formatted = `${year}${month}${day}T050000Z`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      `PRODID:-//${invitation?.bride_name} & ${invitation?.groom_name}//Wedding//EN`,
      "BEGIN:VEVENT",
      `SUMMARY:${invitation?.bride_name} & ${invitation?.groom_name} — Wedding`,
      `DESCRIPTION:Wedding celebration at ${invitation?.venue_name}.`,
      `LOCATION:${invitation?.venue_name}, ${invitation?.venue_address || ""}`,
      `DTSTART:${formatted}`,
      `DTEND:${formatted}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${invitation?.bride_name}-${invitation?.groom_name}-wedding.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const localRsvpSubmit = async (e) => {
    e.preventDefault();
    if (onRsvpSubmit) {
      const res = await onRsvpSubmit(rsvpName, rsvpGuests);
      if (res?.success) setRsvpSubmitted(true);
    }
  };

  const localWishSubmit = async (e) => {
    e.preventDefault();
    if (!guestName || !guestMessage) return;
    if (onWishSubmit) {
      const res = await onWishSubmit(guestName, guestMessage);
      if (res?.success) {
        setGuestName("");
        setGuestMessage("");
      }
    }
  };

  const brideInitial = (invitation?.bride_name || "B")[0]?.toUpperCase();
  const groomInitial = (invitation?.groom_name || "G")[0]?.toUpperCase();

  const dateObj = invitation?.wedding_date ? new Date(invitation.wedding_date) : new Date();
  const dateFormatted = dateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const dayOfMonth = dateObj.getDate();
  const monthAbbr = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const yearNumber = dateObj.getFullYear();
  const muhurthamTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const gallery = Array.isArray(invitation?.gallery_photos) && invitation.gallery_photos.length > 0
    ? invitation.gallery_photos
    : [invitation?.cover_photo];

  const contacts = Array.isArray(invitation?.contact_numbers) ? invitation.contact_numbers : [];
  const customSecs = Array.isArray(invitation?.custom_sections) ? invitation.custom_sections : [];

  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=18&data=${encodeURIComponent(invitation?.map_url || "https://maps.google.com")}`;

  return (
    <div className="netflix-luxury-container">
      {/* നിങ്ങളുടെ ഒറിജിനൽ ഫുൾ CSS അതേപടി */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .netflix-luxury-container {
          --ink: #16090c;
          --wine: #54101a;
          --wine2: #2a080e;
          --ivory: #f6efe3;
          --paper: #eee4d5;
          --gold: #c7a36a;
          --soft: #d7cab7;
          --serif: "Cormorant Garamond", Georgia, serif;
          --sans: "DM Sans", Arial, sans-serif;
          background: var(--ink);
          color: var(--ivory);
          font-family: var(--sans);
          font-weight: 300;
          overflow-x: hidden;
          margin: 0;
          position: relative;
        }

        .netflix-luxury-container * { box-sizing: border-box; }

        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: .065;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
        }

        .petals {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 70;
          overflow: hidden;
        }
        .petal {
          position: absolute;
          top: -8vh;
          width: 10px;
          height: 16px;
          border-radius: 80% 20% 70% 30%;
          background: linear-gradient(135deg, #8d2740, #3d0915);
          opacity: .45;
          animation: petalFall linear forwards;
        }
        @keyframes petalFall {
          0% { transform: translate3d(0, -10vh, 0) rotate(0); }
          45% { transform: translate3d(45px, 48vh, 0) rotate(210deg); }
          100% { transform: translate3d(-25px, 110vh, 0) rotate(520deg); opacity: 0; }
        }

        .gate {
          position: fixed;
          z-index: 150;
          inset: 0;
          display: grid;
          place-content: center;
          text-align: center;
          padding: 24px;
          background: radial-gradient(circle at 50% 38%, #692131 0, #320c14 36%, #11070a 78%);
          transition: opacity 1.1s ease, visibility 1.1s ease;
        }
        .gate::before, .gate::after {
          content: "";
          position: absolute;
          inset: 22px;
          border: 1px solid rgba(199, 163, 106, .42);
          pointer-events: none;
        }
        .gate::after {
          inset: 30px;
          border-color: rgba(199, 163, 106, .12);
        }
        .gate.opened {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .gate-glow {
          position: absolute;
          width: 440px;
          height: 440px;
          left: 50%;
          top: 48%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: rgba(171, 96, 77, .12);
          filter: blur(55px);
        }
        .monogram, .closing-monogram {
          font: 500 clamp(3rem, 11vw, 6rem)/1 var(--serif);
          letter-spacing: .12em;
          color: var(--gold);
        }
        .monogram span, .closing-monogram span {
          font-style: italic;
          font-weight: 400;
          font-size: .7em;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: .32em;
          font-size: .68rem;
          color: var(--gold);
          font-weight: 500;
        }
        .gate h1 {
          font: 400 clamp(2.2rem, 5.5vw, 4rem)/1.15 var(--serif);
          letter-spacing: -.02em;
          margin: 20px 0 16px;
        }
        .gate h1 em {
          font-weight: 400;
          color: var(--gold);
        }
        .gate-date {
          letter-spacing: .35em;
          font-size: .72rem;
        }
        .open-button {
          width: min(310px, 82vw);
          margin: 28px auto 0;
          padding: 7px 7px 7px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(199, 163, 106, .65);
          border-radius: 99px;
          background: rgba(255, 255, 255, .02);
          color: var(--ivory);
          font: 500 .7rem var(--sans);
          text-transform: uppercase;
          letter-spacing: .19em;
          cursor: pointer;
        }
        .open-button i {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: grid;
          place-content: center;
          background: var(--gold);
          color: var(--ink);
          font-style: normal;
          font-size: 1.2rem;
          transition: transform .3s;
        }
        .open-button:hover i { transform: rotate(-35deg); }
        .sound-note {
          font-size: .65rem;
          opacity: .55;
          letter-spacing: .12em;
          margin-top: 14px;
        }

        .hero {
          height: 100svh;
          min-height: 620px;
          position: relative;
          display: grid;
          align-items: end;
          overflow: hidden;
        }
        .hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: grayscale(1) contrast(1.06);
        }
        .hero-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(9, 5, 7, .12), rgba(9, 5, 7, .04) 35%, rgba(15, 6, 9, .9) 100%);
        }
        .hero-copy {
          position: relative;
          text-align: center;
          padding: 0 22px 13vh;
        }
        .hero-copy h1 {
          font: 500 clamp(2.8rem, 6.5vw, 5.2rem)/1.1 var(--serif);
          letter-spacing: -.02em;
          margin: 16px 0 24px;
          text-shadow: 0 2px 18px rgba(0, 0, 0, .45);
        }
        .hero-copy h1 span {
          font-size: .55em;
          font-style: italic;
          color: var(--gold);
        }
        .hero-date {
          font-size: .74rem;
          text-transform: uppercase;
          letter-spacing: .28em;
        }

        .visual-story { background: #10080a; }
        .story-frame {
          position: relative;
          height: 100svh;
          min-height: 650px;
          margin: 0;
          overflow: hidden;
          display: grid;
          align-items: end;
        }
        .story-frame img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .story-grade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(12, 7, 8, .08) 0%, rgba(12, 7, 8, .04) 42%, rgba(13, 7, 9, .78) 100%), linear-gradient(90deg, rgba(70, 15, 25, .13), transparent 45%, rgba(20, 8, 11, .12));
          box-shadow: inset 0 0 110px rgba(22, 8, 12, .25);
        }
        .story-frame figcaption {
          position: relative;
          z-index: 2;
          padding: 0 max(25px, 8vw) clamp(70px, 10vh, 120px);
          max-width: 900px;
          text-shadow: 0 3px 24px rgba(0, 0, 0, .55);
        }
        .story-frame figcaption span {
          display: block;
          color: var(--gold);
          font: 500 .66rem/1.5 var(--sans);
          letter-spacing: .3em;
          text-transform: uppercase;
          margin-bottom: 17px;
        }
        .story-frame figcaption strong {
          display: block;
          color: #fff8ed;
          font: 400 clamp(2rem, 4.5vw, 3.4rem)/1.2 var(--serif);
          letter-spacing: -.01em;
        }

        .section {
          padding: clamp(80px, 12vw, 160px) max(24px, 8vw);
          position: relative;
        }
        .welcome {
          text-align: center;
          color: var(--ink);
          background: var(--ivory);
          overflow: hidden;
        }
        .welcome blockquote {
          font: 400 clamp(1.8rem, 3.8vw, 2.9rem)/1.25 var(--serif);
          margin: 24px auto 18px;
          max-width: 900px;
        }
        .verse {
          color: var(--wine);
          text-transform: uppercase;
          letter-spacing: .27em;
          font-size: .7rem;
        }
        .gold-rule {
          width: min(260px, 55vw);
          margin: 40px auto;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--gold);
        }
        .gold-rule::before, .gold-rule::after {
          content: "";
          height: 1px;
          flex: 1;
          background: var(--gold);
        }
        .intro {
          font: 400 clamp(1.4rem, 3vw, 2.2rem)/1.35 var(--serif);
          max-width: 650px;
          margin: auto;
          color: #4b3d3c;
        }

        .dark-section {
          background: linear-gradient(145deg, #22090e, #0e0809);
          text-align: center;
        }
        .family-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 5vw;
          align-items: center;
          max-width: 1100px;
          margin: 65px auto 0;
        }
        .family-label {
          text-transform: uppercase;
          letter-spacing: .22em;
          color: var(--gold);
          font-size: .62rem;
        }
        .family-grid h2 {
          font: 400 clamp(1.8rem, 3.3vw, 3rem)/1.05 var(--serif);
          margin: 20px 0;
        }
        .family-grid h2 i {
          color: var(--gold);
          font-weight: 400;
        }
        .family-grid p {
          color: #ab9d91;
          font-size: .76rem;
          letter-spacing: .08em;
        }
        .family-amp {
          width: 110px;
          height: 110px;
          border: 1px solid rgba(199, 163, 106, .4);
          border-radius: 50%;
          display: grid;
          place-content: center;
          font: 500 2.1rem var(--serif);
          color: var(--gold);
          margin: auto;
        }
        .family-amp span { font-style: italic; }

        .date-section {
          background: var(--paper);
          color: var(--ink);
          text-align: center;
        }
        .date-card {
          max-width: 980px;
          margin: auto;
          border: 1px solid rgba(84, 16, 26, .25);
          padding: clamp(45px, 8vw, 90px) 18px;
          box-shadow: 0 30px 80px rgba(53, 23, 20, .1);
        }
        .date-lockup {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(18px, 5vw, 70px);
          margin: 22px 0;
        }
        .date-lockup strong {
          font: 500 clamp(4rem, 9vw, 6.8rem)/.9 var(--serif);
          color: var(--wine);
        }
        .date-lockup span {
          font: 500 .75rem var(--sans);
          letter-spacing: .3em;
          writing-mode: vertical-rl;
        }
        .date-card h2 {
          font: 400 clamp(1.6rem, 4vw, 2.5rem) var(--serif);
          margin: 30px 0 8px;
        }
        .countdown {
          margin: 55px auto 45px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          max-width: 640px;
        }
        .countdown div { border-right: 1px solid rgba(84, 16, 26, .18); }
        .countdown div:last-child { border: 0; }
        .countdown strong {
          display: block;
          font: 500 clamp(2rem, 5vw, 3.6rem) var(--serif);
          color: var(--wine);
        }
        .countdown span {
          font-size: .58rem;
          text-transform: uppercase;
          letter-spacing: .2em;
        }
        .outline-button {
          border: 1px solid var(--wine);
          background: transparent;
          color: var(--wine);
          padding: 16px 26px;
          text-transform: uppercase;
          letter-spacing: .2em;
          font: 500 .62rem var(--sans);
          cursor: pointer;
        }

        .venue {
          display: grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 10vw;
          align-items: center;
          text-align: left;
        }
        .venue-copy h2 {
          font: 500 clamp(2.4rem, 5vw, 4.2rem)/1.1 var(--serif);
          margin: 20px 0 25px;
          color: var(--ivory);
        }
        .venue-copy > p:not(.eyebrow) {
          font: 400 clamp(1.2rem, 2.5vw, 1.8rem)/1.5 var(--serif);
          color: #c8bbae;
        }
        .venue-time {
          margin-top: 28px !important;
          color: var(--gold) !important;
        }
        .actions {
          margin-top: 45px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .gold-button {
          background: var(--gold);
          color: var(--ink);
          padding: 17px 23px;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: .18em;
          font-size: .62rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
        }
        .gold-button span { font-size: 1rem; margin-left: 14px; }
        .text-link {
          color: var(--ivory);
          font-size: .66rem;
          letter-spacing: .14em;
          text-transform: uppercase;
          text-underline-offset: 5px;
        }
        .qr-card {
          background: var(--ivory);
          padding: 25px;
          max-width: 360px;
          justify-self: end;
          color: var(--wine);
          text-align: center;
          border-radius: 12px;
        }
        .qr-card img { display: block; width: 100%; height: auto; }
        .qr-card span {
          display: block;
          margin-top: 17px;
          text-transform: uppercase;
          letter-spacing: .24em;
          font-size: .62rem;
        }

        .closing {
          text-align: center;
          background: radial-gradient(circle at 50% 45%, #591723, #250a0f 48%, #100708);
          min-height: 90svh;
          display: grid;
          place-content: center;
        }
        .closing h2 {
          font: 400 clamp(2.4rem, 5.5vw, 4.5rem)/1.15 var(--serif);
          margin: 25px 0 35px;
        }
        .closing-monogram { margin-top: 65px; }
        .closing-date {
          font-size: .64rem;
          letter-spacing: .3em;
          color: var(--gold);
        }

        .music-control {
          position: fixed;
          z-index: 120;
          right: 18px;
          bottom: 18px;
          border: 1px solid rgba(199, 163, 106, .5);
          border-radius: 99px;
          background: rgba(22, 9, 12, .85);
          backdrop-filter: blur(12px);
          color: var(--ivory);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font: 500 .58rem var(--sans);
          letter-spacing: .1em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .bars {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 14px;
        }
        .bars i {
          display: block;
          width: 2px;
          background: var(--gold);
          animation: musicAnim .7s ease-in-out infinite alternate;
        }
        .bars i:nth-child(1) { height: 7px; }
        .bars i:nth-child(2) { height: 13px; animation-delay: .2s; }
        .bars i:nth-child(3) { height: 9px; animation-delay: .4s; }
        .music-control.paused .bars i {
          animation-play-state: paused;
          height: 3px;
        }
        @keyframes musicAnim { to { height: 3px; } }

        @media(max-width: 720px) {
          .family-grid { grid-template-columns: 1fr; }
          .family-amp { margin: 12px auto; width: 76px; height: 76px; }
          .venue { grid-template-columns: 1fr; text-align: center; }
          .actions { justify-content: center; }
          .qr-card { justify-self: center; width: min(320px, 90vw); }
          .gate::before { inset: 12px; }
          .gate::after { inset: 18px; }
        }
      ` }} />

      <div className="grain" aria-hidden="true"></div>
      <div className="petals" id="petals" aria-hidden="true"></div>

      {/* 1. GATE CURTAIN */}
      <section className={`gate ${gateOpened ? "opened" : ""}`}>
        <div className="gate-glow"></div>
        <div className="monogram">{brideInitial} <span>&</span> {groomInitial}</div>
        <p className="eyebrow">{invitation?.parents_text || "Together with their families"}</p>
        <h1>You’re invited<br /><em>to celebrate love</em></h1>
        <p className="gate-date">{dayOfMonth} · {monthAbbr} · {yearNumber}</p>
        <button className="open-button" type="button" onClick={handleOpenGate}>
          <span>Open invitation</span>
          <i aria-hidden="true">→</i>
        </button>
        <p className="sound-note">Tap to enter with music</p>
      </section>

      {/* 2. HERO */}
      <section className="hero">
        <img 
          className="hero-image" 
          src={invitation?.cover_photo || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80"} 
          alt="Couple Portrait" 
        />
        <div className="hero-shade"></div>
        <div className="hero-copy">
          <p className="eyebrow">The wedding of</p>
          <h1>{invitation?.bride_name} <span>&</span> {invitation?.groom_name}</h1>
          <p className="hero-date">{dateFormatted}</p>

          {invitation?.wedding_card_photo && (
            <div className="mt-6">
              <button
                onClick={() => setShowCardModal(true)}
                className="px-6 py-2.5 rounded-full bg-[#54101a] hover:bg-[#7f2639] text-[#f6efe3] font-serif text-xs uppercase tracking-widest border border-[#c7a36a]/60 shadow-xl transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 inline mr-2" /> View Official Card
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. VISUAL STORY CHAPTERS */}
      <section className="visual-story">
        {gallery.slice(0, 3).map((imgUrl, i) => (
          <figure key={i} className="story-frame">
            <img src={imgUrl} alt={`Story Chapter ${i+1}`} />
            <div className="story-grade"></div>
            <figcaption>
              <span>{i === 0 ? "Chapter one" : i === 1 ? "Chapter two" : "Chapter three"}</span>
              <strong>{i === 0 ? "A beautiful beginning" : i === 1 ? "Where every horizon feels like home" : "And forever becomes a promise"}</strong>
            </figcaption>
          </figure>
        ))}
      </section>

      {/* 4. WELCOME & SCRIPTURE / PROMISE */}
      <section className="welcome section">
        <p className="eyebrow">A promise, a prayer, a forever</p>
        <blockquote>“{invitation?.first_met_story || "This is the Lord’s doing; it is marvellous in our eyes."}”</blockquote>
        <p className="verse">Psalm 118:23</p>
        <div className="gold-rule"><span>✦</span></div>
        <p className="intro">{invitation?.journey_story || "With hearts full of gratitude, we invite you to witness the beginning of our forever."}</p>
      </section>

      {/* 5. BRIDE & GROOM EDITORIAL SPOTLIGHT */}
      <section className="section bg-[#10070a] py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          {/* Bride Card */}
          <div className="p-8 rounded-3xl bg-[#1b0a0f] border border-[#c7a36a]/30 shadow-2xl space-y-4">
            {invitation?.bride_photo ? (
              <img src={invitation.bride_photo} alt={invitation.bride_name} className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-rose-400/80 shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto text-rose-300 font-serif text-3xl font-bold border border-rose-500/30">
                {brideInitial}
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase font-serif tracking-[0.25em] text-[#c7a36a]">The Bride</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-rose-200 mt-1">{invitation?.bride_name}</h3>
              {invitation?.bride_profession && (
                <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider pt-1">{invitation.bride_profession}</p>
              )}
            </div>
            {invitation?.bride_parents && (
              <p className="text-xs text-stone-400"><strong className="text-stone-300">Daughter of:</strong> {invitation.bride_parents}</p>
            )}
            {invitation?.bride_bio && (
              <p className="text-sm italic font-serif text-stone-300 px-2 leading-relaxed">"{invitation.bride_bio}"</p>
            )}
            {invitation?.bride_family && (
              <p className="text-xs text-stone-400 pt-3 border-t border-stone-800"><strong className="text-stone-300">Family:</strong> {invitation.bride_family}</p>
            )}
          </div>

          {/* Groom Card */}
          <div className="p-8 rounded-3xl bg-[#1b0a0f] border border-[#c7a36a]/30 shadow-2xl space-y-4">
            {invitation?.groom_photo ? (
              <img src={invitation.groom_photo} alt={invitation.groom_name} className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-amber-400/80 shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto text-amber-300 font-serif text-3xl font-bold border border-amber-500/30">
                {groomInitial}
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase font-serif tracking-[0.25em] text-[#c7a36a]">The Groom</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 mt-1">{invitation?.groom_name}</h3>
              {invitation?.groom_profession && (
                <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider pt-1">{invitation.groom_profession}</p>
              )}
            </div>
            {invitation?.groom_parents && (
              <p className="text-xs text-stone-400"><strong className="text-stone-300">Son of:</strong> {invitation.groom_parents}</p>
            )}
            {invitation?.groom_bio && (
              <p className="text-sm italic font-serif text-stone-300 px-2 leading-relaxed">"{invitation.groom_bio}"</p>
            )}
            {invitation?.groom_family && (
              <p className="text-xs text-stone-400 pt-3 border-t border-stone-800"><strong className="text-stone-300">Family:</strong> {invitation.groom_family}</p>
            )}
          </div>
        </div>
      </section>

      {/* 6. TOGETHER WITH FAMILIES */}
      <section className="families section dark-section">
        <p className="eyebrow">Together with their families</p>
        <div className="family-grid">
          <article>
            <span className="family-label">Parents of the groom</span>
            <h2>{invitation?.groom_parents || `${invitation?.groom_name}'s Parents`}</h2>
            <p>{invitation?.groom_family || "Family of the groom"}</p>
          </article>
          <div className="family-amp">{brideInitial}<span>&</span>{groomInitial}</div>
          <article>
            <span className="family-label">Parents of the bride</span>
            <h2>{invitation?.bride_parents || `${invitation?.bride_name}'s Parents`}</h2>
            <p>{invitation?.bride_family || "Family of the bride"}</p>
          </article>
        </div>
      </section>

      {/* 7. SAVE THE DATE & COUNTDOWN */}
      <section className="date-section section">
        <div className="date-card">
          <p className="eyebrow">Save the date</p>
          <div className="date-lockup">
            <span>{monthAbbr}</span>
            <strong>{dayOfMonth}</strong>
            <span>{yearNumber}</span>
          </div>
          <h2>{dateFormatted} at {muhurthamTime}</h2>
          <p>Ceremony & Reception to follow</p>
          <div className="countdown">
            <div><strong>{timeLeft.days}</strong><span>Days</span></div>
            <div><strong>{timeLeft.hours}</strong><span>Hours</span></div>
            <div><strong>{timeLeft.minutes}</strong><span>Minutes</span></div>
            <div><strong>{timeLeft.seconds}</strong><span>Seconds</span></div>
          </div>
          <button className="outline-button" onClick={handleAddToCalendar} type="button">
            Add to calendar (.ics)
          </button>
        </div>
      </section>

      {/* 8. VENUE & QR CODE */}
      <section className="venue section dark-section">
        <div className="venue-copy">
          <p className="eyebrow">The celebration</p>
          <h2 className="venue-name">{invitation?.venue_name}</h2>
          <p>{invitation?.venue_address}</p>
          <p className="venue-time">Ceremony · {muhurthamTime}<br />Reception to follow</p>
          <div className="actions">
            {invitation?.map_url && (
              <a className="gold-button" href={invitation.map_url} target="_blank" rel="noopener">
                Get directions <span>↗</span>
              </a>
            )}
            {invitation?.whatsapp_number && (
              <a 
                className="gold-button" 
                style={{ background: "#25D366", color: "#fff" }}
                href={`https://wa.me/${invitation.whatsapp_number.replace(/[^0-9]/g, "")}?text=Congratulations%20${encodeURIComponent(invitation.bride_name || "")}%20and%20${encodeURIComponent(invitation.groom_name || "")}!`} 
                target="_blank" 
                rel="noopener"
              >
                Send WhatsApp Wishes
              </a>
            )}
            {invitation?.email && (
              <a className="text-link" href={`mailto:${invitation.email}`}>
                Email · {invitation.email}
              </a>
            )}
          </div>
        </div>
        <div className="qr-card">
          <img src={qrDataUrl} alt="QR code for directions" />
          <span>Scan for directions</span>
        </div>
      </section>

      {/* 9. PHOTO GALLERY */}
      {gallery.length > 3 && (
        <section className="section bg-[#10080a] py-16">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <p className="eyebrow">Captured Memories</p>
            <h2 className="text-3xl font-serif text-[#c7a36a]">Glimpses of Forever</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4">
              {gallery.slice(3).map((imgUrl, i) => (
                <div key={i} className="aspect-[4/5] rounded-2xl overflow-hidden border border-[#c7a36a]/30 shadow-lg">
                  <img src={imgUrl} alt={`Gallery ${i+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. കസ്റ്റം സെക്ഷനുകൾ */}
      {customSecs.length > 0 && (
        <section className="section bg-[#16090c] py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            {customSecs.map((sec, i) => (
              <div key={i} className="p-8 rounded-3xl bg-[#22090e] border border-[#c7a36a]/30 text-center space-y-2">
                <h3 className="text-2xl font-serif text-[#c7a36a]">{sec.title}</h3>
                <p className="text-sm text-stone-300 font-serif leading-relaxed whitespace-pre-line">{sec.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 11. കോർഡിനേറ്റർ കോൺടാക്റ്റുകൾ */}
      {contacts.length > 0 && (
        <section className="section bg-[#10080a] py-12">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="eyebrow">Event Coordinators</p>
            <div className="flex flex-wrap justify-center gap-8 pt-2">
              {contacts.map((c, i) => (
                <div key={i}>
                  <p className="text-xs text-stone-400 font-serif">{c.name || "Coordinator"}</p>
                  <a href={`tel:${c.phone}`} className="text-sm font-semibold text-[#c7a36a] hover:underline flex items-center justify-center gap-1 mt-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" /> {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 12. ഇന്ററാക്ടീവ് RSVP ഫോം */}
      <section className="section bg-[#17090c] py-16">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#240a12] border border-[#c7a36a]/40 shadow-2xl text-center space-y-6">
          <div>
            <p className="eyebrow">RSVP</p>
            <h2 className="text-2xl sm:text-3xl font-serif text-rose-200 mt-1">Will You Be Attending?</h2>
          </div>

          {rsvpSubmitted ? (
            <p className="text-emerald-400 font-serif">Thank you! Your RSVP has been confirmed. ❤️</p>
          ) : (
            <form onSubmit={localRsvpSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-xs text-stone-400 font-serif">Your Full Name</label>
                <input required value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="Enter your name..." className="w-full mt-1 p-3 bg-black/50 border border-stone-700 rounded-xl outline-none text-sm text-stone-200" />
              </div>
              <div>
                <label className="text-xs text-stone-400 font-serif">Number of Guests</label>
                <input required type="number" min="1" max="10" value={rsvpGuests} onChange={(e) => setRsvpGuests(e.target.value)} className="w-full mt-1 p-3 bg-black/50 border border-stone-700 rounded-xl outline-none text-sm text-stone-200" />
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#c7a36a] text-stone-950 font-bold rounded-xl text-xs uppercase tracking-widest hover:brightness-110 transition cursor-pointer">
                Confirm Attendance
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 13. ആശംസാ മതിൽ (GUEST WISHES WALL) */}
      <section className="section bg-[#10080a] py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="p-8 rounded-3xl bg-[#1b0a0f] border border-[#c7a36a]/30 space-y-4">
            <h3 className="text-xl font-serif text-[#c7a36a] text-center">Leave Your Blessings & Wishes</h3>
            <form onSubmit={localWishSubmit} className="space-y-3">
              <input required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your Name" className="w-full p-3 bg-black/50 border border-stone-700 rounded-xl text-xs text-stone-200 outline-none" />
              <textarea required rows={2} value={guestMessage} onChange={(e) => setGuestMessage(e.target.value)} placeholder="Write your heartfelt wishes..." className="w-full p-3 bg-black/50 border border-stone-700 rounded-xl text-xs text-stone-200 outline-none" />
              <button type="submit" disabled={wishLoading} className="w-full py-3 bg-[#54101a] hover:bg-[#7f2639] text-[#f6efe3] font-serif text-xs uppercase tracking-widest border border-[#c7a36a]/60 rounded-xl cursor-pointer">
                {wishLoading ? "Posting..." : "Post Wedding Wish"}
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {wishes.map((w, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#1b0a0f]/60 border border-stone-800 space-y-1">
                <span className="text-xs font-bold text-[#c7a36a]">{w.guest_name}</span>
                <p className="text-xs text-stone-300 leading-relaxed font-serif">{w.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. CLOSING */}
      <section className="closing section">
        <p className="eyebrow">With love and blessings</p>
        <h2>We can’t wait<br />to celebrate with you.</h2>
        <div className="closing-monogram">{brideInitial} <span>&</span> {groomInitial}</div>
        <p className="closing-date">{dayOfMonth} · {monthAbbr} · {yearNumber}</p>
      </section>

      {/* EQUALIZER MUSIC CONTROL */}
      {invitation?.music_url && (
        <button 
          className={`music-control ${!isPlaying ? "paused" : ""}`} 
          onClick={toggleMusic} 
          type="button" 
          aria-label="Toggle music"
        >
          <span className="bars" aria-hidden="true"><i></i><i></i><i></i></span>
          <span>{isPlaying ? "Music on" : "Music paused"}</span>
        </button>
      )}

      {/* OFFICIAL CARD LIGHTBOX MODAL */}
      {showCardModal && invitation?.wedding_card_photo && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#1b0d11] border border-[#c7a36a]/40 rounded-3xl p-4 shadow-2xl">
            <button onClick={() => setShowCardModal(false)} className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-stone-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-serif font-bold text-[#c7a36a] text-center mb-3 tracking-widest uppercase">Official Wedding Card</h3>
            <img src={invitation.wedding_card_photo} alt="Official Card" className="max-h-[80vh] w-full object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
