// Edge Function: antena-metricas
//
// EL RECOLECTOR. pg_cron la despierta cada 4 horas (ver
// supabase/sql/antena_fase4.sql) y también se puede invocar desde la app
// con el botón "Actualizar métricas". Recorre los destinos publicados en
// los últimos 30 días, pregunta a cada red cómo le fue al post y guarda
// una foto (snapshot) en antena_metricas.
//
// Secrets necesarios: ANTENA_CRON_SECRET (para el cron).
// X_CLIENT_ID/SECRET no hacen falta: se usa el access token guardado.
//
// "Enforce JWT Verification": DESACTIVADO (igual que antena-publicar).
// Autorización aceptada por cualquiera de estas tres vías:
//   1. Header x-antena-cron con el secret del reloj (pg_cron)
//   2. Bearer con la service_role key
//   3. Bearer con la sesión de un usuario de la allowlist (el botón de la app)

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET  = Deno.env.get("ANTENA_CRON_SECRET") ?? "";

const DIAS_VENTANA   = 30; // solo posts publicados hace menos de esto
const HORAS_FRESCURA = 2;  // no repetir snapshot si hay uno más nuevo que esto

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* Métricas de un post de Página de Facebook. */
async function metricasFacebook(cuenta: any, postId: string) {
  const base = `https://graph.facebook.com/v21.0/${encodeURIComponent(postId)}`;
  const res = await fetch(
    `${base}?fields=likes.summary(true),comments.summary(true),shares` +
    `&access_token=${encodeURIComponent(cuenta.access_token)}`,
  );
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Facebook respondió ${res.status}: ${JSON.stringify(body).slice(0, 200)}`);
  }

  // Las impresiones van por el endpoint de insights; si falla no es fatal
  let vistas = 0;
  try {
    const ins = await fetch(
      `${base}/insights?metric=post_impressions&access_token=${encodeURIComponent(cuenta.access_token)}`,
    );
    const insBody = await ins.json();
    vistas = Number(insBody?.data?.[0]?.values?.[0]?.value ?? 0);
  } catch (_) { /* posts muy nuevos aún no tienen insights */ }

  return {
    vistas,
    likes:       Number(body?.likes?.summary?.total_count ?? 0),
    comentarios: Number(body?.comments?.summary?.total_count ?? 0),
    compartidos: Number(body?.shares?.count ?? 0),
  };
}

/* Métricas públicas de un tweet. Puede fallar por créditos (402): se tolera. */
async function metricasX(cuenta: any, tweetId: string) {
  const res = await fetch(
    `https://api.x.com/2/tweets/${encodeURIComponent(tweetId)}?tweet.fields=public_metrics`,
    { headers: { Authorization: `Bearer ${cuenta.access_token}` } },
  );
  const body = await res.json();
  const m = body?.data?.public_metrics;
  if (!res.ok || !m) {
    throw new Error(`X respondió ${res.status}: ${JSON.stringify(body).slice(0, 200)}`);
  }
  return {
    vistas:      Number(m.impression_count ?? 0),
    likes:       Number(m.like_count ?? 0),
    comentarios: Number(m.reply_count ?? 0),
    compartidos: Number(m.retweet_count ?? 0) + Number(m.quote_count ?? 0),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const svc = createClient(SUPABASE_URL, SERVICE_KEY);

  // ── Autorización (cron, service_role o usuario de la allowlist) ──
  const bearer = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const cronHeader = req.headers.get("x-antena-cron") ?? "";
  let autorizado = (CRON_SECRET && cronHeader === CRON_SECRET) || bearer === SERVICE_KEY;

  if (!autorizado && bearer) {
    const { data } = await svc.auth.getUser(bearer);
    const email = data?.user?.email?.toLowerCase();
    if (email) {
      const { data: fila } = await svc
        .from("antena_usuarios_permitidos")
        .select("email")
        .ilike("email", email)
        .maybeSingle();
      autorizado = !!fila;
    }
  }
  if (!autorizado) {
    return new Response(JSON.stringify({ error: "No autorizado" }),
      { status: 403, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  // ── Destinos publicados dentro de la ventana ──
  const desde = new Date(Date.now() - DIAS_VENTANA * 24 * 3600 * 1000).toISOString();
  const { data: dests, error } = await svc
    .from("antena_destinos")
    .select("id, post_externo_id, publicado_at, cuenta:antena_cuentas(*)")
    .eq("estado", "publicada")
    .not("post_externo_id", "is", null)
    .gte("publicado_at", desde);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  // Saltar destinos con snapshot reciente (evita spam del botón)
  const frescoDesde = new Date(Date.now() - HORAS_FRESCURA * 3600 * 1000).toISOString();
  const { data: frescas } = await svc
    .from("antena_metricas")
    .select("destino_id")
    .gte("capturado_at", frescoDesde);
  const yaFrescos = new Set((frescas ?? []).map((f) => f.destino_id));

  let capturadas = 0, saltadas = 0, fallidas = 0;

  for (const dest of dests ?? []) {
    if (yaFrescos.has(dest.id)) { saltadas++; continue; }
    const cuenta = dest.cuenta;
    if (!cuenta || cuenta.estado !== "activa") { saltadas++; continue; }

    try {
      let m;
      if (cuenta.plataforma === "facebook") m = await metricasFacebook(cuenta, dest.post_externo_id);
      else if (cuenta.plataforma === "x")   m = await metricasX(cuenta, dest.post_externo_id);
      else { saltadas++; continue; }

      await svc.from("antena_metricas").insert({ destino_id: dest.id, ...m });
      capturadas++;
    } catch (e) {
      fallidas++;
      console.error(`[antena-metricas] Destino ${dest.id} falló:`, e);
    }
  }

  return new Response(JSON.stringify({ capturadas, saltadas, fallidas }),
    { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
});
