"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  RotateCcw,
  Loader2,
  MessageSquareText,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Shop } from "@/app/types";
import { getRamenShopOptions } from "@/lib/api/community";

type ModeId = "taste" | "compare" | "summary";
type ShopOption = {
  id: number;
  name: string;
  region: string;
};

const modes: Array<{
  id: ModeId;
  label: string;
  title: string;
  icon: typeof Sparkles;
}> = [
  {
    id: "taste",
    label: "취향 추천",
    title: "오늘 당기는 라멘 골라드릴게요",
    icon: Sparkles,
  },
  {
    id: "compare",
    label: "매장 비교",
    title: "두 매장 차이만 쏙 보여드릴게요",
    icon: BarChart3,
  },
  {
    id: "summary",
    label: "리뷰 요약",
    title: "가기 전 포인트만 쏙 알려드릴게요",
    icon: MessageSquareText,
  },
];

const tasteOptions = {
  soup: ["돈코츠", "쇼유", "미소", "시오", "츠케멘", "탄탄멘"],
  mood: ["혼밥", "데이트", "빠른 식사", "웨이팅 감수"],
  priority: ["진한 국물", "자가제면", "차슈", "깔끔한 맛"],
};

const summaryFilters = ["전체", "장점", "주의점", "추천 메뉴"];

const fallbackShopOptions: ShopOption[] = [
  { id: 1, name: "멘야 하루", region: "서울 마포구" },
  { id: 2, name: "라멘 아오이", region: "서울 성동구" },
  { id: 3, name: "코하쿠 라멘", region: "서울 종로구" },
  { id: 4, name: "시오노미", region: "서울 용산구" },
];

const shops: Shop[] = [
  {
    id: 1,
    name: "멘야 하루",
    location: "서울 마포구",
    address: "서울 마포구",
    type: "돈코츠",
    editorRating: 4.7,
    userRating: 4.6,
    description: "진한 국물과 차슈 구성이 강점인 후보입니다.",
    imageUrl: "/hero-home.jpg",
    menus: [{ name: "특제 돈코츠 라멘", votes: 24 }],
    menu_list: [],
    event_menus: [],
    userPhotos: [],
    business_hours: {
      closed_days: "정보 없음",
      open_time: "정보 없음",
      close_time: "정보 없음",
      break_start: null,
      break_end: null,
      parking_info: "정보 없음",
    },
    stats: { visit_count: 128, bookmark_count: 0 },
    instagram_url: "",
    catchTableUrl: "",
    isBookmarked: false,
  },
  {
    id: 2,
    name: "라멘 아오이",
    location: "서울 성동구",
    address: "서울 성동구",
    type: "쇼유",
    editorRating: 4.5,
    userRating: 4.4,
    description: "깔끔한 국물과 안정적인 회전율이 장점인 후보입니다.",
    imageUrl: "/header-recommend.png",
    menus: [{ name: "아지타마 쇼유 라멘", votes: 19 }],
    menu_list: [],
    event_menus: [],
    userPhotos: [],
    business_hours: {
      closed_days: "정보 없음",
      open_time: "정보 없음",
      close_time: "정보 없음",
      break_start: null,
      break_end: null,
      parking_info: "정보 없음",
    },
    stats: { visit_count: 96, bookmark_count: 0 },
    instagram_url: "",
    catchTableUrl: "",
    isBookmarked: false,
  },
  {
    id: 3,
    name: "코하쿠 라멘",
    location: "서울 종로구",
    address: "서울 종로구",
    type: "미소",
    editorRating: 4.4,
    userRating: 4.3,
    description: "구수한 미소 베이스와 부드러운 계란 토핑이 잘 맞는 조용한 라멘집입니다.",
    imageUrl: "/header-shoplist-anime.png",
    menus: [{ name: "아지타마 미소 라멘", votes: 16 }],
    menu_list: [],
    event_menus: [],
    userPhotos: [],
    business_hours: {
      closed_days: "월요일",
      open_time: "11:30",
      close_time: "21:00",
      break_start: "15:00",
      break_end: "17:00",
      parking_info: "주차 불가",
    },
    stats: { visit_count: 84, bookmark_count: 0 },
    instagram_url: "",
    catchTableUrl: "",
    isBookmarked: false,
  },
  {
    id: 4,
    name: "시오노미",
    location: "서울 용산구",
    address: "서울 용산구",
    type: "시오",
    editorRating: 4.3,
    userRating: 4.2,
    description: "담백한 시오 국물과 가벼운 식사 흐름이 좋아 첫 방문자에게 부담이 적습니다.",
    imageUrl: "/header-community-v2.jpg",
    menus: [{ name: "특제 시오 라멘", votes: 13 }],
    menu_list: [],
    event_menus: [],
    userPhotos: [],
    business_hours: {
      closed_days: "정보 없음",
      open_time: "11:00",
      close_time: "20:30",
      break_start: null,
      break_end: null,
      parking_info: "인근 공영주차장",
    },
    stats: { visit_count: 72, bookmark_count: 0 },
    instagram_url: "",
    catchTableUrl: "",
    isBookmarked: false,
  },
];

