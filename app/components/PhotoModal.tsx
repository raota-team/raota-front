'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, MapPin, Calendar, Flame, ThumbsUp, CircleCheck, Heart, MessageCircle } from 'lucide-react';
import { RAMEN_LOG_FALLBACK_IMAGE, isRamenLogFallbackImage } from '@/lib/constants/images';
import type { RamenLogComment, RamenLogScores } from '@/lib/api/ramen-logs';

interface Photo {
  id?: number;
  imageUrl: string | null;
  /** 라멘로그 사진(최대 3장). 2장 이상이면 썸네일로 넘겨 본다 */
  imageUrls?: string[];
  menuName: string;
  user?: string;           // 업로더 닉네임
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
  scores?: RamenLogScores | null;
  likes?: number;
  commentCount?: number;
  comments?: RamenLogComment[];
}

interface PhotoModalProps {
  photo: Photo | null;
  onClose: () => void;
}

/** 앱 라운지의 맛 평가 다섯 줄과 같은 이름과 말 */
const SCORE_ROWS: Array<{ key: Exclude<keyof RamenLogScores, 'revisit'>; label: string; words: string[] }> = [
  { key: 'satisfaction', label: '전체 만족도', words: ['아쉬웠어요', '그저 그랬어요', '괜찮았어요', '맛있었어요', '인생 라멘이에요'] },
  { key: 'brothDensity', label: '육수 농도', words: ['아주 맑음', '맑은 편', '중간', '진한 편', '아주 진함'] },
  { key: 'noodleFirmness', label: '면 삶기', words: ['아주 부드럽게', '부드러운 편', '중간', '단단한 편', '아주 단단하게'] },
  { key: 'topping', label: '토핑', words: ['아쉬움', '조금 아쉬움', '보통', '좋음', '훌륭함'] },
];

const tasteGroupMeta: Record<string, { icon: string }> = {
  국물: { icon: '🍜' },
  면: { icon: '🥢' },
  간: { icon: '🧂' },
  토핑: { icon: '🥚' },
};

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose }) => {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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
    setActiveImageIndex(0);
    setImgError(false);
  }, [photo?.id]);

  if (!photo) return null;

  const handleRestaurantClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photo.isUserPhoto || !photo.restaurantId) return;

    onClose();
    router.push(`/shop/${photo.restaurantId}`);
  };

  const imageUrls = photo.imageUrls?.length ? photo.imageUrls : [photo.imageUrl];
  const activeImageUrl = imageUrls[activeImageIndex] ?? imageUrls[0];
  const hasComment = Boolean(photo.comment?.trim());
  const showFallbackImage = imgError || isRamenLogFallbackImage(activeImageUrl);
  const hasDetails = !photo.isUserPhoto && Boolean(
    photo.restaurantName || photo.user || hasComment || photo.tasteNotes?.length,
  );
  const commentCount = photo.commentCount ?? 0;
  const previewComments = photo.comments ?? [];

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
            src={showFallbackImage ? RAMEN_LOG_FALLBACK_IMAGE : activeImageUrl!}
            alt={photo.menuName}
            className={`h-full w-full ${showFallbackImage ? "bg-[#f2f2f2] object-contain p-[18%]" : "object-cover"}`}
            onError={() => setImgError(true)}
          />
          {imageUrls.length > 1 && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
              {imageUrls.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setImgError(false);
                    setActiveImageIndex(index);
                  }}
                  aria-label={`${index + 1}번째 사진 보기`}
                  aria-pressed={index === activeImageIndex}
                  className={`h-12 w-12 overflow-hidden rounded-sm ring-2 transition-opacity ${
                    index === activeImageIndex ? 'ring-white' : 'opacity-70 ring-transparent hover:opacity-100'
                  }`}
                >
                  <img src={url ?? RAMEN_LOG_FALLBACK_IMAGE} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
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
                    className="flex items-center gap-1.5 hover:text-[#e60000]"
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

              {(photo.user || photo.likes !== undefined) && (
                <div className="mt-3 flex min-w-0 items-center justify-between gap-3 border-t border-stone-100 pt-3 md:-mr-10">
                  {photo.user ? (
                    <span className="flex min-w-0 items-center gap-2 text-sm font-black text-stone-600">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                        {photo.userImageUrl ? (
                          <img src={photo.userImageUrl} alt={photo.user} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-stone-500" />
                        )}
                      </span>
                      <span className="truncate">{photo.user}</span>
                    </span>
                  ) : (
                    <span />
                  )}

                  {photo.likes !== undefined && (
                    <span className="inline-flex shrink-0 items-center gap-3 text-xs font-bold text-stone-500">
                      <span className="inline-flex items-center gap-1" aria-label={`공감 ${photo.likes}개`}>
                        <Heart className="h-3.5 w-3.5" />
                        {photo.likes}
                      </span>
                      <span className="inline-flex items-center gap-1" aria-label={`댓글 ${commentCount}개`}>
                        <MessageCircle className="h-3.5 w-3.5" />
                        {commentCount}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {hasComment && (
              <div className="mt-3 rounded-sm border border-stone-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#e60000]">이 한 그릇의 기억</p>
                <p className="mt-2 whitespace-pre-line text-sm font-medium leading-6 text-stone-700">“{photo.comment}”</p>
              </div>
            )}

            {photo.scores && (
              <div className="mt-3 rounded-sm border border-stone-200 bg-white p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-[#e60000]">맛 평가</p>
                <dl className="space-y-2">
                  {SCORE_ROWS.map(({ key, label, words }) => (
                    <div key={key} className="flex items-center justify-between gap-3 text-xs">
                      <dt className="font-bold text-stone-500">{label}</dt>
                      <dd className="font-black text-[#25282b]">
                        {words[Math.min(5, Math.max(1, Math.round(photo.scores![key]))) - 1]}
                      </dd>
                    </div>
                  ))}
                </dl>
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
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {commentCount > 0 && (
              <div className="mt-3 rounded-sm border border-stone-200 bg-white p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-[#e60000]">댓글 {commentCount}</p>
                {previewComments.length > 0 && (
                  <ul className="space-y-3">
                    {previewComments.map((comment) => (
                      <li key={comment.id} className="border-t border-stone-100 pt-3 first:border-t-0 first:pt-0">
                        <p className="text-[11px] font-black text-stone-600">{comment.author.name}</p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-stone-700">{comment.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {commentCount > previewComments.length && (
                  <p className="mt-3 text-[11px] font-bold text-stone-400">나머지 댓글은 라오타 앱에서 볼 수 있어요.</p>
                )}
              </div>
            )}

            {photo.likes !== undefined && (
              <p className="mt-3 px-1 text-[11px] font-bold text-stone-400">좋아요·댓글은 라오타 앱에서 남길 수 있어요.</p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default PhotoModal;
