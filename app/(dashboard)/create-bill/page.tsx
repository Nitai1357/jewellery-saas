"use client";
import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Plus, Trash2, ArrowLeft, Receipt, User, Gem } from "lucide-react";
import Link from "next/link";

export default function CreateBillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shopDetails, setShopDetails] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ name: "", metalType: "22K Gold", weight: "", price: "", makingCharge: "", gst: "3" });
  const [paymentMode, setPaymentMode] = useState("Cash");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setShopDetails(snap.data());
        setLoading(false);
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) return alert("Please enter Product Name and Metal Value!");
    setItems([...items, { ...newItem, quantity: 1 }]);
    setNewItem({ name: "", metalType: "22K Gold", weight: "", price: "", makingCharge: "", gst: "3" });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateGrandTotal = () => {
    return items.reduce((total, item) => {
      const metalVal = Number(item.price) || 0;
      const making = Number(item.makingCharge) || 0;
      const base = metalVal + making;
      const gstAmt = base * ((Number(item.gst) || 0) / 100);
      return total + base + gstAmt;
    }, 0);
  };

  const generateAndSaveBill = async () => {
    if (!customer.name || !customer.phone) return alert("Please enter Customer Name and Phone!");
    if (items.length === 0) return alert("Please add at least one item to the bill!");

    const grandTotal = calculateGrandTotal();

    try {
      // 1. Save to Firebase (Online Orders table as a Walk-in Order)
      const orderData = {
        name: customer.name,
        mobile: customer.phone,
        address: customer.address || "Walk-in Customer",
        shopId: currentUserId,
        items: items.map(i => ({
            name: i.name,
            metalType: i.metalType,
            weight: Number(i.weight),
            price: (Number(i.price) + Number(i.makingCharge)) * (1 + (Number(i.gst)/100)), // Total item price
            rawPrice: Number(i.price),
            makingCharge: Number(i.makingCharge),
            gst: Number(i.gst),
            quantity: 1
        })),
        totalAmount: grandTotal,
        paymentMode: paymentMode,
        utrNumber: "Walk-in Offline",
        status: "Completed", // Auto completed for walk-ins
        orderType: "Walk-in POS",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "online_orders"), orderData);

      // 2. Generate PDF (Same as Online Orders logic)
      const docPdf = new jsPDF();
      const pageWidth = docPdf.internal.pageSize.getWidth();
      
      docPdf.setFontSize(22);
      docPdf.setFont("helvetica", "bolditalic");
      docPdf.setTextColor(234, 179, 8); 
      docPdf.text((shopDetails?.shopName || "Elite Jewellery").toUpperCase(), pageWidth/2, 20, { align: "center" });
      
      docPdf.setFontSize(10);
      docPdf.setFont("helvetica", "normal");
      docPdf.setTextColor(80);
      docPdf.text(shopDetails?.address || "Address Not Provided", pageWidth/2, 26, { align: "center" });
      docPdf.text(`Phone: ${shopDetails?.whatsapp || shopDetails?.mobile || "N/A"}`, pageWidth/2, 34, { align: "center" });
      
      if(shopDetails?.gstNo) {
          docPdf.setFontSize(11);
          docPdf.setFont("helvetica", "bold");
          docPdf.setTextColor(20, 20, 20); 
          docPdf.text(`GSTIN: ${shopDetails.gstNo}`, pageWidth/2, 40, { align: "center" });
      }

      docPdf.setDrawColor(200);
      docPdf.line(15, 45, pageWidth - 15, 45); 

      docPdf.setFontSize(16);
      docPdf.setFont("helvetica", "bold");
      docPdf.setTextColor(40);
      docPdf.text("TAX INVOICE", pageWidth/2, 55, { align: "center" });

      docPdf.setFontSize(10);
      docPdf.setFont("helvetica", "normal");
      docPdf.setTextColor(60);
      docPdf.text(`Invoice No: INV-${docRef.id.slice(0, 6).toUpperCase()}`, 15, 65);
      docPdf.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 15, 65, { align: "right" });
      docPdf.text(`Payment Mode: ${paymentMode}`, 15, 71);

      docPdf.setDrawColor(230);
      docPdf.line(15, 75, pageWidth - 15, 75); 

      docPdf.setFontSize(11);
      docPdf.setFont("helvetica", "bold");
      docPdf.setTextColor(40);
      docPdf.text("Billed To (Walk-in):", 15, 85);
      
      docPdf.setFontSize(10);
      docPdf.setFont("helvetica", "normal");
      docPdf.text(customer.name.toUpperCase(), 15, 92);
      docPdf.text(`Phone: ${customer.phone}`, 15, 98);
      if(customer.address) docPdf.text(customer.address, 15, 104);

      const tableRows = items.map((item, index) => {
        const metalVal = Number(item.price) || 0;
        const making = Number(item.makingCharge) || 0;
        const gstPercent = Number(item.gst) || 0;
        const basePrice = metalVal + making;
        const gstAmount = basePrice * (gstPercent / 100);
        const total = basePrice + gstAmount;
        
        return [
          index + 1,
          `${item.name}\n(${item.metalType || '-'})`,
          item.weight ? `${item.weight}g` : "-",
          `Rs. ${metalVal.toLocaleString('en-IN')}`,
          `Rs. ${making.toLocaleString('en-IN')}`,
          `${gstPercent}% (Rs. ${Math.round(gstAmount).toLocaleString('en-IN')})`,
          `Rs. ${Math.round(total).toLocaleString('en-IN')}`
        ];
      });

      autoTable(docPdf, {
        startY: 115,
        head: [['S.No', 'Item Details', 'Weight', 'Metal Value', 'Making Chg', 'GST Applied', 'Total']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' }, 
        styles: { fontSize: 9, cellPadding: 4, textColor: [60, 60, 60], valign: 'middle' },
        columnStyles: { 0: { halign: 'center', cellWidth: 10 }, 1: { halign: 'left' }, 2: { halign: 'center', cellWidth: 18 }, 3: { halign: 'right', cellWidth: 25 }, 4: { halign: 'right', cellWidth: 25 }, 5: { halign: 'right', cellWidth: 30 }, 6: { halign: 'right', fontStyle: 'bold', cellWidth: 30 } }
      });

      const finalY = (docPdf as any).lastAutoTable.finalY + 10;
      docPdf.setFontSize(10);
      docPdf.setFont("helvetica", "normal");
      docPdf.text("Total amount includes all applicable taxes and making charges.", 15, finalY + 5);
      docPdf.setFontSize(14);
      docPdf.setFont("helvetica", "bold");
      docPdf.setTextColor(0);
      docPdf.text(`Grand Total: Rs. ${Math.round(grandTotal).toLocaleString('en-IN')}`, pageWidth - 15, finalY + 5, { align: "right" });

      docPdf.setDrawColor(40);
      docPdf.setLineWidth(0.5);
      docPdf.line(pageWidth - 85, finalY + 8, pageWidth - 15, finalY + 8);

      docPdf.setFontSize(9);
      docPdf.setFont("helvetica", "italic");
      docPdf.setTextColor(150);
      docPdf.text("Thank you for shopping with us!", pageWidth/2, finalY + 30, { align: "center" });
      docPdf.text("This is a computer-generated tax invoice. No signature is required.", pageWidth/2, finalY + 35, { align: "center" });

      docPdf.save(`WalkIn_Invoice_${customer.name}.pdf`);
      
      alert("Bill Generated and Saved Successfully!");
      router.push("/dashboard");

    } catch (error) {
      console.error(error);
      alert("Error generating bill!");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="text-yellow-500 animate-pulse font-black tracking-widest">LOADING POS...</div></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-yellow-500 selection:text-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><ArrowLeft size={20} className="text-yellow-500" /></Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">Instant <span className="text-yellow-500">Billing</span></h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Walk-in Customer POS</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Customer & Adding Items */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] shadow-xl">
              <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2"><User size={16} className="text-yellow-500"/> Customer Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Customer Name *" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="col-span-2 md:col-span-1 p-4 bg-black border border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-yellow-500" />
                <input type="text" placeholder="Mobile Number *" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="col-span-2 md:col-span-1 p-4 bg-black border border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-yellow-500" />
                <input type="text" placeholder="City / Address (Optional)" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="col-span-2 p-4 bg-black border border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-yellow-500" />
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] shadow-xl">
              <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2"><Gem size={16} className="text-yellow-500"/> Add Jewellery Item</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Product Name *" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="col-span-2 md:col-span-3 p-4 bg-black border border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-yellow-500" />
                
                <select value={newItem.metalType} onChange={e => setNewItem({...newItem, metalType: e.target.value})} className="p-4 bg-black border border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-yellow-500 text-zinc-300">
                  <option>22K Gold</option><option>24K Gold</option><option>18K Gold</option><option>Silver</option><option>Diamond</option>
                </select>
                <input type="number" placeholder="Weight (grams)" value={newItem.weight} onChange={e => setNewItem({...newItem, weight: e.target.value})} className="p-4 bg-black border border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-yellow-500" />
                <input type="number" placeholder="Metal Value (₹) *" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="p-4 bg-black border border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-yellow-500" />
                
                <input type="number" placeholder="Making Chg (₹)" value={newItem.makingCharge} onChange={e => setNewItem({...newItem, makingCharge: e.target.value})} className="p-4 bg-black border border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-yellow-500" />
                <select value={newItem.gst} onChange={e => setNewItem({...newItem, gst: e.target.value})} className="p-4 bg-black border border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-yellow-500 text-zinc-300">
                  <option value="3">GST: 3%</option><option value="0">GST: 0%</option><option value="1.5">GST: 1.5%</option>
                </select>
                
                <button onClick={handleAddItem} className="md:col-span-3 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all flex justify-center items-center gap-2">
                  <Plus size={16}/> Add to Bill
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Cart & Checkout */}
          <div className="lg:col-span-5">
            <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] shadow-xl sticky top-6">
              <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-6 flex items-center gap-2"><Receipt size={16} className="text-yellow-500"/> Current Bill</h2>
              
              <div className="space-y-3 min-h-[150px] max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {items.length === 0 ? <p className="text-zinc-600 text-xs text-center italic mt-10">No items added yet.</p> : items.map((item, idx) => (
                  <div key={idx} className="bg-black border border-zinc-800 p-3 rounded-xl flex justify-between items-center group">
                    <div>
                      <p className="font-bold text-sm text-white uppercase">{item.name}</p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">{item.weight ? `${item.weight}g • ` : ''}₹{item.price} + ₹{item.makingCharge} Mk + {item.gst}% GST</p>
                    </div>
                    <button onClick={() => handleRemoveItem(idx)} className="text-zinc-600 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800 pt-4 mb-6">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Grand Total</span>
                  <span className="text-3xl font-black italic text-yellow-500 tracking-tighter">₹{Math.round(calculateGrandTotal()).toLocaleString('en-IN')}</span>
                </div>
                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full p-4 bg-black border border-zinc-800 rounded-xl text-xs font-bold uppercase tracking-widest outline-none focus:border-yellow-500 text-zinc-300">
                  <option value="Cash">Payment: Cash</option>
                  <option value="UPI / QR">Payment: UPI / QR</option>
                  <option value="Card Swipe">Payment: Card Swipe</option>
                  <option value="Bank Transfer">Payment: Bank Transfer</option>
                </select>
              </div>

              <button onClick={generateAndSaveBill} disabled={items.length === 0} className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] ${items.length === 0 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400 text-black active:scale-95'}`}>
                Print Bill & Save Order
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}