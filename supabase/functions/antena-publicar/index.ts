// Edge Function: antena-publicar
//
// EL PUBLICADOR. pg_cron la despierta cada minuto (ver
// supabase/sql/antena_fase2.sql). Busca publicaciones cuya hora llegó,
// renueva tokens si hace falta (los de X caducan cada 2 horas) y
// publica en cada red destino. Reintenta con espera creciente
// (2, 10, 30 min) y tras 3 fallos marca error.
//
// Secrets necesarios: X_CLIENT_ID, X_CLIENT_SECRET, ANTENA_CRON_SECRET
//
// "Enforce JWT Verification": DESACTIVADO (los proyectos con llaves
// nuevas sb_* no tienen JWT clásico para el cron). En su lugar, la
// función exige la contraseña del reloj en el header x-antena-cron.

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL    = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const X_CLIENT_ID     = Deno.env.get("X_CLIENT_ID")!;
const X_CLIENT_SECRET = Deno.env.get("X_CLIENT_SECRET")!;

const RETRASOS_MIN = [2, 10, 30]; // backoff entre reintentos

/* Renueva el access token si está por vencer (margen de 5 minutos). */
async function asegurarToken(svc: SupabaseClient, cuenta: any) {
  // Los tokens de Página de Facebook no caducan de forma programada
  if (!cuenta.token_expira_at) return cuenta;
  const expira = new Date(cuenta.token_expira_at).getTime();
  if (expira - Date.now() > 5 * 60 * 1000) return cuenta;

  if (!cuenta.refresh_token) throw new Error("Token vencido y sin refresh_token");

  const basic = btoa(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`);
  const res = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: cuenta.refresh_token,
      client_id: X_CLIENT_ID,
    }),
  });
  const tok = await res.json();

  if (!res.ok || !tok.access_token) {
    // El refresh token murió: la cuenta necesita reconectarse a mano
    await svc.from("antena_cuentas")
      .update({ estado: "requiere_reconexion", actualizado_at: new Date().toISOString() })
      .eq("id", cuenta.id);
    throw new Error("No se pudo renovar el token: reconecta la cuenta");
  }

  const upd = {
    access_token: tok.access_token,
    refresh_token: tok.refresh_token ?? cuenta.refresh_token, // X rota el refresh token
    token_expira_at: new Date(Date.now() + (tok.expires_in ?? 7200) * 1000).toISOString(),
    actualizado_at: new Date().toISOString(),
  };
  await svc.from("antena_cuentas").update(upd).eq("id", cuenta.id);
  return { ...cuenta, ...upd };
}

/* Publica un destino en su red. Devuelve el id del post creado. */
async function publicarEn(cuenta: any, pub: any): Promise<string> {
  if (cuenta.plataforma === "x") {
    const res = await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cuenta.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: pub.cuerpo }),
    });
    const body = await res.json();
    if (!res.ok || !body?.data?.id) {
      throw new Error(`X respondió ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
    }
    return body.data.id;
  }

  if (cuenta.plataforma === "facebook") {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${cuenta.cuenta_externa_id}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: pub.cuerpo, access_token: cuenta.access_token }),
      },
    );
    const body = await res.json();
    if (!res.ok || !body?.id) {
      throw new Error(`Facebook respondió ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
    }
    return body.id; // formato "pageid_postid"
  }

  throw new Error(`Plataforma no soportada aún: ${cuenta.plataforma}`);
}

const CRON_SECRET = Deno.env.get("ANTENA_CRON_SECRET") ?? "";

Deno.serve(async (req) => {
  // Solo el cron (con la contraseña del reloj) puede invocar esta función
  const bearer = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const cronHeader = req.headers.get("x-antena-cron") ?? "";
  const autorizado =
    (CRON_SECRET && cronHeader === CRON_SECRET) || bearer === SERVICE_KEY;
  if (!autorizado) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 403 });
  }

  const svc = createClient(SUPABASE_URL, SERVICE_KEY);
  const ahora = new Date().toISOString();

  // 1. Reclamar atómicamente las publicaciones cuya hora llegó
  const { data: pubs, error: claimErr } = await svc
    .from("antena_publicaciones")
    .update({ estado: "publicando" })
    .eq("estado", "programada")
    .lte("programada_at", ahora)
    .select();
  if (claimErr) {
    console.error("[antena-publicar] Error reclamando:", claimErr);
    return new Response(JSON.stringify({ error: claimErr.message }), { status: 500 });
  }
  if (!pubs?.length) {
    return new Response(JSON.stringify({ publicadas: 0 }), { status: 200 });
  }

  let publicadas = 0;

  for (const pub of pubs) {
    const { data: dests } = await svc
      .from("antena_destinos")
      .select("*, cuenta:antena_cuentas(*)")
      .eq("publicacion_id", pub.id)
      .eq("estado", "pendiente");

    let maxIntentos = 0;

    for (const dest of dests ?? []) {
      try {
        if (!dest.cuenta) throw new Error("La cuenta ya no existe");
        if (dest.cuenta.estado !== "activa") throw new Error("La cuenta requiere reconexión");

        const cuenta = await asegurarToken(svc, dest.cuenta);
        const postId = await publicarEn(cuenta, pub);

        await svc.from("antena_destinos").update({
          estado: "publicada",
          post_externo_id: postId,
          publicado_at: new Date().toISOString(),
          ultimo_error: null,
        }).eq("id", dest.id);
        publicadas++;
      } catch (e) {
        const intentos = (dest.intentos ?? 0) + 1;
        const agotado = intentos >= 3;
        await svc.from("antena_destinos").update({
          intentos,
          ultimo_error: String(e).slice(0, 500),
          estado: agotado ? "error" : "pendiente",
        }).eq("id", dest.id);
        if (!agotado) maxIntentos = Math.max(maxIntentos, intentos);
        console.error(`[antena-publicar] Destino ${dest.id} falló (intento ${intentos}):`, e);
      }
    }

    // 2. Estado final de la publicación según cómo quedaron sus destinos
    const { data: resumen } = await svc
      .from("antena_destinos")
      .select("estado")
      .eq("publicacion_id", pub.id);
    const estados = (resumen ?? []).map((d) => d.estado);

    if (estados.some((s) => s === "pendiente")) {
      // Quedan reintentos: reprogramar con backoff
      const espera = RETRASOS_MIN[Math.min(maxIntentos, RETRASOS_MIN.length) - 1] ?? 30;
      await svc.from("antena_publicaciones").update({
        estado: "programada",
        programada_at: new Date(Date.now() + espera * 60 * 1000).toISOString(),
      }).eq("id", pub.id);
    } else if (estados.some((s) => s === "error")) {
      await svc.from("antena_publicaciones").update({ estado: "error" }).eq("id", pub.id);
    } else {
      await svc.from("antena_publicaciones").update({ estado: "publicada" }).eq("id", pub.id);
    }
  }

  return new Response(JSON.stringify({ publicadas }), { status: 200 });
});
