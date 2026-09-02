import Link from "next/link";
import { SimulateReplyForm } from "@/components/SimulateReplyForm";
import { getSessionUser } from "@/lib/auth/demo-session";
import {
  listConversations,
  listLeads,
  listProjectsForUser,
} from "@/lib/store/repository";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  const user = await getSessionUser();
  const subscribed = user.subscription_status;
  const projects = await listProjectsForUser(subscribed);
  const leads = await listLeads(user.id);
  const params = await searchParams;
  const selectedLeadId = params.leadId ?? leads[0]?.id;
  const selectedLead = leads.find((l) => l.id === selectedLeadId) ?? null;
  const conversations = selectedLead
    ? await listConversations(selectedLead.id)
    : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">דשבורד סוכן</h1>
          <p className="mt-1 text-sm text-muted">
            {user.email} · {subscribed ? "Pro פעיל" : "ללא מנוי — פרטים רגישים מטושטשים"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/terminal"
            className="rounded-md border border-brand/20 px-3 py-2 text-sm font-semibold text-brand"
          >
            PropTerminal
          </Link>
          {!subscribed ? (
            <Link
              href="/pricing"
              className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white"
            >
              שדרוג ל־Pro
            </Link>
          ) : null}
        </div>
      </div>

      {!subscribed ? (
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-ink">
          <strong>Upgrade to Pro</strong> — טלפונים וכתובות מדויקות מוסתרים עד הפעלת מנוי.
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            פרויקטים נכנסים
          </h2>
          <ul className="space-y-3">
            {projects.map((p) => (
              <li
                key={p.id}
                className="relative overflow-hidden rounded-xl border border-brand/10 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{p.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {p.location} · {p.price_range ?? "—"}
                    </p>
                    <p className="mt-2 text-sm text-ink/80">{p.description}</p>
                  </div>
                  <span className="rounded-full bg-sand px-2 py-1 text-[11px] font-medium text-brand">
                    {p.property_type ?? "כללי"}
                  </span>
                </div>
                <div
                  className={`mt-3 grid gap-1 text-sm ${p.is_locked ? "select-none blur-sm" : ""}`}
                >
                  <p>כתובת: {p.exact_address ?? "••••••••"}</p>
                  <p>טלפון: {p.contact_phone ?? "05x-xxxxxxx"}</p>
                </div>
                {p.is_locked ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-20 items-end justify-center bg-gradient-to-t from-white via-white/90 to-transparent pb-3">
                    <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                      Upgrade to Pro
                    </span>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            לידים ושיחות AI
          </h2>
          <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
            <ul className="space-y-2">
              {leads.map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/dashboard?leadId=${lead.id}`}
                    className={`block rounded-lg border px-3 py-2 text-sm transition ${
                      lead.id === selectedLeadId
                        ? "border-brand bg-brand text-white"
                        : "border-brand/10 bg-white hover:border-brand/30"
                    }`}
                  >
                    <p className="font-semibold">{lead.full_name}</p>
                    <p className="opacity-80">{lead.status}</p>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-brand/10 bg-white p-4 shadow-sm">
              {selectedLead ? (
                <>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{selectedLead.full_name}</p>
                      <p className="text-xs text-muted">
                        {selectedLead.phone} · {selectedLead.property_interest ?? "—"}
                      </p>
                    </div>
                    <span className="rounded-full bg-sand px-2 py-1 text-[11px] font-medium text-brand">
                      {selectedLead.status}
                    </span>
                  </div>
                  <div
                    className="max-h-72 space-y-2 overflow-y-auto rounded-lg bg-sand/40 p-3"
                    dir="rtl"
                  >
                    {conversations.map((c) => (
                      <div
                        key={c.id}
                        className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                          c.sender === "bot"
                            ? "mr-auto bg-brand text-white"
                            : c.sender === "lead"
                              ? "ml-auto bg-white text-ink"
                              : "mx-auto bg-ink/10 text-ink"
                        }`}
                      >
                        <p className="mb-1 text-[10px] uppercase opacity-70">{c.sender}</p>
                        {c.message}
                      </div>
                    ))}
                  </div>
                  <SimulateReplyForm leadId={selectedLead.id} />
                </>
              ) : (
                <p className="text-sm text-muted">אין לידים עדיין.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
