// ════════════════════════════════════════════════════════════════════
// Edge Function: criba-cosecha  🪶
// ════════════════════════════════════════════════════════════════════
// EL RECOLECTOR DE LA CRIBA. Un reloj (pg_cron) lo despierta cada día;
// también se puede llamar a mano desde la aplicación con «Actualizar».
// Recorre las fuentes activas, guarda lo nuevo y arma la edición del día.
//
// POR QUÉ ESTO NO LO HACE EL NAVEGADOR, y no es un detalle:
//   1. Casi ninguna fuente manda las cabeceras que hacen falta para que
//      una página pueda pedirlas. Se comprobó: la sonda del 29 de agosto
//      de 2026 encontró seis fuentes que rechazan de plano.
//   2. Aunque las mandaran, cada aparato descargaría todo otra vez, sin
//      memoria compartida y sin saber qué ya se leyó.
//   3. Y solo habría Criba mientras la aplicación estuviera abierta.
//   Es el mismo reparto que ya usa la Antena: el recolector escribe, el
//   navegador solo lee.
//
// LO QUE INTERPRETA LO QUE LLEGA VIVE EN normaliza.ts, aparte y sin red,
// para poder probarlo entero sin Deno:
//   node --experimental-strip-types _dev/prueba-criba-normaliza.mjs
//
// Secretos necesarios: CRIBA_CRON_SECRET (para el reloj).
// «Enforce JWT Verification»: DESACTIVADO, igual que antena-metricas.
// Autorización aceptada por cualquiera de estas tres vías:
//   1. Cabecera x-criba-cron con el secreto del reloj (pg_cron)
//   2. Bearer con la clave service_role
//   3. Bearer con la sesión de alguien de familia_miembros (el botón)
// ════════════════════════════════════════════════════════════════════

import { createClient } from "npm:@supabase/supabase-js@2";
import { normaliza, type Fuente, type Item } from "./normaliza.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET  = Deno.env.get("CRIBA_CRON_SECRET") ?? "";

// El tope de la edición del día. La regla 8 de la puerta: un número
// finito que se acaba. Lo que no entra hoy sale mañana, no se pierde.
const TOPE_EDICION = 25;

// Por fuente y por vuelta. Una fuente que devuelva mil registros -Dialnet
// puede- no debe llenar la edición ella sola ni tardar diez minutos.
const TOPE_POR_FUENTE = 60;

const TIEMPO_MAX = 25000;
const UA = "FARO-LaCriba/1.0 (+https://github.com/josuepolancolemus2020-glitch/misiones-autodidacta-familia-polanco-castellanos)";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-criba-cron",
};

const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const svc = createClient(SUPABASE_URL, SERVICE_KEY);

  // ── Autorización ──
  const bearer = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  let autorizado = (CRON_SECRET && req.headers.get("x-criba-cron") === CRON_SECRET) || bearer === SERVICE_KEY;

  if (!autorizado && bearer) {
    const { data } = await svc.auth.getUser(bearer);
    if (data?.user?.id) {
      const { data: fila } = await svc
        .from("familia_miembros").select("user_id").eq("user_id", data.user.id).maybeSingle();
      autorizado = !!fila;
    }
  }
  if (!autorizado) return json({ error: "No autorizado" }, 403);

  const { data: fuentes, error: eF } = await svc
    .from("criba_fuentes").select("*").eq("activa", true).order("peso", { ascending: false });
  if (eF) return json({ error: "No se pudo leer el registro de fuentes: " + eF.message }, 500);

  const parte: Record<string, unknown>[] = [];

  for (const f of fuentes ?? []) {
    const ahora = new Date().toISOString();
    let nuevos = 0, leidos = 0, fallo: string | null = null;

    try {
      const res = await fetch(f.url, {
        redirect: "follow",
        signal: AbortSignal.timeout(TIEMPO_MAX),
        headers: { "User-Agent": UA, "Accept": "application/atom+xml, application/rss+xml, application/json, text/xml;q=0.9, */*;q=0.5" },
      });
      if (!res.ok) throw new Error(`respondió ${res.status}`);

      const cuerpo = await res.text();
      const items: Item[] = normaliza(cuerpo, f as unknown as Fuente).slice(0, TOPE_POR_FUENTE);
      leidos = items.length;

      // Si el canal contesta pero no trae nada, ES un fallo: es la
      // regla 6 -«lo que no llega, se dice»-. Un canal vacío durante
      // semanas es exactamente lo que hay que ver a tiempo, y sin esto
      // se vería como una fuente sana que casualmente no publica.
      if (leidos === 0) throw new Error("el canal respondió pero no trajo ningún ítem utilizable");

      // `ignoreDuplicates`: el `unique` de `clave` es quien de verdad
      // impide los gemelos, aquí y entre fuentes distintas. Reinsertar
      // lo que ya estaba NO puede pisar lo leído ni lo guardado.
      const { error: eI, count } = await svc
        .from("criba_items")
        .upsert(items, { onConflict: "clave", ignoreDuplicates: true, count: "exact" });
      if (eI) throw new Error("al guardar: " + eI.message);
      nuevos = count ?? 0;

      await svc.from("criba_fuentes").update({
        ultimo_intento_at: ahora, ultimo_exito_at: ahora,
        ultimo_error: null, fallos_seguidos: 0,
      }).eq("id", f.id);

    } catch (e) {
      // Una fuente caída NO tumba la cosecha: se apunta y se sigue con
      // la siguiente. Lo contrario significaría que la fuente número
      // tres deja sin edición a las que van detrás.
      fallo = String((e as Error).message ?? e).slice(0, 500);
      await svc.from("criba_fuentes").update({
        ultimo_intento_at: ahora,
        ultimo_error: fallo,
        fallos_seguidos: (f.fallos_seguidos ?? 0) + 1,
      }).eq("id", f.id);
    }

    parte.push({ fuente: f.id, leidos, nuevos, fallo });
  }

  // Armar la edición del día, con su fondo. Lo que no entre sale mañana.
  // ⚠️ Se OMITE `dia` en vez de pasar null: en PostgreSQL un null
  // explícito no usa el valor por omisión, así que `{ dia: null }` armaba
  // la edición con fecha NULL, o sea no la armaba. La función ya se
  // defiende con un coalesce, pero llamarla bien no cuesta nada.
  const { data: puestos } = await svc.rpc("criba_arma_edicion", { tope: TOPE_EDICION });
  await svc.rpc("criba_higiene");

  return json({
    ok: true,
    fuentes: parte,
    edicion_de_hoy: puestos ?? 0,
    // Se devuelve la cuenta de fuentes con fallo aparte, para que quien
    // llame pueda enseñarlo sin releer la tabla entera.
    con_fallo: parte.filter((p) => p.fallo).length,
  });
});
