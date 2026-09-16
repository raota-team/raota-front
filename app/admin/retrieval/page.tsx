"use client";

import { Database, FileText, RefreshCw, Search, UploadCloud } from "lucide-react";
import { FormEvent, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { getShopReviewDocuments, reindexAllShops, reindexCatchtableReviews, type RetrievalDocument } from "@/lib/api/admin";

export default function AdminRetrievalPage() {
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [externalPath, setExternalPath] = useState("");
  const [shopId, setShopId] = useState("");
  const [query, setQuery] = useState("라멘 리뷰 맛 국물 면 메뉴 분위기");
  const [documents, setDocuments] = useState<RetrievalDocument[] | null>(null);

  const runAllReindex = async () => {
    setBusy("all"); setMessage(""); setError("");
    try { await reindexAllShops(); setMessage("전체 매장 프로필 색인을 갱신했습니다."); }
    catch (cause) { setError(readError(cause)); }
    finally { setBusy(""); }
  };

  const runExternalReindex = async (event: FormEvent) => {
    event.preventDefault();
    if (!externalPath.trim()) { setError("외부 리뷰 파일 경로를 입력해 주세요."); return; }
    setBusy("external"); setMessage(""); setError("");
    try { const result = await reindexCatchtableReviews(externalPath.trim()); setMessage(`${result.indexedCount}건을 색인하고 ${result.skippedCount}건을 건너뛰었습니다.`); }
    catch (cause) { setError(readError(cause)); }
    finally { setBusy(""); }
  };

  const searchDocuments = async (event: FormEvent) => {
    event.preventDefault();
    const parsedShopId = Number(shopId);
    if (!Number.isInteger(parsedShopId) || parsedShopId < 1) { setError("매장 ID를 숫자로 입력해 주세요."); return; }
    setBusy("search"); setMessage(""); setError(""); setDocuments(null);
    try { setDocuments(await getShopReviewDocuments(parsedShopId, query.trim() || "라멘 리뷰")); }
    catch (cause) { setError(readError(cause)); }
    finally { setBusy(""); }
  };

  return (
    <div className="space-y-7">
      <header className="border-b border-stone-200 pb-7"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e60000]">Operations / retrieval</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">검색 색인 센터</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">매장 프로필과 외부 리뷰 문서를 Vector 저장소에 반영하고, 특정 매장의 검색 근거를 점검합니다.</p></header>
      {(message || error) && <div className={`border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`} role={error ? "alert" : "status"}>{error || message}</div>}
      <section className="grid gap-5 lg:grid-cols-2">
        <article className="border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="text-[#e60000]"><Database className="h-5 w-5" /></span><div><h2 className="text-lg font-black tracking-[-0.03em]">매장 프로필 전체 색인</h2><p className="mt-1 text-sm leading-5 text-stone-500">현재 매장 데이터를 Vector 문서로 다시 만들고 기존 색인을 갱신합니다.</p></div></div><button type="button" onClick={() => void runAllReindex()} disabled={busy !== ""} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#25282b] px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${busy === "all" ? "animate-spin" : ""}`} />{busy === "all" ? "전체 색인 중…" : "전체 매장 색인 실행"}</button></article>
        <article className="border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="text-[#e60000]"><UploadCloud className="h-5 w-5" /></span><div><h2 className="text-lg font-black tracking-[-0.03em]">캐치테이블 외부 리뷰 색인</h2><p className="mt-1 text-sm leading-5 text-stone-500">서버가 접근할 수 있는 JSON 파일 경로를 입력해 외부 리뷰를 반영합니다.</p></div></div><form onSubmit={runExternalReindex} className="mt-5"><label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-500">파일 경로</span><input value={externalPath} onChange={(event) => setExternalPath(event.target.value)} placeholder="/data/catchtable/reviews.json" className="min-h-11 w-full border border-stone-300 px-3 text-sm outline-none focus:border-[#e60000]" /></label><button type="submit" disabled={busy !== ""} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-[#e60000] px-4 py-3 text-sm font-bold text-[#e60000] transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">{busy === "external" ? "외부 리뷰 색인 중…" : "외부 리뷰 색인 실행"}</button></form></article>
      </section>
      <section className="border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="text-[#e60000]"><FileText className="h-5 w-5" /></span><div><h2 className="text-lg font-black tracking-[-0.03em]">검색 근거 미리보기</h2><p className="mt-1 text-sm leading-5 text-stone-500">특정 매장 리뷰 문서가 질의에 어떤 순서와 점수로 검색되는지 확인합니다.</p></div></div><form onSubmit={searchDocuments} className="mt-5 grid gap-3 md:grid-cols-[8rem_minmax(0,1fr)_auto] md:items-end"><label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-500">매장 ID</span><input inputMode="numeric" value={shopId} onChange={(event) => setShopId(event.target.value)} placeholder="예: 42" className="min-h-11 w-full border border-stone-300 px-3 text-sm outline-none focus:border-[#e60000]" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-500">검색어</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-11 w-full border border-stone-300 px-3 text-sm outline-none focus:border-[#e60000]" /></label><button type="submit" disabled={busy !== ""} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#e60000] px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><Search className="h-4 w-4" />{busy === "search" ? "검색 중…" : "근거 조회"}</button></form>{documents && <div className="mt-6 space-y-3">{documents.length ? documents.map((document, index) => <article key={`${document.metadata.id || index}-${index}`} className="border border-stone-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-black text-[#e60000]">#{index + 1} · score {document.score.toFixed(4)}</span><span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">retrieval document</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-700">{document.text || "문서 본문 없음"}</p>{Object.keys(document.metadata || {}).length > 0 && <pre className="mt-3 overflow-x-auto bg-stone-50 p-3 text-[11px] leading-5 text-stone-500">{JSON.stringify(document.metadata, null, 2)}</pre>}</article>) : <p className="border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">검색된 문서가 없습니다.</p>}</div>}</section>
    </div>
  );
}

function readError(cause: unknown) { if (cause instanceof ApiClientError) { if (cause.status === 401) return "로그인이 필요합니다."; if (cause.status === 403) return "관리자 권한이 필요합니다."; } return cause instanceof Error ? cause.message : "색인 요청을 처리하지 못했습니다."; }
