/**
 * Datos demo en PostgreSQL (Supabase).
 * Ejecutar: npm run init-db
 * Si ya hay país "Ecuador", no inserta nada (idempotente por contenido).
 */
import "../config.js";
import { initSchema } from "../db/initSchema.js";
import pool from "../db/pool.js";

await initSchema();

const countRes = await pool.query("SELECT COUNT(*)::int AS n FROM pais");
if (countRes.rows[0].n > 0) {
  console.log('La base ya tiene datos en "pais". Omitiendo seed.');
  await pool.end();
  process.exit(0);
}

const client = await pool.connect();
try {
  await client.query("BEGIN");

  await client.query("INSERT INTO pais (nombre) VALUES ($1)", ["Ecuador"]);
  const { rows: pRows } = await client.query("SELECT id FROM pais WHERE nombre = $1", [
    "Ecuador",
  ]);
  const paisId = pRows[0].id;

  const provincias = ["Pichincha", "Guayas", "Azuay"];
  for (const nombre of provincias) {
    await client.query("INSERT INTO provincia (pais_id, nombre) VALUES ($1, $2)", [
      paisId,
      nombre,
    ]);
  }

  const { rows: prPi } = await client.query(
    "SELECT id FROM provincia WHERE nombre = $1 AND pais_id = $2",
    ["Pichincha", paisId]
  );
  const { rows: prGu } = await client.query(
    "SELECT id FROM provincia WHERE nombre = $1 AND pais_id = $2",
    ["Guayas", paisId]
  );
  const pichincha = prPi[0].id;
  const guayas = prGu[0].id;

  const ciudades = [
    [pichincha, "Quito"],
    [pichincha, "Cayambe"],
    [guayas, "Guayaquil"],
    [guayas, "Durán"],
  ];
  for (const [pid, nombre] of ciudades) {
    await client.query("INSERT INTO ciudad (provincia_id, nombre) VALUES ($1, $2)", [
      pid,
      nombre,
    ]);
  }

  const { rows: qRow } = await client.query("SELECT id FROM ciudad WHERE nombre = $1", ["Quito"]);
  const { rows: gRow } = await client.query("SELECT id FROM ciudad WHERE nombre = $1", [
    "Guayaquil",
  ]);
  const idQuito = qRow[0].id;
  const idGye = gRow[0].id;

  await client.query("INSERT INTO categoria (nombre, descripcion) VALUES ($1, $2)", [
    "Abarrotes",
    "Productos secos y despensa",
  ]);
  await client.query("INSERT INTO categoria (nombre, descripcion) VALUES ($1, $2)", [
    "Frutas y verduras",
    "Perecederos — alta frecuencia de reposición",
  ]);
  await client.query("INSERT INTO categoria (nombre, descripcion) VALUES ($1, $2)", [
    "Bebidas",
    "Sin alcohol",
  ]);

  const { rows: cA } = await client.query("SELECT id FROM categoria WHERE nombre = $1", [
    "Abarrotes",
  ]);
  const { rows: cFV } = await client.query("SELECT id FROM categoria WHERE nombre = $1", [
    "Frutas y verduras",
  ]);
  const catAbarrotes = cA[0].id;
  const catFV = cFV[0].id;

  await client.query(
    `
    INSERT INTO proveedor (nombre_comercial, ruc, representante_legal, documento_identidad,
      telefono, email, ciudad_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `,
    [
      "Distribuidora Centro",
      "0928175967001",
      "Maria Vallejo",
      "1712345675",
      "0991112223",
      "contacto@distcentro.demo",
      idQuito,
    ]
  );

  await client.query(
    `
    INSERT INTO proveedor (nombre_comercial, ruc, representante_legal, documento_identidad,
      telefono, email, ciudad_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `,
    [
      "Importadora Sur Pacifico S.A.",
      "1793765432007",
      "Carlos Mendez",
      "0928175967",
      "042987654",
      "ventas@surpacifico.demo",
      idGye,
    ]
  );

  const { rows: p1 } = await client.query(
    "SELECT id FROM proveedor WHERE nombre_comercial = $1",
    ["Distribuidora Centro"]
  );
  const { rows: p2 } = await client.query(
    "SELECT id FROM proveedor WHERE nombre_comercial = $1",
    ["Importadora Sur Pacifico S.A."]
  );
  const pid1 = p1[0].id;
  const pid2 = p2[0].id;

  await client.query(
    `
    INSERT INTO producto (sku, nombre, proveedor_id, categoria_id, precio_referencia,
      es_perecedero, stock_actual, dias_lead_time)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `,
    ["SKU-ARROZ-1", "Arroz 1 kg", pid1, catAbarrotes, 1.25, false, 40, 5]
  );

  await client.query(
    `
    INSERT INTO producto (sku, nombre, proveedor_id, categoria_id, precio_referencia,
      es_perecedero, stock_actual, dias_lead_time)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `,
    ["SKU-TOM-01", "Tomate kg", pid2, catFV, 0.85, true, 12, 3]
  );

  await client.query("COMMIT");
  console.log("Seed completado en PostgreSQL.");
} catch (e) {
  await client.query("ROLLBACK");
  console.error(e);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
