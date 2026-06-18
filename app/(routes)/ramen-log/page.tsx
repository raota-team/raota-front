'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Masonry from 'react-masonry-css';
import {
  Camera,
  ChevronDown,
  Heart,
  Plus,
  Search,
  Store,
  UserRound,
} from 'lucide-react';
import RamenLogModal, { type RamenLogFormData, type TasteNoteKey, type TasteNotes } from '@/app/components/RamenLogModal';
import { useApp } from '@/app/context/AppContext';
import { getAccessToken } from '@/lib/auth/accessToken';

const PhotoModal = dynamic(() => import('@/app/components/PhotoModal'), { ssr: false });

type RamenLog = {
  id: number;
  author: {
    id: number;
    name: string;
    imageUrl?: string;
  };
  shop: {
    id?: number;
    name: string;
    location: string;
  };
  menuName: string;
  ramenType: string;
  imageUrl: string;
  date: string;
  note: string;
  tasteNotes: TasteNotes;
  revisit: '또 감' | '가끔 생각남' | '한번이면 충분';
  likes: number;
  isPublic?: boolean;
};

const logs: RamenLog[] = [
  {
    id: 1,
    author: { id: 12, name: '멘마수집가' },
    shop: { id: 1, name: '멘야 하루', location: '서울 마포구' },
    menuName: '특제 돈코츠 라멘',
    ramenType: '돈코츠',
    imageUrl: '/hero-home.webp',
    date: '2026-06-17',
    note: '기름진데 끝맛이 둔하지 않아서 좋았다. 다음엔 면을 조금 단단하게 부탁해볼 듯.',
    tasteNotes: {
      broth: ['진해요', '감칠맛 좋아요'],
      noodle: ['단단해요'],
      seasoning: ['딱 좋아요'],
      topping: ['차슈 좋아요', '구성 알차요'],
    },
    revisit: '또 감',
    likes: 38,
  },
  {
    id: 2,
    author: { id: 27, name: '시오파' },
    shop: { id: 4, name: '시오노미', location: '서울 용산구' },
    menuName: '특제 시오 라멘',
    ramenType: '시오',
    imageUrl: '/header-recommend.png',
    date: '2026-06-16',
    note: '깔끔한 닭육수에 향이 또렷했다. 간은 살짝 강하지만 비 오는 날 생각날 맛.',
    tasteNotes: {
      broth: ['깔끔해요', '감칠맛 좋아요'],
      noodle: ['부드러워요'],
      seasoning: ['짭짤해요'],
      topping: ['계란 좋아요'],
    },
    revisit: '가끔 생각남',
    likes: 24,
  },
  {
    id: 3,
    author: { id: 33, name: '면익힘보통' },
    shop: { id: 2, name: '라멘 아오이', location: '서울 성동구' },
    menuName: '아지타마 쇼유 라멘',
    ramenType: '쇼유',
    imageUrl: '/header-shoplist-anime.png',
    date: '2026-06-15',
    note: '첫 입은 담백하고 뒤로 갈수록 감칠맛이 올라온다. 계란이 오늘의 주인공.',
    tasteNotes: {
      broth: ['감칠맛 좋아요', '깔끔해요'],
      noodle: ['탄력 있어요', '국물 흡착 좋아요'],
      seasoning: ['딱 좋아요'],
      topping: ['계란 좋아요'],
    },
    revisit: '또 감',
    likes: 41,
  },
  {
    id: 4,
    author: { id: 45, name: '츠케멘러버' },
    shop: { id: 8, name: '로쿠린샤 스타일', location: '서울 강남구' },
    menuName: '농후 츠케멘',
    ramenType: '츠케멘',
    imageUrl: '/hero-ramen.jpg',
    date: '2026-06-14',
    note: '면 씹는 맛이 확실하고 찍어 먹는 농도가 좋았다. 마지막 스프와리까지 만족.',
    tasteNotes: {
      broth: ['진해요', '기름져요'],
      noodle: ['탄력 있어요', '양 많아요'],
      seasoning: ['딱 좋아요'],
      topping: ['구성 알차요'],
    },
    revisit: '또 감',
    likes: 52,
  },
  {
    id: 5,
    author: { id: 51, name: '마제중독' },
    shop: { id: 9, name: '코하쿠 라멘', location: '서울 종로구' },
    menuName: '카라 미소 라멘',
    ramenType: '미소',
    imageUrl: '/header-community-v2.jpg',
    date: '2026-06-12',
    note: '구수함은 좋은데 내 기준엔 간이 조금 셌다. 밥 추가하면 밸런스가 맞을 듯.',
    tasteNotes: {
      broth: ['진해요'],
      noodle: ['부드러워요'],
      seasoning: ['짭짤해요', '밥 생각나요'],
      topping: ['계란 좋아요'],
    },
    revisit: '가끔 생각남',
    likes: 19,
  },
  {
    id: 6,
    author: { id: 64, name: '차슈한입' },
    shop: { id: 11, name: '니보시 하우스', location: '서울 중구' },
    menuName: '니보시 쇼유',
    ramenType: '쇼유',
    imageUrl: '/header-community-anime.png',
    date: '2026-06-11',
    note: '어패류 향이 꽤 선명하다. 취향 타지만 좋아하는 사람은 계속 생각날 타입.',
    tasteNotes: {
      broth: ['어패류 향', '감칠맛 좋아요'],
      noodle: ['단단해요'],
      seasoning: ['슴슴해요'],
      topping: ['파 향 좋아요'],
    },
    revisit: '가끔 생각남',
    likes: 28,
  },
];

