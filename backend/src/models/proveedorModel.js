import { supabase } from "../db/supabase.js";

function throwPg(error) {
  if (!error) return;
  const err = new Error(error.message);
  err.code = error.code;
  throw err;
}

const proveedorSelectAnidado =
  "id, nombre_comercial, representante_legal, documento_identidad, telefono, email, ciudad_id, ciudad(nombre, provincia(id, nombre, pais(id, nombre)))";

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
