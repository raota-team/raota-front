import React from "react";
import { CompareShopCard, FocusCard } from "./SharedComponents";
import { compareAxes } from "../constants";
import { shareResult } from "../utils";
import { Share2 } from "lucide-react";
import type { Shop } from "@/app/types";

type CompareApiData = {
  shopA: {
    id: number;
    name: string;
    scores: {
      soup: number;
      noodle: number;
      topping: number;
      mood: number;
      access: number;
      revisit: number;
    };
    totalIndex: number;
  };
  shopB: {
    id: number;
    name: string;
    scores: {
      soup: number;
      noodle: number;
      topping: number;
      mood: number;
      access: number;
      revisit: number;
    };
    totalIndex: number;
  };
  narratives: {
    title: string;
    body: string;
  }[];
};

const getPrimaryMenu = (shop: Shop) =>
  shop.menu_list.find((menu) => menu.is_signature)?.name ||
  shop.menus[0]?.name ||
  "대표 메뉴 정보 없음";

const buildCompareScores = (shop: Shop) => {
  const rating = shop.userRating || shop.editorRating || 4;
  const visitCount = shop.stats?.visit_count ?? 0;
  const visitBonus = Math.min(visitCount / 8, 12);
  const typeBias =
    shop.type === "돈코츠"
      ? 6
      : shop.type === "쇼유"
        ? 3
        : shop.type === "미소"
          ? 4
          : 2;

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  return [
    clamp(Math.round(rating * 18 + typeBias), 62, 96),
    clamp(Math.round(rating * 17 + 4), 60, 94),
    clamp(Math.round(rating * 16 + 8), 60, 94),
    clamp(Math.round(rating * 15 + 10), 58, 92),
    clamp(Math.round(64 + visitBonus), 58, 88),
    clamp(Math.round(rating * 17 + visitBonus / 2), 62, 95),
  ];
};

const buildCompareNarratives = (primaryShop: Shop, secondaryShop: Shop) => [
  {
    title: "국물 인상",
    body: `${primaryShop.name}는 ${primaryShop.type} 스타일의 존재감이 더 분명하고, ${secondaryShop.name}는 상대적으로 편하게 접근하기 좋은 흐름입니다.`,
  },
  {
    title: "추천 상황",
    body: `${primaryShop.name}는 한 그릇에 임팩트를 기대할 때 잘 맞고, ${secondaryShop.name}는 안정적으로 다시 찾기 좋은 선택지에 가깝습니다.`,
  },
  {
    title: "메뉴 선택",
    body: `${primaryShop.name}에서는 ${getPrimaryMenu(primaryShop)}부터 보는 편이 좋고, ${secondaryShop.name}는 ${getPrimaryMenu(secondaryShop)} 쪽부터 시작하는 흐름이 자연스럽습니다.`,
  },
  {
    title: "방문 판단",
    body: `${primaryShop.name}는 ${primaryShop.description} ${secondaryShop.name}는 ${secondaryShop.description}`,
  },
];

const polarPoint = (index: number, total: number, radius: number) => {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
  return {
    x: 80 + Math.cos(angle) * radius,
    y: 80 + Math.sin(angle) * radius,
  };
};

const highlightShopNames = (text: string, shopA: string, shopB: string) => {
  if (!text) return "";
  
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedA = escapeRegExp(shopA);
  const escapedB = escapeRegExp(shopB);
  
  const regex = new RegExp(`(${escapedA}|${escapedB})`, 'g');
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (part === shopA) {
      return (
        <strong key={index} className="font-extrabold text-[#e60000] bg-red-50/80 px-1 py-0.5 rounded-sm">
          {part}
        </strong>
      );
    }
    if (part === shopB) {
      return (
        <strong key={index} className="font-extrabold text-[#25282b] bg-stone-100 px-1 py-0.5 rounded-sm">
          {part}
        </strong>
      );
    }
    return part;
  });
};

export function CompareResults({
  primaryShop,
  secondaryShop,
  focus,
  compareData,
}: {
  primaryShop: Shop;
  secondaryShop: Shop;
  focus: string;
  compareData?: CompareApiData;
}) {

  const primaryScores = compareData
    ? [
      compareData.shopA.scores.soup,
      compareData.shopA.scores.noodle,
      compareData.shopA.scores.topping,
      compareData.shopA.scores.mood,
      compareData.shopA.scores.access,
      compareData.shopA.scores.revisit,
    ]
    : buildCompareScores(primaryShop);

  const secondaryScores = compareData
    ? [
      compareData.shopB.scores.soup,
      compareData.shopB.scores.noodle,
      compareData.shopB.scores.topping,
      compareData.shopB.scores.mood,
      compareData.shopB.scores.access,
      compareData.shopB.scores.revisit,
    ]
    : buildCompareScores(secondaryShop);

  const compareNarratives = compareData?.narratives ?? buildCompareNarratives(primaryShop, secondaryShop);

  const primaryTotalIndex =
    compareData?.shopA.totalIndex ?? primaryScores.reduce((a, b) => a + b, 0) / 6;

  const secondaryTotalIndex =
    compareData?.shopB.totalIndex ?? secondaryScores.reduce((a, b) => a + b, 0) / 6;

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    shareResult(`라오타 AI 매장 비교 - ${primaryShop.name} vs ${secondaryShop.name}`, `${primaryShop.name}와 ${secondaryShop.name}의 비교 분석 결과입니다.`, url);
  };

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      {focus && (
        <FocusCard
          label="추가 비교 관점"
          title={focus}
          body="아래 비교는 이 질문을 우선해서 해석한 예시입니다. 실제 AI 결과에서는 해당 관점에 맞춰 더 구체적인 판단 근거를 함께 제공합니다."
        />
      )}

      {/* Visual Comparison */}
      <div className="grid min-w-0 gap-px overflow-hidden border border-stone-200 bg-stone-200 lg:grid-cols-2">
        <CompareShopCard shop={primaryShop} label="A" accent="#e60000" />
        <CompareShopCard shop={secondaryShop} label="B" accent="#25282b" />
      </div>

      {/* Narrative Analysis */}
      <div className="space-y-4">
        <h5 className="text-sm font-extrabold tracking-[0.15em] text-[#25282b]">상세 비교</h5>
        <div className="flex flex-col gap-4">
          {compareNarratives.map((item) => (
            <article key={item.title} className="min-w-0 border border-stone-200 bg-white p-5 md:p-6">
              <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3 mb-3">
                <span className="inline-flex items-center justify-center rounded-full bg-red-50 text-[#e60000] text-[9px] font-black w-5 h-5 uppercase">VS</span>
                <h4 className="text-sm font-black text-stone-900">{item.title}</h4>
              </div>
              <p className="break-words text-sm font-medium leading-relaxed text-stone-600">
                {highlightShopNames(
                  item.body, 
                  compareData?.shopA.name ?? primaryShop.name, 
                  compareData?.shopB.name ?? secondaryShop.name
                )}
              </p>
            </article>
          ))}
        </div>
      </div>

      <button
        onClick={handleShare}
        className="w-full inline-flex items-center justify-center gap-2 rounded-[2px] border border-[#333333] bg-white px-[10px] py-[12px] text-[14.4px] font-bold tracking-[0.144px] text-[#333333] transition-colors hover:bg-stone-50 mt-8"
      >
        <Share2 className="h-4 w-4" />
        이 비교 결과 공유하기
      </button>
    </div>
  );
}
