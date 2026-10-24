import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next 16's dev-only Server Components HMR cache ignores `cache:
    // "no-store"` on fetch — without this, auth.getUser()'s call to
    // Supabase's /auth/v1/user (session-scoped, must never be cached) gets
    // cached across users during local dev, sometimes serving one signed-in
    // user's session to a *different* user's request. Doesn't affect
    // production (next build), where this cache doesn't exist.
    serverComponentsHmrCache: false,
  },
};

export default nextConfig;
