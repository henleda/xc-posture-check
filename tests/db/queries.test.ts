import { describe, it, expect, beforeEach } from "vitest";
import { buildSlug } from "@/lib/db/queries/share-links";
import { UserDomainNotAllowedError } from "@/lib/db/queries/users";
import { parseEventMetadata } from "@/lib/db/zod/events";
import { parseInventoryFinding } from "@/lib/db/zod/inventory-findings";

describe("share-links.buildSlug", () => {
  it("composes initials + kebab company", () => {
    expect(buildSlug("Dan Henley", "Acme Industries")).toBe("dh-acme-industries");
  });

  it("strips punctuation from the company segment", () => {
    expect(buildSlug("Dan Henley", "Acme, Inc.")).toBe("dh-acme-inc");
  });

  it("caps very long company names", () => {
    const long = "a".repeat(100);
    const slug = buildSlug("Dan Henley", long);
    expect(slug.length).toBeLessThanOrEqual(2 + 1 + 40);
  });

  it("handles single-word seller names", () => {
    expect(buildSlug("Madonna", "Vogue")).toBe("m-vogue");
  });
});

describe("users.UserDomainNotAllowedError", () => {
  it("carries the offending email in the message", () => {
    const err = new UserDomainNotAllowedError("eve@evil.com");
    expect(err.message).toContain("eve@evil.com");
    expect(err.name).toBe("UserDomainNotAllowedError");
  });
});

describe("events.parseEventMetadata", () => {
  it("accepts a well-formed scan_started payload", () => {
    expect(() =>
      parseEventMetadata("scan_started", { apexDomain: "acme.com", source: "share_link" }),
    ).not.toThrow();
  });

  it("rejects scan_started payloads missing required fields", () => {
    expect(() => parseEventMetadata("scan_started", { apexDomain: "acme.com" })).toThrow();
  });

  it("rejects scan_started payloads with unknown keys (no masquerade)", () => {
    expect(() =>
      parseEventMetadata("scan_started", {
        apexDomain: "acme.com",
        source: "direct",
        sneakyExtraField: true,
      }),
    ).toThrow();
  });
});

describe("inventory-findings.parseInventoryFinding", () => {
  it("accepts a well-formed cloud_distribution payload", () => {
    expect(() =>
      parseInventoryFinding("cloud_distribution", {
        totalAssets: 47,
        byProvider: [
          { provider: "AWS", category: "cloud", count: 23, percent: 48.9 },
          { provider: "Cloudflare", category: "edge", count: 7, percent: 14.9 },
        ],
      }),
    ).not.toThrow();
  });

  it("rejects fragmentation_matrix payloads with the wrong weight literal", () => {
    expect(() =>
      parseInventoryFinding("fragmentation_matrix", {
        fragmentationIndex: 72,
        matrix: {
          waf: { distinctCount: 4, weight: 99 },
          cdn: { distinctCount: 3, weight: 25 },
          certIssuer: { distinctCount: 2, weight: 15 },
          tlsProfile: { distinctCount: 5, weight: 15 },
          securityHeaders: { distinctCount: 6, weight: 15 },
        },
        formulaVersion: "v1",
      }),
    ).toThrow();
  });
});
