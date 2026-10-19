"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ShopForm from "../ShopForm";
import { createAdminV2Shop } from "@/lib/api/admin-v2";

export default function AdminNewAppShopPage() {
  const router = useRouter();
  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-7"><div><h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">새 앱 매장</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">새 매장은 숨김으로 생성됩니다. 기본 정보를 저장한 다음 상세에서 영업시간과 혜택을 채우고 공개하세요.</p></div><Link href="/admin/app-shops" className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-stone-300 bg-white px-4 text-sm font-bold hover:border-[#e60000] hover:text-[#e60000]"><ArrowLeft className="h-4 w-4" />목록으로</Link></header>
    <ShopForm onSave={async (form) => { const created = await createAdminV2Shop(form); router.replace(`/admin/app-shops/${encodeURIComponent(created.id)}`); }} />
  </div>;
}
