import * as ventaModel from "../models/ventaModel.js";

/** Valida query `desde` / `hasta` como YYYY-MM-DD y que desde <= hasta. */
function parseRangoFechas(desdeRaw, hastaRaw) {
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

/**
 * GET /api/ventas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&producto_id=1
 */
export async function historialPorRango(req, res) {
  const rango = parseRangoFechas(req.query.desde, req.query.hasta);
  if (!rango.ok) return res.status(400).json({ error: rango.error });

  let producto_id;
  if (req.query.producto_id != null && req.query.producto_id !== "") {
    producto_id = Number(req.query.producto_id);
    if (!producto_id || producto_id < 1) {
      return res.status(400).json({ error: "producto_id debe ser un entero positivo." });
    }
  }

  const ventas = await ventaModel.consultarHistorialVentasPorRango({
    desde: rango.desde,
    hasta: rango.hasta,
    producto_id,
  });

  res.json({
    desde: rango.desde,
    hasta: rango.hasta,
    total: ventas.length,
    ventas,
  });
}
