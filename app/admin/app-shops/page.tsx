"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Plus, Search } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { type AdminPage } from "@/lib/api/admin";
import { getAdminV2Shops, readAdminV2Error, updateAdminV2ShopVisibility, type AdminV2ShopRow } from "@/lib/api/admin-v2";
import { businessStatusLabels } from "./shop-labels";

const PAGE_SIZE = 20;
type VisibilityFilter = "ALL" | "PUBLISHED" | "HIDDEN";

export default function AdminAppShopsPage() {
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("ALL");
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<AdminPage<AdminV2ShopRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getAdminV2Shops({ keyword: keyword || undefined, published: visibility === "ALL" ? undefined : visibility === "PUBLISHED", page, size: PAGE_SIZE })
      .then((data) => { if (active) { setResult(data); setLoading(false); } })
      .catch((cause: unknown) => { if (active) { setError(readAdminV2Error(cause, "앱 매장을 불러오지 못했습니다.")); setLoading(false); } });
    return () => { active = false; };
  }, [keyword, visibility, page, refresh]);

  const search = (event: FormEvent) => {
    event.preventDefault();
    setResult(null);
    setError("");
    setLoading(true);
    setPage(0);
    setKeyword(keywordInput.trim());
    setRefresh((current) => current + 1);
  };

  const filterVisibility = (value: VisibilityFilter) => {
    setVisibility(value);
    setPage(0);
    setResult(null);
    setError("");
    setLoading(true);
  };

  const toggleVisibility = async (shop: AdminV2ShopRow) => {
    setBusy(shop.id);
    setMessage("");
    setError("");
    try {
      await updateAdminV2ShopVisibility(shop.id, !shop.published);
      setMessage(`${shop.name} 매장을 ${shop.published ? "숨김" : "공개"} 처리했습니다.`);
      setRefresh((current) => current + 1);
    } catch (cause) {
      setError(readAdminV2Error(cause, "공개 상태를 변경하지 못했습니다."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-7">
        <div><h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">앱 매장</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">앱에 표시되는 매장과 공개 상태를 관리합니다. 웹 매장 데이터와 별도로 운영됩니다.</p></div>
        <Link href="/admin/app-shops/new" className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[#e60000] px-4 py-3 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e60000]"><Plus className="h-4 w-4" />새 앱 매장</Link>
      </header>
      {error && <div role="alert" className="whitespace-pre-line border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {message && <div role="status" className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      <form onSubmit={search} className="border border-stone-200 bg-white p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end">
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-600">매장 검색</span><span className="flex min-h-11 items-center gap-2 border border-stone-300 px-3 focus-within:border-[#e60000]"><Search className="h-4 w-4 text-stone-500" aria-hidden="true" /><input value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="매장명, 지점명, 주소" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-500" /></span></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-600">공개 상태</span><select value={visibility} onChange={(event) => filterVisibility(event.target.value as VisibilityFilter)} className="min-h-11 w-full border border-stone-300 bg-white px-3 text-sm font-bold outline-none focus:border-[#e60000]"><option value="ALL">전체</option><option value="PUBLISHED">공개</option><option value="HIDDEN">숨김</option></select></label>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#25282b] px-5 py-3 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25282b]"><Search className="h-4 w-4" />검색</button>
        </div>
      </form>
      <section className="border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-5 py-4 sm:px-6"><h2 className="text-lg font-black">매장 목록</h2><p className="mt-1 text-xs text-stone-500">{loading ? "목록을 불러오는 중…" : `총 ${(result?.page.totalElements ?? 0).toLocaleString("ko-KR")}개 · ${result ? result.page.number + 1 : 1} / ${Math.max(result?.page.totalPages ?? 1, 1)}페이지`}</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-stone-50 text-xs font-bold text-stone-600"><tr><th className="px-5 py-3 sm:px-6">매장</th><th className="px-4 py-3">지역</th><th className="px-4 py-3">영업 상태</th><th className="px-4 py-3">공개</th><th className="px-4 py-3">기록 / 북마크</th><th className="px-4 py-3">영업시간 확인</th><th className="px-5 py-3 text-right sm:px-6">관리</th></tr></thead><tbody className="divide-y divide-stone-100">
          {loading ? Array.from({ length: 5 }, (_, index) => <tr key={index} aria-hidden="true"><td colSpan={7} className="px-5 py-5"><div className="h-5 animate-pulse bg-stone-100" /></td></tr>) : result?.items.length ? result.items.map((shop) => <tr key={shop.id} className="hover:bg-stone-50"><td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-stone-100">{shop.thumbnailUrl ? <Image src={shop.thumbnailUrl} alt="" fill sizes="56px" unoptimized className="object-cover" /> : <span className="flex h-full items-center justify-center text-[11px] text-stone-500">사진 없음</span>}</div><div><Link href={`/admin/app-shops/${encodeURIComponent(shop.id)}`} className="font-bold hover:text-[#e60000] focus-visible:underline">{shop.name}{shop.branchName ? ` · ${shop.branchName}` : ""}</Link><p className="mt-1 text-xs text-stone-500">#{shop.id}</p></div></div></td><td className="px-4 py-4 text-stone-600">{shop.region || shop.address}</td><td className="whitespace-nowrap px-4 py-4">{businessStatusLabels[shop.businessStatus]}</td><td className="px-4 py-4"><span className={`inline-flex rounded-sm px-2 py-1 text-xs font-bold ${shop.published ? "bg-red-50 text-[#b00000]" : "bg-stone-100 text-stone-600"}`}>{shop.published ? "공개" : "숨김"}</span></td><td className="whitespace-nowrap px-4 py-4 tabular-nums">{shop.logCount.toLocaleString("ko-KR")} / {shop.bookmarkCount.toLocaleString("ko-KR")}</td><td className="whitespace-nowrap px-4 py-4 text-xs text-stone-600">{shop.hoursVerifiedAt ? new Date(shop.hoursVerifiedAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "확인 전"}</td><td className="px-5 py-4 text-right sm:px-6"><button type="button" disabled={busy !== null} onClick={() => void toggleVisibility(shop)} className="inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-stone-300 px-3 text-xs font-bold hover:border-[#e60000] hover:text-[#e60000] focus-visible:outline-2 focus-visible:outline-[#e60000] disabled:cursor-not-allowed disabled:opacity-40">{shop.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{busy === shop.id ? "처리 중…" : shop.published ? "숨김" : "공개"}</button></td></tr>) : <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-stone-600">조건에 맞는 앱 매장이 없습니다. 검색어나 공개 상태를 바꿔 보세요.</td></tr>}
        </tbody></table></div>
        {result && result.page.totalPages > 1 && <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4 sm:px-6"><button type="button" disabled={!result.page.hasPrevious || loading} onClick={() => { setLoading(true); setPage(result.page.number - 1); }} className="min-h-11 rounded-sm border border-stone-300 px-4 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">이전</button><span className="text-xs font-bold text-stone-600">{result.page.number + 1} / {result.page.totalPages}</span><button type="button" disabled={!result.page.hasNext || loading} onClick={() => { setLoading(true); setPage(result.page.number + 1); }} className="min-h-11 rounded-sm border border-stone-300 px-4 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">다음</button></div>}
      </section>
    </div>
  );
}
