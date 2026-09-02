"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpgradeButton({
  tier = "pro",
  label = "שדרוג ל־Pro",
  className = "",
}: {
  tier?: "pro" | "enterprise";
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) throw new Error("upgrade failed");
      router.refresh();
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onUpgrade}
      disabled={loading}
      className={`rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60 ${className}`}
    >
      {loading ? "מפעיל מנוי..." : label}
    </button>
  );
}
