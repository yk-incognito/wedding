"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { 
  Sparkles, Heart, Upload, Music, Eye, Plus, Trash2, 
  MapPin, Phone, Mail, FileText, Image as ImageIcon, CheckCircle, Play, Pause, X, RotateCcw
} from "lucide-react";

const THEMES = [
  { id: "royal", name: "Royal Gold Luxury", color: "from-amber-700 to-stone-900", desc: "Dark royal aesthetic with gold accents" },
  { id: "traditional", name: "Kerala Kasavu", color: "from-amber-100 to-yellow-600", desc: "Traditional Kerala floral & cream style" },
  { id: "minimal", name: "Modern Minimal", color: "from-slate-100 to-slate-400", desc: "Clean, elegant and typography focused" },
  { id: "vintage-rose", name: "Vintage Rose", color: "from-rose-200 to-rose-700", desc: "Romantic blush & gentle pastels" },
  { id: "midnight-stars", name: "Midnight Celestial", color: "from-indigo-900 to-slate-950", desc: "Deep starry sky with shimmering sparkles" },
  { id: "emerald-grace", name: "Emerald Palace", color: "from-emerald-800 to-stone-900", desc: "Rich royal emerald green highlights" },
  { id: "boho-earth", name: "Boho Earth", color: "from-orange-200 to-amber-800", desc: "Warm terracotta & rustic botanical tones" },
  { id: "lavender-mist", name: "Lavender Dream", color: "from-purple-200 to-purple-800", desc: "Soothing lilac floral fantasy" },
  { id: "ruby-velvet", name: "Ruby Royale", color: "from-red-900 to-stone-950", desc: "Deep velvet crimson wedding celebration" },
  { id: "coastal-breeze", name: "Sunset Horizon", color: "from-sky-700 to-amber-600", desc: "Calicut beach sunset celebration vibe" }
];

const MUSIC_TRACKS = [
  { id: "traditional", title: "Traditional Mangalya Symphony", url: "https://actions.google.com/sounds/v1/ambiences/temple_bell_ring.ogg" },
  { id: "ambient", title: "Gentle Romantic Ambience", url: "https://actions.google.com/sounds/v1/ambiences/outdoor_evening_crickets.ogg" },
  { id: "piano", title: "Soft Piano Serenade", url: "https://actions.google.com/sounds/v1/water/gentle_stream.ogg" },
  { id: "festive", title: "Acoustic Joy Bells", url: "https://actions.google.com/sounds/v1/cartoon/bell_tree.ogg" }
];

const ANIMATION_EFFECTS = [
  { id: "petals", name: "Rose Petals", icon: "🌸" },
  { id: "leaves", name: "Autumn Leaves", icon: "🍁" },
  { id: "sparkles", name: "Golden Sparkles", icon: "✨" },
  { id: "hearts", name: "Floating Hearts", icon: "💖" },
  { id: "fireflies", name: "Gentle Fireflies", icon: "💫" },
  { id: "confetti", name: "Festive Confetti", icon: "🎉" },
  { id: "snow", name: "Gentle Snowfall", icon: "❄️" },
  { id: "balloons", name: "Pastel Balloons", icon: "🎈" },
  { id: "stars", name: "Twinkling Stars", icon: "⭐" },
  { id: "butterflies", name: "Butterflies", icon: "🦋" }
];

const SAMPLE_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519225429980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
];

const INITIAL_FORM = {
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
};

