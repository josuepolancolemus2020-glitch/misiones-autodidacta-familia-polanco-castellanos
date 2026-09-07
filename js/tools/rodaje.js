'use strict';

/* ─────────────────────────────────────────────
   EL RODAJE 🎬 · el cuaderno de dirección de un video-ensayo
   ─────────────────────────────────────────────
   Pedido por el autor el 7 de septiembre de 2026, para sus video-ensayos
   de diez minutos en adelante. No es una herramienta de edición: es lo
   que se mira ANTES de grabar y mientras se monta.

   NO ES «Videos M.E.T.A.S», aunque las dos lleven una claqueta y estén
   pegadas en el Acceso Rápido. Aquella publica videos de YouTube AJENOS
   para que un alumno los vea dentro de su misión. Esta escribe el video
   PROPIO: su secuencia, su guion, su sonido y sus citas. Se parecen en el
   icono y en nada más.

   ══ LAS SEIS DECISIONES QUE EXPLICAN TODO EL ARCHIVO ══

   1. ⚠️ NO SE GUARDA NUNCA EL MINUTO EN QUE EMPIEZA UN BLOQUE.
      Se guarda cuánto DURA; el minuto de entrada lo suma `rodTiempos()`
      cada vez que se pinta. Si estuviera guardado, meter veinte segundos
      en el medio dejaría equivocados todos los tiempos de abajo, sin
      error y sin aviso. Ese fallo no se descubre en la pantalla: se
      descubre grabando, con el guion en la mano y el reloj corriendo.

   2. ⚠️ LOS EFECTOS DE SONIDO Y LA MÚSICA CUELGAN DEL BLOQUE.
      Un golpe se guarda como «a los 4 segundos DE ESTE BLOQUE», no «en
      el 3:12». Por lo mismo que arriba: arrastrar el bloque se lleva sus
      señales con él y no hay nada más que tocar. La pestaña 🔊 Sonido
      suma los dos números y enseña la lógica del audio del video entero,
      que es lo que el autor pidió ver.

   3. ⚠️ LA CITA ES UNA FILA, NO UN TEXTO SUELTO.
      Una película que sale en seis bloques se escribe UNA vez y los seis
      apuntan a ella. Así el rótulo que ve el espectador es el mismo las
      seis veces y la bibliografía no puede llevar dos versiones del mismo
      dato. Es lo que convierte «citar todo» en algo que se puede cumplir.

   4. ⚠️ EL RÓTULO DE PANTALLA SE ARMA, NO SE ESCRIBE.
      `rodRotulo()` lo construye con los campos de la fuente. Un rótulo
      escrito a mano en cada bloque acaba diciendo la misma película de
      cuatro maneras a lo largo del video. Se puede corregir; lo que no
      puede es quedarse sin escribir.

   5. ⚠️ EL PRESUPUESTO DE CÁMARA SE VE MIENTRAS SE EDITA.
      «Mi aparición en la cámara que solo se limite a expresar lo más
      importante.» Un número que solo sale al final es un número que llega
      cuando ya se grabó. Sale arriba, en todas las pestañas, y en rojo
      cuando se pasa. Y son DOS topes: el porcentaje del video entero y lo
      que puede durar UNA toma seguida —un video con 25 % de cámara puede
      ser insoportable si ese 25 % es una parrafada de tres minutos—.

   6. ⚠️ NADA DE LA BASE LLEGA A UN ATRIBUTO DEL HTML.
      Todo con createElement y textContent. Lo único que va a un atributo
      es una dirección, y va comprobada con URL() y puesta con
      setAttribute. La misma regla que la repisa de enlaces y la bandeja
      de Sugerencias, y por la misma razón: esta aplicación tiene dentro
      la Bóveda, las finanzas y el chat de la casa.

   La tabla la crea `supabase/sql/rodaje.sql` y se COMPRUEBA con
   `supabase/sql/rodaje_comprueba.sql`. Mientras no se corra, la
   herramienta lo dice a la vista en vez de reventar.
───────────────────────────────────────────── */

const ROD_T_PRO = 'rodaje_proyectos';
const ROD_T_BLO = 'rodaje_bloques';
const ROD_T_FUE = 'rodaje_fuentes';
const ROD_T_REE = 'rodaje_reels';

/* El último proyecto abierto, para no tener que elegirlo cada vez. Es lo
   único que esta herramienta guarda en el aparato: todo lo demás viaja. */
const ROD_ULTIMO = 'FARO_ROD_ULTIMO_V1';

/* ── Las ocho clases de bloque ──────────────────────────────────────
   Salen de mirar un video-ensayo de verdad y preguntarse de dónde viene
   cada plano. `cita` dice si la clase EXIGE fuente declarada: las cuatro
   que la exigen son siempre de alguien, y esa exigencia la hace cumplir
   también el disparador de la base, no solo esta pantalla. */
const ROD_CLASES = {
  camara:   { ic: '🎤', n: 'Tú en cámara',        cita: false, col: 'cam' },
  pelicula: { ic: '🎬', n: 'Clip de película',    cita: true,  col: 'pel' },
  ia:       { ic: '🤖', n: 'Generado con IA',     cita: true,  col: 'ia'  },
  grafico:  { ic: '🎨', n: 'Gráfico / animación', cita: false, col: 'gra' },
  archivo:  { ic: '📼', n: 'Material de archivo', cita: true,  col: 'arc' },
  pantalla: { ic: '🖥️', n: 'Captura de pantalla', cita: false, col: 'pan' },
  musica:   { ic: '🎵', n: 'Respiro musical',     cita: true,  col: 'mus' },
  titulo:   { ic: '🔤', n: 'Cartón de texto',     cita: false, col: 'tit' },
};
function rodClase(k) { return ROD_CLASES[k] || { ic: '📄', n: k || 'Bloque', cita: false, col: 'gra' }; }

/* ── Las trece clases de fuente ─────────────────────────────────────
   La frontera que de verdad importa es la de las cinco que empiezan por
   `ia_`. Hoy una canción hecha por una máquina y una tocada por alguien
   suenan igual de bien y se citan distinto; separarlas en la CLASE —y no
   en una casilla que se puede olvidar— es lo que permite que la
   descripción del video las liste aparte sin que nadie se acuerde. */
const ROD_FUENTES = {
  ia_musica: { ic: '🎼', n: 'Música generada con IA',  ia: true,  grupo: 'Generado con inteligencia artificial' },
  ia_video:  { ic: '🎞️', n: 'Video generado con IA',   ia: true,  grupo: 'Generado con inteligencia artificial' },
  ia_imagen: { ic: '🖼️', n: 'Imagen generada con IA',  ia: true,  grupo: 'Generado con inteligencia artificial' },
  ia_voz:    { ic: '🗣️', n: 'Voz generada con IA',     ia: true,  grupo: 'Generado con inteligencia artificial' },
  ia_texto:  { ic: '📝', n: 'Texto generado con IA',   ia: true,  grupo: 'Generado con inteligencia artificial' },
  cancion:   { ic: '🎵', n: 'Canción real',            ia: false, grupo: 'Música' },
  pelicula:  { ic: '🎬', n: 'Película',                ia: false, grupo: 'Clips de película y serie' },
  serie:     { ic: '📺', n: 'Serie',                   ia: false, grupo: 'Clips de película y serie' },
  libro:     { ic: '📚', n: 'Libro',                   ia: false, grupo: 'Fuentes citadas' },
  articulo:  { ic: '📄', n: 'Artículo o estudio',      ia: false, grupo: 'Fuentes citadas' },
  web:       { ic: '🌐', n: 'Página o video ajeno',    ia: false, grupo: 'Fuentes citadas' },
  archivo:   { ic: '📼', n: 'Material de archivo',     ia: false, grupo: 'Material de archivo' },
  propio:    { ic: '🏠', n: 'Material propio',         ia: false, grupo: 'Material propio' },
};
function rodFuenteClase(k) {
  return ROD_FUENTES[k] || { ic: '❔', n: k || 'Sin clase', ia: false, grupo: 'Fuentes citadas' };
}

/* Las licencias, con el texto EXACTO que se pega en el rótulo. Se escribe
   una vez aquí y no en cada fuente: «uso justo» y «Uso Justo» y «fair
   use» en el mismo video son tres maneras de decir que a nadie le
   importó. */
const ROD_LICENCIAS = {
  generado_ia:       { n: 'Generado con IA',        pie: '' },
  propio:            { n: 'Propio',                 pie: '' },
  dominio_publico:   { n: 'Dominio público',        pie: 'dominio público' },
  cc0:               { n: 'CC0',                    pie: 'CC0' },
  cc_by:             { n: 'CC BY',                  pie: 'CC BY' },
  cc_by_sa:          { n: 'CC BY-SA',               pie: 'CC BY-SA' },
  cc_by_nc:          { n: 'CC BY-NC',               pie: 'CC BY-NC' },
  con_permiso:       { n: 'Con permiso del autor',  pie: 'con permiso' },
  licencia_comprada: { n: 'Licencia comprada',      pie: 'bajo licencia' },
  uso_justo:         { n: 'Uso justo (comentario)', pie: 'uso justo con fines de comentario y educación' },
  desconocida:       { n: '⚠️ Sin determinar',       pie: '' },
};

/* Qué hace la música al entrar el bloque. El silencio es una decisión y
   por eso tiene nombre: sin un «sale» escrito, un montaje deja la pista
   sonando debajo de la frase que tenía que doler. */
const ROD_ACC = {
  entra: { ic: '▶️', n: 'Entra' },
  sigue: { ic: '➡️', n: 'Sigue igual' },
  baja:  { ic: '🔉', n: 'Baja (deja oír la voz)' },
  sube:  { ic: '🔊', n: 'Sube' },
  sale:  { ic: '⏹️', n: 'Sale (silencio)' },
};
const ROD_NIV = {
  fondo:   'De fondo',
  medio:   'A media altura',
  primero: 'En primer plano',
};

const ROD_ESTADOS = {
  guion:     { n: '✍️ En guion',   cls: 'rod-est-gui' },
  rodaje:    { n: '🎥 Rodando',    cls: 'rod-est-rod' },
  montaje:   { n: '✂️ En montaje', cls: 'rod-est-mon' },
  publicado: { n: '✅ Publicado',  cls: 'rod-est-pub' },
  archivado: { n: '📦 Archivado',  cls: 'rod-est-arc' },
};

const ROD_REDES = { todas: 'Todas', reel: 'Reel (Instagram)', short: 'Short (YouTube)', tiktok: 'TikTok' };
const ROD_REEL_EST = {
  idea:      { n: '💡 Idea',      cls: 'rod-est-gui' },
  escrito:   { n: '✍️ Escrito',   cls: 'rod-est-mon' },
  grabado:   { n: '🎥 Grabado',   cls: 'rod-est-rod' },
  publicado: { n: '✅ Publicado', cls: 'rod-est-pub' },
};

/* ── El estado ──────────────────────────────────────────────────── */
let _rodHay      = true;   // ¿se corrió ya rodaje.sql en esta base?
let _rodPro      = [];     // todos los proyectos
let _rodPid      = '';     // el que está abierto
let _rodBlo      = [];     // sus bloques, en orden
let _rodFue      = [];     // sus fuentes
let _rodRee      = [];     // sus reels
let _rodFallo    = '';     // lo que dijo la nube cuando no se pudo traer
let _rodCargadoPid = null; // de qué video es lo que hay ahora mismo en memoria
let _rodPestana  = 'secuencia';
let _rodEdBloque = null;   // el bloque abierto en el formulario
let _rodEdFuente = null;
let _rodEdReel   = null;
let _rodSfxTmp   = [];     // los efectos del bloque que se está editando
let _rodMusTmp   = {};     // y su música

/* ══════════════ LO QUE PROTEGE ══════════════ */

/* Escapar, con la comilla incluida — igual que `mvidEsc` en los videos de
   M.E.T.A.S y `redEsc` en Redacción. El navegador NO escapa la comilla
   doble al serializar en modo texto, así que sin esta línea un dato con
   comillas podría cerrar un atributo.

   Aun con esto, en este archivo NINGÚN dato de la base se interpola
   dentro de un atributo. Cinturón y tirantes. */
function rodEsc(s) {
  const div = document.createElement('div');
  div.textContent = s == null ? '' : s;
  return div.innerHTML.replace(/"/g, '&quot;');
}

/* La dirección, comprobada con URL() y no con una expresión sobre el
   texto pelado: `java\tscript:` y `JavaScript:` pasan un grep ingenuo y
   el navegador los ejecuta igual. Solo http y https, y se pone siempre
   con setAttribute después de pasar por aquí. */
function rodEnlace(u) {
  const s = (u == null ? '' : String(u)).trim();
  if (!s) return '';
  let p;
  try { p = new URL(s); } catch (e) { return ''; }
  return (p.protocol === 'http:' || p.protocol === 'https:') ? p.href : '';
}

/* El identificador NACE EN EL APARATO. Dos razones, y las dos costaron
   algo en otra herramienta: el guardado se reintenta cuando la señal es
   mala y sin identificador propio el segundo intento dejaría un gemelo;
   y es la llave con la que los bloques encuentran a su proyecto sin
   esperar a que la base conteste con un número.

   El alfabeto es el mismo que muerde el `check` de la base: minúsculas,
   dígitos y guion. Nada que pueda salirse de un atributo. */
function rodId(pre) {
  const a = Date.now().toString(36);
  const b = Math.floor(Math.random() * 1679616).toString(36).padStart(4, '0');
  return (pre + '-' + a + b).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
}

/* ══════════════ EL RELOJ ══════════════ */

/* Segundos a «2:05» o «1:02:05». Las horas solo salen cuando las hay: un
   «00:02:05» en cada fila de una lista de cuarenta bloques es ruido. */
function rodReloj(s) {
  const t = Math.max(0, Math.round(Number(s) || 0));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), g = t % 60;
  const dos = n => String(n).padStart(2, '0');
  return h ? h + ':' + dos(m) + ':' + dos(g) : m + ':' + dos(g);
}

/* Y al revés, aguantando las cuatro formas en que una persona escribe una
   duración: «2:05», «125», «125s», «2m5s». Se aguantan las cuatro porque
   el guion se pega de otro sitio y ahí viene como venga; obligar a una
   sola notación es obligar a repasar cuarenta líneas a mano. */
function rodSegs(txt) {
  const s = String(txt == null ? '' : txt).trim().toLowerCase().replace(/["'′″]/g, '');
  if (!s) return 0;
  if (/^\d+$/.test(s)) return rodTope(parseInt(s, 10));
  const reloj = s.match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})$/);
  if (reloj) return rodTope((+(reloj[1] || 0)) * 3600 + (+reloj[2]) * 60 + (+reloj[3]));
  const letras = s.match(/^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m(?:in)?)?\s*(?:(\d+)\s*s(?:eg)?)?$/);
  if (letras && (letras[1] || letras[2] || letras[3])) {
    return rodTope((+(letras[1] || 0)) * 3600 + (+(letras[2] || 0)) * 60 + (+(letras[3] || 0)));
  }
  return 0;
}
function rodTope(n) {
  const v = parseInt(n, 10);
  if (!isFinite(v) || v <= 0) return 0;
  return v > 21600 ? 0 : v;      // el mismo tope que el check de la base
}

/* ⚠️ AQUÍ SE SUMAN LOS TIEMPOS, Y ESTE ES EL ÚNICO SITIO DONDE EXISTEN.
   Decisión 1 de la cabecera. Devuelve una copia con `ini` puesto, y el
   `ini` muere al terminar el pintado: no se guarda, no se manda a la
   nube y no puede quedarse viejo. */
function rodTiempos(bloques) {
  let acc = 0;
  return (bloques || []).map(b => {
    const con = Object.assign({}, b, { ini: acc });
    acc += Math.max(0, Number(b.dur) || 0);
    return con;
  });
}

/* ⚠️ CUÁNTO DURA DE VERDAD LO QUE ESTÁ ESCRITO.
   Todo el presupuesto de cámara descansa sobre un número que escribe una
   persona a ojo, y a ojo se falla siempre por el mismo lado: un bloque con
   cuatrocientas palabras marcado como «0:45» miente, el porcentaje sale
   bonito, y el video sale de veintiún minutos. Sin esta cuenta eso no se
   descubre hasta el teleprompter, con el reloj corriendo, o hasta el
   montaje — que es después de haber escrito el guion entero confiando en
   el número.

   Ciento cincuenta palabras por minuto es el ritmo de un ensayo hablado en
   español: ni el de leer un prospecto ni el de un informativo. No pretende
   ser exacto —por eso solo se avisa cuando la diferencia es grande—: lo que
   tiene que hacer es cazar el «0:45» de un párrafo de tres minutos. */
const ROD_PALABRAS_MIN = 150;

function rodDurGuion(txt) {
  const n = String(txt == null ? '' : txt).trim().split(/\s+/).filter(Boolean).length;
  return n ? Math.max(1, Math.round((n / ROD_PALABRAS_MIN) * 60)) : 0;
}

function rodTotal(bloques) {
  return (bloques || []).reduce((a, b) => a + Math.max(0, Number(b.dur) || 0), 0);
}

/* ⚠️ EL PRESUPUESTO DE CÁMARA. La petición central del autor, en cuatro
   números. Se calcula entero cada vez que se pinta: es barato y no se
   puede quedar viejo. */
function rodPresupuesto(bloques, pro) {
  const total = rodTotal(bloques);
  const porClase = {};
  Object.keys(ROD_CLASES).forEach(k => { porClase[k] = 0; });
  (bloques || []).forEach(b => {
    const k = ROD_CLASES[b.clase] ? b.clase : 'grafico';
    porClase[k] += Math.max(0, Number(b.dur) || 0);
  });

  const cam = porClase.camara || 0;
  const topePct = pro ? Number(pro.cam_pct) : 30;
  const topeBloque = pro ? Number(pro.cam_bloque) : 45;
  const pct = total ? (cam / total) * 100 : 0;

  /* Las tomas que se pasan de largo. Es el número que de verdad avisa:
     un video puede tener un 25 % de cámara y ser insoportable si ese
     25 % es una sola parrafada en el arranque. */
  const largas = (bloques || []).filter(b => b.clase === 'camara' && Number(b.dur) > topeBloque);

  return {
    total, cam, pct, porClase, topePct, topeBloque, largas,
    excede: total > 0 && pct > topePct + 0.5,
    objetivo: pro ? Number(pro.dur_obj) : 600,
    desvio: total - (pro ? Number(pro.dur_obj) : 600),
  };
}

/* ══════════════ EL RÓTULO DE PANTALLA ══════════════ */

/* Decisión 4 de la cabecera: se ARMA con los campos, no se escribe.
   El autor pidió que las referencias «nombren las fuentes que aparecen en
   la pantalla», así que este texto es literalmente lo que se copia al
   cintillo del montaje. Cada clase tiene su forma porque una película y
   un artículo no se citan igual, y citarlos igual es no citarlos.

   Si el resultado se corrige a mano, se respeta: lo que no puede es
   quedarse sin escribir. */
function rodRotulo(f) {
  if (!f) return '';
  const T = s => String(s == null ? '' : s).trim();
  const tit = T(f.titulo), aut = T(f.autoria), obr = T(f.obra);
  const ani = T(f.anio),   edi = T(f.editor),  her = T(f.herramienta);
  const comillas = s => s ? '«' + s + '»' : '';
  const juntar = (arr, sep) => arr.filter(Boolean).join(sep);
  const parentesis = arr => { const s = juntar(arr, ', '); return s ? ' (' + s + ')' : ''; };

  let txt = '';
  switch (f.clase) {
    case 'ia_musica':
      txt = 'Música ' + comillas(tit) + ' · generada con ' + (her || 'IA');
      break;
    case 'ia_video':
      txt = 'Video generado con ' + (her || 'IA') + (tit ? ' · ' + comillas(tit) : '');
      break;
    case 'ia_imagen':
      txt = 'Imagen generada con ' + (her || 'IA') + (tit ? ' · ' + comillas(tit) : '');
      break;
    case 'ia_voz':
      txt = 'Voz generada con ' + (her || 'IA');
      break;
    case 'ia_texto':
      txt = 'Texto generado con ' + (her || 'IA');
      break;
    case 'cancion':
      txt = comillas(tit) + (aut ? ' — ' + aut : '') + parentesis([obr, ani]) + (edi ? ' · ' + edi : '');
      break;
    case 'pelicula':
      txt = 'Clip: ' + comillas(tit) + parentesis([aut, ani]) + (edi ? ' · ' + edi : '');
      break;
    case 'serie':
      txt = 'Clip: ' + comillas(tit) + (obr ? ' · ' + obr : '') + parentesis([edi, ani]);
      break;
    case 'libro':
      txt = (aut ? aut + ', ' : '') + comillas(tit) + parentesis([edi, ani]);
      break;
    case 'articulo':
      txt = (aut ? aut + ', ' : '') + comillas(tit) + (obr ? ', ' + obr : '') + parentesis([ani]);
      break;
    case 'archivo':
      txt = 'Material de archivo: ' + comillas(tit) + (edi ? ' · ' + edi : '') + parentesis([ani]);
      break;
    case 'propio':
      txt = 'Material propio' + (tit ? ': ' + tit : '');
      break;
    default:  // web
      txt = comillas(tit) + (aut ? ' — ' + aut : '') + (edi ? ' · ' + edi : '') + parentesis([ani]);
  }

  /* La coletilla de la licencia. Va la última y solo cuando dice algo:
     un «uso justo» al lado de un material propio confunde más que ayuda. */
  const lic = ROD_LICENCIAS[f.licencia];
  if (lic && lic.pie) txt += ' · ' + lic.pie;
  return txt.replace(/\s{2,}/g, ' ').trim();
}

