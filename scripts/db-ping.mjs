// One-off connectivity probe. Loads .env.local exactly like drizzle.config.ts,
// then runs SELECT 1 against the configured Neon URL. Prints the host + a
// masked credential so we can see which branch we're hitting without leaking
// the password. Not part of the build.
import { config } from "dotenv";
config({ path: ".env.local" });

const url = process.env.NEON_DATABASE_URL ?? "";
const masked = url.replace(/(\/\/[^:]+:)[^@]+(@)/, "$1***$2");
const host = (url.match(/@([^/]+)/) || [])[1] ?? "(none)";
console.log("Connecting to:", masked);
console.log("Host:", host);

const { neon } = await import("@neondatabase/serverless");
try {
  const sql = neon(url);
  const rows = await sql`select 1 as ok, current_user, current_database()`;
  console.log("OK:", rows);
} catch (e) {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
}
