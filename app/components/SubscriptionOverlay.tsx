"use client";

import React from 'react';

interface SubscriptionOverlayProps {
  status: 'EXPIRED' | 'LOCKED';
  shopName: string;
}

const SubscriptionOverlay: React.FC<SubscriptionOverlayProps> = ({ status, shopName }) => {
  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 p-8 md:p-12 rounded-3xl max-w-lg w-full text-center shadow-2xl">
        <div className="text-6xl mb-6">
          {status === 'LOCKED' ? '🚫' : '⌛'}
        </div>
        <h2 className="text-3xl font-black text-white mb-4">
          {status === 'LOCKED' ? 'Access Suspended' : 'Trial Expired'}
        </h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          {status === 'LOCKED' 
            ? `Bhai, ${shopName} ka access admin ne lock kar diya hai.`
            : `Bhai, ${shopName} ka trial khatam ho gaya hai. Please subscribe karein.`}
        </p>
        {status === 'EXPIRED' && (
          <button 
            onClick={() => window.open('https://wa.me/YOUR_NUMBER', '_blank')}
            className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl"
          >
            WhatsApp to Subscribe
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionOverlay;