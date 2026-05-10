import pool from "../db/pool.js";

export async function listarProveedores() {
  const r = await pool.query(`
      SELECT p.id, p.nombre_comercial, p.ruc, p.representante_legal, p.documento_identidad,
             p.telefono, p.email, p.ciudad_id,
             c.nombre AS ciudad_nombre, pr.nombre AS provincia_nombre, pa.nombre AS pais_nombre
      FROM proveedor p
      JOIN ciudad c ON c.id = p.ciudad_id
      JOIN provincia pr ON pr.id = c.provincia_id
      JOIN pais pa ON pa.id = pr.pais_id
      ORDER BY p.nombre_comercial
    `);
  return r.rows;
}

export async function obtenerProveedor(id) {
  const r = await pool.query(
    `
      SELECT p.id, p.nombre_comercial, p.ruc, p.representante_legal, p.documento_identidad,
             p.telefono, p.email, p.ciudad_id,
             c.provincia_id, pr.pais_id
      FROM proveedor p
      JOIN ciudad c ON c.id = p.ciudad_id
      JOIN provincia pr ON pr.id = c.provincia_id
      WHERE p.id = $1
    `,
    [id]
  );
  return r.rows[0] ?? null;
}

export async function crearProveedor(body) {
  const r = await pool.query(
    `
      INSERT INTO proveedor (nombre_comercial, ruc, representante_legal, documento_identidad,
        telefono, email, ciudad_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
    [
      body.nombre_comercial.trim(),
      body.ruc.trim(),
      body.representante_legal.trim(),
      body.documento_identidad.trim(),
      body.telefono?.trim() || null,
      body.email?.trim() || null,
      body.ciudad_id,
    ]
  );
  return obtenerProveedor(r.rows[0].id);
}

export async function actualizarProveedor(id, body) {
  await pool.query(
    `
      UPDATE proveedor SET
        nombre_comercial = $1, ruc = $2, representante_legal = $3, documento_identidad = $4,
        telefono = $5, email = $6, ciudad_id = $7
      WHERE id = $8
    `,
    [
      body.nombre_comercial.trim(),
      body.ruc.trim(),
      body.representante_legal.trim(),
      body.documento_identidad.trim(),
      body.telefono?.trim() || null,
      body.email?.trim() || null,
      body.ciudad_id,
      id,
    ]
  );
  return obtenerProveedor(id);
}

export async function eliminarProveedor(id) {
  await pool.query("DELETE FROM proveedor WHERE id = $1", [id]);
}

export async function existeProveedor(id) {
  const r = await pool.query("SELECT id FROM proveedor WHERE id = $1", [id]);
  return r.rowCount > 0;
}
