import "../config.js";
import { supabase } from "../db/supabase.js";

function throwPg(error) {
  if (!error) return;
  throw Object.assign(new Error(error.message), { code: error.code });
}

const { count, error: countErr } = await supabase.from("pais").select("*", { count: "exact", head: true });
throwPg(countErr);
if (count > 0) {
  console.log('La base ya tiene datos en "pais". Omitiendo seed.');
  process.exit(0);
}

const { data: pInsert, error: ePais } = await supabase.from("pais").insert({ nombre: "Ecuador" }).select("id").single();
throwPg(ePais);
const paisId = pInsert.id;

for (const nombre of ["Pichincha", "Guayas", "Azuay"]) {
  const { error } = await supabase.from("provincia").insert({ pais_id: paisId, nombre });
  throwPg(error);
}

const { data: prPi, error: ePi } = await supabase
  .from("provincia")
  .select("id")
  .eq("nombre", "Pichincha")
  .eq("pais_id", paisId)
  .single();
throwPg(ePi);
const { data: prGu, error: eGu } = await supabase
  .from("provincia")
  .select("id")
  .eq("nombre", "Guayas")
  .eq("pais_id", paisId)
  .single();
throwPg(eGu);
const pichincha = prPi.id;
const guayas = prGu.id;

for (const [provincia_id, nombre] of [
  [pichincha, "Quito"],
  [pichincha, "Cayambe"],
  [guayas, "Guayaquil"],
  [guayas, "Durán"],
]) {
  const { error } = await supabase.from("ciudad").insert({ provincia_id, nombre });
  throwPg(error);
}

const { data: qRow } = await supabase.from("ciudad").select("id").eq("nombre", "Quito").single();
const { data: gRow } = await supabase.from("ciudad").select("id").eq("nombre", "Guayaquil").single();
const idQuito = qRow.id;
const idGye = gRow.id;

for (const [nombre, descripcion] of [
  ["Abarrotes", "Productos secos y despensa"],
  ["Frutas y verduras", "Perecederos — alta frecuencia de reposición"],
  ["Bebidas", "Sin alcohol"],
]) {
  const { error } = await supabase.from("categoria").insert({ nombre, descripcion });
  throwPg(error);
}

const { data: cA } = await supabase.from("categoria").select("id").eq("nombre", "Abarrotes").single();
const { data: cFV } = await supabase.from("categoria").select("id").eq("nombre", "Frutas y verduras").single();
const catAbarrotes = cA.id;
const catFV = cFV.id;

for (const row of [
  {
    nombre_comercial: "Distribuidora Centro",
    representante_legal: "Maria Vallejo",
    documento_identidad: "1712345675",
    telefono: "0991112223",
    email: "contacto@distcentro.demo",
    ciudad_id: idQuito,
  },
  {
    nombre_comercial: "Importadora Sur Pacifico S.A.",
    representante_legal: "Carlos Mendez",
    documento_identidad: "0928175967",
    telefono: "042987654",
    email: "ventas@surpacifico.demo",
    ciudad_id: idGye,
  },
]) {
  const { error } = await supabase.from("proveedor").insert(row);
  throwPg(error);
}

const { data: pv1 } = await supabase
  .from("proveedor")
  .select("id")
  .eq("nombre_comercial", "Distribuidora Centro")
  .single();
const { data: pv2 } = await supabase
  .from("proveedor")
  .select("id")
  .eq("nombre_comercial", "Importadora Sur Pacifico S.A.")
  .single();
const pid1 = pv1.id;
const pid2 = pv2.id;

const { error: eProd1 } = await supabase.from("producto").insert({
  sku: "SKU-ARROZ-1",
  nombre: "Arroz 1 kg",
  proveedor_id: pid1,
  categoria_id: catAbarrotes,
  precio_referencia: 1.25,
  es_perecedero: false,
  stock_actual: 40,
  dias_lead_time: 5,
});
throwPg(eProd1);

const { error: eProd2 } = await supabase.from("producto").insert({
  sku: "SKU-TOM-01",
  nombre: "Tomate kg",
  proveedor_id: pid2,
  categoria_id: catFV,
  precio_referencia: 0.85,
  es_perecedero: true,
  stock_actual: 12,
  dias_lead_time: 3,
});
throwPg(eProd2);

console.log("Seed completado (Supabase JS).");
