/* Inyecta los bancos de la misión «Anatomía de la Constitución de 1982»
   (Ruta de la Ley y sus Grietas, etapa 2) sobre el molde copiado de la etapa 1.
   Uso:  node _dev/inyecta-bancos-ley-anatomia.js

   REGLA DE LA RUTA: aquí no se cita nada de memoria. Comprobado contra fuente
   el 11 de agosto de 2026, y por eso va con su número:

     · la Constitución vigente es el Decreto 131 del 11 de enero de 1982,
       publicado en La Gaceta 23,612 del 20 de enero de 1982;
     · tiene 8 títulos, 43 capítulos y 378 artículos;
     · Título I De la Organización del Estado · II De la Nacionalidad y
       Ciudadanía · III De las Declaraciones, Derechos y Garantías · IV De las
       Garantías Constitucionales · V De los Poderes del Estado · VI Del
       Régimen Económico · VII De la Reforma y la Inviolabilidad de la
       Constitución · VIII De las Disposiciones Transitorias y de la Vigencia;
     · art. 373: la reforma se decreta en sesiones ordinarias con dos tercios
       de votos de la totalidad de los miembros, el decreto señala el artículo
       o artículos, y debe ratificarse por la subsiguiente legislatura
       ordinaria por igual número de votos para entrar en vigencia;
     · art. 374: no podrán reformarse en ningún caso el artículo anterior, el
       presente artículo, ni los que se refieren a la forma de gobierno, al
       territorio nacional, al período presidencial, a la prohibición de ser
       nuevamente Presidente quien lo haya desempeñado bajo cualquier título,
       y el referente a quienes no pueden serlo por el período subsiguiente;
     · art. 375: la Constitución no pierde vigencia ni deja de cumplirse por
       acto de fuerza ni cuando fuere supuestamente derogada o modificada por
       medio distinto del que ella dispone;
     · art. 4: la alternabilidad en el ejercicio de la Presidencia es
       obligatoria, y su infracción es delito de traición a la Patria;
     · art. 182: habeas corpus y habeas data. La reforma que metió el habeas
       data se intentó por Decreto 381-2005 y se cayó por falta de
       ratificación; se volvió a intentar por Decreto 237-2012, se ratificó
       por Decreto 10-2013 y entró en vigor en marzo de 2013.

   Un dato que NO entra por no estar comprobado: cuántas constituciones ha
   tenido Honduras. Las fuentes dan 12, 14 y 16 según cómo se cuente, así que
   la misión enseña la discrepancia en vez de elegir un número. Eso también es
   la regla de la ruta funcionando.                                        */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const ARCHIVO = path.join(RAIZ, 'misiones', 'ruta-ley-anatomia-constitucion', 'js', 'anatomia-constitucion.js');

/* ---------- sopa de letras: generador determinista ---------- */
let _semilla = 20260812;
function rnd() { _semilla = (_semilla * 1103515245 + 12345) % 2147483648; return _semilla / 2147483648; }
const ABC = 'ABCDEFGHIJLMNOPRSTUVZ';

function haceSopa(size, palabras) {
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const dirs = [[0, 1], [1, 0], [1, 1]];
  const salida = [];
  for (const w of palabras) {
    let puesto = false;
    for (let intento = 0; intento < 800 && !puesto; intento++) {
      const [dr, dc] = dirs[Math.floor(rnd() * dirs.length)];
      const r0 = Math.floor(rnd() * size), c0 = Math.floor(rnd() * size);
      if (r0 + dr * (w.length - 1) >= size || c0 + dc * (w.length - 1) >= size) continue;
      let cabe = true;
      for (let i = 0; i < w.length; i++) {
        const ch = grid[r0 + dr * i][c0 + dc * i];
        if (ch !== null && ch !== w[i]) { cabe = false; break; }
      }
      if (!cabe) continue;
      const cells = [];
      for (let i = 0; i < w.length; i++) { grid[r0 + dr * i][c0 + dc * i] = w[i]; cells.push([r0 + dr * i, c0 + dc * i]); }
      salida.push({ w, cells });
      puesto = true;
    }
    if (!puesto) throw new Error('No cupo la palabra ' + w);
  }
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++)
    if (grid[r][c] === null) grid[r][c] = ABC[Math.floor(rnd() * ABC.length)];
  return { size, grid, words: salida };
}

const B = {};

/* ---------- flashcards ---------- */
B.fcData = JSON.stringify([
  { w: 'Decreto 131 de 1982', a: '📜 La Constitución vigente. Decretada el <strong>11 de enero de 1982</strong> y publicada en La Gaceta 23,612 del <strong>20 de enero de 1982</strong>. Citarla completa, con decreto y fecha, es lo que separa una cita comprobada de un recuerdo.' },
  { w: 'Ocho títulos', a: '🗺️ El mapa entero: <strong>8 títulos, 43 capítulos y 378 artículos</strong>. Saber en qué título vive un tema ahorra media hora de búsqueda cada vez, y evita citar un artículo que trata de otra cosa.' },
  { w: 'Parte dogmática', a: '🙋 Los títulos I a IV: qué es el Estado, quién es hondureño, qué derechos se declaran y con qué garantías se defienden. Es <strong>la parte que habla de ti</strong>.' },
  { w: 'Parte orgánica', a: '🏛️ Los títulos V y VI: los poderes del Estado y el régimen económico. Es <strong>la parte que habla de quién manda</strong>, y es la que casi nadie lee aunque decide más.' },
  { w: 'Supuesto de hecho', a: '🎯 La primera pieza de un artículo: <strong>en qué caso se aplica</strong>. Si el caso de uno no encaja en el supuesto, el artículo no dice nada de uno, por bonito que suene.' },
  { w: 'Consecuencia', a: '⚙️ La segunda pieza: <strong>qué pasa cuando el supuesto se cumple</strong>. Un derecho reconocido sin consecuencia escrita es una declaración, y se defiende distinto.' },
  { w: 'Excepción', a: '🚪 La tercera pieza: <strong>el caso en que no se aplica</strong> lo anterior. Suele empezar con «salvo», «excepto» o «no obstante», y es lo primero que busca quien va a decir que no.' },
  { w: 'Remisión', a: '➡️ La cuarta pieza: el artículo <strong>manda a otra norma</strong> a completar lo que él no dice. «Conforme lo determine la ley», «en los casos que la ley señale». Es la puerta por donde entra el reglamento a decidir.' },
  { w: 'Por qué importa la remisión', a: '🔑 Porque el artículo parece haber decidido y <strong>no decidió</strong>. Quien escribe la ley que completa la remisión escribe el contenido real del derecho, y casi siempre es un escalón más abajo.' },
  { w: 'Artículo 373', a: '🔁 La reforma se decreta en sesiones ordinarias con <strong>dos tercios de la totalidad de los miembros</strong>, el decreto señala qué artículos se reforman, y debe <strong>ratificarse por la subsiguiente legislatura ordinaria</strong> por igual número de votos para entrar en vigencia.' },
  { w: 'La ratificación', a: '⏳ La pieza del 373 que más reformas se lleva por delante: no basta con aprobar una vez. Hace falta que <strong>la legislatura siguiente vuelva a votarlo</strong>. Una reforma sin ratificar no entró nunca en vigencia, aunque se celebrara.' },
  { w: 'Artículo 374', a: '🪨 Lo que <strong>no podrá reformarse en ningún caso</strong>: el artículo anterior, el presente artículo, y los que se refieren a la forma de gobierno, al territorio nacional, al período presidencial, a la prohibición de repetir en la Presidencia y a quiénes no pueden serlo por el período subsiguiente.' },
  { w: 'Artículo 375', a: '🛡️ La Constitución <strong>no pierde vigencia ni deja de cumplirse por acto de fuerza</strong>, ni cuando fuere supuestamente derogada o modificada por un medio distinto del que ella dispone. Es la respuesta escrita al «ahora manda otro».' },
  { w: 'Artículo 4', a: '🔄 La <strong>alternabilidad</strong> en el ejercicio de la Presidencia es obligatoria, y su infracción constituye delito de traición a la Patria. Es uno de los que el 374 protege.' },
  { w: 'El habeas data', a: '📂 El ejemplo real del 373: la reforma que lo metió en el artículo 182 se intentó una vez (Decreto 381-2005) y <strong>se cayó por falta de ratificación</strong>. Años después se volvió a intentar (237-2012), se ratificó (10-2013) y entró en vigor. Mismo contenido, dos resultados.' },
  { w: 'Cuántas constituciones', a: '🤔 Depende de quién cuente: hay fuentes que dicen doce, otras catorce y otras dieciséis, según si se cuentan las del período federal y si una reforma grande cuenta como texto nuevo. <strong>Aquí no se elige un número:</strong> se explica por qué no cuadra. Eso es la regla de la ruta funcionando.' },
]);

