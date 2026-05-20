# Sistema de abastecimiento minorista — Panel de administración

Cubre ventas, inventario, proveedores, lead time y productos perecederos.

**Stack:** React + Vite en el front, Express en el back, Supabase como base de datos.

---

## Lo que hace este proyecto

| Capa | Tecnología |
|------|------------|
| Front-end | React, Vite, React Router |
| Back-end | Express, @supabase/supabase-js, dotenv |
| Base de datos | PostgreSQL vía Supabase |

El back-end sigue estructura MVC con carpetas `models`, `controllers` y `routes`.

---

## Tres decisiones de diseño importantes

### 1. Validación de datos sensibles solo en el servidor

El campo `documento_identidad` (cédula ecuatoriana con dígito verificador módulo 10) se valida únicamente en el back-end, antes de cualquier inserción o actualización. El front nunca toca esa lógica.

Está implementado en `sensible.js` dentro de `validators`, y se usa desde `proveedorController.js`.

### 2. Claves foráneas sin escribir IDs a mano

En lugar de pedir que el usuario ingrese un ID numérico, todo se resuelve con selectores. La ubicación funciona en cascada: primero se elige el país, luego la provincia, luego la ciudad. Para productos, el proveedor y la categoría también se seleccionan desde un `<select>`, y el servidor verifica que los IDs existan antes de guardar.

### 3. Datos de prueba en SQL

Los datos iniciales se cargan desde el **SQL Editor** de Supabase (`backend/src/db/schema.sql`).

---

## Estructura de carpetas

```
backend/
  src/
    controllers/
    models/
    routes/
    validators/
    db/
      schema.sql
      supabase.js

frontend/
  src/
    pages/
    components/
    api.js
```

---

## Configuración de Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com/dashboard).
2. En el **SQL Editor**, ejecutar `backend/src/db/schema.sql` para crear las tablas.
3. Ir a **Project Settings** y luego a **API**. Ahí se encuentran dos valores:
   - **Project URL**, que va como `SUPABASE_URL`
   - La clave **service_role**, que va como `SUPABASE_KEY`
4. Dentro de la carpeta `backend`, copiar `.env.example` como `.env` y completar esas dos variables.

> La clave `service_role` tiene acceso total a la base de datos. Solo debe existir en `.env` o en las variables secretas del hosting, nunca en el repositorio ni en el front-end.

---

## Desarrollo local

### API

```bash
cd backend
npm install
npm run dev
```

Para verificar que funciona, abrir `localhost:4000/health` o `localhost:4000/api/productos`.

### Front-end

```bash
cd frontend
npm install
npm run dev
```

Abrir `localhost:5173/core`. El proxy de Vite redirige las llamadas a la API automáticamente.

---

## Variables de entorno en producción

Para el hosting de la API 

| Variable | Valor |
|----------|-------|
| `SUPABASE_URL` | Project URL del proyecto de Supabase |
| `SUPABASE_KEY` | Clave service_role, configurada como secreto |

Para el hosting del front (Vercel, Netlify, Cloudflare Pages):

| Variable | Valor |
|----------|-------|
| `VITE_API_BASE` | URL pública de la API, sin barra al final |

---
