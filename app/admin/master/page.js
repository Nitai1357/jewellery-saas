"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
// 📊 CHARTS IMPORT
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
// 🎨 ICONS IMPORT
import { ShieldAlert, Download, Search, Store, CreditCard, AlertTriangle, CheckCircle, CalendarDays } from 'lucide-react';

const MasterAdmin = () => {
  const [isClient, setIsClient] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/admin/login');
        return;
      }
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      setCheckingAuth(false);
    });

    const unsubscribeData = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(document => {
        const data = document.data();
        
        // 1. Creation Date
        let joinedDate;
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          joinedDate = data.createdAt.toDate();
        } else if (data.createdAt instanceof Date) {
          joinedDate = data.createdAt;
        } else {
          joinedDate = new Date(); 
        }

        const today = new Date();
        let expiryDate;
        let remainingDays = 0;
        let currentStatus = "Trial";

        // 🔥 POINT 9: LOGIC FOR SUBSCRIPTION & EXPIRY DATE
        if (data.isPaid) {
            currentStatus = "Paid";
            // Agar paid hai, toh database se subscriptionExpiry uthaenge, warna manlo 30 din ka plan hai
            if (data.subscriptionExpiry && typeof data.subscriptionExpiry.toDate === 'function') {
                expiryDate = data.subscriptionExpiry.toDate();
            } else {
                // Dummy logic agar abhi DB me expire date nahi hai: paid date se 30 din aage
                expiryDate = new Date(joinedDate.getTime() + (30 * 24 * 60 * 60 * 1000));
            }
        } else {
            currentStatus = "Trial";
            // Trial hamesha 60 din ka hoga joined date se
            expiryDate = new Date(joinedDate.getTime() + (60 * 24 * 60 * 60 * 1000));
        }

        // Calculate exact days left
        const diffTime = expiryDate.getTime() - today.getTime();
        remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (remainingDays <= 0) {
            currentStatus = "Expired";
            remainingDays = 0;
        }

        // Date format karne ke liye e.g., "15 Aug 2024"
        const formattedExpiry = expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

        return {
          id: document.id,
          shopName: data.shopName || "New Shop",
          owner: data.ownerName || data.email?.split('@')[0] || "Owner",
          mobile: data.mobile || data.whatsapp || "No Contact", 
          country: data.country || "India",
          status: currentStatus,
          daysLeft: remainingDays,
          expireDate: formattedExpiry, // 🔥 Yahan Exact Date store ki
          isLocked: data.isLocked || false,
          rawDate: joinedDate 
        };
      });
      
      usersData.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeData();
    };
  }, [router]);

  const last7DaysGrowth = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;

      const dayUsers = users.filter(u => {
        if (!u.rawDate) return false;
        const y = u.rawDate.getFullYear();
        const m = String(u.rawDate.getMonth() + 1).padStart(2, '0');
        const day = String(u.rawDate.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}` === dateStr;
      });

      data.push({ date: displayDate, shops: dayUsers.length });
    }
    return data;
  }, [users]);

  const statusDistribution = useMemo(() => {
    return [
      { name: 'Trial', value: users.filter(u => u.status === 'Trial').length, color: '#eab308' }, 
      { name: 'Paid', value: users.filter(u => u.status === 'Paid').length, color: '#22c55e' },   
      { name: 'Expired', value: users.filter(u => u.status === 'Expired').length, color: '#ef4444' }, 
    ];
  }, [users]);

  // 🔥 POINT 9: BLOCK / UNBLOCK LOGIC UPDATED
  const toggleBlock = async (userId, currentLockStatus, shopName) => {
    const action = currentLockStatus ? "UNBLOCK" : "BLOCK";
    if(window.confirm(`Are you sure you want to ${action} ${shopName}?`)){
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { isLocked: !currentLockStatus });
            alert(`${shopName} has been successfully ${action}ED!`);
          } catch (error) {
            console.error(error);
            alert("Error updating status! Please check your network.");
          }
    }
  };

  const downloadReport = () => {
    if (users.length === 0) {
      alert("No data to download");
      return;
    }

    // Header mein Expiry Date add kiya
    const headers = ["Shop Name", "Owner", "Contact", "Country", "Status", "Expiry Date", "Days Left", "Locked"];
    const csvRows = users.map(user => [
      `"${user.shopName}"`,
      `"${user.owner}"`,
      `"${user.mobile}"`, 
      `"${user.country}"`,
      `"${user.status}"`,
      `"${user.expireDate}"`, // 🔥 CSV me Expiry date aayegi
      user.daysLeft,
      user.isLocked
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Master_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => 
    u.shopName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.mobile.includes(searchQuery)
  );

  if (!isClient || checkingAuth) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-yellow-500 font-black animate-pulse tracking-[0.3em] flex items-center gap-3">
          <ShieldAlert size={24} /> INITIALIZING MASTER CONTROL...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-yellow-500 selection:text-black">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20 text-yellow-500">
                <ShieldAlert size={20} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">Master <span className="text-yellow-500">Control</span></h1>
            </div>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">Super Admin Overview & Surveillance</p>
          </div>
          
          <button 
            onClick={downloadReport}
            className="flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-95"
          >
            <Download size={14} /> Download System Report
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-[#111] border border-blue-500/20 p-6 rounded-2xl md:rounded-[2rem] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Total Shops</p>
              <Store size={16} className="text-blue-500/50" />
            </div>
            <h3 className="text-4xl font-black italic tracking-tighter">{users.length}</h3>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-[#111] border border-green-500/20 p-6 rounded-2xl md:rounded-[2rem] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="text-green-400 text-[10px] font-black uppercase tracking-widest">Active Paid</p>
              <CheckCircle size={16} className="text-green-500/50" />
            </div>
            <h3 className="text-4xl font-black italic tracking-tighter text-green-500">{users.filter(u => u.status === 'Paid').length}</h3>
          </div>
          
          <div className="bg-gradient-to-br from-red-500/10 to-[#111] border border-red-500/20 p-6 rounded-2xl md:rounded-[2rem] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Expired Trials</p>
              <AlertTriangle size={16} className="text-red-500/50" />
            </div>
            <h3 className="text-4xl font-black italic tracking-tighter text-red-500">{users.filter(u => u.status === 'Expired').length}</h3>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/10 to-[#111] border border-yellow-500/20 p-6 rounded-2xl md:rounded-[2rem] shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10"><CreditCard size={100} /></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">Est. Revenue</p>
              <CreditCard size={16} className="text-yellow-500/50" />
            </div>
            <h3 className="text-4xl font-black italic tracking-tighter text-yellow-500 relative z-10">
              ₹{(users.filter(u => u.status === 'Paid').length * 499).toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* VISUAL ANALYTICS CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-2xl">
            <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-6">Platform Adoption (Last 7 Days)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7DaysGrowth} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#27272a', borderRadius: '12px' }} 
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} 
                  />
                  <Area type="monotone" dataKey="shops" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-2xl">
            <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-6">Subscription Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusDistribution} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#1a1a1a' }} 
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#27272a', borderRadius: '12px' }} 
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TABLE SECTION WITH SEARCH */}
        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4 items-center bg-[#151515]">
             <h3 className="font-black uppercase tracking-widest text-sm">System Users</h3>
             <div className="relative w-full md:w-80">
               <input 
                 type="text" 
                 placeholder="Search by Shop, Owner or Phone..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-black border border-zinc-800 text-white text-xs font-bold px-10 py-3 rounded-xl outline-none focus:border-yellow-500 transition-all"
               />
               <Search size={14} className="absolute left-4 top-3.5 text-zinc-500" />
             </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-32 text-center text-zinc-600 font-black uppercase tracking-[0.4em] animate-pulse">Scanning Database...</div>
            ) : (
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-[#0a0a0a] text-zinc-500 text-[9px] uppercase tracking-widest font-black border-b border-white/5">
                  <tr>
                    <th className="p-6">Shop & Proprietor</th>
                    <th className="p-6">Billing Status</th>
                    <th className="p-6">Subscription Life</th>
                    <th className="p-6 text-right">App Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan="4" className="p-20 text-center text-zinc-600 font-black uppercase tracking-[0.3em]">No users match criteria.</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className={`hover:bg-white/[0.02] transition-colors ${user.isLocked ? 'opacity-50 grayscale' : ''}`}>
                        <td className="p-6">
                          <div className="font-black text-white uppercase text-sm tracking-tight">{user.shopName}</div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                            {user.owner} • 📞 <span className="text-yellow-500/80">{user.mobile}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-inner ${
                            user.status === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                            user.status === 'Trial' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                            'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        
                        {/* 🔥 YAHAN EXACT EXPIRY DATE BHI DIKHAYEGA 🔥 */}
                        <td className="p-6">
                          {user.status === 'Expired' ? (
                            <span className="text-red-500 font-black uppercase text-xs tracking-widest">EXPIRED</span>
                          ) : (
                            <div>
                                <div className="flex items-center gap-1.5 text-zinc-300 font-bold text-xs">
                                    <CalendarDays size={14} className={user.status === 'Paid' ? 'text-green-500' : 'text-yellow-500'} /> 
                                    {user.expireDate}
                                </div>
                                <div className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase mt-1">
                                    {user.daysLeft} Days Remaining
                                </div>
                            </div>
                          )}
                        </td>

                        <td className="p-6 text-right">
                          <button 
                            onClick={() => toggleBlock(user.id, user.isLocked, user.shopName)}
                            className={`text-[9px] font-black uppercase tracking-widest border px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 ${
                              user.isLocked 
                              ? 'bg-green-600/10 text-green-500 border-green-500/30 hover:bg-green-600 hover:text-white' 
                              : 'bg-red-600/10 text-red-500 border-red-500/30 hover:bg-red-600 hover:text-white'
                            }`}
                          >
                            {user.isLocked ? "Unlock Access" : "Block Access"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAdmin;