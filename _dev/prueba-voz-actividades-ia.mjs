/* ─────────────────────────────────────────────
   PRUEBA DEL VERIFICADOR DE voz-actividades-ia

   Uso:  node --experimental-strip-types _dev/prueba-voz-actividades-ia.mjs

   Por qué existe: la Edge Function corre en Deno, y aquí no hay Deno.
   Pero lo que puede salir torcido de esta función NO es el enchufe con
   Anthropic ni con Supabase: es lo que se hace con lo que la máquina
   devuelve. Por eso esa parte vive en verifica.ts, sin red y sin base, y
   se prueba desde Node.

   ⚠️ Y LO QUE VIGILA ES LA REGLA DEL TALLER: ninguna actividad entra sin
   una cita LITERAL del texto que la respalde. Una máquina que se inventa
   una fecha la escribe con la misma seguridad que las buenas; lo único
   que la separa es que la cita no está.
───────────────────────────────────────────── */
import * as V from '../supabase/functions/voz-actividades-ia/verifica.ts';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const AQUI = dirname(fileURLToPath(import.meta.url));

let pasan = 0, fallos = 0;
const ok = (c, q) => { c ? (pasan++, console.log('  ✅ ' + q)) : (fallos++, console.log('  ❌ ' + q)); };

const TEXTO = `## La sequía

El pozo se secó en el verano de 1927, y con él se fue medio pueblo. «Nadie vuelve a un pueblo sin agua», decía el arriero, que se llamaba Remigio Ochoa y había nacido en 1881.

## La vuelta

Volvieron tres familias en 1930: los Ochoa, los Paz y los Cárcamo. El maestro sostiene que la escuela fue lo que los trajo de vuelta, no el agua — la escuela abrió en marzo de 1931.

## Referencias

[1] Ochoa, R. (1955). Memorias del pozo. Tegucigalpa: Editorial del Sur.`;

console.log('── 1. normaliza y citaEnTexto ──');
ok(V.normaliza('  El POZO —se secó— «en 1927»  ') === 'el pozo -se seco- "en 1927"',
   'quita tildes y mayúsculas, unifica comillas y rayas, aplasta blancos');
const T = V.preparaTexto(TEXTO);
ok(V.citaEnTexto('El pozo se secó en el verano de 1927', T.norm, T.sinP), 'una cita literal se encuentra');
ok(V.citaEnTexto('"Nadie vuelve a un pueblo sin agua", decia el arriero', T.norm, T.sinP),
   'y se encuentra aunque la máquina cambie las comillas y pierda una tilde');
ok(V.citaEnTexto('la escuela abrió en marzo de 1931', T.norm, T.sinP), 'y aunque venga con la raya de otra forma');
ok(!V.citaEnTexto('El pozo se secó en el verano de 1928', T.norm, T.sinP), '⚠️ una cita con la fecha CAMBIADA no se encuentra');
ok(!V.citaEnTexto('el pozo', T.norm, T.sinP), 'y una cita de dos palabras no vale como respaldo (está en cualquier cuento)');
ok(T.palabras > 60 && T.palabras < 120, 'cuenta las palabras (' + T.palabras + ')');
ok(V.cuentaObjetivo(500) === 10 && V.cuentaObjetivo(2000) === 18 && V.cuentaObjetivo(5000) === 26 && V.cuentaObjetivo(9000) === 32,
   'la cantidad que se pide crece con el largo del texto');

console.log('── 2. limpia: lo que entra y lo que se descarta, con su motivo ──');
const crudo = [
  { k: 'flash', nivel: 'tesis', donde: 'La vuelta', cita: 'la escuela fue lo que los trajo de vuelta, no el agua',
    q: '¿Qué sostiene el maestro sobre la vuelta de las familias?', a: 'Que fue la escuela lo que los trajo, no el agua', o: [], ok: -1, ps: [], guia: '' },
  { k: 'completar', nivel: 'dato', donde: 'La sequía', cita: 'El pozo se secó en el verano de 1927',
    q: 'El pozo se secó en el verano de ___.', a: '1927', o: [], ok: -1, ps: [], guia: '' },
  // ⚠️ La respuesta inventada: la cita dice 1927 y la máquina pone 1928 en el hueco.
  { k: 'completar', nivel: 'dato', donde: 'La sequía', cita: 'El pozo se secó en el verano de 1927',
    q: 'El pozo se secó en el verano de ___ (otra).', a: '1928', o: [], ok: -1, ps: [], guia: '' },
  // ⚠️ La cita inventada: ese renglón no está en el texto.
  { k: 'flash', nivel: 'dato', donde: 'La sequía', cita: 'Remigio Ochoa murió en 1960 en la capital',
    q: '¿Cuándo murió Remigio Ochoa?', a: 'En 1960', o: [], ok: -1, ps: [], guia: '' },
  { k: 'opcion', nivel: 'dato', donde: 'La vuelta', cita: 'Volvieron tres familias en 1930',
    q: '¿En qué año volvieron las tres familias?', a: '', o: ['1927', '1930', '1931', '1955'], ok: 1, ps: [], guia: '' },
  // ⚠️ ok fuera de rango
  { k: 'opcion', nivel: 'dato', donde: 'La vuelta', cita: 'Volvieron tres familias en 1930',
    q: '¿Cuántas familias volvieron?', a: '', o: ['Dos', 'Tres', 'Cuatro'], ok: 3, ps: [], guia: '' },
  // ⚠️ «todas las anteriores»
  { k: 'opcion', nivel: 'dato', donde: 'La vuelta', cita: 'los Ochoa, los Paz y los Cárcamo',
    q: '¿Qué familias volvieron?', a: '', o: ['Los Ochoa', 'Los Paz', 'Todas las anteriores'], ok: 2, ps: [], guia: '' },
  { k: 'pares', nivel: 'relacion', donde: 'La vuelta', cita: 'los Ochoa, los Paz y los Cárcamo',
    q: 'Empareja cada cosa con su año', a: '', o: [], ok: -1,
    ps: [{ a: 'Se seca el pozo', b: '1927' }, { a: 'Vuelven tres familias', b: '1930' }, { a: 'Abre la escuela', b: '1931' }], guia: '' },
  // ⚠️ emparejar con una sola pareja
  { k: 'pares', nivel: 'relacion', donde: 'La vuelta', cita: 'Volvieron tres familias en 1930',
    q: 'Empareja', a: '', o: [], ok: -1, ps: [{ a: 'Vuelta', b: '1930' }], guia: '' },
  { k: 'abierta', nivel: 'juicio', donde: 'La vuelta', cita: 'El maestro sostiene que la escuela fue lo que los trajo de vuelta, no el agua',
    q: '¿Qué evidencia ofrece el texto de que fue la escuela y no el agua lo que trajo a las familias?', a: '', o: [], ok: -1, ps: [],
    guia: 'Solo la afirmación del maestro y la fecha de apertura de la escuela (1931), posterior a la vuelta (1930): el texto no lo demuestra.' },
  // ⚠️ abierta sin pauta
  { k: 'abierta', nivel: 'juicio', donde: 'La vuelta', cita: 'la escuela abrió en marzo de 1931',
    q: '¿Qué opinas?', a: '', o: [], ok: -1, ps: [], guia: '' },
  // ⚠️ repetida (misma cara que la primera)
  { k: 'flash', nivel: 'tesis', donde: 'La vuelta', cita: 'la escuela fue lo que los trajo de vuelta, no el agua',
    q: '¿Qué sostiene el maestro sobre la vuelta de las familias?', a: 'La escuela', o: [], ok: -1, ps: [], guia: '' },
  // ⚠️ tipo que no existe
  { k: 'ensayo', nivel: 'idea', donde: '', cita: 'Volvieron tres familias en 1930', q: 'Escribe un ensayo', a: '', o: [], ok: -1, ps: [], guia: '' },
];
const r = V.limpia(crudo, TEXTO, 40);
const tipos = r.items.map(i => i.k);
ok(r.items.length === 5, 'de 13 crudas entran 5 (' + r.items.length + ')');
ok(tipos.join(',') === 'flash,completar,opcion,pares,abierta', 'una de cada tipo, en su orden: ' + tipos.join(','));
ok(r.descartadas.length === 8, 'y se descartan 8 (' + r.descartadas.length + ')');
const motivos = r.descartadas.map(d => d.motivo);
ok(motivos.some(m => /no está en el texto/.test(m)), '⚠️ la cita inventada se descarta por «no está en el texto»');
ok(motivos.some(m => /no está en su cita/.test(m)), '⚠️ la respuesta inventada (1928 con cita de 1927) se descarta por «no está en su cita»');
ok(motivos.some(m => /sin correcta válida/.test(m)), 'el ok fuera de rango se descarta');
ok(motivos.some(m => /anteriores/.test(m)), '«todas las anteriores» se descarta');
ok(motivos.some(m => /1 parejas/.test(m)), 'emparejar con una pareja se descarta');
ok(motivos.some(m => /sin pauta/.test(m)), 'la abierta sin pauta se descarta');
ok(motivos.some(m => /repetida/.test(m)), 'la repetida se descarta');
ok(motivos.some(m => /tipo desconocido/.test(m)), 'el tipo desconocido se descarta');

console.log('── 3. La forma de la casa ──');
const f = r.items.find(i => i.k === 'flash'), c = r.items.find(i => i.k === 'completar');
const o = r.items.find(i => i.k === 'opcion'), p = r.items.find(i => i.k === 'pares'), ab = r.items.find(i => i.k === 'abierta');
ok(f.f && f.r && !('q' in f), 'la tarjeta sale con cara (f) y reverso (r), como la guarda el taller');
ok(c.q.includes('___') && c.a === '1927', 'el completar sale con su hueco y su respuesta');
ok(o.o.length === 4 && o.ok === 1 && o.o[o.ok] === '1930', 'la selección sale con sus opciones y ok como ÍNDICE');
ok(Array.isArray(p.ps) && Array.isArray(p.ps[0]) && p.ps[0][0] === 'Se seca el pozo' && p.ps.length === 3, 'las parejas salen como [[a, b], …]');
ok(ab.guia.length > 20, 'la abierta sale con su pauta');
ok(r.items.every(i => i.via === 'ia' && i.auto === 1 && i.cita && /^ia-/.test(i.id)), 'todas llevan via=ia, auto=1, su cita y un id ia-…');
ok(V.idDe('flash', '¿Qué sostiene el maestro?') === V.idDe('flash', '¿QUÉ SOSTIENE el maestro?  '), 'el id es estable: la misma cara da el mismo id');
const largo = V.limpia(Array.from({ length: 60 }, (_, i) => ({ k: 'flash', nivel: 'dato', donde: '', cita: 'Volvieron tres familias en 1930', q: 'Pregunta ' + i, a: 'r', o: [], ok: -1, ps: [], guia: '' })), TEXTO, 40);
ok(largo.items.length === 40, 'y no pasan del tope (40)');
ok(/no está en el texto/.test(V.resumeDescartes(r.descartadas)) && /1 · repetida/.test(V.resumeDescartes(r.descartadas)),
   'el resumen de descartes agrupa por motivo con su cuenta');

console.log('── 4. Lo cosido para el panel es EXACTAMENTE lo probado ──');
const cosido = readFileSync(join(AQUI, '..', 'supabase', 'functions', 'voz-actividades-ia', 'PEGAR-EN-EL-PANEL.ts'), 'utf8');
const fuente = readFileSync(join(AQUI, '..', 'supabase', 'functions', 'voz-actividades-ia', 'verifica.ts'), 'utf8');
const cuerpoEsperado = fuente.replace(/^export (function|interface|type|const) /gm, '$1 ').trim();
ok(cosido.includes(cuerpoEsperado), '⚠️ PEGAR-EN-EL-PANEL.ts lleva el verifica.ts que se acaba de probar (si no, vuelve a coser)');
ok(!/^export /m.test(cosido) && !/from "\.\/verifica\.ts"/.test(cosido), 'y no le queda ningún export ni el import del módulo');
ok(/Deno\.serve\(/.test(cosido) && /messages\.parse\(/.test(cosido) && /familia_miembros/.test(cosido), 'y trae la función entera');
ok(/^\/\/ !!! ESTO NO ES SQL/.test(cosido) && !/[^\x00-\x7f]/.test(cosido.split('\n').slice(0, 17).join('\n')),
   'y la cabecera (las 17 primeras líneas) va en ASCII puro, que es lo que el editor del panel no se come');

console.log('\nRESULTADO: ' + (fallos ? 'SUSPENDE · ' + fallos + ' fallo(s)' : 'APRUEBA') + ' (' + pasan + ' comprobaciones)');
process.exit(fallos ? 1 : 0);
