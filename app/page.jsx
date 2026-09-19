"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { 
  Sparkles, Heart, Upload, Music, Eye, Plus, Trash2, 
  MapPin, Phone, Mail, FileText, Image as ImageIcon, CheckCircle, Play, Pause, X, RotateCcw, Check
} from "lucide-react";

const TEMPLATES = [
  { 
    id: "template1", 
    name: "Royal Heritage Editorial", 
    tag: "Active V1",
    color: "from-[#692131] via-[#320c14] to-[#11070a]", 
    desc: "Cinematic gate entry with music, floating petals, chapter visual stories, live countdown & QR directions." 
  },
  { 
    id: "traditional", 
    name: "Kerala Kasavu Palace", 
    tag: "Classic",
    color: "from-amber-200 via-yellow-100 to-amber-300 text-stone-900", 
    desc: "Traditional ivory kasavu, golden marigold petals & temple aesthetic." 
  },
  { 
    id: "minimal", 
    name: "Modern Minimalist", 
    tag: "Chic",
    color: "from-slate-700 to-slate-950", 
    desc: "Clean, ultra-modern luxury serif typography with generous breathing space." 
  },
  { 
    id: "vintage-rose", 
    name: "Vintage Rose Gold", 
    tag: "Romance",
    color: "from-rose-800 via-[#2a131a] to-black", 
    desc: "Blush crimson pastels, romantic floral frames & tender poetic aesthetics." 
  }
];