/* ---------- quiz ---------- */
B.qzData = JSON.stringify([
  { q: '¿Qué hace falta para que una reforma constitucional entre en vigencia, según el artículo 373?', o: ['a) Que la apruebe el Congreso con mayoría simple', 'b) Dos tercios y ratificación por la legislatura siguiente', 'c) Un referendo', 'd) La firma del Presidente'], c: 1 },
  { q: 'Una reforma se aprueba con dos tercios y la legislatura siguiente no la ratifica. ¿Qué pasa?', o: ['a) Entra en vigencia igual', 'b) Entra a los dos años', 'c) No entra en vigencia', 'd) Queda a criterio del Ejecutivo'], c: 2 },
  { q: '¿Qué protege el artículo 374?', o: ['a) Todos los derechos individuales', 'b) El presupuesto del Estado', 'c) Los tratados internacionales', 'd) Entre otros, la forma de gobierno y el período presidencial'], c: 3 },
  { q: 'En un artículo, «conforme lo determine la ley» es…', o: ['a) Una remisión', 'b) Una excepción', 'c) El supuesto de hecho', 'd) La consecuencia'], c: 0 },
  { q: '¿Por qué importa detectar una remisión?', o: ['a) Porque alarga el artículo', 'b) Porque el contenido real lo decide otra norma, más abajo', 'c) Porque anula el artículo', 'd) Porque obliga a un referendo'], c: 1 },
  { q: 'La parte dogmática de la Constitución trata de…', o: ['a) El presupuesto', 'b) Los poderes del Estado', 'c) El Estado, la nacionalidad, los derechos y sus garantías', 'd) Las disposiciones transitorias'], c: 2 },
  { q: '¿Qué dice el artículo 375?', o: ['a) Que la Constitución se reforma cada diez años', 'b) Que el Congreso la interpreta', 'c) Que caduca con cada gobierno', 'd) Que no pierde vigencia por acto de fuerza'], c: 3 },
  { q: 'La reforma del habeas data del artículo 182 se cayó la primera vez porque…', o: ['a) La vetó el Ejecutivo', 'b) No se ratificó en la legislatura siguiente', 'c) Era un artículo pétreo', 'd) No se publicó'], c: 1 },
  { q: 'Antes de repetir un artículo que alguien le citó, lo primero es comprobar…', o: ['a) Que quien lo cita tenga cargo', 'b) Que suene razonable', 'c) Su texto vigente y el decreto que lo reformó', 'd) Que esté en la parte dogmática'], c: 2 },
  { q: '¿Cuántas constituciones ha tenido Honduras?', o: ['a) Doce, sin discusión', 'b) Depende de cómo se cuente: las fuentes no coinciden', 'c) Dieciséis, sin discusión', 'd) Una sola desde 1825'], c: 1 },
]);

/* ---------- clasificación ---------- */
B.classGroups = JSON.stringify([
  {
    label: ['Dogmática', 'Orgánica'], headA: '🙋 Parte dogmática', headB: '🏛️ Parte orgánica', colA: 'ok', colB: 'no',
    words: [
      { w: 'Los derechos individuales', t: 'ok' }, { w: 'Las atribuciones del Congreso', t: 'no' },
      { w: 'Quién es hondureño', t: 'ok' }, { w: 'El Poder Judicial', t: 'no' },
      { w: 'El habeas corpus', t: 'ok' }, { w: 'El régimen económico', t: 'no' },
      { w: 'Las garantías constitucionales', t: 'ok' }, { w: 'El presupuesto del Estado', t: 'no' },
    ],
  },
  {
    label: ['Pétreo', 'Se puede reformar'], headA: '🪨 Pétreo (art. 374)', headB: '🔁 Se puede reformar', colA: 'ok', colB: 'no',
    words: [
      { w: 'La forma de gobierno', t: 'ok' }, { w: 'El régimen económico', t: 'no' },
      { w: 'El territorio nacional', t: 'ok' }, { w: 'Las garantías del artículo 182', t: 'no' },
      { w: 'El período presidencial', t: 'ok' }, { w: 'Las atribuciones de una Secretaría', t: 'no' },
      { w: 'El propio artículo 374', t: 'ok' }, { w: 'El régimen de la educación', t: 'no' },
    ],
  },
  {
    label: ['Remisión', 'Mandato cerrado'], headA: '➡️ Remite a otra norma', headB: '🔒 Decide él mismo', colA: 'ok', colB: 'no',
    words: [
      { w: '«Conforme lo determine la ley»', t: 'ok' }, { w: '«Es inviolable»', t: 'no' },
      { w: '«En los casos que la ley señale»', t: 'ok' }, { w: '«Se prohíbe en todo caso»', t: 'no' },
      { w: '«Según el procedimiento que la ley establezca»', t: 'ok' }, { w: '«No podrá reformarse en ningún caso»', t: 'no' },
      { w: '«La ley regulará esta materia»', t: 'ok' }, { w: '«Con dos tercios de votos»', t: 'no' },
    ],
  },
  {
    label: ['Reforma válida', 'No entra en vigencia'], headA: '✅ La reforma entra', headB: '❌ No entra', colA: 'ok', colB: 'no',
    words: [
      { w: 'Dos tercios y ratificada por la siguiente legislatura', t: 'ok' }, { w: 'Dos tercios pero sin ratificar', t: 'no' },
      { w: 'Señalando qué artículos se reforman', t: 'ok' }, { w: 'Aprobada con mayoría simple', t: 'no' },
      { w: 'Decretada en sesiones ordinarias', t: 'ok' }, { w: 'Sobre un artículo pétreo', t: 'no' },
      { w: 'Ratificada por igual número de votos', t: 'ok' }, { w: 'Impuesta por un acto de fuerza', t: 'no' },
    ],
  },
]);

/* ---------- identificar ---------- */
B.idData = JSON.stringify([
  { s: ['El', 'supuesto', 'dice', 'en', 'qué', 'caso', 'se', 'aplica.'], c: 1, art: 'En qué caso se aplica' },
  { s: ['La', 'consecuencia', 'dice', 'qué', 'pasa', 'entonces.'], c: 1, art: 'Qué pasa entonces' },
  { s: ['La', 'excepción', 'saca', 'un', 'caso', 'de', 'la', 'regla.'], c: 1, art: 'Lo que queda fuera' },
  { s: ['La', 'remisión', 'manda', 'a', 'otra', 'norma', 'a', 'decidir.'], c: 1, art: 'La puerta al reglamento' },
  { s: ['La', 'ratificación', 'la', 'hace', 'la', 'legislatura', 'siguiente.'], c: 1, art: 'El segundo voto' },
  { s: ['Un', 'artículo', 'pétreo', 'no', 'se', 'reforma', 'nunca.'], c: 2, art: 'Lo que no se toca' },
  { s: ['La', 'alternabilidad', 'en', 'la', 'Presidencia', 'es', 'obligatoria.'], c: 1, art: 'Lo que manda el artículo 4' },
  { s: ['La', 'inviolabilidad', 'resiste', 'los', 'actos', 'de', 'fuerza.'], c: 1, art: 'Lo que manda el artículo 375' },
]);

/* ---------- completa ---------- */
B.cmpData = JSON.stringify([
  { s: 'La reforma pide dos tercios y ___ por la legislatura siguiente.', opts: ['publicación', 'ratificación', 'reglamento'], c: 1 },
  { s: 'Lo que no se puede reformar en ningún caso se llama ___.', opts: ['orgánico', 'transitorio', 'pétreo'], c: 2 },
  { s: '«Conforme lo determine la ley» es una ___.', opts: ['remisión', 'excepción', 'consecuencia'], c: 0 },
  { s: 'La parte que habla de los poderes del Estado es la ___.', opts: ['dogmática', 'orgánica', 'transitoria'], c: 1 },
  { s: 'La Constitución vigente es el Decreto ___ de 1982.', opts: ['131', '182', '244'], c: 0 },
  { s: 'La Constitución no pierde vigencia por un acto de ___.', opts: ['gobierno', 'fuerza', 'comercio'], c: 1 },
  { s: 'El caso en que no se aplica la regla es la ___.', opts: ['remisión', 'consecuencia', 'excepción'], c: 2 },
  { s: 'La alternabilidad en la Presidencia es ___.', opts: ['obligatoria', 'opcional', 'reglamentaria'], c: 0 },
]);

