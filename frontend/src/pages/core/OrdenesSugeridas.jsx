import { Link } from 'react-router-dom'
import { ordenesPorProveedor } from '../../core/mockData'

export default function OrdenesSugeridas() {
  return (
    <>
      <div className="core-topbar">
        <div>
          <h2>Órdenes sugeridas</h2>
        </div>
      </div>

      <div className="core-grid">
        <div className="core-card">
          <div className="core-row">
            <h3>Por proveedor</h3>
          </div>
          <div className="core-divider" />

          <div className="core-list">
            {ordenesPorProveedor.map((orden) => (
              <div key={orden.proveedor} className="core-order-card">
                <div className="left">
                  <div className="top">
                    <strong>{orden.proveedor}</strong>
                    <span className="core-badge green">Confirmada</span>
                  </div>
                  <div className="meta">
                    <span>Productos: {orden.productos}</span>
                    <span>Fecha: {orden.fecha}</span>
                  </div>
                </div>
                <div className="right">
                  <Link
                    to={orden.link === 'historial' ? '/core/historial' : '/core/detalle'}
                    className="core-btn"
                  >
                    {orden.label ?? 'Ver detalle'}
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
