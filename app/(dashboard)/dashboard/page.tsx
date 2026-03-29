"use client";
import { useState, useEffect, useMemo } from "react";
import { db, auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import * as XLSX from "xlsx";
import { collection, onSnapshot, query, orderBy, updateDoc, doc, getDoc, where, limit, setDoc, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
// 🔥 NAYA: Receipt icon added below
import { Menu, X, Plus, Image as ImageIcon, Users, LineChart, Package, LogOut, Globe, Download, TrendingUp, Gift, Receipt } from "lucide-react"; 

export default function FastDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [rates, setRates] = useState<any>(null);
  const [ownerData, setOwnerData] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState("all"); 
  const [showModal, setShowModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  
  // 🔥 NAYA: EVENTS MODAL STATE 🔥
  const [showEventsModal, setShowEventsModal] = useState(false);
  
  const [showInventory, setShowInventory] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [tempStatus, setTempStatus] = useState("");
  const [tempRemark, setTempRemark] = useState(""); 
  const [extraRemarks, setExtraRemarks] = useState(""); 
  const [newRates, setNewRates] = useState({ gold22k: "", gold24k: "", silver: "" });
  const [searchQuery, setSearchQuery] = useState("");
  
  const [currentUserId, setCurrentUserId] = useState(""); 
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allBanners, setAllBanners] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [bannersCount, setBannersCount] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthLoading(false);
        setCurrentUserId(user.uid);

        getDoc(doc(db, "users", user.uid)).then(snap => {
          if (snap.exists()) {
            const userData = snap.data();
            setOwnerData(userData);

            const createdAt = userData.createdAt ? new Date(userData.createdAt).getTime() : Date.now();
            const today = new Date().getTime();
            const diffInDays = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
            
            if (diffInDays >= 60) setIsExpired(true);
          }
        });

        onSnapshot(doc(db, "prices", user.uid), (docSnap) => {
          if(docSnap.exists()) {
            const data = docSnap.data();
            setRates(data);
            setNewRates({ 
                gold22k: data.gold22k || "", 
                gold24k: data.gold24k || "", 
                silver: data.silver || "" 
            });
          }
        });

        const qProducts = query(collection(db, "products"), where("ownerId", "==", user.uid));
        onSnapshot(qProducts, (snap) => {
          setProductsCount(snap.size);
          setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const qBanners = query(collection(db, "banners"), where("ownerId", "==", user.uid));
        onSnapshot(qBanners, (snap) => {
          setBannersCount(snap.size);
          setAllBanners(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

         const qOrders = query(collection(db, "online_orders"), where("shopId", "==", user.uid), orderBy("createdAt", "desc"));
         onSnapshot(qOrders, (snap) => {
           setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
         });

        const qLeads = query(collection(db, "leads"), where("ownerId", "==", user.uid), orderBy("createdAt", "desc"), limit(50));
        onSnapshot(qLeads, (snap) => {
          setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLastDoc(snap.docs[snap.docs.length - 1]);
        });
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);
  
  const last7DaysData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;

      const dayOrders = orders.filter(o => {
        if (!o.createdAt) return false;
        let dObj = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt.seconds * 1000);
        const y = dObj.getFullYear();
        const m = String(dObj.getMonth() + 1).padStart(2, '0');
        const day = String(dObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}` === dateStr;
      });

      const revenue = dayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      data.push({ date: displayDate, revenue, orders: dayOrders.length });
    }
    return data;
  }, [orders]);

  // 🔥 UPDATED: Ab Orders aur Leads dono ka event check hoga 🔥
  const { todaysBirthdays, todaysAnniversaries } = useMemo(() => {
    const today = new Date();
    const currentMonthDay = `-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const uniqueCustomers: any[] = [];
    const seenMobiles = new Set();
    
    // Dono list ko ek me mila diya
    const allPeople = [...orders, ...leads];

    allPeople.forEach(person => {
      // Kyunki orders me 'mobile' aur leads me 'phoneNumber' save hota hai
      const phoneNo = person.mobile || person.phoneNumber; 
      const custName = person.name || person.customerName;

      if (phoneNo && !seenMobiles.has(phoneNo)) {
        seenMobiles.add(phoneNo);
        // Normalize karke save kiya
        uniqueCustomers.push({...person, name: custName, mobile: phoneNo});
      }
    });

    return {
      todaysBirthdays: uniqueCustomers.filter(c => c.dob && c.dob.includes(currentMonthDay)),
      todaysAnniversaries: uniqueCustomers.filter(c => c.anniversary && c.anniversary.includes(currentMonthDay))
    };
  }, [orders, leads]);

  const handleDeleteItem = async (type: 'products' | 'banners', id: string) => {
    if (window.confirm(`Bhai, kya aap is ${type === 'products' ? 'jewellery' : 'banner'} ko delete karna chahte hain?`)) {
      try {
        await deleteDoc(doc(db, type, id));
        alert("🗑️ Deleted Successfully!");
      } catch (err) {
        alert("Error deleting item.");
      }
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (window.confirm("🚨 Ye lead hamesha ke liye delete ho jayegi. Confirm?")) {
      try {
        await deleteDoc(doc(db, "leads", id));
        alert("Lead Removed!");
      } catch (err) {
        alert("Error deleting lead.");
      }
    }
  };

  const handleUpdatePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "prices", currentUserId), {
        gold22k: Number(newRates.gold22k),
        gold24k: Number(newRates.gold24k),
        silver: Number(newRates.silver),
        updatedAt: new Date().toISOString()
      });
      setShowPriceModal(false);
      alert("Market Updated Successfully! ✨");
    } catch (err) {
      alert("Error updating price");
    }
  };
  
  const exportToExcel = () => {
    if (displayedLeads.length === 0) return alert("No data available to download!");
    
    const excelData = displayedLeads.map(l => ({
      "Customer Name": l.customerName || "N/A",
      "Phone Number": l.phoneNumber || "N/A",
      "Status": l.status || "WIP 1",
      "Follow Up Date": l.nextFollowUp?.replace('T', ' ') || "N/A",
      "Remarks": l.remarks || "No Notes",
      "Created At": l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads Report");
    XLSX.writeFile(wb, `${ownerData?.shopName || 'Jewellery'}_${viewMode.toUpperCase()}_Leads_${new Date().toLocaleDateString()}.xlsx`);
  };

  const openFollowUpModal = (lead: any, status: string) => {
    setSelectedLead(lead);
    setTempStatus(status);
    setTempRemark(""); 
    setExtraRemarks(lead.remarks || ""); 
    setFollowUpDate(lead.nextFollowUp || "");
    setShowModal(true);
  };

  const handleUpdateLead = async () => {
    if (tempStatus !== "Closed" && !followUpDate) return alert("Please select a valid Follow Up Date & Time 📅");
    
    let finalStatus = tempStatus;
    if (tempStatus === "WIP 1" && tempRemark === "Not Connected") finalStatus = "WIP 2";
    
    const combinedRemarks = tempRemark ? `${tempRemark}${extraRemarks ? " - " + extraRemarks : ""}` : extraRemarks;
    
    await updateDoc(doc(db, "leads", selectedLead.id), {
      status: finalStatus, 
      nextFollowUp: tempStatus === "Closed" ? "" : followUpDate, 
      remarks: combinedRemarks,
      updatedAt: new Date().toISOString()
    });
    setShowModal(false);
  };

  if (!isClient || authLoading) {
    return <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-yellow-500 font-black tracking-widest animate-pulse">LOADING BRAND...</div>;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const displayedLeads = leads.filter(l => {
      const matchesSearch = l.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || l.phoneNumber?.includes(searchQuery);
      let matchesView = true;
      const leadDate = l.nextFollowUp?.split('T')[0];

      if (viewMode === "today") matchesView = (leadDate === todayStr && l.status !== "Closed");
      else if (viewMode === "pending") matchesView = (leadDate !== todayStr && l.status !== "Closed");
      else if (viewMode === "closed") matchesView = (l.status === "Closed");
      
      return matchesSearch && matchesView;
  });

  return (
    <div className="p-3 md:p-6 lg:p-8 bg-[#0a0a0a] min-h-screen font-sans text-gray-300 relative selection:bg-yellow-500 selection:text-black">
      
      {isExpired && (
        <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-[#111] border-2 border-yellow-500/30 p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_100px_rgba(234,179,8,0.25)]">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
              <span className="text-4xl">👑</span>
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase mb-4 tracking-tighter">Trial Ended!</h2>
            <p className="text-gray-400 font-bold text-sm mb-8 leading-relaxed">
              Bhai, aapka <span className="text-yellow-500">60 Dino ka Free Access</span> khatam ho gaya hai. Dashboard continue karne ke liye subscription activate karein.
            </p>
            <div className="space-y-4">
               <button onClick={() => router.push('/payment')} className="bg-yellow-500 text-black px-6 py-4 rounded-xl font-black hover:bg-yellow-400 w-full transition-all active:scale-95 uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                  Renew Subscription
                </button>
              <button onClick={() => signOut(auth)} className="block w-full py-4 bg-white/5 hover:bg-white/10 text-white/50 font-bold rounded-xl uppercase text-[10px] border border-white/5 transition-all">
                Logout Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RATES BAR */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-6 bg-gradient-to-r from-[#111] to-[#1a1a1a] text-yellow-500 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 border border-white/5 shadow-2xl">
        <div className="flex justify-between w-full md:w-auto md:gap-12 items-center px-4 md:px-8 mx-auto">
          <div className="flex flex-col text-center"><span className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">22K Gold</span><span className="text-white font-black italic text-sm md:text-lg tracking-tighter">₹{rates?.gold22k || "---"}</span></div>
          <div className="flex flex-col text-center"><span className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">24K Gold</span><span className="text-white font-black italic text-sm md:text-lg tracking-tighter">₹{rates?.gold24k || "---"}</span></div>
          <div className="flex flex-col text-center"><span className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">Silver</span><span className="text-white font-black italic text-sm md:text-lg tracking-tighter">₹{rates?.silver || "---"}</span></div>
        </div>
      </div>

      {/* HEADER WITH 3-LINE HAMBURGER MENU */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8 flex justify-between items-center bg-[#111] p-5 md:p-6 rounded-[2rem] border border-white/5 shadow-2xl relative z-[100]">
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard/owner-profile" className="shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-yellow-700 via-yellow-500 to-yellow-200 rounded-2xl flex items-center justify-center shadow-lg hover:rotate-6 transition-all duration-300">
              <span className="text-black font-black italic text-xl md:text-2xl">{ownerData?.shopName?.charAt(0) || "B"}</span>
            </div>
          </Link>
          <div className="truncate">
            <h1 className="text-xl md:text-3xl font-black text-white tracking-tighter truncate">{ownerData?.shopName || "Loading..."}</h1>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Dashboard</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="p-3.5 bg-white/5 border border-white/10 hover:border-yellow-500/50 hover:bg-white/10 rounded-2xl transition-all shadow-md active:scale-95"
          >
            {isMenuOpen ? <X size={24} className="text-yellow-500" /> : <Menu size={24} className="text-yellow-500" />}
          </button>

          {isMenuOpen && (
            <div className="absolute top-[120%] right-0 w-72 bg-[#050505]/95 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-[2rem] p-3 flex flex-col gap-1 animate-in slide-in-from-top-4 fade-in duration-200">
              
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest px-4 pt-3 pb-1">Manage Store</p>
              
              <Link href="/dashboard/add-product" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-yellow-500 transition-all text-[10px] font-bold uppercase tracking-widest">
                 <Plus size={14}/> Add Jewellery Item
              </Link>
              <Link href="/dashboard/add-banner" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-yellow-500 transition-all text-[10px] font-bold uppercase tracking-widest">
                 <ImageIcon size={14}/> Upload Ad Banner
              </Link>
              <button onClick={() => { setShowPriceModal(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-yellow-500 transition-all text-[10px] font-bold uppercase tracking-widest text-left">
                 <TrendingUp size={14}/> Update Gold Rates
              </button>
              
              {/* 🔥 NAYA: WALK-IN BILL BUTTON 🔥 */}
                 <Link href="/create-bill" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-yellow-500 transition-all text-[10px] font-bold uppercase tracking-widest">
                 <Receipt size={14}/> Create Walk-In Bill
                 </Link>

              <div className="h-[1px] bg-white/5 my-1 mx-2"></div>
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest px-4 pt-2 pb-1">CRM & Leads</p>

              <button onClick={() => { setShowEventsModal(true); setIsMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 hover:text-pink-300 transition-all text-[10px] font-bold uppercase tracking-widest text-left">
                 <div className="flex items-center gap-3"><Gift size={14}/> Today's Events</div>
                 {(todaysBirthdays.length + todaysAnniversaries.length) > 0 && (
                   <span className="bg-pink-500 text-white px-1.5 py-0.5 rounded-md text-[8px]">{todaysBirthdays.length + todaysAnniversaries.length}</span>
                 )}
              </button>

              <Link href="/dashboard/add-lead" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-yellow-500 transition-all text-[10px] font-bold uppercase tracking-widest">
                 <Users size={14}/> Register New Lead
              </Link>
              <Link href={`/online-orders?shopId=${currentUserId}`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-yellow-500 transition-all text-[10px] font-bold uppercase tracking-widest">
                 <Package size={14}/> Customer Orders <span className="bg-yellow-500 text-black px-1.5 rounded-md text-[8px]">{orders.length}</span>
              </Link>
               <button onClick={() => { exportToExcel(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-all text-[10px] font-bold uppercase tracking-widest text-left border border-green-500/20">
                 <Download size={14}/> Export Leads (Excel)
                </button>

              <div className="h-[1px] bg-white/5 my-1 mx-2"></div>
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest px-4 pt-2 pb-1">System</p>

              <button onClick={() => { setShowInventory(!showInventory); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all text-[10px] font-bold uppercase tracking-widest text-left">
                 <LineChart size={14} className="text-blue-400" /> Switch to {showInventory ? "Leads" : "Inventory"}
              </button>
              <Link href={`/shop/${currentUserId}`} target="_blank" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 transition-all text-[10px] font-bold uppercase tracking-widest">
                 <Globe size={14}/> View Live Store
              </Link>
              <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all text-[10px] font-bold uppercase tracking-widest text-left mt-1">
                 <LogOut size={14}/> Secure Logout
              </button>
              
            </div>
          )}
        </div>
      </div>

      {/* DASHBOARD CONTENT TOGGLE */}
      {!showInventory ? (
        <>
          {/* LEADS STATS */}
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              {[
                  {id: "all", label: "Total Leads", val: leads.length, color: "from-blue-500/10"},
                  {id: "today", label: "Today's Calls", val: leads.filter(l => l.nextFollowUp?.split('T')[0] === todayStr && l.status !== "Closed").length, color: "from-orange-500/10"},
                  {id: "closed", label: "Closed Deals", val: leads.filter(l => l.status === "Closed").length, color: "from-green-500/10"},
                  {id: "pending", label: "Pending", val: leads.filter(l => l.nextFollowUp?.split('T')[0] !== todayStr && l.status !== "Closed").length, color: "from-purple-500/10"}
              ].map((s, i) => (
                  <div key={i} onClick={() => setViewMode(s.id)} className={`cursor-pointer transition-all duration-300 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border ${viewMode === s.id ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.1)] md:scale-[1.02]' : 'border-white/5 hover:border-white/20'} bg-gradient-to-br ${s.color} to-[#111]`}>
                      <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 md:mb-2">{s.label}</p>
                      <p className={`text-2xl md:text-4xl font-black italic tracking-tighter ${viewMode === s.id ? 'text-yellow-500' : 'text-white'}`}>{s.val}</p>
                  </div>
              ))}
          </div>

          {/* VISUAL ANALYTICS CHARTS */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
             <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-[2rem] p-5 md:p-8 shadow-2xl">
                <h3 className="text-white font-black uppercase text-[9px] md:text-[10px] tracking-[0.3em] mb-4 md:mb-6">Revenue Generation (Last 7 Days)</h3>
                <div className="h-48 md:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#52525b" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={8} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }} 
                        itemStyle={{ color: '#eab308', fontWeight: 'bold' }} 
                        formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-[#111] border border-white/5 rounded-[2rem] p-5 md:p-8 shadow-2xl">
                <h3 className="text-white font-black uppercase text-[9px] md:text-[10px] tracking-[0.3em] mb-4 md:mb-6">Order Volume</h3>
                <div className="h-48 md:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="date" stroke="#52525b" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={8} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip 
                        cursor={{ fill: '#1a1a1a' }} 
                        contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }} 
                        itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                        formatter={(value) => [value, 'Orders']}
                      />
                      <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* SEARCH BAR */}
          <div className="max-w-7xl mx-auto sticky top-2 z-[40] py-3 md:py-4 bg-[#0a0a0a]/90 backdrop-blur-xl mb-6 rounded-2xl">
            <div className="relative w-full">
              <input type="text" placeholder="Search Customer Name or Phone Number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-4 md:p-5 pl-12 md:pl-14 bg-[#111] border border-white/5 rounded-[1.5rem] text-xs md:text-sm font-bold text-white outline-none focus:border-yellow-500/50 focus:bg-black transition-all shadow-inner placeholder:text-zinc-600" />
              <span className="absolute left-5 top-4 md:top-5 opacity-50 text-sm">🔍</span>
            </div>
          </div>

          {/* LEADS TABLE */}
          <div className="max-w-7xl mx-auto bg-[#111] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="hidden md:table w-full text-left">
                <thead className="bg-[#151515] text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5">
                  <tr><th className="p-8">Customer Profile</th><th className="p-8">Current Status</th><th className="p-8">Next Engagement</th><th className="p-8 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {displayedLeads.length > 0 ? displayedLeads.map((l) => (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-8">
                        <div className="font-black text-white text-base uppercase tracking-tight">{l.customerName} {l.status === 'Closed' && '👑'}</div>
                        <div className="text-yellow-500 text-xs font-bold font-mono mt-1 tracking-widest">{l.phoneNumber}</div>
                      </td>
                      <td className="p-8">
                        <select value={l.status || "WIP 1"} onChange={(e) => openFollowUpModal(l, e.target.value)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer border border-transparent hover:border-white/10 transition-all ${l.status === 'Closed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          <option className="bg-black" value="WIP 1">WIP 1 (Lead)</option>
                          <option className="bg-black" value="WIP 2">WIP 2 (Warm)</option>
                          <option className="bg-black" value="WIP 3">WIP 3 (Hot)</option>
                          <option className="bg-black" value="Closed">Closed (Won)</option>
                        </select>
                      </td>
                      <td className="p-8 text-xs font-black italic tracking-wide">
                        <span className={l.nextFollowUp?.split('T')[0] === todayStr ? 'text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-lg' : 'text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-lg'}>
                            {l.nextFollowUp?.replace('T', ' ') || "Pending Selection"}
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <button onClick={() => handleDeleteLead(l.id)} className="text-red-500 opacity-50 group-hover:opacity-100 hover:bg-red-500 hover:text-white p-3 rounded-xl transition-all">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-20 text-center text-zinc-600 font-black uppercase tracking-[0.3em] text-xs">No records found.</td></tr>
                  )}
                </tbody>
              </table>

              {/* MOBILE VIEW FOR LEADS */}
              <div className="md:hidden divide-y divide-white/[0.05]">
                {displayedLeads.length > 0 ? displayedLeads.map((l) => (
                  <div key={l.id} className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-white text-base uppercase tracking-tight">{l.customerName} {l.status === 'Closed' && '👑'}</p>
                        <p className="text-yellow-500 text-xs font-bold font-mono mt-1 tracking-widest">{l.phoneNumber}</p>
                      </div>
                      <button onClick={() => handleDeleteLead(l.id)} className="p-2 bg-red-500/10 text-red-500 rounded-xl">🗑️</button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <select value={l.status || "WIP 1"} onChange={(e) => openFollowUpModal(l, e.target.value)} className={`w-full px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border border-transparent ${l.status === 'Closed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        <option value="WIP 1">WIP 1</option><option value="WIP 2">WIP 2</option><option value="WIP 3">WIP 3</option><option value="Closed">Closed</option>
                      </select>
                      <div className={`w-full text-center py-3 px-2 rounded-xl text-[10px] font-black tracking-widest uppercase ${l.nextFollowUp?.split('T')[0] === todayStr ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-400'}`}>
                        Next Appt: {l.nextFollowUp?.split('T')[0] || "No Date"}
                      </div>
                    </div>
                    {l.remarks && <p className="text-zinc-500 text-[10px] italic leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">{l.remarks}</p>}
                  </div>
                )) : (
                  <div className="p-20 text-center text-zinc-600 font-black uppercase tracking-[0.3em] text-xs">No records found.</div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* --- INVENTORY SECTION --- */
        <div className="max-w-7xl mx-auto space-y-12 md:space-y-16 pb-20 animate-in fade-in duration-700 mt-6">
          <section>
            <div className="flex justify-between items-end mb-6 px-2 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-yellow-500 font-black uppercase text-[10px] tracking-[0.3em] mb-1">Full Inventory</h3>
                <p className="text-white font-black text-2xl md:text-3xl italic uppercase tracking-tighter">All Jewellery</p>
              </div>
              <Link href="/dashboard/add-product" className="text-[10px] font-black bg-yellow-500 text-black px-5 py-2.5 rounded-full uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]">Add New +</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {allProducts.length > 0 ? allProducts.map((p) => (
                <div key={p.id} className="bg-[#111] border border-white/5 p-4 rounded-[2rem] flex items-center justify-between group hover:bg-[#151515] transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <img src={p.imageUrl} className="w-14 h-14 rounded-2xl object-cover border border-white/5" />
                    <div className="truncate max-w-[160px]">
                      <p className="text-white font-bold text-sm uppercase italic tracking-tight truncate">{p.name}</p>
                      <p className="text-zinc-500 text-[8px] uppercase tracking-widest mt-1">₹{p.price}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteItem('products', p.id)} className="bg-red-500/10 hover:bg-red-500 p-3 rounded-xl text-red-500 hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )) : (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] text-zinc-600 font-bold uppercase tracking-widest text-xs">No Products Uploaded.</div>
              )}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-6 px-2 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-purple-500 font-black uppercase text-[10px] tracking-[0.3em] mb-1">Marketing Assets</h3>
                <p className="text-white font-black text-2xl md:text-3xl italic uppercase tracking-tighter">Store Banners</p>
              </div>
              <Link href="/dashboard/add-banner" className="text-[10px] font-black bg-white/10 border border-white/20 text-white px-5 py-2.5 rounded-full uppercase tracking-widest hover:bg-white/20 transition-all">Upload +</Link>
            </div>
            <div className="space-y-4">
              {allBanners.length > 0 ? allBanners.map((b) => (
                <div key={b.id} className="relative h-24 md:h-32 rounded-[2rem] overflow-hidden border border-white/5 group bg-black">
                  <img src={b.imageUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex items-center justify-between px-8 bg-gradient-to-r from-black/80 to-transparent">
                    <p className="text-white font-black italic uppercase text-sm md:text-lg tracking-tighter truncate max-w-[250px] shadow-sm">{b.title || "Elite Campaign Banner"}</p>
                    <button onClick={() => handleDeleteItem('banners', b.id)} className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-full transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)] transform hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-16 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] text-zinc-600 font-bold uppercase tracking-widest text-xs">No Campaign Banners.</div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* PRICE MODAL */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[1000] p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-[#111] p-8 md:p-12 rounded-[3rem] w-full max-w-sm border border-yellow-500/20 shadow-[0_0_80px_rgba(234,179,8,0.15)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
            <h2 className="text-2xl font-black italic uppercase text-yellow-500 mb-8 tracking-tighter text-center">Market Update</h2>
            <form onSubmit={handleUpdatePrices} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Gold 22K / Gram</label>
                <input type="number" value={newRates.gold22k} onChange={(e) => setNewRates({...newRates, gold22k: e.target.value})} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all" placeholder="e.g. 6250" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Gold 24K / Gram</label>
                <input type="number" value={newRates.gold24k} onChange={(e) => setNewRates({...newRates, gold24k: e.target.value})} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all" placeholder="e.g. 6800" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Silver / KG</label>
                <input type="number" value={newRates.silver} onChange={(e) => setNewRates({...newRates, silver: e.target.value})} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all" placeholder="e.g. 92000" required />
              </div>
              <div className="flex flex-col gap-3 pt-6">
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-black rounded-2xl uppercase text-[11px] tracking-[0.2em] shadow-lg transition-all active:scale-95">Confirm Rates</button>
                <button type="button" onClick={() => setShowPriceModal(false)} className="w-full py-3 text-zinc-500 hover:text-white font-black text-[10px] uppercase tracking-widest text-center transition-colors">Dismiss</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔥 NAYA: EVENTS MODAL (BIRTHDAY/ANNIVERSARY) 🔥 */}
      {showEventsModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[1000] p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-[#111] p-6 md:p-8 rounded-[3rem] w-full max-w-lg border border-pink-500/20 shadow-[0_0_80px_rgba(236,72,153,0.15)] relative overflow-hidden flex flex-col max-h-[85vh]">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-600 via-pink-400 to-pink-600"></div>
             
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl md:text-3xl font-black italic uppercase text-pink-500 tracking-tighter">Special Events Today</h2>
               <button onClick={() => setShowEventsModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all"><X size={20}/></button>
             </div>

             <div className="overflow-y-auto pr-2 space-y-6 flex-1 custom-scrollbar">
                
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2"><span className="text-yellow-500 text-base">🎂</span> Birthdays ({todaysBirthdays.length})</h3>
                  {todaysBirthdays.length > 0 ? (
                    <div className="space-y-2">
                      {todaysBirthdays.map((c, i) => (
                         <div key={i} className="bg-black border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:border-yellow-500/30 transition-all">
                           <div>
                             <p className="font-bold text-white text-sm uppercase tracking-wider">{c.name}</p>
                             <p className="text-[10px] font-mono text-zinc-500">{c.mobile}</p>
                           </div>
                           <a href={`https://wa.me/+91${c.mobile}?text=Happy Birthday ${c.name}! 🎉 Wishing you a great year ahead from ${ownerData?.shopName}. Visit us today for an exclusive birthday discount!`} target="_blank" className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Wish on WA</a>
                         </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-zinc-600 italic font-medium px-2">No birthdays today.</p>}
                </div>

                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2"><span className="text-red-500 text-base">❤️</span> Anniversaries ({todaysAnniversaries.length})</h3>
                  {todaysAnniversaries.length > 0 ? (
                    <div className="space-y-2">
                      {todaysAnniversaries.map((c, i) => (
                         <div key={i} className="bg-black border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:border-red-500/30 transition-all">
                           <div>
                             <p className="font-bold text-white text-sm uppercase tracking-wider">{c.name}</p>
                             <p className="text-[10px] font-mono text-zinc-500">{c.mobile}</p>
                           </div>
                           <a href={`https://wa.me/+91${c.mobile}?text=Happy Anniversary ${c.name}! ❤️ Wishing you endless joy from ${ownerData?.shopName}. Celebrate with us and get a special gift!`} target="_blank" className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Wish on WA</a>
                         </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-zinc-600 italic font-medium px-2">No anniversaries today.</p>}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* LEAD ENGAGEMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[999] p-4 animate-in fade-in duration-200">
          <div className="bg-[#111] p-8 md:p-12 rounded-[3rem] w-full max-w-sm md:max-w-md border border-zinc-800 shadow-2xl relative overflow-hidden">
            <h2 className="text-3xl font-black text-white mb-2 italic uppercase tracking-tighter">Engagement</h2>
            <p className="text-yellow-500 text-[10px] font-black mb-8 uppercase tracking-[0.2em] bg-yellow-500/10 w-fit px-3 py-1 rounded-full">{selectedLead?.customerName}</p>
            
            <div className="space-y-6">
              {tempStatus !== "Closed" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Next Milestone</label>
                    <input type="datetime-local" min="2020-01-01T00:00" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} onClick={(e) => (e.target as any).showPicker()} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500 cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Customer Pulse</label>
                    <select value={tempRemark} onChange={(e) => setTempRemark(e.target.value)} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500 appearance-none">
                        <option value="">Select Insight...</option>
                        <option value="Not Connected">Not Connected / Busy</option>
                        <option value="Price Discussion">Pricing Discussion</option>
                        <option value="Store Visit Planned">Store Visit Scheduled</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Internal Notes</label>
                    <textarea placeholder="Write details here..." value={extraRemarks} onChange={(e) => setExtraRemarks(e.target.value)} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl font-bold text-white text-sm h-28 resize-none outline-none focus:border-yellow-500 placeholder:text-zinc-700" />
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Final Outcome</label>
                        <select value={tempRemark} onChange={(e) => setTempRemark(e.target.value)} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl font-bold text-white text-sm outline-none focus:border-yellow-500">
                            <option value="">Select Result...</option>
                            <option value="Sale Done">✨ Sale Successfully Closed</option>
                            <option value="Dropped">Lost / Dropped</option>
                        </select>
                    </div>
                    <textarea placeholder="Closing summary..." value={extraRemarks} onChange={(e) => setExtraRemarks(e.target.value)} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl font-bold text-white text-sm h-32 resize-none outline-none focus:border-yellow-500 placeholder:text-zinc-700" />
                </div>
              )}
              
              <div className="flex flex-col gap-3 pt-4">
                <button onClick={handleUpdateLead} className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase text-[11px] tracking-[0.2em] shadow-lg hover:bg-gray-200 transition-all active:scale-95">Save Update</button>
                <button onClick={() => setShowModal(false)} className="w-full py-3 text-zinc-500 hover:text-white font-black text-[10px] uppercase tracking-widest text-center transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}