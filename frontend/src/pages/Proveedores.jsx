import { useEffect, useState } from 'react'
import { api } from '../api'
import UbicacionCascade from '../components/UbicacionCascade'

const emptyForm = {
  nombre_comercial: '',
  representante_legal: '',
  documento_identidad: '',
  telefono: '',
  email: '',
  ciudad_id: '',
  lead_time_dias: '7',
}

export default function Proveedores() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [inicialPaisId, setInicialPaisId] = useState(null)
  const [inicialProvinciaId, setInicialProvinciaId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      setRows(await api.getProveedores())
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function startEdit(row) {
    setError('')
    try {
      const det = await api.getProveedor(row.id)
      setEditId(det.id)
      setForm({
        nombre_comercial: det.nombre_comercial,
        representante_legal: det.representante_legal,
        documento_identidad: det.documento_identidad,
        telefono: det.telefono ?? '',
        email: det.email ?? '',
        ciudad_id: det.ciudad_id,
        lead_time_dias: String(det.lead_time_dias ?? 7),
      })
      setInicialPaisId(det.pais_id)
      setInicialProvinciaId(det.provincia_id)
    } catch (e) {
      setError(e.message)
    }
  }

  function cancelar() {
    setEditId(null)
    setForm(emptyForm)
    setInicialPaisId(null)
    setInicialProvinciaId(null)
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    const ciudad_id = Number(form.ciudad_id)
    if (!ciudad_id) {
      setError('Seleccione país, provincia y ciudad.')
      return
    }
    const body = {
      nombre_comercial: form.nombre_comercial,
      representante_legal: form.representante_legal,
      documento_identidad: form.documento_identidad,
      telefono: form.telefono || null,
      email: form.email || null,
      ciudad_id,
      lead_time_dias: form.lead_time_dias,
    }
    try {
      if (editId) await api.putProveedor(editId, body)
      else await api.postProveedor(body)
      cancelar()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este proveedor?')) return
    try {
      await api.deleteProveedor(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h1>Proveedores</h1>
      {error && <p className="error-banner">{error}</p>}

      <form className="panel" onSubmit={guardar}>
        <h2>{editId ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
        <div className="field-grid two">
          <label className="field">
            <span>Nombre comercial</span>
            <input
              value={form.nombre_comercial}
              onChange={(e) => setField('nombre_comercial', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Representante legal</span>
            <input
              value={form.representante_legal}
              onChange={(e) => setField('representante_legal', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Cédula del representante (10 dígitos)</span>
            <input
              value={form.documento_identidad}
              onChange={(e) =>
                setField('documento_identidad', e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              required
              inputMode="numeric"
            />
          </label>
        </div>
        <UbicacionCascade
          key={`${editId ?? 'new'}-${inicialPaisId ?? ''}-${inicialProvinciaId ?? ''}`}
          ciudadId={form.ciudad_id}
          inicialPaisId={inicialPaisId}
          inicialProvinciaId={inicialProvinciaId}
          onCiudadChange={(id) => setField('ciudad_id', id || '')}
        />
        <div className="field-grid two">
          <label className="field">
            <span>Teléfono</span>
            <input value={form.telefono} onChange={(e) => setField('telefono', e.target.value)} />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
          </label>
          <label className="field">
            <span>Lead time (días)</span>
            <input
              type="number"
              min="1"
              value={form.lead_time_dias}
              onChange={(e) => setField('lead_time_dias', e.target.value)}
              required
            />
          </label>
        </div>
        <div className="actions">
          <button type="submit">Guardar</button>
          {editId && (
            <button type="button" className="ghost" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="panel">
        <h2>Listado</h2>
        {loading ? (
          <p>Cargando…</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Comercial</th>
                <th>Lead time</th>
                <th>Ciudad</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombre_comercial}</td>
                  <td>{r.lead_time_dias}</td>
                  <td>
                    {r.ciudad_nombre}, {r.provincia_nombre} ({r.pais_nombre})
                  </td>
                  <td className="row-actions">
                    <button type="button" className="linkish" onClick={() => startEdit(r)}>
                      Editar
                    </button>
                    <button type="button" className="linkish danger" onClick={() => eliminar(r.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
