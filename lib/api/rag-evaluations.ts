import { apiClient } from "@/lib/api/client";

export type EvaluationSplit = "DEV" | "HOLDOUT";
export type EvaluationType = "SEARCH" | "SUMMARY" | "CHAT" | "COMPARE";
export type EvaluationStatus = "QUEUED" | "RUNNING" | "REVIEW_REQUIRED" | "COMPLETED" | "FAILED";
export type CaseStatus = "PENDING" | "RUNNING" | "COMPLETED" | "SKIPPED" | "ERROR";

export interface ApiEnvelope<T> {
  status?: string;
  message?: string;
  data: T;
}

export interface DatasetView {
  version: string;
  totalCases: number;
  countsByType: Partial<Record<EvaluationType, number>>;
  availableSplits: EvaluationSplit[];
}

export interface RunStart {
  runId: string;
  status: EvaluationStatus;
  idempotentReplay: boolean;
}

export interface RunView {
  runId: string;
  datasetVersion: string;
  split: EvaluationSplit;
  status: EvaluationStatus;
  aggregateMetrics: Record<string, unknown> | null;
  serverCommit: string | null;
  appContractVersion: string | null;
  vectorIndexVersion: string | null;
  modelMetadata: Record<string, unknown> | null;
  fatalError: string | null;
  createdAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface CaseView {
  runId: string;
  caseId: string;
  caseType: EvaluationType;
  status: CaseStatus;
  request: Record<string, unknown> | null;
  expected: Record<string, unknown> | null;
  response: Record<string, unknown> | null;
  evidence: Array<Record<string, unknown>> | null;
  metrics: Record<string, number> | null;
  autoJudgement: Record<string, unknown> | null;
  finalReview: Record<string, unknown> | null;
  latencyMs: number | null;
  errorType: string | null;
  errorMessage: string | null;
  reviewerMemberId: number | null;
  reviewedAt: string | null;
}

interface PageResponse<T> {
  items: T[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

const unwrap = <T>(response: ApiEnvelope<T> | T): T => {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiEnvelope<T>).data;
  }
  return response as T;
};

export const getRagEvaluationDataset = async (): Promise<DatasetView> => {
  const response = await apiClient<ApiEnvelope<DatasetView>>("/admin/api/rag-evaluations/datasets");
  return unwrap(response);
};

export const startRagEvaluation = async (split: EvaluationSplit, datasetVersion: string, idempotencyKey: string): Promise<RunStart> => {
  const response = await apiClient<ApiEnvelope<RunStart>>("/admin/api/rag-evaluations/runs", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: { split, datasetVersion },
  });
  return unwrap(response);
};

export const getRagEvaluationRuns = async (): Promise<PageResponse<RunView>> => {
  const response = await apiClient<ApiEnvelope<PageResponse<RunView>>>("/admin/api/rag-evaluations/runs");
  return unwrap(response);
};

export const getRagEvaluationRun = async (runId: string): Promise<RunView> => {
  const response = await apiClient<ApiEnvelope<RunView>>(`/admin/api/rag-evaluations/runs/${runId}`);
  return unwrap(response);
};

export const getRagEvaluationCases = async (runId: string): Promise<PageResponse<CaseView>> => {
  const response = await apiClient<ApiEnvelope<PageResponse<CaseView>>>(`/admin/api/rag-evaluations/runs/${runId}/cases?size=100`);
  return unwrap(response);
};

export const reviewRagEvaluationCase = async (runId: string, caseId: string, review: { finalScore: number; approved: boolean; verdict: string; opinion: string }): Promise<CaseView> => {
  const response = await apiClient<ApiEnvelope<CaseView>>(`/admin/api/rag-evaluations/runs/${runId}/cases/${caseId}/review`, {
    method: "PATCH",
    body: review,
  });
  return unwrap(response);
};

export const finalizeRagEvaluation = async (runId: string): Promise<RunView> => {
  const response = await apiClient<ApiEnvelope<RunView>>(`/admin/api/rag-evaluations/runs/${runId}/finalize`, { method: "POST" });
  return unwrap(response);
};
