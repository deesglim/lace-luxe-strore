// Postgres/PostgREST's signature for a write blocked by Row Level Security:
// error code "42501" (insufficient_privilege), message mentioning "row-level
// security policy". Surfacing that raw text to an admin reads as a broken
// app rather than what it almost always actually is — the browser's
// Supabase session no longer belongs to an admin (e.g. it changed in
// another tab), and the database correctly refused the write. AdminSessionGuard
// closes most of that window by forcing a re-check the moment the session
// changes, but this is the fallback for whatever's left — the write attempt
// that lands in the gap between the swap and the guard's refresh.
export function friendlyAdminErrorMessage(
  error: { code?: string; message?: string } | null | undefined,
  fallback: string,
): string {
  if (!error) return fallback;

  const isRlsViolation =
    error.code === "42501" ||
    error.message?.toLowerCase().includes("row-level security policy");

  if (isRlsViolation) {
    return "You don't have permission to do this — you may be logged in with a different account than expected. Please refresh the page and make sure you're signed in as an admin.";
  }

  return error.message || fallback;
}
