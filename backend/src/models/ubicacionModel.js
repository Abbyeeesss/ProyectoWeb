import pool from "../db/pool.js";

export async function listarPaises() {
  const r = await pool.query("SELECT id, nombre FROM pais ORDER BY nombre");
  return r.rows;
}

export async function listarProvinciasPorPais(paisId) {
  const r = await pool.query(
    "SELECT id, nombre FROM provincia WHERE pais_id = $1 ORDER BY nombre",
    [paisId]
  );
  return r.rows;
}

export async function listarCiudadesPorProvincia(provinciaId) {
  const r = await pool.query(
    "SELECT id, nombre FROM ciudad WHERE provincia_id = $1 ORDER BY nombre",
    [provinciaId]
  );
  return r.rows;
}

export async function existeCiudad(id) {
  const r = await pool.query("SELECT id FROM ciudad WHERE id = $1", [id]);
  return r.rowCount > 0;
}
