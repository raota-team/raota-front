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
      className="group bg-white border border-stone-200 hover:border-red-400 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col shadow-sm hover:shadow-lg relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-red-500 before:to-red-600 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
    >
      <div className="aspect-w-16 aspect-h-9 h-48 overflow-hidden relative">
        <img 
          src={shop.imageUrl} 
          alt={shop.name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
          <span className="text-red-500 text-xs font-bold tracking-widest uppercase mb-1 block">{shop.type}</span>
          <h3 className="text-lg font-bold text-stone-900 group-hover:text-red-500 transition-colors leading-tight">{shop.name}</h3>
        </div>
        <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed mb-6 flex-grow">{shop.description}</p>
        <div className="flex items-center justify-between text-xs text-stone-400 font-mono border-t border-stone-200 pt-4 mt-auto">
          <div className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{shop.location}</div>
          <div className="flex items-center"><Camera className="w-3 h-3 mr-1" />방문수: {shop.stats.visit_count}</div>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
