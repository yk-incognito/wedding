"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Calendar, MapPin, Music, Sparkles } from "lucide-react";

export default function BuilderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    // ഡാറ്റ ബ്രൗസർ ലോക്കൽ സ്റ്റോറേജിൽ സേവ് ചെയ്യുന്നു (Vercel ഡെമോയ്ക്കായി)
    localStorage.setItem("weddingData", JSON.stringify(formData));
    router.push("/invite/preview");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-rose-100 p-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-rose-100 rounded-full text-rose-600 mb-4">
            <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Wedding Invitation Builder</h1>
          <p className="text-slate-600 mt-2">നിങ്ങളുടെ വിവരങ്ങൾ നൽകുക; ഇൻവിറ്റേഷൻ വെബ്സൈറ്റ് തനിയെ തയ്യാറാകും!</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Couple Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Bride Name</label>
              <input required name="brideName" value={formData.brideName} onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Groom Name</label>
              <input required name="groomName" value={formData.groomName} onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" />
            </div>
          </div>

          {/* Families & Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Together With Families (Parents Text)</label>
            <input required name="parentsText" value={formData.parentsText} onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Date & Muhurtham Time</label>
              <input required type="datetime-local" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">WhatsApp Coordinator Number</label>
              <input required name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" />
            </div>
          </div>

          {/* Venue & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Venue Name</label>
              <input required name="venueName" value={formData.venueName} onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Google Maps URL</label>
              <input required name="mapUrl" value={formData.mapUrl} onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" />
            </div>
          </div>

          {/* Love Story Details */}
          <div>
            <label className="block text-sm font-medium text-slate-700">First Time We Met (Story)</label>
            <textarea rows={2} name="firstMetStory" value={formData.firstMetStory} onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Journey of Love (Timeline Summary)</label>
            <textarea rows={2} name="journeyStory" value={formData.journeyStory} onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" />
          </div>

          {/* Extras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Live Stream Link (YouTube)</label>
              <input name="liveStreamUrl" value={formData.liveStreamUrl} onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">UPI ID for Gifting</label>
              <input name="upiId" value={formData.upiId} onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-rose-400 outline-none" />
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg">
            <Sparkles className="w-5 h-5" /> Generate Interactive Invitation Website
          </button>
        </form>
      </div>
    </main>
  );
}
