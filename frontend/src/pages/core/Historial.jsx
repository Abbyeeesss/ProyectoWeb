import { Link } from 'react-router-dom'
import { historialOrdenes } from '../../core/mockData'

export default function Historial() {
  return (
    <>
      <div className="core-topbar">
        <div>
          <h2>Historial de órdenes confirmadas</h2>
        </div>
        <div className="core-actions">
          <Link to="/core" className="core-btn">
            Home
          </Link>
        </div>
      </div>

      <div className="core-grid">
        <div className="core-card compact">
          <div className="core-row">
            <div>
              <h3>Filtros</h3>
              <div className="meta">Por rango de fechas y proveedor.</div>
            </div>
            <span className="core-chip">Confirmadas: 6</span>
          </div>
          <div className="core-divider" />
          <div className="core-field-row">
            <div className="core-field">
              <label>
                Desde
                <input type="date" defaultValue="2026-04-01" />
              </label>
            </div>
            <div className="core-field">
              <label>
                Hasta
                <input type="date" defaultValue="2026-04-25" />
              </label>
            </div>
            <div className="core-field">
              <label>
                Proveedor
                <select defaultValue="Todos">
                  <option>Todos</option>
                  <option>Abarrotes Central</option>
                  <option>Frutas Don Pepe</option>
                  <option>Lácteos La Vaquita</option>
                </select>
              </label>
            </div>
            <button type="button" className="core-btn">
              Buscar
            </button>
          </div>
        </div>

        <div className="core-card">
          <div className="core-row">
            <div>
              <h3>Órdenes confirmadas</h3>
              <div className="meta">Lista con fecha, proveedor y total de productos.</div>
            </div>
          </div>
          <div className="core-divider" />
          <table className="core-table" aria-label="Historial de órdenes confirmadas">
            <thead>
              <tr>
                <th style={{ width: 160 }}>Fecha</th>
                <th>Proveedor</th>
                <th style={{ width: 160 }}>Productos</th>
                <th style={{ width: 160 }}>Estado</th>
                <th style={{ width: 180 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {historialOrdenes.map((row) => (
                <tr key={`${row.fecha}-${row.proveedor}`}>
                  <td>{row.fecha}</td>
                  <td>
                    <strong>{row.proveedor}</strong>
                  </td>
                  <td>{row.productos}</td>
                  <td>
                    <span className="core-badge green">Confirmada</span>
                  </td>
                  <td>
                    <Link to="/core/detalle" className="core-btn">
                      Ver detalle
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
