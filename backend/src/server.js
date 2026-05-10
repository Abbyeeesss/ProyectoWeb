import express from "express";
import cors from "cors";
import { PORT } from "./config.js";
import { initSchema } from "./db/initSchema.js";
import apiRoutes from "./routes/index.js";

await initSchema();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "abastecimiento-admin-api", db: "postgresql" });
});

app.use("/api", apiRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

app.listen(PORT, () => {
  console.log(`API administración escuchando en http://localhost:${PORT}`);
});
