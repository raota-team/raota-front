'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, MapPin, Calendar, Trash2, Flame, ThumbsUp, CircleCheck, Heart, Pencil, MoreHorizontal } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { RAMEN_LOG_FALLBACK_IMAGE, isRamenLogFallbackImage } from '@/lib/constants/images';
import { normalizeTasteNoteValue } from '@/lib/utils/ramen-log-taste-notes';

interface Photo {
  id?: number;            // 삭제를 위한 고유 ID
  imageUrl: string;
  menuName: string;
  user?: string;           // 업로더 닉네임
  userId?: number;         // 업로더 ID
  userImageUrl?: string;   // 업로더 프로필 이미지
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
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!photo) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [photo]);

  useEffect(() => {
    setIsLiked(Boolean(photo?.isLiked));
    setLikeCount(photo?.likes ?? 0);
    setIsActionMenuOpen(false);
  }, [photo?.id, photo?.isLiked, photo?.likes]);

  if (!photo) return null;

  // 본인 사진 여부 확인
  const currentUserId = currentUser?.user_id ?? currentUser?.id;
  const isMine = Boolean(currentUserId && photo.userId && Number(currentUserId) === Number(photo.userId));

  const handleRestaurantClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disableNavigation || photo.isUserPhoto || !photo.restaurantId) return;

    onClose();
    router.push(`/shop/${photo.restaurantId}`);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disableNavigation || photo.isUserPhoto || !photo.userId) return;

    onClose();
    router.push(`/user/${photo.userId}`);
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
  const showFallbackImage = imgError || isRamenLogFallbackImage(photo.imageUrl);
  const hasDetails = !photo.isUserPhoto && Boolean(
    photo.restaurantName || photo.user || hasComment || photo.tasteNotes?.length,
  );
  const canManageLog = isMine && !photo.isUserPhoto && (onEdit || onDelete);

  const tasteGroupMeta: Record<string, { icon: string }> = {
    국물: { icon: '🍜' },
    면: { icon: '🥢' },
    간: { icon: '🧂' },
    토핑: { icon: '🥚' },
  };

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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${photo.menuName} 사진 상세`}
        tabIndex={-1}
        className={`relative w-full animate-scale-in ${
          hasDetails
            ? 'max-h-[96dvh] max-w-6xl touch-pan-y overflow-y-auto overscroll-contain rounded-md bg-white ring-1 ring-white/10 outline-none focus-visible:outline-none md:grid md:max-h-[94vh] md:grid-cols-[minmax(0,1.5fr)_minmax(21rem,0.68fr)] md:overflow-hidden md:rounded-sm'
            : 'flex max-w-2xl aspect-[5/4] items-center justify-center overflow-hidden rounded-sm bg-[#25282b]'
        }`}
        style={hasDetails ? { WebkitOverflowScrolling: 'touch' } : undefined}
      >
        <div className="sticky top-3 z-20 ml-auto flex h-0 w-fit gap-1.5 pr-3 md:absolute md:right-4 md:top-4 md:h-auto md:pr-0">
          {canManageLog && (
            <div className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsActionMenuOpen((current) => !current);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-600 ring-1 ring-stone-200/70 backdrop-blur transition-colors hover:bg-white hover:text-[#25282b] sm:h-9 sm:w-9"
                aria-label="라멘로그 관리 메뉴"
                aria-expanded={isActionMenuOpen}
              >
                <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              {isActionMenuOpen && (
                <div className="absolute right-0 top-10 w-32 overflow-hidden rounded-sm border border-stone-200 bg-white py-1 text-sm font-bold text-stone-600">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsActionMenuOpen(false);
                        if (!photo.id) return;
                        onEdit(photo.id);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-stone-50 hover:text-[#25282b]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      수정하기
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(event) => {
                        setIsActionMenuOpen(false);
                        handleDeleteClick(event);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-stone-500 transition-colors hover:bg-red-50 hover:text-[#e60000]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      삭제하기
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-600 ring-1 ring-stone-200/70 backdrop-blur transition-colors hover:bg-white hover:text-[#e60000] sm:h-9 sm:w-9"
            aria-label="사진 상세 닫기"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className={`relative flex w-full items-center justify-center overflow-hidden bg-[#25282b] ${
          hasDetails ? 'aspect-[4/3] min-h-0 shrink-0 md:aspect-auto md:h-[min(96vh,44rem)]' : 'h-full'
        }`}>
          <img
            src={showFallbackImage ? RAMEN_LOG_FALLBACK_IMAGE : photo.imageUrl}
            alt={photo.menuName}
            className={`h-full w-full ${showFallbackImage ? "bg-[#f2f2f2] object-contain p-[18%]" : "object-cover"}`}
            onError={() => setImgError(true)}
          />
        </div>

        {hasDetails && (
          <aside className="min-h-0 bg-stone-50 px-4 py-4 text-[#25282b] md:h-[min(94vh,44rem)] md:overflow-y-auto md:px-5 md:py-5">
            <div className="rounded-sm border border-stone-200 bg-white p-4 md:pr-12">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e60000]">Ramen log</p>
              {photo.revisit && (
                <span className={`mt-2 inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-black text-white ${
                  photo.revisit === '자주 감' ? 'bg-[#e60000]' : photo.revisit === '가끔 생각남' ? 'bg-stone-500' : 'bg-[#25282b]'
                }`}>
                  {photo.revisit === '자주 감' && <Flame className="h-3 w-3" />}
                  {photo.revisit === '가끔 생각남' && <ThumbsUp className="h-3 w-3" />}
                  {photo.revisit !== '자주 감' && photo.revisit !== '가끔 생각남' && <CircleCheck className="h-3 w-3" />}
                  {photo.revisit}
                </span>
              )}
              <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.02em] text-[#25282b]">
                {photo.menuName}
              </h2>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-bold text-stone-500">
                {photo.restaurantName && (
                  <button
                    onClick={handleRestaurantClick}
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
                <div className="mt-3 flex min-w-0 items-center justify-between gap-3 border-t border-stone-100 pt-3 md:-mr-10">
                  {photo.user ? (
                    <button
                      onClick={handleUserClick}
                      disabled={disableNavigation}
                      className={`flex min-w-0 items-center gap-2 text-sm font-black text-stone-600 ${
                        !disableNavigation ? 'hover:text-[#e60000]' : ''
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                        {photo.userImageUrl ? (
                          <img src={photo.userImageUrl} alt={photo.user} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-stone-500" />
                        )}
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
                      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-bold transition-colors ${
                        isLiked
                          ? 'border-red-100 bg-red-50 text-[#e60000]'
                          : 'border-stone-200 bg-stone-50 text-stone-400 hover:border-red-100 hover:bg-red-50 hover:text-[#e60000]'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likeCount}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {hasComment && (
              <div className="mt-3 rounded-sm border border-stone-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#e60000]">이 한 그릇의 기억</p>
                <p className="mt-2 text-sm font-medium leading-6 text-stone-700">“{photo.comment}”</p>
              </div>
            )}

            {photo.tasteNotes && photo.tasteNotes.length > 0 && (
              <div className="mt-3 space-y-2 rounded-sm border border-stone-200 bg-white p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-[#e60000]">취향 기록</p>
                {photo.tasteNotes.map((group) => (
                  <div key={group.label} className="flex gap-2 border-t border-stone-100 py-2.5 first:border-t-0 first:pt-0 last:pb-0">
                    <p className="flex w-12 shrink-0 items-center gap-1.5 text-[11px] font-black text-[#25282b]">
                      <span aria-hidden="true">{tasteGroupMeta[group.label]?.icon}</span>
                      {group.label}
                    </p>
                    <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                      {group.values.map((value) => (
                        <span
                          key={value}
                          className="rounded-full bg-stone-50 px-2.5 py-1 text-[11px] font-bold text-stone-600 ring-1 ring-stone-200"
                        >
                          {normalizeTasteNoteValue(value)}
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
