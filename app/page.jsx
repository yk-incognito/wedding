"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import TemplateOne from "../components/templates/TemplateOne";
import { 
  Sparkles, Upload, Music, Eye, Plus, Trash2, 
  MapPin, Phone, Mail, FileText, Image as ImageIcon, CheckCircle, Play, Pause, X, RotateCcw, ArrowLeft, Check
} from "lucide-react";

// 10 ടെംപ്ലേറ്റുകൾ (Template 1 പൂർണ്ണമായും ലൈവ് ആയി സജ്ജമാക്കിയിരിക്കുന്നു)
const TEMPLATES = [
  { 
    id: "template1", 
    name: "Royal Heritage Editorial", 
    tag: "Premium V1",
    color: "from-[#54101a] via-[#2a080e] to-black", 
    desc: "Cinematic gate entry, ambient petals, audio visual story frames & magazine typography." 
  },
  { 
    id: "traditional", 
    name: "Kerala Kasavu Palace", 
    tag: "Classic",
    color: "from-amber-100 via-yellow-100 to-amber-200 text-stone-900", 
    desc: "Traditional ivory kasavu, jasmine blossoms & auspicious temple motifs." 
  },
  { 
    id: "minimal", 
    name: "Modern Minimalist", 
    tag: "Chic",
    color: "from-slate-900 to-slate-950", 
    desc: "Clean, ultra-modern luxury typography with generous white space." 
  },
  { 
    id: "vintage-rose", 
    name: "Vintage Rose Gold", 
    tag: "Romance",
    color: "from-rose-900 via-[#1f1317] to-black", 
    desc: "Blush crimson pastels, romantic frames & tender poetic aesthetics." 
  },
  { 
    id: "midnight-stars", 
    name: "Midnight Celestial", 
    tag: "Starlight",
    color: "from-indigo-950 via-[#0a0f26] to-black", 
    desc: "Deep starlit midnight sky with shimmering celestial gold particles." 
  },
  { 
    id: "emerald-grace", 
    name: "Emerald Palace", 
    tag: "Aristocrat",
    color: "from-emerald-950 via-[#061811] to-black", 
    desc: "Rich aristocratic emerald tones with golden filigree accents." 
  },
  { 
    id: "boho-earth", 
    name: "Boho Terracotta", 
    tag: "Rustic",
    color: "from-stone-900 via-amber-950 to-black", 
    desc: "Warm earthy tones with rustic botanical arches & dried palms." 
  },
  { 
    id: "lavender-mist", 
    name: "Lavender Dream", 
    tag: "Dreamy",
    color: "from-purple-950 via-[#170f24] to-black", 
    desc: "Enchanting lilac dreamscape with soft floating butterflies." 
  },
  { 
    id: "ruby-velvet", 
    name: "Ruby Royale", 
    tag: "Grandeur",
    color: "from-red-950 via-[#20080d] to-black", 
    desc: "Deep crimson grandeur, velvet silhouettes & royal heritage." 
  },
  { 
    id: "coastal-breeze", 
    name: "Sunset Horizon", 
    tag: "Calicut Beach",
    color: "from-sky-950 via-slate-900 to-amber-950", 
    desc: "Golden hour sunset celebration with warm sea breeze reflections." 
  }
];

