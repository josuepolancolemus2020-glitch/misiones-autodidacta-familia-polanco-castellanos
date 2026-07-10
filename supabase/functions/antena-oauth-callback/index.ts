// Edge Function: antena-oauth-callback
//
// Aquí regresa X después de que el usuario autoriza la conexión.
// Intercambia el "code" por los tokens (usando el client_secret, que
// SOLO vive aquí), obtiene el perfil (@usuario) y guarda la cuenta.
// Al final redirige de vuelta a la app.
//
// Secrets necesarios: X_CLIENT_ID, X_CLIENT_SECRET
// Opcional: ANTENA_APP_URL (por defecto, la URL pública de F.A.R.O.)
//
// "Enforce JWT Verification": DESACTIVADO — la llama el navegador al
// volver de X, sin sesión de Supabase. Se protege con el parámetro
// "state" de un solo uso.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const X_CLIENT_ID      = Deno.env.get("X_CLIENT_ID") ?? "";
const X_CLIENT_SECRET  = Deno.env.get("X_CLIENT_SECRET") ?? "";
const FB_CLIENT_ID     = Deno.env.get("FB_CLIENT_ID") ?? "";
const FB_CLIENT_SECRET = Deno.env.get("FB_CLIENT_SECRET") ?? "";
const FB_API = "https://graph.facebook.com/v21.0";
const APP_URL = Deno.env.get("ANTENA_APP_URL") ??
  "https://josuepolancolemus2020-glitch.github.io/misiones-autodidacta-familia-polanco-castellanos/";

function volverALaApp(hash: string) {
  return new Response(null, {
    status: 302,
    headers: { Location: `${APP_URL}${hash}` },
  });
}

Deno.serve(async (req) => {
  try {
    const u = new URL(req.url);
    const code  = u.searchParams.get("code");
    const state = u.searchParams.get("state");

    // El usuario canceló, o faltan parámetros
    if (u.searchParams.get("error") || !code || !state) {
      return volverALaApp("#antena-x-error");
    }

    const svc = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1. Validar y consumir el state (un solo uso, máx. 10 minutos)
    const { data: st } = await svc
      .from("antena_oauth_states")
      .select("*")
      .eq("state", state)
      .maybeSingle();
    if (!st) return volverALaApp("#antena-x-error");
    await svc.from("antena_oauth_states").delete().eq("state", state);
    if (Date.now() - new Date(st.creado_at).getTime() > 10 * 60 * 1000) {
      return volverALaApp(`#antena-${st.plataforma === "facebook" ? "fb" : "x"}-error`);
    }

    // ══════════ FACEBOOK PÁGINAS ══════════
    if (st.plataforma === "facebook") {
      const redirectUri = `${SUPABASE_URL}/functions/v1/antena-oauth-callback`;

      // 2a. code -> token de usuario (corto)
      const tRes = await fetch(
        `${FB_API}/oauth/access_token?client_id=${FB_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&client_secret=${FB_CLIENT_SECRET}&code=${encodeURIComponent(code)}`,
      );
      const tBody = await tRes.json();
      if (!tRes.ok || !tBody.access_token) {
        console.error("[callback][fb] Error token corto:", tBody);
        return volverALaApp("#antena-fb-error");
      }

      // 2b. token corto -> token de usuario de larga duración
      const llRes = await fetch(
        `${FB_API}/oauth/access_token?grant_type=fb_exchange_token` +
        `&client_id=${FB_CLIENT_ID}&client_secret=${FB_CLIENT_SECRET}` +
        `&fb_exchange_token=${encodeURIComponent(tBody.access_token)}`,
      );
      const llBody = await llRes.json();
      const userToken = llBody.access_token ?? tBody.access_token;

      // 2c. Traer TODAS las Páginas que administra (con su token propio)
      const pRes = await fetch(
        `${FB_API}/me/accounts?fields=id,name,access_token&limit=100` +
        `&access_token=${encodeURIComponent(userToken)}`,
      );
      const pBody = await pRes.json();
      const paginas = pBody?.data ?? [];
      if (!pRes.ok || !paginas.length) {
        console.error("[callback][fb] Sin páginas o error:", pBody);
        return volverALaApp("#antena-fb-sinpaginas");
      }

      // 2d. Guardar cada Página como cuenta conectada independiente.
      // Los tokens de Página derivados de un token de usuario de larga
      // duración no caducan de forma programada (token_expira_at null).
      for (const pg of paginas) {
        await svc.from("antena_cuentas").upsert({
          usuario_id: st.usuario_id,
          plataforma: "facebook",
          cuenta_externa_id: pg.id,
          nombre_visible: pg.name,
          access_token: pg.access_token,
          refresh_token: null,
          token_expira_at: null,
          scopes: ["pages_manage_posts"],
          estado: "activa",
          actualizado_at: new Date().toISOString(),
        }, { onConflict: "plataforma,cuenta_externa_id" });
      }

      return volverALaApp("#antena-fb-conectada");
    }

    // ══════════ X (TWITTER) ══════════

    // 2. Intercambiar el code por los tokens
    const basic = btoa(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`);
    const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${SUPABASE_URL}/functions/v1/antena-oauth-callback`,
        code_verifier: st.code_verifier,
      }),
    });
    const tok = await tokenRes.json();
    if (!tokenRes.ok || !tok.access_token) {
      console.error("[antena-oauth-callback] Error de tokens:", tok);
      return volverALaApp("#antena-x-error");
    }

    // 3. ¿Quién es la cuenta? (@usuario e id)
    const meRes = await fetch("https://api.x.com/2/users/me", {
      headers: { Authorization: `Bearer ${tok.access_token}` },
    });
    const me = (await meRes.json())?.data;
    if (!meRes.ok || !me?.id) {
      console.error("[antena-oauth-callback] Error de perfil");
      return volverALaApp("#antena-x-error");
    }

    // 4. Guardar (o actualizar) la cuenta conectada
    const { error: upErr } = await svc.from("antena_cuentas").upsert({
      usuario_id: st.usuario_id,
      plataforma: "x",
      cuenta_externa_id: me.id,
      nombre_visible: `@${me.username}`,
      access_token: tok.access_token,
      refresh_token: tok.refresh_token ?? null,
      token_expira_at: new Date(Date.now() + (tok.expires_in ?? 7200) * 1000).toISOString(),
      scopes: (tok.scope ?? "").split(" ").filter(Boolean),
      estado: "activa",
      actualizado_at: new Date().toISOString(),
    }, { onConflict: "plataforma,cuenta_externa_id" });
    if (upErr) {
      console.error("[antena-oauth-callback] Error guardando cuenta:", upErr);
      return volverALaApp("#antena-x-error");
    }

    return volverALaApp("#antena-x-conectada");
  } catch (e) {
    console.error("[antena-oauth-callback] Error:", e);
    return volverALaApp("#antena-x-error");
  }
});
