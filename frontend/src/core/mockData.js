export const homeBuckets = [
  { tag: 'Crítico', title: 'Críticos (Urgente)', items: ['Plátanos', 'Leche'] },
  { tag: 'Próximo', title: 'Próximos', items: ['Kiwis', 'Galletas de chocolate'] },
  { tag: 'Preventivo', title: 'Preventivo', items: ['Galletas de fresa'] },
]

export const productosInventario = [
  {
    urgencia: 'urgente',
    producto: 'Plátanos',
    proveedor: 'Frutas Don Pepe',
    stock: '12 kg',
    dias: '0.8',
    primary: true,
  },
  {
    urgencia: 'urgente',
    producto: 'Leche',
    proveedor: 'Lácteos La Vaquita',
    stock: '6 L',
    dias: '1.0',
    primary: true,
  },
  {
    urgencia: 'proximo',
    producto: 'Kiwis',
    proveedor: 'Frutas Don Pepe',
    stock: '18 kg',
    dias: '2.4',
    primary: false,
  },
  {
    urgencia: 'proximo',
    producto: 'Galletas de chocolate',
    proveedor: 'Abarrotes Central',
    stock: '14 u',
    dias: '3.1',
    primary: false,
  },
  {
    urgencia: 'preventivo',
    producto: 'Galletas de fresa',
    proveedor: 'Abarrotes Central',
    stock: '20 u',
    dias: '5.6',
    primary: false,
  },
]

export const ordenesPorProveedor = [
  {
    proveedor: 'Frutas Don Pepe',
    productos: 2,
    fecha: '25 Abr 2026',
    link: 'detalle',
  },
  {
    proveedor: 'Lácteos La Vaquita',
    productos: 1,
    fecha: '25 Abr 2026',
    link: 'detalle',
  },
  {
    proveedor: 'Abarrotes Central',
    productos: 2,
    fecha: '22 Abr 2026',
    link: 'historial',
    label: 'Ver en historial',
  },
  {
    proveedor: 'Panadería San José',
    productos: 3,
    fecha: '24 Abr 2026',
    link: 'detalle',
  },
  {
    proveedor: 'Bebidas El Manantial',
    productos: 2,
    fecha: '18 Abr 2026',
    link: 'detalle',
  },
  {
    proveedor: 'Distribuidora La Economía',
    productos: 4,
    fecha: '15 Abr 2026',
    link: 'historial',
    label: 'Ver en historial',
  },
]

export const detalleOrden = {
  proveedor: 'Frutas Don Pepe',
  fecha: '25 de Abril de 2026',
  estado: 'Confirmada',
  lineas: [
    {
      producto: 'Plátanos',
      categoria: 'Frutas',
      stock: '12 kg',
      dias: '0.8',
      sugerida: 20,
      unidad: 'kg',
      prioridad: 'urgente',
      justificacion: 'Stock para 0.8 día · entrega 2 días',
    },
    {
      producto: 'Kiwis',
      categoria: 'Frutas',
      stock: '18 kg',
      dias: '2.4',
      sugerida: 12,
      unidad: 'kg',
      prioridad: 'proximo',
      justificacion: 'Stock para 2.4 días · entrega 2 días',
    },
  ],
}

export const historialOrdenes = [
  { fecha: '22 Abr 2026', proveedor: 'Abarrotes Central', productos: 2 },
  { fecha: '20 Abr 2026', proveedor: 'Frutas Don Pepe', productos: 3 },
  { fecha: '15 Abr 2026', proveedor: 'Lácteos La Vaquita', productos: 1 },
]
