"use client";
import React, { useEffect, useState, useRef } from "react";
import { 
  Heart, Calendar, MapPin, Send, FileText, X, Phone, Mail
} from "lucide-react";

export default function TemplateOne({ data, isPreview = false, onRsvpSubmit, onWishSubmit, wishes = [] }) {
  const [gateOpened, setGateOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpSent, setRsvpSent] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");

  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
  const audioRef = useRef(null);

  // മോണോഗ്രാം അക്ഷരങ്ങൾ (ഉദാ: Joel & Merin -> J & M)
  const brideInitial = (data?.bride_name || "B")[0]?.toUpperCase();
  const groomInitial = (data?.groom_name || "G")[0]?.toUpperCase();

  // ഓഡിയോ സെറ്റപ്പ്
  useEffect(() => {
    if (data?.music_url) {
      const audio = new Audio(data.music_url);
      audio.loop = true;
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [data?.music_url]);

  // കൗണ്ട്ഡൗൺ ടൈമർ
  useEffect(() => {
    if (!data?.wedding_date) return;
    const target = new Date(data.wedding_date).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

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
  }, [data?.wedding_date]);

  // പൂവിതളുകൾ വീഴുന്ന ഇഫക്റ്റ് (Falling Petals)
  useEffect(() => {
    if (!gateOpened) return;
    const interval = setInterval(() => {
      const container = document.getElementById("template1-petals");
      if (!container) return;
      const petal = document.createElement("div");
      petal.className = "t1-petal";
      petal.style.left = Math.random() * 100 + "vw";
      petal.style.animationDuration = 7 + Math.random() * 6 + "s";
      petal.style.animationDelay = Math.random() * 1.5 + "s";
      container.appendChild(petal);
      setTimeout(() => petal.remove(), 14000);
    }, 900);

    return () => clearInterval(interval);
  }, [gateOpened]);

  // ഗേറ്റ് ഓപ്പൺ ചെയ്ത് മ്യൂസിക് പ്ലേ ചെയ്യുക
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

  // കലണ്ടറിലേക്ക് ആഡ് ചെയ്യാനുള്ള .ics ഫയൽ ജനറേഷൻ
  const handleAddToCalendar = () => {
    const weddingDate = new Date(data?.wedding_date || Date.now());
    const year = weddingDate.getUTCFullYear();
    const month = String(weddingDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(weddingDate.getUTCDate()).padStart(2, "0");
    const formatted = `${year}${month}${day}T050000Z`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      `PRODID:-//${data?.bride_name} and ${data?.groom_name}//Wedding//EN`,
      "BEGIN:VEVENT",
      `SUMMARY:Wedding of ${data?.bride_name} & ${data?.groom_name}`,
      `DESCRIPTION:Join us to celebrate our wedding at ${data?.venue_name}.`,
      `LOCATION:${data?.venue_name}, ${data?.venue_address || ""}`,
      `DTSTART:${formatted}`,
      `DTEND:${formatted}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${data?.bride_name}-${data?.groom_name}-wedding.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dateObj = data?.wedding_date ? new Date(data.wedding_date) : new Date();
  const dateFormatted = dateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const dayOfMonth = dateObj.getDate();
  const monthAbbr = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const yearNumber = dateObj.getFullYear();
  const muhurthamTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const gallery = Array.isArray(data?.gallery_photos) && data.gallery_photos.length > 0
    ? data.gallery_photos
    : [
        data?.cover_photo || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
      ];

  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=18&data=${encodeURIComponent(data?.map_url || window?.location?.href || "https://maps.google.com")}`;

  return (
    <div className="template1-root">
      {/* Google Web Fonts & CSS Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .template1-root {
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
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .template1-root * { box-sizing: border-box; }

        /* ബാക്ക്ഗ്രൗണ്ട് ഗ്രെയിൻ */
        .t1-grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 99;
          opacity: .065;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
        }

        /* വീഴുന്ന പൂവിതളുകൾ */
        .t1-petals {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 70;
          overflow: hidden;
        }
        .t1-petal {
          position: absolute;
          top: -8vh;
          width: 10px;
          height: 16px;
          border-radius: 80% 20% 70% 30%;
          background: linear-gradient(135deg, #8d2740, #3d0915);
          opacity: .5;
          animation: t1PetalFall linear forwards;
        }
        @keyframes t1PetalFall {
          0% { transform: translate3d(0, -10vh, 0) rotate(0); }
          45% { transform: translate3d(45px, 48vh, 0) rotate(210deg); }
          100% { transform: translate3d(-25px, 110vh, 0) rotate(520deg); opacity: 0; }
        }

        /* കർട്ടൻ ഗേറ്റ് */
        .t1-gate {
          position: fixed;
          z-index: 120;
          inset: 0;
          display: grid;
          place-content: center;
          text-align: center;
          padding: 24px;
          background: radial-gradient(circle at 50% 38%, #692131 0, #320c14 36%, #11070a 78%);
          transition: opacity 1.1s ease, visibility 1.1s ease;
        }
        .t1-gate.opened {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .t1-gate::before, .t1-gate::after {
          content: "";
          position: absolute;
          inset: 22px;
          border: 1px solid rgba(199, 163, 106, .42);
          pointer-events: none;
        }
        .t1-gate::after {
          inset: 30px;
          border-color: rgba(199, 163, 106, .12);
        }
        .t1-gate-glow {
          position: absolute;
          width: 440px;
          height: 440px;
          left: 50%;
          top: 48%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: rgba(171, 96, 77, .15);
          filter: blur(55px);
        }
        .t1-monogram {
          font: 500 clamp(3rem, 11vw, 6rem)/1 var(--serif);
          letter-spacing: .12em;
          color: var(--gold);
        }
        .t1-monogram span {
          font-style: italic;
          font-weight: 400;
          font-size: .7em;
        }
        .t1-eyebrow {
          text-transform: uppercase;
          letter-spacing: .32em;
          font-size: .68rem;
          color: var(--gold);
          font-weight: 500;
        }
        .t1-gate h1 {
          font: 400 clamp(3rem, 10vw, 6.5rem)/.85 var(--serif);
          letter-spacing: -.03em;
          margin: 28px 0 20px;
        }
        .t1-gate h1 em {
          font-weight: 400;
          color: var(--gold);
        }
        .t1-open-button {
          width: min(310px, 82vw);
          margin: 28px auto 0;
          padding: 7px 7px 7px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(199, 163, 106, .65);
          border-radius: 99px;
          background: rgba(255, 255, 255, .03);
          color: var(--ivory);
          font: 500 .7rem var(--sans);
          text-transform: uppercase;
          letter-spacing: .19em;
          cursor: pointer;
          transition: all .3s;
        }
        .t1-open-button i {
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
        .t1-open-button:hover i {
          transform: rotate(-35deg);
        }

        /* ഹീറോ സെക്ഷൻ */
        .t1-hero {
          height: 100svh;
          min-height: 620px;
          position: relative;
          display: grid;
          align-items: end;
          overflow: hidden;
        }
        .t1-hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: grayscale(1) contrast(1.06);
        }
        .t1-hero-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(9, 5, 7, .15), rgba(9, 5, 7, .1) 36%, rgba(15, 6, 9, .92) 100%);
        }
        .t1-hero-copy {
          position: relative;
          text-align: center;
          padding: 0 22px 12vh;
          z-index: 2;
        }
        .t1-hero-copy h1 {
          font: 500 clamp(3.8rem, 13vw, 9rem)/.75 var(--serif);
          letter-spacing: -.04em;
          margin: 20px 0 28px;
          text-shadow: 0 2px 18px rgba(0, 0, 0, .45);
        }
        .t1-hero-copy h1 span {
          font-size: .55em;
          font-style: italic;
          color: var(--gold);
        }

        /* വെൽക്കം & ഫാമിലീസ് സെക്ഷൻ */
        .t1-section {
          padding: clamp(80px, 12vw, 150px) max(24px, 8vw);
          position: relative;
        }
        .t1-welcome {
          text-align: center;
          color: var(--ink);
          background: var(--ivory);
        }
        .t1-welcome blockquote {
          font: 400 clamp(2.2rem, 6vw, 4.8rem)/.98 var(--serif);
          margin: 24px auto 20px;
          max-width: 950px;
        }
        .t1-verse {
          color: var(--wine);
          text-transform: uppercase;
          letter-spacing: .25em;
          font-size: .7rem;
        }
        .t1-gold-rule {
          width: min(260px, 55vw);
          margin: 40px auto;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--gold);
        }
        .t1-gold-rule::before, .t1-gold-rule::after {
          content: "";
          height: 1px;
          flex: 1;
          background: var(--gold);
        }

        .t1-dark-section {
          background: linear-gradient(145deg, #22090e, #0e0809);
          text-align: center;
        }
        .t1-family-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 4vw;
          align-items: center;
          max-width: 1050px;
          margin: 50px auto 0;
        }
        .t1-family-amp {
          width: 96px;
          height: 96px;
          border: 1px solid rgba(199, 163, 106, .4);
          border-radius: 50%;
          display: grid;
          place-content: center;
          font: 500 1.9rem var(--serif);
          color: var(--gold);
          margin: auto;
        }

        /* തീയതി & കൗണ്ട്ഡൗൺ */
        .t1-date-section {
          background: var(--paper);
          color: var(--ink);
          text-align: center;
        }
        .t1-date-card {
          max-width: 920px;
          margin: auto;
          border: 1px solid rgba(84, 16, 26, .25);
          padding: clamp(40px, 7vw, 80px) 18px;
          box-shadow: 0 30px 80px rgba(53, 23, 20, .1);
        }
        .t1-date-lockup {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(16px, 4vw, 50px);
          margin: 20px 0;
        }
        .t1-date-lockup strong {
          font: 500 clamp(6rem, 18vw, 11rem)/.8 var(--serif);
          color: var(--wine);
        }
        .t1-date-lockup span {
          font: 500 .75rem var(--sans);
          letter-spacing: .3em;
          writing-mode: vertical-rl;
        }
        .t1-countdown {
          margin: 45px auto 35px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          max-width: 600px;
        }
        .t1-countdown div {
          border-right: 1px solid rgba(84, 16, 26, .18);
        }
        .t1-countdown div:last-child {
          border: 0;
        }
        .t1-countdown strong {
          display: block;
          font: 500 clamp(1.8rem, 4.5vw, 3.2rem) var(--serif);
          color: var(--wine);
        }
        .t1-countdown span {
          font-size: .58rem;
          text-transform: uppercase;
          letter-spacing: .2em;
        }

        /* വേദി & ക്യുആർ കോഡ് */
        .t1-venue {
          display: grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 8vw;
          align-items: center;
          text-align: left;
        }
        .t1-qr-card {
          background: var(--ivory);
          padding: 22px;
          max-width: 340px;
          justify-self: end;
          color: var(--wine);
          text-align: center;
          border-radius: 12px;
        }
        .t1-qr-card img {
          display: block;
          width: 100%;
          height: auto;
        }

        /* മ്യൂസിക് ബാറുകൾ (Animated Equalizer) */
        .t1-music-control {
          position: fixed;
          z-index: 110;
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
        .t1-bars {
          display: flex;
          align-items: center;
          gap: 2.5px;
          height: 14px;
        }
        .t1-bars i {
          display: block;
          width: 2.5px;
          background: var(--gold);
          animation: t1MusicAnim .7s ease-in-out infinite alternate;
        }
        .t1-bars i:nth-child(1) { height: 7px; }
        .t1-bars i:nth-child(2) { height: 13px; animation-delay: .2s; }
        .t1-bars i:nth-child(3) { height: 9px; animation-delay: .4s; }
        .t1-music-control.paused .t1-bars i {
          animation-play-state: paused;
          height: 3px;
        }
        @keyframes t1MusicAnim {
          to { height: 3px; }
        }

        @media(max-width: 768px) {
          .t1-family-grid { grid-template-columns: 1fr; }
          .t1-venue { grid-template-columns: 1fr; text-align: center; }
          .t1-qr-card { justify-self: center; width: min(290px, 90vw); margin-top: 30px; }
          .t1-gate::before { inset: 12px; }
          .t1-gate::after { inset: 18px; }
        }
      `}</style>

      {/* ഗ്രെയിൻ & പെറ്റൽ ലെയറുകൾ */}
      <div className="t1-grain" aria-hidden="true"></div>
      <div className="t1-petals" id="template1-petals" aria-hidden="true"></div>

      {/* 1. റോയൽ ഗേറ്റ് കർട്ടൻ (Gate Curtain) */}
      <section className={`t1-gate ${gateOpened ? "opened" : ""}`}>
        <div className="t1-gate-glow"></div>
        <div className="t1-monogram">{brideInitial} <span>&</span> {groomInitial}</div>
        <p className="t1-eyebrow mt-3">{data?.parents_text || "Together with their families"}</p>
        <h1>You’re invited<br /><em>to celebrate love</em></h1>
        <p className="tracking-[0.35em] text-xs font-serif text-amber-200/80 my-3">
          {dayOfMonth} · {monthAbbr} · {yearNumber}
        </p>
        <button className="t1-open-button" type="button" onClick={handleOpenGate}>
          <span>Open invitation</span>
          <i aria-hidden="true">→</i>
        </button>
        <p className="text-[10px] text-stone-400 tracking-widest mt-4">Tap to enter with music</p>
      </section>

      {/* 2. മെയിൻ ഹീറോ സെക്ഷൻ */}
      <section className="t1-hero">
        <img 
          className="t1-hero-image" 
          src={data?.cover_photo || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80"} 
          alt="Wedding Portrait" 
        />
        <div className="t1-hero-shade"></div>
        <div className="t1-hero-copy">
          <p className="t1-eyebrow">The wedding of</p>
          <h1 className="font-serif font-bold text-white">
            {data?.bride_name} <span>&</span> {data?.groom_name}
          </h1>
          <p className="text-xs uppercase tracking-[0.28em] text-stone-300 font-serif">{dateFormatted}</p>

          {data?.wedding_card_photo && (
            <div className="pt-6">
              <button
                onClick={() => setShowCardModal(true)}
                className="px-6 py-2.5 rounded-full bg-amber-600/80 hover:bg-amber-500 text-stone-950 font-serif font-semibold text-xs uppercase tracking-widest border border-amber-300/40 shadow-xl transition"
              >
                <FileText className="w-3.5 h-3.5 inline mr-2" /> View Official Card
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. സിനിമാറ്റിക് വിഷ്വൽ സ്റ്റോറി (Cinematic Story Frames) */}
      <section className="bg-[#10080a] py-12">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          {gallery.slice(0, 3).map((imgUrl, i) => (
            <div key={i} className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 group">
              <img src={imgUrl} alt={`Story ${i+1}`} className="w-full max-h-[75vh] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-14">
                <span className="text-xs uppercase tracking-[0.3em] text-[#c7a36a] font-semibold">
                  Chapter {i === 0 ? "One" : i === 1 ? "Two" : "Three"}
                </span>
                <h3 className="text-2xl sm:text-4xl font-serif text-amber-50 font-normal mt-2">
                  {i === 0 ? "A Beautiful Beginning" : i === 1 ? "Where Every Horizon Feels Like Home" : "And Forever Becomes a Promise"}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. വെൽക്കം & ബൈബിൾ വേഴ്സ് / പ്രോമിസ് */}
      <section className="t1-section t1-welcome">
        <p className="t1-verse font-semibold">A promise, a prayer, a forever</p>
        <blockquote>
          “{data?.first_met_story || "This is the Lord’s doing; it is marvellous in our eyes."}”
        </blockquote>
        <p className="t1-verse">Psalm 118:23</p>
        <div className="t1-gold-rule"><span>✦</span></div>
        <p className="font-serif text-stone-700 text-lg sm:text-2xl max-w-2xl mx-auto italic leading-relaxed">
          {data?.journey_story || "With hearts full of gratitude, we invite you to witness the beginning of our forever."}
        </p>
      </section>

      {/* 5. മാതാപിതാക്കളുടെ വിവരങ്ങൾ (Together With Families) */}
      <section className="t1-section t1-dark-section">
        <p className="t1-eyebrow">Together with their families</p>
        <div className="t1-family-grid">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#c7a36a] font-semibold">Parents of the groom</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-white my-3 leading-snug">
              {data?.groom_parents || `${data?.groom_name}'s Parents`}
            </h2>
            <p className="text-xs text-stone-400">{data?.groom_family || "Family of the Groom"}</p>
          </div>

          <div className="t1-family-amp">
            {brideInitial}<span>&</span>{groomInitial}
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#c7a36a] font-semibold">Parents of the bride</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-white my-3 leading-snug">
              {data?.bride_parents || `${data?.bride_name}'s Parents`}
            </h2>
            <p className="text-xs text-stone-400">{data?.bride_family || "Family of the Bride"}</p>
          </div>
        </div>
      </section>

      {/* 6. തീയതി & ലൈവ് കൗണ്ട്ഡൗൺ */}
      <section className="t1-section t1-date-section">
        <div className="t1-date-card">
          <p className="text-xs uppercase tracking-[0.3em] text-[#54101a] font-semibold">Save the date</p>
          <div className="t1-date-lockup">
            <span>{monthAbbr}</span>
            <strong>{dayOfMonth}</strong>
            <span>{yearNumber}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-4">
            {dateFormatted} at {muhurthamTime}
          </h2>
          <p className="text-xs uppercase tracking-widest text-stone-600 mt-1">Muhurtham & Reception to follow</p>

          <div className="t1-countdown">
            <div><strong>{timeLeft.days}</strong><span>Days</span></div>
            <div><strong>{timeLeft.hours}</strong><span>Hours</span></div>
            <div><strong>{timeLeft.minutes}</strong><span>Minutes</span></div>
            <div><strong>{timeLeft.seconds}</strong><span>Seconds</span></div>
          </div>

          <button onClick={handleAddToCalendar} className="px-8 py-3.5 border border-[#54101a] text-[#54101a] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#54101a] hover:text-white transition rounded-full mt-4">
            Add to Calendar (.ics)
          </button>
        </div>
      </section>

      {/* 7. വേദി & ഡിറക്ഷൻസ് ക്യുആർ കോഡ് */}
      <section className="t1-section t1-dark-section">
        <div className="max-w-5xl mx-auto t1-venue">
          <div>
            <p className="t1-eyebrow">The Celebration Venue</p>
            <h2 className="text-3xl sm:text-5xl font-serif text-white font-bold my-4">
              {data?.venue_name}
            </h2>
            <p className="text-sm sm:text-lg text-stone-300 font-serif leading-relaxed">
              {data?.venue_address}
            </p>
            <p className="text-xs uppercase tracking-widest text-[#c7a36a] font-serif mt-4">
              Ceremony: {muhurthamTime} | Reception to follow
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              {data?.map_url && (
                <a 
                  href={data.map_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full bg-[#c7a36a] text-stone-950 font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg inline-flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5" /> Get Directions ↗
                </a>
              )}
              {data?.whatsapp_number && (
                <a 
                  href={`https://wa.me/${data.whatsapp_number.replace(/[^0-9]/g, "")}?text=Congratulations%20${encodeURIComponent(data?.bride_name || "")}%20and%20${encodeURIComponent(data?.groom_name || "")}!`}
                  target="_blank" 
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg inline-flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> WhatsApp Wishes
                </a>
              )}
            </div>
          </div>

          <div className="t1-qr-card shadow-2xl">
            <img src={qrDataUrl} alt="Venue Map QR Code" />
            <span className="block mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#54101a]">
              Scan for Directions
            </span>
          </div>
        </div>
      </section>

      {/* 8. കസ്റ്റം സെക്ഷനുകൾ (ഉണ്ടെങ്കിൽ) */}
      {Array.isArray(data?.custom_sections) && data.custom_sections.length > 0 && (
        <section className="bg-[#12080a] py-12 px-4 border-t border-b border-amber-500/20">
          <div className="max-w-4xl mx-auto space-y-6">
            {data.custom_sections.map((sec, i) => (
              <div key={i} className="p-8 rounded-3xl bg-[#1b0d11] border border-amber-500/20 space-y-2 text-center">
                <h3 className="text-xl font-serif text-[#c7a36a] font-bold">{sec.title}</h3>
                <p className="text-xs sm:text-sm text-stone-300 font-serif leading-relaxed whitespace-pre-line">{sec.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. ക്ലോസിംഗ് സെക്ഷൻ (Closing) */}
      <section className="t1-section text-center bg-gradient-to-b from-[#18080c] via-[#2a0c14] to-[#0c0507]">
        <p className="t1-eyebrow">With love and blessings</p>
        <h2 className="text-3xl sm:text-6xl font-serif text-white my-6 leading-tight font-normal">
          We can’t wait<br />to celebrate with you.
        </h2>
        <div className="t1-monogram mt-8">{brideInitial} <span>&</span> {groomInitial}</div>
        <p className="text-xs tracking-[0.3em] text-[#c7a36a] mt-4 font-serif">
          {dayOfMonth} · {monthAbbr} · {yearNumber}
        </p>
      </section>

      {/* ഫ്ലോട്ടിംഗ് ഇക്വലൈസർ മ്യൂസിക് ബട്ടൺ */}
      {data?.music_url && (
        <button 
          onClick={toggleMusic}
          className={`t1-music-control ${!isPlaying ? "paused" : ""}`} 
          type="button" 
          aria-label="Toggle music"
        >
          <span className="t1-bars" aria-hidden="true">
            <i></i><i></i><i></i>
          </span>
          <span>{isPlaying ? "Music on" : "Music paused"}</span>
        </button>
      )}

      {/* ഒഫീഷ്യൽ കാർഡ് ലൈറ്റ്-ബോക്സ് പോപ്പ്അപ്പ് */}
      {showCardModal && data?.wedding_card_photo && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#1b0d11] border border-amber-500/40 rounded-3xl p-4 shadow-2xl">
            <button onClick={() => setShowCardModal(false)} className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-stone-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-serif font-bold text-[#c7a36a] text-center mb-3 tracking-widest uppercase">Official Wedding Card</h3>
            <img src={data.wedding_card_photo} alt="Official Card" className="max-h-[80vh] w-full object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
