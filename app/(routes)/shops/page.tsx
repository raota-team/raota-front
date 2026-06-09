"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Sparkles, X, Search } from "lucide-react";
import ShopCard from "../../components/ShopCard";
import { useRamenShops } from "@/hooks/queries/useRamenShops";

const PAGE_SIZE = 12;
const ALL_FILTER = "전체";
const ALL_TYPE_FILTER = "전체";
const SORT_OPTIONS = [
  { value: "POPULAR", label: "인기순" },
  { value: "NAME", label: "이름순" },
  { value: "VISITS", label: "방문순" },
] as const;
const DEFAULT_SORT = "POPULAR";
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
  대전: ["유성구"],
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
  { value: "매운돈코츠라멘", label: "매운돈코츠라멘" },
  { value: "토리파이탄", label: "토리파이탄" },
  { value: "미소라멘", label: "미소라멘" },
  { value: "쇼유파이탄", label: "쇼유파이탄" },
  { value: "쇼유 라멘", label: "쇼유 라멘" },
  { value: "블랙쇼유라멘", label: "블랙쇼유라멘" },
  { value: "토마토라멘", label: "토마토라멘" },
  { value: "차슈멘", label: "차슈멘" },
  { value: "돈코츠 라멘", label: "돈코츠 라멘" },
  { value: "특선쇼유라멘", label: "특선쇼유라멘" },
  { value: "탄탄멘", label: "탄탄멘" },
  { value: "중화소바", label: "중화소바" },
];

