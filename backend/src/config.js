import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

export const PORT = Number(process.env.PORT) || 4000;

/** Cadena URI PostgreSQL de Supabase (pestaña Database → Connection string → URI). */
export const DATABASE_URL = process.env.DATABASE_URL?.trim();

if (!DATABASE_URL) {
  console.error(
    "[config] Falta DATABASE_URL. Cree backend/.env (vea .env.example) con la URI de su proyecto Supabase."
  );
  process.exit(1);
}
