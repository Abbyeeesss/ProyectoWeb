import pool from "../db/pool.js";

export async function listarCategorias() {
  const r = await pool.query("SELECT id, nombre, descripcion FROM categoria ORDER BY nombre");
  return r.rows;
}

export async function obtenerCategoria(id) {
  const r = await pool.query("SELECT id, nombre, descripcion FROM categoria WHERE id = $1", [id]);
  return r.rows[0] ?? null;
}

export async function crearCategoria({ nombre, descripcion }) {
  const r = await pool.query(
    `INSERT INTO categoria (nombre, descripcion) VALUES ($1, $2)
     RETURNING id, nombre, descripcion`,
    [nombre.trim(), descripcion?.trim() ?? null]
  );
  return r.rows[0];
}

export async function actualizarCategoria(id, { nombre, descripcion }) {
  await pool.query("UPDATE categoria SET nombre = $1, descripcion = $2 WHERE id = $3", [
    nombre.trim(),
    descripcion?.trim() ?? null,
    id,
  ]);
  return obtenerCategoria(id);
}

export async function eliminarCategoria(id) {
  await pool.query("DELETE FROM categoria WHERE id = $1", [id]);
}
