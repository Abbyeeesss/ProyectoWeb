import { useEffect, useState } from 'react'
import { api } from '../api'

function toInputDate(date) {
  return date.toISOString().slice(0, 10)
}

function rangoPorDefecto() {
  const hasta = new Date()
  const desde = new Date()
  desde.setDate(desde.getDate() - 30)
  return { desde: toInputDate(desde), hasta: toInputDate(hasta) }
}

function formatearFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function Ventas() {
  const defaults = rangoPorDefecto()
  const [desde, setDesde] = useState(defaults.desde)
  const [hasta, setHasta] = useState(defaults.hasta)
  const [productoId, setProductoId] = useState('')
  const [productos, setProductos] = useState([])
  const [resultado, setResultado] = useState(null)
  const [promedios, setPromedios] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const filtros = () => ({
    desde,
    hasta,
    producto_id: productoId || undefined,
  })

  async function buscar(e) {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      const [data, prom] = await Promise.all([
        api.getVentasHistorial(filtros()),
        api.getVentasPromedioDiario(filtros()),
      ])
      setResultado(data)
      setPromedios(prom)
    } catch (err) {
      setResultado(null)
      setPromedios(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      const f = { desde: defaults.desde, hasta: defaults.hasta }
      try {
        const [prods, data, prom] = await Promise.all([
          api.getProductos(),
          api.getVentasHistorial(f),
          api.getVentasPromedioDiario(f),
        ])
        if (cancelled) return
        setProductos(prods)
        setResultado(data)
        setPromedios(prom)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const ventas = resultado?.ventas ?? []
  const filasPromedio = promedios?.productos ?? []

  return (
    <div className="page">
      <h1>Historial de ventas</h1>

      {error && <p className="error-banner">{error}</p>}

      <form className="panel" onSubmit={buscar}>
        <h2>Filtros</h2>
        <div className="field-grid three">
          <label className="field">
            <span>Desde</span>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} required />
          </label>
          <label className="field">
            <span>Hasta</span>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} required />
          </label>
          <label className="field">
            <span>Producto</span>
            <select value={productoId} onChange={(e) => setProductoId(e.target.value)}>
              <option value="">Todos</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
        </div>
      </form>

      <div className="panel">
        <div className="core-row" style={{ marginBottom: '0.5rem' }}>
          <h2 style={{ margin: 0 }}>Promedio diario por producto</h2>
          {promedios && (
            <span className="core-chip">
              {promedios.total_productos} producto{promedios.total_productos === 1 ? '' : 's'} ·{' '}
              {promedios.dias_calendario} días
            </span>
          )}
        </div>
        {loading && !promedios ? (
          <p>Cargando…</p>
        ) : filasPromedio.length === 0 ? (
          <p className="muted">Sin ventas en el rango: no hay promedios que calcular.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Unidades vendidas</th>
                <th>Registros</th>
                <th>Promedio / día</th>
              </tr>
            </thead>
            <tbody>
              {filasPromedio.map((p) => (
                <tr key={p.producto_id}>
                  <td>{p.producto_sku}</td>
                  <td>{p.producto_nombre}</td>
                  <td>{p.unidades_vendidas}</td>
                  <td>{p.registros_venta}</td>
                  <td>
                    <strong>{p.promedio_unidades_por_dia}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="core-row" style={{ marginBottom: '0.5rem' }}>
          <h2 style={{ margin: 0 }}>Detalle de ventas</h2>
          {resultado && (
            <span className="core-chip">
              {resultado.total} venta{resultado.total === 1 ? '' : 's'} · {resultado.desde} — {resultado.hasta}
            </span>
          )}
        </div>
        {loading && !resultado ? (
          <p>Cargando…</p>
        ) : ventas.length === 0 ? (
          <p className="muted">No hay ventas en el rango seleccionado.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>SKU</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>P. unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id}>
                  <td>{formatearFecha(v.fecha)}</td>
                  <td>{v.producto_sku}</td>
                  <td>{v.producto_nombre}</td>
                  <td>{v.categoria_nombre ?? '—'}</td>
                  <td>{v.cantidad}</td>
                  <td>{Number(v.precio_unitario).toFixed(2)}</td>
                  <td>
                    <strong>{v.total != null ? Number(v.total).toFixed(2) : '—'}</strong>
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
