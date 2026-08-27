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

   ── LO QUE NO HACE, A PROPÓSITO ──
   No sube nada a Supabase: lo que se añade desde la pantalla se guarda
   en ESTE aparato y en ninguno más, y la tarjeta lo dice. Para que un
   enlace lo vea toda la casa hay que pegarlo en el catálogo, y por eso
   cada tarjeta propia trae el botón 📋 que escupe el bloque de código
   listo para pegar en el chat. Es el mismo reparto que el SQL de
   Supabase (ver CLAUDE.md): lo que tiene que quedar, queda en el
   repositorio; lo que se está probando, se prueba en el aparato.

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
    audio:     { ic: '🎧', n: 'Resumen en audio', nc: 'Audio',     c: '#0984e3', t: 'rgba(9,132,227,0.14)' },
    video:     { ic: '🎥', n: 'Video',            nc: 'Video',     c: '#d63031', t: 'rgba(214,48,49,0.13)' },
    mapa:      { ic: '🗺️', n: 'Mapa mental',      nc: 'Mapa',      c: '#6c5ce7', t: 'rgba(108,92,231,0.14)' },
    guia:      { ic: '🧭', n: 'Guía de estudio',  nc: 'Guía',      c: '#00b894', t: 'rgba(0,184,148,0.14)' },
    informe:   { ic: '📄', n: 'Informe',          nc: 'Informe',   c: '#b8860b', t: 'rgba(184,134,11,0.16)' },
    preguntas: { ic: '❓', n: 'Preguntas',        nc: 'Preguntas', c: '#e84393', t: 'rgba(232,67,147,0.14)' },
    linea:     { ic: '🕰️', n: 'Línea de tiempo',  nc: 'Línea',     c: '#00838f', t: 'rgba(0,131,143,0.14)' },
    tarjetas:  { ic: '🃏', n: 'Tarjetas',         nc: 'Tarjetas',  c: '#ff6b35', t: 'rgba(255,107,53,0.14)' },
    web:       { ic: '🔗', n: 'Enlace',           nc: 'Enlace',    c: '#636e72', t: 'rgba(99,110,114,0.14)' }
  };
  const tipoDe = k => RE_TIPOS[k] || RE_TIPOS.web;

  /* ─────────── El almacén, siempre entre paños ───────────
     localStorage revienta en modo privado de algunos navegadores y en
     iframes con cookies de terceros bloqueadas. Las sondas corren la
     misión DENTRO de un iframe, así que esto no es hipotético. */
  function leerPropios() {
    try {
      const s = localStorage.getItem(K_REP);
      if (!s) return [];
      const v = JSON.parse(s);
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function guardarPropios(lista) {
    try { localStorage.setItem(K_REP, JSON.stringify(lista)); return true; }
    catch (e) { return false; }
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
       tarjeta: encima tapaba el nombre del tipo. */
    if (propia) top.appendChild(el('span', 're-marca', 'este aparato'));
    card.appendChild(top);

    card.appendChild(el('h4', null, e.titulo || 'Sin título'));
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
  function envuelta(e, i) {
    const w = el('div', 're-tarjeta-envoltura');
    w.appendChild(tarjeta(e, true));
    const herr = el('div', 're-herr');

    const bCopia = el('button', null, '📋');
    bCopia.type = 'button';
    bCopia.title = 'Copiar el bloque de código de este enlace';
    bCopia.setAttribute('aria-label', 'Copiar el bloque de código de ' + (e.titulo || 'este enlace'));
    bCopia.addEventListener('click', () => copiar(bloqueDeCodigo([e])));

    const bBorra = el('button', null, '🗑️');
    bBorra.type = 'button';
    bBorra.title = 'Quitar este enlace de este aparato';
    bBorra.setAttribute('aria-label', 'Quitar ' + (e.titulo || 'este enlace'));
    bBorra.addEventListener('click', () => {
      const lista = leerPropios();
      lista.splice(i, 1);
      guardarPropios(lista);
      pintar();
      aviso('🗑️ Enlace quitado de este aparato');
    });

    herr.appendChild(bCopia); herr.appendChild(bBorra);
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

    delCatalogo.forEach(e => rejilla.appendChild(tarjeta(e, false)));
    propios.forEach((e, i) => rejilla.appendChild(envuelta(e, i)));

    if (vacio) vacio.hidden = (delCatalogo.length + propios.length) > 0;
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

  /* ─────────── El formulario ─────────── */
  function montarFormulario(caja) {
    const form = caja.querySelector('.re-form');
    const abrir = caja.querySelector('[data-re-abrir]');
    if (!form || !abrir) return;

    abrir.addEventListener('click', () => {
      form.hidden = !form.hidden;
      abrir.textContent = form.hidden ? '➕ Añadir un enlace' : '✖ Cerrar';
      if (!form.hidden) form.querySelector('[data-re-campo="url"]').focus();
    });

    const err = form.querySelector('.re-error');
    const campo = k => form.querySelector('[data-re-campo="' + k + '"]');

    form.querySelector('[data-re-guarda]').addEventListener('click', () => {
      const e = {
        tipo:   campo('tipo').value,
        titulo: campo('titulo').value.trim(),
        url:    campo('url').value.trim(),
        desc:   campo('desc').value.trim(),
        fuente: campo('fuente').value.trim() || 'NotebookLM',
        origen: 'maquina',
        dura:   campo('dura').value.trim()
      };
      const falla = validar(e);
      if (falla) { err.textContent = falla; err.hidden = false; return; }
      err.hidden = true;

      const lista = leerPropios();
      lista.push(e);
      if (!guardarPropios(lista)) { err.textContent = 'Este aparato no deja guardar (modo privado). El enlace no se perdió: cópialo y pégalo en el chat.'; err.hidden = false; return; }
      ['titulo', 'url', 'desc', 'dura'].forEach(k => { campo(k).value = ''; });
      pintar();
      aviso('✅ Enlace añadido a este aparato');
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
    pintar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca);
  else arranca();

  /* La puerta para las sondas. Se expone lo que hay que poder medir a
     máquina: la validación de direcciones (que es la defensa), el
     almacén y el bloque de código. */
  window.FaroRepisa = {
    TIPOS: RE_TIPOS,
    pintar: pintar,
    validar: validar,
    enlaceValido: reEnlace,
    sitio: reSitio,
    leerPropios: leerPropios,
    guardarPropios: function (l) { const r = guardarPropios(l); pintar(); return r; },
    bloqueDeCodigo: bloqueDeCodigo
  };

})();
