"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/Toast";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/admin/dashboard");
        return;
      }
      setChecking(false);
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      toast("Login successful");
      router.push("/admin/dashboard");
    }
  };

  if (checking) {
    return (
      <div className="max-w-sm mx-auto mt-6">
        <p className="text-muted text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-jade-light hover:text-gold transition-colors mb-4">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Explore
      </Link>

      <div className="bg-surface border border-border rounded-xl p-6 animate-fade-up">
        <h1 className="font-display text-2xl text-ink mb-4">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
          />
          {error && <p className="text-terracotta text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-bg rounded-lg py-2 text-sm font-medium hover:bg-gold-hover disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-xs text-muted mt-4">
          Create an admin user in Supabase → Authentication → Users, then sign in here.
        </p>
      </div>
    </div>
  );
}