'use strict';
/* ══════════════════════════════════════════════════════════════════
   LA REPISA DE ENLACES · aparato compartido de las misiones
   ══════════════════════════════════════════════════════════════════

   Pedido por el autor el 27 de agosto de 2026 sobre la etapa 1 de la
   Ruta del Hilo que Tira, como piloto y con la intención dicha en voz
   alta de llevarlo después a las demás misiones. Por eso vive aquí y
   no en `misiones/…/js/cadena-hueco.js`: es la QUINTA excepción de la
   casa a la norma 1 (tres archivos propios por misión), por el mismo
   motivo que `js/lecturas.js`, el marcador, `fichas/css/ficha.css` y el
   taller de la memoria. Un aparato copiado a cuarenta misiones se
   arregla en una y se queda roto en treinta y nueve.

   ── QUÉ RESUELVE ──
   El autor le da una misión a NotebookLM y la máquina le devuelve
   material de repaso: un resumen en audio, un video, un mapa mental,
   una guía de estudio, una línea de tiempo. Ese material vivía en el
   teléfono de quien lo generó, o sea que no existía para nadie más.
   Aquí tiene sitio: la sección de Recursos de la misión a la que
   pertenece, que es el único lugar donde alguien lo va a buscar.

   ── LAS TRES REGLAS DE LA REPISA ──
   1. TODA TARJETA DICE DE DÓNDE SALE, ANTES DE TOCARLA. El dominio va
      escrito en el pie y el origen también. Un enlace que no enseña su
      destino es exactamente lo que la Ruta de la Máquina enseña a
      desconfiar, y sería raro que la casa lo hiciera en su propia
      pantalla.
   2. LO QUE HIZO UNA MÁQUINA LO DICE. Es la regla de oro del Estudio
      Mayor aplicada a la repisa: ninguna fuente entra sin su etiqueta.
      Un resumen en audio hecho con NotebookLM es material de REPASO de
      lo que ya está en la misión, no una fuente: puede inventarse un
      dato y suena igual de seguro cuando lo hace. Eso va escrito en el
      recuadro de arriba, siempre, y no se puede apagar desde la misión.
   3. NINGÚN DATO SE INTERPOLA DENTRO DE UN ATRIBUTO. Aquí se va más
      lejos que en las Sugerencias de M.E.T.A.S: no se arma HTML con
      datos, punto. Todo se pinta con createElement y textContent, y la
      dirección se comprueba con `reEnlace` antes de ponerla con
      setAttribute. Es cierto que lo que hay en la repisa lo escribe la
      propia casa, pero un `javascript:` pegado desde un mensaje que
      alguien reenvió correría DENTRO de la misión, y la misión vive en
      el mismo dominio que la Bóveda.

   ── CÓMO SE MONTA EN UNA MISIÓN NUEVA ──
   Tres cosas, y ninguna toca este archivo:

     a. En el HTML, después del CSS de la misión:
          <link rel="stylesheet" href="../../css/recursos-enlaces.css">
        y al final, DESPUÉS del JS de la misión:
          <script src="../../js/recursos-enlaces.js"></script>
     b. En el HTML, dentro de la sección de Recursos, el sitio donde se
        pinta la repisa:
          <div data-re-repisa></div>
     c. Al final del JS de la misión, el contenido propio en
        `window.RECURSOS_ENLACES` (ver EL FORMATO, aquí abajo).

   ── EL FORMATO ──
   window.RECURSOS_ENLACES = {
     mision: 'hilo-cadena-hueco',   // clave del almacén, propia de la misión
     enlaces: [
       {
         tipo:   'audio',           // ver RE_TIPOS: audio, video, mapa, guia,
                                    // informe, preguntas, linea, tarjetas, web
         titulo: 'Resumen en audio: la cadena y el hueco',
         url:    'https://…',       // http o https; sin esto la tarjeta no enlaza
         desc:   'Qué trae, en dos líneas, y para qué momento sirve.',
         fuente: 'NotebookLM',      // quién lo hizo (se ve en el pie)
         origen: 'maquina',         // 'maquina' (por defecto) o 'casa'
         dura:   '14 min'           // duración o tamaño; opcional
       }
     ]
   };

   La DESCRIPCIÓN es el campo que decide si la repisa sirve. Se escribe
   con la misma regla que las fuentes de la misión: qué trae, y qué NO.
   «Resumen del tema» no dice nada y obliga a abrir los seis enlaces
   para saber cuál era. «Los dos conceptos con ejemplos de cine; no
   trae la prueba del conector» ahorra cinco.

   ── LOS TRES SITIOS DONDE VIVE UN ENLACE ──
   Y hacen falta los tres, cada uno por su motivo:

     · EL CATÁLOGO (`window.RECURSOS_ENLACES.enlaces`, en el JS de la
       misión). Lo permanente, versionado, y lo único que ve quien NO ha
       entrado por la puerta. Se pega desde el chat.
     · LA NUBE (tabla `recursos_enlaces`). Lo que la casa añade desde la
       pantalla, y lo que hace que el enlace esté en TODOS los aparatos y
       para los cuatro. Pedido por el autor el 27 de agosto de 2026.
     · EL APARATO (localStorage). La copia inmediata. Es lo que hace que
       la repisa pinte al instante y funcione sin señal, y lo que se
       sube cuando vuelve.

   Nunca se espera a la nube para pintar ni para guardar: si no hay
   señal, la repisa funciona igual y sube cuando la haya. Es la misma
   regla del marcador de lecturas, y por las mismas razones.

   ── DE QUIÉN ES LA REPISA: DE LA CASA ──
   Decidido con el autor el 27 de agosto de 2026. Los cuatro ven todos
   los enlaces de una misión; cualquiera puede poner; y quitar o
   corregir es solo de quien lo puso. Esto es distinto de las marcas de
   lectura a propósito: lo que subraya una hija no tiene por qué verlo
   el padre, pero el resumen en audio de una etapa le sirve a cualquiera
   que estudie esa etapa. La seguridad por fila de la tabla es la que lo
   hace cumplir de verdad; esta pantalla solo evita ofrecer botones que
   la base va a rechazar.

   ── EL CLIENTE DE SUPABASE ──
   Es el ÚNICO de la casa, el de `js/auth.js` (`window.faroSb`). Aquí no
   se crea otro: la razón, larga y cara, está escrita en ese archivo. Y
   se trae PEREZOSAMENTE, solo si ya hay sesión guardada en este
   navegador, por lo mismo que el marcador: si cada misión cargara la
   puerta al abrirse, las cuarenta pedirían red nada más entrar aunque
   nadie fuera a tocar la repisa.

   Esta es la SEGUNDA copia en la casa de ese arranque perezoso (la otra
   está en `js/lecturas-marcador.js`), y es una decisión, no un
   descuido: unificarla obligaría a que las más de cuarenta misiones
   cargaran un archivo más, o sea a tocar sus cuarenta HTML. Si un
   TERCER aparato lo necesita, entonces sí: se saca a `js/nube-mision.js`
   y se cambian los cuarenta de una pasada.

   Si `window.RECURSOS_ENLACES` no existe, este archivo se carga y no
   hace nada.
   ══════════════════════════════════════════════════════════════════ */

