"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock, Search } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { type AdminPage } from "@/lib/api/admin";
import { getAdminV2RamenLogs, readAdminV2Error, type AdminV2RamenLogQuery, type AdminV2RamenLogRow, type AdminV2RamenLogState, type AdminV2RamenLogVisibility } from "@/lib/api/admin-v2";
import { authorLabel, formatDateTime, shopLabel, stateLabels, visibilityBadgeClass, visibilityLabels } from "./ramen-log-labels";

const PAGE_SIZE = 20;
const PAGE_WINDOW = 10;
type VisibilityFilter = "ALL" | AdminV2RamenLogVisibility;
type TextFilters = { keyword: string; userId: string; shopId: string };
const emptyFilters: TextFilters = { keyword: "", userId: "", shopId: "" };
const inputClass = "min-h-11 w-full border border-stone-300 bg-white px-3 text-sm outline-none placeholder:text-stone-500 focus:border-[#e60000]";

export default function AdminAppRamenLogsPage() {
  const [draft, setDraft] = useState<TextFilters>(emptyFilters);
  const [filters, setFilters] = useState<TextFilters>(emptyFilters);
  const [visibility, setVisibility] = useState<VisibilityFilter>("ALL");
  const [state, setState] = useState<AdminV2RamenLogState>("LIVE");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<AdminPage<AdminV2RamenLogRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const query: AdminV2RamenLogQuery = {
      visibility: visibility === "ALL" ? undefined : visibility,
      state,
      keyword: filters.keyword || undefined,
      userId: filters.userId || undefined,
      shopId: filters.shopId || undefined,
      page,
      size: PAGE_SIZE,
    };
    getAdminV2RamenLogs(query)
      .then((data) => { if (active) { setResult(data); setLoading(false); } })
      .catch((cause: unknown) => { if (active) { setError(readAdminV2Error(cause, "앱 라멘로그를 불러오지 못했습니다.")); setLoading(false); } });
    return () => { active = false; };
  }, [filters, visibility, state, page]);

  const reload = () => {
    setResult(null);
    setError("");
    setLoading(true);
    setPage(0);
  };

  const search = (event: FormEvent) => {
    event.preventDefault();
    const next = { keyword: draft.keyword.trim(), userId: draft.userId.trim(), shopId: draft.shopId.trim() };
    // 서버는 ID를 숫자로 받으므로 잘못된 값은 요청 전에 막는다.
    if ((next.userId && !/^\d+$/.test(next.userId)) || (next.shopId && !/^\d+$/.test(next.shopId))) {
      setError("작성자 ID와 매장 ID는 숫자만 입력해 주세요.");
      return;
    }
    reload();
    setFilters(next);
  };

  const resetFilters = () => {
    reload();
    setDraft(emptyFilters);
    // 새 객체로 바꿔야 이미 초기값일 때도 다시 불러온다.
    setFilters({ ...emptyFilters });
    setVisibility("ALL");
    setState("LIVE");
  };

  const goToPage = (next: number) => {
    setLoading(true);
    setPage(next);
  };

  return (
    <div className="space-y-7">
      <header className="border-b border-stone-200 pb-7"><h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">앱 라멘로그</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">앱 사용자가 남긴 라멘 기록을 비공개·삭제된 기록까지 포함해 조회합니다. 상세 화면에서 운영자 삭제를 할 수 있습니다.</p></header>
      {error && <div role="alert" className="whitespace-pre-line border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <form onSubmit={search} className="border border-stone-200 bg-white p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[10rem_10rem_minmax(0,1fr)_9rem_9rem_auto] xl:items-end">
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-600">공개 범위</span><select value={visibility} onChange={(event) => { reload(); setVisibility(event.target.value as VisibilityFilter); }} className={`${inputClass} font-bold`}><option value="ALL">전체</option><option value="PUBLIC">{visibilityLabels.PUBLIC}</option><option value="PRIVATE">{visibilityLabels.PRIVATE}</option></select></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-600">상태</span><select value={state} onChange={(event) => { reload(); setState(event.target.value as AdminV2RamenLogState); }} className={`${inputClass} font-bold`}>{(["LIVE", "DELETED", "ALL"] as const).map((item) => <option key={item} value={item}>{stateLabels[item]}</option>)}</select></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-600">키워드</span><span className="flex min-h-11 items-center gap-2 border border-stone-300 px-3 focus-within:border-[#e60000]"><Search className="h-4 w-4 text-stone-500" aria-hidden="true" /><input value={draft.keyword} maxLength={100} onChange={(event) => setDraft({ ...draft, keyword: event.target.value })} placeholder="메뉴명, 메모" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-500" /></span></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-600">작성자 ID</span><input value={draft.userId} inputMode="numeric" onChange={(event) => setDraft({ ...draft, userId: event.target.value })} placeholder="예: 12" className={inputClass} /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-600">매장 ID</span><input value={draft.shopId} inputMode="numeric" onChange={(event) => setDraft({ ...draft, shopId: event.target.value })} placeholder="예: 34" className={inputClass} /></label>
          <div className="flex gap-2"><button type="submit" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-[#25282b] px-5 py-3 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25282b]"><Search className="h-4 w-4" />검색</button><button type="button" onClick={resetFilters} className="min-h-11 rounded-sm border border-stone-300 bg-white px-4 text-sm font-bold text-stone-700 hover:border-[#e60000] hover:text-[#e60000]">초기화</button></div>
        </div>
      </form>
      <section className="border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-5 py-4 sm:px-6"><h2 className="text-lg font-black">기록 목록</h2><p className="mt-1 text-xs text-stone-600">{loading ? "목록을 불러오는 중…" : `총 ${(result?.page.totalElements ?? 0).toLocaleString("ko-KR")}건 · ${result ? result.page.number + 1 : 1} / ${Math.max(result?.page.totalPages ?? 1, 1)}페이지`}</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1150px] text-left text-sm"><thead className="bg-stone-50 text-xs font-bold text-stone-600"><tr><th className="px-5 py-3 sm:px-6">메뉴 · 매장</th><th className="px-4 py-3">작성자</th><th className="px-4 py-3">공개 범위</th><th className="px-4 py-3">방문일</th><th className="px-4 py-3">공감 / 댓글</th><th className="px-4 py-3">열린 신고</th><th className="px-4 py-3">작성일</th><th className="px-5 py-3 sm:px-6">상태</th></tr></thead><tbody className="divide-y divide-stone-100">
          {loading ? Array.from({ length: 5 }, (_, index) => <tr key={index} aria-hidden="true"><td colSpan={8} className="px-5 py-5"><div className="h-5 animate-pulse bg-stone-100" /></td></tr>) : result?.items.length ? result.items.map((log) => <LogRow key={log.id} log={log} />) : <tr><td colSpan={8} className="px-5 py-14 text-center text-sm text-stone-600">조건에 맞는 라멘로그가 없습니다. 필터를 바꿔 보세요.</td></tr>}
        </tbody></table></div>
        {result && result.page.totalPages > 1 && <PageNumbers page={result.page} disabled={loading} onChange={goToPage} />}
      </section>
    </div>
  );
}

function LogRow({ log }: { log: AdminV2RamenLogRow }) {
  const href = `/admin/app-ramen-logs/${encodeURIComponent(log.id)}`;
  return <tr className={`hover:bg-stone-50 ${log.deletedAt ? "text-stone-500" : ""}`}>
    <td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-stone-100">{log.thumbnailUrl ? <Image src={log.thumbnailUrl} alt="" fill sizes="56px" unoptimized className="object-cover" /> : <span className="flex h-full items-center justify-center text-[11px] text-stone-500">사진 없음</span>}</div><div className="min-w-0"><Link href={href} className="font-bold hover:text-[#e60000] focus-visible:underline">{log.menuName}</Link><p className="mt-1 truncate text-xs text-stone-600">{shopLabel(log.shop)} · {log.ramenType}</p><p className="mt-0.5 text-xs text-stone-500">기록 #{log.id}{log.imageCount > 1 ? ` · 사진 ${log.imageCount}장` : ""}</p></div></div></td>
    <td className="px-4 py-4"><p className="font-bold">{authorLabel(log.author)}</p><p className="mt-1 text-xs text-stone-500">#{log.author.id}</p></td>
    <td className="px-4 py-4"><span className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-bold ${visibilityBadgeClass[log.visibility]}`}>{log.visibility === "PRIVATE" && <Lock className="h-3.5 w-3.5" aria-hidden="true" />}{visibilityLabels[log.visibility]}</span></td>
    <td className="whitespace-nowrap px-4 py-4 tabular-nums">{log.visitedAt}</td>
    <td className="whitespace-nowrap px-4 py-4 tabular-nums">{log.likeCount.toLocaleString("ko-KR")} / {log.commentCount.toLocaleString("ko-KR")}</td>
    <td className="whitespace-nowrap px-4 py-4 tabular-nums">{log.openReportCount > 0 ? <strong className="text-[#b00000]">{log.openReportCount}건</strong> : <span className="text-stone-500">0</span>}</td>
    <td className="whitespace-nowrap px-4 py-4 text-xs text-stone-600">{formatDateTime(log.createdAt)}</td>
    <td className="whitespace-nowrap px-5 py-4 sm:px-6">{log.deletedAt ? <span className="inline-flex rounded-sm bg-stone-200 px-2 py-1 text-xs font-bold text-stone-700" title={formatDateTime(log.deletedAt)}>삭제됨</span> : <span className="inline-flex rounded-sm bg-red-50 px-2 py-1 text-xs font-bold text-[#b00000]">게시 중</span>}</td>
  </tr>;
}

function PageNumbers({ page, disabled, onChange }: { page: AdminPage<unknown>["page"]; disabled: boolean; onChange: (page: number) => void }) {
  const start = Math.floor(page.number / PAGE_WINDOW) * PAGE_WINDOW;
  const numbers = Array.from({ length: Math.min(PAGE_WINDOW, page.totalPages - start) }, (_, index) => start + index);
  const buttonClass = "min-h-11 min-w-11 rounded-sm border px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40";
  return <nav aria-label="페이지" className="flex flex-wrap items-center justify-center gap-1 border-t border-stone-200 px-5 py-4 sm:px-6">
    <button type="button" disabled={!page.hasPrevious || disabled} onClick={() => onChange(page.number - 1)} className={`${buttonClass} border-stone-300 bg-white`}>이전</button>
    {numbers.map((number) => <button key={number} type="button" disabled={disabled} aria-current={number === page.number ? "page" : undefined} aria-label={`${number + 1} 페이지로 이동`} onClick={() => number !== page.number && onChange(number)} className={`${buttonClass} tabular-nums ${number === page.number ? "border-[#e60000] bg-[#e60000] text-white" : "border-stone-300 bg-white text-stone-700 hover:border-[#e60000]"}`}>{number + 1}</button>)}
    <button type="button" disabled={!page.hasNext || disabled} onClick={() => onChange(page.number + 1)} className={`${buttonClass} border-stone-300 bg-white`}>다음</button>
  </nav>;
}
