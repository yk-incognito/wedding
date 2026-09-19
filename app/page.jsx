"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { Sparkles, Heart, Upload, Layout } from "lucide-react";

export default function BuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("royal");
  const [coverFile, setCoverFile] = useState(null);

  const [formData, setFormData] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    parentsText: "",
    venueName: "",
    venueAddress: "",
    mapUrl: "",
    firstMetStory: "",
    journeyStory: "",
    whatsappNumber: "",
    liveStreamUrl: "",
    upiId: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedCoverUrl = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80";

      // Upload cover photo to Supabase bucket
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("wedding-photos")
          .upload(fileName, coverFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("wedding-photos")
          .getPublicUrl(fileName);

        uploadedCoverUrl = publicUrlData.publicUrl;
      }

      // Generate clean unique ID (e.g. anushree-vishnu-k8w2)
      const cleanBride = formData.brideName.trim().toLowerCase().replace(/\s+/g, "");
      const cleanGroom = formData.groomName.trim().toLowerCase().replace(/\s+/g, "");
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const uniqueId = `${cleanBride}-${cleanGroom}-${randomSuffix}`;

      // Insert into Supabase database
      const { error: insertError } = await supabase.from("invitations").insert([
        {
          id: uniqueId,
          template_id: selectedTemplate,
          bride_name: formData.brideName,
          groom_name: formData.groomName,
          wedding_date: formData.weddingDate,
          parents_text: formData.parentsText,
          venue_name: formData.venueName,
          venue_address: formData.venueAddress,
          map_url: formData.mapUrl,
          first_met_story: formData.firstMetStory,
          journey_story: formData.journeyStory,
          whatsapp_number: formData.whatsappNumber,
          live_stream_url: formData.liveStreamUrl,
          cover_photo: uploadedCoverUrl,
          upi_id: formData.upiId,
          music_url: "https://actions.google.com/sounds/v1/ambiences/outdoor_evening_crickets.ogg"
        },
      ]);

      if (insertError) throw insertError;

      router.push(`/invite/${uniqueId}`);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-rose-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-rose-100 rounded-full text-rose-600 mb-2">
            <Heart className="w-8 h-8 fill-rose-500" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Wedding Invitation Builder</h1>
          <p className="text-slate-600 mt-1">Fill in the details to generate your shareable wedding website.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Layout className="w-4 h-4 text-rose-500" /> Choose Design Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: "royal", title: "Royal Luxury", desc: "Dark Gold Theme" },
                { id: "traditional", title: "Kerala Traditional", desc: "Kasavu & Floral" },
                { id: "minimal", title: "Modern Minimal", desc: "Clean & Aesthetic" }
              ].map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    selectedTemplate === tmpl.id
                      ? "border-rose-500 bg-rose-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="font-semibold text-sm text-slate-800">{tmpl.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{tmpl.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Bride Name</label>
              <input required name="brideName" placeholder="Anushree" onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Groom Name</label>
              <input required name="groomName" placeholder="Vishnu" onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <Upload className="w-4 h-4 text-rose-500" /> Couple Cover Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="w-full mt-1 p-2 border border-dashed rounded-xl bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Together With Families (Parents Text)</label>
            <input required name="parentsText" placeholder="Mr. & Mrs. Radhakrishnan and Mr. & Mrs. Narayanan" onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Date & Time</label>
              <input required type="datetime-local" name="weddingDate" onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">WhatsApp Coordinator Number</label>
              <input required name="whatsappNumber" placeholder="919876543210" onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Venue Name</label>
              <input required name="venueName" placeholder="Grand Palace Auditorium" onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Venue Address</label>
              <input required name="venueAddress" placeholder="Calicut, Kerala" onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Google Maps Link</label>
            <input name="mapUrl" placeholder="https://maps.app.goo.gl/..." onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">First Time We Met Story</label>
            <textarea rows={2} name="firstMetStory" placeholder="A brief note about your first meeting..." onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Journey of Love Summary</label>
            <textarea rows={2} name="journeyStory" placeholder="Highlights of your love story..." onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Live Stream URL (Optional)</label>
              <input name="liveStreamUrl" placeholder="https://youtube.com/live/..." onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">UPI ID for Gifting (Optional)</label>
              <input name="upiId" placeholder="name@okaxis" onChange={handleChange} className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {loading ? "Saving to Cloud & Generating..." : "Publish & Generate Invitation Link"}
          </button>
        </form>
      </div>
    </main>
  );
}
