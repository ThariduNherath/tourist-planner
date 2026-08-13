import type { Metadata } from "next";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { PlanProvider } from "@/components/PlanContext";

export const metadata: Metadata = {
  title: "Kandy Day Visit Planner",
  description: "Plan a one-day visit to places of interest near Nugawela, Kandy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PlanProvider>
          <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="font-bold text-lg text-emerald-700">
                🌿 Kandy Day Planner
              </Link>
              <nav className="flex gap-4 text-sm font-medium text-slate-600">
                <Link href="/" className="hover:text-emerald-700">Explore</Link>
                <Link href="/plan" className="hover:text-emerald-700">My Plan</Link>
                <Link href="/admin/login" className="hover:text-emerald-700">Admin</Link>
              </nav>
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
          <footer className="text-center text-xs text-slate-400 py-8">
            ITE2953 Programming Group Project — Local Tourist Day-Visit Planner
          </footer>
        </PlanProvider>
      </body>
    </html>
  );
}
