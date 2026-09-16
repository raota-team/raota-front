"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Database,
  FileWarning,
  RefreshCw,
  Store,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getRagEvaluationRuns, type RunView } from "@/lib/api/rag-evaluations";
import {
  getAdminReports,
  getAdminShops,
  getAdminUsers,
  type AdminPage,
  type AdminShopReport,
  type AdminShopSummary,
  type AdminUserSummary,
} from "@/lib/api/admin";

type Snapshot = {
  shops: AdminShopSummary[] | null;
  users: AdminPage<AdminUserSummary> | null;
  reports: AdminPage<AdminShopReport> | null;
  latestRun: RunView | null;
  failedSources: string[];
};

const initialSnapshot: Snapshot = { shops: null, users: null, reports: null, latestRun: null, failedSources: [] };

export default function AdminHomePage() {
  const [snapshot, setSnapshot] = useState<Snapshot>(initialSnapshot);
  const [loading, setLoading] = useState(true);

  const loadSnapshot = async () => {
    setLoading(true);
    const [shops, users, reports, runs] = await Promise.allSettled([
      getAdminShops(),
      getAdminUsers({ page: 0, size: 1 }),
      getAdminReports({ page: 0, size: 1 }),
      getRagEvaluationRuns(),
    ]);
    const failedSources: string[] = [];
    const valueOrNull = <T,>(result: PromiseSettledResult<T>, label: string): T | null => {
      if (result.status === "fulfilled") return result.value;
      failedSources.push(label);
      return null;
    };
    const runPage = valueOrNull(runs, "RAG 평가");
    setSnapshot({
      shops: valueOrNull(shops, "매장") ?? null,
      users: valueOrNull(users, "회원") ?? null,
      reports: valueOrNull(reports, "제보") ?? null,
      latestRun: runPage?.items?.[0] ?? null,
      failedSources,
    });
    setLoading(false);
  };

  useEffect(() => {
    void loadSnapshot();
  }, []);

  const publishedCount = useMemo(() => snapshot.shops?.filter((shop) => shop.published).length ?? null, [snapshot.shops]);
  const latestMetrics = snapshot.latestRun ? [
    ["HitRate@1", formatPercent(readRunMetric(snapshot.latestRun, "hitrateAt1"))],
    ["Recall@6", formatPercent(readRunMetric(snapshot.latestRun, "recallAt6"))],
    ["NDCG@1", formatPercent(readRunMetric(snapshot.latestRun, "ndcgAt1"))],
  ] : [];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 border-b border-stone-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e60000]">Operations / overview</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">오늘의 운영 상태</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">매장과 회원 데이터를 확인하고, 검색 색인과 RAG 품질 검수를 한 곳에서 관리합니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/rag-evaluations" className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[#e60000] px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"><Activity className="h-4 w-4" />RAG 평가 열기</Link>
          <Link href="/admin/retrieval" className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition-colors hover:border-[#e60000] hover:text-[#e60000]"><Database className="h-4 w-4" />색인 작업</Link>
        </div>
      </section>

      {snapshot.failedSources.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
          <span>{snapshot.failedSources.join(", ")} 데이터를 불러오지 못했습니다. 표시된 숫자는 일부만 반영됐습니다.</span>
          <button type="button" onClick={() => void loadSnapshot()} className="inline-flex min-h-9 items-center gap-1 rounded-sm border border-amber-300 px-3 py-1.5 text-xs font-bold hover:bg-amber-100"><RefreshCw className="h-3.5 w-3.5" />새로고침</button>
        </div>
      )}

      <section aria-label="핵심 운영 지표" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="등록 매장" value={loading ? "…" : formatCount(snapshot.shops?.length)} hint={publishedCount === null ? "공개 상태 확인 중" : `공개 ${publishedCount}곳`} icon={<Store className="h-5 w-5" />} />
        <StatCard label="가입 회원" value={loading ? "…" : formatCount(snapshot.users?.page.totalElements)} hint="관리자 회원 목록 기준" icon={<Users className="h-5 w-5" />} />
        <StatCard label="접수 제보" value={loading ? "…" : formatCount(snapshot.reports?.page.totalElements)} hint="매장 정보 제보 전체" icon={<FileWarning className="h-5 w-5" />} />
        <StatCard label="최근 RAG 실행" value={loading ? "…" : snapshot.latestRun ? statusLabel(snapshot.latestRun.status) : "없음"} hint={snapshot.latestRun ? formatDate(snapshot.latestRun.createdAt) : "아직 실행한 평가가 없습니다."} icon={<Activity className="h-5 w-5" />} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="border border-stone-200 bg-white">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 px-5 py-5 sm:px-6">
            <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e60000]">Quality control</p><h2 className="mt-1 text-xl font-black tracking-[-0.03em]">RAG 품질 기준선</h2><p className="mt-1 text-sm text-stone-500">모바일 예상 결과와 서버 후보군 지표를 확인합니다.</p></div>
            <Link href="/admin/rag-evaluations" className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-[#e60000]">상세 보기<ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="px-5 py-5 sm:px-6">
            {snapshot.latestRun ? (
              <>
                <div className="flex flex-wrap items-center gap-3"><span className="text-sm font-bold">{snapshot.latestRun.runId.slice(0, 12)}</span><StatusBadge status={snapshot.latestRun.status} /><span className="text-xs text-stone-400">{snapshot.latestRun.datasetVersion} · {snapshot.latestRun.split === "DEV" ? "개발셋" : "보류셋"}</span></div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">{latestMetrics.map(([label, value]) => <div key={label} className="border-l-2 border-[#e60000] bg-stone-50 px-4 py-3"><p className="text-xs text-stone-500">{label}</p><p className="mt-1 text-2xl font-black tracking-[-0.04em]">{value}</p></div>)}</div>
                <p className="mt-4 text-xs leading-5 text-stone-500">검수 상태와 사례별 근거는 RAG 평가 화면에서 확인할 수 있습니다. 실제 앱 연결 전까지 1위는 모바일 예상 결과로 표시됩니다.</p>
              </>
            ) : <EmptyState text="완료된 RAG 평가 실행이 없습니다." href="/admin/rag-evaluations" action="평가 실행 준비" />}
          </div>
        </article>

        <article className="border border-stone-200 bg-[#25282b] text-white">
          <div className="border-b border-white/15 px-5 py-5 sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-300">Quick actions</p><h2 className="mt-1 text-xl font-black tracking-[-0.03em]">운영 바로가기</h2></div>
          <div className="divide-y divide-white/10">
            <QuickLink href="/admin/shops" title="매장 공개 상태 점검" description="비공개 매장을 확인하고 색인을 실행합니다." icon={<Store className="h-4 w-4" />} />
            <QuickLink href="/admin/users" title="회원·권한 조회" description="ADMIN 계정과 가입 상태를 확인합니다." icon={<Users className="h-4 w-4" />} />
            <QuickLink href="/admin/reports" title="새 제보 확인" description="매장 정보 변경 요청을 검토합니다." icon={<FileWarning className="h-4 w-4" />} />
            <QuickLink href="/admin/retrieval" title="Vector 색인 관리" description="전체 또는 특정 매장 문서를 갱신합니다." icon={<Database className="h-4 w-4" />} />
          </div>
        </article>
      </section>

      <p className="text-xs text-stone-400">관리자 API 응답을 기준으로 표시한 운영 요약입니다. 숫자가 비어 있으면 해당 API를 사용할 수 없는 상태입니다.</p>
    </div>
  );
}

function StatCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: React.ReactNode }) {
  return <article className="border border-stone-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold text-stone-500">{label}</p><span className="text-[#e60000]">{icon}</span></div><p className="mt-4 text-3xl font-black tracking-[-0.05em]">{value}</p><p className="mt-2 truncate text-xs text-stone-400">{hint}</p></article>;
}

function QuickLink({ href, title, description, icon }: { href: string; title: string; description: string; icon: React.ReactNode }) {
  return <Link href={href} className="group flex items-start gap-3 px-5 py-4 transition-colors hover:bg-white/5 sm:px-6"><span className="mt-0.5 text-red-300">{icon}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-sm font-bold">{title}<ArrowUpRight className="h-3.5 w-3.5 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span><span className="mt-1 block text-xs leading-5 text-white/55">{description}</span></span></Link>;
}

function EmptyState({ text, href, action }: { text: string; href: string; action: string }) {
  return <div className="border border-dashed border-stone-300 px-5 py-8 text-center"><p className="text-sm text-stone-500">{text}</p><Link href={href} className="mt-4 inline-flex min-h-10 items-center rounded-sm bg-[#e60000] px-4 py-2.5 text-xs font-bold text-white hover:opacity-90">{action}</Link></div>;
}

function StatusBadge({ status }: { status: string }) {
  const style = status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : status === "FAILED" ? "bg-rose-100 text-rose-700" : status === "REVIEW_REQUIRED" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600";
  return <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${style}`}>{statusLabel(status)}</span>;
}

function statusLabel(status: string) {
  return ({ COMPLETED: "완료", FAILED: "실패", REVIEW_REQUIRED: "검수 필요", RUNNING: "실행 중", QUEUED: "대기" } as Record<string, string>)[status] ?? status;
}

function readRunMetric(run: RunView, key: string): number | null {
  const aggregate = run.aggregateMetrics;
  if (!aggregate || typeof aggregate !== "object") return null;
  const metrics = (aggregate as Record<string, unknown>).metrics;
  if (!metrics || typeof metrics !== "object") return null;
  const value = (metrics as Record<string, unknown>)[key];
  return typeof value === "number" ? value : null;
}

function formatPercent(value: number | null) { return value === null ? "–" : `${Math.round(value * 100)}%`; }
function formatCount(value: number | null | undefined) { return value === null || value === undefined ? "–" : value.toLocaleString("ko-KR"); }
function formatDate(value: string | null) { return value ? new Date(value).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "시간 대기 중"; }
