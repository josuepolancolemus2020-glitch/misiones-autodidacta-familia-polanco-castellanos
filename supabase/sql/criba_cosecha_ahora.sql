-- Ejecutar en Supabase -> SQL Editor cuando se quiera una cosecha YA,
-- sin esperar a las 05:10. Se puede correr las veces que haga falta.
-- ════════════════════════════════════════════════════════════════════
-- DISPARAR LA COSECHA A MANO, SIN ESCRIBIR EL SECRETO
-- ════════════════════════════════════════════════════════════════════
-- POR QUÉ EXISTE ESTE ARCHIVO:
--   El 30 de agosto de 2026 se disparó la cosecha a mano pegando el
--   `net.http_post` con el secreto escrito dentro. El editor devolvió un
--   número y todo pareció bien. No lo estaba: ese número es solo el
--   acuse de que la petición SALIÓ de PostgreSQL. La función contestó
--   403 -el secreto no coincidía- y no hizo nada.
--
--   Y ese 403 no lo ve nadie: se queda en `net._http_response`, el buzón
--   compartido de pg_net, donde antena-publicar escribe cada minuto. Se
--   perdieron tres vueltas de diagnóstico creyendo que la prensa fallaba
--   cuando la cosecha ni había corrido.
--
--   El secreto ya está escrito en un sitio donde funciona seguro: el
--   propio reloj, `cron.job`, que lleva meses disparando bien. Así que
--   en vez de volver a escribirlo, se le pide prestado. Lo que corre es
--   EXACTAMENTE lo que corre solo cada madrugada, ni una letra distinta.
--
-- ⚠️ NO devuelve los resultados de la cosecha. La petición se envía al
--    hacer commit y la función tarda dos o tres minutos. Después se mira
--    con `criba_mira_edicion.sql` y `criba_mira_prensa.sql`.
-- ════════════════════════════════════════════════════════════════════

do $$
declare
  cmd text;
begin
  select command into cmd from cron.job where jobname = 'criba-cosecha';

  if cmd is null then
    raise exception E'No está el reloj `criba-cosecha` en cron.job.\n'
      'QUE HACER: corre supabase/sql/criba_reloj.sql, que es donde vive '
      'el secreto. Sin él este archivo no tiene de dónde sacarlo.';
  end if;

  /* Se ejecuta el mandato del reloj tal cual. No es SQL de fuera: es lo
     que este mismo proyecto programó y lo que corre solo cada día. */
  execute cmd;
end $$;

-- ── Qué acaba de pasar ──────────────────────────────────────────────
-- ⚠️ EN VERTICAL, una fila por cosa: en la tableta del autor una fila
--    ancha se corta por la derecha.
select * from (
  select 1 as n, 'cosecha' as que, '🚀 disparada' as valor
  union all select 2, 'el reloj dispara a las',
         coalesce((select schedule from cron.job where jobname = 'criba-cosecha'),
                  '— no está —') || ' (UTC)'
  union all select 3, 'última vez que corrió solo',
         coalesce((select to_char(max(ultimo_intento_at), 'DD/MM HH24:MI')
                     from public.criba_fuentes), '— nunca —')
  union all select 4, 'ahora', 'espera 3 minutos'
  union all select 5, 'y luego corre', 'criba_mira_edicion.sql'
) t order by n;
