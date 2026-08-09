import { createHmac, timingSafeEqual } from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

type InitializeTransactionResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

/**
 * Starts a Paystack transaction and returns the hosted checkout URL to
 * redirect the customer to. `amountNaira` is in naira; Paystack expects the
 * smallest currency unit (kobo), so it's converted here.
 */
export async function initializePaystackTransaction(params: {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<InitializeTransactionResult> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountNaira * 100),
      currency: "NGN",
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
    }),
  });

  const body = await response.json();

  if (!response.ok || !body.status) {
    throw new Error(body.message || "Failed to initialize Paystack transaction");
  }

  return {
    authorizationUrl: body.data.authorization_url,
    accessCode: body.data.access_code,
    reference: body.data.reference,
  };
}

export type PaystackVerifyResult = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
};

/**
 * Server-to-server confirmation of a transaction's real status/amount.
 * Paystack recommends this in addition to signature-checking the webhook —
 * it's the authoritative source, rather than trusting the webhook payload's
 * fields at face value.
 */
export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerifyResult> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getSecretKey()}` },
    },
  );

  const body = await response.json();

  if (!response.ok || !body.status) {
    throw new Error(body.message || "Failed to verify Paystack transaction");
  }

  return {
    status: body.data.status,
    reference: body.data.reference,
    amount: body.data.amount,
    currency: body.data.currency,
  };
}

/**
 * Verifies the `x-paystack-signature` header against the raw request body.
 * Must be called with the raw (unparsed) body text — HMAC is sensitive to
 * exact bytes, so re-serializing parsed JSON would produce a different hash
 * and always fail. Uses a timing-safe comparison to avoid leaking match
 * progress through response-time differences.
 */
export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;

  const expected = createHmac("sha512", getSecretKey()).update(rawBody).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");

  if (expectedBuffer.length !== actualBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
