'use strict';

/* ─────────────────────────────────────────────
   LA BÓVEDA 🗄 · los documentos personales de la familia
   Partidas, identidades, títulos, licencias, escrituras, recibos.

   Dos reglas mandan sobre todo lo demás en este archivo:

   1. EL DEPÓSITO ES PRIVADO. Se ve y se baja SOLO con enlaces firmados
      que caducan: createSignedUrl, y nunca la otra llamada de Storage,
      la que devuelve una dirección fija y sin firmar. Con el depósito
      privado esa otra no falla: devuelve una dirección que da 400, así
      que el error se leería como «el archivo no abre» en vez de como un
      aviso de seguridad. Y el día que alguien «arreglara» eso poniendo
      el depósito en público, esas direcciones quedarían abiertas para
      siempre, con las partidas de nacimiento de dos niñas dentro.
      (El nombre exacto de esa llamada prohibida no se escribe en este
      archivo a propósito: la sonda lo busca con grep y encontrarlo aquí,
      aunque fuera dentro de un comentario, daría un falso positivo.)

   2. AVISAR DE LO QUE VENCE es la mitad de la utilidad de tener esto.
      Un pasaporte o una licencia que caducan sin que nadie se entere
      cuestan dinero y viajes. Por eso la lista se ordena por lo que
      vence primero y lo vencido se cuenta aparte, arriba del todo.

   La tabla y el depósito los crea supabase/sql/boveda_documentos.sql, y
   los nombres de aquí salen de ahí: cambiar uno sin el otro rompe las
   subidas con un error de restricción que la familia no sabe leer.
───────────────────────────────────────────── */

const BOV_TABLA     = 'documentos';
const BOV_DEPOSITO  = 'documentos';

/* 10 MB: el mismo número que el check de archivo_bytes en el SQL y que el
   file_size_limit del depósito. Si los tres no coinciden, el rechazo llega
   como un error crudo del servidor en vez de como un mensaje entendible.
   Y el límite existe porque la familia sube desde el teléfono con datos
   escasos: mejor avisar antes de gastarlos que a la mitad de la subida. */
const BOV_MAX_BYTES = 10485760;

/* 60 segundos para el enlace firmado. Basta para abrir o descargar, y si
   el enlace se filtra (queda en el historial, en un registro, en una
   captura) caduca antes de servirle a nadie. */
const BOV_URL_SEGUNDOS = 60;

/* Un mes de aviso: lo que tarda en la práctica renovar una licencia o un
   pasaporte pidiendo cita. Avisar el mismo día no sirve de nada. */
const BOV_DIAS_AVISO = 30;

/* De quién es el documento. Los cuatro identificadores son los mismos que
   usa familia_miembros, más «familia» para lo de la casa (escrituras,
   recibos). La lista está cerrada también en el SQL: si no coincide, el
   insert se rechaza. */
const BOV_QUIENES = [
  { id: 'josue',   etiqueta: 'Josué'   },
  { id: 'evelyn',  etiqueta: 'Evelyn'  },
  { id: 'jael',    etiqueta: 'Jael'    },
  { id: 'angelly', etiqueta: 'Angelly' },
  { id: 'familia', etiqueta: 'Familia' },
];

/* Los tipos acordados con el SQL. Ahí la columna es texto libre a
   propósito, no lista cerrada, justo para que esta lista se pueda ampliar
   sin tocar la base de datos. */
const BOV_TIPOS = [
  { id: 'partida',   etiqueta: 'Partida',    icono: 'fa-certificate'   },
  { id: 'identidad', etiqueta: 'Identidad',  icono: 'fa-id-card'       },
  { id: 'titulo',    etiqueta: 'Título',     icono: 'fa-graduation-cap'},
  { id: 'licencia',  etiqueta: 'Licencia',   icono: 'fa-car'           },
  { id: 'escritura', etiqueta: 'Escritura',  icono: 'fa-house'         },
  { id: 'recibo',    etiqueta: 'Recibo',     icono: 'fa-receipt'       },
  { id: 'medico',    etiqueta: 'Médico',     icono: 'fa-notes-medical' },
  { id: 'otro',      etiqueta: 'Otro',       icono: 'fa-file-lines'    },
];

