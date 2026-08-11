// Marketing sync only — never on the critical path. Every export here must
// never throw: a missing API key, a slow/erroring MailerLite API, or a
// malformed response should be logged and swallowed, not allowed to break
// the checkout/newsletter flow that's calling it.

const MAILERLITE_BASE_URL = "https://connect.mailerlite.com/api";
const REQUEST_TIMEOUT_MS = 8000;

function getApiKey(): string | null {
  return process.env.MAILERLITE_API_KEY || null;
}

type UpsertSubscriberParams = {
  email: string;
  name?: string | null;
  phone?: string | null;
  groupId: string;
};

/**
 * Upserts a subscriber into a MailerLite group — creates them if they're
 * new, or updates them if they already exist. Per MailerLite's own docs,
 * POST /subscribers's `groups` array is additive-only ("subscriber can
 * only be added to groups this way and will not be removed by omission"),
 * so this never strips a subscriber out of any group they're already in —
 * it only ever adds the one group passed here.
 *
 * Returns the subscriber's MailerLite id on success (needed for a
 * follow-up group-removal call, e.g. moving someone out of
 * "Checkout Started" once they've paid), or null if the sync didn't happen
 * for any reason — callers should treat null as "skip, no id to act on"
 * rather than an error to surface.
 */
export async function upsertMailerLiteSubscriber({
  email,
  name,
  phone,
  groupId,
}: UpsertSubscriberParams): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("MailerLite sync skipped: MAILERLITE_API_KEY is not set");
    return null;
  }

  try {
    const response = await fetch(`${MAILERLITE_BASE_URL}/subscribers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        fields: {
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
        },
        groups: [groupId],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(
        `MailerLite upsert failed (${response.status}) for group ${groupId}:`,
        body,
      );
      return null;
    }

    const json = await response.json();
    return json?.data?.id ?? null;
  } catch (error) {
    console.error("MailerLite upsert threw", error);
    return null;
  }
}

type RemoveFromGroupParams = {
  subscriberId: string;
  groupId: string;
};

/**
 * Unassigns a subscriber from a single group (DELETE
 * /subscribers/:id/groups/:id — MailerLite's dedicated single-group
 * removal endpoint) without deleting the subscriber or touching any other
 * group they belong to. Same never-throws contract as
 * upsertMailerLiteSubscriber above.
 */
export async function removeMailerLiteSubscriberFromGroup({
  subscriberId,
  groupId,
}: RemoveFromGroupParams): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("MailerLite group removal skipped: MAILERLITE_API_KEY is not set");
    return;
  }

  try {
    const response = await fetch(
      `${MAILERLITE_BASE_URL}/subscribers/${subscriberId}/groups/${groupId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );

    // 204 on success. MailerLite also returns 404 if the subscriber was
    // never in this group to begin with — not worth logging as an error
    // since the end state we wanted (not in the group) already holds.
    if (!response.ok && response.status !== 404) {
      const body = await response.text().catch(() => "");
      console.error(
        `MailerLite group removal failed (${response.status}) for group ${groupId}:`,
        body,
      );
    }
  } catch (error) {
    console.error("MailerLite group removal threw", error);
  }
}
