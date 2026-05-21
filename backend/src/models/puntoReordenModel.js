import { supabase } from "../db/supabase.js";
import {
  ajustarReposicionPorTipo,
  filtrarProductosParaOrden,
} from "../utils/frecuenciaReposicion.js";
import { identificarTipoProducto } from "../utils/tipoProducto.js";
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

export function calcularCantidadSugerida(velocidad_consumo, lead_time_dias) {
  return redondear2(Number(velocidad_consumo) * Number(lead_time_dias));
}

export function calcularCantidadAPedir(stock_actual, velocidad_consumo, lead_time_dias) {
  const objetivo = calcularCantidadSugerida(velocidad_consumo, lead_time_dias);
  const deficit = objetivo - Number(stock_actual);
  return redondear2(Math.max(0, deficit));
}

export function calcularPuntoReorden(velocidad_consumo, lead_time_dias) {
  return calcularCantidadSugerida(velocidad_consumo, lead_time_dias);
}

function compararPrioridadOrden(a, b) {
  if (Boolean(b.es_perecedero) !== Boolean(a.es_perecedero)) {
    return Number(b.es_perecedero) - Number(a.es_perecedero);
  }
  if (b.velocidad_consumo !== a.velocidad_consumo) {
    return b.velocidad_consumo - a.velocidad_consumo;
  }
  return a.diferencia - b.diferencia;
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
    const punto_reorden = calcularCantidadSugerida(velocidad_consumo, lead_time_dias);
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
    .select("id, sku, nombre, stock_actual, proveedor_id, tipo, es_perecedero, proveedor(nombre_comercial)")
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
    const velocidad_consumo = redondear2(punto.velocidad_consumo);
    const lead_time_dias = punto.lead_time_dias;
    const clasificacion = identificarTipoProducto(prod);

    const frecuencia = ajustarReposicionPorTipo({
      tipo: clasificacion.tipo,
      stock_actual,
      velocidad_consumo,
      lead_time_dias,
      punto_reorden,
    });

    if (!frecuencia.requiere_reposicion) continue;

    alertas.push({
      producto_id: prod.id,
      sku: prod.sku,
      nombre: prod.nombre,
      proveedor_id: prod.proveedor_id,
      proveedor_nombre: prod.proveedor?.nombre_comercial ?? null,
      tipo: clasificacion.tipo,
      es_perecedero: clasificacion.es_perecedero,
      tipo_etiqueta: clasificacion.etiqueta,
      stock_actual,
      punto_reorden,
      punto_ajustado: frecuencia.punto_ajustado,
      velocidad_consumo,
      lead_time_dias,
      lead_time_ajustado: frecuencia.lead_time_ajustado,
      frecuencia_reposicion: frecuencia.frecuencia_reposicion,
      frecuencia_descripcion: frecuencia.frecuencia_descripcion,
      cantidad_sugerida: frecuencia.cantidad_sugerida,
      cantidad_a_pedir: frecuencia.cantidad_a_pedir,
      diferencia: redondear2(stock_actual - frecuencia.punto_ajustado),
      estado: "stock_en_o_bajo_punto_reorden",
    });
  }

  alertas.sort(compararPrioridadOrden);
  return alertas;
}

export async function listarProductosParaOrden({ producto_id } = {}) {
  const candidatos = await listarProductosAReponer({ producto_id });
  const lineas = filtrarProductosParaOrden(candidatos);
  lineas.sort(compararPrioridadOrden);
  return lineas;
}

export async function compararStockActualVsPuntoReordenPorProducto({ producto_id } = {}) {
  const alertas = await listarProductosAReponer({ producto_id });
  return {
    total: alertas.length,
    productos: alertas,
  };
}

export async function agruparProductosAReponerPorProveedor({ producto_id } = {}) {
  const lineas = await listarProductosParaOrden({ producto_id });
  const porProveedor = new Map();

  for (const producto of lineas) {
    const proveedorId = producto.proveedor_id;
    if (!porProveedor.has(proveedorId)) {
      porProveedor.set(proveedorId, []);
    }
    porProveedor.get(proveedorId).push(producto);
  }

  for (const lista of porProveedor.values()) {
    lista.sort(compararPrioridadOrden);
  }

  return porProveedor;
}

export function serializarReponerPorProveedorMap(porProveedor) {
  const proveedores = [...porProveedor.entries()]
    .map(([proveedor_id, productos]) => {
      const tienePerecedero = productos.some((p) => p.es_perecedero);
      return {
        proveedor_id,
        proveedor_nombre: productos[0]?.proveedor_nombre ?? null,
        cantidad_productos: productos.length,
        frecuencia_reposicion: tienePerecedero ? "alta" : "baja",
        productos,
      };
    })
    .sort((a, b) => {
      if (a.frecuencia_reposicion !== b.frecuencia_reposicion) {
        return a.frecuencia_reposicion === "alta" ? -1 : 1;
      }
      const velA = Math.max(...a.productos.map((p) => p.velocidad_consumo), 0);
      const velB = Math.max(...b.productos.map((p) => p.velocidad_consumo), 0);
      if (velB !== velA) return velB - velA;
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