/* ══════════════ LA NUBE ══════════════ */

/* El cliente es el ÚNICO de la casa, el de `js/auth.js`. Este archivo
   carga después de `js/chat.js`, que es quien declara `_sb`; se pregunta
   con typeof por si algún día cambia el orden, porque un ReferenceError
   aquí dejaría la herramienta muerta sin decir por qué. */
function rodSb() {
  if (typeof _sb !== 'undefined' && _sb) return _sb;
  return window.faroSb || null;
}

async function initRodaje() {
  const sb = rodSb();
  const cuerpo = document.getElementById('rod-cuerpo');
  if (!cuerpo) return;

  if (!sb) {
    cuerpo.innerHTML = '<div class="fin-empty">No se pudo conectar.</div>';
    return;
  }
  cuerpo.innerHTML = '<div class="fin-empty">Abriendo el cuaderno…</div>';

  /* Mientras no se haya corrido rodaje.sql la tabla no existe. En vez de
     reventar, se dice qué falta: el que abre esto desde la tableta no
     tiene el repositorio delante para averiguarlo. */
  const { data, error } = await sb.from(ROD_T_PRO)
    .select('*')
    .order('actualizado_at', { ascending: false })
    .limit(200);

  if (error) {
    /* ⚠️ UN FALLO DE RED NO ES UNA TABLA QUE FALTA, y decir lo segundo
       cuando pasa lo primero manda al autor a pegar quinientas líneas de
       SQL en una base que ya las tiene. PostgREST distingue las dos cosas:
       42P01 es «la relación no existe» y lo demás es lo demás. */
    if (error.code === '42P01' || /does not exist/i.test(error.message || '')) {
      _rodHay = false;
      _rodPro = [];
      rodSinTabla();
    } else {
      cuerpo.textContent = '';
      cuerpo.appendChild(rodVacio('📡', 'No se pudo hablar con la nube.',
        'Puede ser la señal. Las tablas están puestas; lo que no llegó fue la petición. ' +
        'Vuelve a entrar en un momento. (' + (error.message || 'sin detalle') + ')'));
    }
    return;
  }

  _rodHay = true;
  _rodPro = data || [];

  if (!_rodPid || !_rodPro.some(p => p.pid === _rodPid)) {
    let guardado = '';
    try { guardado = localStorage.getItem(ROD_ULTIMO) || ''; } catch (e) {}
    _rodPid = (_rodPro.some(p => p.pid === guardado) ? guardado : '') ||
              (_rodPro.length ? _rodPro[0].pid : '');
  }

  await rodCargarProyecto();
}

function rodSinTabla() {
  const cuerpo = document.getElementById('rod-cuerpo');
  if (!cuerpo) return;
  cuerpo.textContent = '';
  const caja = document.createElement('div');
  caja.className = 'msug-vacio';
  const ic = document.createElement('div');
  ic.className = 'msug-vacio-ic';
  ic.textContent = '🧰';
  caja.appendChild(ic);
  [
    ['El Rodaje todavía no está instalado.', true],
    ['Falta correr supabase/sql/rodaje.sql en el editor SQL de Supabase. Es un solo archivo, se puede correr dos veces sin dañar nada y trae al final una fila que dice si quedó puesto.', false],
    ['Y después, supabase/sql/rodaje_comprueba.sql, que solo mira y va en vertical: es el que se puede pegar mañana para volver a comprobarlo sin repetir las quinientas líneas.', false],
  ].forEach(([t, fuerte]) => {
    const p = document.createElement('p');
    if (fuerte) { const b = document.createElement('strong'); b.textContent = t; p.appendChild(b); }
    else p.textContent = t;
    caja.appendChild(p);
  });
  cuerpo.appendChild(caja);
  rodPintarSelector();
  rodPintarPanel();
}

async function rodCargarProyecto() {
  const sb = rodSb();

  /* ⚠️ LO QUE HAY EN MEMORIA NO SE TIRA HASTA SABER QUE LLEGÓ LO NUEVO.
     Vaciarlo primero es lo natural de escribir y lo peor de usar: si la
     petición se cae, lo que queda en pantalla es una secuencia vacía —y lo
     siguiente que hace cualquiera con una secuencia vacía es volver a
     pegar el guion, encima del que ya estaba—.
     Solo se vacía cuando se cambia DE VIDEO: ahí sí, enseñar los bloques
     del anterior con el nuevo seleccionado sería peor que no enseñar
     nada. */
  if (_rodCargadoPid !== _rodPid) {
    _rodBlo = []; _rodFue = []; _rodRee = [];
    _rodCargadoPid = _rodPid;
  }

  if (sb && _rodPid) {
    /* Las tres de golpe. Son tres viajes sí o sí —PostgREST no junta
       tablas sin relación declarada— pero en paralelo son uno de tiempo,
       que en la señal de una tableta es la diferencia que se nota. */
    const [b, f, r] = await Promise.all([
      sb.from(ROD_T_BLO).select('*').eq('pid', _rodPid).order('orden').order('id').limit(500),
      sb.from(ROD_T_FUE).select('*').eq('pid', _rodPid).order('clase').order('id').limit(500),
      sb.from(ROD_T_REE).select('*').eq('pid', _rodPid).order('orden').order('id').limit(200),
    ]);

    /* ⚠️ UN FALLO AL TRAER NO PUEDE PARECER UNA SECUENCIA VACÍA.
       El cliente de Supabase no lanza cuando la petición se cae: devuelve
       `{ data: null, error }`. Sin mirar ese error, un corte de red dejaba
       `_rodBlo` en cero y la pantalla decía «La secuencia está vacía» con
       un botón que invita a PEGAR EL GUION — o sea que el camino natural
       después de una mala señal era pegar los treinta bloques otra vez
       encima de los treinta que ya estaban. Se dice lo que pasó y no se
       toca nada. */
    const fallo = (b && b.error) || (f && f.error) || (r && r.error);
    if (fallo) {
      _rodFallo = fallo.message || 'sin detalle';
    } else {
      _rodFallo = '';
      _rodBlo = (b && b.data) || [];
      _rodFue = (f && f.data) || [];
      _rodRee = (r && r.data) || [];
      try { localStorage.setItem(ROD_ULTIMO, _rodPid); } catch (e) {}
    }
  } else {
    _rodBlo = []; _rodFue = []; _rodRee = []; _rodFallo = '';
  }

  rodPintarSelector();
  rodPintarPanel();
  rodPintarPestanas();
  rodRender();
}

function rodProyecto() { return _rodPro.find(p => p.pid === _rodPid) || null; }
function rodFuente(fid) { return _rodFue.find(f => f.fid === fid) || null; }

/* ⚠️ DÓNDE SE USA UNA FUENTE, Y POR LOS TRES CAMINOS.
   Una fuente puede entrar en un bloque de tres maneras: acreditada en su
   lista de citas, como la pista de música, o como el origen de un golpe
   de sonido. Contar solo la primera —que es lo que hacía la primera
   versión— dejaba a «The Calendar of Rain», que suena en todo el video,
   diciendo «todavía no la usa ningún bloque». Eso no es un detalle de
   pantalla: es la frase que uno lee justo antes de darle a borrar.

   Devuelve las apariciones con su minuto ABSOLUTO ya sumado, ordenadas,
   que es lo que necesitan la ficha, la exportación de rótulos y la
   bibliografía. */
function rodUsos(fid) {
  if (!fid) return [];
  const usos = [];
  rodTiempos(_rodBlo).forEach(b => {
    if ((Array.isArray(b.fids) ? b.fids : []).indexOf(fid) >= 0) {
      usos.push({ b, t: b.ini, via: 'cita' });
    }
    const mus = b.musica && typeof b.musica === 'object' ? b.musica : {};
    /* Solo cuando la música ENTRA o SUBE: un «sigue igual» no es una
       aparición nueva, y con doce bloques seguidos llenaría la ficha de
       la misma pista repetida doce veces. */
    if (mus.fid === fid && (mus.acc === 'entra' || mus.acc === 'sube')) {
      usos.push({ b, t: b.ini, via: 'música' });
    }
    (Array.isArray(b.sfx) ? b.sfx : []).forEach(x => {
      if (x.fid === fid) usos.push({ b, t: b.ini + (Number(x.t) || 0), via: 'sonido' });
    });
  });
  usos.sort((a, b) => a.t - b.t);
  /* Un bloque que acredita la película Y además arranca su música daba dos
     apariciones en el mismo segundo: en la ficha se leía «suena en 2
     momentos: 0:15, 0:15», que es un número que no significa nada. */
  return usos.filter((u, i) => i === 0 || u.t !== usos[i - 1].t);
}

/* ══════════════ LA CABECERA ══════════════ */

function rodPintarSelector() {
  const sel = document.getElementById('rod-proyecto');
  if (!sel) return;
  sel.textContent = '';
  if (!_rodPro.length) {
    const o = document.createElement('option');
    o.value = '';
    o.textContent = _rodHay ? '— todavía no hay ningún video —' : '— falta correr el SQL —';
    sel.appendChild(o);
    return;
  }
  _rodPro.forEach(p => {
    const o = document.createElement('option');
    o.value = p.pid;
    const est = ROD_ESTADOS[p.estado] || ROD_ESTADOS.guion;
    o.textContent = est.n + '  ' + (p.titulo || '(sin título)');
    if (p.pid === _rodPid) o.selected = true;
    sel.appendChild(o);
  });
}

/* ⚠️ EL PANEL DE ARRIBA SE VE EN TODAS LAS PESTAÑAS.
   Decisión 5 de la cabecera. Si el porcentaje de cámara solo saliera en
   su pestaña, sería un número que se mira cuando ya se decidió; aquí
   está delante mientras se escribe el guion, que es cuando todavía se
   puede quitar un párrafo. */
function rodPintarPanel() {
  const cont = document.getElementById('rod-panel');
  if (!cont) return;
  cont.textContent = '';
  const pro = rodProyecto();
  if (!pro) return;

  const pre = rodPresupuesto(_rodBlo, pro);

  const tarjeta = (rot, val, pie, cls) => {
    const d = document.createElement('div');
    d.className = 'rod-kpi ' + (cls || '');
    const r = document.createElement('div'); r.className = 'rod-kpi-rot'; r.textContent = rot;
    const v = document.createElement('div'); v.className = 'rod-kpi-val'; v.textContent = val;
    d.appendChild(r); d.appendChild(v);
    if (pie) { const p = document.createElement('div'); p.className = 'rod-kpi-pie'; p.textContent = pie; d.appendChild(p); }
    return d;
  };

  const rejilla = document.createElement('div');
  rejilla.className = 'rod-kpis';

  const desv = pre.desvio;
  rejilla.appendChild(tarjeta(
    'DURACIÓN',
    rodReloj(pre.total),
    'objetivo ' + rodReloj(pre.objetivo) + (desv ? '  ·  ' + (desv > 0 ? '+' : '−') + rodReloj(Math.abs(desv)) : '  ·  clavado'),
    Math.abs(desv) > pre.objetivo * 0.2 ? 'rod-kpi-ojo' : ''));

  rejilla.appendChild(tarjeta(
    'TÚ EN CÁMARA',
    Math.round(pre.pct) + '%',
    rodReloj(pre.cam) + ' de ' + rodReloj(pre.total) + '  ·  tope ' + pre.topePct + '%',
    pre.excede ? 'rod-kpi-mal' : 'rod-kpi-bien'));

  rejilla.appendChild(tarjeta(
    'TOMA MÁS LARGA',
    rodReloj(Math.max(0, ..._rodBlo.filter(b => b.clase === 'camara').map(b => Number(b.dur) || 0), 0)),
    pre.largas.length
      ? pre.largas.length + (pre.largas.length === 1 ? ' toma pasa' : ' tomas pasan') + ' del tope de ' + rodReloj(pre.topeBloque)
      : 'ninguna pasa del tope de ' + rodReloj(pre.topeBloque),
    pre.largas.length ? 'rod-kpi-mal' : 'rod-kpi-bien'));

  const sinVerif = _rodFue.filter(f => !f.verificada).length;
  rejilla.appendChild(tarjeta(
    'FUENTES',
    String(_rodFue.length),
    sinVerif ? sinVerif + ' sin verificar en el original' : 'todas verificadas',
    sinVerif ? 'rod-kpi-ojo' : 'rod-kpi-bien'));

  cont.appendChild(rejilla);

  /* La barra de la mezcla: cuánto ocupa cada clase. Es la lectura que el
     porcentaje solo no da —«29 % de cámara» no dice si el resto son
     clips o cartones de texto—, y se lee de un vistazo sin números. */
  if (pre.total > 0) {
    const barra = document.createElement('div');
    barra.className = 'rod-mezcla';
    Object.keys(ROD_CLASES).forEach(k => {
      const s = pre.porClase[k];
      if (!s) return;
      const t = document.createElement('span');
      t.className = 'rod-mezcla-t rod-c-' + rodClase(k).col;
      t.style.width = ((s / pre.total) * 100).toFixed(2) + '%';
      t.title = rodClase(k).n + ': ' + rodReloj(s);
      barra.appendChild(t);
    });
    cont.appendChild(barra);

    const ley = document.createElement('div');
    ley.className = 'rod-leyenda';
    Object.keys(ROD_CLASES).forEach(k => {
      const s = pre.porClase[k];
      if (!s) return;
      const e = document.createElement('span');
      e.className = 'rod-ley-i';
      const p = document.createElement('i');
      p.className = 'rod-ley-p rod-c-' + rodClase(k).col;
      e.appendChild(p);
      e.appendChild(document.createTextNode(rodClase(k).ic + ' ' + rodClase(k).n + ' · ' + rodReloj(s)));
      ley.appendChild(e);
    });
    cont.appendChild(ley);
  }

  /* Y los avisos, arriba del todo y sin tener que pedirlos. Los que
     PARAN van primero y en rojo: son los mismos dos que el disparador de
     la base no deja saltar, así que verlos aquí es verlos antes de
     chocarse con un error de PostgreSQL que habla de un `check`. */
  const avisos = rodRevisar();
  if (avisos.length) {
    const caja = document.createElement('div');
    caja.className = 'rod-revision';
    const t = document.createElement('div');
    t.className = 'rod-revision-t';
    const paran = avisos.filter(a => a.para).length;
    t.textContent = paran
      ? '⛔ ' + paran + (paran === 1 ? ' cosa impide publicar' : ' cosas impiden publicar')
      : '⚠️ ' + avisos.length + (avisos.length === 1 ? ' aviso' : ' avisos') + ' antes de publicar';
    caja.appendChild(t);
    /* Los que PARAN salen TODOS: son los que hay que arreglar sí o sí, y
       esconder uno detrás de un «y 4 más» es esconder justo el que impide
       publicar. De los que solo avisan salen seis: un panel de treinta
       líneas no se lee, y lo que no se lee no avisa de nada. */
    const paranL = avisos.filter(a => a.para);
    const sueltos = avisos.filter(a => !a.para);
    const TOPE = 6;
    const ul = document.createElement('ul');
    ul.className = 'rod-revision-l';
    paranL.concat(sueltos.slice(0, TOPE)).forEach(a => {
      const li = document.createElement('li');
      li.className = a.para ? 'rod-rev-para' : '';
      li.textContent = (a.para ? '⛔ ' : '· ') + a.txt;
      ul.appendChild(li);
    });
    caja.appendChild(ul);
    if (sueltos.length > TOPE) {
      const mas = document.createElement('div');
      mas.className = 'rod-revision-mas';
      mas.textContent = 'y ' + (sueltos.length - TOPE) + ' aviso' +
        (sueltos.length - TOPE === 1 ? '' : 's') + ' más, en su bloque o en su ficha.';
      caja.appendChild(mas);
    }
    cont.appendChild(caja);
  }
}

/* ⚠️ LA REVISIÓN DE ANTES DE PUBLICAR.
   Los dos primeros son los MISMOS que el disparador de la base no deja
   saltar, escritos aquí otra vez a propósito: la base es la que lo hace
   cumplir, pero un error de PostgreSQL que habla de un `raise exception`
   no le dice a nadie qué bloque abrir. Los demás avisan y no paran:
   convertir un aviso en un muro enseña a la gente a rellenar por
   rellenar, y una casilla rellenada por rellenar es peor que una vacía. */
function rodRevisar() {
  const pro = rodProyecto();
  if (!pro) return [];
  const av = [];
  const pre = rodPresupuesto(_rodBlo, pro);

  _rodBlo.forEach(b => {
    const c = rodClase(b.clase);
    /* ⚠️ Se cuentan las citas que EXISTEN, no los elementos de la lista.
       Es exactamente lo que mira el disparador de la base: un `fid` que
       apunta a una fuente ya borrada no es una cita, y si aquí contara
       como tal la pantalla diría «se puede publicar» y la base lo
       rechazaría con un error que habla de otra cosa. */
    const vivas = (Array.isArray(b.fids) ? b.fids : []).filter(x => rodFuente(x));
    if (c.cita && !vivas.length) {
      av.push({ para: true, txt: 'El bloque «' + (b.titulo || 'sin título') + '» (' + c.n + ') no tiene fuente declarada.' });
    }
  });

  _rodFue.forEach(f => {
    if (f.pantalla && !String(f.rotulo || '').trim()) {
      av.push({ para: true, txt: 'La fuente «' + (f.titulo || f.fid) + '» sale en pantalla y no tiene rótulo escrito.' });
    }
    if (rodFuenteClase(f.clase).ia && !String(f.prompt || '').trim()) {
      av.push({ para: false, txt: 'La fuente «' + (f.titulo || f.fid) + '» es generada y no guarda el prompt: sin él no es reproducible.' });
    }
    if (!f.verificada) {
      av.push({ para: false, txt: 'La fuente «' + (f.titulo || f.fid) + '» no está verificada en el original.' });
    }
  });

  if (pre.excede) {
    av.push({ para: false, txt: 'Sales en cámara el ' + Math.round(pre.pct) + '% y el tope que te pusiste es ' + pre.topePct + '%.' });
  }
  pre.largas.forEach(b => {
    av.push({ para: false, txt: 'La toma «' + (b.titulo || 'sin título') + '» dura ' + rodReloj(b.dur) + ' seguidos; el tope es ' + rodReloj(pre.topeBloque) + '.' });
  });

  _rodBlo.forEach(b => {
    if (b.clase === 'camara' && !String(b.guion || '').trim()) {
      av.push({ para: false, txt: 'La toma «' + (b.titulo || 'sin título') + '» no tiene guion escrito: el teleprompter la salta.' });
    }
    /* El aviso que evita el video de veintiún minutos: lo escrito NO CABE en
       el tiempo que se le puso. Solo en ese sentido —sobrar tiempo es una
       decisión de dirección—, solo cuando la diferencia es grande —la cuenta
       por palabras no pretende ser exacta— y con un mínimo en segundos
       absolutos, para que un bloque de cinco segundos no salte por nada. */
    const est = rodDurGuion(b.guion);
    if (est - b.dur > Math.max(8, b.dur * 0.25)) {
      av.push({ para: false, txt: 'En «' + (b.titulo || 'sin título') + '» lo escrito son ≈ ' +
        rodReloj(est) + ' hablando y solo le pusiste ' + rodReloj(b.dur) + ': no cabe.' });
    }
    const mus = b.musica && typeof b.musica === 'object' ? b.musica : {};
    if (mus.acc && mus.acc !== 'sale' && !mus.fid) {
      av.push({ para: false, txt: 'El bloque «' + (b.titulo || 'sin título') + '» pide música y no dice cuál.' });
    }
    (Array.isArray(b.sfx) ? b.sfx : []).forEach(s => {
      if (!String(s.que || '').trim()) {
        av.push({ para: false, txt: 'Hay un efecto de sonido sin describir en «' + (b.titulo || 'sin título') + '».' });
      }
      /* Un golpe puesto más allá del final de su bloque no da ningún error:
         suena encima del bloque SIGUIENTE, y al reordenar se va con el
         bloque equivocado. Es el único caso en que la decisión de colgar
         las señales del bloque se puede volver en contra, así que se dice. */
      if (Number(s.t) > Number(b.dur)) {
        av.push({ para: false, txt: 'En «' + (b.titulo || 'sin título') + '» hay un efecto a los ' +
          rodReloj(s.t) + ' y el bloque solo dura ' + rodReloj(b.dur) + ': sonaría sobre el siguiente.' });
      }
    });
  });

  /* Y el que el autor pidió con todas las letras: el reel que enseña tres
     segundos de una película necesita el mismo crédito que el video
     largo, y al corto lo ve mucha más gente. */
  _rodRee.forEach(r => {
    const suyas = Array.isArray(r.fids) ? r.fids : [];
    const bloque = _rodBlo.find(b => b.bid === r.bid);
    if (bloque) {
      const debe = (Array.isArray(bloque.fids) ? bloque.fids : []).filter(x => suyas.indexOf(x) < 0);
      if (debe.length) {
        av.push({ para: false, txt: 'El reel «' + (r.titulo || 'sin título') + '» sale de un bloque con fuentes que él no lleva.' });
      }
    }
  });

  if (_rodBlo.length && !_rodRee.length) {
    av.push({ para: false, txt: 'No hay ni un reel escrito: nadie va a encontrar el video largo solo.' });
  }
  if (Math.abs(pre.desvio) > pre.objetivo * 0.2) {
    av.push({ para: false, txt: 'La secuencia dura ' + rodReloj(pre.total) + ' y el objetivo era ' + rodReloj(pre.objetivo) + '.' });
  }
  return av;
}

