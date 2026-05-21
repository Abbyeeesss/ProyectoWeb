import * as ordenModel from "../models/ordenModel.js";
import * as productoModel from "../models/productoModel.js";

function parseProductoId(fuente) {
  const raw = fuente?.producto_id;
  if (raw == null || raw === "") return undefined;
  const id = Number(raw);
  if (!id || id < 1) return { error: "producto_id debe ser un entero positivo." };
  return { producto_id: id };
}

export async function generar(req, res) {
  const parsed = parseProductoId({ ...req.query, ...req.body });
  if (parsed?.error) return res.status(400).json({ error: parsed.error });

  const producto_id = parsed?.producto_id;

  if (producto_id && !(await productoModel.obtenerProducto(producto_id))) {
    return res.status(404).json({ error: "Producto no encontrado." });
  }

  const resultado = await ordenModel.generarOrdenes({ producto_id });

  if (resultado.total_ordenes === 0) {
    return res.status(400).json({
      error:
        "No se generaron órdenes: no hay productos con cantidad a pedir tras aplicar punto de reorden y frecuencia por tipo.",
    });
  }

  res.status(201).json(resultado);
}
