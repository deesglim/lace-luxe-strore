"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
            Lace Luxe by Dee
          </span>
          <h1 className="mt-2 font-heading text-3xl text-espresso">
            Admin Login
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <p className="border border-bronze bg-blush/40 px-4 py-3 font-sans text-sm text-espresso">
              {error}
            </p>
          )}

          <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
            <span className="text-xs uppercase tracking-[0.15em] text-bronze">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
            <span className="text-xs uppercase tracking-[0.15em] text-bronze">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-ivory disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center font-sans text-xs text-charcoal/50">
          <Link href="/" className="underline underline-offset-4">
            Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
