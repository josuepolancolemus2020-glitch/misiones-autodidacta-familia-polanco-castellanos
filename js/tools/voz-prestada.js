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

   Y desde el 12 de septiembre de 2026 lee también ENSAYOS DE
   INVESTIGACIÓN, que traen dos cosas que un cuento no tiene: CITAS
   —que se pueden tocar para ver su fuente sin salir de la página— y
   TABLAS —que en un teléfono no caben y aquí se pueden ver de tres
   maneras—. Las dos reglas grandes de eso están escritas enteras más
   abajo, en la cabecera de «LAS FUENTES Y LAS TABLAS», y la primera es
   la que no se negocia: una cita NO se quita del texto, se le pone un
   botón.

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
/* La cola del puente desde las misiones: js/lecturas.js deja aquí las
   lecturas que alguien manda con su botón, y esta herramienta las
   recoge al abrirse. Misiones y aplicación comparten origen, así que
   comparten localStorage; la nube no interviene hasta llegar aquí. */
const VOZ_ENTRANTES = 'faro_voz_entrantes_v1';
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
  /* Entró el 10 de septiembre de 2026 con el puente de las lecturas:
     las misiones traen entrevistas imaginadas y careos. Añadir un
     género es esta línea y nada más (regla 15). */
  { id: 'entrevista', ic: '🎤', t: 'Entrevista', pl: 'entrevistas' },
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
let _vozNubeVieja = false; // la tabla está, pero le falta alguna columna nueva
/* ⚠️ Y CUÁLES le faltan, que ya no es una sola. Cada columna añadida
   después del estreno puede no estar en una base que no volvió a correr
   el SQL, y PostgREST rebota la consulta ENTERA por una sola que
   falte. Se piden todas y se van quitando las que la base nombre. */
let _vozFaltan = [];
let _vozEstadoNube = 'mirando'; // mirando | puesta | vieja | sin-tabla | sin-senal | sin-sesion
let _vozFiltroVoz = '';    // '' = todas las voces
let _vozFiltroGen = '';    // '' = todos los géneros
let _vozFiltroEst = '';    // '' = todos los estantes
/* La marca de «los que no están en ninguno». Un carácter que no puede
   ser el nombre de un estante, para no confundirlo con uno que se
   llamara así. */
const VOZ_SIN_ESTANTE = '\u0000';
let _vozBusca = '';
let _vozLeyendo = null;    // el texto abierto en la sala
let _vozCapActual = 0;
let _vozPagina = 0;
let _vozPaginas = 1;
let _vozAj = Object.assign({}, VOZ_AJUSTES_POR_DEFECTO);
let _vozPegado = null;     // lo último que entendió el lector de texto
let _vozEditando = null;   // cid del texto que se está corrigiendo
let _vozEstantesForm = []; // los estantes puestos en la hoja de pegar

/* ══════════════ COSAS PEQUEÑAS ══════════════ */

/* El identificador NACE EN EL APARATO, no en la base. Es la misma regla
   que el `vid` de los videos de M.E.T.A.S y por lo mismo: el guardado se
   reintenta cuando la señal falla, y sin un identificador propio el
   segundo intento dejaría un texto gemelo en el anaquel. */
function vozCid() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ⚠️ LA COPIA DEL APARATO GUARDA TAMBIÉN LAS LÁPIDAS. La primera versión
   escribía solo la lista viva (`_vozCuentos`), así que una lápida recién
   puesta se perdía en cuanto la nube contestaba o se guardaba otro
   texto: si la subida de la lápida había fallado —sin señal, o con la
   tabla vieja—, en el siguiente arranque la fila de la nube volvía sin
   nadie que la contradijera y EL TEXTO RETIRADO RESUCITABA. Es
   literalmente lo que la lápida existe para impedir, roto por el lado
   de acá. Ahora la lista viva se escribe junto con las lápidas que ya
   había, y `vozSubirPendientes()` las sube cuando vuelve la señal. Las
   de más de 180 días se barren, como hace la higiene de la nube. */
function vozGuardaLocal() {
  try {
    const vivos = new Map(_vozCuentos.map(c => [c.cid, c]));
    const limite = Date.now() - 180 * 86400000;
    const lapidas = vozLeeLocal().filter(c =>
      c && c.cid && c.borrado && !vivos.has(c.cid) && (c.actualizado || 0) > limite);
    localStorage.setItem(VOZ_LOCAL, JSON.stringify(_vozCuentos.concat(lapidas)));
  } catch (e) {}
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
/* ⚠️ EL AVISO SE PINTA EN LA CAPA DE MÁS ARRIBA QUE ESTÉ ABIERTA, y hay
   TRES, no dos. La aplicación tiene su `toast()`, pero vive por debajo de la
   sala de lectura, así que con la sala abierta no se vería: por eso existe
   este aviso propio, colgado DENTRO de `#voz-lector`. Lo que se pasó por alto
   al añadir el taller es que él está por ENCIMA de la sala (3300 contra 3200),
   así que un aviso colgado de la sala le queda debajo y tampoco se ve — y el
   taller se abre casi siempre desde el pie de la última página, o sea con la
   sala puesta. O sea que «🖍 8 actividades sacadas de tus subrayados», «no hay
   subrayados de los que sacar actividades» y los avisos de error no se veían
   nunca por el camino normal.

   El nodo es UNO solo y se muda de capa (`appendChild` lo reparenta): con uno
   por capa, el que se quedara detrás seguiría enseñando el aviso de antes. Y
   no hace falta tocar el CSS porque `.voz-toast` se coloca contra su padre y
   el taller declara los mismos tokens, así que se tiñe con el papel puesto. */
function vozAvisoCapa() {
  const taller = document.getElementById('voz-act-overlay');
  if (taller && !taller.hidden) return taller;
  const sala = document.getElementById('voz-lector');
  if (sala && !sala.hidden) return sala;
  return null;
}

function vozAviso(msg) {
  const capa = vozAvisoCapa();
  if (capa) {
    let t = document.getElementById('voz-toast');
    if (!t) { t = vozNodo('div', 'voz-toast'); t.id = 'voz-toast'; }
    if (t.parentNode !== capa) capa.appendChild(t);
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
    /* Con `vozTextoDeBloque` y no con `p.t`: una tabla no tiene `t`,
       tiene celdas, y sin esto media página de datos contaría cero —y
       el avance de la lectura daría un salto al cruzarla—. */
    (c.p || []).forEach(p => { n += vozPalabrasDe(vozTextoDeBloque(p)); });
    (c.epi || []).forEach(p => { n += vozPalabrasDe(vozTextoDeBloque(p)); });
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
  /* Antes que «cuento»: una «entrevista imaginada» o un «careo» traen
     palabras de historia dentro y caerían en el cajón equivocado. */
  if (/entrevista|conversa|charla|careo|debate|coloquio|dialogo/.test(t)) return 'entrevista';
  if (/cuento|relato|capitulo|fabula|leyenda|microrrelato|historia/.test(t)) return 'cuento';
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

/* ══════════════════════════════════════════════════════════════════
   LAS FUENTES Y LAS TABLAS: LO QUE UN ENSAYO TIENE Y UN CUENTO NO
   ══════════════════════════════════════════════════════════════════
   Pedido por el autor el 12 de septiembre de 2026, al empezar a pegar
   aquí sus ensayos de investigación: que las citas «se puedan
   seleccionar y consultar desde el formato de la lectura», y que
   «cuando hayan tablas se pueda ver lo mejor posible».

   ⚠️ LA REGLA QUE MANDA SOBRE TODO LO DE AQUÍ ABAJO, y está escrita la
   primera porque es la que se va a querer romper: UNA CITA NO SE QUITA
   DEL TEXTO, SE LE PONE UN BOTÓN. Ni se mueve, ni se acorta, ni se
   cambia por un numerito. Un «(Harari, 2014, p. 45)» se queda escrito
   tal cual y ADEMÁS se puede tocar. Es la asimetría de la regla 3
   aplicada a esto, y muerde más fuerte: equivocarse hacia «esto no era
   una cita» cuesta un botón que no sale —y la cita se sigue leyendo
   donde está—; equivocarse hacia «esto sí lo era» BORRA PALABRAS DE UN
   ENSAYO Y PARECE QUE FUNCIONÓ, porque la página sigue llena y el texto
   sigue corriendo. Ante la duda, prosa: siempre. Por eso una llamada
   solo se convierte en botón cuando hay una fuente DE VERDAD a la que
   apuntar; sin bibliografía que la respalde no se toca ni un carácter.

   Y la segunda, que es la regla 6 vista desde otro sitio: CONSULTAR UNA
   FUENTE NO MUEVE LA LECTURA. En un lector paginado, saltar a la
   bibliografía y volver es perder la página, y es exactamente lo que el
   autor pidió que no pasara —«consultarlas DESDE el formato de la
   lectura»—. La ficha sale encima, pegada a la llamada, y al cerrarla
   uno sigue en la misma frase.

   Y la tercera: LA BIBLIOGRAFÍA ES UN CAPÍTULO DEL ENSAYO. Sus entradas
   son bloques `fuente` dentro de `capitulos`, que ya es un objeto
   libre, así que esto no pide ni una columna nueva ni volver a correr
   el SQL desde una tableta. Es la regla 15 (los géneros viven en el
   aparato, no en la base) aplicada otra vez, y es también la 21: no se
   inventa una segunda tabla para el mismo gesto. */

/* ¿El título de este capítulo es el de una bibliografía? Solo cuenta
   si está AL FINAL del texto —lo mira quien llama—: un ensayo puede
   abrir con una «Nota» del autor, y eso es prosa. */
/* ⚠️ Y LA VERSIÓN ESTRICTA, que es la que decide si dentro de ese
   capítulo cada RENGLÓN es una entrada. Sin «notas» a propósito: una
   «Nota del autor» al principio de un ensayo es prosa de verdad, y
   partirla renglón a renglón sería el fallo de la regla 3. «Referencias»
   o «Bibliografía» encabezando un capítulo no son prosa nunca. */
function vozEsTituloBibliografia(t) {
  const s = vozSinTildes(String(t || '')).toLowerCase()
    .replace(/^[ivxlcdm\d]+[.)\s-]+/, '').replace(/[.:]+$/, '').trim();
  return /^(referencias|bibliografia|obras citadas|obras consultadas|fuentes|fuentes consultadas|referencias bibliograficas)\b/.test(s);
}

function vozEsTituloFuentes(t) {
  const s = vozSinTildes(String(t || '')).toLowerCase()
    .replace(/^[ivxlcdm\d]+[.)\s-]+/, '').replace(/[.:]+$/, '').trim();
  return /^(referencias|bibliografia|fuentes|obras citadas|obras consultadas|notas|notas al pie|referencias bibliograficas|fuentes consultadas)\b/.test(s);
}

/* ⚠️ UNA DIRECCIÓN SE COMPRUEBA CON `URL()`, NUNCA CON UN GREP:
   `java\tscript:` y `JavaScript:` pasan un grep ingenuo y el navegador
   los ejecuta igual. Es la misma regla de la repisa de enlaces y de
   `rodEnlace()`, y aquí hace falta por lo mismo: esta dirección acaba
   dentro de un `href` de F.A.R.O, que tiene dentro la Bóveda, las
   finanzas, el chat y los teléfonos del Buzón. */
function vozEnlaceBueno(u) {
  try {
    const url = new URL(String(u || '').trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.href;
  } catch (e) { return ''; }
}

/* La dirección que trae escrita una entrada de bibliografía, si trae
   alguna. No se le quita del texto: en una bibliografía la dirección se
   escribe a la vista, y quitarla para ponerla en un botón sería
   reescribir la cita del autor. */
function vozUrlEn(t) {
  const m = String(t || '').match(/https?:\/\/[^\s<>"')\]]+/i);
  if (!m) return '';
  return vozEnlaceBueno(m[0].replace(/[.,;:)\]]+$/, ''));
}

/* Una entrada de bibliografía: su número, si lo trae delante, y el
   resto. El número se guarda APARTE del texto, igual que la viñeta de
   un ítem de lista (`{k:'li', t, n}`), y por lo mismo: así el que
   exporta lo vuelve a escribir UNA sola vez —y no dos— y la llamada
   «[3]» del cuerpo sabe a qué fila apunta. */
function vozFuenteDeTexto(t, n) {
  let s = String(t || '').trim();
  let num = (n != null) ? n : null;
  const m = s.match(/^(?:\[\^?(\d{1,3})\]|\((\d{1,3})\)|(\d{1,3})[.)])\s+(.*)$/);
  if (m) { num = parseInt(m[1] || m[2] || m[3], 10); s = m[4].trim(); }
  return { k: 'fuente', t: s, n: (num != null && !isNaN(num)) ? num : null, url: vozUrlEn(s) || vozDominioAlFinal(s) };
}

/* ⚠️ Y UNA ENTRADA QUE TERMINA EN UN DOMINIO PELADO TAMBIÉN DA ENLACE.
   Hace falta por la ida y vuelta, y se descubrió por ahí: la lista de
   un informe llega con el dominio en su propio renglón, se junta con
   su título —«TALIS 2018: … · publications.iadb.org»— y entonces ya no
   es «solo un dominio». Sin esto, corregir el texto le quitaba el 🔗 a
   todas sus fuentes, sin dar ningún error y sin que se viera hasta
   tocar una.

   Solo se mira el ÚLTIMO trozo y solo si está TODO en minúsculas, que
   es como se escribe un dominio y como no se escribe el final de una
   frase: «Debate.» y «Melville House.» no llevan punto dentro de una
   palabra, y «S.A.» va en mayúsculas. Dentro de la prosa no se busca
   nada: ahí «informe.pdf» tendría la misma pinta y saldría un enlace
   falso. */
const VOZ_NO_DOMINIO = /\.(pdf|docx?|txt|rtf|odt|xlsx?|pptx?|csv|zip|rar|jpe?g|png|gif|webp|svg|mp3|mp4|mov|avi|md|json|xml)$/;

function vozDominioAlFinal(s) {
  const ult = String(s || '').trim().split(/\s+/).pop() || '';
  const limpio = ult.replace(/[.,;:)\]]+$/, '');
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,24}$/.test(limpio)) return '';
  /* Un nombre de archivo tiene la misma forma que un dominio —
     «informe.pdf» pasaría por un sitio web y saldría un 🔗 que no lleva
     a ninguna parte—, así que las terminaciones de archivo se
     descartan a mano. Es la misma clase de lista que la de palabras
     que no son apellidos. */
  if (VOZ_NO_DOMINIO.test(limpio)) return '';
  return vozEnlaceBueno('https://' + limpio);
}

/* ─── Las tablas ───────────────────────────────────────────────────
   Se leen las de tubos («| a | b |»), que es como las escribe cualquier
   máquina, y SOLO con su renglón de guiones debajo. Ese renglón es lo
   que hace inequívoca la tabla: sin él, tres frases con un tubo dentro
   se convertirían en una tabla de tres filas y el ensayo saldría
   descuartizado en silencio, que es el fallo de la regla 3. */
function vozFilaTabla(l) {
  const s0 = String(l || '').trim();
  if (s0.indexOf('|') < 0) return null;
  let s = s0;
  if (s[0] === '|') s = s.slice(1);
  if (s[s.length - 1] === '|' && s[s.length - 2] !== '\\') s = s.slice(0, -1);
  const celdas = s.split('|').map(x => x.trim());
  if (celdas.length < 2) return null;
  return celdas;
}

/* El renglón de guiones, que además dice cómo va alineada cada
   columna: «:--» a la izquierda, «:-:» al centro, «--:» a la derecha.
   Los números de un ensayo se leen mal alineados a la izquierda. */
function vozSepTabla(l) {
  const c = vozFilaTabla(l);
  if (!c) return null;
  if (!c.every(x => /^:?-{2,}:?$/.test(x.replace(/\s/g, '')))) return null;
  return c.map(x => {
    const s = x.replace(/\s/g, '');
    if (/^:.*:$/.test(s)) return 'c';
    if (/:$/.test(s)) return 'd';
    return '';
  });
}

/* El rótulo de una tabla («Tabla 2: Deuda externa, 1980-2000»), que en
   un ensayo va escrito en el renglón de encima y es lo que permite
   nombrarla después. Se le pide la palabra delante: una frase
   cualquiera encima de una tabla es el final del párrafo anterior. */
function vozTituloTabla(l) {
  const s = vozDesnuda(String(l || '')).trim();
  if (!s || s.length > 140) return '';
  return /^(tabla|cuadro|figura|gr[áa]fico|gr[áa]fica)\b\s*\d{0,3}\s*[:.–—-]?\s*\S/i.test(s) ? s : '';
}

/* ⚠️ LA BIBLIOGRAFÍA DE UN INFORME NO VIENE DENTRO DEL TEXTO, Y POR
   ESO TIENE CAJA PROPIA. Descubierto el 12 de septiembre de 2026, con
   el primer informe de investigación que el autor pegó tal cual desde
   Gemini: la herramienta le dijo «una llamada del texto no tiene
   fuente» y él había copiado todo lo que se podía copiar. Y era
   verdad las dos cosas.

   Lo que pasa es que un informe así tiene las fuentes en OTRO SITIO de
   la pantalla —plegadas bajo un «Fuentes usadas en el informe»— y las
   llamadas son numeritos dibujados, no letras. Al copiar el informe no
   viene ni la lista ni los numeritos: en ochomil palabras llegó UNA
   sola llamada, la única escrita a mano dentro de una frase
   —«(TALIS 2018)»—, y ninguna fuente. Ninguna regla de lectura puede
   arreglar eso, porque lo que falta no está en el texto. Lo único que
   lo arregla es una caja donde pegar la lista, que es lo que hay aquí.

   Un renglón, una fuente. Y un renglón que es SOLO un dominio
   («publications.iadb.org») no es una fuente: es el rótulo que esos
   informes ponen encima del título, y se junta con el de debajo.
   Separados serían dos entradas y ninguna de las dos diría nada. */
const VOZ_SOLO_DOMINIO = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]{2,})+\/?$/i;

function vozFuentesDeLista(txt) {
  const lineas = String(txt || '').replace(/\r\n?/g, '\n').split('\n')
    .map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  /* Un «Fuentes usadas en el informe» pegado de cabecera es el rótulo
     de la lista, no la primera fuente. */
  if (lineas.length && vozEsTituloFuentes(lineas[0])) lineas.shift();
  const juntas = [];
  for (let i = 0; i < lineas.length; i++) {
    let l = lineas[i];
    if (VOZ_SOLO_DOMINIO.test(l) && i + 1 < lineas.length && !VOZ_SOLO_DOMINIO.test(lineas[i + 1])) {
      /* El título delante —que es por donde se busca el apellido— y el
         dominio detrás, que es de donde sale el enlace. */
      l = lineas[i + 1] + ' · ' + l.replace(/\/$/, '');
      i++;
    }
    juntas.push({ t: l });
  }
  /* El dominio queda al FINAL de la entrada, que es donde
     `vozDominioAlFinal` lo busca: así el enlace sobrevive a corregir el
     texto, que es donde se perdía. */
  return juntas.map(x => vozFuenteDeTexto(x.t, null));
}

/* Mete las fuentes de la caja en lo que se leyó del texto: en el
   capítulo de bibliografía que el texto ya traía, si lo traía, y si no
   en uno nuevo al final. Va aparte del lector a propósito: el lector
   lee UN texto, y aquí son dos cosas pegadas en dos sitios. */
function vozComponerFuentes(r, txt) {
  const lista = vozFuentesDeLista(txt);
  if (!lista.length) return r;
  const caps = r.capitulos || [];
  const ultimo = caps[caps.length - 1];
  if (ultimo && ultimo.ref) ultimo.p = (ultimo.p || []).concat(lista);
  else caps.push({ t: 'Referencias', ref: true, p: lista });
  r.cuenta.fuentes += lista.length;
  return r;
}

/* Las fuentes de un texto guardado, devueltas a la caja: un renglón
   cada una, con su número si lo traía. */
function vozFuentesTexto(c) {
  const L = [];
  (c.capitulos || []).forEach(cap => (cap.p || []).forEach(b => {
    if (b.k === 'fuente') L.push((b.n != null ? '[' + b.n + '] ' : '') + b.t);
  }));
  return L.join('\n');
}

/* El texto buscable de un bloque, sea de la clase que sea. Una tabla no
   tiene `t` —tiene celdas—, y sin esto el buscador no encontraría nunca
   una cifra dentro de una tabla, que en un ensayo de investigación es
   justo lo que se busca. */
function vozTextoDeBloque(b) {
  if (!b) return '';
  if (b.k === 'tabla') {
    return (b.tit ? b.tit + ' ' : '') + (b.cab || []).join(' ') + ' ' +
           (b.f || []).map(fila => fila.join(' ')).join(' ');
  }
  return b.t || '';
}

/* ─── Casar una llamada del texto con su fuente ────────────────────
   Son dos formas y hay que entender las dos, porque un ensayo usa una
   o la otra y nunca las dos a la vez:

     · la numérica —«[3]», «[^3]», «³»—, que apunta a la entrada 3 de
       la bibliografía y no tiene ninguna ambigüedad;
     · la de autor y año —«(Harari, 2014, p. 45)», «Harari (2014)»—,
       que es la de las normas APA y se casa por APELLIDO + AÑO.

   Y en las dos manda lo mismo: si no hay una fuente a la que apuntar,
   NO SE TOCA EL TEXTO. Sin bibliografía, un ensayo lleno de paréntesis
   se lee exactamente igual que antes de que existiera esto. */

const VOZ_SUPER = { '¹': '1', '²': '2', '³': '3', '⁰': '0',
  '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

/* Las palabras que en un paréntesis de cita NO son el apellido de
   nadie. Sin esta lista, «(Cfr. Harari, 2014)» buscaría a un señor
   llamado Cfr. */
const VOZ_NO_APELLIDO = /^(cfr|cf|vid|ver|vease|veanse|et|al|ibid|ibidem|op|cit|p|pp|pag|pags|cap|caps|n|num|vol|ed|eds|trad|comp|coord|apud|como|segun|citado|citada|en|de|del|la|el|los|las|y|e|o|u|a|por|para|sobre|entre|desde|hasta|tabla|cuadro|figura|grafico|anexo|nota)$/;

/* Los apellidos que trae escrito un trozo de cita, en minúsculas y sin
   tildes: las palabras que empiezan por mayúscula y no están en la
   lista de arriba. */
function vozApellidosEn(s) {
  const out = [];
  const re = /([A-ZÁÉÍÓÚÜÑ][\wÁÉÍÓÚÜÑáéíóúüñ'’-]{2,})/g;
  let m;
  while ((m = re.exec(String(s || ''))) !== null) {
    const p = vozSinTildes(m[1]).toLowerCase().replace(/[^a-z0-9'’-]/g, '');
    if (p.length > 2 && !VOZ_NO_APELLIDO.test(p)) out.push(p);
  }
  return out;
}

function vozAniosEn(s) {
  const out = [];
  const re = /\b(1[5-9]\d{2}|20\d{2})\b/g;
  let m;
  while ((m = re.exec(String(s || ''))) !== null) out.push(m[1]);
  return out;
}

/* El índice de fuentes de un texto: la lista en el orden en que están
   escritas, cada una con su número —si lo trae— y con la cabeza de la
   entrada, que es donde va el apellido en cualquier norma de cita
   («Harari, Y. N. (2014). Sapiens…»). Se calcula una vez por texto
   abierto: en un ensayo de cien párrafos esto se preguntaría una vez
   por párrafo pintado. */
let _vozIdxFuentes = null;

function vozIndiceFuentes(c) {
  if (!c) return null;
  if (_vozIdxFuentes && _vozIdxFuentes.cid === c.cid) return _vozIdxFuentes;
  const lista = [];
  (c.capitulos || []).forEach((cap, ci) => (cap.p || []).forEach((b, i) => {
    if (b.k !== 'fuente') return;
    const t = b.t || '';
    lista.push({
      fid: 'f' + lista.length,
      n: (b.n != null) ? b.n : null,
      t: t,
      url: b.url || vozUrlEn(t),
      cap: ci, vp: i,
      /* El apellido va en los primeros caracteres de la entrada: se
         miran noventa, que es de sobra para «García Márquez, G. (1967)»
         y poco para que un apellido del TÍTULO case por casualidad. */
      cabeza: vozSinTildes(t).toLowerCase().slice(0, 90),
      anios: vozAniosEn(t),
    });
  }));
  const porN = new Map();
  lista.forEach(f => { if (f.n != null && !porN.has(f.n)) porN.set(f.n, f); });
  /* ⚠️ Y UNA BIBLIOGRAFÍA SIN NÚMEROS NO SE NUMERA SOLA. Sería fácil
     contar 1, 2, 3 por el orden de la lista y casar así los «[2]» del
     cuerpo; y sería adivinar. En una bibliografía de estilo APA el
     orden es alfabético, así que ese «[2]» apuntaría a quien no es, la
     ficha enseñaría a OTRO autor y nadie tendría por qué dudarlo: una
     atribución falsa, que es exactamente contra lo que existe esta
     herramienta. Sin número escrito, la llamada se queda como texto y
     el repaso la cuenta entre las que no tienen fuente, que es lo que
     dice qué hay que arreglar —numerar la bibliografía— en vez de
     taparlo con una suposición. */
  _vozIdxFuentes = { cid: c.cid, lista: lista, porN: porN };
  return _vozIdxFuentes;
}

function vozOlvidaFuentes() { _vozIdxFuentes = null; }

/* ¿A qué fuentes apunta un paréntesis de cita? `antes` es lo que va
   escrito justo delante, y hace falta para la forma narrativa —«Harari
   (2014) sostiene…»—, donde el apellido está FUERA del paréntesis. */
function vozCasaParentesis(dentro, antes, idx) {
  const anios = vozAniosEn(dentro);
  if (!anios.length) return [];
  const fuera = vozApellidosEn(String(antes || '').slice(-70));
  const out = [];
  /* Un paréntesis puede llevar varias citas separadas por «;»
     —«(Harari, 2014; Graeber, 2011)»— y entonces la ficha las enseña
     todas: en un ensayo eso es una sola afirmación con dos respaldos. */
  String(dentro).split(';').forEach(trozo => {
    /* El apellido de FUERA del paréntesis solo vale cuando dentro no
       hay ninguno, que es la forma narrativa —«Harari (2014) sostiene»—.
       Sumándolo siempre, un «(Smith, 2014)» en una frase que empezaba
       por «Harari» podría casar con la entrada de Harari: la ficha
       enseñaría al autor equivocado. */
    const dentroAp = vozApellidosEn(trozo);
    const ap = dentroAp.length ? dentroAp : fuera.slice(-2);
    const an = vozAniosEn(trozo).length ? vozAniosEn(trozo) : anios;
    if (!ap.length) return;
    for (const f of idx.lista) {
      if (!an.some(a => f.anios.indexOf(a) >= 0)) continue;
      if (!ap.some(p => new RegExp('(^|[^a-z0-9])' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)').test(f.cabeza))) continue;
      if (out.indexOf(f) < 0) out.push(f);
      break;
    }
  });
  return out;
}

/* ¿Esto INTENTABA ser una cita? Sirve para contar las que se quedaron
   sin fuente y decirlo en el repaso del pegado: en un ensayo, una
   llamada sin entrada en la bibliografía es casi siempre una fuente
   que se quedó sin apuntar, y encontrarla releyendo cuarenta páginas
   es lo que hace que nadie la busque. No se marca un paréntesis
   cualquiera que lleve un año dentro («en 1955 volvió a Comala»): se
   le pide empezar por un nombre propio y ser corto. */
function vozPareceCita(dentro) {
  const s = String(dentro || '').trim();
  if (s.split(/\s+/).length > 9) return false;
  if (!vozAniosEn(s).length) return false;
  return /^([A-ZÁÉÍÓÚÑ]|et al|cfr|cf\.)/.test(s) && vozApellidosEn(s).length > 0;
}

/* Las llamadas que hay en un trozo de texto, con dónde empieza y acaba
   cada una. Es la ÚNICA función que decide qué es una llamada: la usa
   el que pinta y la usa el que cuenta, para que el repaso del pegado no
   pueda decir una cosa y la página otra. */
function vozLlamadasEn(s, idx) {
  const res = [], huerfanas = [];
  const txt = String(s || '');
  if (!txt) return { res: res, huerfanas: huerfanas };
  const re = /\[\^?(\d{1,3})\]|\(([^()]{2,160})\)|([¹²³⁰⁴-⁹]{1,3})/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    const ini = m.index, fin = re.lastIndex;
    let fuentes = [], numero = null, parecia = false;
    if (m[1] != null || m[3] != null) {
      numero = m[1] != null ? parseInt(m[1], 10)
        : parseInt(String(m[3]).split('').map(ch => VOZ_SUPER[ch] || '').join(''), 10);
      parecia = !!numero;
      const f = idx && !isNaN(numero) ? idx.porN.get(numero) : null;
      if (f) fuentes = [f];
    } else {
      parecia = vozPareceCita(m[2]);
      if (idx) fuentes = vozCasaParentesis(m[2], txt.slice(Math.max(0, ini - 70), ini), idx);
    }
    if (fuentes.length) res.push({ i: ini, f: fin, t: txt.slice(ini, fin), fuentes: fuentes, n: numero });
    else if (parecia) huerfanas.push({ i: ini, f: fin, t: txt.slice(ini, fin) });
  }
  return { res: res, huerfanas: huerfanas };
}

/* Dónde está citada cada fuente, para el panel 📚 Fuentes y para el
   repaso. Recorre el texto una vez y se queda con el capítulo y el
   párrafo de cada llamada: es lo que convierte la lista de la
   bibliografía en algo por lo que se puede navegar. */
function vozMapaCitas(c) {
  const idx = vozIndiceFuentes(c);
  const donde = new Map(), huerfanas = [];
  if (!idx) return { idx: null, donde: donde, huerfanas: huerfanas };
  (c.capitulos || []).forEach((cap, ci) => {
    (cap.p || []).forEach((b, i) => {
      /* Una entrada de bibliografía no se cita a sí misma: su «(2014)»
         es la fecha de la obra, no una llamada. Se mira BLOQUE a
         bloque y no capítulo a capítulo, porque la bibliografía puede
         colgar de un subtítulo dentro de un capítulo que sí tiene
         cuerpo citado más arriba. */
      if (b.k === 'fuente') return;
      const t = vozTextoDeBloque(b);
      if (!t) return;
      const ll = vozLlamadasEn(t, idx);
      ll.res.forEach(x => x.fuentes.forEach(f => {
        if (!donde.has(f.fid)) donde.set(f.fid, []);
        const l = donde.get(f.fid);
        if (!l.some(y => y.cap === ci && y.vp === i)) l.push({ cap: ci, vp: i, t: x.t });
      }));
      ll.huerfanas.forEach(x => huerfanas.push({ cap: ci, vp: i, t: x.t }));
    });
  });
  return { idx: idx, donde: donde, huerfanas: huerfanas };
}

function vozLeer(texto, opciones) {
  const op = opciones || {};
  const versos = op.versos === 'si' ? 'si' : 'auto';
  const out = { titulo: '', voz: '', maquina: '', genero: '', encargo: '', nota: '',
                capitulos: [], avisos: [],
                cuenta: { citas: 0, versos: 0, listas: 0, subt: 0, fuentes: 0, tablas: 0 } };
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
  /* ⚠️ DENTRO DE UN CAPÍTULO DE BIBLIOGRAFÍA, CADA RENGLÓN ES UNA
     ENTRADA. Una bibliografía se pega casi siempre así —una entrada por
     renglón y sin blancos en medio, porque en el original iban con
     sangría francesa—, y juntarlas como se juntan las líneas de un
     párrafo dejaría las cuarenta entradas en UNA SOLA fuente kilométrica:
     ni se puede citar, ni se puede consultar, ni se ve que esté mal. Es
     la excepción a «renglones seguidos son un párrafo», y se permite
     porque el rótulo del capítulo la corrobora sin ninguna duda. */
  let enBiblio = false;
  /* Las notas al pie definidas por el camino («[^3]: …»): se juntan
     aquí y se cuelgan al final, como en un libro. */
  const notas = [];

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
    if (enBiblio) {
      buf.forEach(l => { const t = l.trim(); if (t) cap.p.push({ k: 'p', t: t }); });
      buf = [];
      frente = false;
      return;
    }
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
    cierra();                       // con la bandera del capítulo que se cierra
    if (cap) out.capitulos.push(cap);
    cap = { t: String(t || '').trim(), p: [] };
    enBiblio = vozEsTituloBibliografia(cap.t);
  };
  const marca = (p) => { cierra(); asegura(); cap.p.push(p); frente = false; };
  /* Un subtítulo puede ser también la cabecera de la bibliografía: con
     los capítulos en «##», un «REFERENCIAS» pelado al final entra como
     subtítulo del último capítulo, no como capítulo propio (regla 3), y
     sin esto sus cuarenta entradas se juntarían en un párrafo. */
  const marcaSub = (t) => {
    marca({ k: 'h3', t: t });
    out.cuenta.subt++;
    if (vozEsTituloBibliografia(t)) enBiblio = true;
  };

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

    /* ⚠️ UNA TABLA SE LEE POR SU RENGLÓN DE GUIONES, y eso es lo único
       que la hace inequívoca. Sin pedirlo, tres frases con un tubo
       dentro se convertirían en una tabla de tres filas: es el fallo de
       la regla 3 —partir el texto y parecer que funcionó— con otra
       cara. */
    const filaT = vozFilaTabla(l);
    const alT = filaT ? vozSepTabla((lineas[i + 1] || '').trim()) : null;
    if (filaT && alT) {
      /* El rótulo («Tabla 2: Deuda externa») va en el renglón de
         encima y ya entró en el párrafo que se estaba juntando: se le
         saca de ahí antes de cerrarlo, para que no quede como una
         frase suelta colgando encima de la tabla. */
      let titT = '';
      if (buf.length && vozTituloTabla(buf[buf.length - 1])) { titT = vozTituloTabla(buf[buf.length - 1]); buf.pop(); }
      else if (!buf.length && cap && cap.p.length) {
        /* Y casi siempre el rótulo tiene un blanco debajo, así que ya
           se cerró como párrafo propio: se le saca de ahí. Solo si el
           bloque ENTERO era el rótulo — si venía pegado al final de un
           párrafo de verdad, ese párrafo no se toca. */
        const ult = cap.p[cap.p.length - 1];
        if (ult.k === 'p' && vozTituloTabla(ult.t) === ult.t.trim()) { titT = ult.t.trim(); cap.p.pop(); }
      }
      const filas = [];
      let j = i + 2;
      for (; j < lineas.length; j++) {
        const lj = lineas[j].trim();
        if (!lj) break;
        const cf = vozFilaTabla(lj);
        if (!cf) break;
        filas.push(cf);
      }
      /* Todas las filas al ancho de la más ancha: a una fila a la que
         le falta una celda la tabla le sale escalonada, y a una que
         trae de más recortarla le perdería un dato. */
      let ancho = filaT.length;
      filas.forEach(f => { if (f.length > ancho) ancho = f.length; });
      const cuadra = f => { const c = f.slice(); while (c.length < ancho) c.push(''); return c; };
      marca({ k: 'tabla', tit: titT, cab: cuadra(filaT), al: cuadra(alT).map(x => x || ''), f: filas.map(cuadra) });
      out.cuenta.tablas++;
      i = j - 1;
      continue;
    }

    /* Una nota al pie escrita como se escriben («[^3]: …»). Se apunta y
       se saca de aquí: dejarla en mitad de la prosa parte el párrafo en
       dos. Es lo ÚNICO que este lector mueve de sitio, y se permite
       porque esa forma no se escribe por accidente ni una vez. */
    const fn = l.match(/^\[\^([^\]]{1,12})\]:\s*(\S.*)$/);
    if (fn) {
      const numN = parseInt(fn[1], 10);
      notas.push({ n: isNaN(numN) ? null : numN, t: fn[2].trim() });
      continue;
    }

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
      else marcaSub(t);
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
        marcaSub(t);
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

  /* ── LA BIBLIOGRAFÍA ES UN CAPÍTULO DEL ENSAYO ──
     Un capítulo que se llama «Referencias», «Bibliografía» o «Notas» y
     está AL FINAL: sus entradas dejan de ser ítems de lista y pasan a
     ser bloques `fuente`, que es lo que las hace consultables desde
     una llamada del cuerpo. No se mueven ni se reescriben: solo se les
     separa el número de delante, igual que a un ítem de lista se le
     separa la viñeta. Y se pide que esté al final porque un ensayo
     puede ABRIR con una «Nota» del autor, y eso es prosa.  */
  const nCaps = out.capitulos.length;
  const conFuentes = [];
  out.capitulos.forEach((cap, ci) => {
    if (ci < nCaps - 2) { conFuentes.push(cap); return; }
    /* O el capítulo entero se llama «Referencias», o la bibliografía
       cuelga de un subtítulo dentro del último capítulo, que es como
       queda cuando los capítulos van en «##» y el rótulo final va
       pelado (regla 3: con almohadillas puestas, unas mayúsculas
       sueltas son subtítulo). Desde ahí hasta el final, todo son
       fuentes. */
    let desde = 0, titulo = '';
    if (vozEsTituloFuentes(cap.t)) cap.ref = true;
    else {
      const k = (cap.p || []).findIndex(b => b.k === 'h3' && vozEsTituloBibliografia(b.t));
      if (k < 0) { conFuentes.push(cap); return; }
      desde = k + 1;
      titulo = cap.p[k].t;
    }
    const aFuente = b => {
      if (b.k !== 'li' && b.k !== 'p') return b;
      /* Deja de contar como ítem de lista: en el repaso del pegado,
         «3 ítems de lista» y «3 fuentes» para las mismas tres líneas se
         lee como si el lector hubiera entendido seis cosas. */
      if (b.k === 'li' && out.cuenta.listas > 0) out.cuenta.listas--;
      out.cuenta.fuentes++;
      return vozFuenteDeTexto(b.t, b.n);
    };
    if (!desde) { cap.p = (cap.p || []).map(aFuente); conFuentes.push(cap); return; }
    /* ⚠️ Y LA BIBLIOGRAFÍA SE QUEDA EN SU PROPIO CAPÍTULO, aunque
       viniera como subtítulo. Dos razones y las dos pesan: en el índice
       de la sala «Referencias» tiene que ser una entrada a la que se
       pueda ir —es lo que más se consulta de un ensayo—, y sin esto la
       ida y vuelta del recuadro de corregir no sería estable (el
       subtítulo vuelve como capítulo al releerse, y la comprobación 16
       exige que lo que sale se lea IGUAL). */
    const cuerpo = (cap.p || []).slice(0, desde - 1);
    const fuentes = (cap.p || []).slice(desde).map(aFuente);
    if (cuerpo.length) conFuentes.push({ t: cap.t, p: cuerpo, epi: cap.epi });
    else if (cap.epi) conFuentes.push({ t: cap.t, p: [], epi: cap.epi });
    conFuentes.push({ t: titulo, ref: true, p: fuentes });
  });
  out.capitulos = conFuentes.filter(c => (c.p || []).length || c.t);
  if (!out.capitulos.length) out.capitulos = [{ t: '', p: [] }];

  /* Las notas al pie recogidas por el camino van a su propio capítulo,
     al final, como en un libro. Si el texto ya traía uno de fuentes,
     se le suman ahí en vez de abrir otro que diría casi lo mismo. */
  if (notas.length) {
    const bloques = notas.map(x => vozFuenteDeTexto(x.t, x.n));
    out.cuenta.fuentes += bloques.length;
    const ultimo = out.capitulos[out.capitulos.length - 1];
    if (ultimo && ultimo.ref) ultimo.p = (ultimo.p || []).concat(bloques);
    else if (out.capitulos.length === 1 && !ultimo.t && !(ultimo.p || []).length) {
      ultimo.t = 'Notas'; ultimo.ref = true; ultimo.p = bloques;
    } else out.capitulos.push({ t: 'Notas', ref: true, p: bloques });
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
  const n = { p: 0, cita: 0, verso: 0, li: 0, h3: 0, sep: 0, tabla: 0, fuente: 0 };
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

function vozConReloj(peticion, ms) {
  return Promise.race([
    peticion,
    new Promise(res => setTimeout(() => res({
      data: null, error: { code: 'FARO_RELOJ', message: 'la petición no volvió' },
    }), ms || VOZ_ESPERA_MAX)),
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

/* Las que llegaron DESPUÉS de la tabla, en orden de llegada. Añadir una
   es esta línea más su `alter table … add column if not exists` en el
   SQL: la maquinaria de «la base va vieja» ya no hay que tocarla. */
const VOZ_COLS_NUEVAS = ['genero', 'estantes'];

function vozFaltaColumna(error) {
  return !!error && (error.code === '42703' || /column .* does not exist/i.test(error.message || ''));
}

async function vozBajar() {
  const sb = vozSb();
  if (!sb) { _vozEstadoNube = 'sin-sesion'; return null; }
  const pide = (cols) => vozConReloj(sb.from(VOZ_TABLE)
    .select(cols).order('actualizado', { ascending: false }).limit(400));

  /* ⚠️ LA BASE PUEDE IR UNA VERSIÓN ATRÁS: con la tabla creada el día
     del estreno y sin volver a correr el SQL, la columna nueva no
     existe y PostgREST rebota la consulta ENTERA (42703). Eso NO es
     «sin señal» ni «falta el SQL»: la tabla está y los textos también.
     Se vuelve a pedir sin esa columna —la que el propio error nombra—,
     se trabaja con ella solo en el aparato, y la barra dice exactamente
     qué hay que volver a correr. Con dos columnas nuevas hay que
     quitarlas UNA A UNA: quitar las dos por una que falte dejaría el
     género en el aparato en una base que sí lo tiene. */
  let faltan = [], data = null, error = null;
  for (let intento = 0; intento <= VOZ_COLS_NUEVAS.length; intento++) {
    const extras = VOZ_COLS_NUEVAS.filter(c => faltan.indexOf(c) < 0);
    ({ data, error } = await pide([VOZ_COLUMNAS].concat(extras).join(',')));
    if (!vozFaltaColumna(error) || !extras.length) break;
    const nombrada = extras.find(c => new RegExp('\\b' + c + '\\b').test(error.message || ''));
    faltan.push(nombrada || extras[extras.length - 1]);
  }
  _vozFaltan = faltan;
  _vozNubeVieja = faltan.length > 0;

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
  if (_vozFaltan.indexOf('genero') < 0) fila.genero = c.genero || 'cuento';
  if (_vozFaltan.indexOf('estantes') < 0) fila.estantes = vozEstantesDe(c);
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
  if (_vozEstadoNube === 'vieja') {
    /* ⚠️ Y NOMBRA LA COLUMNA QUE FALTA, no «el género» siempre. Desde
       que son dos, un mensaje fijo manda a buscar lo que no es: quien
       lea «para que el género también viaje» con el género ya puesto y
       los estantes sin poner, vuelve a correr el archivo sin entender
       qué arregló. Es la regla de siempre: un aviso que se equivoca de
       causa manda a mirar donde no está el problema. */
    const nombres = { genero: 'el género', estantes: 'los estantes' };
    const l = _vozFaltan.map(c => nombres[c] || c);
    const que = l.length ? l.join(' y ') : 'lo nuevo';
    return { ic: '☁️', t: 'Viajan, pero la base va vieja: vuelve a correr voz_prestada.sql para que ' +
             que + (l.length > 1 ? ' también viajen' : ' también viaje'), cls: 'voz-nube-no' };
  }
  if (_vozEstadoNube === 'sin-tabla') return { ic: '📴', t: 'Solo en este aparato: falta correr voz_prestada.sql', cls: 'voz-nube-no' };
  if (_vozEstadoNube === 'sin-senal') return { ic: '📡', t: 'Sin señal: se guarda aquí y sube cuando vuelva', cls: 'voz-nube-no' };
  if (_vozEstadoNube === 'sin-sesion') return { ic: '📴', t: 'Solo en este aparato: entra en F.A.R.O para que viaje', cls: 'voz-nube-no' };
  return { ic: '⏳', t: 'Mirando la nube…', cls: 'voz-nube-no' };
}

/* ⚠️ EL PUENTE DESDE LAS MISIONES. Las lecturas «a la manera de» que
   viven dentro de las misiones (Borges, Cervantes, Harari, las
   entrevistas imaginadas, los careos) llegan por la cola
   `faro_voz_entrantes_v1`, que llena el botón de js/lecturas.js. Aquí
   se recogen al abrir la herramienta: se crean SIN `puesto_por`, y esa
   ausencia es a propósito —es exactamente la marca que
   vozSubirPendientes() ya usa para «esto falta en la nube»—, así que la
   subida, la firma y el reintento son los de siempre, sin un segundo
   camino que mantener.

   Tres reglas, y las tres tienen dueño:
   · Un texto VIVO del anaquel con el mismo identificador NO se pisa:
     puede llevar una corrección hecha a mano aquí, y el puente no sabe
     más que la misión. Mandarla otra vez no deshace nada.
   · Una LÁPIDA solo revive si el envío es MÁS NUEVO que ella: quien la
     retiró ayer y la manda hoy, la quiere de vuelta; quien la mandó
     ayer y la retiró hoy, no.
   · Sin etiqueta no entra nada, tampoco por aquí: la regla 1 no tiene
     puerta de servicio.
   Si dos personas mandan la MISMA lectura desde dos aparatos, las dos
   copias caen en el mismo cid: la primera que sube firma la fila y la
   otra rebota por la seguridad por fila sin ruido — el contenido es
   idéntico, así que no se pierde nada. */
function vozTraerEntrantes() {
  let cola = [];
  try { cola = JSON.parse(localStorage.getItem(VOZ_ENTRANTES) || '[]') || []; } catch (e) { return 0; }
  if (!Array.isArray(cola) || !cola.length) return 0;
  const guardados = vozLeeLocal();
  const conocidos = new Map();
  guardados.forEach(c => { if (c && c.cid) conocidos.set(c.cid, c); });
  _vozCuentos.forEach(c => { if (c && c.cid && !conocidos.has(c.cid)) conocidos.set(c.cid, c); });
  let entraron = 0;
  cola.forEach(e => {
    if (!e || !e.id || !Array.isArray(e.capitulos)) return;
    const ya = conocidos.get(String(e.id));
    if (ya && (!ya.borrado || (ya.actualizado || 0) >= (e.cuando || 0))) return;
    /* Se copia campo a campo y solo bloques de párrafo: la cola vive en
       localStorage y aquí no entra ninguna forma que no se conozca. La
       pantalla pinta todo con textContent igual, pero una cola no es
       una puerta. */
    const caps = e.capitulos
      .map(cap => ({
        t: String((cap && cap.t) || ''),
        p: (Array.isArray(cap && cap.p) ? cap.p : [])
          .map(b => ({ k: 'p', t: String((b && b.t) || '').trim() }))
          .filter(b => b.t),
      }))
      .filter(c => c.p.length);
    if (!caps.length) return;
    const c = {
      cid: String(e.id),
      titulo: String(e.titulo || 'Sin título'),
      voz: String(e.voz || '').trim(),
      maquina: String(e.maquina || '').trim(),
      genero: vozGeneroDePalabra(String(e.generoPista || '')) || 'texto',
      encargo: String(e.encargo || ''),
      nota: String(e.nota || ''),
      capitulos: caps,
      palabras: vozPalabras(caps),
      borrado: false,
      actualizado: e.cuando || Date.now(),
      creado_at: new Date().toISOString(),
    };
    if (!c.voz || !c.maquina) return;
    _vozCuentos = _vozCuentos.filter(x => x.cid !== c.cid).concat([c]);
    conocidos.set(c.cid, c);
    entraron++;
  });
  /* La cola se vacía ENTERA: cada entrada o entró, o se descartó a
     propósito (ya estaba viva, o su lápida es más nueva, o venía sin
     etiqueta). Dejarla sería reexaminarla en cada arranque. */
  try { localStorage.removeItem(VOZ_ENTRANTES); } catch (e) {}
  if (entraron) vozGuardaLocal();
  /* ⚠️ Y AQUÍ NO SE MONTA EL TALLER, aunque parezca el sitio. El puente
     corre en el arranque, ANTES de que las actividades hayan bajado de la
     nube, y el identificador de una lectura es ESTABLE (`lect-…`): o sea
     que puede existir ya una ficha de otro aparato —con preguntas pegadas
     a mano— que este todavía no ha visto. Montar aquí escribiría encima
     con el reloj de ahora y se las llevaría por delante sin dar un error.
     Se montan al abrir el taller (`vozActMontarSiVacio`), que es donde ya
     se sabe qué hay en la nube. */
  return entraron;
}

async function initVozPrestada() {
  vozLeeAjustes();
  vozRecEngancha();
  _vozEstadoNube = 'mirando';
  if (!_vozCuentos.length) _vozCuentos = vozFusiona(vozLeeLocal(), []);
  const entrantes = vozTraerEntrantes();
  vozRender();                       // se pinta YA con lo del aparato
  if (entrantes) {
    /* El aviso del anaquel es el de la aplicación (toast), no vozAviso:
       ese vive dentro de la sala y aquí la sala está cerrada. */
    try { if (typeof toast === 'function') toast('📖 ' + (entrantes === 1 ? 'Una lectura de las misiones entró al anaquel' : entrantes + ' lecturas de las misiones entraron al anaquel')); } catch (e) {}
  }
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
   LOS ESTANTES DEL ANAQUEL
   ══════════════════════════════════════════════════════════════════
   Pedido por el autor el 12 de septiembre de 2026: «me gustaría tener
   la opción de poder editar las categorías de los textos para ubicarlos
   en los anaqueles según mis criterios y no que me los den
   predeterminados».

   ⚠️ Y SON UN EJE APARTE DEL GÉNERO, que es la decisión que lo explica
   todo. El género dice QUÉ ES el texto —un ensayo, un poema— y por eso
   sale en su portada («Ensayo escrito por Gemini»): es parte de la
   etiqueta, la regla 1, y no se puede renombrar a gusto sin que esa
   frase deje de decir lo que tiene que decir. El estante dice DÓNDE LO
   PONE SU DUEÑO —«Maestría», «Filosofía», «Para citar»— y no significa
   nada fuera de su anaquel.

   Y hacía falta porque el género no sirve para esto: los veintiún
   textos del autor son casi todos «Ensayo», así que agrupar por género
   le daba un solo montón. Lo que de verdad los separa es la materia, y
   eso no se puede adivinar desde aquí ni meter en una lista fija.

   Un texto puede estar en VARIOS estantes, y eso no es un lujo: un
   ensayo de la maestría sobre burocracia está a la vez en «Maestría» y
   en «Burocracia», y obligar a elegir uno de los dos es obligar a
   perder el otro. Al agrupar, ese texto sale en los dos montones, que
   es lo que significa tener estantes y no cajones.

   ⚠️ VIAJAN, y por eso están en la base y no en el aparato: un estante
   es una propiedad del TEXTO, y el texto es de la casa. Es lo contrario
   del orden a mano (regla 25), que es del aparato porque la seguridad
   por fila no deja escribir las filas de los demás. Aquí cada quien
   escribe los suyos, que es justo lo que la seguridad por fila permite.
   Mientras no se corra el SQL, funcionan igual guardados en el aparato
   y la barra lo dice: es la regla de la repisa de enlaces. */
const VOZ_EST_MAX = 12;      // el mismo tope que el `check` de la base
const VOZ_EST_LARGO = 40;

/* Los estantes de un texto, limpios: sin repetidos —ni con otra
   mayúscula o sin la tilde—, recortados y con el tope puesto. Se limpia
   al LEER y no solo al escribir, porque en la base puede haber entrado
   cualquier cosa desde otro aparato. */
function vozEstantesDe(c) {
  const l = Array.isArray(c && c.estantes) ? c.estantes : [];
  const vistos = new Set(), out = [];
  l.forEach(x => {
    const t = String(x == null ? '' : x).replace(/\s+/g, ' ').trim().slice(0, VOZ_EST_LARGO);
    const k = vozSinTildes(t).toLowerCase();
    if (!t || vistos.has(k)) return;
    vistos.add(k);
    out.push(t);
  });
  return out.slice(0, VOZ_EST_MAX);
}

/* Todos los estantes del anaquel, por lo más usado. ⚠️ Salen de los
   TEXTOS, nunca de una lista escrita aquí: es lo que pidió el autor con
   todas las letras —«según mis criterios y no que me los den
   predeterminados»— y es además la regla 15 de esta herramienta. */
function vozEstantesTodos() {
  const cuenta = new Map();
  (_vozCuentos || []).forEach(c => {
    if (!c || c.borrado) return;
    vozEstantesDe(c).forEach(e => {
      const k = vozSinTildes(e).toLowerCase();
      if (!cuenta.has(k)) cuenta.set(k, { t: e, n: 0 });
      cuenta.get(k).n++;
    });
  });
  return [...cuenta.values()].sort((a, b) => b.n - a.n || a.t.localeCompare(b.t, 'es'));
}

function vozEnEstante(c, nombre) {
  const k = vozSinTildes(nombre).toLowerCase();
  return vozEstantesDe(c).some(e => vozSinTildes(e).toLowerCase() === k);
}

/* ⚠️ UNA SOLA FILA DE ESTANTES PARA LOS DOS SITIOS donde se ponen: la
   hoja de pegar —donde se guardan al guardar el texto— y el menú ⋯
   —donde se guardan al momento, que es lo que hace llevadero archivar
   veinte textos que ya estaban—. Dos copias de esto se irían separando
   solas, y la que menos se mira sería la que se quedara rota.
   `dame()` devuelve lo puesto y `pon(lista)` lo recibe. */
function vozPintarEstantes(caja, dame, pon) {
  if (!caja) return;
  const puestos = dame();
  const repinta = () => vozPintarEstantes(caja, dame, pon);
  caja.textContent = '';

  const fila = vozNodo('div', 'voz-chips voz-chips-form');
  const alterna = (nombre) => {
    const l = dame();
    const k = vozSinTildes(nombre).toLowerCase();
    const i = l.findIndex(e => vozSinTildes(e).toLowerCase() === k);
    if (i >= 0) l.splice(i, 1);
    else {
      if (l.length >= VOZ_EST_MAX) { vozAviso('🗂 El tope son ' + VOZ_EST_MAX + ' estantes por texto'); return; }
      l.push(nombre);
    }
    pon(l);
    repinta();
  };
  /* Primero los que tiene puestos, y detrás los demás del anaquel: así
     lo que ya está se lee de un vistazo sin buscarlo entre veinte. */
  const todos = vozEstantesTodos().map(x => x.t);
  const orden = puestos.concat(todos.filter(t => !puestos.some(p => vozSinTildes(p).toLowerCase() === vozSinTildes(t).toLowerCase())));
  orden.forEach(nombre => {
    const on = puestos.some(p => vozSinTildes(p).toLowerCase() === vozSinTildes(nombre).toLowerCase());
    const b = vozBoton('voz-chip voz-chip-chica' + (on ? ' voz-chip-on' : ''), '🗂 ' + nombre,
      () => alterna(nombre), on ? 'Quitar de «' + nombre + '»' : 'Poner en «' + nombre + '»');
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    fila.appendChild(b);
  });
  if (!orden.length) {
    fila.appendChild(vozNodo('span', 'voz-est-vacio',
      'Todavía no hay estantes. Escribe uno abajo: «Maestría», «Filosofía», lo que te sirva para encontrarlos.'));
  }
  caja.appendChild(fila);

  /* El campo de crear uno nuevo. Con su botón además de la tecla de
     entrar: en una tableta, «pulsa Enter» es una instrucción que no se
     ve por ninguna parte. */
  const nuevo = vozNodo('div', 'voz-est-nuevo');
  const inp = vozNodo('input', 'voz-est-in');
  inp.type = 'text';
  inp.maxLength = VOZ_EST_LARGO;
  inp.placeholder = 'Un estante nuevo…';
  inp.setAttribute('aria-label', 'Crear un estante nuevo');
  const crea = () => {
    const t = inp.value.replace(/\s+/g, ' ').trim().slice(0, VOZ_EST_LARGO);
    if (!t) return;
    inp.value = '';
    if (!vozEstantesDe({ estantes: dame() }).some(e => vozSinTildes(e).toLowerCase() === vozSinTildes(t).toLowerCase())) alterna(t);
    else repinta();
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); crea(); } });
  nuevo.appendChild(inp);
  nuevo.appendChild(vozBoton('voz-btn voz-btn-chico', '+ Añadir', crea));
  caja.appendChild(nuevo);
}

/* ══════════════════════════════════════════════════════════════════
   EL ANAQUEL
   ══════════════════════════════════════════════════════════════════
   Tres vistas (cuadrícula, lista y detalle), seis órdenes —uno de ellos
   a mano, arrastrando— y dos agrupaciones (por voz y por género), que
   es lo que pidió el autor el 10 de septiembre de 2026 al probar la
   herramienta: «ver los libros en cuadrícula, en lista, en detalle y
   poder moverlos, hacer una clasificación por voces de autores».

   ⚠️ LA VISTA, EL ORDEN Y LA AGRUPACIÓN SON DEL APARATO, y el orden a
   mano también. Es la regla 9 de la repisa de enlaces: la seguridad por
   fila solo deja escribir la fila propia, así que un orden común de la
   casa es imposible sin poder escribir las filas ajenas, y fingir lo
   contrario sería un arrastre que parece guardarse y no se guarda. Aquí
   se dice en el propio chip: «Manual (este aparato)». */

const VOZ_ANAQUEL = 'faro_voz_anaquel_v1';
let _vozAnaquel = { vista: 'detalle', orden: 'recientes', grupo: '', manual: [] };

const VOZ_VISTAS = [
  { id: 'cuadricula', ic: '▦', t: 'Cuadrícula' },
  { id: 'lista',      ic: '☰', t: 'Lista' },
  { id: 'detalle',    ic: '▤', t: 'Detalle' },
];
const VOZ_ORDENES = [
  { id: 'recientes', t: 'Recientes' },
  { id: 'manual',    t: 'Manual (este aparato)' },
  { id: 'titulo',    t: 'Título' },
  { id: 'voz',       t: 'Voz' },
  { id: 'genero',    t: 'Género' },
  { id: 'avance',    t: 'A medias primero' },
];
const VOZ_GRUPOS = [
  { id: '',        t: 'Sin agrupar' },
  { id: 'estante', t: 'Por estante' },
  { id: 'voz',     t: 'Por voz' },
  { id: 'genero',  t: 'Por género' },
];

function vozLeeAnaquel() {
  try {
    const s = localStorage.getItem(VOZ_ANAQUEL);
    if (s) _vozAnaquel = Object.assign({ vista: 'detalle', orden: 'recientes', grupo: '', manual: [] }, JSON.parse(s) || {});
  } catch (e) {}
  if (!VOZ_VISTAS.some(v => v.id === _vozAnaquel.vista)) _vozAnaquel.vista = 'detalle';
  if (!VOZ_ORDENES.some(o => o.id === _vozAnaquel.orden)) _vozAnaquel.orden = 'recientes';
  if (!VOZ_GRUPOS.some(g => g.id === _vozAnaquel.grupo)) _vozAnaquel.grupo = '';
  if (!Array.isArray(_vozAnaquel.manual)) _vozAnaquel.manual = [];
  return _vozAnaquel;
}

function vozGuardaAnaquel() {
  try { localStorage.setItem(VOZ_ANAQUEL, JSON.stringify(_vozAnaquel)); } catch (e) {}
}

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
    if (_vozFiltroEst && !(_vozFiltroEst === VOZ_SIN_ESTANTE ? !vozEstantesDe(c).length : vozEnEstante(c, _vozFiltroEst))) return false;
    if (!q) return true;
    const heno = vozSinTildes([c.titulo, c.voz, c.maquina, c.encargo, c.nota, vozGenero(c.genero).t]
      .concat(vozEstantesDe(c)).filter(Boolean).join(' ')).toLowerCase();
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
    (caps[i].p || []).forEach(b => { n += vozPalabrasDe(vozTextoDeBloque(b)); });
    (caps[i].epi || []).forEach(b => { n += vozPalabrasDe(vozTextoDeBloque(b)); });
  }
  const cap = caps[pos.cap || 0];
  if (cap) {
    (cap.epi || []).forEach(b => { n += vozPalabrasDe(vozTextoDeBloque(b)); });
    const ancla = typeof pos.ancla === 'number' ? pos.ancla : 0;
    (cap.p || []).forEach((b, i) => {
      if (i < ancla) n += vozPalabrasDe(vozTextoDeBloque(b));
      else if (i === ancla) n += Math.round(vozPalabrasDe(vozTextoDeBloque(b)) * Math.min(1, Math.max(0, pos.sub || 0)));
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

/* ¿Es mío? Lo impide de verdad la seguridad por fila; esto solo decide
   qué botones se enseñan, para no prometer lo que la base va a
   rechazar. */
function vozEsMio(c) {
  return !c.puesto_por || !_vozYo || c.puesto_por === _vozYo;
}

/* ══════════════════════════════════════════════════════════════════
   UNIFICAR UN NOMBRE DE MÁQUINA MAL ESCRITO
   ══════════════════════════════════════════════════════════════════
   Pedido por el autor el 12 de septiembre de 2026: «corrige el Gemeni
   del anaquel a Gemini». Esa errata la escribió una tableta y está
   DENTRO de sus textos, así que no se arregla desde ningún archivo del
   repositorio: la única mano que puede escribir esas filas es la suya,
   porque la seguridad por fila solo deja escribir lo propio. Lo que sí
   se puede es ponerle el arreglo a un toque.

   Y no es por una errata: es por TODAS las que vengan. El nombre de la
   máquina es un campo libre que se escribe en cada texto desde una
   tableta, así que esto va a volver a pasar. Un «Gemeni» suelto parte
   en dos el montón del chip que agrupa por máquina —salen dos donde
   había uno—, sin dar ningún error y sin que nadie lo mire.

   ⚠️ Y SOLO SE OFRECE LO QUE ESTÁ A UNA LETRA de uno de los nombres
   buenos (`vozUnaLetraDe`, la misma que decide qué chips se proponen).
   A dos letras ya caben cosas distintas de verdad —«Claude» y «Claude
   3»— y unificarlas sería cambiarle a alguien lo que quiso escribir.

   ⚠️ Y SOLO LO PROPIO. Un texto ajeno lo rechazaría la base, así que
   ofrecerlo sería prometer algo que no se puede hacer; los de otros se
   cuentan aparte y se dice de quién es el arreglo. */
function vozMaquinasTorcidas() {
  const malas = new Map();
  (_vozCuentos || []).forEach(c => {
    if (!c || c.borrado) return;
    const m = String(c.maquina || '').trim();
    if (!m) return;
    const buena = VOZ_MAQUINAS.find(b => vozUnaLetraDe(m, b));
    if (!buena) return;
    if (!malas.has(m)) malas.set(m, { mala: m, buena: buena, mios: [], ajenos: 0 });
    const e = malas.get(m);
    if (vozEsMio(c)) e.mios.push(c.cid); else e.ajenos++;
  });
  return [...malas.values()];
}

function vozPintarUnificar() {
  const caja = document.getElementById('voz-unificar');
  if (!caja) return;
  const lista = vozMaquinasTorcidas();
  caja.textContent = '';
  caja.hidden = !lista.length;
  lista.forEach(x => {
    const fila = vozNodo('div', 'voz-unif-fila');
    const n = x.mios.length;
    fila.appendChild(vozNodo('span', 'voz-unif-txt',
      (n + x.ajenos === 1 ? 'Un texto dice' : (n + x.ajenos) + ' textos dicen') +
      ' «' + x.mala + '», que parece «' + x.buena + '» mal escrito. Así salen dos máquinas donde hay una.'));
    if (n) {
      fila.appendChild(vozBoton('voz-btn voz-btn-chico', '✏️ Cambiar a «' + x.buena + '»',
        () => vozUnificarMaquina(x.mala, x.buena),
        'Corregir la máquina en ' + n + (n === 1 ? ' texto' : ' textos')));
    }
    if (x.ajenos) {
      fila.appendChild(vozNodo('span', 'voz-unif-ajeno',
        x.ajenos === 1 ? 'Uno lo puso otra persona de la casa: solo esa persona puede corregirlo.'
                       : x.ajenos + ' los puso otra persona de la casa: solo esa persona puede corregirlos.'));
    }
    caja.appendChild(fila);
  });
}

/* Cambia el nombre en los textos propios y los sube por el camino de
   siempre (`vozSubir`), que ya sabe reintentar, distinguir los motivos
   y respetar las lápidas. Aquí no se inventa un segundo camino a la
   nube: uno de los dos se quedaría viejo. */
async function vozUnificarMaquina(mala, buena) {
  const sucio = String(mala).trim().toLowerCase();
  const tocados = (_vozCuentos || []).filter(c =>
    c && !c.borrado && vozEsMio(c) && String(c.maquina || '').trim().toLowerCase() === sucio);
  if (!tocados.length) return;
  tocados.forEach(c => { c.maquina = buena; c.actualizado = Date.now(); });
  vozGuardaLocal();
  vozRender();
  let bien = 0, mal = '';
  for (const c of tocados) {
    const res = await vozSubir(c);
    if (res.ok) bien++; else mal = res.motivo || 'rechazo';
  }
  const cuantos = tocados.length === 1 ? 'Un texto' : tocados.length + ' textos';
  if (bien === tocados.length) vozAviso('✏️ ' + cuantos + ' con «' + buena + '», también en los demás aparatos');
  else if (mal === 'sin-senal') vozAviso('✏️ ' + cuantos + ' corregidos aquí. Subirán solos la próxima vez que abras esto');
  else if (mal === 'sin-nube') vozAviso('✏️ ' + cuantos + ' corregidos aquí. Falta correr voz_prestada.sql para que viaje');
  else if (mal === 'sin-sesion') vozAviso('✏️ ' + cuantos + ' corregidos aquí. Entra en F.A.R.O para que viaje');
  else vozAviso('✏️ ' + cuantos + ' corregidos aquí, pero la nube rechazó alguno');
  vozRender();
}

function vozOrdena(lista) {
  const o = _vozAnaquel.orden;
  const rec = (a, b) => (b.actualizado || 0) - (a.actualizado || 0);
  const tit = (a, b) => (a.titulo || '').localeCompare(b.titulo || '', 'es');
  const l = lista.slice();
  if (o === 'titulo') l.sort((a, b) => tit(a, b) || rec(a, b));
  else if (o === 'voz') l.sort((a, b) => (a.voz || '').localeCompare(b.voz || '', 'es') || tit(a, b));
  else if (o === 'genero') {
    const idx = c => VOZ_GENEROS.findIndex(g => g.id === vozGenero(c.genero).id);
    l.sort((a, b) => idx(a) - idx(b) || tit(a, b));
  } else if (o === 'avance') {
    /* Lo empezado primero (lo más avanzado antes), después lo sin
       empezar por recientes, y lo leído al final. */
    const peso = c => { const av = vozAvance(c); return av >= 100 ? 2 : (av > 0 ? 0 : 1); };
    l.sort((a, b) => peso(a) - peso(b) || (vozAvance(b) - vozAvance(a)) || rec(a, b));
  } else if (o === 'manual') {
    const pos = new Map(_vozAnaquel.manual.map((cid, i) => [cid, i]));
    l.sort((a, b) => {
      const pa = pos.has(a.cid) ? pos.get(a.cid) : Infinity;
      const pb = pos.has(b.cid) ? pos.get(b.cid) : Infinity;
      return pa - pb || rec(a, b);
    });
  } else l.sort(rec);
  return l;
}

function vozAgrupa(lista) {
  const g = _vozAnaquel.grupo;
  if (!g) return [{ clave: '', titulo: '', ic: '', items: lista }];

  /* ⚠️ POR ESTANTE, UN TEXTO SALE EN CADA UNO DE LOS SUYOS, y eso es lo
     que significa tener estantes y no cajones: un ensayo de la maestría
     sobre burocracia está en «Maestría» y en «Burocracia», y enseñarlo
     solo en el primero sería esconderlo del segundo — que es justo el
     montón donde alguien lo iría a buscar. Los que no están en ninguno
     van juntos y al final, para que no desaparezcan. */
  if (g === 'estante') {
    const m = new Map();
    const sueltos = [];
    /* ⚠️ Con un estante FILTRADO, solo sale ese montón. Sin esto, filtrar
       por «Filosofía» enseñaba además el montón «Maestría» —porque el
       mismo texto está en los dos— y la pantalla contestaba a una
       pregunta que nadie hizo. */
    const soloEste = _vozFiltroEst && _vozFiltroEst !== VOZ_SIN_ESTANTE ? vozSinTildes(_vozFiltroEst).toLowerCase() : '';
    lista.forEach(c => {
      const suyos = vozEstantesDe(c);
      if (!suyos.length) { sueltos.push(c); return; }
      suyos.forEach(e => {
        const k = vozSinTildes(e).toLowerCase();
        if (soloEste && k !== soloEste) return;
        if (!m.has(k)) m.set(k, { t: e, items: [] });
        m.get(k).items.push(c);
      });
    });
    const grupos = [...m.values()]
      .sort((a, b) => b.items.length - a.items.length || a.t.localeCompare(b.t, 'es'))
      .map(x => ({ clave: x.t, titulo: '🗂 ' + x.t, ic: '', items: x.items, h: vozColor(x.t) }));
    if (sueltos.length) grupos.push({ clave: '', titulo: '🗂 Sin estante', ic: '', items: sueltos });
    return grupos;
  }

  const m = new Map();
  lista.forEach(c => {
    const clave = g === 'voz' ? ((c.voz || '').trim() || '—') : vozGenero(c.genero).id;
    if (!m.has(clave)) m.set(clave, []);
    m.get(clave).push(c);
  });
  const grupos = [...m.entries()].map(([clave, items]) => {
    if (g === 'voz') return { clave: clave, titulo: '🎭 al modo de ' + clave, ic: '', items: items, h: vozColor(clave) };
    const gen = vozGenero(clave);
    return { clave: clave, titulo: gen.ic + ' ' + gen.pl.charAt(0).toUpperCase() + gen.pl.slice(1), ic: gen.ic, items: items };
  });
  if (g === 'voz') grupos.sort((a, b) => b.items.length - a.items.length || a.clave.localeCompare(b.clave, 'es'));
  else grupos.sort((a, b) => VOZ_GENEROS.findIndex(x => x.id === a.clave) - VOZ_GENEROS.findIndex(x => x.id === b.clave));
  return grupos;
}

function vozRender() {
  const cont = document.getElementById('voz-lista');
  if (!cont) return;
  vozLeeAnaquel();

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
  vozPintarUnificar();

  /* «Sigue leyendo»: lo último que se dejó a medias, arriba y con un
     botón. Es lo primero que hace un lector de libros al abrirse, y lo
     que evita buscar entre treinta fichas el que se estaba leyendo. */
  const hero = document.getElementById('voz-sigue');
  if (hero) {
    hero.textContent = '';
    const c = (_vozBusca.trim() || _vozFiltroVoz || _vozFiltroGen || _vozFiltroEst) ? null : vozEnCurso();
    hero.hidden = !c;
    if (c) hero.appendChild(vozSigueLeyendo(c));
  }

  vozPintarHerramientas();
  /* Y debajo, SOLO lo que esté puesto. Las tres filas de chips de género,
     estante y voz que había aquí se fueron a la hoja que abre 🗂 (regla
     33): lo puesto se ve, lo demás se abre. */
  vozPintarFiltroPuesto();
  vozPintarSelBarra();
  vozPintarAbreAqui();

  const lista = vozOrdena(vozVisibles());
  cont.textContent = '';
  cont.className = 'voz-lista voz-lista-' + _vozAnaquel.vista;

  if (!lista.length) {
    cont.appendChild(vozVacio());
    return;
  }

  const manual = _vozAnaquel.orden === 'manual';
  if (manual) {
    const nota = vozNodo('p', 'voz-orden-nota',
      'Este es tu orden, en este aparato. Arrastra el ⠿ de cada texto para cambiarlo; con el teclado, las flechas.');
    cont.appendChild(nota);
  }
  vozAgrupa(lista).forEach(gr => {
    if (gr.titulo) {
      const h = vozNodo('div', 'voz-grupo-tit');
      if (gr.h != null) h.style.setProperty('--voz-h', String(gr.h));
      h.appendChild(vozNodo('span', 'voz-grupo-lomo'));
      h.appendChild(vozNodo('span', 'voz-grupo-txt', gr.titulo));
      h.appendChild(vozNodo('span', 'voz-grupo-n', gr.items.length === 1 ? '1 texto' : gr.items.length + ' textos'));
      cont.appendChild(h);
    }
    const caja = vozNodo('div', 'voz-grupo voz-grupo-' + _vozAnaquel.vista);
    gr.items.forEach(c => caja.appendChild(vozItem(c, manual)));
    cont.appendChild(caja);
    if (manual) vozMontarArrastre(caja);
  });

  /* ⚠️ Y SI HAY UNA HOJA DE LO COMPARTIDO ABIERTA, SE REPINTA. Llega con
     la aplicación recién abierta, o sea con el anaquel todavía en lo que
     guarda el aparato: sin esto, la lista de lecturas entre las que
     elegir se quedaría con las de antes de que contestara la nube, y un
     texto puesto desde otro aparato no aparecería. */
  if (_vozComp) vozCompPintar();
}

/* ══════════════════════════════════════════════════════════════════
   QUE F.A.R.O ABRA AQUÍ — Y SOLO EN ESTE APARATO
   ══════════════════════════════════════════════════════════════════
   Pedido por el autor el 12 de septiembre de 2026: «quiero que la
   herramienta de La Voz Prestada pueda activarle que al abrir F.A.R.O
   sea lo primero que se presente, tal como está Finanzas, pero que solo
   se active en el dispositivo que uno desee; es decir, que en otros
   dispositivos siga Finanzas como primer acceso».

   Es el mismo interruptor del Apunte rápido (regla 11 de Finanzas) y se
   escribe igual a propósito: mismo tipo de llave, mismo `role="switch"`
   de fila entera, y el mismo respeto por `?view=`. Dos interruptores que
   hacen lo mismo escritos de dos maneras se arreglan en uno y se quedan
   rotos en el otro.

   ⚠️ LA LLAVE ES DEL APARATO, Y ESO ES LA MITAD DE LO QUE SE PIDIÓ. Va en
   `localStorage` y NO en la nube: encenderla en la tableta del autor no
   puede cambiarle la pantalla de entrada a quien en esta casa abre F.A.R.O
   para mirar el saldo. Es la misma razón por la que son del aparato la
   posición de lectura, los ajustes de letra y el orden a mano del anaquel:
   una costumbre de unos ojos no es un dato de la casa.

   ⚠️ Y ES GLOBAL AL APARATO, no de cada presupuesto ni de cada quien: es
   una costumbre de este teléfono, y una llave por contexto obligaría a
   encenderla dos veces —y la segunda no se encuentra nunca—. */
const VOZ_INICIO_KEY = 'faro.voz.abre_aqui';

function vozAbreAqui() {
  try { return localStorage.getItem(VOZ_INICIO_KEY) === '1'; }
  catch (_) { return false; }
}
function vozPonerAbreAqui(v) {
  try { v ? localStorage.setItem(VOZ_INICIO_KEY, '1') : localStorage.removeItem(VOZ_INICIO_KEY); }
  catch (_) {}
}

/* Se dice con PALABRAS lo que va a pasar, y en las DOS posiciones: un
   interruptor con un solo rótulo obliga a encenderlo para averiguar qué
   hace, y quien lo enciende sin querer no sabe qué le cambió. Calcado del
   Apunte rápido. */
function vozPintarAbreAqui() {
  const btn = document.getElementById('voz-abre-aqui');
  const sub = document.getElementById('voz-abre-aqui-sub');
  if (!btn) return;
  const on = vozAbreAqui();
  btn.setAttribute('aria-checked', on ? 'true' : 'false');
  btn.classList.toggle('finq-fijo-on', on);
  if (sub) {
    sub.textContent = on
      ? 'Al abrir F.A.R.O entrarás aquí, en este aparato. En los demás sigue abriendo donde abría.'
      : 'Ahora F.A.R.O abre donde abre siempre, y aquí se llega desde el Acceso Rápido.';
  }
}

function vozAlternarAbreAqui() {
  const on = !vozAbreAqui();
  vozPonerAbreAqui(on);
  vozPintarAbreAqui();
  if (typeof toast === 'function') {
    toast(on ? '📖 F.A.R.O abrirá aquí, solo en este aparato'
             : 'F.A.R.O vuelve a abrir donde abría');
  }
}

/* Al abrir la aplicación desde cero. Lo llama js/auth.js en cuanto la
   sesión queda puesta, que es el único instante en que se sabe que hay
   alguien dentro y que la pantalla ya no es la del login. Devuelve `true`
   si ABRIÓ aquí, para que quien lo llama sepa que el hueco está ocupado y
   no le ponga otra cosa encima.

   ⚠️ UNA DIRECCIÓN CON `?view=` MANDA SIEMPRE, igual que en el Apunte
   rápido: quien toca la notificación de un mensaje del chat quiere el
   chat, y encontrarse un anaquel de ensayos en su lugar es perder el
   mensaje que venía a leer.

   ⚠️ Y ESTO PASA SOLO AL ABRIR, NUNCA AL VOLVER A LA APLICACIÓN. Ahí está
   la diferencia con el Apunte rápido, y no es un olvido: aquel abre una
   HOJA encima de la pantalla en que ya estabas —y solo si estabas en
   Finanzas—, mientras que esto CAMBIA DE PANTALLA. Volver del teclado o de
   otra aplicación y encontrarse que F.A.R.O se llevó por delante el chat a
   medio escribir sería el peor momento posible, que es la lección que ya
   está escrita en `visibilitychange` de Finanzas. */
function faroArranqueVozPrestada() {
  if (!vozAbreAqui()) return false;
  try {
    if (new URLSearchParams(window.location.search).get('view')) return false;
  } catch (_) {}
  if (typeof switchView !== 'function') return false;
  switchView('view-voz');
  return true;
}

/* ══════════════════════════════════════════════════════════════════
   LA BARRA DEL ANAQUEL, Y LA HOJA DE LOS ESTANTES
   ══════════════════════════════════════════════════════════════════
   Rehecho el 12 de septiembre de 2026, con la captura del autor
   delante: «observo una enorme carga cognitiva en estar clasificando o
   categorizando, a mí me gusta como está configurado Google Play Libros
   […] donde de manera vertical se despliegan para ver los anaqueles,
   sin tantas vueltas».

   Y tenía razón, y se podía contar: antes del primer libro había CINCO
   filas de chips —vista, orden, agrupar, género, estante y voz—, todas
   deslizándose a lo ancho. Media pantalla de mandos para llegar a lo que
   se venía a ver, y ninguno contestaba la pregunta con la que uno abre
   un anaquel, que es «¿dónde están mis cosas?».

   ⚠️ LA REGLA QUE LO ORDENA TODO: LO PUESTO SE VE; LO DEMÁS SE ABRE.
   En la barra queda solo la vista, un botón de estantes, uno de orden y
   uno de elegir; debajo, únicamente los filtros que estén PUESTOS, cada
   uno con su equis. Lo demás vive en una hoja que se abre, y dentro va
   EN VERTICAL —una fila por estante, con su cuenta—, que es como se
   miran los estantes de una estantería y como no se miran seis chips
   que se deslizan.

   ⚠️ Y NO CONTRADICE LA REGLA DE LOS CHIPS QUE SE DESLIZAN (la de las
   materias de Videos M.E.T.A.S). Allí el problema era que ocho chips
   ENVUELTOS ocupaban tres renglones y empujaban lo importante fuera de
   la pantalla, y la respuesta fue deslizarlos. Aquí el problema es el
   contrario: son CINCO FILAS de chips, y deslizar cada una no quita ni
   una. Lo que sobra no es el envoltorio: es tenerlas todas a la vez. */

/* Una fila de la hoja: icono, nombre, cuenta y la marca de lo puesto. A
   lo ancho entero y de 44 px, que es un renglón de estantería y no un
   chip que hay que cazar deslizando. */
function vozFilaHoja(icono, texto, cuenta, puesto, alTocar, ayuda) {
  const b = vozBoton('voz-hoja-fila' + (puesto ? ' voz-hoja-on' : ''), null, alTocar, ayuda);
  b.setAttribute('aria-pressed', puesto ? 'true' : 'false');
  b.appendChild(vozNodo('span', 'voz-hoja-ic', icono));
  b.appendChild(vozNodo('span', 'voz-hoja-txt', texto));
  if (cuenta != null) b.appendChild(vozNodo('span', 'voz-hoja-n', String(cuenta)));
  b.appendChild(vozNodo('span', 'voz-hoja-tic', puesto ? '\u2713' : ''));
  return b;
}

function vozAbrirHoja(titulo, pinta) {
  const ov = document.getElementById('voz-anaq-overlay');
  const cuerpo = document.getElementById('voz-anaq-cuerpo');
  const tit = document.getElementById('voz-anaq-tit');
  if (!ov || !cuerpo) return;
  if (tit) tit.textContent = titulo;
  cuerpo.textContent = '';
  pinta(cuerpo);
  ov.style.display = 'flex';
}

function vozCerrarHoja() {
  const ov = document.getElementById('voz-anaq-overlay');
  if (ov) ov.style.display = 'none';
}

/* La hoja de los estantes: los estantes primero —que es a lo que se
   viene—, y debajo el género y la voz, que también son maneras de
   buscar. Todo en vertical y todo con su cuenta. */
function vozHojaEstantes(cuerpo) {
  const total = _vozCuentos.length;
  const elige = (campo, valor) => {
    if (campo === 'est') _vozFiltroEst = valor;
    if (campo === 'gen') _vozFiltroGen = valor;
    if (campo === 'voz') _vozFiltroVoz = valor;
    vozCerrarHoja();
    vozRender();
  };

  cuerpo.appendChild(vozNodo('p', 'voz-hoja-rot', 'ESTANTES'));
  cuerpo.appendChild(vozFilaHoja('\ud83d\udcda', 'Todos los textos', total, !_vozFiltroEst,
    () => elige('est', ''), 'Ver todo el anaquel'));
  const ests = vozEstantesTodos();
  ests.forEach(e => cuerpo.appendChild(vozFilaHoja('\ud83d\uddc2', e.t, e.n, _vozFiltroEst === e.t,
    () => elige('est', e.t), 'Ver el estante «' + e.t + '»')));
  const sinEstante = _vozCuentos.filter(c => !vozEstantesDe(c).length).length;
  if (sinEstante) {
    cuerpo.appendChild(vozFilaHoja('\ud83d\uddc2', 'Sin estante', sinEstante, _vozFiltroEst === VOZ_SIN_ESTANTE,
      () => elige('est', VOZ_SIN_ESTANTE), 'Ver lo que falta por archivar'));
  }
  if (!ests.length) {
    cuerpo.appendChild(vozNodo('p', 'voz-hoja-nota',
      'Todavía no hay estantes. Elige varios textos con el botón de elegir y ponlos en uno, o créalo desde el menú de cualquiera.'));
  }

  const gens = vozGenerosUsados();
  if (gens.length > 1) {
    cuerpo.appendChild(vozNodo('p', 'voz-hoja-rot', 'GÉNERO'));
    cuerpo.appendChild(vozFilaHoja('\ud83d\udcd8', 'Todos los géneros', total, !_vozFiltroGen, () => elige('gen', '')));
    gens.forEach(([g, n]) => cuerpo.appendChild(vozFilaHoja(g.ic, g.t, n, _vozFiltroGen === g.id,
      () => elige('gen', g.id))));
  }

  const voces = vozVoces();
  if (voces.length > 1) {
    cuerpo.appendChild(vozNodo('p', 'voz-hoja-rot', 'VOZ QUE SE IMITA'));
    cuerpo.appendChild(vozFilaHoja('\ud83c\udfad', 'Todas las voces', total, !_vozFiltroVoz, () => elige('voz', '')));
    voces.forEach(([v, n]) => cuerpo.appendChild(vozFilaHoja('\ud83c\udfad', v, n, _vozFiltroVoz === v,
      () => elige('voz', v))));
  }
}

function vozHojaOrden(cuerpo) {
  const pon = (campo, id) => {
    if (campo === 'orden') {
      _vozAnaquel.orden = id;
      if (id === 'manual' && !_vozAnaquel.manual.length) {
        _vozAnaquel.manual = vozOrdena(_vozCuentos.slice()).map(c => c.cid);
      }
    } else _vozAnaquel.grupo = id;
    vozGuardaAnaquel();
    vozCerrarHoja();
    vozRender();
  };
  cuerpo.appendChild(vozNodo('p', 'voz-hoja-rot', 'ORDEN'));
  VOZ_ORDENES.forEach(o => cuerpo.appendChild(vozFilaHoja('\u21c5', o.t, null, _vozAnaquel.orden === o.id,
    () => pon('orden', o.id))));
  cuerpo.appendChild(vozNodo('p', 'voz-hoja-rot', 'AGRUPAR'));
  VOZ_GRUPOS.forEach(g => cuerpo.appendChild(vozFilaHoja('\u25a4', g.t, null, _vozAnaquel.grupo === g.id,
    () => pon('grupo', g.id))));
}

/* ══════════════ ELEGIR VARIOS Y MOVERLOS DE UNA VEZ ══════════════
   La otra mitad de lo que se pidió: «en Play Libros se pueden
   seleccionar varios libros y mandarlos a las categorías hechas». Con
   veintidós textos por archivar, hacerlo de uno en uno son veintidós
   vueltas por el menú de cada uno — y eso es justo la carga que sobraba.

   ⚠️ Y SE ENTRA POR UN BOTÓN, NO SOLO POR UNA PULSACIÓN LARGA. Un gesto
   que sea la única manera de hacer algo es algo que a veces no se puede
   hacer: es la regla del asa de arrastre de la repisa. */
let _vozSel = null;   // null = no se está eligiendo; si no, un Set de cid

function vozSelActiva() { return !!_vozSel; }

function vozSelAlterna(cid) {
  if (!_vozSel) return;
  if (_vozSel.has(cid)) _vozSel.delete(cid); else _vozSel.add(cid);
  vozPintarSelBarra();
  document.querySelectorAll('#voz-lista [data-voz-cid]').forEach(el => {
    el.classList.toggle('voz-elegido', _vozSel.has(el.getAttribute('data-voz-cid')));
  });
}

function vozSelEntrar() { _vozSel = new Set(); vozRender(); }
function vozSelSalir() { _vozSel = null; vozRender(); }

function vozPintarSelBarra() {
  const barra = document.getElementById('voz-sel-barra');
  if (!barra) return;
  barra.textContent = '';
  if (!_vozSel) { barra.hidden = true; document.body.classList.remove('voz-eligiendo'); return; }
  barra.hidden = false;
  document.body.classList.add('voz-eligiendo');
  const n = _vozSel.size;
  barra.appendChild(vozNodo('span', 'voz-sel-n', n === 0 ? 'Toca los textos que quieras mover'
    : (n === 1 ? 'Un texto elegido' : n + ' textos elegidos')));
  const mover = vozBoton('voz-btn voz-btn-pri voz-btn-chico', '\ud83d\uddc2 Mover a un estante',
    () => vozAbrirHoja('\ud83d\uddc2 Mover a un estante', vozHojaMover));
  mover.disabled = n === 0;
  barra.appendChild(mover);
  barra.appendChild(vozBoton('voz-btn voz-btn-chico', 'Salir', () => vozSelSalir(), 'Salir de elegir'));
}

/* La hoja de mover: los estantes en vertical, con la cuenta de cuántos
   de los elegidos están YA en cada uno. Tocar uno los mete a todos; si
   ya estaban todos, los saca. Es el mismo interruptor de siempre
   aplicado a varios a la vez, y así una sola fila sirve para las dos
   cosas.
   ⚠️ Los textos AJENOS no se tocan y se dice: la seguridad por fila los
   rechazaría, y hacer como que se movieron sería prometer algo que la
   base deshace en el siguiente arranque. */
function vozHojaMover(cuerpo) {
  const elegidos = _vozCuentos.filter(c => _vozSel && _vozSel.has(c.cid));
  const mios = elegidos.filter(vozEsMio);
  const ajenos = elegidos.length - mios.length;

  cuerpo.appendChild(vozNodo('p', 'voz-hoja-nota',
    (mios.length === 1 ? 'Un texto elegido' : mios.length + ' textos elegidos') +
    '. Toca un estante para meterlos; si ya están todos, los saca.'));
  if (ajenos) {
    cuerpo.appendChild(vozNodo('p', 'voz-hoja-aviso',
      (ajenos === 1 ? 'Uno de los elegidos lo puso' : ajenos + ' de los elegidos los puso') +
      ' otra persona de la casa: esos no se pueden mover.'));
  }

  const aplica = (nombre) => {
    const dentro = mios.filter(c => vozEnEstante(c, nombre)).length;
    const quitar = dentro === mios.length && mios.length > 0;
    let tocados = 0;
    mios.forEach(c => {
      const l = vozEstantesDe(c);
      const i = l.findIndex(e => vozSinTildes(e).toLowerCase() === vozSinTildes(nombre).toLowerCase());
      if (quitar) { if (i < 0) return; l.splice(i, 1); }
      else { if (i >= 0) return; if (l.length >= VOZ_EST_MAX) return; l.push(nombre); }
      tocados++;
      vozGuardaEstantes(c, l);
    });
    vozAviso(quitar ? 'Sacados de «' + nombre + '»'
                    : (tocados === 1 ? 'Un texto' : tocados + ' textos') + ' en «' + nombre + '»');
    vozAbrirHoja('\ud83d\uddc2 Mover a un estante', vozHojaMover);
  };

  cuerpo.appendChild(vozNodo('p', 'voz-hoja-rot', 'ESTANTES'));
  vozEstantesTodos().forEach(e => {
    const dentro = mios.filter(c => vozEnEstante(c, e.t)).length;
    cuerpo.appendChild(vozFilaHoja('\ud83d\uddc2', e.t,
      dentro ? dentro + '/' + mios.length : null,
      dentro === mios.length && mios.length > 0,
      () => aplica(e.t)));
  });

  /* Crear uno nuevo aquí mismo: si hubiera que salir a crearlo, la
     selección se perdería por el camino. */
  const nuevo = vozNodo('div', 'voz-est-nuevo');
  const inp = vozNodo('input', 'voz-est-in');
  inp.type = 'text';
  inp.maxLength = VOZ_EST_LARGO;
  inp.placeholder = 'Un estante nuevo…';
  inp.setAttribute('aria-label', 'Crear un estante nuevo');
  const crea = () => {
    const t = inp.value.replace(/\s+/g, ' ').trim().slice(0, VOZ_EST_LARGO);
    if (!t) return;
    inp.value = '';
    aplica(t);
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); crea(); } });
  nuevo.appendChild(inp);
  nuevo.appendChild(vozBoton('voz-btn voz-btn-chico', '+ Crear y mover', crea));
  cuerpo.appendChild(nuevo);
}

/* Los filtros PUESTOS, cada uno con su equis. Es lo único que queda a la
   vista de las cinco filas de antes, y se esconde entero cuando no hay
   ninguno. */
function vozPintarFiltroPuesto() {
  const caja = document.getElementById('voz-filtro-puesto');
  if (!caja) return;
  caja.textContent = '';
  const puestos = [];
  if (_vozFiltroEst) puestos.push(['\ud83d\uddc2 ' + (_vozFiltroEst === VOZ_SIN_ESTANTE ? 'Sin estante' : _vozFiltroEst),
    () => { _vozFiltroEst = ''; vozRender(); }]);
  if (_vozFiltroGen) puestos.push([vozGenero(_vozFiltroGen).ic + ' ' + vozGenero(_vozFiltroGen).t,
    () => { _vozFiltroGen = ''; vozRender(); }]);
  if (_vozFiltroVoz) puestos.push(['\ud83c\udfad ' + _vozFiltroVoz, () => { _vozFiltroVoz = ''; vozRender(); }]);
  if (_vozAnaquel.grupo) {
    const g = VOZ_GRUPOS.find(x => x.id === _vozAnaquel.grupo);
    if (g) puestos.push(['\u25a4 ' + g.t, () => { _vozAnaquel.grupo = ''; vozGuardaAnaquel(); vozRender(); }]);
  }
  caja.hidden = !puestos.length;
  puestos.forEach(([txt, quita]) => {
    const b = vozBoton('voz-puesto', null, quita, 'Quitar «' + txt + '»');
    b.appendChild(vozNodo('span', null, txt));
    b.appendChild(vozNodo('span', 'voz-puesto-x', '\u2715'));
    caja.appendChild(b);
  });
}

function vozPintarHerramientas() {
  const caja = document.getElementById('voz-herr');
  if (!caja) return;
  caja.textContent = '';

  /* ⚠️ LOS TRES BOTONES VAN PRIMERO Y LAS VISTAS AL FINAL, y no es
     gusto: la barra se desliza, así que lo último es lo que se sale de
     la pantalla. Puestas las vistas delante —que fue como nació— ☑
     Elegir caía fuera del borde derecho EN TODOS los teléfonos
     (medido: 435 px de mandos en una caja de 280 a 390), o sea que la
     mitad de lo que se pidió este día no se veía sin deslizar una barra
     que no parece deslizarse. Y de las cuatro cosas, la vista es la que
     se toca una vez al mes; los estantes, cada vez. Además es donde las
     pone Play Libros: el nombre y las acciones a la izquierda, el
     cambio de vista a la derecha. */
  caja.appendChild(vozBoton('voz-btn voz-btn-chico voz-herr-btn', '\ud83d\uddc2 Estantes',
    () => vozAbrirHoja('\ud83d\uddc2 Estantes', vozHojaEstantes), 'Ver los estantes, los géneros y las voces'));
  caja.appendChild(vozBoton('voz-btn voz-btn-chico voz-herr-btn', '\u21c5 Orden',
    () => vozAbrirHoja('\u21c5 Orden del anaquel', vozHojaOrden), 'Cambiar el orden y la agrupación'));
  caja.appendChild(vozBoton('voz-btn voz-btn-chico voz-herr-btn' + (vozSelActiva() ? ' voz-herr-on' : ''),
    vozSelActiva() ? '\u2715 Salir' : '\u2611 Elegir',
    () => (vozSelActiva() ? vozSelSalir() : vozSelEntrar()),
    'Elegir varios textos para moverlos de una vez'));

  const vistas = vozNodo('div', 'voz-vistas');
  vistas.setAttribute('role', 'group');
  vistas.setAttribute('aria-label', 'Vista del anaquel');
  VOZ_VISTAS.forEach(v => {
    const b = vozBoton('voz-vista' + (_vozAnaquel.vista === v.id ? ' voz-vista-on' : ''), v.ic, () => {
      _vozAnaquel.vista = v.id; vozGuardaAnaquel(); vozRender();
    }, 'Ver en ' + v.t.toLowerCase());
    b.setAttribute('aria-pressed', _vozAnaquel.vista === v.id ? 'true' : 'false');
    vistas.appendChild(b);
  });
  caja.appendChild(vistas);
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
  const quedan = Math.max(0, (vozPalabras(c.capitulos) || c.palabras || 0) - vozLeido(c, pos));
  const datos = ['Vas por el ' + av + ' %'];
  if (caps > 1) datos.push('cap. ' + ((pos.cap || 0) + 1) + ' de ' + caps);
  datos.push('quedan ≈ ' + vozMinutos(quedan) + ' min');
  if (pos.cuando) datos.push(vozHace(pos.cuando));
  card.appendChild(vozNodo('div', 'voz-sigue-meta', datos.join(' · ')));
  card.appendChild(vozBoton('voz-btn voz-btn-pri voz-sigue-btn', '📖 Continuar', () => vozAbrirLector(c.cid)));
  return card;
}

/* Un texto en la vista que toque. Todos llevan `data-voz-cid`, que es
   la llave con la que el arrastre los reconoce en el documento, y el
   asa ⠿ solo en el orden manual. */
function vozItem(c, manual) {
  /* Eligiendo, no hay asa: el dedo está para marcar, no para arrastrar,
     y dos gestos sobre la misma tarjeta se pisan. */
  if (vozSelActiva()) manual = false;
  const el = _vozAnaquel.vista === 'cuadricula' ? vozPortadaMini(c)
           : _vozAnaquel.vista === 'lista' ? vozFila(c)
           : vozFicha(c);
  el.setAttribute('data-voz-cid', c.cid);
  if (vozSelActiva()) {
    el.classList.add('voz-elegible');
    if (_vozSel.has(c.cid)) el.classList.add('voz-elegido');
  }
  if (manual) {
    const asa = vozBoton('voz-asa', '⠿', null, 'Mover «' + (c.titulo || 'este texto') + '»: arrastra, o usa las flechas del teclado');
    asa.setAttribute('data-voz-asa', '1');
    el.appendChild(asa);
    el.classList.add('voz-con-asa');
  }
  return el;
}

/* La etiqueta, tal como va en las tres vistas: la voz imitada y la
   máquina, siempre las dos. */
function vozEtiquetaNodo(c) {
  const et = vozNodo('div', 'voz-etiqueta');
  et.appendChild(vozNodo('span', 'voz-et-voz', '🎭 al modo de ' + (c.voz || '—')));
  et.appendChild(vozNodo('span', 'voz-et-maq', '🤖 ' + (c.maquina || '—')));
  return et;
}

function vozBotonLeer(c, clase) {
  const av = vozAvance(c);
  return vozBoton(clase || 'voz-btn voz-btn-pri',
    av > 0 && av < 100 ? '📖 Seguir leyendo' : (av >= 100 ? '📖 Releer' : '📖 Leer'),
    () => vozAbrirLector(c.cid));
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
  cuerpo.appendChild(vozNodo('h3', 'voz-ficha-tit', c.titulo || 'Sin título'));

  /* ⚠️ LA ETIQUETA. Va aquí, en la portada del anaquel, antes que
     ninguna otra cosa del texto, y con las dos mitades: la voz que se
     imita y la máquina que escribió. Ver la cabecera del archivo. */
  cuerpo.appendChild(vozEtiquetaNodo(c));

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
  pie.appendChild(vozBotonLeer(c));
  pie.appendChild(vozBoton('voz-btn', '📋', () => vozCopiar(c), 'Copiar el texto con su etiqueta'));
  if (navigator.share) {
    pie.appendChild(vozBoton('voz-btn', '📤', () => vozCompartir(c), 'Compartir el texto con su etiqueta'));
  }

  /* ⚠️ Corregir y retirar SOLO se ofrecen en lo propio. Lo impide de
     verdad la seguridad por fila, no esta línea; pero enseñar un botón
     que la base va a rechazar es prometer algo que no se puede hacer, y
     el que lo toca se queda pensando que la aplicación falló. Y el que
     no se ofrece lo DICE al tocarlo, en vez de quedarse mudo. */
  const mio = vozEsMio(c);
  const nAct = vozActCuenta(c.cid);
  const tocan = nAct ? vozActResumen(c.cid).tocan : 0;
  const taller = vozBoton('voz-btn voz-ficha-taller' + (tocan ? ' voz-ficha-taller-hoy' : ''), '📝',
    () => vozActAbrirTaller(c.cid),
    nAct ? ('Taller de comprensión: ' + nAct + (tocan ? ', ' + tocan + ' tocan hoy' : '')) : 'Montar el taller de comprensión de este texto');
  if (nAct) taller.appendChild(vozNodo('span', 'voz-ficha-taller-n', String(tocan || nAct)));
  pie.appendChild(taller);

  const edit = vozBoton('voz-btn', '✏️', mio ? () => vozAbrirPegar(c) : () => vozAvisoAjeno(c),
    mio ? 'Corregir la ficha' : 'Lo puso otra persona de la casa');
  edit.classList.toggle('voz-btn-apagado', !mio);
  pie.appendChild(edit);
  if (mio) pie.appendChild(vozBotonRetirar(c, 'voz-btn'));
  else pie.appendChild(vozBoton('voz-btn voz-btn-apagado', '🗑', () => vozAvisoAjeno(c), 'Lo puso otra persona de la casa'));

  cuerpo.appendChild(pie);
  card.appendChild(cuerpo);
  return card;
}

function vozAvisoAjeno(c) {
  vozAviso('✋ «' + (c.titulo || 'Este texto') + '» lo puso otra persona de la casa: solo ella puede corregirlo o retirarlo');
}

/* La vista de lista: una fila por texto, con lo justo para reconocerlo
   y un ⋯ con todo lo demás. Tocar la fila abre la sala. */
function vozFila(c) {
  const g = vozGenero(c.genero);
  const fila = vozNodo('div', 'voz-fila');
  fila.style.setProperty('--voz-h', String(vozColor(c.voz)));
  const abrir = vozBoton('voz-fila-abrir', null, () => vozAbrirLector(c.cid));
  const lomo = vozNodo('span', 'voz-fila-lomo', (c.titulo || '?').trim().charAt(0).toUpperCase());
  abrir.appendChild(lomo);
  const txt = vozNodo('span', 'voz-fila-txt');
  txt.appendChild(vozNodo('span', 'voz-fila-tit', c.titulo || 'Sin título'));
  const av = vozAvance(c);
  txt.appendChild(vozNodo('span', 'voz-fila-meta',
    g.ic + ' ' + g.t + ' · 🎭 ' + (c.voz || '—') + ' · 🤖 ' + (c.maquina || '—') + ' · ≈ ' + vozMinutos(c.palabras) + ' min' +
    (av >= 100 ? ' · ✓ leído' : (av > 0 ? ' · ' + av + ' %' : ''))));
  abrir.appendChild(txt);
  if (av > 0) {
    const barra = vozNodo('span', 'voz-avance voz-fila-avance');
    const dentro = vozNodo('span', 'voz-avance-in');
    dentro.style.width = av + '%';
    barra.appendChild(dentro);
    txt.appendChild(barra);
  }
  fila.appendChild(abrir);
  fila.appendChild(vozBoton('voz-btn voz-fila-mas', '⋯', () => vozMenuAbrir(c), 'Más opciones de «' + (c.titulo || 'este texto') + '»'));
  return fila;
}

/* La cuadrícula: portadas, como una estantería vista de frente. El
   color es el de la voz, así que los textos «al modo de» la misma
   persona se ven juntos aunque no estén agrupados. */
function vozPortadaMini(c) {
  const g = vozGenero(c.genero);
  const caja = vozNodo('div', 'voz-portada-mini');
  caja.style.setProperty('--voz-h', String(vozColor(c.voz)));
  const abrir = vozBoton('voz-portada-mini-abrir', null, () => vozAbrirLector(c.cid));
  abrir.setAttribute('aria-label', 'Leer «' + (c.titulo || 'Sin título') + '», al modo de ' + (c.voz || '—'));
  const tapa = vozNodo('span', 'voz-tapa');
  tapa.appendChild(vozNodo('span', 'voz-tapa-gen', g.ic + ' ' + g.t));
  tapa.appendChild(vozNodo('span', 'voz-tapa-tit', c.titulo || 'Sin título'));
  tapa.appendChild(vozNodo('span', 'voz-tapa-voz', 'al modo de ' + (c.voz || '—')));
  tapa.appendChild(vozNodo('span', 'voz-tapa-maq', '🤖 ' + (c.maquina || '—')));
  const av = vozAvance(c);
  const barra = vozNodo('span', 'voz-tapa-avance');
  const dentro = vozNodo('span', 'voz-tapa-avance-in');
  dentro.style.width = av + '%';
  barra.appendChild(dentro);
  tapa.appendChild(barra);
  abrir.appendChild(tapa);
  caja.appendChild(abrir);
  caja.appendChild(vozBoton('voz-portada-mini-mas', '⋯', () => vozMenuAbrir(c), 'Más opciones de «' + (c.titulo || 'este texto') + '»'));
  return caja;
}

/* El menú de un texto (⋯), para la lista y la cuadrícula, donde no
   caben los botones. Es una hoja como la de pegar, con las mismas
   opciones que la ficha de detalle, y retirar con su confirmación. */
let _vozMenuDe = null;

function vozMenuAbrir(c) {
  const ov = document.getElementById('voz-menu-overlay');
  const cuerpo = document.getElementById('voz-menu-cuerpo');
  const tit = document.getElementById('voz-menu-tit');
  if (!ov || !cuerpo) return;
  _vozMenuDe = c.cid;
  if (tit) tit.textContent = c.titulo || 'Sin título';
  cuerpo.textContent = '';
  cuerpo.appendChild(vozEtiquetaNodo(c));
  const g = vozGenero(c.genero);
  const av = vozAvance(c);
  cuerpo.appendChild(vozNodo('p', 'voz-menu-meta',
    g.ic + ' ' + g.t + ' · ' + (c.palabras || 0).toLocaleString('es-HN') + ' palabras · ≈ ' + vozMinutos(c.palabras) + ' min' +
    (av >= 100 ? ' · ✓ leído' : (av > 0 ? ' · vas por el ' + av + ' %' : ''))));
  if (c.encargo) cuerpo.appendChild(vozNodo('p', 'voz-menu-enc', '« ' + c.encargo + ' »'));

  /* ⚠️ LOS ESTANTES SE PONEN AQUÍ MISMO, y se guardan al tocarlos. Sin
     esto, archivar los veintiún textos que ya estaban serían veintiuna
     vueltas por la hoja de corregir —que además devuelve el ensayo
     entero a un recuadro— para tocar un chip. */
  if (vozEsMio(c)) {
    const caja = vozNodo('div', 'voz-menu-est');
    cuerpo.appendChild(caja);
    vozPintarEstantes(caja, () => vozEstantesDe(c), l => vozGuardaEstantes(c, l));
  }

  const lista = vozNodo('div', 'voz-menu-lista');
  const leer = vozBotonLeer(c, 'voz-btn voz-btn-pri voz-btn-ancho');
  leer.addEventListener('click', vozCerrarMenu);
  lista.appendChild(leer);
  const nA = vozActCuenta(c.cid);
  const tA = nA ? vozActResumen(c.cid).tocan : 0;
  lista.appendChild(vozBoton('voz-btn voz-btn-ancho',
    nA ? ('📝 Taller de comprensión · ' + nA + (tA ? ' · ⏰ ' + tA + ' hoy' : '')) : '📝 Montar el taller de comprensión',
    () => { vozCerrarMenu(); vozActAbrirTaller(c.cid); }));
  /* Los recursos VIVEN en la sala, así que desde aquí se entra a ellos
     en vez de abrirse una hoja: la hoja cuelga dentro de #voz-lector y
     con la sala cerrada no se vería nada (regla 35). El botón solo sale
     cuando hay alguno; ponerlos es la pestaña 🔗 de dentro. */
  const nRec = vozRecCuenta(c.cid);
  if (nRec) {
    lista.appendChild(vozBoton('voz-btn voz-btn-ancho',
      '🔗 ' + (nRec === 1 ? 'Un recurso de refuerzo' : nRec + ' recursos de refuerzo'),
      () => {
        vozCerrarMenu();
        vozAbrirLector(c.cid);
        vozPintarPanelInd('recs');
        vozAbrirPanel('voz-panel-ind');
      }));
  }
  lista.appendChild(vozBoton('voz-btn voz-btn-ancho', '📋 Copiar con su etiqueta', () => { vozCerrarMenu(); vozCopiar(c); }));
  if (navigator.share) lista.appendChild(vozBoton('voz-btn voz-btn-ancho', '📤 Compartir con su etiqueta', () => { vozCerrarMenu(); vozCompartir(c); }));
  if (vozEsMio(c)) {
    lista.appendChild(vozBoton('voz-btn voz-btn-ancho', '✏️ Corregir la ficha o el texto', () => { vozCerrarMenu(); vozAbrirPegar(c); }));
    lista.appendChild(vozBotonRetirar(c, 'voz-btn voz-btn-ancho', '🗑 Retirar del anaquel'));
  } else {
    lista.appendChild(vozNodo('p', 'voz-menu-nota',
      '✋ Lo puso otra persona de la casa: solo ella puede corregirlo o retirarlo. Tú puedes leerlo, copiarlo y compartirlo.'));
  }
  cuerpo.appendChild(lista);
  ov.style.display = 'flex';
}

/* Guarda los estantes de un texto al momento y los sube por el camino
   de siempre. Sin `await` en el toque: la fila se repinta ya y la nube
   se entera cuando pueda, que es lo que deja archivar diez textos
   seguidos sin esperar a nada. */
function vozGuardaEstantes(c, lista) {
  c.estantes = lista;
  c.actualizado = Date.now();
  vozGuardaLocal();
  vozRender();
  vozSubir(c).then(res => {
    if (res.ok) return;
    if (res.motivo === 'sin-senal') vozAviso('🗂 Guardado aquí. Subirá solo la próxima vez que abras esto');
    else if (res.motivo === 'sin-nube') vozAviso('🗂 Guardado aquí. Falta correr voz_prestada.sql para que viaje');
    else if (res.motivo === 'sin-sesion') vozAviso('🗂 Guardado aquí. Entra en F.A.R.O para que viaje');
  });
}

function vozCerrarMenu() {
  const ov = document.getElementById('voz-menu-overlay');
  if (ov) ov.style.display = 'none';
  _vozMenuDe = null;
}

/* ══════════════ MOVER LOS TEXTOS CON EL DEDO ══════════════
   Con PUNTEROS y no con el `draggable` del navegador: ese es de ratón y
   en el navegador de casi ninguna tableta existe. Es el mismo aparato
   que mueve las tarjetas de la repisa de enlaces y los videos de
   M.E.T.A.S, con las mismas cuatro reglas: el asa es un botón y las
   flechas del teclado la mueven; `touch-action: none` en el asa; al
   soltar NO se repinta (la lista ya está en el orden bueno: solo se
   guarda); y la nota que lo explica va FUERA del contenedor que
   arrastra. Aquí hay una quinta, por la cuadrícula: la mitad que hay
   que cruzar es la de la IZQUIERDA cuando el dedo va por la misma fila
   de portadas, y la de ARRIBA cuando cambia de fila. */
function vozMontarArrastre(caja) {
  if (caja.dataset.vozArrastre) return;
  caja.dataset.vozArrastre = '1';
  let nodo = null, idPuntero = null;
  const items = () => [...caja.querySelectorAll(':scope > [data-voz-cid]')];

  const guardar = () => {
    /* El orden entero, leyendo TODOS los contenedores del anaquel en el
       orden en que están (con agrupación hay varios): lo que se arrastró
       dentro de un grupo queda en su sitio y lo demás se conserva. */
    const todos = [...document.querySelectorAll('#voz-lista [data-voz-cid]')].map(n => n.getAttribute('data-voz-cid'));
    const resto = _vozAnaquel.manual.filter(cid => todos.indexOf(cid) < 0);
    _vozAnaquel.manual = todos.concat(resto);
    vozGuardaAnaquel();
  };

  const soltar = () => {
    if (!nodo) return;
    nodo.classList.remove('voz-arrastrando');
    caja.classList.remove('voz-moviendo');
    nodo = null; idPuntero = null;
    guardar();
  };

  caja.addEventListener('pointerdown', ev => {
    const asa = ev.target.closest('[data-voz-asa]');
    if (!asa) return;
    const item = asa.closest('[data-voz-cid]');
    if (!item || item.parentNode !== caja) return;
    ev.preventDefault();
    nodo = item; idPuntero = ev.pointerId;
    nodo.classList.add('voz-arrastrando');
    caja.classList.add('voz-moviendo');
    try { asa.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  caja.addEventListener('pointermove', ev => {
    if (!nodo || ev.pointerId !== idPuntero) return;
    ev.preventDefault();
    const bajo = document.elementFromPoint(ev.clientX, ev.clientY);
    const destino = bajo && bajo.closest ? bajo.closest('[data-voz-cid]') : null;
    if (!destino || destino === nodo || destino.parentNode !== caja) return;
    const r = destino.getBoundingClientRect();
    const mismaFila = ev.clientY >= r.top && ev.clientY <= r.bottom && _vozAnaquel.vista === 'cuadricula';
    const antes = mismaFila ? (ev.clientX < r.left + r.width / 2) : (ev.clientY < r.top + r.height / 2);
    caja.insertBefore(nodo, antes ? destino : destino.nextSibling);
  });
  caja.addEventListener('pointerup', soltar);
  caja.addEventListener('pointercancel', soltar);

  caja.addEventListener('keydown', ev => {
    const asa = ev.target.closest ? ev.target.closest('[data-voz-asa]') : null;
    if (!asa) return;
    const dir = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[ev.key];
    if (!dir) return;
    ev.preventDefault();
    const item = asa.closest('[data-voz-cid]');
    const hermanos = items();
    const i = hermanos.indexOf(item);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= hermanos.length) return;
    caja.insertBefore(dir < 0 ? item : hermanos[j], dir < 0 ? hermanos[j] : item);
    asa.focus();
    guardar();
  });
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

   ⚠️ Y HAY UN SEGUNDO MODO, EL DESPLAZAMIENTO, pedido por el autor el 10
   de septiembre de 2026 («leer deslizando para abajo»). Ahí el texto va
   ENTERO y seguido —todos los capítulos, uno detrás de otro— en una
   caja que se desplaza hacia abajo, sin columnas. Es lo que muchos
   prefieren para un ensayo, y es también lo que hay que ofrecer cuando
   el gesto de pasar página no sale. La posición se guarda igual que en
   páginas: por bloque y fracción, nunca por píxeles de desplazamiento,
   que cambian con la letra igual que cambian las páginas.

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
let _vozScrollTimer = null;
let _vozArrastre = null;
let _vozTragarClic = false;
let _vozM = 24;       // el margen de la izquierda de la hoja, puesto por vozPaginar
let _vozPaso = 0;     // lo que se desplaza por página
let _vozCols = 1;     // columnas por página: 1, o 2 en pantalla ancha
let _vozLuz = null;   // el permiso de «no apagar la pantalla»
let _vozRuedaHasta = 0;
let _vozPanelTab = 'ind';
let _vozBuscaTxt = '';
let _vozVuelta = null;   // la hoja que se está pasando (modo «hojear»)
let _vozToqueUltimo = 0; // el reloj del toque anterior del centro (modo desnudo)
let _vozToqueFreno = 0;  // tras alternar las barras, un respiro que se traga el toque de más

function vozModo() {
  return _vozAj.modo === 'scroll' ? 'scroll' : 'paginas';
}

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
  vozSubCerrarBarra();
  /* El índice de fuentes y lo que se eligió para cada tabla son de
     ESTE texto: heredarlos del anterior enseñaría la bibliografía de
     otro ensayo pegada a las llamadas de este. */
  vozOlvidaFuentes();
  _vozVistaTabla = {};

  sala.hidden = false;
  /* La sala abre SIEMPRE con sus barras: el modo desnudo es de cada
     lectura, no un estado que se hereda de la anterior. */
  sala.classList.remove('voz-desnudo');
  const full = document.getElementById('voz-l-full');
  if (full) {
    full.hidden = !vozPuedePantallaCompleta();
    full.setAttribute('aria-pressed', vozEnPantallaCompleta() ? 'true' : 'false');
  }
  document.body.classList.add('voz-sala');
  vozCargarLetras();
  vozActSincronizar(cid);
  vozAplicaAjustes();
  vozPintarBarraMarcas();
  vozPintarCap(_vozAncla, _vozSub);   // −1 al abrir un texto nuevo: la portada
  vozEngancharSala();
  vozLuz(true);
  vozSubSincronizar(cid);
  vozRecSincronizar(cid);
}

function vozCerrarLector() {
  const sala = document.getElementById('voz-lector');
  if (sala) sala.hidden = true;
  document.body.classList.remove('voz-sala');
  vozCerrarPaneles();
  vozSubCerrarBarra();
  vozCitCerrar();
  vozTablonCerrar();
  /* Y el video, que si no se queda sonando detrás del anaquel. */
  vozRecCerrarVideo();
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
  sala.classList.toggle('voz-modo-scroll', vozModo() === 'scroll');
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
   textContent; los únicos atributos que se escriben son `data-vp` y
   `data-cap`, y son números que ponemos nosotros. Al final se le pintan
   encima los subrayados que tenga (ver vozAplicarSubrayados). */
function vozNodoBloque(p, i, anterior, cap) {
  let el;
  if (p.k === 'sep') {
    el = vozNodo('div', 'voz-sep', '✦');
  } else if (p.k === 'h3') {
    el = vozNodo('h3', 'voz-sub');
    vozPintaTexto(el, p.t);
  } else if (p.k === 'cita') {
    el = vozNodo('blockquote', 'voz-cita');
    vozPintaCuerpo(el, p.t);
  } else if (p.k === 'verso') {
    el = vozNodo('div', 'voz-verso');
    vozPintaCuerpo(el, p.t);
  } else if (p.k === 'li') {
    el = vozNodo('div', 'voz-li' + (anterior && anterior.k === 'li' ? '' : ' voz-li-primero'));
    el.appendChild(vozNodo('span', 'voz-li-marca', p.n != null ? p.n + '.' : '•'));
    const t = vozNodo('span', 'voz-li-txt');
    vozPintaCuerpo(t, p.t);
    el.appendChild(t);
  } else if (p.k === 'tabla') {
    el = vozNodoTabla(p, i, cap);
  } else if (p.k === 'fuente') {
    el = vozNodoFuente(p, cap, i);
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
    vozPintaCuerpo(el, p.t);
  }
  el.dataset.vp = String(i);
  el.dataset.cap = String(cap || 0);
  if (_vozLeyendo && p.k !== 'sep' && p.k !== 'fin' && p.k !== 'tabla') vozAplicarSubrayados(el, _vozLeyendo.cid, cap || 0, i);
  return el;
}


/* ══════════════════════════════════════════════════════════════════
   LAS LLAMADAS A FUENTES, PINTADAS
   ══════════════════════════════════════════════════════════════════ */

/* Lo mismo que `vozPintaTexto`, más las llamadas a fuentes convertidas
   en botones. Va aparte porque `vozPintaTexto` la usan también sitios
   donde una llamada NO se toca —el índice, los extractos del buscador,
   la ficha del anaquel—, y porque así el orden queda escrito en un solo
   sitio: el texto se pinta primero ENTERO, con sus cursivas, y las
   llamadas se le ponen encima después.

   ⚠️ Y EL BOTÓN LLEVA DENTRO EL TEXTO TAL CUAL SE ESCRIBIÓ: «[3]» o
   «(Harari, 2014, p. 45)», sin quitar ni una coma. Eso no es estética:
   es lo que hace que el texto plano del bloque siga siendo EXACTAMENTE
   el mismo de antes, y por tanto que los subrayados ya puestos —que se
   guardan por desplazamiento de caracteres sobre ese texto— no se
   muevan ni un carácter al estrenar esto. Un marcador que cambiara
   «[3]» por «³» desplazaría todos los subrayados del párrafo, sin
   error y sin aviso. */
function vozPintaCuerpo(nodo, t) {
  vozPintaTexto(nodo, t);
  vozCitasEn(nodo, _vozLeyendo ? vozIndiceFuentes(_vozLeyendo) : null);
}

function vozCitasEn(cont, idx) {
  if (!cont || !idx || !idx.lista.length) return;
  const nodos = [];
  const w = document.createTreeWalker(cont, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) nodos.push(n);
  nodos.forEach(nodo => {
    const s = nodo.nodeValue;
    if (!s || (s.indexOf('(') < 0 && s.indexOf('[') < 0 && !/[¹²³⁰⁴-⁹]/.test(s))) return;
    if (nodo.parentElement && nodo.parentElement.closest('.voz-cit')) return;
    const ll = vozLlamadasEn(s, idx).res;
    if (!ll.length) return;
    const frag = document.createDocumentFragment();
    let k = 0;
    ll.forEach(x => {
      if (x.i > k) frag.appendChild(document.createTextNode(s.slice(k, x.i)));
      frag.appendChild(vozNodoLlamada(x));
      k = x.f;
    });
    if (k < s.length) frag.appendChild(document.createTextNode(s.slice(k)));
    if (nodo.parentNode) nodo.parentNode.replaceChild(frag, nodo);
  });
}

/* ⚠️ Y LA LLAMADA ES UN `span`, NO UN `button`, aunque se comporte como
   uno. Un botón es una caja: «(Harari, 2014, p. 45)» al final de un
   renglón NO SE PARTE, así que en un texto justificado abre un hueco
   blanco de media línea, y en una columna estrecha se sale por el
   borde. Un `span` se parte como cualquier palabra. Lleva `role` y
   `tabindex` para que siga siendo un botón para quien no usa el dedo,
   que es lo mismo que ya hacen las marcas de subrayado de esta sala. */
function vozNodoLlamada(x) {
  const b = vozNodo('span', 'voz-cit ' + (x.n != null ? 'voz-cit-n' : 'voz-cit-ap'), x.t);
  b.dataset.fids = x.fuentes.map(f => f.fid).join(',');
  b.tabIndex = 0;
  b.setAttribute('role', 'button');
  b.setAttribute('aria-label', 'Consultar la fuente: ' + String(x.fuentes[0].t || '').slice(0, 90));
  return b;
}

/* ─── La ficha de la fuente ────────────────────────────────────────
   ⚠️ CONSULTAR UNA FUENTE NO MUEVE LA LECTURA. Sale ENCIMA, pegada a la
   llamada, como la barra de subrayar, y al cerrarla uno sigue en la
   misma frase. Llevar al lector hasta la bibliografía y devolverlo es,
   en un lector paginado, perder la página —y es exactamente lo que el
   autor pidió que no pasara: «consultarlas DESDE el formato de la
   lectura»—. Vive DENTRO de la sala, así que se tiñe con el papel
   puesto: una ficha blanca saliendo de noche deslumbra justo al leer a
   oscuras. */
function vozCitBarra() {
  let b = document.getElementById('voz-citbar');
  if (b) return b;
  const sala = document.getElementById('voz-lector');
  if (!sala) return null;
  b = vozNodo('div', 'voz-citbar');
  b.id = 'voz-citbar';
  b.hidden = true;
  b.setAttribute('role', 'dialog');
  b.setAttribute('aria-label', 'La fuente citada');
  sala.appendChild(b);
  return b;
}

function vozCitAbierta() {
  const b = document.getElementById('voz-citbar');
  return !!(b && !b.hidden);
}

function vozCitCerrar() {
  const b = document.getElementById('voz-citbar');
  if (b) b.hidden = true;
}

function vozCitAbrirBtn(btn) {
  const c = _vozLeyendo;
  if (!c || !btn) return;
  const idx = vozIndiceFuentes(c);
  const fids = String(btn.dataset.fids || '').split(',').filter(Boolean);
  const fuentes = fids.map(id => idx.lista.find(f => f.fid === id)).filter(Boolean);
  if (!fuentes.length) return;
  vozCitAbrir(fuentes, btn.getBoundingClientRect());
}

function vozCitAbrir(fuentes, caja) {
  const b = vozCitBarra();
  if (!b) return;
  vozSubCerrarBarra();
  b.textContent = '';

  const cab = vozNodo('div', 'voz-citbar-cab');
  cab.appendChild(vozNodo('span', 'voz-citbar-rot',
    fuentes.length > 1 ? fuentes.length + ' fuentes' : 'La fuente'));
  cab.appendChild(vozBoton('voz-citbar-x', '✕', () => vozCitCerrar(), 'Cerrar'));
  b.appendChild(cab);

  fuentes.forEach(f => {
    const fila = vozNodo('div', 'voz-citbar-f');
    fila.appendChild(vozNodo('span', 'voz-citbar-n', f.n != null ? String(f.n) : '❧'));
    const cuerpo = vozNodo('div', 'voz-citbar-cuerpo');
    const t = vozNodo('p', 'voz-citbar-t');
    /* Con `vozPintaTexto` y no con `vozPintaCuerpo`: dentro de una
       ficha de fuente, el «(2014)» de la propia entrada no es una
       llamada a nada. */
    vozPintaTexto(t, f.t);
    cuerpo.appendChild(t);
    const acc = vozNodo('div', 'voz-citbar-acc');
    /* ⚠️ La dirección ya vino comprobada con `URL()` desde el lector, y
       se pone con `setAttribute`: nunca interpolada en un atributo. */
    if (f.url) {
      const a = vozNodo('a', 'voz-citbar-ir', '🔗 Abrir la fuente');
      a.setAttribute('href', f.url);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      acc.appendChild(a);
    }
    acc.appendChild(vozBoton('voz-citbar-b', '📋 Copiar', () => {
      vozAlPortapapeles(f.t, '📋 Fuente copiada');
    }));
    acc.appendChild(vozBoton('voz-citbar-b', '📚 Todas', () => {
      vozCitCerrar();
      vozAbrirPanel('voz-panel-ind');
      vozPintarPanelInd('fuentes');
    }, 'Ver todas las fuentes del texto'));
    cuerpo.appendChild(acc);
    fila.appendChild(cuerpo);
    b.appendChild(fila);
  });

  b.hidden = false;
  vozColocarFlotante(b, caja, 'voz-citbar-abajo');
}

/* ══════════════════════════════════════════════════════════════════
   LAS TABLAS
   ══════════════════════════════════════════════════════════════════
   Una tabla de un ensayo no cabe en la página de un teléfono, y eso no
   se arregla encogiendo la letra hasta que no se lea. Se ofrecen las
   dos salidas de verdad y se elige MIDIENDO, no adivinando:

     · en FICHAS —una por fila, con el nombre de la columna al lado de
       cada dato—, que es lo único que se lee de corrido en una pantalla
       estrecha y no pierde ni un dato;
     · ENTERA, a pantalla completa, que se desliza a lo ancho con la
       primera columna y la cabecera clavadas: es la que hace falta para
       comparar dos filas lejanas.

   ⚠️ Y SE PINTA UNA VISTA CADA VEZ, NUNCA LAS DOS ESCONDIENDO UNA. Con
   las dos en el documento, el texto del bloque saldría DUPLICADO, y ese
   texto es sobre el que se guardan los subrayados y sobre el que mide
   la posición de lectura: cada tabla contaría el doble de lo que hay. */
const VOZ_TABLA_ESTRECHA = 460;   // por debajo de esto, y con 3 columnas, fichas
let _vozVistaTabla = {};          // lo elegido a mano, por bloque, mientras dure la lectura

function vozClaveTabla(cap, vp) { return (cap || 0) + ':' + vp; }

function vozNodoTabla(p, i, cap) {
  const fig = vozNodo('figure', 'voz-tabla');
  if (p.tit) {
    const cp = vozNodo('figcaption', 'voz-tabla-tit');
    vozPintaTexto(cp, p.tit);
    fig.appendChild(cp);
  }
  fig.appendChild(vozNodo('div', 'voz-tabla-cuerpo'));
  const mandos = vozNodo('div', 'voz-tabla-mandos');
  mandos.hidden = true;
  fig.appendChild(mandos);
  fig._vozT = p;
  fig.dataset.clave = vozClaveTabla(cap, i);
  vozTablaPinta(fig, _vozVistaTabla[fig.dataset.clave] || 'tabla');
  return fig;
}

function vozTablaPinta(fig, vista) {
  const p = fig._vozT;
  const cuerpo = fig.querySelector('.voz-tabla-cuerpo');
  if (!p || !cuerpo) return;
  cuerpo.textContent = '';
  fig.dataset.vista = vista;
  if (vista === 'fichas') cuerpo.appendChild(vozTablaFichas(p));
  else cuerpo.appendChild(vozTablaTabla(p));
}

function vozTablaTabla(p) {
  const t = vozNodo('table', 'voz-tabla-t');
  const cab = vozNodo('thead');
  const fc = vozNodo('tr');
  (p.cab || []).forEach((celda, k) => {
    const th = vozNodo('th', vozTablaAl(p, k));
    th.setAttribute('scope', 'col');
    vozPintaTexto(th, celda);
    fc.appendChild(th);
  });
  cab.appendChild(fc);
  t.appendChild(cab);
  const cuerpo = vozNodo('tbody');
  (p.f || []).forEach(fila => {
    const tr = vozNodo('tr');
    fila.forEach((celda, k) => {
      /* La primera celda es la que nombra la fila: va como cabecera de
         fila, que es lo que la deja clavada al deslizar a lo ancho y lo
         que hace que un lector de pantalla diga de qué fila habla cada
         dato. */
      const td = vozNodo(k === 0 ? 'th' : 'td', vozTablaAl(p, k) + (k === 0 ? ' voz-td-1' : ''));
      if (k === 0) td.setAttribute('scope', 'row');
      vozPintaTexto(td, celda);
      tr.appendChild(td);
    });
    cuerpo.appendChild(tr);
  });
  t.appendChild(cuerpo);
  return t;
}

function vozTablaAl(p, k) {
  const a = (p.al || [])[k] || '';
  return a === 'd' ? 'voz-td-der' : (a === 'c' ? 'voz-td-cen' : '');
}

/* Una ficha por fila: el primer dato hace de título y los demás van
   con el nombre de su columna al lado. Es la única forma de leer de
   corrido una tabla de seis columnas en un teléfono, y no pierde ni un
   dato: lo que se pierde al encoger la letra, sí. */
function vozTablaFichas(p) {
  const caja = vozNodo('div', 'voz-tabla-fichas');
  (p.f || []).forEach(fila => {
    const fi = vozNodo('div', 'voz-tf');
    const tit = vozNodo('div', 'voz-tf-tit');
    vozPintaTexto(tit, fila[0] || '—');
    fi.appendChild(tit);
    fila.forEach((celda, k) => {
      if (k === 0 || !String(celda || '').trim()) return;
      const par = vozNodo('div', 'voz-tf-par');
      par.appendChild(vozNodo('span', 'voz-tf-l', (p.cab || [])[k] || ''));
      const v = vozNodo('span', 'voz-tf-v');
      vozPintaTexto(v, celda);
      par.appendChild(v);
      fi.appendChild(par);
    });
    caja.appendChild(fi);
  });
  return caja;
}

/* ⚠️ SI UNA TABLA NO CABE, SE MIDE; NO SE ADIVINA. Es la lección de las
   hojas del kit de escritura a mano: una medida calculada a ojo sale
   partida y nadie lo nota hasta que la imprime. Aquí se mira el ancho
   REAL de la tabla contra el de su caja, después de pintar, y solo
   entonces salen los mandos. Con una tabla que cabe, no sale ninguno:
   un botón que no hace falta es un botón que estorba en mitad de una
   página de lectura. */
function vozAjustarTablas() {
  const texto = document.getElementById('voz-texto');
  if (!texto) return;
  /* El alto de la página, que es la otra mitad del problema: ver la
     nota de `vozAjustarUnaTabla`. En el modo deslizando no hay páginas
     y no hay nada que medir. */
  const hoja = document.getElementById('voz-hoja');
  const altoPag = (vozModo() === 'scroll' || !hoja) ? 0 : hoja.clientHeight - 2 * VOZ_ALTO_MARGEN;
  texto.querySelectorAll('.voz-tabla').forEach(fig => {
    const p = fig._vozT;
    const cuerpo = fig.querySelector('.voz-tabla-cuerpo');
    const mandos = fig.querySelector('.voz-tabla-mandos');
    if (!p || !cuerpo || !mandos) return;
    const enFichas = fig.dataset.vista === 'fichas';
    const cabe = enFichas ? true : cuerpo.scrollWidth <= cuerpo.clientWidth + 2;
    /* Sin elección a mano y con la tabla ancha en una caja estrecha,
       se empieza en fichas: es lo que de verdad se puede leer ahí. */
    if (!enFichas && !cabe && !_vozVistaTabla[fig.dataset.clave] &&
        cuerpo.clientWidth < VOZ_TABLA_ESTRECHA && (p.cab || []).length >= 3) {
      vozTablaPinta(fig, 'fichas');
      vozAjustarUnaTabla(fig, p, true, true, altoPag);
      return;
    }
    vozAjustarUnaTabla(fig, p, cabe, enFichas, altoPag);
  });
}

/* ⚠️ UNA TABLA MÁS ALTA QUE LA PÁGINA NO PUEDE PEDIR QUE NO LA PARTAN:
   DESAPARECE. `break-inside: avoid` está para que media tabla no se
   quede al final de una página y media al principio de la otra, y eso
   hay que pedirlo mientras la tabla QUEPA. Cuando no cabe, el navegador
   no puede cumplirlo y lo que hace en una caja de columnas con alto
   fijo es RECORTARLA: queda el rótulo solo con media página en blanco
   debajo, y las filas no están en ninguna parte. No da error, la página
   no se rompe y el número de páginas sigue saliendo bien: el fallo de
   siempre, el que parece que funcionó.

   ⚠️ Y HAY UNA SEGUNDA TRAMPA DEBAJO, que es la que costó encontrar:
   UNA CAJA QUE SE DESLIZA NO SE PARTE NUNCA. `overflow` distinto de
   `visible` la hace indivisible para el navegador, así que la caja que
   da a la tabla su deslizamiento a lo ancho no se puede repartir entre
   dos páginas por mucho `break-inside: auto` que se le ponga. De ahí
   las dos respuestas, y son distintas a propósito:

     · las FICHAS no necesitan deslizarse a lo ancho, así que no llevan
       caja: se parten solas entre páginas, con cada ficha entera;
     · la TABLA sí la necesita, así que se le pone TOPE DE ALTO y se
       desliza también hacia abajo dentro de su caja, con el botón de
       verla entera al lado. Nada se pierde y nada se recorta. */
function vozAjustarUnaTabla(fig, p, cabe, enFichas, altoPag) {
  const mandos = fig.querySelector('.voz-tabla-mandos');
  const cuerpo = fig.querySelector('.voz-tabla-cuerpo');
  if (cuerpo) cuerpo.style.maxHeight = '';
  fig.classList.remove('voz-tabla-larga');
  /* ⚠️ Y EL ALTO SE MIDE EN LA CAJA, NO EN LA FIGURA. Una figura que el
     navegador YA repartió entre dos columnas dice medir lo que mide la
     columna, así que preguntarle a ella si es más alta que la página
     contesta que no —justo en el caso en que sí—. La caja de la tabla
     es indivisible (se desliza), así que ella sí dice su alto de
     verdad. Las fichas no llevan caja: se parten solas y no hay nada
     que topar. */
  let larga = false;
  if (!enFichas && cuerpo && altoPag) {
    const resto = Math.max(0, fig.offsetHeight - cuerpo.offsetHeight);   // el rótulo y los mandos
    larga = cuerpo.offsetHeight + resto > altoPag;
    if (larga) {
      fig.classList.add('voz-tabla-larga');
      cuerpo.style.maxHeight = Math.max(140, altoPag - resto - 10) + 'px';
    }
  }
  fig.classList.toggle('voz-tabla-ancha', !cabe && !enFichas);
  mandos.textContent = '';
  if (cabe && !enFichas && !larga) { mandos.hidden = true; return; }
  mandos.hidden = false;
  /* ⚠️ Y EL TOQUE SE PARA AQUÍ (`stopPropagation`). El toque al centro de
     la hoja apaga los mandos de la sala, y se libra de eso mirando si
     lo tocado cuelga de la tabla… pero estos botones SE REHACEN dentro
     de su propia respuesta (la vista cambia y los mandos se vuelven a
     pintar), así que cuando el aviso llega arriba el botón ya está
     suelto, sin padres, y no cuelga de nada: cambiar de vista escondía
     además las barras de la sala. */
  mandos.appendChild(vozBoton('voz-tabla-b', '⤢ Verla entera',
    ev => { if (ev) ev.stopPropagation(); vozTablonAbrir(p); }, 'Abrir la tabla a pantalla completa'));
  mandos.appendChild(vozBoton('voz-tabla-b', enFichas ? '▦ Como tabla' : '▤ En fichas', ev => {
    if (ev) ev.stopPropagation();
    const nueva = enFichas ? 'tabla' : 'fichas';
    _vozVistaTabla[fig.dataset.clave] = nueva;
    vozTablaPinta(fig, nueva);
    vozAjustarTablas();
    /* Cambiar de vista cambia el alto del bloque, así que hay que
       repaginar — y volviendo al PÁRRAFO apuntado, nunca al número de
       página: ver la nota grande de la sala. */
    vozPaginar(_vozAncla, _vozSub);
  }));
  if (!cabe && !enFichas) mandos.appendChild(vozNodo('span', 'voz-tabla-nota', 'No cabe de ancho en la página'));
  else if (larga && !enFichas) mandos.appendChild(vozNodo('span', 'voz-tabla-nota', 'Más alta que la página: se desliza dentro'));
}

/* La tabla a pantalla completa: se desliza a lo ancho y a lo alto con
   la cabecera y la primera columna clavadas, que es lo que hace falta
   para comparar la primera fila con la última. Vive dentro de la sala
   (se tiñe con el papel) y por encima de las zonas de pasar página. */
function vozTablonAbrir(p) {
  const sala = document.getElementById('voz-lector');
  if (!sala || !p) return;
  vozTablonCerrar();
  const ov = vozNodo('div', 'voz-tablon');
  ov.id = 'voz-tablon';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-label', p.tit || 'La tabla, entera');
  const cab = vozNodo('div', 'voz-tablon-cab');
  cab.appendChild(vozNodo('span', 'voz-tablon-tit', p.tit || 'La tabla'));
  const mm = vozNodo('div', 'voz-tablon-mm');
  let tam = 15;
  const caja = vozNodo('div', 'voz-tablon-caja');
  const pon = v => { tam = Math.max(9, Math.min(26, v)); caja.style.fontSize = tam + 'px'; };
  mm.appendChild(vozBoton('voz-tablon-b', '−', () => pon(tam - 1), 'Letra más pequeña'));
  mm.appendChild(vozBoton('voz-tablon-b', '+', () => pon(tam + 1), 'Letra más grande'));
  mm.appendChild(vozBoton('voz-tablon-b voz-tablon-x', '✕', () => vozTablonCerrar(), 'Cerrar'));
  cab.appendChild(mm);
  ov.appendChild(cab);
  caja.appendChild(vozTablaTabla(p));
  caja.style.fontSize = tam + 'px';
  ov.appendChild(caja);
  ov.appendChild(vozNodo('div', 'voz-tablon-pie', 'Se desliza a lo ancho. La cabecera y la primera columna se quedan quietas.'));
  sala.appendChild(ov);
}

function vozTablonCerrar() {
  const ov = document.getElementById('voz-tablon');
  if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
  return !!ov;
}

/* Un bloque de bibliografía: sangría francesa —la segunda línea
   entrada, como en cualquier norma de cita, que es lo que deja ver de
   un vistazo dónde empieza cada entrada— y su número delante si lo
   trae. Se le pone `id` para poder llegar desde el panel. */
function vozNodoFuente(p, cap, i) {
  const el = vozNodo('div', 'voz-fuente');
  if (p.n != null) el.appendChild(vozNodo('span', 'voz-fuente-n', String(p.n)));
  const t = vozNodo('span', 'voz-fuente-t');
  vozPintaTexto(t, p.t);
  el.appendChild(t);
  const url = p.url || vozUrlEn(p.t);
  if (url) {
    const a = vozNodo('a', 'voz-fuente-ir', '🔗');
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.setAttribute('aria-label', 'Abrir la fuente');
    el.appendChild(a);
  }
  return el;
}

/* Copiar un trozo corto —una fuente, una cifra— con el mismo respaldo
   que el botón 📋 del anaquel: en un WebView sin permiso de
   portapapeles, `navigator.clipboard` no existe o falla en silencio. */
function vozAlPortapapeles(texto, aviso) {
  const fin = ok => vozAviso(ok ? (aviso || '📋 Copiado') : 'No se pudo copiar');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(() => fin(true), () => vozCopiarViejo(texto, fin));
  } else vozCopiarViejo(texto, fin);
}

/* ⚠️ LA PORTADA ES LA PRIMERA PÁGINA DE TODO TEXTO, Y LLEVA LA
   ETIQUETA. No es una pantalla de bienvenida que se pueda quitar para
   ganar una página: es el sitio donde dice, en grande y antes que el
   texto, que esto lo escribió una máquina imitando a alguien. Ver la
   cabecera del archivo. */
function vozPortadaNodo(c) {
  const g = vozGenero(c.genero);
  const port = vozNodo('div', 'voz-portada');
  /* ⚠️ LA PORTADA ES UNA POSICIÓN DE LECTURA MÁS, LA −1, y sin esto no
     la ve nadie: al abrir un texto nuevo la lectura se coloca en el
     párrafo 0, que está en la página SIGUIENTE, así que la portada
     —que es donde dice en grande que esto lo escribió una máquina
     imitando a alguien— se saltaba entera y en silencio. */
  port.dataset.vp = '-1';
  port.dataset.cap = '0';
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
  return port;
}

/* El cuerpo de un capítulo: su epígrafe, su título y sus bloques. Lo
   usan los dos modos: en páginas, un capítulo cada vez; en
   desplazamiento, todos seguidos. */
function vozPintarCuerpoCap(texto, c, cap, ci) {
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
    h.dataset.capTit = String(ci);
    /* El número del capítulo encima del título, salvo que el título ya
       lo traiga («I. El pozo», «Capítulo 3»): dos números uno encima
       del otro se leen como una errata. */
    const yaNumerado = /^\s*([IVXLCDM]+|\d+)\b/i.test(cap.t) || VOZ_PAL_CAP.test(cap.t);
    if ((c.capitulos || []).length > 1 && !yaNumerado) h.appendChild(vozNodo('span', 'voz-cap-num', String(ci + 1)));
    const t = vozNodo('span', 'voz-cap-txt');
    vozPintaTexto(t, cap.t);
    h.appendChild(t);
    texto.appendChild(h);
  } else if (ci > 0) {
    const h = vozNodo('h2', 'voz-cap-tit voz-cap-tit-mudo');
    h.dataset.capTit = String(ci);
    h.appendChild(vozNodo('span', 'voz-cap-num', String(ci + 1)));
    texto.appendChild(h);
  }
  let anterior = null;
  (cap.p || []).forEach((p, i) => {
    texto.appendChild(vozNodoBloque(p, i, anterior, ci));
    anterior = p;
  });
}

/* El pie del capítulo dice qué viene después. Sin esto, el final de
   un capítulo y el final del texto se ven exactamente igual: una
   página que no pasa. */
function vozFinNodo(c, ci) {
  const g = vozGenero(c.genero);
  const cap = (c.capitulos || [])[ci] || { p: [] };
  const fin = vozNodo('div', 'voz-fin-cap');
  const hayMas = ci < (c.capitulos.length - 1);
  const yaDiceFin = (cap.p || []).some(b => b.k === 'fin');
  fin.appendChild(vozNodo('div', 'voz-fin-marca', hayMas ? '❧' : '✦ ✦ ✦'));
  if (hayMas) {
    fin.appendChild(vozNodo('div', 'voz-fin-txt', 'Sigue: ' + vozNombreCap(c, ci + 1)));
  } else {
    if (!yaDiceFin) fin.appendChild(vozNodo('div', 'voz-fin-txt', 'Fin de «' + (c.titulo || 'el texto') + '».'));
    fin.appendChild(vozNodo('div', 'voz-fin-et',
      g.t + ' escrito por ' + (c.maquina || 'una máquina') + ', al modo de ' + (c.voz || '—') + '.'));
    /* ⚠️ EL ENLACE AL TALLER VA AQUÍ, AL PIE DE LA ÚLTIMA PÁGINA, y no
       solo en un panel: es el único momento en que alguien tiene a la
       vez el texto entero leído y las manos libres. Un botón que haya
       que ir a buscar después de cerrar el libro es un botón que se
       toca una vez en la vida. */
    const n = vozActCuenta(c.cid);
    const res = vozActResumen(c.cid);
    const enlace = vozBoton('voz-fin-taller', null, () => vozActAbrirTaller(c.cid, 'sala'));
    enlace.appendChild(vozNodo('span', 'voz-fin-taller-ic', '📝'));
    enlace.appendChild(vozNodo('span', 'voz-fin-taller-t',
      n ? (res.tocan ? 'Repasar lo leído · ' + res.tocan + ' tocan hoy' : 'Taller de comprensión · ' + n)
        : '¿Se quedó? Monta el taller de este texto'));
    enlace.appendChild(vozNodo('span', 'voz-fin-taller-p',
      n ? 'Tarjetas, parejas y preguntas sobre lo que acabas de leer.'
        : 'Tarjetas, parejas y preguntas para comprobar que lo leído se quedó.'));
    fin.appendChild(enlace);

    /* ⚠️ Y LOS RECURSOS, AQUÍ TAMBIÉN, PERO SOLO SI HAY ALGUNO. El pie de
       la última página es el único momento en que alguien tiene el texto
       entero leído y las manos libres —el mismo argumento que el taller—,
       y es justo cuando apetece el vídeo o los ejercicios. Pero un
       segundo botón donde antes había uno, y vacío, es ruido en mitad de
       una página de lectura: la puerta para PONERLOS es la pestaña 🔗 del
       panel, que sale siempre. */
    const nRec = vozRecCuenta(c.cid);
    if (nRec) {
      const er = vozBoton('voz-fin-taller voz-fin-recs', null, () => {
        vozPintarPanelInd('recs');
        vozAbrirPanel('voz-panel-ind');
      });
      er.appendChild(vozNodo('span', 'voz-fin-taller-ic', '🔗'));
      er.appendChild(vozNodo('span', 'voz-fin-taller-t',
        nRec === 1 ? 'Un recurso para reforzar esto' : nRec + ' recursos para reforzar esto'));
      er.appendChild(vozNodo('span', 'voz-fin-taller-p',
        'Se abren en otra pestaña, así que no pierdes la página.'));
      fin.appendChild(er);
    }
  }
  return fin;
}

function vozPintarCap(ancla, sub) {
  const c = _vozLeyendo;
  const texto = document.getElementById('voz-texto');
  if (!c || !texto) return;
  if (vozModo() === 'scroll') { vozPintarTodo(ancla, sub); return; }
  const cap = (c.capitulos || [])[_vozCapActual] || { t: '', p: [] };
  texto.textContent = '';
  if (_vozCapActual === 0) texto.appendChild(vozPortadaNodo(c));
  vozPintarCuerpoCap(texto, c, cap, _vozCapActual);
  texto.appendChild(vozFinNodo(c, _vozCapActual));
  vozPaginar(ancla, sub);
}

/* El modo desplazamiento pinta el texto ENTERO: portada, epígrafes,
   capítulos y el pie del final, seguidos. Cada bloque lleva su capítulo
   en `data-cap`, que es lo que permite guardar la posición igual que en
   páginas y llegar a un marcador o a un hallazgo del buscador. */
function vozPintarTodo(ancla, sub) {
  const c = _vozLeyendo;
  const texto = document.getElementById('voz-texto');
  if (!c || !texto) return;
  texto.textContent = '';
  texto.appendChild(vozPortadaNodo(c));
  const caps = c.capitulos || [];
  caps.forEach((cap, ci) => vozPintarCuerpoCap(texto, c, cap, ci));
  texto.appendChild(vozFinNodo(c, caps.length - 1));
  vozPaginar(ancla, sub);
}

/* Coloca la vista según el modo. Se llama al pintar, al cambiar un
   ajuste y cada vez que la caja cambia de tamaño. Ver la nota grande de
   arriba sobre la última página. */
function vozPaginar(ancla, sub) {
  if (vozModo() === 'scroll') vozColocarScroll(ancla, sub);
  else vozPaginarPaginas(ancla, sub);
}

function vozPaginarPaginas(ancla, sub) {
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
  /* ⚠️ Las tablas se miden AQUÍ, con las columnas ya puestas y ANTES de
     contar las páginas: la caja de una tabla mide lo que mide la
     columna, y pasar una a fichas le cambia el alto. Midiendo después,
     el número de páginas sería el de la tabla que ya no está. */
  vozAjustarTablas();
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

/* El modo desplazamiento: sin columnas, sin alto fijo, y la caja se
   desplaza hacia abajo. Los estilos que puso la paginación se quitan
   aquí, uno por uno, para que un cambio de modo a mitad de lectura no
   deje una columna de dos metros. */
function vozColocarScroll(ancla, sub) {
  const hoja = document.getElementById('voz-hoja');
  const texto = document.getElementById('voz-texto');
  const cola = document.getElementById('voz-cola');
  if (!hoja || !texto) return;
  const B = hoja.clientWidth;
  if (B < 40) return;
  const M = Math.max(_vozAj.margen, Math.floor((B - VOZ_ANCHO_LIBRO) / 2));
  _vozM = M; _vozCols = 1; _vozPaso = 0; _vozPaginas = 1; _vozPagina = 0;
  hoja.style.padding = VOZ_ALTO_MARGEN + 'px ' + M + 'px ' + (VOZ_ALTO_MARGEN * 4) + 'px ' + M + 'px';
  if (cola) cola.style.flexBasis = '0px';
  texto.style.height = '';
  texto.style.width = '';
  texto.style.columnCount = '';
  texto.style.columnWidth = '';
  texto.style.columnGap = '';
  vozAjustarTablas();
  vozIrAnclaScroll(_vozCapActual, ancla == null ? _vozAncla : ancla, sub == null ? _vozSub : sub, false);
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
  if (vozModo() === 'scroll') return;
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

/* Lo mismo, en desplazamiento: el bloque que toca el borde de arriba y
   qué parte de él queda por encima. */
function vozAnclaScroll() {
  const hoja = document.getElementById('voz-hoja');
  const texto = document.getElementById('voz-texto');
  if (!hoja || !texto) return { cap: _vozCapActual, ancla: _vozAncla, sub: _vozSub };
  const top = hoja.scrollTop + 4;
  const ps = texto.querySelectorAll('[data-vp]');
  let mejor = null;
  for (let i = 0; i < ps.length; i++) {
    if (ps[i].offsetTop <= top) mejor = ps[i]; else break;
  }
  if (!mejor) mejor = ps[0];
  if (!mejor) return { cap: 0, ancla: 0, sub: 0 };
  const h = mejor.offsetHeight || 1;
  const sub = Math.max(0, Math.min(1, (hoja.scrollTop - mejor.offsetTop) / h));
  return { cap: Number(mejor.dataset.cap) || 0, ancla: Number(mejor.dataset.vp) || 0, sub: Math.round(sub * 1000) / 1000 };
}

function vozIrAnclaScroll(cap, vp, sub, suave) {
  const hoja = document.getElementById('voz-hoja');
  const texto = document.getElementById('voz-texto');
  if (!hoja || !texto) return;
  const el = texto.querySelector('[data-cap="' + Number(cap) + '"][data-vp="' + Number(vp) + '"]');
  hoja.style.scrollBehavior = suave ? '' : 'auto';
  hoja.scrollTop = el ? Math.max(0, Math.round(el.offsetTop - 6 + (sub || 0) * el.offsetHeight)) : 0;
  _vozCapActual = Math.min(Math.max(0, cap), ((_vozLeyendo && _vozLeyendo.capitulos) || []).length - 1);
  vozApuntarPos();
  vozPintarPie();
}

function vozApuntarPos() {
  if (!_vozLeyendo) return;
  const caps = (_vozLeyendo.capitulos || []).length;
  if (vozModo() === 'scroll') {
    const hoja = document.getElementById('voz-hoja');
    const a = vozAnclaScroll();
    _vozCapActual = a.cap; _vozAncla = a.ancla; _vozSub = a.sub;
    const fin = !!hoja && hoja.scrollTop + hoja.clientHeight >= hoja.scrollHeight - 8;
    vozGuardaPos(_vozLeyendo.cid, _vozCapActual, _vozAncla, _vozSub, fin);
    return;
  }
  const a = vozAncla();
  _vozAncla = a.ancla;
  _vozSub = a.sub;
  /* La última página del último capítulo es «leído», y se apunta como
     tal: un porcentaje calculado por palabras no llega nunca al cien
     con exactitud, y una barra al 98 % de un texto terminado es una
     barra que miente. */
  const fin = _vozCapActual >= caps - 1 && _vozPagina >= _vozPaginas - 1;
  vozGuardaPos(_vozLeyendo.cid, _vozCapActual, _vozAncla, _vozSub, fin);
}

/* Pasar página, y al llegar al borde saltar de capítulo: al final de
   uno se entra por la primera página del siguiente y al principio de
   uno se entra por la ÚLTIMA del anterior, que es por donde se
   entraría en un libro yendo hacia atrás. En desplazamiento, «pasar
   página» es bajar casi una pantalla. */
function vozPasar(d) {
  const c = _vozLeyendo;
  if (!c) return;
  if (vozModo() === 'scroll') {
    const hoja = document.getElementById('voz-hoja');
    if (!hoja) return;
    hoja.style.scrollBehavior = '';
    hoja.scrollTop += d * Math.round(hoja.clientHeight * 0.88);
    return;
  }
  if (_vozVuelta) return;   // hay una hoja pasándose: se espera a que termine
  const destino = _vozPagina + d;
  const dentro = destino >= 0 && destino < _vozPaginas;
  const capDestino = _vozCapActual + d;
  if (!dentro && (capDestino < 0 || capDestino >= (c.capitulos || []).length)) return;
  const cambiar = () => { if (dentro) vozIrPagina(destino, true); else vozIrCapitulo(capDestino, d < 0); };
  if (_vozAj.paso === 'hojear') vozVoltear(d, cambiar);
  else if (_vozAj.paso === 'golpe' || !dentro) cambiar();
  else vozIrPagina(destino);
}

function vozIrCapitulo(i, alFinal) {
  const c = _vozLeyendo;
  if (!c) return;
  const ci = Math.min(Math.max(0, i), (c.capitulos || []).length - 1);
  if (vozModo() === 'scroll') {
    const texto = document.getElementById('voz-texto');
    const hoja = document.getElementById('voz-hoja');
    const h = texto && (texto.querySelector('[data-cap-tit="' + ci + '"]') ||
                        texto.querySelector('[data-cap="' + ci + '"][data-vp]'));
    if (hoja) {
      hoja.style.scrollBehavior = '';
      hoja.scrollTop = h ? Math.max(0, h.offsetTop - 6) : 0;
    }
    _vozCapActual = ci;
    return;
  }
  _vozCapActual = ci;
  _vozPagina = 0;
  vozPintarCap(_vozCapActual === 0 ? -1 : 0, 0);
  if (alFinal) vozIrPagina(_vozPaginas - 1, true);
}

/* Ir a un sitio exacto del texto, desde el índice, un marcador, un
   subrayado o un hallazgo del buscador, en el modo que esté. */
function vozIrA(cap, vp, sub) {
  const c = _vozLeyendo;
  if (!c) return;
  const ci = Math.min(Math.max(0, cap || 0), (c.capitulos || []).length - 1);
  if (vozModo() === 'scroll') { vozIrAnclaScroll(ci, vp, sub || 0, true); return; }
  if (ci !== _vozCapActual) { _vozCapActual = ci; vozPintarCap(vp, sub || 0); }
  else vozIrAncla(vp, sub || 0);
}

/* Las muescas de la barra: dónde empieza cada capítulo, por palabras.
   Se pintan una vez al abrir el texto. */
function vozPintarBarraMarcas() {
  const c = _vozLeyendo;
  const caja = document.getElementById('voz-barra-marcas');
  if (!c || !caja) return;
  caja.textContent = '';
  const caps = c.capitulos || [];
  const total = vozPalabras(caps) || c.palabras || 1;
  if (caps.length < 2) return;
  let acum = 0;
  caps.forEach((cap, i) => {
    if (i > 0) {
      const m = vozNodo('i', 'voz-barra-tick');
      m.style.left = Math.min(99.5, (acum / total) * 100) + '%';
      caja.appendChild(m);
    }
    (cap.p || []).concat(cap.epi || []).forEach(b => { acum += vozPalabrasDe(vozTextoDeBloque(b)); });
  });
}

function vozPintarPie() {
  const c = _vozLeyendo;
  const pie = document.getElementById('voz-pag');
  if (!pie || !c) return;
  const caps = (c.capitulos || []).length;
  const total = vozPalabras(c.capitulos) || c.palabras || 1;
  const leido = vozLeido(c, { cap: _vozCapActual, ancla: _vozAncla, sub: _vozSub });
  const hoja = document.getElementById('voz-hoja');
  const ultima = vozModo() === 'scroll'
    ? !!hoja && hoja.scrollTop + hoja.clientHeight >= hoja.scrollHeight - 8
    : (_vozCapActual === caps - 1 && _vozPagina === _vozPaginas - 1);
  const quedan = ultima ? 0 : Math.max(0, total - leido);
  const pct = ultima ? 100 : Math.min(99, Math.round((leido / total) * 100));

  pie.textContent = '';
  if (vozModo() === 'scroll') pie.appendChild(vozNodo('span', 'voz-pag-n', pct + ' %'));
  else pie.appendChild(vozNodo('span', 'voz-pag-n', 'pág. ' + (_vozPagina + 1) + ' / ' + _vozPaginas));
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

/* ─── Hojear: la hoja que se pliega ──────────────────────────────────
   Pedido por el autor el 10 de septiembre de 2026: «la simulación que
   pase la página cuando se pasa la hoja tal como un libro». Se hace
   con UNA idea y sin ninguna biblioteca: se toma una INSTANTÁNEA de la
   página actual (un clon del texto, recortado a la página que se ve),
   se cambia por debajo a la página de destino, y la instantánea se
   pliega hacia el lomo con una rotación en 3D hasta desaparecer. Para
   atrás es el espejo: la hoja se pliega hacia la derecha y aparece la
   anterior. Con el dedo, la hoja SIGUE al dedo mientras se arrastra, y
   al soltar termina de pasar o vuelve a su sitio según cuánto se llevó.

   ⚠️ La instantánea es un clon del DOM, no una imagen: así se ve igual
   que la página (misma letra, mismos subrayados) y no hay que pintar
   nada en un lienzo. Y el clon pierde el `id`: dos #voz-texto en el
   documento romperían la paginación, el buscador y la posición. Lleva
   la clase `.voz-texto`, que es la que trae la tipografía. */
function vozInstantanea() {
  const hoja = document.getElementById('voz-hoja');
  const texto = document.getElementById('voz-texto');
  const mid = document.getElementById('voz-mid');
  if (!hoja || !texto || !mid) return null;
  const W = hoja.clientWidth - 2 * _vozM;
  const H = hoja.clientHeight - 2 * VOZ_ALTO_MARGEN;
  if (W < 40 || H < 40) return null;
  const leaf = vozNodo('div', 'voz-vuelta');
  leaf.style.left = _vozM + 'px';
  leaf.style.top = VOZ_ALTO_MARGEN + 'px';
  leaf.style.width = W + 'px';
  leaf.style.height = H + 'px';
  const cara = vozNodo('div', 'voz-vuelta-cara');
  const clon = texto.cloneNode(true);
  clon.removeAttribute('id');
  clon.classList.add('voz-texto-clon');
  clon.style.marginLeft = (-_vozPagina * vozPaso()) + 'px';
  cara.appendChild(clon);
  leaf.appendChild(cara);
  leaf.appendChild(vozNodo('div', 'voz-vuelta-sombra'));
  mid.appendChild(leaf);
  return leaf;
}

function vozVoltear(d, cambiar) {
  const leaf = vozInstantanea();
  if (!leaf) { cambiar(); return; }
  cambiar();
  leaf.classList.add(d > 0 ? 'voz-vuelta-izq' : 'voz-vuelta-der');
  _vozVuelta = { el: leaf, dir: d, interactivo: false, f: 0 };
  /* Dos cuadros de espera: el primero para que el navegador coloque la
     hoja en su sitio, el segundo para que la transición arranque desde
     ahí y no desde el final. */
  requestAnimationFrame(() => requestAnimationFrame(() => vozVueltaTermina(leaf, d, true)));
}

function vozVueltaTermina(leaf, d, completar) {
  leaf.classList.add('voz-vuelta-anim');
  const sombra = leaf.querySelector('.voz-vuelta-sombra');
  if (completar) {
    leaf.style.transform = 'perspective(1400px) rotateY(' + (d > 0 ? -90 : 90) + 'deg)';
    if (sombra) sombra.style.opacity = '1';
  } else {
    leaf.style.transform = 'perspective(1400px) rotateY(0deg)';
    if (sombra) sombra.style.opacity = '0';
  }
  let hecho = false;
  const fin = () => {
    if (hecho) return;
    hecho = true;
    if (leaf.parentNode) leaf.parentNode.removeChild(leaf);
    if (_vozVuelta && _vozVuelta.el === leaf) _vozVuelta = null;
  };
  leaf.addEventListener('transitionend', fin, { once: true });
  setTimeout(fin, 560);   // por si el navegador no avisa del final
}

/* El arrastre con el dedo: la hoja sigue al dedo. Solo dentro del
   capítulo; en los bordes (la página siguiente está en otro capítulo,
   que aún no está pintado) se pasa al soltar, con la animación entera. */
function vozVueltaEmpieza(dx) {
  if (_vozVuelta || vozModo() === 'scroll' || _vozAj.paso !== 'hojear') return false;
  const d = dx < 0 ? 1 : -1;
  const destino = _vozPagina + d;
  if (destino < 0 || destino >= _vozPaginas) return false;
  const leaf = vozInstantanea();
  if (!leaf) return false;
  const origen = _vozPagina;
  vozIrPagina(destino, true);
  leaf.classList.add(d > 0 ? 'voz-vuelta-izq' : 'voz-vuelta-der');
  _vozVuelta = { el: leaf, dir: d, origen: origen, destino: destino, interactivo: true, f: 0, ancho: leaf.offsetWidth || 1 };
  return true;
}

function vozVueltaMueve(dx) {
  const v = _vozVuelta;
  if (!v || !v.interactivo) return;
  const f = Math.max(0, Math.min(1, (v.dir > 0 ? -dx : dx) / v.ancho));
  v.f = f;
  v.el.style.transform = 'perspective(1400px) rotateY(' + (f * 90 * (v.dir > 0 ? -1 : 1)) + 'deg)';
  const sombra = v.el.querySelector('.voz-vuelta-sombra');
  if (sombra) sombra.style.opacity = String(f);
}

function vozVueltaSuelta(rapido) {
  const v = _vozVuelta;
  if (!v || !v.interactivo) return;
  v.interactivo = false;
  const completar = (v.f || 0) > 0.22 || (rapido && (v.f || 0) > 0.05);
  if (!completar) vozIrPagina(v.origen, true);   // por debajo vuelve la página de antes
  vozVueltaTermina(v.el, v.dir, completar);
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

  const haySeleccion = () => { const s = window.getSelection && window.getSelection(); return !!(s && String(s).trim()); };

  mid.addEventListener('pointerdown', e => {
    _vozArrastre = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId, tipo: e.pointerType, vuelta: false };
  });
  mid.addEventListener('pointermove', e => {
    const a = _vozArrastre;
    if (!a || e.pointerId !== a.id) return;
    const dx = e.clientX - a.x, dy = e.clientY - a.y;
    if (a.vuelta === false) {
      /* La hoja sigue al dedo solo con el dedo (o el lápiz): con el
         ratón un arrastre es una selección de texto. */
      if (a.tipo === 'mouse' || _vozAj.paso !== 'hojear' || vozModo() === 'scroll') return;
      if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy)) return;
      if (haySeleccion()) return;
      a.vuelta = vozVueltaEmpieza(dx) ? true : 'no';
    }
    if (a.vuelta === true) { e.preventDefault(); vozVueltaMueve(dx); }
  });
  mid.addEventListener('pointerup', e => {
    const a = _vozArrastre;
    if (!a) return;
    _vozArrastre = null;
    const dx = e.clientX - a.x;
    const dy = e.clientY - a.y;
    const dt = Date.now() - a.t;
    if (a.vuelta === true) {
      _vozTragarClic = true;
      vozVueltaSuelta(Math.abs(dx) > 40 && dt < 260);
      setTimeout(() => { _vozTragarClic = false; }, 350);
      return;
    }
    if (vozModo() === 'scroll') return;
    /* Un arrastre con texto seleccionado es una selección, no un paso
       de página: quien está copiando una frase no quiere que la página
       se le vaya de debajo del dedo. */
    if (haySeleccion()) return;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      _vozTragarClic = true;      // un deslizamiento no es además un toque
      vozPasar(dx < 0 ? 1 : -1);
      setTimeout(() => { _vozTragarClic = false; }, 350);
    }
  });
  mid.addEventListener('pointercancel', () => {
    const a = _vozArrastre;
    _vozArrastre = null;
    if (a && a.vuelta === true) vozVueltaSuelta(false);
  });

  /* ⚠️ Con el RATÓN, soltar el botón ES el gesto que dice «ya terminé de
     seleccionar», así que la barra sale enseguida y no hay que esperar
     los tres segundos del dedo. Va en su propio escuchador porque el de
     arriba se sale antes por varios caminos. Ver `VOZ_SUB_ESPERA`. */
  mid.addEventListener('pointerup', e => {
    if (e.pointerType === 'mouse' && !_vozSubEditando) vozSubProgramar(60);
  });

  /* ⚠️ LAS ZONAS DE PASAR PÁGINA NO RECIBEN EL PUNTERO, Y EL BORDE SE
     DECIDE POR LA COORDENADA. Pedido por el autor el 18 de septiembre de
     2026: «cuando selecciono el texto la marca azul no se limita a
     seleccionar la palabra sino que esa marca se expande hasta bastantes
     palabras más».

     La causa, MEDIDA y no supuesta (comprobación 38): las dos zonas
     cubren el 20 % de cada borde —el 40 % del ancho, 160 px de 400 en la
     tableta del autor— y van ENCIMA del texto. Sobre ellas,
     `caretRangeFromPoint` devuelve un DIV y no una posición de texto; con
     el puntero apagado, el mismo punto devuelve el texto. Y ESO es lo
     que el navegador usa para resolver dónde cae el tirador de una
     selección arrastrado con el dedo: si el tirador se suelta sobre una
     zona no hay posición que devolver, así que Chrome resuelve con lo más
     cercano que encuentra en el flujo — y en una caja de COLUMNAS «lo más
     cercano» puede estar media página más allá. De ahí el tirador
     disparado hasta el final del párrafo en la captura del autor.

     Son dos fallos, no uno, y por eso no basta con apagarlas mientras hay
     selección: con las zonas puestas, una palabra del 20 % de cualquier
     borde NO SE PUEDE SELECCIONAR tocándola, porque el toque que abre la
     selección tampoco encuentra texto. Cuarenta por ciento del ancho de
     un ensayo sin poder marcar.

     El arreglo quita código en vez de añadirlo: las zonas salen del
     reparto de toques y el borde se decide aquí mismo, por la X, dentro
     del único toque que ya decide todo lo demás. Con eso desaparece
     también `vozBajoLaZona()` y la familia entera de averías que existía
     para tapar —la llamada de cita intocable cerca del margen, el enlace
     del taller que retrocedía una página al tocarle el tercio izquierdo—:
     ahora el botón, el subrayado o la cita reciben su toque directamente,
     como cualquier otro. La trampa deja de poder existir en vez de quedar
     escrita en un comentario.

     Lo que se paga: en un ratón se pierde el cursor de flecha sobre los
     bordes. Se puede pagar —quien usa ratón tiene los botones ‹ › del
     pie, las flechas del teclado y la rueda, que son tres maneras— y lo
     que se compra es poder subrayar en todo el ancho.

     ⚠️ Y el ancho del borde se LEE de las propias zonas, no se escribe
     aquí: el 20 % vive en el CSS y dos números que tienen que decir lo
     mismo escritos en dos sitios se arreglan en uno. En modo
     desplazamiento las zonas están en `display:none`, así que miden cero
     y el borde no pasa página — que es justo lo que ese modo necesita. */
  const bordePagina = x => {
    const zi = document.getElementById('voz-z-izq');
    const zd = document.getElementById('voz-z-der');
    if (!zi || !zd) return 0;
    const ri = zi.getBoundingClientRect(), rd = zd.getBoundingClientRect();
    if (ri.width && x >= ri.left && x < ri.right) return -1;
    if (rd.width && x >= rd.left && x < rd.right) return 1;
    return 0;
  };

  hoja.addEventListener('click', e => {
    if (_vozTragarClic) return;
    /* Tocar un subrayado lo abre para cambiarle el color, ponerle nota
       o quitarlo. No apaga los mandos. */
    const mk = e.target && e.target.closest ? e.target.closest('mark.voz-hl') : null;
    if (mk) { e.preventDefault(); vozSubAbrirMarca(mk.dataset.subId, mk.getBoundingClientRect()); return; }
    /* Tocar una llamada a fuente abre su ficha encima, sin moverse de
       la página. Tampoco apaga los mandos: no es un toque al centro. */
    const cit = e.target && e.target.closest ? e.target.closest('.voz-cit') : null;
    if (cit) { e.preventDefault(); vozCitAbrirBtn(cit); return; }
    /* Los mandos de una tabla son botones: se dejan en paz. */
    if (e.target && e.target.closest && e.target.closest('.voz-tabla-mandos, .voz-tabla-cuerpo')) return;
    /* Y cualquier BOTÓN del texto (el enlace al taller del pie) hace lo
       suyo y NO apaga los mandos: tocarlo y que además desapareciera la
       barra sería la peor sorpresa posible. */
    if (e.target && e.target.closest && e.target.closest('a, mark, button')) return;
    if (vozCitAbierta()) { vozCitCerrar(); return; }
    /* Con una selección viva, el toque NO hace nada más que dejar que el
       navegador la deshaga: ni pasa página ni apaga los mandos. Quien
       acaba de marcar una frase y roza el borde no quiere irse de
       página, y el toque siguiente ya la encuentra sin selección. */
    if (haySeleccion()) return;
    if (vozSubBarraAbierta()) { vozSubCerrarBarra(); return; }
    const b = document.getElementById('voz-lector');
    if (!b) return;
    if (!document.getElementById('voz-panel-aa').hidden || !document.getElementById('voz-panel-ind').hidden) {
      vozCerrarPaneles();
      return;
    }
    /* El borde pasa página; el centro apaga y enciende los mandos.
       ⚠️ Y SOLO SI EL TOQUE TRAE COORDENADAS. Un `click` que no viene de
       un dedo ni de un ratón —el que dispara `elemento.click()`, o el que
       manda el teclado al pulsar Enter sobre algo con el foco— llega con
       `clientX` en CERO y `detail` en cero, o sea apuntando al borde
       izquierdo de la pantalla: sin esta guarda, pulsar Enter retrocedería
       una página en vez de apagar los mandos. Lo cazó la comprobación 27,
       que toca con `.click()`. */
    const lado = e.detail > 0 ? bordePagina(e.clientX) : 0;
    if (lado) { vozPasar(lado); return; }
    vozToqueCentro(b);
  });

  /* La rueda del ratón pasa página, como en un lector de escritorio.
     Con freno: una rueda libre manda veinte pasos en medio segundo. En
     desplazamiento la rueda es del navegador, que ya sabe desplazar. */
  mid.addEventListener('wheel', e => {
    if (vozModo() === 'scroll') return;
    const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(d) < 8) return;
    e.preventDefault();
    const ahora = Date.now();
    if (ahora < _vozRuedaHasta) return;
    _vozRuedaHasta = ahora + 380;
    vozPasar(d > 0 ? 1 : -1);
  }, { passive: false });

  /* En desplazamiento, la posición se apunta al parar de desplazar. */
  hoja.addEventListener('scroll', () => {
    if (vozModo() !== 'scroll') return;
    clearTimeout(_vozScrollTimer);
    _vozScrollTimer = setTimeout(() => { vozApuntarPos(); vozPintarPie(); }, 150);
  }, { passive: true });

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

  /* Al salir de pantalla completa —por donde sea: el gesto del
     sistema, Escape, el botón— las barras vuelven solas. Sin esto
     quedaría una pantalla normal sin mandos y sin ninguna pista de
     cómo recuperarlos. Y el ⛶ dice en qué estado está. */
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev =>
    document.addEventListener(ev, () => {
      const b = document.getElementById('voz-l-full');
      if (b) b.setAttribute('aria-pressed', vozEnPantallaCompleta() ? 'true' : 'false');
      if (!vozEnPantallaCompleta()) vozDesnudo(false);
    }));

  /* El permiso de no apagar la pantalla se pierde al irse a otra
     aplicación; al volver, se vuelve a pedir. */
  document.addEventListener('visibilitychange', () => {
    const sala = document.getElementById('voz-lector');
    if (document.visibilityState === 'visible' && sala && !sala.hidden && !_vozLuz) vozLuz(true);
  });

  /* ⚠️ MIENTRAS SE SELECCIONA, LA BARRA NO ESTÁ. Ver la nota de
     `VOZ_SUB_ESPERA`. Cada movimiento de la selección la cierra al
     instante y vuelve a poner el reloj a cero; solo se abre cuando la
     selección lleva un rato quieta. */
  document.addEventListener('selectionchange', () => {
    const sala = document.getElementById('voz-lector');
    if (!sala || sala.hidden) return;
    if (vozSubDentroDeLaBarra()) return;
    /* Con una marca abierta para editarla no hay nada que cerrar: eso
       no es una selección en curso, es un toque sobre lo ya subrayado. */
    if (!_vozSubEditando && vozSubBarraAbierta()) vozSubCerrarBarra();
    vozSubProgramar(VOZ_SUB_ESPERA);
  });
}

/* Las flechas del teclado y el escape. Se engancha una sola vez, en el
   documento, y solo hace algo con la sala abierta. */
document.addEventListener('keydown', e => {
  const sala = document.getElementById('voz-lector');
  if (!sala || sala.hidden) return;
  const dentroDeCampo = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '');
  if (dentroDeCampo) { if (e.key === 'Escape') { vozCerrarPaneles(); vozSubCerrarBarra(); } return; }
  /* Con el foco en una llamada, Enter y el espacio la abren en vez de
     pasar página: es lo que hace que la bibliografía se pueda consultar
     también con un teclado, y la misma regla del asa de arrastre —lo
     que solo se puede hacer con el dedo, a veces no se puede hacer—. */
  const citFoco = e.target && e.target.closest ? e.target.closest('.voz-cit') : null;
  if (citFoco && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); vozCitAbrirBtn(citFoco); return; }
  const scroll = vozModo() === 'scroll';
  const hoja = document.getElementById('voz-hoja');
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); vozPasar(1); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); vozPasar(-1); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); if (scroll && hoja) { hoja.style.scrollBehavior = ''; hoja.scrollTop += 80; } else vozPasar(1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); if (scroll && hoja) { hoja.style.scrollBehavior = ''; hoja.scrollTop -= 80; } else vozPasar(-1); }
  else if (e.key === 'Home') { e.preventDefault(); if (scroll && hoja) hoja.scrollTop = 0; else vozIrPagina(0); }
  else if (e.key === 'End') { e.preventDefault(); if (scroll && hoja) hoja.scrollTop = hoja.scrollHeight; else vozIrPagina(_vozPaginas - 1); }
  else if (e.key === 'Escape') {
    if (vozTablonCerrar()) return;
    if (vozCitAbierta()) { vozCitCerrar(); return; }
    if (vozSubBarraAbierta()) { vozSubCerrarBarra(); return; }
    const abierto = ['voz-panel-aa', 'voz-panel-ind'].some(id => { const p = document.getElementById(id); return p && !p.hidden; });
    if (abierto) vozCerrarPaneles();
    /* Con las barras escondidas, Escape las devuelve antes de cerrar
       nada: es la salida que no depende de saberse el toque doble. */
    else if (sala.classList.contains('voz-desnudo')) vozDesnudo(false);
    else vozCerrarLector();
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

/* ⚠️ EL MODO DESNUDO: LAS BARRAS DESAPARECEN DEL TODO, Y VUELVEN CON UN
   TOQUE DOBLE. Pedido por el autor el 10 de septiembre de 2026, con la
   captura de las barras rayadas en rojo: «pueda desaparecer esas
   barras, con un sutil toque de dos o tres aparezcan». Antes el modo
   desnudo las dejaba en opacidad 0.1 —un fantasma que seguía encima del
   texto— y un solo toque las devolvía.

   La asimetría de los toques es a propósito y va en los dos sentidos:
   · ESCONDERLAS cuesta UN toque, porque es la puerta de entrada a leer
     a página limpia y una puerta de dos toques no la encuentra nadie.
   · DEVOLVERLAS cuesta DOS toques seguidos, porque leyendo a página
     limpia el dedo roza el centro sin querer —al apoyar la mano, al
     errar el borde al pasar página— y si UN toque las devolviera, la
     lectura limpia se rompería a cada rato.
   · Y tras cada cambio hay un RESPIRO de medio segundo que se traga el
     toque de más: el segundo toque de un doble no re-esconde lo que el
     primero escondió, y el tercer toque de un triple no deshace lo que
     el doble acaba de hacer. Por eso «dos o tres» toques hacen lo
     mismo, que es exactamente como lo pidió el autor.
   Las barras siguen EN EL FLUJO (regla 8: quitarlas repaginaría el
   texto debajo del dedo); lo que cambia es que su opacidad baja a 0.
   Escape también las devuelve, para quien no se sepa el gesto. */
function vozDesnudo(poner) {
  const sala = document.getElementById('voz-lector');
  if (sala) sala.classList.toggle('voz-desnudo', !!poner);
}

function vozToqueCentro(sala) {
  const ahora = Date.now();
  if (ahora < _vozToqueFreno) return;
  if (!sala.classList.contains('voz-desnudo')) {
    sala.classList.add('voz-desnudo');
    _vozToqueFreno = ahora + 450;
    _vozToqueUltimo = 0;
    return;
  }
  if (ahora - _vozToqueUltimo < 450) {
    sala.classList.remove('voz-desnudo');
    _vozToqueFreno = ahora + 450;
    _vozToqueUltimo = 0;
  } else {
    _vozToqueUltimo = ahora;
  }
}

/* ⚠️ EL ⛶ DE LA BARRA HACE LAS DOS COSAS DE UNA VEZ: pantalla completa
   Y barras fuera. El ajuste ya existía, pero enterrado en Aa →
   Pantalla, y un acceso de tres toques no es un acceso directo. Salir
   —con el ⛶ otra vez, con Escape o con el gesto del sistema— devuelve
   las barras solo: quien sale de pantalla completa quiere sus mandos. */
function vozPantallaCompletaDirecta() {
  if (vozEnPantallaCompleta()) {
    vozPantallaCompleta(false);
    vozDesnudo(false);
  } else {
    vozPantallaCompleta(true);
    vozDesnudo(true);
  }
}

/* ══════════════════════════════════════════════════════════════════
   LOS SUBRAYADOS · el código de colores de la casa, dentro del cuento
   ══════════════════════════════════════════════════════════════════
   Pedido por el autor el 10 de septiembre de 2026: «seleccionar texto
   para remarcarlo según el código de colores que está en las lecturas
   de las misiones de Storytelling». Son los MISMOS cinco colores del
   marcador de las misiones (js/lecturas-marcador.js), con el mismo
   significado y la misma trama para la fotocopia, y viajan por la
   MISMA tabla (`lecturas_marcas`), con `mision = 'voz:<cid>'`: así lo
   que se subraya en la tableta está en el teléfono, y es de CADA QUIEN
   —la tabla lleva seguridad por fila con el usuario que entró—, igual
   que en las misiones. Un subrayado de la hija no le aparece al padre.

     🟡 DATO (D)        lo comprobable: una cifra, un nombre, un lugar.
     🟢 VOZ (V)         quién habla: el narrador, un personaje, la fuente.
     🔴 IDEA (I)        la tesis, el mecanismo, la imagen que sostiene.
     🔵 CONTRACITA (C)  la frase que estorba, la objeción.
     🟣 DUDA (?)        no lo entendí, o hay que verificar.

   ⚠️ LA MARCA SE GUARDA POR CARACTERES DENTRO DEL BLOQUE (ini, fin) Y
   CON EL TEXTO MARCADO. Los caracteres son lo que permite volver a
   pintarla; el texto es lo que permite comprobar que sigue apuntando a
   lo mismo si el texto se corrige, y lo que se copia a la lista de
   subrayados sin abrir el cuento. Si el trozo ya no está donde estaba,
   se busca; si aparece una sola vez, se reancla; si no, no se pinta
   pero NO se borra: perder la nota de alguien porque se arregló una
   coma sería el peor fallo posible de esto.

   ⚠️ Y SE PINTA TROCEANDO NODOS DE TEXTO, nunca con innerHTML: es el
   mismo texto pegado de siempre y F.A.R.O tiene dentro la Bóveda. */

const VOZ_CATS = [
  { id: 'dato',   ini: 'D', nombre: 'Dato',       ayuda: 'lo comprobable: una cifra, un nombre, un lugar' },
  { id: 'voz',    ini: 'V', nombre: 'Voz',        ayuda: 'quién habla: el narrador, un personaje, la fuente' },
  { id: 'idea',   ini: 'I', nombre: 'Idea',       ayuda: 'la tesis, el mecanismo, la imagen que sostiene' },
  { id: 'contra', ini: 'C', nombre: 'Contracita', ayuda: 'la frase que estorba, la objeción' },
  { id: 'duda',   ini: '?', nombre: 'Duda',       ayuda: 'no lo entendí, o hay que verificar' },
];
function vozCat(id) { return VOZ_CATS.find(c => c.id === id) || VOZ_CATS[2]; }

const VOZ_SUB = 'faro_voz_subrayados_v1';
const VOZ_SUB_TABLA = 'lecturas_marcas';
let _vozSubTodo = null;      // {cid: [marcas]}, lápidas incluidas
let _vozSubSel = null;       // la selección viva, sin marcar todavía
let _vozSubEditando = null;  // id de la marca que se está tocando
let _vozSubNube = 'local';   // local | subiendo | al-dia | sin-sesion | sin-tabla | sin-senal
let _vozSubTimer = null;
let _vozSubSincronizando = false;

function vozSubLeeTodo() {
  if (_vozSubTodo) return _vozSubTodo;
  try {
    const s = localStorage.getItem(VOZ_SUB);
    const v = s ? JSON.parse(s) : {};
    _vozSubTodo = (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
  } catch (e) { _vozSubTodo = {}; }
  return _vozSubTodo;
}

function vozSubGuardaTodo() {
  try { localStorage.setItem(VOZ_SUB, JSON.stringify(vozSubLeeTodo())); } catch (e) {}
}

/* Las marcas vivas y MÍAS de un texto. Las de otra persona que haya
   entrado en este aparato no se pintan: son suyas. Las que se hicieron
   sin sesión (sin dueño) se dan por mías, y la nube las firma al subir. */
function vozSubDe(cid) {
  const todas = vozSubLeeTodo()[cid] || [];
  return todas.filter(m => m && !m.del && (!m.user || !_vozYo || m.user === _vozYo));
}

function vozSubId() {
  return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* El contenedor del texto de un bloque: en una lista, el texto sin la
   viñeta, para que los caracteres se cuenten sobre lo que se lee. */
function vozCuerpoDe(el) {
  return el.querySelector('.voz-li-txt') || el;
}

/* Los trozos de nodo de texto que cubren [ini, fin) dentro de un
   contenedor, en orden. */
function vozTrozosDe(cont, ini, fin) {
  const trozos = [];
  const w = document.createTreeWalker(cont, NodeFilter.SHOW_TEXT);
  let pos = 0, n;
  while ((n = w.nextNode())) {
    const len = n.nodeValue.length;
    const a = pos, b = pos + len;
    if (b > ini && a < fin) trozos.push({ n: n, desde: Math.max(0, ini - a), hasta: Math.min(len, fin - a) });
    pos = b;
    if (pos >= fin) break;
  }
  return trozos;
}

/* Envuelve unos trozos en el elemento que devuelva `hacer`. El corte se
   hace de atrás hacia adelante dentro de cada nodo para que el primer
   splitText no invalide el desplazamiento del segundo. */
function vozEnvolverTrozos(trozos, hacer) {
  return trozos.map((t, k) => {
    let nodo = t.n;
    if (t.hasta < nodo.nodeValue.length) nodo.splitText(t.hasta);
    if (t.desde > 0) nodo = nodo.splitText(t.desde);
    const el = hacer(k, trozos.length);
    nodo.parentNode.replaceChild(el, nodo);
    el.appendChild(nodo);
    return el;
  });
}

function vozAplicarSubrayados(el, cid, cap, vp) {
  const marcas = vozSubDe(cid).filter(m => m.cap === cap && m.vp === vp);
  if (!marcas.length) return;
  const cont = vozCuerpoDe(el);
  const plano = cont.textContent;
  marcas.sort((a, b) => a.i - b.i).forEach(m => {
    let i = m.i, f = m.f;
    if (plano.slice(i, f) !== m.t) {
      /* El texto se movió: se reancla solo si el trozo aparece UNA vez.
         Si aparece dos, adivinar cuál era es peor que no pintar. */
      const k = plano.indexOf(m.t);
      if (k < 0 || plano.indexOf(m.t, k + 1) >= 0) return;
      i = k; f = k + m.t.length;
      m.i = i; m.f = f;
    }
    const trozos = vozTrozosDe(cont, i, f);
    if (!trozos.length) return;
    const cat = vozCat(m.c);
    vozEnvolverTrozos(trozos, (k, total) => {
      const mk = vozNodo('mark', 'voz-hl voz-hl-' + cat.id + (k === total - 1 ? ' voz-hl-fin' : '') + (m.n ? ' voz-hl-nota' : ''));
      mk.dataset.subId = m.id;
      mk.dataset.ini = cat.ini;
      mk.tabIndex = 0;
      mk.setAttribute('role', 'button');
      mk.setAttribute('aria-label', cat.nombre + (m.n ? ', con nota' : '') + ': ' + m.t.slice(0, 60));
      return mk;
    });
  });
}

/* ─── La selección ─── */
function vozLeerSeleccionSala() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || sel.isCollapsed) return null;
  const r = sel.getRangeAt(0);
  const texto = document.getElementById('voz-texto');
  if (!texto) return null;
  const bloqueDe = n => { if (!n) return null; const e = n.nodeType === 3 ? n.parentElement : n; return e && e.closest ? e.closest('#voz-texto [data-vp]') : null; };
  const bIni = bloqueDe(r.startContainer), bFin = bloqueDe(r.endContainer);
  if (!bIni || !bFin) return null;
  if (bIni !== bFin) return { varios: true };
  const vp = Number(bIni.dataset.vp);
  if (!(vp >= 0)) return null;
  const cont = vozCuerpoDe(bIni);
  let ini;
  try {
    /* El desplazamiento se mide sobre el texto del bloque, no sobre su
       HTML: así una marca sigue valiendo aunque el bloque ya tenga otras
       marcas pintadas encima, que cambian el HTML pero no el texto. */
    const antes = document.createRange();
    antes.selectNodeContents(cont);
    antes.setEnd(r.startContainer, r.startOffset);
    ini = antes.toString().length;
  } catch (e) { return null; }
  const plano = cont.textContent;
  const fin = Math.min(plano.length, ini + r.toString().length);
  const t = plano.slice(ini, fin);
  if (!t.trim()) return null;
  return { cap: Number(bIni.dataset.cap) || 0, vp: vp, i: ini, f: fin, t: t, caja: r.getBoundingClientRect() };
}

/* ⚠️ LA BARRA DE SUBRAYAR NO SALE MIENTRAS SE ESTÁ SELECCIONANDO.
   Pedido por el autor el 12 de septiembre de 2026, con la captura de su
   tableta delante: «quiero que al momento de seleccionar desaparezca y
   que solo al momento de terminar lo seleccionado aparezca… para que no
   me estorbe cuando estoy seleccionando».

   Salía a los 260 milésimas de que la selección dejara de moverse, y en
   una tableta eso es MIENTRAS se selecciona: los tiradores se arrastran
   a tirones, con pausas para mirar dónde va el borde, y cada pausa de un
   cuarto de segundo plantaba la barra ENCIMA del párrafo — tapando
   justo lo que hay que ver para elegir el trozo. Y encima de ella
   Android pone su propia barra de copiar, así que quedaban dos.

   Ahora: cada movimiento de la selección la cierra al instante, y solo
   se abre cuando la selección lleva TRES SEGUNDOS quieta. Tres es el
   número que pidió el autor y es el que hace falta con el dedo: con
   menos, una pausa para mirar se lee como «ya terminé».

   ⚠️ Y CON EL RATÓN NO SE ESPERA, porque ahí SÍ existe un gesto que
   dice «ya terminé»: soltar el botón. Con el dedo no existe —los
   tiradores son del sistema y no nos avisan de nada—, y por eso allí
   hay que adivinarlo por el reloj. Esperar tres segundos delante de una
   computadora, donde el gesto es inequívoco, sería tiempo muerto por
   nada. */
const VOZ_SUB_ESPERA = 3000;
let _vozSelTimer = null;

function vozSubProgramar(ms) {
  clearTimeout(_vozSelTimer);
  _vozSelTimer = setTimeout(vozSubAlSeleccionar, ms);
}

/* ⚠️ ESCRIBIR EN LA BARRA CAMBIA LA SELECCIÓN DE LA PÁGINA, Y ESO NO ES
   SELECCIONAR. Tocar «✎ Nota» lleva el foco al recuadro de la nota, y
   el navegador recoge la selección del texto al hacerlo: sin esta
   guarda, abrir la nota CERRABA la barra que acababa de abrirla —el
   recuadro aparecía y se iba en el mismo gesto— y la nota no se
   guardaba nunca. Lo mismo tocando un color. Lo cazó la sonda al poner
   los tres segundos: antes el fallo existía igual, pero solo dentro de
   la ventana de 260 ms, así que unas veces pasaba y otras no. */
function vozSubDentroDeLaBarra() {
  const a = document.activeElement;
  return !!(a && a.closest && a.closest('#voz-subbar, #voz-citbar'));
}

function vozSubAlSeleccionar() {
  if (_vozSubEditando) return;
  if (vozSubDentroDeLaBarra()) return;
  const s = vozLeerSeleccionSala();
  if (s && s.varios) { vozSubCerrarBarra(); return; }
  if (s) { _vozSubSel = s; vozSubAbrirBarra(s.t, null, s.caja); }
  else if (_vozSubSel) { _vozSubSel = null; vozSubCerrarBarra(); }
}

/* ─── La barra ───
   Vive DENTRO de la sala (se tiñe con el papel) y se abre pegada a lo
   seleccionado: debajo si cabe, encima si no, y al pie si no cabe en
   ninguno. Con cinco colores de 44 px: es el dedo quien la usa. */
function vozSubBarra() {
  let b = document.getElementById('voz-subbar');
  if (b) return b;
  const sala = document.getElementById('voz-lector');
  if (!sala) return null;
  b = vozNodo('div', 'voz-subbar');
  b.id = 'voz-subbar';
  b.hidden = true;
  b.setAttribute('role', 'toolbar');
  b.setAttribute('aria-label', 'Subrayar');
  b.appendChild(vozNodo('div', 'voz-subbar-txt'));
  const colores = vozNodo('div', 'voz-subbar-colores');
  VOZ_CATS.forEach(c => {
    const btn = vozBoton('voz-subbar-color voz-subbar-color-' + c.id, null, () => vozSubMarcarCon(c.id), c.nombre + ': ' + c.ayuda);
    btn.dataset.cat = c.id;
    btn.appendChild(vozNodo('span', 'voz-subbar-ini', c.ini));
    btn.appendChild(vozNodo('span', 'voz-subbar-nombre', c.nombre));
    colores.appendChild(btn);
  });
  b.appendChild(colores);
  const acciones = vozNodo('div', 'voz-subbar-acciones');
  acciones.appendChild(vozBoton('voz-subbar-acc voz-subbar-nota-btn', '✎ Nota', () => vozSubAbrirNota()));
  /* El marcador de lectura vive aquí, con los colores, porque es el
     mismo gesto: se selecciona y se decide qué se hace con lo
     seleccionado. En un botón aparte habría que soltar el texto,
     buscarlo y volver. Calcado de la barra de las misiones. */
  acciones.appendChild(vozBoton('voz-subbar-acc voz-subbar-lugar', '🔖 Aquí me quedé', () => vozSubAquiMeQuede(), 'Poner el marcador de lectura en este párrafo'));
  acciones.appendChild(vozBoton('voz-subbar-acc voz-subbar-quitar', '🗑 Quitar', () => vozSubQuitar(_vozSubEditando)));
  acciones.appendChild(vozBoton('voz-subbar-acc voz-subbar-cerrar', '✕ Cerrar', () => {
    try { window.getSelection().removeAllRanges(); } catch (e) {}
    vozSubCerrarBarra();
  }, 'Cerrar'));
  b.appendChild(acciones);
  const nota = vozNodo('div', 'voz-subbar-notacaja');
  nota.hidden = true;
  const ta = vozNodo('textarea', 'voz-subbar-notatxt');
  ta.rows = 3;
  ta.placeholder = 'Tu nota sobre este trozo';
  ta.setAttribute('aria-label', 'Nota del subrayado');
  nota.appendChild(ta);
  nota.appendChild(vozBoton('voz-subbar-acc', '💾 Guardar nota', () => vozSubGuardarNota(ta.value)));
  b.appendChild(nota);
  sala.appendChild(b);
  return b;
}

function vozSubBarraAbierta() {
  const b = document.getElementById('voz-subbar');
  return !!(b && !b.hidden);
}

function vozSubAbrirBarra(texto, catActiva, caja) {
  const b = vozSubBarra();
  if (!b) return;
  const editando = !!_vozSubEditando;
  b.querySelector('.voz-subbar-txt').textContent = '«' + String(texto || '').replace(/\s+/g, ' ').slice(0, 110) + (texto && texto.length > 110 ? '…' : '') + '»';
  b.querySelectorAll('.voz-subbar-color').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.cat === catActiva ? 'true' : 'false');
  });
  /* Las acciones se ven SIEMPRE, como en la barra de las misiones
     (pedido del autor, 10 de septiembre de 2026): una selección nueva
     también puede anotarse, marcar el lugar o cerrarse. Lo que cambia
     por modo es qué botones: sobre una marca ya puesta no hay trozo
     nuevo al que llevar el marcador —«Aquí me quedé» se calla en vez de
     mentir— y sobre una selección nueva no hay nada que quitar. */
  b.querySelector('.voz-subbar-acciones').hidden = false;
  b.querySelector('.voz-subbar-quitar').hidden = !editando;
  b.querySelector('.voz-subbar-lugar').hidden = editando;
  b.querySelector('.voz-subbar-notacaja').hidden = true;
  b.classList.toggle('voz-subbar-editando', editando);
  b.hidden = false;
  vozSubColocarBarra(caja);
}

function vozSubColocarBarra(caja) {
  vozColocarFlotante(document.getElementById('voz-subbar'), caja, 'voz-subbar-abajo');
}

/* Pegar algo a un trozo del texto: debajo si cabe, encima si no, y al
   pie si no cabe en ninguno de los dos. Lo usan la barra de subrayar y
   la ficha de la fuente citada, y está en un solo sitio a propósito:
   con dos copias, una se quedaría vieja el día que alguien arregle la
   otra, y sería la que menos se mira. */
function vozColocarFlotante(b, caja, claseAbajo) {
  const sala = document.getElementById('voz-lector');
  if (!b || !sala) return;
  b.classList.remove(claseAbajo);
  const alPie = () => { b.classList.add(claseAbajo); b.style.left = ''; b.style.top = ''; };
  const sr = sala.getBoundingClientRect();
  const bw = b.offsetWidth, bh = b.offsetHeight;
  if (!caja || !caja.height) { alPie(); return; }
  const arriba = caja.top - sr.top, abajo = caja.bottom - sr.top;
  const pie = sala.clientHeight - 64;
  let top;
  if (abajo + 10 + bh < pie) top = abajo + 10;
  else if (arriba - 10 - bh > 60) top = arriba - 10 - bh;
  else { alPie(); return; }
  const centro = (caja.left + caja.right) / 2 - sr.left;
  b.style.left = Math.max(8, Math.min(sala.clientWidth - bw - 8, centro - bw / 2)) + 'px';
  b.style.top = top + 'px';
}

function vozSubCerrarBarra() {
  const b = document.getElementById('voz-subbar');
  if (b) b.hidden = true;
  _vozSubEditando = null;
  _vozSubSel = null;
}

function vozSubAbrirMarca(id, caja) {
  const c = _vozLeyendo;
  if (!c || !id) return;
  const m = vozSubDe(c.cid).find(x => x.id === id);
  if (!m) return;
  _vozSubSel = null;
  _vozSubEditando = id;
  vozSubAbrirBarra(m.t, m.c, caja);
  const ta = document.querySelector('#voz-subbar .voz-subbar-notatxt');
  if (ta) ta.value = m.n || '';
}

function vozSubAbrirNota() {
  const b = document.getElementById('voz-subbar');
  if (!b) return;
  const caja = b.querySelector('.voz-subbar-notacaja');
  caja.hidden = !caja.hidden;
  if (!caja.hidden) { const ta = caja.querySelector('textarea'); if (ta) ta.focus(); }
}

/* ─── Crear, cambiar, anotar, quitar ─── */
function vozSubGuardaMarca(m) {
  const c = _vozLeyendo;
  if (!c) return;
  const todo = vozSubLeeTodo();
  const lista = todo[c.cid] || (todo[c.cid] = []);
  const k = lista.findIndex(x => x.id === m.id);
  if (k >= 0) lista[k] = m; else lista.push(m);
  vozSubGuardaTodo();
  vozSubPedirNube();
}

function vozSubMarcarCon(cat) {
  const c = _vozLeyendo;
  if (!c) return;
  if (_vozSubEditando) {
    const m = vozSubDe(c.cid).find(x => x.id === _vozSubEditando);
    if (!m) return;
    m.c = cat; m.u = Date.now();
    vozSubGuardaMarca(m);
    vozSubRepintar(m.cap, m.vp);
    vozSubCerrarBarra();
    return;
  }
  const s = _vozSubSel || vozLeerSeleccionSala();
  if (!s || s.varios) { vozAviso('Selecciona dentro de un mismo párrafo'); return; }
  const m = { id: vozSubId(), cap: s.cap, vp: s.vp, i: s.i, f: s.f, t: s.t, c: cat, n: '', u: Date.now(), del: false, user: _vozYo || null };
  vozSubGuardaMarca(m);
  try { window.getSelection().removeAllRanges(); } catch (e) {}
  vozSubCerrarBarra();
  vozSubRepintar(m.cap, m.vp);
  vozAviso(vozCat(cat).ini + ' · ' + vozCat(cat).nombre + ' subrayada');
}

function vozSubGuardarNota(texto) {
  const c = _vozLeyendo;
  if (!c) return;
  const nota = String(texto || '').trim();
  if (_vozSubEditando) {
    const m = vozSubDe(c.cid).find(x => x.id === _vozSubEditando);
    if (!m) return;
    m.n = nota;
    m.u = Date.now();
    vozSubGuardaMarca(m);
    vozSubRepintar(m.cap, m.vp);
    vozSubCerrarBarra();
    vozAviso(m.n ? '✎ Nota guardada' : 'Nota quitada');
    return;
  }
  /* Anotar sin haber elegido color todavía: se marca como DUDA, que es
     lo que casi siempre es una nota escrita a bote pronto, y se cambia
     de color después tocándola. Igual que en las misiones. */
  const s = _vozSubSel || vozLeerSeleccionSala();
  if (!s || s.varios) { vozSubCerrarBarra(); return; }
  const m = { id: vozSubId(), cap: s.cap, vp: s.vp, i: s.i, f: s.f, t: s.t, c: 'duda', n: nota, u: Date.now(), del: false, user: _vozYo || null };
  vozSubGuardaMarca(m);
  try { window.getSelection().removeAllRanges(); } catch (e) {}
  vozSubCerrarBarra();
  vozSubRepintar(m.cap, m.vp);
  vozAviso(nota ? '✎ Nota guardada, marcada como ? · Duda' : '? · Duda subrayada');
}

/* «🔖 Aquí me quedé» desde la selección. El marcador cae en el PÁRRAFO
   seleccionado —no en la página, que cambia con la letra—, con el trozo
   como extracto y la fracción del punto donde empieza la selección: así
   sobrevive a un cambio de letra como los demás marcadores. Si ese
   párrafo ya tenía marcador, se pisa: dos marcadores en el mismo
   párrafo no separan nada. */
function vozSubAquiMeQuede() {
  const c = _vozLeyendo;
  const s = _vozSubSel || vozLeerSeleccionSala();
  if (!c || !s || s.varios) { vozSubCerrarBarra(); return; }
  let sub = 0;
  try {
    const el = document.querySelector('#voz-texto [data-cap="' + s.cap + '"][data-vp="' + s.vp + '"]');
    const largo = el ? vozCuerpoDe(el).textContent.length : 0;
    if (largo > 0) sub = Math.max(0, Math.min(1, s.i / largo));
  } catch (e) {}
  const lista = vozLeeMarcas(c.cid).filter(m => !(m.cap === s.cap && m.vp === s.vp));
  lista.push({ cap: s.cap, vp: s.vp, sub: Math.round(sub * 1000) / 1000,
               txt: s.t.length > 110 ? s.t.slice(0, 108).replace(/\s+\S*$/, '') + '…' : s.t,
               cuando: Date.now() });
  lista.sort((a, b) => a.cap - b.cap || a.vp - b.vp || a.sub - b.sub);
  vozGuardaMarcas(c.cid, lista);
  try { window.getSelection().removeAllRanges(); } catch (e) {}
  vozSubCerrarBarra();
  vozPintarBotonMarca();
  vozPintarBarraMarcas();
  const panel = document.getElementById('voz-panel-ind');
  if (panel && !panel.hidden && _vozPanelTab === 'marcas') vozPintarPanelInd('marcas');
  vozAviso('🔖 Aquí te quedaste: marcador puesto en este párrafo');
}

/* ⚠️ Quitar es poner LÁPIDA, no borrar: si este aparato borrara la
   marca, la tableta que aún la tiene la subiría otra vez. */
function vozSubQuitar(id) {
  const c = _vozLeyendo;
  if (!c || !id) return;
  const m = (vozSubLeeTodo()[c.cid] || []).find(x => x.id === id);
  if (!m) return;
  m.del = true; m.u = Date.now();
  vozSubGuardaMarca(m);
  vozSubCerrarBarra();
  vozSubRepintar(m.cap, m.vp);
  const panel = document.getElementById('voz-panel-ind');
  if (panel && !panel.hidden && _vozPanelTab === 'subs') vozPintarPanelInd('subs');
}

/* Vuelve a pintar un solo bloque con sus marcas, sin tocar el resto:
   repintar el capítulo entero le arrancaría la selección y la página de
   debajo del dedo. En páginas, después se recoloca por el párrafo
   apuntado, porque una marca puede mover una línea. */
function vozSubRepintar(cap, vp) {
  const c = _vozLeyendo;
  const texto = document.getElementById('voz-texto');
  if (!c || !texto) return;
  const viejo = texto.querySelector('[data-cap="' + cap + '"][data-vp="' + vp + '"]');
  const capitulo = (c.capitulos || [])[cap];
  if (!viejo || !capitulo) return;
  const p = (capitulo.p || [])[vp];
  if (!p) return;
  const anterior = vp > 0 ? capitulo.p[vp - 1] : null;
  const nuevo = vozNodoBloque(p, vp, anterior, cap);
  viejo.parentNode.replaceChild(nuevo, viejo);
  if (vozModo() !== 'scroll') vozPaginar(_vozAncla, _vozSub);
}

/* ─── La nube: la misma tabla que el marcador de las misiones ─── */
function vozSubAFila(m, yo, cid) {
  return {
    id: m.id, user_id: yo, mision: 'voz:' + cid, zona: 'cap' + (m.cap || 0), parrafo: m.vp,
    ini: m.i, fin: m.f, texto: m.t, color: m.c, nota: m.n || '', borrada: !!m.del,
    actualizado: m.u || 0, fecha: new Date(m.u || Date.now()).toLocaleDateString('es-HN'),
  };
}

function vozSubDeFila(r) {
  return {
    id: r.id, cap: parseInt(String(r.zona || '').replace(/^cap/, ''), 10) || 0, vp: r.parrafo,
    i: r.ini, f: r.fin, t: r.texto, c: r.color, n: r.nota || '', u: r.actualizado || 0,
    del: !!r.borrada, user: r.user_id, sync: r.actualizado || 0,
  };
}

function vozSubPedirNube() {
  if (!_vozLeyendo) return;
  const cid = _vozLeyendo.cid;
  if (_vozSubNube === 'al-dia') _vozSubNube = 'pendiente';
  clearTimeout(_vozSubTimer);
  _vozSubTimer = setTimeout(() => vozSubSincronizar(cid), 2500);
}

/* Baja lo de la nube para ESTE texto y ESTE usuario, fusiona por
   identificador (gana la versión más nueva por el reloj del aparato) y
   sube lo que aquí es más nuevo o no estaba. Igual que el marcador de
   las misiones, con la misma tabla. */
async function vozSubSincronizar(cid) {
  if (_vozSubSincronizando) return;
  const sb = vozSb();
  if (!sb) { _vozSubNube = 'sin-sesion'; vozSubPintarEstado(); return; }
  const yo = await vozYo();
  if (!yo) { _vozSubNube = 'sin-sesion'; vozSubPintarEstado(); return; }
  _vozSubSincronizando = true;
  _vozSubNube = 'subiendo'; vozSubPintarEstado();
  try {
    const todo = vozSubLeeTodo();
    const mias = todo[cid] || (todo[cid] = []);
    /* Lo marcado sin sesión pasa a ser de quien entró. */
    mias.forEach(m => { if (!m.user) m.user = yo; });

    const { data, error } = await vozConReloj(sb.from(VOZ_SUB_TABLA)
      .select('*').eq('mision', 'voz:' + cid).eq('user_id', yo));
    if (error) {
      if (error.code === '42P01' || /relation .* does not exist/i.test(error.message || '')) _vozSubNube = 'sin-tabla';
      else _vozSubNube = 'sin-senal';
      vozSubGuardaTodo(); vozSubPintarEstado();
      return;
    }
    const remotas = (data || []).map(vozSubDeFila);
    const porId = new Map(mias.map(m => [m.id, m]));
    const subir = [];
    let cambio = false;
    remotas.forEach(r => {
      const l = porId.get(r.id);
      if (!l) { porId.set(r.id, r); cambio = true; return; }
      if ((r.u || 0) > (l.u || 0)) { porId.set(r.id, Object.assign({}, r)); cambio = true; }
      else if ((l.u || 0) > (r.u || 0) || (l.sync || 0) < (l.u || 0)) subir.push(l);
    });
    porId.forEach(m => { if (m.user === yo && !remotas.find(r => r.id === m.id)) subir.push(m); });
    todo[cid] = [...porId.values()];
    if (subir.length) {
      const { error: e2 } = await vozConReloj(sb.from(VOZ_SUB_TABLA)
        .upsert(subir.map(m => vozSubAFila(m, yo, cid)), { onConflict: 'id' }));
      if (e2) { _vozSubNube = e2.code === 'FARO_RELOJ' ? 'sin-senal' : 'error'; vozSubGuardaTodo(); vozSubPintarEstado(); return; }
      subir.forEach(m => { m.sync = m.u || 0; });
    }
    vozSubGuardaTodo();
    _vozSubNube = 'al-dia';
    if (cambio && _vozLeyendo && _vozLeyendo.cid === cid) {
      /* La nube trajo marcas que aquí no estaban: se repinta guardando
         el sitio, como con un cambio de letra. */
      vozPintarCap(_vozAncla, _vozSub);
    }
  } catch (e) {
    _vozSubNube = 'error';
  } finally {
    _vozSubSincronizando = false;
    vozSubPintarEstado();
  }
}

function vozSubRotuloNube() {
  if (_vozSubNube === 'al-dia')     return '☁️ Tus subrayados también están en la nube, y solo los ves tú.';
  if (_vozSubNube === 'subiendo' || _vozSubNube === 'pendiente') return '⏳ Guardando en la nube…';
  if (_vozSubNube === 'sin-tabla')  return '📴 Solo en este aparato: falta correr lecturas_marcas.sql';
  if (_vozSubNube === 'sin-sesion') return '📴 Solo en este aparato: entra en F.A.R.O para que viajen';
  if (_vozSubNube === 'sin-senal')  return '📡 Sin señal: se guardan aquí y suben cuando vuelva';
  if (_vozSubNube === 'error')      return '⚠️ La nube rechazó los subrayados; se quedan en este aparato';
  return '📴 Solo en este aparato por ahora';
}

function vozSubPintarEstado() {
  const e = document.getElementById('voz-sub-estado');
  if (e) e.textContent = vozSubRotuloNube();
}

/* Lo subrayado, en texto plano, para copiarlo o pegarlo en un chat. Va
   con la etiqueta del texto delante, como todo lo que sale de aquí. */
function vozSubTextoPlano(c) {
  const marcas = vozSubDe(c.cid).slice().sort((a, b) => a.cap - b.cap || a.vp - b.vp || a.i - b.i);
  const L = [];
  L.push('Subrayados de «' + (c.titulo || 'Sin título') + '»');
  L.push(vozGenero(c.genero).t + ' escrito por ' + (c.maquina || 'una máquina') + ', al modo de ' + (c.voz || '—') + '.');
  L.push('');
  let capAnt = -1;
  marcas.forEach(m => {
    if (m.cap !== capAnt) { capAnt = m.cap; L.push('── ' + vozNombreCap(c, m.cap) + ' ──'); }
    L.push('[' + vozCat(m.c).nombre.toUpperCase() + '] «' + m.t + '»' + (m.n ? ' — ' + m.n : ''));
  });
  if (!marcas.length) L.push('(sin subrayados)');
  return L.join('\n') + '\n';
}

/* ══════════════════════════════════════════════════════════════════
   LA REPISA DE RECURSOS DE UN TEXTO
   ══════════════════════════════════════════════════════════════════
   Pedido por el autor el 18 de septiembre de 2026: «la posibilidad de
   agregar en las lecturas algún vínculo url o dirección de una app, que
   podría ser un recurso para reforzar el aprendizaje o asimilación de la
   lectura».

   ⚠️ Y VIAJA POR `recursos_enlaces`, LA TABLA DE LAS MISIONES, CON
   `mision = 'voz:<cid>'`. No se inventa una segunda tabla para el mismo
   gesto: es exactamente lo que ya hacen los subrayados con
   `lecturas_marcas` (regla 21) y la bibliografía dentro de `capitulos`
   (regla 27). Y tiene una consecuencia que es media herramienta: **esto
   no pide ni una columna nueva ni volver a correr el SQL desde una
   tableta**. `recursos_enlaces.mision` es texto libre, sin `check` ni
   llave ajena, así que un prefijo basta para que los enlaces de un texto
   y los de una misión no se mezclen nunca.

   DE QUIÉN SON: DE LA CASA, como el texto y como la repisa de las
   misiones — y al contrario que los subrayados, que son de cada quien.
   Un recurso que refuerza una lectura sirve a los cuatro; uno que solo
   viera quien lo pegó habría que pegarlo cuatro veces. Los cuatro los
   ven; quitar y corregir es solo de quien lo puso, y eso lo hace cumplir
   la seguridad por fila, no la pantalla.

   ⚠️ SOLO `http` Y `https`, COMPROBADO CON `URL()`. Aquí el dato acaba
   dentro de un `href` de una página que tiene al lado la Bóveda, las
   finanzas, el chat y los teléfonos del Buzón. Nunca con un grep, que
   `java\tscript:` y `JavaScript:` lo pasan y el navegador los ejecuta
   igual (regla 2 de la repisa). Y con `rel="noopener noreferrer"`: sin
   `noopener`, la página que se abre puede tocar `window.opener` y esa
   ventana es F.A.R.O con la sesión de la casa puesta.

   ⚠️ Y LO QUE SE PIDIÓ COMO «DIRECCIÓN DE UNA APP» ES UNA `https`, no un
   esquema propio. No es un recorte: los enlaces de aplicación de Android
   (App Links) SON direcciones `https`, así que un enlace a
   `https://www.duolingo.com/…` abre la aplicación si está instalada, y
   abre la web si no — que es lo que hace falta cuando el mismo texto se
   lee en cuatro aparatos. Un `duolingo://` no se puede comprobar, no se
   puede abrir desde media pantalla y deja la puerta abierta a cualquier
   otro esquema, `javascript:` incluido. Cuando se pega otra cosa, la
   pantalla lo DICE y nombra qué poner en su lugar: un rechazo callado se
   ve desde fuera igual que una herramienta rota (regla 14).

   LO QUE NO LLEVA, Y SE DICE: no hay arrastre para ordenar. La repisa de
   las misiones lo tiene porque allí se cuelgan diez cosas de NotebookLM;
   un texto lleva tres o cuatro recursos, y montar el aparato de punteros
   para tres tarjetas es código que se mantiene y no se usa. Se ordenan
   por la columna `orden` —que ya existe y es de cada quien— y, a igualdad,
   por cuándo se pusieron.
   ══════════════════════════════════════════════════════════════════ */

const VOZ_REC = 'faro_voz_recursos_v1';
const VOZ_REC_TABLA = 'recursos_enlaces';

/* ⚠️ LOS TIPOS VIVEN EN EL APARATO, NO EN LA BASE. La columna `tipo` no
   lleva `check` a propósito (regla 8 de la repisa, regla 15 de aquí):
   añadir uno tiene que ser esta línea, no una migración que alguien pega
   desde una tableta. El primero es el de por defecto. */
const VOZ_REC_TIPOS = [
  { id: 'app',       ic: '📱', t: 'App o web' },
  { id: 'video',     ic: '🎬', t: 'Video' },
  { id: 'audio',     ic: '🎧', t: 'Audio' },
  { id: 'ejercicio', ic: '🎮', t: 'Ejercicios' },
  { id: 'lectura',   ic: '📄', t: 'Otra lectura' },
  { id: 'curso',     ic: '🎓', t: 'Curso o clase' },
  { id: 'mapa',      ic: '🗺️', t: 'Mapa o esquema' },
];
function vozRecTipo(id) {
  return VOZ_REC_TIPOS.find(t => t.id === id) || VOZ_REC_TIPOS[0];
}

/* ⚠️ Y LA ETIQUETA DE MÁQUINA NO SE APAGA, tampoco aquí. Es la regla de
   oro del Estudio Mayor y la regla 1 de esta herramienta: un recurso que
   recomendó una máquina puede estar inventado con el mismo tono seguro
   con el que dice los buenos, y colgarlo sin distinguirlo al lado de uno
   que alguien abrió y comprobó es el chiste malo. Son dos y no van a ser
   más, y por eso `origen` SÍ lleva `check` en la base.
   Viene puesto «la casa» porque pegar una dirección con la propia mano ES
   la casa eligiendo; lo otro es un toque y se ve en la tarjeta, así que
   una etiqueta equivocada se ve y se arregla — al contrario que una que
   no estuviera. */
const VOZ_REC_ORIGENES = [
  { id: 'casa',    ic: '🏠', t: 'Lo elegí yo',       corto: 'de la casa' },
  { id: 'maquina', ic: '🤖', t: 'Lo trajo una máquina', corto: 'lo trajo una máquina' },
];

let _vozRecTodo = null;         // {cid: [recursos]}, lápidas incluidas
let _vozRecNube = 'local';      // local | subiendo | pendiente | al-dia | sin-sesion | sin-tabla | sin-senal | ajeno | error
let _vozRecTimer = null;
let _vozRecSincronizando = false;
let _vozRecOtraVuelta = null;
let _vozRecEnHoja = null;       // {cid, id} del que se está escribiendo
let _vozRecAuto = {};           // ⚠️ qué rellenó la pantalla: ver vozRecMiraUrl
let _vozRecMiembro = { uid: '', nombre: '' };

function vozRecLeeTodo() {
  if (_vozRecTodo) return _vozRecTodo;
  try {
    const s = localStorage.getItem(VOZ_REC);
    const v = s ? JSON.parse(s) : {};
    _vozRecTodo = (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
  } catch (e) { _vozRecTodo = {}; }
  return _vozRecTodo;
}

function vozRecGuardaTodo() {
  try { localStorage.setItem(VOZ_REC, JSON.stringify(vozRecLeeTodo())); } catch (e) {}
}

/* Los vivos de un texto, DE TODA LA CASA (aquí no se filtra por quien
   entró: eso es lo de los subrayados). Ordenados por `orden` y, a
   igualdad, por cuándo se pusieron. */
function vozRecDe(cid) {
  return (vozRecLeeTodo()[cid] || [])
    .filter(r => r && !r.del)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0) || (a.u || 0) - (b.u || 0));
}

function vozRecCuenta(cid) { return vozRecDe(cid).length; }

function vozRecId() {
  return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* Es mío si lo puse yo, o si todavía no lo ha firmado nadie (se puso sin
   sesión y la subida lo firmará). Igual que vozEsMio y vozActEsMio. */
function vozRecEsMio(r) {
  return !!r && (!r.user || !_vozYo || r.user === _vozYo);
}

/* El nombre corto de quien entró, para poder enseñarlo en la tarjeta sin
   una segunda consulta por recurso. Se pregunta UNA vez y se recuerda: no
   cambia entre un viaje a la nube y el siguiente, y preguntarlo en cada
   sincronización doblaba las peticiones de la repisa de las misiones a
   cambio de nada. NO se usa para permisos nunca —lo escribe el aparato—:
   para eso está `anadido_por`, que lo comprueba la seguridad por fila. */
async function vozRecMiembro(yo) {
  if (!yo) return '';
  if (_vozRecMiembro.uid === yo) return _vozRecMiembro.nombre;
  const sb = vozSb();
  if (!sb) return '';
  try {
    const r = await sb.from('familia_miembros').select('miembro').eq('user_id', yo).maybeSingle();
    const n = (r && r.data && r.data.miembro) ? String(r.data.miembro) : '';
    /* Solo se recuerda si de verdad se supo: guardar el vacío dejaría los
       recursos sin nombre hasta recargar la página. */
    if (n) _vozRecMiembro = { uid: yo, nombre: n };
    return n;
  } catch (e) { return ''; }
}

/* ── La dirección ──────────────────────────────────────────────────
   Con `URL()` y nada más, y devolviendo el MOTIVO cuando no vale, que es
   lo que separa una herramienta que explica de una que parece rota. */
function vozRecMiraUrl(u) {
  const t = String(u || '').trim();
  if (!t) return { ok: false, motivo: '' };
  let url;
  try { url = new URL(t); } catch (e) {
    /* Lo más común de todo: pegar «www.algo.com» sin el https. Se
       propone en vez de rechazarlo, porque escribir «https://» en el
       teclado de una tableta es lo que hace que nadie ponga el enlace. */
    if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(t)) {
      try { return { ok: true, url: new URL('https://' + t).href, puesto: 'https://' }; } catch (e2) {}
    }
    return { ok: false, motivo: 'Eso no parece una dirección. Tiene que empezar por https:// y llevar un punto.' };
  }
  if (url.protocol === 'http:' || url.protocol === 'https:') return { ok: true, url: url.href };
  /* ⚠️ Y AQUÍ SE EXPLICA, en vez de decir «no vale». Quien escribe
     «duolingo://» quiere abrir una aplicación, y la respuesta buena
     existe: su dirección https, que en Android abre la propia app si
     está instalada. Decir solo «no» manda a buscar donde no está. */
  return {
    ok: false,
    motivo: 'Aquí solo entran direcciones https. Si querías abrir una aplicación, pon su dirección '
          + 'normal (la de su página): en el teléfono y la tableta esa misma dirección abre la app '
          + 'si está instalada, y la página si no.',
  };
}

/* ═════════════════════════════════════════════════════════════════
   LOS VIDEOS DE YOUTUBE: ONCE CARACTERES Y NADA MÁS
   ═════════════════════════════════════════════════════════════════
   Pedido por el autor el 18 de septiembre de 2026, al decidir cómo
   guardar lo que le genera NotebookLM: «subiré los videos que son cortos
   a YouTube y los guardaré en recursos de las lecturas».

   ⚠️ AQUÍ VUELVE LA REGLA 1 DE VIDEOS M.E.T.A.S, PALABRA POR PALABRA:
   **por ningún sitio viaja una dirección hasta el `src` de un
   `<iframe>`: viajan ONCE CARACTERES.** Ese es el peor sitio del HTML
   donde puede acabar algo escrito por una persona, y en vez de escapar
   mejor se le quita al dato la capacidad de hacer daño: en
   `[A-Za-z0-9_-]` no hay comillas, ni espacios, ni dos puntos, ni
   barras, así que `javascript:` no se puede ni escribir. La dirección
   del reproductor se arma SIEMPRE con un literal delante y el
   identificador ya comprobado detrás.

   ⚠️ Y ESTO ES UNA SEGUNDA COPIA DEL EXTRACTOR, a propósito. Videos
   M.E.T.A.S tiene el suyo (`mvidDeEnlace`) y llamarlo desde aquí ataría
   esta herramienta a que aquel archivo cargue —y la casa tiene escrito
   que si un aparato no carga, lo demás sigue entero—. Lo que NO se
   duplica es lo que de verdad hay que sostener, que no es el código sino
   la invariante: **de este lado tampoco llega al `src` nada que no sean
   esos once caracteres**, y eso lo comprueba la sonda aquí, no allá. Si
   algún día hace falta un tercero, entonces sí va a un archivo común.
   ═════════════════════════════════════════════════════════════════ */

/* De un enlace, `{id, ini}` —y `id` vacío si no había nada aprovechable.
   Con `URL()` y no con una expresión sobre el texto pelado, por lo mismo
   que en toda la casa: `java\tscript:` y `JavaScript:` pasan un grep
   ingenuo y el navegador los ejecuta igual. */
function vozRecYt(txt) {
  const s = String(txt == null ? '' : txt).trim();
  const nada = { id: '', ini: 0 };
  if (!s) return nada;
  let u;
  try { u = new URL(s); } catch (e) { return nada; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return nada;

  const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
  let bruto = '';
  if (host === 'youtu.be') bruto = u.pathname.slice(1);
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') bruto = u.searchParams.get('v') || '';
    else {
      const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/);
      if (m) bruto = m[2];
    }
  }
  /* El cedazo: once caracteres del alfabeto bueno, o nada. */
  if (!/^[A-Za-z0-9_-]{11}$/.test(bruto)) return nada;

  /* Los segundos del `&t=`, que YouTube escribe de tres maneras. Se
     guardan porque empezar el video donde empieza lo que importa es la
     defensa más barata contra los minutos de careta. */
  const t = String(u.searchParams.get('t') || u.searchParams.get('start') || '').trim().toLowerCase();
  let ini = 0;
  if (/^\d+$/.test(t)) ini = parseInt(t, 10);
  else {
    const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
    if (m && (m[1] || m[2] || m[3])) ini = (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
  }
  if (!isFinite(ini) || ini < 0 || ini > 86400) ini = 0;
  return { id: bruto, ini: ini };
}

/* La dirección del reproductor. Único sitio del archivo donde se arma
   una de YouTube, y se arma con un literal delante y el identificador
   comprobado detrás. `youtube-nocookie.com` es el dominio sin
   seguimiento, que es el que corresponde en la pantalla de lectura de
   una casa. */
function vozRecYtEmbed(id, ini) {
  const p = ['rel=0', 'modestbranding=1', 'playsinline=1', 'iv_load_policy=3'];
  if (ini) p.push('start=' + ini);
  return 'https://www.youtube-nocookie.com/embed/' + id + '?' + p.join('&');
}

/* ── El título, traído de YouTube ───────────────────────────────
   Un enlace de YouTube pelado no trae nombre, así que sin esto las
   tarjetas de un cuaderno entero se llamarían todas «youtube.com». Se le
   pide a la puerta pública de YouTube (oEmbed), que no lleva clave, ni
   cuenta, ni librería: una dirección y un JSON con el título dentro.

   ⚠️ LA CONSULTA SE ARMA CON EL IDENTIFICADOR, NO CON LO QUE SE PEGÓ. A
   YouTube no le sale de aquí ni un carácter que no sean esos once: quien
   pegue una dirección con algo escondido dentro no se lo manda a nadie.
   ⚠️ Y SIN CREDENCIALES: la sesión de YouTube de quien lee no tiene nada
   que hacer en esto.
   ⚠️ Y CON RELOJ PROPIO, que es la lección de la regla 11: una petición
   que no vuelve —no que falla: que no vuelve— dejaría «buscando el
   título…» puesto para siempre. Seis segundos y se queda el nombre que
   había, que es el dominio: llegar tarde no puede costar más que no
   llegar.
   ⚠️ Y si falla NO PASA NADA MÁS QUE LO DE ANTES. Es un adorno útil, no
   una pieza: sin señal, con la puerta caída o con un video privado —que
   oEmbed no contesta— el recurso se guarda igual y el nombre se escribe
   a mano. */
const VOZ_REC_TIT_ESPERA = 6000;
let _vozRecTitulos = {};      // id -> { hecho, t, esperando: [] }

async function vozRecPideTitulo(id) {
  const dir = 'https://www.youtube.com/oembed?format=json&url='
            + encodeURIComponent('https://www.youtube.com/watch?v=' + id);
  const ctrl = (typeof AbortController === 'function') ? new AbortController() : null;
  const reloj = setTimeout(() => { try { if (ctrl) ctrl.abort(); } catch (e) {} }, VOZ_REC_TIT_ESPERA);
  try {
    const r = await fetch(dir, { credentials: 'omit', signal: ctrl ? ctrl.signal : undefined });
    if (!r || !r.ok) return '';
    const j = await r.json();
    return (j && typeof j.title === 'string') ? j.title.replace(/\s+/g, ' ').trim().slice(0, 200) : '';
  } catch (e) {
    return '';
  } finally { clearTimeout(reloj); }
}

/* Devuelve el título si ya se sabe; si no, lo pide UNA vez por video y
   avisa por `alLlegar`. Se recuerda por identificador y no por
   dirección: dos enlaces del mismo video son el mismo título, y pedirlo
   dos veces es un viaje de más por cada forma de escribirlo. */
function vozRecTitulo(url, alLlegar) {
  const y = vozRecYt(url);
  if (!y.id) return null;
  let g = _vozRecTitulos[y.id];
  if (g && g.hecho) return g.t || null;
  if (!g) {
    g = _vozRecTitulos[y.id] = { hecho: false, t: '', esperando: [] };
    vozRecPideTitulo(y.id).then(t => {
      const viejo = _vozRecTitulos[y.id] || { esperando: [] };
      _vozRecTitulos[y.id] = { hecho: true, t: t, esperando: [] };
      (viejo.esperando || []).forEach(fn => { try { fn(t); } catch (e) {} });
    });
  }
  if (alLlegar && g.esperando) g.esperando.push(alLlegar);
  return null;
}

/* ¿Se está esperando el título de este enlace? Sirve para decirlo en el
   repaso: un nombre que va a cambiar solo en dos segundos, dicho, no
   asusta; sin decirlo parece que se guardó mal. */
function vozRecTituloPendiente(url) {
  const y = vozRecYt(url);
  if (!y.id) return false;
  const g = _vozRecTitulos[y.id];
  return !!g && !g.hecho;
}

function vozRecDominio(u) {
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
}

/* El nombre que se adivina de una dirección, para no pedir lo que se
   puede deducir (regla 1 del Apunte rápido). Del último trozo del camino
   si dice algo, y si no del dominio. */
const VOZ_REC_NO_NOMBRE = ['watch', 'view', 'index', 'home', 'default', 'file',
  'files', 'download', 'share', 'shared', 'embed', 'video', 'audio', 'item',
  'edit', 'preview', 'open', 'redir', 'link', 'page', 'main', 'start'];

function vozRecNombreDeUrl(u) {
  const dom = vozRecDominio(u);
  let trozo = '';
  try {
    const partes = new URL(u).pathname.split('/').filter(Boolean);
    const ult = partes[partes.length - 1] || '';
    trozo = decodeURIComponent(ult).replace(/\.(html?|php|aspx?|pdf)$/i, '').replace(/[-_+]+/g, ' ').trim();
    /* Un identificador («a8f3c210», «watch») no es un nombre: mejor el
       dominio solo que un título que no dice nada.
       ⚠️ Y «watch» estaba escrito aquí de ejemplo y pasaba igual, porque
       tiene cinco letras y una vocal: un vídeo de YouTube entraba en la
       repisa llamándose «Watch — youtube.com». Se vio al pegar varios de
       golpe, donde salen cuatro nombres juntos y uno no dice nada; con
       uno solo cada vez, nadie se había fijado. Son las palabras que
       ningún sitio usa como título, descartadas a mano como las
       terminaciones de archivo de la regla 29. */
    if (VOZ_REC_NO_NOMBRE.indexOf(trozo.toLowerCase()) >= 0) trozo = '';
    if (trozo.length < 4 || trozo.length > 90 || !/[aeiouáéíóú]/i.test(trozo) || /^\d+$/.test(trozo)) trozo = '';
  } catch (e) {}
  if (!trozo) return dom;
  return trozo.charAt(0).toUpperCase() + trozo.slice(1) + (dom ? ' — ' + dom : '');
}

/* ⚠️ EL TIPO SE ADIVINA DE LA DIRECCIÓN, Y AQUÍ SÍ SE PUEDE ADIVINAR.
   Parece que contradice la regla que no se negocia de los videos de
   M.E.T.A.S y del taller —«si el texto no dice cuál es la correcta, no se
   marca ninguna»—, y no la contradice: allá lo adivinado es la RESPUESTA
   de un examen, que nadie vuelve a mirar y que solo se descubre cuando
   alguien acierta y la pantalla le dice que falló. Aquí lo adivinado es un
   icono que se ve en la tarjeta, al lado del nombre, y que se cambia con
   un toque desde ✏️. Un error que se ve y se arregla en un toque no es de
   la misma familia que uno que nadie puede ver. Es la misma licencia que
   ya se toma `vozRecNombreDeUrl` con el nombre.
   Y lo que no se reconoce cae en el primero —📱 App o web—, que es el que
   no afirma nada. */
function vozRecTipoDeUrl(u) {
  const t = String(u || '').toLowerCase();
  let dom = '', cam = '';
  try { const x = new URL(t); dom = x.hostname.replace(/^www\./, ''); cam = x.pathname; } catch (e) { cam = t; }
  const ext = (cam.match(/\.([a-z0-9]{2,5})$/) || [])[1] || '';

  if (['mp3', 'm4a', 'wav', 'ogg', 'oga', 'aac', 'flac', 'opus'].indexOf(ext) >= 0) return 'audio';
  if (['mp4', 'webm', 'mov', 'mkv', 'avi'].indexOf(ext) >= 0) return 'video';
  if (['pdf', 'doc', 'docx', 'odt', 'epub', 'txt', 'rtf'].indexOf(ext) >= 0) return 'lectura';
  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].indexOf(ext) >= 0) return 'mapa';

  const tiene = l => l.some(d => dom === d || dom.endsWith('.' + d));
  if (tiene(['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'tiktok.com'])) return 'video';
  if (tiene(['spotify.com', 'soundcloud.com', 'ivoox.com', 'podcasts.apple.com', 'anchor.fm'])) return 'audio';
  if (tiene(['coursera.org', 'edx.org', 'udemy.com', 'classroom.google.com', 'platzi.com', 'domestika.org'])) return 'curso';
  if (tiene(['khanacademy.org', 'duolingo.com', 'quizlet.com', 'wordwall.net', 'liveworksheets.com',
             'geogebra.org', 'kahoot.it', 'educaplay.com', 'blooket.com'])) return 'ejercicio';
  if (tiene(['miro.com', 'mindmeister.com', 'canva.com', 'lucid.app', 'coggle.it', 'xmind.app'])) return 'mapa';
  if (tiene(['wikipedia.org', 'jstor.org', 'scielo.org', 'dialnet.unirioja.es', 'redalyc.org',
             'academia.edu', 'researchgate.net', 'medium.com'])) return 'lectura';
  if (/(^|\/)mapa|mindmap|esquema/.test(cam)) return 'mapa';
  if (/(^|\/)(guia|guide|resumen|summary|apuntes)/.test(cam)) return 'lectura';
  return VOZ_REC_TIPOS[0].id;
}

/* ═════════════════════════════════════════════════════════════════
   PEGAR VARIOS RECURSOS DE GOLPE
   ═════════════════════════════════════════════════════════════════
   Pedido por el autor el 18 de septiembre de 2026, contando cómo trabaja
   de verdad: lo que NotebookLM le genera para un ensayo —el audio, el
   mapa mental, la guía de estudio— no se puede compartir desde ahí, así
   que lo baja, lo sube a OneDrive y saca el enlace de cada uno. Cuando
   llega aquí ya tiene seis direcciones y la paciencia gastada.

   ⚠️ SE PEGAN DE GOLPE, COMO TODO LO DEMÁS EN ESTA CASA. Es el patrón del
   guion de El Rodaje, de las preguntas de los videos de M.E.T.A.S, del
   texto de esta misma herramienta y de las actividades del taller, y por
   el mismo motivo: el material ya viene escrito en otra ventana y meterlo
   de uno en uno son doce toques por recurso en una tableta. Con seis
   recursos por cuaderno, eso es exactamente lo que hace que los recursos
   no se pongan.

   ⚠️ Y AQUÍ MANDA LA ASIMETRÍA DE LA REGLA 3, con el mismo filo:

     equivocarse hacia «este renglón no era una dirección» cuesta un
     renglón NOMBRADO que se arregla a mano;
     equivocarse hacia «esto sí lo era» cuelga en la lectura un recurso
     que no lleva a ninguna parte Y PARECE QUE FUNCIONÓ —sale su tarjeta,
     sale su icono, sale todo—, y no se descubre hasta que alguien lo
     toca, que puede ser dentro de un mes.

   Ante la duda, no es una dirección.
   ════════════════════════════════════════════════════════════════ */

/* Las terminaciones que se aceptan SIN `https://` delante. No es la lista
   de todas las que existen —ni falta que hace—: es la frontera que separa
   «algo.com» de «informe.pdf», que sin ella entraría como
   `https://informe.pdf` y colgaría un enlace muerto sin dar ningún error.
   Es la misma cautela de `vozDominioAlFinal` (regla 29), que descarta a
   mano las terminaciones de archivo. Lo que no esté aquí entra igual,
   pero escribiendo su `https://`. */
const VOZ_REC_TLD = ['com', 'org', 'net', 'edu', 'gov', 'int', 'mil', 'io', 'app', 'co',
  'es', 'mx', 'hn', 'gt', 'cr', 'pa', 'do', 'sv', 'ni', 'py', 'uy', 'bo', 'ec', 've',
  'ar', 'cl', 'pe', 'br', 'us', 'uk', 'ca', 'fr', 'de', 'it', 'pt',
  'ai', 'dev', 'me', 'tv', 'info', 'page', 'online', 'site', 'xyz', 'blog', 'academy'];

function vozRecPareceDominio(t) {
  const s = String(t || '').trim();
  if (/^www\./i.test(s)) return true;
  const host = s.split('/')[0];
  const ult = (host.split('.').pop() || '').toLowerCase();
  return VOZ_REC_TLD.indexOf(ult) >= 0;
}

/* Lo que queda del renglón después de quitarle la dirección, limpio de
   los separadores con que la gente las escribe. Menos de tres letras no
   es un nombre: mejor el que se deduce de la dirección. */
function vozRecNombreSuelto(x) {
  const t = String(x || '')
    .replace(/[|\t]+/g, ' ')
    .replace(/^[\s—–·•:\-]+/, '')
    .replace(/[\s—–·•:\-]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length >= 3 ? t.slice(0, 200) : '';
}

/* Un renglón → {url, nombre}, o nada. Tres formas y ninguna más, que son
   las que se escriben de verdad. */
function vozRecUrlDeLinea(linea) {
  const l = String(linea || '').replace(/^\s*[-*•·]\s+/, '').replace(/^\s*\d+[.)]\s+/, '').trim();
  if (!l) return null;

  /* 1) Como las escribe una máquina que hace listas: [Nombre](dirección). */
  const m = l.match(/^\[([^\]]{1,200})\]\(\s*([^\s)]+)\s*\)$/);
  if (m) {
    const u = vozRecMiraUrl(m[2]);
    return u.ok ? { url: u.url, nombre: vozRecNombreSuelto(m[1]) } : null;
  }

  /* 2) Lo normal: un http(s) en algún sitio del renglón. Lo que queda a
     los lados es el nombre —«Guía de estudio | https://…», «https://…
     (mapa mental)»— y si no queda nada se deduce de la dirección. */
  const h = l.match(/https?:\/\/[^\s<>"'\)\]]+/);
  if (h) {
    const u = vozRecMiraUrl(h[0]);
    if (!u.ok) return null;
    return { url: u.url, nombre: vozRecNombreSuelto(l.slice(0, h.index) + ' ' + l.slice(h.index + h[0].length)) };
  }

  /* 3) Un dominio pelado al final del renglón, que es como se escribe sin
     acordarse del https. Solo si de verdad lo parece: ver VOZ_REC_TLD. */
  const t = l.match(/(?:^|[\s|\t])((?:www\.)?[\w-]+(?:\.[\w-]+)+(?:\/\S*)?)$/);
  if (t && vozRecPareceDominio(t[1])) {
    const u = vozRecMiraUrl(t[1]);
    if (u.ok) return { url: u.url, nombre: vozRecNombreSuelto(l.slice(0, l.length - t[1].length)) };
  }
  return null;
}

/* El repaso ENTERO antes de guardar: lo entendido, lo repetido y los
   renglones que no se entendieron CON SU NÚMERO. Un rechazo callado se
   ve desde fuera igual que una herramienta rota (regla 14), y «se
   pusieron 4 de 6» sin decir cuáles dos obliga a contar a mano. */
function vozRecLeerVarios(txt, cid, alLlegarTitulo) {
  const yaHay = new Set(vozRecDe(cid).map(r => r.url));
  const vistos = new Set();
  const items = [], repes = [], malos = [];
  String(txt || '').split(/\r?\n/).forEach((linea, i) => {
    const l = linea.trim();
    if (!l) return;
    const d = vozRecUrlDeLinea(l);
    if (!d) { malos.push({ n: i + 1, t: l.slice(0, 70) }); return; }
    /* Repetido no es un error: el mismo enlace pegado dos veces —o uno
       que ya estaba— se dice y se salta. Colgarlo dos veces sí lo sería. */
    if (yaHay.has(d.url) || vistos.has(d.url)) { repes.push(d.url); return; }
    vistos.add(d.url);
    /* El nombre escrito delante manda siempre. Sin él, el título de
       YouTube si es un video —y si todavía no llegó, el dominio, con el
       aviso de que se está buscando—. */
    const suyo = !!d.nombre;
    const tit = suyo ? d.nombre : (vozRecTitulo(d.url, alLlegarTitulo) || vozRecNombreDeUrl(d.url));
    items.push({
      url: d.url,
      tit: String(tit).slice(0, 200),
      tipo: vozRecTipoDeUrl(d.url),
      auto: !suyo,
      pidiendo: !suyo && vozRecTituloPendiente(d.url),
    });
  });
  return { items: items, repes: repes, malos: malos };
}

/* ── Guardar, quitar, y la nube ────────────────────────────────────── */

function vozRecGuardar(cid, r) {
  const todo = vozRecLeeTodo();
  const lista = todo[cid] || (todo[cid] = []);
  const i = lista.findIndex(x => x && x.id === r.id);
  if (i >= 0) lista[i] = r; else lista.push(r);
  vozRecGuardaTodo();
  vozRecPedirNube(cid);
}

/* ⚠️ QUITAR DEJA LÁPIDA, no borra la fila, aunque esta tabla SÍ tenga
   política de `delete`. Por lo mismo que los textos, los subrayados, los
   videos de M.E.T.A.S y la repisa: si este aparato borrara la fila, la
   tableta que todavía tiene su copia la subiría otra vez en la siguiente
   sincronización y el recurso resucitaría solo, sin que nadie entendiera
   por qué. */
function vozRecQuitar(cid, id) {
  const lista = vozRecLeeTodo()[cid] || [];
  const r = lista.find(x => x && x.id === id);
  if (!r) return;
  r.del = true;
  r.u = Date.now();
  vozRecGuardaTodo();
  vozRecPedirNube(cid);
}

function vozRecDeFila(f) {
  return {
    id: f.id, tipo: f.tipo || 'app', tit: f.titulo || '', url: f.url || '',
    para: f.descripcion || '', fuente: f.fuente || '', origen: f.origen || 'casa',
    dura: f.dura || '', orden: f.orden || 0, del: !!f.borrado,
    u: f.actualizado || 0, user: f.anadido_por || '', quien: f.miembro || '',
    sync: f.actualizado || 0,
  };
}

function vozRecAFila(r, yo, cid, quien) {
  return {
    id: r.id, mision: 'voz:' + cid, tipo: r.tipo || 'app',
    titulo: String(r.tit || '').slice(0, 200),
    url: r.url,
    descripcion: String(r.para || '').slice(0, 400),
    fuente: String(r.fuente || '').slice(0, 80),
    origen: r.origen === 'maquina' ? 'maquina' : 'casa',
    dura: String(r.dura || '').slice(0, 40),
    anadido_por: yo,
    miembro: String(r.quien || quien || '').slice(0, 40),
    borrado: !!r.del,
    actualizado: r.u || Date.now(),
    orden: r.orden || 0,
  };
}

function vozRecPedirNube(cid) {
  if (_vozRecNube === 'al-dia') _vozRecNube = 'pendiente';
  vozRecPintarEstado();
  clearTimeout(_vozRecTimer);
  _vozRecTimer = setTimeout(() => vozRecSincronizar(cid), 1500);
}

/* Baja los recursos de ESTE texto —de toda la casa—, fusiona por
   identificador (gana el más nuevo por el reloj del aparato) y sube lo
   PROPIO que allá falte o esté más viejo.

   ⚠️ Solo lo propio: una fila ajena la rechaza la seguridad por fila, y
   reintentarla sería insistir cada vez para nada (regla 14).
   ⚠️ Y un corte de red no vacía la repisa: lo que hay en memoria no se
   tira hasta saber que llegó lo nuevo (regla 11). */
async function vozRecSincronizar(cid) {
  if (_vozRecSincronizando) { _vozRecOtraVuelta = cid; return; }
  const sb = vozSb();
  if (!sb) { _vozRecNube = 'sin-sesion'; vozRecPintarEstado(); return; }
  const yo = await vozYo();
  if (!yo) { _vozRecNube = 'sin-sesion'; vozRecPintarEstado(); return; }
  _vozRecSincronizando = true;
  _vozRecNube = 'subiendo'; vozRecPintarEstado();
  try {
    const todo = vozRecLeeTodo();
    const mios = todo[cid] || (todo[cid] = []);
    /* Lo puesto sin sesión pasa a ser de quien entró, igual que una marca. */
    mios.forEach(r => { if (!r.user) r.user = yo; });

    const { data, error } = await vozConReloj(sb.from(VOZ_REC_TABLA)
      .select('*').eq('mision', 'voz:' + cid));
    if (error) {
      /* ⚠️ TRES CAUSAS Y TRES ARREGLOS, y decir una por otra manda a
         mirar donde no está el problema. 42P01 es «falta el SQL»; 42703
         es «la tabla está pero le falta una columna», o sea volver a
         correrlo; lo demás sí es la señal. Es la avería de la lápida del
         taller, que decía «sin señal» con la señal perfecta. */
      if (error.code === '42P01' || /relation .* does not exist/i.test(error.message || '')) _vozRecNube = 'sin-tabla';
      else if (vozFaltaColumna(error)) _vozRecNube = 'base-vieja';
      else _vozRecNube = 'sin-senal';
      vozRecGuardaTodo(); vozRecPintarEstado();
      return;
    }
    const quien = await vozRecMiembro(yo);
    const remotos = (data || []).map(vozRecDeFila);
    const porId = new Map(mios.map(r => [r.id, r]));
    const subir = [];
    let cambio = false;
    remotos.forEach(x => {
      const l = porId.get(x.id);
      if (!l) { porId.set(x.id, x); cambio = true; return; }
      if ((x.u || 0) > (l.u || 0)) { porId.set(x.id, Object.assign({}, x)); cambio = true; }
      else if ((l.u || 0) > (x.u || 0) || (l.sync || 0) < (l.u || 0)) subir.push(l);
    });
    porId.forEach(r => { if (r.user === yo && !remotos.find(x => x.id === r.id)) subir.push(r); });
    todo[cid] = [...porId.values()];
    const mias = subir.filter(r => r.user === yo);
    if (mias.length) {
      const { error: e2 } = await vozConReloj(sb.from(VOZ_REC_TABLA)
        .upsert(mias.map(r => vozRecAFila(r, yo, cid, quien)), { onConflict: 'id' }));
      if (e2) {
        _vozRecNube = (e2.code === 'FARO_RELOJ') ? 'sin-senal'
          : vozFaltaColumna(e2) ? 'base-vieja'
          : (e2.code === '42501' || e2.code === '23502' || e2.code === '23514') ? 'ajeno' : 'error';
        vozRecGuardaTodo(); vozRecPintarEstado();
        return;
      }
      mias.forEach(r => { r.sync = r.u || 0; if (!r.quien) r.quien = quien; });
    }
    vozRecGuardaTodo();
    _vozRecNube = 'al-dia';
    if (cambio) vozRecRepintar(cid);
  } catch (e) {
    _vozRecNube = 'error';
  } finally {
    _vozRecSincronizando = false;
    /* Y si mientras subía se guardó algo, otra vuelta: un guardado hecho
       durante la subida se APUNTA, no se tira — o la vuelta en marcha
       terminaría diciendo «están en todos los aparatos» con lo último
       todavía aquí, que es peor que decir que falló. */
    if (_vozRecOtraVuelta !== null) {
      const otro = _vozRecOtraVuelta;
      _vozRecOtraVuelta = null;
      vozRecPedirNube(otro);
    } else {
      vozRecPintarEstado();
    }
  }
}

function vozRecRotuloNube() {
  if (_vozRecNube === 'al-dia')     return '☁️ Los recursos están en todos los aparatos de la casa.';
  if (_vozRecNube === 'subiendo' || _vozRecNube === 'pendiente') return '⏳ Guardando en la nube…';
  if (_vozRecNube === 'sin-tabla')  return '📴 Solo en este aparato: falta correr recursos_enlaces.sql';
  if (_vozRecNube === 'base-vieja') return '📴 Solo en este aparato: la base va vieja, vuelve a correr recursos_enlaces.sql';
  if (_vozRecNube === 'sin-sesion') return '📴 Solo en este aparato: entra en F.A.R.O para que viajen';
  if (_vozRecNube === 'sin-senal')  return '📡 Sin señal: se guardan aquí y suben cuando vuelva';
  if (_vozRecNube === 'ajeno')      return '✋ Alguno lo puso otra persona de la casa: puedes abrirlo, no cambiarlo';
  if (_vozRecNube === 'error')      return '⚠️ La nube rechazó algún recurso; se queda en este aparato';
  return '📴 Solo en este aparato por ahora';
}

function vozRecPintarEstado() {
  const e = document.getElementById('voz-rec-estado');
  if (e) e.textContent = vozRecRotuloNube();
  const p = document.getElementById('voz-rec-pie');
  if (p && _vozRecEnHoja) p.textContent = vozRecRotuloNube();
}

/* Repinta donde se vean los recursos, sin tocar nada más: el panel si
   está abierto en esa pestaña, y el pie de la última página, que enseña
   la cuenta. */
function vozRecRepintar(cid) {
  if (_vozLeyendo && _vozLeyendo.cid === cid && _vozPanelTab === 'recs') {
    const p = document.getElementById('voz-panel-ind');
    if (p && !p.hidden) vozPintarPanelInd('recs');
  }
  vozRender();
}

/* ── La pestaña 🔗 del panel de la sala ───────────────────────────────
   ⚠️ Sale SIEMPRE, aunque no haya ni un recurso, y es la excepción a la
   regla de la pestaña de Fuentes (que solo sale cuando hay bibliografía).
   El motivo es el mismo que hace que la del taller salga vacía: aquí es
   donde se PONEN, así que esconderla cuando está vacía sería esconder la
   única puerta de entrada. */
function vozRecPintarPanel(cuerpo, c) {
  const lista = vozRecDe(c.cid);

  const intro = vozNodo('p', 'voz-panel-nota',
    lista.length
      ? 'Se abren en otra pestaña, así que la lectura se queda donde está.'
      : 'Un vídeo, una app de ejercicios, otra lectura: lo que ayude a que esto se quede. '
        + 'Se abren en otra pestaña y los ven los cuatro.');
  cuerpo.appendChild(intro);

  lista.forEach(r => cuerpo.appendChild(vozRecTarjeta(c, r)));

  cuerpo.appendChild(vozBoton('voz-btn voz-btn-pri voz-btn-ancho',
    lista.length ? '➕ Otro recurso' : '➕ Poner un recurso',
    () => vozRecAbrirHoja(c.cid, null)));

  /* Y la puerta de los montones: seis enlaces de un cuaderno de
     NotebookLM entran de una vez. Va DEBAJO del de uno solo porque uno
     solo es lo que se hace casi siempre; este es el atajo del día que se
     archiva un cuaderno entero. */
  cuerpo.appendChild(vozBoton('voz-btn voz-btn-ancho',
    '📋 Pegar varios de golpe',
    () => vozRecVAbrir(c.cid),
    'Pegar varias direcciones, una por renglón'));

  const est = vozNodo('p', 'voz-aj-nota voz-rec-estado', vozRecRotuloNube());
  est.id = 'voz-rec-estado';
  cuerpo.appendChild(est);
}

/* ⚠️ NADA DE ESTO SE ARMA CON HTML. La dirección se comprueba con
   `URL()` y se pone con `setAttribute`; el título, la descripción y el
   nombre de quien lo puso van con `textContent`. Un recurso lo escribe
   alguien de la casa, pero esta página tiene al lado la Bóveda. */
function vozRecTarjeta(c, r) {
  const card = vozNodo('div', 'voz-rec-card voz-rec-t-' + (vozRecTipo(r.tipo).id));
  const tipo = vozRecTipo(r.tipo);
  const bueno = vozRecMiraUrl(r.url);

  /* Si la dirección no pasa la comprobación NO se pinta un enlace: se
     pinta un aviso. Enseñar un enlace muerto es peor que decir que está
     mal, porque el que lo toca cree que el recurso ya no existe. */
  const cab = bueno.ok ? document.createElement('a') : vozNodo('div', 'voz-rec-roto');
  if (bueno.ok) {
    cab.className = 'voz-rec-abre';
    cab.setAttribute('href', bueno.url);
    cab.setAttribute('target', '_blank');
    /* ⚠️ `noopener` no es adorno: sin él la página que se abre puede
       tocar `window.opener`, y esa ventana es F.A.R.O con la sesión de la
       casa puesta. */
    cab.setAttribute('rel', 'noopener noreferrer');
  }
  cab.appendChild(vozNodo('span', 'voz-rec-ic', tipo.ic));
  const txt = vozNodo('span', 'voz-rec-txt');
  txt.appendChild(vozNodo('span', 'voz-rec-nom', r.tit || vozRecDominio(r.url) || 'Sin nombre'));
  const meta = [tipo.t, vozRecDominio(r.url), r.dura].filter(Boolean).join(' · ');
  if (meta) txt.appendChild(vozNodo('span', 'voz-rec-meta', meta));
  if (r.para) txt.appendChild(vozNodo('span', 'voz-rec-para', r.para));
  if (!bueno.ok) txt.appendChild(vozNodo('span', 'voz-rec-mal', '⚠️ ' + (bueno.motivo || 'La dirección no vale')));
  cab.appendChild(txt);
  if (bueno.ok) cab.appendChild(vozNodo('span', 'voz-rec-flecha', '↗'));
  card.appendChild(cab);

  const pie = vozNodo('div', 'voz-rec-pie-card');
  /* ⚠️ LA ETIQUETA, EN LA TARJETA Y SIEMPRE. Regla 1: lo que trajo una
     máquina va dicho donde se lee, no en un campo que hay que abrir. */
  const or = VOZ_REC_ORIGENES.find(o => o.id === r.origen) || VOZ_REC_ORIGENES[0];
  pie.appendChild(vozNodo('span', 'voz-rec-et voz-rec-et-' + or.id, or.ic + ' ' + or.corto));
  if (r.quien) pie.appendChild(vozNodo('span', 'voz-rec-quien', 'lo puso ' + r.quien));

  /* ▶ Ver aquí: solo si de verdad es un video, y para CUALQUIERA —ver
     no es corregir, así que no depende de quién lo puso—. El enlace ↗ de
     arriba se queda igual: un video que su dueño no deje incrustar sale
     aquí como un cuadro negro, y esa es la salida (regla 3 de Videos
     M.E.T.A.S). */
  if (vozRecYt(r.url).id) {
    pie.appendChild(vozBoton('voz-btn voz-btn-chico voz-rec-ver', '▶ Ver aquí',
      () => vozRecVerVideo(r), 'Ver el video sin salir de la lectura'));
  }

  if (vozRecEsMio(r)) {
    pie.appendChild(vozBoton('voz-btn voz-btn-chico', '✏️', () => vozRecAbrirHoja(c.cid, r), 'Corregir este recurso'));
    /* Dos toques en el mismo sitio y sin `confirm()`, igual que retirar un
       texto (regla 22): el diálogo del navegador puede no salir nunca en
       la aplicación instalada, y entonces el botón parece muerto. */
    const caja = vozNodo('span', 'voz-retirar-caja');
    const b = vozBoton('voz-btn voz-btn-chico', '🗑', null, 'Quitar este recurso');
    const si = vozBoton('voz-btn voz-btn-peligro voz-btn-chico', 'Sí, quitar', () => {
      vozRecQuitar(c.cid, r.id);
      vozRecRepintar(c.cid);
      vozAviso('🔗 Recurso quitado');
    }, 'Confirmar: quitar el recurso');
    const no = vozBoton('voz-btn voz-btn-chico', 'No', () => {
      caja.classList.remove('voz-retirar-abierto'); si.hidden = true; no.hidden = true;
    }, 'No quitarlo');
    si.hidden = true; no.hidden = true;
    b.addEventListener('click', () => {
      const abierto = caja.classList.toggle('voz-retirar-abierto');
      si.hidden = !abierto; no.hidden = !abierto;
      if (abierto) si.focus();
    });
    caja.appendChild(b); caja.appendChild(si); caja.appendChild(no);
    pie.appendChild(caja);
  } else {
    /* ⚠️ Y en lo ajeno los botones NO se enseñan muertos ni se esconden
       sin más: se dice por qué. Lo impide la seguridad por fila, y un
       botón que la base va a rechazar promete algo que no se puede hacer;
       pero quitarlo callando parece un fallo de la pantalla, y un fallo de
       pantalla se «arregla» reinstalando (regla 14). */
    pie.appendChild(vozNodo('span', 'voz-rec-ajeno', '✋ solo quien lo puso puede cambiarlo'));
  }
  card.appendChild(pie);
  return card;
}

/* ── Ver el video DENTRO de la lectura ───────────────────────
   Pedido por el autor el 18 de septiembre de 2026, al decidir subir a
   YouTube los videos cortos que le genera NotebookLM. Un resumen de tres
   minutos del ensayo que uno acaba de leer se mira ahí mismo: mandarlo a
   otra pestaña es, en un lector paginado, perder la página —que es la
   misma razón por la que una cita se consulta encima del texto y no
   yendo a la bibliografía (regla 27)—.

   ⚠️ LA HOJA CUELGA DENTRO DE #voz-lector, como todo lo de la sala: del
   body saldría con el z-index 100 de .fin-modal-overlay, muy por debajo
   de la sala (3200), y el botón respondería sin que se viera nada
   (regla 35). */
function vozRecVerVideo(r) {
  const y = vozRecYt(r && r.url);
  if (!y.id) return;
  const ov = document.getElementById('voz-yt-overlay');
  const caja = document.getElementById('voz-yt-caja');
  if (!ov || !caja) return;
  const tit = document.getElementById('voz-yt-tit');
  if (tit) tit.textContent = r.tit || 'Video';

  vozRecVaciarVideo();
  const f = document.createElement('iframe');
  f.setAttribute('title', r.tit || 'video');
  f.setAttribute('allow', 'accelerometer; encrypted-media; gyroscope; picture-in-picture');
  f.setAttribute('allowfullscreen', '');
  f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  /* ⚠️ EL ÚNICO DATO QUE ENTRA AQUÍ SON LOS ONCE CARACTERES. La dirección
     se arma con un literal delante; lo que se pegó no toca este `src`. */
  f.setAttribute('src', vozRecYtEmbed(y.id, y.ini));
  caja.appendChild(f);

  /* Y la salida a YouTube, siempre a la vista: si el dueño del video no
     deja incrustarlo, aquí sale un cuadro negro y esto es lo único que
     queda. Con noopener, por lo de siempre. */
  const fuera = document.getElementById('voz-yt-fuera');
  const bueno = vozRecMiraUrl(r.url);
  if (fuera) {
    fuera.hidden = !bueno.ok;
    if (bueno.ok) {
      fuera.setAttribute('href', bueno.url);
      fuera.setAttribute('target', '_blank');
      fuera.setAttribute('rel', 'noopener noreferrer');
    }
  }
  ov.style.display = 'flex';
}

/* ⚠️ SE QUITA EL IFRAME, NO SE ESCONDE EL PANEL. Escondiéndolo, el video
   SIGUE SONANDO detrás de la lectura y no hay manera de pararlo más que
   cerrando la aplicación. Es la lección de la cámara de El Rodaje:
   soltar el elemento no apaga nada, hay que quitarlo. Con `textContent`
   y no con `innerHTML`, como todo en este archivo. */
function vozRecVaciarVideo() {
  const caja = document.getElementById('voz-yt-caja');
  if (caja) caja.textContent = '';
}

function vozRecCerrarVideo() {
  vozRecVaciarVideo();
  const ov = document.getElementById('voz-yt-overlay');
  if (ov) ov.style.display = 'none';
}

/* ── La hoja de poner o corregir un recurso ──────────────────────────── */

function vozRecAbrirHoja(cid, r, pre) {
  const ov = document.getElementById('voz-rec-overlay');
  if (!ov) return;
  _vozRecEnHoja = { cid: cid, id: (r && r.id) || null };
  /* Lo que rellenó la pantalla se apunta aparte, para no pisar nunca lo
     que escribió una persona (regla 18: el relleno automático recuerda
     qué rellenó él). Al corregir no hay nada automático que pisar. */
  _vozRecAuto = {};
  const g = id => document.getElementById(id);
  g('voz-rec-tit').textContent = r ? '✏️ Corregir el recurso' : '🔗 Un recurso para reforzar';
  g('voz-rec-url').value = (r && r.url) || (pre && pre.url) || '';
  g('voz-rec-nom').value = (r && r.tit) || '';
  g('voz-rec-para').value = (r && r.para) || '';
  g('voz-rec-dura').value = (r && r.dura) || '';
  _vozRecEnHoja.tipo = (r && r.tipo) || VOZ_REC_TIPOS[0].id;
  _vozRecEnHoja.origen = (r && r.origen) || 'casa';
  g('voz-rec-guardar').textContent = r ? '💾 Guardar los cambios' : '🔗 Guardar el recurso';
  ov.style.display = 'flex';

  /* ⚠️ LO COMPARTIDO ENTRA POR LA MISMA PUERTA QUE LO TECLEADO: se
     rellena el campo y se dispara el MISMO relleno automático. Con un
     camino aparte, un arreglo del relleno se haría en uno y se quedaría
     sin hacer en el otro —que es la razón por la que corregir un texto y
     pegarlo son la misma hoja (regla 9 del Apunte rápido)—. */
  if (!r && pre && pre.url) {
    _vozRecEnHoja.tipo = vozRecTipoDeUrl(pre.url);
    vozRecAlEscribirUrl();
    /* El nombre que manda quien comparte gana al deducido de la
       dirección —«Guía de estudio — Burocracia» dice bastante más que
       «1drv.ms»—, pero solo pisa lo que rellenó la pantalla (regla 18). */
    const nom = g('voz-rec-nom');
    const propuesto = vozRecNombreSuelto(pre.tit || '') || vozRecNombreSuelto(pre.resto || '');
    if (propuesto && (!nom.value.trim() || nom.value === _vozRecAuto.nom)) {
      nom.value = propuesto.slice(0, 200);
      _vozRecAuto.nom = nom.value;
    }
  }
  vozRecPintarHoja();
  /* El foco va DENTRO del mismo toque, sin ningún `await` delante: es lo
     que hace que en una tableta salga el teclado solo (regla 4 del Apunte
     rápido). Al corregir va al nombre, que es lo que se suele retocar, y
     lo mismo con lo compartido: la dirección ya viene puesta. */
  try { g((r || (pre && pre.url)) ? 'voz-rec-nom' : 'voz-rec-url').focus(); } catch (e) {}
}

function vozRecCerrarHoja() {
  const ov = document.getElementById('voz-rec-overlay');
  if (ov) ov.style.display = 'none';
  _vozRecEnHoja = null;
}

function vozRecPintarChips(caja, lista, puesto, alElegir) {
  caja.textContent = '';
  lista.forEach(x => {
    const ch = vozBoton('voz-chip' + (x.id === puesto ? ' voz-chip-on' : ''),
      x.ic + ' ' + x.t, () => alElegir(x.id));
    ch.setAttribute('aria-pressed', x.id === puesto ? 'true' : 'false');
    caja.appendChild(ch);
  });
}

/* Lo que falta para poder guardar, NOMBRADO. Un «no se puede» a secas
   obliga a mirar cinco campos desde una tableta (regla 1). */
function vozRecQueFalta() {
  const g = id => (document.getElementById(id) || {}).value || '';
  const falta = [];
  const u = vozRecMiraUrl(g('voz-rec-url'));
  if (!g('voz-rec-url').trim()) falta.push('la dirección');
  else if (!u.ok) falta.push('una dirección que valga');
  if (!g('voz-rec-nom').trim()) falta.push('cómo se llama');
  return falta;
}

function vozRecPintarHoja() {
  if (!_vozRecEnHoja) return;
  const g = id => document.getElementById(id);
  vozRecPintarChips(g('voz-rec-tipos'), VOZ_REC_TIPOS, _vozRecEnHoja.tipo,
    id => { _vozRecEnHoja.tipo = id; vozRecPintarHoja(); });
  vozRecPintarChips(g('voz-rec-origen'), VOZ_REC_ORIGENES, _vozRecEnHoja.origen,
    id => { _vozRecEnHoja.origen = id; vozRecPintarHoja(); });

  /* El aviso de la dirección se dice MIENTRAS se escribe y no al
     guardar: es la regla de la duración de El Rodaje y del monto del
     Apunte rápido — enseñar cómo se entendió acierta siempre. */
  const nota = g('voz-rec-url-nota');
  const crudo = g('voz-rec-url').value.trim();
  const u = vozRecMiraUrl(crudo);
  if (!crudo) { nota.hidden = true; nota.textContent = ''; nota.classList.remove('voz-rec-nota-mal'); }
  else if (!u.ok) { nota.hidden = false; nota.textContent = '⚠️ ' + u.motivo; nota.classList.add('voz-rec-nota-mal'); }
  else if (u.puesto) { nota.hidden = false; nota.textContent = 'Se entiende ' + u.url; nota.classList.remove('voz-rec-nota-mal'); }
  else { nota.hidden = true; nota.textContent = ''; nota.classList.remove('voz-rec-nota-mal'); }

  const falta = vozRecQueFalta();
  const av = g('voz-rec-falta');
  const b = g('voz-rec-guardar');
  b.classList.toggle('voz-btn-flojo', falta.length > 0);
  ['voz-rec-url', 'voz-rec-nom'].forEach((id, i) => {
    const e = g(id);
    const vacio = !String(e.value || '').trim() || (i === 0 && !vozRecMiraUrl(e.value).ok);
    e.classList.toggle('voz-campo-ambar', vacio);
  });
  av.hidden = !falta.length;
  av.textContent = falta.length
    ? 'Falta ' + falta.join(' y ') + '.'
    : '';
  const pie = g('voz-rec-pie');
  if (pie) pie.textContent = vozRecRotuloNube();
}

/* ⚠️ AL PEGAR LA DIRECCIÓN SE RELLENAN SOLOS EL NOMBRE Y DE DÓNDE ES, y
   solo se pisa lo que rellenó la pantalla antes. Es la regla 18: la
   primera versión del título del texto rellenaba el campo al abrir y el
   título de verdad no entraba nunca. Aquí lo que se puede deducir de la
   dirección no se pide (regla 1 del Apunte rápido): en una tableta,
   escribir a mano el nombre de un recurso cuya dirección ya se pegó es
   justo el paso en que se deja de poner recursos. */
function vozRecAlEscribirUrl() {
  if (!_vozRecEnHoja) return;
  const u = vozRecMiraUrl(document.getElementById('voz-rec-url').value);
  if (u.ok) {
    const nom = document.getElementById('voz-rec-nom');
    if (!nom.value.trim() || nom.value === _vozRecAuto.nom) {
      /* Si es un video, su título de YouTube; si ya se sabe entra ahora
         mismo y si no, el dominio y se cambia solo cuando llegue. */
      const yaTit = vozRecTitulo(u.url, t => vozRecTituloLlego(u.url, t));
      nom.value = yaTit || vozRecNombreDeUrl(u.url);
      _vozRecAuto.nom = nom.value;
    }
    _vozRecEnHoja.fuente = vozRecDominio(u.url);
  }
  vozRecPintarHoja();
}

/* ⚠️ Y CUANDO LLEGA, SE MIRA QUE SIGA HACIENDO FALTA. Mientras el
   título viajaba, la persona pudo escribir el suyo o cambiar de enlace:
   pisarle lo escrito sería la regla 18 rota por la puerta de atrás, y
   ponerle el título de otro video es peor todavía porque no se nota. */
function vozRecTituloLlego(url, t) {
  if (!t || !_vozRecEnHoja) return;
  const campo = document.getElementById('voz-rec-url');
  const nom = document.getElementById('voz-rec-nom');
  if (!campo || !nom) return;
  const ahora = vozRecMiraUrl(campo.value);
  if (!ahora.ok || vozRecYt(ahora.url).id !== vozRecYt(url).id) return;
  if (nom.value.trim() && nom.value !== _vozRecAuto.nom) return;
  nom.value = t;
  _vozRecAuto.nom = t;
  vozRecPintarHoja();
}

function vozRecGuardarHoja() {
  if (!_vozRecEnHoja) return;
  const falta = vozRecQueFalta();
  if (falta.length) {
    vozRecPintarHoja();
    const av = document.getElementById('voz-rec-falta');
    if (av) av.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return;
  }
  const g = id => document.getElementById(id).value;
  const cid = _vozRecEnHoja.cid;
  const viejo = (vozRecLeeTodo()[cid] || []).find(x => x && x.id === _vozRecEnHoja.id);
  const u = vozRecMiraUrl(g('voz-rec-url'));
  const r = {
    id: (viejo && viejo.id) || vozRecId(),
    tipo: _vozRecEnHoja.tipo,
    tit: g('voz-rec-nom').trim().slice(0, 200),
    url: u.url,
    para: g('voz-rec-para').trim().slice(0, 400),
    fuente: (_vozRecEnHoja.fuente || vozRecDominio(u.url)).slice(0, 80),
    origen: _vozRecEnHoja.origen === 'maquina' ? 'maquina' : 'casa',
    dura: g('voz-rec-dura').trim().slice(0, 40),
    orden: (viejo && viejo.orden) || 0,
    del: false,
    u: Date.now(),
    user: (viejo && viejo.user) || _vozYo || '',
    quien: (viejo && viejo.quien) || _vozRecMiembro.nombre || '',
    sync: (viejo && viejo.sync) || 0,
  };
  vozRecGuardar(cid, r);
  vozRecCerrarHoja();
  vozRecRepintar(cid);
  vozAviso(viejo ? '🔗 Recurso corregido' : '🔗 Recurso puesto');
}

/* ── El portapapeles ─────────────────────────────────────
   Un toque en vez de mantener tocado el recuadro y acertarle a «Pegar»,
   que en una tableta falla una de cada tres veces. Mismo aparato que el
   de las preguntas de Videos M.E.T.A.S y el del guion de El Rodaje.
   ⚠️ Y el botón NO SALE donde el navegador no deja leer el portapapeles:
   un botón que siempre contesta «no pude» se lee como una avería. */
function vozRecHayPortapapeles() {
  try { return !!(navigator.clipboard && navigator.clipboard.readText); } catch (e) { return false; }
}

async function vozRecDelPortapapeles(idCampo, alTerminar) {
  const e = document.getElementById(idCampo);
  if (!e) return;
  try {
    const t = await navigator.clipboard.readText();
    if (!t || !t.trim()) { vozAviso('El portapapeles está vacío: copia primero la dirección.'); return; }
    e.value = t.trim();
    if (alTerminar) alTerminar();
  } catch (err) {
    /* Y si no dejó, se dice CÓMO hacerlo a mano: un «no se pudo» a secas
       deja a alguien mirando un botón que no hace nada. */
    vozAviso('El navegador no dejó leer el portapapeles: mantén tocado el recuadro y dale a «Pegar».');
  }
}

/* ── La hoja de pegar varios ──────────────────────────────── */
let _vozRecV = null;     // {cid, origen, leido}

function vozRecVAbrir(cid) {
  const ov = document.getElementById('voz-recv-overlay');
  if (!ov) return;
  /* ⚠️ Y VIENE MARCADO 🤖, no 🏠, que es al revés que la hoja de uno solo.
     No es un descuido: esta puerta existe para el montón que devuelve un
     cuaderno de NotebookLM, o sea material de MÁQUINA, y de los dos
     errores posibles solo uno importa. Etiquetar como de la máquina algo
     que eligió la casa es una imprecisión que se ve en la tarjeta y se
     arregla con un toque; etiquetar como de la casa un resumen
     automático es exactamente lo que la regla 1 existe para impedir, y
     eso no se ve nunca. Y se dice con palabras encima de los chips, para
     que quien pegó sus propios enlaces sepa que tiene que tocarlo. */
  _vozRecV = { cid: cid, origen: 'maquina', leido: null };
  const ta = document.getElementById('voz-recv-txt');
  if (ta) ta.value = '';
  const bp = document.getElementById('voz-recv-pegar');
  if (bp) bp.hidden = !vozRecHayPortapapeles();
  ov.style.display = 'flex';
  vozRecVPintar();
  /* El foco, dentro del mismo toque (regla 4 del Apunte rápido). */
  try { if (ta) ta.focus(); } catch (e) {}
}

function vozRecVCerrar() {
  const ov = document.getElementById('voz-recv-overlay');
  if (ov) ov.style.display = 'none';
  _vozRecV = null;
}

function vozRecVPintar() {
  if (!_vozRecV) return;
  const ta = document.getElementById('voz-recv-txt');
  const caja = document.getElementById('voz-recv-repaso');
  const b = document.getElementById('voz-recv-guardar');
  const chips = document.getElementById('voz-recv-origen');
  if (!ta || !caja || !b) return;

  if (chips) {
    vozRecPintarChips(chips, VOZ_REC_ORIGENES, _vozRecV.origen,
      id => { _vozRecV.origen = id; vozRecVPintar(); });
  }

  /* Al llegar un título se repinta, y solo si esta hoja sigue abierta:
     con la hoja cerrada, repintar buscaría nodos que ya no están. */
  const r = vozRecLeerVarios(ta.value, _vozRecV.cid, () => { if (_vozRecV) vozRecVPintar(); });
  _vozRecV.leido = r;
  caja.textContent = '';

  if (!ta.value.trim()) {
    caja.appendChild(vozNodo('p', 'voz-aj-nota',
      'Una dirección por renglón. Si delante escribes su nombre —«Guía de estudio | https://…»— '
      + 'se queda ese; si no, se saca de la propia dirección.'));
    b.textContent = '🔗 Poner los recursos';
    b.classList.add('voz-btn-flojo');
    return;
  }

  caja.appendChild(vozNodo('p', 'voz-recv-cuenta',
    r.items.length
      ? (r.items.length === 1 ? 'Entendí 1 recurso' : 'Entendí ' + r.items.length + ' recursos')
      : 'Todavía no entiendo ninguna dirección'));

  /* Lo entendido se VE antes de guardar, con el icono que se le adivinó:
     un tipo que no se puede ver no se puede corregir. Es el repaso de la
     hoja de pegar un texto (regla 19). */
  if (r.items.length) {
    const lista = vozNodo('div', 'voz-recv-lista');
    r.items.forEach(it => {
      const fila = vozNodo('div', 'voz-recv-fila');
      fila.appendChild(vozNodo('span', 'voz-recv-ic', vozRecTipo(it.tipo).ic));
      const txt = vozNodo('span', 'voz-recv-txt2');
      txt.appendChild(vozNodo('span', 'voz-recv-nom', it.tit));
      txt.appendChild(vozNodo('span', 'voz-recv-dom',
        (it.pidiendo ? '⏳ buscando su título en YouTube… · ' : '')
        + vozRecTipo(it.tipo).t + ' · ' + vozRecDominio(it.url)));
      fila.appendChild(txt);
      lista.appendChild(fila);
    });
    caja.appendChild(lista);
  }

  if (r.repes.length) {
    caja.appendChild(vozNodo('p', 'voz-aj-nota',
      r.repes.length === 1 ? '1 ya estaba puesto en esta lectura, y se salta.'
                           : r.repes.length + ' ya estaban puestos en esta lectura, y se saltan.'));
  }

  /* ⚠️ Y LOS QUE NO SE ENTENDIERON SE NOMBRAN, con su número de renglón.
     Ninguno se descarta en silencio: un rechazo callado se ve desde fuera
     igual que una herramienta rota (regla 4, regla 14). */
  r.malos.forEach(m => {
    const l = vozNodo('p', 'voz-recv-malo');
    l.appendChild(vozNodo('span', null, '⚠️ Renglón ' + m.n + ', no parece una dirección: '));
    l.appendChild(vozNodo('span', 'voz-recv-crudo', m.t));
    caja.appendChild(l);
  });
  if (r.malos.length) {
    caja.appendChild(vozNodo('p', 'voz-aj-nota',
      'Si alguno sí lo era, ponle https:// delante y vuelve a mirar. Esos renglones no se guardan.'));
  }

  b.textContent = r.items.length
    ? '🔗 Poner ' + (r.items.length === 1 ? 'el recurso' : 'los ' + r.items.length)
    : '🔗 Poner los recursos';
  b.classList.toggle('voz-btn-flojo', !r.items.length);
}

function vozRecVGuardar() {
  if (!_vozRecV) return;
  const r = _vozRecV.leido || { items: [] };
  if (!r.items.length) {
    vozRecVPintar();
    vozAviso('No hay ninguna dirección que poner todavía.');
    return;
  }
  const cid = _vozRecV.cid;
  const or = _vozRecV.origen === 'maquina' ? 'maquina' : 'casa';
  const todo = vozRecLeeTodo();
  const lista = todo[cid] || (todo[cid] = []);
  let orden = vozRecDe(cid).reduce((m, x) => Math.max(m, x.orden || 0), 0);
  const ahora = Date.now();
  r.items.forEach((it, i) => {
    orden += 1;
    lista.push({
      id: vozRecId(), tipo: it.tipo, tit: it.tit, url: it.url,
      para: '', fuente: vozRecDominio(it.url).slice(0, 80), origen: or, dura: '',
      orden: orden, del: false,
      /* Relojes distintos y crecientes: con el mismo, dos recursos del
         mismo pegado empatarían también en el desempate por `u` y el
         orden de la repisa bailaría entre un arranque y el siguiente. */
      u: ahora + i,
      user: _vozYo || '', quien: _vozRecMiembro.nombre || '', sync: 0,
    });
  });
  vozRecGuardaTodo();
  /* ⚠️ UN SOLO VIAJE A LA NUBE PARA LOS SEIS. `vozRecGuardar` la pide en
     cada llamada y el temporizador acabaría juntándolas, pero contar con
     eso es contar con un detalle de otra función: aquí se escribe todo y
     se pide una vez, que es lo que de verdad hace falta con la señal de
     una tableta. */
  vozRecPedirNube(cid);
  const n = r.items.length;
  vozRecVCerrar();
  vozRecRepintar(cid);
  vozAviso('🔗 ' + n + (n === 1 ? ' recurso puesto' : ' recursos puestos'));
}

/* Los oyentes, una sola vez y desde el arranque de la herramienta: la
   hoja vive en el HTML, así que sus botones existen siempre. */
let _vozRecEnganchado = false;
function vozRecEngancha() {
  /* ⚠️ Una sola vez. `initVozPrestada` corre cada vez que se entra a la
     herramienta, y un segundo oyente en el botón de guardar guardaría el
     mismo recurso dos veces — con dos identificadores, así que la nube se
     quedaría con un gemelo y no habría error que lo dijera. */
  if (_vozRecEnganchado) return;
  _vozRecEnganchado = true;
  const cer = document.getElementById('voz-rec-cerrar');
  if (cer) cer.addEventListener('click', vozRecCerrarHoja);
  const g = document.getElementById('voz-rec-guardar');
  if (g) g.addEventListener('click', vozRecGuardarHoja);
  const url = document.getElementById('voz-rec-url');
  if (url) { url.addEventListener('input', vozRecAlEscribirUrl); url.addEventListener('change', vozRecAlEscribirUrl); }
  ['voz-rec-nom', 'voz-rec-para', 'voz-rec-dura'].forEach(id => {
    const e = document.getElementById(id);
    if (e) e.addEventListener('input', vozRecPintarHoja);
  });
  const ov = document.getElementById('voz-rec-overlay');
  /* Tocar el fondo cierra, como las demás hojas de la casa; tocar dentro
     no, que si no se cierra al elegir un chip. */
  if (ov) ov.addEventListener('click', e => { if (e.target === ov) vozRecCerrarHoja(); });

  const bpeg = document.getElementById('voz-rec-pegar');
  if (bpeg) {
    bpeg.hidden = !vozRecHayPortapapeles();
    bpeg.addEventListener('click', () => vozRecDelPortapapeles('voz-rec-url', vozRecAlEscribirUrl));
  }

  /* ── La hoja de pegar varios ── */
  const vcer = document.getElementById('voz-recv-cerrar');
  if (vcer) vcer.addEventListener('click', vozRecVCerrar);
  const vg = document.getElementById('voz-recv-guardar');
  if (vg) vg.addEventListener('click', vozRecVGuardar);
  const vta = document.getElementById('voz-recv-txt');
  if (vta) { vta.addEventListener('input', vozRecVPintar); vta.addEventListener('change', vozRecVPintar); }
  const vpeg = document.getElementById('voz-recv-pegar');
  if (vpeg) vpeg.addEventListener('click', () => vozRecDelPortapapeles('voz-recv-txt', vozRecVPintar));
  const vov = document.getElementById('voz-recv-overlay');
  if (vov) vov.addEventListener('click', e => { if (e.target === vov) vozRecVCerrar(); });

  /* ── El reproductor ── */
  const ycer = document.getElementById('voz-yt-cerrar');
  if (ycer) ycer.addEventListener('click', vozRecCerrarVideo);
  const yov = document.getElementById('voz-yt-overlay');
  if (yov) yov.addEventListener('click', e => { if (e.target === yov) vozRecCerrarVideo(); });

  /* ── La hoja de lo compartido ── */
  const ccer = document.getElementById('voz-comp-cerrar');
  if (ccer) ccer.addEventListener('click', vozCompCerrar);
  const cbus = document.getElementById('voz-comp-busca');
  if (cbus) cbus.addEventListener('input', vozCompPintar);
  const ctex = document.getElementById('voz-comp-texto');
  if (ctex) ctex.addEventListener('click', vozCompComoTexto);
  const cov = document.getElementById('voz-comp-overlay');
  if (cov) cov.addEventListener('click', e => { if (e.target === cov) vozCompCerrar(); });
}

/* ═════════════════════════════════════════════════════════════════
   COMPARTIR A F.A.R.O — «Compartir → F.A.R.O», desde donde sea
   ═════════════════════════════════════════════════════════════════
   Pedido por el autor el 18 de septiembre de 2026: sus recursos de
   NotebookLM acaban en OneDrive, y traer de allá un enlace hasta aquí
   eran diez toques y tres aplicaciones —copiar el vínculo, salir,
   abrir F.A.R.O, buscar la lectura, abrir Recursos, pegar, nombrar—.

   Ahora F.A.R.O sale en la hoja de compartir del aparato: en OneDrive
   es ⋯ → Compartir → F.A.R.O, y lo único que queda por decidir es a
   qué lectura va.

   ⚠️ Y LA DIRECCIÓN CASI NUNCA VIENE EN EL CAMPO `url`. Es el detalle
   que decide si esto funciona o no: las aplicaciones de Android mandan
   el enlace dentro del TEXTO (`EXTRA_TEXT`), a veces con una frase
   delante —«Mira este archivo: https://1drv.ms/…»—, y solo las que
   usan el intento de tipo URL rellenan `url`. Quien lea solo `url`
   tendrá una herramienta que en la mitad de las aplicaciones no recibe
   nada, y sin dar ningún error: llega la hoja, no llega el enlace. Por
   eso se busca también DENTRO del texto, y lo que sobra a los lados se
   propone como nombre.

   ⚠️ Y ES DE ANDROID CON LA APLICACIÓN INSTALADA. En el iPad no existe
   esta puerta —Safari no reparte a aplicaciones web— y allí sigue
   valiendo el pegado de siempre, que por eso mismo también se arregló
   (la hoja de pegar varios). Una sola de las dos dejaría a medio mundo
   fuera.
   ═════════════════════════════════════════════════════════════════ */

/* Los nombres que se declaran en `manifest.json`. Van aquí y no
   escritos dos veces: si alguien cambia uno en el manifiesto y no aquí,
   lo compartido llega y no lo recoge nadie —sin error, con la aplicación
   abriendo como siempre—, que es el peor de los fallos. La sonda lee el
   manifiesto de verdad y compara. */
const VOZ_COMP_PARAMS = { url: 'comp_url', txt: 'comp_txt', tit: 'comp_tit' };

let _vozComp = null;    // {url, tit, txt, resto} de lo que acaba de llegar

function vozCompartidoLee() {
  let p;
  try { p = new URLSearchParams(window.location.search); } catch (e) { return null; }
  const crudo = (p.get(VOZ_COMP_PARAMS.url) || '').trim();
  const txt   = (p.get(VOZ_COMP_PARAMS.txt) || '').trim();
  const tit   = (p.get(VOZ_COMP_PARAMS.tit) || '').trim();
  if (!crudo && !txt && !tit) return null;

  let url = '', resto = txt;
  const u1 = vozRecMiraUrl(crudo);
  if (u1.ok) url = u1.url;
  else {
    /* Ver arriba: el enlace viene DENTRO del texto casi siempre. */
    const m = txt.match(/https?:\/\/[^\s<>"'\)\]]+/);
    if (m) {
      const u2 = vozRecMiraUrl(m[0]);
      if (u2.ok) {
        url = u2.url;
        resto = (txt.slice(0, m.index) + ' ' + txt.slice(m.index + m[0].length)).replace(/\s+/g, ' ').trim();
      }
    }
  }
  return { url: url, tit: tit, txt: txt, resto: resto };
}

/* ⚠️ LA DIRECCIÓN SE LIMPIA AL CERRAR, NO AL LEER, y el orden importa.
   Limpiándola al leer, lo compartido se perdería en silencio en el caso
   que más va a pasar: `index.html` recarga UNA vez cuando el service
   worker nuevo toma el mando dentro de los diez primeros segundos (ver
   `controllerchange`), o sea justo al abrir —que es cuando llega esto—.
   Dejando los parámetros puestos, esa recarga vuelve a abrir la hoja,
   que es lo correcto; y una vez atendida o cerrada se quitan, para que
   recargar la página más tarde no la haga aparecer de la nada. */
function vozCompartidoLimpiar() {
  try {
    const u = new URL(window.location.href);
    let tocado = false;
    Object.keys(VOZ_COMP_PARAMS).forEach(k => {
      if (u.searchParams.has(VOZ_COMP_PARAMS[k])) { u.searchParams.delete(VOZ_COMP_PARAMS[k]); tocado = true; }
    });
    if (!tocado) return;
    const q = u.searchParams.toString();
    history.replaceState(null, '', u.pathname + (q ? '?' + q : '') + u.hash);
  } catch (e) {}
}

/* Lo llama `faroArranqueInicio` (js/app.js), que es el único sitio donde
   se decide quién se queda la pantalla al abrir. Devuelve `true` si
   había algo compartido, para que no le pongan nada encima. */
function faroArranqueCompartido() {
  const d = vozCompartidoLee();
  if (!d) return false;
  if (typeof switchView !== 'function') return false;
  switchView('view-voz');
  vozCompAbrir(d);
  return true;
}

function vozCompAbrir(d) {
  const ov = document.getElementById('voz-comp-overlay');
  if (!ov) return;
  _vozComp = d;
  const bus = document.getElementById('voz-comp-busca');
  if (bus) bus.value = '';
  ov.style.display = 'flex';
  vozCompPintar();
}

function vozCompCerrar() {
  const ov = document.getElementById('voz-comp-overlay');
  if (ov) ov.style.display = 'none';
  _vozComp = null;
  vozCompartidoLimpiar();
}

/* Los textos entre los que elegir, ordenados por lo último que se tocó y
   filtrados por el buscador —sin tildes ni mayúsculas, como el de la
   sala: quien busca «burocracia» en una tableta no escribe la tilde—. */
function vozCompCandidatos() {
  const q = vozSinTildes(((document.getElementById('voz-comp-busca') || {}).value || '')).toLowerCase().trim();
  return _vozCuentos
    .filter(c => {
      if (!q) return true;
      return vozSinTildes((c.titulo || '') + ' ' + (c.voz || '') + ' ' + (c.maquina || '')).toLowerCase().indexOf(q) >= 0;
    })
    .slice()
    .sort((a, b) => (b.actualizado || 0) - (a.actualizado || 0));
}

function vozCompPintar() {
  if (!_vozComp) return;
  const que = document.getElementById('voz-comp-que');
  const lista = document.getElementById('voz-comp-lista');
  if (!que || !lista) return;
  const d = _vozComp;

  /* Lo que llegó, a la vista y antes de nada: si el enlace no es el que
     se creía, se ve aquí y no después de colgarlo en una lectura.
     Todo con `textContent`: esto lo escribió otra aplicación. */
  que.textContent = '';
  if (d.url) {
    que.appendChild(vozNodo('span', 'voz-comp-ic', vozRecTipo(vozRecTipoDeUrl(d.url)).ic));
    const t = vozNodo('span', 'voz-comp-que-txt');
    const nom = vozRecNombreSuelto(d.tit || '') || vozRecNombreSuelto(d.resto || '') || vozRecNombreDeUrl(d.url);
    t.appendChild(vozNodo('span', 'voz-comp-que-nom', nom));
    t.appendChild(vozNodo('span', 'voz-comp-que-url', d.url));
    que.appendChild(t);
  } else {
    que.appendChild(vozNodo('span', 'voz-comp-ic', '📝'));
    const t = vozNodo('span', 'voz-comp-que-txt');
    t.appendChild(vozNodo('span', 'voz-comp-que-nom', 'Lo que compartiste no trae ninguna dirección'));
    t.appendChild(vozNodo('span', 'voz-comp-que-url', (d.txt || d.tit || '').slice(0, 160)));
    que.appendChild(t);
  }

  /* El botón de guardarlo como texto sale cuando no hay dirección —si no,
     esa pantalla sería un callejón sin salida— y también cuando lo
     compartido es largo, que es un ensayo entero mandado desde el chat de
     una máquina y es justo lo que esta herramienta lee. */
  const bt = document.getElementById('voz-comp-texto');
  if (bt) bt.hidden = !(!d.url || (d.txt || '').length >= 400);

  const cand = vozCompCandidatos();
  lista.textContent = '';
  const sub = document.getElementById('voz-comp-sub');
  if (sub) {
    sub.textContent = d.url
      ? (_vozCuentos.length ? '¿A qué lectura va este recurso?' : 'Todavía no hay ninguna lectura en el anaquel.')
      : 'Puedes guardarlo como un texto nuevo del anaquel.';
  }

  if (!cand.length) {
    lista.appendChild(vozNodo('p', 'voz-aj-nota',
      _vozCuentos.length ? 'Ninguna lectura coincide con eso.'
                         : 'Pega primero un texto en el anaquel y vuelve a compartir el enlace.'));
    return;
  }

  cand.slice(0, 40).forEach(c => {
    const b = vozBoton('voz-comp-item', null, () => vozCompElegir(c.cid),
      'Poner el recurso en «' + (c.titulo || 'Sin título') + '»');
    b.appendChild(vozNodo('span', 'voz-comp-item-tit', c.titulo || 'Sin título'));
    /* ⚠️ LA ETIQUETA VA TAMBIÉN AQUÍ. Es la regla 1 y la 25: una lista
       compacta que la perdiera sería la forma más barata de romperla, y
       además es lo que distingue dos ensayos que se llaman parecido. */
    b.appendChild(vozNodo('span', 'voz-comp-item-et',
      [c.voz ? 'a la manera de ' + c.voz : '', c.maquina ? 'lo escribió ' + c.maquina : '']
        .filter(Boolean).join(' · ')));
    const n = vozRecCuenta(c.cid);
    if (n) b.appendChild(vozNodo('span', 'voz-comp-item-n', n === 1 ? '1 recurso' : n + ' recursos'));
    lista.appendChild(b);
  });
  if (cand.length > 40) {
    lista.appendChild(vozNodo('p', 'voz-aj-nota', 'Hay más: escribe arriba para buscar.'));
  }
}

/* ⚠️ ELEGIR LA LECTURA ABRE LA SALA, y no es un rodeo: la hoja del
   recurso cuelga DENTRO de `#voz-lector` a propósito —colgada del body
   saldría con el z-index 100 de `.fin-modal-overlay`, muy por debajo de
   la sala—, así que con la sala cerrada el botón respondiendo y la hoja
   sin verse es exactamente la avería de las dos hojas del taller (regla
   35). Se abre la sala primero y la trampa deja de poder existir. Es lo
   mismo que ya hace la cuenta de recursos del menú ⋯ del anaquel. */
function vozCompElegir(cid) {
  const d = _vozComp;
  vozCompCerrar();
  if (typeof vozAbrirLector === 'function') vozAbrirLector(cid);
  vozRecAbrirHoja(cid, null, d);
}

/* Lo compartido sin dirección —o muy largo— entra por la hoja de pegar
   de siempre, con el texto ya puesto. No hay un segundo lector ni un
   segundo formulario: es la regla 30 (el adjunto no es un segundo
   lector) y la 9 del Apunte rápido. */
function vozCompComoTexto() {
  const d = _vozComp;
  if (!d) return;
  vozCompCerrar();
  if (typeof vozAbrirPegar !== 'function') return;
  vozAbrirPegar();
  const ta = document.getElementById('voz-pegar-txt');
  if (ta) ta.value = d.txt || d.tit || '';
  if (typeof vozRepasar === 'function') vozRepasar();
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
  vozSubCerrarBarra();
  vozCitCerrar();
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
      b.setAttribute('aria-pressed', o.id === activo ? 'true' : 'false');
      caja.appendChild(b);
    });
  };

  const guarda = (repintar) => {
    vozGuardaAjustes();
    vozAplicaAjustes();
    /* ⚠️ Cambiar la letra repagina el texto entero, así que hay que
       volver al PÁRRAFO en que iba la lectura. Y se usa el APUNTADO,
       porque medirlo ahora daría el párrafo de después del cambio: ver
       la nota de `_vozAncla`. Si se volviera al número de página, subir
       un punto la letra movería al lector media página cada vez. */
    if (repintar) vozPintarCap(_vozAncla, _vozSub);
    else vozPaginar(_vozAncla, _vozSub);
    vozPintarAjustes();
  };

  /* El modo va el primero: es la decisión más grande de la sala. */
  chips(fila('Lectura'), [{ id: 'paginas', ic: '📖', t: 'En páginas' }, { id: 'scroll', ic: '↕️', t: 'Deslizando' }],
    vozModo(), id => { _vozAj.modo = id; guarda(true); });
  if (vozModo() !== 'scroll') {
    chips(fila('Pasar página'), [{ id: 'deslizar', t: 'Deslizar' }, { id: 'hojear', t: '📄 Hojear, como un libro' }, { id: 'golpe', t: 'De golpe' }],
      _vozAj.paso || 'deslizar', id => { _vozAj.paso = id; guarda(false); });
  }

  chips(fila('Color'), VOZ_TEMAS, _vozAj.tema, id => { _vozAj.tema = id; guarda(false); });
  chips(fila('Letra'), VOZ_LETRAS, _vozAj.letra, id => { _vozAj.letra = id; guarda(false); });

  const menosMas = (caja, valor, paso, min, max, pon, muestra) => {
    const b1 = vozBoton('voz-aj-mm', '−', () => { pon(Math.max(min, +(valor - paso).toFixed(2))); guarda(false); }, 'Menos');
    const v  = vozNodo('span', 'voz-aj-val', muestra);
    const b2 = vozBoton('voz-aj-mm', '+', () => { pon(Math.min(max, +(valor + paso).toFixed(2))); guarda(false); }, 'Más');
    caja.appendChild(b1); caja.appendChild(v); caja.appendChild(b2);
  };

  menosMas(fila('Tamaño'), _vozAj.tam, 1, 14, 34, v => { _vozAj.tam = v; }, _vozAj.tam + ' px');
  menosMas(fila('Interlínea'), _vozAj.alto, 0.1, 1.2, 2.4, v => { _vozAj.alto = v; }, _vozAj.alto.toFixed(1));
  menosMas(fila('Márgenes'), _vozAj.margen, 6, 8, 80, v => { _vozAj.margen = v; }, _vozAj.margen + ' px');

  chips(fila('Alineado'), [{ id: 'si', t: 'Justificado' }, { id: 'no', t: 'A la izquierda' }],
    _vozAj.just ? 'si' : 'no', id => { _vozAj.just = (id === 'si'); guarda(false); });

  chips(fila('Capitular'), [{ id: 'si', t: 'Con capitular' }, { id: 'no', t: 'Sin capitular' }],
    _vozAj.capital ? 'si' : 'no', id => { _vozAj.capital = (id === 'si'); guarda(false); });

  /* Las dos páginas solo se ofrecen donde caben: en un teléfono de pie
     un chip que no hace nada es un chip que parece roto. */
  const hoja = document.getElementById('voz-hoja');
  if (vozModo() !== 'scroll' && hoja && hoja.clientWidth >= 560) {
    chips(fila('Páginas'), [{ id: 'auto', t: 'Auto' }, { id: '1', t: 'Una' }, { id: '2', t: 'Dos, como un libro' }],
      String(_vozAj.paginas || 'auto'), id => { _vozAj.paginas = id; guarda(false); });
  }

  if (vozPuedePantallaCompleta()) {
    const cp = fila('Pantalla');
    cp.appendChild(vozBoton('voz-aj-chip' + (vozEnPantallaCompleta() ? ' voz-aj-on' : ''),
      vozEnPantallaCompleta() ? '⛶ Salir de pantalla completa' : '⛶ Pantalla completa',
      () => { vozPantallaCompleta(!vozEnPantallaCompleta()); setTimeout(vozPintarAjustes, 300); }));
  }

  p.appendChild(vozNodo('p', 'voz-aj-nota',
    'La letra, el color y el modo son de este aparato: no le cambian la lectura a nadie más de la casa. ' +
    'Toca el centro de la página para esconder los mandos; los bordes pasan página. ' +
    'Selecciona un trozo para subrayarlo con el código de colores de la casa.'));
}

/* El panel de la izquierda del libro: el índice, los marcadores, los
   subrayados y el buscador, en pestañas. Son cuatro cosas que en un
   lector de libros están juntas porque hacen lo mismo: ir a un sitio
   del texto. */
function vozPintarPanelInd(tab) {
  const p = document.getElementById('voz-panel-ind');
  const c = _vozLeyendo;
  if (!p || !c) return;
  if (tab) _vozPanelTab = tab;
  p.textContent = '';

  const tabs = vozNodo('div', 'voz-tabs');
  /* La pestaña de fuentes solo sale cuando el texto TIENE fuentes: un
     cuento no lleva bibliografía, y una pestaña que se abre vacía se
     lee como una pestaña rota. Misma regla que el chip de «dos
     páginas», que solo se ofrece donde caben. */
  const hayFuentes = !!(vozIndiceFuentes(c) || { lista: [] }).lista.length;
  if (!hayFuentes && _vozPanelTab === 'fuentes') _vozPanelTab = 'ind';
  /* La del taller va la ÚLTIMA y sale siempre, aunque no haya
     actividades todavía: ahí es donde se montan, así que esconderla
     cuando está vacía sería esconder la puerta de entrada. */
  /* La de los recursos va pegada a la del taller —las dos son «qué hacer
     con esto que acabo de leer»— y, como ella, sale SIEMPRE aunque esté
     vacía: ahí es donde se ponen, así que esconderla cuando no hay
     ninguno sería esconder la puerta de entrada. */
  const nRec = vozRecCuenta(c.cid);
  const pestanas = [['ind', '☰ Índice'], ['marcas', '🔖 Marcas'], ['subs', '🖍 Subrayados'],
                    ['busca', '🔍 Buscar'], ['recs', '🔗 Recursos' + (nRec ? ' · ' + nRec : '')],
                    ['taller', '📝 Taller']];
  if (hayFuentes) pestanas.splice(1, 0, ['fuentes', '📚 Fuentes']);
  pestanas.forEach(([id, t]) => {
    const b = vozBoton('voz-tab' + (_vozPanelTab === id ? ' voz-tab-on' : ''), t, () => vozPintarPanelInd(id));
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', _vozPanelTab === id ? 'true' : 'false');
    /* La pestaña puesta se trae a la vista sola: con cinco, en un
       teléfono, la última queda fuera del borde y no se ve que hay
       más. Misma regla que los chips de materia de Videos M.E.T.A.S. */
    if (_vozPanelTab === id) setTimeout(() => { try { b.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {} }, 0);
    tabs.appendChild(b);
  });
  p.appendChild(tabs);

  const cuerpo = vozNodo('div', 'voz-panel-cuerpo');
  p.appendChild(cuerpo);
  if (_vozPanelTab === 'marcas') vozPintarMarcas(cuerpo);
  else if (_vozPanelTab === 'fuentes') vozPintarFuentes(cuerpo);
  else if (_vozPanelTab === 'subs') vozPintarSubrayados(cuerpo);
  else if (_vozPanelTab === 'busca') vozPintarBuscador(cuerpo);
  else if (_vozPanelTab === 'recs') vozRecPintarPanel(cuerpo, c);
  else if (_vozPanelTab === 'taller') vozPintarPestanaTaller(cuerpo);
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
    vozIrA(0, -1, 0); vozCerrarPaneles();
  });
  portada.appendChild(vozNodo('span', 'voz-ind-n', '·'));
  portada.appendChild(vozNodo('span', 'voz-ind-t', 'Portada'));
  cuerpo.appendChild(portada);
  caps.forEach((cap, i) => {
    const b = vozBoton('voz-ind-item' + (i === _vozCapActual && _vozAncla !== -1 ? ' voz-ind-on' : ''), null, () => {
      vozIrCapitulo(i, false); vozCerrarPaneles();
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
      vozIrA(m.cap || 0, m.vp, m.sub || 0);
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

/* ─── Los subrayados, en su pestaña ─── */
function vozPintarSubrayados(cuerpo) {
  const c = _vozLeyendo;
  cuerpo.appendChild(vozNodo('div', 'voz-ind-tit', 'Subrayados'));

  /* La leyenda del código de la casa, siempre a la vista: un código de
     colores que hay que recordar no es un código, es una adivinanza. */
  const ley = vozNodo('div', 'voz-ley');
  VOZ_CATS.forEach(cat => {
    const f = vozNodo('div', 'voz-ley-fila');
    f.appendChild(vozNodo('span', 'voz-ley-muestra voz-hl voz-hl-' + cat.id, cat.ini + ' · ' + cat.nombre));
    f.appendChild(vozNodo('span', 'voz-ley-ayuda', cat.ayuda));
    ley.appendChild(f);
  });
  cuerpo.appendChild(ley);
  const estado = vozNodo('p', 'voz-aj-nota voz-sub-estado', vozSubRotuloNube());
  estado.id = 'voz-sub-estado';
  cuerpo.appendChild(estado);

  const marcas = vozSubDe(c.cid).slice().sort((a, b) => a.cap - b.cap || a.vp - b.vp || a.i - b.i);
  if (!marcas.length) {
    cuerpo.appendChild(vozNodo('p', 'voz-aj-nota',
      'Todavía no hay subrayados. Selecciona un trozo del texto —manteniendo el dedo sobre una palabra— y elige su color.'));
    return;
  }
  const barra = vozNodo('div', 'voz-sub-barra-panel');
  barra.appendChild(vozBoton('voz-btn', '📋 Copiar los subrayados', () => {
    const texto = vozSubTextoPlano(c);
    const fin = ok => vozAviso(ok ? '📋 Subrayados copiados, con la etiqueta delante' : 'No se pudo copiar');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(() => fin(true), () => vozCopiarViejo(texto, fin));
    else vozCopiarViejo(texto, fin);
  }));
  cuerpo.appendChild(barra);

  let capAnt = -1;
  marcas.forEach(m => {
    if (m.cap !== capAnt) {
      capAnt = m.cap;
      cuerpo.appendChild(vozNodo('div', 'voz-sub-cap', vozNombreCap(c, m.cap)));
    }
    const cat = vozCat(m.c);
    const fila = vozNodo('div', 'voz-sub-item voz-sub-item-' + cat.id);
    const ir = vozBoton('voz-sub-ir', null, () => {
      vozIrA(m.cap, m.vp, 0);
      vozCerrarPaneles();
      setTimeout(() => {
        const el = document.querySelector('#voz-texto [data-cap="' + m.cap + '"][data-vp="' + m.vp + '"]');
        if (el) { el.classList.add('voz-p-hit'); setTimeout(() => el.classList.remove('voz-p-hit'), 2600); }
      }, 80);
    });
    ir.appendChild(vozNodo('span', 'voz-sub-ini', cat.ini + ' · ' + cat.nombre));
    ir.appendChild(vozNodo('span', 'voz-sub-txt', m.t));
    if (m.n) ir.appendChild(vozNodo('span', 'voz-sub-nota', '✎ ' + m.n));
    fila.appendChild(ir);
    fila.appendChild(vozBoton('voz-marca-x', '✕', () => vozSubQuitar(m.id), 'Quitar este subrayado'));
    cuerpo.appendChild(fila);
  });
}

/* La pestaña 📝 del panel: el resumen y la puerta. El taller entero no
   cabe en un panel de tres cuartos de pantalla —hay que escribir,
   arrastrar y leer la corrección—, así que aquí va lo que se decide de
   un vistazo y el botón que abre la pantalla de verdad. */
function vozPintarPestanaTaller(cuerpo) {
  const c = _vozLeyendo;
  const n = vozActCuenta(c.cid);
  const res = vozActResumen(c.cid);
  const nSub = vozSubDe(c.cid).length;
  cuerpo.appendChild(vozNodo('div', 'voz-ind-tit', 'Taller de comprensión'));
  if (!n) {
    cuerpo.appendChild(vozNodo('p', 'voz-aj-nota',
      'Todavía no hay actividades para este texto. Sirven para lo único que leer de corrido no hace: '
      + 'comprobar que lo leído se quedó — fechas, nombres, referencias.'));
  } else {
    cuerpo.appendChild(vozNodo('p', 'voz-aj-nota',
      n + (n === 1 ? ' actividad' : ' actividades') + ' · ' + res.firmes + ' ya te salen de memoria · '
      + (res.tocan ? res.tocan + ' tocan repasar hoy' : 'hoy no toca ninguna')));
  }
  cuerpo.appendChild(vozBoton('voz-btn voz-btn-pri voz-btn-ancho',
    n ? (res.tocan ? '▶️ Repasar lo que toca hoy (' + res.tocan + ')' : '📝 Abrir el taller') : '📝 Montar el taller',
    () => { vozCerrarPaneles(); vozActAbrirTaller(c.cid, 'sala'); }));
  if (nSub) {
    cuerpo.appendChild(vozNodo('p', 'voz-aj-nota',
      '🖍 Tienes ' + nSub + (nSub === 1 ? ' subrayado' : ' subrayados') + ' aquí: cada uno puede convertirse en una '
      + 'pregunta cuya respuesta es el trozo que marcaste, sin escribir nada.'));
  }
  const est = vozNodo('p', 'voz-aj-nota voz-act-estado', vozActRotuloNube());
  est.id = 'voz-act-estado';
  cuerpo.appendChild(est);
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
      /* El texto buscable, no `b.t`: una cifra dentro de una tabla es
         justo lo que se busca en un ensayo de investigación, y una
         entrada de bibliografía es lo segundo. */
      const bt = vozTextoDeBloque(b);
      if (!bt) return;
      const heno = vozSinTildes(bt).toLowerCase();
      const k = heno.indexOf(n);
      if (k < 0) return;
      const ini = Math.max(0, k - 45);
      let ext = bt.slice(ini, Math.min(bt.length, k + n.length + 60)).replace(/\s+/g, ' ');
      if (ini > 0) ext = '…' + ext;
      if (k + n.length + 60 < bt.length) ext += '…';
      res.push({ cap: ci, vp: i, ext: ext });
    });
  });
  return res;
}

/* ─── 📚 El panel de fuentes ───────────────────────────────────────
   La bibliografía del ensayo, pero por la que se puede navegar: cada
   entrada dice EN QUÉ PÁRRAFOS se la cita y lleva a cada uno de un
   toque. Es el camino de vuelta del que abre la ficha de una llamada
   —«¿dónde más usé esto?»— y no hay otra forma de contestarlo sin
   releer el ensayo entero.

   ⚠️ Y DICE LAS DOS COSAS QUE NO CUADRAN, porque en un trabajo de
   investigación son errores y no adornos: la fuente que está en la
   bibliografía y no se cita en ninguna parte, y la llamada del texto
   que no tiene fuente que la respalde. Las dos se descubren, si no,
   releyendo cuarenta páginas, que es tanto como no descubrirlas. */
function vozPintarFuentes(cuerpo) {
  const c = _vozLeyendo;
  const mapa = vozMapaCitas(c);
  const idx = mapa.idx;
  if (!idx || !idx.lista.length) {
    cuerpo.appendChild(vozNodo('p', 'voz-aj-nota',
      'Este texto no trae bibliografía. Se reconoce un capítulo final llamado «Referencias», «Bibliografía», «Fuentes» o «Notas».'));
    return;
  }

  cuerpo.appendChild(vozNodo('div', 'voz-ind-tit',
    idx.lista.length === 1 ? 'Una fuente' : idx.lista.length + ' fuentes'));
  cuerpo.appendChild(vozNodo('p', 'voz-aj-nota',
    'Toca una llamada dentro del texto —«[3]», «(Harari, 2014)»— para ver su fuente sin salir de la página.'));

  idx.lista.forEach(f => {
    const donde = mapa.donde.get(f.fid) || [];
    const it = vozNodo('div', 'voz-fu-item');
    const cab = vozNodo('div', 'voz-fu-cab');
    cab.appendChild(vozNodo('span', 'voz-fu-n', f.n != null ? String(f.n) : '❧'));
    const t = vozNodo('span', 'voz-fu-t');
    vozPintaTexto(t, f.t);
    cab.appendChild(t);
    it.appendChild(cab);

    const pie = vozNodo('div', 'voz-fu-pie');
    if (donde.length) {
      pie.appendChild(vozNodo('span', 'voz-fu-rot',
        donde.length === 1 ? 'Citada una vez:' : 'Citada ' + donde.length + ' veces:'));
      donde.slice(0, 12).forEach(d => {
        pie.appendChild(vozBoton('voz-fu-ir', vozNombreCap(c, d.cap) + ' · ' + d.t, () => {
          vozIrA(d.cap, d.vp, 0);
          vozResaltar(d.cap, d.vp, d.t);
          vozCerrarPaneles();
        }, 'Ir a donde se la cita'));
      });
    } else {
      pie.appendChild(vozNodo('span', 'voz-fu-sola', '⚠ No se la cita en el texto'));
    }
    if (f.url) {
      const a = vozNodo('a', 'voz-fu-url', '🔗 Abrir');
      a.setAttribute('href', f.url);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      pie.appendChild(a);
    }
    pie.appendChild(vozBoton('voz-fu-ir voz-fu-ver', '📖 En la bibliografía', () => {
      vozIrA(f.cap, f.vp, 0);
      vozResaltar(f.cap, f.vp, '');
      vozCerrarPaneles();
    }, 'Ir a la entrada, dentro del texto'));
    it.appendChild(pie);
    cuerpo.appendChild(it);
  });

  if (mapa.huerfanas.length) {
    cuerpo.appendChild(vozNodo('div', 'voz-ind-tit', 'Sin fuente'));
    cuerpo.appendChild(vozNodo('p', 'voz-aj-nota',
      mapa.huerfanas.length === 1
        ? 'Una llamada del texto no tiene entrada en la bibliografía.'
        : mapa.huerfanas.length + ' llamadas del texto no tienen entrada en la bibliografía.'));
    mapa.huerfanas.slice(0, 30).forEach(h => {
      cuerpo.appendChild(vozBoton('voz-fu-huerfana', h.t + ' · ' + vozNombreCap(c, h.cap), () => {
        vozIrA(h.cap, h.vp, 0);
        vozResaltar(h.cap, h.vp, h.t);
        vozCerrarPaneles();
      }, 'Ir a la llamada'));
    });
  }
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
        vozIrA(r.cap, r.vp, 0);
        vozResaltar(r.cap, r.vp, q);
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
   búsqueda; se busca sobre una copia normalizada con un mapa de
   posiciones al original, porque NFD cambia los largos. */
function vozResaltarEn(nodo, texto, q) {
  const s = String(texto || '');
  const n = vozSinTildes(q).toLowerCase().trim();
  if (!n) { nodo.textContent = s; return; }
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

/* Resalta el término dentro del bloque ya pintado y lo hace parpadear
   un momento, para que el ojo lo encuentre en la página. */
function vozResaltar(cap, vp, q) {
  const texto = document.getElementById('voz-texto');
  if (!texto) return;
  const el = texto.querySelector('[data-cap="' + Number(cap) + '"][data-vp="' + Number(vp) + '"]');
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

/* Una tabla devuelta a texto, con sus tubos y su renglón de guiones.
   Lo usan las dos salidas —lo que copia el botón 📋 y lo que vuelve al
   recuadro de corregir—, y tiene que ser la MISMA forma que el lector
   entiende: si no, corregir una coma de un ensayo le desharía las
   tablas, y eso no da ningún error. */
function vozTablaEnTexto(p) {
  const L = [];
  if (p.tit) { L.push(p.tit); L.push(''); }
  const fila = celdas => '| ' + celdas.map(x => String(x == null ? '' : x).replace(/\|/g, '/')).join(' | ') + ' |';
  L.push(fila(p.cab || []));
  L.push(fila((p.al || []).map(a => a === 'c' ? ':---:' : (a === 'd' ? '---:' : '---'))));
  (p.f || []).forEach(f => L.push(fila(f)));
  return L;
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
      else if (p.k === 'fuente') L.push((p.n != null ? '[' + p.n + '] ' : '• ') + p.t);
      else if (p.k === 'tabla') vozTablaEnTexto(p).forEach(x => L.push(x));
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

/* ¿Este texto es en verso, o solo tiene algún trozo que lo parece? */
function vozVersosMandan(c) {
  if (vozGenero(c.genero).id === 'poema') return true;
  const n = vozCuentaBloques(c.capitulos);
  const total = n.p + n.verso;
  return n.verso > 0 && n.verso * 2 >= total;
}

function vozAbrirPegar(cuento) {
  const ov = document.getElementById('voz-pegar-overlay');
  if (!ov) return;
  _vozEditando = cuento ? cuento.cid : null;
  _vozAuto = {};
  _vozGeneroTocado = !!cuento;
  _vozVersosTocado = false;

  const ta = document.getElementById('voz-pegar-txt');
  const g = id => document.getElementById(id);
  if (ta) ta.value = cuento ? vozTextoCuerpo(cuento, { sinFuentes: true }) : '';
  const fu = g('voz-f-fuentes');
  if (fu) fu.value = cuento ? vozFuentesTexto(cuento) : '';
  ['voz-f-titulo', 'voz-f-voz', 'voz-f-maquina', 'voz-f-encargo', 'voz-f-nota']
    .forEach(id => { const e = g(id); if (e) e.value = ''; });
  const versos = g('voz-f-versos');
  /* ⚠️ Y VUELVE ENCENDIDO SOLO SI EL TEXTO ES DE VERDAD EN VERSO. Con
     «tiene alguna estrofa» se encendía en un ensayo de ochomil
     palabras al que cinco trozos se le habían leído como verso —una
     tabla, una lista—, y encendido fuerza el verso en TODO el texto:
     al guardar salían más estrofas, y a la siguiente corrección más.
     Un interruptor que se retroalimenta destroza la prosa en tres
     vueltas, y ninguna da error. */
  if (versos) versos.checked = cuento ? vozVersosMandan(cuento) : false;

  if (cuento) {
    g('voz-f-titulo').value  = cuento.titulo || '';
    g('voz-f-voz').value     = cuento.voz || '';
    g('voz-f-maquina').value = cuento.maquina || '';
    g('voz-f-encargo').value = cuento.encargo || '';
    g('voz-f-nota').value    = cuento.nota || '';
  }
  vozPonGenero(cuento ? vozGenero(cuento.genero).id : 'cuento');
  vozPintarChipsFicha();
  _vozEstantesForm = cuento ? vozEstantesDe(cuento) : [];
  vozPintarEstantes(document.getElementById('voz-estantes-caja'),
    () => _vozEstantesForm.slice(), l => { _vozEstantesForm = l; });

  const inpArch = g('voz-f-archivo');
  if (inpArch && window.VozAdjunto && window.VozAdjunto.acepta) inpArch.accept = window.VozAdjunto.acepta;
  const btnAdj = g('voz-adjuntar-btn');
  if (btnAdj && !vozAdjuntoHay()) btnAdj.textContent = '📎 Adjuntar (no disponible aquí)';
  vozAdjDecir('');

  const tit = g('voz-pegar-tit');
  if (tit) tit.textContent = cuento ? '✏️ Corregir el texto' : '➕ Pegar un texto';
  const retirar = g('voz-retirar-caja');
  if (retirar) {
    retirar.textContent = '';
    retirar.hidden = !cuento;
    if (cuento) retirar.appendChild(vozBotonRetirar(cuento, 'voz-btn voz-btn-ancho', '🗑 Retirar del anaquel'));
  }

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

/* ══════════════════════════════════════════════════════════════════
   LOS CHIPS DE LA VOZ Y DE LA MÁQUINA
   ══════════════════════════════════════════════════════════════════
   Pedido por el autor el 12 de septiembre de 2026, con la hoja de pegar
   en la pantalla y los ejemplos rodeados a mano: «necesito que allí
   pongas para poder seleccionar: Gemini, Perplexity, Claude».

   Son los DOS campos que hacen falta para guardar, o sea los dos que se
   escriben en cada texto, y siempre son los mismos tres o cuatro
   valores. Escribirlos a mano en una tableta, veinte veces, no es solo
   lento: se escriben MAL. En el anaquel de esta casa hay un «Gemeni» de
   eso, y una máquina mal escrita rompe en silencio el chip que agrupa
   por máquina —salen dos montones donde había uno— sin dar ningún
   error y sin que nadie lo mire.

   ⚠️ Y LAS SUGERENCIAS SALEN DEL HISTORIAL, NO DE UNA LISTA ESCRITA A
   MANO. Es la regla 2 del Apunte rápido, y aquí importa más: la voz que
   se imita es de cada casa —«Rulfo», «un narrador de pueblo», «un
   informe de investigación»— y una lista fija no la puede adivinar
   nunca. Lo que sí lleva lista es la MÁQUINA, porque son cuatro y son
   las mismas para todo el mundo; van detrás de las que ya se usaron, y
   solo las que no estén ya.

   Escribir a mano se sigue pudiendo, y eso no es un detalle: un chip
   que fuera la única manera de rellenar el campo dejaría fuera la
   primera vez que se usa una voz nueva. */

/* Las cuatro de siempre. Es una lista corta y cerrada A PROPÓSITO: no
   es «los modelos que existen» —eso estaría viejo en un mes— sino los
   que esta casa usa, y añadir uno es esta línea. Misma regla que
   VOZ_GENEROS. */
const VOZ_MAQUINAS = ['Gemini', 'Claude', 'ChatGPT', 'Perplexity'];

/* Lo que ya se usó en el anaquel, de lo más usado a lo menos. Las
   lápidas no cuentan: un texto retirado no tiene por qué seguir
   proponiendo su voz. */
function vozUsados(campo) {
  const cuenta = new Map();
  (_vozCuentos || []).forEach(c => {
    if (!c || c.borrado) return;
    const v = String(c[campo] || '').trim();
    if (!v) return;
    cuenta.set(v, (cuenta.get(v) || 0) + 1);
  });
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(x => x[0]);
}

/* Pinta una fila de chips que rellenan un campo de texto de un toque.
   El chip puesto se ve marcado, y tocarlo otra vez LO QUITA: sin eso,
   un chip tocado por error solo se deshace borrando el campo a mano. */
function vozPintarChipsCampo(idCaja, idCampo, sugeridas) {
  const caja = document.getElementById(idCaja);
  const campo = document.getElementById(idCampo);
  if (!caja || !campo) return;
  const actual = campo.value.trim().toLowerCase();
  const vistos = new Set();
  const lista = [];
  sugeridas.forEach(v => {
    const k = v.trim().toLowerCase();
    if (!k || vistos.has(k)) return;
    vistos.add(k);
    lista.push(v.trim());
  });
  caja.textContent = '';
  caja.hidden = !lista.length;
  /* Un tope: con cuarenta textos en el anaquel, la fila de voces sería
     más larga que el formulario. Se deslizan (`.voz-chips` ya lo hace),
     pero lo que no cabe en dos vistazos no lo lee nadie. */
  lista.slice(0, 8).forEach(v => {
    const puesto = v.toLowerCase() === actual;
    const b = vozBoton('voz-chip voz-chip-chica' + (puesto ? ' voz-chip-on' : ''), v, () => {
      campo.value = puesto ? '' : v;
      /* Rellenar un campo obligatorio tiene que apagar el aviso de
         «falta…» en el momento, no al guardar. */
      vozPintarBotonGuardar();
      vozPintarChipsCampo(idCaja, idCampo, sugeridas);
      campo.focus();
    }, puesto ? 'Quitar «' + v + '»' : 'Poner «' + v + '»');
    b.setAttribute('aria-pressed', puesto ? 'true' : 'false');
    caja.appendChild(b);
  });
}

/* ⚠️ ¿Dos nombres que se diferencian en UNA sola letra? Hace falta por
   el «Gemeni» que hay en el anaquel de esta casa: proponerlo como chip
   al lado de «Gemini» sería repartir la errata en vez de pararla, y
   además con los dos a la vista nadie distingue cuál es cuál de un
   vistazo. Una letra, y no dos: a dos ya caben cosas distintas de
   verdad («Claude» y «Claude 3»). El texto viejo se queda como está
   —no se le toca nada a nadie por detrás—, pero el que se guarde de
   ahora en adelante lleva el nombre bueno. */
function vozUnaLetraDe(a, b) {
  const x = vozSinTildes(a).toLowerCase().trim(), y = vozSinTildes(b).toLowerCase().trim();
  if (x === y || Math.abs(x.length - y.length) > 1) return false;
  let i = 0, j = 0, fallos = 0;
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) { i++; j++; continue; }
    if (++fallos > 1) return false;
    if (x.length > y.length) i++;
    else if (y.length > x.length) j++;
    else { i++; j++; }
  }
  return fallos + (x.length - i) + (y.length - j) <= 1;
}

function vozPintarChipsFicha() {
  vozPintarChipsCampo('voz-voz-chips', 'voz-f-voz', vozUsados('voz'));
  const usadas = vozUsados('maquina').filter(m => !VOZ_MAQUINAS.some(b => vozUnaLetraDe(m, b)));
  vozPintarChipsCampo('voz-maquina-chips', 'voz-f-maquina', usadas.concat(VOZ_MAQUINAS));
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
function vozTextoCuerpo(c, op) {
  /* Con `sinFuentes`, la bibliografía no sale aquí: sale en su caja
     (ver `vozFuentesDeLista`). Es lo que hace que corregir un informe
     devuelva cada cosa a donde se pega, y no las dos revueltas en el
     mismo recuadro. */
  const sinFuentes = !!(op && op.sinFuentes);
  const L = [];
  (c.capitulos || []).forEach((cap, i) => {
    if (sinFuentes && cap.ref && (cap.p || []).length && (cap.p || []).every(b => b.k === 'fuente')) return;
    if (cap.epi && cap.epi.length) {
      cap.epi.forEach(b => { L.push(b.t.split('\n').map(x => '> ' + x).join('\n')); L.push(''); });
    }
    if (cap.t) { if (i || L.length) L.push(''); L.push('## ' + cap.t); L.push(''); }
    (cap.p || []).forEach(p => {
      if (sinFuentes && p.k === 'fuente') return;
      if (p.k === 'sep') L.push('* * *');
      else if (p.k === 'fin') L.push('FIN');
      else if (p.k === 'h3') L.push('### ' + p.t);
      else if (p.k === 'li') L.push((p.n != null ? p.n + '. ' : '- ') + p.t);
      /* Una fuente vuelve como vino: con su número entre corchetes si
         lo traía, y con viñeta si no. Dentro de un capítulo de
         bibliografía, el lector las dos las vuelve a entender como
         fuentes — que es lo que exige la comprobación 16: el alfabeto
         de ida tiene que ser el de vuelta. */
      else if (p.k === 'fuente') L.push((p.n != null ? '[' + p.n + '] ' : '- ') + p.t);
      else if (p.k === 'tabla') vozTablaEnTexto(p).forEach(x => L.push(x));
      else if (p.k === 'cita') L.push(p.t.split('\n').map(x => '> ' + x).join('\n'));
      else L.push(p.t);
      L.push('');
    });
  });
  return L.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/* ══════════════════════════════════════════════════════════════════
   📎 EL ARCHIVO ADJUNTO
   ══════════════════════════════════════════════════════════════════
   Pedido por el autor el 12 de septiembre de 2026: «podrías poner
   adjuntar ya sea de Drive, de OneDrive… al adjuntar en pdf o en
   Documentos de Google, o un word, las citas ya están bien específicas
   y con mejor orden».

   Y es cierto, por un motivo que se puede escribir: COPIAR una pantalla
   pierde información y ADJUNTAR un archivo no. Al copiar, los títulos
   pierden su renglón —el de su informe llegó pegado a la frase
   siguiente—, las tablas se deshacen en una fila de tubos, los
   numeritos de las citas son dibujos y no viajan, y la lista de fuentes
   se queda donde estaba. En el archivo todo eso está dicho con todas
   las letras.

   ⚠️ Y DE DRIVE Y DE ONEDRIVE SE ADJUNTA SIN CONECTAR NINGUNA CUENTA:
   el selector de archivos del propio aparato ya los ofrece como
   orígenes, igual que la carpeta de descargas. Meter aquí el selector
   de Google o el de Microsoft sería traer dos identificaciones más, dos
   librerías de fuera y dos cosas que pueden caerse —en una aplicación
   que tiene dentro la Bóveda— para llegar al mismo archivo al que ya se
   llega con un toque.

   ⚠️ Y LO LEÍDO SE DEJA EN EL RECUADRO, A LA VISTA, NO SE GUARDA SOLO.
   Es la regla de toda la hoja de pegar: se enseña qué se entendió antes
   de guardar nada. Un adjunto que fuera directo al anaquel sería la
   única parte de esta herramienta que hace cosas a espaldas de quien la
   usa, y encima con lo que más puede salir torcido. */
function vozAdjuntoHay() {
  return !!(window.VozAdjunto && typeof window.VozAdjunto.leer === 'function');
}

function vozAdjDecir(msg, mal) {
  const caja = document.getElementById('voz-adj-estado');
  if (!caja) return;
  caja.textContent = msg || '';
  caja.hidden = !msg;
  caja.classList.toggle('voz-adj-mal', !!mal);
}

async function vozAdjuntar(file) {
  if (!file) return;
  if (!vozAdjuntoHay()) {
    vozAdjDecir('El lector de archivos no cargó en este aparato. Pega el texto a mano en el recuadro y funciona igual.', true);
    return;
  }
  const ta = document.getElementById('voz-pegar-txt');
  if (!ta) return;
  vozAdjDecir('📎 Abriendo «' + file.name + '»…');
  const r = await window.VozAdjunto.leer(file);
  if (r.error) { vozAdjDecir('📎 ' + r.error, true); return; }
  if (!String(r.texto || '').trim()) {
    vozAdjDecir('📎 «' + file.name + '» se abrió, pero no tiene texto dentro. Si es un documento escaneado, lo que hay son fotos de las páginas, no letras.', true);
    return;
  }

  /* ⚠️ Lo que ya estaba escrito NO se pisa sin avisar: se añade debajo.
     Alguien que pega un texto, adjunta un anexo y guarda espera tener
     las dos cosas, y perder lo escrito sin poder deshacerlo sería la
     peor sorpresa de toda la herramienta. */
  const habia = ta.value.trim();
  ta.value = habia ? (habia + '\n\n' + r.texto) : r.texto;

  /* El lector nuevo manda: lo que traiga el archivo vuelve a rellenar
     el título y las demás etiquetas (`_vozAuto`), y el interruptor de
     versos se queda como estaba. */
  vozRepasar();

  const c = r.cuenta;
  const partes = [];
  if (c) {
    if (c.cabeceras) partes.push(c.cabeceras + (c.cabeceras === 1 ? ' apartado' : ' apartados'));
    if (c.tablas) partes.push(c.tablas + (c.tablas === 1 ? ' tabla' : ' tablas'));
    if (c.notas) partes.push(c.notas + (c.notas === 1 ? ' nota al pie' : ' notas al pie'));
    if (c.listas) partes.push(c.listas + (c.listas === 1 ? ' ítem de lista' : ' ítems de lista'));
    if (c.citas) partes.push(c.citas + (c.citas === 1 ? ' cita' : ' citas'));
  }
  vozAdjDecir('📎 ' + file.name + (partes.length ? ' · ' + partes.join(' · ') : '') +
              (habia ? ' · añadido debajo de lo que ya había' : '') +
              '. Está en el recuadro de arriba: míralo antes de guardar.');
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
  const cajaFu = document.getElementById('voz-f-fuentes');
  r = vozComponerFuentes(r, cajaFu ? cajaFu.value : '');
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
      r = vozComponerFuentes(vozLeer(ta.value, vozOpcionesLectura()), cajaFu ? cajaFu.value : '');
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
  if (r.cuenta.tablas) datos.push(r.cuenta.tablas + (r.cuenta.tablas === 1 ? ' tabla' : ' tablas'));
  if (r.cuenta.fuentes) datos.push(r.cuenta.fuentes + (r.cuenta.fuentes === 1 ? ' fuente' : ' fuentes'));
  datos.forEach(t => res.appendChild(vozNodo('span', 'voz-rep-dato', t)));
  caja.appendChild(res);

  /* ⚠️ Y SE DICE CUÁNTAS LLAMADAS SE QUEDARON SIN FUENTE. En un ensayo
     de investigación eso no es un detalle de pantalla: es una cita que
     no se puede comprobar. Encontrarlas después, releyendo cuarenta
     páginas, es tanto como no encontrarlas — y aquí salen antes de
     guardar, que es cuando el texto todavía está en el recuadro y se
     arregla pegándolo otra vez. */
  const mapaPeg = vozMapaCitas({ cid: '__pegado__', capitulos: r.capitulos });
  vozOlvidaFuentes();   // ese índice es de un texto que no existe todavía
  if (r.cuenta.fuentes || mapaPeg.huerfanas.length) {
    const sinCitar = mapaPeg.idx.lista.filter(f => !mapaPeg.donde.has(f.fid)).length;
    const citadas = mapaPeg.idx.lista.length - sinCitar;
    const l = [];
    /* ⚠️ Y SIN NINGUNA BIBLIOGRAFÍA, EL AVISO DICE QUÉ HACER. Decirle a
       alguien «una llamada del texto no tiene fuente» cuando el texto
       no trae NI UNA fuente se lee como un reproche y no como una
       instrucción: él copió todo lo que se podía copiar, y la lista
       vive en otro sitio de la pantalla del informe. El aviso tiene que
       nombrar la caja donde se pega. */
    if (!mapaPeg.idx.lista.length && mapaPeg.huerfanas.length) {
      l.push((mapaPeg.huerfanas.length === 1 ? 'El texto trae una llamada a una fuente' : 'El texto trae ' + mapaPeg.huerfanas.length + ' llamadas a fuentes') +
             ' (' + mapaPeg.huerfanas.slice(0, 4).map(h => h.t).join(', ') + (mapaPeg.huerfanas.length > 4 ? '…' : '') + ') y NINGUNA bibliografía. ' +
             'Si es un informe, su lista de fuentes suele estar plegada en otra parte de la pantalla: ábrela, cópiala y pégala aquí arriba, en «📚 Las fuentes del informe». ' +
             'Se guarda igual sin ella, pero las citas no se podrán consultar.');
    }
    if (citadas) l.push(citadas === 1 ? 'Una fuente queda enlazada con su llamada en el texto.'
                                      : citadas + ' fuentes quedan enlazadas con sus llamadas en el texto.');
    if (sinCitar) l.push(sinCitar === 1 ? 'Una fuente de la bibliografía no se cita en ninguna parte.'
                                        : sinCitar + ' fuentes de la bibliografía no se citan en ninguna parte.');
    if (mapaPeg.huerfanas.length && mapaPeg.idx.lista.length) {
      l.push((mapaPeg.huerfanas.length === 1 ? 'Una llamada del texto no tiene fuente' : mapaPeg.huerfanas.length + ' llamadas del texto no tienen fuente') +
             ': ' + mapaPeg.huerfanas.slice(0, 6).map(h => h.t).join(', ') + (mapaPeg.huerfanas.length > 6 ? '…' : ''));
    }
    if (l.length) caja.appendChild(vozNodo('div', 'voz-rep-fuentes', l.join(' ')));
  }

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
    estantes: _vozEstantesForm.slice(),
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
  /* ⚠️ AQUÍ SE MONTA EL TALLER, ANTES DE PINTAR Y ANTES DE SUBIR NADA.
     «El sistema debe tener las actividades una vez que se pegue o suba un
     ensayo»: o sea que al volver al anaquel la ficha ya tiene que decir
     cuántas hay, no «montar el taller». Corre en el aparato y tarda lo que
     tarda un puñado de expresiones regulares, así que no hay nada que
     esperar; y solo toca las de vía 'txt', de modo que corregir una coma
     no le borra a nadie lo que pegó a mano. */
  const nAct = vozActMontarDelTexto(c.cid);
  vozCerrarPegar();
  vozRender();

  const res = await vozSubir(c);
  /* ⚠️ Cada motivo se dice como es. «Subirá cuando vuelva la señal»
     puesto en todos los casos era mentira en dos de ellos: con la
     tabla sin instalar no va a subir nunca, y con un texto ajeno
     tampoco por mucho que vuelva la señal. Un aviso que se equivoca de
     causa manda a mirar donde no está el problema. */
  let msg;
  if (res.ok) msg = '📖 Guardado, y ya está en los demás aparatos';
  else if (res.motivo === 'sin-nube')   msg = '📴 Guardado aquí. Falta correr voz_prestada.sql para que viaje';
  else if (res.motivo === 'sin-sesion') msg = '📴 Guardado aquí. Entra en F.A.R.O para que viaje';
  else if (res.motivo === 'sin-senal')  msg = '📡 Guardado aquí. Subirá solo la próxima vez que abras esto';
  else if (res.motivo === 'ajeno')      msg = '✋ Ese texto lo puso otra persona: solo quien lo puso puede corregirlo';
  else msg = '⚠️ Guardado aquí, pero la nube lo rechazó: ' + (res.detalle || 'sin detalle');
  /* Y se DICE que el taller quedó montado. Hacerlo en silencio sería la
     mitad de lo que se pidió: nadie va a abrir un taller que no sabe que
     existe. */
  vozAviso(msg + (nAct ? ' · 📝 ' + nAct + (nAct === 1 ? ' actividad lista' : ' actividades listas') : ''));
  vozRender();
}

/* ⚠️ RETIRAR NO BORRA LA FILA: LA MARCA. Es la lápida de la repisa de
   enlaces y de los videos de M.E.T.A.S, y hace falta por lo mismo: si
   este aparato borrara la fila, la tableta que todavía tiene su copia
   la subiría otra vez en la siguiente sincronización y el texto
   resucitaría solo, sin que nadie entendiera por qué. */
/* ⚠️ Y SE CONFIRMA EN LA PROPIA PANTALLA, NO CON `confirm()`. El diálogo
   del navegador no se ve igual en todos los aparatos —en una aplicación
   instalada puede no salir, y entonces el botón parece que no hace
   nada—, y un «¿Retirar?» que no se ve es un texto que «no se puede
   eliminar». Por eso el botón 🗑 pide la confirmación con un segundo
   botón al lado, y esta función ya viene confirmada. */
async function vozRetirar(cid) {
  const id = cid || _vozEditando;
  if (!id) return;
  const c = _vozCuentos.find(x => x.cid === id);
  if (!c) return;
  const lapida = Object.assign({}, c, { borrado: true, actualizado: Date.now() });
  _vozCuentos = _vozCuentos.filter(x => x.cid !== c.cid);
  try {
    const guardados = vozLeeLocal().filter(x => x.cid !== c.cid);
    guardados.push(lapida);
    localStorage.setItem(VOZ_LOCAL, JSON.stringify(guardados));
  } catch (e) {}
  vozCerrarPegar();
  vozCerrarMenu();
  vozRender();
  const res = await vozSubir(lapida);
  if (res.ok) vozAviso('🗑 Retirado del anaquel, también en los demás aparatos');
  else if (res.motivo === 'sin-nube' || res.motivo === 'sin-sesion') vozAviso('🗑 Retirado de este aparato');
  else if (res.motivo === 'sin-senal') vozAviso('🗑 Retirado aquí. En la nube se retira cuando vuelva la señal');
  else if (res.motivo === 'ajeno') vozAviso('✋ Ese texto lo puso otra persona de la casa: solo esa persona puede retirarlo');
  else vozAviso('⚠️ Retirado aquí, pero la nube lo rechazó: ' + (res.detalle || 'sin detalle'));
}

/* El botón de retirar con su confirmación al lado, para la ficha y para
   el menú. Un toque enseña «Sí, retirar · No» en el mismo sitio; nada se
   retira con un solo toque, y nada depende de un diálogo del navegador. */
function vozBotonRetirar(c, clase, rotulo, alConfirmar) {
  const caja = vozNodo('span', 'voz-retirar-caja');
  const b = vozBoton(clase || 'voz-btn', rotulo || '🗑', null, 'Retirar del anaquel');
  const si = vozBoton('voz-btn voz-btn-peligro', 'Sí, retirar', () => {
    vozRetirar(c.cid);
    if (alConfirmar) alConfirmar();
  }, 'Confirmar: retirar del anaquel');
  const no = vozBoton('voz-btn', 'No', () => {
    caja.classList.remove('voz-retirar-abierto'); si.hidden = true; no.hidden = true;
  }, 'No retirar');
  si.hidden = true; no.hidden = true;
  b.addEventListener('click', () => {
    const abierto = caja.classList.toggle('voz-retirar-abierto');
    si.hidden = !abierto; no.hidden = !abierto;
    if (abierto) si.focus();
  });
  caja.appendChild(b); caja.appendChild(si); caja.appendChild(no);
  return caja;
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

  /* Lo primero de la ayuda es el atajo que evita toda la ayuda: si el
     texto está en un archivo, adjuntarlo trae los títulos y las tablas
     ya puestos y no hay que saberse nada de lo de abajo. */
  const adj = vozNodo('div', 'voz-ayuda-nota');
  adj.appendChild(vozNodo('strong', null, '📎 Si el texto está en un archivo, adjúntalo: '));
  adj.appendChild(document.createTextNode(
    'trae los títulos, las tablas, las notas al pie y los enlaces ya puestos, y el selector del aparato incluye Drive y OneDrive. ' +
    'Un Documento de Google no es un archivo y el aparato lo exporta al elegirlo, así que si sale mal: ábrelo, ⋮ → «Compartir y exportar» → «Guardar como Word (.docx)», y adjunta ese. Un PDF no sirve: no guarda el texto en renglones.'));
  caja.appendChild(adj);

  caja.appendChild(vozNodo('p', null,
    'Y si lo pegas a mano, pégalo tal como venga. Lo único que hace falta saber es esto:'));

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


/* ══════════════════════════════════════════════════════════════════
   EL TALLER DE COMPRENSIÓN · lo leído se queda o no se queda
   ══════════════════════════════════════════════════════════════════
   Pedido por el autor el 16 de septiembre de 2026: «que en cada ensayo
   de esta herramienta pudieras crear el enlace de actividades de
   comprensión lectora, con el propósito de haber asimilado bien el
   contenido leído… tarjetas de memoria, de arrastre, preguntas de
   comprensión, preguntas de completar y de selección para recordar
   datos importantes como fechas, referencias».

   Qué resuelve, y por qué no es un adorno: un ensayo leído de corrido
   en una tableta se siente entendido mientras se lee y se ha ido a los
   tres días. Esa sensación tiene nombre en la casa —es la misma que
   audita la Ruta del Expediente Dorado: la facilidad con que corre un
   texto releído mide la COSTUMBRE y se factura como saber—. Lo único
   que la desmiente es cerrar el libro e intentar decirlo.

   ⚠️ DE DÓNDE SALEN LAS ACTIVIDADES, Y POR QUÉ SON DOS PUERTAS:

   1. SE PEGAN, como el texto, como el guion de El Rodaje y como el
      quiz de Videos M.E.T.A.S. Las escribe la misma máquina que
      escribió el texto, en la misma ventana, y trocearlas a mano en
      una tableta son doscientos toques.
   2. SE GENERAN DESDE LOS SUBRAYADOS, y esto cierra un círculo que ya
      estaba abierto: quien lee marca con los cinco colores lo que
      importa (regla 21), y eso YA ES la lista de lo que hay que
      recordar. La respuesta de una actividad generada es SIEMPRE el
      trozo que la persona marcó —sale del texto, no se inventa—.

   ⚠️ Y LO QUE NO SE HACE, POR LA MISMA REGLA QUE NO SE NEGOCIA EN
   VIDEOS M.E.T.A.S: aquí NO se adivina cuál es la respuesta correcta.
   Una opción marcada a ojo acierta una de cada cuatro veces, y un quiz
   con la respuesta cambiada no lo descubre nadie hasta que alguien
   acierta y la pantalla le dice que falló. Si el texto pegado no dice
   cuál es, no se marca ninguna: la pregunta sale en ÁMBAR, se dice con
   palabras y el guardado se para nombrando cuál falta.
   ══════════════════════════════════════════════════════════════════ */

const VOZ_ACT_LOCAL  = 'faro_voz_actividades_v1';
const VOZ_ACT_AVANCE = 'faro_voz_act_avance_v1';
const VOZ_ACT_TABLA  = 'voz_actividades';

/* Los cinco tipos, con su nombre y su icono. Como los géneros, viven
   en el aparato y no en la base (regla 15): añadir uno es una línea
   aquí, no una migración que alguien pega desde una tableta. */
const VOZ_ACT_TIPOS = [
  { id: 'flash',     ic: '🃏', t: 'Tarjeta',   pl: 'tarjetas de memoria' },
  { id: 'pares',     ic: '🔗', t: 'Emparejar', pl: 'de emparejar' },
  { id: 'opcion',    ic: '🔘', t: 'Selección', pl: 'de selección' },
  { id: 'completar', ic: '✏️', t: 'Completar', pl: 'de completar' },
  { id: 'abierta',   ic: '💭', t: 'Abierta',   pl: 'abiertas' },
];
function vozActTipo(id) { return VOZ_ACT_TIPOS.find(t => t.id === id) || VOZ_ACT_TIPOS[0]; }

let _vozAct = null;        // {cid: ficha} del aparato, lápidas incluidas
let _vozActNube = 'local'; // local | subiendo | al-dia | sin-tabla | sin-sesion | sin-senal | error
let _vozActTimer = null;
let _vozActSincronizando = false;
/* ⚠️ LO QUE SE GUARDÓ MIENTRAS SUBÍA LO ANTERIOR NO SE TIRA: SE APUNTA.
   La subida empieza haciendo su lista de lo que falta, así que lo que se
   guarde DESPUÉS de ese momento no entra en esa vuelta; y la vuelta nueva
   que pide el guardado se encontraba la subida en marcha y se iba sin hacer
   nada. Lo caro no era perderlo —se recuperaba al volver a abrir el
   taller—: era que la vuelta en marcha terminaba poniendo «☁️ están en
   todos los aparatos de la casa» con lo último todavía aquí. Decir que
   viajó lo que no viajó es peor que decir que falló, porque el que lo lee
   deja de vigilarlo (regla 14). */
let _vozActOtraVuelta = null;

function vozActId() {
  return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function vozActLeeTodo() {
  if (_vozAct) return _vozAct;
  try { _vozAct = JSON.parse(localStorage.getItem(VOZ_ACT_LOCAL) || '{}') || {}; }
  catch (e) { _vozAct = {}; }
  return _vozAct;
}

function vozActGuardaTodo() {
  try { localStorage.setItem(VOZ_ACT_LOCAL, JSON.stringify(vozActLeeTodo())); } catch (e) {}
}

/* La ficha de actividades de un texto. Devuelve SIEMPRE un objeto, con
   la lista vacía si no hay nada: así quien la pinta no tiene que
   preguntar dos veces. Una ficha con lápida cuenta como vacía. */
function vozActDe(cid) {
  const f = vozActLeeTodo()[cid];
  if (!f || f.borrado || !Array.isArray(f.items)) return { cid: cid, items: [], actualizado: 0 };
  return f;
}

function vozActCuenta(cid) {
  return vozActDe(cid).items.length;
}

/* ⚠️ EL DUEÑO DEL TALLER NO ES EL DUEÑO DEL TEXTO, Y SON DOS FILAS EN DOS
   TABLAS CON DOS FIRMAS DISTINTAS. Aquí se preguntaba `vozEsMio(c)`, o sea
   quién pegó el CUENTO, y lo que decide si la base acepta escribir es
   `voz_actividades.puesto_por`, o sea quién pegó las ACTIVIDADES. En esta
   casa eso no es un caso raro, es el caso normal: alguien pega el ensayo y
   otro le pone las preguntas —que es justo lo que el taller existe para
   permitir, «hazle las preguntas a tu hermana»—.

   Y fallaba de las dos maneras, las dos malas: con el texto de otra persona
   y las actividades mías, la pantalla apagaba MIS botones y me decía que las
   había puesto otro; con el texto mío y las actividades de otra, enseñaba los
   botones vivos y la base los rechazaba después con un 42501. Enseñar un
   botón vivo que la base va a rechazar es prometer algo que no se puede
   hacer, y apagarlo sin motivo parece un fallo de la pantalla (regla 14).

   Sin ficha todavía, el taller es de quien lo empiece: no hay fila que
   firmar y `vozActDe` devuelve una vacía y sin firma. */
function vozActEsMio(cid) {
  const f = vozActDe(cid);
  return !f.puesto_por || !_vozYo || f.puesto_por === _vozYo;
}

/* ─── El lector de lo pegado ──────────────────────────────────────
   ⚠️ AQUÍ LA ASIMETRÍA ES LA CONTRARIA QUE EN EL TEXTO, y por eso va
   escrita antes de tocar ninguna expresión regular:

     en el texto, ascender una línea a título PARTE el cuento;
     aquí, NO reconocer una pregunta la pierde, y perderla se ve.

   Un texto pegado se lee entero y un renglón mal leído se descubre
   leyendo; una tanda de actividades se REPASA ANTES de guardar (la
   pantalla dice cuántas entendió de cada tipo), así que equivocarse
   hacia «esto era una pregunta» sale a la luz en el acto. Por eso
   aquí se puede ser generoso donde allá había que ser miedoso.

   Lo único que NO se toca es la respuesta correcta: sin decirlo el
   texto, no se marca. */

/* Las cabeceras que cambian de modo. Se comparan sin tildes y en
   minúsculas, y basta con que la línea las CONTENGA: una máquina
   escribe «## 3. Preguntas de comprensión lectora (selección)» y eso
   tiene que caer en su sitio. */
const VOZ_ACT_CABECERAS = [
  [/tarjet|memor|flash|anverso|memoriz/, 'flash'],
  [/empareja|arrastr|relacion|une (?:cada|las|los)|columna|parej/, 'pares'],
  [/completa|rellen|hueco|espacio en blanco|llena/, 'completar'],
  [/abierta|analisis|reflexi|desarroll|ensayo corto|responde con tus/, 'abierta'],
  [/comprension|seleccion|opcion|eleccion|quiz|multiple|test|marca la/, 'opcion'],
];

function vozActModoDeCabecera(linea) {
  const t = vozSinTildes(linea).toLowerCase();
  for (const [re, modo] of VOZ_ACT_CABECERAS) if (re.test(t)) return modo;
  return '';
}

/* Una cabecera es una almohadilla, un rótulo en MAYÚSCULAS o una
   negrita sola: las tres formas en que una máquina separa secciones.
   Se le quitan los adornos antes de mirar qué dice. */
function vozActEsCabecera(l) {
  const s = l.trim();
  if (!s) return '';
  const pelada = s.replace(/^#{1,6}\s*/, '').replace(/^\*\*|\*\*$/g, '').replace(/^[*_]+|[*_]+$/g, '').trim();
  if (!pelada || pelada.length > 90) return '';
  const esAlmohadilla = /^#{1,6}\s/.test(s);
  const esNegrita = /^\*\*[^*]+\*\*[.:]?$/.test(s);
  const esMayus = pelada === pelada.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(pelada);
  /* ⚠️ UNA LÍNEA NUMERADA ES UNA PREGUNTA, NUNCA UNA CABECERA PELADA.
     «1. Según el texto, elige la opción correcta:» son ocho palabras, acaba
     en dos puntos y nombra un tipo («opción»), así que entraba por aquí
     como cabecera de sección: la pregunta se comía a sí misma y desaparecía
     de la tanda entera sin dar ningún aviso. Y no rompe las cabeceras de
     verdad, que una máquina numera pero escribe con almohadilla («## 3.
     Preguntas de comprensión»), en negrita o en mayúsculas: esas tres se
     miran aparte y siguen mandando. */
  const numerada = /^\s*\d{1,3}\s*[.)\]-]\s/.test(s.replace(/^#{1,6}\s*/, '').replace(/^\*\*\s*/, ''));
  const acabaEnDosPuntos = !numerada && /:$/.test(pelada) && pelada.split(/\s+/).length <= 8;
  if (!esAlmohadilla && !esNegrita && !esMayus && !acabaEnDosPuntos) return '';
  return vozActModoDeCabecera(pelada);
}

/* Quita la numeración de delante («1.», «3)», «- », «• »), que es como
   vienen numeradas las preguntas, y devuelve lo que queda. */
function vozActSinVineta(l) {
  return l.replace(/^\s*(?:[-*•·]\s+|\d{1,3}\s*[.)\]-]\s*)/, '').trim();
}

/* Una opción: «A) texto», «a. texto», «B - texto». La letra tiene que
   ser una sola y de las ocho primeras: con más, cualquier palabra que
   empiece por letra y guion pasaría por opción. */
function vozActOpcion(l) {
  let s = l.trim();
  /* ⚠️ Y LA NEGRITA ENVUELVE LA LÍNEA ENTERA, NO SOLO EL TEXTO. Poner
     «**B) el pozo se secó**» es como una máquina marca la buena cuando no
     quiere usar un emoji, y con el `**` delante esta expresión no casaba:
     la opción no se reconocía, se caía de la lista en el paso 8 y —lo
     caro— las letras de después se corrían, así que la correcta pasaba a
     señalar a otra. Se le quita el envoltorio y se le vuelve a poner
     alrededor del TEXTO, para que `vozActMarcaCorrecta` lo siga viendo
     como lo que es: la marca de que esa es la buena. */
  const env = s.match(/^\*\*(.+)\*\*$/);
  const negrita = !!env;
  if (env) s = env[1].trim();
  const m = s.match(/^\(?([A-Ha-h])\)?\s*[.)\-–—]\s*(\S.*)$/);
  if (!m) return null;
  const t = m[2].trim();
  return { letra: m[1].toUpperCase(), t: negrita ? '**' + t + '**' : t };
}

/* La marca de «esta es la buena», en cualquiera de las formas en que
   una máquina la escribe. Devuelve el texto ya limpio y si estaba
   marcada, para no dejar el ✅ dentro de la opción. */
function vozActMarcaCorrecta(t) {
  let s = t, ok = false;
  const marcas = [/\s*[✅✔✓☑]\s*/g, /\s*\((?:correcta?|respuesta correcta|la correcta|buena)\)\s*/gi,
                  /\s*\[(?:correcta?|x|X)\]\s*/g, /\s*←\s*(?:correcta?)?\s*$/i];
  marcas.forEach(re => { if (re.test(s)) { ok = true; s = s.replace(re, ' '); } });
  /* La negrita entera como marca, que es lo que hace una máquina
     cuando no quiere poner un emoji. Solo si envuelve TODA la opción:
     una negrita en mitad de la frase es énfasis, no respuesta. */
  const neg = s.trim().match(/^\*\*(.+)\*\*$/);
  if (neg) { ok = true; s = neg[1]; }
  return { t: s.replace(/\s{2,}/g, ' ').trim(), ok: ok };
}

/* ⚠️ LOS ADORNOS SE QUITAN ANTES DE MIRAR QUÉ DICE LA LÍNEA, y esto
   no es cosmética: una máquina escribe la lista de soluciones en
   negrita («**Respuestas: 1-A, 2-B**») y con viñeta («- Respuesta:
   B»), porque es un pie de tabla. Sin quitarlos, la línea no casaba
   con nada, se iba por la rama de «no se entendió» y las DOS preguntas
   se quedaban sin correcta: o sea que el guardado se paraba pidiendo
   justo lo que el texto ya traía escrito. Se descubrió pegando lo que
   de verdad devuelve una máquina, no leyendo el código. */
function vozActPelaAdornos(l) {
  return String(l || '').trim()
    .replace(/^[-*•·]\s+/, '')
    .replace(/^\*\*(.+)\*\*[.:]?$/, '$1')
    .replace(/^[_*](.+)[_*]$/, '$1')
    .trim();
}

/* «Respuesta: B», «Correcta: 3», «R: b)». Devuelve el índice (0-3) o
   el texto, que es lo que hace falta para las de completar. */
function vozActLineaRespuesta(l) {
  /* ⚠️ Y EL RÓTULO PUEDE LLEVAR SU ADJETIVO DETRÁS. Nadie escribe
     «Respuesta: B» a secas tantas veces como «Respuesta correcta: B», y
     con el separador pegado al rótulo esa línea no casaba con nada: se
     tiraba sin aviso y el guardado se paraba pidiendo cuál era la correcta
     con la respuesta escrita dos renglones más arriba. Es el mismo fallo
     que los adornos de `vozActPelaAdornos`, un escalón más adentro. La
     palabra de en medio va de una lista corta y cerrada: dejar pasar
     cualquiera convertiría «Respuesta que dio el autor: …» —prosa— en una
     marca de corrección. */
  const m = vozActPelaAdornos(l).match(
    /^(?:respuestas?|correctas?|clave|soluci[oó]n|r)\b(?:\s+(?:de\s+)?(?:correctas?|buenas?|final(?:es)?|v[aá]lidas?|respuestas?))?\s*[:.\-–—]\s*(\S.*)$/i);
  return m ? m[1].trim().replace(/\*\*/g, '').trim() : null;
}

/* La lista final «Respuestas: 1-C, 2-A, 3-B», que es como una máquina
   cierra una tanda larga. Devuelve {1:'C', 2:'A'}. */
function vozActListaRespuestas(v) {
  const pares = {};
  const re = /(\d{1,3})\s*[-–—.:)]\s*([A-Ha-h1-8])\b/g;
  let m, n = 0;
  while ((m = re.exec(v))) { pares[Number(m[1])] = m[2].toUpperCase(); n++; }
  return n >= 2 ? pares : null;
}

function vozActIndiceLetra(s) {
  const t = String(s || '').trim().replace(/[).\]]/g, '');
  if (/^[A-Ha-h]$/.test(t)) return t.toUpperCase().charCodeAt(0) - 65;
  if (/^[1-8]$/.test(t)) return Number(t) - 1;
  return -1;
}

/* Un par: «a :: b», «a → b», «a — b», «a | b». ⚠️ La raya larga va la
   ÚLTIMA y solo si no hay otro separador, porque una frase normal la
   lleva dentro («—dijo Remedios—») y partiría la frase en dos. */
function vozActPar(l) {
  const s = vozActSinVineta(l);
  if (!s) return null;
  const seps = [/\s*::\s*/, /\s*(?:→|->|=>|⇒)\s*/, /\s+\|\s+/, /\s*\t+\s*/, /\s+[–—]\s+/];
  for (const re of seps) {
    const p = s.split(re);
    if (p.length === 2 && p[0].trim() && p[1].trim()) {
      return { a: p[0].trim().replace(/^\*\*|\*\*$/g, '').trim(), b: p[1].trim() };
    }
  }
  return null;
}

/* ⚠️ EL HUECO SE ESCRIBE DE MUCHAS MANERAS y todas valen: «___»,
   «____», «…», «[  ]», «( )». Se normalizan a UN hueco, porque lo que
   la pantalla enseña y lo que se compara tiene que ser lo mismo. */
const VOZ_ACT_HUECO = /_{2,}|\[\s*\]|\(\s*\)|\.{4,}|…{2,}/;
function vozActNormalizaHueco(s) {
  return s.replace(/_{2,}|\[\s*\]|\(\s*\)|\.{4,}|…{2,}/g, '___');
}

function vozActLeer(texto) {
  const lineas = String(texto || '').replace(/\r/g, '').split('\n');
  const items = [];
  const avisos = [];
  let modo = '';
  let actual = null;
  /* ⚠️ CADA LISTA FINAL DE RESPUESTAS CUBRE SU TRAMO, NO TODA LA TANDA.
     Era un solo mapa por NÚMERO, fundido con `Object.assign` cada vez que
     aparecía una lista. Con dos secciones —que es lo normal: unas de
     comprensión y otras de selección— las dos vuelven a numerar desde 1,
     así que la segunda lista pisaba a la primera y la primera sección
     quedaba marcada con las respuestas de la segunda: un examen con la
     correcta cambiada, guardado sin un solo aviso y sin parar el guardado.
     Es el peor resultado que puede salir de aquí, y el que no descubre
     nadie hasta que alguien acierta y la pantalla le dice que falló.
     Ahora cada lista se apunta con el tramo de preguntas al que sigue. */
  const listas = [];
  let desdeLista = 0;

  const cerrar = () => {
    if (!actual) return;
    const it = actual;
    actual = null;
    if (it.k === 'opcion') {
      if (it.o.length < 2) {
        /* Una pregunta sin opciones no es de selección: casi siempre
           es una abierta que vino en la sección equivocada. Se guarda
           como abierta en vez de tirarla — nunca se descarta nada. */
        items.push({ id: vozActId(), k: 'abierta', q: it.q, guia: it.guia || '' });
        return;
      }
      /* ⚠️ Y LA LETRA SEÑALADA TIENE QUE EXISTIR. «Respuesta: D» con tres
         opciones se guardaba tal cual, con `ok = 3` sobre una lista de
         tres: una pregunta que NADIE puede acertar, porque la buena no
         está entre las que se enseñan. Pasa de verdad —una máquina escribe
         cuatro opciones, se le cae una al copiar, y la clave sigue
         diciendo D—, y no da ningún error: se descubre en la pantalla de
         quien la contesta. Se deja SIN marcar, que es lo que hace que el
         guardado se pare y la nombre, en vez de adivinar cuál quiso decir. */
      const ops = it.o.slice(0, 6);
      let ok = it.ok;
      if (ok >= ops.length) {
        avisos.push({ n: it.okN || 0, t: 'La respuesta señalada («' + String(it.okTxt || '').slice(0, 20) +
          '») no existe: esta pregunta solo tiene ' + ops.length + ' opciones' });
        ok = -1;
      }
      items.push({ id: vozActId(), k: 'opcion', q: it.q, o: ops, ok: ok, n: it.n });
      return;
    }
    if (it.k === 'completar') {
      items.push({ id: vozActId(), k: 'completar', q: vozActNormalizaHueco(it.q), a: (it.a || '').trim(), n: it.n });
      return;
    }
    if (it.k === 'abierta') { items.push({ id: vozActId(), k: 'abierta', q: it.q, guia: (it.guia || '').trim() }); return; }
    if (it.k === 'pares') {
      if (it.ps.length >= 2) items.push({ id: vozActId(), k: 'pares', q: it.q || 'Empareja cada una con la suya', ps: it.ps.slice(0, 8) });
      else if (it.ps.length === 1) items.push({ id: vozActId(), k: 'flash', f: it.ps[0][0], r: it.ps[0][1] });
      return;
    }
  };

  lineas.forEach((cruda, i) => {
    const l = cruda.trim();
    const renglon = i + 1;
    if (!l) return;
    /* Las rayas de separación no dicen nada y no abren nada. */
    if (/^([-–—=_*]\s*){3,}$/.test(l)) return;

    /* 1. Las cabeceras, antes que nada: cambian de modo y cierran lo
          que estuviera a medias. */
    const cab = vozActEsCabecera(l);
    if (cab) { cerrar(); modo = cab; return; }
    /* Una cabecera que no nombra ningún tipo tampoco es contenido: es
       un título de sección («## Actividades»). Cierra y se salta. */
    if (/^#{1,6}\s/.test(l)) { cerrar(); return; }

    /* 2. La lista final de respuestas, antes que la línea suelta de
          respuesta: «Respuestas: 1-C, 2-A» tiene las dos formas. */
    const resp = vozActLineaRespuesta(l);
    if (resp) {
      const lista = vozActListaRespuestas(resp);
      if (lista) {
        /* Se cierra antes de apuntar el tramo: la lista va SIEMPRE al pie
           de su sección, así que la última pregunta de esa sección tiene
           que estar ya en `items` o el tramo la dejaría fuera. */
        cerrar();
        listas.push({ pares: lista, desde: desdeLista, hasta: items.length });
        desdeLista = items.length;
        return;
      }
      if (actual && actual.k === 'opcion') {
        const k = vozActIndiceLetra(resp);
        if (k >= 0) { actual.ok = k; actual.okN = renglon; actual.okTxt = resp; }
        else {
          /* «Respuesta: porque se secó el pozo» — no es una letra: se
             busca la opción que diga eso. */
          const n = vozSinTildes(resp).toLowerCase();
          const j = actual.o.findIndex(o => vozSinTildes(o).toLowerCase() === n);
          if (j >= 0) actual.ok = j;
          else avisos.push({ n: renglon, t: 'La respuesta «' + resp.slice(0, 40) + '» no coincide con ninguna opción' });
        }
        return;
      }
      if (actual && actual.k === 'completar') { actual.a = resp; return; }
      if (actual && actual.k === 'abierta') { actual.guia = resp; return; }
      return;
    }

    /* 3. La pauta de una abierta. */
    const mPauta = vozActPelaAdornos(l).match(/^(?:pauta|gu[ií]a|orientaci[oó]n|se espera|criterio)\s*[:.\-–—]\s*(\S.*)$/i);
    if (mPauta) {
      if (actual && actual.k === 'abierta') actual.guia = ((actual.guia ? actual.guia + ' ' : '') + mPauta[1]).trim();
      else if (actual && actual.k === 'opcion' && !actual.o.length) { actual.k = 'abierta'; actual.guia = mPauta[1]; }
      return;
    }

    /* 4. Una opción, solo si hay una pregunta abierta esperándolas.
          Sin esa condición, «a) pan b) leche» de una lista cualquiera
          entraría como examen. */
    const op = vozActOpcion(l);
    if (op && actual && actual.k === 'opcion') {
      const m = vozActMarcaCorrecta(op.t);
      if (m.ok && actual.ok < 0) actual.ok = actual.o.length;
      actual.o.push(m.t);
      return;
    }

    /* 5. Un par o una tarjeta: dos mitades separadas. */
    const par = vozActPar(l);
    if (par && modo !== 'opcion' && modo !== 'completar' && modo !== 'abierta' && !VOZ_ACT_HUECO.test(l)) {
      if (modo === 'pares') {
        if (!actual || actual.k !== 'pares') { cerrar(); actual = { k: 'pares', q: '', ps: [] }; }
        actual.ps.push([par.a, par.b]);
      } else {
        cerrar();
        items.push({ id: vozActId(), k: 'flash', f: par.a, r: par.b });
      }
      return;
    }

    /* 6. Lo que abre una pregunta: una línea numerada, o una que
          pregunta, o una que trae un hueco. */
    const pelada = vozActSinVineta(l).replace(/^\*\*|\*\*$/g, '').trim();
    const numerada = /^\s*\d{1,3}\s*[.)\]-]\s/.test(l) || /^\s*[-*•·]\s/.test(l);
    const nOrden = (l.match(/^\s*(\d{1,3})\s*[.)\]-]\s/) || [])[1];
    const pregunta = /[?¿]/.test(pelada);
    const hueco = VOZ_ACT_HUECO.test(pelada);

    if (hueco && (numerada || pregunta || modo === 'completar' || modo === '')) {
      cerrar();
      actual = { k: 'completar', q: pelada, a: '', n: nOrden ? Number(nOrden) : 0 };
      /* «El pozo se secó en ___ . (1910)» — el paréntesis del final es
         la respuesta, que es como se escribe cuando no se quiere poner
         un renglón aparte. */
      const m = pelada.match(/^(.*___[^()]*?)\s*[(\[]([^()\[\]]{1,60})[)\]]\s*$/);
      if (m) { actual.q = vozActNormalizaHueco(m[1].trim()); actual.a = m[2].trim(); }
      return;
    }

    if (numerada || pregunta) {
      if (modo === 'abierta') { cerrar(); actual = { k: 'abierta', q: pelada, guia: '' }; return; }
      if (modo === 'flash' || modo === 'pares') {
        /* En una sección de tarjetas, una línea suelta que no es un par
           es la CARA de una tarjeta cuya cruz viene en la línea de
           abajo: se deja abierta y la siguiente la cierra. */
        cerrar();
        actual = { k: 'flash2', f: pelada, r: '' };
        return;
      }
      cerrar();
      actual = { k: 'opcion', q: pelada, o: [], ok: -1, n: nOrden ? Number(nOrden) : 0 };
      return;
    }

    /* 7. La cruz de una tarjeta abierta en la línea anterior. */
    if (actual && actual.k === 'flash2') {
      const r = pelada.replace(/^(?:reverso|respuesta|cruz|atr[aá]s)\s*[:.\-–—]\s*/i, '').trim();
      items.push({ id: vozActId(), k: 'flash', f: actual.f, r: r });
      actual = null;
      return;
    }

    /* 8. Una línea que continúa el enunciado de lo que esté abierto.
          Nunca se descarta: se pega a lo anterior. */
    if (actual && (actual.k === 'opcion' || actual.k === 'abierta') && !(actual.o && actual.o.length)) {
      actual.q = (actual.q + ' ' + pelada).trim();
      return;
    }
    if (actual && actual.k === 'completar') { actual.q = vozActNormalizaHueco((actual.q + ' ' + pelada).trim()); return; }

    /* 9. Y lo que no se entendió se NOMBRA, con su renglón, pero solo
          si INTENTABA ser algo: una frase de prosa suelta entre dos
          secciones es una explicación, no un fallo, y marcarla sería
          ruido —la lección de las etiquetas de El Rodaje—. */
    if (modo && pelada.length > 3 && (op || /^[-*•·]/.test(l))) {
      avisos.push({ n: renglon, t: '«' + pelada.slice(0, 48) + '» no se entendió como ' + vozActTipo(modo === 'flash' ? 'flash' : modo).t.toLowerCase() });
    }
  });
  cerrar();

  /* La lista final de respuestas se aplica AL TERMINAR, cuando ya
     están todas las preguntas numeradas: es lo que permite escribirla
     al pie, que es donde la escribe una máquina. */
  listas.forEach(L => {
    const tramo = items.slice(L.desde, L.hasta);
    /* ⚠️ Y DENTRO DE UN TRAMO, UN NÚMERO REPETIDO NO SE RESUELVE: SE DEJA
       SIN MARCAR. Pasa cuando una máquina pone UNA sola lista al final de
       una tanda con varias secciones renumeradas desde 1; ahí el «1-C» no
       dice a cuál de las dos preguntas 1 se refiere, y elegir una acierta
       la mitad de las veces y falla en silencio. Sin marcar, la pregunta
       sale en ámbar, el guardado se para y lo dice: es la regla que no se
       negocia, la misma de los quiz de Videos M.E.T.A.S. */
    const veces = {};
    tramo.forEach(it => { if (it.k === 'opcion' && it.n) veces[it.n] = (veces[it.n] || 0) + 1; });
    tramo.forEach(it => {
      if (it.k !== 'opcion' || it.ok >= 0 || !it.n) return;
      const v = L.pares[it.n];
      if (v == null) return;
      if (veces[it.n] > 1) {
        avisos.push({ n: 0, t: 'Hay ' + veces[it.n] + ' preguntas con el número ' + it.n +
          ' y una sola lista de respuestas: no se marca ninguna, porque «' + it.n + '-' + v +
          '» no dice a cuál de ellas se refiere' });
        return;
      }
      const k = vozActIndiceLetra(v);
      if (k >= 0 && k < it.o.length) it.ok = k;
    });
  });

  /* Las que se quedaron sin correcta, nombradas una por una: un «hay
     preguntas sin respuesta» a secas obliga a repasar cuarenta desde
     una tableta. */
  const sinCorrecta = items.filter(it => it.k === 'opcion' && it.ok < 0);
  const sinRespuesta = items.filter(it => it.k === 'completar' && !it.a);

  const cuenta = {};
  VOZ_ACT_TIPOS.forEach(t => { cuenta[t.id] = items.filter(i => i.k === t.id).length; });
  return { items: items, avisos: avisos, cuenta: cuenta, sinCorrecta: sinCorrecta, sinRespuesta: sinRespuesta };
}

/* ─── Las actividades que salen de los subrayados ─────────────────
   ⚠️ LA RESPUESTA SALE DEL TEXTO, NUNCA SE INVENTA. Es la única
   generación automática que esta casa se permite, y se permite por un
   motivo que se puede escribir: lo que devuelve no es una pregunta
   pensada por una máquina, es EL TROZO QUE LA PERSONA MARCÓ, tapado
   dentro de su propia frase. La «respuesta correcta» es literalmente
   lo que dice el texto, así que no hay nada que adivinar ni nada que
   pueda salir cambiado.

   Es también lo que cierra el círculo de la regla 21: se lee, se
   subraya lo que importa, y eso mismo —sin escribir nada más— es la
   lista de lo que hay que recordar. Un subrayado que no se vuelve a
   mirar es un rotulador gastado.

   Qué sale de cada marca:
   · con NOTA escrita → una TARJETA: delante lo que uno se preguntó,
     detrás el trozo. La nota es la pregunta que la persona ya se hizo
     leyendo, y es mejor pregunta que cualquiera generada.
   · trozo CORTO (hasta doce palabras) → un COMPLETAR: su propia frase
     con el trozo tapado. Es lo que de verdad fija una fecha o un
     nombre, que es lo que el autor pidió recordar.
   · trozo LARGO → una TARJETA: delante la frase con el hueco, detrás
     el trozo entero. Se recuerda y se voltea; escribir treinta
     palabras en una tableta no lo hace nadie dos veces. */

const VOZ_ACT_PAL_CORTO = 12;

/* La frase que contiene el trozo [i, f) dentro de un párrafo. Se corta
   por el punto, el signo de cierre o la raya de diálogo, que es donde
   corta una frase en español. Si la frase sale enorme (un párrafo sin
   puntos), se recorta por palabras alrededor del trozo: un hueco
   perdido en trescientas palabras no se puede contestar. */
function vozActFrase(plano, i, f) {
  const antes = plano.slice(0, i);
  const despues = plano.slice(f);
  let ini = 0;
  const mIni = antes.match(/[.!?…»]\s+(?=[^.!?…»]*$)/);
  if (mIni) ini = antes.length - (antes.length - (mIni.index + mIni[0].length));
  let fin = plano.length;
  const mFin = despues.match(/[.!?…]["»']?\s/);
  if (mFin) fin = f + mFin.index + mFin[0].replace(/\s+$/, '').length;
  let frase = plano.slice(ini, fin).trim();
  let di = i - ini, df = f - ini;
  /* Demasiado larga: se recortan las palabras de los extremos y se
     dice con una elipsis que ahí había más. */
  const pal = frase.split(/\s+/);
  if (pal.length > 45) {
    const antesT = frase.slice(0, di).split(/\s+/);
    const quita = antesT.slice(0, Math.max(0, antesT.length - 14)).join(' ');
    if (quita.length) { frase = '… ' + frase.slice(quita.length).trim(); const d = quita.length - 2; di -= d; df -= d; }
    const trasT = frase.slice(df).split(/\s+/);
    if (trasT.length > 16) frase = frase.slice(0, df) + ' ' + trasT.slice(0, 15).join(' ') + ' …';
  }
  return { frase: frase, i: Math.max(0, di), f: Math.max(0, df) };
}

/* El texto plano de un bloque, con las mismas reglas con que se cuenta
   el desplazamiento de una marca: sin los asteriscos de la cursiva y
   sin la viñeta de una lista. Tiene que dar EXACTAMENTE lo mismo que
   vozCuerpoDe(el).textContent, o los índices de la marca apuntarían a
   otro sitio. */
/* ⚠️ EL TEXTO DE UN BLOQUE SE PIDE POR LA MISMA PUERTA QUE LO PIDE EL
   RESTO DE LA HERRAMIENTA (`vozTextoDeBloque`), no por una copia. Aquí
   había un `b.t` a pelo, y una TABLA no tiene `t`: tiene celdas. O sea que
   un subrayado hecho dentro de una tabla —que es justo donde están las
   fechas y las cifras que el taller existe para recordar— se guardaba, no
   generaba nada, y la pantalla decía «no hay subrayados de los que sacar
   actividades». Es el mismo motivo por el que `vozPalabras` ya la usa: una
   copia se queda vieja el día que el texto aprenda una clase nueva de
   bloque, y el único aviso será que algo dejó de salir.

   Los asteriscos se quitan DESPUÉS, y eso sí es de aquí: los caracteres de
   una marca se cuentan sobre lo que se LEE, y en la pantalla la negrita es
   un `<strong>`, no dos asteriscos. */
function vozActPlanoDeBloque(b) {
  if (!b) return '';
  return String(vozTextoDeBloque(b) || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
}

function vozActGenerar(cid) {
  const c = _vozCuentos.find(x => x.cid === cid);
  if (!c) return [];
  const marcas = vozSubDe(cid).slice().sort((a, b) => a.cap - b.cap || a.vp - b.vp || a.i - b.i);
  const fuera = [];
  marcas.forEach(m => {
    const cap = (c.capitulos || [])[m.cap];
    const b = ((cap && cap.p) || [])[m.vp];
    const plano = vozActPlanoDeBloque(b);
    if (!plano) return;
    let i = m.i, f = m.f;
    /* El texto pudo corregirse después de marcar: se reancla igual que
       al pintar (regla 21), y solo si el trozo aparece UNA vez. */
    if (plano.slice(i, f) !== m.t) {
      const k = plano.indexOf(m.t);
      if (k < 0 || plano.indexOf(m.t, k + 1) >= 0) return;
      i = k; f = k + m.t.length;
    }
    const trozo = plano.slice(i, f).trim();
    if (trozo.length < 2) return;
    const cat = vozCat(m.c);
    const donde = vozNombreCap(c, m.cap);
    const base = { auto: 1, via: 'sub', sub: m.id, cat: m.c, cap: m.cap, vp: m.vp, donde: donde };

    if (m.n) {
      fuera.push(Object.assign({ id: 'auto-n-' + m.id, k: 'flash', f: m.n, r: trozo }, base));
      return;
    }
    const r = vozActFrase(plano, i, f);
    const conHueco = (r.frase.slice(0, r.i) + '___' + r.frase.slice(r.f)).replace(/\s{2,}/g, ' ').trim();
    if (trozo.split(/\s+/).length <= VOZ_ACT_PAL_CORTO) {
      fuera.push(Object.assign({ id: 'auto-c-' + m.id, k: 'completar', q: conHueco, a: trozo }, base));
    } else {
      fuera.push(Object.assign({ id: 'auto-f-' + m.id, k: 'flash',
        f: cat.ini + ' · ¿Cómo lo dice el texto?\n' + conHueco, r: trozo }, base));
    }
  });
  return fuera;
}

/* Las generadas se REEMPLAZAN enteras cada vez, y las pegadas no se
   tocan: son dos cosechas distintas y mezclarlas haría imposible
   volver a generar sin perder lo escrito a mano. Se distinguen por
   `auto`, no por el sitio de la lista. */
function vozActRefrescarAuto(cid, via) {
  via = via || 'sub';
  const ficha = vozActDe(cid);
  /* «aMano» son TODAS las que no son de esta vía: las pegadas y las de
     las otras dos vías. Ver la nota de las procedencias más abajo. */
  const aMano = (ficha.items || []).filter(it => vozActVia(it) !== via);
  const auto = via === 'txt' ? vozActGenerarDelTexto(cid) : (via === 'sub' ? vozActGenerar(cid) : []);
  return { aMano: aMano, auto: auto };
}

function vozActGuardarFicha(cid, items, callado) {
  const todo = vozActLeeTodo();
  const viejo = todo[cid];
  todo[cid] = {
    cid: cid,
    items: items,
    borrado: false,
    actualizado: Date.now(),
    creado_at: (viejo && viejo.creado_at) || new Date().toISOString(),
    puesto_por: (viejo && viejo.puesto_por) || _vozYo || null,
  };
  vozActGuardaTodo();
  vozActPedirNube(cid);
  if (!callado) vozRender();
  return todo[cid];
}

/* ─── La nube ─────────────────────────────────────────────────────
   Las actividades son DE LA CASA, como el texto y por lo mismo: un
   cuestionario que solo pudiera ver quien lo pegó convierte «hazle las
   preguntas a tu hermana» en «pásame tu sesión». Lo que NO viaja es el
   avance —qué acertó cada quien—: eso es del aparato, como la posición
   de lectura, y por la misma razón de la regla 12 (aquí el mismo texto
   lo leen cuatro personas).

   Y si nadie ha corrido el SQL, el taller funciona ENTERO con la copia
   del aparato y lo dice a la vista, que es lo contrario de fingir que
   viaja. */
/* ⚠️ EN LA BASE LA LÁPIDA SE LLAMA `borrada`, EN FEMENINO, Y AQUÍ DENTRO
   `borrado`. No es un descuido de nadie: la tabla es `voz_actividades` y su
   archivo SQL escribió la columna concordando con ella, mientras que
   `voz_prestada` —masculino— la tiene en `borrado`, y el taller se escribió
   copiando las funciones de los textos. Las dos mitades estaban bien; la
   costura entre ellas era una letra.

   Lo que pasaba, y por qué costó verlo: PostgREST rebota la consulta ENTERA
   por una columna que no existe (42703), así que el taller no subía NUNCA. Y
   ese código no es 42P01, así que caía en la rama de «sin señal»: la barra
   decía «📡 Sin señal» con la señal perfecta y el SQL recién corrido, o sea
   que mandaba a mirar el wifi. Es la regla 13 otra vez —la prueba del SQL
   escribía `borrada` a mano y aprobaba; la base de mentira de la sonda
   aceptaba cualquier columna y también— y por eso la sonda ahora saca la
   lista de columnas DEL PROPIO ARCHIVO SQL.

   El nombre de la costura vive en esta constante y se usa en los TRES
   sitios que lo tocan —la lista que se pide, la fila que se lee y la que se
   escribe—: con el nombre escrito a mano tres veces, arreglar dos y olvidar
   el tercero deja la mitad rota, que es exactamente esta avería. */
const VOZ_ACT_COL_LAPIDA = 'borrada';
const VOZ_ACT_COLUMNAS = 'cid,items,' + VOZ_ACT_COL_LAPIDA + ',puesto_por,creado_at,actualizado';

function vozActPedirNube(cid) {
  clearTimeout(_vozActTimer);
  if (_vozActNube === 'al-dia') _vozActNube = 'pendiente';
  vozActPintarEstado();
  _vozActTimer = setTimeout(() => vozActSincronizar(cid), 1200);
}

async function vozActSincronizar(cid) {
  if (_vozActSincronizando) { _vozActOtraVuelta = cid; return; }
  const sb = vozSb();
  if (!sb) { _vozActNube = 'sin-sesion'; vozActPintarEstado(); return; }
  const yo = await vozYo();
  if (!yo) { _vozActNube = 'sin-sesion'; vozActPintarEstado(); return; }
  _vozActSincronizando = true;
  _vozActNube = 'subiendo'; vozActPintarEstado();
  try {
    const { data, error } = await vozConReloj(sb.from(VOZ_ACT_TABLA).select(VOZ_ACT_COLUMNAS));
    if (error) {
      /* ⚠️ TRES CAUSAS DISTINTAS Y TRES ARREGLOS DISTINTOS, y decir una por
         otra manda a mirar donde no está el problema (regla 14). 42P01 es
         «la tabla no está»: hay que correr el SQL. 42703 es «la tabla está
         pero le falta una columna»: hay que VOLVER a correrlo, y decir «sin
         señal» ahí manda a mirar el wifi con la señal perfecta, que es lo
         que pasaba con la lápida. Lo demás sí es la señal. */
      if (error.code === '42P01' || /relation .* does not exist/i.test(error.message || '')) _vozActNube = 'sin-tabla';
      else if (vozFaltaColumna(error)) _vozActNube = 'base-vieja';
      else _vozActNube = 'sin-senal';
      vozActPintarEstado();
      return;
    }
    /* Baja lo de la nube y se queda con lo más nuevo por el reloj del
       aparato, igual que los textos. Lo de aquí NO se tira: si la
       nube no trae una ficha, es que falta subirla. */
    const todo = vozActLeeTodo();
    let cambio = false;
    (data || []).forEach(fila => {
      const mio = todo[fila.cid];
      if (!mio || (fila.actualizado || 0) > (mio.actualizado || 0)) {
        todo[fila.cid] = {
          cid: fila.cid, items: Array.isArray(fila.items) ? fila.items : [],
          borrado: !!fila[VOZ_ACT_COL_LAPIDA], actualizado: fila.actualizado || 0,
          creado_at: fila.creado_at, puesto_por: fila.puesto_por,
        };
        cambio = true;
      }
    });
    const enNube = new Map((data || []).map(f => [f.cid, f.actualizado || 0]));
    const subir = Object.values(todo).filter(f =>
      f && f.cid && (!f.puesto_por || f.puesto_por === yo) &&
      (!enNube.has(f.cid) || enNube.get(f.cid) < (f.actualizado || 0)));
    for (const f of subir) {
      const { error: e2 } = await vozConReloj(sb.from(VOZ_ACT_TABLA).upsert({
        cid: f.cid, items: f.items || [], [VOZ_ACT_COL_LAPIDA]: !!f.borrado,
        actualizado: f.actualizado || Date.now(), puesto_por: yo,
      }, { onConflict: 'cid' }));
      if (e2) {
        _vozActNube = (e2.code === 'FARO_RELOJ') ? 'sin-senal'
          : vozFaltaColumna(e2) ? 'base-vieja'
          : (e2.code === '42501' || e2.code === '23502') ? 'ajeno' : 'error';
        vozActGuardaTodo(); vozActPintarEstado();
        return;
      }
      f.puesto_por = yo;
      cambio = true;
    }
    vozActGuardaTodo();
    _vozActNube = 'al-dia';
    if (cambio) { vozRender(); vozActPintarTaller(); }
  } catch (e) {
    _vozActNube = 'error';
  } finally {
    _vozActSincronizando = false;
    /* Y si mientras subía se guardó algo, otra vuelta. Va por
       vozActPedirNube, o sea con su espera de 1200 ms y su rótulo de
       «guardando», que es el camino de siempre: un segundo camino a la
       nube se queda viejo el día que se toque el primero. No se enrosca,
       porque cuando el reloj dispare esta subida ya habrá terminado. */
    if (_vozActOtraVuelta !== null) {
      const otro = _vozActOtraVuelta;
      _vozActOtraVuelta = null;
      vozActPedirNube(otro);
    } else {
      vozActPintarEstado();
    }
  }
}

function vozActRotuloNube() {
  if (_vozActNube === 'al-dia')    return '☁️ Las actividades están en todos los aparatos de la casa.';
  if (_vozActNube === 'subiendo' || _vozActNube === 'pendiente') return '⏳ Guardando en la nube…';
  if (_vozActNube === 'sin-tabla') return '📴 Solo en este aparato: falta correr voz_actividades.sql';
  if (_vozActNube === 'base-vieja') return '📴 Solo en este aparato: la base va vieja, vuelve a correr voz_actividades.sql';
  if (_vozActNube === 'sin-sesion') return '📴 Solo en este aparato: entra en F.A.R.O para que viajen';
  if (_vozActNube === 'sin-senal') return '📡 Sin señal: se guardan aquí y suben cuando vuelva';
  if (_vozActNube === 'ajeno')     return '✋ Las puso otra persona de la casa: puedes hacerlas, no cambiarlas';
  if (_vozActNube === 'error')     return '⚠️ La nube rechazó las actividades; se quedan en este aparato';
  return '📴 Solo en este aparato por ahora';
}

function vozActPintarEstado() {
  const e = document.getElementById('voz-act-estado');
  if (e) e.textContent = vozActRotuloNube();
}

/* ─── El avance: de cada quien y de este aparato ──────────────────
   Con repaso espaciado, el mismo del taller de la memoria: lo que sale
   bien se vuelve a preguntar a los 3 días, a las 2 semanas y al mes;
   lo que sale mal, mañana. Un repaso que pregunta todo cada vez es un
   repaso que nadie hace dos veces. */
const VOZ_ACT_ESCALA = [1, 3, 14, 30];

function vozActAvanceTodo() {
  try { return JSON.parse(localStorage.getItem(VOZ_ACT_AVANCE) || '{}') || {}; } catch (e) { return {}; }
}
function vozActAvanceDe(cid) {
  return vozActAvanceTodo()[cid] || {};
}
function vozActApuntar(cid, id, acerto) {
  const todo = vozActAvanceTodo();
  const mio = todo[cid] || (todo[cid] = {});
  const a = mio[id] || (mio[id] = { ok: 0, mal: 0, n: 0 });
  if (acerto) { a.ok++; a.n = Math.min(VOZ_ACT_ESCALA.length - 1, (a.n || 0) + 1); }
  else { a.mal++; a.n = 0; }
  a.visto = Date.now();
  a.prox = Date.now() + VOZ_ACT_ESCALA[a.n] * 86400000;
  try { localStorage.setItem(VOZ_ACT_AVANCE, JSON.stringify(todo)); } catch (e) {}
}
function vozActToca(cid, id) {
  const a = vozActAvanceDe(cid)[id];
  return !a || !a.prox || a.prox <= Date.now();
}
function vozActResumen(cid) {
  const items = vozActDe(cid).items || [];
  const av = vozActAvanceDe(cid);
  let vistas = 0, firmes = 0, tocan = 0;
  items.forEach(it => {
    const a = av[it.id];
    if (a && a.visto) vistas++;
    if (a && (a.n || 0) >= 2) firmes++;
    if (vozActToca(cid, it.id)) tocan++;
  });
  return { total: items.length, vistas: vistas, firmes: firmes, tocan: tocan };
}

/* ─── El taller: una actividad a la vez, y mezcladas ──────────────
   ⚠️ MEZCLADAS A PROPÓSITO, no agrupadas por tipo. Es la práctica
   intercalada del taller de la memoria (js/taller-neuro.js): diez
   tarjetas seguidas se contestan con la mano, en piloto automático,
   porque el cerebro ya sabe QUÉ va a tener que hacer; mezcladas, cada
   una obliga a decidir antes de responder. Cuesta más y se queda más.

   Y una a la vez, no todas en una lista: en un teléfono una lista de
   cuarenta actividades es un barrido de varios metros donde nadie
   sabe por dónde iba. */

let _vozActSesion = null;   // {cid, cola, i, bien, mal, revisar}
let _vozActTexto = null;    // el texto cuyo taller está abierto
let _vozActVolver = null;   // a dónde se vuelve al cerrar: 'sala' o null

function vozActBaraja(l) {
  const a = l.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* Comparar lo escrito con lo esperado: sin tildes, sin mayúsculas, sin
   los signos de puntuación de los extremos y sin los artículos de
   delante. Quien escribe «el pozo» habiendo marcado «pozo» sabe la
   respuesta, y decirle que no la sabe es enseñarle a odiar el taller. */
function vozActNormal(s) {
  return vozSinTildes(String(s || ''))
    .toLowerCase()
    .replace(/[«»"'`´¨.,;:!¡?¿()\[\]{}…—–-]/g, ' ')
    .replace(/^\s*(?:el|la|los|las|un|una|unos|unas|de|del)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Distancia de edición, con tope: solo hace falta saber si son «casi»
   iguales, y una tabla de 300×300 para decir «no» es tiempo tirado. */
function vozActDistancia(a, b, tope) {
  if (Math.abs(a.length - b.length) > tope) return tope + 1;
  let prev = [], fila = [];
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    fila = [i];
    let mejor = i;
    for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      fila[j] = Math.min(prev[j] + 1, fila[j - 1] + 1, prev[j - 1] + c);
      if (fila[j] < mejor) mejor = fila[j];
    }
    if (mejor > tope) return tope + 1;
    prev = fila;
  }
  return prev[b.length];
}

/* Tres respuestas, no dos: bien, CASI y mal. «Casi» es una falta de
   ortografía o una letra cambiada, y tratarla como un fallo es
   castigar por escribir deprisa en una tableta lo que sí se sabía. */
function vozActComparar(dado, esperado) {
  const a = vozActNormal(dado), b = vozActNormal(esperado);
  if (!a) return 'vacio';
  if (a === b) return 'bien';
  const tope = b.length <= 5 ? 1 : (b.length <= 12 ? 2 : 3);
  if (vozActDistancia(a, b, tope) <= tope) return 'casi';
  /* Y si lo escrito contiene la respuesta entera (o al revés) con algo
     de más, también vale: «en 1910» por «1910». */
  if (b.length >= 4 && (a.indexOf(b) >= 0 || b.indexOf(a) >= 0)) return 'casi';
  return 'mal';
}

function vozActAbrirTaller(cid, desde) {
  const c = _vozCuentos.find(x => x.cid === cid);
  if (!c) return;
  _vozActTexto = cid;
  _vozActVolver = desde || null;
  _vozActSesion = null;
  const ov = document.getElementById('voz-act-overlay');
  if (!ov) return;
  /* Se tiñe con el papel que tenga puesto la lectura: abrir el taller
     de noche con una pantalla blanca es el deslumbre de la regla 9. */
  ov.dataset.tema = _vozAj.tema || 'papel';
  ov.hidden = false;
  document.body.classList.add('voz-sala');
  /* Detrás de la sincronización, nunca delante: ver vozActMontarSiVacio. */
  Promise.resolve(vozActSincronizar(cid)).then(() => vozActMontarSiVacio(cid));
  vozActPintarTaller();
}

function vozActCerrarTaller() {
  const ov = document.getElementById('voz-act-overlay');
  if (ov) ov.hidden = true;
  _vozActSesion = null;
  const sala = document.getElementById('voz-lector');
  if (!sala || sala.hidden) document.body.classList.remove('voz-sala');
  _vozActTexto = null;
  vozRender();
}

/* ─── La portada del taller ─── */
function vozActPintarTaller() {
  const ov = document.getElementById('voz-act-overlay');
  const cuerpo = document.getElementById('voz-act-cuerpo');
  if (!ov || ov.hidden || !cuerpo) return;
  const cid = _vozActTexto;
  const c = _vozCuentos.find(x => x.cid === cid);
  if (!c) return;
  const tit = document.getElementById('voz-act-tit');
  if (tit) {
    tit.textContent = '';
    tit.appendChild(vozNodo('span', 'voz-act-tit-t', '📝 Taller de ' + (c.titulo || 'el texto')));
    /* La etiqueta también aquí: es la regla 1, y un cuestionario que
       se comparte sin ella atribuye el texto igual que el texto. */
    tit.appendChild(vozNodo('span', 'voz-act-tit-v', '🎭 al modo de ' + (c.voz || '—') + ' · 🤖 ' + (c.maquina || '—')));
  }
  cuerpo.textContent = '';
  if (_vozActSesion) { vozActPintarSesion(cuerpo); return; }

  const items = vozActDe(cid).items || [];
  const res = vozActResumen(cid);
  const mio = vozActEsMio(cid);

  if (!items.length) {
    const v = vozNodo('div', 'voz-act-vacio');
    v.appendChild(vozNodo('div', 'voz-act-vacio-ic', '📝'));
    v.appendChild(vozNodo('p', 'voz-act-vacio-t', 'Todavía no hay actividades para este texto.'));
    v.appendChild(vozNodo('p', 'voz-act-vacio-p',
      'Sirven para lo único que una lectura de corrido no hace: comprobar que lo leído se quedó. '
      + 'Normalmente se montan solas al guardar el texto; aquí están las maneras de ponerlas a mano.'));
    const puertas = vozNodo('div', 'voz-act-puertas');
    /* Las que GENERAN van primero, que es lo que el autor pidió: no tener
       que pedirlas en otra ventana y pegarlas. La de pegar se queda, la
       última, para quien ya las tenga escritas. */
    puertas.appendChild(vozActPuerta('📖', 'Sacarlas del texto',
      'Al instante y sin señal: fechas, cifras, nombres, términos, la idea de cada capítulo y la bibliografía, tapados en sus propias frases. Todas las respuestas están en el texto, letra por letra.',
      () => vozActGenerarTextoYGuardar(cid)));
    const nSub = vozSubDe(cid).length;
    puertas.appendChild(vozActPuerta('🖍', 'Sacarlas de mis subrayados',
      nSub ? ('Tienes ' + nSub + (nSub === 1 ? ' subrayado' : ' subrayados') + ' en este texto. Cada uno se convierte en una pregunta cuya respuesta es el trozo que marcaste.')
           : 'Subraya mientras lees y cada marca se convertirá en una pregunta. Ahora mismo no hay ninguna.',
      nSub ? () => vozActGenerarYGuardar(cid) : null));
    puertas.appendChild(vozActPuerta('📋', 'Pegar las actividades',
      'Si ya las tienes escritas en otra ventana, pégalas aquí. Entiende tarjetas, emparejar, selección, completar y abiertas.',
      () => vozActAbrirPegar(cid)));
    v.appendChild(puertas);
    cuerpo.appendChild(v);
      cuerpo.appendChild(vozNodo('p', 'voz-aj-nota voz-act-estado', vozActRotuloNube())).id = 'voz-act-estado';
    return;
  }

  /* El resumen de arriba: cuántas hay, cuántas se saben y cuántas
     tocan hoy. El número que de verdad se usa es el último. */
  const cab = vozNodo('div', 'voz-act-resumen');
  const anillo = vozNodo('div', 'voz-act-anillo');
  const pct = res.total ? Math.round((res.firmes / res.total) * 100) : 0;
  anillo.style.setProperty('--voz-pct', pct);
  anillo.appendChild(vozNodo('span', 'voz-act-anillo-n', pct + '%'));
  anillo.setAttribute('role', 'img');
  anillo.setAttribute('aria-label', 'Sabidas de memoria: ' + pct + ' por ciento');
  cab.appendChild(anillo);
  const datos = vozNodo('div', 'voz-act-resumen-txt');
  datos.appendChild(vozNodo('div', 'voz-act-resumen-t', res.total + (res.total === 1 ? ' actividad' : ' actividades')));
  datos.appendChild(vozNodo('div', 'voz-act-resumen-p',
    res.firmes + ' te salen ya de memoria · ' + res.vistas + ' vistas alguna vez'));
  datos.appendChild(vozNodo('div', 'voz-act-resumen-p voz-act-resumen-hoy',
    res.tocan ? ('⏰ ' + res.tocan + (res.tocan === 1 ? ' toca repasarla hoy' : ' tocan repasar hoy'))
              : '✓ Hoy no toca ninguna: vuelve en unos días'));
  cab.appendChild(datos);
  cuerpo.appendChild(cab);

  /* Los chips de qué hay, sacados de las actividades y no de una lista
     escrita: el día que se añada un tipo, esto ya lo dice. */
  const chips = vozNodo('div', 'voz-chips voz-act-chips');
  VOZ_ACT_TIPOS.forEach(t => {
    const n = items.filter(i => i.k === t.id).length;
    if (!n) return;
    const ch = vozNodo('span', 'voz-chip voz-chip-chica');
    ch.appendChild(document.createTextNode(t.ic + ' ' + t.t));
    ch.appendChild(vozNodo('span', 'voz-chip-n', String(n)));
    chips.appendChild(ch);
  });
  cuerpo.appendChild(chips);

  const botones = vozNodo('div', 'voz-act-botones');
  if (res.tocan) {
    botones.appendChild(vozBoton('voz-btn voz-btn-pri voz-btn-ancho',
      '▶️ Repasar lo que toca hoy (' + res.tocan + ')', () => vozActEmpezar(cid, 'toca')));
  }
  botones.appendChild(vozBoton('voz-btn voz-btn-ancho',
    '🔁 Hacerlas todas (' + res.total + ')', () => vozActEmpezar(cid, 'todas')));
  const fallados = (items || []).filter(it => { const a = vozActAvanceDe(cid)[it.id]; return a && a.mal > 0 && (a.n || 0) === 0; });
  if (fallados.length) {
    botones.appendChild(vozBoton('voz-btn voz-btn-ancho',
      '💢 Solo las que fallé (' + fallados.length + ')', () => vozActEmpezar(cid, 'fallados')));
  }
  cuerpo.appendChild(botones);

  /* Lo que hay dentro, plegado: se mira para corregir una errata, no
     para estudiar —estudiar es el botón de arriba—. */
  const det = vozNodo('details', 'voz-act-lista');
  const sum = vozNodo('summary', 'voz-act-lista-sum', '👁 Ver las ' + res.total + ' actividades');
  det.appendChild(sum);
  items.forEach((it, n) => det.appendChild(vozActFilaLista(cid, it, n, mio)));
  cuerpo.appendChild(det);

  const pie = vozNodo('div', 'voz-act-pie');
  if (mio) {
    pie.appendChild(vozBoton('voz-btn', '📖 Sacar más del texto', () => vozActGenerarTextoYGuardar(cid), 'Vuelve a sacar del texto las actividades del aparato (reemplaza las 📖 de antes)'));
    pie.appendChild(vozBoton('voz-btn', '📋 Pegar más', () => vozActAbrirPegar(cid)));
    const nSub = vozSubDe(cid).length;
    if (nSub) pie.appendChild(vozBoton('voz-btn', '🖍 Refrescar desde mis subrayados (' + nSub + ')', () => vozActGenerarYGuardar(cid)));
    pie.appendChild(vozActBotonBorrar(cid));
  } else {
    pie.appendChild(vozNodo('p', 'voz-menu-nota', '✋ Las puso otra persona de la casa: puedes hacerlas, pero solo ella puede cambiarlas.'));
  }
  cuerpo.appendChild(pie);
  const est = vozNodo('p', 'voz-aj-nota voz-act-estado', vozActRotuloNube());
  est.id = 'voz-act-estado';
  cuerpo.appendChild(est);
}

function vozActPuerta(ic, titulo, txt, alTocar) {
  const b = vozBoton('voz-act-puerta' + (alTocar ? '' : ' voz-btn-apagado'), null, alTocar || (() => {}));
  b.appendChild(vozNodo('span', 'voz-act-puerta-ic', ic));
  b.appendChild(vozNodo('span', 'voz-act-puerta-t', titulo));
  b.appendChild(vozNodo('span', 'voz-act-puerta-p', txt));
  if (!alTocar) b.disabled = true;
  return b;
}

/* Una fila de la lista plegada. Enseña el enunciado y, en las de
   selección, cuál es la buena: es la única manera de cazar una
   respuesta cambiada sin hacer la actividad entera. */
function vozActFilaLista(cid, it, n, mio) {
  const t = vozActTipo(it.k);
  const fila = vozNodo('div', 'voz-act-fila' + (it.k === 'opcion' && it.ok < 0 ? ' voz-act-fila-ambar' : ''));
  const cab = vozNodo('div', 'voz-act-fila-cab');
  cab.appendChild(vozNodo('span', 'voz-act-fila-n', String(n + 1)));
  cab.appendChild(vozNodo('span', 'voz-act-fila-tipo', t.ic + ' ' + t.t));
  if (it.auto) cab.appendChild(vozNodo('span', 'voz-act-fila-auto', VOZ_ACT_VIAS[vozActVia(it)] || VOZ_ACT_VIAS.sub));
  fila.appendChild(cab);
  const q = it.k === 'flash' ? it.f : (it.k === 'pares' ? (it.q || 'Emparejar') : it.q);
  fila.appendChild(vozNodo('div', 'voz-act-fila-q', String(q || '').replace(/\n/g, ' ')));
  let sol = '';
  if (it.k === 'flash') sol = '→ ' + it.r;
  else if (it.k === 'completar') sol = '→ ' + (it.a || '⚠️ sin respuesta');
  else if (it.k === 'opcion') sol = it.ok >= 0 ? ('→ ' + 'ABCDEF'[it.ok] + ') ' + it.o[it.ok]) : '⚠️ sin respuesta marcada';
  else if (it.k === 'pares') sol = it.ps.length + ' parejas';
  else if (it.k === 'abierta') sol = it.guia ? ('Pauta: ' + it.guia) : 'Sin pauta';
  fila.appendChild(vozNodo('div', 'voz-act-fila-sol', sol));
  /* De dónde salió, para revisarla sin abrir el texto: es la etiqueta de
     la regla 1 aplicada a cada pregunta generada. */
  if (it.cita && vozActVia(it) !== 'sub') fila.appendChild(vozNodo('div', 'voz-act-fila-cita', '“' + String(it.cita).slice(0, 160) + (String(it.cita).length > 160 ? '…' : '') + '”' + (it.donde ? ' — ' + it.donde : '')));
  if (mio) {
    fila.appendChild(vozBoton('voz-act-fila-x', '✕', () => {
      const quedan = (vozActDe(cid).items || []).filter(x => x.id !== it.id);
      vozActGuardarFicha(cid, quedan);
      vozActPintarTaller();
      vozAviso('Actividad quitada');
    }, 'Quitar esta actividad'));
  }
  return fila;
}

/* Borrar el taller entero, de dos toques y a la vista, como retirar un
   texto (regla 22): nada se borra con un solo toque y sin diálogo del
   navegador, que en la aplicación instalada puede no salir. */
function vozActBotonBorrar(cid) {
  const caja = vozNodo('span', 'voz-retirar-caja');
  const b = vozBoton('voz-btn', '🗑 Vaciar el taller', null, 'Quitar todas las actividades de este texto');
  const si = vozBoton('voz-btn voz-btn-peligro', 'Sí, vaciar', () => {
    vozActGuardarFicha(cid, []);
    vozActPintarTaller();
    vozAviso('🗑 Taller vaciado');
  });
  const no = vozBoton('voz-btn', 'No', () => { caja.classList.remove('voz-retirar-abierto'); si.hidden = true; no.hidden = true; });
  si.hidden = true; no.hidden = true;
  b.addEventListener('click', () => {
    const abierto = caja.classList.toggle('voz-retirar-abierto');
    si.hidden = !abierto; no.hidden = !abierto;
    if (abierto) si.focus();
  });
  caja.appendChild(b); caja.appendChild(si); caja.appendChild(no);
  return caja;
}

function vozActGenerarYGuardar(cid) {
  const r = vozActRefrescarAuto(cid, 'sub');
  if (!r.auto.length) { vozAviso('No hay subrayados de los que sacar actividades'); return; }
  vozActGuardarFicha(cid, r.aMano.concat(r.auto));
  vozActPintarTaller();
  vozAviso('🖍 ' + r.auto.length + (r.auto.length === 1 ? ' actividad sacada de tus subrayados' : ' actividades sacadas de tus subrayados'));
}

/* ══════════════════════════════════════════════════════════════════
   LAS ACTIVIDADES LAS MONTA EL SISTEMA, DEL PROPIO TEXTO
   ══════════════════════════════════════════════════════════════════
   Pedido por el autor el 16 de septiembre de 2026: «procura tú generar
   las actividades, que no tenga que estar haciendo las actividades y
   pegarlas, que el sistema genere las actividades de cada lectura tomando
   en consideración los mejores criterios de abstracción y síntesis».

   ⚠️ Y ACLARADO POR ÉL EL MISMO DÍA, DESPUÉS DE VER LA PRIMERA VERSIÓN:
   «no quiero APIs ni nada de eso; el sistema debe tener las actividades
   una vez que se pegue o suba un ensayo». Hubo un rato una segunda puerta
   que le pedía las actividades a Claude por una Edge Function, con su
   clave de pago y su despliegue a mano. Está quitada entera, y el motivo
   se escribe para que no vuelva: una herramienta cuyo trabajo principal
   depende de una clave que hay que comprar, de una función que hay que
   desplegar y de que haya señal NO ESTÁ TERMINADA. Se queda lo que corre
   en el aparato, al instante, sin cuenta y sin red — que además es lo
   único que puede cumplir «que ya estén listas al pegar el ensayo», que
   es lo que de verdad se pidió.

   CÓMO LO HACE, Y QUÉ NO HACE: `vozActGenerarDelTexto` mira el texto como
   lo miraría alguien con un lápiz —fechas, cifras, nombres propios,
   términos en negrita, definiciones, la primera y la última frase de cada
   capítulo, las frases que concluyen, las que razonan («porque», «sin
   embargo»), los subtítulos y la bibliografía— y arma con eso completar,
   tarjetas, parejas, selección y abiertas.

   ⚠️ NO ENTIENDE EL TEXTO: LO RECORTA. De ahí salen las dos cosas que hay
   que saber antes de tocarlo. La buena: todas sus respuestas están en el
   texto LETRA POR LETRA, así que no puede inventarse ninguna — que es la
   regla que no se negocia (la de los videos de M.E.T.A.S) y la que hacía
   cara la otra puerta. La otra: no sabe cuál es la tesis, solo dónde
   suele estar, así que la pregunta por la tesis es siempre ABIERTA y la
   frase del texto va de PAUTA, no de corrección — corregir a alguien con
   una frase que se eligió por su posición sería enseñarle mal.

   ⚠️ Y AUN ASÍ SE COMPRUEBA, CON `vozActLiteral`. Por construcción la
   respuesta sale del texto; pero entre la frase y la respuesta hay un
   `hueco()`, un `corta()` y cuatro expresiones regulares, y cualquiera de
   ellas puede devolver un día algo que ya no está escrito en ninguna
   parte. Una pregunta cuya respuesta no existe en el texto no la descubre
   nadie hasta que alguien la falla teniendo razón. Cuesta un `indexOf`.

   ⚠️ LAS PROCEDENCIAS NO SE MEZCLAN AL REFRESCAR. Cada actividad lleva
   `via`: 'sub' (de un subrayado), 'txt' (sacada del texto) o nada (pegada
   a mano). Volver a generar por una vía reemplaza SOLO las suyas: si
   «sacar del texto» borrara las pegadas, el automático del guardado le
   borraría a alguien lo que escribió a mano cada vez que corrige una coma.
   Las viejas con `auto: 1` y sin `via` son de subrayados, que era la única
   vía que había. */
const VOZ_ACT_VIAS = { sub: '🖍 de un subrayado', txt: '📖 sacada del texto' };
function vozActVia(it) { return (it && it.via) || (it && it.auto ? 'sub' : ''); }

const VOZ_ACT_TXT_TOPE = 28;

function vozActHash(s) {
  let h = 5381; s = String(s || '');
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/* Las mismas dos funciones que verifica.ts, en el aparato: lo que la
   función acepta y lo que el aparato acepta tiene que ser lo mismo. */
function vozActNormalizaTexto(s) {
  return String(s == null ? '' : s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[«»“”„‟"]/g, '"').replace(/[‘’‚‛']/g, "'").replace(/[–—‑]/g, '-').replace(/…/g, '...')
    .replace(/\s+/g, ' ').trim();
}
function vozActSinPuntuacion(s) {
  return vozActNormalizaTexto(s).replace(/[^\p{L}\p{N} ]+/gu, ' ').replace(/\s+/g, ' ').trim();
}
function vozActPreparaTexto(texto) {
  return { norm: vozActNormalizaTexto(texto), sinP: vozActSinPuntuacion(texto) };
}

/* ⚠️ ¿ESTÁ ESTO ESCRITO EN EL TEXTO? Es el único guardia del generador, y
   es barato a propósito. La respuesta de cada actividad sale de recortar
   una frase, así que por construcción está; pero entre la frase y la
   respuesta pasan un `hueco()`, un `corta()` y cuatro expresiones
   regulares, y el día que una de ellas devuelva algo que no está escrito
   en ninguna parte, la pregunta se guarda igual y nadie lo descubre hasta
   que alguien la falla teniendo razón. Sin mínimo de largo —un año son
   cuatro caracteres— y con la segunda vuelta sin puntuación, para que una
   coma comida no tire una respuesta buena. */
function vozActLiteral(x, T) {
  const c = vozActNormalizaTexto(x);
  if (!c) return false;
  if (T.norm.indexOf(c) >= 0) return true;
  const cp = vozActSinPuntuacion(x);
  return !!cp && T.sinP.indexOf(cp) >= 0;
}

/* El texto entero y plano, PARA COMPROBAR, con la bibliografía dentro:
   un año de una referencia es respuesta buena aunque `vozActUnidades` no
   mire los capítulos de fuentes (allí no se sacan frases). */
function vozActTodoPlano(c) {
  const out = [];
  (c.capitulos || []).forEach(cap => {
    if (cap.t) out.push(cap.t);
    (cap.p || []).forEach(b => { if (b) out.push(vozActPlanoDeBloque(b)); });
  });
  return out.join(' \n ');
}
/* ─── El texto, frase a frase ─── */
const VOZ_ACT_ABREV = /\b(?:sr|sra|srta|dr|dra|lic|ing|prof|p|pp|ej|cf|vol|núm|art|cap|ud|uds)\.$/i;
function vozActFrases(t) {
  const s = String(t || '').replace(/\s+/g, ' ').trim();
  const out = []; let ini = 0;
  const re = /[.!?…]+["»”’)]*\s+/g; let m;
  while ((m = re.exec(s))) {
    const fin = m.index + m[0].length;
    const trozo = s.slice(ini, fin).trim();
    const sig = s.charAt(fin);
    if (VOZ_ACT_ABREV.test(trozo.replace(/["»”’)]+$/, ''))) continue;
    if (sig && !/[A-ZÁÉÍÓÚÑ«"“¿¡(\d]/.test(sig)) continue;
    if (trozo) out.push(trozo);
    ini = fin;
  }
  const resto = s.slice(ini).trim();
  if (resto) out.push(resto);
  return out;
}

const VOZ_ACT_VACIAS = new Set(('el la los las un una unos unas de del al a ante bajo con contra desde en entre hacia hasta ' +
  'para por segun según sin sobre tras y e o u ni que como cuando donde mientras aunque pero sino si ya no es son era eran fue ' +
  'fueron ser esta está estan están estaba estaban hay ha han he se su sus le les lo mi mis tu tus nuestro nuestra nuestros ' +
  'nuestras este esta estos estas ese esa esos esas aquel aquella aquello esto eso el ella ellos ellas nosotros usted ustedes ' +
  'yo tu me te nos os tambien también mas más muy mucho poco todo toda todos todas otro otra otros otras cada uno algun alguna ' +
  'ningun ninguna entonces asi así aqui aquí alli allí ahi ahí ahora antes despues después luego solo sólo tan tanto bien mal ' +
  'casi porque pues aun aún hasta sino').split(' '));

const VOZ_ACT_MESES = 'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre';
const VOZ_ACT_RE_FECHA = new RegExp('\\b\\d{1,2} de (?:' + VOZ_ACT_MESES + ')(?: de \\d{4})?\\b', 'gi');
const VOZ_ACT_RE_ANIO = /\b(?:1[5-9]\d{2}|20\d{2})\b/g;
const VOZ_ACT_RE_CIFRA = /\b\d[\d.,]*\s?(?:%|por ciento|millones?|mil|millar(?:es)?|km|kg|metros|años|d[oó]lares|lempiras|euros|habitantes|personas|veces|p[aá]ginas|horas|d[ií]as|siglos)\b/gi;
const VOZ_ACT_RE_DEF = /^([A-ZÁÉÍÓÚÑ][^,.;:()]{1,45}?) (es|son|significa|se define como|se entiende por|consiste en|se llama|se conoce como|designa) (.{20,})$/;
const VOZ_ACT_RE_TESIS = /\b(en conclusi[oó]n|en definitiva|en suma|en resumen|por lo tanto|por tanto|de ah[ií] que|lo esencial|lo importante|la tesis|sostengo|sostiene que|la idea central|lo que importa|en el fondo|dicho de otro modo|en otras palabras|lo cierto es que|conviene recordar)\b/i;
/* Los conectores que marcan un razonamiento, no una enumeración. Van
   con el blanco delante dentro del grupo para poder cortar la frase por
   ahí sin comerse la última letra de la cabeza. */
const VOZ_ACT_RE_ARG = /\s(porque|pero |sin embargo|no obstante|en cambio|a diferencia de|por eso|por ello|por lo tanto|por tanto|de modo que|de ahí que|aunque|mientras que|gracias a|debido a|a pesar de|puesto que|ya que)/i;

/* Los nombres propios de una frase: palabras con mayúscula que NO son la
   primera —la primera la lleva por ser la primera—, en tirada, con sus
   «de la» en medio («Juan de la Cruz»). Sin diccionario: es lo que hace
   que «Estado» o «Iglesia» salgan también, y está bien, porque en un
   ensayo esos son justo los nombres que hay que recordar. */
function vozActNombres(frase) {
  const toks = frase.split(' ');
  const out = []; let run = [];
  const esCap = t => /^[«"“(]?[A-ZÁÉÍÓÚÑ][\p{L}'’-]*[.,;:!?»")”]*$/u.test(t);
  const conector = t => /^(de|del|la|las|los|y|e)$/.test(t);
  const pela = t => t.replace(/^[«"“(]+|[.,;:!?»")”]+$/g, '');
  const cierra = () => { if (run.length) out.push(run.join(' ')); run = []; };
  for (let i = 1; i < toks.length; i++) {
    const t = toks[i];
    if (esCap(t) && !VOZ_ACT_VACIAS.has(pela(t).toLowerCase())) {
      run.push(pela(t));
      if (/[.,;:!?]$/.test(t.replace(/[»")”]+$/, ''))) cierra();
    } else if (run.length && conector(t) && i + 1 < toks.length && esCap(toks[i + 1])) {
      run.push(t);
    } else cierra();
  }
  cierra();
  return out.filter(n => n.length >= 3 && n.length <= 40 && !/^(de|del|la|las|los|y|e)$/.test(n));
}

function vozActNegritas(raw) {
  const out = []; let m; const re = /\*\*([^*\n]{2,60})\*\*/g;
  while ((m = re.exec(String(raw || '')))) out.push(m[1].trim());
  return out;
}

/* Las entradas de la bibliografía que se dejan leer: «Apellido, N. (Año).
   Título». Lo que no tenga esa forma no se usa: adivinar un año en una
   referencia es inventarse un dato. */
function vozActFuentes(c) {
  const out = [];
  (c.capitulos || []).forEach(cap => (cap.p || []).forEach(b => {
    if (!b || b.k !== 'fuente') return;
    const t = String(b.t || '').replace(/\s+/g, ' ').trim();
    const m = t.match(/^([^,(]{2,40}?),\s*([^()]{0,40}?)\s*\(?(\d{4})[a-z]?\)?[.:]?\s*(.{5,120}?)(?:\.\s|$)/);
    if (!m) return;
    out.push({ apellido: m[1].trim(), anio: m[3], titulo: m[4].trim().replace(/[.:]$/, ''), t: t });
  }));
  return out;
}

/* Las frases del texto con su sitio: capítulo, bloque y el texto crudo
   del bloque (para las negritas, que en el plano ya no están). */
function vozActUnidades(c) {
  const U = [];
  (c.capitulos || []).forEach((cap, ci) => {
    if (cap.ref) return;
    (cap.p || []).forEach((b, vi) => {
      if (!b || !/^(p|li|cita)$/.test(b.k)) return;
      const plano = vozActPlanoDeBloque(b);
      vozActFrases(plano).forEach(fr => U.push({ cap: ci, vp: vi, frase: fr, raw: b.t || '' }));
    });
  });
  return U;
}

function vozActGenerarDelTexto(cid, tope) {
  const c = _vozCuentos.find(x => x.cid === cid);
  if (!c) return [];
  const U = vozActUnidades(c);
  const donde = ci => vozNombreCap(c, ci);
  const palabras = U.reduce((n, u) => n + vozPalabrasDe(u.frase), 0);
  /* Cuántas: crece con el largo. Un cuento de seiscientas palabras no da
     para treinta preguntas sin repetirse; un ensayo de ocho mil sí. `tope`
     lo pisa (la sonda lo usa para ver todo lo que el generador sabe sacar). */
  const objetivo = tope || Math.min(VOZ_ACT_TXT_TOPE, palabras < 800 ? 10 : palabras < 3000 ? 18 : palabras < 8000 ? 26 : 32);
  const grupos = { tesis: [], ideas: [], argumento: [], datos: [], terminos: [], refs: [], estructura: [] };
  const usadas = new Set();
  const vecesResp = {};
  const cuenta = r => { const k = vozActNormalizaTexto(r); vecesResp[k] = (vecesResp[k] || 0) + 1; return vecesResp[k]; };
  /* Una frase «buena» para preguntar: ni un fragmento ni un párrafo. Y
     empieza por mayúscula, que es como se sabe que es una frase entera. */
  const buena = u => { const n = vozPalabrasDe(u.frase); return n >= 6 && n <= 45 && /^[A-ZÁÉÍÓÚÑ«"“¿¡(]/.test(u.frase); };
  const hueco = (frase, resp) => {
    const i = frase.indexOf(resp);
    if (i < 0) return null;
    return (frase.slice(0, i) + '___' + frase.slice(i + resp.length)).replace(/\s{2,}/g, ' ').trim();
  };
  const corta = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
  /* ⚠️ El id sale del tipo, el enunciado y la respuesta: volver a generar
     el mismo texto da los mismos ids, así que reemplaza en vez de duplicar. */
  const mk = (k, campos, u, nivel) => Object.assign({
    id: 'txt-' + vozActHash(k + '|' + (campos.q || campos.f || '') + '|' + (campos.a || campos.r || '')),
    k: k, auto: 1, via: 'txt', nivel: nivel, donde: donde(u.cap), cita: u.frase, cap: u.cap, vp: u.vp,
  }, campos);

  /* ── La tesis: la frase que concluye, si la hay; si no, la primera ── */
  const marcada = U.find(u => VOZ_ACT_RE_TESIS.test(u.frase) && buena(u));
  const primera = U.find(buena);
  const tesisU = marcada || primera;
  if (tesisU) {
    grupos.tesis.push(mk('abierta', {
      q: '¿Cuál es la tesis de «' + (c.titulo || 'este texto') + '»? Dila en una frase, con tus palabras.',
      guia: 'El texto lo dice así: «' + tesisU.frase + '»' +
            (marcada && primera && primera !== marcada ? ' — y empieza diciendo: «' + primera.frase + '»' : ''),
    }, tesisU, 'tesis'));
    grupos.tesis.push(mk('flash', { f: 'La frase con que el texto resume lo que quiere que entiendas. ¿Cómo la dice?', r: tesisU.frase }, tesisU, 'tesis'));
    usadas.add(tesisU.frase);
  }

  /* ── Una idea por capítulo: cómo empieza y cómo termina ── */
  (c.capitulos || []).forEach((cap, ci) => {
    if (cap.ref) return;
    const deCap = U.filter(u => u.cap === ci);
    if (deCap.length < 3) return;
    const top = deCap.find(buena);
    const ult = deCap.slice().reverse().find(buena);
    if (!top) return;
    /* La frase va de PAUTA y no se gasta: se enseña solo después de
       contestar, así que un completar sobre esa misma frase no la
       regala. Lo que sí se gasta es lo que va de REVERSO de una tarjeta
       (la tesis, los términos), que ahí la frase se ve entera. */
    grupos.ideas.push(mk('abierta', {
      q: '¿Cuál es la idea principal de «' + (cap.t || donde(ci)) + '»? Dila con tus palabras.',
      guia: 'Empieza así: «' + top.frase + '»' + (ult && ult !== top ? ' Y termina así: «' + ult.frase + '»' : ''),
    }, top, 'idea'));
  });

  /* ── El argumento: las frases que RAZONAN ──────────────────────────
     Lo que separa un ensayo de una lista de datos es el «porque» y el
     «sin embargo»: ahí está el argumento, que es justo lo que se olvida
     primero y lo que ninguna pregunta de fecha toca. Se parte la frase
     por su conector y se pide el final. NO hay que entender nada para
     hacerlo —la respuesta es la frase entera, letra por letra— y aun así
     lo que se recuerda es el razonamiento y no el dato. Tope de cinco:
     con más, el texto entero se convertiría en esto y se comerían las
     frases buenas de los grupos de abajo. */
  U.forEach(u => {
    if (grupos.argumento.length >= 5 || usadas.has(u.frase) || !buena(u)) return;
    const m = u.frase.match(VOZ_ACT_RE_ARG);
    if (!m) return;
    const cabeza = u.frase.slice(0, m.index).trim();
    const cola = u.frase.slice(m.index + m[0].length).trim();
    if (vozPalabrasDe(cabeza) < 4 || vozPalabrasDe(cola) < 4) return;
    if (cuenta(u.frase) > 1) return;
    grupos.argumento.push(mk('flash', {
      f: 'Sigue el razonamiento: «' + cabeza + ' ' + m[0].trim() + '…»',
      r: u.frase,
    }, u, 'relacion'));
    usadas.add(u.frase);
  });

  /* ── Los datos: fechas, años, cifras y nombres, tapados en su frase ── */
  const anios = new Set();
  U.forEach(u => (u.frase.match(VOZ_ACT_RE_ANIO) || []).forEach(a => anios.add(a)));
  U.forEach(u => {
    if (!buena(u) || usadas.has(u.frase)) return;
    const cands = [];
    (u.frase.match(VOZ_ACT_RE_FECHA) || []).forEach(x => cands.push({ t: x, cl: 'fecha' }));
    (u.frase.match(VOZ_ACT_RE_ANIO) || []).forEach(x => { if (!cands.some(k => k.t.indexOf(x) >= 0)) cands.push({ t: x, cl: 'anio' }); });
    (u.frase.match(VOZ_ACT_RE_CIFRA) || []).forEach(x => { if (!cands.some(k => k.t.indexOf(x) >= 0 || x.indexOf(k.t) >= 0)) cands.push({ t: x, cl: 'cifra' }); });
    const nombres = vozActNombres(u.frase).filter(x => !cands.some(k => k.t.indexOf(x) >= 0 || x.indexOf(k.t) >= 0));
    /* Hasta DOS por frase: un número y un nombre. Con uno solo, el año se
       comía siempre al nombre («decía Remigio Ochoa, que había nacido en
       1881») y un ensayo lleno de nombres salía sin ninguno. */
    const elegidos = [];
    if (cands[0]) elegidos.push(cands[0]);
    if (nombres[0]) elegidos.push({ t: nombres[0], cl: 'nombre' });
    let puso = false;
    elegidos.forEach(cd => {
      if (cuenta(cd.t) > 2) return;
      const q = hueco(u.frase, cd.t);
      if (!q) return;
      /* Los años, alguna vez como selección —con los OTROS años del texto
         de distractores, nunca inventados—, y las menos: recordar antes
         que reconocer. */
      if (cd.cl === 'anio' && anios.size >= 4 && grupos.datos.filter(d => d.k === 'opcion').length < Math.ceil(objetivo / 6)) {
        const otros = [...anios].filter(a => a !== cd.t).sort((a, b) => Math.abs(a - cd.t) - Math.abs(b - cd.t)).slice(0, 3);
        const o = otros.concat([cd.t]).sort((a, b) => a - b);
        grupos.datos.push(mk('opcion', { q: q.replace('___', '¿___?'), o: o, ok: o.indexOf(cd.t) }, u, 'dato'));
      } else {
        grupos.datos.push(mk('completar', { q: q, a: cd.t }, u, 'dato'));
      }
      puso = true;
    });
    if (puso) usadas.add(u.frase);
  });

  /* ── Los términos: negritas, definiciones y subtítulos ── */
  U.forEach(u => {
    if (usadas.has(u.frase)) return;
    const negs = vozActNegritas(u.raw).filter(n => u.frase.indexOf(n) >= 0);
    if (negs.length) {
      if (cuenta(negs[0]) > 1 || !buena(u)) return;
      grupos.terminos.push(mk('flash', { f: '¿Qué dice el texto sobre «' + negs[0] + '»?', r: u.frase }, u, 'termino'));
      usadas.add(u.frase);
      return;
    }
    const m = u.frase.match(VOZ_ACT_RE_DEF);
    if (m && m[1].split(' ').length <= 5 && buena(u)) {
      if (cuenta(m[1]) > 1) return;
      grupos.terminos.push(mk('flash', { f: '¿Qué es «' + m[1] + '», según el texto?', r: u.frase }, u, 'termino'));
      usadas.add(u.frase);
    }
  });
  (c.capitulos || []).forEach((cap, ci) => (cap.p || []).forEach((b, vi) => {
    if (!b || b.k !== 'h3' || !b.t) return;
    const sig = (cap.p || []).slice(vi + 1).find(x => x && /^(p|li|cita)$/.test(x.k));
    const fr = sig && vozActFrases(vozActPlanoDeBloque(sig))[0];
    if (!fr || vozPalabrasDe(fr) < 6 || vozPalabrasDe(fr) > 45) return;
    grupos.terminos.push(mk('flash', { f: '¿De qué trata «' + b.t + '»?', r: fr }, { cap: ci, vp: vi, frase: fr }, 'idea'));
  }));

  /* ── Las referencias: la bibliografía, o las citas del cuerpo ── */
  const F = vozActFuentes(c);
  if (F.length >= 2) {
    const uF = { cap: 0, vp: 0, frase: F.slice(0, 6).map(f => f.t).join(' ') };
    grupos.refs.push(mk('pares', { q: 'Empareja cada autor de la bibliografía con su obra', ps: F.slice(0, 6).map(f => [f.apellido, corta(f.titulo, 60)]) }, uF, 'dato'));
    const aniosF = [...new Set(F.map(f => f.anio))];
    F.slice(0, 4).forEach(f => {
      const uf = { cap: 0, vp: 0, frase: f.t };
      if (aniosF.length >= 4) {
        const otros = aniosF.filter(a => a !== f.anio).sort((a, b) => Math.abs(a - f.anio) - Math.abs(b - f.anio)).slice(0, 3);
        const o = otros.concat([f.anio]).sort((a, b) => a - b);
        grupos.refs.push(mk('opcion', { q: '¿En qué año se publicó «' + f.titulo + '», de ' + f.apellido + '?', o: o, ok: o.indexOf(f.anio) }, uf, 'dato'));
      } else {
        grupos.refs.push(mk('completar', { q: f.apellido + ' (___). ' + f.titulo + '.', a: f.anio }, uf, 'dato'));
      }
    });
  } else {
    const vistos = {}; const re = /\(([A-ZÁÉÍÓÚÑ][\p{L}’' -]{1,30}?),\s*(\d{4})[a-z]?(?:[,;:][^)]*)?\)/gu;
    U.forEach(u => { let m; while ((m = re.exec(u.frase))) if (!vistos[m[1]]) vistos[m[1]] = { anio: m[2], u: u }; });
    const lista = Object.keys(vistos).slice(0, 6);
    if (lista.length >= 2) {
      grupos.refs.push(mk('pares', { q: 'Empareja cada autor citado con el año de su obra', ps: lista.map(a => [a, vistos[a].anio]) }, vistos[lista[0]].u, 'dato'));
    }
  }

  /* ── La estructura: cada capítulo con su idea ── */
  const caps = (c.capitulos || []).map((cap, ci) => ({ cap: cap, ci: ci })).filter(x => x.cap.t && !x.cap.ref);
  if (caps.length >= 3) {
    const ps = [];
    caps.slice(0, 6).forEach(x => { const top = U.find(u => u.cap === x.ci && buena(u)); if (top) ps.push([x.cap.t, corta(top.frase, 70)]); });
    if (ps.length >= 3) {
      grupos.estructura.push(mk('pares', { q: '¿A qué capítulo pertenece cada idea?', ps: ps }, { cap: caps[0].ci, vp: 0, frase: ps.map(p => p[1]).join(' ') }, 'relacion'));
    }
  }

  /* ── El reparto: se intercalan los grupos y se corta en el objetivo, así
     la tesis y las ideas siempre entran y los datos no se lo comen todo ── */
  const orden = ['tesis', 'ideas', 'argumento', 'datos', 'terminos', 'refs', 'estructura'];
  const fuera = []; let hay = true;
  while (hay && fuera.length < objetivo) {
    hay = false;
    orden.forEach(g => { if (fuera.length < objetivo && grupos[g].length) { fuera.push(grupos[g].shift()); hay = true; } });
  }

  /* ⚠️ EL CEDAZO: lo que se responde tiene que estar ESCRITO en el texto.
     Ver `vozActLiteral`. Se mira la respuesta de cada tipo —el reverso de
     una tarjeta, lo que va en el hueco, la opción correcta—; las parejas
     y las abiertas no, que ahí lo que se arma son títulos y pautas, no una
     respuesta literal. */
  const T = vozActPreparaTexto(vozActTodoPlano(c));
  return fuera.filter(it => {
    if (it.k === 'flash') return vozActLiteral(it.r, T);
    if (it.k === 'completar') return vozActLiteral(it.a, T);
    if (it.k === 'opcion') return vozActLiteral((it.o || [])[it.ok], T);
    return true;
  });
}

/* ⚠️ EL TALLER SE MONTA SOLO, Y ESTE ES EL MOTOR DE LAS TRES PUERTAS.
   «El sistema debe tener las actividades una vez que se pegue o suba un
   ensayo» (el autor, 16 de septiembre de 2026). Un botón que hay que ir a
   buscar después de guardar se toca una vez en la vida —es la misma razón
   por la que el enlace al taller está al pie de la última página del
   texto, y no en un menú—, así que esto corre en el propio guardado.

   Callado a propósito: no avisa ni repinta, porque los tres sitios que lo
   llaman ya van a repintar. Devuelve cuántas puso, para que el aviso lo dé
   quien llamó y en su propio idioma.

   ⚠️ Y SOLO TOCA LAS DE VÍA 'txt'. Lo hace `vozActRefrescarAuto`, y aquí
   importa más que en ningún otro sitio: esto corre en CADA guardado, así
   que si tocara las pegadas a mano, corregir una coma le borraría a alguien
   el cuestionario que escribió. */
function vozActMontarDelTexto(cid) {
  const r = vozActRefrescarAuto(cid, 'txt');
  if (!r.auto.length) return 0;
  vozActGuardarFicha(cid, r.aMano.concat(r.auto), true);
  return r.auto.length;
}

/* La puerta 📖 a mano, que es la misma con aviso: se queda porque el
   automático no cubre los textos que ya estaban en el anaquel el día que
   esto se escribió, ni el «sácame más» después de corregir a mano. */
function vozActGenerarTextoYGuardar(cid) {
  const n = vozActMontarDelTexto(cid);
  if (!n) { vozAviso('El texto es demasiado corto para sacarle actividades'); return; }
  vozRender();
  vozActPintarTaller();
  vozAviso('📖 ' + n + (n === 1 ? ' actividad sacada del texto' : ' actividades sacadas del texto'));
}

/* ⚠️ Y AL ABRIR UN TALLER VACÍO SE MONTA TAMBIÉN, PERO SOLO CUANDO SE SABE
   QUE LA NUBE NO TIENE NADA MÁS QUE DAR. Es lo que hace que los textos que
   ya estaban en el anaquel tengan taller sin volver a guardarlos uno por
   uno; y la condición no es un detalle: generar con la nube a medio
   contestar escribiría una ficha nueva con el reloj de AHORA, que le
   ganaría por más nueva a las actividades que otra persona de la casa
   pegó a mano en otro aparato — y las borraría sin dar ningún error.
   'al-dia' es «ya bajó y no había», 'sin-sesion' y 'sin-tabla' son «no hay
   nube que consultar». En 'sin-senal', 'subiendo' o 'error' NO se monta:
   se queda la pantalla de las puertas, que es lo honesto. */
function vozActMontarSiVacio(cid) {
  if (vozActCuenta(cid)) return 0;
  if (['al-dia', 'sin-sesion', 'sin-tabla'].indexOf(_vozActNube) < 0) return 0;
  const c = _vozCuentos.find(x => x.cid === cid);
  /* Y solo en lo propio: montarle el taller al texto de otra persona lo
     firmaría con mi nombre —el dueño del taller es quien lo empieza— y
     dejaría a quien lo escribió sin poder cambiarlo. Ahí está la puerta 📖,
     que es un toque y es a propósito. */
  if (!c || !vozEsMio(c)) return 0;
  const n = vozActMontarDelTexto(cid);
  if (n) { vozRender(); vozActPintarTaller(); }
  return n;
}

/* ─── La sesión ─── */
function vozActEmpezar(cid, modo) {
  const items = vozActDe(cid).items || [];
  const av = vozActAvanceDe(cid);
  let cola = items;
  if (modo === 'toca') cola = items.filter(it => vozActToca(cid, it.id));
  else if (modo === 'fallados') cola = items.filter(it => { const a = av[it.id]; return a && a.mal > 0 && (a.n || 0) === 0; });
  if (!cola.length) cola = items;
  _vozActSesion = { cid: cid, cola: vozActBaraja(cola), i: 0, bien: 0, mal: 0, revisar: [], estado: null };
  vozActPintarTaller();
}

function vozActSiguiente() {
  const s = _vozActSesion;
  if (!s) return;
  s.i++;
  s.estado = null;
  vozActPintarTaller();
}

function vozActPintarSesion(cuerpo) {
  const s = _vozActSesion;
  const it = s.cola[s.i];
  if (!it) { vozActPintarFinal(cuerpo); return; }

  const barra = vozNodo('div', 'voz-act-barra');
  const dentro = vozNodo('div', 'voz-act-barra-in');
  dentro.style.width = Math.round((s.i / s.cola.length) * 100) + '%';
  barra.appendChild(dentro);
  cuerpo.appendChild(barra);

  const t = vozActTipo(it.k);
  const meta = vozNodo('div', 'voz-act-meta');
  meta.appendChild(vozNodo('span', 'voz-act-meta-tipo', t.ic + ' ' + t.t));
  meta.appendChild(vozNodo('span', 'voz-act-meta-n', (s.i + 1) + ' de ' + s.cola.length));
  if (it.donde) meta.appendChild(vozNodo('span', 'voz-act-meta-cap', it.donde));
  cuerpo.appendChild(meta);

  const caja = vozNodo('div', 'voz-act-caja');
  cuerpo.appendChild(caja);
  if (it.k === 'flash') vozActPintaFlash(caja, it);
  else if (it.k === 'opcion') vozActPintaOpcion(caja, it);
  else if (it.k === 'completar') vozActPintaCompletar(caja, it);
  else if (it.k === 'pares') vozActPintaPares(caja, it);
  else vozActPintaAbierta(caja, it);

  const pie = vozNodo('div', 'voz-act-sesion-pie');
  pie.appendChild(vozBoton('voz-btn voz-act-salir', '⏸ Dejarlo aquí', () => { _vozActSesion = null; vozActPintarTaller(); }));
  cuerpo.appendChild(pie);
}

/* El veredicto de una actividad: lo apunta, lo enseña y ofrece seguir.
   ⚠️ Y cuando se falla, se enseña la respuesta buena EN EL ACTO. Un
   taller que dice «no» y pasa a la siguiente enseña a fallar dos
   veces: la corrección inmediata es la mitad del aparato. */
function vozActVeredicto(caja, it, bien, dicho, casi) {
  const s = _vozActSesion;
  if (!s || s.estado) return;
  s.estado = bien ? 'bien' : 'mal';
  vozActApuntar(s.cid, it.id, bien);
  if (bien) s.bien++; else { s.mal++; s.revisar.push(it); }
  const fb = vozNodo('div', 'voz-act-fb ' + (bien ? (casi ? 'voz-act-fb-casi' : 'voz-act-fb-ok') : 'voz-act-fb-no'));
  fb.appendChild(vozNodo('div', 'voz-act-fb-t',
    bien ? (casi ? '✓ Casi exacto, cuenta' : '✓ Bien') : '✕ No era'));
  if (dicho) fb.appendChild(vozNodo('div', 'voz-act-fb-r', dicho));
  caja.appendChild(fb);
  const sig = vozBoton('voz-btn voz-btn-pri voz-btn-ancho',
    s.i + 1 >= s.cola.length ? '🏁 Terminar' : 'Siguiente ▶', vozActSiguiente);
  caja.appendChild(sig);
  setTimeout(() => { try { sig.focus(); } catch (e) {} }, 40);
  try { if (typeof sfx === 'function') sfx(bien ? 'ok' : 'err'); } catch (e) {}
}

function vozActPintaFlash(caja, it) {
  const tarjeta = vozNodo('div', 'voz-act-tarjeta');
  const cara = vozNodo('div', 'voz-act-cara');
  vozPintaTexto(cara, it.f);
  tarjeta.appendChild(cara);
  caja.appendChild(tarjeta);
  const btns = vozNodo('div', 'voz-act-btns');
  btns.appendChild(vozBoton('voz-btn voz-btn-pri voz-btn-ancho', '🔄 Voltear', () => {
    btns.hidden = true;
    const cruz = vozNodo('div', 'voz-act-cara voz-act-cruz');
    vozPintaTexto(cruz, it.r);
    tarjeta.appendChild(cruz);
    /* ⚠️ Se pregunta DESPUÉS de voltear, no antes: el juicio tiene que
       hacerse con la respuesta delante, que es cuando uno sabe de
       verdad si la tenía. Es el «cierre de cuaderno» del taller de la
       memoria vuelto del revés. */
    const juicio = vozNodo('div', 'voz-act-btns');
    juicio.appendChild(vozBoton('voz-btn voz-act-si', '✓ La tenía', () => vozActVeredicto(caja, it, true)));
    juicio.appendChild(vozBoton('voz-btn voz-act-no', '✕ No me salió', () => vozActVeredicto(caja, it, false)));
    caja.appendChild(juicio);
  }));
  caja.appendChild(btns);
}

function vozActPintaOpcion(caja, it) {
  const q = vozNodo('div', 'voz-act-q');
  vozPintaTexto(q, it.q);
  caja.appendChild(q);
  const ops = vozNodo('div', 'voz-act-ops');
  /* Las opciones NO se barajan: el orden es el que escribió quien las
     puso, y barajarlas cambiaría la letra de la respuesta —que es lo
     que se lee en la lista de arriba para corregir una errata—. */
  it.o.forEach((o, k) => {
    const b = vozBoton('voz-act-op', null, () => {
      if (_vozActSesion.estado) return;
      ops.querySelectorAll('.voz-act-op').forEach((n, j) => {
        if (j === it.ok) n.classList.add('voz-act-op-ok');
        else if (j === k) n.classList.add('voz-act-op-no');
        n.disabled = true;
      });
      vozActVeredicto(caja, it, k === it.ok, k === it.ok ? '' : 'La buena era la ' + 'ABCDEF'[it.ok] + ': ' + it.o[it.ok]);
    });
    b.appendChild(vozNodo('span', 'voz-act-op-l', 'ABCDEF'[k]));
    const txt = vozNodo('span', 'voz-act-op-t');
    vozPintaTexto(txt, o);
    b.appendChild(txt);
    ops.appendChild(b);
  });
  caja.appendChild(ops);
}

function vozActPintaCompletar(caja, it) {
  const q = vozNodo('div', 'voz-act-q voz-act-q-hueco');
  /* El hueco se pinta como un hueco de verdad, no como tres guiones
     bajos: partiendo la frase por él y colgando una raya en medio. */
  const trozos = String(it.q || '').split('___');
  trozos.forEach((t, k) => {
    const sp = vozNodo('span', 'voz-act-trozo');
    vozPintaTexto(sp, t);
    q.appendChild(sp);
    if (k < trozos.length - 1) q.appendChild(vozNodo('span', 'voz-act-hueco', ' '));
  });
  caja.appendChild(q);
  const campo = vozNodo('input', 'voz-act-campo');
  campo.type = 'text';
  campo.autocomplete = 'off';
  campo.autocapitalize = 'off';
  campo.spellcheck = false;
  campo.placeholder = 'Escribe lo que va en el hueco';
  campo.setAttribute('aria-label', 'Lo que va en el hueco');
  caja.appendChild(campo);
  const comprobar = () => {
    if (_vozActSesion.estado) return;
    const r = vozActComparar(campo.value, it.a);
    if (r === 'vacio') { campo.focus(); return; }
    campo.disabled = true;
    vozActVeredicto(caja, it, r !== 'mal', 'Era: ' + it.a, r === 'casi');
  };
  campo.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); comprobar(); } });
  const btns = vozNodo('div', 'voz-act-btns');
  btns.appendChild(vozBoton('voz-btn voz-btn-pri voz-btn-ancho', '✓ Comprobar', comprobar));
  btns.appendChild(vozBoton('voz-btn', '👁 No me sale', () => {
    if (_vozActSesion.estado) return;
    campo.disabled = true;
    vozActVeredicto(caja, it, false, 'Era: ' + it.a);
  }));
  caja.appendChild(btns);
  setTimeout(() => { try { campo.focus(); } catch (e) {} }, 60);
}

function vozActPintaAbierta(caja, it) {
  const q = vozNodo('div', 'voz-act-q');
  vozPintaTexto(q, it.q);
  caja.appendChild(q);
  const ta = vozNodo('textarea', 'voz-act-area');
  ta.rows = 4;
  ta.placeholder = 'Contéstala con tus palabras, o en tu cuaderno';
  ta.setAttribute('aria-label', 'Tu respuesta');
  caja.appendChild(ta);
  const btns = vozNodo('div', 'voz-act-btns');
  btns.appendChild(vozBoton('voz-btn voz-btn-pri voz-btn-ancho', '👁 Ver la pauta', () => {
    if (_vozActSesion.estado) return;
    btns.hidden = true;
    ta.disabled = true;
    const pauta = vozNodo('div', 'voz-act-pauta');
    pauta.appendChild(vozNodo('div', 'voz-act-pauta-t', '✅ Lo que se esperaba'));
    vozPintaTexto(pauta.appendChild(vozNodo('div', 'voz-act-pauta-p')),
      it.guia || 'Esta pregunta no trae pauta: compárala con lo que dice el texto.');
    caja.appendChild(pauta);
    /* ⚠️ Una abierta NO la corrige la máquina: la corrige quien la
       contestó, comparando. Es la norma 5-quater de la casa —el
       análisis complejo va sin premio— y por eso aquí el juicio es
       suyo y no puntúa como acierto automático. */
    const juicio = vozNodo('div', 'voz-act-btns');
    juicio.appendChild(vozBoton('voz-btn voz-act-si', '✓ Lo tenía', () => vozActVeredicto(caja, it, true)));
    juicio.appendChild(vozBoton('voz-btn voz-act-no', '✕ Me faltó', () => vozActVeredicto(caja, it, false)));
    caja.appendChild(juicio);
  }));
  caja.appendChild(btns);
}

/* ─── Emparejar ───────────────────────────────────────────────────
   ⚠️ SE PUEDE ARRASTRAR, PERO TOCAR DOS VECES HACE LO MISMO. Es la
   regla del asa de la repisa y del anaquel: un gesto que sea la única
   manera de hacer algo es algo que a veces no se puede hacer —con el
   dedo mojado, con funda, con la mano llena— y aquí además lo usa
   quien está estudiando, no quien administra. El arrastre va con
   PUNTEROS, nunca con el `draggable` del navegador, que en el
   navegador de casi ninguna tableta existe. */
function vozActPintaPares(caja, it) {
  const q = vozNodo('div', 'voz-act-q');
  vozPintaTexto(q, it.q || 'Empareja cada una con la suya');
  caja.appendChild(q);
  caja.appendChild(vozNodo('p', 'voz-act-ayuda',
    'Toca una de la izquierda y después su pareja de la derecha. También puedes arrastrarla.'));

  const izq = it.ps.map((p, k) => ({ k: k, t: p[0] }));
  const der = vozActBaraja(it.ps.map((p, k) => ({ k: k, t: p[1] })));
  const hechas = {};
  let elegida = null;

  const tablero = vozNodo('div', 'voz-act-tablero');
  const colI = vozNodo('div', 'voz-act-col');
  const colD = vozNodo('div', 'voz-act-col');
  tablero.appendChild(colI); tablero.appendChild(colD);
  caja.appendChild(tablero);

  const btns = vozNodo('div', 'voz-act-btns');
  caja.appendChild(btns);

  const pintar = () => {
    colI.textContent = ''; colD.textContent = '';
    izq.forEach(a => {
      const b = vozBoton('voz-act-par voz-act-par-i' + (hechas[a.k] != null ? ' voz-act-par-hecho' : '')
        + (elegida === a.k ? ' voz-act-par-elegida' : ''), null, () => {
        if (_vozActSesion.estado || hechas[a.k] != null) return;
        elegida = (elegida === a.k) ? null : a.k;
        pintar();
      });
      b.dataset.iz = String(a.k);
      const t = vozNodo('span', 'voz-act-par-t');
      vozPintaTexto(t, a.t);
      b.appendChild(t);
      if (hechas[a.k] != null) b.appendChild(vozNodo('span', 'voz-act-par-con', '→ ' + it.ps[hechas[a.k]][1]));
      b.setAttribute('aria-pressed', elegida === a.k ? 'true' : 'false');
      colI.appendChild(b);
    });
    const usadas = Object.values(hechas);
    der.forEach(d => {
      if (usadas.indexOf(d.k) >= 0) return;
      const b = vozBoton('voz-act-par voz-act-par-d', null, () => {
        if (_vozActSesion.estado) return;
        if (elegida == null) { vozAviso('Toca primero una de la izquierda'); return; }
        hechas[elegida] = d.k;
        elegida = null;
        pintar();
      });
      b.dataset.de = String(d.k);
      const t = vozNodo('span', 'voz-act-par-t');
      vozPintaTexto(t, d.t);
      b.appendChild(t);
      colD.appendChild(b);
    });
    btns.textContent = '';
    const faltan = izq.filter(a => hechas[a.k] == null).length;
    if (faltan) {
      btns.appendChild(vozNodo('p', 'voz-act-ayuda', faltan === 1 ? 'Falta una pareja' : 'Faltan ' + faltan + ' parejas'));
      if (Object.keys(hechas).length) {
        btns.appendChild(vozBoton('voz-btn', '↺ Deshacer', () => {
          const ks = Object.keys(hechas);
          delete hechas[ks[ks.length - 1]];
          elegida = null; pintar();
        }));
      }
    } else {
      btns.appendChild(vozBoton('voz-btn voz-btn-pri voz-btn-ancho', '✓ Comprobar', () => {
        if (_vozActSesion.estado) return;
        let bien = 0;
        izq.forEach(a => { if (hechas[a.k] === a.k) bien++; });
        colI.querySelectorAll('.voz-act-par-i').forEach((n, j) => {
          n.classList.add(hechas[izq[j].k] === izq[j].k ? 'voz-act-par-ok' : 'voz-act-par-mal');
          n.disabled = true;
          if (hechas[izq[j].k] !== izq[j].k) {
            const c = n.querySelector('.voz-act-par-con');
            if (c) c.textContent = '→ era: ' + it.ps[izq[j].k][1];
          }
        });
        colD.textContent = '';
        btns.textContent = '';
        vozActVeredicto(caja, it, bien === izq.length,
          bien === izq.length ? '' : ('Acertaste ' + bien + ' de ' + izq.length));
      }));
      btns.appendChild(vozBoton('voz-btn', '↺ Empezar de nuevo', () => {
        Object.keys(hechas).forEach(k => delete hechas[k]);
        elegida = null; pintar();
      }));
    }
  };
  pintar();
  vozActArrastrePares(tablero, (iz, de) => {
    if (_vozActSesion.estado || hechas[iz] != null) return;
    hechas[iz] = de;
    elegida = null;
    pintar();
  });
}

/* El arrastre, con punteros y `touch-action: none` en la ficha que se
   arrastra: sin eso el navegador se queda el gesto para desplazar la
   página y el arrastre no arranca nunca. */
function vozActArrastrePares(tablero, alSoltar) {
  if (tablero.dataset.enganchado) return;
  tablero.dataset.enganchado = '1';
  let nodo = null, idp = null, fantasma = null;
  const soltar = ev => {
    if (!nodo) return;
    const bajo = document.elementFromPoint(ev.clientX, ev.clientY);
    const destino = bajo && bajo.closest ? bajo.closest('.voz-act-par-d') : null;
    nodo.classList.remove('voz-act-arrastrando');
    if (fantasma && fantasma.parentNode) fantasma.parentNode.removeChild(fantasma);
    tablero.querySelectorAll('.voz-act-par-d').forEach(n => n.classList.remove('voz-act-par-diana'));
    const iz = Number(nodo.dataset.iz);
    nodo = null; idp = null; fantasma = null;
    if (destino) alSoltar(iz, Number(destino.dataset.de));
  };
  tablero.addEventListener('pointerdown', ev => {
    const it = ev.target.closest ? ev.target.closest('.voz-act-par-i') : null;
    if (!it || it.disabled || it.classList.contains('voz-act-par-hecho')) return;
    nodo = it; idp = ev.pointerId;
    try { it.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  tablero.addEventListener('pointermove', ev => {
    if (!nodo || ev.pointerId !== idp) return;
    if (!fantasma) {
      /* El fantasma solo nace cuando el dedo se movió de verdad: sin
         eso, un toque normal dejaría una ficha flotando un instante. */
      const r = nodo.getBoundingClientRect();
      if (Math.abs(ev.clientY - (r.top + r.height / 2)) < 6 && Math.abs(ev.clientX - (r.left + r.width / 2)) < 12) return;
      nodo.classList.add('voz-act-arrastrando');
      fantasma = vozNodo('div', 'voz-act-fantasma', nodo.textContent.replace(/→.*$/, '').trim());
      document.body.appendChild(fantasma);
    }
    ev.preventDefault();
    fantasma.style.left = ev.clientX + 'px';
    fantasma.style.top = ev.clientY + 'px';
    const bajo = document.elementFromPoint(ev.clientX, ev.clientY);
    const destino = bajo && bajo.closest ? bajo.closest('.voz-act-par-d') : null;
    tablero.querySelectorAll('.voz-act-par-d').forEach(n => n.classList.toggle('voz-act-par-diana', n === destino));
  });
  tablero.addEventListener('pointerup', soltar);
  tablero.addEventListener('pointercancel', ev => {
    if (fantasma && fantasma.parentNode) fantasma.parentNode.removeChild(fantasma);
    if (nodo) nodo.classList.remove('voz-act-arrastrando');
    nodo = null; idp = null; fantasma = null;
  });
}

function vozActPintarFinal(cuerpo) {
  const s = _vozActSesion;
  const total = s.bien + s.mal;
  const pct = total ? Math.round((s.bien / total) * 100) : 0;
  const fin = vozNodo('div', 'voz-act-final');
  fin.appendChild(vozNodo('div', 'voz-act-final-ic', pct >= 80 ? '🎉' : (pct >= 50 ? '💪' : '📖')));
  fin.appendChild(vozNodo('div', 'voz-act-final-t', s.bien + ' de ' + total));
  fin.appendChild(vozNodo('p', 'voz-act-final-p',
    pct >= 80 ? 'Eso se quedó. Las que acertaste vuelven a preguntarse dentro de unos días, no mañana.'
      : (pct >= 50 ? 'A medias, que es donde se aprende. Las falladas vuelven mañana.'
        : 'Vale la pena releer el texto antes de volver: las falladas vuelven mañana.')));
  cuerpo.appendChild(fin);

  if (s.revisar.length) {
    const lista = vozNodo('div', 'voz-act-revisar');
    lista.appendChild(vozNodo('div', 'voz-ind-tit', 'Lo que se escapó'));
    s.revisar.forEach(it => {
      const f = vozNodo('div', 'voz-act-rev');
      f.appendChild(vozNodo('div', 'voz-act-rev-q', String(it.k === 'flash' ? it.f : it.q || '').replace(/\n/g, ' ')));
      const sol = it.k === 'flash' ? it.r : (it.k === 'completar' ? it.a
        : (it.k === 'opcion' && it.ok >= 0 ? it.o[it.ok] : (it.k === 'pares' ? it.ps.map(p => p[0] + ' → ' + p[1]).join(' · ') : (it.guia || ''))));
      if (sol) f.appendChild(vozNodo('div', 'voz-act-rev-s', sol));
      /* Y se puede ir al sitio del texto de donde salió, que es lo que
         convierte un fallo en una relectura y no en un número. */
      if (it.cap != null && it.vp != null) {
        f.appendChild(vozBoton('voz-act-rev-ir', '📖 Ver en el texto', () => {
          vozActCerrarTaller();
          vozAbrirLector(s.cid);
          setTimeout(() => vozIrA(it.cap, it.vp, 0), 320);
        }));
      }
      lista.appendChild(f);
    });
    cuerpo.appendChild(lista);
  }

  const btns = vozNodo('div', 'voz-act-botones');
  if (s.revisar.length) {
    btns.appendChild(vozBoton('voz-btn voz-btn-pri voz-btn-ancho', '🔁 Repetir las ' + s.revisar.length + ' falladas', () => {
      _vozActSesion = { cid: s.cid, cola: vozActBaraja(s.revisar), i: 0, bien: 0, mal: 0, revisar: [], estado: null };
      vozActPintarTaller();
    }));
  }
  btns.appendChild(vozBoton('voz-btn voz-btn-ancho', '📊 Volver al taller', () => { _vozActSesion = null; vozActPintarTaller(); }));
  cuerpo.appendChild(btns);
}

/* ─── La hoja de pegar actividades ────────────────────────────────
   Como la de pegar el texto: se pega de golpe lo que dio la máquina y
   la pantalla dice ANTES de guardar qué entendió de cada tipo y qué
   renglón no. Y con un ejemplo que funciona: aprender editando algo
   que ya va cuesta un tercio que aprender leyendo cómo debería ser. */

const VOZ_ACT_EJEMPLO = [
  '## Tarjetas de memoria',
  '1910 :: El año en que se secó el pozo del pueblo',
  'Remedios :: La única que no quiso irse',
  '',
  '## Emparejar',
  'Los Ochoa → los primeros en marcharse',
  'El maestro → se fue después de los Ochoa',
  'El que vendía cal → el tercero en irse',
  '',
  '## Preguntas de selección',
  '1. ¿Por qué Remedios no quiso irse del pueblo?',
  'A) Porque no tenía carreta',
  'B) Porque allí están enterrados los suyos ✅',
  'C) Porque el pozo todavía daba agua',
  'D) Porque esperaba al maestro',
  '',
  '2. ¿Qué le pasó al retrato que dejaron los Ochoa?',
  'A) Se lo llevó el viento',
  'B) Lo borró el sol',
  'C) Lo recogió Remedios',
  'D) Se quemó en el incendio',
  'Respuesta: B',
  '',
  '## Completar',
  '1. El retrato se quedó mirando la puerta ___ años.',
  'Respuesta: muchos',
  '2. El agua corría muy abajo, donde ya no llega ninguna ___ . (cuerda)',
  '',
  '## Pregunta abierta',
  '1. ¿Qué quiere decir que el sol borrara el retrato?',
  'Pauta: el olvido del pueblo, que no necesita a nadie que lo empuje.',
].join('\n');

let _vozActPegandoEn = null;   // cid del texto al que se le pegan
let _vozActPegado = null;      // lo último que entendió el lector

function vozActAbrirPegar(cid) {
  /* ⚠️ LA HOJA VIVE DENTRO DEL TALLER, ASÍ QUE CON EL TALLER CERRADO NO
     SE VE. Cuelga ahí a propósito —para teñirse con el papel y para no
     quedar por debajo de sus 3300 de z-index—, y el precio es este: si
     alguien la abriera desde el anaquel, el botón respondería, la hoja
     se abriría y la pantalla no cambiaría. Un fallo que no da error y
     se lee como «el botón está muerto». En vez de escribir la regla en
     un comentario y confiar, se abre el taller primero: la trampa deja
     de poder existir. Lo cazó la sonda, no la lectura del código. */
  const taller = document.getElementById('voz-act-overlay');
  if (taller && taller.hidden) vozActAbrirTaller(cid);
  _vozActPegandoEn = cid;
  _vozActPegado = null;
  const ov = document.getElementById('voz-act-pegar-overlay');
  const ta = document.getElementById('voz-act-pegar-txt');
  const c = _vozCuentos.find(x => x.cid === cid);
  if (!ov || !ta) return;
  ta.value = '';
  const tit = document.getElementById('voz-act-pegar-tit');
  if (tit) tit.textContent = '📝 Actividades de «' + ((c && c.titulo) || 'el texto') + '»';
  const sug = document.getElementById('voz-act-sugerencia');
  if (sug) {
    /* Lo que hay que pedirle a la máquina, listo para copiar: sin esta
       frase, la primera tanda vuelve con cinco formatos distintos. */
    sug.textContent = 'Pídeselo así a la máquina que escribió el texto: «De este texto hazme actividades de '
      + 'comprensión: 6 tarjetas de memoria (dato :: significado), 4 parejas para emparejar (a → b), '
      + '5 preguntas de selección con cuatro opciones y la correcta marcada con ✅, 4 de completar con ___ '
      + 'y su Respuesta:, y 2 abiertas con su Pauta:. Incluye fechas, nombres y referencias.»';
  }
  vozActRepasar();
  ov.style.display = 'flex';
  setTimeout(() => { try { ta.focus(); } catch (e) {} }, 60);
}

function vozActCerrarPegar() {
  const ov = document.getElementById('voz-act-pegar-overlay');
  if (ov) ov.style.display = 'none';
  _vozActPegandoEn = null;
  _vozActPegado = null;
}

function vozActRepasar() {
  const ta = document.getElementById('voz-act-pegar-txt');
  const caja = document.getElementById('voz-act-repaso');
  if (!ta || !caja) return;
  caja.textContent = '';
  const txt = ta.value.trim();
  if (!txt) {
    caja.appendChild(vozNodo('p', 'voz-rep-vacio',
      'Pega aquí las actividades. Se entienden tal como las escribe una máquina: con sus títulos de sección, '
      + 'sus números, sus A) B) C) D) y sus ✅.'));
    _vozActPegado = null;
    vozActPintarBotonGuardar();
    return;
  }
  const r = vozActLeer(txt);
  _vozActPegado = r;

  const linea = vozNodo('div', 'voz-rep-linea');
  VOZ_ACT_TIPOS.forEach(t => {
    if (!r.cuenta[t.id]) return;
    linea.appendChild(vozNodo('span', 'voz-rep-dato', t.ic + ' ' + r.cuenta[t.id] + ' ' + t.pl));
  });
  if (!r.items.length) linea.appendChild(vozNodo('span', 'voz-rep-dato', '— no se entendió ninguna todavía'));
  caja.appendChild(linea);

  /* ⚠️ LAS QUE NO PUEDEN CORREGIRSE SE NOMBRAN, UNA POR UNA, Y PARAN
     EL GUARDADO. Es la regla que no se negocia del quiz de Videos
     M.E.T.A.S: una pregunta de selección sin respuesta marcada no se
     guarda en silencio, porque guardarla es publicar un examen que no
     se puede aprobar y no enterarse hasta que alguien lo hace. */
  if (r.sinCorrecta.length || r.sinRespuesta.length) {
    const av = vozNodo('div', 'voz-rep-avisos voz-rep-para');
    av.appendChild(vozNodo('div', 'voz-rep-avisos-t',
      '⚠️ Falta decir cuál es la respuesta en ' + (r.sinCorrecta.length + r.sinRespuesta.length)
      + (r.sinCorrecta.length + r.sinRespuesta.length === 1 ? ' actividad:' : ' actividades:')));
    r.sinCorrecta.forEach(it => av.appendChild(vozNodo('div', 'voz-rep-aviso',
      '🔘 «' + String(it.q).slice(0, 56) + '» — marca la buena con ✅ o escribe «Respuesta: B»')));
    r.sinRespuesta.forEach(it => av.appendChild(vozNodo('div', 'voz-rep-aviso',
      '✏️ «' + String(it.q).slice(0, 56) + '» — escribe debajo «Respuesta: …»')));
    av.appendChild(vozNodo('div', 'voz-rep-aviso voz-rep-aviso-por',
      'No se marca ninguna a ojo: acertaría una de cada cuatro veces, y un examen con la respuesta cambiada '
      + 'no lo descubre nadie hasta que alguien acierta y la pantalla le dice que falló.'));
    caja.appendChild(av);
  }

  if (r.avisos.length) {
    const av = vozNodo('div', 'voz-rep-avisos');
    av.appendChild(vozNodo('div', 'voz-rep-avisos-t', 'Estos renglones no se entendieron y se quedaron fuera:'));
    r.avisos.slice(0, 8).forEach(a => av.appendChild(vozNodo('div', 'voz-rep-aviso', 'Renglón ' + a.n + ': ' + a.t)));
    caja.appendChild(av);
  }

  if (r.items.length) {
    const lista = vozNodo('div', 'voz-rep-caps');
    r.items.slice(0, 40).forEach((it, n) => {
      const f = vozNodo('div', 'voz-rep-cap');
      f.appendChild(vozNodo('span', 'voz-rep-cap-n', String(n + 1)));
      const t = vozActTipo(it.k);
      f.appendChild(vozNodo('span', 'voz-rep-cap-t',
        t.ic + ' ' + String(it.k === 'flash' ? it.f : (it.k === 'pares' ? it.q : it.q) || '').replace(/\n/g, ' ').slice(0, 70)));
      f.appendChild(vozNodo('span', 'voz-rep-cap-p',
        it.k === 'opcion' ? (it.ok >= 0 ? 'ABCDEF'[it.ok] : '⚠️') : (it.k === 'pares' ? it.ps.length + ' pares' : '')));
      lista.appendChild(f);
    });
    caja.appendChild(lista);
  }
  vozActPintarBotonGuardar();
}

function vozActPintarBotonGuardar() {
  const b = document.getElementById('voz-act-guardar-btn');
  if (!b) return;
  const r = _vozActPegado;
  const para = r && (r.sinCorrecta.length || r.sinRespuesta.length);
  b.disabled = !r || !r.items.length || !!para;
  b.textContent = !r || !r.items.length ? '📝 Guardar las actividades'
    : (para ? '⚠️ Falta decir cuál es la respuesta'
      : '📝 Guardar ' + r.items.length + (r.items.length === 1 ? ' actividad' : ' actividades'));
}

function vozActGuardarPegado() {
  const r = _vozActPegado;
  const cid = _vozActPegandoEn;
  if (!r || !r.items.length || !cid) return;
  if (r.sinCorrecta.length || r.sinRespuesta.length) { vozActPintarBotonGuardar(); return; }
  /* Se AÑADEN a lo que ya hubiera, no se pisa: quien pega una segunda
     tanda está ampliando el taller, no rehaciéndolo. Para vaciarlo
     está su botón. */
  const antes = vozActDe(cid).items || [];
  vozActGuardarFicha(cid, antes.concat(r.items));
  vozActCerrarPegar();
  vozActPintarTaller();
  vozAviso('📝 ' + r.items.length + (r.items.length === 1 ? ' actividad guardada' : ' actividades guardadas'));
}

/* La ayuda: la lista de formas sale de VOZ_ACT_TIPOS y de las
   cabeceras de verdad, nunca escrita a mano en el HTML —una copia
   estaría equivocada el día que alguien añada una palabra, y quien la
   lea se fiará—. Misma regla que VOZ_ETIQUETAS y ROD_ETIQUETAS. */
function vozActAbrirAyuda() {
  const ov = document.getElementById('voz-act-ayuda-overlay');
  const caja = document.getElementById('voz-act-ayuda-cuerpo');
  if (!ov || !caja) return;
  caja.textContent = '';
  caja.appendChild(vozNodo('p', 'voz-ayuda-nota',
    'Se pega tal como venga. Los títulos de sección dicen de qué tipo es lo que viene debajo, '
    + 'y si no hay títulos se reconoce por la forma.'));
  const ejemplos = {
    flash: 'dato :: lo que significa',
    pares: 'una cosa → su pareja',
    opcion: '1. ¿Pregunta?  ·  A) … B) … ✅  ·  o «Respuesta: B»',
    completar: '1. La frase con su ___ .  ·  «Respuesta: …» o «(…)» al final',
    abierta: '1. ¿Pregunta abierta?  ·  «Pauta: …»',
  };
  VOZ_ACT_TIPOS.forEach(t => {
    const f = vozNodo('div', 'voz-ayuda-fila');
    f.appendChild(vozNodo('div', 'voz-ayuda-campo', t.ic + ' ' + t.t));
    const d = vozNodo('div', 'voz-ayuda-claves');
    d.appendChild(vozNodo('div', 'voz-ayuda-forma', ejemplos[t.id]));
    d.appendChild(vozNodo('div', 'voz-ayuda-cab', 'Títulos que lo abren: ' + vozActPalabrasDe(t.id)));
    f.appendChild(d);
    caja.appendChild(f);
  });
  caja.appendChild(vozNodo('p', 'voz-ayuda-nota',
    '⚠️ Si el texto no dice cuál es la respuesta correcta, no se marca ninguna y el guardado se para '
    + 'nombrando cuál falta. Marcarla a ojo acertaría una de cada cuatro veces.'));
  caja.appendChild(vozNodo('p', 'voz-ayuda-nota',
    'Lo que no se entiende se queda fuera y se dice con su número de renglón: nunca se coloca a la fuerza '
    + 'en el sitio equivocado, que es donde ya no se ve que está mal.'));
  ov.style.display = 'flex';
}

/* Las palabras de cada cabecera, sacadas de la propia tabla que usa el
   lector: si se cambia la tabla, la ayuda cambia sola. */
function vozActPalabrasDe(modo) {
  const fila = VOZ_ACT_CABECERAS.find(f => f[1] === modo);
  if (!fila) return '—';
  return String(fila[0]).replace(/^\/|\/$/g, '').split('|')
    .map(s => s.replace(/[\\^$.*+?()[\]{}]/g, '').replace(/\s\(\?:.*$/, '').trim())
    .filter(Boolean).slice(0, 6).join(', ') + '…';
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
  /* El botón de retirar de la hoja de corregir lo pinta vozAbrirPegar,
     porque tiene que saber de qué texto es. */
  on('voz-ayuda-btn', 'click', vozAbrirAyuda);
  on('voz-ayuda-cerrar', 'click', () => {
    const ov = document.getElementById('voz-ayuda-overlay');
    if (ov) ov.style.display = 'none';
  });
  on('voz-menu-cerrar', 'click', vozCerrarMenu);
  on('voz-act-cerrar', 'click', vozActCerrarTaller);
  on('voz-act-pegar-cerrar', 'click', vozActCerrarPegar);
  on('voz-act-guardar-btn', 'click', vozActGuardarPegado);
  on('voz-act-ayuda-btn', 'click', vozActAbrirAyuda);
  on('voz-act-ayuda-cerrar', 'click', () => {
    const ov = document.getElementById('voz-act-ayuda-overlay');
    if (ov) ov.style.display = 'none';
  });
  on('voz-act-ejemplo-btn', 'click', () => {
    const ta = document.getElementById('voz-act-pegar-txt');
    if (!ta) return;
    ta.value = VOZ_ACT_EJEMPLO;
    vozActRepasar();
  });
  let tActRep = null;
  on('voz-act-pegar-txt', 'input', () => {
    clearTimeout(tActRep);
    tActRep = setTimeout(vozActRepasar, 220);
  });
  on('voz-anaq-cerrar', 'click', vozCerrarHoja);
  on('voz-abre-aqui', 'click', vozAlternarAbreAqui);
  on('voz-anaq-overlay', 'click', e => { if (e.target.id === 'voz-anaq-overlay') vozCerrarHoja(); });
  /* ⚠️ EL TOQUE SE ATRAPA EN LA CAPTURA. Eligiendo, una tarjeta no abre
     nada: se marca. Si se dejara llegar al botón de leer o al menú, el
     primer toque abriría el lector y la selección se perdería. */
  const lista = document.getElementById('voz-lista');
  if (lista) {
    lista.addEventListener('click', e => {
      if (!vozSelActiva()) return;
      const el = e.target && e.target.closest ? e.target.closest('[data-voz-cid]') : null;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      vozSelAlterna(el.getAttribute('data-voz-cid'));
    }, true);
  }
  /* Tocar fuera de la hoja del menú la cierra, como las demás de la
     casa; dentro, no. */
  on('voz-menu-overlay', 'click', e => { if (e.target.id === 'voz-menu-overlay') vozCerrarMenu(); });
  on('voz-ejemplo-btn', 'click', () => {
    const ta = document.getElementById('voz-pegar-txt');
    if (!ta) return;
    ta.value = VOZ_EJEMPLO;
    _vozAuto = {}; _vozGeneroTocado = false; _vozVersosTocado = false;
    ['voz-f-titulo', 'voz-f-voz', 'voz-f-maquina', 'voz-f-encargo']
      .forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
    vozRepasar();
  });
  let tFuentes = null;
  on('voz-f-versos', 'change', () => { _vozVersosTocado = true; vozRepasar(); });
  /* Escribiendo a mano, el chip que coincida se marca solo: así se ve
     que eso mismo ya se había usado antes, que es la mitad de lo que
     estos chips existen para evitar (dos maneras de escribir lo mismo). */
  ['voz-f-voz', 'voz-f-maquina'].forEach(id => on(id, 'input', () => { vozPintarChipsFicha(); vozPintarBotonGuardar(); }));
  /* El botón toca el selector del aparato, que es quien ofrece Drive,
     OneDrive y la carpeta de descargas. Y se vacía después de cada uno,
     para que adjuntar DOS VECES EL MISMO archivo vuelva a avisar: sin
     eso, el segundo toque no dispara nada y parece que se rompió. */
  on('voz-adjuntar-btn', 'click', () => {
    const inp = document.getElementById('voz-f-archivo');
    if (!inp) return;
    if (!vozAdjuntoHay()) {
      vozAdjDecir('El lector de archivos no cargó en este aparato. Pega el texto a mano en el recuadro y funciona igual.', true);
      return;
    }
    inp.click();
  });
  on('voz-f-archivo', 'change', async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    await vozAdjuntar(f);
  });
  on('voz-f-fuentes', 'input', () => { clearTimeout(tFuentes); tFuentes = setTimeout(vozRepasar, 220); });
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
  on('voz-l-full', 'click', vozPantallaCompletaDirecta);
  on('voz-ant', 'click', () => vozPasar(-1));
  on('voz-sig', 'click', () => vozPasar(1));
});