export default function ShopsListPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeRegion, setActiveRegion] = useState(ALL_FILTER);
  const [activeDistrict, setActiveDistrict] = useState(ALL_FILTER);
  const [activeType, setActiveType] = useState(ALL_TYPE_FILTER);
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["value"]>(DEFAULT_SORT);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [pageWindowStart, setPageWindowStart] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(0);
    setPageWindowStart(0);
  }, [activeRegion, activeDistrict, activeType, sortBy, debouncedSearchQuery]);

  useEffect(() => {
    setActiveDistrict(ALL_FILTER);
  }, [activeRegion]);

  const { data, isLoading, isFetching, isError } = useRamenShops({
    page: currentPage,
    size: PAGE_SIZE,
    city: activeRegion === ALL_FILTER ? undefined : activeRegion,
    district: activeDistrict === ALL_FILTER ? undefined : activeDistrict,
    keyword: debouncedSearchQuery || undefined,
    tag: activeType === ALL_TYPE_FILTER ? undefined : activeType,
    sort: sortBy,
  });
  const regionOptions = REGIONS.map((region) => ({
    value: region,
    label: region,
  }));
  const districtOptions = [
    { value: ALL_FILTER, label: activeRegion === ALL_FILTER ? "지역을 먼저 선택하세요" : "전체 구/시" },
    ...(DISTRICTS_BY_REGION[activeRegion] ?? []).map((district) => ({
      value: district,
      label: district,
    })),
  ];
  const shops = data?.shops ?? [];
  const totalPages = Math.max(data?.page.totalPages ?? 1, 1);
  const totalElements = data?.page.totalElements ?? 0;
  const maxVisiblePages = 5;
  const visiblePageNumbers = useMemo(() => {
    const pageCount = Math.min(maxVisiblePages, totalPages - pageWindowStart);
    return Array.from({ length: pageCount }, (_, index) => pageWindowStart + index);
  }, [pageWindowStart, totalPages]);

  useEffect(() => {
    setPageWindowStart((prev) => Math.min(prev, Math.max(totalPages - maxVisiblePages, 0)));
  }, [totalPages]);
  
  const goToShopsPage = (page: number) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showPreviousPageGroup = () => {
    setPageWindowStart((prev) => Math.max(prev - maxVisiblePages, 0));
  };

  const showNextPageGroup = () => {
    setPageWindowStart((prev) => {
      const next = prev + maxVisiblePages;
      return next >= totalPages ? prev : next;
    });
  };

  const showListLoading = isLoading || isFetching;

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative h-[10rem] overflow-hidden md:h-[14rem]">
        <div className="absolute inset-0">
          <img src="/header-shoplist-anime.png" alt="Ramen Shops" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#25282b]/45"></div>
        </div>
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 pt-16 pb-4 text-center text-white sm:px-6 md:pt-16 md:pb-6 lg:px-8">
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

      <section className="relative z-20 mt-6 px-4 sm:px-6 lg:-mt-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto w-full max-w-3xl rounded-[18px] border border-stone-200 bg-white p-2 shadow-[0_10px_28px_rgba(37,40,43,0.06)] sm:max-w-[44rem] sm:p-2.5">
            <div className="relative mx-auto w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e60000] md:left-5 md:h-5 md:w-5" />
              <input
                type="text"
                placeholder="가게 이름이나 키워드를 검색해보세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[16px] border border-stone-200 bg-white py-3 pl-12 pr-5 text-sm font-bold text-[#25282b] outline-none transition-colors placeholder:text-[#7e7e7e] focus:border-[#e60000] md:rounded-[18px] md:py-3.5 md:pl-14 md:pr-6"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 items-end gap-3 md:flex md:flex-wrap">
              <FilterSelect
                label="지역"
                value={activeRegion}
                options={regionOptions}
                onChange={setActiveRegion}
              />
              <FilterSelect
                label="구/시"
                value={activeDistrict}
                options={districtOptions}
                onChange={setActiveDistrict}
                disabled={activeRegion === ALL_FILTER}
              />
              <FilterSelect
                label="메뉴"
                value={activeType}
                options={TYPES}
                onChange={setActiveType}
              />
              <FilterSelect
                label="정렬"
                value={sortBy}
                options={SORT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                onChange={(value) => setSortBy(value as (typeof SORT_OPTIONS)[number]["value"])}
              />
            </div>

            <div className="flex min-h-[2.75rem] items-center gap-2 border-t border-stone-100 pt-4">
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap">
                {activeRegion !== ALL_FILTER && (
                  <button
                    onClick={() => setActiveRegion(ALL_FILTER)}
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
                    onClick={() => setActiveType(ALL_TYPE_FILTER)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-[#e60000] bg-white px-3 py-1.5 text-xs font-bold text-[#25282b] transition-colors hover:text-[#e60000]"
                  >
                    {activeType}
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
                {activeRegion === ALL_FILTER && activeDistrict === ALL_FILTER && activeType === ALL_TYPE_FILTER && sortBy === DEFAULT_SORT && (
                  <p className="shrink-0 text-sm text-stone-400">아직 선택된 필터 조건이 없습니다.</p>
                )}
              </div>
              {(activeRegion !== ALL_FILTER || activeDistrict !== ALL_FILTER || activeType !== ALL_TYPE_FILTER || sortBy !== DEFAULT_SORT) && (
                <button
                  onClick={() => {
                    setActiveRegion(ALL_FILTER);
                    setActiveDistrict(ALL_FILTER);
                    setActiveType(ALL_TYPE_FILTER);
                    setSortBy(DEFAULT_SORT);
                  }}
                  className="shrink-0 whitespace-nowrap text-[11px] font-black uppercase tracking-[0.12em] text-stone-400 transition-colors hover:text-[#e60000]"
                >
                  전체 초기화
                </button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs font-black text-stone-400 uppercase tracking-[0.1em]">
              검색 결과: <span className="text-stone-900">{totalElements}</span>
            </p>
            <div className="h-[1px] flex-1 mx-6 bg-stone-200 hidden md:block"></div>
            <Link href="/" className="text-[10px] font-black text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-[0.2em]">← 홈으로 돌아가기</Link>
          </div>

          <section className="relative min-h-[360px]">
            {isError ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-stone-200">
                <h3 className="text-lg font-black text-stone-700 mb-2 uppercase tracking-tighter">연결 오류</h3>
                <p className="text-stone-400 text-sm">가게 목록을 불러오지 못했습니다.</p>
              </div>
            ) : shops.length > 0 ? (
              <div className={`transition-opacity duration-200 ${showListLoading ? "opacity-35" : "opacity-100"}`}>
                <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {shops.map((shop) => (
                    <ShopCard key={shop.id} shop={shop} />
                  ))}
                </div>
              </div>
            ) : !showListLoading ? (
              <div className="text-center py-32 bg-white rounded-2xl border border-dashed border-stone-200">
                <div className="text-5xl mb-6 opacity-10">🍜</div>
                <h3 className="text-lg font-black text-stone-700 mb-2 uppercase tracking-tighter">결과 없음</h3>
                <p className="text-stone-400 text-sm font-medium">검색어와 필터를 다시 확인해보세요</p>
              </div>
            ) : null}

            {showListLoading && <ShopListLoading />}

            {/* Pagination - Clean Style */}
            {totalPages > 1 && (
                <div className={`mt-16 flex flex-col items-center gap-6 pb-20 border-t border-stone-200 pt-10 transition-opacity duration-200 md:flex-row md:justify-between ${showListLoading ? "opacity-35 pointer-events-none" : "opacity-100"}`}>
                <div className="text-center text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] md:text-left">페이지 {currentPage + 1} / {totalPages}</div>
                <div className="flex max-w-full items-center justify-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    aria-label="이전 페이지 묶음 보기"
                    disabled={pageWindowStart === 0}
                    onClick={showPreviousPageGroup}
                    className="rounded-sm border border-stone-200 p-3 text-stone-400 transition-colors hover:border-[#25282b] hover:text-[#25282b] disabled:cursor-not-allowed disabled:opacity-20"
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
                        className={`h-10 w-10 rounded-sm text-xs font-black transition-colors ${
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
                    disabled={pageWindowStart + maxVisiblePages >= totalPages}
                    onClick={showNextPageGroup}
                    className="rounded-sm border border-stone-200 p-3 text-stone-400 transition-colors hover:border-[#25282b] hover:text-[#25282b] disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="fixed bottom-5 left-4 right-4 z-30 rounded-full border border-stone-200 bg-white py-2 pl-3 pr-3 text-[#25282b] shadow-[0_12px_32px_rgba(37,40,43,0.14)] md:bottom-6 md:left-auto md:right-6 md:w-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        <Link
          href="/recommend"
          className="group flex min-w-0 items-center gap-3 py-1.5 md:rounded-full md:border md:border-[#e60000] md:bg-white md:px-5 md:py-3 md:text-[#25282b] md:shadow-[0_8px_22px_rgba(37,40,43,0.12)] md:transition-colors md:hover:bg-[#e60000] md:hover:text-white"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e60000] text-white md:h-auto md:w-auto md:bg-transparent md:text-[#e60000] md:transition-colors md:group-hover:text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold">고르기 어렵다면 추천받기</span>
            <span className="block truncate text-xs font-medium text-[#7e7e7e] md:hidden">취향으로 라멘집을 좁혀보세요</span>
          </span>
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-[#e60000] transition-colors md:group-hover:text-white" />
        </Link>
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
    <div className="block min-w-0 w-full md:w-[220px]">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-stone-400 md:mb-2 md:tracking-[0.2em]">
        {label}
      </span>
      <div
        ref={containerRef}
        className="group relative rounded-sm transition-all"
      >
        <button
          type="button"
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
          className={`w-full rounded-sm border bg-white px-3 py-2.5 pr-10 text-left text-sm font-bold text-[#25282b] outline-none transition-colors md:px-4 md:py-3 md:pr-11 ${
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
          <img src="/logo.png" alt="RAOTA Loading" className="relative h-14 w-14 animate-bounce-slow object-contain" />
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
