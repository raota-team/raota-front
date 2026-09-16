"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { checkAdminAccess } from "@/lib/api/admin";
import { useApp } from "@/app/context/AppContext";
import AdminShell from "./AdminShell";

type GuardState = "checking" | "allowed" | "unauthenticated" | "forbidden" | "error";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const { isAuthChecking } = useApp();
  const [state, setState] = useState<GuardState>("checking");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isAuthChecking) return;
    let mounted = true;
    setState("checking");
    checkAdminAccess()
      .then(() => {
        if (mounted) setState("allowed");
      })
      .catch((cause: unknown) => {
        if (!mounted) return;
        if (cause instanceof ApiClientError && cause.status === 401) {
          setState("unauthenticated");
          return;
        }
        if (cause instanceof ApiClientError && cause.status === 403) {
          setState("forbidden");
          return;
        }
        setErrorMessage(cause instanceof Error ? cause.message : "관리자 권한을 확인하지 못했습니다.");
        setState("error");
      });
    return () => {
      mounted = false;
    };
  }, [isAuthChecking]);

  if (state === "checking") return <AccessState icon={<ShieldCheck className="h-6 w-6" />} title="관리자 권한 확인 중" description="보안 연결을 확인하고 있습니다." />;
  if (state === "unauthenticated") {
    return <AccessState icon={<LockKeyhole className="h-6 w-6" />} title="관리자 로그인이 필요합니다" description="관리자 계정으로 로그인한 뒤 이 페이지에 접근할 수 있습니다.">
      <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`} className="inline-flex min-h-11 items-center justify-center rounded-sm bg-[#e60000] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">관리자 로그인</Link>
      <Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-stone-300 px-5 py-3 text-sm font-bold text-stone-700 transition-colors hover:border-[#e60000] hover:text-[#e60000]"><ArrowLeft className="h-4 w-4" />서비스 홈</Link>
    </AccessState>;
  }
  if (state === "forbidden") {
    return <AccessState icon={<LockKeyhole className="h-6 w-6" />} title="관리자 권한이 없습니다" description="로그인한 계정에 운영자 권한이 없어 관리자 화면을 열 수 없습니다.">
      <Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#25282b] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"><ArrowLeft className="h-4 w-4" />서비스 홈으로</Link>
    </AccessState>;
  }
  if (state === "error") {
    return <AccessState icon={<AlertTriangle className="h-6 w-6" />} title="권한 확인에 실패했습니다" description={errorMessage || "잠시 후 다시 시도해 주세요."}>
      <button type="button" onClick={() => window.location.reload()} className="inline-flex min-h-11 items-center justify-center rounded-sm bg-[#e60000] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">다시 시도</button>
    </AccessState>;
  }

  return <AdminShell>{children}</AdminShell>;
}

function AccessState({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children?: React.ReactNode }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#f7f5f2] px-5 py-12 text-[#25282b]">
      <section className="w-full max-w-lg border border-stone-200 bg-white p-7 sm:p-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-red-50 text-[#e60000]">{icon}</div>
        <p className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-[#e60000]">RAOTA / ADMIN</p>
        <h1 className="mt-2 text-2xl font-black tracking-[-0.03em]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">{description}</p>
        {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
      </section>
    </main>
  );
}
