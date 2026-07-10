"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import {
  Eye,
  Star,
  Menu,
  MapPin,
  ArrowLeft,
  Instagram,
  Sparkles,
  Utensils,
  Heart,
  Users,
  NotebookPen,
  Clock3,
  ChevronDown,
  X,
} from "lucide-react";
import { Shop } from "../../../types";
import Loading from "@/app/loading";
import { useRamenShopDetail } from "@/hooks/queries/useRamenShopDetail";
import { toggleBookmark, voteMenu, getVoteStatus, increaseShopViewCount } from "@/lib/api/ramen-shops";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/app/context/AppContext";
import { ApiClientError } from "@/lib/api/client";
import ResilientImage from "@/app/components/ResilientImage";
import ShopRamenLogPreview from "@/app/components/ShopRamenLogPreview";
import type { RamenLogFormData } from "@/app/components/RamenLogModal";
import { createRamenLog, toRevisitValue } from "@/lib/api/ramen-logs";
import ShopComparePanel from "@/app/components/ShopComparePanel";

const ReportModal = dynamic(() => import("../../../components/ReportModal"), { ssr: false });
const VoteMenuModal = dynamic(() => import("../../../components/VoteMenuModal"), { ssr: false });
const RamenLogModal = dynamic(() => import("../../../components/RamenLogModal"), { ssr: false });

interface ShopDetailClientProps {
  initialShop?: Shop;
}

const formatInfoValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "정보 없음";
  return String(value);
};

const formatOperatingHours = (hours: Shop["business_hours"]) => {
  if (!hours.open_time || !hours.close_time) return "정보 없음";
  if (hours.open_time === "정보 없음" || hours.close_time === "정보 없음") return "정보 없음";
  return `${hours.open_time} - ${hours.close_time}`;
};

const formatBreakTime = (hours: Shop["business_hours"]) => {
  if (!hours.break_start || !hours.break_end) return "없음";
  return `${hours.break_start} - ${hours.break_end}`;
};

const formatCount = (value?: number) => (value ?? 0).toLocaleString("ko-KR");
const splitReviewSummaryParagraphs = (description?: string) => {
  const cleanDescription = description?.replace(/\s+/g, " ").trim();
  if (!cleanDescription) return ["아직 충분한 리뷰 요약이 준비되지 않았어요."];

  const sentences = cleanDescription
    .match(/[^.!?。！？]+[.!?。！？]?/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean);

  if (!sentences?.length) return [cleanDescription];

  if (sentences.length <= 2) return [sentences.join(" ")];

  return sentences.reduce<string[]>((paragraphs, sentence, index) => {
    const paragraphIndex = Math.floor(index / 2);
    paragraphs[paragraphIndex] = [paragraphs[paragraphIndex], sentence].filter(Boolean).join(" ");
    return paragraphs;
  }, []);
};
const PENDING_RAMEN_LOG_KEY = "raota_pending_ramen_log";
const LOGIN_RETURN_TO_KEY = "raota_login_return_to";
const WAITING_REVIEWS_PAGE_SIZE = 4;

type WaitingReview = {
  id: number;
  user: string;
  dayOfWeek: WaitingDayKey;
  arrivalTime: string;
  waitMinutes: number;
  createdAt: string;
};

type WaitingDayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

const waitingWeekdays: Array<{ key: WaitingDayKey; label: string; shortLabel: string }> = [
  { key: "sun", label: "일요일", shortLabel: "일" },
  { key: "mon", label: "월요일", shortLabel: "월" },
  { key: "tue", label: "화요일", shortLabel: "화" },
  { key: "wed", label: "수요일", shortLabel: "수" },
  { key: "thu", label: "목요일", shortLabel: "목" },
  { key: "fri", label: "금요일", shortLabel: "금" },
  { key: "sat", label: "토요일", shortLabel: "토" },
];

const getKoreanWeekdayKey = (): WaitingDayKey => {
  const dayName = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
  }).format(new Date()).toLowerCase();

  if (dayName.startsWith("sun")) return "sun";
  if (dayName.startsWith("mon")) return "mon";
  if (dayName.startsWith("tue")) return "tue";
  if (dayName.startsWith("wed")) return "wed";
  if (dayName.startsWith("thu")) return "thu";
  if (dayName.startsWith("fri")) return "fri";
  return "sat";
};

const getWaitingWeekdayLabel = (dayOfWeek: WaitingDayKey) =>
  waitingWeekdays.find((weekday) => weekday.key === dayOfWeek)?.label || "요일";

const mockWaitingReviews: WaitingReview[] = [
  {
    id: 1,
    user: "멘마수집가",
    dayOfWeek: "thu",
    arrivalTime: "11:35",
    waitMinutes: 18,
    createdAt: "2026-07-05",
  },
  {
    id: 2,
    user: "쇼유러버",
    dayOfWeek: "thu",
    arrivalTime: "12:20",
    waitMinutes: 42,
    createdAt: "2026-07-03",
  },
  {
    id: 3,
    user: "시오탐험가",
    dayOfWeek: "sat",
    arrivalTime: "11:10",
    waitMinutes: 55,
    createdAt: "2026-07-04",
  },
  {
    id: 4,
    user: "카라멘",
    dayOfWeek: "fri",
    arrivalTime: "18:40",
    waitMinutes: 25,
    createdAt: "2026-07-02",
  },
];

