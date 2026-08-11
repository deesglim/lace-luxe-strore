import { NextResponse, type NextRequest } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { upsertMailerLiteSubscriber } from "@/lib/mailerlite";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// Routed through the server (rather than inserting from the client
// directly) because sending the welcome email needs the Resend key, which
// can't live in browser code.
export async function POST(request: NextRequest) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return badRequest("Email is required.");
  }

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from("newsletter_subscribers").insert({ email });

  if (error) {
    const isDuplicate =
      error.code === "23505" ||
      error.message.toLowerCase().includes("duplicate") ||
      error.message.toLowerCase().includes("unique");

    if (isDuplicate) {
      return NextResponse.json({ alreadySubscribed: true });
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  try {
    await sendWelcomeEmail({ toEmail: email });
  } catch (emailError) {
    // Don't fail the signup over email delivery — the subscription is
    // already correctly recorded.
    console.error("Failed to send newsletter welcome email", emailError);
  }

  const newsletterGroupId = process.env.MAILERLITE_GROUP_NEWSLETTER;
  if (newsletterGroupId) {
    // Marketing sync — never blocks/fails the signup response, see
    // lib/mailerlite.ts's own error handling.
    await upsertMailerLiteSubscriber({ email, groupId: newsletterGroupId });
  }

  return NextResponse.json({ alreadySubscribed: false });
}
