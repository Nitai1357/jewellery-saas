"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react"; 
import { Download, UploadCloud, Loader2 } from "lucide-react";  

export default function OwnerProfile() {
  const [isClient, setIsClient] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null); 

  const [shopData, setShopData] = useState({
    shopName: "", ownerName: "", mobile: "", dob: "", email: "",
    bannerUrl: "", address: "", whatsapp: "", mapLink: "", facebook: "",
    logoUrl: "", qrUrl: "", upiId: "" 
  });
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setShopData(docSnap.data() as any);
          }
        }
      });
    };
    if (isClient) fetchProfile();
  }, [isClient]);

  // 🔥 NEW FUNCTION: CLOUDINARY UPLOAD LOGIC 🔥
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'qrUrl' | 'bannerUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field); // Start loading animation

    // Cloudinary FormData Setup
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "jewellery_preset"); // Screenshot se liya gaya preset name

    try {
      // Screenshot se liya gaya Cloud Name: dsbn7qlu9
      const response = await fetch("https://api.cloudinary.com/v1_1/dsbn7qlu9/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        // Naya Cloudinary URL state mein save kar do
        setShopData(prev => ({ ...prev, [field]: data.secure_url }));
        alert("✅ Image successfully uploaded to Cloudinary!");
      } else {
        throw new Error("Failed to get image URL");
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      alert("Upload failed. Please check console.");
    } finally {
      setUploadingField(null); // Stop loading animation
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docRef, { ...shopData });
      alert("Brand Aesthetics Saved Successfully! 💎");
    } catch (err) {
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("shop-qr-owner");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 800, 800);
        const link = document.createElement("a");
        link.download = `${shopData.shopName || 'Shop'}-QR.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (!isClient) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><p className="text-yellow-500 font-black animate-pulse tracking-widest">LOADING PROFILE...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-12 text-white font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Boutique <span className="text-yellow-500">Aesthetics</span></h1>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Manage Brand Identity & Marketing</p>
          </div>
          <button onClick={() => router.push("/dashboard")} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* SECTION 1: CORE IDENTITY */}
          <div className="bg-zinc-900/40 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl">
            <h2 className="text-xs font-black uppercase text-yellow-500/50 mb-6 tracking-[0.3em]">Core Identity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-4 tracking-widest">Business Name</label>
                <input type="text" value={shopData.shopName || ""} onChange={(e)=>setShopData({...shopData, shopName: e.target.value})} className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none font-bold text-sm text-white" placeholder="e.g. Maa Kali Jewellery" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-4 tracking-widest">Proprietor</label>
                <input type="text" value={shopData.ownerName || ""} onChange={(e)=>setShopData({...shopData, ownerName: e.target.value})} className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none font-bold text-sm text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-4 tracking-widest">Contact Line</label>
                <input type="text" value={shopData.mobile || ""} onChange={(e)=>setShopData({...shopData, mobile: e.target.value})} className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none font-bold text-sm text-white" />
              </div>
            </div>
          </div>

          {/* SECTION 2: MARKETING & LUXURY ASSETS */}
          <div className="bg-zinc-900/40 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl">
            <h2 className="text-xs font-black uppercase text-yellow-500/50 mb-6 tracking-[0.3em]">Marketing & Luxury Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              
              

              {/* 🔥 BRAND LOGO CLOUDINARY UPLOAD 🔥 */}
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-4 tracking-widest flex justify-between">
                  <span>Brand Logo (PNG Recommended)</span>
                  {uploadingField === 'logoUrl' && <span className="text-yellow-500 flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Uploading...</span>}
                </label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-2 rounded-2xl">
                  {shopData.logoUrl ? (
                    <img src={shopData.logoUrl} className="w-12 h-12 rounded-xl object-contain bg-black/50 p-1" alt="Logo" />
                  ) : <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-600"><UploadCloud size={20}/></div>}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-yellow-500/10 file:text-yellow-500 hover:file:bg-yellow-500/20 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-4 tracking-widest">Store Address</label>
                <input type="text" value={shopData.address || ""} onChange={(e)=>setShopData({...shopData, address: e.target.value})} className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none font-bold text-sm" placeholder="Location details..." />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-4 tracking-widest">WhatsApp Business</label>
                <input type="text" value={shopData.whatsapp || ""} onChange={(e)=>setShopData({...shopData, whatsapp: e.target.value})} className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none font-bold text-sm" placeholder="Number only (e.g. 919876543210)" />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-4 tracking-widest">Map Link</label>
                <input type="text" value={shopData.mapLink || ""} onChange={(e)=>setShopData({...shopData, mapLink: e.target.value})} className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none font-bold text-sm" placeholder="Google Maps URL" />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-4 tracking-widest">Facebook Profile</label>
                <input type="text" value={shopData.facebook || ""} onChange={(e)=>setShopData({...shopData, facebook: e.target.value})} className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none font-bold text-sm" placeholder="FB Page URL" />
              </div>
            </div>
          </div>

          {/* SECTION 3: PAYMENT CONFIGURATION */}
          <div className="bg-zinc-900/40 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl">
            <h2 className="text-xs font-black uppercase text-yellow-500/50 mb-6 tracking-[0.3em]">Payment & Checkout Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 🔥 QR CODE CLOUDINARY UPLOAD 🔥 */}
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-4 tracking-widest flex justify-between">
                  <span>Payment QR Code Image</span>
                  {uploadingField === 'qrUrl' && <span className="text-yellow-500 flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Uploading...</span>}
                </label>
                <div className="flex items-center gap-3 bg-white/5 border border-yellow-500/30 p-2 rounded-2xl">
                  {shopData.qrUrl ? (
                    <img src={shopData.qrUrl} className="w-12 h-12 rounded-xl object-contain bg-white" alt="QR Code" />
                  ) : <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-600"><UploadCloud size={20}/></div>}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'qrUrl')} className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-yellow-500/10 file:text-yellow-500 hover:file:bg-yellow-500/20 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-zinc-500 ml-4 tracking-widest mt-1">Store UPI ID</label>
                <input type="text" value={shopData.upiId || ""} onChange={(e)=>setShopData({...shopData, upiId: e.target.value})} className="w-full p-4 bg-white/5 border border-yellow-500/30 rounded-2xl outline-none font-bold text-sm text-white focus:bg-yellow-500/5 transition-colors" placeholder="e.g. shopname@okaxis" />
              </div>
            </div>
            <p className="text-[9px] text-zinc-500 mt-4 italic ml-2">Note: This QR code and UPI ID will be shown to customers on the checkout page.</p>
          </div>

          {/* SAVE BUTTON */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-yellow-700 to-yellow-500 text-black font-black rounded-3xl shadow-2xl uppercase text-xs tracking-[0.4em] italic active:scale-95 transition-all"
          >
            {loading ? "Synchronizing Data..." : "Save Brand Aesthetics"}
          </button>
        </form>

        {/* QR SECTION */}
        <div className="mt-12 p-8 bg-zinc-900/50 border border-white/5 rounded-[3rem] text-center shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="bg-white p-4 rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.05)]">
              <QRCodeSVG
                id="shop-qr-owner"
                value={`http://localhost:3000/shop/${auth.currentUser?.uid}`}
                size={160}
                level={"H"}
              />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-black italic uppercase text-yellow-500 tracking-tighter">Your Boutique QR Code</h3>
              <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-2 mb-6">Let customers scan to enter your digital world</p>
              <button 
                onClick={downloadQR}
                className="flex items-center justify-center w-full md:w-auto gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
              >
                <Download size={16} className="text-yellow-500" />
                Download Print-Ready QR
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER DECORATION */}
        <div className="mt-12 py-8 text-center border-t border-white/5">
          <p className="text-[8px] font-black text-zinc-800 uppercase tracking-[1em] italic">
            Secured by KaratTech • 2026
          </p>
        </div>

      </div>
    </div>
  );
}