'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const PaymentPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#111] border border-white/10 p-8 rounded-3xl shadow-2xl text-center">
        
        <h1 className="text-3xl font-extrabold tracking-tighter text-white mb-2">
          Complete <span className="text-yellow-500">Payment</span>
        </h1>
        <p className="text-gray-400 mb-8">Scan the QR code below to renew your subscription</p>

        {/* --- QR CODE IMAGE --- */}
        <div className="bg-white p-4 rounded-2xl inline-block mb-6">
          <Image 
            src="/qr-code.jpeg" // <--- Public folder mein ye image rakhein
            alt="UPI QR Code" 
            width={250} 
            height={250}
            className="rounded-lg"
          />
        </div>
        {/* ---------------------- */}

        <div className="text-sm text-gray-500 mb-6">
          Amount: <span className="font-bold text-white text-lg">₹499.00</span>
        </div>

        <p className="text-gray-400 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-8">
          Note: Payment successful hone ke baad, admin ko screenshot bhejein activation ke liye. <br />
          Admin Contact No:+918917601327
        </p>

        <button 
          onClick={() => router.push('/dashboard')}
          className="w-full bg-white/10 hover:bg-white/20 text-white p-4 rounded-xl font-bold transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;