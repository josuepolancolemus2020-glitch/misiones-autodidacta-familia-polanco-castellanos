'use strict';

/* ─────────────────────────────────────────────
   VIDEOS DE M.E.T.A.S 🎬 · los pone el administrador, los ve el alumno
   ─────────────────────────────────────────────
   Cada misión de M.E.T.A.S tiene una sección 🎬 Videos. Lo que se ve
   ahí sale de aquí: el administrador pega el enlace de YouTube, lo
   mira, lo publica, y aparece en el teléfono del alumno sin desplegar
   nada.

   POR QUÉ ESTÁ EN F.A.R.O Y NO EN M.E.T.A.S: por lo mismo que la
   bandeja de Sugerencias, y es el ESPEJO de aquella. Allí M.E.T.A.S
   escribe y F.A.R.O lee; aquí F.A.R.O escribe y M.E.T.A.S lee. El otro
   extremo del cable es `js/metas-videos.js` en el repositorio de
   M.E.T.A.S, y la tabla la crea `supabase/sql/metas_videos.sql`.

   Y ES LO QUE IMPIDE QUE EL ALUMNO META VIDEOS EN SU MISIÓN. No es una
   comprobación de pantalla —esas se saltan con la consola en diez
   segundos—: es que con la clave publicable que va en el código de
   M.E.T.A.S no existe una puerta de escritura. Solo se puede llamar a
   una función que LEE lo publicado. Escribir requiere sesión de la
   familia, aquí, y lo hace cumplir la seguridad por fila.

   POR QUÉ VA EN EL ACCESO RÁPIDO: por lo mismo que las Sugerencias, y
   además porque las dos cosas se contestan juntas. Una sugerencia que
   dice «no entiendo las fracciones equivalentes» se responde pegando
   un video, y tenerlas a un toque una de otra cierra ese círculo.

   ⚠️ LA REGLA DE ORO: POR LA BASE NO VIAJA NUNCA UNA DIRECCIÓN.
   Se guarda el IDENTIFICADOR de once caracteres. Ese dato acaba dentro
   del `src` de un `<iframe>` en la pantalla del alumno, y en el
   alfabeto [A-Za-z0-9_-] no hay comillas, ni espacios, ni dos puntos,
   ni barras: `javascript:` no se puede ni escribir. Lo comprueban
   `mvidId()` aquí, el `check` de la columna allá, y `vmId()` en la
   pantalla de la misión. Las tres, porque una sola se olvida.
───────────────────────────────────────────── */

const MVID_TABLE = 'metas_videos';
const MVID_SITIO = 'https://metas.policastsapien.com';
/* El catálogo público de M.E.T.A.S, para no tener que escribir a mano
   la carpeta de la misión. Se trae una vez y se guarda: el
   administrador trabaja desde la tableta y muchas veces sin señal
   buena. Si no llega, se escribe a mano y ya. */
const MVID_CATALOGO = MVID_SITIO + '/js/data/misiones.js';
const MVID_CACHE_MIS = 'FARO_MVID_MISIONES_V1';

let _mvidCache = [];        // los videos de la misión abierta
let _mvidHay = true;        // ¿ya se corrió el SQL en esta base?
let _mvidMision = '';       // la misión que se está mirando
let _mvidMisiones = [];     // [{clave, titulo}] del catálogo de M.E.T.A.S
let _mvidEditando = null;   // la fila abierta en el formulario

const MVID_ESTADOS = {
  borrador:  { label: '📝 Sin publicar', cls: 'mvid-est-bor' },
  publicado: { label: '✅ Publicado',    cls: 'mvid-est-pub' },
  oculto:    { label: '🚫 Retirado',     cls: 'mvid-est-oc'  },
};

/* ── Las comprobaciones ──────────────────────────────────────────── */

/* El identificador de YouTube: ONCE caracteres y nada más. */
function mvidId(s) {
  const t = (s == null ? '' : String(s)).trim();
  return /^[A-Za-z0-9_-]{11}$/.test(t) ? t : '';
}

