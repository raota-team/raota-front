'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import HomeHeroActions from './HomeHeroActions';
import { Do_Hyeon } from 'next/font/google';
import { Sparkles, Scale, MessageSquare, MessageCircleMore, Camera, ChevronLeft, ChevronRight, Users, UtensilsCrossed } from 'lucide-react';

const doHyeon = Do_Hyeon({
  weight: '400',
  subsets: ['latin'],
});

export default function LandingContent() {
  const [featuresHeaderRef, featuresHeaderVisible] = useScrollReveal();
  const [featuresGridRef, featuresGridVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });
  const [reviewsHeaderRef, reviewsHeaderVisible] = useScrollReveal();
  const [reviewsGridRef, reviewsGridVisible] = useScrollReveal({ threshold: 0.08 });
  const [ctaRef, ctaVisible] = useScrollReveal({ threshold: 0.2 });

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (featuresGridRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = featuresGridRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollWidth - scrollLeft - clientWidth > 10);
    }
  };

  useEffect(() => {
    const el = featuresGridRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [featuresGridRef]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (featuresGridRef.current) {
      const { clientWidth } = featuresGridRef.current;
      const scrollAmount = clientWidth * 0.75;
      const newScrollLeft = direction === 'left'
        ? featuresGridRef.current.scrollLeft - scrollAmount
        : featuresGridRef.current.scrollLeft + scrollAmount;

      featuresGridRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const featureCards = [
    {
      href: '/recommend?mode=taste',
      icon: Sparkles,
      badge: 'Taste Match',
      pain: '후기는 많아도, 내 입맛에 맞을지 고민될 때',
      title: '내 취향 저격 라멘 추천',
      desc: '국물의 농도, 면의 식감, 선호하는 토핑부터 그날의 기분까지 섬세하게 반영하여 실패 없는 완벽한 한 그릇을 찾아드려요.',
    },
    {
      href: '/recommend?mode=compare',
      icon: Scale,
      badge: 'Quick Compare',
      pain: '두 매장 중 하나를 고르기 어려울 때',
      title: '헷갈리는 두 매장 1:1 비교',
      desc: '대표 메뉴와 분위기는 물론 방문자들의 핵심 평가까지 한눈에 대조하여, 지금 상황에 가장 끌리는 곳을 쉽게 결정해 보세요.',
    },
    {
      href: '/recommend?mode=summary',
      icon: MessageSquare,
      badge: 'Review Summary',
      pain: '긴 후기들을 전부 읽기 지칠 때',
      title: '핵심만 쏙 뽑아낸 리뷰 요약',
      desc: '실제 방문자들의 칭찬과 솔직한 아쉬운 점을 키워드 중심으로 정리하여, 수십 개의 후기를 읽지 않아도 매장 특징을 단번에 파악해요.',
    },
    {
      href: '/shops',
      icon: Camera,
      badge: 'Photo Proof',
      pain: '내가 먹은 라멘을 기록하고 싶을 때',
      title: '실시간 메뉴 사진 & 인증',
      desc: '드신 메뉴를 선택해 직접 찍은 인증샷과 한줄평을 등록해 보세요. 방문한 매장의 생생한 정보를 다른 사람들과 공유하고 기록으로 남길 수 있습니다.',
    },
  ];

  const reviews = [
    {
      author: '면치기달인',
      shop: '멘야로지',
      label: '풍미가 진하게 남는 한 그릇',
      text: '시그니처인 흑마늘 라멘의 풍미가 미쳤습니다. 국물 농도도 적당하고 차슈 추가는 선택이 아닌 필수입니다.',
    },
    {
      author: '라멘투어',
      shop: '566라멘',
      label: '양과 스타일이 확실한 선택',
      text: '지로계 스타일을 좋아한다면 이보다 더 좋은 선택지는 없습니다. 양이 정말 많으니 처음 가시는 분은 기본 사이즈를 추천합니다.',
    },
    {
      author: '국물매니아',
      shop: '가솔린앤로지스',
      label: '국물 취향이 분명한 사람에게',
      text: '농후한 돈코츠 육수가 일품. 가게가 조금 협소하지만 그 특유의 일본 로컬 분위기 자체가 조미료가 됩니다.',
    },
  ];

  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100svh-56px)] items-center justify-center overflow-hidden bg-[#25282b] pt-12 sm:pt-0">
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

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center text-white sm:-mt-4">
          <h1 className={`mb-8 animate-fade-in-down text-[clamp(3.2rem,10.5vw,7.5rem)] font-extrabold uppercase leading-[0.98] tracking-[-0.025em] ${doHyeon.className}`}>
            <span className="block text-[clamp(2.6rem,7.8vw,5.2rem)]">헤매지 않고 찾는</span>
            <span className="block">RAMEN</span>
            <span className="block text-[clamp(2.6rem,7.2vw,5rem)]">오늘의 한 그릇</span>
          </h1>

          <p className="animate-fade-in-up mx-auto mb-12 max-w-3xl break-keep text-base font-medium leading-relaxed text-white/85 md:text-xl">
            <span className="block">어디가 더 맛있을지보다 지금 나한테 맞는 한 그릇이 무엇인지,</span>
            <span className="block">RAOTA가 그 고민부터 함께 정리해드립니다.</span>
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
                Less Guesswork
              </p>
              <h2 className="max-w-[15ch] break-keep text-[clamp(2.2rem,8vw,3rem)] font-light leading-tight text-[#25282b] md:max-w-none md:text-5xl">
                <span className="block">좋아 보이는 곳은 많은데,</span>
                <span className="block">막상 고르기는 어렵죠.</span>
              </h2>
            </div>
            <p className="max-w-2xl break-keep text-lg leading-8 text-[#7e7e7e]">
              <span className="block">
                후기는 넘치고, 내 취향은 설명하기 어렵고, 후보가 생겨도 마지막 선택에서 자주 멈추게 됩니다.
              </span>
              <span className="mt-2 block">
                RAOTA는 그 고민이 길어지는 지점을 AI로 정리해 오늘의 한 그릇을 더 쉽게 고르게 만듭니다.
              </span>
            </p>
          </div>

          {/* Core Features Slider Container */}
          <div className="relative group/slider mt-12 md:mt-24">
            {/* Left Button */}
            {showLeftArrow && (
              <button
                onClick={() => handleScroll('left')}
                className="absolute left-2 lg:-left-6 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-[#25282b] transition-all hover:border-[#e60000] hover:text-[#e60000] active:scale-95 hidden md:flex opacity-90 hover:opacity-100"
                aria-label="이전 카드 보기"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Right Button */}
            {showRightArrow && (
              <button
                onClick={() => handleScroll('right')}
                className="absolute right-2 lg:-right-6 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-[#25282b] transition-all hover:border-[#e60000] hover:text-[#e60000] active:scale-95 hidden md:flex opacity-90 hover:opacity-100"
                aria-label="다음 카드 보기"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Core Features Scrollable Element */}
            <div
              ref={featuresGridRef}
              className="flex snap-x snap-mandatory overflow-x-auto gap-6 -mx-6 -mt-4 px-6 pt-4 pb-8 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:px-0"
            >
              {featureCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <a
                    key={card.badge}
                    href={card.href}
                    className={`group flex w-[78vw] min-w-[244px] max-w-[320px] snap-center flex-col justify-between rounded-[0px_6px_0px_0px] border border-stone-200 bg-[#f7f7f7] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#e60000] reveal-hidden ${featuresGridVisible ? 'reveal-visible' : ''} reveal-delay-${i + 1} sm:w-[320px] sm:max-w-[340px] md:w-[360px] md:max-w-[380px] md:p-8 shrink-0`}
                  >
                    <div>
                      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-stone-200 bg-white text-[#25282b] transition-colors duration-300 group-hover:border-[#e60000] group-hover:bg-[#e60000] group-hover:text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="mb-4 flex items-center gap-2">
                        <span className="inline-block rounded-[2px] border border-[#e60000] bg-white px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider text-[#e60000] transition-colors duration-300 group-hover:bg-[#e60000] group-hover:text-white">{card.badge}</span>
                      </div>
                      <p className="mb-3 break-keep text-sm font-semibold leading-5 text-[#e60000]">
                        {card.pain}
                      </p>
                      <h3 className="mb-3 text-xl font-bold text-[#25282b] transition-colors duration-300 group-hover:text-[#e60000] md:text-2xl">{card.title}</h3>
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
        </div>
      </section>

      {/* Vodafone Red Chapter Divider */}
      <div className="vodafone-red-band w-full" aria-hidden="true" />

      {/* Community Sneak Peek */}
      <section className="bg-[#f7f7f7] px-6 py-16 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div
            ref={reviewsHeaderRef}
            className={`reveal-hidden ${reviewsHeaderVisible ? 'reveal-visible' : ''} mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end`}
          >
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#e60000]">Last Check Before You Go</p>
              <h2 className="max-w-[12ch] break-keep text-3xl font-extrabold leading-tight text-[#25282b] md:max-w-none md:text-5xl">
                선택 전에 보는 <span className="whitespace-nowrap">진짜 후기.</span>
              </h2>
            </div>
            <a href="/community" className="inline-flex items-center gap-2 text-sm font-bold text-[#e60000] hover:underline">
              후기 더 보러가기
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
          </div>

          <div
            ref={reviewsGridRef}
            className="flex snap-x snap-mandatory overflow-x-auto gap-4 -mx-6 -mt-1 px-6 pt-1 pb-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:px-0 md:mx-0 md:mt-0 md:gap-6 md:pt-0 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {reviews.map((review, i) => (
              <div
                key={i}
                className={`flex min-w-[280px] max-w-[340px] snap-center flex-col justify-between rounded-[6px] border border-stone-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#e60000]/30 reveal-hidden ${reviewsGridVisible ? 'reveal-visible' : ''} reveal-delay-${i + 1} md:min-w-0 md:max-w-none sm:p-8`}
              >
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8f1f1] text-[#e60000]">
                      <MessageCircleMore className="h-5 w-5" />
                    </div>
                    <p className="break-keep text-sm font-semibold leading-5 text-[#e60000]">
                      {review.label}
                    </p>
                  </div>
                  <h3 className="mb-3 break-keep text-lg font-bold text-[#25282b]">{review.shop}</h3>
                  <p className="break-keep text-base leading-relaxed text-[#7e7e7e] line-clamp-4">&quot;{review.text}&quot;</p>
                </div>
                <div className="mt-8 flex items-center gap-3 border-t border-stone-200 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f2f2] text-sm font-bold text-[#25282b]">
                    {review.author.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#25282b]">{review.author}</p>
                    <p className="text-xs text-[#7e7e7e]">라멘 커뮤니티 유저</p>
                  </div>
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
            오늘 먹을 라멘,
            <span className="block">지금 바로 추천받기</span>
          </h2>
          <p className="mx-auto mb-12 max-w-2xl break-keep text-lg font-medium leading-relaxed text-white/80">
            취향에 맞는 한 그릇을 빠르게 골라보세요.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a href="/shops" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 text-base font-bold text-white transition-colors hover:bg-white/20">
              라멘집 보러가기
              <UtensilsCrossed className="h-5 w-5" />
            </a>
            <a href="/community" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/30 bg-transparent px-8 text-base font-bold text-white transition-colors hover:bg-white/10">
              커뮤니티 보기
              <Users className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
