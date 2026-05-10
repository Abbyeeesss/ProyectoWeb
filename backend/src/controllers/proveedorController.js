import * as proveedorModel from "../models/proveedorModel.js";
import * as ubicacionModel from "../models/ubicacionModel.js";
import { validarDocumentoIdentidad, validarRucProveedor } from "../validators/sensible.js";

function validarCuerpoProveedor(body) {
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

  if (!ciudad_id || !ubicacionModel.existeCiudad(ciudad_id)) {
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

export function list(req, res) {
  res.json(proveedorModel.listarProveedores());
}

export function getOne(req, res) {
  const id = Number(req.params.id);
  const row = proveedorModel.obtenerProveedor(id);
  if (!row) return res.status(404).json({ error: "Proveedor no encontrado." });
  res.json(row);
}

export function create(req, res) {
  try {
    const v = validarCuerpoProveedor(req.body);
    if (!v.ok) return res.status(400).json({ error: v.errores.join(" ") });
    const row = proveedorModel.crearProveedor(v.data);
    res.status(201).json(row);
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Ya existe un proveedor con ese RUC." });
    }
    throw e;
  }
}

export function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (!proveedorModel.existeProveedor(id)) {
      return res.status(404).json({ error: "Proveedor no encontrado." });
    }
    const v = validarCuerpoProveedor(req.body);
    if (!v.ok) return res.status(400).json({ error: v.errores.join(" ") });
    res.json(proveedorModel.actualizarProveedor(id, v.data));
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Ya existe un proveedor con ese RUC." });
    }
    throw e;
  }
}

export function remove(req, res) {
  const id = Number(req.params.id);
  if (!proveedorModel.existeProveedor(id)) {
    return res.status(404).json({ error: "Proveedor no encontrado." });
  }
  try {
    proveedorModel.eliminarProveedor(id);
    res.status(204).send();
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(409).json({
        error: "No se puede eliminar: hay productos asociados a este proveedor.",
      });
    }
    throw e;
  }
}
