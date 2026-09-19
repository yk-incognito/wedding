"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import TemplateOne from "../../../components/templates/TemplateOne";
import { Heart } from "lucide-react";

export default function InviteViewPage() {
  const params = useParams();
  const id = params?.id;

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishes, setWishes] = useState([]);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        const { data, error } = await supabase
          .from("invitations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) setInvitation(data);

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
  }, [id]);

  const handleRsvpSubmit = async (rsvpName, rsvpGuests) => {
    return await supabase.from("rsvps").insert([
      { invitation_id: id, guest_name: rsvpName, guest_count: parseInt(rsvpGuests, 10), attending: true }
    ]);
  };

  const handleWishSubmit = async (guestName, guestMessage) => {
    const { error } = await supabase.from("guest_wishes").insert([
      { invitation_id: id, guest_name: guestName, message: guestMessage }
    ]);
    if (!error) {
      setWishes([{ guest_name: guestName, message: guestMessage, created_at: new Date().toISOString() }, ...wishes]);
    }
    return { error };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#16090c] flex flex-col items-center justify-center text-[#c7a36a]">
        <Heart className="w-12 h-12 animate-pulse text-rose-500 mb-4" />
        <p className="font-serif text-lg tracking-widest uppercase">Opening Royal Invitation...</p>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-[#16090c] flex flex-col items-center justify-center text-rose-300 p-4 text-center font-serif">
        <h2 className="text-2xl font-bold">Invitation Not Found</h2>
        <p className="text-sm text-stone-400 mt-2">The link might be invalid or has expired.</p>
      </div>
    );
  }

  // തിരഞ്ഞെടുത്തത് template1 ആണെങ്കിൽ (അല്ലെങ്കിൽ ഡിഫോൾട്ട് ആയി) TemplateOne റെൻഡർ ചെയ്യുന്നു
  return (
    <TemplateOne 
      data={invitation} 
      isPreview={false}
      onRsvpSubmit={handleRsvpSubmit}
      onWishSubmit={handleWishSubmit}
      wishes={wishes}
    />
  );
}
