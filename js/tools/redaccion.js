'use strict';

/* ─────────────────────────────────────────────
   REDACCIÓN 📰 — sala de redacción de la revista
   PolicastSapien (quincenal).
   Ediciones → notas (sección, tipo, estado, autor)
   → editor con autoguardado → exportar a Markdown
   para maquetar la revista en otro programa.
   Datos compartidos en Supabase (cada nota registra su autor).
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
let _redNotas     = [];      // todas las notas
let _redConfig    = { secciones: [], tipos: [] };  // personalizados (compartidos)
let _redEdicion   = null;    // id de la edición seleccionada; 'banco' = sin edición
let _redNotaId    = null;    // nota abierta en el editor
let _redSaveTimer = null;
let _redLoaded    = false;

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

function redPalabras(txt) {
  const t = (txt || '').trim();
  return t ? t.split(/\s+/).length : 0;
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

function redDiasParaCierre(fechaISO) {
  if (!fechaISO) return null;
  const cierre = new Date(fechaISO + 'T23:59:59');
  return Math.ceil((cierre - new Date()) / 86400000);
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

  const [ed, no, cf] = await Promise.all([
    _sb.from(RED_T_EDICIONES).select('*').order('numero', { ascending: false }),
    _sb.from(RED_T_NOTAS).select('*').order('actualizado_at', { ascending: false }),
    _sb.from(RED_T_CONFIG).select('*'),
  ]);

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
  redRender();
}

/* ── Vista principal ── */

function redEdicionActual() {
  return _redEdiciones.find(e => e.id === _redEdicion) || null;
}

function redNotasDeEdicion() {
  if (_redEdicion === 'banco') return _redNotas.filter(n => !n.edicion_id);
  return _redNotas.filter(n => n.edicion_id === _redEdicion);
}

function redRender() {
  redRenderCabecera();
  redRenderChips();
  redRenderPortada();
  redRenderNotas();
}

/* Bloque "Titulares de portada" de la edición seleccionada */
function redRenderPortada() {
  const el = document.getElementById('red-portada-card');
  if (!el) return;
  const notas = redNotasDeEdicion().filter(n => n.en_portada);
  if (!notas.length || _redEdicion === 'banco') { el.style.display = 'none'; return; }
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
  if (!tituloEl) return;

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
  wrap.innerHTML = chips + `
    <button type="button" class="red-ed-chip ${_redEdicion === 'banco' ? 'red-ed-chip-active' : ''}" data-ed="banco">
      🗃️ Banco
    </button>
    <button type="button" class="red-ed-chip red-ed-chip-new" data-ed="nueva">
      <i class="fa-solid fa-plus"></i> Edición
    </button>`;
  wrap.querySelectorAll('.red-ed-chip').forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.ed === 'nueva') { redOpenEdicionModal(); return; }
    _redEdicion = btn.dataset.ed === 'banco' ? 'banco' : Number(btn.dataset.ed);
    redRender();
  }));
}

