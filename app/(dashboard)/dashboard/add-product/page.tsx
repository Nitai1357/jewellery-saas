"use client";
import { useState } from "react";
import { db, auth } from "@/lib/firebase"; 
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [url, setUrl] = useState(""); 
  const [category, setCategory] = useState("Rings");
  
  const [metalType, setMetalType] = useState(""); 
  const [makingCharge, setMakingCharge] = useState(""); 
  const [isTopSeller, setIsTopSeller] = useState(false); 
  const [gst, setGst] = useState(""); 
  
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  // 🔥 THE SMART TRICK: Canvas Formatting (No AI, No Cost, 100% Reliable) 🔥
  const formatPremiumImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Premium Square Resolution
        const size = 1080;
        canvas.width = size;
        canvas.height = size;

        // Premium Light Pink Background
        ctx.fillStyle = '#FFF0F5'; // LavenderBlush (Very light pink)
        ctx.fillRect(0, 0, size, size);

        // Padding (Zoom Out effect)
        const padding = 150; 
        const drawSize = size - (padding * 2);

        // Center align and fit the image
        const ratio = Math.min(drawSize / img.width, drawSize / img.height);
        const finalWidth = img.width * ratio;
        const finalHeight = img.height * ratio;
        const x = (size - finalWidth) / 2;
        const y = (size - finalHeight) / 2;

        // Draw original image over the pink background
        ctx.drawImage(img, x, y, finalWidth, finalHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], "premium-formatted.jpg", { type: "image/jpeg" }));
          } else {
            resolve(file); // fallback
          }
        }, 'image/jpeg', 0.9);
      };
    });
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true); 

    try {
      // 1. Format the image directly in the browser instantly
      const formattedFile = await formatPremiumImage(file);

      // 2. Upload to Cloudinary
      const CLOUD_NAME = "dsbn7qlu9"; 
      const UPLOAD_PRESET = "jewellery_preset"; 

      const formData = new FormData();
      formData.append("file", formattedFile);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      
      if (data.secure_url) {
        setUrl(data.secure_url); 
        alert("✅ Premium Photo Ready!");
      } else {
        alert("Upload Error: " + (data.error?.message || "Check Preset"));
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during formatting/uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Pehle Login Karein!");
    if (!url) return alert("Pehle Photo Khinchein!");
    if (!metalType) return alert("Pehle Metal Type select karein!");

    try {
      await addDoc(collection(db, "products"), {
        name, 
        weight: Number(weight), 
        price: Number(price),
        metalType, 
        makingCharge: Number(makingCharge) || 0, 
        gst: Number(gst) || 0,
        imageUrl: url, 
        category,
        isTopSeller, 
        ownerId: user.uid, 
        createdAt: new Date().toISOString()
      });
      alert("💎 Jewellery Save Ho Gayi!");
      router.push("/dashboard");
    } catch (err) {
      alert("Database Error!");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-[40px] shadow-2xl p-8 border-t-[10px] border-yellow-500">
        <h2 className="text-3xl font-black mb-8 uppercase text-center text-zinc-900 italic">Add New Item</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <select 
            className="w-full p-5 border-2 border-zinc-200 rounded-2xl font-bold bg-zinc-50 text-zinc-900 outline-none focus:border-yellow-500 appearance-none" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
             <option value="Rings">💍 Rings</option>
             <option value="Earrings">✨ Earrings</option>
             <option value="Necklaces">📿 Necklaces</option>
             <option value="Bangles">⚪ Bangles</option>
             <option value="Nose Pins">✨ Nose Pins</option>
             <option value="Bracelets">⌚ Bracelets</option>
             <option value="Mangalsutra">🔱 Mangalsutra</option>
             <option value="Anklets">👣 Anklets</option>
             <option value="Chain">📿 Chain</option>
             <option value="Pendant">✨ Pendant</option>
          </select>

          <select 
            required
            className="w-full p-5 border-2 border-yellow-200 rounded-2xl font-bold bg-yellow-50 text-yellow-800 outline-none focus:border-yellow-500 appearance-none" 
            value={metalType} 
            onChange={(e) => setMetalType(e.target.value)}
          >
            <option value="">Select Metal Type</option>
            <option value="Gold 22K">Gold 22K</option>
            <option value="Gold 24K">Gold 24K</option>
            <option value="Silver">Silver</option>
          </select>

          <input 
            className="w-full p-5 border-2 border-zinc-200 rounded-2xl font-bold text-zinc-900 placeholder-zinc-500 bg-zinc-50 focus:border-yellow-500 outline-none" 
            placeholder="Item Name" 
            value={name} 
            onChange={(e)=>setName(e.target.value)} 
            required 
          />
          
          <div className="grid grid-cols-3 gap-2">
            <input 
              className="w-full p-4 border-2 border-zinc-200 rounded-2xl font-bold text-sm text-zinc-900 placeholder-zinc-500 bg-zinc-50 focus:border-yellow-500 outline-none" 
              placeholder="Weight (g)" 
              value={weight} 
              onChange={(e)=>setWeight(e.target.value)} 
              required 
            />
            <input 
              className="w-full p-4 border-2 border-zinc-200 rounded-2xl font-bold text-sm text-zinc-900 placeholder-zinc-500 bg-zinc-50 focus:border-yellow-500 outline-none" 
              placeholder="Making (₹)" 
              value={makingCharge} 
              onChange={(e)=>setMakingCharge(e.target.value)} 
              required 
            />
            <input 
              type="number" 
              min="0" max="100" 
              className="w-full p-4 border-2 border-green-200 bg-green-50 text-green-800 placeholder-green-600 rounded-2xl font-bold text-sm focus:border-green-500 outline-none" 
              placeholder="GST (%)" 
              value={gst} 
              onChange={(e)=>setGst(e.target.value)} 
            />
          </div>

          <input 
            className="w-full p-5 border-2 border-zinc-200 rounded-2xl font-bold text-zinc-900 placeholder-zinc-500 bg-zinc-50 focus:border-yellow-500 outline-none" 
            placeholder="Manual Price (₹)" 
            value={price} 
            onChange={(e)=>setPrice(e.target.value)} 
            required 
          />

          <div 
            onClick={() => setIsTopSeller(!isTopSeller)}
            className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${isTopSeller ? "border-yellow-500 bg-yellow-50" : "border-zinc-200 bg-zinc-50"}`}
          >
            <span className={`font-black text-xs uppercase ${isTopSeller ? "text-yellow-700" : "text-zinc-600"}`}>
              Show in Trending Slider?
            </span>
            <div className={`w-6 h-6 rounded-full border-4 ${isTopSeller ? "bg-yellow-500 border-yellow-200" : "bg-zinc-300 border-white"}`}></div>
          </div>
          
          <div className="border-4 border-dashed border-zinc-200 p-8 rounded-[35px] text-center bg-zinc-50 relative">
            {url ? (
                <div className="relative inline-block">
                  <img src={url} className="h-44 w-44 object-cover mx-auto rounded-3xl shadow-xl border-4 border-white" alt="Uploaded" />
                  <span className="absolute -top-3 -right-3 bg-green-500 text-white p-2 rounded-full text-xs animate-bounce shadow-lg">✅</span>
                </div>
            ) : (
                <p className={`text-[10px] font-black mb-4 tracking-widest uppercase ${isUploading ? "text-yellow-500 animate-pulse" : "text-zinc-500"}`}>
                  {isUploading ? "☁️ FORMATTING & UPLOADING..." : "READY TO SHOOT"}
                </p>
            )}
            
            <div className="mt-2">
              <label className={`cursor-pointer px-10 py-5 rounded-2xl text-xs font-black uppercase inline-block shadow-xl transition-all ${isUploading ? "bg-zinc-300 text-zinc-500 pointer-events-none" : "bg-zinc-900 text-yellow-500 hover:bg-black active:scale-95"}`}>
                {isUploading ? "Please Wait..." : "📸 Upload Photo / Camera"}
                <input type="file" onChange={handleFileUpload} hidden accept="image/*" />
              </label>
            </div>
          </div>
          
          <button type="submit" disabled={isUploading} className="w-full bg-yellow-500 text-zinc-900 p-6 rounded-3xl font-black text-xl uppercase shadow-xl active:scale-90 transition-all disabled:bg-zinc-300">
            {isUploading ? "Wait..." : "Save Product 💎"}
          </button>
        </form>
      </div>
    </div>
  );
}