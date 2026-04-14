"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { ShoppingBag, X, Plus, Minus } from "lucide-react";

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

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const shopId = params.id as string; 
  const productId = params.productId as string;

  const [product, setProduct] = useState<any>(null);
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Cart States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const theme = getShopTheme(shopId);

  // 🔥 LIVE PRICE CALCULATOR
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
    if (!shopId || !productId) return;

    // 1. Fetch Product
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    // 2. Listen to Live Rates
    const unsubRates = onSnapshot(doc(db, "prices", shopId), (docSnap) => {
      if (docSnap.exists()) {
        const latestRates = docSnap.data();
        setRates(latestRates);

        // Update cart prices if rates change
        const cartKey = `cart_${shopId}`;
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

    // 3. Load Cart
    const cartKey = `cart_${shopId}`;
    const savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    setCartItems(savedCart);

    return () => unsubRates();
  }, [shopId, productId]);

  // 🔥 CART FUNCTIONS
  const handleAddToCart = () => {
    if (!product) return;
    
    const cartKey = `cart_${shopId}`;
    const currentCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const existingIndex = currentCart.findIndex((item: any) => item.id === product.id);
    let newCart = [...currentCart];

    if (existingIndex > -1) {
        newCart[existingIndex].quantity += 1;
    } else {
        newCart.push({ ...product, quantity: 1, livePrice: calculatePrice(product, rates), shopId });
    }

    setCartItems(newCart);
    localStorage.setItem(cartKey, JSON.stringify(newCart));
    setIsCartOpen(true); 
  };

  const updateQuantity = (prodId: string, action: 'plus' | 'minus') => {
    const cartKey = `cart_${shopId}`;
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

  // WhatsApp Enquiry Function
  const handleWhatsAppEnquiry = () => {
    if (!product) return;
    const price = calculatePrice(product, rates);
    const msg = `Namaste, I'm interested in:\n*Item:* ${product.name}\n*Weight:* ${product.weight}g\n*Price:* ₹${price.toLocaleString('en-IN')}\n\nPlease share more details.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
        <h1 className="text-2xl font-black text-zinc-800 uppercase tracking-widest">Product Not Found</h1>
      </div>
    );
  }

  const livePrice = calculatePrice(product, rates);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 pb-20 relative font-sans">
      
      {/* 🛍️ LUXURY STICKY HEADER (WITH CART) */}
      <div className={`sticky top-0 z-40 bg-white/40 backdrop-blur-md border-b-[3px] ${theme.border} p-4 shadow-sm`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={() => router.back()} className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
            <span className="bg-white/60 w-8 h-8 flex items-center justify-center rounded-full group-hover:bg-pink-100 transition-all shadow-sm">←</span> 
            Back
          </button>
          
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

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-16 mt-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-[40px] shadow-xl overflow-hidden flex flex-col md:flex-row border border-pink-100">
          
          {/* 📸 LEFT SIDE: Image Section */}
          <div className={`w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center ${theme.lightBg}`}>
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full max-w-md aspect-square object-cover rounded-3xl shadow-lg border-4 border-white"
            />
          </div>

          {/* 📝 RIGHT SIDE: Details & Actions */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            
            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${theme.bg} ${theme.textOnBg} w-max mb-4 shadow-sm`}>
              {product.category}
            </span>

            <h1 className="text-3xl md:text-5xl font-black text-zinc-900 uppercase tracking-wide mb-2">
              {product.name}
            </h1>
            
            {/* 🔥 LIVE PRICE */}
            <p className={`text-4xl font-black mb-6 ${theme.text}`}>
              ₹{livePrice.toLocaleString('en-IN')}
            </p>

            {/* Price Breakdown */}
            <div className="bg-pink-50/50 rounded-2xl p-5 mb-8 border border-pink-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Price Breakdown</h3>
              <div className="flex justify-between text-sm font-semibold text-zinc-700 mb-2">
                <span>Making Charges</span>
                <span>₹{product.makingCharge}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-zinc-700">
                <span>GST ({product.gst || 0}%)</span>
                <span>Included</span>
              </div>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="border border-pink-100 bg-white rounded-2xl p-4 text-center shadow-sm">
                <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Weight</span>
                <span className="text-lg font-bold text-zinc-800">{product.weight} Grams</span>
              </div>
              <div className="border border-pink-100 bg-white rounded-2xl p-4 text-center shadow-sm">
                <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Purity</span>
                <span className="text-lg font-bold text-zinc-800">{product.metalType}</span>
              </div>
            </div>

            {/* 🛒 Action Buttons */}
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleAddToCart}
                className={`w-full ${theme.bg} ${theme.textOnBg} ${theme.hover} py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all`}
              >
                🛍️ Add to Cart
              </button>
              
              <button 
                onClick={handleWhatsAppEnquiry}
                className="w-full bg-green-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-green-600 active:scale-95 transition-all"
              >
                💬 Enquire on WhatsApp
              </button>
            </div>

            <p className="text-center text-[10px] font-bold text-zinc-400 mt-6 uppercase tracking-wider">
              🔒 100% Certified & Secure Delivery
            </p>

          </div>
        </div>
      </div>

      {/* 🛍️ SIDEBAR CART DRAWER (Exact same as Category Page) */}
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
                  onClick={() => router.push(`/checkout?shopId=${shopId}`)}
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