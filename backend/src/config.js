import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

export const PORT = Number(process.env.PORT) || 4000;

export const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
export const SUPABASE_KEY = (
  process.env.SUPABASE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
)?.trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "[config] Faltan SUPABASE_URL y/o SUPABASE_KEY. En desarrollo: backend/.env. En Render/u otros hosts: Environment Variables del servicio (mismo nombre de variable)."
  );
  process.exit(1);
}
