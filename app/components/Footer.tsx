import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-stone-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <img src="/logo.png" alt="RAOTA Logo" className="w-8 h-8 opacity-60" />
          <span className="text-lg font-black tracking-tighter text-stone-400">RAOTA</span>
        </div>
        <div className="text-stone-500 text-sm font-mono">
          © 2026 RAOTA. All rights reserved. <br className="md:hidden" />
          Designed for Noodle Lovers.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
