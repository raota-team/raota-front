'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Sparkles, Users } from 'lucide-react';
import { getRamenShops } from '@/lib/api/ramen-shops';

const shopsQueryKey = ['ramen-shops', 0, 12, '', '', '', 'NAME'];

export default function HomeHeroActions() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const prefetchShops = () => {
    router.prefetch('/shops');
    queryClient.prefetchQuery({
      queryKey: shopsQueryKey,
      queryFn: () => getRamenShops({ page: 0, size: 12, sort: 'NAME' }),
      staleTime: 30 * 1000,
    });
  };

  const ctaSizeClass = 'w-56 px-6 py-4';

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-5">
      <Link
        href="/recommend"
        className={`inline-flex items-center justify-center gap-2 rounded-full border border-[#ffe0e0] bg-white text-sm font-bold text-[#25282b] shadow-[0_12px_40px_rgba(230,0,0,0.18)] transition-transform transition-colors hover:-translate-y-0.5 hover:bg-[#fff5f5] active:translate-y-0 ${ctaSizeClass}`}
      >
        <span className="inline-flex items-center gap-2">
          <span className="rounded-full bg-[#e60000] px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
            BETA
          </span>
          추천받기
        </span>
        <Sparkles className="h-5 w-5 text-[#e60000]" />
      </Link>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/shops"
          onMouseEnter={prefetchShops}
          onFocus={prefetchShops}
          onTouchStart={prefetchShops}
          className={`vodafone-button-pill ${ctaSizeClass}`}
        >
          맛집 탐색하기
          <ChevronRight className="h-5 w-5" />
        </Link>
        <Link
          href="/community"
          className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/24 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/32 active:opacity-90 ${ctaSizeClass}`}
        >
          커뮤니티
          <Users className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
