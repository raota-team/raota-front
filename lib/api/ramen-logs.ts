import type { TasteNotes } from "@/app/components/RamenLogModal";
import type { RamenLogItem } from "@/app/components/RamenLogCard";
import { apiClient } from "@/lib/api/client";
import { isRamenLogFallbackImage } from "@/lib/constants/images";
import { normalizeTasteNoteValue } from "@/lib/utils/ramen-log-taste-notes";

export type RamenLogSort = "LATEST" | "POPULAR";
export type RamenLogRevisit = "DEFINITELY" | "SOMETIMES" | "ONCE_ENOUGH";
export type RamenLogRevisitLabel = "자주 감" | "가끔 생각남" | "한번이면 충분";

export interface RamenLogDto {
  id: number;
  author: {
    id: number;
    name: string;
    imageUrl?: string | null;
  };
  shop: {
    id: number;
    name: string;
    location?: string | null;
  };
  menuName: string;
  ramenType: string;
  imageUrl: string;
  createdAt: string;
  visitedAt?: string | null;
  note?: string | null;
  tasteNotes?: Partial<TasteNotes> | null;
  revisit: RamenLogRevisit;
  likeCount: number;
  liked: boolean;
  public: boolean;
  mine: boolean;
}

export type RamenLog = RamenLogItem & {
  ramenType: string;
  note: string;
  tasteNotes: TasteNotes;
  revisit: RamenLogRevisitLabel;
  likes: number;
  mine: boolean;
};

export interface RamenLogRequest {
  shopId: number;
  menuName: string;
  ramenType: string;
  imageUrl: string;
  visitedAt: string;
  note?: string;
  tasteNotes?: Partial<TasteNotes>;
  revisit: RamenLogRevisit;
  public: boolean;
}

