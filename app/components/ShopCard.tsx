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
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-md bg-white transition-colors duration-200 hover:text-[#e60000]"
    >
      <div className="aspect-w-16 aspect-h-9 relative h-48 overflow-hidden rounded-t-md">
        <img 
          src={shop.imageUrl} 
          alt={shop.name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
          <span className="mb-2 inline-flex rounded-sm border border-[#e60000] bg-white/80 px-2 py-1 text-xs font-semibold uppercase text-black/80">{shop.type}</span>
          <h3 className="text-2xl font-bold leading-tight text-[#25282b] transition-colors group-hover:text-[#e60000]">{shop.name}</h3>
        </div>
        <p className="mb-6 line-clamp-2 flex-grow text-base leading-relaxed text-[#7e7e7e]">{shop.description}</p>
        <div className="mt-auto flex items-center justify-between border-t border-stone-200 pt-4 text-xs font-medium text-[#7e7e7e]">
          <div className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{shop.location}</div>
          <div className="flex items-center"><Camera className="w-3 h-3 mr-1" />방문수: {shop.stats.visit_count}</div>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
