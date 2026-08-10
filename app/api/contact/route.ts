import { NextResponse, type NextRequest } from "next/server";
import { sendContactFormNotificationEmail } from "@/lib/email";

export const runtime = "nodejs";

type ContactRequestBody = {
  name?: string;
  email?: string;
  message?: string;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  let body: ContactRequestBody;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();

  if (!name) return badRequest("Please enter your name.");
  if (!email) return badRequest("Please enter your email address.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest("Please enter a valid email address.");
  }
  if (!message) return badRequest("Please enter a message.");

  try {
    await sendContactFormNotificationEmail({ name, email, message });
  } catch (emailError) {
    console.error("Failed to send contact form email", emailError);
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
