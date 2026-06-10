import Link from 'next/link';
import { Users } from 'lucide-react';

export default function UserProfileCard() {
  return (
    <div className="rounded-md bg-white p-4 md:p-6 shadow-sm ring-1 ring-[#f2f2f2]">
      <div className="mb-4 md:mb-6 flex items-center gap-4">
        <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[#e60000]">
          <Users className="h-6 w-6 md:h-7 md:w-7" />
        </div>
        <div>
          <p className="text-[10px] md:text-xs text-[#7e7e7e]">어서오세요!</p>
          <p className="text-sm md:text-base font-bold text-[#25282b]">라멘을 사랑하는 분</p>
        </div>
      </div>
      <Link 
        href="/login"
        className="flex w-full items-center justify-center rounded-sm bg-[#25282b] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-95"
      >
        로그인하기
      </Link>
      <div className="mt-4 flex justify-between px-2 text-[10px] md:text-[11px] font-bold text-[#7e7e7e]">
        <Link href="/register" className="hover:text-[#e60000]">회원가입</Link>
        <Link href="/find" className="hover:text-[#e60000]">계정찾기</Link>
      </div>
    </div>
  );
}
