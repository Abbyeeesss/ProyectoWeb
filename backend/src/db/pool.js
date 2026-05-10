import pg from "pg";
import { DATABASE_URL } from "../config.js";

const { Pool } = pg;

/** Supabase y hosts cloud suelen exigir TLS; Postgres local normalmente no */
function sslOption(url) {
  if (!url) return false;
  if (/localhost|127\.0\.0\.1/i.test(url)) return false;
  return { rejectUnauthorized: false };
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: sslOption(DATABASE_URL),
  max: 12,
});

export default pool;
