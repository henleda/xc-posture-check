import type { Config } from "drizzle-kit";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const databaseUrl = process.env.NEON_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("NEON_DATABASE_URL is required for drizzle-kit. Set it in .env.local.");
}

export default {
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
} satisfies Config;
