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

   Citas al pie: el botón 🔖 de la barra deja una marca [n?] en el texto
   sin cortar la escritura; es el recordatorio de «esta idea no es mía,
   falta buscar la fuente». Tocar la marca abre su referencia; con ella
   escrita pasa a [n] normal. La numeración se recalcula sola por orden
   de aparición, y al exportar cada nota lleva su lista de referencias,
   con las pendientes delatadas para que ninguna llegue muda a la
   maquetación. La referencia viaja dentro del HTML de la nota (en un
   data-ref), así que no hace falta tocar la base de datos.
───────────────────────────────────────────── */

const RED_T_EDICIONES = 'redaccion_ediciones';
const RED_T_NOTAS     = 'redaccion_notas';
const RED_T_CONFIG    = 'redaccion_config';
const RED_PENDING_KEY = 'faro_redaccion_pending_v1';
const RED_BITACORA_KEY = 'faro_redaccion_bitacora_v1';
const RED_BITACORA_MAX = 12;   // versiones guardadas por nota

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
let _redRango     = null;    // última selección dentro del cuerpo (ver redGuardarSeleccion)
let _redCitaEl    = null;    // marca de cita abierta en su modal
let _redBitTimer  = null;    // temporizador de la bitácora local
let _redSinSubir  = false;   // el último guardado no llegó a la nube

/* ── Helpers ── */

function redMiembro() {
  const s = (typeof verificarSesion === 'function') ? verificarSesion() : null;
  return (s && s.user) || 'josue';
}

