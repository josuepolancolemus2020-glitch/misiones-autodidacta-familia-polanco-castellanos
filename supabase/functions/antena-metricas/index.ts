// Edge Function: antena-metricas
//
// EL OBSERVADOR (Fase 5b). pg_cron la despierta cada 4 horas (ver
// supabase/sql/antena_fase4.sql) y también se puede invocar desde la app
// con el botón "Actualizar". Recorre el feed completo de cada Página de
// Facebook conectada —se publique desde donde se publique—, y guarda:
//   · los posts nuevos que descubra (antena_posts)
//   · una foto de las métricas de cada post (antena_post_metricas)
//   · los comentarios y si la Página ya los respondió (antena_comentarios)
//   · la cantidad de seguidores (antena_pagina_metricas)
//
// Secrets necesarios: ANTENA_CRON_SECRET (para el cron).
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

const FEED_LIMIT     = 25; // posts recientes a vigilar por Página
const HORAS_FRESCURA = 2;  // no repetir snapshot si hay uno más nuevo que esto

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v21.0";

/* GET al Graph API con el token de la Página. */
async function graphGet(path: string, params: Record<string, string>, token: string) {
  const qs = new URLSearchParams({ ...params, access_token: token });
  const res = await fetch(`${GRAPH}/${path}?${qs}`);
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Facebook respondió ${res.status}: ${JSON.stringify(body).slice(0, 200)}`);
  }
  return body;
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

  const { data: cuentas } = await svc
    .from("antena_cuentas")
    .select("*")
    .eq("plataforma", "facebook")
    .eq("estado", "activa");

  const frescoDesde = new Date(Date.now() - HORAS_FRESCURA * 3600 * 1000).toISOString();
  let posts = 0, snapshots = 0, comentarios = 0, fallidas = 0;

  for (const cuenta of cuentas ?? []) {
    try {
      const pageId = cuenta.cuenta_externa_id;

      // ── 1. Seguidores de la Página ──
      const pagina = await graphGet(pageId, { fields: "followers_count" }, cuenta.access_token);
      const { data: ultPag } = await svc.from("antena_pagina_metricas")
        .select("id").eq("cuenta_id", cuenta.id)
        .gte("capturado_at", frescoDesde).limit(1);
      if (!ultPag?.length) {
        await svc.from("antena_pagina_metricas").insert({
          cuenta_id: cuenta.id,
          seguidores: Number(pagina?.followers_count ?? 0),
        });
      }

      // ── 2. El feed completo, con comentarios y sus respuestas ──
      const feed = await graphGet(`${pageId}/feed`, {
        limit: String(FEED_LIMIT),
        fields: "id,message,created_time,permalink_url,shares,likes.summary(true)," +
          "comments.summary(true).limit(25){id,from,message,created_time,permalink_url," +
          "comments.limit(10){from}}",
      }, cuenta.access_token);

      for (const post of feed?.data ?? []) {
        // 2a. Registrar el post (venga de Antena, de Facebook o de donde sea)
        const { data: fila, error: upErr } = await svc.from("antena_posts").upsert({
          cuenta_id: cuenta.id,
          post_externo_id: post.id,
          mensaje: (post.message ?? "").slice(0, 500),
          permalink: post.permalink_url ?? null,
          creado_en_red: post.created_time ?? null,
          actualizado_at: new Date().toISOString(),
        }, { onConflict: "cuenta_id,post_externo_id" }).select("id").single();
        if (upErr || !fila) throw new Error(`upsert post: ${upErr?.message}`);
        posts++;

        // 2b. Snapshot de métricas (con frescura para no llenar la tabla)
        const { data: ultMet } = await svc.from("antena_post_metricas")
          .select("id").eq("post_id", fila.id)
          .gte("capturado_at", frescoDesde).limit(1);
        if (!ultMet?.length) {
          let vistas = 0;
          try {
            const ins = await graphGet(`${post.id}/insights`,
              { metric: "post_impressions" }, cuenta.access_token);
            vistas = Number(ins?.data?.[0]?.values?.[0]?.value ?? 0);
          } catch (_) { /* posts muy nuevos aún no tienen insights */ }

          await svc.from("antena_post_metricas").insert({
            post_id: fila.id,
            vistas,
            likes:       Number(post?.likes?.summary?.total_count ?? 0),
            comentarios: Number(post?.comments?.summary?.total_count ?? 0),
            compartidos: Number(post?.shares?.count ?? 0),
          });
          snapshots++;
        }

        // 2c. Comentarios de la audiencia (los de la propia Página no cuentan)
        for (const com of post?.comments?.data ?? []) {
          if (!com?.id || com?.from?.id === pageId) continue;
          const respondida = (com?.comments?.data ?? [])
            .some((r: any) => r?.from?.id === pageId);
          // upsert sin tocar "atendida": lo marcado a mano se respeta
          const { error: comErr } = await svc.from("antena_comentarios").upsert({
            post_id: fila.id,
            comentario_externo_id: com.id,
            autor: com?.from?.name ?? "Alguien",
            mensaje: (com.message ?? "").slice(0, 500),
            permalink: com.permalink_url ?? post.permalink_url ?? null,
            creado_en_red: com.created_time ?? null,
            respondido_pagina: respondida,
          }, { onConflict: "comentario_externo_id" });
          if (!comErr) comentarios++;
        }
      }
    } catch (e) {
      fallidas++;
      console.error(`[antena-metricas] Cuenta ${cuenta.id} falló:`, e);
    }
  }

  return new Response(JSON.stringify({ posts, snapshots, comentarios, fallidas }),
    { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
});
