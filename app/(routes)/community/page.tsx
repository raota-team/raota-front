'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MessageCircle, Heart, ChevronDown, PenSquare, Store, Search } from 'lucide-react';
import { communityCategories, mockCommunityPosts } from '../../lib/community-data';
import { useRamenShops } from '@/hooks/queries/useRamenShops';
import { useRouter } from 'next/navigation';

export default function CommunityPage() {
  const router = useRouter();
  const { data } = useRamenShops({ page: 0, size: 100 });
  const shops = data?.shops ?? [];
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const postsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShopDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedCategory !== 'review') {
      setSelectedShopId(null);
    }
  }, [selectedCategory]);

  const POSTS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    return mockCommunityPosts
      .filter(post => {
        if (selectedCategory !== 'all' && post.category !== selectedCategory) {
          return false;
        }
        if (selectedShopId && post.shopId !== selectedShopId) {
          return false;
        }
        if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        if (showPopularOnly && post.likes < 10) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [selectedCategory, selectedShopId, searchQuery, showPopularOnly]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedShopId, searchQuery, showPopularOnly]);

  const displayedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) pages.push('...');

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (postsListRef.current) {
      postsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const selectedShop = shops?.find(s => s.id === selectedShopId);

  const getCategoryStyle = (categoryId: string) => {
    switch (categoryId) {
      case 'review': return 'bg-red-50 text-red-600 border-red-200';
      case 'tip': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'question': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 relative rounded-2xl overflow-hidden shadow-lg h-48 md:h-80">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url('/header-community-v2.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
        <div className="relative z-10 px-6 h-full flex flex-col justify-center items-center text-center text-white">
          <div className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider uppercase bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
            Raota Community
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-300 drop-shadow-sm">
            RAOTA 커뮤니티
          </h2>
          <p className="text-stone-300 max-w-lg mx-auto font-medium">
            라멘을 사랑하는 사람들의 생생한 이야기를 나눠보세요
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {communityCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${selectedCategory === cat.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-stone-700 border-2 border-stone-300 hover:border-red-400 hover:bg-red-50'
                } `}
            >
              <span className="mr-1.5">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search and Shop Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="글 제목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Shop Dropdown */}
          {selectedCategory === 'review' && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-700 hover:border-stone-300 transition-colors min-w-[200px]"
              >
                <Store className="w-4 h-4 text-stone-400" />
                <span className="flex-1 text-left truncate">
                  {selectedShop ? selectedShop.name : '라멘집 필터'}
                </span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isShopDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-stone-200 rounded-lg shadow-xl z-20 overflow-hidden flex flex-col max-h-80">
                  <div className="p-2 border-b border-stone-100 bg-stone-50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                      <input
                        type="text"
                        placeholder="라멘집 검색..."
                        value={shopSearchQuery}
                        onChange={(e) => setShopSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto">
                    <button
                      onClick={() => { setSelectedShopId(null); setIsShopDropdownOpen(false); }}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-stone-50 ${!selectedShopId ? 'bg-red-50 text-red-600 font-semibold' : 'text-stone-700'}`}
                    >
                      전체 라멘집
                    </button>
                    {shops
                      ?.filter(shop => !shopSearchQuery || shop.name.toLowerCase().includes(shopSearchQuery.toLowerCase()))
                      .map(shop => (
                        <button
                          key={shop.id}
                          onClick={() => { setSelectedShopId(shop.id); setIsShopDropdownOpen(false); }}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-stone-50 border-t border-stone-100 ${selectedShopId === shop.id ? 'bg-red-50 text-red-600 font-semibold' : 'text-stone-700'}`}
                        >
                          <div className="font-medium">{shop.name}</div>
                          <div className="text-xs text-stone-400">{shop.location}</div>
                        </button>
                      ))
                    }
                    {shops?.filter(shop => !shopSearchQuery || shop.name.toLowerCase().includes(shopSearchQuery.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-center text-xs text-stone-400">
                        검색 결과가 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">필터</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowPopularOnly(!showPopularOnly)}
              className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${showPopularOnly ? 'bg-red-600 text-white shadow-md' : 'bg-white text-stone-700 border-2 border-stone-300 hover:border-red-400 hover:bg-red-50'} `}
            >
              {showPopularOnly ? '✓ ' : ''}인기글만 보기
            </button>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div ref={postsListRef} className="space-y-4">
        {displayedPosts.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-lg">해당 조건의 글이 없습니다.</p>
            <p className="text-sm mt-2">다른 필터를 선택하거나 새 글을 작성해보세요!</p>
          </div>
        ) : (
          displayedPosts.map(post => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="block bg-white border border-stone-200 rounded-xl p-5 hover:shadow-lg hover:border-stone-300 transition-all group"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                {post.imageUrl && (
                  <div className="hidden sm:block w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Category & Shop */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getCategoryStyle(post.category)}`}>
                      {post.categoryName}
                    </span>
                    {post.shopName && (
                      <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                        📍 {post.shopName}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-red-600 transition-colors mb-2 line-clamp-1">
                    {post.title}
                  </h3>

                  {/* Preview Content */}
                  <p className="text-sm text-stone-500 line-clamp-2 mb-3">
                    {post.content?.replace(/<[^>]*>?/gm, '') || ''}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <div className="flex items-center gap-3">
                      <span 
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/user/${post.authorId}`);
                        }}
                        className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer z-10"
                      >
                        <span>{post.authorAvatar}</span>
                        <span className="font-medium text-stone-600 hover:text-red-600 hover:underline">{post.author}</span>
                      </span>
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3.5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${currentPage === 1
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                } `}
            >
              이전
            </button>

            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-stone-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  className={`min-w-[40px] h-[40px] rounded-lg font-bold text-sm transition-all duration-200 ${currentPage === page
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                    } `}
                >
                  {page}
                </button>
              )
            ))}

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3.5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${currentPage === totalPages
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                } `}
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* Floating Write Button */}
      <Link
        href="/community/write"
        className="fixed bottom-24 md:bottom-8 right-6 flex items-center gap-2 px-5 py-3 bg-red-600 text-white font-bold rounded-full shadow-xl hover:bg-red-700 hover:shadow-2xl transition-all z-30 group"
      >
        <PenSquare className="w-5 h-5" />
        <span className="hidden sm:inline">글 작성하기</span>
      </Link>
    </div>
  );
}
