import express from "express";
import cors from "cors";
import { PORT } from "./config.js";
import apiRoutes from "./routes/index.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "abastecimiento-admin-api",
    db: "supabase-js",
    revision: "service-role-api",
  });
});

app.use("/api", apiRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

const server = app.listen(PORT, () => {
  console.log(`API administración escuchando en http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nPuerto ${PORT} ya está en uso. Hay otra instancia del API corriendo.\n` +
        `Cierra la otra terminal o ejecuta en PowerShell:\n` +
        `  Get-NetTCPConnection -LocalPort ${PORT} -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n`,
    );
    process.exit(1);
  }
  throw err;
});
