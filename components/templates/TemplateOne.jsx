"use client";
import React, { useEffect, useState, useRef } from "react";
import { FileText, X, MapPin, Send, Phone, Calendar, Heart, MessageCircle } from "lucide-react";

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

  // Wishes Local State
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
      petal.style.animationDuration = 8 + Math.random() * 6 + "s";
      petal.style.animationDelay = Math.random() * 1.5 + "s";
      container.appendChild(petal);
      setTimeout(() => petal.remove(), 14000);
    }, 1100);

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

  // ഗാലറി ഇമേജുകൾ (മിനിമം 6 ഫോട്ടോകൾ കാണിക്കാൻ)
  const defaultGallery = [
    invitation?.cover_photo || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80"
  ];

  const gallery = Array.isArray(invitation?.gallery_photos) && invitation.gallery_photos.length > 0
    ? (invitation.gallery_photos.length < 4 ? [...invitation.gallery_photos, ...defaultGallery.slice(invitation.gallery_photos.length)] : invitation.gallery_photos)
    : defaultGallery;

  const contacts = Array.isArray(invitation?.contact_numbers) ? invitation.contact_numbers : [];
  const customSecs = Array.isArray(invitation?.custom_sections) ? invitation.custom_sections : [];

  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=18&data=${encodeURIComponent(invitation?.map_url || "https://maps.google.com")}`;

  return (
    <div className="netflix-luxury-container">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .netflix-luxury-container {
          --ink: #14070a;
          --wine: #480e17;
          --wine-dark: #22070c;
          --ivory: #faf5ed;
          --paper: #f2e8dc;
          --gold: #c7a36a;
          --gold-bright: #dfbe87;
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

        /* എല്ലാവിധ അനാവശ്യ സൂമുകളും ഷേക്കിംഗും ഒഴിവാക്കുന്നു */
        * {
          transform: none !important;
          animation-play-state: running;
        }

        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: .05;
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
          top: -6vh;
          width: 9px;
          height: 15px;
          border-radius: 80% 20% 70% 30%;
          background: linear-gradient(135deg, #8d2740, #3d0915);
          opacity: .4;
          animation: petalFall linear forwards !important;
        }
        @keyframes petalFall {
          0% { transform: translateY(-6vh) rotate(0deg) !important; }
          100% { transform: translateY(105vh) rotate(360deg) !important; opacity: 0; }
        }

        /* 1. റോയൽ ഗേറ്റ് */
        .gate {
          position: fixed;
          z-index: 150;
          inset: 0;
          display: grid;
          place-content: center;
          text-align: center;
          padding: 24px;
          background: radial-gradient(circle at 50% 38%, #5a1725 0, #27080f 45%, #0f0507 80%);
          transition: opacity 1.1s ease, visibility 1.1s ease;
        }
        .gate::before, .gate::after {
          content: "";
          position: absolute;
          inset: 20px;
          border: 1px solid rgba(199, 163, 106, .35);
          pointer-events: none;
        }
        .gate::after {
          inset: 28px;
          border-color: rgba(199, 163, 106, .12);
        }
        .gate.opened {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .gate-glow {
          position: absolute;
          width: 380px;
          height: 380px;
          left: 50%;
          top: 48%;
          transform: translate(-50%, -50%) !important;
          border-radius: 50%;
          background: rgba(199, 163, 106, .1);
          filter: blur(55px);
        }
        .monogram, .closing-monogram {
          font: 500 clamp(2.4rem, 5.5vw, 4rem)/1 var(--serif);
          letter-spacing: .12em;
          color: var(--gold);
        }
        .monogram span, .closing-monogram span {
          font-style: italic;
          font-weight: 400;
          font-size: .75em;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: .3em;
          font-size: .68rem;
          color: var(--gold);
          font-weight: 500;
        }
        .gate h1 {
          font: 400 clamp(2rem, 4.5vw, 3.4rem)/1.2 var(--serif);
          margin: 18px 0 14px;
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
          width: min(290px, 80vw);
          margin: 22px auto 0;
          padding: 8px 8px 8px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(199, 163, 106, .6);
          border-radius: 99px;
          background: rgba(255, 255, 255, .03);
          color: var(--ivory);
          font: 500 .7rem var(--sans);
          text-transform: uppercase;
          letter-spacing: .18em;
          cursor: pointer;
        }
        .open-button i {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: grid;
          place-content: center;
          background: var(--gold);
          color: var(--ink);
          font-style: normal;
          font-size: 1.1rem;
        }
        .sound-note {
          font-size: .65rem;
          opacity: .55;
          letter-spacing: .12em;
          margin-top: 12px;
        }

        /* 2. ഫുൾ-സ്ക്രീൻ ഹീറോ */
        .hero {
          height: 100svh;
          min-height: 580px;
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
          filter: grayscale(85%) contrast(1.04);
        }
        .hero-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(14, 5, 8, .2), rgba(14, 5, 8, .15) 40%, rgba(14, 5, 8, .92) 100%);
        }
        .hero-copy {
          position: relative;
          text-align: center;
          padding: 0 22px 10vh;
        }
        .hero-copy h1 {
          font: 500 clamp(2.6rem, 5.5vw, 4.4rem)/1.1 var(--serif);
          margin: 14px 0 20px;
          text-shadow: 0 2px 15px rgba(0, 0, 0, .5);
        }
        .hero-copy h1 span {
          font-size: .65em;
          font-style: italic;
          color: var(--gold);
        }
        .hero-date {
          font-size: .74rem;
          text-transform: uppercase;
          letter-spacing: .25em;
        }

        /* ഒഫീഷ്യൽ കാർഡ് ബട്ടൺ (വൃത്തിയുള്ള ഗോൾഡൻ സ്റ്റൈൽ) */
        .official-card-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          padding: 10px 24px;
          border-radius: 99px;
          background: rgba(34, 7, 12, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(199, 163, 106, 0.7);
          color: var(--gold-bright);
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s;
        }
        .official-card-btn:hover {
          background: rgba(72, 14, 23, 0.9);
          border-color: var(--gold);
        }

        /* 3. വിഷ്വൽ സ്റ്റോറി ഫ്രെയിം */
        .visual-story { background: #0f0507; }
        .story-frame {
          position: relative;
          height: 90svh;
          min-height: 520px;
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
          background: linear-gradient(180deg, rgba(12, 7, 8, .08) 0%, rgba(12, 7, 8, .04) 40%, rgba(15, 5, 8, .85) 100%);
        }
        .story-frame figcaption {
          position: relative;
          z-index: 2;
          padding: 0 max(25px, 8vw) clamp(60px, 8vh, 100px);
          max-width: 850px;
          text-shadow: 0 3px 20px rgba(0, 0, 0, .6);
        }
        .story-frame figcaption span {
          display: block;
          color: var(--gold);
          font: 500 .66rem/1.5 var(--sans);
          letter-spacing: .3em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .story-frame figcaption strong {
          display: block;
          color: #fff8ed;
          font: 400 clamp(1.8rem, 4.2vw, 3.2rem)/1.2 var(--serif);
        }

        /* സെക്ഷനുകൾ & ആൾട്ടർനേറ്റിംഗ് തീമുകൾ */
        .section {
          padding: clamp(60px, 8vw, 100px) max(24px, 8vw);
          position: relative;
        }

        /* ക്രീം / ഐവറി സെക്ഷൻ */
        .cream-section {
          background: var(--ivory);
          color: var(--wine);
          text-align: center;
        }
        .cream-section blockquote {
          font: 400 clamp(1.6rem, 3.5vw, 2.6rem)/1.3 var(--serif);
          margin: 20px auto 16px;
          max-width: 850px;
          color: var(--wine);
        }
        .verse {
          color: var(--gold);
          text-transform: uppercase;
          letter-spacing: .25em;
          font-size: .68rem;
          font-weight: 500;
        }
        .gold-rule {
          width: min(240px, 50vw);
          margin: 30px auto;
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
          font: 400 clamp(1.1rem, 2vw, 1.45rem)/1.5 var(--serif);
          max-width: 620px;
          margin: auto;
          color: #4b3d3c;
        }

        /* ഡാർക്ക് സെക്ഷൻ */
        .dark-section {
          background: linear-gradient(145deg, #22070c, #120407);
          text-align: center;
        }

        /* ബ്രൈഡ് & ഗ്രൂം സ്മോൾ പ്രൊഫൈൽ കാർഡുകൾ */
        .couple-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          max-width: 850px;
          margin: 0 auto;
        }
        .person-card {
          padding: 30px 24px;
          border-radius: 20px;
          background: rgba(34, 7, 12, 0.65);
          border: 1px solid rgba(199, 163, 106, 0.25);
          text-align: center;
        }
        .person-img-wrap {
          width: 96px;
          height: 96px;
          margin: 0 auto 16px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--gold);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        .person-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .person-avatar {
          width: 96px;
          height: 96px;
          margin: 0 auto 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(199, 163, 106, 0.15);
          border: 2px solid var(--gold);
          color: var(--gold-bright);
          font: 500 2rem var(--serif);
        }

        /* സ്പെഷ്യൽ കപ്പിൾ പോർട്രെയ്റ്റ് സെക്ഷൻ */
        .couple-banner-section {
          background: #17070b;
          padding: 60px max(24px, 8vw);
          text-align: center;
        }
        .couple-banner-frame {
          max-width: 780px;
          margin: 0 auto;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(199, 163, 106, 0.35);
          position: relative;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .couple-banner-frame img {
          width: 100%;
          max-height: 480px;
          object-fit: cover;
          display: block;
        }

        /* ടുഗെദർ വിത്ത് ഫാമിലീസ് */
        .family-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 4vw;
          align-items: center;
          max-width: 920px;
          margin: 40px auto 0;
        }
        .family-amp {
          width: 76px;
          height: 76px;
          border: 1px solid rgba(199, 163, 106, .4);
          border-radius: 50%;
          display: grid;
          place-content: center;
          font: 500 1.5rem var(--serif);
          color: var(--gold);
          margin: auto;
        }

        /* തീയതി & കൗണ്ട്ഡൗൺ */
        .date-card {
          max-width: 820px;
          margin: auto;
          border: 1px solid rgba(72, 14, 23, .2);
          padding: clamp(35px, 6vw, 60px) 18px;
          background: var(--paper);
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(53, 23, 20, .08);
        }
        .date-lockup {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(14px, 3vw, 36px);
          margin: 16px 0;
        }
        .date-lockup strong {
          font: 500 clamp(3.6rem, 8vw, 6rem)/.9 var(--serif);
          color: var(--wine);
        }
        .date-lockup span {
          font: 500 .75rem var(--sans);
          letter-spacing: .3em;
          writing-mode: vertical-rl;
          color: #6a4047;
        }
        .countdown {
          margin: 35px auto 25px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          max-width: 520px;
        }
        .countdown div { border-right: 1px solid rgba(72, 14, 23, .18); }
        .countdown div:last-child { border: 0; }
        .countdown strong {
          display: block;
          font: 500 clamp(1.5rem, 3vw, 2.3rem) var(--serif);
          color: var(--wine);
        }
        .countdown span {
          font-size: .58rem;
          text-transform: uppercase;
          letter-spacing: .2em;
          color: #7a5057;
        }
        .outline-button {
          border: 1px solid var(--wine);
          background: transparent;
          color: var(--wine);
          padding: 12px 24px;
          border-radius: 99px;
          text-transform: uppercase;
          letter-spacing: .18em;
          font: 500 .62rem var(--sans);
          cursor: pointer;
        }

        /* വേദി & ക്യുആർ കോഡ് */
        .venue {
          display: grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 6vw;
          align-items: center;
          text-align: left;
        }
        .venue-copy h2 {
          font: 500 clamp(2.2rem, 4.5vw, 3.8rem)/1.1 var(--serif);
          margin: 16px 0 20px;
          color: var(--ivory);
        }
        .venue-actions {
          margin-top: 30px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }
        .gold-button {
          background: var(--gold);
          color: var(--ink);
          padding: 13px 22px;
          border-radius: 99px;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: .16em;
          font-size: .62rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .whatsapp-btn {
          background: #25D366;
          color: #fff;
          padding: 13px 22px;
          border-radius: 99px;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: .16em;
          font-size: .62rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .qr-card {
          background: var(--ivory);
          padding: 20px;
          max-width: 280px;
          justify-self: end;
          color: var(--wine);
          text-align: center;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        }
        .qr-card img { display: block; width: 100%; height: auto; }
        .qr-card span {
          display: block;
          margin-top: 12px;
          text-transform: uppercase;
          letter-spacing: .22em;
          font-size: .6rem;
          font-weight: 500;
        }

        /* 6+ ഫോട്ടോ മാഗസിൻ ഗാലറി ഗ്രിഡ് */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          max-width: 950px;
          margin: 30px auto 0;
        }
        .gallery-item {
          aspect-ratio: 4 / 5;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(199, 163, 106, 0.2);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        }
        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* വൃത്തിയുള്ള പ്രീമിയം RSVP & ഗസ്റ്റ്ബുക്ക് കാർഡുകൾ */
        .form-card {
          max-width: 520px;
          margin: 0 auto;
          background: rgba(34, 7, 12, 0.7);
          border: 1px solid rgba(199, 163, 106, 0.3);
          border-radius: 20px;
          padding: 35px 28px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }
        .form-input {
          width: 100%;
          background: rgba(14, 5, 8, 0.8);
          border: 1px solid rgba(199, 163, 106, 0.25);
          color: var(--ivory);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 0.82rem;
          outline: none;
        }
        .form-input:focus {
          border-color: var(--gold);
        }

        /* ക്ലോസിംഗ് */
        .closing {
          text-align: center;
          background: radial-gradient(circle at 50% 45%, #4e121e, #1a0509 50%, #0c0305);
          min-height: 70svh;
          display: grid;
          place-content: center;
        }
        .closing h2 {
          font: 400 clamp(2.2rem, 5vw, 3.8rem)/1.15 var(--serif);
          margin: 20px 0 28px;
        }
        .closing-monogram { margin-top: 36px; }
        .closing-date {
          font-size: .64rem;
          letter-spacing: .3em;
          color: var(--gold);
        }

        /* മ്യൂസിക് കൺട്രോളർ */
        .music-control {
          position: fixed;
          z-index: 120;
          right: 18px;
          bottom: 18px;
          border: 1px solid rgba(199, 163, 106, .5);
          border-radius: 99px;
          background: rgba(20, 7, 10, .85);
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
          animation: musicAnim .7s ease-in-out infinite alternate !important;
        }
        .bars i:nth-child(1) { height: 7px; }
        .bars i:nth-child(2) { height: 13px; animation-delay: .2s; }
        .bars i:nth-child(3) { height: 9px; animation-delay: .4s; }
        .music-control.paused .bars i {
          animation-play-state: paused !important;
          height: 3px;
        }
        @keyframes musicAnim { to { height: 3px; } }

        @media(max-width: 720px) {
          .couple-grid { grid-template-columns: 1fr; }
          .family-grid { grid-template-columns: 1fr; }
          .venue { grid-template-columns: 1fr; text-align: center; }
          .venue-actions { justify-content: center; }
          .qr-card { justify-self: center; margin-top: 25px; }
          .gallery-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
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
            <div>
              <button
                type="button"
                onClick={() => setShowCardModal(true)}
                className="official-card-btn"
              >
                <FileText className="w-3.5 h-3.5" /> View Official Card
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. VISUAL STORY CHAPTER 1 & 2 */}
      <section className="visual-story">
        {gallery.slice(0, 2).map((imgUrl, i) => (
          <figure key={i} className="story-frame">
            <img src={imgUrl} alt={`Story Chapter ${i+1}`} />
            <div className="story-grade"></div>
            <figcaption>
              <span>{i === 0 ? "Chapter one" : "Chapter two"}</span>
              <strong>{i === 0 ? "A beautiful beginning" : "Where every horizon feels like home"}</strong>
            </figcaption>
          </figure>
        ))}
      </section>

      {/* 4. WELCOME & SCRIPTURE / PROMISE (CREAM SECTION 1) */}
      <section className="section cream-section">
        <p className="verse">A promise, a prayer, a forever</p>
        <blockquote>“{invitation?.first_met_story || "This is the Lord’s doing; it is marvellous in our eyes."}”</blockquote>
        <p className="verse">Psalm 118:23</p>
        <div className="gold-rule"><span>✦</span></div>
        <p className="intro">{invitation?.journey_story || "With hearts full of gratitude, we invite you to witness the beginning of our forever."}</p>
      </section>

      {/* 5. BRIDE & GROOM PROFILES (DARK SECTION) */}
      <section className="section dark-section">
        <p className="eyebrow">The Couple</p>
        <div className="couple-grid mt-8">
          {/* Bride Card */}
          <div className="person-card">
            {invitation?.bride_photo ? (
              <div className="person-img-wrap">
                <img src={invitation.bride_photo} alt={invitation.bride_name} />
              </div>
            ) : (
              <div className="person-avatar">{brideInitial}</div>
            )}
            <span className="text-[10px] uppercase font-serif tracking-[0.22em] text-[#c7a36a]">The Bride</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-rose-200 mt-1">{invitation?.bride_name}</h3>
            {invitation?.bride_profession && (
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mt-1">{invitation.bride_profession}</p>
            )}
            {invitation?.bride_parents && (
              <p className="text-xs text-stone-400 mt-2"><strong className="text-stone-300">Daughter of:</strong> {invitation.bride_parents}</p>
            )}
            {invitation?.bride_bio && (
              <p className="text-xs italic font-serif text-stone-300 mt-2 leading-relaxed">"{invitation.bride_bio}"</p>
            )}
            {invitation?.bride_family && (
              <p className="text-xs text-stone-400 pt-3 mt-3 border-t border-stone-800/80"><strong className="text-stone-300">Family:</strong> {invitation.bride_family}</p>
            )}
          </div>

          {/* Groom Card */}
          <div className="person-card">
            {invitation?.groom_photo ? (
              <div className="person-img-wrap">
                <img src={invitation.groom_photo} alt={invitation.groom_name} />
              </div>
            ) : (
              <div className="person-avatar">{groomInitial}</div>
            )}
            <span className="text-[10px] uppercase font-serif tracking-[0.22em] text-[#c7a36a]">The Groom</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-200 mt-1">{invitation?.groom_name}</h3>
            {invitation?.groom_profession && (
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mt-1">{invitation.groom_profession}</p>
            )}
            {invitation?.groom_parents && (
              <p className="text-xs text-stone-400 mt-2"><strong className="text-stone-300">Son of:</strong> {invitation.groom_parents}</p>
            )}
            {invitation?.groom_bio && (
              <p className="text-xs italic font-serif text-stone-300 mt-2 leading-relaxed">"{invitation.groom_bio}"</p>
            )}
            {invitation?.groom_family && (
              <p className="text-xs text-stone-400 pt-3 mt-3 border-t border-stone-800/80"><strong className="text-stone-300">Family:</strong> {invitation.groom_family}</p>
            )}
          </div>
        </div>
      </section>

      {/* 6. സ്പെഷ്യൽ കപ്പിൾ പോർട്രെയ്റ്റ് ബാനർ */}
      <section className="couple-banner-section">
        <p className="eyebrow mb-4">Together in Grace</p>
        <div className="couple-banner-frame">
          <img 
            src={gallery[2] || invitation?.cover_photo} 
            alt="Joel & Merin Together" 
          />
        </div>
      </section>

      {/* 7. TOGETHER WITH FAMILIES (CREAM SECTION 2) */}
      <section className="section cream-section">
        <p className="verse">Blessings of Elders</p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#480e17] mt-2 mb-6">Together With Their Families</h2>
        <div className="family-grid">
          <div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#c7a36a] font-bold">Parents of the Groom</span>
            <h3 className="text-xl sm:text-2xl font-serif text-[#480e17] mt-2 mb-1">{invitation?.groom_parents || `${invitation?.groom_name}'s Parents`}</h3>
            <p className="text-xs text-stone-600">{invitation?.groom_family || "Family of the groom"}</p>
          </div>
          <div className="family-amp">{brideInitial}<span>&</span>{groomInitial}</div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#c7a36a] font-bold">Parents of the Bride</span>
            <h3 className="text-xl sm:text-2xl font-serif text-[#480e17] mt-2 mb-1">{invitation?.bride_parents || `${invitation?.bride_name}'s Parents`}</h3>
            <p className="text-xs text-stone-600">{invitation?.bride_family || "Family of the bride"}</p>
          </div>
        </div>
      </section>

      {/* 8. SAVE THE DATE & COUNTDOWN */}
      <section className="section" style={{ background: "var(--paper)", color: "var(--ink)", textAlign: "center" }}>
        <div className="date-card">
          <p className="eyebrow" style={{ color: "var(--wine)" }}>Save the date</p>
          <div className="date-lockup">
            <span>{monthAbbr}</span>
            <strong>{dayOfMonth}</strong>
            <span>{yearNumber}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-stone-900 mt-2 mb-1">{dateFormatted} at {muhurthamTime}</h2>
          <p className="text-xs uppercase tracking-widest text-stone-600 mb-4">Ceremony & Reception to follow</p>
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

      {/* 9. വേദി, ലൊക്കേഷൻ & WHATSAPP */}
      <section className="section dark-section">
        <div className="max-w-4xl mx-auto venue">
          <div>
            <p className="eyebrow">The Celebration</p>
            <h2 className="venue-copy">{invitation?.venue_name}</h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">{invitation?.venue_address}</p>
            <p className="text-xs uppercase tracking-widest text-[#c7a36a] mt-3">Ceremony · {muhurthamTime} | Reception to follow</p>
            
            <div className="venue-actions">
              {invitation?.map_url && (
                <a className="gold-button" href={invitation.map_url} target="_blank" rel="noopener">
                  <MapPin className="w-3.5 h-3.5" /> Get directions <span>↗</span>
                </a>
              )}
              {invitation?.whatsapp_number && (
                <a 
                  className="whatsapp-btn"
                  href={`https://wa.me/${invitation.whatsapp_number.replace(/[^0-9]/g, "")}?text=Congratulations%20${encodeURIComponent(invitation.bride_name || "")}%20and%20${encodeURIComponent(invitation.groom_name || "")}!`} 
                  target="_blank" 
                  rel="noopener"
                >
                  <MessageCircle className="w-4 h-4" /> Send WhatsApp Wishes
                </a>
              )}
            </div>
          </div>
          <div className="qr-card">
            <img src={qrDataUrl} alt="QR code for directions" />
            <span>Scan for directions</span>
          </div>
        </div>
      </section>

      {/* 10. 6+ ഫോട്ടോ മാഗസിൻ ഗാലറി (Captured Memories) */}
      <section className="section cream-section">
        <p className="verse">Photo Gallery</p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#480e17] mt-1 mb-2">Captured Memories</h2>
        <div className="gallery-grid">
          {gallery.slice(0, 6).map((imgUrl, i) => (
            <div key={i} className="gallery-item">
              <img src={imgUrl} alt={`Memory ${i+1}`} />
            </div>
          ))}
        </div>
      </section>

      {/* 11. കസ്റ്റം സെക്ഷനുകൾ (ഉണ്ടെങ്കിൽ) */}
      {customSecs.length > 0 && (
        <section className="section dark-section">
          <div className="max-w-3xl mx-auto space-y-4">
            {customSecs.map((sec, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#22070c] border border-[#c7a36a]/25 text-center space-y-2">
                <h3 className="text-xl font-serif text-[#c7a36a]">{sec.title}</h3>
                <p className="text-xs sm:text-sm text-stone-300 font-serif leading-relaxed whitespace-pre-line">{sec.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 12. ഇന്ററാക്ടീവ് RSVP & ഗസ്റ്റ് ആശംസാ മതിൽ (വൃത്തിയുള്ള പ്രീമിയം ഡിസൈൻ) */}
      <section className="section dark-section border-t border-stone-800/80">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* RSVP Card */}
          <div className="form-card text-center">
            <p className="eyebrow">Join With Us</p>
            <h3 className="text-2xl font-serif text-rose-200 mt-1 mb-4">RSVP Confirmation</h3>
            {rsvpSubmitted ? (
              <p className="text-emerald-400 font-serif text-sm py-8">Thank you! Your RSVP has been confirmed. ❤️</p>
            ) : (
              <form onSubmit={localRsvpSubmit} className="space-y-3 text-left">
                <div>
                  <label className="text-[11px] text-stone-400 font-serif uppercase tracking-wider">Your Full Name</label>
                  <input required value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="Guest name..." className="form-input mt-1" />
                </div>
                <div>
                  <label className="text-[11px] text-stone-400 font-serif uppercase tracking-wider">Number of Guests</label>
                  <input required type="number" min="1" max="10" value={rsvpGuests} onChange={(e) => setRsvpGuests(e.target.value)} className="form-input mt-1" />
                </div>
                <button type="submit" className="w-full py-3 mt-2 bg-[#c7a36a] text-stone-950 font-bold rounded-xl text-xs uppercase tracking-widest hover:brightness-110 cursor-pointer">
                  Confirm Attendance
                </button>
              </form>
            )}
          </div>

          {/* Wishes Card */}
          <div className="form-card text-center">
            <p className="eyebrow">Warm Wishes</p>
            <h3 className="text-2xl font-serif text-rose-200 mt-1 mb-4">Leave Your Blessings</h3>
            <form onSubmit={localWishSubmit} className="space-y-3 text-left">
              <input required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name..." className="form-input" />
              <textarea required rows={2} value={guestMessage} onChange={(e) => setGuestMessage(e.target.value)} placeholder="Write your heartfelt blessing..." className="form-input" />
              <button type="submit" disabled={wishLoading} className="w-full py-3 bg-[#480e17] text-[#faf5ed] font-serif text-xs uppercase tracking-widest border border-[#c7a36a]/50 rounded-xl hover:bg-[#601320] cursor-pointer">
                {wishLoading ? "Posting..." : "Post Wedding Wish"}
              </button>
            </form>

            {wishes.length > 0 && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1 text-left">
                {wishes.map((w, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/40 border border-stone-800/80">
                    <span className="text-xs font-bold text-[#c7a36a]">{w.guest_name}</span>
                    <p className="text-xs text-stone-300 mt-0.5 leading-relaxed font-serif">{w.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 13. CLOSING */}
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
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-xl w-full bg-[#1e070c] border border-[#c7a36a]/60 rounded-2xl p-4 shadow-2xl text-center">
            <button 
              onClick={() => setShowCardModal(false)} 
              className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-stone-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xs font-serif font-bold text-[#c7a36a] uppercase tracking-widest mb-3">Official Wedding Invitation Card</h3>
            <img 
              src={invitation.wedding_card_photo} 
              alt="Official Card" 
              className="max-h-[78vh] w-full object-contain rounded-xl mx-auto shadow-inner" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
