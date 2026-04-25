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

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast, showConfirm, isLoggedIn } = useApp();
  const shopId = Number(params.id as string);
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
      const [votes, photos] = await Promise.all([
        getVoteStatus(shopId),
        getShopPhotos(shopId)
      ]);
      setVoteStatus(votes);
      setShopPhotos(photos);
    } catch (err) {
      console.error("Failed to refresh shop interactive data:", err);
    }
  };

  useEffect(() => {
    if (data) {
      setShopDetail(data);
      setIsBookmarked(data.isBookmarked);
      refreshShopData();
    }
  }, [data, shopId]);

  const shop = shopDetail;
  
  const totalVotes = voteData?.total_votes || 0;
  const sortedMenus = useMemo(() => {
    if (voteData?.vote_results && voteData.vote_results.length > 0) {
      return voteData.vote_results.map((r: any) => ({
        id: r.menu_id,
        name: r.menu_name,
        votes: r.vote_count,
        percentage: r.percentage,
        isVoted: r.voted // 사용자의 투표 여부
      })).sort((a: any, b: any) => b.votes - a.votes);
    }
    return shop?.menus || [];
  }, [voteData, shop]);
  
  const bestMenu = sortedMenus[0];

  const handleVote = async (menu: any) => {
    if (!isLoggedIn) {
      showConfirm("로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?", () => {
        router.push("/login");
      });
      return;
    }

    if (!menu?.id || !shop) return;

    try {
      await voteMenu(shop.id, menu.id);
      
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
    } catch (error: any) {
      console.error("Delete failed:", error);
      showToast(error.message || "사진 삭제 중 오류가 발생했습니다.", "error");
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isLoggedIn) {
      showConfirm("로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?", () => {
        router.push("/login");
      });
      return;
    }

    if (!shop) return;
    try {
      const newStatus = await toggleBookmark(shop.id);
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

  if (isLoading && !shop) {
    return <Loading />;
  }

  if (!shop) {
    return <div className="py-20 text-center text-stone-500 font-bold text-xl">가게 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="relative">
      <button onClick={() => router.push("/")} className="mb-6 flex items-center text-stone-500 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4 mr-2" /> 목록으로 돌아가기
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">
        <div className="lg:col-span-8">
          <div className="relative h-80 lg:h-96 w-full mb-6 overflow-hidden rounded-lg group">
            <img 
              src={shop.imageUrl} 
              alt={shop.name} 
              className="w-full h-full object-cover transition-all duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <h1 className="text-3xl lg:text-5xl font-black text-white mb-2 leading-tight truncate">{shop.name}</h1>
              <div className="flex items-center text-stone-200 space-x-4 text-sm font-mono">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {shop.location}</span>
                <span className="flex items-center"><Menu className="w-4 h-4 mr-1" /> {shop.type}</span>
                <span className="flex items-center text-yellow-400 font-bold"><Camera className="w-4 h-4 mr-1" /> 인증 {shopPhotos.length}회</span>
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
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" /> 스페셜 이벤트 메뉴</h3>
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
                        <Link
                          href={`/user/${photo.uploaderId || photo.user}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-stone-300 text-[10px] font-mono hover:text-white hover:underline transition-all"
                        >
                          @{photo.user}
                        </Link>
                        <span className="text-stone-400 text-[10px] font-mono">
                          {photo.date}
                        </span>
                      </div>
                  </div>
                </div>
              ))}
              <div onClick={() => { if (!isLoggedIn) { showConfirm("로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?", () => router.push("/login")); return; } setIsUploadModalOpen(true); }} className="aspect-square bg-stone-50 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-400 hover:bg-red-50/50 transition-all cursor-pointer group rounded-sm min-h-[160px]">
                <div className="p-3 rounded-full bg-stone-200 group-hover:bg-red-100 mb-3 transition-colors"><Camera className="w-6 h-6 group-hover:scale-[1.03] transition-transform" /></div>
                <span className="text-xs font-bold uppercase tracking-wider text-center px-2">사진 추가하기</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-8">
            <div className="bg-white p-6 border border-stone-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-stone-200 pb-4">
                <div><h3 className="text-xl font-black text-stone-900 uppercase italic">베스트 메뉴 투표</h3><p className="text-xs text-stone-500 mt-1">이 가게의 베스트 메뉴는?</p></div>
              </div>
              <div className="space-y-6">
                {sortedMenus.map((menu) => (
                  <div key={menu.id || menu.name} className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        {menu.name === bestMenu?.name && <span className="mr-2 text-yellow-500"><Star className="w-3 h-3" fill="currentColor" /></span>}
                        <span className="text-stone-700 font-bold">{menu.name}</span>
                      </div>
                      <button 
                        onClick={() => handleVote(menu)} 
                        className={`text-xs px-3 py-1 transition-all uppercase font-bold tracking-wider rounded flex items-center gap-1 ${
                          menu.isVoted 
                            ? "bg-red-600 text-white shadow-md shadow-red-200" 
                            : "bg-stone-100 text-stone-600 hover:bg-red-600 hover:text-white"
                        }`}
                      >
                        {menu.isVoted && <Check className="w-3 h-3" />}
                        {menu.isVoted ? "내 투표" : "투표"}
                      </button>
                    </div>
                    <ProgressBar votes={menu.votes} totalVotes={totalVotes} isSelected={menu.name === bestMenu?.name} />
                    <div className="text-right text-xs font-mono text-stone-400">{menu.votes} 표</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 border border-stone-200 rounded-lg shadow-sm">
              <h4 className="text-sm font-bold text-stone-500 mb-4 uppercase tracking-widest text-center">가게 정보</h4>
              <div className="space-y-3 text-sm text-stone-700">
                <p className="flex justify-between border-b border-stone-200 pb-2"><span className="text-stone-400 font-medium">영업시간</span><span className="font-mono text-stone-900">{shop.business_hours?.open_time} - {shop.business_hours?.close_time}</span></p>
                {shop.business_hours?.break_start && <p className="flex justify-between border-b border-stone-200 pb-2"><span className="text-stone-400 font-medium">브레이크 타임</span><span className="font-mono text-stone-900">{shop.business_hours?.break_start} - {shop.business_hours?.break_end}</span></p>}
                <p className="flex justify-between border-b border-stone-200 pb-2"><span className="text-stone-400 font-medium">휴무일</span><span className="text-stone-900 font-bold">{shop.business_hours?.closed_days}</span></p>
                <p className="flex justify-between border-b border-stone-200 pb-2"><span className="text-stone-400 font-medium">주차</span><span className="text-stone-900 font-bold">{shop.business_hours?.parking_info ?? "불가"}</span></p>
                {shop.instagram_url && <div className="pt-2"><a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-stone-100 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 text-stone-600 hover:text-white py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider shadow-sm"><Instagram className="w-4 h-4 mr-2" /> 공식 인스타그램 <ExternalLink className="w-3 h-3 ml-2 opacity-50" /></a></div>}
                {shop.catchTableUrl && <div className="pt-2"><a href={shop.catchTableUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-stone-100 hover:bg-orange-500 text-stone-600 hover:text-white py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider shadow-sm"><Utensils className="w-4 h-4 mr-2" /> 캐치테이블 예약 <ExternalLink className="w-3 h-3 ml-2 opacity-50" /></a></div>}
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

      <MenuDetailModal menu={selectedMenu} onClose={() => setSelectedMenu(null)} />
      <PhotoModal 
        photo={selectedPhoto ? {
          id: selectedPhoto.id,
          imageUrl: selectedPhoto.imageUrl,
          menuName: selectedPhoto.menuName,
          user: selectedPhoto.user,
          userId: selectedPhoto.uploaderId,
          date: selectedPhoto.date,
          comment: selectedPhoto.comment
        } : null} 
        onClose={() => setSelectedPhoto(null)} 
        onDelete={handleDeletePhoto}
        disableNavigation={false} 
      />
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        shopName={shop.name} 
        shopId={shopId} 
      />
      <UploadPhotoModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        shopName={shop.name}
        menuList={shop.menu_list}
        onUpload={async (uploadData) => {
          try {
            await addProofPicture(shopId, {
              imageUrl: uploadData.imageUrl,
              menuName: uploadData.menuName,
              description: uploadData.comment
            });
            showToast("사진이 성공적으로 등록되었습니다!", "success");
            await refreshShopData();
          } catch (error: any) {
            console.error("Backend registration failed:", error);
            showToast(error.message || "사진 등록 중 오류가 발생했습니다.", "error");
          }
        }}
      />
    </div>
  );
}
