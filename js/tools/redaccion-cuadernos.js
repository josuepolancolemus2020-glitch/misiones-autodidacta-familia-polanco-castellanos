/* ══════════════════════════════════════════════════════════════════
   REDACCIÓN · 📓 CUADERNOS · el inventario de los cuadernos de
   NotebookLM (js/tools/redaccion-cuadernos.js)
   ──────────────────────────────────────────────────────────────────
   Pedido por el autor el 21 de septiembre de 2026: «llevar un
   inventario de direcciones url de los cuadernos que trabajo en
   Notebook … organizar muy bien todo ya que allí estudio asiduamente y
   tomo muchas referencias del contenido que genero en esa aplicación».

   QUÉ ES: UN CATÁLOGO, NO UNA COPIA. NotebookLM no tiene carpetas ni
   etiquetas y no deja exportar la lista: con treinta cuadernos, dar con
   el de un tema es barrer una cuadrícula de tarjetas iguales. Aquí cada
   cuaderno es una FICHA: su dirección, su nombre (con el emoji con que
   NotebookLM lo pinta), en qué estantes está, de qué serie es y con qué
   número, en qué va, cuántas fuentes tiene, unas líneas de notas y la
   lista de lo que se sacó de él —las referencias, con dónde se usaron—.
   El contenido sigue viviendo en el cuaderno; la ficha dice dónde está
   y qué hay.

   CÓMO SE MIRA: como Play Libros y como el anaquel de La Voz Prestada
   (sus reglas 33 y 40): una sola fila de botones, los filtros puestos
   con su equis, una hoja vertical para elegir estante, y la lista
   agrupada por estante y PLEGADA —se abre el estante que se quiere
   mirar—. El orden por defecto es la ÚLTIMA CONSULTA, que se apunta
   sola al abrir el cuaderno desde aquí: lo que se consulta a diario
   sube solo, sin ordenar nada a mano.

   DÓNDE VIVE: en el aparato al instante y en la tabla
   redaccion_cuadernos cuando la nube contesta; sin la tabla (42P01)
   funciona entera y lo dice («📴 Solo en este aparato»). Es de la casa,
   como el resto de Redacción.

   ⚠️ NADA DE LO ESCRITO LLEGA A UN ATRIBUTO NI A innerHTML: todo con
   createElement y textContent. Lo único que va a un atributo es la
   dirección, comprobada con URL() y puesta con setAttribute, y el
   enlace se abre con rel="noopener noreferrer": la pestaña que se abre
   no puede tocar la ventana de F.A.R.O, que tiene dentro la Bóveda, las
   finanzas y el chat.
   ══════════════════════════════════════════════════════════════════ */

const RCU_TABLA       = 'redaccion_cuadernos';
const RCU_LOCAL_KEY   = 'faro_redaccion_cuadernos_v1';
/* Cómo se mira el inventario —orden, agrupación y qué estantes están
   abiertos— es una postura de ESTE aparato, como la vista del anaquel de
   La Voz Prestada: no viaja a la nube. */
const RCU_ANAQUEL_KEY = 'faro_redaccion_cuadernos_anaquel_v1';
const RCU_ESPERA_MAX  = 8000;                 // ms: la petición que no vuelve, no vuelve

/* Los dos dominios con que Google ha servido NotebookLM. Se aceptan los
   dos porque en la tableta del autor la barra dice uno y en los enlaces
   viejos sale el otro; el identificador del cuaderno es el mismo. */
const RCU_HOSTS = ['notebooklm.google.com', 'notebook.google.com'];

/* Los estados viven en el aparato, no en la base (la columna solo mira
   el largo): añadir uno es una línea aquí. */
const RCU_ESTADOS = [
  { id: 'activo',    ic: '🟢', t: 'En marcha' },
  { id: 'pausado',   ic: '⏸️', t: 'En pausa' },
  { id: 'terminado', ic: '✅', t: 'Terminado' },
];
const RCU_ORDENES = [
  { id: 'consulta', t: '🕘 Última consulta', d: 'Lo que se abrió hace menos, primero' },
  { id: 'titulo',   t: '🔤 Título',          d: 'De la A a la Z' },
  { id: 'creado',   t: '🆕 Más nuevos',      d: 'Los últimos que entraron, primero' },
  { id: 'serie',    t: '🔢 Serie y número',  d: 'Los de una serie, en su orden' },
];
const RCU_AGRUPAR = [
  { id: 'estante', t: '🗂 Por estante', d: 'Un cuaderno en dos estantes sale en los dos' },
  { id: 'serie',   t: '🔢 Por serie',   d: 'Los numerados, en su orden' },
  { id: 'estado',  t: '🟢 Por estado',  d: 'En marcha, en pausa, terminados' },
  { id: 'ninguno', t: '☰ Sin agrupar',  d: 'Una sola lista' },
];

let _rcuLista       = [];          // todos, incluidos los retirados (lápida)
let _rcuNube        = 'mirando';   // mirando | puesta | sin-tabla | sin-senal | sin-sesion
let _rcuHayTabla    = false;
let _rcuCargada     = false;
let _rcuInitEnCurso = null;
let _rcuBusca       = '';
let _rcuFiltro      = null;        // { eje: 'estante'|'serie'|'estado', clave, rotulo }
let _rcuAnaquel     = null;        // { orden, agrupar, abiertos }
let _rcuHojaId      = null;        // cuaderno abierto en la hoja (null = uno nuevo)
let _rcuBorrador    = null;        // lo que la hoja va editando
let _rcuRetirando   = false;       // el «¿Sí, retirar?» de la hoja está abierto
let _rcuDeCompartir = false;       // la hoja vino de «Compartir a F.A.R.O»
let _rcuPegado      = null;        // lo leído en la hoja de pegar varios

/* ── Pequeños ayudantes ────────────────────────────────────────────── */

function rcuSb() { return (typeof _sb !== 'undefined' && _sb) ? _sb : (window.faroSb || null); }
function rcuMiembro() { return (typeof redMiembro === 'function') ? redMiembro() : 'josue'; }
function rcuAviso(msg) { if (typeof toast === 'function') toast(msg); }

/* Construir DOM sin innerHTML: nada del texto llega a un atributo. */
function rcuEl(tag, cls, texto) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (texto !== undefined && texto !== null) e.textContent = texto;
  return e;
}
function rcuBtn(cls, texto, onClick) {
  const b = rcuEl('button', cls, texto);
  b.type = 'button';
  if (onClick) b.addEventListener('click', onClick);
  return b;
}
function rcuSinTildes(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
}
/* «Maestría», «maestria» y « MAESTRÍA » son el MISMO estante: si no, el
   inventario saldría con tres montones iguales (La Voz Prestada, 32). */
