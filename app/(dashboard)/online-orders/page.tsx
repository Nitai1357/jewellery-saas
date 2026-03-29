"use client";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import { db } from "@/lib/firebase"; 
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 

function OnlineOrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopDetails, setShopDetails] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Pending" | "Completed">("ALL");
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentShopId = searchParams.get("shopId") || localStorage.getItem("shopId");
    setShopId(currentShopId);

    if (currentShopId) {
      getDoc(doc(db, "users", currentShopId)).then(snap => {
        if(snap.exists()) setShopDetails(snap.data());
      });

      const q = query(collection(db, "online_orders"), where("shopId", "==", currentShopId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(data);
        setLoading(false);
      }, (error) => {
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const deleteOrder = async (id: string) => {
    if (confirm("Kya aap is order ko delete karna chahte hain?")) {
      try { await deleteDoc(doc(db, "online_orders", id)); } catch (err) { alert("Delete fail ho gaya!"); }
    }
  };

  const updateOrderStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    try { await updateDoc(doc(db, "online_orders", id), { status: newStatus }); } catch (err) { alert("Status update fail ho gaya!"); }
  };

  // 🧾 🔥 DETAILED PRICE BREAKUP PDF GENERATOR 🔥 🧾
  const downloadInvoice = (order: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // --- HEADER (Shop Details) ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(234, 179, 8); 
    doc.text((shopDetails?.shopName || "Elite Jewellery").toUpperCase(), pageWidth/2, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    const shopAddr = shopDetails?.address ? doc.splitTextToSize(shopDetails.address, 120) : "Address Not Provided";
    doc.text(shopAddr, pageWidth/2, 26, { align: "center" });
    doc.text(`Phone: ${shopDetails?.whatsapp || shopDetails?.mobile || "N/A"}`, pageWidth/2, 34, { align: "center" });
    
    // 🔥 GST NUMBER BOLD & CLEAR 🔥
    if(shopDetails?.gstNo) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20, 20, 20); 
        doc.text(`GSTIN: ${shopDetails.gstNo}`, pageWidth/2, 40, { align: "center" });
    }

    doc.setDrawColor(200);
    doc.line(15, 45, pageWidth - 15, 45); 

    // --- INVOICE INFO ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40);
    doc.text("TAX INVOICE", pageWidth/2, 55, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    doc.text(`Invoice No: INV-${order.id.slice(0, 6).toUpperCase()}`, 15, 65);
    
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN') : "N/A";
    doc.text(`Date: ${orderDate}`, pageWidth - 15, 65, { align: "right" });
    doc.text(`Payment Mode: ${order.paymentMode || "N/A"}`, 15, 71);
    if(order.utrNumber && order.utrNumber !== 'N/A') doc.text(`UTR/Txn ID: ${order.utrNumber}`, pageWidth - 15, 71, { align: "right" });

    doc.setDrawColor(230);
    doc.line(15, 75, pageWidth - 15, 75); 

    // --- CUSTOMER DETAILS ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40);
    doc.text("Billed To:", 15, 85);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(order.name ? order.name.toUpperCase() : "Customer", 15, 92);
    doc.text(`Phone: ${order.mobile || "N/A"}`, 15, 98);
    const custAddr = order.address ? doc.splitTextToSize(order.address, 90) : "N/A";
    doc.text(custAddr, 15, 104);

    // --- 🔥 ITEM TABLE WITH BREAKUP 🔥 ---
    const tableRows = order.items?.map((item: any, index: number) => {
      const qty = item.quantity || 1;
      const totalAmount = Number(item.price || 0) * qty;
      
      const weight = item.weight || 0;
      const making = item.makingCharge || 0;
      const gstPercent = item.gst || 0;
      
      // Reverse Math for accurate breakup
      const basePrice = Math.round(totalAmount / (1 + (gstPercent / 100)));
      const gstAmount = totalAmount - basePrice;
      let goldValue = basePrice - (making * qty);
      if (goldValue < 0) goldValue = 0; 
      
      return [
        index + 1,
        `${item.name}\n(${item.metalType || '-'})`,
        weight > 0 ? `${weight}g` : "-",
        `Rs. ${goldValue.toLocaleString('en-IN')}`, // Gold Value
        `Rs. ${(making * qty).toLocaleString('en-IN')}`, // Making
        `${gstPercent}% (Rs. ${gstAmount.toLocaleString('en-IN')})`, // GST Amount
        `Rs. ${totalAmount.toLocaleString('en-IN')}`
      ];
    }) || [];

    autoTable(doc, {
      startY: 120,
      head: [['S.No', 'Item Details', 'Weight', 'Metal Value', 'Making Chg', 'GST Applied', 'Total']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' }, 
      styles: { fontSize: 9, cellPadding: 4, textColor: [60, 60, 60], valign: 'middle' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left' },
        2: { halign: 'center', cellWidth: 18 },
        3: { halign: 'right', cellWidth: 25 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'right', cellWidth: 30 },
        6: { halign: 'right', fontStyle: 'bold', cellWidth: 30 }
      }
    });

    // --- TOTAL CALCULATION ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Total amount includes all applicable taxes and making charges.", 15, finalY + 5);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(`Grand Total: Rs. ${Number(order.totalAmount || 0).toLocaleString('en-IN')}`, pageWidth - 15, finalY + 5, { align: "right" });

    doc.setDrawColor(40);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 85, finalY + 8, pageWidth - 15, finalY + 8);

    // --- FOOTER ---
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150);
    doc.text("Thank you for shopping with us!", pageWidth/2, finalY + 30, { align: "center" });
    doc.text("This is a computer-generated tax invoice. No signature is required.", pageWidth/2, finalY + 35, { align: "center" });

    doc.save(`${shopDetails?.shopName || "Invoice"}_${order.name || "Customer"}.pdf`);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === "ALL" ? true : (o.status || "Pending") === statusFilter;

      let matchesDate = true;
      if (filterDate) {
        if (!o.createdAt) {
          matchesDate = false;
        } else {
          let dateObj;
          if (o.createdAt.toDate) dateObj = o.createdAt.toDate();
          else if (o.createdAt.seconds) dateObj = new Date(o.createdAt.seconds * 1000);
          else return false;

          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          const formattedOrderDate = `${year}-${month}-${day}`;
          matchesDate = formattedOrderDate === filterDate;
        }
      }
      return matchesStatus && matchesDate;
    });
  }, [filterDate, orders, statusFilter]);

  if (!shopId && !loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-10">
        <div className="text-center border border-red-500/30 p-10 rounded-[3rem] bg-zinc-900/20">
          <h2 className="text-red-500 text-2xl font-black italic">SHOP ID MISSING</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">ONLINE <span className="text-orange-500">ORDERS</span></h1>
            <p className="text-zinc-500 font-mono text-[10px] mt-2 uppercase tracking-widest leading-relaxed">CONNECTED TERMINAL: <span className="text-orange-500/80">{shopId}</span></p>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800 shadow-2xl relative z-10">
              <button onClick={() => setStatusFilter("ALL")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${statusFilter === "ALL" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"}`}>All</button>
              <button onClick={() => setStatusFilter("Pending")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${statusFilter === "Pending" ? "bg-orange-500/20 text-orange-500" : "text-zinc-500 hover:text-white"}`}>Pending</button>
              <button onClick={() => setStatusFilter("Completed")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${statusFilter === "Completed" ? "bg-green-500/20 text-green-500" : "text-zinc-500 hover:text-white"}`}>Completed</button>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900/80 p-3 rounded-[1.5rem] border border-zinc-800 shadow-2xl relative z-20">
              <label htmlFor="order-date-filter" className="text-[10px] font-black text-zinc-500 ml-2 uppercase tracking-widest cursor-pointer">Date</label>
              <div className="relative flex items-center">
                <input id="order-date-filter" type="date" className="bg-black border-zinc-700 rounded-xl text-xs p-2 text-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer relative z-10 appearance-none" onChange={(e) => setFilterDate(e.target.value)} value={filterDate} style={{ colorScheme: "dark" }} />
              </div>
              {filterDate && (<button onClick={() => setFilterDate("")} className="text-xs text-red-500 hover:text-red-400 font-bold px-2 cursor-pointer z-10 relative">✕</button>)}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-600 animate-pulse font-bold tracking-[0.5em]">INITIALIZING SECURE LINK...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredOrders.length > 0 ? filteredOrders.map((order) => {
              const isCompleted = order.status === "Completed";
              const itemsListString = order.items?.map((item: any) => `${item.name} (Qty: ${item.quantity || 1})`).join(", ");

              return (
                <div key={order.id} className={`bg-zinc-900/30 border rounded-[2.5rem] overflow-hidden flex flex-col p-5 transition-all group relative ${isCompleted ? 'border-green-500/20 opacity-80 hover:opacity-100 hover:border-green-500/50' : 'border-zinc-800 hover:border-orange-500/50'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[9px] text-black px-3 py-1 rounded-lg font-black uppercase tracking-widest shadow-md ${isCompleted ? 'bg-green-500' : 'bg-orange-500'}`}>{isCompleted ? 'Delivered' : 'New Order'}</span>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Total Amount</p>
                      <p className="text-2xl font-black text-white leading-none">₹{order.totalAmount?.toLocaleString('en-IN') || "0"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-6 max-h-[160px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 items-center bg-black/50 p-2.5 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                        <div className="w-14 h-14 relative rounded-xl overflow-hidden border border-zinc-800 shrink-0 bg-[#0a0a0a]">
                          <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover" unoptimized />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xs font-bold text-zinc-200 leading-tight line-clamp-1 uppercase tracking-tight">{item.name || "Product Name"}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-orange-400 text-[11px] font-black">₹{item.price?.toLocaleString('en-IN') || "0"}</span>
                            <span className="bg-zinc-800 text-zinc-300 text-[9px] px-2 py-0.5 rounded-md font-black tracking-widest border border-zinc-700">QTY: {item.quantity || 1}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black/40 rounded-[2rem] p-5 space-y-3 border border-zinc-800/50 flex-1 mb-4">
                    <div className="flex items-start gap-3"><span className="text-[10px] font-bold text-zinc-500 uppercase min-w-[65px] mt-0.5">Customer:</span><span className="text-xs text-zinc-200 font-bold uppercase">{order.name || "Unknown"}</span></div>
                    <div className="flex items-start gap-3"><span className="text-[10px] font-bold text-zinc-500 uppercase min-w-[65px] mt-0.5">Address:</span><span className="text-[11px] text-zinc-400 leading-relaxed italic">{order.address || "No Address Provided"}</span></div>
                    <div className="flex items-start gap-3"><span className="text-[10px] font-bold text-zinc-500 uppercase min-w-[65px] mt-0.5">Phone:</span><span className="text-xs text-orange-400 font-mono tracking-tighter">{order.mobile || "N/A"}</span></div>
                    <div className="flex items-start gap-3"><span className="text-[10px] font-bold text-zinc-500 uppercase min-w-[65px] mt-0.5">Payment:</span><span className="text-[11px] text-zinc-300 font-medium">{order.paymentMode || "Pay at Boutique"}<br/>{order.utrNumber && order.utrNumber !== 'N/A' && <span className="text-yellow-500 text-[9px] font-mono border border-yellow-500/30 px-1 mt-1 inline-block bg-yellow-500/10">UTR: {order.utrNumber}</span>}</span></div>
                    <div className="pt-3 mt-1 border-t border-zinc-800 flex justify-between items-center"><span className="text-[9px] text-zinc-600 font-medium italic">{order.createdAt?.toDate().toLocaleString()}</span><span className={`text-[9px] font-bold uppercase tracking-widest ${isCompleted ? 'text-green-500' : 'text-zinc-500'}`}>{order.status || "PENDING"}</span></div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex gap-2">
                      <button onClick={() => updateOrderStatus(order.id, order.status || "Pending")} className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase transition-all shadow-lg tracking-widest ${isCompleted ? 'bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700' : 'bg-green-600 text-white border border-green-500 hover:bg-green-500 shadow-green-900/20'}`}>{isCompleted ? "Mark Pending" : "Complete ✔"}</button>
                      <button onClick={() => downloadInvoice(order)} className="px-6 bg-blue-600/20 text-blue-400 border border-blue-500/30 py-3.5 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center" title="Download Bill PDF">BILL 📄</button>
                      <button onClick={() => deleteOrder(order.id)} className="px-4 bg-red-950/10 text-red-500 border border-red-900/30 py-3.5 rounded-2xl text-[12px] font-black hover:bg-red-600 hover:text-white transition-all flex items-center justify-center" title="Delete Order">🗑️</button>
                    </div>
                    <a href={`https://wa.me/+91${order.mobile}?text=${encodeURIComponent(`Namaste ${order.name},\n\nWe have received your order for:\n👉 ${itemsListString}\n\n*Total Amount:* ₹${order.totalAmount?.toLocaleString('en-IN')}\n\nWe will process it shortly and contact you.`)}`} target="_blank" className="w-full bg-[#111] border border-zinc-800 text-zinc-300 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all mt-1">WhatsApp Customer</a>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-zinc-900 rounded-[4rem]"><div className="text-zinc-800 text-6xl mb-4 italic font-black uppercase underline decoration-orange-500">Void</div><p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs">No orders found.</p></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnlineOrdersPageWrapper() {
  return (
    <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center"><div className="text-orange-500 font-black animate-pulse tracking-widest">LOADING SESSION...</div></div>}>
      <OnlineOrdersContent />
    </Suspense>
  );
}