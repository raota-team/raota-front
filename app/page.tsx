import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import { Do_Hyeon } from 'next/font/google';

const doHyeon = Do_Hyeon({
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    absolute: '라오타 - 라멘에 진심인 사람들',
  },
  description:
    '라오타(RAOTA) 라멘 커뮤니티에서 전국 라멘 맛집, 일본라멘 스타일, 매니아들의 솔직한 라멘 후기를 찾아보세요.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-white">
      <section className="relative flex min-h-[calc(100dvh-56px)] items-center justify-center overflow-hidden bg-[#25282b]">
        <div className="absolute inset-0">
          <img
            src="/hero-home.jpg"
            alt="Ramen Shop"
            className="h-full w-full object-cover opacity-70 saturate-[0.85]"
          />
          <div className="absolute inset-0 bg-[#25282b]/35"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center text-white">
          <h1 className={`vodafone-display mb-8 text-[clamp(4rem,13vw,9rem)] ${doHyeon.className}`}>
            <span className="block">RAOTA</span>
            <span className="block text-[clamp(3rem,10vw,7rem)]">전국 라멘 지도</span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed text-white/85 md:text-xl">
            <span className="block sm:inline">지역별 라멘 맛집과</span><span className="hidden sm:inline"> </span>
            <span className="block sm:inline">매니아들의 솔직한 기록을 확인하세요.</span>
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/shops"
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
        </div>
      </section>
      <section className="bg-white px-6 py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_1.2fr] md:items-end">
          <h2 className="text-4xl font-light leading-tight text-[#25282b] md:text-5xl">
            라멘에 진심인 사람들을 위한 간결한 아카이브.
          </h2>
          <p className="text-lg leading-8 text-[#7e7e7e]">
            지역과 라멘 종류로 전국 라멘집을 찾아보고, 매장별 메뉴 정보와 영업시간,
            유저 인증 사진, 커뮤니티 후기를 함께 확인하는 라멘 맛집 기록 서비스입니다.
          </p>
        </div>
      </section>
    </div>
  );
}
