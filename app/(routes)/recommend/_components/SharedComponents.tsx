import React, { type ReactNode, useState } from "react";
import Image from "next/image";
import { UtensilsCrossed, MapPin, Bookmark, Map } from "lucide-react";
import type { Shop } from "@/app/types";
import { getKakaoMapSearchUrl } from "../utils";

export function QuestionCard({
  step,
  title,
  children,
}: {
  step?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-stone-200 bg-white p-4">
      <div className="mb-4 flex items-start gap-3">
        {step && (
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-[#e60000] px-2 text-[11px] font-extrabold tracking-[0.12em] text-[#e60000]">
            {step}
          </span>
        )}
        <h3 className="pt-1 text-sm font-bold leading-6 text-[#25282b]">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function PromptField({
  label,
  value,
  onChange,
  placeholder,
  examples,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  examples: string[];
}) {
  return (
    <div className="space-y-3">
      <label className="block text-[12px] font-bold tracking-widest text-[#7e7e7e]">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-[2px] border border-stone-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-[#25282b] outline-none transition-colors placeholder:text-[#bebebe] focus:border-[#e60000]"
      />
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onChange(example)}
            className="rounded-[2px] border border-stone-200 bg-[#f7f7f7] px-3 py-2 text-xs font-bold text-[#25282b] transition-colors hover:border-[#e60000] hover:text-[#e60000]"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FocusCard({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="border border-stone-200 bg-[#f7f7f7] p-5 sm:p-6">
      <p className="text-[12px] font-extrabold tracking-[0.18em] text-[#e60000]">{label}</p>
      <h5 className="mt-2 text-xl font-extrabold text-[#25282b]">{title}</h5>
      <p className="mt-2 text-sm font-medium leading-relaxed text-[#7e7e7e] sm:text-base">
        {body}
      </p>
    </div>
  );
}

export function CompareShopCard({ shop, label, accent }: { shop: Shop; label: string; accent: string }) {
  const [isBookmarked, setIsBookmarked] = useState(shop.isBookmarked);
  
  const primaryMenu = shop.menu_list.find((menu) => menu.is_signature)?.name ||
  shop.menus[0]?.name ||
  "대표 메뉴 정보 없음";

  return (
    <article className="bg-white p-4 sm:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-sm text-sm font-black text-white" style={{ backgroundColor: accent }}>
          {label}
        </span>
        <div className="flex items-center gap-1">
          <a
            href={getKakaoMapSearchUrl(`${shop.location} ${shop.name}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-50 text-[#7e7e7e] transition-colors hover:bg-stone-100 hover:text-[#25282b]"
            aria-label="길찾기"
          >
            <Map className="h-4 w-4" />
          </a>
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-50 text-[#7e7e7e] transition-colors hover:bg-stone-100 hover:text-[#e60000]"
            aria-label="북마크"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-[#e60000] text-[#e60000]" : ""}`} />
          </button>
        </div>
      </div>
      <h4 className="mt-3 truncate text-xl font-extrabold text-[#25282b] sm:text-2xl">{shop.name}</h4>
      <div className="mt-4 hidden aspect-[2/1] relative overflow-hidden rounded-[6px] bg-stone-100 sm:block">
        <Image src={shop.imageUrl} alt={shop.name} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
      </div>
      <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3 flex-1">
        <div className="flex items-center gap-3 text-sm font-medium text-[#7e7e7e]">
          <UtensilsCrossed className="h-4 w-4 text-[#e60000]" />
          <span className="truncate">{primaryMenu}</span>
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-[#7e7e7e]">
          <MapPin className="h-4 w-4 text-[#e60000]" />
          <span className="truncate">{shop.location}</span>
        </div>
        <p className="line-clamp-2 text-sm font-medium leading-relaxed text-[#7e7e7e] sm:hidden">{shop.description}</p>
      </div>
    </article>
  );
}

export function CompareIndexRow({ name, color, score }: { name: string; color: string; score: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="truncate text-[#25282b]">{name}</span>
        <span style={{ color }}>{Math.round(score)}점</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f2f2f2]">
        <div className="h-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
