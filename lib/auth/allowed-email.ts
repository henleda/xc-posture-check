// Email-domain guard for the NextAuth signIn callback. Extracted so it can
// be unit-tested independently of the NextAuth setup.
//
// Per DECISIONS.md ADR-005: production accepts only @f5.com. Non-prod
// honors DEV_AUTH_ALLOWLIST (comma-separated emails) so the builder and
// non-F5 reviewers can sign in to preview deploys without an F5 mailbox.

const F5_DOMAIN_RE = /^[^@]+@f5\.com$/i;

export function isAllowedEmail(
  email: string,
  env: { nodeEnv?: string; devAllowlist?: string } = {
    nodeEnv: process.env.NODE_ENV,
    devAllowlist: process.env.DEV_AUTH_ALLOWLIST,
  },
): boolean {
  const lower = email.trim().toLowerCase();
  if (F5_DOMAIN_RE.test(lower)) return true;
  if (env.nodeEnv === "production") return false;
  const allow = (env.devAllowlist ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(lower);
}
