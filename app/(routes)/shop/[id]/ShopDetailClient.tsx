"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [voteData, setVoteStatus] = useState<any>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isRamenLogModalOpen, setIsRamenLogModalOpen] = useState(false);
  const [ramenLogRefreshKey, setRamenLogRefreshKey] = useState(0);
  const lastIncrementedId = useRef<number | null>(null);
  const resumedRamenLogRef = useRef(false);

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

  const handleVote = async (menu: any) => {
    if (!menu?.id || !shopDetail) return;

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
        showConfirm("현재 메뉴 투표는 로그인 후 이용할 수 있습니다.\n로그인 페이지로 이동하시겠습니까?", () => {
          router.push("/login");
        });
        return;
      }

      console.error("Voting failed:", error);
      showToast("투표 처리 중 오류가 발생했습니다.", "error");
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isLoggedIn) {
      showConfirm("로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?", () => {
        router.push("/login");
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
      showToast("북마크 처리 중 오류가 발생했습니다.", "error");
    }
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
              <button onClick={handleBookmarkToggle} className={`flex w-fit items-center gap-2 rounded-sm border px-4 py-2 text-sm font-bold transition-colors ${isBookmarked ? "border-[#e60000] bg-[#e60000] text-white" : "border-stone-200 bg-white text-stone-700 hover:border-[#e60000]"}`}>
                <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                <span>{isBookmarked ? "찜 취소" : "가게 찜하기"}</span>
              </button>
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
                <span className="break-keep leading-relaxed">북마크수 {formatCount(shop.stats.bookmark_count)}</span>
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-sm border border-stone-200 bg-white">
              <div className="grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
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
                <div className="border-t border-stone-200 p-4 md:border-l md:border-t-0">
                  <button
                    type="button"
                    onClick={() => setIsRamenLogModalOpen(true)}
                    className="inline-flex w-full min-w-52 items-center justify-center gap-2 rounded-sm bg-[#e60000] px-5 py-3.5 text-sm font-black text-white transition-opacity hover:opacity-90"
                  >
                    먹은 라멘 기록하기
                    <NotebookPen className="h-4 w-4" />
                  </button>
                  <p className="mt-2 text-center text-[11px] font-medium text-stone-400">
                    약 15초 · 로그인은 저장할 때
                  </p>
                </div>
              </div>
            </div>
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

          <div className="mb-10 lg:hidden">
            {shopInfoCard}
          </div>

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

            <section className="order-3 overflow-hidden rounded-md border border-stone-200 bg-white lg:order-2">
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
                  onClick={() => setIsVoteModalOpen(true)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-black text-[#25282b] transition-colors hover:border-[#e60000] hover:bg-white hover:text-[#e60000]"
                >
                  <Star className="h-4 w-4" />
                  {bestMenu ? "전체 메뉴 보고 투표하기" : "첫 투표 남기기"}
                </button>
              </div>
            </section>

            <div className="order-2 lg:order-3">
              <ShopRamenLogPreview
                key={`${shop.id}-${ramenLogRefreshKey}`}
                shopId={shop.id}
                shopName={shop.name}
                onWrite={() => setIsRamenLogModalOpen(true)}
              />
            </div>

            <div className="order-4 hidden text-center lg:block">
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

      <RamenLogModal
        isOpen={isRamenLogModalOpen}
        onClose={() => setIsRamenLogModalOpen(false)}
        onCreate={handleCreateRamenLog}
        initialShop={ramenLogInitialShop}
      />
    </div>
  );
}
