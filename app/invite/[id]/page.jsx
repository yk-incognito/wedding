"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { Volume2, VolumeX, Calendar, MapPin, Heart, Share2, Send, Gift, Video, MessageCircle, ChevronDown, CheckCircle2 } from "lucide-react";

export default function DynamicInvitationPage() {
  const params = useParams();
  const invitationId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showCard, setShowCard] = useState(false);
  const [wishes, setWishes] = useState([]);
  const [guestName, setGuestName] = useState("");
  const [guestWish, setGuestWish] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const audioRef = useRef(null);

  // Fetch invitation data from Supabase by ID
  useEffect(() => {
    async function fetchInvitation() {
      if (!invitationId) return;
      const { data: result, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", invitationId)
        .single();

      if (error || !result) {
        console.error("Invitation not found:", error);
      } else {
        setData(result);
      }
      setLoading(false);
    }
    fetchInvitation();
  }, [invitationId]);

  // Countdown timer
  useEffect(() => {
    if (!data?.wedding_date) return;
    const interval = setInterval(() => {
      const difference = new Date(data.wedding_date) - new Date();
      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsMuted(false);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMuted) audioRef.current.play();
      else audioRef.current.pause();
      setIsMuted(!isMuted);
    }
  };

  const handleAddWish = (e) => {
    e.preventDefault();
    if (guestName && guestWish) {
      setWishes([{ name: guestName, message: guestWish }, ...wishes]);
      setGuestName("");
      setGuestWish("");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-stone-900 flex items-center justify-center text-amber-200">Loading Invitation...</div>;
  }

  if (!data) {
    return <div className="min-h-screen bg-stone-900 flex items-center justify-center text-stone-300">Invitation not found!</div>;
  }

  const brideInitial = data.bride_name?.charAt(0) || "A";
  const groomInitial = data.groom_name?.charAt(0) || "V";

  return (
    <div className="relative min-h-screen bg-stone-900 text-stone-100 selection:bg-rose-500 overflow-x-hidden">
      <audio ref={audioRef} src={data.music_url} loop />

      {/* Music & Share Buttons */}
      <div className="fixed top-5 right-5 z-50 flex gap-2">
        <button onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          alert("Wedding website link copied to clipboard!");
        }} className="p-3 bg-stone-800/80 backdrop-blur rounded-full border border-amber-400/30 text-amber-300">
          <Share2 className="w-5 h-5" />
        </button>
        <button onClick={toggleMusic} className="p-3 bg-stone-800/80 backdrop-blur rounded-full border border-amber-400/30 text-amber-300">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-rose-400" />}
        </button>
      </div>

      {/* WhatsApp Button */}
      {data.whatsapp_number && (
        <a href={`https://wa.me/${data.whatsapp_number}`} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl">
          <MessageCircle className="w-6 h-6" />
        </a>
      )}

      {/* Falling Leaves Animation */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`absolute top-0 text-amber-200/50 text-xl select-none ${i % 2 === 0 ? "animate-fall-slow" : "animate-fall-medium"}`}
            style={{ left: `${(i * 10) + 4}%`, animationDelay: `${i * 0.8}s` }}
          >
            🍁
          </div>
        ))}
      </div>

      {/* Cover / Splash Screen */}
      {!isOpen ? (
        <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${data.cover_photo})` }}>
          <div className="space-y-6 max-w-lg">
            <div className="w-28 h-28 mx-auto rounded-full border-2 border-amber-300/80 flex items-center justify-center bg-stone-900/60 backdrop-blur shadow-2xl">
              <span className="text-4xl font-serif text-amber-300 font-bold tracking-widest">{brideInitial} & {groomInitial}</span>
            </div>
            <p className="text-amber-200 uppercase tracking-widest text-sm">Together Forever</p>
            <h1 className="text-5xl font-serif font-bold text-white tracking-wide">{data.bride_name} & {data.groom_name}</h1>
            <button onClick={handleOpenInvitation} className="mt-8 px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-600 text-white font-medium rounded-full shadow-2xl flex items-center gap-2 mx-auto transition-transform active:scale-95">
              <span>Open Invitation</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </section>
      ) : (
        /* Main Invitation Page */
        <main className="bg-stone-950">
          <section className="py-20 px-4 text-center max-w-3xl mx-auto space-y-6">
            <span className="text-amber-400 font-serif italic text-lg tracking-widest">A Moment of Love</span>
            <h2 className="text-4xl sm:text-5xl font-serif text-amber-100 font-bold">{data.bride_name} & {data.groom_name}</h2>
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto pt-6">
              {[
                { label: "Days", val: countdown.days },
                { label: "Hours", val: countdown.hours },
                { label: "Mins", val: countdown.minutes },
                { label: "Secs", val: countdown.seconds },
              ].map((item, idx) => (
                <div key={idx} className="bg-stone-900 border border-amber-500/20 rounded-2xl p-3">
                  <div className="text-3xl font-serif font-bold text-amber-300">{item.val}</div>
                  <div className="text-xs uppercase text-stone-400 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="py-12 px-6 max-w-2xl mx-auto text-center border-y border-amber-500/20 space-y-3">
            <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Together with their families</p>
            <p className="text-stone-300 font-serif text-lg leading-relaxed">{data.parents_text}</p>
          </section>

          <section className="py-16 px-4 max-w-3xl mx-auto space-y-12">
            <div className="text-center">
              <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <h3 className="text-3xl font-serif text-amber-200">Our Story</h3>
            </div>
            <div className="space-y-6">
              {data.first_met_story && (
                <div className="bg-stone-900/60 p-6 rounded-2xl border border-stone-800">
                  <h4 className="text-amber-400 font-serif text-lg mb-2">The First Time We Met</h4>
                  <p className="text-stone-300 leading-relaxed">{data.first_met_story}</p>
                </div>
              )}
              {data.journey_story && (
                <div className="bg-stone-900/60 p-6 rounded-2xl border border-stone-800">
                  <h4 className="text-amber-400 font-serif text-lg mb-2">Journey of Love</h4>
                  <p className="text-stone-300 leading-relaxed">{data.journey_story}</p>
                </div>
              )}
            </div>
          </section>

          <section className="py-16 px-4 bg-stone-900 text-center">
            <div className="max-w-xl mx-auto space-y-6">
              <Calendar className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-3xl font-serif text-amber-100">When & Where</h3>
              <p className="text-stone-300">{new Date(data.wedding_date).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</p>
              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
                <p className="font-semibold text-amber-200">{data.venue_name}</p>
                <p className="text-sm text-stone-400 mt-1">{data.venue_address}</p>
              </div>
              {data.map_url && (
                <a href={data.map_url} target="_blank" rel="noreferrer" className="inline-flex px-6 py-3 bg-stone-800 rounded-full border border-amber-500/30 text-amber-200 text-sm font-medium items-center gap-2">
                  <MapPin className="w-4 h-4" /> Open in Google Maps
                </a>
              )}
            </div>
          </section>

          <section className="py-16 px-4 text-center">
            <div className="max-w-md mx-auto">
              <button onClick={() => setShowCard(!showCard)} className="w-full py-4 bg-gradient-to-r from-amber-600 to-rose-700 text-white rounded-2xl shadow-xl font-serif">
                {showCard ? "Close Formal Invitation" : "💌 Click to Open Official Card"}
              </button>
              {showCard && (
                <div className="mt-6 p-8 bg-stone-100 text-stone-900 rounded-2xl shadow-2xl border-4 border-double border-amber-600 font-serif text-center space-y-3">
                  <p className="text-xs uppercase text-amber-800 font-bold">Formal Invitation</p>
                  <h4 className="text-3xl font-bold">{data.bride_name} & {data.groom_name}</h4>
                  <p className="text-sm text-stone-600">{data.parents_text}</p>
                </div>
              )}
            </div>
          </section>

          <section className="py-16 px-4 max-w-lg mx-auto">
            <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800 text-center space-y-6">
              <h3 className="text-2xl font-serif text-amber-200">Will You Join Us?</h3>
              {rsvpSubmitted ? (
                <div className="text-emerald-400 flex items-center justify-center gap-2 py-4">
                  <CheckCircle2 className="w-6 h-6" /> Thank you! We look forward to seeing you.
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setRsvpSubmitted(true); }} className="space-y-4 text-left">
                  <input required className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-white outline-none" placeholder="Your Name" />
                  <button type="submit" className="w-full py-3 bg-rose-600 font-semibold rounded-xl text-white">
                    Confirm Attendance
                  </button>
                </form>
              )}
            </div>
          </section>

          {data.live_stream_url && (
            <section className="py-16 px-4 max-w-3xl mx-auto space-y-4 text-center">
              <Video className="w-6 h-6 text-rose-500 mx-auto" />
              <h3 className="text-2xl font-serif text-amber-200">Live Streaming</h3>
              <p className="text-sm text-stone-400">Can't make it in person? Join our live stream on the big day.</p>
              <a href={data.live_stream_url} target="_blank" rel="noreferrer" className="inline-block px-6 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full text-sm">
                Watch YouTube Broadcast
              </a>
            </section>
          )}

          <section className="py-16 px-4 max-w-3xl mx-auto space-y-6">
            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4">
              <h4 className="text-lg font-serif text-amber-200">Blessings & Greetings</h4>
              <form onSubmit={handleAddWish} className="space-y-3">
                <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your Name" required className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white outline-none" />
                <textarea value={guestWish} onChange={(e) => setGuestWish(e.target.value)} placeholder="Heartfelt wishes..." required rows={2} className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white outline-none" />
                <button type="submit" className="px-5 py-2 bg-amber-500 text-stone-950 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Blessing
                </button>
              </form>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {wishes.map((w, idx) => (
                  <div key={idx} className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                    <p className="text-xs text-amber-400 font-semibold">{w.name}</p>
                    <p className="text-sm text-stone-300 mt-1">{w.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {data.upi_id && (
            <section className="py-12 px-4 bg-stone-900 border-t border-stone-800 text-center">
              <div className="max-w-md mx-auto space-y-3">
                <Gift className="w-6 h-6 text-amber-400 mx-auto" />
                <h3 className="text-xl font-serif text-amber-100">Send a Token of Love</h3>
                <div className="p-4 bg-stone-950 rounded-xl border border-dashed border-amber-500/40 text-stone-300 text-sm">
                  UPI ID: <span className="font-mono text-amber-300 font-semibold">{data.upi_id}</span>
                </div>
              </div>
            </section>
          )}

          <footer className="py-8 text-center text-xs text-stone-500">
            Created with ❤️ for {data.bride_name} & {data.groom_name}
          </footer>
        </main>
      )}
    </div>
  );
}
