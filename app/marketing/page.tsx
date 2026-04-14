"use client";
import React from "react";

export default function KaratTechPosters() {
  const posters = [
    {
      id: 0,
      tag: "OUR MISSION",
      title: "EMPOWERING LOCAL JEWELERS EVERYWHERE.",
      desc: "Bringing top-tier tech to mid-level, small-city, and village boutiques. We give local shop owners the digital power of big luxury brands.",
      icon: "🏪",
      bg: "bg-gradient-to-br from-zinc-950 via-black to-zinc-900",
      text: "text-yellow-500",
    },
    {
      id: 1,
      tag: "DATA SECURITY",
      title: "YOUR BUSINESS. YOUR DATA. TOTAL ISOLATION.",
      desc: "Experience absolute data security with our multi-tenant architecture. Your orders, leads, and products are locked specifically to your boutique.",
      icon: "🛡️",
      bg: "bg-gradient-to-br from-zinc-900 via-black to-zinc-800",
      text: "text-yellow-500",
    },
    {
      id: 2,
      tag: "BRANDING",
      title: "OWN YOUR IDENTITY. CONNECT YOUR DOMAIN.",
      desc: "Stop using generic links. Build trust by connecting your own domain (e.g., www.yourshop.com) directly to your digital storefront.",
      icon: "🌐",
      bg: "bg-gradient-to-br from-yellow-500 via-yellow-400 to-amber-600",
      text: "text-zinc-900",
    },
    {
      id: 3,
      tag: "ONBOARDING",
      title: "SCAN. SHOP. SPARKLE. NO APP REQUIRED.",
      desc: "Bring walk-in customers online instantly. Print your custom Boutique QR Code and let customers teleport to your digital store.",
      icon: "📱",
      bg: "bg-gradient-to-br from-pink-50 via-rose-100 to-pink-200",
      text: "text-pink-900",
    },
    {
      id: 4,
      tag: "LUXURY UI",
      title: "EXPERIENCE LUXURY BROWSING ON EVERY SCREEN.",
      desc: "Let customers discover your heritage through elegant categories like Earrings, Rings, and Necklaces, optimized perfectly for mobile.",
      icon: "✨",
      bg: "bg-gradient-to-br from-zinc-900 to-zinc-800",
      text: "text-white",
    },
    {
      id: 5,
      tag: "LIVE MARKET",
      title: "REAL-TIME RATES. TOTAL CONTROL.",
      desc: "Update Gold 22K, 24K, and Silver rates instantly from your dashboard. Keep your pricing accurate with live market updates.",
      icon: "📈",
      bg: "bg-gradient-to-br from-yellow-100 to-yellow-300",
      text: "text-yellow-900",
    },
    {
      id: 6,
      tag: "INVENTORY",
      title: "ADD MASTERPIECES IN MINUTES, NOT HOURS.",
      desc: "Easily upload inventory by category, metal type, weight, making charges, and GST. Managing inventory has never been this easy.",
      icon: "⚡",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      text: "text-blue-900",
    },
    {
      id: 7,
      tag: "PHOTOGRAPHY",
      title: "INSTANTLY PREMIUM. AUTOMATED FORMATTING.",
      desc: "Our system automatically fits your jewelry into a premium square format on a light pink canvas. No editing skills required.",
      icon: "📸",
      bg: "bg-gradient-to-br from-rose-50 to-pink-100",
      text: "text-rose-900",
    },
    {
      id: 8,
      tag: "MOBILE UPLOAD",
      title: "POINT. SHOOT. UPLOAD. DIRECTLY FROM MOBILE.",
      desc: "Select 'Open Camera' during upload to take product photos and list them instantly on your storefront. No file transfers needed.",
      icon: "🤳",
      bg: "bg-gradient-to-br from-zinc-800 to-black",
      text: "text-yellow-400",
    },
    {
      id: 9,
      tag: "COMMUNICATION",
      title: "WHATSAPP INTEGRATION: ENQUIRIES INTO SALES.",
      desc: "The 'ENQUIRE' button drafts a pre-filled WhatsApp message with product details and live price, making buying effortless.",
      icon: "💬",
      bg: "bg-gradient-to-br from-green-50 to-green-200",
      text: "text-green-900",
    },
    {
      id: 10,
      tag: "POINT OF SALE",
      title: "IN-STORE BILLING, FASTER THAN EVER.",
      desc: "Streamline walk-in sales with our Instant Billing POS system. Capture customer data and create bills in under a minute.",
      icon: "🖨️",
      bg: "bg-gradient-to-br from-amber-50 to-orange-100",
      text: "text-orange-900",
    },
    {
      id: 11,
      tag: "INVOICING",
      title: "GENERATE PREMIUM TAX INVOICES INSTANTLY.",
      desc: "Download computer-generated, professionally formatted invoices featuring shop details, customer details, and itemized tables.",
      icon: "🧾",
      bg: "bg-gradient-to-br from-zinc-100 to-zinc-300",
      text: "text-zinc-900",
    },
    {
      id: 12,
      tag: "OPERATIONS",
      title: "MANAGE YOUR ORDERS LIKE A PRO.",
      desc: "Track and update order statuses (Pending, Completed, Delivered) directly from your dashboard. Never miss a deadline.",
      icon: "📦",
      bg: "bg-gradient-to-br from-indigo-50 to-blue-200",
      text: "text-indigo-900",
    },
    {
      id: 13,
      tag: "CUSTOMER EXPERIENCE",
      title: "TRANSPARENT TRACKING FOR YOUR BUYERS.",
      desc: "Keep customers informed. They can securely track their active orders using just their registered mobile number.",
      icon: "🔍",
      bg: "bg-gradient-to-br from-purple-50 to-purple-200",
      text: "text-purple-900",
    },
    {
      id: 14,
      tag: "CRM",
      title: "TURN CASUAL BROWSERS INTO LOYAL CUSTOMERS.",
      desc: "Capture potential leads by saving names and mobile numbers. Build a powerful database for future relationship marketing.",
      icon: "🤝",
      bg: "bg-gradient-to-br from-teal-50 to-teal-200",
      text: "text-teal-900",
    },
    {
      id: 15,
      tag: "RETENTION",
      title: "NEVER MISS A BIRTHDAY OR ANNIVERSARY.",
      desc: "Our CRM captures special dates and provides a 'Special Events Today' widget on your dashboard to drive repeat sales.",
      icon: "🎂",
      bg: "bg-gradient-to-br from-red-50 to-red-200",
      text: "text-red-900",
    },
    {
      id: 16,
      tag: "SMART CART",
      title: "A SMARTER SHOPPING BAG THAT REMEMBERS.",
      desc: "The cart dynamically saves items locally. Customers never lose their selected pieces, even if they return days later.",
      icon: "🛍️",
      bg: "bg-gradient-to-br from-zinc-900 to-zinc-800",
      text: "text-pink-400",
    },
    {
      id: 17,
      tag: "DISCOVERABILITY",
      title: "GET DISCOVERED. BE THE TOP SEARCH.",
      desc: "Built with cutting-edge tech, every boutique storefront is highly optimized for Google search and rapid page transitions.",
      icon: "🚀",
      bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
      text: "text-zinc-900",
    },
    {
      id: 18,
      tag: "FINANCE",
      title: "AUTOMATED GST CALCULATIONS. MISTAKE-FREE.",
      desc: "Input the GST percentage, and our system automatically calculates the tax amount and total price instantly.",
      icon: "🧮",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-200",
      text: "text-emerald-900",
    },
    {
      id: 19,
      tag: "MARKETING",
      title: "HIGHLIGHT YOUR BESTSELLERS INSTANTLY.",
      desc: "Simply toggle a button on your dashboard to put your most beautiful items into the highly visible Trending Showcase.",
      icon: "🔥",
      bg: "bg-gradient-to-br from-orange-400 to-red-500",
      text: "text-white",
    },
    {
      id: 20,
      tag: "TECHNOLOGY",
      title: "THE LUXURY APP EXPERIENCE. INSIDE THE BROWSER.",
      desc: "No app download required. The storefront functions and feels like a premium native app, optimized for touch and speed.",
      icon: "💎",
      bg: "bg-gradient-to-br from-zinc-950 to-black",
      text: "text-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 uppercase tracking-widest mb-4">KaratTech Features</h1>
        <p className="text-sm md:text-base text-zinc-500 font-medium">Capture these cards for your Instagram & Marketing</p>
      </div>

      {/* Grid of 20 Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {posters.map((poster) => (
          <div 
            key={poster.id} 
            /* 🔥 FIX: aspect-square hatakar min-h-[380px] diya hai, aur padding adjust ki hai */
            className={`min-h-[380px] ${poster.bg} rounded-[2.5rem] p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group`}
          >
            {/* Decorative Background Element */}
            <div className="absolute -top-6 -right-6 opacity-10 text-[120px] transform group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
              {poster.icon}
            </div>

            <div className="relative z-10">
              <span className={`inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-5 border-2 ${poster.text === 'text-white' || poster.text.includes('yellow') ? 'border-white/20 text-white/80' : 'border-black/10 text-black/60'}`}>
                {poster.tag}
              </span>
              {/* 🔥 FIX: Font size thoda chhota kiya taaki fit ho jaye */}
              <h2 className={`text-xl md:text-2xl font-black uppercase leading-tight tracking-wide mb-3 ${poster.text}`}>
                {poster.title}
              </h2>
            </div>

            <div className="relative z-10 mt-4">
              {/* 🔥 FIX: Description font size thoda chhota aur line-height theek ki */}
              <p className={`text-xs md:text-sm leading-relaxed font-semibold ${poster.text === 'text-white' || poster.text.includes('yellow') ? 'text-white/80' : 'text-black/70'}`}>
                {poster.desc}
              </p>
              <div className="mt-6 pt-5 border-t-2 border-current opacity-30 flex justify-between items-center">
                <span className="text-[9px] font-black tracking-widest uppercase">Powered by KaratTech</span>
                <span className="text-lg">{poster.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}