import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const databaseUrl = process.env.NEON_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("NEON_DATABASE_URL is required at runtime.");
}

const sql = neon(databaseUrl);
export const db = drizzle(sql);
