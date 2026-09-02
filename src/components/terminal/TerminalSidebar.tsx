"use client";

const NAV = [
  { id: "live", label: "Live Feed" },
  { id: "insights", label: "Market Insights" },
  { id: "radar", label: "Deal Radar" },
  { id: "alerts", label: "Alerts" },
] as const;

export function TerminalSidebar({
  section,
  onSectionChange,
}: {
  section: (typeof NAV)[number]["id"];
  onSectionChange: (id: (typeof NAV)[number]["id"]) => void;
}) {
  return (
    <aside className="hidden w-52 shrink-0 border-r border-slate-800 bg-slate-950/80 md:block">
      <div className="border-b border-slate-800 px-4 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-500">
          Navigation
        </p>
      </div>
      <nav className="space-y-1 p-2">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            className={`w-full rounded px-3 py-2 text-left font-mono text-xs ${
              section === item.id
                ? "bg-emerald-500/15 text-emerald-300"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
