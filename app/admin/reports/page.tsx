"use client";

import { Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { getAdminReports, type AdminPage, type AdminShopReport, type ReportType } from "@/lib/api/admin";

const PAGE_SIZE = 30;
const reportTypes: Array<["" | ReportType, string]> = [["", "전체 유형"], ["OPENING_HOURS_ERROR", "영업시간 오류"], ["CLOSED", "폐업·휴업"], ["MENU_INFO_ERROR", "메뉴 정보 오류"], ["EVENT", "이벤트"], ["OTHERS", "기타"]];

export default function AdminReportsPage() {
  const [keyword, setKeyword] = useState("");
  const [reportType, setReportType] = useState<"" | ReportType>("");
  const [result, setResult] = useState<AdminPage<AdminShopReport> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      setResult(await getAdminReports({ keyword: keyword.trim() || undefined, reportType: reportType || undefined, page: targetPage, size: PAGE_SIZE }));
      setPage(targetPage);
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports(0);
    // 최초 진입 시에만 조회하고 필터 변경은 검색 버튼으로 확정한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    void loadReports(0);
  };

  return (
    <div className="space-y-7">
      <header className="border-b border-stone-200 pb-7"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e60000]">Operations / reports</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">제보·신고</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">사용자가 보낸 매장 정보 변경 제보를 최신순으로 확인합니다. 현재 백엔드는 조회와 상세 확인을 제공합니다.</p></header>
      <form onSubmit={submitSearch} className="border border-stone-200 bg-white p-4 sm:p-5"><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem_auto] md:items-end"><label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-500">매장·제보자 검색</span><span className="flex min-h-11 items-center gap-2 border border-stone-300 px-3 focus-within:border-[#e60000]"><Search className="h-4 w-4 shrink-0 text-stone-400" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="매장명, 닉네임, 내용" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400" /></span></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-500">제보 유형</span><select value={reportType} onChange={(event) => setReportType(event.target.value as "" | ReportType)} className="min-h-11 w-full border border-stone-300 bg-white px-3 text-sm font-bold text-stone-700 outline-none focus:border-[#e60000]">{reportTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#25282b] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"><Search className="h-4 w-4" />조회</button></div></form>
      {error && <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</div>}
      <section className="border border-stone-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-black tracking-[-0.03em]">접수 목록</h2><p className="mt-1 text-xs text-stone-500">{result ? `총 ${result.page.totalElements.toLocaleString("ko-KR")}건 · ${result.page.number + 1} / ${Math.max(result.page.totalPages, 1)}페이지` : "조회 중"}</p></div><span className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">read only</span></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-stone-50 text-xs font-bold text-stone-500"><tr><th className="px-5 py-3 sm:px-6">매장</th><th className="px-4 py-3">유형</th><th className="px-4 py-3">제보자</th><th className="px-4 py-3">내용</th><th className="px-4 py-3">접수일</th><th className="px-5 py-3 text-right sm:px-6">ID</th></tr></thead><tbody className="divide-y divide-stone-100">{loading ? <LoadingRows /> : result?.items.length ? result.items.map((report) => <ReportRow key={report.id} report={report} />) : <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-stone-500">접수된 제보가 없습니다.</td></tr>}</tbody></table></div><Pagination page={result?.page} onChange={(nextPage) => void loadReports(nextPage)} /></section>
    </div>
  );
}

function ReportRow({ report }: { report: AdminShopReport }) {
  return <tr className="align-top transition-colors hover:bg-stone-50"><td className="px-5 py-4 sm:px-6"><p className="font-bold">{report.shopName || "매장명 없음"}</p><p className="mt-1 text-xs text-stone-500">#{report.shopId}{report.branchName ? ` · ${report.branchName}` : ""}</p></td><td className="px-4 py-4"><span className="inline-flex rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-[#e60000]">{report.reportTypeDescription || report.reportType}</span></td><td className="px-4 py-4"><p className="font-semibold">{report.memberNickname || "이름 없음"}</p><p className="mt-1 max-w-40 truncate text-xs text-stone-500">{report.memberEmail || `회원 #${report.memberId}`}</p></td><td className="max-w-[24rem] px-4 py-4"><p className="line-clamp-2 leading-6 text-stone-600">{report.content || "내용 없음"}</p></td><td className="whitespace-nowrap px-4 py-4 text-xs text-stone-500">{formatDate(report.reportedAt)}</td><td className="px-5 py-4 text-right text-xs font-bold text-stone-400 sm:px-6">#{report.id}</td></tr>;
}

function Pagination({ page, onChange }: { page?: AdminPage<unknown>["page"]; onChange: (page: number) => void }) { if (!page || page.totalPages <= 1) return null; return <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4 sm:px-6"><button type="button" disabled={!page.hasPrevious} onClick={() => onChange(page.number - 1)} className="min-h-10 rounded-sm border border-stone-300 px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">이전</button><span className="text-xs font-bold text-stone-500">{page.number + 1} / {page.totalPages}</span><button type="button" disabled={!page.hasNext} onClick={() => onChange(page.number + 1)} className="min-h-10 rounded-sm border border-stone-300 px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">다음</button></div>; }
function LoadingRows() { return <>{Array.from({ length: 5 }).map((_, index) => <tr key={index} aria-hidden="true"><td colSpan={6} className="px-5 py-5 sm:px-6"><div className="h-4 animate-pulse bg-stone-100" /></td></tr>)}</>; }
function formatDate(value: string | null) { return value ? new Date(value).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "–"; }
function readError(cause: unknown) { if (cause instanceof ApiClientError) { if (cause.status === 401) return "로그인이 필요합니다."; if (cause.status === 403) return "관리자 권한이 필요합니다."; } return cause instanceof Error ? cause.message : "제보 목록을 불러오지 못했습니다."; }
