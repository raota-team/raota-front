'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Eye, MapPin, Camera } from 'lucide-react';
import { Shop } from '@/app/types';

interface ShopCardProps {
  shop: Shop;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const [useOriginalImage, setUseOriginalImage] = useState(false);

  return (
    <Link
      href={`/shop/${shop.id}`}
      className="group relative flex min-h-32 cursor-pointer flex-row overflow-hidden rounded-md border border-stone-200 bg-white transition-colors duration-200 hover:border-[#e60000] hover:bg-stone-50 md:min-h-0 md:flex-col"
    >
      <div className="relative min-h-32 w-32 flex-shrink-0 self-stretch overflow-hidden rounded-l-md md:h-48 md:min-h-0 md:w-full md:self-auto md:rounded-l-none md:rounded-t-md bg-stone-100 flex items-center justify-center">
        {shop.imageUrl && useOriginalImage ? (
          <img
            src={shop.imageUrl} 
            alt={shop.name} 
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              // 이미지 로드 실패 시 대체 이미지 또는 요소로 전환
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : shop.imageUrl ? (
          <Image
            src={shop.imageUrl}
            alt={shop.name}
            fill
            sizes="(max-width: 768px) 128px, (max-width: 1200px) 33vw, 25vw"
            className="absolute inset-0 object-cover"
            onError={() => setUseOriginalImage(true)}
          />
        ) : (
          <div className="text-stone-300">
            <span className="text-4xl opacity-50">🍜</span>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3 md:p-5">
        <div className="min-w-0">
          <span className="mb-1.5 inline-block max-w-full truncate rounded-sm border border-[#e60000] bg-white/80 px-2 py-0.5 align-top text-[10px] font-semibold uppercase text-black/80 md:mb-2 md:py-1 md:text-xs">{shop.type}</span>
          <h3 className="line-clamp-1 max-w-full text-lg font-bold leading-tight text-[#25282b] transition-colors group-hover:text-[#e60000] md:text-2xl">{shop.name}</h3>
          <p className="mt-1.5 line-clamp-1 text-xs leading-relaxed text-[#7e7e7e] md:mt-2 md:line-clamp-2 md:text-base">{shop.description}</p>
        </div>
        <div className="mt-2 flex min-w-0 items-center justify-between gap-2 border-t border-stone-200 pt-2 text-[10px] font-medium text-[#7e7e7e] transition-colors group-hover:text-[#25282b] md:mt-6 md:pt-4 md:text-xs">
          <div className="flex min-w-0 items-center"><MapPin className="mr-1 h-3 w-3 flex-shrink-0" /><span className="truncate">{shop.location}</span></div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="flex items-center"><Eye className="mr-1 h-3 w-3" />{shop.stats.view_count}</span>
            <span className="flex items-center"><Camera className="mr-1 h-3 w-3" />{shop.stats.visit_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