/* ══════════════ LAS PESTAÑAS ══════════════ */

const ROD_PESTANAS = [
  { k: 'secuencia', n: '🎞️ Secuencia' },
  { k: 'camara',    n: '🎤 Cámara' },
  { k: 'sonido',    n: '🔊 Sonido' },
  { k: 'citas',     n: '📚 Citas' },
  { k: 'reels',     n: '📱 Reels' },
  /* El banco de cortes va EL ÚLTIMO porque es lo último que se hace: se
     llega a él con la grabación ya en la mano. Y vive en su propio
     archivo (`rodaje-cortes.js`), que es el único de la herramienta que
     toca aparatos del navegador —sonido, grabador, descargas— y por tanto
     el único que puede no existir en un aparato. Si no carga, El Rodaje
     sigue entero y la pestaña lo dice. */
  { k: 'cortes',    n: '✂️ Cortes' },
];

function rodPintarPestanas() {
  const cont = document.getElementById('rod-pestanas');
  if (!cont) return;
  cont.textContent = '';
  ROD_PESTANAS.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rod-pest' + (p.k === _rodPestana ? ' rod-pest-on' : '');
    b.textContent = p.n;
    /* La cuenta va pegada al nombre porque es lo que dice si esa pestaña
       tiene trabajo dentro: una pestaña «Citas» sin número no distingue
       «ninguna fuente» de «no la he abierto». */
    const n = { secuencia: _rodBlo.length,
                camara: _rodBlo.filter(x => x.clase === 'camara').length,
                sonido: rodSenales().length,
                citas: _rodFue.length,
                reels: _rodRee.length,
                cortes: rodCortesMarcados() }[p.k];
    if (n) {
      const s = document.createElement('span');
      s.className = 'rod-pest-n';
      s.textContent = String(n);
      b.appendChild(s);
    }
    b.addEventListener('click', () => {
      _rodPestana = p.k;
      rodPintarPestanas();
      rodRender();
      /* El chip tocado se trae a la vista solo: con cinco pestañas y una
         tableta estrecha, la última queda medio fuera y se toca a ciegas. */
      try { b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
    });
    cont.appendChild(b);
    /* La activa se trae a la vista aunque no se haya llegado a ella
       tocándola —al abrir la herramienta, o al volver de una ventana—: con
       cinco pestañas y una tableta estrecha, la última queda medio fuera y
       parece que no hay nada seleccionado. */
    if (p.k === _rodPestana) {
      try { b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
    }
  });
}

function rodRender() {
  const cuerpo = document.getElementById('rod-cuerpo');
  if (!cuerpo) return;
  if (!_rodHay) return rodSinTabla();
  cuerpo.textContent = '';

  /* Y si lo que hubo fue un corte, se dice ANTES de pintar nada: enseñar
     una secuencia a medias como si fuera la buena es peor que no enseñar
     nada, porque lo que se hace a continuación es escribir encima. */
  if (_rodFallo) {
    cuerpo.appendChild(rodVacio('📡', 'No se pudo traer este video entero.',
      'Fue la señal, no tus datos: siguen donde estaban. NO escribas nada hasta que ' +
      'cargue bien, o escribirás encima de lo que hay. (' + _rodFallo + ')'));
    const barra = document.createElement('div');
    barra.className = 'rod-barra';
    barra.appendChild(rodBoton('🔄 Volver a intentarlo', () => rodCargarProyecto(), 'rod-b-pri'));
    cuerpo.appendChild(barra);
    return;
  }

  if (!_rodPid) {
    const v = document.createElement('div');
    v.className = 'msug-vacio';
    const ic = document.createElement('div'); ic.className = 'msug-vacio-ic'; ic.textContent = '🎬';
    v.appendChild(ic);
    const p1 = document.createElement('p');
    p1.appendChild(Object.assign(document.createElement('strong'), { textContent: 'Todavía no hay ningún video empezado.' }));
    v.appendChild(p1);
    const p2 = document.createElement('p');
    p2.textContent = 'Toca «➕ Video nuevo» y escribe su tesis en una línea: lo que el video sostiene, ' +
                     'no su título. Es lo que se relee después para decidir si un bloque sobra.';
    v.appendChild(p2);
    cuerpo.appendChild(v);
    return;
  }

  ({ secuencia: rodRenderSecuencia,
     camara:    rodRenderCamara,
     sonido:    rodRenderSonido,
     citas:     rodRenderCitas,
     reels:     rodRenderReels,
     cortes:    rodRenderCortes }[_rodPestana] || rodRenderSecuencia)(cuerpo);
}

/* Cuántas tomas tienen ya su entrada y su salida marcadas. Se le pregunta
   al banco de cortes en vez de guardarlo aquí: las marcas son de un
   archivo que vive en ESTE aparato, y el cuaderno de dirección viaja. */
function rodCortesMarcados() {
  if (!window.FaroCortes || !window.FaroCortes._marcas) return 0;
  const m = window.FaroCortes._marcas() || {};
  return Object.keys(m).filter(k => m[k] && m[k].fin > m[k].ini).length;
}

/* La pestaña ✂️ Cortes solo delega. Si `rodaje-cortes.js` no cargó —o el
   aparato no tiene lo que necesita—, se dice y no se rompe nada: es la
   misma regla que la repisa de enlaces sin su SQL. */
function rodRenderCortes(cuerpo) {
  if (!window.FaroCortes || typeof window.FaroCortes.render !== 'function') {
    cuerpo.appendChild(rodVacio('✂️', 'El banco de cortes no cargó.',
      'Falta js/tools/rodaje-cortes.js. Todo lo demás de El Rodaje sigue funcionando: ' +
      'es un archivo aparte a propósito, para que lo que toca la cámara y el sonido no ' +
      'pueda llevarse por delante el cuaderno de dirección.'));
    return;
  }
  if (!_rodBlo.length) {
    cuerpo.appendChild(rodVacio('✂️', 'Primero la secuencia, después los cortes.',
      'Los cortes se hacen contra las tomas que tenga escritas el video: sin bloques no ' +
      'hay nada que cortar. Escribe la secuencia en 🎞️ Secuencia y vuelve.'));
    return;
  }
  /* Se le pasan los bloques YA con su minuto sumado, y dos ganchos: uno
     para escribir avisos en la propia pestaña y otro para repintarla
     cuando cambie una marca. El banco no sabe nada de esta pantalla. */
  window.FaroCortes.alRepintar = () => { rodRender(); };
  window.FaroCortes.alAbrir = () => { rodPintarPestanas(); rodRender(); };
  window.FaroCortes.render(cuerpo, rodTiempos(_rodBlo), _rodPid, txt => {
    const e = document.getElementById('rod-cor-aviso');
    if (e) e.textContent = txt || '';
  });
  /* El renglón de avisos va al final y fuera del pintado del banco: así
     un repintado no se lo lleva por delante mientras se está cortando. */
  const av = document.createElement('p');
  av.id = 'rod-cor-aviso';
  av.className = 'rod-cor-aviso';
  cuerpo.appendChild(av);
}

/* ══════════════ PESTAÑA: LA SECUENCIA ══════════════ */

function rodRenderSecuencia(cuerpo) {
  const barra = document.createElement('div');
  barra.className = 'rod-barra';
  barra.appendChild(rodBoton('➕ Bloque', () => rodBloqueAbrir(null), 'rod-b-pri'));
  barra.appendChild(rodBoton('📋 Pegar el guion', rodPegarAbrir));
  barra.appendChild(rodBoton('🗒️ Plan de rodaje', () => rodTextoAbrir('Plan de rodaje', rodExportarPlan())));
  cuerpo.appendChild(barra);

  if (!_rodBlo.length) {
    cuerpo.appendChild(rodVacio('🎞️', 'La secuencia está vacía.',
      'Puedes escribir los bloques uno a uno, o pegar el guion entero de golpe con 📋. ' +
      'Pegarlo es lo normal: el texto casi nunca se inventa aquí, ya viene escrito de otro sitio.'));
    return;
  }

  /* La nota del orden, con palabras. El asa con puntos no se explica sola
     —las flechas sí lo hacían— y lo que se ordena tampoco es evidente:
     es el orden en que se ve el video, y de él salen todos los tiempos.

     Va FUERA del contenedor que arrastra, y no dentro como en los videos
     de M.E.T.A.S. Allí, al vivir dentro de la lista, era un hijo que no
     era una fila y el aparato de arrastre tuvo que aprender a saltárselo
     —si no, mover «una posición» con el teclado a veces movía dos—.
     Sacándola, esa clase de fallo deja de poder existir. */
  const nota = document.createElement('div');
  nota.className = 'rod-orden-nota';
  nota.appendChild(Object.assign(document.createElement('span'), { textContent: '↕️' }));
  const nt = document.createElement('div');
  nt.appendChild(Object.assign(document.createElement('b'), { textContent: 'Este es el orden del video. ' }));
  nt.appendChild(document.createTextNode(
    'Arrastra el ⠿ para cambiarlo; los minutos se vuelven a sumar solos. ' +
    'Los efectos de sonido van pegados a su bloque y se mueven con él.'));
  nota.appendChild(nt);
  cuerpo.appendChild(nota);

  const lista = document.createElement('div');
  lista.id = 'rod-lista';
  lista.className = 'rod-lista';
  cuerpo.appendChild(lista);

  const pro = rodProyecto();
  const topeBloque = pro ? Number(pro.cam_bloque) : 45;
  rodTiempos(_rodBlo).forEach(b => lista.appendChild(rodFila(b, topeBloque)));
  rodMontarArrastre(lista);
}

function rodFila(b, topeBloque) {
  const c = rodClase(b.clase);
  const card = document.createElement('div');
  card.className = 'rod-card rod-borde-' + c.col;
  /* La llave con la que el arrastre reconoce esta fila en el documento.
     Se guarda el identificador, no la posición: durante el arrastre el
     orden cambia bajo los pies. */
  card.setAttribute('data-rod-bid', String(b.bid));

  const reloj = document.createElement('div');
  reloj.className = 'rod-reloj';
  reloj.appendChild(Object.assign(document.createElement('b'), { textContent: rodReloj(b.ini) }));
  const dur = document.createElement('span');
  dur.className = 'rod-reloj-dur' +
    (b.clase === 'camara' && Number(b.dur) > topeBloque ? ' rod-reloj-largo' : '');
  dur.textContent = '+' + rodReloj(b.dur);
  reloj.appendChild(dur);
  card.appendChild(reloj);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'rod-cuerpo-card';

  const tira = document.createElement('div');
  tira.className = 'rod-tira';
  tira.appendChild(rodChip(c.ic + ' ' + c.n, 'rod-p-' + c.col));
  if (b.listo) tira.appendChild(rodChip('✅ Listo', 'rod-p-ok'));
  else tira.appendChild(rodChip('✍️ En borrador', 'rod-p-bor'));
  cuerpo.appendChild(tira);

  const tit = document.createElement('div');
  tit.className = 'rod-tit';
  tit.textContent = b.titulo || '(sin título)';
  cuerpo.appendChild(tit);

  if (b.guion) {
    const g = document.createElement('div');
    g.className = 'rod-guion';
    g.textContent = '“' + String(b.guion).slice(0, 220) + (String(b.guion).length > 220 ? '…”' : '”');
    cuerpo.appendChild(g);
    /* Lo que dura lo escrito frente a lo presupuestado. Se dice aquí, en la
       fila, y no solo en la revisión: es donde está el texto que hay que
       recortar. */
    /* ⚠️ SOLO CUANDO EL TEXTO NO CABE, nunca cuando sobra tiempo.
       La asimetría es real: no se pueden decir tres minutos de palabras en
       cuarenta y cinco segundos, pero dejar un plano respirando sin hablar
       encima es una decisión de dirección, no un error. La primera versión
       avisaba de las dos y llenaba el panel de avisos que no lo eran —y un
       panel lleno de avisos que no importan es un panel que no se lee—. */
    const est = rodDurGuion(b.guion);
    if (est - b.dur > Math.max(8, b.dur * 0.25)) {
      const a = document.createElement('div');
      a.className = 'rod-sub rod-sub-falta';
      a.textContent = '⏱ Lo escrito son ≈ ' + rodReloj(est) + ' hablando y le pusiste ' +
        rodReloj(b.dur) + ': no cabe. Recorta el texto o dale más tiempo.';
      cuerpo.appendChild(a);
    }
  }
  if (b.visual) {
    const v = document.createElement('div');
    v.className = 'rod-sub';
    v.textContent = '🎥 ' + b.visual;
    cuerpo.appendChild(v);
  }

  /* Las señales de audio del bloque, con su tiempo ABSOLUTO ya sumado:
     es lo que se lee al montar, y sumarlo a mano en cada fila es donde se
     equivoca cualquiera. */
  const mus = b.musica && typeof b.musica === 'object' ? b.musica : {};
  if (mus.acc) {
    const a = ROD_ACC[mus.acc] || ROD_ACC.sigue;
    const f = mus.fid ? rodFuente(mus.fid) : null;
    const d = document.createElement('div');
    d.className = 'rod-sub rod-sub-mus';
    d.textContent = a.ic + ' Música ' + a.n.toLowerCase() +
      (f ? ' · ' + (f.titulo || f.fid) : (mus.acc === 'sale' ? '' : ' · ⚠️ sin decir cuál')) +
      (mus.ini || mus.fin ? ' · ' + rodReloj(mus.ini || 0) + '→' + (mus.fin ? rodReloj(mus.fin) : 'final') : '') +
      (mus.niv ? ' · ' + (ROD_NIV[mus.niv] || mus.niv).toLowerCase() : '');
    cuerpo.appendChild(d);
  }
  (Array.isArray(b.sfx) ? b.sfx : []).forEach(s => {
    const d = document.createElement('div');
    d.className = 'rod-sub rod-sub-sfx';
    d.textContent = '💥 ' + rodReloj(b.ini + (Number(s.t) || 0)) + ' · ' + (s.que || '⚠️ sin describir') +
      (s.fid && rodFuente(s.fid) ? ' · ' + (rodFuente(s.fid).titulo || s.fid) : '');
    cuerpo.appendChild(d);
  });

  const fids = Array.isArray(b.fids) ? b.fids : [];
  if (fids.length) {
    const d = document.createElement('div');
    d.className = 'rod-sub rod-sub-cit';
    d.textContent = '📚 ' + fids.map(x => {
      const f = rodFuente(x);
      return f ? (rodFuenteClase(f.clase).ic + ' ' + (f.titulo || f.fid)) : ('⚠️ ' + x + ' (no está)');
    }).join(' · ');
    cuerpo.appendChild(d);
  } else if (c.cita) {
    const d = document.createElement('div');
    d.className = 'rod-sub rod-sub-falta';
    d.textContent = '⛔ Material ajeno sin fuente declarada. No se puede publicar así.';
    cuerpo.appendChild(d);
  }

  const btns = document.createElement('div');
  btns.className = 'rod-btns';
  btns.appendChild(rodBoton('✏️ Editar', () => rodBloqueAbrir(b)));
  /* Cualquier bloque con guion, no solo los de cámara: la voz en off
     también se ensaya, y es la mitad del texto de un ensayo. */
  if (String(b.guion || '').trim()) {
    btns.appendChild(rodBoton('📖 Ensayar', () => rodPrompterAbrir(b.bid)));
  }
  btns.appendChild(rodBoton(b.listo ? '↩️ A borrador' : '✅ Listo', () => rodBloqueListo(b, !b.listo)));
  btns.appendChild(rodBoton('🗑️', () => rodBloqueBorrar(b), 'rod-b-min'));
  cuerpo.appendChild(btns);

  card.appendChild(cuerpo);

  const asa = document.createElement('button');
  asa.type = 'button';
  asa.className = 'rod-asa';
  asa.setAttribute('data-rod-asa', '');
  asa.setAttribute('aria-label', 'Mover este bloque');
  asa.setAttribute('title', 'Arrastra, o usa las flechas del teclado');
  asa.textContent = '⠿';
  card.appendChild(asa);

  return card;
}

/* ══════════════ MOVER LOS BLOQUES CON EL DEDO ══════════════
   Con PUNTEROS y no con el `draggable` del navegador: ese es de ratón y
   en el navegador de casi ninguna tableta existe —y esto se usa desde la
   tableta—. Es el mismo aparato que mueve las tarjetas de la repisa de
   enlaces y las de los videos de M.E.T.A.S, con las mismas cuatro reglas,
   y aquí importa más que en ninguna: mover un bloque cambia los minutos
   de todos los de abajo, que es exactamente lo que a mano sale mal.

   ⚠️ Y AL SOLTAR NO SE REPINTA la lista: es la lección de la barra de
   grupos de M.E.T.A.S —repintar le arranca de debajo del dedo el elemento
   que iba a recibir el toque siguiente—. Se numera 1, 2, 3… y SOLO se
   escriben las filas cuyo número cambió; el panel de arriba sí se
   refresca, porque los minutos ya son otros. */
function rodMontarArrastre(lista) {
  if (lista.dataset.rodArrastre) return;
  lista.dataset.rodArrastre = '1';

  let nodo = null, idPuntero = null, autoId = null, autoDir = 0;
  const filas = () => [...lista.querySelectorAll(':scope > [data-rod-bid]')];
  const enOrden = () => filas().map(n => n.getAttribute('data-rod-bid'));

  /* ⚠️ EL DESPLAZAMIENTO AUTOMÁTICO EN LOS BORDES.
     Sin esto, un bloque solo se puede mover lo que quepa en la pantalla:
     dos o tres puestos. Y esta herramienta se pensó para secuencias de
     treinta bloques, o sea que la función existía y no servía para el
     caso para el que se hizo — que es peor que no tenerla, porque uno lo
     intenta, no funciona, y no vuelve a intentarlo.

     Se mueve el contenedor que de verdad desplaza, que es `.view-scroll` de
     la vista y no la lista: la lista no tiene desbordamiento propio. */
  const marco = () => lista.closest('.view-scroll');

  function autoParar() {
    if (autoId) { clearInterval(autoId); autoId = null; }
    autoDir = 0;
  }
  function autoEmpezar(dir) {
    if (autoDir === dir) return;
    autoParar();
    if (!dir) return;
    autoDir = dir;
    const m = marco();
    if (!m) return;
    autoId = setInterval(() => { m.scrollTop += dir * 14; }, 16);
  }

  function soltar() {
    autoParar();
    if (!nodo) return;
    nodo.classList.remove('rod-arrastrando');
    lista.classList.remove('rod-moviendo');
    document.body.classList.remove('rod-arrastrando-body');
    nodo = null; idPuntero = null;
    rodGuardarOrden(enOrden());
  }

  lista.addEventListener('pointerdown', ev => {
    const asa = ev.target.closest('[data-rod-asa]');
    if (!asa) return;
    const fila = asa.closest('[data-rod-bid]');
    if (!fila || fila.parentNode !== lista) return;
    /* Sin esto el navegador empieza a seleccionar texto o a desplazar la
       página en cuanto el dedo se mueve, y el arrastre no llega a
       empezar. Va con el `touch-action: none` del asa en el CSS: hacen
       falta los dos. */
    ev.preventDefault();
    nodo = fila; idPuntero = ev.pointerId;
    nodo.classList.add('rod-arrastrando');
    lista.classList.add('rod-moviendo');
    /* Mientras dura el arrastre, el botón flotante de Destellos deja de
       recibir el puntero: vive justo en la esquina de abajo a la derecha,
       que es por donde pasa el dedo al llevar un bloque hacia el final, y
       se comía el gesto sin que se viera por qué. */
    document.body.classList.add('rod-arrastrando-body');
    try { asa.setPointerCapture(ev.pointerId); } catch (e) {}
  });

  lista.addEventListener('pointermove', ev => {
    if (!nodo || ev.pointerId !== idPuntero) return;
    ev.preventDefault();

    /* Cerca de un borde, la lista se mueve sola. La franja son 90 px: menos
       no se acierta con el dedo, y más se dispara sin querer al arrastrar
       entre dos vecinos. */
    const m = marco();
    if (m) {
      const c = m.getBoundingClientRect();
      const F = 90;
      autoEmpezar(ev.clientY < c.top + F ? -1 : ev.clientY > c.bottom - F ? 1 : 0);
    }
    /* La fila que se arrastra tiene `pointer-events: none` por CSS
       mientras dura, así que esto devuelve la que hay DEBAJO. */
    const bajo = document.elementFromPoint(ev.clientX, ev.clientY);
    const destino = bajo && bajo.closest ? bajo.closest('[data-rod-bid]') : null;
    if (!destino || destino === nodo || destino.parentNode !== lista) return;
    const caja = destino.getBoundingClientRect();
    const antes = ev.clientY < caja.top + caja.height / 2;
    lista.insertBefore(nodo, antes ? destino : destino.nextSibling);
  });

  lista.addEventListener('pointerup', soltar);
  lista.addEventListener('pointercancel', soltar);

  /* El teclado: las flechas mueven un puesto. El arrastre de precisión en
     una tableta falla lo bastante como para que una función que solo se
     pueda usar arrastrando sea una función que a veces no existe. */
  lista.addEventListener('keydown', ev => {
    const asa = ev.target.closest ? ev.target.closest('[data-rod-asa]') : null;
    if (!asa) return;
    const dir = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[ev.key];
    if (!dir) return;
    ev.preventDefault();
    const fila = asa.closest('[data-rod-bid]');
    const hermanas = filas();
    const i = hermanas.indexOf(fila);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= hermanas.length) return;
    lista.insertBefore(dir < 0 ? fila : hermanas[j], dir < 0 ? hermanas[j] : fila);
    asa.focus();
    rodGuardarOrden(enOrden());
  });
}

