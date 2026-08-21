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
const RED_T_BUZON     = 'buzon_mensajes';
const RED_T_BUZON_FOTOS = 'buzon_fotos';

/* La dirección del buzón del lector. Va IMPRESA en la revista como
   código QR, así que no lleva código ni caduca: es una sola y para
   siempre. Vive en el sitio público de M.E.T.A.S porque esta
   aplicación está detrás de una puerta con contraseña y no puede
   recibir visitas de la calle; la página no nombra a la revista por
   ninguna parte, que es como se pidió.
   Si algún día cambia, cambia AQUÍ: de aquí sale el QR, el enlace que
   se copia y el mensaje que se manda por WhatsApp. */
const RED_BUZON_URL = 'https://metas.policastsapien.com/buzon.html';
const RED_PENDING_KEY = 'faro_redaccion_pending_v1';
const RED_BITACORA_KEY = 'faro_redaccion_bitacora_v1';
const RED_BITACORA_MAX = 12;   // versiones guardadas por nota
const RED_ESTILOS_KEY  = 'faro_redaccion_estilos_v1';

/* ── Los estilos de cita, con su edición vigente ──────────────────
   Referencia rápida para la sala de redacción, no un manual entero:
   qué estilo pide cada mundo, cómo va la cita dentro del texto, la
   plantilla de la referencia y qué cambió en la edición al día.
   El «sistema del subíndice» tiene nombre: notas al pie (Chicago) en
   humanidades, numérico (Vancouver) en ciencias de la salud. */
const RED_ESTILOS_CITA = [
  {
    id: 'apa', nombre: 'APA 7', sistema: 'autor–año',
    vigente: '7.ª edición (2020), la vigente',
    uso: 'La norma más extendida en Latinoamérica y en ciencias sociales: educación, psicología, administración.',
    enTexto: 'Autor y año entre paréntesis, dentro de la oración: <b>(Bueno, 1972)</b> · «Bueno (1972) sostiene que…» · en cita textual, con página: <b>(Bueno, 1972, p. 44)</b>.',
    referencias: [
      { tipo: 'Libro', plantilla: 'Apellido, N. (Año). <i>Título del libro: Solo mayúscula inicial</i>. Editorial.',
        ejemplo: 'Bueno, G. (1972). <i>Ensayos materialistas</i>. Taurus.' },
      { tipo: 'Artículo', plantilla: 'Apellido, N. (Año). Título del artículo. <i>Nombre de la Revista, vol</i>(núm), páginas. https://doi.org/…' },
      { tipo: 'Página web', plantilla: 'Apellido, N. (Año, 5 de agosto). <i>Título de la página</i>. Nombre del sitio. https://…' },
    ],
    novedades: 'Ya no se escribe la ciudad de la editorial. El enlace va pelado, sin «Recuperado de». Hasta 20 autores en la lista antes de recortar con puntos suspensivos.',
    orden: 'alfabetico',
    faro: 'APA no usa subíndices: la lista final va en orden ALFABÉTICO por apellido. Usa las marcas [n] como recordatorio en el borrador y al maquetar cámbialas por (Autor, año).',
  },
  {
    id: 'chicago', nombre: 'Chicago 18 · notas', sistema: 'subíndice',
    vigente: '18.ª edición (2024), la vigente',
    uso: 'Historia, filosofía y humanidades; el clásico de los libros. Es el sistema del número volado: el que ya usas.',
    enTexto: 'Un número en superíndice tras la frase o la cita textual¹ y la referencia completa en la nota al pie de página (o al final del artículo).',
    referencias: [
      { tipo: 'Nota (1.ª vez)', plantilla: 'Nombre Apellido, <i>Título del libro</i> (Editorial, año), 44.',
        ejemplo: 'Gustavo Bueno, <i>Ensayos materialistas</i> (Taurus, 1972), 44.' },
      { tipo: 'Nota (siguientes)', plantilla: 'Apellido, <i>Título corto</i>, 51.' },
      { tipo: 'Bibliografía final', plantilla: 'Apellido, Nombre. <i>Título del libro</i>. Editorial, año.' },
    ],
    novedades: 'La 18.ª (2024) ya no exige la ciudad de la editorial y desaconseja el «ibid.»: se repite apellido y título corto.',
    orden: 'aparicion',
    faro: 'Encaja tal cual con F.A.R.O.: la marca [n] es tu número volado y la lista de Referencias del export son tus notas, numeradas por orden de aparición.',
  },
  {
    id: 'mla', nombre: 'MLA 9', sistema: 'autor–página',
    vigente: '9.ª edición (2021), la vigente',
    uso: 'Literatura, lengua y arte en el mundo anglosajón.',
    enTexto: 'Apellido y página entre paréntesis, sin año y sin coma: <b>(Bueno 44)</b>. Si el autor ya se nombró en la frase, solo la página: <b>(44)</b>.',
    referencias: [
      { tipo: 'Libro', plantilla: 'Apellido, Nombre. <i>Título del libro</i>. Editorial, año.',
        ejemplo: 'Bueno, Gustavo. <i>Ensayos materialistas</i>. Taurus, 1972.' },
      { tipo: 'Artículo', plantilla: 'Apellido, Nombre. «Título del artículo». <i>Revista</i>, vol. X, n.º X, año, pp. XX-XX.' },
    ],
    novedades: 'La 9.ª mantiene el esquema de «contenedores» (la obra dentro de la revista, la revista dentro de la base de datos) y volvió a traer ejemplos por cada tipo de fuente.',
    orden: 'alfabetico',
    faro: 'La lista final («Obras citadas») va alfabética. Las marcas [n] sirven de recordatorio mientras la nota está en borrador.',
  },
  {
    id: 'vancouver', nombre: 'Vancouver', sistema: 'numérico',
    vigente: 'recomendaciones ICMJE, el estándar de las revistas médicas',
    uso: 'Medicina, enfermería y ciencias de la salud.',
    enTexto: 'Números por orden de aparición, en superíndice o entre corchetes: «…lo confirma el estudio.<b>¹²</b>» o <b>[1,2]</b>. Cada fuente conserva su número siempre, aunque se repita.',
    referencias: [
      { tipo: 'Artículo', plantilla: 'Apellido AB, Apellido CD. Título del artículo. Rev Abreviada. Año;vol(núm):páginas.' },
      { tipo: 'Libro', plantilla: 'Apellido AB. Título del libro. 3.ª ed. Editorial; año.' },
    ],
    novedades: 'Hasta seis autores se listan todos; con más, los seis primeros y «et al.». El nombre de la revista va abreviado (estilo PubMed).',
    orden: 'aparicion',
    faro: 'Como Chicago, encaja con tus marcas [n]: numeración por orden de aparición, igual que el export de F.A.R.O.',
  },
  {
    id: 'harvard', nombre: 'Harvard', sistema: 'autor–año',
    vigente: 'sin manual único; la guía más citada es Cite Them Right',
    uso: 'Universidades británicas y australianas; frecuente en economía y negocios.',
    enTexto: 'Como APA: <b>(Apellido, año)</b> y con página <b>(Apellido, año, p. 44)</b>.',
    referencias: [
      { tipo: 'Libro', plantilla: 'Apellido, N. (año) <i>Título del libro</i>. Editorial.',
        ejemplo: 'Bueno, G. (1972) <i>Ensayos materialistas</i>. Taurus.' },
    ],
    novedades: 'No hay edición oficial: cada universidad publica su variante. Si te piden «Harvard», pide la guía exacta de esa institución.',
    orden: 'alfabetico',
    faro: 'Lista final alfabética, como APA: las marcas [n] son el recordatorio del borrador.',
  },
];

