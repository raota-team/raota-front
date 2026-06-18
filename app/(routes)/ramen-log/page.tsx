'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Camera,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  Store,
} from 'lucide-react';
import RamenLogModal, { type RamenLogFormData } from '@/app/components/RamenLogModal';
import RamenLogCard, {
  formatRamenLogDate,
  tasteNoteLabels,
  tasteNoteOrder,
} from '@/app/components/RamenLogCard';
import { useApp } from '@/app/context/AppContext';
import { getAccessToken } from '@/lib/auth/accessToken';
import { useRamenShops } from '@/hooks/queries/useRamenShops';
import {
  createRamenLog,
  deleteRamenLog,
  getRamenLogs,
  toggleRamenLogLike,
  toRevisitValue,
  updateRamenLog,
  type RamenLog,
  type RamenLogPageInfo,
  type RamenLogRequest,
  type RamenLogSort,
} from '@/lib/api/ramen-logs';

const PhotoModal = dynamic(() => import('@/app/components/PhotoModal'), { ssr: false });

const PAGE_SIZE = 8;

const sortOptions = [
  { value: 'LATEST', label: '최신순' },
  { value: 'POPULAR', label: '인기순' },
] as const;

const toRamenLogRequest = (data: RamenLogFormData): RamenLogRequest => {
  if (!data.shopId) {
    throw new Error('라멘 가게를 선택해주세요.');
  }

  return {
    shopId: data.shopId,
    menuName: data.menuName,
    ramenType: data.ramenType,
    imageUrl: data.imageUrl,
    note: data.note || undefined,
    tasteNotes: data.tasteNotes,
    revisit: toRevisitValue(data.revisit),
    public: data.isPublic,
  };
};

