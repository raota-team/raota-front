"use client";

import { useQuery } from "@tanstack/react-query";
import { getRamenShopDetail } from "@/lib/api/ramen-shops";
import { useApp } from "@/app/context/AppContext";

export const useRamenShopDetail = (shopId: number) => {
  const { currentUser } = useApp();
  const memberId = currentUser?.user_id;

  return useQuery({
    queryKey: ["ramen-shop-detail", shopId, memberId],
    queryFn: () => getRamenShopDetail(shopId, memberId),
    enabled: Number.isFinite(shopId),
  });
};