export default function BuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewTheme, setPreviewTheme] = useState(null);

  // Audio Playback
  const [playingTrack, setPlayingTrack] = useState(null);
  const audioPlayerRef = useRef(null);

  // Selections
  const [selectedTheme, setSelectedTheme] = useState("royal");
  const [selectedMusic, setSelectedMusic] = useState(MUSIC_TRACKS[0].url);
  const [customAudioFile, setCustomAudioFile] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState("petals");

  // Files
  const [coverFile, setCoverFile] = useState(null);
  const [cardFile, setCardFile] = useState(null);
  const [bridePhotoFile, setBridePhotoFile] = useState(null);
  const [groomPhotoFile, setGroomPhotoFile] = useState(null);

  // Gallery multi-files
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [sampleGalleryUrls, setSampleGalleryUrls] = useState([]);

  // Sample Images State
  const [sampleCoverUrl, setSampleCoverUrl] = useState("");
  const [sampleCardUrl, setSampleCardUrl] = useState("");
  const [sampleBridePhoto, setSampleBridePhoto] = useState("");
  const [sampleGroomPhoto, setSampleGroomPhoto] = useState("");

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [contacts, setContacts] = useState([{ name: "Family Coordinator", phone: "" }]);
  const [customSections, setCustomSections] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTogglePreviewAudio = (url) => {
    if (playingTrack === url) {
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setPlayingTrack(null);
    } else {
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      const newAudio = new Audio(url);
      newAudio.play().catch(() => {});
      audioPlayerRef.current = newAudio;
      setPlayingTrack(url);
      setSelectedMusic(url);
    }
  };

  const handleAddGalleryFiles = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeGalleryFile = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeSampleGalleryUrl = (index) => {
    setSampleGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 1-Click Safe Sample Fill
  const fillSampleData = () => {
    setFormData({
      brideName: "Ananya Sharma",
      brideProfession: "Architect & Urban Designer",
      brideBio: "Coffee lover, classical dancer and heritage travel enthusiast.",
      brideFamily: "Elder Brother Dr. Arjun & Sister-in-law Dr. Maya",
      brideParents: "Mr. R. K. Sharma & Mrs. Geetha Sharma",
      groomName: "Adithya Varma",
      groomProfession: "Cloud Security Specialist",
      groomBio: "Football fan, amateur photographer and road trip explorer.",
      groomFamily: "Younger Sister Meera & Grandparents",
      groomParents: "Mr. K. Varma & Mrs. Indira Varma",
      parentsText: "Mr. & Mrs. R. K. Sharma and Mr. & Mrs. K. Varma",
      weddingDate: "2026-11-20T10:30",
      venueName: "The Grand Heritage Palace Resort",
      venueAddress: "Bypass Road, Kozhikode, Kerala",
      mapUrl: "https://maps.google.com/?q=Kozhikode+Auditorium",
      firstMetStory: "A chance meeting at an art exhibition that sparked countless conversations.",
      journeyStory: "From college campus coffee meets to exploring old historic cities, we found our home in each other.",
      email: "samplewedding2026@domain.xyz",
      whatsappNumber: "+91 00000 00000",
      liveStreamUrl: "https://www.youtube.com",
      upiId: "samplewedding@bank"
    });

    setContacts([
      { name: "Bride Family Coordinator", phone: "+91 00000 00001" },
      { name: "Groom Family Coordinator", phone: "+91 01234 56789" }
    ]);

    setSampleCoverUrl("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80");
    setSampleCardUrl("https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=800&q=80");
    setSampleBridePhoto("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80");
    setSampleGroomPhoto("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80");
    setSampleGalleryUrls([...SAMPLE_GALLERY_IMAGES]);

    setCustomSections([
      { title: "Traditional Sangeeth & Henna Evening", content: "Join us on the eve of the wedding, November 19th at 6:30 PM with ethnic festive attire and music." },
      { title: "Dress Code & Guidelines", content: "Morning: Traditional Kerala Kasavu or Pastel Silk. Evening: Festive Royal Attire." }
    ]);
  };

  // Reset Everything Button
  const resetForm = () => {
    if (confirm("മുഴുവൻ വിവരങ്ങളും മായ്‌ച്ച് ഫോം റീസെറ്റ് ചെയ്യണമോ?")) {
      setFormData(INITIAL_FORM);
      setCoverFile(null);
      setCardFile(null);
      setBridePhotoFile(null);
      setGroomPhotoFile(null);
      setGalleryFiles([]);
      setSampleGalleryUrls([]);
      setSampleCoverUrl("");
      setSampleCardUrl("");
      setSampleBridePhoto("");
      setSampleGroomPhoto("");
      setContacts([{ name: "Family Coordinator", phone: "" }]);
      setCustomSections([]);
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setPlayingTrack(null);
    }
  };

  const uploadToStorage = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop().toLowerCase() || "dat";
    const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const { error } = await supabase.storage.from("wedding-photos").upload(safeFileName, file, { cacheControl: "3600", upsert: true });
    if (error) {
      console.warn("Upload fallback used:", error.message);
      return null;
    }
    const { data } = supabase.storage.from("wedding-photos").getPublicUrl(safeFileName);
    return data?.publicUrl || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalMusicUrl = selectedMusic;
      if (customAudioFile) {
        const audioUrl = await uploadToStorage(customAudioFile);
        if (audioUrl) finalMusicUrl = audioUrl;
      }

      const [uploadedCover, cardUrl, bridePhotoUrl, groomPhotoUrl] = await Promise.all([
        uploadToStorage(coverFile),
        uploadToStorage(cardFile),
        uploadToStorage(bridePhotoFile),
        uploadToStorage(groomPhotoFile)
      ]);

      let finalGallery = [...sampleGalleryUrls];
      if (galleryFiles.length > 0) {
        for (const f of galleryFiles) {
          const gUrl = await uploadToStorage(f);
          if (gUrl) finalGallery.push(gUrl);
        }
      }

      const cleanBride = (formData.brideName || "bride").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanGroom = (formData.groomName || "groom").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const uniqueId = `${cleanBride}-${cleanGroom}-${Math.random().toString(36).substring(2, 7)}`;

      const { error: insertError } = await supabase.from("invitations").insert([
        {
          id: uniqueId,
          template_id: selectedTheme,
          background_effect: selectedEffect,
          music_url: finalMusicUrl,
          cover_photo: uploadedCover || sampleCoverUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
          wedding_card_photo: cardUrl || sampleCardUrl || null,
          bride_name: formData.brideName,
          bride_profession: formData.brideProfession,
          bride_bio: formData.brideBio,
          bride_family: formData.brideFamily,
          bride_parents: formData.brideParents,
          bride_photo: bridePhotoUrl || sampleBridePhoto || null,
          groom_name: formData.groomName,
          groom_profession: formData.groomProfession,
          groom_bio: formData.groomBio,
          groom_family: formData.groomFamily,
          groom_parents: formData.groomParents,
          groom_photo: groomPhotoUrl || sampleGroomPhoto || null,
          parents_text: formData.parentsText,
          wedding_date: formData.weddingDate,
          venue_name: formData.venueName,
          venue_address: formData.venueAddress,
          map_url: formData.mapUrl,
          first_met_story: formData.firstMetStory,
          journey_story: formData.journeyStory,
          email: formData.email,
          whatsapp_number: formData.whatsappNumber,
          liveStreamUrl: formData.liveStreamUrl,
          upiId: formData.upiId,
          contact_numbers: contacts,
          gallery_photos: finalGallery,
          custom_sections: customSections
        }
      ]);

      if (insertError) throw insertError;
      router.push(`/invite/${uniqueId}`);
    } catch (err) {
      alert("Submission Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeEffectEmoji = ANIMATION_EFFECTS.find(e => e.id === selectedEffect)?.icon || "🌸";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-black pb-28 relative overflow-hidden">

      {/* ലൈവ് ബാക്ക്ഗ്രൗണ്ട് ആനിമേഷൻ ഇഫക്റ്റ് - മാറ്റങ്ങൾ വരുമ്പോൾ തത്സമയം കാണാം */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="absolute animate-bounce"
            style={{
              top: `${(i * 5) % 95}%`,
              left: `${(i * 11) % 95}%`,
              fontSize: `${20 + (i % 4) * 6}px`,
              animationDuration: `${3 + (i % 5)}s`
            }}
          >
            {activeEffectEmoji}
          </span>
        ))}
      </div>

      {/* 1. ലക്ഷ്വറി ഹീറോ ലാൻഡിംഗ് സെക്ഷൻ */}
      <section className="relative z-10 pt-20 pb-16 px-4 bg-gradient-to-b from-stone-950 via-slate-950 to-slate-950 text-center border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wider uppercase backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" /> Premium Digital Matrimonial Studio
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-rose-200 to-amber-300 tracking-tight">
            Design Your Forever Story
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Create an interactive, ultra-luxurious wedding website in minutes. Complete with ambient music, live RSVP, Google Maps, countdown, guest blessings wall, and photo galleries.
          </p>

          {/* ഡെമോ നിറയ്ക്കാനും റീസെറ്റ് ചെയ്യാനുമുള്ള ബട്ടണുകൾ */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={fillSampleData}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-full shadow-2xl transition-all flex items-center gap-2 transform active:scale-95 text-sm"
            >
              <Sparkles className="w-4 h-4" /> ⚡ 1-Click Fill Sample Data
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-rose-300 border border-rose-500/30 font-semibold rounded-full shadow-lg transition-all flex items-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> 🔄 Reset Form
            </button>
          </div>
        </div>
      </section>

      {/* ഫോം കണ്ടെയ്നർ */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 mt-12">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* 2. 10 തീമുകൾ */}
          <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-amber-300">1. Signature Matrimonial Themes</h2>
                <p className="text-xs text-slate-400 mt-1">Select your preferred color and typography palette</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-amber-400/10 text-amber-300 rounded-full border border-amber-400/20">10 Styles</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {THEMES.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`cursor-pointer rounded-2xl p-4 flex flex-col justify-between border-2 transition-all relative overflow-hidden bg-gradient-to-br ${theme.color} ${
                    selectedTheme === theme.id ? "border-amber-400 ring-2 ring-amber-400/60 shadow-2xl scale-105" : "border-slate-800 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
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
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. മ്യൂസിക് പ്ലെയർ & കസ്റ്റം MP3 അപ്‌ലോഡ് */}
          <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-300 flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" /> 2. Background Music & Soundscapes
              </h2>
              <p className="text-xs text-slate-400 mt-1">Listen to samples right here or upload your custom MP3</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MUSIC_TRACKS.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedMusic(t.url)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    selectedMusic === t.url && !customAudioFile ? "bg-amber-500/10 border-amber-400 text-amber-200" : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs font-medium">{t.title}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleTogglePreviewAudio(t.url); }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-amber-300 transition"
                    title="Play Preview"
                  >
                    {playingTrack === t.url ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800">
              <label className="text-xs text-amber-300 font-semibold flex items-center gap-2 mb-1">
                <Upload className="w-4 h-4" /> Or Upload Your Custom Music (MP3 Audio File)
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  setCustomAudioFile(e.target.files[0]);
                  if (audioPlayerRef.current) audioPlayerRef.current.pause();
                  setPlayingTrack(null);
                }}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30"
              />
              {customAudioFile && (
                <p className="text-[11px] text-emerald-400 mt-2 font-medium">✓ Selected: {customAudioFile.name}</p>
              )}
            </div>
          </div>

          {/* 4. 10 ആനിമേഷൻ ഇഫക്റ്റുകൾ - ലൈവായി മാറ്റം കാണാം */}
          <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> 3. Ambient Animation Effects (10 Options)
              </h2>
              <p className="text-xs text-slate-400 mt-1">Select an effect to see it animate immediately on the screen background</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {ANIMATION_EFFECTS.map((eff) => (
                <button
                  type="button"
                  key={eff.id}
                  onClick={() => setSelectedEffect(eff.id)}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    selectedEffect === eff.id ? "bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/40 scale-105" : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="text-2xl">{eff.icon}</span>
                  <span className="text-xs font-semibold">{eff.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. കവർ & കാർഡ് ഫോട്ടോ */}
          <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-6">
            <h2 className="text-xl font-serif font-bold text-amber-300">4. Main Banner & Official Wedding Card</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-400" /> Main Couple Cover Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400"
                />
                {sampleCoverUrl && !coverFile && (
                  <p className="text-[10px] text-emerald-400 mt-1">✓ High resolution sample cover ready</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> കല്യാണക്കത്തിന്റെ ഫോട്ടോ (Official Card - Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCardFile(e.target.files[0])}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400"
                />
                {sampleCardUrl && !cardFile && (
                  <p className="text-[10px] text-emerald-400 mt-1">✓ Sample invitation card photo ready</p>
                )}
              </div>
            </div>
          </div>

          {/* 6. ബ്രൈഡ് & ഗ്രൂം വ്യക്തിഗത പ്രൊഫൈലുകൾ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bride */}
            <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-rose-500/30 space-y-4 shadow-xl">
              <h3 className="text-lg font-serif font-bold text-rose-300">Bride Profile (മണവാട്ടി)</h3>
              <div>
                <label className="text-xs text-slate-400">Bride's Full Name *</label>
                <input required name="brideName" value={formData.brideName} onChange={handleChange} placeholder="Bride Name" className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-rose-400 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Bride's Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setBridePhotoFile(e.target.files[0])} className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400" />
                {sampleBridePhoto && !bridePhotoFile && <p className="text-[10px] text-emerald-400 mt-1">✓ High quality sample photo set</p>}
              </div>
              <div>
                <label className="text-xs text-slate-400">Profession / Occupation</label>
                <input name="brideProfession" value={formData.brideProfession} onChange={handleChange} placeholder="Architect" className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Bride's Parents (രക്ഷിതാക്കൾ)</label>
                <input name="brideParents" value={formData.brideParents} onChange={handleChange} placeholder="Parents names..." className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">About Bride</label>
                <textarea rows={2} name="brideBio" value={formData.brideBio} onChange={handleChange} placeholder="Few words about her..." className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Siblings & Family (സഹോദരങ്ങൾ/കുടുംബം)</label>
                <input name="brideFamily" value={formData.brideFamily} onChange={handleChange} placeholder="Elder brother..." className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
            </div>

            {/* Groom */}
            <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-amber-500/30 space-y-4 shadow-xl">
              <h3 className="text-lg font-serif font-bold text-amber-300">Groom Profile (വരൻ)</h3>
              <div>
                <label className="text-xs text-slate-400">Groom's Full Name *</label>
                <input required name="groomName" value={formData.groomName} onChange={handleChange} placeholder="Groom Name" className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-400 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Groom's Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setGroomPhotoFile(e.target.files[0])} className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400" />
                {sampleGroomPhoto && !groomPhotoFile && <p className="text-[10px] text-emerald-400 mt-1">✓ High quality sample photo set</p>}
              </div>
              <div>
                <label className="text-xs text-slate-400">Profession / Occupation</label>
                <input name="groomProfession" value={formData.groomProfession} onChange={handleChange} placeholder="Security Specialist" className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Groom's Parents (രക്ഷിതാക്കൾ)</label>
                <input name="groomParents" value={formData.groomParents} onChange={handleChange} placeholder="Parents names..." className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">About Groom</label>
                <textarea rows={2} name="groomBio" value={formData.groomBio} onChange={handleChange} placeholder="Few words about him..." className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Siblings & Family (സഹോദരങ്ങൾ/കുടുംബം)</label>
                <input name="groomFamily" value={formData.groomFamily} onChange={handleChange} placeholder="Sister, brother..." className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
            </div>
          </div>

          {/* 7. സെറിമണി & ലൊക്കേഷൻ */}
          <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-6">
            <h2 className="text-xl font-serif font-bold text-amber-300">5. Ceremony, Muhurtham & Venue</h2>
            <div>
              <label className="text-xs text-slate-400">Together With Families Header *</label>
              <input required name="parentsText" value={formData.parentsText} onChange={handleChange} placeholder="Mr. & Mrs. Sharma and Mr. & Mrs. Varma" className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Muhurtham Date & Time *</label>
                <input required type="datetime-local" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Venue Name *</label>
                <input required name="venueName" value={formData.venueName} onChange={handleChange} placeholder="Grand Palace Auditorium" className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Venue Address</label>
                <input name="venueAddress" value={formData.venueAddress} onChange={handleChange} placeholder="Mavoor Road, Kozhikode" className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" /> Google Maps Link
                </label>
                <input name="mapUrl" value={formData.mapUrl} onChange={handleChange} placeholder="https://maps.google.com/?q=..." className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
            </div>
          </div>

          {/* 8. ഗാലറി - എത്ര തവണ വേണമെങ്കിലും ഫോട്ടോകൾ ആഡ് ചെയ്യാം */}
          <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-300 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-400" /> 6. Couple Memories Gallery
            </h2>
            <p className="text-xs text-slate-400">
              നിങ്ങൾക്ക് എത്ര തവണ വേണമെങ്കിലും പുതിയ ഫോട്ടോകൾ കൂട്ടിച്ചേർക്കാം (Append Photos).
            </p>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-dashed border-slate-800">
              <label className="cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200">
                <Plus className="w-4 h-4" /> Click here to Add Photos (+ ഫോട്ടോകൾ ചേർക്കുക)
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddGalleryFiles}
                  className="hidden"
                />
              </label>
            </div>

            {(galleryFiles.length > 0 || sampleGalleryUrls.length > 0) && (
              <div className="pt-2">
                <p className="text-xs text-slate-400 mb-2 font-semibold">
                  Selected Photos ({galleryFiles.length + sampleGalleryUrls.length} ഫോട്ടോകൾ തയ്യാറാണ്):
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {galleryFiles.map((file, idx) => (
                    <div key={`file-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 group">
                      <img src={URL.createObjectURL(file)} alt="Uploaded" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryFile(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-full hover:scale-110 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {sampleGalleryUrls.map((url, idx) => (
                    <div key={`sample-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-amber-500/40 group">
                      <img src={url} alt="Sample" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSampleGalleryUrl(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-full hover:scale-110 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 9. കോൺടാക്റ്റ് & വാട്ട്‌സ്ആപ്പ് */}
          <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-6">
            <h2 className="text-xl font-serif font-bold text-amber-300">7. Contacts & WhatsApp Wishes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> WhatsApp Number *
                </label>
                <input required name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="+91 00000 00000" className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-sky-400" /> Contact Email
                </label>
                <input name="email" value={formData.email} onChange={handleChange} placeholder="couple@wedding.xyz" className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
            </div>

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
                    className="w-1/2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none"
                  />
                  <input
                    value={c.phone}
                    placeholder="Phone Number"
                    onChange={(e) => {
                      const updated = [...contacts];
                      updated[idx].phone = e.target.value;
                      setContacts(updated);
                    }}
                    className="w-1/2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none"
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

          {/* 10. കസ്റ്റം സെക്ഷനുകൾ */}
          <div className="bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-300">8. Extra Custom Sections (കൂടുതൽ വിവരങ്ങൾ)</h2>
            <p className="text-xs text-slate-400">Add detailed schedules, special attire, travel details, or party instructions.</p>
            {customSections.map((sec, idx) => (
              <div key={idx} className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => setCustomSections(customSections.filter((_, i) => i !== idx))}
                  className="absolute top-4 right-4 text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div>
                  <label className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold">Section Heading</label>
                  <input
                    value={sec.title}
                    placeholder="e.g. Sangeeth Celebration / Dress Code"
                    onChange={(e) => {
                      const up = [...customSections];
                      up[idx].title = e.target.value;
                      setCustomSections(up);
                    }}
                    className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Section Content / Details</label>
                  <textarea
                    rows={3}
                    value={sec.content}
                    placeholder="Write detailed guidelines or schedule..."
                    onChange={(e) => {
                      const up = [...customSections];
                      up[idx].content = e.target.value;
                      setCustomSections(up);
                    }}
                    className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setCustomSections([...customSections, { title: "", content: "" }])}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Plus className="w-4 h-4" /> + Add Another Custom Heading & Section
            </button>
          </div>

          {/* സബ്മിറ്റ് ബട്ടൺ */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 hover:brightness-110 text-white font-serif font-bold text-lg rounded-2xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            <Sparkles className="w-6 h-6" />
            {loading ? "Publishing Your Royal Wedding Website..." : "Generate & Publish Wedding Website"}
          </button>
        </form>
      </div>

      {/* തീം പ്രിവ്യൂ പോപ്പ്അപ്പ് */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-serif font-bold text-amber-300">{previewTheme.name}</h3>
              <button onClick={() => setPreviewTheme(null)} className="p-1 rounded-full hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={`h-48 rounded-2xl bg-gradient-to-br ${previewTheme.color} p-6 flex flex-col justify-center items-center text-center shadow-inner`}>
              <span className="text-2xl font-serif text-white font-bold drop-shadow">Ananya & Adithya</span>
              <p className="text-xs text-white/80 mt-2 font-serif italic">Signature Wedding Theme</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setSelectedTheme(previewTheme.id); setPreviewTheme(null); }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs"
              >
                Select Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