const formatWaitMinutes = (minutes: number) => {
  if (minutes <= 0) return "바로 입장";
  if (minutes < 60) return `${minutes}분`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`;
};

export default function ShopDetailClient({ initialShop }: ShopDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast, showConfirm, isLoggedIn } = useApp();
  
  // URL 파라미터에서 ID 추출
  const useParamsData = useParams();
  const shopId = Number(useParamsData?.id);
  
  const { data, isLoading, isError } = useRamenShopDetail(shopId, initialShop);
  
  const [shopDetail, setShopDetail] = useState<Shop | null>(initialShop ?? null);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(initialShop?.isBookmarked));
  const [hasVisited, setHasVisited] = useState(false);
  const [voteData, setVoteStatus] = useState<any>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isRamenLogModalOpen, setIsRamenLogModalOpen] = useState(false);
  const [ramenLogRefreshKey, setRamenLogRefreshKey] = useState(0);
  const [waitingReviews, setWaitingReviews] = useState<WaitingReview[]>(mockWaitingReviews);
  const [isWaitingReviewModalOpen, setIsWaitingReviewModalOpen] = useState(false);
  const [selectedWaitingDay, setSelectedWaitingDay] = useState<WaitingDayKey>(() => getKoreanWeekdayKey());
  const [selectedWaitingTime, setSelectedWaitingTime] = useState<string>("all");
  const [isWaitingTimeDropdownOpen, setIsWaitingTimeDropdownOpen] = useState(false);
  const [waitingReviewPage, setWaitingReviewPage] = useState(0);
  const [waitingForm, setWaitingForm] = useState({
    dayOfWeek: getKoreanWeekdayKey(),
    arrivalTime: "12:00",
    waitMinutes: "20",
  });
  const lastIncrementedId = useRef<number | null>(null);
  const resumedRamenLogRef = useRef(false);
  const waitingTimeDropdownRef = useRef<HTMLDivElement | null>(null);

  const refreshShopData = async () => {
    try {
      const votes = await getVoteStatus(shopId);
      setVoteStatus(votes);
    } catch (err) {
      console.error("Failed to refresh dynamic data:", err);
    }
  };

  useEffect(() => {
    if (data) {
      setShopDetail(data);
      setIsBookmarked(data.isBookmarked);
      refreshShopData();
    }
  }, [data]);

  // 조회수 증가 API 호출 (화면이 완전히 뜬 후 단 한 번 호출)
  useEffect(() => {
    if (shopId && lastIncrementedId.current !== shopId) {
      lastIncrementedId.current = shopId;
      increaseShopViewCount(shopId).catch((err) => {
        console.error("Failed to increase shop view count:", err);
      });
    }
  }, [shopId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (waitingTimeDropdownRef.current && !waitingTimeDropdownRef.current.contains(event.target as Node)) {
        setIsWaitingTimeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleVote = async (menu: any) => {
    if (!menu?.id || !shopDetail) return;

    if (!isLoggedIn) {
      showConfirm("메뉴 투표는 로그인 후 이용할 수 있습니다.\n로그인 페이지로 이동하시겠습니까?", () => {
        router.push(`/login?returnTo=${encodeURIComponent(`/shop/${shopId}`)}`);
      });
      return;
    }

    try {
      await voteMenu(shopId, menu.id);
      
      if (menu.isVoted) {
        showToast("투표를 취소했습니다.", "info");
      } else {
        showToast(`${menu.name}에 투표했습니다!`, "success");
      }
      
      await refreshShopData();
      queryClient.invalidateQueries({ queryKey: ["ramen-shop-detail", shopId] });
    } catch (error: any) {
      if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
        showConfirm("메뉴 투표는 로그인 후 이용할 수 있습니다.\n로그인 페이지로 이동하시겠습니까?", () => {
          router.push(`/login?returnTo=${encodeURIComponent(`/shop/${shopId}`)}`);
        });
        return;
      }

      console.error("Voting failed:", error);
      showToast("투표 처리 중 오류가 발생했습니다.", "error");
    }
  };

  const handleOpenVoteModal = () => {
    if (!isLoggedIn) {
      showConfirm("메뉴 투표는 로그인 후 이용할 수 있습니다.\n로그인 페이지로 이동하시겠습니까?", () => {
        router.push(`/login?returnTo=${encodeURIComponent(`/shop/${shopId}`)}`);
      });
      return;
    }

    setIsVoteModalOpen(true);
  };

  const handleBookmarkToggle = async () => {
    if (!isLoggedIn) {
      showConfirm("가보고 싶은 가게로 저장하려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?", () => {
        router.push(`/login?returnTo=${encodeURIComponent(`/shop/${shopId}`)}`);
      });
      return;
    }

    if (!shopDetail) return;
    try {
      const newStatus = await toggleBookmark(shopDetail.id);
      setIsBookmarked(newStatus);
      queryClient.invalidateQueries({ queryKey: ["ramen-shop-detail", shopId] });
      queryClient.invalidateQueries({ queryKey: ["ramen-shops"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      
      setShopDetail(prev => prev ? {
        ...prev,
        stats: { ...prev.stats, bookmark_count: prev.stats.bookmark_count + (newStatus ? 1 : -1) }
      } : null);
    } catch (error) {
      showToast("가고 싶은 가게 처리 중 오류가 발생했습니다.", "error");
    }
  };

  const handleVisitedClick = () => {
    if (!isLoggedIn) {
      showConfirm("방문한 가게로 기록하려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?", () => {
        router.push(`/login?returnTo=${encodeURIComponent(`/shop/${shopId}`)}`);
      });
      return;
    }

    if (hasVisited) return;

    setHasVisited(true);
    setShopDetail((current) => current ? {
      ...current,
      stats: { ...current.stats, visit_count: current.stats.visit_count + 1 },
    } : current);
    showToast("방문 기록에 추가했어요. 아래에서 한 그릇 기록도 남겨보세요.", "success");
  };

  const openRamenLogModal = () => {
    if (!isLoggedIn) {
      showConfirm("라멘로그는 로그인 후 남길 수 있습니다.\n로그인 페이지로 이동하시겠습니까?", () => {
        router.push(`/login?returnTo=${encodeURIComponent(`/shop/${shopId}`)}`);
      });
      return;
    }

    setIsRamenLogModalOpen(true);
  };

  const completeRamenLogCreate = useCallback(async (data: RamenLogFormData) => {
    if (!data.shopId) {
      throw new Error("라멘 가게를 선택해주세요.");
    }

    await createRamenLog({
      shopId: data.shopId,
      menuName: data.menuName,
      ramenType: data.ramenType,
      imageUrl: data.imageUrl,
      visitedAt: data.visitedAt,
      note: data.note || undefined,
      tasteNotes: data.tasteNotes,
      revisit: toRevisitValue(data.revisit),
      public: data.isPublic,
    });

    setRamenLogRefreshKey((current) => current + 1);
    setShopDetail((current) => current ? {
      ...current,
      ramenLogCount: current.ramenLogCount + 1,
    } : current);
    queryClient.invalidateQueries({ queryKey: ["ramen-shop-detail", shopId] });
    showToast("라멘로그를 저장했습니다.", "success");
  }, [queryClient, shopId, showToast]);

  const handleCreateRamenLog = async (data: RamenLogFormData) => {
    if (!isLoggedIn) {
      const returnTo = `/shop/${shopId}?resumeRamenLog=1`;
      sessionStorage.setItem(PENDING_RAMEN_LOG_KEY, JSON.stringify(data));
      sessionStorage.setItem(LOGIN_RETURN_TO_KEY, returnTo);
      router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    await completeRamenLogCreate(data);
  };

  const handleWaitingReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isLoggedIn) {
      showConfirm("웨이팅 기록은 로그인 후 남길 수 있습니다.\n로그인 페이지로 이동하시겠습니까?", () => {
        router.push(`/login?returnTo=${encodeURIComponent(`/shop/${shopId}`)}`);
      });
      return;
    }

    const waitMinutes = Math.max(0, Math.min(300, Number(waitingForm.waitMinutes) || 0));

    if (!waitingForm.arrivalTime) {
      showToast("도착 시간을 입력해주세요.", "error");
      return;
    }

    setWaitingReviews((current) => [
      {
        id: Date.now(),
        user: "나",
        dayOfWeek: waitingForm.dayOfWeek,
        arrivalTime: waitingForm.arrivalTime,
        waitMinutes,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ]);
    setSelectedWaitingDay(waitingForm.dayOfWeek);
    setSelectedWaitingTime(waitingForm.arrivalTime);
    setWaitingReviewPage(0);
    setIsWaitingReviewModalOpen(false);
    showToast("웨이팅 후기를 저장했습니다.", "success");
  };

  useEffect(() => {
    if (!isLoggedIn || resumedRamenLogRef.current || !shopId) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("resumeRamenLog") !== "1") return;

    const pendingLog = sessionStorage.getItem(PENDING_RAMEN_LOG_KEY);
    if (!pendingLog) return;

    resumedRamenLogRef.current = true;

    try {
      const data = JSON.parse(pendingLog) as RamenLogFormData;
      if (data.shopId !== shopId) {
        resumedRamenLogRef.current = false;
        return;
      }

      void completeRamenLogCreate(data)
        .then(() => {
          sessionStorage.removeItem(PENDING_RAMEN_LOG_KEY);
          sessionStorage.removeItem(LOGIN_RETURN_TO_KEY);
          window.history.replaceState(null, "", `/shop/${shopId}`);
        })
        .catch(() => {
          resumedRamenLogRef.current = false;
          showToast("작성한 라멘로그를 저장하지 못했습니다. 다시 시도해주세요.", "error");
        });
    } catch {
      sessionStorage.removeItem(PENDING_RAMEN_LOG_KEY);
    }
  }, [completeRamenLogCreate, isLoggedIn, shopId, showToast]);

  const shop = shopDetail;
  
  const totalVotes = voteData?.total_votes || 0;
  // 위치를 바꾸지 않고 원본 메뉴 순서에 투표 데이터만 매칭
  const votingMenus = useMemo(() => {
    // 백엔드 응답 필드명이 normal_menus 또는 menus일 수 있음
    const shopAny = shop as any;
    const baseMenus = shopAny?.normal_menus || shopAny?.menus || [];
    
    return baseMenus.map((menu: any) => {
      // 투표 결과에서 해당 메뉴 ID 매칭
      const voteInfo = voteData?.vote_results?.find((r: any) => r.menu_id === menu.id);
      return {
        ...menu,
        votes: voteInfo?.vote_count || 0,
        percentage: voteInfo?.percentage || 0,
        isVoted: voteInfo?.voted || false
      };
    });
  }, [voteData, shop]);
  
  // 가장 높은 득표수를 가진 메뉴 찾기 (동점 포함)
  const maxVotes = useMemo(() => Math.max(...votingMenus.map(m => m.votes), 0), [votingMenus]);
  const bestMenuId = useMemo(() => {
    if (maxVotes === 0) return null;
    return votingMenus.find(m => m.votes === maxVotes)?.id;
  }, [votingMenus, maxVotes]);
  const bestMenu = useMemo(
    () => votingMenus.find((menu) => menu.id === bestMenuId) ?? null,
    [bestMenuId, votingMenus],
  );
  const ramenLogInitialShop = useMemo(() => {
    if (!shop) return undefined;

    const menuNames = [
      ...(shop.menu_list || []).map((menu) => menu.name),
      ...(shop.menus || []).map((menu) => menu.name),
    ].filter((name, index, names) => Boolean(name) && names.indexOf(name) === index);

    return {
      id: shop.id,
      name: shop.name,
      branchName: shop.branch_name,
      type: shop.type,
      menus: menuNames,
    };
  }, [shop]);
  const reviewSummaryParagraphs = useMemo(
    () => splitReviewSummaryParagraphs(shop?.description),
    [shop?.description],
  );
  const selectedWaitingDayReviews = useMemo(
    () => waitingReviews.filter((review) => review.dayOfWeek === selectedWaitingDay),
    [selectedWaitingDay, waitingReviews],
  );
  const averageWaitMinutes = useMemo(() => {
    if (!selectedWaitingDayReviews.length) return 0;
    return Math.round(selectedWaitingDayReviews.reduce((sum, review) => sum + review.waitMinutes, 0) / selectedWaitingDayReviews.length);
  }, [selectedWaitingDayReviews]);
  const waitingTimeOptions = useMemo(() => {
    const grouped = selectedWaitingDayReviews.reduce<Record<string, { time: string; total: number; count: number }>>((acc, review) => {
      acc[review.arrivalTime] = acc[review.arrivalTime] || { time: review.arrivalTime, total: 0, count: 0 };
      acc[review.arrivalTime].total += review.waitMinutes;
      acc[review.arrivalTime].count += 1;
      return acc;
    }, {});

    return Object.values(grouped)
      .map((item) => ({
        time: item.time,
        count: item.count,
        averageWaitMinutes: Math.round(item.total / item.count),
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedWaitingDayReviews]);
  const filteredWaitingReviews = useMemo(
    () => selectedWaitingTime === "all"
      ? selectedWaitingDayReviews
      : selectedWaitingDayReviews.filter((review) => review.arrivalTime === selectedWaitingTime),
    [selectedWaitingDayReviews, selectedWaitingTime],
  );
  const waitingReviewPageCount = Math.max(1, Math.ceil(filteredWaitingReviews.length / WAITING_REVIEWS_PAGE_SIZE));
  const pagedWaitingReviews = filteredWaitingReviews.slice(
    waitingReviewPage * WAITING_REVIEWS_PAGE_SIZE,
    waitingReviewPage * WAITING_REVIEWS_PAGE_SIZE + WAITING_REVIEWS_PAGE_SIZE,
  );
  const selectedWaitingTimeLabel = selectedWaitingTime === "all"
    ? `전체 시간대 · ${selectedWaitingDayReviews.length}개`
    : waitingTimeOptions.find((option) => option.time === selectedWaitingTime)
      ? `${selectedWaitingTime} · ${formatWaitMinutes(waitingTimeOptions.find((option) => option.time === selectedWaitingTime)!.averageWaitMinutes)}`
      : "시간대 선택";

  useEffect(() => {
    setWaitingReviewPage(0);
  }, [selectedWaitingDay, selectedWaitingTime, waitingReviews.length]);

  useEffect(() => {
    setSelectedWaitingTime("all");
    setIsWaitingTimeDropdownOpen(false);
  }, [selectedWaitingDay]);

  if (isLoading && !shop) return <Loading />;
  if (isError || !shop) return <div className="text-center py-20">가게 정보를 찾을 수 없습니다.</div>;

  const shopInfoCard = (
    <div className="relative overflow-hidden rounded-md bg-[#25282b] p-5 text-white md:p-8">
      <div className="relative z-10">
        <h2 className="mb-4 text-lg font-black">가게 정보</h2>
        <div className="space-y-4 text-sm font-mono text-stone-300">
          <p className="flex justify-between gap-4 border-b border-white/10 pb-2"><span className="text-stone-300 flex-shrink-0">주소</span><span className="text-right break-keep text-white/90">{formatInfoValue(shop.address)}</span></p>
          <p className="flex justify-between gap-4 border-b border-white/10 pb-2"><span className="text-stone-300 flex-shrink-0">영업시간</span><span className="text-right text-white/90">{formatOperatingHours(shop.business_hours)}</span></p>
          <p className="flex justify-between gap-4 border-b border-white/10 pb-2"><span className="text-stone-300 flex-shrink-0">브레이크</span><span className="text-right text-white/90">{formatBreakTime(shop.business_hours)}</span></p>
          <p className="flex justify-between gap-4 border-b border-white/10 pb-2"><span className="text-stone-300 flex-shrink-0">휴무일</span><span className="text-right break-keep text-white/90">{formatInfoValue(shop.business_hours?.closed_days)}</span></p>
          <p className="flex justify-between gap-4 border-b border-white/10 pb-2"><span className="text-stone-300 flex-shrink-0">주차</span><span className="text-right break-keep text-white/90">{formatInfoValue(shop.business_hours?.parking_info)}</span></p>
        </div>
        <div className="mt-8 flex gap-3">
          {shop.instagram_url && <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-white/10 p-3 text-xs font-bold transition-colors hover:bg-[#e60000]"><Instagram className="h-4 w-4" /> Instagram</a>}
          {shop.catchTableUrl && <a href={shop.catchTableUrl} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-white/10 p-3 text-xs font-bold transition-colors hover:bg-white hover:text-[#25282b]"><Utensils className="h-4 w-4" /> CatchTable</a>}
        </div>
      </div>
    </div>
  );

  const renderWaitingReviewSection = (className = "") => (
    <section className={`overflow-hidden rounded-sm border border-stone-200 bg-white ${className}`}>
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-2 text-[#e60000]">
          <Clock3 className="h-4 w-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.18em]">Waiting</p>
        </div>
        <h2 className="mt-2 text-lg font-black text-[#25282b] md:text-xl">
          웨이팅 기록
        </h2>
        <p className="mt-1 break-keep text-sm leading-6 text-stone-500">
          요일과 도착 시간별 실제 대기 시간을 확인해요.
        </p>

        <div className="mt-4 grid grid-cols-7 gap-1">
          {waitingWeekdays.map((weekday) => {
            const isSelected = selectedWaitingDay === weekday.key;
            const isToday = getKoreanWeekdayKey() === weekday.key;

            return (
              <button
                key={weekday.key}
                type="button"
                onClick={() => setSelectedWaitingDay(weekday.key)}
                className={`relative flex h-10 items-center justify-center rounded-sm border text-xs font-black transition-colors ${
                  isSelected
                    ? "border-[#e60000] bg-[#e60000] text-white"
                    : "border-stone-200 bg-white text-stone-500 hover:border-[#e60000] hover:text-[#e60000]"
                }`}
                aria-label={`${weekday.label} 웨이팅 기록 보기`}
              >
                {weekday.shortLabel}
                {isToday && (
                  <span className={`absolute -right-1 -top-1 h-2 w-2 rounded-full ${isSelected ? "bg-white" : "bg-[#e60000]"}`} />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-stone-200 bg-stone-200">
          <div className="bg-white p-3">
            <p className="text-[10px] font-bold text-stone-500">{getWaitingWeekdayLabel(selectedWaitingDay)} 평균</p>
            <p className="mt-1 text-xl font-black text-[#25282b]">{formatWaitMinutes(averageWaitMinutes)}</p>
          </div>
          <div className="bg-white p-3">
            <p className="text-[10px] font-bold text-stone-500">{getWaitingWeekdayLabel(selectedWaitingDay)} 기록</p>
            <p className="mt-1 text-xl font-black text-[#25282b]">{selectedWaitingDayReviews.length}개</p>
          </div>
        </div>

        <div ref={waitingTimeDropdownRef} className="relative mt-4">
          <button
            type="button"
            onClick={() => setIsWaitingTimeDropdownOpen((current) => !current)}
            className="flex h-11 w-full items-center justify-between gap-3 rounded-sm border border-stone-200 bg-white px-3 text-left text-sm font-black text-[#25282b] transition-colors hover:border-[#e60000]"
            aria-expanded={isWaitingTimeDropdownOpen}
            aria-label="웨이팅 도착 시간 필터 선택"
          >
            <span className="min-w-0 truncate">{selectedWaitingTimeLabel}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${isWaitingTimeDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isWaitingTimeDropdownOpen && (
            <div className="absolute left-0 right-0 z-20 mt-2 max-h-64 overflow-y-auto rounded-sm border border-stone-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setSelectedWaitingTime("all");
                  setIsWaitingTimeDropdownOpen(false);
                }}
                className={`flex h-11 w-full items-center justify-between px-3 text-left text-sm transition-colors hover:bg-stone-50 ${
                  selectedWaitingTime === "all" ? "font-black text-[#e60000]" : "font-bold text-[#25282b]"
                }`}
              >
                <span>전체 시간대</span>
                <span className="text-[11px] font-black text-stone-400">{selectedWaitingDayReviews.length}개</span>
              </button>
              {waitingTimeOptions.map((option) => (
                <button
                  key={option.time}
                  type="button"
                  onClick={() => {
                    setSelectedWaitingTime(option.time);
                    setIsWaitingTimeDropdownOpen(false);
                  }}
                  className={`flex h-11 w-full items-center justify-between gap-3 border-t border-stone-100 px-3 text-left text-sm transition-colors hover:bg-stone-50 ${
                    selectedWaitingTime === option.time ? "font-black text-[#e60000]" : "font-bold text-[#25282b]"
                  }`}
                >
                  <span>{option.time}</span>
                  <span className="shrink-0 text-[11px] font-black text-stone-400">
                    평균 {formatWaitMinutes(option.averageWaitMinutes)} · {option.count}개
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-sm border border-stone-200">
          {filteredWaitingReviews.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {pagedWaitingReviews.map((review) => (
                <article key={review.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-white px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-400">
                      {getWaitingWeekdayLabel(review.dayOfWeek)} · 도착 {review.arrivalTime}
                    </p>
                    <p className="mt-1 truncate text-xs font-bold text-stone-500">
                      {review.user} · {review.createdAt}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-400">대기</p>
                    <p className="mt-1 text-base font-black text-[#e60000]">{formatWaitMinutes(review.waitMinutes)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="break-keep bg-stone-50 p-4 text-sm font-medium leading-6 text-stone-500">
              선택한 요일과 시간대의 웨이팅 기록이 아직 없습니다.
            </p>
          )}
        </div>

        {filteredWaitingReviews.length > WAITING_REVIEWS_PAGE_SIZE && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setWaitingReviewPage((current) => Math.max(0, current - 1))}
              disabled={waitingReviewPage === 0}
              className="inline-flex h-9 items-center justify-center rounded-sm border border-stone-200 bg-white px-3 text-xs font-black text-stone-500 transition-colors hover:border-[#e60000] hover:text-[#e60000] disabled:cursor-not-allowed disabled:opacity-40"
            >
              이전
            </button>
            <span className="text-[11px] font-black text-stone-400">
              {waitingReviewPage + 1}/{waitingReviewPageCount}
            </span>
            <button
              type="button"
              onClick={() => setWaitingReviewPage((current) => Math.min(waitingReviewPageCount - 1, current + 1))}
              disabled={waitingReviewPage >= waitingReviewPageCount - 1}
              className="inline-flex h-9 items-center justify-center rounded-sm border border-stone-200 bg-white px-3 text-xs font-black text-stone-500 transition-colors hover:border-[#e60000] hover:text-[#e60000] disabled:cursor-not-allowed disabled:opacity-40"
            >
              다음
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsWaitingReviewModalOpen(true)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#25282b] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-[#e60000]"
        >
          웨이팅 기록 남기기
          <Clock3 className="h-4 w-4" />
        </button>
      </div>
    </section>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6 md:py-12 lg:px-8">
      <button 
        onClick={() => router.push("/shops")} 
        className="group mb-5 flex items-center text-stone-600 transition-colors hover:text-[#e60000] md:mb-8"
        aria-label="라멘 가게 목록으로 돌아가기"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm uppercase tracking-widest">목록으로 돌아가기</span>
      </button>

      <div className="mb-10 grid grid-cols-1 gap-4 lg:mb-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <div className="group relative h-72 w-full overflow-hidden rounded-md bg-stone-100 md:h-80 lg:h-96">
            <ResilientImage
              src={shop.imageUrl} 
              alt={shop.name} 
              fill
              priority
              fetchPriority="high"
              quality={65}
              sizes="(min-width: 1280px) 768px, (min-width: 1024px) 66vw, calc(100vw - 32px)"
              className="object-cover saturate-105"
            />
          </div>

          <div className="mb-6 border-b border-stone-200 bg-white py-5 md:mb-8 md:py-7">
            <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <h1 className="vodafone-display min-w-0 max-w-full break-words text-4xl leading-none text-[#25282b] [overflow-wrap:anywhere] sm:text-5xl md:text-6xl">{shop.name}</h1>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleBookmarkToggle} className={`flex w-fit items-center gap-2 rounded-sm border px-4 py-2 text-sm font-bold transition-colors ${isBookmarked ? "border-[#e60000] bg-[#e60000] text-white" : "border-stone-200 bg-white text-stone-700 hover:border-[#e60000]"}`}>
                  <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                  <span>{isBookmarked ? "가보고 싶어요 취소" : "가보고 싶어요"}</span>
                </button>
                <button onClick={handleVisitedClick} className={`flex w-fit items-center gap-2 rounded-sm border px-4 py-2 text-sm font-bold transition-colors ${
                  hasVisited
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-white text-stone-700 hover:border-[#e60000] hover:text-[#e60000]"
                }`}>
                  <NotebookPen className="h-4 w-4" />
                  <span>{hasVisited ? "방문 완료" : "방문했어요"}</span>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-stone-600">
              <span className="flex min-w-0 items-start gap-1.5">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#e60000]" />
                <span className="break-keep leading-relaxed">{shop.location}</span>
              </span>
              <span className="flex min-w-0 items-start gap-1.5">
                <Menu className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                <span className="break-words leading-relaxed">{shop.type}</span>
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-stone-500">
              <span className="flex min-w-0 items-start gap-1.5">
                <Eye className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                <span className="break-keep leading-relaxed">조회수 {formatCount(shop.stats.view_count)}</span>
              </span>
              <span className="flex min-w-0 items-start gap-1.5">
                <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                <span className="break-keep leading-relaxed">방문 인증수 {formatCount(shop.stats.visit_count)}</span>
              </span>
              <span className="flex min-w-0 items-start gap-1.5">
                <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                <span className="break-keep leading-relaxed">가보고 싶은 사람 {formatCount(shop.stats.bookmark_count)}</span>
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-sm border border-stone-200 bg-white">
              <div className="grid md:grid-cols-[minmax(0,1fr)_13rem] md:items-center">
                <div className="p-4 md:p-5">
                  <div className="flex items-center gap-2 text-[#e60000]">
                    <NotebookPen className="h-4 w-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.18em]">오늘 먹었다면</p>
                  </div>
                  <h2 className="mt-2 text-lg font-black text-[#25282b] md:text-xl">
                    한 그릇만 가볍게 기록해두세요
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    사진과 메뉴, 재방문 의사와 기억해둘 점을 남기면 돼요.
                  </p>
                </div>
                <div className="flex items-center border-t border-stone-200 p-4 md:border-l md:border-t-0 md:p-5">
                  <button
                    type="button"
                    onClick={openRamenLogModal}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-[#e60000] px-4 py-3.5 text-sm font-black text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e60000]"
                  >
                    먹은 라멘 기록하기
                    <NotebookPen className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 lg:hidden">
              {shopInfoCard}
            </div>

            {renderWaitingReviewSection("mt-4 lg:hidden")}
          </div>

          <div className="mb-10 max-w-none rounded-md border border-stone-200 bg-white p-5 md:mb-12 md:p-7">
            <div className="mb-5 flex items-center gap-2 text-[#e60000]">
              <Sparkles className="h-4 w-4" />
              <p className="text-[10px] font-black tracking-[0.18em]">AI 리뷰 요약</p>
            </div>

            <h2 className="text-lg font-black text-[#25282b] md:text-xl">
              AI가 리뷰 흐름을 요약했어요
            </h2>

            <div className="mt-4 space-y-4 border-t border-red-100 pt-4 md:mt-5 md:space-y-5">
              {reviewSummaryParagraphs.map((paragraph, index) => (
                <p
                  key={`${paragraph}-${index}`}
                  className="break-keep text-[15px] font-medium leading-8 text-stone-700 md:text-[17px] md:leading-9"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <p className="mt-5 border-t border-stone-100 pt-3 text-xs font-medium leading-5 text-stone-500">
              라멘로그와 리뷰를 바탕으로 핵심 인상을 짧게 정리한 내용입니다.
            </p>
          </div>

          {shop.event_menus && shop.event_menus.length > 0 && (
            <div className="mb-10 md:mb-12">
              <h2 className="mb-4 flex items-center text-lg font-bold text-[#25282b] md:mb-6 md:text-xl"><Sparkles className="mr-2 h-5 w-5 text-[#e60000]" /> 이벤트 메뉴</h2>
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {shop.event_menus.map((event) => (
                  <div key={event.id} className="group flex flex-col overflow-hidden rounded-md border border-stone-200 bg-white transition-colors hover:border-[#e60000] p-4 md:p-6">
                    <div className="flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <h3 className="text-lg font-black text-[#25282b] transition-colors group-hover:text-[#e60000] md:text-xl">{event.name}</h3>
                          <span className="ml-2 rounded-sm bg-[#e60000] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{event.badge_text}</span>
                        </div>
                        <span className="font-mono text-base font-bold text-[#25282b] md:text-lg">{event.price.toLocaleString()}원</span>
                      </div>
                      <p className="text-sm leading-relaxed text-stone-700">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {shop.menu_list && shop.menu_list.length > 0 && (
            <div className="mb-6 md:mb-12">
              <h2 className="mb-4 flex items-center text-lg font-bold text-[#25282b] md:mb-6 md:text-xl"><Utensils className="mr-2 h-5 w-5 text-stone-500" /> 일반 메뉴</h2>
              <div className="rounded-md border border-stone-200 bg-white p-2">
                {shop.menu_list.map((menu, idx) => (
                  <div key={menu.id} className={`flex items-center justify-between border-l-4 border-l-transparent p-3 md:p-4 ${idx !== shop.menu_list.length - 1 ? "border-b border-stone-200" : ""}`}>
                    <div className="flex items-center">
                      <div>
                        <div className="flex items-center"><span className="mr-2 text-sm font-bold text-[#25282b] md:text-base">{menu.name}</span>{menu.is_signature && <span className="rounded-sm bg-[#e60000] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-white">SIG</span>}</div>
                      </div>
                    </div>
                    <div className="font-mono text-sm font-bold text-stone-700 md:text-base">{menu.price.toLocaleString()}원</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-10 hidden md:mb-12 lg:block">
            <ShopComparePanel shop={shop} />
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="order-1 hidden lg:block">
              {shopInfoCard}
            </div>

            {renderWaitingReviewSection("order-2 hidden lg:block")}

            <section className="order-3 overflow-hidden rounded-md border border-stone-200 bg-white">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black tracking-[0.14em] text-[#e60000]">메뉴 투표</p>
                  <span className="text-[10px] font-bold text-stone-500">
                    {totalVotes > 0 ? `${totalVotes.toLocaleString("ko-KR")}표` : "아직 투표 없음"}
                  </span>
                </div>
                <h2 className="mt-1 text-lg font-black text-[#25282b] md:text-xl">
                  가장 사랑받는 한 그릇
                </h2>

                <div className="mt-5">
                  {bestMenu ? (
                    <>
                      <div className="flex items-end justify-between gap-4">
                        <span className="min-w-0 truncate text-sm font-black text-[#25282b]">
                          {bestMenu.name}
                        </span>
                        <span className="shrink-0 font-mono text-sm font-black text-[#e60000]">
                          {Math.round(bestMenu.percentage)}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-[#e60000]"
                          style={{ width: `${Math.max(bestMenu.percentage, 2)}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="break-keep text-sm leading-6 text-stone-600">
                      가장 맛있었던 메뉴에 첫 표를 남겨보세요.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleOpenVoteModal}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-black text-[#25282b] transition-colors hover:border-[#e60000] hover:bg-white hover:text-[#e60000]"
                >
                  <Star className="h-4 w-4" />
                  {bestMenu ? "전체 메뉴 보고 투표하기" : "첫 투표 남기기"}
                </button>
              </div>
            </section>

            <div className="order-2 lg:order-4">
              <ShopRamenLogPreview
                key={`${shop.id}-${ramenLogRefreshKey}`}
                shopId={shop.id}
                shopName={shop.name}
                onWrite={() => setIsRamenLogModalOpen(true)}
              />
            </div>

            <div className="order-5 hidden text-center lg:block">
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs text-stone-600 hover:text-stone-800 underline transition-colors underline-offset-4"
                aria-label="가게 정보 수정 및 이벤트 제보하기"
              >
                정보 수정 및 새로운 이벤트 제보하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10 lg:hidden">
        <ShopComparePanel shop={shop} />
      </div>

      <div className="mb-10 text-center lg:hidden">
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="text-xs text-stone-600 hover:text-stone-800 underline transition-colors underline-offset-4"
          aria-label="가게 정보 수정 및 이벤트 제보하기"
        >
          정보 수정 및 새로운 이벤트 제보하기
        </button>
      </div>

      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          shopId={shopId}
          shopName={shop.name}
        />
      )}

      <VoteMenuModal
        isOpen={isVoteModalOpen}
        onClose={() => setIsVoteModalOpen(false)}
        onVote={handleVote}
        menus={votingMenus}
        totalVotes={totalVotes}
        bestMenuId={bestMenuId}
        shopName={shop.name}
      />

      {isWaitingReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsWaitingReviewModalOpen(false)} />
          <form
            onSubmit={handleWaitingReviewSubmit}
            className="relative w-full max-w-sm overflow-hidden rounded-sm border border-stone-200 bg-white animate-scale-in"
          >
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <div>
                <p className="text-xs font-black text-[#e60000]">웨이팅 기록</p>
                <h3 className="mt-1 text-base font-black text-[#25282b]">요일, 도착 시간과 대기 시간</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWaitingReviewModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 transition-colors hover:border-[#e60000] hover:text-[#e60000]"
                aria-label="웨이팅 기록 모달 닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-stone-500">요일</p>
                <div className="grid grid-cols-7 gap-1">
                  {waitingWeekdays.map((weekday) => {
                    const isSelected = waitingForm.dayOfWeek === weekday.key;

                    return (
                      <button
                        key={weekday.key}
                        type="button"
                        onClick={() => setWaitingForm((current) => ({ ...current, dayOfWeek: weekday.key }))}
                        className={`h-10 rounded-sm border text-xs font-black transition-colors ${
                          isSelected
                            ? "border-[#e60000] bg-[#e60000] text-white"
                            : "border-stone-200 bg-white text-stone-500 hover:border-[#e60000] hover:text-[#e60000]"
                        }`}
                        aria-label={`${weekday.label} 선택`}
                      >
                        {weekday.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-stone-500">도착 시간</span>
                <input
                  type="time"
                  value={waitingForm.arrivalTime}
                  onChange={(event) => setWaitingForm((current) => ({ ...current, arrivalTime: event.target.value }))}
                  className="h-11 w-full rounded-sm border border-stone-200 bg-white px-3 text-sm font-black text-[#25282b] outline-none transition-colors focus:border-[#e60000]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-stone-500">기다린 시간</span>
                <div className="flex h-11 overflow-hidden rounded-sm border border-stone-200 bg-white focus-within:border-[#e60000]">
                  <input
                    type="number"
                    min={0}
                    max={300}
                    value={waitingForm.waitMinutes}
                    onChange={(event) => setWaitingForm((current) => ({ ...current, waitMinutes: event.target.value }))}
                    className="min-w-0 flex-1 px-3 text-sm font-black text-[#25282b] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-label="기다린 시간"
                  />
                  <span className="flex items-center border-l border-stone-200 px-3 text-xs font-black text-stone-400">분</span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-stone-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setIsWaitingReviewModalOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-sm border border-stone-200 bg-stone-50 px-5 text-xs font-black text-stone-500 transition-colors hover:bg-stone-100 hover:text-[#25282b]"
              >
                취소
              </button>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-sm bg-[#e60000] px-6 text-xs font-black text-white transition-opacity hover:opacity-90"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      )}

      <RamenLogModal
        isOpen={isRamenLogModalOpen}
        onClose={() => setIsRamenLogModalOpen(false)}
        onCreate={handleCreateRamenLog}
        initialShop={ramenLogInitialShop}
      />
    </div>
  );
}
