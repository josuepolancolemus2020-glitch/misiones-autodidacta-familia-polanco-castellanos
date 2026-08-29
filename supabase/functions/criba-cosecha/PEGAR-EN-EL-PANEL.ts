// ╔══════════════════════════════════════════════════════════════╗
// ║  ⛔ ESTO NO ES SQL. NO LO PEGUES EN EL EDITOR SQL.            ║
// ║                                                              ║
// ║  Va en:  Supabase → Edge Functions → Deploy a new function   ║
// ║          Nómbrala exactamente:  criba-cosecha                ║
// ║          Y en sus ajustes: «Enforce JWT Verification» = OFF   ║
// ╚══════════════════════════════════════════════════════════════╝
//
// ⚠️ ARCHIVO GENERADO — NO SE EDITA A MANO.
//
// Lo cose `node _dev/arma-criba-cosecha.js` a partir de normaliza.ts e
// index.ts, que son los que se prueban:
//   node --experimental-strip-types _dev/prueba-criba-normaliza.mjs
//
// Existe solo para poder desplegar desde el panel sin la CLI —o sea,
// desde la tableta—. Si editas AQUÍ, el arreglo se pierde la próxima vez
// que se cosa, y peor: dejará de coincidir con lo que dicen las pruebas.
//
// Cosido el 2026-08-29.

// ══════════ 1 de 2 · normaliza.ts ══════════

// ════════════════════════════════════════════════════════════════════
// LA CRIBA 🪶 — CONVERTIR LO QUE DEVUELVE UNA FUENTE EN FILAS
// ════════════════════════════════════════════════════════════════════
// POR QUÉ ESTO VIVE EN SU PROPIO ARCHIVO Y NO DENTRO DE index.ts:
//   Lo que puede fallar de un recolector no es el enchufe con Supabase:
//   es cómo interpreta lo que le devuelven. Un `<description>` que se
//   lee del canal en vez del ítem, una entidad HTML sin deshacer, una
//   fecha que se cuela como texto. Aquí dentro no hay red ni base de
//   datos, así que se puede probar entero con
//   `node --experimental-strip-types _dev/prueba-criba-normaliza.mjs`,
//   sin Deno y sin Supabase. La Edge Function lo importa tal cual.
//
//   Es la misma lección de la sonda: sus cuatro fallos estaban todos en
//   la interpretación, y ninguno se vio hasta que hubo datos delante.
//
// POR QUÉ NO SE USA UN ANALIZADOR DE XML DE VERDAD:
//   Este repositorio no tiene compilación ni dependencias, y una Edge
//   Function que arrastre una librería es una que hay que mantener al
//   día desde una tableta. Para sacar los ítems de un RSS o un Atom, un
//   puñado de expresiones acotadas basta — y lo que sale de aquí no se
//   pinta con innerHTML NUNCA, así que un análisis imperfecto produce
//   texto feo, no un agujero.
// ════════════════════════════════════════════════════════════════════

type Formato = 'rss' | 'rss1' | 'atom' | 'oai-pmh' | 'json';

interface Fuente {
  id: string;
  formato: Formato;
  idioma: string;
  evidencia: string;
}

interface Item {
  fuente_id: string;
  clave: string;
  titulo: string;
  resumen: string;
  url: string;
  doi: string | null;
  idioma: string;
  evidencia: string;
  publicado: string | null;
}

/* ── El mismo check que la columna `url`, y a propósito ──
   La base no puede fiarse de la pantalla y la pantalla no puede fiarse
   de la base: aquí es el recolector quien no puede fiarse de la fuente.
   Si esto se relaja, la fila rebota en el `check` de PostgreSQL y se
   pierde el lote entero; si el `check` se relajara, esto la para. Las
   dos mitades tienen que decir lo mismo. */
function urlBuena(u: string): boolean {
  return typeof u === 'string'
    && /^https?:\/\//i.test(u)
    && u.length <= 2000
    && !/\s/.test(u)
    && !u.includes('"') && !u.includes("'")
    && !u.includes('<') && !u.includes('>') && !u.includes('\\');
}

