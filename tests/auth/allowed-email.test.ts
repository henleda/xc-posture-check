import { describe, it, expect } from "vitest";
import { isAllowedEmail } from "@/lib/auth/allowed-email";

describe("isAllowedEmail", () => {
  it("accepts @f5.com in production (any case)", () => {
    expect(isAllowedEmail("dan@f5.com", { nodeEnv: "production" })).toBe(true);
    expect(isAllowedEmail("DAN@F5.COM", { nodeEnv: "production" })).toBe(true);
    expect(isAllowedEmail("  dan@f5.com  ", { nodeEnv: "production" })).toBe(true);
  });

  it("rejects non-@f5.com in production even if listed in DEV_AUTH_ALLOWLIST", () => {
    // Per ADR-005: the allowlist must NOT be honored in production. This is
    // the rule that makes the env var safe to set across all environments.
    expect(
      isAllowedEmail("eve@evil.com", {
        nodeEnv: "production",
        devAllowlist: "eve@evil.com,dan@utexas.edu",
      }),
    ).toBe(false);
  });

  it("rejects f5-lookalike domains", () => {
    expect(isAllowedEmail("dan@f5.io", { nodeEnv: "production" })).toBe(false);
    expect(isAllowedEmail("dan@f5.com.evil.com", { nodeEnv: "production" })).toBe(false);
    expect(isAllowedEmail("dan@notf5.com", { nodeEnv: "production" })).toBe(false);
  });

  it("honors DEV_AUTH_ALLOWLIST in non-production (case- and whitespace-insensitive)", () => {
    expect(
      isAllowedEmail("Dan@Utexas.EDU", {
        nodeEnv: "development",
        devAllowlist: "  dan@utexas.edu , foo@bar.com",
      }),
    ).toBe(true);
  });

  it("rejects in non-production when not on allowlist", () => {
    expect(
      isAllowedEmail("rando@example.com", {
        nodeEnv: "development",
        devAllowlist: "dan@utexas.edu",
      }),
    ).toBe(false);
  });

  it("rejects in non-production when allowlist is empty/undefined", () => {
    expect(isAllowedEmail("anyone@example.com", { nodeEnv: "development" })).toBe(false);
    expect(
      isAllowedEmail("anyone@example.com", { nodeEnv: "development", devAllowlist: "" }),
    ).toBe(false);
  });
});
