import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type SignupRequestBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// Creates the account via the admin API (email_confirm: true — same
// auto-confirm choice checkout's "create an account" flow already makes,
// since this app has no email-verification step) rather than the client's
// plain auth.signUp(), so this reliably yields a signed-in session
// regardless of the project's email-confirmation setting. Then signs in
// through the cookie-bound client so the response carries a real session.
export async function POST(request: NextRequest) {
  let body: SignupRequestBody;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const fullName = body.fullName?.trim();
  const email = body.email?.trim().toLowerCase();
  const phone = body.phone?.trim();
  const password = body.password;

  if (!fullName || !email || !phone || !password) {
    return badRequest("Please fill in all fields.");
  }
  if (password.length < 6) {
    return badRequest("Password must be at least 6 characters.");
  }

  const supabaseAdmin = createAdminClient();

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    const message = createError?.message ?? "";
    if (message.toLowerCase().includes("already")) {
      return badRequest("An account with this email already exists. Try logging in instead.");
    }
    console.error("signup: admin.createUser failed", createError);
    return NextResponse.json(
      { error: "Could not create your account. Please try again." },
      { status: 500 },
    );
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({ phone })
    .eq("id", created.user.id);
  if (profileError) {
    console.error("signup: failed to save phone on profile", profileError);
  }

  const cookieClient = await createClient();
  const { error: signInError } = await cookieClient.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    console.error("signup: post-create sign-in failed", signInError);
    return NextResponse.json(
      { error: "Account created, but sign-in failed. Please log in." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
