'use strict';

/* ─────────────────────────────────────────────
   REDACCIÓN 📰 · sala de redacción de la revista
   PolicastSapien (quincenal).
   Ediciones → notas (sección, tipo, estado, autor)
   → editor con autoguardado → exportar a Markdown
   para maquetar la revista en otro programa.
   Datos compartidos en Supabase (cada nota registra su autor).

   Dos cosas se pueden deshacer aquí, y por eso existen:
     · las ediciones se editan (número, título y fecha de cierre) y se
       archivan o se eliminan, porque una fecha mal puesta no debería
       obligar a empezar la edición de cero;
     · «Eliminar» una nota NO la borra: la manda a la papelera, de donde
       vuelve entera. Solo se borra de verdad lo que ya está allí, y
       diciéndolo dos veces.
───────────────────────────────────────────── */

const RED_T_EDICIONES = 'redaccion_ediciones';
const RED_T_NOTAS     = 'redaccion_notas';
const RED_T_CONFIG    = 'redaccion_config';
const RED_PENDING_KEY = 'faro_redaccion_pending_v1';

const RED_SECCIONES = [
  'PORTADA', 'EDITORIAL', 'ACTUALIDAD', 'REPORTE INVESTIGATIVO',
  'TECNOLOGÍA', 'CULTURA', 'FILOSOFÍA Y AULA', 'AVISOS',
];
const RED_TIPOS = [
  'Artículo', 'Nota de prensa', 'Editorial', 'Aviso',
  'Reseña', 'Entrevista', 'Reporte', 'Idea',
];
const RED_NUEVA_SECCION = '__nueva_seccion__';
const RED_NUEVO_TIPO    = '__nuevo_tipo__';
const RED_ESTADOS = [
  { id: 'idea',     label: '💭 Idea',     cls: 'red-est-idea' },
  { id: 'borrador', label: '✏️ Borrador', cls: 'red-est-borrador' },
  { id: 'revision', label: '👁 Revisión',  cls: 'red-est-revision' },
  { id: 'listo',    label: '✅ Listo',     cls: 'red-est-listo' },
];

let _redEdiciones = [];      // todas las ediciones, recientes primero
let _redNotas     = [];      // todas las notas (incluidas las de la papelera)
let _redConfig    = { secciones: [], tipos: [] };  // personalizados (compartidos)
let _redEdicion   = null;    // id de la edición seleccionada; 'banco' = sin edición,
                             // 'papelera' = notas eliminadas
let _redNotaId    = null;    // nota abierta en el editor
let _redSaveTimer = null;
let _redLoaded    = false;
let _redPapelera  = false;   // ¿la base ya tiene las columnas de la papelera?
let _redEdEditando = null;   // edición abierta en el modal (null = una nueva)

/* ── Helpers ── */

function redMiembro() {
  const s = (typeof verificarSesion === 'function') ? verificarSesion() : null;
  return (s && s.user) || 'josue';
}

function redEsc(s) {
  const div = document.createElement('div');
  div.textContent = s || '';
  return div.innerHTML;
}

function redAutorInfo(id) {
  const m = (typeof MEMBERS !== 'undefined') ? MEMBERS.find(x => x.id === id) : null;
  return m ? `${m.emoji} ${m.short.split(' ')[0]}` : id;
}

/* El cuerpo puede ser HTML (editor con formato) o texto plano (notas viejas) */
function redPlano(html) {
  if (!html) return '';
  if (!html.includes('<')) return html;
  const div = document.createElement('div');
  div.innerHTML = html
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<\/(div|p|h[1-6]|li)>/gi, '\n');
  return div.textContent;
}

function redPalabras(txt) {
  const t = redPlano(txt || '').trim();
  return t ? t.split(/\s+/).length : 0;
}

/* HTML del editor → Markdown (negrita/cursiva; el resto queda como texto) */
function redMdNodo(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const inner = [...node.childNodes].map(redMdNodo).join('');
  const tag = node.tagName.toLowerCase();
  if (tag === 'br') return '\n';
  if (tag === 'b' || tag === 'strong') return inner.trim() ? `**${inner}**` : inner;
  if (tag === 'i' || tag === 'em')     return inner.trim() ? `*${inner}*`  : inner;
  if (tag === 'div' || tag === 'p' || tag === 'li') return '\n' + inner;
  return inner; // <u>, <font>, <span>… : se conserva solo el texto
}

function redMdDesdeHtml(html) {
  if (!html || !html.includes('<')) return html || '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return redMdNodo(div).replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '');
}

/* Estado del texto frente a sus límites: '' | 'ok' | 'amarillo' | 'rojo' */
function redEstadoLimite(pal, min, max) {
  if (!min && !max) return '';
  if (max && pal > max) return 'rojo';
  if (min && pal < min) return 'amarillo';
  return 'ok';
}

function redEstadoInfo(id) {
  return RED_ESTADOS.find(e => e.id === id) || RED_ESTADOS[0];
}

/* Secciones y tipos disponibles: los base + los personalizados guardados */
function redSeccionesAll() {
  return [...RED_SECCIONES, ..._redConfig.secciones.filter(s => !RED_SECCIONES.includes(s))];
}
function redTiposAll() {
  return [...RED_TIPOS, ..._redConfig.tipos.filter(t => !RED_TIPOS.includes(t))];
}

async function redGuardarConfig(clave) {
  if (!_sb) return;
  const { error } = await _sb.from(RED_T_CONFIG)
    .upsert({ clave, valor: _redConfig[clave] });
  if (error) {
    console.error('[Redacción] Error guardando config:', error);
    if (typeof toast === 'function') toast('No se pudo guardar (¿falta el SQL de config?)');
  }
}

/* Quincena actual: [1–15] o [16–fin de mes] */
function redQuincenaActual() {
  const hoy = new Date();
  const y = hoy.getFullYear(), m = hoy.getMonth();
  const mesNombre = hoy.toLocaleDateString('es', { month: 'long' });
  if (hoy.getDate() <= 15) {
    return { label: `1–15 ${mesNombre} ${y}`, cierre: new Date(y, m, 15) };
  }
  const fin = new Date(y, m + 1, 0).getDate();
  return { label: `16–${fin} ${mesNombre} ${y}`, cierre: new Date(y, m, fin) };
}

/* Fecha → 'AAAA-MM-DD' con la hora local (lo que espera <input type="date">) */
function redFechaISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* Días que faltan, contados en el calendario y no en horas: 0 es hoy,
   1 es mañana, −1 fue ayer.

   Antes se restaban las horas hasta el final del día del cierre y se
   redondeaba hacia arriba, y eso sumaba siempre un día de más: con el
   cierre a diez días decía once, y el día del cierre decía «1 día» en vez
   de «¡Cierra HOY!», que así no aparecía nunca. Peor todavía: un cierre de
   ayer daba −0, que en JavaScript es igual a 0, y una edición vencida se
   anunciaba como que cerraba hoy. Al poner fechas a mano esto se nota, y
   una cuenta regresiva en la que no se puede confiar no sirve de nada. */
