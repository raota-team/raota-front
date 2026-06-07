"use client";

import { useQuery } from "@tanstack/react-query";
import { getRamenShopDetail } from "@/lib/api/ramen-shops";
import { useApp } from "@/app/context/AppContext";
import type { Shop } from "@/app/types";

export const useRamenShopDetail = (shopId: number, initialShop?: Shop) => {
  const { currentUser } = useApp();
  const memberId = currentUser?.user_id;

  return useQuery({
    queryKey: ["ramen-shop-detail", shopId, memberId],
    queryFn: () => getRamenShopDetail(shopId, memberId),
    enabled: Number.isFinite(shopId),
    initialData: initialShop,
  });
};
