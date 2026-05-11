function soloDigitos(s) {
  return typeof s === "string" && /^\d+$/.test(s.trim());
}

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
