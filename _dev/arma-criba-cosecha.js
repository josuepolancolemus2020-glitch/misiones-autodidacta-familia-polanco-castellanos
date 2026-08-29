/* ─────────────────────────────────────────────
   ARMA LA EDGE FUNCTION EN UN SOLO ARCHIVO

   Uso:  node _dev/arma-criba-cosecha.js

   Por qué existe: `criba-cosecha` son DOS archivos —index.ts y
   normaliza.ts—, y están separados por un motivo bueno: normaliza.ts no
   toca la red ni la base, así que se puede probar entero desde Node sin
   Deno. Pero desplegar dos archivos exige la CLI de Supabase, o sea un
   ordenador, y aquí se trabaja desde la tableta.

   Así que este script los cose en uno solo, listo para pegar en el panel
   de Supabase (Edge Functions → New function → pegar → Deploy). Mismo
   reparto que el botón 📋 de la repisa de enlaces y que el SQL: lo
   permanente vive en el repositorio, repartido como conviene para
   trabajarlo; lo que hay que pegar sale de una pieza.

   ⚠️ Y COSE EL ARCHIVO PROBADO, NO UNA COPIA. Si alguien escribiera a
   mano la versión de un archivo, se arreglaría un fallo en normaliza.ts
   y seguiría vivo en lo desplegado. Por eso el archivo generado lleva un
   aviso de que no se edita, y por eso la prueba comprueba que lo cosido
   es EXACTAMENTE lo probado.
───────────────────────────────────────────── */
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, '..', 'supabase', 'functions', 'criba-cosecha');
const SALIDA = path.join(DIR, 'PEGAR-EN-EL-PANEL.ts');

const normaliza = fs.readFileSync(path.join(DIR, 'normaliza.ts'), 'utf8');
const index     = fs.readFileSync(path.join(DIR, 'index.ts'), 'utf8');

/* Del módulo se quitan los `export`: al quedar en el mismo archivo, ya
   no exporta nada, y `export` fuera de un módulo es un error de sintaxis
   que solo se vería al desplegar. */
const cuerpo = normaliza
  .replace(/^export (function|interface|type|const) /gm, '$1 ')
  .trim();

/* Y del index se quita la línea que importaba el módulo. */
const principal = index
  .replace(/^import \{[^}]*\} from "\.\/normaliza\.ts";\s*$/m, '')
  .trim();

/* ⚠️ LA CABECERA VA EN ASCII PURO, CORTA, Y NO ES UNA MANÍA.
   Primero se pegó este archivo en el editor SQL (29 ago 2026), así que
   se le puso un aviso arriba. El aviso se dibujó con un cuadro de
   caracteres dobles -las cajas de ╔═║- y el editor del panel de
   Supabase SE ATRAGANTÓ con él: se comió las 21 líneas del cuadro y
   dejó un trozo suelto en la línea 1, con lo que Deno rechazó el
   despliegue entero por «Unexpected character '=' at index.ts:1:1».
   Un aviso que impide desplegar el archivo es peor que no ponerlo.
   Cinco líneas de ASCII dicen lo mismo y siempre se pegan bien. */
const AVISO = `// !!! ESTO NO ES SQL. NO LO PEGUES EN EL EDITOR SQL. !!!
//
// Va en: Supabase -> Edge Functions -> Deploy a new function
//        Nombre exacto: criba-cosecha
//        Y en sus ajustes: "Enforce JWT Verification" = OFF
//
// ARCHIVO GENERADO - NO SE EDITA A MANO. Lo cose
// node _dev/arma-criba-cosecha.js  a partir de normaliza.ts e index.ts,
// que son los que se prueban:
//   node --experimental-strip-types _dev/prueba-criba-normaliza.mjs
// Si editas AQUI, el arreglo se pierde al volver a coser, y dejara de
// coincidir con lo que dicen las pruebas.
//
// Cosido el ${new Date().toISOString().slice(0, 10)}.
`;

fs.writeFileSync(SALIDA,
  AVISO + '\n' +
  '// ══════════ 1 de 2 · normaliza.ts ══════════\n\n' + cuerpo + '\n\n' +
  '// ══════════ 2 de 2 · index.ts ══════════\n\n' + principal + '\n');

/* Comprobación mínima aquí mismo: si el cosido no lleva las piezas que
   tiene que llevar, mejor reventar ahora que descubrirlo al desplegar. */
const hecho = fs.readFileSync(SALIDA, 'utf8');
const faltan = ['function normaliza(', 'function urlBuena(', 'function evidenciaDe(',
                'Deno.serve(', 'criba_arma_edicion'].filter(t => !hecho.includes(t));
if (faltan.length) { console.error('❌ al cosido le falta:', faltan.join(', ')); process.exit(1); }
if (/^export /m.test(hecho))       { console.error('❌ quedó un `export` suelto'); process.exit(1); }

/* ⚠️ Las primeras líneas, en ASCII puro. Un carácter raro ahí arriba se
   lo comió el editor del panel una vez y tumbó el despliegue entero. El
   resto del archivo sí lleva acentos y símbolos: eso Deno lo parsea sin
   problema, y quitarlos costaría los comentarios en español. Lo que no
   puede llevar rarezas es la cabecera, que es lo primero que toca el
   pegado. */
const cabecera = hecho.split('\n').slice(0, 15).join('\n');
const raros = [...cabecera].filter(c => c.codePointAt(0) > 126);
if (raros.length) {
  console.error('❌ la cabecera lleva caracteres no ASCII:', [...new Set(raros)].join(' '));
  console.error('   Un editor web se los puede comer y tumbar el despliegue. Déjala en ASCII.');
  process.exit(1);
}
if (hecho.includes('./normaliza.ts')) { console.error('❌ quedó el import del módulo'); process.exit(1); }

console.log('✅ cosido:', path.relative(path.resolve(__dirname, '..'), SALIDA));
console.log('  ', hecho.split('\n').length, 'líneas ·', (hecho.length / 1024).toFixed(1), 'KB');
