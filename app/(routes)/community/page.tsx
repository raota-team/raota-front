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
        const res = await getRamenShopOptions(shopSearchQuery, 0, ["name,asc"]);
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative min-h-[17rem] md:min-h-[21rem] overflow-hidden">
        <div className="absolute inset-0">
          <img src="/header-community-anime.png" alt="Community" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-stone-900/35"></div>
        </div>
        <div className="relative z-10 mx-auto flex min-h-[17rem] max-w-7xl flex-col justify-center px-6 py-8 text-center text-white md:min-h-[21rem]">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-400">RAOTA COMMUNITY</h1>
          <p className="text-stone-300 max-w-lg mx-auto font-medium">라멘 매니아들의 솔직한 이야기와 꿀팁을 공유하세요</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <Link href="/community/write" className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold transition-all shadow-sm active:scale-95 group">
                <PenSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                글쓰기
              </Link>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">카테고리</h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        selectedCategory === cat.id ? 'bg-stone-900 text-white shadow-md' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {selectedCategory === 'REVIEW' && (
              <div className="mb-6" ref={dropdownRef}>
                <div className="relative">
                  <button
                    onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                    className="w-full flex items-center justify-between gap-3 px-6 py-4 bg-white border border-stone-200 rounded-2xl shadow-sm hover:border-red-300 transition-all text-sm font-bold text-stone-700"
                  >
                    <div className="flex items-center gap-2">
                      <Store className={`w-5 h-5 ${selectedShopId ? 'text-red-600' : 'text-stone-400'}`} />
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
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl z-30 overflow-hidden flex flex-col max-h-80 animate-scale-in">
                      <div className="p-4 border-b border-stone-100 bg-stone-50">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            placeholder="가게 이름을 입력하세요..."
                            value={shopSearchQuery}
                            onChange={(e) => setShopSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 bg-white font-medium"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto">
                        <button
                          onClick={() => { setSelectedShopId(null); setSelectedShopName(''); setIsShopDropdownOpen(false); }}
                          className={`w-full px-5 py-4 text-left text-sm hover:bg-stone-50 border-b border-stone-50 font-bold ${!selectedShopId ? 'text-red-600' : 'text-stone-600'}`}
                        >
                          전체 후기 보기
                        </button>
                        {shopOptions.map(shop => (
                          <button
                            key={shop.id}
                            onClick={() => { setSelectedShopId(shop.id); setSelectedShopName(shop.name); setIsShopDropdownOpen(false); setCurrentPage(0); }}
                            className={`w-full px-5 py-4 text-left text-sm hover:bg-stone-50 border-b border-stone-50 transition-colors ${selectedShopId === shop.id ? 'bg-red-50 text-red-600 font-bold' : 'text-stone-700'}`}
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
                      className="group bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:border-red-300 hover:shadow-md transition-all flex flex-col md:flex-row gap-6 cursor-pointer"
                    >
                      {post.imageUrl && (
                        <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 relative">
                          <img 
                            src={post.imageUrl} 
                            alt={post.title} 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter bg-red-50 px-2 py-1 rounded">
                            {getCategoryLabel(post.category)}
                          </span>
                          {post.storeName && (
                            <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1 uppercase tracking-tighter">
                              <Store className="w-3 h-3" /> {post.storeName}
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-red-600 transition-colors truncate">{post.title}</h2>
                        <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed mb-4">{stripHtml(post.contentPreview)}</p>
                        <div className="flex items-center justify-between text-[10px] text-stone-400 font-black uppercase tracking-widest border-t border-stone-50 pt-4">
                          <div className="flex items-center gap-4">
                            {/* Inner link for author stays, but parent is now a div */}
                            <div className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); router.push(`/user/${post.authorId}`); }}>
                              <div className="w-5 h-5 rounded-full overflow-hidden bg-stone-100 border border-stone-200 shadow-sm flex-shrink-0">
                                {post.authorImageUrl ? (
                                  <img src={post.authorImageUrl} alt={post.authorName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] bg-stone-200 text-stone-400">🍜</div>
                                )}
                              </div>
                              <span className="hover:text-stone-900 transition-colors">{post.authorName}</span>
                            </div>
                            <span className="font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likeCount}</span>
                            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.commentCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl py-32 text-center border border-dashed border-stone-300">
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
                  className="flex items-center gap-2 text-xs font-black text-stone-400 hover:text-red-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
                >
                  <ChevronLeft className="w-4 h-4" /> 이전
                </button>
                <div className="flex gap-2">
                  {[...Array(pageInfo.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setCurrentPage(i); window.scrollTo(0, 0); }}
                      className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                        currentPage === i 
                          ? 'bg-red-600 text-white shadow-lg' 
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
                  className="flex items-center gap-2 text-xs font-black text-stone-400 hover:text-red-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
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
