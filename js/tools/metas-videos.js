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
let _mvidMateria = '';      // '' = todas las materias
let _mvidBusca = '';        // lo escrito en el buscador

/* Las materias del catálogo de M.E.T.A.S, con su icono. NO es la lista
   de las que existen —eso lo dice el catálogo— sino cómo se pintan las
   que salgan. Una materia nueva sale igual, con su nombre tal cual y
   sin icono: es preferible una fila sin adorno a una misión escondida. */
const MVID_MATERIAS = {
  'matemáticas':  { ic: '🔢', n: 'Matemáticas' },
  'español':      { ic: '📝', n: 'Español' },
  'naturales':    { ic: '🌱', n: 'Ciencias Naturales' },
  'sociales':     { ic: '🌎', n: 'Ciencias Sociales' },
  'programación': { ic: '💻', n: 'Programación' },
  'robótica':     { ic: '🤖', n: 'Robótica' },
  'inglés':       { ic: '🌐', n: 'Inglés' },
  'repaso':       { ic: '🎯', n: 'Repaso General' },
};
function mvidMateria(k) {
  return MVID_MATERIAS[k] || { ic: '📚', n: k || 'Sin materia' };
}

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
      return {
        clave: p.length > 1 ? p[1] : '',
        titulo: String(m.title || ''),
        /* La materia y el grado vienen del catálogo por lo mismo que
           los títulos: hoy son 66 misiones en 8 materias y siguen
           entrando. Una lista escrita aquí estaría equivocada la semana
           que viene. */
        materia: String(m.subject || ''),
        icono: String(m.icon || ''),
        grado: String(m.grade || '')
      };
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
    mvidPintarChips();
    mvidPintarSelector();
    return;
  }

  _mvidHay = true;
  _mvidCache = data || [];
  if (!_mvidMision && _mvidCache.length) _mvidMision = _mvidCache[0].mision;
  /* Los chips y el desplegable se pintan DESPUÉS de tener los videos:
     los dos enseñan cuántos hay por misión, y con la lista vacía
     dirían que no hay ninguno en ningún sitio. */
  mvidPintarChips();
  mvidPintarSelector();
  mvidRender();
}

/* ── El selector de misión ───────────────────────────────────────── */

/* Cuántos videos tiene cada misión, sacado de lo que ya está cargado.
   Es lo que convierte una lista de 66 nombres en una lista donde se ve
   de un vistazo dónde falta trabajo. */
function mvidCuentaPorMision() {
  const n = {};
  _mvidCache.forEach(v => { n[v.mision] = (n[v.mision] || 0) + 1; });
  return n;
}

/* ── Los chips de materia ──
   Con 66 misiones y subiendo, un desplegable plano es varios metros de
   barrido en una tableta. Se filtra primero por materia —que es como el
   administrador piensa en ellas— y después se elige.

   Las materias salen del CATÁLOGO, no de una lista escrita aquí: es la
   misma regla que ya rige los títulos. El chip lleva su cuenta de
   misiones para que se vea el tamaño de cada una antes de tocarla. */
function mvidPintarChips() {
  const cont = document.getElementById('mvid-chips');
  if (!cont) return;
  cont.innerHTML = '';

  /* ── SI EL CATÁLOGO NO LLEGÓ, SE DICE ──
     Se trae por la red del sitio público de M.E.T.A.S, así que puede
     fallar: sin señal, con el sitio caído, o si el navegador corta la
     petición entre dominios. Antes, en ese caso, aquí no salía NADA y el
     desplegable se quedaba vacío sin explicar por qué: parecía que la
     herramienta estaba rota. Ahora lo dice y ofrece reintentar. */
  if (!_mvidMisiones.length) {
    const aviso = document.createElement('div');
    aviso.className = 'mvid-sincat';
    aviso.appendChild(Object.assign(document.createElement('span'),
      { textContent: '📴 No llegó la lista de misiones de M.E.T.A.S. ' +
                     'Puedes escribir la carpeta a mano abajo, o reintentar.' }));
    const rb = document.createElement('button');
    rb.type = 'button';
    rb.className = 'mvid-b';
    rb.textContent = '↻ Reintentar';
    rb.addEventListener('click', async () => {
      rb.disabled = true; rb.textContent = 'Trayendo…';
      await mvidCargarMisiones();
      mvidPintarChips(); mvidPintarSelector();
    });
    aviso.appendChild(rb);
    cont.appendChild(aviso);
    return;
  }

  const conVideo = mvidCuentaPorMision();
  const porMateria = {};
  let sinVideo = 0;
  _mvidMisiones.forEach(m => {
    if (!porMateria[m.materia]) porMateria[m.materia] = { n: 0, videos: 0 };
    porMateria[m.materia].n++;
    if (conVideo[m.clave]) porMateria[m.materia].videos++; else sinVideo++;
  });

  const chip = (clave, texto, activo, extra) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mvid-chip-f' + (activo ? ' mvid-chip-on' : '') + (extra ? ' ' + extra : '');
    b.textContent = texto;
    b.addEventListener('click', () => {
      _mvidMateria = clave;
      mvidPintarChips();
      mvidPintarSelector();
      mvidRender();
      /* El chip elegido se trae a la vista: en una fila que se desliza,
         tocar el último de la derecha y que se quede medio fuera hace
         dudar de si se tocó. */
      try { b.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {}
    });
    return b;
  };

  cont.appendChild(chip('', 'Todas · ' + _mvidMisiones.length, _mvidMateria === ''));

  /* ⚠️ «SIN VIDEO» VA EL SEGUNDO, y es el chip que de verdad se usa.
     El trabajo del administrador no es «ver las de matemáticas»: es
     saber CUÁLES LE FALTAN. Sin este filtro hay que abrir materia por
     materia contando puntos verdes, que con 66 misiones —y subiendo—
     es justo el paso donde se deja de poner videos. */
  if (sinVideo) {
    cont.appendChild(chip('__sinvideo', '⚠️ Sin video · ' + sinVideo,
      _mvidMateria === '__sinvideo', 'mvid-chip-falta'));
  }

  Object.keys(porMateria).sort((a, b) => porMateria[b].n - porMateria[a].n).forEach(k => {
    const m = mvidMateria(k);
    /* El punto verde dice cuántas de esa materia YA tienen video. Sin
       él hay que abrir materia por materia para saber por dónde se va. */
    const marca = porMateria[k].videos ? '  ●' + porMateria[k].videos : '';
    cont.appendChild(chip(k, m.ic + ' ' + m.n + ' · ' + porMateria[k].n + marca, _mvidMateria === k));
  });
}

