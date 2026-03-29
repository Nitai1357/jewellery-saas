"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Search, Package, CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";

export default function TrackOrderPage() {
  const { id } = useParams(); // URL se Shop ID mil jayegi
  const [mobile, setMobile] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [shopName, setShopName] = useState("The Boutique");

  // Shop ka naam fetch karne ke liye
  useEffect(() => {
    if (id) {
      getDoc(doc(db, "users", id as string)).then(snap => {
        if (snap.exists() && snap.data().shopName) {
          setShopName(snap.data().shopName);
        }
      });
    }
  }, [id]);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setSearched(false);
    
    try {
      // 🔥 YAHAN HAI MAGIC LOGIC: Sirf isi shop ke orders, aur is customer ke orders
      const q = query(
        collection(db, "online_orders"), 
        where("shopId", "==", id),       // Shop filter
        where("mobile", "==", mobile)    // Customer filter
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by newest first
      fetchedOrders.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] selection:bg-black selection:text-white">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 py-6 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl md:text-2xl font-serif italic tracking-widest text-[#111111] uppercase">{shopName}</h1>
        <Link href={`/shop/${id}`} className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Boutique
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-24">
        
        {/* SEARCH SECTION */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-light uppercase font-serif tracking-widest mb-4">Track Order</h2>
          <p className="text-gray-400 font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] mb-10">Enter your registered mobile number</p>
          
          <form onSubmit={handleTrackOrder} className="max-w-md mx-auto relative flex items-center shadow-sm">
            <input 
              type="tel" 
              placeholder="e.g. 9876543210" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-white border border-gray-200 px-6 py-5 rounded-full outline-none focus:border-black transition-colors text-sm font-medium tracking-widest"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="absolute right-2 bg-[#111111] hover:bg-black text-white p-3.5 rounded-full transition-all disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search size={18} />}
            </button>
          </form>
        </div>

        {/* RESULTS SECTION */}
        {searched && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
                <Package size={40} className="mx-auto text-gray-300 mb-6" strokeWidth={1} />
                <h3 className="text-lg font-serif italic tracking-widest text-[#111111] mb-2">No Orders Found</h3>
                <p className="text-gray-400 font-sans text-[10px] uppercase tracking-widest">We couldn't find any orders for {mobile} at {shopName}</p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-bold font-sans uppercase tracking-[0.2em] text-gray-400 mb-8 text-center">
                  Showing {orders.length} Order{orders.length > 1 ? 's' : ''}
                </p>
                
                <div className="grid gap-8">
                  {orders.map((order) => {
                    const isCompleted = order.status === "Completed" || order.status === "Delivered";

                    return (
                      <div key={order.id} className="bg-white border border-gray-100 p-6 md:p-10 rounded-[2rem] shadow-sm hover:shadow-lg transition-all duration-500 relative overflow-hidden group">
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-50 pb-6">
                          <div>
                            <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-gray-400 mb-2">Order ID: #{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-sm font-serif tracking-widest text-[#111111]">{formatDate(order.createdAt)}</p>
                          </div>
                          
                          {/* Live Status Pill */}
                          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border ${isCompleted ? 'bg-green-50 border-green-100 text-green-700' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
                            {isCompleted ? <CheckCircle2 size={16} /> : <Clock size={16} className="animate-pulse" />}
                            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em]">
                              {isCompleted ? 'Delivered' : 'Processing'}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-6 mb-10">
                          <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Items Included</p>
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-[#F9F9F9] rounded-xl overflow-hidden flex-shrink-0">
                                <img src={item.image || "/placeholder.jpg"} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xs md:text-sm font-light font-sans uppercase tracking-widest text-[#111111]">{item.name}</h4>
                                <p className="text-[9px] font-sans text-gray-400 tracking-[0.2em] uppercase mt-1">QTY: {item.quantity || 1}</p>
                              </div>
                              <div className="text-sm md:text-base font-light tracking-widest text-[#111111]">
                                ₹{item.price?.toLocaleString('en-IN')}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total & Delivery Address */}
                        <div className="bg-[#FAFAFA] p-6 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between gap-6 items-center md:items-end">
                          <div className="max-w-xs text-center md:text-left">
                            <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Delivery Address</p>
                            <p className="text-xs font-sans text-gray-500 leading-relaxed tracking-wider">{order.address}</p>
                          </div>
                          <div className="text-center md:text-right">
                            <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Grand Total</p>
                            <p className="text-2xl md:text-3xl font-serif italic tracking-widest text-[#111111]">
                              ₹{order.totalAmount?.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}