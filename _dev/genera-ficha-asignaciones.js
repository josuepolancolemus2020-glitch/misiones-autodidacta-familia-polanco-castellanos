/* Genera fichas/ficha-ingenieria-asignaciones.html DESDE js/data/asignaciones.js.
   Uso:  node _dev/genera-ficha-asignaciones.js

   Se genera en vez de escribirse a mano por una razón de la propia ruta: si la
   ficha impresa y la aplicación se escriben por separado, dentro de tres meses
   dicen cosas distintas y nadie sabe cuál manda. Aquí manda el catálogo.

   Diez páginas (norma 6): la 1 es el molde y la hoja de registro, de la 2 a la
   9 va una asignación por página, y la 10 son las treinta preguntas de la
   defensa final. Las treinta viven aquí y no en el catálogo porque son el
   material de UNA asignación, la octava, y no cabrían en su tarjeta.          */
const fs = require('fs');
const path = require('path');
const { ASIGNACIONES } = require('../js/data/asignaciones.js');
const RAIZ = path.join(__dirname, '..');

/* Cuántas líneas de notas lleva cada página. No es capricho: cada asignación
   ocupa distinto y la norma 6 pide entre 215 y 252 mm por hoja, así que las
   líneas terminan de llenar la página. Los números salieron de medir. */
const LINEAS = { a1: 1, a2: 2, a3: 3, a4: 2, a5: 3, a6: 5, a7: 2, a8: 4 };

const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pie = n => `  <div class="pie"><span>🏠 Proyecto Educativo F.A.R.O.</span><span>🏗️ Ruta de la Ingeniería · Asignaciones · Página ${n} de 10</span></div>`;

const TREINTA = [
  ['Arquitectura', [
    'Explica el sistema entero en dos minutos, sin dibujar nada.',
    '¿Dónde vive la fuente de verdad, y por qué ahí y no en el servidor?',
    'Si el código es el mismo, ¿qué diferencia hay entre la web, la PWA y el APK?',
    '¿Qué hace exactamente el trabajador de servicio, y qué no debe guardar nunca?',
    '¿Qué parte del sistema necesita servidor de verdad, y por qué solo esa?',
    '¿Por qué no hay compilación, y qué se pierde por no tenerla?',
  ]],
  ['Datos', [
    '¿Qué pasa con un dato desde que se toca el botón hasta que llega a la nube?',
    '¿Qué ocurre si el aparato se queda sin señal a la mitad?',
    '¿Cómo se resuelve que dos dispositivos cambien lo mismo a la vez?',
    '¿Qué se pierde si se desinstala la aplicación sin sincronizar?',
    '¿Cuánto ocupa hoy el estado de una familia, y cuándo empieza a estorbar?',
    '¿Qué dato NO debería estar en la nube, y qué haces al respecto?',
  ]],
  ['Seguridad', [
    '¿Quién puede leer los datos de otra familia, y qué se lo impide exactamente?',
    '¿Qué es una política de seguridad por fila y cómo se comprueba que cierra?',
    'La clave anónima está a la vista en el código. ¿Es un descuido? Defiéndelo.',
    '¿Qué pasó con «using (true)» y cómo se evita que vuelva a pasar?',
    'Hay datos de menores. ¿Qué obligación tienes y qué tienes hecho?',
    'Si mañana se filtra la base entera, ¿qué es lo peor que hay dentro?',
  ]],
  ['Escala y operación', [
    'Mil aulas terminan una evaluación en el mismo minuto. ¿Qué se rompe primero?',
    '¿Cuál es el punto único de fallo del sistema, y por qué se aceptó?',
    'Supabase cierra en treinta días. ¿Cuál es el plan, y cuánto cuesta?',
    '¿Cómo se publica un cambio, y cuánto tarda en llegar al teléfono de una maestra?',
    'Un despliegue sale mal a las diez de la noche. ¿Cómo se vuelve atrás?',
    '¿Qué se mide hoy del sistema, y qué deberías estar midiendo y no mides?',
    '¿Qué parte del sistema podrías apagar mañana sin que nadie lo notara, y por qué sigue encendida?',
  ]],
  ['Las cinco de fondo · fallar una de estas es no aprobar', [
    '«Esto no escala.» Contesta con un número encima de la mesa, no con una opinión.',
    '«Cualquiera lo hace con un marco de trabajo moderno.» ¿Qué respondes?',
    '«Depende de un solo servicio, es frágil.» ¿Es cierto? ¿Cuánto, y qué haces?',
    '«Los datos de menores en la nube son un problema legal.» ¿Qué tienes hecho?',
    '«Si a ti te pasa algo, esto se muere contigo.» ¿Qué enseñas para contestar eso?',
  ]],
];

