import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#25282b] py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-b border-white/25 pb-8 md:grid-cols-5">
          <div>
            <h2 className="text-base font-extrabold uppercase">RAOTA</h2>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
              라멘에 진심인 사람들의 맛집 지도와 커뮤니티.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase">Explore</h3>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <a href="/shops" className="block hover:text-white">가게</a>
              <a href="/community" className="block hover:text-white">커뮤니티</a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase">Account</h3>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <a href="/login" className="block hover:text-white">로그인</a>
              <a href="/login" className="block hover:text-white">시작하기</a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase">Legal</h3>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <a href="/terms" className="block hover:text-white">이용약관</a>
              <a href="/privacy" className="block hover:text-white">개인정보처리방침</a>
              <a href="mailto:contact@raota.net" className="block hover:text-white">문의하기</a>
            </div>
          </div>
          <div className="flex items-start justify-start md:justify-end">
            <img src="/logo.png" alt="RAOTA Logo" className="h-10 w-10" />
          </div>
        </div>
        <div className="text-xs font-medium text-white/60 sm:text-sm">
          © 2026 RAOTA. <span className="hidden sm:inline">All rights reserved. </span>
          <span className="block sm:inline">RAOTA - 라멘에 진심인 사람들</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
