"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { Users, Heart, ExternalLink, Calendar, MapPin, CheckCircle2 } from "lucide-react";

export default function CoupleDashboardPage() {
  const params = useParams();
  const dashboardId = params?.dashboard_id;

  const [invitation, setInvitation] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dashboardId) return;

    async function loadDashboardData() {
      try {
        const { data: invData, error: invError } = await supabase
          .from("invitations")
          .select("*")
          .eq("dashboard_id", dashboardId)
          .single();

        if (invError || !invData) throw new Error("Dashboard not found");
        setInvitation(invData);

        // Fetch RSVPs
        const { data: rsvpData } = await supabase
          .from("rsvps")
          .select("*")
          .eq("invitation_id", invData.id)
          .order("created_at", { ascending: false });
        if (rsvpData) setRsvps(rsvpData);

        // Fetch Wishes
        const { data: wishData } = await supabase
          .from("guest_wishes")
          .select("*")
          .eq("invitation_id", invData.id)
          .order("created_at", { ascending: false });
        if (wishData) setWishes(wishData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [dashboardId]);

  if (loading) {
    return <div className="min-h-screen bg-[#16090c] flex items-center justify-center text-[#c7a36a] font-serif">LOADING PRIVATE DASHBOARD...</div>;
  }

  if (!invitation) {
    return <div className="min-h-screen bg-[#16090c] flex items-center justify-center text-rose-300 font-serif">Invalid Dashboard Link</div>;
  }

  const totalGuests = rsvps.reduce((acc, curr) => acc + (curr.guest_count || 1), 0);

  return (
    <main className="min-h-screen bg-[#0e0507] text-[#f4eee6] p-6 sm:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <span className="text-xs uppercase font-mono px-3 py-1 bg-amber-400/10 text-amber-300 border border-amber-400/20 rounded-full font-bold">
              Private Couple Control Center
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#eed0a0] mt-2">
              {invitation.groom_name} & {invitation.bride_name}
            </h1>
            <p className="text-xs text-stone-400 font-mono mt-1">Invitation ID: {invitation.id}</p>
          </div>

          <a
            href={`/invite/${invitation.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c7a36a] text-black font-bold text-xs hover:bg-amber-300 transition"
          >
            <ExternalLink className="w-4 h-4" /> Open Public Website
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#1c0a0f] border border-[#c7a36a]/30 space-y-1">
            <span className="text-xs text-stone-400 flex items-center gap-1.5"><Users className="w-4 h-4 text-amber-300" /> Total RSVP Confirmations</span>
            <p className="text-3xl font-bold text-white">{rsvps.length}</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#1c0a0f] border border-[#c7a36a]/30 space-y-1">
            <span className="text-xs text-stone-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Total Expected Guests</span>
            <p className="text-3xl font-bold text-white">{totalGuests}</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#1c0a0f] border border-[#c7a36a]/30 space-y-1">
            <span className="text-xs text-stone-400 flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-400" /> Guest Blessings & Wishes</span>
            <p className="text-3xl font-bold text-white">{wishes.length}</p>
          </div>
        </div>

        {/* RSVP List & Wishes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* RSVPs */}
          <div className="p-6 rounded-3xl bg-[#17070b] border border-white/10 space-y-4">
            <h2 className="text-lg font-serif font-bold text-[#eed0a0] flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-300" /> RSVP Confirmations
            </h2>
            {rsvps.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">ഇതുവരെ ആരും RSVP ചെയ്തിട്ടില്ല.</p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {rsvps.map((r, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{r.guest_name}</p>
                      <p className="text-[10px] text-stone-400">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-mono font-bold">
                      {r.guest_count} Guest{r.guest_count > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wishes */}
          <div className="p-6 rounded-3xl bg-[#17070b] border border-white/10 space-y-4">
            <h2 className="text-lg font-serif font-bold text-[#eed0a0] flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" /> Guest Wishes
            </h2>
            {wishes.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">ആശംസകൾ ഒന്നും ലഭിച്ചിട്ടില്ല.</p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {wishes.map((w, idx) => (
                  <div key={idx} className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-amber-200">{w.guest_name}</p>
                      <span className="text-[10px] text-stone-500">{new Date(w.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-stone-300 italic font-serif leading-relaxed">"{w.message}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
