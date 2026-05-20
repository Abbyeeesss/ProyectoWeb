import { NavLink, Outlet } from 'react-router-dom'
import '../core/core.css'

const coreNav = [
  { to: '/core', label: 'Home', end: true },
  { to: '/core/ordenes', label: 'Órdenes', end: false },
  { to: '/core/detalle', label: 'Detalle', end: false },
  { to: '/core/historial', label: 'Historial', end: false },
]

const otrosNav = [
  { to: '/core/productos', label: 'Productos' },
  { to: '/core/proveedores', label: 'Proveedores' },
  { to: '/core/categorias', label: 'Categorías' },
  { to: '/core/ventas', label: 'Ventas' },
]

export default function CoreLayout() {
  return (
    <div className="core-app">
      <aside className="core-sidebar" aria-label="Navegación principal">
        <div className="core-nav-group-title">Módulos</div>
        <nav className="core-nav">
          {coreNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <span>{item.label}</span>
              <span className="core-badge-mini">—</span>
            </NavLink>
          ))}
        </nav>

        <div className="core-nav-group-title">Otros</div>
        <nav className="core-nav" aria-label="Catálogo y datos maestros">
          {otrosNav.map((item) => (
            <NavLink key={item.to} to={item.to}>
              <span>{item.label}</span>
              <span className="core-badge-mini">—</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="core-content" aria-label="Contenido">
        <Outlet />
      </main>
    </div>
  )
}
