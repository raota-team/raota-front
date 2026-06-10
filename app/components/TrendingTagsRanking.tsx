'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronUp, Hash, Search } from 'lucide-react';

const MOCK_TAGS = [
  { name: '토리파이탄', rank: 1, trend: 'up' as const },
  { name: '이에케', rank: 2, trend: 'up' as const },
  { name: '혼밥 맛집', rank: 3, trend: 'new' as const },
  { name: '마제소바', rank: 4, trend: 'down' as const },
  { name: '웨이팅 필수', rank: 5, trend: 'up' as const },
];

export default function TrendingTagsRanking() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 컴포넌트 마운트 시 (PC 등장 애니메이션용)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 롤링 애니메이션 타이머 (모바일 전용)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsTransitioning(true);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  // 무한 롤링 트릭 (모바일 전용)
  useEffect(() => {
    if (currentIndex === MOCK_TAGS.length) {
      const resetTimer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 500);
      return () => clearTimeout(resetTimer);
    }
  }, [currentIndex]);

  return (
    <div className="rounded-md bg-white p-4 md:p-6 shadow-sm ring-1 ring-[#f2f2f2]">
      <div className="mb-3 flex items-center justify-between border-b border-[#f2f2f2]/60 pb-3 md:mb-4 md:pb-4">
        <h2 className="font-black text-base md:text-lg text-[#25282b] flex items-center gap-2">
          실시간 인기 검색어
        </h2>
      </div>
      
      {/* PC: 모든 순위 리스트 표시 + 순차적 등장 애니메이션 */}
      <div className="hidden lg:block relative">
        <ol className="space-y-0 w-full m-0 p-0">
          {MOCK_TAGS.map((tag, i) => (
            <li 
              key={`pc-${tag.name}`} 
              className={`flex items-center justify-between py-2 md:py-3 px-2 rounded-md
                transition-all duration-500 ease-out bg-transparent scale-100
                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                ${i !== MOCK_TAGS.length - 1 ? 'border-b border-[#f2f2f2]/50' : ''}
              `}
              style={{ transitionDelay: mounted ? '0ms' : `${i * 100}ms` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-4 text-xs md:text-sm font-black transition-colors duration-300 ${tag.rank <= 3 ? 'text-[#e60000]' : 'text-[#bebebe]'}`}>
                  {tag.rank}
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Search className="h-3 w-3 text-stone-300 flex-shrink-0" />
                  <span className="text-xs md:text-sm font-bold text-[#25282b] truncate group-hover:text-[#e60000] cursor-pointer transition-colors">
                    {tag.name}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2 flex items-center">
                {tag.trend === 'up' && <ChevronUp className="h-3 w-3 text-[#e60000] animate-bounce" />}
                {tag.trend === 'new' && <span className="text-[8px] font-black text-[#e60000] animate-pulse">NEW</span>}
                {tag.trend === 'down' && <span className="text-[10px] font-black text-stone-300">-</span>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* 모바일/태블릿: 1줄 롤링 티커 (무한 반복) */}
      <div className="lg:hidden relative h-[36px] overflow-hidden">
        <div 
          className={`absolute top-0 left-0 w-full ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ transform: `translateY(-${currentIndex * 36}px)` }}
        >
          {MOCK_TAGS.map((tag) => (
            <div key={`mobile-roll-${tag.name}`} className="flex items-center justify-between h-[36px] px-1">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-4 text-xs md:text-sm font-black ${tag.rank <= 3 ? 'text-[#e60000]' : 'text-[#bebebe]'}`}>
                  {tag.rank}
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Search className="h-3 w-3 text-stone-300 flex-shrink-0" />
                  <span className="text-xs md:text-sm font-bold text-[#25282b] truncate cursor-pointer">
                    {tag.name}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                {tag.trend === 'up' && <ChevronUp className="h-3 w-3 text-[#e60000] animate-bounce" />}
                {tag.trend === 'new' && <span className="text-[8px] font-black text-[#e60000] animate-pulse">NEW</span>}
                {tag.trend === 'down' && <span className="text-[10px] font-black text-stone-300">-</span>}
              </div>
            </div>
          ))}
          {/* 무한 롤링을 위한 첫 번째 아이템 복제 */}
          <div className="flex items-center justify-between h-[36px] px-1">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-4 text-xs md:text-sm font-black ${MOCK_TAGS[0].rank <= 3 ? 'text-[#e60000]' : 'text-[#bebebe]'}`}>
                {MOCK_TAGS[0].rank}
              </span>
              <div className="flex items-center gap-1.5 min-w-0">
                <Search className="h-3 w-3 text-stone-300 flex-shrink-0" />
                <span className="text-xs md:text-sm font-bold text-[#25282b] truncate cursor-pointer">
                  {MOCK_TAGS[0].name}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2">
              {MOCK_TAGS[0].trend === 'up' && <ChevronUp className="h-3 w-3 text-[#e60000] animate-bounce" />}
              {MOCK_TAGS[0].trend === 'new' && <span className="text-[8px] font-black text-[#e60000] animate-pulse">NEW</span>}
              {MOCK_TAGS[0].trend === 'down' && <span className="text-[10px] font-black text-stone-300">-</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
