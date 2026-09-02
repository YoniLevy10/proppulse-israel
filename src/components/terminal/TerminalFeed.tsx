"use client";

import type { TerminalItem, TerminalUrgency } from "@/lib/types";

function formatPrice(price: number | null) {
  if (price == null) return "—";
  return new Intl.NumberFormat("en-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(price);
}

function urgencyClass(u: TerminalUrgency) {
  switch (u) {
    case "critical":
      return "text-rose-400";
    case "high":
      return "text-amber-300";
    case "medium":
      return "text-emerald-300";
    default:
      return "text-slate-400";
  }
}

export function TerminalFeed({
  items,
  selectedId,
  onSelect,
}: {
  items: TerminalItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-xs">
        <thead className="sticky top-0 bg-slate-950/95 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          <tr className="border-b border-slate-800">
            <th className="px-3 py-2 font-medium">Title</th>
            <th className="px-3 py-2 font-medium">Source</th>
            <th className="px-3 py-2 font-medium">Location</th>
            <th className="px-3 py-2 font-medium">Est. Value</th>
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Urgency</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const active = item.id === selectedId;
            return (
              <tr
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`cursor-pointer border-b border-slate-900/80 transition ${
                  active ? "bg-emerald-500/10" : "hover:bg-slate-900/70"
                }`}
              >
                <td className="px-3 py-2.5 text-slate-100">{item.title}</td>
                <td className="px-3 py-2.5 font-mono text-slate-400">
                  {item.source_name}
                </td>
                <td className="px-3 py-2.5 text-slate-300">
                  {item.location ?? "—"}
                </td>
                <td className="px-3 py-2.5 font-mono text-emerald-300">
                  {formatPrice(item.price)}
                </td>
                <td className="px-3 py-2.5 font-mono text-slate-500">
                  {new Date(item.created_at).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </td>
                <td
                  className={`px-3 py-2.5 font-mono uppercase ${urgencyClass(item.urgency)}`}
                >
                  {item.urgency}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {items.length === 0 ? (
        <p className="p-6 font-mono text-xs text-slate-500">
          No signals for this filter.
        </p>
      ) : null}
    </div>
  );
}
