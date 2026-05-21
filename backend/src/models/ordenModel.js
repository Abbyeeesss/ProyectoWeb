import * as puntoReordenModel from "./puntoReordenModel.js";
import { redondear2 } from "./ventaModel.js";

function mapLineaOrden(producto) {
  return {
    producto_id: producto.producto_id,
    sku: producto.sku,
    nombre: producto.nombre,
    tipo: producto.tipo,
    tipo_etiqueta: producto.tipo_etiqueta,
    es_perecedero: producto.es_perecedero,
    stock_actual: producto.stock_actual,
    punto_reorden: producto.punto_reorden,
    punto_ajustado: producto.punto_ajustado,
    velocidad_consumo: producto.velocidad_consumo,
    lead_time_dias: producto.lead_time_dias,
    lead_time_ajustado: producto.lead_time_ajustado,
    frecuencia_reposicion: producto.frecuencia_reposicion,
    cantidad_sugerida: producto.cantidad_sugerida,
    cantidad_a_pedir: producto.cantidad_a_pedir,
  };
}

function mapOrdenProveedor(grupo, fecha) {
  const lineas = grupo.productos.map(mapLineaOrden);
  const total_unidades = redondear2(
    lineas.reduce((suma, l) => suma + Number(l.cantidad_a_pedir), 0),
  );

  return {
    proveedor_id: grupo.proveedor_id,
    proveedor_nombre: grupo.proveedor_nombre,
    estado: "sugerida",
    frecuencia_reposicion: grupo.frecuencia_reposicion,
    fecha,
    cantidad_productos: grupo.cantidad_productos,
    total_unidades,
    lineas,
  };
}

export async function generarOrdenes({ producto_id } = {}) {
  const mapa = await puntoReordenModel.agruparProductosAReponerPorProveedor({ producto_id });
  const agrupado = puntoReordenModel.serializarReponerPorProveedorMap(mapa);
  const generado_en = new Date().toISOString();
  const fecha = generado_en.slice(0, 10);

  const ordenes = agrupado.proveedores.map((grupo) => mapOrdenProveedor(grupo, fecha));
  const total_unidades = redondear2(
    ordenes.reduce((suma, o) => suma + Number(o.total_unidades), 0),
  );

  return {
    generado_en,
    fecha,
    total_ordenes: ordenes.length,
    total_lineas: agrupado.total_productos,
    total_unidades,
    ordenes,
  };
}
