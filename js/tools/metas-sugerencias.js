'use strict';

/* ─────────────────────────────────────────────
   SUGERENCIAS DE M.E.T.A.S 💬 · la bandeja del administrador
   ─────────────────────────────────────────────
   Dentro de cada misión de M.E.T.A.S hay un botón «💬 Sugerencias».
   Lo toca el alumno o el maestro cuando encuentra un error en el
   contenido, algo que no funciona o se le ocurre una idea. Esos
   mensajes caen AQUÍ, y aquí es el único sitio donde se leen.

   POR QUÉ ESTÁ EN F.A.R.O Y NO EN M.E.T.A.S: porque quien tiene que
   leerlos es el administrador del proyecto, y el administrador trabaja
   aquí. Es el mismo camino del Buzón del lector: la pantalla pública
   vive en M.E.T.A.S, que es lo que la gente puede abrir, y lo recogido
   cae en la aplicación privada, que es donde se atiende. El otro
   extremo del cable es `js/metas-sugerencias.js` en el repositorio de
   M.E.T.A.S, y la tabla la crea `supabase/sql/metas_sugerencias.sql`.

   POR QUÉ VA EN EL ACCESO RÁPIDO Y NO ENTERRADO EN UN MENÚ: porque lo
   que se revisa es lo que se ve. Una errata avisada por un niño y no
   leída durante tres meses sigue enseñando el dato malo a todas las
   aulas que abran esa misión mientras tanto. Por eso además lleva
   contador de sin leer en la propia tarjeta de la portada: para
   enterarse SIN entrar.
───────────────────────────────────────────── */

const MSUG_TABLE = 'metas_sugerencias';

/* De dónde vienen los mensajes, para poder ir a mirar el error en la
   misión de verdad. La sugerencia trae el camino de su página
   («/misiones/…/adjetivos-II-IIICiclo.html») porque las misiones no se
   llaman index.html: cada una tiene su propio nombre de archivo y con
   la carpeta sola no se puede armar el enlace. */
const MSUG_SITIO = 'https://metas.policastsapien.com';

let _msugCache  = [];         // lo que hay en la bandeja
let _msugHay    = true;       // ¿ya se corrió el SQL en esta base?
let _msugFiltro = 'abiertas'; // 'abiertas' | 'cerradas' | 'todas'
let _msugCat    = '';         // '' = todas las categorías
let _msugAbierta = null;      // la que está abierta en el detalle

/* Las cuatro del selector de la misión. Si allá se añade una quinta,
   se añade AQUÍ y en la función del servidor: la lista vive dentro de
   ella y lo que no está se guarda como «idea». */
const MSUG_CATS = {
  error_contenido: { ic: '📚', t: 'Error en el contenido', cls: 'msug-cat-cont' },
  error_tecnico:   { ic: '🔧', t: 'Algo no funciona',      cls: 'msug-cat-tec'  },
  idea:            { ic: '💡', t: 'Una idea',              cls: 'msug-cat-idea' },
  felicitacion:    { ic: '🎉', t: 'Felicitación',          cls: 'msug-cat-feli' },
};

const MSUG_ESTADOS = {
  nuevo:      { label: '🔵 Sin abrir', cls: 'msug-est-nuevo' },
  leido:      { label: '👁 Leída',     cls: 'msug-est-leido' },
  atendido:   { label: '✅ Atendida',  cls: 'msug-est-atendido' },
  descartado: { label: '🚫 Descartada', cls: 'msug-est-descartado' },
};

/* Los nombres cortos de las secciones de una misión. La sugerencia
   guarda el identificador que usa la plantilla («eval», «flash»), que
   al administrador no le dice nada leído así. Lo que no esté en esta
   lista se enseña tal cual: es preferible un identificador crudo a
   esconder de qué sección hablaba. */
