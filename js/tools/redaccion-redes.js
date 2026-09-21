'use strict';

/* ═══════════════════════════════════════════════════════════════════
   REDACCIÓN · 📣 REDES · las piezas para Facebook, X, LinkedIn,
   TikTok y YouTube, escritas aquí y con sus fuentes
   ═══════════════════════════════════════════════════════════════════
   Pedido por el autor el 21 de septiembre de 2026: «que le agregues
   las opciones para escribir en Facebook, en Twitter o X, en LinkedIn,
   lo que es TikTok y YouTube… guiones para publicar contenido…
   considera los límites de X y otras consideraciones… igual el manejo
   de fuentes, referencias».

   NO ES LA ANTENA. La Antena OBSERVA lo publicado (métricas, comentarios
   por responder) y publicar se hace desde la aplicación de cada red.
   Esto es lo de ANTES: dónde se ESCRIBE la pieza, con la forma que cada
   red le exige, y de dónde sale ya lista para pegar. Lo que sale de aquí
   es lo redactado: por eso todo acaba en 📋 Copiar, 📤 Compartir y
   ↗ Abrir en la red, y no en un botón de publicar.

   Vive aparte de redaccion.js por lo mismo que el banco de cortes vive
   aparte de El Rodaje: si este archivo no carga, Redacción sigue entera
   —el chip 📣 Redes sencillamente no aparece— y los ganchos en
   redaccion.js son cuatro `typeof … === 'function'`.

   Una PIEZA es: red + clase + texto + enlace + fuentes + estado + fecha,
   y opcionalmente la nota de la revista de la que salió. El texto es
   TEXTO PLANO a propósito: ninguna red acepta negritas ni cursivas
   pegadas, y un HTML aquí sería una promesa que la red no cumple.

   Las reglas largas están en CLAUDE.md («los textos para redes se
   escriben en Redacción»). Las que hay que tener delante al tocar esto:

   · Las cuentas de X son PONDERADAS (rrdLargoX): un enlace cuenta 23
     pase lo que pase, un emoji cuenta 2, una letra con tilde cuenta 1.
     Contar caracteres a secas aprobaría un post que X rechaza.
   · Las fuentes NO se pierden al salir de la revista: viajan con la
     pieza y salen donde cada red las admite (rrdSalida). En X no caben
     y van en la respuesta; en LinkedIn van en el primer comentario, con
     el enlace; en Facebook y en las descripciones van al pie; en un
     hilo son la última parte; en un guion son la lista para los rótulos.
     Una fuente PENDIENTE sale delatada, igual que en el export.
   · Los topes y las clases viven en el APARATO (RRD_REDES, RRD_REGLAS):
     añadir una red o subir un tope es una línea aquí, no una migración.
   · Nada del texto ni de la base llega a un atributo ni a innerHTML:
     todo con createElement y textContent. Esta pantalla vive en el mismo
     dominio que la Bóveda, y las piezas se pegan de cualquier sitio.
   · Se guarda en el aparato primero y se sube después; sin la tabla
     (42P01) funciona entera y lo dice («📴 Solo en este aparato»).
   ═══════════════════════════════════════════════════════════════════ */

const RRD_TABLA     = 'redaccion_redes';
const RRD_LOCAL_KEY = 'faro_redaccion_redes_v1';
const RRD_ESPERA_MAX = 8000;          // ms: la petición que no vuelve, no vuelve
const RRD_PALABRAS_MIN = 150;         // ritmo hablado en español (El Rodaje, regla 12)
const RRD_X_ENLACE = 23;              // lo que X cobra por cualquier enlace (t.co)

/* ── Las redes, en el orden en que se enseñan ──────────────────────
   `clases` es qué se escribe en cada una; la primera es la de siempre. */
const RRD_REDES = [
  { id: 'x',        nombre: 'X',        ic: 'fa-brands fa-x-twitter', color: '#0f172a',
    clases: ['post', 'hilo', 'comentario', 'perfil'],
    abrir: 'https://x.com/intent/post?text=', prefill: true,
    donde: 'x.com' },
  { id: 'facebook', nombre: 'Facebook', ic: 'fa-brands fa-facebook', color: '#1877f2',
    clases: ['post', 'comentario', 'perfil'],
    abrir: 'https://www.facebook.com/', prefill: false,
    donde: 'facebook.com' },
  { id: 'linkedin', nombre: 'LinkedIn', ic: 'fa-brands fa-linkedin', color: '#0a66c2',
    clases: ['post', 'comentario', 'perfil'],
    abrir: 'https://www.linkedin.com/feed/?shareActive=true&text=', prefill: true,
    donde: 'linkedin.com' },
  { id: 'tiktok',   nombre: 'TikTok',   ic: 'fa-brands fa-tiktok', color: '#ee1d52',
    clases: ['guion', 'descripcion', 'comentario', 'perfil'],
    abrir: 'https://www.tiktok.com/upload', prefill: false,
    donde: 'tiktok.com' },
  { id: 'youtube',  nombre: 'YouTube',  ic: 'fa-brands fa-youtube', color: '#ff0000',
    clases: ['guion', 'titulo', 'descripcion', 'comentario', 'perfil'],
    abrir: 'https://studio.youtube.com/', prefill: false,
    donde: 'YouTube Studio' },
];

const RRD_CLASES = {
  post:        { nombre: 'Post',        ic: '📝' },
  hilo:        { nombre: 'Hilo',        ic: '🧵' },
  guion:       { nombre: 'Guion',       ic: '🎬' },
  titulo:      { nombre: 'Título',      ic: '🏷️' },
  descripcion: { nombre: 'Descripción', ic: '📄' },
  comentario:  { nombre: 'Comentario',  ic: '💬' },
  perfil:      { nombre: 'Perfil',      ic: '👤' },
};

/* ── Los topes y las reglas de cada red y clase ────────────────────
   `max`: caracteres que la red admite. `gancho`: cuántos se ven antes
   del «Ver más». `fuentes`: dónde salen las fuentes de la pieza:
     dentro     → al pie del propio texto
     comentario → aparte, para la respuesta o el primer comentario
     ultima     → como última parte del hilo
     rotulo     → aparte, como lista para los rótulos y la descripción
     no         → esta clase no lleva fuentes
   `hashtags`: cuántos se aconsejan como mucho. `seg`: duración
   aconsejada de un guion (segundos); `segMax`, la que la red no pasa.
   Los números son los públicos de cada red en septiembre de 2026; si
   uno cambia, cambia AQUÍ y en ningún otro sitio. */
const RRD_REGLAS = {
  x: {
    post:       { max: 280, premium: 25000, fuentes: 'comentario', hashtags: 2,
                  ayuda: 'X cuenta 280 «unidades»: cada enlace vale 23 pase lo que pase y cada emoji vale 2. Las fuentes no caben: van en la respuesta al post, y el enlace sí va dentro. Con cuenta Premium el tope sube a 25.000, pero lo que se ve plegado sigue siendo lo primero.' },
    hilo:       { max: 280, fuentes: 'ultima', hashtags: 2, partes: true,
                  ayuda: 'Cada parte del hilo son 280 unidades. La primera tiene que sostenerse sola —es la que ve todo el mundo—, y la última lleva las fuentes. Las partes se separan con una línea que diga solo --- ; el botón ✂️ lo hace por ti a partir de un texto largo.' },
    comentario: { max: 280, premium: 25000, fuentes: 'dentro', hashtags: 0,
                  ayuda: 'Una respuesta cuenta igual que un post: 280 unidades. Si lleva fuente, la fuente es el enlace.' },
    perfil:     { max: 160, fuentes: 'no', hashtags: 0, rotulo: 'Biografía',
                  ayuda: 'La biografía de X son 160 caracteres. El nombre visible, 50.' },
  },
  facebook: {
    post:       { max: 63206, gancho: 125, fuentes: 'dentro', hashtags: 3,
                  ayuda: 'Facebook admite 63.206 caracteres, pero en el muro solo se ven los primeros ≈125 antes de «Ver más»: lo que engancha va ahí. Las fuentes van al pie del post. Facebook NO deja llegar con el texto puesto: se copia y se pega.' },
    comentario: { max: 8000, fuentes: 'dentro', hashtags: 0,
                  ayuda: 'Un comentario admite hasta 8.000 caracteres; los largos se pliegan igual que un post.' },
    perfil:     { max: 255, fuentes: 'no', hashtags: 0, rotulo: 'Descripción corta de la Página',
                  ayuda: 'La descripción corta de una Página son 255 caracteres. La larga («Información») no tiene tope práctico.' },
  },
  linkedin: {
    post:       { max: 3000, gancho: 210, fuentes: 'comentario', hashtags: 5,
                  ayuda: 'LinkedIn admite 3.000 caracteres y pliega a los ≈210 (menos en el teléfono): las dos primeras líneas deciden si se abre. Un enlace en el cuerpo baja el alcance: por eso el enlace y las fuentes salen APARTE, para el primer comentario. De 3 a 5 hashtags, al final.' },
    comentario: { max: 1250, fuentes: 'dentro', hashtags: 0,
                  ayuda: 'Un comentario admite 1.250 caracteres.' },
    perfil:     { max: 2600, fuentes: 'no', hashtags: 0, rotulo: 'Acerca de',
                  ayuda: 'El «Acerca de» del perfil admite 2.600 caracteres; el titular que va bajo el nombre, 220.' },
  },
  tiktok: {
    guion:      { seg: 60, segMax: 600, fuentes: 'rotulo', hashtags: 0,
                  ayuda: 'Un guion se mide en segundos hablados, no en letras (150 palabras por minuto). Los tres primeros segundos deciden si alguien se queda: el gancho va primero. Un minuto es lo aconsejado; diez, el tope del video. Las fuentes salen aparte, para ponerlas de rótulo y en la descripción.' },
    descripcion:{ max: 4000, gancho: 100, fuentes: 'dentro', hashtags: 5,
                  ayuda: 'La descripción admite 4.000 caracteres, con los hashtags dentro (de 3 a 5). Se ve plegada: la primera línea es la que cuenta.' },
    comentario: { max: 150, fuentes: 'dentro', hashtags: 0,
                  ayuda: 'Los comentarios de TikTok son cortos de verdad: 150 caracteres.' },
    perfil:     { max: 80, fuentes: 'no', hashtags: 0, rotulo: 'Biografía',
                  ayuda: 'La biografía de TikTok son 80 caracteres.' },
  },
  youtube: {
    guion:      { seg: null, segMax: null, fuentes: 'rotulo', hashtags: 0,
                  ayuda: 'Un guion se mide en segundos hablados (150 palabras por minuto). Para un Short, hasta 3:00; para un video largo no hay tope, y si es un video-ensayo con secuencia y citas, ese vive en 🎬 El Rodaje. Las fuentes salen aparte, para los rótulos y la descripción.' },
    titulo:     { max: 100, gancho: 70, fuentes: 'no', hashtags: 0,
                  ayuda: 'El título admite 100 caracteres, pero en la lista de resultados se cortan a unos 70: lo importante, delante.' },
    descripcion:{ max: 5000, gancho: 150, fuentes: 'dentro', hashtags: 3,
                  ayuda: 'La descripción admite 5.000 caracteres; los primeros ≈150 se ven sin abrirla y salen en el buscador. Las fuentes van al pie, numeradas. Los tres primeros hashtags salen encima del título.' },
    comentario: { max: 10000, fuentes: 'dentro', hashtags: 0,
                  ayuda: 'Un comentario admite 10.000 caracteres.' },
    perfil:     { max: 1000, fuentes: 'no', hashtags: 0, rotulo: 'Descripción del canal',
                  ayuda: 'La descripción del canal admite 1.000 caracteres.' },
  },
};

