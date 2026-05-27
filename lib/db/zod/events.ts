import { z } from "zod";

// Per-event-type schemas. The discriminator is the surrounding event_type
// column, not a field inside the JSON, so callers must dispatch to the right
// schema based on the event_type they're writing. Use parseEventMetadata to
// pick the schema and validate in one step. .strict() rejects unknown keys —
// without it, a payload shaped like one event type can silently masquerade as
// another that happens to have fewer required fields.

const linkClicked = z
  .object({
    referrer: z.string().optional(),
    userAgent: z.string().optional(),
    ipHash: z.string().optional(),
    country: z.string().optional(),
  })
  .strict();

const scanStarted = z
  .object({
    apexDomain: z.string(),
    source: z.enum(["direct", "share_link"]),
  })
  .strict();

const scanCompleted = z
  .object({
    durationMs: z.number().int().nonnegative(),
    totalAssets: z.number().int().nonnegative(),
    fragmentationIndex: z.number().int().min(0).max(100),
    overallGrade: z.string(),
  })
  .strict();

const scanFailed = z
  .object({
    durationMs: z.number().int().nonnegative(),
    failedPhase: z.string(),
    errorMessage: z.string(),
  })
  .strict();

const pdfDownloaded = z
  .object({
    sizeBytes: z.number().int().positive(),
    pages: z.number().int().positive().optional(),
  })
  .strict();

const meetingBooked = z
  .object({
    calendarProvider: z.string(),
    bookingId: z.string().optional(),
  })
  .strict();

const assetDrilldown = z
  .object({
    assetId: z.string().uuid(),
    hostname: z.string(),
  })
  .strict();

export const eventMetadataSchemasByType = {
  link_clicked: linkClicked,
  scan_started: scanStarted,
  scan_completed: scanCompleted,
  scan_failed: scanFailed,
  pdf_downloaded: pdfDownloaded,
  meeting_booked: meetingBooked,
  asset_drilldown: assetDrilldown,
} as const;

export type EventTypeLiteral = keyof typeof eventMetadataSchemasByType;

export type EventMetadata =
  | z.infer<typeof linkClicked>
  | z.infer<typeof scanStarted>
  | z.infer<typeof scanCompleted>
  | z.infer<typeof scanFailed>
  | z.infer<typeof pdfDownloaded>
  | z.infer<typeof meetingBooked>
  | z.infer<typeof assetDrilldown>;

/** Validate a metadata payload against the schema for its event_type. */
export function parseEventMetadata(eventType: EventTypeLiteral, data: unknown): EventMetadata {
  return eventMetadataSchemasByType[eventType].parse(data) as EventMetadata;
}