function rcuClave(s) {
  return rcuSinTildes(s).toLowerCase().trim().replace(/\s+/g, ' ');
}
function rcuNuevoId() {
  return 'rc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}
function rcuHoy() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function rcuConReloj(peticion, ms) {
  return Promise.race([
    peticion,
    new Promise(res => setTimeout(() => res({
      data: null, error: { code: 'FARO_RELOJ', message: 'la petición no volvió' },
    }), ms || RCU_ESPERA_MAX)),
  ]);
}

/* «hace 3 días»: lo que dice de un vistazo cuándo se abrió por última vez. */
function rcuHace(ms) {
  if (!ms) return '';
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return 'hace un momento';
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return 'ayer';
  if (d < 14) return `hace ${d} días`;
  const sem = Math.round(d / 7);
  if (sem < 9) return `hace ${sem} semanas`;
  const mes = Math.round(d / 30);
  return `hace ${mes} mes${mes === 1 ? '' : 'es'}`;
}
function rcuFechaCorta(ms) {
  if (!ms) return '';
  const d = new Date(ms);
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

/* ── Guardado en el aparato ────────────────────────────────────────── */

function rcuLeeLocal() {
  try {
    const d = JSON.parse(localStorage.getItem(RCU_LOCAL_KEY)) || {};
    return Array.isArray(d.cuadernos) ? d.cuadernos : [];
  } catch (e) { return []; }
}
function rcuGuardaLocal() {
  try { localStorage.setItem(RCU_LOCAL_KEY, JSON.stringify({ cuadernos: _rcuLista })); } catch (e) {}
}
function rcuAnaquel() {
  if (_rcuAnaquel) return _rcuAnaquel;
  let d = {};
  try { d = JSON.parse(localStorage.getItem(RCU_ANAQUEL_KEY)) || {}; } catch (e) {}
  _rcuAnaquel = {
    orden:   RCU_ORDENES.some(o => o.id === d.orden) ? d.orden : 'consulta',
    agrupar: RCU_AGRUPAR.some(a => a.id === d.agrupar) ? d.agrupar : 'estante',
    abiertos: (d.abiertos && typeof d.abiertos === 'object') ? d.abiertos : {},
  };
  return _rcuAnaquel;
}
function rcuGuardaAnaquel() {
  try { localStorage.setItem(RCU_ANAQUEL_KEY, JSON.stringify(rcuAnaquel())); } catch (e) {}
}

/* ── La fila de la base y la ficha del aparato ─────────────────────── */

const RCU_COLUMNAS = 'id,titulo,url,cuaderno,emoji,estantes,serie,serie_n,estado,fuentes,notas,referencias,ultima,autor,eliminado,eliminado_at,actualizado';

function rcuDesdeFila(f) {
  return {
    id: f.id, titulo: f.titulo || '', url: f.url || '', cuaderno: f.cuaderno || '',
    emoji: f.emoji || '',
    estantes: Array.isArray(f.estantes) ? f.estantes.filter(x => typeof x === 'string') : [],
    serie: f.serie || '', serie_n: Number(f.serie_n) || 0,
    estado: f.estado || 'activo', fuentes: Number(f.fuentes) || 0,
    notas: f.notas || '',
    referencias: Array.isArray(f.referencias) ? f.referencias.filter(r => r && typeof r === 'object') : [],
    ultima: Number(f.ultima) || 0, autor: f.autor || '',
    eliminado: !!f.eliminado, eliminado_at: f.eliminado_at || null,
    actualizado: Number(f.actualizado) || 0,
    subida: true,
  };
}
function rcuAFila(c) {
  return {
    id: c.id, titulo: (c.titulo || '').slice(0, 200), url: c.url, cuaderno: c.cuaderno || '',
    emoji: (c.emoji || '').slice(0, 16),
    estantes: c.estantes || [], serie: (c.serie || '').slice(0, 80), serie_n: Number(c.serie_n) || 0,
    estado: c.estado || 'activo', fuentes: Number(c.fuentes) || 0,
    notas: (c.notas || '').slice(0, 8000),
    referencias: (c.referencias || []).map(r => ({ id: r.id, t: String(r.t || '').slice(0, 2000), en: String(r.en || '').slice(0, 200), f: r.f || '' })),
    ultima: c.ultima || 0, autor: c.autor || rcuMiembro(),
    eliminado: !!c.eliminado, eliminado_at: c.eliminado_at || null,
    actualizado: c.actualizado || Date.now(),
    actualizado_at: new Date().toISOString(),
  };
}

/* Gana la versión más reciente por el reloj del APARATO que escribió
   (`actualizado`), como en la repisa, en las redes y en La Voz Prestada. */
function rcuFusiona(local, nube) {
  const m = new Map();
  (local || []).forEach(c => { if (c && c.id) m.set(c.id, c); });
  (nube || []).forEach(f => {
    if (!f || !f.id) return;
    const mia = m.get(f.id);
    if (!mia || (Number(f.actualizado) || 0) >= (mia.actualizado || 0)) m.set(f.id, rcuDesdeFila(f));
  });
  return [...m.values()];
}

/* ── La nube ───────────────────────────────────────────────────────── */

async function rcuBajar() {
  const sb = rcuSb();
  if (!sb) { _rcuNube = 'sin-sesion'; return null; }
  const { data, error } = await rcuConReloj(sb.from(RCU_TABLA)
    .select(RCU_COLUMNAS).order('actualizado', { ascending: false }).limit(1000));
  if (error) {
    /* Un corte de red NO es una tabla que falta: 42P01 es «la relación
       no existe» y lo demás es la señal (El Rodaje, regla 14). */
    if (error.code === '42P01' || /relation .* does not exist/i.test(error.message || '')) {
      _rcuHayTabla = false; _rcuNube = 'sin-tabla';
    } else {
      _rcuNube = 'sin-senal';
    }
    return null;
  }
  _rcuHayTabla = true; _rcuNube = 'puesta';
  return data || [];
}

function rcuMotivoDe(error) {
  if (error.code === 'FARO_RELOJ') return 'sin-senal';
  if (error.code === '42501' || /row-level security/i.test(error.message || '')) return 'sin-permiso';
  return 'error';
}

async function rcuSubir(c) {
  const sb = rcuSb();
  if (!sb || !_rcuHayTabla) return { ok: false, motivo: _rcuNube === 'sin-tabla' ? 'sin-tabla' : 'sin-nube' };
  const { error } = await rcuConReloj(sb.from(RCU_TABLA).upsert(rcuAFila(c), { onConflict: 'id' }));
  if (error) return { ok: false, motivo: rcuMotivoDe(error), detalle: error.message || '' };
  c.subida = true;
  return { ok: true };
}

/* Varios de golpe en UN viaje: con la señal de una tableta, una
   escritura por cuaderno es lo que hace que pegar la lista tarde. */
async function rcuSubirVarios(lista) {
  const sb = rcuSb();
  if (!lista.length) return { ok: true };
  if (!sb || !_rcuHayTabla) return { ok: false, motivo: _rcuNube === 'sin-tabla' ? 'sin-tabla' : 'sin-nube' };
  const { error } = await rcuConReloj(sb.from(RCU_TABLA).upsert(lista.map(rcuAFila), { onConflict: 'id' }));
  if (error) return { ok: false, motivo: rcuMotivoDe(error), detalle: error.message || '' };
  lista.forEach(c => { c.subida = true; });
  return { ok: true };
}

/* Lo que no subió se reintenta de verdad, al abrir y al volver la señal. */
async function rcuSubirPendientes(nube) {
  if (!_rcuHayTabla) return 0;
  const enNube = new Map((nube || []).map(f => [f.id, Number(f.actualizado) || 0]));
  const pendientes = _rcuLista.filter(c =>
    c && c.id && (!enNube.has(c.id) || enNube.get(c.id) < (c.actualizado || 0)));
  if (!pendientes.length) return 0;
  const r = await rcuSubirVarios(pendientes);
  if (r.ok) rcuGuardaLocal();
  return r.ok ? pendientes.length : 0;
}

async function rcuPersistir(c) {
  rcuGuardaLocal();
  const r = await rcuSubir(c);
  if (r.ok) rcuGuardaLocal();
  return r;
}

/* Arranque: lo del aparato al instante; la nube, cuando llegue. */
async function rcuInit() {
  if (_rcuInitEnCurso) return _rcuInitEnCurso;
  _rcuInitEnCurso = rcuInitDeVerdad().finally(() => { _rcuInitEnCurso = null; });
  return _rcuInitEnCurso;
}
async function rcuInitDeVerdad() {
  if (!_rcuCargada) { _rcuLista = rcuLeeLocal(); _rcuCargada = true; }
  const nube = await rcuBajar();
  if (nube) {
    _rcuLista = rcuFusiona(_rcuLista, nube);
    await rcuSubirPendientes(nube);
    rcuGuardaLocal();
  }
  if (typeof _redEdicion !== 'undefined' && _redEdicion === 'cuadernos') {
    const list = document.getElementById('red-list');
    if (list) rcuRender(list);
    if (typeof redRenderCabecera === 'function') redRenderCabecera();
  }
  if (typeof redRenderChips === 'function') redRenderChips();
  return _rcuLista;
}

function rcuRotuloNube() {
  if (_rcuNube === 'puesta')     return { ic: '☁️', t: 'El inventario viaja a todos los aparatos de la casa', ok: true };
  if (_rcuNube === 'sin-tabla')  return { ic: '📴', t: 'Solo en este aparato: falta correr redaccion_cuadernos.sql', ok: false };
  if (_rcuNube === 'sin-senal')  return { ic: '📡', t: 'Sin señal: se guarda aquí y sube cuando vuelva', ok: false };
  if (_rcuNube === 'sin-sesion') return { ic: '📴', t: 'Solo en este aparato: entra en F.A.R.O para que viaje', ok: false };
  return { ic: '⏳', t: 'Mirando la nube…', ok: false };
}

/* ── Los cuadernos ─────────────────────────────────────────────────── */

function rcuVivos() { return _rcuLista.filter(c => !c.eliminado); }
function rcuRetirados() { return _rcuLista.filter(c => c.eliminado); }
function rcuDe(id) { return _rcuLista.find(c => c.id === id) || null; }

/* La dirección, entendida. Devuelve {ok, url, cuaderno, esCuaderno,
   puesto, motivo}. El IDENTIFICADOR del cuaderno es lo que manda para
   no guardar dos veces el mismo: la misma dirección se pega con
   «?authuser=1» un día y sin él otro, y las dos abren el mismo cuaderno.
   La dirección se guarda tal cual vino (con su authuser, que en un
   aparato con dos cuentas de Google es lo que abre la cuenta buena). */
function rcuMiraUrl(u) {
  const t = String(u || '').trim();
  if (!t) return { ok: false, motivo: '' };
  let url;
  try { url = new URL(t); } catch (e) {
    /* Pegar «notebooklm.google.com/notebook/…» sin el https es lo más
       normal desde un teclado de tableta: se entiende y se dice. */
    if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(t)) {
      try { return Object.assign(rcuMiraUrl('https://' + t), { puesto: 'https://' }); } catch (e2) {}
    }
    return { ok: false, motivo: 'Eso no parece una dirección. Tiene que empezar por https:// y llevar un punto.' };
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, motivo: 'Aquí solo entran direcciones https: la del cuaderno, tal como sale en la barra del navegador.' };
  }
  const host = url.hostname.toLowerCase();
  const esHost = RCU_HOSTS.includes(host);
  // Sin largo mínimo: en ese dominio, /notebook/<lo que sea> es un cuaderno.
  const m = esHost ? url.pathname.match(/^\/notebook\/([A-Za-z0-9_-]{1,80})/) : null;
  if (m) return { ok: true, url: url.href, cuaderno: m[1], esCuaderno: true };
  return { ok: true, url: url.href, cuaderno: '', esCuaderno: false };
}

/* Lo que la hoja dice debajo del campo, en voz alta: adivinar acierta la
   mitad de las veces; enseñar acierta siempre. */
function rcuNotaDeUrl(u) {
  const r = rcuMiraUrl(u);
  if (!String(u || '').trim()) return { t: '', mal: false };
  if (!r.ok) return { t: r.motivo, mal: true };
  if (r.esCuaderno) return { t: `${r.puesto ? 'Se entiende con https:// delante. ' : ''}Cuaderno de NotebookLM · ${r.cuaderno.slice(0, 8)}…`, mal: false };
  return { t: `${r.puesto ? 'Se entiende con https:// delante. ' : ''}No parece un cuaderno de NotebookLM: se guarda como un enlace más.`, mal: false };
}

/* El emoji con que NotebookLM pinta cada cuaderno suele venir pegado al
   nombre al copiarlo («🧠 La IA como Espejo…»): se separa. */
