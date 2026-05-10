import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Categorias() {
  const [rows, setRows] = useState([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      setRows(await api.getCategorias())
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

  function startEdit(row) {
    setEditId(row.id)
    setNombre(row.nombre)
    setDescripcion(row.descripcion ?? '')
  }

  function cancelEdit() {
    setEditId(null)
    setNombre('')
    setDescripcion('')
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    try {
      if (editId) {
        await api.putCategoria(editId, { nombre, descripcion })
      } else {
        await api.postCategoria({ nombre, descripcion })
      }
      cancelEdit()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await api.deleteCategoria(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h1>Categorías</h1>
      {error && <p className="error-banner">{error}</p>}
      <form className="panel" onSubmit={guardar}>
        <h2>{editId ? 'Editar' : 'Nueva'} categoría</h2>
        <label className="field">
          <span>Nombre</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label className="field">
          <span>Descripción</span>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} />
        </label>
        <div className="actions">
          <button type="submit">Guardar</button>
          {editId && (
            <button type="button" className="ghost" onClick={cancelEdit}>
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
                <th>Nombre</th>
                <th>Descripción</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombre}</td>
                  <td>{r.descripcion || '—'}</td>
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
