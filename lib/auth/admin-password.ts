import { timingSafeEqual } from "node:crypto";

// Constant-time comparison of a submitted password against ADMIN_PASSWORD.
// Extracted as a pure function so it's unit-testable and the timing-safe
// behavior is explicit. Returns false on any mismatch, empty input, or
// unset env — never throws.
export function isValidAdminPassword(
  submitted: unknown,
  expected: string | undefined = process.env.ADMIN_PASSWORD,
): boolean {
  if (typeof submitted !== "string" || submitted.length === 0) return false;
  if (!expected || expected.length === 0) return false;

  const a = Buffer.from(submitted, "utf8");
  const b = Buffer.from(expected, "utf8");
  // timingSafeEqual throws if lengths differ; compare lengths first but still
  // run a dummy compare so timing doesn't leak the length match/mismatch.
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}
