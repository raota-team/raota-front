import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Camera } from 'lucide-react';
import { Shop } from '@/app/types';

interface ShopCardProps {
  shop: Shop;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <Link
      href={`/shop/${shop.id}`}
      className="group relative flex min-h-32 cursor-pointer flex-row overflow-hidden rounded-md bg-white transition-colors duration-200 hover:text-[#e60000] md:min-h-0 md:flex-col"
    >
      <div className="relative min-h-32 w-32 flex-shrink-0 self-stretch overflow-hidden rounded-l-md md:h-48 md:min-h-0 md:w-full md:self-auto md:rounded-l-none md:rounded-t-md">
        <img 
          src={shop.imageUrl} 
          alt={shop.name} 
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3 md:p-5">
        <div className="min-w-0">
          <span className="mb-1.5 inline-block max-w-full truncate rounded-sm border border-[#e60000] bg-white/80 px-2 py-0.5 align-top text-[10px] font-semibold uppercase text-black/80 md:mb-2 md:py-1 md:text-xs">{shop.type}</span>
          <h3 className="line-clamp-1 max-w-full text-lg font-bold leading-tight text-[#25282b] transition-colors group-hover:text-[#e60000] md:text-2xl">{shop.name}</h3>
          <p className="mt-1.5 line-clamp-1 text-xs leading-relaxed text-[#7e7e7e] md:mt-2 md:line-clamp-2 md:text-base">{shop.description}</p>
        </div>
        <div className="mt-2 flex min-w-0 items-center justify-between gap-2 border-t border-stone-200 pt-2 text-[10px] font-medium text-[#7e7e7e] md:mt-6 md:pt-4 md:text-xs">
          <div className="flex min-w-0 items-center"><MapPin className="mr-1 h-3 w-3 flex-shrink-0" /><span className="truncate">{shop.location}</span></div>
          <div className="flex flex-shrink-0 items-center"><Camera className="mr-1 h-3 w-3" />{shop.stats.visit_count}</div>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