/* ⚠️ LAS VOCALES ACENTUADAS NO SON UN EXTRA: SON EL CASO NORMAL.
   La primera versión de este archivo traía solo &amp; &lt; &gt; &quot; y
   tres más, y la prueba suspendió con un aviso REAL de la CNBS: «no
   est&aacute;n autorizadas» salía tal cual. En cuatro fuentes en
   español, un canal con las entidades sin deshacer es un canal
   ilegible — y es justo el idioma que se pidió. */
const ENTIDADES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  ntilde: 'ñ', Ntilde: 'Ñ', uuml: 'ü', Uuml: 'Ü',
  agrave: 'à', egrave: 'è', ccedil: 'ç',
  // Signos que en español van al principio y se pierden sin esto.
  iquest: '¿', iexcl: '¡', ordm: 'º', ordf: 'ª', deg: '°',
  // Las comillas latinas, que esta casa usa en todo lo que escribe.
  laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  hellip: '…', mdash: '—', ndash: '–', middot: '·', bull: '•',
  euro: '€', pound: '£', copy: '©', reg: '®', trade: '™', times: '×',
};

/* Deja texto plano y solo texto. Todo lo que sale de aquí se pinta con
   textContent, nunca con innerHTML: esto es para que se LEA bien, no
   para que sea seguro — lo seguro es no armar HTML con datos. */
