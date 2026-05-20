import * as puntoReordenModel from "../models/puntoReordenModel.js";
import { parseRangoFechas } from "../utils/rangoFechas.js";

/**
 * POST /api/punto-reorden/guardar?desde=&hasta=&producto_id=
 */
export async function guardar(req, res) {
  const rango = parseRangoFechas(req.query.desde, req.query.hasta);
  if (!rango.ok) return res.status(400).json({ error: rango.error });

  let producto_id;
  if (req.query.producto_id != null && req.query.producto_id !== "") {
    producto_id = Number(req.query.producto_id);
    if (!producto_id || producto_id < 1) {
      return res.status(400).json({ error: "producto_id debe ser un entero positivo." });
    }
  }

  const resultado = await puntoReordenModel.guardarPuntosReordenDesdeVentas({
    desde: rango.desde,
    hasta: rango.hasta,
    producto_id,
  });

  if (resultado.guardados === 0) {
    return res.status(400).json({
      error: "No hay ventas en el rango para calcular puntos de reorden.",
    });
  }

  res.status(201).json(resultado);
}

/** GET /api/punto-reorden */
export async function listar(req, res) {
  res.json(await puntoReordenModel.listarPuntosReorden());
}