const modeCopy: Record<ModeId, { action: string; result: string }> = {
  taste: {
    action: "AI 추천 생성",
    result: "선택한 취향을 바탕으로 지금 잘 맞는 라멘집부터 정리했어요.",
  },
  compare: {
    action: "비교 생성",
    result: "선택한 두 매장을 방문 전에 비교하기 좋게 정리했어요.",
  },
  summary: {
    action: "요약 생성",
    result: "매장 정보와 리뷰를 바탕으로 꼭 봐야 할 내용만 추렸어요.",
  },
};

const formatRating = (rating: number) => (rating > 0 ? rating.toFixed(1) : "-");

const getPrimaryMenu = (shop: Shop) =>
  shop.menu_list.find((menu) => menu.is_signature)?.name ||
  shop.menus[0]?.name ||
  "대표 메뉴 정보 없음";

const buildMatchScore = (shop: Shop, index: number) => {
  const ratingScore = Math.round((shop.userRating || shop.editorRating || 4) * 10);
  const visitBonus = Math.min(Math.floor((shop.stats?.visit_count || 0) / 20), 8);
  return Math.min(96, Math.max(78, ratingScore + visitBonus - index * 3));
};

const buildUniqueTags = (tags: Array<string | undefined>) =>
  Array.from(new Set(tags.filter(Boolean))).slice(0, 4) as string[];

const normalizeShopOption = (item: any, index: number): ShopOption => ({
  id: Number(item?.id ?? item?.restaurant_id ?? item?.ramenShopId ?? index + 1),
  name: item?.name ?? item?.restaurant_name ?? item?.restaurantName ?? "이름 미정",
  region: item?.region ?? item?.location ?? item?.address_simple ?? item?.address ?? "지역 정보 없음",
});

const buildDisplayShop = (template: Shop, option: ShopOption | null): Shop => {
  if (!option) return template;

  return {
    ...template,
    id: option.id,
    name: option.name,
    location: option.region,
    address: option.region,
  };
};

