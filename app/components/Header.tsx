'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, Menu, X, Home, MessageSquare, User, UtensilsCrossed } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, handleLogout }) => {
  const pathname = usePathname();
  const currentPath = pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="border-b-2 border-red-500/20 bg-white/95 backdrop-blur fixed md:sticky top-0 left-0 right-0 z-50 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link href="/" className="flex items-center cursor-pointer">
              <img src="/logo.png" alt="RAOTA Logo" className="w-10 h-10" />
              <span className="text-xl font-black tracking-tighter text-stone-900">RAOTA<span className="text-red-600">.</span></span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:block flex-1">
              <div className="ml-10 flex items-baseline justify-end space-x-8">
                <Link href="/" className={`px-4 py-2 text-sm font-bold transition-colors uppercase ${currentPath === '/' ? 'text-red-600' : 'text-stone-500 hover:text-red-500'}`}>홈</Link>
                <Link href="/shops" className={`px-4 py-2 text-sm font-bold transition-colors uppercase ${currentPath === '/shops' || currentPath.startsWith('/shop/') ? 'text-red-600' : 'text-stone-500 hover:text-red-500'}`}>가게</Link>
                <Link href="/community" className={`px-4 py-2 text-sm font-bold transition-colors uppercase ${currentPath === '/community' || currentPath.startsWith('/community/') ? 'text-red-600' : 'text-stone-500 hover:text-red-500'}`}>커뮤니티</Link>
                <Link href="/mypage" className={`px-4 py-2 text-sm font-bold transition-colors uppercase ${currentPath === '/mypage' ? 'text-red-600' : 'text-stone-500 hover:text-red-500'}`}>마이페이지</Link>

                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="text-stone-500 hover:text-stone-900 font-bold text-sm transition-colors uppercase"
                  >
                    로그아웃
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="bg-stone-900 text-white hover:bg-red-600 hover:text-white px-4 py-2 rounded-sm text-sm font-bold transition-all uppercase flex items-center"
                  >
                    <LogIn className="w-4 h-4 mr-2" /> Login
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden p-2 text-stone-600 hover:text-red-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={closeMobileMenu} />
      )}

      {/* Mobile Slide-out Menu */}
      <div className={`md:hidden fixed inset-y-0 right-0 w-64 pt-14 pb-safe bg-white z-40 shadow-xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex-1 py-4">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className={`flex items-center px-6 py-4 text-base font-bold transition-colors ${isActive('/') ? 'text-red-600 bg-red-50 border-l-4 border-red-600' : 'text-stone-600 hover:text-red-500 hover:bg-stone-50 border-l-4 border-transparent'}`}
            >
              <Home className="w-5 h-5 mr-3" />
              홈
            </Link>
            <Link
              href="/shops"
              onClick={closeMobileMenu}
              className={`flex items-center px-6 py-4 text-base font-bold transition-colors ${isActive('/shops') ? 'text-red-600 bg-red-50 border-l-4 border-red-600' : 'text-stone-600 hover:text-red-500 hover:bg-stone-50 border-l-4 border-transparent'}`}
            >
              <UtensilsCrossed className="w-5 h-5 mr-3" />
              가게
            </Link>
            <Link
              href="/community"
              onClick={closeMobileMenu}
              className={`flex items-center px-6 py-4 text-base font-bold transition-colors ${isActive('/community') ? 'text-red-600 bg-red-50 border-l-4 border-red-600' : 'text-stone-600 hover:text-red-500 hover:bg-stone-50 border-l-4 border-transparent'}`}
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              커뮤니티
            </Link>
            <Link
              href="/mypage"
              onClick={closeMobileMenu}
              className={`flex items-center px-6 py-4 text-base font-bold transition-colors ${isActive('/mypage') ? 'text-red-600 bg-red-50 border-l-4 border-red-600' : 'text-stone-600 hover:text-red-500 hover:bg-stone-50 border-l-4 border-transparent'}`}
            >
              <User className="w-5 h-5 mr-3" />
              마이페이지
            </Link>
          </div>

          {/* Login/Logout at bottom */}
          <div className="border-t border-stone-200 p-4">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="w-full py-3 text-center text-stone-500 hover:text-stone-900 font-bold text-sm transition-colors uppercase border border-stone-300 rounded-sm"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="flex items-center justify-center w-full py-3 bg-stone-900 text-white hover:bg-red-600 rounded-sm text-sm font-bold transition-all uppercase"
              >
                <LogIn className="w-4 h-4 mr-2" /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
