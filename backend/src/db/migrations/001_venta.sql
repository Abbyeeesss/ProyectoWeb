-- Ejecutar en Supabase SQL Editor si la base ya existía antes de añadir ventas.
-- (Si creaste la BD desde schema.sql completo, no hace falta.)

create table if not exists venta (
  id              bigint generated always as identity primary key,
  producto_id     bigint not null references producto(id) on delete restrict,
  cantidad        numeric(12, 4) not null check (cantidad > 0),
  precio_unitario numeric(12, 4) not null check (precio_unitario >= 0),
  fecha           timestamptz not null default now()
);

create index if not exists venta_fecha_idx on venta (fecha);
create index if not exists venta_producto_fecha_idx on venta (producto_id, fecha);
