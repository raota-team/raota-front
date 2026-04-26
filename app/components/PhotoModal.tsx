'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, MapPin, Calendar, Trash2 } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';

interface Photo {
  id?: number;            // 삭제를 위한 고유 ID
  imageUrl: string;
  menuName: string;
  user?: string;           // 업로더 닉네임
  userId?: number;         // 업로더 ID
  restaurantName?: string; // 식당 이름
  restaurantId?: number;   // 식당 이동 ID
  date: string;
  comment?: string;
  isUserPhoto?: boolean;   // 유저 프로필/배경 줌 전용 플래그
}

interface PhotoModalProps {
  photo: Photo | null;
  onClose: () => void;
  onDelete?: (photoId: number) => Promise<void>; // 삭제 콜백 추가
  disableNavigation?: boolean;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose, onDelete, disableNavigation = false }) => {
  const router = useRouter();
  const { currentUser, showConfirm } = useApp();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!photo) return null;

  // 본인 사진 여부 확인
  const isMine = currentUser && photo.userId && currentUser.user_id === photo.userId;

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disableNavigation || photo.isUserPhoto) return;

    onClose();
    if (photo.restaurantId) {
      router.push(`/shop/${photo.restaurantId}`);
    } else if (photo.userId) {
      router.push(`/user/${photo.userId}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!photo.id || !onDelete) return;

    showConfirm("이 사진을 정말 삭제하시겠습니까?", async () => {
      await onDelete(photo.id!);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-stone-950/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-2xl bg-black rounded-sm shadow-2xl overflow-hidden flex flex-col items-center justify-center animate-scale-in group aspect-[5/4]">
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {isMine && onDelete && !photo.isUserPhoto && (
            <button
              onClick={handleDeleteClick}
              className="p-2 bg-black/50 hover:bg-red-600 text-white rounded-full transition-all group/del"
              title="사진 삭제"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <img
            src={imgError ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" : photo.imageUrl}
            alt={photo.menuName}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />

          {!photo.isUserPhoto && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
