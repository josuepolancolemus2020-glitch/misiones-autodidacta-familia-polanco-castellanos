'use strict';

/* ─────────────────────────────────────────────
   LA VOZ PRESTADA 📖 · el lector de los cuentos de encargo
   ─────────────────────────────────────────────
   PARA QUÉ: el autor le pide a una máquina un cuento «al modo de» un
   escritor —la frase corta de uno, la enumeración de otro, el narrador
   que no se fía de sí mismo— y lo que recibe es un muro de texto dentro
   de una ventana de chat. Un cuento leído así no se lee: se ojea. Se
   pierde el sitio en cuanto se cierra la aplicación, no hay forma de
   saber cuánto falta, y a los tres días ni se encuentra.

   Esta herramienta hace dos cosas y ninguna más: guarda esos cuentos y
   los deja leer como se lee un libro —en páginas, con el tamaño de
   letra que a uno le sirve, en el color que aguanta de noche, y
   volviendo justo a donde se dejó—.

   ⚠️ Y HACE UNA TERCERA QUE NO SE NEGOCIA: NO DEJA QUE SE OLVIDE QUIÉN
   LO ESCRIBIÓ. Un cuento escrito por una máquina imitando la voz de
   Rulfo NO ES DE RULFO, y a los seis meses, leído en una tableta y sin
   la ventana del chat alrededor, no hay absolutamente nada que lo
   distinga de uno que sí lo fuera. Así nace una atribución falsa: sin
   mala fe, por olvido. Por eso la voz imitada y la máquina que escribió
   viajan PEGADAS al cuento —en la ficha del anaquel, en la portada, en
   el pie de cada página y dentro de lo que copia el botón de copiar—, y
   por eso la propia herramienta se llama así. El nombre es el recordatorio.

   Es la misma regla de oro del Estudio Mayor («ninguna fuente entra sin
   su etiqueta») y la misma de la repisa de enlaces («lo que hace la
   máquina va etiquetado»), aplicada donde más falta hace: aquí el
   material NO es un resumen de repaso que se nota automático a la
   tercera línea, es prosa que imita a un escritor a propósito y lo hace
   bien. Cuanto mejor le sale, más falta hace la etiqueta.

   DE QUIÉN SON LOS CUENTOS: de la casa, como El Rodaje y como la repisa
   de enlaces. Los cuatro leen todos; corregir y retirar es solo de quien
   lo puso, y eso lo hace cumplir la seguridad por fila, no la pantalla.

   DÓNDE ESTÁ CADA COSA:
     · la tabla, en `supabase/sql/voz_prestada.sql` (se pega a mano);
     · el estilo, en `css/voz-prestada.css`;
     · la sonda, en `_dev/probe-voz-prestada.html`.
───────────────────────────────────────────── */

const VOZ_TABLE = 'voz_prestada';

/* Las tres llaves del aparato, y son tres a propósito:

   · LOS CUENTOS (VOZ_LOCAL) son la copia de aquí, para que el anaquel
     se pinte al instante y para que la herramienta funcione entera
     antes de que nadie haya corrido el SQL. Lo mismo que la repisa.
   · LOS AJUSTES (VOZ_AJUSTES) son del APARATO y globales: el tamaño de
     letra es una costumbre de unos ojos y de una pantalla, no del
     cuento. Subirla a la nube le cambiaría la letra en la cara a quien
     lee en otro sitio. Misma razón que la llave de la hoja fijada de
     Finanzas.
   · LA POSICIÓN (VOZ_POS) también es del aparato, y esta es la que
     parece que debería viajar y NO debe: en esta casa el mismo cuento lo
     leen cuatro personas. Una posición común significa que la hija
     abre el cuento por donde iba el padre, y el marcador de los dos se
     pierde a la vez. Se guarda por cuento y por aparato. */
const VOZ_LOCAL   = 'faro_voz_cuentos_v1';
const VOZ_AJUSTES = 'faro_voz_ajustes_v1';
const VOZ_POS     = 'faro_voz_posicion_v1';

/* ⚠️ 230 PALABRAS POR MINUTO, Y NO SON LAS 150 DE EL RODAJE.
   Ahí se mide un guion que se dice EN VOZ ALTA delante de una cámara;
   aquí se mide un cuento que se lee CON LOS OJOS y en silencio, que va
   casi medio más rápido (la horquilla habitual en español ronda las
   200-250). Está escrito para que nadie iguale los dos números creyendo
   que uno de los dos estaba mal copiado. */
const VOZ_PPM = 230;

/* Los tres colores de la sala. No es una manía: un cuento se lee de
   noche y en la cama, que es cuando una pantalla blanca deslumbra, y se
   lee también a mediodía en un patio, que es cuando el gris no se ve.
   El nombre va en palabras además del color porque el botón se toca a
   oscuras. */
const VOZ_TEMAS = [
  { id: 'papel', ic: '📄', t: 'Papel' },
  { id: 'sepia', ic: '🕯️', t: 'Sepia' },
  { id: 'noche', ic: '🌙', t: 'Noche' },
];

const VOZ_LETRAS = [
  { id: 'serif',  t: 'Serif',     css: 'Georgia, "Times New Roman", serif' },
  { id: 'sans',   t: 'Sans',      css: '"Outfit", system-ui, sans-serif' },
  /* La tercera no es un capricho tipográfico: las letras con la «d» y la
     «b» distintas y el espaciado ancho son las que se recomiendan para
     quien lee con dificultad, y en esta casa hay quien está aprendiendo
     a leer. Se usa la del sistema si no hay otra. */
  { id: 'ancha',  t: 'Espaciada', css: '"Nunito", Verdana, system-ui, sans-serif' },
];

const VOZ_AJUSTES_POR_DEFECTO = {
  tema: 'papel', letra: 'serif', tam: 19, alto: 1.65, margen: 22, just: true,
};

let _vozCuentos = [];      // el anaquel, ya fusionado (aparato + nube)
let _vozHayTabla = true;   // ¿se corrió ya el SQL en esta base?
let _vozEstadoNube = 'mirando'; // mirando | puesta | sin-tabla | sin-senal | sin-sesion
let _vozFiltroVoz = '';    // '' = todas las voces
let _vozBusca = '';
let _vozLeyendo = null;    // el cuento abierto en la sala
let _vozCapActual = 0;
let _vozPagina = 0;
let _vozPaginas = 1;
let _vozAj = Object.assign({}, VOZ_AJUSTES_POR_DEFECTO);
let _vozPegado = null;     // lo último que entendió el lector de texto
let _vozEditando = null;   // cid del cuento que se está corrigiendo

/* ══════════════ COSAS PEQUEÑAS ══════════════ */

/* El identificador NACE EN EL APARATO, no en la base. Es la misma regla
   que el `vid` de los videos de M.E.T.A.S y por lo mismo: el guardado se
   reintenta cuando la señal falla, y sin un identificador propio el
   segundo intento dejaría un cuento gemelo en el anaquel. */
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

function vozGuardaPos(cid, cap, ancla) {
  try {
    const m = JSON.parse(localStorage.getItem(VOZ_POS) || '{}') || {};
    m[cid] = { cap: cap, ancla: ancla, cuando: Date.now() };
    localStorage.setItem(VOZ_POS, JSON.stringify(m));
  } catch (e) {}
}