function limpia(s: string | null | undefined, tope = 4000): string {
  if (!s) return '';
  let t = String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ');
  // Por nombre, y respetando mayúsculas: &Aacute; y &aacute; no son lo mismo.
  t = t.replace(/&([A-Za-z][A-Za-z0-9]{1,10});/g, (m, n) => ENTIDADES[n] ?? ENTIDADES[n.toLowerCase()] ?? m);
  // Y por número, en decimal y en hexadecimal: hay canales que solo usan esa forma.
  t = t.replace(/&#(\d{1,7});/g, (_, n) => cp(Number(n)));
  t = t.replace(/&#x([0-9a-f]{1,6});/gi, (_, n) => cp(parseInt(n, 16)));
  return t.replace(/\s+/g, ' ').trim().slice(0, tope);
}

/* Un número que no sea un carácter válido se deja como estaba, en vez de
   reventar la cosecha entera de esa fuente por un ítem mal formado. */
function cp(n: number): string {
  try { return (n > 0 && n <= 0x10ffff) ? String.fromCodePoint(n) : ''; } catch { return ''; }
}

/* Saca el contenido de la primera etiqueta con ese nombre DENTRO de un
   trozo. Recibe el trozo del ítem ya aislado, nunca el documento: es el
   fallo que la sonda tuvo el 29 de agosto de 2026, cuando medía la
   descripción del canal creyendo que era la del ítem. */
function et(trozo: string, nombre: string): string {
  const m = trozo.match(new RegExp(`<${nombre}(?:\\s[^>]*)?>([\\s\\S]*?)</${nombre}>`, 'i'));
  return m ? m[1] : '';
}

function atributo(trozo: string, etiqueta: string, attr: string): string {
  const m = trozo.match(new RegExp(`<${etiqueta}\\b[^>]*\\b${attr}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return m ? m[1] : '';
}

/* Trocea el documento en ítems. Cada formato marca los suyos distinto. */
function troceaItems(cuerpo: string, formato: Formato): string[] {
  const etiqueta = formato === 'atom' ? 'entry' : formato === 'oai-pmh' ? 'record' : 'item';
  return cuerpo.match(new RegExp(`<${etiqueta}(?:\\s[^>]*)?>[\\s\\S]*?</${etiqueta}>`, 'gi')) ?? [];
}

/* ── El DOI ──
   Se normaliza a minúsculas y sin el prefijo del enlace, porque el
   mismo DOI llega escrito de cuatro formas distintas y es la llave con
   la que se cruzan los gemelos y, más adelante, las retractaciones.
   ⚠️ Se deshacen las barras escapadas antes de buscar: en JSON viajan
   como `10.5860\/choice`, y sin esto Crossref -que es una base de DOI-
   parece no traer ninguno. */
function sacaDoi(texto: string): string | null {
  const m = texto.replace(/\\\//g, '/').match(/10\.\d{4,9}\/[^\s"'<>&]{1,180}/);
  if (!m) return null;
  const doi = m[0].toLowerCase().replace(/[.,;)\]]+$/, '');
  return /^10\.\d{4,9}\/.{1,180}$/.test(doi) ? doi : null;
}

/* ── La llave contra gemelos ──
   Por orden: el DOI, que identifica el trabajo pase por donde pase; si
   no hay, la dirección; y si tampoco, el título. Nunca el número de
   fila de la fuente: cambia cuando la fuente reordena y entonces todo
   entra otra vez como nuevo. */
function claveDe(doi: string | null, url: string, titulo: string, fuenteId: string): string {
  if (doi) return 'doi:' + doi;
  if (urlBuena(url)) return 'url:' + url.slice(0, 380);
  return 't:' + fuenteId + ':' + titulo.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 300);
}

function fechaDe(trozo: string): string | null {
  for (const n of ['updated', 'published', 'pubDate', 'dc:date', 'prism:publicationDate', 'date']) {
    const v = limpia(et(trozo, n), 60);
    if (!v) continue;
    const d = new Date(v);
    if (!isNaN(d.getTime()) && d.getFullYear() > 1990 && d.getFullYear() < 2100) return d.toISOString();
  }
  return null;
}

/* ── El nivel de evidencia ──
   Regla 1 de la puerta. Si el ítem trae señales propias de lo que es,
   mandan sobre lo que diga la fuente. ⚠️ Y SOLO SE BAJA, NUNCA SE SUBE:
   un preprint que se colara etiquetado como revisado por pares rompe en
   silencio lo único que La Criba viene a hacer. Ante la duda, lo más
   bajo. */
const ESCALA = ['revision', 'revisado', 'preprint', 'trabajo', 'prensa', 'comentario'];

function evidenciaDe(texto: string, porOmision: string): string {
  const t = texto.toLowerCase();
  let nivel = ESCALA.indexOf(porOmision);
  if (nivel < 0) nivel = ESCALA.length - 1;

  const baja = (e: string) => { const i = ESCALA.indexOf(e); if (i > nivel) nivel = i; };

  if (/\bpreprint\b|\bpreprints\b|biorxiv|medrxiv|arxiv|psyarxiv/.test(t)) baja('preprint');
  if (/working paper|documento de trabajo|discussion paper/.test(t))       baja('trabajo');
  if (/nota de prensa|press release|comunicado/.test(t))                   baja('prensa');
  // Subir solo con una señal inequívoca, y solo desde más abajo.
  if (/cochrane|systematic review|revisi[óo]n sistem[áa]tica|meta-?an[áa]lisis|meta-?analysis/.test(t)
      && nivel > ESCALA.indexOf('revision')) {
    nivel = ESCALA.indexOf('revision');
  }
  return ESCALA[nivel];
}

/* ── Un canal de XML (RSS, RSS1, Atom, OAI-PMH) ── */
function deXml(cuerpo: string, f: Fuente): Item[] {
  const salida: Item[] = [];
  for (const trozo of troceaItems(cuerpo, f.formato)) {
    const titulo = limpia(et(trozo, f.formato === 'oai-pmh' ? 'dc:title' : 'title'), 500);
    if (!titulo) continue;

    let url = '';
    if (f.formato === 'atom') {
      url = atributo(trozo, 'link', 'href');
    } else if (f.formato === 'oai-pmh') {
      url = limpia(et(trozo, 'dc:identifier'), 2000);
      if (!urlBuena(url)) {
        // dc:identifier puede repetirse; se busca el que sea una dirección.
        for (const m of trozo.matchAll(/<dc:identifier[^>]*>([\s\S]*?)<\/dc:identifier>/gi)) {
          const c = limpia(m[1], 2000);
          if (urlBuena(c)) { url = c; break; }
        }
      }
    } else {
      url = limpia(et(trozo, 'link'), 2000) || atributo(trozo, 'link', 'href') || limpia(et(trozo, 'guid'), 2000);
    }
    if (!urlBuena(url)) continue;   // sin dirección buena no entra: se abriría en F.A.R.O

    const resumen = limpia(
      et(trozo, f.formato === 'atom' ? 'summary' : f.formato === 'oai-pmh' ? 'dc:description' : 'description')
      || et(trozo, f.formato === 'atom' ? 'content' : 'content:encoded'), 4000);

    const doi = sacaDoi(trozo);
    salida.push({
      fuente_id: f.id, clave: claveDe(doi, url, titulo, f.id),
      titulo, resumen, url, doi,
      idioma: f.idioma,
      evidencia: evidenciaDe(titulo + ' ' + resumen, f.evidencia),
      publicado: fechaDe(trozo),
    });
  }
  return salida;
}

/* ── Una API que devuelve JSON ──
   Se aceptan las formas que devuelven las que la sonda comprobó, sin
   inventar un mapeo por fuente: si mañana entra una con otra forma, se
   añade aquí y se prueba, no se adivina en producción. */
function deJson(cuerpo: string, f: Fuente): Item[] {
  let j: any;
  try { j = JSON.parse(cuerpo); } catch { return []; }
  const lista: any[] =
    Array.isArray(j) ? j
    : Array.isArray(j.results) ? j.results
    : Array.isArray(j.items) ? j.items
    : Array.isArray(j.message?.items) ? j.message.items
    : Array.isArray(j.resultList?.result) ? j.resultList.result
    : Array.isArray(j.data) ? j.data
    : [];

  const salida: Item[] = [];
  for (const o of lista) {
    const titulo = limpia(o.title ?? o.display_name ?? o.name ??
                          (Array.isArray(o.title) ? o.title[0] : ''), 500);
    if (!titulo) continue;
    // El DOI resuelto sirve de dirección: OpenAlex trae `id` y `doi`, pero
    // no siempre un `url`, y un doi.org es un enlace perfectamente bueno.
    const url = limpia(o.url ?? o.doi_url ?? o.link ?? o.URL ?? o.id ?? o.doi ?? '', 2000);
    if (!urlBuena(url)) continue;

    const doi = sacaDoi(String(o.doi ?? o.DOI ?? url ?? ''));
    const resumen = limpia(o.abstract ?? o.abstractText ?? o.summary ?? o.description ?? o.tldr?.text ?? '', 4000);
    const fechaCruda = o.publication_date ?? o.published ?? o.firstPublicationDate ?? o.date ?? null;
    const d = fechaCruda ? new Date(String(fechaCruda)) : null;

    salida.push({
      fuente_id: f.id, clave: claveDe(doi, url, titulo, f.id),
      titulo, resumen, url, doi,
      idioma: limpia(o.language ?? o.lang ?? f.idioma, 8) || f.idioma,
      evidencia: evidenciaDe(titulo + ' ' + resumen, f.evidencia),
      publicado: d && !isNaN(d.getTime()) ? d.toISOString() : null,
    });
  }
  return salida;
}

/* ── La puerta de este módulo ──
   Devuelve filas listas para la tabla, ya sin gemelos DENTRO del mismo
   lote (los gemelos entre fuentes los para el `unique` de la columna
   `clave`, que es donde tiene que estar). */
function normaliza(cuerpo: string, f: Fuente): Item[] {
  const brutos = f.formato === 'json' ? deJson(cuerpo, f) : deXml(cuerpo, f);
  const vistas = new Set<string>();
  return brutos.filter((i) => (vistas.has(i.clave) ? false : (vistas.add(i.clave), true)));
}

// ══════════ 2 de 2 · index.ts ══════════

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
  const { data: puestos } = await svc.rpc("criba_arma_edicion", { dia: null, tope: TOPE_EDICION });
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
