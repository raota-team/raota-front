'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Header from './Header';
import Footer from './Footer';
import { CheckCircle2, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { getMyProfile } from '@/lib/api/user';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isAuthChecking, handleLogout, toast, confirm, setConfirm, currentUser, setCurrentUser } = useApp();
  const isHomePage = pathname === '/';

  // 실제 프로필 정보 동기화
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        if (res.data) {
          setCurrentUser(res.data);
        }
      } catch (err) {
        console.error('Failed to sync profile:', err);
      }
    };

    if (isLoggedIn && (!currentUser || currentUser.nickname.startsWith('회원 #'))) {
      fetchProfile();
    }
  }, [isLoggedIn, currentUser, setCurrentUser]);

  const onLogout = useCallback(async () => {
    await handleLogout();
  }, [handleLogout]);

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-[#25282b] selection:bg-red-100 selection:text-red-900">
      <Header isLoggedIn={isLoggedIn} isAuthChecking={isAuthChecking} handleLogout={onLogout} />

      <main className={`flex-1 w-full ${isHomePage ? 'pt-0' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 md:pt-8'}`}>
        {children}
      </main>

      {/* Global Confirm Modal */}
      {confirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm overflow-hidden rounded-md border border-stone-200 bg-white shadow-none animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
            <div className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                <HelpCircle className="w-8 h-8 text-stone-900" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">알림</h3>
              <p className="text-stone-500 leading-relaxed whitespace-pre-wrap font-medium">
                {confirm.message}
              </p>
            </div>
            <div className="flex border-t border-stone-100">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-4 text-stone-400 font-bold hover:bg-stone-50 transition-colors border-r border-stone-100"
              >
                취소
              </button>
              <button
                onClick={() => {
                  confirm.onConfirm();
                  setConfirm(null);
                }}
                className="flex-1 py-4 font-bold text-[#e60000] transition-colors hover:bg-red-50"
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full flex justify-center pointer-events-none">
          <div className={`flex items-center gap-3 rounded-sm border border-white/20 px-6 py-4 shadow-none animate-in fade-in slide-in-from-top-8 zoom-in-95 duration-500 ease-out pointer-events-auto ${
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
