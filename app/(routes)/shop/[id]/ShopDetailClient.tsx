"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import {
  Camera,
  Star,
  Menu,
  MapPin,
  Award,
  ArrowLeft,
  Image as ImageIcon,
  Instagram,
  ExternalLink,
  Sparkles,
  Utensils,
  Heart,
  Check,
  PenSquare,
  ChevronDown,
} from "lucide-react";
import { Shop, UserPhoto, MenuItem } from "../../../types";
import ProgressBar from "../../../components/ProgressBar";
import Loading from "@/app/loading";
import { useRamenShopDetail } from "@/hooks/queries/useRamenShopDetail";
import { toggleBookmark, voteMenu, getVoteStatus, getShopPhotos, addProofPicture, deleteProofPicture } from "@/lib/api/ramen-shops";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/app/context/AppContext";

const PhotoModal = dynamic(() => import("../../../components/PhotoModal"), { ssr: false });
const ReportModal = dynamic(() => import("../../../components/ReportModal"), { ssr: false });
const UploadPhotoModal = dynamic(() => import("../../../components/UploadPhotoModal"), { ssr: false });
const VoteMenuModal = dynamic(() => import("../../../components/VoteMenuModal"), { ssr: false });

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
  const [shopPhotos, setShopPhotos] = useState<UserPhoto[]>([]);

  const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isVoteAccordionOpen, setIsVoteAccordionOpen] = useState(false);
  const photoSectionRef = useRef<HTMLDivElement | null>(null);

  const refreshShopData = async () => {
    try {
      const photos = await getShopPhotos(shopId, 0, 12);
      setShopPhotos(photos);
      
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

  const handleVote = async (menu: any) => {
    if (!isLoggedIn) {
      showConfirm("로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?", () => {
        router.push("/login");
      });
      return;
    }

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
      console.error("Voting failed:", error);
      showToast("투표 처리 중 오류가 발생했습니다.", "error");
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await deleteProofPicture(shopId, photoId);
      showToast("사진이 삭제되었습니다.", "success");
      await refreshShopData();
      queryClient.invalidateQueries({ queryKey: ["ramen-shop-detail", shopId] });
    } catch (error) {
      showToast("사진 삭제 중 오류가 발생했습니다.", "error");
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

  const reviewWriteUrl = `/community/write?category=REVIEW&shopId=${shopId}&title=${encodeURIComponent(`${shopDetail?.name ?? ""} 후기 남기기`)}&content=${encodeURIComponent(`<p>${shopDetail?.name ?? ""}에서 먹어본 메뉴와 분위기를 공유해볼게요.</p>`)}`;

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

  if (isLoading && !shop) return <Loading />;
  if (isError || !shop) return <div className="text-center py-20">가게 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <button 
        onClick={() => router.push("/shops")} 
        className="group mb-8 flex items-center text-stone-600 transition-colors hover:text-[#e60000]"
        aria-label="라멘 가게 목록으로 돌아가기"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm uppercase tracking-widest">목록으로 돌아가기</span>
      </button>

      <div className="mb-10 grid grid-cols-1 gap-6 lg:mb-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <div className="group relative h-72 w-full overflow-hidden rounded-md bg-stone-100 md:h-80 lg:h-96">
            <Image
              src={shop.imageUrl} 
              alt={shop.name} 
              fill
              priority
              fetchPriority="high"
              quality={65}
              sizes="(min-width: 1280px) 768px, (min-width: 1024px) 66vw, calc(100vw - 32px)"
              className="object-cover saturate-105"
            />
            <span className="absolute right-4 top-4 inline-flex items-center rounded-sm border border-stone-200 bg-white px-3 py-1.5 text-xs font-black text-[#25282b] shadow-lg shadow-black/10 md:right-5 md:top-5 md:text-sm">
              <Camera className="mr-1.5 h-3.5 w-3.5 text-[#e60000] md:h-4 md:w-4" /> 인증 {shopPhotos.length}회
            </span>
          </div>

          <div className="mb-10 border-b border-stone-200 bg-white py-5 md:mb-12 md:py-7">
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

            <div className="mt-6 rounded-sm border border-stone-200 bg-stone-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e60000]">바로 참여</p>
              <h2 className="mt-2 text-lg font-black text-[#25282b]">{shop.name} 방문 후기를 들려주세요!</h2>
              <p className="mt-1 text-sm leading-6 text-stone-500">
                먹어봤다면 10초면 충분해요. 투표하고, 인증샷 남기고, 후기까지 바로 남겨보세요.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setIsVoteModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-[#25282b] transition-colors hover:border-[#e60000] hover:text-[#e60000]"
                >
                  <Star className="h-4 w-4" />
                  메뉴 투표하기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) {
                      showConfirm("로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?", () => router.push("/login"));
                      return;
                    }
                    setIsUploadModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-[#25282b] transition-colors hover:border-[#e60000] hover:text-[#e60000]"
                >
                  <Camera className="h-4 w-4" />
                  인증샷 남기기
                </button>
                <button
                  type="button"
                  onClick={() => router.push(reviewWriteUrl)}
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#e60000] px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  <PenSquare className="h-4 w-4" />
                  이 가게 후기 쓰기
                </button>
              </div>
            </div>
          </div>

          <div className="prose prose-stone mb-10 max-w-none md:mb-12">
            <div className="mb-4 flex items-center border-l-4 border-[#e60000] pl-4">
              <h2 className="m-0 text-lg font-bold text-[#25282b] md:text-xl">한줄평</h2>
            </div>
            <p className="text-base leading-relaxed text-stone-700 md:text-lg">{shop.description}</p>
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
            <div className="mb-10 md:mb-12">
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

          <div ref={photoSectionRef} className="mt-10 border-t border-stone-200 pt-6 md:mt-12 md:pt-8">
            <div className="mb-4 flex items-end justify-between md:mb-6">
              <h2 className="flex items-center text-lg font-bold text-[#25282b] md:text-xl"><ImageIcon className="mr-2 h-5 w-5 text-[#e60000]" /> 유저 메뉴 인증</h2>
              <span className="text-xs text-stone-600 font-mono">{shopPhotos.length}개 사진</span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {shopPhotos.map((photo) => (
                <div key={photo.id} onClick={() => setSelectedPhoto(photo)} className="group relative aspect-square cursor-pointer overflow-hidden rounded-sm border border-stone-200 bg-stone-100 transition-colors hover:border-[#e60000]">
                  <Image
                    src={photo.imageUrl} 
                    alt={photo.menuName} 
                    fill
                    sizes="(min-width: 768px) 260px, calc((100vw - 44px) / 2)"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <p className="text-white text-xs font-bold truncate">
                      {photo.menuName}
                    </p>
                    <div className="flex justify-between items-center mt-1 border-t border-white/20 pt-1">
                      <span className="text-[10px] text-white/70 font-mono">{photo.user}</span>
                      <span className="text-[10px] text-white/50 font-mono">{photo.date}</span>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => {
                  if (!isLoggedIn) {
                    showConfirm("로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?", () => router.push("/login"));
                    return;
                  }
                  setIsUploadModalOpen(true);
                }}
                className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-stone-300 bg-stone-50 p-3 text-center transition-colors hover:border-[#e60000] md:gap-3 md:p-4"
                aria-label="라멘 인증샷 올리기"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors group-hover:border-[#e60000] group-hover:text-[#e60000] md:h-12 md:w-12">
                  <Camera className="h-5 w-5 md:h-6 md:w-6" />
                </span>
                <span className="break-keep text-xs font-black leading-tight text-[#25282b] transition-colors group-hover:text-[#e60000] md:text-sm">
                  라멘 인증샷 올리기
                </span>
                <span className="text-[11px] font-bold text-stone-600 leading-tight break-keep">
                  내가 먹은 메뉴를 기록해요
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="space-y-6 md:space-y-8">
            <div className="relative overflow-hidden rounded-md bg-[#25282b] p-5 text-white md:p-8">
              <div className="relative z-10">
                <h2 className="text-lg font-black mb-4 uppercase tracking-tighter italic">Information</h2>
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

            <div className="rounded-md border border-stone-200 bg-white p-4 md:p-6">
              <button 
                onClick={() => setIsVoteAccordionOpen(!isVoteAccordionOpen)}
                className="flex w-full items-center justify-between"
              >
                <h2 className="flex items-center text-lg font-bold text-[#25282b] md:text-xl"><Award className="mr-2 h-5 w-5 text-[#e60000]" /> 베스트 메뉴 투표</h2>
                <ChevronDown className={`h-5 w-5 transition-transform ${isVoteAccordionOpen ? "rotate-180" : ""}`} />
              </button>
              
              <div className={isVoteAccordionOpen ? "mt-6" : "mt-4"}>
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#e60000]">실시간 투표</p>
                <p className={`text-sm leading-relaxed text-stone-700 ${isVoteAccordionOpen ? "mb-6 md:mb-8" : "mb-0"}`}>이 가게에서 제일 맛있었던 메뉴는?</p>
                
                {isVoteAccordionOpen && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-5 md:space-y-6">
                      {votingMenus.map((menu) => (
                        <div key={menu.id || menu.name} className="relative">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              {menu.id === bestMenuId && <span className="mr-2 text-yellow-500 animate-pulse"><Star className="w-4 h-4" fill="currentColor" /></span>}
                              <span className={`transition-colors font-bold ${menu.id === bestMenuId ? "text-stone-950 scale-105 inline-block" : "text-stone-700"}`}>
                                {menu.name}
                              </span>
                            </div>
                            <button 
                              onClick={() => handleVote(menu)} 
                              aria-label={`${menu.name} 메뉴에 투표하기`}
                              className={`flex items-center gap-1 rounded-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                                menu.isVoted 
                                  ? "bg-[#e60000] text-white" 
                                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                              }`}
                            >
                              {menu.isVoted && <Check className="w-3 h-3" />}
                              {menu.isVoted ? "내 투표" : "투표"}
                            </button>
                          </div>
                          <ProgressBar votes={menu.votes} totalVotes={totalVotes} isSelected={menu.id === bestMenuId} />
                          <div className="flex justify-between items-center mt-1">
                            <span className={`text-[10px] font-black ${menu.id === bestMenuId ? "text-[#e60000]" : "text-stone-600"}`}>
                              {menu.id === bestMenuId ? "가장 많은 투표" : ""}
                            </span>
                            <div className="text-right text-[10px] font-mono font-bold text-stone-600">{menu.votes} 표</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
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

      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          shopId={shopId}
          shopName={shop.name}
        />
      )}

      {isUploadModalOpen && (
        <UploadPhotoModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          shopName={shop.name}
          menuList={shop.menu_list}
          onUpload={async (formData) => {
            try {
              await addProofPicture(shopId, formData);
              showToast("사진이 성공적으로 등록되었습니다!", "success");
              await refreshShopData();
              queryClient.invalidateQueries({ queryKey: ["ramen-shop-detail", shopId] });
            } catch (error: any) {
              console.error("Backend registration failed:", error);
              showToast(error.message || "사진 등록 중 오류가 발생했습니다.", "error");
            }
          }}
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

      {selectedPhoto && (
        <PhotoModal 
          photo={{ ...selectedPhoto, userId: selectedPhoto.uploaderId ?? selectedPhoto.userId }} 
          onClose={() => setSelectedPhoto(null)} 
          onDelete={handleDeletePhoto}
        />
      )}
    </div>
  );
}
