"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import TemplateOne from "../../../components/templates/TemplateOne";
import { Sparkles, CheckCircle, Copy, AlertTriangle, ArrowLeft } from "lucide-react";

export default function PreviewPage() {
  const params = useParams();
  const id = params?.id;
  const searchParams = useSearchParams();
  const dashboardId = searchParams.get("auth_dash");
  const router = useRouter();

  const [invitation, setInvitation] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!id) return;
    const localData = typeof window !== "undefined" ? sessionStorage.getItem(`preview_session_${id}`) : null;

    async function fetchFromDb() {
      const { data } = await supabase.from("invitations").select("*").eq("id", id).single();
      if (data) {
        if (data.is_paid) setIsPaid(true);
        setInvitation(data);
      }
    }

    if (localData) {
      setInvitation(JSON.parse(localData));
      fetchFromDb();
    } else {
      fetchFromDb();
    }
  }, [id]);

  const handleInstantPayment = async () => {
    const confirmed = window.confirm(
      "പ്രധാന അറിയിപ്പ്:\n\nപേയ്‌മെന്റ് വിജയകരമായാൽ പിന്നീട് ഈ വെബ്സൈറ്റിലെ വിവരങ്ങളിൽ മാറ്റങ്ങൾ വരുത്താൻ സാധിക്കില്ല.\n\nനൽകിയിരിക്കുന്ന എല്ലാ വിവരങ്ങളും ഫോട്ടോകളും കൃത്യമാണെന്ന് ഉറപ്പുവരുത്തിയോ?"
    );
    if (!confirmed) return;

    setPaying(true);
    try {
      const mockPaymentId = `pay_mock_${Date.now()}`;
      const { error: updateError } = await supabase
        .from("invitations")
        .update({ is_paid: true, payment_id: mockPaymentId })
        .eq("id", id);

      if (updateError) throw updateError;
      setIsPaid(true);
      alert("ഓർഡർ വിജയകരമായി സക്സസ് ആയിരിക്കുന്നു! നിങ്ങളുടെ പബ്ലിക് ഇൻവിറ്റേഷൻ ലിങ്കും പ്രൈവറ്റ് ഡാഷ്‌ബോർഡും അൺലോക്ക് ആയി.");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setPaying(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2500);
  };

  if (!invitation) {
    return (
      <div className="min-h-screen bg-[#16090c] flex flex-col items-center justify-center p-6 text-center text-[#c7a36a] font-serif">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
        <h2 className="text-xl font-bold mb-1">പ്രിവ്യൂ ലഭ്യമായില്ല</h2>
        <p className="text-xs text-stone-400 max-w-sm mb-6">
          ഈ പ്രിവ്യൂ സെഷൻ കാലഹരണപ്പെട്ടു. ദയവായി ഫോം വഴി വീണ്ടും പ്രിവ്യൂ ഓപ്പൺ ചെയ്യുക.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 bg-[#c7a36a] text-black font-sans font-bold text-xs rounded-full hover:bg-amber-300"
        >
          ബിൽഡറിലേക്ക് മടങ്ങുക
        </button>
      </div>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/invite/${id}`;
  const privateDashUrl = `${origin}/dashboard/${invitation.dashboard_id || dashboardId}`;

  return (
    <div className="relative">
      {/* ടോപ്പ് ആക്ഷൻ ബാർ */}
      <div className="sticky top-0 z-50 bg-[#16090c]/95 border-b border-[#c7a36a]/40 backdrop-blur-md py-3.5 px-4 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* മുൻപ് അടിച്ച ഒരു വിവരവും നഷ്ടപ്പെടാതെ എഡിറ്റിലേക്ക് തിരികെ പോകുന്നു */}
            <button
              onClick={() => router.push(`/?edit=${id}`)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition text-xs flex items-center gap-1.5 cursor-pointer font-sans font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-amber-300" /> Edit Form
            </button>
            <span className="text-xs uppercase font-mono px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold">
              {isPaid ? "✨ Permanent Active" : "👀 Live Preview Mode"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isPaid ? (
              <button
                onClick={handleInstantPayment}
                disabled={paying}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer font-sans"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {paying ? "പ്രോസസ്സിംഗ്..." : "Unlock Forever (Click to Activate)"}
              </button>
            ) : (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-sans">
                <CheckCircle className="w-4 h-4" /> ലിങ്കുകൾ ലൈവ് ആണ്
              </span>
            )}
          </div>
        </div>

        {/* ആക്റ്റീവ് ആയാൽ മാത്രം കാണിക്കുന്ന സ്ഥിര ലിങ്കുകൾ */}
        {isPaid && (
          <div className="mt-3 p-4 bg-[#230f14] border border-[#c7a36a] rounded-2xl max-w-4xl mx-auto text-white space-y-3 shadow-xl font-sans">
            <p className="text-xs text-amber-200 font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> നിങ്ങളുടെ സ്ഥിര ലിങ്കുകൾ ഇതാ (സേവ് ചെയ്തുവെക്കുക):
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-black/50 p-3 rounded-xl border border-white/15 flex items-center justify-between">
                <div className="truncate mr-2">
                  <p className="text-[10px] text-stone-400 font-mono">1. പബ്ലിക് ഇൻവിറ്റേഷൻ ലിങ്ക് (അതിഥികൾക്കായി)</p>
                  <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs text-amber-300 font-mono underline truncate block">
                    {publicUrl}
                  </a>
                </div>
                <button onClick={() => copyToClipboard(publicUrl, "pub")} className="p-2 hover:bg-white/10 rounded-lg text-xs cursor-pointer shrink-0">
                  {copied === "pub" ? "Copied!" : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex-1 bg-black/50 p-3 rounded-xl border border-white/15 flex items-center justify-between">
                <div className="truncate mr-2">
                  <p className="text-[10px] text-stone-400 font-mono">2. പ്രൈവറ്റ് ഡാഷ്‌ബോർഡ് (RSVP & ആശംസകൾ മോഡറേറ്റ് ചെയ്യാൻ)</p>
                  <a href={privateDashUrl} target="_blank" rel="noreferrer" className="text-xs text-teal-300 font-mono underline truncate block">
                    {privateDashUrl}
                  </a>
                </div>
                <button onClick={() => copyToClipboard(privateDashUrl, "dash")} className="p-2 hover:bg-white/10 rounded-lg text-xs cursor-pointer shrink-0">
                  {copied === "dash" ? "Copied!" : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <TemplateOne invitation={invitation} isPreviewMode={true} />

      {!isPaid && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl bg-gradient-to-r from-[#54101a] via-[#751c2e] to-[#c7a36a] p-4 rounded-3xl shadow-2xl text-white flex items-center justify-between border border-amber-300/40 font-sans">
          <div>
            <h4 className="text-sm font-bold font-serif">ഇഷ്ടപ്പെട്ടോ? വെബ്സൈറ്റ് ലൈവ് ആക്കാം!</h4>
            <p className="text-[11px] text-amber-100">സൗജന്യമായി ആക്റ്റീവ് ചെയ്ത് സ്ഥിര ലിങ്കുകൾ സ്വന്തമാക്കൂ.</p>
          </div>
          <button
            onClick={handleInstantPayment}
            disabled={paying}
            className="px-5 py-2.5 bg-white text-[#54101a] font-bold text-xs rounded-2xl hover:bg-amber-100 shadow-md transition cursor-pointer"
          >
            {paying ? "കാത്തിരിക്കൂ..." : "Activate Now"}
          </button>
        </div>
      )}
    </div>
  );
}
