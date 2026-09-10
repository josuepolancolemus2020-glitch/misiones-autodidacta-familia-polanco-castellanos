'use strict';

/* ─────────────────────────────────────────────
   LA VOZ PRESTADA 📖 · el lector de los textos de encargo
   ─────────────────────────────────────────────
   PARA QUÉ: el autor le pide a una máquina un cuento, un ensayo, un
   poema o una carta «al modo de» un escritor —la frase corta de uno, la
   enumeración de otro, el narrador que no se fía de sí mismo— y lo que
   recibe es un muro de texto dentro de una ventana de chat. Un texto
   leído así no se lee: se ojea. Se pierde el sitio en cuanto se cierra
   la aplicación, no hay forma de saber cuánto falta, y a los tres días
   ni se encuentra.

   Esta herramienta hace dos cosas y ninguna más: guarda esos textos y
   los deja leer como se lee un libro —en páginas, con el tamaño de
   letra que a uno le sirve, en el color que aguanta de noche, con su
   índice, sus marcadores y su buscador, y volviendo justo a donde se
   dejó—.

   ⚠️ Y HACE UNA TERCERA QUE NO SE NEGOCIA: NO DEJA QUE SE OLVIDE QUIÉN
   LO ESCRIBIÓ. Un cuento escrito por una máquina imitando la voz de
   Rulfo NO ES DE RULFO, y a los seis meses, leído en una tableta y sin
   la ventana del chat alrededor, no hay absolutamente nada que lo
   distinga de uno que sí lo fuera. Así nace una atribución falsa: sin
   mala fe, por olvido. Por eso la voz imitada y la máquina que escribió
   viajan PEGADAS al texto —en la ficha del anaquel, en la portada, en
   el pie de cada página y dentro de lo que copia o comparte el botón—,
   y por eso la propia herramienta se llama así. El nombre es el
   recordatorio.

   Es la misma regla de oro del Estudio Mayor («ninguna fuente entra sin
   su etiqueta») y la misma de la repisa de enlaces («lo que hace la
   máquina va etiquetado»), aplicada donde más falta hace: aquí el
   material NO es un resumen de repaso que se nota automático a la
   tercera línea, es prosa que imita a un escritor a propósito y lo hace
   bien. Cuanto mejor le sale, más falta hace la etiqueta.

   DE QUIÉN SON LOS TEXTOS: de la casa, como El Rodaje y como la repisa
   de enlaces. Los cuatro leen todos; corregir y retirar es solo de quien
   lo puso, y eso lo hace cumplir la seguridad por fila, no la pantalla.

   DÓNDE ESTÁ CADA COSA:
     · la tabla, en `supabase/sql/voz_prestada.sql` (se pega a mano);
     · el estilo, en `css/voz-prestada.css`;
     · la sonda, en `_dev/probe-voz-prestada.html`.

   CÓMO ESTÁ ORDENADO ESTE ARCHIVO, de arriba abajo:
     1. cosas pequeñas y las llaves del aparato;
     2. el lector de texto pegado (vozLeer), que es donde más reglas hay;
     3. la nube;
     4. el anaquel;
     5. la sala de lectura: paginación, posición, gestos, paneles;
     6. copiar y compartir;
     7. la hoja de pegar y corregir;
     8. los enganches.
───────────────────────────────────────────── */

const VOZ_TABLE = 'voz_prestada';

/* Las cuatro llaves del aparato, y son cuatro a propósito:

   · LOS TEXTOS (VOZ_LOCAL) son la copia de aquí, para que el anaquel
     se pinte al instante y para que la herramienta funcione entera
     antes de que nadie haya corrido el SQL. Lo mismo que la repisa.
     (La llave sigue diciendo «cuentos» aunque ya guarde ensayos y
     poemas: cambiarla dejaría a cada aparato con el anaquel vacío hasta
     la siguiente bajada de la nube, y eso se lee como «se borraron».)
   · LOS AJUSTES (VOZ_AJUSTES) son del APARATO y globales: el tamaño de
     letra es una costumbre de unos ojos y de una pantalla, no del
     texto. Subirla a la nube le cambiaría la letra en la cara a quien
     lee en otro sitio. Misma razón que la llave de la hoja fijada de
     Finanzas.
   · LA POSICIÓN (VOZ_POS) también es del aparato, y esta es la que
     parece que debería viajar y NO debe: en esta casa el mismo texto lo
     leen cuatro personas. Una posición común significa que la hija
     abre el cuento por donde iba el padre, y el marcador de los dos se
     pierde a la vez. Se guarda por texto y por aparato.
   · LOS MARCADORES (VOZ_MARCAS) son del aparato por lo mismo que la
     posición: un marcador es «aquí me quedé pensando», y eso es de una
     persona, no de la casa. */
const VOZ_LOCAL   = 'faro_voz_cuentos_v1';
const VOZ_AJUSTES = 'faro_voz_ajustes_v1';
const VOZ_POS     = 'faro_voz_posicion_v1';
const VOZ_MARCAS  = 'faro_voz_marcas_v1';

/* ⚠️ 230 PALABRAS POR MINUTO, Y NO SON LAS 150 DE EL RODAJE.
   Ahí se mide un guion que se dice EN VOZ ALTA delante de una cámara;
   aquí se mide un texto que se lee CON LOS OJOS y en silencio, que va
   casi medio más rápido (la horquilla habitual en español ronda las
   200-250). Está escrito para que nadie iguale los dos números creyendo
   que uno de los dos estaba mal copiado. */
const VOZ_PPM = 230;

/* Los tres colores de la sala. No es una manía: un texto se lee de
   noche y en la cama, que es cuando una pantalla blanca deslumbra, y se
   lee también a mediodía en un patio, que es cuando el gris no se ve.
   El nombre va en palabras además del color porque el botón se toca a
   oscuras. */
const VOZ_TEMAS = [
  { id: 'papel', ic: '📄', t: 'Papel' },
  { id: 'sepia', ic: '🕯️', t: 'Sepia' },
  { id: 'noche', ic: '🌙', t: 'Noche' },
];

/* Las letras. La primera es Literata, que se dibujó para leer libros en
   pantalla (es la de Google Play Libros) y se trae de Google Fonts desde
   la hoja de estilo; si no llega —sin señal, o con la red que bloquea
   fuentes— cae en Georgia y no se nota nada más que el cambio de cara.
   La última no es un capricho tipográfico: las letras con la «d» y la
   «b» distintas y el espaciado ancho son las que se recomiendan para
   quien lee con dificultad, y en esta casa hay quien está aprendiendo a
   leer. */
const VOZ_LETRAS = [
  { id: 'libro',  t: 'Libro',    css: '"Literata", Georgia, "Times New Roman", serif' },
  { id: 'serif',  t: 'Clásica',  css: 'Georgia, "Times New Roman", serif' },
  { id: 'sans',   t: 'Sans',     css: '"Outfit", system-ui, sans-serif' },
  { id: 'ancha',  t: 'Legible',  css: '"Atkinson Hyperlegible", Verdana, system-ui, sans-serif' },
];

/* ⚠️ LOS GÉNEROS VIVEN AQUÍ, NO EN LA BASE. La columna `genero` guarda
   una palabra corta y su `check` solo mira el largo: añadir un género
   tiene que ser una línea en este archivo, no una migración que alguien
   pega desde una tableta (es la regla 8 de la repisa de enlaces). El
   nombre en singular es el que sale en la portada («Ensayo escrito por
   Claude») y en lo que se copia, por eso lleva su artículo aparte. */
const VOZ_GENEROS = [
  { id: 'cuento',   ic: '📖', t: 'Cuento',    pl: 'cuentos' },
  { id: 'ensayo',   ic: '🧭', t: 'Ensayo',    pl: 'ensayos' },
  { id: 'poema',    ic: '🪶', t: 'Poema',     pl: 'poemas' },
  { id: 'cronica',  ic: '🗞️', t: 'Crónica',   pl: 'crónicas' },
  { id: 'carta',    ic: '✉️', t: 'Carta',     pl: 'cartas' },
  { id: 'discurso', ic: '🎙️', t: 'Discurso',  pl: 'discursos' },
  { id: 'articulo', ic: '📰', t: 'Artículo',  pl: 'artículos' },
  { id: 'novela',   ic: '📚', t: 'Novela corta', pl: 'novelas cortas' },
  { id: 'texto',    ic: '📄', t: 'Texto',     pl: 'textos' },
];

function vozGenero(id) {
  return VOZ_GENEROS.find(g => g.id === id) || VOZ_GENEROS[0];
}

const VOZ_AJUSTES_POR_DEFECTO = {
  tema: 'papel', letra: 'libro', tam: 19, alto: 1.6, margen: 24, just: true,
  capital: true, paginas: 'auto',
};

let _vozCuentos = [];      // el anaquel, ya fusionado (aparato + nube)
let _vozHayTabla = true;   // ¿se corrió ya el SQL en esta base?
let _vozNubeVieja = false; // la tabla está, pero sin la columna `genero`
let _vozEstadoNube = 'mirando'; // mirando | puesta | vieja | sin-tabla | sin-senal | sin-sesion
let _vozFiltroVoz = '';    // '' = todas las voces
let _vozFiltroGen = '';    // '' = todos los géneros
let _vozBusca = '';
let _vozLeyendo = null;    // el texto abierto en la sala
let _vozCapActual = 0;
let _vozPagina = 0;
let _vozPaginas = 1;
let _vozAj = Object.assign({}, VOZ_AJUSTES_POR_DEFECTO);
let _vozPegado = null;     // lo último que entendió el lector de texto
let _vozEditando = null;   // cid del texto que se está corrigiendo

/* ══════════════ COSAS PEQUEÑAS ══════════════ */

/* El identificador NACE EN EL APARATO, no en la base. Es la misma regla
   que el `vid` de los videos de M.E.T.A.S y por lo mismo: el guardado se
   reintenta cuando la señal falla, y sin un identificador propio el
   segundo intento dejaría un texto gemelo en el anaquel. */
function vozCid() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function vozGuardaLocal() {
  try { localStorage.setItem(VOZ_LOCAL, JSON.stringify(_vozCuentos)); } catch (e) {}
}

function vozLeeLocal() {
  try {
    const s = localStorage.getItem(VOZ_LOCAL);
    const v = s ? JSON.parse(s) : [];
    return Array.isArray(v) ? v : [];
  } catch (e) { return []; }
}

function vozLeeAjustes() {
  try {
    const s = localStorage.getItem(VOZ_AJUSTES);
    if (s) _vozAj = Object.assign({}, VOZ_AJUSTES_POR_DEFECTO, JSON.parse(s) || {});
  } catch (e) { _vozAj = Object.assign({}, VOZ_AJUSTES_POR_DEFECTO); }
  if (!VOZ_LETRAS.some(l => l.id === _vozAj.letra)) _vozAj.letra = VOZ_AJUSTES_POR_DEFECTO.letra;
  if (!VOZ_TEMAS.some(t => t.id === _vozAj.tema)) _vozAj.tema = VOZ_AJUSTES_POR_DEFECTO.tema;
  return _vozAj;
}

function vozGuardaAjustes() {
  try { localStorage.setItem(VOZ_AJUSTES, JSON.stringify(_vozAj)); } catch (e) {}
}

function vozLeePos(cid) {
  try {
    const m = JSON.parse(localStorage.getItem(VOZ_POS) || '{}');
    return (m && m[cid]) || null;
  } catch (e) { return null; }
}

/* La posición es un párrafo y una FRACCIÓN de ese párrafo (`sub`): ver
   la nota grande de la sala de lectura. */
function vozGuardaPos(cid, cap, ancla, sub, fin) {
  try {
    const m = JSON.parse(localStorage.getItem(VOZ_POS) || '{}') || {};
    m[cid] = { cap: cap, ancla: ancla, sub: sub || 0, fin: !!fin, cuando: Date.now() };
    localStorage.setItem(VOZ_POS, JSON.stringify(m));
  } catch (e) {}
}

function vozLeeMarcas(cid) {
  try {
    const m = JSON.parse(localStorage.getItem(VOZ_MARCAS) || '{}');
    const l = m && m[cid];
    return Array.isArray(l) ? l : [];
  } catch (e) { return []; }
}

function vozGuardaMarcas(cid, lista) {
  try {
    const m = JSON.parse(localStorage.getItem(VOZ_MARCAS) || '{}') || {};
    m[cid] = lista;
    localStorage.setItem(VOZ_MARCAS, JSON.stringify(m));
  } catch (e) {}
}

/* Un nodo con su texto dentro, en una línea. En este archivo NO se
   escribe HTML con datos: ni con innerHTML, ni con insertAdjacentHTML,
   ni interpolando en un atributo. El cuerpo de un texto es lo más largo
   que entra en toda la aplicación y entra PEGADO desde otra ventana;
   F.A.R.O tiene dentro la Bóveda, las finanzas, el chat y los teléfonos
   del Buzón del lector. Un `innerHTML` aquí para pintar una cursiva
   sería la puerta más ancha de la casa por el motivo más tonto. */
function vozNodo(tag, clase, texto) {
  const n = document.createElement(tag);
  if (clase) n.className = clase;
  if (texto != null) n.textContent = texto;
  return n;
}

function vozBoton(clase, texto, alTocar, rotulo) {
  const b = vozNodo('button', clase, texto);
  b.type = 'button';
  if (rotulo) { b.title = rotulo; b.setAttribute('aria-label', rotulo); }
  if (alTocar) b.addEventListener('click', alTocar);
  return b;
}

/* Un aviso corto. ⚠️ La aplicación tiene `toast()` (js/app.js), no
   `showToast()`, que es lo que llamaba la primera versión de esto: los
   avisos de guardado no se vieron nunca en F.A.R.O y el de copiar caía
   en un `alert`. Y con la sala abierta el aviso de la aplicación tampoco
   serviría: vive con z-index 999 y la sala está por encima, así que se
   pinta uno DENTRO de la sala, que además se tiñe con el papel puesto. */
function vozAviso(msg) {
  const sala = document.getElementById('voz-lector');
  if (sala && !sala.hidden) {
    let t = document.getElementById('voz-toast');
    if (!t) { t = vozNodo('div', 'voz-toast'); t.id = 'voz-toast'; sala.appendChild(t); }
    t.textContent = msg;
    t.classList.add('voz-toast-on');
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('voz-toast-on'), 2600);
    return;
  }
  if (typeof toast === 'function') toast(msg);
  else if (typeof showToast === 'function') showToast(msg);
  else if (window.console) console.log('[voz]', msg);
}

function vozPalabrasDe(t) {
  return String(t || '').split(/\s+/).filter(Boolean).length;
}

function vozPalabras(caps) {
  let n = 0;
  (caps || []).forEach(c => {
    (c.p || []).forEach(p => { if (p.t) n += vozPalabrasDe(p.t); });
    (c.epi || []).forEach(p => { if (p.t) n += vozPalabrasDe(p.t); });
  });
  return n;
}

function vozMinutos(palabras) {
  return Math.max(1, Math.round((palabras || 0) / VOZ_PPM));
}

function vozFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* «hace 3 días», para la tarjeta de «Sigue leyendo». */
function vozHace(ms) {
  if (!ms) return '';
  const d = Math.max(0, Date.now() - ms);
  const min = Math.round(d / 60000);
  if (min < 2) return 'hace un momento';
  if (min < 60) return 'hace ' + min + ' min';
  const h = Math.round(min / 60);
  if (h < 24) return 'hace ' + h + (h === 1 ? ' hora' : ' horas');
  const dias = Math.round(h / 24);
  if (dias < 30) return 'hace ' + dias + (dias === 1 ? ' día' : ' días');
  return 'hace ' + Math.round(dias / 30) + (dias < 60 ? ' mes' : ' meses');
}

function vozSinTildes(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/* ══════════════════════════════════════════════════════════════════
   EL LECTOR DE TEXTO PEGADO
   ══════════════════════════════════════════════════════════════════
   ⚠️ EL TEXTO SE PEGA DE GOLPE, NO SE ESCRIBE CAMPO POR CAMPO.
   Es la misma regla que el guion de El Rodaje y las preguntas de los
   videos de M.E.T.A.S, y por lo mismo: el texto NO se inventa aquí —ya
   viene escrito, en otra ventana— y trocearlo a mano en una tableta
   son doscientos toques. Se pega tal como venga y esto lo reparte.

   ⚠️ Y LO QUE NO SE ENTIENDE SE QUEDA COMO PROSA. NUNCA se coloca a la
   fuerza en otro campo ni se descarta. Es la lección más cara del
   lector de guiones de El Rodaje, y aquí muerde el doble: un guion
   descuartizado se ve descuartizado, pero un cuento partido en
   capítulos falsos PARECE QUE FUNCIONÓ —sale su índice, sus páginas,
   todo— y el fallo solo se descubre leyéndolo entero.

   ⚠️ DE AHÍ LA ASIMETRÍA QUE MANDA EN TODO ESTE ARCHIVO, y hay que
   entenderla antes de tocar una expresión regular:

       equivocarse hacia «esto es prosa» cuesta un índice;
       equivocarse hacia «esto es un título» PARTE EL TEXTO.

   Lo primero se arregla leyendo (el texto se lee igual de bien de
   corrido). Lo segundo mete un salto de página en mitad de una frase.
   Así que ante la duda, prosa: SIEMPRE. Una línea pelada solo asciende
   a cabecera si se corrobora —la palabra «Capítulo» con su número, un
   número o romano a solas o con su título corto, mayúsculas de rótulo,
   o negrita sola y corta sin punto final—, y casi siempre tiene que
   estar sola entre blancos.

   LO QUE ENTIENDE, porque es lo que una máquina escribe de verdad:
     · `# Título` y las etiquetas de la cabecera (Voz:, Escrito por:…);
     · `## Capítulo` para los capítulos y `###` para los subtítulos de
       dentro (el nivel más alto que use el texto es el de capítulo, y
       lo más hondo es subtítulo: así un ensayo con secciones y
       subsecciones no sale con veinte capítulos);
     · `> cita` para las citas y los epígrafes;
     · `- `, `* `, `• ` y `1. ` para las listas;
     · `* * *` o `---` para el salto de escena;
     · la raya de diálogo, que abre párrafo aunque no haya blanco;
     · los VERSOS: tres o más renglones cortos seguidos se quedan con
       sus saltos, porque juntarlos destruye el poema sin avisar y no se
       puede deshacer. En prosa la equivocación contraria (renglones
       cortos que eran prosa) se ve y se corrige desde ✏️;
     · `*así*` y `**así**`, que se pintan sin innerHTML;
     · «FIN» a solas, como marca de final y no como capítulo. */

/* Las etiquetas de la cabecera del pegado. La lista vive AQUÍ y la
   ventana de ayuda la pinta leyendo de esta constante, nunca escrita a
   mano en el HTML: una lista copiada estaría equivocada el día que
   alguien añada una palabra, y quien la lea se fiará (misma regla que
   las materias de Videos M.E.T.A.S). La sonda la comprueba palabra por
   palabra. */
const VOZ_ETIQUETAS = {
  'titulo': 'titulo', 'title': 'titulo', 'nombre': 'titulo',
  'voz': 'voz', 'voz imitada': 'voz', 'al modo de': 'voz', 'a la manera de': 'voz',
  'al estilo de': 'voz', 'estilo de': 'voz', 'estilo': 'voz', 'en la voz de': 'voz',
  'voz prestada de': 'voz', 'imitando a': 'voz', 'imita a': 'voz', 'autor imitado': 'voz',
  'inspirado en': 'voz',
  'maquina': 'maquina', 'ia': 'maquina', 'modelo': 'maquina',
  'escrito por': 'maquina', 'redactado por': 'maquina', 'generado por': 'maquina',
  'generado con': 'maquina', 'hecho con': 'maquina', 'herramienta': 'maquina',
  'genero': 'genero', 'tipo': 'genero', 'forma': 'genero',
  'encargo': 'encargo', 'prompt': 'encargo', 'pedido': 'encargo',
  'peticion': 'encargo', 'consigna': 'encargo', 'instruccion': 'encargo',
  'nota': 'nota', 'notas': 'nota',
};

/* Los rótulos del campo, para pintar la ayuda desde la constante. */
const VOZ_CAMPOS = {
  titulo: 'El título', voz: 'La voz que se imita',
  maquina: 'La máquina que lo escribió', genero: 'El género',
  encargo: 'Lo que se le pidió', nota: 'Una nota tuya',
};

/* ⚠️ UNA CLAVE ES SOLO LETRAS Y ESPACIOS, y eso es lo que salva a las
   cabeceras. `## Capítulo 1: La casa` también lleva dos puntos; si al
   comparar se le quitaran la almohadilla y el dígito quedaría en
   «capitulo» y se leería como una etiqueta: el capítulo no se abriría y
   sus líneas se irían al anterior, sin dar ningún error. Por eso esto
   devuelve vacío en cuanto ve un dígito, una almohadilla o un corchete.
   Es literalmente la trampa que ya se pagó en el lector de El Rodaje. */
function vozClaveEtiqueta(linea) {
  const i = linea.indexOf(':');
  if (i < 1 || i > 40) return '';
  const bruto = linea.slice(0, i);
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(bruto)) return '';
  return vozSinTildes(bruto).trim().toLowerCase().replace(/\s+/g, ' ');
}

