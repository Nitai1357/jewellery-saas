"use client";
import { useState } from "react";
import { db, auth } from "@/lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AddBannerPage() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState(""); 
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleBannerUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const CLOUD_NAME = "dsbn7qlu9"; 
    const UPLOAD_PRESET = "jewellery_preset"; 

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (data.secure_url) {
        setUrl(data.secure_url);
        alert("✅ Banner Photo Uploaded!");
      }
    } catch (err) {
      alert("Network Error!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBanner = async (e: any) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) { alert("Pehle Login Karein!"); return; }
    if (!url) { alert("Photo upload karein!"); return; }

    try {
      setIsUploading(true);
      await addDoc(collection(db, "banners"), {
        title: title || "Exclusive Offer",
        imageUrl: url,
        ownerId: user.uid, 
        createdAt: serverTimestamp()
      });
      alert("🎊 Banner Published!");
      router.push("/dashboard");
    } catch (err) {
      alert("Error saving banner!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-[40px] p-8 border-t-[10px] border-yellow-500 shadow-2xl">
        <h2 className="text-3xl font-black mb-8 uppercase text-center text-zinc-800 italic">Add New Banner</h2>
        <form onSubmit={handleSaveBanner} className="space-y-4">
          <input 
            className="w-full p-5 border-2 border-zinc-100 rounded-2xl font-bold focus:border-yellow-500 outline-none" 
            placeholder="Offer Title (e.g. Wedding Sale)" 
            value={title} 
            onChange={(e)=>setTitle(e.target.value)} 
          />
          <div className="border-4 border-dashed border-zinc-100 p-8 rounded-[35px] text-center bg-zinc-50 relative">
            {url ? (
                <div className="relative inline-block">
                    <img src={url} className="h-44 w-full object-cover mx-auto rounded-3xl shadow-xl border-4 border-white" alt="Banner Preview" />
                </div>
            ) : (
                <p className="text-[10px] font-black text-zinc-400 mb-4 uppercase">READY TO SHOOT</p>
            )}
            <div className="mt-2">
              <label className="cursor-pointer bg-zinc-900 text-yellow-500 px-10 py-5 rounded-2xl text-xs font-black uppercase hover:bg-black transition-all inline-block">
                {isUploading ? "Wait..." : "📸 Upload or Take Photo"}
                {/* 🔥 YAHAN SE 'capture="environment"' HATA DIYA HAI 🔥 */}
                <input type="file" onChange={handleBannerUpload} hidden accept="image/*" />
              </label>
            </div>
          </div>
          <button type="submit" disabled={isUploading || !url} className="w-full bg-yellow-500 text-zinc-900 p-6 rounded-3xl font-black text-xl uppercase shadow-xl transition-all disabled:bg-zinc-300">
            {isUploading ? "Saving..." : "Save Banner 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}