"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import TemplateOne from "../../../components/templates/TemplateOne";

export default function InviteViewPage() {
  const params = useParams();
  const id = params?.id;

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishes, setWishes] = useState([]);
  const [wishLoading, setWishLoading] = useState(false);

  const isSampleDemo = id === "sample-demo";

  useEffect(() => {
    if (!id) return;

    if (isSampleDemo) {
      setInvitation({
        template_id: "template1",
        bride_name: "Merin",
        bride_profession: "Architect & Spatial Designer",
        bride_bio: "A lover of heritage homes, morning filter coffee, and quiet rainy evenings.",
        bride_family: "Elder brother Dr. Kevin & Sister-in-law Riya",
        bride_parents: "K. V. Thomas & Susan Thomas",
        bride_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        groom_name: "Joel",
        groom_profession: "Cloud Security Specialist",
        groom_bio: "Passionate about football, landscape photography, and long hill-country drives.",
        groom_family: "Younger sister Sharon & Grandparents",
        groom_parents: "Pastor Thomas Joseph & Mrs. Mincy Thomas",
        groom_photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        parents_text: "Together with their families",
        wedding_date: "2026-10-21T10:30",
        venue_name: "Jacobs Entertainments",
        venue_address: "Pandappilly, Muvattupuzha, Ernakulam, Kerala",
        map_url: "https://maps.google.com/?q=Muvattupuzha",
        first_met_story: "This is the Lord’s doing; it is marvellous in our eyes.",
        journey_story: "With hearts full of gratitude, we invite you to witness the beginning of our forever.",
        email: "joel.merin.wedding@gmail.com",
        whatsapp_number: "+91 00000 00000",
        cover_photo: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
        wedding_card_photo: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=800&q=80",
        gallery_photos: [
          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80"
        ],
        music_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        contact_numbers: [
          { name: "Bride Family Coordinator", phone: "+91 00000 00001" },
          { name: "Groom Family Coordinator", phone: "+91 01234 56789" }
        ],
        custom_sections: [
          { title: "Traditional Sangeeth & Henna Soirée", content: "Join us on the eve of the wedding, October 20th at 6:30 PM with ethnic festive attire and musical merriment." }
        ]
      });
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const { data, error } = await supabase
          .from("invitations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) setInvitation(data);

        // Load Wishes
        const { data: wishesData } = await supabase
          .from("guest_wishes")
          .select("*")
          .eq("invitation_id", id)
          .order("created_at", { ascending: false });

        if (wishesData) setWishes(wishesData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, isSampleDemo]);

  // RSVP Handler
  const handleRsvpSubmit = async (rsvpName, rsvpGuests) => {
    if (isSampleDemo) return { success: true };
    const { error } = await supabase.from("rsvps").insert([
      { invitation_id: id, guest_name: rsvpName, guest_count: parseInt(rsvpGuests, 10), attending: true }
    ]);
    if (error) {
      alert("Error submitting RSVP: " + error.message);
      return { success: false };
    }
    return { success: true };
  };

  // Wishes Handler
  const handleWishSubmit = async (name, message) => {
    setWishLoading(true);
    if (isSampleDemo) {
      setWishes([{ guest_name: name, message: message, created_at: new Date().toISOString() }, ...wishes]);
      setWishLoading(false);
      return { success: true };
    }

    const { error } = await supabase.from("guest_wishes").insert([
      { invitation_id: id, guest_name: name, message: message }
    ]);

    if (!error) {
      setWishes([{ guest_name: name, message: message, created_at: new Date().toISOString() }, ...wishes]);
    }
    setWishLoading(false);
    return { success: !error };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#16090c] flex items-center justify-center text-[#c7a36a] font-serif text-lg tracking-widest">
        OPENING ROYAL INVITATION...
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-[#16090c] flex items-center justify-center text-rose-300 font-serif">
        Invitation not found
      </div>
    );
  }

  return (
    <TemplateOne
      invitation={invitation}
      onRsvpSubmit={handleRsvpSubmit}
      onWishSubmit={handleWishSubmit}
      wishes={wishes}
      wishLoading={wishLoading}
      isSampleDemo={isSampleDemo}
    />
  );
}