const RCU_EMOJI_DELANTE = /^((?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*)\s*/u;
function rcuEmojiDe(titulo) {
  const t = String(titulo || '').trim();
  const m = t.match(RCU_EMOJI_DELANTE);
  if (!m) return { emoji: '', titulo: t };
  return { emoji: m[1], titulo: t.slice(m[0].length).trim() };
}
/* Un emoji escrito a mano: solo el primer grafema, para que «🧠🧠» no
   entre y para que no quepa nada que no sea un símbolo. */
function rcuUnEmoji(s) {
  const t = String(s || '').trim();
  if (!t) return '';
  let primero = t;
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    for (const { segment } of seg.segment(t)) { primero = segment; break; }
  } else primero = [...t][0] || '';
  return primero.slice(0, 16);
}

/* «1_Filosofía de la Disociación», «1.2_El Deseo y el Obstáculo»,
   «3. Anatomía…»: el número de serie con que el autor numera sus
   cuadernos en NotebookLM. Se propone como número; el título se deja
   COMO VINO, para que se reconozca igual que allá. Un año («2026 fue…»)
   no lleva separador detrás y no entra. */
function rcuSerieNDe(titulo) {
  const m = String(titulo || '').match(/^(\d{1,3}(?:\.\d{1,2})?)\s*[_\-–—.)]\s*(?=\S)/);
  return m ? Number(m[1]) : 0;
}

/* ── Pegar varios ──────────────────────────────────────────────────── */

const RCU_URL_EN_LINEA = /https?:\/\/[^\s<>"'\)\]]+/i;
const RCU_HOST_PELADO  = /(?:^|\s)((?:notebooklm|notebook)\.google\.com\/notebook\/[^\s<>"'\)\]]+)/i;

/* Lee una lista pegada. Entiende lo que se escribe de verdad:
     🧠 Título | https://…      Título — https://…      Título: https://…
     [Título](https://…)        https://… a solas       y un renglón de
   título seguido de un renglón con la dirección.
   ⚠️ Lo que no se entiende se NOMBRA con su número de renglón y se
   deja fuera; nunca se cuelga un enlace que no se sabe a dónde va
   (La Voz Prestada, 38). Y el mismo cuaderno dos veces —en la lista o
   ya en el inventario— se salta y se dice. */
function rcuLeerVarios(txt) {
  const lineas = String(txt || '').replace(/\r/g, '').split('\n');
  const res = { cuadernos: [], malos: [], repetidos: [] };
  const vistos = new Set(rcuVivos().map(c => c.cuaderno || c.url));
  let pendiente = null;   // un renglón de título esperando su dirección
  for (let i = 0; i < lineas.length; i++) {
    const n = i + 1;
    const cruda = lineas[i].trim();
    if (!cruda) { if (pendiente) res.malos.push(pendiente); pendiente = null; continue; }
    let tituloCrudo = '', dirCruda = '';
    const md = cruda.match(/^\s*\[([^\]]+)\]\((\S+)\)\s*$/);
    if (md) { tituloCrudo = md[1]; dirCruda = md[2]; }
    else {
      const mu = cruda.match(RCU_URL_EN_LINEA) || cruda.match(RCU_HOST_PELADO);
      if (mu) {
        dirCruda = (mu[1] || mu[0]).trim();
        tituloCrudo = (cruda.slice(0, mu.index) + ' ' + cruda.slice(mu.index + mu[0].length))
          .replace(/^[\s|\-–—:•·>*]+|[\s|\-–—:•·]+$/g, '').trim();
      } else if (/^[\w-]+:/.test(cruda) && !/^[\w-]+:\s/.test(cruda)) {
        /* «javascript:…», «duolingo://…»: intentaba ser una dirección */
        if (pendiente) res.malos.push(pendiente);
        res.malos.push({ n, linea: cruda.slice(0, 80), por: rcuMiraUrl(cruda).motivo || 'no es una dirección https' });
        pendiente = null;
        continue;
      } else {
        /* Un renglón sin dirección: puede ser el título del siguiente */
        if (pendiente) res.malos.push(pendiente);
        pendiente = { n, linea: cruda.slice(0, 80), por: 'no lleva ninguna dirección' };
        continue;
      }
    }
    const mira = rcuMiraUrl(dirCruda);
    if (!mira.ok) {
      if (pendiente) res.malos.push(pendiente);
      res.malos.push({ n, linea: cruda.slice(0, 80), por: mira.motivo || 'no es una dirección https' });
      pendiente = null;
      continue;
    }
    /* El renglón de arriba era el título de este… o un renglón suelto
       que se nombra, si este ya traía el suyo. */
    if (pendiente) {
      if (!tituloCrudo) tituloCrudo = pendiente.linea; else res.malos.push(pendiente);
      pendiente = null;
    }
    const llave = mira.cuaderno || mira.url;
    const em = rcuEmojiDe(tituloCrudo);
    const titulo = em.titulo || (mira.esCuaderno ? `Cuaderno ${mira.cuaderno.slice(0, 8)}` : mira.url.replace(/^https?:\/\//, '').slice(0, 60));
    if (vistos.has(llave)) { res.repetidos.push({ n, titulo }); continue; }
    vistos.add(llave);
    res.cuadernos.push({
      titulo, url: mira.url, cuaderno: mira.cuaderno, esCuaderno: mira.esCuaderno,
      emoji: em.emoji, serie_n: rcuSerieNDe(em.titulo), sinNombre: !em.titulo,
    });
  }
  if (pendiente) res.malos.push(pendiente);
  return res;
}

/* ── Estantes, series, búsqueda y orden ────────────────────────────── */

/* Los estantes salen de los cuadernos, nunca de una lista escrita: el
   rótulo es el de la primera vez que se escribió así. */
function rcuEstantesTodos(lista) {
  const m = new Map();
  (lista || rcuVivos()).forEach(c => (c.estantes || []).forEach(e => {
    const k = rcuClave(e);
    if (!k) return;
    if (!m.has(k)) m.set(k, { clave: k, rotulo: String(e).trim(), n: 0 });
    m.get(k).n++;
  }));
  return [...m.values()].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'es'));
}
function rcuSeriesTodas(lista) {
  const m = new Map();
  (lista || rcuVivos()).forEach(c => {
    const k = rcuClave(c.serie);
    if (!k) return;
    if (!m.has(k)) m.set(k, { clave: k, rotulo: String(c.serie).trim(), n: 0 });
    m.get(k).n++;
  });
  return [...m.values()].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'es'));
}
function rcuEstado(id) { return RCU_ESTADOS.find(e => e.id === id) || RCU_ESTADOS[0]; }

/* El buscador mira título, estantes, serie, notas, referencias y la
   dirección, sin tildes ni mayúsculas: quien busca «burocracia» en una
   tableta no escribe la tilde. */
function rcuTextoDe(c) {
  return rcuClave([c.titulo, (c.estantes || []).join(' '), c.serie, c.notas,
    (c.referencias || []).map(r => (r.t || '') + ' ' + (r.en || '')).join(' '), c.url].join(' '));
}
function rcuFiltrados() {
  let lista = rcuVivos();
  const q = rcuClave(_rcuBusca);
  if (q) lista = lista.filter(c => rcuTextoDe(c).indexOf(q) >= 0);
  const f = _rcuFiltro;
  if (f && f.eje === 'estante') lista = lista.filter(c => f.clave === 'sin' ? !(c.estantes || []).some(e => rcuClave(e)) : (c.estantes || []).some(e => rcuClave(e) === f.clave));
  if (f && f.eje === 'serie')   lista = lista.filter(c => f.clave === 'sin' ? !rcuClave(c.serie) : rcuClave(c.serie) === f.clave);
  if (f && f.eje === 'estado')  lista = lista.filter(c => (c.estado || 'activo') === f.clave);
  return lista;
}
function rcuOrdena(lista, orden) {
  const o = orden || rcuAnaquel().orden;
  const l = lista.slice();
  if (o === 'titulo') l.sort((a, b) => rcuClave(a.titulo).localeCompare(rcuClave(b.titulo), 'es'));
  else if (o === 'creado') l.sort((a, b) => rcuCreadoDe(b) - rcuCreadoDe(a));
  else if (o === 'serie') l.sort((a, b) => rcuClave(a.serie).localeCompare(rcuClave(b.serie), 'es') || (a.serie_n || 0) - (b.serie_n || 0) || rcuClave(a.titulo).localeCompare(rcuClave(b.titulo), 'es'));
  else l.sort((a, b) => (b.ultima || 0) - (a.ultima || 0) || (b.actualizado || 0) - (a.actualizado || 0));
  return l;
}
/* Cuándo entró: el identificador lleva el reloj del aparato en base 36. */
function rcuCreadoDe(c) {
  const m = String(c.id || '').match(/^rc-([0-9a-z]+)-/);
  return m ? parseInt(m[1], 36) || 0 : 0;
}

/* Los grupos que se pintan: [{eje, clave, rotulo, items}]. Un cuaderno
   en dos estantes sale en los dos; los que no están en ninguno van
   juntos y al final. */
function rcuGrupos(lista) {
  const ag = rcuAnaquel().agrupar;
  const f = _rcuFiltro;
  if (ag === 'ninguno' || (f && f.eje === ag)) return [{ eje: ag, clave: 'todo', rotulo: '', items: rcuOrdena(lista) }];
  const grupos = [];
  if (ag === 'estante') {
    rcuEstantesTodos(lista).forEach(e => grupos.push({ eje: 'estante', clave: e.clave, rotulo: e.rotulo,
      items: rcuOrdena(lista.filter(c => (c.estantes || []).some(x => rcuClave(x) === e.clave))) }));
    const sin = lista.filter(c => !(c.estantes || []).some(x => rcuClave(x)));
    if (sin.length) grupos.push({ eje: 'estante', clave: 'sin', rotulo: 'Sin estante', items: rcuOrdena(sin) });
  } else if (ag === 'serie') {
    rcuSeriesTodas(lista).forEach(s => grupos.push({ eje: 'serie', clave: s.clave, rotulo: s.rotulo,
      items: rcuOrdena(lista.filter(c => rcuClave(c.serie) === s.clave), 'serie') }));
    const sin = lista.filter(c => !rcuClave(c.serie));
    if (sin.length) grupos.push({ eje: 'serie', clave: 'sin', rotulo: 'Sin serie', items: rcuOrdena(sin) });
  } else if (ag === 'estado') {
    RCU_ESTADOS.forEach(e => {
      const del = lista.filter(c => (c.estado || 'activo') === e.id);
      if (del.length) grupos.push({ eje: 'estado', clave: e.id, rotulo: `${e.ic} ${e.t}`, items: rcuOrdena(del) });
    });
  }
  return grupos;
}

