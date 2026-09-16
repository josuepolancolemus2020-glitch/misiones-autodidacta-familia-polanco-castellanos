/* ─────────────────────────────────────────────
   ARMA LA EDGE FUNCTION voz-actividades-ia EN UN SOLO ARCHIVO

   Uso:  node _dev/arma-voz-actividades-ia.js

   Por qué existe: la función son DOS archivos —index.ts y verifica.ts—
   separados por un motivo bueno: verifica.ts no toca la red ni la base,
   así que se prueba entero desde Node sin Deno. Pero desplegar dos
   archivos exige la CLI de Supabase, o sea un ordenador, y aquí se
   trabaja desde la tableta. Este script los cose en uno, listo para
   pegar en el panel (Edge Functions → Deploy a new function). Es el
   mismo aparato que _dev/arma-criba-cosecha.js, por lo mismo.

   ⚠️ Y COSE EL ARCHIVO PROBADO, NO UNA COPIA: la prueba comprueba que lo
   cosido lleva EXACTAMENTE el verifica.ts que ella misma probó.
───────────────────────────────────────────── */
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, '..', 'supabase', 'functions', 'voz-actividades-ia');
const SALIDA = path.join(DIR, 'PEGAR-EN-EL-PANEL.ts');

const verifica = fs.readFileSync(path.join(DIR, 'verifica.ts'), 'utf8');
const index    = fs.readFileSync(path.join(DIR, 'index.ts'), 'utf8');

/* Del módulo se quitan los `export`: en el mismo archivo ya no exporta
   nada, y un `export` fuera de un módulo es un error de sintaxis que solo
   se vería al desplegar. */
const cuerpo = verifica
  .replace(/^export (function|interface|type|const) /gm, '$1 ')
  .trim();

/* Y del index se quita la línea que importaba el módulo. */
const principal = index
  .replace(/^import \{[^}]*\} from "\.\/verifica\.ts";\s*$/m, '')
  .trim();

/* ⚠️ LA CABECERA VA EN ASCII PURO Y CORTA: el editor del panel se
   atragantó una vez con un cuadro de caracteres dobles y Deno rechazó el
   despliegue entero (ver _dev/arma-criba-cosecha.js). */
const AVISO = `// !!! ESTO NO ES SQL. NO LO PEGUES EN EL EDITOR SQL. !!!
//
// Va en: Supabase -> Edge Functions -> Deploy a new function
//        Nombre exacto: voz-actividades-ia
//        Y en sus ajustes: "Enforce JWT Verification" = OFF
// Y antes o despues, en Edge Functions -> Secrets:
//        ANTHROPIC_API_KEY = la clave de la API de Anthropic
//
// ARCHIVO GENERADO - NO SE EDITA A MANO. Lo cose
// node _dev/arma-voz-actividades-ia.js  a partir de verifica.ts e index.ts,
// que son los que se prueban:
//   node --experimental-strip-types _dev/prueba-voz-actividades-ia.mjs
// Si editas AQUI, el arreglo se pierde al volver a coser.
//
// Cosido el ${new Date().toISOString().slice(0, 10)}.
`;

fs.writeFileSync(SALIDA,
  AVISO + '\n' +
  '// ========== 1 de 2 - verifica.ts ==========\n\n' + cuerpo + '\n\n' +
  '// ========== 2 de 2 - index.ts ==========\n\n' + principal + '\n');

const hecho = fs.readFileSync(SALIDA, 'utf8');
const faltan = ['function normaliza(', 'function citaEnTexto(', 'function limpia(',
                'Deno.serve(', 'messages.parse(', 'familia_miembros', 'ANTHROPIC_API_KEY']
  .filter(t => !hecho.includes(t));
if (faltan.length) {
  console.error('❌ Al cosido le faltan piezas: ' + faltan.join(', '));
  process.exit(1);
}
if (/^export /m.test(hecho) || /from "\.\/verifica\.ts"/.test(hecho)) {
  console.error('❌ El cosido conserva un export o el import del módulo');
  process.exit(1);
}
console.log('✅ Cosido en ' + path.relative(process.cwd(), SALIDA) + ' (' + hecho.length + ' caracteres)');