/* Los grados se escriben con cifra en el catálogo («6º grado») y se
   dicen con letra («sexto»). Quien busca teclea lo que dice.

   Esto salió de la sonda: la comprobación afirmaba que buscar «sexto»
   encontraba 6º y no era verdad —la afirmación estaba mal, y el
   arreglo honesto era que fuera verdad, no bajar la comprobación—. En
   una herramienta en español, obligar a escribir «6º» (con el símbolo
   de ordinal, que en un teclado de tableta está escondido) es cerrarle
   el buscador a quien lo va a usar.

   Va en los dos sentidos: quien escriba «6» encuentra sexto, y quien
   escriba «sexto» encuentra 6º. */
const MVID_ORDINALES = {
  primero: '1', primer: '1', segundo: '2', tercero: '3', tercer: '3',
  cuarto: '4', quinto: '5', sexto: '6', septimo: '7', 'séptimo': '7',
  octavo: '8', noveno: '9'
};

/* Sin tildes y en minúsculas, para que «séptimo» y «septimo» busquen
   igual: en una tableta la tilde se escapa la mitad de las veces. */
function mvidSinTildes(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/* Las misiones que pasan el filtro de materia y el buscador. El
   buscador mira título, carpeta, materia Y grado: quien busca «sexto»
   o «fracciones» tiene que encontrarla sin saber en qué materia cayó.
   Es la misma regla del buscador del mapa de rutas de F.A.R.O. */
function mvidMisionesFiltradas() {
  const q = mvidSinTildes(_mvidBusca.trim());
  /* «sexto» busca también por «6». Se añade como término alternativo en
     vez de reemplazar: así «sexto grado» sigue encontrando lo que trae
     la palabra «grado» escrita. */
  const alt = MVID_ORDINALES[q] || '';
  const conVideo = mvidCuentaPorMision();
  return _mvidMisiones.filter(m => {
    /* `__sinvideo` no es una materia: es «las que me faltan». Va por el
       mismo camino que las materias porque para quien la usa es un
       filtro más, y meterle un control aparte sería una casilla más que
       aprender. */
    if (_mvidMateria === '__sinvideo') { if (conVideo[m.clave]) return false; }
    else if (_mvidMateria && m.materia !== _mvidMateria) return false;
    if (!q) return true;
    const heno = mvidSinTildes(m.titulo + ' ' + m.clave + ' ' + m.materia + ' ' + m.grado);
    return heno.includes(q) || (alt && heno.includes(alt));
  });
}

function mvidPintarSelector() {
  const sel = document.getElementById('mvid-mision');
  if (!sel) return;
  sel.innerHTML = '';

  const vacio = document.createElement('option');
  vacio.value = '';
  const lista = mvidMisionesFiltradas();
  vacio.textContent = !_mvidMisiones.length
    ? '— Sin catálogo: escribe la carpeta abajo —'
    : (lista.length ? '— Elige la misión (' + lista.length + ') —' : '— Ninguna con ese nombre —');
  sel.appendChild(vacio);

  /* Agrupadas por materia con <optgroup>: el desplegable nativo del
     teléfono las enseña con su encabezado y ya no es una lista plana de
     sesenta y seis. */
  const conVideo = mvidCuentaPorMision();
  const grupos = {};
  lista.forEach(m => { (grupos[m.materia] = grupos[m.materia] || []).push(m); });

  Object.keys(grupos).sort().forEach(k => {
    const mat = mvidMateria(k);
    const g = document.createElement('optgroup');
    g.label = mat.ic + ' ' + mat.n;
    grupos[k]
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
      .forEach(m => {
        const o = document.createElement('option');
        o.value = m.clave;
        const n = conVideo[m.clave] || 0;
        /* textContent, no innerHTML: el título sale de un archivo
           traído por la red. */
        o.textContent = (n ? '● ' : '○ ') + m.titulo + (n ? '  ·  ' + n + ' video' + (n === 1 ? '' : 's') : '');
        g.appendChild(o);
      });
    sel.appendChild(g);
  });

  /* La misión elegida puede haberse quedado fuera del filtro. Se le
     añade su propia opción en vez de perderla en silencio: si no, el
     desplegable diría una cosa y la lista de abajo enseñaría otra. */
  if (_mvidMision && !lista.some(m => m.clave === _mvidMision)) {
    const suelta = document.createElement('option');
    suelta.value = _mvidMision;
    const yo = _mvidMisiones.find(m => m.clave === _mvidMision);
    suelta.textContent = (yo ? yo.titulo : _mvidMision) + '  (fuera del filtro)';
    sel.appendChild(suelta);
  }
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
  /* Cuántas preguntas trae, a la vista en la lista. Sin esto hay que
     abrir el formulario de cada video para saber cuáles ya tienen quiz
     y cuáles no, que es justo el paso donde se deja de poner. */
  const nPreg = Array.isArray(v.preguntas) ? v.preguntas.length : 0;
  meta.appendChild(mvidChip(nPreg ? '🧠 ' + nPreg + ' pregunta' + (nPreg === 1 ? '' : 's') : '🧠 sin quiz'));
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

/* ── EL QUIZ DEL PROPIO VIDEO ─────────────────────────────────────
   Al terminar un video, la primera versión mandaba al alumno al Quiz de
   la misión. Eso es un salto raro: el Quiz pregunta por el tema entero
   y no por lo que acaba de ver, y además se lo lleva de la sección sin
   comprobar nada.

   Estas preguntas son SOBRE ESE VIDEO y las escribe quien lo eligió,
   que es el único que sabe qué dice. Son opcionales: un video sin
   preguntas sigue funcionando, y la tapa del final ofrece lo de siempre.

   TRES REGLAS:
   1. `ok` es el ÍNDICE de la correcta, nunca su texto. Si fuera el
      texto, corregirle una tilde a la opción dejaría la pregunta sin
      respuesta buena y nadie se enteraría hasta que un niño la fallara.
   2. Una pregunta a medias NO se guarda. Sin texto, o con menos de dos
      opciones, es una pregunta que el alumno no puede contestar; se
      descarta al guardar y la pantalla lo dice.
   3. El tope son DIEZ. Era tres —«al acabar un video de cinco minutos,
      tres preguntas se contestan; ocho se abandonan»— y el autor lo
      subió el 28 de agosto de 2026: un video largo, o el que repasa un
      tema entero, pide más, y quien lo eligió es quien sabe cuántas
      aguanta. El consejo de poner pocas al final de un video corto
      sigue siendo bueno; lo que cambia es que ahora se aconseja en la
      pantalla en vez de imponerse.

      ⚠️ Este número vive en TRES sitios y los tres tienen que decir lo
      mismo: aquí, el `check` de la base (`metas_videos.sql`) y el tope
      de la pantalla del alumno (`vmPreguntas`, en M.E.T.A.S). Si uno se
      queda corto, las preguntas de más no dan un error: se pierden por
      el camino, y el administrador se entera —si se entera— mirando la
      pantalla de un niño. */
const MVID_MAX_PREG = 10;
/* CUATRO opciones, no tres, y no es un capricho: el A) B) C) D) es la
   forma en que viene escrita cualquier prueba de selección múltiple, así
   que es lo que se va a pegar aquí. Con tres, pegar un bloque de cuatro
   perdía la D —y una de cada cuatro veces la D es la correcta—. La
   pantalla del alumno ya pintaba hasta cuatro (`vmPreguntas`, en
   M.E.T.A.S), o sea que el tope corto estaba solo aquí. */
const MVID_MAX_OPS = 4;

function mvidCrecer(t) {
  t.style.height = 'auto';
  t.style.height = (t.scrollHeight + 2) + 'px';
}

function mvidPintarPreguntas(preguntas) {
  const caja = document.getElementById('mvid-f-preguntas');
  if (!caja) return;
  caja.innerHTML = '';

  const lista = Array.isArray(preguntas) ? preguntas.slice(0, MVID_MAX_PREG) : [];
  if (!lista.length) lista.push({ p: '', ops: [], ok: 0 });

  lista.forEach((q, i) => {
    const bloque = document.createElement('div');
    bloque.className = 'mvid-preg';

    const cab = document.createElement('div');
    cab.className = 'mvid-preg-cab';
    cab.appendChild(Object.assign(document.createElement('span'),
      { className: 'mvid-preg-n', textContent: 'Pregunta ' + (i + 1) }));
    if (lista.length > 1) {
      const quita = document.createElement('button');
      quita.type = 'button';
      quita.className = 'mvid-b mvid-b-min';
      quita.textContent = '✕';
      quita.setAttribute('aria-label', 'Quitar la pregunta ' + (i + 1));
      quita.addEventListener('click', () => {
        const ahora = mvidLeerPreguntas(true);
        ahora.splice(i, 1);
        mvidPintarPreguntas(ahora);
      });
      cab.appendChild(quita);
    }
    bloque.appendChild(cab);

    /* Recuadros que CRECEN, no campos de una línea. Escribiendo a mano
       una pregunta cabe; pegada de un examen no («¿Cuál es la fórmula
       para hallar el volumen de un ortoedro (prisma rectangular)?»), y
       lo siguiente que hay que hacer es leer las cuatro opciones para
       marcar la buena. Dos opciones cortadas a los treinta caracteres
       —«La cantidad de cubos que tiene una…» y «La cantidad de espacio
       que ocupa u…»— se distinguen mal, y ahí es donde se marca la que
       no era. */
    const texto = document.createElement('textarea');
    texto.rows = 1;
    texto.className = 'mvid-in mvid-preg-txt';
    texto.maxLength = 200;
    texto.placeholder = '¿Qué explicó el video?';
    texto.value = String(q.p || '');
    bloque.appendChild(texto);

    /* `ok` negativo = «no se sabe cuál es la correcta». Solo llega así de
       pegar un bloque que no lo decía: escribiendo a mano, la primera
       viene marcada. NO se rellena con la A —acertaría una de cada
       cuatro veces—: se deja sin marcar, en ámbar, y el guardado se para
       hasta que alguien la toque. */
    const ok = Number(q.ok);
    const falta = !(isFinite(ok) && ok >= 0);
    if (falta) {
      bloque.classList.add('mvid-preg-falta');
      cab.insertBefore(Object.assign(document.createElement('span'),
        { className: 'mvid-preg-marca', textContent: '⚠️ marca la correcta' }),
        cab.firstChild.nextSibling);
    }

    /* El radio dice cuál es la correcta, y va PEGADO a su opción. Un
       desplegable aparte de «cuál es la buena» se rellena mirando arriba
       y abajo, y ahí es donde se marca la que no era. */
    const ops = Array.isArray(q.ops) ? q.ops : [];
    for (let j = 0; j < MVID_MAX_OPS; j++) {
      const fila = document.createElement('label');
      fila.className = 'mvid-preg-op';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'mvid-ok-' + i;
      radio.value = String(j);
      radio.checked = !falta && ok === j;
      /* Al tocarla se apaga el ámbar en el sitio. Repintar el bloque
         entero movería el dedo de sitio a media revisión. */
      radio.addEventListener('change', () => {
        bloque.classList.remove('mvid-preg-falta');
        bloque.querySelector('.mvid-preg-marca')?.remove();
      });
      fila.appendChild(radio);

      const campo = document.createElement('textarea');
      campo.rows = 1;
      campo.className = 'mvid-in mvid-preg-opt';
      campo.maxLength = 120;
      campo.placeholder = j === 0 ? 'La respuesta correcta' : 'Otra opción';
      campo.value = String(ops[j] || '');
      fila.appendChild(campo);

      bloque.appendChild(fila);
    }
    caja.appendChild(bloque);
  });

  /* El alto se ajusta CON LOS RECUADROS YA PUESTOS en la página: fuera
     de ella `scrollHeight` es cero y saldrían todos aplastados. Por eso
     el formulario se enseña antes de pintar las preguntas. */
  caja.querySelectorAll('textarea').forEach(t => {
    mvidCrecer(t);
    t.addEventListener('input', () => mvidCrecer(t));
  });

  /* Con diez posibles el formulario es largo, así que el pie dice por
     cuántas va: si no, hay que subir contando recuadros. */
  const pie = document.getElementById('mvid-f-preg-mas');
  if (pie) {
    pie.style.display = lista.length >= MVID_MAX_PREG ? 'none' : '';
    pie.textContent = '➕ Otra pregunta (' + lista.length + ' de ' + MVID_MAX_PREG + ')';
  }
}

/* Lee lo escrito. Con `crudo` devuelve TODO tal cual (lo usa el botón
   de quitar, que tiene que conservar lo que hay a medio escribir);
   sin él, solo las preguntas que de verdad se pueden contestar. */
function mvidLeerPreguntas(crudo) {
  const caja = document.getElementById('mvid-f-preguntas');
  if (!caja) return [];
  const salida = [];
  caja.querySelectorAll('.mvid-preg').forEach(bloque => {
    /* Los saltos de línea se aplastan: el recuadro crece solo, pero un
       Enter de más dentro de una opción viajaría hasta la pantalla del
       alumno. */
    const uno = t => String(t).replace(/\s+/g, ' ').trim();
    const p = uno(bloque.querySelector('.mvid-preg-txt').value).slice(0, 200);
    const ops = [...bloque.querySelectorAll('.mvid-preg-opt')].map(i => uno(i.value).slice(0, 120));
    /* Sin marcar es -1, NUNCA 0. Devolver cero aquí sería decir que la
       correcta es la A en una pregunta que nadie ha revisado. */
    const marcado = bloque.querySelector('input[type=radio]:checked');
    const ok = marcado ? Number(marcado.value) : -1;
    if (crudo) { salida.push({ p, ops, ok }); return; }

    /* Solo lo que un alumno puede contestar. Se quitan las opciones
       vacías del final, pero el índice de la correcta se recalcula
       ANTES de recortarlas: si no, quitar una opción de en medio
       movería la respuesta buena a otra fila sin avisar. */
    const buena = ok >= 0 ? ops[ok] : '';
    const limpias = ops.filter(o => o !== '');
    if (!p || limpias.length < 2) return;
    const okLimpio = limpias.indexOf(buena);
    if (okLimpio < 0) return;          // la marcada estaba vacía
    salida.push({ p, ops: limpias, ok: okLimpio });
  });
  return salida.slice(0, MVID_MAX_PREG);
}

/* ── 📋 PEGAR LAS PREGUNTAS DE GOLPE ──────────────────────────────
   Escribir tres preguntas con sus cuatro opciones son quince campos
   tocados de uno en uno, en una tableta y con el teclado tapando media
   pantalla. Y el texto casi nunca se inventa aquí: ya viene escrito en
   otro sitio, con la forma de siempre —«1.» la pregunta, «A) B) C) D)»
   las opciones—. Copiarlo campo por campo es justo el paso donde el
   trabajo se abandona, que es la misma razón por la que pegar el enlace
   de YouTube rellena solo lo que se puede deducir de él.

   Se lee el texto TAL COMO VENGA, sin pedirle a nadie que lo reescriba
   para que le guste a esta pantalla:

   - la pregunta, numerada o no («1.», «1)», «Pregunta 2:», o suelta);
   - las opciones con letra («A)», «B.», «(C)», «d -») o con viñeta;
   - las rayas de separación («---»), que se saltan;
   - y cuál es la correcta, si viene dicha de cualquiera de las formas
     en que se dice: ✅ ✔, negrita, un asterisco pegado, «(correcta)»,
     «[x]», una línea «Respuesta: C» o una lista al final
     «Respuestas: 1-C, 2-A».

   ⚠️ Y SI NO VIENE DICHA, LA PREGUNTA QUEDA SIN MARCAR. No se da por
   buena la A: la A acierta una de cada cuatro veces, y un quiz
   publicado con la respuesta equivocada no lo descubre nadie hasta que
   un niño acierta y la pantalla le dice que falló. Sin marcar, la
   pregunta se ve en ámbar y el guardado se para. */

/* Las marcas de «esta es la correcta», que se quitan del texto de la
   opción. Van por alternativas y no por clase de caracteres porque los
   emojis son pares de códigos: dentro de unos corchetes se partirían en
   dos mitades que no significan nada. */
function mvidQuitarMarca(txt) {
  let t = String(txt == null ? '' : txt);
  let marcada = false;
  const cae = re => { if (re.test(t)) { marcada = true; t = t.replace(re, ' '); } };
  cae(/(?:✅|✔️|✔|✓|☑️|☑|🟢|👈|👉|⭐)/g);
  cae(/\(\s*(?:respuesta\s+)?correct[ao]s?\s*\)/gi);
  cae(/\[\s*[xX✓]\s*\]/g);
  cae(/(?:←|<--|<-)\s*(?:correct[ao]|respuesta)?\s*$/i);
  cae(/^\*(?=\S)/);          // «*La cantidad…»: pegado es marca…
  cae(/\s*\*\s*$/);          // …y detrás también. Con espacio es viñeta.
  return { txt: t.replace(/\s{2,}/g, ' ').trim(), marcada };
}

/* ¿Esta línea es una opción? Devuelve su texto limpio, su letra (que es
   la que empareja con la lista de respuestas del final) y si venía
   marcada como la buena. */
function mvidOpcionDe(linea) {
  let t = String(linea);
  let negrita = false;
  if (t.indexOf('**') >= 0) { negrita = true; t = t.replace(/\*\*/g, ''); }

  /* La viñeta lleva espacio detrás; el asterisco pegado al texto no es
     viñeta sino marca de correcta, y lo recoge mvidQuitarMarca. */
  const pelada = t.replace(/^\s*(?:[-–—•·▪◦+]|\*)\s+/, '');
  const hayVineta = pelada !== t;
  t = pelada.trim();

  const m = t.match(/^\(?\s*([a-zA-Z])\s*[).:\-–]\s*(.+)$/);
  let letra = '', texto = '';
  if (m) { letra = m[1].toUpperCase(); texto = m[2]; }
  else if (hayVineta) { texto = t; }
  else return null;

  const lim = mvidQuitarMarca(texto);
  if (!lim.txt) return null;
  return { t: lim.txt.slice(0, 120), letra, marcada: lim.marcada || negrita };
}

/* La lista de respuestas del final: «Respuestas: 1-C, 2-A» o una por
   línea debajo. Vale para toda la tanda, así que se guarda aparte y se
   reparte cuando ya están todas las preguntas leídas. */
function mvidLeerClave(txt, clave) {
  let hubo = false;
  String(txt).replace(/(\d{1,2})\s*[).:\-–=]?\s*([a-zA-Z])(?![a-zA-Z])/g, (todo, n, letra) => {
    clave[Number(n)] = letra.toUpperCase(); hubo = true; return '';
  });
  return hubo;
}

/* La letra de una respuesta, llevada a la posición de su opción. Se
   busca por la LETRA que traía cada opción y no por contar: si el texto
   pegado se saltó la B, la «C» de la clave sigue siendo la tercera de
   ellos y la segunda de la lista. */
function mvidPorLetra(letra, ops) {
  const i = ops.findIndex(o => o.letra === letra);
  if (i >= 0) return i;
  const pos = letra.charCodeAt(0) - 65;
  return (pos >= 0 && pos < ops.length) ? pos : -1;
}

/* «Respuesta: C», «Respuesta correcta: C) La cantidad…» o directamente
   el texto de la buena. */
function mvidDondeCae(resp, ops) {
  const t = mvidQuitarMarca(resp).txt;
  let letra = '', texto = t;
  const sola = t.match(/^\(?\s*([a-zA-Z])\s*\)?\.?$/);
  const conTexto = t.match(/^\(?\s*([a-zA-Z])\s*[).:\-–]\s+(.+)$/);
  if (sola) { letra = sola[1]; texto = ''; }
  else if (conTexto) { letra = conTexto[1]; texto = conTexto[2]; }
  if (letra) {
    const i = mvidPorLetra(letra.toUpperCase(), ops);
    if (i >= 0) return i;
  }
  if (texto) {
    const n = s => String(s).toLowerCase().replace(/[.,;:!¡¿?"'’]/g, '').replace(/\s+/g, ' ').trim();
    const i = ops.findIndex(o => n(o.t) === n(texto));
    if (i >= 0) return i;
  }
  return -1;
}

/* El lector. Devuelve las preguntas listas para pintar y lo que haya
   que contarle al que pegó: nada se recorta ni se descarta en silencio. */
function mvidParsearPreguntas(texto) {
  const avisos = [];
  const brutas = [];
  const clave = {};
  let actual = null, enClave = false;

  String(texto == null ? '' : texto).replace(/\r/g, '').split('\n').forEach(cruda => {
    const l = cruda.trim();
    if (!l) return;
    if (/^[-=_~#*]{3,}$/.test(l)) return;                       // ---, ***, ═══
    if (/^(?:explicaci[óo]n|justificaci[óo]n|pista|nota|feedback)\b.{0,30}[:\-–]/i.test(l)) return;

    const mc = l.match(/^(?:respuestas|clave|soluciones|answers)\b\s*[:\-–]?\s*(.*)$/i);
    if (mc) { enClave = true; mvidLeerClave(mc[1], clave); return; }
    if (enClave) {
      if (mvidLeerClave(l, clave)) return;
      enClave = false;                       // se acabó la clave: esto es otra cosa
    }

    const mr = l.match(/^(?:respuesta|correcta|correcto|soluci[óo]n)\b[^:\-–]{0,24}[:\-–]\s*(.+)$/i);
    if (mr && actual) { actual.resp = mr[1]; return; }

    const op = mvidOpcionDe(l);
    if (op) { if (actual) actual.ops.push(op); return; }

    /* Todo lo demás abre una pregunta. El número, si lo trae, se guarda:
       es con el que empareja la lista de respuestas del final. */
    let t = l.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim();
    let num = 0;
    const mn = t.match(/^(?:pregunta|preg\.?)?\s*(\d{1,2})\s*[).:\-–]?\s+(.+)$/i);
    if (mn) { num = Number(mn[1]); t = mn[2]; }
    else t = t.replace(/^(?:pregunta|preg\.?)\s*[:.)\-–]?\s*/i, '');
    t = mvidQuitarMarca(t).txt;
    if (!t) return;
    actual = { p: t.slice(0, 200), num: num || (brutas.length + 1), ops: [], resp: '' };
    brutas.push(actual);
  });

  let preguntas = [], recortadas = 0;
  brutas.forEach(q => {
    const ops = q.ops.filter(o => o.t);
    if (!q.p || ops.length < 2) return;

    /* Cuál es la correcta, de lo más específico a lo más general. Y si
       vienen marcadas TODAS, no viene marcada ninguna: una lista con
       viñetas de asterisco las marca todas sin querer, y dar por buena
       la primera sería inventarse la respuesta. */
    let ok = -1;
    const marcadas = ops.filter(o => o.marcada);
    if (marcadas.length === 1) ok = ops.indexOf(marcadas[0]);
    if (ok < 0 && q.resp) ok = mvidDondeCae(q.resp, ops);
    if (ok < 0 && clave[q.num]) ok = mvidPorLetra(clave[q.num], ops);

    let lista = ops.map(o => o.t);
    if (lista.length > MVID_MAX_OPS) {
      /* Se quedan las primeras, PERO la correcta no se cae por el
         borde: una pregunta cuya respuesta buena no está entre las
         opciones no la puede acertar nadie. */
      const buena = ok >= 0 ? lista[ok] : '';
      lista = lista.slice(0, MVID_MAX_OPS);
      if (buena && lista.indexOf(buena) < 0) lista[MVID_MAX_OPS - 1] = buena;
      ok = buena ? lista.indexOf(buena) : -1;
      recortadas++;
    }
    preguntas.push({ p: q.p, ops: lista, ok });
  });

  const descartadas = brutas.length - preguntas.length;
  if (descartadas > 0) {
    avisos.push('Se saltaron ' + descartadas + (descartadas === 1 ? ' línea que no llegaba' : ' líneas que no llegaban') +
                ' a pregunta: hacen falta el enunciado y al menos dos opciones.');
  }
  if (recortadas > 0) {
    avisos.push(recortadas === 1 ? 'Una pregunta traía más de ' + MVID_MAX_OPS + ' opciones: se quedan ' + MVID_MAX_OPS + ', con la correcta dentro.'
                                 : recortadas + ' preguntas traían más de ' + MVID_MAX_OPS + ' opciones: se quedan ' + MVID_MAX_OPS + ', con la correcta dentro.');
  }
  if (preguntas.length > MVID_MAX_PREG) {
    avisos.push('Venían ' + preguntas.length + ' preguntas: se quedan las ' + MVID_MAX_PREG +
                ' primeras, que es el tope por video.');
    preguntas = preguntas.slice(0, MVID_MAX_PREG);
  }

  return { preguntas, avisos, sinMarcar: preguntas.filter(q => q.ok < 0).length };
}

/* ── El recuadro de pegar ────────────────────────────────────────── */

function mvidPegarAbrir(abrir) {
  const caja = document.getElementById('mvid-f-pegar-caja');
  if (!caja) return;
  caja.style.display = abrir ? '' : 'none';
  if (abrir) document.getElementById('mvid-f-pegar-txt')?.focus();
}

function mvidPegarLeer() {
  const ta = document.getElementById('mvid-f-pegar-txt');
  const avCaja = document.getElementById('mvid-f-pegar-aviso');
  const avPreg = document.getElementById('mvid-f-preg-aviso');
  if (!ta || !avCaja || !avPreg) return;

  const r = mvidParsearPreguntas(ta.value);
  if (!r.preguntas.length) {
    /* El recuadro se queda abierto: lo que hay que arreglar está ahí. */
    avCaja.textContent = '⚠️ No se reconoció ninguna pregunta. Cada pregunta va en su línea y debajo sus opciones, empezando por «A)» «B)» «C)».';
    return;
  }

  /* Se AÑADEN a lo que ya hubiera escrito: quien pega la segunda tanda
     no espera que le borre la primera. Los huecos vacíos sí se van. */
  const antes = mvidLeerPreguntas(true).filter(q => q.p || q.ops.some(o => o));
  const juntas = antes.concat(r.preguntas);
  const avisos = r.avisos.slice();
  if (juntas.length > MVID_MAX_PREG) {
    avisos.push('Con las que ya había son ' + juntas.length + ': se quedan las ' + MVID_MAX_PREG + ' primeras.');
  }
  mvidPintarPreguntas(juntas.slice(0, MVID_MAX_PREG));

  const n = r.preguntas.length;
  const pl = n === 1 ? 'pregunta' : 'preguntas';
  const faltan = mvidLeerPreguntas(true).filter(q => !(q.ok >= 0)).length;
  const msg = faltan
    ? '⚠️ Se leyeron ' + n + ' ' + pl + ', pero ' +
      (faltan === 1 ? 'una se quedó' : faltan + ' se quedaron') +
      ' sin la correcta: tócala en las que salen en ámbar. Aquí no se da por buena la A.'
    : '✅ Se ' + (n === 1 ? 'leyó' : 'leyeron') + ' ' + n + ' ' + pl + ', con su respuesta marcada. Repásalas antes de guardar.';
  avPreg.textContent = msg + (avisos.length ? ' ' + avisos.join(' ') : '');
  avCaja.textContent = '';
  ta.value = '';
  mvidPegarAbrir(false);
}

/* Un toque menos: en una tableta, entrar al recuadro y mantener tocado
   para «Pegar» son tres gestos finos. Si el navegador no deja leer el
   portapapeles, el botón ni aparece y se pega a mano de siempre. */
async function mvidPegarDelPortapapeles() {
  const ta = document.getElementById('mvid-f-pegar-txt');
  const av = document.getElementById('mvid-f-pegar-aviso');
  if (!ta || !av) return;
  try {
    const t = await navigator.clipboard.readText();
    if (!t || !t.trim()) { av.textContent = 'El portapapeles está vacío: copia primero las preguntas.'; return; }
    ta.value = t;
    av.textContent = '';
    mvidPegarLeer();
  } catch (e) {
    av.textContent = 'El navegador no dejó leer el portapapeles: mantén tocado el recuadro y dale a «Pegar».';
  }
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
  /* El recuadro de pegar arranca limpio en cada video: un resumen del
     video anterior («se leyeron 3 preguntas») leído sobre este sería
     una mentira con toda la pinta de verdad. */
  const pegaTxt = g('mvid-f-pegar-txt');
  if (pegaTxt) pegaTxt.value = '';
  const pegaAv = g('mvid-f-pegar-aviso');
  if (pegaAv) pegaAv.textContent = '';
  const pregAv = g('mvid-f-preg-aviso');
  if (pregAv) pregAv.textContent = '';
  mvidPegarAbrir(false);
  /* El formulario se enseña ANTES de pintar las preguntas: los recuadros
     que crecen no saben cuánto miden mientras están escondidos. */
  g('mvid-form-overlay').style.display = 'flex';
  mvidPintarPreguntas(v ? v.preguntas : []);
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
    preguntas: mvidLeerPreguntas(),
  };

  /* Si se escribió algo pero no llegó a ser una pregunta contestable,
     se dice. Guardar en silencio lo que se acaba de tirar es la forma
     más rápida de que alguien crea que puso un quiz y no lo puso. */
  const crudas = mvidLeerPreguntas(true).filter(q => q.p || q.ops.some(o => o));

  /* Y una pregunta entera a la que solo le falta MARCAR la correcta no
     se descarta: se para el guardado y se dice cuál es. Es lo que puede
     llegar de pegar un bloque que no decía la respuesta, y descartarla
     con las demás dejaría al administrador creyendo que puso un quiz de
     tres preguntas y publicando uno de una. */
  const sinMarcar = crudas.findIndex(q => q.p && q.ops.filter(o => o).length >= 2 && !(q.ok >= 0));
  if (sinMarcar >= 0) {
    const falta = '⚠️ Falta marcar cuál es la respuesta correcta en la pregunta ' +
                  (sinMarcar + 1) + '. Tócala y vuelve a guardar.';
    aviso.textContent = falta;
    const pregAv = g('mvid-f-preg-aviso');
    if (pregAv) pregAv.textContent = falta;
    return;
  }

  if (crudas.length > fila.preguntas.length) {
    aviso.textContent = 'Una pregunta necesita su texto y al menos dos opciones, con la correcta marcada. Las incompletas no se guardan.';
    return;
  }

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

  if (error) {
    /* El tope de preguntas subió a diez el 28 de agosto de 2026, y el de
       la base solo sube pegando el SQL a mano. Mientras no se pegue, la
       sexta pregunta rebota con un mensaje de PostgreSQL que habla de un
       `check` y no dice qué hacer. Aquí se traduce: el que está delante
       de la pantalla está en una tableta, sin el repositorio. */
    const viejo = /metas_videos_preguntas_lista|check constraint/i.test(error.message || '');
    aviso.textContent = viejo
      ? 'La base todavía tiene el tope viejo de preguntas por video. Hay que volver a correr ' +
        'supabase/sql/metas_videos.sql en el editor SQL de Supabase (se puede correr dos veces ' +
        'sin dañar nada); mientras tanto, deja el video con menos preguntas y no se pierde lo escrito.'
      : 'No se pudo guardar: ' + error.message;
    return;
  }
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
    ', ini: ' + (v.ini || 0) + ', fin: ' + (v.fin || 0) +
    ((v.preguntas && v.preguntas.length)
      ? ',\n      preguntas: ' + j(v.preguntas) : '') + ' }'
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
  document.getElementById('mvid-f-preg-pegar')?.addEventListener('click', () => mvidPegarAbrir(true));
  document.getElementById('mvid-f-pegar-cerrar')?.addEventListener('click', () => mvidPegarAbrir(false));
  document.getElementById('mvid-f-pegar-leer')?.addEventListener('click', mvidPegarLeer);
  const btnPortapapeles = document.getElementById('mvid-f-pegar-portapapeles');
  if (btnPortapapeles && navigator.clipboard && navigator.clipboard.readText) {
    btnPortapapeles.style.display = '';
    btnPortapapeles.addEventListener('click', mvidPegarDelPortapapeles);
  }
  document.getElementById('mvid-f-preg-mas')?.addEventListener('click', () => {
    const ahora = mvidLeerPreguntas(true);
    ahora.push({ p: '', ops: [], ok: 0 });
    mvidPintarPreguntas(ahora);
  });
  document.getElementById('mvid-ver-cerrar')?.addEventListener('click', mvidCerrarVer);

  document.getElementById('mvid-mision')?.addEventListener('change', e => {
    _mvidMision = e.target.value;
    mvidRender();
  });

  /* El buscador NO repinta los chips: sus cuentas son de la materia
     entera y cambiarlas al teclear haría bailar los números debajo del
     dedo. Solo se estrecha el desplegable. */
  document.getElementById('mvid-buscar')?.addEventListener('input', e => {
    _mvidBusca = e.target.value;
    mvidPintarSelector();
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
  parsear: mvidParsearPreguntas,
};
