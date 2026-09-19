"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { 
  Sparkles, Heart, Upload, Music, Eye, Plus, Trash2, 
  MapPin, Phone, Mail, FileText, Image as ImageIcon, CheckCircle, ExternalLink, X
} from "lucide-react";

const THEMES = [
  { id: "royal", name: "Royal Gold Luxury", color: "from-amber-700 to-stone-900", desc: "Dark royal aesthetic with gold accents", sampleUrl: "/invite/demo-royal" },
  { id: "traditional", name: "Kerala Kasavu", color: "from-amber-100 to-yellow-600", desc: "Traditional Kerala floral & cream style", sampleUrl: "/invite/demo-traditional" },
  { id: "minimal", name: "Modern Minimal", color: "from-slate-100 to-slate-400", desc: "Clean, elegant and typography focused", sampleUrl: "/invite/demo-minimal" },
  { id: "vintage-rose", name: "Vintage Rose", color: "from-rose-200 to-rose-700", desc: "Romantic blush & gentle pastels", sampleUrl: "/invite/demo-rose" },
  { id: "midnight-stars", name: "Midnight Celestial", color: "from-indigo-900 to-slate-950", desc: "Deep starry sky with shimmering sparkles", sampleUrl: "/invite/demo-stars" },
  { id: "emerald-grace", name: "Emerald Palace", color: "from-emerald-800 to-stone-900", desc: "Rich royal emerald green highlights", sampleUrl: "/invite/demo-emerald" },
  { id: "boho-earth", name: "Boho Earth", color: "from-orange-200 to-amber-800", desc: "Warm terracotta & rustic botanical tones", sampleUrl: "/invite/demo-boho" },
  { id: "lavender-mist", name: "Lavender Dream", color: "from-purple-200 to-purple-800", desc: "Soothing lilac floral fantasy", sampleUrl: "/invite/demo-lavender" },
  { id: "ruby-velvet", name: "Ruby Royale", color: "from-red-900 to-stone-950", desc: "Deep velvet crimson wedding celebration", sampleUrl: "/invite/demo-ruby" },
  { id: "coastal-breeze", name: "Sunset Horizon", color: "from-sky-700 to-amber-600", desc: "Calicut beach sunset celebration vibe", sampleUrl: "/invite/demo-sunset" }
];

const MUSIC_TRACKS = [
  { id: "outdoor", title: "Outdoor Evening Crickets", url: "https://actions.google.com/sounds/v1/ambiences/outdoor_evening_crickets.ogg" },
  { id: "traditional_nadaswaram", title: "Traditional Mangalya Symphony", url: "https://actions.google.com/sounds/v1/ambiences/temple_bell_ring.ogg" },
  { id: "romantic_piano", title: "Soft Piano Romance", url: "https://actions.google.com/sounds/v1/water/gentle_stream.ogg" },
  { id: "celebration_strings", title: "Acoustic Joy Bells", url: "https://actions.google.com/sounds/v1/cartoon/bell_tree.ogg" }
];

