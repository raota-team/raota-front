'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import Loading from '@/app/loading';
import { useApp } from '@/app/context/AppContext';
import { deleteMyAccount } from '@/lib/api/user';
import { clearAccessToken } from '@/lib/auth/accessToken';

export default function WithdrawPage() {
  const router = useRouter();
  const {
    isLoggedIn,
    isAuthChecking,
    setIsLoggedIn,
    setCurrentUser,
    showConfirm,
    showToast,
  } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthChecking && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isAuthChecking, isLoggedIn, router]);

  const submitWithdrawal = async () => {
    setIsSubmitting(true);
    try {
      const res = await deleteMyAccount();
      clearAccessToken();
      setIsLoggedIn(false);
      setCurrentUser(null);
      showToast(res.message || '회원 탈퇴가 완료되었습니다.', 'success');
      router.replace('/');
    } catch (error: any) {
      console.error('Failed to withdraw account:', error);
      showToast(error.message || '회원 탈퇴 처리 중 오류가 발생했습니다.', 'error');
      setIsSubmitting(false);
    }
  };

  const handleWithdrawClick = () => {
    showConfirm(
      '정말로 탈퇴하시겠습니까?\n탈퇴 후 30일 동안 같은 소셜 계정으로 재가입할 수 없습니다.',
      submitWithdrawal,
    );
  };

  if (isAuthChecking || !isLoggedIn) return <Loading />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 py-16 pb-32">
      <Link href="/mypage" className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-bold text-stone-500 transition-colors hover:text-[#25282b]">
        <ArrowLeft className="h-4 w-4" />
        마이페이지로 돌아가기
      </Link>

      <div className="rounded-sm border border-stone-200 bg-white p-8 md:p-10">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
          <ShieldAlert className="h-8 w-8 text-[#e60000]" />
        </div>

        <h1 className="mb-3 text-3xl font-black tracking-tight text-[#25282b]">회원 탈퇴</h1>
        <p className="mb-8 text-sm font-medium leading-7 text-stone-600">
          탈퇴가 완료되면 즉시 계정 접근이 중단되며, 탈퇴일로부터 30일 후 같은 소셜 계정으로 다시 가입할 수 있습니다.
          탈퇴 처리 후에는 아래 기준에 따라 회원 정보가 정리됩니다.
        </p>

        <div className="mb-8 space-y-3 rounded-sm border border-stone-200 bg-stone-50 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#e60000]" />
            <div>
              <h2 className="mb-2 text-sm font-black text-[#25282b]">탈퇴 전 확인해주세요</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm font-medium leading-6 text-stone-600">
                <li>탈퇴 후 30일 동안 같은 소셜 계정으로 재가입할 수 없습니다.</li>
                <li>30일이 지나면 소셜 계정, 토큰, 북마크, 인증샷 정보는 정리됩니다.</li>
                <li>커뮤니티 글과 댓글은 서비스 흐름 유지를 위해 남을 수 있습니다.</li>
                <li>남아 있는 글과 댓글의 프로필은 탈퇴한 사용자로 익명화됩니다.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/mypage" className="inline-flex items-center justify-center rounded-sm border border-stone-200 bg-white px-6 py-3 text-sm font-black text-stone-600 transition-colors hover:bg-stone-100">
            취소
          </Link>
          <button
            onClick={handleWithdrawClick}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#e60000] px-6 py-3 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            회원 탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
}
