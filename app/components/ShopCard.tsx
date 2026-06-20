'use client';

import Link from 'next/link';
import { ArrowRight, Eye, MapPin, Camera } from 'lucide-react';
import { Shop } from '@/app/types';
import ResilientImage from './ResilientImage';

interface ShopCardProps {
  shop: Shop;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const ramenLogCount = shop.ramenLogCount;
  const ramenLogPreviewImageUrls = shop.ramenLogPreviewImageUrls.slice(0, 3);

  return (
    <article
      className="group relative flex min-h-32 cursor-pointer flex-row overflow-hidden rounded-md border border-stone-200 bg-white transition-colors duration-200 hover:border-[#e60000] hover:bg-stone-50 md:min-h-0 md:flex-col"
    >
      <Link
        href={`/shop/${shop.id}`}
        aria-label={`${shop.name} 상세 보기`}
        className="absolute inset-0 z-0"
      />
      <div className="relative min-h-32 w-32 flex-shrink-0 self-stretch overflow-hidden rounded-l-md md:h-48 md:min-h-0 md:w-full md:self-auto md:rounded-l-none md:rounded-t-md bg-stone-100 flex items-center justify-center">
        {shop.imageUrl ? (
          <ResilientImage
            src={shop.imageUrl}
            alt={shop.name}
            fill
            sizes="(max-width: 768px) 128px, (max-width: 1200px) 33vw, 25vw"
            className="absolute inset-0 object-cover"
          />
        ) : (
          <div className="text-stone-300">
            <span className="text-4xl opacity-50">🍜</span>
          </div>
        )}
      </div>
      <div className="pointer-events-none relative flex min-w-0 flex-1 flex-col justify-between p-3 md:p-5">
        <div className="min-w-0">
          <span className="mb-1.5 inline-block max-w-full truncate rounded-sm border border-[#e60000] bg-white/80 px-2 py-0.5 align-top text-[10px] font-semibold uppercase text-black/80 md:mb-2 md:py-1 md:text-xs">{shop.type}</span>
          <h3 className="line-clamp-1 max-w-full text-lg font-bold leading-tight text-[#25282b] transition-colors group-hover:text-[#e60000] md:text-2xl">{shop.name}</h3>
          <p className="mt-1.5 line-clamp-1 text-xs leading-relaxed text-[#7e7e7e] md:mt-2 md:line-clamp-2 md:text-base">{shop.description}</p>
        </div>
        <div className="mt-2 flex min-w-0 items-center justify-between gap-2 pt-2 text-[10px] font-medium text-[#7e7e7e] transition-colors group-hover:text-[#25282b] md:mt-6 md:text-xs">
          <div className="flex min-w-0 items-center"><MapPin className="mr-1 h-3 w-3 flex-shrink-0" /><span className="truncate">{shop.location}</span></div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="flex items-center"><Eye className="mr-1 h-3 w-3" />{shop.stats.view_count}</span>
            <span className="flex items-center"><Camera className="mr-1 h-3 w-3" />{shop.stats.visit_count}</span>
          </div>
        </div>

        {ramenLogCount > 0 && (
          <Link
            href={`/ramen-log?shopId=${shop.id}&shopName=${encodeURIComponent(shop.name)}`}
            aria-label={`${shop.name} 라멘 로그 ${ramenLogCount}개 보러가기`}
            className="pointer-events-auto relative z-10 mt-2 flex min-h-11 items-center gap-2.5 border-t border-stone-200 pt-2 text-[#25282b] transition-colors hover:text-[#e60000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e60000] focus-visible:ring-offset-2 md:mt-4 md:gap-3 md:pt-4"
          >
            {ramenLogPreviewImageUrls.length > 0 && (
              <span className="flex shrink-0 -space-x-2">
                {ramenLogPreviewImageUrls.map((imageUrl, index) => (
                  <span
                    key={`${imageUrl}-${index}`}
                    className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-stone-100 md:h-10 md:w-10"
                    style={{ zIndex: ramenLogPreviewImageUrls.length - index }}
                  >
                    <ResilientImage
                      src={imageUrl}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                ))}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10px] font-bold text-[#7e7e7e] md:text-xs">
                이 가게의 라멘 로그
              </span>
              <span className="mt-0.5 flex items-center gap-1 whitespace-nowrap text-xs font-bold md:text-sm">
                {ramenLogCount}개 보러가기
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </Link>
        )}
      </div>
    </article>
  );
};

export default ShopCard;
