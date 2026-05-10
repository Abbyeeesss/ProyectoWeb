# Administración — Sistema de abastecimiento minorista

Proyecto académico alineado a la **especificación funcional** del core de pedidos optimizados (ventas, inventario, proveedores, agrupación por proveedor/categoría y datos como **lead time** y **productos perecederos**). Esta entrega cubre el **panel de administración** en **React** consumiendo una API **Node.js (Express)** con persistencia **SQLite**.

## Qué incluye este repositorio

| Capa | Tecnología | Rol |
|------|------------|-----|
| Front-end | React (Vite), React Router | Formularios de mantenimiento (MV* orientado a vistas + modelo en API) |
| Back-end | Express, better-sqlite3 | MVC: `models/` · `controllers/` · `routes/` |

### Requisitos de la consigna

1. **Validación en back-end de un dato sensible**  
   En proveedores, **`documento_identidad`** (cédula ecuatoriana, dígito verificador módulo 10) y **`ruc`** se validan **solo en servidor** antes de insertar/actualizar. Implementación: `backend/src/validators/sensible.js`, uso en `backend/src/controllers/proveedorController.js`. El front puede ayudar con formato, pero **no sustituye** esta validación.

2. **Claves foráneas sin input libre de IDs**  
   - **Ubicación**: cascada **País → Provincia → Ciudad** (`UbicacionCascade.jsx` + endpoints `/api/paises`, `/api/provincias`, `/api/ciudades`).  
   - **Productos**: **Proveedor** y **Categoría** solo mediante `<select>` alimentados por la API; el servidor comprueba que los IDs existan (`productoController.js`).

3. **Versionamiento Git + README + deploy**  
   Este README describe desarrollo local y opciones de despliegue (API en Render/Railway y SPA en Vercel/Netlify, o monoservicio).

## Estructura

```
backend/
  src/
    controllers/    # Lógica HTTP / validaciones de negocio
    models/         # Consultas SQLite
    routes/         # Enrutamiento REST
    validators/     # Datos sensibles y reglas que no deben quedar solo en el navegador
    db/             # Conexión y esquema
    scripts/seed.js # Datos demo (opcional)
frontend/
  src/
    pages/          # Pantallas del admin
    components/     # Cascada país/provincia/ciudad
    api.js          # Cliente fetch hacia /api
```

## Desarrollo local

### Prerrequisitos

- Node.js **18+**
- npm

### 1. Base de datos y API

```bash
cd backend
npm install
npm run init-db    # primera vez: crea backend/data/app.db y datos demo
npm run dev        # o npm start — puerto 4000 por defecto
```

Comprueba: `http://localhost:4000/health` y `http://localhost:4000/api/productos`.

Para **volver a sembrar**, borra `backend/data/app.db` y ejecuta de nuevo `npm run init-db`.

### 2. Front-end

En **otra terminal**:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173/admin`. El proxy de Vite envía `/api` → `http://localhost:4000`.

### Variables de entorno (producción front)

En el hosting estático (Vercel, Netlify, etc.), define:

- `VITE_API_BASE` — URL pública de tu API **sin** barra final, por ejemplo `https://tu-api.onrender.com`

El cliente usa rutas `${VITE_API_BASE}/api/...`. En desarrollo puedes dejar `VITE_API_BASE` vacío y usar el proxy de Vite.

## Deploy sugerido

### Opción A — API y front por separado (recomendada)

1. **API (Render, Railway, Fly.io, etc.)**  
   - Raíz del servicio: carpeta `backend`  
   - Build: `npm install`  
   - Start: `npm start`  
   - Tras el primer despliegue, ejecuta **una vez** el seed (SSH/consola del proveedor o job): `npm run init-db`  
   - **Nota**: en planes gratuitos el sistema de archivos suele ser **efímero**; SQLite puede perderse al reiniciar. Para persistencia real usa volumen pagado o migra a PostgreSQL.

2. **Front (Vercel / Netlify / Cloudflare Pages)**  
   - Raíz: `frontend`  
   - Build: `npm run build`  
   - Directorio de salida: `dist`  
   - Variable `VITE_API_BASE` apuntando a la API.

### Opción B — Servir el build del front desde Express

Puedes copiar `frontend/dist` al servidor Node y usar `express.static`; no está incluido por defecto para mantener el ejemplo simple y desacoplado.

## Datos de prueba (seed)

Proveedores y productos demo usan **RUC** y **cédulas coherentes** con los validadores del servidor. Sirven como referencia al probar formularios.

## Autora / contexto

Especificación funcional del core: documento de **Abigail Espinosa** (ISWZ3101). Este admin modela entidades que nutren el dominio del core (proveedores con ubicación y tiempos de entrega implícitos en lead time a nivel producto, categorías, stock y marca de perecedero).

---

Si necesitas **auth de administrador** o **migración a PostgreSQL** para un deploy persistente, se puede extender el mismo esquema manteniendo las validaciones en servidor.