/* ---------- reto de 30 segundos ---------- */
B.retoPairs = JSON.stringify([
  {
    label: ['Dogmática', 'Orgánica'], btnA: '🙋 Dogmática', btnB: '🏛️ Orgánica', colA: 'ok', colB: 'no',
    words: [
      { w: 'Los derechos individuales', t: 'ok' }, { w: 'El Congreso Nacional', t: 'no' },
      { w: 'Quién es hondureño', t: 'ok' }, { w: 'El Poder Judicial', t: 'no' },
      { w: 'El habeas corpus', t: 'ok' }, { w: 'El régimen económico', t: 'no' },
      { w: 'Las garantías', t: 'ok' }, { w: 'El presupuesto', t: 'no' },
      { w: 'La libertad personal', t: 'ok' }, { w: 'Las Secretarías de Estado', t: 'no' },
    ],
  },
  {
    label: ['Pétreo', 'Reformable'], btnA: '🪨 Pétreo', btnB: '🔁 Reformable', colA: 'ok', colB: 'no',
    words: [
      { w: 'La forma de gobierno', t: 'ok' }, { w: 'El régimen económico', t: 'no' },
      { w: 'El territorio nacional', t: 'ok' }, { w: 'El habeas data', t: 'no' },
      { w: 'El período presidencial', t: 'ok' }, { w: 'La educación', t: 'no' },
      { w: 'El propio artículo 374', t: 'ok' }, { w: 'Los trámites de una Secretaría', t: 'no' },
      { w: 'El artículo 373', t: 'ok' }, { w: 'El régimen de la moneda', t: 'no' },
    ],
  },
  {
    label: ['Remite', 'Cierra'], btnA: '➡️ Remite', btnB: '🔒 Cierra', colA: 'ok', colB: 'no',
    words: [
      { w: '«Conforme lo determine la ley»', t: 'ok' }, { w: '«Es inviolable»', t: 'no' },
      { w: '«En los casos que la ley señale»', t: 'ok' }, { w: '«Se prohíbe en todo caso»', t: 'no' },
      { w: '«La ley regulará esta materia»', t: 'ok' }, { w: '«No podrá reformarse nunca»', t: 'no' },
      { w: '«Según el procedimiento legal»', t: 'ok' }, { w: '«Con dos tercios de votos»', t: 'no' },
      { w: '«Conforme al reglamento»', t: 'ok' }, { w: '«Queda terminantemente prohibido»', t: 'no' },
    ],
  },
]);

/* ---------- ordenar pasos ---------- */
B.routeSets = JSON.stringify([
  {
    label: 'Cómo se reforma la Constitución, de principio a fin (art. 373)',
    steps: [
      'Se presenta el proyecto de reforma en sesiones ordinarias del Congreso',
      'El decreto señala expresamente el artículo o los artículos que se reforman',
      'Se aprueba con dos tercios de votos de la totalidad de los miembros',
      'Pasa a la subsiguiente legislatura ordinaria',
      'Esa legislatura lo ratifica por igual número de votos',
      'Se publica y entra en vigencia',
    ],
  },
  {
    label: 'Cómo se lee un artículo por piezas, en orden',
    steps: [
      'Leer el artículo entero una vez, sin subrayar nada',
      'Marcar el supuesto de hecho: en qué caso se aplica',
      'Marcar la consecuencia: qué pasa cuando el supuesto se cumple',
      'Buscar la excepción: «salvo», «excepto», «no obstante»',
      'Buscar la remisión: «conforme la ley», «en los casos que la ley señale»',
      'Ir a buscar esa otra norma, que es donde estará el contenido real',
    ],
  },
  {
    label: 'Cómo se comprueba un artículo antes de citarlo',
    steps: [
      'Buscar el texto en una fuente oficial, no en un resumen',
      'Comprobar en qué título y capítulo vive, para saber de qué trata',
      'Ver si tiene decreto de reforma y desde cuándo rige la versión nueva',
      'Leerlo por piezas y anotar sus remisiones',
      'Apuntar norma, artículo, decreto y fecha de consulta',
      'Y solo entonces citarlo, en voz alta o por escrito',
    ],
  },
]);

/* ---------- identificar la pieza por su descripción ---------- */
B.neuronPartes = JSON.stringify([
  { desc: 'La parte del artículo que dice en qué caso se aplica', ans: 'El supuesto de hecho', opts: ['El supuesto de hecho', 'La consecuencia', 'La excepción', 'La remisión'] },
  { desc: 'Lo que ocurre cuando el supuesto se cumple', ans: 'La consecuencia', opts: ['La consecuencia', 'El supuesto de hecho', 'La remisión', 'La ratificación'] },
  { desc: 'El caso que queda fuera de la regla', ans: 'La excepción', opts: ['La excepción', 'La remisión', 'La consecuencia', 'El título'] },
  { desc: 'Cuando el artículo manda a otra norma a completar lo que él no dice', ans: 'La remisión', opts: ['La remisión', 'La excepción', 'El supuesto de hecho', 'La reforma'] },
  { desc: 'El segundo voto, el de la legislatura siguiente', ans: 'La ratificación', opts: ['La ratificación', 'La sanción', 'La publicación', 'La consecuencia'] },
  { desc: 'Lo que no puede reformarse en ningún caso', ans: 'El artículo pétreo', opts: ['El artículo pétreo', 'La disposición transitoria', 'La remisión', 'El capítulo orgánico'] },
  { desc: 'La parte de la Constitución que trata de los poderes del Estado', ans: 'La parte orgánica', opts: ['La parte orgánica', 'La parte dogmática', 'Las transitorias', 'Las garantías'] },
  { desc: 'Que la Constitución siga rigiendo aunque alguien la desconozca por la fuerza', ans: 'La inviolabilidad', opts: ['La inviolabilidad', 'La vigencia', 'La ratificación', 'La supremacía'] },
]);

/* ---------- ¿en qué título vive? ---------- */
B.neuroPairs = JSON.stringify([
  { trans: 'Los derechos individuales y sociales', func: 'Título III: Declaraciones, Derechos y Garantías', opts: ['Título III: Declaraciones, Derechos y Garantías', 'Título V: Poderes del Estado', 'Título VI: Régimen Económico', 'Título I: Organización del Estado'] },
  { trans: 'El habeas corpus y el habeas data', func: 'Título IV: Garantías Constitucionales', opts: ['Título IV: Garantías Constitucionales', 'Título III: Declaraciones, Derechos y Garantías', 'Título II: Nacionalidad y Ciudadanía', 'Título VII: Reforma e Inviolabilidad'] },
  { trans: 'Las atribuciones del Congreso Nacional', func: 'Título V: Poderes del Estado', opts: ['Título V: Poderes del Estado', 'Título I: Organización del Estado', 'Título VI: Régimen Económico', 'Título IV: Garantías Constitucionales'] },
  { trans: 'Los tratados y su lugar frente a la ley', func: 'Título I: Organización del Estado', opts: ['Título I: Organización del Estado', 'Título V: Poderes del Estado', 'Título III: Declaraciones, Derechos y Garantías', 'Título VIII: Disposiciones Transitorias'] },
  { trans: 'Cómo se reforma la Constitución y qué no se puede tocar', func: 'Título VII: Reforma e Inviolabilidad', opts: ['Título VII: Reforma e Inviolabilidad', 'Título VIII: Disposiciones Transitorias', 'Título I: Organización del Estado', 'Título V: Poderes del Estado'] },
]);

/* ---------- diagnóstico: ¿por dónde falla? ---------- */
B.enfermedadData = JSON.stringify([
  { disease: 'Una reforma se aprobó con dos tercios y nunca entró en vigencia', characteristic: 'Le faltó la ratificación de la legislatura siguiente', opts: ['Le faltó la ratificación de la legislatura siguiente', 'No se publicó en La Gaceta', 'La vetó el Ejecutivo', 'Era una remisión'] },
  { disease: 'Se propone reformar el período presidencial con dos tercios', characteristic: 'Es materia pétrea: el 374 la excluye en todo caso', opts: ['Es materia pétrea: el 374 la excluye en todo caso', 'Falta la publicación', 'Hace falta mayoría simple', 'Lo decide el Ejecutivo'] },
  { disease: 'El artículo reconoce un derecho y en la práctica lo define un reglamento', characteristic: 'El artículo traía una remisión y nadie la leyó', opts: ['El artículo traía una remisión y nadie la leyó', 'El artículo es pétreo', 'El artículo fue derogado', 'Falta ratificación'] },
  { disease: 'Alguien cita un artículo y el texto que lee no coincide con el vigente', characteristic: 'El artículo fue reformado y se citó la versión vieja', opts: ['El artículo fue reformado y se citó la versión vieja', 'El artículo es de la parte orgánica', 'El artículo tiene una excepción', 'Es un artículo pétreo'] },
  { disease: 'Dicen que la Constitución ya no rige porque cambió quien manda', characteristic: 'El artículo 375 dice justamente lo contrario', opts: ['El artículo 375 dice justamente lo contrario', 'Es correcto si hay acuerdo', 'Depende del Congreso', 'Solo aplica a las transitorias'] },
  { disease: 'Se busca el régimen de la educación en el título de las garantías', characteristic: 'Es problema de mapa: se está buscando en el título equivocado', opts: ['Es problema de mapa: se está buscando en el título equivocado', 'El artículo fue derogado', 'Falta ratificación', 'Es materia pétrea'] },
]);

