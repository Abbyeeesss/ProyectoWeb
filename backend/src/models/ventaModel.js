import { supabase } from "../db/supabase.js";

function throwPg(error) {
  if (!error) return;
  const err = new Error(error.message);
  err.code = error.code;
  throw err;
}

const ventaSelect =
  "id, producto_id, cantidad, precio_unitario, fecha, producto(sku, nombre, categoria_id, categoria(nombre))";

function flattenVenta(row) {
  const total = Number(row.cantidad) * Number(row.precio_unitario);
  return {
    id: row.id,
    producto_id: row.producto_id,
    cantidad: row.cantidad,
    precio_unitario: row.precio_unitario,
    total: Number.isFinite(total) ? total : null,
    fecha: row.fecha,
    producto_sku: row.producto?.sku ?? null,
    producto_nombre: row.producto?.nombre ?? null,
    categoria_nombre: row.producto?.categoria?.nombre ?? null,
  };
}

/**
 * Consulta el historial de ventas en Supabase filtrado por rango de fechas (inclusive).
 * @param {{ desde: string, hasta: string, producto_id?: number }} params
 *   - desde / hasta: formato ISO date `YYYY-MM-DD`
 *   - producto_id: opcional, filtra por un producto
 * @returns {Promise<object[]>}
 */
export async function consultarHistorialVentasPorRango({ desde, hasta, producto_id }) {
  const inicio = `${desde}T00:00:00.000Z`;
  const fin = `${hasta}T23:59:59.999Z`;

  let query = supabase
    .from("venta")
    .select(ventaSelect)
    .gte("fecha", inicio)
    .lte("fecha", fin)
    .order("fecha", { ascending: false });

  if (producto_id != null) {
    query = query.eq("producto_id", producto_id);
  }

  const { data, error } = await query;
  throwPg(error);
  return (data ?? []).map(flattenVenta);
}
