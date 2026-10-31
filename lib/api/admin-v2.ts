import { type AdminPage } from "@/lib/api/admin";
import { apiClient, ApiClientError } from "@/lib/api/client";

type AdminV2Envelope<T> = {
  success: boolean;
  data: T;
  error: { code: string; message: string; fields: Array<{ field: string; code: string; message: string }> } | null;
  meta: { requestId: string };
};

const unwrap = <T>(response: AdminV2Envelope<T> | T): T => {
  if (response && typeof response === "object" && "data" in response) return response.data;
  return response as T;
};

export type AdminV2BusinessStatus = "OPERATIONAL" | "TEMPORARILY_CLOSED" | "CLOSED" | "UNKNOWN";
export type AdminV2ReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";
export type AdminV2ReportReason = "SPAM" | "ABUSE" | "SEXUAL" | "PRIVACY" | "OTHER";
export type AdminV2PerkType = "NOODLE_REFILL" | "RICE_REFILL" | "SOUP_REFILL" | "CONDIMENT";
export type AdminV2PerkStatus = "FREE" | "PAID" | "NOT_OFFERED" | "UNKNOWN";
export type AdminV2RamenLogVisibility = "PUBLIC" | "PRIVATE";
export type AdminV2RamenLogState = "LIVE" | "DELETED" | "ALL";
export type AdminV2RevisitIntention = "OFTEN" | "SOMETIMES" | "ONCE_IS_ENOUGH";

export interface AdminV2ShopRow {
  id: string;
  name: string;
  branchName: string | null;
  address: string;
  region: string | null;
  businessStatus: AdminV2BusinessStatus;
  published: boolean;
  thumbnailUrl: string | null;
  logCount: number;
  bookmarkCount: number;
  hoursVerifiedAt: string | null;
  updatedAt: string;
}

export interface AdminV2ShopForm {
  name: string;
  branchName: string | null;
  address: string;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  tagline: string | null;
  description: string | null;
  ramenTypes: string[];
  tags: string[];
  instagramUrl: string | null;
  reservationUrl: string | null;
  websiteUrl: string | null;
  naverPlaceId: string | null;
  kakaoPlaceId: string | null;
  priceMin: number | null;
  priceMax: number | null;
  businessStatus: AdminV2BusinessStatus;
  closedDaysText: string | null;
  imageUrls: string[];
}

export interface AdminV2BusinessHour {
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  closed: boolean;
  opensAt: string | null;
  closesAt: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  lastOrderAt: string | null;
}

export interface AdminV2ServicePerk {
  type: AdminV2PerkType;
  status: AdminV2PerkStatus;
  price: number | null;
  condition: string | null;
  verifiedAt?: string | null;
}