function redDiasParaCierre(fechaISO) {
  if (!fechaISO) return null;
  const cierre = new Date(fechaISO + 'T00:00:00');
  const ahora  = new Date();
  const hoy    = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  // Redondeo, no truncado: un día con cambio de horario dura 23 o 25 horas
  return Math.round((cierre - hoy) / 86400000);
}

/* 'AAAA-MM-DD' → «15 de agosto de 2026» */
function redFechaLarga(fechaISO) {
  if (!fechaISO) return '';
  return new Date(fechaISO + 'T12:00:00')
    .toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* Hace cuánto se tiró una nota a la papelera */
function redHaceCuanto(iso) {
  if (!iso) return 'hace un rato';
  const dias = Math.floor((new Date() - new Date(iso)) / 86400000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 30)  return `hace ${dias} días`;
  return `el ${new Date(iso).toLocaleDateString('es')}`;
}

/* De dónde salió una nota: su edición, o el banco de ideas */
function redNombreDestino(edicionId) {
  if (!edicionId) return '🗃️ Banco de ideas';
  const ed = _redEdiciones.find(e => e.id === edicionId);
  return ed ? `📰 ${ed.titulo}` : '📰 edición eliminada';
}

/* ── Reintentos offline: cambios que no llegaron a Supabase ── */

function redPendingLoad() {
  try { return JSON.parse(localStorage.getItem(RED_PENDING_KEY)) || {}; } catch (_) { return {}; }
}
function redPendingSave(map) {
  try { localStorage.setItem(RED_PENDING_KEY, JSON.stringify(map)); } catch (_) {}
}

async function redFlushPending() {
  if (!_sb) return;
  const map = redPendingLoad();
  const ids = Object.keys(map);
  if (!ids.length) return;
  for (const id of ids) {
    const { error } = await _sb.from(RED_T_NOTAS).update(map[id]).eq('id', id);
    if (!error) delete map[id];
  }
  redPendingSave(map);
}

/* ── Carga de datos ── */

async function initRedaccion() {
  const list = document.getElementById('red-list');
  if (!list) return;

  if (!_sb) {
    list.innerHTML = '<div class="fin-empty">No se pudo conectar con Redacción.</div>';
    return;
  }

  await redFlushPending();

  const [ed, no, cf, pap] = await Promise.all([
    _sb.from(RED_T_EDICIONES).select('*').order('numero', { ascending: false }),
    _sb.from(RED_T_NOTAS).select('*').order('actualizado_at', { ascending: false }),
    _sb.from(RED_T_CONFIG).select('*'),
    // Sonda: si la columna 'eliminada' no existe todavía, esta consulta falla
    // y la papelera se queda escondida en vez de romper la herramienta entera.
    _sb.from(RED_T_NOTAS).select('id').eq('eliminada', true).limit(1),
  ]);

  _redPapelera = !pap.error;

  // La config es opcional: si su tabla aún no existe, se sigue sin personalizados
  if (!cf.error && cf.data) {
    cf.data.forEach(row => {
      if (Array.isArray(row.valor)) _redConfig[row.clave] = row.valor;
    });
  }

  if (ed.error || no.error) {
    console.error('[Redacción] Error cargando:', ed.error || no.error);
    list.innerHTML = '<div class="fin-empty">No se pudieron cargar los datos.<br>¿Ya ejecutaste el SQL de Redacción en Supabase?</div>';
    return;
  }

  _redEdiciones = ed.data || [];
  _redNotas     = no.data || [];
  _redLoaded    = true;

  // Selección inicial: la edición abierta más reciente, o el banco de ideas
  if (_redEdicion === null) {
    const abierta = _redEdiciones.find(e => !e.archivada);
    _redEdicion = abierta ? abierta.id : 'banco';
  }
  // La edición elegida puede haber desaparecido (la borró otro aparato), y la
  // papelera puede no existir en esta base: en ambos casos, volver a algo real.
  if (typeof _redEdicion === 'number' && !_redEdiciones.some(e => e.id === _redEdicion)) {
    const abierta = _redEdiciones.find(e => !e.archivada);
    _redEdicion = abierta ? abierta.id : 'banco';
  }
  if (_redEdicion === 'papelera' && !_redPapelera) _redEdicion = 'banco';

  redRender();
}

/* ── Vista principal ── */

function redEdicionActual() {
  return _redEdiciones.find(e => e.id === _redEdicion) || null;
}

/* Las notas de la papelera no cuentan para nada más: ni listas, ni
   contadores, ni exportación. Siguen en la base, pero apartadas. */
function redNotasVivas() {
  return _redNotas.filter(n => !n.eliminada);
}

function redNotasPapelera() {
  return _redNotas.filter(n => n.eliminada)
    .sort((a, b) => String(b.eliminada_at || '').localeCompare(String(a.eliminada_at || '')));
}

function redNotasDeEdicion() {
  if (_redEdicion === 'papelera') return redNotasPapelera();
  const vivas = redNotasVivas();
  if (_redEdicion === 'banco') return vivas.filter(n => !n.edicion_id);
  return vivas.filter(n => n.edicion_id === _redEdicion);
}

function redRender() {
  redRenderCabecera();
  redRenderChips();
  redRenderPortada();
  redRenderAcciones();
  redRenderNotas();
}

/* Los botones de la vista principal cambian dentro de la papelera:
   ahí no se escriben notas nuevas ni se exporta, se vacía. */
function redRenderAcciones() {
  const enPapelera = _redEdicion === 'papelera';
  const nueva  = document.getElementById('red-nueva-nota-btn');
  const expo   = document.getElementById('red-exportar-btn');
  const vaciar = document.getElementById('red-vaciar-papelera-btn');
  if (nueva)  nueva.style.display  = enPapelera ? 'none' : '';
  if (expo)   expo.style.display   = enPapelera ? 'none' : '';
  if (vaciar) vaciar.style.display = (enPapelera && redNotasPapelera().length) ? '' : 'none';
}

/* Bloque "Titulares de portada" de la edición seleccionada */
function redRenderPortada() {
  const el = document.getElementById('red-portada-card');
  if (!el) return;
  const notas = redNotasDeEdicion().filter(n => n.en_portada);
  if (!notas.length || _redEdicion === 'banco' || _redEdicion === 'papelera') {
    el.style.display = 'none'; return;
  }
  el.style.display = 'block';
  el.innerHTML = '<div class="red-portada-head"><i class="fa-solid fa-star"></i> Titulares de portada</div>' +
    notas.map(n => `
      <div class="red-portada-item">
        <span class="red-portada-titulo">${n.titulo ? redEsc(n.titulo) : '<em>Sin título</em>'}</span>
        <span class="red-portada-sec">${redEsc(n.seccion)}</span>
      </div>`).join('');
}

function redRenderCabecera() {
  const tituloEl = document.getElementById('red-ed-titulo');
  const metaEl   = document.getElementById('red-ed-meta');
  const editarEl = document.getElementById('red-ed-editar-btn');
  if (!tituloEl) return;

  // El lápiz solo tiene sentido sobre una edición de verdad
  if (editarEl) editarEl.style.display = (typeof _redEdicion === 'number') ? '' : 'none';

  if (_redEdicion === 'papelera') {
    const n = redNotasPapelera().length;
    tituloEl.textContent = '🗑️ Papelera';
    metaEl.textContent = n
      ? `${n} nota${n === 1 ? '' : 's'} eliminada${n === 1 ? '' : 's'} · se pueden restaurar`
      : 'Vacía. Aquí espera lo que borres, por si fue sin querer.';
    return;
  }
  if (_redEdicion === 'banco') {
    tituloEl.textContent = '🗃️ Banco de ideas';
    metaEl.textContent = 'Notas sin edición asignada: material para futuras revistas.';
    return;
  }
  const ed = redEdicionActual();
  if (!ed) { tituloEl.textContent = ''; metaEl.textContent = ''; return; }

  tituloEl.textContent = `📰 ${ed.titulo}`;
  const notas  = redNotasDeEdicion();
  const listas = notas.filter(n => n.estado === 'listo').length;
  const dias   = redDiasParaCierre(ed.fecha_cierre);
  let meta = `${listas}/${notas.length} notas listas`;
  if (ed.archivada) meta += ' · 📦 Archivada';
  else if (dias !== null) {
    meta += dias >= 0
      ? ` · ⏳ ${dias === 0 ? '¡Cierra HOY!' : `${dias} día${dias === 1 ? '' : 's'} para el cierre`}`
      : ` · ⚠️ Cierre vencido hace ${-dias} día${dias === -1 ? '' : 's'}`;
  }
  metaEl.textContent = meta;
}

function redRenderChips() {
  const wrap = document.getElementById('red-ed-chips');
  if (!wrap) return;
  const chips = _redEdiciones.map(e => `
    <button type="button" class="red-ed-chip ${_redEdicion === e.id ? 'red-ed-chip-active' : ''}" data-ed="${e.id}">
      Nº ${String(e.numero).padStart(2, '0')}${e.archivada ? ' 📦' : ''}
    </button>`).join('');

  // La papelera va DELANTE de todo y solo cuando guarda algo. Esta fila se
  // desplaza de lado, y al final del todo el chip quedaba fuera de la
  // pantalla: justo donde no lo encuentra quien acaba de borrar sin querer.
  // Vacía no estorba, porque no hay nada que recuperar.
  const cuantas  = redNotasPapelera().length;
  const papelera = (_redPapelera && (cuantas || _redEdicion === 'papelera')) ? `
    <button type="button" class="red-ed-chip red-ed-chip-papelera ${_redEdicion === 'papelera' ? 'red-ed-chip-active' : ''}" data-ed="papelera">
      🗑️ Papelera${cuantas ? ` · ${cuantas}` : ''}
    </button>` : '';

  wrap.innerHTML = papelera + chips + `
    <button type="button" class="red-ed-chip ${_redEdicion === 'banco' ? 'red-ed-chip-active' : ''}" data-ed="banco">
      🗃️ Banco
    </button>
    <button type="button" class="red-ed-chip red-ed-chip-new" data-ed="nueva">
      <i class="fa-solid fa-plus"></i> Edición
    </button>`;
  wrap.querySelectorAll('.red-ed-chip').forEach(btn => btn.addEventListener('click', () => {
    const val = btn.dataset.ed;
    if (val === 'nueva') { redOpenEdicionModal(); return; }
    if (val === 'banco' || val === 'papelera') { _redEdicion = val; redRender(); return; }
    const id = Number(val);
    // Tocar la edición que ya está abierta la manda a editar: es el atajo
    // para corregir el número o la fecha sin buscar el lápiz.
    if (_redEdicion === id) { redOpenEdicionModal(id); return; }
    _redEdicion = id;
    redRender();
  }));
}

function redRenderNotas() {
  const list    = document.getElementById('red-list');
  const emptyEl = document.getElementById('red-empty');
  if (!list) return;

  if (_redEdicion === 'papelera') {
    if (emptyEl) emptyEl.style.display = 'none';
    redRenderPapelera(list);
    return;
  }

  const notas = redNotasDeEdicion();
  if (emptyEl) emptyEl.style.display = notas.length ? 'none' : 'block';

  // Agrupar por sección, en el orden editorial de la revista
  const orden = redSeccionesAll();
  notas.forEach(n => { if (!orden.includes(n.seccion)) orden.push(n.seccion); });

  list.innerHTML = orden.map(sec => {
    const deSec = notas.filter(n => n.seccion === sec);
    if (!deSec.length) return '';
    const filas = deSec.map(n => {
      const est = redEstadoInfo(n.estado);
      const pal = redPalabras(n.cuerpo);
      const lim = redEstadoLimite(pal, n.limite_amarillo, n.limite_rojo);
      return `
      <button type="button" class="red-nota" data-nota="${n.id}">
        <div class="red-nota-main">
          <span class="red-nota-titulo">${n.titulo ? redEsc(n.titulo) : '<em class="red-sin-titulo">Sin título</em>'}</span>
          <div class="red-nota-meta">
            ${n.en_portada ? '<span class="red-badge red-badge-portada">⭐ Portada</span>' : ''}
            <span class="red-badge ${est.cls}">${est.label}</span>
            <span class="red-badge red-badge-tipo">${redEsc(n.tipo)}</span>
            <span class="red-nota-autor">${redAutorInfo(n.autor)}</span>
            <span class="red-nota-pal ${lim ? `red-pal-${lim}` : ''}">${pal} palabra${pal === 1 ? '' : 's'}${lim === 'rojo' ? ' 🔴' : lim === 'amarillo' ? ' 🟡' : ''}</span>
          </div>
        </div>
        <i class="fa-solid fa-chevron-right red-nota-arrow"></i>
      </button>`;
    }).join('');
    return `<div class="red-seccion">
      <h3 class="red-seccion-title">${redEsc(sec)}</h3>
      ${filas}
    </div>`;
  }).join('');

  list.querySelectorAll('.red-nota').forEach(btn =>
    btn.addEventListener('click', () => redOpenEditor(Number(btn.dataset.nota))));
}

/* ── Papelera: lo borrado, entero, esperando ── */

function redRenderPapelera(list) {
  const notas = redNotasPapelera();

  if (!notas.length) {
    list.innerHTML = `
      <div class="fin-empty">La papelera está vacía. 🗑️<br>
      Aquí queda lo que borres, para poder devolverlo a su sitio.</div>`;
    return;
  }

  list.innerHTML = `
    <div class="red-papelera-aviso">
      Estas notas ya no salen en las ediciones ni en la exportación, pero
      siguen completas. <strong>Restaurar</strong> las devuelve al sitio del
      que salieron; <strong>Borrar</strong> las quita para siempre.
    </div>` +
    notas.map(n => {
      const pal = redPalabras(n.cuerpo);
      return `
      <div class="red-papelera-nota">
        <button type="button" class="red-papelera-main" data-nota="${n.id}">
          <span class="red-nota-titulo">${n.titulo ? redEsc(n.titulo) : '<em class="red-sin-titulo">Sin título</em>'}</span>
          <div class="red-nota-meta">
            <span class="red-badge red-badge-tipo">${redEsc(n.tipo)}</span>
            <span class="red-nota-autor">${redAutorInfo(n.autor)}</span>
            <span class="red-nota-pal">${pal} palabra${pal === 1 ? '' : 's'}</span>
          </div>
          <div class="red-nota-meta">
            <span class="red-papelera-fecha">🗑️ Borrada ${redHaceCuanto(n.eliminada_at)}</span>
            <span class="red-nota-autor">volvería a ${redEsc(redNombreDestino(n.edicion_id))}</span>
          </div>
        </button>
        <div class="red-papelera-btns">
          <button type="button" class="red-papelera-btn red-papelera-restaurar" data-restaurar="${n.id}">
            <i class="fa-solid fa-rotate-left"></i> Restaurar
          </button>
          <button type="button" class="red-papelera-btn red-papelera-borrar" data-borrar="${n.id}">
            <i class="fa-solid fa-trash"></i> Borrar
          </button>
        </div>
      </div>`;
    }).join('');

  // Tocar la nota la abre en el editor: para leerla antes de decidir
  list.querySelectorAll('.red-papelera-main').forEach(btn =>
    btn.addEventListener('click', () => redOpenEditor(Number(btn.dataset.nota))));

  list.querySelectorAll('[data-restaurar]').forEach(btn =>
    btn.addEventListener('click', async () => {
      if (await redRestaurarNota(Number(btn.dataset.restaurar))) redRender();
    }));

  list.querySelectorAll('[data-borrar]').forEach(btn =>
    btn.addEventListener('click', () => {
      const n = _redNotas.find(x => x.id === Number(btn.dataset.borrar));
      if (!n) return;
      const nombre = n.titulo || 'Sin título';
      if (!confirm(`¿Borrar «${nombre}» para siempre?\n\nEsto ya no se puede deshacer: la nota desaparece de la base de datos.`)) return;
      redBorrarDefinitivo(n.id, false);
    }));
}

async function redRestaurarNota(id) {
  const n = _redNotas.find(x => x.id === id);
  if (!n || !_sb) return false;
  const campos = { eliminada: false, eliminada_at: null };
  const { error } = await _sb.from(RED_T_NOTAS).update(campos).eq('id', id);
  if (error) {
    console.error('[Redacción] Error restaurando:', error);
    if (typeof toast === 'function') toast('No se pudo restaurar');
    return false;
  }
  Object.assign(n, campos);
  if (typeof toast === 'function') toast(`↩️ Restaurada en ${redNombreDestino(n.edicion_id)}`);
  return true;
}

async function redBorrarDefinitivo(id, desdeEditor) {
  if (!_sb) return false;
  const { error } = await _sb.from(RED_T_NOTAS).delete().eq('id', id);
  if (error) {
    console.error('[Redacción] Error eliminando:', error);
    if (typeof toast === 'function') toast('No se pudo eliminar');
    return false;
  }
  _redNotas = _redNotas.filter(x => x.id !== id);
  const map = redPendingLoad();
  if (map[id]) { delete map[id]; redPendingSave(map); }
  if (desdeEditor) {
    _redNotaId = null;
    switchView('view-redaccion');
  }
  redRender();
  if (typeof toast === 'function') toast('Nota eliminada');
  return true;
}

async function redVaciarPapelera() {
  const notas = redNotasPapelera();
  if (!notas.length || !_sb) return;
  if (!confirm(`¿Vaciar la papelera?\n\nSe borran ${notas.length} nota${notas.length === 1 ? '' : 's'} para siempre. Esto no se puede deshacer.`)) return;

  const ids = notas.map(n => n.id);
  const { error } = await _sb.from(RED_T_NOTAS).delete().in('id', ids);
  if (error) {
    console.error('[Redacción] Error vaciando la papelera:', error);
    if (typeof toast === 'function') toast('No se pudo vaciar la papelera');
    return;
  }
  _redNotas = _redNotas.filter(n => !ids.includes(n.id));
  const map = redPendingLoad();
  ids.forEach(id => { delete map[id]; });
  redPendingSave(map);
  redRender();
  if (typeof toast === 'function') toast('🗑️ Papelera vacía');
}

/* ── Crear y editar ediciones ── */

/* El mismo modal sirve para crear y para editar: con id, edita esa
   edición; sin id, propone la siguiente de la quincena en curso. */
function redOpenEdicionModal(id) {
  const overlay = document.getElementById('red-ed-modal-overlay');
  if (!overlay) return;

  const ed = (id !== undefined && id !== null) ? _redEdiciones.find(e => e.id === id) : null;
  _redEdEditando = ed ? ed.id : null;

  const tituloEl  = document.getElementById('red-ed-modal-title');
  const guardarEl = document.getElementById('red-ed-crear-btn');
  const borrarEl  = document.getElementById('red-ed-eliminar-btn');
  const archivaEl = document.getElementById('red-ed-archivar-btn');

  if (ed) {
    tituloEl.innerHTML = '<i class="fa-solid fa-pen" style="color:#4f46e5;"></i> Editar edición';
    document.getElementById('red-ed-num').value    = ed.numero;
    document.getElementById('red-ed-nombre').value = ed.titulo || '';
    document.getElementById('red-ed-cierre').value = ed.fecha_cierre || '';
    archivaEl.classList.toggle('red-ed-archivada-on', !!ed.archivada);
    guardarEl.innerHTML = '<i class="fa-solid fa-check"></i> Guardar cambios';
    borrarEl.style.display  = '';
    archivaEl.style.display = '';
  } else {
    const q   = redQuincenaActual();
    const num = _redEdiciones.length ? Math.max(..._redEdiciones.map(e => e.numero)) + 1 : 1;
    tituloEl.innerHTML = '<i class="fa-solid fa-newspaper" style="color:#4f46e5;"></i> Nueva edición';
    document.getElementById('red-ed-num').value    = num;
    document.getElementById('red-ed-nombre').value = `Nº ${String(num).padStart(2, '0')} · ${q.label}`;
    document.getElementById('red-ed-cierre').value = redFechaISO(q.cierre);
    archivaEl.classList.remove('red-ed-archivada-on');
    guardarEl.innerHTML = '<i class="fa-solid fa-newspaper"></i> Crear edición';
    borrarEl.style.display  = 'none';
    archivaEl.style.display = 'none';
  }

  redUpdateArchivarBtn();
  redUpdateCierreHint();
  overlay.style.display = 'flex';
}

function redCloseEdicionModal() {
  const overlay = document.getElementById('red-ed-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  _redEdEditando = null;
}

function redUpdateArchivarBtn() {
  const btn = document.getElementById('red-ed-archivar-btn');
  if (!btn) return;
  const on = btn.classList.contains('red-ed-archivada-on');
  btn.innerHTML = on
    ? '<i class="fa-solid fa-box-archive"></i> Archivada: cerrada, ya no se trabaja en ella'
    : '<i class="fa-regular fa-folder-open"></i> Abierta: se sigue trabajando en ella';
}

/* Debajo de la fecha, en cristiano: cuánto queda o cuánto hace que pasó */
function redUpdateCierreHint() {
  const el = document.getElementById('red-ed-cierre-hint');
  if (!el) return;
  const valor = document.getElementById('red-ed-cierre').value;
  if (!valor) {
    el.textContent = 'Sin fecha: la edición no llevará cuenta regresiva.';
    el.className = 'red-ed-cierre-hint';
    return;
  }
  const dias = redDiasParaCierre(valor);
  const fecha = redFechaLarga(valor);
  if (dias < 0) {
    el.textContent = `⚠️ El ${fecha} ya pasó, hace ${-dias} día${dias === -1 ? '' : 's'}.`;
    el.className = 'red-ed-cierre-hint red-cierre-vencido';
  } else if (dias === 0) {
    el.textContent = `⏳ Cierra hoy, ${fecha}.`;
    el.className = 'red-ed-cierre-hint red-cierre-hoy';
  } else {
    el.textContent = `⏳ ${fecha}: quedarían ${dias} día${dias === 1 ? '' : 's'}.`;
    el.className = 'red-ed-cierre-hint';
  }
}

/* Los botoncitos ±días mueven la fecha sin pelearse con el calendario.
   El mediodía evita que un cambio de horario robe o regale un día. */
function redMoverCierre(dias) {
  const inp = document.getElementById('red-ed-cierre');
  if (!inp) return;
  const base = inp.value ? new Date(inp.value + 'T12:00:00') : new Date();
  base.setDate(base.getDate() + dias);
  inp.value = redFechaISO(base);
  redUpdateCierreHint();
}

async function redGuardarEdicion() {
  if (!_sb) return;
  const numero = Number(document.getElementById('red-ed-num').value) || 1;
  const titulo = (document.getElementById('red-ed-nombre').value || '').trim() || `Nº ${numero}`;
  const cierre = document.getElementById('red-ed-cierre').value || null;

  // Dos ediciones con el mismo número se ven idénticas en los chips y
  // no hay forma de saber cuál es cuál: mejor avisar antes de guardar.
  const repetida = _redEdiciones.find(e => e.numero === numero && e.id !== _redEdEditando);
  if (repetida && !confirm(`Ya hay otra edición con el Nº ${numero} («${repetida.titulo}»).\n\n¿Guardar de todos modos?`)) return;

  if (_redEdEditando === null) {
    const { data, error } = await _sb.from(RED_T_EDICIONES)
      .insert({ numero, titulo, fecha_cierre: cierre })
      .select().single();
    if (error) {
      console.error('[Redacción] Error creando edición:', error);
      if (typeof toast === 'function') toast('No se pudo crear la edición');
      return;
    }
    redCloseEdicionModal();
    _redEdiciones.unshift(data);
    _redEdiciones.sort((a, b) => b.numero - a.numero);
    _redEdicion = data.id;
    redRender();
    if (typeof toast === 'function') toast(`📰 ${titulo} creada`);
    return;
  }

  const archivada = document.getElementById('red-ed-archivar-btn')
    .classList.contains('red-ed-archivada-on');
  const campos = { numero, titulo, fecha_cierre: cierre, archivada };
  const { error } = await _sb.from(RED_T_EDICIONES).update(campos).eq('id', _redEdEditando);
  if (error) {
    console.error('[Redacción] Error guardando la edición:', error);
    if (typeof toast === 'function') toast('No se pudieron guardar los cambios');
    return;
  }
  const ed = _redEdiciones.find(e => e.id === _redEdEditando);
  if (ed) Object.assign(ed, campos);
  _redEdiciones.sort((a, b) => b.numero - a.numero);
  redCloseEdicionModal();
  redRender();
  if (typeof toast === 'function') toast('✅ Edición actualizada');
}

async function redEliminarEdicion() {
  if (_redEdEditando === null || !_sb) return;
  const ed = _redEdiciones.find(e => e.id === _redEdEditando);
  if (!ed) return;

  const suyas = _redNotas.filter(n => n.edicion_id === ed.id && !n.eliminada).length;
  const aviso = suyas
    ? `\n\nSus ${suyas} nota${suyas === 1 ? '' : 's'} NO se borra${suyas === 1 ? '' : 'n'}: pasa${suyas === 1 ? '' : 'n'} al 🗃️ Banco de ideas.`
    : '';
  if (!confirm(`¿Eliminar la edición «${ed.titulo}»?${aviso}`)) return;

  // Las notas se sueltan a mano antes de borrar la edición: así no depende
  // de cómo esté configurada la llave foránea en esta base.
  const soltar = await _sb.from(RED_T_NOTAS).update({ edicion_id: null }).eq('edicion_id', ed.id);
  if (soltar.error) {
    console.error('[Redacción] Error soltando las notas:', soltar.error);
    if (typeof toast === 'function') toast('No se pudo eliminar la edición');
    return;
  }
  const { error } = await _sb.from(RED_T_EDICIONES).delete().eq('id', ed.id);
  if (error) {
    console.error('[Redacción] Error eliminando la edición:', error);
    if (typeof toast === 'function') toast('No se pudo eliminar la edición');
    return;
  }

  _redEdiciones = _redEdiciones.filter(e => e.id !== ed.id);
  _redNotas.forEach(n => { if (n.edicion_id === ed.id) n.edicion_id = null; });
  if (_redEdicion === ed.id) {
    const abierta = _redEdiciones.find(e => !e.archivada);
    _redEdicion = abierta ? abierta.id : 'banco';
  }
  redCloseEdicionModal();
  redRender();
  if (typeof toast === 'function') {
    toast(suyas ? '🗑️ Edición eliminada · sus notas están en el Banco' : '🗑️ Edición eliminada');
  }
}

/* ── Nueva nota ── */

async function redNuevaNota() {
  if (!_sb) return;
  if (_redEdicion === 'papelera') return;  // en la papelera no se escribe
  const fila = {
    edicion_id: typeof _redEdicion === 'number' ? _redEdicion : null,
    autor: redMiembro(),
    seccion: 'ACTUALIDAD',
    tipo: 'Artículo',
    estado: 'idea',
  };
  const { data, error } = await _sb.from(RED_T_NOTAS).insert(fila).select().single();
  if (error) {
    console.error('[Redacción] Error creando nota:', error);
    if (typeof toast === 'function') toast('No se pudo crear la nota');
    return;
  }
  _redNotas.unshift(data);
  redOpenEditor(data.id);
}

/* ── Editor ── */

function redNota() {
  return _redNotas.find(n => n.id === _redNotaId) || null;
}

function redOpenEditor(id) {
  _redNotaId = id;
  const n = redNota();
  if (!n) return;

  document.getElementById('red-e-titulo').value     = n.titulo || '';
  document.getElementById('red-e-entradilla').value = n.entradilla || '';

  // Notas viejas guardadas como texto plano: convertir saltos de línea a <br>
  const cuerpo = n.cuerpo || '';
  document.getElementById('red-e-cuerpo').innerHTML = cuerpo.includes('<')
    ? cuerpo
    : redEsc(cuerpo).replace(/\n/g, '<br>');

  document.getElementById('red-e-lim-amarillo').value = n.limite_amarillo || '';
  document.getElementById('red-e-lim-rojo').value     = n.limite_rojo || '';

  // Selects: sección, tipo, estado, edición
  const secSel = document.getElementById('red-e-seccion');
  const secciones = redSeccionesAll();
  if (!secciones.includes(n.seccion)) secciones.unshift(n.seccion);
  secSel.innerHTML = secciones.map(s =>
    `<option value="${redEsc(s)}" ${s === n.seccion ? 'selected' : ''}>${redEsc(s)}</option>`).join('') +
    `<option value="${RED_NUEVA_SECCION}">➕ Nueva sección…</option>`;

  const tipoSel = document.getElementById('red-e-tipo');
  const tipos = redTiposAll();
  if (!tipos.includes(n.tipo)) tipos.unshift(n.tipo);
  tipoSel.innerHTML = tipos.map(t =>
    `<option value="${redEsc(t)}" ${t === n.tipo ? 'selected' : ''}>${redEsc(t)}</option>`).join('') +
    `<option value="${RED_NUEVO_TIPO}">➕ Nuevo tipo…</option>`;

  const estSel = document.getElementById('red-e-estado');
  estSel.innerHTML = RED_ESTADOS.map(e =>
    `<option value="${e.id}" ${e.id === n.estado ? 'selected' : ''}>${e.label}</option>`).join('');

  const edSel = document.getElementById('red-e-edicion');
  edSel.innerHTML = `<option value="" ${!n.edicion_id ? 'selected' : ''}>🗃️ Banco de ideas</option>` +
    _redEdiciones.map(e =>
      `<option value="${e.id}" ${e.id === n.edicion_id ? 'selected' : ''}>${redEsc(e.titulo)}</option>`).join('');

  // Toggle de portada
  const pBtn = document.getElementById('red-e-portada-btn');
  if (pBtn) pBtn.classList.toggle('red-portada-on', !!n.en_portada);
  redUpdatePortadaBtn();

  redUpdatePapeleraAviso();
  redUpdateContador();
  redSetSaveState('ok');
  switchView('view-redaccion-editor');
}

/* Si la nota abierta está en la papelera se dice claro, y el botón de
   eliminar deja de ser «a la papelera» para ser el definitivo. */
function redUpdatePapeleraAviso() {
  const n = redNota();
  const aviso   = document.getElementById('red-e-papelera-aviso');
  const detalle = document.getElementById('red-e-papelera-detalle');
  const borrar  = document.getElementById('red-e-eliminar-btn');
  const enPapelera = !!(n && n.eliminada);

  if (aviso) aviso.style.display = enPapelera ? 'flex' : 'none';
  if (enPapelera && detalle && n) {
    detalle.textContent = `Se borró ${redHaceCuanto(n.eliminada_at)} y sigue completa. ` +
      `Al restaurarla vuelve a ${redNombreDestino(n.edicion_id)}.`;
  }
  if (borrar) {
    borrar.innerHTML = enPapelera
      ? '<i class="fa-solid fa-trash"></i> Borrar para siempre'
      : '<i class="fa-solid fa-trash"></i> Eliminar';
  }
}

function redUpdatePortadaBtn() {
  const btn = document.getElementById('red-e-portada-btn');
  if (!btn) return;
  const on = btn.classList.contains('red-portada-on');
  btn.innerHTML = on
    ? '<i class="fa-solid fa-star"></i> En portada: su título saldrá en los titulares'
    : '<i class="fa-regular fa-star"></i> Destacar en portada';
}

function redUpdateContador() {
  const el = document.getElementById('red-e-contador');
  if (!el) return;
  const html  = document.getElementById('red-e-cuerpo')?.innerHTML || '';
  const plano = redPlano(html);
  const pal   = redPalabras(html);
  const min   = Number(document.getElementById('red-e-lim-amarillo')?.value) || 0;
  const max   = Number(document.getElementById('red-e-lim-rojo')?.value) || 0;
  const lim   = redEstadoLimite(pal, min, max);

  let txt = `${pal} palabra${pal === 1 ? '' : 's'} · ${plano.length} caracteres`;
  if (lim === 'rojo')          txt += ` · 🔴 Sobran ${pal - max} (máx. ${max})`;
  else if (lim === 'amarillo') txt += ` · 🟡 Faltan ${min - pal} para el mínimo (${min})`;
  else if (lim === 'ok')       txt += ' · ✅ Dentro del límite';
  el.textContent = txt;
  el.className = `red-e-contador${lim ? ` red-cont-${lim}` : ''}`;
}

function redSetSaveState(estado) {
  const el = document.getElementById('red-e-save-state');
  if (!el) return;
  if (estado === 'saving')      { el.textContent = 'Guardando…';   el.className = 'red-save-state red-save-saving'; }
  else if (estado === 'ok')     { el.textContent = 'Guardado ✓';   el.className = 'red-save-state red-save-ok'; }
  else                          { el.textContent = 'Sin conexión (se reintentará)'; el.className = 'red-save-state red-save-off'; }
}

function redCamposEditor() {
  const cuerpoEl = document.getElementById('red-e-cuerpo');
  return {
    titulo:     document.getElementById('red-e-titulo').value.trim(),
    entradilla: document.getElementById('red-e-entradilla').value.trim(),
    cuerpo:     redPlano(cuerpoEl.innerHTML).trim() ? cuerpoEl.innerHTML : '',
    limite_amarillo: Number(document.getElementById('red-e-lim-amarillo').value) || null,
    limite_rojo:     Number(document.getElementById('red-e-lim-rojo').value) || null,
    seccion: document.getElementById('red-e-seccion').value,
    tipo:    document.getElementById('red-e-tipo').value,
    estado:  document.getElementById('red-e-estado').value,
    edicion_id: document.getElementById('red-e-edicion').value
      ? Number(document.getElementById('red-e-edicion').value) : null,
    en_portada: document.getElementById('red-e-portada-btn')?.classList.contains('red-portada-on') || false,
    actualizado_at: new Date().toISOString(),
  };
}

function redQueueSave() {
  redSetSaveState('saving');
  redUpdateContador();
  clearTimeout(_redSaveTimer);
  _redSaveTimer = setTimeout(redSaveNow, 1200);
}

async function redSaveNow() {
  clearTimeout(_redSaveTimer);
  const n = redNota();
  if (!n) return;
  const campos = redCamposEditor();
  Object.assign(n, campos); // reflejo local inmediato

  let ok = false;
  if (_sb) {
    const { error } = await _sb.from(RED_T_NOTAS).update(campos).eq('id', n.id);
    ok = !error;
  }
  if (!ok) {
    // Guardar el cambio pendiente localmente; se reintenta al reconectar
    const map = redPendingLoad();
    map[n.id] = campos;
    redPendingSave(map);
    redSetSaveState('off');
  } else {
    redSetSaveState('ok');
  }
}

/* ── Mover nota a otra edición ── */

function redOpenMover() {
  const n = redNota();
  const list = document.getElementById('red-mover-list');
  if (!n || !list) return;

  const opciones = [
    { id: '', label: '🗃️ Banco de ideas' },
    ..._redEdiciones.map(e => ({ id: String(e.id), label: `📰 ${e.titulo}${e.archivada ? ' 📦' : ''}` })),
  ];
  list.innerHTML = opciones.map(o => {
    const actual = (o.id === '' && !n.edicion_id) || Number(o.id) === n.edicion_id;
    return `<button type="button" class="red-mover-item ${actual ? 'red-mover-actual' : ''}"
      data-ed="${o.id}" ${actual ? 'disabled' : ''}>
      ${redEsc(o.label)}${actual ? ' <span class="red-mover-tag">actual</span>' : ''}
    </button>`;
  }).join('');

  list.querySelectorAll('.red-mover-item:not([disabled])').forEach(btn =>
    btn.addEventListener('click', async () => {
      document.getElementById('red-e-edicion').value = btn.dataset.ed;
      await redSaveNow();
      redCloseMover();
      if (typeof toast === 'function') toast('📦 Nota movida');
    }));

  document.getElementById('red-mover-overlay').style.display = 'flex';
}

function redCloseMover() {
  const overlay = document.getElementById('red-mover-overlay');
  if (overlay) overlay.style.display = 'none';
}

/* Eliminar ya no borra: manda a la papelera, de donde se puede volver.
   Solo lo que ya está en la papelera se borra de verdad. */
async function redEliminarNota() {
  const n = redNota();
  if (!n || !_sb) return;

  if (n.eliminada) {
    if (!confirm(`¿Borrar «${n.titulo || 'Sin título'}» para siempre?\n\nEsto ya no se puede deshacer.`)) return;
    clearTimeout(_redSaveTimer);
    await redBorrarDefinitivo(n.id, true);
    return;
  }

  if (!_redPapelera) {
    // La base todavía no tiene la papelera: se avisa en vez de fingir red de seguridad
    if (!confirm('¿Eliminar esta nota?\n\n⚠️ La papelera aún no está activada en la base de datos (falta correr redaccion_papelera.sql), así que esta nota NO se podrá restaurar.')) return;
    clearTimeout(_redSaveTimer);
    await redBorrarDefinitivo(n.id, true);
    return;
  }

  if (!confirm('¿Mandar esta nota a la papelera?\n\nNo se borra: queda guardada y se puede restaurar desde el chip 🗑️ Papelera.')) return;

  // Que un autoguardado pendiente no llegue después y la pise
  clearTimeout(_redSaveTimer);
  const campos = { eliminada: true, eliminada_at: new Date().toISOString() };
  const { error } = await _sb.from(RED_T_NOTAS).update(campos).eq('id', n.id);
  if (error) {
    console.error('[Redacción] Error mandando a la papelera:', error);
    if (typeof toast === 'function') toast('No se pudo eliminar');
    return;
  }
  Object.assign(n, campos);
  _redNotaId = null;
  switchView('view-redaccion');
  redRender();
  if (typeof toast === 'function') toast('🗑️ En la papelera · se puede restaurar');
}

/* ── Exportar ── */

function redNotaMd(n) {
  const est = redEstadoInfo(n.estado);
  const entradilla = (n.entradilla || '').trim();
  return `### ${n.titulo || 'Sin título'}\n` +
    `*${n.tipo} · ${redAutorInfo(n.autor)} · ${est.label} · ${redPalabras(n.cuerpo)} palabras*\n\n` +
    (entradilla ? `**Entradilla:** ${entradilla}\n\n` : '') +
    `${redMdDesdeHtml(n.cuerpo || '').trim()}\n`;
}

function redEdicionMd() {
  const ed = redEdicionActual();
  const notas = redNotasDeEdicion();
  const titulo = _redEdicion === 'banco' ? 'Banco de ideas' : (ed ? ed.titulo : 'Edición');

  const orden = redSeccionesAll();
  notas.forEach(n => { if (!orden.includes(n.seccion)) orden.push(n.seccion); });

  let md = `# PolicastSapien · ${titulo}\n\n`;
  md += `*Exportado el ${new Date().toLocaleDateString('es')} desde F.A.R.O. · ${notas.length} notas*\n\n`;

  // Titulares elegidos para la portada, al inicio del documento
  const portada = notas.filter(n => n.en_portada);
  if (portada.length) {
    md += `\n## ⭐ PORTADA · Titulares\n\n`;
    portada.forEach(n => { md += `- ${n.titulo || 'Sin título'} *(${n.seccion})*\n`; });
    md += '\n';
  }
  orden.forEach(sec => {
    const deSec = notas.filter(n => n.seccion === sec);
    if (!deSec.length) return;
    md += `\n## ${sec}\n\n`;
    deSec.forEach(n => { md += redNotaMd(n) + '\n---\n\n'; });
  });
  return md;
}

async function redExportar() {
  if (!_redLoaded || _redEdicion === 'papelera') return;
  const notas = redNotasDeEdicion();
  if (!notas.length) { if (typeof toast === 'function') toast('No hay notas para exportar'); return; }

  const md = redEdicionMd();
  const ed = redEdicionActual();
  const nombre = _redEdicion === 'banco'
    ? 'policastsapien-banco-de-ideas.md'
    : `policastsapien-edicion-${String(ed ? ed.numero : 0).padStart(2, '0')}.md`;

  // 1) Portapapeles (para pegar directo en el programa de maquetación)
  try { await navigator.clipboard.writeText(md); } catch (_) {}

  // 2) Descarga del archivo .md
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);

  if (typeof toast === 'function') toast('📋 Copiado y descargado (.md)');
}

async function redCopiarNota() {
  const n = redNota();
  if (!n) return;
  await redSaveNow();
  try {
    await navigator.clipboard.writeText(redNotaMd(n));
    if (typeof toast === 'function') toast('📋 Nota copiada');
  } catch (_) {
    if (typeof toast === 'function') toast('No se pudo copiar');
  }
}

/* ── Wiring ── */

document.addEventListener('DOMContentLoaded', () => {

  // Navegación
  document.getElementById('goto-redaccion-btn')?.addEventListener('click', () => switchView('view-redaccion'));
  document.getElementById('redaccion-back-btn')?.addEventListener('click', () => switchView('view-inicio'));
  document.getElementById('red-editor-back-btn')?.addEventListener('click', async () => {
    await redSaveNow();
    switchView('view-redaccion');
    redRender();
  });

  // Acciones de la vista principal
  document.getElementById('red-nueva-nota-btn')?.addEventListener('click', redNuevaNota);
  document.getElementById('red-exportar-btn')?.addEventListener('click', redExportar);
  document.getElementById('red-vaciar-papelera-btn')?.addEventListener('click', redVaciarPapelera);

  // Lápiz de la cabecera: edita la edición que se está viendo
  document.getElementById('red-ed-editar-btn')?.addEventListener('click', () => {
    if (typeof _redEdicion === 'number') redOpenEdicionModal(_redEdicion);
  });

  // Modal de edición (crear y editar)
  document.getElementById('red-ed-modal-close')?.addEventListener('click', redCloseEdicionModal);
  document.getElementById('red-ed-modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'red-ed-modal-overlay') redCloseEdicionModal();
  });
  document.getElementById('red-ed-crear-btn')?.addEventListener('click', redGuardarEdicion);
  document.getElementById('red-ed-eliminar-btn')?.addEventListener('click', redEliminarEdicion);
  document.getElementById('red-ed-cierre')?.addEventListener('change', redUpdateCierreHint);
  document.getElementById('red-ed-cierre')?.addEventListener('input', redUpdateCierreHint);
  document.querySelectorAll('.red-ed-fecha-chip').forEach(btn =>
    btn.addEventListener('click', () => redMoverCierre(Number(btn.dataset.dias))));
  document.getElementById('red-ed-archivar-btn')?.addEventListener('click', () => {
    document.getElementById('red-ed-archivar-btn').classList.toggle('red-ed-archivada-on');
    redUpdateArchivarBtn();
  });

  // Editor: autoguardado
  ['red-e-titulo', 'red-e-entradilla', 'red-e-cuerpo',
   'red-e-lim-amarillo', 'red-e-lim-rojo'].forEach(id =>
    document.getElementById(id)?.addEventListener('input', redQueueSave));
  ['red-e-estado', 'red-e-edicion'].forEach(id =>
    document.getElementById(id)?.addEventListener('change', redQueueSave));

  // Barra de formato del cuerpo
  const cuerpoEl = document.getElementById('red-e-cuerpo');
  document.querySelectorAll('#red-e-toolbar .red-tb-btn').forEach(btn => {
    // mousedown en vez de click: no roba el foco (ni la selección) del editor
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      document.execCommand(btn.dataset.cmd, false, null);
      redQueueSave();
    });
  });
  const aplicarFormato = (selId, cmd) => {
    const sel = document.getElementById(selId);
    sel?.addEventListener('change', () => {
      if (!sel.value) return;
      cuerpoEl?.focus();
      document.execCommand(cmd, false, sel.value);
      sel.value = ''; // el select actúa como menú: vuelve a su etiqueta
      redQueueSave();
    });
  };
  aplicarFormato('red-e-fuente', 'fontName');
  aplicarFormato('red-e-tamano', 'fontSize');

  // Pegar siempre como texto plano (evita arrastrar estilos de otras apps)
  cuerpoEl?.addEventListener('paste', e => {
    e.preventDefault();
    const txt = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, txt);
  });
  // Al borrar todo suele quedar un <br> suelto: limpiarlo para que vuelva el placeholder
  cuerpoEl?.addEventListener('input', () => {
    if (!cuerpoEl.textContent && cuerpoEl.innerHTML !== '') cuerpoEl.innerHTML = '';
  });

  // Sección y tipo: la última opción del select permite crear uno nuevo
  const nuevoEnSelect = (selId, marker, configKey, promptTxt, mayusculas) => {
    const sel = document.getElementById(selId);
    sel?.addEventListener('change', () => {
      if (sel.value !== marker) { redQueueSave(); return; }
      const n = redNota();
      const previo = n ? (configKey === 'secciones' ? n.seccion : n.tipo) : sel.options[0].value;
      let nombre = (prompt(promptTxt) || '').trim();
      if (!nombre) { sel.value = previo; return; }
      if (mayusculas) nombre = nombre.toUpperCase();
      if (!_redConfig[configKey].includes(nombre) &&
          !(configKey === 'secciones' ? RED_SECCIONES : RED_TIPOS).includes(nombre)) {
        _redConfig[configKey].push(nombre);
        redGuardarConfig(configKey);
      }
      // Insertar la opción (si no existe) y seleccionarla
      if (![...sel.options].some(o => o.value === nombre)) {
        const opt = document.createElement('option');
        opt.value = nombre; opt.textContent = nombre;
        sel.insertBefore(opt, sel.querySelector(`option[value="${marker}"]`));
      }
      sel.value = nombre;
      redQueueSave();
    });
  };
  nuevoEnSelect('red-e-seccion', RED_NUEVA_SECCION, 'secciones',
    'Nombre de la nueva sección (ej: EN HOMBROS DE GIGANTES):', true);
  nuevoEnSelect('red-e-tipo', RED_NUEVO_TIPO, 'tipos',
    'Nombre del nuevo tipo de nota (ej: Crónica):', false);

  // Toggle de portada
  document.getElementById('red-e-portada-btn')?.addEventListener('click', () => {
    document.getElementById('red-e-portada-btn').classList.toggle('red-portada-on');
    redUpdatePortadaBtn();
    redQueueSave();
  });

  // Mover nota a otra edición
  document.getElementById('red-e-mover-btn')?.addEventListener('click', redOpenMover);
  document.getElementById('red-mover-close')?.addEventListener('click', redCloseMover);
  document.getElementById('red-mover-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'red-mover-overlay') redCloseMover();
  });

  document.getElementById('red-e-copiar-btn')?.addEventListener('click', redCopiarNota);
  document.getElementById('red-e-eliminar-btn')?.addEventListener('click', redEliminarNota);

  // Restaurar desde el propio editor, con la nota delante
  document.getElementById('red-e-restaurar-btn')?.addEventListener('click', async () => {
    const n = redNota();
    if (!n) return;
    if (await redRestaurarNota(n.id)) redUpdatePapeleraAviso();
  });

  // Reintentar guardados pendientes al recuperar conexión
  window.addEventListener('online', redFlushPending);
});
