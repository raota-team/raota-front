'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import Image from 'next/image';
import { useMemberSummary } from '@/hooks/queries/useUser';

export default function UserProfileCard() {
  const { data: summaryData, isLoading } = useMemberSummary();
  const user = summaryData?.data;

  if (isLoading) {
    return (
      <div className="rounded-md bg-white p-4 md:p-6 shadow-sm ring-1 ring-[#f2f2f2]">
         <div className="mb-4 md:mb-6 flex items-center gap-4 animate-pulse">
           <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-stone-200" />
           <div className="space-y-2">
             <div className="h-3 w-16 bg-stone-200 rounded" />
             <div className="h-4 w-24 bg-stone-200 rounded" />
           </div>
         </div>
         <div className="h-12 w-full rounded-sm bg-stone-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-md bg-white p-4 md:p-6 shadow-sm ring-1 ring-[#f2f2f2]">
      <div className="mb-4 md:mb-6 flex items-center gap-4">
        {user?.profileImageUrl ? (
          <div className="relative h-12 w-12 md:h-14 md:w-14 overflow-hidden rounded-full ring-1 ring-black/5">
            <Image src={user.profileImageUrl} alt="프로필" fill className="object-cover" sizes="56px" />
          </div>
        ) : (
          <div className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[#e60000]">
            <Users className="h-6 w-6 md:h-7 md:w-7" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[10px] md:text-xs text-[#7e7e7e]">어서오세요!</p>
          <p className="text-sm md:text-base font-bold text-[#25282b] truncate">{user ? `${user.nickname}님` : '라멘을 사랑하는 분'}</p>
        </div>
      </div>
      {user ? (
        <Link 
          href="/mypage"
          className="flex w-full items-center justify-center rounded-sm border border-[#e60000] bg-white py-3 text-sm font-bold text-[#e60000] transition-colors hover:bg-red-50 active:bg-red-100"
        >
          마이페이지 가기
        </Link>
      ) : (
        <Link 
          href="/login"
          className="flex w-full items-center justify-center rounded-sm bg-[#25282b] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-95"
        >
          로그인하기
        </Link>
      )}
    </div>
  );
}
