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
import { normaliza, topeDeFuente, temaDePrensa, type Fuente, type Item } from "./normaliza.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET  = Deno.env.get("CRIBA_CRON_SECRET") ?? "";

// El tope de la edición del día. La regla 8 de la puerta: un número
// finito que se acaba. Lo que no entra hoy sale mañana, no se pierde.
const TOPE_EDICION = 25;

// Por fuente y por vuelta. Una fuente que devuelva mil registros -Dialnet
// puede- no debe llenar la edición ella sola ni tardar diez minutos.
/* Cuántos resultados pide cada consulta. Va en las plantillas
   (`per-page=8`, `limit=8`, `pageSize=8`) y aquí para poder calcular el
   tope de una fuente sin adivinarlo. */
const POR_CONSULTA = 8;

/* Cuántos días atrás se pregunta. Más no sirve: la edición es diaria y
   lo de hace tres meses no es novedad, es archivo. */
const DIAS_ATRAS = 21;

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

  /* ⚠️ LOS TEMAS. Sin ellos esto vuelve a ser una manguera.
     La primera edición salió llena de veterinaria porque a Dialnet se le
     pidió su volcado entero y nadie preguntó por ningún interés. Ahora a
     cada fuente de consulta se le pregunta TEMA POR TEMA, y lo que llega
     entra sabiendo qué lo trajo. */
  const { data: temas } = await svc
    .from("criba_temas").select("*").eq("activo", true).order("peso", { ascending: false });
  const losTemas = temas ?? [];

  const desde = new Date(Date.now() - DIAS_ATRAS * 86400000).toISOString().slice(0, 10);
  const parte: Record<string, unknown>[] = [];

  for (const f of fuentes ?? []) {
    const ahora = new Date().toISOString();
    let nuevos = 0, leidos = 0, fallo: string | null = null;

    /* Una fuente de CONSULTA se pregunta una vez por tema; una de
       volcado (un canal pequeño y ya temático, como la CNBS) se pide
       tal cual y sus artículos no llevan tema. */
    const vueltas = f.plantilla
      ? losTemas.map((t: any) => ({
          tema: t,
          url: String(f.plantilla)
                 .replace("{q}", encodeURIComponent(t.termino))
                 .replace("{desde}", desde),
        }))
      : [{ tema: null, url: f.url }];

    const acumulado: Item[] = [];
    const fallos: string[] = [];
    let descartados = 0;   // de prensa, por no casar con ningún tema

    for (const v of vueltas) {
      try {
        const res = await fetch(v.url, {
          redirect: "follow",
          signal: AbortSignal.timeout(TIEMPO_MAX),
          headers: { "User-Agent": UA, "Accept": "application/atom+xml, application/rss+xml, application/json, text/xml;q=0.9, */*;q=0.5" },
        });
        if (!res.ok) throw new Error(`${v.tema ? v.tema.id + ": " : ""}respondió ${res.status}`);
        const cuerpo = await res.text();
        const items = normaliza(cuerpo, f as unknown as Fuente);
        for (const it of items) {
          if (f.clase === "prensa") {
            /* ⚠️ LA PRENSA SE FILTRA DESPUÉS DE TRAERLA. No se le puede
               preguntar por tema y no es temática: Jot Down publica
               sobre fútbol y sobre Bourdieu el mismo día. Lo que no case
               con ninguna materia NO ENTRA — un canal de prensa sin
               filtro es la manguera de Dialnet otra vez. */
            const tema = temaDePrensa(it.titulo, it.resumen, losTemas as any);
            if (!tema) { descartados++; continue; }
            acumulado.push({ ...it, tema_id: tema } as Item);
          } else {
            acumulado.push(v.tema ? { ...it, tema_id: v.tema.id } as Item : it);
          }
        }
      } catch (e) {
        fallos.push(String((e as Error).message ?? e).slice(0, 120));
      }
      /* Se pregunta con educación: estas APIs son gratis y de todos. */
      if (vueltas.length > 1) await new Promise((r) => setTimeout(r, 350));
    }

    try {
      /* Sin gemelos entre temas: el mismo trabajo sale buscando «sesgo
         cognitivo» y «toma de decisiones», y se queda con el primero. */
      const vistas = new Set<string>();
      const items = acumulado
        .filter((i) => (vistas.has(i.clave) ? false : (vistas.add(i.clave), true)))
        .slice(0, topeDeFuente(!!f.plantilla, losTemas.length, POR_CONSULTA));
      leidos = items.length;

      /* Que TODAS las vueltas fallen es un fallo de la fuente. Que
         fallen algunas no: un tema sin resultados es información, no
         avería. */
      if (leidos === 0) {
        /* Que un canal de prensa traiga cosas y ninguna interese NO es
           una avería: es la criba haciendo su trabajo. Se apunta con esas
           palabras para no ir a buscar un fallo que no existe. */
        throw new Error(
          descartados > 0
            ? `trajo ${descartados} y ninguno casó con las materias (no es una avería)`
            : fallos.length
              ? "ninguna consulta trajo nada · " + fallos[0]
              : "respondió pero no trajo ningún ítem utilizable");
      }

      const { error: eI, count } = await svc
        .from("criba_items")
        .upsert(items, { onConflict: "clave", ignoreDuplicates: true, count: "exact" });
      if (eI) throw new Error("al guardar: " + eI.message);
      nuevos = count ?? 0;

      await svc.from("criba_fuentes").update({
        ultimo_intento_at: ahora, ultimo_exito_at: ahora,
        ultimo_error: fallos.length ? `${fallos.length} de ${vueltas.length} consultas fallaron` : null,
        fallos_seguidos: 0,
      }).eq("id", f.id);

    } catch (e) {
      fallo = String((e as Error).message ?? e).slice(0, 500);
      await svc.from("criba_fuentes").update({
        ultimo_intento_at: ahora,
        ultimo_error: fallo,
        fallos_seguidos: (f.fallos_seguidos ?? 0) + 1,
      }).eq("id", f.id);
    }

    parte.push({ fuente: f.id, clase: f.clase ?? 'local',
                 consultas: vueltas.length, leidos, nuevos, descartados, fallo });
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
