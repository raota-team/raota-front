'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Users } from 'lucide-react';
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

  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
      <Link
        href="/shops"
        onMouseEnter={prefetchShops}
        onFocus={prefetchShops}
        onTouchStart={prefetchShops}
        className="vodafone-button-pill min-w-48 bg-[#e60000]"
      >
        맛집 탐색하기
        <ChevronRight className="h-5 w-5" />
      </Link>
      <Link
        href="/community"
        className="inline-flex min-w-48 items-center justify-center gap-2 rounded-full border border-white/70 bg-white/24 px-6 py-4 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/32 active:opacity-90"
      >
        커뮤니티
        <Users className="h-5 w-5" />
      </Link>
    </div>
  );
}
