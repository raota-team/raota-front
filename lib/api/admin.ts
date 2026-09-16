import { apiClient } from "@/lib/api/client";

export interface ApiEnvelope<T> {
  status?: string;
  message?: string;
  data: T;
}

export interface AdminPageMeta {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminPage<T> {
  items: T[];
  page: AdminPageMeta;
}

export interface AdminShopSummary {
  id: number;
  name: string;
  address: string | null;
  imageUrl: string | null;
  published: boolean;
}

export interface AdminShopForm {
  id?: number;
  name: string;
  branchName?: string;
  naverMapId?: string;
  city: string;
  district?: string;
  street: string;
  detail?: string;
  latitude?: number | null;
  longitude?: number | null;
  closedDays?: string;
  openTime?: string;
  closeTime?: string;
  breakStart?: string;
  breakEnd?: string;
  instagramUrl?: string;
  catchTableUrl?: string;
  description?: string;
  detailedDescription?: string;
  parkingInfo?: string;
  imageUrl?: string;
  currentImageUrl?: string;
  tags?: string;
  published?: boolean;
  normalMenus?: Array<Record<string, unknown>>;
  eventMenus?: Array<Record<string, unknown>>;
  publishedValue?: boolean;
}

export interface AdminUserSummary {
  id: number;
  nickname: string;
  email: string | null;
  role: "USER" | "ADMIN";
  providers: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  registrationCompleted: boolean;
  deleted: boolean;
}

export interface AdminUserDetail {
  id: number;
  profile: {
    memberId: number;
    nickname: string;
    email: string | null;
    role: "USER" | "ADMIN";
    imageUrl: string | null;
    backgroundImageUrl: string | null;
    bio: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    deletedAt: string | null;
    registrationCompleted: boolean;
    deleted: boolean;
  };
  socialAccounts: Array<{
    provider: string;
    providerUserId: string | null;
    email: string | null;
    nickname: string | null;
    profileImageUrl: string | null;
  }>;
  activityStats: {
    visitedRestaurantCount: number;
    photoCount: number;
    bookmarkCount: number;
    postCount: number;
    commentCount: number;
  };
  activityVisibility: {
    logsPublic: boolean;
    visitsPublic: boolean;
    postsPublic: boolean;
    commentsPublic: boolean;
  };
}

export type ReportType = "OPENING_HOURS_ERROR" | "CLOSED" | "MENU_INFO_ERROR" | "OTHERS" | "EVENT";

export interface AdminShopReport {
  id: number;
  shopId: number;
  shopName: string;
  branchName: string | null;
  memberId: number;
  memberNickname: string;
  memberEmail: string | null;
  reportType: ReportType;
  reportTypeDescription: string | null;
  content: string;
  reportedAt: string | null;
}

export interface RetrievalDocument {
  text: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface ExternalReviewIndexResult {
  source: string;
  indexedCount: number;
  skippedCount: number;
}

const unwrap = <T>(response: ApiEnvelope<T> | T): T => {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiEnvelope<T>).data;
  }
  return response as T;
};

/** 관리자 API를 호출할 수 있는지 확인한다. 역할은 클라이언트 값이 아니라 서버 권한 응답으로 판정한다. */
export const checkAdminAccess = async (): Promise<void> => {
  await apiClient<ApiEnvelope<AdminPage<AdminUserSummary>>>("/admin/api/users", {
    query: { page: 0, size: 1 },
    redirectOnUnauthorized: false,
  });
};

export const getAdminShops = async (): Promise<AdminShopSummary[]> => {
  const response = await apiClient<ApiEnvelope<AdminShopSummary[]>>("/admin/api/ramen-shops");
  return unwrap(response);
};

export const getAdminShop = async (shopId: number): Promise<AdminShopForm> => {
  const response = await apiClient<ApiEnvelope<AdminShopForm>>(`/admin/api/ramen-shops/${shopId}`);
  return unwrap(response);
};

export const createAdminShop = async (form: AdminShopForm): Promise<{ id: number }> => {
  const response = await apiClient<ApiEnvelope<{ id: number }>>("/admin/api/ramen-shops", {
    method: "POST",
    body: form,
  });
  return unwrap(response);
};

export const updateAdminShop = async (shopId: number, form: AdminShopForm): Promise<{ id: number }> => {
  const response = await apiClient<ApiEnvelope<{ id: number }>>(`/admin/api/ramen-shops/${shopId}`, {
    method: "PUT",
    body: form,
  });
  return unwrap(response);
};

export const deleteAdminShop = async (shopId: number): Promise<{ id: number }> => {
  const response = await apiClient<ApiEnvelope<{ id: number }>>(`/admin/api/ramen-shops/${shopId}`, {
    method: "DELETE",
  });
  return unwrap(response);
};

export const updateAdminShopVisibility = async (shopId: number, published: boolean): Promise<{ id: number }> => {
  const response = await apiClient<ApiEnvelope<{ id: number }>>(`/admin/api/ramen-shops/${shopId}/visibility`, {
    method: "PATCH",
    body: { published },
  });
  return unwrap(response);
};

export const updateAdminShopVisibilityBulk = async (fromId: number, toId: number, published: boolean) => {
  const response = await apiClient<ApiEnvelope<{ fromId: number; toId: number; published: boolean; updatedCount: number }>>(
    "/admin/api/ramen-shops/visibility",
    { method: "PATCH", body: { fromId, toId, published } },
  );
  return unwrap(response);
};

export const getAdminUsers = async (params: {
  keyword?: string;
  registrationCompleted?: boolean;
  deleted?: boolean;
  provider?: "GOOGLE" | "KAKAO";
  emailPresent?: boolean;
  page?: number;
  size?: number;
} = {}): Promise<AdminPage<AdminUserSummary>> => {
  const response = await apiClient<ApiEnvelope<AdminPage<AdminUserSummary>>>("/admin/api/users", {
    query: params,
  });
  return unwrap(response);
};

export const getAdminUser = async (memberId: number): Promise<AdminUserDetail> => {
  const response = await apiClient<ApiEnvelope<AdminUserDetail>>(`/admin/api/users/${memberId}`);
  return unwrap(response);
};

export const getAdminReports = async (params: {
  keyword?: string;
  reportType?: ReportType;
  page?: number;
  size?: number;
} = {}): Promise<AdminPage<AdminShopReport>> => {
  const response = await apiClient<ApiEnvelope<AdminPage<AdminShopReport>>>("/admin/api/ramen-shop-reports", {
    query: params,
  });
  return unwrap(response);
};

export const reindexAllShops = async () => {
  const response = await apiClient<ApiEnvelope<Record<string, unknown>>>("/admin/api/retrieval/shops/reindex", { method: "POST" });
  return unwrap(response);
};

export const reindexShop = async (shopId: number) => {
  const response = await apiClient<ApiEnvelope<Record<string, unknown>>>(`/admin/api/retrieval/shops/${shopId}/reindex`, { method: "POST" });
  return unwrap(response);
};

export const getShopReviewDocuments = async (shopId: number, query: string, topK = 12, similarityThreshold = 0.2) => {
  const response = await apiClient<ApiEnvelope<RetrievalDocument[]>>(`/admin/api/retrieval/shops/${shopId}/review-documents`, {
    query: { query, topK, similarityThreshold },
  });
  return unwrap(response);
};

export const reindexCatchtableReviews = async (path: string): Promise<ExternalReviewIndexResult> => {
  const response = await apiClient<ApiEnvelope<ExternalReviewIndexResult>>("/admin/api/retrieval/external-reviews/catchtable/reindex", {
    method: "POST",
    body: { path },
  });
  return unwrap(response);
};
