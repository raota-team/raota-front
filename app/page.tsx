import Link from 'next/link';
import { ChevronRight, Star, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-stone-50">
      {/* Full Screen Hero Section */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
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
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-white text-sm font-bold">대한민국 라멘 리뷰 플랫폼</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
            라멘의 모든 것,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-400 to-amber-300">
              RAOTA
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow">
            전국의 숨겨진 라멘 맛집을 발견하고, <br className="hidden md:block" />
            라멘을 사랑하는 사람들과 리뷰를 공유하세요.
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
