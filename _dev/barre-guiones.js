/* ============================================================
   M.E.T.A.S · Barrido de guiones largos (norma 1-bis)
   ------------------------------------------------------------
   Aplica la tabla de equivalencias que quedó fijada en la tanda 1
   (Ruta de los Robots, commit f905687). Son rótulos de plantilla
   que se repiten casi idénticos en las 57 misiones, así que la
   decisión ya está tomada y aquí solo se ejecuta:

   · pareja de rayas que abre una aclaración → paréntesis;
   · raya entre dos partes del mismo rango en un título → punto
     medio «·», que ya es el separador de la casa;
   · raya que introduce una explicación o una lista → dos puntos;
   · el «—» del desplegable de pareados es interfaz, no prosa → «?»
     (no «s/d», que es para «sin dato»);
   · los comentarios del código también, para que el grep de
     verificación pueda dar cero.

   Lo que NO encaja en una regla se deja intacto y se lista al
   final: esas son las que hay que leer y decidir a mano.

   Uso:  node _dev/barre-guiones.js --revisar misiones/2y3ciclo-la-celula
         node _dev/barre-guiones.js misiones/2y3ciclo-la-celula
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const ARGS = process.argv.slice(2);
const SOLO_REVISAR = ARGS.includes('--revisar');
const objetivos = ARGS.filter(a => !a.startsWith('--'));
if (!objetivos.length) { console.error('Indica al menos una carpeta o archivo.'); process.exit(2); }

/* ── La tabla, en orden de aplicación. El orden importa: los comentarios
      decorativos «/* — texto — *​/» van primero, porque si no la regla de
      comentario de sección se come solo la primera de sus dos rayas. ── */
