"use client";
import React, { useEffect, useState, use } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { 
  Heart, Calendar, MapPin, Music, Volume2, VolumeX, Share2, 
  Send, Gift, Video, Phone, Mail, FileText, Image as ImageIcon, X, Sparkles
} from "lucide-react";

export default function InviteViewPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  // Modals
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState(null);

  // RSVP Form State
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Wishes State
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [wishes, setWishes] = useState([]);
  const [wishLoading, setWishLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setInvitation(data);
        if (data.music_url) {
          const snd = new Audio(data.music_url);
          snd.loop = true;
          setAudio(snd);
        }
      }

      // Load Wishes
      const { data: wishesData } = await supabase
        .from("guest_wishes")
        .select("*")
        .eq("invitation_id", id)
        .order("created_at", { ascending: false });

      if (wishesData) setWishes(wishesData);
      setLoading(false);
    }
    loadData();

    return () => {
      if (audio) audio.pause();
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
    navigator.clipboard.writeText(window.location.href);
    alert("Wedding invitation link copied to clipboard!");
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("rsvps").insert([
      { invitation_id: id, guest_name: rsvpName, guest_count: parseInt(rsvpGuests), attending: true }
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

  const weddingDateObj = new Date(invitation.wedding_date);
  const formattedDate = weddingDateObj.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  const formattedTime = weddingDateObj.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit"
  });

  const contacts = Array.isArray(invitation.contact_numbers) ? invitation.contact_numbers : [];
  const gallery = Array.isArray(invitation.gallery_photos) ? invitation.gallery_photos : [];
  const customSecs = Array.isArray(invitation.custom_sections) ? invitation.custom_sections : [];

  return (
    <main className="min-h-screen bg-stone-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-black relative pb-28">

      {/* FLOATING AUDIO & SHARE BAR */}
      <div className="fixed top-5 right-5 z-40 flex items-center gap-3">
        {invitation.music_url && (
          <button
            onClick={toggleMusic}
            className="p-3 bg-stone-900/80 backdrop-blur-md border border-amber-400/40 text-amber-300 rounded-full shadow-2xl hover:scale-110 transition"
            title="Play / Pause Music"
          >
            {isPlaying ? <Volume2 className="w-5 h-5 text-amber-300 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
          </button>
        )}
        <button
          onClick={copyShareLink}
          className="p-3 bg-stone-900/80 backdrop-blur-md border border-amber-400/40 text-amber-300 rounded-full shadow-2xl hover:scale-110 transition"
          title="Share Invitation Link"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* 1. HERO COVER SECTION */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${invitation.cover_photo})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-black/40" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl space-y-6">
          <p className="text-amber-300/90 tracking-[0.3em] uppercase text-xs sm:text-sm font-semibold">
            {invitation.parents_text || "Together with their families"}
          </p>
          <h1 className="text-4xl sm:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-rose-100 to-amber-300 tracking-tight drop-shadow-md">
            {invitation.bride_name} & {invitation.groom_name}
          </h1>
          <p className="text-stone-300 text-sm sm:text-base font-serif italic max-w-lg mx-auto">
            "Two lives, two hearts, joined together in friendship, united forever in love."
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <span className="px-5 py-2 rounded-full bg-black/50 border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-serif">
              {formattedDate}
            </span>
            {invitation.wedding_card_photo && (
              <button
                onClick={() => setShowCardModal(true)}
                className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> View Official Wedding Card
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. BRIDE & GROOM PROFILES */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Heart className="w-6 h-6 text-rose-500 mx-auto fill-rose-500 mb-2" />
          <h2 className="text-3xl font-serif font-bold text-amber-200">The Happy Couple</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bride Card */}
          <div className="bg-stone-900/60 border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
            {invitation.bride_photo ? (
              <img src={invitation.bride_photo} alt={invitation.bride_name} className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-rose-400/60 shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-300 font-serif text-2xl font-bold">
                {invitation.bride_name[0]}
              </div>
            )}
            <h3 className="text-2xl font-serif font-bold text-rose-300">{invitation.bride_name}</h3>
            {invitation.bride_profession && (
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-widest">{invitation.bride_profession}</p>
            )}
            {invitation.bride_parents && (
              <p className="text-xs text-stone-400"><strong className="text-stone-300">Parents:</strong> {invitation.bride_parents}</p>
            )}
            {invitation.bride_bio && (
              <p className="text-sm text-stone-300 italic font-serif leading-relaxed">"{invitation.bride_bio}"</p>
            )}
            {invitation.bride_family && (
              <p className="text-xs text-stone-400 pt-2 border-t border-stone-800"><strong className="text-stone-300">Family:</strong> {invitation.bride_family}</p>
            )}
          </div>

          {/* Groom Card */}
          <div className="bg-stone-900/60 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
            {invitation.groom_photo ? (
              <img src={invitation.groom_photo} alt={invitation.groom_name} className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-amber-400/60 shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-300 font-serif text-2xl font-bold">
                {invitation.groom_name[0]}
              </div>
            )}
            <h3 className="text-2xl font-serif font-bold text-amber-300">{invitation.groom_name}</h3>
            {invitation.groom_profession && (
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-widest">{invitation.groom_profession}</p>
            )}
            {invitation.groom_parents && (
              <p className="text-xs text-stone-400"><strong className="text-stone-300">Parents:</strong> {invitation.groom_parents}</p>
            )}
            {invitation.groom_bio && (
              <p className="text-sm text-stone-300 italic font-serif leading-relaxed">"{invitation.groom_bio}"</p>
            )}
            {invitation.groom_family && (
              <p className="text-xs text-stone-400 pt-2 border-t border-stone-800"><strong className="text-stone-300">Family:</strong> {invitation.groom_family}</p>
            )}
          </div>
        </div>
      </section>

      {/* 3. CEREMONY & LOCATION */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-stone-900/80 border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl font-serif font-bold text-amber-200">The Wedding Ceremony</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-amber-400" />
              <div className="text-left">
                <p className="font-semibold text-stone-200">{formattedDate}</p>
                <p className="text-xs text-stone-400">Muhurtham: {formattedTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-rose-400" />
              <div className="text-left">
                <p className="font-semibold text-stone-200">{invitation.venue_name}</p>
                <p className="text-xs text-stone-400">{invitation.venue_address}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {invitation.map_url && (
              <a
                href={invitation.map_url}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" /> Open in Google Maps
              </a>
            )}
            {invitation.whatsapp_number && (
              <a
                href={`https://wa.me/${invitation.whatsapp_number.replace(/[^0-9]/g, "")}?text=Congratulations%20${encodeURIComponent(invitation.bride_name)}%20and%20${encodeURIComponent(invitation.groom_name)}!`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Send WhatsApp Wishes
              </a>
            )}
            {invitation.email && (
              <a
                href={`mailto:${invitation.email}`}
                className="px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center gap-2 border border-stone-700"
              >
                <Mail className="w-4 h-4" /> Contact via Email
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 4. PHOTO GALLERY */}
      {gallery.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-amber-200">Captured Moments</h2>
            <p className="text-xs text-stone-400 mt-1">Glimpses of their beautiful journey</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((imgUrl, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedGalleryImg(imgUrl)}
                className="aspect-square rounded-2xl overflow-hidden border border-stone-800 cursor-pointer hover:scale-105 transition transform shadow-lg"
              >
                <img src={imgUrl} alt={`Moment ${i+1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. CUSTOM SECTIONS */}
      {customSecs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {customSecs.map((sec, i) => (
            <div key={i} className="bg-stone-900/50 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-2">
              <h3 className="text-xl font-serif font-bold text-amber-300">{sec.title}</h3>
              <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-line">{sec.content}</p>
            </div>
          ))}
        </section>
      )}

      {/* 6. CONTACT COORDINATORS */}
      {contacts.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <h3 className="text-lg font-serif font-bold text-amber-200">Event Coordinators & Family Contacts</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {contacts.map((c, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-stone-400">{c.name || "Coordinator"}</p>
                  <a href={`tel:${c.phone}`} className="text-sm font-semibold text-amber-300 hover:underline flex items-center gap-1 justify-center mt-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. RSVP FORM */}
      <section className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-stone-900/90 border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <h2 className="text-2xl font-serif font-bold text-rose-200">Will You Join Our Celebration?</h2>
          {rsvpSubmitted ? (
            <p className="text-emerald-400 font-serif">Thank you! Your RSVP has been confirmed. ❤️</p>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-xs text-stone-400">Your Full Name</label>
                <input required value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="John Doe" className="w-full mt-1 p-3 bg-stone-950 border border-stone-700 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-xs text-stone-400">Number of Guests Attending</label>
                <input required type="number" min="1" max="10" value={rsvpGuests} onChange={(e) => setRsvpGuests(e.target.value)} className="w-full mt-1 p-3 bg-stone-950 border border-stone-700 rounded-xl outline-none" />
              </div>
              <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm transition">
                Confirm Attendance (RSVP)
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 8. GUEST WISHES WALL */}
      <section className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-xl font-serif font-bold text-amber-200 text-center">Leave Your Blessings & Wishes</h3>
          <form onSubmit={handleWishSubmit} className="space-y-3">
            <input required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your Name" className="w-full p-3 bg-stone-950 border border-stone-700 rounded-xl text-xs outline-none" />
            <textarea required rows={2} value={guestMessage} onChange={(e) => setGuestMessage(e.target.value)} placeholder="Warmest congratulations to the couple..." className="w-full p-3 bg-stone-950 border border-stone-700 rounded-xl text-xs outline-none" />
            <button type="submit" disabled={wishLoading} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-xl">
              {wishLoading ? "Posting..." : "Post Wedding Wish"}
            </button>
          </form>
        </div>

        {/* Wishes List */}
        <div className="space-y-3">
          {wishes.map((w, i) => (
            <div key={i} className="p-4 bg-stone-900/40 border border-stone-800 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-amber-300">{w.guest_name}</span>
              <p className="text-xs text-stone-300 leading-relaxed">{w.message}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OFFICIAL WEDDING CARD MODAL */}
      {showCardModal && invitation.wedding_card_photo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-stone-900 border border-stone-700 rounded-3xl p-4 shadow-2xl">
            <button onClick={() => setShowCardModal(false)} className="absolute top-3 right-3 p-2 bg-stone-800 rounded-full text-stone-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-serif font-bold text-amber-300 text-center mb-3">Official Invitation Card</h3>
            <img src={invitation.wedding_card_photo} alt="Official Card" className="max-h-[75vh] w-full object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* GALLERY FULLSCREEN MODAL */}
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
