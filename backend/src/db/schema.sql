-- ============================================================
-- SCHEMA: Geographic tables
-- ============================================================

create table if not exists pais (
  id   bigint generated always as identity primary key,
  nombre text not null unique
);

create table if not exists provincia (
  id      bigint generated always as identity primary key,
  pais_id bigint not null references pais(id) on delete cascade,
  nombre  text not null,
  unique (pais_id, nombre)
);

create table if not exists ciudad (
  id           bigint generated always as identity primary key,
  provincia_id bigint not null references provincia(id) on delete cascade,
  nombre       text not null,
  unique (provincia_id, nombre)
);

-- ============================================================
-- SCHEMA: Catalog tables
-- ============================================================

create table if not exists categoria (
  id          bigint generated always as identity primary key,
  nombre      text not null unique,
  descripcion text
);

create table if not exists proveedor (
  id                  bigint generated always as identity primary key,
  nombre_comercial    text not null,
  representante_legal text not null,
  documento_identidad text not null,
  telefono            text,
  email               text,
  ciudad_id           bigint not null references ciudad(id)
);

-- ============================================================
-- SCHEMA: Inventory
-- ============================================================

create table if not exists producto (
  id               bigint generated always as identity primary key,
  sku              text not null unique,
  nombre           text not null,
  proveedor_id     bigint not null references proveedor(id),
  categoria_id     bigint not null references categoria(id),
  precio_referencia numeric(12, 4) not null default 0,
  es_perecedero    boolean not null default false,
  stock_actual     numeric(12, 4) not null default 0,
  dias_lead_time   integer not null default 7
);
