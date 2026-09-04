"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide logic for 4 banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 3 ? 0 : prev + 1)); // 0, 1, 2, 3 (Total 4 slides)
    }, 6000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans scroll-smooth overflow-x-hidden">
      
      {/* 1. ELITE NAVBAR */}
      <nav className="fixed top-0 w-full flex justify-between items-center px-6 md:px-12 py-5 bg-[#050505]/80 backdrop-blur-lg border-b border-gray-800/50 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => setIsMenuOpen(true)} className="text-white hover:text-[#d4af37] transition focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <div className="text-2xl font-extrabold tracking-widest cursor-pointer">
            <span className="text-[#d4af37]">KARAT</span><span className="text-white">TECH</span>
          </div>
        </div>
        <Link href="/login" className="border border-[#d4af37] text-[#d4af37] px-6 py-2 rounded text-sm tracking-widest hover:bg-[#d4af37] hover:text-black transition duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
          LOGIN
        </Link>
      </nav>

      {/* BURGER MENU SIDEBAR */}
      <div className={`fixed inset-0 bg-black/90 backdrop-blur-md z-[60] transition-opacity duration-300 ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className={`fixed top-0 left-0 h-full w-72 bg-[#0a0a0a] border-r border-[#d4af37]/20 transform transition-transform duration-500 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-6 flex justify-between items-center border-b border-gray-800">
            <div className="text-xl font-bold tracking-widest"><span className="text-[#d4af37]">KARAT</span><span className="text-white">TECH</span></div>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="flex flex-col p-6 gap-6 text-sm uppercase tracking-widest text-gray-400 font-semibold">
            <a href="#home" onClick={() => setIsMenuOpen(false)} className="hover:text-[#d4af37] transition">Home</a>
            <a href="#services" onClick={() => setIsMenuOpen(false)} className="hover:text-[#d4af37] transition">Our Services</a>
            <a href="#policy" onClick={() => setIsMenuOpen(false)} className="hover:text-[#d4af37] transition">Company Policy</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="hover:text-[#d4af37] transition">Contact Us</a>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC PURE CSS BANNERS (4 SLIDES) */}
      <section id="home" className="relative pt-20 h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        
        {/* ================= SLIDE 1 : DIGITAL ECOSYSTEM ================= */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center ${currentSlide === 0 ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#2a2010,_#050505_60%)]"></div>
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col md:flex-row items-center relative z-20">
            <div className="w-full md:w-1/2 text-left mb-10 md:mb-0">
              <div className="inline-block border border-[#d4af37]/50 rounded-full px-4 py-1 text-[10px] md:text-xs text-[#d4af37] mb-6 uppercase tracking-widest bg-[#d4af37]/10">Big Brand Capabilities, Zero IT Headaches</div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight text-white uppercase">DIGITIZE YOUR <br/><span className="text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">JEWELRY BOUTIQUE</span></h1>
              <p className="text-gray-300 mb-10 font-light text-sm md:text-lg max-w-lg leading-relaxed">Empower your local jewelry shop with KaratTech&apos;s digital ecosystem. Launch a premium digital storefront with a custom domain or QR access today.</p>
              <Link href="/login" className="inline-block bg-[#d4af37] text-black px-10 py-4 rounded font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform duration-300 shadow-[0_0_25px_rgba(212,175,55,0.4)]">START SCALING TODAY</Link>
            </div>
            <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#d4af37]/20 rounded-full blur-[80px]"></div>
              {/* POS Dashboard */}
              <div className="absolute right-10 top-10 w-64 md:w-80 h-48 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl animate-[bounce_4s_infinite]">
                <div className="flex justify-between items-center mb-4"><div className="w-24 h-3 bg-gray-600 rounded-full"></div><div className="w-8 h-8 bg-[#d4af37]/30 rounded-full flex items-center justify-center text-[#d4af37]">✓</div></div>
                <div className="space-y-3"><div className="w-full h-8 bg-white/10 rounded-md"></div><div className="w-3/4 h-8 bg-white/10 rounded-md"></div></div>
                <div className="mt-4 text-xs text-[#d4af37] uppercase tracking-widest">Instant POS Active</div>
              </div>
              {/* Live Rate Card */}
              <div className="absolute left-0 bottom-10 w-48 md:w-64 h-40 bg-black/60 backdrop-blur-lg border border-[#d4af37]/30 rounded-2xl p-5 shadow-2xl animate-[bounce_5s_infinite]">
                <div className="text-[#d4af37] text-sm uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>Live Gold Rate</div>
                <div className="text-3xl font-bold text-white mb-2">₹72,450 <span className="text-sm text-green-500">+1.2%</span></div>
                <div className="w-full h-12 flex items-end gap-1"><div className="w-1/5 bg-[#d4af37]/40 h-1/3 rounded-t-sm"></div><div className="w-1/5 bg-[#d4af37]/60 h-2/3 rounded-t-sm"></div><div className="w-1/5 bg-[#d4af37]/80 h-1/2 rounded-t-sm"></div><div className="w-1/5 bg-[#d4af37] h-full rounded-t-sm"></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SLIDE 2 : CRM & FOLLOW UP ================= */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center ${currentSlide === 1 ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#1a1a1a,_#000000_70%)]"><div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div></div>
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col-reverse md:flex-row items-center relative z-20">
            <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-900/20 rounded-full blur-[90px]"></div>
              {/* CRM Pipeline Card */}
              <div className="absolute left-10 top-1/2 -translate-y-1/2 w-64 md:w-80 bg-black/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-2xl z-20">
                <div className="text-white text-sm uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Customer Pipeline</div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/10"><div className="w-10 h-10 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">01</div><div><div className="text-sm font-bold">New Enquiry</div><div className="text-xs text-gray-400">Bridal Set Interest</div></div></div>
                  <div className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/10 opacity-70"><div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">02</div><div><div className="text-sm font-bold">Follow Up Scheduled</div><div className="text-xs text-gray-400">Automated Reminder</div></div></div>
                </div>
              </div>
              {/* WhatsApp Notification Card */}
              <div className="absolute right-0 top-16 w-56 bg-gradient-to-br from-[#111] to-[#222] border border-[#d4af37]/50 rounded-2xl p-4 shadow-2xl z-30 animate-[bounce_6s_infinite]">
                <div className="flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mt-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.9 5.8L2 22l4.3-1.2c1.6 1.1 3.5 1.7 5.7 1.7 5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.9 0-3.66-.64-5.06-1.74l-.36-.28-2.6.72.74-2.54-.3-.48C3.32 14.1 2.5 12.13 2.5 10c0-5.24 4.26-9.5 9.5-9.5s9.5 4.26 9.5 9.5-4.26 9.5-9.5 9.5z"/></svg></div>
                  <div><div className="text-xs font-bold text-[#d4af37] uppercase mb-1">WhatsApp Alert</div><div className="text-xs text-gray-300">Client approved design. Invoice sent.</div></div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 text-left md:text-right mb-10 md:mb-0">
              <div className="inline-block border border-gray-600 rounded-full px-4 py-1 text-[10px] md:text-xs text-gray-300 mb-6 uppercase tracking-widest bg-gray-800/50">The Proactive Follow Up Model</div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight text-white uppercase">MAXIMIZE CUSTOMER <br/><span className="text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">LIFETIME VALUE</span></h1>
              <p className="text-gray-300 mb-10 font-light text-sm md:text-lg max-w-lg md:ml-auto leading-relaxed">Transform one-time buyers into lifelong clients with seamless WhatsApp integration, automated CRM tracking, and targeted re-engagement.</p>
              <Link href="/login" className="inline-block bg-transparent border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black px-10 py-4 rounded font-bold uppercase tracking-widest text-sm transition-all duration-300">GET DIGITAL STORE NOW</Link>
            </div>
          </div>
        </div>

        {/* ================= SLIDE 3 : MARKETING & ANALYTICS ================= */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center ${currentSlide === 2 ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#1c102a,_#050505_60%)]"></div>
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col md:flex-row items-center relative z-20">
            <div className="w-full md:w-1/2 text-left mb-10 md:mb-0">
              <div className="inline-block border border-[#d4af37]/50 rounded-full px-4 py-1 text-[10px] md:text-xs text-[#d4af37] mb-6 uppercase tracking-widest bg-[#d4af37]/10">Customer History Analytics</div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight text-white uppercase">TARGETED <br/><span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">RE-ENGAGEMENT</span></h1>
              <p className="text-gray-300 mb-10 font-light text-sm md:text-lg max-w-lg leading-relaxed">Run automated post-purchase service reminders and personalized campaign triggers based on customer history to skyrocket your sales.</p>
              <Link href="/login" className="inline-block bg-white text-black px-10 py-4 rounded font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform duration-300 shadow-[0_0_25px_rgba(255,255,255,0.3)]">EXPLORE ANALYTICS</Link>
            </div>
            
            <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px]"></div>
              {/* Analytics Graph Card */}
              <div className="absolute left-1/2 -translate-x-1/2 top-10 w-64 md:w-80 h-56 bg-[#0f0f0f]/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-2xl z-20">
                <div className="text-white text-sm uppercase tracking-widest mb-4">Revenue Growth</div>
                <div className="flex items-end justify-between h-24 gap-3 border-b border-gray-800 pb-2">
                  <div className="w-full bg-gray-800 rounded-t-sm h-1/4"></div>
                  <div className="w-full bg-gray-700 rounded-t-sm h-2/4"></div>
                  <div className="w-full bg-[#d4af37]/50 rounded-t-sm h-3/4"></div>
                  <div className="w-full bg-[#d4af37] rounded-t-sm h-full relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold py-1 px-2 rounded">HIGH</div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-xs text-gray-500"><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div>
              </div>
              {/* Conversion Badge */}
              <div className="absolute right-4 bottom-20 w-48 bg-black/90 border border-green-500/50 rounded-xl p-4 shadow-2xl z-30 animate-[bounce_5s_infinite]">
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest">Campaign Success</div>
                <div className="text-2xl font-bold text-green-500">+42.8%</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SLIDE 4 : ZERO IT SETUP & LAUNCH ================= */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center ${currentSlide === 3 ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#0a1a1a,_#000000_70%)]"></div>
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col-reverse md:flex-row items-center relative z-20">
            <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-[70px]"></div>
              
              {/* Fake Mobile Phone showing QR/Domain */}
              <div className="absolute left-1/2 -translate-x-1/2 top-10 w-48 h-80 border-[6px] border-gray-800 rounded-[2rem] bg-[#050505] p-3 shadow-2xl z-20 relative overflow-hidden">
                <div className="w-20 h-4 bg-gray-800 rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2"></div>
                <div className="w-full h-full border border-gray-800 rounded-xl flex flex-col items-center justify-center bg-[#111]">
                  <div className="text-[#d4af37] font-bold text-xs tracking-widest mb-6">KARATTECH</div>
                  {/* CSS QR Code Structure */}
                  <div className="w-24 h-24 bg-white p-2 flex flex-wrap gap-1 rounded">
                    <div className="w-6 h-6 border-4 border-black"></div><div className="w-6 h-6 bg-black"></div><div className="w-6 h-6 border-4 border-black"></div>
                    <div className="w-6 h-6 bg-black"></div><div className="w-6 h-6 border-4 border-black"></div><div className="w-6 h-6 bg-black"></div>
                    <div className="w-6 h-6 border-4 border-black"></div><div className="w-6 h-6 bg-black"></div><div className="w-6 h-6 border-4 border-black"></div>
                  </div>
                  <div className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest">Scan to Shop</div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#d4af37] to-[#e6c148] text-black px-4 py-2 rounded-full font-bold text-xs uppercase shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-[bounce_4s_infinite] z-30">
                Live in 2 Mins
              </div>
            </div>
            
            <div className="w-full md:w-1/2 text-left md:text-right mb-10 md:mb-0">
              <div className="inline-block border border-gray-600 rounded-full px-4 py-1 text-[10px] md:text-xs text-gray-300 mb-6 uppercase tracking-widest bg-gray-800/50">Zero Hosting Fees, Zero IT Setup</div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight text-white uppercase">INSTANT CLOUD <br/><span className="text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">DEPLOYMENT</span></h1>
              <p className="text-gray-300 mb-10 font-light text-sm md:text-lg max-w-lg md:ml-auto leading-relaxed">No servers to manage, no code to write. Get your dedicated custom domain and QR access up and running instantly.</p>
              <Link href="/register" className="inline-block bg-transparent border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black px-10 py-4 rounded font-bold uppercase tracking-widest text-sm transition-all duration-300">LAUNCH YOUR STORE</Link>
            </div>
          </div>
        </div>

        {/* Custom Slider Navigation Dots (Now 4 dots) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-40">
          <button onClick={() => setCurrentSlide(0)} className={`h-2 transition-all duration-500 rounded-full ${currentSlide === 0 ? "w-12 bg-[#d4af37] shadow-[0_0_10px_#d4af37]" : "w-4 bg-gray-700"}`}></button>
          <button onClick={() => setCurrentSlide(1)} className={`h-2 transition-all duration-500 rounded-full ${currentSlide === 1 ? "w-12 bg-[#d4af37] shadow-[0_0_10px_#d4af37]" : "w-4 bg-gray-700"}`}></button>
          <button onClick={() => setCurrentSlide(2)} className={`h-2 transition-all duration-500 rounded-full ${currentSlide === 2 ? "w-12 bg-[#d4af37] shadow-[0_0_10px_#d4af37]" : "w-4 bg-gray-700"}`}></button>
          <button onClick={() => setCurrentSlide(3)} className={`h-2 transition-all duration-500 rounded-full ${currentSlide === 3 ? "w-12 bg-[#d4af37] shadow-[0_0_10px_#d4af37]" : "w-4 bg-gray-700"}`}></button>
        </div>
      </section>

      {/* 3. OUR SERVICES */}
      <section id="services" className="py-24 px-6 md:px-12 bg-[#0a0a0a]">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold tracking-widest uppercase mb-4 text-white">Platform <span className="text-[#d4af37]">Services</span></h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-b from-[#111] to-[#050505] p-10 rounded-2xl border border-gray-800 hover:border-[#d4af37] transition duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-bl-full group-hover:bg-[#d4af37]/20 transition-all duration-500"></div>
            <div className="text-[#d4af37] text-4xl mb-6 transform group-hover:-translate-y-2 transition duration-300">✦</div>
            <h3 className="text-2xl font-bold mb-4 text-white">Digital Storefront & POS</h3>
            <p className="text-gray-400 font-light text-sm leading-relaxed">Custom domain access with zero hosting fees. Includes free instant POS and PDF invoices ready to print or share instantly.</p>
          </div>
          <div className="bg-gradient-to-b from-[#111] to-[#050505] p-10 rounded-2xl border border-gray-800 hover:border-[#d4af37] transition duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-bl-full group-hover:bg-[#d4af37]/20 transition-all duration-500"></div>
            <div className="text-[#d4af37] text-4xl mb-6 transform group-hover:-translate-y-2 transition duration-300">◈</div>
            <h3 className="text-2xl font-bold mb-4 text-white">Live Market Sync</h3>
            <p className="text-gray-400 font-light text-sm leading-relaxed">1-Click live Gold and Silver market rate synchronization. Never lose a margin on market fluctuations again.</p>
          </div>
          <div className="bg-gradient-to-b from-[#111] to-[#050505] p-10 rounded-2xl border border-gray-800 hover:border-[#d4af37] transition duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-bl-full group-hover:bg-[#d4af37]/20 transition-all duration-500"></div>
            <div className="text-[#d4af37] text-4xl mb-6 transform group-hover:-translate-y-2 transition duration-300">❖</div>
            <h3 className="text-2xl font-bold mb-4 text-white">CRM & WhatsApp Integration</h3>
            <p className="text-gray-400 font-light text-sm leading-relaxed">Comprehensive Customer CRM, lead pipeline tracking, and automated WhatsApp reminders for scheduled check-ins.</p>
          </div>
        </div>
      </section>

      {/* 4. COMPANY POLICY */}
      <section id="policy" className="py-24 px-6 md:px-12 bg-[#050505] relative">
        <div className="absolute left-0 w-1/3 h-full bg-[radial-gradient(ellipse_at_left,_#2a2010_0%,_transparent_70%)] opacity-30"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-widest uppercase mb-4 text-[#d4af37]">Company Policy</h2>
            <div className="w-16 h-1 bg-[#d4af37] mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-16">
            
            {/* Privacy Policy */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-sm">01</span>
                Privacy & Data Security
              </h3>
              <p className="text-gray-400 font-light text-sm leading-relaxed pl-11 text-justify">
                We take your business data seriously. All CRM records, customer pipelines, WhatsApp communication logs, and POS transaction details are secured with enterprise-grade encryption. KaratTech operates strictly as a technology infrastructure provider; your customer data remains 100% your intellectual property and is never shared, rented, or sold to third parties.
              </p>
            </div>

            {/* Terms of Service */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-sm">02</span>
                Terms of Service
              </h3>
              <p className="text-gray-400 font-light text-sm leading-relaxed pl-11 text-justify">
                By utilizing KaratTech&apos;s digital storefronts and ecosystem, boutiques agree to our standard operating guidelines. Live Gold/Silver market rates provided via our 1-Click Sync are fetched from reliable third-party APIs and are for reference purposes. All platform agreements and potential legal disputes are subject to the exclusive jurisdiction of the courts in Bhubaneswar, Odisha.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* 5. CONTACT & FOOTER */}
      <section id="contact" className="py-24 px-6 md:px-12 bg-gradient-to-t from-[#0a0a0a] to-[#050505] border-t border-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-widest uppercase mb-6 text-white">Get in <span className="text-[#d4af37]">Touch</span></h2>
          <p className="text-gray-400 font-light mb-10 max-w-xl mx-auto">
            Ready to digitize your jewelry boutique? Reach out to our expert team for inquiries, support, or partnership opportunities.
          </p>
          
          {/* CONTACT BUTTONS */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            {/* Email Button */}
            <a href="mailto:karattech2026@gmail.com" className="inline-flex items-center gap-3 bg-[#111] border border-[#d4af37]/50 text-[#d4af37] px-8 py-4 rounded hover:bg-[#d4af37] hover:text-black transition-all duration-300 font-bold tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
              ✉ karattech2026@gmail.com
            </a>
            
            {/* Phone Button */}
            <a href="tel:+918917601327" className="inline-flex items-center gap-3 bg-[#111] border border-[#d4af37]/50 text-[#d4af37] px-8 py-4 rounded hover:bg-[#d4af37] hover:text-black transition-all duration-300 font-bold tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
              📞 +918917601327
            </a>
          </div>

          {/* ADDRESS BLOCK */}
          <div className="mt-10 inline-block border border-gray-800 rounded-lg px-6 py-3 bg-gray-900/30">
             <p className="text-gray-400 text-sm tracking-widest">
               📍 Bhubaneswar, Odisha
             </p>
          </div>
        </div>
        
        <div className="mt-24 border-t border-gray-900/50 pt-8 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
          <div className="text-2xl font-extrabold tracking-widest mb-4 md:mb-0"><span className="text-[#d4af37]">KARAT</span><span className="text-white">TECH</span></div>
          <div className="text-xs text-gray-600 uppercase tracking-widest text-center md:text-right">© {new Date().getFullYear()} KaratTech SaaS <br/> Powered By Digital Solutions</div>
        </div>
      </section>
      
    </div>
  );
}