"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Ban, Lock, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { type AdminPage } from "@/lib/api/admin";
import { getAdminV2Reports, readAdminV2Error, resolveAdminV2Report, type AdminV2Report, type AdminV2ReportReason, type AdminV2ReportStatus } from "@/lib/api/admin-v2";

const PAGE_SIZE = 20;
const statusLabels: Record<AdminV2ReportStatus, string> = { OPEN: "미처리", RESOLVED: "처리 완료", DISMISSED: "기각" };
const reasonLabels: Record<AdminV2ReportReason, string> = { SPAM: "스팸·광고", ABUSE: "욕설·괴롭힘", SEXUAL: "성적 콘텐츠", PRIVACY: "개인정보 침해", OTHER: "기타" };
const statuses: AdminV2ReportStatus[] = ["OPEN", "RESOLVED", "DISMISSED"];

export default function AdminAppReportsPage() {
  const [status, setStatus] = useState<AdminV2ReportStatus>("OPEN");
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<AdminPage<AdminV2Report> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getAdminV2Reports({ status, page, size: PAGE_SIZE })
      .then((data) => { if (active) { setResult(data); setLoading(false); } })
      .catch((cause: unknown) => { if (active) { setError(readAdminV2Error(cause, "앱 신고 목록을 불러오지 못했습니다.")); setLoading(false); } });
    return () => { active = false; };
  }, [status, page, refresh]);

  const selectStatus = (next: AdminV2ReportStatus) => {
    if (next === status) return;
    setStatus(next);
    setPage(0);
    setResult(null);
    setLoading(true);
    setError("");
    setMessage("");
  };

  const resolveReport = async (report: AdminV2Report, action: "DELETE_CONTENT" | "DISMISS") => {
    if (action === "DELETE_CONTENT" && !window.confirm(`이 ${report.target.type === "RAMEN_LOG" ? "기록" : "댓글"}을 삭제하고 같은 대상의 열린 신고를 모두 처리할까요?`)) return;
    setBusyId(report.id);
    setError("");
    setMessage("");
    try {
      const response = await resolveAdminV2Report(report.id, action);
      setMessage(`${action === "DELETE_CONTENT" ? "콘텐츠 삭제" : "기각"} 완료 · 같은 대상의 열린 신고 ${response.closedReportCount}건을 처리했습니다.`);
      setPage(0);
      setLoading(true);
      setRefresh((current) => current + 1);
    } catch (cause) { setError(readAdminV2Error(cause, "신고를 처리하지 못했습니다.")); }
    finally { setBusyId(null); }
  };

  return <div className="space-y-7">
    <header className="border-b border-stone-200 pb-7"><h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">앱 신고</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">앱 기록과 댓글 신고를 확인하고 처리합니다. 같은 대상에 열린 신고는 함께 닫힙니다.</p></header>
    <nav aria-label="신고 처리 상태" className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">{statuses.map((item) => <button key={item} type="button" aria-current={status === item ? "page" : undefined} onClick={() => selectStatus(item)} className={`min-h-11 rounded-sm border px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e60000] ${status === item ? "border-[#e60000] bg-[#e60000] text-white" : "border-stone-300 bg-white text-stone-700 hover:border-[#e60000]"}`}>{statusLabels[item]}</button>)}</nav>
    {error && <div role="alert" className="whitespace-pre-line border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    {message && <div role="status" className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
    <section className="border border-stone-200 bg-white"><div className="border-b border-stone-200 px-5 py-4 sm:px-6"><h2 className="text-lg font-black">{statusLabels[status]} 신고</h2><p className="mt-1 text-xs text-stone-600">{loading ? "신고를 불러오는 중…" : `총 ${(result?.page.totalElements ?? 0).toLocaleString("ko-KR")}건 · ${result ? result.page.number + 1 : 1} / ${Math.max(result?.page.totalPages ?? 1, 1)}페이지`}</p></div>
      {loading ? <div className="space-y-4 p-5 sm:p-6">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-36 animate-pulse bg-stone-100" aria-hidden="true" />)}</div> : result?.items.length ? <div className="divide-y divide-stone-200">{result.items.map((report) => <ReportCard key={report.id} report={report} busy={busyId !== null} onResolve={(action) => void resolveReport(report, action)} />)}</div> : <div className="px-5 py-14 text-center text-sm text-stone-600">{status === "OPEN" ? "미처리 신고가 없습니다." : `${statusLabels[status]} 신고가 없습니다.`}</div>}
      {result && result.page.totalPages > 1 && <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4 sm:px-6"><button type="button" disabled={!result.page.hasPrevious || loading} onClick={() => { setLoading(true); setPage(result.page.number - 1); }} className="min-h-11 rounded-sm border border-stone-300 px-4 text-xs font-bold disabled:opacity-40">이전</button><span className="text-xs font-bold text-stone-600">{result.page.number + 1} / {result.page.totalPages}</span><button type="button" disabled={!result.page.hasNext || loading} onClick={() => { setLoading(true); setPage(result.page.number + 1); }} className="min-h-11 rounded-sm border border-stone-300 px-4 text-xs font-bold disabled:opacity-40">다음</button></div>}
    </section>
  </div>;
}

function ReportCard({ report, busy, onResolve }: { report: AdminV2Report; busy: boolean; onResolve: (action: "DELETE_CONTENT" | "DISMISS") => void }) {
  const overdue = report.status === "OPEN" && Date.now() - Date.parse(report.createdAt) > 24 * 60 * 60 * 1000;
  // 삭제되지 않았는데 가려진 기록 대상은 지금 비공개라는 뜻이고, 서버가 삭제를 거절하므로 기각만 남긴다.
  const lockedLog = report.target.type === "RAMEN_LOG" && report.target.hidden && !report.target.deleted;
  return <article className={`p-5 sm:p-6 ${overdue ? "bg-red-50/60" : ""}`}>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-sm bg-stone-100 px-2 py-1 text-xs font-bold text-stone-700">{reasonLabels[report.reason]}</span><span className="text-xs font-bold text-stone-600">신고 #{report.id}</span>{overdue && <span className="inline-flex items-center gap-1 rounded-sm border border-red-200 bg-white px-2 py-1 text-xs font-bold text-[#b00000]"><AlertTriangle className="h-3.5 w-3.5" />24시간 초과</span>}</div><p className="mt-3 text-sm text-stone-700">신고자 <strong>{report.reporter.nickname || `회원 #${report.reporter.id}`}</strong> · {new Date(report.createdAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })}</p></div><div className="text-right text-xs text-stone-600">{report.status === "OPEN" ? <p>같은 대상의 열린 신고 <strong className="text-[#b00000]">{report.openReportCount}건</strong></p> : <p>{statusLabels[report.status]} · {report.resolvedAt ? new Date(report.resolvedAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "처리 시각 없음"}</p>}</div></div>
    <div className="mt-4 border border-stone-200 bg-stone-50 p-4"><div className="flex flex-wrap items-center gap-2 text-xs font-bold text-stone-600"><span>{report.target.type === "RAMEN_LOG" ? "기록" : "댓글"} #{report.target.id}</span>{report.target.type === "RAMEN_LOG_COMMENT" && report.target.ramenLogId && <span>원 기록 #{report.target.ramenLogId}</span>}{report.target.deleted && <span className="rounded-sm bg-stone-200 px-2 py-1 text-stone-700">이미 삭제됨</span>}{report.target.ramenLogId && !report.target.hidden && <Link href={`/admin/app-ramen-logs/${encodeURIComponent(report.target.ramenLogId)}`} className="text-[#b00000] underline-offset-2 hover:underline focus-visible:underline">기록 상세 보기</Link>}</div><p className="mt-2 text-sm text-stone-700">작성자 <strong>{authorLabel(report.target.author)}</strong>{report.target.menuName && <span> · 메뉴 {report.target.menuName}</span>}</p>{report.target.hidden
      ? <p className="mt-3 inline-flex items-center gap-2 text-sm text-stone-600"><Lock className="h-4 w-4 shrink-0" aria-hidden="true" />비공개로 바뀌었거나 삭제된 대상이라 내용을 볼 수 없어요.</p>
      : <div className="mt-3 flex items-start gap-4">{report.target.imageUrl && <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-stone-200"><Image src={report.target.imageUrl} alt="신고 대상 기록의 첫 사진" fill sizes="96px" unoptimized className="object-cover" /></div>}<p className="min-w-0 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">{report.target.text || "본문 없음"}</p></div>}</div>
    {report.status === "OPEN" && <div className="mt-4 flex flex-wrap items-center justify-end gap-2">{lockedLog && <p className="mr-auto text-xs text-stone-600">비공개 기록은 삭제할 수 없어요. 기각만 할 수 있어요.</p>}<button type="button" disabled={busy} onClick={() => onResolve("DISMISS")} className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-stone-300 bg-white px-4 text-sm font-bold hover:border-[#e60000] hover:text-[#e60000] disabled:cursor-not-allowed disabled:opacity-40"><Ban className="h-4 w-4" />기각</button><button type="button" disabled={busy || lockedLog} onClick={() => onResolve("DELETE_CONTENT")} className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[#e60000] px-4 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="h-4 w-4" />콘텐츠 삭제</button></div>}
  </article>;
}

// 대상 행이 이미 없어진 신고는 서버가 작성자를 null로 보낸다.
function authorLabel(author: AdminV2Report["target"]["author"]) {
  if (!author) return "알 수 없음";
  return author.nickname || `회원 #${author.id}`;
}
