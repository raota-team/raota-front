'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, LogIn, LogOut, Menu, X, Home, MessageSquare, User, UtensilsCrossed, Sparkles, NotebookPen } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  isLoggedIn: boolean;
  isAuthChecking: boolean;
  handleLogout: () => void | Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, isAuthChecking, handleLogout }) => {
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
  const mobileNavItems = [
    {
      href: '/',
      label: '홈',
      description: '라오타 최신 소식과 인기 라멘',
      icon: Home,
      active: currentPath === '/',
    },
    {
      href: '/shops',
      label: '가게',
      description: '라멘 맛집과 메뉴 정보 둘러보기',
      icon: UtensilsCrossed,
      active: isActive('/shops') || currentPath.startsWith('/shop/'),
    },
    {
      href: '/ramen-log',
      label: '라멘로그',
      description: '유저들의 한 그릇 기록 둘러보기',
      icon: NotebookPen,
      active: isActive('/ramen-log'),
    },
    {
      href: '/community',
      label: '커뮤니티',
      description: '후기와 인증샷, 라멘 이야기',
      icon: MessageSquare,
      active: isActive('/community'),
    },
    {
      href: '/recommend',
      label: '추천받기',
      description: '취향과 기분에 맞는 한 그릇 찾기',
      icon: Sparkles,
      active: isActive('/recommend'),
      featured: true,
    },
    {
      href: myPagePath,
      label: '마이페이지',
      description: isLoggedIn ? '내 방문 기록과 활동 모아보기' : '로그인 후 내 활동을 확인해요',
      icon: User,
      active: currentPath === myPagePath || (isLoggedIn && currentPath.startsWith('/user/')),
    },
  ];

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex w-full justify-center pointer-events-none">
        <nav className={`pointer-events-auto w-full border-b transition-colors duration-300 ${
          isTransparent ? 'border-transparent bg-transparent' : 'border-stone-200 bg-white'
        }`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between md:h-16">
              <Link href="/" className="flex items-center cursor-pointer">
                <Image
                  src="/logo.png"
                  alt="RAOTA Logo"
                  width={40}
                  height={40}
                  sizes="(min-width: 768px) 40px, 28px"
                  className="w-7 h-7 md:w-10 md:h-10 transition-all duration-300"
                />
                <span className={`ml-2 text-base font-extrabold uppercase tracking-[-0.02em] transition-colors md:text-xl ${logoTextColor}`}>RAOTA<span className="text-[#e60000]">.</span></span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:block flex-1">
                <div className="ml-10 flex items-center justify-end gap-6">
                  <Link href="/" className={`text-sm transition-colors ${currentPath === '/' ? activeTextColor : navTextColor}`}>홈</Link>
                  <Link href="/shops" className={`text-sm transition-colors ${currentPath === '/shops' || currentPath.startsWith('/shop/') ? activeTextColor : navTextColor}`}>가게</Link>
                  <Link href="/ramen-log" className={`text-sm transition-colors ${currentPath === '/ramen-log' ? activeTextColor : navTextColor}`}>라멘로그</Link>
                  <Link href="/community" className={`text-sm transition-colors ${currentPath === '/community' || currentPath.startsWith('/community/') ? activeTextColor : navTextColor}`}>커뮤니티</Link>
                  <Link
                    href="/recommend"
                    className={`text-sm transition-colors ${currentPath === '/recommend' ? activeTextColor : navTextColor}`}
                  >
                    추천받기
                  </Link>
                  <Link href={myPagePath} className={`text-sm transition-colors ${currentPath === myPagePath ? activeTextColor : navTextColor}`}>마이페이지</Link>

                  {isAuthChecking && !isLoggedIn ? (
                    <div className="h-11 w-24 rounded-sm bg-stone-100" aria-hidden="true" />
                  ) : isLoggedIn ? (
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
                aria-label={isMobileMenuOpen ? '모바일 메뉴 닫기' : '모바일 메뉴 열기'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={closeMobileMenu} 
      />

      {/* Mobile Slide-out Menu */}
      <div 
        id="mobile-navigation" 
        className={`fixed inset-y-0 right-0 z-[70] w-full max-w-[22rem] bg-[#fbfaf8] pb-safe md:hidden transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4">
            <Link href="/" onClick={closeMobileMenu} className="flex items-center">
              <Image
                src="/logo.png"
                alt="RAOTA Logo"
                width={36}
                height={36}
                sizes="36px"
                className="h-9 w-9"
              />
              <span className="ml-2 text-lg font-extrabold uppercase text-stone-950">RAOTA<span className="text-[#e60000]">.</span></span>
            </Link>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-stone-200 text-stone-700 transition-colors hover:border-[#e60000] hover:text-[#e60000]"
              aria-label="모바일 메뉴 닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 px-4 py-4">
            <p className="px-1 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">Navigation</p>
            <div className="space-y-2">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`group flex items-center gap-3 rounded-sm border px-3 py-3.5 transition-colors ${
                      item.active
                        ? 'border-[#e60000] bg-white text-[#e60000] shadow-sm'
                        : 'border-stone-200 bg-white text-[#25282b] hover:border-stone-300 hover:text-[#e60000]'
                    }`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm transition-colors ${
                      item.active ? 'bg-[#e60000] text-white' : 'bg-stone-100 text-stone-600 group-hover:bg-red-50 group-hover:text-[#e60000]'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-base font-bold">
                        {item.label}
                        {item.featured && (
                          <span className="rounded-sm bg-red-50 px-1.5 py-0.5 text-[10px] font-black text-[#e60000]">AI</span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-xs font-medium text-stone-500">{item.description}</span>
                    </span>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${item.active ? 'text-[#e60000]' : 'text-stone-300'}`} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Login/Logout at bottom */}
          <div className="border-t border-stone-200 bg-white p-4">
            {isAuthChecking && !isLoggedIn ? (
              <div className="h-11 w-full rounded-sm bg-stone-100" aria-hidden="true" />
            ) : isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="flex w-full items-center justify-center rounded-sm border border-stone-300 py-3 text-center text-sm font-bold text-[#333333] transition-colors hover:border-[#e60000] hover:text-[#e60000]"
              >
                <LogOut className="mr-2 h-4 w-4" />
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
