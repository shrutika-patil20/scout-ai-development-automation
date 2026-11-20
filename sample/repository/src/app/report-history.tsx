"use client";

import { useEffect, useState } from "react";
import type { RunRecord } from "./reports";

type ReportResponse = { dates: string[] } | { date: string; runs: RunRecord[] } | { error: string };

export default function ReportHistory() {
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/reports")
      .then(async (response) => {
        const data = await response.json() as ReportResponse;
        if (!response.ok || "error" in data) throw new Error("error" in data ? data.error : "Unable to load report dates.");
        return data as { dates: string[] };
      })
      .then((data) => {
        if (!active) return;
        setDates(data.dates);
        setSelectedDate(data.dates[0] ?? "");
        if (!data.dates.length) setLoading(false);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Unable to load reports.");
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    let active = true;
    setLoading(true);
    setError("");
    fetch(`/api/reports?date=${encodeURIComponent(selectedDate)}`)
      .then(async (response) => {
        const data = await response.json() as ReportResponse;
        if (!response.ok || "error" in data) throw new Error("error" in data ? data.error : "Unable to load the selected report.");
        return data as { date: string; runs: RunRecord[] };
      })
      .then((data) => { if (active) setRuns(data.runs); })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Unable to load this report.");
        setRuns([]);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedDate]);

  return (
    <section className="panel reports-panel" id="reports" aria-labelledby="reports-title">
      <div className="panel-heading report-heading">
        <div><div className="section-kicker">AUTOMATION ACTIVITY</div><h2 id="reports-title">Run history</h2><p>Review changes made by the Scout workflow, one day at a time.</p></div>
        <label className="report-date-label">Report date
          <select value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} disabled={!dates.length} aria-label="Select report date">
            {!dates.length && <option value="">No dates available</option>}
            {dates.map((date) => <option key={date} value={date}>{date}</option>)}
          </select>
        </label>
      </div>
      {loading && <p className="report-message" role="status">Loading run history…</p>}
      {!loading && error && <p className="report-message report-error" role="alert">{error}</p>}
      {!loading && !error && !dates.length && <p className="report-message">No run reports yet. When Scout finishes an automation run, its dated report will appear here.</p>}
      {!loading && !error && dates.length > 0 && runs.length === 0 && <p className="report-message">There are no runs in this report.</p>}
      {!loading && !error && runs.length > 0 && <div className="report-runs">{runs.map((run) => (
        <article className="report-run" key={run.runId}>
          <div className="report-run-top"><div><span className={`run-status status-${run.result}`}>{run.result.replace("-", " ")}</span><h3>{run.summary || "Scout workflow run"}</h3></div><span className="run-id">{run.runId}</span></div>
          <p className="run-time">Completed {new Date(run.completedAt).toLocaleString()}</p>
          <div className="report-detail-grid">
            <div><h4>Sources</h4>{run.sources.length ? <ul>{run.sources.map((source) => <li key={`${source.filename}-${source.date}`}>{source.filename} <span>· {source.type}, {source.date}</span></li>)}</ul> : <p>None</p>}</div>
            <div><h4>Requirements</h4>{run.requirements.length ? <ul>{run.requirements.map((item) => <li key={item.id}>{item.id} <span>· {item.status}</span></li>)}</ul> : <p>None</p>}</div>
            <div><h4>Checks</h4>{run.tests.length ? <ul>{run.tests.map((test) => <li key={test.command}>{test.command} <span>· {test.result}</span></li>)}</ul> : <p>No checks recorded</p>}</div>
            <div><h4>Review</h4><p>Design: {run.designReview.status}; code: {run.codingReview.status}</p>{[...run.designReview.findings, ...run.codingReview.findings].length > 0 && <ul>{[...run.designReview.findings, ...run.codingReview.findings].map((finding, index) => <li key={`${index}-${finding}`}>{finding}</li>)}</ul>}</div>
          </div>
          <div className="report-files"><h4>Changed files</h4>{run.changedFiles.length ? <ul>{run.changedFiles.map((file) => <li key={file}><code>{file}</code></li>)}</ul> : <p>No files changed</p>}</div>
        </article>
      ))}</div>}
    </section>
  );
}
