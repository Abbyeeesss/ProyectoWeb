import { supabase } from "../db/supabase.js";
import {
  calcularPromedioUnidadesVendidasPorDiaPorProducto,
  redondear2,
} from "./ventaModel.js";

function throwPg(error) {
  if (!error) return;
  const err = new Error(error.message);
  err.code = error.code;
  throw err;
}

const puntoSelect =
  "id, producto_id, desde, hasta, dias_calendario, unidades_vendidas, promedio_unidades_dia, dias_lead_time, punto_reorden, calculado_en, producto(sku, nombre, stock_actual)";

function flattenPunto(row) {
  return {
    id: row.id,
    producto_id: row.producto_id,
    desde: row.desde,
    hasta: row.hasta,
    dias_calendario: row.dias_calendario,
    unidades_vendidas: redondear2(row.unidades_vendidas),
    promedio_unidades_dia: redondear2(row.promedio_unidades_dia),
    dias_lead_time: row.dias_lead_time,
    punto_reorden: redondear2(row.punto_reorden),
    calculado_en: row.calculado_en,
    producto_sku: row.producto?.sku ?? null,
    producto_nombre: row.producto?.nombre ?? null,
    stock_actual: redondear2(row.producto?.stock_actual),
  };
}

export async function guardarPuntosReordenDesdeVentas({ desde, hasta, producto_id }) {
  const { dias_calendario, productos } = await calcularPromedioUnidadesVendidasPorDiaPorProducto({
    desde,
    hasta,
    producto_id,
  });

  if (!productos.length) {
    return { guardados: 0, desde, hasta, dias_calendario, registros: [] };
  }

  const ids = productos.map((p) => p.producto_id);
  const { data: meta, error: metaErr } = await supabase
    .from("producto")
    .select("id, dias_lead_time")
    .in("id", ids);
  throwPg(metaErr);

  const leadPorId = new Map((meta ?? []).map((m) => [m.id, Math.max(1, Number(m.dias_lead_time) || 7)]));

  const calculado_en = new Date().toISOString();
  const filas = productos.map((p) => {
    const dias_lead_time = leadPorId.get(p.producto_id) ?? 7;
    const promedio = p.promedio_unidades_por_dia;
    const punto_reorden = redondear2(promedio * dias_lead_time);
    return {
      producto_id: p.producto_id,
      desde,
      hasta,
      dias_calendario,
      unidades_vendidas: redondear2(p.unidades_vendidas),
      promedio_unidades_dia: redondear2(promedio),
      dias_lead_time,
      punto_reorden,
      calculado_en,
    };
  });

  const { data, error } = await supabase
    .from("punto_reorden")
    .upsert(filas, { onConflict: "producto_id" })
    .select(puntoSelect);
  throwPg(error);

  const registros = (data ?? []).map(flattenPunto);
  return {
    guardados: registros.length,
    desde,
    hasta,
    dias_calendario,
    registros,
  };
}

export async function listarPuntosReorden() {
  const { data, error } = await supabase
    .from("punto_reorden")
    .select(puntoSelect)
    .order("punto_reorden", { ascending: false });
  throwPg(error);
  return (data ?? []).map(flattenPunto);
}
