import { eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { db } from "../client";
import { users, type User, type NewUser } from "../schema/tables/users";
import { isF5Email } from "@/lib/auth/allowed-email";

export class UserDomainNotAllowedError extends Error {
  constructor(email: string) {
    super(`Email ${email} is not an @f5.com address`);
    this.name = "UserDomainNotAllowedError";
  }
}

/** Look up a seller by email. Returns null when no row exists. */
export async function getUserByEmail(email: string): Promise<User | null> {
  const [row] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return row ?? null;
}

/**
 * Create a seller record. Used from the NextAuth signIn callback after the
 * @f5.com check passes; we still re-check here so the function is safe to
 * call from any caller (defense in depth — the DB CHECK is the third line).
 */
export async function createUser(input: Omit<NewUser, "id">): Promise<User> {
  const normalizedEmail = input.email.toLowerCase();
  if (!isF5Email(normalizedEmail)) {
    throw new UserDomainNotAllowedError(normalizedEmail);
  }
  const [row] = await db
    .insert(users)
    .values({ ...input, email: normalizedEmail, id: uuidv7() })
    .returning();
  if (!row) throw new Error("Failed to create user");
  return row;
}

/**
 * Upsert convenience: get-or-create by email.
 */
export async function ensureUser(input: Omit<NewUser, "id">): Promise<User> {
  const existing = await getUserByEmail(input.email);
  if (existing) return existing;
  return createUser(input);
}

/**
 * List seller profiles for the admin dashboard's share-link creation form.
 * Sellers are users the admin creates for co-branding; they do not log in
 * (auth is the single admin gate — see ADR-009). Ordered by name.
 */
export async function listSellers(): Promise<User[]> {
  return db.select().from(users).orderBy(users.name);
}
