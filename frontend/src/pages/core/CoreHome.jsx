import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import UrgencyBadge from '../../components/core/UrgencyBadge'

function formato2(valor) {
  const n = Number(valor)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function diasStock(stock, velocidad) {
  const v = Number(velocidad)
  if (!Number.isFinite(v) || v <= 0) return null
  return Number(stock) / v
}

function nivelUrgencia(row) {
  const dias = diasStock(row.stock_actual, row.velocidad_consumo)
  if (row.stock_actual < row.punto_reorden) {
    if (dias != null && dias < 1) return 'urgente'
    const lead = Number(row.lead_time_dias)
    if (dias != null && Number.isFinite(lead) && dias < lead) return 'proximo'
    return 'urgente'
  }
  return 'preventivo'
}

function bucketsDesdeAlertas(alertas) {
  const grupos = { urgente: [], proximo: [], preventivo: [] }
  for (const row of alertas) {
    grupos[nivelUrgencia(row)].push(row.nombre)
  }
  return [
    { tag: 'Crítico', title: 'Críticos (Urgente)', items: grupos.urgente },
    { tag: 'Próximo', title: 'Próximos', items: grupos.proximo },
    { tag: 'Preventivo', title: 'Preventivo', items: grupos.preventivo },
  ]
}

export default function CoreHome() {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      setLoading(true)
      try {
        const data = await api.getComparacionStockPuntoReorden()
        if (!cancelado) {
          setAlertas(data.productos ?? [])
          setError('')
        }
      } catch (e) {
        if (!cancelado) {
          setError(e.message)
          setAlertas([])
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

  const buckets = bucketsDesdeAlertas(alertas)

  return (
    <>
      <div className="core-topbar">
        <div>
          <h2>Home</h2>
          {!loading && !error && (
            <p className="core-muted">
              {alertas.length} producto{alertas.length === 1 ? '' : 's'} en o bajo el punto de
              reorden
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="core-muted" style={{ color: '#b42318', marginBottom: 12 }}>
          {error}
        </p>
      )}

      <div className="core-cards">
        <div className="core-card full">
          <div className="core-home-buckets">
            {buckets.map((bucket) => (
              <div key={bucket.tag} className="core-home-bucket">
                <div className="core-bucket-tag">{bucket.tag}</div>
                <h3>{bucket.title}</h3>
                <ul className="core-bucket-list">
                  {bucket.items.length === 0 ? (
                    <li>Sin productos</li>
                  ) : (
                    bucket.items.map((item) => <li key={item}>{item}</li>)
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="core-card full">
          <div className="core-row">
            <h3>Productos críticos</h3>
          </div>
          <div className="core-divider" />
          <table className="core-table" aria-label="Lista de productos críticos">
            <thead>
              <tr>
                <th style={{ width: 160 }}>Urgencia</th>
                <th>Producto</th>
                <th style={{ width: 160 }}>Proveedor</th>
                <th style={{ width: 120 }}>Stock</th>
                <th style={{ width: 120 }}>Punto reorden</th>
                <th style={{ width: 140 }}>Días de stock</th>
                <th style={{ width: 220 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7}>Cargando…</td>
                </tr>
              )}
              {!loading && alertas.length === 0 && (
                <tr>
                  <td colSpan={7}>No hay productos en o bajo el punto de reorden.</td>
                </tr>
              )}
              {!loading &&
                alertas.map((row) => {
                  const urgencia = nivelUrgencia(row)
                  const dias = diasStock(row.stock_actual, row.velocidad_consumo)
                  return (
                    <tr key={row.producto_id}>
                      <td>
                        <UrgencyBadge level={urgencia} />
                      </td>
                      <td>
                        <strong>{row.nombre}</strong>
                        {row.sku && (
                          <div className="core-muted" style={{ fontSize: 12 }}>
                            {row.sku}
                          </div>
                        )}
                      </td>
                      <td>{row.proveedor_nombre ?? '—'}</td>
                      <td>{formato2(row.stock_actual)}</td>
                      <td>{formato2(row.punto_reorden)}</td>
                      <td>
                        {dias != null ? (
                          <>
                            <strong>{formato2(dias)}</strong> días
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <Link
                          to="/core/detalle"
                          className={`core-btn ${urgencia === 'urgente' ? 'primary' : ''}`}
                        >
                          Ver orden sugerida
                        </Link>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
