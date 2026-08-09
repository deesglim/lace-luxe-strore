"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const inputClass =
  "border border-charcoal/20 bg-ivory px-3 py-2 font-sans text-sm text-charcoal focus:border-espresso focus:outline-none";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not create your account.");
        setLoading(false);
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Could not create your account. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-ivory px-6 py-20">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-bronze">
            Lace Luxe by Dee
          </span>
          <h1 className="mt-2 font-heading text-3xl text-espresso">
            Create Your Account
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
              Full Name
            </span>
            <input
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </label>

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
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
            <span className="text-xs uppercase tracking-[0.15em] text-bronze">
              Phone
            </span>
            <input
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 font-sans text-sm text-charcoal">
            <span className="text-xs uppercase tracking-[0.15em] text-bronze">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-espresso px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-ivory disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center font-sans text-sm text-charcoal/70">
          Already have an account?{" "}
          <Link href="/login" className="text-bronze underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
