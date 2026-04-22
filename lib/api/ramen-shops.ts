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
  sort?: string[];
  region?: string;
  keyword?: string;
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
        name: menu?.name || `메뉴 ${menuIndex + 1}`,
        votes: toNumber(menu?.votes, 0),
      }))
    : [];
  const fallbackMenus =
    menuList.length > 0
      ? menuList.slice(0, 3).map((menu) => ({
          name: menu.name,
          votes: 0,
        }))
      : [{ name: "대표 메뉴", votes }];

  return {
    id: toNumber(shop.id ?? shop.restaurant_id, index + 1),
    name: shop.name || shop.restaurant_name || "이름 미정",
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
    menus: menusFromApi.length > 0 ? menusFromApi : fallbackMenus,
    menu_list: menuList,
    event_menus: Array.isArray(shop.event_menus) ? shop.event_menus : [],
    userPhotos: Array.isArray(shop.userPhotos) ? shop.userPhotos : [],
    business_hours: shop.business_hours || {
      closed_days: "정보 없음",
      open_time: "00:00",
      close_time: "00:00",
      break_start: null,
      break_end: null,
      parking_info: "정보 없음",
    },
    stats: {
      visit_count: toNumber(shop.stats?.visit_count, 0),
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
      region: params.region,
      keyword: params.keyword,
    },
  });

  return {
    shops: payload.data.items.map(normalizeShop),
    page: normalizePage(payload.data.page),
  };
};

export const getRamenShopDetail = async (shopId: number): Promise<Shop> => {
  const payload = await apiClient<RamenShopDetailResponse>(
    buildApiUrl(`/ramen-shops/${shopId}`)
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

export const getTotalVotes = (shop: Shop) =>
  shop.menus.reduce((acc: number, curr) => acc + curr.votes, 0);
