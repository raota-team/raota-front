"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDiscoveryStats,
  getRecentVerifiedShops,
  getTrendingTags,
  getHomeTips,
  getWeekendRecommendations,
  generateWeekendRecommendations,
} from "@/lib/api/discovery";

export const useDiscoveryStats = () => {
  return useQuery({
    queryKey: ["discovery", "stats"],
    queryFn: () => getDiscoveryStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useRecentVerifiedShops = (limit: number = 4) => {
  return useQuery({
    queryKey: ["discovery", "recent-verified-shops", limit],
    queryFn: () => getRecentVerifiedShops(limit),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

export const useTrendingTags = (limit: number = 5) => {
  return useQuery({
    queryKey: ["discovery", "trending-tags", limit],
    queryFn: () => getTrendingTags(limit),
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

export const useWeekendRecommendations = () => {
  return useQuery({
    queryKey: ["discovery", "weekend-recommendations"],
    queryFn: () => getWeekendRecommendations(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useGenerateWeekendRecommendations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateWeekendRecommendations(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discovery", "weekend-recommendations"] });
    },
  });
};
