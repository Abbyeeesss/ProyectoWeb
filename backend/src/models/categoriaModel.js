import db from "../db/database.js";

export function listarCategorias() {
  return db.prepare("SELECT id, nombre, descripcion FROM categoria ORDER BY nombre").all();
}

export function obtenerCategoria(id) {
  return db.prepare("SELECT id, nombre, descripcion FROM categoria WHERE id = ?").get(id);
}

export function crearCategoria({ nombre, descripcion }) {
  const r = db
    .prepare("INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)")
    .run(nombre.trim(), descripcion?.trim() ?? null);
  return obtenerCategoria(r.lastInsertRowid);
}

export function actualizarCategoria(id, { nombre, descripcion }) {
  db.prepare("UPDATE categoria SET nombre = ?, descripcion = ? WHERE id = ?").run(
    nombre.trim(),
    descripcion?.trim() ?? null,
    id
  );
  return obtenerCategoria(id);
}

export function eliminarCategoria(id) {
  db.prepare("DELETE FROM categoria WHERE id = ?").run(id);
}