/* ── página 1: el molde, cómo se toma una defensa y la hoja de registro ── */
const p1 = `<section class="pagina">
  <a class="volver" href="../index.html?view=asignaciones">← Volver a las asignaciones</a>
  <div class="idline"><span>Estudia:</span><span class="raya"></span><span>Fecha:</span><span class="raya corta"></span></div>

  <div class="fh">
    <div class="f-badge">📄 Asignaciones metalingüísticas</div>
    <div class="f-meta"><b>Ruta:</b> 🏗️ Ruta de la Ingeniería del Sistema · Etapas 3 a 10 · <b>Materia:</b> Ingeniería del Sistema</div>
    <div class="f-meta"><b>Objeto de estudio:</b> los dos proyectos de la casa, M.E.T.A.S y F.A.R.O. El sistema y el estudiante trabajan sobre lo mismo.</div>
  </div>

  <h2>🎓 Qué es una asignación metalingüística</h2>
  <p>Una misión normal enseña un tema y mide con un quiz. Una asignación toma como material de estudio <b>el propio sistema</b> y pide como producto <b>lenguaje</b>: nombrar, explicar, traducir, defender, documentar. Se aprueba <b>defendiendo en voz alta</b>, no marcando opciones. Por eso aquí no hay XP automático: lo otorga quien toma la defensa.</p>

  <h2>🧩 El molde de las cinco partes</h2>
  <table class="tres">
    <tr><th>Parte</th><th>Qué es, y cómo se sabe que está</th></tr>
    <tr><td>1 · El encargo</td><td>Qué se produce. Hay un archivo terminado, no notas sueltas</td></tr>
    <tr><td>2 · El material</td><td>Qué se estudia, con rutas exactas. Se abrió cada archivo de la lista</td></tr>
    <tr><td>3 · El vocabulario</td><td>De diez a veinte términos. Todos aparecen en el producto, y bien usados</td></tr>
    <tr><td>4 · La defensa</td><td>Cinco preguntas sin leer. Las cinco contestadas de pie</td></tr>
    <tr><td>5 · El sello</td><td>Se guarda en la Bóveda y no sale de ahí, con fecha</td></tr>
  </table>

  <h2>🎤 Cómo se toma una defensa</h2>
  <ol>
    <li>El evaluador tiene esta ficha en la mano; el autor <b>no tiene nada</b>.</li>
    <li>Se leen las cinco preguntas en orden, sin ayudar y sin completar frases.</li>
    <li>Si el autor mira una pantalla, la defensa se detiene y se repite otro día.</li>
    <li>Se repregunta al menos una vez: <b>«¿y eso por qué?»</b>. Ahí se ve si se entendió.</li>
    <li>Al terminar se anota abajo: fecha, quién tomó, qué falló y qué se estudia antes de repetir.</li>
  </ol>

  <h2>📋 Hoja de registro de defensas</h2>
  <table class="audit">
    <tr><th>#</th><th>Asignación</th><th>Fecha</th><th>La tomó</th></tr>
${ASIGNACIONES.map(a => `    <tr><td>${a.n}</td><td>${esc(a.titulo)}</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('\n')}
  </table>

${pie(1)}
</section>`;

/* ── páginas 2 a 9: una asignación por página ── */
const paginas = ASIGNACIONES.map((a, i) => `<section class="pagina">
  <h2>${a.icon} Etapa ${a.n} · ${esc(a.titulo)}</h2>
  <p class="lema">${esc(a.lema)} · <b>${a.xp} XP</b>, que otorga quien toma la defensa.</p>

  <h3>1 · El encargo</h3>
  <p>${esc(a.encargo)}</p>
  <p class="mini"><b>Producto:</b> ${esc(a.producto)}</p>

  <h3>2 · El material</h3>
  <table class="tres mat">
    <tr><th>Dónde</th><th>Qué se estudia ahí</th></tr>
