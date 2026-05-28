import { describe, it, expect } from "vitest";
import { isF5Email } from "@/lib/auth/allowed-email";

describe("isF5Email", () => {
  it("accepts @f5.com (any case, surrounding whitespace)", () => {
    expect(isF5Email("dan@f5.com")).toBe(true);
    expect(isF5Email("DAN@F5.COM")).toBe(true);
    expect(isF5Email("  dan@f5.com  ")).toBe(true);
  });

  it("rejects f5-lookalike domains", () => {
    expect(isF5Email("dan@f5.io")).toBe(false);
    expect(isF5Email("dan@f5.com.evil.com")).toBe(false);
    expect(isF5Email("dan@notf5.com")).toBe(false);
    expect(isF5Email("dan@f5evolution.com")).toBe(false);
  });

  it("rejects malformed input", () => {
    expect(isF5Email("")).toBe(false);
    expect(isF5Email("dan")).toBe(false);
    expect(isF5Email("@f5.com")).toBe(false);
  });
});
