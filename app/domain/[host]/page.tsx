"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { onSnapshot, doc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation"; 
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react"; 

// 👑 REFINED PREMIUM THEMES 
const luxuryThemes = [
  { name: "Gold", text: "text-[#D4AF37]", bg: "bg-[#D4AF37]", hover: "hover:bg-[#C5A028]", border: "border-[#D4AF37]", textOnBg: "text-white", lightBg: "bg-[#FFFDF3]" },
  { name: "Rose", text: "text-[#B76E79]", bg: "bg-[#B76E79]", hover: "hover:bg-[#A65D68]", border: "border-[#B76E79]", textOnBg: "text-white", lightBg: "bg-[#FFF5F6]" },
  { name: "Sapphire", text: "text-[#0F52BA]", bg: "bg-[#0F52BA]", hover: "hover:bg-[#0E4AA8]", border: "border-[#0F52BA]", textOnBg: "text-white", lightBg: "bg-[#F3F8FF]" },
  { name: "Emerald", text: "text-[#50C878]", bg: "bg-[#50C878]", hover: "hover:bg-[#40B868]", border: "border-[#50C878]", textOnBg: "text-white", lightBg: "bg-[#F3FFF7]" },
  { name: "Amethyst", text: "text-[#9966CC]", bg: "bg-[#9966CC]", hover: "hover:bg-[#8855BB]", border: "border-[#9966CC]", textOnBg: "text-white", lightBg: "bg-[#FAFAFA]" },
  { name: "Onyx", text: "text-[#333333]", bg: "bg-[#333333]", hover: "hover:bg-black", border: "border-[#333333]", textOnBg: "text-white", lightBg: "bg-[#FAFAFA]" }
];

