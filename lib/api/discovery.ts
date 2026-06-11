import { apiClient } from "./client";

export interface DiscoveryStatsResponse {
  totalShops: number;
  totalReviews: number;
  totalUsers: number;
}

export interface RecentVerifiedShopResponse {
  id: string | number;
  name: string;
  location: string;
  imageUrl: string;
  photoCount: number;
}

export interface WeekendRecommendationResponse {
  id: string | number;
  name: string;
  title: string;
  location: string;
  imageUrl: string;
  reason: string;
}

export interface TrendingTagResponse {
  rank: number;
  name: string;
  trend: "up" | "down" | "new" | "same";
}

export interface CommunityHomePostResponse {
  id: string | number;
  title: string;
  contentSnippet: string;
  author: {
    nickname: string;
    profileImageUrl: string;
  };
  commentCount: number;
  createdAt: string;
}

export const getDiscoveryStats = async (): Promise<{ success: boolean; data: DiscoveryStatsResponse }> => {
  return apiClient<{ success: boolean; data: DiscoveryStatsResponse }>("/api/v1/discovery/stats");
};

export const getRecentVerifiedShops = async (limit: number = 4): Promise<{ success: boolean; data: RecentVerifiedShopResponse[] }> => {
  return apiClient<{ success: boolean; data: RecentVerifiedShopResponse[] }>(`/api/v1/shops/recent-verified?limit=${limit}`);
};

export const getTrendingTags = async (limit: number = 5): Promise<{ success: boolean; data: TrendingTagResponse[] }> => {
  return apiClient<{ success: boolean; data: TrendingTagResponse[] }>(`/api/v1/discovery/trending-tags?limit=${limit}`);
};

export const getHomeTips = async (category: string = "tip", limit: number = 3): Promise<{ success: boolean; data: CommunityHomePostResponse[] }> => {
  return apiClient<{ success: boolean; data: CommunityHomePostResponse[] }>(`/api/v1/community/posts?category=${category}&limit=${limit}`);
};

export const getWeekendRecommendations = async (): Promise<{ success: boolean; data: WeekendRecommendationResponse[] }> => {
  return apiClient<{ success: boolean; data: WeekendRecommendationResponse[] }>("/api/v1/discovery/weekend-recommendations");
};

export const generateWeekendRecommendations = async (): Promise<{ success: boolean; data: WeekendRecommendationResponse[] }> => {
  return apiClient<{ success: boolean; data: WeekendRecommendationResponse[] }>("/api/v1/discovery/weekend-recommendations/generate", {
    method: "POST",
  });
};
