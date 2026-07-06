import { apiClient } from "./client";

export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: {
    items: T[];
    page: PageMeta;
  };
}

export interface UserProfileUpdateParams {
  nickname: string;
  profile_image_url?: string;
  background_image_url?: string;
  bio?: string;
}

export interface UserStatsDto {
  visited_restaurant_count: number | null;
  total_photo_count: number | null;
  total_log_count?: number | null;
  total_bookmark_count: number;
  post_count: number | null;
  comment_count: number | null;
}

export interface ActivityVisibility {
  logs: boolean;
  visits: boolean;
  posts: boolean;
  comments: boolean;
}

export interface MyProfileData {
  user_id: number;
  id?: number;
  nickname: string;
  email?: string;
  memberEmail?: string;
  member_email?: string;
  profile_image_url: string;
  background_image_url: string;
  userDescription: string;
  stats: UserStatsDto;
  activity_visibility: ActivityVisibility;
}

export interface UserProfileResponse {
  status: string;
  message: string;
  data: MyProfileData;
}

export interface DeleteMyAccountResponse {
  status: string;
  message: string;
  data: null;
}

export interface MemberSummaryResponse {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

// 내 글
export interface MyPostSummary {
  post_id: number;
  category: string;
  storeName: string | null;
  title: string;
  contentPreview: string;
  imageUrl: string;
  authorName: string;
  authorId: number;
  authorImageUrl: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

// 내 사진
export interface MyPhotoSummary {
  photo_id: number;
  image_url: string;
  menuName: string;
  restaurant_id: number;
  restaurant_name: string;
  uploaded_at: string;
  description?: string;
}

// 내 댓글
export interface MyCommentSummary {
  commentId: number;
  post_id: number;
  postTitle?: string;
  parentCommentId: number | null;
  authorNickname: string;
  authorId: number;
  authorImageUrl: string | null;
  taggedParentAuthorNickname: string | null;
  createdAt: string;
  content: string;
  isDeleted?: boolean;
}

export interface BookmarkSummary {
  restaurant_id: number;
  restaurant_name: string;
  restaurant_image_url: string;
  address_simple: string;
  bookmarked_at: string;
}

type ApiBookmarkSummary = Partial<BookmarkSummary> & {
  id?: number | string;
  shopId?: number | string;
  shop_id?: number | string;
  ramenShopId?: number | string;
  ramen_shop_id?: number | string;
  name?: string;
  shopName?: string;
  shop_name?: string;
  restaurantName?: string;
  imageUrl?: string;
  image_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  shopImageUrl?: string;
  shop_image_url?: string;
  region?: string;
  address?: string;
  simple_address?: string;
  location?: string;
  bookmarkedAt?: string;
  createdAt?: string;
};

export interface VisitSummary {
  restaurant_id: number;
  restaurant_name: string;
  restaurant_image_url: string;
  simple_address: string;
  visit_count_for_user: number;
  last_visited_at: string;
}

export interface PageMeta {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeBookmark = (bookmark: ApiBookmarkSummary): BookmarkSummary => ({
  restaurant_id: toNumber(
    bookmark.restaurant_id ??
      bookmark.shopId ??
      bookmark.shop_id ??
      bookmark.ramenShopId ??
      bookmark.ramen_shop_id ??
      bookmark.id
  ),
  restaurant_name:
    bookmark.restaurant_name ??
    bookmark.restaurantName ??
    bookmark.shopName ??
    bookmark.shop_name ??
    bookmark.name ??
    "이름 미정",
  restaurant_image_url:
    bookmark.restaurant_image_url ??
    bookmark.shopImageUrl ??
    bookmark.shop_image_url ??
    bookmark.thumbnailUrl ??
    bookmark.thumbnail_url ??
    bookmark.imageUrl ??
    bookmark.image_url ??
    "",
  address_simple:
    bookmark.address_simple ??
    bookmark.simple_address ??
    bookmark.region ??
    bookmark.address ??
    bookmark.location ??
    "주소 정보 없음",
  bookmarked_at:
    bookmark.bookmarked_at ??
    bookmark.bookmarkedAt ??
    bookmark.createdAt ??
    "",
});

/** 내 프로필 조회 */
export const getMyProfile = async (options?: { redirectOnUnauthorized?: boolean }): Promise<UserProfileResponse> => {
  return await apiClient<UserProfileResponse>(`/users/me/profile`, {
    redirectOnUnauthorized: options?.redirectOnUnauthorized,
  });
};

/** 내 요약 프로필 조회 (홈 화면용) */
export const getMemberSummary = async (): Promise<{ success: boolean; data: MemberSummaryResponse }> => {
  return await apiClient<{ success: boolean; data: MemberSummaryResponse }>(`/users/me/summary`);
};

/** 타 사용자 프로필 조회 */
export const getUserProfile = async (userId: number | string): Promise<UserProfileResponse> => {
  return await apiClient<UserProfileResponse>(`/users/${userId}/profile`);
};

export const getMyPrivacySettings = async (): Promise<{ status: string; data: ActivityVisibility }> => {
  return await apiClient<{ status: string; data: ActivityVisibility }>(`/users/me/privacy-settings`);
};

export const updateMyPrivacySettings = async (
  settings: ActivityVisibility,
): Promise<{ status: string; data: ActivityVisibility }> => {
  return await apiClient<{ status: string; data: ActivityVisibility }>(`/users/me/privacy-settings`, {
    method: "PATCH",
    body: settings,
  });
};

/** 내 활동 내역 조회용 헬퍼들 */
export const getMyVisits = async (page = 0, size = 20) => {
  return await apiClient<PaginatedResponse<VisitSummary>>(`/users/me/visits`, { query: { page, size } });
};

export const getMyBookmarks = async (page = 0, size = 20) => {
  const response = await apiClient<PaginatedResponse<ApiBookmarkSummary>>(`/users/me/bookmarks`, { query: { page, size } });
  return {
    ...response,
    data: {
      ...response.data,
      items: (response.data.items || []).map(normalizeBookmark),
    },
  };
};

export const getMyPosts = async (page = 0, size = 10) => {
  return await apiClient<PaginatedResponse<MyPostSummary>>(`/users/me/posts`, { query: { page, size } });
};

export const getMyComments = async (page = 0, size = 10) => {
  return await apiClient<PaginatedResponse<MyCommentSummary>>(`/users/me/comments`, { query: { page, size } });
};

export const getMyPhotos = async (page = 0, size = 20) => {
  return await apiClient<PaginatedResponse<MyPhotoSummary>>(`/users/me/photos`, { query: { page, size } });
};

/** 타 사용자 활동 내역 조회 */
export const getUserVisits = async (userId: number | string, page = 0, size = 20) => {
  return await apiClient<PaginatedResponse<VisitSummary>>(`/users/${userId}/visits`, { query: { page, size } });
};

export const getUserPosts = async (userId: number | string, page = 0, size = 10) => {
  return await apiClient<PaginatedResponse<MyPostSummary>>(`/users/${userId}/posts`, { query: { page, size } });
};

export const getUserComments = async (userId: number | string, page = 0, size = 20) => {
  return await apiClient<PaginatedResponse<MyCommentSummary>>(`/users/${userId}/comments`, { query: { page, size } });
};

export const getUserPhotos = async (userId: number | string, page = 0, size = 20) => {
  return await apiClient<PaginatedResponse<MyPhotoSummary>>(`/users/${userId}/photos`, { query: { page, size } });
};

/** 프로필 수정 */
export const updateUserProfile = async (params: UserProfileUpdateParams): Promise<UserProfileResponse> => {
  return await apiClient<UserProfileResponse>(`/users/me/profile`, {
    method: "PATCH",
    body: params,
  });
};

/** 내 이메일 수정 */
export const updateMyEmail = async (email: string): Promise<UserProfileResponse> => {
  return await apiClient<UserProfileResponse>(`/users/me/email`, {
    method: "PATCH",
    body: { email },
  });
};

/** 회원 탈퇴 */
export const deleteMyAccount = async (): Promise<DeleteMyAccountResponse> => {
  return await apiClient<DeleteMyAccountResponse>(`/users/me`, {
    method: "DELETE",
  });
};
