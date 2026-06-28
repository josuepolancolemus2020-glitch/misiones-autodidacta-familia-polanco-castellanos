// Edge Function: send-chat-push
//
// Se invoca automáticamente desde un trigger de Postgres (ver
// supabase/sql/chat_push_trigger.sql) cada vez que se inserta un
// mensaje nuevo en la tabla "mensajes". Envía una notificación push
// real (Web Push / VAPID) a todos los dispositivos de la familia que
// hayan activado las notificaciones, excepto al que envió el mensaje.
//
// Variables de entorno necesarias (Project Settings -> Edge Functions
// -> Secrets). SUPABASE_URL y SUPABASE_ANON_KEY ya las provee
// Supabase automáticamente en cada función; solo hace falta agregar:
//   VAPID_PUBLIC_KEY
//   VAPID_PRIVATE_KEY
//
// Al crear esta función en el Dashboard, desactiva "Enforce JWT
// Verification" -- la llama el trigger de la base de datos, no un
// usuario con sesión.

import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const VAPID_PUBLIC_KEY  = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

webpush.setVapidDetails(
  "mailto:familia@policastsapien.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

async function eliminarSuscripcion(endpoint: string) {
  await fetch(
    `${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    // El trigger manda { record: {...fila nueva de mensajes...} }
    const mensaje = payload.record ?? payload;

    const title = `💬 ${mensaje.usuario || "Familia"}`;
    const body  = mensaje.mensaje || "Tienes un mensaje nuevo en el Chat Familiar";

    const subsRes = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    const subs = await subsRes.json();

    const destinatarios = (subs ?? []).filter(
      (s: { nombre: string }) => s.nombre !== mensaje.usuario
    );

    const resultados = await Promise.allSettled(
      destinatarios.map((s: { endpoint: string; p256dh: string; auth: string }) =>
        webpush
          .sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            JSON.stringify({ title, body, url: "./index.html?view=chat" })
          )
          .catch(async (err: { statusCode?: number }) => {
            // 404/410 = la suscripción ya no es válida (se desinstaló, etc.)
            if (err?.statusCode === 404 || err?.statusCode === 410) {
              await eliminarSuscripcion(s.endpoint);
            }
            throw err;
          })
      )
    );

    return new Response(
      JSON.stringify({ enviados: destinatarios.length, resultados: resultados.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[send-chat-push] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
