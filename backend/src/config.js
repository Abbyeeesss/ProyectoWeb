import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT) || 4000;
export const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "app.db");
