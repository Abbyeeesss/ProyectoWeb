import { Link } from 'react-router-dom'

export default function AdminHome() {
  return (
    <div className="page">
      <h1>Administración — Abastecimiento minorista</h1>
      <ul className="card-list">
        <li>
          <Link to="/admin/proveedores">
            <strong>Proveedores</strong>
          </Link>
        </li>
        <li>
          <Link to="/admin/productos">
            <strong>Productos</strong>
          </Link>
        </li>
        <li>
          <Link to="/admin/categorias">
            <strong>Categorías</strong>
          </Link>
        </li>
      </ul>
    </div>
  )
}
