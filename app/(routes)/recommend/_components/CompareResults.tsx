import React from "react";
import { CompareShopCard, CompareIndexRow, FocusCard } from "./SharedComponents";
import { AIFollowUpChat } from "./AIFollowUpChat";
import { compareAxes } from "../constants";
import { shareResult } from "../utils";
import { Share2 } from "lucide-react";
import type { Shop } from "@/app/types";

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

export function CompareResults({
  primaryShop,
  secondaryShop,
  focus,
}: {
  primaryShop: Shop;
  secondaryShop: Shop;
  focus: string;
}) {
  const primaryScores = buildCompareScores(primaryShop);
  const secondaryScores = buildCompareScores(secondaryShop);
  const compareNarratives = buildCompareNarratives(primaryShop, secondaryShop);
  
  const primaryPolygon = primaryScores
    .map((value, index) => {
      const point = polarPoint(index, compareAxes.length, value * 0.52);
      return `${point.x},${point.y}`;
    })
    .join(" ");
  const secondaryPolygon = secondaryScores
    .map((value, index) => {
      const point = polarPoint(index, compareAxes.length, value * 0.52);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    shareResult(`라오타 AI 매장 비교 - ${primaryShop.name} vs ${secondaryShop.name}`, `${primaryShop.name}와 ${secondaryShop.name}의 비교 분석 결과입니다.`, url);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {focus && (
        <FocusCard
          label="추가 비교 관점"
          title={focus}
          body="아래 비교는 이 질문을 우선해서 해석한 예시입니다. 실제 AI 결과에서는 해당 관점에 맞춰 더 구체적인 판단 근거를 함께 제공합니다."
        />
      )}

      {/* Visual Comparison */}
      <div className="grid gap-px overflow-hidden border border-stone-200 bg-stone-200 lg:grid-cols-2">
        <CompareShopCard shop={primaryShop} label="A" accent="#e60000" />
        <CompareShopCard shop={secondaryShop} label="B" accent="#25282b" />
      </div>

      {/* Radar Chart Section */}
      <div className="border border-stone-200 bg-white p-5 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-center">
          <div className="flex justify-center">
            <svg viewBox="0 0 160 160" className="h-52 w-52 sm:h-72 sm:w-72 lg:h-80 lg:w-80" aria-label="매장 비교 레이더 차트">
              {[24, 42, 60, 78, 96].map((radius) => {
                const gridPoints = compareAxes
                  .map((_, index) => {
                    const point = polarPoint(index, compareAxes.length, radius * 0.52);
                    return `${point.x},${point.y}`;
                  })
                  .join(" ");
                return <polygon key={radius} points={gridPoints} fill="none" stroke="#f2f2f2" strokeWidth="1" />;
              })}

              {compareAxes.map((label, index) => {
                const point = polarPoint(index, compareAxes.length, 60);
                const outer = polarPoint(index, compareAxes.length, 58);
                return (
                  <g key={label}>
                    <line x1={80} y1={80} x2={outer.x} y2={outer.y} stroke="#f2f2f2" strokeWidth="1" />
                    <text x={point.x} y={point.y} textAnchor="middle" dominantBaseline="middle" fill="#7e7e7e" fontSize="8" fontWeight="700">
                      {label}
                    </text>
                  </g>
                );
              })}

              <polygon points={secondaryPolygon} fill="rgba(37,40,43,0.1)" stroke="#25282b" strokeWidth="2.5" />
              <polygon points={primaryPolygon} fill="rgba(230,0,0,0.1)" stroke="#e60000" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h5 className="text-xs font-extrabold tracking-[0.2em] text-[#e60000]">비교 지표</h5>
              <div className="space-y-3">
                <CompareIndexRow name={primaryShop.name} color="#e60000" score={primaryScores.reduce((a, b) => a + b, 0) / 6} />
                <CompareIndexRow name={secondaryShop.name} color="#25282b" score={secondaryScores.reduce((a, b) => a + b, 0) / 6} />
              </div>
            </div>
            
            <p className="text-sm font-medium leading-relaxed text-[#7e7e7e]">
              커뮤니티 반응과 방문 흐름을 기준으로 비교한 요약 지표입니다.
            </p>
          </div>
        </div>
      </div>

      {/* Narrative Analysis */}
      <div className="space-y-4">
        <h5 className="text-sm font-extrabold tracking-[0.15em] text-[#25282b]">상세 비교</h5>
        <div className="grid gap-4 sm:grid-cols-2">
          {compareNarratives.map((item) => (
            <article key={item.title} className="border border-stone-200 bg-white p-5">
              <p className="text-[12px] font-extrabold uppercase tracking-widest text-[#e60000]">{item.title}</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[#25282b]">{item.body}</p>
            </article>
          ))}
        </div>
      </div>

      <AIFollowUpChat contextLabel={`${primaryShop.name} vs ${secondaryShop.name}`} />

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