export default function BuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewTheme, setPreviewTheme] = useState(null);

  // Core Data
  const [selectedTheme, setSelectedTheme] = useState("royal");
  const [selectedMusic, setSelectedMusic] = useState(MUSIC_TRACKS[0].url);
  const [selectedEffect, setSelectedEffect] = useState("petals");

  // Files
  const [coverFile, setCoverFile] = useState(null);
  const [cardFile, setCardFile] = useState(null);
  const [bridePhotoFile, setBridePhotoFile] = useState(null);
  const [groomPhotoFile, setGroomPhotoFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    brideName: "",
    brideProfession: "",
    brideBio: "",
    brideFamily: "",
    brideParents: "",
    groomName: "",
    groomProfession: "",
    groomBio: "",
    groomFamily: "",
    groomParents: "",
    parentsText: "",
    weddingDate: "",
    venueName: "",
    venueAddress: "",
    mapUrl: "",
    firstMetStory: "",
    journeyStory: "",
    email: "",
    whatsappNumber: "",
    liveStreamUrl: "",
    upiId: ""
  });

  // Dynamic Multi-fields
  const [contacts, setContacts] = useState([{ name: "Family Coordinator", phone: "" }]);
  const [customSections, setCustomSections] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1-Click Demo Fill
  const fillSampleData = () => {
    setFormData({
      brideName: "Anushree",
      brideProfession: "Software Engineer",
      brideBio: "Passionate reader, classical dancer, and lover of beach sunsets.",
      brideFamily: "Elder sister Ananya & Brother-in-law Rahul",
      brideParents: "Mr. K. Radhakrishnan & Mrs. Sumathi",
      groomName: "Vishnu",
      groomProfession: "Cybersecurity Analyst",
      groomBio: "Football fanatic, tech tinkerer, and road trip enthusiast.",
      groomFamily: "Younger brother Vivek & Grandmother Saradha",
      groomParents: "Mr. P. Narayanan & Mrs. Devaki",
      parentsText: "Mr. & Mrs. K. Radhakrishnan and Mr. & Mrs. P. Narayanan",
      weddingDate: "2026-11-20T10:30",
      venueName: "Grand Palace Auditorium",
      venueAddress: "Mavoor Road, Kozhikode, Kerala",
      mapUrl: "https://maps.google.com/?q=Kozhikode+Auditorium",
      firstMetStory: "We first met under the campus rain at Devagiri College, sharing an umbrella and a conversation that never ended.",
      journeyStory: "From library study sessions to endless tea at Kozhikode beach, our friendship grew into a lifelong bond.",
      email: "vishnu.anu.wedding@gmail.com",
      whatsappNumber: "919876543210",
      liveStreamUrl: "https://www.youtube.com",
      upiId: "vishnu@okaxis"
    });
    setContacts([
      { name: "Groom Coordinator", phone: "+91 98765 43210" },
      { name: "Bride Coordinator", phone: "+91 98765 43211" }
    ]);
    setCustomSections([
      { title: "Haldi & Mehendi Celebration", content: "Join us on November 19th, 5:00 PM onwards at Bride's Residence with yellow attire!" },
      { title: "Dress Code & Guidelines", content: "Traditional Kerala Kasavu or Ethnic Festive wear." }
    ]);
  };

  // File Upload Helper
  const uploadToStorage = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop().toLowerCase() || "jpg";
    const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const { error } = await supabase.storage.from("wedding-photos").upload(safeFileName, file, { cacheControl: "3600", upsert: true });
    if (error) {
      console.warn("Storage upload failed, fallback used:", error.message);
      return null;
    }
    const { data } = supabase.storage.from("wedding-photos").getPublicUrl(safeFileName);
    return data?.publicUrl || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload all media in parallel
      const [coverUrl, cardUrl, bridePhotoUrl, groomPhotoUrl] = await Promise.all([
        uploadToStorage(coverFile),
        uploadToStorage(cardFile),
        uploadToStorage(bridePhotoFile),
        uploadToStorage(groomPhotoFile)
      ]);

      // Upload gallery photos
      let uploadedGallery = [];
      for (const f of galleryFiles) {
        const gUrl = await uploadToStorage(f);
        if (gUrl) uploadedGallery.push(gUrl);
      }

      // Generate Clean Unique ID
      const cleanBride = (formData.brideName || "bride").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanGroom = (formData.groomName || "groom").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const uniqueId = `${cleanBride}-${cleanGroom}-${Math.random().toString(36).substring(2, 7)}`;

      // Insert into Supabase
      const { error: insertError } = await supabase.from("invitations").insert([
        {
          id: uniqueId,
          template_id: selectedTheme,
          background_effect: selectedEffect,
          music_url: selectedMusic,
          cover_photo: coverUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
          wedding_card_photo: cardUrl,
          bride_name: formData.brideName,
          bride_profession: formData.brideProfession,
          bride_bio: formData.brideBio,
          bride_family: formData.brideFamily,
          bride_parents: formData.brideParents,
          bride_photo: bridePhotoUrl,
          groom_name: formData.groomName,
          groom_profession: formData.groomProfession,
          groom_bio: formData.groomBio,
          groom_family: formData.groomFamily,
          groom_parents: formData.groomParents,
          groom_photo: groomPhotoUrl,
          parents_text: formData.parentsText,
          wedding_date: formData.weddingDate,
          venue_name: formData.venueName,
          venue_address: formData.venueAddress,
          map_url: formData.mapUrl,
          first_met_story: formData.firstMetStory,
          journey_story: formData.journeyStory,
          email: formData.email,
          whatsapp_number: formData.whatsappNumber,
          live_stream_url: formData.liveStreamUrl,
          upi_id: formData.upiId,
          contact_numbers: contacts,
          gallery_photos: uploadedGallery,
          custom_sections: customSections
        }
      ]);

      if (insertError) throw insertError;
      router.push(`/invite/${uniqueId}`);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 selection:bg-rose-500 selection:text-white pb-24">
      {/* 1. HERO & INTRO */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4 bg-gradient-to-b from-stone-950 via-slate-900 to-slate-900 text-center border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium">
            <Heart className="w-4 h-4 fill-rose-400" /> Interactive Digital Wedding Studio
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-amber-400 tracking-tight">
            Design Your Forever Story
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Create an enchanting, shareable digital wedding invitation website in seconds. Complete with music, themes, live RSVP, Google Maps, greetings wall, and memories gallery.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={fillSampleData}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-full shadow-xl transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" /> ⚡ 1-Click Fill Sample Data (ഡെമോ)
            </button>
          </div>
        </div>
      </section>

      {/* FORM CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* 2. THEMES SELECTION (10 THEMES) */}
          <div className="bg-slate-800/60 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-amber-300">Choose Invitation Theme</h2>
                <p className="text-xs text-slate-400 mt-1">Select from 10 signature matrimonial styles</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-amber-400/10 text-amber-300 rounded-full border border-amber-400/20">10 Themes</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {THEMES.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`cursor-pointer rounded-2xl p-4 flex flex-col justify-between border-2 transition-all relative overflow-hidden bg-gradient-to-br ${theme.color} ${
                    selectedTheme === theme.id ? "border-amber-400 ring-2 ring-amber-400/50 shadow-2xl scale-[1.02]" : "border-slate-700/80 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white drop-shadow">{theme.name}</span>
                      {selectedTheme === theme.id && <CheckCircle className="w-4 h-4 text-amber-300" />}
                    </div>
                    <p className="text-[10px] text-white/80 line-clamp-2">{theme.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreviewTheme(theme); }}
                    className="mt-3 text-[11px] py-1 px-2 rounded-lg bg-black/40 hover:bg-black/60 text-white flex items-center justify-center gap-1 backdrop-blur"
                  >
                    <Eye className="w-3 h-3" /> Live Preview
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. MUSIC & VISUAL EFFECTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700 space-y-4">
              <label className="text-base font-serif font-bold text-amber-300 flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" /> Background Music
              </label>
              <select
                value={selectedMusic}
                onChange={(e) => setSelectedMusic(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:border-amber-400"
              >
                {MUSIC_TRACKS.map((track) => (
                  <option key={track.id} value={track.url}>{track.title}</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700 space-y-4">
              <label className="text-base font-serif font-bold text-amber-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Floating Animation Effect
              </label>
              <select
                value={selectedEffect}
                onChange={(e) => setSelectedEffect(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:border-amber-400"
              >
                <option value="petals">🌸 Falling Rose Petals</option>
                <option value="leaves">🍁 Autumn Gentle Leaves</option>
                <option value="sparkles">✨ Golden Starlight Sparkles</option>
                <option value="hearts">💖 Floating Radiant Hearts</option>
              </select>
            </div>
          </div>

          {/* 4. OFFICIAL WEDDING CARD & COVER PHOTO */}
          <div className="bg-slate-800/60 p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-6">
            <h2 className="text-xl font-serif font-bold text-amber-300">Invitation Card & Main Banner</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-400" /> Couple Main Cover Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="w-full p-2 bg-slate-900 border border-dashed border-slate-600 rounded-xl text-xs text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> കല്യാണക്കത്തിന്റെ ഫോട്ടോ (Official Card - Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCardFile(e.target.files[0])}
                  className="w-full p-2 bg-slate-900 border border-dashed border-slate-600 rounded-xl text-xs text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* 5. BRIDE & GROOM DETAILED PROFILES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bride Box */}
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-rose-500/20 space-y-4">
              <h3 className="text-lg font-serif font-bold text-rose-300">Bride Profile (മണവാട്ടി)</h3>
              <div>
                <label className="text-xs text-slate-400">Bride's Full Name *</label>
                <input required name="brideName" value={formData.brideName} onChange={handleChange} placeholder="Anushree" className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-rose-400" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Bride's Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setBridePhotoFile(e.target.files[0])} className="w-full mt-1 p-2 bg-slate-900 border border-dashed border-slate-700 rounded-xl text-xs text-slate-400" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Profession / Occupation</label>
                <input name="brideProfession" value={formData.brideProfession} onChange={handleChange} placeholder="Software Engineer" className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Bride's Parents (അച്ഛനമ്മമാരുടെ പേരുകൾ)</label>
                <input name="brideParents" value={formData.brideParents} onChange={handleChange} placeholder="Mr. K. Radhakrishnan & Mrs. Sumathi" className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">About Bride</label>
                <textarea rows={2} name="brideBio" value={formData.brideBio} onChange={handleChange} placeholder="Few words about her..." className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Siblings & Family (സഹോദരങ്ങൾ/കുടുംബാംഗങ്ങൾ)</label>
                <input name="brideFamily" value={formData.brideFamily} onChange={handleChange} placeholder="Elder Sister Ananya..." className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
            </div>

            {/* Groom Box */}
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-amber-500/20 space-y-4">
              <h3 className="text-lg font-serif font-bold text-amber-300">Groom Profile (വരൻ)</h3>
              <div>
                <label className="text-xs text-slate-400">Groom's Full Name *</label>
                <input required name="groomName" value={formData.groomName} onChange={handleChange} placeholder="Vishnu" className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Groom's Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setGroomPhotoFile(e.target.files[0])} className="w-full mt-1 p-2 bg-slate-900 border border-dashed border-slate-700 rounded-xl text-xs text-slate-400" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Profession / Occupation</label>
                <input name="groomProfession" value={formData.groomProfession} onChange={handleChange} placeholder="Cybersecurity Analyst" className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Groom's Parents (അച്ഛനമ്മമാരുടെ പേരുകൾ)</label>
                <input name="groomParents" value={formData.groomParents} onChange={handleChange} placeholder="Mr. P. Narayanan & Mrs. Devaki" className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">About Groom</label>
                <textarea rows={2} name="groomBio" value={formData.groomBio} onChange={handleChange} placeholder="Few words about him..." className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Siblings & Family (സഹോദരങ്ങൾ/കുടുംബാംഗങ്ങൾ)</label>
                <input name="groomFamily" value={formData.groomFamily} onChange={handleChange} placeholder="Younger Brother Vivek..." className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
            </div>
          </div>

          {/* 6. CEREMONY DETAILS & VENUE */}
          <div className="bg-slate-800/60 p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-6">
            <h2 className="text-xl font-serif font-bold text-amber-300">Ceremony, Time & Venue</h2>
            <div>
              <label className="text-xs text-slate-400">Together With Families Header *</label>
              <input required name="parentsText" value={formData.parentsText} onChange={handleChange} placeholder="Mr. & Mrs. K. Radhakrishnan and Mr. & Mrs. P. Narayanan" className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Muhurtham Date & Time *</label>
                <input required type="datetime-local" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Venue Name *</label>
                <input required name="venueName" value={formData.venueName} onChange={handleChange} placeholder="Grand Palace Auditorium" className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Venue Full Address</label>
                <input name="venueAddress" value={formData.venueAddress} onChange={handleChange} placeholder="Mavoor Road, Kozhikode" className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" /> Google Maps Link
                </label>
                <input name="mapUrl" value={formData.mapUrl} onChange={handleChange} placeholder="https://maps.google.com/?q=..." className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
            </div>
          </div>

          {/* 7. LOVE STORY */}
          <div className="bg-slate-800/60 p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-300">Love Story Chronicles</h2>
            <div>
              <label className="text-xs text-slate-400">First Time We Met Story</label>
              <textarea rows={2} name="firstMetStory" value={formData.firstMetStory} onChange={handleChange} placeholder="How you met..." className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Journey of Love Summary</label>
              <textarea rows={2} name="journeyStory" value={formData.journeyStory} onChange={handleChange} placeholder="Highlights of the journey..." className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
            </div>
          </div>

          {/* 8. PHOTO GALLERY (MULTIPLE PHOTOS) */}
          <div className="bg-slate-800/60 p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-300 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-400" /> Couple Photo Gallery / Memories
            </h2>
            <p className="text-xs text-slate-400">Upload multiple photos to create a memories gallery on your invite page.</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setGalleryFiles(Array.from(e.target.files))}
              className="w-full p-3 bg-slate-900 border border-dashed border-slate-600 rounded-xl text-xs text-slate-400"
            />
            {galleryFiles.length > 0 && (
              <p className="text-xs text-emerald-400 font-medium">✓ {galleryFiles.length} photos selected for upload</p>
            )}
          </div>

          {/* 9. CONTACTS, WHATSAPP & EMAIL */}
          <div className="bg-slate-800/60 p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-6">
            <h2 className="text-xl font-serif font-bold text-amber-300">Contact & RSVP Channels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> Primary WhatsApp Number (for 1-click chat) *
                </label>
                <input required name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="919876543210" className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-sky-400" /> Contact Email
                </label>
                <input name="email" value={formData.email} onChange={handleChange} placeholder="couple@gmail.com" className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none" />
              </div>
            </div>

            {/* Multiple Numbers */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Family Coordinators & Extra Contact Numbers</label>
              {contacts.map((c, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={c.name}
                    placeholder="Role/Name (e.g. Groom's Brother)"
                    onChange={(e) => {
                      const updated = [...contacts];
                      updated[idx].name = e.target.value;
                      setContacts(updated);
                    }}
                    className="w-1/2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs outline-none"
                  />
                  <input
                    value={c.phone}
                    placeholder="Phone Number"
                    onChange={(e) => {
                      const updated = [...contacts];
                      updated[idx].phone = e.target.value;
                      setContacts(updated);
                    }}
                    className="w-1/2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setContacts(contacts.filter((_, i) => i !== idx))}
                    className="p-2.5 text-rose-400 hover:bg-rose-500/10 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setContacts([...contacts, { name: "", phone: "" }])}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Another Contact
              </button>
            </div>
          </div>

          {/* 10. CUSTOM SECTIONS (EXTRA CONTENT) */}
          <div className="bg-slate-800/60 p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-300">Extra Custom Sections (കൂടുതൽ വിവരങ്ങൾ)</h2>
            <p className="text-xs text-slate-400">Add extra events, dress codes, bachelor party notes, or special instructions.</p>
            {customSections.map((sec, idx) => (
              <div key={idx} className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-2 relative">
                <button
                  type="button"
                  onClick={() => setCustomSections(customSections.filter((_, i) => i !== idx))}
                  className="absolute top-3 right-3 text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <input
                  value={sec.title}
                  placeholder="Section Heading (e.g. Sangeeth Night / Dress Code)"
                  onChange={(e) => {
                    const up = [...customSections];
                    up[idx].title = e.target.value;
                    setCustomSections(up);
                  }}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-semibold text-amber-300 outline-none"
                />
                <textarea
                  rows={2}
                  value={sec.content}
                  placeholder="Details and notes..."
                  onChange={(e) => {
                    const up = [...customSections];
                    up[idx].content = e.target.value;
                    setCustomSections(up);
                  }}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setCustomSections([...customSections, { title: "", content: "" }])}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> + Add Custom Heading & Section
            </button>
          </div>

          {/* 11. STREAM & UPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700">
              <label className="text-xs text-slate-400">Live Stream URL (YouTube - Optional)</label>
              <input name="liveStreamUrl" value={formData.liveStreamUrl} onChange={handleChange} placeholder="https://youtube.com/live/..." className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm outline-none" />
            </div>
            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700">
              <label className="text-xs text-slate-400">UPI ID for Gifting (Optional)</label>
              <input name="upiId" value={formData.upiId} onChange={handleChange} placeholder="name@upi" className="w-full mt-1 p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm outline-none" />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 hover:brightness-110 text-white font-serif font-bold text-lg rounded-2xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            <Sparkles className="w-6 h-6" />
            {loading ? "Publishing to Cloud..." : "Create Official Wedding Invitation Website"}
          </button>
        </form>
      </div>

      {/* THEME LIVE PREVIEW MODAL */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-serif font-bold text-amber-300">{previewTheme.name}</h3>
              <button onClick={() => setPreviewTheme(null)} className="p-1 rounded-full hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={`h-48 rounded-2xl bg-gradient-to-br ${previewTheme.color} p-6 flex flex-col justify-center items-center text-center shadow-inner`}>
              <span className="text-2xl font-serif text-white font-bold drop-shadow">Anushree & Vishnu</span>
              <p className="text-xs text-white/80 mt-2 font-serif italic">Sample Theme Appearance</p>
              <span className="mt-4 px-4 py-1 bg-black/30 rounded-full text-xs text-amber-200 border border-white/20">
                {previewTheme.desc}
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setSelectedTheme(previewTheme.id); setPreviewTheme(null); }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs"
              >
                Select this Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
