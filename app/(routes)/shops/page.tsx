"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import ShopCard from "../../components/ShopCard";
import { useRamenShops } from "@/hooks/queries/useRamenShops";

const PAGE_SIZE = 12;

export default function ShopsListPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeRegion, setActiveRegion] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(0);
  }, [activeRegion, activeType, sortBy, debouncedSearchQuery]);

  const sortParam = useMemo(() => {
    if (sortBy === "name") return ["name,asc"];
    if (sortBy === "popular") return ["visits,desc"]; // votes 대신 visits로 정렬 파라미터 변경
    return undefined;
  }, [sortBy]);

  const keywordParam = useMemo(() => {
    const keywords = [
      debouncedSearchQuery,
      activeType === "All" ? undefined : activeType,
    ].filter(Boolean);

    return keywords.length > 0 ? keywords.join(" ") : undefined;
  }, [activeType, debouncedSearchQuery]);

  const { data, isLoading, isError } = useRamenShops({
    page: currentPage,
    size: PAGE_SIZE,
    region: activeRegion === "All" ? undefined : activeRegion,
    keyword: keywordParam,
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

  const regions = ["All", "서울", "경기", "인천", "부산", "대전", "세종"];
  const types = ["All", "돈코츠", "쇼유", "미소", "시오", "츠케멘", "탄탄멘"];

  const totalPages = Math.max(shopPageInfo.totalPages || 1, 1);
  const visiblePageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index,
  );
  const goToShopsPage = (page: number) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="min-h-[60vh]">
      {/* Page Header */}
      <div className="mb-8 relative rounded-2xl overflow-hidden shadow-lg h-48 md:h-80">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url('/header-shoplist.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
        <div className="relative z-10 px-6 h-full flex flex-col justify-center items-center text-center text-white">
          <div className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider uppercase bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
            Ramen Shop List
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-300 drop-shadow-sm">
            라멘 가게 리스트
          </h1>
          <p className="text-stone-300 max-w-lg mx-auto font-medium">
            전국의 인기 라멘 맛집을 탐색하고 나만의 인생 라멘을 찾아보세요
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-3 md:p-4 mb-3">
        <input
          type="text"
          placeholder="가게 이름 또는 주소로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm"
        />
      </div>

      {/* Collapsible Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 mb-6">
        <div
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="p-3 md:p-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
        >
          <h3 className="text-sm font-bold text-stone-700">보기 옵션</h3>
          <ChevronDown
            className={`w-4 h-4 text-stone-500 transition-transform ${isFilterExpanded ? "rotate-180" : ""}`}
          />
        </div>

        {isFilterExpanded && (
          <div className="px-3 pb-3 md:px-4 md:pb-4 space-y-3 border-t border-stone-100">
            {/* Region Filter */}
            <div className="pt-3">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                지역
              </label>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setActiveRegion(region)}
                    className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                      activeRegion === region
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {region === "All" ? "전체" : region}
                  </button>
                ))}
              </div>
            </div>

            {/* Ramen Type Filter */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                라멘 종류
              </label>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                      activeType === type
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {type === "All" ? "전체" : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                정렬
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy("default")}
                  className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${sortBy === "default" ? "bg-red-600 text-white shadow-md" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                >
                  기본순
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${sortBy === "name" ? "bg-red-600 text-white shadow-md" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                >
                  이름순
                </button>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${sortBy === "popular" ? "bg-red-600 text-white shadow-md" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                >
                  인기순
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-stone-600">
          전체{" "}
          <span className="font-bold text-red-600">
            {shopPageInfo.totalElements}
          </span>
          개 중 현재 페이지{" "}
          <span className="font-bold text-red-600">{shops.length}</span>개
        </div>
        <Link
          href="/"
          className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          ← 홈으로 돌아가기
        </Link>
      </div>

      {/* Shop Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-stone-500">
          가게 목록을 불러오는 중입니다...
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-bold text-stone-700 mb-2">
            가게 목록을 불러오지 못했습니다
          </h3>
          <p className="text-stone-500">잠시 후 다시 시도해주세요</p>
        </div>
      ) : shops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🍜</div>
          <h3 className="text-xl font-bold text-stone-700 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-stone-500">다른 검색어나 지역을 선택해보세요</p>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-12">
        <p className="text-sm text-stone-500">
          페이지 {currentPage + 1} / {totalPages}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => goToShopsPage(currentPage - 1)}
            disabled={!shopPageInfo.hasPrevious}
            className="px-3 py-2 rounded-lg border border-stone-200 text-stone-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors text-sm font-bold inline-flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            이전
          </button>

          {visiblePageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => goToShopsPage(pageNumber)}
              className={`px-3 py-2 rounded-lg border text-sm font-bold transition-colors ${
                pageNumber === currentPage
                  ? "bg-red-600 border-red-600 text-white"
                  : "border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {pageNumber + 1}
            </button>
          ))}

          <button
            onClick={() => goToShopsPage(currentPage + 1)}
            disabled={!shopPageInfo.hasNext}
            className="px-3 py-2 rounded-lg border border-stone-200 text-stone-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors text-sm font-bold inline-flex items-center"
          >
            다음
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
