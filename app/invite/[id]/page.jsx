"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { 
  Heart, Calendar, MapPin, Volume2, VolumeX, Share2, 
  Send, FileText, X, Sparkles
} from "lucide-react";

// 10 വ്യത്യസ്ത തീമുകൾക്കുള്ള പക്കാ സ്റ്റൈലിംഗ് കോൺഫിഗറേഷൻ
const THEME_STYLES = {
  royal: {
    bg: "bg-stone-950 text-amber-100",
    heroGlow: "from-amber-600/30 via-stone-900 to-stone-950",
    cardBg: "bg-stone-900/80 border-amber-500/30",
    accent: "text-amber-300",
    button: "bg-amber-500 hover:bg-amber-400 text-stone-950",
    highlight: "text-amber-400",
    subtext: "text-stone-400",
    border: "border-amber-500/20"
  },
  traditional: {
    bg: "bg-amber-50/95 text-stone-900",
    heroGlow: "from-amber-200/50 via-yellow-100/30 to-amber-50",
    cardBg: "bg-white/90 border-amber-400 shadow-xl",
    accent: "text-amber-800 font-serif",
    button: "bg-amber-600 hover:bg-amber-700 text-white",
    highlight: "text-yellow-700",
    subtext: "text-stone-600",
    border: "border-amber-300"
  },
  minimal: {
    bg: "bg-slate-950 text-slate-100",
    heroGlow: "from-slate-800/40 via-slate-900 to-slate-950",
    cardBg: "bg-slate-900/90 border-slate-700 shadow-lg",
    accent: "text-slate-200",
    button: "bg-slate-200 hover:bg-white text-slate-950 font-semibold",
    highlight: "text-slate-300",
    subtext: "text-slate-400",
    border: "border-slate-800"
  },
  "vintage-rose": {
    bg: "bg-[#1f1317] text-rose-100",
    heroGlow: "from-rose-900/40 via-[#1f1317] to-[#140b0e]",
    cardBg: "bg-[#2a1a20]/80 border-rose-500/30 shadow-rose-950/40",
    accent: "text-rose-300 font-serif",
    button: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50",
    highlight: "text-rose-400",
    subtext: "text-rose-200/70",
    border: "border-rose-500/20"
  },
  "midnight-stars": {
    bg: "bg-[#070b19] text-indigo-100",
    heroGlow: "from-indigo-900/50 via-[#0a0f26] to-[#070b19]",
    cardBg: "bg-[#0e1638]/80 border-indigo-500/30 shadow-indigo-950/50",
    accent: "text-cyan-300",
    button: "bg-gradient-to-r from-indigo-500 to-cyan-500 hover:brightness-110 text-white",
    highlight: "text-indigo-300",
    subtext: "text-indigo-200/60",
    border: "border-indigo-500/30"
  },
  "emerald-grace": {
    bg: "bg-[#061811] text-emerald-100",
    heroGlow: "from-emerald-900/50 via-[#061811] to-black",
    cardBg: "bg-[#0d281e]/80 border-emerald-500/30 shadow-xl",
    accent: "text-emerald-300",
    button: "bg-emerald-600 hover:bg-emerald-500 text-white",
    highlight: "text-amber-300",
    subtext: "text-emerald-200/60",
    border: "border-emerald-500/30"
  },
  "boho-earth": {
    bg: "bg-[#1c140e] text-amber-100",
    heroGlow: "from-amber-900/40 via-[#1c140e] to-stone-950",
    cardBg: "bg-[#291d14]/80 border-amber-700/40",
    accent: "text-amber-400",
    button: "bg-amber-700 hover:bg-amber-600 text-amber-50",
    highlight: "text-orange-300",
    subtext: "text-amber-200/70",
    border: "border-amber-800/40"
  },
  "lavender-mist": {
    bg: "bg-[#170f24] text-purple-100",
    heroGlow: "from-purple-900/40 via-[#170f24] to-[#0c0714]",
    cardBg: "bg-[#25173b]/80 border-purple-500/30 shadow-purple-950/40",
    accent: "text-purple-300",
    button: "bg-purple-600 hover:bg-purple-500 text-white",
    highlight: "text-pink-300",
    subtext: "text-purple-200/60",
    border: "border-purple-500/30"
  },
  "ruby-velvet": {
    bg: "bg-[#20080d] text-rose-100",
    heroGlow: "from-red-950/60 via-[#20080d] to-black",
    cardBg: "bg-[#330c14]/80 border-red-700/40 shadow-2xl",
    accent: "text-red-300",
    button: "bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-950",
    highlight: "text-amber-300",
    subtext: "text-rose-200/70",
    border: "border-red-800/40"
  },
  "coastal-breeze": {
    bg: "bg-[#0b1924] text-sky-100",
    heroGlow: "from-sky-900/40 via-amber-900/20 to-[#0b1924]",
    cardBg: "bg-[#112637]/80 border-sky-500/30",
    accent: "text-sky-300",
    button: "bg-gradient-to-r from-amber-500 to-sky-600 hover:brightness-110 text-slate-950 font-bold",
    highlight: "text-amber-300",
    subtext: "text-sky-200/60",
    border: "border-sky-500/20"
  }
};

