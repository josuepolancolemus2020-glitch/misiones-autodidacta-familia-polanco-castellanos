'use strict';
/* ══════════════════════════════════════════════════════════════════
   MONTA LA REPISA DE ENLACES EN UNA MISIÓN
   ══════════════════════════════════════════════════════════════════

   La repisa (norma 6-bis) se monta con cuatro cosas mecánicas y una
   que no lo es. Las cuatro mecánicas las hace esta herramienta:

     1. la hoja `css/recursos-enlaces.css`, DESPUÉS del CSS de la misión
        (se tiñe de su --pri, así que el orden importa);
     2. el guion `js/recursos-enlaces.js`, DESPUÉS del JS de la misión
        (lee el `window.RECURSOS_ENLACES` que ella declara);
     3. el bloque declarativo, el PRIMERO de la sección de Recursos,
        antes de la ficha y antes de las fuentes;
     4. `window.RECURSOS_ENLACES` al final del JS de la misión, con su
        clave de almacén PROPIA.

   La que no es mecánica es el texto: el párrafo de presentación y las
   tarjetas de muestra se escriben con la voz de cada misión, y por eso
   entran por un archivo aparte. Un párrafo genérico repetido en
   cuarenta misiones es exactamente lo contrario de lo que esta casa
   escribe.

   ── DE DÓNDE SALE EL MOLDE ──
   Del piloto, `misiones/ruta-hilo-cadena-hueco/cadena-hueco.html`, y
   no de una copia guardada aquí dentro. Con una copia, el día que el
   bloque cambie habría dos verdades y la de esta herramienta sería la
   vieja: es el mismo motivo por el que la repisa es un aparato
   compartido y no un trozo copiado a cuarenta misiones.

   ── USO ──
     node _dev/monta-repisa.js <carpeta-de-la-mision> <contenido.json>

   El JSON lleva:
     {
       "mision": "hilo-deseo-obstaculo",     clave de almacén, propia
       "sub": "<párrafo de presentación, con la voz de la misión>",
       "enlaces": [ { ejemplo, tipo, titulo, desc, fuente, dura, ops } ]
     }

   Es IDEMPOTENTE: si la misión ya la tiene montada, no la duplica y lo
   dice. Y para en seco, sin tocar nada, si falta cualquiera de los
   cuatro anclajes: media repisa montada es peor que ninguna.
   ══════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const PILOTO = 'misiones/ruta-hilo-cadena-hueco/cadena-hueco.html';

function morir(msg) { console.error('✘ ' + msg); process.exit(1); }

/* El bloque del piloto, de su primera línea de comentario hasta el
   cierre de su <div>. Se corta por el ancla siguiente (la ficha), que
   es la que la norma 6-bis fija como vecina de abajo. */
function moldeDelPiloto() {
  const h = fs.readFileSync(PILOTO, 'utf8');
  const ini = h.indexOf('    <!-- ══════════ LA REPISA DE ENLACES ══════════');
  const fin = h.indexOf('    <div style="border:1.5px solid var(--border);border-radius:12px;padding:1rem 1.2rem;margin-bottom:1.2rem;background:rgba(0,0,0,0.02);">');
  if (ini < 0 || fin < 0 || fin < ini) morir('no se encuentra el bloque de la repisa en el piloto (' + PILOTO + ')');
  const bloque = h.slice(ini, fin);
  if (bloque.indexOf('data-re-repisa') < 0) morir('lo que se cortó del piloto no es la repisa');
  return bloque;
}

/* Cambia el párrafo de presentación por el de esta misión. El resto del
   bloque (el aviso de la máquina, la rejilla, el formulario) es igual
   en todas a propósito: es interfaz, no contenido. */
function conSuVoz(molde, sub) {
  const re = /(<p class="re-caja-sub">)[\s\S]*?(<\/p>)/;
  if (!re.test(molde)) morir('el molde no trae su párrafo de presentación');
  return molde.replace(re, '$1' + sub + '$2');
}

