'use client';

import Link from 'next/link';
import { Users, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useMemberSummary } from '@/hooks/queries/useUser';

export default function UserProfileCard() {
  const { data: summaryData, isLoading } = useMemberSummary();
  const user = summaryData?.data;

  if (isLoading) {
    return (
      <div className="rounded-md bg-white p-3 md:p-4 shadow-sm ring-1 ring-[#f2f2f2] flex items-center justify-between">
         <div className="flex items-center gap-3 animate-pulse">
           <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-stone-200" />
           <div className="space-y-2">
             <div className="h-3 w-16 bg-stone-200 rounded" />
             <div className="h-4 w-24 bg-stone-200 rounded" />
           </div>
         </div>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-white p-3 md:p-4 shadow-sm ring-1 ring-[#f2f2f2] flex flex-row items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {user?.profileImageUrl ? (
          <div className="relative h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-full ring-1 ring-black/5 flex-shrink-0">
            <Image src={user.profileImageUrl} alt="프로필" fill className="object-cover" sizes="48px" />
          </div>
        ) : (
          <div className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[#e60000]">
            <Users className="h-5 w-5 md:h-6 md:w-6" />
          </div>
        )}
        <div className="min-w-0 pr-2">
          <p className="text-[10px] md:text-xs text-[#7e7e7e]">어서오세요!</p>
          <p className="text-sm md:text-base font-bold text-[#25282b] truncate">
            {user ? `👋 ${user.nickname}님` : '라멘을 사랑하는 분'}
          </p>
        </div>
      </div>
      
      {user ? (
        <Link 
          href="/mypage"
          className="flex-shrink-0 flex items-center gap-0.5 text-xs md:text-sm font-medium text-[#7e7e7e] hover:text-[#e60000] transition-colors"
        >
          최근 활동
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <Link 
          href="/login"
          className="flex-shrink-0 rounded-sm bg-[#25282b] px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 active:opacity-95"
        >
          로그인하기
        </Link>
      )}
    </div>
  );
}
