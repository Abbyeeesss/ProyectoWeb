import * as proveedorModel from "../models/proveedorModel.js";
import * as ubicacionModel from "../models/ubicacionModel.js";
import { validarDocumentoIdentidad, validarRucProveedor } from "../validators/sensible.js";

async function validarCuerpoProveedor(body) {
  const errores = [];
  const nombre_comercial = body.nombre_comercial?.trim();
  const ruc = body.ruc?.trim();
  const representante_legal = body.representante_legal?.trim();
  const documento_identidad = body.documento_identidad?.trim();
  const ciudad_id = Number(body.ciudad_id);

  if (!nombre_comercial) errores.push("nombre_comercial es obligatorio.");
  if (!representante_legal) errores.push("representante_legal es obligatorio.");

  const vr = validarRucProveedor(ruc);
  if (!vr.ok) errores.push(vr.mensaje);

  const vd = validarDocumentoIdentidad(documento_identidad);
  if (!vd.ok) errores.push(`Documento del representante: ${vd.mensaje}`);

  if (!ciudad_id || !(await ubicacionModel.existeCiudad(ciudad_id))) {
    errores.push("ciudad_id debe referenciar una ciudad existente (use los desplegables).");
  }

  if (errores.length) return { ok: false, errores };

  return {
    ok: true,
    data: {
      nombre_comercial,
      ruc,
      representante_legal,
      documento_identidad,
      telefono: body.telefono,
      email: body.email,
      ciudad_id,
    },
  };
}

export async function list(req, res) {
  res.json(await proveedorModel.listarProveedores());
}

export async function getOne(req, res) {
  const id = Number(req.params.id);
  const row = await proveedorModel.obtenerProveedor(id);
  if (!row) return res.status(404).json({ error: "Proveedor no encontrado." });
  res.json(row);
}

export async function create(req, res) {
  try {
    const v = await validarCuerpoProveedor(req.body);
    if (!v.ok) return res.status(400).json({ error: v.errores.join(" ") });
    const row = await proveedorModel.crearProveedor(v.data);
    res.status(201).json(row);
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ error: "Ya existe un proveedor con ese RUC." });
    }
    throw e;
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (!(await proveedorModel.existeProveedor(id))) {
      return res.status(404).json({ error: "Proveedor no encontrado." });
    }
    const v = await validarCuerpoProveedor(req.body);
    if (!v.ok) return res.status(400).json({ error: v.errores.join(" ") });
    res.json(await proveedorModel.actualizarProveedor(id, v.data));
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ error: "Ya existe un proveedor con ese RUC." });
    }
    throw e;
  }
}

export async function remove(req, res) {
  const id = Number(req.params.id);
  if (!(await proveedorModel.existeProveedor(id))) {
    return res.status(404).json({ error: "Proveedor no encontrado." });
  }
  try {
    await proveedorModel.eliminarProveedor(id);
    res.status(204).send();
  } catch (e) {
    if (e.code === "23503") {
      return res.status(409).json({
        error: "No se puede eliminar: hay productos asociados a este proveedor.",
      });
    }
    throw e;
  }
}
