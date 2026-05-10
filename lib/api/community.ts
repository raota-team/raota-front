import { apiClient } from "./client";

export type RamenShopSortType = "LATEST" | "POPULAR" | "NAME" | "VISITS";

export interface CommunityPostCard {
  postId: number;
  category: string;
  ramenShopId: number | null;
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

export interface CommunityPostDetail extends CommunityPostCard {
  imageUrls: string[];
  contentFormat: "MARKDOWN" | "PLAIN" | "TIPTAP_JSON";
  content: string;
  isLiked: boolean;
  author_id?: number; // 하위 호환성 위해 유지
}

export interface CommunityComment {
  commentId: number;
  authorNickname: string;
  authorId: number;
  authorImageUrl: string | null;
  createdAt: string;
  content: string;
  isDeleted: boolean;
  replies: CommunityComment[];
  parentCommentId?: number | null;
  taggedParentAuthorNickname?: string | null;
}

export interface CommunityPostCreateRequest {
  category: string;
  ramenShopId: number | null;
  title: string;
  thumbnailUrl?: string;
  contentFormat: "MARKDOWN" | "PLAIN" | "TIPTAP_JSON";
  content: string;
}

/** 커뮤니티 글 목록 조회 */
export const getCommunityPosts = async (params: {
  page?: number;
  size?: number;
  category?: string;
  ramenShopId?: number | null;
}) => {
  return await apiClient<any>("/community/posts", { query: params });
};

/** 커뮤니티 글 작성 */
export const createCommunityPost = async (data: CommunityPostCreateRequest) => {
  return await apiClient<any>("/community/posts", {
    method: "POST",
    body: data,
  });
};

/** 커뮤니티 글 상세 조회 */
export const getCommunityPostDetail = async (postId: number) => {
  return await apiClient<any>(`/community/posts/${postId}`);
};

/** 커뮤니티 글 수정 */
export const updateCommunityPost = async (postId: number, data: CommunityPostCreateRequest) => {
  return await apiClient<any>(`/community/posts/${postId}`, {
    method: "PATCH",
    body: data,
  });
};

/** 커뮤니티 글 삭제 */
export const deleteCommunityPost = async (postId: number) => {
  return await apiClient<any>(`/community/posts/${postId}`, {
    method: "DELETE",
  });
};

/** 게시글 좋아요 토글 */
export const togglePostLike = async (postId: number) => {
  return await apiClient<any>(`/community/posts/${postId}/likes`, {
    method: "POST",
  });
};

/** 댓글 목록 조회 */
export const getComments = async (postId: number, page = 0, size = 20) => {
  return await apiClient<any>(`/community/posts/${postId}/comments`, {
    query: { page, size }
  });
};

/** 댓글 및 답글 작성 */
export const createComment = async (postId: number, data: { content: string; parentCommentId?: number | null }) => {
  return await apiClient<any>(`/community/posts/${postId}/comments`, {
    method: "POST",
    body: data,
  });
};

/** 댓글 수정 */
export const updateComment = async (commentId: number, content: string) => {
  return await apiClient<any>(`/community/comments/${commentId}`, {
    method: "PUT",
    body: { content },
  });
};

/** 댓글 삭제 */
export const deleteComment = async (commentId: number) => {
  return await apiClient<any>(`/community/comments/${commentId}`, {
    method: "DELETE",
  });
};

/** 글 작성용 라멘집 목록 조회 */
export const getRamenShopOptions = async (keyword?: string, page = 0, sort?: RamenShopSortType) => {
  return await apiClient<any>("/community/ramen-shops", {
    query: { keyword, page, size: 100, sort }
  });
};
