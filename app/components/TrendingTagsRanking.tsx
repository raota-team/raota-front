'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';

import { usePopularShopsToday } from '@/hooks/queries/useDiscovery';

export default function TrendingTagsRanking() {
  const { data: popularShopsData, isLoading } = usePopularShopsToday(5);
  const shops = popularShopsData?.data || [];
  
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
    if (shops.length > 0 && currentIndex === shops.length) {
      const resetTimer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 500);
      return () => clearTimeout(resetTimer);
    }
  }, [currentIndex, shops.length]);

  return (
    <div className="rounded-md bg-white p-4 ring-1 ring-[#f2f2f2] md:p-6">
      <div className="mb-3 flex items-center justify-between border-b border-[#f2f2f2]/60 pb-3 md:mb-4 md:pb-4">
        <h2 className="font-black text-base md:text-lg text-[#25282b] flex items-center gap-2">
          오늘 많이 본 라멘집
        </h2>
      </div>
      
      {/* PC: 모든 순위 리스트 표시 + 순차적 등장 애니메이션 */}
      <div className="hidden lg:block relative">
        {isLoading ? (
          <div className="space-y-4 py-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-stone-200 rounded"></div>
                  <div className="h-4 w-24 bg-stone-200 rounded"></div>
                </div>
                <div className="h-4 w-6 bg-stone-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <ol className="space-y-0 w-full m-0 p-0">
            {shops.map((shop, i) => (
            <li 
              key={`pc-${shop.ramenShopId}`}
              className={`rounded-md bg-transparent
                transition-opacity duration-300 ease-out md:py-3
                ${mounted ? 'opacity-100' : 'opacity-0'}
                ${i !== shops.length - 1 ? 'border-b border-[#f2f2f2]/50' : ''}
              `}
              style={{ transitionDelay: mounted ? '0ms' : `${i * 100}ms` }}
            >
              <Link href={`/shop/${shop.ramenShopId}`} className="group flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-4 text-xs md:text-sm font-black transition-colors duration-300 ${i < 3 ? 'text-[#e60000]' : 'text-[#737373]'}`}>
                    {i + 1}
                  </span>
                  <div className="flex items-center min-w-0">
                    <span className="text-xs md:text-sm font-bold text-[#25282b] truncate group-hover:text-[#e60000] transition-colors">
                      {shop.name}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2 flex items-center gap-1 text-[10px] font-black text-stone-400">
                  <Eye className="h-3 w-3" />
                  {shop.viewCount.toLocaleString()}
                </div>
              </Link>
            </li>
          ))}
        </ol>
        )}
      </div>

      {/* 모바일/태블릿: 1줄 롤링 티커 (무한 반복) */}
      <div className="lg:hidden relative h-[36px] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center h-[36px] px-1 animate-pulse">
            <div className="h-4 w-4 bg-stone-200 rounded mr-3"></div>
            <div className="h-4 w-32 bg-stone-200 rounded"></div>
          </div>
        ) : (
          <div 
          className={`absolute top-0 left-0 w-full ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ transform: `translateY(-${currentIndex * 36}px)` }}
        >
          {shops.map((shop, index) => (
            <Link key={`mobile-roll-${shop.ramenShopId}`} href={`/shop/${shop.ramenShopId}`} className="flex items-center justify-between h-[36px] px-1">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-4 text-xs md:text-sm font-black ${index < 3 ? 'text-[#e60000]' : 'text-[#737373]'}`}>
                  {index + 1}
                </span>
                <div className="flex items-center min-w-0">
                  <span className="text-xs md:text-sm font-bold text-[#25282b] truncate">
                    {shop.name}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2 flex items-center gap-1 text-[10px] font-black text-stone-400">
                <Eye className="h-3 w-3" />
                {shop.viewCount.toLocaleString()}
              </div>
            </Link>
          ))}
          {/* 무한 롤링을 위한 첫 번째 아이템 복제 */}
          {shops.length > 0 && (
            <Link href={`/shop/${shops[0].ramenShopId}`} className="flex items-center justify-between h-[36px] px-1">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-4 text-xs md:text-sm font-black text-[#e60000]">
                  1
                </span>
                <div className="flex items-center min-w-0">
                  <span className="text-xs md:text-sm font-bold text-[#25282b] truncate">
                    {shops[0].name}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2 flex items-center gap-1 text-[10px] font-black text-stone-400">
                <Eye className="h-3 w-3" />
                {shops[0].viewCount.toLocaleString()}
              </div>
            </Link>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
