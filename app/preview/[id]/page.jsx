"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
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

    // URL പ്രൊട്ടക്ഷൻ: താൽക്കാലിക സെഷൻ ഡാറ്റ പരിശോധിക്കുന്നു
    const localData = typeof window !== "undefined" ? sessionStorage.getItem(`preview_session_${id}`) : null;

    async function fetchFromDb() {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", id)
        .single();

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

  const handlePayment = async () => {
    // പ്രീ-പേയ്‌മെന്റ് വാണിംഗ് അലർട്ട്
    const confirmed = window.confirm(
      "പ്രധാന അറിയിപ്പ്:\n\nപേയ്‌മെന്റ് വിജയകരമായാൽ പിന്നീട് ഈ വെബ്സൈറ്റിലെ വിവരങ്ങളിൽ മാറ്റങ്ങൾ വരുത്താൻ സാധിക്കില്ല.\n\nനൽകിയിരിക്കുന്ന എല്ലാ വിവരങ്ങളും ഫോട്ടോകളും കൃത്യമാണെന്ന് ഉറപ്പുവരുത്തിയോ?"
    );
    if (!confirmed) return;

    setPaying(true);
    try {
      // Razorpay Order Creation via backend
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_order", amount: 499 })
      });
      const orderData = await res.json();
      if (!orderData.success) throw new Error("Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Royal Matrimonial Studio",
        description: "Official Wedding Invitation Website Activation",
        order_id: orderData.order.id,
        handler: async function (response) {
          // Backend Verification
          const verifyRes = await fetch("/api/razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "verify_payment",
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          });
          const vData = await verifyRes.json();

          if (vData.success) {
            // Update Supabase Database
            await supabase
              .from("invitations")
              .update({
                is_paid: true,
                payment_id: response.razorpay_payment_id,
                payment_order_id: response.razorpay_order_id
              })
              .eq("id", id);

            setIsPaid(true);
            alert("പേയ്‌മെന്റ് വിജയകരമായി പൂർത്തിയായി! നിങ്ങളുടെ പബ്ലിക് ഇൻവിറ്റേഷൻ ലിങ്കും ഡാഷ്‌ബോർഡും സജീവമായിരിക്കുന്നു.");
          } else {
            alert("Payment signature verification failed.");
          }
        },
        prefill: {
          name: `${invitation.groom_name} & ${invitation.bride_name}`,
          email: invitation.email || "support@wedding.xyz",
          contact: invitation.whatsapp_number || ""
        },
        theme: { color: "#54101a" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      alert("Payment Notice: " + err.message);
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
          ഈ പ്രിവ്യൂ സെഷൻ കാലഹരണപ്പെട്ടു അല്ലെങ്കിൽ സാധുതയുള്ളതല്ല. ദയവായി ഫോം വഴി വീണ്ടും പ്രിവ്യൂ ഓപ്പൺ ചെയ്യുക.
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
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* TOP STICKY BAR */}
      <div className="sticky top-0 z-50 bg-[#16090c]/95 border-b border-[#c7a36a]/40 backdrop-blur-md py-3 px-4 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-xs flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Edit Form
            </button>
            <span className="text-xs uppercase font-mono px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold">
              {isPaid ? "✨ Permanent Active" : "👀 Live Unpaid Preview"}
            </span>
            {!isPaid && (
              <span className="text-[11px] text-stone-400 hidden md:inline">
                (ഈ ലിങ്ക് കോപ്പി ചെയ്താൽ മറ്റൊരാൾക്ക് ഓപ്പൺ ആകില്ല)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isPaid ? (
              <button
                onClick={handlePayment}
                disabled={paying}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {paying ? "പ്രോസസ്സിംഗ്..." : "Unlock Forever (₹499 Pay Now)"}
              </button>
            ) : (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> ലിങ്കുകൾ ലൈവ് ആണ്
              </span>
            )}
          </div>
        </div>

        {/* പേയ്‌മെന്റ് കഴിഞ്ഞാൽ അൺലോക്ക് ആകുന്ന പെർമനന്റ് ലിങ്കുകൾ */}
        {isPaid && (
          <div className="mt-3 p-4 bg-[#230f14] border border-[#c7a36a] rounded-2xl max-w-4xl mx-auto text-white space-y-3">
            <p className="text-xs text-amber-200 font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> നിങ്ങളുടെ സ്ഥിര ലിങ്കുകൾ വിജയകരമായി അൺലോക്ക് ആയി (ഇവ സേവ് ചെയ്തുവെക്കുക):
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-black/40 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-stone-400 font-mono">1. പബ്ലിക് ഇൻവിറ്റേഷൻ ലിങ്ക് (അതിഥികൾക്കായി)</p>
                  <p className="text-xs text-amber-300 font-mono truncate">{publicUrl}</p>
                </div>
                <button onClick={() => copyToClipboard(publicUrl, "pub")} className="p-2 hover:bg-white/10 rounded-lg text-xs cursor-pointer">
                  {copied === "pub" ? "Copied!" : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex-1 bg-black/40 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-stone-400 font-mono">2. പ്രൈവറ്റ് ഡാഷ്‌ബോർഡ് (RSVP & ആശംസകൾ കാണാൻ)</p>
                  <p className="text-xs text-teal-300 font-mono truncate">{privateDashUrl}</p>
                </div>
                <button onClick={() => copyToClipboard(privateDashUrl, "dash")} className="p-2 hover:bg-white/10 rounded-lg text-xs cursor-pointer">
                  {copied === "dash" ? "Copied!" : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ഫുൾ പ്രിവ്യൂ ഔട്ട്പുട്ട് */}
      <TemplateOne invitation={invitation} isPreviewMode={true} />

      {/* BOTTOM STICKY BAR (Unpaid അവസ്ഥയിൽ താഴെ കാണിക്കുന്നു) */}
      {!isPaid && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl bg-gradient-to-r from-[#54101a] via-[#751c2e] to-[#c7a36a] p-4 rounded-3xl shadow-2xl text-white flex items-center justify-between border border-amber-300/40">
          <div>
            <h4 className="text-sm font-bold font-serif">ഇഷ്ടപ്പെട്ടോ? വെബ്സൈറ്റ് ലൈവ് ആക്കാം!</h4>
            <p className="text-[11px] text-amber-100">പണമടച്ച് സ്ഥിരമായ പബ്ലിക് ലിങ്കും ഡാഷ്‌ബോർഡും നേടൂ.</p>
          </div>
          <button
            onClick={handlePayment}
            disabled={paying}
            className="px-5 py-2.5 bg-white text-[#54101a] font-bold text-xs rounded-2xl hover:bg-amber-100 shadow-md transition cursor-pointer"
          >
            {paying ? "കാത്തിരിക്കൂ..." : "Pay Now (₹499)"}
          </button>
        </div>
      )}
    </div>
  );
}
