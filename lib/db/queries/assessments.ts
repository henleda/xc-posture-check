import { desc, eq, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { db } from "../client";
import {
  assessments,
  type Assessment,
  type NewAssessment,
} from "../schema/tables/assessments";

export async function createAssessment(
  input: Omit<NewAssessment, "id" | "status" | "progressPercent">,
): Promise<Assessment> {
  const [row] = await db
    .insert(assessments)
    .values({ ...input, id: uuidv7() })
    .returning();
  if (!row) throw new Error("Failed to create assessment");
  return row;
}

export async function getAssessmentById(id: string): Promise<Assessment | null> {
  const [row] = await db.select().from(assessments).where(eq(assessments.id, id)).limit(1);
  return row ?? null;
}

export async function listAssessmentsForShareLink(shareLinkId: string): Promise<Assessment[]> {
  return db
    .select()
    .from(assessments)
    .where(eq(assessments.shareLinkId, shareLinkId))
    .orderBy(desc(assessments.createdAt));
}

/**
 * Orchestrator progress update. Called from Inngest workers as each phase
 * advances. Touches only status/phase/progress columns so it's safe to call
 * concurrently with the actual probe writes (which target child tables).
 */
export async function updateAssessmentProgress(
  id: string,
  patch: Pick<NewAssessment, "status" | "phase" | "progressPercent">,
): Promise<void> {
  await db
    .update(assessments)
    .set({ ...patch, updatedAt: sql`now()` })
    .where(eq(assessments.id, id));
}

/** Mark assessment terminal. Sets completedAt and locks in computed scores. */
export async function finalizeAssessment(
  id: string,
  patch: Pick<
    NewAssessment,
    | "status"
    | "overallGrade"
    | "fragmentationIndex"
    | "totalAssetsDiscovered"
    | "totalAssetsProbed"
  >,
): Promise<void> {
  await db
    .update(assessments)
    .set({
      ...patch,
      completedAt: sql`now()`,
      progressPercent: 100,
      updatedAt: sql`now()`,
    })
    .where(eq(assessments.id, id));
}
