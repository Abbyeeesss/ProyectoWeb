import { useEffect, useState } from 'react'
import { api } from '../api'

/**
 * País → provincia → ciudad: obligatorio usar selects encadenados (no entrada manual de FK).
 */
export default function UbicacionCascade({
  ciudadId,
  onCiudadChange,
  inicialPaisId,
  inicialProvinciaId,
}) {
  const [paises, setPaises] = useState([])
  const [provincias, setProvincias] = useState([])
  const [ciudades, setCiudades] = useState([])
  const [paisId, setPaisId] = useState(inicialPaisId ?? '')
  const [provinciaId, setProvinciaId] = useState(inicialProvinciaId ?? '')

  useEffect(() => {
    api.getPaises().then(setPaises).catch(console.error)
  }, [])

  useEffect(() => {
    if (!paisId) {
      setProvincias([])
      setProvinciaId('')
      return
    }
    api
      .getProvincias(paisId)
      .then(setProvincias)
      .catch(console.error)
  }, [paisId])

  useEffect(() => {
    if (!provinciaId) {
      setCiudades([])
      return
    }
    api
      .getCiudades(provinciaId)
      .then(setCiudades)
      .catch(console.error)
  }, [provinciaId])

  useEffect(() => {
    if (inicialPaisId) setPaisId(inicialPaisId)
  }, [inicialPaisId])

  useEffect(() => {
    if (inicialProvinciaId) setProvinciaId(inicialProvinciaId)
  }, [inicialProvinciaId])

  return (
    <div className="field-grid">
      <label className="field">
        <span>País</span>
        <select
          value={paisId}
          onChange={(e) => {
            setPaisId(e.target.value)
            setProvinciaId('')
            onCiudadChange('')
          }}
          required
        >
          <option value="">Seleccione…</option>
          {paises.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Provincia</span>
        <select
          value={provinciaId}
          onChange={(e) => {
            setProvinciaId(e.target.value)
            onCiudadChange('')
          }}
          required
          disabled={!paisId}
        >
          <option value="">Seleccione…</option>
          {provincias.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Ciudad</span>
        <select
          value={ciudadId ?? ''}
          onChange={(e) => onCiudadChange(Number(e.target.value) || '')}
          required
          disabled={!provinciaId}
        >
          <option value="">Seleccione…</option>
          {ciudades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