/* Un nodo con su texto dentro, en una línea. En este archivo NO se
   escribe HTML con datos: ni con innerHTML, ni con insertAdjacentHTML,
   ni interpolando en un atributo. El cuerpo de un cuento es el texto
   más largo que entra en toda la aplicación y entra PEGADO desde otra
   ventana; F.A.R.O tiene dentro la Bóveda, las finanzas, el chat y los
   teléfonos del Buzón del lector. Un `innerHTML` aquí para pintar una
   cursiva sería la puerta más ancha de la casa por el motivo más tonto. */
function vozNodo(tag, clase, texto) {
  const n = document.createElement(tag);
  if (clase) n.className = clase;
  if (texto != null) n.textContent = texto;
  return n;
}

function vozPalabras(caps) {
  let n = 0;
  (caps || []).forEach(c => (c.p || []).forEach(p => {
    if (p.t) n += p.t.split(/\s+/).filter(Boolean).length;
  }));
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

/* ══════════════════════════════════════════════════════════════════
   EL LECTOR DE TEXTO PEGADO
   ══════════════════════════════════════════════════════════════════
   ⚠️ EL CUENTO SE PEGA DE GOLPE, NO SE ESCRIBE CAMPO POR CAMPO.
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
       equivocarse hacia «esto es un título» PARTE EL CUENTO.

   Lo primero se arregla leyendo (el cuento se lee igual de bien de
   corrido). Lo segundo mete un salto de página en mitad de una frase.
   Así que ante la duda, prosa: SIEMPRE. Una línea pelada solo asciende
   a cabecera si se corrobora de una de tres maneras —la palabra
   «Capítulo» con su número, un número o romano a solas, o mayúsculas
   de rótulo—, y en las tres tiene que estar sola entre blancos. */

/* Las etiquetas de la cabecera del pegado. La lista vive AQUÍ y la
   ventana de ayuda la pinta leyendo de esta constante, nunca escrita a
   mano en el HTML: una lista copiada estaría equivocada el día que
   alguien añada una palabra, y quien la lea se fiará (misma regla que
   las materias de Videos M.E.T.A.S). La sonda la comprueba palabra por
   palabra. */
const VOZ_ETIQUETAS = {
  'titulo': 'titulo', 'title': 'titulo', 'nombre': 'titulo',
  'voz': 'voz', 'al modo de': 'voz', 'a la manera de': 'voz',
  'al estilo de': 'voz', 'estilo de': 'voz', 'en la voz de': 'voz',
  'voz prestada de': 'voz', 'imitando a': 'voz', 'autor imitado': 'voz',
  'maquina': 'maquina', 'ia': 'maquina', 'modelo': 'maquina',
  'escrito por': 'maquina', 'redactado por': 'maquina', 'herramienta': 'maquina',
  'encargo': 'encargo', 'prompt': 'encargo', 'pedido': 'encargo',
  'peticion': 'encargo', 'consigna': 'encargo', 'instruccion': 'encargo',
  'nota': 'nota', 'notas': 'nota',
};

/* Los rótulos del campo, para pintar la ayuda desde la constante. */
const VOZ_CAMPOS = {
  titulo: 'El título', voz: 'La voz que se imita',
  maquina: 'La máquina que lo escribió', encargo: 'Lo que se le pidió',
  nota: 'Una nota tuya',
};

function vozSinTildes(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
}

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
  s = s.replace(/^[>•·]\s+/, '');
  s = s.replace(/^([*_]{1,3})([\s\S]*?)\1$/, '$2').trim();
  s = s.replace(/^([*_]{1,3})/, '').replace(/([*_]{1,3})$/, '').trim();
  return s;
}

/* Un renglón de solo adornos es un salto de escena («* * *», «···»,
   «---»), que en un cuento no es decoración: es una elipsis de tiempo y
   se tiene que ver como tal. */
