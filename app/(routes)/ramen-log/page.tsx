'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Camera,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { openRamenLogAppPrompt } from '@/app/components/AppPreRegisterModal';
import RamenLogCard from '@/app/components/RamenLogCard';
import RamenLogDetailModal from '@/app/components/RamenLogDetailModal';
import { useApp } from '@/app/context/AppContext';
import { useRamenShops } from '@/hooks/queries/useRamenShops';
import {
  getRamenLogs,
  RAMEN_LOG_TYPES,
  type RamenLog,
  type RamenLogSort,
} from '@/lib/api/ramen-logs';

const MOBILE_PAGE_SIZE = 5;
const DESKTOP_PAGE_SIZE = 8;
const MOBILE_MEDIA_QUERY = '(max-width: 639px)';
const FEATURED_INTERVAL = 8;

const sortOptions = [
  { value: 'LATEST', label: '최신순' },
  { value: 'LIKES', label: '인기순' },
] as const;

export default function RamenLogPage() {
  const { showToast } = useApp();
  const [logItems, setLogItems] = useState<RamenLog[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Custom dropdown states
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [selectedShopName, setSelectedShopName] = useState('');
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedRamenType, setSelectedRamenType] = useState<string | null>(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  const [sortBy, setSortBy] = useState<RamenLogSort>('LATEST');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedLog, setSelectedLog] = useState<RamenLog | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageSize, setPageSize] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestSequenceRef = useRef(0);

  // Fetch shops
  const { data: shopsData } = useRamenShops({ page: 0, size: 100, sort: "NAME" });
  const listShops = shopsData?.shops ?? [];
  const selectedShop = listShops.find(s => s.id === selectedShopId);
  const hasActiveFilter = Boolean(selectedShopId || selectedRamenType);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopId = Number(params.get('shopId'));

    if (Number.isInteger(shopId) && shopId > 0) {
      setSelectedShopId(shopId);
      setSelectedShopName(params.get('shopName') ?? '');
    }
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShopDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updatePageSize = () => {
      setPageSize(mediaQuery.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
    };

    updatePageSize();
    mediaQuery.addEventListener('change', updatePageSize);
    return () => mediaQuery.removeEventListener('change', updatePageSize);
  }, []);

  const loadLogs = useCallback(async (cursor: string | null) => {
    if (pageSize === null) return;

    const replace = cursor === null;
    const requestSequence = replace
      ? ++requestSequenceRef.current
      : requestSequenceRef.current;

    if (replace) setIsInitialLoading(true);
    else setIsLoadingMore(true);

    try {
      const result = await getRamenLogs({
        cursor,
        size: pageSize,
        sort: sortBy,
        shopId: selectedShopId || undefined,
        ramenType: selectedRamenType || undefined,
      });

      if (requestSequence !== requestSequenceRef.current) return;
      setLogItems((current) => replace ? result.items : [...current, ...result.items]);
      setNextCursor(result.nextCursor);
      setHasNext(result.hasNext);
    } catch (error) {
      console.error('Failed to fetch ramen logs:', error);
      if (replace) {
        setLogItems([]);
        setNextCursor(null);
        setHasNext(false);
        showToast('라멘로그를 불러오지 못했습니다.', 'error');
      }
    } finally {
      if (requestSequence === requestSequenceRef.current) {
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [pageSize, selectedRamenType, selectedShopId, showToast, sortBy]);

  useEffect(() => {
    if (pageSize === null) return;
    loadLogs(null);
  }, [loadLogs, pageSize]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNext || !nextCursor || isLoadingMore || isInitialLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        loadLogs(nextCursor);
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNext, isInitialLoading, isLoadingMore, loadLogs, nextCursor]);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-32 overflow-hidden md:h-[14rem]">
        <div className="absolute inset-0">
          <Image
            src="/hero-ramen.jpg"
            alt="Ramen log background"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#25282b]/45" />
        </div>
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center text-white sm:px-6 md:pb-6 md:pt-16 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="vodafone-display mb-3 text-3xl leading-none text-white sm:text-4xl md:text-5xl">
              RAMEN LOG<span className="text-[#e60000]">.</span>
            </h1>
            <p className="mx-auto max-w-lg break-keep text-sm font-medium leading-relaxed text-white/85 sm:text-lg">
              유저들의 생생한 라멘 기록을 둘러보세요
            </p>
          </div>
        </div>
      </section>

      <div className="sticky top-14 z-20 border-b border-stone-200 bg-white/95 backdrop-blur md:top-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 min-w-0 flex-1 sm:flex-row sm:items-center">
              {/* Ramen Type Dropdown (앱 라운지의 라멘 종류 필터와 같다) */}
              <div className="relative min-w-0 w-full sm:w-48" ref={typeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  aria-label="라멘 종류 선택"
                  aria-expanded={isTypeDropdownOpen}
                  className="flex h-11 w-full items-center justify-between gap-2 rounded-sm border border-stone-200 bg-white px-3 py-2.5 text-sm font-bold text-[#25282b] transition-colors hover:border-[#e60000]"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <UtensilsCrossed className="w-4 h-4 text-[#e60000] shrink-0" />
                    <span className="truncate">{selectedRamenType || '전체 종류'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isTypeDropdownOpen && (
                  <div className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-sm border border-stone-300 bg-white py-1">
                    {[null, ...RAMEN_LOG_TYPES].map((type) => (
                      <button
                        key={type ?? 'all'}
                        type="button"
                        onClick={() => {
                          setSelectedRamenType(type);
                          setIsTypeDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-stone-50 ${selectedRamenType === type ? 'font-semibold text-[#e60000]' : 'text-stone-700'}`}
                      >
                        {type ?? '전체 종류'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-row gap-2 sm:shrink-0 w-full sm:w-auto">
                {/* Shop Search Dropdown */}
                <div className="relative flex-1 sm:flex-initial" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                    className="flex h-11 w-full items-center justify-between gap-2 rounded-sm border border-stone-200 bg-white px-3 py-2.5 text-sm font-bold text-[#25282b] transition-colors hover:border-[#e60000] sm:w-48"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Store className="w-4 h-4 text-[#e60000] shrink-0" />
                      <span className="truncate">{selectedShop?.name || selectedShopName || '가게 선택'}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isShopDropdownOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-2 flex max-h-64 flex-col overflow-hidden rounded-sm border border-stone-300 bg-white sm:w-64">
                      <div className="p-2 border-b border-stone-100 bg-stone-50">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                          <input
                            type="text"
                            placeholder="라멘집 검색..."
                            value={shopSearchQuery}
                            onChange={(e) => setShopSearchQuery(e.target.value)}
                            className="w-full rounded-sm border border-stone-200 bg-white py-2 pl-8 pr-3 text-xs focus:border-[#e60000] focus:outline-none"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedShopId(null);
                            setSelectedShopName('');
                            setIsShopDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-stone-50 ${!selectedShopId ? 'text-[#e60000] font-semibold' : 'text-stone-700'}`}
                        >
                          전체 가게
                        </button>
                        {listShops
                          ?.filter(shop => !shopSearchQuery || shop.name.toLowerCase().includes(shopSearchQuery.toLowerCase()))
                          .map(shop => (
                            <button
                              key={shop.id}
                              type="button"
                              onClick={() => {
                                setSelectedShopId(shop.id);
                                setSelectedShopName(shop.name);
                                setIsShopDropdownOpen(false);
                              }}
                              className={`w-full border-t border-stone-100 px-4 py-2.5 text-left text-sm hover:bg-stone-50 ${selectedShopId === shop.id ? 'font-semibold text-[#e60000]' : 'text-stone-700'}`}
                            >
                              <div className="font-medium truncate">{shop.name}</div>
                              <div className="text-xs text-stone-400 truncate">{shop.location}</div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Sort Dropdown */}
                <div className="relative flex-1 sm:flex-initial" ref={sortDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className="flex h-11 w-full items-center justify-between gap-2 rounded-sm border border-stone-200 bg-white px-3 py-2.5 text-sm font-bold text-[#25282b] transition-colors hover:border-[#e60000] sm:w-32"
                  >
                    <span className="truncate">{sortOptions.find(o => o.value === sortBy)?.label || '최신순'}</span>
                    <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSortDropdownOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-sm border border-stone-300 bg-white sm:w-32">
                      <div className="py-1">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => { setSortBy(option.value); setIsSortDropdownOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-stone-50 ${sortBy === option.value ? 'font-semibold text-[#e60000]' : 'text-stone-700'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openRamenLogAppPrompt('ramen_log_feed')}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-sm bg-[#e60000] px-4 text-sm font-black text-white transition-opacity hover:opacity-90 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              기록하기
            </button>
          </div>

        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12 lg:px-8 lg:pt-10 lg:pb-16">
        <section className="min-w-0">
          <div className="mb-7 min-w-0 sm:mb-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">공개 노트</p>
            <h2 className="mt-1 text-2xl font-black text-[#25282b] sm:text-3xl">라멘러들의 기록</h2>
            <p className="mt-1 text-sm font-medium leading-6 text-stone-500">
              저장하고, 다시 보고, 취향을 비교하기 좋은 한 그릇 로그입니다.
            </p>
          </div>

          {isInitialLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3" aria-label="라멘로그 불러오는 중">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className={`animate-pulse rounded-md border border-stone-200 bg-stone-100 ${
                    index % 5 === 0 ? 'col-span-2 h-[28rem] sm:col-span-1 sm:h-[28rem]' : 'h-72 sm:h-[28rem]'
                  } ${
                    index === 0 ? 'lg:col-span-2 lg:h-[30rem]' : ''
                  }`}
                />
              ))}
            </div>
          ) : logItems.length > 0 ? (
            <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-6 lg:grid-cols-3">
              {logItems.map((log, index) => {
                const featureBlock = Math.floor(index / FEATURED_INTERVAL);
                const positionInBlock = index % FEATURED_INTERVAL;
                const featureOnRight = featureBlock % 2 === 1;
                const featuredPosition = featureOnRight ? 1 : 0;
                const isFeatured = !hasActiveFilter && positionInBlock === featuredPosition;
                const isFeaturedMobile = index % 5 === 0;

                return (
                  <div
                    key={log.id}
                    className={`${isFeaturedMobile ? 'col-span-2 sm:col-span-1' : ''} ${
                      isFeatured
                        ? `lg:col-span-2 ${featureOnRight ? 'lg:col-start-2' : 'lg:col-start-1'}`
                        : ''
                    }`}
                  >
                    <RamenLogCard
                      log={log}
                      featured={isFeatured}
                      compactMobile
                      featuredMobile={isFeaturedMobile}
                      onClick={setSelectedLog}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-stone-300 py-24 text-center">
              <Camera className="mx-auto mb-4 h-10 w-10 text-stone-200" />
              <p className="text-sm font-black uppercase tracking-widest text-stone-400">라멘 로그가 없습니다</p>
              <p className="mt-2 text-xs font-bold text-stone-300">다른 조건으로 다시 찾아보세요.</p>
            </div>
          )}

          {logItems.length > 0 && (
            <div ref={loadMoreRef} className="flex min-h-16 items-center justify-center py-5">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-xs font-black text-stone-400">
                  <Loader2 className="h-4 w-4 animate-spin text-[#e60000]" />
                  다음 라멘로그 불러오는 중
                </div>
              )}
              {!hasNext && !isLoadingMore && (
                <p className="text-xs font-bold text-stone-300">모든 라멘로그를 확인했습니다.</p>
              )}
            </div>
          )}
        </section>
      </main>

      {selectedLog && (
        <RamenLogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
