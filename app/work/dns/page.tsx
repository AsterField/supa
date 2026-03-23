"use client";

import { useState } from "react";

type RecordType = "a" | "aaaa" | "mx" | "ns" | "txt" | "soa" | "cname";

interface HistoryRecord {
  first_seen: string;
  last_seen: string | null;
  organizations?: string[];
  values: { ip?: string; host?: string; value?: string; mx?: string; txt?: string }[];
}

interface HistoryResponse {
  records: HistoryRecord[];
  pages?: number;
  type?: string;
}

const RECORD_TYPES: RecordType[] = ["a", "aaaa", "mx", "ns", "txt", "soa", "cname"];

const RECORD_COLORS: Record<RecordType, { pill: string; active: string }> = {
  a:     { pill: "bg-blue-50 text-blue-600 border-blue-200",       active: "bg-blue-600 border-blue-600 text-white" },
  aaaa:  { pill: "bg-purple-50 text-purple-600 border-purple-200", active: "bg-purple-600 border-purple-600 text-white" },
  mx:    { pill: "bg-orange-50 text-orange-600 border-orange-200", active: "bg-orange-500 border-orange-500 text-white" },
  ns:    { pill: "bg-emerald-50 text-emerald-600 border-emerald-200", active: "bg-emerald-600 border-emerald-600 text-white" },
  txt:   { pill: "bg-amber-50 text-amber-600 border-amber-200",    active: "bg-amber-500 border-amber-500 text-white" },
  soa:   { pill: "bg-pink-50 text-pink-600 border-pink-200",       active: "bg-pink-600 border-pink-600 text-white" },
  cname: { pill: "bg-cyan-50 text-cyan-600 border-cyan-200",       active: "bg-cyan-600 border-cyan-600 text-white" },
};

const RECORD_BADGE: Record<RecordType, string> = {
  a:     "bg-blue-100 text-blue-700",
  aaaa:  "bg-purple-100 text-purple-700",
  mx:    "bg-orange-100 text-orange-700",
  ns:    "bg-emerald-100 text-emerald-700",
  txt:   "bg-amber-100 text-amber-700",
  soa:   "bg-pink-100 text-pink-700",
  cname: "bg-cyan-100 text-cyan-700",
};

function getRecordValue(v: HistoryRecord["values"][0]) {
  return v.ip ?? v.host ?? v.value ?? v.mx ?? v.txt ?? JSON.stringify(v);
}