/* ── El chip y la cabecera de Redacción ────────────────────────────── */

function rcuChipHtml(activo) {
  if (!_rcuCargada) { _rcuLista = rcuLeeLocal(); _rcuCargada = true; }
  const n = rcuVivos().length;
  return `<button type="button" class="red-ed-chip rcu-chip ${activo ? 'red-ed-chip-active' : ''}" data-ed="cuadernos">
    📓 Cuadernos${n ? ` · ${n}` : ''}
  </button>`;
}

function rcuCabecera(tituloEl, metaEl) {
  const vivos = rcuVivos();
  tituloEl.textContent = '📓 Cuadernos';
  if (!vivos.length) { metaEl.textContent = 'El inventario de los cuadernos de NotebookLM: dónde está cada uno, en qué estante, y qué se sacó de él.'; return; }
  const est = rcuEstantesTodos(vivos).length;
  const marcha = vivos.filter(c => (c.estado || 'activo') === 'activo').length;
  const refs = vivos.reduce((a, c) => a + (c.referencias || []).length, 0);
  const partes = [`${vivos.length} cuaderno${vivos.length === 1 ? '' : 's'}`];
  if (est) partes.push(`${est} estante${est === 1 ? '' : 's'}`);
  if (marcha) partes.push(`${marcha} en marcha`);
  if (refs) partes.push(`${refs} referencia${refs === 1 ? '' : 's'}`);
  metaEl.textContent = partes.join(' · ');
}

/* ── La lista ──────────────────────────────────────────────────────── */

/* El TONO de un estante sale de su clave y es siempre el mismo: la franja
   del rótulo, el fondo del emoji, la cuenta y el chip van de ese color, y
   así un estante se reconoce antes de leerlo (es la seña de color de las
   materias de M.E.T.A.S). Ocho tonos claros, en el CSS; «Sin estante» y lo
   que no es un estante (una serie, un estado) van en gris. */
const RCU_TONOS = 8;
function rcuTono(clave) {
  const k = rcuClave(clave);
  if (!k || k === 'sin' || k === 'todo') return 'rcu-tono-x';
  let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return 'rcu-tono-' + (h % RCU_TONOS);
}

function rcuRender(list) {
  list.textContent = '';
  if (_rcuNube === 'mirando' && !_rcuInitEnCurso) rcuInit();

  /* La nube es una FRANJA arriba solo cuando hay algo que arreglar (falta
     el SQL, no hay sesión, no hay señal): ahí tiene que verse. Cuando va
     bien —o mientras mira— es un renglón discreto al pie: una franja
     encima de la lista en cada arranque es una noticia que ya se sabe, y
     cada franja de más empuja la primera ficha una pantalla más abajo,
     que es la carga que el autor pidió quitar el 22 de septiembre. */
  const nube = rcuRotuloNube();
  const grave = !nube.ok && _rcuNube !== 'mirando';
  const nubeEl = rcuEl('div', 'rcu-nube ' + (grave ? 'rcu-nube-no' : 'rcu-nube-ok'), `${nube.ic} ${nube.t}`);
  if (grave) list.appendChild(nubeEl);

  const vivos = rcuVivos();
  if (!vivos.length) {
    list.appendChild(rcuBarra(list, null));
    const vacio = rcuEl('div', 'rcu-vacio');
    vacio.appendChild(rcuEl('div', 'rcu-vacio-ic', '📓'));
    const p1 = rcuEl('p'); p1.appendChild(rcuEl('strong', null, 'Todavía no hay cuadernos en el inventario.'));
    vacio.appendChild(p1);
    vacio.appendChild(rcuEl('p', null, 'Cada cuaderno de NotebookLM entra como una ficha: su dirección, su nombre, en qué estantes lo pones, de qué serie es, en qué va, y la lista de lo que sacaste de él. Se agrupan por estante y se abre el que quieras mirar.'));
    vacio.appendChild(rcuEl('p', null, 'Toca «＋ Cuaderno» y pega la dirección que sale en la barra del navegador; o «📥 Pegar lista» con varios a la vez, un cuaderno por renglón. Y desde el teléfono: Compartir → F.A.R.O.'));
    list.appendChild(vacio);
    if (!grave) list.appendChild(nubeEl);
    rcuRenderRetirados(list);
    return;
  }

  const filtrados = rcuFiltrados();
  const grupos = rcuGrupos(filtrados);
  const conMando = grupos.length > 1;
  const buscando = !!rcuClave(_rcuBusca);
  list.appendChild(rcuBarra(list, { grupos, conMando, buscando }));

  /* La cuenta solo cuando hay un filtro o una búsqueda puestos: «3 de 9»
     dice algo. «9 cuadernos» ya lo dice la cabecera de arriba, y escrito
     tres veces era ruido. */
  if (filtrados.length !== vivos.length) {
    list.appendChild(rcuEl('div', 'rcu-nota-lista', `${filtrados.length} de ${vivos.length} cuaderno${vivos.length === 1 ? '' : 's'}`));
  }

  if (!filtrados.length) {
    list.appendChild(rcuEl('div', 'rcu-vacio', 'Ningún cuaderno con eso. Prueba con otra palabra o quita el filtro.'));
    if (!grave) list.appendChild(nubeEl);
    rcuRenderRetirados(list);
    return;
  }

  grupos.forEach(g => {
    const k = g.eje + ':' + g.clave;
    const sec = rcuEl('section', 'rcu-seccion ' + (g.eje === 'estante' ? rcuTono(g.clave) : 'rcu-tono-x'));
    const caja = rcuEl('div', 'rcu-grupo');
    /* ⚠️ NADA SE ABRE SOLO; buscando se abre todo y eso no se guarda;
       un solo grupo no lleva mando (La Voz Prestada, regla 40). */
    const abierto = !conMando || buscando || !!rcuAnaquel().abiertos[k];
    if (g.rotulo) {
      if (conMando) {
        const cab = rcuBtn('rcu-grupo-btn', '', () => {
          const ahora = caja.hidden;                 // true: se está abriendo
          caja.hidden = !ahora;
          cab.setAttribute('aria-expanded', ahora ? 'true' : 'false');
          galon.textContent = ahora ? '▾' : '▸';
          vista.hidden = ahora;
          if (!buscando) {
            if (ahora) rcuAnaquel().abiertos[k] = 1; else delete rcuAnaquel().abiertos[k];
            rcuGuardaAnaquel();
          }
        });
        const galon = rcuEl('span', 'rcu-galon', abierto ? '▾' : '▸');
        cab.appendChild(galon);
        cab.appendChild(rcuEl('span', 'rcu-grupo-t', g.rotulo));
        cab.appendChild(rcuEl('span', 'rcu-grupo-n', String(g.items.length)));
        /* Plegado, el rótulo enseña los emojis de lo que hay dentro: se
           sabe qué hay en el estante sin abrirlo, y se reconoce por el
           dibujo antes que por el nombre. Abierto se esconde, porque los
           emojis ya están en las fichas. */
        const vista = rcuEl('span', 'rcu-grupo-vista');
        vista.setAttribute('aria-hidden', 'true');
        g.items.slice(0, 5).forEach(c => vista.appendChild(rcuEl('span', 'rcu-grupo-vista-e', c.emoji || '📓')));
        if (g.items.length > 5) vista.appendChild(rcuEl('span', 'rcu-grupo-vista-mas', `+${g.items.length - 5}`));
        vista.hidden = abierto;
        cab.appendChild(vista);
        cab.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        sec.appendChild(cab);
      } else {
        const cab = rcuEl('div', 'rcu-grupo-rotulo');
        cab.appendChild(rcuEl('span', 'rcu-grupo-t', g.rotulo));
        cab.appendChild(rcuEl('span', 'rcu-grupo-n', String(g.items.length)));
        sec.appendChild(cab);
      }
    }
    caja.hidden = !abierto;
    g.items.forEach(c => caja.appendChild(rcuFicha(c, list, g)));
    sec.appendChild(caja);
    list.appendChild(sec);
  });

  if (!grave) list.appendChild(nubeEl);
  rcuRenderRetirados(list);
}

/* Una sola fila de botones que se desliza (regla 33 de La Voz Prestada:
   lo que se toca a diario va delante). Cada botón lleva su icono en una
   baldosa y su palabra, y el COLOR dice la función: crear va lleno, traer
   va teñido, mirar va neutro y sacar va ámbar. Debajo, el buscador con el
   único mando de la lista al lado, y los filtros PUESTOS con su equis (y
   nada más: lo demás vive en una hoja). */
