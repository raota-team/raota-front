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
  visited_restaurant_count: number;
  total_photo_count: number;
  total_bookmark_count: number;
  post_count: number;
  comment_count: number;
}

export interface MyProfileData {
  user_id: number;
  id?: number;
  nickname: string;
  profile_image_url: string;
  background_image_url: string;
  userDescription: string;
  stats: UserStatsDto;
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

/** 내 프로필 조회 */
export const getMyProfile = async (): Promise<UserProfileResponse> => {
  return await apiClient<UserProfileResponse>(`/users/me/profile`);
};

/** 내 요약 프로필 조회 (홈 화면용) */
export const getMemberSummary = async (): Promise<{ success: boolean; data: MemberSummaryResponse }> => {
  return await apiClient<{ success: boolean; data: MemberSummaryResponse }>(`/users/me/summary`);
};

/** 타 사용자 프로필 조회 */
export const getUserProfile = async (userId: number | string): Promise<UserProfileResponse> => {
  return await apiClient<UserProfileResponse>(`/users/${userId}/profile`);
};

/** 내 활동 내역 조회용 헬퍼들 */
export const getMyVisits = async (page = 0, size = 20) => {
  return await apiClient<PaginatedResponse<VisitSummary>>(`/users/me/visits`, { query: { page, size } });
};

export const getMyBookmarks = async (page = 0, size = 20) => {
  return await apiClient<PaginatedResponse<BookmarkSummary>>(`/users/me/bookmarks`, { query: { page, size } });
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

/** 회원 탈퇴 */
export const deleteMyAccount = async (): Promise<DeleteMyAccountResponse> => {
  return await apiClient<DeleteMyAccountResponse>(`/users/me`, {
    method: "DELETE",
  });
};
