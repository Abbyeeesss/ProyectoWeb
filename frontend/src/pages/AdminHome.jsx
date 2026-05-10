import { Link } from 'react-router-dom'

export default function AdminHome() {
  return (
    <div className="page">
      <h1>Administración — Abastecimiento minorista</h1>
      <p className="lead">
        Panel de mantenimiento alineado al <strong>core aprobado</strong>: inventario por producto,
        proveedores con tiempo de entrega (lead time), categorías y datos que alimentan las órdenes
        sugeridas del sistema.
      </p>
      <ul className="card-list">
        <li>
          <Link to="/admin/proveedores">
            <strong>Proveedores</strong>
            <span>Ubicación en cascada (país → provincia → ciudad). RUC y cédula validados en servidor.</span>
          </Link>
        </li>
        <li>
          <Link to="/admin/productos">
            <strong>Productos</strong>
            <span>SKU, stock, lead time, perecedero. Proveedor y categoría solo por listas.</span>
          </Link>
        </li>
        <li>
          <Link to="/admin/categorias">
            <strong>Categorías</strong>
            <span>Agrupación para pedidos y políticas de reposición.</span>
          </Link>
        </li>
      </ul>
      <section className="note">
        <h2>Requisitos académicos cubiertos</h2>
        <ul>
          <li>
            Validación en <strong>back-end</strong> de datos sensibles:{' '}
            <code>documento_identidad</code> (cédula EC módulo 10) y <code>ruc</code> en{' '}
            <code>backend/src/validators/sensible.js</code>.
          </li>
          <li>
            Claves foráneas por <strong>desplegables dependientes</strong>, no inputs libres de IDs.
          </li>
          <li>
            API REST MVC en Node (modelos / controladores / rutas) + SPA React consumiendo la API.
          </li>
        </ul>
      </section>
    </div>
  )
}
