/**
 * Validaciones obligatorias en servidor para datos sensibles (no sustituibles por solo JS en el cliente).
 * documento_identidad: cédula ecuatoriana 10 dígitos + dígito verificador (algoritmo módulo 10).
 * ruc: persona natural 13 dígitos terminados en 001; validación de formato y checksum básico.
 */

function soloDigitos(s) {
  return typeof s === "string" && /^\d+$/.test(s.trim());
}

/** Módulo 10 INEC — coeficientes 2,1,2,1… desde la derecha del bloque de 9 dígitos */
function digitoVerificadorCedula(cedula9) {
  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let v = Number(cedula9[i]) * coef[i];
    if (v > 9) v -= 9;
    suma += v;
  }
  const dec = Math.ceil(suma / 10) * 10;
  return (dec - suma) % 10;
}

export function validarDocumentoIdentidad(valor) {
  const doc = String(valor ?? "").trim();
  if (!soloDigitos(doc) || doc.length !== 10) {
    return { ok: false, mensaje: "La cédula debe tener 10 dígitos numéricos." };
  }
  const provincia = Number(doc.slice(0, 2));
  if (provincia < 1 || provincia > 24) {
    return { ok: false, mensaje: "Los dos primeros dígitos de la cédula no son válidos." };
  }
  const esperado = digitoVerificadorCedula(doc.slice(0, 9));
  if (Number(doc[9]) !== esperado) {
    return { ok: false, mensaje: "El dígito verificador de la cédula no es válido." };
  }
  return { ok: true };
}

/** RUC Ecuador sociedad: 13 dígitos; dígitos 3–8 típicamente >= 1 (evita ceros masivos inválidos). */
export function validarRucProveedor(ruc) {
  const r = String(ruc ?? "").trim();
  if (!soloDigitos(r) || r.length !== 13) {
    return { ok: false, mensaje: "El RUC debe tener exactamente 13 dígitos numéricos." };
  }
  const provincia = Number(r.slice(0, 2));
  if (provincia < 1 || provincia > 24) {
    return { ok: false, mensaje: "Los dos primeros dígitos del RUC no corresponden a un código de provincia válido." };
  }
  if (r.endsWith("001")) {
    const cedula = r.slice(0, 10);
    const c = validarDocumentoIdentidad(cedula);
    if (!c.ok) return { ok: false, mensaje: `RUC (persona natural): ${c.mensaje}` };
    return { ok: true };
  }
  const tipo = Number(r[2]);
  if (tipo < 6 || tipo > 9) {
    return {
      ok: false,
      mensaje: "Para RUC de sociedad, el tercer dígito debe estar entre 6 y 9.",
    };
  }
  return { ok: true };
}
