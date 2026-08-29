'use strict';

/* ─────────────────────────────────────────────
   LA CRIBA 🪶 · la edición del día
   ─────────────────────────────────────────────
   Lo que un recolector (Edge Function `criba-cosecha`, despertada por
   un reloj cada madrugada) recogió de las fuentes que la sonda
   comprobó. Esta pantalla SOLO LEE: lo único que escribe es si algo
   está leído o guardado, y eso lo hace cumplir la seguridad por fila,
   no esta pantalla.

   ⚠️ TODO LO QUE SE PINTA AQUÍ LO ESCRIBIÓ UN DESCONOCIDO.
   Títulos, resúmenes y nombres de autor de la internet abierta,
   dentro de F.A.R.O con la sesión de la casa puesta: la Bóveda, las
   finanzas, el chat y los teléfonos del Buzón. Es el mismo riesgo que
   ya está escrito para las Sugerencias de M.E.T.A.S, pero peor, porque
   allí escribe gente que abrió una misión y aquí es el 100% del
   contenido.

   Por eso este archivo NO ARMA HTML CON DATOS. Ni una plantilla, ni un
   innerHTML con texto de la base: todo con createElement y
   textContent, y las direcciones comprobadas con URL() y puestas con
   setAttribute. Es la regla de la repisa de enlaces, y aquí no se
   negocia. Un escape que se olvida una vez es un agujero; un
   textContent que se olvida no pinta nada y se ve.

   LAS REGLAS DE LA PUERTA QUE VIVEN EN ESTA PANTALLA:
     1. El nivel de evidencia SIEMPRE a la vista, y no se puede apagar.
     4. Lo retractado vuelve, y se ve que está retractado.
     5. El peso de la fuente se ve; no se esconde dentro del orden.
     6. Lo que no llega se DICE, con su botón de reintentar.
     8. La edición tiene FONDO: se acaba, y lo dice.
───────────────────────────────────────────── */

const CRIBA_ITEMS   = 'criba_items';
const CRIBA_FUENTES = 'criba_fuentes';

/* Regla 1. El orden importa: es una escala, de más a menos. El rótulo
   se enseña entero porque «revisado por pares» y «preprint» no
   significan lo mismo y la diferencia es el producto. */
const CRIBA_EVIDENCIA = {
  revision:   { t: 'Revisión sistemática', ic: '🥇', cls: 'crb-ev-1' },
  revisado:   { t: 'Revisado por pares',   ic: '🥈', cls: 'crb-ev-2' },
  preprint:   { t: 'Preprint · sin revisar', ic: '📄', cls: 'crb-ev-3' },
  trabajo:    { t: 'Documento de trabajo', ic: '📋', cls: 'crb-ev-4' },
  prensa:     { t: 'Nota de prensa',       ic: '📰', cls: 'crb-ev-5' },
  comentario: { t: 'Comentario',           ic: '💬', cls: 'crb-ev-6' },
};

/* Cuántos días sin traer nada antes de avisar. Uno solo daría un aviso
   cada fin de semana en fuentes que publican entre semana; tres días
   ya es raro en todas las que hay. */
const CRIBA_DIAS_MUDA = 3;

let _crbSb      = null;
let _crbItems   = [];
let _crbFuentes = {};
let _crbFiltro  = 'sinleer';  // 'todas' | 'sinleer' | 'guardadas'
let _crbRacimo  = '';         // '' = todos
let _crbDia     = null;       // null = la edición de hoy
let _crbHay     = true;       // ¿se corrió ya el SQL en esta base?

/* ── Defensa ─────────────────────────────────────────────────────── */

/* La dirección acaba dentro de un href de F.A.R.O. Se comprueba con
   URL() y NO con un grep: `java\tscript:` y `JavaScript:` pasan un grep
   ingenuo y el navegador los ejecuta igual. */