let _bovCache       = [];   // las fichas tal y como vinieron, ya ordenadas
let _bovFiltroQuien = '';   // '' = de todos
let _bovFiltroTipo  = '';   // '' = de todos los tipos
let _bovBusqueda    = '';
let _bovSubiendo    = false; // evita la doble subida del doble toque

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/* EL CLIENTE COMPARTIDO, Y NINGUNO MÁS.
   _sb lo declara js/chat.js con «const _sb = window.faroSb», que a su vez
   sale del único cliente que crea js/auth.js. Aquí NO se crea otro, y por
   eso este archivo no llama en ninguna línea a la función de la librería
   que fabrica clientes: la tanda anterior se rompió justamente así, con
   la sesión viviendo en un cliente y los datos pasando por otro que iba
   como anónimo; con la seguridad por fila encendida eso deja la casa muda
   (cero filas, sin error) como si los documentos se hubieran perdido.
   El typeof es para que el módulo se pueda cargar suelto en una sonda,
   sin chat.js, sin reventar con un ReferenceError. */
function bovCliente() {
  return (typeof _sb !== 'undefined' && _sb) ? _sb : null;
}

function bovEtiquetaQuien(id) {
  const q = BOV_QUIENES.find(x => x.id === id);
  return q ? q.etiqueta : (id || 'Sin dueño');
}

function bovTipo(id) {
  return BOV_TIPOS.find(x => x.id === id) ||
         { id: id || 'otro', etiqueta: id || 'Otro', icono: 'fa-file-lines' };
}

/* Días que faltan para que venza. Negativo si ya venció, null si no caduca.

   Ojo con la fecha: la columna llega como «2026-08-01» y
   new Date('2026-08-01') se interpreta como medianoche UTC, que en
   Honduras (UTC-6) es el 31 de julio a las 6 de la tarde. Un documento que
   vence hoy se contaría como vencido ayer, y el aviso saldría un día antes
   siempre. Por eso se arma la fecha por partes, en hora local. */
function bovDias(vence) {
  if (!vence) return null;
  const p = String(vence).slice(0, 10).split('-').map(Number);
  if (p.length !== 3 || p.some(n => !Number.isFinite(n))) return null;
  const dia = new Date(p[0], p[1] - 1, p[2]);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((dia.getTime() - hoy.getTime()) / 86400000);
}

function bovEstadoVence(vence) {
  const d = bovDias(vence);
  if (d === null)            return 'sin';
  if (d < 0)                 return 'vencido';
  if (d <= BOV_DIAS_AVISO)   return 'pronto';
  return 'vigente';
}

function bovFecha(iso) {
  if (!iso) return '';
  const p = String(iso).slice(0, 10).split('-');
  if (p.length !== 3) return String(iso);
  return `${Number(p[2])}/${Number(p[1])}/${p[0]}`;
}

