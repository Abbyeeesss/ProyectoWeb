export const TIPO_PERECEDERO = "perecedero";
export const TIPO_NO_PERECEDERO = "no_perecedero";

const ALIAS_PERECEDERO = new Set([
  "perecedero",
  "perishable",
  "si",
  "sí",
  "true",
  "1",
  "yes",
]);

const ALIAS_NO_PERECEDERO = new Set([
  "no_perecedero",
  "no perecedero",
  "no-perecedero",
  "no_perishable",
  "no",
  "false",
  "0",
]);

export function normalizarTipo(valor) {
  if (typeof valor === "boolean") {
    return valor ? TIPO_PERECEDERO : TIPO_NO_PERECEDERO;
  }

  const texto = String(valor ?? "")
    .trim()
    .toLowerCase();

  if (ALIAS_PERECEDERO.has(texto)) return TIPO_PERECEDERO;
  if (ALIAS_NO_PERECEDERO.has(texto)) return TIPO_NO_PERECEDERO;

  return TIPO_NO_PERECEDERO;
}

export function esProductoPerecedero(tipo) {
  return normalizarTipo(tipo) === TIPO_PERECEDERO;
}

export function esProductoNoPerecedero(tipo) {
  return normalizarTipo(tipo) === TIPO_NO_PERECEDERO;
}

export function resolverTipoProducto(producto) {
  if (producto?.tipo != null && String(producto.tipo).trim() !== "") {
    return normalizarTipo(producto.tipo);
  }
  return normalizarTipo(producto?.es_perecedero);
}

export function identificarTipoProducto(producto) {
  const tipo = resolverTipoProducto(producto);
  const es_perecedero = tipo === TIPO_PERECEDERO;

  return {
    tipo,
    es_perecedero,
    etiqueta: es_perecedero ? "Perecedero" : "No perecedero",
  };
}

export function tipoParaPersistencia(body) {
  const tipo = resolverTipoProducto(body);
  return {
    tipo,
    es_perecedero: tipo === TIPO_PERECEDERO,
  };
}