const RED_SECCIONES = [
  'PORTADA', 'EDITORIAL', 'ACTUALIDAD', 'REPORTE INVESTIGATIVO',
  'TECNOLOGÍA', 'CULTURA', 'FILOSOFÍA Y AULA', 'AULAS EN ACCIÓN', 'AVISOS',
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
let _redGuiaAbierta = false; // la guía de citas, ¿desplegada?
let _redBuzon     = [];      // los envíos de los lectores (sin las fotos)
let _redHayBuzon  = false;   // ¿esta base ya tiene las tablas del buzón?
let _redEnvio     = null;    // el envío abierto en su ventana

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
   se quedó olvidada en el aparato. A la siguiente recarga (la que uno hace
   justo cuando algo va mal) se reenviaba a la nube encima del texto nuevo.
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

  const [ed, no, cf, pap, buz] = await Promise.all([
    _sb.from(RED_T_EDICIONES).select('*').order('numero', { ascending: false }),
    _sb.from(RED_T_NOTAS).select('*').order('actualizado_at', { ascending: false }),
    _sb.from(RED_T_CONFIG).select('*'),
    // Sonda: si la columna 'eliminada' no existe todavía, esta consulta falla
    // y la papelera se queda escondida en vez de romper la herramienta entera.
    _sb.from(RED_T_NOTAS).select('id').eq('eliminada', true).limit(1),
    // El buzón, igual: mientras no se haya corrido buzon_lector.sql su
    // tabla no existe, y Redacción tiene que seguir funcionando entera.
    // Las FOTOS no se piden aquí a propósito: son data URL de casi un
    // mega cada una y esta consulta se hace cada vez que se abre la
    // herramienta. Se piden al abrir el envío, que es cuando se miran.
    _sb.from(RED_T_BUZON).select(
      'id,folio,creado_at,clase,titulo,texto,nombre,tel,correo,lugar,escuela,cargo,' +
      'evento_fecha,evento_hora,evento_lugar,etica_version,permiso_fotos,fotos,' +
      'editado_at,ediciones,' +
      'estado,nota_id,motivo,visto_por,visto_at'
    ).order('creado_at', { ascending: false }).limit(300),
  ]);

  _redPapelera = !pap.error;
  _redHayBuzon = !buz.error;
  _redBuzon    = buz.error ? [] : (buz.data || []);

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
  if (_redEdicion === 'buzon' && !_redHayBuzon) _redEdicion = 'banco';

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
  const enBuzon    = _redEdicion === 'buzon';
  const nueva  = document.getElementById('red-nueva-nota-btn');
  const expo   = document.getElementById('red-exportar-btn');
  const vaciar = document.getElementById('red-vaciar-papelera-btn');
  const qr     = document.getElementById('red-qr-btn');
  if (nueva)  nueva.style.display  = (enPapelera || enBuzon) ? 'none' : '';
  if (expo)   expo.style.display   = (enPapelera || enBuzon) ? 'none' : '';
  if (vaciar) vaciar.style.display = (enPapelera && redNotasPapelera().length) ? '' : 'none';
  // El QR solo dentro del buzón: es lo que se pega en la revista para
  // que entren envíos, y fuera de ahí no significa nada.
  if (qr) qr.style.display = enBuzon ? '' : 'none';
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
  if (_redEdicion === 'buzon') {
    const nuevos = redBuzonNuevos().length;
    const pend = _redBuzon.filter(m => m.estado === 'nuevo' || m.estado === 'leido').length;
    tituloEl.textContent = '📬 Buzón del lector';
    metaEl.textContent = _redBuzon.length
      ? `${pend} sin resolver${nuevos ? ` · ${nuevos} sin abrir` : ''} · ${_redBuzon.length} en total`
      : 'Vacío. Aquí cae lo que manda la gente desde el QR de la revista.';
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

  // El buzón va el PRIMERO de todos, y con su cuenta a la vista aunque
  // esté vacío. Lo que hay dentro lo mandó gente de fuera que está
  // esperando respuesta: si el chip se esconde cuando no hay nada,
  // nadie se acuerda de mirarlo el día que sí la hay.
  const sinAbrir = redBuzonNuevos().length;
  const buzon = _redHayBuzon ? `
    <button type="button" class="red-ed-chip red-ed-chip-buzon ${_redEdicion === 'buzon' ? 'red-ed-chip-active' : ''}" data-ed="buzon">
      📬 Buzón${sinAbrir ? ` · ${sinAbrir}` : ''}
    </button>` : '';

  wrap.innerHTML = buzon + papelera + chips + `
    <button type="button" class="red-ed-chip ${_redEdicion === 'banco' ? 'red-ed-chip-active' : ''}" data-ed="banco">
      🗃️ Banco
    </button>
    <button type="button" class="red-ed-chip red-ed-chip-new" data-ed="nueva">
      <i class="fa-solid fa-plus"></i> Edición
    </button>`;
  wrap.querySelectorAll('.red-ed-chip').forEach(btn => btn.addEventListener('click', () => {
    const val = btn.dataset.ed;
    if (val === 'nueva') { redOpenEdicionModal(); return; }
    if (val === 'banco' || val === 'papelera' || val === 'buzon') { _redEdicion = val; redRender(); return; }
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
  if (_redEdicion === 'buzon') {
    if (emptyEl) emptyEl.style.display = 'none';
    redRenderBuzon(list);
    return;
  }

  const notas = redNotasDeEdicion();
  if (emptyEl) emptyEl.style.display = notas.length ? 'none' : 'block';

  // Agrupar por sección, en el orden editorial de la revista
  const orden = redSeccionesAll();
  notas.forEach(n => { if (!orden.includes(n.seccion)) orden.push(n.seccion); });

  // Las que salieron del buzón se marcan: quien las abre tiene que
  // saber que detrás hay un lector esperando una llamada, no una idea
  // propia que se puede dejar para el mes que viene.
  const delBuzon = redNotasDelBuzon();

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
            ${delBuzon.has(n.id) ? '<span class="red-badge red-buz-fotos">📬 Del buzón</span>' : ''}
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

/* ═══════════════════════════════════════════════════════════════
   EL BUZÓN DEL LECTOR 📬
   ═══════════════════════════════════════════════════════════════
   La revista la escriben cuatro personas. El buzón es la otra
   puerta: cualquiera que lea la revista escanea el QR y manda una
   nota, una opinión, una denuncia, una sugerencia, o pide que le
   cubran un evento de su escuela en «Aulas en acción».

   Lo que entra aquí NO es una nota todavía: es materia prima con
   una persona detrás esperando. De ahí las tres cosas que hace
   esta bandeja y que no hace ninguna otra pantalla:

   · Enseña el TELÉFONO a un toque de WhatsApp, porque el trabajo
     de verdad empieza llamando a quien lo mandó.
   · Deja constancia de lo que ese lector ACEPTÓ al mandarlo (qué
     versión de los requisitos, si declaró permiso de las fotos).
     Un reclamo dentro de un año se resuelve mirando el dato.
   · No deja que un envío se quede sin respuesta: mientras esté en
     «nuevo» o «leído» cuenta como pendiente y el chip lo grita.

   Los datos de contacto NO viajan a la nota. Ver redBuzonANota.
   ═══════════════════════════════════════════════════════════════ */

const RED_BUZON_CLASES = {
  nota:       { ic: '📝', t: 'Nota o dato',        sec: 'ACTUALIDAD',            tipo: 'Nota de prensa' },
  opinion:    { ic: '💬', t: 'Opinión',            sec: 'EDITORIAL',             tipo: 'Artículo' },
  denuncia:   { ic: '⚠️', t: 'Denuncia',           sec: 'REPORTE INVESTIGATIVO', tipo: 'Reporte' },
  sugerencia: { ic: '💡', t: 'Sugerencia',         sec: 'AVISOS',                tipo: 'Idea' },
  aulas:      { ic: '🏫', t: 'Aulas en acción',    sec: 'AULAS EN ACCIÓN',       tipo: 'Reporte' },
  // La rara, y por eso lleva `ayuda`: NO es material de la revista. Es
  // alguien que la leyó, vio que ahí se promociona M.E.T.A.S y quiere
  // usarla o necesita que le echen una mano. Cae por la misma puerta
  // porque es la única abierta al público, pero aquí no se convierte en
  // nota: se le escribe. Convertir esto en una nota sería publicar la
  // pregunta de alguien que solo quería ayuda.
  metas:      { ic: '🎓', t: 'Ayuda con M.E.T.A.S', sec: 'AVISOS',               tipo: 'Idea', ayuda: true },
};
function redClase(id) { return RED_BUZON_CLASES[id] || RED_BUZON_CLASES.nota; }

const RED_BUZON_ESTADOS = {
  nuevo:      { label: '🔴 Sin abrir',  cls: 'red-buz-nuevo' },
  leido:      { label: '👁 Leído',      cls: 'red-buz-leido' },
  atendido:   { label: '✅ Atendido',   cls: 'red-buz-atendido' },
  descartado: { label: '🚫 Descartado', cls: 'red-buz-descartado' },
};

function redBuzonNuevos() { return _redBuzon.filter(m => m.estado === 'nuevo'); }

/* Las notas que salieron del buzón, para marcarlas en las listas */
function redNotasDelBuzon() {
  return new Set(_redBuzon.filter(m => m.nota_id).map(m => m.nota_id));
}

function redFechaCorta(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function redRenderBuzon(list) {
  if (!_redBuzon.length) {
    list.innerHTML = `
      <div class="red-buz-vacio">
        <div class="red-buz-vacio-ic">📬</div>
        <p><strong>El buzón está vacío.</strong></p>
        <p>Aquí cae lo que manda la gente desde el código QR de la revista:
           notas, opiniones, denuncias, sugerencias y peticiones para
           <strong>Aulas en acción</strong>.</p>
        <p>Si todavía no has puesto el QR en ningún número, toca
           <strong>QR para la revista</strong> aquí arriba.</p>
      </div>`;
    return;
  }

  // Sin resolver primero, y dentro de eso lo más nuevo arriba: la
  // bandeja se abre para atender, no para leer historia.
  const pendientes = _redBuzon.filter(m => m.estado === 'nuevo' || m.estado === 'leido');
  const cerrados   = _redBuzon.filter(m => m.estado === 'atendido' || m.estado === 'descartado');

  const fila = m => {
    const c = redClase(m.clase);
    const est = RED_BUZON_ESTADOS[m.estado] || RED_BUZON_ESTADOS.nuevo;
    const resumen = (m.titulo || redPlano(m.texto) || '').trim();
    return `
      <button type="button" class="red-buz-fila ${m.estado === 'nuevo' ? 'red-buz-fila-nueva' : ''}" data-envio="${m.id}">
        <div class="red-buz-ic">${c.ic}</div>
        <div class="red-buz-main">
          <div class="red-buz-titulo">${resumen ? redEsc(resumen.slice(0, 90)) : '<em class="red-sin-titulo">Sin título</em>'}</div>
          <div class="red-nota-meta">
            <span class="red-badge ${est.cls}">${est.label}</span>
            <span class="red-badge red-badge-tipo">${c.t}</span>
            ${m.fotos ? `<span class="red-badge red-buz-fotos">📷 ${m.fotos}</span>` : ''}
            ${m.editado_at ? '<span class="red-badge red-buz-editado">✏️ Corregido</span>' : ''}
          </div>
          <div class="red-buz-quien">
            ${redEsc(m.nombre || 'Sin nombre')}${m.cargo ? ' · ' + redEsc(m.cargo) : ''}
            ${m.lugar ? ' · ' + redEsc(m.lugar) : ''} · ${redFechaCorta(m.creado_at)}
          </div>
        </div>
        <i class="fa-solid fa-chevron-right red-nota-arrow"></i>
      </button>`;
  };

  list.innerHTML =
    (pendientes.length ? `<div class="red-seccion">
      <h3 class="red-seccion-title">Esperando respuesta</h3>${pendientes.map(fila).join('')}</div>` : '') +
    (cerrados.length ? `<div class="red-seccion">
      <h3 class="red-seccion-title">Ya resueltos</h3>${cerrados.map(fila).join('')}</div>` : '');

  list.querySelectorAll('.red-buz-fila').forEach(b =>
    b.addEventListener('click', () => redAbrirEnvio(Number(b.dataset.envio))));
}

/* ── Un envío, abierto ── */

async function redAbrirEnvio(id) {
  const m = _redBuzon.find(x => x.id === id);
  if (!m) return;
  _redEnvio = m;

  const ov = document.getElementById('red-buzon-overlay');
  const cu = document.getElementById('red-buzon-cuerpo');
  if (!ov || !cu) return;
  const c = redClase(m.clase);
  document.getElementById('red-buzon-titulo').innerHTML =
    `${c.ic} ${redEsc(c.t)} <span class="red-buz-folio">${redEsc(m.folio || '')}</span>`;
  cu.innerHTML = '<div class="red-buz-cargando">Abriendo el envío…</div>';
  ov.style.display = 'flex';

  // Marcarlo leído en cuanto se abre: si no, el contador del chip
  // miente y el que revisa vuelve a abrir lo mismo tres veces.
  if (m.estado === 'nuevo') await redEnvioEstado(m, 'leido', '', false);

  const fotos = await redFotosDe(m.id);
  redPintarEnvio(m, fotos);
}

async function redFotosDe(mensajeId) {
  if (!_sb) return [];
  const { data, error } = await _sb.from(RED_T_BUZON_FOTOS)
    .select('*').eq('mensaje_id', mensajeId).order('orden');
  if (error) { console.error('[Buzón] Error cargando fotos:', error); return []; }
  return data || [];
}

function redPintarEnvio(m, fotos) {
  const cu = document.getElementById('red-buzon-cuerpo');
  if (!cu) return;
  const c = redClase(m.clase);
  const est = RED_BUZON_ESTADOS[m.estado] || RED_BUZON_ESTADOS.nuevo;
  const notaHecha = m.nota_id ? _redNotas.find(n => n.id === m.nota_id) : null;

  // Para «Aulas en acción», lo primero que hay que saber es si da
  // tiempo: la revista sale cada quince días o cada mes, y un evento de
  // pasado mañana no se cubre con la edición que cierra la semana que viene.
  let avisoEvento = '';
  if (m.clase === 'aulas' && m.evento_fecha) {
    const dias = redDiasParaCierre(m.evento_fecha);
    avisoEvento = dias < 0
      ? `<div class="red-buz-aviso red-buz-aviso-tarde">⏳ El evento ya pasó hace ${-dias} día${dias === -1 ? '' : 's'}. Todavía se puede contar, pero como crónica.</div>`
      : dias <= 2
        ? `<div class="red-buz-aviso red-buz-aviso-tarde">⚡ ${dias === 0 ? 'Es HOY' : dias === 1 ? 'Es MAÑANA' : 'Faltan 2 días'}. Si se va a cubrir, hay que decidirlo ya.</div>`
        : `<div class="red-buz-aviso">🗓️ Faltan ${dias} días para el evento.</div>`;
  }

  cu.innerHTML = `
    <div class="red-buz-cab">
      <span class="red-badge ${est.cls}">${est.label}</span>
      <span class="red-buz-fecha">Recibido el ${redFechaLarga(String(m.creado_at || '').slice(0, 10))}</span>
    </div>

    ${c.ayuda ? `
    <div class="red-buz-aviso red-buz-aviso-ayuda">
      🎓 <b>Esto no es para la revista.</b> Es alguien que quiere usar M.E.T.A.S
      o que necesita ayuda con ella. Lo que hace falta aquí es <b>escribirle</b>,
      no escribir una nota. La revista lo promociona: si esta persona no recibe
      respuesta, la promoción no sirvió de nada.
    </div>` : ''}
    ${redAvisoCorregido(m)}
    ${m.titulo ? `<div class="red-buz-tit">${redEsc(m.titulo)}</div>` : ''}
    <div class="red-buz-texto">${redEsc(m.texto || '').replace(/\n/g, '<br>')}</div>

    ${avisoEvento}
    ${m.clase === 'aulas' ? `
    <div class="red-buz-datos">
      ${m.escuela ? `<div><b>Centro</b><span>${redEsc(m.escuela)}</span></div>` : ''}
      ${m.evento_fecha ? `<div><b>Cuándo</b><span>${redEsc(redFechaLarga(m.evento_fecha))}${m.evento_hora ? ' · ' + redEsc(m.evento_hora) : ''}</span></div>` : ''}
      ${m.evento_lugar ? `<div><b>Dónde</b><span>${redEsc(m.evento_lugar)}</span></div>` : ''}
    </div>` : ''}

    ${fotos.length ? `
    <div class="red-buz-fotos-caja">
      <div class="red-buz-sub">📷 ${fotos.length} foto${fotos.length === 1 ? '' : 's'}</div>
      <div class="red-buz-galeria">
        ${fotos.map((f, i) => `<img src="${f.datos}" alt="Foto ${i + 1}" data-foto="${i}">`).join('')}
      </div>
      <div class="red-buz-pie-fotos">
        ${m.permiso_fotos
          ? '✅ El lector declaró que las tomó él o tiene permiso, y que si sale un menor su familia lo sabe.'
          : '⚠️ <b>No declaró permiso.</b> No se publican hasta hablar con él.'}
      </div>
      <button type="button" class="red-buz-btn" id="red-buz-bajar">
        <i class="fa-solid fa-download"></i> Descargar las fotos para maquetar
      </button>
    </div>` : ''}

    <div class="red-buz-sub">Quién lo manda</div>
    <div class="red-buz-datos">
      <div><b>Nombre</b><span>${redEsc(m.nombre || '·')}</span></div>
      ${m.cargo ? `<div><b>Es</b><span>${redEsc(m.cargo)}</span></div>` : ''}
      ${m.lugar ? `<div><b>De</b><span>${redEsc(m.lugar)}</span></div>` : ''}
      ${(m.escuela && m.clase !== 'aulas') ? `<div><b>Centro</b><span>${redEsc(m.escuela)}</span></div>` : ''}
      <div><b>Teléfono</b><span>${redEsc(m.tel || '·')}</span></div>
      ${m.correo ? `<div><b>Correo</b><span>${redEsc(m.correo)}</span></div>` : ''}
      <div><b>Aceptó</b><span>Los requisitos ${redEsc(m.etica_version || '·')}</span></div>
    </div>

    <div class="red-buz-verifica">
      <b>Antes de publicar:</b> llama al lector y confirma lo que cuenta. Y si
      señala a alguien (una persona o una institución) hay que darle la
      oportunidad de dar su versión: eso es lo que separa una nota de un rumor
      impreso. Al lector se le dijo, en la misma pantalla en la que escribió
      esto, que se le podría contactar para conocer más detalles.
    </div>

    ${notaHecha ? `
    <div class="red-buz-aviso red-buz-aviso-ok">
      📝 Ya es una nota: «${redEsc(notaHecha.titulo || 'Sin título')}».
      <button type="button" class="red-buz-enlace" id="red-buz-ir-nota">Abrirla</button>
    </div>` : ''}
    ${m.estado === 'descartado' && m.motivo ? `
    <div class="red-buz-aviso">🚫 Descartado: ${redEsc(m.motivo)}</div>` : ''}

    <div class="red-buz-acciones">
      <button type="button" class="red-buz-btn red-buz-btn-wa" id="red-buz-wa">
        <i class="fa-brands fa-whatsapp"></i> Escribirle
      </button>
      ${(notaHecha || c.ayuda) ? '' : `
      <button type="button" class="red-buz-btn red-buz-btn-1" id="red-buz-nota">
        <i class="fa-solid fa-pen-nib"></i> Convertir en nota
      </button>`}
      ${(c.ayuda && m.estado !== 'atendido') ? `
      <button type="button" class="red-buz-btn red-buz-btn-1" id="red-buz-atendido">
        <i class="fa-solid fa-check"></i> Ya le respondí
      </button>` : ''}
      ${m.estado === 'descartado' ? '' : `
      <button type="button" class="red-buz-btn" id="red-buz-descartar">
        <i class="fa-solid fa-ban"></i> Descartar
      </button>`}
    </div>`;

  // Tocar una foto la abre a tamaño completo, que es como se decide
  // si sirve para imprimir.
  cu.querySelectorAll('[data-foto]').forEach(img =>
    img.addEventListener('click', () => redVerFotoGrande(fotos[Number(img.dataset.foto)].datos)));

  const bBajar = document.getElementById('red-buz-bajar');
  if (bBajar) bBajar.addEventListener('click', () => redBajarFotos(m, fotos));

  document.getElementById('red-buz-wa')?.addEventListener('click', () => redEscribirLector(m));
  document.getElementById('red-buz-nota')?.addEventListener('click', () => redBuzonANota(m, fotos.length));
  document.getElementById('red-buz-descartar')?.addEventListener('click', () => redDescartarEnvio(m));
  document.getElementById('red-buz-atendido')?.addEventListener('click', async () => {
    // Sin nota de por medio: aquí «atendido» quiere decir «ya le
    // escribí». Si no existiera este botón, una petición de ayuda
    // resuelta se quedaría contando como pendiente para siempre.
    if (await redEnvioEstado(m, 'atendido', '', true)) redCerrarEnvio();
  });
  document.getElementById('red-buz-ir-nota')?.addEventListener('click', () => {
    redCerrarEnvio();
    redOpenEditor(m.nota_id);
  });
}

/* El lector puede corregir lo suyo desde su pantalla, con su folio y
   su teléfono. Cuando lo hace, el envío vuelve a la cola como sin leer
   (para que quien ya lo hubiera leído lo lea otra vez) pero eso solo
   no basta: quien lo leyó el lunes tiene los datos viejos en la cabeza
   y va a llamar a preguntar por algo que el texto ya no dice. Así que
   se avisa, y con la fecha delante. */
function redAvisoCorregido(m) {
  if (!m.editado_at) return '';
  const veces = Number(m.ediciones) || 1;
  const despues = m.visto_at && String(m.editado_at) > String(m.visto_at);
  return `<div class="red-buz-aviso ${despues ? 'red-buz-aviso-tarde' : ''}">
    ✏️ <b>El lector lo corrigió${veces > 1 ? ` ${veces} veces` : ''}</b>,
    la última el ${redEsc(redFechaLarga(String(m.editado_at).slice(0, 10)))}.
    ${despues ? 'Fue <b>después</b> de que alguien lo leyera: lo de arriba es la versión nueva, y puede que no diga lo mismo que la que se leyó.' : ''}
  </div>`;
}

function redVerFotoGrande(datos) {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write('<title>Foto del buzón</title>' +
    '<body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh">' +
    '<img src="' + datos + '" style="max-width:100%;max-height:100vh">');
  w.document.close();
}

/* Las fotos se BAJAN, no se pegan en la nota: el programa de
   maquetación necesita archivos, no texto. El nombre lleva el folio
   para que en la carpeta de descargas se sepa de quién es cada una. */
function redBajarFotos(m, fotos) {
  fotos.forEach((f, i) => {
    const a = document.createElement('a');
    a.href = f.datos;
    a.download = `buzon-${(m.folio || m.id)}-${i + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  if (typeof toast === 'function') toast(fotos.length === 1 ? 'Foto descargada' : 'Fotos descargadas');
}

/* Llamar es el trabajo. El mensaje va escrito para que quien contesta
   sepa de qué le hablan: un «hola» suelto de un número desconocido no
   lo contesta nadie. */
function redEscribirLector(m) {
  const c = redClase(m.clase);
  const tel = String(m.tel || '').replace(/\D/g, '');
  if (!tel) { if (typeof toast === 'function') toast('Este envío no trae teléfono'); return; }
  const nombre = m.nombre ? ', ' + String(m.nombre).split(' ')[0] : '';
  const texto = c.ayuda
    ? `Buenas${nombre}. Le escribo por M.E.T.A.S: nos llegó su mensaje pidiendo ` +
      `información y aquí estoy para lo que necesite. ¿Le sirve que le cuente por ` +
      `aquí cómo empezar, o prefiere que hablemos?`
    : `Buenas${nombre}. Le escribo de la revista: ` +
      `recibimos lo que nos mandó por el buzón del lector (folio ${m.folio}), ` +
      `sobre «${(m.titulo || redPlano(m.texto) || '').trim().slice(0, 60)}». ` +
      `Quería confirmar unos datos con usted antes de publicarlo.`;
  const movil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  // Honduras es +504. Un número de ocho dígitos sin código no abre el
  // chat: WhatsApp lo da por inválido y no dice por qué.
  const conPais = tel.length === 8 ? '504' + tel : tel;
  window.open(movil
    ? 'https://wa.me/' + conPais + '?text=' + encodeURIComponent(texto)
    : 'https://web.whatsapp.com/send?phone=' + conPais + '&text=' + encodeURIComponent(texto), '_blank');
}

/* ── De envío a nota ──────────────────────────────────────────────
   Lo que pasa a la nota es el TEXTO y la FIRMA, que es lo que se
   imprime. Lo que NO pasa, a propósito, son el teléfono y el correo:
   la nota se exporta entera a Markdown y se pega en el programa de
   maquetación, y un teléfono pegado en una revista ya impresa no se
   despega. Al lector se le prometió que su número no se publica.
   Los datos de contacto se quedan aquí, a un toque, que es donde
   hacen falta: para llamarlo. */
async function redBuzonANota(m, cuantasFotos) {
  if (!_sb) return;
  const c = redClase(m.clase);

  // Va a la edición abierta más reciente; si no hay ninguna, al banco
  // de ideas, que es donde espera lo que todavía no tiene número.
  const abierta = _redEdiciones.find(e => !e.archivada);

  const firma = [m.nombre, m.cargo, m.lugar].filter(Boolean).join(', ');
  const cuerpo =
    redEsc(m.texto || '').replace(/\n/g, '<br>') +
    (firma ? `<br><br><b>· ${redEsc(firma)}</b>` : '');

  const fila = {
    edicion_id: abierta ? abierta.id : null,
    autor: redMiembro(),
    titulo: (m.titulo || redPlano(m.texto) || '').trim().slice(0, 140),
    seccion: c.sec,
    tipo: c.tipo,
    estado: 'borrador',
    entradilla: '',
    cuerpo,
  };

  const { data, error } = await _sb.from(RED_T_NOTAS).insert(fila).select().single();
  if (error) {
    console.error('[Buzón] Error creando la nota:', error);
    if (typeof toast === 'function') toast('No se pudo crear la nota');
    return;
  }
  _redNotas.unshift(data);
  await redEnvioEstado(m, 'atendido', '', false, data.id);

  redCerrarEnvio();
  if (typeof toast === 'function') {
    toast(cuantasFotos
      ? `En ${c.sec}. Las ${cuantasFotos} fotos siguen en el buzón`
      : `En ${c.sec}`);
  }
  redOpenEditor(data.id);
}

async function redDescartarEnvio(m) {
  const motivo = prompt(
    '¿Por qué se descarta?\n\nQueda anotado. No se le manda al lector, pero si vuelve a ' +
    'escribir o llama preguntando, aquí está la razón.', '');
  if (motivo === null) return;
  await redEnvioEstado(m, 'descartado', String(motivo || '').slice(0, 300), true);
  redCerrarEnvio();
}

/* Guarda el estado del envío. `repintar` es para cuando el cambio
   tiene que verse ya en la lista de detrás. */
async function redEnvioEstado(m, estado, motivo, repintar, notaId) {
  if (!_sb) return false;
  const cambios = {
    estado,
    motivo: motivo || m.motivo || '',
    visto_por: redMiembro(),
    visto_at: new Date().toISOString(),
  };
  if (notaId) cambios.nota_id = notaId;
  const { error } = await _sb.from(RED_T_BUZON).update(cambios).eq('id', m.id);
  if (error) {
    console.error('[Buzón] Error guardando el estado:', error);
    if (typeof toast === 'function') toast('No se pudo guardar (¿hay conexión?)');
    return false;
  }
  Object.assign(m, cambios);
  if (repintar) redRender(); else { redRenderCabecera(); redRenderChips(); }
  return true;
}

function redCerrarEnvio() {
  const ov = document.getElementById('red-buzon-overlay');
  if (ov) ov.style.display = 'none';
  _redEnvio = null;
  redRender();
}

/* ── El código QR que se pega en la revista ───────────────────────
   Es la boca del buzón. Sin él, la página existe y nadie la
   encuentra: quien lee la revista en papel no va a teclear una
   dirección a mano. */
function redAbrirQR() {
  const ov = document.getElementById('red-qr-overlay');
  const cu = document.getElementById('red-qr-cuerpo');
  if (!ov || !cu) return;

  if (typeof QR === 'undefined') {
    cu.innerHTML = '<div class="red-buz-vacio">No se pudo cargar el generador de códigos QR.</div>';
    ov.style.display = 'flex';
    return;
  }

  cu.innerHTML = `
    <div class="red-qr-caja">
      <canvas id="red-qr-lienzo"></canvas>
    </div>
    <div class="red-qr-url" id="red-qr-url">${redEsc(RED_BUZON_URL)}</div>
    <div class="red-qr-acciones">
      <button type="button" class="red-buz-btn red-buz-btn-1" id="red-qr-bajar">
        <i class="fa-solid fa-download"></i> Descargar para imprimir
      </button>
      <button type="button" class="red-buz-btn" id="red-qr-copiar">
        <i class="fa-solid fa-copy"></i> Copiar el enlace
      </button>
      <button type="button" class="red-buz-btn red-buz-btn-wa" id="red-qr-wa">
        <i class="fa-brands fa-whatsapp"></i> Mandarlo por WhatsApp
      </button>
    </div>
    <div class="red-qr-guia">
      <b>Cómo ponerlo en la revista.</b> Pégalo en un recuadro con un texto que
      diga para qué es: «<i>¿Pasó algo que merece contarse? Cuéntenoslo. Escanee
      y escriba: una nota, una opinión, una denuncia o una sugerencia. Y si en
      su escuela va a pasar algo, pida que se lo cubramos en Aulas en acción.</i>»
      <br><br>
      No lo hagas más chico de <b>2,5 cm</b> de lado, y déjale un margen blanco
      alrededor: sin ese margen los teléfonos no lo encuentran. El archivo que
      se descarga ya lo trae.
      <br><br>
      <b>El enlace no caduca ni cambia.</b> El número de la revista se guarda en
      una gaveta un año, y este QR tiene que seguir funcionando cuando alguien
      lo saque de ahí.
    </div>`;
  ov.style.display = 'flex';

  // Corrección alta (Q, aguanta un 25% dañado) porque esto acaba
  // fotocopiado, doblado y leído con mala luz.
  const lienzo = document.getElementById('red-qr-lienzo');
  QR.aCanvas(lienzo, RED_BUZON_URL, { nivel: 'Q', escala: 6, margen: 4 });
  lienzo.style.width = '100%';
  lienzo.style.maxWidth = '260px';
  lienzo.style.height = 'auto';
  lienzo.style.imageRendering = 'pixelated';   // que no lo desenfoque al escalar

  document.getElementById('red-qr-bajar').addEventListener('click', () => {
    // Grande de verdad: el que se ve en pantalla no sirve para papel.
    const a = document.createElement('a');
    a.href = QR.aPNG(RED_BUZON_URL, { nivel: 'Q', escala: 24, margen: 4 });
    a.download = 'buzon-del-lector-qr.png';
    document.body.appendChild(a); a.click(); a.remove();
    if (typeof toast === 'function') toast('Descargado. Ya se puede pegar en la revista');
  });
  document.getElementById('red-qr-copiar').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(RED_BUZON_URL);
      if (typeof toast === 'function') toast('Enlace copiado');
    } catch (_) {
      if (typeof toast === 'function') toast('No se pudo copiar');
    }
  });
  document.getElementById('red-qr-wa').addEventListener('click', () => {
    const movil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const texto = encodeURIComponent(redTextoInvitacion());
    window.open(movil ? 'https://wa.me/?text=' + texto
                      : 'https://web.whatsapp.com/send?text=' + texto, '_blank');
  });
}

/* El mensaje con el que se reparte el buzón. NO nombra a la revista:
   se pidió expreso, y así el mismo mensaje sirve para cualquier grupo
   sin tener que explicar de quién es. */
function redTextoInvitacion() {
  return '📬 *Buzón del lector*\n' +
    '¿Pasó algo que merece contarse? ¿Algo que está mal y debería saberse?\n' +
    'Mándelo aquí: una nota, una opinión, una denuncia o una sugerencia.\n' +
    'Y si en su escuela va a pasar algo, pida que se lo cubran en *Aulas en acción*.\n\n' +
    'Se escribe desde el teléfono, en un rato, y no hay que registrarse 👇\n' +
    RED_BUZON_URL;
}

function redCerrarQR() {
  const ov = document.getElementById('red-qr-overlay');
  if (ov) ov.style.display = 'none';
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
  redGuiaRender();             // la guía de citas, con el estilo de ESTA nota
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

/* ── Guía de citas: el estilo de cada nota ─────────────────────────
   La elección se guarda en el aparato (localStorage): es una preferencia
   de la guía, no un dato de la revista, y perderla no rompe nada. La
   última elegida queda como propuesta para la siguiente nota. */

function redEstilosLoad() {
  try { return JSON.parse(localStorage.getItem(RED_ESTILOS_KEY)) || {}; } catch (_) { return {}; }
}
function redEstiloDeNota(id) {
  const m = redEstilosLoad();
  return m['n' + id] || null;
}
function redSetEstilo(id, estilo) {
  const m = redEstilosLoad();
  m['n' + id] = estilo;
  m.ultimo = estilo;
  try { localStorage.setItem(RED_ESTILOS_KEY, JSON.stringify(m)); } catch (_) {}
}
function redEstiloInfo(id) {
  return RED_ESTILOS_CITA.find(e => e.id === id) || null;
}

function redGuiaPanelHtml(e) {
  if (!e) {
    return `<div class="red-guia-intro">
      Cada publicación elige <b>un</b> estilo y lo usa en toda la revista.
      El del subíndice que ya usas tiene nombre: <b>notas al pie</b> (Chicago)
      en humanidades, o <b>numérico</b> (Vancouver) en ciencias de la salud.
      En Latinoamérica el más pedido es <b>APA</b>; en artículos anglosajones
      verás APA, MLA, Chicago y Harvard. Toca uno arriba para ver cómo se usa,
      según su edición al día.
    </div>`;
  }
  const refs = e.referencias.map(r => `
    <div class="red-guia-ref">
      <span class="red-guia-ref-tipo">${r.tipo}</span>
      <span class="red-guia-plantilla">${r.plantilla}</span>
      ${r.ejemplo ? `<span class="red-guia-ejemplo">ej.: ${r.ejemplo}</span>` : ''}
    </div>`).join('');
  return `
    <div class="red-guia-vigente"><i class="fa-solid fa-circle-check"></i> ${e.vigente}</div>
    <div class="red-guia-sec"><span class="red-guia-sec-t">Dónde se usa</span>${e.uso}</div>
    <div class="red-guia-sec"><span class="red-guia-sec-t">En el texto</span>${e.enTexto}</div>
    <div class="red-guia-sec"><span class="red-guia-sec-t">La referencia</span>${refs}</div>
    <div class="red-guia-sec"><span class="red-guia-sec-t">Lo nuevo de esta edición</span>${e.novedades}</div>
    <div class="red-guia-sec red-guia-faro"><span class="red-guia-sec-t">Con las marcas [n] de F.A.R.O.</span>${e.faro}</div>`;
}

function redGuiaRender() {
  const chips = document.getElementById('red-guia-chips');
  const panel = document.getElementById('red-guia-panel');
  const badge = document.getElementById('red-guia-badge');
  if (!chips || !panel || _redNotaId === null) return;

  const activo = redEstiloDeNota(_redNotaId);
  if (badge) badge.textContent = activo ? (redEstiloInfo(activo) || {}).nombre || '' : '';

  chips.innerHTML = RED_ESTILOS_CITA.map(e => `
    <button type="button" class="red-guia-chip ${e.id === activo ? 'red-guia-chip-activo' : ''}" data-estilo="${e.id}">
      ${e.nombre} <span class="red-guia-chip-sis">${e.sistema}</span>
    </button>`).join('');
  chips.querySelectorAll('[data-estilo]').forEach(btn =>
    btn.addEventListener('click', () => {
      redSetEstilo(_redNotaId, btn.dataset.estilo);
      redGuiaRender();
    }));

  panel.innerHTML = redGuiaPanelHtml(redEstiloInfo(activo));
}

/* ── Recuperar lo que no llegó a la nube ───────────────────────────
   Al abrir una nota se compara lo que vino de la nube con la última copia
   local. Si la de aquí es más nueva y distinta, se dice, no se aplica
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

  // La plantilla del estilo elegido, justo donde se escribe la referencia
  const pl = document.getElementById('red-cita-plantilla');
  if (pl) {
    const est = redEstiloInfo(redEstiloDeNota(_redNotaId));
    pl.innerHTML = est
      ? `✍️ <b>${est.nombre}</b> · ${est.referencias[0].tipo}: ${est.referencias[0].plantilla}`
      : 'Elige un estilo en 📚 <b>Guía de citas</b> (bajo la nota) y aquí verás su plantilla.';
  }
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
  // El estilo elegido en la guía viaja como etiqueta, y si es de los
  // autor–año se recuerda que la lista final va alfabética: quien maqueta
  // no tiene por qué saberse cada norma de memoria.
  const estilo = redEstiloInfo(redEstiloDeNota(n.id));
  const etiqueta = estilo
    ? ` *(formato ${estilo.nombre}${estilo.orden === 'alfabetico' ? ': ordénalas alfabéticamente al maquetar' : ''})*`
    : '';
  const refs = citas.length
    ? `\n**Referencias**${etiqueta}\n` + citas.map(c =>
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

  // El buzón del lector
  document.getElementById('red-qr-btn')?.addEventListener('click', redAbrirQR);
  document.getElementById('red-buzon-close')?.addEventListener('click', redCerrarEnvio);
  document.getElementById('red-buzon-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'red-buzon-overlay') redCerrarEnvio();
  });
  document.getElementById('red-qr-close')?.addEventListener('click', redCerrarQR);
  document.getElementById('red-qr-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'red-qr-overlay') redCerrarQR();
  });

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
  /* Letra y Tamaño: aplicación VERIFICADA con plan B.
     En algunas tabletas execCommand('fontSize') se traga la orden sin
     hacer nada ni avisar (pasó en casa: el botón parecía muerto). Ahora
     se comprueba si el HTML cambió; si el navegador ignoró la orden, la
     envoltura <font> se pone a mano con el mismo resultado. Y si no hay
     nada marcado, en vez de callar se enseña qué hacer. */
  const redAplicarFuente = (cmd, attr, valor) => {
    redRestaurarSeleccion();   // devuelve al cuerpo lo que estaba marcado
    const sel = window.getSelection();
    const rangoOk = sel && sel.rangeCount && redRangoEnCuerpo(cuerpoEl, sel.getRangeAt(0));
    if (!rangoOk || sel.getRangeAt(0).collapsed) {
      if (typeof toast === 'function') toast('🖐️ Marca primero la palabra o frase (déjala pintada) y luego elige aquí');
      return;
    }
    const rango = sel.getRangeAt(0);
    // Si la selección muerde una marca de cita, se la traga entera: partirla
    // duplicaría la marca (y su referencia) al extraer el contenido.
    const supIni = rango.startContainer.parentElement?.closest('sup.red-cita');
    if (supIni) rango.setStartBefore(supIni);
    const supFin = rango.endContainer.parentElement?.closest('sup.red-cita');
    if (supFin) rango.setEndAfter(supFin);

    const foto = redFotoCitas();
    const antes = cuerpoEl.innerHTML;
    document.execCommand(cmd, false, valor);
    if (cuerpoEl.innerHTML === antes) {
      // El navegador ignoró la orden: mismo efecto, hecho a mano
      const envoltura = document.createElement('font');
      envoltura.setAttribute(attr, valor);
      try {
        envoltura.appendChild(rango.extractContents());
        rango.insertNode(envoltura);
        const nr = document.createRange();
        nr.selectNodeContents(envoltura);
        sel.removeAllRanges();
        sel.addRange(nr);
        redGuardarSeleccion();
      } catch (_) {
        if (typeof toast === 'function') toast('No se pudo aplicar ahí: prueba marcando un trozo más simple');
        return;
      }
    }
    redRepararCitas(foto);
    redQueueSave();
  };
  const aplicarFormato = (selId, cmd, attr) => {
    const sel = document.getElementById(selId);
    sel?.addEventListener('change', () => {
      if (!sel.value) return;
      const valor = sel.value;
      sel.value = ''; // el select actúa como menú: vuelve a su etiqueta
      redAplicarFuente(cmd, attr, valor);
    });
  };
  aplicarFormato('red-e-fuente', 'fontName', 'face');
  aplicarFormato('red-e-tamano', 'fontSize', 'size');

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
  // CON una excepción: si lo copiado trae marcas de cita (reordenar párrafos
  // propios con cortar y pegar) se reconstruyen texto y marcas, nada más.
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

  // Guía de citas: desplegar y recoger
  document.getElementById('red-guia-toggle')?.addEventListener('click', () => {
    _redGuiaAbierta = !_redGuiaAbierta;
    const cuerpo = document.getElementById('red-guia-cuerpo');
    const chev   = document.getElementById('red-guia-chev');
    if (cuerpo) cuerpo.style.display = _redGuiaAbierta ? 'block' : 'none';
    if (chev) chev.classList.toggle('red-guia-chev-abierta', _redGuiaAbierta);
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
