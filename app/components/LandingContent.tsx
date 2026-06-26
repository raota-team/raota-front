'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import UserProfileCard from './UserProfileCard';
import AnimatedCounter from './AnimatedCounter';
import ContactUsBanner from './ContactUsBanner';
import TrendingTagsRanking from './TrendingTagsRanking';
import WeekendRecommendation from './WeekendRecommendation';
import { Do_Hyeon } from 'next/font/google';
import { useDiscoveryStats, useRecentVerifiedShops, useHomeTips } from '@/hooks/queries/useDiscovery';
import type {
  DiscoveryStatsResponse,
  RecentVerifiedShopResponse,
  WeekendRecommendationResponse,
} from '@/lib/api/discovery';
import ResilientImage from './ResilientImage';
import {
  Sparkles,
  Camera,
  Users,
  Search,
  ArrowRight,
  LayoutGrid,
  Store,
  BadgeCheck
} from 'lucide-react';

const doHyeon = Do_Hyeon({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export type HomeInitialData = {
  stats?: { success: boolean; data: DiscoveryStatsResponse };
  recentShops?: { success: boolean; data: RecentVerifiedShopResponse[] };
  weekendRecommendations?: { success: boolean; data: WeekendRecommendationResponse[] };
};

export default function LandingContent({
  initialData,
}: {
  initialData?: HomeInitialData;
}) {
  const [heroRef, heroVisible] = useScrollReveal();
  const [contentRef, contentVisible] = useScrollReveal({ threshold: 0.05 });
  const [startPCAnim, setStartPCAnim] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const heroSearchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => setStartPCAnim(true), 300);
    return () => clearTimeout(timer);
  }, []);
  
  // 서버 연동 데이터
  const { data: statsData } = useDiscoveryStats(initialData?.stats);
  const { data: recentShopsData } = useRecentVerifiedShops(
    4,
    initialData?.recentShops,
  );
  const { data: homeTipsData } = useHomeTips('tip', 3);

  const stats = statsData?.data || { totalShops: 0, totalReviews: 0, totalUsers: 0 };
  const quickTips = homeTipsData?.data || [];
  const recentVerifiedShops = recentShopsData?.data || [];
  const heroSearchHref = heroSearchQuery.trim()
    ? `/shops?keyword=${encodeURIComponent(heroSearchQuery.trim())}`
    : "/shops";
  const quickExploreItems = [
    "혼밥 좋은 곳",
    "진한 국물",
    "웨이팅 적은 곳",
    "데이트 라멘",
  ];
  const selectHeroSearchSuggestion = (suggestion: string) => {
    setHeroSearchQuery(suggestion);
    heroSearchInputRef.current?.focus();
  };
  const submitHeroSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.href = heroSearchHref;
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-6 md:pb-10">
      {/* SEO용 숨겨진 제목 */}
      <h1 className="sr-only">라오타 - 라멘의 모든 것을 기록하고 나누는 커뮤니티</h1>
      
      {/* 1. Portal Hero Section */}
      <section ref={heroRef} className="relative min-h-[430px] w-full overflow-hidden bg-[#25282b] md:min-h-[500px]">
        <div className="absolute inset-0">
          <Image
            src="/hero-home.webp"
            alt="Ramen Background"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover opacity-45 saturate-[0.85]"
          />
          <div className="absolute inset-0 bg-[#25282b]/55" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[430px] max-w-7xl flex-col justify-end px-4 pb-5 pt-16 md:min-h-[500px] md:flex-row md:items-center md:justify-between md:gap-10 md:px-12 md:pb-10 md:pt-24">
          <div className="w-full max-w-2xl">
            <h1 className={`mb-3 text-[clamp(2rem,8vw,4.5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-white md:mb-6 ${doHyeon.className}`}>
              라멘을 사랑하는 <br />
              <span>사람들, 라오타.</span>
            </h1>
            <p className="mb-5 max-w-lg break-keep text-sm font-medium leading-relaxed text-white/80 md:mb-12 md:text-lg">
              가게를 찾고, 한 그릇을 기록하고, <br className="hidden md:block" />
              라멘을 좋아하는 사람들과 이야기를 나눠보세요
            </p>

            <div className="mb-4 max-w-2xl rounded-sm border border-stone-200 bg-white p-1.5 md:mb-6 md:p-2">
              <form
                action={heroSearchHref}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 md:gap-2"
                onSubmit={submitHeroSearch}
              >
                <div className="flex min-h-11 flex-1 items-center gap-2 px-2 md:min-h-12">
                  <Search className="h-3.5 w-3.5 shrink-0 text-stone-400 md:h-4 md:w-4" />
                  <input
                    ref={heroSearchInputRef}
                    value={heroSearchQuery}
                    onChange={(event) => setHeroSearchQuery(event.target.value)}
                    placeholder="동네, 메뉴, 취향 검색"
                    className="min-w-0 flex-1 bg-transparent text-xs font-bold text-[#25282b] outline-none placeholder:text-stone-400 md:text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-sm bg-[#e60000] px-3 text-xs font-black text-white transition-opacity hover:opacity-90 md:h-12 md:gap-2 md:px-5 md:text-sm"
                >
                  <span className="md:hidden">찾기</span>
                  <span className="hidden md:inline">찾아보기</span>
                  <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </button>
              </form>
            </div>

            <div className="mb-5 flex max-w-2xl gap-2 overflow-x-auto pb-1 md:mb-0 md:flex-wrap md:overflow-visible md:pb-0">
              {quickExploreItems.map((item) => {
                const isSelected = heroSearchQuery.trim() === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => selectHeroSearchSuggestion(item)}
                    className={`shrink-0 rounded-sm border px-3 py-1.5 text-xs font-bold backdrop-blur-sm transition-colors ${
                      isSelected
                        ? "border-white bg-white text-[#25282b]"
                        : "border-white/20 bg-white/10 text-white/85 hover:bg-white hover:text-[#25282b]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

          </div>

          {/* PC 전용 서비스 통계 패널 (오른쪽 배치 - 맨처음 디자인처럼 깔끔한 가로바 형태) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10 text-[11px] md:text-xs text-white/60 border-t border-b border-white/10 py-4 px-1 max-w-none">
            <div className="flex-shrink-0 whitespace-nowrap">
              <AnimatedCounter 
                value={stats.totalShops || 0} 
                suffix="개+" 
                className="text-white text-xl md:text-2xl block font-black tracking-tight mb-1 whitespace-nowrap" 
                shouldStart={startPCAnim && stats.totalShops > 0} 
              />
              등록된 라멘집
            </div>
            <div className="h-8 w-px bg-white/10 flex-shrink-0"></div>
            <div className="flex-shrink-0 whitespace-nowrap">
              <AnimatedCounter 
                value={stats.totalReviews || 0} 
                suffix="건+" 
                className="text-[#e60000] text-xl md:text-2xl block font-black tracking-tight mb-1 whitespace-nowrap" 
                shouldStart={startPCAnim && stats.totalReviews > 0} 
              />
              참고한 리뷰
            </div>
          </div>
        </div>
      </section>

      {/* 2. Portal Main Content Area */}
      <div 
        ref={contentRef}
        className={`relative z-20 mx-auto mt-5 grid max-w-7xl gap-4 px-4 md:mt-8 md:gap-8 md:px-12 lg:grid-cols-[minmax(0,1fr)_320px] reveal-hidden ${contentVisible ? 'reveal-visible' : ''}`}
      >
        {/* Left Column: Community & Feeds */}
        <main className="flex flex-col gap-4 md:gap-8 lg:h-full">
          
          {/* Weekend Recommendation */}
          <WeekendRecommendation initialData={initialData?.weekendRecommendations} />

          {/* Mobile: Move Profile Card under recommendation for dashboard feel */}
          <div className="lg:hidden">
            <UserProfileCard />
          </div>

          {/* Recently Verified Shops */}

          <section className="rounded-md bg-white p-4 ring-1 ring-stone-200 md:p-6">
            <div className="mb-4 md:mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-6 md:h-8 w-1 md:w-1.5 rounded-full bg-[#e60000]"></div>
                <h2 className="text-xl md:text-2xl font-black text-[#25282b]">최근 방문 인증된 라멘집</h2>
              </div>
              <Link href="/shops" className="text-xs md:text-sm font-bold text-[#666666] hover:text-[#e60000]">
                더보기 +
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              {recentVerifiedShops.map((shop) => (
                <Link 
                  key={shop.id}
                  href={`/shop/${shop.id}`}
                  className="group overflow-hidden rounded-sm border border-stone-200 bg-white transition-colors hover:border-[#e60000]"
                >
                  <div className="relative h-32 overflow-hidden bg-stone-100 md:h-40">
                    {shop.imageUrl ? (
                      <ResilientImage
                        src={shop.imageUrl}
                        alt={shop.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 360px, 100vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone-300 group-hover:text-[#e60000] transition-colors">
                        <Store className="h-6 w-6 md:h-8 md:w-8" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 p-3 md:p-4">
                    <div className="mb-2 inline-flex items-center gap-1 rounded-sm bg-red-50 px-2 py-1 text-[10px] font-black text-[#e60000]">
                      <BadgeCheck className="h-3 w-3" />
                      방문 인증
                    </div>
                    <h3 className="mb-1 truncate text-base font-black text-[#25282b] group-hover:text-[#e60000] md:text-lg">
                      {shop.name}
                    </h3>
                    <div className="flex min-w-0 items-center justify-between gap-2 text-[11px] text-[#666666] md:text-xs">
                      <span className="truncate font-bold text-[#25282b]">{shop.location}</span>
                      <div className="flex shrink-0 items-center gap-1 text-[#666666]">
                        <Camera className="h-3 w-3" />
                        <span className="font-medium">인증샷 <b className="text-[#25282b]">{shop.photoCount || 0}</b>개</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Menu Grid */}
          <section className="grid grid-cols-2 gap-3 md:gap-4 sm:grid-cols-4">
            {[
              { label: '전체 맛집', icon: Store, href: '/shops', color: 'bg-white text-[#25282b]' },
              { label: '라멘로그', icon: Camera, href: '/ramen-log', color: 'bg-white text-[#25282b]' },
              { label: '커뮤니티', icon: Users, href: '/community', color: 'bg-white text-[#25282b]' },
              { label: '내 정보', icon: LayoutGrid, href: '/mypage', color: 'bg-white text-[#25282b]' },
            ].map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className="group flex items-center justify-between rounded-md bg-white px-3 py-3 ring-1 ring-stone-200 transition-colors hover:ring-[#e60000]/30 md:px-4 md:py-4"
              >
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full ${item.color} ring-1 ring-stone-100 group-hover:bg-[#e60000] group-hover:text-white transition-colors`}>
                    <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <span className="text-[11px] md:text-sm font-bold text-[#25282b] group-hover:text-[#e60000]">{item.label}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#e60000]" />
              </Link>
            ))}
          </section>

          {/* PC Only: Ramen Log Event Banner aligned to the bottom */}
          <div className="hidden lg:mt-auto lg:block">
            <ContactUsBanner />
          </div>
        </main>

        {/* Right Column: Sidebar (Desktop) / Bottom Content (Mobile) */}
        <aside className="flex flex-col gap-4 md:gap-8 lg:h-full">
          {/* Desktop Only: Profile Card */}
          <div className="hidden lg:block">
            <UserProfileCard />
          </div>

          {/* Trending Tags Ranking */}
          <TrendingTagsRanking />

          {/* Quick Tips Portal */}
          <div className="rounded-md bg-white p-4 ring-1 ring-stone-200 md:p-6">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#f2f2f2]/60 pb-3 md:mb-4 md:pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#e60000]" />
                <h2 className="font-black text-base md:text-lg text-[#25282b]">라멘 꿀팁</h2>
              </div>
              <Link href="/community?category=TIP" className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 transition-colors hover:text-[#e60000]">
                더보기 +
              </Link>
            </div>
            <div className="space-y-0 min-h-[180px]">
              {quickTips.length > 0 ? (
                quickTips.map((tip, i) => (
                  <Link 
                    key={tip.id} 
                    href={`/community/${tip.id}`}
                    className={`group block py-2 md:py-3 ${i !== quickTips.length - 1 ? 'border-b border-[#f2f2f2]/50' : ''}`}
                  >
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#666666] group-hover:text-[#e60000]">
                      {tip.title}
                    </p>
                    <span className="mt-1 block text-[10px] text-[#737373]">{tip.createdAt ? new Date(tip.createdAt).toLocaleDateString() : ''}</span>
                  </Link>
                ))
              ) : (
                <div className="flex h-full min-h-[100px] flex-col items-center justify-center text-center">
                  <p className="text-xs text-[#737373]">아직 등록된 꿀팁이 없어요.</p>
                  <p className="text-[10px] text-[#737373] mt-1">첫 번째 꿀팁을 남겨보세요!</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Only: Ramen Log Event Banner at the very bottom */}
        <div className="lg:hidden mt-4">
          <ContactUsBanner />
        </div>
      </div>
    </div>
  );
}
