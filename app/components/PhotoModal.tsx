'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, MapPin, Calendar, Trash2, Flame, ThumbsUp, CircleCheck, Heart, Pencil } from 'lucide-react';
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
  revisit?: string;        // 재방문 의사 (자주 감, 가끔 생각남, 한번이면 충분)
  tasteNotes?: Array<{
    label: string;
    values: string[];
  }>;
  likes?: number;
  isLiked?: boolean;
}

interface PhotoModalProps {
  photo: Photo | null;
  onClose: () => void;
  onDelete?: (photoId: number) => Promise<void>; // 삭제 콜백 추가
  onEdit?: (photoId: number) => void;
  disableNavigation?: boolean;
  onLikeChange?: (photoId: number, likes: number, isLiked: boolean) => void | Promise<void>;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose, onDelete, onEdit, disableNavigation = false, onLikeChange }) => {
  const router = useRouter();
  const { currentUser, showConfirm } = useApp();
  const [imgError, setImgError] = useState(false);
  const [isLiked, setIsLiked] = useState(Boolean(photo?.isLiked));
  const [likeCount, setLikeCount] = useState(photo?.likes ?? 0);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!photo) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [photo]);

  useEffect(() => {
    setIsLiked(Boolean(photo?.isLiked));
    setLikeCount(photo?.likes ?? 0);
  }, [photo?.id, photo?.isLiked, photo?.likes]);

  if (!photo) return null;

  // 본인 사진 여부 확인
  const currentUserId = currentUser?.user_id ?? currentUser?.id;
  const isMine = Boolean(currentUserId && photo.userId && Number(currentUserId) === Number(photo.userId));

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

    showConfirm("이 라멘로그를 삭제하시겠습니까?\n삭제한 기록은 되돌릴 수 없습니다.", async () => {
      await onDelete(photo.id!);
      onClose();
    });
  };

  const hasComment = Boolean(photo.comment?.trim());
  const hasDetails = !photo.isUserPhoto && Boolean(
    photo.restaurantName || photo.user || hasComment || photo.tasteNotes?.length,
  );

  const handleLikeClick = async () => {
    const nextIsLiked = !isLiked;
    const nextLikeCount = Math.max(0, likeCount + (nextIsLiked ? 1 : -1));
    setIsLiked(nextIsLiked);
    setLikeCount(nextLikeCount);
    if (!photo.id || !onLikeChange) return;

    try {
      await onLikeChange(photo.id, nextLikeCount, nextIsLiked);
    } catch {
      setIsLiked(isLiked);
      setLikeCount(likeCount);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-stone-950/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${photo.menuName} 사진 상세`}
        className={`relative w-full animate-scale-in ${
          hasDetails
            ? 'max-h-[92dvh] max-w-5xl touch-pan-y overflow-y-auto overscroll-contain rounded-md bg-white md:grid md:max-h-[92vh] md:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)] md:overflow-hidden md:rounded-sm'
            : 'flex max-w-2xl aspect-[5/4] items-center justify-center overflow-hidden rounded-sm bg-black'
        }`}
        style={hasDetails ? { WebkitOverflowScrolling: 'touch' } : undefined}
      >
        <div className="sticky top-3 z-20 ml-auto flex h-0 w-fit gap-2 pr-3 md:absolute md:right-4 md:top-4 md:h-auto md:pr-0">
          {isMine && onEdit && !photo.isUserPhoto && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                if (!photo.id) return;
                onEdit(photo.id);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-[#e60000] sm:h-10 sm:w-10"
              title="라멘로그 수정"
            >
              <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
          {isMine && onDelete && !photo.isUserPhoto && (
            <button
              onClick={handleDeleteClick}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-[#e60000] sm:h-10 sm:w-10"
              title="사진 삭제"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-[#e60000] sm:h-10 sm:w-10"
            aria-label="사진 상세 닫기"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className={`relative flex w-full items-center justify-center overflow-hidden bg-[#25282b] ${
          hasDetails ? 'aspect-[4/3] min-h-0 shrink-0 md:aspect-auto md:h-[min(92vh,48rem)]' : 'h-full'
        }`}>
          <img
            src={imgError ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" : photo.imageUrl}
            alt={photo.menuName}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>

        {hasDetails && (
          <aside className="min-h-0 bg-white px-4 py-5 text-[#25282b] md:h-[min(92vh,48rem)] md:overflow-y-auto md:px-6 md:py-7">
            <div className="border-b border-stone-200 pb-4 sm:pb-5 md:pr-12">
              {photo.revisit && (
                <span className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-black text-white ${
                  photo.revisit === '자주 감' ? 'bg-[#e60000]' : photo.revisit === '가끔 생각남' ? 'bg-stone-500' : 'bg-[#25282b]'
                }`}>
                  {photo.revisit === '자주 감' && <Flame className="h-3 w-3" />}
                  {photo.revisit === '가끔 생각남' && <ThumbsUp className="h-3 w-3" />}
                  {photo.revisit !== '자주 감' && photo.revisit !== '가끔 생각남' && <CircleCheck className="h-3 w-3" />}
                  {photo.revisit}
                </span>
              )}
              <h2 className="mt-3 text-xl font-black leading-tight text-[#25282b] sm:text-2xl">
                {photo.restaurantName || photo.menuName}
              </h2>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-stone-500">
                {photo.restaurantName && (
                  <button
                    onClick={handleInfoClick}
                    disabled={disableNavigation}
                    className={`flex items-center gap-1.5 ${!disableNavigation ? 'hover:text-[#e60000]' : ''}`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {photo.restaurantName}
                  </button>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {photo.date}
                </span>
              </div>

              {(photo.user || onLikeChange) && (
                <div className="mt-3 flex min-w-0 items-center justify-between gap-3 sm:mt-4 md:-mr-10">
                  {photo.user ? (
                    <button
                      onClick={handleInfoClick}
                      disabled={disableNavigation}
                      className={`flex min-w-0 items-center gap-2 text-sm font-black text-stone-600 ${
                        !disableNavigation ? 'hover:text-[#e60000]' : ''
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100">
                        <User className="h-4 w-4 text-stone-500" />
                      </span>
                      <span className="truncate">{photo.user}</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  {onLikeChange && (
                    <button
                      type="button"
                      onClick={handleLikeClick}
                      aria-pressed={isLiked}
                      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-black transition-colors ${
                        isLiked
                          ? 'border-[#e60000] bg-[#e60000] text-white'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-[#e60000] hover:text-[#e60000]'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span className={isLiked ? 'text-white/80' : 'text-stone-400'}>{likeCount}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {hasComment && (
              <div className="border-b border-stone-200 py-4 sm:py-5">
                <p className="text-xs font-black uppercase text-stone-400">기억해둘 점</p>
                <p className="mt-2 text-sm font-medium leading-6 text-stone-700 sm:text-base sm:leading-7">{photo.comment}</p>
              </div>
            )}

            {photo.tasteNotes && photo.tasteNotes.length > 0 && (
              <div className="space-y-4 py-4 sm:py-5">
                <p className="text-xs font-black uppercase text-stone-400">취향 기록</p>
                {photo.tasteNotes.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-sm font-black text-[#25282b]">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((value) => (
                        <span key={value} className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default PhotoModal;
