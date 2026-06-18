'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Eye,
  Heart,
  ChevronDown,
  PenSquare,
  Store,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
  Images,
  UserRound,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCommunityPosts, getRamenShopOptions, type CommunityPostCard } from '@/lib/api/community';
import Loading from '@/app/loading';
import { useApp } from '@/app/context/AppContext';

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'REVIEW':
      return '맛집후기';
    case 'TIP':
      return '라멘꿀팁';
    case 'QUESTION':
      return 'Q&A';
    case 'FREE':
      return '자유게시판';
    default:
      return category;
  }
};

const categories = [
  { id: 'all', label: '전체' },
  { id: 'REVIEW', label: '맛집후기' },
  { id: 'TIP', label: '라멘꿀팁' },
  { id: 'QUESTION', label: 'Q&A' },
  { id: 'FREE', label: '자유게시판' },
];

const PAGE_SIZE = 10;

const formatDate = (value: string) => {
  if (!value) return '';

  return new Date(value).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
};

const getVisiblePages = (totalPages: number, currentPage: number) => {
  const start = Math.max(0, currentPage - 2);
  const end = Math.min(totalPages, start + 5);
  const adjustedStart = Math.max(0, end - 5);

  return Array.from({ length: end - adjustedStart }, (_, index) => adjustedStart + index);
};

function AuthorChip({ post }: { post: CommunityPostCard }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        router.push(`/user/${post.authorId}`);
      }}
      className="flex min-w-0 items-center gap-2 text-left"
    >
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100">
        {post.authorImageUrl ? (
          <img src={post.authorImageUrl} alt={post.authorName} className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-3.5 w-3.5 text-stone-400" />
        )}
      </div>
      <span className="truncate text-xs font-bold text-stone-500 transition-colors hover:text-[#25282b]">
        {post.authorName}
      </span>
    </button>
  );
}

function Engagement({ post }: { post: CommunityPostCard }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-3 text-xs font-black text-stone-400">
      <span className="flex items-center gap-1">
        <Heart className="h-3.5 w-3.5" />
        {post.likeCount}
      </span>
      <span className="flex items-center gap-1">
        <MessageCircle className="h-3.5 w-3.5" />
        {post.commentCount}
      </span>
      <span className="flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        {post.viewCount}
      </span>
    </div>
  );
}

function PostListCard({ post }: { post: CommunityPostCard }) {
  const router = useRouter();
  const openPost = () => {
    if (post.postId > 0) router.push(`/community/${post.postId}`);
  };

  return (
    <article
      onClick={openPost}
      className="group flex w-full cursor-pointer gap-4 bg-white px-2 py-4 transition-colors hover:bg-stone-50 sm:py-5"
    >
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="mb-1.5 flex min-w-0 flex-wrap items-center gap-2">
          <span className="rounded-sm border border-[#e60000] bg-white px-2 py-0.5 text-[10px] font-black uppercase text-[#25282b]">
            {getCategoryLabel(post.category)}
          </span>
          <span className="text-xs font-bold text-stone-400">{formatDate(post.createdAt)}</span>
          {post.storeName && (
            <span className="flex min-w-0 items-center gap-1 truncate text-xs font-bold text-stone-400">
              <Store className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{post.storeName}</span>
            </span>
          )}
        </div>
        <h2 className="mb-1.5 truncate text-base font-black text-[#25282b] transition-colors group-hover:text-[#e60000]">
          {post.title}
        </h2>
        <div className="mt-auto flex items-center gap-4">
          <AuthorChip post={post} />
          <Engagement post={post} />
        </div>
      </div>
      {post.imageUrl && (
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-stone-100 sm:h-24 sm:w-28">
          <img src={post.imageUrl} alt={post.title} loading="lazy" className="h-full w-full object-cover" />
        </div>
      )}
    </article>
  );
}

