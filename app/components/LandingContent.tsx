'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useApp } from '../context/AppContext';
import HomeHeroActions from './HomeHeroActions';
import UserProfileCard from './UserProfileCard';
import AnimatedCounter from './AnimatedCounter';
import ContactUsBanner from './ContactUsBanner';
import TrendingTagsRanking from './TrendingTagsRanking';
import WeekendRecommendation from './WeekendRecommendation';
import { Do_Hyeon } from 'next/font/google';
import { useDiscoveryStats, useRecentVerifiedShops, useHomeTips } from '@/hooks/queries/useDiscovery';
import {
  Sparkles,
  Scale,
  MessageSquare,
  MessageCircleMore,
  Camera,
  ChevronLeft,
  ChevronRight,
  Users,
  UtensilsCrossed,
  Heart,
  MessageCircle,
  TrendingUp,
  Map,
  MapPin,
  Search,
  ArrowRight,
  Zap,
  LayoutGrid,
  Store,
  Clock,
  ChevronUp,
  Star,
  BadgeCheck
} from 'lucide-react';
import { mockCommunityPosts } from '@/app/lib/community-data';

const doHyeon = Do_Hyeon({
  weight: '400',
  subsets: ['latin'],
});

export default function LandingContent() {
  const [heroRef, heroVisible] = useScrollReveal();
  const [contentRef, contentVisible] = useScrollReveal({ threshold: 0.05 });
  const [startPCAnim, setStartPCAnim] = useState(false);
  const { showToast } = useApp();
  
  useEffect(() => {
    const timer = setTimeout(() => setStartPCAnim(true), 300);
    return () => clearTimeout(timer);
  }, []);
  
  // 서버 연동 데이터
  const { data: statsData } = useDiscoveryStats();
  const { data: recentShopsData, isLoading: isLoadingShops } = useRecentVerifiedShops(4);
  const { data: homeTipsData, isLoading: isLoadingTips } = useHomeTips('tip', 3);

  const stats = statsData?.data || { totalShops: 0, totalReviews: 0, totalUsers: 0 };
  const quickTips = homeTipsData?.data || [];
  const recentVerifiedShops = recentShopsData?.data || [];

  return (
    <div className="min-h-screen bg-white pb-6 md:pb-10">
      {/* 1. Portal Hero Section - Focus on AI Recommendation */}
      <section ref={heroRef} className="relative h-[430px] min-h-[430px] w-full overflow-hidden bg-[#25282b] md:h-[500px] md:min-h-0">
        <div className="absolute inset-0">
          <Image
            src="/hero-home.jpg"
            alt="Ramen Background"
            fill
            priority
            className="object-cover opacity-50 saturate-[0.8]"
          />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 pt-20 md:flex-row md:items-center md:justify-between md:px-12 md:pt-0 md:pb-0">
          <div className="max-w-2xl">

            <h1 className={`mb-4 md:mb-6 text-[clamp(2rem,8vw,4.5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-white ${doHyeon.className}`}>
              오늘 당신의 <br />
              <span className="text-[#e60000]">베스트 한 그릇</span>은?
            </h1>
            <p className="mb-10 md:mb-12 max-w-lg text-base md:text-lg font-medium leading-relaxed text-white/80 break-keep">
              취향 분석부터 매장 비교까지, <br className="hidden md:block" />
              라오타가 실패 없는 라멘 선택을 도와드립니다.
            </p>

            {/* Mobile Only: Stats Counter under "도와드립니다." (Hidden to reduce clutter on mobile) */}
            {/* Removed the stats block on mobile to make the view cleaner and less cluttered */}
            
            {/* Mobile: Hero CTA buttons */}
            <div className="grid max-w-[360px] grid-cols-2 gap-2.5 sm:hidden">
              <Link 
                href="/recommend?mode=taste"
                aria-label="취향으로 추천받기"
                className="group flex h-14 items-center justify-between rounded-full bg-[#e60000] px-4 text-white transition-opacity hover:opacity-95 active:opacity-90"
              >
                <span className="text-sm font-bold tracking-[0.01em]">
                  취향 추천
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#e60000]">
                  <Sparkles className="h-4 w-4" />
                </span>
              </Link>
              
              <Link 
                href="/recommend?mode=compare"
                aria-label="매장 1:1 비교"
                className="group flex h-14 items-center justify-between rounded-full border border-white/35 bg-white/10 px-4 text-white transition-colors hover:bg-white/20 active:bg-white/15"
              >
                <span className="text-sm font-bold tracking-[0.01em]">
                  1:1 비교
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                  <Scale className="h-4 w-4" />
                </span>
              </Link>
            </div>

            {/* PC: Original Pill Button Style */}
            <div className="hidden sm:flex flex-row gap-3 md:gap-4">
              <Link 
                href="/recommend?mode=taste"
                className="vodafone-button-pill bg-[#e60000] px-6 py-3.5 text-center transition-opacity hover:opacity-95 active:opacity-90 md:px-8 md:py-4"
              >
                <span className="flex items-center justify-center gap-2 text-white font-bold text-sm md:text-base">
                  취향으로 추천받기 <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                </span>
              </Link>
              <Link 
                href="/recommend?mode=compare"
                className="vodafone-button-pill border border-white/30 bg-white/10 px-6 py-3.5 text-center transition-colors hover:bg-white/20 md:px-8 md:py-4"
              >
                <span className="flex items-center justify-center gap-2 text-white font-bold text-sm md:text-base">
                  매장 1:1 비교 <Scale className="h-4 w-4 md:h-5 md:w-5" />
                </span>
              </Link>
            </div>
          </div>

          {/* PC 전용 서비스 통계 패널 (오른쪽 배치 - 맨처음 디자인처럼 깔끔한 가로바 형태) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10 text-[11px] md:text-xs text-white/50 border-t border-b border-white/10 py-4 px-1 max-w-none">
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
              참고한 후기
            </div>
            <div className="h-8 w-px bg-white/10 flex-shrink-0"></div>
            <div className="flex-shrink-0 whitespace-nowrap">
              <AnimatedCounter 
                value={stats.totalUsers || 0} 
                suffix="건+" 
                className="text-white text-xl md:text-2xl block font-black tracking-tight mb-1 whitespace-nowrap" 
                shouldStart={startPCAnim && stats.totalUsers > 0} 
              />
              AI 분석 리뷰
            </div>
          </div>
        </div>
      </section>

      {/* 2. Portal Main Content Area */}
      <div 
        ref={contentRef}
        className={`relative z-20 mx-auto mt-8 grid max-w-7xl gap-4 px-4 md:mt-12 md:gap-8 md:px-12 lg:grid-cols-[1fr_320px] reveal-hidden ${contentVisible ? 'reveal-visible' : ''}`}
      >
        {/* Left Column: Community & Feeds */}
        <main className="flex flex-col gap-4 md:gap-8 lg:h-full">
          
          {/* Weekend Recommendation */}
          <WeekendRecommendation />

          {/* Mobile: Move Profile Card under recommendation for dashboard feel */}
          <div className="lg:hidden">
            <UserProfileCard />
          </div>

          {/* Recently Verified Shops */}

          <section className="rounded-md bg-white p-4 md:p-8">
            <div className="mb-4 md:mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-6 md:h-8 w-1 md:w-1.5 rounded-full bg-[#e60000]"></div>
                <h2 className="text-xl md:text-2xl font-black text-[#25282b]">최근 사진 인증된 라멘집</h2>
              </div>
              <Link href="/shops" className="text-xs md:text-sm font-bold text-[#7e7e7e] hover:text-[#e60000]">
                더보기 +
              </Link>
            </div>

            <div className="grid gap-4 md:gap-6 md:grid-cols-2">
              {recentVerifiedShops.map((shop) => (
                <Link 
                  key={shop.id}
                  href={`/shop/${shop.id}`}
                  className="group flex items-start gap-4 border-b border-[#f2f2f2] pb-4 md:pb-6 last:border-0 last:pb-0"
                >
                  <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-[0px_8px_0px_0px] bg-stone-100 ring-1 ring-stone-100">
                    {shop.imageUrl ? (
                      <Image src={shop.imageUrl} alt={shop.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone-300 group-hover:text-[#e60000] transition-colors">
                        <Store className="h-6 w-6 md:h-8 md:w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col min-w-0 justify-center h-full py-1">
                    <h3 className="mb-1.5 md:mb-2 truncate text-sm md:text-base font-bold text-[#25282b] group-hover:text-[#e60000]">
                      {shop.name}
                    </h3>
                    <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-[#7e7e7e]">
                      <span className="font-bold text-[#25282b]">{shop.location}</span>
                      <div className="flex items-center gap-1 text-[#7e7e7e]">
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
              { label: '전체 맛집', icon: Store, href: '/shops', color: 'bg-stone-50 text-[#25282b]' },
              { label: '커뮤니티', icon: Users, href: '/community', color: 'bg-stone-50 text-[#25282b]' },
              { 
                label: '웨이팅 스팟', 
                icon: MapPin, 
                href: '/waiting-map', 
                color: 'bg-stone-50 text-[#25282b]',
                onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  showToast('웨이팅 스팟 서비스는 준비 중입니다.', 'info');
                }
              },
              { label: '내 정보', icon: LayoutGrid, href: '/mypage', color: 'bg-stone-50 text-[#25282b]' },
            ].map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                className="group flex flex-col items-center justify-center rounded-md bg-white py-3 px-2 ring-1 ring-[#f2f2f2] transition-colors hover:ring-[#e60000]/20 md:py-4 md:px-4"
              >
                <div className={`mb-2 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full ${item.color} group-hover:bg-[#e60000] group-hover:text-white transition-colors`}>
                  <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <span className="text-[11px] md:text-sm font-bold text-[#25282b] group-hover:text-[#e60000]">{item.label}</span>
              </Link>
            ))}
          </section>

          {/* Bottom Banner Group: AI Summary & Contact Banner */}
          <div className="lg:mt-auto flex flex-col gap-4 md:gap-8 w-full">
            {/* AI Feature Summary Banner */}
            <section className="relative overflow-hidden rounded-md bg-[#e60000] p-5 text-white md:p-8">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="mb-2 text-xl md:text-2xl font-black leading-tight">
                    길게 읽지 마세요, <br />
                    AI가 3줄 요약해 드립니다.
                  </h2>
                  <p className="text-sm md:text-base text-white/85">수많은 리뷰 속 핵심 장단점만 쏙쏙!</p>
                </div>
                <Link 
                  href="/recommend?mode=summary"
                  className="vodafone-button-pill bg-white px-8 py-3 text-center text-sm font-bold text-[#e60000] transition-opacity hover:opacity-90 active:opacity-95"
                >
                  지금 요약 보기
                </Link>
              </div>

              <div className="absolute -right-8 -top-8 opacity-10">
                <MessageSquare className="h-32 md:h-48 w-32 md:w-48" />
              </div>
            </section>

            {/* PC Only: Contact Us Banner aligned to the bottom */}
            <div className="hidden lg:block">
              <ContactUsBanner />
            </div>
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
          <div className="rounded-md bg-white p-4 md:p-6">
            <div className="mb-3 flex items-center gap-2 border-b border-[#f2f2f2]/60 pb-3 md:mb-4 md:pb-4">
              <Sparkles className="h-4 w-4 text-[#e60000]" />
              <h2 className="font-black text-base md:text-lg text-[#25282b]">라멘 꿀팁</h2>
            </div>
            <div className="space-y-0 min-h-[180px]">
              {quickTips.length > 0 ? (
                quickTips.map((tip, i) => (
                  <Link 
                    key={tip.id} 
                    href={`/community/${tip.id}`}
                    className={`group block py-2 md:py-3 ${i !== quickTips.length - 1 ? 'border-b border-[#f2f2f2]/50' : ''}`}
                  >
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#7e7e7e] group-hover:text-[#e60000]">
                      {tip.title}
                    </p>
                    <span className="mt-1 block text-[10px] text-[#bebebe]">{tip.createdAt ? new Date(tip.createdAt).toLocaleDateString() : ''}</span>
                  </Link>
                ))
              ) : (
                <div className="flex h-full min-h-[100px] flex-col items-center justify-center text-center">
                  <p className="text-xs text-[#bebebe]">아직 등록된 꿀팁이 없어요.</p>
                  <p className="text-[10px] text-[#bebebe] mt-1">첫 번째 꿀팁을 남겨보세요!</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Only: Contact Us Banner at the very bottom */}
        <div className="lg:hidden mt-4">
          <ContactUsBanner />
        </div>
      </div>
    </div>
  );
}