export default function RecommendPage() {
  const [activeMode, setActiveMode] = useState<ModeId>("taste");
  const [selectedSoup, setSelectedSoup] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [summaryFilter, setSummaryFilter] = useState("전체");
  const [compareShopA, setCompareShopA] = useState<ShopOption | null>(null);
  const [compareShopB, setCompareShopB] = useState<ShopOption | null>(null);
  const [summaryShop, setSummaryShop] = useState<ShopOption | null>(null);

  const activeModeConfig = modes.find((mode) => mode.id === activeMode) ?? modes[0];
  const ActiveIcon = activeModeConfig.icon;
  const filteredShops = activeMode === "taste" && selectedSoup
    ? shops.filter((shop) => shop.type.includes(selectedSoup))
    : shops;
  const displayShops = filteredShops.length > 0 ? filteredShops : shops;
  const primaryShop = activeMode === "summary"
    ? buildDisplayShop(shops[0], summaryShop)
    : buildDisplayShop(displayShops[0], compareShopA ?? fallbackShopOptions[0]);
  const secondaryShop = buildDisplayShop(displayShops[1] ?? shops[1], compareShopB ?? fallbackShopOptions[1]);
  const isTasteReady = Boolean(selectedSoup && selectedMood && selectedPriority);
  const isCompareReady = Boolean(compareShopA && compareShopB);
  const isSummaryReady = Boolean(summaryShop);
  const isCurrentModeReady =
    activeMode === "taste" ? isTasteReady : activeMode === "compare" ? isCompareReady : isSummaryReady;

  const handleModeChange = (mode: ModeId) => {
    setActiveMode(mode);
  };

  const handleReset = () => {
    if (activeMode === "taste") {
      setSelectedSoup(null);
      setSelectedMood(null);
      setSelectedPriority(null);
      return;
    }

    if (activeMode === "compare") {
      setCompareShopA(null);
      setCompareShopB(null);
      return;
    }

    setSummaryShop(null);
    setSummaryFilter("전체");
  };

  const handleGenerate = () => {
    return undefined;
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden border-b border-stone-200 bg-[#25282b]">
        <div className="absolute inset-0">
          <img src="/header-recommend.png" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#25282b]/45" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[17rem] max-w-7xl flex-col justify-center px-4 py-8 text-center text-white sm:px-6 md:min-h-[21rem] lg:px-8">
          <div>
            <h1 className="vodafone-display mb-4 text-4xl leading-none text-white sm:text-5xl md:text-7xl">RAMEN RECOMMENDATION</h1>
            <p className="mx-auto max-w-md text-base font-medium leading-relaxed text-white/85 sm:max-w-lg sm:text-lg">
              라멘 선택에 필요한 정보를 빠르게 확인하세요
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-[#25282b]">라오타 추천</h2>
              <span className="inline-flex items-center border border-[#e60000]/20 bg-[#fff4f2] px-2.5 py-1 text-[11px] font-black tracking-[0.12em] text-[#e60000]">
                시범 운영 중
              </span>
            </div>
            <div>
              <p className="mt-1 text-sm font-medium text-[#7e7e7e]">
                원하는 취향이나 매장을 고르면 바로 보기 좋게 추천해드릴게요.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 border border-stone-200">
            {modes.map((mode) => {
              const ModeIcon = mode.icon;
              const isActive = activeMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={`flex min-h-16 items-center justify-center gap-2 border-r border-stone-200 px-3 py-3 text-sm font-black transition-colors last:border-r-0 ${
                    isActive ? "bg-[#25282b] text-white" : "bg-white text-[#7e7e7e] hover:text-[#25282b]"
                  }`}
                >
                  <ModeIcon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#e60000]"}`} />
                  <span className="hidden sm:inline">{mode.label}</span>
                  <span className="sm:hidden">{mode.label.replace(" ", "")}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:px-8 lg:py-10">
        <aside className="border border-stone-200 bg-white lg:self-start">
          <div className="border-b border-stone-200 px-5 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e60000] text-white">
                <ActiveIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black leading-tight text-[#25282b] break-keep">{activeModeConfig.title}</h3>
                <p className="mt-1 text-sm font-medium leading-6 text-[#7e7e7e] break-keep">
                  {activeMode === "taste" && "좋아하는 국물과 분위기에 맞는 가게부터 보여드릴게요."}
                  {activeMode === "compare" && "궁금한 두 매장을 한 번에 비교해보세요."}
                  {activeMode === "summary" && "장점과 추천 메뉴만 빠르게 살펴보세요."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5">
            {activeMode === "taste" && (
              <>
                <ChoiceGroup label="국물" value={selectedSoup} options={tasteOptions.soup} onChange={setSelectedSoup} />
                <ChoiceGroup label="상황" value={selectedMood} options={tasteOptions.mood} onChange={setSelectedMood} />
                <ChoiceGroup label="우선순위" value={selectedPriority} options={tasteOptions.priority} onChange={setSelectedPriority} />
              </>
            )}

            {activeMode !== "taste" && (
              <div className="space-y-4">
                {activeMode === "compare" && (
                  <div className="grid gap-3">
                    <ShopOptionList
                      label="비교 A"
                      selectedOption={compareShopA}
                      onSelect={setCompareShopA}
                    />
                    <ShopOptionList
                      label="비교 B"
                      selectedOption={compareShopB}
                      onSelect={setCompareShopB}
                    />
                  </div>
                )}

                {activeMode === "summary" && (
                  <ShopOptionList
                    label="요약 대상"
                    selectedOption={summaryShop}
                    onSelect={setSummaryShop}
                  />
                )}
              </div>
            )}

            {activeMode === "summary" && (
              <ChoiceGroup label="요약 관점" value={summaryFilter} options={summaryFilters} onChange={setSummaryFilter} />
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-2 border border-stone-200 bg-white px-5 py-4 text-sm font-black text-[#25282b] transition-colors hover:border-[#25282b]"
              >
                초기화
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={handleGenerate}
                disabled={!isCurrentModeReady}
                className={`flex w-full items-center justify-center gap-2 px-5 py-4 text-sm font-black text-white transition-opacity ${
                  isCurrentModeReady ? "bg-[#e60000] hover:opacity-90" : "cursor-not-allowed bg-stone-300"
                }`}
              >
                {modeCopy[activeMode].action}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#e60000]">RESULT</p>
              <h3 className="mt-1 text-2xl font-black text-[#25282b]">
                {isCurrentModeReady ? modeCopy[activeMode].result : getEmptyStateCopy(activeMode).resultTitle}
              </h3>
            </div>
          </div>

          {!isCurrentModeReady && <RecommendEmptyState mode={activeMode} />}

          {activeMode === "taste" && isTasteReady && (
            <TasteResults
              shops={displayShops}
              selectedSoup={selectedSoup!}
              selectedMood={selectedMood!}
              selectedPriority={selectedPriority!}
            />
          )}

          {activeMode === "compare" && isCompareReady && <CompareResults primaryShop={primaryShop} secondaryShop={secondaryShop} />}

          {activeMode === "summary" && isSummaryReady && <SummaryResults shop={primaryShop} filter={summaryFilter} />}
        </div>
      </section>
    </main>
  );
}

function ChoiceGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-black text-stone-400">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              onClick={() => onChange(isSelected ? null : option)}
              className={`min-h-10 border px-3 py-2 text-sm font-bold transition-colors ${
                isSelected
                  ? "border-[#25282b] bg-[#25282b] text-white"
                  : "border-stone-200 bg-white text-[#7e7e7e] hover:border-[#e60000] hover:text-[#25282b]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const getEmptyStateCopy = (mode: ModeId) => {
  if (mode === "taste") {
    return {
      resultTitle: "국물, 상황, 우선순위를 고르면 추천을 시작할게요.",
      eyebrow: "취향 추천 준비 중",
      title: "원하는 라멘 취향을 먼저 골라보세요",
      description: "국물, 식사 분위기, 우선순위를 선택하면 잘 맞는 가게부터 정리해드릴게요.",
    };
  }

  if (mode === "compare") {
    return {
      resultTitle: "비교할 두 매장을 고르면 차이를 정리해드릴게요.",
      eyebrow: "매장 비교 준비 중",
      title: "비교할 매장 두 곳을 골라주세요",
      description: "궁금한 매장을 각각 선택하면 메뉴, 평점, 방문 포인트를 한 번에 비교해볼 수 있어요.",
    };
  }

  return {
    resultTitle: "요약할 매장을 고르면 핵심만 추려드릴게요.",
    eyebrow: "리뷰 요약 준비 중",
    title: "먼저 살펴볼 매장을 골라주세요",
    description: "매장을 선택하면 장점, 추천 메뉴, 방문 전에 볼 포인트를 빠르게 정리해드릴게요.",
  };
};

function RecommendEmptyState({ mode }: { mode: ModeId }) {
  const copy = getEmptyStateCopy(mode);

  return (
    <div className="border border-dashed border-stone-300 bg-stone-50/70 p-6 sm:p-8">
      <p className="text-sm font-black text-[#e60000]">{copy.eyebrow}</p>
      <h4 className="mt-2 text-2xl font-black leading-tight text-[#25282b] break-keep">{copy.title}</h4>
      <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#606060] break-keep">{copy.description}</p>
    </div>
  );
}

function ShopOptionList({
  label,
  selectedOption,
  onSelect,
}: {
  label: string;
  selectedOption: ShopOption | null;
  onSelect: (option: ShopOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const shopOptionsQuery = useQuery({
    queryKey: ["recommend-shop-options", label, deferredSearchQuery],
    queryFn: () => getRamenShopOptions(deferredSearchQuery.trim(), 0, ["name,asc"]),
    enabled: isOpen,
    staleTime: 60 * 1000,
  });
  const options = useMemo(() => {
    const items = shopOptionsQuery.data?.data?.items;
    if (!Array.isArray(items) || items.length === 0) return fallbackShopOptions;
    return items.map(normalizeShopOption);
  }, [shopOptionsQuery.data]);

  const handleSelect = (option: ShopOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <span className="mb-2 block text-xs font-black text-stone-400">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-3 border px-4 py-3 text-left transition-colors ${
          isOpen ? "border-[#e60000]" : "border-stone-200 hover:border-[#e60000]"
        }`}
      >
        <span className="min-w-0">
          <span className={`block truncate text-sm font-black ${selectedOption ? "text-[#25282b]" : "text-stone-400"}`}>
            {selectedOption ? selectedOption.name : "매장을 선택해주세요"}
          </span>
          {selectedOption && (
            <span className="mt-0.5 block truncate text-xs font-medium text-stone-400">{selectedOption.region}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden border border-stone-200 bg-white shadow-[0_12px_32px_rgba(37,40,43,0.12)]">
          <div className="border-b border-stone-100 bg-stone-50 p-3">
            <div className="flex items-center border border-stone-200 bg-white px-3 py-2 focus-within:border-[#e60000]">
              <Search className="mr-2 h-4 w-4 text-stone-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="가게 이름을 입력하세요"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#25282b] outline-none placeholder:text-stone-400"
                autoFocus
              />
              {shopOptionsQuery.isFetching && <Loader2 className="ml-2 h-4 w-4 animate-spin text-stone-400" />}
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selectedOption?.id === option.id;
              return (
                <button
                  key={`${label}-${option.id}`}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`block w-full border-b border-stone-100 px-4 py-3 text-left text-sm transition-colors last:border-b-0 ${
                    isSelected ? "bg-red-50 text-[#e60000]" : "text-[#25282b] hover:bg-stone-50"
                  }`}
                >
                  <span className="block truncate font-black">{option.name}</span>
                  <span className="mt-0.5 block truncate text-xs font-medium text-stone-400">{option.region}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TasteResults({
  shops,
  selectedSoup,
  selectedMood,
  selectedPriority,
}: {
  shops: Shop[];
  selectedSoup: string;
  selectedMood: string;
  selectedPriority: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {shops.slice(0, 4).map((shop, index) => (
        <article key={shop.id} className="overflow-hidden border border-stone-200 bg-white">
          <div className="aspect-[16/9] bg-stone-100">
            <img src={shop.imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-black text-[#e60000]">MATCH {buildMatchScore(shop, index)}%</p>
                <h4 className="mt-1 truncate text-xl font-black text-[#25282b]">{shop.name}</h4>
                <p className="mt-1 truncate text-sm font-bold text-[#7e7e7e]">{shop.location}</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-black text-[#25282b]">
                <Star className="h-4 w-4 fill-[#e60000] text-[#e60000]" />
                {formatRating(shop.userRating || shop.editorRating)}
              </div>
            </div>
            <p className="mt-4 line-clamp-2 min-h-12 text-sm font-medium leading-6 text-[#606060]">{shop.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {buildUniqueTags([selectedSoup, selectedMood, selectedPriority, shop.type]).map((tag) => (
                <span key={`${shop.id}-${tag}`} className="border border-stone-200 px-2.5 py-1 text-xs font-bold text-[#25282b]">
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href={`/shop/${shop.id}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#e60000] transition-opacity hover:opacity-75"
            >
              매장 상세 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function CompareResults({ primaryShop, secondaryShop }: { primaryShop: Shop; secondaryShop: Shop }) {
  const rows = [
    ["스타일", primaryShop.type, secondaryShop.type],
    ["대표 메뉴", getPrimaryMenu(primaryShop), getPrimaryMenu(secondaryShop)],
    ["평점", formatRating(primaryShop.userRating || primaryShop.editorRating), formatRating(secondaryShop.userRating || secondaryShop.editorRating)],
    ["방문 지표", `${primaryShop.stats?.visit_count ?? 0}회`, `${secondaryShop.stats?.visit_count ?? 0}회`],
    ["방문 포인트", primaryShop.description, secondaryShop.description],
  ];

  return (
    <div className="overflow-x-auto border border-stone-200 bg-white">
      <div className="min-w-[42rem]">
        <div className="grid grid-cols-[0.72fr_1fr_1fr] bg-[#25282b] text-sm font-black text-white">
          <div className="p-4">항목</div>
          <div className="p-4">{primaryShop.name}</div>
          <div className="p-4">{secondaryShop.name}</div>
        </div>
        {rows.map(([label, first, second]) => (
          <div key={label} className="grid grid-cols-[0.72fr_1fr_1fr] border-t border-stone-100 text-sm">
            <div className="bg-stone-50 p-4 font-black text-[#25282b]">{label}</div>
            <div className="p-4 font-medium leading-6 text-[#606060]">{first}</div>
            <div className="p-4 font-medium leading-6 text-[#606060]">{second}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryResults({ shop, filter }: { shop: Shop; filter: string }) {
  const items = [
    { title: "장점", value: shop.description },
    { title: "추천 메뉴", value: getPrimaryMenu(shop) },
    { title: "방문 기준", value: `${shop.type} 계열을 찾고 있고 ${formatRating(shop.userRating || shop.editorRating)}점대 후보를 우선 볼 때 적합합니다.` },
    { title: "체크 포인트", value: `${shop.location} 위치와 영업시간을 상세 페이지에서 확인한 뒤 방문하는 흐름이 좋습니다.` },
  ];
  const filteredItems = filter === "전체" ? items : items.filter((item) => item.title === filter || (filter === "주의점" && item.title === "체크 포인트"));

  return (
    <div className="border border-stone-200 bg-white">
      <div className="border-b border-stone-200 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black text-[#e60000]">{shop.type}</p>
            <h4 className="mt-1 text-2xl font-black text-[#25282b]">{shop.name}</h4>
            <p className="mt-1 text-sm font-bold text-[#7e7e7e]">{shop.location}</p>
          </div>
          <Link href={`/shop/${shop.id}`} className="inline-flex items-center gap-2 bg-[#25282b] px-4 py-3 text-sm font-black text-white">
            상세 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-px bg-stone-200 md:grid-cols-2">
        {filteredItems.map((item) => (
          <article key={item.title} className="bg-white p-5">
            <h5 className="font-black text-[#25282b]">{item.title}</h5>
            <p className="mt-2 text-sm font-medium leading-6 text-[#606060]">{item.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
