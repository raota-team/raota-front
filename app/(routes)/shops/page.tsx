"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, X, Search } from "lucide-react";
import ShopCard from "../../components/ShopCard";
import { useRamenShops } from "@/hooks/queries/useRamenShops";
import { useApp } from "@/app/context/AppContext";

const PAGE_SIZE = 12;
const ALL_FILTER = "전체";
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
const TYPES = ["All", "돈코츠", "쇼유", "미소", "시오", "츠케멘", "탄탄멘"];

export default function ShopsListPage() {
  const { showToast } = useApp();
  const [currentPage, setCurrentPage] = useState(0);
  const [activeRegion, setActiveRegion] = useState(ALL_FILTER);
  const [activeType, setActiveType] = useState("All");
  const [sortBy, setSortBy] = useState("name");
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
  }, [activeRegion, activeType, sortBy, debouncedSearchQuery]);

  const sortParam = useMemo(() => {
    if (sortBy === "popular") return ["visits,desc"];
    return ["name,asc"];
  }, [sortBy]);

  const { data, isLoading, isFetching, isError } = useRamenShops({
    page: currentPage,
    size: PAGE_SIZE,
    region: activeRegion === ALL_FILTER ? undefined : activeRegion,
    keyword: debouncedSearchQuery || undefined,
    tag: activeType === "All" ? undefined : activeType,
    sort: sortParam,
  });
  const shops = data?.shops ?? [];
  const shopPageInfo = data?.page ?? {
    number: currentPage,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: currentPage > 0,
  };

  const totalPages = Math.max(shopPageInfo.totalPages || 1, 1);
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

  const handleSortClick = (s: string) => {
    if (s === 'popular') {
      showToast('인기순 정렬은 구현 예정입니다.', 'info');
      return;
    }
    setSortBy(s);
  };

  const showListLoading = isLoading || isFetching;

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative min-h-[17rem] overflow-hidden md:min-h-[21rem]">
        <div className="absolute inset-0">
          <img src="/header-shoplist-anime.png" alt="Ramen Shops" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#25282b]/45"></div>
        </div>
        <div className="relative z-10 mx-auto flex min-h-[17rem] max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 lg:min-h-[21rem] lg:px-8">
          <div className="flex flex-col gap-5">
            <div className="text-center text-white">
              <h1 className="vodafone-display mb-4 text-5xl text-white md:text-7xl">
                RAOTA RAMEN ARCHIVE
              </h1>
              <p className="mx-auto max-w-lg text-lg font-medium leading-relaxed text-white/85">
                전국의 인기 라멘 맛집을 탐색하고<br className="md:hidden" /> 나만의 인생 라멘을 찾아보세요
              </p>
            </div>

            <div className="mx-auto w-full max-w-5xl">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#e60000]" />
                <input
                  type="text"
                  placeholder="가게 이름을 검색해보세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-sm border border-white bg-white py-5 pl-14 pr-6 text-sm font-bold text-[#25282b] outline-none transition-colors placeholder:text-[#7e7e7e] focus:border-[#e60000]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3">
              <FilterSelect
                label="지역"
                value={activeRegion}
                options={REGIONS.map((region) => ({
                  value: region,
                  label: region,
                }))}
                onChange={setActiveRegion}
              />
              <FilterSelect
                label="종류"
                value={activeType}
                options={TYPES.map((type) => ({
                  value: type,
                  label: type === "All" ? "모든 종류" : type,
                }))}
                onChange={setActiveType}
              />
              <FilterSelect
                label="정렬"
                value={sortBy}
                options={[
                  { value: "name", label: "이름순" },
                  { value: "popular", label: "인기순" },
                ]}
                onChange={handleSortClick}
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
                {activeType !== "All" && (
                  <button
                    onClick={() => setActiveType("All")}
                    className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-[#e60000] bg-white px-3 py-1.5 text-xs font-bold text-[#25282b] transition-colors hover:text-[#e60000]"
                  >
                    {activeType}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {sortBy !== "name" && (
                  <button
                    onClick={() => setSortBy("name")}
                    className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-[#e60000] bg-white px-3 py-1.5 text-xs font-bold text-[#25282b] transition-colors hover:text-[#e60000]"
                  >
                    인기순
                    <X className="h-3 w-3" />
                  </button>
                )}
                {activeRegion === ALL_FILTER && activeType === "All" && sortBy === "name" && (
                  <p className="shrink-0 text-sm text-stone-400">아직 선택된 필터 조건이 없습니다.</p>
                )}
              </div>
              {(activeRegion !== ALL_FILTER || activeType !== "All" || sortBy !== "name") && (
                <button
                  onClick={() => {
                    setActiveRegion(ALL_FILTER);
                    setActiveType("All");
                    setSortBy("name");
                  }}
                  className="shrink-0 text-xs font-black uppercase tracking-[0.16em] text-stone-400 transition-colors hover:text-[#e60000]"
                >
                  전체 초기화
                </button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs font-black text-stone-400 uppercase tracking-[0.1em]">
              검색 결과: <span className="text-stone-900">{shopPageInfo.totalElements}</span>
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
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
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
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div className="block w-full md:w-[180px]">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
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
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsOpen(true);
            }
          }}
          className={`w-full rounded-sm border bg-white px-4 py-3 pr-11 text-left text-sm font-bold text-[#25282b] outline-none transition-colors ${
            isOpen
              ? "border-[#e60000] bg-white"
              : "border-stone-200 hover:border-[#e60000]"
          }`}
        >
          {selectedOption?.label}
        </button>
        <ChevronDown
          className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-all ${
            isOpen ? "rotate-180 text-[#e60000]" : "text-stone-400 group-hover:text-[#e60000]"
          }`}
        />
        {isOpen && (
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
                    className={`flex w-full items-center justify-between rounded-sm px-4 py-3 text-left text-sm font-bold transition-colors ${
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