function redEsc(s) {
  const div = document.createElement('div');
  div.textContent = s || '';
  // innerHTML escapa & < >, pero NO las comillas: puestas en un atributo
  // (value="…") una comilla del dato truncaba el value y el siguiente
  // autoguardado escribía una sección o tipo a medias en la base.
  return div.innerHTML.replace(/"/g, '&quot;');
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
  let t = txt || '';
  // Las marcas de cita ([1], [2?]…) no son palabras del artículo:
  // no cuentan para los límites de los recuadros de Canva.
  if (t.includes('red-cita')) {
    const div = document.createElement('div');
    div.innerHTML = t;
    div.querySelectorAll('sup.red-cita').forEach(s => s.remove());
    t = div.innerHTML;
  }
  const plano = redPlano(t).trim();
  return plano ? plano.split(/\s+/).length : 0;
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

/* ── La selección del cuerpo, guardada aparte ──────────────────────
   En el teléfono y la tableta, tocar un <select> de la barra (Letra,
   Tamaño) le roba el foco al editor y la selección se pierde ANTES de
   que llegue el change. Con focus() el foco vuelve, pero lo marcado
   no: el tamaño se aplicaba a nada y el botón parecía muerto. En una
   computadora con ratón la selección sobrevive y el fallo no se ve,
   que es por lo que tardó en aparecer.
   La cura: guardar la última selección hecha dentro del cuerpo (en
   cada toque y cada tecla) y restaurarla justo antes de aplicar el
   formato o insertar una cita. */

/* Un rango solo vale si EMPIEZA Y TERMINA dentro del cuerpo. Un arrastre
   que entra o sale del editor (empezar en la etiqueta de al lado y soltar
   sobre el texto) produce un rango con un pie fuera, y usarlo insertaba
   la cita fuera del editor: invisible para el guardado, perdida al
   recargar. */
function redRangoEnCuerpo(cuerpo, r) {
  return !!(r && cuerpo.contains(r.startContainer) && cuerpo.contains(r.endContainer));
}

function redGuardarSeleccion() {
  const cuerpo = document.getElementById('red-e-cuerpo');
  const sel = document.getSelection();
  if (!cuerpo || !sel || !sel.rangeCount) return;
  const r = sel.getRangeAt(0);
  if (redRangoEnCuerpo(cuerpo, r)) _redRango = r.cloneRange();
}

function redRestaurarSeleccion() {
  const cuerpo = document.getElementById('red-e-cuerpo');
  if (!cuerpo) return;
  const sel = document.getSelection();
  // Si la selección viva ya está dentro del cuerpo, no hay nada que curar
  if (sel && sel.rangeCount && redRangoEnCuerpo(cuerpo, sel.getRangeAt(0))) return;
  cuerpo.focus();
  if (redRangoEnCuerpo(cuerpo, _redRango) && sel) {
    sel.removeAllRanges();
    sel.addRange(_redRango);
  }
}

/* Las citas de una nota, en orden de aparición: [{num, ref}].
   La referencia se aplana a una sola línea: un salto de línea dentro
   del textarea rompía la lista del export (una entrada partida parece
   dos, y una línea que empiece con # o - se vuelve otra cosa en
   Markdown). */
function redCitasDe(html) {
  if (!html || !html.includes('red-cita')) return [];
  const div = document.createElement('div');
  div.innerHTML = html;
  return [...div.querySelectorAll('sup.red-cita')].map((s, i) => ({
    num: i + 1,
    ref: (s.dataset.ref || '').replace(/\s+/g, ' ').trim(),
  }));
}

/* ── Reintentos offline: cambios que no llegaron a Supabase ── */

function redPendingLoad() {
  try { return JSON.parse(localStorage.getItem(RED_PENDING_KEY)) || {}; } catch (_) { return {}; }
}
function redPendingSave(map) {
  try { localStorage.setItem(RED_PENDING_KEY, JSON.stringify(map)); } catch (_) {}
}

/* Reenviar lo que no llegó, SIN pisar lo que ya está más nuevo.

   Así se perdió un artículo el 5 de agosto: un guardado que falló dejó su
   copia aquí, después se siguió escribiendo con conexión y esa copia vieja
   se quedó olvidada en el aparato. A la siguiente recarga —la que uno hace
   justo cuando algo va mal— se reenviaba a la nube encima del texto nuevo.
   El trabajo de la noche sustituido por el de una hora antes, sin un aviso.

   Ahora se pregunta primero qué hay en la nube y solo sube lo que de verdad
   sea más reciente. Y si no se puede preguntar, no se toca nada: no subir
   es recuperable, pisar no lo es. */
async function redFlushPending() {
  if (!_sb) return;
  const map = redPendingLoad();
  const ids = Object.keys(map);
  if (!ids.length) return;

  const { data, error } = await _sb.from(RED_T_NOTAS)
    .select('id, actualizado_at').in('id', ids);
  if (error) return;   // sin poder comparar, mejor quedarse quieto

  const enLaNube = {};
  (data || []).forEach(r => { enLaNube[r.id] = r.actualizado_at || ''; });

  for (const id of ids) {
    const pendiente = map[id];
    // La nota no aparece: pudo borrarse, o pudo ser un problema de permisos.
    // Se deja el pendiente donde está en vez de tirarlo por si acaso.
    if (!(id in enLaNube)) continue;

    if (pendiente.actualizado_at && enLaNube[id] &&
        pendiente.actualizado_at <= enLaNube[id]) {
      // La nube ya tiene esto mismo o algo posterior: no se sube. Pero
      // TAMPOCO se tira: puede ser texto que solo existe aquí. Pasa a la
      // bitácora, donde se ve y se puede recuperar a mano desde 🕘 Versiones.
      redBitacoraPush(id, {
        t: pendiente.actualizado_at,
        titulo: pendiente.titulo || '',
        entradilla: pendiente.entradilla || '',
        cuerpo: pendiente.cuerpo || '',
        palabras: redPalabras(pendiente.cuerpo || ''),
      });
      delete map[id];
      continue;
    }
    const { error: err2 } = await _sb.from(RED_T_NOTAS).update(pendiente).eq('id', id);
    if (!err2) delete map[id];
  }
  redPendingSave(map);
}

/* ── La bitácora: copias locales que no dependen de nadie ──────────
   Se escribe mientras se teclea, en este aparato, sin preguntarle a la
   red ni a la sesión. Es la última red debajo de todas las demás: si
   falla la conexión, si falla el guardado, si alguien recarga sin
   querer, el texto sigue aquí. No se borra al guardar bien: se guardan
   las últimas versiones de cada nota, y de ahí se puede volver. */

function redBitacoraLoad() {
  try { return JSON.parse(localStorage.getItem(RED_BITACORA_KEY)) || {}; } catch (_) { return {}; }
}

/* Si no cabe, se van soltando las versiones más viejas de todas las notas
   antes que rendirse: media bitácora sirve, ninguna no. */
function redBitacoraSave(map) {
  for (let intento = 0; intento < 8; intento++) {
    try { localStorage.setItem(RED_BITACORA_KEY, JSON.stringify(map)); return true; }
    catch (_) {
      let masVieja = null, suNota = null;
      Object.keys(map).forEach(id => {
        const v = map[id][map[id].length - 1];
        if (v && (!masVieja || v.t < masVieja.t)) { masVieja = v; suNota = id; }
      });
      if (!suNota) return false;
      map[suNota].pop();
      if (!map[suNota].length) delete map[suNota];
    }
  }
  return false;
}

function redBitacoraDe(id) {
  const map = redBitacoraLoad();
  return map[id] || [];
}

/* Mete una versión en la bitácora de una nota, la más reciente primero.
   No repite: dos copias idénticas seguidas no aportan nada. */
function redBitacoraPush(id, version) {
  const map = redBitacoraLoad();
  const lista = map[id] || [];
  if (lista.some(v => v.cuerpo === version.cuerpo && v.titulo === version.titulo &&
                      v.entradilla === version.entradilla)) return;
  lista.push(version);
  lista.sort((a, b) => String(b.t).localeCompare(String(a.t)));
  map[id] = lista.slice(0, RED_BITACORA_MAX);
  redBitacoraSave(map);
}

/* Guarda una versión de la nota abierta. Solo si el texto cambió: no tiene
   sentido llenar la bitácora de copias idénticas. */
function redBitacoraAhora() {
  clearTimeout(_redBitTimer);
  const n = redNota();
  if (!n) return;
  const cuerpoEl = document.getElementById('red-e-cuerpo');
  if (!cuerpoEl) return;

  redBitacoraPush(n.id, {
    t: new Date().toISOString(),
    titulo: document.getElementById('red-e-titulo').value.trim(),
    entradilla: document.getElementById('red-e-entradilla').value.trim(),
    cuerpo: redPlano(cuerpoEl.innerHTML).trim() ? cuerpoEl.innerHTML : '',
    palabras: redPalabras(cuerpoEl.innerHTML),
  });
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
      // Cuántas citas siguen sin fuente: para verlas desde la lista al revisar
      const sinFuente = redCitasDe(n.cuerpo).filter(c => !c.ref).length;
      return `
      <button type="button" class="red-nota" data-nota="${n.id}">
        <div class="red-nota-main">
          <span class="red-nota-titulo">${n.titulo ? redEsc(n.titulo) : '<em class="red-sin-titulo">Sin título</em>'}</span>
          <div class="red-nota-meta">
            ${n.en_portada ? '<span class="red-badge red-badge-portada">⭐ Portada</span>' : ''}
            <span class="red-badge ${est.cls}">${est.label}</span>
            <span class="red-badge red-badge-tipo">${redEsc(n.tipo)}</span>
            ${sinFuente ? `<span class="red-badge red-nota-citas-pend">🔖 ${sinFuente} sin fuente</span>` : ''}
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
  _redRango = null;      // la selección guardada era de otra nota
  redRenumerarCitas();   // por si la nota trae citas ya puestas

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
  redUpdateRecuperarAviso();   // ¿hay copia local más nueva que lo que bajó?
  redUpdateAvisoSinSubir();
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

  const citas = redCitasDe(html);
  if (citas.length) {
    const pend = citas.filter(c => !c.ref).length;
    txt += ` · 🔖 ${citas.length} cita${citas.length === 1 ? '' : 's'}`;
    if (pend) txt += ` (${pend} sin referencia)`;
  }
  el.textContent = txt;
  el.className = `red-e-contador${lim ? ` red-cont-${lim}` : ''}`;
}

/* ── Recuperar lo que no llegó a la nube ───────────────────────────
   Al abrir una nota se compara lo que vino de la nube con la última copia
   local. Si la de aquí es más nueva y distinta, se dice —no se aplica
   sola: el texto es del autor, la decisión también. */

function redVersionRecuperable() {
  const n = redNota();
  if (!n) return null;
  const v = redBitacoraDe(n.id)[0];
  if (!v) return null;
  if ((v.cuerpo || '') === (n.cuerpo || '')) return null;
  // Solo si la copia local es POSTERIOR a lo que trae la nota
  if (n.actualizado_at && v.t <= n.actualizado_at) return null;
  return v;
}

function redUpdateRecuperarAviso() {
  const aviso = document.getElementById('red-e-recuperar-aviso');
  if (!aviso) return;
  const v = redVersionRecuperable();
  aviso.style.display = v ? 'flex' : 'none';
  if (!v) return;
  const det = document.getElementById('red-e-recuperar-detalle');
  const n = redNota();
  const suyas = redPalabras(n ? n.cuerpo : '');
  if (det) {
    det.textContent = `La copia de este aparato (${redHaceCuanto(v.t)}, ` +
      `${v.palabras} palabra${v.palabras === 1 ? '' : 's'}) no coincide con lo que bajó de ` +
      `la nube (${suyas}). Puedes traerla de vuelta.`;
  }
}

function redRecuperarUltima() {
  const v = redVersionRecuperable();
  if (!v) return;
  redAplicarVersion(v);
  if (typeof toast === 'function') toast('↩️ Texto recuperado · revisa y se guarda solo');
}

/* Poner una versión de la bitácora en el editor. Antes de pisar nada se
   guarda lo que hay ahora, para que recuperar tampoco sea irreversible. */
function redAplicarVersion(v) {
  redBitacoraAhora();
  document.getElementById('red-e-titulo').value = v.titulo || '';
  document.getElementById('red-e-entradilla').value = v.entradilla || '';
  const cuerpo = document.getElementById('red-e-cuerpo');
  cuerpo.innerHTML = (v.cuerpo || '').includes('<')
    ? v.cuerpo
    : redEsc(v.cuerpo || '').replace(/\n/g, '<br>');
  _redRango = null;
  redRenumerarCitas();
  redUpdateContador();
  redQueueSave();
  redUpdateRecuperarAviso();
}

function redOpenVersiones() {
  const overlay = document.getElementById('red-versiones-overlay');
  const lista = document.getElementById('red-versiones-lista');
  const n = redNota();
  if (!overlay || !lista || !n) return;

  const versiones = redBitacoraDe(n.id);
  lista.innerHTML = versiones.length
    ? versiones.map((v, i) => `
        <button type="button" class="red-version-item" data-ver="${i}">
          <span class="red-version-cuando">${i === 0 ? '🕘 La más reciente · ' : ''}${redEsc(redHaceCuanto(v.t))}, ${new Date(v.t).toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' })}</span>
          <span class="red-version-tam">${v.palabras} palabra${v.palabras === 1 ? '' : 's'}</span>
          <span class="red-version-ojo">${redEsc(redPlano(v.cuerpo).slice(0, 90))}…</span>
        </button>`).join('')
    : '<div class="fin-empty">Todavía no hay versiones guardadas de esta nota.</div>';

  lista.querySelectorAll('[data-ver]').forEach(btn =>
    btn.addEventListener('click', () => {
      const v = versiones[Number(btn.dataset.ver)];
      if (!v) return;
      if (!confirm(`¿Traer esta versión (${v.palabras} palabras) al editor?\n\nLo que hay ahora se guarda antes en la bitácora, así que también podrás volver.`)) return;
      redAplicarVersion(v);
      redCloseVersiones();
      if (typeof toast === 'function') toast('↩️ Versión restaurada');
    }));

  overlay.style.display = 'flex';
}

function redCloseVersiones() {
  const overlay = document.getElementById('red-versiones-overlay');
  if (overlay) overlay.style.display = 'none';
}

/* Aviso permanente mientras haya texto que no subió: el renglón pequeño
   del encabezado se pierde de vista justo cuando más importa. */
function redUpdateAvisoSinSubir() {
  const el = document.getElementById('red-e-sinsubir-aviso');
  if (el) el.style.display = _redSinSubir ? 'block' : 'none';
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
  // La copia local va por su cuenta y llega antes: no espera a la red, y
  // se escribe aunque el guardado de la nube no ocurra nunca.
  clearTimeout(_redBitTimer);
  _redBitTimer = setTimeout(redBitacoraAhora, 600);
}

async function redSaveNow() {
  clearTimeout(_redSaveTimer);
  const n = redNota();
  if (!n) return;
  const campos = redCamposEditor();
  Object.assign(n, campos); // reflejo local inmediato
  redBitacoraAhora();       // pase lo que pase con la red, queda copia aquí

  let ok = false;
  if (_sb) {
    try {
      const { error } = await _sb.from(RED_T_NOTAS).update(campos).eq('id', n.id);
      ok = !error;
    } catch (_) { ok = false; }   // sin conexión, fetch revienta en vez de contestar
  }
  const map = redPendingLoad();
  if (!ok) {
    // Guardar el cambio pendiente localmente; se reintenta al reconectar
    map[n.id] = campos;
    redPendingSave(map);
    _redSinSubir = true;
    redSetSaveState('off');
  } else {
    // Un guardado bueno CANCELA el pendiente de esta nota. Si se quedaba
    // ahí, la siguiente recarga lo reenviaba encima de este texto: así se
    // perdió un artículo entero el 5 de agosto.
    if (map[n.id]) { delete map[n.id]; redPendingSave(map); }
    _redSinSubir = false;
    redSetSaveState('ok');
  }
  redUpdateAvisoSinSubir();
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

/* ── Citas al pie ─────────────────────────────────────────────────
   La marca es un <sup contenteditable="false"> dentro del texto: se
   toca entera, se borra entera con una sola tecla, y guarda su
   referencia en data-ref. Sin referencia es una pendiente [n?], en
   amarillo. La numeración no se escribe a mano nunca: se recalcula
   por orden de aparición cada vez que algo cambia. */

function redRenumerarCitas() {
  const cuerpo = document.getElementById('red-e-cuerpo');
  if (!cuerpo) return;
  let i = 0;
  cuerpo.querySelectorAll('sup.red-cita').forEach(s => {
    i++;
    const pendiente = !(s.dataset.ref || '').trim();
    s.classList.toggle('red-cita-pendiente', pendiente);
    s.setAttribute('contenteditable', 'false');
    s.textContent = pendiente ? `[${i}?]` : `[${i}]`;
  });
}

/* Un toque deja la marca pendiente y se sigue escribiendo: apuntar
   «esta idea no es mía» no debe costar más que eso. La referencia se
   escribe después, tocando la marca. */
function redInsertarCita() {
  const cuerpo = document.getElementById('red-e-cuerpo');
  if (!cuerpo) return;

  // El punto de inserción se decide ANTES de enfocar: focus() sobre un
  // cuerpo recién abierto planta un cursor AL PRINCIPIO del texto, y con
  // él la cita caía delante de la primera palabra del artículo (y de
  // paso renumeraba todas las demás). Sin rastro real del cursor, la
  // cita va al final, que es donde uno la espera.
  const sel = window.getSelection();
  const viva = (sel && sel.rangeCount && redRangoEnCuerpo(cuerpo, sel.getRangeAt(0)))
    ? sel.getRangeAt(0).cloneRange() : null;
  const guardada = redRangoEnCuerpo(cuerpo, _redRango) ? _redRango.cloneRange() : null;

  cuerpo.focus();
  let rango = viva || guardada;
  if (!rango) {
    rango = document.createRange();
    rango.selectNodeContents(cuerpo);
  }
  rango.collapse(false);             // tras lo seleccionado, como toda cita
  if (sel) { sel.removeAllRanges(); sel.addRange(rango); }

  // insertHTML y no insertNode: así la inserción entra en la pila de
  // deshacer del navegador y el botón Deshacer la quita, en vez de
  // ignorarla y llevarse el texto tecleado antes. El espacio de después
  // tampoco es cosmético: sin él el cursor no puede ponerse detrás de la
  // marca y se atasca la escritura.
  const ok = document.execCommand('insertHTML', false,
    '<sup class="red-cita red-cita-pendiente" contenteditable="false" data-nueva="1">[?]</sup>&nbsp;');
  let marca = cuerpo.querySelector('sup.red-cita[data-nueva]');
  if (!ok || !marca) {
    // Navegador sin insertHTML: a mano, como red de repuesto
    marca = document.createElement('sup');
    marca.className = 'red-cita red-cita-pendiente';
    marca.setAttribute('contenteditable', 'false');
    marca.textContent = '[?]';
    const espacio = document.createTextNode(' ');
    rango.insertNode(espacio);
    rango.insertNode(marca);
    rango.setStartAfter(espacio);
    rango.collapse(true);
    if (sel) { sel.removeAllRanges(); sel.addRange(rango); }
  }
  marca.removeAttribute('data-nueva');

  redRenumerarCitas();
  redQueueSave();
  if (typeof toast === 'function') toast('🔖 Cita pendiente · tócala cuando tengas la referencia');
}

/* ── Blindaje de las marcas frente a los comandos de formato ──
   execCommand('removeFormat') desenvuelve el <sup> de la cita AUNQUE
   lleve contenteditable=false (comprobado): quedaba el [1] como texto
   suelto y la referencia se perdía en el siguiente autoguardado. Antes
   de cada comando de la barra se toma una foto número→referencia, y
   después se re-envuelve cualquier [n] que haya quedado huérfano. */

function redFotoCitas() {
  const cuerpo = document.getElementById('red-e-cuerpo');
  const mapa = {};
  if (!cuerpo) return mapa;
  cuerpo.querySelectorAll('sup.red-cita').forEach(s => {
    const num = s.textContent.replace(/\D/g, '');
    if (num) mapa[num] = (s.dataset.ref || '').trim();
  });
  return mapa;
}

function redRepararCitas(mapa) {
  const cuerpo = document.getElementById('red-e-cuerpo');
  if (!cuerpo) return;

  // Solo se re-envuelven los números que el comando dejó huérfanos: los
  // que estaban en la foto y ya no tienen su <sup>. Así un «[3]» escrito
  // a mano como texto normal no se convierte en cita por accidente.
  const vivos = new Set([...cuerpo.querySelectorAll('sup.red-cita')]
    .map(s => s.textContent.replace(/\D/g, '')));
  const perdidos = new Set(Object.keys(mapa).filter(n => !vivos.has(n)));
  if (!perdidos.size) return;

  const walker = document.createTreeWalker(cuerpo, NodeFilter.SHOW_TEXT);
  const textos = [];
  let t;
  while ((t = walker.nextNode())) {
    if (t.parentElement && t.parentElement.closest('sup.red-cita')) continue;
    if (/\[\d+\??\]/.test(t.textContent)) textos.push(t);
  }
  textos.forEach(nodo => {
    const frag = document.createDocumentFragment();
    let resto = nodo.textContent, m;
    while ((m = resto.match(/\[(\d+)\??\]/))) {
      if (m.index > 0) frag.appendChild(document.createTextNode(resto.slice(0, m.index)));
      const num = m[1];
      if (perdidos.has(num)) {
        const ref = mapa[num];
        const sup = document.createElement('sup');
        sup.className = 'red-cita' + (ref ? '' : ' red-cita-pendiente');
        sup.setAttribute('contenteditable', 'false');
        if (ref) sup.dataset.ref = ref;
        sup.textContent = m[0];
        frag.appendChild(sup);
        perdidos.delete(num);   // cada número perdido se recupera una sola vez
      } else {
        frag.appendChild(document.createTextNode(m[0]));
      }
      resto = resto.slice(m.index + m[0].length);
    }
    if (resto) frag.appendChild(document.createTextNode(resto));
    nodo.parentNode.replaceChild(frag, nodo);
  });
  redRenumerarCitas();
}

function redOpenCitaModal(marca) {
  const overlay = document.getElementById('red-cita-overlay');
  if (!overlay) return;
  _redCitaEl = marca;
  const num = marca.textContent.replace(/[^\d]/g, '') || '?';
  const pendiente = !(marca.dataset.ref || '').trim();
  document.getElementById('red-cita-titulo').innerHTML =
    `<i class="fa-solid fa-superscript" style="color:#4f46e5;"></i> Cita al pie [${num}]`;
  document.getElementById('red-cita-ayuda').textContent = pendiente
    ? 'Pendiente: la marca amarilla del texto es el recordatorio de buscar la fuente. Escribe aquí la referencia y pasará a número normal.'
    : 'Al exportar, esta referencia sale numerada al final de la nota.';
  document.getElementById('red-cita-texto').value = marca.dataset.ref || '';
  overlay.style.display = 'flex';
}

function redCloseCitaModal() {
  const overlay = document.getElementById('red-cita-overlay');
  if (overlay) overlay.style.display = 'none';
  _redCitaEl = null;
}

function redGuardarCita() {
  if (!_redCitaEl) return;
  // A una sola línea: la lista de referencias del export es una entrada
  // por línea, y un Enter dentro del textarea la partía en dos.
  const texto = document.getElementById('red-cita-texto').value
    .replace(/\s+/g, ' ').trim();
  if (texto) _redCitaEl.dataset.ref = texto;
  else delete _redCitaEl.dataset.ref;   // vaciarla la devuelve a pendiente
  redRenumerarCitas();
  redCloseCitaModal();
  redQueueSave();
  if (typeof toast === 'function') toast(texto ? '✅ Referencia guardada' : '🔖 Queda pendiente');
}

function redQuitarCita() {
  if (!_redCitaEl) return;
  if (!confirm('¿Quitar esta cita del texto?')) return;
  _redCitaEl.remove();
  redRenumerarCitas();
  redCloseCitaModal();
  redQueueSave();
  if (typeof toast === 'function') toast('Cita quitada');
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

  // Las citas al pie, numeradas por orden de aparición. Las marcas [n]
  // ya viajan dentro del texto (redMdNodo conserva el texto del <sup>);
  // aquí se les añade su lista de referencias. Una pendiente sale
  // delatada a propósito: mejor un PENDIENTE gritón en el borrador que
  // una revista impresa con una cita muda.
  const citas = redCitasDe(n.cuerpo);
  const refs = citas.length
    ? `\n**Referencias**\n` + citas.map(c =>
        `[${c.num}] ${c.ref || '⚠️ PENDIENTE: falta buscar la fuente'}`).join('\n') + '\n'
    : '';

  return `### ${n.titulo || 'Sin título'}\n` +
    `*${n.tipo} · ${redAutorInfo(n.autor)} · ${est.label} · ${redPalabras(n.cuerpo)} palabras*\n\n` +
    (entradilla ? `**Entradilla:** ${entradilla}\n\n` : '') +
    `${redMdDesdeHtml(n.cuerpo || '').trim()}\n` + refs;
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

  // Si alguna cita sigue sin fuente, se avisa aquí también: el export es
  // el último control antes de que el texto se vaya a maquetar.
  const sinFuente = notas.reduce((a2, n) => a2 + redCitasDe(n.cuerpo).filter(c => !c.ref).length, 0);
  if (typeof toast === 'function') {
    toast(sinFuente
      ? `📋 Copiado y descargado · ⚠️ ${sinFuente} cita${sinFuente === 1 ? '' : 's'} sin fuente`
      : '📋 Copiado y descargado (.md)');
  }
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

  // Barra de formato del cuerpo.
  // La selección se guarda en cada toque y cada tecla (redGuardarSeleccion)
  // porque en pantalla táctil los <select> de la barra la roban antes del
  // change: sin esto, cambiar la letra o el tamaño no hacía nada.
  const cuerpoEl = document.getElementById('red-e-cuerpo');
  document.addEventListener('selectionchange', redGuardarSeleccion);
  ['keyup', 'mouseup', 'touchend'].forEach(ev =>
    cuerpoEl?.addEventListener(ev, redGuardarSeleccion));

  document.querySelectorAll('#red-e-toolbar .red-tb-btn[data-cmd]').forEach(btn => {
    // mousedown en vez de click: no roba el foco (ni la selección) del editor
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      redRestaurarSeleccion();
      const foto = redFotoCitas();   // por si el comando desenvuelve una marca
      document.execCommand(btn.dataset.cmd, false, null);
      redRepararCitas(foto);
      redQueueSave();
    });
  });
  const aplicarFormato = (selId, cmd) => {
    const sel = document.getElementById(selId);
    sel?.addEventListener('change', () => {
      if (!sel.value) return;
      redRestaurarSeleccion();   // devuelve al cuerpo lo que estaba marcado
      const foto = redFotoCitas();
      document.execCommand(cmd, false, sel.value);
      redRepararCitas(foto);
      sel.value = ''; // el select actúa como menú: vuelve a su etiqueta
      redQueueSave();
    });
  };
  aplicarFormato('red-e-fuente', 'fontName');
  aplicarFormato('red-e-tamano', 'fontSize');

  // Si el usuario se va a escribir al título, la entradilla o los límites,
  // la selección guardada del cuerpo caduca: sin esto, tocar Negrita desde
  // el título re-seleccionaba una frase vieja del cuerpo y la formateaba
  // fuera de la vista (antes del arreglo táctil ese clic era inofensivo).
  ['red-e-titulo', 'red-e-entradilla', 'red-e-lim-amarillo', 'red-e-lim-rojo'].forEach(id =>
    document.getElementById(id)?.addEventListener('focus', () => { _redRango = null; }));

  // Borrar una marca con la tecla de retroceso (se va entera, como un
  // átomo) solo deja un evento 'input': renumerar también aquí, para que
  // el texto guardado nunca lleve números viejos que el export atribuiría
  // a la referencia equivocada.
  cuerpoEl?.addEventListener('input', redRenumerarCitas);

  // Citas al pie: el botón deja la marca; tocar una marca abre su referencia
  const citaBtn = document.getElementById('red-e-cita-btn');
  citaBtn?.addEventListener('mousedown', e => e.preventDefault()); // no roba el foco
  citaBtn?.addEventListener('click', redInsertarCita);
  cuerpoEl?.addEventListener('click', e => {
    const marca = e.target.closest ? e.target.closest('sup.red-cita') : null;
    if (marca) redOpenCitaModal(marca);
  });
  document.getElementById('red-cita-close')?.addEventListener('click', redCloseCitaModal);
  document.getElementById('red-cita-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'red-cita-overlay') redCloseCitaModal();
  });
  document.getElementById('red-cita-guardar-btn')?.addEventListener('click', redGuardarCita);
  document.getElementById('red-cita-quitar-btn')?.addEventListener('click', redQuitarCita);

  // Pegar siempre como texto plano (evita arrastrar estilos de otras apps),
  // CON una excepción: si lo copiado trae marcas de cita —reordenar párrafos
  // propios con cortar y pegar— se reconstruyen texto y marcas, nada más.
  // Sin esto, mover un párrafo destruía sus citas: el corte se llevaba el
  // <sup> con su referencia y el pegado devolvía un [2] de texto muerto.
  cuerpoEl?.addEventListener('paste', e => {
    e.preventDefault();
    const datos = e.clipboardData || window.clipboardData;
    const htmlClip = datos.getData('text/html') || '';

    if (htmlClip.includes('red-cita')) {
      const div = document.createElement('div');
      div.innerHTML = htmlClip;
      const partes = [];
      (function anda(nodo) {
        nodo.childNodes.forEach(ch => {
          if (ch.nodeType === Node.TEXT_NODE) { partes.push(redEsc(ch.textContent)); return; }
          if (ch.nodeType !== Node.ELEMENT_NODE) return;
          if (ch.matches && ch.matches('sup.red-cita')) {
            const ref = (ch.dataset.ref || '').replace(/\s+/g, ' ').trim();
            const sup = document.createElement('sup');
            sup.className = 'red-cita' + (ref ? '' : ' red-cita-pendiente');
            sup.setAttribute('contenteditable', 'false');
            if (ref) sup.dataset.ref = ref;
            sup.textContent = '[?]';
            partes.push(sup.outerHTML);
            return;
          }
          if (ch.tagName === 'BR') { partes.push('<br>'); return; }
          anda(ch);
          if (/^(DIV|P|LI|H[1-6])$/.test(ch.tagName)) partes.push('<br>');
        });
      })(div);
      document.execCommand('insertHTML', false, partes.join(''));
    } else {
      document.execCommand('insertText', false, datos.getData('text/plain'));
    }
    redRenumerarCitas();
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

  // Versiones guardadas de la nota abierta
  document.getElementById('red-e-versiones-btn')?.addEventListener('click', redOpenVersiones);
  document.getElementById('red-versiones-close')?.addEventListener('click', redCloseVersiones);
  document.getElementById('red-versiones-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'red-versiones-overlay') redCloseVersiones();
  });
  document.getElementById('red-e-recuperar-btn')?.addEventListener('click', redRecuperarUltima);

  // Reintentar guardados pendientes al recuperar conexión
  window.addEventListener('online', redFlushPending);

  /* Antes de que el botón 🔄 recargue, guardar lo que haya a medias.
     Recargar con el editor abierto se llevaba por delante lo escrito
     desde el último guardado, sin preguntar. Devuelve si quedó algo sin
     subir, para que quien recarga pueda decidir con la verdad delante. */
  (window.faroGuardadosPendientes = window.faroGuardadosPendientes || []).push(async () => {
    const editorAbierto = document.getElementById('view-redaccion-editor')?.classList.contains('active');
    if (!editorAbierto || !redNota()) return { ok: true };
    redBitacoraAhora();          // la copia local, siempre y primero
    await redSaveNow();
    return _redSinSubir
      ? { ok: false, aviso: 'La nota que estás escribiendo no se ha guardado en la nube (sin conexión). Hay copia en este aparato y podrás recuperarla desde 🕘 Versiones.' }
      : { ok: true };
  });

  /* Y si se cierra la pestaña o se recarga desde el navegador, al menos
     dejar la copia local hecha. No siempre da tiempo, pero cuesta nada. */
  window.addEventListener('beforeunload', () => {
    if (document.getElementById('view-redaccion-editor')?.classList.contains('active')) {
      try { redBitacoraAhora(); } catch (_) {}
    }
  });
});