export interface RamenLogPageInfo {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface RamenLogPage {
  items: RamenLog[];
  page: RamenLogPageInfo;
}

export interface RamenLogShop {
  id: number;
  name: string;
  logCount: number;
}

type ApiResponse<T> = {
  status: string;
  message?: string | null;
  data: T;
};

type ApiPageResponse<T> = ApiResponse<{
  items: T[];
  page: RamenLogPageInfo;
}>;

const emptyTasteNotes = (): TasteNotes => ({
  broth: [],
  noodle: [],
  seasoning: [],
  topping: [],
});

const revisitLabelMap: Record<RamenLogRevisit, RamenLogRevisitLabel> = {
  DEFINITELY: "자주 감",
  SOMETIMES: "가끔 생각남",
  ONCE_ENOUGH: "한번이면 충분",
};

const revisitValueMap: Record<RamenLogRevisitLabel, RamenLogRevisit> = {
  "자주 감": "DEFINITELY",
  "가끔 생각남": "SOMETIMES",
  "한번이면 충분": "ONCE_ENOUGH",
};

export const toRevisitLabel = (value: RamenLogRevisit): RamenLogRevisitLabel =>
  revisitLabelMap[value] ?? "가끔 생각남";

export const toRevisitValue = (value: RamenLogRevisitLabel): RamenLogRevisit =>
  revisitValueMap[value] ?? "SOMETIMES";

export const normalizeRamenLog = (log: RamenLogDto): RamenLog => {
  const defaults = emptyTasteNotes();
  const tasteNotes = log.tasteNotes ?? {};

  return {
    id: Number(log.id),
    author: {
      id: Number(log.author?.id),
      name: log.author?.name || "익명",
      imageUrl: log.author?.imageUrl || undefined,
    },
    shop: {
      id: Number(log.shop?.id),
      name: log.shop?.name || "가게 정보 없음",
      location: log.shop?.location || undefined,
    },
    menuName: log.menuName || "메뉴 기록",
    ramenType: log.ramenType || "기타",
    imageUrl: log.imageUrl,
    date: log.visitedAt || log.createdAt,
    note: log.note || "",
    tasteNotes: {
      broth: (tasteNotes.broth ?? defaults.broth).map(normalizeTasteNoteValue),
      noodle: (tasteNotes.noodle ?? defaults.noodle).map(normalizeTasteNoteValue),
      seasoning: (tasteNotes.seasoning ?? defaults.seasoning).map(normalizeTasteNoteValue),
      topping: (tasteNotes.topping ?? defaults.topping).map(normalizeTasteNoteValue),
    },
    revisit: toRevisitLabel(log.revisit),
    likes: Number(log.likeCount) || 0,
    isLiked: Boolean(log.liked),
    isPublic: Boolean(log.public),
    mine: Boolean(log.mine),
  };
};

const normalizePage = (page: RamenLogPageInfo): RamenLogPageInfo => ({
  number: Number(page?.number) || 0,
  size: Number(page?.size) || 8,
  totalElements: Number(page?.totalElements) || 0,
  totalPages: Number(page?.totalPages) || 0,
  hasNext: Boolean(page?.hasNext),
  hasPrevious: Boolean(page?.hasPrevious),
});

const normalizeRamenLogPage = (
  items: RamenLogDto[] = [],
  page?: RamenLogPageInfo,
): RamenLogPage => {
  const visibleItems = items.filter((log) => !isRamenLogFallbackImage(log.imageUrl));
  const hiddenCount = items.length - visibleItems.length;
  const normalizedPage = normalizePage(page);

  return {
    items: visibleItems.map(normalizeRamenLog),
    page: {
      ...normalizedPage,
      totalElements: Math.max(0, normalizedPage.totalElements - hiddenCount),
    },
  };
};

export const getRamenLogs = async (params: {
  page?: number;
  size?: number;
  sort?: RamenLogSort;
  shopId?: number;
  keyword?: string;
} = {}): Promise<RamenLogPage> => {
  const response = await apiClient<ApiPageResponse<RamenLogDto>>("/ramen-logs", {
    query: params,
  });

  return normalizeRamenLogPage(response.data?.items ?? [], response.data?.page);
};

export const getRamenLog = async (logId: number): Promise<RamenLog> => {
  const response = await apiClient<ApiResponse<RamenLogDto>>(`/ramen-logs/${logId}`);
  return normalizeRamenLog(response.data);
};

export const createRamenLog = async (request: RamenLogRequest): Promise<RamenLog | null> => {
  const response = await apiClient<ApiResponse<RamenLogDto>>("/ramen-logs", {
    method: "POST",
    body: request,
  });
  return response.data ? normalizeRamenLog(response.data) : null;
};

export const updateRamenLog = async (
  logId: number,
  request: RamenLogRequest,
): Promise<RamenLog> => {
  const response = await apiClient<ApiResponse<RamenLogDto>>(`/ramen-logs/${logId}`, {
    method: "PATCH",
    body: request,
  });
  return response.data ? normalizeRamenLog(response.data) : getRamenLog(logId);
};

export const deleteRamenLog = async (logId: number): Promise<void> => {
  await apiClient(`/ramen-logs/${logId}`, { method: "DELETE" });
};

export const toggleRamenLogLike = async (
  logId: number,
): Promise<{ liked: boolean; likeCount: number }> => {
  const response = await apiClient<ApiResponse<{ liked: boolean; likeCount: number }>>(
    `/ramen-logs/${logId}/likes`,
    { method: "POST" },
  );
  return response.data;
};

export const getMyRamenLogs = async (params: {
  page?: number;
  size?: number;
  shopId?: number;
} = {}): Promise<RamenLogPage> => {
  const response = await apiClient<ApiPageResponse<RamenLogDto>>("/users/me/ramen-logs", {
    query: params,
  });
  return normalizeRamenLogPage(response.data?.items ?? [], response.data?.page);
};

export const getUserRamenLogs = async (
  userId: number | string,
  params: { page?: number; size?: number; shopId?: number } = {},
): Promise<RamenLogPage> => {
  const response = await apiClient<ApiPageResponse<RamenLogDto>>(
    `/users/${userId}/ramen-logs`,
    { query: params },
  );
  return normalizeRamenLogPage(response.data?.items ?? [], response.data?.page);
};

export const getMyRamenLogShops = async (): Promise<RamenLogShop[]> => {
  const response = await apiClient<ApiResponse<RamenLogShop[]>>("/users/me/ramen-logs/shops");
  return response.data ?? [];
};

export const getUserRamenLogShops = async (
  userId: number | string,
): Promise<RamenLogShop[]> => {
  const response = await apiClient<ApiResponse<RamenLogShop[]>>(
    `/users/${userId}/ramen-logs/shops`,
  );
  return response.data ?? [];
};