function rcuBarra(list, ctx) {
  const caja = rcuEl('div', 'rcu-barra-caja');
  const barra = rcuEl('div', 'rcu-barra');
  const boton = (cls, ico, rotulo, alTocar) => {
    const b = rcuBtn('rcu-barra-btn ' + cls, '', alTocar);
    b.appendChild(rcuEl('span', 'rcu-barra-ico', ico));
    b.appendChild(rcuEl('span', 'rcu-barra-txt', rotulo));
    return b;
  };
  barra.appendChild(boton('rcu-barra-crear', '＋', 'Cuaderno', () => rcuAbrirHoja(null)));
  barra.appendChild(boton('rcu-barra-traer', '📥', 'Pegar lista', rcuPegarAbrir));
  barra.appendChild(rcuEl('span', 'rcu-barra-sep'));
  barra.appendChild(boton('rcu-barra-mirar', '🗂', 'Estantes', () => rcuVerAbrir('estantes')));
  barra.appendChild(boton('rcu-barra-mirar', '⇅', 'Orden', () => rcuVerAbrir('orden')));
  barra.appendChild(rcuEl('span', 'rcu-barra-sep'));
  barra.appendChild(boton('rcu-barra-sacar', '📋', 'Exportar', rcuExportar));
  caja.appendChild(barra);

  if (rcuVivos().length) {
    const fila = rcuEl('div', 'rcu-fila-busca');
    const busca = rcuEl('input', 'rcu-busca');
    busca.type = 'search';
    busca.setAttribute('placeholder', '🔍 Buscar un cuaderno…');
    busca.value = _rcuBusca;
    busca.id = 'rcu-busca';
    let t = null;
    busca.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        _rcuBusca = busca.value;
        const enFoco = document.activeElement === busca;
        const pos = busca.selectionStart;
        rcuRender(list);
        if (enFoco) {
          const b2 = document.getElementById('rcu-busca');
          if (b2) { b2.focus(); try { b2.setSelectionRange(pos, pos); } catch (e) {} }
        }
      }, 180);
    });
    fila.appendChild(busca);
    /* El único mando de la lista, al lado del buscador: hace falta porque
       lo abierto se recuerda a propósito, y quien abrió cinco estantes
       para buscar una cosa se queda con cinco abiertos (regla 40). */
    if (ctx && ctx.conMando && !ctx.buscando) {
      const ab = rcuAnaquel().abiertos;
      const algunoAbierto = ctx.grupos.some(g => ab[g.eje + ':' + g.clave]);
      fila.appendChild(rcuBtn('rcu-mini-btn', algunoAbierto ? '▴ Cerrar todos' : '▾ Abrir todos', () => {
        ctx.grupos.forEach(g => { const k = g.eje + ':' + g.clave; if (algunoAbierto) delete ab[k]; else ab[k] = 1; });
        rcuGuardaAnaquel();
        rcuRender(list);
      }));
    }
    caja.appendChild(fila);
  }

  const f = _rcuFiltro;
  if (f) {
    const puestos = rcuEl('div', 'rcu-puestos');
    const chip = rcuBtn('rcu-puesto', '', () => { _rcuFiltro = null; rcuRender(list); });
    chip.appendChild(rcuEl('span', null, (f.eje === 'estante' ? '🗂 ' : f.eje === 'serie' ? '🔢 ' : '') + f.rotulo));
    chip.appendChild(rcuEl('span', 'rcu-puesto-x', '✕'));
    chip.setAttribute('aria-label', 'Quitar el filtro ' + f.rotulo);
    puestos.appendChild(chip);
    caja.appendChild(puestos);
  }
  return caja;
}

/* La ficha: VERTICAL y compacta, para que en una cuadrícula no quede
   ningún hueco entre lo que dice y lo que se puede hacer (en la captura
   del autor había medio metro). Arriba, el emoji en su baldosa del tono
   del estante, el número de serie y el título; una sola línea de datos
   en texto corrido, sin cajitas —y el estado solo si NO está en marcha,
   que es lo normal y no hace falta decirlo—; los OTROS estantes en que
   está, porque el estante bajo el que se pinta no se repite dentro; las
   notas; y al pie los dos botones ROTULADOS, siempre en el mismo sitio:
   «↗ Abrir» (la consulta, en el color de la herramienta) y «📋 Copiar».
   Tocar el cuerpo abre la hoja, y el › del rincón lo dice. */
function rcuFicha(c, list, g) {
  const f = _rcuFiltro;
  const enEstante = (g && g.eje === 'estante' && g.clave !== 'sin' && g.clave !== 'todo') ? g.clave
                  : (f && f.eje === 'estante' && f.clave !== 'sin') ? f.clave : '';
  const tono = enEstante || (c.estantes || []).map(rcuClave).find(Boolean) || '';
  const ficha = rcuEl('article', 'rcu-ficha ' + rcuTono(tono));

  const main = rcuBtn('rcu-ficha-main', '', () => rcuAbrirHoja(c.id));
  main.setAttribute('aria-label', 'Ver la ficha de ' + (c.titulo || 'este cuaderno'));
  const cab = rcuEl('div', 'rcu-ficha-cab');
  cab.appendChild(rcuEl('span', 'rcu-ficha-emoji', c.emoji || '📓'));
  const tit = rcuEl('span', 'rcu-ficha-t');
  if (c.serie_n) tit.appendChild(rcuEl('span', 'rcu-serie-n', String(c.serie_n)));
  tit.appendChild(rcuEl('span', 'rcu-ficha-titulo', c.titulo || 'Sin título'));
  cab.appendChild(tit);
  cab.appendChild(rcuEl('span', 'rcu-ficha-flecha', '›'));
  main.appendChild(cab);

  const meta = rcuEl('div', 'rcu-ficha-meta');
  const est = rcuEstado(c.estado);
  if (est.id !== 'activo') meta.appendChild(rcuEl('span', 'rcu-est rcu-est-' + est.id, `${est.ic} ${est.t}`));
  if (c.fuentes) meta.appendChild(rcuEl('span', 'rcu-meta-item', `${c.fuentes} fuente${c.fuentes === 1 ? '' : 's'}`));
  const nref = (c.referencias || []).length;
  if (nref) meta.appendChild(rcuEl('span', 'rcu-meta-item rcu-meta-ref', `🔖 ${nref} referencia${nref === 1 ? '' : 's'}`));
  const hace = rcuEl('span', 'rcu-meta-item rcu-hace', c.ultima ? `abierto ${rcuHace(c.ultima)}` : 'sin abrir desde aquí');
  hace.dataset.id = c.id;      // para reescribirlo al abrir sin repintar la lista
  meta.appendChild(hace);
  main.appendChild(meta);

  const otros = (c.estantes || []).filter(e => rcuClave(e) && rcuClave(e) !== enEstante);
  if (otros.length || c.serie) {
    const ests = rcuEl('div', 'rcu-ficha-estantes');
    otros.forEach(e => ests.appendChild(rcuEl('span', 'rcu-est-mini ' + rcuTono(e), e)));
    if (c.serie) ests.appendChild(rcuEl('span', 'rcu-serie-mini', `🔢 ${c.serie}`));
    main.appendChild(ests);
  }
  if (c.notas) main.appendChild(rcuEl('div', 'rcu-ficha-notas', c.notas));
  ficha.appendChild(main);

  /* ↗ es un enlace de verdad (se puede mantener pulsado para abrir en
     otra pestaña), con noopener, y apunta la consulta al tocarlo. */
  const acc = rcuEl('div', 'rcu-ficha-acc');
  const a = rcuEnlace(c, '');
  a.className = 'rcu-abrir';
  a.setAttribute('aria-label', 'Abrir el cuaderno en NotebookLM');
  a.appendChild(rcuEl('span', 'rcu-acc-ico', '↗'));
  a.appendChild(rcuEl('span', null, 'Abrir'));
  acc.appendChild(a);
  const copiar = rcuBtn('rcu-ficha-btn', '', async () => {
    const ok = await rcuCopiar(c.url);
    rcuAviso(ok ? '📋 Dirección copiada' : 'No se pudo copiar');
  });
  copiar.setAttribute('aria-label', 'Copiar la dirección del cuaderno');
  copiar.appendChild(rcuEl('span', 'rcu-acc-ico', '📋'));
  copiar.appendChild(rcuEl('span', null, 'Copiar'));
  acc.appendChild(copiar);
  ficha.appendChild(acc);
  return ficha;
}

/* El enlace, siempre por el mismo sitio: URL() comprobada, setAttribute,
   nueva pestaña y noopener. Al tocarlo se apunta la consulta. */
function rcuEnlace(c, texto) {
  const a = rcuEl('a', null, texto);
  const mira = rcuMiraUrl(c.url);
  if (mira.ok) a.setAttribute('href', mira.url);
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  a.addEventListener('click', e => { e.stopPropagation(); rcuConsultado(c); });
  return a;
}

/* Abrir el cuaderno desde aquí es la consulta: se apunta y viaja, y es
   lo que hace que el orden por defecto sea el de verdad. */
function rcuConsultado(c) {
  c.ultima = Date.now();
  c.actualizado = Date.now();
  c.subida = false;
  rcuPersistir(c).then(() => {
    const list = document.getElementById('red-list');
    if (list && typeof _redEdicion !== 'undefined' && _redEdicion === 'cuadernos') {
      /* Solo se reescribe el «abierto hace…» de la ficha: repintar la
         lista debajo del dedo le arrancaría la ficha que iba a tocar. */
      list.querySelectorAll('.rcu-hace').forEach(el => {
        if (el.dataset.id === c.id) el.textContent = `abierto ${rcuHace(c.ultima)}`;
      });
    }
  });
}

async function rcuCopiar(texto) {
  try { await navigator.clipboard.writeText(texto); return true; } catch (e) { return false; }
}

function rcuRenderRetirados(list) {
  const ret = rcuRetirados();
  if (!ret.length) return;
  const caja = rcuEl('details', 'rcu-retirados');
  caja.appendChild(rcuEl('summary', null, `🗑️ ${ret.length} retirado${ret.length === 1 ? '' : 's'} · tocar para verlos`));
  ret.slice(0, 30).forEach(c => {
    const f = rcuEl('div', 'rcu-retirado');
    f.appendChild(rcuEl('span', 'rcu-retirado-t', `${c.emoji ? c.emoji + ' ' : ''}${c.titulo || c.url}`));
    f.appendChild(rcuBtn('rcu-mini-btn', '↩️ Devolver', async () => {
      c.eliminado = false; c.eliminado_at = null; c.actualizado = Date.now(); c.subida = false;
      await rcuPersistir(c);
      rcuRender(list);
      if (typeof redRenderCabecera === 'function') redRenderCabecera();
      if (typeof redRenderChips === 'function') redRenderChips();
      rcuAviso('↩️ Devuelto al inventario');
    }));
    caja.appendChild(f);
  });
  list.appendChild(caja);
}

