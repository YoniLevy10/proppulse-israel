import Link from "next/link";
import { TerminalShell } from "@/components/terminal/TerminalShell";
import { getSessionUser } from "@/lib/auth/demo-session";
import {
  getTerminalSubscription,
  listTerminalItems,
} from "@/lib/store/repository";

export default async function TerminalPage() {
  const user = await getSessionUser();
  const sub = getTerminalSubscription(user.id);
  const items = await listTerminalItems("all");

  if (!user.subscription_status || !sub) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="max-w-md text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-emerald-400">
            PropTerminal IL
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Subscription required</h1>
          <p className="mt-3 text-sm text-slate-400">
            Activate Pro on the pricing page to unlock the live Israeli real-estate terminal.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-block rounded border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 font-mono text-xs uppercase tracking-wide text-emerald-300"
          >
            Upgrade to Pro
          </Link>
        </div>
      </main>
    );
  }

  return <TerminalShell initialItems={items} />;
}
