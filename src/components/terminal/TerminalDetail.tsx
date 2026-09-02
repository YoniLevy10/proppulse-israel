"use client";

import type { TerminalItem } from "@/lib/types";

export function TerminalDetail({ item }: { item: TerminalItem | null }) {
  if (!item) {
    return (
      <div className="flex items-center justify-center p-8 font-mono text-xs text-slate-500">
        Select a signal to inspect
      </div>
    );
  }

  return (
    <div className="overflow-auto p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
        Detail Panel
      </p>
      <h2 className="mt-2 text-lg font-semibold text-slate-50">{item.title}</h2>
      <dl className="mt-4 space-y-2 font-mono text-xs text-slate-300">
        <div className="flex justify-between gap-4 border-b border-slate-800 py-2">
          <dt className="text-slate-500">Source</dt>
          <dd>{item.source_name}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-800 py-2">
          <dt className="text-slate-500">Location</dt>
          <dd>{item.location ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-800 py-2">
          <dt className="text-slate-500">Category</dt>
          <dd>{item.category}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-800 py-2">
          <dt className="text-slate-500">Sentiment</dt>
          <dd>{item.sentiment_score ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-800 py-2">
          <dt className="text-slate-500">Urgency</dt>
          <dd className="uppercase text-emerald-300">{item.urgency}</dd>
        </div>
      </dl>
      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          Raw Content
        </p>
        <pre className="mt-2 whitespace-pre-wrap rounded border border-slate-800 bg-slate-900/60 p-3 font-mono text-[11px] leading-relaxed text-slate-300">
          {item.raw_content ?? "No raw payload"}
        </pre>
      </div>
    </div>
  );
}