${a.material.map(m => `    <tr><td><code>${esc(m.ruta)}</code></td><td>${esc(m.que)}</td></tr>`).join('\n')}
  </table>

  <h3>3 · El vocabulario obligatorio</h3>
  <p class="mini">Si el producto no los usa, y bien usados, no está terminado.</p>
  <p class="vocab">${a.vocabulario.map(v => `<span>${esc(v)}</span>`).join(' ')}</p>

  <h3>4 · La defensa</h3>
  <ol class="defensa">
${a.defensa.map(q => `    <li>${esc(q)}</li>`).join('\n')}
  </ol>

  <h3>5 · El sello</h3>
  <p>${esc(a.sello)}</p>

  <div class="caja caja-amb">
    <p><b>Está terminada cuando:</b> ${esc(a.terminada)}</p>
    <p class="mini"><b>El error típico:</b> ${esc(a.error)}</p>
  </div>

  <h3>Notas de quien defiende</h3>
  <div class="lineas-4">${'<div class="raya-resp"></div>'.repeat(LINEAS[a.id] || 1)}</div>

${pie(i + 2)}
</section>`);

/* ── página 10: las treinta preguntas ── */
const p10 = `<section class="pagina">
  <h2>🎓 Las treinta preguntas</h2>
  <p class="mini">Material de la asignación 8 y prueba final de la ruta. De pie, sin pantalla y sin apuntes. Se aprueba con <b>veinticuatro respondidas</b> y <b>ninguna de las cinco de fondo fallada</b>.</p>
${TREINTA.map(([grupo, qs]) => `  <h3>${esc(grupo)}</h3>
  <ol class="treinta">
${qs.map(q => `    <li>${esc(q)}</li>`).join('\n')}
  </ol>`).join('\n')}
  <p class="mini">Al evaluador: la nota no es cuántas contestó, es <b>cuántas contestó sin cambiar de tema</b>.</p>
${pie(10)}
</section>`;

const doc = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ficha de estudio · Ruta de la Ingeniería · Asignaciones metalingüísticas</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/ficha.css">
<style>
  /* Generada por _dev/genera-ficha-asignaciones.js desde js/data/asignaciones.js.
     No se edita a mano: se edita el catálogo y se vuelve a generar. */
  :root { --pri: #0f6f6c; --pri-suave: #ecfdf5; --sec: #b45309; --sec-suave: #fffbeb; }
  .lema { font-size: 12.5px; color: var(--gris); margin-top: -4px; }
  .mini { font-size: 12px; color: var(--gris); }
  table.tres th:nth-child(1) { width: 26%; }
  table.mat { font-size: 12px; }
  table.mat th:nth-child(1) { width: 38%; }
  table.mat code { font-size: 11px; word-break: break-all; }
  table.audit td:nth-child(1) { width: 6%; text-align: center; }
  table.audit td:nth-child(3), table.audit td:nth-child(4) { width: 20%; height: 24px; }
  .vocab span { display: inline-block; font-size: 11.5px; border: 1px solid var(--linea);
                border-radius: 999px; padding: 1px 7px; margin: 2px 2px 0 0; }
  ol.defensa li, ol.treinta li { margin: 4px 0; }
  ol.treinta { margin-bottom: 2px; }
  ol.treinta li { margin: 2px 0; }
</style>
</head>
<body>
<button class="imprimir-btn" onclick="window.print()">🖨️ Imprimir la ficha</button>

<div class="doc">

${[p1, ...paginas, p10].join('\n\n')}

</div>
</body>
</html>
`;

fs.writeFileSync(path.join(RAIZ, 'fichas', 'ficha-ingenieria-asignaciones.html'), doc, 'utf8');
console.log('ficha-ingenieria-asignaciones: 10 páginas generadas desde el catálogo');
const nPreg = TREINTA.reduce((n, g) => n + g[1].length, 0);
if (nPreg !== 30) { console.error('✘ la defensa final tiene ' + nPreg + ' preguntas y tienen que ser 30'); process.exit(1); }
console.log('preguntas de la defensa final: ' + nPreg);
