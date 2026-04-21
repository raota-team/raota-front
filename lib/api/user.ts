import { apiClient } from "./client";

export interface UserProfileUpdateParams {
  nickname: string;
  profile_image_url?: string;
  background_image_url?: string;
}

export interface UserProfileResponse {
  status: string;
  message: string;
  data: {
    user_id: number;
    nickname: string;
    profile_image_url: string;
    background_image_url: string;
    userDescription: string;
    stats: {
      visited_restaurant_count: number;
      total_photo_count: number;
      total_bookmark_count: number;
      post_count: number;
      comment_count: number;
    };
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * 사용자 닉네임, 프로필 이미지, 백그라운드 이미지를 업데이트합니다.
 */
export const updateUserProfile = async (
  params: UserProfileUpdateParams
): Promise<UserProfileResponse> => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  // 엔드포인트를 /users/me/profile 로 수정
  return await apiClient<UserProfileResponse>(`${API_BASE_URL}/users/me/profile`, {
    method: "PATCH", // '수정'이므로 PATCH가 더 적절할 수 있음 (기존 PUT에서 변경)
    body: params,
  });
};
