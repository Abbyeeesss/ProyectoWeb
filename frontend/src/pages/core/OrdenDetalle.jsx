import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UrgencyBadge from '../../components/core/UrgencyBadge'
import WireframeToast from '../../components/core/WireframeToast'
import { detalleOrden } from '../../core/mockData'

export default function OrdenDetalle() {
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [cantidades, setCantidades] = useState(() =>
    Object.fromEntries(detalleOrden.lineas.map((l) => [l.producto, l.sugerida])),
  )

  return (
    <>
      <div className="core-order-header">
        <div className="core-order-header-accent" aria-hidden="true" />
        <div className="core-order-header-body">
          <div>
            <h2 className="core-order-header-title">
              Orden sugerida: Proveedor {detalleOrden.proveedor}
            </h2>
            <p className="core-order-header-meta">
              Fecha: {detalleOrden.fecha} <span>|</span> Estado: {detalleOrden.estado}
            </p>
          </div>
          <div className="core-actions">
            <button
              type="button"
              className="core-btn discard"
              onClick={() => {
                setToast('Orden descartada (simulado).')
                setTimeout(() => navigate('/core'), 400)
              }}
            >
              Descartar Orden
            </button>
            <button
              type="button"
              className="core-btn confirm"
              onClick={() => {
                setToast('Orden confirmada (simulado).')
                setTimeout(() => navigate('/core/historial'), 400)
              }}
            >
              Confirmar Orden
            </button>
          </div>
        </div>
      </div>

      <div className="core-grid">
        <div className="core-card">
          <table className="core-table" aria-label="Detalle de productos en la orden">
            <thead>
              <tr>
                <th>Producto</th>
                <th style={{ width: 130 }}>Categoría</th>
                <th style={{ width: 130 }}>Stock actual</th>
                <th style={{ width: 150 }}>Días de stock</th>
                <th style={{ width: 170 }}>Cant. sugerida</th>
                <th style={{ width: 190 }}>Cant. a pedir</th>
                <th style={{ width: 140 }}>Prioridad</th>
                <th>Justificación</th>
              </tr>
            </thead>
            <tbody>
              {detalleOrden.lineas.map((linea) => (
                <tr key={linea.producto}>
                  <td>
                    <strong>{linea.producto}</strong>
                  </td>
                  <td>{linea.categoria}</td>
                  <td>{linea.stock}</td>
                  <td>
                    <strong>{linea.dias}</strong> días
                  </td>
                  <td>
                    <strong>{linea.sugerida}</strong> {linea.unidad}
                  </td>
                  <td>
                    <input
                      type="number"
                      value={cantidades[linea.producto]}
                      min={0}
                      step={1}
                      aria-label={`Cantidad a pedir ${linea.producto}`}
                      onChange={(e) =>
                        setCantidades((prev) => ({
                          ...prev,
                          [linea.producto]: Number(e.target.value),
                        }))
                      }
                    />
                  </td>
                  <td>
                    <UrgencyBadge level={linea.prioridad} />
                  </td>
                  <td className="core-muted">{linea.justificacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <WireframeToast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
