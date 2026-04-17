import Link from 'next/link';
import { ChevronRight, Star, Users } from 'lucide-react';
import { Do_Hyeon } from 'next/font/google';

const doHyeon = Do_Hyeon({
  weight: '400',
  subsets: ['latin'],
});

export default function HomePage() {
  return (
    <div className="bg-stone-50">
      {/* Full Screen Hero Section */}
      <section className="h-[100dvh] relative flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0">
          <img
            src="/hero-home.jpg"
            alt="Ramen Shop"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-stone-900/80"></div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto -translate-y-12 md:-translate-y-16">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30 shadow-sm">
            <span className="text-xl">🍜</span>
            <span className={`text-white text-sm md:text-base ${doHyeon.className} tracking-wide`}>라멘 매니아들의 성지</span>
          </div>

          <h1 className={`text-5xl md:text-7xl text-white mb-6 leading-tight drop-shadow-lg ${doHyeon.className} tracking-wide`}>
            한 그릇에 담긴 진심,<br />
            우리들의 라멘 지도 <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-400 to-amber-300 font-sans font-black tracking-tighter">RAOTA</span>
          </h1>

          <p className={`text-lg md:text-2xl text-white/95 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow ${doHyeon.className} tracking-wide`}>
            숨겨진 로컬 맛집부터 웨이팅 필수 핫플까지.<br className="hidden md:block" />
            진짜 라멘 매니아들의 생생하고 솔직한 리뷰를 만나보세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shops"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-8 py-4 font-bold text-lg rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all hover:scale-[1.02]"
            >
              맛집 탐색하기
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/community"
              className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-900 px-8 py-4 font-bold text-lg rounded-xl border border-stone-200 shadow-sm transition-all hover:scale-[1.02]"
            >
              커뮤니티
              <Users className="w-5 h-5 text-stone-400 group-hover:text-stone-600" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
