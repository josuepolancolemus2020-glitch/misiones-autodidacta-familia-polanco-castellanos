-- ════════════════════════════════════════════════════════════════════
-- SUBIR A DIEZ EL TOPE DE PREGUNTAS POR VIDEO
-- ════════════════════════════════════════════════════════════════════
-- Corre esto en el SQL Editor de Supabase (el proyecto de F.A.R.O).
-- Se puede correr dos veces sin dañar nada: acaba siempre en diez.
--
-- Hace lo mismo que volver a pegar supabase/sql/metas_videos.sql
-- entero; es la parte que cambió.
-- ════════════════════════════════════════════════════════════════════

-- Primero, que la tabla exista. Si no, lo dice y para: sin esto el
-- error que sale habla de otra cosa y se pierde la tarde buscándolo.
do $$
begin
  if to_regclass('public.metas_videos') is null then
    raise exception
      'Falta la tabla metas_videos. Corre antes supabase/sql/metas_videos.sql entero.';
  end if;
end
$$;

-- El tope se TIRA Y SE VUELVE A PONER, no se añade «si no existe»: con
-- «si no existe», el que ya tiene el de cinco leería «Success» y se
-- quedaría con el número viejo, y el fallo no saldría aquí sino en
-- F.A.R.O al guardar la sexta pregunta.
alter table public.metas_videos
  drop constraint if exists metas_videos_preguntas_lista;
alter table public.metas_videos
  add constraint metas_videos_preguntas_lista
  check (jsonb_typeof(preguntas) = 'array' and jsonb_array_length(preguntas) <= 10);

-- ¿Quedó puesto? Va la última a propósito: el editor enseña el
-- resultado de la última sentencia, así que en vez de un «Success. No
-- rows returned» sale escrito el número que hay.
select
  (select substring(pg_get_constraintdef(oid) from '<= ([0-9]+)')
     from pg_constraint where conname = 'metas_videos_preguntas_lista') as tope_preguntas,
  'Tiene que decir 10. Si dice 5, el pegado no entró entero.'          as lectura;
