// Edge Function: antena-visibilidad
//
// EL INTERRUPTOR DE LUZ. Una publicación privada (published=false en
// Facebook) solo la ven los admins de la Página. Cuando el autor la
// aprueba, la app invoca esta función con { publicacion_id } y aquí se
// voltea el post a público (is_published=true) con el token de la Página.
//
// Secrets necesarios: ninguno propio (usa el access token guardado).
//
// "Enforce JWT Verification": DESACTIVADO (igual que antena-publicar).
// Autorización: Bearer con la sesión de un usuario de la allowlist
// que además sea dueño de la publicación (o la service_role key).

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body),
    { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const svc = createClient(SUPABASE_URL, SERVICE_KEY);

  // ── Autorización (usuario de la allowlist o service_role) ──
  const bearer = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  let usuarioId: string | null = null;
  let autorizado = bearer === SERVICE_KEY;

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
      usuarioId = data?.user?.id ?? null;
    }
  }
  if (!autorizado) return json({ error: "No autorizado" }, 403);

  // ── La publicación debe existir, ser del autor, estar publicada y privada ──
  const { publicacion_id } = await req.json().catch(() => ({}));
  if (!publicacion_id) return json({ error: "Falta publicacion_id" }, 400);

  let q = svc.from("antena_publicaciones")
    .select("id, usuario_id, estado, privada")
    .eq("id", publicacion_id);
  if (usuarioId) q = q.eq("usuario_id", usuarioId);
  const { data: pub } = await q.maybeSingle();

  if (!pub) return json({ error: "Publicación no encontrada" }, 404);
  if (pub.estado !== "publicada" || !pub.privada) {
    return json({ error: "Esta publicación no está en modo privado" }, 400);
  }

  const { data: dests } = await svc
    .from("antena_destinos")
    .select("id, post_externo_id, cuenta:antena_cuentas(plataforma, access_token, estado)")
    .eq("publicacion_id", pub.id)
    .eq("estado", "publicada")
    .not("post_externo_id", "is", null);

  let publicados = 0, fallidos = 0;
  let ultimoError = "";

  for (const dest of dests ?? []) {
    const cuenta = dest.cuenta as any;
    if (cuenta?.plataforma !== "facebook") continue;
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${encodeURIComponent(dest.post_externo_id)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_published: true, access_token: cuenta.access_token }),
        },
      );
      const body = await res.json();
      if (!res.ok || body?.success === false) {
        throw new Error(`Facebook respondió ${res.status}: ${JSON.stringify(body).slice(0, 200)}`);
      }
      publicados++;
    } catch (e) {
      fallidos++;
      ultimoError = String(e).slice(0, 300);
      console.error(`[antena-visibilidad] Destino ${dest.id} falló:`, e);
    }
  }

  // Solo se apaga el candado si nada falló
  if (!fallidos) {
    await svc.from("antena_publicaciones")
      .update({ privada: false })
      .eq("id", pub.id);
  }

  return json({ publicados, fallidos, ...(ultimoError ? { error: ultimoError } : {}) });
});
