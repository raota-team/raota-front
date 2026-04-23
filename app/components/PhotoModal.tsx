'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, MapPin, Calendar } from 'lucide-react';

interface Photo {
  imageUrl: string;
  menuName: string;
  user?: string;           // 업로더 닉네임
  userId?: number;         // 업로더 ID (이동용)
  restaurantName?: string; // 식당 이름
  restaurantId?: number;   // 식당 이동 ID
  date: string;
  comment?: string;
}

interface PhotoModalProps {
  photo: Photo | null;
  onClose: () => void;
  disableNavigation?: boolean;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose, disableNavigation = false }) => {
  const router = useRouter();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!photo) return null;

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disableNavigation) return;

    onClose();
    if (photo.restaurantId) {
      router.push(`/shop/${photo.restaurantId}`);
    } else if (photo.userId) {
      router.push(`/user/${photo.userId}`);
    } else if (photo.user) {
      router.push(`/user/${photo.user}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-stone-950/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-2xl bg-black rounded-sm shadow-2xl overflow-hidden flex flex-col items-center justify-center animate-scale-in group aspect-[5/4]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <img
            src={photo.imageUrl}
            alt={photo.menuName}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
            }}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8 pt-24 text-white">
            <div className="flex flex-col items-start space-y-2">
              <div className="flex items-center space-x-3 mb-1">
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">{photo.menuName}</span>
                
                <button
                  onClick={handleInfoClick}
                  disabled={disableNavigation}
                  className={`text-stone-300 text-sm font-mono flex items-center transition-all ${!disableNavigation ? 'hover:text-white hover:underline' : ''}`}
                >
                  {photo.restaurantName ? (
                    <>
                      <MapPin className="w-3.5 h-3.5 mr-1" /> {photo.restaurantName}
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 mr-1" /> @{photo.user}
                    </>
                  )}
                </button>
                
                <span className="text-stone-400 text-xs font-mono flex items-center">
                  <Calendar className="w-3 h-3 mr-1" /> {photo.date}
                </span>
              </div>

              <p className="text-lg md:text-xl font-medium leading-relaxed text-stone-100">
                "{photo.comment || "한줄평이 없습니다."}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
