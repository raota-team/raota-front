"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Database,
  FileWarning,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";

export const adminNavItems = [
  { href: "/admin", label: "개요", description: "오늘의 운영 상태", icon: LayoutDashboard },
  { href: "/admin/shops", label: "매장 관리", description: "공개 상태와 색인", icon: Store },
  { href: "/admin/users", label: "회원 관리", description: "회원·권한 조회", icon: Users },
  { href: "/admin/reports", label: "제보·신고", description: "매장 정보 제보", icon: FileWarning },
  { href: "/admin/retrieval", label: "검색 색인", description: "Vector 문서 운영", icon: Database },
  { href: "/admin/rag-evaluations", label: "RAG 평가", description: "모바일 품질 검수", icon: Activity },
];

const isNavActive = (pathname: string, href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const { currentUser, handleLogout } = useApp();
  const nickname = currentUser?.nickname || "관리자";

  return (
    <div className="min-h-[100dvh] bg-[#f7f5f2] text-[#25282b]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-stone-200 bg-white lg:flex">
        <div className="flex h-20 items-center border-b border-stone-200 px-7">
          <Link href="/admin" className="flex items-center gap-3" aria-label="RAOTA 관리자 홈">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#e60000] text-sm font-black text-white">R</span>
            <span className="text-lg font-black tracking-[-0.04em]">RAOTA<span className="text-[#e60000]">.</span></span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Operations</p>
          <nav aria-label="관리자 메뉴" className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-sm border px-3 py-3 transition-colors ${
                    active ? "border-[#e60000] bg-red-50 text-[#e60000]" : "border-transparent text-stone-600 hover:border-stone-200 hover:bg-stone-50 hover:text-[#e60000]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{item.label}</span>
                    <span className={`mt-0.5 block text-[11px] ${active ? "text-red-700/70" : "text-stone-400"}`}>{item.description}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-stone-200 p-4">
          <div className="mb-3 flex items-center gap-2 px-2 text-xs text-stone-500">
            <ShieldCheck className="h-4 w-4 text-[#e60000]" aria-hidden="true" />
            <span>ADMIN 권한으로 접속 중</span>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-bold text-stone-700 transition-colors hover:border-[#e60000] hover:text-[#e60000]"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            로그아웃
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <Menu className="h-4 w-4 text-[#e60000] lg:hidden" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">RAOTA / ADMIN</p>
                <p className="truncate text-sm font-bold text-[#25282b]">운영 콘솔</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <label className="sr-only" htmlFor="admin-mobile-nav">관리자 메뉴 이동</label>
              <select
                id="admin-mobile-nav"
                value={adminNavItems.find((item) => isNavActive(pathname, item.href))?.href ?? "/admin"}
                onChange={(event) => router.push(event.target.value)}
                className="max-w-32 rounded-sm border border-stone-300 bg-white px-2 py-2 text-xs font-bold text-stone-700 lg:hidden"
              >
                {adminNavItems.map((item) => <option key={item.href} value={item.href}>{item.label}</option>)}
              </select>
              <Link href="/" className="hidden items-center gap-1 text-xs font-bold text-stone-500 transition-colors hover:text-[#e60000] sm:flex">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                서비스 보기
              </Link>
              <div className="flex items-center gap-2 border-l border-stone-200 pl-3 sm:pl-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25282b] text-xs font-black text-white" aria-hidden="true">
                  {nickname.slice(0, 1).toUpperCase()}
                </span>
                <div className="hidden min-w-0 sm:block">
                  <p className="max-w-32 truncate text-xs font-bold text-[#25282b]">{nickname}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e60000]">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100dvh-4rem)] max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
