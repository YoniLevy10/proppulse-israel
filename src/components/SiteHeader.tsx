import Link from "next/link";

const links = [
  { href: "/dashboard", label: "דשבורד" },
  { href: "/terminal", label: "PropTerminal" },
  { href: "/pricing", label: "תמחור" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand/10 bg-[#f4f7f5]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-brand">
          PropPulse <span className="text-accent">Israel</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-ink/80">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
