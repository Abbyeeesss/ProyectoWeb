import { Link } from 'react-router-dom'
import UrgencyBadge from '../../components/core/UrgencyBadge'
import { homeBuckets, productosInventario } from '../../core/mockData'

export default function CoreHome() {
  return (
    <>
      <div className="core-topbar">
        <div>
          <h2>Home</h2>
        </div>
      </div>

      <div className="core-cards">
        <div className="core-card full">
          <div className="core-home-buckets">
            {homeBuckets.map((bucket) => (
              <div key={bucket.tag} className="core-home-bucket">
                <div className="core-bucket-tag">{bucket.tag}</div>
                <h3>{bucket.title}</h3>
                <ul className="core-bucket-list">
                  {bucket.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
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
                <th style={{ width: 160 }}>Stock actual</th>
                <th style={{ width: 180 }}>Días de stock</th>
                <th style={{ width: 220 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosInventario.map((row) => (
                <tr key={row.producto}>
                  <td>
                    <UrgencyBadge level={row.urgencia} />
                  </td>
                  <td>
                    <strong>{row.producto}</strong>
                  </td>
                  <td>{row.proveedor}</td>
                  <td>{row.stock}</td>
                  <td>
                    <strong>{row.dias}</strong> días
                  </td>
                  <td>
                    <Link
                      to="/core/detalle"
                      className={`core-btn ${row.primary ? 'primary' : ''}`}
                    >
                      Ver orden sugerida
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
