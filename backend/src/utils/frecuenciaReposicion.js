import { redondear2 } from "../models/ventaModel.js";
import { TIPO_NO_PERECEDERO, TIPO_PERECEDERO, esProductoPerecedero } from "./tipoProducto.js";

const AJUSTE_POR_TIPO = {
  [TIPO_PERECEDERO]: {
    factor_umbral: 1.2,
    factor_lead: 0.7,
    frecuencia_reposicion: "alta",
    descripcion: "Reposición frecuente (perecedero)",
  },
  [TIPO_NO_PERECEDERO]: {
    factor_umbral: 0.9,
    factor_lead: 1.3,
    frecuencia_reposicion: "baja",
    descripcion: "Reposición espaciada (no perecedero)",
  },
};

export function obtenerAjusteFrecuenciaPorTipo(tipo) {
  const clave = esProductoPerecedero(tipo) ? TIPO_PERECEDERO : TIPO_NO_PERECEDERO;
  return AJUSTE_POR_TIPO[clave];
}

function cantidadSugerida(velocidad_consumo, lead_time_dias) {
  return redondear2(Number(velocidad_consumo) * Number(lead_time_dias));
}

function cantidadAPedir(stock_actual, velocidad_consumo, lead_time_dias) {
  const objetivo = cantidadSugerida(velocidad_consumo, lead_time_dias);
  return redondear2(Math.max(0, objetivo - Number(stock_actual)));
}

export function ajustarReposicionPorTipo({
  tipo,
  stock_actual,
  velocidad_consumo,
  lead_time_dias,
  punto_reorden,
}) {
  const ajuste = obtenerAjusteFrecuenciaPorTipo(tipo);
  const lead_time_ajustado = redondear2(Number(lead_time_dias) * ajuste.factor_lead);
  const punto_ajustado = redondear2(Number(punto_reorden) * ajuste.factor_umbral);
  const stock = redondear2(stock_actual);
  const requiere_reposicion = stock <= punto_ajustado;

  return {
    requiere_reposicion,
    frecuencia_reposicion: ajuste.frecuencia_reposicion,
    frecuencia_descripcion: ajuste.descripcion,
    factor_umbral: ajuste.factor_umbral,
    factor_lead: ajuste.factor_lead,
    lead_time_ajustado,
    punto_ajustado,
    cantidad_sugerida: cantidadSugerida(velocidad_consumo, lead_time_ajustado),
    cantidad_a_pedir: cantidadAPedir(stock, velocidad_consumo, lead_time_ajustado),
  };
}

export function aplicarFrecuenciaReposicionAProductos(productos) {
  return productos.map((p) => {
    const ajuste = ajustarReposicionPorTipo({
      tipo: p.tipo,
      stock_actual: p.stock_actual,
      velocidad_consumo: p.velocidad_consumo,
      lead_time_dias: p.lead_time_dias,
      punto_reorden: p.punto_reorden,
    });

    return {
      ...p,
      ...ajuste,
      incluir_en_orden: ajuste.requiere_reposicion && ajuste.cantidad_a_pedir > 0,
    };
  });
}

export function filtrarProductosParaOrden(productos) {
  return aplicarFrecuenciaReposicionAProductos(productos).filter((p) => p.incluir_en_orden);
}
