import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { isValidAdminPassword } from "@/lib/auth/admin-password";
import authConfig from "./auth.config";

// Phase 3b auth: single admin gate, password-based, JWT sessions.
//
// Magic-link email auth (Phase 3) was abandoned — F5's mail system hard-blocks
// the f5evolution.com sending domain (550 5.7.1), so links never reached
// @f5.com sellers. See DECISIONS.md ADR-009. Seller self-service via Microsoft
// Entra ID SSO is the planned post-alpha path. For the alpha, the admin (Dan +
// PMM) signs in with ADMIN_PASSWORD and provisions share links centrally;
// sellers don't log in — they're co-branding profiles the admin manages.
//
// No Drizzle adapter here: Credentials + JWT sessions don't persist sessions
// to the DB. The accounts/sessions/verification_tokens tables are now unused
// (left in place; dropping them is a separate deliberate migration).

const ADMIN_USER = { id: "admin", name: "Admin" } as const;

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Admin password",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        if (isValidAdminPassword(credentials?.password)) {
          return { ...ADMIN_USER };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid && session.user) {
        session.user.id = String(token.uid);
      }
      return session;
    },
  },
});
