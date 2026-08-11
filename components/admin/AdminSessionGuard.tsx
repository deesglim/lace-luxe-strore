"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// How often to re-verify the session while an admin tab just sits open
// with no focus/blur activity at all (e.g. on a second monitor).
const POLL_INTERVAL_MS = 30_000;

// The admin layout's is_admin check only runs once, at render time (a
// Server Component reading the request's cookies). Supabase's browser
// client stores its session in cookies shared across every tab of this
// origin, so signing into a different account ANYWHERE in the browser
// silently swaps the session for this tab too, without re-rendering
// anything here. The admin UI would stay mounted and interactive under
// what's now a non-admin session until a save actually hit the database
// and got blocked by RLS with a raw error.
//
// This deliberately does NOT ask the browser Supabase client "who's
// signed in right now" (supabase.auth.getUser()/getSession()) — that
// client caches its session in memory after first load and only
// re-reads storage on its own actions, so it would keep reporting the
// *original* admin even after the cookie underneath it changed. Instead
// this compares the raw cookie string directly (Supabase's auth cookies
// are set with httpOnly: false specifically so browser-side code can read
// them) against a snapshot taken at mount — any difference means the
// session changed since this page was authorized, so the server-rendered
// layout needs to re-run its is_admin check.
//
// Checked on window focus (the moment someone switches back to an
// already-open admin tab — the scenario that actually matters) and on a
// periodic timer as a backstop for a tab left open without ever losing
// focus. onAuthStateChange is also wired up for the fast path: actions
// this tab takes itself, plus SDK-driven sign-ins in sibling tabs that
// Supabase broadcasts directly.
export default function AdminSessionGuard({ adminUserId }: { adminUserId: string }) {
  const router = useRouter();
  const cookiesAtMount = useRef<string>(
    typeof document !== "undefined" ? document.cookie : "",
  );

  const checkSession = useCallback(() => {
    if (document.cookie !== cookiesAtMount.current) {
      cookiesAtMount.current = document.cookie;
      router.refresh();
    }
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id !== adminUserId) {
        router.refresh();
      }
    });

    window.addEventListener("focus", checkSession);
    const interval = setInterval(checkSession, POLL_INTERVAL_MS);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", checkSession);
      clearInterval(interval);
    };
  }, [adminUserId, checkSession, router]);

  return null;
}
