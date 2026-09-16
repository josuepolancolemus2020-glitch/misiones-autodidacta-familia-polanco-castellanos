// ════════════════════════════════════════════════════════════════════
// Edge Function: voz-actividades-ia  📝🤖
// ════════════════════════════════════════════════════════════════════
// LE PIDE A CLAUDE LAS ACTIVIDADES DE COMPRENSIÓN DE UN TEXTO de La Voz
// Prestada y devuelve solo las que CITAN el texto. Pedido por el autor el
// 16 de septiembre de 2026: «que el sistema genere las actividades de cada
// lectura tomando en consideración los mejores criterios de abstracción y
// síntesis de lectura», sin tener que pedírselas en otra ventana y pegar.
//
// POR QUÉ ESTO NO LO HACE EL NAVEGADOR, y no es un detalle: la clave de la
// API de Anthropic no puede ir en el código de la aplicación, que lo lee
// cualquiera. Aquí vive como secreto de la función, y la función solo
// atiende a quien entró en F.A.R.O y es de la casa (familia_miembros).
//
// LO QUE INTERPRETA LO QUE DEVUELVE LA MÁQUINA VIVE EN verifica.ts, aparte
// y sin red, para poder probarlo entero sin Deno:
//   node --experimental-strip-types _dev/prueba-voz-actividades-ia.mjs
//
// Secretos necesarios: ANTHROPIC_API_KEY (Edge Functions → Secrets).
// «Enforce JWT Verification»: DESACTIVADO, igual que criba-cosecha: la
// función comprueba ella misma que el Bearer sea una sesión de alguien de
// familia_miembros. (Con la verificación del panel encendida, la clave
// publicable —que también es un JWT— pasaría igual, así que no separa a la
// casa de la calle; la comprobación de dentro sí.)
// ════════════════════════════════════════════════════════════════════

import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";
import { z } from "npm:zod@3";
import { zodOutputFormat } from "npm:@anthropic-ai/sdk/helpers/zod";
import { cuentaObjetivo, limpia, preparaTexto, resumeDescartes } from "./verifica.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

/* El modelo y el esfuerzo. `medium` y no `high` por el reloj de la
   función, no por ahorrar: en el plan gratuito de Supabase una función
   tiene 150 segundos de pared, y un ensayo de ocho mil palabras a
   esfuerzo alto se acerca. Si algún día hay plan de pago, es una palabra. */
const MODELO = "claude-opus-5";
const ESFUERZO = "medium";
const TOPE_TEXTO = 200_000;   // caracteres (~50 mil tokens): un libro corto
const TOPE_ITEMS = 40;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });

/* La forma PLANA de cada actividad. Todos los campos van siempre; los que
   no aplican van vacíos. Un esquema sin opcionales es el que menos
   sorpresas da a la salida estructurada, y `verifica.ts` lo pasa después
   a la forma de la casa. */
const Item = z.object({
  k: z.enum(["flash", "pares", "opcion", "completar", "abierta"]),
  nivel: z.enum(["dato", "termino", "idea", "tesis", "relacion", "juicio"]),
  donde: z.string(),
  cita: z.string(),
  q: z.string(),
  a: z.string(),
  o: z.array(z.string()),
  ok: z.number().int(),
  ps: z.array(z.object({ a: z.string(), b: z.string() })),
  guia: z.string(),
});
const Salida = z.object({ tesis: z.string(), items: z.array(Item) });

/* ⚠️ LOS CRITERIOS VAN AQUÍ, ESCRITOS, Y NO EN LA CABEZA DE NADIE. Son los
   del taller de la memoria de la casa: recordar antes que reconocer, la
   tesis antes que el dato, todas las secciones y no solo el principio, y
   NADA que no esté en el texto. Va en `system` con caché: es lo estable
   de la petición; lo que cambia —el texto— va detrás. */