const MSUG_SECCIONES = {
  aprende: '📖 Aprende', tipos: '🏷️ Tipos', lab: '🔬 Lab',
  flash: '🃏 Flashcards', quiz: '❓ Quiz', clasifica: '🗂️ Clasifica',
  identifica: '🔍 Identifica', completa: '✏️ Completa', reto: '🏆 Reto',
  sopa: '🔤 Sopa', tareas: '📋 Tareas', lectura: '📖 Lectura',
  eval: '📝 Evaluación', diploma: '🎓 Constancia', recursos: '📁 Recursos',
};

function msugCat(id)  { return MSUG_CATS[id] || MSUG_CATS.idea; }
function msugEstado(e) { return MSUG_ESTADOS[e] || MSUG_ESTADOS.nuevo; }
function msugAbierta(s) { return s.estado === 'nuevo' || s.estado === 'leido'; }

function msugEsc(s) {
  const div = document.createElement('div');
  div.textContent = s == null ? '' : s;
  return div.innerHTML;
}

function msugFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 60) return `hace ${Math.max(mins, 1)} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const dias = Math.floor(hrs / 24);
  if (dias === 1) return 'ayer';
  if (dias < 7)  return `hace ${dias} días`;
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function msugFechaLarga(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

/* Quién está atendiendo, para que quede apuntado en la fila. */
function msugQuien() {
  const s = (typeof verificarSesion === 'function') ? verificarSesion() : null;
  if (!s) return '';
  const m = (typeof MEMBERS !== 'undefined') ? MEMBERS.find(x => x.id === s.user) : null;
  return m ? m.short : (s.nombre || s.user || '');
}

/* ── Carga ───────────────────────────────────────────────────────── */

async function initMetasSug() {
  const list = document.getElementById('msug-list');
  if (!list) return;

  if (!_sb) {
    list.innerHTML = '<div class="fin-empty">No se pudo conectar con la bandeja.</div>';
    return;
  }

  list.innerHTML = '<div class="fin-empty">Abriendo la bandeja…</div>';

  /* Mientras no se haya corrido metas_sugerencias.sql la tabla no
     existe. En vez de reventar, la herramienta lo dice y explica qué
     falta: el que abre esto desde la tableta no tiene el repositorio
     delante para averiguarlo. */
  const { data, error } = await _sb.from(MSUG_TABLE)
    .select('*')
    .order('creado_at', { ascending: false })
    .limit(500);

  if (error) {
    _msugHay = false;
    _msugCache = [];
    list.innerHTML = `
      <div class="msug-vacio">
        <div class="msug-vacio-ic">🧰</div>
        <p><strong>La bandeja todavía no está instalada.</strong></p>
        <p>Falta correr <code>supabase/sql/metas_sugerencias.sql</code> en el
           editor SQL de Supabase. Es un solo archivo y se puede correr
           dos veces sin dañar nada.</p>
      </div>`;
    msugPintarCabecera();
    return;
  }

  _msugHay = true;
  _msugCache = data || [];
  msugRender();
  msugPintarInsignia();
}

/* ── Pintado ─────────────────────────────────────────────────────── */

function msugPintarCabecera() {
  const cont = document.getElementById('msug-count');
  if (!cont) return;
  if (!_msugHay) { cont.textContent = 'Sin instalar'; return; }
  const sinAbrir = _msugCache.filter(s => s.estado === 'nuevo').length;
  const abiertas = _msugCache.filter(msugAbierta).length;
  cont.textContent = abiertas
    ? `${abiertas} sin resolver${sinAbrir ? ` · ${sinAbrir} sin abrir` : ''}`
    : (_msugCache.length ? '¡Todo atendido! 🎉' : 'Nada por ahora');
}

/* El contador de la tarjeta del Acceso Rápido. Es el que hace que esto
   se revise: sin él hay que acordarse de entrar, y nadie se acuerda. */
function msugPintarInsignia() {
  const b = document.getElementById('msug-badge');
  if (!b) return;
  const n = _msugCache.filter(s => s.estado === 'nuevo').length;
  b.textContent = n > 99 ? '99+' : String(n);
  b.style.display = n ? '' : 'none';
}

function msugRender() {
  const list = document.getElementById('msug-list');
  if (!list) return;

  msugPintarCabecera();

  document.querySelectorAll('#msug-tabs .msug-tab').forEach(b =>
    b.classList.toggle('msug-tab-active', b.dataset.f === _msugFiltro));

  msugPintarChips();

  let lista = _msugCache;
  if (_msugFiltro === 'abiertas') lista = lista.filter(msugAbierta);
  if (_msugFiltro === 'cerradas') lista = lista.filter(s => !msugAbierta(s));
  if (_msugCat) lista = lista.filter(s => (s.categoria || 'idea') === _msugCat);

  if (!_msugCache.length) {
    list.innerHTML = `
      <div class="msug-vacio">
        <div class="msug-vacio-ic">💬</div>
        <p><strong>Nadie ha escrito todavía.</strong></p>
        <p>Aquí cae lo que la gente manda desde el botón
           <strong>💬 Sugerencias</strong> de cada misión de M.E.T.A.S:
           erratas, cosas que no funcionan e ideas.</p>
        <p>Nada de esto se publica: lo lee solo quien entra aquí.</p>
      </div>`;
    return;
  }

  if (!lista.length) {
    list.innerHTML = '<div class="fin-empty">Nada con ese filtro.</div>';
    return;
  }

  list.innerHTML = lista.map(s => {
    const c = msugCat(s.categoria);
    const e = msugEstado(s.estado);
    const donde = s.mision_titulo || s.mision || '';
    return `
      <button type="button" class="msug-fila ${s.estado === 'nuevo' ? 'msug-fila-nueva' : ''}" data-sug="${s.id}">
        <div class="msug-ic ${c.cls}">${c.ic}</div>
        <div class="msug-main">
          <div class="msug-texto">${msugEsc((s.texto || '').slice(0, 130))}</div>
          <div class="msug-badges">
            <span class="msug-badge ${e.cls}">${e.label}</span>
            ${donde ? `<span class="msug-badge msug-badge-mision">🚀 ${msugEsc(donde)}</span>` : ''}
            ${s.seccion ? `<span class="msug-badge msug-badge-sec">${msugEsc(MSUG_SECCIONES[s.seccion] || s.seccion)}</span>` : ''}
          </div>
          <div class="msug-quien">
            ${s.alumno ? msugEsc(s.alumno) : '<em>Sin nombre</em>'}${s.grado ? ' · ' + msugEsc(s.grado) : ''}
            ${s.escuela ? ' · ' + msugEsc(s.escuela) : ''} · ${msugFecha(s.creado_at)}
          </div>
        </div>
        <i class="fa-solid fa-chevron-right msug-arrow"></i>
      </button>`;
  }).join('');

  list.querySelectorAll('.msug-fila').forEach(b =>
    b.addEventListener('click', () => msugAbrir(Number(b.dataset.sug))));
}

function msugPintarChips() {
  const wrap = document.getElementById('msug-cat-chips');
  if (!wrap) return;
  // Solo salen las categorías que de verdad han llegado: una fila de
  // chips donde tres no filtran nada es ruido.
  const usadas = Object.keys(MSUG_CATS).filter(k =>
    _msugCache.some(s => (s.categoria || 'idea') === k));
  if (usadas.length < 2) { wrap.innerHTML = ''; wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';
  wrap.innerHTML = usadas.map(k => {
    const c = MSUG_CATS[k];
    const n = _msugCache.filter(s => (s.categoria || 'idea') === k && msugAbierta(s)).length;
    return `<button type="button" class="msug-chip ${_msugCat === k ? 'msug-chip-active' : ''}" data-cat="${k}">
      ${c.ic} ${msugEsc(c.t)}${n ? ` · ${n}` : ''}</button>`;
  }).join('');
  wrap.querySelectorAll('.msug-chip').forEach(b => b.addEventListener('click', () => {
    _msugCat = (_msugCat === b.dataset.cat) ? '' : b.dataset.cat;
    msugRender();
  }));
}

/* ── Una sugerencia, abierta ─────────────────────────────────────── */

async function msugAbrir(id) {
  const s = _msugCache.find(x => x.id === id);
  if (!s) return;
  _msugAbierta = s;

  const ov = document.getElementById('msug-overlay');
  if (!ov) return;
  ov.style.display = 'flex';
  msugPintarDetalle(s);

  /* Marcarla leída en cuanto se abre. Si no, el contador de la portada
     miente y se acaba abriendo tres veces lo mismo mientras otra se
     queda esperando. */
  if (s.estado === 'nuevo') await msugCambiarEstado(s, 'leido', null, false);
}

function msugPintarDetalle(s) {
  const c = msugCat(s.categoria);
  const tit = document.getElementById('msug-det-titulo');
  const cu  = document.getElementById('msug-det-cuerpo');
  if (!tit || !cu) return;

  tit.innerHTML = `${c.ic} ${msugEsc(c.t)}`;

  /* El desfase entre cuándo se escribió y cuándo llegó solo se enseña
     cuando es de más de un día: un mensaje escrito sin señal en el
     campo puede tardar una semana, y el que lo atiende necesita saber
     que la errata lleva ahí desde entonces. Si llegó el mismo día, la
     línea sobra. */
  let desfase = '';
  if (s.escrito_at && s.creado_at) {
    const dias = Math.round((new Date(s.creado_at) - new Date(s.escrito_at)) / 86400000);
    if (dias >= 1) desfase = `<div class="msug-det-desfase">✍️ Se escribió el ${msugFechaLarga(s.escrito_at)}, ${dias} día${dias === 1 ? '' : 's'} antes de poder mandarse (estaba sin internet).</div>`;
  }

  const enlace = s.url ? MSUG_SITIO + s.url : (s.mision ? `${MSUG_SITIO}/misiones/${s.mision}/` : '');
  const e = msugEstado(s.estado);
  const cerrada = !msugAbierta(s);

  cu.innerHTML = `
    <div class="msug-det-badges">
      <span class="msug-badge ${e.cls}">${e.label}</span>
      ${s.visto_por ? `<span class="msug-badge msug-badge-sec">por ${msugEsc(s.visto_por)}</span>` : ''}
    </div>

    <div class="msug-det-texto">${msugEsc(s.texto || '')}</div>
    ${desfase}

    <div class="msug-det-bloque">
      <div class="msug-det-fila"><span>🚀 Misión</span><strong>${msugEsc(s.mision_titulo || s.mision || '—')}</strong></div>
      ${s.seccion ? `<div class="msug-det-fila"><span>📍 Sección</span><strong>${msugEsc(MSUG_SECCIONES[s.seccion] || s.seccion)}</strong></div>` : ''}
      <div class="msug-det-fila"><span>📅 Llegó</span><strong>${msugFechaLarga(s.creado_at)}</strong></div>
    </div>

    <div class="msug-det-bloque">
      <div class="msug-det-fila"><span>👤 Quién</span><strong>${s.alumno ? msugEsc(s.alumno) : 'No se identificó'}</strong></div>
      ${s.grado   ? `<div class="msug-det-fila"><span>📚 Grado</span><strong>${msugEsc(s.grado)}</strong></div>` : ''}
      ${s.escuela ? `<div class="msug-det-fila"><span>🏫 Escuela</span><strong>${msugEsc(s.escuela)}</strong></div>` : ''}
      ${s.docente ? `<div class="msug-det-fila"><span>🧑‍🏫 Maestro</span><strong>${msugEsc(s.docente)}</strong></div>` : ''}
      ${s.codigo_aula ? `<div class="msug-det-fila"><span>🔑 Aula</span><strong>${msugEsc(s.codigo_aula)}</strong></div>` : ''}
      <div class="msug-det-fila"><span>📱 Aparato</span><strong>${msugEsc(s.dispositivo || '—')}</strong></div>
    </div>

    ${enlace ? `<a class="msug-det-ir" href="${msugEsc(enlace)}" target="_blank" rel="noopener">
      <i class="fa-solid fa-up-right-from-square"></i> Abrir la misión y mirarlo</a>` : ''}

    <label class="msug-det-label" for="msug-det-respuesta">📝 Qué se hizo (queda apuntado aquí)</label>
    <textarea id="msug-det-respuesta" class="msug-det-area" rows="3"
      placeholder="Ej: corregida la respuesta de la pregunta 3 y publicado.">${msugEsc(s.respuesta || '')}</textarea>

    <div class="msug-det-acciones">
      ${cerrada
        ? `<button type="button" class="msug-btn msug-btn-volver" data-accion="leido">↩️ Volver a pendientes</button>`
        : `<button type="button" class="msug-btn msug-btn-descartar" data-accion="descartado">🚫 Descartar</button>
           <button type="button" class="msug-btn msug-btn-atender" data-accion="atendido">✅ Atendida</button>`}
    </div>`;

  cu.querySelectorAll('[data-accion]').forEach(b => b.addEventListener('click', () => {
    const nota = document.getElementById('msug-det-respuesta');
    msugCambiarEstado(s, b.dataset.accion, nota ? nota.value : null, true);
  }));
}

/* Cambiar el estado. `cerrar` dice si además se sale del detalle: al
   marcar leída por abrirla, no; al atender o descartar, sí, porque lo
   siguiente que se quiere es la que viene. */
async function msugCambiarEstado(s, estado, respuesta, cerrar) {
  if (!_sb) return;

  const cambios = { estado, visto_por: msugQuien(), visto_at: new Date().toISOString() };
  if (respuesta !== null && respuesta !== undefined) {
    cambios.respuesta = String(respuesta).slice(0, 1000);
  }

  // Optimista: la lista responde al instante y el que revisa no espera.
  const antes = { estado: s.estado, respuesta: s.respuesta, visto_por: s.visto_por, visto_at: s.visto_at };
  Object.assign(s, cambios);
  msugRender();
  msugPintarInsignia();
  if (cerrar) msugCerrarDetalle();
  else msugPintarDetalle(s);

  const { error } = await _sb.from(MSUG_TABLE).update(cambios).eq('id', s.id);
  if (error) {
    Object.assign(s, antes);       // no se pudo: se deja como estaba
    msugRender();
    msugPintarInsignia();
    if (typeof toast === 'function') toast('No se pudo guardar el cambio');
    return;
  }
  if (cerrar && typeof toast === 'function') {
    toast(estado === 'atendido' ? '✅ Sugerencia atendida' : '🚫 Sugerencia descartada');
  }
}

function msugCerrarDetalle() {
  const ov = document.getElementById('msug-overlay');
  if (ov) ov.style.display = 'none';
  _msugAbierta = null;
}

/* El contador de la portada, sin abrir la herramienta. Es una consulta
   de solo contar —no se baja ni una fila— para que la portada no
   arrastre la bandeja entera cada vez que se abre la aplicación. */
async function msugContarSinAbrir() {
  const b = document.getElementById('msug-badge');
  if (!b || !_sb) return;
  const { count, error } = await _sb.from(MSUG_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('estado', 'nuevo');
  if (error) { b.style.display = 'none'; return; }   // sin instalar: ni se menciona
  b.textContent = (count || 0) > 99 ? '99+' : String(count || 0);
  b.style.display = count ? '' : 'none';
}

/* ── Wiring ──────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('goto-msug-btn')?.addEventListener('click', () => switchView('view-msug'));
  document.getElementById('msug-back-btn')?.addEventListener('click', () => switchView('view-inicio'));
  document.getElementById('msug-det-cerrar')?.addEventListener('click', msugCerrarDetalle);
  document.getElementById('msug-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'msug-overlay') msugCerrarDetalle();
  });

  document.querySelectorAll('#msug-tabs .msug-tab').forEach(b =>
    b.addEventListener('click', () => { _msugFiltro = b.dataset.f; msugRender(); }));
});
