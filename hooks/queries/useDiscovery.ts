"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type WeekendRecommendationResponse,
  getPopularShopsToday,
  getHomeTips,
  getWeekendRecommendations,
  generateWeekendRecommendations,
} from "@/lib/api/discovery";
import { getRecentRamenLogShops, type RecentRamenLogShop } from "@/lib/api/ramen-logs";

type DiscoveryResponse<T> = { success: boolean; data: T };

export const useRecentRamenLogShops = (
  limit: number = 4,
  initialData?: RecentRamenLogShop[],
) => {
  return useQuery({
    queryKey: ["discovery", "recent-ramen-log-shops", limit],
    queryFn: () => getRecentRamenLogShops(limit),
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
