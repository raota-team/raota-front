import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import { Do_Hyeon } from 'next/font/google';

const doHyeon = Do_Hyeon({
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RAOTA - 라멘에 진심인 사람들의 라멘 커뮤니티',
  description:
    '라오타(RAOTA) 라멘 커뮤니티에서 전국 라멘 맛집, 일본라멘 스타일, 매니아들의 솔직한 라멘 후기를 찾아보세요.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <div className="bg-stone-950 overflow-hidden">
      {/* Full Screen Hero Section */}
      <section className="h-[100dvh] relative flex items-center justify-center">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0">
          <img
            src="/hero-home.jpg"
            alt="Ramen Shop"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>
          <div className="absolute inset-0 bg-stone-950/20"></div>
        </div>

        {/* Hero Content - Refined Layout */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1 className={`text-6xl md:text-8xl text-white mb-8 leading-[1.1] tracking-tighter ${doHyeon.className}`}>
            한 그릇에 담긴 <br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-stone-400">깊은 진심,</span><br />
            라멘 지도 <span className="text-red-500 font-sans font-black italic tracking-tighter drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]">RAOTA</span>
          </h1>

          <p className={`text-lg md:text-xl text-stone-400 mb-14 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up`}>
            숨겨진 로컬 맛집부터 웨이팅 필수핫플까지.<br className="hidden md:block" />
            진짜 매니아들이 기록하는 생생한 라멘의 연대기.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              href="/shops"
              className="group relative overflow-hidden bg-white text-stone-950 px-10 py-5 font-black text-lg rounded-full transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <span className="relative z-10 flex items-center gap-2">
                맛집 탐색하기
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/community"
              className="group px-10 py-5 font-black text-lg rounded-full transition-all bg-stone-100/10 hover:bg-stone-100/20 border border-white/10 text-white backdrop-blur-md shadow-xl"
            >
              <span className="flex items-center gap-2 text-stone-200 group-hover:text-white">
                커뮤니티
                <Users className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
