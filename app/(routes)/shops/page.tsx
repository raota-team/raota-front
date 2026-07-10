"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUp, ChevronDown, ChevronLeft, ChevronRight, Sparkles, X, Search } from "lucide-react";
import ShopCard from "../../components/ShopCard";
import { useRamenShops } from "@/hooks/queries/useRamenShops";
import { searchAiRamenShops } from "@/lib/api/ramen-shops";
import TasteRecommendationPanel, { type AiTasteCriteria } from "@/app/components/TasteRecommendationPanel";
import type { Shop } from "@/app/types";
import { trackEvent } from "@/lib/utils/analytics";

const PAGE_SIZE = 12;
const MAX_VISIBLE_PAGES = 5;
const ALL_FILTER = "전체";
const ALL_TYPE_FILTER = "전체";
const SORT_OPTIONS = [
  { value: "VIEWS", label: "조회순" },
  { value: "NAME", label: "이름순" },
  { value: "VISITS", label: "방문순" },
] as const;
type SortOption = (typeof SORT_OPTIONS)[number]["value"];
const DEFAULT_SORT = "VISITS";
const REGIONS = [
  ALL_FILTER,
  "서울",
  "경기",
  "부산",
  "충북",
  "인천",
  "대전",
  "광주",
  "대구",
  "세종",
  "전북",
  "충남",
  "제주",
  "경북",
  "경남",
];
const DISTRICTS_BY_REGION: Record<string, string[]> = {
  서울: ["강남구", "강동구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "동작구", "마포구", "서초구", "성동구", "송파구", "영등포구", "용산구", "은평구", "종로구", "중구"],
  경기: ["고양시", "부천시", "성남시", "수원시", "안산시", "안양시", "의왕시", "의정부시", "평택시", "화성시"],
  부산: ["금정구", "남구", "부산진구", "북구", "사상구", "서구", "수영구", "중구"],
  충북: ["제천시", "청주시"],
  인천: ["남동구", "부평구", "서구"],
  대전: ["서구", "유성구"],
  광주: ["서구"],
  대구: ["중구"],
  세종: ["한누리대로"],
  전북: ["전주시"],
  충남: ["천안시"],
  제주: ["제주시"],
  경북: ["안동시"],
  경남: ["창원시"],
};
const TYPES = [
  { value: ALL_TYPE_FILTER, label: "모든 종류" },
  { value: "시오라멘", label: "시오라멘" },
  { value: "쇼유라멘", label: "쇼유라멘" },
  { value: "아부라소바", label: "아부라소바" },
  { value: "마제소바", label: "마제소바" },
  { value: "츠케멘", label: "츠케멘" },
  { value: "이에케라멘", label: "이에케라멘" },
  { value: "돈코츠라멘", label: "돈코츠라멘" },
  { value: "토리파이탄", label: "토리파이탄" },
  { value: "미소라멘", label: "미소라멘" },
  { value: "쇼유파이탄", label: "쇼유파이탄" },
  { value: "토마토라멘", label: "토마토라멘" },
  { value: "차슈멘", label: "차슈멘" },
  { value: "탄탄멘", label: "탄탄멘" },
  { value: "중화소바", label: "중화소바" },
];

const getAiCriteriaQuery = (criteria: AiTasteCriteria | null) =>
  criteria ? [criteria.prompt, ...criteria.chips].filter(Boolean).join(" ").trim() : "";

const isSortOption = (value: string | null): value is SortOption =>
  SORT_OPTIONS.some((option) => option.value === value);

const getInitialPage = (params: URLSearchParams) => {
  const page = Number(params.get("page"));
  return Number.isInteger(page) && page > 0 ? page - 1 : 0;
};

const getInitialRegion = (params: URLSearchParams) => {
  const city = params.get("city");
  return city && REGIONS.includes(city) ? city : ALL_FILTER;
};

const getInitialDistrict = (params: URLSearchParams, region: string) => {
  const district = params.get("district");
  if (!district || region === ALL_FILTER) return ALL_FILTER;
  return DISTRICTS_BY_REGION[region]?.includes(district) ? district : ALL_FILTER;
};

const getInitialType = (params: URLSearchParams) => {
  const tag = params.get("tag");
  return tag && TYPES.some((type) => type.value === tag) ? tag : ALL_TYPE_FILTER;
};

const getFilterStateKey = ({
  region,
  district,
  type,
  ramenTypeId,
  sort,
  keyword,
}: {
  region: string;
  district: string;
  type: string;
  ramenTypeId?: string;
  sort: SortOption;
  keyword: string;
}) => [region, district, type, ramenTypeId ?? "", sort, keyword].join("|");

export default function ShopsListPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeRegion, setActiveRegion] = useState(ALL_FILTER);
  const [activeDistrict, setActiveDistrict] = useState(ALL_FILTER);
  const [activeType, setActiveType] = useState(ALL_TYPE_FILTER);
  const [activeRamenTypeId, setActiveRamenTypeId] = useState<string | undefined>(undefined);
  const [activeRamenTypeName, setActiveRamenTypeName] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_SORT);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [pageWindowStart, setPageWindowStart] = useState(0);
  const [isUrlStateReady, setIsUrlStateReady] = useState(false);
  const [aiTasteCriteria, setAiTasteCriteria] = useState<AiTasteCriteria | null>(null);
  const [aiSearchShops, setAiSearchShops] = useState<Shop[]>([]);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const previousFilterStateKeyRef = useRef<string | null>(null);
  const aiPanelTriggerRef = useRef<HTMLButtonElement | null>(null);
  const aiSearchQuery = useMemo(() => getAiCriteriaQuery(aiTasteCriteria), [aiTasteCriteria]);

  useEffect(() => {
    if (!isAiPanelOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsAiPanelOpen(false);
      window.requestAnimationFrame(() => aiPanelTriggerRef.current?.focus({ preventScroll: true }));
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isAiPanelOpen]);

  // URL 파라미터에서 초기 상태 설정 (Hydration Mismatch 방지)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = getInitialPage(params);
    const region = getInitialRegion(params);
    const district = getInitialDistrict(params, region);
    const type = getInitialType(params);
    const ramenTypeId = params.get("ramenTypeId") ?? undefined;
    const ramenTypeName = ramenTypeId ? params.get("ramenTypeName") ?? params.get("tag") ?? "추천 라멘" : undefined;
    const sort = params.get("sort");
    const parsedSortBy = isSortOption(sort) ? sort : DEFAULT_SORT;
    const keyword = params.get("keyword") ?? params.get("q") ?? "";
    const aiKeyword = params.get("aiKeyword") ?? "";

    if (page !== 0) setCurrentPage(page);
    if (region !== ALL_FILTER) setActiveRegion(region);
    if (district !== ALL_FILTER) setActiveDistrict(district);
    if (type !== ALL_TYPE_FILTER) setActiveType(type);
    if (ramenTypeId !== undefined) setActiveRamenTypeId(ramenTypeId);
    if (ramenTypeName !== undefined) setActiveRamenTypeName(ramenTypeName);
    if (parsedSortBy !== DEFAULT_SORT) setSortBy(parsedSortBy);
    if (keyword !== "") {
      setSearchQuery(keyword);
      setDebouncedSearchQuery(keyword);
    }
    if (aiKeyword !== "") {
      setAiTasteCriteria({ prompt: aiKeyword, chips: [] });
    }
    if (page !== 0) setPageWindowStart(Math.floor(page / MAX_VISIBLE_PAGES) * MAX_VISIBLE_PAGES);

    previousFilterStateKeyRef.current = getFilterStateKey({
      region,
      district,
      type,
      ramenTypeId,
      sort: parsedSortBy,
      keyword,
    });
    setIsUrlStateReady(true);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (!isUrlStateReady) return;

    const nextFilterStateKey = getFilterStateKey({
      region: activeRegion,
      district: activeDistrict,
      type: activeType,
      ramenTypeId: activeRamenTypeId,
      sort: sortBy,
      keyword: debouncedSearchQuery,
    });

    if (previousFilterStateKeyRef.current === nextFilterStateKey) return;

    previousFilterStateKeyRef.current = nextFilterStateKey;
    setCurrentPage(0);
    setPageWindowStart(0);
  }, [activeRegion, activeDistrict, activeType, activeRamenTypeId, sortBy, debouncedSearchQuery, isUrlStateReady]);

  useEffect(() => {
    if (!isUrlStateReady) return;

    const params = new URLSearchParams();

    if (currentPage > 0) params.set("page", String(currentPage + 1));
    if (debouncedSearchQuery) params.set("keyword", debouncedSearchQuery);
    if (aiSearchQuery) params.set("aiKeyword", aiSearchQuery);
    if (activeRegion !== ALL_FILTER) params.set("city", activeRegion);
    if (activeDistrict !== ALL_FILTER) params.set("district", activeDistrict);
    if (activeType !== ALL_TYPE_FILTER) params.set("tag", activeType);
    if (activeRamenTypeId) params.set("ramenTypeId", activeRamenTypeId);
    if (activeRamenTypeId && activeRamenTypeName) params.set("ramenTypeName", activeRamenTypeName);
    if (sortBy !== DEFAULT_SORT) params.set("sort", sortBy);

    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [activeDistrict, activeRamenTypeId, activeRamenTypeName, activeRegion, activeType, aiSearchQuery, currentPage, debouncedSearchQuery, isUrlStateReady, sortBy]);

  const clearRamenTypeFilter = (resetType = false) => {
    if (resetType) {
      setActiveType(ALL_TYPE_FILTER);
    }

    setActiveRamenTypeId(undefined);
    setActiveRamenTypeName(undefined);
  };

  useEffect(() => {
    if (!aiSearchQuery) {
      setAiSearchShops([]);
      setAiSearchError(null);
      setIsAiSearching(false);
      return;
    }

    let ignoreResult = false;

    setIsAiSearching(true);
    setAiSearchError(null);

    searchAiRamenShops(aiSearchQuery)
      .then((result) => {
        if (ignoreResult) return;
        setAiSearchShops(result.shops.slice(0, 6));
      })
      .catch(() => {
        if (ignoreResult) return;
        setAiSearchShops([]);
        setAiSearchError("AI 라멘 가게 검색 결과를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!ignoreResult) setIsAiSearching(false);
      });

    return () => {
      ignoreResult = true;
    };
  }, [aiSearchQuery]);

  const { data, isLoading, isFetching, isError: isListError } = useRamenShops({
    page: currentPage,
    size: PAGE_SIZE,
    city: activeRegion === ALL_FILTER ? undefined : activeRegion,
    district: activeDistrict === ALL_FILTER ? undefined : activeDistrict,
    keyword: debouncedSearchQuery || undefined,
    tag: activeType === ALL_TYPE_FILTER ? undefined : activeType,
    ramenTypeId: activeRamenTypeId,
    sort: sortBy,
  });
  const regionOptions = REGIONS.map((region) => ({
    value: region,
    label: region,
  }));
  const districtOptions = [
    { value: ALL_FILTER, label: activeRegion === ALL_FILTER ? "지역 선택" : "전체 구/시" },
    ...(DISTRICTS_BY_REGION[activeRegion] ?? []).map((district) => ({
      value: district,
      label: district,
    })),
  ];
  const shops = data?.shops ?? [];
  const totalPages = Math.max(data?.page?.totalPages ?? 1, 1);
  const totalElements = data?.page?.totalElements ?? 0;
  const displayShops = aiTasteCriteria ? aiSearchShops : shops;
  const displayTotalElements = aiTasteCriteria ? aiSearchShops.length : totalElements;
  const visiblePageNumbers = useMemo(() => {
    const pageCount = Math.min(MAX_VISIBLE_PAGES, totalPages - pageWindowStart);
    return Array.from({ length: pageCount }, (_, index) => pageWindowStart + index);
  }, [pageWindowStart, totalPages]);

  useEffect(() => {
    setPageWindowStart((prev) => Math.min(prev, Math.max(totalPages - MAX_VISIBLE_PAGES, 0)));
  }, [totalPages]);

  useEffect(() => {
    setPageWindowStart(Math.floor(currentPage / MAX_VISIBLE_PAGES) * MAX_VISIBLE_PAGES);
  }, [currentPage]);

  useEffect(() => {
    if (data?.page && currentPage >= totalPages) {
      setCurrentPage(Math.max(totalPages - 1, 0));
    }
  }, [currentPage, data?.page, totalPages]);
  
  const goToShopsPage = (page: number) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showPreviousPageGroup = () => {
    setPageWindowStart((prev) => Math.max(prev - MAX_VISIBLE_PAGES, 0));
  };

  const showNextPageGroup = () => {
    setPageWindowStart((prev) => {
      const next = prev + MAX_VISIBLE_PAGES;
      return next >= totalPages ? prev : next;
    });
  };

  const showListLoading = aiTasteCriteria ? isAiSearching : isLoading || isFetching;
  const showListError = aiTasteCriteria ? Boolean(aiSearchError) : isListError;

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative h-32 overflow-hidden md:h-[14rem]">
        <div className="absolute inset-0">
          <Image
            src="/header-shoplist-anime.webp"
            alt="Ramen Shops"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#25282b]/45"></div>
        </div>
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center text-white sm:px-6 md:pt-16 md:pb-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="vodafone-display mb-3 text-3xl text-white sm:text-4xl md:text-5xl">
              RAMEN ARCHIVE<span className="text-[#e60000]">.</span>
            </h1>
            <p className="mx-auto max-w-lg text-sm font-medium leading-relaxed text-white/85 sm:text-lg">
              전국의 라멘 가게를 탐색해보세요
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <section className="overflow-visible rounded-sm border border-stone-200 bg-white">
            <div className="border-b border-stone-100 px-4 py-3 sm:px-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e60000]">List filters</p>
                  <h2 className="mt-1 text-lg font-black leading-tight text-[#25282b] sm:text-xl">목록 필터</h2>
                </div>
                <p className="text-xs font-medium leading-5 text-stone-500 sm:text-right">
                  이름, 지역, 메뉴 조건으로 전체 가게 목록을 좁혀보세요.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="grid grid-cols-2 items-end gap-3 md:flex md:flex-wrap">
                {/* Search Box */}
                <div className="col-span-2 block min-w-0 w-full md:w-[250px]">
                  <label htmlFor="shop-list-search" className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-stone-400 md:mb-2 md:tracking-[0.2em]">
                    가게 검색
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      id="shop-list-search"
                      type="text"
                      placeholder="가게 이름이나 키워드 검색"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setAiTasteCriteria(null);
                      }}
                      className="w-full h-11 rounded-sm border border-stone-200 bg-white pl-9 pr-4 text-sm font-bold text-[#25282b] outline-none transition-colors placeholder:text-stone-400 focus:border-[#e60000]"
                    />
                  </div>
                </div>
                <FilterSelect
                  label="지역"
                  value={activeRegion}
                  options={regionOptions}
                  onChange={(value) => {
                    setActiveRegion(value);
                    setActiveDistrict(ALL_FILTER);
                    setAiTasteCriteria(null);
                  }}
                />
                <FilterSelect
                  label="구/시"
                  value={activeDistrict}
                  options={districtOptions}
                  onChange={(value) => {
                    setActiveDistrict(value);
                    setAiTasteCriteria(null);
                  }}
                  disabled={activeRegion === ALL_FILTER}
                />
                <FilterSelect
                  label="메뉴"
                  value={activeType}
                  options={TYPES}
                  onChange={(value) => {
                    setActiveType(value);
                    clearRamenTypeFilter(false);
                    setAiTasteCriteria(null);
                  }}
                />
                <FilterSelect
                  label="정렬"
                  value={sortBy}
                  options={SORT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                  onChange={(value) => {
                    setSortBy(value as SortOption);
                    setAiTasteCriteria(null);
                  }}
                />
              </div>

              <div className="flex min-h-[2.75rem] items-center gap-2 border-t border-stone-100 pt-4">
                <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap">
                  {debouncedSearchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setDebouncedSearchQuery("");
                      }}
                      className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-[#e60000] bg-white px-3 py-1.5 text-xs font-bold text-[#25282b] transition-colors hover:text-[#e60000]"
                    >
                      검색: {debouncedSearchQuery}
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  {activeRegion !== ALL_FILTER && (
                    <button
                      onClick={() => {
                        setActiveRegion(ALL_FILTER);
                        setActiveDistrict(ALL_FILTER);
                      }}
                      className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-[#e60000] bg-white px-3 py-1.5 text-xs font-bold text-[#25282b] transition-colors hover:text-[#e60000]"
                    >
                      {activeRegion}
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  {activeDistrict !== ALL_FILTER && (
                    <button
                      onClick={() => setActiveDistrict(ALL_FILTER)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-[#e60000] bg-white px-3 py-1.5 text-xs font-bold text-[#25282b] transition-colors hover:text-[#e60000]"
                    >
                      {activeDistrict}
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  {activeType !== ALL_TYPE_FILTER && (
                    <button
                      onClick={() => {
                        setActiveType(ALL_TYPE_FILTER);
                        clearRamenTypeFilter(false);
                      }}
                      className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-[#e60000] bg-white px-3 py-1.5 text-xs font-bold text-[#25282b] transition-colors hover:text-[#e60000]"
                    >
                      {activeRamenTypeName ?? activeType}
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  {activeType === ALL_TYPE_FILTER && activeRamenTypeId && (
                    <button
                      onClick={() => clearRamenTypeFilter(false)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-[#e60000] bg-white px-3 py-1.5 text-xs font-bold text-[#25282b] transition-colors hover:text-[#e60000]"
                    >
                      {activeRamenTypeName ?? "추천 라멘"}
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  {sortBy !== DEFAULT_SORT && (
                    <button
                      onClick={() => setSortBy(DEFAULT_SORT)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-[#e60000] bg-white px-3 py-1.5 text-xs font-bold text-[#25282b] transition-colors hover:text-[#e60000]"
                    >
                      {SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? "정렬"}
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  {debouncedSearchQuery === "" && activeRegion === ALL_FILTER && activeDistrict === ALL_FILTER && activeType === ALL_TYPE_FILTER && !activeRamenTypeId && sortBy === DEFAULT_SORT && (
                    <p className="shrink-0 text-sm text-stone-400">아직 선택된 필터 조건이 없습니다.</p>
                  )}
                </div>
                {(debouncedSearchQuery || activeRegion !== ALL_FILTER || activeDistrict !== ALL_FILTER || activeType !== ALL_TYPE_FILTER || activeRamenTypeId || sortBy !== DEFAULT_SORT) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedSearchQuery("");
                      setActiveRegion(ALL_FILTER);
                      setActiveDistrict(ALL_FILTER);
                      clearRamenTypeFilter(true);
                      setSortBy(DEFAULT_SORT);
                    }}
                    className="shrink-0 whitespace-nowrap text-[11px] font-black uppercase tracking-[0.12em] text-stone-400 transition-colors hover:text-[#e60000]"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            </div>
          </section>

          <button
            ref={aiPanelTriggerRef}
            type="button"
            onClick={() => setIsAiPanelOpen((current) => !current)}
            className="flex min-h-16 w-full items-center justify-between gap-3 rounded-sm border border-stone-200 bg-white px-4 py-3 text-left transition-colors hover:border-[#e60000] md:hidden"
            aria-expanded={isAiPanelOpen}
            aria-controls="mobile-ai-taste-panel"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-red-50 text-[#e60000]">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black text-[#25282b]">
                  {aiTasteCriteria ? "AI 조건 적용 중" : "AI 취향 검색"}
                </span>
                <span className="mt-0.5 block truncate text-xs font-medium text-stone-500">
                  {aiTasteCriteria ? getAiCriteriaQuery(aiTasteCriteria) : "문장으로 취향 찾기"}
                </span>
              </span>
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${isAiPanelOpen ? "rotate-180" : ""}`} />
          </button>

          <div id="mobile-ai-taste-panel" className={`${isAiPanelOpen ? "block" : "hidden"} md:block`}>
            <TasteRecommendationPanel
              activeCriteria={aiTasteCriteria}
              onApply={(criteria) => {
                trackEvent("ai_taste_search_submitted", {
                  source: "shops_ai_panel",
                  query: criteria.prompt || undefined,
                  chips: criteria.chips,
                });
                setAiTasteCriteria(criteria);
                setIsAiPanelOpen(false);
                setSearchQuery("");
                setDebouncedSearchQuery("");
                setActiveRegion(ALL_FILTER);
                setActiveDistrict(ALL_FILTER);
                clearRamenTypeFilter(true);
                setSortBy(DEFAULT_SORT);
                setCurrentPage(0);
                window.requestAnimationFrame(() => {
                  const resultSection = document.getElementById("shops-results");
                  resultSection?.scrollIntoView({ behavior: "smooth", block: "start" });
                });
              }}
              onClear={() => {
                setAiTasteCriteria(null);
                setIsAiPanelOpen(false);
              }}
            />
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs font-black text-stone-400 uppercase tracking-[0.1em]">
              {aiTasteCriteria ? "AI 검색 결과" : "검색 결과"}: <span className="text-stone-900">{displayTotalElements}</span>
            </p>
            <div className="h-[1px] flex-1 mx-6 bg-stone-200 hidden md:block"></div>
          </div>

          <section id="shops-results" className="relative min-h-[360px] scroll-mt-24">
            {showListError ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-stone-200">
                <h3 className="text-lg font-black text-stone-700 mb-2 uppercase tracking-tighter">연결 오류</h3>
                <p className="text-stone-400 text-sm">{aiSearchError ?? "가게 목록을 불러오지 못했습니다."}</p>
              </div>
            ) : displayShops.length > 0 ? (
              <div className={`transition-opacity duration-200 ${showListLoading ? "opacity-35" : "opacity-100"}`}>
                <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {displayShops.map((shop) => (
                    <ShopCard key={shop.id} shop={shop} />
                  ))}
                </div>
              </div>
            ) : !showListLoading ? (
              <div className="text-center py-32 bg-white rounded-2xl border border-dashed border-stone-200">
                <div className="text-5xl mb-6 opacity-10">🍜</div>
                <h3 className="text-lg font-black text-stone-700 mb-2 uppercase tracking-tighter">결과 없음</h3>
                <p className="text-stone-400 text-sm font-medium">
                  {aiTasteCriteria ? "AI 조건을 조금 넓혀보세요" : "검색어와 필터를 다시 확인해보세요"}
                </p>
              </div>
            ) : null}

            {showListLoading && <ShopListLoading />}

            {/* Pagination - Clean Style */}
            {!aiTasteCriteria && totalPages > 1 && (
                <div className={`mt-16 flex flex-col items-center gap-6 pb-20 border-t border-stone-200 pt-10 transition-opacity duration-200 md:flex-row md:justify-between ${showListLoading ? "opacity-35 pointer-events-none" : "opacity-100"}`}>
                <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 md:text-left">페이지 {currentPage + 1} / {totalPages}</div>
                <div className="flex max-w-full items-center justify-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    aria-label="이전 페이지 묶음 보기"
                    disabled={pageWindowStart === 0}
                    onClick={showPreviousPageGroup}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-stone-200 text-stone-400 transition-colors hover:border-[#25282b] hover:text-[#25282b] disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex gap-1">
                    {visiblePageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        aria-label={`${pageNumber + 1} 페이지로 이동`}
                        aria-current={pageNumber === currentPage ? "page" : undefined}
                        onClick={() => goToShopsPage(pageNumber)}
                        className={`h-11 w-11 rounded-sm text-xs font-black transition-colors ${
                          pageNumber === currentPage 
                            ? "bg-[#e60000] text-white" 
                            : "border border-stone-200 bg-white text-stone-400 hover:border-[#25282b] hover:text-[#25282b]"
                        }`}
                      >
                        {pageNumber + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    aria-label="다음 페이지 묶음 보기"
                    disabled={pageWindowStart + MAX_VISIBLE_PAGES >= totalPages}
                    onClick={showNextPageGroup}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-stone-200 text-stone-400 transition-colors hover:border-[#25282b] hover:text-[#25282b] disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </section>

          <div className="flex flex-col items-center justify-center gap-4 pt-6">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-stone-200 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-stone-500 transition-colors hover:border-[#e60000] hover:text-[#e60000]"
            >
              <ArrowUp className="h-4 w-4" />
              맨 위로
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (nextValue: string) => {
    if (disabled) return;
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div className="block min-w-0 w-full md:w-[160px]">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-stone-400 md:mb-2 md:tracking-[0.2em]">
        {label}
      </span>
      <div
        ref={containerRef}
        className="group relative rounded-sm transition-all"
      >
        <button
          type="button"
          aria-label={`${label}: ${selectedOption?.label}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          disabled={disabled}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsOpen(true);
            }
          }}
          className={`min-h-11 w-full rounded-sm border bg-white px-3 py-2.5 pr-10 text-left text-sm font-bold text-[#25282b] outline-none transition-colors md:px-4 md:py-3 md:pr-11 ${
            disabled
              ? "cursor-not-allowed border-stone-200 bg-stone-50 text-stone-400"
              : isOpen
                ? "border-[#e60000] bg-white"
                : "border-stone-200 hover:border-[#e60000]"
          }`}
        >
          <span className="block truncate whitespace-nowrap pr-2">{selectedOption?.label}</span>
        </button>
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-all md:right-4 ${
            disabled
              ? "text-stone-300"
              : isOpen
                ? "rotate-180 text-[#e60000]"
                : "text-stone-400 group-hover:text-[#e60000]"
          }`}
        />
        {isOpen && !disabled && (
          <div
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-sm border border-stone-200 bg-white p-2 shadow-none"
          >
            <div className="max-h-64 overflow-y-auto">
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-left text-sm font-bold transition-colors md:px-4 md:py-3 ${
                      isSelected
                        ? "bg-[#e60000] text-white"
                        : "text-stone-700 hover:bg-stone-50 hover:text-[#25282b]"
                    }`}
                  >
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShopListLoading() {
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center pt-24">
      <div className="flex flex-col items-center gap-5 rounded-sm border border-stone-200 bg-white px-10 py-8 shadow-none">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md animate-ping"></div>
          <Image
            src="/logo.png"
            alt="RAOTA Loading"
            width={56}
            height={56}
            className="relative h-14 w-14 animate-bounce-slow object-contain"
          />
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Loading shops</p>
          <div className="h-1 w-40 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full rounded-full bg-[#e60000] animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