function bloqueCatalogo(cfg) {
  const linea = e => {
    const campos = ['ejemplo', 'tipo', 'titulo', 'url', 'desc', 'fuente', 'origen', 'dura', 'ops'];
    const partes = campos.filter(k => e[k] !== undefined && e[k] !== '')
      .map(k => '      ' + k + ': ' + JSON.stringify(e[k]));
    return '    {\n' + partes.join(',\n') + '\n    }';
  };
  return [
    '',
    '// ═══════════════════ LA REPISA DE ENLACES ═══════════════════',
    '// El contenido propio del aparato compartido `js/recursos-enlaces.js`',
    '// (norma 6-bis). El aparato pone el comportamiento; lo que se lee es de',
    '// esta misión y se escribe con su voz. El formato de cada campo, y la',
    '// lista de ajustes que la pantalla conoce, están en la cabecera del',
    '// aparato y en la norma.',
    '//',
    '// LAS DE ABAJO SON EJEMPLOS y no enlazan a ninguna parte: están para ver',
    '// cómo queda una tarjeta antes de tener los enlaces de verdad. En cuanto',
    '// entre el primer enlace real, el aparato deja de pintarlas solo.',
    'window.RECURSOS_ENLACES = {',
    '  mision: ' + JSON.stringify(cfg.mision) + ',',
    '  enlaces: [',
    cfg.enlaces.map(linea).join(',\n'),
    '  ]',
    '};',
    ''
  ].join('\n');
}

function monta(carpeta, cfg) {
  const base = path.basename(carpeta);
  const nombre = fs.readdirSync(carpeta).find(f => f.endsWith('.html'));
  if (!nombre) morir('no hay HTML en ' + carpeta);
  const rutaHtml = path.join(carpeta, nombre);
  const rutaJs = path.join(carpeta, 'js', nombre.replace(/\.html$/, '.js'));
  if (!fs.existsSync(rutaJs)) morir('no existe el JS de la misión: ' + rutaJs);

  let h = fs.readFileSync(rutaHtml, 'utf8');
  let j = fs.readFileSync(rutaJs, 'utf8');
  const hecho = [];

  /* Los cuatro anclajes se comprueban ANTES de escribir nada. */
  const aCss = '<link rel="stylesheet" href="../../css/lecturas-marcador.css">';
  const aJs = '  <script src="../../js/lecturas-marcador.js"></script>';
  const aH2 = '    <h2>📁 Recursos del módulo</h2>\n\n';
  if (h.indexOf(aCss) < 0) morir(base + ': no está la hoja del marcador, que es donde va detrás la de la repisa');
  if (h.indexOf(aJs) < 0) morir(base + ': no está el guion del marcador');
  if (h.indexOf(aH2) < 0) morir(base + ': no está el encabezado de Recursos con su línea en blanco detrás');

  if (h.indexOf('href="../../css/recursos-enlaces.css"') < 0) {
    h = h.replace(aCss, aCss + '\n<link rel="stylesheet" href="../../css/recursos-enlaces.css">');
    hecho.push('hoja');
  }
  if (h.indexOf('src="../../js/recursos-enlaces.js"') < 0) {
    h = h.replace(aJs, aJs +
      '\n  <!-- La repisa de enlaces va DESPUÉS del JS de la misión: lee window.RECURSOS_ENLACES,' +
      '\n       que la misión declara al final del suyo. -->' +
      '\n  <script src="../../js/recursos-enlaces.js"></script>');
    hecho.push('guion');
  }
  if (h.indexOf('data-re-repisa') < 0) {
    h = h.replace(aH2, aH2 + conSuVoz(moldeDelPiloto(), cfg.sub));
    hecho.push('bloque');
  }
  if (j.indexOf('window.RECURSOS_ENLACES') < 0) {
    j = j.replace(/\s*$/, '\n') + bloqueCatalogo(cfg);
    hecho.push('catálogo');
  }

  if (!hecho.length) { console.log('· ' + base + ': ya la tenía montada, no se toca'); return false; }
  fs.writeFileSync(rutaHtml, h);
  fs.writeFileSync(rutaJs, j);
  console.log('✔ ' + base + ': ' + hecho.join(', '));
  return true;
}

const carpeta = process.argv[2];
const contenido = process.argv[3];
if (!carpeta || !contenido) {
  console.error('Uso: node _dev/monta-repisa.js <carpeta-de-la-mision> <contenido.json>');
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(contenido, 'utf8'));
if (!cfg.mision || !cfg.sub || !Array.isArray(cfg.enlaces)) morir('el JSON necesita mision, sub y enlaces');
monta(carpeta.replace(/\/$/, ''), cfg);
