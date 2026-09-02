"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SimulateReplyForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [text, setText] = useState(
    "מחפש 4 חדרים בתל אביב עד 3.5 מיליון, נוח בערב",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/simulate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="w-full rounded-md border border-brand/15 bg-white px-3 py-2 text-sm"
        dir="rtl"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
      >
        {loading ? "שולח..." : "סימולציית תשובת ליד"}
      </button>
      {error ? <p className="text-xs text-accent">{error}</p> : null}
    </form>
  );
}
