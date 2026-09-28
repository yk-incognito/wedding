"use client";
import React, { useEffect, useState, useRef } from "react";
import { 
  FileText, X, MapPin, Send, Phone, Calendar, Heart, 
  MessageCircle, Video, Gift, Copy, Check, Clock, QrCode, ExternalLink 
} from "lucide-react";

export default function TemplateOne({
  invitation,
  onRsvpSubmit,
  onWishSubmit,
  wishes = [],
  wishLoading = false,
  isSampleDemo = false,
  isPreviewMode = false
}) {
  const [gateOpened, setGateOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // RSVP Local State
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Wishes Local State
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");

  // Live Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
  const audioRef = useRef(null);

  // 1. ഓഡിയോ പ്ലെയർ സെറ്റപ്പ്
  useEffect(() => {
    if (invitation?.music_url) {
      const audio = new Audio(invitation.music_url);
      audio.loop = true;
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [invitation?.music_url]);

  // 2. തത്സമയ കൗണ്ട്ഡൗൺ ടൈമർ
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

  // 3. റോയൽ ഗേറ്റ് തുറക്കലും മ്യൂസിക് പ്ലേയും (മൊബൈൽ ടച്ച് ഫിക്സ് സഹിതം)
  const handleOpenGate = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setGateOpened(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // 4. മ്യൂസിക് പ്ലേ / പോസ് കൺട്രോളർ
  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // 5. ആഡ് ടു കലണ്ടർ (.ics കലണ്ടർ ഇൻവിറ്റേഷൻ)
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
      `DESCRIPTION:Wedding celebration at ${invitation?.venue_name || "the venue"}.`,
      `LOCATION:${invitation?.venue_name || ""}, ${invitation?.venue_address || ""}`,
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

  // 6. UPI ഐഡി കോപ്പി ചെയ്യൽ
  const handleCopyUpi = () => {
    if (invitation?.upi_id) {
      navigator.clipboard.writeText(invitation.upi_id);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  // 7. RSVP സബ്മിഷൻ
  const localRsvpSubmit = async (e) => {
    e.preventDefault();
    if (onRsvpSubmit) {
      const res = await onRsvpSubmit(rsvpName, rsvpGuests);
      if (res?.success) setRsvpSubmitted(true);
    }
  };

  // 8. ഗസ്റ്റ് ആശംസ സബ്മിഷൻ
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

  const dateObj = invitation?.wedding_date ? new Date(invitation.wedding_date) : null;
  const dateFormatted = dateObj ? dateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";
  const dayOfMonth = dateObj ? dateObj.getDate() : "";
  const monthAbbr = dateObj ? dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase() : "";
  const yearNumber = dateObj ? dateObj.getFullYear() : "";
  const muhurthamTime = dateObj ? dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

  // ഗാലറി ഇമേജുകൾ
  const defaultGallery = [
    invitation?.cover_photo || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80"
  ];

  const gallery = Array.isArray(invitation?.gallery_photos) && invitation.gallery_photos.length > 0
    ? (invitation.gallery_photos.length < 4 ? [...invitation.gallery_photos, ...defaultGallery.slice(invitation.gallery_photos.length)] : invitation.gallery_photos)
    : defaultGallery;

  const contacts = Array.isArray(invitation?.contact_numbers) ? invitation.contact_numbers.filter(c => c.name || c.phone) : [];
  const customSecs = Array.isArray(invitation?.custom_sections) ? invitation.custom_sections.filter(s => s.title || s.content) : [];

  // Google Maps Dynamic QR Code
  const qrDataUrl = invitation?.map_url 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=18&data=${encodeURIComponent(invitation.map_url)}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=18&data=${encodeURIComponent("https://maps.google.com")}`;

  // UPI പേയ്‌മെന്റ് QR കോഡ്
  const upiQrUrl = invitation?.upi_id
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=16&data=${encodeURIComponent(`upi://pay?pa=${invitation.upi_id}&pn=${encodeURIComponent((invitation.groom_name || "Groom") + " and " + (invitation.bride_name || "Bride"))}&cu=INR`)}`
    : null;

  // YouTube Embed
  const getEmbedYoutubeUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|live\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube-nocookie.com/embed/${match[2]}` : null;
  };
  const youtubeEmbedUrl = getEmbedYoutubeUrl(invitation?.live_stream_url);

  return (
    <div className="netflix-luxury-container">
      <style dangerouslySetInnerHTML={{ __html: `
        .netflix-luxury-container {
          --ink: #14070a;
          --wine: #480e17;
          --wine-dark: #22070c;
          --ivory: #faf5ed;
          --paper: #f4ecdf;
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

        .netflix-luxury-container * { 
          box-sizing: border-box; 
        }

        /* ഫ്ലിക്കറിംഗും ടെക്സ്റ്റ് വിറയലും പൂർണ്ണമായി തടയുന്നു */
        h1, h2, h3, h4, h5, h6, p, span, strong, em, .monogram, .eyebrow, .gate-date, .hero-card-badge-btn, .official-card-btn, button {
          animation: none !important;
          transform: none !important;
          letter-spacing: inherit;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
          will-change: auto;
        }

        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: .05;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
        }

        /* സ്ഥിരമായി താഴേക്ക് വീഴുന്ന ഇലകൾ */
        .falling-leaves-css {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 70;
          overflow: hidden;
        }
        .css-leaf {
          position: absolute;
          top: -30px;
          width: 13px;
          height: 20px;
          background: linear-gradient(135deg, #a8324a, #4a0f1b);
          border-radius: 80% 20% 75% 25%;
          opacity: 0.4;
          animation: staticFall 10s linear infinite !important;
        }
        .css-leaf:nth-child(1) { left: 8vw; animation-delay: 0s; animation-duration: 9.5s; }
        .css-leaf:nth-child(2) { left: 24vw; animation-delay: 3.2s; animation-duration: 11.5s; }
        .css-leaf:nth-child(3) { left: 45vw; animation-delay: 1.5s; animation-duration: 8.8s; }
        .css-leaf:nth-child(4) { left: 68vw; animation-delay: 4.5s; animation-duration: 12.2s; }
        .css-leaf:nth-child(5) { left: 88vw; animation-delay: 2.2s; animation-duration: 10.2s; }
        @keyframes staticFall {
          0% { transform: translateY(-30px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.5; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }

        .gate {
          position: fixed;
          z-index: 150;
          inset: 0;
          display: grid;
          place-content: center;
          text-align: center;
          padding: 24px;
          background: radial-gradient(circle at 50% 38%, #5a1725 0, #27080f 45%, #0f0507 80%);
          transition: opacity 0.8s ease, visibility 0.8s ease;
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
          transform: translate(-50%, -50%);
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

        /* 2. മൊബൈൽ-ഫ്രണ്ട്‌ലി ഓപ്പൺ ഇൻവിറ്റേഷൻ ബട്ടൺ (എവിടെ തൊട്ടാലും പ്രവർത്തിക്കും) */
        .open-button {
          width: min(290px, 80vw);
          margin: 22px auto 0;
          padding: 8px 8px 8px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1.5px solid rgba(199, 163, 106, .7);
          border-radius: 99px;
          background: rgba(255, 255, 255, .08);
          color: var(--ivory);
          font: 600 .72rem var(--sans);
          text-transform: uppercase;
          letter-spacing: .18em;
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
          position: relative;
          z-index: 10;
        }
        .open-button:active {
          transform: scale(0.96) !important;
          background: rgba(255, 255, 255, .15);
        }
        /* ഉള്ളിലെ എഴുത്തിലും സർക്കിളിലും തൊട്ടാലും ബട്ടൺ ക്ലിക്ക് ആവാൻ */
        .open-button * {
          pointer-events: none;
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
          filter: contrast(1.05);
        }
        .hero-shade {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 40%, rgba(14, 5, 8, 0.15) 0%, rgba(14, 5, 8, 0.55) 60%, rgba(14, 5, 8, 0.98) 100%),
                      linear-gradient(180deg, rgba(20, 7, 10, 0.3) 0%, transparent 40%, rgba(14, 5, 8, 0.98) 100%);
        }
        .hero-copy {
          position: relative;
          text-align: center;
          padding: 0 22px 10vh;
        }
        .hero-copy h1 {
          font: 500 clamp(2.6rem, 5.5vw, 4.4rem)/1.1 var(--serif);
          margin: 14px 0 16px;
          color: #fff4e3;
          text-shadow: 0 2px 15px rgba(0, 0, 0, .7);
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

        /* ടോപ്പ് ഒഫീഷ്യൽ കാർഡ് ബട്ടൺ */
        .hero-card-badge-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          padding: 11px 26px;
          border-radius: 99px;
          background: rgba(34, 7, 12, 0.88);
          border: 1.5px solid rgba(199, 163, 106, 0.9);
          color: var(--gold-bright);
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          transition: background 0.3s;
        }
        .hero-card-badge-btn:hover {
          background: rgba(72, 14, 23, 0.95);
          border-color: var(--gold);
        }

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

        .section {
          padding: clamp(60px, 8vw, 100px) max(24px, 8vw);
          position: relative;
        }
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
        .dark-section {
          background: linear-gradient(145deg, #22070c, #120407);
          text-align: center;
        }

        /* The Couple */
        .the-couple-section {
          background: var(--ivory);
          color: var(--wine);
          padding: clamp(70px, 9vw, 120px) max(24px, 8vw);
          text-align: center;
        }
        .the-couple-section .couple-main-title {
          font: 600 clamp(2.8rem, 6vw, 4.5rem)/1.1 var(--serif);
          color: var(--wine);
          margin-bottom: 40px;
        }
        .couple-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
          max-width: 920px;
          margin: 0 auto;
        }
        .person-card {
          padding: 42px 30px;
          border-radius: 26px;
          background: linear-gradient(180deg, #320a12 0%, #1a0509 100%);
          color: var(--ivory);
          border: 1.5px solid rgba(199, 163, 106, 0.45);
          text-align: center;
          box-shadow: 0 25px 60px rgba(50, 10, 18, 0.35);
        }
        .person-img-wrap {
          width: 120px;
          height: 120px;
          margin: 0 auto 18px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--gold);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
        }
        .person-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .person-avatar {
          width: 120px;
          height: 120px;
          margin: 0 auto 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(199, 163, 106, 0.18);
          border: 2px solid var(--gold);
          color: var(--gold-bright);
          font: 500 2.6rem var(--serif);
        }

        .family-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 4vw;
          align-items: center;
          max-width: 920px;
          margin: 40px auto 0;
        }
        
        /* 3. M & J മോണോഗ്രാം സർക്കിൾ ഫിക്സ് (അക്ഷരങ്ങൾ സർക്കിളിനുള്ളിൽ കൃത്യമായി നിൽക്കുന്നു) */
        .family-amp {
          width: 86px;
          height: 86px;
          border: 1.5px solid rgba(199, 163, 106, .55);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          font: 500 1.35rem/1 var(--serif);
          color: var(--gold);
          margin: auto;
          white-space: nowrap;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        .family-amp span {
          font-size: 0.85em;
          font-style: italic;
          color: var(--gold-bright);
          margin: 0 1px;
        }

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

        .venue {
          display: grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 6vw;
          align-items: center;
          text-align: left;
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
        }
        .qr-card img { display: block; width: 100%; height: auto; }

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

        /* കസ്റ്റം സെക്ഷനുകൾ (2 കാർഡുകൾ) */
        .custom-sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          max-width: 920px;
          margin: 30px auto 0;
        }
        .custom-card-box {
          padding: 34px 28px;
          border-radius: 22px;
          background: linear-gradient(145deg, #2b0c14 0%, #180509 100%);
          border: 1.5px solid rgba(199, 163, 106, 0.4);
          text-align: center;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
        }

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
          .qr-card { justify-self: center; margin-top: 25px; }
          .custom-sections-grid { grid-template-columns: 1fr; }
          .gallery-grid { grid-template-columns: 1fr 1fr; }
          .gate::before { inset: 12px; }
          .gate::after { inset: 18px; }
        }
      ` }} />

      <div className="grain" aria-hidden="true"></div>

      {/* പ്യുവർ CSS പൂവിതളുകൾ */}
      <div className="falling-leaves-css" aria-hidden="true">
        <div className="css-leaf"></div>
        <div className="css-leaf"></div>
        <div className="css-leaf"></div>
        <div className="css-leaf"></div>
        <div className="css-leaf"></div>
      </div>

      {/* 1. റോയൽ ഗേറ്റ് കർട്ടൻ (മൊബൈൽ ടച്ച് ഫിക്സ് സഹിതം) */}
      <section className={`gate ${gateOpened ? "opened" : ""}`}>
        <div className="gate-glow"></div>
        <div className="monogram">{brideInitial} <span>&</span> {groomInitial}</div>
        <p className="eyebrow">{invitation?.parents_text || "Together with their families"}</p>
        <h1>You’re invited<br /><em>to celebrate love</em></h1>
        {dayOfMonth && <p className="gate-date">{dayOfMonth} · {monthAbbr} · {yearNumber}</p>}
        
        {/* മൊബൈലിൽ എവിടെ തൊട്ടാലും ക്ലിക്ക് ആകുന്ന ഓപ്പൺ ബട്ടൺ */}
        <button 
          className="open-button" 
          type="button" 
          onClick={handleOpenGate}
          onTouchEnd={handleOpenGate}
        >
          <span>Open invitation</span>
          <i aria-hidden="true">→</i>
        </button>
        <p className="sound-note">Tap anywhere on the button to enter with music</p>
      </section>

      {/* 2. ഫുൾ-സ്ക്രീൻ ഹീറോ + ടോപ്പിൽ തന്നെ VIEW OFFICIAL CARD ബട്ടൺ */}
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
          {dateFormatted && <p className="hero-date">{dateFormatted}</p>}

          {/* ടോപ്പിൽ വരുന്ന ഒഫീഷ്യൽ കാർഡ് ബട്ടൺ */}
          {invitation?.wedding_card_photo && (
            <div>
              <button
                type="button"
                onClick={() => setShowCardModal(true)}
                className="hero-card-badge-btn"
              >
                <FileText className="w-4 h-4 text-[#c7a36a]" /> View Official Wedding Card
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. വിഷ്വൽ സ്റ്റോറി ഫ്രെയിം (Chapter 1 & 2) */}
      {gallery.length >= 2 && (
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
      )}

      {/* 4. വെൽക്കം & സ്ക്രിപ്‌ചർ / പ്രോമിസ് */}
      {(invitation?.first_met_story || invitation?.journey_story) && (
        <section className="section cream-section">
          {invitation?.first_met_story && (
            <blockquote>“{invitation.first_met_story}”</blockquote>
          )}
          {invitation?.journey_story && (
            <p className="intro">{invitation.journey_story}</p>
          )}
        </section>
      )}

      {/* 5. THE COUPLE (ക്രീം ഐവറി ബാക്ക്‌ഗ്രൗണ്ടും ഉള്ളിൽ ഡീപ് വൈൻ കാർഡുകളും) */}
      <section className="the-couple-section">
        <span className="eyebrow" style={{ color: "#8c5b23" }}>Two Souls, One Heart</span>
        <h2 className="couple-main-title">The Couple</h2>
        <div className="couple-grid">
          
          {/* Bride Card */}
          <div className="person-card">
            {invitation?.bride_photo ? (
              <div className="person-img-wrap">
                <img src={invitation.bride_photo} alt={invitation.bride_name} />
              </div>
            ) : (
              <div className="person-avatar">{brideInitial}</div>
            )}
            <span className="text-xs uppercase font-serif tracking-[0.25em] text-[#c7a36a] font-semibold">The Bride</span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-rose-200 mt-2">{invitation?.bride_name}</h3>
            {invitation?.bride_profession && (
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mt-1">{invitation.bride_profession}</p>
            )}
            {invitation?.bride_parents && (
              <p className="text-xs text-stone-300 mt-3"><strong className="text-[#c7a36a]">Daughter of:</strong> {invitation.bride_parents}</p>
            )}
            {invitation?.bride_bio && (
              <p className="text-xs sm:text-sm italic font-serif text-stone-200 mt-3 leading-relaxed">"{invitation.bride_bio}"</p>
            )}
            {invitation?.bride_family && (
              <p className="text-xs text-stone-400 pt-3 mt-4 border-t border-stone-800/90"><strong className="text-stone-300">Family:</strong> {invitation.bride_family}</p>
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
            <span className="text-xs uppercase font-serif tracking-[0.25em] text-[#c7a36a] font-semibold">The Groom</span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 mt-2">{invitation?.groom_name}</h3>
            {invitation?.groom_profession && (
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mt-1">{invitation.groom_profession}</p>
            )}
            {invitation?.groom_parents && (
              <p className="text-xs text-stone-300 mt-3"><strong className="text-[#c7a36a]">Son of:</strong> {invitation.groom_parents}</p>
            )}
            {invitation?.groom_bio && (
              <p className="text-xs sm:text-sm italic font-serif text-stone-200 mt-3 leading-relaxed">"{invitation.groom_bio}"</p>
            )}
            {invitation?.groom_family && (
              <p className="text-xs text-stone-400 pt-3 mt-4 border-t border-stone-800/90"><strong className="text-stone-300">Family:</strong> {invitation.groom_family}</p>
            )}
          </div>

        </div>
      </section>

      {/* 6. സ്പെഷ്യൽ കപ്പിൾ പോർട്രെയ്റ്റ് */}
      {gallery[2] && (
        <section className="p-8 text-center bg-[#17070b]">
          <div className="max-w-3xl mx-auto rounded-3xl overflow-hidden border border-[#c7a36a]/35 shadow-2xl">
            <img src={gallery[2]} alt="Together" className="w-full max-h-[480px] object-cover" />
          </div>
        </section>
      )}

      {/* 7. ടുഗെദർ വിത്ത് ഫാമിലീസ് & M & J മോണോഗ്രാം സർക്കിൾ */}
      {(invitation?.groom_parents || invitation?.bride_parents) && (
        <section className="section cream-section">
          <p className="verse">Blessings of Elders</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#480e17] mt-2 mb-6">Together With Their Families</h2>
          <div className="family-grid">
            <div>
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#c7a36a] font-bold">Parents of the Groom</span>
              <h3 className="text-xl sm:text-2xl font-serif text-[#480e17] mt-2 mb-1">{invitation?.groom_parents || `${invitation?.groom_name}'s Parents`}</h3>
              {invitation?.groom_family && <p className="text-xs text-stone-600">{invitation.groom_family}</p>}
            </div>

            {/* 3. കൃത്യമായി സർക്കിളിനുള്ളിൽ ഒതുങ്ങിനിൽക്കുന്ന M & J */}
            <div className="family-amp">
              {brideInitial}<span>&</span>{groomInitial}
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#c7a36a] font-bold">Parents of the Bride</span>
              <h3 className="text-xl sm:text-2xl font-serif text-[#480e17] mt-2 mb-1">{invitation?.bride_parents || `${invitation?.bride_name}'s Parents`}</h3>
              {invitation?.bride_family && <p className="text-xs text-stone-600">{invitation.bride_family}</p>}
            </div>
          </div>
        </section>
      )}

      {/* 8. സേവ് ദ ഡേറ്റ് & കൗണ്ട്ഡൗൺ */}
      {invitation?.wedding_date && (
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
      )}

      {/* 9. വേദി, ലൊക്കേഷൻ & QR CODE */}
      {(invitation?.venue_name || invitation?.venue_address) && (
        <section className="section dark-section">
          <div className="max-w-4xl mx-auto venue">
            <div>
              <p className="eyebrow">The Celebration</p>
              <h2 className="text-3xl font-serif font-bold text-white my-3">{invitation?.venue_name}</h2>
              <p className="text-stone-300 text-sm leading-relaxed">{invitation?.venue_address}</p>
              {muhurthamTime && (
                <p className="text-xs uppercase tracking-widest text-[#c7a36a] mt-3">Ceremony · {muhurthamTime} | Reception to follow</p>
              )}
              
              <div className="mt-5 flex flex-wrap gap-3">
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
              <img src={qrDataUrl} alt="QR code" />
              <span className="text-[10px] tracking-widest uppercase mt-2 block font-semibold">Scan for directions</span>
            </div>
          </div>
        </section>
      )}

      {/* 10. ഫോട്ടോ മാഗസിൻ ഗാലറി */}
      {gallery.length > 0 && (
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
      )}

      {/* 11. YOUTUBE LIVE STREAMING & UPI QR CODE GIFTING */}
      {(invitation?.live_stream_url || invitation?.upi_id) && (
        <section className="section dark-section border-t border-stone-800/80">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* YouTube Live Stream */}
            {invitation.live_stream_url && (
              <div className="p-6 rounded-3xl bg-[#1e070c] border border-[#c7a36a]/40 text-center space-y-4 shadow-xl">
                <span className="text-xs uppercase tracking-widest text-rose-400 font-semibold flex items-center justify-center gap-1.5">
                  <Video className="w-4 h-4 text-rose-500 animate-pulse" /> Live Streaming
                </span>
                <h3 className="text-xl font-serif font-bold text-amber-200">Watch the Ceremony Live</h3>
                
                {youtubeEmbedUrl ? (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                    <iframe
                      src={youtubeEmbedUrl}
                      title="Wedding Live Stream"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <a
                    href={invitation.live_stream_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs uppercase tracking-wider transition"
                  >
                    <Video className="w-4 h-4" /> Open Live Stream Broadcast
                  </a>
                )}
              </div>
            )}

            {/* UPI പേയ്‌മെന്റ് QR കോഡ് */}
            {invitation.upi_id && (
              <div className="p-6 rounded-3xl bg-[#1e070c] border border-[#c7a36a]/40 text-center space-y-4 shadow-xl">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold flex items-center justify-center gap-1.5">
                  <Gift className="w-4 h-4 text-[#c7a36a]" /> Wedding Token & Gift
                </span>
                <h3 className="text-xl font-serif font-bold text-amber-200">Scan & Bless via UPI</h3>
                
                {/* QR കോഡ് ഡിസ്പ്ലേ */}
                {upiQrUrl && (
                  <div className="p-3 bg-white rounded-2xl w-fit mx-auto shadow-2xl border border-amber-300">
                    <img src={upiQrUrl} alt="UPI Payment QR Code" className="w-40 h-40 object-contain mx-auto" />
                    <p className="text-[10px] text-stone-800 font-sans font-bold mt-1">Scan with GPay / PhonePe / Paytm</p>
                  </div>
                )}
                
                <div 
                  onClick={handleCopyUpi}
                  className="cursor-pointer inline-flex items-center gap-2 bg-black/60 hover:bg-black/80 border border-[#c7a36a]/50 py-2.5 px-5 rounded-xl text-amber-300 font-mono text-xs select-all transition shadow"
                  title="Click to copy UPI ID"
                >
                  <span>{invitation.upi_id}</span>
                  {copiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-stone-400" />}
                </div>
                {copiedUpi && <p className="text-[11px] text-emerald-400 font-sans">✓ UPI ID Copied to Clipboard!</p>}
              </div>
            )}

          </div>
        </section>
      )}

      {/* 12. കസ്റ്റം സെക്ഷനുകൾ (2 ബോക്സുകൾ) */}
      {customSecs.length > 0 && (
        <section className="section dark-section">
          <p className="eyebrow">Celebration Notes</p>
          <div className="custom-sections-grid">
            {customSecs.map((sec, i) => (
              <div key={i} className="custom-card-box">
                <span className="text-[10px] uppercase tracking-widest text-[#c7a36a] block mb-2 font-semibold">Important Detail</span>
                <h3 className="text-xl font-serif text-[#f7eedf] mb-2">{sec.title}</h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed whitespace-pre-line">{sec.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 13. കോർഡിനേറ്റേഴ്സ് & കോൺടാക്റ്റുകൾ */}
      {contacts.length > 0 && (
        <section className="section dark-section border-t border-stone-800/80">
          <p className="eyebrow mb-2">Event Coordinators</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-serif">
            {contacts.map((c, i) => (
              <div key={i} className="px-5 py-2.5 bg-black/40 rounded-full border border-[#c7a36a]/30">
                <span className="text-stone-300">{c.name}: </span>
                <a href={`tel:${c.phone}`} className="text-amber-300 font-bold hover:underline">{c.phone}</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 14. ഇന്ററാക്ടീവ് RSVP & ഗസ്റ്റ് ആശംസകൾ */}
      <section className="section dark-section border-t border-stone-800/80">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          <div className="form-card text-center">
            <p className="eyebrow">Join With Us</p>
            <h3 className="text-2xl font-serif text-rose-200 mt-1 mb-4">RSVP Confirmation</h3>
            {rsvpSubmitted ? (
              <p className="text-emerald-400 font-serif text-sm py-8">Thank you! Your RSVP has been confirmed. ❤️</p>
            ) : (
              <form onSubmit={localRsvpSubmit} className="space-y-3 text-left">
                <div>
                  <label className="text-[11px] text-stone-400 font-serif uppercase tracking-wider">Your Full Name</label>
                  <input required value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="Guest name..." className="form-input" />
                </div>
                <div>
                  <label className="text-[11px] text-stone-400 font-serif uppercase tracking-wider">Number of Guests</label>
                  <input required type="number" min="1" max="10" value={rsvpGuests} onChange={(e) => setRsvpGuests(e.target.value)} className="form-input" />
                </div>
                <button type="submit" className="w-full py-3 mt-2 bg-[#c7a36a] text-stone-950 font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer">
                  Confirm Attendance
                </button>
              </form>
            )}
          </div>

          <div className="form-card text-center">
            <p className="eyebrow">Warm Wishes</p>
            <h3 className="text-2xl font-serif text-rose-200 mt-1 mb-4">Leave Your Blessings</h3>
            <form onSubmit={localWishSubmit} className="space-y-3 text-left">
              <input required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name..." className="form-input" />
              <textarea required rows={2} value={guestMessage} onChange={(e) => setGuestMessage(e.target.value)} placeholder="Write your blessing..." className="form-input" />
              <button type="submit" disabled={wishLoading} className="w-full py-3 bg-[#480e17] text-[#faf5ed] font-serif text-xs uppercase tracking-widest border border-[#c7a36a]/50 rounded-xl cursor-pointer">
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

      {/* 15. റോയൽ ക്ലോസിംഗ് */}
      <section className="closing section">
        <p className="eyebrow">With love and blessings</p>
        <h2>We can’t wait<br />to celebrate with you.</h2>
        <div className="closing-monogram">{brideInitial} <span>&</span> {groomInitial}</div>
        {dayOfMonth && <p className="closing-date">{dayOfMonth} · {monthAbbr} · {yearNumber}</p>}
      </section>

      {/* ഈക്വലൈസർ മ്യൂസിക് കൺട്രോളർ */}
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

      {/* 16. OFFICIAL CARD LIGHTBOX MODAL */}
      {showCardModal && invitation?.wedding_card_photo && (
        <div 
          onClick={() => setShowCardModal(false)}
          className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-md sm:max-w-lg w-full bg-[#1c070b] border border-[#c7a36a] rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col items-center cursor-default max-h-[82vh]"
          >
            {/* ടോപ്പ് ഹെഡറും ക്ലോസ് ബട്ടണും */}
            <div className="w-full flex items-center justify-between pb-2.5 mb-2 border-b border-white/10 shrink-0">
              <h3 className="text-xs font-serif font-bold text-[#c7a36a] uppercase tracking-widest text-left truncate pr-2">
                Official Wedding Invitation Card
              </h3>
              <button 
                type="button"
                onClick={() => setShowCardModal(false)} 
                className="p-1.5 bg-[#c7a36a] hover:bg-amber-300 text-black font-bold rounded-full shadow-lg transition cursor-pointer shrink-0"
                title="Close Card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* കാർഡ് ഫോട്ടോ സ്ക്രോളബിൾ ഏരിയ */}
            <div className="w-full overflow-y-auto max-h-[68vh] rounded-xl flex items-center justify-center bg-black/40 p-1">
              <img 
                src={invitation.wedding_card_photo} 
                alt="Official Wedding Invitation Card" 
                className="max-h-[66vh] w-auto max-w-full object-contain mx-auto rounded-lg shadow-md" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
