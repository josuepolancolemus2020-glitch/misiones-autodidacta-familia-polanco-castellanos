// !!! ESTO NO ES SQL. NO LO PEGUES EN EL EDITOR SQL. !!!
//
// Va en: Supabase -> Edge Functions -> Deploy a new function
//        Nombre exacto: voz-actividades-ia
//        Y en sus ajustes: "Enforce JWT Verification" = OFF
// Y antes o despues, en Edge Functions -> Secrets:
//        ANTHROPIC_API_KEY = la clave de la API de Anthropic
//
// ARCHIVO GENERADO - NO SE EDITA A MANO. Lo cose
// node _dev/arma-voz-actividades-ia.js  a partir de verifica.ts e index.ts,
// que son los que se prueban:
//   node --experimental-strip-types _dev/prueba-voz-actividades-ia.mjs
// Si editas AQUI, el arreglo se pierde al volver a coser.
//
// Cosido el 2026-09-16.

// ========== 1 de 2 - verifica.ts ==========

// ════════════════════════════════════════════════════════════════════
// voz-actividades-ia · verifica.ts
// ════════════════════════════════════════════════════════════════════
// LO QUE INTERPRETA Y LIMPIA LO QUE DEVUELVE CLAUDE. Sin red y sin base,
// a propósito: es la parte que puede salir torcida, y así se prueba
// entera desde Node, sin Deno:
//   node --experimental-strip-types _dev/prueba-voz-actividades-ia.mjs
//
// ⚠️ LA REGLA QUE SOSTIENE TODO ESTO: NINGUNA ACTIVIDAD ENTRA SIN UNA
// CITA LITERAL DEL TEXTO QUE LA RESPALDE. A la máquina se le pide que
// copie, tal cual, el fragmento del que sale cada respuesta; aquí se
// comprueba que ese fragmento ESTÉ en el texto, y la que no lo tenga se
// descarta y se cuenta. Es la única manera de que «el sistema genera las
// actividades» no signifique «el sistema se inventa las respuestas»: una
// pregunta con la respuesta cambiada no la descubre nadie hasta que
// alguien acierta y la pantalla le dice que falló (regla 35 de La Voz
// Prestada). El aparato vuelve a comprobarlo antes de guardar: la
// pantalla no puede fiarse de la base y la base no puede fiarse de la
// pantalla.
// ════════════════════════════════════════════════════════════════════

type Tipo = "flash" | "pares" | "opcion" | "completar" | "abierta";
const TIPOS: Tipo[] = ["flash", "pares", "opcion", "completar", "abierta"];

type Nivel = "dato" | "termino" | "idea" | "tesis" | "relacion" | "juicio";
const NIVELES: Nivel[] = ["dato", "termino", "idea", "tesis", "relacion", "juicio"];

/* La forma PLANA en que se le pide a la máquina cada actividad. Todos
   los campos van siempre, y los que no aplican van vacíos (cadena vacía,
   lista vacía, -1): un esquema sin campos opcionales es el que menos
   sorpresas da al validar la salida estructurada. */
interface ItemPlano {
  k: string;
  nivel: string;
  donde: string;
  cita: string;
  q: string;
  a: string;
  o: string[];
  ok: number;
  ps: { a: string; b: string }[];
  guia: string;
}

/* La forma de la casa, tal como la guarda el taller (js/tools/voz-prestada.js,
   VOZ_ACT_TIPOS): tarjeta {f, r}, completar {q, a}, selección {q, o, ok},
   emparejar {q, ps: [[a, b], …]}, abierta {q, guia}. */
interface ItemCasa {
  id: string;
  k: Tipo;
  q?: string;
  f?: string;
  r?: string;
  a?: string;
  o?: string[];
  ok?: number;
  ps?: [string, string][];
  guia?: string;
  cita: string;
  donde: string;
  nivel: Nivel;
  via: "ia";
  auto: 1;
}

interface Descartada { motivo: string; q: string }

