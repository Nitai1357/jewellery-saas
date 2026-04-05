"use client";
import { useState } from "react";
import { db, auth } from "@/lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AddLead() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [dob, setDob] = useState("");
  const [anniversary, setAnniversary] = useState("");

  // 🔥 NAYA: 1st Follow-Up States 🔥
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [remarks, setRemarks] = useState("");
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setName(value);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 10) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Pehle login karo bhai!");
      return;
    }

    if (phone.length < 10) {
      alert("Bhai, mobile number kam se kam 10 digits ka hona chahiye!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "leads"), {
        customerName: name,
        phoneNumber: phone,
        status: "WIP 1",
        ownerId: auth.currentUser.uid, 
        
        dob: dob || "Not Provided",
        anniversary: anniversary || "Not Provided",
        
        // 🔥 NAYA: Follow-Up Data Saving 🔥
        nextFollowUp: nextFollowUp || null,
        remarks: remarks || "",
        
        createdAt: serverTimestamp(),
      });

      alert("Customer successfully add ho gaya aur Follow-Up set ho gaya! ✅");
      router.push("/dashboard"); 
    } catch (err) {
      console.error("Error adding customer:", err);
      alert("Kuch gadbad hui, try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center py-12 px-6 relative overflow-x-hidden font-sans text-white">
      {/* LUXURY BG EFFECTS */}
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-yellow-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-yellow-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/5 relative z-10 my-auto">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.15)]">👤</div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">New <span className="text-yellow-500">Customer</span></h1>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 mt-2">Pipeline Acquisition</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: BASIC INFO */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-zinc-500 ml-5 tracking-widest">Customer Full Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Rajesh Kumar" 
                value={name} 
                onChange={handleNameChange} 
                className="w-full p-4 md:p-5 bg-white/5 border border-white/5 rounded-[2rem] outline-none font-bold text-white focus:bg-zinc-800 focus:border-yellow-500/30 transition-all text-sm placeholder:text-zinc-700" 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-zinc-500 ml-5 tracking-widest">Mobile Number *</label>
              <input 
                type="tel" 
                placeholder="10 Digit Number" 
                value={phone} 
                onChange={handlePhoneChange} 
                className="w-full p-4 md:p-5 bg-white/5 border border-white/5 rounded-[2rem] outline-none font-bold text-white focus:bg-zinc-800 focus:border-yellow-500/30 transition-all text-sm placeholder:text-zinc-700" 
                required 
              />
            </div>
          </div>

          {/* 🔥 SECTION 2: 1ST FOLLOW-UP SETUP 🔥 */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-transparent p-5 md:p-6 rounded-[2rem] border border-yellow-500/20 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-500 text-lg">📌</span>
              <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Schedule 1st Follow-Up</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-yellow-500/70 ml-3 tracking-widest">Next Follow-Up Date</label>
                <input 
                  type="date" 
                  value={nextFollowUp} 
                  onChange={(e) => setNextFollowUp(e.target.value)} 
                  style={{ colorScheme: "dark" }}
                  className="w-full p-4 bg-black/50 border border-yellow-500/20 rounded-2xl outline-none font-bold text-white focus:border-yellow-500 transition-all text-xs cursor-pointer" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-yellow-500/70 ml-3 tracking-widest">Requirements / Remarks</label>
                <textarea 
                  rows={2}
                  placeholder="E.g., Wants to see 22K Gold Chains next Friday..." 
                  value={remarks} 
                  onChange={(e) => setRemarks(e.target.value)} 
                  className="w-full p-4 bg-black/50 border border-yellow-500/20 rounded-2xl outline-none font-bold text-white focus:border-yellow-500 transition-all text-xs placeholder:text-zinc-700 resize-none" 
                ></textarea>
              </div>
            </div>
          </div>

          {/* SECTION 3: SPECIAL EVENTS */}
          <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-5 rounded-[2rem] border border-white/5">
              <div className="col-span-2">
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Special Events (Optional)</p>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-3 tracking-widest">Date of Birth</label>
                <input 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  style={{ colorScheme: "dark" }}
                  className="w-full p-4 bg-black border border-zinc-800 rounded-2xl outline-none font-bold text-white focus:border-zinc-500 transition-all text-xs cursor-pointer text-zinc-400" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-3 tracking-widest">Anniversary</label>
                <input 
                  type="date" 
                  value={anniversary} 
                  onChange={(e) => setAnniversary(e.target.value)} 
                  style={{ colorScheme: "dark" }}
                  className="w-full p-4 bg-black border border-zinc-800 rounded-2xl outline-none font-bold text-white focus:border-zinc-500 transition-all text-xs cursor-pointer text-zinc-400" 
                />
              </div>
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-yellow-700 to-yellow-500 text-black font-black rounded-[2rem] shadow-[0_10px_30px_rgba(234,179,8,0.2)] uppercase text-[10px] tracking-[0.2em] italic active:scale-95 transition-all hover:shadow-[0_15px_40px_rgba(234,179,8,0.4)]"
            >
              {loading ? "Recording Identity..." : "Confirm & Save Customer →"}
            </button>
            
            <button 
              type="button" 
              onClick={() => router.push("/dashboard")}
              className="w-full text-zinc-600 font-black text-[9px] uppercase tracking-[0.3em] mt-6 hover:text-red-500 transition-colors"
            >
              Cancel Operation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}