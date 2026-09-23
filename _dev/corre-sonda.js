/* Corre una sonda de _dev/ en un Chromium SIN CABEZA y escribe su veredicto.

     node _dev/servidor-estatico.js &                       (en otra terminal)
     NODE_PATH=/opt/node22/lib/node_modules node _dev/corre-sonda.js _dev/probe-consigna.html

   Por qué existe: en las sesiones de Claude Code no hay pantalla, y una sonda
   que nadie abre en un navegador no prueba nada. Esto la abre en el Chromium
   que ya trae la sesión, espera a que ponga APRUEBA o SUSPENDE en el título
   (CLAUDE.md, «Las sondas declaran su veredicto en el título») e imprime su
   informe y los errores de la consola, que son justo lo que un veredicto no
   dice. Vivió en una carpeta temporal hasta el 23 de septiembre de 2026; un
   reinicio del contenedor lo habría borrado, y con él la manera de correr las
   sondas.

   SONDA_MS     cuánto esperar el veredicto (por omisión 90 s; las sondas
                largas, como la de La Voz Prestada, piden 540000).
   SONDA_ANCHO  ancho de la ventana (por omisión 1200). La sonda mide dentro
                de su propio marco, así que esto casi nunca hace falta. */
const { chromium } = require('playwright');
(async () => {
  const ruta = process.argv[2] || '_dev/probe-redaccion-redes.html';
  const espera = Number(process.env.SONDA_MS) || 90000;
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: Number(process.env.SONDA_ANCHO) || 1200, height: 800 } });
  const errores = [];
  pg.on('pageerror', e => errores.push('pageerror: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
  pg.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });
  await pg.goto('http://localhost:8124/' + ruta);
  try {
    await pg.waitForFunction(() => /APRUEBA|SUSPENDE/.test(document.title), null, { timeout: espera });
  } catch (e) { console.log(`SIN VEREDICTO en ${Math.round(espera / 1000)} s`); }
  console.log('TÍTULO:', await pg.title());
  console.log(await pg.textContent('#out').catch(() => '(la sonda no tiene #out)'));
  if (errores.length) console.log('\nERRORES DE CONSOLA:\n' + errores.slice(0, 20).join('\n'));
  await pg.screenshot({ path: process.argv[3] || '/tmp/sonda.png', fullPage: false });
  await b.close();
})();
