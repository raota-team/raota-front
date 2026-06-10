"use client";

import { useQuery } from "@tanstack/react-query";
import { getMemberSummary } from "@/lib/api/user";

export const useMemberSummary = () => {
  return useQuery({
    queryKey: ["user", "summary"],
    queryFn: () => getMemberSummary(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry if it fails (likely due to 401 unauthenticated)
  });
};
