insert into venta (producto_id, cantidad, precio_unitario, fecha)
select
  p.id,
  (1 + floor(random() * 8)::int)::numeric(12, 4) as cantidad,
  p.precio_referencia,
  (current_timestamp - (d || ' days')::interval - (p.id % 5 || ' hours')::interval) as fecha
from producto p
cross join generate_series(0, 4) as d;
