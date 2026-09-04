import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans scroll-smooth">
      
      {/* 1. NAVBAR - The Elite Header */}
      <nav className="fixed top-0 w-full flex justify-between items-center px-6 md:px-12 py-5 bg-[#050505]/95 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="text-2xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f3e5ab]">
          KARATTECH
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest text-gray-400 font-semibold">
          <a href="#home" className="hover:text-[#d4af37] transition duration-300">Home</a>
          <a href="#services" className="hover:text-[#d4af37] transition duration-300">Services</a>
          <a href="#policy" className="hover:text-[#d4af37] transition duration-300">Policy</a>
          <a href="#contact" className="hover:text-[#d4af37] transition duration-300">Contact</a>
        </div>

        <Link href="/login" className="border border-[#d4af37] text-[#d4af37] px-6 py-2 rounded text-sm tracking-widest hover:bg-[#d4af37] hover:text-black transition duration-300">
          LOGIN
        </Link>
      </nav>

      {/* 2. HOME (Hero Section with the Box) */}
      <section id="home" className="flex flex-col items-center justify-center text-center px-4 pt-48 pb-32 min-h-screen bg-[url('/bg-pattern.svg')] bg-cover bg-center">
        
        {/* THE PREMIUM BOX */}
        <div className="bg-[#0f0f0f] border border-[#d4af37]/40 rounded-2xl p-10 md:p-14 max-w-xl mx-auto shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden group hover:border-[#d4af37] transition duration-500">
          {/* Gold Glow Effect behind box */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#d4af37] shadow-[0_0_20px_#d4af37]"></div>
          
          <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight tracking-tight text-white uppercase">
            Create Your Web <br/>
            <span className="text-[#d4af37]">Jewellery Shop</span>
          </h1>
          
          <p className="text-gray-400 mb-10 font-light text-sm md:text-base">
            Join the elite network of modern jewelers. Launch your digital storefront, manage inventory, and issue digital purity cards instantly.
          </p>
          
          <Link href="/login" className="bg-gradient-to-r from-[#d4af37] to-[#e6c148] text-black px-10 py-4 rounded font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform duration-300 w-full block shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            CREATE
          </Link>
        </div>

      </section>

      {/* 3. OUR SERVICES */}
      <section id="services" className="py-24 px-6 md:px-12 bg-[#0a0a0a]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-widest uppercase mb-4 text-[#d4af37]">Our Services</h2>
          <div className="w-16 h-1 bg-[#d4af37] mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-[#111] p-8 rounded-lg border border-gray-800 hover:border-[#d4af37] transition">
            <h3 className="text-xl font-bold mb-3 text-white">Custom Web Shops</h3>
            <p className="text-gray-400 font-light">Launch a premium digital boutique instantly with zero technical headaches.</p>
          </div>
          <div className="bg-[#111] p-8 rounded-lg border border-gray-800 hover:border-[#d4af37] transition">
            <h3 className="text-xl font-bold mb-3 text-white">Smart Installments</h3>
            <p className="text-gray-400 font-light">Automate corporate plans like 9+1 month structures directly from your dashboard.</p>
          </div>
          <div className="bg-[#111] p-8 rounded-lg border border-gray-800 hover:border-[#d4af37] transition">
            <h3 className="text-xl font-bold mb-3 text-white">Digital Purity Cards</h3>
            <p className="text-gray-400 font-light">Generate secure, verified digital purity certificates for your jewelry.</p>
          </div>
        </div>
      </section>

      {/* 4. POLICY */}
      <section id="policy" className="py-24 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-widest uppercase mb-6 text-[#d4af37]">Trust & Policy</h2>
          <p className="text-gray-400 font-light leading-relaxed mb-8">
            At KaratTech, we prioritize the security of your business and your customers. Our platform operates on strict end-to-end encryption. Data privacy, secure transactions, and transparent policies form the foundation of our elite network.
          </p>
          <div className="flex justify-center gap-6 text-sm text-[#d4af37] underline">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Refund Policy</a>
          </div>
        </div>
      </section>

      {/* 5. CONTACT & FOOTER */}
      <section id="contact" className="py-24 px-6 md:px-12 bg-[#0a0a0a] border-t border-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-widest uppercase mb-6 text-[#d4af37]">Contact Us</h2>
          <p className="text-gray-400 font-light mb-8">Ready to upgrade your jewelry brand? Reach out to our expert team today.</p>
          <a href="mailto:admin@karattech.in" className="inline-block border border-[#d4af37] text-[#d4af37] px-8 py-4 rounded hover:bg-[#d4af37] hover:text-black transition font-bold tracking-widest">
            admin@karattech.in
          </a>
        </div>
        <div className="text-center text-xs text-gray-600 mt-24">
          © {new Date().getFullYear()} KaratTech SaaS. Built for the future of jewelry.
        </div>
      </section>
      
    </div>
  );
}