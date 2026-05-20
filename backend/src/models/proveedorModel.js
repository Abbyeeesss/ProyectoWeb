import { supabase } from "../db/supabase.js";

function throwPg(error) {
  if (!error) return;
  const err = new Error(error.message);
  err.code = error.code;
  throw err;
}

const proveedorSelectAnidado =
  "id, nombre_comercial, representante_legal, documento_identidad, telefono, email, ciudad_id, lead_time_dias, ciudad(nombre, provincia(id, nombre, pais(id, nombre)))";

function normalizarLeadTimeDias(valor) {
  return Math.max(1, Number(valor) || 7);
}

function flattenLista(row) {
  const c = row.ciudad;
  const pr = c?.provincia;
  const pa = pr?.pais;
  return {
    id: row.id,
    nombre_comercial: row.nombre_comercial,
    representante_legal: row.representante_legal,
    documento_identidad: row.documento_identidad,
    telefono: row.telefono,
    email: row.email,
    ciudad_id: row.ciudad_id,
    lead_time_dias: normalizarLeadTimeDias(row.lead_time_dias),
    ciudad_nombre: c?.nombre ?? null,
    provincia_nombre: pr?.nombre ?? null,
    pais_nombre: pa?.nombre ?? null,
  };
}

function flattenDetalle(row) {
  const base = flattenLista(row);
  const pr = row.ciudad?.provincia;
  const pa = pr?.pais;
  return {
    id: row.id,
    nombre_comercial: row.nombre_comercial,
    representante_legal: row.representante_legal,
    documento_identidad: row.documento_identidad,
    telefono: row.telefono,
    email: row.email,
    ciudad_id: row.ciudad_id,
    lead_time_dias: normalizarLeadTimeDias(row.lead_time_dias),
    provincia_id: pr?.id ?? null,
    pais_id: pa?.id ?? null,
  };
}

export async function listarProveedores() {
  const { data, error } = await supabase
    .from("proveedor")
    .select(proveedorSelectAnidado)
    .order("nombre_comercial");
  throwPg(error);
  return (data ?? []).map(flattenLista);
}

export async function obtenerLeadTimeDiasProveedor(proveedor_id) {
  const { data, error } = await supabase
    .from("proveedor")
    .select("id, nombre_comercial, lead_time_dias")
    .eq("id", proveedor_id)
    .maybeSingle();
  throwPg(error);
  if (!data) return null;
  return {
    proveedor_id: data.id,
    nombre_comercial: data.nombre_comercial,
    lead_time_dias: normalizarLeadTimeDias(data.lead_time_dias),
  };
}

export async function obtenerLeadTimeDiasPorProductoIds(productoIds) {
  if (!productoIds?.length) return new Map();

  const { data: productos, error: errProd } = await supabase
    .from("producto")
    .select("id, proveedor_id")
    .in("id", productoIds);
  throwPg(errProd);

  const proveedorIds = [...new Set((productos ?? []).map((p) => p.proveedor_id))];
  if (!proveedorIds.length) return new Map();

  const { data: proveedores, error: errProv } = await supabase
    .from("proveedor")
    .select("id, lead_time_dias")
    .in("id", proveedorIds);
  throwPg(errProv);

  const leadPorProveedor = new Map(
    (proveedores ?? []).map((p) => [p.id, normalizarLeadTimeDias(p.lead_time_dias)]),
  );

  const leadPorProducto = new Map();
  for (const prod of productos ?? []) {
    leadPorProducto.set(prod.id, leadPorProveedor.get(prod.proveedor_id) ?? 7);
  }
  return leadPorProducto;
}

export async function obtenerProveedor(id) {
  const { data, error } = await supabase
    .from("proveedor")
    .select(proveedorSelectAnidado)
    .eq("id", id)
    .maybeSingle();
  throwPg(error);
  return data ? flattenDetalle(data) : null;
}

export async function crearProveedor(body) {
  const { data: inserted, error } = await supabase
    .from("proveedor")
    .insert({
      nombre_comercial: body.nombre_comercial.trim(),
      representante_legal: body.representante_legal.trim(),
      documento_identidad: body.documento_identidad.trim(),
      telefono: body.telefono?.trim() || null,
      email: body.email?.trim() || null,
      ciudad_id: body.ciudad_id,
      lead_time_dias: normalizarLeadTimeDias(body.lead_time_dias),
    })
    .select("id")
    .single();
  throwPg(error);
  return obtenerProveedor(inserted.id);
}

export async function actualizarProveedor(id, body) {
  const { error } = await supabase
    .from("proveedor")
    .update({
      nombre_comercial: body.nombre_comercial.trim(),
      representante_legal: body.representante_legal.trim(),
      documento_identidad: body.documento_identidad.trim(),
      telefono: body.telefono?.trim() || null,
      email: body.email?.trim() || null,
      ciudad_id: body.ciudad_id,
      lead_time_dias: normalizarLeadTimeDias(body.lead_time_dias),
    })
    .eq("id", id);
  throwPg(error);
  return obtenerProveedor(id);
}

export async function eliminarProveedor(id) {
  const { error } = await supabase.from("proveedor").delete().eq("id", id);
  throwPg(error);
}

export async function existeProveedor(id) {
  const { data, error } = await supabase.from("proveedor").select("id").eq("id", id).maybeSingle();
  throwPg(error);
  return data != null;
}
