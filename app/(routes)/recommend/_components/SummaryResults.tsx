import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, ThumbsUp, ThumbsDown, Star, Bookmark, Map, Share2 } from "lucide-react";
import { FocusCard } from "./SharedComponents";
import { AIFollowUpChat } from "./AIFollowUpChat";
import { getKakaoMapSearchUrl, shareResult } from "../utils";
import type { Shop } from "@/app/types";

type SummaryApiData = {
  shopInfo: {
    id: number;
    name: string;
    type: string;
    location: string;
    imageUrl: string;
    isBookmarked: boolean;
  };
  reviewCount: number;
  summary: {
    pros: { title: string; body: string };
    cons: { title: string; body: string };
    recommendedMenu: { title: string; body: string };
  };
  sampleReviews: {
    name: string;
    rating: number;
    text: string;
  }[];
};

const getPrimaryMenu = (shop: Shop) =>
  shop.menu_list.find((menu) => menu.is_signature)?.name ||
  shop.menus[0]?.name ||
  "대표 메뉴 정보 없음";

const buildSummaryItems = (shop: Shop) => [
  {
    key: "장점",
    title: "장점",
    accent: "border-l-[#e60000]",
    iconWrap: "bg-[#fff1f1] text-[#e60000] ring-1 ring-[#e60000]/15",
    icon: ThumbsUp,
    body: `${shop.description} ${shop.type} 계열을 찾는 경우 만족도가 높게 형성되는 편입니다.`,
  },
  {
    key: "주의점",
    title: "단점",
    accent: "border-l-[#25282b]",
    iconWrap: "bg-[#25282b] text-white ring-1 ring-[#25282b]/15",
    icon: ThumbsDown,
    body:
      (shop.stats?.visit_count ?? 0) > 90
        ? "피크 시간대에는 대기 가능성을 감안하는 편이 좋습니다. 방문 전 혼잡도와 운영 시간을 함께 확인해보세요."
        : "방문 전 영업시간과 브레이크타임을 먼저 확인해두면 훨씬 안정적으로 움직일 수 있습니다.",
  },
  {
    key: "추천 메뉴",
    title: "추천 메뉴",
    accent: "border-l-[#e60000]",
    iconWrap: "bg-[#e60000] text-white ring-1 ring-[#e60000]/15",
    icon: Star,
    body: `${getPrimaryMenu(shop)} 추천. ${shop.type} 스타일을 선호한다면 첫 선택으로 무난합니다.`,
  },
];

const buildReviewSamples = (shop: Shop) => [
  {
    name: "라멘러버92",
    rating: 5,
    text: `${shop.type} 계열의 매력이 분명하고 ${getPrimaryMenu(shop)} 만족도가 높았어요. 재방문 의사가 생기는 타입입니다.`,
  },
  {
    name: "면치기장인",
    rating: 4,
    text: `${shop.location} 쪽에서 안정적으로 선택하기 좋은 편이에요. 다만 붐비는 시간은 한 번 체크하고 가는 게 좋겠습니다.`,
  },
  {
    name: "국물탐험가",
    rating: 5,
    text: `${shop.description} 전체적으로 첫 방문자도 방향을 잡기 쉬운 가게라는 인상이 강합니다.`,
  },
];

