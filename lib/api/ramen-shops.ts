import { MenuItem, Shop } from "@/app/types";
import { apiClient } from "@/lib/api/client";

interface ApiPageMeta {
  number?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  totalPage?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

interface ApiRamenShop {
  id?: number | string;
  restaurant_id?: number | string;
  name?: string;
  restaurant_name?: string;
  tagLine?: string | null;
  branch_name?: string;
  naver_map_id?: string;
  region?: string;
  tags?: string[] | string | null;
  location?: string;
  address?: string;
  address_simple?: string;
  type?: string;
  ramen_type?: string;
  editorRating?: number | string;
  editor_rating?: number | string;
  userRating?: number | string;
  user_rating?: number | string;
  description?: string;
  thumbnailUrl?: string | null;
  imageUrl?: string;
  image_url?: string;
  restaurant_image_url?: string;
  votes?: number | string;
  visits?: number | string; // 신규 필드 추가
  menus?: Array<{ name?: string; votes?: number | string }>;
  menu_list?: ApiMenuItem[];
  normal_menus?: ApiMenuItem[];
  event_menus?: Shop["event_menus"];
  userPhotos?: Shop["userPhotos"];
  business_hours?: Shop["business_hours"];
  instagram_url?: string;
  catchTableUrl?: string;
  stats?: ApiShopStats;
  is_bookmarked?: boolean;
}

interface ApiMenuItem {
  id?: number | string;
  name?: string;
  price?: number | string;
  is_signature?: boolean;
  signature?: boolean;
  image_url?: string | null;
}

interface ApiShopStats {
  visit_count?: number | string;
  bookmark_count?: number | string;
}

interface RamenShopsListResponse {
  data: {
    items: ApiRamenShop[];
    page: ApiPageMeta;
  };
  status: string;
}

interface RamenShopDetailResponse {
  data: ApiRamenShop;
  status: string;
}

export interface RamenShopsParams {
  page?: number;
  size?: number;
  sort?: "LATEST" | "NAME" | "POPULAR" | "VISITS";
  city?: string;
  district?: string;
  keyword?: string;
  tag?: string;
  ramenTypeId?: string | number;
}

export interface RamenShopsPageInfo {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface RamenShopsResult {
  shops: Shop[];
  page: RamenShopsPageInfo;
}

const FALLBACK_IMAGE_URL = "/hero-home.jpg";
const DEFAULT_PAGE_SIZE = 12;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const buildApiUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  return `${API_BASE_URL}${path}`;
};

const normalizePage = (meta?: ApiPageMeta): RamenShopsPageInfo => {
  const number = toNumber(meta?.number, 0);
  const size = toNumber(meta?.size, DEFAULT_PAGE_SIZE);
  const totalElements = toNumber(meta?.totalElements, 0);
  const totalPages = toNumber(meta?.totalPages ?? meta?.totalPage, 1);

  return {
    number,
    size,
    totalElements,
    totalPages: totalPages > 0 ? totalPages : 1,
    hasNext: typeof meta?.hasNext === "boolean" ? meta.hasNext : number + 1 < totalPages,
    hasPrevious: typeof meta?.hasPrevious === "boolean" ? meta.hasPrevious : number > 0,
  };
};

const normalizeMenuItem = (menu: ApiMenuItem, index: number): MenuItem => ({
  id: toNumber(menu.id, index + 1),
  name: menu.name || `메뉴 ${index + 1}`,
  price: toNumber(menu.price, 0),
  is_signature: Boolean(menu.is_signature ?? menu.signature),
  image_url: menu.image_url || FALLBACK_IMAGE_URL,
});

const formatTime = (time: string | null): string | null => {
  if (!time || time === "정보 없음") return time;
  const parts = time.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
};

const normalizeBusinessHours = (hours?: Shop["business_hours"]): Shop["business_hours"] => ({
  closed_days: hours?.closed_days || "정보 없음",
  open_time: formatTime(hours?.open_time || "정보 없음")!,
  close_time: formatTime(hours?.close_time || "정보 없음")!,
  break_start: formatTime(hours?.break_start || null),
  break_end: formatTime(hours?.break_end || null),
  parking_info: hours?.parking_info || "정보 없음",
});

const normalizeShop = (shop: ApiRamenShop, index: number): Shop => {
  const rawMenuList = Array.isArray(shop.normal_menus)
    ? shop.normal_menus
    : Array.isArray(shop.menu_list)
      ? shop.menu_list
      : [];
  const menuList = rawMenuList.map(normalizeMenuItem);
  const parsedTags = Array.isArray(shop.tags)
    ? shop.tags
    : typeof shop.tags === "string"
      ? shop.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
  const votes = toNumber(shop.votes, 0);
  const menusFromApi = Array.isArray(shop.menus)
    ? shop.menus.map((menu, menuIndex) => ({
        id: (menu as any)?.id || (menuList[menuIndex]?.id), // ID 정보 추가
        name: menu?.name || `메뉴 ${menuIndex + 1}`,
        votes: toNumber(menu?.votes, 0),
      }))
    : [];
  
  // 서버에서 투표 목록을 따로 주지 않으면 전체 메뉴 리스트를 투표 항목으로 사용
  const fallbackMenus = menuList.map((menu) => ({
    id: menu.id,
    name: menu.name,
    votes: 0,
  }));

  return {
    id: toNumber(shop.id ?? shop.restaurant_id, index + 1),
    name: shop.name || shop.restaurant_name || "이름 미정",
    branch_name: shop.branch_name,
    naver_map_id: shop.naver_map_id,
    address: shop.address || shop.location || shop.address_simple || "주소 정보 없음",
    location:
      shop.location ||
      shop.address ||
      shop.region ||
      shop.address_simple ||
      "위치 정보 없음",
    type: parsedTags.join(", ") || shop.type || shop.ramen_type || "기타",
    editorRating: toNumber(shop.editorRating ?? shop.editor_rating, 0),
    userRating: toNumber(shop.userRating ?? shop.user_rating, 0),
    description: shop.description || shop.tagLine || "가게 설명이 아직 등록되지 않았습니다.",
    imageUrl:
      shop.imageUrl ||
      shop.thumbnailUrl ||
      shop.image_url ||
      shop.restaurant_image_url ||
      FALLBACK_IMAGE_URL,
    // menus에 ID 정보를 포함시킴
    menus: (menusFromApi.length > 0 ? menusFromApi : fallbackMenus) as any,
    menu_list: menuList,
    event_menus: Array.isArray(shop.event_menus) ? shop.event_menus : [],
    userPhotos: Array.isArray(shop.userPhotos) ? shop.userPhotos : [],
    business_hours: normalizeBusinessHours(shop.business_hours),
    stats: {
      // 신규 명세(visits) 우선, 없으면 기존 명세(votes 또는 stats) 지원
      visit_count: toNumber(shop.visits ?? shop.stats?.visit_count ?? shop.votes, 0),
      bookmark_count: toNumber(shop.stats?.bookmark_count, 0),
    },
    instagram_url: shop.instagram_url || "",
    catchTableUrl: shop.catchTableUrl || "",
    isBookmarked: Boolean(shop.is_bookmarked),
  };
};

export const getRamenShops = async (
  params: RamenShopsParams = {}
): Promise<RamenShopsResult> => {
  const payload = await apiClient<RamenShopsListResponse>(buildApiUrl("/ramen-shops"), {
    query: {
      page: params.page,
      size: params.size,
      sort: params.sort,
      city: params.city,
      district: params.district,
      keyword: params.keyword,
      tag: params.tag,
      ramenTypeId: params.ramenTypeId,
    },
  });

  return {
    shops: payload.data.items.map(normalizeShop),
    page: normalizePage(payload.data.page),
  };
};

export const getRamenShopDetail = async (shopId: number, memberId?: number): Promise<Shop> => {
  const query: Record<string, any> = {};
  if (memberId) query.memberId = memberId;

  const payload = await apiClient<RamenShopDetailResponse>(
    `/ramen-shops/${shopId}`,
    { query }
  );
  return normalizeShop(payload.data, 0);
};

/** 가게 북마크 토글 (찜하기/해제) */
export const toggleBookmark = async (shopId: number): Promise<boolean> => {
  const payload = await apiClient<{ data: boolean }>(
    buildApiUrl(`/ramen-shops/${shopId}/bookmark`),
    { method: "POST" }
  );
  return payload.data;
};

/** 메뉴 투표 */
export const voteMenu = async (shopId: number, menuId: number): Promise<any> => {
  return await apiClient(
    buildApiUrl(`/ramen-shops/${shopId}/votes/menus/${menuId}`),
    { method: "POST" }
  );
};

/** 투표 현황 조회 */
export const getVoteStatus = async (shopId: number): Promise<any> => {
  const payload = await apiClient<{ data: any }>(
    buildApiUrl(`/ramen-shops/${shopId}/votes`)
  );
  // 응답 데이터에 voted 필드가 포함되어 내려옴
  return payload.data;
};

/** 가게 사진 목록 조회 */
export const getShopPhotos = async (shopId: number, page = 0, size = 6): Promise<any> => {
  const res = await apiClient<any>(buildApiUrl(`/ramen-shops/${shopId}/photos`), {
    query: { page, size, sort: ["uploadedAt,desc"] }
  });
  
  // 제공해주신 스웨거 응답 명세 및 메뉴 네임 연동
  if (res && res.data && res.data.items) {
    return res.data.items.map((item: any) => ({
      id: item.photo_id,
      uploaderId: item.uploaderId ?? item.uploader_id ?? item.userId ?? item.user_id ?? item.memberId ?? item.member_id,
      userId: item.uploaderId ?? item.uploader_id ?? item.userId ?? item.user_id ?? item.memberId ?? item.member_id,
      user: item.uploader_nickname || "익명",
      imageUrl: item.image_url,
      menuName: item.menuName || item.menu_name || "라멘", // 메뉴 네임 사용
      date: item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('ko-KR') : "-",
      comment: item.oneLineComment || ""
    }));
  }
  return [];
};

/** 인증샷 등록 (URL 기반 최종 등록) */
export const addProofPicture = async (shopId: number, data: {
  imageUrl: string;
  menuName: string;
  description: string;
}): Promise<any> => {
  return await apiClient(
    buildApiUrl(`/ramen-shops/${shopId}/photos`),
    {
      method: "POST",
      body: data
    }
  );
};

/** 인증샷 삭제 */
export const deleteProofPicture = async (shopId: number, photoId: number): Promise<any> => {
  return await apiClient(
    buildApiUrl(`/ramen-shops/${shopId}/photos/${photoId}`),
    { method: "DELETE" }
  );
};

/** 가게 정보 제보하기 */
export const reportShop = async (shopId: number, data: {
  reportType: string;
  content: string;
}): Promise<any> => {
  return await apiClient(
    buildApiUrl(`/ramen-shops/${shopId}/reports`),
    {
      method: "POST",
      body: data
    }
  );
};

export const getTotalVotes = (shop: Shop) =>
  shop.menus.reduce((acc: number, curr) => acc + curr.votes, 0);
