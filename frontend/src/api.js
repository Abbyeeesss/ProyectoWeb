const rawBase = import.meta.env.VITE_API_BASE ?? ''
const base = String(rawBase).trim().replace(/\/+$/, '')

async function request(path, options = {}) {
  const prefix = base === '' ? '' : base
  const url =
    prefix === ''
      ? `/api${path}`
      : `${prefix}/api${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: text }
    }
  }
  if (!res.ok) {
    const msg = data?.error || res.statusText
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return data
}

export const api = {
  getPaises: () => request('/paises'),
  getProvincias: (paisId) => request(`/provincias?paisId=${encodeURIComponent(paisId)}`),
  getCiudades: (provinciaId) =>
    request(`/ciudades?provinciaId=${encodeURIComponent(provinciaId)}`),
  getCategorias: () => request('/categorias'),
  postCategoria: (body) => request('/categorias', { method: 'POST', body: JSON.stringify(body) }),
  putCategoria: (id, body) =>
    request(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCategoria: (id) => request(`/categorias/${id}`, { method: 'DELETE' }),
  getProveedores: () => request('/proveedores'),
  getProveedor: (id) => request(`/proveedores/${id}`),
  postProveedor: (body) => request('/proveedores', { method: 'POST', body: JSON.stringify(body) }),
  putProveedor: (id, body) =>
    request(`/proveedores/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProveedor: (id) => request(`/proveedores/${id}`, { method: 'DELETE' }),
  getProductos: () => request('/productos'),
  postProducto: (body) => request('/productos', { method: 'POST', body: JSON.stringify(body) }),
  putProducto: (id, body) =>
    request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProducto: (id) => request(`/productos/${id}`, { method: 'DELETE' }),
  getVentasHistorial: ({ desde, hasta, producto_id }) => {
    const q = new URLSearchParams({ desde, hasta })
    if (producto_id != null && producto_id !== '') {
      q.set('producto_id', String(producto_id))
    }
    return request(`/ventas?${q}`)
  },
  getVentasPromedioDiario: ({ desde, hasta, producto_id }) => {
    const q = new URLSearchParams({ desde, hasta })
    if (producto_id != null && producto_id !== '') {
      q.set('producto_id', String(producto_id))
    }
    return request(`/ventas/promedio-diario?${q}`)
  },
}
