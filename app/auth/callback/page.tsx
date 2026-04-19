'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveRaotaOAuthSession } from '@/lib/auth/accessToken';
import { parseOAuthCallbackHash } from '@/lib/auth/parseOAuthCallbackHash';
import { useApp } from '@/app/context/AppContext';

type ViewState =
  | { phase: 'loading' }
  | { phase: 'error'; error: string; errorDescription: string | null; provider: string | null }
  | { phase: 'empty' };

export default function AuthCallbackPage() {
  const router = useRouter();
  const { syncAuthFromStorage } = useApp();
  const [view, setView] = useState<ViewState>({ phase: 'loading' });

  useEffect(() => {
    const parsed = parseOAuthCallbackHash();

    if (parsed.kind === 'token') {
      saveRaotaOAuthSession(parsed.accessToken, {
        tokenType: parsed.tokenType,
        expiresIn: parsed.expiresIn,
        memberId: parsed.memberId,
        newMember: parsed.newMember,
        provider: parsed.provider,
      });
      syncAuthFromStorage();

      if (typeof window !== 'undefined') {
        window.history.replaceState(
          null,
          document.title,
          `${window.location.pathname}${window.location.search}`,
        );
      }

      router.replace('/');
      return;
    }

    if (parsed.kind === 'error') {
      setView({
        phase: 'error',
        error: parsed.error,
        errorDescription: parsed.errorDescription,
        provider: parsed.provider,
      });
      return;
    }

    setView({ phase: 'empty' });
  }, [router, syncAuthFromStorage]);

  const title = useMemo(() => {
    if (view.phase === 'loading') return '처리 중…';
    if (view.phase === 'error') return '로그인에 문제가 있어요';
    return '표시할 정보가 없어요';
  }, [view.phase]);

  return (
    <div className="animate-fade-in flex flex-col items-center py-20 px-4">
      <div className="w-full max-w-md bg-white border border-stone-200 p-8 shadow-lg text-center rounded-lg">
        <h1 className="text-xl font-black text-stone-900 uppercase tracking-wide mb-3">{title}</h1>

        {view.phase === 'loading' && (
          <p className="text-stone-500 text-sm">로그인 정보를 저장하는 중…</p>
        )}

        {view.phase === 'error' && (
          <div className="text-left space-y-3 mt-2">
            <p className="text-stone-600 text-sm">백엔드 OAuth 처리 중 오류가 반환되었습니다.</p>
            <div className="rounded-md bg-stone-50 border border-stone-200 p-3 font-mono text-xs text-stone-800 break-all">
              <div>
                <span className="text-stone-500">error: </span>
                {view.error}
              </div>
              {view.provider && (
                <div>
                  <span className="text-stone-500">provider: </span>
                  {view.provider}
                </div>
              )}
              {view.errorDescription && (
                <div className="mt-2">
                  <span className="text-stone-500">description: </span>
                  {view.errorDescription}
                </div>
              )}
            </div>
          </div>
        )}

        {view.phase === 'empty' && (
          <p className="text-stone-500 text-sm">
            URL 해시에 <code className="text-xs bg-stone-100 px-1 rounded">accessToken</code> 또는{' '}
            <code className="text-xs bg-stone-100 px-1 rounded">error</code>가 없습니다.
          </p>
        )}

        {view.phase !== 'loading' && (
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
            >
              로그인 화면으로 돌아가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
