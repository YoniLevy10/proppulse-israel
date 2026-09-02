"use client";

import { useEffect, useMemo, useState } from "react";
import type { TerminalFilter, TerminalItem } from "@/lib/types";
import { TerminalDetail } from "@/components/terminal/TerminalDetail";
import { TerminalFeed } from "@/components/terminal/TerminalFeed";
import { TerminalSidebar } from "@/components/terminal/TerminalSidebar";

const FILTERS: { id: TerminalFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "exclusive", label: "Exclusive" },
  { id: "pinui_binui", label: "Pinui-Binui" },
  { id: "whatsapp_signal", label: "WhatsApp Signals" },
];

export function TerminalShell({
  initialItems,
}: {
  initialItems: TerminalItem[];
}) {
  const [section, setSection] = useState<"live" | "insights" | "radar" | "alerts">(
    "live",
  );
  const [filter, setFilter] = useState<TerminalFilter>("all");
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState(initialItems[0]?.id ?? null);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const res = await fetch(`/api/terminal/feed?filter=${filter}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { items: TerminalItem[] };
      if (cancelled) return;
      setItems(data.items);
      setSelectedId((prev) =>
        prev && data.items.some((i) => i.id === prev)
          ? prev
          : (data.items[0]?.id ?? null),
      );
    }
    refresh();
    const id = window.setInterval(refresh, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [filter]);

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId],
  );

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-100" dir="ltr">
      <TerminalSidebar section={section} onSectionChange={setSection} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-emerald-500/20 px-4 py-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">
              PropTerminal IL
            </p>
            <h1 className="text-sm font-semibold text-slate-100">
              Israeli Real Estate Data Terminal
            </h1>
          </div>
          <div className="font-mono text-xs text-slate-400">
            LIVE · {items.length} signals
          </div>
        </header>

        {section === "live" ? (
          <div className="grid min-h-0 flex-1 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="min-w-0 border-r border-slate-800">
              <div className="flex flex-wrap gap-2 border-b border-slate-800 px-4 py-3">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`rounded border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${
                      filter === f.id
                        ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <TerminalFeed
                items={items}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
            <TerminalDetail item={selected} />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
                {section}
              </p>
              <p className="mt-3 max-w-md text-sm text-slate-400">
                Placeholder module for the MVP. Live Feed is fully wired; Insights, Deal Radar,
                and Alerts will stream derived metrics next.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