/* Quita el adorno de la línea sin tocar la raya de diálogo: viñetas del
   principio y los asteriscos o guiones bajos que envuelven. Una máquina
   escribe casi siempre `**Voz:** Rulfo` y con el adorno puesto eso no
   casa con ninguna etiqueta. */
function vozDesnuda(l) {
  let s = String(l).trim();
  s = s.replace(/^[>•·\-*]\s+/, '');
  s = s.replace(/^([*_]{1,3})([\s\S]*?)\1$/, '$2').trim();
  s = s.replace(/^([*_]{1,3})/, '').replace(/([*_]{1,3})$/, '').trim();
  return s;
}

/* Un renglón de solo adornos es un salto de escena («* * *», «···»,
   «---»), que en un texto no es decoración: es una elipsis de tiempo y
   se tiene que ver como tal. */
function vozEsSeparador(l) {
  const s = String(l).trim();
  if (!s) return false;
  return /^[\s*·•—–\-_=~#.…]+$/.test(s) && /[*·•—–\-_=~#.…]/.test(s);
}

const VOZ_PAL_CAP = new RegExp(
  '^(cap[íi]tulo|parte|acto|libro|secci[óo]n|pr[óo]logo|ep[íi]logo|' +
  'introducci[óo]n|coda|interludio|canto|escena|jornada|entrega)\\b\\s*' +
  '(?:[IVXLCDM]+|\\d+|un[oa]|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|' +
  'once|doce|primer[ao]?|segund[ao]|tercer[ao]?|cuart[ao]|quint[ao]|sext[ao]|' +
  's[ée]ptim[ao]|octav[ao]|noven[ao]|d[ée]cim[ao]|[úu]ltim[ao]|final)?\\s*' +
  '(?:[:.\\-–—]\\s*.{0,60})?$', 'i');

const VOZ_ROMANO = /^[IVXLCDM]{1,8}\s*[.\-–—]?$/;
const VOZ_NUMERO = /^\d{1,3}\s*[.\-–—]?$/;
/* «I. El pozo» y «1. El pozo»: un número con su título corto, SOLO si
   van solos entre blancos y sin punto final. Varios numerados seguidos
   son una lista, y eso se mira antes de llegar aquí. */
const VOZ_ROMANO_TIT = /^[IVXLCDM]{1,6}\s*[.:\-–—]\s+\S.{0,60}$/;
const VOZ_NUMERO_TIT = /^\d{1,3}\s*[.:\-–—]\s+\S.{0,60}$/;
const VOZ_FIN = /^[*_\s]*(fin|the end|fin de la historia|fin del cuento)[.]?[*_\s]*$/i;

function vozSinPuntoFinal(s) {
  return !/[.!?…,;:]$/.test(s);
}

/* ¿Esta línea pelada es una cabecera? Devuelve 'cap' (capítulo), 'sub'
   (subtítulo dentro del capítulo) o '' (prosa). Ver la asimetría escrita
   arriba: ante la duda, ''. `conAlmohadillas` dice si el texto ya trae
   sus capítulos con `##`: entonces una negrita o unas mayúsculas sueltas
   son un subtítulo, no otro capítulo más. */
function vozCabeceraPelada(l, sola, conAlmohadillas) {
  const crudo = String(l).trim();
  const s = vozDesnuda(l);
  if (!s || s.length > 80) return '';
  if (/^[—–\-*•·]\s/.test(crudo)) return '';   // raya de diálogo o viñeta: jamás
  if (VOZ_PAL_CAP.test(s)) return 'cap:pal';
  if (!sola) return '';
  if (VOZ_ROMANO.test(s) || VOZ_NUMERO.test(s)) return 'cap:num';
  if ((VOZ_ROMANO_TIT.test(s) || VOZ_NUMERO_TIT.test(s)) && vozSinPuntoFinal(s)) return 'cap:num';
  /* Mayúsculas de rótulo: así se escribe una cabecera y así no se
     escribe la prosa. Se compara con el mayúsculas del español para que
     una «ñ» o una vocal con tilde no cuenten como minúscula. */
  if (s.length <= 70 && /[A-ZÁÉÍÓÚÑ]/.test(s) &&
      s === s.toLocaleUpperCase('es') && /[A-Za-zÀ-ſ]{2}/.test(s)) {
    return (conAlmohadillas ? 'sub' : 'cap') + ':mayus';
  }
  /* Negrita sola, corta y sin punto final: «**La casa**». Es como una
     máquina rotula cuando no usa almohadillas. Con punto final es una
     frase con énfasis, y una frase con énfasis es prosa. */
  if (/^(\*\*|__)\S[\s\S]*\S\1$/.test(crudo) && s.length <= 60 && vozSinPuntoFinal(s)) {
    return (conAlmohadillas ? 'sub' : 'cap') + ':negrita';
  }
  return '';
}

/* ¿Más adelante hay otra cabecera de la MISMA clase (otra negrita
   sola, otro rótulo en mayúsculas)? Un título es único; los capítulos
   vienen en serie. Es lo que separa «**El jardín**» título de
   «**El jardín**» primer capítulo cuando más abajo viene «**La casa**». */
function vozHaySiguienteIgual(lineas, desde, clase, conAlmohadillas) {
  for (let j = desde + 1; j < lineas.length; j++) {
    const l = lineas[j].trim();
    if (!l) continue;
    const sola = !lineas[j - 1].trim() && (j === lineas.length - 1 || !(lineas[j + 1] || '').trim());
    const k = vozCabeceraPelada(l, sola, conAlmohadillas);
    if (k && k.split(':')[1] === clase) return true;
  }
  return false;
}

/* Las dos formas SIN dos puntos que una máquina escribe de verdad y que
   si no se reconocen se pierden: «*Al modo de Juan Rulfo*» y «Escrito
   por Claude». Solo valen en la cabecera del pegado y en un renglón
   corto; si se colara una frase de la prosa, la ventana de repaso lo
   enseña ANTES de guardar, que es la red que sostiene esta generosidad. */
const VOZ_SUELTAS = [
  [/^(?:al modo de|a la manera de|al estilo de|en la voz de|imitando a)\s+(.{2,70})$/i, 'voz'],
  [/^(?:escrito|redactado|generado)\s+(?:por|con)\s+(.{2,70})$/i, 'maquina'],
];

/* ¿Es esta línea una etiqueta que se entiende? Devuelve el campo o ''. */
function vozEsEtiqueta(l) {
  const desnuda = vozDesnuda(l);
  const clave = vozClaveEtiqueta(desnuda);
  if (clave && VOZ_ETIQUETAS[clave]) return VOZ_ETIQUETAS[clave];
  for (const [re, campo] of VOZ_SUELTAS) if (re.test(desnuda)) return campo;
  return '';
}

/* El valor de una etiqueta, sin el adorno: a una máquina se le escapa
   «**Voz:** Rulfo» y con los asteriscos dentro la voz del anaquel diría
   «** Rulfo». */
function vozValorEtiqueta(desnuda) {
  return desnuda.slice(desnuda.indexOf(':') + 1).trim()
    .replace(/^[*_]{1,3}\s*/, '').replace(/\s*[*_]{1,3}$/, '')
    .replace(/^[«"'“]|[»"'”]$/g, '').trim();
}

/* ⚠️ ¿ESTOS RENGLONES SON VERSOS? Tres o más seguidos, todos cortos y
   cortos de media. Es la única heurística de este archivo que se
   equivoca hacia «título» sin partir nada: un párrafo de prosa con
   renglones cortos sale con sus saltos, feo pero entero, y se arregla
   desde ✏️. Lo contrario —juntar un poema— lo destruye sin avisar y sin
   vuelta atrás, porque el texto crudo no se guarda. Por eso el umbral
   es el que es: la prosa envuelta a mano viene a 70-80 caracteres. */
function vozParecenVersos(lineas) {
  if (!lineas || lineas.length < 3) return false;
  let total = 0, conPunto = 0;
  for (const l of lineas) {
    if (l.length > 60) return false;
    total += l.length;
    if (/[.!?…]["»”']?$/.test(l)) conPunto++;
  }
  const media = total / lineas.length;
  /* Renglones que son FRASES —casi todos acaban en punto y no son
     brevísimos— son prosa escrita a un renglón por frase, no versos. Un
     poema de frases cortísimas («Llueve. / La casa calla.») se queda
     como verso por lo corto. */
  if (conPunto >= lineas.length * 2 / 3 && media > 30) return false;
  return media <= 48;
}

/* Del texto de una etiqueta «Género:» al identificador del género. Lo
   que no se reconoce cae en «texto», nunca en «cuento»: un ensayo
   archivado como cuento se descubre a los seis meses. */
function vozGeneroDePalabra(s) {
  const t = vozSinTildes(s).toLowerCase();
  if (!t.trim()) return '';
  if (/cuento|relato|fabula|leyenda|microrrelato|historia/.test(t)) return 'cuento';
  if (/ensayo|reflexion/.test(t)) return 'ensayo';
  if (/poema|poes|verso|soneto|haiku|romance/.test(t)) return 'poema';
  if (/cronica|reportaje/.test(t)) return 'cronica';
  if (/carta|epistola|correo|misiva/.test(t)) return 'carta';
  if (/discurso|sermon|arenga|monologo|alocucion/.test(t)) return 'discurso';
  if (/articulo|columna|editorial|prensa/.test(t)) return 'articulo';
  if (/novela|nouvelle/.test(t)) return 'novela';
  return 'texto';
}

/* La lista de un ítem: «- algo», «* algo», «• algo», «1. algo», «1) algo».
   Devuelve {t, n} o null. ⚠️ Un guion delante de un diálogo («- ¿Y si
   se apaga?») no es una viñeta: hay quien escribe la raya con un guion
   corto, y convertir a los dos que hablan en una lista de la compra es
   el fallo que más se nota leyendo. */
function vozItemLista(l) {
  const m = l.match(/^([-*•·]|\d{1,3}[.)])\s+(\S.*)$/);
  if (!m) return null;
  const resto = m[2].trim();
  if (m[1] === '-' || m[1] === '*') {
    if (/^[¿¡«“"']/.test(resto)) return null;
    if (/[—–]/.test(resto)) return null;
    if (/\s-\s?[a-záéíóúñ]/.test(resto)) return null;
  }
  const n = /^\d/.test(m[1]) ? parseInt(m[1], 10) : null;
  return { t: resto, n: n };
}

function vozLeer(texto, opciones) {
  const op = opciones || {};
  const versos = op.versos === 'si' ? 'si' : 'auto';
  const out = { titulo: '', voz: '', maquina: '', genero: '', encargo: '', nota: '',
                capitulos: [], avisos: [],
                cuenta: { citas: 0, versos: 0, listas: 0, subt: 0 } };
  const lineas = String(texto || '').replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ').split('\n');

  /* Primera pasada: qué nivel de almohadilla es el de capítulo. El
     primer «#» de nivel 1, si no hay nada antes que etiquetas, es el
     título y no cuenta. De lo que queda, el nivel más alto (menos
     almohadillas) es capítulo y lo más hondo es subtítulo. */
  let primerAlm = -1, tituloEnAlm = false, nivelCap = 7, primeraLinea = -1, hayCapPelados = false;
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i].trim();
    if (!l) continue;
    if (primeraLinea < 0) primeraLinea = i;
    const m = l.match(/^(#{1,6})\s+\S/);
    if (!m) {
      /* ¿El texto trae sus capítulos PELADOS («Capítulo 1: …», «II»)?
         Entonces un «###» suelto es un subtítulo, no un capítulo más. */
      if (!hayCapPelados) {
        const solaI = (i === 0 || !lineas[i - 1].trim()) && (i === lineas.length - 1 || !(lineas[i + 1] || '').trim());
        const k = vozCabeceraPelada(l, solaI, false);
        if (k === 'cap:pal' || k === 'cap:num') hayCapPelados = true;
      }
      continue;
    }
    if (primerAlm < 0) {
      primerAlm = i;
      let soloEtiquetas = m[1].length === 1;
      for (let j = 0; j < i && soloEtiquetas; j++) {
        const lj = lineas[j].trim();
        if (lj && !vozEsEtiqueta(lj) && !vozEsSeparador(lj)) soloEtiquetas = false;
      }
      tituloEnAlm = soloEtiquetas;
      if (tituloEnAlm) continue;
    }
    nivelCap = Math.min(nivelCap, m[1].length);
  }
  /* Un «#» o «##» es capítulo siempre; un «###» o más hondo solo si el
     texto no trae capítulos de otra forma. Y `conAlmohadillas` dice si
     los capítulos vienen con almohadilla: entonces una negrita o unas
     mayúsculas sueltas son subtítulos. */
  const esCapAlm = (nivel) => nivel <= nivelCap && (nivel <= 2 || !hayCapPelados);
  const conAlmohadillas = nivelCap <= 2 || (nivelCap < 7 && !hayCapPelados);

  let cap = null, buf = [], bufCita = [], frente = true;
  let enCerca = false, bufCerca = [];

  const hayContenido = () => !!(cap && cap.p.length);
  const asegura = () => { if (!cap) cap = { t: '', p: [] }; };

  const cierraCita = () => {
    if (!bufCita.length) return;
    asegura();
    /* Cada estrofa de la cita decide por sí misma si guarda sus saltos:
       un epígrafe en verso los necesita, un párrafo citado no. */
    const estrofas = [];
    let e = [];
    bufCita.forEach(l => { if (l === '') { if (e.length) estrofas.push(e); e = []; } else e.push(l); });
    if (e.length) estrofas.push(e);
    /* Y la firma de un epígrafe («— dicho de la región») va en su
       propio renglón aunque la cita de arriba sea larga. */
    const junta = es => {
      if (es.length >= 2 && es.every(x => x.length <= 60)) return es.join('\n');
      let t = '';
      es.forEach((x, i) => { t += (i ? (/^[—–-]\s?\S/.test(x) ? '\n' : ' ') : '') + x; });
      return t;
    };
    const t = estrofas.map(junta).join('\n\n').trim();
    if (t) { cap.p.push({ k: 'cita', t: t }); out.cuenta.citas++; }
    bufCita = [];
    frente = false;
  };

  const cierra = () => {
    cierraCita();
    if (!buf.length) return;
    asegura();
    const modo = (versos === 'si' || out.genero === 'poema') ? 'si' : 'auto';
    const esVerso = (modo === 'si' && buf.length >= 2) || (modo === 'auto' && vozParecenVersos(buf));
    if (esVerso) {
      cap.p.push({ k: 'verso', t: buf.join('\n') });
      out.cuenta.versos++;
    } else {
      cap.p.push({ k: 'p', t: buf.join(' ').replace(/\s+/g, ' ').trim() });
    }
    buf = [];
    frente = false; // la cabecera del pegado termina en la primera prosa
  };
  const abreCap = (t) => {
    cierra();
    if (cap) out.capitulos.push(cap);
    cap = { t: String(t || '').trim(), p: [] };
  };
  const marca = (p) => { cierra(); asegura(); cap.p.push(p); frente = false; };

  for (let i = 0; i < lineas.length; i++) {
    const cruda = lineas[i];
    const l = cruda.trim();
    const sola = (i === 0 || !lineas[i - 1].trim()) &&
                 (i === lineas.length - 1 || !(lineas[i + 1] || '').trim());

    /* Un bloque de código (```) se guarda tal cual, con sus renglones:
       en un texto de encargo es casi siempre un poema o una tabla que
       la máquina puso entre cercas para que no se le moviera. */
    if (/^```/.test(l)) {
      if (enCerca) { if (bufCerca.length) marca({ k: 'verso', t: bufCerca.join('\n') }); bufCerca = []; enCerca = false; }
      else { cierra(); enCerca = true; }
      continue;
    }
    if (enCerca) { bufCerca.push(cruda.replace(/\s+$/, '')); continue; }

    if (!l) { cierra(); continue; }

    if (vozEsSeparador(l)) {
      /* Una raya ANTES de cualquier contenido es la cerca de una
         cabecera («---» arriba y abajo de las etiquetas, como escriben
         algunas máquinas), no un salto de escena. */
      if (frente && !hayContenido() && !out.capitulos.length) continue;
      marca({ k: 'sep' });
      continue;
    }

    /* 1. Las almohadillas son inequívocas: no hay forma de que una
          etiqueta ni una frase empiecen por «# ». */
    const alm = l.match(/^(#{1,6})\s+(.+)$/);
    if (alm) {
      const t = vozDesnuda(alm[2]);
      if (i === primerAlm && tituloEnAlm) { if (!out.titulo) out.titulo = t; continue; }
      if (esCapAlm(alm[1].length)) abreCap(t);
      else { marca({ k: 'h3', t: t }); out.cuenta.subt++; }
      continue;
    }

    /* 2. Las citas, con su «>» delante. Se juntan las seguidas, y una
          línea con solo «>» separa estrofas dentro de la misma cita. */
    const cita = l.match(/^>\s?(.*)$/);
    if (cita) {
      if (buf.length) cierra();
      bufCita.push(cita[1].trim());
      continue;
    }
    if (bufCita.length) cierraCita();

    /* 3. ⚠️ LAS ETIQUETAS SE MIRAN ANTES QUE LAS CABECERAS PELADAS.
          Al revés, «Nota: se escribió de un tirón» —que es como se
          escribe sin acordarse de nada— caería en la rama de las
          mayúsculas o de la palabra de capítulo y abriría un capítulo
          fantasma. Misma lección que las directivas de El Rodaje. */
    if (frente) {
      const desnuda = vozDesnuda(l);
      const clave = vozClaveEtiqueta(desnuda);
      const campo = clave && VOZ_ETIQUETAS[clave];
      if (campo) {
        const valor = vozValorEtiqueta(desnuda);
        if (valor && !out[campo]) out[campo] = campo === 'genero' ? vozGeneroDePalabra(valor) : valor;
        continue;
      }
      let suelta = false;
      for (const [re, c] of VOZ_SUELTAS) {
        const m = desnuda.match(re);
        if (m) {
          if (!out[c]) out[c] = m[1].trim().replace(/[.,;]$/, '');
          suelta = true; break;
        }
      }
      if (suelta) continue;

      /* La primera línea del pegado, sin adorno ninguno, es el título
         si es corta, no acaba en punto y DEBAJO vienen etiquetas: es
         como una máquina encabeza cuando no usa almohadillas. Sin la
         etiqueta debajo que lo corrobore, es prosa. */
      if (i === primeraLinea && !out.titulo && l.length <= 90 && vozSinPuntoFinal(desnuda) &&
          !vozItemLista(l) && !/^[—–-]\s/.test(l)) {
        let j = i + 1;
        while (j < lineas.length && !lineas[j].trim()) j++;
        if (j < lineas.length && vozEsEtiqueta(lineas[j].trim())) { out.titulo = desnuda; continue; }
      }

      /* ⚠️ Y LO QUE INTENTABA SER UNA ETIQUETA Y NO SE ENTENDIÓ SE
         NOMBRA, con su renglón y sin moverlo de sitio. Se queda en la
         prosa —que es lo correcto— pero callarse se ve desde fuera
         igual que un rechazo. Solo se marca lo que de verdad lo
         intentaba: un rótulo en mayúsculas con dos puntos, o una o dos
         palabras con dos puntos ENTRE otras etiquetas que sí se
         entendieron («Autor: …» debajo de «Voz: …»). Si no, «Su
         mandamiento fue claro: no mires atrás» saldría marcado y el
         aviso sería ruido. */
      if (/^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ ]{1,30}:/.test(desnuda)) {
        out.avisos.push({ linea: i + 1, txt: desnuda.slice(0, 60) });
      } else if (/^[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÜÑáéíóúüñ]*( [\wÁÉÍÓÚÜÑáéíóúüñ]+)?:\s*\S/.test(desnuda) && l.length <= 80) {
        const vecino = (k) => { const v = lineas[k]; return v != null && !!vozEsEtiqueta(v.trim()); };
        if (vecino(i - 1) || vecino(i + 1)) out.avisos.push({ linea: i + 1, txt: desnuda.slice(0, 60) });
      }
    }

    /* 4. Las listas. Un ítem por bloque; varios seguidos se ven como
          lista en la sala. Y «1. El pozo» a solas no es una lista de un
          ítem: es un capítulo numerado, y eso lo decide la cabecera. */
    const item = vozItemLista(l);
    if (item && !(item.n != null && sola && item.t.length <= 60 && vozSinPuntoFinal(item.t))) {
      marca({ k: 'li', t: item.t, n: item.n });
      out.cuenta.listas++;
      continue;
    }

    /* 5. «FIN» a solas es la marca del final, no un capítulo llamado
          «FIN» con cero párrafos dentro. */
    if (sola && VOZ_FIN.test(l) && hayContenido()) { marca({ k: 'fin' }); continue; }

    /* 6. Cabecera pelada, solo si se corrobora. */
    const cab = vozCabeceraPelada(l, sola, conAlmohadillas);
    if (cab) {
      const nivel = cab.split(':')[0], clase = cab.split(':')[1];
      const t = vozDesnuda(l);
      /* La primera línea de rótulo, sin «#» y sin nada delante, es el
         título del texto — salvo que más abajo venga otra igual, porque
         entonces es el primer capítulo de una serie. */
      const puedeSerTitulo = !out.titulo && !out.capitulos.length && !hayContenido() &&
                             (clase === 'mayus' || clase === 'negrita');
      if (puedeSerTitulo && !vozHaySiguienteIgual(lineas, i, clase, conAlmohadillas)) {
        out.titulo = t;
      } else if (nivel === 'sub' && (cap || out.capitulos.length)) {
        marca({ k: 'h3', t: t }); out.cuenta.subt++;
      } else {
        abreCap(t);
      }
      continue;
    }

    /* 7. Prosa. ⚠️ Y una línea que empieza por raya ABRE PÁRRAFO aunque
          no venga un blanco delante: en español el diálogo se escribe
          así, renglón tras renglón y sin blancos en medio, y pegar dos
          rayas en un párrafo mete a dos personas hablando en la misma
          línea. Es el fallo que más se nota leyendo y el más fácil de
          producir juntando líneas a ciegas. Vale también para el guion
          corto («- ¿Y ahora?»), que es como lo escribe quien no tiene
          la raya en el teclado. */
    if (/^([—–]\s?|-\s)/.test(l) && buf.length) cierra();
    buf.push(l);
  }
  if (enCerca && bufCerca.length) marca({ k: 'verso', t: bufCerca.join('\n') });
  cierra();
  if (cap) out.capitulos.push(cap);

  out.capitulos = out.capitulos.filter(c => (c.p || []).length || c.t);
  if (!out.capitulos.length) out.capitulos = [{ t: '', p: [] }];

  /* El EPÍGRAFE: si antes del primer capítulo con título solo hay una
     cita (o una cita y un salto), no es un capítulo sin nombre: es el
     epígrafe del libro, y en un libro va en su propia página entre la
     portada y el capítulo uno. Se cuelga del primer capítulo. Lo que
     venga con prosa se queda como capítulo sin título, que la sala
     llama «Preliminares». */
  if (out.capitulos.length > 1 && !out.capitulos[0].t && out.capitulos[1].t &&
      out.capitulos[0].p.length && out.capitulos[0].p.length <= 3 &&
      out.capitulos[0].p.every(b => b.k === 'cita' || b.k === 'sep' || b.k === 'verso') &&
      out.capitulos[0].p.some(b => b.k === 'cita')) {
    out.capitulos[1].epi = out.capitulos[0].p.filter(b => b.k !== 'sep');
    out.capitulos.shift();
  }

  /* Sin título y con UN solo capítulo que sí lo trae, ese es el título
     del texto (era «## La casa» encabezando todo), y se le quita al
     capítulo para que no salga dos veces. Con varios capítulos no se
     adivina: la hoja pedirá el título, que es mejor que ponerle al
     libro el nombre de su primer capítulo sin decirlo. Y un mero
     «Capítulo 1» o un número, como título de libro, no dice nada. */
  if (!out.titulo && out.capitulos.length === 1) {
    const t = out.capitulos[0].t || '';
    if (t && !VOZ_PAL_CAP.test(t) && !VOZ_ROMANO.test(t) && !VOZ_NUMERO.test(t) &&
        !VOZ_ROMANO_TIT.test(t) && !VOZ_NUMERO_TIT.test(t)) {
      out.titulo = t;
      out.capitulos[0].t = '';
    }
  }

  /* El género, si el texto no lo dijo: un texto que es casi todo verso
     es un poema. Lo demás lo elige quien pega, y por defecto «cuento». */
  if (!out.genero) {
    let prosa = 0, verso = 0;
    out.capitulos.forEach(c => c.p.forEach(b => { if (b.k === 'p') prosa++; else if (b.k === 'verso') verso++; }));
    if (verso >= 2 && verso >= 0.6 * (prosa + verso)) out.genero = 'poema';
  }
  return out;
}

/* Cuántos bloques de cada clase trae un texto guardado, para la ficha
   y para la hoja de corregir. */
function vozCuentaBloques(caps) {
  const n = { p: 0, cita: 0, verso: 0, li: 0, h3: 0, sep: 0 };
  (caps || []).forEach(c => (c.p || []).concat(c.epi || []).forEach(b => { if (n[b.k] != null) n[b.k]++; }));
  return n;
}

/* ══════════════════════════════════════════════════════════════════
   LA NUBE
   ══════════════════════════════════════════════════════════════════
   El cliente es el ÚNICO de la casa, el de `js/auth.js`. Aquí no se
   crea otro: la razón, larga y cara, está escrita en ese archivo.

   Y la herramienta FUNCIONA ENTERA sin haber corrido el SQL, con la
   copia del aparato, y lo DICE a la vista («📴 Solo en este aparato»).
   Es la regla de la repisa de enlaces: el SQL lo pega el autor a mano
   desde una tableta y eso puede tardar una semana; fingir que ya viaja
   sería peor que decir que no. */
function vozSb() {
  if (typeof _sb !== 'undefined' && _sb) return _sb;
  return window.faroSb || null;
}

/* ⚠️ Y SE LE PONE RELOJ A LA PETICIÓN, PORQUE EL CLIENTE NO LO TRAE.
   Medido con la sonda el 10 de septiembre de 2026: cuando la petición
   NO VUELVE —no cuando falla, cuando no vuelve— el cliente de Supabase
   no devuelve `{data:null,error}` ni lanza: se queda pendiente para
   siempre. O sea que la rama que existe para decir «no hay señal» no
   llegaría a correr nunca, y el anaquel se quedaría en «Mirando la
   nube…» hasta que alguien cerrara la aplicación. Es el mismo fallo que
   la lección 14 de El Rodaje visto por el otro lado: allí el error se
   miraba mal, aquí el error no llega.

   Ocho segundos: en una tableta con mala señal es de sobra para
   distinguir «va lento» de «no hay». Y el reloj NO cancela la petición;
   si llega después, la próxima vez que se abra la herramienta se usa. */
const VOZ_ESPERA_MAX = 8000;

function vozConReloj(peticion) {
  return Promise.race([
    peticion,
    new Promise(res => setTimeout(() => res({
      data: null, error: { code: 'FARO_RELOJ', message: 'la petición no volvió' },
    }), VOZ_ESPERA_MAX)),
  ]);
}

/* Fusiona lo de la nube con lo del aparato. Gana la versión más
   reciente por el reloj DEL APARATO que escribió (columna `actualizado`),
   no por `actualizado_at`: quien escribe puede estar sin señal y subirlo
   después, y entonces la hora del servidor diría que lo viejo es lo
   nuevo. Misma razón que en la repisa de enlaces. */
function vozFusiona(local, nube) {
  const m = new Map();
  (local || []).forEach(c => { if (c && c.cid) m.set(c.cid, c); });
  (nube || []).forEach(c => {
    if (!c || !c.cid) return;
    const mio = m.get(c.cid);
    if (!mio || (c.actualizado || 0) >= (mio.actualizado || 0)) m.set(c.cid, c);
  });
  return [...m.values()]
    .filter(c => !c.borrado)
    .sort((a, b) => (b.actualizado || 0) - (a.actualizado || 0));
}

const VOZ_COLUMNAS = 'cid,titulo,voz,maquina,encargo,nota,capitulos,palabras,borrado,puesto_por,creado_at,actualizado';

async function vozBajar() {
  const sb = vozSb();
  if (!sb) { _vozEstadoNube = 'sin-sesion'; return null; }
  const pide = (cols) => vozConReloj(sb.from(VOZ_TABLE)
    .select(cols).order('actualizado', { ascending: false }).limit(400));

  let { data, error } = await pide(VOZ_COLUMNAS + ',genero');

  /* ⚠️ LA BASE PUEDE IR UNA VERSIÓN ATRÁS: con la tabla creada el día
     del estreno y sin volver a correr el SQL, la columna `genero` no
     existe y PostgREST rebota la consulta entera (42703). Eso NO es
     «sin señal» ni «falta el SQL»: la tabla está y los textos también.
     Se vuelve a pedir sin la columna, se trabaja con el género solo en
     el aparato y la barra dice exactamente qué hay que volver a correr. */
  if (error && (error.code === '42703' || /column .* does not exist/i.test(error.message || ''))) {
    _vozNubeVieja = true;
    ({ data, error } = await pide(VOZ_COLUMNAS));
  }

  if (error) {
    /* ⚠️ UN CORTE DE RED NO ES UNA TABLA QUE FALTA. El cliente de
       Supabase no lanza cuando la petición se cae: devuelve
       {data:null,error}. Sin mirar el código, un corte de señal
       mandaría al autor a pegar cuatrocientas líneas de SQL en una base
       que ya las tiene. 42P01 es «la relación no existe»; lo demás es
       la señal. Es la lección 14 de El Rodaje. */
    if (error.code === '42P01' || /relation .* does not exist/i.test(error.message || '')) {
      _vozHayTabla = false; _vozEstadoNube = 'sin-tabla';
    } else {
      _vozEstadoNube = 'sin-senal';
    }
    return null;
  }
  _vozHayTabla = true;
  _vozEstadoNube = _vozNubeVieja ? 'vieja' : 'puesta';
  return data || [];
}

/* ⚠️ QUIÉN SOY, Y POR QUÉ HAY QUE MANDARLO A MANO.
   `puesto_por` es `not null` y la política de escritura exige que sea el
   identificador de quien entró (`puesto_por = auth.uid()`). O sea que una
   fila sin ese campo NO ENTRA: rebota con «null value in column
   puesto_por» o con la seguridad por fila, según cuál muerda primero.

   El 10 de septiembre de 2026 se subió la herramienta sin esta línea y
   el fallo se vio así: el cuento se guardaba, se veía en el aparato
   donde se pegó, y no aparecía nunca en el otro. Desde fuera parece un
   problema de señal, y no lo es: la escritura llegaba y la base la
   rechazaba.

   Se escapó porque las dos mitades se probaron por separado —la prueba
   del SQL escribía `puesto_por` a mano y la base de mentira de la sonda
   aceptaba cualquier escritura sin mirar—, y la costura entre las dos no
   la probó nadie. Ahora la sonda la mira (comprobación 15). */
let _vozYo = null;

async function vozYo() {
  if (_vozYo) return _vozYo;
  const sb = vozSb();
  if (!sb || !sb.auth) return null;
  try {
    const { data } = await sb.auth.getSession();
    _vozYo = (data && data.session && data.session.user && data.session.user.id) || null;
  } catch (e) { _vozYo = null; }
  return _vozYo;
}

async function vozSubir(c) {
  const sb = vozSb();
  if (!sb || !_vozHayTabla) return { ok: false, motivo: 'sin-nube' };
  const yo = await vozYo();
  if (!yo) return { ok: false, motivo: 'sin-sesion' };

  const fila = {
    cid: c.cid, titulo: c.titulo, voz: c.voz, maquina: c.maquina,
    encargo: c.encargo || null, nota: c.nota || null,
    capitulos: c.capitulos || [], palabras: c.palabras || 0,
    borrado: !!c.borrado, actualizado: c.actualizado || Date.now(),
    puesto_por: yo,
  };
  if (!_vozNubeVieja) fila.genero = c.genero || 'cuento';
  const { error } = await vozConReloj(sb.from(VOZ_TABLE).upsert(fila, { onConflict: 'cid' }));
  if (error) {
    /* Se distinguen los motivos porque cada uno se arregla de manera
       distinta, y decir el que no es manda a buscar donde no está. */
    if (error.code === 'FARO_RELOJ') return { ok: false, motivo: 'sin-senal' };
    if (error.code === '42501' || error.code === '23502' ||
        /row-level security|violates check|no cambia de dueño/i.test(error.message || '')) {
      return { ok: false, motivo: 'ajeno', detalle: error.message || '' };
    }
    return { ok: false, motivo: 'error', detalle: error.message || '' };
  }
  return { ok: true };
}

/* ⚠️ LO QUE NO SUBIÓ SE REINTENTA DE VERDAD, y esto no es un adorno:
   antes la pantalla decía «subirá cuando vuelva la señal» y NADA lo
   volvía a intentar nunca. Prometer un reintento que no existe es peor
   que decir que falló, porque el que lo lee deja de vigilarlo.
   Corre al abrir la herramienta, después de saber qué hay en la nube, y
   solo con lo PROPIO: una fila ajena no se puede escribir —lo impide la
   seguridad por fila— y reintentarla sería insistir cada vez para nada. */
async function vozSubirPendientes(nube) {
  const yo = await vozYo();
  if (!yo || !_vozHayTabla) return 0;
  const enNube = new Map((nube || []).map(c => [c.cid, c.actualizado || 0]));
  const pendientes = vozLeeLocal().filter(c =>
    c && c.cid && (!c.puesto_por || c.puesto_por === yo) &&
    (!enNube.has(c.cid) || enNube.get(c.cid) < (c.actualizado || 0)));
  if (!pendientes.length) return 0;

  let subidos = 0;
  for (const c of pendientes) {
    const r = await vozSubir(c);
    if (!r.ok) continue;
    subidos++;
    /* Se apunta el dueño en la copia del aparato para no volver a
       mirarla en el próximo arranque. */
    c.puesto_por = yo;
    const todos = vozLeeLocal().map(x => (x.cid === c.cid ? c : x));
    try { localStorage.setItem(VOZ_LOCAL, JSON.stringify(todos)); } catch (e) {}
    const enMemoria = _vozCuentos.find(x => x.cid === c.cid);
    if (enMemoria) enMemoria.puesto_por = yo;
  }
  return subidos;
}

function vozRotuloNube() {
  if (_vozEstadoNube === 'puesta')    return { ic: '☁️', t: 'Los textos viajan a todos los aparatos de la casa', cls: 'voz-nube-ok' };
  if (_vozEstadoNube === 'vieja')     return { ic: '☁️', t: 'Viajan, pero la base va vieja: vuelve a correr voz_prestada.sql para que el género también viaje', cls: 'voz-nube-no' };
  if (_vozEstadoNube === 'sin-tabla') return { ic: '📴', t: 'Solo en este aparato: falta correr voz_prestada.sql', cls: 'voz-nube-no' };
  if (_vozEstadoNube === 'sin-senal') return { ic: '📡', t: 'Sin señal: se guarda aquí y sube cuando vuelva', cls: 'voz-nube-no' };
  if (_vozEstadoNube === 'sin-sesion') return { ic: '📴', t: 'Solo en este aparato: entra en F.A.R.O para que viaje', cls: 'voz-nube-no' };
  return { ic: '⏳', t: 'Mirando la nube…', cls: 'voz-nube-no' };
}

async function initVozPrestada() {
  vozLeeAjustes();
  _vozEstadoNube = 'mirando';
  if (!_vozCuentos.length) _vozCuentos = vozFusiona(vozLeeLocal(), []);
  vozRender();                       // se pinta YA con lo del aparato
  const nube = await vozBajar();     // y se corrige cuando llegue
  /* ⚠️ Lo que hay en memoria NO se tira hasta saber que llegó lo nuevo.
     Con un corte de señal, tirarlo dejaría el anaquel en cero y la
     pantalla diría «todavía no hay textos» con un botón que invita a
     PEGAR: o sea que el camino natural después de una mala señal sería
     pegar encima los textos que ya estaban. Lección 14 de El Rodaje. */
  if (nube) {
    _vozCuentos = vozFusiona(vozLeeLocal(), nube);
    vozGuardaLocal();
    vozRender();
    /* Y lo que se guardó sin señal sube AHORA. Ver vozSubirPendientes. */
    const subidos = await vozSubirPendientes(nube);
    if (subidos) {
      vozAviso('☁️ ' + subidos + (subidos === 1 ? ' texto que faltaba ya subió' : ' textos que faltaban ya subieron'));
    }
  }
  vozRender();
}

/* ══════════════════════════════════════════════════════════════════
   EL ANAQUEL
   ══════════════════════════════════════════════════════════════════ */

/* El lomo del libro se pinta con un color sacado de la VOZ, no del
   título ni al azar: así todos los textos «al modo de» el mismo
   escritor salen del mismo color y el anaquel se lee de un vistazo
   como se lee una estantería de verdad. Y es estable entre aparatos
   porque sale de las letras, no de un número guardado. */
function vozColor(voz) {
  const s = vozSinTildes(voz || '').toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

function vozVoces() {
  const m = new Map();
  _vozCuentos.forEach(c => {
    const v = (c.voz || '').trim();
    if (!v) return;
    m.set(v, (m.get(v) || 0) + 1);
  });
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function vozGenerosUsados() {
  const m = new Map();
  _vozCuentos.forEach(c => {
    const g = vozGenero(c.genero).id;
    m.set(g, (m.get(g) || 0) + 1);
  });
  return VOZ_GENEROS.filter(g => m.has(g.id)).map(g => [g, m.get(g.id)]);
}

function vozVisibles() {
  const q = vozSinTildes(_vozBusca).toLowerCase().trim();
  return _vozCuentos.filter(c => {
    if (_vozFiltroVoz && (c.voz || '') !== _vozFiltroVoz) return false;
    if (_vozFiltroGen && vozGenero(c.genero).id !== _vozFiltroGen) return false;
    if (!q) return true;
    const heno = vozSinTildes([c.titulo, c.voz, c.maquina, c.encargo, c.nota, vozGenero(c.genero).t]
      .filter(Boolean).join(' ')).toLowerCase();
    return heno.includes(q);
  });
}

/* Cuántas palabras van leídas hasta una posición: los capítulos de
   antes enteros, los bloques de antes del párrafo apuntado, y la parte
   del párrafo apuntado que dice la fracción. Es lo que mueve la barra
   del anaquel y la de la sala, y el «quedan ≈ N min». */
function vozLeido(c, pos) {
  if (!pos) return 0;
  const caps = c.capitulos || [];
  let n = 0;
  for (let i = 0; i < (pos.cap || 0) && i < caps.length; i++) {
    (caps[i].p || []).forEach(b => { n += vozPalabrasDe(b.t); });
    (caps[i].epi || []).forEach(b => { n += vozPalabrasDe(b.t); });
  }
  const cap = caps[pos.cap || 0];
  if (cap) {
    (cap.epi || []).forEach(b => { n += vozPalabrasDe(b.t); });
    const ancla = typeof pos.ancla === 'number' ? pos.ancla : 0;
    (cap.p || []).forEach((b, i) => {
      if (i < ancla) n += vozPalabrasDe(b.t);
      else if (i === ancla) n += Math.round(vozPalabrasDe(b.t) * Math.min(1, Math.max(0, pos.sub || 0)));
    });
  }
  return n;
}

/* Cuánto se lleva leído, para la barra de la ficha. Sale de la posición
   guardada en ESTE aparato, que es de donde tiene que salir: ver la
   nota de las cuatro llaves, arriba. */
function vozAvance(c) {
  const pos = vozLeePos(c.cid);
  if (!pos) return 0;
  if (pos.fin) return 100;
  /* Se cuenta sobre las palabras DE VERDAD del cuerpo, no sobre la
     columna `palabras`: esa la escribió el aparato que guardó, y si
     alguna vez no cuadra (un texto corregido a mano en la base, un
     aparato viejo) el avance saldría del 107 % y el texto a medias se
     archivaría como leído. */
  const total = vozPalabras(c.capitulos) || c.palabras || 1;
  return Math.max(0, Math.min(99, Math.round((vozLeido(c, pos) / total) * 100)));
}

/* El texto que se estaba leyendo hace menos, para la tarjeta de arriba
   del anaquel. Solo cuenta lo empezado y no terminado. */
function vozEnCurso() {
  let mejor = null, cuando = 0;
  _vozCuentos.forEach(c => {
    const pos = vozLeePos(c.cid);
    if (!pos || !pos.cuando) return;
    const av = vozAvance(c);
    if (av <= 0 || av >= 100) return;
    if (pos.cuando > cuando) { cuando = pos.cuando; mejor = c; }
  });
  return mejor;
}

function vozRender() {
  const cont = document.getElementById('voz-lista');
  if (!cont) return;

  /* La barra de estado de la nube. Va SIEMPRE a la vista, también
     cuando todo va bien: si solo apareciera cuando algo falla, nadie
     sabría nunca si sus textos están de verdad en los dos aparatos. */
  const est = document.getElementById('voz-nube');
  if (est) {
    const r = vozRotuloNube();
    est.className = 'voz-nube ' + r.cls;
    est.textContent = '';
    est.appendChild(vozNodo('span', 'voz-nube-ic', r.ic));
    est.appendChild(vozNodo('span', null, r.t));
  }

  /* «Sigue leyendo»: lo último que se dejó a medias, arriba y con un
     botón. Es lo primero que hace un lector de libros al abrirse, y lo
     que evita buscar entre treinta fichas el que se estaba leyendo. */
  const hero = document.getElementById('voz-sigue');
  if (hero) {
    hero.textContent = '';
    const c = (_vozBusca.trim() || _vozFiltroVoz || _vozFiltroGen) ? null : vozEnCurso();
    hero.hidden = !c;
    if (c) hero.appendChild(vozSigueLeyendo(c));
  }

  /* Los chips: género y voz, sacados de los textos y nunca de una lista
     escrita aquí. Cada fila se esconde cuando no separa nada. */
  const gchips = document.getElementById('voz-chips-gen');
  if (gchips) {
    gchips.textContent = '';
    const gens = vozGenerosUsados();
    const pon = (id, txt, n) => {
      const b = vozBoton('voz-chip' + (_vozFiltroGen === id ? ' voz-chip-on' : ''), null, () => {
        _vozFiltroGen = id; vozRender();
        b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      });
      b.appendChild(vozNodo('span', null, txt));
      if (n != null) b.appendChild(vozNodo('span', 'voz-chip-n', String(n)));
      gchips.appendChild(b);
    };
    pon('', 'Todo', _vozCuentos.length);
    gens.forEach(([g, n]) => pon(g.id, g.ic + ' ' + g.t, n));
    gchips.hidden = gens.length < 2;
  }
  const chips = document.getElementById('voz-chips');
  if (chips) {
    chips.textContent = '';
    const voces = vozVoces();
    const pon = (id, txt, n) => {
      const b = vozBoton('voz-chip' + (_vozFiltroVoz === id ? ' voz-chip-on' : ''), null, () => {
        _vozFiltroVoz = id; vozRender();
        b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      });
      b.appendChild(vozNodo('span', null, txt));
      if (n != null) b.appendChild(vozNodo('span', 'voz-chip-n', String(n)));
      chips.appendChild(b);
    };
    pon('', 'Todas las voces', _vozCuentos.length);
    voces.forEach(([v, n]) => pon(v, '🎭 ' + v, n));
    chips.hidden = voces.length < 2;
  }

  const lista = vozVisibles();
  cont.textContent = '';

  if (!lista.length) {
    cont.appendChild(vozVacio());
    return;
  }

  lista.forEach(c => cont.appendChild(vozFicha(c)));
}

function vozVacio() {
  const caja = vozNodo('div', 'msug-vacio');
  caja.appendChild(vozNodo('div', 'msug-vacio-ic', '📖'));
  if (_vozCuentos.length) {
    caja.appendChild(vozNodo('p', null, 'Ningún texto con ese filtro.'));
    return caja;
  }
  const p1 = vozNodo('p', null);
  p1.appendChild(vozNodo('strong', null, 'El anaquel está vacío.'));
  caja.appendChild(p1);
  caja.appendChild(vozNodo('p', null,
    'Pídele el cuento, el ensayo o el poema a la máquina, cópialo entero y pégalo aquí con el botón «➕ Pegar un texto». ' +
    'Se reparte en capítulos solo y queda listo para leer en páginas, como un libro.'));
  return caja;
}

function vozSigueLeyendo(c) {
  const pos = vozLeePos(c.cid) || {};
  const av = vozAvance(c);
  const card = vozNodo('article', 'voz-sigue');
  card.style.setProperty('--voz-h', String(vozColor(c.voz)));
  card.appendChild(vozNodo('div', 'voz-sigue-rot', '📖 Sigue leyendo'));
  card.appendChild(vozNodo('div', 'voz-sigue-tit', c.titulo || 'Sin título'));
  card.appendChild(vozNodo('div', 'voz-sigue-et',
    vozGenero(c.genero).t + ' · 🎭 al modo de ' + (c.voz || '—') + ' · 🤖 ' + (c.maquina || '—')));
  const barra = vozNodo('div', 'voz-avance');
  const dentro = vozNodo('div', 'voz-avance-in');
  dentro.style.width = av + '%';
  barra.appendChild(dentro);
  card.appendChild(barra);
  const caps = (c.capitulos || []).length;
  const quedan = Math.max(0, (c.palabras || vozPalabras(c.capitulos)) - vozLeido(c, pos));
  const datos = ['Vas por el ' + av + ' %'];
  if (caps > 1) datos.push('cap. ' + ((pos.cap || 0) + 1) + ' de ' + caps);
  datos.push('quedan ≈ ' + vozMinutos(quedan) + ' min');
  if (pos.cuando) datos.push(vozHace(pos.cuando));
  card.appendChild(vozNodo('div', 'voz-sigue-meta', datos.join(' · ')));
  card.appendChild(vozBoton('voz-btn voz-btn-pri voz-sigue-btn', '📖 Continuar', () => vozAbrirLector(c.cid)));
  return card;
}

function vozFicha(c) {
  const h = vozColor(c.voz);
  const g = vozGenero(c.genero);
  const card = vozNodo('article', 'voz-ficha');
  card.style.setProperty('--voz-h', String(h));

  const lomo = vozNodo('div', 'voz-lomo');
  lomo.appendChild(vozNodo('span', 'voz-lomo-ini', (c.titulo || '?').trim().charAt(0).toUpperCase()));
  lomo.appendChild(vozNodo('span', 'voz-lomo-gen', g.ic));
  card.appendChild(lomo);

  const cuerpo = vozNodo('div', 'voz-ficha-cuerpo');
  const tit = vozNodo('h3', 'voz-ficha-tit', c.titulo || 'Sin título');
  cuerpo.appendChild(tit);

  /* ⚠️ LA ETIQUETA. Va aquí, en la portada del anaquel, antes que
     ninguna otra cosa del texto, y con las dos mitades: la voz que se
     imita y la máquina que escribió. Ver la cabecera del archivo. */
  const et = vozNodo('div', 'voz-etiqueta');
  et.appendChild(vozNodo('span', 'voz-et-voz', '🎭 al modo de ' + (c.voz || '—')));
  et.appendChild(vozNodo('span', 'voz-et-maq', '🤖 ' + (c.maquina || '—')));
  cuerpo.appendChild(et);

  const caps = (c.capitulos || []).length;
  const meta = vozNodo('div', 'voz-ficha-meta');
  meta.appendChild(vozNodo('span', 'voz-ficha-gen', g.ic + ' ' + g.t));
  meta.appendChild(vozNodo('span', null, caps > 1 ? caps + ' capítulos' : 'de un tirón'));
  meta.appendChild(vozNodo('span', null, (c.palabras || 0).toLocaleString('es-HN') + ' palabras'));
  meta.appendChild(vozNodo('span', null, '≈ ' + vozMinutos(c.palabras) + ' min'));
  cuerpo.appendChild(meta);

  if (c.encargo) cuerpo.appendChild(vozNodo('p', 'voz-ficha-enc', '« ' + c.encargo + ' »'));

  const av = vozAvance(c);
  if (av > 0) {
    const barra = vozNodo('div', 'voz-avance');
    const dentro = vozNodo('div', 'voz-avance-in');
    dentro.style.width = av + '%';
    barra.appendChild(dentro);
    cuerpo.appendChild(barra);
    cuerpo.appendChild(vozNodo('span', 'voz-avance-txt',
      av >= 100 ? '✓ Leído' : 'Vas por el ' + av + ' %'));
  }

  const pie = vozNodo('div', 'voz-ficha-pie');
  pie.appendChild(vozBoton('voz-btn voz-btn-pri',
    av > 0 && av < 100 ? '📖 Seguir leyendo' : (av >= 100 ? '📖 Releer' : '📖 Leer'),
    () => vozAbrirLector(c.cid)));
  pie.appendChild(vozBoton('voz-btn', '📋', () => vozCopiar(c), 'Copiar el texto con su etiqueta'));
  if (navigator.share) {
    pie.appendChild(vozBoton('voz-btn', '📤', () => vozCompartir(c), 'Compartir el texto con su etiqueta'));
  }

  /* ⚠️ Corregir y retirar SOLO se ofrecen en lo propio. Lo impide de
     verdad la seguridad por fila, no esta línea; pero enseñar un botón
     que la base va a rechazar es prometer algo que no se puede hacer, y
     el que lo toca se queda pensando que la aplicación falló. */
  const mio = !c.puesto_por || !_vozYo || c.puesto_por === _vozYo;
  const edit = vozBoton('voz-btn', '✏️', mio ? () => vozAbrirPegar(c) : null,
    mio ? 'Corregir la ficha' : 'Lo puso otra persona de la casa');
  edit.disabled = !mio;
  pie.appendChild(edit);

  cuerpo.appendChild(pie);
  card.appendChild(cuerpo);
  return card;
}

/* ══════════════════════════════════════════════════════════════════
   LA SALA DE LECTURA
   ══════════════════════════════════════════════════════════════════
   ⚠️ SE PAGINA DE VERDAD, CON COLUMNAS. No es un desplazamiento con
   sombra ni un adorno: es lo que hace un lector de libros y hace falta
   por dos razones concretas.

   La primera: en una tableta, un texto largo que se desplaza pierde el
   sitio cada vez que cambia el alto de la ventana —al salir el teclado,
   al esconderse la barra del navegador, al girar el aparato—, y lo
   pierde sin avisar. Una página es una posición discreta: o estás en la
   7 o estás en la 8.

   La segunda: «te quedan cuatro páginas» es la única cosa que le dice a
   alguien si termina el capítulo antes de dormirse. Una barra de
   desplazamiento de dos milímetros no dice eso.

   Cómo funciona, para quien lo toque: la caja (#voz-hoja) tiene alto
   fijo y el texto de dentro (#voz-texto) lleva columnas del ancho exacto
   de la página, así que el navegador reparte el texto en columnas y se
   avanza moviendo `scrollLeft` de página en página. Es el mismo aparato
   que usan los lectores de epub, y es del navegador: no hay que medir
   renglones ni cortar palabras a mano.

   ⚠️ LA ÚLTIMA PÁGINA NO SE RECORTA, Y ESO COSTÓ VERLO. La primera
   versión ponía los márgenes como `padding` de la caja y dejaba que las
   columnas se salieran de #voz-texto por la derecha. El navegador NO
   cuenta el margen derecho detrás de una columna que se sale, así que el
   desplazamiento máximo se quedaba corto en lo que medía el margen: la
   última página de todos los capítulos salía corrida a la derecha con la
   cola de la página anterior asomando por el borde izquierdo. El número
   de página era correcto y el texto también; solo estaba mal puesto, y
   solo en la última. Ahora la caja es un `flex` con dos hijos: el texto,
   al que se le pone un ANCHO EXPLÍCITO igual a todas sus páginas juntas
   (medidas en una primera pasada), y una «cola» (#voz-cola) del ancho
   del margen. Así el desplazamiento cubre exactamente lo que hay, en
   cualquier navegador, sin depender de cómo cuente cada uno el relleno
   de la derecha. La sonda mide la última página (comprobación 6).

   ⚠️ Y LA POSICIÓN SE GUARDA POR PÁRRAFO, NUNCA POR NÚMERO DE PÁGINA.
   Esta es la regla que no se negocia y la que parece de más. El número
   de páginas depende del tamaño de letra, del ancho de la pantalla y
   de si el aparato está de pie o acostado: guardar «iba por la página
   12» y volver con la letra un punto más grande deja al lector en otra
   frase, casi siempre varias páginas atrás o adelante. Y NO DA NINGÚN
   ERROR: la aplicación abre, la página existe, el texto es del mismo
   cuento. El fallo solo se nota leyendo un párrafo que no era, y para
   entonces ya se perdió el sitio de verdad. Se guarda el ÍNDICE DEL
   PÁRRAFO y una FRACCIÓN de ese párrafo, y la página se vuelve a
   calcular cada vez que se repagina. Es la misma familia de errores que
   el minuto guardado de El Rodaje: un número correcto que deja de serlo
   cuando cambia lo de al lado.

   La fracción hace falta por los ensayos: un párrafo de página y media
   con la letra grande deja páginas enteras SIN ningún párrafo que
   empiece en ellas. Con solo el índice, la posición guardada sería «el
   párrafo siguiente» y al volver se saltaría media página de lectura,
   sin error. La fracción dice en qué parte del párrafo va uno, y con
   ella se vuelve a la misma página aunque el párrafo ahora ocupe tres. */

const VOZ_HUECO = 40;          // el canal entre columnas, en píxeles
const VOZ_ALTO_MARGEN = 16;    // el margen de arriba y de abajo de la hoja
const VOZ_ANCHO_LIBRO = 700;   // en pantalla ancha, una página no pasa de esto
const VOZ_ANCHO_DOBLE = 1180;  // ni el libro abierto a dos páginas de esto
const VOZ_DOS_DESDE = 860;     // en «auto», dos páginas a partir de este ancho

/* ⚠️ EL PÁRRAFO EN QUE VA LA LECTURA SE RECUERDA, NO SE MIDE AL
   REPAGINAR. Y esto no es una optimización: medirlo en el momento de
   repaginar da el párrafo EQUIVOCADO, siempre, porque para entonces la
   caja ya cambió —la letra ya es más grande, la tableta ya giró— y las
   posiciones que se leen son las nuevas mientras el desplazamiento
   todavía es el viejo. O sea que justo la función que existe para no
   perder el sitio sería la que lo pierde. Se apunta al pasar página,
   cuando las dos cosas concuerdan, y se usa lo apuntado. */
let _vozAncla = 0;
let _vozSub = 0;
let _vozRepagTimer = null;
let _vozArrastre = null;
let _vozTragarClic = false;
let _vozM = 24;       // el margen de la izquierda de la hoja, puesto por vozPaginar
let _vozPaso = 0;     // lo que se desplaza por página
let _vozCols = 1;     // columnas por página: 1, o 2 en pantalla ancha
let _vozLuz = null;   // el permiso de «no apagar la pantalla»
let _vozRuedaHasta = 0;
let _vozPanelTab = 'ind';
let _vozBuscaTxt = '';

/* Pinta un texto con sus cursivas y negritas SIN innerHTML: se trocea y
   se van colgando nodos de texto y <em>/<strong> creados a mano. Es la
   única forma de pintar `*así*` sin abrirle a un texto pegado la puerta
   de escribir HTML dentro de F.A.R.O. */
function vozPintaTexto(nodo, t) {
  const s = String(t == null ? '' : t);
  const re = /(\*\*|__)(?=\S)([\s\S]*?\S)\1|(\*|_)(?=\S)([\s\S]*?\S)\3/g;
  let i = 0, m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > i) nodo.appendChild(document.createTextNode(s.slice(i, m.index)));
    const fuerte = !!m[1];
    nodo.appendChild(vozNodo(fuerte ? 'strong' : 'em', null, fuerte ? m[2] : m[4]));
    i = re.lastIndex;
  }
  if (i < s.length) nodo.appendChild(document.createTextNode(s.slice(i)));
}

function vozAbrirLector(cid) {
  const c = _vozCuentos.find(x => x.cid === cid);
  if (!c) return;
  _vozLeyendo = c;
  const sala = document.getElementById('voz-lector');
  if (!sala) return;

  const pos = vozLeePos(cid);
  _vozCapActual = Math.min(Math.max(0, (pos && pos.cap) || 0), (c.capitulos || []).length - 1);
  _vozAncla = (pos && typeof pos.ancla === 'number')
    ? pos.ancla
    : (_vozCapActual === 0 ? -1 : 0);   // −1 es la portada; ver vozPintarCap
  _vozSub = (pos && typeof pos.sub === 'number') ? pos.sub : 0;
  _vozBuscaTxt = '';

  sala.hidden = false;
  document.body.classList.add('voz-sala');
  vozCargarLetras();
  vozAplicaAjustes();
  vozPintarBarraMarcas();
  vozPintarCap(_vozAncla, _vozSub);   // −1 al abrir un texto nuevo: la portada
  vozEngancharSala();
  vozLuz(true);
}

function vozCerrarLector() {
  const sala = document.getElementById('voz-lector');
  if (sala) sala.hidden = true;
  document.body.classList.remove('voz-sala');
  vozCerrarPaneles();
  vozLuz(false);
  vozPantallaCompleta(false);
  _vozLeyendo = null;
  vozRender();   // para que la barra de avance de la ficha se refresque
}

/* ⚠️ LAS LETRAS DE LA SALA SE PIDEN AQUÍ, LA PRIMERA VEZ QUE SE ABRE, Y
   NO CON UN `@import` EN LA HOJA DE ESTILO. Un `@import` es bloqueante:
   la aplicación entera espera a que Google Fonts conteste —o a que la
   petición falle, que con mala señal tarda lo mismo— antes de pintar
   nada, y eso devuelve la espera de quince segundos que costó quitar
   del arranque (la sonda `probe-sw-arranque` suspendía con el @import
   puesto). Un <link> añadido desde aquí no bloquea nada: mientras
   llega, la sala se lee en Georgia, y cuando llega se repagina sola
   porque `document.fonts` avisa. Sin señal, se queda en Georgia y no
   pasa nada más. */
const VOZ_LETRAS_URL = 'https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;0,7..72,700;1,7..72,400;1,7..72,600&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap';

function vozCargarLetras() {
  if (document.getElementById('voz-letras')) return;
  try {
    const l = document.createElement('link');
    l.id = 'voz-letras';
    l.rel = 'stylesheet';
    l.href = VOZ_LETRAS_URL;
    document.head.appendChild(l);
  } catch (e) {}
}

/* Los ajustes se aplican como propiedades del elemento de la sala, no
   como reglas nuevas: así el CSS decide CÓMO se usa cada número y aquí
   solo se dice cuál es. */
function vozAplicaAjustes() {
  const sala = document.getElementById('voz-lector');
  if (!sala) return;
  const fam = (VOZ_LETRAS.find(l => l.id === _vozAj.letra) || VOZ_LETRAS[0]).css;
  sala.dataset.tema = _vozAj.tema;
  sala.style.setProperty('--voz-tam', _vozAj.tam + 'px');
  sala.style.setProperty('--voz-alto', String(_vozAj.alto));
  sala.style.setProperty('--voz-margen', _vozAj.margen + 'px');
  sala.style.setProperty('--voz-fam', fam);
  sala.style.setProperty('--voz-just', _vozAj.just ? 'justify' : 'left');
  sala.classList.toggle('voz-capital', !!_vozAj.capital);
}

/* Cómo se llama un capítulo en el índice y en el pie cuando no trae
   título: el primero sin título son los preliminares (lo que venía
   antes del primer «##»), los demás van por su número. */
function vozNombreCap(c, i) {
  const cap = (c.capitulos || [])[i];
  if (cap && cap.t) return cap.t;
  if ((c.capitulos || []).length === 1) return c.titulo || 'El texto';
  return i === 0 ? 'Preliminares' : 'Capítulo ' + (i + 1);
}

/* Un bloque del texto convertido en su nodo. Todo con createElement y
   textContent; el único atributo que se escribe es `data-vp`, y es un
   número que ponemos nosotros. */
function vozNodoBloque(p, i, anterior) {
  let el;
  if (p.k === 'sep') {
    el = vozNodo('div', 'voz-sep', '✦');
  } else if (p.k === 'h3') {
    el = vozNodo('h3', 'voz-sub');
    vozPintaTexto(el, p.t);
  } else if (p.k === 'cita') {
    el = vozNodo('blockquote', 'voz-cita');
    vozPintaTexto(el, p.t);
  } else if (p.k === 'verso') {
    el = vozNodo('div', 'voz-verso');
    vozPintaTexto(el, p.t);
  } else if (p.k === 'li') {
    el = vozNodo('div', 'voz-li' + (anterior && anterior.k === 'li' ? '' : ' voz-li-primero'));
    el.appendChild(vozNodo('span', 'voz-li-marca', p.n != null ? p.n + '.' : '•'));
    const t = vozNodo('span', 'voz-li-txt');
    vozPintaTexto(t, p.t);
    el.appendChild(t);
  } else if (p.k === 'fin') {
    el = vozNodo('div', 'voz-fin-palabra', 'FIN');
  } else {
    el = vozNodo('p', 'voz-p');
    /* El primer párrafo de una escena no lleva sangría, como en un libro:
       la sangría dice «esto viene de arriba», y ahí es mentira. Y el
       primero del capítulo lleva capitular si empieza por letra —con
       una raya de diálogo o una comilla la capitular sale ridícula—. */
    if (!anterior || anterior.k !== 'p') el.classList.add('voz-p-sin-sangria');
    if (!anterior && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(p.t || '')) el.classList.add('voz-p-capital');
    vozPintaTexto(el, p.t);
  }
  el.dataset.vp = String(i);
  return el;
}

function vozPintarCap(ancla, sub) {
  const c = _vozLeyendo;
  const hoja = document.getElementById('voz-hoja');
  const texto = document.getElementById('voz-texto');
  if (!c || !hoja || !texto) return;
  const cap = (c.capitulos || [])[_vozCapActual] || { t: '', p: [] };
  const g = vozGenero(c.genero);

  texto.textContent = '';

  /* ⚠️ LA PORTADA ES LA PRIMERA PÁGINA DE TODO TEXTO, Y LLEVA LA
     ETIQUETA. No es una pantalla de bienvenida que se pueda quitar para
     ganar una página: es el sitio donde dice, en grande y antes que el
     texto, que esto lo escribió una máquina imitando a alguien. Ver la
     cabecera del archivo. */
  if (_vozCapActual === 0) {
    const port = vozNodo('div', 'voz-portada');
    /* ⚠️ LA PORTADA ES UNA POSICIÓN DE LECTURA MÁS, LA −1, y sin esto no
       la ve nadie: al abrir un texto nuevo la lectura se coloca en el
       párrafo 0, que está en la página SIGUIENTE, así que la portada
       —que es donde dice en grande que esto lo escribió una máquina
       imitando a alguien— se saltaba entera y en silencio. */
    port.dataset.vp = '-1';
    port.appendChild(vozNodo('div', 'voz-portada-gen', g.t.toUpperCase()));
    port.appendChild(vozNodo('div', 'voz-portada-tit', c.titulo || 'Sin título'));
    port.appendChild(vozNodo('div', 'voz-portada-voz', 'al modo de ' + (c.voz || '—')));
    port.appendChild(vozNodo('div', 'voz-portada-linea'));
    port.appendChild(vozNodo('div', 'voz-portada-maq',
      g.t + ' escrito por ' + (c.maquina || 'una máquina') + '.'));
    port.appendChild(vozNodo('div', 'voz-portada-aviso',
      'No es un texto de ' + (c.voz || 'esa persona') + ': es una imitación de su voz.'));
    if (c.encargo) port.appendChild(vozNodo('div', 'voz-portada-enc', '« ' + c.encargo + ' »'));
    const datos = [];
    const pal = c.palabras || vozPalabras(c.capitulos);
    if ((c.capitulos || []).length > 1) datos.push(c.capitulos.length + ' capítulos');
    datos.push(pal.toLocaleString('es-HN') + ' palabras');
    datos.push('≈ ' + vozMinutos(pal) + ' min de lectura');
    port.appendChild(vozNodo('div', 'voz-portada-datos', datos.join(' · ')));
    if (c.creado_at) port.appendChild(vozNodo('div', 'voz-portada-fec', vozFecha(c.creado_at)));
    texto.appendChild(port);
  }

  /* El epígrafe, en su propia página entre la portada y el capítulo,
     como en un libro. No lleva `data-vp`: no es un sitio donde se
     guarde la lectura, es una antesala. */
  if (cap.epi && cap.epi.length) {
    const epi = vozNodo('div', 'voz-epigrafe');
    cap.epi.forEach(b => {
      const n = vozNodo('div', b.k === 'cita' ? 'voz-epi-cita' : 'voz-epi-verso');
      vozPintaTexto(n, b.t);
      epi.appendChild(n);
    });
    texto.appendChild(epi);
  }

  if (cap.t) {
    const h = vozNodo('h2', 'voz-cap-tit');
    /* El número del capítulo encima del título, salvo que el título ya
       lo traiga («I. El pozo», «Capítulo 3»): dos números uno encima
       del otro se leen como una errata. */
    const yaNumerado = /^\s*([IVXLCDM]+|\d+)\b/i.test(cap.t) || VOZ_PAL_CAP.test(cap.t);
    if ((c.capitulos || []).length > 1 && !yaNumerado) h.appendChild(vozNodo('span', 'voz-cap-num', String(_vozCapActual + 1)));
    const t = vozNodo('span', 'voz-cap-txt');
    vozPintaTexto(t, cap.t);
    h.appendChild(t);
    texto.appendChild(h);
  }

  let anterior = null;
  (cap.p || []).forEach((p, i) => {
    texto.appendChild(vozNodoBloque(p, i, anterior));
    anterior = p;
  });

  /* El pie del capítulo dice qué viene después. Sin esto, el final de
     un capítulo y el final del texto se ven exactamente igual: una
     página que no pasa. */
  const fin = vozNodo('div', 'voz-fin-cap');
  const hayMas = _vozCapActual < (c.capitulos.length - 1);
  const yaDiceFin = (cap.p || []).some(b => b.k === 'fin');
  fin.appendChild(vozNodo('div', 'voz-fin-marca', hayMas ? '❧' : '✦ ✦ ✦'));
  if (hayMas) {
    fin.appendChild(vozNodo('div', 'voz-fin-txt', 'Sigue: ' + vozNombreCap(c, _vozCapActual + 1)));
  } else {
    if (!yaDiceFin) fin.appendChild(vozNodo('div', 'voz-fin-txt', 'Fin de «' + (c.titulo || 'el texto') + '».'));
    fin.appendChild(vozNodo('div', 'voz-fin-et',
      g.t + ' escrito por ' + (c.maquina || 'una máquina') + ', al modo de ' + (c.voz || '—') + '.'));
  }
  texto.appendChild(fin);

  vozPaginar(ancla, sub);
}

/* Cuenta las páginas y coloca la vista. Se llama al pintar, al cambiar
   un ajuste y cada vez que la caja cambia de tamaño. Ver la nota grande
   de arriba sobre la última página. */
function vozPaginar(ancla, sub) {
  const hoja = document.getElementById('voz-hoja');
  const texto = document.getElementById('voz-texto');
  const cola = document.getElementById('voz-cola');
  if (!hoja || !texto) return;
  const B = hoja.clientWidth;
  const H = hoja.clientHeight - 2 * VOZ_ALTO_MARGEN;
  if (B < 40 || H < 40) return;  // la sala está escondida: no se mide nada

  /* ¿Una página o dos? En una tableta acostada o en un monitor, un
     renglón de treinta palabras se pierde al volver al margen; se
     abre el libro a dos páginas, como se abre un libro. En «auto» lo
     decide el ancho; a mano se puede forzar una. */
  let cols = _vozAj.paginas === '2' ? 2 : (_vozAj.paginas === '1' ? 1 : (B >= VOZ_DOS_DESDE ? 2 : 1));
  if (cols === 2 && B < 560) cols = 1;
  const G = VOZ_HUECO;
  const tope = cols === 2 ? VOZ_ANCHO_DOBLE : VOZ_ANCHO_LIBRO;
  const M = Math.max(_vozAj.margen, Math.floor((B - tope) / 2));
  const W = B - 2 * M;
  const cw = cols === 2 ? (W - G) / 2 : W;
  const paso = W + G;
  _vozM = M; _vozCols = cols; _vozPaso = paso;

  hoja.style.padding = VOZ_ALTO_MARGEN + 'px 0 ' + VOZ_ALTO_MARGEN + 'px ' + M + 'px';
  if (cola) cola.style.flexBasis = M + 'px';
  texto.style.height = H + 'px';
  texto.style.columnGap = G + 'px';
  texto.style.columnWidth = 'auto';

  /* Primera pasada: con el ancho de UNA página, las columnas de más se
     salen por la derecha y `scrollWidth` dice hasta dónde llegan. De
     ahí sale cuántas páginas hay. Segunda pasada: al texto se le da el
     ancho de TODAS sus páginas juntas y el número exacto de columnas,
     para que ninguna se salga y el desplazamiento cubra hasta la
     última. Si el reparto cambió al ensanchar (pasa con una imagen de
     salto de página que caía justo en el borde), se vuelve a medir. */
  texto.style.columnCount = String(cols);
  texto.style.width = W + 'px';
  const mide = () => Math.max(1, Math.round((hoja.scrollWidth - M + G) / (cw + G)));
  let paginas = Math.max(1, Math.ceil(mide() / cols));
  for (let intento = 0; intento < 4; intento++) {
    texto.style.width = (paginas * paso - G) + 'px';
    texto.style.columnCount = String(paginas * cols);
    const otra = Math.max(1, Math.ceil(mide() / cols));
    if (otra <= paginas) break;
    paginas = otra;
  }
  _vozPaginas = paginas;

  /* Siempre se coloca por PÁRRAFO, nunca por número de página: es la
     regla grande de arriba, y este es el único sitio donde se aplica. */
  vozIrAncla(ancla == null ? _vozAncla : ancla, sub == null ? _vozSub : sub);
}

function vozPaso() {
  return _vozPaso || ((document.getElementById('voz-texto') || {}).clientWidth || 0) + VOZ_HUECO;
}

/* En qué páginas cae un bloque: la primera y la última. Se mide con sus
   fragmentos (un párrafo partido entre dos columnas tiene dos), y las
   posiciones se leen relativas a la hoja SUMANDO el desplazamiento, así
   que dan lo mismo en mitad de una animación de paso de página. */
function vozRango(el) {
  const hoja = document.getElementById('voz-hoja');
  const hr = hoja.getBoundingClientRect();
  let izq = Infinity, der = -Infinity;
  const rs = el.getClientRects();
  for (let i = 0; i < rs.length; i++) {
    const r = rs[i];
    if (r.width < 1 && r.height < 1) continue;
    if (r.left < izq) izq = r.left;
    if (r.right > der) der = r.right;
  }
  if (izq === Infinity) { const r = el.getBoundingClientRect(); izq = r.left; der = r.right; }
  const paso = vozPaso();
  const x0 = izq - hr.left + hoja.scrollLeft - _vozM;
  const x1 = der - hr.left + hoja.scrollLeft - _vozM;
  return {
    ini: Math.max(0, Math.floor((x0 + 2) / paso)),
    fin: Math.max(0, Math.floor((x1 - 2) / paso)),
  };
}

function vozIrPagina(n, seco) {
  const hoja = document.getElementById('voz-hoja');
  if (!hoja) return;
  _vozPagina = Math.min(Math.max(0, n), _vozPaginas - 1);
  /* ⚠️ SE MUEVE `scrollLeft` A PELO, Y LO SUAVE LO PONE EL CSS
     (`scroll-behavior`, en la hoja). `scrollTo({behavior:'smooth'})` no
     existe en los Safari anteriores a 2022, y ahí no da error: sencilla-
     mente NO PASA LA PÁGINA. Un lector que no pasa página en la tableta
     de alguien es un lector roto, y roto en silencio. Con esto, el
     navegador que no conozca `scroll-behavior` pasa la página de golpe:
     peor que suave, y muchísimo mejor que nada. */
  hoja.style.scrollBehavior = seco ? 'auto' : '';
  hoja.scrollLeft = _vozPagina * vozPaso();
  vozApuntarPos();
  vozPintarPie();
}

/* El párrafo por el que va la lectura AHORA y en qué parte de él: el
   último bloque que EMPIEZA en esta página o antes, y cuántas de sus
   páginas quedan atrás. ⚠️ La referencia es la página en la que estamos,
   NO `scrollLeft`: el paso de página va con desplazamiento suave, así
   que `scrollLeft` todavía enseña de dónde venimos durante la animación.
   Leyéndolo, el párrafo apuntado sería el de la página anterior una vez
   de cada dos, y la lectura volvería un paso atrás cada vez que se
   abriera. */
function vozAncla() {
  const texto = document.getElementById('voz-texto');
  if (!texto) return { ancla: _vozAncla, sub: _vozSub };
  const ps = texto.querySelectorAll('[data-vp]');
  let mejor = null, rango = null;
  for (let i = 0; i < ps.length; i++) {
    const r = vozRango(ps[i]);
    if (r.ini > _vozPagina) break;
    mejor = ps[i]; rango = r;
  }
  if (!mejor) return { ancla: ps.length ? Number(ps[0].dataset.vp) : 0, sub: 0 };
  /* La fracción apunta al CENTRO de la porción que se ve, no a su
     borde: así al volver, floor(fracción × páginas) cae en la misma
     página aunque la fracción se haya redondeado, y si el párrafo ahora
     ocupa más páginas cae en la proporcional. */
  const span = Math.max(1, rango.fin - rango.ini + 1);
  const sub = Math.max(0, Math.round(((_vozPagina - rango.ini + 0.5) / span) * 1000) / 1000);
  return { ancla: Number(mejor.dataset.vp) || 0, sub: sub };
}

function vozIrAncla(i, sub) {
  const texto = document.getElementById('voz-texto');
  if (!texto) return;
  const el = texto.querySelector('[data-vp="' + Number(i) + '"]');
  if (!el) { vozIrPagina(0, true); return; }
  const r = vozRango(el);
  const span = Math.max(1, r.fin - r.ini + 1);
  vozIrPagina(r.ini + Math.floor((sub || 0) * span + 1e-6), true);
}

function vozApuntarPos() {
  if (!_vozLeyendo) return;
  const a = vozAncla();
  _vozAncla = a.ancla;
  _vozSub = a.sub;
  /* La última página del último capítulo es «leído», y se apunta como
     tal: un porcentaje calculado por palabras no llega nunca al cien
     con exactitud, y una barra al 98 % de un texto terminado es una
     barra que miente. */
  const caps = (_vozLeyendo.capitulos || []).length;
  const fin = _vozCapActual >= caps - 1 && _vozPagina >= _vozPaginas - 1;
  vozGuardaPos(_vozLeyendo.cid, _vozCapActual, _vozAncla, _vozSub, fin);
}

/* Pasar página, y al llegar al borde saltar de capítulo: al final de
   uno se entra por la primera página del siguiente y al principio de
   uno se entra por la ÚLTIMA del anterior, que es por donde se
   entraría en un libro yendo hacia atrás. */
function vozPasar(d) {
  const c = _vozLeyendo;
  if (!c) return;
  const destino = _vozPagina + d;
  if (destino >= 0 && destino < _vozPaginas) { vozIrPagina(destino); return; }
  const capDestino = _vozCapActual + d;
  if (capDestino < 0 || capDestino >= (c.capitulos || []).length) return;
  vozIrCapitulo(capDestino, d < 0);
}

function vozIrCapitulo(i, alFinal) {
  const c = _vozLeyendo;
  if (!c) return;
  _vozCapActual = Math.min(Math.max(0, i), (c.capitulos || []).length - 1);
  _vozPagina = 0;
  vozPintarCap(_vozCapActual === 0 ? -1 : 0, 0);
  if (alFinal) vozIrPagina(_vozPaginas - 1, true);
}

/* Las muescas de la barra: dónde empieza cada capítulo, por palabras.
   Se pintan una vez al abrir el texto. */
function vozPintarBarraMarcas() {
  const c = _vozLeyendo;
  const caja = document.getElementById('voz-barra-marcas');
  if (!c || !caja) return;
  caja.textContent = '';
  const caps = c.capitulos || [];
  const total = c.palabras || vozPalabras(caps) || 1;
  if (caps.length < 2) return;
  let acum = 0;
  caps.forEach((cap, i) => {
    if (i > 0) {
      const m = vozNodo('i', 'voz-barra-tick');
      m.style.left = Math.min(99.5, (acum / total) * 100) + '%';
      caja.appendChild(m);
    }
    (cap.p || []).concat(cap.epi || []).forEach(b => { acum += vozPalabrasDe(b.t); });
  });
}

function vozPintarPie() {
  const c = _vozLeyendo;
  const pie = document.getElementById('voz-pag');
  if (!pie || !c) return;
  const caps = (c.capitulos || []).length;
  const total = c.palabras || vozPalabras(c.capitulos) || 1;
  const leido = vozLeido(c, { cap: _vozCapActual, ancla: _vozAncla, sub: _vozSub });
  const ultima = _vozCapActual === caps - 1 && _vozPagina === _vozPaginas - 1;
  const quedan = ultima ? 0 : Math.max(0, total - leido);
  const pct = ultima ? 100 : Math.min(99, Math.round((leido / total) * 100));

  pie.textContent = '';
  pie.appendChild(vozNodo('span', 'voz-pag-n', 'pág. ' + (_vozPagina + 1) + ' / ' + _vozPaginas));
  if (caps > 1) {
    pie.appendChild(vozNodo('span', 'voz-pag-cap', 'cap. ' + (_vozCapActual + 1) + ' de ' + caps));
  }
  pie.appendChild(vozNodo('span', 'voz-pag-resto',
    quedan ? '⏱ quedan ≈ ' + vozMinutos(quedan) + ' min' : '✓ leído'));
  /* La otra mitad de la etiqueta, en el pie de todas las páginas. Arriba
     va la voz imitada; aquí, la máquina. Las dos siempre a la vista. */
  pie.appendChild(vozNodo('span', 'voz-pag-maq', '🤖 ' + (c.maquina || '—')));

  const barra = document.getElementById('voz-barra-in');
  if (barra) barra.style.width = pct + '%';
  const barraCaja = document.getElementById('voz-barra');
  if (barraCaja) barraCaja.setAttribute('aria-label', 'Leído el ' + pct + ' %');

  const tit = document.getElementById('voz-l-tit');
  if (tit) {
    tit.textContent = '';
    tit.appendChild(vozNodo('span', 'voz-l-tit-t', c.titulo || 'Sin título'));
    tit.appendChild(vozNodo('span', 'voz-l-tit-v', '🎭 al modo de ' + (c.voz || '—')));
  }
  vozPintarBotonMarca();
}

/* ─── Los gestos ───────────────────────────────────────────────────
   Con PUNTEROS y nunca con el arrastre del navegador, igual que en el
   resto de la casa. Y el gesto NO es la única forma de pasar página:
   hay dos botones a la vista en el pie, las flechas del teclado y la
   rueda del ratón funcionan. Un lector que solo pasara página
   deslizando sería un lector que a veces no pasa página, porque el
   deslizamiento falla —con el dedo mojado, con funda, con la mano
   llena—. */
function vozEngancharSala() {
  const hoja = document.getElementById('voz-hoja');
  /* Los gestos se escuchan en el MARCO, no en la caja del texto: las
     zonas de toque de los bordes van encima de la caja y se quedarían
     con el puntero antes de que llegara abajo. Al marco le llegan las
     dos cosas, porque los eventos suben. */
  const mid = document.getElementById('voz-mid');
  if (!hoja || !mid || mid.dataset.enganchado) return;
  mid.dataset.enganchado = '1';

  mid.addEventListener('pointerdown', e => {
    _vozArrastre = { x: e.clientX, y: e.clientY, t: Date.now() };
  });
  mid.addEventListener('pointerup', e => {
    if (!_vozArrastre) return;
    const dx = e.clientX - _vozArrastre.x;
    const dy = e.clientY - _vozArrastre.y;
    _vozArrastre = null;
    /* Un arrastre con texto seleccionado es una selección, no un paso
       de página: quien está copiando una frase no quiere que la página
       se le vaya de debajo del dedo. */
    const sel = window.getSelection && window.getSelection();
    if (sel && String(sel).trim()) return;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      _vozTragarClic = true;      // un deslizamiento no es además un toque
      vozPasar(dx < 0 ? 1 : -1);
      setTimeout(() => { _vozTragarClic = false; }, 350);
    }
  });
  mid.addEventListener('pointercancel', () => { _vozArrastre = null; });

  /* Los bordes pasan página, que es como se pasa en cualquier lector.
     El centro —que es la propia hoja, para que el texto se pueda
     seleccionar y copiar— apaga y enciende los mandos. */
  const zona = (id, fn) => {
    const z = document.getElementById(id);
    if (z) z.addEventListener('click', () => { if (!_vozTragarClic) fn(); });
  };
  zona('voz-z-izq', () => vozPasar(-1));
  zona('voz-z-der', () => vozPasar(1));
  hoja.addEventListener('click', e => {
    if (_vozTragarClic) return;
    if (e.target && e.target.closest && e.target.closest('a, mark')) return;
    const sel = window.getSelection && window.getSelection();
    if (sel && String(sel).trim()) return;
    const b = document.getElementById('voz-lector');
    if (!b) return;
    if (!document.getElementById('voz-panel-aa').hidden || !document.getElementById('voz-panel-ind').hidden) {
      vozCerrarPaneles();
      return;
    }
    b.classList.toggle('voz-desnudo');
  });

  /* La rueda del ratón pasa página, como en un lector de escritorio.
     Con freno: una rueda libre manda veinte pasos en medio segundo. */
  mid.addEventListener('wheel', e => {
    const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(d) < 8) return;
    e.preventDefault();
    const ahora = Date.now();
    if (ahora < _vozRuedaHasta) return;
    _vozRuedaHasta = ahora + 380;
    vozPasar(d > 0 ? 1 : -1);
  }, { passive: false });

  /* Repaginar cuando cambia el tamaño: al girar la tableta, al salir el
     teclado, al cambiar la letra. Y SIEMPRE recuperando el párrafo, no
     la página: ver la nota grande de arriba. */
  const repag = () => {
    clearTimeout(_vozRepagTimer);
    /* Con lo APUNTADO: cuando este aviso llega, la caja YA cambió de
       tamaño, así que medir aquí daría el párrafo equivocado. */
    _vozRepagTimer = setTimeout(() => vozPaginar(_vozAncla, _vozSub), 120);
  };
  if (window.ResizeObserver) new ResizeObserver(repag).observe(hoja);
  window.addEventListener('orientationchange', repag);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => repag());
  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener('loadingdone', repag);
  }

  /* El permiso de no apagar la pantalla se pierde al irse a otra
     aplicación; al volver, se vuelve a pedir. */
  document.addEventListener('visibilitychange', () => {
    const sala = document.getElementById('voz-lector');
    if (document.visibilityState === 'visible' && sala && !sala.hidden && !_vozLuz) vozLuz(true);
  });
}

/* Las flechas del teclado y el escape. Se engancha una sola vez, en el
   documento, y solo hace algo con la sala abierta. */
document.addEventListener('keydown', e => {
  const sala = document.getElementById('voz-lector');
  if (!sala || sala.hidden) return;
  const dentroDeCampo = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '');
  if (dentroDeCampo) { if (e.key === 'Escape') vozCerrarPaneles(); return; }
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); vozPasar(1); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'ArrowUp') { e.preventDefault(); vozPasar(-1); }
  else if (e.key === 'Home') { e.preventDefault(); vozIrPagina(0); }
  else if (e.key === 'End') { e.preventDefault(); vozIrPagina(_vozPaginas - 1); }
  else if (e.key === 'Escape') {
    const abierto = ['voz-panel-aa', 'voz-panel-ind'].some(id => { const p = document.getElementById(id); return p && !p.hidden; });
    if (abierto) vozCerrarPaneles(); else vozCerrarLector();
  }
});

/* ⚠️ LA PANTALLA NO SE APAGA MIENTRAS SE LEE. Una tableta se apaga sola
   al minuto y medio sin que la toquen, y leyendo una página larga no se
   la toca: se apaga en mitad del párrafo y hay que desbloquearla cada
   vez. Es el mismo permiso que pide el teleprompter de El Rodaje; puede
   no existir o negarse, y si falla no pasa nada más que lo de antes, así
   que no se avisa. Se suelta al cerrar la sala: un permiso que se queda
   puesto detrás del chat es una batería que se acaba a las tres de la
   tarde sin que nadie sepa por qué. */
let _vozLuzPidiendo = false;

async function vozLuz(encender) {
  if (!encender) {
    /* Se suelta la variable ANTES de esperar al permiso: si la sala se
       vuelve a abrir mientras el permiso viejo termina de soltarse, la
       petición nueva encontraría la variable ocupada y no pediría nada,
       y la pantalla se apagaría leyendo. */
    const viejo = _vozLuz;
    _vozLuz = null;
    if (viejo) { try { await viejo.release(); } catch (e) {} }
    return;
  }
  if (!navigator.wakeLock || !navigator.wakeLock.request || _vozLuz || _vozLuzPidiendo) return;
  _vozLuzPidiendo = true;
  try {
    const mio = await navigator.wakeLock.request('screen');
    _vozLuz = mio;
    /* El sistema puede soltarlo por su cuenta (al irse a otra
       aplicación); se anota solo si sigue siendo el que está puesto. */
    mio.addEventListener('release', () => { if (_vozLuz === mio) _vozLuz = null; });
  } catch (e) { _vozLuz = null; }
  _vozLuzPidiendo = false;
}

function vozPuedePantallaCompleta() {
  const d = document.documentElement;
  return !!(d.requestFullscreen || d.webkitRequestFullscreen);
}

function vozEnPantallaCompleta() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

/* Pantalla completa: esconde la barra del navegador, que en una tableta
   es un dedo de pantalla que se le quita a la página. Se sale sola al
   cerrar la sala. */
function vozPantallaCompleta(encender) {
  try {
    if (encender && !vozEnPantallaCompleta()) {
      const d = document.documentElement;
      const p = d.requestFullscreen ? d.requestFullscreen() : (d.webkitRequestFullscreen ? d.webkitRequestFullscreen() : null);
      if (p && p.catch) p.catch(() => {});
    } else if (!encender && vozEnPantallaCompleta()) {
      const p = document.exitFullscreen ? document.exitFullscreen() : (document.webkitExitFullscreen ? document.webkitExitFullscreen() : null);
      if (p && p.catch) p.catch(() => {});
    }
  } catch (e) {}
}

/* ─── Los paneles de la sala: la letra, y el índice con sus pestañas ──
   Viven DENTRO de #voz-lector, no colgando del body, y eso es una
   decisión de color: la sala redefine sus tokens (papel, sepia,
   noche) en su propio elemento, así que todo lo que esté dentro se
   tiñe solo. Un panel colgado del body saldría blanco encima de la
   sala de noche y deslumbraría justo al leer a oscuras, que es el
   fallo que ya se pagó en El Rodaje y que allí obligó a nombrar seis
   `id` uno por uno. */
function vozCerrarPaneles() {
  ['voz-panel-aa', 'voz-panel-ind'].forEach(id => {
    const p = document.getElementById(id);
    if (p) p.hidden = true;
  });
}

function vozAbrirPanel(id) {
  const abierto = document.getElementById(id);
  const yaEstaba = abierto && !abierto.hidden;
  vozCerrarPaneles();
  if (abierto && !yaEstaba) { abierto.hidden = false; }
}

function vozPintarAjustes() {
  const p = document.getElementById('voz-panel-aa');
  if (!p) return;
  p.textContent = '';

  const fila = (rotulo) => {
    const f = vozNodo('div', 'voz-aj-fila');
    f.appendChild(vozNodo('span', 'voz-aj-rot', rotulo));
    const caja = vozNodo('div', 'voz-aj-caja');
    f.appendChild(caja);
    p.appendChild(f);
    return caja;
  };

  const chips = (caja, ops, activo, alTocar) => {
    ops.forEach(o => {
      const b = vozBoton('voz-aj-chip' + (o.id === activo ? ' voz-aj-on' : ''),
        (o.ic ? o.ic + ' ' : '') + o.t, () => alTocar(o.id));
      if (o.css) b.style.fontFamily = o.css;
      caja.appendChild(b);
    });
  };

  const guarda = () => {
    vozGuardaAjustes();
    vozAplicaAjustes();
    /* ⚠️ Cambiar la letra repagina el texto entero, así que hay que
       volver al PÁRRAFO en que iba la lectura. Y se usa el APUNTADO,
       porque medirlo ahora daría el párrafo de después del cambio: ver
       la nota de `_vozAncla`. Si se volviera al número de página, subir
       un punto la letra movería al lector media página cada vez. */
    vozPaginar(_vozAncla, _vozSub);
    vozPintarAjustes();
  };

  chips(fila('Color'), VOZ_TEMAS, _vozAj.tema, id => { _vozAj.tema = id; guarda(); });
  chips(fila('Letra'), VOZ_LETRAS, _vozAj.letra, id => { _vozAj.letra = id; guarda(); });

  const menosMas = (caja, valor, paso, min, max, pon, muestra) => {
    const b1 = vozBoton('voz-aj-mm', '−', () => { pon(Math.max(min, +(valor - paso).toFixed(2))); guarda(); }, 'Menos');
    const v  = vozNodo('span', 'voz-aj-val', muestra);
    const b2 = vozBoton('voz-aj-mm', '+', () => { pon(Math.min(max, +(valor + paso).toFixed(2))); guarda(); }, 'Más');
    caja.appendChild(b1); caja.appendChild(v); caja.appendChild(b2);
  };

  menosMas(fila('Tamaño'), _vozAj.tam, 1, 14, 34, v => { _vozAj.tam = v; }, _vozAj.tam + ' px');
  menosMas(fila('Interlínea'), _vozAj.alto, 0.1, 1.2, 2.4, v => { _vozAj.alto = v; }, _vozAj.alto.toFixed(1));
  menosMas(fila('Márgenes'), _vozAj.margen, 6, 8, 80, v => { _vozAj.margen = v; }, _vozAj.margen + ' px');

  const cj = fila('Alineado');
  chips(cj, [{ id: 'si', t: 'Justificado' }, { id: 'no', t: 'A la izquierda' }],
    _vozAj.just ? 'si' : 'no', id => { _vozAj.just = (id === 'si'); guarda(); });

  const cc = fila('Capitular');
  chips(cc, [{ id: 'si', t: 'Con capitular' }, { id: 'no', t: 'Sin capitular' }],
    _vozAj.capital ? 'si' : 'no', id => { _vozAj.capital = (id === 'si'); guarda(); });

  /* Las dos páginas solo se ofrecen donde caben: en un teléfono de pie
     un chip que no hace nada es un chip que parece roto. */
  const hoja = document.getElementById('voz-hoja');
  if (hoja && hoja.clientWidth >= 560) {
    chips(fila('Páginas'), [{ id: 'auto', t: 'Auto' }, { id: '1', t: 'Una' }, { id: '2', t: 'Dos, como un libro' }],
      String(_vozAj.paginas || 'auto'), id => { _vozAj.paginas = id; guarda(); });
  }

  if (vozPuedePantallaCompleta()) {
    const cp = fila('Pantalla');
    cp.appendChild(vozBoton('voz-aj-chip' + (vozEnPantallaCompleta() ? ' voz-aj-on' : ''),
      vozEnPantallaCompleta() ? '⛶ Salir de pantalla completa' : '⛶ Pantalla completa',
      () => { vozPantallaCompleta(!vozEnPantallaCompleta()); setTimeout(vozPintarAjustes, 300); }));
  }

  p.appendChild(vozNodo('p', 'voz-aj-nota',
    'La letra y el color son de este aparato: no le cambian la lectura a nadie más de la casa. ' +
    'Toca el centro de la página para esconder los mandos; los bordes pasan página.'));
}

/* El panel de la izquierda del libro: el índice, los marcadores y el
   buscador, en pestañas. Son tres cosas que en un lector de libros
   están juntas porque hacen lo mismo: ir a un sitio del texto. */
function vozPintarPanelInd(tab) {
  const p = document.getElementById('voz-panel-ind');
  const c = _vozLeyendo;
  if (!p || !c) return;
  if (tab) _vozPanelTab = tab;
  p.textContent = '';

  const tabs = vozNodo('div', 'voz-tabs');
  [['ind', '☰ Índice'], ['marcas', '🔖 Marcadores'], ['busca', '🔍 Buscar']].forEach(([id, t]) => {
    const b = vozBoton('voz-tab' + (_vozPanelTab === id ? ' voz-tab-on' : ''), t, () => vozPintarPanelInd(id));
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', _vozPanelTab === id ? 'true' : 'false');
    tabs.appendChild(b);
  });
  p.appendChild(tabs);

  const cuerpo = vozNodo('div', 'voz-panel-cuerpo');
  p.appendChild(cuerpo);
  if (_vozPanelTab === 'marcas') vozPintarMarcas(cuerpo);
  else if (_vozPanelTab === 'busca') vozPintarBuscador(cuerpo);
  else vozPintarIndice(cuerpo);
}

function vozPintarIndice(cuerpo) {
  const c = _vozLeyendo;
  const g = vozGenero(c.genero);

  /* La ficha del texto, arriba del índice: la etiqueta entera, el
     encargo y la nota. Es el único sitio de la sala donde se lee el
     encargo completo, y el encargo es lo único que hace repetible una
     pieza generada. */
  const ficha = vozNodo('div', 'voz-ind-ficha');
  ficha.appendChild(vozNodo('div', 'voz-ind-ficha-t', c.titulo || 'Sin título'));
  const et = vozNodo('div', 'voz-etiqueta');
  et.appendChild(vozNodo('span', 'voz-et-voz', '🎭 al modo de ' + (c.voz || '—')));
  et.appendChild(vozNodo('span', 'voz-et-maq', '🤖 ' + (c.maquina || '—')));
  et.appendChild(vozNodo('span', 'voz-et-gen', g.ic + ' ' + g.t));
  ficha.appendChild(et);
  if (c.encargo) ficha.appendChild(vozNodo('p', 'voz-ind-ficha-p', 'Encargo: ' + c.encargo));
  if (c.nota) ficha.appendChild(vozNodo('p', 'voz-ind-ficha-p', 'Nota: ' + c.nota));
  const pal = c.palabras || vozPalabras(c.capitulos);
  ficha.appendChild(vozNodo('p', 'voz-ind-ficha-p voz-ind-ficha-datos',
    pal.toLocaleString('es-HN') + ' palabras · ≈ ' + vozMinutos(pal) + ' min' +
    (c.creado_at ? ' · ' + vozFecha(c.creado_at) : '')));
  cuerpo.appendChild(ficha);

  cuerpo.appendChild(vozNodo('div', 'voz-ind-tit', 'Índice'));
  const caps = c.capitulos || [];
  if (caps.length === 1 && !caps[0].t) {
    cuerpo.appendChild(vozNodo('p', 'voz-aj-nota',
      'Este texto va de un tirón, sin capítulos. Se lee entero pasando páginas.'));
  }
  const portada = vozBoton('voz-ind-item' + (_vozCapActual === 0 && _vozAncla === -1 ? ' voz-ind-on' : ''), null, () => {
    vozIrCapitulo(0, false); vozCerrarPaneles();
  });
  portada.appendChild(vozNodo('span', 'voz-ind-n', '·'));
  portada.appendChild(vozNodo('span', 'voz-ind-t', 'Portada'));
  cuerpo.appendChild(portada);
  caps.forEach((cap, i) => {
    const b = vozBoton('voz-ind-item' + (i === _vozCapActual && _vozAncla !== -1 ? ' voz-ind-on' : ''), null, () => {
      _vozCapActual = i; _vozPagina = 0;
      vozPintarCap(0, 0); vozCerrarPaneles();
    });
    b.appendChild(vozNodo('span', 'voz-ind-n', String(i + 1)));
    b.appendChild(vozNodo('span', 'voz-ind-t', vozNombreCap(c, i)));
    let pal = 0;
    (cap.p || []).concat(cap.epi || []).forEach(x => { pal += vozPalabrasDe(x.t); });
    b.appendChild(vozNodo('span', 'voz-ind-min', '≈ ' + vozMinutos(pal) + ' min'));
    cuerpo.appendChild(b);
  });
}

/* ─── Los marcadores ───────────────────────────────────────────────
   Un marcador es el párrafo por el que va la página, con su fracción,
   igual que la posición: así sobrevive a un cambio de letra. Son de
   este aparato, como la posición y por lo mismo. */
function vozMarcaDeAqui() {
  if (!_vozLeyendo) return null;
  return vozLeeMarcas(_vozLeyendo.cid).find(m => m.cap === _vozCapActual && m.vp === _vozAncla) || null;
}

function vozExtracto(cap, vp) {
  if (vp < 0) return 'Portada';
  const b = ((cap && cap.p) || [])[vp];
  if (!b) return '';
  if (b.k === 'sep') return '✦ salto de escena';
  const t = String(b.t || '').replace(/[*_]/g, '').replace(/\s+/g, ' ').trim();
  return t.length > 110 ? t.slice(0, 108).replace(/\s+\S*$/, '') + '…' : t;
}

function vozMarcaToggle() {
  const c = _vozLeyendo;
  if (!c) return;
  const lista = vozLeeMarcas(c.cid);
  const ya = lista.findIndex(m => m.cap === _vozCapActual && m.vp === _vozAncla);
  if (ya >= 0) {
    lista.splice(ya, 1);
    vozGuardaMarcas(c.cid, lista);
    vozAviso('Marcador quitado');
  } else {
    const cap = (c.capitulos || [])[_vozCapActual];
    lista.push({ cap: _vozCapActual, vp: _vozAncla, sub: _vozSub,
                 txt: vozExtracto(cap, _vozAncla), cuando: Date.now() });
    lista.sort((a, b) => a.cap - b.cap || a.vp - b.vp || a.sub - b.sub);
    vozGuardaMarcas(c.cid, lista);
    vozAviso('🔖 Marcador puesto en esta página');
  }
  vozPintarBotonMarca();
  const panel = document.getElementById('voz-panel-ind');
  if (panel && !panel.hidden && _vozPanelTab === 'marcas') vozPintarPanelInd('marcas');
}

function vozPintarBotonMarca() {
  const b = document.getElementById('voz-l-marca');
  if (!b) return;
  const hay = !!vozMarcaDeAqui();
  b.classList.toggle('voz-l-ico-on', hay);
  b.setAttribute('aria-pressed', hay ? 'true' : 'false');
  b.title = hay ? 'Quitar el marcador de esta página' : 'Poner un marcador en esta página';
  b.setAttribute('aria-label', b.title);
}

function vozPintarMarcas(cuerpo) {
  const c = _vozLeyendo;
  const lista = vozLeeMarcas(c.cid);
  cuerpo.appendChild(vozNodo('div', 'voz-ind-tit', 'Marcadores'));
  if (!lista.length) {
    cuerpo.appendChild(vozNodo('p', 'voz-aj-nota',
      'Todavía no hay marcadores. Toca 🔖 arriba para dejar uno en la página que estés leyendo; ' +
      'son de este aparato, como la posición de lectura.'));
    return;
  }
  lista.forEach((m, idx) => {
    const fila = vozNodo('div', 'voz-marca');
    const ir = vozBoton('voz-marca-ir', null, () => {
      _vozCapActual = Math.min(Math.max(0, m.cap || 0), (c.capitulos || []).length - 1);
      vozPintarCap(m.vp, m.sub || 0);
      vozCerrarPaneles();
    });
    ir.appendChild(vozNodo('span', 'voz-marca-cap', vozNombreCap(c, m.cap || 0)));
    ir.appendChild(vozNodo('span', 'voz-marca-txt', m.txt || '…'));
    ir.appendChild(vozNodo('span', 'voz-marca-cuando', vozHace(m.cuando)));
    fila.appendChild(ir);
    fila.appendChild(vozBoton('voz-marca-x', '✕', () => {
      lista.splice(idx, 1);
      vozGuardaMarcas(c.cid, lista);
      vozPintarPanelInd('marcas');
      vozPintarBotonMarca();
    }, 'Quitar este marcador'));
    cuerpo.appendChild(fila);
  });
}

/* ─── El buscador de la sala ──────────────────────────────────────
   Busca en el texto guardado, no en la pantalla (en la pantalla solo
   está el capítulo abierto). Sin tildes y sin mayúsculas: quien busca
   «corazon» en una tableta no va a escribir la tilde. */
function vozBuscarEnTexto(q) {
  const c = _vozLeyendo;
  const n = vozSinTildes(q).toLowerCase().trim();
  if (!c || n.length < 2) return [];
  const res = [];
  (c.capitulos || []).forEach((cap, ci) => {
    (cap.p || []).forEach((b, i) => {
      if (!b.t) return;
      const heno = vozSinTildes(b.t).toLowerCase();
      const k = heno.indexOf(n);
      if (k < 0) return;
      const ini = Math.max(0, k - 45);
      let ext = b.t.slice(ini, Math.min(b.t.length, k + n.length + 60)).replace(/\s+/g, ' ');
      if (ini > 0) ext = '…' + ext;
      if (k + n.length + 60 < b.t.length) ext += '…';
      res.push({ cap: ci, vp: i, ext: ext });
    });
  });
  return res;
}

function vozPintarBuscador(cuerpo) {
  const c = _vozLeyendo;
  const caja = vozNodo('div', 'voz-busca-caja');
  const inp = vozNodo('input', 'voz-busca-in');
  inp.type = 'search';
  inp.placeholder = 'Buscar en «' + (c.titulo || 'este texto') + '»…';
  inp.setAttribute('aria-label', 'Buscar en el texto');
  inp.value = _vozBuscaTxt;
  caja.appendChild(inp);
  cuerpo.appendChild(caja);
  const lista = vozNodo('div', 'voz-busca-res');
  cuerpo.appendChild(lista);

  let timer = null;
  const pinta = () => {
    const q = inp.value;
    _vozBuscaTxt = q;
    lista.textContent = '';
    if (vozSinTildes(q).trim().length < 2) {
      lista.appendChild(vozNodo('p', 'voz-aj-nota', 'Escribe al menos dos letras. Se busca en todo el texto, no solo en el capítulo abierto.'));
      return;
    }
    const res = vozBuscarEnTexto(q);
    lista.appendChild(vozNodo('div', 'voz-busca-n',
      res.length ? (res.length === 1 ? 'Un párrafo' : res.length + ' párrafos') + ' con «' + q.trim() + '»'
                 : 'Nada con «' + q.trim() + '»'));
    res.slice(0, 80).forEach(r => {
      const b = vozBoton('voz-busca-item', null, () => {
        _vozCapActual = r.cap;
        vozPintarCap(r.vp, 0);
        vozResaltar(r.vp, q);
        vozCerrarPaneles();
      });
      b.appendChild(vozNodo('span', 'voz-marca-cap', vozNombreCap(c, r.cap)));
      const ext = vozNodo('span', 'voz-busca-ext');
      vozResaltarEn(ext, r.ext, q);
      b.appendChild(ext);
      lista.appendChild(b);
    });
  };
  inp.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(pinta, 180); });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { clearTimeout(timer); pinta(); } });
  pinta();
  setTimeout(() => inp.focus(), 50);
}

/* Pone el término en <mark> dentro de un texto plano, sin innerHTML:
   se trocea y se cuelgan nodos. Sin tildes y sin mayúsculas, como la
   búsqueda; se busca sobre una copia normalizada que mide lo mismo
   que el original (NFD quita las tildes en marcas aparte, y de las
   marcas se salta al comparar). */
function vozResaltarEn(nodo, texto, q) {
  const s = String(texto || '');
  const n = vozSinTildes(q).toLowerCase().trim();
  if (!n) { nodo.textContent = s; return; }
  /* Mapa de posiciones: para cada carácter del texto sin tildes, su
     posición en el original. Así «corazon» encuentra «corazón» y el
     recorte se hace en el sitio correcto del original. */
  const mapa = [];
  let plano = '';
  for (let i = 0; i < s.length; i++) {
    const sin = vozSinTildes(s[i]).toLowerCase();
    for (let k = 0; k < sin.length; k++) { plano += sin[k]; mapa.push(i); }
  }
  let desde = 0, k;
  while ((k = plano.indexOf(n, desde)) >= 0) {
    const ini = mapa[k], fin = mapa[k + n.length - 1] + 1;
    if (ini > desde) nodo.appendChild(document.createTextNode(s.slice(desde, ini)));
    nodo.appendChild(vozNodo('mark', 'voz-mark', s.slice(ini, fin)));
    desde = fin;
  }
  if (desde < s.length) nodo.appendChild(document.createTextNode(s.slice(desde)));
}

/* Resalta el término dentro del párrafo ya pintado y lo hace parpadear
   un momento, para que el ojo lo encuentre en la página. */
function vozResaltar(vp, q) {
  const texto = document.getElementById('voz-texto');
  if (!texto) return;
  const el = texto.querySelector('[data-vp="' + Number(vp) + '"]');
  if (!el) return;
  const nodosTexto = [];
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let t;
  while ((t = w.nextNode())) nodosTexto.push(t);
  nodosTexto.forEach(tn => {
    const frag = document.createDocumentFragment();
    vozResaltarEn(frag, tn.nodeValue, q);
    if (frag.querySelector('mark')) tn.parentNode.replaceChild(frag, tn);
  });
  el.classList.add('voz-p-hit');
  setTimeout(() => el.classList.remove('voz-p-hit'), 2600);
}

/* ══════════════════════════════════════════════════════════════════
   COPIAR Y COMPARTIR EL TEXTO
   ══════════════════════════════════════════════════════════════════
   ⚠️ LA ETIQUETA VA DENTRO DE LO QUE SE COPIA, Y ESTO ES EL REVÉS
   EXACTO DE LA REGLA DE EL RODAJE. Allí las notas del autor van encima
   de una raya y el botón copia solo lo de DEBAJO, porque ese texto
   tiene un único destino —la descripción pública de un video— y una
   nota interna pegada ahí sería el autor confesando en público lo que
   no había comprobado.

   Aquí el destino es cualquiera: otro chat, un correo, un documento,
   la carpeta de alguien. Y precisamente por eso la etiqueta tiene que
   IR PEGADA: un texto «al modo de» alguien que sale de aquí sin decir
   que lo escribió una máquina es, a partir del siguiente reenvío, un
   texto atribuido a esa persona. No hay ningún botón que copie el
   texto pelado, y no es un descuido. Compartir usa el mismo texto. */
function vozTextoPlano(c) {
  const g = vozGenero(c.genero);
  const L = [];
  L.push(c.titulo || 'Sin título');
  L.push('');
  L.push('⚠️ ' + g.t.toUpperCase() + ' ESCRITO POR UNA MÁQUINA, NO POR LA PERSONA IMITADA.');
  L.push('Voz imitada: ' + (c.voz || '—'));
  L.push('Escrito por: ' + (c.maquina || '—'));
  L.push('Género: ' + g.t);
  if (c.encargo) L.push('Se le pidió: ' + c.encargo);
  if (c.creado_at) L.push('Guardado el ' + vozFecha(c.creado_at));
  L.push('');
  L.push('───────────────────────────────');
  L.push('');
  (c.capitulos || []).forEach((cap, i) => {
    (cap.epi || []).forEach(b => {
      L.push(b.t.split('\n').map(x => '        ' + x).join('\n')); L.push('');
    });
    if (cap.t) { L.push((i ? '\n' : '') + cap.t.toUpperCase()); L.push(''); }
    (cap.p || []).forEach(p => {
      if (p.k === 'sep') L.push('* * *');
      else if (p.k === 'fin') L.push('FIN');
      else if (p.k === 'h3') L.push(p.t);
      else if (p.k === 'li') L.push((p.n != null ? p.n + '. ' : '• ') + p.t);
      else if (p.k === 'cita') L.push(p.t.split('\n').map(x => '    ' + x).join('\n'));
      else L.push(p.t);
      L.push('');
    });
  });
  L.push('— ' + g.t + ' escrito por ' + (c.maquina || 'una máquina') + ', al modo de ' + (c.voz || '—') + '. —');
  return L.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function vozCopiar(c) {
  const fin = ok => vozAviso(ok ? '📋 Copiado, con su etiqueta delante' : 'No se pudo copiar');
  const texto = vozTextoPlano(c);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(() => fin(true), () => vozCopiarViejo(texto, fin));
  } else { vozCopiarViejo(texto, fin); }
}

/* El respaldo de siempre: en un WebView sin permiso de portapapeles,
   navigator.clipboard no existe o falla en silencio. */
function vozCopiarViejo(texto, fin) {
  try {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    fin(ok);
  } catch (e) { fin(false); }
}

/* Compartir con la hoja del sistema (WhatsApp, correo, la carpeta), que
   en una tableta es como se manda cualquier cosa. Lleva el mismo texto
   que el botón de copiar, con la etiqueta delante; si el navegador no
   sabe compartir, se copia. */
function vozCompartir(c) {
  const texto = vozTextoPlano(c);
  if (!navigator.share) { vozCopiar(c); return; }
  navigator.share({ title: (c.titulo || 'Texto') + ' · al modo de ' + (c.voz || '—'), text: texto })
    .catch(e => { if (!e || e.name !== 'AbortError') vozCopiar(c); });
}

/* ══════════════════════════════════════════════════════════════════
   LA HOJA DE PEGAR (y de corregir, que es la misma)
   ══════════════════════════════════════════════════════════════════
   ⚠️ UNA SOLA HOJA PARA PEGAR Y PARA CORREGIR. Es la regla 9 del
   Apunte rápido de Finanzas: con dos formularios, un arreglo se hace en
   uno y se queda sin hacer en el otro, y el que se queda roto es
   siempre el que menos se abre. Al corregir se devuelve el texto al
   recuadro como texto, así que corregir una errata es corregirla donde
   se ve, en la frase, y no en una casilla. */

/* Un ejemplo corto, escrito para esto: enseña las etiquetas de la
   cabecera, un capítulo, un subtítulo, una cita, un salto de escena, el
   diálogo con raya y unos versos. Aprender editando algo que ya
   funciona cuesta un tercio que aprender leyendo cómo debería ser
   (misma razón que el botón «📄 Un ejemplo» de El Rodaje). */
const VOZ_EJEMPLO = [
  '# La casa que contaba',
  '',
  'Al modo de: un narrador de pueblo, de frase corta',
  'Escrito por: (aquí el nombre de la máquina)',
  'Género: cuento',
  'Encargo: un cuento breve sobre una casa que lleva la cuenta de quien entra',
  '',
  '> Toda casa cuenta. Solo algunas lo dicen.',
  '',
  '## Capítulo 1: El número',
  '',
  'La casa contaba. No lo decía nadie, pero la casa contaba.',
  '',
  '—¿Cuántos van hoy? —preguntó el cartero.',
  '—Tres —dijo la casa.',
  '—Yo no oí nada.',
  '',
  '* * *',
  '',
  'Al cartero le tocó ser el cuatro.',
  '',
  '### Lo que se cantaba en el pueblo',
  '',
  'Casa que cuentas,',
  'cuenta despacio:',
  'que el que entra tarde',
  'no ocupe espacio.',
  '',
  '## II',
  '',
  'Nadie volvió a preguntar en voz alta.',
  '',
  'FIN',
].join('\n');

let _vozAuto = {};             // lo que el lector rellenó solo, para poder pisarlo al releer
let _vozGeneroTocado = false;  // ¿el género lo eligió la persona con un chip?
let _vozVersosTocado = false;  // ¿el interruptor de versos lo tocó la persona?

function vozAbrirPegar(cuento) {
  const ov = document.getElementById('voz-pegar-overlay');
  if (!ov) return;
  _vozEditando = cuento ? cuento.cid : null;
  _vozAuto = {};
  _vozGeneroTocado = !!cuento;
  _vozVersosTocado = false;

  const ta = document.getElementById('voz-pegar-txt');
  const g = id => document.getElementById(id);
  if (ta) ta.value = cuento ? vozTextoCuerpo(cuento) : '';
  ['voz-f-titulo', 'voz-f-voz', 'voz-f-maquina', 'voz-f-encargo', 'voz-f-nota']
    .forEach(id => { const e = g(id); if (e) e.value = ''; });
  const versos = g('voz-f-versos');
  if (versos) versos.checked = cuento ? vozCuentaBloques(cuento.capitulos).verso > 0 : false;

  if (cuento) {
    g('voz-f-titulo').value  = cuento.titulo || '';
    g('voz-f-voz').value     = cuento.voz || '';
    g('voz-f-maquina').value = cuento.maquina || '';
    g('voz-f-encargo').value = cuento.encargo || '';
    g('voz-f-nota').value    = cuento.nota || '';
  }
  vozPonGenero(cuento ? vozGenero(cuento.genero).id : 'cuento');

  const tit = g('voz-pegar-tit');
  if (tit) tit.textContent = cuento ? '✏️ Corregir el texto' : '➕ Pegar un texto';
  const retirar = g('voz-retirar-btn');
  if (retirar) retirar.hidden = !cuento;

  ov.style.display = 'flex';
  vozRepasar();
  if (!cuento && ta) ta.focus();
}

/* El género elegido vive en un campo escondido y se pinta con chips: un
   desplegable de nueve opciones son dos toques y un menú del sistema;
   un chip es uno. */
function vozPonGenero(id) {
  const e = document.getElementById('voz-f-genero');
  if (e) e.value = vozGenero(id).id;
  vozPintarChipsGenero();
}

function vozPintarChipsGenero() {
  const caja = document.getElementById('voz-genero-chips');
  const e = document.getElementById('voz-f-genero');
  if (!caja) return;
  const activo = vozGenero(e ? e.value : 'cuento').id;
  caja.textContent = '';
  VOZ_GENEROS.forEach(gn => {
    const b = vozBoton('voz-chip voz-chip-gen' + (gn.id === activo ? ' voz-chip-on' : ''), gn.ic + ' ' + gn.t, () => {
      _vozGeneroTocado = true;
      vozPonGenero(gn.id);
      /* Un poema se pega con sus versos: al elegir el género se enciende
         el interruptor de respetar los saltos, salvo que la persona ya
         lo hubiera tocado a mano. */
      const v = document.getElementById('voz-f-versos');
      if (v && gn.id === 'poema' && !_vozVersosTocado && !v.checked) { v.checked = true; }
      vozRepasar();
    });
    b.setAttribute('aria-pressed', gn.id === activo ? 'true' : 'false');
    caja.appendChild(b);
  });
}

/* El cuerpo del texto devuelto a texto, para el recuadro de corregir.
   Sin la cabecera de etiquetas: esas viven en sus campos, y repetirlas
   dentro del texto haría que al volver a leer se duplicaran. Lo que sale
   de aquí lo vuelve a entender vozLeer tal cual: es el mismo alfabeto. */
function vozTextoCuerpo(c) {
  const L = [];
  (c.capitulos || []).forEach((cap, i) => {
    if (cap.epi && cap.epi.length) {
      cap.epi.forEach(b => { L.push(b.t.split('\n').map(x => '> ' + x).join('\n')); L.push(''); });
    }
    if (cap.t) { if (i || L.length) L.push(''); L.push('## ' + cap.t); L.push(''); }
    (cap.p || []).forEach(p => {
      if (p.k === 'sep') L.push('* * *');
      else if (p.k === 'fin') L.push('FIN');
      else if (p.k === 'h3') L.push('### ' + p.t);
      else if (p.k === 'li') L.push((p.n != null ? p.n + '. ' : '- ') + p.t);
      else if (p.k === 'cita') L.push(p.t.split('\n').map(x => '> ' + x).join('\n'));
      else L.push(p.t);
      L.push('');
    });
  });
  return L.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function vozCerrarPegar() {
  const ov = document.getElementById('voz-pegar-overlay');
  if (ov) ov.style.display = 'none';
  _vozEditando = null;
  _vozPegado = null;
}

function vozOpcionesLectura() {
  const v = document.getElementById('voz-f-versos');
  return { versos: v && v.checked ? 'si' : 'auto' };
}

/* Lee lo pegado y enseña QUÉ SE ENTENDIÓ antes de guardar nada. Es la
   red que sostiene todo lo generoso que hace el lector de texto: si
   algo se leyó mal, se ve aquí y se arregla aquí, en vez de
   descubrirse dentro del texto tres semanas después. */
function vozRepasar() {
  const ta = document.getElementById('voz-pegar-txt');
  const caja = document.getElementById('voz-pegar-repaso');
  if (!ta || !caja) return;

  let r = vozLeer(ta.value, vozOpcionesLectura());
  const versos = document.getElementById('voz-f-versos');

  /* ⚠️ LO QUE EL TEXTO TRAÍA ESCRITO RELLENA EL CAMPO, Y NO PISA LO
     TOCADO A MANO. Y esto tiene una trampa que ya se pagó: la primera
     versión rellenaba el título con «Cuento sin título» al abrir la hoja
     vacía, así que cuando después se pegaba un texto con su «# Título»
     el campo ya no estaba vacío y el título de verdad no entraba nunca.
     Ahora se recuerda QUÉ rellenó el lector, y solo se pisa eso. */
  [['titulo', 'voz-f-titulo'], ['voz', 'voz-f-voz'], ['maquina', 'voz-f-maquina'],
   ['encargo', 'voz-f-encargo'], ['nota', 'voz-f-nota']].forEach(([k, id]) => {
    const e = document.getElementById(id);
    if (!e) return;
    const actual = e.value.trim();
    if (r[k] && (!actual || actual === _vozAuto[k])) { e.value = r[k]; _vozAuto[k] = r[k]; }
  });
  if (r.genero && !_vozGeneroTocado) {
    vozPonGenero(r.genero);
    if (r.genero === 'poema' && versos && !versos.checked && !_vozVersosTocado) {
      versos.checked = true;
      r = vozLeer(ta.value, vozOpcionesLectura());
    }
  }
  _vozPegado = r;

  caja.textContent = '';
  if (!ta.value.trim()) {
    caja.appendChild(vozNodo('p', 'voz-rep-vacio',
      'Pega aquí el texto entero, tal como te lo dio la máquina. Se reparte solo en capítulos, citas, listas y versos.'));
    vozPintarBotonGuardar();
    return;
  }

  const pal = vozPalabras(r.capitulos);
  const caps = r.capitulos.length;
  const res = vozNodo('div', 'voz-rep-linea');
  const datos = [caps > 1 ? caps + ' capítulos' : 'un solo capítulo',
    pal.toLocaleString('es-HN') + ' palabras',
    '≈ ' + vozMinutos(pal) + ' min de lectura'];
  if (r.cuenta.subt) datos.push(r.cuenta.subt + (r.cuenta.subt === 1 ? ' subtítulo' : ' subtítulos'));
  if (r.cuenta.citas) datos.push(r.cuenta.citas + (r.cuenta.citas === 1 ? ' cita' : ' citas'));
  if (r.cuenta.versos) datos.push(r.cuenta.versos + (r.cuenta.versos === 1 ? ' estrofa en verso' : ' estrofas en verso'));
  if (r.cuenta.listas) datos.push(r.cuenta.listas + (r.cuenta.listas === 1 ? ' ítem de lista' : ' ítems de lista'));
  datos.forEach(t => res.appendChild(vozNodo('span', 'voz-rep-dato', t)));
  caja.appendChild(res);

  const ind = vozNodo('div', 'voz-rep-caps');
  r.capitulos.forEach((c, i) => {
    const f = vozNodo('div', 'voz-rep-cap');
    f.appendChild(vozNodo('span', 'voz-rep-cap-n', String(i + 1)));
    f.appendChild(vozNodo('span', 'voz-rep-cap-t', c.t || (i === 0 && caps > 1 ? 'Preliminares' : '(sin título)')));
    const np = (c.p || []).filter(b => b.k !== 'sep' && b.k !== 'fin').length;
    f.appendChild(vozNodo('span', 'voz-rep-cap-p', np + (np === 1 ? ' bloque' : ' bloques') + (c.epi ? ' · epígrafe' : '')));
    ind.appendChild(f);
  });
  caja.appendChild(ind);

  /* Un texto con el mismo título ya en el anaquel casi siempre es el
     mismo texto pegado dos veces. No se para el guardado —dos cuentos
     pueden llamarse igual— pero se dice. */
  const tituloActual = ((document.getElementById('voz-f-titulo') || {}).value || '').trim().toLowerCase();
  const repetido = tituloActual && _vozCuentos.find(c => c.cid !== _vozEditando && (c.titulo || '').trim().toLowerCase() === tituloActual);
  if (repetido) {
    caja.appendChild(vozNodo('div', 'voz-rep-repetido',
      'Ya hay un texto llamado «' + repetido.titulo + '» en el anaquel (al modo de ' + (repetido.voz || '—') +
      '). Si es el mismo, ciérralo y corrígelo desde su ✏️ en vez de guardarlo dos veces.'));
  }

  /* ⚠️ Y LO QUE NO SE ENTENDIÓ SE NOMBRA, con su renglón. Esas líneas
     se quedan dentro del texto —que es lo correcto— pero callarse se
     ve desde fuera igual que un rechazo: el autor cree que se perdió y
     vuelve a pegar. Misma lección que el lector de guiones. */
  if (r.avisos.length) {
    const av = vozNodo('div', 'voz-rep-avisos');
    av.appendChild(vozNodo('div', 'voz-rep-avisos-t',
      r.avisos.length + (r.avisos.length === 1
        ? ' renglón parecía una etiqueta y no se entendió. Se quedó dentro del texto, como prosa:'
        : ' renglones parecían etiquetas y no se entendieron. Se quedaron dentro del texto, como prosa:')));
    r.avisos.slice(0, 6).forEach(a =>
      av.appendChild(vozNodo('div', 'voz-rep-aviso', 'renglón ' + a.linea + ': ' + a.txt)));
    caja.appendChild(av);
  }

  vozPintarBotonGuardar();
}

/* ⚠️ EL GUARDADO SE PARA SI FALTA LA ETIQUETA, Y DICE CUÁL FALTA.
   No es una validación de formulario: es LA regla de la herramienta.
   Un texto sin la voz imitada y sin la máquina que lo escribió es
   exactamente el objeto que esto existe para que no exista. Y se
   nombra lo que falta porque un «no se puede» a secas obliga a mirar
   cinco campos desde una tableta (misma lección que el guardia de las
   citas de El Rodaje). */
function vozQueFalta() {
  const v = (document.getElementById('voz-f-voz') || {}).value || '';
  const m = (document.getElementById('voz-f-maquina') || {}).value || '';
  const t = (document.getElementById('voz-f-titulo') || {}).value || '';
  const ta = document.getElementById('voz-pegar-txt');
  const falta = [];
  if (!ta || !ta.value.trim()) falta.push('el texto');
  if (!t.trim()) falta.push('el título');
  if (!v.trim()) falta.push('la voz que se imita');
  if (!m.trim()) falta.push('la máquina que lo escribió');
  return falta;
}

function vozPintarBotonGuardar() {
  const b = document.getElementById('voz-guardar-btn');
  const av = document.getElementById('voz-falta');
  if (!b) return;
  const falta = vozQueFalta();
  b.textContent = _vozEditando ? '💾 Guardar cambios' : '📖 Guardar en el anaquel';
  b.classList.toggle('voz-btn-flojo', falta.length > 0);
  ['voz-f-voz', 'voz-f-maquina'].forEach(id => {
    const e = document.getElementById(id);
    if (e) e.classList.toggle('voz-campo-ambar', !String(e.value || '').trim());
  });
  if (av) {
    av.hidden = !falta.length;
    av.textContent = falta.length
      ? 'Falta ' + falta.join(', ').replace(/, ([^,]*)$/, ' y $1') + '.'
      : '';
  }
}

async function vozGuardarPegado() {
  const falta = vozQueFalta();
  if (falta.length) {
    vozPintarBotonGuardar();
    const av = document.getElementById('voz-falta');
    if (av) av.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return;
  }
  const g = id => (document.getElementById(id) || {}).value || '';
  const r = _vozPegado || vozLeer(document.getElementById('voz-pegar-txt').value, vozOpcionesLectura());
  const viejo = _vozEditando ? _vozCuentos.find(c => c.cid === _vozEditando) : null;

  const c = {
    cid: viejo ? viejo.cid : vozCid(),
    titulo: g('voz-f-titulo').trim(),
    voz: g('voz-f-voz').trim(),
    maquina: g('voz-f-maquina').trim(),
    genero: vozGenero(g('voz-f-genero')).id,
    encargo: g('voz-f-encargo').trim(),
    nota: g('voz-f-nota').trim(),
    capitulos: r.capitulos,
    palabras: vozPalabras(r.capitulos),
    borrado: false,
    creado_at: viejo ? viejo.creado_at : new Date().toISOString(),
    actualizado: Date.now(),
    /* Se firma también en la copia del aparato: es lo que deja saber,
       sin preguntarle a la nube, qué textos son míos y cuáles no —para
       no ofrecer corregir el de otro y para no reintentar su subida—. */
    puesto_por: (viejo && viejo.puesto_por) || _vozYo || null,
  };

  _vozCuentos = [c].concat(_vozCuentos.filter(x => x.cid !== c.cid));
  vozGuardaLocal();
  vozCerrarPegar();
  vozRender();

  const res = await vozSubir(c);
  /* ⚠️ Cada motivo se dice como es. «Subirá cuando vuelva la señal»
     puesto en todos los casos era mentira en dos de ellos: con la
     tabla sin instalar no va a subir nunca, y con un texto ajeno
     tampoco por mucho que vuelva la señal. Un aviso que se equivoca de
     causa manda a mirar donde no está el problema. */
  if (res.ok) vozAviso('📖 Guardado, y ya está en los demás aparatos');
  else if (res.motivo === 'sin-nube')   vozAviso('📴 Guardado aquí. Falta correr voz_prestada.sql para que viaje');
  else if (res.motivo === 'sin-sesion') vozAviso('📴 Guardado aquí. Entra en F.A.R.O para que viaje');
  else if (res.motivo === 'sin-senal')  vozAviso('📡 Guardado aquí. Subirá solo la próxima vez que abras esto');
  else if (res.motivo === 'ajeno')      vozAviso('✋ Ese texto lo puso otra persona: solo quien lo puso puede corregirlo');
  else vozAviso('⚠️ Guardado aquí, pero la nube lo rechazó: ' + (res.detalle || 'sin detalle'));
  vozRender();
}

/* ⚠️ RETIRAR NO BORRA LA FILA: LA MARCA. Es la lápida de la repisa de
   enlaces y de los videos de M.E.T.A.S, y hace falta por lo mismo: si
   este aparato borrara la fila, la tableta que todavía tiene su copia
   la subiría otra vez en la siguiente sincronización y el texto
   resucitaría solo, sin que nadie entendiera por qué. */
async function vozRetirar() {
  if (!_vozEditando) return;
  const c = _vozCuentos.find(x => x.cid === _vozEditando);
  if (!c) return;
  if (!confirm('¿Retirar «' + (c.titulo || 'este texto') + '» del anaquel?')) return;
  const lapida = Object.assign({}, c, { borrado: true, actualizado: Date.now() });
  _vozCuentos = _vozCuentos.filter(x => x.cid !== c.cid);
  try {
    const guardados = vozLeeLocal().filter(x => x.cid !== c.cid);
    guardados.push(lapida);
    localStorage.setItem(VOZ_LOCAL, JSON.stringify(guardados));
  } catch (e) {}
  vozCerrarPegar();
  vozRender();
  await vozSubir(lapida);
}

/* La ventana de ayuda. ⚠️ La lista de etiquetas se pinta LEYENDO
   VOZ_ETIQUETAS, nunca escrita a mano en el HTML: una lista copiada
   estaría equivocada el día que alguien añada una palabra, y quien la
   lea se fiará. Misma regla que las materias de Videos M.E.T.A.S y que
   ROD_ETIQUETAS de El Rodaje; la sonda la comprueba palabra por palabra. */
function vozAbrirAyuda() {
  const ov = document.getElementById('voz-ayuda-overlay');
  const caja = document.getElementById('voz-ayuda-cuerpo');
  if (!ov || !caja) return;
  caja.textContent = '';

  caja.appendChild(vozNodo('p', null,
    'Pega el texto tal como venga. Lo único que hace falta saber es esto:'));

  const porCampo = {};
  Object.entries(VOZ_ETIQUETAS).forEach(([clave, campo]) => {
    (porCampo[campo] = porCampo[campo] || []).push(clave);
  });
  Object.entries(porCampo).forEach(([campo, claves]) => {
    const f = vozNodo('div', 'voz-ayuda-fila');
    f.appendChild(vozNodo('span', 'voz-ayuda-campo', VOZ_CAMPOS[campo] || campo));
    f.appendChild(vozNodo('span', 'voz-ayuda-claves',
      claves.map(c => c.charAt(0).toUpperCase() + c.slice(1) + ':').join('  ·  ')));
    caja.appendChild(f);
  });

  [['Las etiquetas van ARRIBA del texto', 'En cuanto empieza la prosa dejan de leerse como etiquetas, para que un «Nota:» dicho por un personaje no se salga del cuento.'],
   ['El título', '«# Título» en la primera línea, «Título: …», o la primera línea a solas si debajo vienen las etiquetas.'],
   ['Los capítulos', '«## Lo que sea», «Capítulo 3», «Prólogo», «I. El pozo», un número o un romano a solas, o un rótulo EN MAYÚSCULAS o en **negrita** sin punto final. Nada más asciende a capítulo: una frase corta y suelta se queda como frase, porque partir un texto por error parece que funcionó.'],
   ['Los subtítulos', '«### Lo que sea» dentro de un capítulo. Si el texto usa «##» para los capítulos, las negritas y mayúsculas sueltas también se leen como subtítulos.'],
   ['Las citas y el epígrafe', 'Renglones que empiezan por «> ». Una cita antes del primer capítulo es el epígrafe y va en su propia página.'],
   ['Las listas', '«- », «• » o «1. » delante de cada ítem.'],
   ['Los versos', 'Tres o más renglones cortos seguidos se quedan con sus saltos. Para un poema entero, elige el género Poema o enciende «Respetar los saltos de línea».'],
   ['El salto de escena', 'Un renglón con «* * *», «---» o «···».'],
   ['El diálogo', 'Cada raya (—) empieza párrafo, aunque no haya renglón en blanco delante.'],
   ['Cursiva y negrita', '*así* y **así**.'],
   ['El final', '«FIN» a solas se lee como la marca del final, no como un capítulo.'],
  ].forEach(([t, d]) => {
    const f = vozNodo('div', 'voz-ayuda-nota');
    f.appendChild(vozNodo('strong', null, t + ': '));
    f.appendChild(document.createTextNode(d));
    caja.appendChild(f);
  });

  ov.style.display = 'flex';
}

/* ══════════════ ENGANCHES ══════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const on = (id, ev, fn) => document.getElementById(id)?.addEventListener(ev, fn);

  on('voz-back-btn', 'click', () => switchView('view-inicio'));
  on('voz-nuevo-btn', 'click', () => vozAbrirPegar(null));
  on('voz-nuevo-btn2', 'click', () => vozAbrirPegar(null));
  on('voz-busca', 'input', e => { _vozBusca = e.target.value; vozRender(); });

  on('voz-pegar-cerrar', 'click', vozCerrarPegar);
  on('voz-guardar-btn', 'click', vozGuardarPegado);
  on('voz-retirar-btn', 'click', vozRetirar);
  on('voz-ayuda-btn', 'click', vozAbrirAyuda);
  on('voz-ayuda-cerrar', 'click', () => {
    const ov = document.getElementById('voz-ayuda-overlay');
    if (ov) ov.style.display = 'none';
  });
  on('voz-ejemplo-btn', 'click', () => {
    const ta = document.getElementById('voz-pegar-txt');
    if (!ta) return;
    ta.value = VOZ_EJEMPLO;
    _vozAuto = {}; _vozGeneroTocado = false; _vozVersosTocado = false;
    ['voz-f-titulo', 'voz-f-voz', 'voz-f-maquina', 'voz-f-encargo']
      .forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
    vozRepasar();
  });
  on('voz-f-versos', 'change', () => { _vozVersosTocado = true; vozRepasar(); });
  vozPintarChipsGenero();

  let tRepaso = null;
  on('voz-pegar-txt', 'input', () => {
    clearTimeout(tRepaso);
    tRepaso = setTimeout(vozRepasar, 220);
  });
  ['voz-f-titulo', 'voz-f-voz', 'voz-f-maquina'].forEach(id =>
    on(id, 'input', vozPintarBotonGuardar));

  on('voz-l-salir', 'click', vozCerrarLector);
  on('voz-l-aa', 'click', () => { vozPintarAjustes(); vozAbrirPanel('voz-panel-aa'); });
  on('voz-l-ind', 'click', () => { vozPintarPanelInd(); vozAbrirPanel('voz-panel-ind'); });
  on('voz-l-marca', 'click', vozMarcaToggle);
  on('voz-ant', 'click', () => vozPasar(-1));
  on('voz-sig', 'click', () => vozPasar(1));
});
