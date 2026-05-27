import { describe, it, expect, beforeEach, vi } from "vitest";

describe("lib/db/client lazy initialization", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEON_DATABASE_URL;
  });

  it("does not throw at import time when NEON_DATABASE_URL is missing", async () => {
    await expect(import("@/lib/db/client")).resolves.toBeDefined();
  });

  it("throws on first property access if env is still missing", async () => {
    const mod = await import("@/lib/db/client");
    expect(() => mod.getDb()).toThrow(/NEON_DATABASE_URL/);
  });

  it("does not throw on first access when env is set", async () => {
    process.env.NEON_DATABASE_URL = "postgresql://test:test@localhost/test?sslmode=require";
    const mod = await import("@/lib/db/client");
    expect(() => mod.getDb()).not.toThrow();
  });
});