function crbUrl(s) {
  if (!s || /["'<>\\\s]/.test(s)) return '';
  let u;
  try { u = new URL(s); } catch (e) { return ''; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
  return u.href;
}

/* El sitio en limpio, para ver a dónde lleva ANTES de tocarlo. */
function crbSitio(href) {
  try { return new URL(href).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
}

/* ── Piezas de pantalla, todas con createElement ──────────────────── */

function crbEl(tag, cls, texto) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (texto != null) e.textContent = texto;   // NUNCA innerHTML con datos
  return e;
}

function crbFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const hoy = new Date();
  const dias = Math.floor((hoy - d) / 86400000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 30) return 'hace ' + dias + ' días';
  return d.toLocaleDateString('es-HN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── La nube ──────────────────────────────────────────────────────── */

async function crbCliente() {
  if (_crbSb) return _crbSb;
  _crbSb = window.faroSb || null;
  return _crbSb;
}

async function initCriba() {
  const sb = await crbCliente();
  const cont = document.getElementById('crb-lista');
  if (!cont) return;
  if (!sb) { crbSinNube(); return; }

  cont.textContent = '';
  cont.appendChild(crbEl('div', 'crb-cargando', 'Trayendo la edición…'));

  // Las fuentes primero: hacen falta para el peso, el racimo y la salud.
  const { data: fs, error: eF } = await sb.from(CRIBA_FUENTES).select('*');
  if (eF) { _crbHay = false; crbSinTabla(eF); return; }
  _crbHay = true;
  _crbFuentes = {};
  (fs || []).forEach(f => { _crbFuentes[f.id] = f; });

  await crbTraerEdicion();
  crbPintarSalud();
  crbPintarChips();
  crbPintar();
}

/* La edición de un día. Con FONDO: lo que hay es lo que hay. */
async function crbTraerEdicion() {
  const sb = await crbCliente();
  if (!sb) return;
  let q = sb.from(CRIBA_ITEMS)
    .select('id,fuente_id,titulo,resumen,url,doi,idioma,evidencia,publicado,edicion,orden,leido_at,guardado,retractado_at')
    .order('orden', { ascending: true });
  q = _crbDia ? q.eq('edicion', _crbDia) : q.eq('edicion', crbHoy());
  const { data, error } = await q;
  _crbItems = error ? [] : (data || []);
}

function crbHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ── Regla 6: lo que no llega, SE DICE ────────────────────────────── */

function crbPintarSalud() {
  const zona = document.getElementById('crb-salud');
  if (!zona) return;
  zona.textContent = '';

  const ahora = Date.now();
  const mudas = Object.values(_crbFuentes).filter(f => {
    if (!f.activa) return false;
    if (!f.ultimo_exito_at) return true;              // nunca trajo nada
    return (ahora - new Date(f.ultimo_exito_at)) > CRIBA_DIAS_MUDA * 86400000;
  });
  if (!mudas.length) return;

  const caja = crbEl('div', 'crb-aviso');
  caja.appendChild(crbEl('div', 'crb-aviso-t', '📴 De estas fuentes no cae nada'));
  mudas.forEach(f => {
    const fila = crbEl('div', 'crb-aviso-fila');
    fila.appendChild(crbEl('strong', null, f.nombre));
    const desde = f.ultimo_exito_at
      ? ' · sin traer nada desde ' + crbFecha(f.ultimo_exito_at)
      : ' · nunca ha traído nada';
    fila.appendChild(crbEl('span', null, desde));
    if (f.ultimo_error) fila.appendChild(crbEl('em', 'crb-aviso-err', f.ultimo_error));
    caja.appendChild(fila);
  });
  const pie = crbEl('div', 'crb-aviso-pie',
    'Puede que hayan cambiado su canal. Hasta arreglarlo, la edición sale sin ellas.');
  caja.appendChild(pie);
  zona.appendChild(caja);
}

/* ── Los chips ────────────────────────────────────────────────────── */

function crbPintarChips() {
  const zona = document.getElementById('crb-chips');
  if (!zona) return;
  zona.textContent = '';

  const sinLeer = _crbItems.filter(i => !i.leido_at).length;
  const guard   = _crbItems.filter(i => i.guardado).length;

  /* ⚠️ «Sin leer» va SEGUNDO y es el que de verdad se usa. Es la misma
     lección del filtro de materias de Videos M.E.T.A.S: el trabajo no
     es «ver todo», es saber qué falta por mirar. */
  const chips = [
    ['todas',     'Todas',     _crbItems.length],
    ['sinleer',   'Sin leer',  sinLeer],
    ['guardadas', 'Guardadas', guard],
  ];
  chips.forEach(([id, txt, n]) => {
    const b = crbEl('button', 'crb-chip' + (_crbFiltro === id ? ' crb-chip-on' : ''));
    b.type = 'button';
    b.appendChild(crbEl('span', null, txt));
    if (n) b.appendChild(crbEl('span', 'crb-chip-n', String(n)));
    b.addEventListener('click', () => { _crbFiltro = id; crbPintarChips(); crbPintar(); });
    zona.appendChild(b);
  });

  // Los racimos salen de las fuentes que hay, nunca de una lista escrita
  // aquí: si mañana entra una fuente de otro racimo, aparece sola.
  const racimos = [...new Set(_crbItems
    .map(i => (_crbFuentes[i.fuente_id] || {}).racimo)
    .filter(Boolean))].sort();
  racimos.forEach(r => {
    const b = crbEl('button', 'crb-chip crb-chip-rac' + (_crbRacimo === r ? ' crb-chip-on' : ''));
    b.type = 'button';
    b.appendChild(crbEl('span', null, r));
    b.addEventListener('click', () => {
      _crbRacimo = (_crbRacimo === r) ? '' : r;
      crbPintarChips(); crbPintar();
    });
    zona.appendChild(b);
  });
}

/* ── La lista ─────────────────────────────────────────────────────── */

function crbVisibles() {
  const v = _crbItems.filter(i => {
    /* ⚠️ LO RETRACTADO SE SALTA EL FILTRO DE «SIN LEER», Y ESA ES LA
       REGLA 4 ENTERA. La sonda lo destapó el 29 de agosto de 2026: con
       el filtro por omisión, un trabajo retractado que YA SE HABÍA LEÍDO
       quedaba escondido — y ese es exactamente el único caso que
       importa. De nada sirve avisar de una retractación a quien no llegó
       a leer el trabajo; hay que avisar a quien se lo creyó. */
    if (i.retractado_at && _crbFiltro !== 'guardadas') {
      if (_crbRacimo) {
        const f = _crbFuentes[i.fuente_id];
        if (!f || f.racimo !== _crbRacimo) return false;
      }
      return true;
    }
    if (_crbFiltro === 'sinleer'   && i.leido_at) return false;
    if (_crbFiltro === 'guardadas' && !i.guardado) return false;
    if (_crbRacimo) {
      const f = _crbFuentes[i.fuente_id];
      if (!f || f.racimo !== _crbRacimo) return false;
    }
    return true;
  });

  /* Y va PRIMERO. Una retractación es una corrección de algo que ya se
     dio por bueno: enterrarla en el puesto catorce de la edición es
     casi lo mismo que no darla. */
  return v.sort((a, b) => (b.retractado_at ? 1 : 0) - (a.retractado_at ? 1 : 0));
}

function crbPintar() {
  const cont = document.getElementById('crb-lista');
  if (!cont) return;
  cont.textContent = '';

  const vis = crbVisibles();
  if (!vis.length) { cont.appendChild(crbVacio()); return; }

  vis.forEach(i => cont.appendChild(crbTarjeta(i)));

  /* ⚠️ REGLA 8: LA EDICIÓN TIENE FONDO, Y SE DICE.
     Aquí no hay «cargar más», ni scroll infinito, ni nada que siga
     saliendo. Se acaba, y decirlo en voz alta es medio producto: es lo
     que separa esto de la cosa que se intenta dejar de leer. */
  const fin = crbEl('div', 'crb-fin');
  fin.appendChild(crbEl('div', 'crb-fin-l', '· · ·'));
  fin.appendChild(crbEl('div', 'crb-fin-t', 'Hasta aquí la edición de hoy.'));
  fin.appendChild(crbEl('div', 'crb-fin-s',
    'Lo que sobró no se perdió: sale mañana.'));
  cont.appendChild(fin);
}

function crbVacio() {
  const v = crbEl('div', 'crb-vacio');
  if (_crbFiltro === 'sinleer' && _crbItems.length) {
    v.appendChild(crbEl('div', 'crb-vacio-ic', '✅'));
    v.appendChild(crbEl('div', 'crb-vacio-t', 'Leíste la edición entera.'));
    v.appendChild(crbEl('div', 'crb-vacio-s', 'Mañana hay otra.'));
  } else if (_crbFiltro === 'guardadas') {
    v.appendChild(crbEl('div', 'crb-vacio-ic', '🔖'));
    v.appendChild(crbEl('div', 'crb-vacio-t', 'Todavía no has guardado nada.'));
  } else {
    v.appendChild(crbEl('div', 'crb-vacio-ic', '🪶'));
    v.appendChild(crbEl('div', 'crb-vacio-t', 'Hoy no hay edición.'));
    v.appendChild(crbEl('div', 'crb-vacio-s',
      'El recolector corre de madrugada. Si lleva días así, mira el aviso de arriba.'));
  }
  return v;
}

function crbTarjeta(i) {
  const f = _crbFuentes[i.fuente_id] || {};
  const t = crbEl('article', 'crb-card' + (i.leido_at ? ' crb-leido' : ''));

  /* Regla 4: lo retractado VUELVE, y lo primero que se ve es eso.
     Va ARRIBA del título a propósito: si fuera una etiqueta pequeña al
     pie, se leería el titular y se creería. */
  if (i.retractado_at) {
    const r = crbEl('div', 'crb-retractado',
      '⛔ RETRACTADO · este trabajo se retiró después de publicarse');
    t.appendChild(r);
  }

  // Regla 1: el nivel de evidencia, siempre, y sin forma de apagarlo.
  const ev = CRIBA_EVIDENCIA[i.evidencia] || CRIBA_EVIDENCIA.comentario;
  const tira = crbEl('div', 'crb-tira');
  const chipEv = crbEl('span', 'crb-ev ' + ev.cls, ev.ic + ' ' + ev.t);
  tira.appendChild(chipEv);

  // Regla 5: el peso de la fuente, a la vista.
  const chipF = crbEl('span', 'crb-fuente');
  chipF.appendChild(crbEl('span', null, f.nombre || i.fuente_id));
  if (typeof f.peso === 'number') chipF.appendChild(crbEl('span', 'crb-peso', 'peso ' + f.peso));
  tira.appendChild(chipF);

  if (i.idioma && i.idioma !== 'es') tira.appendChild(crbEl('span', 'crb-idioma', i.idioma.toUpperCase()));
  t.appendChild(tira);

  const tit = crbEl('h3', 'crb-tit', i.titulo || '(sin título)');
  t.appendChild(tit);

  if (i.resumen) t.appendChild(crbEl('p', 'crb-res', i.resumen));

  const pie = crbEl('div', 'crb-pie');
  const cuando = i.publicado ? crbFecha(i.publicado) : '';
  if (cuando) pie.appendChild(crbEl('span', null, cuando));

  const href = crbUrl(i.url);
  if (href) {
    const a = crbEl('a', 'crb-abrir', 'Abrir en ' + crbSitio(href) + ' ↗');
    /* setAttribute y no a.href = …: es la misma disciplina de las
       Sugerencias. Y rel con noopener, que si no la página abierta
       puede tocar la que la abrió. */
    a.setAttribute('href', href);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.addEventListener('click', () => crbMarcar(i, { leido: true }));
    pie.appendChild(a);
  }
  t.appendChild(pie);

  const bots = crbEl('div', 'crb-bots');

  const bLeido = crbEl('button', 'crb-bot', i.leido_at ? '👁 Leída' : 'Marcar leída');
  bLeido.type = 'button';
  bLeido.addEventListener('click', () => crbMarcar(i, { leido: !i.leido_at }));
  bots.appendChild(bLeido);

  const bGuard = crbEl('button', 'crb-bot' + (i.guardado ? ' crb-bot-on' : ''),
    i.guardado ? '🔖 Guardada' : 'Guardar');
  bGuard.type = 'button';
  bGuard.addEventListener('click', () => crbMarcar(i, { guardado: !i.guardado }));
  bots.appendChild(bGuard);

  t.appendChild(bots);
  return t;
}

/* ── Lo único que esta pantalla escribe ───────────────────────────── */

async function crbMarcar(i, cambio) {
  const sb = await crbCliente();
  if (!sb) return;
  const patch = {};
  if ('leido'    in cambio) patch.leido_at = cambio.leido ? new Date().toISOString() : null;
  if ('guardado' in cambio) patch.guardado = cambio.guardado;

  // Se pinta antes de que conteste la nube: en una tableta con señal
  // regular, un botón que tarda dos segundos en responder se toca dos
  // veces. Si falla, se deshace y se dice.
  Object.assign(i, patch);
  crbPintarChips(); crbPintar();

  const { error } = await sb.from(CRIBA_ITEMS).update(patch).eq('id', i.id);
  if (error) {
    if ('leido'    in cambio) i.leido_at = cambio.leido ? null : new Date().toISOString();
    if ('guardado' in cambio) i.guardado = !cambio.guardado;
    crbPintarChips(); crbPintar();
    const z = document.getElementById('crb-salud');
    if (z) z.appendChild(crbEl('div', 'crb-aviso', 'No se pudo guardar el cambio. ¿Hay señal?'));
  } else if (typeof crbContarSinLeer === 'function') {
    crbContarSinLeer();
  }
}

/* ── Cuando falta algo ────────────────────────────────────────────── */

function crbSinNube() {
  const c = document.getElementById('crb-lista');
  if (!c) return;
  c.textContent = '';
  const v = crbEl('div', 'crb-vacio');
  v.appendChild(crbEl('div', 'crb-vacio-ic', '🔌'));
  v.appendChild(crbEl('div', 'crb-vacio-t', 'Sin sesión de la casa.'));
  v.appendChild(crbEl('div', 'crb-vacio-s', 'Entra por la puerta de F.A.R.O y vuelve.'));
  c.appendChild(v);
}

/* Si el SQL no se ha corrido, se DICE, con el archivo que falta. Es la
   misma cortesía que la repisa cuando no viaja: mejor decir «esto no
   está puesto» que enseñar una pantalla vacía que parece rota. */
function crbSinTabla(err) {
  const c = document.getElementById('crb-lista');
  if (!c) return;
  c.textContent = '';
  const v = crbEl('div', 'crb-vacio');
  v.appendChild(crbEl('div', 'crb-vacio-ic', '🗄️'));
  v.appendChild(crbEl('div', 'crb-vacio-t', 'La Criba no está puesta en esta base.'));
  v.appendChild(crbEl('div', 'crb-vacio-s',
    'Falta correr supabase/sql/criba.sql en el editor de Supabase.'));
  if (err && err.message) v.appendChild(crbEl('code', 'crb-vacio-err', err.message));
  c.appendChild(v);
}

/* ── El contador de la portada ────────────────────────────────────── */

/* Sin abrir la herramienta, y SIN BAJAR NI UNA FILA: la portada no
   puede arrastrar la edición entera cada vez que arranca la
   aplicación. Es la misma consulta de solo contar que usa Sugerencias. */
async function crbContarSinLeer() {
  const b = document.getElementById('crb-badge');
  if (!b) return;
  const sb = window.faroSb;
  if (!sb) { b.style.display = 'none'; return; }
  const { count, error } = await sb.from(CRIBA_ITEMS)
    .select('id', { count: 'exact', head: true })
    .eq('edicion', crbHoy())
    .is('leido_at', null);
  if (error) { b.style.display = 'none'; return; }   // sin instalar: ni se menciona
  b.textContent = (count || 0) > 99 ? '99+' : String(count || 0);
  b.style.display = count ? '' : 'none';
}

/* ── Wiring ──────────────────────────────────────────────────────── */
document.getElementById('crb-back-btn')
  ?.addEventListener('click', () => switchView('view-inicio'));