function vozEsSeparador(l) {
  const s = String(l).trim();
  if (!s) return false;
  return /^[\s*·•—–\-_=~#.…]+$/.test(s) && /[*·•—–\-_=~#.…]/.test(s);
}

const VOZ_PAL_CAP = new RegExp(
  '^(cap[íi]tulo|parte|acto|libro|secci[óo]n|pr[óo]logo|ep[íi]logo|' +
  'introducci[óo]n|coda|interludio)\\b\\s*' +
  '(?:[IVXLCDM]+|\\d+|primer[ao]?|segund[ao]|tercer[ao]?|cuart[ao]|quint[ao]|sext[ao]|' +
  's[ée]ptim[ao]|octav[ao]|noven[ao]|d[ée]cim[ao]|[úu]ltim[ao])?\\s*' +
  '(?:[:.\\-–—]\\s*.{0,60})?$', 'i');

const VOZ_ROMANO = /^[IVXLCDM]{1,8}\s*[.\-–—]?$/;
const VOZ_NUMERO = /^\d{1,3}\s*[.\-–—]?$/;

/* ¿Esta línea pelada es una cabecera? Solo si se corrobora. Ver la
   asimetría escrita arriba: ante la duda, `false`. */
function vozCabeceraPelada(l, sola) {
  const s = vozDesnuda(l);
  if (!s || s.length > 80) return false;
  if (/^[—–-]\s/.test(String(l).trim())) return false; // raya de diálogo: jamás
  if (VOZ_PAL_CAP.test(s)) return true;
  if (!sola) return false;
  if (VOZ_ROMANO.test(s) || VOZ_NUMERO.test(s)) return true;
  /* Mayúsculas de rótulo: así se escribe una cabecera y así no se
     escribe la prosa. Se compara con el mayúsculas del español para que
     una «ñ» o una vocal con tilde no cuenten como minúscula. */
  if (s.length <= 70 && /[A-ZÁÉÍÓÚÑ]/.test(s) &&
      s === s.toLocaleUpperCase('es') && /[A-Za-zÀ-ſ]{2}/.test(s)) return true;
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

function vozLeer(texto) {
  const out = { titulo: '', voz: '', maquina: '', encargo: '', nota: '',
                capitulos: [], avisos: [] };
  const lineas = String(texto || '').replace(/\r\n?/g, '\n').split('\n');
  let cap = null, buf = [], frente = true;

  const cierra = () => {
    if (!buf.length) return;
    if (!cap) cap = { t: '', p: [] };
    cap.p.push({ k: 'p', t: buf.join(' ').replace(/\s+/g, ' ').trim() });
    buf = [];
    frente = false; // la cabecera del pegado termina en la primera prosa
  };
  const abreCap = (t) => {
    cierra();
    if (cap) out.capitulos.push(cap);
    cap = { t: String(t || '').trim(), p: [] };
  };
  const marca = (p) => { cierra(); if (!cap) cap = { t: '', p: [] }; cap.p.push(p); };

  for (let i = 0; i < lineas.length; i++) {
    const cruda = lineas[i];
    const l = cruda.trim();
    const sola = (i === 0 || !lineas[i - 1].trim()) &&
                 (i === lineas.length - 1 || !(lineas[i + 1] || '').trim());

    if (!l) { cierra(); continue; }

    if (vozEsSeparador(l)) { marca({ k: 'sep' }); continue; }

    /* 1. Las almohadillas son inequívocas: no hay forma de que una
          etiqueta ni una frase empiecen por «# ». */
    const alm = l.match(/^(#{1,6})\s+(.+)$/);
    if (alm) {
      const t = vozDesnuda(alm[2]);
      if (alm[1].length === 1 && !out.titulo && !out.capitulos.length && !(cap && cap.p.length)) {
        out.titulo = t;            // el primer «# » es el título del cuento
      } else {
        abreCap(t);
      }
      continue;
    }

    /* 2. ⚠️ LAS ETIQUETAS SE MIRAN ANTES QUE LAS CABECERAS PELADAS.
          Al revés, «Nota: se escribió de un tirón» —que es como se
          escribe sin acordarse de nada— caería en la rama de las
          mayúsculas o de la palabra de capítulo y abriría un capítulo
          fantasma. Misma lección que las directivas de El Rodaje. */
    if (frente) {
      const desnuda = vozDesnuda(l);
      const clave = vozClaveEtiqueta(desnuda);
      const campo = clave && VOZ_ETIQUETAS[clave];
      if (campo) {
        /* El adorno también se le quita al VALOR, no solo a la clave:
           una máquina escribe «**Voz:** Rulfo» y con los asteriscos
           dentro la voz del anaquel diría «** Rulfo». */
        const valor = desnuda.slice(desnuda.indexOf(':') + 1).trim()
          .replace(/^[*_]{1,3}\s*/, '').replace(/\s*[*_]{1,3}$/, '')
          .replace(/^[«"'“]|[»"'”]$/g, '').trim();
        if (valor && !out[campo]) out[campo] = valor;
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

      /* ⚠️ Y LO QUE INTENTABA SER UNA ETIQUETA Y NO SE ENTENDIÓ SE
         NOMBRA, con su renglón y sin moverlo de sitio. Se queda en la
         prosa —que es lo correcto— pero callarse se ve desde fuera
         igual que un rechazo. Solo se marca lo que de verdad lo
         intentaba (rótulo en mayúsculas con dos puntos): si no, «Su
         mandamiento fue claro: no mires atrás» saldría marcado y el
         aviso sería ruido. */
      if (/^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ ]{1,30}:/.test(desnuda)) {
        out.avisos.push({ linea: i + 1, txt: desnuda.slice(0, 60) });
      }
    }

    /* 3. Cabecera pelada, solo si se corrobora. */
    if (vozCabeceraPelada(l, sola)) {
      const t = vozDesnuda(l);
      if (!out.titulo && !out.capitulos.length && !(cap && cap.p.length) && !VOZ_PAL_CAP.test(t)) {
        out.titulo = t;            // la primera línea de rótulo, sin «#», es el título
      } else {
        abreCap(t);
      }
      continue;
    }

    /* 4. Prosa. ⚠️ Y una línea que empieza por raya ABRE PÁRRAFO aunque
          no venga un blanco delante: en español el diálogo se escribe
          así, renglón tras renglón y sin blancos en medio, y pegar dos
          rayas en un párrafo mete a dos personas hablando en la misma
          línea. Es el fallo que más se nota leyendo y el más fácil de
          producir juntando líneas a ciegas. */
    if (/^[—–]\s?/.test(l) && buf.length) cierra();
    buf.push(l);
  }
  cierra();
  if (cap) out.capitulos.push(cap);

  out.capitulos = out.capitulos.filter(c => (c.p || []).length || c.t);
  if (!out.capitulos.length) out.capitulos = [{ t: '', p: [] }];
  if (!out.titulo) {
    const prim = out.capitulos[0];
    out.titulo = (prim && prim.t) ? prim.t : 'Cuento sin título';
  }
  return out;
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

async function vozBajar() {
  const sb = vozSb();
  if (!sb) { _vozEstadoNube = 'sin-sesion'; return null; }
  const { data, error } = await vozConReloj(sb.from(VOZ_TABLE)
    .select('cid,titulo,voz,maquina,encargo,nota,capitulos,palabras,borrado,puesto_por,creado_at,actualizado')
    .order('actualizado', { ascending: false })
    .limit(400));

  if (error) {
    /* ⚠️ UN CORTE DE RED NO ES UNA TABLA QUE FALTA. El cliente de
       Supabase no lanza cuando la petición se cae: devuelve
       {data:null,error}. Sin mirar el código, un corte de señal
       mandaría al autor a pegar cuatrocientas líneas de SQL en una base
       que ya las tiene. 42P01 es «la relación no existe»; lo demás es
       la señal. Es la lección 14 de El Rodaje. */
    if (error.code === '42P01' || /does not exist/i.test(error.message || '')) {
      _vozHayTabla = false; _vozEstadoNube = 'sin-tabla';
    } else {
      _vozEstadoNube = 'sin-senal';
    }
    return null;
  }
  _vozHayTabla = true; _vozEstadoNube = 'puesta';
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
  const { error } = await vozConReloj(sb.from(VOZ_TABLE).upsert(fila, { onConflict: 'cid' }));
  if (error) {
    /* Se distinguen tres motivos porque los tres se arreglan de manera
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
  if (_vozEstadoNube === 'puesta')    return { ic: '☁️', t: 'Los cuentos viajan a todos los aparatos de la casa', cls: 'voz-nube-ok' };
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
     pantalla diría «todavía no hay cuentos» con un botón que invita a
     PEGAR: o sea que el camino natural después de una mala señal sería
     pegar encima los cuentos que ya estaban. Lección 14 de El Rodaje. */
  if (nube) {
    _vozCuentos = vozFusiona(vozLeeLocal(), nube);
    vozGuardaLocal();
    vozRender();
    /* Y lo que se guardó sin señal sube AHORA. Ver vozSubirPendientes. */
    const subidos = await vozSubirPendientes(nube);
    if (subidos && typeof showToast === 'function') {
      showToast('☁️ ' + subidos + (subidos === 1 ? ' cuento que faltaba ya subió' : ' cuentos que faltaban ya subieron'));
    }
  }
  vozRender();
}

/* ══════════════════════════════════════════════════════════════════
   EL ANAQUEL
   ══════════════════════════════════════════════════════════════════ */

/* El lomo del libro se pinta con un color sacado de la VOZ, no del
   título ni al azar: así todos los cuentos «al modo de» el mismo
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

function vozVisibles() {
  const q = vozSinTildes(_vozBusca).toLowerCase().trim();
  return _vozCuentos.filter(c => {
    if (_vozFiltroVoz && (c.voz || '') !== _vozFiltroVoz) return false;
    if (!q) return true;
    const heno = vozSinTildes([c.titulo, c.voz, c.maquina, c.encargo, c.nota]
      .filter(Boolean).join(' ')).toLowerCase();
    return heno.includes(q);
  });
}

/* Cuánto se lleva leído, para la barra de la ficha. Sale de la posición
   guardada en ESTE aparato, que es de donde tiene que salir: ver la
   nota de las tres llaves, arriba. */
function vozAvance(c) {
  const pos = vozLeePos(c.cid);
  if (!pos) return 0;
  const total = (c.capitulos || []).reduce((n, x) => n + (x.p || []).length, 0) || 1;
  let antes = 0;
  for (let i = 0; i < (pos.cap || 0) && i < (c.capitulos || []).length; i++) {
    antes += (c.capitulos[i].p || []).length;
  }
  return Math.max(0, Math.min(100, Math.round(((antes + (pos.ancla || 0)) / total) * 100)));
}

function vozRender() {
  const cont = document.getElementById('voz-lista');
  if (!cont) return;

  /* La barra de estado de la nube. Va SIEMPRE a la vista, también
     cuando todo va bien: si solo apareciera cuando algo falla, nadie
     sabría nunca si sus cuentos están de verdad en los dos aparatos. */
  const est = document.getElementById('voz-nube');
  if (est) {
    const r = vozRotuloNube();
    est.className = 'voz-nube ' + r.cls;
    est.textContent = '';
    est.appendChild(vozNodo('span', 'voz-nube-ic', r.ic));
    est.appendChild(vozNodo('span', null, r.t));
  }

  // Los chips de voz, sacados de los cuentos y nunca de una lista escrita aquí
  const chips = document.getElementById('voz-chips');
  if (chips) {
    chips.textContent = '';
    const voces = vozVoces();
    const pon = (id, txt, n) => {
      const b = vozNodo('button', 'voz-chip' + (_vozFiltroVoz === id ? ' voz-chip-on' : ''));
      b.type = 'button';
      b.appendChild(vozNodo('span', null, txt));
      if (n != null) b.appendChild(vozNodo('span', 'voz-chip-n', String(n)));
      b.addEventListener('click', () => {
        _vozFiltroVoz = id; vozRender();
        b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      });
      chips.appendChild(b);
    };
    pon('', 'Todas', _vozCuentos.length);
    voces.forEach(([v, n]) => pon(v, v, n));
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
    caja.appendChild(vozNodo('p', null, 'Ningún cuento con ese filtro.'));
    return caja;
  }
  const p1 = vozNodo('p', null);
  p1.appendChild(vozNodo('strong', null, 'El anaquel está vacío.'));
  caja.appendChild(p1);
  caja.appendChild(vozNodo('p', null,
    'Pídele el cuento a la máquina, cópialo entero y pégalo aquí con el botón «➕ Pegar un cuento». ' +
    'Lo reparte en capítulos solo y lo deja listo para leer en páginas.'));
  return caja;
}

function vozFicha(c) {
  const h = vozColor(c.voz);
  const card = vozNodo('article', 'voz-ficha');
  card.style.setProperty('--voz-h', String(h));

  const lomo = vozNodo('div', 'voz-lomo');
  lomo.appendChild(vozNodo('span', 'voz-lomo-ini', (c.titulo || '?').trim().charAt(0).toUpperCase()));
  card.appendChild(lomo);

  const cuerpo = vozNodo('div', 'voz-ficha-cuerpo');
  cuerpo.appendChild(vozNodo('h3', 'voz-ficha-tit', c.titulo || 'Sin título'));

  /* ⚠️ LA ETIQUETA. Va aquí, en la portada del anaquel, antes que
     ninguna otra cosa del cuento, y con las dos mitades: la voz que se
     imita y la máquina que escribió. Ver la cabecera del archivo. */
  const et = vozNodo('div', 'voz-etiqueta');
  et.appendChild(vozNodo('span', 'voz-et-voz', '🎭 al modo de ' + (c.voz || '—')));
  et.appendChild(vozNodo('span', 'voz-et-maq', '🤖 ' + (c.maquina || '—')));
  cuerpo.appendChild(et);

  const caps = (c.capitulos || []).length;
  const meta = vozNodo('div', 'voz-ficha-meta');
  meta.appendChild(vozNodo('span', null, caps > 1 ? caps + ' capítulos' : 'de un tirón'));
  meta.appendChild(vozNodo('span', null, (c.palabras || 0).toLocaleString('es-HN') + ' palabras'));
  meta.appendChild(vozNodo('span', null, '≈ ' + vozMinutos(c.palabras) + ' min de lectura'));
  cuerpo.appendChild(meta);

  const av = vozAvance(c);
  if (av > 0) {
    const barra = vozNodo('div', 'voz-avance');
    const dentro = vozNodo('div', 'voz-avance-in');
    dentro.style.width = av + '%';
    barra.appendChild(dentro);
    cuerpo.appendChild(barra);
    cuerpo.appendChild(vozNodo('span', 'voz-avance-txt',
      av >= 99 ? 'Leído' : 'Vas por el ' + av + ' %'));
  }

  const pie = vozNodo('div', 'voz-ficha-pie');
  const leer = vozNodo('button', 'voz-btn voz-btn-pri', av > 0 && av < 99 ? '📖 Seguir leyendo' : '📖 Leer');
  leer.type = 'button';
  leer.addEventListener('click', () => vozAbrirLector(c.cid));
  pie.appendChild(leer);

  const copiar = vozNodo('button', 'voz-btn', '📋');
  copiar.type = 'button';
  copiar.title = 'Copiar el cuento con su etiqueta';
  copiar.setAttribute('aria-label', 'Copiar el cuento con su etiqueta');
  copiar.addEventListener('click', () => vozCopiar(c));
  pie.appendChild(copiar);

  /* ⚠️ Corregir y retirar SOLO se ofrecen en lo propio. Lo impide de
     verdad la seguridad por fila, no esta línea; pero enseñar un botón
     que la base va a rechazar es prometer algo que no se puede hacer, y
     el que lo toca se queda pensando que la aplicación falló. */
  const mio = !c.puesto_por || !_vozYo || c.puesto_por === _vozYo;
  const edit = vozNodo('button', 'voz-btn', '✏️');
  edit.type = 'button';
  edit.disabled = !mio;
  edit.title = mio ? 'Corregir la ficha' : 'Lo puso otra persona de la casa';
  edit.setAttribute('aria-label', edit.title);
  if (mio) edit.addEventListener('click', () => vozAbrirPegar(c));
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
   alguien si termina el cuento antes de dormirse. Una barra de
   desplazamiento de dos milímetros no dice eso.

   Cómo funciona, para quien lo toque: la caja tiene alto fijo y el
   texto de dentro lleva `column-width` igual al ancho de la caja, así
   que el navegador reparte el texto en columnas del ancho exacto de la
   pantalla y se avanza moviendo `scrollLeft` de columna en columna. Es
   el mismo aparato que usan los lectores de epub, y es del navegador:
   no hay que medir renglones ni cortar palabras a mano.

   ⚠️ Y LA POSICIÓN SE GUARDA POR PÁRRAFO, NUNCA POR NÚMERO DE PÁGINA.
   Esta es la regla que no se negocia y la que parece de más. El número
   de páginas depende del tamaño de letra, del ancho de la pantalla y
   de si el aparato está de pie o acostado: guardar «iba por la página
   12» y volver con la letra un punto más grande deja al lector en otra
   frase, casi siempre varias páginas atrás o adelante. Y NO DA NINGÚN
   ERROR: la aplicación abre, la página existe, el texto es del mismo
   cuento. El fallo solo se nota leyendo un párrafo que no era, y para
   entonces ya se perdió el sitio de verdad. Se guarda el ÍNDICE DEL
   PÁRRAFO y la página se vuelve a calcular cada vez que se repagina.
   Es la misma familia de errores que el minuto guardado de El Rodaje:
   un número correcto que deja de serlo cuando cambia lo de al lado. */

const VOZ_HUECO = 40;   // el canal entre columnas, en píxeles

/* ⚠️ EL PÁRRAFO EN QUE VA LA LECTURA SE RECUERDA, NO SE MIDE AL
   REPAGINAR. Y esto no es una optimización: medirlo en el momento de
   repaginar da el párrafo EQUIVOCADO, siempre, porque para entonces la
   caja ya cambió —la letra ya es más grande, la tableta ya giró— y las
   posiciones que se leen son las nuevas mientras el desplazamiento
   todavía es el viejo. O sea que justo la función que existe para no
   perder el sitio sería la que lo pierde. Se apunta al pasar página,
   cuando las dos cosas concuerdan, y se usa lo apuntado. */
let _vozAncla = 0;
let _vozRepagTimer = null;
let _vozArrastre = null;
let _vozTragarClic = false;

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

  sala.hidden = false;
  document.body.classList.add('voz-sala');
  vozAplicaAjustes();
  vozPintarCap(_vozAncla);   // −1 al abrir un cuento nuevo: la portada
  vozEngancharSala();
}

function vozCerrarLector() {
  const sala = document.getElementById('voz-lector');
  if (sala) sala.hidden = true;
  document.body.classList.remove('voz-sala');
  vozCerrarPaneles();
  _vozLeyendo = null;
  vozRender();   // para que la barra de avance de la ficha se refresque
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
}

function vozPintarCap(ancla) {
  const c = _vozLeyendo;
  const hoja = document.getElementById('voz-hoja');
  const texto = document.getElementById('voz-texto');
  if (!c || !hoja || !texto) return;
  const cap = (c.capitulos || [])[_vozCapActual] || { t: '', p: [] };

  texto.textContent = '';

  /* ⚠️ LA PORTADA ES LA PRIMERA PÁGINA DE TODO CUENTO, Y LLEVA LA
     ETIQUETA. No es una pantalla de bienvenida que se pueda quitar para
     ganar una página: es el sitio donde dice, en grande y antes que el
     texto, que esto lo escribió una máquina imitando a alguien. Ver la
     cabecera del archivo. */
  if (_vozCapActual === 0) {
    const port = vozNodo('div', 'voz-portada');
    /* ⚠️ LA PORTADA ES UNA POSICIÓN DE LECTURA MÁS, LA −1, y sin esto no
       la ve nadie: al abrir un cuento nuevo la lectura se coloca en el
       párrafo 0, que está en la página SIGUIENTE, así que la portada
       —que es donde dice en grande que esto lo escribió una máquina
       imitando a alguien— se saltaba entera y en silencio. */
    port.dataset.vp = '-1';
    port.appendChild(vozNodo('div', 'voz-portada-tit', c.titulo || 'Sin título'));
    port.appendChild(vozNodo('div', 'voz-portada-voz', 'al modo de ' + (c.voz || '—')));
    const linea = vozNodo('div', 'voz-portada-linea');
    port.appendChild(linea);
    port.appendChild(vozNodo('div', 'voz-portada-maq',
      'Cuento escrito por ' + (c.maquina || 'una máquina') + '.'));
    port.appendChild(vozNodo('div', 'voz-portada-aviso',
      'No es un texto de ' + (c.voz || 'esa persona') + ': es una imitación de su voz.'));
    if (c.encargo) port.appendChild(vozNodo('div', 'voz-portada-enc', '« ' + c.encargo + ' »'));
    if (c.creado_at) port.appendChild(vozNodo('div', 'voz-portada-fec', vozFecha(c.creado_at)));
    texto.appendChild(port);
  }

  if (cap.t) texto.appendChild(vozNodo('h2', 'voz-cap-tit', cap.t));

  (cap.p || []).forEach((p, i) => {
    if (p.k === 'sep') {
      const s = vozNodo('div', 'voz-sep', '✦');
      s.dataset.vp = String(i);
      texto.appendChild(s);
      return;
    }
    const el = vozNodo('p', p.k === 'cita' ? 'voz-p voz-cita' : 'voz-p');
    el.dataset.vp = String(i);
    vozPintaTexto(el, p.t);
    texto.appendChild(el);
  });

  /* El pie del capítulo dice qué viene después. Sin esto, el final de
     un capítulo y el final del cuento se ven exactamente igual: una
     página que no pasa. */
  const fin = vozNodo('div', 'voz-fin-cap');
  const hayMas = _vozCapActual < (c.capitulos.length - 1);
  fin.appendChild(vozNodo('div', 'voz-fin-marca', hayMas ? '❧' : '✦ ✦ ✦'));
  fin.appendChild(vozNodo('div', 'voz-fin-txt', hayMas
    ? 'Sigue: ' + ((c.capitulos[_vozCapActual + 1].t) || 'el capítulo siguiente')
    : 'Fin de «' + (c.titulo || 'el cuento') + '».'));
  if (!hayMas) {
    fin.appendChild(vozNodo('div', 'voz-fin-et',
      'Escrito por ' + (c.maquina || 'una máquina') + ', al modo de ' + (c.voz || '—') + '.'));
  }
  texto.appendChild(fin);

  vozPaginar(ancla);
}

/* Cuenta las páginas y coloca la vista. Se llama al pintar, al cambiar
   un ajuste y cada vez que la caja cambia de tamaño. */
function vozPaginar(ancla) {
  const hoja = document.getElementById('voz-hoja');
  const texto = document.getElementById('voz-texto');
  if (!hoja || !texto) return;
  const H = hoja.clientHeight;
  if (hoja.clientWidth < 40 || H < 40) return;  // la sala está escondida: no se mide nada

  /* ⚠️ LA COLUMNA MIDE EL ANCHO DE DENTRO, NO `clientWidth`.
     `clientWidth` incluye los márgenes de lectura (el `padding` de la
     caja), así que pedir una columna de ese ancho pide una columna que
     no cabe: el navegador la encoge a lo que hay —bien— pero el salto de
     página se seguiría calculando con el número grande, y cada página se
     desplazaría de más por lo que midan los márgenes. A la tercera, el
     renglón empieza cortado por la izquierda y asoma la columna
     siguiente por la derecha. Se ve enseguida y no se explica solo. */
  const W = texto.clientWidth;
  texto.style.height = H + 'px';
  texto.style.columnGap = VOZ_HUECO + 'px';
  texto.style.columnWidth = W + 'px';

  /* Las páginas salen de cuánto se puede desplazar, no de sumar anchos:
     `scrollWidth - clientWidth` ES el desplazamiento máximo, lo cuente
     el navegador con los márgenes dentro o fuera. */
  const paso = W + VOZ_HUECO;
  _vozPaginas = Math.max(1, Math.round((hoja.scrollWidth - hoja.clientWidth) / paso) + 1);

  /* Siempre se coloca por PÁRRAFO, nunca por número de página: es la
     regla grande de arriba, y este es el único sitio donde se aplica. */
  vozIrAncla(ancla == null ? _vozAncla : ancla);
  vozPintarPie();
}

function vozPaso() {
  const texto = document.getElementById('voz-texto');
  return (texto ? texto.clientWidth : 0) + VOZ_HUECO;
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
  vozPintarPie();
  vozApuntarPos();
}

/* El párrafo por el que va la lectura AHORA: el primero que empieza en
   esta página o más adelante. */
function vozAncla() {
  const hoja = document.getElementById('voz-hoja');
  if (!hoja) return _vozAncla;
  /* ⚠️ La referencia es la página en la que estamos, NO `scrollLeft`.
     El paso de página va con desplazamiento suave, así que `scrollLeft`
     todavía enseña de dónde venimos durante la animación: leyéndolo, el
     párrafo apuntado sería el de la página anterior una vez de cada
     dos, y la lectura volvería un paso atrás cada vez que se abriera. */
  const x = _vozPagina * vozPaso();
  const ps = hoja.querySelectorAll('[data-vp]');
  for (let i = 0; i < ps.length; i++) {
    if (ps[i].offsetLeft >= x - 2) return Number(ps[i].dataset.vp) || 0;
  }
  return ps.length ? (Number(ps[ps.length - 1].dataset.vp) || 0) : 0;
}

function vozIrAncla(i) {
  const hoja = document.getElementById('voz-hoja');
  if (!hoja) return;
  const el = hoja.querySelector('[data-vp="' + Number(i) + '"]');
  vozIrPagina(el ? Math.floor((el.offsetLeft + 2) / vozPaso()) : 0, true);
}

function vozApuntarPos() {
  if (!_vozLeyendo) return;
  _vozAncla = vozAncla();
  vozGuardaPos(_vozLeyendo.cid, _vozCapActual, _vozAncla);
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
  _vozCapActual = capDestino;
  _vozPagina = 0;
  vozPintarCap(0);
  if (d < 0) vozIrPagina(_vozPaginas - 1, true);
  vozApuntarPos();
}

function vozPintarPie() {
  const c = _vozLeyendo;
  const pie = document.getElementById('voz-pag');
  if (!pie || !c) return;
  const caps = (c.capitulos || []).length;
  pie.textContent = '';
  pie.appendChild(vozNodo('span', 'voz-pag-n', (_vozPagina + 1) + ' / ' + _vozPaginas));
  if (caps > 1) {
    pie.appendChild(vozNodo('span', 'voz-pag-cap',
      'cap. ' + (_vozCapActual + 1) + ' de ' + caps));
  }
  /* La otra mitad de la etiqueta, en el pie de todas las páginas. Arriba
     va la voz imitada; aquí, la máquina. Las dos siempre a la vista. */
  pie.appendChild(vozNodo('span', 'voz-pag-maq', '🤖 ' + (c.maquina || '—')));

  const barra = document.getElementById('voz-barra-in');
  if (barra) barra.style.width = (((_vozPagina + 1) / _vozPaginas) * 100) + '%';

  const tit = document.getElementById('voz-l-tit');
  if (tit) {
    tit.textContent = '';
    tit.appendChild(vozNodo('span', 'voz-l-tit-t', c.titulo || 'Sin título'));
    tit.appendChild(vozNodo('span', 'voz-l-tit-v', '🎭 al modo de ' + (c.voz || '—')));
  }
}

/* ─── Los gestos ───────────────────────────────────────────────────
   Con PUNTEROS y nunca con el arrastre del navegador, igual que en el
   resto de la casa. Y el gesto NO es la única forma de pasar página:
   hay dos botones a la vista en el pie y las flechas del teclado
   funcionan. Un lector que solo pasara página deslizando sería un
   lector que a veces no pasa página, porque el deslizamiento falla
   —con el dedo mojado, con funda, con la mano llena—. */
function vozEngancharSala() {
  const hoja = document.getElementById('voz-hoja');
  /* Los gestos se escuchan en el MARCO, no en la caja del texto: las
     tres zonas de toque van encima de la caja y se quedarían con el
     puntero antes de que llegara abajo. Al marco le llegan las dos
     cosas, porque los eventos suben. */
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
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      _vozTragarClic = true;      // un deslizamiento no es además un toque
      vozPasar(dx < 0 ? 1 : -1);
      setTimeout(() => { _vozTragarClic = false; }, 350);
    }
  });
  mid.addEventListener('pointercancel', () => { _vozArrastre = null; });

  /* Las tres zonas del toque, que es como se pasa página en cualquier
     lector: bordes para avanzar y retroceder, centro para los mandos. */
  const zona = (id, fn) => {
    const z = document.getElementById(id);
    if (z) z.addEventListener('click', () => { if (!_vozTragarClic) fn(); });
  };
  zona('voz-z-izq', () => vozPasar(-1));
  zona('voz-z-der', () => vozPasar(1));
  zona('voz-z-mid', () => {
    const b = document.getElementById('voz-lector');
    if (b) b.classList.toggle('voz-desnudo');
  });

  /* Repaginar cuando cambia el tamaño: al girar la tableta, al salir el
     teclado, al cambiar la letra. Y SIEMPRE recuperando el párrafo, no
     la página: ver la nota grande de arriba. */
  const repag = () => {
    clearTimeout(_vozRepagTimer);
    /* Con lo APUNTADO: cuando este aviso llega, la caja YA cambió de
       tamaño, así que medir aquí daría el párrafo equivocado. */
    _vozRepagTimer = setTimeout(() => vozPaginar(_vozAncla), 120);
  };
  if (window.ResizeObserver) new ResizeObserver(repag).observe(hoja);
  window.addEventListener('orientationchange', repag);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => repag());
}

/* Las flechas del teclado y el escape. Se engancha una sola vez, en el
   documento, y solo hace algo con la sala abierta. */
document.addEventListener('keydown', e => {
  const sala = document.getElementById('voz-lector');
  if (!sala || sala.hidden) return;
  const dentroDeCampo = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '');
  if (dentroDeCampo) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); vozPasar(1); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); vozPasar(-1); }
  else if (e.key === 'Escape') { vozCerrarLector(); }
});

