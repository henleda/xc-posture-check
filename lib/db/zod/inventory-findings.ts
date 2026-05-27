import { z } from "zod";

// Per-inventoryFindingType schemas. Discriminator is the surrounding
// finding_type column, not a field inside the JSON. .strict() rejects unknown
// keys so a payload from one finding type cannot masquerade as another.

const cloudDistribution = z
  .object({
    totalAssets: z.number().int().nonnegative(),
    byProvider: z.array(
      z.object({
        provider: z.string(),
        category: z.enum(["cloud", "cdn", "edge", "hosting", "isp", "unmapped"]),
        count: z.number().int().nonnegative(),
        percent: z.number().min(0).max(100),
      }),
    ),
    byCountry: z
      .array(
        z.object({
          country: z.string(),
          count: z.number().int().nonnegative(),
        }),
      )
      .optional(),
  })
  .strict();

const fragmentationMatrix = z
  .object({
    fragmentationIndex: z.number().int().min(0).max(100),
    matrix: z.object({
      waf: z.object({ distinctCount: z.number().int(), weight: z.literal(30) }),
      cdn: z.object({ distinctCount: z.number().int(), weight: z.literal(25) }),
      certIssuer: z.object({ distinctCount: z.number().int(), weight: z.literal(15) }),
      tlsProfile: z.object({ distinctCount: z.number().int(), weight: z.literal(15) }),
      securityHeaders: z.object({ distinctCount: z.number().int(), weight: z.literal(15) }),
    }),
    formulaVersion: z.string(),
  })
  .strict();

const coverageMatrix = z
  .object({
    groups: z.array(
      z.object({
        cloudProvider: z.string(),
        assets: z.array(
          z.object({
            assetId: z.string().uuid(),
            hostname: z.string(),
            waf: z.boolean(),
            bot: z.boolean(),
            api: z.boolean(),
            tls: z.boolean(),
            latencyOk: z.boolean(),
          }),
        ),
      }),
    ),
    shadowItCount: z.number().int().nonnegative(),
    highValueGapCount: z.number().int().nonnegative(),
  })
  .strict();

const f5Footprint = z
  .object({
    bigipCount: z.number().int().nonnegative(),
    xcDetected: z.boolean(),
    detections: z.array(
      z.object({
        assetId: z.string().uuid(),
        hostname: z.string(),
        product: z.string(),
        evidence: z.array(z.string()),
      }),
    ),
  })
  .strict();

export const inventoryFindingSchemasByType = {
  cloud_distribution: cloudDistribution,
  fragmentation_matrix: fragmentationMatrix,
  coverage_matrix: coverageMatrix,
  f5_footprint: f5Footprint,
} as const;

export type InventoryFindingTypeLiteral = keyof typeof inventoryFindingSchemasByType;

export type CloudDistribution = z.infer<typeof cloudDistribution>;
export type FragmentationMatrix = z.infer<typeof fragmentationMatrix>;
export type CoverageMatrix = z.infer<typeof coverageMatrix>;
export type F5Footprint = z.infer<typeof f5Footprint>;

export type InventoryFindingData =
  | CloudDistribution
  | FragmentationMatrix
  | CoverageMatrix
  | F5Footprint;

/** Validate a finding data payload against the schema for its finding_type. */
export function parseInventoryFinding(
  findingType: InventoryFindingTypeLiteral,
  data: unknown,
): InventoryFindingData {
  return inventoryFindingSchemasByType[findingType].parse(data) as InventoryFindingData;
}