const typeFilters = ['전체', '돈코츠', '쇼유', '시오', '미소', '츠케멘'];
const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
] as const;

type SortOption = (typeof sortOptions)[number]['value'];

const masonryBreakpoints = {
  default: 3,
  1023: 2,
};

const tasteNoteLabels: Record<TasteNoteKey, string> = {
  broth: '국물',
  noodle: '면',
  seasoning: '간',
  topping: '토핑',
};

const tasteNoteOrder: TasteNoteKey[] = ['broth', 'noodle', 'seasoning', 'topping'];

const getTasteNoteValues = (tasteNotes: TasteNotes) =>
  tasteNoteOrder.flatMap((key) => tasteNotes[key]);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });

const getImageAspectClass = (id: number) => {
  const aspectClasses = ['aspect-[4/5]', 'aspect-square', 'aspect-[3/4]', 'aspect-[5/4]', 'aspect-[4/3]'];
  return aspectClasses[id % aspectClasses.length];
};

function RamenLogCard({ log, onImageClick }: { log: RamenLog; onImageClick: (log: RamenLog) => void }) {
  const tasteSummary = getTasteNoteValues(log.tasteNotes);
  const visibleTasteNotes = tasteSummary.slice(0, 3);
  const mobileTasteNote = tasteSummary[0];
  const hiddenTasteNoteCount = Math.max(0, tasteSummary.length - visibleTasteNotes.length);
  const mobileHiddenTasteNoteCount = Math.max(0, tasteSummary.length - 1);

  return (
    <article
      onClick={() => onImageClick(log)}
      className="group mb-2 break-inside-avoid overflow-hidden rounded-md border border-stone-200 bg-white transition-colors hover:border-[#e60000] sm:mb-4 cursor-pointer"
    >
      <div
        className={`relative block w-full overflow-hidden bg-stone-100 ${getImageAspectClass(log.id)}`}
      >
        <Image
          src={log.imageUrl}
          alt={`${log.shop.name} ${log.menuName}`}
          fill
          sizes="(min-width: 1024px) 33vw, 50vw"
          className="object-cover"
        />
      </div>

      <div className="p-2.5 sm:p-3.5">
        <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3 sm:gap-3">
          <div className="min-w-0">
            {log.shop.id ? (
              <Link
                href={`/shop/${log.shop.id}`}
                className="group/shop flex min-w-0 items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Store className="h-3 w-3 shrink-0 text-stone-400 group-hover/shop:text-[#e60000] sm:h-3.5 sm:w-3.5" />
                <span className="truncate text-[10px] font-black text-stone-500 group-hover/shop:text-[#e60000] sm:text-xs">
                  {log.shop.name}
                </span>
              </Link>
            ) : (
              <span className="flex min-w-0 items-center gap-1.5">
                <Store className="h-3 w-3 shrink-0 text-stone-400 sm:h-3.5 sm:w-3.5" />
                <span className="truncate text-[10px] font-black text-stone-500 sm:text-xs">{log.shop.name}</span>
              </span>
            )}
            <h2 className="mt-1 line-clamp-2 text-sm font-black leading-5 text-[#25282b] sm:truncate sm:text-lg">
              {log.menuName}
            </h2>
            <p className="mt-0.5 hidden text-xs font-bold text-stone-400 sm:block">{log.shop.location}</p>
          </div>
          <span className="hidden shrink-0 text-xs font-bold text-stone-400 sm:block">{formatDate(log.date)}</span>
        </div>

        <p className="hidden line-clamp-3 text-sm font-medium leading-6 text-stone-600 sm:block">{log.note}</p>

        {mobileTasteNote && (
          <div className="mt-2 flex min-w-0 items-center gap-1 sm:hidden">
            <span className="max-w-full truncate rounded-full bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-600">
              {mobileTasteNote}
            </span>
            {mobileHiddenTasteNoteCount > 0 && (
              <span className="shrink-0 text-[10px] font-black text-stone-400">+{mobileHiddenTasteNoteCount}</span>
            )}
          </div>
        )}

        {visibleTasteNotes.length > 0 && (
          <div className="mt-3 hidden flex-wrap items-center gap-1.5 sm:flex">
            <span className="mr-1 text-[10px] font-black uppercase text-stone-400">취향</span>
            {visibleTasteNotes.map((note) => (
              <span key={note} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-600">
                {note}
              </span>
            ))}
            {hiddenTasteNoteCount > 0 && (
              <span className="text-xs font-black text-stone-400">+{hiddenTasteNoteCount}</span>
            )}
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between border-t border-stone-100 pt-2.5 sm:mt-4 sm:pt-3">
          <Link
            href={`/user/${log.author.id}`}
            className="flex min-w-0 items-center gap-1.5 sm:gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 sm:h-7 sm:w-7">
              {log.author.imageUrl ? (
                <Image src={log.author.imageUrl} alt={log.author.name} width={28} height={28} className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-3 w-3 text-stone-400 sm:h-3.5 sm:w-3.5" />
              )}
            </span>
            <span className="truncate text-[10px] font-black text-stone-500 sm:text-xs">{log.author.name}</span>
          </Link>

          <div className="flex shrink-0 items-center gap-3 text-[10px] font-black text-stone-400 sm:text-xs">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {log.likes}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function RamenLogPage() {
  const router = useRouter();
  const { isLoggedIn, isAuthChecking, currentUser, showConfirm, showToast } = useApp();
  const [logItems, setLogItems] = useState<RamenLog[]>(logs);
  const [activeType, setActiveType] = useState('전체');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<RamenLog | null>(null);

  const filteredLogs = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    const currentUserId = currentUser?.user_id ?? currentUser?.id;

    return [...logItems]
      .filter((log) => log.isPublic !== false || log.author.id === currentUserId)
      .filter((log) => activeType === '전체' || log.ramenType === activeType)
      .filter((log) => {
        if (!keyword) return true;
        return [log.shop.name, log.menuName, log.ramenType, log.note, ...getTasteNoteValues(log.tasteNotes)]
          .join(' ')
          .toLowerCase()
          .includes(keyword);
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.likes - a.likes;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [activeType, logItems, searchQuery, sortBy, currentUser]);

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

  const handleCreateLog = (data: RamenLogFormData) => {
    const userId = currentUser?.user_id ?? currentUser?.id ?? 0;
    const authorName = currentUser?.nickname ?? currentUser?.name ?? '나';

    setLogItems((current) => [
      {
        id: Date.now(),
        author: {
          id: userId,
          name: authorName,
          imageUrl: currentUser?.profile_image_url,
        },
        shop: {
          id: data.shopId,
          name: data.shopName,
          location: data.shopId ? '라오타 연동 가게' : '직접 기록',
        },
        menuName: data.menuName,
        ramenType: data.ramenType,
        imageUrl: data.imageUrl,
        date: new Date().toISOString(),
        note: data.note || '선택형 취향 기록으로 남긴 라멘로그입니다.',
        tasteNotes: data.tasteNotes,
        revisit: data.revisit,
        likes: 0,
        isPublic: data.isPublic,
      },
      ...current,
    ]);
    showToast('라멘로그를 저장했습니다.', 'success');
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
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center text-white sm:px-6 md:pt-16 md:pb-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="vodafone-display mb-3 text-3xl leading-none text-white sm:text-4xl md:text-5xl">
              RAMEN LOG<span className="text-[#e60000]">.</span>
            </h1>
            <p className="mx-auto max-w-lg break-keep text-sm font-medium leading-relaxed text-white/85 sm:text-lg">
              유저들의 생생한 라멘 기록을 둘러보세요.
            </p>
          </div>
        </div>
      </section>

      <div className="sticky top-14 z-20 border-b border-stone-200 bg-white/95 backdrop-blur md:top-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="가게, 메뉴, 맛 기록 검색"
                className="h-11 w-full rounded-sm border border-stone-200 bg-white pl-9 pr-3 text-sm font-bold text-[#25282b] outline-none transition-colors placeholder:text-stone-400 focus:border-[#e60000]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
              <label className="relative">
                <select
                  value={activeType}
                  onChange={(event) => setActiveType(event.target.value)}
                  className="h-11 w-full appearance-none rounded-sm border border-stone-200 bg-white pl-3 pr-9 text-sm font-black text-[#25282b] outline-none transition-colors focus:border-[#e60000] sm:w-32"
                >
                  {typeFilters.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              </label>

              <label className="relative">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="h-11 w-full appearance-none rounded-sm border border-stone-200 bg-white pl-3 pr-9 text-sm font-black text-[#25282b] outline-none transition-colors focus:border-[#e60000] sm:w-32"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              </label>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-sm bg-[#e60000] px-4 text-sm font-black text-white transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              기록하기
            </button>
          </div>

        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="min-w-0">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">공개 노트</p>
              <h2 className="mt-1 text-xl font-black text-[#25282b]">라멘러들의 기록</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-stone-500">
                저장하고, 다시 보고, 취향을 비교하기 좋은 한 그릇 로그입니다.
              </p>
            </div>
            <span className="shrink-0 text-xs font-black text-stone-400">{filteredLogs.length}개 로그</span>
          </div>

          {filteredLogs.length > 0 ? (
            <Masonry
              breakpointCols={masonryBreakpoints}
              className="ramen-log-masonry"
              columnClassName="ramen-log-masonry-column"
            >
              {filteredLogs.map((log) => (
                <RamenLogCard key={log.id} log={log} onImageClick={setSelectedLog} />
              ))}
            </Masonry>
          ) : (
            <div className="rounded-md border border-dashed border-stone-300 py-24 text-center">
              <Camera className="mx-auto mb-4 h-10 w-10 text-stone-200" />
              <p className="text-sm font-black uppercase tracking-widest text-stone-400">라멘 로그가 없습니다</p>
              <p className="mt-2 text-xs font-bold text-stone-300">다른 조건으로 다시 찾아보세요.</p>
            </div>
          )}
        </section>
      </main>

      <RamenLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onCreate={handleCreateLog}
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
            date: formatDate(selectedLog.date),
            comment: selectedLog.note,
            revisit: selectedLog.revisit,
            tasteNotes: tasteNoteOrder
              .filter((key) => selectedLog.tasteNotes[key].length > 0)
              .map((key) => ({ label: tasteNoteLabels[key], values: selectedLog.tasteNotes[key] })),
          }}
          onClose={() => setSelectedLog(null)}
          disableNavigation
        />
      )}
    </div>
  );
}
