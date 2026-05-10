import * as categoriaModel from "../models/categoriaModel.js";

function esUniqueViolation(err) {
  return err.code === "23505";
}

function esForeignKey(err) {
  return err.code === "23503";
}

export async function list(req, res) {
  res.json(await categoriaModel.listarCategorias());
}

export async function create(req, res) {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre?.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio." });
    }
    const row = await categoriaModel.crearCategoria({ nombre, descripcion });
    res.status(201).json(row);
  } catch (e) {
    if (esUniqueViolation(e)) {
      return res.status(409).json({ error: "Ya existe una categoría con ese nombre." });
    }
    throw e;
  }
}

export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { nombre, descripcion } = req.body;
    if (!nombre?.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio." });
    }
    const actual = await categoriaModel.obtenerCategoria(id);
    if (!actual) return res.status(404).json({ error: "Categoría no encontrada." });
    res.json(await categoriaModel.actualizarCategoria(id, { nombre, descripcion }));
  } catch (e) {
    if (esUniqueViolation(e)) {
      return res.status(409).json({ error: "Ya existe una categoría con ese nombre." });
    }
    throw e;
  }
}

export async function remove(req, res) {
  const id = Number(req.params.id);
  const actual = await categoriaModel.obtenerCategoria(id);
  if (!actual) return res.status(404).json({ error: "Categoría no encontrada." });
  try {
    await categoriaModel.eliminarCategoria(id);
    res.status(204).send();
  } catch (e) {
    if (esForeignKey(e)) {
      return res.status(409).json({
        error: "No se puede eliminar: hay productos usando esta categoría.",
      });
    }
    throw e;
  }
}
