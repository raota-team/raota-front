"use client";

import { useEffect, useMemo, useState } from "react";
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
  Filter,
  X,
} from "lucide-react";
import { Shop, UserPhoto, EventMenu } from "../../../types";
import ProgressBar from "../../../components/ProgressBar";
import PhotoModal from "../../../components/PhotoModal";
import ReportModal from "../../../components/ReportModal";
import UploadPhotoModal from "../../../components/UploadPhotoModal";
import { useRamenShopDetail } from "@/hooks/queries/useRamenShopDetail";
import { getTotalVotes } from "@/lib/api/ramen-shops";

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = Number(params.id as string);
  const { data, isLoading, isError } = useRamenShopDetail(shopId);
  const [shopDetail, setShopDetail] = useState<Shop | null>(null);

  const [filterMenu, setFilterMenu] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setShopDetail(data);
    }
  }, [data]);

  const shop = shopDetail;
  const totalVotes = useMemo(() => (shop ? getTotalVotes(shop) : 0), [shop]);
  const sortedMenus = shop
    ? [...shop.menus]
        .map((menu, index) => ({ ...menu, originalIndex: index }))
        .sort((a, b) => b.votes - a.votes)
    : [];
  const bestMenu = sortedMenus[0];

  const handleVote = (menuIndex: number) => {
    setShopDetail((prev) => {
      if (!prev) return prev;
      const nextMenus = [...prev.menus];
      nextMenus[menuIndex] = {
        ...nextMenus[menuIndex],
        votes: nextMenus[menuIndex].votes + 1,
      };
      return {
        ...prev,
        menus: nextMenus,
      };
    });
  };

  if (isLoading && !shop) {
    return (
      <div className="py-12 text-center text-stone-500">
        가게 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="py-12 text-center">
        <p className="text-stone-700 font-semibold mb-2">
          가게 정보를 찾을 수 없습니다.
        </p>
        {isError && (
          <p className="text-sm text-stone-500">
            가게 상세 정보를 불러오지 못했습니다.
          </p>
        )}
      </div>
    );
  }

  // Filter logic
  const displayedPhotos = filterMenu
    ? shop.userPhotos?.filter(
        (photo: UserPhoto) => photo.menuName === filterMenu,
      )
    : shop.userPhotos;

  return (
    <div className="animate-fade-in relative">
      <button
        onClick={() => router.push("/")}
        className="mb-6 flex items-center text-stone-500 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-wider"
      >
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
              <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold tracking-widest mb-3">
                에디터 픽
              </span>
              <h1 className="text-3xl lg:text-5xl font-black text-white mb-2 leading-tight truncate">
                {shop.name}
              </h1>
              <div className="flex items-center text-stone-200 space-x-4 text-sm font-mono">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" /> {shop.location}
                </span>
                <span className="flex items-center">
                  <Menu className="w-4 h-4 mr-1" /> {shop.type}
                </span>
                <span className="flex items-center text-yellow-400 font-bold">
                  <Camera className="w-4 h-4 mr-1" /> 인증{" "}
                  {shop.userPhotos?.length || 0}회
                </span>
              </div>
            </div>
          </div>

          <div className="prose prose-stone max-w-none mb-12">
            <h3 className="text-xl font-bold text-stone-900 mb-4 border-l-4 border-red-600 pl-4">
              에디터 리뷰
            </h3>
            <p className="text-stone-600 text-lg leading-relaxed">
              {shop.description}
            </p>
          </div>

          {/* Event Menus Section */}
          {shop.event_menus && shop.event_menus.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center">
                <Sparkles
                  className="w-5 h-5 mr-2 text-yellow-500"
                  fill="currentColor"
                />
                스페셜 이벤트 메뉴
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {shop.event_menus.map((event: EventMenu) => (
                  <div
                    key={event.id}
                    className="bg-white border border-stone-200 rounded-lg overflow-hidden flex flex-col md:flex-row group hover:border-pink-300 transition-colors shadow-sm"
                  >
                    <div className="md:w-1/3 h-48 md:h-auto overflow-hidden relative">
                      <img
                        src={event.image_url}
                        alt={event.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                          {event.badge_text}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 md:w-2/3 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-black text-stone-900 group-hover:text-pink-500 transition-colors">
                          {event.name}
                        </h4>
                        <span className="text-lg font-mono font-bold text-stone-900">
                          {event.price.toLocaleString()}원
                        </span>
                      </div>
                      <p className="text-stone-500 text-sm leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard Menus Section (Clickable) */}
          {shop.menu_list && shop.menu_list.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center">
                <Utensils className="w-5 h-5 mr-2 text-stone-500" />
                일반 메뉴
              </h3>
              <div className="bg-white border border-stone-200 rounded-lg p-2 shadow-sm">
                {shop.menu_list.map((menu, idx) => {
                  const isActive = filterMenu === menu.name;
                  return (
                    <div
                      key={menu.id}
                      onClick={() => setFilterMenu(isActive ? null : menu.name)}
                      className={`flex items-center justify-between p-4 cursor-pointer transition-all ${idx !== shop.menu_list.length - 1 ? "border-b border-stone-200" : ""} ${isActive ? "bg-stone-100 border-l-4 border-l-red-600" : "hover:bg-stone-50 border-l-4 border-l-transparent"}`}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-sm overflow-hidden mr-4 bg-stone-100 flex-shrink-0 relative">
                          <img
                            src={menu.image_url}
                            alt={menu.name}
                            className="w-full h-full object-cover"
                          />
                          {isActive && (
                            <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                              <Filter className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span
                              className={`font-bold mr-2 ${isActive ? "text-red-500" : "text-stone-900"}`}
                            >
                              {menu.name}
                            </span>
                            {menu.is_signature && (
                              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-tighter">
                                SIG
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-stone-400 hidden sm:inline-block">
                            클릭하면 사진 보기
                          </span>
                        </div>
                      </div>
                      <div className="font-mono text-stone-700 font-bold">
                        {menu.price.toLocaleString()}원
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-12 border-t border-stone-200 pt-8">
            <div className="flex justify-between items-end mb-6">
              <div className="flex items-center">
                <h3 className="text-xl font-bold text-stone-900 flex items-center mr-4">
                  <ImageIcon className="w-5 h-5 mr-2 text-red-500" />
                  {filterMenu ? `사진: ${filterMenu}` : "유저 메뉴 인증"}
                </h3>
                {filterMenu && (
                  <button
                    onClick={() => setFilterMenu(null)}
                    className="flex items-center text-xs bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 px-2 py-1 rounded-sm transition-colors border border-red-200"
                  >
                    <X className="w-3 h-3 mr-1" /> 필터 해제
                  </button>
                )}
              </div>
              <span className="text-xs text-stone-400 font-mono">
                {displayedPhotos?.length || 0}개 사진
              </span>
            </div>

            {displayedPhotos && displayedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayedPhotos.map((photo: UserPhoto) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative aspect-square bg-stone-100 overflow-hidden cursor-pointer rounded-sm border border-stone-200 hover:border-red-400 transition-colors"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.menuName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <p className="text-white text-xs font-bold truncate">
                        {photo.menuName}
                      </p>
                      <div className="flex justify-between items-center mt-1 border-t border-white/20 pt-1">
                        <span className="text-stone-300 text-[10px] font-mono">
                          @{photo.user}
                        </span>
                        <span className="text-stone-400 text-[10px] font-mono">
                          {photo.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => setIsUploadModalOpen(true)}
                  className="aspect-square bg-stone-50 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-400 hover:bg-red-50/50 transition-all cursor-pointer group rounded-sm"
                >
                  <div className="p-3 rounded-full bg-stone-200 group-hover:bg-red-100 mb-3 transition-colors">
                    <Camera className="w-6 h-6 group-hover:scale-[1.03] transition-transform" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    사진 올리기
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-stone-300 rounded-sm bg-stone-50">
                <p className="text-stone-400 mb-2">
                  No photos found for{" "}
                  <span className="text-red-500 font-bold">{filterMenu}</span>
                </p>
                <button
                  className="text-sm text-stone-500 underline hover:text-stone-900"
                  onClick={() => setFilterMenu(null)}
                >
                  View all photos
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-8">
            <div className="bg-white p-6 border border-stone-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-xl font-black text-stone-900 uppercase italic">
                    베스트 메뉴 투표
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    이 가게의 필청(必聽) 메뉴는?
                  </p>
                </div>
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="space-y-6">
                {sortedMenus.map((menu) => (
                  <div key={menu.name} className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        {menu.name === bestMenu.name && (
                          <span className="mr-2 text-yellow-500">
                            <Star className="w-3 h-3" fill="currentColor" />
                          </span>
                        )}
                        <span className="text-stone-700 font-bold">
                          {menu.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleVote(menu.originalIndex)}
                        className="text-xs bg-stone-100 hover:bg-red-600 text-stone-600 hover:text-white px-3 py-1 transition-colors uppercase font-bold tracking-wider"
                      >
                        투표
                      </button>
                    </div>
                    <ProgressBar
                      votes={menu.votes}
                      totalVotes={totalVotes}
                      isSelected={menu.name === bestMenu.name}
                    />
                    <div className="text-right text-xs font-mono text-stone-400">
                      {menu.votes} 표
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 border border-stone-200 rounded-lg shadow-sm">
              <h4 className="text-sm font-bold text-stone-500 mb-4 uppercase tracking-widest">
                가게 정보
              </h4>
              <div className="space-y-3 text-sm text-stone-700">
                <p className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-400">영업시간</span>
                  <span className="font-mono text-stone-900">
                    {shop.business_hours?.open_time} -{" "}
                    {shop.business_hours?.close_time}
                  </span>
                </p>
                {shop.business_hours?.break_start && (
                  <p className="flex justify-between border-b border-stone-200 pb-2">
                    <span className="text-stone-400">브레이크 타임</span>
                    <span className="font-mono text-stone-900">
                      {shop.business_hours?.break_start} -{" "}
                      {shop.business_hours?.break_end}
                    </span>
                  </p>
                )}
                <p className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-400">휴무일</span>
                  <span className="text-stone-900">
                    {shop.business_hours?.closed_days}
                  </span>
                </p>
                <p className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-400">주차</span>
                  <span className="text-stone-900">
                    {shop.business_hours?.parking_info ?? "불가"}
                  </span>
                </p>
                {shop.instagram_url && (
                  <div className="pt-2">
                    <a
                      href={shop.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full bg-stone-100 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 text-stone-600 hover:text-white py-2 rounded-sm transition-all text-xs font-bold uppercase tracking-wider"
                    >
                      <Instagram className="w-4 h-4 mr-2" /> 공식 인스타그램{" "}
                      <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                    </a>
                  </div>
                )}
                {shop.catchTableUrl && (
                  <div className="pt-2">
                    <a
                      href={shop.catchTableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full bg-stone-100 hover:bg-orange-500 text-stone-600 hover:text-white py-2 rounded-sm transition-all text-xs font-bold uppercase tracking-wider"
                    >
                      <Utensils className="w-4 h-4 mr-2" /> 캐치테이블 예약{" "}
                      <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Report Button */}
            <div className="text-center">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs text-stone-400 hover:text-stone-600 underline transition-colors"
              >
                혹시 정보가 다른가요? 제보하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <PhotoModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        shopName={shop.name}
      />

      <UploadPhotoModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        shopName={shop.name}
        menuList={shop.menu_list}
      />
    </div>
  );
}
