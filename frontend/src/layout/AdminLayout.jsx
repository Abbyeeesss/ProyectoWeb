import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <header className="top-bar">
        <strong className="brand">Admin · Abastecimiento</strong>
        <nav className="nav">
          <NavLink to="/admin" end>
            Inicio
          </NavLink>
          <NavLink to="/admin/proveedores">Proveedores</NavLink>
          <NavLink to="/admin/productos">Productos</NavLink>
          <NavLink to="/admin/categorias">Categorías</NavLink>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
