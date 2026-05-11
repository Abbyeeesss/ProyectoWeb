import { supabase } from "../db/supabase.js";

function throwPg(error) {
  if (!error) return;
  const err = new Error(error.message);
  err.code = error.code;
  err.details = error.details;
  throw err;
}

export async function listarPaises() {
  const { data, error } = await supabase.from("pais").select("id, nombre").order("nombre");
  throwPg(error);
  return data ?? [];
}

export async function listarProvinciasPorPais(paisId) {
  const { data, error } = await supabase
    .from("provincia")
    .select("id, nombre")
    .eq("pais_id", paisId)
    .order("nombre");
  throwPg(error);
  return data ?? [];
}

export async function listarCiudadesPorProvincia(provinciaId) {
  const { data, error } = await supabase
    .from("ciudad")
    .select("id, nombre")
    .eq("provincia_id", provinciaId)
    .order("nombre");
  throwPg(error);
  return data ?? [];
}

export async function existeCiudad(id) {
  const { data, error } = await supabase.from("ciudad").select("id").eq("id", id).maybeSingle();
  throwPg(error);
  return data != null;
}