function redRenderNotas() {
  const list    = document.getElementById('red-list');
  const emptyEl = document.getElementById('red-empty');
  if (!list) return;

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
      return `
      <button type="button" class="red-nota" data-nota="${n.id}">
        <div class="red-nota-main">
          <span class="red-nota-titulo">${n.titulo ? redEsc(n.titulo) : '<em class="red-sin-titulo">Sin título</em>'}</span>
          <div class="red-nota-meta">
            ${n.en_portada ? '<span class="red-badge red-badge-portada">⭐ Portada</span>' : ''}
            <span class="red-badge ${est.cls}">${est.label}</span>
            <span class="red-badge red-badge-tipo">${redEsc(n.tipo)}</span>
            <span class="red-nota-autor">${redAutorInfo(n.autor)}</span>
            <span class="red-nota-pal">${pal} palabra${pal === 1 ? '' : 's'}</span>
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

/* ── Nueva edición ── */

function redOpenEdicionModal() {
  const overlay = document.getElementById('red-ed-modal-overlay');
  if (!overlay) return;
  const q   = redQuincenaActual();
  const num = _redEdiciones.length ? Math.max(..._redEdiciones.map(e => e.numero)) + 1 : 1;
  document.getElementById('red-ed-num').value    = num;
  document.getElementById('red-ed-nombre').value = `Nº ${String(num).padStart(2, '0')} · ${q.label}`;
  const c = q.cierre;
  document.getElementById('red-ed-cierre').value =
    `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, '0')}-${String(c.getDate()).padStart(2, '0')}`;
  overlay.style.display = 'flex';
}

function redCloseEdicionModal() {
  const overlay = document.getElementById('red-ed-modal-overlay');
  if (overlay) overlay.style.display = 'none';
}

async function redCrearEdicion() {
  if (!_sb) return;
  const numero = Number(document.getElementById('red-ed-num').value) || 1;
  const titulo = (document.getElementById('red-ed-nombre').value || '').trim() || `Nº ${numero}`;
  const cierre = document.getElementById('red-ed-cierre').value || null;
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
  _redEdicion = data.id;
  redRender();
  if (typeof toast === 'function') toast(`📰 ${titulo} creada`);
}

/* ── Nueva nota ── */

async function redNuevaNota() {
  if (!_sb) return;
  const fila = {
    edicion_id: _redEdicion === 'banco' ? null : _redEdicion,
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
  document.getElementById('red-e-cuerpo').value     = n.cuerpo || '';

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

  redUpdateContador();
  redSetSaveState('ok');
  switchView('view-redaccion-editor');
}

function redUpdatePortadaBtn() {
  const btn = document.getElementById('red-e-portada-btn');
  if (!btn) return;
  const on = btn.classList.contains('red-portada-on');
  btn.innerHTML = on
    ? '<i class="fa-solid fa-star"></i> En portada — su título saldrá en los titulares'
    : '<i class="fa-regular fa-star"></i> Destacar en portada';
}

function redUpdateContador() {
  const el = document.getElementById('red-e-contador');
  if (!el) return;
  const txt = document.getElementById('red-e-cuerpo')?.value || '';
  el.textContent = `${redPalabras(txt)} palabras · ${txt.length} caracteres`;
}

function redSetSaveState(estado) {
  const el = document.getElementById('red-e-save-state');
  if (!el) return;
  if (estado === 'saving')      { el.textContent = 'Guardando…';   el.className = 'red-save-state red-save-saving'; }
  else if (estado === 'ok')     { el.textContent = 'Guardado ✓';   el.className = 'red-save-state red-save-ok'; }
  else                          { el.textContent = 'Sin conexión (se reintentará)'; el.className = 'red-save-state red-save-off'; }
}

function redCamposEditor() {
  return {
    titulo:     document.getElementById('red-e-titulo').value.trim(),
    entradilla: document.getElementById('red-e-entradilla').value.trim(),
    cuerpo:     document.getElementById('red-e-cuerpo').value,
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

async function redEliminarNota() {
  const n = redNota();
  if (!n || !_sb) return;
  if (!confirm('¿Eliminar esta nota definitivamente?')) return;
  const { error } = await _sb.from(RED_T_NOTAS).delete().eq('id', n.id);
  if (error) { if (typeof toast === 'function') toast('No se pudo eliminar'); return; }
  _redNotas = _redNotas.filter(x => x.id !== n.id);
  _redNotaId = null;
  switchView('view-redaccion');
  if (typeof toast === 'function') toast('Nota eliminada');
}

/* ── Exportar ── */

function redNotaMd(n) {
  const est = redEstadoInfo(n.estado);
  const entradilla = (n.entradilla || '').trim();
  return `### ${n.titulo || 'Sin título'}\n` +
    `*${n.tipo} · ${redAutorInfo(n.autor)} · ${est.label} · ${redPalabras(n.cuerpo)} palabras*\n\n` +
    (entradilla ? `**Entradilla:** ${entradilla}\n\n` : '') +
    `${(n.cuerpo || '').trim()}\n`;
}

function redEdicionMd() {
  const ed = redEdicionActual();
  const notas = redNotasDeEdicion();
  const titulo = _redEdicion === 'banco' ? 'Banco de ideas' : (ed ? ed.titulo : 'Edición');

  const orden = redSeccionesAll();
  notas.forEach(n => { if (!orden.includes(n.seccion)) orden.push(n.seccion); });

  let md = `# PolicastSapien — ${titulo}\n\n`;
  md += `*Exportado el ${new Date().toLocaleDateString('es')} desde F.A.R.O. · ${notas.length} notas*\n\n`;

  // Titulares elegidos para la portada, al inicio del documento
  const portada = notas.filter(n => n.en_portada);
  if (portada.length) {
    md += `\n## ⭐ PORTADA — Titulares\n\n`;
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
  if (!_redLoaded) return;
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

  // Modal nueva edición
  document.getElementById('red-ed-modal-close')?.addEventListener('click', redCloseEdicionModal);
  document.getElementById('red-ed-modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'red-ed-modal-overlay') redCloseEdicionModal();
  });
  document.getElementById('red-ed-crear-btn')?.addEventListener('click', redCrearEdicion);

  // Editor: autoguardado
  ['red-e-titulo', 'red-e-entradilla', 'red-e-cuerpo'].forEach(id =>
    document.getElementById(id)?.addEventListener('input', redQueueSave));
  ['red-e-estado', 'red-e-edicion'].forEach(id =>
    document.getElementById(id)?.addEventListener('change', redQueueSave));

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

  // Reintentar guardados pendientes al recuperar conexión
  window.addEventListener('online', redFlushPending);
});
