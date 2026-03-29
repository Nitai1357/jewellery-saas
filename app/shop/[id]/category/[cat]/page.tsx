"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, doc } from "firebase/firestore"; 
import { useParams, useRouter } from "next/navigation";
import { Search, ShoppingBag, X, Plus, Minus } from "lucide-react";

// 👑 PREDEFINED LUXURY BRAND THEMES 
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

export default function CategoryItems() {
  const params = useParams();
  const id = params.id as string;
  const cat = params.cat as string;
  
  const [products, setProducts] = useState<any[]>([]);
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); 
  const router = useRouter();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const theme = getShopTheme(id);

  const calculatePrice = (p: any, currentRates: any) => {
    if (!currentRates) return p.price || 0;
    const weight = Number(p.weight) || 0;
    const making = Number(p.makingCharge) || 0;
    if (p.metalType === "Gold 22K") return Math.round((weight * currentRates.gold22k) + making);
    if (p.metalType === "Gold 24K") return Math.round((weight * currentRates.gold24k) + making);
    if (p.metalType === "Silver") return Math.round((weight * (currentRates.silver / 1000)) + making);
    return p.price || 0;
  };

  useEffect(() => {
    if (!id || !cat) return;

    const unsubRates = onSnapshot(doc(db, "prices", id), (docSnap) => {
      if (docSnap.exists()) {
        const latestRates = docSnap.data();
        setRates(latestRates);

        const cartKey = `cart_${id}`;
        const savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        if (savedCart.length > 0) {
          const updatedCart = savedCart.map((item: any) => ({
            ...item,
            livePrice: calculatePrice(item, latestRates) 
          }));
          setCartItems(updatedCart);
          localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        }
      }
    });

    const q = query(collection(db, "products"), where("ownerId", "==", id), where("category", "==", decodeURIComponent(cat)));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    const cartKey = `cart_${id}`;
    const savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    setCartItems(savedCart);

    return () => { unsub(); unsubRates(); };
  }, [id, cat]);

  const updateQuantity = (prodId: string, action: 'plus' | 'minus') => {
    const cartKey = `cart_${id}`;
    let updatedCart = [...cartItems];
    const index = updatedCart.findIndex(item => item.id === prodId);

    if (index > -1) {
      if (action === 'plus') updatedCart[index].quantity = (updatedCart[index].quantity || 1) + 1;
      else {
        if (updatedCart[index].quantity > 1) updatedCart[index].quantity -= 1;
        else updatedCart = updatedCart.filter(item => item.id !== prodId);
      }
      setCartItems(updatedCart);
      localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    }
  };

  const handleAddToCart = (p: any) => {
    const cartKey = `cart_${id}`;
    const currentCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const existingIndex = currentCart.findIndex((item: any) => item.id === p.id);
    let newCart = [...currentCart];

    if (existingIndex > -1) newCart[existingIndex].quantity += 1;
    else newCart.push({ ...p, quantity: 1, livePrice: calculatePrice(p, rates), shopId: id });

    setCartItems(newCart);
    localStorage.setItem(cartKey, JSON.stringify(newCart));
    setIsCartOpen(true); 
  };

  const handleBuyNow = (p: any) => {
    handleAddToCart(p);
    router.push(`/checkout?shopId=${id}`);
  };

  const handleEnquiry = (p: any) => {
    const price = calculatePrice(p, rates);
    const msg = `Namaste, I'm interested in:\n*Item:* ${p.name}\n*Weight:* ${p.weight}g\n*Price:* ₹${price.toLocaleString('en-IN')}\n\nPlease share more details.`;
    window.open(`https://wa.me/910000000000?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    // 🔥 YAHAN PINK GRADIENT ADD KIYA HAI 🔥
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 font-sans relative">
      
      {/* LUXURY STICKY HEADER - 🔥 TRANSPARENT GLASS EFFECT 🔥 */}
      <div className={`sticky top-0 z-50 bg-white/40 backdrop-blur-md border-b-[3px] ${theme.border} p-4 shadow-sm`}>
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <button onClick={() => router.back()} className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
              <span className="bg-white/60 w-8 h-8 flex items-center justify-center rounded-full group-hover:bg-pink-100 transition-all shadow-sm">←</span> 
              Back
            </button>
            <div className="text-right">
                <h2 className="text-lg font-extrabold uppercase text-zinc-900 tracking-widest">{decodeURIComponent(cat)}</h2>
                <p className={`text-[8px] font-bold ${theme.text} uppercase tracking-[0.2em]`}>Premium Selection</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Search pieces..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-pink-100 rounded-xl text-xs font-medium outline-none focus:border-pink-300 transition-all shadow-inner"
              />
            </div>
            <button onClick={() => setIsCartOpen(true)} className={`${theme.bg} ${theme.textOnBg} ${theme.hover} p-3 rounded-xl shadow-md relative transition-all`}>
              <ShoppingBag size={20} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-40 animate-pulse text-zinc-400 font-bold uppercase tracking-widest text-sm">Loading Designs...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-40">
            <div className="text-4xl mb-4 opacity-30">✨</div>
            <div className="text-zinc-500 font-bold uppercase text-xs tracking-widest">No Items Found</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((prod) => (
              // 🔥 PRODUCT CARD TRANSPARENT EFFECT 🔥
              <div key={prod.id} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-pink-100 shadow-sm flex flex-col group hover:shadow-xl hover:shadow-pink-200/50 transition-all duration-300">
                <div className={`aspect-square overflow-hidden relative ${theme.lightBg} p-2`}>
                  <img src={prod.imageUrl} className="w-full h-full object-cover object-center rounded-xl transform group-hover:scale-105 transition-transform duration-700" alt={prod.name} />
                  {prod.isTopSeller && <div className={`absolute top-4 left-4 ${theme.bg} ${theme.textOnBg} text-[7px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm`}>Hot</div>}
                </div>
                
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div className="mb-4 text-center">
                    <h4 className="font-bold text-xs md:text-sm uppercase text-zinc-800 tracking-wide mb-1 truncate">{prod.name}</h4>
                    <p className="text-zinc-500 text-[8px] font-medium tracking-[0.1em] uppercase mb-2">{prod.weight}g • {prod.metalType}</p>
                    {prod.gst && Number(prod.gst) > 0 ? (
                      <p className="text-[7px] text-green-600 font-bold uppercase mb-2 text-center">+ {prod.gst}% GST Inc.</p>
                    ) : (
                       <div className="h-3 mb-2"></div>
                    )}
                    <p className={`text-lg md:text-xl font-bold tracking-wide ${theme.text}`}>₹{calculatePrice(prod, rates).toLocaleString('en-IN')}</p>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 mt-auto">
                      <button onClick={() => handleEnquiry(prod)} className="w-full bg-pink-50 hover:bg-pink-100 border border-pink-100 text-pink-700 font-bold text-[8px] py-2.5 rounded-lg uppercase tracking-widest transition-colors">
                        Enquire
                      </button>
                      <div className="flex gap-1.5">
                          <button onClick={() => handleAddToCart(prod)} className="flex-1 bg-white border border-pink-200 hover:bg-pink-50 text-zinc-800 font-bold text-[8px] py-2.5 rounded-lg uppercase tracking-widest transition-colors">
                            Cart
                          </button>
                          <button onClick={() => handleBuyNow(prod)} className={`flex-1 ${theme.bg} ${theme.hover} ${theme.textOnBg} font-bold text-[8px] py-2.5 rounded-lg uppercase tracking-widest transition-all`}>
                            Buy
                          </button>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )} 
      </div>

      {/* 🛍️ SIDEBAR CART DRAWER (Lux Themed) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className={`p-6 border-b border-zinc-100 flex justify-between items-center ${theme.lightBg}`}>
              <div>
                <h2 className="text-lg font-extrabold uppercase tracking-widest text-zinc-900">Your Bag</h2>
                <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest mt-1">Review your selections</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white text-zinc-500 hover:text-black rounded-full shadow-sm transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-pink-50/30">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={40} className="text-zinc-200 mb-4" />
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Bag is Empty</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="w-20 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-pink-100 p-1 shadow-sm">
                      <img src={item.imageUrl} className="w-full h-full object-cover rounded-lg" alt={item.name} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold uppercase text-[11px] text-zinc-800 tracking-wider mb-1">{item.name}</h4>
                      <p className="text-[9px] text-zinc-500 font-medium uppercase mb-2">{item.weight}g • {item.metalType}</p>
                      <p className={`text-sm font-bold ${theme.text}`}>₹{(item.livePrice * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-pink-200 rounded-full p-1 bg-white shadow-sm">
                          <button onClick={() => updateQuantity(item.id, 'minus')} className="p-1 hover:bg-pink-50 rounded-full transition-all text-zinc-600"><Minus size={12} strokeWidth={3} /></button>
                          <span className="px-3 text-[11px] font-bold text-zinc-800">{item.quantity || 1}</span>
                          <button onClick={() => updateQuantity(item.id, 'plus')} className="p-1 hover:bg-pink-50 rounded-full transition-all text-zinc-600"><Plus size={12} strokeWidth={3} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 bg-white border-t border-pink-100 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Subtotal</span>
                  <span className="text-xl font-extrabold text-zinc-900 tracking-wide">
                    ₹{cartItems.reduce((total, item) => total + (item.livePrice * (item.quantity || 1)), 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <button 
                  onClick={() => router.push(`/checkout?shopId=${id}`)}
                  className={`w-full ${theme.bg} ${theme.textOnBg} ${theme.hover} font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95`}
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}