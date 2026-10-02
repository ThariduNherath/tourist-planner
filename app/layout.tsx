import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { PlanProvider } from "@/components/PlanContext";
import { PlacesProvider } from "@/components/DataContext";
import { ToastProvider } from "@/components/Toast";
import NavBar from "@/components/NavBar";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600"] });
const body = Manrope({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Kandy Day Visit Planner",
  description: "Plan a one-day visit to places of interest near Nugawela, Kandy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="text-ink min-h-screen">
        <ToastProvider>
          <PlacesProvider>
            <PlanProvider>
              <NavBar />
              <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
              <footer className="text-center text-xs text-muted py-10 border-t border-border mt-10">
                ITE2953 Programming Group Project — Local Tourist Day-Visit Planner
              </footer>
            </PlanProvider>
          </PlacesProvider>
        </ToastProvider>
      </body>
    </html>
  );
}