const getShopTheme = (id: string) => {
  if (!id) return luxuryThemes[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return luxuryThemes[Math.abs(hash) % luxuryThemes.length];
};

export default function CustomDomainShopPage() {
  const params = useParams(); 
  const router = useRouter(); 
  
  // 🔥 ASLI JADOO: Domain se UID dhoondhne ke liye states
  const [shopId, setShopId] = useState<string | null>(null);
  const [isDomainLoading, setIsDomainLoading] = useState(true);

  const [shopInfo, setShopInfo] = useState<any>(null);
  const [rates, setRates] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]); 
  const [products, setProducts] = useState<any[]>([]); 
  const [currentBanner, setCurrentBanner] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // URL host nikalna
  const rawHost = (params?.host as string) || "";
  const decodedHost = rawHost ? decodeURIComponent(rawHost) : "";

  const theme = getShopTheme(shopId || "");

  const categories = [
    { name: "Earrings", image: "https://res.cloudinary.com/dsbn7qlu9/image/upload/v1774556291/e2ghu0ngcvbmwxskpvbd.jpg" },
    { name: "Rings", image: "https://res.cloudinary.com/dsbn7qlu9/image/upload/v1774556013/zd6df6hwutpnvmxecrzx.jpg"},
    { name: "Necklaces", image: "https://res.cloudinary.com/dsbn7qlu9/image/upload/v1774556815/hkaer3pxmgqfdckw2ion.jpg" },
    { name: "Nose Pins", image: "https://res.cloudinary.com/dsbn7qlu9/image/upload/v1774556998/bk68fwkambsem8j6nrmm.jpg" },
    { name: "Bracelets", image: "https://res.cloudinary.com/dsbn7qlu9/image/upload/v1774557315/iyckx1lqk69roog3pgh2.jpg" },
    { name: "Bangles", image: "https://res.cloudinary.com/dsbn7qlu9/image/upload/v1774557586/cce83panvjady08fu2yr.jpg" },
    { name: "Mangalsutra", image: "https://res.cloudinary.com/dsbn7qlu9/image/upload/v1774557770/xlvh1fevd29zkyjailxf.jpg" },
    { name: "Anklets", image: "https://res.cloudinary.com/dsbn7qlu9/image/upload/v1774558118/rukzchbhgjerfjso8qlf.jpg" },
    { name: "Chain", image: "https://res.cloudinary.com/dsbn7qlu9/image/upload/v1774558737/cqcdionkzfpwgahiqcxj.jpg" },
    { name: "Pendant", image: "https://res.cloudinary.com/dsbn7qlu9/image/upload/v1774558948/tmjee1thieqqcjuo5cz5.jpg" }
  ];

  // 🔥 STEP 1: Domain naam se database mein dukaandaar ka ID dhoondho
  useEffect(() => {
    if (!decodedHost) return;

    const findShopId = async () => {
      try {
        const q = query(collection(db, "users"), where("customDomain", "==", decodedHost));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setShopId(querySnapshot.docs[0].id); // Mil gaya owner ka UID!
        } else {
          setShopId("NOT_FOUND");
        }
      } catch (error) {
        console.error("Error finding domain:", error);
        setShopId("NOT_FOUND");
      } finally {
        setIsDomainLoading(false);
      }
    };

    findShopId();
  }, [decodedHost]);


  useEffect(() => {
    if (shopInfo?.shopName) document.title = `${shopInfo.shopName} - Premium Jewellery`;
    else document.title = "Elite Jewellers";
  }, [shopInfo]);

  useEffect(() => {
    if (!shopId || shopId === "NOT_FOUND") return;
    const cartKey = `cart_${shopId}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    setCartCount(cart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0));
  }, [shopId]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || products.length === 0) return;
    let animationId: number;
    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += 0.4;
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 1) scrollContainer.scrollLeft = 0;
      }
      animationId = requestAnimationFrame(scroll);
    };
    animationId = requestAnimationFrame(scroll);
    const pauseScroll = () => cancelAnimationFrame(animationId);
    const resumeScroll = () => { cancelAnimationFrame(animationId); animationId = requestAnimationFrame(scroll); };
    scrollContainer.addEventListener("mouseenter", pauseScroll);
    scrollContainer.addEventListener("mouseleave", resumeScroll);
    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener("mouseenter", pauseScroll);
      scrollContainer.removeEventListener("mouseleave", resumeScroll);
    };
  }, [products]);

  // 🔥 STEP 2: Ab ID mil gaya toh saara aslo data uthao
  useEffect(() => {
    if (!shopId || shopId === "NOT_FOUND") return;

    const unsubUser = onSnapshot(doc(db, "users", shopId), (snap) => { if (snap.exists()) setShopInfo(snap.data()); });
    const unsubRates = onSnapshot(doc(db, "prices", shopId), (snap) => { if (snap.exists()) setRates(snap.data()); });
    const qBanners = query(collection(db, "banners"), where("ownerId", "==", shopId));
    const unsubBanners = onSnapshot(qBanners, (snap) => setBanners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse()));
    
    const qProducts = query(collection(db, "products"), where("ownerId", "==", shopId), where("isTopSeller", "==", true), limit(10));
    const unsubProducts = onSnapshot(qProducts, (snap) => setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    
    return () => { unsubUser(); unsubRates(); unsubBanners(); unsubProducts(); };
  }, [shopId]);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => setCurrentBanner((prev) => (prev + 1) % banners.length), 5000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  const calculateLivePrice = (prod: any) => {
    const currentRate = prod.metalType?.includes("24K") ? rates?.gold24k : rates?.gold22k;
    const basePrice = Math.round((prod.weight * (currentRate || 0)) + (Number(prod.makingCharge) || 0));
    const gstPercent = Number(prod.gst) || 0; 
    const gstAmount = Math.round(basePrice * (gstPercent / 100));
    return basePrice + gstAmount;
  };

  const handleAddToCart = (prod: any) => {
    const cartKey = `cart_${shopId}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const finalPrice = calculateLivePrice(prod);
    const existingIndex = cart.findIndex((item: any) => item.id === prod.id);
    
    if(existingIndex > -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({ ...prod, livePrice: finalPrice, quantity: 1, shopId: shopId });
    }
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
    setCartCount(cart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0));
    alert(`${prod.name} added to your bag! 🛍️`);
  };

  const handleBuyNow = (prod: any) => {
    handleAddToCart(prod);
    router.push(`/checkout?shopId=${shopId}`);
  };

  const handleEnquiry = (prod: any) => {
    const finalPrice = calculateLivePrice(prod);
    const msg = `Namaste ${shopInfo?.shopName || ""}, I am interested in your Elite Collection:\n*Item:* ${prod.name}\n*Weight:* ${prod.weight}g\n*Approx Price:* ₹${finalPrice.toLocaleString('en-IN')}\n\nPlease share more details.`;
    window.open(`https://wa.me/${shopInfo?.whatsapp || ""}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // 🔥 LOADING & 404 SCREENS 🔥
  if (isDomainLoading) {
    return <div className="min-h-screen bg-pink-50 flex items-center justify-center"><p className="text-pink-500 font-black animate-pulse tracking-widest text-xs uppercase">Connecting to Boutique...</p></div>;
  }

  if (shopId === "NOT_FOUND") {
    return <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-white"><h1 className="text-3xl font-black text-red-500 mb-2">404 - Boutique Not Found</h1><p className="text-zinc-500">No registered shop found for domain: {decodedHost}</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex flex-col font-sans text-zinc-900 overflow-x-hidden">
      
      {/* FLOATING CART BUTTON */}
      {cartCount > 0 && (
        <button onClick={() => router.push(`/checkout?shopId=${shopId}`)} className={`fixed bottom-6 right-6 z-50 ${theme.bg} ${theme.textOnBg} ${theme.hover} p-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all transform hover:scale-105 flex items-center justify-center`}>
          <ShoppingBag size={22} />
          <span className={`absolute -top-2 -right-2 bg-zinc-900 text-white font-bold text-[10px] w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white`}>{cartCount}</span>
        </button>
      )}

      {/* LUXURY HEADER SECTION */}
      <div className={`bg-white/40 backdrop-blur-sm relative overflow-hidden px-6 py-12 md:py-20 text-center border-b-[3px] ${theme.border}`}>
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <p className={`text-[9px] md:text-[11px] tracking-[0.4em] font-black ${theme.text} mb-4 uppercase`}>Welcome to the House of</p>
          
          {shopInfo?.logoUrl && (
            <img src={shopInfo.logoUrl} alt={`${shopInfo?.shopName} Logo`} className="h-16 md:h-24 mx-auto object-contain mb-4 drop-shadow-sm mix-blend-multiply" />
          )}
          
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-widest text-zinc-900 mb-2 drop-shadow-sm">
            {shopInfo?.shopName || "Loading Boutique..."}
          </h1>
          
          <p className="text-zinc-600 text-[10px] md:text-xs font-bold tracking-[0.2em] italic mt-2 mb-10">Crafting heritage & purity</p>
          
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 w-full">
            {[{ label: "22K GOLD", price: rates?.gold22k }, { label: "24K GOLD", price: rates?.gold24k }, { label: "SILVER", price: rates?.silver }].map((r, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-md px-5 py-3 md:px-8 md:py-4 rounded-xl border border-pink-200 shadow-sm min-w-[110px] transform hover:-translate-y-1 transition-transform relative">
                <span className={`text-[7px] md:text-[9px] font-black ${theme.text} block uppercase tracking-[0.2em] mb-1`}>{r.label}</span>
                <span className="text-zinc-800 font-bold text-sm md:text-lg tracking-wider">₹{r.price ? r.price.toLocaleString('en-IN') : "---"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPACT BANNER SECTION */}
      <div className="px-4 md:px-8 -mt-6 md:-mt-8 max-w-6xl mx-auto w-full relative z-20">
        <div className="w-full relative group rounded-[2rem] overflow-hidden shadow-[0_15px_40px_rgba(255,192,203,0.5)] border-[6px] border-white bg-zinc-100 aspect-[21/9] md:aspect-[24/7]">
          {banners.length > 0 ? banners.map((banner, index) => (
            <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
              <img src={banner.imageUrl} alt="Offer" className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6 md:p-10">
                <h2 className="text-white font-bold uppercase text-lg md:text-3xl tracking-widest leading-tight drop-shadow-md">{banner.title}</h2>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center w-full h-full"><span className="text-2xl opacity-30 mb-2">✨</span><p className="text-zinc-400 font-medium uppercase tracking-[0.3em] text-[8px] md:text-[10px]">Premium Collections Await</p></div>
          )}
        </div>
      </div>

      {/* TRENDING SHOWCASE */}
      {products.length > 0 && (
        <div className="py-12 md:py-20 max-w-[1200px] mx-auto w-full overflow-hidden">
          <div className="px-6 flex flex-col items-center gap-2 mb-8 text-center">
            <h2 className="font-black uppercase text-zinc-900 text-xl md:text-3xl tracking-[0.2em]">Trending Masterpieces</h2>
            <div className={`h-[3px] w-16 ${theme.bg} mt-2`}></div>
          </div>
          
          <div ref={scrollRef} className="flex overflow-x-auto gap-4 md:gap-8 px-6 pb-12 pt-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {products.map((prod) => {
              const livePrice = calculateLivePrice(prod);
              return (
                <div key={prod.id} className="min-w-[160px] md:min-w-[240px] max-w-[180px] md:max-w-[260px] bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-pink-100 shadow-[0_8px_25px_rgba(255,182,193,0.3)] flex flex-col group hover:shadow-[0_15px_35px_rgba(255,182,193,0.5)] transition-all duration-500">
                  <div className={`aspect-square overflow-hidden relative ${theme.lightBg} p-2 md:p-3`}>
                    <img src={prod.imageUrl} className="w-full h-full object-cover object-center rounded-2xl transform group-hover:scale-105 transition-transform duration-700" alt={prod.name} />
                    <div className={`absolute top-4 left-4 ${theme.bg} ${theme.textOnBg} text-[6px] md:text-[8px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest shadow-md`}>Hot</div>
                  </div>
                  <div className="p-3 md:p-5 flex-grow flex flex-col justify-between">
                    <div className="mb-3 md:mb-5 text-center">
                      <h4 className="font-extrabold text-xs md:text-base uppercase text-zinc-800 tracking-wide mb-1 truncate">{prod.name}</h4>
                      <p className="text-zinc-500 text-[7px] md:text-[9px] font-bold tracking-[0.1em] uppercase mb-1">{prod.weight}g • {prod.metalType}</p>
                      {prod.gst && Number(prod.gst) > 0 ? (
                        <p className="text-[6px] md:text-[7px] text-green-600 font-bold uppercase mb-2 text-center">+ {prod.gst}% GST Inc.</p>
                      ) : (
                         <div className="h-2 md:h-3 mb-2"></div>
                      )}
                      
                      <p className={`text-sm md:text-xl font-black tracking-wide ${theme.text}`}>₹{livePrice.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 md:gap-2 mt-auto">
                        <button onClick={() => handleEnquiry(prod)} className="w-full bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-bold text-[7px] md:text-[9px] py-2 md:py-3 rounded-xl uppercase tracking-widest transition-colors">Enquire Details</button>
                        <div className="flex gap-1.5 md:gap-2">
                            <button onClick={() => handleAddToCart(prod)} className="flex-1 bg-white border border-pink-200 hover:border-pink-300 text-zinc-800 font-bold text-[7px] md:text-[9px] py-2 md:py-3 rounded-xl uppercase tracking-widest transition-all">Add to Cart</button>
                            <button onClick={() => handleBuyNow(prod)} className={`flex-1 ${theme.bg} ${theme.hover} ${theme.textOnBg} font-bold text-[7px] md:text-[9px] py-2 md:py-3 rounded-xl uppercase tracking-widest transition-all shadow-md`}>Buy Now</button>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CATEGORIES GRID */}
      <div className="px-6 md:px-10 pb-20 max-w-6xl mx-auto w-full pt-8">
        <div className="flex items-center justify-center gap-4 mb-10 text-center">
            <h2 className="font-black uppercase text-zinc-900 text-xl md:text-3xl tracking-[0.2em]">Shop by Category</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((cat, idx) => (
            <Link key={idx} href={`/shop/${shopId}/category/${cat.name}`}>
              <div className="relative h-40 md:h-56 rounded-[2rem] overflow-hidden cursor-pointer group shadow-md hover:shadow-2xl hover:shadow-pink-300/50 active:scale-95 transition-all duration-300 border-[3px] border-white">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 group-active:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 transition-opacity duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm md:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center px-2 group-hover:text-pink-300 group-active:text-pink-300 transition-colors duration-300">
                    {cat.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white/50 backdrop-blur-md text-zinc-800 pt-16 pb-8 px-4 md:px-6 mt-auto border-t-[4px] border-pink-200 relative">
        <div className={`absolute top-0 inset-x-0 h-[3px] ${theme.bg}`}></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          <h2 className={`font-black uppercase text-2xl md:text-3xl tracking-widest mb-4 ${theme.text}`}>{shopInfo?.shopName}</h2>
          <p className="text-zinc-600 font-medium text-[11px] md:text-xs mb-8 max-w-lg mx-auto leading-relaxed">
            Elegance and purity crafted exclusively for you. Discover our heritage of fine jewelry making.
          </p>
          
          <div className="flex flex-col items-center gap-6 mb-10 w-full">
            <p className="text-pink-700 font-bold text-[9px] md:text-[10px] tracking-widest uppercase bg-pink-100/80 px-6 py-2 rounded-full border border-pink-200">
              📍 {shopInfo?.address || "Boutique Location"}
            </p>
            
            <div className="flex flex-row flex-wrap justify-center items-center gap-2 md:gap-4 w-full px-2">
              <Link href={`/checkout?shopId=${shopId}`} className="flex-1 min-w-[100px] bg-white/80 border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 text-zinc-800 px-2 py-3 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm">
                📦 Track
              </Link>
              {shopInfo?.whatsapp && (
                <Link href={`https://wa.me/${shopInfo.whatsapp}`} target="_blank" className="flex-1 min-w-[110px] bg-zinc-900 hover:bg-black text-white px-2 py-3 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5">
                  💬 WhatsApp
                </Link>
              )}
              {shopInfo?.mapLink && (
                <Link href={shopInfo.mapLink} target="_blank" className={`flex-1 min-w-[100px] ${theme.bg} ${theme.hover} ${theme.textOnBg} px-2 py-3 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5`}>
                  📍 Location
                </Link>
              )}
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-pink-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} {shopInfo?.shopName}. All Rights Reserved.
            </p>
            <div className="flex items-center gap-2 text-pink-400">
              <span className="text-[8px] font-black tracking-widest uppercase">Powered by KaratTech</span>
              <Star size={10} fill="currentColor" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}