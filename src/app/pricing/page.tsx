import { UpgradeButton } from "@/components/UpgradeButton";
import { getSessionUser } from "@/lib/auth/demo-session";
import { getTerminalSubscription } from "@/lib/store/repository";

export default async function PricingPage() {
  const user = await getSessionUser();
  const sub = getTerminalSubscription(user.id);
  const active = user.subscription_status;

  return (
    <main className="mx-auto max-w-5xl px-4 py-14">
      <div className="max-w-2xl">
        <p className="font-display text-4xl font-bold text-brand">תמחור PropPulse</p>
        <p className="mt-3 text-muted">
          מנוי דמו — לחיצה אחת מפעילה גישה מלאה לדשבורד ול־PropTerminal IL.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-brand/10 bg-white p-8 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-ink">Pro</h2>
          <p className="mt-2 text-sm text-muted">למתווכים עצמאיים וסוכנויות קטנות</p>
          <p className="mono-num mt-6 text-4xl font-semibold text-brand">
            ₪299<span className="text-base text-muted">/חודש</span>
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ink/80">
            <li>וואטסאפ Instant Lead Responder</li>
            <li>דשבורד לידים ופרויקטים ללא טשטוש</li>
            <li>גישת PropTerminal בדרגת Pro</li>
          </ul>
          <div className="mt-8">
            {active ? (
              <p className="text-sm font-semibold text-brand">
                המנוי פעיל{sub ? ` · ${sub.tier}` : ""}
              </p>
            ) : (
              <UpgradeButton tier="pro" label="הפעלת Pro (דמו)" />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-brand/20 bg-brand p-8 text-white shadow-sm">
          <h2 className="font-display text-2xl font-bold">Enterprise</h2>
          <p className="mt-2 text-sm text-white/80">למשרדים עם מספר סוכנים ומקורות לידים</p>
          <p className="mono-num mt-6 text-4xl font-semibold">
            ₪799<span className="text-base text-white/70">/חודש</span>
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/90">
            <li>הכול ב־Pro</li>
            <li>Ingest MCP / סקרייפרים מרובים</li>
            <li>התראות Deal Radar לצוות</li>
          </ul>
          <div className="mt-8">
            <UpgradeButton
              tier="enterprise"
              label="הפעלת Enterprise (דמו)"
              className="!bg-white !text-brand hover:!bg-sand"
            />
          </div>
        </article>
      </div>
    </main>
  );
}