/* ⚠️ LOS RELOJES SE REESCRIBEN, PERO LA LISTA NO SE REPINTA.
   Al soltar un bloque no se puede repintar —repintar le arranca de debajo
   del dedo el elemento que va a recibir el toque siguiente, que es la
   lección de la barra de grupos de M.E.T.A.S—; pero si no se toca nada, la
   columna de relojes se queda con los minutos del orden VIEJO. Y esa
   columna es lo único que se mira para saber dónde cae cada cosa: una
   tarjeta que dice 3:10 cuando ya empieza en 0:15 es exactamente el fallo
   que toda esta herramienta existe para impedir.

   La salida es no crear ni destruir un solo nodo: se le cambia el TEXTO a
   los dos que llevan el reloj, y el DOM sigue siendo el mismo de antes. */
function rodRefrescarRelojes() {
  const lista = document.getElementById('rod-lista');
  if (!lista) return;
  const pro = rodProyecto();
  const topeBloque = pro ? Number(pro.cam_bloque) : 45;
  let acc = 0;
  [...lista.querySelectorAll(':scope > [data-rod-bid]')].forEach(nodo => {
    const b = _rodBlo.find(x => x.bid === nodo.getAttribute('data-rod-bid'));
    if (!b) return;
    const ini = nodo.querySelector('.rod-reloj b');
    const dur = nodo.querySelector('.rod-reloj-dur');
    if (ini) ini.textContent = rodReloj(acc);
    if (dur) {
      dur.textContent = '+' + rodReloj(b.dur);
      dur.classList.toggle('rod-reloj-largo',
        b.clase === 'camara' && Number(b.dur) > topeBloque);
    }
    /* Y los minutos absolutos de las señales de audio, por lo mismo: son
       los que se leen al montar. */
    let n = 0;
    nodo.querySelectorAll('.rod-sub-sfx').forEach(el => {
      const sx = (Array.isArray(b.sfx) ? b.sfx : [])[n++];
      if (!sx) return;
      el.textContent = '💥 ' + rodReloj(acc + (Number(sx.t) || 0)) + ' · ' +
        (sx.que || '⚠️ sin describir') +
        (sx.fid && rodFuente(sx.fid) ? ' · ' + (rodFuente(sx.fid).titulo || sx.fid) : '');
    });
    acc += Math.max(0, Number(b.dur) || 0);
  });
}

async function rodGuardarOrden(bids) {
  const sb = rodSb();
  if (!sb) return;
  const cambios = [];
  const nuevos = [];
  bids.forEach((bid, i) => {
    const fila = _rodBlo.find(b => b.bid === bid);
    if (!fila) return;
    nuevos.push(fila);
    const n = i + 1;
    if (fila.orden !== n) { fila.orden = n; cambios.push({ id: fila.id, orden: n }); }
  });
  /* La copia en memoria queda en el orden de la pantalla ANTES de
     escribir: los tiempos del panel de arriba se vuelven a sumar ya
     mismo, y si la escritura falla se vuelve a traer todo de la nube. */
  _rodBlo = nuevos;
  rodPintarPanel();
  rodRefrescarRelojes();

  if (!cambios.length) return;
  const res = await Promise.all(cambios.map(c =>
    sb.from(ROD_T_BLO).update({ orden: c.orden }).eq('id', c.id)));

  /* Si alguna no entró, el orden de la nube y el de la pantalla dejan de
     coincidir. Se dice y se vuelve a traer: enseñar un orden guardado que
     no lo está es peor que perder el movimiento, porque el que lo hizo se
     va convencido —y aquí, además, con unos minutos que no son. */
  if (res.some(r => r.error)) {
    alert('No se pudo guardar el orden. Se vuelve a traer el de la nube.');
    await rodCargarProyecto();
    return;
  }
  if (typeof toast === 'function') toast('↕️ Orden guardado');
}

/* ══════════════ PESTAÑA: CÁMARA ══════════════ */

function rodRenderCamara(cuerpo) {
  const pro = rodProyecto();
  const pre = rodPresupuesto(_rodBlo, pro);
  const tomas = rodTiempos(_rodBlo).filter(b => b.clase === 'camara');

  const intro = document.createElement('div');
  intro.className = 'rod-intro' + (pre.excede ? ' rod-intro-mal' : '');
  const it = document.createElement('div');
  it.className = 'rod-intro-t';
  it.textContent = tomas.length
    ? tomas.length + (tomas.length === 1 ? ' toma a cámara' : ' tomas a cámara') +
      ' · ' + rodReloj(pre.cam) + ' de ' + rodReloj(pre.total) + ' (' + Math.round(pre.pct) + '%)'
    : 'Todavía no hay ninguna toma a cámara.';
  intro.appendChild(it);
  const ip = document.createElement('p');
  ip.className = 'rod-intro-p';
  ip.textContent = pre.excede
    ? 'Te pasas del tope que te pusiste (' + pre.topePct + '%). Lo que sobra casi nunca es una toma entera: ' +
      'suele ser el principio y el final de cada una, donde se dice lo que ya se va a ver.'
    : 'El resto del video es material de apoyo. Estas son las frases que solo puedes decir tú, ' +
      'así que son las que hay que grabar con intención.';
  intro.appendChild(ip);
  /* Y se dice que el teleprompter lleva TAMBIÉN la voz en off: si no, la
     narración escrita en un bloque de archivo parece texto que nadie va a
     leer, y se acaba escribiendo en las notas. */
  const off = _rodBlo.filter(b => b.clase !== 'camara' && String(b.guion || '').trim());
  if (off.length) {
    const p = document.createElement('p');
    p.className = 'rod-intro-p';
    p.textContent = '🎙️ Y hay ' + off.length + (off.length === 1 ? ' bloque más' : ' bloques más') +
      ' con guion para decir en off, sobre material de apoyo. Esos no cuentan en el presupuesto ' +
      'de cámara —no eres tú en pantalla— pero el teleprompter también los lleva.';
    intro.appendChild(p);
  }
  cuerpo.appendChild(intro);

  const barra = document.createElement('div');
  barra.className = 'rod-barra';
  const conGuion = _rodBlo.filter(b => String(b.guion || '').trim()).length;
  if (conGuion) {
    barra.appendChild(rodBoton('📖 Teleprompter (' + conGuion + ')', () => rodPrompterAbrir(''), 'rod-b-pri'));
  }
  barra.appendChild(rodBoton('➕ Toma nueva', () => rodBloqueAbrir(null, 'camara')));
  cuerpo.appendChild(barra);

  if (!tomas.length) {
    cuerpo.appendChild(rodVacio('🎤', 'Ninguna toma escrita todavía.',
      'Una toma a cámara es una frase que no se puede enseñar de otra manera. Si se puede enseñar, va en un gráfico.'));
    return;
  }

  tomas.forEach((b, i) => {
    const card = document.createElement('div');
    card.className = 'rod-toma' + (Number(b.dur) > pre.topeBloque ? ' rod-toma-larga' : '');

    const cab = document.createElement('div');
    cab.className = 'rod-toma-cab';
    cab.appendChild(rodChip('TOMA ' + (i + 1), 'rod-p-cam'));
    cab.appendChild(rodChip(rodReloj(b.ini) + ' · dura ' + rodReloj(b.dur),
      Number(b.dur) > pre.topeBloque ? 'rod-p-mal' : ''));
    card.appendChild(cab);

    const t = document.createElement('div');
    t.className = 'rod-tit';
    t.textContent = b.titulo || '(sin título)';
    card.appendChild(t);

    const g = document.createElement('div');
    g.className = 'rod-toma-guion';
    g.textContent = b.guion || '(sin guion: escríbelo o el teleprompter la salta)';
    card.appendChild(g);

    if (b.visual) {
      const v = document.createElement('div');
      v.className = 'rod-sub';
      v.textContent = '🎥 ' + b.visual;
      card.appendChild(v);
    }
    if (Number(b.dur) > pre.topeBloque) {
      const a = document.createElement('div');
      a.className = 'rod-sub rod-sub-falta';
      a.textContent = '⚠️ ' + rodReloj(b.dur) + ' seguidos hablando. El tope que te pusiste es ' +
        rodReloj(pre.topeBloque) + ': parte la toma o manda un trozo a un gráfico.';
      card.appendChild(a);
    }

    const btns = document.createElement('div');
    btns.className = 'rod-btns';
    btns.appendChild(rodBoton('📖 Ensayar esta', () => rodPrompterAbrir(b.bid), 'rod-b-pri'));
    btns.appendChild(rodBoton('✏️ Editar', () => rodBloqueAbrir(b)));
    card.appendChild(btns);

    cuerpo.appendChild(card);
  });
}

/* ══════════════ PESTAÑA: SONIDO ══════════════
   Lo que el autor pidió ver: «la lógica de en qué momento los efectos del
   sonido, el momento de algún clip de la música». Cada señal vive pegada
   a su bloque (decisión 2); aquí se suman los dos números y se enseñan
   TODAS en el orden en que suenan, que es la única forma de ver si el
   audio tiene sentido de principio a fin. */
function rodSenales() {
  const senales = [];
  let ultimaMus = '';
  rodTiempos(_rodBlo).forEach(b => {
    const mus = b.musica && typeof b.musica === 'object' ? b.musica : {};
    if (mus.acc) {
      /* Un «sigue igual» seguido de otro «sigue igual» con la misma pista
         no es una señal: es que no pasa nada. Enseñarlo cuarenta veces
         llenaría la lista de ruido y escondería las que sí importan. */
      /* La firma lleva TAMBIÉN el nivel y el trozo. Con solo la acción y la
         pista, un «sigue» que además baja la música o salta a otro trozo
         se leía como «no pasa nada» y desaparecía de la lista: justo el
         cambio que había que ver. */
      const firma = mus.acc + '|' + (mus.fid || '') + '|' + (mus.niv || '') +
                    '|' + (mus.ini || 0) + '|' + (mus.fin || 0);
      if (!(mus.acc === 'sigue' && firma === ultimaMus)) {
        senales.push({ t: b.ini, tipo: 'mus', b, mus });
      }
      ultimaMus = firma;
    }
    (Array.isArray(b.sfx) ? b.sfx : []).forEach(s => {
      senales.push({ t: b.ini + (Number(s.t) || 0), tipo: 'sfx', b, sfx: s });
    });
  });
  return senales.sort((a, b) => a.t - b.t);
}

function rodRenderSonido(cuerpo) {
  const senales = rodSenales();

  const intro = document.createElement('div');
  intro.className = 'rod-intro';
  intro.appendChild(Object.assign(document.createElement('div'),
    { className: 'rod-intro-t', textContent: senales.length + (senales.length === 1 ? ' señal de audio' : ' señales de audio') }));
  intro.appendChild(Object.assign(document.createElement('p'), {
    className: 'rod-intro-p',
    textContent: 'En el orden en que suenan. Cada una está guardada dentro de su bloque, con el segundo ' +
                 'contado desde el principio DE ESE BLOQUE: por eso mover un bloque en la secuencia se lleva ' +
                 'sus golpes con él y no hay que volver a cuadrar nada.',
  }));
  cuerpo.appendChild(intro);

  if (!senales.length) {
    cuerpo.appendChild(rodVacio('🔊', 'Ninguna señal de audio todavía.',
      'Los efectos y las entradas de música se ponen dentro de cada bloque, en ✏️ Editar. ' +
      'Aquí se ven todos juntos y en orden, que es como se comprueba que el audio tiene sentido.'));
    return;
  }

  const lista = document.createElement('div');
  lista.className = 'rod-senales';

  let anterior = null;
  senales.forEach(s => {
    const fila = document.createElement('div');
    fila.className = 'rod-senal rod-senal-' + s.tipo;

    const t = document.createElement('div');
    t.className = 'rod-senal-t';
    t.textContent = rodReloj(s.t);
    fila.appendChild(t);

    const cuerpoF = document.createElement('div');
    cuerpoF.className = 'rod-senal-c';

    if (s.tipo === 'mus') {
      const a = ROD_ACC[s.mus.acc] || ROD_ACC.sigue;
      const f = s.mus.fid ? rodFuente(s.mus.fid) : null;
      cuerpoF.appendChild(Object.assign(document.createElement('div'), {
        className: 'rod-senal-q',
        textContent: a.ic + ' Música: ' + a.n.toLowerCase(),
      }));
      const d = document.createElement('div');
      d.className = 'rod-senal-d';
      if (f) {
        d.textContent = (rodFuenteClase(f.clase).ic) + ' ' + (f.titulo || f.fid) +
          (f.herramienta ? ' · ' + f.herramienta : '') +
          (s.mus.ini || s.mus.fin ? ' · trozo ' + rodReloj(s.mus.ini || 0) + '→' + (s.mus.fin ? rodReloj(s.mus.fin) : 'final') : '') +
          (s.mus.niv ? ' · ' + (ROD_NIV[s.mus.niv] || s.mus.niv).toLowerCase() : '');
      } else {
        d.textContent = s.mus.acc === 'sale' ? 'silencio' : '⚠️ no dice qué pista';
      }
      cuerpoF.appendChild(d);
    } else {
      cuerpoF.appendChild(Object.assign(document.createElement('div'), {
        className: 'rod-senal-q',
        textContent: '💥 ' + (s.sfx.que || '⚠️ sin describir'),
      }));
      const f = s.sfx.fid ? rodFuente(s.sfx.fid) : null;
      const d = document.createElement('div');
      d.className = 'rod-senal-d';
      d.textContent = (f ? rodFuenteClase(f.clase).ic + ' ' + (f.titulo || f.fid)
                         : '⚠️ sin fuente: hasta un golpe de sonido tiene dueño') +
                      (s.sfx.niv ? ' · ' + (ROD_NIV[s.sfx.niv] || s.sfx.niv).toLowerCase() : '');
      cuerpoF.appendChild(d);
    }

    cuerpoF.appendChild(Object.assign(document.createElement('div'), {
      className: 'rod-senal-b',
      textContent: '↳ en «' + (s.b.titulo || 'sin título') + '», a los ' +
                   rodReloj(s.t - s.b.ini) + ' del bloque',
    }));
    fila.appendChild(cuerpoF);

    const btn = rodBoton('✏️', () => rodBloqueAbrir(_rodBlo.find(x => x.bid === s.b.bid)), 'rod-b-min');
    fila.appendChild(btn);
    lista.appendChild(fila);

    /* Dos golpes a menos de un segundo se pisan y suenan a error de
       montaje, no a intención. Se avisa aquí y no en el bloque porque el
       vecino suele estar en OTRO bloque, y ahí no se ve. */
    if (anterior && s.tipo === 'sfx' && anterior.tipo === 'sfx' && s.t - anterior.t < 1) {
      const av = document.createElement('div');
      av.className = 'rod-senal-choque';
      av.textContent = '⚠️ Este golpe cae a menos de un segundo del anterior: se van a pisar.';
      lista.appendChild(av);
    }
    anterior = s;
  });

  cuerpo.appendChild(lista);
}

/* ══════════════ PESTAÑA: CITAS ══════════════ */

function rodRenderCitas(cuerpo) {
  const intro = document.createElement('div');
  intro.className = 'rod-intro';
  intro.appendChild(Object.assign(document.createElement('div'),
    { className: 'rod-intro-t', textContent: 'El registro de citas' }));
  intro.appendChild(Object.assign(document.createElement('p'), {
    className: 'rod-intro-p',
    textContent: 'Cada fuente se escribe UNA vez y los bloques apuntan a ella: así el rótulo que ve ' +
                 'el espectador es el mismo las seis veces que sale la película. El rótulo se arma solo ' +
                 'con estos campos; puedes corregirlo, pero no se queda sin escribir.',
  }));
  cuerpo.appendChild(intro);

  const barra = document.createElement('div');
  barra.className = 'rod-barra';
  barra.appendChild(rodBoton('➕ Fuente', () => rodFuenteAbrir(null), 'rod-b-pri'));
  barra.appendChild(rodBoton('🏷️ Rótulos de pantalla',
    () => rodTextoAbrir('Rótulos de pantalla', rodExportarRotulos())));
  barra.appendChild(rodBoton('📋 Descripción de YouTube',
    () => rodTextoAbrir('Descripción de YouTube', rodExportarBibliografia())));
  cuerpo.appendChild(barra);

  if (!_rodFue.length) {
    cuerpo.appendChild(rodVacio('📚', 'Ninguna fuente declarada.',
      'Empieza por la música: si es de Google, su clase es «Música generada con IA» y le hace falta ' +
      'la herramienta y el prompt. La base no la deja entrar sin ellos, y con razón: «música: IA» no dice nada.'));
    return;
  }

  /* Agrupadas por familia, que es como se leen en la descripción del
     video: lo generado por una máquina aparte de lo demás, siempre. */
  const grupos = {};
  _rodFue.forEach(f => {
    const g = rodFuenteClase(f.clase).grupo;
    (grupos[g] = grupos[g] || []).push(f);
  });
  const orden = ['Generado con inteligencia artificial', 'Música', 'Clips de película y serie',
                 'Material de archivo', 'Fuentes citadas', 'Material propio'];

  orden.filter(g => grupos[g]).forEach(g => {
    const h = document.createElement('h3');
    h.className = 'rod-grupo';
    h.textContent = g + ' (' + grupos[g].length + ')';
    cuerpo.appendChild(h);
    grupos[g].forEach(f => cuerpo.appendChild(rodFilaFuente(f)));
  });
}

function rodFilaFuente(f) {
  const c = rodFuenteClase(f.clase);
  const card = document.createElement('div');
  card.className = 'rod-fuente' + (f.verificada ? '' : ' rod-fuente-ojo');

  const tira = document.createElement('div');
  tira.className = 'rod-tira';
  tira.appendChild(rodChip(c.ic + ' ' + c.n, c.ia ? 'rod-p-ia' : ''));
  const lic = ROD_LICENCIAS[f.licencia] || ROD_LICENCIAS.desconocida;
  tira.appendChild(rodChip(lic.n, f.licencia === 'desconocida' ? 'rod-p-mal' : ''));
  tira.appendChild(rodChip(f.pantalla ? '🏷️ Sale en pantalla' : '📄 Solo en la descripción'));
  tira.appendChild(rodChip(f.verificada ? '✅ Verificada' : '⚠️ Sin verificar',
    f.verificada ? 'rod-p-ok' : 'rod-p-bor'));
  card.appendChild(tira);

  const t = document.createElement('div');
  t.className = 'rod-tit';
  t.textContent = f.titulo || '(sin título)';
  card.appendChild(t);

  /* El rótulo, tal como se va a ver. Es lo que se copia al cintillo, así
     que se enseña con su misma pinta y no como un campo más. */
  const rot = document.createElement('div');
  rot.className = 'rod-rotulo';
  rot.textContent = String(f.rotulo || '').trim() || '⛔ Sin rótulo, y está marcada para salir en pantalla.';
  if (!String(f.rotulo || '').trim() && f.pantalla) rot.classList.add('rod-rotulo-falta');
  card.appendChild(rot);

  if (c.ia) {
    const h = document.createElement('div');
    h.className = 'rod-sub';
    h.textContent = '🤖 ' + (f.herramienta || '⚠️ sin herramienta');
    card.appendChild(h);
    const p = document.createElement('div');
    p.className = 'rod-prompt';
    p.textContent = f.prompt ? '“' + f.prompt + '”'
                             : '⚠️ Sin el prompt no es reproducible: es lo único que hace que esto sea una cita.';
    if (!f.prompt) p.classList.add('rod-prompt-falta');
    card.appendChild(p);
  }

  /* La dirección va con setAttribute después de pasar por rodEnlace(): es
     el ÚNICO dato de la base que llega a un atributo en todo el archivo. */
  const href = rodEnlace(f.url);
  if (href) {
    const a = document.createElement('a');
    a.className = 'rod-url';
    a.setAttribute('href', href);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = '🔗 ' + href.slice(0, 70) + (href.length > 70 ? '…' : '');
    card.appendChild(a);
  }

  const usos = rodUsos(f.fid);
  const u = document.createElement('div');
  u.className = 'rod-sub';
  u.textContent = usos.length
    ? '📍 Suena o se ve en ' + usos.length + (usos.length === 1 ? ' momento: ' : ' momentos: ') +
      usos.slice(0, 6).map(x => rodReloj(x.t)).join(', ') + (usos.length > 6 ? '…' : '')
    : '📍 Todavía no la usa ningún bloque';
  card.appendChild(u);

  const btns = document.createElement('div');
  btns.className = 'rod-btns';
  btns.appendChild(rodBoton('✏️ Editar', () => rodFuenteAbrir(f)));
  btns.appendChild(rodBoton(f.verificada ? '↩️ Sin verificar' : '✅ Verificada',
    () => rodFuenteVerificar(f, !f.verificada)));
  btns.appendChild(rodBoton('📄 Copiar rótulo', () => rodCopiar(f.rotulo || rodRotulo(f))));
  btns.appendChild(rodBoton('🗑️', () => rodFuenteBorrar(f), 'rod-b-min'));
  card.appendChild(btns);

  return card;
}

