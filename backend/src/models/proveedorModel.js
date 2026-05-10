import db from "../db/database.js";

export function listarProveedores() {
  return db
    .prepare(`
      SELECT p.id, p.nombre_comercial, p.ruc, p.representante_legal, p.documento_identidad,
             p.telefono, p.email, p.ciudad_id,
             c.nombre AS ciudad_nombre, pr.nombre AS provincia_nombre, pa.nombre AS pais_nombre
      FROM proveedor p
      JOIN ciudad c ON c.id = p.ciudad_id
      JOIN provincia pr ON pr.id = c.provincia_id
      JOIN pais pa ON pa.id = pr.pais_id
      ORDER BY p.nombre_comercial
    `)
    .all();
}

export function obtenerProveedor(id) {
  return db
    .prepare(`
      SELECT p.id, p.nombre_comercial, p.ruc, p.representante_legal, p.documento_identidad,
             p.telefono, p.email, p.ciudad_id,
             c.provincia_id, pr.pais_id
      FROM proveedor p
      JOIN ciudad c ON c.id = p.ciudad_id
      JOIN provincia pr ON pr.id = c.provincia_id
      WHERE p.id = ?
    `)
    .get(id);
}

export function crearProveedor(body) {
  const r = db
    .prepare(`
      INSERT INTO proveedor (nombre_comercial, ruc, representante_legal, documento_identidad,
        telefono, email, ciudad_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      body.nombre_comercial.trim(),
      body.ruc.trim(),
      body.representante_legal.trim(),
      body.documento_identidad.trim(),
      body.telefono?.trim() || null,
      body.email?.trim() || null,
      body.ciudad_id
    );
  return obtenerProveedor(r.lastInsertRowid);
}

export function actualizarProveedor(id, body) {
  db.prepare(`
      UPDATE proveedor SET
        nombre_comercial = ?, ruc = ?, representante_legal = ?, documento_identidad = ?,
        telefono = ?, email = ?, ciudad_id = ?
      WHERE id = ?
    `).run(
    body.nombre_comercial.trim(),
    body.ruc.trim(),
    body.representante_legal.trim(),
    body.documento_identidad.trim(),
    body.telefono?.trim() || null,
    body.email?.trim() || null,
    body.ciudad_id,
    id
  );
  return obtenerProveedor(id);
}

export function eliminarProveedor(id) {
  db.prepare("DELETE FROM proveedor WHERE id = ?").run(id);
}

export function existeProveedor(id) {
  return Boolean(db.prepare("SELECT id FROM proveedor WHERE id = ?").get(id));
}