function bovPeso(bytes) {
  const n = Number(bytes || 0);
  if (!n) return '';
  if (n < 1024)        return `${n} B`;
  if (n < 1048576)     return `${Math.round(n / 1024)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

/* El nombre del archivo viaja dentro de una ruta y esa ruta viaja en una
   URL firmada. Tildes, espacios y eñes se escapan mal por el camino, y una
   barra o unos puntos dobles serían un salto de directorio (el SQL rechaza
   «..» y las rutas absolutas, pero mejor no llegar a que los rechace).
   Se conserva la extensión aparte para que recortar el nombre largo no la
   deje en «.pd». */
function bovSanearNombre(nombre) {
  /* Primero se tira todo lo que parezca carpeta y se queda el último
     trozo. Sin esto, «../../etc/passwd» no tiene extensión pero el punto
     de «..» hace de separador y salía «documento.etc-passwd»: inofensivo,
     porque después se limpia, pero un nombre absurdo en el depósito. */
  const bruto = String(nombre || '').split(/[\\/]/).pop();
  const punto = bruto.lastIndexOf('.');
  const base  = punto > 0 ? bruto.slice(0, punto)  : bruto;
  const ext   = punto > 0 ? bruto.slice(punto + 1) : '';

  const limpiar = (s) => String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   /* quita las tildes: la ruta viaja dentro de una URL firmada */
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  const b = limpiar(base).slice(0, 60).replace(/-+$/, '') || 'documento';
  const e = limpiar(ext).slice(0, 10);
  return e ? `${b}.${e}` : b;
}

function bovAviso(msg) {
  if (typeof toast === 'function') toast(msg);
  else console.warn('[Bóveda]', msg);
}

/* Mensaje dentro del formulario. El toast se va solo en dos segundos y
   quien está peleando con una subida que falla necesita volver a leerlo. */
function bovMensajeForm(texto, esError) {
  const el = document.getElementById('bov-form-msg');
  if (!el) return;
  if (!texto) { el.style.display = 'none'; el.textContent = ''; return; }
  el.textContent = texto;
  el.className = 'bov-form-msg' + (esError ? ' bov-form-msg-error' : '');
  el.style.display = 'block';
}

/* ─────────────────────────────────────────────
   CARGA Y LISTA
───────────────────────────────────────────── */

async function initBoveda() {
  const list = document.getElementById('bov-list');
  if (!list) return;

  const sb = bovCliente();
  if (!sb) {
    list.innerHTML = '<div class="fin-empty">No se pudo conectar con la Bóveda.</div>';
    return;
  }

  bovRenderChips();

  /* El orden lo pide la base de datos, no el navegador: lo que vence
     primero arriba, los que no caducan al final (nullsFirst: false) y
     entre ellos lo último subido. Ordenar aquí obligaría a traerlo todo
     antes de poder pintar nada. */
  const { data, error } = await sb.from(BOV_TABLA)
    .select('*')
    .order('vence', { ascending: true, nullsFirst: false })
    .order('creado_at', { ascending: false });

  if (error) {
    console.error('[Bóveda] Error cargando documentos:', error);
    list.innerHTML = '<div class="fin-empty">No se pudieron cargar los documentos.</div>';
    return;
  }

  _bovCache = data || [];
  bovRenderResumen();
  bovRenderLista();
}

function bovRenderResumen() {
  const totalEl   = document.getElementById('bov-total');
  const prontoEl  = document.getElementById('bov-por-vencer');
  const vencidoEl = document.getElementById('bov-vencidos');

  const vencidos = _bovCache.filter(d => bovEstadoVence(d.vence) === 'vencido');
  const pronto   = _bovCache.filter(d => bovEstadoVence(d.vence) === 'pronto');

  if (totalEl)   totalEl.textContent   = _bovCache.length;
  if (prontoEl)  prontoEl.textContent  = pronto.length;
  if (vencidoEl) vencidoEl.textContent = vencidos.length;

  /* La franja de aviso. Va aparte de las tarjetas porque un número en una
     tarjeta se mira y se olvida; esto dice qué documento es y qué hacer. */
  const avisoEl = document.getElementById('bov-aviso');
  if (!avisoEl) return;

  if (!vencidos.length && !pronto.length) {
    avisoEl.style.display = 'none';
    avisoEl.textContent = '';
    return;
  }

  const partes = [];
  if (vencidos.length) {
    partes.push(`${vencidos.length} documento${vencidos.length === 1 ? '' : 's'} ya vencido${vencidos.length === 1 ? '' : 's'}`);
  }
  if (pronto.length) {
    partes.push(`${pronto.length} vence${pronto.length === 1 ? '' : 'n'} en menos de ${BOV_DIAS_AVISO} días`);
  }

  avisoEl.innerHTML = '';
  avisoEl.className = 'bov-aviso ' + (vencidos.length ? 'bov-aviso-vencido' : 'bov-aviso-pronto');

  const icono = document.createElement('i');
  icono.className = 'fa-solid fa-triangle-exclamation';
  avisoEl.appendChild(icono);

  const texto = document.createElement('span');
  const primero = vencidos[0] || pronto[0];
  texto.textContent = ` ${partes.join(' y ')}. El primero: ${primero.titulo} (${bovFecha(primero.vence)}).`;
  avisoEl.appendChild(texto);

  avisoEl.style.display = 'flex';
}

function bovRenderChips() {
  const wrapQuien = document.getElementById('bov-filter-quien');
  if (wrapQuien && !wrapQuien.dataset.listo) {
    wrapQuien.dataset.listo = '1';
    wrapQuien.appendChild(bovChip('Todos', '', 'quien', true));
    BOV_QUIENES.forEach(q => wrapQuien.appendChild(bovChip(q.etiqueta, q.id, 'quien', false)));
  }
  const wrapTipo = document.getElementById('bov-filter-tipo');
  if (wrapTipo && !wrapTipo.dataset.listo) {
    wrapTipo.dataset.listo = '1';
    wrapTipo.appendChild(bovChip('Todo', '', 'tipo', true));
    BOV_TIPOS.forEach(t => wrapTipo.appendChild(bovChip(t.etiqueta, t.id, 'tipo', false)));
  }
}

function bovChip(etiqueta, valor, grupo, activo) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'bov-chip' + (activo ? ' active' : '');
  b.textContent = etiqueta;
  b.dataset.valor = valor;
  b.addEventListener('click', () => {
    const wrap = b.parentElement;
    if (wrap) wrap.querySelectorAll('.bov-chip').forEach(c => c.classList.remove('active'));
    b.classList.add('active');
    if (grupo === 'quien') _bovFiltroQuien = valor;
    else                   _bovFiltroTipo  = valor;
    bovRenderLista();
  });
  return b;
}

function bovRenderLista() {
  const container = document.getElementById('bov-list');
  if (!container) return;

  let lista = _bovCache;
  if (_bovFiltroQuien) lista = lista.filter(d => d.de_quien === _bovFiltroQuien);
  if (_bovFiltroTipo)  lista = lista.filter(d => d.tipo === _bovFiltroTipo);
  if (_bovBusqueda.trim()) {
    const q = _bovBusqueda.trim().toLowerCase();
    lista = lista.filter(d =>
      (d.titulo || '').toLowerCase().includes(q) ||
      (d.notas  || '').toLowerCase().includes(q) ||
      (d.archivo_nombre || '').toLowerCase().includes(q));
  }

  if (!lista.length) {
    container.innerHTML = _bovCache.length
      ? '<div class="fin-empty">Ningún documento coincide con la búsqueda.</div>'
      : '<div class="fin-empty">Todavía no hay documentos guardados.</div>';
    return;
  }

  container.innerHTML = '';
  lista.forEach(doc => container.appendChild(bovRenderTarjeta(doc)));
}

function bovRenderTarjeta(doc) {
  const card = document.createElement('div');
  card.className = 'bov-card';

  const tipo = bovTipo(doc.tipo);

  const icono = document.createElement('div');
  icono.className = 'bov-card-icon';
  icono.innerHTML = `<i class="fa-solid ${tipo.icono}"></i>`;
  card.appendChild(icono);

  const main = document.createElement('div');
  main.className = 'bov-card-main';

  const titulo = document.createElement('div');
  titulo.className = 'bov-card-title';
  /* textContent y no innerHTML: el título lo escribe la familia y podría
     traer «<» o «&» de un nombre copiado y pegado. */
  titulo.textContent = doc.titulo || 'Sin título';
  main.appendChild(titulo);

  const meta = document.createElement('div');
  meta.className = 'bov-card-meta';
  const trozos = [bovEtiquetaQuien(doc.de_quien), tipo.etiqueta];
  if (doc.emitido)       trozos.push(`emitido ${bovFecha(doc.emitido)}`);
  if (doc.archivo_bytes) trozos.push(bovPeso(doc.archivo_bytes));
  meta.textContent = trozos.join(' · ');
  main.appendChild(meta);

  const estado = bovEstadoVence(doc.vence);
  if (estado !== 'sin') {
    const dias = bovDias(doc.vence);
    const badge = document.createElement('span');
    badge.className = 'bov-vence-badge bov-vence-' + estado;
    if (estado === 'vencido') {
      const d = Math.abs(dias);
      badge.textContent = d === 0
        ? `Vence hoy · ${bovFecha(doc.vence)}`
        : `Vencido hace ${d} día${d === 1 ? '' : 's'} · ${bovFecha(doc.vence)}`;
    } else if (estado === 'pronto') {
      badge.textContent = dias === 0
        ? `Vence hoy · ${bovFecha(doc.vence)}`
        : `Vence en ${dias} día${dias === 1 ? '' : 's'} · ${bovFecha(doc.vence)}`;
    } else {
      badge.textContent = `Vence ${bovFecha(doc.vence)}`;
    }
    main.appendChild(badge);
  }

  if (doc.notas) {
    const notas = document.createElement('div');
    notas.className = 'bov-card-notes';
    notas.textContent = doc.notas;
    main.appendChild(notas);
  }

  card.appendChild(main);

  const tools = document.createElement('div');
  tools.className = 'bov-card-tools';

  const btnVer = document.createElement('button');
  btnVer.type = 'button';
  btnVer.className = 'bov-tool';
  btnVer.setAttribute('aria-label', 'Ver documento');
  btnVer.title = 'Ver';
  btnVer.innerHTML = '<i class="fa-solid fa-eye"></i>';
  btnVer.addEventListener('click', () => bovVer(doc));
  tools.appendChild(btnVer);

  const btnBajar = document.createElement('button');
  btnBajar.type = 'button';
  btnBajar.className = 'bov-tool';
  btnBajar.setAttribute('aria-label', 'Descargar documento');
  btnBajar.title = 'Descargar';
  btnBajar.innerHTML = '<i class="fa-solid fa-download"></i>';
  btnBajar.addEventListener('click', () => bovDescargar(doc));
  tools.appendChild(btnBajar);

  /* Corregir los DATOS, sin tocar el archivo. Va antes de borrar a proposito:
     el que quiere arreglar una fecha encuentra este boton primero y no acaba
     borrando el documento para volverlo a subir. */
  const btnEditar = document.createElement('button');
  btnEditar.type = 'button';
  btnEditar.className = 'bov-tool';
  btnEditar.setAttribute('aria-label', 'Corregir los datos del documento');
  btnEditar.title = 'Corregir los datos';
  btnEditar.innerHTML = '<i class="fa-solid fa-pen"></i>';
  btnEditar.addEventListener('click', () => bovEditar(doc));
  tools.appendChild(btnEditar);

  const btnBorrar = document.createElement('button');
  btnBorrar.type = 'button';
  btnBorrar.className = 'bov-tool bov-tool-del';
  btnBorrar.setAttribute('aria-label', 'Eliminar documento');
  btnBorrar.title = 'Eliminar';
  btnBorrar.innerHTML = '<i class="fa-solid fa-trash"></i>';
  btnBorrar.addEventListener('click', () => bovBorrar(doc));
  tools.appendChild(btnBorrar);

  card.appendChild(tools);
  return card;
}

/* ─────────────────────────────────────────────
   VER Y DESCARGAR · siempre con enlace firmado
───────────────────────────────────────────── */

/* SIEMPRE FIRMADO, nunca la dirección pública sin firmar. El depósito es
   privado y esa otra llamada devolvería una dirección que da 400:
   parecería que el archivo está roto. Y si para «arreglarlo» alguien
   abriera el depósito, todas esas direcciones quedarían públicas para
   siempre. */
async function bovEnlaceFirmado(doc, descargar) {
  const sb = bovCliente();
  if (!sb) { bovAviso('No se pudo conectar con la Bóveda'); return null; }
  if (!doc || !doc.archivo_ruta) { bovAviso('Esta ficha no tiene archivo'); return null; }

  const opciones = descargar ? { download: doc.archivo_nombre || 'documento' } : undefined;
  const { data, error } = await sb.storage
    .from(BOV_DEPOSITO)
    .createSignedUrl(doc.archivo_ruta, BOV_URL_SEGUNDOS, opciones);

  if (error || !data || !data.signedUrl) {
    console.error('[Bóveda] No se pudo firmar el enlace:', error);
    bovAviso('No se pudo abrir el documento');
    return null;
  }
  return data.signedUrl;
}

async function bovVer(doc) {
  /* Se abre la pestaña ANTES de pedir el enlace, todavía dentro del gesto del
     usuario, y se le pone la dirección cuando llega. Al revés, después de un
     await, el navegador ya no lo cuenta como gesto y el bloqueador la para.
     Y sin 'noopener' en las características: con esa palabra, window.open
     devuelve null SIEMPRE, aunque la pestaña se abra perfectamente, así que la
     comprobación de «bloqueó la ventana» saltaba en cada toque y avisaba de un
     problema que no existía. La protección se pone con w.opener = null, que
     hace lo mismo y sí deja comprobar. */
  const w = window.open('', '_blank');
  if (!w) {
    bovAviso('El navegador bloqueó la ventana. Permite las ventanas emergentes y vuelve a tocar.');
    return;
  }
  try { w.opener = null; } catch (_) {}
  const url = await bovEnlaceFirmado(doc, false);
  if (!url) { try { w.close(); } catch (_) {} return; }
  w.location.replace(url);
}

async function bovDescargar(doc) {
  const url = await bovEnlaceFirmado(doc, true);
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.archivo_nombre || 'documento';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ─────────────────────────────────────────────
   SUBIR
───────────────────────────────────────────── */

/* Qué ficha se está corrigiendo, o null si se va a subir una nueva. Un solo
   formulario para las dos cosas: son los mismos campos y mantener dos
   formularios gemelos es la forma segura de que uno se quede atrás. */
let _bovEditando = null;

function bovAbrirModal() {
  const overlay = document.getElementById('bov-modal-overlay');
  if (!overlay) return;
  _bovEditando = null;
  document.getElementById('bov-form')?.reset();
  bovMensajeForm('');

  const tit = document.getElementById('bov-modal-title');
  if (tit) tit.textContent = 'Guardar Documento';
  const btn = document.getElementById('bov-submit-btn');
  if (btn) btn.textContent = 'Guardar Documento';
  /* Al subir, el archivo es obligatorio y se ve. */
  const campoArch = document.getElementById('bov-campo-archivo');
  if (campoArch) campoArch.style.display = '';
  const arch = document.getElementById('bov-f-archivo');
  if (arch) arch.required = true;

  overlay.style.display = 'flex';
  setTimeout(() => document.getElementById('bov-f-titulo')?.focus(), 80);
}

/* Corregir los DATOS de un documento, sin tocar el archivo.
   Por qué hacía falta: sin esto, arreglar un año mal escrito obligaba a borrar
   el documento y volverlo a subir, o sea a destruir el archivo bueno para
   cambiar una letra. En una bóveda de papeles eso es inaceptable, y encima
   invita a dejar el dato mal. El servidor ya lo permitía: la política es
   «for all» con es_familia(). */
function bovEditar(doc) {
  const overlay = document.getElementById('bov-modal-overlay');
  if (!overlay || !doc) return;
  _bovEditando = doc;
  document.getElementById('bov-form')?.reset();
  bovMensajeForm('');

  const v = (id, val) => { const el = document.getElementById(id); if (el) el.value = val == null ? '' : val; };
  v('bov-f-titulo',  doc.titulo);
  v('bov-f-quien',   doc.de_quien || 'familia');
  v('bov-f-tipo',    doc.tipo || 'otro');
  v('bov-f-emitido', doc.emitido);
  v('bov-f-vence',   doc.vence);
  v('bov-f-notas',   doc.notas);

  const tit = document.getElementById('bov-modal-title');
  if (tit) tit.textContent = 'Corregir los datos';
  const btn = document.getElementById('bov-submit-btn');
  if (btn) btn.textContent = 'Guardar los cambios';
  /* El archivo no se cambia aquí: se esconde el campo y deja de ser obligatorio.
     Para cambiar el archivo se sube otro documento y se borra el viejo, que es
     lo honesto: un archivo distinto es otro documento. */
  const campoArch = document.getElementById('bov-campo-archivo');
  if (campoArch) campoArch.style.display = 'none';
  const arch = document.getElementById('bov-f-archivo');
  if (arch) { arch.required = false; arch.value = ''; }

  overlay.style.display = 'flex';
  setTimeout(() => document.getElementById('bov-f-titulo')?.focus(), 80);
}

function bovCerrarModal() {
  const overlay = document.getElementById('bov-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  _bovEditando = null;
  document.getElementById('bov-form')?.reset();
  bovMensajeForm('');
}

async function bovSubmitForm(e) {
  e.preventDefault();
  if (_bovSubiendo) return;

  const sb = bovCliente();
  if (!sb) { bovMensajeForm('No hay conexión con la Bóveda. Vuelve a entrar.', true); return; }

  const titulo  = (document.getElementById('bov-f-titulo')?.value || '').trim();
  const deQuien = document.getElementById('bov-f-quien')?.value || 'familia';
  const tipo    = document.getElementById('bov-f-tipo')?.value  || 'otro';
  const emitido = document.getElementById('bov-f-emitido')?.value || null;
  const vence   = document.getElementById('bov-f-vence')?.value   || null;
  const notas   = (document.getElementById('bov-f-notas')?.value || '').trim() || null;
  const input   = document.getElementById('bov-f-archivo');
  const archivo = input && input.files ? input.files[0] : null;

  if (!titulo)  { bovMensajeForm('Ponle un título al documento.', true); return; }

  /* ── Corregir los datos de una ficha que ya existe ──
     No toca Storage en absoluto: el archivo se queda donde está. */
  if (_bovEditando) {
    if (emitido && vence && vence < emitido) {
      bovMensajeForm('La fecha de vencimiento es anterior a la de emisión. Revisa el año.', true);
      return;
    }
    const btnE = document.getElementById('bov-submit-btn');
    _bovSubiendo = true;
    if (btnE) { btnE.disabled = true; btnE.textContent = 'Guardando…'; }
    const { error: errUpd } = await sb.from(BOV_TABLA).update({
      de_quien: deQuien, titulo, tipo,
      emitido: emitido || null, vence: vence || null, notas,
    }).eq('id', _bovEditando.id);
    _bovSubiendo = false;
    if (btnE) { btnE.disabled = false; btnE.textContent = 'Guardar los cambios'; }
    if (errUpd) {
      console.error('[Bóveda] Error corrigiendo la ficha:', errUpd);
      bovMensajeForm('No se pudieron guardar los cambios. El documento sigue como estaba.', true);
      return;
    }
    bovCerrarModal();
    bovAviso('✏️ Datos corregidos');
    bovListar();
    return;
  }

  if (!archivo) { bovMensajeForm('Elige el archivo que quieres guardar.', true); return; }

  if (archivo.size > BOV_MAX_BYTES) {
    bovMensajeForm(`El archivo pesa ${bovPeso(archivo.size)} y el máximo son 10 MB. Toma la foto en calidad normal o comprime el PDF.`, true);
    return;
  }
  if (archivo.size === 0) {
    bovMensajeForm('El archivo está vacío (0 bytes). Vuelve a elegirlo.', true);
    return;
  }
  /* La misma comprobación que el check del SQL, para que el dedazo del año
     salga como un mensaje y no como un error de restricción. */
  if (emitido && vence && vence < emitido) {
    bovMensajeForm('La fecha de vencimiento es anterior a la de emisión. Revisa el año.', true);
    return;
  }

  /* EL SEGURO VA ANTES DEL PRIMER await, no despues. Puesto mas abajo no
     servia de nada: entre el toque y la primera respuesta de red hay tiempo
     de sobra para un segundo toque, y el documento se subia dos veces. La
     regla general: la guarda se echa antes de ceder el control. */
  const btn = document.getElementById('bov-submit-btn');
  _bovSubiendo = true;
  if (btn) { btn.disabled = true; btn.textContent = 'Subiendo…'; }
  bovMensajeForm('Subiendo el archivo…', false);

  /* Y como ahora se sale por varios sitios, un solo lugar que suelte el
     seguro, para no olvidarlo en alguna rama. */
  const soltar = () => {
    _bovSubiendo = false;
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar Documento'; }
  };

  /* Quién sube, para armar la ruta. La columna subido_por NO se manda: la
     rellena la base de datos con auth.uid(), que es el dato de verdad y no
     se puede falsear desde el navegador. */
  const { data: quien } = await sb.auth.getUser();
  const uid = quien && quien.user ? quien.user.id : null;
  if (!uid) {
    bovMensajeForm('La sesión se cerró. Vuelve a entrar y prueba de nuevo.', true);
    soltar();
    return;
  }

  /* «<uuid>/<marca de tiempo>-<nombre saneado>»: el uuid separa lo de cada
     quien y la marca de tiempo evita chocar con un archivo del mismo
     nombre. Que no se pueda adivinar importa aunque el depósito sea
     privado: es la segunda cerradura si algún día se afloja la primera. */
  const ruta = `${uid}/${Date.now()}-${bovSanearNombre(archivo.name)}`;

  const { error: errSubida } = await sb.storage
    .from(BOV_DEPOSITO)
    .upload(ruta, archivo, {
      contentType: archivo.type || 'application/octet-stream',
      upsert: false,   /* nunca pisar un objeto existente: sería perder un documento */
      /* '0' a proposito. Por omision Storage manda cache-control de una hora,
         o sea que el documento sobrevive en la cache sesenta veces mas que el
         enlace firmado que lo autoriza. Un pasaporte no se queda cacheado. */
      cacheControl: '0',
    });

  if (errSubida) {
    console.error('[Bóveda] Error subiendo el archivo:', errSubida);
    bovMensajeForm('No se pudo subir el archivo. Revisa la conexión y prueba otra vez.', true);
    soltar();
    return;
  }

  const fila = {
    de_quien:       deQuien,
    titulo,
    tipo,
    emitido:        emitido || null,
    vence:          vence   || null,
    notas,
    archivo_ruta:   ruta,
    archivo_nombre: archivo.name,
    archivo_tipo:   archivo.type || null,
    archivo_bytes:  archivo.size,
  };

  const { error: errFila } = await sb.from(BOV_TABLA).insert(fila);

  if (errFila) {
    console.error('[Bóveda] Error guardando la ficha:', errFila);

    /* ⚠️ NO SE BORRA POR SOSPECHA. Aquí la primera versión borraba el archivo
       sin más, y eso podía destruir un documento bien guardado: si la fila SÍ
       entró y lo que fallo fue la respuesta (se corto la red despues de
       escribir, o venció el tiempo de espera), el error llega igual, se borraba
       el archivo y quedaba una ficha que se ve, se toca y no abre. Un
       documento perdido en silencio, que es lo peor que puede hacer una
       boveda.
       Asi que primero se pregunta si la ficha existe. Solo se borra el archivo
       cuando se sabe que NO hay ficha que lo reclame. */
    let hayFicha = null;   /* null = no se pudo averiguar */
    try {
      const { data: encontrada, error: errBusca } = await sb
        .from(BOV_TABLA).select('id').eq('archivo_ruta', ruta).maybeSingle();
      if (!errBusca) hayFicha = !!encontrada;
    } catch (_) { hayFicha = null; }

    if (hayFicha === true) {
      /* El documento está completo. Lo que fallo fue enterarse. */
      bovMensajeForm('El documento sí quedó guardado, aunque la respuesta se perdió. Revisa la lista.', false);
      soltar();
      bovListar();
      return;
    }

    if (hayFicha === false) {
      const { error: errLimpieza } = await sb.storage.from(BOV_DEPOSITO).remove([ruta]);
      if (errLimpieza) {
        console.error('[Bóveda] Y tampoco se pudo borrar el archivo huérfano:', ruta, errLimpieza);
        bovMensajeForm('No se pudo guardar el documento, y el archivo quedó suelto. Está apuntado en la consola.', true);
      } else {
        bovMensajeForm('No se pudo guardar el documento. No quedó nada a medias: el archivo se borró.', true);
      }
      soltar();
      return;
    }

    /* No se pudo averiguar si hay ficha. Se deja el archivo quieto: un archivo
       suelto se barre después con la consulta del final del .sql; un documento
       borrado no se recupera. Ante la duda, no se borra. */
    console.error('[Bóveda] No se pudo comprobar si la ficha existe. Archivo dejado a proposito:', ruta);
    bovMensajeForm('No sabemos si se guardó. Revisa la lista antes de volver a subirlo.', true);
    soltar();
    bovListar();
    return;
  }

  soltar();
  bovAviso('🗄 Documento guardado');
  bovCerrarModal();
  await initBoveda();
}

/* ─────────────────────────────────────────────
   BORRAR
───────────────────────────────────────────── */

async function bovBorrar(doc) {
  const sb = bovCliente();
  if (!sb || !doc) return;

  /* La pregunta lleva el título escrito. Un «¿seguro?» a secas se contesta
     que sí sin leerlo, y aquí lo que se borra puede ser la partida de
     nacimiento de una niña. */
  const ok = confirm(
    `¿Eliminar «${doc.titulo}» de la Bóveda?\n\n` +
    `Archivo: ${doc.archivo_nombre || '(sin nombre)'}\n\n` +
    'Se borra la ficha y el archivo. Esto no se puede deshacer.'
  );
  if (!ok) return;

  /* Primero la ficha, después el objeto, y el orden importa. Al revés, si
     el borrado de la ficha fallara, quedaría una tarjeta en la lista
     apuntando a un archivo que ya no está: se ve, se toca, y no abre.
     Así, si falla el segundo paso lo que queda es un archivo invisible,
     que molesta menos y se barre después con la consulta del final de
     supabase/sql/boveda_documentos.sql. */
  const { error: errFila } = await sb.from(BOV_TABLA).delete().eq('id', doc.id);
  if (errFila) {
    console.error('[Bóveda] Error eliminando la ficha:', errFila);
    bovAviso('No se pudo eliminar el documento');
    return;
  }

  if (doc.archivo_ruta) {
    const { error: errObjeto } = await sb.storage.from(BOV_DEPOSITO).remove([doc.archivo_ruta]);
    if (errObjeto) {
      console.error('[Bóveda] La ficha se borró pero el archivo quedó:', doc.archivo_ruta, errObjeto);
      bovAviso('Se borró la ficha, pero el archivo quedó en el depósito');
    }
  }

  _bovCache = _bovCache.filter(d => String(d.id) !== String(doc.id));
  bovRenderResumen();
  bovRenderLista();
  bovAviso('🗑️ Documento eliminado');
}

/* ─────────────────────────────────────────────
   WIRING
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('bov-fab')?.addEventListener('click', bovAbrirModal);
  document.getElementById('bov-modal-close')?.addEventListener('click', bovCerrarModal);
  document.getElementById('bov-modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'bov-modal-overlay') bovCerrarModal();
  });

  document.getElementById('bov-form')?.addEventListener('submit', bovSubmitForm);

  document.getElementById('bov-search-input')?.addEventListener('input', e => {
    _bovBusqueda = e.target.value;
    bovRenderLista();
  });

  /* Aviso del peso antes de tocar «Guardar»: enterarse del límite después
     de llenar el formulario entero es la manera segura de que la familia
     deje de usar esto. */
  document.getElementById('bov-f-archivo')?.addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f) { bovMensajeForm(''); return; }
    if (f.size > BOV_MAX_BYTES) {
      bovMensajeForm(`Ese archivo pesa ${bovPeso(f.size)} y el máximo son 10 MB.`, true);
    } else {
      bovMensajeForm(`${f.name} · ${bovPeso(f.size)}`, false);
    }
  });

  bovRenderChips();
});
