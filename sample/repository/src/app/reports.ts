export type RunResult = "completed" | "no-change" | "blocked";

export type CheckResult = {
  command: string;
  result: "passed" | "failed" | "not-run";
};

export type RunRecord = {
  runId: string;
  startedAt: string;
  completedAt: string;
  result: RunResult;
  sources: Array<{ filename: string; type: string; date: string }>;
  summary: string;
  requirements: Array<{ id: string; status: string }>;
  changedFiles: string[];
  tests: CheckResult[];
  designReview: { status: string; findings: string[] };
  codingReview: { status: string; findings: string[] };
};

const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))
  && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

export function isReportDate(value: string): boolean {
  return validDate(value);
}

export function isRunRecord(value: unknown): value is RunRecord {
  if (!value || typeof value !== "object") return false;
  const run = value as Partial<RunRecord>;
  return typeof run.runId === "string"
    && typeof run.startedAt === "string"
    && typeof run.completedAt === "string"
    && ["completed", "no-change", "blocked"].includes(run.result ?? "")
    && Array.isArray(run.sources)
    && typeof run.summary === "string"
    && Array.isArray(run.requirements)
    && Array.isArray(run.changedFiles)
    && Array.isArray(run.tests)
    && !!run.designReview && Array.isArray(run.designReview.findings)
    && !!run.codingReview && Array.isArray(run.codingReview.findings);
}
