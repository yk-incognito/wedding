"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Volume2, VolumeX, Calendar, MapPin, Heart, Share2, 
  Send, Gift, Video, MessageCircle, Clock, ChevronDown, CheckCircle2 
} from "lucide-react";

export default function InvitationTemplate() {
  const [data, setData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showCard, setShowCard] = useState(false);
  const [wishes, setWishes] = useState([
    { name: "Rahul & Sneha", message: "Congratulations Vishnu and Anushree! Wishing you a wonderful life ahead!" }
  ]);
  const [guestName, setGuestName] = useState("");
  const [guestWish, setGuestWish] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("weddingData");
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      // Default Fallback
      setData({
        brideName: "Anushree",
        groomName: "Vishnu",
        weddingDate: "2026-11-20T10:30",
        parentsText: "Mr. & Mrs. K. Radhakrishnan and Mr. & Mrs. P. Narayanan",
        venueName: "Grand Palace Auditorium",
        venueAddress: "Calicut, Kerala",
        mapUrl: "https://maps.google.com",
        firstMetStory: "We first met under the campus rain at Devagiri College, sharing an umbrella and a lifelong conversation.",
        journeyStory: "From library study dates to evening beach walks at Kozhikode, our bond grew stronger with every cup of tea.",
        whatsappNumber: "919876543210",
        liveStreamUrl: "https://www.youtube.com",
        musicUrl: "https://actions.google.com/sounds/v1/ambiences/outdoor_evening_crickets.ogg",
        coverPhoto: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
        upiId: "couple@upi"
      });
    }
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (!data?.weddingDate) return;
    const interval = setInterval(() => {
      const difference = new Date(data.weddingDate) - new Date();
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

  if (!data) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const brideInitial = data.brideName.charAt(0);
  const groomInitial = data.groomName.charAt(0);

  return (
    <div className="relative min-h-screen bg-stone-900 text-stone-100 font-sans selection:bg-rose-500 selection:text-white overflow-x-hidden">
      {/* Background Audio */}
      <audio ref={audioRef} src={data.musicUrl} loop />

      {/* Floating Controls (Music & WhatsApp) */}
      <div className="fixed top-5 right-5 z-50 flex gap-2">
        <button onClick={toggleMusic} className="p-3 bg-stone-800/80 backdrop-blur-md rounded-full border border-amber-400/30 text-amber-300 shadow-xl">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-rose-400" />}
        </button>
      </div>

      <a href={`https://wa.me/${data.whatsappNumber}`} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-transform hover:scale-110">
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Falling Leaves Animation Layer */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute top-0 text-amber-200/50 text-xl select-none ${i % 2 === 0 ? "animate-fall-slow" : "animate-fall-medium"}`}
            style={{
              left: `${(i * 9) + 3}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          >
            🍁
          </div>
        ))}
      </div>

      {/* COVER / SPLASH SCREEN */}
      {!isOpen ? (
        <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.8)), url(${data.coverPhoto})` }}>
          <div className="space-y-6 max-w-lg animate-fade-in">
            {/* Monogram Initials */}
            <div className="w-28 h-28 mx-auto rounded-full border-2 border-amber-300/80 flex items-center justify-center bg-stone-900/60 backdrop-blur-md shadow-2xl">
              <span className="text-4xl font-serif text-amber-300 font-bold tracking-widest">{brideInitial} & {groomInitial}</span>
            </div>
            
            <p className="text-amber-200 tracking-widest uppercase text-sm font-medium">Together Forever</p>
            <h1 className="text-5xl font-serif font-bold text-white tracking-wide">{data.brideName} & {data.groomName}</h1>
            <p className="text-stone-300 text-sm max-w-sm mx-auto">We invite you to witness the beginning of our forever.</p>

            <button onClick={handleOpenInvitation} className="mt-8 px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-medium rounded-full shadow-2xl tracking-wide flex items-center gap-2 mx-auto transition-transform active:scale-95">
              <span>Open Invitation</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </section>
      ) : (
        /* MAIN INVITATION BODY */
        <main className="animate-fade-in bg-stone-950">
          
          {/* Hero & Moment of Love */}
          <section className="py-20 px-4 text-center max-w-3xl mx-auto space-y-6">
            <span className="text-amber-400 font-serif italic text-lg tracking-widest">A Moment of Love</span>
            <h2 className="text-4xl sm:text-5xl font-serif text-amber-100 font-bold">{data.brideName} & {data.groomName}</h2>
            
            {/* Live Countdown Timer */}
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto pt-6">
              {[
                { label: "Days", val: countdown.days },
                { label: "Hours", val: countdown.hours },
                { label: "Mins", val: countdown.minutes },
                { label: "Secs", val: countdown.seconds },
              ].map((item, idx) => (
                <div key={idx} className="bg-stone-900/90 border border-amber-500/20 rounded-2xl p-3 shadow-inner">
                  <div className="text-3xl font-serif font-bold text-amber-300">{item.val}</div>
                  <div className="text-xs uppercase text-stone-400 tracking-wider mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Together With Families */}
          <section className="py-12 px-6 max-w-2xl mx-auto text-center border-y border-amber-500/20 space-y-4">
            <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Together with their families</p>
            <p className="text-stone-300 font-serif text-lg leading-relaxed">{data.parentsText}</p>
            <p className="text-stone-400 text-sm">Cordially solicit your gracious presence and blessings on the joyous union of their children.</p>
          </section>

          {/* Journey of Love & First Met */}
          <section className="py-16 px-4 max-w-3xl mx-auto space-y-12">
            <div className="text-center">
              <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <h3 className="text-3xl font-serif text-amber-200">Our Story</h3>
            </div>

            <div className="space-y-6">
              <div className="bg-stone-900/60 p-6 rounded-2xl border border-stone-800">
                <h4 className="text-amber-400 font-serif text-lg mb-2">The First Time We Met</h4>
                <p className="text-stone-300 leading-relaxed">{data.firstMetStory}</p>
              </div>

              <div className="bg-stone-900/60 p-6 rounded-2xl border border-stone-800">
                <h4 className="text-amber-400 font-serif text-lg mb-2">Journey of Love</h4>
                <p className="text-stone-300 leading-relaxed">{data.journeyStory}</p>
              </div>
            </div>
          </section>

          {/* When & Where + Add to Calendar */}
          <section className="py-16 px-4 bg-stone-900 text-center">
            <div className="max-w-xl mx-auto space-y-6">
              <Calendar className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-3xl font-serif text-amber-100">When & Where</h3>
              <p className="text-stone-300">{new Date(data.weddingDate).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</p>
              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
                <p className="font-semibold text-amber-200">{data.venueName}</p>
                <p className="text-sm text-stone-400 mt-1">{data.venueAddress}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <a href={data.mapUrl} target="_blank" rel="noreferrer" className="px-6 py-3 bg-stone-800 hover:bg-stone-700 rounded-full border border-amber-500/30 text-amber-200 text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Open in Google Maps
                </a>
                <button onClick={() => alert("Added to device calendar!")} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Add to Calendar
                </button>
              </div>
            </div>
          </section>

          {/* Click to Reveal Invitation Card */}
          <section className="py-16 px-4 text-center">
            <div className="max-w-md mx-auto">
              <button onClick={() => setShowCard(!showCard)} className="w-full py-5 bg-gradient-to-r from-amber-600 to-rose-700 text-white rounded-2xl shadow-xl font-serif text-lg tracking-wide hover:brightness-110 transition">
                {showCard ? "Close Invitation Card" : "💌 Click to Open Official Card"}
              </button>

              {showCard && (
                <div className="mt-6 p-8 bg-stone-100 text-stone-900 rounded-2xl shadow-2xl border-4 border-double border-amber-600 animate-fade-in font-serif text-center space-y-4">
                  <p className="text-xs uppercase tracking-widest text-amber-800 font-bold">Wedding Card</p>
                  <h4 className="text-3xl font-bold">{data.brideName} & {data.groomName}</h4>
                  <p className="text-sm text-stone-600">{data.parentsText}</p>
                  <p className="text-sm pt-4 font-semibold text-stone-800">Request the honor of your presence at their wedding celebration.</p>
                </div>
              )}
            </div>
          </section>

          {/* RSVP: Will You Join Us? */}
          <section className="py-16 px-4 max-w-lg mx-auto">
            <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800 text-center space-y-6">
              <h3 className="text-2xl font-serif text-amber-200">Will You Join Us?</h3>
              {rsvpSubmitted ? (
                <div className="text-emerald-400 flex items-center justify-center gap-2 py-4">
                  <CheckCircle2 className="w-6 h-6" /> Thank you! Your RSVP is registered.
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setRsvpSubmitted(true); }} className="space-y-4 text-left">
                  <div>
                    <label className="text-xs uppercase text-stone-400">Your Full Name</label>
                    <input required className="w-full mt-1 p-3 bg-stone-950 border border-stone-800 rounded-xl text-white outline-none focus:border-amber-400" placeholder="E.g., Arjun K." />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-stone-400">Number of Guests</label>
                    <select className="w-full mt-1 p-3 bg-stone-950 border border-stone-800 rounded-xl text-white outline-none focus:border-amber-400">
                      <option>1 Person</option>
                      <option>2 Persons</option>
                      <option>Family (3+)</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-500 font-semibold rounded-xl text-white transition">
                    Confirm Attendance
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Live Stream & Greetings Wall */}
          <section className="py-16 px-4 max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <Video className="w-6 h-6 text-rose-500 mx-auto" />
              <h3 className="text-2xl font-serif text-amber-200">Live Streaming</h3>
              <p className="text-sm text-stone-400">Can't make it in person? Join our live stream on the big day.</p>
              <a href={data.liveStreamUrl} target="_blank" rel="noreferrer" className="inline-block mt-2 px-6 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full text-sm">
                Watch YouTube Broadcast
              </a>
            </div>

            {/* Greetings Wall */}
            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-6">
              <h4 className="text-lg font-serif text-amber-200">Blessings & Greetings</h4>
              <form onSubmit={handleAddWish} className="space-y-3">
                <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your Name" required className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-sm outline-none" />
                <textarea value={guestWish} onChange={(e) => setGuestWish(e.target.value)} placeholder="Write your heartfelt wish..." required rows={2} className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-sm outline-none" />
                <button type="submit" className="px-5 py-2 bg-amber-500 text-stone-950 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Blessing
                </button>
              </form>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {wishes.map((w, idx) => (
                  <div key={idx} className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-left">
                    <p className="text-xs text-amber-400 font-semibold">{w.name}</p>
                    <p className="text-sm text-stone-300 mt-1">{w.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Micro-Purchase / Token Gifting (Marketing) */}
          <section className="py-16 px-4 bg-stone-900 border-t border-stone-800 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <Gift className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-2xl font-serif text-amber-100">Send a Token of Love</h3>
              <p className="text-sm text-stone-400">Bless the couple with a micro-gift or treat for their honeymoon.</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
                  <p className="text-lg">☕</p>
                  <p className="text-xs font-semibold text-stone-300 mt-1">Honeymoon Coffee</p>
                  <p className="text-amber-400 font-bold text-sm mt-1">₹250</p>
                </div>
                <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
                  <p className="text-lg">🍨</p>
                  <p className="text-xs font-semibold text-stone-300 mt-1">Gelato Treat</p>
                  <p className="text-amber-400 font-bold text-sm mt-1">₹500</p>
                </div>
              </div>

              <div className="p-4 bg-stone-950 rounded-xl border border-dashed border-amber-500/40 text-stone-300 text-sm">
                UPI ID: <span className="font-mono text-amber-300 font-semibold">{data.upiId}</span>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 text-center text-xs text-stone-500">
            Created with love • {data.brideName} & {data.groomName} 2026
          </footer>
        </main>
      )}
    </div>
  );
}
