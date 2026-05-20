import * as ventaModel from "../models/ventaModel.js";
import { parseRangoFechas } from "../utils/rangoFechas.js";

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

/**
 * GET /api/ventas/promedio-diario?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&producto_id=1
 */
export async function promedioDiarioPorProducto(req, res) {
  const rango = parseRangoFechas(req.query.desde, req.query.hasta);
  if (!rango.ok) return res.status(400).json({ error: rango.error });

  let producto_id;
  if (req.query.producto_id != null && req.query.producto_id !== "") {
    producto_id = Number(req.query.producto_id);
    if (!producto_id || producto_id < 1) {
      return res.status(400).json({ error: "producto_id debe ser un entero positivo." });
    }
  }

  const { dias_calendario, productos } =
    await ventaModel.calcularPromedioUnidadesVendidasPorDiaPorProducto({
      desde: rango.desde,
      hasta: rango.hasta,
      producto_id,
    });

  res.json({
    desde: rango.desde,
    hasta: rango.hasta,
    dias_calendario,
    total_productos: productos.length,
    productos,
  });
}