export default function RamenLogPage() {
  const router = useRouter();
  const { isLoggedIn, isAuthChecking, showConfirm, showToast } = useApp();
  const [logItems, setLogItems] = useState<RamenLog[]>([]);
  const [pageInfo, setPageInfo] = useState<RamenLogPageInfo | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Custom dropdown states
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [sortBy, setSortBy] = useState<RamenLogSort>('LATEST');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<RamenLog | null>(null);
  const [editingLog, setEditingLog] = useState<RamenLog | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestSequenceRef = useRef(0);

  // Fetch shops
  const { data: shopsData } = useRamenShops({ page: 0, size: 100, sort: "NAME" });
  const listShops = shopsData?.shops ?? [];
  const selectedShop = listShops.find(s => s.id === selectedShopId);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShopDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const loadLogs = useCallback(async (page: number, replace: boolean) => {
    const requestSequence = replace
      ? ++requestSequenceRef.current
      : requestSequenceRef.current;

    if (replace) setIsInitialLoading(true);
    else setIsLoadingMore(true);

    try {
      const result = await getRamenLogs({
        page,
        size: PAGE_SIZE,
        sort: sortBy,
        shopId: selectedShopId || undefined,
        keyword: debouncedSearchQuery || undefined,
      });

      if (requestSequence !== requestSequenceRef.current) return;
      setLogItems((current) => replace ? result.items : [...current, ...result.items]);
      setPageInfo(result.page);
    } catch (error) {
      console.error('Failed to fetch ramen logs:', error);
      if (replace) {
        setLogItems([]);
        setPageInfo(null);
        showToast('라멘로그를 불러오지 못했습니다.', 'error');
      }
    } finally {
      if (requestSequence === requestSequenceRef.current) {
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [debouncedSearchQuery, selectedShopId, showToast, sortBy]);

  useEffect(() => {
    loadLogs(0, true);
  }, [loadLogs]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !pageInfo?.hasNext || isLoadingMore || isInitialLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        loadLogs(pageInfo.number + 1, false);
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isInitialLoading, isLoadingMore, loadLogs, pageInfo]);

  const openCreateModal = () => {
    const hasAccessToken = Boolean(getAccessToken());

    if (isAuthChecking && !hasAccessToken) return;

    if (!isLoggedIn && !hasAccessToken) {
      showConfirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?', () => {
        router.push('/login');
      });
      return;
    }

    setIsLogModalOpen(true);
  };

  const handleCreateLog = async (data: RamenLogFormData) => {
    const request = toRamenLogRequest(data);

    if (editingLog) {
      const updated = await updateRamenLog(editingLog.id, request);
      setLogItems((current) =>
        updated.isPublic
          ? current.map((log) => log.id === updated.id ? updated : log)
          : current.filter((log) => log.id !== updated.id),
      );
      setSelectedLog((current) => current?.id === updated.id ? updated : current);
      setEditingLog(null);
      showToast('라멘로그를 수정했습니다.', 'success');
      return;
    }

    const created = await createRamenLog(request);
    if (created?.isPublic && sortBy === 'LATEST' && !selectedShopId && !debouncedSearchQuery) {
      setLogItems((current) => [created, ...current]);
      setPageInfo((current) => current ? {
        ...current,
        totalElements: current.totalElements + 1,
      } : current);
    } else {
      await loadLogs(0, true);
    }
    showToast('라멘로그를 저장했습니다.', 'success');
  };

  const handleLikeChange = async (logId: number) => {
    if (!getAccessToken()) {
      showConfirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?', () => {
        router.push('/login');
      });
      throw new Error('Login required');
    }

    const result = await toggleRamenLogLike(logId);
    setLogItems((current) =>
      current.map((log) =>
        log.id === logId
          ? { ...log, likes: result.likeCount, isLiked: result.liked }
          : log,
      ),
    );
    setSelectedLog((current) =>
      current?.id === logId
        ? { ...current, likes: result.likeCount, isLiked: result.liked }
        : current,
    );
  };

  const handleEditLog = (logId: number) => {
    const log = logItems.find((item) => item.id === logId);
    if (!log) return;
    setSelectedLog(null);
    setEditingLog(log);
    setIsLogModalOpen(true);
  };

  const handleDeleteLog = async (logId: number) => {
    await deleteRamenLog(logId);
    setLogItems((current) => current.filter((log) => log.id !== logId));
    setSelectedLog(null);
    setPageInfo((current) => current ? {
      ...current,
      totalElements: Math.max(0, current.totalElements - 1),
    } : current);
    showToast('라멘로그를 삭제했습니다.', 'success');
  };

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
              <div className="relative min-w-0 w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="가게, 메뉴, 맛 기록 검색"
                  className="h-11 w-full rounded-sm border border-stone-200 bg-white pl-9 pr-3 text-sm font-bold text-[#25282b] outline-none transition-colors placeholder:text-stone-400 focus:border-[#e60000]"
                />
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
                      <span className="truncate">{selectedShop ? selectedShop.name : '가게 선택'}</span>
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
                          onClick={() => { setSelectedShopId(null); setIsShopDropdownOpen(false); }}
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
                              onClick={() => { setSelectedShopId(shop.id); setIsShopDropdownOpen(false); }}
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
              onClick={openCreateModal}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-sm bg-[#e60000] px-4 text-sm font-black text-white transition-opacity hover:opacity-90 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              기록하기
            </button>
          </div>

        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <section className="min-w-0">
          <div className="mb-7 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">공개 노트</p>
              <h2 className="mt-1 text-2xl font-black text-[#25282b] sm:text-3xl">라멘러들의 기록</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-stone-500">
                저장하고, 다시 보고, 취향을 비교하기 좋은 한 그릇 로그입니다.
              </p>
            </div>
            <span className="shrink-0 text-xs font-black text-stone-400">
              {pageInfo?.totalElements ?? 0}개 로그
            </span>
          </div>

          {isInitialLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="라멘로그 불러오는 중">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-md border border-stone-200 bg-stone-100 sm:h-[28rem]" />
              ))}
            </div>
          ) : logItems.length > 0 ? (
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {logItems.map((log) => (
                <RamenLogCard key={log.id} log={log} onClick={(item) => setSelectedLog(item as RamenLog)} />
              ))}
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
              {!pageInfo?.hasNext && !isLoadingMore && (
                <p className="text-xs font-bold text-stone-300">모든 라멘로그를 확인했습니다.</p>
              )}
            </div>
          )}
        </section>
      </main>

      <RamenLogModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setEditingLog(null);
        }}
        onCreate={handleCreateLog}
        initialLog={editingLog ? {
          shopName: editingLog.shop.name,
          shopId: editingLog.shop.id,
          menuName: editingLog.menuName,
          ramenType: editingLog.ramenType,
          imageUrl: editingLog.imageUrl,
          imageName: '',
          note: editingLog.note,
          tasteNotes: editingLog.tasteNotes,
          revisit: editingLog.revisit,
          isPublic: editingLog.isPublic ?? true,
        } : undefined}
      />

      {selectedLog && (
        <PhotoModal
          photo={{
            id: selectedLog.id,
            imageUrl: selectedLog.imageUrl,
            menuName: selectedLog.menuName,
            user: selectedLog.author.name,
            userId: selectedLog.author.id,
            restaurantName: selectedLog.shop.name,
            restaurantId: selectedLog.shop.id,
            date: formatRamenLogDate(selectedLog.date),
            comment: selectedLog.note,
            revisit: selectedLog.revisit,
            likes: selectedLog.likes,
            isLiked: selectedLog.isLiked,
            tasteNotes: tasteNoteOrder
              .filter((key) => selectedLog.tasteNotes[key].length > 0)
              .map((key) => ({ label: tasteNoteLabels[key], values: selectedLog.tasteNotes[key] })),
          }}
          onClose={() => setSelectedLog(null)}
          onLikeChange={handleLikeChange}
          onEdit={handleEditLog}
          onDelete={handleDeleteLog}
          disableNavigation
        />
      )}
    </div>
  );
}
