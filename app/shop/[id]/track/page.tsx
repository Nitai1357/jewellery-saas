"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Search, Package, CheckCircle2, Clock, ArrowLeft, Download } from "lucide-react";
import { useParams } from "next/navigation";

export default function TrackOrderPage() {
  const { id } = useParams(); 
  const [mobile, setMobile] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const [shopData, setShopData] = useState<any>(null);
  const [shopName, setShopName] = useState("The Boutique");

  useEffect(() => {
    if (id) {
      getDoc(doc(db, "users", id as string)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setShopData(data);
          setShopName(data.shopName || "The Boutique");
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
      // 🔥 FIX: Firebase Index Error se bachne ke liye sirf mobile se filter karenge
      const q = query(
        collection(db, "online_orders"), 
        where("mobile", "==", mobile)    
      );
      
      const querySnapshot = await getDocs(q);
      
      // 🔥 AUR YAHAN JS mein hum usko Current Shop ID se match kar lenge (No index required!)
      const fetchedOrders = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((order: any) => order.shopId === id); // Sirf is dukaan ke orders rakho

      // Naye orders upar dikhane ke liye sort
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

  const formatDateForDisplay = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // 🔥 100% SAME-TO-SAME INVOICE GENERATOR 🔥
  const handleDownloadInvoice = async (order: any) => {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default; 
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      let yPos = 20;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice No: INV-${order.id.slice(0, 6).toUpperCase()}`, 14, yPos);
      yPos += 8;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(shopName.toUpperCase(), 14, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(shopData?.address || "BBSR", 14, yPos);
      yPos += 5;
      doc.text(`Phone: ${shopData?.mobile || "N/A"}`, 14, yPos);
      yPos += 5;
      doc.text(`Payment Mode: Pay at Boutique`, 14, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("TAX INVOICE", pageWidth / 2, yPos, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const orderDate = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date();
      const dateStr = `${orderDate.getDate()}/${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
      doc.text(`Date: ${dateStr}`, pageWidth - 14, yPos, { align: "right" });
      yPos += 10;

      doc.setFont("helvetica", "bold");
      doc.text("Billed To:", 14, yPos);
      yPos += 6;

      const customerFullName = order.customerName || order.customer || order.name || "CUSTOMER";
      doc.text(customerFullName.toUpperCase(), 14, yPos);
      yPos += 5;

      doc.setFont("helvetica", "normal");
      doc.text(`Phone: ${order.mobile}`, 14, yPos);
      yPos += 5;

      const splitAddress = doc.splitTextToSize(order.address || "N/A", 80);
      doc.text(splitAddress, 14, yPos);
      yPos += (splitAddress.length * 5) + 5;

      const tableData = order.items?.map((item: any, index: number) => {
        return [
          (index + 1).toString(),
          `${item.name}\n(${item.metalType || 'Silver'})`,
          item.weight ? `${item.weight}g` : "-",
          "Rs. 0",
          item.makingCharge ? `Rs. ${item.makingCharge}` : "Rs. 0",
          item.gst ? `${item.gst}%` : "-",
          `Rs. ${item.price?.toLocaleString('en-IN') || 0}`
        ];
      }) || [];

      autoTable(doc, {
        startY: yPos,
        head: [['S/N', 'Item Details', 'Weight', 'Metal Value', 'Making Chg', 'GST Applied', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, lineColor: [0, 0, 0] },
        bodyStyles: { textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Total amount includes all applicable taxes and making charges.", 14, finalY);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Grand Total: Rs. ${order.totalAmount?.toLocaleString('en-IN') || 0}`, 14, finalY + 10);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Thank you for shopping with us!", 14, finalY + 25);
      doc.text("This is a computer-generated tax invoice. No signature is required.", 14, finalY + 31);

      doc.save(`Invoice_${order.id.slice(0, 6)}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Failed to generate PDF. Make sure jspdf and jspdf-autotable are installed.");
    }
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
                            <p className="text-sm font-serif tracking-widest text-[#111111]">{formatDateForDisplay(order.createdAt)}</p>
                          </div>
                          
                          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border ${isCompleted ? 'bg-green-50 border-green-100 text-green-700' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
                            {isCompleted ? <CheckCircle2 size={16} /> : <Clock size={16} className="animate-pulse" />}
                            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em]">
                              {isCompleted ? 'Delivered' : 'Processing'}
                            </span>
                          </div>
                        </div>

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

                        <div className="bg-[#FAFAFA] p-6 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between gap-6 items-center md:items-end">
                          <div className="max-w-xs text-center md:text-left">
                            <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Delivery Address</p>
                            <p className="text-xs font-sans text-gray-500 leading-relaxed tracking-wider">{order.address}</p>
                          </div>
                          
                          <div className="text-center md:text-right flex flex-col items-center md:items-end">
                            <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Grand Total</p>
                            <p className="text-2xl md:text-3xl font-serif italic tracking-widest text-[#111111] mb-4">
                              ₹{order.totalAmount?.toLocaleString('en-IN')}
                            </p>
                            
                            {isCompleted && (
                              <button 
                                onClick={() => handleDownloadInvoice(order)}
                                className="flex items-center gap-2 bg-white border border-gray-200 hover:border-black text-black px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md"
                              >
                                <Download size={14} /> Download Invoice
                              </button>
                            )}
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