function rcuRepintar() {
  const list = document.getElementById('red-list');
  if (list && typeof _redEdicion !== 'undefined' && _redEdicion === 'cuadernos') rcuRender(list);
  if (typeof redRenderCabecera === 'function') redRenderCabecera();
  if (typeof redRenderChips === 'function') redRenderChips();
}

/* ── La hoja del cuaderno ──────────────────────────────────────────── */

function rcuNuevo(pre) {
  return Object.assign({
    id: rcuNuevoId(), titulo: '', url: '', cuaderno: '', emoji: '', estantes: [],
    serie: '', serie_n: 0, estado: 'activo', fuentes: 0, notas: '', referencias: [],
    ultima: 0, autor: rcuMiembro(), eliminado: false, eliminado_at: null,
    actualizado: Date.now(), subida: false,
  }, pre || {});
}

function rcuAbrirHoja(id, pre) {
  const ov = document.getElementById('rcu-overlay');
  if (!ov) return;
  const c = id ? rcuDe(id) : null;
  _rcuHojaId = c ? c.id : null;
  /* Se edita una COPIA: cerrar sin guardar no cambia nada. */
  _rcuBorrador = c ? JSON.parse(JSON.stringify(c)) : rcuNuevo(pre);
  _rcuBorrador.referencias = (_rcuBorrador.referencias || []).map(r => Object.assign({ id: r.id || rcuNuevoId() }, r));
  _rcuRetirando = false;
  rcuPintarHoja();
  ov.style.display = 'flex';
  const modal = ov.querySelector('.fin-modal');
  if (modal) modal.scrollTop = 0;
  if (!c) {
    const foco = document.getElementById(pre && pre.url ? 'rcu-h-titulo' : 'rcu-h-url');
    if (foco) foco.focus();
  }
}

function rcuCerrarHoja() {
  const ov = document.getElementById('rcu-overlay');
  if (ov) ov.style.display = 'none';
  _rcuHojaId = null; _rcuBorrador = null; _rcuRetirando = false;
  /* ⚠️ Lo compartido se limpia al CERRAR, no al leer (La Voz Prestada, 38). */
  if (_rcuDeCompartir) {
    _rcuDeCompartir = false;
    if (typeof vozCompartidoLimpiar === 'function') vozCompartidoLimpiar();
  }
}

function rcuPintarHoja() {
  const b = _rcuBorrador;
  if (!b) return;
  const tit = document.getElementById('rcu-h-cabecera');
  if (tit) tit.textContent = _rcuHojaId ? '📓 Cuaderno' : '📓 Cuaderno nuevo';
  document.getElementById('rcu-h-emoji').value = b.emoji || '';
  document.getElementById('rcu-h-titulo').value = b.titulo || '';
  document.getElementById('rcu-h-url').value = b.url || '';
  document.getElementById('rcu-h-serie').value = b.serie || '';
  document.getElementById('rcu-h-serie-n').value = b.serie_n ? String(b.serie_n) : '';
  document.getElementById('rcu-h-fuentes').value = b.fuentes ? String(b.fuentes) : '';
  document.getElementById('rcu-h-notas').value = b.notas || '';
  rcuHojaAlEscribirUrl();
  rcuPintarEstantesHoja();
  rcuPintarEstadoHoja();
  rcuPintarSeriesLista();
  rcuPintarRefs();
  rcuCrecer(document.getElementById('rcu-h-notas'));

  const abrir = document.getElementById('rcu-h-abrir');
  if (abrir) abrir.style.display = rcuMiraUrl(b.url).ok ? '' : 'none';
  const ret = document.getElementById('rcu-h-retirar-caja');
  if (ret) { ret.textContent = ''; ret.style.display = _rcuHojaId ? '' : 'none'; if (_rcuHojaId) rcuPintarRetirar(); }
  const err = document.getElementById('rcu-h-falta');
  if (err) { err.textContent = ''; err.style.display = 'none'; }
}

function rcuHojaAlEscribirUrl() {
  const v = document.getElementById('rcu-h-url').value;
  const nota = document.getElementById('rcu-h-url-nota');
  const n = rcuNotaDeUrl(v);
  nota.textContent = n.t;
  nota.className = 'rcu-h-nota' + (n.mal ? ' rcu-h-nota-mal' : '');
  nota.style.display = n.t ? '' : 'none';
  const abrir = document.getElementById('rcu-h-abrir');
  if (abrir) abrir.style.display = rcuMiraUrl(v).ok ? '' : 'none';
}

/* Los chips de estante: los de todos los cuadernos más los del borrador,
   y un campo para uno nuevo. Añadir uno NO pierde lo demás escrito. */
