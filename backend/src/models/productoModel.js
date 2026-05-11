import { supabase } from "../db/supabase.js";

function throwPg(error) {
  if (!error) return;
  const err = new Error(error.message);
  err.code = error.code;
  throw err;
}

const productoSelect =
  "id, sku, nombre, proveedor_id, categoria_id, precio_referencia, es_perecedero, stock_actual, dias_lead_time, proveedor(nombre_comercial), categoria(nombre)";

function flattenProducto(row) {
  return {
    id: row.id,
    sku: row.sku,
    nombre: row.nombre,
    proveedor_id: row.proveedor_id,
    categoria_id: row.categoria_id,
    precio_referencia: row.precio_referencia,
    es_perecedero: row.es_perecedero,
    stock_actual: row.stock_actual,
    dias_lead_time: row.dias_lead_time,
    proveedor_nombre: row.proveedor?.nombre_comercial ?? null,
    categoria_nombre: row.categoria?.nombre ?? null,
  };
}

export async function listarProductos() {
  const { data, error } = await supabase.from("producto").select(productoSelect).order("nombre");
  throwPg(error);
  return (data ?? []).map(flattenProducto);
}

export async function obtenerProducto(id) {
  const { data, error } = await supabase
    .from("producto")
    .select("id, sku, nombre, proveedor_id, categoria_id, precio_referencia, es_perecedero, stock_actual, dias_lead_time")
    .eq("id", id)
    .maybeSingle();
  throwPg(error);
  return data ?? null;
}

export async function crearProducto(body) {
  const payload = {
    sku: body.sku.trim(),
    nombre: body.nombre.trim(),
    proveedor_id: body.proveedor_id,
    categoria_id: body.categoria_id,
    precio_referencia: Number(body.precio_referencia) || 0,
    es_perecedero: Boolean(body.es_perecedero),
    stock_actual: Number(body.stock_actual) || 0,
    dias_lead_time: Math.max(1, Number(body.dias_lead_time) || 7),
  };
  const { data: inserted, error } = await supabase.from("producto").insert(payload).select("id").single();
  throwPg(error);
  return obtenerProducto(inserted.id);
}

export async function actualizarProducto(id, body) {
  const payload = {
    sku: body.sku.trim(),
    nombre: body.nombre.trim(),
    proveedor_id: body.proveedor_id,
    categoria_id: body.categoria_id,
    precio_referencia: Number(body.precio_referencia) || 0,
    es_perecedero: Boolean(body.es_perecedero),
    stock_actual: Number(body.stock_actual) || 0,
    dias_lead_time: Math.max(1, Number(body.dias_lead_time) || 7),
  };
  const { error } = await supabase.from("producto").update(payload).eq("id", id);
  throwPg(error);
  return obtenerProducto(id);
}

export async function eliminarProducto(id) {
  const { error } = await supabase.from("producto").delete().eq("id", id);
  throwPg(error);
}
