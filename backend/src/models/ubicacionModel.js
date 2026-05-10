import db from "../db/database.js";

export function listarPaises() {
  return db.prepare("SELECT id, nombre FROM pais ORDER BY nombre").all();
}

export function listarProvinciasPorPais(paisId) {
  return db
    .prepare("SELECT id, nombre FROM provincia WHERE pais_id = ? ORDER BY nombre")
    .all(paisId);
}

export function listarCiudadesPorProvincia(provinciaId) {
  return db
    .prepare("SELECT id, nombre FROM ciudad WHERE provincia_id = ? ORDER BY nombre")
    .all(provinciaId);
}

export function existeCiudad(id) {
  const row = db.prepare("SELECT id FROM ciudad WHERE id = ?").get(id);
  return Boolean(row);
}
