import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CoreLayout from './layout/CoreLayout'
import Proveedores from './pages/Proveedores'
import Productos from './pages/Productos'
import Categorias from './pages/Categorias'
import Ventas from './pages/Ventas'
import CoreHome from './pages/core/CoreHome'
import OrdenesSugeridas from './pages/core/OrdenesSugeridas'
import OrdenDetalle from './pages/core/OrdenDetalle'
import Historial from './pages/core/Historial'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/core" replace />} />
        <Route path="/core" element={<CoreLayout />}>
          <Route index element={<CoreHome />} />
          <Route path="ordenes" element={<OrdenesSugeridas />} />
          <Route path="detalle" element={<OrdenDetalle />} />
          <Route path="historial" element={<Historial />} />
          <Route path="productos" element={<Productos />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="ventas" element={<Ventas />} />
        </Route>
        <Route path="/admin" element={<Navigate to="/core" replace />} />
        <Route path="/admin/proveedores" element={<Navigate to="/core/proveedores" replace />} />
        <Route path="/admin/productos" element={<Navigate to="/core/productos" replace />} />
        <Route path="/admin/categorias" element={<Navigate to="/core/categorias" replace />} />
        <Route path="*" element={<Navigate to="/core" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