const RRD_ESTADOS = [
  { id: 'borrador',  label: '✏️ Borrador' },
  { id: 'lista',     label: '✅ Lista para salir' },
  { id: 'publicada', label: '📣 Publicada' },
];

let _rrdPiezas   = [];         // todas, incluidas las retiradas (lápida)
let _rrdNube     = 'mirando';  // mirando | puesta | sin-tabla | sin-senal | sin-sesion
let _rrdHayTabla = false;
let _rrdId       = null;       // pieza abierta en el editor
let _rrdSaveTimer = null;
let _rrdSalidaTimer = null;
let _rrdFiltro   = '';         // '' = todas las redes
let _rrdCargada  = false;      // ¿ya se miró la nube esta sesión?
let _rrdRetirando = null;      // id con el «¿Sí, retirar?» abierto
let _rrdInitEnCurso = null;    // la promesa de rrdInit mientras corre

/* ── Helpers ──────────────────────────────────────────────────────── */

function rrdSb() { return (typeof _sb !== 'undefined' && _sb) ? _sb : (window.faroSb || null); }

function rrdRed(id) { return RRD_REDES.find(r => r.id === id) || RRD_REDES[0]; }
function rrdRegla(red, clase) {
  const r = RRD_REGLAS[red] || RRD_REGLAS.x;
  return r[clase] || r[rrdRed(red).clases[0]];
}
function rrdClase(id) { return RRD_CLASES[id] || RRD_CLASES.post; }

function rrdHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function rrdFechaMas(dias) {
  const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function rrdFechaLarga(iso) {
  if (!iso) return '';
  return new Date(iso + 'T12:00:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
}

function rrdMiembro() {
  return (typeof redMiembro === 'function') ? redMiembro() : 'josue';
}

function rrdAviso(msg) { if (typeof toast === 'function') toast(msg); }

/* Construir DOM sin innerHTML: nada del texto llega a un atributo. */
function rrdEl(tag, cls, texto) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (texto !== undefined && texto !== null) e.textContent = texto;
  return e;
}
function rrdBtn(cls, texto, onClick) {
  const b = rrdEl('button', cls, texto);
  b.type = 'button';
  if (onClick) b.addEventListener('click', onClick);
  return b;
}
function rrdIcono(clases) {
  const i = document.createElement('i');
  i.className = clases;
  i.setAttribute('aria-hidden', 'true');
  return i;
}

/* Un enlace solo vale si URL() lo entiende y es http(s): un grep deja
   pasar «java\tscript:» y el navegador lo ejecuta igual. */
function rrdEnlace(u) {
  const s = String(u || '').trim();
  if (!s) return '';
  if (/[\s"'<>\\]/.test(s)) return '';
  try {
    const url = new URL(s);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.href;
  } catch (e) { return ''; }
}

/* «www.algo.com/x» sin el https se entiende y se dice cómo se entendió:
   escribir «https://» en el teclado de una tableta es el paso en que se
   deja de poner el enlace. */
function rrdEnlaceEntendido(u) {
  const s = String(u || '').trim();
  if (!s) return { url: '', nota: '' };
  const directo = rrdEnlace(s);
  if (directo) return { url: directo, nota: '' };
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(s)) {
    const arreglado = rrdEnlace('https://' + s);
    if (arreglado) return { url: arreglado, nota: 'Se entiende ' + arreglado };
  }
  return { url: '', nota: 'No parece una dirección: tiene que empezar por https://' };
}

/* ── La cuenta de X, ponderada ──────────────────────────────────────
   X no cuenta caracteres: cuenta «unidades». Un enlace, escrito como
   sea de largo, vale 23 (lo acorta t.co). Las letras de los alfabetos
   latino, griego y cirílico —tildes y eñes incluidas— valen 1; casi
   todo lo demás (emoji, chino, japonés) vale 2. Es la tabla pública de
   twitter-text, y contar a secas aprobaría un post que X rechaza. */
const RRD_URL_RE = /(?:https?:\/\/[^\s<>"']+|www\.[^\s<>"']+\.[a-z]{2,}(?:\/[^\s<>"']*)?|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|org|net|edu|gov|hn|es|mx|io|co|info|me|tv|app|dev|ar|cl|pe|gt|sv|ni|cr|pa|uy|ve|ec|bo|py|do|cu|pr|us|uk|de|fr|it)(?:\/[^\s<>"']*)?)/gi;

function rrdPesa1(cp) {
  return (cp <= 0x10FF) || (cp >= 0x2000 && cp <= 0x200D) ||
         (cp >= 0x2010 && cp <= 0x201F) || (cp >= 0x2032 && cp <= 0x2037);
}

function rrdLargoX(texto) {
  const t = String(texto || '');
  let total = 0;
  const sinEnlaces = t.replace(RRD_URL_RE, () => { total += RRD_X_ENLACE; return ''; });
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    for (const { segment } of seg.segment(sinEnlaces)) {
      const cps = [...segment].map(c => c.codePointAt(0));
      total += cps.every(rrdPesa1) ? cps.length : 2;
    }
    return total;
  }
  for (const ch of sinEnlaces) total += rrdPesa1(ch.codePointAt(0)) ? 1 : 2;
  return total;
}

/* Las demás redes cuentan caracteres (puntos de código). */
function rrdLargo(red, texto) {
  return red === 'x' ? rrdLargoX(texto) : [...String(texto || '')].length;
}

function rrdPalabras(texto) {
  const t = String(texto || '').trim();
  return t ? t.split(/\s+/).length : 0;
}
function rrdSegundos(texto) { return Math.round(rrdPalabras(texto) / RRD_PALABRAS_MIN * 60); }
function rrdMinSeg(seg) {
  const m = Math.floor(seg / 60), s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
function rrdHashtags(texto) {
  return (String(texto || '').match(/(?:^|\s)#[\p{L}\p{N}_]+/gu) || []).map(s => s.trim());
}

/* ── Las partes de un hilo ──────────────────────────────────────────
   Se separan con una línea que diga solo «---»: la misma raya que usan
   el guion de El Rodaje y los textos de La Voz Prestada. */
function rrdPartesDe(texto) {
  return String(texto || '').split(/\n[ \t]*-{3,}[ \t]*\n/)
    .map(s => s.trim()).filter(Boolean);
}

/* Partir un texto largo en partes que quepan, sin cortar frases si se
   puede: primero por párrafos, luego por frases, y solo por palabras
   cuando una frase sola no cabe. `reserva` es el sitio que se deja
   para el « n/N» de la numeración. */
function rrdPartirHilo(texto, tope, medir, reserva) {
  const cabe = s => medir(s) <= tope - (reserva || 0);
  const partes = [];
  let actual = '';
  const cierra = () => { if (actual.trim()) partes.push(actual.trim()); actual = ''; };
  const mete = trozo => {
    if (!trozo.trim()) return;
    const junto = actual ? actual + '\n\n' + trozo : trozo;
    if (cabe(junto)) { actual = junto; return; }
    cierra();
    if (cabe(trozo)) { actual = trozo; return; }
    // El trozo solo no cabe: por frases, y las frases que no quepan, por palabras
    const frases = trozo.match(/[^.!?…]+[.!?…]+["»)]?\s*|[^.!?…]+$/g) || [trozo];
    let fila = '';
    frases.forEach(f => {
      const ft = f.trim();
      if (!ft) return;
      const j = fila ? fila + ' ' + ft : ft;
      if (cabe(j)) { fila = j; return; }
      if (fila) { partes.push(fila); fila = ''; }
      if (cabe(ft)) { fila = ft; return; }
      let pal = '';
      ft.split(/\s+/).forEach(w => {
        const jw = pal ? pal + ' ' + w : w;
        if (cabe(jw)) { pal = jw; return; }
        if (pal) partes.push(pal);
        pal = w;
      });
      fila = pal;
    });
    actual = fila;
  };
  String(texto || '').split(/\n\s*\n/).forEach(p => mete(p.trim()));
  cierra();
  return partes;
}

function rrdNumerar(partes) {
  const n = partes.length;
  if (n < 2) return partes.slice();
  return partes.map((p, i) => `${p} ${i + 1}/${n}`);
}

/* ── El texto de una nota de la revista, plano ─────────────────────
   Las marcas [n] se quedan como texto: la lista de fuentes las nombra. */
function rrdPlanoDeNota(n) {
  const plano = (typeof redPlano === 'function') ? redPlano(n.cuerpo || '') : String(n.cuerpo || '');
  return plano.replace(/ /g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
function rrdFuentesDeNota(n) {
  if (typeof redCitasDe !== 'function') return [];
  return redCitasDe(n.cuerpo || '').map(c => ({ ref: c.ref || '' }));
}

/* ── La salida: lo que se copia, por red ─────────────────────────── */

function rrdBloqueFuentes(p) {
  const fuentes = (p.fuentes || []).map((f, i) => ({ n: i + 1, ref: String((f && f.ref) || '').replace(/\s+/g, ' ').trim() }));
  if (!fuentes.length) return { bloque: '', pendientes: 0, total: 0 };
  const pendientes = fuentes.filter(f => !f.ref).length;
  const bloque = '📚 Fuentes\n' + fuentes.map(f =>
    `[${f.n}] ${f.ref || '⚠️ PENDIENTE: falta buscar la fuente'}`).join('\n');
  return { bloque, pendientes, total: fuentes.length };
}

/* Devuelve { principal, partes, aparte, pendientes, avisos } */
function rrdSalida(p) {
  const regla = rrdRegla(p.red, p.clase);
  const texto = String(p.texto || '').replace(/\r/g, '').trim();
  const enlace = rrdEnlace(p.enlace);
  const { bloque, pendientes, total } = rrdBloqueFuentes(p);
  const medir = s => rrdLargo(p.red, s);
  const avisos = [];
  let principal = texto, partes = null, aparte = null;

  switch (regla.fuentes) {
    case 'dentro':
      principal = [texto, enlace, bloque].filter(Boolean).join('\n\n');
      break;
    case 'comentario':
      if (p.red === 'linkedin') {
        principal = texto;
        const cola = [enlace ? '🔗 ' + enlace : '', bloque].filter(Boolean).join('\n\n');
        if (cola) aparte = { titulo: 'Para el primer comentario', texto: cola,
          porque: 'En LinkedIn un enlace dentro del post baja el alcance: el enlace y las fuentes van en el primer comentario, que es donde los busca quien se interesó.' };
      } else {
        principal = [texto, enlace].filter(Boolean).join('\n\n');
        if (bloque) aparte = { titulo: 'Para responder al post', texto: bloque,
          porque: 'En 280 unidades no caben las fuentes: se publican como respuesta al propio post, que es donde se cita en X.' };
      }
      break;
    case 'ultima': {
      const tope = regla.max;
      let lista = rrdPartesDe(texto);
      if (enlace) {
        const conEnlace = (lista[0] || '') + '\n\n' + enlace;
        if (lista.length && medir(conEnlace) <= tope - 7) lista[0] = conEnlace;
        else lista.push('🔗 ' + enlace);
      }
      if (bloque) lista = lista.concat(rrdPartirHilo(bloque, tope, medir, 7));
      partes = (p.opciones && p.opciones.numerar === false) ? lista : rrdNumerar(lista);
      principal = partes.join('\n\n');
      break;
    }
    case 'rotulo':
      principal = texto;
      if (bloque || enlace) aparte = { titulo: 'Fuentes para los rótulos y la descripción',
        texto: [bloque, enlace ? '🔗 ' + enlace : ''].filter(Boolean).join('\n\n'),
        porque: 'Un guion no lleva la cita escrita: se dice, y la fuente sale de rótulo en pantalla y en la descripción del video.' };
      break;
    default:
      principal = texto;
  }
  if (pendientes) avisos.push(`⚠️ ${pendientes} de ${total} fuente${total === 1 ? '' : 's'} sin referencia: sale delatada como PENDIENTE. Búscala antes de publicar.`);
  return { principal, partes, aparte, pendientes, total, avisos };
}

/* ── El análisis: cuánto mide, dónde corta, qué avisa ─────────────── */

function rrdAnalisis(p) {
  const regla = rrdRegla(p.red, p.clase);
  const texto = String(p.texto || '');
  const salida = rrdSalida(p);
  const medir = s => rrdLargo(p.red, s);
  const res = { regla, salida, avisos: salida.avisos.slice(), partes: null, largo: 0, tope: null, estado: '' };

  const premium = !!(p.opciones && p.opciones.premium && regla.premium);
  res.tope = regla.partes ? regla.max : (premium ? regla.premium : regla.max) || null;

  if (regla.partes) {
    const lista = salida.partes || [];
    res.partes = lista.map(s => ({ texto: s, largo: medir(s), ok: medir(s) <= regla.max }));
    res.largo = res.partes.reduce((a, x) => a + x.largo, 0);
    const pasadas = res.partes.filter(x => !x.ok).length;
    res.estado = !lista.length ? '' : pasadas ? 'rojo' : 'ok';
    if (pasadas) res.avisos.push(`🔴 ${pasadas} parte${pasadas === 1 ? '' : 's'} pasa${pasadas === 1 ? '' : 'n'} de ${regla.max}. Toca ✂️ para repartirlo, o parte a mano con una línea ---.`);
    if (lista.length === 1 && medir(lista[0]) > regla.max) res.avisos.push('✂️ Hay una sola parte y no cabe: partir en hilo la reparte por frases.');
  } else if (res.tope) {
    // Se mide lo que de verdad se va a pegar (con enlace y fuentes si van dentro)
    res.largo = medir(salida.principal);
    res.estado = !texto.trim() ? '' : res.largo > res.tope ? 'rojo' : 'ok';
    if (res.estado === 'rojo') {
      res.avisos.push(`🔴 Sobran ${res.largo - res.tope} (tope ${res.tope}).` +
        (p.red === 'x' && p.clase === 'post' ? ' Un texto así es un hilo: cámbialo a 🧵 Hilo y toca ✂️.' : ''));
    }
    if (regla.gancho) {
      const primerParrafo = texto.trim().split(/\n\s*\n/)[0] || '';
      if (medir(primerParrafo) > regla.gancho + 40 && !/\n/.test(primerParrafo.trim())) {
        res.avisos.push(`👀 El primer párrafo pasa del corte de «Ver más» (≈${regla.gancho}). Lo que engancha tiene que estar antes del corte.`);
      }
    }
    if (p.red === 'linkedin' && p.clase === 'post' && RRD_URL_RE.test(texto)) {
      res.avisos.push('🔗 Hay un enlace dentro del texto: en LinkedIn baja el alcance. Ponlo en el campo Enlace y saldrá en el primer comentario.');
    }
    RRD_URL_RE.lastIndex = 0;
  } else if (regla.seg !== undefined) {
    res.segundos = rrdSegundos(texto);
    res.palabras = rrdPalabras(texto);
    const shorts = !!(p.opciones && p.opciones.shorts);
    const topeSeg = p.red === 'youtube' ? (shorts ? 180 : null) : regla.segMax;
    const aconsejado = p.red === 'youtube' ? (shorts ? 180 : null) : regla.seg;
    if (topeSeg && res.segundos > topeSeg) {
      res.estado = 'rojo';
      res.avisos.push(`🔴 ≈${rrdMinSeg(res.segundos)} hablado: pasa del tope de ${rrdMinSeg(topeSeg)}${shorts ? ' de un Short' : ''}.`);
    } else if (aconsejado && res.segundos > aconsejado) {
      res.estado = 'amarillo';
      res.avisos.push(`🟡 ≈${rrdMinSeg(res.segundos)} hablado. Lo aconsejado es hasta ${rrdMinSeg(aconsejado)}: lo que sobra se lo lleva el gancho.`);
    } else if (texto.trim()) res.estado = 'ok';
  }

  const tags = rrdHashtags(texto);
  res.hashtags = tags;
  if (regla.hashtags !== undefined && tags.length > regla.hashtags) {
    res.avisos.push(regla.hashtags === 0
      ? `#️⃣ ${tags.length} hashtag${tags.length === 1 ? '' : 's'}: aquí no aportan.`
      : `#️⃣ ${tags.length} hashtags: en ${rrdRed(p.red).nombre} se aconsejan como mucho ${regla.hashtags}.`);
  }
  return res;
}

/* ── Almacén: el aparato primero ──────────────────────────────────── */

function rrdLeeLocal() {
  try {
    const d = JSON.parse(localStorage.getItem(RRD_LOCAL_KEY)) || {};
    return Array.isArray(d.piezas) ? d.piezas : [];
  } catch (e) { return []; }
}
function rrdGuardaLocal() {
  try { localStorage.setItem(RRD_LOCAL_KEY, JSON.stringify({ piezas: _rrdPiezas })); } catch (e) {}
}

function rrdNuevoId() {
  return 'rr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function rrdConReloj(peticion, ms) {
  return Promise.race([
    peticion,
    new Promise(res => setTimeout(() => res({
      data: null, error: { code: 'FARO_RELOJ', message: 'la petición no volvió' },
    }), ms || RRD_ESPERA_MAX)),
  ]);
}

/* Gana la versión más reciente por el reloj del APARATO que escribió
   (`actualizado`), como en la repisa de enlaces y en La Voz Prestada. */
function rrdFusiona(local, nube) {
  const m = new Map();
  (local || []).forEach(p => { if (p && p.id) m.set(p.id, p); });
  (nube || []).forEach(p => {
    if (!p || !p.id) return;
    const mia = m.get(p.id);
    if (!mia || (p.actualizado || 0) >= (mia.actualizado || 0)) m.set(p.id, rrdDesdeFila(p));
  });
  return [...m.values()].sort((a, b) => (b.actualizado || 0) - (a.actualizado || 0));
}

const RRD_COLUMNAS = 'id,nota_id,red,clase,titulo,texto,enlace,fuentes,opciones,estado,fecha,publicada_at,autor,eliminada,eliminada_at,actualizado';

function rrdDesdeFila(f) {
  return {
    id: f.id, nota_id: f.nota_id || null, red: f.red || 'x', clase: f.clase || 'post',
    titulo: f.titulo || '', texto: f.texto || '', enlace: f.enlace || '',
    fuentes: Array.isArray(f.fuentes) ? f.fuentes : [],
    opciones: (f.opciones && typeof f.opciones === 'object') ? f.opciones : {},
    estado: f.estado || 'borrador', fecha: f.fecha || null,
    publicada_at: f.publicada_at || null, autor: f.autor || '',
    eliminada: !!f.eliminada, eliminada_at: f.eliminada_at || null,
    actualizado: Number(f.actualizado) || 0,
    subida: true,
  };
}
function rrdAFila(p) {
  return {
    id: p.id, nota_id: p.nota_id || null, red: p.red, clase: p.clase,
    titulo: p.titulo || '', texto: p.texto || '', enlace: rrdEnlace(p.enlace) || '',
    fuentes: p.fuentes || [], opciones: p.opciones || {},
    estado: p.estado || 'borrador', fecha: p.fecha || null,
    publicada_at: p.publicada_at || null, autor: p.autor || rrdMiembro(),
    eliminada: !!p.eliminada, eliminada_at: p.eliminada_at || null,
    actualizado: p.actualizado || Date.now(),
    actualizado_at: new Date().toISOString(),
  };
}

async function rrdBajar() {
  const sb = rrdSb();
  if (!sb) { _rrdNube = 'sin-sesion'; return null; }
  const { data, error } = await rrdConReloj(sb.from(RRD_TABLA)
    .select(RRD_COLUMNAS).order('actualizado', { ascending: false }).limit(500));
  if (error) {
    /* Un corte de red NO es una tabla que falta: 42P01 es «la relación
       no existe» y lo demás es la señal (El Rodaje, regla 14). */
    if (error.code === '42P01' || /relation .* does not exist/i.test(error.message || '')) {
      _rrdHayTabla = false; _rrdNube = 'sin-tabla';
    } else {
      _rrdNube = 'sin-senal';
    }
    return null;
  }
  _rrdHayTabla = true; _rrdNube = 'puesta';
  return data || [];
}

async function rrdSubir(p) {
  const sb = rrdSb();
  if (!sb || !_rrdHayTabla) return { ok: false, motivo: _rrdNube === 'sin-tabla' ? 'sin-tabla' : 'sin-nube' };
  const { error } = await rrdConReloj(sb.from(RRD_TABLA).upsert(rrdAFila(p), { onConflict: 'id' }));
  if (error) {
    if (error.code === 'FARO_RELOJ') return { ok: false, motivo: 'sin-senal' };
    if (error.code === '42501' || /row-level security/i.test(error.message || '')) return { ok: false, motivo: 'sin-permiso' };
    return { ok: false, motivo: 'error', detalle: error.message || '' };
  }
  p.subida = true;
  return { ok: true };
}

/* Lo que no subió se reintenta de verdad, al abrir y al volver la señal. */
async function rrdSubirPendientes(nube) {
  if (!_rrdHayTabla) return 0;
  const enNube = new Map((nube || []).map(f => [f.id, Number(f.actualizado) || 0]));
  const pendientes = _rrdPiezas.filter(p =>
    p && p.id && (!enNube.has(p.id) || enNube.get(p.id) < (p.actualizado || 0)));
  let subidas = 0;
  for (const p of pendientes) {
    const r = await rrdSubir(p);
    if (r.ok) subidas++;
  }
  if (subidas) rrdGuardaLocal();
  return subidas;
}

/* Arranque: lo del aparato al instante; la nube, cuando llegue. */
async function rrdInit() {
  if (_rrdInitEnCurso) return _rrdInitEnCurso;
  _rrdInitEnCurso = rrdInitDeVerdad().finally(() => { _rrdInitEnCurso = null; });
  return _rrdInitEnCurso;
}
async function rrdInitDeVerdad() {
  if (!_rrdCargada) {
    _rrdPiezas = rrdLeeLocal();
    _rrdCargada = true;
  }
  const nube = await rrdBajar();
  if (nube) {
    _rrdPiezas = rrdFusiona(_rrdPiezas, nube);
    await rrdSubirPendientes(nube);
    rrdGuardaLocal();
  }
  // Si Redacción está mirando las redes, se repinta con lo fusionado
  if (typeof _redEdicion !== 'undefined' && _redEdicion === 'redes') {
    const list = document.getElementById('red-list');
    if (list) rrdRender(list);
    if (typeof redRenderCabecera === 'function') redRenderCabecera();
  }
  if (typeof redRenderChips === 'function') redRenderChips();
  return _rrdPiezas;
}

function rrdRotuloNube() {
  if (_rrdNube === 'puesta')     return { ic: '☁️', t: 'Las piezas viajan a todos los aparatos de la casa', ok: true };
  if (_rrdNube === 'sin-tabla')  return { ic: '📴', t: 'Solo en este aparato: falta correr redaccion_redes.sql', ok: false };
  if (_rrdNube === 'sin-senal')  return { ic: '📡', t: 'Sin señal: se guardan aquí y suben cuando vuelva', ok: false };
  if (_rrdNube === 'sin-sesion') return { ic: '📴', t: 'Solo en este aparato: entra en F.A.R.O para que viajen', ok: false };
  return { ic: '⏳', t: 'Mirando la nube…', ok: false };
}

/* ── Piezas vivas, filtros y cuentas ─────────────────────────────── */

function rrdVivas() { return _rrdPiezas.filter(p => !p.eliminada); }
function rrdRetiradas() { return _rrdPiezas.filter(p => p.eliminada); }
function rrdPieza(id) { return _rrdPiezas.find(p => p.id === id) || null; }

/* Cuántas hay que atender: las de hoy y las atrasadas, sin publicar. */
function rrdPendientesHoy() {
  const hoy = rrdHoy();
  return rrdVivas().filter(p => p.estado !== 'publicada' && p.fecha && p.fecha <= hoy).length;
}

function rrdTituloDe(p) {
  if (p.titulo && p.titulo.trim()) return p.titulo.trim();
  const primera = String(p.texto || '').trim().split('\n')[0] || '';
  return primera.slice(0, 80) || '';
}

function rrdGrupoDe(p) {
  const hoy = rrdHoy();
  if (p.estado === 'publicada') return 'publicadas';
  if (!p.fecha) return 'sinfecha';
  if (p.fecha < hoy) return 'atrasadas';
  if (p.fecha === hoy) return 'hoy';
  return 'proximas';
}

const RRD_GRUPOS = [
  { id: 'atrasadas',  t: '🔴 Atrasadas' },
  { id: 'hoy',        t: '📅 Para hoy' },
  { id: 'proximas',   t: '📆 Próximas' },
  { id: 'sinfecha',   t: '📝 Sin fecha' },
  { id: 'publicadas', t: '✅ Publicadas' },
];

/* ── Ganchos para redaccion.js ───────────────────────────────────── */

/* El chip de la fila de ediciones, con la cuenta de lo que toca hoy. */
function rrdChipHtml(activo) {
  if (!_rrdCargada) { _rrdPiezas = rrdLeeLocal(); _rrdCargada = true; }
  const n = rrdPendientesHoy();
  return `<button type="button" class="red-ed-chip rrd-chip ${activo ? 'red-ed-chip-active' : ''}" data-ed="redes">
    📣 Redes${n ? ` · ${n}` : ''}
  </button>`;
}

/* La cabecera de Redacción cuando se están mirando las redes. */
function rrdCabecera(tituloEl, metaEl) {
  const vivas = rrdVivas();
  const hoy = vivas.filter(p => rrdGrupoDe(p) === 'hoy').length;
  const atras = vivas.filter(p => rrdGrupoDe(p) === 'atrasadas').length;
  const listas = vivas.filter(p => p.estado === 'lista').length;
  tituloEl.textContent = '📣 Redes';
  if (!vivas.length) { metaEl.textContent = 'Lo que se escribe para Facebook, X, LinkedIn, TikTok y YouTube, con sus fuentes.'; return; }
  const partes = [];
  if (atras) partes.push(`${atras} atrasada${atras === 1 ? '' : 's'}`);
  if (hoy) partes.push(`${hoy} para hoy`);
  if (listas) partes.push(`${listas} lista${listas === 1 ? '' : 's'} para salir`);
  partes.push(`${vivas.length} en total`);
  metaEl.textContent = partes.join(' · ');
}

/* ── La lista ─────────────────────────────────────────────────────── */

function rrdRender(list) {
  list.textContent = '';
  const vivas = rrdVivas();
  // Si nadie miró la nube todavía (initRedaccion pudo volver antes de
  // llegar a rrdInit), se mira ahora: «Mirando la nube…» no es un estado
  // en el que se pueda quedar una barra.
  if (_rrdNube === 'mirando' && !_rrdInitEnCurso) rrdInit();

  // La nube, a la vista
  const nube = rrdRotuloNube();
  const barra = rrdEl('div', 'rrd-nube ' + (nube.ok ? 'rrd-nube-ok' : 'rrd-nube-no'), `${nube.ic} ${nube.t}`);
  list.appendChild(barra);

  // Qué es esto, la primera vez
  if (!vivas.length) {
    const vacio = rrdEl('div', 'rrd-vacio');
    vacio.appendChild(rrdEl('div', 'rrd-vacio-ic', '📣'));
    const p1 = rrdEl('p'); p1.appendChild(rrdEl('strong', null, 'Todavía no hay piezas para redes.'));
    vacio.appendChild(p1);
    vacio.appendChild(rrdEl('p', null, 'Aquí se escribe lo que sale en Facebook, X, LinkedIn, TikTok y YouTube: un post, un hilo, el guion de un video, una descripción, un comentario. Cada pieza sabe el tope de su red, dónde la pliega el «Ver más», y se lleva sus fuentes.'));
    vacio.appendChild(rrdEl('p', null, 'Toca «Nueva pieza», o abre una nota de la revista y toca «📣 Llevar a redes»: el título, el texto y las citas salen de ahí.'));
    list.appendChild(vacio);
    rrdRenderRetiradas(list);
    return;
  }

  // Chips de red, con su cuenta: se deslizan, no bajan de línea
  const chips = rrdEl('div', 'rrd-filtros');
  const todas = rrdBtn('rrd-filtro ' + (!_rrdFiltro ? 'rrd-filtro-on' : ''), `Todas · ${vivas.length}`, () => { _rrdFiltro = ''; rrdRender(list); });
  chips.appendChild(todas);
  RRD_REDES.forEach(r => {
    const n = vivas.filter(p => p.red === r.id).length;
    if (!n) return;
    const b = rrdBtn('rrd-filtro ' + (_rrdFiltro === r.id ? 'rrd-filtro-on' : ''), '', () => { _rrdFiltro = r.id; rrdRender(list); });
    b.appendChild(rrdIcono(r.ic));
    b.appendChild(document.createTextNode(` ${r.nombre} · ${n}`));
    chips.appendChild(b);
  });
  list.appendChild(chips);

  const filtradas = _rrdFiltro ? vivas.filter(p => p.red === _rrdFiltro) : vivas;
  RRD_GRUPOS.forEach(g => {
    let del = filtradas.filter(p => rrdGrupoDe(p) === g.id);
    if (!del.length) return;
    if (g.id === 'publicadas') del = del.sort((a, b) => String(b.publicada_at || '').localeCompare(String(a.publicada_at || ''))).slice(0, 30);
    else if (g.id === 'proximas') del = del.sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
    const sec = rrdEl('div', 'red-seccion');
    sec.appendChild(rrdEl('h3', 'red-seccion-title', `${g.t} · ${del.length}`));
    del.forEach(p => sec.appendChild(rrdFila(p)));
    list.appendChild(sec);
  });

  rrdRenderRetiradas(list);
}

function rrdFila(p) {
  const red = rrdRed(p.red), clase = rrdClase(p.clase);
  const an = rrdAnalisis(p);
  const fila = rrdBtn('rrd-fila', '', () => rrdAbrir(p.id));
  fila.style.setProperty('--rrd-red', red.color);

  const ic = rrdEl('span', 'rrd-fila-ic');
  ic.appendChild(rrdIcono(red.ic));
  fila.appendChild(ic);

  const main = rrdEl('div', 'rrd-fila-main');
  const t = rrdTituloDe(p);
  main.appendChild(rrdEl('span', 'red-nota-titulo' + (t ? '' : ' red-sin-titulo'), t || 'Sin texto todavía'));
  const meta = rrdEl('div', 'red-nota-meta');
  meta.appendChild(rrdEl('span', 'red-badge red-badge-tipo', `${clase.ic} ${clase.nombre}`));
  const est = RRD_ESTADOS.find(e => e.id === p.estado) || RRD_ESTADOS[0];
  meta.appendChild(rrdEl('span', 'red-badge rrd-est-' + est.id, est.label));
  if (an.tope && an.estado) {
    meta.appendChild(rrdEl('span', 'red-badge rrd-cuenta rrd-cuenta-' + an.estado,
      an.partes ? `🧵 ${an.partes.length} parte${an.partes.length === 1 ? '' : 's'}${an.estado === 'rojo' ? ' 🔴' : ''}`
                : `${an.largo}/${an.tope}${an.estado === 'rojo' ? ' 🔴' : ''}`));
  } else if (an.segundos !== undefined && p.texto) {
    meta.appendChild(rrdEl('span', 'red-badge rrd-cuenta rrd-cuenta-' + (an.estado || 'ok'), `⏱ ≈${rrdMinSeg(an.segundos)}`));
  }
  if (an.salida.pendientes) meta.appendChild(rrdEl('span', 'red-badge red-nota-citas-pend', `🔖 ${an.salida.pendientes} sin fuente`));
  if (p.nota_id) meta.appendChild(rrdEl('span', 'red-badge rrd-badge-nota', '📰 De la revista'));
  if (p.fecha && p.estado !== 'publicada') meta.appendChild(rrdEl('span', 'red-nota-autor', `📅 ${rrdFechaLarga(p.fecha)}`));
  if (p.estado === 'publicada' && p.publicada_at) meta.appendChild(rrdEl('span', 'red-nota-autor', `salió ${rrdFechaLarga(String(p.publicada_at).slice(0, 10))}`));
  main.appendChild(meta);
  fila.appendChild(main);
  fila.appendChild(rrdIcono('fa-solid fa-chevron-right red-nota-arrow'));
  return fila;
}

/* Las retiradas se pueden devolver: una lápida no es un borrado. */
function rrdRenderRetiradas(list) {
  const ret = rrdRetiradas();
  if (!ret.length) return;
  const caja = rrdEl('details', 'rrd-retiradas');
  caja.appendChild(rrdEl('summary', null, `🗑️ ${ret.length} retirada${ret.length === 1 ? '' : 's'} · tocar para verlas`));
  ret.slice(0, 20).forEach(p => {
    const f = rrdEl('div', 'rrd-retirada');
    f.appendChild(rrdEl('span', 'rrd-retirada-t', `${rrdRed(p.red).nombre} · ${rrdTituloDe(p) || 'sin texto'}`));
    f.appendChild(rrdBtn('rrd-mini-btn', '↩️ Devolver', async () => {
      p.eliminada = false; p.eliminada_at = null; p.actualizado = Date.now();
      await rrdPersistir(p);
      rrdRender(list);
      if (typeof redRenderCabecera === 'function') redRenderCabecera();
      rrdAviso('↩️ Devuelta');
    }));
    caja.appendChild(f);
  });
  list.appendChild(caja);
}

/* ── Crear ─────────────────────────────────────────────────────────── */

function rrdNueva(red, clase, extra) {
  const r = rrdRed(red || 'x');
  const c = (clase && r.clases.includes(clase)) ? clase : r.clases[0];
  const p = Object.assign({
    id: rrdNuevoId(), nota_id: null, red: r.id, clase: c,
    titulo: '', texto: '', enlace: '', fuentes: [], opciones: {},
    estado: 'borrador', fecha: null, publicada_at: null,
    autor: rrdMiembro(), eliminada: false, eliminada_at: null,
    actualizado: Date.now(), subida: false,
  }, extra || {});
  _rrdPiezas.unshift(p);
  rrdGuardaLocal();
  rrdPersistir(p);
  return p;
}

/* Desde una nota de la revista: título, texto y citas ya puestos. */
function rrdDesdeNota(n, red, clase) {
  const r = rrdRed(red);
  const c = (clase && r.clases.includes(clase)) ? clase : r.clases[0];
  const titulo = (n.titulo || '').trim();
  const entradilla = (n.entradilla || '').trim();
  const plano = rrdPlanoDeNota(n);
  let texto = '';
  if (c === 'hilo') {
    const cuerpo = [titulo, entradilla, plano].filter(Boolean).join('\n\n');
    // 7 de reserva: el « 12/12» de la numeración
    texto = rrdPartirHilo(cuerpo, 280, rrdLargoX, 7).join('\n\n---\n\n');
  } else if (c === 'guion') {
    texto = [titulo ? `🎣 Gancho (3 segundos):\n${titulo}` : '🎣 Gancho (3 segundos):\n',
             `📖 Desarrollo:\n${entradilla || plano.split(/\n\s*\n/)[0] || ''}`,
             '👉 Cierre (qué hacer ahora):\n'].join('\n\n');
  } else if (c === 'titulo') {
    texto = titulo;
  } else if (c === 'descripcion') {
    texto = [titulo, entradilla || plano.split(/\n\s*\n/)[0] || ''].filter(Boolean).join('\n\n');
  } else {
    texto = [titulo, entradilla, plano].filter(Boolean).join('\n\n');
  }
  return rrdNueva(r.id, c, {
    nota_id: n.id,
    titulo: `${r.nombre} · ${titulo || 'nota sin título'}`.slice(0, 120),
    texto,
    fuentes: rrdFuentesDeNota(n),
  });
}

/* La hoja de «¿Para qué red?», desde el editor de la nota. */
function rrdAbrirElegir(n) {
  const ov = document.getElementById('rrd-elegir-overlay');
  const lista = document.getElementById('rrd-elegir-lista');
  if (!ov || !lista || !n) return;
  lista.textContent = '';
  const opciones = [
    { red: 'x', clase: 'post', t: 'Un post en X', d: '280 unidades: el título y el enlace. Las fuentes, en la respuesta.' },
    { red: 'x', clase: 'hilo', t: 'Un hilo en X con la nota entera', d: 'Se reparte sola en partes de 280, numeradas; la última lleva las fuentes.' },
    { red: 'facebook', clase: 'post', t: 'Un post en Facebook', d: 'La nota entera con las fuentes al pie; el gancho en los primeros ≈125.' },
    { red: 'linkedin', clase: 'post', t: 'Un post en LinkedIn', d: 'Hasta 3.000; el enlace y las fuentes van al primer comentario.' },
    { red: 'youtube', clase: 'guion', t: 'Un guion para YouTube', d: 'Gancho, desarrollo y cierre; se mide en segundos hablados.' },
    { red: 'tiktok', clase: 'guion', t: 'Un guion para TikTok', d: 'Lo mismo, con un minuto de meta y tres segundos de gancho.' },
    { red: 'youtube', clase: 'descripcion', t: 'La descripción de un video en YouTube', d: 'Título y entradilla, con las fuentes numeradas al pie.' },
  ];
  opciones.forEach(o => {
    const r = rrdRed(o.red);
    const b = rrdBtn('rrd-elegir-item', '', () => {
      ov.style.display = 'none';
      const p = rrdDesdeNota(n, o.red, o.clase);
      rrdAviso(`📣 Pieza creada para ${r.nombre}`);
      rrdAbrir(p.id);
    });
    b.style.setProperty('--rrd-red', r.color);
    const ic = rrdEl('span', 'rrd-elegir-ic'); ic.appendChild(rrdIcono(r.ic)); b.appendChild(ic);
    const txt = rrdEl('div', 'rrd-elegir-txt');
    txt.appendChild(rrdEl('span', 'rrd-elegir-t', o.t));
    txt.appendChild(rrdEl('span', 'rrd-elegir-d', o.d));
    b.appendChild(txt);
    lista.appendChild(b);
  });
  // Lo que ya salió de esta nota, para no crear dos veces lo mismo
  const ya = rrdVivas().filter(p => p.nota_id === n.id);
  if (ya.length) {
    const aviso = rrdEl('div', 'rrd-elegir-ya');
    aviso.appendChild(rrdEl('span', null, `Esta nota ya tiene ${ya.length} pieza${ya.length === 1 ? '' : 's'}: `));
    ya.forEach(p => aviso.appendChild(rrdBtn('rrd-mini-btn', `${rrdRed(p.red).nombre} · ${rrdClase(p.clase).nombre}`, () => {
      ov.style.display = 'none'; rrdAbrir(p.id);
    })));
    lista.appendChild(aviso);
  }
  ov.style.display = 'flex';
}

/* ── Guardar ───────────────────────────────────────────────────────── */

async function rrdPersistir(p) {
  rrdGuardaLocal();
  const r = await rrdSubir(p);
  if (r.ok) rrdGuardaLocal();
  return r;
}

function rrdSetSaveState(estado, detalle) {
  const el = document.getElementById('rrd-e-save-state');
  if (!el) return;
  if (estado === 'saving')   { el.textContent = 'Guardando…'; el.className = 'red-save-state red-save-saving'; }
  else if (estado === 'ok')  { el.textContent = 'Guardado ✓'; el.className = 'red-save-state red-save-ok'; }
  else if (estado === 'local') { el.textContent = detalle || 'Guardado aquí'; el.className = 'red-save-state red-save-off'; }
  else                       { el.textContent = 'Sin subir (se reintenta)'; el.className = 'red-save-state red-save-off'; }
}

function rrdCamposEditor() {
  const p = rrdPieza(_rrdId);
  if (!p) return null;
  p.titulo = (document.getElementById('rrd-e-rotulo').value || '').trim().slice(0, 120);
  p.texto  = document.getElementById('rrd-e-texto').value || '';
  p.enlace = rrdEnlaceEntendido(document.getElementById('rrd-e-enlace').value).url;
  p.actualizado = Date.now();
  p.subida = false;
  return p;
}

function rrdQueueSave() {
  const p = rrdCamposEditor();
  if (!p) return;
  rrdSetSaveState('saving');
  rrdGuardaLocal();
  clearTimeout(_rrdSaveTimer);
  _rrdSaveTimer = setTimeout(rrdSaveNow, 900);
  clearTimeout(_rrdSalidaTimer);
  _rrdSalidaTimer = setTimeout(rrdPintarAnalisis, 150);
}

async function rrdSaveNow() {
  clearTimeout(_rrdSaveTimer);
  const p = rrdPieza(_rrdId);
  if (!p) return;
  const r = await rrdPersistir(p);
  if (r.ok) rrdSetSaveState('ok');
  else if (r.motivo === 'sin-tabla' || r.motivo === 'sin-nube') rrdSetSaveState('local', '📴 Solo en este aparato');
  else rrdSetSaveState('off');
}

/* ── El editor de la pieza ───────────────────────────────────────── */

function rrdAbrir(id) {
  const p = rrdPieza(id);
  if (!p) return;
  if (_rrdId !== id) rrdCorDespintar();
  _rrdId = id;
  _rrdRetirando = null;
  document.getElementById('rrd-e-rotulo').value = p.titulo || '';
  document.getElementById('rrd-e-texto').value  = p.texto || '';
  document.getElementById('rrd-e-enlace').value = p.enlace || '';
  rrdPintarRedes();
  rrdPintarClases();
  rrdPintarEstado();
  rrdPintarFuentes();
  rrdPintarNota();
  rrdPintarAnalisis();
  rrdPintarRetirar();
  rrdSetSaveState(p.subida ? 'ok' : (_rrdNube === 'puesta' ? 'saving' : 'local'));
  if (typeof switchView === 'function') switchView('view-redaccion-pieza');
  rrdCrecerTexto();
}

function rrdPintarRedes() {
  const p = rrdPieza(_rrdId);
  const wrap = document.getElementById('rrd-e-redes');
  if (!p || !wrap) return;
  wrap.textContent = '';
  RRD_REDES.forEach(r => {
    const b = rrdBtn('rrd-red-chip ' + (p.red === r.id ? 'rrd-red-chip-on' : ''), '', () => {
      if (p.red === r.id) return;
      p.red = r.id;
      if (!r.clases.includes(p.clase)) p.clase = r.clases[0];
      rrdPintarRedes(); rrdPintarClases(); rrdPintarAnalisis();
      rrdQueueSave();
    });
    b.style.setProperty('--rrd-red', r.color);
    b.appendChild(rrdIcono(r.ic));
    b.appendChild(document.createTextNode(' ' + r.nombre));
    wrap.appendChild(b);
  });
}

function rrdPintarClases() {
  const p = rrdPieza(_rrdId);
  const wrap = document.getElementById('rrd-e-clases');
  if (!p || !wrap) return;
  wrap.textContent = '';
  const r = rrdRed(p.red);
  r.clases.forEach(cid => {
    const c = rrdClase(cid);
    const regla = rrdRegla(p.red, cid);
    const b = rrdBtn('rrd-clase-chip ' + (p.clase === cid ? 'rrd-clase-chip-on' : ''),
      `${c.ic} ${regla.rotulo || c.nombre}`, () => {
        if (p.clase === cid) return;
        p.clase = cid;
        rrdPintarClases(); rrdPintarAnalisis();
        rrdQueueSave();
      });
    wrap.appendChild(b);
  });
  // El texto explica qué se espera en esta clase
  const ta = document.getElementById('rrd-e-texto');
  if (ta) {
    const regla = rrdRegla(p.red, p.clase);
    ta.placeholder = regla.partes
      ? 'Escribe el hilo. Separa las partes con una línea que diga solo ---, o pega el texto seguido y toca ✂️ Partir en hilo.'
      : regla.seg !== undefined
        ? 'El guion, tal como se va a decir. Toca 📄 Molde para tener gancho, desarrollo y cierre.'
        : `Escribe aquí el ${(regla.rotulo || rrdClase(p.clase).nombre).toLowerCase()} para ${r.nombre}…`;
  }
}

function rrdPintarEstado() {
  const p = rrdPieza(_rrdId);
  const wrap = document.getElementById('rrd-e-estados');
  const fwrap = document.getElementById('rrd-e-fechas');
  if (!p || !wrap || !fwrap) return;
  wrap.textContent = '';
  RRD_ESTADOS.forEach(e => {
    wrap.appendChild(rrdBtn('rrd-est-chip rrd-est-chip-' + e.id + (p.estado === e.id ? ' rrd-est-chip-on' : ''), e.label, () => {
      p.estado = e.id;
      p.publicada_at = e.id === 'publicada' ? (p.publicada_at || new Date().toISOString()) : null;
      p.actualizado = Date.now(); p.subida = false;
      rrdPintarEstado(); rrdQueueSave();
      if (e.id === 'publicada') rrdAviso('📣 Publicada. Lo que pase con ella se mira en la Antena');
    }));
  });
  // El día: Hoy · Mañana · 📅 Otro · Sin fecha (el chip del Apunte rápido)
  fwrap.textContent = '';
  const hoy = rrdHoy(), man = rrdFechaMas(1);
  const pon = (t, val) => fwrap.appendChild(rrdBtn('rrd-fecha-chip ' + (p.fecha === val ? 'rrd-fecha-chip-on' : ''), t, () => {
    p.fecha = val; p.actualizado = Date.now(); p.subida = false;
    rrdPintarEstado(); rrdQueueSave();
  }));
  pon('Hoy', hoy); pon('Mañana', man);
  const otro = rrdEl('label', 'rrd-fecha-chip rrd-fecha-otro ' + (p.fecha && p.fecha !== hoy && p.fecha !== man ? 'rrd-fecha-chip-on' : ''));
  otro.appendChild(document.createTextNode(p.fecha && p.fecha !== hoy && p.fecha !== man ? `📅 ${rrdFechaLarga(p.fecha)}` : '📅 Otro día'));
  const inp = document.createElement('input');
  inp.type = 'date'; inp.className = 'rrd-fecha-input'; inp.value = p.fecha || '';
  inp.addEventListener('change', () => {
    p.fecha = inp.value || null; p.actualizado = Date.now(); p.subida = false;
    rrdPintarEstado(); rrdQueueSave();
  });
  otro.appendChild(inp);
  fwrap.appendChild(otro);
  pon('Sin fecha', null);
}

function rrdPintarNota() {
  const p = rrdPieza(_rrdId);
  const el = document.getElementById('rrd-e-nota');
  if (!p || !el) return;
  el.textContent = '';
  if (!p.nota_id) { el.style.display = 'none'; return; }
  const n = (typeof _redNotas !== 'undefined') ? _redNotas.find(x => x.id === p.nota_id) : null;
  el.style.display = '';
  el.appendChild(rrdEl('span', null, `📰 Sale de la nota «${n ? (n.titulo || 'Sin título') : 'ya no está'}».`));
  if (n && typeof redOpenEditor === 'function') {
    el.appendChild(rrdBtn('rrd-mini-btn', 'Abrir la nota', async () => { await rrdSaveNow(); rrdCorDespintar(); redOpenEditor(n.id); }));
    el.appendChild(rrdBtn('rrd-mini-btn', '🔖 Traer sus citas', () => {
      const nuevas = rrdFuentesDeNota(n);
      if (!nuevas.length) { rrdAviso('La nota no tiene citas'); return; }
      const ya = new Set((p.fuentes || []).map(f => (f.ref || '').trim()));
      let sumadas = 0;
      nuevas.forEach(f => { if (!ya.has((f.ref || '').trim()) || !(f.ref || '').trim()) { p.fuentes.push(f); sumadas++; } });
      p.actualizado = Date.now(); p.subida = false;
      rrdPintarFuentes(); rrdPintarAnalisis(); rrdQueueSave();
      rrdAviso(sumadas ? `🔖 ${sumadas} cita${sumadas === 1 ? '' : 's'} traída${sumadas === 1 ? '' : 's'}` : 'Ya estaban todas');
    }));
  }
}

function rrdPintarFuentes() {
  const p = rrdPieza(_rrdId);
  const wrap = document.getElementById('rrd-e-fuentes');
  if (!p || !wrap) return;
  wrap.textContent = '';
  const regla = rrdRegla(p.red, p.clase);
  if (regla.fuentes === 'no') {
    wrap.appendChild(rrdEl('div', 'rrd-fuentes-nota', 'Esta clase no lleva fuentes.'));
    return;
  }
  (p.fuentes || []).forEach((f, i) => {
    const fila = rrdEl('div', 'rrd-fuente' + ((f.ref || '').trim() ? '' : ' rrd-fuente-pend'));
    fila.appendChild(rrdEl('span', 'rrd-fuente-n', `[${i + 1}]`));
    const ta = document.createElement('textarea');
    ta.className = 'rrd-fuente-ref'; ta.rows = 1; ta.maxLength = 500;
    ta.placeholder = 'Autor, obra, año… o el enlace (vacía queda PENDIENTE)';
    ta.value = f.ref || '';
    // La caja crece con la referencia: a un renglón, una cita de APA se
    // leía cortada por la mitad y la pendiente ni enseñaba su ayuda.
    const crece = () => { ta.style.height = 'auto'; ta.style.height = Math.max(30, ta.scrollHeight) + 'px'; };
    ta.addEventListener('input', () => {
      f.ref = ta.value;
      fila.classList.toggle('rrd-fuente-pend', !ta.value.trim());
      p.actualizado = Date.now(); p.subida = false;
      crece();
      rrdQueueSave();
    });
    fila.appendChild(ta);
    requestAnimationFrame(crece);
    fila.appendChild(rrdBtn('rrd-fuente-quitar', '✕', () => {
      p.fuentes.splice(i, 1); p.actualizado = Date.now(); p.subida = false;
      rrdPintarFuentes(); rrdPintarAnalisis(); rrdQueueSave();
    }));
    wrap.appendChild(fila);
  });
  const donde = { dentro: 'Salen al pie del texto, numeradas.', comentario: p.red === 'linkedin' ? 'Salen aparte, para el primer comentario (con el enlace).' : 'Salen aparte, para responder al post.', ultima: 'Salen como la última parte del hilo.', rotulo: 'Salen aparte, para los rótulos en pantalla y la descripción.' };
  const pie = rrdEl('div', 'rrd-fuentes-pie');
  pie.appendChild(rrdBtn('rrd-mini-btn rrd-mini-btn-1', '+ Fuente', () => {
    p.fuentes = p.fuentes || [];
    p.fuentes.push({ ref: '' });
    p.actualizado = Date.now(); p.subida = false;
    rrdPintarFuentes(); rrdPintarAnalisis(); rrdQueueSave();
    const ultimo = wrap.querySelectorAll('.rrd-fuente-ref');
    if (ultimo.length) ultimo[ultimo.length - 1].focus();
  }));
  pie.appendChild(rrdEl('span', 'rrd-fuentes-nota', donde[regla.fuentes] || ''));
  wrap.appendChild(pie);
}

/* El análisis y la salida, repintados mientras se escribe. */
function rrdPintarAnalisis() {
  const p = rrdPieza(_rrdId);
  if (!p) return;
  const regla = rrdRegla(p.red, p.clase);
  const an = rrdAnalisis(p);
  const cont = document.getElementById('rrd-e-contador');
  const avisos = document.getElementById('rrd-e-avisos');
  const gancho = document.getElementById('rrd-e-gancho');
  const partes = document.getElementById('rrd-e-partes');
  const salida = document.getElementById('rrd-e-salida');
  const reglaEl = document.getElementById('rrd-e-regla');
  const opc = document.getElementById('rrd-e-opciones');
  const partirBtn = document.getElementById('rrd-e-partir-btn');
  const moldeBtn = document.getElementById('rrd-e-molde-btn');

  // Contador
  if (cont) {
    const texto = p.texto || '';
    let t;
    if (an.partes) t = `🧵 ${an.partes.length} parte${an.partes.length === 1 ? '' : 's'} · ${an.largo} unidades en total`;
    else if (an.tope) t = `${an.largo} / ${an.tope} ${p.red === 'x' ? 'unidades' : 'caracteres'}`;
    else if (an.segundos !== undefined) t = `${an.palabras} palabra${an.palabras === 1 ? '' : 's'} · ≈ ${rrdMinSeg(an.segundos)} hablado`;
    else t = `${[...texto].length} caracteres`;
    if (an.hashtags && an.hashtags.length) t += ` · #️⃣ ${an.hashtags.length}`;
    cont.textContent = t;
    cont.className = 'rrd-contador' + (an.estado ? ' rrd-cont-' + an.estado : '');
  }

  // Avisos
  if (avisos) {
    avisos.textContent = '';
    an.avisos.forEach(a => avisos.appendChild(rrdEl('div', 'rrd-aviso' + (a.startsWith('🔴') ? ' rrd-aviso-rojo' : ''), a)));
    avisos.style.display = an.avisos.length ? '' : 'none';
  }

  // Lo que se ve antes de «Ver más»
  if (gancho) {
    gancho.textContent = '';
    const texto = (p.texto || '').trim();
    if (regla.gancho && texto) {
      const cps = [...texto];
      const visto = cps.slice(0, regla.gancho).join('');
      const resto = cps.slice(regla.gancho).join('');
      gancho.appendChild(rrdEl('div', 'rrd-gancho-t', `👀 Lo que se ve sin tocar «Ver más» (≈${regla.gancho})`));
      const caja = rrdEl('div', 'rrd-gancho-caja');
      caja.appendChild(rrdEl('span', 'rrd-gancho-visto', visto));
      if (resto) caja.appendChild(rrdEl('span', 'rrd-gancho-resto', resto.slice(0, 160) + (resto.length > 160 ? '…' : '')));
      gancho.appendChild(caja);
      gancho.style.display = '';
    } else gancho.style.display = 'none';
  }

  // Las partes del hilo, con su cuenta
  if (partes) {
    partes.textContent = '';
    if (an.partes && an.partes.length) {
      an.partes.forEach((x, i) => {
        const c = rrdEl('div', 'rrd-parte' + (x.ok ? '' : ' rrd-parte-rojo'));
        const cab = rrdEl('div', 'rrd-parte-cab');
        cab.appendChild(rrdEl('span', null, `Parte ${i + 1}`));
        cab.appendChild(rrdEl('span', 'rrd-parte-cuenta', `${x.largo}/${regla.max}${x.ok ? '' : ' 🔴'}`));
        cab.appendChild(rrdBtn('rrd-mini-btn', '📋', () => rrdCopiarTexto(x.texto, `📋 Parte ${i + 1} copiada`)));
        c.appendChild(cab);
        c.appendChild(rrdEl('pre', 'rrd-parte-texto', x.texto));
        partes.appendChild(c);
      });
      partes.style.display = '';
    } else partes.style.display = 'none';
  }

  // Botones que solo tienen sentido en su clase
  if (partirBtn) partirBtn.style.display = (p.red === 'x' && (p.clase === 'hilo' || (p.clase === 'post' && an.estado === 'rojo'))) ? '' : 'none';
  if (moldeBtn) moldeBtn.style.display = (regla.seg !== undefined && !(p.texto || '').trim()) ? '' : 'none';

  // Opciones de la clase (Premium en X, Short en YouTube, numerar el hilo)
  if (opc) {
    opc.textContent = '';
    const interruptor = (t, clave, def) => {
      const on = p.opciones && (clave in p.opciones) ? !!p.opciones[clave] : !!def;
      const b = rrdBtn('rrd-opc-chip ' + (on ? 'rrd-opc-chip-on' : ''), (on ? '☑ ' : '☐ ') + t, () => {
        p.opciones = p.opciones || {};
        p.opciones[clave] = !on;
        p.actualizado = Date.now(); p.subida = false;
        rrdPintarAnalisis(); rrdQueueSave();
      });
      opc.appendChild(b);
    };
    if (regla.premium) interruptor('Cuenta Premium (hasta 25.000)', 'premium', false);
    if (regla.partes) interruptor('Numerar las partes 1/N', 'numerar', true);
    if (p.red === 'youtube' && p.clase === 'guion') interruptor('Es un Short (hasta 3:00)', 'shorts', false);
    opc.style.display = opc.childNodes.length ? '' : 'none';
  }

  // La regla de esta red y clase
  if (reglaEl) reglaEl.textContent = regla.ayuda || '';

  // La salida: lo que se va a copiar, tal cual
  if (salida) {
    salida.textContent = '';
    const s = an.salida;
    const r = rrdRed(p.red);
    if (!(p.texto || '').trim()) {
      salida.appendChild(rrdEl('div', 'rrd-salida-vacia', 'Aquí saldrá el texto tal como se va a pegar en ' + r.nombre + ', con sus fuentes donde esa red las admite.'));
      salida.style.display = '';
      return;
    }
    if (!an.partes) {
      const caja = rrdEl('div', 'rrd-salida-caja');
      caja.appendChild(rrdEl('div', 'rrd-salida-t', `📄 Lo que se pega en ${r.nombre}`));
      caja.appendChild(rrdEl('pre', 'rrd-salida-texto', s.principal));
      salida.appendChild(caja);
    }
    if (s.aparte) {
      const caja = rrdEl('div', 'rrd-salida-caja rrd-salida-aparte');
      caja.appendChild(rrdEl('div', 'rrd-salida-t', `💬 ${s.aparte.titulo}`));
      caja.appendChild(rrdEl('pre', 'rrd-salida-texto', s.aparte.texto));
      caja.appendChild(rrdEl('div', 'rrd-salida-porque', s.aparte.porque || ''));
      caja.appendChild(rrdBtn('rrd-mini-btn', '📋 Copiar esto aparte', () => rrdCopiarTexto(s.aparte.texto, '📋 Copiado: pégalo como comentario')));
      salida.appendChild(caja);
    }
    salida.style.display = '';
  }
}

/* El área de texto crece con lo escrito: un guion de tres minutos en
   una caja de cuatro renglones se corrige a ciegas. */
function rrdCrecerTexto() {
  const ta = document.getElementById('rrd-e-texto');
  if (!ta) return;
  ta.style.height = 'auto';
  ta.style.height = Math.max(140, ta.scrollHeight + 4) + 'px';
  rrdEspejoPintar();   // el espejo lleva siempre el mismo texto que el recuadro
}

/* ── 🪶 El corrector que enseña, sobre la pieza ───────────────────────
   Pedido por el autor el 21 de septiembre de 2026: «características
   respecto a la corrección de ortografía y estilo, tal como la tiene o
   si es posible mejor, como está en la redacción de la revista».

   Es EL MISMO corrector (js/tools/corrector.js): el mismo panel, las
   mismas reglas con su porqué, el mismo diccionario y la misma memoria
   de lo que se te repite. Lo único que cambia es el SUJETO: la nota
   vive en un cuerpo con formato y la pieza en un <textarea>, y eso lo
   sabe solo este objeto.

   ⚠️ EL ESPEJO. Un <textarea> no tiene nodos de texto, y los
   subrayados del corrector (CSS Custom Highlight) solo se pintan sobre
   nodos. Así que detrás del recuadro hay un <div> con el MISMO texto,
   la misma letra, el mismo relleno y el mismo ancho, con la tinta
   transparente: el subrayado se pinta ahí y se ve a través del
   recuadro, en el sitio exacto de cada palabra. Para que cuadre, los
   dos comparten TODAS las medidas en el CSS (.rrd-e-texto y
   .rrd-e-espejo van en la misma regla) y el recuadro crece con el
   texto en vez de desplazarse por dentro. La sonda mide que las
   medidas calculadas son iguales y que el primer subrayado cae donde
   empieza el texto.

   El toque sobre una palabra subrayada llega por el índice del cursor
   (`selectionStart`), no por el punto: dentro de un <textarea> el
   navegador no sabe decir qué carácter hay bajo el dedo. */
const RRD_SUJETO_CORRECTOR = {
  id: 'redes',
  listo: () => !!rrdPieza(_rrdId),
  campos: () => [{ id: 'cuerpo', mapa: rrdEspejoMapa }],
  /* Con el mismo cinturón que la nota: si lo que hay en ese tramo ya
     no es lo que se iba a corregir, no se toca nada. */
  aplicar(h) {
    const ta = document.getElementById('rrd-e-texto');
    if (!ta) return false;
    if (h.original && ta.value.slice(h.ini, h.fin) !== h.original) return false;
    ta.value = ta.value.slice(0, h.ini) + h.sugerencia + ta.value.slice(h.fin);
    rrdCrecerTexto();
    return true;
  },
  aplicable: () => true,
  guardar: () => rrdQueueSave(),
  scroll: () => document.querySelector('#view-redaccion-pieza .view-scroll'),
  /* Las opciones del análisis para un post: se tapan direcciones,
     hashtags y menciones; entran las reglas de las redes; una oración
     es kilométrica desde 30 palabras y no 45; y la minúscula con que
     empieza un renglón no se acusa. */
  opciones: { redes: true, mascara: true, largaMax: 30, mayusTrasSalto: false },
};

function rrdEspejoPintar() {
  const ta = document.getElementById('rrd-e-texto');
  const esp = document.getElementById('rrd-e-espejo');
  if (!ta || !esp) return;
  esp.textContent = ta.value;
}

/* El mapa que pide el corrector: el texto y el nodo que lo sostiene.
   Un solo nodo con todo el texto, con sus saltos de línea, que el
   espejo pinta con `white-space: pre-wrap` igual que el recuadro. */
function rrdEspejoMapa() {
  rrdEspejoPintar();
  const ta = document.getElementById('rrd-e-texto');
  const esp = document.getElementById('rrd-e-espejo');
  const texto = ta ? ta.value : '';
  const nodo = esp && esp.firstChild;
  return { texto, tramos: nodo ? [{ node: nodo, ini: 0, fin: texto.length }] : [] };
}

function rrdCorregir() {
  if (typeof corAbrirNueva !== 'function') { rrdAviso('El corrector no cargó (falta js/tools/corrector.js)'); return; }
  rrdCamposEditor();   // lo tecleado, en la pieza, antes de mirar
  corAbrirNueva(RRD_SUJETO_CORRECTOR);
}

/* Los subrayados pertenecen a la pieza que se estaba corrigiendo: al
   abrir otra o al salir, se recogen. */
function rrdCorDespintar() {
  if (typeof corOcultarBurbuja === 'function') corOcultarBurbuja();
  if (typeof corDespintar === 'function') corDespintar();
}

/* ── Copiar, compartir, abrir ─────────────────────────────────────── */

async function rrdCopiarTexto(texto, aviso) {
  try {
    await navigator.clipboard.writeText(texto);
    rrdAviso(aviso || '📋 Copiado');
    return true;
  } catch (e) {
    // Plan B: un área de texto y execCommand, que sigue funcionando en
    // los navegadores viejos de las tabletas.
    try {
      const ta = document.createElement('textarea');
      ta.value = texto; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.top = '-1000px';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      rrdAviso(ok ? (aviso || '📋 Copiado') : 'No se pudo copiar');
      return ok;
    } catch (e2) { rrdAviso('No se pudo copiar'); return false; }
  }
}

function rrdTextoParaCopiar(p) {
  const s = rrdSalida(p);
  if (s.partes) return s.partes.join('\n\n');
  return s.principal;
}

async function rrdCopiar() {
  const p = rrdPieza(_rrdId);
  if (!p) return;
  await rrdSaveNow();
  const s = rrdSalida(p);
  const texto = rrdTextoParaCopiar(p);
  if (!texto.trim()) { rrdAviso('No hay nada que copiar todavía'); return; }
  const aviso = s.pendientes
    ? `📋 Copiado · ⚠️ ${s.pendientes} fuente${s.pendientes === 1 ? '' : 's'} sin referencia`
    : s.partes ? `📋 Copiadas las ${s.partes.length} partes` : s.aparte ? '📋 Copiado · el comentario va aparte' : '📋 Copiado';
  await rrdCopiarTexto(texto, aviso);
}

async function rrdCompartir() {
  const p = rrdPieza(_rrdId);
  if (!p) return;
  await rrdSaveNow();
  const texto = rrdTextoParaCopiar(p);
  if (!texto.trim()) { rrdAviso('No hay nada que compartir todavía'); return; }
  if (!navigator.share) { await rrdCopiarTexto(texto, '📋 Copiado (este navegador no comparte)'); return; }
  try { await navigator.share({ text: texto }); }
  catch (e) { /* cancelado: no es un error */ }
}

/* Abrir la red con el texto puesto donde la red lo admite (X y
   LinkedIn); donde no (Facebook, TikTok, YouTube), se copia primero y
   se abre la red, que es lo más cerca que se puede llegar. El texto se
   copia SIEMPRE antes: si la red no lo recibe, ya está en el
   portapapeles y no hay que volver. */
async function rrdAbrirRed() {
  const p = rrdPieza(_rrdId);
  if (!p) return;
  await rrdSaveNow();
  const r = rrdRed(p.red);
  const s = rrdSalida(p);
  const texto = s.partes ? s.partes[0] : s.principal;
  if (!texto || !texto.trim()) { rrdAviso('No hay nada que llevar todavía'); return; }
  await rrdCopiarTexto(s.partes ? s.partes.join('\n\n') : s.principal, r.prefill ? '📋 Copiado por si la red no lo recibe' : '📋 Copiado: pégalo en ' + r.donde);
  let url = r.abrir;
  if (r.prefill) url += encodeURIComponent(texto);
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (!w) rrdAviso('El navegador bloqueó la ventana: abre ' + r.donde + ' y pega');
  if (s.partes && s.partes.length > 1) rrdAviso(`🧵 Va la parte 1. Las ${s.partes.length - 1} siguientes, respondiendo al post, con su 📋`);
}

/* ── Partir en hilo y molde de guion ─────────────────────────────── */

function rrdPartirAhora() {
  const p = rrdPieza(_rrdId);
  if (!p) return;
  const ta = document.getElementById('rrd-e-texto');
  const texto = (ta.value || '').replace(/\n[ \t]*-{3,}[ \t]*\n/g, '\n\n');
  if (!texto.trim()) return;
  if (p.clase !== 'hilo') { p.clase = 'hilo'; rrdPintarClases(); }
  const partes = rrdPartirHilo(texto, 280, rrdLargoX, 7);
  ta.value = partes.join('\n\n---\n\n');
  rrdQueueSave();
  rrdCrecerTexto();
  rrdAviso(`✂️ Repartido en ${partes.length} parte${partes.length === 1 ? '' : 's'}`);
}

function rrdPonerMolde() {
  const ta = document.getElementById('rrd-e-texto');
  if (!ta || ta.value.trim()) return;
  ta.value = '🎣 Gancho (3 segundos):\n\n\n📖 Desarrollo:\n\n\n👉 Cierre (qué hacer ahora):\n\n';
  rrdQueueSave();
  rrdCrecerTexto();
  ta.focus();
  ta.setSelectionRange(24, 24);
}

/* ── Retirar: dos toques en el mismo sitio, sin confirm() ───────── */

function rrdPintarRetirar() {
  const wrap = document.getElementById('rrd-e-retirar');
  if (!wrap) return;
  wrap.textContent = '';
  const p = rrdPieza(_rrdId);
  if (!p) return;
  if (_rrdRetirando === p.id) {
    wrap.appendChild(rrdEl('span', 'rrd-retirar-preg', '¿Retirar esta pieza?'));
    wrap.appendChild(rrdBtn('red-accion-btn red-accion-peligro', 'Sí, retirar', async () => {
      p.eliminada = true; p.eliminada_at = new Date().toISOString();
      p.actualizado = Date.now(); p.subida = false;
      clearTimeout(_rrdSaveTimer);
      await rrdPersistir(p);
      _rrdRetirando = null; _rrdId = null;
      if (typeof switchView === 'function') switchView('view-redaccion');
      if (typeof redRender === 'function') redRender();
      rrdAviso('🗑️ Retirada · se puede devolver desde la lista');
    }));
    wrap.appendChild(rrdBtn('red-accion-btn', 'No', () => { _rrdRetirando = null; rrdPintarRetirar(); }));
  } else {
    wrap.appendChild(rrdBtn('red-accion-btn red-accion-peligro', '🗑️ Retirar', () => { _rrdRetirando = p.id; rrdPintarRetirar(); }));
  }
}

/* ── Cableado ─────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Desde la vista principal de Redacción
  document.getElementById('red-rrd-nueva-btn')?.addEventListener('click', () => {
    const p = rrdNueva(_rrdFiltro || 'x');
    rrdAbrir(p.id);
  });

  // Desde el editor de la nota
  document.getElementById('red-e-redes-btn')?.addEventListener('click', async () => {
    if (typeof redNota !== 'function') return;
    if (typeof redSaveNow === 'function') await redSaveNow();
    const n = redNota();
    if (n) rrdAbrirElegir(n);
  });
  document.getElementById('rrd-elegir-close')?.addEventListener('click', () => {
    document.getElementById('rrd-elegir-overlay').style.display = 'none';
  });
  document.getElementById('rrd-elegir-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'rrd-elegir-overlay') e.target.style.display = 'none';
  });

  // El editor de la pieza
  document.getElementById('rrd-editor-back-btn')?.addEventListener('click', async () => {
    rrdCorDespintar();
    await rrdSaveNow();
    if (typeof _redEdicion !== 'undefined') _redEdicion = 'redes';
    if (typeof switchView === 'function') switchView('view-redaccion');
    if (typeof redRender === 'function') redRender();
  });
  ['rrd-e-rotulo', 'rrd-e-texto', 'rrd-e-enlace'].forEach(id =>
    document.getElementById(id)?.addEventListener('input', rrdQueueSave));
  document.getElementById('rrd-e-texto')?.addEventListener('input', rrdCrecerTexto);
  document.getElementById('rrd-e-enlace')?.addEventListener('input', () => {
    const nota = document.getElementById('rrd-e-enlace-nota');
    const v = document.getElementById('rrd-e-enlace').value;
    if (nota) nota.textContent = v.trim() ? rrdEnlaceEntendido(v).nota : '';
  });
  // El corrector que enseña, sobre la pieza
  document.getElementById('rrd-e-corr-btn')?.addEventListener('click', rrdCorregir);
  const taCor = document.getElementById('rrd-e-texto');
  taCor?.addEventListener('input', () => { if (typeof corTextoTecleado === 'function') corTextoTecleado(); });
  taCor?.addEventListener('click', e => {
    if (typeof corTocaEnIndice === 'function') corTocaEnIndice(taCor.selectionStart, e.clientX, e.clientY);
  });
  document.querySelector('#view-redaccion-pieza .view-scroll')
    ?.addEventListener('scroll', () => { if (typeof corOcultarBurbuja === 'function') corOcultarBurbuja(); }, { passive: true });

  document.getElementById('rrd-e-partir-btn')?.addEventListener('click', rrdPartirAhora);
  document.getElementById('rrd-e-molde-btn')?.addEventListener('click', rrdPonerMolde);
  document.getElementById('rrd-e-copiar-btn')?.addEventListener('click', rrdCopiar);
  document.getElementById('rrd-e-compartir-btn')?.addEventListener('click', rrdCompartir);
  document.getElementById('rrd-e-abrir-btn')?.addEventListener('click', rrdAbrirRed);
  document.getElementById('rrd-e-regla-toggle')?.addEventListener('click', () => {
    const c = document.getElementById('rrd-e-regla');
    const ch = document.getElementById('rrd-e-regla-chev');
    if (!c) return;
    const abierta = c.style.display !== 'none';
    c.style.display = abierta ? 'none' : '';
    if (ch) ch.classList.toggle('red-guia-chev-abierta', !abierta);
  });

  // Compartir no existe en el escritorio: el botón se esconde, no se deja muerto
  const comp = document.getElementById('rrd-e-compartir-btn');
  if (comp && !navigator.share) comp.style.display = 'none';

  window.addEventListener('online', () => { if (_rrdCargada) rrdInit(); });

  // Al recargar con el botón 🔄, guardar lo que haya a medias
  (window.faroGuardadosPendientes = window.faroGuardadosPendientes || []).push(async () => {
    const abierto = document.getElementById('view-redaccion-pieza')?.classList.contains('active');
    if (!abierto || !rrdPieza(_rrdId)) return { ok: true };
    rrdCamposEditor(); rrdGuardaLocal();
    const r = await rrdPersistir(rrdPieza(_rrdId));
    return r.ok || r.motivo === 'sin-tabla' || r.motivo === 'sin-nube'
      ? { ok: true }
      : { ok: false, aviso: 'La pieza para redes que estás escribiendo no subió a la nube. Hay copia en este aparato y subirá sola.' };
  });
});
