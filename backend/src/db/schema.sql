-- Ejecutable también desde Supabase → SQL Editor (una vez). La API corre lo mismo al iniciar.

CREATE TABLE IF NOT EXISTS pais (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS provincia (
  id SERIAL PRIMARY KEY,
  pais_id INTEGER NOT NULL REFERENCES pais(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  UNIQUE(pais_id, nombre)
);

CREATE TABLE IF NOT EXISTS ciudad (
  id SERIAL PRIMARY KEY,
  provincia_id INTEGER NOT NULL REFERENCES provincia(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  UNIQUE(provincia_id, nombre)
);

CREATE TABLE IF NOT EXISTS categoria (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS proveedor (
  id SERIAL PRIMARY KEY,
  nombre_comercial TEXT NOT NULL,
  ruc TEXT NOT NULL UNIQUE,
  representante_legal TEXT NOT NULL,
  documento_identidad TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  ciudad_id INTEGER NOT NULL REFERENCES ciudad(id)
);

CREATE TABLE IF NOT EXISTS producto (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  proveedor_id INTEGER NOT NULL REFERENCES proveedor(id),
  categoria_id INTEGER NOT NULL REFERENCES categoria(id),
  precio_referencia DOUBLE PRECISION NOT NULL DEFAULT 0,
  es_perecedero BOOLEAN NOT NULL DEFAULT FALSE,
  stock_actual DOUBLE PRECISION NOT NULL DEFAULT 0,
  dias_lead_time INTEGER NOT NULL DEFAULT 7
);
