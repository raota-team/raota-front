import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Star, ArrowRight, Bookmark } from "lucide-react";
import type { Shop } from "@/app/types";
import { FocusCard } from "./SharedComponents";

const buildMatchScore = (shop: Shop, index: number) => {
  const ratingScore = Math.round((shop.userRating || shop.editorRating || 4) * 10);
  const visitBonus = Math.min(Math.floor((shop.stats?.visit_count || 0) / 20), 8);
  return Math.min(96, Math.max(78, ratingScore + visitBonus - index * 3));
};

const buildUniqueTags = (tags: Array<string | undefined>) =>
  Array.from(new Set(tags.filter(Boolean))).slice(0, 4) as string[];

const formatRating = (rating: number) => (rating > 0 ? rating.toFixed(1) : "-");

export function TasteResults({
  shops,
  selectedSoup,
  selectedMood,
  selectedPriority,
  focus,
}: {
  shops: Shop[];
  selectedSoup: string;
  selectedMood: string;
  selectedPriority: string;
  focus?: string;
}) {
  return (
    <div className="space-y-6">
      {focus && (
        <FocusCard
          label="추가 취향 관점"
          title={focus}
          body="아래 추천은 선택한 기본 취향과 더불어 해당 요청사항을 우선해서 고려한 결과입니다."
        />
      )}
      
      <div className="space-y-3 sm:hidden">
        {shops.slice(0, 4).map((shop, index) => (
          <ShopCard key={shop.id} shop={shop} index={index} selectedTags={[selectedSoup, selectedMood, selectedPriority]} />
        ))}
      </div>

      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6">
        {shops.slice(0, 4).map((shop, index) => (
          <ShopCardDesktop key={shop.id} shop={shop} index={index} selectedTags={[selectedSoup, selectedMood, selectedPriority, shop.type]} />
        ))}
      </div>
    </div>
  );
}

function ShopCard({ shop, index, selectedTags }: { shop: Shop; index: number; selectedTags: string[] }) {
  const [isBookmarked, setIsBookmarked] = useState(shop.isBookmarked);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    setIsBookmarked(!isBookmarked);
  };

  return (
    <Link href={`/shop/${shop.id}`} className="group relative flex min-h-32 overflow-hidden rounded-[6px] bg-white border border-stone-200">
      <div className="relative min-h-32 w-32 shrink-0 overflow-hidden rounded-[6px]">
        <Image src={shop.imageUrl} alt={shop.name} fill className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" sizes="128px" />
        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-sm bg-[#e60000] px-2 py-0.5 text-[10px] font-bold text-white z-10">
          {buildMatchScore(shop, index)}%
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-block rounded-sm border border-[#e60000] px-2 py-0.5 text-[10px] font-semibold text-[#25282b] shrink-0">
                {shop.type}
              </span>
              <span className="truncate text-[11px] font-bold text-[#7e7e7e]">{shop.location}</span>
            </div>
            <button onClick={handleBookmark} className="shrink-0 p-1 -mr-1 text-[#25282b] hover:text-[#e60000] transition-colors z-20">
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-[#e60000] text-[#e60000]" : ""}`} />
            </button>
          </div>
          <h4 className="mt-1.5 line-clamp-1 text-lg font-bold leading-tight text-[#25282b] transition-colors group-hover:text-[#e60000]">
            {shop.name}
          </h4>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#7e7e7e]">{shop.description}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-stone-200 pt-2">
          {buildUniqueTags(selectedTags).map((tag) => (
            <span key={`${shop.id}-${tag}`} className="rounded-full border border-stone-200 px-2 py-0.5 text-[10px] font-bold text-[#25282b]">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function ShopCardDesktop({ shop, index, selectedTags }: { shop: Shop; index: number; selectedTags: string[] }) {
  const [isBookmarked, setIsBookmarked] = useState(shop.isBookmarked);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    setIsBookmarked(!isBookmarked);
  };

  return (
    <article className="group overflow-hidden bg-white relative transition-colors">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[6px]">
        <Image src={shop.imageUrl} alt={shop.name} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-sm bg-[#e60000] px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider z-10">
          <Sparkles className="h-3 w-3" />
          적합도 {buildMatchScore(shop, index)}%
        </div>
        <button onClick={handleBookmark} className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#25282b] shadow-sm transition-colors hover:text-[#e60000] hover:bg-white backdrop-blur-sm">
          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-[#e60000] text-[#e60000]" : ""}`} />
        </button>
      </div>
      <div className="py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#e60000] uppercase">{shop.type}</span>
              <span className="h-1 w-1 rounded-full bg-[#bebebe]" />
              <span className="text-[12px] font-bold text-[#7e7e7e]">{shop.location}</span>
            </div>
            <h4 className="mt-2 truncate text-2xl font-extrabold text-[#25282b] group-hover:text-[#e60000] transition-colors">
              {shop.name}
            </h4>
          </div>
        </div>
        <p className="mt-4 line-clamp-2 text-sm font-medium leading-relaxed text-[#7e7e7e]">
          {shop.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {buildUniqueTags(selectedTags).map((tag) => (
            <span key={`${shop.id}-${tag}`} className="rounded-full border border-stone-200 px-3 py-1 text-[12px] font-bold text-[#25282b]">
              {tag}
            </span>
          ))}
        </div>
        <Link href={`/shop/${shop.id}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#e60000] group/link before:absolute before:inset-0">
          매장 상세 보기
          <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
