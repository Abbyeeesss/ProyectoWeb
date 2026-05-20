/** Valida query `desde` / `hasta` como YYYY-MM-DD y que desde <= hasta. */
export function parseRangoFechas(desdeRaw, hastaRaw) {
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  if (!desdeRaw || !hastaRaw) {
    return { ok: false, error: "Parámetros desde y hasta son obligatorios (formato YYYY-MM-DD)." };
  }
  if (!isoDate.test(desdeRaw) || !isoDate.test(hastaRaw)) {
    return { ok: false, error: "Fechas inválidas. Use formato YYYY-MM-DD." };
  }
  const desde = new Date(`${desdeRaw}T12:00:00.000Z`);
  const hasta = new Date(`${hastaRaw}T12:00:00.000Z`);
  if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) {
    return { ok: false, error: "Fechas inválidas." };
  }
  if (desde > hasta) {
    return { ok: false, error: "La fecha desde no puede ser posterior a hasta." };
  }
  return { ok: true, desde: desdeRaw, hasta: hastaRaw };
}