/* De un enlace pegado, el identificador y los segundos del `&t=`.

   Se usa URL() y no una expresión sobre el texto pelado, por lo mismo
   que en la repisa de enlaces: `java\tscript:` y `JavaScript:` pasan un
   grep ingenuo. Aquí además da igual lo que traiga el enlace, porque de
   él solo se saca lo que encaje en once caracteres del alfabeto bueno;
   pero se hace bien de todas formas, que es más barato que explicar por
   qué no.

   Devuelve { yt, ini } y `yt` vacío si no había nada aprovechable. */
function mvidDeEnlace(txt) {
  const s = (txt == null ? '' : String(txt)).trim();
  if (!s) return { yt: '', ini: 0 };

  /* Lo primero: que sea directamente el identificador. Es lo que pasa
     cuando alguien copia de otra ficha en vez de del navegador. */
  if (mvidId(s)) return { yt: s, ini: 0 };

  let u;
  try { u = new URL(s); } catch (e) { return { yt: '', ini: 0 }; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { yt: '', ini: 0 };

  const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
  let bruto = '';
  if (host === 'youtu.be') {
    bruto = u.pathname.slice(1);
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') bruto = u.searchParams.get('v') || '';
    else {
      /* /embed/ID, /shorts/ID, /live/ID, /v/ID */
      const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/);
      if (m) bruto = m[2];
    }
  }
  const yt = mvidId(bruto);
  if (!yt) return { yt: '', ini: 0 };

  /* Los segundos, que YouTube escribe de tres formas distintas:
     `t=90`, `t=90s` y `t=1m30s`. Recortar el video es la defensa más
     barata contra los anuncios y contra los cuatro minutos de careta
     del canal, así que vale la pena no perderlos. */
  const t = u.searchParams.get('t') || u.searchParams.get('start') || '';
  return { yt, ini: mvidSegundos(t) };
}

function mvidSegundos(t) {
  const s = String(t || '').trim().toLowerCase();
  if (!s) return 0;
  if (/^\d+$/.test(s)) return mvidTope(parseInt(s, 10));
  const m = s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!m || (!m[1] && !m[2] && !m[3])) return 0;
  return mvidTope((+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0)));
}
function mvidTope(n) {
  const v = parseInt(n, 10);
  if (!isFinite(v) || v <= 0) return 0;
  return v > 86400 ? 0 : v;    // el mismo tope que el check de la columna
}

/* Escapar, con la comilla incluida — igual que msugEsc en la bandeja de
   Sugerencias y redEsc en Redacción. El navegador NO escapa la comilla
   doble al serializar en modo texto, así que sin esta línea un dato con
   comillas podría cerrar un atributo.

   Aun con esto, en este archivo NINGÚN dato de la base se interpola
   dentro de un atributo. Cinturón y tirantes. */
