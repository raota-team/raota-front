import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-stone-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-row justify-between items-center">
        <div className="flex items-center">
          <img src="/logo.png" alt="RAOTA Logo" className="w-5 h-5 sm:w-8 sm:h-8 opacity-60" />
          <span className="text-sm sm:text-lg font-black tracking-tighter text-stone-400 ml-1">RAOTA</span>
        </div>
        <div className="text-stone-400 text-[10px] sm:text-sm font-mono text-right">
          © 2026 RAOTA. <span className="hidden sm:inline">All rights reserved. </span>
          <br className="sm:hidden" />
          라멘 매니아를 위한 공간.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