function rcuPintarEstantesHoja() {
  const caja = document.getElementById('rcu-h-estantes');
  const b = _rcuBorrador;
  caja.textContent = '';
  const puestos = new Set((b.estantes || []).map(rcuClave));
  const todos = rcuEstantesTodos();
  (b.estantes || []).forEach(e => { if (!todos.some(t => t.clave === rcuClave(e))) todos.push({ clave: rcuClave(e), rotulo: e, n: 0 }); });
  todos.sort((x, y) => x.rotulo.localeCompare(y.rotulo, 'es'));
  if (!todos.length) caja.appendChild(rcuEl('span', 'rcu-h-ayuda', 'Todavía no hay estantes: escribe el primero abajo (la materia, el curso, el proyecto…).'));
  todos.forEach(e => {
    const on = puestos.has(e.clave);
    const chip = rcuBtn('rcu-est-chip' + (on ? ' rcu-est-chip-on' : ''), e.rotulo, () => {
      if (puestos.has(e.clave)) b.estantes = (b.estantes || []).filter(x => rcuClave(x) !== e.clave);
      else b.estantes = (b.estantes || []).concat([e.rotulo]);
      rcuPintarEstantesHoja();
    });
    chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    caja.appendChild(chip);
  });
}
function rcuHojaEstanteNuevo() {
  const inp = document.getElementById('rcu-h-est-nuevo');
  const v = (inp.value || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  if (!v) return;
  const b = _rcuBorrador;
  const ya = rcuEstantesTodos().find(e => e.clave === rcuClave(v));
  const rotulo = ya ? ya.rotulo : v;      // «maestria» cae en «Maestría» si ya existe
  if (!(b.estantes || []).some(x => rcuClave(x) === rcuClave(rotulo))) b.estantes = (b.estantes || []).concat([rotulo]);
  inp.value = '';
  rcuPintarEstantesHoja();
}
function rcuPintarEstadoHoja() {
  const caja = document.getElementById('rcu-h-estado');
  const b = _rcuBorrador;
  caja.textContent = '';
  RCU_ESTADOS.forEach(e => {
    const on = (b.estado || 'activo') === e.id;
    const chip = rcuBtn('rcu-est-chip' + (on ? ' rcu-est-chip-on rcu-est-chip-' + e.id : ''), `${e.ic} ${e.t}`, () => { b.estado = e.id; rcuPintarEstadoHoja(); });
    chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    caja.appendChild(chip);
  });
}
function rcuPintarSeriesLista() {
  const dl = document.getElementById('rcu-h-series');
  if (!dl) return;
  dl.textContent = '';
  rcuSeriesTodas().forEach(s => { const o = document.createElement('option'); o.value = s.rotulo; dl.appendChild(o); });
}

/* Las referencias: lo que se sacó del cuaderno, cada una con dónde se
   usó. Es el registro que el autor lleva en la cabeza y se pierde. */
function rcuPintarRefs() {
  const caja = document.getElementById('rcu-h-refs');
  const b = _rcuBorrador;
  caja.textContent = '';
  if (!(b.referencias || []).length) {
    caja.appendChild(rcuEl('div', 'rcu-h-ayuda', 'Nada apuntado todavía. Una referencia es un dato, una cita o una idea que sacaste de este cuaderno, y dónde la usaste (una nota de la revista, un video, un ensayo).'));
  }
  (b.referencias || []).forEach((r, i) => {
    const fila = rcuEl('div', 'rcu-ref');
    const cab = rcuEl('div', 'rcu-ref-cab');
    cab.appendChild(rcuEl('span', 'rcu-ref-n', `🔖 ${i + 1}${r.f ? ' · ' + r.f : ''}`));
    cab.appendChild(rcuBtn('rcu-ref-x', '✕', () => { b.referencias.splice(i, 1); rcuPintarRefs(); }));
    fila.appendChild(cab);
    const t = rcuEl('textarea', 'rcu-textarea rcu-ref-t');
    t.rows = 2; t.setAttribute('placeholder', 'Qué sacaste: el dato, la cita, la idea…');
    t.value = r.t || '';
    t.addEventListener('input', () => { r.t = t.value; rcuCrecer(t); });
    fila.appendChild(t);
    const en = rcuEl('input', 'rcu-input rcu-ref-en');
    en.type = 'text'; en.setAttribute('placeholder', 'Dónde lo usaste (opcional): «Nº 3 · La bandera», «video de la burocracia»…');
    en.value = r.en || '';
    en.addEventListener('input', () => { r.en = en.value; });
    fila.appendChild(en);
    caja.appendChild(fila);
    rcuCrecer(t);
  });
}
function rcuHojaRefNueva() {
  const b = _rcuBorrador;
  b.referencias = (b.referencias || []).concat([{ id: rcuNuevoId(), t: '', en: '', f: rcuHoy() }]);
  rcuPintarRefs();
  const ts = document.querySelectorAll('#rcu-h-refs .rcu-ref-t');
  const ult = ts[ts.length - 1];
  if (ult) ult.focus();
}
function rcuCrecer(ta) {
  if (!ta) return;
  ta.style.height = 'auto';
  ta.style.height = Math.max(44, ta.scrollHeight + 2) + 'px';
}

/* Qué falta, con nombre: un «no se puede» a secas obliga a mirar todos
   los campos desde una tableta. */
function rcuQueFalta(b) {
  const faltan = [];
  if (!String(b.titulo || '').trim()) faltan.push('el nombre del cuaderno');
  const mira = rcuMiraUrl(b.url);
  if (!String(b.url || '').trim()) faltan.push('la dirección');
  else if (!mira.ok) faltan.push('una dirección https (' + (mira.motivo || 'esa no vale') + ')');
  return faltan;
}

async function rcuHojaGuardar() {
  const b = _rcuBorrador;
  if (!b) return;
  b.emoji = rcuUnEmoji(document.getElementById('rcu-h-emoji').value);
  const em = rcuEmojiDe(document.getElementById('rcu-h-titulo').value);
  if (!b.emoji && em.emoji) b.emoji = em.emoji;     // el emoji pegado con el nombre pasa a su sitio
  b.titulo = em.titulo.slice(0, 200);
  const mira = rcuMiraUrl(document.getElementById('rcu-h-url').value);
  b.url = mira.ok ? mira.url : String(document.getElementById('rcu-h-url').value || '').trim();
  b.cuaderno = mira.ok ? mira.cuaderno : '';
  b.serie = (document.getElementById('rcu-h-serie').value || '').trim().slice(0, 80);
  b.serie_n = Number(String(document.getElementById('rcu-h-serie-n').value || '').replace(',', '.')) || 0;
  b.fuentes = Math.max(0, Math.min(5000, parseInt(document.getElementById('rcu-h-fuentes').value, 10) || 0));
  b.notas = (document.getElementById('rcu-h-notas').value || '').slice(0, 8000);
  b.referencias = (b.referencias || []).filter(r => String(r.t || '').trim() || String(r.en || '').trim());

  const faltan = rcuQueFalta(b);
  const err = document.getElementById('rcu-h-falta');
  if (faltan.length) {
    err.textContent = 'Falta ' + faltan.join(' y ') + '.';
    err.style.display = '';
    return;
  }
  /* El mismo cuaderno ya está en el inventario: se dice, y se lleva a
     esa ficha en vez de guardar un gemelo. */
  if (!_rcuHojaId && b.cuaderno) {
    const gemelo = rcuVivos().find(c => c.cuaderno === b.cuaderno);
    if (gemelo) {
      err.textContent = `Ese cuaderno ya está en el inventario como «${gemelo.titulo}». Se abre esa ficha.`;
      err.style.display = '';
      setTimeout(() => rcuAbrirHoja(gemelo.id), 900);
      return;
    }
  }
  b.actualizado = Date.now();
  b.subida = false;
  const existente = _rcuHojaId ? rcuDe(_rcuHojaId) : null;
  let guardado;
  if (existente) { Object.assign(existente, b); guardado = existente; }
  else { _rcuLista.unshift(b); guardado = b; }
  const r = await rcuPersistir(guardado);
  rcuCerrarHoja();
  rcuRepintar();
  rcuAviso(r.ok ? '☁️ Guardado, en todos los aparatos' : (r.motivo === 'sin-tabla' ? '📴 Guardado en este aparato (falta correr el SQL)' : '📴 Guardado en este aparato'));
}

/* Retirar: dos toques en el mismo sitio, sin confirm(), y deja lápida. */
function rcuPintarRetirar() {
  const caja = document.getElementById('rcu-h-retirar-caja');
  if (!caja) return;
  caja.textContent = '';
  if (!_rcuRetirando) {
    caja.appendChild(rcuBtn('rcu-h-retirar', '🗑 Retirar del inventario', () => { _rcuRetirando = true; rcuPintarRetirar(); }));
    return;
  }
  caja.appendChild(rcuEl('span', 'rcu-h-retirar-q', '¿Retirar? Se puede devolver desde la lista.'));
  caja.appendChild(rcuBtn('rcu-h-retirar rcu-h-retirar-si', 'Sí, retirar', async () => {
    const c = rcuDe(_rcuHojaId);
    if (!c) return;
    c.eliminado = true; c.eliminado_at = new Date().toISOString(); c.actualizado = Date.now(); c.subida = false;
    await rcuPersistir(c);
    rcuCerrarHoja();
    rcuRepintar();
    rcuAviso('🗑 Retirado. Se puede devolver desde la lista.');
  }));
  caja.appendChild(rcuBtn('rcu-mini-btn', 'No', () => { _rcuRetirando = false; rcuPintarRetirar(); }));
}

/* ── Pegar varios ──────────────────────────────────────────────────── */

function rcuPegarAbrir() {
  const ov = document.getElementById('rcu-pegar-overlay');
  if (!ov) return;
  _rcuPegado = null;
  document.getElementById('rcu-p-texto').value = '';
  const rep = document.getElementById('rcu-p-repaso');
  rep.textContent = ''; rep.style.display = 'none';
  document.getElementById('rcu-p-guardar').style.display = 'none';
  ov.style.display = 'flex';
  document.getElementById('rcu-p-texto').focus();
}
function rcuPegarCerrar() {
  const ov = document.getElementById('rcu-pegar-overlay');
  if (ov) ov.style.display = 'none';
  _rcuPegado = null;
}
function rcuPegarLeer() {
  const txt = document.getElementById('rcu-p-texto').value;
  const r = rcuLeerVarios(txt);
  _rcuPegado = r;
  const rep = document.getElementById('rcu-p-repaso');
  rep.textContent = '';
  rep.style.display = '';
  const n = r.cuadernos.length;
  rep.appendChild(rcuEl('div', 'rcu-p-cuenta', n ? `Se entienden ${n} cuaderno${n === 1 ? '' : 's'}:` : 'No se entendió ningún cuaderno.'));
  r.cuadernos.forEach(c => {
    const f = rcuEl('div', 'rcu-p-item');
    f.appendChild(rcuEl('span', 'rcu-p-emoji', c.emoji || '📓'));
    const t = rcuEl('span', 'rcu-p-t', (c.serie_n ? c.serie_n + ' · ' : '') + c.titulo);
    f.appendChild(t);
    if (c.sinNombre) f.appendChild(rcuEl('span', 'rcu-p-aviso', 'sin nombre: ponle uno después'));
    if (!c.esCuaderno) f.appendChild(rcuEl('span', 'rcu-p-aviso', 'no es de NotebookLM: entra como enlace'));
    rep.appendChild(f);
  });
  if (r.repetidos.length) {
    rep.appendChild(rcuEl('div', 'rcu-p-malos-t', `Ya estaban (se saltan): ${r.repetidos.map(x => `renglón ${x.n}, «${x.titulo}»`).join('; ')}.`));
  }
  if (r.malos.length) {
    const m = rcuEl('div', 'rcu-p-malos');
    m.appendChild(rcuEl('div', 'rcu-p-malos-t', `${r.malos.length} renglón${r.malos.length === 1 ? '' : 'es'} sin entender (se dejan fuera):`));
    r.malos.forEach(x => m.appendChild(rcuEl('div', 'rcu-p-malo', `renglón ${x.n}: «${x.linea}» — ${x.por}`)));
    m.appendChild(rcuEl('div', 'rcu-p-ayuda', 'Cada cuaderno va en su renglón: el nombre, una barra | y la dirección. O el nombre en un renglón y la dirección en el siguiente.'));
    rep.appendChild(m);
  }
  const g = document.getElementById('rcu-p-guardar');
  g.textContent = n ? `Guardar ${n} cuaderno${n === 1 ? '' : 's'}` : 'Nada que guardar';
  g.style.display = n ? '' : 'none';
}
async function rcuPegarGuardar() {
  const r = _rcuPegado;
  if (!r || !r.cuadernos.length) return;
  const nuevos = r.cuadernos.map(c => rcuNuevo({
    titulo: c.titulo, url: c.url, cuaderno: c.cuaderno, emoji: c.emoji, serie_n: c.serie_n,
  }));
  _rcuLista = nuevos.concat(_rcuLista);
  rcuGuardaLocal();
  const s = await rcuSubirVarios(nuevos);   // UN viaje
  if (s.ok) rcuGuardaLocal();
  rcuPegarCerrar();
  rcuRepintar();
  rcuAviso(s.ok ? `☁️ ${nuevos.length} guardados, en todos los aparatos` : `📴 ${nuevos.length} guardados en este aparato`);
}

/* ── La hoja vertical: estantes, series y estados; orden y agrupación ── */

function rcuVerAbrir(modo) {
  const ov = document.getElementById('rcu-ver-overlay');
  if (!ov) return;
  ov.dataset.modo = modo;
  rcuVerPintar();
  ov.style.display = 'flex';
  const modal = ov.querySelector('.fin-modal');
  if (modal) modal.scrollTop = 0;
}
function rcuVerCerrar() {
  const ov = document.getElementById('rcu-ver-overlay');
  if (ov) ov.style.display = 'none';
}
function rcuVerFila(rotulo, cuenta, on, alTocar) {
  const b = rcuBtn('rcu-ver-fila' + (on ? ' rcu-ver-fila-on' : ''), '', alTocar);
  b.appendChild(rcuEl('span', 'rcu-ver-t', rotulo));
  if (cuenta !== null && cuenta !== undefined) b.appendChild(rcuEl('span', 'rcu-ver-n', String(cuenta)));
  if (on) b.appendChild(rcuEl('span', 'rcu-ver-ok', '✓'));
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
  return b;
}
function rcuVerPintar() {
  const ov = document.getElementById('rcu-ver-overlay');
  const cuerpo = document.getElementById('rcu-ver-cuerpo');
  const tit = document.getElementById('rcu-ver-titulo');
  if (!ov || !cuerpo) return;
  const modo = ov.dataset.modo || 'estantes';
  cuerpo.textContent = '';
  const list = document.getElementById('red-list');
  const pon = (filtro) => { _rcuFiltro = filtro; rcuVerCerrar(); if (list) rcuRender(list); };
  if (modo === 'estantes') {
    if (tit) tit.textContent = '🗂 Estantes';
    const vivos = rcuVivos();
    cuerpo.appendChild(rcuVerFila('Todos los cuadernos', vivos.length, !_rcuFiltro, () => pon(null)));
    const ests = rcuEstantesTodos(vivos);
    ests.forEach(e => cuerpo.appendChild(rcuVerFila(e.rotulo, e.n, !!(_rcuFiltro && _rcuFiltro.eje === 'estante' && _rcuFiltro.clave === e.clave),
      () => pon({ eje: 'estante', clave: e.clave, rotulo: e.rotulo }))));
    const sinEst = vivos.filter(c => !(c.estantes || []).some(x => rcuClave(x))).length;
    if (sinEst && ests.length) cuerpo.appendChild(rcuVerFila('Sin estante', sinEst, !!(_rcuFiltro && _rcuFiltro.eje === 'estante' && _rcuFiltro.clave === 'sin'),
      () => pon({ eje: 'estante', clave: 'sin', rotulo: 'Sin estante' })));
    if (!ests.length) cuerpo.appendChild(rcuEl('div', 'rcu-h-ayuda', 'Los estantes se ponen en la ficha de cada cuaderno: la materia, el curso, el proyecto. Un cuaderno puede estar en varios.'));
    const series = rcuSeriesTodas(vivos);
    if (series.length) {
      cuerpo.appendChild(rcuEl('div', 'rcu-ver-cab', '🔢 Series'));
      series.forEach(s => cuerpo.appendChild(rcuVerFila(s.rotulo, s.n, !!(_rcuFiltro && _rcuFiltro.eje === 'serie' && _rcuFiltro.clave === s.clave),
        () => pon({ eje: 'serie', clave: s.clave, rotulo: s.rotulo }))));
    }
    cuerpo.appendChild(rcuEl('div', 'rcu-ver-cab', 'Estado'));
    RCU_ESTADOS.forEach(e => {
      const n = vivos.filter(c => (c.estado || 'activo') === e.id).length;
      cuerpo.appendChild(rcuVerFila(`${e.ic} ${e.t}`, n, !!(_rcuFiltro && _rcuFiltro.eje === 'estado' && _rcuFiltro.clave === e.id),
        () => pon({ eje: 'estado', clave: e.id, rotulo: `${e.ic} ${e.t}` })));
    });
  } else {
    if (tit) tit.textContent = '⇅ Orden';
    const an = rcuAnaquel();
    cuerpo.appendChild(rcuEl('div', 'rcu-ver-cab', 'Ordenar por'));
    RCU_ORDENES.forEach(o => {
      const f = rcuVerFila(o.t, null, an.orden === o.id, () => { an.orden = o.id; rcuGuardaAnaquel(); rcuVerCerrar(); if (list) rcuRender(list); });
      f.appendChild(rcuEl('span', 'rcu-ver-d', o.d));
      cuerpo.appendChild(f);
    });
    cuerpo.appendChild(rcuEl('div', 'rcu-ver-cab', 'Agrupar'));
    RCU_AGRUPAR.forEach(a => {
      const f = rcuVerFila(a.t, null, an.agrupar === a.id, () => { an.agrupar = a.id; rcuGuardaAnaquel(); rcuVerCerrar(); if (list) rcuRender(list); });
      f.appendChild(rcuEl('span', 'rcu-ver-d', a.d));
      cuerpo.appendChild(f);
    });
  }
}

/* ── Exportar: el inventario entero, en texto, para el chat o un respaldo ── */

function rcuExportarTexto() {
  const vivos = rcuVivos();
  const lineas = [`# Cuadernos de NotebookLM · ${rcuFechaCorta(Date.now())}`, ''];
  const grupos = [];
  rcuEstantesTodos(vivos).forEach(e => grupos.push({ rotulo: e.rotulo, items: rcuOrdena(vivos.filter(c => (c.estantes || []).some(x => rcuClave(x) === e.clave)), 'titulo') }));
  const sin = vivos.filter(c => !(c.estantes || []).some(x => rcuClave(x)));
  if (sin.length) grupos.push({ rotulo: grupos.length ? 'Sin estante' : '', items: rcuOrdena(sin, 'titulo') });
  grupos.forEach(g => {
    if (g.rotulo) lineas.push(`## 🗂 ${g.rotulo} (${g.items.length})`, '');
    g.items.forEach(c => {
      const est = rcuEstado(c.estado);
      const datos = [];
      if (c.serie) datos.push(`serie ${c.serie}${c.serie_n ? ' · ' + c.serie_n : ''}`);
      else if (c.serie_n) datos.push(`nº ${c.serie_n}`);
      datos.push(`${est.t.toLowerCase()}`);
      if (c.fuentes) datos.push(`${c.fuentes} fuentes`);
      if (c.ultima) datos.push(`abierto ${rcuFechaCorta(c.ultima)}`);
      lineas.push(`- ${c.emoji ? c.emoji + ' ' : ''}**${c.titulo}** — ${c.url}`);
      lineas.push(`  ${datos.join(' · ')}`);
      if (c.notas) lineas.push(`  ${c.notas.replace(/\s*\n\s*/g, ' ')}`);
      (c.referencias || []).forEach(r => {
        lineas.push(`  - 🔖 ${String(r.t || '').replace(/\s*\n\s*/g, ' ')}${r.en ? ` (usado en: ${r.en})` : ''}${r.f ? ` · ${r.f}` : ''}`);
      });
      lineas.push('');
    });
  });
  return lineas.join('\n').trim() + '\n';
}
async function rcuExportar() {
  if (!rcuVivos().length) { rcuAviso('No hay cuadernos que exportar'); return; }
  const ok = await rcuCopiar(rcuExportarTexto());
  rcuAviso(ok ? '📋 Inventario copiado (en texto, listo para pegar)' : 'No se pudo copiar');
}

/* ── Compartir a F.A.R.O ───────────────────────────────────────────── */

/* Lo llama faroArranqueCompartido (La Voz Prestada) ANTES de ofrecer
   las lecturas: un enlace de NotebookLM es un cuaderno para el
   inventario, no un recurso de una lectura. Devuelve true si se lo
   quedó. La dirección compartida se limpia al cerrar la hoja. */
function rcuCompartido(d) {
  if (!d || !d.url) return false;
  const mira = rcuMiraUrl(d.url);
  if (!mira.ok || !mira.esCuaderno) return false;
  if (typeof switchView !== 'function') return false;
  switchView('view-redaccion');
  if (typeof _redEdicion !== 'undefined') _redEdicion = 'cuadernos';
  if (typeof redRender === 'function') { try { redRender(); } catch (e) {} }
  const gemelo = rcuVivos().find(c => c.cuaderno === mira.cuaderno);
  _rcuDeCompartir = true;
  if (gemelo) { rcuAbrirHoja(gemelo.id); rcuAviso('Ese cuaderno ya estaba en el inventario'); return true; }
  const em = rcuEmojiDe(d.tit || d.resto || '');
  rcuAbrirHoja(null, { url: mira.url, cuaderno: mira.cuaderno, titulo: em.titulo, emoji: em.emoji, serie_n: rcuSerieNDe(em.titulo) });
  return true;
}

/* ── Cableado ──────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const cerrarAlFondo = (idOv, cerrar) => {
    const ov = document.getElementById(idOv);
    ov?.addEventListener('click', e => { if (e.target.id === idOv) cerrar(); });
  };
  document.getElementById('rcu-h-close')?.addEventListener('click', rcuCerrarHoja);
  cerrarAlFondo('rcu-overlay', rcuCerrarHoja);
  document.getElementById('rcu-h-guardar')?.addEventListener('click', rcuHojaGuardar);
  document.getElementById('rcu-h-url')?.addEventListener('input', rcuHojaAlEscribirUrl);
  document.getElementById('rcu-h-est-add')?.addEventListener('click', rcuHojaEstanteNuevo);
  document.getElementById('rcu-h-est-nuevo')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); rcuHojaEstanteNuevo(); } });
  document.getElementById('rcu-h-ref-add')?.addEventListener('click', rcuHojaRefNueva);
  document.getElementById('rcu-h-notas')?.addEventListener('input', e => rcuCrecer(e.target));
  document.getElementById('rcu-h-copiar')?.addEventListener('click', async () => {
    const v = document.getElementById('rcu-h-url').value;
    const ok = await rcuCopiar(rcuMiraUrl(v).url || v);
    rcuAviso(ok ? '📋 Dirección copiada' : 'No se pudo copiar');
  });
  document.getElementById('rcu-h-abrir')?.addEventListener('click', () => {
    const mira = rcuMiraUrl(document.getElementById('rcu-h-url').value);
    if (!mira.ok) return;
    const c = _rcuHojaId ? rcuDe(_rcuHojaId) : null;
    if (c) rcuConsultado(c);
    window.open(mira.url, '_blank', 'noopener,noreferrer');
  });

  document.getElementById('rcu-p-close')?.addEventListener('click', rcuPegarCerrar);
  cerrarAlFondo('rcu-pegar-overlay', rcuPegarCerrar);
  document.getElementById('rcu-p-leer')?.addEventListener('click', rcuPegarLeer);
  document.getElementById('rcu-p-guardar')?.addEventListener('click', rcuPegarGuardar);

  document.getElementById('rcu-ver-close')?.addEventListener('click', rcuVerCerrar);
  cerrarAlFondo('rcu-ver-overlay', rcuVerCerrar);

  /* Sin señal y vuelve: lo pendiente sube solo. */
  window.addEventListener('online', () => { if (_rcuCargada) rcuInit(); });
});