export default function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, isAuthChecking, showConfirm } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [selectedShopName, setSelectedShopName] = useState('');
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [shopOptions, setShopOptions] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialCategory = searchParams.get('category');

    if (initialCategory && categories.some((category) => category.id === initialCategory)) {
      setSelectedCategory(initialCategory);
      setCurrentPage(0);
      return;
    }

    setSelectedCategory('all');
  }, [searchParams]);

  const { data: postsData, isLoading, isFetching } = useQuery({
    queryKey: ['community-posts', selectedCategory, selectedShopId],
    queryFn: () =>
      getCommunityPosts({
        page: 0,
        size: 100,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        ramenShopId: selectedShopId,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });

  const apiPosts: CommunityPostCard[] = postsData?.data?.items || [];
  const allPosts = [...apiPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const totalPages = Math.max(1, Math.ceil(allPosts.length / PAGE_SIZE));
  const pageInfo = {
    totalPages,
    hasPrevious: currentPage > 0,
    hasNext: currentPage < totalPages - 1,
  };
  const posts = allPosts.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const visiblePages = getVisiblePages(pageInfo.totalPages, currentPage);
  const featuredPosts = allPosts.slice(0, 3);

  useEffect(() => {
    const fetchShopOptions = async () => {
      try {
        const res = await getRamenShopOptions(shopSearchQuery, 0, 'NAME');
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShopDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(Math.max(totalPages - 1, 0));
    }
  }, [currentPage, totalPages]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedShopId(null);
    setSelectedShopName('');
    setCurrentPage(0);
  };

  const goToWrite = (href: string) => {
    if (isAuthChecking) return;

    if (!isLoggedIn) {
      showConfirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?', () => {
        router.push('/login');
      });
      return;
    }

    router.push(href);
  };

  if (isLoading && posts.length === 0) {
    // Return empty here so we can show skeleton cards inside the main layout
    // instead of a blocking full-screen loading spinner
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-32 overflow-hidden md:h-[14rem]">
        <div className="absolute inset-0">
          <img src="/header-community-anime.png" alt="Community" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#25282b]/55" />
        </div>
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-6 text-center text-white md:pt-16 md:pb-6">
          <h1 className="vodafone-display mb-3 text-3xl leading-none text-white sm:text-4xl md:text-5xl">
            RAOTA COMMUNITY<span className="text-[#e60000]">.</span>
          </h1>
          <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-white/85 sm:max-w-lg sm:text-lg">
            라멘 매니아들과 이야기를 나눠보세요
          </p>
        </div>
      </section>

      <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-black transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-[#e60000] text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => goToWrite('/community/write')}
              className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-sm bg-[#e60000] px-3.5 py-2.5 text-sm font-black text-white transition-opacity hover:opacity-90 md:px-4 md:py-2"
            >
              <PenSquare className="h-4 w-4" />
              글쓰기
            </button>
          </div>

          {selectedCategory === 'REVIEW' && (
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsShopDropdownOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-3 rounded-sm border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition-colors hover:border-[#e60000]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Store className={`h-4 w-4 flex-shrink-0 ${selectedShopId ? 'text-[#e60000]' : 'text-stone-400'}`} />
                  <span className="truncate">{selectedShopId ? `${selectedShopName} 후기만 보기` : '라멘집별 후기 찾아보기'}</span>
                </span>
                <span className="flex items-center gap-2">
                  {selectedShopId && (
                    <span
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedShopId(null);
                        setSelectedShopName('');
                      }}
                      className="rounded-full p-1 text-stone-400 hover:bg-stone-100"
                    >
                      <X className="h-4 w-4" />
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
                </span>
              </button>

              {isShopDropdownOpen && (
                <div className="absolute left-0 right-0 z-30 mt-2 flex max-h-80 flex-col overflow-hidden rounded-md border border-stone-200 bg-white shadow-none">
                  <div className="border-b border-stone-100 bg-stone-50 p-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="가게 이름 검색"
                        value={shopSearchQuery}
                        onChange={(event) => setShopSearchQuery(event.target.value)}
                        className="w-full rounded-sm border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium focus:border-[#e60000] focus:outline-none"
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
                      className={`w-full border-b border-stone-50 px-5 py-3 text-left text-sm font-bold hover:bg-stone-50 ${
                        !selectedShopId ? 'text-[#e60000]' : 'text-stone-600'
                      }`}
                    >
                      전체 후기 보기
                    </button>
                    {shopOptions.map((shop) => (
                      <button
                        key={shop.id}
                        type="button"
                        onClick={() => {
                          setSelectedShopId(shop.id);
                          setSelectedShopName(shop.name);
                          setIsShopDropdownOpen(false);
                          setCurrentPage(0);
                        }}
                        className={`w-full border-b border-stone-50 px-5 py-3 text-left text-sm transition-colors hover:bg-stone-50 ${
                          selectedShopId === shop.id ? 'bg-stone-50 font-bold text-[#e60000]' : 'text-stone-700'
                        }`}
                      >
                        <div className="font-bold">{shop.name}</div>
                        <div className="mt-0.5 text-xs text-stone-400">{shop.region}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_20rem] lg:px-8 lg:py-10">
        <main className="min-h-[48rem] min-w-0">
          <section className="mb-6 rounded-md border border-stone-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e60000]">오늘의 질문</p>
                <h2 className="mt-2 text-lg font-black text-[#25282b]">요즘 가장 자주 생각나는 라멘집은 어디인가요?</h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  긴 후기 말고 한두 줄만 남겨도 좋아요. 오늘의 질문으로 가볍게 커뮤니티에 참여해보세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToWrite(`/community/write?category=FREE&title=${encodeURIComponent('오늘의 질문: 요즘 가장 자주 생각나는 라멘집은 어디인가요?')}&content=${encodeURIComponent('<p>저는 요즘 이 라멘집이 자꾸 생각나요.</p><p>이유는...</p>')}`)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#e60000] px-4 py-2.5 text-sm font-black text-white transition-opacity hover:opacity-90 sm:w-auto sm:shrink-0"
              >
                답변 쓰기
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">
                {categories.find((cat) => cat.id === selectedCategory)?.label || '전체'}
              </p>
            </div>
            {isFetching && <span className="text-xs font-bold text-stone-400">업데이트 중</span>}
          </div>

          {isLoading && posts.length === 0 ? (
            <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex w-full animate-pulse gap-4 bg-white px-0 py-4 sm:py-5">
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="h-4 w-1/3 rounded bg-stone-200"></div>
                    <div className="h-6 w-3/4 rounded bg-stone-200"></div>
                    <div className="h-4 w-1/4 rounded bg-stone-200"></div>
                  </div>
                  <div className="h-20 w-20 rounded-sm bg-stone-200 sm:h-24 sm:w-28"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className={`divide-y divide-stone-200 border-t border-b border-stone-200 transition-opacity duration-300 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
              {posts.map((post) =>
                <PostListCard key={post.postId} post={post} />,
              )}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-stone-300 bg-white py-28 text-center">
              <Images className="mx-auto mb-4 h-10 w-10 text-stone-200" />
              <p className="text-sm font-black uppercase tracking-widest text-stone-400">게시글이 없습니다</p>
              <p className="mt-2 text-xs text-stone-300">첫 번째 글의 주인공이 되어보세요.</p>
            </div>
          )}

          {pageInfo && pageInfo.totalPages > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 pb-16">
              <button
                disabled={!pageInfo.hasPrevious}
                onClick={() => {
                  setCurrentPage((page) => page - 1);
                  window.scrollTo(0, 0);
                }}
                className="flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-stone-500 transition-colors hover:border-[#e60000] hover:text-[#e60000] disabled:cursor-not-allowed disabled:opacity-20"
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </button>
              <div className="flex gap-2">
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo(0, 0);
                    }}
                    className={`h-9 w-9 rounded-full text-xs font-black transition-colors ${
                      currentPage === page
                        ? 'bg-[#e60000] text-white'
                        : 'border border-stone-200 bg-white text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={!pageInfo.hasNext}
                onClick={() => {
                  setCurrentPage((page) => page + 1);
                  window.scrollTo(0, 0);
                }}
                className="flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-stone-500 transition-colors hover:border-[#e60000] hover:text-[#e60000] disabled:cursor-not-allowed disabled:opacity-20"
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>

        <aside className="space-y-4 lg:self-start">
          <section className="rounded-md border border-stone-200 bg-[#25282b] p-5 text-white">
            <div className="mb-4 flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#e60000]" />
              <h3 className="text-sm font-black uppercase tracking-widest">지금 핫한 글</h3>
            </div>
            <div className="space-y-4">
              {featuredPosts.length > 0 ? (
                featuredPosts.map((post) => (
                  <Link
                    key={post.postId}
                    href={post.postId > 0 ? `/community/${post.postId}` : '/community'}
                    className="block border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
                  >
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/45">
                      {getCategoryLabel(post.category)}
                    </p>
                    <p className="line-clamp-2 text-sm font-bold leading-5 text-white transition-colors hover:text-[#e60000]">
                      {post.title}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-white/55">표시할 글이 아직 없습니다.</p>
              )}
            </div>
          </section>

          <section className="rounded-md border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#e60000]" />
              <h3 className="text-sm font-black uppercase tracking-widest text-[#25282b]">추천받기</h3>
            </div>
            <p className="text-sm leading-6 text-stone-500">
              후기들을 둘러보다 다음 한 그릇이 궁금해지면 취향에 맞는 가게를 찾아보세요.
            </p>
            <Link
              href="/recommend"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#e60000] px-4 py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
            >
              추천받기
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
