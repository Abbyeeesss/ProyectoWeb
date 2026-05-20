import { supabase } from "../db/supabase.js";

export function redondear2(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

function throwPg(error) {
  if (!error) return;
  const err = new Error(error.message);
  err.code = error.code;
  throw err;
}

const ventaSelect =
  "id, producto_id, cantidad, precio_unitario, fecha, producto(sku, nombre, categoria_id, categoria(nombre))";

function flattenVenta(row) {
  const total = redondear2(Number(row.cantidad) * Number(row.precio_unitario));
  return {
    id: row.id,
    producto_id: row.producto_id,
    cantidad: redondear2(row.cantidad),
    precio_unitario: redondear2(row.precio_unitario),
    total: Number.isFinite(total) ? total : null,
    fecha: row.fecha,
    producto_sku: row.producto?.sku ?? null,
    producto_nombre: row.producto?.nombre ?? null,
    categoria_nombre: row.producto?.categoria?.nombre ?? null,
  };
}

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

export function diasCalendarioInclusivos(desde, hasta) {
  const d0 = Date.parse(`${desde}T00:00:00.000Z`);
  const d1 = Date.parse(`${hasta}T00:00:00.000Z`);
  return Math.floor((d1 - d0) / 86400000) + 1;
}

export function listarDiasCalendario(desde, hasta) {
  const dias = [];
  const cursor = new Date(`${desde}T00:00:00.000Z`);
  const fin = Date.parse(`${hasta}T00:00:00.000Z`);
  while (cursor.getTime() <= fin) {
    dias.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dias;
}

export function desviacionEstandarPoblacional(valores) {
  const n = valores.length;
  if (n === 0) return 0;
  const media = valores.reduce((a, b) => a + b, 0) / n;
  const varianza = valores.reduce((s, x) => s + (x - media) ** 2, 0) / n;
  return Math.sqrt(varianza);
}

export async function calcularDesviacionEstandarVentasPorProducto({
  desde,
  hasta,
  producto_id,
}) {
  const inicio = `${desde}T00:00:00.000Z`;
  const fin = `${hasta}T23:59:59.999Z`;
  const diasLista = listarDiasCalendario(desde, hasta);
  const dias_calendario = diasLista.length;

  let query = supabase
    .from("venta")
    .select("producto_id, cantidad, fecha, producto(sku, nombre)")
    .gte("fecha", inicio)
    .lte("fecha", fin);

  if (producto_id != null) {
    query = query.eq("producto_id", producto_id);
  }

  const { data, error } = await query;
  throwPg(error);

  const meta = new Map();
  const ventasPorDia = new Map();

  for (const row of data ?? []) {
    const id = row.producto_id;
    const dia = String(row.fecha).slice(0, 10);
    const cantidad = Number(row.cantidad) || 0;

    if (!meta.has(id)) {
      meta.set(id, {
        producto_id: id,
        producto_sku: row.producto?.sku ?? null,
        producto_nombre: row.producto?.nombre ?? null,
        unidades_vendidas: 0,
        registros_venta: 0,
      });
      ventasPorDia.set(id, new Map());
    }

    const m = meta.get(id);
    m.unidades_vendidas += cantidad;
    m.registros_venta += 1;

    const porDia = ventasPorDia.get(id);
    porDia.set(dia, (porDia.get(dia) ?? 0) + cantidad);
  }

  const productos = [...meta.values()]
    .map((p) => {
      const porDia = ventasPorDia.get(p.producto_id);
      const serieDiaria = diasLista.map((dia) => porDia.get(dia) ?? 0);
      const sigma = desviacionEstandarPoblacional(serieDiaria);
      return {
        ...p,
        unidades_vendidas: redondear2(p.unidades_vendidas),
        promedio_unidades_por_dia: redondear2(p.unidades_vendidas / dias_calendario),
        desviacion_estandar_diaria: redondear2(sigma),
      };
    })
    .sort((a, b) => b.desviacion_estandar_diaria - a.desviacion_estandar_diaria);

  return { dias_calendario, productos };
}

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
      unidades_vendidas: redondear2(p.unidades_vendidas),
      promedio_unidades_por_dia: redondear2(p.unidades_vendidas / dias_calendario),
    }))
    .sort((a, b) => b.promedio_unidades_por_dia - a.promedio_unidades_por_dia);

  return { dias_calendario, productos };
}
