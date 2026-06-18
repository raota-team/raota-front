'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Store, UserRound } from 'lucide-react';
import type { TasteNoteKey, TasteNotes } from '@/app/components/RamenLogModal';

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
}: {
  log: RamenLogItem;
  onClick?: (log: RamenLogItem) => void;
}) {
  const tasteSummary = getTasteNoteValues(log.tasteNotes);
  const visibleTasteNotes = tasteSummary.slice(0, 3);
  const mobileTasteNotes = tasteSummary.slice(0, 2);

  return (
    <article
      onClick={() => onClick?.(log)}
      className={`group flex min-h-44 overflow-hidden rounded-md border border-stone-200 bg-white transition-colors hover:border-[#e60000] sm:h-full sm:min-h-0 sm:flex-col ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="relative w-32 shrink-0 self-stretch overflow-hidden bg-stone-100 sm:aspect-video sm:w-full sm:self-auto">
        <Image
          src={log.imageUrl}
          alt={`${log.shop.name} ${log.menuName}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 128px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3 sm:gap-3">
          <div className="min-w-0">
            {log.shop.id ? (
              <Link
                href={`/shop/${log.shop.id}`}
                className="group/shop flex min-w-0 items-center gap-1.5"
                onClick={(event) => event.stopPropagation()}
              >
                <Store className="h-3.5 w-3.5 shrink-0 text-stone-400 group-hover/shop:text-[#e60000]" />
                <span className="truncate text-xs font-black text-stone-500 group-hover/shop:text-[#e60000]">
                  {log.shop.name}
                </span>
              </Link>
            ) : (
              <span className="flex min-w-0 items-center gap-1.5">
                <Store className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                <span className="truncate text-xs font-black text-stone-500">{log.shop.name}</span>
              </span>
            )}
            <h2 className="mt-1 line-clamp-2 text-base font-black leading-5 text-[#25282b] sm:mt-1.5 sm:text-xl sm:leading-7">
              {log.menuName}
            </h2>
            {log.shop.location && (
              <p className="mt-0.5 truncate text-[11px] font-bold text-stone-400 sm:mt-1 sm:text-xs">{log.shop.location}</p>
            )}
          </div>
          <span className="hidden shrink-0 text-xs font-bold text-stone-400 sm:block">
            {formatRamenLogDate(log.date)}
          </span>
        </div>

        {log.note && (
          <p className="hidden line-clamp-2 min-h-12 text-sm font-medium leading-6 text-stone-600 sm:block">{log.note}</p>
        )}

        {mobileTasteNotes.length > 0 && (
          <div className="mt-1.5 flex min-w-0 items-center gap-1 sm:hidden">
            {mobileTasteNotes.map((note) => (
              <span key={note} className="max-w-20 truncate rounded-full bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-600">
                {note}
              </span>
            ))}
            {tasteSummary.length > 2 && (
              <span className="shrink-0 text-[10px] font-black text-stone-400">+{tasteSummary.length - 2}</span>
            )}
          </div>
        )}

        {visibleTasteNotes.length > 0 && (
          <div className="mt-4 hidden flex-wrap items-center gap-1.5 sm:flex">
            {visibleTasteNotes.map((note) => (
              <span key={note} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-600">
                {note}
              </span>
            ))}
            {tasteSummary.length > 3 && (
              <span className="text-xs font-black text-stone-400">+{tasteSummary.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2.5 sm:pt-5">
          <Link
            href={`/user/${log.author.id}`}
            className="flex min-w-0 items-center gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 sm:h-7 sm:w-7">
              {log.author.imageUrl ? (
                <Image src={log.author.imageUrl} alt={log.author.name} width={28} height={28} className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-3 w-3 text-stone-400 sm:h-3.5 sm:w-3.5" />
              )}
            </span>
            <span className="truncate text-[11px] font-black text-stone-500 sm:text-xs">{log.author.name}</span>
          </Link>

          <span className="flex shrink-0 items-center gap-1 text-[11px] font-black text-stone-400 sm:text-xs">
            <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${log.isLiked ? 'fill-current text-[#e60000]' : ''}`} />
            {log.likes ?? 0}
          </span>
        </div>
      </div>
    </article>
  );
}
