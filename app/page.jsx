"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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

export default function BuilderPage() {
  const router = useRouter();
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [playingTrack, setPlayingTrack] = useState(null);
  const audioPlayerRef = useRef(null);

  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [selectedMusic, setSelectedMusic] = useState(MUSIC_TRACKS[0].url);
  const [customAudioName, setCustomAudioName] = useState("");
  const [selectedEffect, setSelectedEffect] = useState("petals");

  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [cardPhotoUrl, setCardPhotoUrl] = useState("");
  const [bridePhotoUrl, setBridePhotoUrl] = useState("");
  const [groomPhotoUrl, setGroomPhotoUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState([]);

  const [existingId, setExistingId] = useState(null);
  const [existingDashId, setExistingDashId] = useState(null);

  // ക്രോപ്പർ മോഡൽ സ്റ്റേറ്റുകൾ
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

  // ഡാറ്റ സുരക്ഷിതമായി ഫോമിലേക്ക് റീ-ഫിൽ ചെയ്യൽ (Supabase + LocalSession fallback)
  const applyDataToForm = (data) => {
    setExistingId(data.id);
    setExistingDashId(data.dashboard_id);
    setSelectedTemplate(data.template_id || "template1");
    setSelectedEffect(data.background_effect || "petals");
    if (data.music_url) {
      setSelectedMusic(data.music_url);
      if (!MUSIC_TRACKS.some(t => t.url === data.music_url)) {
        setCustomAudioName("Custom Audio Track");
      }
    }

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
      liveStreamUrl: data.live_stream_url || "",
      upiId: data.upi_id || ""
    });

    if (data.contact_numbers && data.contact_numbers.length > 0) {
      setContacts(data.contact_numbers);
    }
    if (data.custom_sections && data.custom_sections.length > 0) {
      setCustomSections(data.custom_sections);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit");
    const activeId = editId || sessionStorage.getItem("last_active_edit_id");

    if (activeId) {
      // 1. ആദ്യം Supabase-ൽ നിന്ന് ഡാറ്റ എടുക്കാൻ ശ്രമിക്കുന്നു (Quota limit ബാധിക്കില്ല)
      supabase
        .from("invitations")
        .select("*")
        .eq("id", activeId)
        .single()
        .then(({ data, error }) => {
          if (data && !error) {
            applyDataToForm(data);
          } else {
            // ബാക്കപ്പായി sessionStorage പരിശോധിക്കുന്നു
            const savedSession = sessionStorage.getItem(`preview_session_${activeId}`);
            if (savedSession) {
              try {
                applyDataToForm(JSON.parse(savedSession));
              } catch (e) {
                console.warn(e);
              }
            }
          }
        });
    }
  }, []);

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
      newAudio.play().catch((e) => console.warn("Audio play error:", e));
      newAudio.onended = () => setPlayingTrack(null);
    }
  };

  // സ്വന്തം ഓഡിയോ അപ്‌ലോഡ്
  const handleCustomAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomAudioName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const audioDataUrl = uploadEvent.target.result;
      setSelectedMusic(audioDataUrl);
      handleTogglePreviewAudio(audioDataUrl);
    };
    reader.readAsDataURL(file);
  };

  // ഇമേജ് ക്രോപ്പർ ട്രിഗർ
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

      let boxW = cWidth - 20;
      let boxH = boxW / aspectRatio;
      if (boxH > cHeight - 20) {
        boxH = cHeight - 20;
        boxW = boxH * aspectRatio;
      }
      const boxX = (cWidth - boxW) / 2;
      const boxY = (cHeight - boxH) / 2;

      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
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
      ctx.lineWidth = 2;
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

    let boxW = canvas.width - 20;
    let boxH = boxW / aspectRatio;
    if (boxH > canvas.height - 20) {
      boxH = canvas.height - 20;
      boxW = boxH * aspectRatio;
    }
    const boxX = (canvas.width - boxW) / 2;
    const boxY = (canvas.height - boxH) / 2;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = 800;
    outCanvas.height = 800 / aspectRatio;
    const outCtx = outCanvas.getContext("2d");

    outCtx.drawImage(canvas, boxX, boxY, boxW, boxH, 0, 0, outCanvas.width, outCanvas.height);
    const croppedDataUrl = outCanvas.toDataURL("image/jpeg", 0.85);

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
      if (typeof window !== "undefined") sessionStorage.clear();
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
      setCustomAudioName("");
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

      // 1. Supabase-ലേക്ക് പൂർണ്ണ ഡാറ്റ സേവ് ചെയ്യുന്നു (No Quota Limit here)
      const { error: upsertError } = await supabase.from("invitations").upsert([invitationData]);
      if (upsertError) throw upsertError;

      // 2. QuotaExceededError പൂർണ്ണമായി തടയുന്ന സേഫ് സെഷൻ സ്റ്റോറേജ്
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("last_active_edit_id", publicId);
          sessionStorage.setItem(`preview_session_${publicId}`, JSON.stringify(invitationData));
        } catch (quotaErr) {
          console.warn("Storage Quota reached for base64 images. Saving essentials only:", quotaErr);
          // ക്വോട്ട തീർന്നാൽ വലിയ ഇമേജ് സ്ട്രിംഗുകൾ ഒഴിവാക്കി ബാക്കി സുരക്ഷിതമായി സൂക്ഷിക്കുന്നു
          try {
            const lightData = { ...invitationData, cover_photo: null, wedding_card_photo: null, bride_photo: null, groom_photo: null, gallery_photos: [] };
            sessionStorage.setItem(`preview_session_${publicId}`, JSON.stringify(lightData));
          } catch (e) {
            // ഇതും കഴിഞ്ഞാൽ ഒന്നും ചെയ്യാതെ Supabase-നെ ആശ്രയിക്കുന്നു
          }
        }
      }

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
            Create an enchanting wedding invitation website with high-fashion aesthetics.
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

          {/* 1. മ്യൂസിക് & സ്വന്തം ഓഡിയോ അപ്‌ലോഡ് ഓപ്ഷൻ */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#54101a] flex items-center gap-2">
                <Music className="w-5 h-5 text-[#c7a36a]" /> 1. Background Music
              </h2>
              <p className="text-xs text-stone-500 mt-1 font-serif">താഴെ നൽകിയിരിക്കുന്ന പാട്ടുകളിൽ ഒന്ന് തിരഞ്ഞെടുക്കുക, അല്ലെങ്കിൽ സ്വന്തമായി പാട്ട് അപ്‌ലോഡ് ചെയ്യുക:</p>
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

            {/* സ്വന്തം പാട്ട് അപ്‌ലോഡ് ചെയ്യാനും പ്ലേ ചെയ്യാനുമുള്ള ബോക്സ് */}
            <div className="p-4 bg-[#fcfbf9] border border-dashed border-[#d9caa9] rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold text-[#7a5716] flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#c7a36a]" /> Upload Your Own Song / സ്വന്തം പാട്ട് തിരഞ്ഞെടുക്കുക:
                  </label>
                  <p className="text-[11px] text-stone-500">നിങ്ങളുടെ ഫോണിലോ കമ്പ്യൂട്ടറിലോ ഉള്ള ഓഡിയോ (MP3) ഫയൽ തിരഞ്ഞെടുക്കാം.</p>
                </div>
                
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 hover:border-[#c7a36a] text-xs font-semibold text-[#54101a] rounded-xl shadow-sm transition shrink-0">
                  <Upload className="w-3.5 h-3.5" /> Choose Audio File
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleCustomAudioUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {customAudioName && (
                <div className="flex items-center justify-between p-3 bg-[#faf4ea] border border-[#c7a36a] rounded-xl text-xs font-semibold text-[#54101a]">
                  <span className="truncate pr-2">🎵 {customAudioName} (Selected)</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePreviewAudio(selectedMusic)}
                    className="p-2 bg-white border border-[#c7a36a]/50 rounded-lg text-[#54101a] shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    {playingTrack === selectedMusic ? (
                      <><Pause className="w-3.5 h-3.5 text-rose-600" /> Pause</>
                    ) : (
                      <><Play className="w-3.5 h-3.5 text-emerald-600" /> Play</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. ബാനർ & ഒഫീഷ്യൽ കാർഡ് അപ്‌ലോഡ് */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">2. Main Banner & Official Wedding Card</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">Couple Cover Photo (16:9)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) triggerCropModal(e.target.files[0], "cover", 16 / 9);
                  }}
                  className="w-full p-2.5 bg-[#fcfbf9] border border-stone-200 rounded-xl text-xs text-stone-600"
                />
                {coverPhotoUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[#c7a36a] mt-2">
                    <img src={coverPhotoUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setCoverPhotoUrl("")} className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">Official Wedding Card (Vertical)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) triggerCropModal(e.target.files[0], "card", 3 / 4);
                  }}
                  className="w-full p-2.5 bg-[#fcfbf9] border border-stone-200 rounded-xl text-xs text-stone-600"
                />
                {cardPhotoUrl && (
                  <div className="relative aspect-[3/4] max-h-48 rounded-xl overflow-hidden border border-[#c7a36a] mt-2">
                    <img src={cardPhotoUrl} alt="Card Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setCardPhotoUrl("")} className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. വരന്റെയും വധുവിന്റെയും വിവരങ്ങൾ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-sm space-y-4">
              <h3 className="text-lg font-serif font-bold text-rose-800">Bride Profile</h3>
              <input required name="brideName" value={formData.brideName} onChange={handleChange} placeholder="Bride's Name *" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && triggerCropModal(e.target.files[0], "bride", 1)} className="w-full text-xs" />
              {bridePhotoUrl && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-rose-400 mx-auto">
                  <img src={bridePhotoUrl} alt="Bride" className="w-full h-full object-cover" />
                </div>
              )}
              <input name="brideProfession" value={formData.brideProfession} onChange={handleChange} placeholder="Profession" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              <input name="brideParents" value={formData.brideParents} onChange={handleChange} placeholder="Parents" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              <textarea rows={2} name="brideBio" value={formData.brideBio} onChange={handleChange} placeholder="Bio" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              <input name="brideFamily" value={formData.brideFamily} onChange={handleChange} placeholder="Family / Siblings" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-sm space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#7a5716]">Groom Profile</h3>
              <input required name="groomName" value={formData.groomName} onChange={handleChange} placeholder="Groom's Name *" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && triggerCropModal(e.target.files[0], "groom", 1)} className="w-full text-xs" />
              {groomPhotoUrl && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400 mx-auto">
                  <img src={groomPhotoUrl} alt="Groom" className="w-full h-full object-cover" />
                </div>
              )}
              <input name="groomProfession" value={formData.groomProfession} onChange={handleChange} placeholder="Profession" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              <input name="groomParents" value={formData.groomParents} onChange={handleChange} placeholder="Parents" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              <textarea rows={2} name="groomBio" value={formData.groomBio} onChange={handleChange} placeholder="Bio" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              <input name="groomFamily" value={formData.groomFamily} onChange={handleChange} placeholder="Family / Siblings" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
            </div>
          </div>

          {/* 4. സെറിമണി & വേദി */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">3. Ceremony & Venue</h2>
            <input name="parentsText" value={formData.parentsText} onChange={handleChange} placeholder="Together with their families" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="datetime-local" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              <input name="venueName" value={formData.venueName} onChange={handleChange} placeholder="Venue Name" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
            </div>
            <input name="venueAddress" value={formData.venueAddress} onChange={handleChange} placeholder="Venue Full Address" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
            <input name="mapUrl" value={formData.mapUrl} onChange={handleChange} placeholder="Google Maps URL" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
          </div>

          {/* 5. സ്റ്റോറി & പ്രോമിസ് */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">4. Story & Promise</h2>
            <textarea rows={2} name="firstMetStory" value={formData.firstMetStory} onChange={handleChange} placeholder="Verse or Quote" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
            <textarea rows={2} name="journeyStory" value={formData.journeyStory} onChange={handleChange} placeholder="Journey / Intro Story" className="w-full p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
          </div>

          {/* 6. ഗാലറി */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">5. Gallery (4:5 Crop)</h2>
            <label className="cursor-pointer inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#7a5716] py-2.5 px-5 rounded-xl bg-[#f3ede2] border border-[#d9caa9]">
              <Plus className="w-4 h-4" /> Add & Crop Photo
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && triggerCropModal(e.target.files[0], "gallery", 4 / 5)} className="hidden" />
            </label>
            {galleryUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {galleryUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-[4/5] rounded-xl overflow-hidden border">
                    <img src={url} alt={`Gal ${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== idx))} className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. ലൈവ് സ്ട്രീം & UPI ഗിഫ്റ്റിങ് */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">6. Live Streaming & UPI Gifting (Optional)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700">YouTube Live Stream URL</label>
                <input name="liveStreamUrl" value={formData.liveStreamUrl} onChange={handleChange} placeholder="https://youtube.com/live/..." className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700">UPI ID for Gifting (Generates QR Code)</label>
                <input name="upiId" value={formData.upiId} onChange={handleChange} placeholder="yourname@okhdfcbank" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              </div>
            </div>
          </div>

          {/* 8. കോൺടാക്റ്റുകൾ */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">7. Event Coordinators & Contacts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700">WhatsApp Number</label>
                <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="+91 00000 00000" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700">Email Address</label>
                <input name="email" value={formData.email} onChange={handleChange} placeholder="couple@wedding.xyz" className="w-full mt-1 p-3 bg-[#fcfbf9] border border-stone-200 rounded-xl text-sm" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
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

          {/* 9. കസ്റ്റം സെക്ഷനുകൾ */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e4d7c0] shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#54101a]">8. Extra Custom Sections</h2>
            {customSections.map((sec, idx) => (
              <div key={idx} className="p-4 bg-[#fcfbf9] rounded-2xl border border-stone-200 space-y-2 relative">
                <button type="button" onClick={() => setCustomSections(customSections.filter((_, i) => i !== idx))} className="absolute top-3 right-3 text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </button>
                <input value={sec.title} placeholder="Title (e.g. Traditional Sangeeth)" onChange={(e) => {
                  const up = [...customSections];
                  up[idx].title = e.target.value;
                  setCustomSections(up);
                }} className="w-full p-2 bg-white border border-stone-200 rounded-xl text-sm font-semibold" />
                <textarea rows={2} value={sec.content} placeholder="Details..." onChange={(e) => {
                  const up = [...customSections];
                  up[idx].content = e.target.value;
                  setCustomSections(up);
                }} className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs" />
              </div>
            ))}
            <button type="button" onClick={() => setCustomSections([...customSections, { title: "", content: "" }])} className="text-xs text-[#7a5716] font-semibold hover:underline flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> + Add Section
            </button>
          </div>

          {/* സബ്മിറ്റ് ബട്ടൺ */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-[#54101a] via-[#8d2740] to-[#c7a36a] text-white font-serif font-bold text-lg rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-amber-200" />
            {loading ? "Generating Live Preview..." : "Save & Preview Wedding Website"}
          </button>
        </form>
      </div>

      {/* ക്രോപ്പർ മോഡൽ */}
      {cropperOpen && (
        <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="bg-[#1c0a0f] border border-[#c7a36a] rounded-2xl p-4 max-w-sm w-full text-white shadow-2xl flex flex-col max-h-[82vh]">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 shrink-0">
              <h3 className="font-serif font-bold text-amber-200 flex items-center gap-2 text-sm">
                <Crop className="w-4 h-4 text-[#c7a36a]" /> Crop & Adjust Photo
              </h3>
              <button 
                type="button" 
                onClick={() => setCropperOpen(false)} 
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 space-y-2">
              <p className="text-[11px] text-stone-400">
                ഫോട്ടോ മൗസ് ഉപയോഗിച്ച് ഡ്രാഗ് ചെയ്ത് അഡ്ജസ്റ്റ് ചെയ്യുക.
              </p>

              <div className="relative w-full h-[200px] bg-black rounded-xl overflow-hidden flex items-center justify-center cursor-move border border-white/15">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={340}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <ZoomOut className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <input 
                  type="range" 
                  min="0.8" 
                  max="3" 
                  step="0.05" 
                  value={zoomLevel} 
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))} 
                  className="w-full accent-[#c7a36a] cursor-pointer h-1.5" 
                />
                <ZoomIn className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-white/10 shrink-0 mt-2">
              <button 
                type="button" 
                onClick={() => setCropperOpen(false)} 
                className="w-1/2 py-2 bg-white/10 hover:bg-white/20 text-stone-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveCrop} 
                className="w-1/2 py-2 bg-[#c7a36a] hover:bg-amber-300 text-black font-bold rounded-xl text-xs shadow-md cursor-pointer"
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
