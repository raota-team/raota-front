"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Play, RotateCw } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
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

const typeLabels: Record<EvaluationType, string> = {
  SEARCH: "매장 검색",
  SUMMARY: "리뷰 요약",
  CHAT: "추가 질문",
  COMPARE: "매장 비교",
};

const statusLabels: Record<string, string> = {
  QUEUED: "대기",
  RUNNING: "실행 중",
  REVIEW_REQUIRED: "검수 필요",
  COMPLETED: "완료",
  FAILED: "실패",
  PENDING: "대기",
  ERROR: "오류",
  SKIPPED: "건너뜀",
};

const metric = (run: RunView | null, key: string) => {
  const numberValue = metricNumber(run, key);
  return numberValue === null ? "–" : `${Math.round(numberValue * 100)}%`;
};

const metricNumber = (run: RunView | null, key: string): number | null => {
  const value = run?.aggregateMetrics?.metrics;
  if (!value || typeof value !== "object") return null;
  const numberValue = (value as Record<string, unknown>)[key];
  return typeof numberValue === "number" ? numberValue : null;
};

const metricDelta = (current: RunView, previous: RunView, key: string) => {
  const currentValue = metricNumber(current, key);
  const previousValue = metricNumber(previous, key);
  if (currentValue === null || previousValue === null) return "–";
  const delta = Math.round((currentValue - previousValue) * 100);
  return `${delta > 0 ? "+" : ""}${delta}%p`;
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
    setRuns((items) => items.map((item) => item.runId === run.runId ? run : item));
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
    const timer = window.setInterval(() => {
      loadRun(selectedRun.runId).catch((cause) => setError(readError(cause)));
    }, 2000);
    return () => window.clearInterval(timer);
  }, [loadRun, selectedRun]);

  const selectedCase = useMemo(() => cases.find((item) => item.caseId === selectedCaseId) ?? null, [cases, selectedCaseId]);
  const previousComparableRun = useMemo(() => {
    if (!selectedRun) return null;
    return runs.find((run) => run.runId !== selectedRun.runId
      && run.datasetVersion === selectedRun.datasetVersion
      && run.split === selectedRun.split) ?? null;
  }, [runs, selectedRun]);
  const hasIncompatiblePreviousRun = useMemo(() => {
    if (!selectedRun) return false;
    return runs.some((run) => run.runId !== selectedRun.runId
      && (run.datasetVersion !== selectedRun.datasetVersion || run.split !== selectedRun.split));
  }, [runs, selectedRun]);
  const caseSummary = useMemo(() => ({
    completed: cases.filter((item) => item.status === "COMPLETED").length,
    errors: cases.filter((item) => item.status === "ERROR").length,
    skipped: cases.filter((item) => item.status === "SKIPPED").length,
  }), [cases]);

  useEffect(() => {
    const saved = selectedCase?.finalReview;
    if (saved && typeof saved === "object") {
      const values = saved as Record<string, unknown>;
      setReview({
        finalScore: typeof values.finalScore === "number" ? values.finalScore : 2,
        approved: values.approved !== false,
        opinion: typeof values.opinion === "string" ? values.opinion : "",
      });
      return;
    }
    setReview({ finalScore: 2, approved: true, opinion: "" });
  }, [selectedCase]);

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
    setError("");
    try {
      const updated = await reviewRagEvaluationCase(selectedRun.runId, selectedCase.caseId, {
        ...review,
        verdict: review.approved ? "PASS" : "REVIEW",
      });
      setCases((items) => items.map((item) => (item.caseId === updated.caseId ? updated : item)));
      setMessage(`${selectedCase.caseId} 검수를 저장했습니다.`);
    } catch (cause) {
      setError(readError(cause));
    }
  };

  const finalize = async () => {
    if (!selectedRun) return;
    setError("");
    try {
      const run = await finalizeRagEvaluation(selectedRun.runId);
      setSelectedRun(run);
      await loadRuns();
      setMessage("검수 완료 실행을 기준선으로 확정했습니다.");
    } catch (cause) {
      setError(readError(cause));
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 border-b border-stone-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">
            <span className="text-[#e60000]">Operations</span>
            <span aria-hidden="true">/</span>
            <span>quality lab</span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">모바일 RAG 평가·검수</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
            실제 앱 표시 결과가 연결되기 전까지 서버 1위를 <strong className="font-bold text-stone-700">모바일 예상 결과</strong>로 표시합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold text-stone-500">평가 대상</span>
            <select
              value={split}
              onChange={(event) => setSplit(event.target.value as EvaluationSplit)}
              className="min-h-11 min-w-28 border border-stone-300 bg-white px-3 text-sm font-bold text-stone-700 outline-none transition-colors focus:border-[#e60000]"
            >
              <option value="DEV">개발셋</option>
              <option value="HOLDOUT">보류셋</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => void runEvaluation()}
            disabled={running || !dataset}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#e60000] px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {running ? "시작 중…" : "평가 실행"}
          </button>
        </div>
      </header>

      {(message || error) && (
        <div
          className={`flex items-start gap-2 border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
          role={error ? "alert" : "status"}
          aria-live="polite"
        >
          {error ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          <span>{error || message}</span>
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="border border-stone-200 bg-white xl:sticky xl:top-24 xl:self-start">
          <div className="border-b border-stone-200 px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black tracking-[-0.03em]">실행 이력</h2>
                <p className="mt-1 text-xs text-stone-500">{dataset?.version || "평가셋 확인 중"}</p>
              </div>
              <span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-stone-500">{runs.length} runs</span>
            </div>
          </div>
          <div className="max-h-[31rem] divide-y divide-stone-100 overflow-y-auto">
            {runs.length === 0 && <p className="px-5 py-10 text-sm text-stone-500">아직 실행한 평가가 없습니다.</p>}
            {runs.map((run) => {
              const active = selectedRun?.runId === run.runId;
              return (
                <button
                  key={run.runId}
                  type="button"
                  onClick={() => loadRun(run.runId).catch((cause) => setError(readError(cause)))}
                  className={`w-full border-l px-5 py-4 text-left transition-colors ${active ? "border-[#e60000] bg-red-50" : "border-transparent hover:bg-stone-50"}`}
                  aria-pressed={active}
                  title={run.runId}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold">{run.split === "DEV" ? "개발셋" : "보류셋"}</span>
                    <StatusBadge status={run.status} />
                  </div>
                  <p className="mt-2 truncate font-mono text-[11px] text-stone-500">{run.runId.slice(0, 12)}…</p>
                  <p className="mt-2 text-xs text-stone-400">{formatDate(run.createdAt)}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          {selectedRun ? (
            <>
              <section aria-label="실행 지표" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="모바일 예상 HitRate@1" value={metric(selectedRun, "hitrateAt1")} detail="앱 노출 1위 일치" accent />
                <MetricCard label="모바일 예상 NDCG@1" value={metric(selectedRun, "ndcgAt1")} detail="1위 관련성" />
                <MetricCard label="서버 진단 Recall@6" value={metric(selectedRun, "recallAt6")} detail="후보군 포함률" />
                <MetricCard label="서버 진단 MRR@6" value={metric(selectedRun, "mrrAt6")} detail="첫 정답 순위" />
              </section>

              <section className="border border-stone-200 bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 px-5 py-5 sm:px-6">
                  <div>
                    <h2 className="text-lg font-black tracking-[-0.03em]">이전 실행 비교</h2>
                    <p className="mt-1 text-sm leading-5 text-stone-500">같은 평가셋 버전과 split을 사용한 가장 최근 실행과 비교합니다.</p>
                  </div>
                  {previousComparableRun && <span className="font-mono text-[11px] text-stone-400">기준 {previousComparableRun.runId.slice(0, 8)}</span>}
                </div>
                <div className="px-5 py-5 sm:px-6">
                  {previousComparableRun ? (
                    <div className="grid gap-3 sm:grid-cols-4">
                      <DeltaCard label="HitRate@1" value={metricDelta(selectedRun, previousComparableRun, "hitrateAt1")} />
                      <DeltaCard label="NDCG@1" value={metricDelta(selectedRun, previousComparableRun, "ndcgAt1")} />
                      <DeltaCard label="Recall@6" value={metricDelta(selectedRun, previousComparableRun, "recallAt6")} />
                      <DeltaCard label="MRR@6" value={metricDelta(selectedRun, previousComparableRun, "mrrAt6")} />
                    </div>
                  ) : (
                    <p className="border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-500">
                      {hasIncompatiblePreviousRun ? "이전 실행이 있지만 평가셋 버전 또는 split이 달라 비교할 수 없습니다." : "동일한 평가셋과 split의 이전 실행이 없습니다."}
                    </p>
                  )}
                </div>
              </section>

              <section className="border border-stone-200 bg-white">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 px-5 py-5 sm:px-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-black tracking-[-0.03em]">실행 상세</h2>
                      <StatusBadge status={selectedRun.status} />
                    </div>
                    <p className="mt-1 text-sm text-stone-500">평가셋 {selectedRun.datasetVersion} · {selectedRun.split === "DEV" ? "개발셋" : "보류셋"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void finalize()}
                    disabled={selectedRun.status !== "REVIEW_REQUIRED"}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700 transition-colors hover:border-[#e60000] hover:text-[#e60000] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    기준선 확정
                  </button>
                </div>
                {selectedRun.fatalError && <p className="mx-5 mt-5 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">{selectedRun.fatalError}</p>}
                <div className="grid gap-3 px-5 py-5 text-sm sm:grid-cols-3 sm:px-6">
                  <Info label="서버 커밋" value={selectedRun.serverCommit || "unknown"} />
                  <Info label="앱 계약" value={selectedRun.appContractVersion || "unknown"} />
                  <Info label="Vector 인덱스" value={selectedRun.vectorIndexVersion || "unknown"} />
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-[minmax(16rem,0.34fr)_minmax(0,1fr)]">
                <aside className="border border-stone-200 bg-white">
                  <div className="border-b border-stone-200 px-5 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg font-black tracking-[-0.03em]">사례 목록 <span className="font-normal text-stone-400">({cases.length})</span></h2>
                      <Activity className="h-4 w-4 text-[#e60000]" aria-hidden="true" />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-stone-500">완료 {caseSummary.completed} · 오류 {caseSummary.errors} · 건너뜀 {caseSummary.skipped}</p>
                  </div>
                  <div className="max-h-[38rem] divide-y divide-stone-100 overflow-y-auto">
                    {cases.length === 0 && <p className="px-5 py-10 text-sm text-stone-500">실행 사례를 불러오는 중입니다.</p>}
                    {cases.map((item) => {
                      const active = selectedCaseId === item.caseId;
                      return (
                        <button
                          key={item.caseId}
                          type="button"
                          onClick={() => setSelectedCaseId(item.caseId)}
                          className={`w-full border-l px-5 py-4 text-left transition-colors ${active ? "border-[#e60000] bg-red-50" : "border-transparent hover:bg-stone-50"}`}
                          aria-pressed={active}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-bold">{item.caseId}</span>
                            <StatusBadge status={item.status} />
                          </div>
                          <p className="mt-2 text-xs text-stone-500">{typeLabels[item.caseType]}</p>
                          <p className="mt-1 text-[11px] text-stone-400">{item.caseType === "SEARCH" ? "모바일 예상 1위 · 서버 후보 6곳" : "생성 답변 검수"}</p>
                        </button>
                      );
                    })}
                  </div>
                </aside>
                {selectedCase ? <CasePanel item={selectedCase} review={review} onReviewChange={setReview} onSave={saveReview} /> : <EmptyCaseState />}
              </section>
            </>
          ) : (
            <EmptyRunState />
          )}
        </div>
      </section>
    </div>
  );
}

function CasePanel({ item, review, onReviewChange, onSave }: {
  item: CaseView;
  review: { finalScore: number; approved: boolean; opinion: string };
  onReviewChange: (value: { finalScore: number; approved: boolean; opinion: string }) => void;
  onSave: () => void;
}) {
  const generated = item.caseType !== "SEARCH";

  return (
    <article className="min-w-0 border border-stone-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 px-5 py-5 sm:px-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e60000]">{typeLabels[item.caseType]}</p>
          <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">{item.caseId}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <StatusBadge status={item.status} />
          {item.latencyMs !== null && <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{item.latencyMs}ms</span>}
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-5 md:grid-cols-2">
          <JsonBlock title="요청" value={item.request} />
          <JsonBlock title="정답 라벨" value={item.expected} />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <JsonBlock title={generated ? "생성 답변" : "서버 후보 · 모바일 예상 결과 1위"} value={item.response} />
          <JsonBlock title="검색 근거" value={item.evidence} />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <JsonBlock title="자동 지표" value={item.metrics} />
          <JsonBlock title="자동 판정 제안" value={item.autoJudgement} />
        </div>

        {item.errorMessage && <p className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{item.errorMessage}</p>}

        {generated && (
          <div className="border border-stone-200 bg-stone-50 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm font-bold text-stone-700">
                최종 점수
                <select
                  value={review.finalScore}
                  onChange={(event) => onReviewChange({ ...review, finalScore: Number(event.target.value) })}
                  className="ml-2 min-h-10 border border-stone-300 bg-white px-2 text-sm font-bold outline-none focus:border-[#e60000]"
                >
                  <option value={0}>0 · 부적합</option>
                  <option value={1}>1 · 부분 근거</option>
                  <option value={2}>2 · 충분한 근거</option>
                </select>
              </label>
              <label className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-stone-700">
                <input type="checkbox" checked={review.approved} onChange={(event) => onReviewChange({ ...review, approved: event.target.checked })} className="h-4 w-4 accent-[#e60000]" />
                승인
              </label>
            </div>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-bold text-stone-500">검수 의견</span>
              <textarea
                value={review.opinion}
                onChange={(event) => onReviewChange({ ...review, opinion: event.target.value })}
                placeholder="검수 의견을 남겨주세요"
                className="min-h-24 w-full border border-stone-300 bg-white p-3 text-sm leading-6 outline-none transition-colors placeholder:text-stone-400 focus:border-[#e60000]"
              />
            </label>
            <button type="button" onClick={onSave} className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-sm bg-[#25282b] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
              검수 저장
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="min-w-0">
      <h3 className="mb-2 text-xs font-black text-stone-500">{title}</h3>
      <pre className="max-h-64 overflow-auto border border-stone-200 bg-[#25282b] p-4 font-mono text-[11px] leading-5 text-stone-100">{prettyJson(value)}</pre>
    </div>
  );
}

function MetricCard({ label, value, detail, accent = false }: { label: string; value: string; detail: string; accent?: boolean }) {
  return (
    <article className={`border bg-white p-4 sm:p-5 ${accent ? "border-[#e60000]" : "border-stone-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold text-stone-500">{label}</p>
        {accent && <span className="h-2 w-2 rounded-full bg-[#e60000]" aria-label="모바일 핵심 지표" />}
      </div>
      <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#25282b]">{value}</p>
      <p className="mt-2 text-xs text-stone-400">{detail}</p>
    </article>
  );
}

function DeltaCard({ label, value }: { label: string; value: string }) {
  const positive = value.startsWith("+");
  const negative = value.startsWith("-");
  return (
    <div className="border border-stone-200 bg-stone-50 px-4 py-3">
      <p className="text-xs text-stone-500">{label}</p>
      <p className={`mt-1 text-lg font-black tracking-[-0.03em] ${positive ? "text-emerald-700" : negative ? "text-rose-700" : "text-[#25282b]"}`}>{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-stone-50 px-4 py-3">
      <p className="text-[11px] text-stone-500">{label}</p>
      <p className="mt-1 truncate font-mono text-xs font-bold text-stone-700" title={value}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "COMPLETED"
    ? "bg-emerald-100 text-emerald-700"
    : status === "FAILED" || status === "ERROR"
      ? "bg-rose-100 text-rose-700"
      : status === "REVIEW_REQUIRED"
        ? "bg-amber-100 text-amber-700"
        : "bg-stone-100 text-stone-600";
  return <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${color}`}>{statusLabels[status] ?? status}</span>;
}

function EmptyRunState() {
  return (
    <div className="border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
      <Activity className="mx-auto h-7 w-7 text-[#e60000]" aria-hidden="true" />
      <p className="mt-4 text-sm font-bold text-stone-700">왼쪽에서 실행을 선택하거나 평가를 새로 실행하세요.</p>
      <p className="mt-1 text-xs text-stone-500">실행 후 모바일 예상 결과와 사례별 근거가 여기에 표시됩니다.</p>
    </div>
  );
}

function EmptyCaseState() {
  return (
    <div className="border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
      <RotateCw className="mx-auto h-6 w-6 text-stone-400" aria-hidden="true" />
      <p className="mt-4 text-sm font-bold text-stone-700">사례를 선택하세요.</p>
      <p className="mt-1 text-xs text-stone-500">왼쪽 목록에서 검수할 사례를 열 수 있습니다.</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-7" role="status" aria-live="polite">
      <div className="border-b border-stone-200 pb-7">
        <div className="h-3 w-32 animate-pulse bg-stone-200" />
        <div className="mt-3 h-10 w-72 animate-pulse bg-stone-200" />
        <div className="mt-3 h-4 max-w-xl animate-pulse bg-stone-200" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse border border-stone-200 bg-white" />)}</div>
      <span className="sr-only">평가 화면을 불러오는 중입니다.</span>
    </div>
  );
}

function formatDate(value: string | null) { return value ? new Date(value).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "시간 대기 중"; }
function readError(cause: unknown) { if (cause instanceof ApiClientError) { if (cause.status === 401) return "로그인이 필요합니다."; if (cause.status === 403) return "관리자 권한이 필요합니다."; } return cause instanceof Error ? cause.message : "요청 처리 중 오류가 발생했습니다."; }
