"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/admin/dashboard");
  };

  return (
    <div className="max-w-sm mx-auto mt-6 bg-surface border border-border rounded-xl p-6 animate-fade-up">
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
  );
}