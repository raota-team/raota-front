'use client';

import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-stone-50">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-transparent">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-20 animate-ping"></div>
          <Image
            src="/logo.png" 
            alt="RAOTA Loading" 
            width={80}
            height={80}
            className="w-20 h-20 relative z-10 animate-bounce-slow"
          />
        </div>

        {/* Text and Progress */}
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl font-black tracking-tighter text-stone-900">
            RAOTA<span className="text-red-600">.</span>
          </h2>
          
          <div className="w-48 h-1 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 rounded-full animate-loading-bar origin-left"></div>
          </div>
          
          <p className="text-stone-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
            Lifting noodles...
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); opacity: 0; }
        }
        .animate-loading-bar {
          animation: loading-bar 2s infinite ease-in-out;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite ease-in-out;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