/* ---------- generador de tareas ---------- */
B.identifyTaskDB = JSON.stringify([
  { s: 'La parte del artículo que dice en qué caso se aplica.', type: 'Supuesto de hecho' },
  { s: 'Lo que ocurre cuando el supuesto se cumple.', type: 'Consecuencia' },
  { s: 'El caso que queda fuera de la regla.', type: 'Excepción' },
  { s: 'Cuando el artículo manda a otra norma a completar lo que no dice.', type: 'Remisión' },
  { s: 'El segundo voto, el de la legislatura siguiente.', type: 'Ratificación' },
  { s: 'Lo que no puede reformarse en ningún caso.', type: 'Artículo pétreo' },
  { s: 'Los títulos que hablan del Estado, la nacionalidad, los derechos y sus garantías.', type: 'Parte dogmática' },
  { s: 'Los títulos que hablan de los poderes y del régimen económico.', type: 'Parte orgánica' },
  { s: 'Que la Constitución siga rigiendo pese a un acto de fuerza.', type: 'Inviolabilidad' },
  { s: 'El decreto y la fecha con que se identifica el texto vigente.', type: 'Identificación de la norma' },
]);
B.classifyTaskDB = JSON.stringify([
  { w: 'Los derechos individuales', gen: 'Parte', n: 'Habla de ti', g: 'Dogmática', t: 'Título III' },
  { w: 'El habeas corpus', gen: 'Parte', n: 'Cómo se defiende un derecho', g: 'Dogmática', t: 'Título IV' },
  { w: 'Quién es hondureño', gen: 'Parte', n: 'Nacionalidad y ciudadanía', g: 'Dogmática', t: 'Título II' },
  { w: 'Los tratados', gen: 'Parte', n: 'Organización del Estado', g: 'Dogmática', t: 'Título I' },
  { w: 'El Congreso Nacional', gen: 'Parte', n: 'Quién legisla', g: 'Orgánica', t: 'Título V' },
  { w: 'El Poder Judicial', gen: 'Parte', n: 'Quién juzga', g: 'Orgánica', t: 'Título V' },
  { w: 'El régimen económico', gen: 'Parte', n: 'Moneda, banca y presupuesto', g: 'Orgánica', t: 'Título VI' },
  { w: 'La reforma constitucional', gen: 'Parte', n: 'Cómo se cambia el texto', g: 'Orgánica', t: 'Título VII' },
  { w: 'La inviolabilidad', gen: 'Parte', n: 'Qué pasa ante un acto de fuerza', g: 'Orgánica', t: 'Título VII' },
  { w: 'Las disposiciones transitorias', gen: 'Parte', n: 'El paso de un texto a otro', g: 'Orgánica', t: 'Título VIII' },
]);
B.completeTaskDB = JSON.stringify([
  { s: 'La reforma pide dos tercios y ___ por la legislatura siguiente.', opts: ['ratificación', 'publicación', 'reglamento'], ans: 'ratificación' },
  { s: 'Lo que no se reforma en ningún caso es ___.', opts: ['pétreo', 'transitorio', 'orgánico'], ans: 'pétreo' },
  { s: '«Conforme lo determine la ley» es una ___.', opts: ['remisión', 'excepción', 'consecuencia'], ans: 'remisión' },
  { s: 'Los poderes del Estado están en la parte ___.', opts: ['orgánica', 'dogmática', 'transitoria'], ans: 'orgánica' },
  { s: 'La Constitución vigente es el Decreto ___ de 1982.', opts: ['131', '182', '244'], ans: '131' },
  { s: 'La Constitución no pierde vigencia por un acto de ___.', opts: ['fuerza', 'gobierno', 'comercio'], ans: 'fuerza' },
  { s: 'El caso que queda fuera de la regla es la ___.', opts: ['excepción', 'remisión', 'consecuencia'], ans: 'excepción' },
  { s: 'La Constitución tiene ocho ___.', opts: ['títulos', 'capítulos', 'libros'], ans: 'títulos' },
]);
B.explainQuestions = JSON.stringify([
  { q: 'Explica el procedimiento de reforma del artículo 373 y cuál de sus pasos se lleva por delante más reformas.', ans: 'La reforma se decreta en sesiones ordinarias del Congreso con dos tercios de votos de la totalidad de sus miembros, el decreto señala expresamente qué artículo o artículos se reforman, y debe ratificarse por la subsiguiente legislatura ordinaria por igual número de votos para entrar en vigencia. El paso que más reformas se lleva por delante es el segundo voto: aprobar una vez no basta, y una reforma sin ratificar no entró nunca en vigencia aunque se haya celebrado. El habeas data del artículo 182 es el ejemplo real: se cayó por eso en el primer intento.' },
  { q: '¿Qué es una remisión dentro de un artículo y por qué conviene detectarla antes de alegrarse?', ans: 'Es la pieza por la que el artículo manda a otra norma a completar lo que él no dice: «conforme lo determine la ley», «en los casos que la ley señale». Conviene detectarla porque el artículo parece haber decidido y no decidió: el contenido real del derecho lo escribirá esa otra norma, que casi siempre está un escalón más abajo y la dicta quien tiene interés en el asunto. Leer un derecho sin mirar sus remisiones es leer la mitad.' },
  { q: 'Explica qué protege el artículo 374 y por qué se protege también a sí mismo.', ans: 'Excluye de reforma, en todo caso, al artículo anterior, a sí mismo, y a los artículos referidos a la forma de gobierno, al territorio nacional, al período presidencial, a la prohibición de ser nuevamente Presidente quien lo haya desempeñado bajo cualquier título y a quiénes no pueden serlo por el período subsiguiente. Se protege a sí mismo porque, si no lo hiciera, bastaría con reformar el 374 primero para poder reformar después todo lo demás: el candado que se puede quitar no es un candado.' },
  { q: '¿Para qué sirve el artículo 375 y en qué se diferencia del 374?', ans: 'El 374 dice qué no se puede cambiar por el procedimiento normal. El 375 mira al otro lado: dice que la Constitución no pierde vigencia ni deja de cumplirse por un acto de fuerza, ni cuando fuere supuestamente derogada o modificada por un medio distinto del que ella dispone. Uno protege contra la reforma indebida; el otro, contra el desconocimiento de hecho. Y el 375 añade un deber para todo ciudadano, con autoridad o sin ella, de colaborar en el restablecimiento de su vigencia.' },
  { q: 'Alguien te cita un artículo en una reunión. ¿Qué haces antes de aceptarlo o discutirlo?', ans: 'Comprobarlo, y son cinco minutos: buscar el texto en fuente oficial y no en un resumen; ver en qué título y capítulo vive, porque eso dice de qué trata de verdad; mirar si tiene decreto de reforma y desde cuándo rige la versión nueva; leerlo por piezas anotando sus remisiones; y apuntar norma, artículo, decreto y fecha de consulta. Discutir el fondo de un artículo que no se ha comprobado es apostar la credibilidad de todo lo demás.' },
  { q: '¿Por qué esta misión no dice cuántas constituciones ha tenido Honduras?', ans: 'Porque las fuentes no coinciden: hay quien cuenta doce, quien cuenta catorce y quien cuenta dieciséis, según si se incluyen los textos del período federal y si una reforma muy grande cuenta como constitución nueva. La regla de esta ruta es que no se cita nada de memoria ni nada sin comprobar, así que en vez de elegir el número que suena mejor se explica por qué no cuadra. Un dato discutido, contado como discutido, es información. Contado como cierto, es una trampa que estalla en la primera reunión donde alguien sepa del tema.' },
]);

/* ---------- sopa de letras ---------- */
B.sopaSets = JSON.stringify([
  haceSopa(10, ['TITULO', 'DECRETO', 'GACETA', 'REFORMA', 'PETREO', 'VIGENCIA']),
  haceSopa(10, ['DOGMATICA', 'ORGANICA', 'REMISION', 'EXCEPCION', 'MANDATO', 'CAPITULO']),
  haceSopa(10, ['CONGRESO', 'RATIFICAR', 'SUPUESTO', 'TERCIOS', 'ARTICULO', 'PODERES']),
]);

