import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'

function fechaHoy() {
  return new Date().toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function OrdenesSugeridas() {
  const [ordenes, setOrdenes] = useState([])
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      setLoading(true)
      try {
        const data = await api.postGenerarOrdenes()
        if (!cancelado) {
          setOrdenes(data.ordenes ?? [])
          setResumen(data)
          setError('')
        }
      } catch (e) {
        if (!cancelado) {
          setError(e.message)
          setOrdenes([])
          setResumen(null)
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [])

  function formatearFecha(iso) {
    if (!iso) return fechaHoy()
    return new Date(`${iso}T12:00:00`).toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <>
      <div className="core-topbar">
        <div>
          <h2>Órdenes sugeridas</h2>
          {!loading && !error && resumen && (
            <p className="core-muted">
              {resumen.total_ordenes} orden{resumen.total_ordenes === 1 ? '' : 'es'} ·{' '}
              {resumen.total_lineas} línea{resumen.total_lineas === 1 ? '' : 's'} ·{' '}
              {resumen.total_unidades} u. a pedir
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="core-muted" style={{ color: '#b42318', marginBottom: 12 }}>
          {error}
        </p>
      )}

      <div className="core-grid">
        <div className="core-card">
          <div className="core-row">
            <h3>Por proveedor</h3>
          </div>
          <div className="core-divider" />

          <div className="core-list">
            {loading && <p className="core-muted">Cargando…</p>}
            {!loading && ordenes.length === 0 && !error && (
              <p className="core-muted">No hay órdenes sugeridas. Ningún producto está en o bajo el punto de reorden.</p>
            )}
            {!loading &&
              ordenes.map((orden) => (
                <div key={orden.proveedor_id} className="core-order-card">
                  <div className="left">
                    <div className="top">
                      <strong>{orden.proveedor_nombre ?? `Proveedor #${orden.proveedor_id}`}</strong>
                      <span className="core-badge orange">{orden.estado ?? 'Sugerida'}</span>
                      {orden.frecuencia_reposicion === 'alta' ? (
                        <span className="core-badge red">Reposición alta</span>
                      ) : (
                        <span className="core-badge green">Reposición baja</span>
                      )}
                    </div>
                    <div className="meta">
                      <span>
                        Productos: {orden.cantidad_productos} · Unidades: {orden.total_unidades}
                      </span>
                      <span>Fecha: {formatearFecha(orden.fecha)}</span>
                    </div>
                  </div>
                  <div className="right">
                    <Link to="/core/detalle" className="core-btn">
                      Ver detalle
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