/* ══════════════ PESTAÑA: REELS ══════════════ */

function rodRenderReels(cuerpo) {
  const intro = document.createElement('div');
  intro.className = 'rod-intro';
  intro.appendChild(Object.assign(document.createElement('div'),
    { className: 'rod-intro-t', textContent: 'Las piezas que llevan gente al video' }));
  intro.appendChild(Object.assign(document.createElement('p'), {
    className: 'rod-intro-p',
    textContent: 'Cada reel sale de un bloque del video y HEREDA SUS FUENTES. No es un detalle: ' +
                 'un corto que enseña tres segundos de una película necesita el mismo crédito que el ' +
                 'video largo, y al corto lo ve mucha más gente.',
  }));
  cuerpo.appendChild(intro);

  const barra = document.createElement('div');
  barra.className = 'rod-barra';
  barra.appendChild(rodBoton('➕ Reel', () => rodReelAbrir(null), 'rod-b-pri'));
  if (_rodRee.length) barra.appendChild(rodBoton('📋 Copiar los guiones',
    () => rodTextoAbrir('Guiones de los reels', rodExportarReels())));
  cuerpo.appendChild(barra);

  if (!_rodRee.length) {
    cuerpo.appendChild(rodVacio('📱', 'Ningún reel escrito.',
      'Elige el bloque del video que se entiende solo —el dato que sorprende, no la conclusión— ' +
      'y hazle un reel. Al abrirlo se trae su guion y sus fuentes ya puestas.'));
    return;
  }

  _rodRee.forEach((r, i) => cuerpo.appendChild(rodFilaReel(r, i)));
}

function rodFilaReel(r, i) {
  const card = document.createElement('div');
  card.className = 'rod-reel';

  const marco = document.createElement('div');
  marco.className = 'rod-reel-marco';
  const cab = document.createElement('div');
  cab.className = 'rod-reel-cab';
  cab.appendChild(Object.assign(document.createElement('span'),
    { className: 'rod-reel-n', textContent: 'REEL ' + (i + 1) }));
  cab.appendChild(Object.assign(document.createElement('span'),
    { className: 'rod-reel-dur', textContent: rodReloj(r.dur) }));
  marco.appendChild(cab);
  const cartel = document.createElement('div');
  cartel.className = 'rod-reel-cartel';
  cartel.textContent = r.titulo || '(sin cartel)';
  marco.appendChild(cartel);
  card.appendChild(marco);

  const der = document.createElement('div');
  der.className = 'rod-reel-der';

  const tira = document.createElement('div');
  tira.className = 'rod-tira';
  const est = ROD_REEL_EST[r.estado] || ROD_REEL_EST.idea;
  tira.appendChild(rodChip(est.n, est.cls === 'rod-est-pub' ? 'rod-p-ok' : 'rod-p-bor'));
  tira.appendChild(rodChip('📲 ' + (ROD_REDES[r.red] || r.red)));
  der.appendChild(tira);

  if (r.gancho) {
    const g = document.createElement('div');
    g.className = 'rod-reel-gancho';
    g.textContent = '⚡ ' + r.gancho;
    der.appendChild(g);
  }
  if (r.guion) {
    const g = document.createElement('div');
    g.className = 'rod-guion';
    g.textContent = '“' + String(r.guion).slice(0, 260) + (String(r.guion).length > 260 ? '…”' : '”');
    der.appendChild(g);
  }
  if (r.cta) {
    const c = document.createElement('div');
    c.className = 'rod-sub';
    c.textContent = '👉 ' + r.cta;
    der.appendChild(c);
  }

  const fids = Array.isArray(r.fids) ? r.fids : [];
  const d = document.createElement('div');
  d.className = 'rod-sub' + (fids.length ? ' rod-sub-cit' : '');
  d.textContent = fids.length
    ? '📚 ' + fids.map(x => { const f = rodFuente(x); return f ? (f.titulo || f.fid) : x; }).join(' · ')
    : '📚 Sin fuentes heredadas.';
  der.appendChild(d);

  if (r.hashtags) {
    const h = document.createElement('div');
    h.className = 'rod-sub';
    h.textContent = '#️⃣ ' + r.hashtags;
    der.appendChild(h);
  }

  const btns = document.createElement('div');
  btns.className = 'rod-btns';
  btns.appendChild(rodBoton('✏️ Editar', () => rodReelAbrir(r)));
  btns.appendChild(rodBoton('📋 Copiar', () => rodCopiar(rodTextoReel(r))));
  btns.appendChild(rodBoton('🗑️', () => rodReelBorrar(r), 'rod-b-min'));
  der.appendChild(btns);

  card.appendChild(der);
  return card;
}

/* ══════════════ PIEZAS SUELTAS DE PANTALLA ══════════════ */

function rodBoton(txt, alTocar, cls) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'rod-b ' + (cls || '');
  b.textContent = txt;
  b.addEventListener('click', alTocar);
  return b;
}
function rodChip(txt, cls) {
  const s = document.createElement('span');
  s.className = 'rod-chip ' + (cls || '');
  s.textContent = txt;
  return s;
}
function rodVacio(ic, titulo, txt) {
  const v = document.createElement('div');
  v.className = 'msug-vacio';
  v.appendChild(Object.assign(document.createElement('div'), { className: 'msug-vacio-ic', textContent: ic }));
  const p1 = document.createElement('p');
  p1.appendChild(Object.assign(document.createElement('strong'), { textContent: titulo }));
  v.appendChild(p1);
  v.appendChild(Object.assign(document.createElement('p'), { textContent: txt }));
  return v;
}
function rodCopiar(txt) {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(String(txt || ''))
    .then(() => { if (typeof toast === 'function') toast('📋 Copiado'); })
    .catch(() => {});
}
function rodVal(id) {
  const el = document.getElementById(id);
  return el ? String(el.value || '').trim() : '';
}
function rodPon(id, v) {
  const el = document.getElementById(id);
  if (el) el.value = v == null ? '' : v;
}
function rodMarcado(id) {
  const el = document.getElementById(id);
  return !!(el && el.checked);
}
function rodOverlay(id, abrir) {
  const el = document.getElementById(id);
  if (el) el.style.display = abrir ? 'flex' : 'none';
}

/* ══════════════ EL PROYECTO ══════════════ */

function rodProyectoAbrir(pro) {
  rodPon('rod-p-titulo', pro ? pro.titulo : '');
  rodPon('rod-p-tesis',  pro ? pro.tesis : '');
  rodPon('rod-p-dur',    pro ? rodReloj(pro.dur_obj) : '12:00');
  rodPon('rod-p-campct', pro ? pro.cam_pct : 30);
  rodPon('rod-p-camblo', pro ? rodReloj(pro.cam_bloque) : '0:45');
  rodPon('rod-p-url',    pro ? pro.url : '');
  rodPon('rod-p-notas',  pro ? pro.notas : '');
  const sel = document.getElementById('rod-p-estado');
  if (sel) {
    sel.textContent = '';
    Object.keys(ROD_ESTADOS).forEach(k => {
      const o = document.createElement('option');
      o.value = k; o.textContent = ROD_ESTADOS[k].n;
      if (pro && pro.estado === k) o.selected = true;
      sel.appendChild(o);
    });
  }
  const t = document.getElementById('rod-p-ventana');
  if (t) t.textContent = pro ? 'Datos del video' : 'Video nuevo';
  const borrar = document.getElementById('rod-p-borrar');
  if (borrar) borrar.style.display = pro ? '' : 'none';
  const av = document.getElementById('rod-p-aviso');
  if (av) av.textContent = '';
  /* El pid del proyecto que se está editando viaja en el propio rótulo de
     la ventana y no en una variable suelta: si viviera en una variable, dos
     ventanas abiertas seguidas (editar uno, cancelar, crear otro) podrían
     dejarla apuntando al anterior y el guardado corregiría el video
     equivocado. Vacío = uno nuevo. */
  if (t) t.dataset.pid = pro ? pro.pid : '';
  rodOverlay('rod-p-overlay', true);
}

async function rodProyectoGuardar() {
  const sb = rodSb();
  const av = document.getElementById('rod-p-aviso');
  if (!sb) return;
  const pid = document.getElementById('rod-p-ventana').dataset.pid || '';
  const titulo = rodVal('rod-p-titulo');
  if (!titulo) { if (av) av.textContent = '⚠️ Ponle un título, aunque sea provisional.'; return; }

  const url = rodVal('rod-p-url');
  if (url && !rodEnlace(url)) {
    if (av) av.textContent = '⚠️ Esa dirección no es http ni https, así que no se guarda.';
    return;
  }

  const fila = {
    titulo,
    tesis:  rodVal('rod-p-tesis'),
    estado: rodVal('rod-p-estado') || 'guion',
    dur_obj: Math.max(60, Math.min(21600, rodSegs(rodVal('rod-p-dur')) || 600)),
    cam_pct: Math.max(0, Math.min(100, parseInt(rodVal('rod-p-campct'), 10) || 0)),
    cam_bloque: Math.max(5, Math.min(900, rodSegs(rodVal('rod-p-camblo')) || 45)),
    url: rodEnlace(url),
    notas: rodVal('rod-p-notas'),
  };

  let error;
  if (pid) ({ error } = await sb.from(ROD_T_PRO).update(fila).eq('pid', pid));
  else {
    fila.pid = rodId('p');
    ({ error } = await sb.from(ROD_T_PRO).insert(fila));
    if (!error) _rodPid = fila.pid;
  }

  if (error) {
    /* ⚠️ El error del GUARDIA DE LAS CITAS llega aquí, y llega en el
       idioma de PostgreSQL. Se enseña TAL CUAL porque el mensaje del
       disparador ya nombra los bloques que faltan: traducirlo a un «no se
       pudo guardar» sería quitarle a quien lo lee lo único que le dice
       qué abrir. */
    if (av) av.textContent = '⚠️ ' + (error.message || 'No se pudo guardar.');
    return;
  }
  rodOverlay('rod-p-overlay', false);
  if (typeof toast === 'function') toast('🎬 Guardado');
  await initRodaje();
}

async function rodProyectoBorrar() {
  const sb = rodSb();
  const pid = document.getElementById('rod-p-ventana').dataset.pid || '';
  if (!sb || !pid) return;
  const pro = _rodPro.find(p => p.pid === pid);
  const n = _rodBlo.length;
  /* Se dice CUÁNTO se lleva por delante. «¿Seguro?» a secas no informa de
     nada; «se lleva 34 bloques y 15 fuentes» sí, y es irreversible. */
  if (!confirm('Borrar «' + (pro ? pro.titulo : '') + '» se lleva también sus ' + n +
               ' bloques, sus ' + _rodFue.length + ' fuentes y sus ' + _rodRee.length +
               ' reels. No se puede deshacer. ¿Seguir?')) return;
  const { error } = await sb.from(ROD_T_PRO).delete().eq('pid', pid);
  if (error) { alert('No se pudo borrar: ' + error.message); return; }
  rodOverlay('rod-p-overlay', false);
  _rodPid = '';
  await initRodaje();
}

/* ══════════════ EL BLOQUE ══════════════ */

function rodBloqueAbrir(b, claseSugerida) {
  _rodEdBloque = b || null;
  _rodSfxTmp = b && Array.isArray(b.sfx) ? JSON.parse(JSON.stringify(b.sfx)) : [];
  _rodMusTmp = b && b.musica && typeof b.musica === 'object' ? JSON.parse(JSON.stringify(b.musica)) : {};

  const sel = document.getElementById('rod-b-clase');
  if (sel) {
    sel.textContent = '';
    Object.keys(ROD_CLASES).forEach(k => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = ROD_CLASES[k].ic + ' ' + ROD_CLASES[k].n + (ROD_CLASES[k].cita ? ' · exige fuente' : '');
      if ((b && b.clase === k) || (!b && claseSugerida === k)) o.selected = true;
      sel.appendChild(o);
    });
    if (!b && !claseSugerida) sel.value = 'camara';
  }

  rodPon('rod-b-titulo', b ? b.titulo : '');
  rodPon('rod-b-dur',    b ? rodReloj(b.dur) : '0:30');
  rodPon('rod-b-guion',  b ? b.guion : '');
  rodPon('rod-b-visual', b ? b.visual : '');
  rodPon('rod-b-rotulo', b ? b.rotulo : '');
  rodPon('rod-b-notas',  b ? b.notas : '');
  const chk = document.getElementById('rod-b-listo');
  if (chk) chk.checked = !!(b && b.listo);

  rodPintarFuentesDe('rod-b-fuentes', b && Array.isArray(b.fids) ? b.fids : []);
  rodPintarSfx();
  rodPintarMusica();

  const t = document.getElementById('rod-b-ventana');
  if (t) t.textContent = b ? 'Bloque de la secuencia' : 'Bloque nuevo';
  const av = document.getElementById('rod-b-aviso');
  if (av) av.textContent = '';
  const eco = document.getElementById('rod-b-eco');
  if (eco) {
    const seg = b ? Number(b.dur) : 30;
    const est = b ? rodDurGuion(b.guion) : 0;
    eco.textContent = '⏱ Se entiende ' + rodReloj(seg) + (seg < 60 ? ' (' + seg + ' segundos)' : '') +
      (est ? '  ·  lo escrito son ≈ ' + rodReloj(est) + ' hablando' : '');
  }
  rodOverlay('rod-b-overlay', true);
}

/* Las casillas de fuentes: una por fuente declarada del proyecto. Es una
   LISTA DE CASILLAS y no un desplegable múltiple a propósito: en una
   tableta, un `select multiple` se maneja fatal y marcar dos cosas sin
   querer desmarca la primera. */
function rodPintarFuentesDe(idCaja, marcadas) {
  const caja = document.getElementById(idCaja);
  if (!caja) return;
  caja.textContent = '';
  if (!_rodFue.length) {
    caja.appendChild(Object.assign(document.createElement('p'), {
      className: 'rod-ayuda',
      textContent: 'Todavía no hay fuentes declaradas en este video. Se ponen en la pestaña 📚 Citas, ' +
                   'y se pueden añadir después: el bloque se guarda igual.',
    }));
    return;
  }
  _rodFue.forEach(f => {
    const l = document.createElement('label');
    l.className = 'rod-check';
    const i = document.createElement('input');
    i.type = 'checkbox';
    i.setAttribute('data-rod-fid', f.fid);
    i.checked = marcadas.indexOf(f.fid) >= 0;
    l.appendChild(i);
    l.appendChild(document.createTextNode(
      rodFuenteClase(f.clase).ic + ' ' + (f.titulo || f.fid) +
      (f.herramienta ? ' · ' + f.herramienta : '')));
    caja.appendChild(l);
  });
}
/* ⚠️ EL MISMO TOPE QUE EL `check` DE LA BASE, escrito aquí con su nombre:
   `rodaje_bloques_formas` y `rodaje_reels_formas` no dejan pasar de
   veinte. Sin este número en la pantalla, marcar la casilla veintiuno se
   guardaba sin protestar hasta que la base rebotaba el guardado ENTERO con
   un mensaje que habla de una restricción y no dice qué casilla sobra. Si
   alguna vez sube, sube en LOS DOS SITIOS. */
const ROD_MAX_FIDS = 20;

function rodFidsDe(idCaja) {
  const caja = document.getElementById(idCaja);
  if (!caja) return [];
  return [...caja.querySelectorAll('input[data-rod-fid]')]
    .filter(i => i.checked).map(i => i.getAttribute('data-rod-fid'))
    .slice(0, ROD_MAX_FIDS);
}

function rodFidsMarcadas(idCaja) {
  const caja = document.getElementById(idCaja);
  if (!caja) return 0;
  return [...caja.querySelectorAll('input[data-rod-fid]')].filter(i => i.checked).length;
}

/* ── Los efectos de sonido del bloque ──
   El tiempo se pide DESDE EL PRINCIPIO DEL BLOQUE y el rótulo lo dice con
   todas las letras: es la decisión 2 de la cabecera y, si alguien escribe
   ahí el minuto absoluto del video, el efecto acabará sonando en otro
   sitio en cuanto se mueva un bloque. */
function rodPintarSfx() {
  const caja = document.getElementById('rod-b-sfx');
  if (!caja) return;
  caja.textContent = '';
  _rodSfxTmp.forEach((s, i) => {
    const fila = document.createElement('div');
    fila.className = 'rod-sfx-fila';

    const t = document.createElement('input');
    t.type = 'text'; t.className = 'rod-in rod-in-corto';
    t.value = rodReloj(s.t || 0);
    t.setAttribute('inputmode', 'numeric');
    t.setAttribute('aria-label', 'Segundo dentro del bloque');
    t.addEventListener('change', () => { s.t = rodSegs(t.value); t.value = rodReloj(s.t); });
    fila.appendChild(t);

    const q = document.createElement('input');
    q.type = 'text'; q.className = 'rod-in';
    q.value = s.que || '';
    q.setAttribute('placeholder', 'golpe grave de sub-bajo');
    q.addEventListener('input', () => { s.que = q.value; });
    fila.appendChild(q);

    const f = document.createElement('select');
    f.className = 'rod-sel rod-in-corto';
    const vacio = document.createElement('option');
    vacio.value = ''; vacio.textContent = '— fuente —';
    f.appendChild(vacio);
    _rodFue.forEach(x => {
      const o = document.createElement('option');
      o.value = x.fid; o.textContent = x.titulo || x.fid;
      if (s.fid === x.fid) o.selected = true;
      f.appendChild(o);
    });
    f.addEventListener('change', () => { s.fid = f.value; });
    fila.appendChild(f);

    fila.appendChild(rodBoton('🗑️', () => { _rodSfxTmp.splice(i, 1); rodPintarSfx(); }, 'rod-b-min'));
    caja.appendChild(fila);
  });
}

function rodPintarMusica() {
  const acc = document.getElementById('rod-b-mus-acc');
  if (acc) {
    acc.textContent = '';
    const v = document.createElement('option');
    v.value = ''; v.textContent = '— la música no cambia aquí —';
    acc.appendChild(v);
    Object.keys(ROD_ACC).forEach(k => {
      const o = document.createElement('option');
      o.value = k; o.textContent = ROD_ACC[k].ic + ' ' + ROD_ACC[k].n;
      if (_rodMusTmp.acc === k) o.selected = true;
      acc.appendChild(o);
    });
  }
  const fid = document.getElementById('rod-b-mus-fid');
  if (fid) {
    fid.textContent = '';
    const v = document.createElement('option');
    v.value = ''; v.textContent = '— qué pista —';
    fid.appendChild(v);
    _rodFue.filter(f => f.clase === 'ia_musica' || f.clase === 'cancion').forEach(f => {
      const o = document.createElement('option');
      o.value = f.fid;
      o.textContent = rodFuenteClase(f.clase).ic + ' ' + (f.titulo || f.fid);
      if (_rodMusTmp.fid === f.fid) o.selected = true;
      fid.appendChild(o);
    });
  }
  const niv = document.getElementById('rod-b-mus-niv');
  if (niv) {
    niv.textContent = '';
    Object.keys(ROD_NIV).forEach(k => {
      const o = document.createElement('option');
      o.value = k; o.textContent = ROD_NIV[k];
      if ((_rodMusTmp.niv || 'fondo') === k) o.selected = true;
      niv.appendChild(o);
    });
  }
  rodPon('rod-b-mus-ini', _rodMusTmp.ini ? rodReloj(_rodMusTmp.ini) : '');
  rodPon('rod-b-mus-fin', _rodMusTmp.fin ? rodReloj(_rodMusTmp.fin) : '');
}

