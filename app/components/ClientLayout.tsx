'use client';

import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoggedIn, handleLogout } = useApp();
  const isHomePage = pathname === '/';

  return (
    <div className="min-h-screen flex flex-col text-stone-800 font-sans selection:bg-red-100 selection:text-red-900">
      <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      
      <main className={`flex-1 max-w-7xl mx-auto w-full ${isHomePage ? 'px-0 sm:px-6 lg:px-8 pt-14 md:pt-0' : 'px-4 sm:px-6 lg:px-8 py-8 pt-20 md:pt-8'}`}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
