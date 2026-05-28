import { describe, it, expect } from "vitest";
import { isValidAdminPassword } from "@/lib/auth/admin-password";

describe("isValidAdminPassword", () => {
  const SECRET = "correct horse battery staple";

  it("accepts the exact password", () => {
    expect(isValidAdminPassword(SECRET, SECRET)).toBe(true);
  });

  it("rejects a wrong password of the same length", () => {
    const wrong = "x".repeat(SECRET.length);
    expect(isValidAdminPassword(wrong, SECRET)).toBe(false);
  });

  it("rejects a wrong password of a different length", () => {
    expect(isValidAdminPassword("short", SECRET)).toBe(false);
    expect(isValidAdminPassword(SECRET + "extra", SECRET)).toBe(false);
  });

  it("rejects empty / non-string input", () => {
    expect(isValidAdminPassword("", SECRET)).toBe(false);
    expect(isValidAdminPassword(undefined, SECRET)).toBe(false);
    expect(isValidAdminPassword(null, SECRET)).toBe(false);
    expect(isValidAdminPassword(12345, SECRET)).toBe(false);
  });

  it("rejects everything when the expected password is unset", () => {
    expect(isValidAdminPassword("anything", undefined)).toBe(false);
    expect(isValidAdminPassword("anything", "")).toBe(false);
  });
});
