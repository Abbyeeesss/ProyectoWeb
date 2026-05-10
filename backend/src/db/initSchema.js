import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Crea tablas si no existen (idempotente). Seguro ejecutar en cada arranque. */
export async function initSchema() {
  const file = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(file, "utf8");
  await pool.query(sql);
}
