'use client';

import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import HomeHeroActions from './HomeHeroActions';
import { Do_Hyeon } from 'next/font/google';
import { Sparkles, Scale, MessageSquare } from 'lucide-react';

const doHyeon = Do_Hyeon({
  weight: '400',
  subsets: ['latin'],
});

export default function LandingContent() {
  const [featuresHeaderRef, featuresHeaderVisible] = useScrollReveal();
  const [featuresGridRef, featuresGridVisible] = useScrollReveal({ threshold: 0.08 });
  const [reviewsHeaderRef, reviewsHeaderVisible] = useScrollReveal();
  const [reviewsGridRef, reviewsGridVisible] = useScrollReveal({ threshold: 0.08 });
  const [ctaRef, ctaVisible] = useScrollReveal({ threshold: 0.2 });

  const featureCards = [
    {
      href: '/recommend?mode=taste',
      icon: Sparkles,
      badge: 'AI Match',
      title: '스마트 취향 추천',
      desc: '당신의 입맛, 그날의 기분, 원하는 국물 농도까지 분석하여 가장 완벽한 라멘 매장을 찾아냅니다.',
    },
    {
      href: '/recommend?mode=compare',
      icon: Scale,
      badge: 'Analysis',
      title: '두 매장 심층 비교',
      desc: '어디로 갈지 고민될 때, AI가 두 매장의 특징과 리뷰를 다각도로 비교해 결정에 도움을 줍니다.',
    },
    {
      href: '/recommend?mode=summary',
      icon: MessageSquare,
      badge: 'Summary',
      title: 'AI 리뷰 요약',
      desc: '수많은 리뷰를 일일이 읽을 필요 없이, AI가 매장의 핵심 특징과 평가를 한눈에 요약해 드립니다.',
    },
  ];

  const reviews = [
    { author: '면치기달인', shop: '멘야로지', text: '시그니처인 흑마늘 라멘의 풍미가 미쳤습니다. 국물 농도도 적당하고 차슈 추가는 선택이 아닌 필수입니다.', rating: 5 },
    { author: '라멘투어', shop: '566라멘', text: '지로계 스타일을 좋아한다면 이보다 더 좋은 선택지는 없습니다. 양이 정말 많으니 처음 가시는 분은 기본 사이즈를 추천합니다.', rating: 4 },
    { author: '국물매니아', shop: '가솔린앤로지스', text: '농후한 돈코츠 육수가 일품. 가게가 조금 협소하지만 그 특유의 일본 로컬 분위기 자체가 조미료가 됩니다.', rating: 5 },
  ];

  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100svh-56px)] items-center justify-center overflow-hidden bg-[#25282b]">
        <div className="absolute inset-0">
          <Image
            src="/hero-home.jpg"
            alt="Ramen Shop"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70 saturate-[0.85]"
          />
          <div className="absolute inset-0 bg-[#25282b]/35"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center text-white">
          <h1 className={`mb-8 animate-fade-in-down text-[clamp(3.2rem,10.5vw,7.5rem)] font-extrabold uppercase leading-[0.98] tracking-[-0.025em] ${doHyeon.className}`}>
            <span className="block text-[clamp(2.6rem,7.8vw,5.2rem)]">취향으로 찾는</span>
            <span className="block">RAMEN</span>
            <span className="block text-[clamp(2.6rem,7.2vw,5rem)]">추천 플랫폼</span>
          </h1>

          <p className="animate-fade-in-up mx-auto mb-12 max-w-3xl text-lg font-medium leading-relaxed text-white/85 md:text-xl">
            <span className="block sm:inline">어디를 갈지 고민될 때,</span><span className="hidden sm:inline"> </span>
            <span className="block sm:inline">RAOTA가 취향에 맞는 라멘집을 골라드립니다.</span>
          </p>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <HomeHeroActions />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div
            ref={featuresHeaderRef}
            className={`reveal-hidden ${featuresHeaderVisible ? 'reveal-visible' : ''} grid gap-6 md:grid-cols-[1fr_1.15fr] md:items-end`}
          >
            <div>
              <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.28em] text-[#e60000]">
                Recommendation First
              </p>
              <h2 className="text-[clamp(2.2rem,8vw,3rem)] font-light leading-tight text-[#25282b] md:text-5xl">
                <span className="block md:whitespace-nowrap">오늘 먹고 싶은 라멘,</span>
                <span className="block md:whitespace-nowrap">이제 바로 찾아보세요.</span>
              </h2>
            </div>
            <p className="text-lg leading-8 text-[#7e7e7e]">
              <span className="block">
                취향에 맞춰 지금 먹고 싶은 한 그릇에 가까운 가게를 빠르게 제안합니다.
              </span>
              <span className="mt-2 block">
                탐색과 후기 기록을 함께 엮어 오늘의 선택이 더 쉬워지도록 구성했습니다.
              </span>
            </p>
          </div>

          {/* Core Features Grid */}
          <div
            ref={featuresGridRef}
            className="mt-12 flex snap-x snap-mandatory overflow-x-auto gap-4 pb-8 -mx-6 px-6 md:mt-24 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:mx-0 md:gap-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {featureCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <a
                  key={card.badge}
                  href={card.href}
                  className={`group flex min-w-[260px] max-w-[320px] snap-center flex-col justify-between rounded-[6px] border border-stone-200 bg-[#f7f7f7] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#e60000] reveal-hidden ${featuresGridVisible ? 'reveal-visible' : ''} reveal-delay-${i + 1} md:min-w-0 md:max-w-none md:p-8`}
                >
                  <div>
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-stone-200 bg-white text-[#25282b] transition-colors duration-300 group-hover:border-[#e60000] group-hover:bg-[#e60000] group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="inline-block rounded-[2px] border border-[#e60000] bg-white px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider text-[#e60000] transition-colors duration-300 group-hover:bg-[#e60000] group-hover:text-white">{card.badge}</span>
                    </div>
                    <h4 className="mb-3 text-xl font-bold text-[#25282b] transition-colors duration-300 group-hover:text-[#e60000] md:text-2xl">{card.title}</h4>
                    <p className="text-[15px] leading-relaxed text-[#7e7e7e] md:text-base">
                      {card.desc}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center font-bold text-[#25282b] transition-colors duration-300 group-hover:text-[#e60000]">
                    <span className="text-sm">바로가기</span>
                    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vodafone Red Chapter Divider */}
      <div className="h-12 w-full bg-[#e60000] md:h-16" aria-hidden="true" />

      {/* Community Sneak Peek */}
      <section className="bg-[#f7f7f7] px-6 py-16 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div
            ref={reviewsHeaderRef}
            className={`reveal-hidden ${reviewsHeaderVisible ? 'reveal-visible' : ''} mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end`}
          >
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#e60000]">Real Voices</p>
              <h2 className="text-3xl font-extrabold text-[#25282b] md:text-5xl">
                매니아들의 진짜 후기.
              </h2>
            </div>
            <a href="/community" className="inline-flex items-center gap-2 text-sm font-bold text-[#e60000] hover:underline">
              커뮤니티 바로가기
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
          </div>

          <div
            ref={reviewsGridRef}
            className="flex snap-x snap-mandatory overflow-x-auto gap-4 pb-8 -mx-6 px-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:px-0 md:mx-0 md:gap-6 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {reviews.map((review, i) => (
              <div
                key={i}
                className={`flex min-w-[280px] max-w-[340px] snap-center flex-col justify-between border border-stone-200 bg-white p-6 transition-all hover:border-[#e60000]/30 hover:shadow-sm reveal-hidden ${reviewsGridVisible ? 'reveal-visible' : ''} reveal-delay-${i + 1} md:min-w-0 md:max-w-none sm:p-8`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} className={`h-4 w-4 ${j < review.rating ? "text-[#e60000]" : "text-stone-200"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <h4 className="mb-3 text-lg font-bold text-[#25282b]">{review.shop}</h4>
                  <p className="text-base leading-relaxed text-[#7e7e7e] line-clamp-3">&quot;{review.text}&quot;</p>
                </div>
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f2f2] text-sm font-bold text-[#25282b]">
                    {review.author.slice(0, 1)}
                  </div>
                  <span className="text-sm font-bold text-[#25282b]">{review.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional CTA Panel */}
      <section
        ref={ctaRef}
        className="relative px-6 py-20 text-center md:py-32 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-ramen.webp"
            alt="Background"
            fill
            sizes="100vw"
            className="object-cover opacity-60 saturate-50"
          />
          <div className="absolute inset-0 bg-[#25282b]/85" />
        </div>
        <div className={`relative z-10 mx-auto max-w-4xl reveal-hidden ${ctaVisible ? 'reveal-visible' : ''}`}>
          <h2 className="mb-6 break-keep text-[clamp(1.75rem,6vw,4rem)] font-extrabold tracking-tight text-white leading-tight">
            당신의 라멘 지도를<br className="sm:hidden" /> 완성할 시간입니다.
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg font-medium text-white/80">
            가입하고 매니아들과 소통하거나, 지금 바로 AI 추천을 통해 오늘 저녁 메뉴를 결정해보세요.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a href="/recommend" className="inline-flex h-14 items-center justify-center rounded-full bg-[#e60000] px-8 text-base font-bold text-white transition-opacity hover:opacity-90 shadow-sm">
              맞춤 매장 추천받기
            </a>
            <a href="/login" className="inline-flex h-14 items-center justify-center rounded-full border border-white/30 bg-transparent px-8 text-base font-bold text-white transition-colors hover:bg-white/10">
              회원가입 / 로그인
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
