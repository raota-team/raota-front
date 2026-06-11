'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, UtensilsCrossed, Store } from 'lucide-react';
import { useWeekendRecommendations } from '@/hooks/queries/useDiscovery';

export default function WeekendRecommendation() {
  const { data, isLoading, isError } = useWeekendRecommendations();
  const recommendation = data?.data?.[0];
  const ramenTypeTag = recommendation?.name.replace(/\s+/g, "");
  const shopsHref = recommendation
    ? `/shops?tag=${encodeURIComponent(ramenTypeTag || recommendation.name)}&ramenTypeId=${encodeURIComponent(String(recommendation.id))}&ramenTypeName=${encodeURIComponent(recommendation.name)}`
    : "/shops";

  if (isLoading) {
    return (
      <div className="rounded-md bg-white p-4 md:p-6 animate-pulse">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-5 w-5 md:h-6 md:w-6 bg-stone-200 rounded-full" />
            <div className="h-6 md:h-8 w-48 bg-stone-200 rounded" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-0">
          <div className="h-48 md:h-56 md:w-2/5 bg-stone-200 rounded-[0px_6px_0px_0px] mb-4 md:mb-0 shrink-0"></div>
          <div className="md:p-6 md:w-3/5 w-full">
            <div className="h-6 w-3/4 bg-stone-200 mb-2"></div>
            <div className="h-4 w-1/2 bg-stone-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <section className="rounded-md bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-[#e60000]" />
            <h2 className="text-xl md:text-2xl font-black text-[#25282b]">이번 주말의 라멘 추천</h2>
          </div>
        </div>

        <div className="rounded-[0px_6px_0px_0px] border border-dashed border-[#f2f2f2] bg-white p-5 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-base font-bold text-[#25282b]">
                {isError ? "추천을 불러오지 못했습니다." : "이번 주말 추천을 준비 중입니다."}
              </p>
              <p className="text-sm leading-relaxed text-[#7e7e7e]">
                지금은 등록된 주말 추천이 없어요. 가게 목록에서 원하는 라멘을 먼저 둘러보세요.
              </p>
            </div>
            <Link
              href="/shops"
              className="vodafone-button-pill bg-[#e60000] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-95"
            >
              가게 둘러보기
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-md bg-white p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-[#e60000]" />
          <h2 className="text-xl md:text-2xl font-black text-[#25282b]">이번 주말의 라멘 추천</h2>
        </div>
      </div>

      <Link
        href={shopsHref}
        className="group flex flex-col overflow-hidden rounded-[0px_6px_0px_0px] bg-white transition-colors md:flex-row"
      >
        <div className="relative h-[190px] shrink-0 overflow-hidden rounded-[0px_6px_0px_0px] bg-stone-100 md:h-[280px] md:w-[42%]">
          {recommendation.imageUrl ? (
            <Image
              src={recommendation.imageUrl}
              alt={recommendation.title || recommendation.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-300">
              <Store className="h-12 w-12" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center p-4 md:w-[58%] md:p-6 lg:p-7">
          <div className="mb-2 flex items-start gap-2 text-xs text-[#7e7e7e] md:text-sm">
            <UtensilsCrossed className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="font-medium">{recommendation.location}</span>
          </div>
          <h3 className="mb-3 text-lg font-bold leading-snug text-[#25282b] transition-colors group-hover:text-[#e60000] md:text-xl">
            {recommendation.title || recommendation.name}
          </h3>
          <p className="text-sm leading-relaxed text-[#7e7e7e] md:text-[15px]">
            {recommendation.reason}
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold text-[#e60000] group-hover:underline">
            관련 가게 찾아보기 →
          </div>
        </div>
      </Link>
    </section>
  );
}
