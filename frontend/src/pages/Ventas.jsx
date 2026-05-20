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

function formato2(valor) {
  const n = Number(valor)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Ventas() {
  const defaults = rangoPorDefecto()
  const [desde, setDesde] = useState(defaults.desde)
  const [hasta, setHasta] = useState(defaults.hasta)
  const [productoId, setProductoId] = useState('')
  const [productos, setProductos] = useState([])
  const [resultado, setResultado] = useState(null)
  const [promedios, setPromedios] = useState(null)
  const [desviaciones, setDesviaciones] = useState(null)
  const [puntosReorden, setPuntosReorden] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const filtros = () => ({
    desde,
    hasta,
    producto_id: productoId || undefined,
  })

  async function ejecutarBusqueda(f) {
    const [data, prom, desv] = await Promise.all([
      api.getVentasHistorial(f),
      api.getVentasPromedioDiario(f),
      api.getVentasDesviacionEstandar(f),
    ])
    setResultado(data)
    setPromedios(prom)
    setDesviaciones(desv)

    if (prom.total_productos > 0) {
      const guardado = await api.guardarPuntosReorden(f)
      setPuntosReorden(guardado.registros)
    } else {
      setPuntosReorden(await api.getPuntosReorden())
    }
  }

  async function buscar(e) {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      await ejecutarBusqueda(filtros())
    } catch (err) {
      setResultado(null)
      setPromedios(null)
      setDesviaciones(null)
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
        const prods = await api.getProductos()
        if (cancelled) return
        setProductos(prods)
        await ejecutarBusqueda(f)
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
  const puntoPorProducto = new Map(puntosReorden.map((p) => [p.producto_id, p]))
  const desviacionPorProducto = new Map(
    (desviaciones?.productos ?? []).map((p) => [p.producto_id, p.desviacion_estandar_diaria]),
  )

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
            {loading ? 'Calculando…' : 'Buscar'}
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
                <th>Desv. estándar / día</th>
                <th>Lead time</th>
                <th>Punto reorden</th>
              </tr>
            </thead>
            <tbody>
              {filasPromedio.map((p) => {
                const guardado = puntoPorProducto.get(p.producto_id)
                return (
                  <tr key={p.producto_id}>
                    <td>{p.producto_sku}</td>
                    <td>{p.producto_nombre}</td>
                    <td>{formato2(p.unidades_vendidas)}</td>
                    <td>{p.registros_venta}</td>
                    <td>
                      <strong>{formato2(p.promedio_unidades_por_dia)}</strong>
                    </td>
                    <td>
                      <strong>{formato2(desviacionPorProducto.get(p.producto_id))}</strong>
                    </td>
                    <td>{guardado?.dias_lead_time ?? '—'}</td>
                    <td>
                      <strong>{formato2(guardado?.punto_reorden)}</strong>
                    </td>
                  </tr>
                )
              })}
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
                  <td>{formato2(v.cantidad)}</td>
                  <td>{formato2(v.precio_unitario)}</td>
                  <td>
                    <strong>{formato2(v.total)}</strong>
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
