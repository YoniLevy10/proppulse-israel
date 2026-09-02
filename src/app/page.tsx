import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,#cfe5d8_0%,transparent_50%),radial-gradient(ellipse_at_80%_0%,#f3c5be_0%,transparent_40%),linear-gradient(160deg,#f4f7f5_0%,#e7efe9_55%,#d5e6dc_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(11,61,46,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(11,61,46,0.15)_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col justify-center px-4 py-16">
          <p className="font-display text-5xl font-extrabold tracking-tight text-brand sm:text-7xl animate-[fadeUp_0.7s_ease_both]">
            PropPulse Israel
          </p>
          <h1 className="mt-5 max-w-2xl text-2xl font-semibold leading-snug text-ink sm:text-3xl animate-[fadeUp_0.8s_ease_both]">
            מהפכת ה־10 שניות למתווכים — ליד נכנס, וואטסאפ יוצא, הסוכן לא מפספס.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg animate-[fadeUp_0.9s_ease_both]">
            קליטת לידים, שיחת AI בעברית, ו־PropTerminal IL — מסוף נתונים צפוף בסגנון בלומברג לשוק הישראלי.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-[fadeUp_1s_ease_both]">
            <Link
              href="/dashboard"
              className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-soft"
            >
              לדשבורד הלידים
            </Link>
            <Link
              href="/terminal"
              className="rounded-md border border-brand/20 bg-white/70 px-5 py-3 text-sm font-semibold text-brand backdrop-blur transition hover:bg-white"
            >
              לפתוח את PropTerminal
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
