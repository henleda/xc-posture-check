import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Middleware runs in the edge runtime; we wire up Auth.js with the edge-safe
// config only (no Drizzle adapter, no Node-only deps). The authorized
// callback in auth.config.ts decides whether the request is permitted.

export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  // Match the seller-only path prefixes. /api/auth is excluded because the
  // route handler must respond to NextAuth's own POST/GET regardless of auth
  // state (e.g., the sign-in callback URL).
  matcher: ["/dashboard/:path*", "/share-links/:path*"],
};
