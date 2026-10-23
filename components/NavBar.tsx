"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlan } from "@/components/PlanContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/places", label: "Places" },
  { href: "/map", label: "Map" },
  { href: "/plan", label: "My Plan" },
  { href: "/admin/login", label: "Admin" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { items } = usePlan();
  const navRef = useRef<HTMLElement | null>(null);

  // Route වෙනස් වන විට මෙනුව ස්වයංක්‍රීයව වසන්න
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // මෙනුවට පිටතින් ක්ලික් කළහොත් මෙනුව වසන්න
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <header
      ref={navRef}
      className="no-print sticky top-0 z-50 bg-transparent backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl text-gold tracking-tight flex items-center gap-2"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-gold flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M3 20 L9 8 L13 15 L16 10 L21 20 Z"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx="17" cy="6" r="2" fill="currentColor" stroke="none" />
          </svg>
          Kandy Day Planner
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-muted">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative py-1 transition-colors hover:text-ink ${
                pathname === l.href ? "text-ink" : ""
              }`}
            >
              {l.label}
              {l.href === "/plan" && items.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-gold text-bg font-bold">
                  {items.length}
                </span>
              )}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                  pathname === l.href ? "w-full" : "w-0"
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Hamburger Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden text-ink w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-ink transition-all duration-300 origin-center ${
              open ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-ink transition-all duration-300 ${
              open ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-ink transition-all duration-300 origin-center ${
              open ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`sm:hidden absolute top-full left-0 right-0 overflow-hidden transition-all duration-300 ease-in-out bg-surface border-b border-border/40 shadow-xl ${
          open ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 text-sm font-medium text-muted">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center justify-between py-3 border-b border-border/60 transition-colors hover:text-ink ${
                  isActive ? "text-ink font-semibold" : ""
                }`}
              >
                <span>{l.label}</span>
                {l.href === "/plan" && items.length > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full bg-gold text-bg font-bold">
                    {items.length} Places
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}