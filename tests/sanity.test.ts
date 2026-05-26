import { describe, it, expect } from "vitest";

describe("toolchain sanity", () => {
  it("vitest is wired up", () => {
    expect(1 + 1).toBe(2);
  });
});