const EFFECT_EMOJIS = {
  petals: "🌸",
  leaves: "🍁",
  sparkles: "✨",
  hearts: "💖",
  fireflies: "💫",
  confetti: "🎉",
  snow: "❄️",
  balloons: "🎈",
  stars: "⭐",
  butterflies: "🦋"
};

export default function InviteViewPage() {
  const params = useParams();
  const id = params?.id;

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState(null);

  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [wishes, setWishes] = useState([]);
  const [wishLoading, setWishLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let sound = null;

    async function loadData() {
      try {
        const { data, error } = await supabase
          .from("invitations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setInvitation(data);
          if (data.music_url) {
            sound = new Audio(data.music_url);
            sound.loop = true;
            setAudio(sound);
          }
        }

        const { data: wishesData } = await supabase
          .from("guest_wishes")
          .select("*")
          .eq("invitation_id", id)
          .order("created_at", { ascending: false });

        if (wishesData) setWishes(wishesData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      if (sound) sound.pause();
    };
  }, [id]);

  const toggleMusic = () => {
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Wedding invitation link copied to clipboard!");
    }
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("rsvps").insert([
      { invitation_id: id, guest_name: rsvpName, guest_count: parseInt(rsvpGuests, 10), attending: true }
    ]);
    if (!error) {
      setRsvpSubmitted(true);
    } else {
      alert("Error submitting RSVP: " + error.message);
    }
  };

  const handleWishSubmit = async (e) => {
    e.preventDefault();
    if (!guestName || !guestMessage) return;
    setWishLoading(true);

    const { error } = await supabase.from("guest_wishes").insert([
      { invitation_id: id, guest_name: guestName, message: guestMessage }
    ]);

    if (!error) {
      setWishes([{ guest_name: guestName, message: guestMessage, created_at: new Date().toISOString() }, ...wishes]);
      setGuestName("");
      setGuestMessage("");
    }
    setWishLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-amber-200">
        <Heart className="w-12 h-12 animate-pulse text-rose-500 mb-4" />
        <p className="font-serif text-lg tracking-widest">OPENING INVITATION...</p>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-slate-300 p-4">
        <h2 className="text-2xl font-serif font-bold text-rose-400">Invitation Not Found</h2>
        <p className="text-sm text-slate-400 mt-2">The link might be invalid or has expired.</p>
      </div>
    );
  }

  // തിരഞ്ഞെടുത്ത തീമിന്റെ സ്റ്റൈൽ ലോഡ് ചെയ്യുന്നു
  const themeKey = invitation.template_id || "royal";
  const theme = THEME_STYLES[themeKey] || THEME_STYLES.royal;
  const effectEmoji = EFFECT_EMOJIS[invitation.background_effect] || "🌸";

  const weddingDateObj = invitation.wedding_date ? new Date(invitation.wedding_date) : null;
  const formattedDate = weddingDateObj
    ? weddingDateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";
  const formattedTime = weddingDateObj
    ? weddingDateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  const contacts = Array.isArray(invitation.contact_numbers) ? invitation.contact_numbers : [];
  const gallery = Array.isArray(invitation.gallery_photos) ? invitation.gallery_photos : [];
  const customSecs = Array.isArray(invitation.custom_sections) ? invitation.custom_sections : [];

  return (
    <main className={`min-h-screen ${theme.bg} font-sans relative pb-28 selection:bg-amber-400 selection:text-black overflow-hidden transition-colors duration-500`}>

      {/* ലൈവ് ബാക്ക്ഗ്രൗണ്ട് ആനിമേഷൻ ഇഫക്റ്റ് (10 ഇഫക്റ്റുകൾ) */}
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden opacity-35">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="absolute animate-bounce"
            style={{
              top: `${(i * 5) % 95}%`,
              left: `${(i * 11) % 95}%`,
              fontSize: `${20 + (i % 4) * 6}px`,
              animationDuration: `${3.5 + (i % 5)}s`
            }}
          >
            {effectEmoji}
          </span>
        ))}
      </div>

      {/* ഫ്ലോട്ടിംഗ് ഓഡിയോ & ഷെയർ ബട്ടണുകൾ */}
      <div className="fixed top-5 right-5 z-40 flex items-center gap-3">
        {invitation.music_url && (
          <button
            onClick={toggleMusic}
            className="p-3 bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-full shadow-2xl hover:scale-110 transition"
            title="Play / Pause Music"
          >
            {isPlaying ? <Volume2 className="w-5 h-5 text-amber-300 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
          </button>
        )}
        <button
          onClick={copyShareLink}
          className="p-3 bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-full shadow-2xl hover:scale-110 transition"
          title="Share Invitation Link"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* 1. ഹീറോ സെക്ഷൻ */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${invitation.cover_photo || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80"})` }}
        >
          <div className={`absolute inset-0 bg-gradient-to-t ${theme.heroGlow}`} />
        </div>

        <div className="relative z-20 text-center px-4 max-w-3xl space-y-6">
          <p className={`${theme.accent} tracking-[0.3em] uppercase text-xs sm:text-sm font-semibold`}>
            {invitation.parents_text || "Together with their families"}
          </p>
          <h1 className="text-4xl sm:text-7xl font-serif font-bold tracking-tight drop-shadow-md">
            {invitation.bride_name} & {invitation.groom_name}
          </h1>
          <p className={`${theme.subtext} text-sm sm:text-base font-serif italic max-w-lg mx-auto`}>
            "Two lives, two hearts, joined together in friendship, united forever in love."
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            {formattedDate && (
              <span className={`px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border ${theme.border} text-xs sm:text-sm font-serif`}>
                {formattedDate}
              </span>
            )}
            {invitation.wedding_card_photo && (
              <button
                onClick={() => setShowCardModal(true)}
                className={`px-5 py-2 rounded-full ${theme.button} text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-2`}
              >
                <FileText className="w-4 h-4" /> View Official Wedding Card
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. ബ്രൈഡ് & ഗ്രൂം പ്രൊഫൈലുകൾ */}
      <section className="relative z-20 max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Heart className="w-6 h-6 text-rose-500 mx-auto fill-rose-500 mb-2" />
          <h2 className={`text-3xl font-serif font-bold ${theme.accent}`}>The Happy Couple</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bride Card */}
          <div className={`${theme.cardBg} rounded-3xl p-6 sm:p-8 text-center space-y-4 border`}>
            {invitation.bride_photo ? (
              <img src={invitation.bride_photo} alt={invitation.bride_name} className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-rose-400 shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto text-rose-300 font-serif text-2xl font-bold">
                {invitation.bride_name ? invitation.bride_name[0] : "B"}
              </div>
            )}
            <h3 className="text-2xl font-serif font-bold text-rose-300">{invitation.bride_name}</h3>
            {invitation.bride_profession && (
              <p className={`text-xs font-semibold ${theme.highlight} uppercase tracking-widest`}>{invitation.bride_profession}</p>
            )}
            {invitation.bride_parents && (
              <p className={`text-xs ${theme.subtext}`}><strong className="font-semibold">Parents:</strong> {invitation.bride_parents}</p>
            )}
            {invitation.bride_bio && (
              <p className="text-sm italic font-serif leading-relaxed">"{invitation.bride_bio}"</p>
            )}
            {invitation.bride_family && (
              <p className={`text-xs ${theme.subtext} pt-2 border-t ${theme.border}`}><strong className="font-semibold">Family:</strong> {invitation.bride_family}</p>
            )}
          </div>

          {/* Groom Card */}
          <div className={`${theme.cardBg} rounded-3xl p-6 sm:p-8 text-center space-y-4 border`}>
            {invitation.groom_photo ? (
              <img src={invitation.groom_photo} alt={invitation.groom_name} className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-amber-400 shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto text-amber-300 font-serif text-2xl font-bold">
                {invitation.groom_name ? invitation.groom_name[0] : "G"}
              </div>
            )}
            <h3 className={`text-2xl font-serif font-bold ${theme.accent}`}>{invitation.groom_name}</h3>
            {invitation.groom_profession && (
              <p className={`text-xs font-semibold ${theme.highlight} uppercase tracking-widest`}>{invitation.groom_profession}</p>
            )}
            {invitation.groom_parents && (
              <p className={`text-xs ${theme.subtext}`}><strong className="font-semibold">Parents:</strong> {invitation.groom_parents}</p>
            )}
            {invitation.groom_bio && (
              <p className="text-sm italic font-serif leading-relaxed">"{invitation.groom_bio}"</p>
            )}
            {invitation.groom_family && (
              <p className={`text-xs ${theme.subtext} pt-2 border-t ${theme.border}`}><strong className="font-semibold">Family:</strong> {invitation.groom_family}</p>
            )}
          </div>
        </div>
      </section>

      {/* 3. സെറിമണി & ലൊക്കേഷൻ */}
      <section className="relative z-20 max-w-4xl mx-auto px-4 py-12">
        <div className={`${theme.cardBg} rounded-3xl p-8 text-center space-y-6 border shadow-2xl`}>
          <h2 className={`text-3xl font-serif font-bold ${theme.accent}`}>The Wedding Ceremony</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            <div className="flex items-center gap-3">
              <Calendar className={`w-6 h-6 ${theme.highlight}`} />
              <div className="text-left">
                <p className="font-semibold">{formattedDate}</p>
                {formattedTime && <p className={`text-xs ${theme.subtext}`}>Muhurtham: {formattedTime}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-rose-500" />
              <div className="text-left">
                <p className="font-semibold">{invitation.venue_name}</p>
                <p className={`text-xs ${theme.subtext}`}>{invitation.venue_address}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {invitation.map_url && (
              <a
                href={invitation.map_url}
                target="_blank"
                rel="noreferrer"
                className={`px-6 py-3 rounded-xl ${theme.button} text-xs flex items-center gap-2`}
              >
                <MapPin className="w-4 h-4" /> Open in Google Maps
              </a>
            )}
            {invitation.whatsapp_number && (
              <a
                href={`https://wa.me/${invitation.whatsapp_number.replace(/[^0-9]/g, "")}?text=Congratulations%20${encodeURIComponent(invitation.bride_name || "")}%20and%20${encodeURIComponent(invitation.groom_name || "")}!`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg"
              >
                <Send className="w-4 h-4" /> Send WhatsApp Wishes
              </a>
            )}
            {invitation.email && (
              <a
                href={`mailto:${invitation.email}`}
                className={`px-6 py-3 rounded-xl bg-black/30 hover:bg-black/50 text-xs flex items-center gap-2 border ${theme.border}`}
              >
                Contact via Email
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 4. ഗാലറി ഫോട്ടോകൾ */}
      {gallery.length > 0 && (
        <section className="relative z-20 max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-serif font-bold ${theme.accent}`}>Captured Moments</h2>
            <p className={`text-xs ${theme.subtext} mt-1`}>Glimpses of their beautiful journey</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((imgUrl, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedGalleryImg(imgUrl)}
                className={`aspect-square rounded-2xl overflow-hidden border ${theme.border} cursor-pointer hover:scale-105 transition transform shadow-lg`}
              >
                <img src={imgUrl} alt={`Moment ${i+1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. കസ്റ്റം സെക്ഷനുകൾ */}
      {customSecs.length > 0 && (
        <section className="relative z-20 max-w-4xl mx-auto px-4 py-8 space-y-6">
          {customSecs.map((sec, i) => (
            <div key={i} className={`${theme.cardBg} rounded-3xl p-6 sm:p-8 space-y-2 border`}>
              <h3 className={`text-xl font-serif font-bold ${theme.accent}`}>{sec.title}</h3>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${theme.subtext}`}>{sec.content}</p>
            </div>
          ))}
        </section>
      )}

      {/* 6. കോൺടാക്റ്റ് കോർഡിനേറ്റേഴ്സ് */}
      {contacts.length > 0 && (
        <section className="relative z-20 max-w-4xl mx-auto px-4 py-8">
          <div className={`${theme.cardBg} rounded-3xl p-6 sm:p-8 text-center space-y-4 border`}>
            <h3 className={`text-lg font-serif font-bold ${theme.accent}`}>Event Coordinators & Contacts</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {contacts.map((c, i) => (
                <div key={i} className="text-center">
                  <p className={`text-xs ${theme.subtext}`}>{c.name || "Coordinator"}</p>
                  <a href={`tel:${c.phone}`} className={`text-sm font-semibold ${theme.highlight} hover:underline flex items-center gap-1 justify-center mt-1`}>
                    {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. RSVP ഫോം */}
      <section className="relative z-20 max-w-xl mx-auto px-4 py-12">
        <div className={`${theme.cardBg} rounded-3xl p-6 sm:p-8 text-center space-y-6 border shadow-2xl`}>
          <h2 className="text-2xl font-serif font-bold text-rose-400">Will You Join Our Celebration?</h2>
          {rsvpSubmitted ? (
            <p className="text-emerald-400 font-serif">Thank you! Your RSVP has been confirmed. ❤️</p>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4 text-left">
              <div>
                <label className={`text-xs ${theme.subtext}`}>Your Full Name</label>
                <input required value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="John Doe" className="w-full mt-1 p-3 bg-black/40 border border-white/20 rounded-xl outline-none" />
              </div>
              <div>
                <label className={`text-xs ${theme.subtext}`}>Number of Guests Attending</label>
                <input required type="number" min="1" max="10" value={rsvpGuests} onChange={(e) => setRsvpGuests(e.target.value)} className="w-full mt-1 p-3 bg-black/40 border border-white/20 rounded-xl outline-none" />
              </div>
              <button type="submit" className={`w-full py-3 ${theme.button} rounded-xl text-sm transition font-bold`}>
                Confirm Attendance (RSVP)
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 8. വിഷ് വാൾ (GUEST BLESSINGS) */}
      <section className="relative z-20 max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className={`${theme.cardBg} rounded-3xl p-6 sm:p-8 space-y-4 border`}>
          <h3 className={`text-xl font-serif font-bold ${theme.accent} text-center`}>Leave Your Blessings & Wishes</h3>
          <form onSubmit={handleWishSubmit} className="space-y-3">
            <input required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your Name" className="w-full p-3 bg-black/40 border border-white/20 rounded-xl text-xs outline-none" />
            <textarea required rows={2} value={guestMessage} onChange={(e) => setGuestMessage(e.target.value)} placeholder="Warmest congratulations to the couple..." className="w-full p-3 bg-black/40 border border-white/20 rounded-xl text-xs outline-none" />
            <button type="submit" disabled={wishLoading} className={`w-full py-2.5 ${theme.button} text-xs rounded-xl font-bold`}>
              {wishLoading ? "Posting..." : "Post Wedding Wish"}
            </button>
          </form>
        </div>

        <div className="space-y-3">
          {wishes.map((w, i) => (
            <div key={i} className={`p-4 ${theme.cardBg} rounded-2xl space-y-1 border`}>
              <span className={`text-xs font-bold ${theme.accent}`}>{w.guest_name}</span>
              <p className={`text-xs ${theme.subtext} leading-relaxed`}>{w.message}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ഒഫീഷ്യൽ കാർഡ് പോപ്പ്അപ്പ് */}
      {showCardModal && invitation.wedding_card_photo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-stone-900 border border-stone-700 rounded-3xl p-4 shadow-2xl">
            <button onClick={() => setShowCardModal(false)} className="absolute top-3 right-3 p-2 bg-stone-800 rounded-full text-stone-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-serif font-bold text-amber-300 text-center mb-3">Official Wedding Invitation Card</h3>
            <img src={invitation.wedding_card_photo} alt="Official Card" className="max-h-[75vh] w-full object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* ഗാലറി ഫുൾ-സ്ക്രീൻ പോപ്പ്അപ്പ് */}
      {selectedGalleryImg && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedGalleryImg(null)}>
          <div className="relative max-w-3xl w-full p-2">
            <img src={selectedGalleryImg} alt="Enlarged Moment" className="max-h-[85vh] w-full object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </main>
  );
}
