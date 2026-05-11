import { supabase } from "../db/supabase.js";

function throwPg(error) {
  if (!error) return;
  const err = new Error(error.message);
  err.code = error.code;
  throw err;
}

export async function listarCategorias() {
  const { data, error } = await supabase.from("categoria").select("id, nombre, descripcion").order("nombre");
  throwPg(error);
  return data ?? [];
}

export async function obtenerCategoria(id) {
  const { data, error } = await supabase.from("categoria").select("id, nombre, descripcion").eq("id", id).maybeSingle();
  throwPg(error);
  return data ?? null;
}

export async function crearCategoria({ nombre, descripcion }) {
  const { data, error } = await supabase
    .from("categoria")
    .insert({ nombre: nombre.trim(), descripcion: descripcion?.trim() ?? null })
    .select("id, nombre, descripcion")
    .single();
  throwPg(error);
  return data;
}

export async function actualizarCategoria(id, { nombre, descripcion }) {
  const { error } = await supabase
    .from("categoria")
    .update({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() ?? null,
    })
    .eq("id", id);
  throwPg(error);
  return obtenerCategoria(id);
}

export async function eliminarCategoria(id) {
  const { error } = await supabase.from("categoria").delete().eq("id", id);
  throwPg(error);
}
