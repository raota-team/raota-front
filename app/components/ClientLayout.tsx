'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, handleLogout } = useApp();
  const isHomePage = pathname === '/';

  const onLogout = useCallback(() => {
    handleLogout();
    if (pathname === '/mypage') {
      router.push('/');
    }
  }, [handleLogout, pathname, router]);

  return (
    <div className="min-h-screen flex flex-col text-stone-800 font-sans selection:bg-red-100 selection:text-red-900">
      <Header isLoggedIn={isLoggedIn} handleLogout={onLogout} />

      <main className={`flex-1 w-full ${isHomePage ? 'pt-14 md:pt-0' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 md:pt-8'}`}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
