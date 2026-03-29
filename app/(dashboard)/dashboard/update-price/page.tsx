"use client";
import { useState, useEffect } from "react";
import { db, app } from "@/lib/firebase"; 
import { getAuth } from "firebase/auth"; 
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import Link from "next/link";

export default function UpdatePrice() {
  const [r22, setR22] = useState(6252);
  const [r24, setR24] = useState(6800); 
  const [silver, setSilver] = useState(92000); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const messaging = getMessaging(app);
        const setupNotifications = async () => {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const token = await getToken(messaging, {
              vapidKey: "BDbJdckgskhNPC9uhxFpdNa8q2nBxu1HQRji9qAjAhjtqG51H2wOCg7w84Kz6Cti_BOE72W5LMTJrtuzTfgBTC4" 
            });
            console.log("Token generated:", token);
          }
        };
        setupNotifications();
        const unsubscribe = onMessage(messaging, (payload) => {
          alert(`Update: ${payload.notification?.title}`);
        });
        return () => unsubscribe();
      } catch (err) {
        console.error("Messaging not supported", err);
      }
    }
  }, []);

  const handleUpdate = async () => {
    const user = auth.currentUser; 
    if (!user) {
      alert("Bhai, login session expired! Please login again.");
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, "prices", user.uid), { 
        gold22k: r22, 
        gold24k: r24, 
        silver: silver, 
        lastUpdated: serverTimestamp() 
      });

      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: r22 }), 
      });

      if (response.ok) {
        alert("Success! Your Shop Prices Updated! ✅");
        router.push("/dashboard");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating price.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden font-sans text-white">
      {/* LUXURY BG EFFECTS */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-900/10 rounded-full blur-[150px]"></div>
      
      <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-2xl p-10 rounded-[4rem] shadow-2xl border border-white/5 relative z-10 text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-yellow-500/60 mb-2">Market Management</p>
        <h2 className="text-4xl font-black mb-10 text-white uppercase italic tracking-tighter">Update <span className="text-yellow-500">Rates</span></h2>
        
        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">22K Gold Rate</p>
            <input type="number" value={r22} onChange={(e)=>setR22(Number(e.target.value))} className="w-full bg-transparent text-3xl font-black text-center text-yellow-500 outline-none" />
          </div>

          <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">24K Gold Rate</p>
            <input type="number" value={r24} onChange={(e)=>setR24(Number(e.target.value))} className="w-full bg-transparent text-3xl font-black text-center text-yellow-500 outline-none" />
          </div>

          <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Silver Rate (1KG)</p>
            <input type="number" value={silver} onChange={(e)=>setSilver(Number(e.target.value))} className="w-full bg-transparent text-3xl font-black text-center text-white outline-none" />
          </div>
        </div>

        <button 
          onClick={handleUpdate} 
          disabled={loading}
          className="w-full mt-10 py-5 bg-gradient-to-r from-yellow-700 to-yellow-500 text-black font-black rounded-3xl shadow-xl active:scale-95 transition-all uppercase text-[10px] tracking-widest italic"
        >
          {loading ? "Broadcasting Updates..." : "Update & Send Alert →"}
        </button>

        <button onClick={() => router.push("/dashboard")} className="mt-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] hover:text-white transition-colors">
          Cancel & Return
        </button>
      </div>
    </div>
  );
}