/* ---------- evaluación conceptual ---------- */
B.evalTFBank = JSON.stringify([
  { q: 'Una reforma aprobada con dos tercios entra en vigencia sin más trámite.', a: false },
  { q: 'La reforma debe ratificarse por la subsiguiente legislatura ordinaria por igual número de votos.', a: true },
  { q: 'El decreto de reforma debe señalar el artículo o artículos que se reforman.', a: true },
  { q: 'El artículo 374 también se protege a sí mismo de la reforma.', a: true },
  { q: 'El período presidencial se puede reformar con dos tercios.', a: false },
  { q: 'La Constitución vigente es el Decreto 131 de 1982.', a: true },
  { q: 'Una remisión es el caso en que la regla no se aplica.', a: false },
  { q: '«Conforme lo determine la ley» manda a otra norma a completar el artículo.', a: true },
  { q: 'La parte dogmática trata de los poderes del Estado.', a: false },
  { q: 'Las garantías constitucionales viven en el Título IV.', a: true },
  { q: 'La Constitución pierde vigencia si un acto de fuerza la desconoce.', a: false },
  { q: 'La alternabilidad en el ejercicio de la Presidencia es obligatoria.', a: true },
  { q: 'El habeas data entró en la Constitución en el primer intento de reforma.', a: false },
  { q: 'Un artículo puede tener supuesto, consecuencia, excepción y remisión.', a: true },
  { q: 'Todas las fuentes coinciden en cuántas constituciones ha tenido Honduras.', a: false },
]);
B.evalMCBank = JSON.stringify([
  { q: '¿Con cuántos votos se decreta una reforma constitucional?', o: ['a) Mayoría simple', 'b) Dos tercios de la totalidad de los miembros', 'c) Tres cuartos', 'd) Unanimidad'], a: 1 },
  { q: '¿Quién ratifica la reforma para que entre en vigencia?', o: ['a) La subsiguiente legislatura ordinaria', 'b) El Ejecutivo', 'c) La Corte Suprema', 'd) Un referendo'], a: 0 },
  { q: 'El artículo 374 excluye de reforma, entre otros…', o: ['a) El presupuesto', 'b) Los tratados', 'c) La forma de gobierno y el período presidencial', 'd) El régimen económico'], a: 2 },
  { q: '«En los casos que la ley señale» es…', o: ['a) Una excepción', 'b) Un supuesto', 'c) Una consecuencia', 'd) Una remisión'], a: 3 },
  { q: '¿Qué pieza dice en qué caso se aplica el artículo?', o: ['a) El supuesto de hecho', 'b) La consecuencia', 'c) La excepción', 'd) La remisión'], a: 0 },
  { q: 'Las garantías constitucionales viven en el…', o: ['a) Título I', 'b) Título IV', 'c) Título VI', 'd) Título VIII'], a: 1 },
  { q: 'Los poderes del Estado viven en el…', o: ['a) Título III', 'b) Título IV', 'c) Título V', 'd) Título VII'], a: 2 },
  { q: 'La reforma y la inviolabilidad viven en el…', o: ['a) Título II', 'b) Título V', 'c) Título VI', 'd) Título VII'], a: 3 },
  { q: 'El artículo 375 dice que la Constitución…', o: ['a) No pierde vigencia por acto de fuerza', 'b) Se reforma cada diez años', 'c) La interpreta el Congreso', 'd) Caduca con cada gobierno'], a: 0 },
  { q: 'La reforma del habeas data se cayó la primera vez porque…', o: ['a) Era pétrea', 'b) No se ratificó', 'c) No se publicó', 'd) La vetó el Ejecutivo'], a: 1 },
  { q: '¿Qué se comprueba primero al recibir una cita de un artículo?', o: ['a) Que suene razonable', 'b) Que lo diga alguien con cargo', 'c) Su texto vigente y su decreto de reforma', 'd) Que esté en la parte dogmática'], a: 2 },
  { q: 'La Constitución de 1982 es el Decreto…', o: ['a) 244', 'b) 262', 'c) 182', 'd) 131'], a: 3 },
  { q: 'La parte dogmática comprende…', o: ['a) Estado, nacionalidad, derechos y garantías', 'b) Solo los derechos', 'c) Los poderes del Estado', 'd) Las transitorias'], a: 0 },
  { q: 'La alternabilidad en la Presidencia, según el artículo 4, es…', o: ['a) Voluntaria', 'b) Obligatoria', 'c) Reglamentaria', 'd) Transitoria'], a: 1 },
  { q: '¿Cuántos títulos tiene la Constitución de 1982?', o: ['a) Cinco', 'b) Seis', 'c) Ocho', 'd) Doce'], a: 2 },
]);
B.evalCPBank = JSON.stringify([
  { q: 'La Constitución vigente es el Decreto ___ de 1982.', a: '131' },
  { q: 'La Constitución de 1982 tiene ocho ___.', a: 'titulos' },
  { q: 'La parte que habla de los poderes del Estado es la ___.', a: 'organica' },
  { q: 'La parte que habla del Estado, la nacionalidad y los derechos es la ___.', a: 'dogmatica' },
  { q: 'La pieza que dice en qué caso se aplica el artículo es el ___.', a: 'supuesto' },
  { q: 'La pieza que manda a otra norma a completar es la ___.', a: 'remision' },
  { q: 'El caso que queda fuera de la regla es la ___.', a: 'excepcion' },
  { q: 'La reforma pide dos ___ de votos de la totalidad de los miembros.', a: 'tercios' },
  { q: 'La reforma debe ___ por la legislatura siguiente.', a: 'ratificarse' },
  { q: 'Lo que no se puede reformar en ningún caso es ___.', a: 'petreo' },
  { q: 'Que la Constitución resista un acto de fuerza es su ___.', a: 'inviolabilidad' },
  { q: 'El artículo 4 hace obligatoria la ___ en la Presidencia.', a: 'alternabilidad' },
  { q: 'Las garantías constitucionales están en el Título ___.', a: 'IV' },
  { q: 'El habeas data se metió en el artículo ___.', a: '182' },
  { q: 'La reforma y la inviolabilidad están en el Título ___.', a: 'VII' },
]);
B.evalPRBank = JSON.stringify([
  { term: 'Decreto 131', def: 'La Constitución vigente, de 1982' },
  { term: 'Título III', def: 'Declaraciones, derechos y garantías' },
  { term: 'Título IV', def: 'Garantías constitucionales' },
  { term: 'Título V', def: 'Poderes del Estado' },
  { term: 'Título VII', def: 'Reforma e inviolabilidad' },
  { term: 'Parte dogmática', def: 'La que habla de ti' },
  { term: 'Parte orgánica', def: 'La que habla de quién manda' },
  { term: 'Supuesto de hecho', def: 'En qué caso se aplica' },
  { term: 'Consecuencia', def: 'Qué pasa cuando el supuesto se cumple' },
  { term: 'Excepción', def: 'El caso que queda fuera' },
  { term: 'Remisión', def: 'Manda a otra norma a completar' },
  { term: 'Artículo 373', def: 'Dos tercios y ratificación' },
  { term: 'Artículo 374', def: 'Lo que no se reforma nunca' },
  { term: 'Artículo 375', def: 'No pierde vigencia por acto de fuerza' },
  { term: 'Artículo 4', def: 'La alternabilidad es obligatoria' },
]);

