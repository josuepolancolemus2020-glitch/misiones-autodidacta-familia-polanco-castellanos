-- Ejecutar en Supabase -> SQL Editor, DESPUÉS de buzon_lector.sql.
-- Es IDEMPOTENTE: se puede correr varias veces sin dañar nada.
-- ════════════════════════════════════════════════════════════════════
-- EL LECTOR CORRIGE LO QUE MANDÓ
-- ════════════════════════════════════════════════════════════════════
-- POR QUÉ:
--   Hasta ahora, quien mandaba algo al buzón solo podía retirarlo. Si
--   se le olvidaba un dato, si escribió mal el nombre de la escuela o
--   si al releerlo vio que se había pasado de duro, tenía dos malas
--   salidas: retirarlo y escribirlo TODO otra vez desde cero, o
--   mandarlo de nuevo y dejar dos envíos casi iguales en la bandeja.
--
--   Peor: mandarlo de nuevo con el texto corregido NO corregía nada.
--   La llave contra el doble toque (la huella) lleva dentro el
--   principio del texto, así que en cuanto se cambia la primera línea
--   —que es justo lo que se cambia al corregir— deja de ser el mismo
--   envío y entra como uno nuevo. La protección contra el dedo
--   nervioso no sirve para corregir a conciencia.
--
-- QUÉ AÑADE:
--   1) Dos columnas: cuándo se cambió por última vez y cuántas veces.
--      No son estadística: son el aviso que la redacción necesita.
--   2) faro_buzon_mio(folio, tel)    → el lector recupera lo suyo
--   3) faro_buzon_editar(...)        → y lo corrige, sobre la MISMA fila
--
-- HASTA CUÁNDO SE PUEDE, Y POR QUÉ:
--   Solo mientras el envío esté en «nuevo» o «leído». En cuanto pasa a
--   «atendido» ya es una nota de la revista: alguien lo leyó, llamó al
--   autor, comprobó lo que decía y lo puso en una edición. Si a partir
--   de ahí el texto pudiera cambiar por debajo, lo verificado y lo
--   publicado dejarían de ser lo mismo, y bastaría con mandar algo
--   inofensivo, esperar a que lo aprueben y cambiarlo después. Esa
--   puerta se cierra aquí, en el servidor, no en la pantalla.
--
--   Y corregir un envío YA LEÍDO lo devuelve a «nuevo». Quien lo había
--   leído tiene que volver a leerlo: si no, se queda con los datos de
--   la versión vieja y llama por teléfono a preguntar por algo que ya
--   no dice. La bandeja además lo marca con ✏️.
--
--   El TELÉFONO no se puede cambiar: es la mitad de la llave con la
--   que el lector demuestra que el envío es suyo. Quien cambió de
--   número retira lo que mandó y lo manda otra vez.
-- ════════════════════════════════════════════════════════════════════

alter table public.buzon_mensajes
  add column if not exists editado_at timestamptz;

-- Cuántas veces lo ha cambiado. Sirve de tope (ver más abajo) y de
-- señal: un envío corregido nueve veces es alguien que no se aclara y
-- al que conviene llamar antes que seguir leyendo versiones.
alter table public.buzon_mensajes
  add column if not exists ediciones smallint not null default 0;

-- ── El lector recupera lo suyo ──────────────────────────────────────
-- Hacen falta las dos cosas que solo él tiene: su folio y su teléfono.
-- NO devuelve las fotos, que pesan casi un mega cada una y casi nunca
-- se cambian: devuelve CUÁNTAS son, y la pantalla le pregunta si las
-- deja como están o las cambia. Tampoco devuelve el motivo de un
-- descarte, que es una nota interna de la redacción.
create or replace function public.faro_buzon_mio(p_folio text, p_tel text)
returns table (
  clase text, titulo text, texto text,
  nombre text, tel text, correo text, lugar text, escuela text, cargo text,
  evento_fecha date, evento_hora text, evento_lugar text,
  fotos smallint, estado text, se_puede boolean,
  creado_at timestamptz, editado_at timestamptz
)
language sql security definer stable set search_path = public
as $$
  select m.clase, m.titulo, m.texto,
         m.nombre, m.tel, m.correo, m.lugar, m.escuela, m.cargo,
         m.evento_fecha, m.evento_hora, m.evento_lugar,
         m.fotos, m.estado,
         (m.estado in ('nuevo', 'leido') and m.ediciones < 10),
         m.creado_at, m.editado_at
  from public.buzon_mensajes m
  where m.folio = upper(trim(coalesce(p_folio, '')))
    and length(regexp_replace(coalesce(p_tel, ''), '[^0-9]', '', 'g')) >= 8
    and regexp_replace(m.tel, '[^0-9]', '', 'g')
        = regexp_replace(coalesce(p_tel, ''), '[^0-9]', '', 'g')
  limit 1
$$;
revoke all on function public.faro_buzon_mio(text, text) from public;
grant execute on function public.faro_buzon_mio(text, text) to anon, authenticated;

