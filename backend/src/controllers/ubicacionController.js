import * as ubicacionModel from "../models/ubicacionModel.js";

export async function getPaises(req, res) {
  res.json(await ubicacionModel.listarPaises());
}

export async function getProvincias(req, res) {
  const paisId = Number(req.query.paisId);
  if (!paisId) {
    return res.status(400).json({ error: "Parámetro paisId requerido." });
  }
  res.json(await ubicacionModel.listarProvinciasPorPais(paisId));
}

export async function getCiudades(req, res) {
  const provinciaId = Number(req.query.provinciaId);
  if (!provinciaId) {
    return res.status(400).json({ error: "Parámetro provinciaId requerido." });
  }
  res.json(await ubicacionModel.listarCiudadesPorProvincia(provinciaId));
}
