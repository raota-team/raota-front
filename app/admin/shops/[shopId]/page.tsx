"use client";

import { useParams } from "next/navigation";
import ShopForm from "../ShopForm";

export default function AdminShopDetailPage() {
  const params = useParams<{ shopId: string }>();
  const shopId = Number(params.shopId);
  if (!Number.isInteger(shopId) || shopId < 1) return <p className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">올바른 매장 ID가 아닙니다.</p>;
  return <ShopForm shopId={shopId} />;
}
