import * as productoModel from "../models/productoModel.js";
import * as proveedorModel from "../models/proveedorModel.js";
import * as categoriaModel from "../models/categoriaModel.js";

async function validarProducto(body) {
  const errores = [];
  const sku = body.sku?.trim();
  const nombre = body.nombre?.trim();
  const proveedor_id = Number(body.proveedor_id);
  const categoria_id = Number(body.categoria_id);

  if (!sku) errores.push("SKU obligatorio.");
  if (!nombre) errores.push("Nombre obligatorio.");

  if (!proveedor_id || !(await proveedorModel.existeProveedor(proveedor_id))) {
    errores.push("Debe seleccionar un proveedor válido de la lista (no ingrese IDs manualmente sin validar).");
  }
  if (!categoria_id || !(await categoriaModel.obtenerCategoria(categoria_id))) {
    errores.push("Debe seleccionar una categoría válida de la lista.");
  }

  if (errores.length) return { ok: false, errores };

  return {
    ok: true,
    data: {
      sku,
      nombre,
      proveedor_id,
      categoria_id,
      precio_referencia: body.precio_referencia,
      es_perecedero: Boolean(body.es_perecedero),
      stock_actual: body.stock_actual,
      dias_lead_time: body.dias_lead_time,
    },
  };
}

export async function list(req, res) {
  res.json(await productoModel.listarProductos());
}

export async function create(req, res) {
  try {
    const v = await validarProducto(req.body);
    if (!v.ok) return res.status(400).json({ error: v.errores.join(" ") });
    const row = await productoModel.crearProducto(v.data);
    res.status(201).json(row);
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ error: "Ya existe un producto con ese SKU." });
    }
    throw e;
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const actual = await productoModel.obtenerProducto(id);
    if (!actual) return res.status(404).json({ error: "Producto no encontrado." });
    const v = await validarProducto(req.body);
    if (!v.ok) return res.status(400).json({ error: v.errores.join(" ") });
    res.json(await productoModel.actualizarProducto(id, v.data));
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ error: "Ya existe un producto con ese SKU." });
    }
    throw e;
  }
}

export async function remove(req, res) {
  const id = Number(req.params.id);
  const actual = await productoModel.obtenerProducto(id);
  if (!actual) return res.status(404).json({ error: "Producto no encontrado." });
  await productoModel.eliminarProducto(id);
  res.status(204).send();
}