/* ---------- prueba de pensamiento crítico ---------- */
B.critCaseBank = JSON.stringify([
  { txt: 'Un maestro entusiasmado propone «pedir que reformen la Constitución» para que M.E.T.A.S sea de uso obligatorio en las escuelas del departamento.' },
  { txt: 'Un convenio que le ofrecen al proyecto dice que el material se usará «conforme a la reglamentación vigente», sin decir cuál es esa reglamentación ni quién la dicta.' },
  { txt: 'En año electoral, un diputado ofrece imprimir cinco mil fichas de M.E.T.A.S con su cara en la portada, y de paso pide que el proyecto lo acompañe a dos actos.' },
  { txt: 'Alguien le asegura a la familia que «la Constitución dice que la educación la autoriza exclusivamente la Secretaría», y cita el artículo 157 de memoria, sin decir de qué año es el texto que leyó.' },
  { txt: 'Un acuerdo de una Secretaría se ampara en la frase «conforme lo determine la ley» de un artículo de derechos, y resulta que esa ley nunca se dictó.' },
  { txt: 'Después de un cambio de gobierno, en una oficina le dicen al proyecto que «esa Constitución ya no aplica» y que hay que esperar a que se ordene todo.' },
  { txt: 'Se celebra en la prensa que el Congreso aprobó una reforma que beneficiaría al proyecto. Nadie menciona la legislatura siguiente ni la ratificación.' },
  { txt: 'Le presentan al proyecto un «reglamento» que en realidad cambia lo que dice una ley, y lo defienden diciendo que la Constitución permite reglamentar.' },
]);
B.critCaseQuestions = JSON.stringify([
  '1. ¿En qué título de la Constitución vive lo que está en juego, y qué artículo lo trata?',
  '2. Si hay una reforma de por medio: ¿cumple el artículo 373, y podría chocar con el 374?',
  '3. ¿El texto que le citaron trae alguna remisión? ¿A qué norma manda, y esa norma existe?',
  '4. ¿Qué comprueba antes de contestar, y qué apunta para no tener que comprobarlo otra vez?',
]);
B.critCaseGuides = JSON.stringify([
  'Ubicar el título es más rápido de lo que parece y ahorra discusiones enteras: del I al IV está la parte dogmática (Estado, nacionalidad, derechos y garantías) y del V al VI la orgánica (poderes y régimen económico); el VII es la reforma y la inviolabilidad, y el VIII las transitorias. Si lo que discuten es un derecho y alguien lo busca en el título de los poderes, el problema no es de interpretación: es de mapa.',
  'El artículo 373 pide tres cosas a la vez, y la que se olvida siempre es la tercera: sesiones ordinarias, dos tercios de la totalidad de los miembros, decreto que señale qué artículos se reforman, y ratificación por la subsiguiente legislatura ordinaria por igual número de votos. Sin ratificación no hay vigencia, por mucho que se haya celebrado. Y antes de contar votos conviene mirar el 374, porque hay materias donde el procedimiento no alcanza: si lo que se quiere tocar está ahí, la respuesta no es «cuesta más», es «no por esta vía».',
  'La remisión es la pieza que convierte un artículo generoso en una promesa a cargo de otro. Cuando el texto dice «conforme lo determine la ley», el contenido real lo escribirá esa ley, y hay que preguntar dos cosas: cuál es, y si existe. Una remisión a una ley que nunca se dictó deja el derecho en el papel y a la administración con las manos libres, que es exactamente el tipo de hueco que va al Registro de Grietas.',
  'Se comprueba el texto en fuente oficial, se mira el decreto de reforma y desde cuándo rige, y se apunta norma, artículo, decreto y fecha de consulta. Cinco minutos. Discutir el fondo de un artículo sin comprobarlo es apostar la credibilidad de todo lo demás que se va a decir, y esa apuesta se pierde delante de la única persona que sí lo había leído.',
]);
B.critErrorBank = JSON.stringify([
  { txt: '"El Congreso ya aprobó la reforma con dos tercios, así que ya es ley".', g1: 'Falta la mitad del procedimiento. El artículo 373 pide que la subsiguiente legislatura ordinaria la ratifique por igual número de votos para que entre en vigencia.', g2: 'El habeas data del artículo 182 es el ejemplo: el intento de 2005 se cayó exactamente ahí, y el que sí prosperó necesitó los dos votos, en 2012 y 2013.' },
  { txt: '"Si hay votos suficientes, se puede reformar cualquier artículo".', g1: 'No. El artículo 374 excluye materias enteras en todo caso: forma de gobierno, territorio, período presidencial y la prohibición de repetir en la Presidencia, entre otras.', g2: 'Y se excluye a sí mismo y al 373, que es lo más fino: si no lo hiciera, bastaría con reformar primero el candado para poder abrir después todo lo demás.' },
  { txt: '"El artículo reconoce el derecho, así que el derecho está garantizado".', g1: 'Depende de si trae remisión. «Conforme lo determine la ley» significa que el contenido real lo escribe otra norma, casi siempre un escalón más abajo.', g2: 'Y si esa ley nunca se dictó, el derecho queda en el papel. Eso no es un detalle de redacción: es dónde se decide de verdad lo que uno puede exigir.' },
  { txt: '"Cambió el gobierno, así que hay que esperar a ver qué Constitución rige".', g1: 'El artículo 375 dice justamente lo contrario: no pierde vigencia ni deja de cumplirse por acto de fuerza ni por una derogación hecha por un medio distinto del que ella dispone.', g2: 'Y añade algo que casi nadie cita: el deber de todo ciudadano, con autoridad o sin ella, de colaborar en el restablecimiento de su vigencia.' },
  { txt: '"Me lo dijo alguien que sabe, y citó el artículo de memoria".', g1: 'Un artículo es un texto con fecha. El mismo número puede decir hoy algo distinto de lo que decía hace diez años, porque lo reformaron.', g2: 'Comprobarlo cuesta cinco minutos y protege lo que viene después: quien cita mal un número pierde también la credibilidad de todo lo demás que iba a decir.' },
  { txt: '"Honduras ha tenido dieciséis constituciones, es un dato conocido".', g1: 'Es un dato discutido. Hay fuentes que dicen doce, otras catorce y otras dieciséis, según si se cuentan los textos del período federal y si una reforma muy grande cuenta como texto nuevo.', g2: 'Contado como discutido, es información útil sobre la historia del país. Contado como cierto, es una trampa que estalla en la primera reunión donde alguien conozca el tema.' },
]);
B.critDecisionBank = JSON.stringify([
  'Proponen pedir una reforma constitucional para que M.E.T.A.S sea obligatorio: ¿cuánto tarda como mínimo y qué pasos hay que contar antes de decir que sí?',
  'Un convenio remite a «la reglamentación vigente» sin nombrarla: ¿se firma, se pregunta o se propone otra redacción? ¿Qué se propone exactamente?',
  'Un artículo de derechos remite a una ley que nunca se dictó: ¿qué se puede exigir mientras tanto y qué se apunta en el Registro de Grietas?',
  'Le citan un artículo de memoria en una reunión y no cuadra con lo que usted leyó: ¿qué contesta ahí mismo, sin dejar a nadie en mal lugar?',
  'Un diputado ofrece imprimir fichas en año electoral: ¿qué del artículo 4 conviene tener presente y qué condición se pone antes de aceptar algo?',
  'Se celebra una reforma aprobada que beneficia al proyecto: ¿se cuenta con ella desde ya o se espera? ¿A qué exactamente?',
  'Un reglamento cambia lo que dice una ley y lo defienden diciendo que reglamentar está permitido: ¿dónde está el error y cómo se dice en una línea?',
  'En una oficina dicen que la Constitución «no aplica» tras un cambio de gobierno: ¿qué artículo se cita y cómo se cita sin convertirlo en pelea?',
]);
B.critCompareBank = JSON.stringify([
  { a: 'Esperar a la ratificación de la legislatura siguiente antes de contar con una reforma.', b: 'Empezar a planificar el proyecto como si la reforma ya rigiera.', ga: 'Caso A: el artículo 373 dice que sin ratificación no hay vigencia. Esperar no cuesta nada y evita construir sobre algo que puede no existir nunca.', gb: 'Caso B: si no se ratifica, se pierde el trabajo hecho y, peor, se prometieron cosas a maestros y madres que después hay que retirar.' },
  { a: 'Pedir que el convenio nombre la reglamentación exacta a la que remite.', b: 'Firmar el convenio con la frase «conforme a la reglamentación vigente».', ga: 'Caso A: se sabe qué se está aceptando, y si la reglamentación cambia, se sabe qué cambió y desde cuándo.', gb: 'Caso B: se firma un contenido que otro escribirá después, sin decir quién ni cuándo. La remisión funciona igual en un contrato que en la Constitución.' },
  { a: 'Comprobar el artículo antes de discutirlo.', b: 'Discutir el fondo del artículo con lo que uno recuerda.', ga: 'Caso A: cinco minutos, y se entra a la conversación con el texto y su fecha. Cambia quién tiene que probar qué.', gb: 'Caso B: si el número o la versión están mal, se pierde el punto y con él lo demás. Es lo que esta ruta prohíbe expresamente.' },
  { a: 'Decir que el dato de las constituciones está discutido y explicar por qué.', b: 'Elegir el número que suena mejor y decirlo con seguridad.', ga: 'Caso A: se enseña algo verdadero sobre la historia del país y sobre cómo se cuenta la historia.', gb: 'Caso B: se gana una frase redonda y se pierde la primera vez que aparezca alguien que conozca el tema.' },
]);
B.critCauseBank = JSON.stringify([
  { cause: 'Se cuenta con una reforma aprobada pero no ratificada.', guide: 'El proyecto planifica sobre algo que puede no llegar a existir, y si no se ratifica hay que retirar promesas ya hechas a maestros y a madres. El artículo 373 avisaba.' },
  { cause: 'Se firma un convenio que remite a «la reglamentación vigente» sin nombrarla.', guide: 'Se acepta un contenido que escribirá otro después. La remisión funciona igual en un contrato que en la Constitución, y aquí el que la escribe no es la casa.' },
  { cause: 'Se repite un artículo citado de memoria por alguien de confianza.', guide: 'Si el texto fue reformado, se repite una versión que ya no rige, y el error viaja con el prestigio de quien lo dijo. Después es más difícil deshacerlo.' },
  { cause: 'Se busca un tema en el título equivocado y se concluye que la Constitución no dice nada.', guide: 'Se toma por vacío lo que solo estaba en otra parte del mapa. Del I al IV va lo dogmático, del V al VI lo orgánico, el VII la reforma y el VIII las transitorias.' },
  { cause: 'Se acepta que un reglamento cambie lo que dice una ley porque «reglamentar está permitido».', guide: 'Reglamentar es desarrollar la ley para poder aplicarla, no ampliarla ni recortarla. El escalón de la etapa 1 vuelve aquí, ahora con la Constitución encima.' },
  { cause: 'Se da por buena la frase «esa Constitución ya no aplica» tras un cambio de gobierno.', guide: 'El artículo 375 dice lo contrario, y quien lo desconoce suele estar pidiendo algo que no podría pedir si la Constitución se aplicara.' },
]);
B.critEffectBank = JSON.stringify([
  { effect: 'El proyecto no se apuntó a una reforma que al final nunca entró en vigencia.', guide: 'Se contaron los pasos del artículo 373 antes de celebrar, y faltaba el segundo voto. Se esperó a la ratificación, que nunca llegó.' },
  { effect: 'El convenio quedó firmado nombrando exactamente qué reglamento lo rige.', guide: 'Se pidió cambiar «conforme a la reglamentación vigente» por el nombre y la fecha de la norma. Cinco palabras más y se sabe qué se aceptó.' },
  { effect: 'En la reunión se citó un artículo y nadie pudo desmentirlo.', guide: 'Se había comprobado el texto vigente y su decreto de reforma, y se llevó anotada la fecha de consulta.' },
  { effect: 'La familia supo qué exigir aunque la ley prometida no existiera.', guide: 'Se detectó la remisión, se buscó la norma a la que mandaba y se comprobó que no se había dictado. Eso se apuntó como grieta, con su ficha.' },
  { effect: 'La oferta del diputado se aceptó a medias y sin quedar amarrado.', guide: 'Se separó lo que aporta (impresión) de lo que compromete (presencia en actos), y se puso por escrito qué no se cede: el nombre del autor y la neutralidad del material.' },
  { effect: 'Nadie volvió a decir en esa oficina que la Constitución no aplicaba.', guide: 'Se citó el artículo 375 con su texto, sin levantar la voz, y se pidió por escrito la respuesta. El argumento no volvió a aparecer.' },
]);