const MUSIC_TRACKS = [
  { id: "shehnai", title: "Traditional Shehnai & Mangalyam", url: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=indian-flute-and-tabla-110903.mp3" },
  { id: "flute", title: "Romantic Bansuri Flute Serenade", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: "piano", title: "Acoustic Piano & Strings Wedding", url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=romantic-wedding-love-story-10332.mp3" },
  { id: "symphony", title: "Royal Orchestral Celebration", url: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=wedding-celebration-12345.mp3" }
];

const ANIMATION_EFFECTS = [
  { id: "petals", name: "🌸 Rose Petals", icon: "🌸" },
  { id: "leaves", name: "🍁 Autumn Leaves", icon: "🍁" },
  { id: "sparkles", name: "✨ Golden Sparkles", icon: "✨" },
  { id: "hearts", name: "💖 Floating Hearts", icon: "💖" },
  { id: "fireflies", name: "💫 Gentle Fireflies", icon: "💫" },
  { id: "confetti", name: "🎉 Festive Confetti", icon: "🎉" },
  { id: "snow", name: "❄️ Gentle Snowfall", icon: "❄️" },
  { id: "stars", name: "⭐ Twinkling Stars", icon: "⭐" },
  { id: "butterflies", name: "🦋 Butterflies", icon: "🦋" },
  { id: "jasmines", name: "🌼 Jasmine Blossoms", icon: "🌼" }
];

export default function BuilderPage() {
  const router = useRouter();
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Audio Playback
  const [playingTrack, setPlayingTrack] = useState(null);
  const audioPlayerRef = useRef(null);

  // Selections
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [selectedMusic, setSelectedMusic] = useState(MUSIC_TRACKS[0].url);
  const [customAudioFile, setCustomAudioFile] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState("petals");

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
    };
  }, []);

  // Files
  const [coverFile, setCoverFile] = useState(null);
  const [cardFile, setCardFile] = useState(null);
  const [bridePhotoFile, setBridePhotoFile] = useState(null);
  const [groomPhotoFile, setGroomPhotoFile] = useState(null);

  // Multi-upload Gallery
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [sampleGalleryUrls, setSampleGalleryUrls] = useState([]);

  // Sample Images State
  const [sampleCoverUrl, setSampleCoverUrl] = useState("");
  const [sampleCardUrl, setSampleCardUrl] = useState("");
  const [sampleBridePhoto, setSampleBridePhoto] = useState("");
  const [sampleGroomPhoto, setSampleGroomPhoto] = useState("");

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

  const [contacts, setContacts] = useState([{ name: "Family Coordinator", phone: "" }]);
  const [customSections, setCustomSections] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleTogglePreviewAudio = (url) => {
    // നിലവിൽ പ്ലേ ആകുന്ന പാട്ട് പൂർണ്ണമായി നിർത്തി റീസെറ്റ് ചെയ്യുക
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }

    if (playingTrack === url) {
      setPlayingTrack(null);
    } else {
      const newAudio = new Audio(url);
      audioPlayerRef.current = newAudio;
      setPlayingTrack(url);
      setSelectedMusic(url);

      newAudio.play().catch((e) => console.warn("Audio error:", e));

      // പാട്ട് തീർന്നു കഴിഞ്ഞാൽ ഐക്കൺ തനിയെ പ്ലേ ചിഹ്നത്തിലേക്ക് മാറാൻ
      newAudio.onended = () => {
        setPlayingTrack(null);
      };
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

  // 1-Click Safe Sample Fill
  const fillSampleData = () => {
    setFormData({
      brideName: "Merin",
      brideProfession: "Architect & Spatial Designer",
      brideBio: "A lover of heritage spaces, morning filter coffee, and quiet rainy evenings.",
      brideFamily: "Elder brother Dr. Kevin & Sister-in-law Riya",
      brideParents: "K. V. Thomas & Susan Thomas",
      groomName: "Joel",
      groomProfession: "Cloud Security Specialist",
      groomBio: "Passionate about football, landscape photography, and long hill-country drives.",
      groomFamily: "Younger sister Sharon & Grandparents",
      groomParents: "Pastor Thomas Joseph & Mrs. Mincy Thomas",
      parentsText: "Together with their families",
      weddingDate: "2026-10-21T10:30",
      venueName: "Jacobs Entertainments",
      venueAddress: "Pandappilly, Muvattupuzha, Ernakulam, Kerala",
      mapUrl: "https://maps.google.com/?q=Muvattupuzha",
      firstMetStory: "This is the Lord’s doing; it is marvellous in our eyes.",
      journeyStory: "With hearts full of gratitude, we invite you to witness the beginning of our forever.",
      email: "joel.merin.wedding@gmail.com",
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
    setSampleGalleryUrls([
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
    ]);

    setCustomSections([
      { title: "Traditional Sangeeth & Henna Soirée", content: "Join us on the eve of the wedding, October 20th at 6:30 PM with ethnic festive attire and musical merriment." },
      { title: "Dress Code & Guidelines", content: "Morning: Traditional Kerala Kasavu or Pastel Festive Silk.\nEvening Reception: Royal Black Tie or Sherwani." }
    ]);
  };

  const resetForm = () => {
    if (confirm("മുഴുവൻ വിവരങ്ങളും മായ്‌ച്ച് ഫോം റീസെറ്റ് ചെയ്യണമോ?")) {
      setFormData({
        brideName: "", brideProfession: "", brideBio: "", brideFamily: "", brideParents: "",
        groomName: "", groomProfession: "", groomBio: "", groomFamily: "", groomParents: "",
        parentsText: "", weddingDate: "", venueName: "", venueAddress: "", mapUrl: "",
        firstMetStory: "", journeyStory: "", email: "", whatsappNumber: "", liveStreamUrl: "", upiId: ""
      });
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
    if (error) return null;
    const { data } = supabase.storage.from("wedding-photos").getPublicUrl(safeFileName);
    return data?.publicUrl || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // പേജ് മാറുന്നതിന് മുൻപ് പാട്ട് നിർത്തുക
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    setLoading(true);
    // ബാക്കി കോഡ്...

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
          template_id: selectedTemplate,
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
          live_stream_url: formData.liveStreamUrl,
          upi_id: formData.upiId,
          contact_numbers: contacts,
          gallery_photos: finalGallery,
          custom_sections: customSections
        }
      ]);

      if (insertError) throw insertError;
      router.push(`/invite/${uniqueId}`);
    } catch (err) {
      alert("Submission notice: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2c2416] pb-32 relative font-sans selection:bg-[#c7a36a] selection:text-white">

      {/* 1. ലക്ഷ്വറി വൈറ്റ് & ഐവറി ഹീറോ ലാൻഡിംഗ് */}
      <section className="pt-20 pb-16 px-4 bg-gradient-to-b from-white via-[#fcfbf9] to-[#faf8f5] text-center border-b border-[#e9dfce]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#f3ede2] border border-[#d9caa9] text-[#7a5716] text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-[#c7a36a]" /> Royal Matrimonial Digital Studio
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#54101a] via-[#8d2740] to-[#c7a36a] tracking-tight">
            Design Your Forever Story
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-serif">
            Create an enchanting, high-fashion wedding invitation website. Choose your signature template, preview live with sample data, and publish your shareable link in minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={fillSampleData}
              className="px-8 py-3.5 bg-gradient-to-r from-[#54101a] to-[#7f2639] hover:brightness-110 text-white font-bold rounded-full shadow-xl transition-all flex items-center gap-2 text-sm transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#c7a36a]" /> ⚡ 1-Click Fill Sample Data
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3.5 bg-white hover:bg-stone-100 text-rose-700 border border-rose-200 font-semibold rounded-full shadow-md transition-all flex items-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> 🔄 Reset Form
            </button>
          </div>
        </div>
      </section>

      {/* 2. വെബ്സൈറ്റ് ടെംപ്ലേറ്റ് കാർഡുകൾ */}
      <section className="max-w-6xl mx-auto px-4 mt-12">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-[0_15px_40px_rgba(84,16,26,0.06)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#54101a]">1. Choose Website Template</h2>
              <p className="text-xs text-stone-500 mt-1 font-serif">
                Select your preferred template. Click "Live Demo Preview" to view the interactive sample.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1.5 bg-[#f5efe4] text-[#7a5716] rounded-full border border-[#d9caa9] self-start sm:self-auto font-bold">
              Template 1: Live & Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`cursor-pointer rounded-3xl p-5 flex flex-col justify-between border-2 transition-all relative overflow-hidden bg-gradient-to-br ${tpl.color} ${
                  selectedTemplate === tpl.id
                    ? "border-[#c7a36a] ring-4 ring-[#c7a36a]/30 shadow-2xl scale-[1.02]"
                    : "border-stone-200 opacity-90 hover:opacity-100"
                }`}
              >
                <div className="text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-black/40 text-amber-200 border border-white/10">
                      {tpl.tag}
                    </span>
                    {selectedTemplate === tpl.id && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-black/50 px-2.5 py-1 rounded-full border border-amber-400/50">
                        <CheckCircle className="w-3.5 h-3.5" /> Selected
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-serif font-bold drop-shadow mt-1">{tpl.name}</h3>
                  <p className="text-xs text-white/80 mt-2 line-clamp-3 leading-relaxed">{tpl.desc}</p>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/invite/sample-demo`, "_blank");
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-black/50 hover:bg-black/70 text-white text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-md border border-white/20 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" /> Live Demo Preview ↗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ഡാറ്റാ ഇൻപുട്ട് ഫോം (White Royal Palette) */}
      <div ref={formRef} className="max-w-4xl mx-auto px-4 mt-12">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* മ്യൂസിക് സെലക്ഷൻ & അപ്‌ലോഡ് */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#54101a] flex items-center gap-2">
                <Music className="w-5 h-5 text-[#c7a36a]" /> 2. Background Music & Soundscapes
              </h2>
              <p className="text-xs text-stone-500 mt-1 font-serif">പാട്ടുകൾ ഇവിടെ വെച്ച് കേട്ടുനോക്കുകയോ സ്വന്തം ഓഡിയോ ഫയൽ (MP3) അപ്‌ലോഡ് ചെയ്യുകയോ ചെയ്യാം</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MUSIC_TRACKS.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedMusic(t.url)}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    selectedMusic === t.url && !customAudioFile
                      ? "bg-[#faf4ea] border-[#c7a36a] text-[#54101a] font-semibold ring-1 ring-[#c7a36a]/40"
                      : "bg-[#fcfbf9] border-stone-200 text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <span className="text-xs pr-2">{t.title}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleTogglePreviewAudio(t.url); }}
                    className="p-2.5 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-[#54101a] transition shrink-0 shadow-sm"
                  >
                    {playingTrack === t.url ? <Pause className="w-4 h-4 text-rose-600" /> : <Play className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#fcfbf9] rounded-2xl border border-dashed border-[#d9caa9]">
              <label className="text-xs text-[#7a5716] font-semibold flex items-center gap-2 mb-1">
                <Upload className="w-4 h-4" /> Or Upload Custom Music (MP3 File)
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  setCustomAudioFile(e.target.files[0]);
                  if (audioPlayerRef.current) audioPlayerRef.current.pause();
                  setPlayingTrack(null);
                }}
                className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:bg-[#f3ede2] file:text-[#7a5716] file:font-semibold hover:file:bg-[#e8decd] cursor-pointer"
              />
              {customAudioFile && (
                <p className="text-[11px] text-emerald-600 mt-2 font-medium">✓ Selected: {customAudioFile.name}</p>
              )}
            </div>
          </div>

          {/* ആനിമേഷൻ ഇഫക്റ്റുകൾ */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#54101a] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c7a36a]" /> 3. Ambient Floating Effects
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {ANIMATION_EFFECTS.map((eff) => (
                <button
                  type="button"
                  key={eff.id}
                  onClick={() => setSelectedEffect(eff.id)}
                  className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    selectedEffect === eff.id
                      ? "bg-[#faf4ea] border-[#c7a36a] text-[#54101a] ring-2 ring-[#c7a36a]/40 scale-105 font-bold"
                      : "bg-[#fcfbf9] border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <span className="text-2xl">{eff.icon}</span>
                  <span className="text-xs">{eff.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* കവർ & ഒഫീഷ്യൽ കാർഡ് ഫോട്ടോ */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">4. Main Banner & Official Wedding Card</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#c7a36a]" /> Couple Main Cover Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="w-full p-2.5 bg-[#fcfbf9] border border-stone-200 rounded-xl text-xs text-stone-600"
                />
                {sampleCoverUrl && !coverFile && (
                  <p className="text-[10px] text-emerald-600 mt-1 font-medium">✓ High resolution sample cover active</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#c7a36a]" /> കല്യാണക്കത്തിന്റെ ഫോട്ടോ (Official Card - Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCardFile(e.target.files[0])}
                  className="w-full p-2.5 bg-[#fcfbf9] border border-stone-200 rounded-xl text-xs text-stone-600"
                />
                {sampleCardUrl && !cardFile && (
                  <p className="text-[10px] text-emerald-600 mt-1 font-medium">✓ Sample invitation card ready</p>
                )}
              </div>
            </div>
          </div>

          {/* ബ്രൈഡ് & ഗ്രൂം പ്രൊഫൈലുകൾ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bride */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-sm space-y-4">
              <h3 className="text-lg font-serif font-bold text-rose-800">Bride Profile (മണവാട്ടി)</h3>
              <div>
                <label className="text-xs font-semibold text-stone-600">Bride's Full Name *</label>
                <input required name="brideName" value={formData.brideName} onChange={handleChange} placeholder="Merin" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none focus:border-rose-400 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Bride's Portrait Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setBridePhotoFile(e.target.files[0])} className="w-full mt-1 p-2 bg-[#fcfbf9] border border-stone-200 rounded-xl text-xs text-stone-600" />
                {sampleBridePhoto && !bridePhotoFile && <p className="text-[10px] text-emerald-600 mt-1 font-medium">✓ Sample portrait photo set</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Profession / Title</label>
                <input name="brideProfession" value={formData.brideProfession} onChange={handleChange} placeholder="Architect" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Bride's Parents (മാതാപിതാക്കൾ)</label>
                <input name="brideParents" value={formData.brideParents} onChange={handleChange} placeholder="K. V. Thomas & Susan Thomas" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">About Bride (ബയോ)</label>
                <textarea rows={2} name="brideBio" value={formData.brideBio} onChange={handleChange} placeholder="A few words about her..." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Siblings & Family (സഹോദരങ്ങൾ/കുടുംബം)</label>
                <input name="brideFamily" value={formData.brideFamily} onChange={handleChange} placeholder="Elder brother Kevin..." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
            </div>

            {/* Groom */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-sm space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#7a5716]">Groom Profile (വരൻ)</h3>
              <div>
                <label className="text-xs font-semibold text-stone-600">Groom's Full Name *</label>
                <input required name="groomName" value={formData.groomName} onChange={handleChange} placeholder="Joel" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none focus:border-amber-400 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Groom's Portrait Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setGroomPhotoFile(e.target.files[0])} className="w-full mt-1 p-2 bg-[#fcfbf9] border border-stone-200 rounded-xl text-xs text-stone-600" />
                {sampleGroomPhoto && !groomPhotoFile && <p className="text-[10px] text-emerald-600 mt-1 font-medium">✓ Sample portrait photo set</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Profession / Title</label>
                <input name="groomProfession" value={formData.groomProfession} onChange={handleChange} placeholder="Cloud Specialist" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Groom's Parents (മാതാപിതാക്കൾ)</label>
                <input name="groomParents" value={formData.groomParents} onChange={handleChange} placeholder="Pastor Thomas Joseph & Mrs. Mincy Thomas" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">About Groom (ബയോ)</label>
                <textarea rows={2} name="groomBio" value={formData.groomBio} onChange={handleChange} placeholder="A few words about him..." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Siblings & Family (സഹോദരങ്ങൾ/കുടുംബം)</label>
                <input name="groomFamily" value={formData.groomFamily} onChange={handleChange} placeholder="Younger sister Sharon..." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
            </div>
          </div>

          {/* സെറിമണി & ലൊക്കേഷൻ */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">5. Ceremony, Muhurtham & Venue</h2>
            <div>
              <label className="text-xs font-semibold text-stone-600">Together With Families Header *</label>
              <input required name="parentsText" value={formData.parentsText} onChange={handleChange} placeholder="Together with their families" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-600">Muhurtham Date & Time *</label>
                <input required type="datetime-local" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm text-stone-800" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Venue Name *</label>
                <input required name="venueName" value={formData.venueName} onChange={handleChange} placeholder="Jacobs Entertainments" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-600">Venue Full Address</label>
                <input name="venueAddress" value={formData.venueAddress} onChange={handleChange} placeholder="Pandappilly, Muvattupuzha, Ernakulam, Kerala" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-600" /> Google Maps Link
                </label>
                <input name="mapUrl" value={formData.mapUrl} onChange={handleChange} placeholder="https://maps.google.com/?q=..." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
            </div>
          </div>

          {/* സ്റ്റോറി & വേഴ്സ് */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">6. Promise & Love Story</h2>
            <div>
              <label className="text-xs font-semibold text-stone-600">Bible Verse / Special Quote / First Met</label>
              <textarea rows={2} name="firstMetStory" value={formData.firstMetStory} onChange={handleChange} placeholder="This is the Lord’s doing; it is marvellous in our eyes." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600">Welcome Intro / Journey Summary</label>
              <textarea rows={2} name="journeyStory" value={formData.journeyStory} onChange={handleChange} placeholder="With hearts full of gratitude, we invite you to witness the beginning of our forever." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
            </div>
          </div>

          {/* ഗാലറി ഫോട്ടോകൾ (Persistent Append) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#54101a] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#c7a36a]" /> 7. Couple Memories & Story Gallery
            </h2>
            <p className="text-xs text-stone-500">ആദ്യത്തെ 3 ഫോട്ടോകൾ സിനിമാറ്റിക് ചാപ്റ്ററുകളായും ബാക്കിയുള്ളവ ഗാലറിയായും വെബ്സൈറ്റിൽ കാണാം.</p>
            <div className="p-4 bg-[#fcfbf9] rounded-2xl border border-dashed border-[#d9caa9] text-center">
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#7a5716] py-2.5 px-5 rounded-xl bg-[#f3ede2] border border-[#d9caa9] hover:bg-[#e8decd] shadow-sm">
                <Plus className="w-4 h-4" /> Click to Add Photos (+ ഫോട്ടോകൾ ചേർക്കുക)
                <input type="file" multiple accept="image/*" onChange={handleAddGalleryFiles} className="hidden" />
              </label>
            </div>

            {(galleryFiles.length > 0 || sampleGalleryUrls.length > 0) && (
              <div className="pt-2">
                <p className="text-xs text-stone-600 mb-3 font-semibold">
                  Selected Moments ({galleryFiles.length + sampleGalleryUrls.length} ഫോട്ടോകൾ):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {galleryFiles.map((file, idx) => (
                    <div key={`file-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-stone-300 shadow-md">
                      <img src={URL.createObjectURL(file)} alt="Uploaded" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeGalleryFile(idx)} className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full hover:scale-110 shadow">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {sampleGalleryUrls.map((url, idx) => (
                    <div key={`sample-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-[#c7a36a]/50 shadow-md">
                      <img src={url} alt="Sample" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setSampleGalleryUrls(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full hover:scale-110 shadow">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* കോൺടാക്റ്റ് & വാട്ട്‌സ്ആപ്പ് */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">8. Contacts & WhatsApp Wishes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" /> WhatsApp Number *
                </label>
                <input required name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="+91 00000 00000" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-sky-600" /> Contact Email
                </label>
                <input name="email" value={formData.email} onChange={handleChange} placeholder="couple@wedding.xyz" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-stone-600">Family Coordinators & Extra Numbers</label>
              {contacts.map((c, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={c.name}
                    placeholder="Role (e.g. Groom's Brother)"
                    onChange={(e) => {
                      const updated = [...contacts];
                      updated[idx].name = e.target.value;
                      setContacts(updated);
                    }}
                    className="w-1/2 p-2.5 bg-[#fcfbf9] border border-stone-200 rounded-xl text-xs outline-none"
                  />
                  <input
                    value={c.phone}
                    placeholder="Phone Number"
                    onChange={(e) => {
                      const updated = [...contacts];
                      updated[idx].phone = e.target.value;
                      setContacts(updated);
                    }}
                    className="w-1/2 p-2.5 bg-[#fcfbf9] border border-stone-200 rounded-xl text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setContacts(contacts.filter((_, i) => i !== idx))}
                    className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setContacts([...contacts, { name: "", phone: "" }])}
                className="text-xs text-[#7a5716] font-semibold hover:underline flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Another Contact
              </button>
            </div>
          </div>

          {/* കസ്റ്റം സെക്ഷനുകൾ */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">9. Extra Custom Sections (കൂടുതൽ വിവരങ്ങൾ)</h2>
            <p className="text-xs text-stone-500">സംഗീത്, ഡ്രസ്സ് കോഡ്, ബസ് റൂട്ട് വിവരങ്ങൾ എന്നിവ ചേർക്കാം.</p>
            {customSections.map((sec, idx) => (
              <div key={idx} className="p-5 bg-[#fcfbf9] rounded-2xl border border-stone-200 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => setCustomSections(customSections.filter((_, i) => i !== idx))}
                  className="absolute top-4 right-4 text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div>
                  <label className="text-[11px] text-[#7a5716] uppercase tracking-wider font-semibold">Section Heading</label>
                  <input
                    value={sec.title}
                    placeholder="e.g. Traditional Sangeeth & Henna"
                    onChange={(e) => {
                      const up = [...customSections];
                      up[idx].title = e.target.value;
                      setCustomSections(up);
                    }}
                    className="w-full mt-1 p-2.5 bg-white border border-stone-200 rounded-xl text-sm font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Details</label>
                  <textarea
                    rows={2}
                    value={sec.content}
                    placeholder="Write details..."
                    onChange={(e) => {
                      const up = [...customSections];
                      up[idx].content = e.target.value;
                      setCustomSections(up);
                    }}
                    className="w-full mt-1 p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setCustomSections([...customSections, { title: "", content: "" }])}
              className="text-xs text-[#7a5716] font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> + Add Another Custom Section
            </button>
          </div>

          {/* ലൈവ് സ്ട്രീം & UPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e4d7c0]">
              <label className="text-xs font-semibold text-stone-600">YouTube Live Stream URL (Optional)</label>
              <input name="liveStreamUrl" value={formData.liveStreamUrl} onChange={handleChange} placeholder="https://youtube.com/live/..." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm outline-none" />
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#e4d7c0]">
              <label className="text-xs font-semibold text-stone-600">UPI ID for Gifting (Optional)</label>
              <input name="upiId" value={formData.upiId} onChange={handleChange} placeholder="name@upi" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm outline-none" />
            </div>
          </div>

          {/* സബ്മിറ്റ് ബട്ടൺ */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-[#54101a] via-[#8d2740] to-[#c7a36a] hover:brightness-110 text-white font-serif font-bold text-lg rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-amber-200" />
            {loading ? "Publishing Wedding Website..." : "Generate & Publish Wedding Website"}
          </button>
        </form>
      </div>
    </main>
  );
}
