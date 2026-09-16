"use client";

import Link from "next/link";
import { Database, Eye, EyeOff, ExternalLink, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  deleteAdminShop,
  getAdminShops,
  reindexShop,
  updateAdminShopVisibility,
  updateAdminShopVisibilityBulk,
  type AdminShopSummary,
} from "@/lib/api/admin";
import { ApiClientError } from "@/lib/api/client";

type VisibilityFilter = "ALL" | "PUBLISHED" | "HIDDEN";

export default function AdminShopsPage() {
  const [shops, setShops] = useState<AdminShopSummary[]>([]);
  const [keyword, setKeyword] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bulk, setBulk] = useState({ fromId: "", toId: "", published: true });

  const loadShops = async () => {
    setLoading(true);
    setError("");
    try {
      setShops(await getAdminShops());
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadShops();
  }, []);

  const filteredShops = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return shops.filter((shop) => {
      const matchesKeyword = !normalized || `${shop.id} ${shop.name} ${shop.address || ""}`.toLowerCase().includes(normalized);
      const matchesVisibility = visibility === "ALL" || (visibility === "PUBLISHED" ? shop.published : !shop.published);
      return matchesKeyword && matchesVisibility;
    });
  }, [keyword, shops, visibility]);

  const toggleVisibility = async (shop: AdminShopSummary) => {
    setBusy(`visibility-${shop.id}`);
    setMessage("");
    setError("");
    try {
      await updateAdminShopVisibility(shop.id, !shop.published);
      setShops((items) => items.map((item) => item.id === shop.id ? { ...item, published: !item.published } : item));
      setMessage(`${shop.name} 매장을 ${shop.published ? "숨김" : "공개"} 처리했습니다.`);
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setBusy(null);
    }
  };

  const runReindex = async (shop: AdminShopSummary) => {
    setBusy(`reindex-${shop.id}`);
    setMessage("");
    setError("");
    try {
      await reindexShop(shop.id);
      setMessage(`${shop.name}의 Vector 색인을 갱신했습니다.`);
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setBusy(null);
    }
  };

  const removeShop = async (shop: AdminShopSummary) => {
    if (!window.confirm(`${shop.name} 매장을 삭제할까요? 삭제 후 되돌리기 어렵습니다.`)) return;
    setBusy(`delete-${shop.id}`);
    setMessage("");
    setError("");
    try {
      await deleteAdminShop(shop.id);
      setShops((items) => items.filter((item) => item.id !== shop.id));
      setMessage(`${shop.name} 매장을 삭제했습니다.`);
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setBusy(null);
    }
  };

  const submitBulk = async (event: FormEvent) => {
    event.preventDefault();
    const fromId = Number(bulk.fromId);
    const toId = Number(bulk.toId);
    if (!Number.isInteger(fromId) || !Number.isInteger(toId) || fromId < 1 || toId < fromId) {
      setError("시작 ID와 종료 ID를 올바르게 입력해 주세요.");
      return;
    }
    setBusy("bulk");
    setMessage("");
    setError("");
    try {
      const result = await updateAdminShopVisibilityBulk(fromId, toId, bulk.published);
      setMessage(`${result.updatedCount}개 매장의 공개 상태를 변경했습니다.`);
      await loadShops();
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 border-b border-stone-200 pb-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e60000]">Operations / shops</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">매장 관리</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">공개 상태를 점검하고 매장별 Vector 문서를 다시 색인합니다. 상세 정보와 운영 상태를 함께 관리하세요.</p></div><div className="flex flex-wrap gap-2 self-start"><Link href="/admin/shops/new" className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[#e60000] px-4 py-3 text-sm font-bold text-white hover:opacity-90"><Plus className="h-4 w-4" />매장 추가</Link><Link href="/admin/retrieval" className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-700 hover:border-[#e60000] hover:text-[#e60000]"><Database className="h-4 w-4" />색인 센터</Link></div></header>
      {(message || error) && <div className={`border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`} role={error ? "alert" : "status"}>{error || message}</div>}
      <section className="border border-stone-200 bg-white p-4 sm:p-5"><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end"><label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-500">매장 검색</span><span className="flex min-h-11 items-center gap-2 border border-stone-300 px-3 focus-within:border-[#e60000]"><Search className="h-4 w-4 text-stone-400" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="매장명, 주소, ID" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400" /></span></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-500">공개 상태</span><select value={visibility} onChange={(event) => setVisibility(event.target.value as VisibilityFilter)} className="min-h-11 w-full border border-stone-300 bg-white px-3 text-sm font-bold text-stone-700 outline-none focus:border-[#e60000]"><option value="ALL">전체 ({shops.length})</option><option value="PUBLISHED">공개 ({shops.filter((shop) => shop.published).length})</option><option value="HIDDEN">비공개 ({shops.filter((shop) => !shop.published).length})</option></select></label><button type="button" onClick={() => void loadShops()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-stone-300 px-4 py-3 text-sm font-bold text-stone-700 hover:border-[#e60000] hover:text-[#e60000]"><RefreshCw className="h-4 w-4" />새로고침</button></div></section>
      <section className="border border-stone-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-black tracking-[-0.03em]">매장 목록</h2><p className="mt-1 text-xs text-stone-500">{loading ? "목록을 불러오는 중" : `${filteredShops.length.toLocaleString("ko-KR")}개 표시`}</p></div><span className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">{shops.length ? "admin api / ramen-shops" : "empty"}</span></div><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-stone-50 text-xs font-bold text-stone-500"><tr><th className="px-5 py-3 sm:px-6">매장</th><th className="px-4 py-3">주소</th><th className="px-4 py-3">공개 상태</th><th className="px-4 py-3">ID</th><th className="px-5 py-3 text-right sm:px-6">운영</th></tr></thead><tbody className="divide-y divide-stone-100">{loading ? <LoadingRows /> : filteredShops.length ? filteredShops.map((shop) => <ShopRow key={shop.id} shop={shop} busy={busy} onToggle={() => void toggleVisibility(shop)} onReindex={() => void runReindex(shop)} onDelete={() => void removeShop(shop)} />) : <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-stone-500">조건에 맞는 매장이 없습니다.</td></tr>}</tbody></table></div></section>
      <section className="border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="mt-0.5 text-[#e60000]"><Eye className="h-5 w-5" /></span><div><h2 className="text-lg font-black tracking-[-0.03em]">공개 상태 일괄 변경</h2><p className="mt-1 text-sm text-stone-500">ID 범위에 포함된 매장의 published 값을 한 번에 바꿉니다. 실행 전 범위를 확인하세요.</p></div></div><form onSubmit={submitBulk} className="mt-5 grid gap-3 sm:grid-cols-[8rem_8rem_10rem_auto] sm:items-end"><label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-500">시작 ID</span><input inputMode="numeric" value={bulk.fromId} onChange={(event) => setBulk({ ...bulk, fromId: event.target.value })} className="min-h-11 w-full border border-stone-300 px-3 text-sm outline-none focus:border-[#e60000]" placeholder="1" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-500">종료 ID</span><input inputMode="numeric" value={bulk.toId} onChange={(event) => setBulk({ ...bulk, toId: event.target.value })} className="min-h-11 w-full border border-stone-300 px-3 text-sm outline-none focus:border-[#e60000]" placeholder="100" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-500">변경 상태</span><select value={String(bulk.published)} onChange={(event) => setBulk({ ...bulk, published: event.target.value === "true" })} className="min-h-11 w-full border border-stone-300 bg-white px-3 text-sm font-bold text-stone-700 outline-none focus:border-[#e60000]"><option value="true">공개</option><option value="false">비공개</option></select></label><button type="submit" disabled={busy === "bulk"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#25282b] px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">{busy === "bulk" ? "변경 중…" : "일괄 변경"}</button></form></section>
    </div>
  );
}

function ShopRow({ shop, busy, onToggle, onReindex, onDelete }: { shop: AdminShopSummary; busy: string | null; onToggle: () => void; onReindex: () => void; onDelete: () => void }) {
  return <tr className="transition-colors hover:bg-stone-50"><td className="px-5 py-4 sm:px-6"><Link href={`/admin/shops/${shop.id}`} className="group inline-flex items-center gap-1 font-bold hover:text-[#e60000]">{shop.name || "이름 없음"}<ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" /></Link><p className="mt-1 text-xs text-stone-500">매장 #{shop.id}</p></td><td className="max-w-[20rem] px-4 py-4"><p className="truncate text-stone-600">{shop.address || "주소 정보 없음"}</p></td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-black ${shop.published ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}><span className={`h-1.5 w-1.5 rounded-full ${shop.published ? "bg-emerald-500" : "bg-stone-400"}`} />{shop.published ? "공개" : "비공개"}</span></td><td className="px-4 py-4 text-xs font-bold text-stone-400">#{shop.id}</td><td className="px-5 py-4 sm:px-6"><div className="flex justify-end gap-2"><Link href={`/admin/shops/${shop.id}`} className="inline-flex min-h-9 items-center gap-1 rounded-sm border border-stone-300 px-2.5 text-xs font-bold text-stone-700 hover:border-[#e60000] hover:text-[#e60000]">상세</Link><button type="button" disabled={busy !== null} onClick={onToggle} className="inline-flex min-h-9 items-center gap-1 rounded-sm border border-stone-300 px-2.5 text-xs font-bold text-stone-700 hover:border-[#e60000] hover:text-[#e60000] disabled:cursor-not-allowed disabled:opacity-40">{shop.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{busy === `visibility-${shop.id}` ? "처리 중" : shop.published ? "숨김" : "공개"}</button><button type="button" disabled={busy !== null} onClick={onReindex} className="inline-flex min-h-9 items-center gap-1 rounded-sm border border-stone-300 px-2.5 text-xs font-bold text-stone-700 hover:border-[#e60000] hover:text-[#e60000] disabled:cursor-not-allowed disabled:opacity-40"><RefreshCw className={`h-3.5 w-3.5 ${busy === `reindex-${shop.id}` ? "animate-spin" : ""}`} />색인</button><button type="button" disabled={busy !== null} onClick={onDelete} className="inline-flex min-h-9 items-center justify-center rounded-sm border border-stone-300 px-2.5 text-xs font-bold text-stone-500 hover:border-rose-500 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40" aria-label={`${shop.name} 삭제`}><Trash2 className="h-3.5 w-3.5" /></button></div></td></tr>;
}

function LoadingRows() { return <>{Array.from({ length: 6 }).map((_, index) => <tr key={index} aria-hidden="true"><td colSpan={5} className="px-5 py-5 sm:px-6"><div className="h-4 animate-pulse bg-stone-100" /></td></tr>)}</>; }
function readError(cause: unknown) { if (cause instanceof ApiClientError) { if (cause.status === 401) return "로그인이 필요합니다."; if (cause.status === 403) return "관리자 권한이 필요합니다."; } return cause instanceof Error ? cause.message : "매장 요청을 처리하지 못했습니다."; }