/* ---------- línea de tiempo: las siete piezas ---------- */
B.timelineData = JSON.stringify([
  { y: '1', icon: '📜', label: 'El decreto y la fecha', text: 'La Constitución vigente es el <strong>Decreto 131 del 11 de enero de 1982</strong>, publicada en La Gaceta 23,612 del 20 de enero. <strong>Sirve para:</strong> citar el texto exacto. <strong>Se pierde:</strong> diciendo «la Constitución dice» sin saber de qué versión se habla.' },
  { y: '2', icon: '🗺️', label: 'El mapa', text: '<strong>8 títulos, 43 capítulos, 378 artículos.</strong> <strong>Sirve para:</strong> encontrar en un minuto lo que si no cuesta media hora. <strong>Se pierde:</strong> buscando un derecho en el título de los poderes y concluyendo que la Constitución no dice nada.' },
  { y: '3', icon: '🙋', label: 'La parte dogmática', text: 'Títulos I a IV: el Estado, la nacionalidad, los derechos y sus garantías. <strong>Es la parte que habla de ti.</strong> <strong>Se pierde:</strong> leyendo solo esta y creyendo que ya se leyó la Constitución.' },
  { y: '4', icon: '🏛️', label: 'La parte orgánica', text: 'Títulos V y VI: los poderes del Estado y el régimen económico. <strong>Es la parte que habla de quién manda</strong>, y la que casi nadie lee aunque decide más. <strong>Aquí:</strong> es donde se ve quién puede decir que sí de verdad.' },
  { y: '5', icon: '🧩', label: 'El artículo por dentro', text: 'Cuatro piezas: <strong>supuesto de hecho, consecuencia, excepción y remisión</strong>. <strong>Sirve para:</strong> saber si el artículo habla de tu caso. <strong>Se pierde:</strong> quedándose con la primera frase, que es la que suena bien.' },
  { y: '6', icon: '➡️', label: 'La remisión', text: 'Cuando el artículo <strong>manda a otra norma</strong> a completar lo que él no dice. <strong>Se reconoce:</strong> «conforme lo determine la ley». <strong>Se pierde:</strong> celebrando un derecho cuyo contenido real lo escribirá un reglamento.' },
  { y: '7', icon: '🪨', label: 'La reforma y el candado', text: '<strong>Art. 373:</strong> dos tercios y ratificación por la legislatura siguiente. <strong>Art. 374:</strong> lo que no se reforma en ningún caso, incluido él mismo. <strong>Art. 375:</strong> no pierde vigencia por acto de fuerza.' },
]);

/* ---------- laboratorio ---------- */
B.parteData = JSON.stringify({
  mapa: {
    nombre: 'El mapa de los títulos', icon: '🗺️',
    estructura: { title: 'Qué es', info: '• <strong>8 títulos, 43 capítulos y 378 artículos</strong><br>• I Organización del Estado · II Nacionalidad y Ciudadanía<br>• III Declaraciones, Derechos y Garantías · IV Garantías Constitucionales<br>• V Poderes del Estado · VI Régimen Económico<br>• VII Reforma e Inviolabilidad · VIII Transitorias y Vigencia' },
    funcion: { title: 'Cómo se usa', info: '• Antes de buscar un artículo, se decide <strong>en qué título debería vivir</strong><br>• Del I al IV es la parte dogmática; el V y el VI, la orgánica<br>• Si el tema no aparece donde debería, casi siempre está en el título de al lado' },
    enfermedades: { title: 'Dónde se cae', info: '• Buscando un derecho en el título de los poderes y creyendo que no existe<br>• Citando un artículo sin mirar de qué capítulo sale, que es lo que dice de qué trata<br>• Leyendo solo la parte dogmática y creyendo que ya se leyó la Constitución' },
    cuidados: { title: 'En este proyecto', info: '• La educación toca <strong>derechos</strong> (título III) y <strong>poderes</strong> (título V) a la vez<br>• Las garantías con las que se defiende algo están en el <strong>IV</strong><br>• Y lo que puede cambiar todo esto, en el <strong>VII</strong>' },
  },
  articulo: {
    nombre: 'El artículo por dentro', icon: '🧩',
    estructura: { title: 'Qué es', info: '• <strong>Supuesto de hecho:</strong> en qué caso se aplica<br>• <strong>Consecuencia:</strong> qué pasa entonces<br>• <strong>Excepción:</strong> el caso que queda fuera<br>• <strong>Remisión:</strong> a qué otra norma manda' },
    funcion: { title: 'Cómo se usa', info: '• Se lee entero una vez, sin subrayar<br>• Se marca cada pieza con un color distinto<br>• Se pregunta: <strong>¿mi caso encaja en el supuesto?</strong> Si no encaja, el artículo no habla de mí' },
    enfermedades: { title: 'Dónde se cae', info: '• Quedándose con la primera frase, que es la que suena bien<br>• No buscando el «salvo», que es lo primero que busca quien va a decir que no<br>• Pasando por alto la remisión, que es donde se decide el contenido real' },
    cuidados: { title: 'En este proyecto', info: '• El artículo <strong>157</strong> se lee así en la etapa 5, pieza por pieza<br>• Un convenio se lee igual: también tiene supuesto, consecuencia y remisiones<br>• Lo que sale de leer así se apunta en el <strong>Registro de Grietas</strong>' },
  },
  remision: {
    nombre: 'La remisión', icon: '➡️',
    estructura: { title: 'Qué es', info: '• La pieza por la que el artículo <strong>manda a otra norma</strong> a completarlo<br>• «Conforme lo determine la ley», «en los casos que la ley señale»<br>• El artículo parece haber decidido y no decidió' },
    funcion: { title: 'Cómo se usa', info: '• Se subraya en rojo apenas aparece<br>• Se pregunta <strong>a qué norma manda</strong> y si esa norma existe<br>• Se busca esa norma, porque ahí está el contenido real del derecho' },
    enfermedades: { title: 'Dónde se cae', info: '• Celebrando el derecho reconocido sin mirar quién lo va a definir<br>• Aceptando una remisión a una ley que nunca se dictó<br>• Firmando un convenio que remite a «la reglamentación vigente» sin nombrarla' },
    cuidados: { title: 'En este proyecto', info: '• Todo convenio que le llegue a esta casa se revisa <strong>buscando remisiones</strong><br>• Si remite, se pide que <strong>nombre la norma y su fecha</strong><br>• Una remisión a una ley inexistente va derecha al Registro de Grietas' },
  },
  reforma: {
    nombre: 'La reforma y el candado', icon: '🪨',
    estructura: { title: 'Qué es', info: '• <strong>Art. 373:</strong> sesiones ordinarias, dos tercios de la totalidad, decreto que señale qué artículos, y <strong>ratificación</strong> por la subsiguiente legislatura ordinaria<br>• <strong>Art. 374:</strong> lo que no se reforma en ningún caso<br>• <strong>Art. 375:</strong> no pierde vigencia por acto de fuerza' },
    funcion: { title: 'Cómo se usa', info: '• Ante cualquier reforma anunciada se cuentan <strong>los dos votos</strong><br>• Antes de contar votos se mira el 374: si la materia está ahí, no es cuestión de esfuerzo<br>• Y ante un «ya no aplica», se cita el 375' },
    enfermedades: { title: 'Dónde se cae', info: '• Dando por vigente una reforma aprobada <strong>una sola vez</strong><br>• Creyendo que con votos suficientes se puede reformar cualquier cosa<br>• Olvidando que el 374 <strong>se protege a sí mismo</strong> y al 373' },
    cuidados: { title: 'En este proyecto', info: '• El <strong>habeas data</strong> es el ejemplo real: cayó en 2005 por falta de ratificación y prosperó con 237-2012 y 10-2013<br>• Ninguna promesa de reforma se planifica hasta el segundo voto<br>• Lo que el 374 protege se estudia entero en la <strong>etapa 6</strong>' },
  },
});

