"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Show = (msg: string, type?: "ok" | "err") => void;
const T = createContext<Show>(() => {});
export const useToast = () => useContext(T);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [t, setT] = useState<{ msg: string; type: string } | null>(null);
  const show = useCallback<Show>((msg, type = "ok") => {
    setT({ msg, type });
    setTimeout(() => setT(null), 3000);
  }, []);
  return (
    <T.Provider value={show}>
      {children}
      {t && (
        <div className="fixed inset-x-0 bottom-6 z-[2000] flex justify-center pointer-events-none px-4">
          <div className={`animate-fade-up rounded-xl px-5 py-3 text-sm font-medium shadow-2xl ${t.type === "err" ? "bg-terracotta text-bg" : "bg-gold text-bg"}`}>{t.msg}</div>
        </div>
      )}
    </T.Provider>
  );
}