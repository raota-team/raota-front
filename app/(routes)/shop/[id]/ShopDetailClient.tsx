"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { Shop, UserPhoto, EventMenu, MenuItem } from "../../../types";
import ProgressBar from "../../../components/ProgressBar";
import PhotoModal from "../../../components/PhotoModal";
import ReportModal from "../../../components/ReportModal";
import UploadPhotoModal from "../../../components/UploadPhotoModal";
import MenuDetailModal from "../../../components/MenuDetailModal";
import Loading from "@/app/loading";
import { useRamenShopDetail } from "@/hooks/queries/useRamenShopDetail";
import { getTotalVotes, toggleBookmark, voteMenu, getVoteStatus, getShopPhotos, addProofPicture, deleteProofPicture } from "@/lib/api/ramen-shops";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/app/context/AppContext";

/** 클라이언트 사이드 이미지 압축 함수 (WebP) */
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new (window as any).Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          },
          'image/webp',
          0.8
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface ShopDetailClientProps {
  params: Promise<{ id: string }>;
}

export default function ShopDetailClient({ params }: ShopDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast, showConfirm, isLoggedIn } = useApp();
  
  // URL 파라미터에서 ID 추출
  const useParamsData = useParams();
  const shopId = Number(useParamsData?.id);
  
  const { data, isLoading, isError } = useRamenShopDetail(shopId);
  
  const [shopDetail, setShopDetail] = useState<Shop | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [voteData, setVoteStatus] = useState<any>(null);
  const [shopPhotos, setShopPhotos] = useState<UserPhoto[]>([]);

  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const refreshShopData = async () => {
    try {
      const photos = await getShopPhotos(shopId, 0, 50);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <button 
        onClick={() => router.push("/shops")} 
        className="mb-8 flex items-center text-stone-500 hover:text-stone-900 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm uppercase tracking-widest">목록으로 돌아가기</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8">
          <div className="relative h-80 lg:h-96 w-full mb-6 overflow-hidden rounded-lg group">
            <img 
              src={shop.imageUrl} 
              alt={shop.name} 
              className="w-full h-full object-cover transition-all duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-5 md:p-8 w-full">
              <h1 className="text-2xl md:text-3xl lg:text-5xl font-black text-white mb-4 leading-tight break-keep">{shop.name}</h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-sm font-mono">
                <span className="flex items-center bg-black/40 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10 shadow-sm text-stone-200">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 text-red-500" /> {shop.location}
                </span>
                <span className="flex items-center bg-black/40 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10 shadow-sm text-stone-200">
                  <Menu className="w-3 h-3 md:w-4 md:h-4 mr-1 text-stone-400" /> {shop.type}
                </span>
                <span className="flex items-center bg-black/40 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10 shadow-sm text-yellow-400 font-bold">
                  <Camera className="w-3 h-3 md:w-4 md:h-4 mr-1" /> 인증 {shopPhotos.length}회
                </span>
              </div>
            </div>
          </div>

          <div className="prose prose-stone max-w-none mb-12">
            <div className="flex items-center justify-between mb-4 border-l-4 border-red-600 pl-4">
              <h3 className="text-xl font-bold text-stone-900 m-0">한줄평</h3>
              <button onClick={handleBookmarkToggle} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-bold shadow-sm ${isBookmarked ? "bg-red-50 text-red-600 border border-red-200" : "bg-stone-50 text-stone-500 border border-stone-200 hover:bg-stone-100"}`}>
                <Heart className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                <span>{isBookmarked ? "찜 취소" : "가게 찜하기"}</span>
              </button>
            </div>
            <p className="text-stone-600 text-lg leading-relaxed">{shop.description}</p>
          </div>

          {shop.event_menus && shop.event_menus.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-pink-500" /> 이벤트 메뉴</h3>
              <div className="grid grid-cols-1 gap-6">
                {shop.event_menus.map((event) => (
                  <div key={event.id} className="bg-white border border-stone-200 rounded-lg overflow-hidden flex flex-col md:flex-row group hover:border-pink-300 transition-colors shadow-sm">
                    <div className="md:w-1/3 h-48 md:h-auto overflow-hidden relative">
                      <img 
                        src={event.image_url} 
                        alt={event.name} 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" 
                      />
                      <div className="absolute top-2 left-2"><span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">{event.badge_text}</span></div>
                    </div>
                    <div className="p-6 md:w-2/3 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-black text-stone-900 group-hover:text-pink-500 transition-colors">{event.name}</h4>
                        <span className="text-lg font-mono font-bold text-stone-900">{event.price.toLocaleString()}원</span>
                      </div>
                      <p className="text-stone-500 text-sm leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {shop.menu_list && shop.menu_list.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center"><Utensils className="w-5 h-5 mr-2 text-stone-500" /> 일반 메뉴</h3>
              <div className="bg-white border border-stone-200 rounded-lg p-2 shadow-sm">
                {shop.menu_list.map((menu, idx) => (
                  <div key={menu.id} onClick={() => setSelectedMenu(menu)} className={`flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-stone-50 border-l-4 border-l-transparent hover:border-l-red-500 ${idx !== shop.menu_list.length - 1 ? "border-b border-stone-200" : ""}`}>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-sm overflow-hidden mr-4 bg-stone-100 flex-shrink-0">
                        <img 
                          src={menu.image_url} 
                          alt={menu.name} 
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center"><span className="font-bold mr-2 text-stone-900">{menu.name}</span>{menu.is_signature && <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-tighter">SIG</span>}</div>
                        <span className="text-xs text-stone-400 hidden sm:inline-block">클릭하면 자세히 보기</span>
                      </div>
                    </div>
                    <div className="font-mono text-stone-700 font-bold">{menu.price.toLocaleString()}원</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 border-t border-stone-200 pt-8">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-xl font-bold text-stone-900 flex items-center"><ImageIcon className="w-5 h-5 mr-2 text-red-500" /> 유저 메뉴 인증</h3>
              <span className="text-xs text-stone-400 font-mono">{shopPhotos.length}개 사진</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {shopPhotos.map((photo) => (
                <div key={photo.id} onClick={() => setSelectedPhoto(photo)} className="group relative aspect-square bg-stone-100 overflow-hidden cursor-pointer rounded-sm border border-stone-200 hover:border-red-400 transition-colors shadow-sm">
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.menuName} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" 
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
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => {
                  if (!isLoggedIn) {
                    showConfirm("로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?", () => router.push("/login"));
                    return;
                  }
                  setIsUploadModalOpen(true);
                }}
                className="bg-stone-900 text-white px-8 py-4 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95 flex items-center justify-center mx-auto"
              >
                <Camera className="w-5 h-5 mr-2" />
                라멘 인증샷 올리기
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-8">
            <div className="bg-white p-6 border border-stone-200 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center"><Award className="w-5 h-5 mr-2 text-red-500" /> 베스트 메뉴 투표</h3>
              <p className="text-stone-500 text-sm mb-8 leading-relaxed">이 가게에서 가장 맛있었던 메뉴는 무엇인가요? 매니아들의 투표로 베스트 메뉴가 결정됩니다.</p>
              
              <div className="space-y-6">
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
                        className={`text-[10px] px-3 py-1.5 transition-all uppercase font-black tracking-widest rounded-full flex items-center gap-1 ${
                          menu.isVoted 
                            ? "bg-stone-900 text-white shadow-lg" 
                            : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                        }`}
                      >
                        {menu.isVoted && <Check className="w-3 h-3" />}
                        {menu.isVoted ? "내 투표" : "투표"}
                      </button>
                    </div>
                    <ProgressBar votes={menu.votes} totalVotes={totalVotes} isSelected={menu.id === bestMenuId} />
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-[10px] font-black ${menu.id === bestMenuId ? "text-red-500" : "text-stone-300"}`}>
                        {menu.id === bestMenuId ? "가장 많은 투표" : ""}
                      </span>
                      <div className="text-right text-[10px] font-mono font-bold text-stone-400">{menu.votes} 표</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-stone-900 p-8 rounded-lg text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-lg font-black mb-4 uppercase tracking-tighter italic">Information</h4>
                <div className="space-y-4 text-sm font-mono text-stone-300">
                  <p className="flex justify-between border-b border-white/10 pb-2"><span className="text-stone-500">영업시간</span><span>{shop.business_hours?.open_time} - {shop.business_hours?.close_time}</span></p>
                  <p className="flex justify-between border-b border-white/10 pb-2"><span className="text-stone-500">휴무일</span><span>{shop.business_hours?.closed_days}</span></p>
                  <p className="flex justify-between border-b border-white/10 pb-2"><span className="text-stone-500">주차</span><span>{shop.business_hours?.parking_info}</span></p>
                </div>
                <div className="mt-8 flex gap-3">
                  {shop.instagram_url && <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/10 hover:bg-pink-600 transition-colors p-3 rounded flex items-center justify-center gap-2 font-bold text-xs"><Instagram className="w-4 h-4" /> Instagram</a>}
                  {shop.catchTableUrl && <a href={shop.catchTableUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/10 hover:bg-stone-100 hover:text-stone-900 transition-all p-3 rounded flex items-center justify-center gap-2 font-bold text-xs"><Utensils className="w-4 h-4" /> Reservation</a>}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs text-stone-400 hover:text-stone-600 underline transition-colors underline-offset-4"
              >
                정보 수정 및 새로운 이벤트 제보하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        shopId={shopId} 
        shopName={shop.name} 
      />

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

      {selectedMenu && (
        <MenuDetailModal 
          menu={selectedMenu} 
          onClose={() => setSelectedMenu(null)} 
        />
      )}

      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
          onDelete={handleDeletePhoto}
        />
      )}
    </div>
  );
}