function mvidEsc(s) {
  const div = document.createElement('div');
  div.textContent = s == null ? '' : s;
  return div.innerHTML.replace(/"/g, '&quot;');
}

/* La miniatura y el reproductor. Son los DOS únicos sitios del archivo
   donde se arma una dirección de YouTube, y las dos se arman con un
   literal delante y un identificador ya comprobado detrás. */
function mvidMini(yt) { return 'https://i.ytimg.com/vi/' + yt + '/mqdefault.jpg'; }
function mvidEmbed(yt, ini) {
  const p = ['rel=0', 'modestbranding=1', 'playsinline=1', 'iv_load_policy=3'];
  if (ini) p.push('start=' + ini);
  return 'https://www.youtube-nocookie.com/embed/' + yt + '?' + p.join('&');
}

/* ── Las misiones de M.E.T.A.S ───────────────────────────────────── */

/* El catálogo se TRAE del sitio público, no se copia aquí. Una copia
   se queda vieja: hoy son 57 misiones y el plan es cubrir el currículo
   entero, así que una lista escrita a mano en este archivo estaría
   equivocada la semana que viene. Es la misma razón por la que en
   M.E.T.A.S los números del texto se cuentan y no se escriben.

   Si no llega (sin señal, o el sitio caído), se usa lo guardado la
   última vez, y si tampoco hay, se escribe la carpeta a mano. */
async function mvidCargarMisiones() {
  try {
    const g = JSON.parse(localStorage.getItem(MVID_CACHE_MIS));
    if (g && Array.isArray(g.lista) && g.lista.length) _mvidMisiones = g.lista;
  } catch (e) {}

  try {
    const r = await fetch(MVID_CATALOGO, { cache: 'no-cache' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const txt = await r.text();
    /* El archivo es JavaScript, no JSON. Se lee con Function y NO con
       eval: así corre en su propio ámbito y no puede tocar nada de
       aquí. Es lo mismo que ya hace la cuenta de misiones del CLAUDE.md
       de M.E.T.A.S para no escribir los números a mano. */
    const caja = {};
    new Function('g', 'with(g){' + txt + '; g.M = typeof MISSIONS !== "undefined" ? MISSIONS : []; }')(caja);
    const lista = (caja.M || []).map(m => {
      /* De 'misiones/2y3ciclo-fracciones/fracciones.html' sale la
         carpeta, que es la clave con la que se guardan los videos y la
         misma que usan las Sugerencias. */
      const p = String(m.url || '').split('/');
      return { clave: p.length > 1 ? p[1] : '', titulo: String(m.title || '') };
    }).filter(x => x.clave);
    if (lista.length) {
      _mvidMisiones = lista;
      try { localStorage.setItem(MVID_CACHE_MIS, JSON.stringify({ lista, t: Date.now() })); } catch (e) {}
    }
  } catch (e) { /* se queda lo guardado, o nada y se escribe a mano */ }
}

/* ── Carga ───────────────────────────────────────────────────────── */

async function initMetasVideos() {
  const list = document.getElementById('mvid-list');
  if (!list) return;

  if (!_sb) {
    list.innerHTML = '<div class="fin-empty">No se pudo conectar.</div>';
    return;
  }

  list.innerHTML = '<div class="fin-empty">Abriendo…</div>';
  await mvidCargarMisiones();
  mvidPintarSelector();

  /* Mientras no se haya corrido metas_videos.sql la tabla no existe.
     En vez de reventar, se dice qué falta: el que abre esto desde la
     tableta no tiene el repositorio delante para averiguarlo. */
  const { data, error } = await _sb.from(MVID_TABLE)
    .select('*')
    .order('mision', { ascending: true })
    .order('orden', { ascending: true })
    .limit(1000);

  if (error) {
    _mvidHay = false;
    _mvidCache = [];
    list.innerHTML = `
      <div class="msug-vacio">
        <div class="msug-vacio-ic">🧰</div>
        <p><strong>Los videos todavía no están instalados.</strong></p>
        <p>Falta correr <code>supabase/sql/metas_videos.sql</code> en el editor
           SQL de Supabase. Es un solo archivo y se puede correr dos veces sin
           dañar nada.</p>
        <p>Mientras tanto, la sección 🎬 Videos de las misiones funciona igual
           con los que estén escritos en el catálogo del repositorio.</p>
      </div>`;
    return;
  }

  _mvidHay = true;
  _mvidCache = data || [];
  if (!_mvidMision && _mvidCache.length) _mvidMision = _mvidCache[0].mision;
  mvidRender();
}

/* ── El selector de misión ───────────────────────────────────────── */

function mvidPintarSelector() {
  const sel = document.getElementById('mvid-mision');
  if (!sel) return;
  sel.innerHTML = '';
  const vacio = document.createElement('option');
  vacio.value = '';
  vacio.textContent = _mvidMisiones.length
    ? '— Elige la misión —'
    : '— Sin catálogo: escríbela abajo —';
  sel.appendChild(vacio);
  _mvidMisiones.forEach(m => {
    const o = document.createElement('option');
    o.value = m.clave;
    /* textContent, no innerHTML: el título sale de un archivo traído
       por la red. */
    o.textContent = m.titulo + '  ·  ' + m.clave;
    sel.appendChild(o);
  });
  sel.value = _mvidMision || '';
}

/* ── Pintado de la lista ─────────────────────────────────────────── */

function mvidDeLaMision() {
  return _mvidCache
    .filter(v => v.mision === _mvidMision)
    .sort((a, b) => (a.orden - b.orden) || (a.id - b.id));
}

function mvidRender() {
  const list = document.getElementById('mvid-list');
  if (!list) return;

  const cont = document.getElementById('mvid-count');
  if (cont) {
    const n = _mvidCache.filter(v => v.mision === _mvidMision).length;
    const pub = _mvidCache.filter(v => v.mision === _mvidMision && v.estado === 'publicado').length;
    cont.textContent = _mvidMision
      ? (n ? `${n} video${n === 1 ? '' : 's'} · ${pub} publicado${pub === 1 ? '' : 's'}` : 'Ninguno todavía')
      : `${_mvidCache.length} en total`;
  }

  if (!_mvidMision) {
    list.innerHTML = `
      <div class="msug-vacio">
        <div class="msug-vacio-ic">🎬</div>
        <p><strong>Elige una misión arriba.</strong></p>
        <p>Los videos que pongas ahí los verá el alumno dentro de esa misión,
           en su pestaña 🎬 Videos.</p>
      </div>`;
    return;
  }

  const videos = mvidDeLaMision();
  if (!videos.length) {
    list.innerHTML = `
      <div class="msug-vacio">
        <div class="msug-vacio-ic">📭</div>
        <p><strong>Esta misión todavía no tiene videos.</strong></p>
        <p>Pega arriba el enlace de YouTube y dale a «Añadir».</p>
      </div>`;
    return;
  }

  list.innerHTML = '';
  videos.forEach((v, i) => list.appendChild(mvidFila(v, i, videos.length)));
}

/* Una fila. Todo con createElement y textContent: ni una plantilla con
   datos dentro. Lo único que llega a un atributo es el identificador de
   once, y va con setAttribute después de mvidId(). */
function mvidFila(v, i, total) {
  const yt = mvidId(v.yt_id);
  const card = document.createElement('div');
  card.className = 'mvid-card';

  const mini = document.createElement('img');
  mini.className = 'mvid-mini';
  mini.setAttribute('alt', '');
  mini.setAttribute('loading', 'lazy');
  if (yt) mini.setAttribute('src', mvidMini(yt));
  mini.onerror = () => { mini.style.visibility = 'hidden'; };
  card.appendChild(mini);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'mvid-cuerpo';

  const tit = document.createElement('div');
  tit.className = 'mvid-tit';
  tit.textContent = v.titulo || '(sin título)';
  cuerpo.appendChild(tit);

  const meta = document.createElement('div');
  meta.className = 'mvid-meta';
  const est = MVID_ESTADOS[v.estado] || MVID_ESTADOS.borrador;
  const pill = document.createElement('span');
  pill.className = 'mvid-pill ' + est.cls;
  pill.textContent = est.label;
  meta.appendChild(pill);
  if (v.dura)  meta.appendChild(mvidChip('⏱ ' + v.dura));
  if (v.canal) meta.appendChild(mvidChip('📺 ' + v.canal));
  if (v.ini || v.fin) {
    meta.appendChild(mvidChip('✂️ ' + mvidReloj(v.ini) + ' → ' + (v.fin ? mvidReloj(v.fin) : 'final')));
  }
  cuerpo.appendChild(meta);

  if (v.nota) {
    const nota = document.createElement('div');
    nota.className = 'mvid-nota';
    nota.textContent = '👩‍🏫 ' + v.nota;
    cuerpo.appendChild(nota);
  }

  /* Los mandos. `flex-wrap` en el CSS: una fila de botones que se sale
     por la derecha no tiene arreglo en un teléfono. */
  const btns = document.createElement('div');
  btns.className = 'mvid-btns';

  btns.appendChild(mvidBoton('👁 Comprobar', 'mvid-b', () => mvidComprobar(v)));
  btns.appendChild(mvidBoton('✏️ Editar', 'mvid-b', () => mvidAbrirForm(v)));
  btns.appendChild(mvidBoton(
    v.estado === 'publicado' ? '🚫 Retirar' : '✅ Publicar', 'mvid-b mvid-b-pri',
    () => mvidPublicar(v, v.estado === 'publicado' ? 'oculto' : 'publicado')));

  /* Subir y bajar, con botones. El arrastre en una tableta falla lo
     bastante como para que una función que solo se pueda usar
     arrastrando sea una función que a veces no existe: es la misma
     lección del asa de la repisa de enlaces. Con dos o tres videos por
     misión, dos flechas bastan y no hay que explicarlas. */
  const arr = mvidBoton('↑', 'mvid-b mvid-b-min', () => mvidMover(v, -1));
  arr.disabled = i === 0;
  const aba = mvidBoton('↓', 'mvid-b mvid-b-min', () => mvidMover(v, 1));
  aba.disabled = i === total - 1;
  btns.appendChild(arr);
  btns.appendChild(aba);

  cuerpo.appendChild(btns);
  card.appendChild(cuerpo);
  return card;
}

function mvidChip(txt) {
  const s = document.createElement('span');
  s.className = 'mvid-chip';
  s.textContent = txt;
  return s;
}
function mvidBoton(txt, clase, alTocar) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = clase;
  b.textContent = txt;
  b.addEventListener('click', alTocar);
  return b;
}
function mvidReloj(seg) {
  const s = mvidTope(seg);
  const m = Math.floor(s / 60), r = s % 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
}

/* ── Comprobar: la única forma honesta de saber si se puede ver ───
   YouTube no dice por ninguna vía barata si el dueño de un video
   permite incrustarlo. Se sabe intentándolo, y hay que intentarlo AQUÍ
   y no en la pantalla del niño: un video que no se deja incrustar sale
   como un cuadro negro con «Ver en YouTube», que es exactamente lo que
   esta sección existe para evitar.

   Se abre en el MISMO reproductor y con los mismos parámetros que va a
   usar la misión. Un ensayo con otro reproductor no prueba nada. */
function mvidComprobar(v) {
  const yt = mvidId(v.yt_id);
  if (!yt) return;
  const ov = document.getElementById('mvid-ver-overlay');
  const caja = document.getElementById('mvid-ver-caja');
  const tit = document.getElementById('mvid-ver-titulo');
  if (!ov || !caja) return;
  tit.textContent = v.titulo || 'Comprobar el video';
  caja.innerHTML = '';
  const f = document.createElement('iframe');
  f.setAttribute('title', v.titulo || 'video');
  f.setAttribute('allow', 'accelerometer; encrypted-media; gyroscope; picture-in-picture');
  f.setAttribute('allowfullscreen', '');
  f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  f.setAttribute('src', mvidEmbed(yt, mvidTope(v.ini)));
  caja.appendChild(f);
  ov.style.display = 'flex';
}
function mvidCerrarVer() {
  const ov = document.getElementById('mvid-ver-overlay');
  const caja = document.getElementById('mvid-ver-caja');
  /* Vaciar el hueco PARA el video: si solo se esconde el panel, el
     video sigue sonando detrás. */
  if (caja) caja.innerHTML = '';
  if (ov) ov.style.display = 'none';
}

/* ── El formulario ───────────────────────────────────────────────── */

function mvidAbrirForm(v) {
  _mvidEditando = v || null;
  const g = id => document.getElementById(id);
  g('mvid-f-enlace').value = v ? v.yt_id : '';
  g('mvid-f-titulo').value = v ? (v.titulo || '') : '';
  g('mvid-f-nota').value   = v ? (v.nota || '') : '';
  g('mvid-f-dura').value   = v ? (v.dura || '') : '';
  g('mvid-f-canal').value  = v ? (v.canal || '') : '';
  g('mvid-f-ini').value    = v && v.ini ? v.ini : '';
  g('mvid-f-fin').value    = v && v.fin ? v.fin : '';
  g('mvid-f-titulo-ventana').textContent = v ? 'Editar el video' : 'Añadir un video';
  g('mvid-f-aviso').textContent = '';
  g('mvid-form-overlay').style.display = 'flex';
}
function mvidCerrarForm() {
  _mvidEditando = null;
  const ov = document.getElementById('mvid-form-overlay');
  if (ov) ov.style.display = 'none';
}

async function mvidGuardar() {
  const g = id => document.getElementById(id);
  const aviso = g('mvid-f-aviso');
  aviso.textContent = '';

  if (!_mvidMision) { aviso.textContent = 'Primero elige la misión.'; return; }

  const { yt, ini: iniEnlace } = mvidDeEnlace(g('mvid-f-enlace').value);
  if (!yt) {
    aviso.textContent = 'Ese enlace no trae un video de YouTube. Pega la dirección completa (youtube.com/watch?v=… o youtu.be/…).';
    return;
  }

  const ini = mvidTope(g('mvid-f-ini').value) || iniEnlace;
  let fin = mvidTope(g('mvid-f-fin').value);
  /* Un final antes del principio deja el video en cero segundos: se ve
     un parpadeo negro y parece roto. Se avisa en vez de guardarlo. */
  if (fin && ini && fin <= ini) {
    aviso.textContent = 'El segundo de fin tiene que ser mayor que el de inicio.';
    return;
  }

  const fila = {
    mision: _mvidMision,
    yt_id: yt,
    titulo: g('mvid-f-titulo').value.trim().slice(0, 160),
    nota:   g('mvid-f-nota').value.trim().slice(0, 400),
    dura:   g('mvid-f-dura').value.trim().slice(0, 12),
    canal:  g('mvid-f-canal').value.trim().slice(0, 80),
    ini, fin,
  };

  let error;
  if (_mvidEditando) {
    ({ error } = await _sb.from(MVID_TABLE).update(fila).eq('id', _mvidEditando.id));
  } else {
    /* El `vid` NACE AQUÍ y no en la base, por lo mismo que en la repisa
       de enlaces: el guardado se reintenta y sin un identificador
       propio el segundo intento dejaría un gemelo. Y es la llave con la
       que esta fila pisa a la del catálogo del repositorio. */
    fila.vid = 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    fila.orden = mvidDeLaMision().length + 1;
    fila.estado = 'borrador';   // sin publicar hasta que se haya visto
    ({ error } = await _sb.from(MVID_TABLE).insert(fila));
  }

  if (error) { aviso.textContent = 'No se pudo guardar: ' + error.message; return; }
  mvidCerrarForm();
  await initMetasVideos();
}

/* ── Publicar / retirar / mover ──────────────────────────────────── */

async function mvidPublicar(v, estado) {
  /* Retirar NO borra la fila, y esto es lo que no se puede improvisar:
     si el video está también escrito en el catálogo del repositorio de
     M.E.T.A.S, borrar la fila aquí lo dejaría vivo allá y seguiría
     saliendo en la pantalla del alumno. Con 'oculto', la puerta pública
     devuelve una lápida y la misión lo quita. Es la misma razón por la
     que la repisa de enlaces borra con lápida. */
  const { error } = await _sb.from(MVID_TABLE).update({ estado }).eq('id', v.id);
  if (error) { alert('No se pudo cambiar: ' + error.message); return; }
  await initMetasVideos();
}

async function mvidMover(v, paso) {
  const lista = mvidDeLaMision();
  const i = lista.findIndex(x => x.id === v.id);
  const j = i + paso;
  if (i < 0 || j < 0 || j >= lista.length) return;
  const otro = lista[j];
  /* Se intercambian los dos órdenes. Reescribir la lista entera sería
     una escritura por video y, a media conexión, dejaría el orden a
     medias: dos filas es lo mínimo que puede quedar mal. */
  const a = await _sb.from(MVID_TABLE).update({ orden: otro.orden }).eq('id', v.id);
  const b = await _sb.from(MVID_TABLE).update({ orden: v.orden }).eq('id', otro.id);
  if (a.error || b.error) { alert('No se pudo mover.'); }
  await initMetasVideos();
}

/* ── 📋 Al catálogo del repositorio ──────────────────────────────
   La nube pone los videos en los aparatos HOY; el catálogo los deja
   escritos en el repositorio, con su historial y sin depender de que
   Supabase siga en pie. El ascenso de uno a otro es este botón, y sale
   por el chat porque el autor trabaja desde la tableta, sin el
   repositorio delante. Mismo reparto que el SQL, y por lo mismo. */
function mvidAlCatalogo() {
  const videos = mvidDeLaMision().filter(v => v.estado === 'publicado');
  if (!videos.length) { alert('No hay videos publicados en esta misión.'); return; }

  const j = v => JSON.stringify(v);
  const cuerpo = videos.map(v =>
    '    { id: ' + j(v.vid) + ', yt: ' + j(v.yt_id) + ',\n' +
    '      titulo: ' + j(v.titulo || '') + ',\n' +
    '      nota:   ' + j(v.nota || '') + ',\n' +
    '      dura: ' + j(v.dura || '') + ', canal: ' + j(v.canal || '') +
    ', ini: ' + (v.ini || 0) + ', fin: ' + (v.fin || 0) + ' }'
  ).join(',\n');

  const texto =
    '/* Pegar en js/data/videos-misiones.js del repositorio de M.E.T.A.S,\n' +
    '   reemplazando la lista de esta misión. */\n' +
    '  ' + j(_mvidMision) + ': [\n' + cuerpo + '\n  ],';

  mvidCopiar(texto);
}

function mvidCopiar(texto) {
  const fin = ok => alert(ok ? '📋 Copiado. Pégalo en el chat.' : 'No se pudo copiar.');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(() => fin(true), () => mvidCopiarViejo(texto, fin));
  } else { mvidCopiarViejo(texto, fin); }
}
/* El respaldo de siempre: en un WebView sin permiso de portapapeles,
   navigator.clipboard no existe o falla en silencio. */
function mvidCopiarViejo(texto, fin) {
  try {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    fin(ok);
  } catch (e) { fin(false); }
}

/* ── Enganches ───────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mvid-back-btn')?.addEventListener('click', () => switchView('view-inicio'));
  document.getElementById('mvid-nuevo-btn')?.addEventListener('click', () => mvidAbrirForm(null));
  document.getElementById('mvid-cat-btn')?.addEventListener('click', mvidAlCatalogo);
  document.getElementById('mvid-f-cerrar')?.addEventListener('click', mvidCerrarForm);
  document.getElementById('mvid-f-guardar')?.addEventListener('click', mvidGuardar);
  document.getElementById('mvid-ver-cerrar')?.addEventListener('click', mvidCerrarVer);

  document.getElementById('mvid-mision')?.addEventListener('change', e => {
    _mvidMision = e.target.value;
    mvidRender();
  });

  /* Pegar el enlace rellena lo que se puede deducir. Es lo que quita el
     paso donde esto se abandona: escribir a mano el identificador
     mirando la barra de direcciones de otra pestaña. */
  document.getElementById('mvid-f-enlace')?.addEventListener('input', e => {
    const { yt, ini } = mvidDeEnlace(e.target.value);
    const av = document.getElementById('mvid-f-aviso');
    if (!av) return;
    if (yt) {
      av.textContent = '✅ Video reconocido: ' + yt + (ini ? ' · empieza en ' + mvidReloj(ini) : '');
      const ci = document.getElementById('mvid-f-ini');
      if (ini && ci && !ci.value) ci.value = ini;
    } else {
      av.textContent = e.target.value.trim() ? '⚠️ Todavía no se reconoce un video de YouTube.' : '';
    }
  });
});

/* Lo de dentro se saca para la sonda: son las comprobaciones que hay
   que poder probar sin abrir un video de verdad. */
window.FaroMetasVideos = {
  version: 1,
  id: mvidId,
  deEnlace: mvidDeEnlace,
  segundos: mvidSegundos,
  embed: mvidEmbed,
};
