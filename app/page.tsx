"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; 
import { useRouter } from "next/navigation";
import Link from "next/link"; 

// 1. Function Name hamesha Capital rakhein
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Firebase Error:", error.code);
      setErr("Email ya password galat hai bhai!"); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] p-6 relative overflow-hidden font-sans text-white">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-900/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-zinc-900/40 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-2xl p-12 rounded-[4rem] shadow-2xl border border-white/5 relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-yellow-500/60 mb-3">Authentication Protocol</p>
          <h2 className="text-5xl font-black text-white mb-2 italic tracking-tighter uppercase">
            Karat<span className="text-yellow-500 font-light not-italic font-sans tracking-tight">    Tech</span>
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-8 bg-zinc-800"></span>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Jewelry Network</p>
            <span className="h-[1px] w-8 bg-zinc-800"></span>
          </div>
        </div>
        
        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase text-zinc-500 ml-5 tracking-widest">Master Identity</label>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-5 bg-white/5 border border-white/5 rounded-[2rem] focus:bg-zinc-800 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/30 outline-none font-bold text-sm text-white transition-all placeholder:text-zinc-700"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase text-zinc-500 ml-5 tracking-widest">Access Key</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-5 bg-white/5 border border-white/5 rounded-[2rem] focus:bg-zinc-800 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/30 outline-none font-bold text-sm text-white transition-all placeholder:text-zinc-700"
              required
            />
          </div>

          {err && (
            <div className="animate-bounce text-center">
              <p className="text-red-500 text-[9px] font-black uppercase bg-red-500/10 py-3 px-4 rounded-2xl border border-red-500/20 italic">
                ⚠ {err}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-500 hover:to-yellow-400 text-black font-black rounded-[2rem] shadow-2xl transition-all duration-500 uppercase text-[10px] tracking-[0.3em] italic active:scale-95"
          >
            {loading ? "Validating..." : "Secure Login →"}
          </button>
        </form>

        {/* FOOTER LINKS */}
        <div className="mt-12 text-center border-t border-white/5 pt-8 space-y-3">
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em]">
              New Boutique? 
              <Link href="/register" className="ml-2 text-yellow-500 hover:text-white underline underline-offset-8">
                Create Elite Profile
              </Link>
            </p>
            <div className="pt-2">
              <Link href="/forgot-password" hidden={false} className="text-zinc-500 hover:text-yellow-500 text-[8px] font-black uppercase tracking-[0.2em] italic">
                Forgot Access Key?
              </Link>
            </div>
        </div>
      </div>

      <p className="absolute bottom-6 text-[8px] font-black text-zinc-800 uppercase tracking-[1em] italic">
        Secured by Sanga Systems • 2026
      </p>
    </div>
  );
}