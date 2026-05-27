import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import { getDb } from "@/lib/db/client";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";
import { isAllowedEmail } from "@/lib/auth/allowed-email";
import authConfig from "./auth.config";

const RESEND_FROM = "XC Posture Check <hello@f5evolution.com>";

// DrizzleAdapter inspects the db object's shape to detect the dialect; the
// lazy Proxy from lib/db/client trips that check (#auth.js dialect-detection
// returns "object"). Calling getDb() here gives the adapter a real Drizzle
// handle. This forces eager init when auth.ts is imported, but auth.ts is
// only in the import graph for routes that need DB anyway (dashboard, sign-in
// callback). Static homepage + /r/[slug] continue to use the lazy Proxy.
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: RESEND_FROM,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;
      return isAllowedEmail(user.email);
    },
    async session({ session, user }) {
      // Expose the seller's user id on session.user.id so server actions and
      // RSC layouts can read it without an extra DB roundtrip.
      session.user.id = user.id;
      return session;
    },
  },
});
