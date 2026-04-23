import { apiClient } from "./client";

export interface UserProfileUpdateParams {
  nickname: string;
  profile_image_url?: string;
  background_image_url?: string;
  bio?: string; // userDescription 대신 bio로 변경
}

export interface UserStats {
  visited_restaurant_count: number;
  total_photo_count: number;
  total_bookmark_count: number;
  post_count: number;
  comment_count: number;
}

export interface MyProfileData {
  user_id: number;
  nickname: string;
  profile_image_url: string;
  background_image_url: string;
  userDescription: string;
  stats: UserStats;
}

export interface UserProfileResponse {
  status: string;
  message: string;
  data: MyProfileData;
}

// 페이징 공통 메타데이터
export interface PageMeta {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: {
    items: T[];
    page: PageMeta;
  };
}

// 방문 기록
export interface VisitSummary {
  restaurant_id: number;
  restaurant_name: string;
  restaurant_image_url: string;
  simple_address: string;
  visit_count_for_user: number;
  last_visited_at: string;
}

// 북마크
export interface BookmarkSummary {
  restaurant_id: number;
  restaurant_name: string;
  restaurant_image_url: string;
  address_simple: string; // simple_address에서 address_simple로 변경
  bookmarked_at: string;
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
  description?: string; // oneLineComment에서 description으로 변경
}

// 내 댓글
export interface MyCommentSummary {
  commentId: number;
  post_id: number;
  postTitle?: string;
  parentCommentId: number | null;
  authorNickname: string;
  taggedParentAuthorNickname: string | null;
  createdAt: string;
  content: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/** 내 프로필 조회 */
export const getMyProfile = async (): Promise<UserProfileResponse> => {
  return await apiClient<UserProfileResponse>(`${API_BASE_URL}/users/me/profile`);
};

/** 프로필 수정 */
export const updateUserProfile = async (
  params: UserProfileUpdateParams
): Promise<UserProfileResponse> => {
  return await apiClient<UserProfileResponse>(`${API_BASE_URL}/users/me/profile`, {
    method: "PATCH",
    body: params,
  });
};

/** 내 방문 목록 */
export const getMyVisits = async (page = 0, size = 20) => {
  return await apiClient<PaginatedResponse<VisitSummary>>(`${API_BASE_URL}/users/me/visits`, {
    query: { page, size } // sort 제거
  });
};

/** 내 북마크 목록 */
export const getMyBookmarks = async (page = 0, size = 20) => {
  return await apiClient<PaginatedResponse<BookmarkSummary>>(`${API_BASE_URL}/users/me/bookmarks`, {
    query: { page, size } // sort 제거
  });
};

/** 내 글 목록 */
export const getMyPosts = async (page = 0, size = 10) => {
  return await apiClient<PaginatedResponse<MyPostSummary>>(`${API_BASE_URL}/users/me/posts`, {
    query: { page, size, sort: ["createdAt,desc"] }
  });
};

/** 내 사진 목록 */
export const getMyPhotos = async (page = 0, size = 20) => {
  return await apiClient<PaginatedResponse<MyPhotoSummary>>(`${API_BASE_URL}/users/me/photos`, {
    query: { page, size } // sort 제거
  });
};

/** 내 댓글 목록 */
export const getMyComments = async (page = 0, size = 20) => {
  return await apiClient<PaginatedResponse<MyCommentSummary>>(`${API_BASE_URL}/users/me/comments`, {
    query: { page, size, sort: ["createdAt,desc"] }
  });
};