(function () {

  const CFG = window.RECURSOS_ENLACES;
  if (!CFG) return;

  const MIS = CFG.mision || 'mision';
  const K_REP = 'faro_repisa_' + MIS;

  /* ─────────── El vocabulario de tipos ───────────
     Los nueve que devuelve NotebookLM más el comodín. El color NO sale
     de la misión: un audio es azul en las cuarenta y dos misiones, y
     eso es lo que deja reconocer la clase de recurso sin leer nada. */
  /* `n` es el nombre entero, el del desplegable, donde hay sitio de sobra.
     `nc` es el que va en la tarjeta, y es corto a propósito: el rótulo
     comparte fila con el icono y con la insignia de «este aparato», y
     «RESUMEN EN AUDIO» salía recortado a «RESUMEN...», que es peor que
     una palabra sola. El icono ya dice la mitad. */
  const RE_TIPOS = {
    audio:       { ic: '🎧', n: 'Resumen en audio', nc: 'Audio',       c: '#0984e3', t: 'rgba(9,132,227,0.14)' },
    video:       { ic: '🎥', n: 'Video',            nc: 'Video',       c: '#d63031', t: 'rgba(214,48,49,0.13)' },
    diapositiva: { ic: '📊', n: 'Diapositivas',     nc: 'Diapos',      c: '#c2410c', t: 'rgba(194,65,12,0.14)' },
    infografia:  { ic: '📈', n: 'Infografía',       nc: 'Infografía',  c: '#0f766e', t: 'rgba(15,118,110,0.14)' },
    mapa:        { ic: '🗺️', n: 'Mapa mental',      nc: 'Mapa',        c: '#6c5ce7', t: 'rgba(108,92,231,0.14)' },
    guia:        { ic: '🧭', n: 'Guía de estudio',  nc: 'Guía',        c: '#00b894', t: 'rgba(0,184,148,0.14)' },
    informe:     { ic: '📄', n: 'Informe',          nc: 'Informe',     c: '#b8860b', t: 'rgba(184,134,11,0.16)' },
    preguntas:   { ic: '❓', n: 'Preguntas',        nc: 'Preguntas',   c: '#e84393', t: 'rgba(232,67,147,0.14)' },
    linea:       { ic: '🕰️', n: 'Línea de tiempo',  nc: 'Línea',       c: '#00838f', t: 'rgba(0,131,143,0.14)' },
    tarjetas:    { ic: '🃏', n: 'Tarjetas',         nc: 'Tarjetas',    c: '#ff6b35', t: 'rgba(255,107,53,0.14)' },
    web:         { ic: '🔗', n: 'Enlace',           nc: 'Enlace',      c: '#636e72', t: 'rgba(99,110,114,0.14)' }
  };

  /* ─────────── CÓMO SE GENERÓ, tipo por tipo ───────────
     Pedido por el autor el 27 de agosto de 2026. Son los ajustes que
     NotebookLM ofrece al generar cada cosa: no adornan la tarjeta,
     dicen QUÉ pediste. Dos resúmenes en audio de la misma misión, uno
     «Detallado» y otro «Breve», son dos recursos distintos, y sin esto
     en la repisa se distinguen abriéndolos.

     Vive aquí, en el aparato, y NO en la base de datos, por la misma
     razón que `tipo` no lleva check en el SQL: el día que NotebookLM
     añada un estilo, esto es una línea en un archivo, no una migración
     que alguien tiene que pegar desde una tableta. Lo que la base
     guarda es un objeto libre (`opciones`), y lo que no reconozca esta
     lista se sigue viendo tal cual en su pastilla.

     Ninguna es obligatoria: la mayoría de los enlaces no traerán
     ninguna, y una tarjeta sin pastillas está bien. */
  const RE_FACETAS = {
    audio: [
      { k: 'formato',  n: 'Formato',       ops: ['Detallado', 'Breve', 'Crítica', 'Debate'] },
      { k: 'duracion', n: 'Duración',      ops: ['Corto', 'Predeterminado'] }
    ],
    diapositiva: [
      { k: 'formato',  n: 'Formato',       ops: ['Presentación detallada', 'Diapositiva del presentador'] },
      { k: 'duracion', n: 'Duración',      ops: ['Corto', 'Predeterminado', 'Largo'] }
    ],
    video: [
      { k: 'formato',  n: 'Formato',       ops: ['Explicativo', 'Breve'] },
      { k: 'estilo',   n: 'Estilo visual', ops: ['Automático', 'Personalizado', 'Clásico', 'Pizarra', 'Kawaii', 'Anime', 'Acuarela', 'Dibujo retro', 'Legado', 'Papiroflexia'] }
    ],
    infografia: [
      { k: 'orientacion', n: 'Orientación',   ops: ['Horizontal', 'Vertical', 'Cuadrado'] },
      { k: 'estilo',      n: 'Estilo visual', ops: ['Automático', 'Kawaii', 'Arcilla', 'Boceto', 'Anime', 'Editorial', 'Instructivo', 'Cuadrícula bento', 'Ladrillos', 'Científico', 'Profesional'] }
    ],
    informe: [
      { k: 'formato',  n: 'Formato',          ops: ['Propia creación', 'Resumen', 'Guía de estudio', 'Entrada de blog'] },
      { k: 'sugerido', n: 'Formato sugerido', ops: ['Auditoría narrativa', 'Marco de estilo y ética', 'Guía de Conceptos Fundamentales', 'Guía práctica de Construcción'] }
    ]
  };
  const facetasDe = k => RE_FACETAS[k] || [];

  /* Las pastillas de una tarjeta, en el orden en que se declararon las
     facetas de su tipo. Se leen las que la lista conoce y, después, las
     que no: así una opción guardada por una versión más nueva del
     aparato no desaparece de la vista al abrirla con esta. */
  function opsDe(e) {
    const o = (e && e.ops && typeof e.ops === 'object') ? e.ops : {};
    const salida = [];
    const vistas = {};
    facetasDe(e.tipo).forEach(f => {
      if (o[f.k]) { salida.push(String(o[f.k])); vistas[f.k] = true; }
    });
    Object.keys(o).forEach(k => {
      if (!vistas[k] && o[k]) salida.push(String(o[k]));
    });
    return salida;
  }
  const tipoDe = k => RE_TIPOS[k] || RE_TIPOS.web;

  /* ─────────── El almacén, siempre entre paños ───────────
     localStorage revienta en modo privado de algunos navegadores y en
     iframes con cookies de terceros bloqueadas. Las sondas corren la
     misión DENTRO de un iframe, así que esto no es hipotético.

     La forma de cada enlace guardado:
       { id, tipo, titulo, url, desc, fuente, origen, dura,
         quien: 'josue',   quién lo puso (rótulo, nunca permiso)
         uid:   '<uuid>',  quién lo puso de verdad; '' si aún no subió
         u:     1724…,     reloj del aparato, para fusionar
         del:   false }    lápida: el borrado también tiene que viajar */
  let enlaces = null;          /* la lista viva, cargada una sola vez */
  let miUid = '';              /* quién soy, cuando ya se sabe */

  /* El identificador NACE AQUÍ, no en la base: la subida se reintenta, y
     sin un identificador propio el segundo intento dejaría un gemelo en
     vez de corregir el primero. */
  function nuevoId() {
    try {
      if (window.crypto && crypto.randomUUID) return 're-' + crypto.randomUUID();
    } catch (e) {}
    return 're-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  /* Los enlaces de la primera versión de la repisa (la que solo vivía en
     el aparato) no traían identificador ni reloj. Se les pone al leer,
     una vez, en vez de pedirle a nadie que vuelva a pegarlos. */
  function normaliza(e) {
    const n = Object.assign({}, e);
    if (!n.id) n.id = nuevoId();
    if (typeof n.u !== 'number') n.u = Date.now();
    n.del = !!n.del;
    n.uid = n.uid || '';
    n.quien = n.quien || '';
    n.origen = n.origen || 'maquina';
    /* Un objeto, no una lista de columnas: ver la nota de RE_FACETAS. */
    if (!n.ops || typeof n.ops !== 'object' || Array.isArray(n.ops)) n.ops = {};
    if (typeof n.orden !== 'number') n.orden = 0;
    return n;
  }

  function cargar() {
    if (enlaces) return enlaces;
    let crudo = [];
    try {
      const s = localStorage.getItem(K_REP);
      const v = s ? JSON.parse(s) : [];
      if (Array.isArray(v)) crudo = v;
    } catch (e) { crudo = []; }
    enlaces = crudo.map(normaliza);
    return enlaces;
  }

  function guardar() {
    try { localStorage.setItem(K_REP, JSON.stringify(enlaces || [])); return true; }
    catch (e) { return false; }
  }

  /* Lo que la pantalla enseña: lo vivo. Las lápidas se quedan en el
     almacén porque el borrado tiene que viajar, pero no se pintan. */
  function leerPropios() { return cargar().filter(e => !e.del); }
  function todos() { return cargar().slice(); }

  /* Sembrar la repisa entera. Lo usan las sondas y el formulario. */
  function guardarPropios(lista) {
    enlaces = (Array.isArray(lista) ? lista : []).map(normaliza);
    const ok = guardar();
    pintar();
    return ok;
  }

  /* El nombre que se enseña. Sale de la lista que ya tiene js/auth.js,
     que para cuando la repisa sincroniza está cargado en esta misma
     página. Con typeof porque si auth.js no está, el identificador ni
     existe y leerlo a secas reventaría. Una segunda lista de nombres
     aquí se quedaría vieja el día que cambie uno. */
  function nombreDe(clave) {
    const k = String(clave || '').trim();
    if (!k) return '';
    try {
      if (typeof MIEMBROS !== 'undefined' && MIEMBROS[k] && MIEMBROS[k].nombre) return MIEMBROS[k].nombre;
    } catch (e) {}
    return k.charAt(0).toUpperCase() + k.slice(1);
  }

  /* ─────────── La dirección, comprobada ───────────
     Solo http y https, y sin comillas, espacios, ángulos ni barras
     invertidas. Lo que no lo sea se descarta ENTERO: se pierde el
     enlace de esa tarjeta y nada más.

     `javascript:` y `data:` se quedan fuera por lo mismo que en el
     Buzón y en las Sugerencias: correrían DENTRO de la misión, que vive
     en el mismo dominio que la Bóveda, las finanzas y el chat. Y no se
     comprueba con una expresión sobre el texto pelado sino con URL(),
     porque `java\tscript:` y `JavaScript:` pasan un grep ingenuo y el
     navegador los ejecuta igual. */
  function reEnlace(u) {
    const s = (u == null ? '' : String(u)).trim();
    if (!s || /["'<>\\\s]/.test(s)) return '';
    let url;
    try { url = new URL(s, document.baseURI); } catch (e) { return ''; }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.href;
  }

  /* El sitio, en limpio y para leerlo de un vistazo. Los nombres
     bonitos son de las casas que salen todos los días; el resto enseña
     su dominio tal cual, que es lo que importa: que se vea a dónde
     lleva antes de tocarlo. */
  const CASAS = [
    [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, 'YouTube'],
    [/(^|\.)notebooklm\.google\.com$/,       'NotebookLM'],
    [/(^|\.)docs\.google\.com$/,             'Google Docs'],
    [/(^|\.)drive\.google\.com$/,            'Google Drive'],
    [/(^|\.)gemini\.google\.com$/,           'Gemini'],
    [/(^|\.)open\.spotify\.com$/,            'Spotify'],
    [/(^|\.)vimeo\.com$/,                    'Vimeo'],
    [/(^|\.)archive\.org$/,                  'Internet Archive']
  ];
  function reSitio(href) {
    let h;
    try { h = new URL(href).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
    for (const [re, nombre] of CASAS) if (re.test(h)) return nombre;
    return h;
  }

  /* ─────────── Pintar ───────────
     Todo con createElement y textContent. Ni una plantilla con datos
     dentro: ver la regla 3 de la cabecera. */
  const el = (tag, clase, texto) => {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
  };

  /* ══════════════════ EL ORDEN DE LA REPISA ══════════════════
     Pedido por el autor el 27 de agosto de 2026: poder mover las
     tarjetas y dejarlas como uno quiera.

     Y aquí hay una piedra que conviene ver antes de tropezar: la repisa
     es de la casa, pero la seguridad por fila solo deja escribir la
     fila propia. O sea que NO se puede guardar un orden común en la
     nube: mover la tarjeta de otra persona exigiría escribir su fila, y
     la tabla lo rechaza (con razón).

     Así que el orden es de cada quien, y se guarda en dos sitios:

       · en el APARATO, un mapa de clave a posición. Vale para TODAS las
         tarjetas, también las del catálogo y las de otras personas;
       · y además, para las tarjetas PROPIAS, en su columna `orden` de
         la nube. Eso es lo que hace que el orden que pusiste en la
         tableta aparezca en el teléfono.

     Con lo cual: tu orden viaja entre TUS aparatos para lo tuyo, y lo
     que colocaste de los demás se queda en el aparato donde lo
     colocaste. Es la única combinación honesta que permite la puerta;
     fingir un orden común sería un arrastre que parece guardarse y no
     se guarda. */
  const K_ORD = 'faro_repisa_orden_' + MIS;

  function leerOrden() {
    try {
      const v = JSON.parse(localStorage.getItem(K_ORD) || '{}');
      return (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
    } catch (e) { return {}; }
  }
  function guardarOrden(m) {
    try { localStorage.setItem(K_ORD, JSON.stringify(m)); } catch (e) {}
  }

  /* La clave de una tarjeta. Las del catálogo no tienen identificador
     (viven en el código, no en la base), así que se les hace uno con su
     dirección o su título: si el catálogo cambia, esa tarjeta es otra y
     vuelve a su sitio natural, que es lo correcto. */
  function claveDe(e) {
    if (e.id) return e.id;
    return 'cat:' + (e.url || e.titulo || '');
  }

  /* Ordena la lista que se va a pintar. Manda el mapa del aparato;
     después la columna de la nube; y lo que no tenga ninguno se queda
     donde estaba, detrás. El índice natural desempata para que dos
     tarjetas sin posición no se cambien de sitio solas en cada
     pintado. */
  function ordenar(lista) {
    const mapa = leerOrden();
    return lista
      .map((e, i) => {
        const c = claveDe(e);
        let pos;
        if (typeof mapa[c] === 'number') pos = mapa[c];
        else if (e.orden) pos = e.orden;
        else pos = 100000 + i;
        return { e: e, i: i, pos: pos };
      })
      .sort((a, b) => (a.pos - b.pos) || (a.i - b.i))
      .map(x => x.e);
  }

  /* Guarda el orden que dejó el arrastre. Renumera de uno en uno todo
     lo que se ve, para no acabar con posiciones repetidas que
     dependerían del desempate. */
  function fijarOrden(claves) {
    const mapa = {};
    claves.forEach((c, i) => { mapa[c] = i + 1; });
    guardarOrden(mapa);
    /* Y en lo propio, también arriba: es lo que lo lleva al otro
       aparato. Solo se toca la fila cuya posición cambió de verdad,
       para no reescribir la repisa entera en cada arrastre. */
    let hayCambio = false;
    cargar().forEach(x => {
      const nueva = mapa[x.id];
      if (!nueva || !esMio(x) || x.orden === nueva) return;
      x.orden = nueva; x.u = Date.now(); hayCambio = true;
    });
    if (hayCambio) { guardar(); pedirNube(); }
  }

  /* El pie: quién lo hizo y a dónde lleva, en una línea. Cuando las dos
     cosas son la misma casa (un cuaderno de NotebookLM hecho con
     NotebookLM) se dice una vez: «NotebookLM · NotebookLM» no informa de
     nada y, al recortarse, deja el destino a medias. */
  function firma(e, href) {
    const quien = (e.origen === 'casa') ? 'la casa' : (e.fuente || 'máquina');
    const emoji = (e.origen === 'casa') ? '✍️ ' : '🤖 ';
    const sitio = href ? reSitio(href) : '';
    if (!sitio) return emoji + quien;
    if (sitio.toLowerCase() === String(quien).trim().toLowerCase()) return emoji + sitio;
    return emoji + quien + ' · ' + sitio;
  }

  function insignia(e) {
    if (!e.uid) return 'solo aquí';
    if (miUid && e.uid === miUid) return '';
    return nombreDe(e.quien) || 'de la casa';
  }

  function tarjeta(e, propia) {
    const t = tipoDe(e.tipo);
    const href = reEnlace(e.url);
    const esEjemplo = !!e.ejemplo || !href;

    const card = document.createElement(esEjemplo ? 'div' : 'a');
    card.className = 're-card' + (esEjemplo ? ' re-ejemplo' : '');
    card.style.setProperty('--re-color', t.c);
    card.style.setProperty('--re-tinte', t.t);
    if (!esEjemplo) {
      /* setAttribute y no card.href = …: es la misma disciplina que en
         las Sugerencias de M.E.T.A.S, y aquí además la dirección ya
         pasó por reEnlace. Cinturón y tirantes, porque una sola de las
         dos cosas se olvida. */
      card.setAttribute('href', href);
      card.setAttribute('target', '_blank');
      card.setAttribute('rel', 'noopener noreferrer');
    }

    const top = el('div', 're-card-top');
    const ico = el('span', 're-ico', t.ic);
    ico.setAttribute('aria-hidden', 'true');
    const col = el('div', 're-top-txt');
    col.appendChild(el('span', 're-tipo', t.nc || t.n));
    if (e.dura) col.appendChild(el('span', 're-dura', e.dura));
    top.appendChild(ico); top.appendChild(col);
    /* La insignia va DENTRO de la fila de arriba y no encima de la
       tarjeta: encima tapaba el nombre del tipo.

       Qué dice, y por qué esas tres y no otras:
         · «solo aquí»: todavía no ha subido. Es un aviso, no un adorno:
           quien lo lea sabe que ese enlace no está en su otro aparato.
         · el nombre de quien lo puso, SOLO si no fui yo. En los propios
           sobra: nadie necesita que le recuerden que ese lo puso él, y
           una insignia en todas las tarjetas deja de leerse.
         · nada, si es mío y ya está arriba, que es el caso normal. */
    if (propia) {
      const b = insignia(e);
      if (b) top.appendChild(el('span', 're-marca', b));
    }
    card.appendChild(top);

    card.appendChild(el('h4', null, e.titulo || 'Sin título'));

    /* Cómo se generó, en pastillas. Van ARRIBA de la descripción a
       propósito: es lo que distingue dos audios de la misma misión, y
       leerlo después de tres líneas de texto llega tarde. */
    const ops = opsDe(e);
    if (ops.length) {
      const fila = el('div', 're-ops');
      ops.forEach(v => fila.appendChild(el('span', 're-op', v)));
      card.appendChild(fila);
    }

    card.appendChild(el('p', 're-desc', e.desc || ''));

    const pie = el('div', 're-pie');
    pie.appendChild(el('span', 're-sitio', firma(e, href)));
    pie.appendChild(el('span', 're-abrir', esEjemplo ? 'ejemplo' : 'Abrir ▸'));
    card.appendChild(pie);

    return card;
  }

  /* Un enlace propio va envuelto: los dos botones (borrar y copiar para
     el código) tienen que quedar FUERA del <a>. Un <button> dentro de
     un <a> no es HTML válido y en el teléfono se acaba tocando el
     enlace en vez del botón. */
  /* ¿Puedo quitar este enlace? Solo los míos, y los que todavía no han
     subido (que también son míos, aunque la nube no lo sepa aún). No es
     cortesía: la seguridad por fila de la tabla rechaza el borrado de un
     enlace ajeno, así que ofrecer el botón sería prometer algo que la
     base va a negar. */
  function esMio(e) { return !e.uid || (!!miUid && e.uid === miUid); }

  /* Toda tarjeta va envuelta, también las del catálogo: la envoltura es
     la que lleva la clave y el asa, y sin ellas esa tarjeta no se
     podría mover. Los botones van FUERA del <a>, porque un <button>
     dentro de un enlace no es HTML válido y en el teléfono se acaba
     tocando el enlace en vez del botón. */
  function envuelta(e, propia) {
    const w = el('div', 're-tarjeta-envoltura');
    w.setAttribute('data-re-clave', claveDe(e));
    w.appendChild(tarjeta(e, propia));
    const herr = el('div', 're-herr');

    /* El asa. Es un botón de verdad y no un icono decorativo para que
       también se pueda mover con el teclado: en una tableta el arrastre
       falla más de lo que parece, y una función que solo se puede usar
       arrastrando es una función que a veces no existe. */
    const asa = el('button', 're-asa', '⠿');
    asa.type = 'button';
    asa.setAttribute('data-re-asa', '');
    asa.title = 'Mover esta tarjeta (arrastra, o usa las flechas)';
    asa.setAttribute('aria-label', 'Mover ' + (e.titulo || 'esta tarjeta') + '. Arrastra, o con las flechas del teclado.');
    herr.appendChild(asa);

    if (propia) {
      const bCopia = el('button', null, '📋');
      bCopia.type = 'button';
      bCopia.title = 'Copiar el bloque de código de este enlace';
      bCopia.setAttribute('aria-label', 'Copiar el bloque de código de ' + (e.titulo || 'este enlace'));
      bCopia.addEventListener('click', () => copiar(bloqueDeCodigo([e])));
      herr.appendChild(bCopia);
    }

    if (propia && esMio(e)) {
      const bEdita = el('button', null, '✏️');
      bEdita.type = 'button';
      bEdita.title = 'Corregir este enlace';
      bEdita.setAttribute('aria-label', 'Corregir ' + (e.titulo || 'este enlace'));
      bEdita.addEventListener('click', () => abrirEdicion(e.id));
      herr.appendChild(bEdita);

      const bBorra = el('button', null, '🗑️');
      bBorra.type = 'button';
      bBorra.title = 'Quitar este enlace';
      bBorra.setAttribute('aria-label', 'Quitar ' + (e.titulo || 'este enlace'));
      /* Se entierra, no se borra: si esta lista lo quitara de verdad, la
         tableta que todavía tiene su copia lo volvería a subir en la
         siguiente sincronización y el enlace resucitaría solo. */
      bBorra.addEventListener('click', () => {
        const v = cargar().find(x => x.id === e.id);
        if (!v) return;
        v.del = true; v.u = Date.now();
        guardar(); pintar(); pedirNube();
        aviso('🗑️ Enlace quitado');
      });
      herr.appendChild(bBorra);
    }

    w.appendChild(herr);
    return w;
  }

  function pintar() {
    const caja = document.querySelector('[data-re-repisa]');
    if (!caja) return;
    const rejilla = caja.querySelector('.re-rejilla');
    const vacio = caja.querySelector('.re-vacio');
    if (!rejilla) return;

    rejilla.textContent = '';
    const catalogo = Array.isArray(CFG.enlaces) ? CFG.enlaces : [];
    const reales = catalogo.filter(e => !e.ejemplo);
    const propios = leerPropios();

    /* Los ejemplos solo se ven mientras no hay nada de verdad: están
       para enseñar cómo queda una tarjeta, y en cuanto llega el primer
       enlace real sobran. Así la repisa se limpia sola y nadie tiene
       que acordarse de borrarlos. */
    const muestraEjemplos = reales.length === 0 && propios.length === 0;
    const delCatalogo = muestraEjemplos ? catalogo : reales;

    /* Catálogo y repisa se pintan en UNA sola lista ordenada: si el
       catálogo fuera siempre primero, la mitad de las tarjetas no se
       podrían mover y el arrastre sería una función a medias. */
    const todas = delCatalogo.map(e => ({ e: e, propia: false }))
      .concat(propios.map(e => ({ e: e, propia: true })));
    ordenar(todas.map(x => x.e)).forEach(en => {
      const x = todas.find(y => y.e === en);
      rejilla.appendChild(envuelta(en, x ? x.propia : false));
    });

    if (vacio) vacio.hidden = todas.length > 0;
    pintarEstado();
  }

  /* ══════════════════ MOVER LAS TARJETAS ══════════════════
     Con PUNTEROS y no con el arrastre de HTML: `draggable` no funciona
     en el navegador de casi ningún teléfono ni tableta, y esta repisa
     se toca sobre todo desde una tableta. Con `pointerdown` y compañía
     el mismo código sirve para el dedo, el ratón y el lápiz.

     Y con TECLADO además: el asa es un botón, y con las flechas mueve
     la tarjeta un puesto. No es solo accesibilidad; es que un arrastre
     de precisión con el dedo, entre tarjetas de un dedo de ancho, falla
     lo suficiente como para que haga falta la otra manera.

     Durante el arrastre se mueve el NODO en el documento, no la lista:
     repintar en cada movimiento del dedo destruiría la tarjeta que se
     está arrastrando. La lista se guarda al soltar. */
  function montarArrastre(rejilla) {
    let nodo = null, idPuntero = null;

    const claves = () => [...rejilla.children]
      .map(n => n.getAttribute('data-re-clave'))
      .filter(Boolean);

    function soltar() {
      if (!nodo) return;
      nodo.classList.remove('re-arrastrando');
      rejilla.classList.remove('re-moviendo');
      nodo = null; idPuntero = null;
      fijarOrden(claves());
      /* Se repinta para que las insignias y el estado vuelvan a cuadrar
         con la lista, ahora que el documento manda. */
      pintar();
      aviso('↕️ Orden guardado');
    }

    rejilla.addEventListener('pointerdown', ev => {
      const asa = ev.target.closest('[data-re-asa]');
      if (!asa) return;
      const w = asa.closest('[data-re-clave]');
      if (!w || w.parentNode !== rejilla) return;
      /* Sin esto, el navegador empieza a seleccionar texto o a
         desplazar la página en cuanto el dedo se mueve. */
      ev.preventDefault();
      nodo = w; idPuntero = ev.pointerId;
      nodo.classList.add('re-arrastrando');
      rejilla.classList.add('re-moviendo');
      try { asa.setPointerCapture(ev.pointerId); } catch (e) {}
    });

    rejilla.addEventListener('pointermove', ev => {
      if (!nodo || ev.pointerId !== idPuntero) return;
      ev.preventDefault();
      /* La tarjeta que se arrastra tiene pointer-events en none por CSS
         mientras dura, así que esto devuelve lo que hay DEBAJO. */
      const bajo = document.elementFromPoint(ev.clientX, ev.clientY);
      const destino = bajo && bajo.closest ? bajo.closest('[data-re-clave]') : null;
      if (!destino || destino === nodo || destino.parentNode !== rejilla) return;
      const caja = destino.getBoundingClientRect();
      /* Qué mitad de la tarjeta hay que cruzar para colocarse delante.
         En varias columnas es la IZQUIERDA; en una sola, la de ARRIBA.

         Y el número de columnas se le pregunta a la rejilla, no se
         deduce de la forma de la tarjeta: esa fue la primera versión, y
         con tarjetas más anchas que altas (que es lo normal cuando la
         descripción es corta) elegía el eje vertical estando en tres
         columnas, así que arrastrar de derecha a izquierda no movía
         nada. Se vio arrastrando con el ratón, no leyendo el código. */
      const columnas = (getComputedStyle(rejilla).gridTemplateColumns || '').split(' ').filter(Boolean).length || 1;
      const antes = (columnas > 1)
        ? (ev.clientX < caja.left + caja.width / 2)
        : (ev.clientY < caja.top + caja.height / 2);
      rejilla.insertBefore(nodo, antes ? destino : destino.nextSibling);
    });

    rejilla.addEventListener('pointerup', soltar);
    rejilla.addEventListener('pointercancel', soltar);

    /* El teclado: flechas mueven un puesto, y el foco se queda en el
       asa de la tarjeta movida para poder encadenar varios saltos. */
    rejilla.addEventListener('keydown', ev => {
      const asa = ev.target.closest ? ev.target.closest('[data-re-asa]') : null;
      if (!asa) return;
      const dir = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[ev.key];
      if (!dir) return;
      ev.preventDefault();
      const w = asa.closest('[data-re-clave]');
      const hermanos = [...rejilla.children];
      const i = hermanos.indexOf(w);
      const j = i + dir;
      if (j < 0 || j >= hermanos.length) return;
      rejilla.insertBefore(dir < 0 ? w : hermanos[j], dir < 0 ? hermanos[j] : w);
      const orden = claves();
      fijarOrden(orden);
      pintar();
      /* Tras repintar, el asa es otro nodo: se vuelve a buscar por la
         clave para que el foco no se pierda a mitad de un movimiento. */
      const nueva = rejilla.querySelector('[data-re-clave="' + CSS.escape(w.getAttribute('data-re-clave')) + '"] [data-re-asa]');
      if (nueva) nueva.focus();
    });
  }

  /* ─────────── El bloque de código ───────────
     Sale con la forma exacta que hay que pegar al final del JS de la
     misión. JSON.stringify y no comillas a mano: un apóstrofo en el
     título («El hueco de Loewenstein») rompería el bloque y quien lo
     pegara descubriría la avería en la misión, no aquí. */
  function bloqueDeCodigo(lista) {
    const campos = ['tipo', 'titulo', 'url', 'desc', 'fuente', 'origen', 'dura'];
    const filas = lista.map(e => {
      const partes = campos
        .filter(k => e[k])
        .map(k => '    ' + k + ': ' + JSON.stringify(e[k]));
      /* Las opciones van al catálogo también: son lo que distingue dos
         audios de la misma misión, así que subirlas al repositorio sin
         ellas sería ascender media tarjeta. */
      if (e.ops && Object.keys(e.ops).length) partes.push('    ops: ' + JSON.stringify(e.ops));
      return '  {\n' + partes.join(',\n') + '\n  }';
    });
    return '// Pegar dentro de window.RECURSOS_ENLACES.enlaces\n' + filas.join(',\n') + ',';
  }

  function copiar(texto) {
    const listo = () => aviso('📋 Copiado. Pégalo en el chat para que quede en la misión');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(listo, () => copiarAlaAntigua(texto, listo));
    } else copiarAlaAntigua(texto, listo);
  }
  /* El portapapeles moderno no existe fuera de HTTPS ni dentro de
     algunos marcos, y las sondas corren la misión en un iframe. */
  function copiarAlaAntigua(texto, listo) {
    try {
      const ta = document.createElement('textarea');
      ta.value = texto;
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      listo();
    } catch (e) { aviso('⚠️ No se pudo copiar; el bloque está en la consola'); console.log(texto); }
  }

  /* El aviso usa el de la misión si lo hay: cada misión tiene el suyo
     con su color y su sitio, y un segundo sistema de avisos encima
     sería el mismo mensaje pintado dos veces. */
  function aviso(txt) {
    if (typeof window.showToast === 'function') window.showToast(txt);
    else console.log(txt);
  }

  /* ─────────── El formulario ───────────
     Sirve para dos cosas, añadir y corregir, y es el mismo a propósito:
     un segundo formulario de edición sería la misma pantalla escrita
     dos veces, y a la tercera corrección ya no coincidirían. Cuál de
     las dos está haciendo lo dice `form.dataset.editando`. */
  let _caja = null, _form = null, _abrir = null;

  function campoDe(k) { return _form ? _form.querySelector('[data-re-campo="' + k + '"]') : null; }

  /* Las opciones del tipo elegido, en pastillas que se marcan. Se
     repintan al cambiar el tipo, porque un audio y una infografía no
     preguntan lo mismo. Marcar la que ya estaba la desmarca: no hay
     ninguna obligatoria, y sin poder quitarla habría que recargar la
     página para deshacer un toque. */
  function pintarFacetas(tipo, valores) {
    const zona = _form ? _form.querySelector('[data-re-facetas]') : null;
    if (!zona) return;
    zona.textContent = '';
    const fs = facetasDe(tipo);
    zona.hidden = fs.length === 0;
    fs.forEach(f => {
      const fila = el('div', 're-faceta');
      fila.appendChild(el('span', 're-faceta-n', f.n));
      const grupo = el('div', 're-chips');
      grupo.setAttribute('role', 'group');
      grupo.setAttribute('aria-label', f.n);
      grupo.setAttribute('data-re-faceta', f.k);
      f.ops.forEach(op => {
        const b = el('button', 're-chip', op);
        b.type = 'button';
        b.setAttribute('data-re-valor', op);
        const puesto = (valores && valores[f.k] === op);
        b.classList.toggle('on', puesto);
        b.setAttribute('aria-pressed', puesto ? 'true' : 'false');
        b.addEventListener('click', () => {
          const ya = b.classList.contains('on');
          [...grupo.querySelectorAll('.re-chip')].forEach(o => {
            o.classList.remove('on'); o.setAttribute('aria-pressed', 'false');
          });
          if (!ya) { b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); }
        });
        grupo.appendChild(b);
      });
      fila.appendChild(grupo);
      zona.appendChild(fila);
    });
  }

  function leerFacetas() {
    const zona = _form ? _form.querySelector('[data-re-facetas]') : null;
    const out = {};
    if (!zona) return out;
    [...zona.querySelectorAll('[data-re-faceta]')].forEach(g => {
      const marcado = g.querySelector('.re-chip.on');
      if (marcado) out[g.getAttribute('data-re-faceta')] = marcado.getAttribute('data-re-valor');
    });
    return out;
  }

  function limpiarFormulario() {
    ['titulo', 'url', 'desc', 'dura'].forEach(k => { const c = campoDe(k); if (c) c.value = ''; });
    const f = campoDe('fuente'); if (f) f.value = 'NotebookLM';
    pintarFacetas(campoDe('tipo') ? campoDe('tipo').value : 'audio', {});
  }

  function tituloDelFormulario() {
    const t = _form ? _form.querySelector('[data-re-form-titulo]') : null;
    const editando = _form && _form.dataset.editando;
    if (t) t.textContent = editando ? '✏️ Corregir este enlace' : '➕ Un enlace nuevo';
    const g = _form ? _form.querySelector('[data-re-guarda]') : null;
    if (g) g.textContent = editando ? '💾 Guardar los cambios' : '💾 Guardar en la repisa';
    if (_abrir) _abrir.textContent = (_form && !_form.hidden) ? '✖ Cerrar' : '➕ Añadir un enlace';
  }

  function abrirEdicion(id) {
    const e = cargar().find(x => x.id === id);
    if (!e || !_form) return;
    _form.dataset.editando = id;
    _form.hidden = false;
    campoDe('url').value = e.url || '';
    campoDe('tipo').value = RE_TIPOS[e.tipo] ? e.tipo : 'web';
    campoDe('dura').value = e.dura || '';
    campoDe('titulo').value = e.titulo || '';
    campoDe('desc').value = e.desc || '';
    campoDe('fuente').value = e.fuente || '';
    pintarFacetas(campoDe('tipo').value, e.ops || {});
    tituloDelFormulario();
    _form.scrollIntoView({ block: 'nearest' });
    campoDe('titulo').focus();
  }

  function montarFormulario(caja) {
    _caja = caja;
    _form = caja.querySelector('.re-form');
    _abrir = caja.querySelector('[data-re-abrir]');
    const form = _form, abrir = _abrir;
    if (!form || !abrir) return;

    abrir.addEventListener('click', () => {
      form.hidden = !form.hidden;
      /* Cerrar cancela también la corrección: si no, el siguiente
         «Añadir» seguiría corrigiendo el de antes en silencio, y eso se
         descubre cuando ya se machacó un enlace bueno. */
      if (form.hidden) { delete form.dataset.editando; limpiarFormulario(); }
      tituloDelFormulario();
      if (!form.hidden) form.querySelector('[data-re-campo="url"]').focus();
    });

    const err = form.querySelector('.re-error');
    const campo = campoDe;

    /* Las opciones dependen del tipo, así que se repintan al cambiarlo.
       Lo marcado se pierde al cambiar de tipo, y está bien: las
       opciones de un audio no significan nada en una infografía. */
    campo('tipo').addEventListener('change', () => pintarFacetas(campo('tipo').value, {}));

    form.querySelector('[data-re-guarda]').addEventListener('click', () => {
      const editando = form.dataset.editando || '';
      const e = {
        tipo:   campo('tipo').value,
        titulo: campo('titulo').value.trim(),
        url:    campo('url').value.trim(),
        desc:   campo('desc').value.trim(),
        fuente: campo('fuente').value.trim() || 'NotebookLM',
        origen: 'maquina',
        dura:   campo('dura').value.trim(),
        ops:    leerFacetas()
      };
      const falla = validar(e);
      if (falla) { err.textContent = falla; err.hidden = false; return; }
      err.hidden = true;

      if (editando) {
        const v = cargar().find(x => x.id === editando);
        if (!v) { err.textContent = 'Ese enlace ya no está en la repisa.'; err.hidden = false; return; }
        /* Se copian los campos que se escriben y NADA más: el
           identificador, quién lo puso y su sitio en el orden no se
           tocan al corregir un título. */
        ['tipo', 'titulo', 'url', 'desc', 'fuente', 'dura', 'ops'].forEach(k => { v[k] = e[k]; });
        v.u = Date.now();
      } else {
        cargar().push(normaliza(e));
      }

      if (!guardar()) { err.textContent = 'Este aparato no deja guardar (modo privado). El enlace no se perdió: cópialo y pégalo en el chat.'; err.hidden = false; return; }
      delete form.dataset.editando;
      limpiarFormulario();
      tituloDelFormulario();
      pintar();
      pedirNube();
      if (editando) aviso('✏️ Enlace corregido');
      else aviso(haySesionGuardada() ? '✅ Enlace añadido, subiendo a la nube...' : '✅ Enlace añadido a este aparato');
    });

    /* Este botón vive FUERA del formulario (está junto al de abrir), así que
       se busca en la caja y no en el formulario. Escrito con form.querySelector
       devolvía null y reventaba el montaje entero: el formulario no llegaba a
       engancharse y la repisa quedaba de adorno. */
    caja.querySelector('[data-re-copia-todo]').addEventListener('click', () => {
      const lista = leerPropios();
      if (!lista.length) { aviso('Todavía no hay enlaces de este aparato'); return; }
      copiar(bloqueDeCodigo(lista));
    });
  }

  /* Devuelve el motivo del rechazo, o '' si está bien. Se contesta con
     la frase completa y no con «campo inválido»: quien rellena esto
     está en una tableta y no va a ir a buscar cuál de los cinco era. */
  function validar(e) {
    if (!e.titulo) return 'Falta el título: es lo que se lee en la tarjeta.';
    if (!e.url) return 'Falta la dirección del recurso.';
    if (!reEnlace(e.url)) return 'Esa dirección no vale: tiene que empezar por https:// y no llevar espacios ni comillas.';
    if (!e.desc) return 'Falta la descripción. Una repisa de enlaces sin descripción obliga a abrirlos todos para saber cuál era.';
    if (e.desc.length > 400) return 'La descripción es para dos líneas, no para un párrafo (máximo 400 letras).';
    return '';
  }

  /* ══════════════════════ LA NUBE ══════════════════════
     Lo guardado en el aparato es la verdad inmediata; la nube es la
     copia que viaja. Nunca se espera a la nube para pintar ni para
     guardar. */

  /* De dónde cuelgan los archivos compartidos, deducido del propio
     script: así la repisa no tiene que saber a qué profundidad está la
     misión que la cargó. */
  const BASE = (function () {
    const sc = document.currentScript;
    return (sc && sc.src) ? sc.src.replace(/recursos-enlaces\.js.*$/, '') : '../../js/';
  })();

  let estadoNube = 'local';   /* local | subiendo | al-dia | pendiente | sin-sesion | error */

  /* ¿Hay una sesión de la casa guardada en este navegador? Supabase la
     deja en una clave «sb-...-auth-token». Se mira sin cargar nada, que
     es la diferencia entre abrir una misión sin pedir red y no. */
  function haySesionGuardada() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        if (/^sb-.*-auth-token$/.test(localStorage.key(i))) return true;
      }
    } catch (e) {}
    return false;
  }

  function cargarScript(url) {
    return new Promise((ok, mal) => {
      const sc = document.createElement('script');
      sc.src = url; sc.async = false;
      sc.onload = ok; sc.onerror = () => mal(new Error('no cargó ' + url));
      document.head.appendChild(sc);
    });
  }

  /* El cliente se trae SOLO cuando hace falta. Ver la nota de la
     cabecera: esta es la segunda copia de este arranque perezoso en la
     casa, y es una decisión escrita, no un descuido. */
  let nubePedida = false;
  async function asegurarCliente() {
    if (window.faroSb) return window.faroSb;
    /* Sin sesión guardada no hay nada que sincronizar: descargar
       Supabase entero (más de doscientos kilobytes, a veces con datos
       que se pagan) para acabar diciendo «entra primero» es cobrarle a
       alguien por una respuesta que ya se sabía. */
    if (!haySesionGuardada()) return null;
    if (nubePedida) return window.faroSb || null;
    nubePedida = true;
    try {
      if (!window.supabase) await cargarScript(BASE + 'supabase.min.js');
      if (!window.faroSb) await cargarScript(BASE + 'auth.js');
    } catch (e) {
      /* Se baja la bandera para poder reintentarlo. Dejarla puesta mata
         la nube para siempre en esta página mientras el rótulo promete
         que se reintenta solo. */
      nubePedida = false;
      return null;
    }
    return window.faroSb || null;
  }

  /* Quién entró: el identificador que comprueba la seguridad por fila, y
     su nombre corto para el rótulo. El nombre se pregunta a
     familia_miembros y NO a los metadatos del usuario: en Supabase cada
     quien puede cambiarse sus propios metadatos, así que un nombre
     sacado de ahí es el que esa persona quiera ponerse. */
  let miembroCache = { uid: '', miembro: '' };

  async function usuarioActual() {
    const c = window.faroSb;
    if (!c || !c.auth) return null;
    try {
      const { data } = await c.auth.getSession();
      const u = data && data.session && data.session.user;
      if (!u) return null;
      /* El nombre corto se pregunta UNA vez y se recuerda: no cambia
         entre un viaje a la nube y el siguiente, y preguntarlo en cada
         sincronización doblaba las peticiones de la repisa a cambio de
         nada. Lo cazó la sonda de los dos aparatos contando peticiones. */
      if (miembroCache.uid === u.id) return { id: u.id, miembro: miembroCache.miembro };
      let miembro = '';
      try {
        const r = await c.from('familia_miembros').select('miembro').eq('user_id', u.id).maybeSingle();
        miembro = (r && r.data && r.data.miembro) ? String(r.data.miembro) : '';
      } catch (e) {}
      /* Solo se recuerda si de verdad se supo: guardar el vacío dejaría
         los enlaces sin nombre hasta recargar la página. */
      if (miembro) miembroCache = { uid: u.id, miembro: miembro };
      return { id: u.id, miembro: miembro };
    } catch (e) { return null; }
  }

  function aFila(e, uid, miembro) {
    return {
      id: e.id,
      mision: MIS,
      tipo: e.tipo || 'web',
      titulo: String(e.titulo || '').slice(0, 200),
      url: e.url,
      descripcion: String(e.desc || '').slice(0, 400),
      fuente: String(e.fuente || '').slice(0, 80),
      origen: (e.origen === 'casa') ? 'casa' : 'maquina',
      dura: String(e.dura || '').slice(0, 40),
      anadido_por: uid,
      miembro: String(e.quien || miembro || '').slice(0, 40),
      borrado: !!e.del,
      actualizado: e.u || 0,
      /* Un objeto libre, no una columna por opción: el día que
         NotebookLM añada un estilo, esto no es una migración. */
      opciones: (e.ops && typeof e.ops === 'object') ? e.ops : {},
      orden: e.orden || 0
    };
  }

  function deFila(f) {
    return {
      id: f.id,
      tipo: f.tipo || 'web',
      titulo: f.titulo || '',
      url: f.url || '',
      desc: f.descripcion || '',
      fuente: f.fuente || '',
      origen: f.origen || 'maquina',
      dura: f.dura || '',
      quien: f.miembro || '',
      uid: f.anadido_por || '',
      u: Number(f.actualizado) || 0,
      del: !!f.borrado,
      ops: (f.opciones && typeof f.opciones === 'object' && !Array.isArray(f.opciones)) ? f.opciones : {},
      orden: Number(f.orden) || 0
    };
  }

  /* Gana la versión más reciente, y se acabó. Aquí no hay nada que unir
     como las notas del marcador: un enlace no se edita a mano en dos
     sitios, se pone o se quita. El empate lo gana la nube porque hace
     falta una regla FIJA: si el desempate dependiera del aparato, dos
     aparatos empatados se estarían pisando el uno al otro para siempre. */
  function fusionar(local, remota) {
    if (!local) return remota;
    if (!remota) return local;
    return ((local.u || 0) > (remota.u || 0)) ? local : remota;
  }

  /* Las lápidas tampoco se guardan aquí para siempre: a los 180 días
     cualquier aparato vivo ya sincronizó cien veces. Es el mismo plazo
     que barre el servidor, para que los dos lados olviden a la vez. */
  const DIAS180 = 180 * 24 * 60 * 60 * 1000;
  function barrerLapidas() {
    const limite = Date.now() - DIAS180;
    const antes = cargar().length;
    enlaces = cargar().filter(e => !e.del || (e.u || 0) > limite);
    return enlaces.length !== antes;
  }

  let sincronizando = false, syncPendiente = false, temporizadorNube = null;

  async function sincronizar(manual) {
    /* Si llega una petición mientras hay otra en vuelo no se tira: se
       apunta y se atiende al terminar. Sin esto, lo que alguien pegara
       durante una sincronización se quedaba sin subir hasta el cambio
       siguiente, y el rótulo decía que ya estaba en la nube. */
    if (sincronizando) { syncPendiente = true; return; }

    const c = await asegurarCliente();
    if (!c) {
      estadoNube = haySesionGuardada() ? 'error' : 'sin-sesion';
      pintarEstado();
      if (manual && !haySesionGuardada()) aviso('📴 Entra en F.A.R.O para que tus enlaces viajen a otros aparatos');
      return;
    }
    const u = await usuarioActual();
    if (!u) {
      /* Con sesión guardada y sin poder leer quién es, el problema es la
         señal, no la puerta. Mandar a alguien a escribir su contraseña
         cuando ya está dentro es pelearse con un problema que no tiene. */
      estadoNube = haySesionGuardada() ? 'error' : 'sin-sesion';
      pintarEstado();
      return;
    }
    miUid = u.id;

    sincronizando = true;
    estadoNube = 'subiendo'; pintarEstado();
    const antes = firmaLocal();
    try {
      /* 1. Bajar lo que hay arriba para ESTA misión. Son unos pocos
            enlaces: se traen todos y se fusiona aquí, que es más simple
            y más seguro que llevar la cuenta de qué cambió desde
            cuándo. La consulta NO filtra por persona a propósito: la
            repisa es de la casa. */
      const { data, error } = await c.from('recursos_enlaces')
        .select('*').eq('mision', MIS);
      if (error) throw error;
      const remotos = (data || []).map(deFila);

      /* 2. Fusionar por identificador. */
      const porId = {};
      cargar().forEach(e => { porId[e.id] = e; });
      const subir = [];
      remotos.forEach(r => {
        const l = porId[r.id];
        porId[r.id] = fusionar(l, r);
        /* Lo que solo estaba arriba se acaba de bajar tal cual: no hay
           nada que devolver. Subirlo otra vez en cada carga de página
           mantendría vivas para siempre las lápidas que ya toca barrer,
           y en una repisa compartida devolvería además los enlaces de
           los demás, que la seguridad por fila va a rechazar uno por
           uno. */
        if (!l) return;
        const f = porId[r.id];
        if ((f.u || 0) > (r.u || 0) && esMio(f)) subir.push(f);
      });
      /* Lo que solo existe aquí sube entero, si es mío. Un enlace ajeno
         que ya no está arriba es uno que su dueño quitó de verdad: no se
         resucita. */
      Object.keys(porId).forEach(id => {
        if (remotos.find(r => r.id === id)) return;
        const e = porId[id];
        if (esMio(e)) subir.push(e);
      });
      enlaces = Object.keys(porId).map(id => porId[id]);

      /* 3. Subir. El upsert va por el identificador que nació en el
            aparato, así que reintentar corrige en vez de duplicar. Y al
            subir queda anotado de quién es: hasta ahora podía no
            saberse, porque se pegó sin sesión. */
      if (subir.length) {
        subir.forEach(e => { e.uid = u.id; if (!e.quien) e.quien = u.miembro; });
        const { error: e2 } = await c.from('recursos_enlaces')
          .upsert(subir.map(e => aFila(e, u.id, u.miembro)), { onConflict: 'id' });
        if (e2) throw e2;
      }

      barrerLapidas();
      guardar();
      /* Solo se repinta si algo cambió: repintar la rejilla entera en
         cada viaje a la nube son parpadeos a cambio de nada. */
      if (firmaLocal() !== antes) pintar();
      estadoNube = 'al-dia';
      pintarEstado();
      if (manual) aviso('☁️ Repisa sincronizada');
    } catch (e) {
      estadoNube = 'error';
      pintarEstado();
      if (manual) aviso('⚠️ No se pudo sincronizar: ' + (e && e.message ? e.message : 'sin conexión'));
    } finally {
      sincronizando = false;
      if (syncPendiente) { syncPendiente = false; setTimeout(() => sincronizar(false), 60); }
    }
  }

  /* Un resumen de lo que se ve, para saber si la nube cambió algo. */
  function firmaLocal() {
    return cargar().slice()
      .sort((a, b) => (a.id < b.id ? -1 : 1))
      .map(e => [e.id, e.tipo, e.titulo, e.url, e.desc, e.quien, e.del ? 1 : 0,
                 e.orden || 0, JSON.stringify(e.ops || {})].join('|'))
      .join('/');
  }

  /* Se sube con un respiro: quien pega dos enlaces seguidos no debe
     provocar dos viajes a la nube. */
  function pedirNube() {
    /* Mientras no haya subido, el rótulo lo dice. Decir «guardado
       también en la nube» con algo recién pegado y sin subir es la clase
       de mentira que hace que alguien cierre la aplicación tranquilo y
       pierda su trabajo. */
    if (estadoNube === 'al-dia' || estadoNube === 'pendiente') { estadoNube = 'pendiente'; pintarEstado(); }
    clearTimeout(temporizadorNube);
    temporizadorNube = setTimeout(() => sincronizar(false), 2000);
  }

  function textoEstado() {
    if (estadoNube === 'al-dia')     return '☁️ Guardado también en la nube: se ve en todos los aparatos de la casa';
    if (estadoNube === 'pendiente')  return '✍️ Guardado aquí; subiendo a la nube...';
    if (estadoNube === 'subiendo')   return '☁️ Sincronizando...';
    if (estadoNube === 'sin-sesion') return '📴 Solo en este aparato: entra en F.A.R.O para que viaje';
    if (estadoNube === 'error')      return '⚠️ Guardado aquí; la nube no respondió, se reintenta solo';
    return '';
  }

  function pintarEstado() {
    const n = document.querySelector('[data-re-estado]');
    if (!n) return;
    /* Sin nada propio que sincronizar no se dice nada: un rótulo de nube
       en una repisa que solo tiene lo del catálogo es ruido. */
    const hayPropios = cargar().some(e => !e.del);
    const txt = (hayPropios || estadoNube === 'subiendo') ? textoEstado() : '';
    n.textContent = txt;
    n.hidden = !txt;
    n.className = 're-estado re-estado-' + estadoNube;
  }

  /* ─────────── Arranque ───────────
     Si la misión ya terminó de montarse (este archivo va DESPUÉS del
     suyo, pero el navegador puede haber disparado ya el evento), se
     pinta al vuelo. */
  function arranca() {
    const caja = document.querySelector('[data-re-repisa]');
    if (!caja) return;
    montarFormulario(caja);
    /* El desplegable de tipos se llena desde RE_TIPOS y no a mano en el
       HTML: añadir un tipo tiene que ser una línea en un sitio, no una
       línea aquí y otra en cuarenta y dos misiones. */
    const sel = caja.querySelector('[data-re-campo="tipo"]');
    if (sel && !sel.options.length) {
      Object.keys(RE_TIPOS).forEach(k => {
        const o = document.createElement('option');
        o.value = k;
        o.textContent = RE_TIPOS[k].ic + ' ' + RE_TIPOS[k].n;
        sel.appendChild(o);
      });
      sel.value = 'audio';
    }

    /* El botón de sincronizar a mano. No sobra teniendo el automático:
       cuando alguien acaba de pegar un enlace en la tableta y quiere
       verlo YA en el teléfono, esperar el respiro de dos segundos sin
       saber si está pasando algo es exactamente cuando se cierra la
       aplicación pensando que no funcionó. */
    const bSync = caja.querySelector('[data-re-sync]');
    if (bSync) bSync.addEventListener('click', () => sincronizar(true));

    /* El arrastre se engancha a la REJILLA y no a cada tarjeta: las
       tarjetas nacen y mueren en cada pintado, y un oyente por tarjeta
       habría que volver a poner cada vez (y quitar, o se acumulan). */
    const rejilla = caja.querySelector('.re-rejilla');
    if (rejilla) montarArrastre(rejilla);

    /* Las opciones del tipo que sale por defecto, para que el
       formulario no se abra con el hueco vacío la primera vez. */
    pintarFacetas(sel ? sel.value : 'audio', {});

    pintar();

    /* Se baja lo que haya arriba nada más abrir, pero solo si ya hay
       sesión en este navegador: sin eso, abrir una misión no pide red.
       Con un respiro, para no pelearse con el pintado de la misión, que
       es lo que la persona está mirando. */
    if (haySesionGuardada()) setTimeout(() => sincronizar(false), 500);
    /* Y si no la hay, se dice YA, sin esperar a que alguien toque
       «Sincronizar». Con enlaces dentro y el rótulo en blanco, la
       repisa parecía estar al día cuando en realidad no había subido
       nada: el silencio, aquí, se lee como un sí. */
    else if (cargar().some(e => !e.del)) { estadoNube = 'sin-sesion'; pintarEstado(); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca);
  else arranca();

  /* La puerta para las sondas. Se expone lo que hay que poder medir a
     máquina: la validación de direcciones (que es la defensa), el
     almacén, la nube y el bloque de código. */
  window.FaroRepisa = {
    TIPOS: RE_TIPOS,
    pintar: pintar,
    validar: validar,
    enlaceValido: reEnlace,
    sitio: reSitio,
    leerPropios: leerPropios,
    /* Con las lápidas dentro: la sonda de la nube necesita verlas para
       comprobar que un borrado viaja de un aparato al otro. */
    todos: todos,
    guardarPropios: guardarPropios,
    bloqueDeCodigo: bloqueDeCodigo,
    /* La nube. `sincronizar` devuelve una promesa a propósito: sin ella
       la sonda tendría que adivinar cuándo terminó con un temporizador,
       que es como se escriben las sondas que aprueban por casualidad. */
    sincronizar: sincronizar,
    estadoNube: function () { return estadoNube; },
    haySesionGuardada: haySesionGuardada,
    aFila: aFila,
    deFila: deFila,
    /* Para poder medir la fusión sin montar dos aparatos enteros. */
    fusionar: fusionar,
    quienSoy: function () { return miUid; },
    /* El orden y las opciones, que es lo que se pidió el 27 de agosto
       por la tarde. `ordenar` se expone para poder comprobar que la
       lista sale colocada sin tener que leer el documento. */
    FACETAS: RE_FACETAS,
    facetasDe: facetasDe,
    opsDe: opsDe,
    ordenar: ordenar,
    claveDe: claveDe,
    leerOrden: leerOrden,
    fijarOrden: fijarOrden,
    abrirEdicion: abrirEdicion
  };

})();
