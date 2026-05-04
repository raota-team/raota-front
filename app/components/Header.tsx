'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, Menu, X, Home, MessageSquare, User, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  isLoggedIn: boolean;
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, handleLogout }) => {
  const pathname = usePathname();
  const currentPath = pathname;
  const { currentUser } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isHomePage = currentPath === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isTransparent = isHomePage && !scrolled && !isMobile;
  const navTextColor = isTransparent ? 'text-white/95 hover:text-white font-normal' : 'text-[#25282b] hover:text-[#e60000] font-normal';
  const activeTextColor = isTransparent ? 'text-white font-bold' : 'text-[#e60000] font-bold';
  const logoTextColor = isTransparent ? 'text-white' : 'text-stone-900';
  const loginBtnClass = isTransparent 
    ? 'bg-white text-[#25282b] hover:bg-stone-100' 
    : 'bg-[#e60000] text-white hover:opacity-90';

  // 마이페이지 경로 결정 (로그인 시 본인 ID 주소, 미로그인 시 로그인 페이지)
  const myPagePath = isLoggedIn && currentUser ? `/user/${currentUser.user_id || currentUser.id}` : '/login';

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex w-full justify-center pointer-events-none">
        <nav className={`pointer-events-auto w-full border-b transition-colors duration-300 ${
          isTransparent ? 'border-transparent bg-transparent' : 'border-stone-200 bg-white'
        }`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between md:h-16">
              <Link href="/" className="flex items-center cursor-pointer">
                <img src="/logo.png" alt="RAOTA Logo" className="w-7 h-7 md:w-10 md:h-10 transition-all duration-300" />
                <span className={`ml-2 text-base font-extrabold uppercase tracking-[-0.02em] transition-colors md:text-xl ${logoTextColor}`}>RAOTA<span className="text-[#e60000]">.</span></span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:block flex-1">
                <div className="ml-10 flex items-center justify-end gap-7">
                  <Link href="/" className={`text-sm transition-colors ${currentPath === '/' ? activeTextColor : navTextColor}`}>홈</Link>
                  <Link href="/shops" className={`text-sm transition-colors ${currentPath === '/shops' || currentPath.startsWith('/shop/') ? activeTextColor : navTextColor}`}>가게</Link>
                  <Link href="/community" className={`text-sm transition-colors ${currentPath === '/community' || currentPath.startsWith('/community/') ? activeTextColor : navTextColor}`}>커뮤니티</Link>
                  <Link href={myPagePath} className={`text-sm transition-colors ${currentPath === myPagePath ? activeTextColor : navTextColor}`}>마이페이지</Link>

                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className={`font-bold text-sm transition-colors uppercase ${navTextColor}`}
                    >
                      로그아웃
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className={`flex items-center rounded-sm px-4 py-3 text-sm font-bold transition-opacity ${loginBtnClass}`}
                    >
                      <LogIn className="w-4 h-4 mr-2" /> 로그인
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile Hamburger Button */}
              <button
                className={`md:hidden p-1.5 transition-colors ${isTransparent ? 'text-white' : 'text-[#25282b] hover:text-[#e60000]'}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={closeMobileMenu} />
      )}

      {/* Mobile Slide-out Menu */}
      <div className={`md:hidden fixed inset-y-0 right-0 z-40 w-full max-w-72 transform bg-white pt-14 pb-safe transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex-1 py-3">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className={`flex items-center border-l-4 px-6 py-4 text-lg font-normal transition-colors ${isActive('/') ? 'border-[#e60000] text-[#e60000]' : 'border-transparent text-[#25282b] hover:text-[#e60000]'}`}
            >
              <Home className="w-5 h-5 mr-3" />
              홈
            </Link>
            <Link
              href="/shops"
              onClick={closeMobileMenu}
              className={`flex items-center border-l-4 px-6 py-4 text-lg font-normal transition-colors ${isActive('/shops') ? 'border-[#e60000] text-[#e60000]' : 'border-transparent text-[#25282b] hover:text-[#e60000]'}`}
            >
              <UtensilsCrossed className="w-5 h-5 mr-3" />
              가게
            </Link>
            <Link
              href="/community"
              onClick={closeMobileMenu}
              className={`flex items-center border-l-4 px-6 py-4 text-lg font-normal transition-colors ${isActive('/community') ? 'border-[#e60000] text-[#e60000]' : 'border-transparent text-[#25282b] hover:text-[#e60000]'}`}
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              커뮤니티
            </Link>
            <Link
              href={myPagePath}
              onClick={closeMobileMenu}
              className={`flex items-center border-l-4 px-6 py-4 text-lg font-normal transition-colors ${isActive(myPagePath) ? 'border-[#e60000] text-[#e60000]' : 'border-transparent text-[#25282b] hover:text-[#e60000]'}`}
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
                className="w-full rounded-sm border border-[#333333] py-3 text-center text-sm font-bold text-[#333333] transition-opacity hover:opacity-90"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="flex w-full items-center justify-center rounded-sm bg-[#e60000] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                <LogIn className="w-4 h-4 mr-2" /> 로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