async function rodBloqueGuardar() {
  const sb = rodSb();
  const av = document.getElementById('rod-b-aviso');
  if (!sb || !_rodPid) return;

  const clase = rodVal('rod-b-clase') || 'camara';
  const fids = rodFidsDe('rod-b-fuentes');

  /* Se AVISA aquí de lo que el disparador de la base va a rechazar
     después, y no se para el guardado: un bloque a medio escribir tiene
     que poder guardarse —si no, se pierde—. Lo que no se puede es marcar
     el video como publicado, y de eso ya se encarga la base. */
  if (rodClase(clase).cita && !fids.length && av) {
    av.textContent = '⚠️ Se guarda, pero este bloque es material ajeno sin fuente: ' +
                     'con él puesto así, el video no se deja publicar.';
  }
  if (rodFidsMarcadas('rod-b-fuentes') > ROD_MAX_FIDS && av) {
    av.textContent = '⚠️ Un bloque acredita como mucho ' + ROD_MAX_FIDS + ' fuentes. Se guardan ' +
                     'las ' + ROD_MAX_FIDS + ' primeras; las demás se quedan sin marcar.';
  }

  const mus = {};
  const acc = rodVal('rod-b-mus-acc');
  if (acc) {
    mus.acc = acc;
    const f = rodVal('rod-b-mus-fid'); if (f) mus.fid = f;
    const i = rodSegs(rodVal('rod-b-mus-ini')); if (i) mus.ini = i;
    const n = rodSegs(rodVal('rod-b-mus-fin')); if (n) mus.fin = n;
    const v = rodVal('rod-b-mus-niv'); if (v) mus.niv = v;
  }

  const fila = {
    pid: _rodPid,
    clase,
    titulo: rodVal('rod-b-titulo'),
    dur: Math.max(0, Math.min(3600, rodSegs(rodVal('rod-b-dur')))),
    guion: rodVal('rod-b-guion'),
    visual: rodVal('rod-b-visual'),
    rotulo: rodVal('rod-b-rotulo'),
    notas: rodVal('rod-b-notas'),
    listo: rodMarcado('rod-b-listo'),
    fids,
    sfx: _rodSfxTmp.filter(s => String(s.que || '').trim() || s.fid)
                   .map(s => ({ t: Math.max(0, Number(s.t) || 0), que: String(s.que || '').slice(0, 200),
                                fid: s.fid || '', niv: s.niv || '' }))
                   .sort((a, b) => a.t - b.t)
                   .slice(0, 24),
    musica: mus,
  };

  let error;
  if (_rodEdBloque) {
    ({ error } = await sb.from(ROD_T_BLO).update(fila).eq('id', _rodEdBloque.id));
  } else {
    fila.bid = rodId('b');
    fila.orden = (_rodBlo.length ? Math.max(..._rodBlo.map(b => Number(b.orden) || 0)) : 0) + 1;
    ({ error } = await sb.from(ROD_T_BLO).insert(fila));
  }
  if (error) {
    if (av) av.textContent = '⚠️ ' + (error.message || 'No se pudo guardar.');
    return;
  }
  rodOverlay('rod-b-overlay', false);
  if (typeof toast === 'function') toast('🎞️ Bloque guardado');
  await rodCargarProyecto();
}

async function rodBloqueListo(b, listo) {
  const sb = rodSb();
  if (!sb) return;
  const { error } = await sb.from(ROD_T_BLO).update({ listo }).eq('id', b.id);
  if (error) { alert('No se pudo: ' + error.message); return; }
  await rodCargarProyecto();
}

async function rodBloqueBorrar(b) {
  const sb = rodSb();
  if (!sb) return;
  if (!confirm('Borrar el bloque «' + (b.titulo || 'sin título') + '». Los minutos de los de abajo ' +
               'se vuelven a sumar solos. ¿Seguir?')) return;
  const { error } = await sb.from(ROD_T_BLO).delete().eq('id', b.id);
  if (error) { alert('No se pudo borrar: ' + error.message); return; }
  await rodCargarProyecto();
}

/* ══════════════ LA FUENTE ══════════════ */

function rodFuenteAbrir(f) {
  _rodEdFuente = f || null;
  const sel = document.getElementById('rod-f-clase');
  if (sel) {
    sel.textContent = '';
    Object.keys(ROD_FUENTES).forEach(k => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = ROD_FUENTES[k].ic + ' ' + ROD_FUENTES[k].n;
      if (f && f.clase === k) o.selected = true;
      sel.appendChild(o);
    });
    if (!f) sel.value = 'pelicula';
  }
  const lic = document.getElementById('rod-f-licencia');
  if (lic) {
    lic.textContent = '';
    Object.keys(ROD_LICENCIAS).forEach(k => {
      const o = document.createElement('option');
      o.value = k; o.textContent = ROD_LICENCIAS[k].n;
      if (f && f.licencia === k) o.selected = true;
      lic.appendChild(o);
    });
  }
  ['titulo', 'autoria', 'obra', 'anio', 'editor', 'url', 'herramienta', 'prompt', 'rotulo', 'notas']
    .forEach(c => rodPon('rod-f-' + c, f ? f[c] : ''));
  const pan = document.getElementById('rod-f-pantalla');
  if (pan) pan.checked = f ? !!f.pantalla : true;
  const ver = document.getElementById('rod-f-verificada');
  if (ver) ver.checked = !!(f && f.verificada);

  const t = document.getElementById('rod-f-ventana');
  if (t) t.textContent = f ? 'Datos de la fuente' : 'Fuente nueva';
  const av = document.getElementById('rod-f-aviso');
  if (av) av.textContent = '';
  rodFuenteAjustar();
  rodOverlay('rod-f-overlay', true);
}

/* Al cambiar de clase: se enseña lo que esa clase necesita y se esconde lo
   que no, se pone la licencia que le toca y se vuelve a armar el rótulo.
   Enseñar los veinte campos siempre convierte el formulario en un muro y
   deja al que lo llena sin saber cuáles importan de verdad. */
function rodFuenteAjustar() {
  const clase = rodVal('rod-f-clase') || 'web';
  const c = rodFuenteClase(clase);
  const caja = document.getElementById('rod-f-ia');
  if (caja) caja.style.display = c.ia ? '' : 'none';

  const lic = document.getElementById('rod-f-licencia');
  if (lic) {
    /* La licencia de lo generado no se elige: la base solo acepta
       `generado_ia` para las clases `ia_`, y al revés. Dejarla elegible
       sería ofrecer una opción que va a rebotar con un mensaje que habla
       de un `check`. */
    if (c.ia) { lic.value = 'generado_ia'; lic.disabled = true; }
    else {
      lic.disabled = false;
      if (lic.value === 'generado_ia') lic.value = 'uso_justo';
    }
  }
  rodFuenteVistaRotulo();
}

/* El rótulo se arma mientras se escribe. Verlo cambiar es lo que hace que
   nadie tenga que fiarse de que «luego lo reviso»: se ve ya, con la misma
   pinta con la que va a salir encima del video. */
function rodFuenteVistaRotulo() {
  const prev = document.getElementById('rod-f-vista');
  if (!prev) return;
  const armado = rodRotulo({
    clase: rodVal('rod-f-clase'), titulo: rodVal('rod-f-titulo'), autoria: rodVal('rod-f-autoria'),
    obra: rodVal('rod-f-obra'), anio: rodVal('rod-f-anio'), editor: rodVal('rod-f-editor'),
    herramienta: rodVal('rod-f-herramienta'), licencia: rodVal('rod-f-licencia'),
  });
  const escrito = rodVal('rod-f-rotulo');
  prev.textContent = escrito || armado || '(todavía no da para un rótulo)';
  prev.classList.toggle('rod-vista-mano', !!escrito);
}

async function rodFuenteGuardar() {
  const sb = rodSb();
  const av = document.getElementById('rod-f-aviso');
  if (!sb || !_rodPid) return;

  const clase = rodVal('rod-f-clase') || 'web';
  const c = rodFuenteClase(clase);
  const herramienta = rodVal('rod-f-herramienta');

  /* La misma exigencia que el `check` de la base, dicha aquí con palabras.
     Las dos hacen falta: la de abajo es la que lo hace cumplir, pero su
     mensaje habla de una restricción y no de por qué. */
  if (c.ia && !herramienta) {
    if (av) av.textContent = '⚠️ Falta la herramienta. «Generado con IA» sin decir con qué no es una cita: ' +
                             'es una casilla marcada. Escribe «Google MusicFX», «Google Veo», lo que sea.';
    return;
  }
  const url = rodVal('rod-f-url');
  if (url && !rodEnlace(url)) {
    if (av) av.textContent = '⚠️ Esa dirección no es http ni https, así que no se guarda.';
    return;
  }

  const base = {
    pid: _rodPid, clase,
    titulo: rodVal('rod-f-titulo'), autoria: rodVal('rod-f-autoria'),
    obra: rodVal('rod-f-obra'), anio: rodVal('rod-f-anio'), editor: rodVal('rod-f-editor'),
    url: rodEnlace(url),
    licencia: c.ia ? 'generado_ia' : (rodVal('rod-f-licencia') || 'desconocida'),
    herramienta, prompt: rodVal('rod-f-prompt'),
    pantalla: rodMarcado('rod-f-pantalla'),
    verificada: rodMarcado('rod-f-verificada'),
    notas: rodVal('rod-f-notas'),
  };
  /* Si no se escribió a mano, se ARMA. Decisión 4 de la cabecera: puede
     corregirse, no puede quedarse en blanco. */
  base.rotulo = rodVal('rod-f-rotulo') || rodRotulo(base);

  let error;
  if (_rodEdFuente) ({ error } = await sb.from(ROD_T_FUE).update(base).eq('id', _rodEdFuente.id));
  else {
    base.fid = rodId('f');
    ({ error } = await sb.from(ROD_T_FUE).insert(base));
  }
  if (error) {
    if (av) av.textContent = '⚠️ ' + (error.message || 'No se pudo guardar.');
    return;
  }
  rodOverlay('rod-f-overlay', false);
  if (typeof toast === 'function') toast('📚 Fuente guardada');
  await rodCargarProyecto();
}

async function rodFuenteVerificar(f, v) {
  const sb = rodSb();
  if (!sb) return;
  const { error } = await sb.from(ROD_T_FUE).update({ verificada: v }).eq('id', f.id);
  if (error) { alert('No se pudo: ' + error.message); return; }
  await rodCargarProyecto();
}

async function rodFuenteBorrar(f) {
  const sb = rodSb();
  if (!sb) return;
  /* Se dice CUÁNTOS bloques se quedan sin cita, y esos bloques dejan de
     poder publicarse. Borrar una fuente no es como borrar una nota. */
  const donde = rodUsos(f.fid);
  if (!confirm('Borrar «' + (f.titulo || f.fid) + '».' +
      (donde.length ? ' Se usa en ' + donde.length +
                      (donde.length === 1 ? ' momento del video' : ' momentos del video') +
                      ', y los bloques que la acreditaban se quedan sin cita: con eso el video ' +
                      'no se deja publicar.' : '') + ' ¿Seguir?')) return;
  const { error } = await sb.from(ROD_T_FUE).delete().eq('id', f.id);
  if (error) { alert('No se pudo borrar: ' + error.message); return; }

  /* Y se quita de los bloques que la nombraban, POR LOS TRES CAMINOS. Si
     no, quedaría un `fid` apuntando a nada: el bloque parecería tener cita
     y no la tendría, que es peor que no tenerla porque nadie lo mira dos
     veces —y la música y los golpes se quedarían señalando a un hueco—. */
  const tocados = _rodBlo.filter(b =>
    (Array.isArray(b.fids) ? b.fids : []).indexOf(f.fid) >= 0 ||
    (b.musica && b.musica.fid === f.fid) ||
    (Array.isArray(b.sfx) ? b.sfx : []).some(x => x.fid === f.fid));

  await Promise.all(tocados.map(b => {
    const cambio = { fids: (Array.isArray(b.fids) ? b.fids : []).filter(x => x !== f.fid) };
    if (b.musica && b.musica.fid === f.fid) {
      const m = Object.assign({}, b.musica);
      delete m.fid;
      cambio.musica = m;
    }
    if ((Array.isArray(b.sfx) ? b.sfx : []).some(x => x.fid === f.fid)) {
      cambio.sfx = b.sfx.map(x => x.fid === f.fid ? Object.assign({}, x, { fid: '' }) : x);
    }
    return sb.from(ROD_T_BLO).update(cambio).eq('id', b.id);
  }));
  await rodCargarProyecto();
}

/* ══════════════ EL REEL ══════════════ */

function rodReelAbrir(r) {
  _rodEdReel = r || null;
  const sel = document.getElementById('rod-r-bid');
  if (sel) {
    sel.textContent = '';
    const v = document.createElement('option');
    v.value = ''; v.textContent = '— de ningún bloque en concreto —';
    sel.appendChild(v);
    rodTiempos(_rodBlo).forEach(b => {
      const o = document.createElement('option');
      o.value = b.bid;
      o.textContent = rodReloj(b.ini) + '  ' + rodClase(b.clase).ic + ' ' + (b.titulo || 'sin título');
      if (r && r.bid === b.bid) o.selected = true;
      sel.appendChild(o);
    });
  }
  const red = document.getElementById('rod-r-red');
  if (red) {
    red.textContent = '';
    Object.keys(ROD_REDES).forEach(k => {
      const o = document.createElement('option');
      o.value = k; o.textContent = ROD_REDES[k];
      if (r && r.red === k) o.selected = true;
      red.appendChild(o);
    });
  }
  const est = document.getElementById('rod-r-estado');
  if (est) {
    est.textContent = '';
    Object.keys(ROD_REEL_EST).forEach(k => {
      const o = document.createElement('option');
      o.value = k; o.textContent = ROD_REEL_EST[k].n;
      if (r && r.estado === k) o.selected = true;
      est.appendChild(o);
    });
  }
  rodPon('rod-r-titulo', r ? r.titulo : '');
  rodPon('rod-r-gancho', r ? r.gancho : '');
  rodPon('rod-r-guion',  r ? r.guion : '');
  rodPon('rod-r-cta',    r ? r.cta : 'El video completo está en el enlace del perfil.');
  rodPon('rod-r-dur',    r ? rodReloj(r.dur) : '0:45');
  rodPon('rod-r-hashtags', r ? r.hashtags : '');
  rodPintarFuentesDe('rod-r-fuentes', r && Array.isArray(r.fids) ? r.fids : []);

  const t = document.getElementById('rod-r-ventana');
  if (t) t.textContent = r ? 'Datos del reel' : 'Reel nuevo';
  const av = document.getElementById('rod-r-aviso');
  if (av) av.textContent = '';
  rodOverlay('rod-r-overlay', true);
}

/* ⚠️ AL ELEGIR EL BLOQUE, EL REEL HEREDA SUS FUENTES.
   Es la regla que el autor pidió con todas las letras y la que más fácil
   se olvida: un corto que enseña tres segundos de una película necesita
   el mismo crédito que el video largo, y al corto lo ve mucha más gente.
   Se marcan solas y se pueden desmarcar; lo que no pasa es que nadie se
   acuerde de marcarlas. */
function rodReelDelBloque() {
  const bid = rodVal('rod-r-bid');
  const b = _rodBlo.find(x => x.bid === bid);
  if (!b) return;
  const yaHay = rodFidsDe('rod-r-fuentes');
  const heredadas = (Array.isArray(b.fids) ? b.fids : []);
  rodPintarFuentesDe('rod-r-fuentes', [...new Set([...yaHay, ...heredadas])]);

  /* Y se trae el guion del bloque si el reel todavía no tiene ninguno: se
     recorta y se reescribe, pero partir de la frase que ya funcionó es
     mejor que partir de un recuadro vacío. */
  if (!rodVal('rod-r-guion') && b.guion) rodPon('rod-r-guion', b.guion);
  if (!rodVal('rod-r-titulo') && b.titulo) rodPon('rod-r-titulo', b.titulo);

  const av = document.getElementById('rod-r-aviso');
  if (av && heredadas.length) {
    av.textContent = '📚 Se marcaron las ' + heredadas.length +
      (heredadas.length === 1 ? ' fuente que acredita' : ' fuentes que acreditan') +
      ' ese bloque. Al reel lo ve más gente que al video: no las quites sin motivo.';
  }
}

async function rodReelGuardar() {
  const sb = rodSb();
  const av = document.getElementById('rod-r-aviso');
  if (!sb || !_rodPid) return;
  const fila = {
    pid: _rodPid,
    titulo: rodVal('rod-r-titulo'),
    gancho: rodVal('rod-r-gancho'),
    guion: rodVal('rod-r-guion'),
    cta: rodVal('rod-r-cta'),
    dur: Math.max(0, Math.min(600, rodSegs(rodVal('rod-r-dur')))),
    bid: rodVal('rod-r-bid'),
    fids: rodFidsDe('rod-r-fuentes'),
    red: rodVal('rod-r-red') || 'todas',
    estado: rodVal('rod-r-estado') || 'idea',
    hashtags: rodVal('rod-r-hashtags'),
  };
  let error;
  if (_rodEdReel) ({ error } = await sb.from(ROD_T_REE).update(fila).eq('id', _rodEdReel.id));
  else {
    fila.rid = rodId('r');
    fila.orden = (_rodRee.length ? Math.max(..._rodRee.map(r => Number(r.orden) || 0)) : 0) + 1;
    ({ error } = await sb.from(ROD_T_REE).insert(fila));
  }
  if (error) { if (av) av.textContent = '⚠️ ' + (error.message || 'No se pudo guardar.'); return; }
  rodOverlay('rod-r-overlay', false);
  if (typeof toast === 'function') toast('📱 Reel guardado');
  await rodCargarProyecto();
}

async function rodReelBorrar(r) {
  const sb = rodSb();
  if (!sb) return;
  if (!confirm('Borrar el reel «' + (r.titulo || 'sin título') + '». ¿Seguir?')) return;
  const { error } = await sb.from(ROD_T_REE).delete().eq('id', r.id);
  if (error) { alert('No se pudo borrar: ' + error.message); return; }
  await rodCargarProyecto();
}

/* ══════════════ PEGAR EL GUION DE GOLPE ══════════════
   La misma lección que las preguntas de los videos de M.E.T.A.S, y aquí
   pesa el triple: un guion de catorce minutos son treinta bloques, y
   treinta bloques escritos campo por campo en una tableta son doscientos
   toques. Además el texto casi nunca se inventa aquí —ya viene escrito en
   un documento, en un chat o en una libreta—, así que lo que hay que
   hacer no es escribirlo otra vez: es LEERLO.

   Se lee tal como venga. Lo único que se exige es una línea de cabecera
   por bloque; todo lo demás se deduce o se queda como guion. Y lo que no
   se entiende NO se inventa: se dice en un aviso y se deja pasar como
   texto, que es preferible a colocarlo en el campo equivocado —donde no
   se ve que está mal—. */

/* Las palabras con las que una persona nombra cada clase. Están de más a
   propósito: es más barato aceptar seis sinónimos que explicar cuál es el
   bueno, y quien pega un guion no viene a aprender un vocabulario. */
const ROD_PALABRAS_CLASE = {
  camara:   ['camara', 'cámara', 'toma', 'yo', 'presentador', 'piezaacamara', 'acamara', 'talking'],
  pelicula: ['pelicula', 'película', 'clip', 'film', 'escena', 'cine'],
  ia:       ['ia', 'ai', 'generado', 'generada', 'veo', 'imagenia', 'sora', 'iavideo'],
  grafico:  ['grafico', 'gráfico', 'canva', 'animacion', 'animación', 'motion', 'infografia', 'infografía'],
  archivo:  ['archivo', 'broll', 'b-roll', 'stock', 'metraje', 'footage'],
  pantalla: ['pantalla', 'captura', 'screencast', 'screen', 'demo'],
  musica:   ['musica', 'música', 'respiro', 'interludio', 'bgm'],
  titulo:   ['titulo', 'título', 'carton', 'cartón', 'texto', 'rotulo', 'rótulo', 'placa'],
};
/* Las palabras que abren una directiva. Viven aquí arriba y no dentro del
   lector porque hacen falta DOS veces: para decidir que una línea es una
   directiva y no una cabecera —«Música: entra de fondo» es lo primero—, y
   para repartirla después. Dos listas separadas se habrían desincronizado
   a la tercera palabra que alguien añadiera. */
const ROD_DIRECTIVAS = [
  'visual', 'imagen', 'plano', 'video', 'toma',
  'nota', 'notas', 'rotulo', 'cintillo', 'lower',
  'fuente', 'cita', 'credito', 'creditos', 'ref', 'referencia',
  'sfx', 'fx', 'efecto', 'sonido', 'golpe',
  'musica', 'bgm', 'pista', 'cancion',
];

function rodClaseDe(palabra) {
  const p = String(palabra || '').toLowerCase().replace(/[^a-záéíóúñ-]/g, '');
  if (!p) return '';
  for (const k of Object.keys(ROD_PALABRAS_CLASE)) {
    if (ROD_PALABRAS_CLASE[k].indexOf(p) >= 0) return k;
  }
  return '';
}

