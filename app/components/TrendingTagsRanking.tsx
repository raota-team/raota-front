'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

import { usePopularShopsToday } from '@/hooks/queries/useDiscovery';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 18,
    },
  },
} as const;

export default function TrendingTagsRanking() {
  const { data: popularShopsData, isLoading } = usePopularShopsToday(5);
  const shops = popularShopsData?.data || [];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

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
    <div className="rounded-md bg-white p-4 ring-1 ring-stone-200 md:p-6">
      <div className="mb-3 flex items-center justify-between border-b border-[#f2f2f2]/60 pb-3 md:mb-4 md:pb-4">
        <h2 className="font-black text-base md:text-lg text-[#25282b] flex items-center gap-2">
          <Flame className="h-[18px] w-[18px] text-[#e60000] fill-[#e60000]/10 animate-pulse" />
          오늘 많이 본 라멘집
        </h2>
      </div>
      
      {/* PC: 모든 순위 리스트 표시 + 순차적 등장 애니메이션 */}
      <div className="hidden lg:block relative">
        {isLoading ? (
          <div className="space-y-0 py-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-3 px-2 py-2.5 animate-pulse
                  ${i !== 4 ? 'border-b border-[#f2f2f2]/50' : ''}
                `}
              >
                <div className="h-4 w-4 bg-stone-200 rounded"></div>
                <div className="h-4 w-24 bg-stone-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.ol 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-0 w-full m-0 p-0"
          >
            {shops.map((shop, i) => (
            <motion.li 
              key={`pc-${shop.ramenShopId}`}
              variants={itemVariants}
              className={`rounded-md bg-transparent md:py-1
                ${i !== shops.length - 1 ? 'border-b border-[#f2f2f2]/50' : ''}
              `}
            >
              <Link href={`/shop/${shop.ramenShopId}`} className="group flex items-center px-2 py-1.5">
                <div className="flex items-center gap-3 min-w-0 transition-transform duration-200 ease-out group-hover:translate-x-1">
                  <span className={`w-4 text-xs md:text-sm font-black transition-colors duration-300 ${i < 3 ? 'text-[#e60000]' : 'text-[#737373]'}`}>
                    {i + 1}
                  </span>
                  <div className="flex items-center min-w-0">
                    <span className="text-xs md:text-sm font-bold text-[#25282b] truncate group-hover:text-[#e60000] transition-colors">
                      {shop.name}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </motion.ol>
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

            </Link>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
