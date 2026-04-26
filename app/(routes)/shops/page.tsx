"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, X, Search, Filter, MapPin, Utensils } from "lucide-react";
import ShopCard from "../../components/ShopCard";
import { useRamenShops } from "@/hooks/queries/useRamenShops";
import { useApp } from "@/app/context/AppContext";

const PAGE_SIZE = 12;

export default function ShopsListPage() {
  const { showToast } = useApp();
  const [currentPage, setCurrentPage] = useState(0);
  const [activeRegion, setActiveRegion] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(0);
  }, [activeRegion, activeType, sortBy, debouncedSearchQuery]);

  const sortParam = useMemo(() => {
    if (sortBy === "popular") return ["visits,desc"];
    return ["name,asc"];
  }, [sortBy]);

  const keywordParam = useMemo(() => {
    const keywords = [
      debouncedSearchQuery,
      activeType === "All" ? undefined : activeType,
    ].filter(Boolean);
    return keywords.length > 0 ? keywords.join(" ") : undefined;
  }, [activeType, debouncedSearchQuery]);

  const { data, isLoading, isFetching, isError } = useRamenShops({
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
  const visiblePageNumbers = Array.from({ length: totalPages }, (_, index) => index);
  
  const goToShopsPage = (page: number) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="bg-stone-50 min-h-screen">
      {/* Header Section */}
      <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/header-shoplist.jpg" alt="Ramen Shops" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px]"></div>
        </div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-400">
            RAOTA RAMEN ARCHIVE
          </h1>
          <p className="text-stone-300 max-w-lg mx-auto font-medium leading-relaxed">
            전국의 인기 라멘 맛집을 탐색하고<br className="md:hidden" /> 나만의 인생 라멘을 찾아보세요
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6">
          
          {/* Search & Filter Bar - Clean Style */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-9 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="가게 이름이나 주소를 입력하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-stone-300 focus:border-stone-400 transition-all text-sm font-bold text-stone-700"
              />
            </div>
            <button 
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`lg:col-span-3 flex items-center justify-center gap-3 py-5 px-6 rounded-xl font-black text-sm transition-all border ${
                isFilterExpanded 
                  ? 'bg-stone-900 border-stone-900 text-white' 
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              필터 {isFilterExpanded ? '닫기' : '열기'}
            </button>
          </div>

          {/* Filter Content - Minimalist */}
          {isFilterExpanded && (
            <div className="bg-white border border-stone-200 rounded-xl p-8 animate-scale-in space-y-8">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">
                  <MapPin className="w-3 h-3" /> 지역
                </label>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <button
                      key={region}
                      onClick={() => setActiveRegion(region)}
                      className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                        activeRegion === region 
                          ? "bg-red-600 border-red-600 text-white" 
                          : "bg-white border-stone-200 text-stone-500 hover:border-stone-400"
                      }`}
                    >
                      {region === "All" ? "전국 전체" : region}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">
                  <Utensils className="w-3 h-3" /> 라멘 종류
                </label>
                <div className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveType(type)}
                      className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                        activeType === type 
                          ? "bg-red-600 border-red-600 text-white" 
                          : "bg-white border-stone-200 text-stone-500 hover:border-stone-400"
                      }`}
                    >
                      {type === "All" ? "모든 종류" : type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                <div className="flex gap-1">
                  {['name', 'popular'].map((s) => (
                    <button 
                      key={s}
                      onClick={() => handleSortClick(s)} 
                      className={`px-4 py-2 text-[10px] font-black rounded uppercase tracking-widest transition-all ${
                        sortBy === s ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                      }`}
                    >
                      {s === 'name' ? '이름순' : '인기순'}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setActiveRegion('All'); setActiveType('All'); setSortBy('name'); }} className="text-[10px] font-black text-stone-400 hover:text-red-600 transition-colors uppercase tracking-widest">필터 초기화</button>
              </div>
            </div>
          )}

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
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
              <div className={`mt-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8 pb-20 border-t border-stone-200 pt-10 transition-opacity duration-200 ${showListLoading ? "opacity-35 pointer-events-none" : "opacity-100"}`}>
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">페이지 {currentPage + 1} / {totalPages}</div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={!shopPageInfo.hasPrevious}
                    onClick={() => goToShopsPage(currentPage - 1)}
                    className="p-3 rounded-lg border border-stone-200 text-stone-400 disabled:opacity-20 disabled:cursor-not-allowed hover:border-stone-400 hover:text-stone-900 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex gap-1">
                    {visiblePageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => goToShopsPage(pageNumber)}
                        className={`w-10 h-10 rounded-lg text-xs font-black transition-all ${
                          pageNumber === currentPage 
                            ? "bg-stone-900 text-white" 
                            : "bg-white text-stone-400 border border-stone-200 hover:border-stone-400 hover:text-stone-900"
                        }`}
                      >
                        {pageNumber + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={!shopPageInfo.hasNext}
                    onClick={() => goToShopsPage(currentPage + 1)}
                    className="p-3 rounded-lg border border-stone-200 text-stone-400 disabled:opacity-20 disabled:cursor-not-allowed hover:border-stone-400 hover:text-stone-900 transition-all"
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

function ShopListLoading() {
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center pt-24">
      <div className="flex flex-col items-center gap-5 rounded-xl border border-stone-200 bg-white/90 px-10 py-8 shadow-xl shadow-stone-200/60 backdrop-blur-md">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md animate-ping"></div>
          <img src="/logo.png" alt="RAOTA Loading" className="relative h-14 w-14 animate-bounce-slow object-contain" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Loading shops</p>
          <div className="h-1 w-40 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full rounded-full bg-red-600 animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