/* Un tiempo suelto dentro de una línea: «0:30», «(1:15)», «30s», «1m30s».
   Devuelve los segundos y la línea sin él, que es lo que queda de título. */
function rodSacaTiempo(txt) {
  const s = String(txt || '');
  const re = /\(?\b(\d{1,2}:\d{2}(?::\d{2})?|\d{1,4}\s*(?:s(?:eg)?|m(?:in)?)\b|\d+\s*m(?:in)?\s*\d+\s*s)\)?/i;
  const m = s.match(re);
  if (!m) return { seg: 0, resto: s.trim() };
  const seg = rodSegs(m[1]);
  return { seg, resto: s.replace(m[0], ' ').replace(/\s{2,}/g, ' ').trim() };
}

function rodLeerGuion(texto) {
  const bloques = [];
  const avisos = [];
  const citasSueltas = [];
  let actual = null;
  let sinCabecera = 0;

  const nuevo = (clase, titulo, dur) => {
    actual = { clase: clase || 'camara', titulo: titulo || '', dur: dur || 0,
               guion: [], visual: '', notas: '', rotulo: '',
               sfx: [], musica: {}, citas: [] };
    bloques.push(actual);
    return actual;
  };

  String(texto == null ? '' : texto).replace(/\r/g, '').split('\n').forEach(cruda => {
    const l = cruda.trim();
    if (!l) return;
    if (/^[-=_~#*·—–]{3,}$/.test(l)) return;          // ---, ***, ═══, ———

    /* ── ¿Es una DIRECTIVA? ──
       ⚠️ VA ANTES QUE LA CABECERA, y esto costó encontrarlo. Al revés,
       una línea como «Música: entra de fondo» —que es como se escribe sin
       acordarse del «>»— caía en la rama de la cabecera, porque «música»
       es una de las palabras que nombran una clase de bloque: en vez de
       poner la música del bloque abría un bloque NUEVO titulado «entra de
       fondo». Lo mismo con «Rótulo:», «Toma:» y «Texto:». */
    const dirAntes = l.match(/^[>\-•*·]?\s*([a-zA-Záéíóúñ]{2,12})\s*[:：]\s*(.*)$/) ||
                     l.match(/^[>\-•*·]\s*(sfx|fx|efecto|sonido|golpe)\b\s*(.*)$/i);
    const claveAntes = dirAntes
      ? dirAntes[1].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      : '';
    const esDirectiva = actual && ROD_DIRECTIVAS.indexOf(claveAntes) >= 0;

    /* ── ¿Es una cabecera de bloque? ── */
    let cab = null;
    const conCorchetes = esDirectiva ? null
      : l.match(/^[[(【]\s*([^\]\)】]{1,60})\s*[\])】]\s*[-–—:.]?\s*(.*)$/);
    if (conCorchetes) {
      const dentro = rodSacaTiempo(conCorchetes[1]);
      const clase = rodClaseDe(dentro.resto.split(/\s+/)[0]) ||
                    rodClaseDe(dentro.resto.replace(/\s+\d+$/, ''));
      if (clase || dentro.seg) {
        cab = { clase: clase || 'camara', dur: dentro.seg, titulo: conCorchetes[2].trim() };
      }
    }
    if (!cab && !esDirectiva) {
      const conAlmohadilla = /^#{1,4}\s+/.test(l);
      const limpio = l.replace(/^#+\s*/, '').replace(/\*\*/g, '');
      const prim = limpio.split(/\s+/)[0];
      const clase = rodClaseDe(prim);
      if (clase) {
        /* ⚠️ EL TIEMPO SE SACA PRIMERO Y EL NÚMERO DE ORDEN DESPUÉS, y no
           al revés. Al revés, «PELÍCULA 1:15 — La Llegada» perdía el 1 —el
           quitanúmeros se lo comía creyendo que era el «1.» de una lista— y
           el bloque entraba con 15 segundos en vez de con 75. Un bloque que
           entra con la duración equivocada no da ningún error: desplaza
           todos los minutos de abajo y se descubre grabando.
           Y el quitanúmeros exige un separador o un espacio detrás, para
           que un título como «1968: el año que...» no se quede en «68». */
        const t = rodSacaTiempo(limpio.slice(prim.length));
        /* ⚠️ SIN DURACIÓN NO ES UNA CABECERA: ES PROSA, Y ESTO COSTÓ CARO.
           Sin esta condición, cualquier línea del guion que empezara por
           una de las palabras que nombran una clase abría un bloque nuevo
           —y las palabras son «veo», «yo», «texto», «escena», «clip»,
           «toma», «música»…, o sea media lengua—. Un párrafo de seis
           líneas entraba como seis bloques vacíos con el texto convertido
           en títulos: el guion no se perdía, se descuartizaba, que es
           peor, porque parece que funcionó.
           La forma con corchetes es inequívoca y no necesita esto; una
           cabecera pelada necesita su tiempo, o al menos un «##». */
        /* Y la tercera forma de corroborar: la palabra de clase ESCRITA EN
           MAYÚSCULAS. Así se escribe una cabecera —«PELÍCULA La Llegada»—
           y así no se escribe la prosa, que era el problema. Deja pasar
           las cabeceras a las que todavía no se les puso duración sin
           volver a abrirle la puerta a «Yo no sabía entonces…». */
        const enMayusculas = prim === prim.toLocaleUpperCase('es') &&
                             /[A-ZÁÉÍÓÚÜÑ]/.test(prim);
        if (t.seg || conAlmohadilla || enMayusculas) {
          const titulo = t.resto
            .replace(/^\s*\d{1,2}(?:\s*[.:)\-–—]\s*|\s+)/, '')
            .replace(/^[-–—:.]\s*/, '').trim();
          cab = { clase, dur: t.seg, titulo };
        }
      }
    }
    if (cab) { nuevo(cab.clase, cab.titulo, cab.dur); return; }

    /* ── La directiva, ya reconocida arriba ── */
    const dir = dirAntes;
    if (dir && actual) {
      /* Sin tildes para comparar: nadie escribe «música» y «musica» igual
         dos veces seguidas, y el guion viene pegado de otro sitio. Los
         acentos se quitan con el rango de marcas combinantes escrito con
         escapes: en claro son caracteres invisibles que cualquier editor
         se come al copiar el archivo. */
      const clave = claveAntes;
      const valor = (dir[2] || '').trim();
      if (['visual', 'imagen', 'plano', 'video', 'toma'].indexOf(clave) >= 0) { actual.visual = valor; return; }
      if (['nota', 'notas'].indexOf(clave) >= 0) { actual.notas = valor; return; }
      if (['rotulo', 'cintillo', 'lower'].indexOf(clave) >= 0) { actual.rotulo = valor; return; }
      if (['fuente', 'cita', 'credito', 'creditos', 'ref', 'referencia'].indexOf(clave) >= 0) {
        if (valor) { actual.citas.push(valor); citasSueltas.push(valor); }
        return;
      }
      if (['sfx', 'fx', 'efecto', 'sonido', 'golpe'].indexOf(clave) >= 0) {
        const t = rodSacaTiempo(valor);
        actual.sfx.push({ t: t.seg, que: t.resto.replace(/^[-–—:.]\s*/, '').trim(), fid: '' });
        return;
      }
      if (['musica', 'bgm', 'pista', 'cancion'].indexOf(clave) >= 0) {
        const m = rodLeerMusica(valor);
        actual.musica = {};
        ['acc', 'niv', 'ini', 'fin'].forEach(k => { if (m[k] !== undefined) actual.musica[k] = m[k]; });
        /* ⚠️ Y EL NOMBRE DE LA PISTA NO SE TIRA. «musica: The Calendar of
           Rain sigue de fondo» traía el título de la canción, y la primera
           versión leía «sigue» y «fondo» y dejaba caer el resto en
           silencio: el dato que más cuesta volver a escribir era justo el
           que se perdía. Se guarda como cita, que es lo que acaba siendo:
           esa canción hay que declararla igual. */
        if (m.nombre) { actual.citas.push(m.nombre); citasSueltas.push(m.nombre); }
        return;
      }
      /* Una palabra con dos puntos que no es de las de arriba NO se tira
         ni se coloca en un campo cualquiera: se queda como guion. Meterla
         donde no va la escondería, y esconder es peor que no entender. */
    }

    if (!actual) {
      sinCabecera++;
      nuevo('camara', '', 0);
    }
    actual.guion.push(l);
  });

  if (sinCabecera) {
    avisos.push('El texto empezaba sin cabecera de bloque: lo primero se metió en una toma a cámara. ' +
                'Las cabeceras son líneas como «[CÁMARA 0:30] Título».');
  }

  const salida = bloques.map(b => ({
    clase: b.clase,
    titulo: (b.titulo || b.guion[0] || '').slice(0, 120) || 'Sin título',
    dur: b.dur,
    guion: b.guion.join('\n'),
    visual: b.visual, notas: b.notas, rotulo: b.rotulo,
    sfx: b.sfx.filter(s => s.que).slice(0, 24),
    musica: b.musica,
    citas: b.citas,
  }));

  const sinTiempo = salida.filter(b => !b.dur).length;
  if (sinTiempo) {
    avisos.push(sinTiempo + (sinTiempo === 1 ? ' bloque viene' : ' bloques vienen') +
      ' sin duración: entran con 0 segundos y no suman nada al total. Ponles el tiempo al revisarlos.');
  }
  if (citasSueltas.length) {
    avisos.push(citasSueltas.length + (citasSueltas.length === 1 ? ' cita escrita' : ' citas escritas') +
      ' a mano en el texto. Se van a crear como fuentes SIN VERIFICAR, para que no se pierdan: ' +
      'ábrelas después en 📚 Citas y complétalas. Ninguna se descarta.');
  }
  return { bloques: salida, avisos, citas: [...new Set(citasSueltas)] };
}

/* «entra de fondo 0:25→1:04», «sale», «baja a media altura». Se leen las
   tres cosas por separado y en cualquier orden: nadie escribe una
   directiva de música con la misma sintaxis dos veces. */
