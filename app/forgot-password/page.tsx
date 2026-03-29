"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase"; // Check karna aapka path sahi ho
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Bhai, password reset link aapki email par bhej diya hai! Check kar lo. ✅");
      setEmail("");
    } catch (err: any) {
      setError("Galti hui! Shayad ye email registered nahi hai ya spelling galat hai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-[#111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Reset Password</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase mt-2">Apna registered email niche daalein</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-500 uppercase ml-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full p-4 bg-black border border-white/5 rounded-2xl text-white text-sm outline-none focus:border-yellow-500 transition-all"
            />
          </div>

          {message && <p className="text-green-500 text-[10px] font-bold text-center bg-green-500/10 p-3 rounded-xl">{message}</p>}
          {error && <p className="text-red-500 text-[10px] font-bold text-center bg-red-500/10 p-3 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-yellow-500 text-black font-black rounded-2xl uppercase text-[11px] tracking-widest shadow-lg shadow-yellow-500/10 active:scale-95 transition-all"
          >
            {loading ? "BEJH RAHA HOON..." : "SEND RESET LINK"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-500 text-[10px] font-bold uppercase hover:text-white transition-all">
            ← Wapas Login par jayein
          </Link>
        </div>
      </div>
    </div>
  );
}