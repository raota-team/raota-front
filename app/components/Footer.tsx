import React from 'react';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#25282b] py-5 md:py-6 text-white/80 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:justify-between md:items-center">
          {/* Left Column: Brand & Logo with perfect alignment */}
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="RAOTA Logo" width={32} height={32} className="h-8 w-8 opacity-95 shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="text-sm font-black tracking-wider text-white uppercase leading-none">RAOTA</span>
              <span className="text-[9px] text-white/40 mt-1 block font-medium leading-none">라멘에 진심인 사람들</span>
            </div>
          </div>

          {/* Right Column: Legal & Contact */}
          <div className="flex flex-col gap-1 md:items-end">
            <div className="flex items-center gap-3 text-[11px] font-semibold text-white/60">
              <a href="/terms" className="hover:text-white transition-colors">이용약관</a>
              <span className="text-white/20 text-[9px]">|</span>
              <a href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</a>
            </div>
            <a href="mailto:contact@raota.net" className="hover:text-white transition-colors text-[10px] text-white/40 mt-0.5 block md:text-right font-medium">
              제휴 및 문의: contact@raota.net
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-5 border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-white/40">
          <p>© 2026 RAOTA. All rights reserved.</p>
          <p className="font-medium hidden sm:block">RAOTA - 라멘 맛집 정보 · AI 추천 · 커뮤니티</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
