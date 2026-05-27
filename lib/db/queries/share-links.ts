import { and, desc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { db } from "../client";
import { shareLinks, type ShareLink, type NewShareLink } from "../schema/tables/share-links";

/** Slug builder. "<seller-initials>-<company-slug>" per spec USER FLOWS Flow 1. */
export function buildSlug(sellerName: string, companyName: string): string {
  const initials = sellerName
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toLowerCase())
    .filter(Boolean)
    .join("");
  const company = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${initials}-${company}`;
}

export async function createShareLink(
  input: Omit<NewShareLink, "id" | "slug"> & { slug?: string; sellerName: string },
): Promise<ShareLink> {
  const slug = input.slug ?? buildSlug(input.sellerName, input.prospectCompany);
  const { sellerName: _sellerName, ...rest } = input;
  const [row] = await db
    .insert(shareLinks)
    .values({ ...rest, id: uuidv7(), slug })
    .returning();
  if (!row) throw new Error("Failed to create share link");
  return row;
}

/** Prospect-facing lookup. Returns null for unknown or expired slugs. */
export async function getActiveShareLinkBySlug(slug: string): Promise<ShareLink | null> {
  const [row] = await db
    .select()
    .from(shareLinks)
    .where(
      and(
        eq(shareLinks.slug, slug),
        or(isNull(shareLinks.expiresAt), gt(shareLinks.expiresAt, sql`now()`)),
      ),
    )
    .limit(1);
  return row ?? null;
}

/** Seller-dashboard listing, newest first. */
export async function listShareLinksForUser(userId: string): Promise<ShareLink[]> {
  return db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.userId, userId))
    .orderBy(desc(shareLinks.createdAt));
}
