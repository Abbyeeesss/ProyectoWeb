import { useEffect, useState } from 'react'
import { api } from '../api'

const empty = {
  sku: '',
  nombre: '',
  proveedor_id: '',
  categoria_id: '',
  precio_referencia: '',
  stock_actual: '',
  dias_lead_time: '7',
  es_perecedero: false,
}

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    setLoading(true)
    try {
      const [p, pr, c] = await Promise.all([
        api.getProductos(),
        api.getProveedores(),
        api.getCategorias(),
      ])
      setProductos(p)
      setProveedores(pr)
      setCategorias(c)
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function editar(row) {
    setEditId(row.id)
    setForm({
      sku: row.sku,
      nombre: row.nombre,
      proveedor_id: row.proveedor_id,
      categoria_id: row.categoria_id,
      precio_referencia: row.precio_referencia,
      stock_actual: row.stock_actual,
      dias_lead_time: row.dias_lead_time,
      es_perecedero: Boolean(row.es_perecedero),
    })
  }

  function cancelar() {
    setEditId(null)
    setForm(empty)
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    const body = {
      sku: form.sku,
      nombre: form.nombre,
      proveedor_id: Number(form.proveedor_id),
      categoria_id: Number(form.categoria_id),
      precio_referencia: form.precio_referencia,
      stock_actual: form.stock_actual,
      dias_lead_time: form.dias_lead_time,
      es_perecedero: form.es_perecedero,
    }
    try {
      if (editId) await api.putProducto(editId, body)
      else await api.postProducto(body)
      cancelar()
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar producto?')) return
    try {
      await api.deleteProducto(id)
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h1>Productos</h1>
      <p className="muted">
        Proveedor y categoría se eligen de listas; el API rechaza IDs que no existan (no confiar solo en el
        navegador).
      </p>
      {error && <p className="error-banner">{error}</p>}

      <form className="panel" onSubmit={guardar}>
        <h2>{editId ? 'Editar producto' : 'Nuevo producto'}</h2>
        <div className="field-grid two">
          <label className="field">
            <span>SKU</span>
            <input value={form.sku} onChange={(e) => setField('sku', e.target.value)} required />
          </label>
          <label className="field">
            <span>Nombre</span>
            <input value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} required />
          </label>
        </div>
        <div className="field-grid two">
          <label className="field">
            <span>Proveedor</span>
            <select
              value={form.proveedor_id}
              onChange={(e) => setField('proveedor_id', e.target.value)}
              required
            >
              <option value="">Seleccione…</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre_comercial}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Categoría</span>
            <select
              value={form.categoria_id}
              onChange={(e) => setField('categoria_id', e.target.value)}
              required
            >
              <option value="">Seleccione…</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="field-grid three">
          <label className="field">
            <span>Precio referencia</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.precio_referencia}
              onChange={(e) => setField('precio_referencia', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Stock actual</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.stock_actual}
              onChange={(e) => setField('stock_actual', e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Lead time (días)</span>
            <input
              type="number"
              min="1"
              value={form.dias_lead_time}
              onChange={(e) => setField('dias_lead_time', e.target.value)}
              required
            />
          </label>
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.es_perecedero}
            onChange={(e) => setField('es_perecedero', e.target.checked)}
          />
          Producto perecedero (prioriza pedidos más frecuentes en el core)
        </label>
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
                <th>SKU</th>
                <th>Nombre</th>
                <th>Proveedor</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Lead</th>
                <th>Perecedero</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {productos.map((r) => (
                <tr key={r.id}>
                  <td>{r.sku}</td>
                  <td>{r.nombre}</td>
                  <td>{r.proveedor_nombre}</td>
                  <td>{r.categoria_nombre}</td>
                  <td>{r.stock_actual}</td>
                  <td>{r.dias_lead_time}</td>
                  <td>{r.es_perecedero ? 'Sí' : 'No'}</td>
                  <td className="row-actions">
                    <button type="button" className="linkish" onClick={() => editar(r)}>
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
