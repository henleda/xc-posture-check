import type { NextAuthConfig } from "next-auth";

// Edge-safe Auth.js config. Imported by middleware.ts (which runs in the edge
// runtime and can't load the Drizzle adapter) AND by auth.ts (which extends
// this with the adapter + providers).
//
// Keep this file free of:
// - Database imports (the adapter belongs in auth.ts)
// - Node-only APIs
// - Provider constructors that pull in heavy deps

const SELLER_PROTECTED_PREFIXES = ["/dashboard", "/share-links"];

const authConfig = {
  pages: { signIn: "/signin" },
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const isProtected = SELLER_PROTECTED_PREFIXES.some((p) => path.startsWith(p));
      if (!isProtected) return true;
      return !!auth?.user;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

export default authConfig;
