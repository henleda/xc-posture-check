import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

type Db = ReturnType<typeof drizzle>;

let _db: Db | null = null;

function init(): Db {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new Error(
      "NEON_DATABASE_URL is required for database access. Set it in .env.local or the Vercel project env.",
    );
  }
  return drizzle(neon(url));
}

// Lazy proxy: importing this module never touches process.env. The first
// property access on `db` initializes the connection. Lets prod builds
// succeed when env is empty so long as nothing actually queries the DB at
// build time (e.g. static page generation that doesn't read user data).
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    if (!_db) _db = init();
    return Reflect.get(_db, prop, receiver);
  },
});

// Explicit accessor for code that prefers a function over a proxy.
export function getDb(): Db {
  if (!_db) _db = init();
  return _db;
}