const SISTEMA = `Diseñas las actividades de comprensión de un taller de lectura para estudio autodidacta, en una casa donde el mismo texto lo leen varias personas. Recibes un texto completo y devuelves actividades para comprobar —con el libro cerrado— que lo importante se quedó.

CRITERIOS, EN ORDEN DE IMPORTANCIA:

1. LA TESIS PRIMERO. Identifica la idea central del texto entero. Escribe (a) una abierta «¿Cuál es la tesis de este texto? Dila en una frase», con pauta que la enuncie en una o dos frases, y (b) una tarjeta cuyo reverso sea esa tesis. En un texto narrativo, la «tesis» es lo que el texto quiere que el lector entienda: el conflicto y lo que se resuelve o se pierde.
2. UNA IDEA POR SECCIÓN. Para cada capítulo o sección, su idea principal: tarjeta (cara: «¿Qué sostiene la sección "X"?») o abierta con pauta. Cubre TODAS las secciones en proporción a su peso; no te quedes en el principio del texto.
3. LOS DATOS QUE SOSTIENEN EL ARGUMENTO: fechas, nombres, cifras, lugares, obras y autores citados. Solo los que importan para el argumento, no cualquier número. Van como completar (el dato en blanco dentro de su propia frase, escrita con ___) o como selección con cuatro opciones cuyos distractores sean verosímiles y, siempre que se pueda, salgan también del texto.
4. LAS RELACIONES: causa y efecto, comparación, secuencia, quién sostiene qué. Emparejar (de tres a seis parejas, cada lado corto) o selección.
5. LOS TÉRMINOS que el texto define o usa con sentido propio: tarjeta término → definición con las palabras del texto.
6. EL JUICIO: una o dos abiertas que pidan evaluar un argumento (qué evidencia lo sostiene, qué objeción cabe, qué se da por supuesto), con pauta que resuma lo que el texto ofrece para contestarla.

REGLAS QUE NO SE NEGOCIAN:
- Recordar antes que reconocer: prefiere completar, tarjeta y abierta; usa selección solo cuando los distractores sean limpios. Nunca «todas las anteriores» ni «ninguna de las anteriores».
- CADA actividad lleva en «cita» un fragmento LITERAL del texto, copiado tal cual y sin cambiar ni una palabra (entre 15 y 240 caracteres), que respalda la respuesta. Si no puedes citar el texto, no escribas la actividad. Nada de lo que preguntes puede necesitar información que no esté en el texto.
- Cada enunciado se entiende solo: nunca «según el párrafo anterior» ni «en la sección de arriba».
- «ok» es el ÍNDICE de la opción correcta (0 es la primera) y hay exactamente una. En una selección, «o» trae las opciones y «a» va vacía.
- En completar, «q» lleva el hueco escrito como ___ y «a» es exactamente lo que va en el hueco: de una a seis palabras, tal como aparecen en la cita.
- En una tarjeta, «q» es la cara y «a» el reverso. En emparejar, «q» es la consigna y «ps» las parejas. En una abierta, «guia» es la pauta y «a» va vacía.
- «donde» es el título del capítulo o sección de donde sale; «nivel» dice qué se ejercita: dato, termino, idea, tesis, relacion o juicio.
- Escribe en español, con el registro del texto, sin preguntas capciosas, y sin preguntar nunca por la etiqueta del texto (quién lo escribió ni a quién imita).
- Menos y buenas antes que más y flojas.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "metodo", detalle: "Solo POST" }, 405);

  // ── Quién llama: solo alguien de la casa, con sesión ──
  const svc = createClient(SUPABASE_URL, SERVICE_KEY);
  const bearer = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  if (!bearer) return json({ error: "sin_sesion", detalle: "Hace falta entrar en F.A.R.O" }, 401);
  const { data: quien } = await svc.auth.getUser(bearer);
  const uid = quien?.user?.id;
  if (!uid) return json({ error: "sin_sesion", detalle: "La sesión no vale o caducó" }, 401);
  const { data: fila } = await svc.from("familia_miembros").select("user_id").eq("user_id", uid).maybeSingle();
  if (!fila) return json({ error: "no_es_de_la_casa" }, 403);

  /* ⚠️ La clave se comprueba DESPUÉS de la sesión, no antes: si no,
     cualquiera de la calle podría saber si está puesta. Y el aviso nombra
     el secreto exacto y dónde va, porque desde una tableta no se adivina. */
  if (!ANTHROPIC_API_KEY) {
    return json({ error: "sin_clave",
      detalle: "Falta el secreto ANTHROPIC_API_KEY en Supabase → Edge Functions → Secrets" }, 500);
  }

  // ── El texto ──
  let cuerpo: Record<string, unknown> = {};
  try { cuerpo = await req.json(); } catch { return json({ error: "cuerpo", detalle: "El cuerpo no es JSON" }, 400); }
  const texto = String(cuerpo.texto ?? "");
  const titulo = String(cuerpo.titulo ?? "").slice(0, 200);
  const genero = String(cuerpo.genero ?? "").slice(0, 40);
  const capitulos = Array.isArray(cuerpo.capitulos) ? (cuerpo.capitulos as unknown[]).map((c) => String(c).slice(0, 120)).slice(0, 80) : [];
  if (texto.trim().length < 200) return json({ error: "texto_corto", detalle: "El texto tiene menos de 200 caracteres" }, 400);
  if (texto.length > TOPE_TEXTO) return json({ error: "texto_largo", detalle: "El texto pasa de " + TOPE_TEXTO + " caracteres" }, 413);

  const T = preparaTexto(texto);
  const objetivo = cuentaObjetivo(T.palabras);

  const usuario =
    `Título: ${titulo || "(sin título)"}\n` +
    `Género: ${genero || "texto"}\n` +
    (capitulos.length ? `Secciones: ${capitulos.join(" · ")}\n` : "") +
    `Palabras: ${T.palabras}\n` +
    `Cantidad de actividades: alrededor de ${objetivo}, mezclando los tipos.\n\n` +
    `TEXTO (entre las marcas):\n<<<TEXTO\n${texto}\nTEXTO>>>`;

  // ── Claude ──
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  let res;
  try {
    res = await client.messages.parse({
      model: MODELO,
      max_tokens: 16000,
      system: [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: usuario }],
      output_config: { effort: ESFUERZO, format: zodOutputFormat(Salida) },
    });
  } catch (e) {
    /* Los errores se DISTINGUEN, porque se arreglan distinto: una clave
       mala se arregla en Secrets; un 429, esperando; lo demás, mirando. */
    if (e instanceof Anthropic.AuthenticationError) return json({ error: "clave_mala", detalle: "Anthropic rechazó ANTHROPIC_API_KEY" }, 502);
    if (e instanceof Anthropic.RateLimitError) return json({ error: "limite", detalle: "Anthropic pide esperar un momento" }, 429);
    if (e instanceof Anthropic.APIError) return json({ error: "anthropic", detalle: `${e.status}: ${e.message}` }, 502);
    return json({ error: "anthropic", detalle: String((e as Error)?.message ?? e) }, 502);
  }

  if (res.stop_reason === "refusal") return json({ error: "rechazo", detalle: "Claude declinó este texto" }, 502);
  if (res.stop_reason === "max_tokens") return json({ error: "cortado", detalle: "La respuesta se cortó por larga" }, 502);
  const salida = res.parsed_output;
  if (!salida) return json({ error: "sin_json", detalle: "La respuesta no siguió el esquema" }, 502);

  // ── Solo lo que cita el texto ──
  const { items, descartadas } = limpia(salida.items, texto, TOPE_ITEMS);

  return json({
    ok: true,
    tesis: String(salida.tesis ?? "").slice(0, 600),
    items,
    descartadas: descartadas.length,
    motivos: resumeDescartes(descartadas),
    modelo: MODELO,
    uso: { entrada: res.usage.input_tokens, salida: res.usage.output_tokens,
           cache: res.usage.cache_read_input_tokens ?? 0 },
  });
});