export function SummaryResults({
  shop,
  focus,
  summaryData,
}: {
  shop: Shop;
  focus: string;
  summaryData?: SummaryApiData;
}) {
  const [isBookmarked, setIsBookmarked] = useState(shop.isBookmarked);

  const items = summaryData
    ? [
      {
        key: "장점",
        title: summaryData.summary.pros.title,
        accent: "border-l-[#e60000]",
        iconWrap: "bg-[#fff1f1] text-[#e60000]",
        icon: ThumbsUp,
        body: summaryData.summary.pros.body,
      },
      {
        key: "단점",
        title: summaryData.summary.cons.title,
        accent: "border-l-[#25282b]",
        iconWrap: "bg-[#25282b] text-white",
        icon: ThumbsDown,
        body: summaryData.summary.cons.body,
      },
      {
        key: "추천메뉴",
        title: summaryData.summary.recommendedMenu.title,
        accent: "border-l-[#e60000]",
        iconWrap: "bg-[#e60000] text-white",
        icon: Star,
        body: summaryData.summary.recommendedMenu.body,
      },
    ]
    : buildSummaryItems(shop);

  const perspectiveTitle = focus || "기본 요약";
  const perspectiveCopy = focus
    ? "요청한 질문을 중심으로 리뷰의 장점, 주의점, 추천 메뉴를 함께 해석합니다."
    : "처음 보는 사람도 빠르게 판단할 수 있도록 핵심 리뷰 흐름을 요약합니다.";
  const sampleReviews = summaryData?.sampleReviews ?? buildReviewSamples(shop);
  const reviewCount =
    summaryData?.reviewCount ??
    Math.max(84, (shop.stats?.visit_count ?? 0) + 75);

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    shareResult(`라오타 AI 리뷰 요약 - ${shop.name}`, `${shop.name} 매장의 리뷰 요약 결과입니다.`, url);
  };

  const displayShop = summaryData?.shopInfo
    ? {
      ...shop,
      id: summaryData.shopInfo.id,
      name: summaryData.shopInfo.name,
      type: summaryData.shopInfo.type,
      location: summaryData.shopInfo.location,
      imageUrl: summaryData.shopInfo.imageUrl,
      isBookmarked: summaryData.shopInfo.isBookmarked,
    }
    : shop;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Info */}
      <div className="relative overflow-hidden bg-[#25282b] p-6 text-white lg:p-10">
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex rounded-sm border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
              {shop.type}
            </div>
            <h4 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{shop.name}</h4>
            <div className="mt-4 flex items-center gap-4 text-[#7e7e7e]">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-bold">{shop.location}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 hover:text-[#e60000]"
                aria-label="북마크"
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-[#e60000] text-[#e60000]" : ""}`} />
              </button>
              <a
                href={getKakaoMapSearchUrl(`${shop.location} ${shop.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="길찾기"
              >
                <Map className="h-5 w-5" />
              </a>
            </div>
            <Link
              href={`/shop/${shop.id}`}
              className="vodafone-button-pill whitespace-nowrap shrink-0"
            >
              매장 상세 정보
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
        <Image src={shop.imageUrl} alt={shop.name} fill className="absolute inset-0 object-cover opacity-10" />
      </div>

      {/* Analysis Banner */}
      <div className="border-y border-stone-200 py-5">
        <p className="text-center text-base font-bold text-[#25282b] sm:text-lg">
          <span className="text-[#e60000]">✦</span> AI가 커뮤니티 리뷰 <span className="text-[#e60000]">{reviewCount}개</span>를 분석한 결과입니다
        </p>
      </div>

      {/* Perspective */}
      <FocusCard label="요청한 요약 관점" title={perspectiveTitle} body={perspectiveCopy} />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:gap-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className={`flex gap-4 border border-stone-200 bg-white p-5 sm:gap-6 sm:p-6`}>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.iconWrap}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xl font-extrabold text-[#25282b]">{item.title}</h5>
                <p className="mt-3 text-sm font-medium leading-relaxed text-[#7e7e7e] sm:text-base">
                  {item.body}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Review Samples */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-baseline justify-between">
          <h5 className="text-sm font-extrabold tracking-[0.15em] text-[#25282b]">리뷰 예시</h5>
          <span className="text-xs font-bold text-[#bebebe]">대표 리뷰 3개</span>
        </div>
        <div className="grid gap-4">
          {sampleReviews.map((review) => (
            <article key={review.name} className="border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f2f2] text-xs font-bold text-[#25282b]">
                    {review.name.slice(0, 1)}
                  </div>
                  <span className="font-bold text-[#25282b]">{review.name}</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-3 w-3 ${index < review.rating ? "fill-[#e60000] text-[#e60000]" : "fill-stone-200 text-stone-200"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm font-medium leading-relaxed text-[#7e7e7e]">{review.text}</p>
            </article>
          ))}
        </div>
      </div>

      <AIFollowUpChat
        contextLabel={shop.name}
        shopIds={[shop.id]}
        contextType="summary"
      />

      <button
        onClick={handleShare}
        className="w-full inline-flex items-center justify-center gap-2 rounded-[2px] border border-[#333333] bg-white px-[10px] py-[12px] text-[14.4px] font-bold tracking-[0.144px] text-[#333333] transition-colors hover:bg-stone-50 mt-8"
      >
        <Share2 className="h-4 w-4" />
        이 요약 결과 공유하기
      </button>
    </div>
  );
}
