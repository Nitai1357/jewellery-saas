'use client'
import { useState, useEffect, Suspense } from 'react';
import { db } from '@/lib/firebase'; 
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'; 
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, MapPin, ReceiptText, QrCode, ArrowLeft, Wallet, Store, CalendarHeart } from 'lucide-react';
import Link from 'next/link';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({ 
    name: '', mobile: '', street: '', city: '', state: '', pincode: '', dob: '', anniversary: ''
  });
  
  const [paymentMode, setPaymentMode] = useState<'pay_now' | 'pay_at_store'>('pay_now');
  const [utrNumber, setUtrNumber] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [shopId, setShopId] = useState("");
  const [shopInfo, setShopInfo] = useState<any>(null);

  useEffect(() => {
    const urlShopId = searchParams.get('shopId');
    if (urlShopId) {
      setShopId(urlShopId);
      const savedCart = JSON.parse(localStorage.getItem(`cart_${urlShopId}`) || '[]');
      setCartItems(savedCart);
      getDoc(doc(db, "users", urlShopId)).then((snap) => {
        if (snap.exists()) setShopInfo(snap.data());
      });
    }
  }, [searchParams]);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; 
    if (!formData.name || !formData.mobile || !formData.street || !formData.city || !formData.state || !formData.pincode) {
      alert("Please fill all compulsory address and contact details!"); return;
    }
    if (formData.pincode.length !== 6) {
      alert("Please enter a valid 6-digit Pincode."); return;
    }
    if (paymentMode === 'pay_now' && utrNumber.length < 8) {
      alert("Please enter a valid Transaction / UTR Number!"); return;
    }

    try {
      setIsSubmitting(true);
      const extractedShopId = shopId || cartItems[0]?.shopId || "";
      if (!extractedShopId) { alert("Shop details missing!"); return; }

      // 🔥 NAYA LOGIC: Order save karte waqt WEIGHT, GST, aur MAKING bhi bhej rahe hain
      const orderItems = cartItems.map(item => ({
        name: item.name || item.productName || "Jewellery Product",
        quantity: Number(item.quantity) || 1,
        price: Number(item.livePrice || item.price || 0),
        weight: Number(item.weight) || 0,
        makingCharge: Number(item.makingCharge) || 0,
        gst: Number(item.gst) || 0,
        metalType: item.metalType || "Jewellery",
        image: item.image || item.imageUrl || item.productImage || "" 
      }));

      const calculatedTotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

      const orderData = {
        name: formData.name,
        mobile: formData.mobile,
        address: fullAddress, 
        dob: formData.dob || "Not Provided",                
        anniversary: formData.anniversary || "Not Provided", 
        shopId: extractedShopId, 
        items: orderItems,
        totalAmount: calculatedTotal,
        paymentMode: paymentMode === 'pay_now' ? 'Online (UPI/QR)' : 'Pay at Boutique',
        utrNumber: paymentMode === 'pay_now' ? utrNumber : 'N/A',
        status: paymentMode === 'pay_now' ? "Payment Verification Pending" : "Pending",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "online_orders"), orderData);
      localStorage.removeItem(`cart_${extractedShopId}`); 
      alert(paymentMode === 'pay_now' ? "🎉 Payment Details Submitted!" : "🎉 Order Placed Successfully!");
      router.push(`/shop/${extractedShopId}`); 
      
    } catch (error) {
      alert("Order failed! Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = cartItems.reduce((total, item) => total + (Number(item.livePrice || item.price || 0) * (item.quantity || 1)), 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 selection:bg-yellow-500 selection:text-black pb-20">
      <div className="bg-white border-b border-zinc-200 px-6 py-6 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <Link href={`/shop/${shopId}`} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors"><ArrowLeft size={20} className="text-zinc-600" /></Link>
        <h1 className="text-xl font-black uppercase tracking-widest text-zinc-900">Secure Checkout</h1>
      </div>
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-zinc-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600"><MapPin size={20} /></div>
              <h2 className="text-lg font-black uppercase tracking-widest">Shipping & Profile</h2>
            </div>
            <form id="checkout-form" onSubmit={handleConfirmOrder} className="space-y-5">
              <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Full Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-yellow-500 focus:bg-white outline-none transition-all font-bold text-sm text-black" placeholder="John Doe" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Mobile Number *</label><input type="tel" maxLength={10} required value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-yellow-500 focus:bg-white outline-none transition-all font-bold text-sm text-black" placeholder="9876543210" /></div>
              <div className="grid grid-cols-2 gap-4 bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100/50">
                <div className="col-span-2 flex items-center gap-2 mb-1"><CalendarHeart size={14} className="text-yellow-600" /><span className="text-[9px] font-black uppercase tracking-widest text-yellow-700">Special Dates (Get Offers)</span></div>
                <div className="space-y-1.5"><label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Date of Birth</label><input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full p-3 bg-white border border-zinc-200 rounded-xl focus:border-yellow-500 outline-none transition-all font-bold text-xs text-black cursor-pointer" /></div>
                <div className="space-y-1.5"><label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Anniversary</label><input type="date" value={formData.anniversary} onChange={(e) => setFormData({...formData, anniversary: e.target.value})} className="w-full p-3 bg-white border border-zinc-200 rounded-xl focus:border-yellow-500 outline-none transition-all font-bold text-xs text-black cursor-pointer" /></div>
              </div>
              <div className="space-y-1.5 pt-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">House No. & Street *</label><input type="text" required value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-yellow-500 focus:bg-white outline-none transition-all font-bold text-sm text-black" placeholder="Flat No, Building, Street Name" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">City *</label><input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-yellow-500 focus:bg-white outline-none transition-all font-bold text-sm text-black" placeholder="City" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Pincode *</label><input type="text" maxLength={6} required value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-yellow-500 focus:bg-white outline-none transition-all font-bold text-sm text-black" placeholder="000000" /></div>
              </div>
              <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">State *</label><input type="text" required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-yellow-500 focus:bg-white outline-none transition-all font-bold text-sm text-black" placeholder="State" /></div>
            </form>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border-t-[8px] border-zinc-900 relative overflow-hidden">
            <div className="absolute top-4 right-6 opacity-10"><ReceiptText size={80} /></div>
            <div className="border-b border-zinc-200 pb-6 mb-6">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-zinc-900 mb-1">{shopInfo?.shopName || "Jewellery Boutique"}</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3">Official Invoice</p>
              <div className="space-y-1">
                <p className="text-xs text-zinc-600"><strong>Address:</strong> {shopInfo?.address || "Address not provided"}</p>
                <p className="text-xs text-zinc-600"><strong>Contact:</strong> {shopInfo?.whatsapp || shopInfo?.mobile || "N/A"}</p>
                {shopInfo?.gstNo && (<p className="text-xs text-zinc-600 bg-yellow-50 inline-block px-2 py-1 mt-1 rounded font-bold border border-yellow-200">GSTIN: {shopInfo.gstNo}</p>)}
              </div>
            </div>
            <div className="space-y-4 mb-6">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-100 rounded-lg overflow-hidden"><img src={item.image || item.imageUrl} className="w-full h-full object-cover mix-blend-multiply" /></div>
                    <div><span className="text-zinc-800 uppercase text-xs font-bold">{item.name || item.productName}</span><p className="text-[10px] text-zinc-500">Qty: {item.quantity || 1}</p></div>
                  </div>
                  <span className="text-black font-bold">₹{(Number(item.livePrice || item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
              <div className="flex justify-between items-end">
                <div><span className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Grand Total</span><span className="block text-[8px] text-zinc-400 uppercase">(Inclusive of all Taxes)</span></div>
                <span className="text-3xl font-black italic tracking-tighter text-zinc-900">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          <div className="bg-[#111] p-6 md:p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-center">Select Payment Method</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div onClick={() => setPaymentMode('pay_now')} className={`cursor-pointer border-2 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${paymentMode === 'pay_now' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}><QrCode size={24} /><span className="text-[9px] font-black uppercase tracking-widest text-center">Pay Now<br/>(UPI / QR)</span></div>
              <div onClick={() => setPaymentMode('pay_at_store')} className={`cursor-pointer border-2 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${paymentMode === 'pay_at_store' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}><Store size={24} /><span className="text-[9px] font-black uppercase tracking-widest text-center">Pay at<br/>Boutique</span></div>
            </div>
            {paymentMode === 'pay_now' ? (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                {shopInfo?.qrUrl ? (<div className="w-40 h-40 mx-auto bg-white p-3 rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-4 transform hover:scale-105 transition-transform"><img src={shopInfo.qrUrl} alt="Store Payment QR" className="w-full h-full object-contain" /></div>) : (<div className="w-full py-6 bg-zinc-900 mx-auto flex flex-col items-center justify-center text-zinc-600 font-black rounded-2xl text-[10px] uppercase tracking-widest text-center border-2 border-dashed border-zinc-800 mb-4">No QR Uploaded by Store</div>)}
                {shopInfo?.upiId && (<div className="text-center mb-6"><div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full"><p className="text-yellow-500 font-bold tracking-[0.1em] text-[10px] uppercase">UPI: {shopInfo.upiId}</p></div></div>)}
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Transaction ID / UTR Number *</label><input type="text" value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} placeholder="Enter 12-digit UTR No. after payment" className="w-full p-4 bg-black border border-zinc-800 rounded-2xl focus:border-yellow-500 outline-none transition-all font-bold text-sm text-white text-center tracking-widest" /></div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-black/50 p-6 rounded-2xl border border-white/5 text-center"><Wallet size={32} className="mx-auto text-zinc-500 mb-3" /><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-relaxed">Your order will be reserved.<br/>Please visit our boutique to complete the payment and collect your jewellery.</p></div>
            )}
            <div className="flex items-center justify-center gap-2 mt-6 text-zinc-400"><ShieldCheck size={14} className="text-green-500" /><p className="text-[9px] font-bold uppercase tracking-widest">100% Secure Checkout</p></div>
          </div>
          <button form="checkout-form" type="submit" disabled={isSubmitting || cartItems.length === 0} className={`w-full ${isSubmitting || cartItems.length === 0 ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_15px_30px_rgba(234,179,8,0.3)] hover:shadow-[0_20px_40px_rgba(234,179,8,0.4)]'} font-black py-6 rounded-[2rem] transition-all transform active:scale-95 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3`}>
            {isSubmitting ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : (paymentMode === 'pay_now' ? "Verify Payment & Place Order" : "Confirm Order & Pay at Boutique")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><div className="text-yellow-500 font-black animate-pulse tracking-[0.3em] uppercase text-sm">Preparing Checkout...</div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}