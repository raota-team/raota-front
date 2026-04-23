'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import Header from './Header';
import Footer from './Footer';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, handleLogout, toast } = useApp();
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

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full flex justify-center pointer-events-none">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 animate-in fade-in slide-in-from-top-8 zoom-in-95 duration-500 ease-out pointer-events-auto ${
            toast.type === 'success' ? 'bg-green-600/90 text-white' :
            toast.type === 'error' ? 'bg-red-600/90 text-white' :
            'bg-stone-900/90 text-white'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-200" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-200" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-stone-300" />}
            <span className="font-bold text-sm tracking-tight whitespace-nowrap">{toast.message}</span>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
