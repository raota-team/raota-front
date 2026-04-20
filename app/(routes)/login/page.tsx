'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Fingerprint } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { handleLogin } = useApp();

  useEffect(() => {
    // 백엔드에서 리다이렉트된 해시 파라미터 처리
    const hash = window.location.hash;
    if (hash && hash.includes('accessToken')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('accessToken');
      const newMember = params.get('newMember') === 'true';

      if (accessToken) {
        // 토큰이 있으면 로컬 스토리지 등에 저장 (필요한 경우)
        localStorage.setItem('accessToken', accessToken);
        
        if (newMember) {
          // 신규 회원이면 회원가입 페이지로 이동
          router.push('/register');
        } else {
          // 기존 회원이면 로그인 처리 후 홈으로 이동
          handleLogin();
          router.push('/');
        }
      }
    }
  }, [handleLogin, router]);

  const onKaKaoLogin = () => {
    window.location.href = 'https://api.raota.net/oauth2/authorization/kakao';
  };

  const onGoogleLogin = () => {
    window.location.href = 'https://api.raota.net/oauth2/authorization/google';
  };

  const onPasskeyLogin = () => {
    // Redirect to register page since passkey is not yet integrated
    router.push('/register');
  };

  return (
    <div className="flex flex-col items-center py-20 px-4">
      <div className="w-full max-w-md bg-white border border-stone-200 p-8 shadow-lg text-center rounded-2xl">
        <div className="mb-8">
          <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <img src="/logo.png" alt="RAOTA Logo" className="w-14 h-14 object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">라오타에 오신것을<br />환영합니다!</h2>
          <p className="text-stone-500 text-sm">라멘을 사랑하는 미식가들의 공간</p>
        </div>

        <div className="space-y-3">
          {/* Kakao Login Button */}
          <button
            onClick={onKaKaoLogin}
            className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold py-4 px-4 rounded-xl transition-all flex items-center justify-center relative shadow-sm hover:shadow-md"
          >
            <MessageCircle className="w-5 h-5 absolute left-5" fill="currentColor" strokeWidth={0} />
            <span>카카오로 시작하기</span>
          </button>

          {/* Google Login Button */}
          <button
            onClick={onGoogleLogin}
            className="w-full bg-white hover:bg-stone-50 text-stone-700 font-semibold py-4 px-4 rounded-xl transition-all flex items-center justify-center border border-stone-200 relative shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 absolute left-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google로 시작하기</span>
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-stone-400">또는</span>
            </div>
          </div>

          {/* Passkey Login Button */}
          <button
            onClick={onPasskeyLogin}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-4 px-4 rounded-xl transition-all flex items-center justify-center relative shadow-md hover:shadow-lg group"
          >
            <Fingerprint className="w-5 h-5 absolute left-5 text-orange-500 group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span>패스키로 시작하기</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-50 text-center">
          <p className="text-stone-500 text-sm mb-4">처음이신가요?</p>
          <button
            onClick={() => router.push('/register')}
            className="text-orange-600 font-bold hover:text-orange-700 transition-colors underline underline-offset-4"
          >
            이메일로 회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
