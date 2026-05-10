import * as ubicacionModel from "../models/ubicacionModel.js";

export function getPaises(req, res) {
  res.json(ubicacionModel.listarPaises());
}

export function getProvincias(req, res) {
  const paisId = Number(req.query.paisId);
  if (!paisId) {
    return res.status(400).json({ error: "Parámetro paisId requerido." });
  }
  res.json(ubicacionModel.listarProvinciasPorPais(paisId));
}

export function getCiudades(req, res) {
  const provinciaId = Number(req.query.provinciaId);
  if (!provinciaId) {
    return res.status(400).json({ error: "Parámetro provinciaId requerido." });
  }
  res.json(ubicacionModel.listarCiudadesPorProvincia(provinciaId));
}