/* ─── Los paneles de la sala: el índice y la letra ─────────────────
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
      const b = vozNodo('button', 'voz-aj-chip' + (o.id === activo ? ' voz-aj-on' : ''));
      b.type = 'button';
      b.textContent = (o.ic ? o.ic + ' ' : '') + o.t;
      b.addEventListener('click', () => { alTocar(o.id); });
      caja.appendChild(b);
    });
  };

  const guarda = () => {
    vozGuardaAjustes();
    vozAplicaAjustes();
    /* ⚠️ Cambiar la letra repagina el cuento entero, así que hay que
       volver al PÁRRAFO en que iba la lectura. Y se usa el APUNTADO,
       porque medirlo ahora daría el párrafo de después del cambio: ver
       la nota de `_vozAncla`. Si se volviera al número de página, subir
       un punto la letra movería al lector media página cada vez. */
    vozPaginar(_vozAncla);
    vozPintarAjustes();
  };

  chips(fila('Color'), VOZ_TEMAS, _vozAj.tema, id => { _vozAj.tema = id; guarda(); });
  chips(fila('Letra'), VOZ_LETRAS, _vozAj.letra, id => { _vozAj.letra = id; guarda(); });

  const menosMas = (caja, valor, paso, min, max, pon, muestra) => {
    const b1 = vozNodo('button', 'voz-aj-mm', '−'); b1.type = 'button';
    const v  = vozNodo('span', 'voz-aj-val', muestra);
    const b2 = vozNodo('button', 'voz-aj-mm', '+'); b2.type = 'button';
    b1.addEventListener('click', () => { pon(Math.max(min, +(valor - paso).toFixed(2))); guarda(); });
    b2.addEventListener('click', () => { pon(Math.min(max, +(valor + paso).toFixed(2))); guarda(); });
    caja.appendChild(b1); caja.appendChild(v); caja.appendChild(b2);
  };

  menosMas(fila('Tamaño'), _vozAj.tam, 1, 14, 34, v => { _vozAj.tam = v; }, _vozAj.tam + ' px');
  menosMas(fila('Interlínea'), _vozAj.alto, 0.1, 1.2, 2.4, v => { _vozAj.alto = v; }, _vozAj.alto.toFixed(1));
  menosMas(fila('Márgenes'), _vozAj.margen, 6, 8, 80, v => { _vozAj.margen = v; }, _vozAj.margen + ' px');

  const cj = fila('Alineado');
  [{ id: 'si', t: 'Justificado' }, { id: 'no', t: 'A la izquierda' }].forEach(o => {
    const b = vozNodo('button', 'voz-aj-chip' + ((_vozAj.just ? 'si' : 'no') === o.id ? ' voz-aj-on' : ''));
    b.type = 'button'; b.textContent = o.t;
    b.addEventListener('click', () => { _vozAj.just = (o.id === 'si'); guarda(); });
    cj.appendChild(b);
  });

  p.appendChild(vozNodo('p', 'voz-aj-nota',
    'La letra y el color son de este aparato: no le cambian la lectura a nadie más de la casa.'));
}