const REGLAS = [
  /* ══════════ Reglas propias de F.A.R.O ══════════
     Van primero porque son más específicas que las heredadas de M.E.T.A.S.
     Esta copia diverge a propósito de la del repo de M.E.T.A.S: allá el motor
     no tiene herramientas ni cabeceras de sección con este formato. */

  /* Cabeceras de sección del motor: «RENDER — MÓDULOS», «ANTENA 📡 — EL
     OBSERVATORIO». Se reconocen porque lo que va antes de la raya NO lleva
     ni una minúscula, o sea que es un título y no prosa. */
  { de: /^(\s*[^\na-záéíóúñü]{3,60}?) — /gm, a: '$1 · ', nota: 'cabecera de sección → ·' },
  /* Comentario de una línea con regleta decorativa */
  { de: /(\/\/ ─+ [^\n]*?) — /g, a: '$1 · ', nota: 'comentario de sección → ·' },
  /* Resto de comentarios de una línea: la raya introduce la explicación */
  { de: /(\/\/[^\n]*?) — /g, a: '$1: ', nota: 'comentario → dos puntos' },

  /* Atribución de una cita: el separador de la casa */
  { de: /'— ' \+ frase\.autor/g, a: "'· ' + frase.autor", nota: 'atribución → ·' },
  { de: /(<span class="pensador-autor">)— /g, a: '$1· ', nota: 'atribución → ·' },
  { de: /" — (<em>)/g, a: '" · $1', nota: 'atribución → ·' },

  /* Títulos: de la pestaña, de tarjeta, de encabezado markdown y del widget
     de la línea de tiempo (las otras cuatro misiones ya usan «·» ahí) */
  { de: /(<title>[^<\n]*?) — /g, a: '$1 · ', nota: 'título → ·' },
  { de: /(<div class="[a-z-]*title">[^<\n]*?) — /g, a: '$1 · ', nota: 'título → ·' },
  { de: /(#{1,4} [^\n`]*?) — /g, a: '$1 · ', nota: 'título → ·' },
  { de: /(\$\{d\.y\}) — (?=\$\{d\.label\})/g, a: '$1 · ', nota: 'título → ·' },
  { de: /(Laboratorio de Ciencias) — /g, a: '$1 · ', nota: 'título → ·' },
  { de: /(República de Honduras[^\n"]*?) — /g, a: '$1 · ', nota: 'título → ·' },

  /* La raya introduce la consecuencia o la aclaración → dos puntos */
  { de: /((?:Dentro del|Cerca del|Límite) [^'\n]*?) — /g, a: '$1: ', nota: 'mensaje → dos puntos' },
  { de: /(En portada) — /g, a: '$1: ', nota: 'rótulo → dos puntos' },
  { de: /(\(opcional) — /g, a: '$1: ', nota: 'rótulo → dos puntos' },
  { de: /(\* [^\n]*?) — /g, a: '$1: ', nota: 'comentario → dos puntos' },
  /* Ya hay dos puntos más adelante en la frase */
  { de: /(\|\| 'Deuda'\}") — /g, a: '$1 · ', nota: 'segunda pausa → ·' },

  /* Marcador de «sin dato» suelto en la interfaz: va a s/d, no a puntuación */
  { de: />—</g, a: '>s/d<', nota: 'sin dato → s/d' },
  { de: /(\{ ?segAhora[^\n]*?: ')—('\})/g, a: '$1s/d$2', nota: 'sin dato → s/d' },
  { de: /: '—'/g, a: ": 's/d'", nota: 'sin dato → s/d' },
  /* En un campo numérico un «s/d» de marca de agua confunde: se deja vacío */
  { de: /placeholder="—"/g, a: 'placeholder=""', nota: 'marca de agua → vacía' },

  /* Comentario decorativo: las rayas eran adorno, se quitan enteras. Los hay
     de una línea y de varias. En el de varias, el «[^*]|\*(?!\/)» impide que
     la búsqueda salte por encima de un cierre de comentario y se lleve por
     delante el código que hay entre dos comentarios distintos. */
  { de: /\/\* — ([^\n]*?) — \*\//g, a: '/* $1 */', nota: 'comentario decorativo → sin rayas' },
  { de: /\/\* — ((?:[^*]|\*(?!\/))*?) — \*\//g, a: '/* $1 */', nota: 'comentario decorativo → sin rayas' },
  /* Y los que solo abren y cierran la raya en su primera línea */
  { de: /\/\* — ([^\n—]*?) —\n/g, a: '/* $1\n', nota: 'comentario decorativo → sin rayas' },

  /* Cabecera de los archivos de traducción */
  { de: /(») — versión en inglés/g, a: '$1: versión en inglés', nota: 'rótulo → dos puntos' },
  /* Título de un bloque del CSS en mayúsculas */
  { de: /(INTEGRADOR) — /g, a: '$1 · ', nota: 'comentario de sección → ·' },

  /* Parejas de rayas que abren una aclaración: a paréntesis, sin tocar palabras */
  { de: /—(que llega a decir «Maestro del Pensamiento 🏆»)—/g, a: '($1)', nota: 'aclaración → paréntesis' },
  { de: / — (¡evalúa (?:el condicional|la condición) en cada paso!) — /g, a: ' ($1) ', nota: 'aclaración → paréntesis' },
  { de: / — (evaluate the conditional at every step!) — /g, a: ' ($1) ', nota: 'aclaración → paréntesis' },
  { de: / — (¡incluye los <strong>condicionales<\/strong>[^—\n]*?DECIDA!) — /g, a: ' ($1) ', nota: 'aclaración → paréntesis' },
  { de: / — (include the <strong>conditionals<\/strong>[^—\n]*?DECIDES!) — /g, a: ' ($1) ', nota: 'aclaración → paréntesis' },
  { de: /—('baleada'[^—\n]*?…)—/g, a: '($1)', nota: 'aclaración → paréntesis' },

  /* Títulos: dos partes del mismo rango → punto medio. El emoji del rótulo
     cambia de una misión a otra (🎓 o 📝 la final, 🌍 o ⏳ los de la misión),
     así que se ataca por el texto, no por el icono. */
  { de: /Evaluación Final — /g, a: 'Evaluación Final · ', nota: 'título → ·' },
  { de: /Prueba de Pensamiento Crítico — /g, a: 'Prueba de Pensamiento Crítico · ', nota: 'título → ·' },
  { de: /🧠 Pensamiento Crítico — /g, a: '🧠 Pensamiento Crítico · ', nota: 'título → ·' },
  { de: /PRUEBA DE PENSAMIENTO CRÍTICO — /g, a: 'PRUEBA DE PENSAMIENTO CRÍTICO · ', nota: 'comentario de código → ·' },
  { de: /(<strong>Caso \$\{i\+1\}) — /g, a: '$1 · ', nota: 'título del caso → ·' },
  /* ⚠ Estos dos rótulos viven dentro de un <h2>, así que tienen que
     resolverse ANTES que la regla genérica de encabezados: si gana la
     genérica quedan con «·» y dejan de coincidir con su clave del
     diccionario de js/metas-i18n.js, o sea que dejan de traducirse.
     Algunas misiones los rebautizan («Fósiles de Memoria», «Reto
     Asteroide»), así que se atacan por la segunda mitad, que sí es fija. */
  { de: / — Toca para voltear/g, a: ': toca para voltear', nota: 'rótulo → dos puntos' },
  { de: / — ¡30 segundos!/g, a: ': ¡30 segundos!', nota: 'rótulo → dos puntos' },

  /* Cualquier otro <h2>/<h3> de la misión con una raya entre sus dos partes */
  { de: /(<h[23](?:\s[^>]*)?>[^<\n]*?) — (?=[^<\n]*<\/h[23]>)/g, a: '$1 · ', nota: 'encabezado → ·' },
  /* Comentarios de sección del CSS y del JS: son títulos, no prosa */
  { de: /(\/\*[^*\n]*?) — (?=[^*\n]*\*\/)/g, a: '$1 · ', nota: 'comentario de sección → ·' },

  /* Los mismos títulos, en el lado inglés del -en.js (clave y valor van a la par) */
  { de: /Final Test — /g, a: 'Final Test · ', nota: 'título EN → ·' },
  { de: /Critical Thinking Test — /g, a: 'Critical Thinking Test · ', nota: 'título EN → ·' },
  { de: /Practical Test — /g, a: 'Practical Test · ', nota: 'título EN → ·' },
  { de: /Programming Exam — /g, a: 'Programming Exam · ', nota: 'título EN → ·' },
  { de: /Prueba Operativa — /g, a: 'Prueba Operativa · ', nota: 'título → ·' },
  { de: /Examen de Programación — /g, a: 'Examen de Programación · ', nota: 'título → ·' },
  /* Antes de la regla general de </strong>: aquí la frase ya termina en dos puntos */
  { de: /(<strong>\$\{it\.tema\}<\/strong>) — /g, a: '$1 · ', nota: 'segunda pausa → ·' },

  /* Rótulos que introducen su contenido → dos puntos */
  { de: /PAUTA — /g, a: 'PAUTA: ', nota: 'rótulo → dos puntos' },
  { de: /ANSWER KEY — /g, a: 'ANSWER KEY: ', nota: 'rótulo EN → dos puntos' },
  { de: / — 30 seconds!/g, a: ': 30 seconds!', nota: 'rótulo EN → dos puntos' },
  { de: / — tap to flip/g, a: ': tap to flip', nota: 'rótulo EN → dos puntos' },
  /* Nombre del nivel o de la tarea, y lo que hay que lograr en él */
  { de: /(<\/(?:strong|span)>) — (?=\$\{)/g, a: '$1: ', nota: 'rótulo → dos puntos' },
  { de: /(«\$\{amb\}»|«\$2») — /g, a: '$1: ', nota: 'rótulo → dos puntos' },
  { de: /(«\(\.\+\?\)») — /g, a: '$1: ', nota: 'rótulo → dos puntos' },
  { de: /(estilo ZipGrade · Forma \$\{[^}]*\}) — /g, a: '$1: ', nota: 'rótulo → dos puntos' },
  { de: /(estilo ZipGrade · Forma \d+) — /g, a: '$1: ', nota: 'rótulo → dos puntos' },
  /* Comentario de sección de la prueba crítica: la raya introduce la explicación */
  { de: /(\/\/ (?:─+ )?[IVX]+\. [^\n]*?\)) — /g, a: '$1: ', nota: 'comentario → dos puntos' },

  /* Ya hay dos puntos más adelante en la frase: se separa con punto medio */
  { de: /(× 20 pts c\/u) — /g, a: '$1 · ', nota: 'segunda pausa → ·' },
  { de: /(\+ V\.\d+) — /g, a: '$1 · ', nota: 'segunda pausa → ·' },

  /* Glosarios de la pauta: el término y lo que significa → dos puntos */
  { de: /((?:ga|gb|gc|gd):'[^'\n]*?) — /g, a: '$1: ', nota: 'glosario → dos puntos' },
  /* Sigla seguida de lo que abrevia */
  { de: /(\{w:'[A-ZÁÉÍÓÚÑ]{2,}) — /g, a: '$1: ', nota: 'sigla → dos puntos' },
  /* Mensajes de reacción: la raya introduce el porqué */
  { de: /(fb\('[^']*',\s*'[^'\n]*?) — /g, a: '$1: ', nota: 'mensaje → dos puntos' },
  { de: /(📊 Distribución de puntaje) — /g, a: '$1: ', nota: 'rótulo → dos puntos' },

  /* Ya hay dos puntos antes en la frase: se separa con punto medio */
  { de: / — (?=secciones abiertas)/g, a: ' · ', nota: 'segunda pausa → ·' },
  { de: /(<br>• <strong>[^<]*<\/strong>: "[^"]*") — /g, a: '$1 · ', nota: 'segunda pausa → ·' },
  { de: /(\/\/ =+ [^\n]*?) — /g, a: '$1 · ', nota: 'comentario de sección → ·' },

  /* Interfaz, no prosa */
  { de: /(<option value="">)—(<\/option>)/g, a: '$1?$2', nota: 'desplegable → ?' },
  { de: /(<option value="">)— ([^—<\n]+) —(<\/option>)/g, a: '$1$2$3', nota: 'desplegable → sin rayas' },
  /* Marcador de «sin dato» en una tabla: va a s/d, no a puntuación */
  { de: /(\bn:')—(')/g, a: '$1s/d$2', nota: 'sin dato → s/d' },
];

const EXT = /\.(js|html|css)$/;
function archivos(p) {
  const abs = path.isAbsolute(p) ? p : path.join(RAIZ, p);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isFile()) return EXT.test(abs) ? [abs] : [];
  return fs.readdirSync(abs).flatMap(f => archivos(path.join(abs, f)));
}

const aplicadas = {};
let totalAntes = 0, totalDespues = 0, tocados = 0;
const sobran = [];

for (const objetivo of objetivos) {
  for (const abs of archivos(objetivo)) {
    if (abs.includes('html2canvas')) continue;
    const rel = path.relative(RAIZ, abs).replace(/\\/g, '/');
    const original = fs.readFileSync(abs, 'utf8');
    const antes = (original.match(/—/g) || []).length;
    if (!antes) continue;
    totalAntes += antes;

    let txt = original;
    for (const r of REGLAS) {
      const n = (txt.match(r.de) || []).length;
      if (!n) continue;
      aplicadas[r.nota] = (aplicadas[r.nota] || 0) + n;
      txt = txt.replace(r.de, r.a);
    }

    const despues = (txt.match(/—/g) || []).length;
    totalDespues += despues;
    if (despues) {
      txt.split('\n').forEach((linea, i) => {
        let idx = -1;
        while ((idx = linea.indexOf('—', idx + 1)) >= 0) {
          sobran.push({ ref: `${rel}:${i + 1}`, muestra: linea.slice(Math.max(0, idx - 55), idx + 56).trim() });
        }
      });
    }
    if (txt !== original) {
      tocados++;
      if (!SOLO_REVISAR) fs.writeFileSync(abs, txt);
    }
  }
}

console.log(`Guiones largos: ${totalAntes} → ${totalDespues}` +
  (SOLO_REVISAR ? '  (revisión, no se escribió nada)' : `  · ${tocados} archivos reescritos`));
if (Object.keys(aplicadas).length) {
  console.log('\nReglas aplicadas:');
  Object.entries(aplicadas).sort((a, b) => b[1] - a[1])
    .forEach(([nota, n]) => console.log(`  ${String(n).padStart(4)} ×  ${nota}`));
}
if (sobran.length) {
  console.log(`\n⚠ ${sobran.length} sin regla: hay que leerlas y decidir a mano`);
  sobran.slice(0, 60).forEach(s => console.log(`  ${s.ref}\n      ${s.muestra.slice(0, 118)}`));
  if (sobran.length > 60) console.log(`  … y ${sobran.length - 60} más`);
} else {
  console.log('\n✔ no queda ningún guion largo');
}
