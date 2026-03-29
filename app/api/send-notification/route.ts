import { admin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { price } = await request.json();

    const message = {
      notification: {
        title: "💰 Sanga Jewellers: Gold Rate Alert",
        body: `Aaj ka 22K rate ₹${price} hai. Click karke check karein!`,
      },
      topic: "all_customers",
    };

    // Firebase Admin SDK se notification bhej rahe hain
    await admin.messaging().send(message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FCM Error:", error);
    return NextResponse.json({ success: false, error: "Notification failed" }, { status: 500 });
  }
}