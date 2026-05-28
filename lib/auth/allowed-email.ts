// The @f5.com rule. Per ADR-005/ADR-009, seller profiles must be real F5
// people, so their contact email must be @f5.com. Extracted as a pure,
// env-independent function so the business rule is tested in one place.
//
// (This previously also gated magic-link sign-in with a non-prod allowlist;
// that flow was removed when auth moved to the admin-password gate — ADR-009.)

const F5_DOMAIN_RE = /^[^@]+@f5\.com$/i;

export function isF5Email(email: string): boolean {
  return F5_DOMAIN_RE.test(email.trim().toLowerCase());
}