async function apiFetch(domain: string, record: RecordType): Promise<HistoryResponse> {
  const res  = await fetch(`/api/dns?domain=${encodeURIComponent(domain)}&record=${record}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-mono text-xs transition-all cursor-pointer shadow-sm"
    >
      {copied ? (
        <><span className="text-emerald-500">✓</span> Copied</>
      ) : (
        <><span>📋</span> {label}</>
      )}
    </button>
  );
}

function buildEvidenceText(domain: string, record: RecordType, records: HistoryRecord[]): string {
  const lines: string[] = [
    `DNS History Report`,
    `==================`,
    `Domain:      ${domain}`,
    `Record Type: ${record.toUpperCase()}`,
    `Generated:   ${new Date().toUTCString()}`,
    `Total:       ${records.length} record(s)`,
    ``,
  ];
  records.forEach((r, i) => {
    lines.push(`[${i + 1}] First seen: ${r.first_seen}  |  Last seen: ${r.last_seen ?? "current (still active)"}`);
    if (r.organizations?.length) lines.push(`    Organization: ${r.organizations.join(", ")}`);
    r.values.forEach(v => lines.push(`    → ${getRecordValue(v)}`));
    lines.push("");
  });
  return lines.join("\n");
}

export default function DNSHistory() {
  const [domain,     setDomain]     = useState("");
  const [recordType, setRecordType] = useState<RecordType>("a");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [result,     setResult]     = useState<HistoryResponse | null>(null);
  const [searched,   setSearched]   = useState({ domain: "", record: "a" as RecordType });
  const [showJson,   setShowJson]   = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!d) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowJson(false);
    try {
      const data = await apiFetch(d, recordType);
      setResult(data);
      setSearched({ domain: d, record: recordType });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const records = result?.records ?? [];
  const jsonStr = JSON.stringify(result, null, 2);
  const evidenceText = buildEvidenceText(searched.domain, searched.record, records);

  // First 3 records as a preview for quick evidence copy
  const previewText = buildEvidenceText(searched.domain, searched.record, records.slice(0, 3))
    + (records.length > 3 ? `\n... and ${records.length - 3} more records. Full report copied separately.\n` : "");

  return (
    <main className="min-h-screen bg-[#f7f6f3] text-slate-800 font-sans">
      <div className="max-w-3xl mx-auto px-5 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📜</span>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">DNS History</h1>
          </div>
          <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">
            Historical DNS records via SecurityTrails
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-10">
          <div className="flex gap-2">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. google.com"
              className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 font-mono text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !domain.trim()}
              className="bg-slate-900 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shrink-0 shadow-sm"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>

          {/* Record type pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-mono text-[10px] uppercase tracking-widest mr-1">Type:</span>
            {RECORD_TYPES.map((r) => {
              const c = RECORD_COLORS[r];
              const isActive = recordType === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRecordType(r)}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-xs uppercase font-bold tracking-wider transition-all cursor-pointer shadow-sm ${
                    isActive ? c.active : c.pill + " hover:opacity-80"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin" />
            <p className="font-mono text-xs text-slate-400 tracking-widest uppercase">Querying SecurityTrails…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="font-mono text-sm text-slate-500 max-w-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && result && (
          <>
            {/* Result header + export toolbar */}
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 mb-5 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-lg font-mono text-xs uppercase font-bold ${RECORD_BADGE[searched.record]}`}>
                    {searched.record}
                  </span>
                  <span className="text-slate-400 font-mono text-xs">history for</span>
                  <span className="font-mono text-sm font-bold text-slate-900">{searched.domain}</span>
                  <span className="text-slate-300 font-mono text-xs">—</span>
                  <span className="text-slate-500 font-mono text-xs">{records.length} record{records.length !== 1 ? "s" : ""}</span>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="text-slate-300 hover:text-slate-500 font-mono text-xs transition-colors cursor-pointer"
                >
                  clear ✕
                </button>
              </div>

              {/* Export actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
                <span className="text-slate-400 font-mono text-[10px] uppercase tracking-widest mr-1">Export:</span>
                <CopyButton text={evidenceText} label="Full Report (text)" />
                <CopyButton text={previewText}  label="Top 3 (evidence)" />
                <CopyButton text={jsonStr}       label="Raw JSON" />
                <button
                  onClick={() => setShowJson(p => !p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-mono text-xs transition-all cursor-pointer shadow-sm"
                >
                  {showJson ? "Hide JSON" : "View JSON"}
                </button>
              </div>
            </div>

            {/* JSON viewer */}
            {showJson && (
              <div className="mb-5 bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
                  <span className="font-mono text-xs text-slate-400 uppercase tracking-widest">Raw JSON</span>
                  <CopyButton text={jsonStr} label="Copy JSON" />
                </div>
                <pre className="px-5 py-4 text-xs text-emerald-300 font-mono overflow-x-auto max-h-96 overflow-y-auto leading-relaxed">
                  {jsonStr}
                </pre>
              </div>
            )}

            {/* Records list */}
            {records.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No historical records found.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {records.map((r, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all"
                  >
                    {/* Row header */}
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono text-xs w-5 text-right">{i + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">First</span>
                          <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{r.first_seen}</span>
                        </div>
                        <span className="text-slate-300">→</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Last</span>
                          <span className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                            r.last_seen
                              ? "text-slate-700 bg-slate-100"
                              : "text-emerald-700 bg-emerald-100 font-semibold"
                          }`}>
                            {r.last_seen ?? "current ✓"}
                          </span>
                        </div>
                      </div>

                      {/* Per-record copy */}
                      <CopyButton
                        text={[
                          `${searched.record.toUpperCase()} record for ${searched.domain}`,
                          `First seen: ${r.first_seen}`,
                          `Last seen:  ${r.last_seen ?? "current (still active)"}`,
                          r.organizations?.length ? `Org: ${r.organizations.join(", ")}` : "",
                          r.values.map(v => `Value: ${getRecordValue(v)}`).join("\n"),
                        ].filter(Boolean).join("\n")}
                        label="Copy record"
                      />
                    </div>

                    {/* Org */}
                    {r.organizations?.length ? (
                      <p className="text-slate-400 font-mono text-xs mb-2 ml-8">{r.organizations.join(", ")}</p>
                    ) : null}

                    {/* Values */}
                    <div className="flex flex-wrap gap-2 ml-8">
                      {r.values.map((v, j) => (
                        <span
                          key={j}
                          className="inline-block bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-700 break-all"
                        >
                          {getRecordValue(v)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}