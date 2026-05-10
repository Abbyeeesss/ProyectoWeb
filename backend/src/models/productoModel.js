import pool from "../db/pool.js";

export async function listarProductos() {
  const r = await pool.query(`
      SELECT pr.id, pr.sku, pr.nombre, pr.proveedor_id, pr.categoria_id,
             pr.precio_referencia, pr.es_perecedero, pr.stock_actual, pr.dias_lead_time,
             pv.nombre_comercial AS proveedor_nombre,
             c.nombre AS categoria_nombre
      FROM producto pr
      JOIN proveedor pv ON pv.id = pr.proveedor_id
      JOIN categoria c ON c.id = pr.categoria_id
      ORDER BY pr.nombre
    `);
  return r.rows;
}

export async function obtenerProducto(id) {
  const r = await pool.query(
    `
      SELECT pr.id, pr.sku, pr.nombre, pr.proveedor_id, pr.categoria_id,
             pr.precio_referencia, pr.es_perecedero, pr.stock_actual, pr.dias_lead_time
      FROM producto pr WHERE pr.id = $1
    `,
    [id]
  );
  return r.rows[0] ?? null;
}

export async function crearProducto(body) {
  const r = await pool.query(
    `
      INSERT INTO producto (sku, nombre, proveedor_id, categoria_id, precio_referencia,
        es_perecedero, stock_actual, dias_lead_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `,
    [
      body.sku.trim(),
      body.nombre.trim(),
      body.proveedor_id,
      body.categoria_id,
      Number(body.precio_referencia) || 0,
      Boolean(body.es_perecedero),
      Number(body.stock_actual) || 0,
      Math.max(1, Number(body.dias_lead_time) || 7),
    ]
  );
  return obtenerProducto(r.rows[0].id);
}

export async function actualizarProducto(id, body) {
  await pool.query(
    `
      UPDATE producto SET
        sku = $1, nombre = $2, proveedor_id = $3, categoria_id = $4, precio_referencia = $5,
        es_perecedero = $6, stock_actual = $7, dias_lead_time = $8
      WHERE id = $9
    `,
    [
      body.sku.trim(),
      body.nombre.trim(),
      body.proveedor_id,
      body.categoria_id,
      Number(body.precio_referencia) || 0,
      Boolean(body.es_perecedero),
      Number(body.stock_actual) || 0,
      Math.max(1, Number(body.dias_lead_time) || 7),
      id,
    ]
  );
  return obtenerProducto(id);
}

export async function eliminarProducto(id) {
  await pool.query("DELETE FROM producto WHERE id = $1", [id]);
}