-- ── Y lo corrige ────────────────────────────────────────────────────
-- Devuelve por qué NO se pudo, o 'ok'. Un booleano pelado no sirve:
-- «no se pudo» y «esto ya está en la revista, llame» son dos cosas
-- muy distintas para quien está delante de la pantalla.
--
--   ok         → corregido
--   no-existe  → ese folio con ese teléfono no es de nadie
--   atendido   → ya es una nota de la revista; no se toca
--   descartado → esta vez no entró; que mande uno nuevo si quiere
--   tope       → diez correcciones ya son muchas
--   corto      → el texto se quedó por debajo del mínimo
--   error      → cualquier otra cosa; nunca revienta la pantalla
create or replace function public.faro_buzon_editar(
  p_folio text, p_tel text, p_huella text,
  p_clase text, p_titulo text, p_texto text,
  p_nombre text, p_correo text, p_lugar text, p_escuela text, p_cargo text,
  p_evento_fecha date, p_evento_hora text, p_evento_lugar text,
  p_etica_version text, p_permiso_fotos boolean,
  p_fotos_cambiar boolean, p_fotos jsonb
)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  fol   text := upper(trim(coalesce(p_folio, '')));
  tel_n text := regexp_replace(coalesce(p_tel, ''), '[^0-9]', '', 'g');
  txt   text := left(trim(coalesce(p_texto, '')), 4000);
  nom   text := left(trim(coalesce(p_nombre, '')), 80);
  cls   text := lower(trim(coalesce(p_clase, 'nota')));
  m     public.buzon_mensajes%rowtype;
  foto  jsonb;
  ord   smallint := 0;
  d     text;
begin
  if length(fol) < 4 or length(tel_n) < 8 then return 'no-existe'; end if;

  select * into m from public.buzon_mensajes
   where folio = fol and regexp_replace(tel, '[^0-9]', '', 'g') = tel_n;
  if not found then return 'no-existe'; end if;

  -- La puerta que de verdad importa: lo ya atendido no se toca.
  if m.estado = 'atendido'   then return 'atendido';   end if;
  if m.estado = 'descartado' then return 'descartado'; end if;
  if m.ediciones >= 10       then return 'tope';       end if;

  if length(txt) < 20 or length(nom) < 3 then return 'corto'; end if;
  if cls not in ('nota', 'opinion', 'denuncia', 'sugerencia', 'aulas') then
    cls := 'nota';
  end if;

  update public.buzon_mensajes set
    clase = cls,
    titulo = left(trim(coalesce(p_titulo, '')), 140),
    texto = txt,
    nombre = nom,
    correo = left(trim(coalesce(p_correo, '')), 120),
    lugar = left(trim(coalesce(p_lugar, '')), 80),
    escuela = left(trim(coalesce(p_escuela, '')), 120),
    cargo = left(trim(coalesce(p_cargo, '')), 60),
    evento_fecha = p_evento_fecha,
    evento_hora = left(trim(coalesce(p_evento_hora, '')), 30),
    evento_lugar = left(trim(coalesce(p_evento_lugar, '')), 120),
    -- Se vuelve a firmar: el texto es otro, así que la responsabilidad
    -- que se acepta es sobre el texto nuevo y con los requisitos de hoy.
    etica_version = left(trim(coalesce(p_etica_version, m.etica_version)), 20),
    permiso_fotos = coalesce(p_permiso_fotos, m.permiso_fotos),
    -- Vuelve a la cola: quien lo había leído tiene que volver a leerlo.
    estado = 'nuevo',
    editado_at = now(),
    ediciones = m.ediciones + 1
  where id = m.id;

  -- Las fotos solo se tocan si lo pidió. Casi nadie las cambia al
  -- corregir una frase, y traérselas y devolverlas serían cuatro megas
  -- por una coma.
  if coalesce(p_fotos_cambiar, false) then
    delete from public.buzon_fotos where mensaje_id = m.id;
    if jsonb_typeof(p_fotos) = 'array' then
      for foto in select * from jsonb_array_elements(p_fotos) loop
        exit when ord >= 2;
        d := foto #>> '{}';
        if d is not null and d like 'data:image/%'
           and length(d) between 100 and 1400000 then
          ord := ord + 1;
          insert into public.buzon_fotos (mensaje_id, orden, datos, bytes)
          values (m.id, ord, d, length(d));
        end if;
      end loop;
    end if;
    update public.buzon_mensajes set fotos = ord where id = m.id;
  end if;

  -- La huella se pone al día para que el freno del doble toque siga
  -- valiendo sobre el texto NUEVO. Si choca con la de otro envío se
  -- deja como estaba: es un caso rarísimo y perder la corrección por
  -- eso sería absurdo.
  begin
    update public.buzon_mensajes
       set huella = left(trim(coalesce(p_huella, m.huella)), 160)
     where id = m.id;
  exception when unique_violation then null;
  end;

  return 'ok';
exception when others then
  return 'error';
end
$$;
revoke all on function public.faro_buzon_editar(
  text, text, text, text, text, text, text, text, text, text, text,
  date, text, text, text, boolean, boolean, jsonb) from public;
grant execute on function public.faro_buzon_editar(
  text, text, text, text, text, text, text, text, text, text, text,
  date, text, text, text, boolean, boolean, jsonb) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- Se comprueba entero con _dev/prueba-buzon-sql.sql, que corre también
-- este archivo. Lo que vigila, y no es poco: que un envío ya atendido
-- NO se pueda cambiar (si eso falla, lo que se verificó y lo que se
-- imprime dejan de ser lo mismo) y que corregir uno leído lo devuelva
-- a la cola.
-- ════════════════════════════════════════════════════════════════════
