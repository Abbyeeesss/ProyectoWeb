/**
 * Carga datos demo (ubicación, categorías, proveedores, productos).
 * Ejecutar: npm run init-db
 * Para repetir: elimine el archivo configurado en DB_PATH (por defecto backend/data/app.db).
 */
import db, { initSchema } from "../db/database.js";

initSchema();

const run = db.transaction(() => {
  const countPais = db.prepare("SELECT COUNT(*) AS n FROM pais").get().n;
  if (countPais > 0) {
    console.log("La base ya contiene datos. Elimine data/app.db si desea volver a sembrar.");
    return;
  }

  db.prepare("INSERT INTO pais (nombre) VALUES (?)").run("Ecuador");

  const paisId = db.prepare("SELECT id FROM pais WHERE nombre = ?").get("Ecuador").id;

  const provincias = [["Pichincha"], ["Guayas"], ["Azuay"]];
  const insProv = db.prepare("INSERT INTO provincia (pais_id, nombre) VALUES (?, ?)");
  for (const [nombre] of provincias) {
    insProv.run(paisId, nombre);
  }

  const pichincha = db.prepare("SELECT id FROM provincia WHERE nombre = ?").get("Pichincha").id;
  const guayas = db.prepare("SELECT id FROM provincia WHERE nombre = ?").get("Guayas").id;

  const ciudades = [
    [pichincha, "Quito"],
    [pichincha, "Cayambe"],
    [guayas, "Guayaquil"],
    [guayas, "Durán"],
  ];
  const insCiudad = db.prepare("INSERT INTO ciudad (provincia_id, nombre) VALUES (?, ?)");
  for (const [pid, nombre] of ciudades) {
    insCiudad.run(pid, nombre);
  }

  const idQuito = db.prepare("SELECT id FROM ciudad WHERE nombre = ?").get("Quito").id;
  const idGye = db.prepare("SELECT id FROM ciudad WHERE nombre = ?").get("Guayaquil").id;

  db.prepare(
    "INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)"
  ).run("Abarrotes", "Productos secos y despensa");
  db.prepare(
    "INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)"
  ).run("Frutas y verduras", "Perecederos — alta frecuencia de reposición");
  db.prepare(
    "INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)"
  ).run("Bebidas", "Sin alcohol");

  const catAbarrotes = db.prepare("SELECT id FROM categoria WHERE nombre = ?").get("Abarrotes").id;
  const catFV = db.prepare("SELECT id FROM categoria WHERE nombre = ?").get("Frutas y verduras").id;

  db.prepare(`
    INSERT INTO proveedor (nombre_comercial, ruc, representante_legal, documento_identidad,
      telefono, email, ciudad_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    "Distribuidora Centro",
    "0928175967001",
    "María Vallejo",
    "1712345675",
    "0991112223",
    "contacto@distcentro.demo",
    idQuito
  );

  db.prepare(`
    INSERT INTO proveedor (nombre_comercial, ruc, representante_legal, documento_identidad,
      telefono, email, ciudad_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    "Importadora Sur Pacífico S.A.",
    "1793765432007",
    "Carlos Méndez",
    "0928175967",
    "042987654",
    "ventas@surpacifico.demo",
    idGye
  );

  const pid1 = db.prepare("SELECT id FROM proveedor WHERE nombre_comercial = ?").get("Distribuidora Centro").id;
  const pid2 = db.prepare("SELECT id FROM proveedor WHERE nombre_comercial = ?").get("Importadora Sur Pacífico S.A.").id;

  db.prepare(`
    INSERT INTO producto (sku, nombre, proveedor_id, categoria_id, precio_referencia,
      es_perecedero, stock_actual, dias_lead_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run("SKU-ARROZ-1", "Arroz 1 kg", pid1, catAbarrotes, 1.25, 0, 40, 5);

  db.prepare(`
    INSERT INTO producto (sku, nombre, proveedor_id, categoria_id, precio_referencia,
      es_perecedero, stock_actual, dias_lead_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run("SKU-TOM-01", "Tomate kg", pid2, catFV, 0.85, 1, 12, 3);

  console.log("Seed completado.");
});

run();
