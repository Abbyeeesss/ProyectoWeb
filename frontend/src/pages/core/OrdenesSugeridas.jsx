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
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      setLoading(true)
      try {
        const data = await api.getReponerPorProveedor()
        if (!cancelado) {
          setProveedores(data.proveedores ?? [])
          setError('')
        }
      } catch (e) {
        if (!cancelado) {
          setError(e.message)
          setProveedores([])
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

  const fecha = fechaHoy()

  return (
    <>
      <div className="core-topbar">
        <div>
          <h2>Órdenes sugeridas</h2>
          {!loading && !error && (
            <p className="core-muted">
              {proveedores.length} proveedor{proveedores.length === 1 ? '' : 'es'} ·{' '}
              {proveedores.reduce((n, p) => n + p.cantidad_productos, 0)} producto
              {proveedores.reduce((n, p) => n + p.cantidad_productos, 0) === 1 ? '' : 's'} a
              reponer
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
            {!loading && proveedores.length === 0 && (
              <p className="core-muted">No hay órdenes sugeridas. Ningún producto está en o bajo el punto de reorden.</p>
            )}
            {!loading &&
              proveedores.map((orden) => (
                <div key={orden.proveedor_id} className="core-order-card">
                  <div className="left">
                    <div className="top">
                      <strong>{orden.proveedor_nombre ?? `Proveedor #${orden.proveedor_id}`}</strong>
                      <span className="core-badge orange">Sugerida</span>
                    </div>
                    <div className="meta">
                      <span>
                        Productos: {orden.cantidad_productos}
                      </span>
                      <span>Fecha: {fecha}</span>
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
