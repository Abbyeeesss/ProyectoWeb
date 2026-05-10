# Administración — Sistema de abastecimiento minorista

Proyecto académico alineado a la **especificación funcional** del core de pedidos optimizados (ventas, inventario, proveedores, agrupación por proveedor/categoría y datos como **lead time** y **productos perecederos**). Esta entrega cubre el **panel de administración** en **React** consumiendo una API **Node.js (Express)** con persistencia **PostgreSQL** vía **[Supabase](https://supabase.com/)** (u otro Postgres compatible).

## Qué incluye este repositorio

| Capa | Tecnología | Rol |
|------|------------|-----|
| Front-end | React (Vite), React Router | Formularios de mantenimiento (MV* orientado a vistas + modelo en API) |
| Back-end | Express, `pg`, dotenv | MVC: `models/` · `controllers/` · `routes/` |

### Requisitos de la consigna

1. **Validación en back-end de un dato sensible**  
   En proveedores, **`documento_identidad`** (cédula ecuatoriana, dígito verificador módulo 10) y **`ruc`** se validan **solo en servidor** antes de insertar/actualizar. Implementación: `backend/src/validators/sensible.js`, uso en `backend/src/controllers/proveedorController.js`.

2. **Claves foráneas sin input libre de IDs**  
   - **Ubicación**: cascada **País → Provincia → Ciudad** (`UbicacionCascade.jsx` + endpoints `/api/paises`, `/api/provincias`, `/api/ciudades`).  
   - **Productos**: **Proveedor** y **Categoría** solo mediante `<select>`; el servidor comprueba que los IDs existan (`productoController.js`).

3. **Versionamiento Git + README + deploy**  
   Este README describe desarrollo local y deploy con variables de entorno (API + SPA).

## Conectar Supabase (obligatorio para la API)

1. Cree un proyecto en [Supabase](https://supabase.com/dashboard).
2. Vaya a **Project Settings → Database**.
3. En **Connection string**, elija **URI** y copie la cadena (incluye usuario y host). Reemplace `[YOUR-PASSWORD]` por la contraseña de la base que definió al crear el proyecto.
4. En su máquina, dentro de `backend/`:
   - Copie `backend/.env.example` como **`backend/.env`**.
   - Pegue la línea:  
     `DATABASE_URL=postgresql://...`  
   - Para Node en servidor persistente suele funcionar bien la conexión **directa** (puerto **5432**). Si usa **pooler** (puerto **6543**), siga la documentación actual de Supabase para “transaction mode” vs “session mode”.
5. TLS: la API activa SSL automáticamente cuando la URI **no** apunta a `localhost`.

La primera vez que arranca (`npm run dev` / `npm start`), la API ejecuta `CREATE TABLE IF NOT EXISTS` desde `backend/src/db/schema.sql`. También puede pegar ese SQL en **Supabase → SQL Editor** si prefiere crear tablas desde el panel.

**Seguridad:** la URI contiene la contraseña de la base. Solo debe vivir en `backend/.env`, variables secretas del hosting (Render/Railway/VPS) y **nunca** en el repositorio ni en el front-end.

## Estructura

```
backend/
  src/
    controllers/
    models/
    routes/
    validators/
    db/
      schema.sql      # DDL Postgres (Supabase)
      pool.js         # Pool pg
      initSchema.js
    scripts/seed.js
frontend/
  src/
    pages/
    components/
    api.js
```

## Desarrollo local

### Prerrequisitos

- Node.js **18+**
- npm
- Proyecto Supabase y `DATABASE_URL` en `backend/.env`

### 1. Base de datos y API

```bash
cd backend
npm install
npm run init-db    # primera vez: tablas + datos demo (omite si ya hay país Ecuador)
npm run dev        # puerto 4000 por defecto
```

Comprueba: `http://localhost:4000/health` y `http://localhost:4000/api/productos`.

Para **volver a sembrar desde cero**, en Supabase puede borrar las filas de las tablas (o usar SQL `TRUNCATE ... CASCADE` con cuidado) y ejecutar de nuevo `npm run init-db`.

### 2. Front-end

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173/admin`. El proxy de Vite envía `/api` → `http://localhost:4000`.

### Variables de entorno (producción front)

En el hosting estático (Vercel, Netlify, etc.):

- `VITE_API_BASE` — URL pública de tu API **sin** barra final, por ejemplo `https://tu-api.onrender.com`

En el hosting de la API:

- `DATABASE_URL` — misma URI de Supabase (como variable secreta).

## Deploy sugerido

1. **API (Render, Railway, Fly.io, VPS)**  
   - Carpeta `backend`  
   - Build: `npm install`  
   - Start: `npm start`  
   - Variable secreta: **`DATABASE_URL`**  
   - Opcional: tras el primer deploy, ejecute **`npm run init-db`** una vez desde una shell con esa variable (o inserte datos desde Supabase).

2. **Front (Vercel / Netlify / Cloudflare Pages)**  
   - Carpeta `frontend`  
   - Build: `npm run build`  
   - Salida: `dist`  
   - `VITE_API_BASE` apuntando a la API pública.

Vea `render.yaml` como ejemplo; debe configurar `DATABASE_URL` en el panel de Render (no lo suba al repo).

## Datos de prueba (seed)

Proveedores y productos demo usan **RUC** y **cédulas coherentes** con los validadores del servidor.

## Autora / contexto

Especificación funcional del core: documento de **Abigail Espinosa** (ISWZ3101).
