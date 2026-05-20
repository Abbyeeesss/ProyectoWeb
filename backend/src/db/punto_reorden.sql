create table if not exists punto_reorden (
  id                    bigint generated always as identity primary key,
  producto_id           bigint not null references producto(id) on delete cascade,
  desde                 date not null,
  hasta                 date not null,
  dias_calendario       integer not null check (dias_calendario > 0),
  unidades_vendidas     numeric(12, 4) not null,
  promedio_unidades_dia numeric(12, 4) not null,
  dias_lead_time        integer not null check (dias_lead_time > 0),
  punto_reorden         numeric(12, 4) not null,
  calculado_en          timestamptz not null default now(),
  unique (producto_id)
);
