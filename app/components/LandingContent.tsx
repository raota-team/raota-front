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
import { Do_Hyeon } from 'next/font/google';
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
  
  // 최근 커뮤니티 글 (꿀팁용)
  const quickTips = mockCommunityPosts.filter(p => p.category === 'tip').slice(0, 3);

  // 최근 인증된 라멘집 모크 데이터
  const recentVerifiedShops = [
    { id: '1', name: '멘야로지', location: '서울 마포구', rating: 4.8, reviews: 156, tags: ['토리파이탄', '웨이팅'], imageUrl: '' },
    { id: '2', name: '566라멘', location: '서울 마포구', rating: 4.6, reviews: 89, tags: ['지로계', '가성비'], imageUrl: '' },
    { id: '3', name: '가솔린앤로지스', location: '부산 진구', rating: 4.7, reviews: 234, tags: ['츠케멘', '진한맛'], imageUrl: '' },
    { id: '4', name: '멘야무사시', location: '서울 강남구', rating: 4.5, reviews: 312, tags: ['쇼유라멘', '데이트'], imageUrl: '' },
  ];

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-6 md:pb-10">
      {/* 1. Portal Hero Section - Focus on AI Recommendation */}
      <section ref={heroRef} className="relative min-h-[480px] h-[70vh] md:h-[500px] w-full overflow-hidden bg-[#25282b]">
        <div className="absolute inset-0">
          <Image
            src="/hero-home.jpg"
            alt="Ramen Background"
            fill
            priority
            className="object-cover opacity-50 saturate-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#25282b] via-[#25282b]/80 to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center pt-24 pb-28 md:flex-row md:items-center md:justify-between md:pt-0 md:pb-0 px-4 md:px-12">
          <div className="max-w-2xl">

            <h1 className={`mb-4 md:mb-6 text-[clamp(2rem,8vw,4.5rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-white ${doHyeon.className}`}>
              오늘 당신의 <br />
              <span className="text-[#e60000]">베스트 한 그릇</span>은?
            </h1>
            <p className="mb-6 md:mb-10 max-w-lg text-base md:text-lg font-medium leading-relaxed text-white/80 break-keep">
              취향 분석부터 매장 비교까지, <br className="hidden md:block" />
              라오타 AI가 실패 없는 라멘 선택을 도와드립니다.
            </p>

            {/* Mobile Only: Stats Counter under "도와드립니다." */}
            <div className="md:hidden mb-8 flex items-center gap-4 text-[10px] text-white/50 border-t border-b border-white/10 py-3 max-w-xs">
              <div className="flex-shrink-0 whitespace-nowrap">
                <AnimatedCounter 
                  value={120} 
                  suffix="개+" 
                  className="text-white text-sm block font-extrabold tracking-tight mb-0.5 whitespace-nowrap" 
                  shouldStart={heroVisible} 
                />
                등록된 라멘집
              </div>
              <div className="h-5 w-px bg-white/10 flex-shrink-0"></div>
              <div className="flex-shrink-0 whitespace-nowrap">
                <AnimatedCounter 
                  value={14250} 
                  suffix="회+" 
                  className="text-[#e60000] text-sm block font-extrabold tracking-tight mb-0.5 whitespace-nowrap" 
                  shouldStart={heroVisible} 
                />
                AI 맞춤 추천
              </div>
              <div className="h-5 w-px bg-white/10 flex-shrink-0"></div>
              <div className="flex-shrink-0 whitespace-nowrap">
                <AnimatedCounter 
                  value={3120} 
                  suffix="건" 
                  className="text-white text-sm block font-extrabold tracking-tight mb-0.5 whitespace-nowrap" 
                  shouldStart={heroVisible} 
                />
                솔직한 후기
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link 
                href="/recommend?mode=taste"
                className="vodafone-button-pill bg-[#e60000] px-6 md:px-8 py-3.5 md:py-4 transition-transform hover:scale-[1.02] active:scale-95 text-center"
              >
                <span className="flex items-center justify-center gap-2 text-white font-bold text-sm md:text-base">
                  취향으로 추천받기 <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                </span>
              </Link>
              <Link 
                href="/recommend?mode=compare"
                className="vodafone-button-pill border border-white/30 bg-white/10 px-6 md:px-8 py-3.5 md:py-4 backdrop-blur-md transition-all hover:bg-white/20 text-center"
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
                value={120} 
                suffix="개+" 
                className="text-white text-xl md:text-2xl block font-black tracking-tight mb-1 whitespace-nowrap" 
                shouldStart={startPCAnim} 
              />
              등록된 라멘집
            </div>
            <div className="h-8 w-px bg-white/10 flex-shrink-0"></div>
            <div className="flex-shrink-0 whitespace-nowrap">
              <AnimatedCounter 
                value={14250} 
                suffix="회+" 
                className="text-[#e60000] text-xl md:text-2xl block font-black tracking-tight mb-1 whitespace-nowrap" 
                shouldStart={startPCAnim} 
              />
              AI 맞춤 추천
            </div>
            <div className="h-8 w-px bg-white/10 flex-shrink-0"></div>
            <div className="flex-shrink-0 whitespace-nowrap">
              <AnimatedCounter 
                value={3120} 
                suffix="건" 
                className="text-white text-xl md:text-2xl block font-black tracking-tight mb-1 whitespace-nowrap" 
                shouldStart={startPCAnim} 
              />
              솔직한 후기
            </div>
          </div>
        </div>
      </section>

      {/* 2. Portal Main Content Area */}
      <div 
        ref={contentRef}
        className={`mx-auto -mt-20 md:-mt-12 grid max-w-7xl gap-4 md:gap-8 px-4 lg:grid-cols-[1fr_320px] md:px-12 reveal-hidden ${contentVisible ? 'reveal-visible' : ''}`}
      >
        {/* Mobile: Move Profile Card to top for dashboard feel */}
        <div className="lg:hidden">
          <UserProfileCard />
        </div>

        {/* Left Column: Community & Feeds */}
        <main className="flex flex-col gap-4 md:gap-8 lg:h-full">
          
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
                className="group flex flex-col items-center justify-center rounded-md bg-white p-4 md:p-6 shadow-sm ring-1 ring-[#f2f2f2] transition-all hover:-translate-y-1 hover:ring-[#e60000]/20"
              >
                <div className={`mb-3 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full ${item.color} group-hover:bg-[#e60000] group-hover:text-white transition-colors`}>
                  <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <span className="text-xs md:text-sm font-bold text-[#25282b] group-hover:text-[#e60000]">{item.label}</span>
              </Link>
            ))}
          </section>

          {/* Recently Verified Shops */}
          <section className="rounded-md bg-white p-4 md:p-8 shadow-sm ring-1 ring-[#f2f2f2]">
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
                  href={`/shops/${shop.id}`}
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
                        <span className="font-medium">인증샷 <b className="text-[#25282b]">{shop.reviews}</b>개</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Bottom Banner Group: AI Summary & Contact Banner */}
          <div className="lg:mt-auto flex flex-col gap-4 md:gap-8 w-full">
            {/* AI Feature Summary Banner */}
            <section className="relative overflow-hidden rounded-md bg-[#e60000] p-5 md:p-8 text-white shadow-lg">
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
                  className="vodafone-button-pill bg-white px-8 py-3 text-sm font-bold text-[#e60000] transition-transform hover:scale-105 active:scale-95 text-center"
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
          <div className="rounded-md bg-white p-4 md:p-6 shadow-sm ring-1 ring-[#f2f2f2] lg:mt-auto">
            <div className="mb-3 flex items-center gap-2 border-b border-[#f2f2f2]/60 pb-3 md:mb-4 md:pb-4">
              <Sparkles className="h-4 w-4 text-[#e60000]" />
              <h2 className="font-black text-base md:text-lg text-[#25282b]">라멘 꿀팁</h2>
            </div>
            <div className="space-y-0">
              {quickTips.map((tip, i) => (
                <Link 
                  key={tip.id} 
                  href={`/community/${tip.id}`}
                  className={`group block py-2 md:py-3 ${i !== quickTips.length - 1 ? 'border-b border-[#f2f2f2]/50' : ''}`}
                >
                  <p className="line-clamp-2 text-xs leading-relaxed text-[#7e7e7e] group-hover:text-[#e60000]">
                    {tip.title}
                  </p>
                  <span className="mt-1 block text-[10px] text-[#bebebe]">{tip.date}</span>
                </Link>
              ))}
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
