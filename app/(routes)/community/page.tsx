'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, ChevronDown, PenSquare, Store, Search, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCommunityPosts, getRamenShopOptions } from '@/lib/api/community';
import Loading from '@/app/loading';

// HTML 태그 제거 유틸리티
const stripHtml = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ');
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'REVIEW': return '맛집후기';
    case 'TIP': return '라멘꿀팁';
    case 'QUESTION': return 'Q&A';
    case 'FREE': return '자유게시판';
    default: return category;
  }
};

const categories = [
  { id: 'all', label: '전체', color: 'bg-stone-800' },
  { id: 'REVIEW', label: '맛집후기', color: 'bg-red-600' },
  { id: 'TIP', label: '라멘꿀팁', color: 'bg-amber-500' },
  { id: 'QUESTION', label: 'Q&A', color: 'bg-blue-500' },
  { id: 'FREE', label: '자유게시판', color: 'bg-emerald-500' },
];

export default function CommunityPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);

  // 식당 필터 상태
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [selectedShopName, setSelectedShopName] = useState<string>('');
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [shopOptions, setShopOptions] = useState<any[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // React Query 적용
  const { data: postsData, isLoading, isFetching } = useQuery({
    queryKey: ['community-posts', selectedCategory, selectedShopId, currentPage],
    queryFn: () => getCommunityPosts({
      page: currentPage,
      size: 10,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      ramenShopId: selectedShopId
    }),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });

  const posts = postsData?.data?.items || [];
  const pageInfo = postsData?.data?.page || null;

  // 식당 목록 검색
  useEffect(() => {
    const fetchShopOptions = async () => {
      try {
        const res = await getRamenShopOptions(shopSearchQuery, 0, "NAME");
        setShopOptions(res.data.items || []);
      } catch (err) {
        console.error('Failed to fetch shop options:', err);
      }
    };

    if (isShopDropdownOpen) {
      if (shopSearchQuery === '') {
        fetchShopOptions();
      } else {
        const timer = setTimeout(fetchShopOptions, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [shopSearchQuery, isShopDropdownOpen]);

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedShopId(null);
    setSelectedShopName('');
    setCurrentPage(0);
  };

  if (isLoading && posts.length === 0) {
    return <Loading />;
  }

  const selectedCategoryLabel = categories.find((cat) => cat.id === selectedCategory)?.label || '전체';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative min-h-[9rem] overflow-hidden md:min-h-[16rem]">
        <div className="absolute inset-0">
          <img src="/header-community-anime.png" alt="Community" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#25282b]/45"></div>
        </div>
        <div className="relative z-10 mx-auto flex min-h-[9rem] max-w-7xl flex-col justify-center px-6 py-5 text-center text-white md:min-h-[16rem] md:py-6">
          <h1 className="vodafone-display mb-3 text-4xl leading-none text-white sm:text-5xl md:text-6xl">
            RAOTA COMMUNITY<span className="text-[#e60000]">.</span>
          </h1>
          <p className="mx-auto max-w-md text-base font-medium leading-relaxed text-white/85 sm:max-w-lg sm:text-lg">라멘 매니아들의 이야기와 꿀팁을 나눠보세요</p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <Link href="/community/write" className="group flex w-full items-center justify-center gap-2 rounded-sm bg-[#e60000] py-4 font-bold text-white transition-opacity hover:opacity-90 active:opacity-90">
                <PenSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                글쓰기
              </Link>
              
              <div className="relative overflow-hidden rounded-sm border border-stone-200 bg-white md:overflow-visible">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-stone-50"
                  aria-expanded={isCategoryOpen}
                >
                  <div>
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">카테고리</h3>
                    <p className="mt-1 text-xs font-bold text-stone-700">{selectedCategoryLabel}</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCategoryOpen && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 space-y-1 rounded-sm border border-stone-200 bg-white p-4 shadow-[0_12px_32px_rgba(37,40,43,0.12)] md:static md:mt-0 md:rounded-none md:border-0 md:border-t md:border-stone-100 md:p-4 md:shadow-none">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`flex w-full items-center justify-between rounded-sm px-4 py-3 text-sm font-bold transition-colors ${
                          selectedCategory === cat.id ? 'bg-[#e60000] text-white' : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-h-[48rem] flex-1">
            {selectedCategory === 'REVIEW' && (
              <div className="mb-6" ref={dropdownRef}>
                <div className="relative">
                  <button
                    onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                    className="flex w-full items-center justify-between gap-3 rounded-sm border border-stone-200 bg-white px-6 py-4 text-sm font-bold text-stone-700 transition-colors hover:border-[#e60000]"
                  >
                    <div className="flex items-center gap-2">
                      <Store className={`w-5 h-5 ${selectedShopId ? 'text-[#e60000]' : 'text-stone-400'}`} />
                      <span>{selectedShopId ? `${selectedShopName} 후기만 보기` : '라멘집별 후기 찾아보기'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedShopId && (
                        <div onClick={(e) => { e.stopPropagation(); setSelectedShopId(null); setSelectedShopName(''); }} className="p-1 hover:bg-stone-100 rounded-full text-stone-400">
                          <X className="w-4 h-4" />
                        </div>
                      )}
                      <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isShopDropdownOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-2 flex max-h-80 flex-col overflow-hidden rounded-sm border border-stone-200 bg-white shadow-none animate-scale-in">
                      <div className="p-4 border-b border-stone-100 bg-stone-50">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            placeholder="가게 이름을 입력하세요..."
                            value={shopSearchQuery}
                            onChange={(e) => setShopSearchQuery(e.target.value)}
                            className="w-full rounded-sm border border-stone-200 bg-white py-2 pl-10 pr-4 text-sm font-medium focus:border-[#e60000] focus:outline-none"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto">
                        <button
                          onClick={() => { setSelectedShopId(null); setSelectedShopName(''); setIsShopDropdownOpen(false); }}
                          className={`w-full border-b border-stone-50 px-5 py-4 text-left text-sm font-bold hover:bg-stone-50 ${!selectedShopId ? 'text-[#e60000]' : 'text-stone-600'}`}
                        >
                          전체 후기 보기
                        </button>
                        {shopOptions.map(shop => (
                          <button
                            key={shop.id}
                            onClick={() => { setSelectedShopId(shop.id); setSelectedShopName(shop.name); setIsShopDropdownOpen(false); setCurrentPage(0); }}
                            className={`w-full border-b border-stone-50 px-5 py-4 text-left text-sm transition-colors hover:bg-stone-50 ${selectedShopId === shop.id ? 'bg-red-50 font-bold text-[#e60000]' : 'text-stone-700'}`}
                          >
                            <div className="font-bold">{shop.name}</div>
                            <div className="text-[10px] text-stone-400 font-mono mt-0.5">{shop.region}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Posts List - Fixed nested anchor tag issue */}
            {posts.length > 0 ? (
              <div className={`space-y-4 transition-opacity duration-300 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                {posts.map((post: any) => {
                  const pId = post.postId;
                  return (
                    <div
                      key={pId}
                      onClick={() => router.push(`/community/${pId}`)}
                      className="group flex cursor-pointer flex-row gap-3 rounded-sm border border-stone-200 bg-white p-3.5 transition-colors hover:border-[#e60000] md:gap-6 md:p-6"
                    >
                      {post.imageUrl && (
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-stone-100 md:h-32 md:w-48">
                          <img 
                            src={post.imageUrl} 
                            alt={post.title} 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex min-w-0 items-center gap-2 md:mb-3 md:gap-3">
                          <span className="flex-shrink-0 rounded-sm border border-[#e60000] bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-[#25282b] md:py-1">
                            {getCategoryLabel(post.category)}
                          </span>
                          {post.storeName && (
                            <span className="flex min-w-0 items-center gap-1 truncate text-[10px] font-bold uppercase tracking-tighter text-stone-400">
                              <Store className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{post.storeName}</span>
                            </span>
                          )}
                        </div>
                        <h2 className="mb-1.5 truncate text-base font-bold text-[#25282b] transition-colors group-hover:text-[#e60000] md:mb-2 md:text-xl">{post.title}</h2>
                        <p className="mb-2 line-clamp-1 text-xs leading-relaxed text-stone-500 md:mb-4 md:line-clamp-2 md:text-sm">{stripHtml(post.contentPreview)}</p>
                        <div className="flex items-center justify-between gap-2 border-t border-stone-50 pt-2 text-[10px] font-black uppercase tracking-widest text-stone-400 md:pt-4">
                          <div className="flex min-w-0 items-center gap-2 md:gap-4">
                            {/* Inner link for author stays, but parent is now a div */}
                            <div className="flex min-w-0 items-center gap-1.5 md:gap-2" onClick={(e) => { e.stopPropagation(); router.push(`/user/${post.authorId}`); }}>
                              <div className="h-5 w-5 flex-shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                                {post.authorImageUrl ? (
                                  <img src={post.authorImageUrl} alt={post.authorName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] bg-stone-200 text-stone-400">🍜</div>
                                )}
                              </div>
                              <span className="truncate transition-colors hover:text-stone-900">{post.authorName}</span>
                            </div>
                            <span className="hidden font-mono sm:inline">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2 md:gap-4">
                            <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post.likeCount}</span>
                            <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.commentCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-sm border border-dashed border-stone-300 bg-white py-32 text-center">
                <div className="text-4xl mb-4 opacity-20">🍜</div>
                <p className="text-stone-400 font-bold tracking-widest uppercase">게시글이 없습니다</p>
                <p className="text-stone-300 text-xs mt-2">첫 번째 글의 주인공이 되어보세요!</p>
              </div>
            )}

            {/* Pagination */}
            {pageInfo && pageInfo.totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-6 pb-20">
                <button
                  disabled={!pageInfo.hasPrevious}
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0); }}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stone-400 transition-colors hover:text-[#e60000] disabled:cursor-not-allowed disabled:opacity-20"
                >
                  <ChevronLeft className="w-4 h-4" /> 이전
                </button>
                <div className="flex gap-2">
                  {[...Array(pageInfo.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setCurrentPage(i); window.scrollTo(0, 0); }}
                      className={`h-8 w-8 rounded-sm text-xs font-black transition-colors ${
                        currentPage === i 
                          ? 'bg-[#e60000] text-white' 
                          : 'bg-white text-stone-400 border border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={!pageInfo.hasNext}
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0); }}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stone-400 transition-colors hover:text-[#e60000] disabled:cursor-not-allowed disabled:opacity-20"
                >
                  다음 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