export interface AdminV2ShopDetail extends AdminV2ShopForm {
  id: string;
  published: boolean;
  hoursVerifiedAt: string | null;
  businessHours: AdminV2BusinessHour[];
  servicePerks: AdminV2ServicePerk[];
  aiReviewSummary: string | null;
  aiSummaryKeywords: string[];
  aiSummaryGeneratedAt: string | null;
  viewCount: number;
  logCount: number;
  bookmarkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminV2Report {
  id: string;
  status: AdminV2ReportStatus;
  reason: AdminV2ReportReason;
  reporter: { id: string; nickname: string | null };
  createdAt: string;
  resolvedAt: string | null;
  openReportCount: number;
  target: {
    type: "RAMEN_LOG" | "RAMEN_LOG_COMMENT";
    id: string;
    ramenLogId: string | null;
    author: { id: string; nickname: string | null } | null;
    text: string | null;
    menuName: string | null;
    imageUrl: string | null;
    deleted: boolean;
  };
}

export interface AdminV2RamenLogRow {
  id: string;
  author: { id: string; nickname: string | null };
  shop: { id: string; name: string | null; branchName: string | null };
  menuName: string;
  ramenType: string;
  visitedAt: string;
  visibility: AdminV2RamenLogVisibility;
  note: string;
  thumbnailUrl: string | null;
  imageCount: number;
  likeCount: number;
  commentCount: number;
  openReportCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdminV2RamenLogDetail extends AdminV2RamenLogRow {
  imageUrls: string[];
  // 서버 정의에 없는 옛 코드는 category·label이 null로 온다.
  tasteNotes: Array<{ code: string; category: string | null; label: string | null }>;
  revisitIntention: AdminV2RevisitIntention | null;
  // v1에서 옮긴 기록은 점수가 없다.
  scores: { satisfaction: number; brothDensity: number; noodleFirmness: number; topping: number } | null;
}

export type AdminV2RamenLogQuery = {
  visibility?: AdminV2RamenLogVisibility;
  state?: AdminV2RamenLogState;
  keyword?: string;
  userId?: string;
  shopId?: string;
  page?: number;
  size?: number;
};

const SHOP_PATH = "/admin/api/v2/shops";
const REPORT_PATH = "/admin/api/v2/reports";
const RAMEN_LOG_PATH = "/admin/api/v2/ramen-logs";
const shopPath = (id: string) => `${SHOP_PATH}/${encodeURIComponent(id)}`;

export async function getAdminV2Shops(params: { keyword?: string; published?: boolean; page?: number; size?: number } = {}): Promise<AdminPage<AdminV2ShopRow>> {
  return unwrap(await apiClient<AdminV2Envelope<AdminPage<AdminV2ShopRow>>>(SHOP_PATH, { query: params }));
}

export async function getAdminV2Shop(id: string): Promise<AdminV2ShopDetail> {
  return unwrap(await apiClient<AdminV2Envelope<AdminV2ShopDetail>>(shopPath(id)));
}

export async function createAdminV2Shop(form: AdminV2ShopForm): Promise<AdminV2ShopDetail> {
  return unwrap(await apiClient<AdminV2Envelope<AdminV2ShopDetail>>(SHOP_PATH, { method: "POST", body: form }));
}

export async function updateAdminV2Shop(id: string, form: AdminV2ShopForm): Promise<AdminV2ShopDetail> {
  return unwrap(await apiClient<AdminV2Envelope<AdminV2ShopDetail>>(shopPath(id), { method: "PUT", body: form }));
}

export async function updateAdminV2BusinessHours(id: string, hours: AdminV2BusinessHour[]): Promise<AdminV2ShopDetail> {
  return unwrap(await apiClient<AdminV2Envelope<AdminV2ShopDetail>>(`${shopPath(id)}/business-hours`, { method: "PUT", body: { hours } }));
}

export async function updateAdminV2ServicePerks(id: string, perks: Array<Omit<AdminV2ServicePerk, "verifiedAt">>): Promise<AdminV2ShopDetail> {
  return unwrap(await apiClient<AdminV2Envelope<AdminV2ShopDetail>>(`${shopPath(id)}/service-perks`, { method: "PUT", body: { perks } }));
}

export async function updateAdminV2ShopVisibility(id: string, published: boolean): Promise<AdminV2ShopDetail> {
  return unwrap(await apiClient<AdminV2Envelope<AdminV2ShopDetail>>(`${shopPath(id)}/visibility`, { method: "PATCH", body: { published } }));
}

export async function getAdminV2Reports(params: { status?: AdminV2ReportStatus; page?: number; size?: number } = {}): Promise<AdminPage<AdminV2Report>> {
  return unwrap(await apiClient<AdminV2Envelope<AdminPage<AdminV2Report>>>(REPORT_PATH, { query: params }));
}

export async function resolveAdminV2Report(id: string, action: "DELETE_CONTENT" | "DISMISS"): Promise<{ closedReportCount: number }> {
  return unwrap(await apiClient<AdminV2Envelope<{ closedReportCount: number }>>(`${REPORT_PATH}/${encodeURIComponent(id)}/resolve`, { method: "POST", body: { action } }));
}

export async function getAdminV2RamenLogs(params: AdminV2RamenLogQuery = {}): Promise<AdminPage<AdminV2RamenLogRow>> {
  return unwrap(await apiClient<AdminV2Envelope<AdminPage<AdminV2RamenLogRow>>>(RAMEN_LOG_PATH, { query: params }));
}

export async function getAdminV2RamenLog(id: string): Promise<AdminV2RamenLogDetail> {
  return unwrap(await apiClient<AdminV2Envelope<AdminV2RamenLogDetail>>(`${RAMEN_LOG_PATH}/${encodeURIComponent(id)}`));
}

export async function deleteAdminV2RamenLog(id: string): Promise<{ closedReportCount: number }> {
  return unwrap(await apiClient<AdminV2Envelope<{ closedReportCount: number }>>(`${RAMEN_LOG_PATH}/${encodeURIComponent(id)}`, { method: "DELETE" }));
}

export function readAdminV2Error(cause: unknown, fallback: string): string {
  if (cause instanceof ApiClientError) {
    if (cause.status === 401) return "로그인이 필요합니다.";
    if (cause.status === 403) return "관리자 권한이 필요합니다.";
    const payload = cause.payload as { error?: { message?: string; fields?: Array<{ field: string; message: string }> } } | null;
    if (payload?.error?.message) {
      const fields = payload.error.fields?.map(({ field, message }) => `${field}: ${message}`) ?? [];
      return [payload.error.message, ...fields].join("\n");
    }
  }
  return cause instanceof Error ? cause.message : fallback;
}
