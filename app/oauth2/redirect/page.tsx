'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setAccessToken } from '@/lib/auth/accessToken';
import { useApp } from '@/app/context/AppContext';

export default function Oauth2RedirectPage() {
  const router = useRouter();
  const { syncAuthFromStorage } = useApp();
  const [status, setStatus] = useState<'pending' | 'ok' | 'missing'>('pending');

  useEffect(() => {
    const rawHash = typeof window !== 'undefined' ? window.location.hash : '';
    const token = new URLSearchParams(rawHash.startsWith('#') ? rawHash.substring(1) : rawHash).get(
      'accessToken',
    );

    if (!token?.trim()) {
      setStatus('missing');
      return;
    }

    setAccessToken(token.trim());
    syncAuthFromStorage();

    // 주소창에 토큰이 남지 않도록 해시만 제거 (히스토리 엔트리는 유지)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`);
    }

    setStatus('ok');
    router.replace('/');
  }, [router, syncAuthFromStorage]);

  if (status === 'missing') {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[50vh] px-4">
        <div className="w-full max-w-md bg-white border border-stone-200 p-8 shadow-lg text-center rounded-lg">
          <h1 className="text-lg font-black text-stone-900 uppercase tracking-wide mb-2">토큰을 찾을 수 없어요</h1>
          <p className="text-stone-600 text-sm mb-6">
            URL에 <code className="text-xs bg-stone-100 px-1 rounded">#accessToken=...</code> 이 없습니다. 백엔드
            리다이렉트 주소를 확인해 주세요.
          </p>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-4 rounded-lg text-sm"
          >
            로그인으로 이동
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[50vh] px-4">
      <p className="text-stone-500 text-sm">로그인 정보를 저장하는 중…</p>
    </div>
  );
}