function vozPintarIndice() {
  const p = document.getElementById('voz-panel-ind');
  const c = _vozLeyendo;
  if (!p || !c) return;
  p.textContent = '';
  p.appendChild(vozNodo('div', 'voz-ind-tit', 'Índice'));

  const caps = c.capitulos || [];
  if (caps.length === 1 && !caps[0].t) {
    p.appendChild(vozNodo('p', 'voz-aj-nota',
      'Este cuento va de un tirón, sin capítulos. Se lee entero pasando páginas.'));
  }
  caps.forEach((cap, i) => {
    const b = vozNodo('button', 'voz-ind-item' + (i === _vozCapActual ? ' voz-ind-on' : ''));
    b.type = 'button';
    b.appendChild(vozNodo('span', 'voz-ind-n', String(i + 1)));
    b.appendChild(vozNodo('span', 'voz-ind-t', cap.t || 'El cuento'));
    b.addEventListener('click', () => {
      _vozCapActual = i; _vozPagina = 0;
      vozPintarCap(0); vozCerrarPaneles(); vozApuntarPos();
    });
    p.appendChild(b);
  });
}

/* ══════════════════════════════════════════════════════════════════
   COPIAR EL CUENTO
   ══════════════════════════════════════════════════════════════════
   ⚠️ LA ETIQUETA VA DENTRO DE LO QUE SE COPIA, Y ESTO ES EL REVÉS
   EXACTO DE LA REGLA DE EL RODAJE. Allí las notas del autor van encima
   de una raya y el botón copia solo lo de DEBAJO, porque ese texto
   tiene un único destino —la descripción pública de un video— y una
   nota interna pegada ahí sería el autor confesando en público lo que
   no había comprobado.

   Aquí el destino es cualquiera: otro chat, un correo, un documento,
   la carpeta de alguien. Y precisamente por eso la etiqueta tiene que
   IR PEGADA: un cuento «al modo de» alguien que sale de aquí sin decir
   que lo escribió una máquina es, a partir del siguiente reenvío, un
   cuento atribuido a esa persona. No hay ningún botón que copie el
   cuento pelado, y no es un descuido. */
