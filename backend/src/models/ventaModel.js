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

/** Días calendario inclusivos entre dos fechas YYYY-MM-DD. */
export function diasCalendarioInclusivos(desde, hasta) {
  const d0 = Date.parse(`${desde}T00:00:00.000Z`);
  const d1 = Date.parse(`${hasta}T00:00:00.000Z`);
  return Math.floor((d1 - d0) / 86400000) + 1;
}

/**
 * Promedio de unidades vendidas por día por producto en un rango (días calendario inclusivos).
 * Fórmula: suma(cantidad) / días del rango.
 */
export async function calcularPromedioUnidadesVendidasPorDiaPorProducto({
  desde,
  hasta,
  producto_id,
}) {
  const inicio = `${desde}T00:00:00.000Z`;
  const fin = `${hasta}T23:59:59.999Z`;
  const dias_calendario = diasCalendarioInclusivos(desde, hasta);

  let query = supabase
    .from("venta")
    .select("producto_id, cantidad, producto(sku, nombre)")
    .gte("fecha", inicio)
    .lte("fecha", fin);

  if (producto_id != null) {
    query = query.eq("producto_id", producto_id);
  }

  const { data, error } = await query;
  throwPg(error);

  const porProducto = new Map();

  for (const row of data ?? []) {
    const id = row.producto_id;
    const cantidad = Number(row.cantidad) || 0;
    const prev = porProducto.get(id);
    if (prev) {
      prev.unidades_vendidas += cantidad;
      prev.registros_venta += 1;
    } else {
      porProducto.set(id, {
        producto_id: id,
        producto_sku: row.producto?.sku ?? null,
        producto_nombre: row.producto?.nombre ?? null,
        unidades_vendidas: cantidad,
        registros_venta: 1,
      });
    }
  }

  const productos = [...porProducto.values()]
    .map((p) => ({
      ...p,
      promedio_unidades_por_dia: Number((p.unidades_vendidas / dias_calendario).toFixed(4)),
    }))
    .sort((a, b) => b.promedio_unidades_por_dia - a.promedio_unidades_por_dia);

  return { dias_calendario, productos };
}
