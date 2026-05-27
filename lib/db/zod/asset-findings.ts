import { z } from "zod";

// Per-probeType schemas. Discriminator is the surrounding probe_type column,
// not a field inside the JSON. .strict() rejects unknown keys so a payload
// from one probe type cannot masquerade as another. Phase 2 ships the floor;
// per-probe modules in /lib/probes/<probe>.ts will refine these via
// .extend or stricter per-probe Zod schemas when they land in Phase 4+.

// ─── Raw data (what we saw on the wire) ─────────────────────────────────────

const httpProbeRaw = z
  .object({
    statusCode: z.number().int().optional(),
    headers: z.record(z.string(), z.string()).optional(),
    bodyFingerprint: z.string().optional(),
    url: z.string().url().optional(),
  })
  .strict();

const tlsProbeRaw = z
  .object({
    statusCode: z.number().int().optional(),
    headers: z.record(z.string(), z.string()).optional(),
    bodyFingerprint: z.string().optional(),
    url: z.string().url().optional(),
    protocol: z.string().optional(),
    cipher: z.string().optional(),
    certIssuer: z.string().optional(),
    certNotBefore: z.string().optional(),
    certNotAfter: z.string().optional(),
    san: z.array(z.string()).optional(),
  })
  .strict();

const latencyProbeRaw = z
  .object({
    region: z.string(),
    samples: z.array(
      z.object({
        dnsMs: z.number(),
        tcpMs: z.number(),
        tlsMs: z.number(),
        ttfbMs: z.number(),
        totalMs: z.number(),
      }),
    ),
  })
  .strict();

export const assetFindingRawSchemasByProbe = {
  tls: tlsProbeRaw,
  waf: httpProbeRaw,
  api: httpProbeRaw,
  bot: httpProbeRaw,
  latency: latencyProbeRaw,
  bigip: httpProbeRaw,
  cloudnative: httpProbeRaw,
} as const;

// ─── Normalized findings (what the report renders) ──────────────────────────

const wafFinding = z
  .object({
    detected: z.boolean(),
    vendor: z.string().nullable(),
    confidence: z.enum(["high", "medium", "low"]).optional(),
    signatures: z.array(z.string()).optional(),
  })
  .strict();

const tlsFinding = z
  .object({
    protocolOk: z.boolean(),
    cipherOk: z.boolean(),
    certValidDays: z.number().nullable(),
    issuer: z.string().nullable(),
    weaknesses: z.array(z.string()).optional(),
  })
  .strict();

const apiFinding = z
  .object({
    exposedEndpoints: z.array(z.string()).optional(),
    authRequired: z.boolean().optional(),
    swaggerExposed: z.boolean().optional(),
  })
  .strict();

const botFinding = z
  .object({
    hasBotProtection: z.boolean(),
    vendor: z.string().nullable(),
    evidence: z.array(z.string()).optional(),
  })
  .strict();

const latencyFinding = z
  .object({
    p50Ms: z.number(),
    p95Ms: z.number(),
    worstRegion: z.string().optional(),
  })
  .strict();

const bigipFinding = z
  .object({
    detected: z.boolean(),
    evidence: z.array(z.string()).optional(),
    productHints: z.array(z.string()).optional(),
  })
  .strict();

const cloudNativeFinding = z
  .object({
    exposures: z.array(
      z.object({
        kind: z.string(),
        port: z.number().int().optional(),
        evidence: z.string().optional(),
      }),
    ),
  })
  .strict();

export const assetFindingResultSchemasByProbe = {
  waf: wafFinding,
  tls: tlsFinding,
  api: apiFinding,
  bot: botFinding,
  latency: latencyFinding,
  bigip: bigipFinding,
  cloudnative: cloudNativeFinding,
} as const;

export type ProbeTypeLiteral = keyof typeof assetFindingResultSchemasByProbe;

export type AssetFindingRaw =
  | z.infer<typeof httpProbeRaw>
  | z.infer<typeof tlsProbeRaw>
  | z.infer<typeof latencyProbeRaw>;

export type AssetFindingResult =
  | z.infer<typeof wafFinding>
  | z.infer<typeof tlsFinding>
  | z.infer<typeof apiFinding>
  | z.infer<typeof botFinding>
  | z.infer<typeof latencyFinding>
  | z.infer<typeof bigipFinding>
  | z.infer<typeof cloudNativeFinding>;

/** Validate raw probe data against the schema for its probe_type. */
export function parseAssetFindingRaw(probeType: ProbeTypeLiteral, data: unknown): AssetFindingRaw {
  return assetFindingRawSchemasByProbe[probeType].parse(data) as AssetFindingRaw;
}

/** Validate normalized finding data against the schema for its probe_type. */
export function parseAssetFindingResult(
  probeType: ProbeTypeLiteral,
  data: unknown,
): AssetFindingResult {
  return assetFindingResultSchemasByProbe[probeType].parse(data) as AssetFindingResult;
}
