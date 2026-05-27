import { desc, eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { db } from "../client";
import { events, type Event, type NewEvent } from "../schema/tables/events";
import { parseEventMetadata, type EventMetadata, type EventTypeLiteral } from "../zod/events";

/**
 * Record a telemetry event. Validates metadata against the per-event_type
 * Zod schema so we never persist a payload shaped like a different event.
 */
export async function recordEvent(
  input: Omit<NewEvent, "id" | "metadata"> & { metadata?: EventMetadata },
): Promise<Event> {
  if (input.metadata !== undefined) {
    parseEventMetadata(input.eventType as EventTypeLiteral, input.metadata);
  }
  const [row] = await db
    .insert(events)
    .values({ ...input, id: uuidv7() })
    .returning();
  if (!row) throw new Error("Failed to record event");
  return row;
}

export async function listEventsForAssessment(assessmentId: string): Promise<Event[]> {
  return db
    .select()
    .from(events)
    .where(eq(events.assessmentId, assessmentId))
    .orderBy(desc(events.createdAt));
}

export async function listEventsForShareLink(shareLinkId: string): Promise<Event[]> {
  return db
    .select()
    .from(events)
    .where(eq(events.shareLinkId, shareLinkId))
    .orderBy(desc(events.createdAt));
}
