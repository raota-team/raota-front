"use client";

import { Search, UserRound, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  getAdminUser,
  getAdminUsers,
  type AdminPage,
  type AdminUserDetail,
  type AdminUserSummary,
} from "@/lib/api/admin";
import { ApiClientError } from "@/lib/api/client";

const PAGE_SIZE = 30;

export default function AdminUsersPage() {
  const [keyword, setKeyword] = useState("");
  const [registrationCompleted, setRegistrationCompleted] = useState("");
  const [deleted, setDeleted] = useState("");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<AdminPage<AdminUserSummary> | null>(null);
  const [selected, setSelected] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminUsers({
        keyword: keyword.trim() || undefined,
        registrationCompleted: registrationCompleted === "" ? undefined : registrationCompleted === "true",
        deleted: deleted === "" ? undefined : deleted === "true",
        page: targetPage,
        size: PAGE_SIZE,
      });
      setResult(response);
      setPage(targetPage);
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers(0);
    // 최초 진입 시에만 조회하고 필터 변경은 검색 버튼으로 확정한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    void loadUsers(0);
  };

  const openDetail = async (memberId: number) => {
    setDetailLoading(true);
    setError("");
    try {
      setSelected(await getAdminUser(memberId));
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageIntro eyebrow="Operations / members" title="회원 관리" description="가입 상태와 관리자 권한을 확인하고 회원 상세 활동을 조회합니다." />
      <form onSubmit={submitSearch} className="border border-stone-200 bg-white p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_11rem_auto] md:items-end">
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-500">닉네임·이메일 검색</span><span className="flex min-h-11 items-center gap-2 border border-stone-300 px-3 focus-within:border-[#e60000]"><Search className="h-4 w-4 shrink-0 text-stone-400" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="검색어를 입력하세요" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400" /></span></label>
          <FilterSelect label="가입 완료" value={registrationCompleted} onChange={setRegistrationCompleted} options={[["", "전체"], ["true", "완료"], ["false", "미완료"]]} />
          <FilterSelect label="탈퇴 상태" value={deleted} onChange={setDeleted} options={[["", "전체"], ["false", "활성 회원"], ["true", "탈퇴 회원"]]} />
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#25282b] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"><Search className="h-4 w-4" />조회</button>
        </div>
      </form>

      {error && <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</div>}

      <section className="border border-stone-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-black tracking-[-0.03em]">회원 목록</h2><p className="mt-1 text-xs text-stone-500">{result ? `총 ${result.page.totalElements.toLocaleString("ko-KR")}명 · ${result.page.number + 1} / ${Math.max(result.page.totalPages, 1)}페이지` : "조회 중"}</p></div><span className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">server source of truth</span></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-stone-50 text-xs font-bold text-stone-500"><tr><th className="px-5 py-3 sm:px-6">회원</th><th className="px-4 py-3">권한</th><th className="px-4 py-3">소셜 계정</th><th className="px-4 py-3">가입일</th><th className="px-4 py-3">상태</th><th className="px-5 py-3 text-right sm:px-6">상세</th></tr></thead><tbody className="divide-y divide-stone-100">{loading ? <LoadingRows /> : result?.items.length ? result.items.map((user) => <UserRow key={user.id} user={user} onOpen={() => void openDetail(user.id)} />) : <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-stone-500">조건에 맞는 회원이 없습니다.</td></tr>}</tbody></table>
        </div>
        <Pagination page={result?.page} onChange={(nextPage) => void loadUsers(nextPage)} />
      </section>

      {selected && <UserDetailDrawer user={selected} onClose={() => setSelected(null)} />}
      {detailLoading && <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/20" role="status"><div className="border border-stone-200 bg-white px-5 py-4 text-sm font-bold">회원 정보를 불러오는 중…</div></div>}
    </div>
  );
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="border-b border-stone-200 pb-7"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e60000]">{eyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">{description}</p></header>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-500">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full border border-stone-300 bg-white px-3 text-sm font-bold text-stone-700 outline-none focus:border-[#e60000]">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>;
}

function UserRow({ user, onOpen }: { user: AdminUserSummary; onOpen: () => void }) {
  return <tr className="transition-colors hover:bg-stone-50"><td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-black text-stone-500"><UserRound className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate font-bold">{user.nickname || "이름 없음"}</span><span className="mt-0.5 block max-w-56 truncate text-xs text-stone-500">{user.email || "이메일 없음"} · #{user.id}</span></span></div></td><td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${user.role === "ADMIN" ? "bg-red-50 text-[#e60000]" : "bg-stone-100 text-stone-600"}`}>{user.role}</span></td><td className="px-4 py-4 text-xs text-stone-600">{user.providers || "–"}</td><td className="whitespace-nowrap px-4 py-4 text-xs text-stone-500">{formatDate(user.createdAt)}</td><td className="px-4 py-4"><span className={`text-xs font-bold ${user.deleted ? "text-rose-600" : user.registrationCompleted ? "text-emerald-600" : "text-amber-600"}`}>{user.deleted ? "탈퇴" : user.registrationCompleted ? "활성" : "가입 진행 중"}</span></td><td className="px-5 py-4 text-right sm:px-6"><button type="button" onClick={onOpen} className="rounded-sm border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700 hover:border-[#e60000] hover:text-[#e60000]">상세 보기</button></td></tr>;
}

function UserDetailDrawer({ user, onClose }: { user: AdminUserDetail; onClose: () => void }) {
  const profile = user.profile;
  const summaryItems: Array<[string, string]> = [["회원 ID", `#${profile.memberId}`], ["권한", profile.role], ["이메일", profile.email || "없음"], ["상태", profile.deleted ? "탈퇴" : profile.registrationCompleted ? "활성" : "가입 진행 중"]];
  const activityItems: Array<[string, number]> = [["방문", user.activityStats.visitedRestaurantCount], ["사진", user.activityStats.photoCount], ["북마크", user.activityStats.bookmarkCount], ["게시글", user.activityStats.postCount], ["댓글", user.activityStats.commentCount]];
  const visibilityItems: Array<[string, boolean]> = [["라멘로그", user.activityVisibility.logsPublic], ["방문 기록", user.activityVisibility.visitsPublic], ["게시글", user.activityVisibility.postsPublic], ["댓글", user.activityVisibility.commentsPublic]];
  return <div className="fixed inset-0 z-40 flex justify-end bg-stone-950/25" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><aside className="h-full w-full max-w-xl overflow-y-auto border-l border-stone-200 bg-white" role="dialog" aria-modal="true" aria-label="회원 상세 정보"><div className="sticky top-0 flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4 sm:px-7"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e60000]">Member detail</p><h2 className="mt-1 text-lg font-black">{profile.nickname || "이름 없음"}</h2></div><button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-sm border border-stone-300 text-stone-500 hover:border-[#e60000] hover:text-[#e60000]" aria-label="회원 상세 닫기"><X className="h-5 w-5" /></button></div><div className="space-y-6 px-5 py-6 sm:px-7"><section className="grid grid-cols-2 gap-3">{summaryItems.map(([label, value]) => <div key={label} className="bg-stone-50 p-3"><p className="text-[11px] text-stone-500">{label}</p><p className="mt-1 break-words text-sm font-bold">{value}</p></div>)}</section><DetailSection title="활동 요약"><div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{activityItems.map(([label, value]) => <div key={label} className="border border-stone-200 bg-stone-50 px-3 py-2"><p className="text-xs text-stone-500">{label}</p><p className="mt-1 text-lg font-black">{value.toLocaleString("ko-KR")}</p></div>)}</div></DetailSection><DetailSection title="연결된 소셜 계정">{user.socialAccounts.length ? <div className="divide-y divide-stone-100 border border-stone-200">{user.socialAccounts.map((account) => <div key={`${account.provider}-${account.providerUserId}`} className="flex items-center justify-between gap-3 px-3 py-3 text-sm"><span className="font-bold">{account.provider}</span><span className="truncate text-xs text-stone-500">{account.email || account.providerUserId || "식별자 없음"}</span></div>)}</div> : <p className="text-sm text-stone-500">연결된 소셜 계정이 없습니다.</p>}</DetailSection><DetailSection title="활동 공개 설정"><div className="grid grid-cols-2 gap-2 text-sm">{visibilityItems.map(([label, value]) => <div key={label} className="flex items-center justify-between border border-stone-200 px-3 py-2"><span>{label}</span><span className={value ? "font-bold text-emerald-600" : "font-bold text-stone-400"}>{value ? "공개" : "비공개"}</span></div>)}</div></DetailSection></div></aside></div>;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) { return <section><h3 className="mb-3 text-sm font-black">{title}</h3>{children}</section>; }
function Pagination({ page, onChange }: { page?: AdminPage<unknown>["page"]; onChange: (page: number) => void }) { if (!page || page.totalPages <= 1) return null; return <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4 sm:px-6"><button type="button" disabled={!page.hasPrevious} onClick={() => onChange(page.number - 1)} className="min-h-10 rounded-sm border border-stone-300 px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">이전</button><span className="text-xs font-bold text-stone-500">{page.number + 1} / {page.totalPages}</span><button type="button" disabled={!page.hasNext} onClick={() => onChange(page.number + 1)} className="min-h-10 rounded-sm border border-stone-300 px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">다음</button></div>; }
function LoadingRows() { return <>{Array.from({ length: 5 }).map((_, index) => <tr key={index} aria-hidden="true"><td colSpan={6} className="px-5 py-5 sm:px-6"><div className="h-4 animate-pulse bg-stone-100" /></td></tr>)}</>; }
function formatDate(value: string | null) { return value ? new Date(value).toLocaleDateString("ko-KR") : "–"; }
function readError(cause: unknown) { if (cause instanceof ApiClientError) { if (cause.status === 401) return "로그인이 필요합니다."; if (cause.status === 403) return "관리자 권한이 필요합니다."; } return cause instanceof Error ? cause.message : "회원 정보를 불러오지 못했습니다."; }
