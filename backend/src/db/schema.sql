
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

-- Historial de ventas (consulta por rango de fechas en el API)
create table if not exists venta (
  id              bigint generated always as identity primary key,
  producto_id     bigint not null references producto(id) on delete restrict,
  cantidad        numeric(12, 4) not null check (cantidad > 0),
  precio_unitario numeric(12, 4) not null check (precio_unitario >= 0),
  fecha           timestamptz not null default now()
);

create index if not exists venta_fecha_idx on venta (fecha);
create index if not exists venta_producto_fecha_idx on venta (producto_id, fecha);