const MUSIC_TRACKS = [
  { id: "shehnai", title: "Traditional Shehnai & Mangalyam", url: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=indian-flute-and-tabla-110903.mp3" },
  { id: "flute", title: "Romantic Bansuri Flute Serenade", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b918f8e8.mp3?filename=peaceful-garden-healing-light-10656.mp3" },
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
  { id: "butterflies", name: "🦋 Fluttering Butterflies", icon: "🦋" },
  { id: "jasmines", name: "🌼 Jasmine Blossoms", icon: "🌼" }
];

const SAMPLE_DATA = {
  bride_name: "Merin",
  bride_profession: "Architect & Spatial Designer",
  bride_bio: "A lover of heritage homes, morning filter coffee, and quiet rainy evenings.",
  bride_family: "Elder brother Dr. Kevin & Sister-in-law Riya",
  bride_parents: "K. V. Thomas & Susan Thomas",
  groom_name: "Joel",
  groom_profession: "Cloud Security Specialist",
  groom_bio: "Passionate about football, landscape photography, and long hill-country drives.",
  groom_family: "Younger sister Sharon & Grandparents",
  groom_parents: "Pastor Thomas Joseph & Mrs. Mincy Thomas",
  parents_text: "Together with their families",
  wedding_date: "2026-10-21T10:30",
  venue_name: "Jacobs Entertainments",
  venue_address: "Pandappilly, Muvattupuzha, Ernakulam, Kerala",
  map_url: "https://maps.google.com/?q=Muvattupuzha",
  firstMetStory: "This is the Lord’s doing; it is marvellous in our eyes.",
  journey_story: "With hearts full of gratitude, we invite you to witness the beginning of our forever.",
  email: "joel.merin.wedding@gmail.com",
  whatsapp_number: "+91 00000 00000",
  cover_photo: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
  wedding_card_photo: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=800&q=80",
  gallery_photos: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
  ],
  music_url: MUSIC_TRACKS[0].url,
  background_effect: "petals"
};

export default function BuilderPage() {
  const router = useRouter();
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // ലൈവ് ഫുൾ-സ്ക്രീൻ സാമ്പിൾ പ്രിവ്യൂ സ്റ്റേറ്റ്
  const [previewingTemplate, setPreviewingTemplate] = useState(null);

  // ഓഡിയോ പ്ലേബാക്ക്
  const [playingTrack, setPlayingTrack] = useState(null);
  const audioPlayerRef = useRef(null);

  // തെരഞ്ഞെടുത്ത ടെംപ്ലേറ്റും ഓപ്ഷനുകളും
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [selectedMusic, setSelectedMusic] = useState(MUSIC_TRACKS[0].url);
  const [customAudioFile, setCustomAudioFile] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState("petals");

  // ഫയലുകൾ
  const [coverFile, setCoverFile] = useState(null);
  const [cardFile, setCardFile] = useState(null);
  const [bridePhotoFile, setBridePhotoFile] = useState(null);
  const [groomPhotoFile, setGroomPhotoFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [sampleGalleryUrls, setSampleGalleryUrls] = useState([]);

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
    if (playingTrack === url) {
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setPlayingTrack(null);
    } else {
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      const newAudio = new Audio(url);
      newAudio.play().then(() => {
        audioPlayerRef.current = newAudio;
        setPlayingTrack(url);
        setSelectedMusic(url);
      }).catch(() => {});
    }
  };

  const handleAddGalleryFiles = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeGalleryFile = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 1-ക്ലിക്ക് ഫിൽ സാമ്പിൾ
  const fillSampleData = () => {
    setFormData({
      brideName: "Merin Thomas",
      brideProfession: "Architect & Spatial Designer",
      brideBio: "A lover of heritage homes, morning filter coffee, and quiet rainy evenings.",
      brideFamily: "Elder brother Dr. Kevin & Sister-in-law Riya",
      brideParents: "K. V. Thomas & Susan Thomas",
      groomName: "Joel Thomas",
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
    setSampleGalleryUrls(SAMPLE_DATA.gallery_photos);

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

  // പ്രിവ്യൂവിൽ നിന്ന് നേരിട്ട് ടെംപ്ലേറ്റ് തെരഞ്ഞെടുത്ത് ഫോമിലേക്ക് പോവുക
  const handleSelectFromPreview = (tplId) => {
    setSelectedTemplate(tplId);
    setPreviewingTemplate(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
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
      alert("Submission notice: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090b10] text-slate-100 pb-28 relative font-sans">

      {/* 1. ലക്ഷ്വറി ലാൻഡിംഗ് ഹീറോ */}
      <section className="pt-20 pb-16 px-4 bg-gradient-to-b from-[#10141e] via-[#090b10] to-[#090b10] text-center border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-amber-400" /> Royal Matrimonial Digital Studio
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-rose-100 to-amber-300 tracking-tight">
            Design Your Forever Invitation
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            തിരഞ്ഞെടുക്കൂ നിങ്ങളുടെ പ്രിയപ്പെട്ട റോയൽ വെബ്സൈറ്റ് ടെംപ്ലേറ്റ്. ലൈവ് സാമ്പിൾ കണ്ട് ബോധ്യപ്പെട്ട ശേഷം സ്വന്തം വിവരങ്ങൾ നൽകി മിനിറ്റുകൾക്കുള്ളിൽ വെബ്സൈറ്റ് ലൈവ് ആക്കാം!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={fillSampleData}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-full shadow-2xl transition-all flex items-center gap-2 text-sm transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" /> ⚡ 1-Click Fill Sample Data
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-rose-300 border border-rose-500/30 font-semibold rounded-full shadow-lg transition-all flex items-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> 🔄 Reset Form
            </button>
          </div>
        </div>
      </section>

      {/* 2. 10 വെബ്സൈറ്റ് ടെംപ്ലേറ്റുകളുടെ സെലക്ഷൻ ലിസ്റ്റ് */}
      <section className="max-w-6xl mx-auto px-4 mt-12">
        <div className="bg-[#10141e]/90 p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-amber-300">Choose Website Template</h2>
              <p className="text-xs text-slate-400 mt-1">
                "Live Demo Preview" ക്ലിക്ക് ചെയ്ത് സാമ്പിൾ വെബ്സൈറ്റ് പൂർണ്ണമായി കണ്ടുനോക്കൂ!
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1.5 bg-amber-400/10 text-amber-300 rounded-full border border-amber-400/30 self-start sm:self-auto">
              10 Signature Designs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`cursor-pointer rounded-3xl p-5 flex flex-col justify-between border-2 transition-all relative overflow-hidden bg-gradient-to-br ${tpl.color} ${
                  selectedTemplate === tpl.id
                    ? "border-amber-400 ring-4 ring-amber-400/40 shadow-2xl scale-[1.02]"
                    : "border-slate-800/80 opacity-85 hover:opacity-100 hover:border-slate-700"
                }`}
              >
                <div>
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
                  <h3 className="text-xl font-serif font-bold text-white drop-shadow mt-1">{tpl.name}</h3>
                  <p className="text-xs text-white/80 mt-2 line-clamp-2 leading-relaxed">{tpl.desc}</p>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewingTemplate(tpl);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-md border border-white/20 transition hover:scale-105"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" /> Live Demo Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ഡാറ്റാ ഇൻപുട്ട് ഫോം സെക്ഷൻ */}
      <div ref={formRef} className="max-w-4xl mx-auto px-4 mt-14">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* സെലക്ട് ചെയ്ത ടെംപ്ലേറ്റിന്റെ സൂചന */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-serif font-semibold text-amber-200">
              Selected Template: <strong className="text-white underline">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</strong>
            </span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Ready to build
            </span>
          </div>

          {/* മ്യൂസിക് സെലക്ഷൻ & അപ്‌ലോഡ് */}
          <div className="bg-[#10141e]/90 p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-300 flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" /> Background Music & Soundscapes
              </h2>
              <p className="text-xs text-slate-400 mt-1">ലിസ്റ്റിലുള്ള ട്രാക്കുകൾ കേട്ടുനോക്കുകയോ സ്വന്തം MP3 ഫയൽ അപ്‌ലോഡ് ചെയ്യുകയോ ചെയ്യാം</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MUSIC_TRACKS.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedMusic(t.url)}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    selectedMusic === t.url && !customAudioFile ? "bg-amber-500/15 border-amber-400 text-amber-200 ring-1 ring-amber-400/40" : "bg-black/40 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs font-medium pr-2">{t.title}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleTogglePreviewAudio(t.url); }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-amber-300 transition shrink-0"
                  >
                    {playingTrack === t.url ? <Pause className="w-4 h-4 text-rose-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-black/40 rounded-2xl border border-dashed border-amber-500/30">
              <label className="text-xs text-amber-300 font-semibold flex items-center gap-2 mb-1">
                <Upload className="w-4 h-4" /> Or Upload Your Own Wedding Song (MP3 Audio File)
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  setCustomAudioFile(e.target.files[0]);
                  if (audioPlayerRef.current) audioPlayerRef.current.pause();
                  setPlayingTrack(null);
                }}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer"
              />
              {customAudioFile && (
                <p className="text-[11px] text-emerald-400 mt-2 font-medium">✓ Selected: {customAudioFile.name}</p>
              )}
            </div>
          </div>

          {/* ആനിമേഷൻ ഇഫക്റ്റുകൾ */}
          <div className="bg-[#10141e]/90 p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Ambient Floating Animation Effects
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {ANIMATION_EFFECTS.map((eff) => (
                <button
                  type="button"
                  key={eff.id}
                  onClick={() => setSelectedEffect(eff.id)}
                  className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    selectedEffect === eff.id ? "bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 scale-105" : "bg-black/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="text-2xl">{eff.icon}</span>
                  <span className="text-xs font-semibold">{eff.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* കവർ & ഒഫീഷ്യൽ കാർഡ് ഫോട്ടോ */}
          <div className="bg-[#10141e]/90 p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-6">
            <h2 className="text-xl font-serif font-bold text-amber-300">Main Banner & Official Wedding Card</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-400" /> Couple Main Cover Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="w-full p-2.5 bg-black/40 border border-slate-800 rounded-xl text-xs text-slate-400"
                />
                {sampleCoverUrl && !coverFile && (
                  <p className="text-[10px] text-emerald-400 mt-1">✓ High resolution sample banner loaded</p>
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
                  className="w-full p-2.5 bg-black/40 border border-slate-800 rounded-xl text-xs text-slate-400"
                />
                {sampleCardUrl && !cardFile && (
                  <p className="text-[10px] text-emerald-400 mt-1">✓ Sample invitation card photo ready</p>
                )}
              </div>
            </div>
          </div>

          {/* ബ്രൈഡ് & ഗ്രൂം പ്രൊഫൈലുകൾ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bride */}
            <div className="bg-[#10141e]/90 p-6 sm:p-8 rounded-3xl border border-rose-500/30 space-y-4 shadow-xl">
              <h3 className="text-lg font-serif font-bold text-rose-300">Bride Profile (മണവാട്ടി)</h3>
              <div>
                <label className="text-xs text-slate-400">Bride's Full Name *</label>
                <input required name="brideName" value={formData.brideName} onChange={handleChange} placeholder="Merin Thomas" className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none focus:border-rose-400 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Bride's Portrait Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setBridePhotoFile(e.target.files[0])} className="w-full mt-1 p-2 bg-black/40 border border-slate-800 rounded-xl text-xs text-slate-400" />
                {sampleBridePhoto && !bridePhotoFile && <p className="text-[10px] text-emerald-400 mt-1">✓ High resolution portrait ready</p>}
              </div>
              <div>
                <label className="text-xs text-slate-400">Profession / Title</label>
                <input name="brideProfession" value={formData.brideProfession} onChange={handleChange} placeholder="Architect" className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Bride's Parents (മാതാപിതാക്കൾ)</label>
                <input name="brideParents" value={formData.brideParents} onChange={handleChange} placeholder="K. V. Thomas & Susan Thomas" className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">About Bride (ബയോ)</label>
                <textarea rows={2} name="brideBio" value={formData.brideBio} onChange={handleChange} placeholder="A few words about her..." className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Siblings & Family (സഹോദരങ്ങൾ/കുടുംബം)</label>
                <input name="brideFamily" value={formData.brideFamily} onChange={handleChange} placeholder="Elder brother..." className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
            </div>

            {/* Groom */}
            <div className="bg-[#10141e]/90 p-6 sm:p-8 rounded-3xl border border-amber-500/30 space-y-4 shadow-xl">
              <h3 className="text-lg font-serif font-bold text-amber-300">Groom Profile (വരൻ)</h3>
              <div>
                <label className="text-xs text-slate-400">Groom's Full Name *</label>
                <input required name="groomName" value={formData.groomName} onChange={handleChange} placeholder="Joel Thomas" className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none focus:border-amber-400 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Groom's Portrait Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setGroomPhotoFile(e.target.files[0])} className="w-full mt-1 p-2 bg-black/40 border border-slate-800 rounded-xl text-xs text-slate-400" />
                {sampleGroomPhoto && !groomPhotoFile && <p className="text-[10px] text-emerald-400 mt-1">✓ High resolution portrait ready</p>}
              </div>
              <div>
                <label className="text-xs text-slate-400">Profession / Title</label>
                <input name="groomProfession" value={formData.groomProfession} onChange={handleChange} placeholder="Cloud Specialist" className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Groom's Parents (മാതാപിതാക്കൾ)</label>
                <input name="groomParents" value={formData.groomParents} onChange={handleChange} placeholder="Pastor Thomas Joseph & Mrs. Mincy Thomas" className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">About Groom (ബയോ)</label>
                <textarea rows={2} name="groomBio" value={formData.groomBio} onChange={handleChange} placeholder="A few words about him..." className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Siblings & Family (സഹോദരങ്ങൾ/കുടുംബം)</label>
                <input name="groomFamily" value={formData.groomFamily} onChange={handleChange} placeholder="Younger sister..." className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
            </div>
          </div>

          {/* സെറിമണി & ലൊക്കേഷൻ */}
          <div className="bg-[#10141e]/90 p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-6">
            <h2 className="text-xl font-serif font-bold text-amber-300">Ceremony, Muhurtham & Venue</h2>
            <div>
              <label className="text-xs text-slate-400">Together With Families Header *</label>
              <input required name="parentsText" value={formData.parentsText} onChange={handleChange} placeholder="Together with their families" className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Muhurtham Date & Time *</label>
                <input required type="datetime-local" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm text-slate-200" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Venue Name *</label>
                <input required name="venueName" value={formData.venueName} onChange={handleChange} placeholder="Jacobs Entertainments" className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Venue Full Address</label>
                <input name="venueAddress" value={formData.venueAddress} onChange={handleChange} placeholder="Pandappilly, Muvattupuzha, Ernakulam, Kerala" className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" /> Google Maps Link
                </label>
                <input name="mapUrl" value={formData.mapUrl} onChange={handleChange} placeholder="https://maps.google.com/?q=..." className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
            </div>
          </div>

          {/* ഗാലറി ഫോട്ടോകൾ */}
          <div className="bg-[#10141e]/90 p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-4">
            <h2 className="text-xl font-serif font-bold text-amber-300 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-400" /> Couple Memories Gallery
            </h2>
            <div className="p-4 bg-black/40 rounded-2xl border border-dashed border-amber-500/30 text-center">
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200 py-2 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <Plus className="w-4 h-4" /> Click to Add Photos (+ ഫോട്ടോകൾ ചേർക്കുക)
                <input type="file" multiple accept="image/*" onChange={handleAddGalleryFiles} className="hidden" />
              </label>
            </div>

            {(galleryFiles.length > 0 || sampleGalleryUrls.length > 0) && (
              <div className="pt-2">
                <p className="text-xs text-slate-400 mb-3 font-semibold">
                  Selected Moments ({galleryFiles.length + sampleGalleryUrls.length} ഫോട്ടോകൾ):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {galleryFiles.map((file, idx) => (
                    <div key={`file-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700 shadow-md">
                      <img src={URL.createObjectURL(file)} alt="Uploaded" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeGalleryFile(idx)} className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full hover:scale-110">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {sampleGalleryUrls.map((url, idx) => (
                    <div key={`sample-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-amber-500/40 shadow-md">
                      <img src={url} alt="Sample" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setSampleGalleryUrls(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full hover:scale-110">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* കോൺടാക്റ്റ് & വാട്ട്‌സ്ആപ്പ് */}
          <div className="bg-[#10141e]/90 p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-6">
            <h2 className="text-xl font-serif font-bold text-amber-300">Contacts & WhatsApp RSVP</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> Primary WhatsApp Number *
                </label>
                <input required name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="+91 00000 00000" className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-sky-400" /> Contact Email
                </label>
                <input name="email" value={formData.email} onChange={handleChange} placeholder="couple@wedding.xyz" className="w-full mt-1 p-3 bg-black/40 border border-slate-800 rounded-xl outline-none text-sm" />
              </div>
            </div>
          </div>

          {/* സബ്മിറ്റ് ബട്ടൺ */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 hover:brightness-110 text-white font-serif font-bold text-lg rounded-2xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            <Sparkles className="w-6 h-6" />
            {loading ? "Publishing Wedding Website..." : "Generate & Publish Wedding Website"}
          </button>
        </form>
      </div>

      {/* 4. ഫുൾ-സ്ക്രീൻ ലൈവ് സാമ്പിൾ വെബ്സൈറ്റ് പ്രിവ്യൂ മോഡൽ (LIVE DEMO PREVIEW) */}
      {previewingTemplate && (
        <div className="fixed inset-0 z-[200] bg-black overflow-y-auto">
          {/* പ്രിവ്യൂ കൺട്രോൾ ഹെഡർ */}
          <div className="sticky top-0 z-[210] bg-black/85 backdrop-blur-md px-4 py-3 border-b border-amber-500/30 flex items-center justify-between shadow-2xl">
            <button
              onClick={() => setPreviewingTemplate(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" /> ← Back to Form
            </button>
            <div className="text-center hidden sm:block">
              <span className="text-xs uppercase tracking-widest text-amber-300 font-serif font-bold">
                Live Sample Demo: {previewingTemplate.name}
              </span>
            </div>
            <button
              onClick={() => handleSelectFromPreview(previewingTemplate.id)}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
            >
              <Check className="w-4 h-4" /> ✓ Use This Template & Fill Details
            </button>
          </div>

          {/* ഒന്നാമത്തെ ടെംപ്ലേറ്റ് ലൈവ് ആയി റെൻഡർ ചെയ്യുന്നു */}
          {previewingTemplate.id === "template1" ? (
            <TemplateOne data={SAMPLE_DATA} isPreview={true} />
          ) : (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
              <h2 className="text-3xl font-serif text-amber-300">{previewingTemplate.name}</h2>
              <p className="text-sm text-slate-400 max-w-md">ഈ ടെംപ്ലേറ്റിന്റെ പ്രിവ്യൂ ഉടൻ പൂർത്തിയാകും. നിലവിൽ Template 1 പൂർണ്ണമായി റെഡിയാണ്!</p>
              <button
                onClick={() => handleSelectFromPreview(previewingTemplate.id)}
                className="px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Use this Template
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
