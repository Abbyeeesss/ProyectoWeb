import * as ventaModel from "../models/ventaModel.js";
import { parseRangoFechas } from "../utils/rangoFechas.js";

function parseProductoIdOpcional(req) {
  if (req.query.producto_id == null || req.query.producto_id === "") return { ok: true, producto_id: undefined };
  const producto_id = Number(req.query.producto_id);
  if (!producto_id || producto_id < 1) {
    return { ok: false, error: "producto_id debe ser un entero positivo." };
  }
  return { ok: true, producto_id };
}

export async function historialPorRango(req, res) {
  const rango = parseRangoFechas(req.query.desde, req.query.hasta);
  if (!rango.ok) return res.status(400).json({ error: rango.error });

  const pid = parseProductoIdOpcional(req);
  if (!pid.ok) return res.status(400).json({ error: pid.error });

  const ventas = await ventaModel.consultarHistorialVentasPorRango({
    desde: rango.desde,
    hasta: rango.hasta,
    producto_id: pid.producto_id,
  });

  res.json({
    desde: rango.desde,
    hasta: rango.hasta,
    total: ventas.length,
    ventas,
  });
}

export async function promedioDiarioPorProducto(req, res) {
  const rango = parseRangoFechas(req.query.desde, req.query.hasta);
  if (!rango.ok) return res.status(400).json({ error: rango.error });

  const pid = parseProductoIdOpcional(req);
  if (!pid.ok) return res.status(400).json({ error: pid.error });

  const { dias_calendario, productos } =
    await ventaModel.calcularPromedioUnidadesVendidasPorDiaPorProducto({
      desde: rango.desde,
      hasta: rango.hasta,
      producto_id: pid.producto_id,
    });

  res.json({
    desde: rango.desde,
    hasta: rango.hasta,
    dias_calendario,
    total_productos: productos.length,
    productos,
  });
}

/** GET /api/ventas/desviacion-estandar?desde=&hasta=&producto_id= */
export async function desviacionEstandarPorProducto(req, res) {
  const rango = parseRangoFechas(req.query.desde, req.query.hasta);
  if (!rango.ok) return res.status(400).json({ error: rango.error });

  const pid = parseProductoIdOpcional(req);
  if (!pid.ok) return res.status(400).json({ error: pid.error });

  const { dias_calendario, productos } =
    await ventaModel.calcularDesviacionEstandarVentasPorProducto({
      desde: rango.desde,
      hasta: rango.hasta,
      producto_id: pid.producto_id,
    });

  res.json({
    desde: rango.desde,
    hasta: rango.hasta,
    dias_calendario,
    metodo: "desviacion_poblacional_diaria",
    total_productos: productos.length,
    productos,
  });
}
