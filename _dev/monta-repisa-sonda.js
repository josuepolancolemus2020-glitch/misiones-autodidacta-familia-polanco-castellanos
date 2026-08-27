'use strict';
/* ══════════════════════════════════════════════════════════════════
   LE PONE A LA SONDA DE UNA MISIÓN SU GUARDIÁN DE LA REPISA
   ══════════════════════════════════════════════════════════════════

   Compañera de `_dev/monta-repisa.js`. Aquella monta la repisa en la
   misión; esta le añade a SU sonda las seis medidas que la norma 6-bis
   exige de cada misión que la lleve.

   Lo hondo se mide en `_dev/probe-recursos-enlaces.html` y en
   `_dev/probe-recursos-enlaces-nube.html`, que son del aparato. Aquí
   solo se comprueba lo que puede fallar AL COPIAR EL MOLDE, que es lo
   que de verdad se rompe al replicar:

     · que la misión lleve la repisa y su aparato cargado;
     · que la clave del almacén sea la SUYA. Esta es la importante: al
       copiar el molde se hereda, y dos misiones acabarían compartiendo
       repisa sin que nada se viera roto;
     · que pinte sus tarjetas y que cada una traiga su asa;
     · que la etiqueta de máquina esté a la vista (regla de oro);
     · que ninguna tarjeta enlace fuera de http o https;
     · y que vaya la primera de la sección, antes de la ficha.

   Uso:  node _dev/monta-repisa-sonda.js <sonda.html> <clave-de-la-mision>
   Es idempotente.
   ══════════════════════════════════════════════════════════════════ */

const fs = require('fs');

const sonda = process.argv[2];
const clave = process.argv[3];
if (!sonda || !clave) {
  console.error('Uso: node _dev/monta-repisa-sonda.js <sonda.html> <clave-de-la-mision>');
  process.exit(1);
}
let s = fs.readFileSync(sonda, 'utf8');
if (s.indexOf('data-re-repisa') >= 0) { console.log('· ' + sonda + ': ya lo tenía'); process.exit(0); }

const ancla = "    log('\\n── EN LA APLICACIÓN ──');";
if (s.indexOf(ancla) < 0) { console.error('✘ ' + sonda + ': no está el ancla «EN LA APLICACIÓN»'); process.exit(1); }

const bloque = [
  "    /* ── LA REPISA DE ENLACES (norma 6-bis) ──",
  "       Lo hondo se mide en `_dev/probe-recursos-enlaces.html`; aquí solo",
  "       lo que se rompe AL COPIAR EL MOLDE. */",
  "    log('\\n── LA REPISA DE ENLACES (norma 6-bis) ──');",
  "    const repisa = d.querySelector('[data-re-repisa]');",
  "    ok(!!repisa, 'Recursos trae la repisa de herramientas de estudio', 'no hay repisa en Recursos');",
  "    ok(!!w.FaroRepisa, 'con su aparato compartido cargado', 'el aparato de la repisa no se cargó');",
  "    /* La que de verdad importa al replicar: la clave se hereda con el",
  "       molde, y dos misiones compartiendo repisa no se ve roto. */",
  "    ok(w.RECURSOS_ENLACES && w.RECURSOS_ENLACES.mision === " + JSON.stringify(clave) + ",",
  "       'y la clave del almacén es la de ESTA misión', 'la repisa usa la clave de otra misión (se heredó del molde): ' + (w.RECURSOS_ENLACES && w.RECURSOS_ENLACES.mision));",
  "    /* La cuenta sale del catálogo, no escrita a mano. */",
  "    ok(repisa && repisa.querySelectorAll('.re-card').length === w.RECURSOS_ENLACES.enlaces.length,",
  "       'y pinta sus ' + w.RECURSOS_ENLACES.enlaces.length + ' tarjetas', 'la repisa no pinta todas sus tarjetas');",
  "    ok(repisa && repisa.querySelectorAll('[data-re-asa]').length === w.RECURSOS_ENLACES.enlaces.length,",
  "       'cada una con su asa para moverla', 'alguna tarjeta se quedó sin asa');",
  "    /* La etiqueta de estatus no es opcional: es la regla de oro de esta",
  "       ruta aplicada a lo que hizo una máquina. */",
  "    ok(repisa && /repaso/.test(repisa.textContent) && /máquina/.test(repisa.textContent),",
  "       'la repisa dice a la vista que eso lo hizo una máquina y es material de repaso', 'la repisa cuelga material de máquina sin su etiqueta');",
  "    ok([...(repisa ? repisa.querySelectorAll('a.re-card') : [])].every(a => /^https?:\\/\\//.test(a.getAttribute('href') || '')),",
  "       'las tarjetas que enlazan lo hacen solo por http o https', 'hay una tarjeta con un enlace que no es http');",
  "    const fichaP = [...d.querySelectorAll('#s-recursos p')].find(x => /Ficha de estudio imprimible/.test(x.textContent));",
  "    ok(!!repisa && !!fichaP && (repisa.compareDocumentPosition(fichaP) & Node.DOCUMENT_POSITION_FOLLOWING) > 0,",
  "       'y va la primera de Recursos, antes de la ficha', 'la repisa no va primero');",
  "",
  ""
].join('\n');

fs.writeFileSync(sonda, s.replace(ancla, bloque + ancla));
console.log('✔ ' + sonda + ': guardián de la repisa puesto');
