// Edge Function: antena-oauth-start
//
// Inicia la conexión OAuth 2.0 (con PKCE) de una red social.
// La llama el navegador (con la sesión del usuario) y devuelve la URL
// de autorización a la que hay que redirigir.
//
// Secrets necesarios (Project Settings -> Edge Functions -> Secrets):
//   X_CLIENT_ID
// (SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY los
//  provee Supabase automáticamente.)
//
// "Enforce JWT Verification": ACTIVADO (la llama un usuario con sesión).

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY     = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const X_CLIENT_ID  = Deno.env.get("X_CLIENT_ID")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    // 1. Identificar al usuario por su sesión
    const authHeader = req.headers.get("Authorization") ?? "";
    const supaUser = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supaUser.auth.getUser();
    if (!user || !user.email) return json({ error: "Sesión inválida" }, 401);

    // 2. Verificar allowlist
    const svc = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: permitido } = await svc
      .from("antena_usuarios_permitidos")
      .select("email")
      .ilike("email", user.email)
      .maybeSingle();
    if (!permitido) return json({ error: "Usuario no autorizado" }, 403);

    // 3. Generar PKCE (verifier + challenge) y guardar el estado
    const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const challengeBytes = new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)),
    );
    const challenge = base64url(challengeBytes);

    const { data: st, error: stErr } = await svc
      .from("antena_oauth_states")
      .insert({ usuario_id: user.id, plataforma: "x", code_verifier: verifier })
      .select()
      .single();
    if (stErr || !st) {
      console.error("[antena-oauth-start] Error guardando state:", stErr);
      return json({ error: "No se pudo iniciar la conexión" }, 500);
    }

    // 4. Construir la URL de autorización de X
    const url = new URL("https://x.com/i/oauth2/authorize");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", X_CLIENT_ID);
    url.searchParams.set("redirect_uri", `${SUPABASE_URL}/functions/v1/antena-oauth-callback`);
    url.searchParams.set("scope", "tweet.read tweet.write users.read offline.access");
    url.searchParams.set("state", st.state);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");

    return json({ url: url.toString() });
  } catch (e) {
    console.error("[antena-oauth-start] Error:", e);
    return json({ error: "Error interno" }, 500);
  }
});
