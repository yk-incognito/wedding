"use client";
import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { 
  Sparkles, Heart, Upload, Music, Eye, Plus, Trash2, 
  MapPin, Phone, Mail, FileText, Image as ImageIcon, CheckCircle, Play, Pause, X, RotateCcw, Crop, ZoomIn, ZoomOut
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

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
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

  // Cropped Images Base64/URLs for saving
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [cardPhotoUrl, setCardPhotoUrl] = useState("");
  const [bridePhotoUrl, setBridePhotoUrl] = useState("");
  const [groomPhotoUrl, setGroomPhotoUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState([]);

  // Existing Unique ID if editing
  const [existingId, setExistingId] = useState(null);
  const [existingDashId, setExistingDashId] = useState(null);

  // Cropper Modal States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropTarget, setCropTarget] = useState("");
  const [aspectRatio, setAspectRatio] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

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

  // എഡിറ്റ് ചെയ്യുമ്പോൾ മുൻപ് അടിച്ച ഡാറ്റ തിരികെ റീസ്റ്റോർ ചെയ്യുന്നു
  useEffect(() => {
    const activeId = editId || sessionStorage.getItem("last_active_edit_id");
    if (activeId) {
      const savedSession = sessionStorage.getItem(`preview_session_${activeId}`);
      if (savedSession) {
        try {
          const data = JSON.parse(savedSession);
          setExistingId(data.id);
          setExistingDashId(data.dashboard_id);
          setSelectedTemplate(data.template_id || "template1");
          setSelectedEffect(data.background_effect || "petals");
          if (data.music_url) setSelectedMusic(data.music_url);

          setCoverPhotoUrl(data.cover_photo || "");
          setCardPhotoUrl(data.wedding_card_photo || "");
          setBridePhotoUrl(data.bride_photo || "");
          setGroomPhotoUrl(data.groom_photo || "");
          setGalleryUrls(data.gallery_photos || []);

          setFormData({
            brideName: data.bride_name || "",
            brideProfession: data.bride_profession || "",
            brideBio: data.bride_bio || "",
            brideFamily: data.bride_family || "",
            brideParents: data.bride_parents || "",
            groomName: data.groom_name || "",
            groomProfession: data.groom_profession || "",
            groomBio: data.groom_bio || "",
            groomFamily: data.groom_family || "",
            groomParents: data.groom_parents || "",
            parentsText: data.parents_text || "",
            weddingDate: data.wedding_date || "",
            venueName: data.venue_name || "",
            venueAddress: data.venue_address || "",
            mapUrl: data.map_url || "",
            firstMetStory: data.first_met_story || "",
            journeyStory: data.journey_story || "",
            email: data.email || "",
            whatsappNumber: data.whatsapp_number || "",
            liveStreamUrl: data.liveStreamUrl || "",
            upiId: data.upi_id || ""
          });

          if (data.contact_numbers && data.contact_numbers.length > 0) {
            setContacts(data.contact_numbers);
          }
          if (data.custom_sections && data.custom_sections.length > 0) {
            setCustomSections(data.custom_sections);
          }
        } catch (e) {
          console.error("Session restore error:", e);
        }
      }
    }
  }, [editId]);

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTogglePreviewAudio = (url) => {
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
      newAudio.onended = () => setPlayingTrack(null);
    }
  };

  // ക്രോപ്പർ ഫംഗ്ഷനുകൾ
  const triggerCropModal = (file, target, ratio) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageToCrop(e.target.result);
      setCropTarget(target);
      setAspectRatio(ratio);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const drawCropperCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageToCrop) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imageToCrop;
    img.onload = () => {
      const cWidth = canvas.width;
      const cHeight = canvas.height;
      ctx.clearRect(0, 0, cWidth, cHeight);

      let boxW = cWidth - 40;
      let boxH = boxW / aspectRatio;
      if (boxH > cHeight - 40) {
        boxH = cHeight - 40;
        boxW = boxH * aspectRatio;
      }
      const boxX = (cWidth - boxW) / 2;
      const boxY = (cHeight - boxH) / 2;

      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(0, 0, cWidth, cHeight);

      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();

      const baseScale = Math.max(boxW / img.width, boxH / img.height);
      const renderW = img.width * baseScale * zoomLevel;
      const renderH = img.height * baseScale * zoomLevel;
      const renderX = boxX + (boxW - renderW) / 2 + panOffset.x;
      const renderY = boxY + (boxH - renderH) / 2 + panOffset.y;

      ctx.drawImage(img, renderX, renderY, renderW, renderH);
      ctx.restore();

      ctx.strokeStyle = "#c7a36a";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
    };
  }, [imageToCrop, aspectRatio, zoomLevel, panOffset]);

  useEffect(() => {
    if (cropperOpen) {
      drawCropperCanvas();
    }
  }, [cropperOpen, drawCropperCanvas]);

  const handleSaveCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageToCrop) return;

    let boxW = canvas.width - 40;
    let boxH = boxW / aspectRatio;
    if (boxH > canvas.height - 40) {
      boxH = canvas.height - 40;
      boxW = boxH * aspectRatio;
    }
    const boxX = (canvas.width - boxW) / 2;
    const boxY = (canvas.height - boxH) / 2;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = 800;
    outCanvas.height = 800 / aspectRatio;
    const outCtx = outCanvas.getContext("2d");

    outCtx.drawImage(canvas, boxX, boxY, boxW, boxH, 0, 0, outCanvas.width, outCanvas.height);
    const croppedDataUrl = outCanvas.toDataURL("image/jpeg", 0.9);

    if (cropTarget === "cover") setCoverPhotoUrl(croppedDataUrl);
    if (cropTarget === "card") setCardPhotoUrl(croppedDataUrl);
    if (cropTarget === "bride") setBridePhotoUrl(croppedDataUrl);
    if (cropTarget === "groom") setGroomPhotoUrl(croppedDataUrl);
    if (cropTarget === "gallery") setGalleryUrls((prev) => [...prev, croppedDataUrl]);

    setCropperOpen(false);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

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

    setCoverPhotoUrl("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80");
    setCardPhotoUrl("https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=800&q=80");
    setBridePhotoUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80");
    setGroomPhotoUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80");
    setGalleryUrls([
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
      sessionStorage.clear();
      setExistingId(null);
      setExistingDashId(null);
      setFormData({
        brideName: "", brideProfession: "", brideBio: "", brideFamily: "", brideParents: "",
        groomName: "", groomProfession: "", groomBio: "", groomFamily: "", groomParents: "",
        parentsText: "", weddingDate: "", venueName: "", venueAddress: "", mapUrl: "",
        firstMetStory: "", journeyStory: "", email: "", whatsappNumber: "", liveStreamUrl: "", upiId: ""
      });
      setCoverPhotoUrl("");
      setCardPhotoUrl("");
      setBridePhotoUrl("");
      setGroomPhotoUrl("");
      setGalleryUrls([]);
      setContacts([{ name: "Family Coordinator", phone: "" }]);
      setCustomSections([]);
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setPlayingTrack(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.brideName.trim() || !formData.groomName.trim()) {
      alert("ദയവായി വധുവിന്റെയും വരന്റെയും പേരുകൾ നൽകുക.");
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    setLoading(true);

    try {
      const cleanBride = formData.brideName.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "bride";
      const cleanGroom = formData.groomName.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "groom";
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      
      const publicId = existingId || `${cleanGroom}-weds-${cleanBride}-${randomSuffix}`;
      const dashboardId = existingDashId || `${cleanGroom}-${cleanBride}-adm-${Math.random().toString(36).substring(2, 10)}`;

      const invitationData = {
        id: publicId,
        dashboard_id: dashboardId,
        is_paid: false,
        template_id: selectedTemplate,
        background_effect: selectedEffect,
        music_url: selectedMusic,
        cover_photo: coverPhotoUrl || null,
        wedding_card_photo: cardPhotoUrl || null,
        bride_name: formData.brideName.trim(),
        bride_profession: formData.brideProfession.trim() || null,
        bride_bio: formData.brideBio.trim() || null,
        bride_family: formData.brideFamily.trim() || null,
        bride_parents: formData.brideParents.trim() || null,
        bride_photo: bridePhotoUrl || null,
        groom_name: formData.groomName.trim(),
        groom_profession: formData.groomProfession.trim() || null,
        groom_bio: formData.groomBio.trim() || null,
        groom_family: formData.groomFamily.trim() || null,
        groom_parents: formData.groomParents.trim() || null,
        groom_photo: groomPhotoUrl || null,
        parents_text: formData.parentsText.trim() || null,
        wedding_date: formData.weddingDate || null,
        venue_name: formData.venueName.trim() || null,
        venue_address: formData.venueAddress.trim() || null,
        map_url: formData.mapUrl.trim() || null,
        first_met_story: formData.firstMetStory.trim() || null,
        journey_story: formData.journeyStory.trim() || null,
        email: formData.email.trim() || null,
        whatsapp_number: formData.whatsappNumber.trim() || null,
        live_stream_url: formData.liveStreamUrl.trim() || null,
        upi_id: formData.upiId.trim() || null,
        contact_numbers: contacts.filter(c => c.name?.trim() || c.phone?.trim()),
        gallery_photos: galleryUrls,
        custom_sections: customSections.filter(s => s.title?.trim() || s.content?.trim())
      };

      const { error: upsertError } = await supabase.from("invitations").upsert([invitationData]);
      if (upsertError) throw upsertError;

      sessionStorage.setItem(`preview_session_${publicId}`, JSON.stringify(invitationData));
      sessionStorage.setItem("last_active_edit_id", publicId);

      router.push(`/preview/${publicId}?auth_dash=${dashboardId}`);
    } catch (err) {
      alert("Submission error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2c2416] pb-32 relative font-sans selection:bg-[#c7a36a] selection:text-white">
      <section className="pt-20 pb-16 px-4 bg-gradient-to-b from-white via-[#fcfbf9] to-[#faf8f5] text-center border-b border-[#e9dfce]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#f3ede2] border border-[#d9caa9] text-[#7a5716] text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-[#c7a36a]" /> Royal Matrimonial Digital Studio
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#54101a] via-[#8d2740] to-[#c7a36a] tracking-tight">
            Design Your Forever Story
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-serif">
            Create an enchanting, high-fashion wedding invitation website. Crop and fit your photos perfectly, preview live, and publish in minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={fillSampleData}
              className="px-8 py-3.5 bg-gradient-to-r from-[#54101a] to-[#7f2639] hover:brightness-110 text-white font-bold rounded-full shadow-xl transition-all flex items-center gap-2 text-sm transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#c7a36a]" /> ⚡ 1-Click Fill Sample Data
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3.5 bg-white hover:bg-stone-100 text-rose-700 border border-rose-200 font-semibold rounded-full shadow-md transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> 🔄 Reset Form
            </button>
          </div>
        </div>
      </section>

      <div ref={formRef} className="max-w-4xl mx-auto px-4 mt-12">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* 1. മ്യൂസിക് */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#54101a] flex items-center gap-2">
                <Music className="w-5 h-5 text-[#c7a36a]" /> 1. Background Music
              </h2>
              <p className="text-xs text-stone-500 mt-1 font-serif">ഇഷ്ടപ്പെട്ട പാട്ട് തിരഞ്ഞെടുക്കുക</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MUSIC_TRACKS.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedMusic(t.url)}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    selectedMusic === t.url
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
          </div>

          {/* 2. ഫോട്ടോ അപ്‌ലോഡ് & ക്രോപ്പർ (Cover & Official Card) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">2. Main Banner & Official Wedding Card (With Cropper)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700 flex items-center justify-between">
                  <span>Couple Cover Photo (16:9 Landscape)</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Auto Crop 16:9</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) triggerCropModal(e.target.files[0], "cover", 16 / 9);
                  }}
                  className="w-full p-2.5 bg-[#fcfbf9] border border-stone-200 rounded-xl text-xs text-stone-600"
                />
                {coverPhotoUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[#c7a36a] mt-2 shadow-sm">
                    <img src={coverPhotoUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setCoverPhotoUrl("")} className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700 flex items-center justify-between">
                  <span>Official Wedding Card (Vertical / Portrait)</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Auto Crop 3:4</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) triggerCropModal(e.target.files[0], "card", 3 / 4);
                  }}
                  className="w-full p-2.5 bg-[#fcfbf9] border border-stone-200 rounded-xl text-xs text-stone-600"
                />
                {cardPhotoUrl && (
                  <div className="relative aspect-[3/4] max-h-48 rounded-xl overflow-hidden border border-[#c7a36a] mt-2 shadow-sm">
                    <img src={cardPhotoUrl} alt="Card Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setCardPhotoUrl("")} className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* 3. ബ്രൈഡ് & ഗ്രൂം പ്രൊഫൈലുകൾ (With 1:1 Square Cropper) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bride */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-sm space-y-4">
              <h3 className="text-lg font-serif font-bold text-rose-800">Bride Profile (മണവാട്ടി)</h3>
              <div>
                <label className="text-xs font-semibold text-stone-600">Bride's Full Name *</label>
                <input required name="brideName" value={formData.brideName} onChange={handleChange} placeholder="Merin" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none focus:border-rose-400 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 flex items-center justify-between">
                  <span>Bride's Portrait Photo</span>
                  <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Square Crop 1:1</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) triggerCropModal(e.target.files[0], "bride", 1);
                  }}
                  className="w-full mt-1 p-2 bg-[#fcfbf9] border border-stone-200 rounded-xl text-xs text-stone-600"
                />
                {bridePhotoUrl && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-rose-400 mt-2 mx-auto shadow-sm">
                    <img src={bridePhotoUrl} alt="Bride" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setBridePhotoUrl("")} className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Profession / Title</label>
                <input name="brideProfession" value={formData.brideProfession} onChange={handleChange} placeholder="Architect" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Bride's Parents</label>
                <input name="brideParents" value={formData.brideParents} onChange={handleChange} placeholder="K. V. Thomas & Susan Thomas" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">About Bride / Bio</label>
                <textarea rows={2} name="brideBio" value={formData.brideBio} onChange={handleChange} placeholder="A few words about her..." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Siblings & Family</label>
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
                <label className="text-xs font-semibold text-stone-600 flex items-center justify-between">
                  <span>Groom's Portrait Photo</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Square Crop 1:1</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) triggerCropModal(e.target.files[0], "groom", 1);
                  }}
                  className="w-full mt-1 p-2 bg-[#fcfbf9] border border-stone-200 rounded-xl text-xs text-stone-600"
                />
                {groomPhotoUrl && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400 mt-2 mx-auto shadow-sm">
                    <img src={groomPhotoUrl} alt="Groom" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setGroomPhotoUrl("")} className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Profession / Title</label>
                <input name="groomProfession" value={formData.groomProfession} onChange={handleChange} placeholder="Cloud Specialist" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Groom's Parents</label>
                <input name="groomParents" value={formData.groomParents} onChange={handleChange} placeholder="Pastor Thomas Joseph & Mrs. Mincy Thomas" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">About Groom / Bio</label>
                <textarea rows={2} name="groomBio" value={formData.groomBio} onChange={handleChange} placeholder="A few words about him..." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Siblings & Family</label>
                <input name="groomFamily" value={formData.groomFamily} onChange={handleChange} placeholder="Younger sister Sharon..." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
            </div>

          </div>

          {/* 4. സെറിമണി, തീയതി & വേദി */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">4. Ceremony, Muhurtham & Venue</h2>
            <div>
              <label className="text-xs font-semibold text-stone-600">Together With Families Header</label>
              <input name="parentsText" value={formData.parentsText} onChange={handleChange} placeholder="Together with their families" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-600">Muhurtham Date & Time</label>
                <input type="datetime-local" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm text-stone-800" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600">Venue Name</label>
                <input name="venueName" value={formData.venueName} onChange={handleChange} placeholder="Jacobs Entertainments" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-600">Venue Full Address</label>
                <input name="venueAddress" value={formData.venueAddress} onChange={handleChange} placeholder="Pandappilly, Muvattupuzha, Ernakulam, Kerala" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-600" /> Google Maps Link (Auto QR Code Generated)
                </label>
                <input name="mapUrl" value={formData.mapUrl} onChange={handleChange} placeholder="https://maps.google.com/?q=..." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
            </div>
          </div>

          {/* 5. സ്റ്റോറി & വേഴ്സ് */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">5. Promise & Love Story</h2>
            <div>
              <label className="text-xs font-semibold text-stone-600">Bible Verse / Special Quote / First Met</label>
              <textarea rows={2} name="firstMetStory" value={formData.firstMetStory} onChange={handleChange} placeholder="This is the Lord’s doing; it is marvellous in our eyes." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600">Welcome Intro / Journey Summary</label>
              <textarea rows={2} name="journeyStory" value={formData.journeyStory} onChange={handleChange} placeholder="With hearts full of gratitude, we invite you to witness the beginning of our forever." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
            </div>
          </div>

          {/* 6. ഗാലറി ഫോട്ടോകൾ (With 4:5 Magazine Ratio Cropper) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#54101a] flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#c7a36a]" /> 6. Story Gallery (With Cropper)
              </h2>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Portrait Crop 4:5</span>
            </div>
            <div className="p-4 bg-[#fcfbf9] rounded-2xl border border-dashed border-[#d9caa9] text-center">
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#7a5716] py-2.5 px-5 rounded-xl bg-[#f3ede2] border border-[#d9caa9] hover:bg-[#e8decd] shadow-sm">
                <Plus className="w-4 h-4" /> Add & Crop Photo (+ ഫോട്ടോ ചേർക്കുക)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) triggerCropModal(e.target.files[0], "gallery", 4 / 5);
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {galleryUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {galleryUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-[4/5] rounded-xl overflow-hidden border border-stone-300 shadow">
                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. കോൺടാക്റ്റ് & വാട്ട്‌സ്ആപ്പ് */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">7. Contacts & WhatsApp Wishes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" /> WhatsApp Number
                </label>
                <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="+91 00000 00000" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-sky-600" /> Contact Email
                </label>
                <input name="email" value={formData.email} onChange={handleChange} placeholder="couple@wedding.xyz" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl outline-none text-sm" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-stone-600">Family Coordinators</label>
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

          {/* 8. കസ്റ്റം സെക്ഷനുകൾ */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">8. Extra Custom Sections</h2>
            <p className="text-xs text-stone-500">സംഗീത്, ഡ്രസ്സ് കോഡ് തുടങ്ങിയ വിവരങ്ങൾ നൽകാം.</p>
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

          {/* 9. ലൈവ് സ്ട്രീം & UPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e4d7c0]">
              <label className="text-xs font-semibold text-stone-600">YouTube Live Stream URL</label>
              <input name="liveStreamUrl" value={formData.liveStreamUrl} onChange={handleChange} placeholder="https://youtube.com/live/..." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm outline-none" />
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#e4d7c0]">
              <label className="text-xs font-semibold text-stone-600">UPI ID for Gifting</label>
              <input name="upiId" value={formData.upiId} onChange={handleChange} placeholder="name@upi" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm outline-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-[#54101a] via-[#8d2740] to-[#c7a36a] hover:brightness-110 text-white font-serif font-bold text-lg rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-amber-200" />
            {loading ? "Generating Live Preview..." : "Save & Preview Wedding Website"}
          </button>
        </form>
      </div>

      {/* ഇമേജ് ക്രോപ്പർ മോഡൽ */}
      {cropperOpen && (
        <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1c0a0f] border border-[#c7a36a] rounded-3xl p-5 max-w-lg w-full text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif font-bold text-amber-200 flex items-center gap-2 text-sm sm:text-base">
                <Crop className="w-4 h-4 text-[#c7a36a]" /> Crop & Adjust Photo
              </h3>
              <button onClick={() => setCropperOpen(false)} className="p-1 rounded-full hover:bg-white/10 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-stone-400">
              ഫോട്ടോ മൗസ് ഉപയോഗിച്ച് ഡ്രാഗ് ചെയ്ത് അഡ്ജസ്റ്റ് ചെയ്യാം. സൂം ചെയ്യാൻ സ്ലൈഡർ ഉപയോഗിക്കുക.
            </p>

            <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden flex items-center justify-center cursor-move select-none border border-white/15">
              <canvas
                ref={canvasRef}
                width={450}
                height={450}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <ZoomOut className="w-4 h-4 text-stone-400" />
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-full accent-[#c7a36a] cursor-pointer"
              />
              <ZoomIn className="w-4 h-4 text-amber-300" />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCropperOpen(false)}
                className="w-1/2 py-2.5 bg-white/10 hover:bg-white/20 text-stone-300 font-semibold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                className="w-1/2 py-2.5 bg-[#c7a36a] hover:bg-amber-300 text-black font-bold rounded-xl text-xs transition shadow-md"
              >
                Apply & Save Crop
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

// Next.js useSearchParams()-നുള്ള സുരക്ഷിതമായ Suspense Wrapper
export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center text-[#54101a] font-serif text-lg">
        Loading Wedding Studio...
      </div>
    }>
      <BuilderContent />
    </Suspense>
  );
}