/* Sin tildes, sin mayúsculas, con las comillas y las rayas unificadas y
   los blancos aplastados. Es lo que hace que «El pozo —dijo— se secó» y
   «el pozo - dijo - se seco» sean la misma cadena: una máquina copia bien
   las letras y mal la tipografía, y una cita que se cae por una comilla
   curva sería un falso rechazo. */
function normaliza(s: string): string {
  return String(s ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[«»“”„‟"]/g, '"')
    .replace(/[‘’‚‛']/g, "'")
    .replace(/[–—‑]/g, "-")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

/* Y sin puntuación ninguna: la segunda vuelta de la comprobación, para
   cuando la máquina se comió una coma. Se deja como función aparte para
   que el texto entero se convierta UNA vez y no una por actividad. */
function sinPuntuacion(s: string): string {
  return normaliza(s).replace(/[^\p{L}\p{N} ]+/gu, " ").replace(/\s+/g, " ").trim();
}

const CITA_MIN = 15;
const CITA_MAX = 300;

/* ¿Está esta cita en el texto? `textoNorm` y `textoSinP` vienen ya
   convertidos (ver `preparaTexto`). Una cita más corta que CITA_MIN no
   prueba nada —«el pozo» está en cualquier cuento— y se rechaza. */
function citaEnTexto(cita: string, textoNorm: string, textoSinP: string): boolean {
  const c = normaliza(cita);
  if (c.length < CITA_MIN) return false;
  if (textoNorm.includes(c)) return true;
  const cp = sinPuntuacion(cita);
  return cp.length >= CITA_MIN && textoSinP.includes(cp);
}

function preparaTexto(texto: string): { norm: string; sinP: string; palabras: number } {
  const norm = normaliza(texto);
  return { norm, sinP: sinPuntuacion(texto), palabras: norm ? norm.split(" ").length : 0 };
}

/* Cuántas actividades pedir. Un cuento de seiscientas palabras no da
   para treinta preguntas sin repetirse; un ensayo de ocho mil sí. */
function cuentaObjetivo(palabras: number): number {
  if (palabras < 800) return 10;
  if (palabras < 3000) return 18;
  if (palabras < 8000) return 26;
  return 32;
}

/* Un identificador ESTABLE por actividad: sale del tipo y del enunciado,
   así que volver a generar el mismo texto reemplaza en vez de duplicar. */
function idDe(k: string, q: string): string {
  let h = 5381;
  const s = k + "|" + normaliza(q);
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return "ia-" + (h >>> 0).toString(36);
}

const recorta = (s: unknown, max: number) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/* Limpia lo que devolvió la máquina y lo pasa a la forma de la casa.
   Lo que no cumple se DESCARTA Y SE CUENTA, con su motivo: un rechazo
   callado se ve desde fuera igual que un rechazo. */
function limpia(crudo: unknown, texto: string, tope = 40): { items: ItemCasa[]; descartadas: Descartada[] } {
  const items: ItemCasa[] = [];
  const descartadas: Descartada[] = [];
  const vistos = new Set<string>();
  const T = preparaTexto(texto);
  const lista = Array.isArray(crudo) ? crudo : [];

  for (const x of lista) {
    const it = (x && typeof x === "object" ? x : {}) as Partial<ItemPlano>;
    const k = String(it.k ?? "").trim() as Tipo;
    const q = recorta(it.q, 600);
    const tira = (motivo: string) => descartadas.push({ motivo, q: q.slice(0, 80) });

    if (!TIPOS.includes(k)) { tira("tipo desconocido «" + String(it.k ?? "").slice(0, 20) + "»"); continue; }
    if (!q) { tira("sin enunciado"); continue; }

    const cita = recorta(it.cita, CITA_MAX);
    if (!citaEnTexto(cita, T.norm, T.sinP)) { tira("la cita no está en el texto"); continue; }

    const nivel = (NIVELES.includes(it.nivel as Nivel) ? it.nivel : "idea") as Nivel;
    const donde = recorta(it.donde, 120);
    const base = { cita, donde, nivel, via: "ia" as const, auto: 1 as const };
    const a = recorta(it.a, 400);
    const guia = recorta(it.guia, 900);

    if (k === "flash") {
      if (!a) { tira("tarjeta sin reverso"); continue; }
      const id = idDe(k, q);
      if (vistos.has(id)) { tira("repetida"); continue; }
      vistos.add(id);
      items.push({ id, k, f: q, r: a, ...base });
    } else if (k === "completar") {
      if (!/___/.test(q)) { tira("completar sin hueco ___"); continue; }
      if (!a) { tira("completar sin respuesta"); continue; }
      if (a.split(" ").length > 8) { tira("la respuesta del hueco es demasiado larga"); continue; }
      /* Y lo que va en el hueco tiene que estar en la cita: es lo que se
         está preguntando, y si la cita dice otra cosa, la respuesta se
         la inventó. */
      if (!sinPuntuacion(cita).includes(sinPuntuacion(a))) { tira("la respuesta del hueco no está en su cita"); continue; }
      const id = idDe(k, q);
      if (vistos.has(id)) { tira("repetida"); continue; }
      vistos.add(id);
      items.push({ id, k, q, a, ...base });
    } else if (k === "opcion") {
      const o = (Array.isArray(it.o) ? it.o : []).map((s) => recorta(s, 200)).filter(Boolean);
      const ok = Number.isInteger(it.ok) ? Number(it.ok) : -1;
      if (o.length < 2 || o.length > 6) { tira("selección con " + o.length + " opciones"); continue; }
      if (ok < 0 || ok >= o.length) { tira("selección sin correcta válida"); continue; }
      if (new Set(o.map(normaliza)).size !== o.length) { tira("selección con opciones repetidas"); continue; }
      if (o.some((s) => /todas las anteriores|ninguna de las anteriores/i.test(s))) { tira("«todas/ninguna de las anteriores»"); continue; }
      const id = idDe(k, q);
      if (vistos.has(id)) { tira("repetida"); continue; }
      vistos.add(id);
      items.push({ id, k, q, o, ok, ...base });
    } else if (k === "pares") {
      const ps = (Array.isArray(it.ps) ? it.ps : [])
        .map((p) => [recorta(p && (p as { a?: string }).a, 120), recorta(p && (p as { b?: string }).b, 160)] as [string, string])
        .filter((p) => p[0] && p[1]);
      if (ps.length < 2 || ps.length > 8) { tira("emparejar con " + ps.length + " parejas"); continue; }
      if (new Set(ps.map((p) => normaliza(p[0]))).size !== ps.length) { tira("emparejar con lados repetidos"); continue; }
      const id = idDe(k, q + "|" + ps.map((p) => p[0]).join("|"));
      if (vistos.has(id)) { tira("repetida"); continue; }
      vistos.add(id);
      items.push({ id, k, q, ps, ...base });
    } else {
      if (!guia) { tira("abierta sin pauta"); continue; }
      const id = idDe(k, q);
      if (vistos.has(id)) { tira("repetida"); continue; }
      vistos.add(id);
      items.push({ id, k, q, guia, ...base });
    }
    if (items.length >= tope) break;
  }
  return { items, descartadas };
}

/* Un resumen legible de lo descartado, para el aviso: «3 por no citar el
   texto, 1 repetida». Agrupado por motivo, porque veinte renglones
   iguales no dicen más que uno con su cuenta. */
function resumeDescartes(d: Descartada[]): string {
  const cuenta = new Map<string, number>();
  d.forEach((x) => cuenta.set(x.motivo, (cuenta.get(x.motivo) ?? 0) + 1));
  return [...cuenta.entries()].map(([m, n]) => n + " · " + m).join("; ");
}

// ========== 2 de 2 - index.ts ==========

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