function vozTextoPlano(c) {
  const L = [];
  L.push(c.titulo || 'Sin título');
  L.push('');
  L.push('⚠️ CUENTO ESCRITO POR UNA MÁQUINA, NO POR LA PERSONA IMITADA.');
  L.push('Voz imitada: ' + (c.voz || '—'));
  L.push('Escrito por: ' + (c.maquina || '—'));
  if (c.encargo) L.push('Se le pidió: ' + c.encargo);
  if (c.creado_at) L.push('Guardado el ' + vozFecha(c.creado_at));
  L.push('');
  L.push('───────────────────────────────');
  L.push('');
  (c.capitulos || []).forEach((cap, i) => {
    if (cap.t) { L.push((i ? '\n' : '') + cap.t); L.push(''); }
    (cap.p || []).forEach(p => {
      L.push(p.k === 'sep' ? '* * *' : p.t);
      L.push('');
    });
  });
  return L.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function vozCopiar(c) {
  const fin = ok => (typeof showToast === 'function'
    ? showToast(ok ? '📋 Copiado, con su etiqueta delante' : 'No se pudo copiar')
    : alert(ok ? '📋 Copiado, con su etiqueta delante' : 'No se pudo copiar'));
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

/* ══════════════════════════════════════════════════════════════════
   LA HOJA DE PEGAR (y de corregir, que es la misma)
   ══════════════════════════════════════════════════════════════════
   ⚠️ UNA SOLA HOJA PARA PEGAR Y PARA CORREGIR. Es la regla 9 del
   Apunte rápido de Finanzas: con dos formularios, un arreglo se hace en
   uno y se queda sin hacer en el otro, y el que se queda roto es
   siempre el que menos se abre. Al corregir se devuelve el cuento al
   recuadro como texto, así que corregir una errata es corregirla donde
   se ve, en la frase, y no en una casilla. */

/* Un ejemplo corto, escrito para esto: enseña las etiquetas de la
   cabecera, un capítulo, un salto de escena y el diálogo con raya.
   Aprender editando algo que ya funciona cuesta un tercio que aprender
   leyendo cómo debería ser (misma razón que el botón «📄 Un ejemplo»
   de El Rodaje). */
const VOZ_EJEMPLO = [
  '# La casa que contaba',
  '',
  'Al modo de: un narrador de pueblo, de frase corta',
  'Escrito por: (aquí el nombre de la máquina)',
  'Encargo: un cuento breve sobre una casa que lleva la cuenta de quien entra',
  '',
  'Capítulo 1: El número',
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
  'II',
  '',
  'Nadie volvió a preguntar en voz alta.',
].join('\n');

function vozAbrirPegar(cuento) {
  const ov = document.getElementById('voz-pegar-overlay');
  if (!ov) return;
  _vozEditando = cuento ? cuento.cid : null;

  const ta = document.getElementById('voz-pegar-txt');
  const g = id => document.getElementById(id);
  if (ta) ta.value = cuento ? vozTextoCuerpo(cuento) : '';
  ['voz-f-titulo', 'voz-f-voz', 'voz-f-maquina', 'voz-f-encargo', 'voz-f-nota']
    .forEach(id => { const e = g(id); if (e) e.value = ''; });

  if (cuento) {
    g('voz-f-titulo').value  = cuento.titulo || '';
    g('voz-f-voz').value     = cuento.voz || '';
    g('voz-f-maquina').value = cuento.maquina || '';
    g('voz-f-encargo').value = cuento.encargo || '';
    g('voz-f-nota').value    = cuento.nota || '';
  }

  const tit = g('voz-pegar-tit');
  if (tit) tit.textContent = cuento ? '✏️ Corregir el cuento' : '➕ Pegar un cuento';
  const retirar = g('voz-retirar-btn');
  if (retirar) retirar.hidden = !cuento;

  ov.style.display = 'flex';
  vozRepasar();
  if (!cuento && ta) ta.focus();
}

/* El cuerpo del cuento devuelto a texto, para el recuadro de corregir.
   Sin la cabecera de etiquetas: esas viven en sus campos, y repetirlas
   dentro del texto haría que al volver a leer se duplicaran. */
function vozTextoCuerpo(c) {
  const L = [];
  (c.capitulos || []).forEach((cap, i) => {
    if (cap.t) { if (i || L.length) L.push(''); L.push('## ' + cap.t); L.push(''); }
    (cap.p || []).forEach(p => { L.push(p.k === 'sep' ? '* * *' : p.t); L.push(''); });
  });
  return L.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function vozCerrarPegar() {
  const ov = document.getElementById('voz-pegar-overlay');
  if (ov) ov.style.display = 'none';
  _vozEditando = null;
  _vozPegado = null;
}

/* Lee lo pegado y enseña QUÉ SE ENTENDIÓ antes de guardar nada. Es la
   red que sostiene todo lo generoso que hace el lector de texto: si
   algo se leyó mal, se ve aquí y se arregla aquí, en vez de
   descubrirse dentro del cuento tres semanas después. */
function vozRepasar() {
  const ta = document.getElementById('voz-pegar-txt');
  const caja = document.getElementById('voz-pegar-repaso');
  if (!ta || !caja) return;

  const r = vozLeer(ta.value);
  _vozPegado = r;

  // Lo que el texto traía escrito rellena el campo que esté vacío, nunca pisa lo tocado a mano
  [['titulo', 'voz-f-titulo'], ['voz', 'voz-f-voz'], ['maquina', 'voz-f-maquina'],
   ['encargo', 'voz-f-encargo'], ['nota', 'voz-f-nota']].forEach(([k, id]) => {
    const e = document.getElementById(id);
    if (e && !e.value.trim() && r[k]) e.value = r[k];
  });

  caja.textContent = '';
  if (!ta.value.trim()) {
    caja.appendChild(vozNodo('p', 'voz-rep-vacio',
      'Pega aquí el cuento entero, tal como te lo dio la máquina. Se reparte solo.'));
    vozPintarBotonGuardar();
    return;
  }

  const pal = vozPalabras(r.capitulos);
  const caps = r.capitulos.length;
  const res = vozNodo('div', 'voz-rep-linea');
  [caps > 1 ? caps + ' capítulos' : 'un solo capítulo',
   pal.toLocaleString('es-HN') + ' palabras',
   '≈ ' + vozMinutos(pal) + ' min de lectura'].forEach(t =>
    res.appendChild(vozNodo('span', 'voz-rep-dato', t)));
  caja.appendChild(res);

  const ind = vozNodo('div', 'voz-rep-caps');
  r.capitulos.forEach((c, i) => {
    const f = vozNodo('div', 'voz-rep-cap');
    f.appendChild(vozNodo('span', 'voz-rep-cap-n', String(i + 1)));
    f.appendChild(vozNodo('span', 'voz-rep-cap-t', c.t || '(sin título)'));
    f.appendChild(vozNodo('span', 'voz-rep-cap-p', (c.p || []).length + ' párrafos'));
    ind.appendChild(f);
  });
  caja.appendChild(ind);

  /* ⚠️ Y LO QUE NO SE ENTENDIÓ SE NOMBRA, con su renglón. Esas líneas
     se quedan dentro del cuento —que es lo correcto— pero callarse se
     ve desde fuera igual que un rechazo: el autor cree que se perdió y
     vuelve a pegar. Misma lección que el lector de guiones. */
  if (r.avisos.length) {
    const av = vozNodo('div', 'voz-rep-avisos');
    av.appendChild(vozNodo('div', 'voz-rep-avisos-t',
      r.avisos.length + (r.avisos.length === 1
        ? ' renglón parecía una etiqueta y no se entendió. Se quedó dentro del cuento, como texto:'
        : ' renglones parecían etiquetas y no se entendieron. Se quedaron dentro del cuento, como texto:')));
    r.avisos.slice(0, 6).forEach(a =>
      av.appendChild(vozNodo('div', 'voz-rep-aviso', 'renglón ' + a.linea + ': ' + a.txt)));
    caja.appendChild(av);
  }

  vozPintarBotonGuardar();
}

/* ⚠️ EL GUARDADO SE PARA SI FALTA LA ETIQUETA, Y DICE CUÁL FALTA.
   No es una validación de formulario: es LA regla de la herramienta.
   Un cuento sin la voz imitada y sin la máquina que lo escribió es
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
  if (!ta || !ta.value.trim()) falta.push('el cuento');
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
  const r = _vozPegado || vozLeer(document.getElementById('voz-pegar-txt').value);
  const viejo = _vozEditando ? _vozCuentos.find(c => c.cid === _vozEditando) : null;

  const c = {
    cid: viejo ? viejo.cid : vozCid(),
    titulo: g('voz-f-titulo').trim(),
    voz: g('voz-f-voz').trim(),
    maquina: g('voz-f-maquina').trim(),
    encargo: g('voz-f-encargo').trim(),
    nota: g('voz-f-nota').trim(),
    capitulos: r.capitulos,
    palabras: vozPalabras(r.capitulos),
    borrado: false,
    creado_at: viejo ? viejo.creado_at : new Date().toISOString(),
    actualizado: Date.now(),
    /* Se firma también en la copia del aparato: es lo que deja saber,
       sin preguntarle a la nube, qué cuentos son míos y cuáles no —para
       no ofrecer corregir el de otro y para no reintentar su subida—. */
    puesto_por: (viejo && viejo.puesto_por) || _vozYo || null,
  };

  _vozCuentos = [c].concat(_vozCuentos.filter(x => x.cid !== c.cid));
  vozGuardaLocal();
  vozCerrarPegar();
  vozRender();

  const res = await vozSubir(c);
  if (typeof showToast === 'function') {
    /* ⚠️ Cada motivo se dice como es. «Subirá cuando vuelva la señal»
       puesto en todos los casos era mentira en dos de ellos: con la
       tabla sin instalar no va a subir nunca, y con un cuento ajeno
       tampoco por mucho que vuelva la señal. Un aviso que se equivoca de
       causa manda a mirar donde no está el problema. */
    if (res.ok) showToast('📖 Guardado, y ya está en los demás aparatos');
    else if (res.motivo === 'sin-nube')   showToast('📴 Guardado aquí. Falta correr voz_prestada.sql para que viaje');
    else if (res.motivo === 'sin-sesion') showToast('📴 Guardado aquí. Entra en F.A.R.O para que viaje');
    else if (res.motivo === 'sin-senal')  showToast('📡 Guardado aquí. Subirá solo la próxima vez que abras esto');
    else if (res.motivo === 'ajeno')      showToast('✋ Ese cuento lo puso otra persona: solo quien lo puso puede corregirlo');
    else showToast('⚠️ Guardado aquí, pero la nube lo rechazó: ' + (res.detalle || 'sin detalle'));
  }
  vozRender();
}

/* ⚠️ RETIRAR NO BORRA LA FILA: LA MARCA. Es la lapida de la repisa de
   enlaces y de los videos de M.E.T.A.S, y hace falta por lo mismo: si
   este aparato borrara la fila, la tableta que todavía tiene su copia
   la subiría otra vez en la siguiente sincronización y el cuento
   resucitaría solo, sin que nadie entendiera por qué. */
async function vozRetirar() {
  if (!_vozEditando) return;
  const c = _vozCuentos.find(x => x.cid === _vozEditando);
  if (!c) return;
  if (!confirm('¿Retirar «' + (c.titulo || 'este cuento') + '» del anaquel?')) return;
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
    'Pega el cuento tal como venga. Lo único que hace falta saber es esto:'));

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

  [['Las etiquetas van ARRIBA del cuento', 'En cuanto empieza la prosa dejan de leerse como etiquetas, para que un «Nota:» dicho por un personaje no se salga del cuento.'],
   ['Los capítulos', '«## Lo que sea», «Capítulo 3», «Prólogo», un número o un romano a solas, o un rótulo EN MAYÚSCULAS. Nada más asciende a capítulo: una frase corta y suelta se queda como frase, porque partir un cuento por error parece que funcionó.'],
   ['El salto de escena', 'Un renglón con «* * *», «---» o «···».'],
   ['El diálogo', 'Cada raya (—) empieza párrafo, aunque no haya renglón en blanco delante.'],
   ['Cursiva y negrita', '*así* y **así**.'],
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
    ['voz-f-titulo', 'voz-f-voz', 'voz-f-maquina', 'voz-f-encargo']
      .forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
    vozRepasar();
  });

  let tRepaso = null;
  on('voz-pegar-txt', 'input', () => {
    clearTimeout(tRepaso);
    tRepaso = setTimeout(vozRepasar, 220);
  });
  ['voz-f-titulo', 'voz-f-voz', 'voz-f-maquina'].forEach(id =>
    on(id, 'input', vozPintarBotonGuardar));

  on('voz-l-salir', 'click', vozCerrarLector);
  on('voz-l-aa', 'click', () => { vozPintarAjustes(); vozAbrirPanel('voz-panel-aa'); });
  on('voz-l-ind', 'click', () => { vozPintarIndice(); vozAbrirPanel('voz-panel-ind'); });
  on('voz-ant', 'click', () => vozPasar(-1));
  on('voz-sig', 'click', () => vozPasar(1));
});
