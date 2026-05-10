import db from "../db/database.js";

export function listarProductos() {
  return db
    .prepare(`
      SELECT pr.id, pr.sku, pr.nombre, pr.proveedor_id, pr.categoria_id,
             pr.precio_referencia, pr.es_perecedero, pr.stock_actual, pr.dias_lead_time,
             pv.nombre_comercial AS proveedor_nombre,
             c.nombre AS categoria_nombre
      FROM producto pr
      JOIN proveedor pv ON pv.id = pr.proveedor_id
      JOIN categoria c ON c.id = pr.categoria_id
      ORDER BY pr.nombre
    `)
    .all();
}

export function obtenerProducto(id) {
  return db
    .prepare(`
      SELECT pr.id, pr.sku, pr.nombre, pr.proveedor_id, pr.categoria_id,
             pr.precio_referencia, pr.es_perecedero, pr.stock_actual, pr.dias_lead_time
      FROM producto pr WHERE pr.id = ?
    `)
    .get(id);
}

export function crearProducto(body) {
  const r = db
    .prepare(`
      INSERT INTO producto (sku, nombre, proveedor_id, categoria_id, precio_referencia,
        es_perecedero, stock_actual, dias_lead_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      body.sku.trim(),
      body.nombre.trim(),
      body.proveedor_id,
      body.categoria_id,
      Number(body.precio_referencia) || 0,
      body.es_perecedero ? 1 : 0,
      Number(body.stock_actual) || 0,
      Math.max(1, Number(body.dias_lead_time) || 7)
    );
  return obtenerProducto(r.lastInsertRowid);
}

export function actualizarProducto(id, body) {
  db.prepare(`
      UPDATE producto SET
        sku = ?, nombre = ?, proveedor_id = ?, categoria_id = ?, precio_referencia = ?,
        es_perecedero = ?, stock_actual = ?, dias_lead_time = ?
      WHERE id = ?
    `).run(
    body.sku.trim(),
    body.nombre.trim(),
    body.proveedor_id,
    body.categoria_id,
    Number(body.precio_referencia) || 0,
    body.es_perecedero ? 1 : 0,
    Number(body.stock_actual) || 0,
    Math.max(1, Number(body.dias_lead_time) || 7),
    id
  );
  return obtenerProducto(id);
}

export function eliminarProducto(id) {
  db.prepare("DELETE FROM producto WHERE id = ?").run(id);
}
