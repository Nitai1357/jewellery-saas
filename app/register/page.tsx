"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    whatsapp: "",
    email: "",
    password: "",
    address: "", 
    gstNo: "",   
  });
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.shopName || !formData.ownerName || !formData.whatsapp || !formData.address || !formData.email || !formData.password) {
      alert("Please fill all compulsory fields!");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Auth User directly
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Save User Data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        shopName: formData.shopName,
        ownerName: formData.ownerName,
        whatsapp: formData.whatsapp,
        address: formData.address,
        gstNo: formData.gstNo || "", 
        email: formData.email,
        role: "owner", 
        isPaid: false, 
        createdAt: new Date(),
        isLocked: false
      });

      // 3. Setup default prices document
      await setDoc(doc(db, "prices", user.uid), {
        gold22k: 0,
        gold24k: 0,
        silver: 0,
        updatedAt: new Date().toISOString()
      });

      alert("🎉 Boutique Profile Created Successfully!");
      router.push("/dashboard"); 
    } catch (error: any) {
      console.error("Registration Error:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 font-sans selection:bg-yellow-500 selection:text-black">
      
      <div className="w-full max-w-3xl bg-[#0f0f0f] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tighter mb-2">
            Create <span className="text-yellow-500">Boutique</span> Profile
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold">Elite Jeweller Onboarding</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-2">Business Title *</label>
              <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} required placeholder="Shop Name" className="w-full p-4 bg-black border border-white/10 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-2">Proprietor Name *</label>
              <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="Owner Name" className="w-full p-4 bg-black border border-white/10 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-2">Private Line (WhatsApp) *</label>
              <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required placeholder="+91 00000 00000" className="w-full p-4 bg-black border border-white/10 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-2">GSTIN (Optional)</label>
              <input type="text" name="gstNo" value={formData.gstNo} onChange={handleChange} placeholder="e.g. 22AAAAA0000A1Z5" className="w-full p-4 bg-black border border-white/10 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-2">Complete Store Address *</label>
            <textarea name="address" value={formData.address} onChange={handleChange} required placeholder="Shop No, Street, City, State, Pincode" rows={2} className="w-full p-4 bg-black border border-white/10 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500 transition-colors resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-2">Admin Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email Address" className="w-full p-4 bg-black border border-white/10 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-2">Access Key (Password) *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Password" className="w-full p-4 bg-black border border-white/10 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500 transition-colors" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 mt-4 bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black font-black rounded-[1.5rem] uppercase text-xs tracking-[0.3em] shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Creating Profile..." : "Register Boutique Now →"}
          </button>

        </form>

        <p className="text-center text-zinc-500 mt-8 text-xs font-medium">
          Already have a boutique profile?{" "}
          <Link href="/login" className="text-yellow-500 hover:text-yellow-400 font-bold ml-1">Log in here</Link>
        </p>

      </div>
    </div>
  );
}