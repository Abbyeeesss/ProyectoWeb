import * as puntoReordenModel from "../models/puntoReordenModel.js";
import * as productoModel from "../models/productoModel.js";
import { parseRangoFechas } from "../utils/rangoFechas.js";


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

export async function listar(req, res) {
  res.json(await puntoReordenModel.listarPuntosReorden());
}

export async function compararStock(req, res) {
  let producto_id;
  if (req.query.producto_id != null && req.query.producto_id !== "") {
    producto_id = Number(req.query.producto_id);
    if (!producto_id || producto_id < 1) {
      return res.status(400).json({ error: "producto_id debe ser un entero positivo." });
    }
  }

  if (producto_id && !(await productoModel.obtenerProducto(producto_id))) {
    return res.status(404).json({ error: "Producto no encontrado." });
  }

  res.json(await puntoReordenModel.compararStockActualVsPuntoReordenPorProducto({ producto_id }));
}
