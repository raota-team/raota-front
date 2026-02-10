'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle, Fingerprint } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { handleLogin } = useApp();

  const onLogin = () => {
    handleLogin();
    router.push('/');
  };

  return (
    <div className="animate-fade-in flex flex-col items-center py-20">
      <div className="w-full max-w-md bg-white border border-stone-200 p-8 shadow-lg text-center rounded-lg">
        <div className="mb-6">
          <img src="/logo.png" alt="RAOTA Logo" className="w-24 h-24 mx-auto mb-3" />
          <h2 className="text-3xl font-black text-stone-900 uppercase tracking-wider mb-2">라오타에 오신것을<br />환영합니다!</h2>
          <p className="text-stone-500 text-sm">라멘을 사랑하는 미식가들의 공간</p>
        </div>

        <div className="space-y-3">
          {/* Kakao Login Button */}
          <button
            onClick={onLogin}
            className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center relative shadow-sm hover:shadow-md"
          >
            <MessageCircle className="w-5 h-5 absolute left-4" fill="currentColor" strokeWidth={0} />
            <span>카카오로 시작하기</span>
          </button>

          {/* Google Login Button */}
          <button
            onClick={onLogin}
            className="w-full bg-white hover:bg-gray-50 text-[#3c4043] font-semibold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center border border-[#dadce0] relative shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google로 시작하기</span>
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-stone-400">또는</span>
            </div>
          </div>

          {/* Passkey Login Button */}
          <button
            onClick={onLogin}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center relative shadow-md hover:shadow-lg"
          >
            <Fingerprint className="w-5 h-5 absolute left-4" strokeWidth={2} />
            <span>패스키로 시작하기</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-stone-400 text-xs">로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.</p>
        </div>
      </div>
    </div>
  );
}
