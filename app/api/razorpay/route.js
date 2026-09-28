// app/api/razorpay/route.js
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, amount, orderId, paymentId, signature } = body;

    // 1. ഓർഡർ ക്രിയേറ്റ് ചെയ്യുക
    if (action === "create_order") {
      const options = {
        amount: (amount || 499) * 100, // INR പൈസയിൽ (ഉദാ: ₹499)
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
      const order = await razorpay.orders.create(options);
      return NextResponse.json({ success: true, order });
    }

    // 2. പേയ്‌മെന്റ് വെരിഫൈ ചെയ്യുക
    if (action === "verify_payment") {
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + "|" + paymentId)
        .digest("hex");

      if (generatedSignature === signature) {
        return NextResponse.json({ success: true, verified: true });
      } else {
        return NextResponse.json({ success: false, message: "Invalid Signature" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
