import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isReportDate, isRunRecord, type RunRecord } from "../../reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reportsRoot = path.resolve(process.cwd(), "reports");

async function listDates(): Promise<string[]> {
  const dates: string[] = [];
  async function visit(directory: string, depth: number) {
    if (depth > 2) return;
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      if (entry.isDirectory() && /^\d{4}$/.test(entry.name)) {
        await visit(path.join(directory, entry.name), depth + 1);
      } else if (entry.isDirectory() && depth === 1 && /^\d{2}$/.test(entry.name)) {
        await visit(path.join(directory, entry.name), depth + 1);
      } else if (entry.isFile() && /^\d{4}-\d{2}-\d{2}\.json$/.test(entry.name)) {
        const date = entry.name.slice(0, 10);
        if (isReportDate(date)) dates.push(date);
      }
    }
  }
  await visit(reportsRoot, 0);
  return [...new Set(dates)].sort((a, b) => b.localeCompare(a));
}

function reportPath(date: string) {
  const [year, month] = date.split("-");
  const target = path.resolve(reportsRoot, year, month, `${date}.json`);
  if (!target.startsWith(`${reportsRoot}${path.sep}`)) throw new Error("Invalid report date");
  return target;
}

export async function GET(request: Request) {
  try {
    const date = new URL(request.url).searchParams.get("date");
    const dates = await listDates();
    if (date === null) return NextResponse.json({ dates });
    if (!isReportDate(date)) return NextResponse.json({ error: "Date must use YYYY-MM-DD format." }, { status: 400 });
    if (!dates.includes(date)) return NextResponse.json({ error: "No report is available for this date." }, { status: 404 });

    const parsed: unknown = JSON.parse(await readFile(reportPath(date), "utf8"));
    const runs = parsed && typeof parsed === "object" && "runs" in parsed ? (parsed as { runs?: unknown }).runs : null;
    if (!Array.isArray(runs) || !runs.every(isRunRecord)) {
      return NextResponse.json({ error: "The report file has an invalid format." }, { status: 500 });
    }
    return NextResponse.json({ date, runs: runs as RunRecord[] });
  } catch {
    return NextResponse.json({ error: "Unable to read run reports." }, { status: 500 });
  }
}
