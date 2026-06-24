'use client';

import Link from 'next/link';
import { Heart, Store, UserRound } from 'lucide-react';
import type { TasteNoteKey, TasteNotes } from '@/app/components/RamenLogModal';
import ResilientImage from './ResilientImage';
import RamenLogImage from './RamenLogImage';

export type RamenLogItem = {
  id: number;
  author: { id: number; name: string; imageUrl?: string };
  shop: { id?: number; name: string; location?: string };
  menuName: string;
  ramenType?: string;
  imageUrl: string;
  date: string;
  note?: string;
  tasteNotes?: TasteNotes;
  revisit?: '자주 감' | '가끔 생각남' | '한번이면 충분';
  likes?: number;
  isLiked?: boolean;
  isPublic?: boolean;
};

export const tasteNoteLabels: Record<TasteNoteKey, string> = {
  broth: '국물',
  noodle: '면',
  seasoning: '간',
  topping: '토핑',
};

export const tasteNoteOrder: TasteNoteKey[] = ['broth', 'noodle', 'seasoning', 'topping'];

export const emptyTasteNotes = (): TasteNotes => ({
  broth: [],
  noodle: [],
  seasoning: [],
  topping: [],
});

export const getTasteNoteValues = (tasteNotes?: TasteNotes) =>
  tasteNoteOrder.flatMap((key) => tasteNotes?.[key] ?? []);

export const formatRamenLogDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '-';
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

export default function RamenLogCard({
  log,
  onClick,
  featured = false,
  compactMobile = false,
  featuredMobile = false,
}: {
  log: RamenLogItem;
  onClick?: (log: RamenLogItem) => void;
  featured?: boolean;
  compactMobile?: boolean;
  featuredMobile?: boolean;
}) {
  const tasteSummary = getTasteNoteValues(log.tasteNotes);
  const visibleTasteNotes = tasteSummary.slice(0, featured ? 4 : 2);
  const isCompactMobile = compactMobile && !featuredMobile;

  return (
    <article
      onClick={() => onClick?.(log)}
      className={`group isolate flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-stone-200 bg-white transition-colors hover:border-[#e60000] focus-within:border-[#e60000] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`relative w-full overflow-hidden rounded-t-md bg-stone-100 ${
        isCompactMobile
          ? featured ? 'aspect-[4/5] sm:aspect-video' : 'aspect-[4/5] sm:aspect-square'
          : featured ? 'aspect-[4/3] sm:aspect-video' : 'aspect-[4/3] sm:aspect-square'
      }`}>
        <RamenLogImage
          src={log.imageUrl}
          alt={`${log.shop.name} ${log.menuName}`}
          fill
          sizes={featured
            ? `(min-width: 1024px) 66vw, (min-width: 640px) 100vw, ${isCompactMobile ? '50vw' : '100vw'}`
            : `(min-width: 1024px) 33vw, (min-width: 640px) 50vw, ${isCompactMobile ? '50vw' : '100vw'}`}
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-[#25282b]/40" />

        <div className={`absolute flex items-center justify-between gap-1.5 sm:left-4 sm:right-4 sm:top-4 ${
          isCompactMobile ? 'left-2 right-2 top-2' : 'left-3 right-3 top-3'
        }`}>
          <span className={`rounded-full bg-[#25282b]/70 font-bold text-white/90 sm:px-2.5 sm:py-1 sm:text-xs ${
            isCompactMobile ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
          }`}>
            {formatRamenLogDate(log.date)}
          </span>
          <span className={`flex items-center gap-1 rounded-full bg-[#25282b]/70 font-bold text-white sm:px-2.5 sm:py-1 sm:text-xs ${
            isCompactMobile ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
          }`}>
            <Heart className={`h-3 w-3 ${log.isLiked ? 'fill-current text-[#e60000]' : ''}`} />
            {log.likes ?? 0}
          </span>
        </div>

        <div className={`absolute inset-x-0 bottom-0 text-white ${
          isCompactMobile ? 'p-3' : 'p-4'
        } ${featured ? 'sm:p-7' : 'sm:p-5'}`}>
          <div className={`flex min-w-0 items-center gap-1.5 ${isCompactMobile ? 'mb-1' : 'mb-1.5'}`}>
            {log.shop.id ? (
              <Link
                href={`/shop/${log.shop.id}`}
                className="group/shop flex min-w-0 items-center gap-1.5 text-white/80 hover:text-white"
                onClick={(event) => event.stopPropagation()}
              >
                <Store className={`${isCompactMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} shrink-0 sm:h-3.5 sm:w-3.5`} />
                <span className={`truncate font-bold sm:text-sm ${isCompactMobile ? 'text-[10px]' : 'text-xs'}`}>
                  {log.shop.name}
                </span>
              </Link>
            ) : (
              <span className="flex min-w-0 items-center gap-1.5 text-white/80">
                <Store className={`${isCompactMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} shrink-0 sm:h-3.5 sm:w-3.5`} />
                <span className={`truncate font-bold sm:text-sm ${isCompactMobile ? 'text-[10px]' : 'text-xs'}`}>{log.shop.name}</span>
              </span>
            )}
          </div>
          <h2 className={`line-clamp-2 font-bold tracking-[-0.02em] ${
            isCompactMobile ? 'text-base leading-tight' : featured ? 'text-2xl leading-tight' : 'text-xl leading-tight'
          } ${featured ? 'sm:text-4xl' : 'sm:text-2xl'}`}>
            {log.menuName}
          </h2>
          {log.shop.location && (
            <p className={`mt-1 truncate text-[11px] font-bold text-white/65 sm:block sm:text-xs ${isCompactMobile ? 'hidden' : ''}`}>{log.shop.location}</p>
          )}
        </div>
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${
        isCompactMobile ? 'p-3' : 'p-4'
      } ${featured ? 'sm:p-6' : 'sm:p-5'}`}>
        {log.note && (
          <p className={`font-normal text-[#7e7e7e] ${isCompactMobile ? 'hidden sm:block' : ''} ${featured ? 'line-clamp-2 text-sm leading-6 sm:text-base sm:leading-7' : 'line-clamp-2 text-sm leading-6'}`}>
            {log.note}
          </p>
        )}

        {visibleTasteNotes.length > 0 && (
          <div className={`mt-3 min-w-0 flex-wrap items-center gap-1.5 ${isCompactMobile ? 'hidden sm:flex' : 'flex'}`}>
            {visibleTasteNotes.map((note) => (
              <span key={note} className="max-w-28 truncate rounded-full bg-[#f2f2f2] px-2.5 py-1 text-[10px] font-bold text-[#25282b] sm:text-xs">
                {note}
              </span>
            ))}
            {tasteSummary.length > visibleTasteNotes.length && (
              <span className="text-[10px] font-semibold text-[#7e7e7e] sm:text-xs">+{tasteSummary.length - visibleTasteNotes.length}</span>
            )}
          </div>
        )}

        <div className={`mt-auto flex items-center justify-between ${isCompactMobile ? 'pt-0 sm:pt-4' : 'pt-4'}`}>
          <Link
            href={`/user/${log.author.id}`}
            className="flex min-w-0 items-center gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 sm:h-7 sm:w-7">
              {log.author.imageUrl ? (
                <ResilientImage
                  src={log.author.imageUrl}
                  alt={log.author.name}
                  width={28}
                  height={28}
                  sizes="28px"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-3 w-3 text-stone-400 sm:h-3.5 sm:w-3.5" />
              )}
            </span>
            <span className="truncate text-[11px] font-semibold text-[#7e7e7e] sm:text-xs">{log.author.name}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
