"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlan } from "@/components/PlanContext";

const links = [
  { href: "/", label: "Explore" },
  { href: "/plan", label: "My Plan" },
  { href: "/admin/login", label: "Admin" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { plan } = usePlan();

  return (
    <header className="sticky top-0 z-50 bg-transparent backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-gold tracking-tight flex items-center gap-2">
          <span aria-hidden>⛰</span> Kandy Day Planner
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`relative py-1 transition-colors hover:text-ink ${pathname === l.href ? "text-ink" : ""}`}>
              {l.label}
              {l.href === "/plan" && plan.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-gold text-bg font-bold">
                  {plan.length}
                </span>
              )}
              <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${pathname === l.href ? "w-full" : "w-0"}`} />
            </Link>
          ))}
        </nav>

        <button onClick={() => setOpen(!open)} className="sm:hidden text-ink w-9 h-9 flex flex-col items-center justify-center gap-1.5" aria-label="Toggle menu">
          <span className={`block w-5 h-px bg-ink transition-transform ${open ? "rotate-45 translate-y-[3px]" : ""}`} />
          <span className={`block w-5 h-px bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-ink transition-transform ${open ? "-rotate-45 -translate-y-[3px]" : ""}`} />
        </button>
      </div>

      <div className={`sm:hidden overflow-hidden transition-[max-height] duration-300 ${open ? "max-h-40" : "max-h-0"}`}>
        <nav className="flex flex-col gap-1 px-4 pb-4 text-sm font-medium text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2 border-b border-border/60 hover:text-ink">
              {l.label} {l.href === "/plan" && plan.length > 0 ? `(${plan.length})` : ""}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}