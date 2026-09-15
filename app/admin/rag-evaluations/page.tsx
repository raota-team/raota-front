"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CaseView,
  DatasetView,
  EvaluationSplit,
  EvaluationType,
  RunView,
  finalizeRagEvaluation,
  getRagEvaluationCases,
  getRagEvaluationDataset,
  getRagEvaluationRun,
  getRagEvaluationRuns,
  reviewRagEvaluationCase,
  startRagEvaluation,
} from "@/lib/api/rag-evaluations";
import { ApiClientError } from "@/lib/api/client";

const typeLabels: Record<EvaluationType, string> = { SEARCH: "매장 검색", SUMMARY: "리뷰 요약", CHAT: "추가 질문", COMPARE: "매장 비교" };

const metric = (run: RunView | null, key: string) => {
  const value = run?.aggregateMetrics?.metrics;
  if (!value || typeof value !== "object") return "–";
  const numberValue = (value as Record<string, unknown>)[key];
  return typeof numberValue === "number" ? `${Math.round(numberValue * 100)}%` : "–";
};

const prettyJson = (value: unknown) => JSON.stringify(value ?? {}, null, 2);

export default function RagEvaluationsPage() {
  const [dataset, setDataset] = useState<DatasetView | null>(null);
  const [runs, setRuns] = useState<RunView[]>([]);
  const [selectedRun, setSelectedRun] = useState<RunView | null>(null);
  const [cases, setCases] = useState<CaseView[]>([]);
  const [split, setSplit] = useState<EvaluationSplit>("DEV");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [review, setReview] = useState({ finalScore: 2, approved: true, opinion: "" });
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRuns = useCallback(async () => {
    const result = await getRagEvaluationRuns();
    setRuns(result.items);
  }, []);

  const loadRun = useCallback(async (runId: string) => {
    const [run, casePage] = await Promise.all([getRagEvaluationRun(runId), getRagEvaluationCases(runId)]);
    setSelectedRun(run);
    setCases(casePage.items);
    setSelectedCaseId((current) => current ?? casePage.items[0]?.caseId ?? null);
    return run;
  }, []);

  useEffect(() => {
    Promise.all([getRagEvaluationDataset(), loadRuns()])
      .then(([datasetResult]) => setDataset(datasetResult))
      .catch((cause) => setError(readError(cause)))
      .finally(() => setLoading(false));
  }, [loadRuns]);

  useEffect(() => {
    if (!selectedRun || !["QUEUED", "RUNNING"].includes(selectedRun.status)) return;
    const timer = window.setInterval(() => loadRun(selectedRun.runId).catch((cause) => setError(readError(cause))), 2000);
    return () => window.clearInterval(timer);
  }, [loadRun, selectedRun]);

  const selectedCase = useMemo(() => cases.find((item) => item.caseId === selectedCaseId) ?? null, [cases, selectedCaseId]);

  const runEvaluation = async () => {
    if (!dataset) return;
    setError("");
    setMessage("");
    setRunning(true);
    try {
      const result = await startRagEvaluation(split, dataset.version, crypto.randomUUID());
      await loadRuns();
      await loadRun(result.runId);
      setMessage(result.idempotentReplay ? "기존 실행을 다시 열었습니다." : "평가 실행을 시작했습니다.");
    } catch (cause) {
      setError(readError(cause));
    } finally {
      setRunning(false);
    }
  };

  const saveReview = async () => {
    if (!selectedRun || !selectedCase || selectedCase.caseType === "SEARCH") return;
    try {
      const updated = await reviewRagEvaluationCase(selectedRun.runId, selectedCase.caseId, { ...review, verdict: review.approved ? "PASS" : "REVIEW" });
      setCases((items) => items.map((item) => (item.caseId === updated.caseId ? updated : item)));
      setMessage(`${selectedCase.caseId} 검수를 저장했습니다.`);
    } catch (cause) {
      setError(readError(cause));
    }
  };

  const finalize = async () => {
    if (!selectedRun) return;
    try {
      const run = await finalizeRagEvaluation(selectedRun.runId);
      setSelectedRun(run);
      await loadRuns();
      setMessage("검수 완료 실행을 기준선으로 확정했습니다.");
    } catch (cause) {
      setError(readError(cause));
    }
  };

  if (loading) return <main className="mx-auto max-w-7xl p-8">불러오는 중…</main>;

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 bg-slate-50 p-6 text-slate-900 md:p-10">
      <header className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-7 text-white md:flex-row md:items-end md:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">RAG quality lab</p><h1 className="mt-2 text-3xl font-bold">모바일 RAG 평가·검수</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">실제 앱 표시 결과가 연결되기 전까지 서버 1위를 <strong>모바일 예상 결과</strong>로 표시합니다.</p></div>
        <div className="flex items-center gap-3"><select value={split} onChange={(event) => setSplit(event.target.value as EvaluationSplit)} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm"><option value="DEV">개발셋</option><option value="HOLDOUT">보류셋</option></select><button onClick={runEvaluation} disabled={running || !dataset} className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">{running ? "시작 중…" : "평가 실행"}</button></div>
      </header>
      {(message || error) && <div className={`rounded-2xl px-4 py-3 text-sm ${error ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>{error || message}</div>}
      <section className="grid gap-6 lg:grid-cols-[19rem_1fr]">
        <aside className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between"><h2 className="font-bold">실행 이력</h2><span className="text-xs text-slate-500">{dataset?.version}</span></div><div className="space-y-2">{runs.length === 0 && <p className="text-sm text-slate-500">아직 실행한 평가가 없습니다.</p>}{runs.map((run) => <button key={run.runId} onClick={() => loadRun(run.runId).catch((cause) => setError(readError(cause)))} className={`w-full rounded-2xl border p-3 text-left ${selectedRun?.runId === run.runId ? "border-cyan-400 bg-cyan-50" : "border-slate-200 hover:bg-slate-50"}`}><div className="flex justify-between text-sm font-semibold"><span>{run.split === "DEV" ? "개발셋" : "보류셋"}</span><StatusBadge status={run.status} /></div><p className="mt-1 truncate text-xs text-slate-500">{run.runId}</p><p className="mt-2 text-xs text-slate-400">{formatDate(run.createdAt)}</p></button>)}</div></aside>
        <div className="space-y-6">{selectedRun ? <><section className="grid gap-3 sm:grid-cols-4"><MetricCard label="모바일 예상 HitRate@1" value={metric(selectedRun, "hitrateAt1")} /><MetricCard label="모바일 예상 NDCG@1" value={metric(selectedRun, "ndcgAt1")} /><MetricCard label="서버 진단 Recall@6" value={metric(selectedRun, "recallAt6")} /><MetricCard label="서버 진단 MRR@6" value={metric(selectedRun, "mrrAt6")} /></section><section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-3"><h2 className="text-xl font-bold">실행 상세</h2><StatusBadge status={selectedRun.status} /></div><p className="mt-1 text-sm text-slate-500">평가셋 {selectedRun.datasetVersion} · {selectedRun.split === "DEV" ? "개발셋" : "보류셋"}</p></div><button onClick={finalize} disabled={selectedRun.status !== "REVIEW_REQUIRED"} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">기준선 확정</button></div>{selectedRun.fatalError && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{selectedRun.fatalError}</p>}<div className="mt-5 grid gap-3 text-sm sm:grid-cols-3"><Info label="서버 커밋" value={selectedRun.serverCommit || "unknown"} /><Info label="앱 계약" value={selectedRun.appContractVersion || "unknown"} /><Info label="Vector 인덱스" value={selectedRun.vectorIndexVersion || "unknown"} /></div></section><section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]"><div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="font-bold">사례 목록 <span className="font-normal text-slate-400">({cases.length})</span></h2><div className="mt-4 space-y-2">{cases.map((item) => <button key={item.caseId} onClick={() => setSelectedCaseId(item.caseId)} className={`w-full rounded-2xl border p-3 text-left ${selectedCaseId === item.caseId ? "border-cyan-400 bg-cyan-50" : "border-slate-200"}`}><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{item.caseId}</span><span className="text-xs text-slate-500">{typeLabels[item.caseType]}</span></div><div className="mt-2 flex justify-between text-xs text-slate-500"><span>{item.caseType === "SEARCH" ? "모바일 예상 1위 · 서버 후보 6곳" : "생성 답변 검수"}</span><span>{item.status}</span></div></button>)}</div></div>{selectedCase ? <CasePanel item={selectedCase} review={review} onReviewChange={setReview} onSave={saveReview} /> : <div className="rounded-3xl bg-white p-8 text-sm text-slate-500">사례를 선택하세요.</div>}</section></> : <div className="rounded-3xl bg-white p-10 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">왼쪽에서 실행을 선택하거나 평가를 새로 실행하세요.</div>}</div>
      </section>
    </main>
  );
}

function CasePanel({ item, review, onReviewChange, onSave }: { item: CaseView; review: { finalScore: number; approved: boolean; opinion: string }; onReviewChange: (value: { finalScore: number; approved: boolean; opinion: string }) => void; onSave: () => void }) {
  const generated = item.caseType !== "SEARCH";
  return <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">{typeLabels[item.caseType]}</p><h2 className="mt-1 text-xl font-bold">{item.caseId}</h2></div>{item.latencyMs !== null && <span className="text-xs text-slate-400">{item.latencyMs}ms</span>}</div><div className="grid gap-4 md:grid-cols-2"><JsonBlock title="요청" value={item.request} /><JsonBlock title="정답 라벨" value={item.expected} /></div><div className="grid gap-4 md:grid-cols-2"><JsonBlock title={generated ? "생성 답변" : "서버 후보 · 모바일 예상 결과 1위"} value={item.response} /><JsonBlock title="검색 근거" value={item.evidence} /></div><div className="grid gap-4 md:grid-cols-2"><JsonBlock title="자동 지표" value={item.metrics} /><JsonBlock title="자동 판정 제안" value={item.autoJudgement} /></div>{item.errorMessage && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{item.errorMessage}</p>}{generated && <div className="rounded-2xl bg-slate-50 p-4"><div className="flex flex-wrap items-center gap-3"><label className="text-sm font-semibold">최종 점수 <select value={review.finalScore} onChange={(event) => onReviewChange({ ...review, finalScore: Number(event.target.value) })} className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1"><option value={0}>0 · 부적합</option><option value={1}>1 · 부분 근거</option><option value={2}>2 · 충분한 근거</option></select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={review.approved} onChange={(event) => onReviewChange({ ...review, approved: event.target.checked })} /> 승인</label></div><textarea value={review.opinion} onChange={(event) => onReviewChange({ ...review, opinion: event.target.value })} placeholder="검수 의견을 남겨주세요" className="mt-3 min-h-20 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm" /><button onClick={onSave} className="mt-3 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">검수 저장</button></div>}</div>;
}

function JsonBlock({ title, value }: { title: string; value: unknown }) { return <div><h3 className="mb-2 text-xs font-semibold text-slate-500">{title}</h3><pre className="max-h-52 overflow-auto rounded-xl bg-slate-950 p-3 text-xs leading-relaxed text-slate-200">{prettyJson(value)}</pre></div>; }
function MetricCard({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 truncate font-medium">{value}</p></div>; }
function StatusBadge({ status }: { status: string }) { const color = status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : status === "FAILED" ? "bg-rose-100 text-rose-700" : status === "REVIEW_REQUIRED" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"; return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${color}`}>{status}</span>; }
function formatDate(value: string | null) { return value ? new Date(value).toLocaleString("ko-KR") : "시간 대기 중"; }
function readError(cause: unknown) { if (cause instanceof ApiClientError) { if (cause.status === 401) return "로그인이 필요합니다."; if (cause.status === 403) return "관리자 권한이 필요합니다."; } return cause instanceof Error ? cause.message : "요청 처리 중 오류가 발생했습니다."; }
