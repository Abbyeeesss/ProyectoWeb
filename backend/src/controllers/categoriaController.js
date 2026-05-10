import * as categoriaModel from "../models/categoriaModel.js";

export function list(req, res) {
  res.json(categoriaModel.listarCategorias());
}

export function create(req, res) {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre?.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio." });
    }
    const row = categoriaModel.crearCategoria({ nombre, descripcion });
    res.status(201).json(row);
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Ya existe una categoría con ese nombre." });
    }
    throw e;
  }
}

export function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { nombre, descripcion } = req.body;
    if (!nombre?.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio." });
    }
    const actual = categoriaModel.obtenerCategoria(id);
    if (!actual) return res.status(404).json({ error: "Categoría no encontrada." });
    res.json(categoriaModel.actualizarCategoria(id, { nombre, descripcion }));
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Ya existe una categoría con ese nombre." });
    }
    throw e;
  }
}

export function remove(req, res) {
  const id = Number(req.params.id);
  const actual = categoriaModel.obtenerCategoria(id);
  if (!actual) return res.status(404).json({ error: "Categoría no encontrada." });
  try {
    categoriaModel.eliminarCategoria(id);
    res.status(204).send();
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(409).json({
        error: "No se puede eliminar: hay productos usando esta categoría.",
      });
    }
    throw e;
  }
}