function rodLeerMusica(txt) {
  const s = String(txt || '').toLowerCase();
  const m = {};
  if (/\bsale\b|\bsilencio\b|\bcorta\b/.test(s)) m.acc = 'sale';
  else if (/\bbaja\b|\bduck\b|\bfondo bajo\b/.test(s)) m.acc = 'baja';
  else if (/\bsube\b|\bcrece\b/.test(s)) m.acc = 'sube';
  else if (/\bsigue\b|\bcontinua\b|\bcontinúa\b/.test(s)) m.acc = 'sigue';
  else if (s.trim()) m.acc = 'entra';

  if (/primer plano|primerplano|adelante/.test(s)) m.niv = 'primero';
  else if (/media altura|medio/.test(s)) m.niv = 'medio';
  else if (/fondo/.test(s)) m.niv = 'fondo';

  const rango = s.match(/(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:→|->|-|a|hasta)\s*(\d{1,2}:\d{2}(?::\d{2})?)/);
  if (rango) { m.ini = rodSegs(rango[1]); m.fin = rodSegs(rango[2]); }
  else {
    const uno = s.match(/\bdesde\s+(\d{1,2}:\d{2})/);
    if (uno) m.ini = rodSegs(uno[1]);
  }

  /* Lo que queda después de quitarle las palabras que sí se entienden es,
     casi siempre, el NOMBRE DE LA PISTA. Se devuelve en vez de tirarlo: el
     título de una canción es el dato que más cuesta volver a escribir. Va
     sobre el texto ORIGINAL y no sobre el de minúsculas, que si no la
     canción acabaría citada en minúsculas para siempre. */
  const nombre = String(txt || '')
    .replace(/(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:→|->|-|a|hasta)\s*(\d{1,2}:\d{2}(?::\d{2})?)/gi, ' ')
    .replace(/\b(?:desde|hasta)\s+\d{1,2}:\d{2}/gi, ' ')
    .replace(/\b(primer\s+plano|primerplano|media\s+altura)\b/gi, ' ')
    .replace(/\b(sale|silencio|corta|baja|duck|sube|crece|sigue|continua|continúa|entra|adelante|medio|fondo|de|en|el|la|los|las|un|una|a|y)\b/gi, ' ')
    .replace(/[,.;:·|]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (nombre.length >= 3) m.nombre = nombre;   // menos de tres letras es un resto, no un título
  return m;
}

function rodPegarAbrir() {
  const ta = document.getElementById('rod-pegar-txt');
  if (ta) ta.value = '';
  const prev = document.getElementById('rod-pegar-vista');
  if (prev) prev.textContent = '';
  const av = document.getElementById('rod-pegar-aviso');
  if (av) av.textContent = '';
  const btn = document.getElementById('rod-pegar-meter');
  if (btn) btn.style.display = 'none';
  rodOverlay('rod-pegar-overlay', true);
}

let _rodPegado = null;

function rodPegarLeer() {
  const ta = document.getElementById('rod-pegar-txt');
  const prev = document.getElementById('rod-pegar-vista');
  const av = document.getElementById('rod-pegar-aviso');
  const btn = document.getElementById('rod-pegar-meter');
  if (!ta || !prev) return;

  const r = rodLeerGuion(ta.value);
  _rodPegado = r;
  prev.textContent = '';

  if (!r.bloques.length) {
    if (av) av.textContent = '⚠️ No se reconoció ni un bloque. Hace falta al menos una línea de cabecera, ' +
                             'como «[CÁMARA 0:30] El gancho».';
    if (btn) btn.style.display = 'none';
    return;
  }

  const total = r.bloques.reduce((a, b) => a + b.dur, 0);
  const cam = r.bloques.filter(b => b.clase === 'camara').reduce((a, b) => a + b.dur, 0);
  const res = document.createElement('div');
  res.className = 'rod-pegar-res';
  res.textContent = r.bloques.length + ' bloques · ' + rodReloj(total) + ' en total · ' +
    (total ? Math.round((cam / total) * 100) : 0) + '% a cámara';
  prev.appendChild(res);

  r.bloques.forEach(b => {
    const f = document.createElement('div');
    f.className = 'rod-pegar-fila';
    const c = rodClase(b.clase);
    f.appendChild(Object.assign(document.createElement('span'),
      { className: 'rod-chip rod-p-' + c.col, textContent: c.ic + ' ' + rodReloj(b.dur) }));
    f.appendChild(document.createTextNode(' ' + b.titulo));
    const extras = [];
    if (b.sfx.length) extras.push(b.sfx.length + ' efecto' + (b.sfx.length === 1 ? '' : 's'));
    if (b.musica && b.musica.acc) extras.push('música ' + (ROD_ACC[b.musica.acc] || {}).n);
    if (b.citas.length) extras.push(b.citas.length + ' cita' + (b.citas.length === 1 ? '' : 's'));
    if (extras.length) {
      f.appendChild(Object.assign(document.createElement('div'),
        { className: 'rod-pegar-extras', textContent: '↳ ' + extras.join(' · ') }));
    }
    prev.appendChild(f);
  });

  if (av) av.textContent = r.avisos.join(' ');
  if (btn) {
    btn.style.display = '';
    btn.textContent = '➕ Añadir estos ' + r.bloques.length + ' bloques' +
      (r.citas.length ? ' y ' + r.citas.length + ' fuentes' : '');
  }
}

async function rodPegarMeter() {
  const sb = rodSb();
  const av = document.getElementById('rod-pegar-aviso');
  if (!sb || !_rodPid || !_rodPegado) return;
  const btn = document.getElementById('rod-pegar-meter');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

  /* Primero las citas, porque los bloques van a apuntar a ellas. Nacen
     SIN VERIFICAR y con lo poco que traía el texto: es lo contrario de
     inventárselas, y es mejor que perderlas. La revisión de arriba las
     va a nombrar hasta que alguien las complete.

     Van TODAS EN UN SOLO VIAJE. Una a una eran veinte peticiones seguidas
     con la señal de una tableta, y cada una es una oportunidad de que se
     corte por la mitad: veinte fuentes creadas y ni un bloque, que es el
     estado más difícil de deshacer a mano. */
  const porTexto = {};
  const nuevas = [];
  _rodPegado.citas.forEach(txt => {
    const ya = _rodFue.find(f => (f.titulo || '').toLowerCase() === txt.toLowerCase());
    if (ya) { porTexto[txt] = ya.fid; return; }
    const fid = rodId('f');
    const base = { pid: _rodPid, fid, clase: 'web', titulo: txt.slice(0, 200),
                   licencia: 'desconocida', pantalla: true, verificada: false };
    base.rotulo = rodRotulo(base);
    porTexto[txt] = fid;
    nuevas.push(base);
  });
  if (nuevas.length) {
    const { error: eF } = await sb.from(ROD_T_FUE).insert(nuevas);
    if (eF) {
      /* ⚠️ Y SE VUELVE A ENCENDER EL BOTÓN. Sin esto, un fallo de red
         dejaba la ventana con el guion escrito, el botón apagado y un
         mensaje que pide reintentar algo que ya no se puede tocar: el
         único camino era cerrar y volver a pegar los treinta bloques. */
      if (btn) { btn.disabled = false; btn.textContent = '➕ Añadir'; }
      if (av) av.textContent = '⚠️ No se pudieron crear las fuentes: ' + (eF.message || '') +
                               ' No se añadió nada; vuelve a darle a Añadir.';
      return;
    }
    /* ⚠️ Y LA COPIA EN MEMORIA SE ENTERA, aquí y no al final. Si no, un
       fallo en los bloques de abajo dejaba `_rodFue` sin las fuentes recién
       creadas, y al reintentar el «¿ya existe una con este título?» decía
       que no y las creaba OTRA VEZ — justo lo contrario de lo que promete
       el mensaje de error. */
    _rodFue = _rodFue.concat(nuevas);
  }

  let orden = (_rodBlo.length ? Math.max(..._rodBlo.map(b => Number(b.orden) || 0)) : 0);
  const filas = _rodPegado.bloques.map(b => {
    orden++;
    return {
      pid: _rodPid, bid: rodId('b'), orden,
      clase: b.clase, titulo: b.titulo,
      /* Acotada al mismo tope que el `check` de la columna. Una cabecera
         con «2:00:00» daba 7200 y la base rebotaba el insert ENTERO con un
         error que habla de una restricción: treinta bloques perdidos y las
         fuentes ya creadas, por un cero de más en una línea. */
      dur: Math.max(0, Math.min(3600, Number(b.dur) || 0)),
      guion: b.guion, visual: b.visual, notas: b.notas, rotulo: b.rotulo,
      sfx: b.sfx, musica: b.musica || {},
      fids: b.citas.map(t => porTexto[t]).filter(Boolean),
    };
  });

  const { error } = await sb.from(ROD_T_BLO).insert(filas);
  if (btn) { btn.disabled = false; }
  if (error) {
    /* Si las fuentes entraron y los bloques no, se DICE: son dos viajes y
       el segundo puede fallar solo. Callarlo dejaría al autor volviendo a
       pegar el mismo guion y creando las fuentes por segunda vez. */
    if (av) av.textContent = '⚠️ ' + (error.message || 'No se pudieron guardar los bloques.') +
      (nuevas.length ? ' Las ' + nuevas.length + ' fuentes SÍ se crearon: al volver a pegar el ' +
                       'mismo guion se reconocen por el título y no se duplican.' : '');
    return;
  }
  rodOverlay('rod-pegar-overlay', false);
  if (typeof toast === 'function') toast('🎞️ ' + filas.length + ' bloques añadidos');
  _rodPegado = null;
  await rodCargarProyecto();
}

/* ══════════════ EL TELEPROMPTER ══════════════
   TODO lo que se dice en voz alta: las tomas a cámara y la voz en off, que
   en un video-ensayo es la mitad del texto. Cada bloque dice cuál es cuál.
   Lo que no lleva es lo que no se dice: un bloque sin guion no aparece, y
   las indicaciones de plano van en letra chica, no en el texto que se lee.

   Pasa a la velocidad que se le ponga, y el reloj de arriba corre para
   poder comparar lo que se tarda con lo que estaba presupuestado —que es la
   única forma de descubrir que una toma de «45 segundos» son en realidad
   dos minutos—.

   El espejo es para quien lea sobre un cristal delante del objetivo, que
   es como se mira a la cámara mientras se lee. Sin él hay que aprenderse
   el texto o mirar a un lado, y las dos cosas se notan. */
let _rodPromInt = null, _rodPromReloj = null, _rodPromSeg = 0, _rodPromVel = 2, _rodPromLuz = null;

function rodPrompterAbrir(bid) {
  const caja = document.getElementById('rod-prompter-txt');
  if (!caja) return;
  caja.textContent = '';

  /* ⚠️ TODO LO QUE SE DICE EN VOZ ALTA, NO SOLO LO QUE SE DICE A CÁMARA.
     Un video-ensayo es casi todo «yo hablando SOBRE material de archivo».
     Esa narración se escribe en el guion de un bloque de clase `archivo` o
     `grafico` —que es lo correcto para el presupuesto, porque esos segundos
     no son cara hablando—, y la primera versión del teleprompter solo leía
     los de clase `camara`: o sea que el guion narrado se escribía, se
     guardaba, y no se ensayaba nunca. Aquí entra cualquier bloque que tenga
     guion escrito, y cada uno dice si se graba mirando al lente o en off. */
  const tomas = rodTiempos(_rodBlo)
    .filter(b => String(b.guion || '').trim())
    .filter(b => !bid || b.bid === bid);

  if (!tomas.length) {
    caja.appendChild(Object.assign(document.createElement('p'), {
      className: 'rod-prom-nota',
      textContent: 'No hay ningún bloque con guion escrito, ni a cámara ni en off.',
    }));
  }

  caja.appendChild(Object.assign(document.createElement('div'), {
    className: 'rod-prom-nota', textContent: '[ Mira al lente. Respira. Empieza. ]',
  }));

  let nCam = 0;
  tomas.forEach(b => {
    const aCamara = b.clase === 'camara';
    if (aCamara) nCam++;
    const s = document.createElement('div');
    s.className = 'rod-prom-toma' + (aCamara ? '' : ' rod-prom-off');
    /* El rótulo dice cómo se graba, no solo cuándo: leer en off una frase
       escrita para mirar al lente sale forzado, y al revés se nota más. Y
       lleva lo que dura lo escrito al lado de lo presupuestado, porque es
       aquí, ensayando, donde se descubre si el número era una fantasía. */
    const estimado = rodDurGuion(b.guion);
    s.appendChild(Object.assign(document.createElement('div'), {
      className: 'rod-prom-rot',
      textContent: (aCamara ? '🎤 A CÁMARA ' + nCam : '🎙️ EN OFF') +
        ' · minuto ' + rodReloj(b.ini) + ' · presupuestado ' + rodReloj(b.dur) +
        (estimado ? ' · escrito ≈ ' + rodReloj(estimado) : ''),
    }));
    /* Cada párrafo aparte y con aire entre ellos: un muro de texto se
       pierde de vista en cuanto uno levanta los ojos al objetivo. */
    String(b.guion).split(/\n+/).forEach(p => {
      if (!p.trim()) return;
      s.appendChild(Object.assign(document.createElement('p'),
        { className: 'rod-prom-p', textContent: p.trim() }));
    });
    if (b.visual) {
      s.appendChild(Object.assign(document.createElement('div'),
        { className: 'rod-prom-nota', textContent: '🎥 ' + b.visual }));
    }
    caja.appendChild(s);
  });

  caja.appendChild(Object.assign(document.createElement('div'), {
    className: 'rod-prom-nota', textContent: '[ Pausa de tres segundos. Fin. ]',
  }));

  _rodPromSeg = 0;
  const rel = document.getElementById('rod-prom-reloj');
  if (rel) rel.textContent = '0:00';
  const area = document.getElementById('rod-prompter-area');
  if (area) area.scrollTop = 0;
  rodPrompterPasar(false);

  rodOverlay('rod-prompter', true);
  _rodPromReloj = setInterval(() => {
    _rodPromSeg++;
    const r = document.getElementById('rod-prom-reloj');
    if (r) r.textContent = rodReloj(_rodPromSeg);
  }, 1000);

  /* ⚠️ Y LA PANTALLA NO SE APAGA MIENTRAS SE ENSAYA.
     Una tableta se apaga sola al minuto y medio sin que la toquen, y
     leyendo un guion no se la toca: se apaga justo en mitad de la toma, y
     hay que desbloquearla con las manos ocupadas y la cámara grabando.
     El permiso puede no existir o negarse; si falla, no pasa nada más que
     lo de antes, así que no se avisa de ello. */
  if (navigator.wakeLock && navigator.wakeLock.request) {
    navigator.wakeLock.request('screen')
      .then(w => { _rodPromLuz = w; })
      .catch(() => {});
  }
}

function rodPrompterCerrar() {
  rodOverlay('rod-prompter', false);
  rodPrompterPasar(false);
  if (_rodPromReloj) { clearInterval(_rodPromReloj); _rodPromReloj = null; }
  /* Se suelta el permiso de pantalla encendida: dejarlo puesto se come la
     batería de la tableta el resto del día sin que nada lo diga. */
  if (_rodPromLuz) { try { _rodPromLuz.release(); } catch (e) {} _rodPromLuz = null; }
}

function rodPrompterPasar(encender) {
  const btn = document.getElementById('rod-prom-pasar');
  const area = document.getElementById('rod-prompter-area');
  if (_rodPromInt) { clearInterval(_rodPromInt); _rodPromInt = null; }
  if (encender && area) {
    _rodPromInt = setInterval(() => { area.scrollTop += _rodPromVel; }, 50);
  }
  if (btn) btn.textContent = _rodPromInt ? '⏸️ Parar' : '▶️ Pasar';
}

/* ══════════════ LO QUE SALE POR EL CHAT ══════════════
   Mismo reparto que el SQL y que el catálogo de los videos de M.E.T.A.S,
   y por lo mismo: el autor trabaja desde la tableta, sin el repositorio
   ni el editor de video delante. Lo que se escribe aquí sale en un
   recuadro listo para copiar y pegar donde haga falta —el montaje, la
   descripción del video, el chat—. */

function rodExportarPlan() {
  const pro = rodProyecto();
  if (!pro) return '';
  const pre = rodPresupuesto(_rodBlo, pro);
  const L = [];
  L.push('PLAN DE RODAJE · ' + (pro.titulo || '(sin título)'));
  if (pro.tesis) L.push('Tesis: ' + pro.tesis);
  L.push('Duración: ' + rodReloj(pre.total) + '  (objetivo ' + rodReloj(pre.objetivo) + ')');
  L.push('A cámara: ' + rodReloj(pre.cam) + '  (' + Math.round(pre.pct) + '%, tope ' + pre.topePct + '%)');
  L.push('');
  L.push('═══ SECUENCIA ═══');
  rodTiempos(_rodBlo).forEach((b, i) => {
    const c = rodClase(b.clase);
    L.push('');
    L.push('[' + rodReloj(b.ini) + ' → ' + rodReloj(b.ini + b.dur) + ']  ' +
           (i + 1) + '. ' + c.ic + ' ' + c.n.toUpperCase() + ' · ' + (b.titulo || 'sin título') +
           (b.listo ? '' : '   (BORRADOR)'));
    if (b.visual) L.push('   VISUAL: ' + b.visual);
    if (b.guion)  L.push('   VOZ: ' + String(b.guion).replace(/\n/g, '\n        '));
    const mus = b.musica && typeof b.musica === 'object' ? b.musica : {};
    if (mus.acc) {
      const f = mus.fid ? rodFuente(mus.fid) : null;
      L.push('   MÚSICA: ' + (ROD_ACC[mus.acc] || {}).n +
             (f ? ' · ' + (f.titulo || f.fid) : '') +
             (mus.ini || mus.fin ? ' · trozo ' + rodReloj(mus.ini || 0) + '→' + (mus.fin ? rodReloj(mus.fin) : 'final') : '') +
             (mus.niv ? ' · ' + ROD_NIV[mus.niv] : ''));
    }
    (Array.isArray(b.sfx) ? b.sfx : []).forEach(s => {
      L.push('   SONIDO ' + rodReloj(b.ini + (Number(s.t) || 0)) + ': ' + (s.que || '(sin describir)'));
    });
    (Array.isArray(b.fids) ? b.fids : []).forEach(x => {
      const f = rodFuente(x);
      if (f) L.push('   RÓTULO: ' + (f.rotulo || rodRotulo(f)));
    });
    if (b.notas) L.push('   NOTA: ' + b.notas);
  });
  return L.join('\n');
}

/* Los rótulos, uno por línea y con su minuto: es lo que se tiene al lado
   mientras se montan los cintillos, y se lee de arriba abajo sin buscar
   nada. */
function rodExportarRotulos() {
  const L = [];
  L.push('RÓTULOS DE PANTALLA · en el orden en que salen');
  L.push('');
  /* Sale de rodUsos, o sea de los TRES caminos: la música que entra en el
     minuto 6 necesita su crédito en el minuto 6 igual que un clip. Lo que
     decide si aparece o no es la casilla «sale en pantalla» de la fuente,
     que es de quien dirige; no el camino por el que entró. */
  const filas = [];
  _rodFue.filter(f => f.pantalla).forEach(f => {
    rodUsos(f.fid).forEach(u => filas.push({ t: u.t, txt: f.rotulo || rodRotulo(f) }));
  });
  filas.sort((a, b) => a.t - b.t);
  /* Un mismo rótulo repetido en el mismo segundo se pone una vez: pasa
     cuando un bloque acredita la película y además arranca su música. */
  let ultimo = '';
  let n = 0;
  filas.forEach(x => {
    const firma = x.t + '|' + x.txt;
    if (firma === ultimo) return;
    ultimo = firma; n++;
    L.push(rodReloj(x.t) + '   ' + x.txt);
  });
  if (!n) L.push('(ninguna fuente está marcada para salir en pantalla)');
  L.push('');
  L.push('— ' + n + (n === 1 ? ' rótulo' : ' rótulos') + '. Se ponen abajo a la izquierda, ' +
         'mientras dura el material que acreditan.');
  return L.join('\n');
}

/* La descripción del video. Va agrupada y con lo GENERADO POR UNA MÁQUINA
   en su propio apartado y el primero, con su herramienta y su prompt. Es
   lo que el autor pidió: que se distinga lo que hizo una IA de lo que hizo
   una persona, y que se distinga sin tener que buscarlo. */
const ROD_CORTE = '──────── copia de aquí para abajo ────────';

function rodExportarBibliografia() {
  const pro = rodProyecto();
  const L = [];

  /* ⚠️ LOS AVISOS VAN ARRIBA DEL CORTE, NUNCA DENTRO DEL TEXTO.
     La primera versión metía «⚠️ SIN VERIFICAR EN EL ORIGINAL» al lado de
     cada fuente que lo estuviera. Eso es una nota para el autor metida
     dentro de un texto cuyo único destino es pegarse en la descripción
     PÚBLICA de un video: la nota se iba con él, y lo que leía cualquiera
     era una lista de fuentes que el propio autor declaraba sin comprobar.
     Ahora van agrupadas encima de una raya, y el botón de copiar copia
     solo lo que hay debajo. */
  const pendientes = [];
  _rodFue.forEach(f => {
    const q = f.titulo || f.fid;
    if (!f.verificada) pendientes.push('· «' + q + '» sin verificar en el original.');
    if (f.licencia === 'desconocida') pendientes.push('· «' + q + '» sin licencia determinada.');
    if (rodFuenteClase(f.clase).ia && !String(f.prompt || '').trim()) {
      pendientes.push('· «' + q + '» es generada y no guarda su prompt.');
    }
  });
  if (pendientes.length) {
    L.push('⚠️ ANTES DE PUBLICAR — esto NO se pega, es para ti:');
    pendientes.forEach(x => L.push(x));
    L.push('');
  }
  L.push(ROD_CORTE);
  L.push('');

  L.push('FUENTES Y CRÉDITOS' + (pro && pro.titulo ? ' · ' + pro.titulo : ''));
  L.push('');
  L.push('Todo lo que se ve y se oye en este video está identificado abajo.');
  L.push('Lo generado con inteligencia artificial va aparte, con la herramienta');
  L.push('que lo produjo y el texto exacto con el que se pidió.');

  const grupos = {};
  _rodFue.forEach(f => {
    const g = rodFuenteClase(f.clase).grupo;
    (grupos[g] = grupos[g] || []).push(f);
  });
  const orden = ['Generado con inteligencia artificial', 'Música', 'Clips de película y serie',
                 'Material de archivo', 'Fuentes citadas', 'Material propio'];

  /* En qué minutos sale cada fuente. Se saca de los bloques y no se
     escribe a mano por lo mismo que todo lo demás de esta herramienta:
     un minuto escrito a mano se queda viejo al mover un bloque. */
  const minutos = {};
  _rodFue.forEach(f => {
    const m = rodUsos(f.fid).map(u => rodReloj(u.t));
    if (m.length) minutos[f.fid] = m;
  });

  orden.filter(g => grupos[g]).forEach(g => {
    L.push('');
    L.push('── ' + g.toUpperCase() + ' ──');
    grupos[g].forEach(f => {
      L.push('');
      L.push('· ' + (f.rotulo || rodRotulo(f)));
      if (rodFuenteClase(f.clase).ia) {
        if (f.herramienta) L.push('  Herramienta: ' + f.herramienta);
        if (f.prompt) L.push('  Prompt: «' + f.prompt + '»');
      }
      const lic = ROD_LICENCIAS[f.licencia];
      if (lic && f.licencia !== 'generado_ia' && f.licencia !== 'desconocida') {
        L.push('  Licencia: ' + lic.n);
      }
      const href = rodEnlace(f.url);
      if (href) L.push('  ' + href);
      if (minutos[f.fid]) L.push('  Aparece en: ' + [...new Set(minutos[f.fid])].join(', '));
    });
  });

  if (!_rodFue.length) { L.push(''); L.push('(todavía no hay ninguna fuente declarada)'); }
  return L.join('\n');
}

function rodTextoReel(r) {
  const L = [];
  L.push('REEL · ' + (r.titulo || 'sin cartel') + '  (' + rodReloj(r.dur) + ', ' + (ROD_REDES[r.red] || r.red) + ')');
  if (r.gancho) { L.push(''); L.push('GANCHO (3 primeros segundos): ' + r.gancho); }
  if (r.guion)  { L.push(''); L.push(r.guion); }
  if (r.cta)    { L.push(''); L.push('→ ' + r.cta); }
  const fids = Array.isArray(r.fids) ? r.fids : [];
  if (fids.length) {
    L.push('');
    L.push('CRÉDITOS (van también en el corto):');
    fids.forEach(x => { const f = rodFuente(x); if (f) L.push('· ' + (f.rotulo || rodRotulo(f))); });
  }
  if (r.hashtags) { L.push(''); L.push(r.hashtags); }
  return L.join('\n');
}

function rodExportarReels() {
  return _rodRee.map(rodTextoReel).join('\n\n' + '─'.repeat(40) + '\n\n');
}

function rodTextoAbrir(titulo, texto) {
  const t = document.getElementById('rod-texto-ventana');
  if (t) t.textContent = titulo;
  const ta = document.getElementById('rod-texto-caja');
  if (ta) ta.value = texto || '';
  rodOverlay('rod-texto-overlay', true);
}

/* ══════════════ EL CABLEADO ══════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const clic = (id, fn) => { const e = document.getElementById(id); if (e) e.addEventListener('click', fn); };
  const cambia = (id, fn) => { const e = document.getElementById(id); if (e) e.addEventListener('change', fn); };
  const escribe = (id, fn) => { const e = document.getElementById(id); if (e) e.addEventListener('input', fn); };

  clic('rod-back-btn', () => { if (typeof switchView === 'function') switchView('view-inicio'); });

  cambia('rod-proyecto', async e => { _rodPid = e.target.value; await rodCargarProyecto(); });
  clic('rod-nuevo-btn', () => rodProyectoAbrir(null));
  clic('rod-editar-btn', () => { const p = rodProyecto(); if (p) rodProyectoAbrir(p); });

  clic('rod-p-cerrar', () => rodOverlay('rod-p-overlay', false));
  clic('rod-p-guardar', rodProyectoGuardar);
  clic('rod-p-borrar', rodProyectoBorrar);

  /* ⚠️ LA DURACIÓN SE DEVUELVE ENTENDIDA, EN VOZ ALTA.
     En el teclado de una tableta los dos puntos están escondidos, así que
     lo que se escribe es «3» — y «3» son tres SEGUNDOS, no tres minutos.
     No se adivina cuál de las dos quería decir: se le enseña al momento en
     qué se ha convertido, con el equivalente hablado al lado. Adivinar
     acierta la mitad de las veces y falla en silencio; enseñar acierta
     siempre. */
  const ecoDur = () => {
    const eco = document.getElementById('rod-b-eco');
    if (!eco) return;
    const seg = rodSegs(rodVal('rod-b-dur'));
    const est = rodDurGuion(rodVal('rod-b-guion'));
    if (!seg) { eco.textContent = rodVal('rod-b-dur') ? '⚠️ No se entiende esa duración. Escribe «0:45», «45s» o «1m30s».' : ''; return; }
    eco.textContent = '⏱ Se entiende ' + rodReloj(seg) +
      (seg < 60 ? ' (' + seg + ' segundos)' : '') +
      (est ? '  ·  lo escrito son ≈ ' + rodReloj(est) + ' hablando' : '');
  };
  escribe('rod-b-dur', ecoDur);
  escribe('rod-b-guion', ecoDur);

  clic('rod-b-cerrar', () => rodOverlay('rod-b-overlay', false));
  clic('rod-b-guardar', rodBloqueGuardar);
  clic('rod-b-sfx-mas', () => { _rodSfxTmp.push({ t: 0, que: '', fid: '' }); rodPintarSfx(); });

  clic('rod-f-cerrar', () => rodOverlay('rod-f-overlay', false));
  clic('rod-f-guardar', rodFuenteGuardar);
  cambia('rod-f-clase', rodFuenteAjustar);
  ['titulo', 'autoria', 'obra', 'anio', 'editor', 'herramienta', 'rotulo']
    .forEach(c => escribe('rod-f-' + c, rodFuenteVistaRotulo));
  cambia('rod-f-licencia', rodFuenteVistaRotulo);
  /* Rearmar el rótulo tira lo escrito a mano: es la salida para cuando se
     corrigió y se quiere volver a lo que dicen los campos. */
  clic('rod-f-rearmar', () => { rodPon('rod-f-rotulo', ''); rodFuenteVistaRotulo(); });

  clic('rod-r-cerrar', () => rodOverlay('rod-r-overlay', false));
  clic('rod-r-guardar', rodReelGuardar);
  cambia('rod-r-bid', rodReelDelBloque);

  clic('rod-pegar-cerrar', () => rodOverlay('rod-pegar-overlay', false));
  clic('rod-pegar-leer', rodPegarLeer);
  clic('rod-pegar-meter', rodPegarMeter);
  /* El portapapeles: en una tableta, pegar en un recuadro grande con el
     dedo es donde se abandona. Solo se enseña si el navegador lo deja. */
  const btnPort = document.getElementById('rod-pegar-portapapeles');
  if (btnPort && navigator.clipboard && navigator.clipboard.readText) {
    btnPort.style.display = '';
    btnPort.addEventListener('click', async () => {
      try {
        const t = await navigator.clipboard.readText();
        const ta = document.getElementById('rod-pegar-txt');
        if (ta) { ta.value = t; rodPegarLeer(); }
      } catch (e) {
        const av = document.getElementById('rod-pegar-aviso');
        if (av) av.textContent = '⚠️ El navegador no dejó leer el portapapeles. Pega a mano en el recuadro.';
      }
    });
  }

  clic('rod-texto-cerrar', () => rodOverlay('rod-texto-overlay', false));
  clic('rod-texto-copiar', () => {
    const ta = document.getElementById('rod-texto-caja');
    if (!ta) return;
    /* Si el texto trae la raya, se copia SOLO lo de debajo: lo de encima
       son notas para el autor, y este texto va a la descripción pública de
       un video. Verlas en pantalla sirve; pegarlas, no. */
    const i = ta.value.indexOf(ROD_CORTE);
    rodCopiar(i >= 0 ? ta.value.slice(i + ROD_CORTE.length).replace(/^\n+/, '') : ta.value);
  });

  clic('rod-prom-cerrar', rodPrompterCerrar);
  clic('rod-prom-pasar', () => rodPrompterPasar(!_rodPromInt));
  clic('rod-prom-mas', () => { _rodPromVel = Math.min(12, _rodPromVel + 1); rodPromVelPintar(); });
  clic('rod-prom-menos', () => { _rodPromVel = Math.max(1, _rodPromVel - 1); rodPromVelPintar(); });
  clic('rod-prom-espejo', () => {
    const c = document.getElementById('rod-prompter-txt');
    if (c) c.classList.toggle('rod-prom-espejo');
  });
});

function rodPromVelPintar() {
  const e = document.getElementById('rod-prom-vel');
  if (e) e.textContent = String(_rodPromVel);
}

/* Lo de dentro se saca para la sonda: son las comprobaciones que hay que
   poder probar sin abrir la nube ni grabar un video. */
window.FaroRodaje = {
  version: 1,
  reloj: rodReloj,
  segs: rodSegs,
  tiempos: rodTiempos,
  durGuion: rodDurGuion,
  usos: rodUsos,
  presupuesto: rodPresupuesto,
  rotulo: rodRotulo,
  enlace: rodEnlace,
  esc: rodEsc,
  leerGuion: rodLeerGuion,
  leerMusica: rodLeerMusica,
  senales: rodSenales,
  revisar: rodRevisar,
  clases: ROD_CLASES,
  fuentes: ROD_FUENTES,
  licencias: ROD_LICENCIAS,
  exportar: {
    plan: rodExportarPlan,
    rotulos: rodExportarRotulos,
    bibliografia: rodExportarBibliografia,
    reels: rodExportarReels,
  },
};
