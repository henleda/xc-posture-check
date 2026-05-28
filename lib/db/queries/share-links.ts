import { and, desc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { db } from "../client";
import { shareLinks, type ShareLink, type NewShareLink } from "../schema/tables/share-links";
import { users } from "../schema/tables/users";

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

export type ShareLinkWithSeller = ShareLink & { sellerName: string | null };

/**
 * Admin-dashboard listing: every share link with its seller's display name,
 * newest first. The admin (single ADMIN_PASSWORD gate per ADR-009) sees all
 * links, not just their own.
 */
export async function listAllShareLinks(): Promise<ShareLinkWithSeller[]> {
  const rows = await db
    .select({ link: shareLinks, sellerName: users.name })
    .from(shareLinks)
    .leftJoin(users, eq(shareLinks.userId, users.id))
    .orderBy(desc(shareLinks.createdAt));
  return rows.map((r) => ({ ...r.link, sellerName: r.sellerName }));
}
