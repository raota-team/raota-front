"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type RecentVerifiedShopResponse,
  type WeekendRecommendationResponse,
  getRecentVerifiedShops,
  getPopularShopsToday,
  getHomeTips,
  getWeekendRecommendations,
  generateWeekendRecommendations,
} from "@/lib/api/discovery";

type DiscoveryResponse<T> = { success: boolean; data: T };

export const useRecentVerifiedShops = (
  limit: number = 4,
  initialData?: DiscoveryResponse<RecentVerifiedShopResponse[]>,
) => {
  return useQuery({
    queryKey: ["discovery", "recent-verified-shops", limit],
    queryFn: () => getRecentVerifiedShops(limit),
    staleTime: 1000 * 60 * 1, // 1 minute
    initialData,
  });
};

export const usePopularShopsToday = (limit: number = 5) => {
  return useQuery({
    queryKey: ["discovery", "popular-shops-today", limit],
    queryFn: () => getPopularShopsToday(limit),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

export const useHomeTips = (category: string = "tip", limit: number = 3) => {
  return useQuery({
    queryKey: ["discovery", "home-tips", category, limit],
    queryFn: () => getHomeTips(category, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useWeekendRecommendations = (
  initialData?: DiscoveryResponse<WeekendRecommendationResponse[]>,
) => {
  return useQuery({
    queryKey: ["discovery", "today-recommendations"],
    queryFn: () => getWeekendRecommendations(),
    staleTime: 1000 * 60 * 60, // 1 hour
    initialData,
  });
};

export const useGenerateWeekendRecommendations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateWeekendRecommendations(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discovery", "today-recommendations"] });
    },
  });
};
