import { supabase } from "../db/supabase.js";
import { obtenerLeadTimeDiasPorProductoIds } from "./proveedorModel.js";
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
  "id, producto_id, desde, hasta, dias_calendario, unidades_vendidas, velocidad_consumo, lead_time_dias, punto_reorden, calculado_en, producto(sku, nombre, stock_actual)";

export function calcularPuntoReorden(velocidad_consumo, lead_time_dias) {
  return redondear2(Number(velocidad_consumo) * Number(lead_time_dias));
}

function flattenPunto(row) {
  return {
    id: row.id,
    producto_id: row.producto_id,
    desde: row.desde,
    hasta: row.hasta,
    dias_calendario: row.dias_calendario,
    unidades_vendidas: redondear2(row.unidades_vendidas),
    velocidad_consumo: redondear2(row.velocidad_consumo),
    lead_time_dias: row.lead_time_dias,
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
  const leadPorId = await obtenerLeadTimeDiasPorProductoIds(ids);

  const calculado_en = new Date().toISOString();
  const filas = productos.map((p) => {
    const lead_time_dias = leadPorId.get(p.producto_id) ?? 7;
    const velocidad_consumo = redondear2(p.promedio_unidades_por_dia);
    const punto_reorden = calcularPuntoReorden(velocidad_consumo, lead_time_dias);
    return {
      producto_id: p.producto_id,
      desde,
      hasta,
      dias_calendario,
      unidades_vendidas: redondear2(p.unidades_vendidas),
      velocidad_consumo,
      lead_time_dias,
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

export async function listarProductosAReponer({ producto_id } = {}) {
  let queryProductos = supabase
    .from("producto")
    .select("id, sku, nombre, stock_actual, proveedor_id, proveedor(nombre_comercial)")
    .order("nombre");

  if (producto_id != null) {
    queryProductos = queryProductos.eq("id", producto_id);
  }

  const { data: productos, error: errProd } = await queryProductos;
  throwPg(errProd);

  const { data: puntos, error: errPuntos } = await supabase
    .from("punto_reorden")
    .select("producto_id, punto_reorden, velocidad_consumo, lead_time_dias");
  throwPg(errPuntos);

  const puntoPorProducto = new Map((puntos ?? []).map((p) => [p.producto_id, p]));

  const alertas = [];

  for (const prod of productos ?? []) {
    const punto = puntoPorProducto.get(prod.id);
    if (!punto) continue;

    const stock_actual = redondear2(prod.stock_actual);
    const punto_reorden = redondear2(punto.punto_reorden);
    if (stock_actual > punto_reorden) continue;

    alertas.push({
      producto_id: prod.id,
      sku: prod.sku,
      nombre: prod.nombre,
      proveedor_id: prod.proveedor_id,
      proveedor_nombre: prod.proveedor?.nombre_comercial ?? null,
      stock_actual,
      punto_reorden,
      velocidad_consumo: redondear2(punto.velocidad_consumo),
      lead_time_dias: punto.lead_time_dias,
      diferencia: redondear2(stock_actual - punto_reorden),
      estado: "stock_en_o_bajo_punto_reorden",
    });
  }

  alertas.sort((a, b) => a.diferencia - b.diferencia);
  return alertas;
}

export async function compararStockActualVsPuntoReordenPorProducto({ producto_id } = {}) {
  const alertas = await listarProductosAReponer({ producto_id });
  return {
    total: alertas.length,
    productos: alertas,
  };
}

export async function agruparProductosAReponerPorProveedor({ producto_id } = {}) {
  const alertas = await listarProductosAReponer({ producto_id });
  const porProveedor = new Map();

  for (const producto of alertas) {
    const proveedorId = producto.proveedor_id;
    if (!porProveedor.has(proveedorId)) {
      porProveedor.set(proveedorId, []);
    }
    porProveedor.get(proveedorId).push(producto);
  }

  return porProveedor;
}

export function serializarReponerPorProveedorMap(porProveedor) {
  const proveedores = [...porProveedor.entries()]
    .map(([proveedor_id, productos]) => ({
      proveedor_id,
      proveedor_nombre: productos[0]?.proveedor_nombre ?? null,
      cantidad_productos: productos.length,
      productos,
    }))
    .sort((a, b) => {
      if (b.cantidad_productos !== a.cantidad_productos) {
        return b.cantidad_productos - a.cantidad_productos;
      }
      return String(a.proveedor_nombre ?? "").localeCompare(String(b.proveedor_nombre ?? ""), "es");
    });

  const total_productos = proveedores.reduce((n, p) => n + p.cantidad_productos, 0);

  return {
    total_productos,
    total_proveedores: proveedores.length,
    proveedores,
  };
}
