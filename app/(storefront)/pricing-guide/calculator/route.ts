import { NextResponse, type NextRequest } from "next/server";
import {
  buildCalculatorHtml,
  hasPricingGuideAccess,
  registerPricingGuideSession,
} from "@/lib/pricingGuide";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

function signedOutPage(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Signed out on this device</title></head>
<body style="margin:0;font-family:system-ui,sans-serif;background:#fff;color:#121014;display:grid;place-items:center;min-height:100vh;padding:24px;box-sizing:border-box">
<main style="max-width:420px;text-align:center;display:flex;flex-direction:column;gap:14px">
<h1 style="margin:0;font-size:24px">This device was signed out</h1>
<p style="margin:0;color:#5d5566;line-height:1.5">Your Hair Service Pricing Guide was opened on another device. It works on two devices at a time, so the oldest one is signed out.</p>
<p style="margin:0;color:#5d5566;line-height:1.5">Sign in again to use it here.</p>
<a href="/login?redirect=/pricing-guide/calculator" style="align-self:center;background:#121014;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">Sign in again</a>
</main></body></html>`;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.redirect(new URL("/login?redirect=/pricing-guide/calculator", request.url));
  }

  if (!(await hasPricingGuideAccess(user.id))) {
    return NextResponse.redirect(new URL("/pricing-guide", request.url));
  }

  const { data: claimsData } = await supabase.auth.getClaims();
  const sessionId = claimsData?.claims?.session_id;
  if (!sessionId) {
    return NextResponse.redirect(new URL("/login?redirect=/pricing-guide/calculator", request.url));
  }

  const sessionState = await registerPricingGuideSession(user.id, String(sessionId));
  if (sessionState === "revoked") {
    // Sign this browser out so "Sign in again" starts a fresh session.
    await supabase.auth.signOut({ scope: "local" });
    return new Response(signedOutPage(), { status: 403, headers: PRIVATE_HEADERS });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const html = buildCalculatorHtml({ name: profile?.full_name ?? null, email: user.email });
  return new Response(html, { status: 200, headers: PRIVATE_HEADERS });
}