/* ---------- niveles de XP y logros ---------- */
B.lvls = JSON.stringify([
  { t: 0, n: 'Dice «la Constitución dice» 🌫️' },
  { t: 25, n: 'Sabe en qué título buscar 🗺️' },
  { t: 55, n: 'Separa dogmática de orgánica 🙋' },
  { t: 90, n: 'Lee el artículo por piezas 🧩' },
  { t: 130, n: 'Caza la remisión ➡️' },
  { t: 165, n: 'Cuenta los dos votos del 373 🔁' },
  { t: 190, n: 'Comprueba antes de citar 📜' },
]);
B.ACHIEVEMENTS = JSON.stringify({
  primer_quiz: { icon: '🧠', label: 'Primer quiz de la anatomía superado' },
  flash_master: { icon: '🃏', label: 'Todo el vocabulario de la Constitución explorado' },
  clasif_pro: { icon: '🗂️', label: 'Clasificador de títulos y piezas experto' },
  id_master: { icon: '🔍', label: 'Identificador de piezas del artículo maestro' },
  reto_hero: { icon: '🏆', label: 'Héroe del reto de los 30 segundos' },
  sopa_champ: { icon: '🔤', label: 'Campeón de la sopa de la Constitución' },
  eval_ace: { icon: '🎓', label: 'Evaluación final aprobada con honores' },
  full_xp: { icon: '👑', label: 'Etapa 2 de la Ruta de la Ley y sus Grietas completada' },
});

/* ---------- aplicar ---------- */
let src = fs.readFileSync(ARCHIVO, 'utf8');
const lineas = src.split(/\r?\n/);
let cambiados = 0;
const noEncontrados = [];

for (const [nombre, literal] of Object.entries(B)) {
  const prefijo = 'const ' + nombre + '=';
  const idx = lineas.findIndex(l => l.startsWith(prefijo));
  if (idx === -1) { noEncontrados.push(nombre); continue; }
  lineas[idx] = prefijo + literal + ';';
  cambiados++;
}
src = lineas.join('\n');

src = src.replace(/const SAVE_KEY='[^']*';/, "const SAVE_KEY='faro_ley_anatomia_v1';");

src = src.replace(/const critDecisionGuide="[^"]*";/,
  'const critDecisionGuide="La decisión correcta sigue siempre el mismo orden. Primero se ubica el tema en su título, porque del I al IV va la parte dogmática y del V al VI la orgánica, y buscar en el título equivocado hace concluir que la Constitución no dice nada cuando sí lo dice. Después se lee el artículo por sus cuatro piezas: supuesto, consecuencia, excepción y remisión, y se subraya la remisión apenas aparece, porque ahí es donde otra norma va a escribir el contenido real. Si hay reforma de por medio se cuentan los dos votos del artículo 373, el del Congreso y el de la subsiguiente legislatura, y antes de contar nada se mira el 374, porque hay materias donde el procedimiento no alcanza. Y todo lo que se vaya a citar se comprueba primero en fuente oficial, con su decreto de reforma y su fecha, que cuesta cinco minutos y evita perder la reunión entera.";');

/* ---------- lo que arrastra el molde (la etapa 1) ---------- */
const textos = [
  [/⚖️ \*Ruta de la Ley y sus Grietas · Etapa 1\* ⚖️/g, '📜 *Ruta de la Ley y sus Grietas · Etapa 2* 📜'],
  [/De dónde saca su fuerza la ley: jerarquía, validez y coacción, con la pregunta que desarma un requisito sin norma detrás\. 🏛️/g,
    'La Constitución de 1982 por dentro: sus ocho títulos, cómo se lee un artículo por piezas y qué hace falta para reformarlo. 📜'],
  [/_Incluye evaluación conceptual y el papel sobre la mesa\._ ✍️/g, '_Incluye evaluación conceptual y el artículo sobre la mesa._ ✍️'],
  [/El papel sobre la mesa/g, 'El artículo sobre la mesa'],
  [/el papel sobre la mesa/g, 'el artículo sobre la mesa'],
  [/Ruta de la Ley y sus Grietas · Etapa 1: De dónde saca su fuerza la ley/g, 'Ruta de la Ley y sus Grietas · Etapa 2: Anatomía de la Constitución de 1982'],
  [/De dónde saca su fuerza la ley: jerarquía, validez y coacción/g, 'Anatomía de la Constitución de 1982: qué declara y cómo se reforma'],
  [/De dónde saca su fuerza la ley/g, 'Anatomía de la Constitución de 1982'],
  [/de dónde saca su fuerza la ley/g, 'anatomía de la Constitución de 1982'],
  [/Etapa 1 · Derecho y Ley/g, 'Etapa 2 · Derecho y Ley'],
  [/completó la Etapa 1 de la Ruta de la Ley y sus Grietas/g, 'completó la Etapa 2 de la Ruta de la Ley y sus Grietas'],
  [/⚖️ ¡/g, '📜 ¡'],
];
for (const [re, rep] of textos) src = src.replace(re, rep);

/* Las preguntas de las secciones III y IV venían de la etapa 1. */
src = src.replace(/¿En qué escalón vive ese papel[^<]*/g,
  '¿En qué título vive lo que está en juego, el texto trae alguna remisión y, si hay reforma de por medio, cumple el artículo 373 sin chocar con el 374? Explica qué comprobarías antes de contestar.');
src = src.replace(/1\. ¿Cuál de los dos deja constancia y pone la carga donde la pone el artículo 321\? 2\. ¿Por qué no son la misma decisión\?/g,
  '1. ¿Cuál de los dos se sostiene con el texto comprobado en la mano? 2. ¿Por qué no son la misma decisión?');

/* La simulación de la etapa 1 era la de la ventanilla. Aquí es la reforma que
   se celebra antes de tiempo, que es el error de esta etapa. */
const antesSim = /function resolveMethod\([a-zA-Z]*\)\{[\s\S]*?sfx\('fan'\);\}/;
const nuevaSim = `function resolveMethod(esperaRatificacion){sfx(esperaRatificacion?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(esperaRatificacion){r.innerHTML='<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">⏳</span><span class="ms-text"><strong>Contaste los dos votos:</strong> el artículo 373 pide que la subsiguiente legislatura ordinaria ratifique por igual número de votos. Todavía falta el segundo, así que no hay vigencia.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">✅</span><span class="ms-text"><strong>Y no prometiste nada:</strong> la reforma no se ratificó. Nadie tuvo que retirar lo dicho a los maestros, y el proyecto no perdió el trabajo de planificar sobre algo que no llegó.</span></div>';}else{r.innerHTML='<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">🎉</span><span class="ms-text"><strong>Lo diste por hecho:</strong> se anunció en la reunión de padres, se cambió el plan del año y se le dijo a tres maestros que contaran con ello.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">📉</span><span class="ms-text"><strong>Y la legislatura siguiente no ratificó:</strong> la reforma nunca entró en vigencia. Hubo que retirar lo prometido, que cuesta mucho más que no haberlo prometido.</span></div>';}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}`;
if (antesSim.test(src)) src = src.replace(antesSim, nuevaSim);
else console.log('OJO: no se pudo reescribir resolveMethod');

/* la pieza inicial del laboratorio (lo que arrastra el molde, norma 1) */
src = src.replace(/let labParte='[a-zA-Z]*',labAspecto='estructura';/, "let labParte='mapa',labAspecto='estructura';");
src = src.replace(/document\.querySelector\('\[data-parte="[a-zA-Z]*"\]'\)\?\.classList\.add\('active-pri'\);/,
  "document.querySelector('[data-parte=\"mapa\"]')?.classList.add('active-pri');");

fs.writeFileSync(ARCHIVO, src, 'utf8');

console.log('Bancos reemplazados: ' + cambiados + ' de ' + Object.keys(B).length);
if (noEncontrados.length) console.log('NO ENCONTRADOS: ' + noEncontrados.join(', '));
const quedan = (src.match(/ventanilla|escalón|coacción|eficacia dormida/gi) || []).length;
console.log('Rastros de la etapa 1 en el JS: ' + quedan);
