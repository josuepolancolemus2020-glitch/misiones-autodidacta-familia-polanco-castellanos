'use strict';
/* ══════════════════════════════════════════════════════════════════
   EL MARCADOR · subrayar, anotar, y que viaje entre aparatos
   ══════════════════════════════════════════════════════════════════

   Aparato COMPARTIDO por todas las misiones de F.A.R.O. Se carga después
   del JS de la misión y se engancha solo: no hay que configurarlo por
   misión, porque lee del documento lo que necesita y guarda con la clave
   de progreso de la misión, que ya es única.

   POR QUÉ EXISTE. Los textos de estudio de cada etapa son largos y se
   estudian, no se hojean, y hasta hoy la única manera de marcarlos era
   imprimirlos y sacar el lápiz. Quien lee en el teléfono se quedaba sin
   subrayar, es decir sin la mitad del oficio de leer.

   POR QUÉ CINCO COLORES Y NO UNO. Un subrayado de un solo color dice
   «esto importa», que al releer no sirve de nada porque para entonces
   la mitad del texto importa. El código de la casa obliga a decidir QUÉ
   es lo que importa, y esa decisión es el ejercicio:

     🟡 DATO (D)        cifra, año, capítulo, edición: lo comprobable.
     🟢 VOZ (V)         quién lo dice: autor, obra, fuente.
     🔴 IDEA (I)        la tesis, el mecanismo, el concepto.
     🔵 CONTRACITA (C)  la frase que estorba a la tesis, la objeción.
     🟣 DUDA (?)        no lo entendí, o hay que verificarlo.

   El azul no es un color más: la contracita es la prueba de lectura del
   Estudio Mayor, la frase del mismo autor que apunta al lado contrario.
   Darle color propio convierte el marcador en el ejercicio de la casa,
   y un texto sin ninguna marca azul se delata solo.

   POR QUÉ CADA MARCA LLEVA ADEMÁS TRAMA E INICIAL. Porque esto se
   imprime y se fotocopia, y en blanco y negro cinco colores son cinco
   grises iguales. Con la trama del subrayado y la inicial volada, la
   hoja fotocopiada sigue diciendo qué es cada cosa. Vale igual para
   quien no distingue bien los colores.

   ── DÓNDE SE PUEDE SUBRAYAR ────────────────────────────────────────
   Las misiones del Estudio Mayor tienen sección de Lecturas con cinco
   textos; las de las rutas del adulto no, pero tienen tanta prosa de
   estudio como ellas en Aprende, Estructura y Casos. El aparato mira el
   documento y decide: si hay lecturas, las zonas son las cinco tarjetas;
   si no, son las secciones de prosa. Nada que configurar por misión.

   ── LO QUE SE MARCA VIAJA ENTRE APARATOS ───────────────────────────
   Pedido por el autor el 19 de agosto de 2026, y cambia una decisión
   anterior de este mismo archivo (antes las notas se quedaban en el
   aparato a propósito). Ahora se guardan DOS VECES: en el aparato, que
   es lo que hace que funcione sin señal y al instante, y en la nube de
   la casa, que es lo que hace que estén ahí al cambiar de teléfono.
   Cada quien ve solo las suyas: la tabla lleva seguridad por fila y la
   llave es el usuario que entró, no el aparato.
══════════════════════════════════════════════════════════════════ */

(function () {

  /* Las cinco categorías. El orden es el de la barra y el de la leyenda,
     y va de lo más concreto (un dato que se comprueba) a lo más abierto
     (una duda), que es también el orden en que se aprende a leer. */
  const CATS = [
    { id: 'dato',   ini: 'D', nombre: 'Dato',       ayuda: 'cifra, año, capítulo, edición' },
    { id: 'voz',    ini: 'V', nombre: 'Voz',        ayuda: 'quién lo dice: autor, obra, fuente' },
    { id: 'idea',   ini: 'I', nombre: 'Idea',       ayuda: 'la tesis, el mecanismo' },
    { id: 'contra', ini: 'C', nombre: 'Contracita', ayuda: 'la frase que estorba, la objeción' },
    { id: 'duda',   ini: '?', nombre: 'Duda',       ayuda: 'no lo entendí, o hay que verificar' },
  ];
  const PORID = {};
  CATS.forEach(c => { PORID[c.id] = c; });

  /* Colores para la ventana de impresión. Van repetidos aquí a
     propósito, en vez de leerse de la hoja de estilo: el documento que
     se manda a la impresora es un HTML nuevo y vacío, sin acceso al CSS
     de la aplicación, así que necesita sus valores dentro.
     `sub` es la declaración entera del subrayado, no solo su grosor,
     porque las cinco tramas tienen que ser DISTINTAS entre sí y no todas
     caben en un border-bottom: Idea va ondulada. Cinco tramas iguales de
     dos en dos convierten la fotocopia en una adivinanza. */
  const IMPR = {
    dato:   { bg: '#fef08a', fw: '#a16207', sub: 'border-bottom:1pt solid #a16207;' },
    voz:    { bg: '#bbf7d0', fw: '#15803d', sub: 'border-bottom:2.4pt double #15803d;' },
    idea:   { bg: '#fecaca', fw: '#b91c1c', sub: 'text-decoration:underline wavy #b91c1c;text-underline-offset:2px;' },
    contra: { bg: '#bfdbfe', fw: '#1d4ed8', sub: 'border-bottom:1.4pt dotted #1d4ed8;' },
    duda:   { bg: '#e9d5ff', fw: '#7e22ce', sub: 'border-bottom:1.4pt dashed #7e22ce;' },
  };

  /* Secciones con prosa de estudio, para las misiones que no tienen
     Lecturas. No entran Quiz, Flashcards, Sopa ni las demás: ahí no hay
     nada que subrayar, hay ejercicios que resolver. */
  const SECS_PROSA = ['s-aprende', 's-estructura', 's-casos', 's-guion'];

  let MISION = 'faro_mision';       /* la clave de progreso de la misión */
  let CLAVE = 'faro_marcas';        /* dónde se guarda en este aparato */
  let marcas = [];                  /* el modelo entero, borradas incluidas */
  let ORIG = new Map();             /* HTML original de cada párrafo */
  let seleccion = null;             /* selección viva, aún sin marcar */
  let editando = null;              /* id de la marca que se está tocando */
  let arrancado = false;
  let estadoNube = 'local';         /* local | subiendo | al-dia | sin-sesion | error */
  let ultimaNube = 0;
  let temporizadorNube = null;

  /* ─────────────── Guardado en el aparato ───────────────
     Se usa la MISMA clave de progreso de la misión con un sufijo, que es
     como guarda todo lo demás la casa. Esto es lo primero y lo más
     importante: escribe al instante y funciona sin señal. La nube va
     después y por encima, nunca en lugar de esto. */
  function claveDeMision() {
    try { if (typeof SAVE_KEY !== 'undefined' && SAVE_KEY) return SAVE_KEY; } catch (e) {}
    return 'faro_mision';
  }
  function cargar() {
    try {
      const c = JSON.parse(localStorage.getItem(CLAVE));
      marcas = Array.isArray(c) ? c : [];
    } catch (e) { marcas = []; }
    /* Las borradas se guardan un tiempo (ver `quitarMarca`) y después se
       barren, para que el almacén no crezca sin fin. */
    const limite = ahora() - 180 * 86400000;
    marcas = marcas.filter(m => !m.del || (m.u || 0) > limite);
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(marcas)); }
    catch (e) { aviso('⚠️ No se pudo guardar la marca'); }
  }
  function nuevoId() {
    return 'm' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }
  function ahora() { return Date.now(); }
  function hoy() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  /* Las vivas: lo borrado se queda en el modelo como lápida, pero no se
     pinta ni se cuenta ni se imprime. */
  function vivas() { return marcas.filter(m => !m.del); }

  /* ─────────────── Las zonas marcables ───────────────
     Una zona es un trozo del documento con prosa de estudio y con un
     nombre estable, que es lo que permite volver a encontrar la marca
     mañana. En las misiones con Lecturas, cada lectura es una zona. En
     las demás, cada sección de prosa. */
  function zonas() {
    const lecturas = [...document.querySelectorAll('#s-lecturas .card[id^="lect-"]')];
    if (lecturas.length) {
      return lecturas.map(card => ({
        clave: card.id.replace(/^lect-/, ''),
        titulo: tituloDe(card),
        raiz: card,
        parrafos: parrafosDe(card),
      }));
    }
    return SECS_PROSA.map(id => document.getElementById(id))
      .filter(sec => sec && parrafosDe(sec).length)
      .map(sec => ({
        clave: sec.id,
        titulo: tituloDeSeccion(sec),
        raiz: sec,
        parrafos: parrafosDe(sec),
      }));
  }
  /* Los trozos de PROSA que se pueden subrayar. Son tres formas, y las
     tres llevan texto de estudio de verdad:
       · los párrafos sueltos de una tarjeta (en este proyecto la prosa
         va en <p> sin clase, y los de interfaz siempre llevan una:
         id-prog, eval-desc, sub...), más los .lect-p de las lecturas;
       · el cuerpo de los avisos .tip, que es donde suele estar la regla
         de la etapa dicha en una frase;
       · las cajas .ex-box de ejemplos.

     Y un filtro de seguridad que no es opcional: se descarta cualquier
     candidato que lleve dentro un control o un elemento con id. Al
     pintar una marca se rehace el HTML de su trozo, y rehacer un trozo
     que contuviera un botón lo dejaría sin su manejador, es decir
     rompería la misión en silencio. Solo se subraya texto inerte. */
  const CONTROLES = 'button,input,select,textarea,canvas,svg,audio,video,[id],[onclick],[onchange]';
  function parrafosDe(raiz) {
    const cand = [
      ...raiz.querySelectorAll('.card > p'),
      ...raiz.querySelectorAll('.card > .tip > div'),
      ...raiz.querySelectorAll('.card > .ex-box'),
    ];
    return cand
      .filter(el => el.tagName !== 'P' || el.classList.contains('lect-p') || !el.className.trim())
      .filter(el => el.textContent.trim().length > 40)   /* los pies de dos palabras no se subrayan */
      .filter(el => !el.querySelector(CONTROLES))
      /* En el orden en que se leen, que es el orden del documento: el
         querySelectorAll de arriba agrupa por tipo y aquí se recompone. */
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
  }
  function tituloDe(card) {
    const h = card.querySelector('h2');
    if (!h) return card.id;
    /* El h2 trae «🌀 Lectura 1 · «Los subrayados de mi padre» (cuento, a
       la manera de Borges)». Para el panel y para el papel basta el
       título entre comillas, que es como la llama quien la leyó. */
    const m = h.textContent.match(/«([^»]+)»/);
    return m ? m[1] : h.textContent.replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ]+/, '').trim();
  }
  function tituloDeSeccion(sec) {
    const nombres = { 's-aprende': 'Aprende', 's-estructura': 'Estructura',
                      's-casos': 'Casos del proyecto', 's-guion': 'Guion de video' };
    return nombres[sec.id] || sec.id;
  }
  function zonaDe(clave) { return zonas().find(z => z.clave === clave) || null; }

  /* ─────────────── Pintado ───────────────
     Se repinta SIEMPRE desde el HTML original del párrafo y se vuelven a
     aplicar todas sus marcas. Es más trabajo que ir quitando y poniendo
     etiquetas sueltas, y es la única manera de que no queden restos
     cuando dos marcas se tocan: el estado de la pantalla sale del
     modelo, nunca al revés. */
  function pintarTodo() {
    renumerarNotas();
    zonas().forEach(z => {
      z.parrafos.forEach((p, i) => {
        if (!ORIG.has(p)) ORIG.set(p, p.innerHTML);
        p.innerHTML = ORIG.get(p);
        const texto = p.textContent;
        const suyas = vivas()
          .filter(m => m.l === z.clave && m.p === i && !m.huerfana)
          .sort((a, b) => a.i - b.i);
        suyas.forEach(m => {
          if (texto.slice(m.i, m.f) !== m.t) return;   /* desanclada: la caza reanclar() */
          envolver(p, m);
        });
      });
    });
    pintarPanel();
  }

  /* Envuelve el rango [m.i, m.f) del párrafo en una o varias marcas. Son
     VARIAS cuando el subrayado cruza una negrita o una cursiva: en ese
     caso no se puede envolver de una vez sin romper el HTML, así que se
     envuelve trozo a trozo y todos comparten el mismo identificador. La
     inicial volada se pone solo en el último trozo, o una frase con dos
     negritas saldría con tres iniciales seguidas. */
  function envolver(p, m) {
    const paseo = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null);
    let off = 0; const trozos = [];
    while (paseo.nextNode()) {
      const n = paseo.currentNode, len = n.nodeValue.length;
      const a = Math.max(m.i, off), b = Math.min(m.f, off + len);
      if (a < b) trozos.push({ n: n, desde: a - off, hasta: b - off });
      off += len;
    }
    trozos.forEach((t, k) => {
      let nodo = t.n;
      if (t.hasta < nodo.nodeValue.length) nodo.splitText(t.hasta);
      if (t.desde > 0) nodo = nodo.splitText(t.desde);
      const mk = document.createElement('mark');
      mk.className = 'fm-hl fm-hl-' + m.c
        + (k === trozos.length - 1 ? ' fm-hl-fin' : '')
        + (m.n ? ' fm-hl-nota' : '');
      mk.setAttribute('data-fm-id', m.id);
      mk.setAttribute('data-ini', PORID[m.c] ? PORID[m.c].ini : '');
      if (m.n) mk.setAttribute('data-n', m.num || '');
      mk.setAttribute('tabindex', '0');
      mk.setAttribute('role', 'button');
      mk.setAttribute('aria-label', (PORID[m.c] ? PORID[m.c].nombre : 'Marca')
        + (m.n ? ', con nota' : '') + ': ' + m.t.slice(0, 60));
      nodo.parentNode.replaceChild(mk, nodo);
      mk.appendChild(nodo);
    });
  }

  /* Las notas se numeran en el orden en que aparecen leyendo, no en el
     orden en que se escribieron: el número que se ve en la pantalla es
     el mismo que remite a la nota al pie del papel, y en el papel el
     lector va de arriba abajo. */
  function renumerarNotas() {
    const orden = zonas().map(z => z.clave);
    let n = 0;
    vivas()
      .slice()
      .sort((a, b) => (orden.indexOf(a.l) - orden.indexOf(b.l)) || (a.p - b.p) || (a.i - b.i))
      .forEach(m => { if (m.n) { m.num = ++n; } else { delete m.num; } });
  }

  /* Si la misión se corrige, el texto se mueve y una marca puede quedar
     apuntando a otra cosa. Antes de pintar se intenta reanclar por el
     texto exacto; si no aparece, la marca NO se borra: se guarda como
     huérfana y sale en el panel con su aviso. Perder la nota de alguien
     porque se arregló una coma sería el peor fallo posible de esto. */
  function reanclar() {
    let cambio = false;
    zonas().forEach(z => {
      const textos = z.parrafos.map(p => p.textContent);
      vivas().filter(m => m.l === z.clave).forEach(m => {
        const antes = m.huerfana;
        const suyo = textos[m.p];
        if (suyo !== undefined && suyo.slice(m.i, m.f) === m.t) { m.huerfana = false; }
        else {
          let hallado = false;
          for (let k = 0; k < textos.length && !hallado; k++) {
            const pos = textos[k].indexOf(m.t);
            /* Solo se reancla si el texto aparece UNA vez: si aparece
               dos, adivinar cuál era es peor que avisar. */
            if (pos >= 0 && textos[k].indexOf(m.t, pos + 1) < 0) {
              m.p = k; m.i = pos; m.f = pos + m.t.length; m.huerfana = false; hallado = true;
            }
          }
          if (!hallado) m.huerfana = true;
        }
        if (antes !== m.huerfana) cambio = true;
      });
    });
    if (cambio) guardar();
  }

  /* ─────────────── Selección ─────────────── */
  function leerSeleccion() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed) return null;
    const r = sel.getRangeAt(0);
    let nodo = r.commonAncestorContainer;
    if (nodo.nodeType === 3) nodo = nodo.parentElement;
    if (!nodo || !nodo.closest) return null;
    const p = nodo.closest('p');
    if (!p) return null;
    const todas = zonas();
    let z = null, idx = -1;
    for (const zz of todas) {
      const k = zz.parrafos.indexOf(p);
      if (k >= 0) { z = zz; idx = k; break; }
    }
    if (!z) return null;
    /* El desplazamiento se mide sobre el texto del párrafo, no sobre su
       HTML: así una marca sigue valiendo aunque el párrafo ya tenga
       otras marcas pintadas encima, que cambian el HTML pero no el
       texto. */
    const antes = document.createRange();
    antes.selectNodeContents(p);
    antes.setEnd(r.startContainer, r.startOffset);
    const ini = antes.toString().length;
    const texto = r.toString();
    if (!texto.trim()) return null;
    return { l: z.clave, p: idx, i: ini, f: ini + texto.length, t: texto };
  }

  /* ─────────────── Crear, cambiar, borrar ─────────────── */
  function marcarCon(cat) {
    if (editando) {
      const m = marcas.find(x => x.id === editando);
      if (m) { m.c = cat; m.u = ahora(); guardar(); pintarTodo(); pedirNube(); }
      cerrarBarra();
      sonido('ok');
      return;
    }
    if (!seleccion) return;
    const s = seleccion;
    /* Marcar encima de lo ya marcado GANA, como en los lectores de
       libros: se quitan las que se cruzan y se pone la nueva. Si alguna
       de las que se van tenía nota, la nota se hereda, que costó más de
       escribir que el subrayado. */
    const cruzadas = vivas().filter(m => m.l === s.l && m.p === s.p && m.i < s.f && m.f > s.i);
    const notaHeredada = cruzadas.map(m => m.n).filter(Boolean).join('\n');
    cruzadas.forEach(m => { m.del = true; m.u = ahora(); });
    marcas.push({ id: nuevoId(), l: s.l, p: s.p, i: s.i, f: s.f, t: s.t, c: cat,
                  n: notaHeredada, fecha: hoy(), u: ahora() });
    guardar(); pintarTodo(); cerrarBarra(); limpiarSeleccion(); pedirNube();
    sonido('ok');
    aviso(PORID[cat].ini + ' ' + PORID[cat].nombre + ': marcado');
  }

  /* Borrar es poner una lápida, no quitar la fila. Sin lápida, una marca
     borrada en el teléfono volvería a aparecer en cuanto la tableta
     subiera su copia: el otro aparato no tiene manera de saber si
     desapareció porque se borró o porque nunca llegó. */
  function quitarMarca(id) {
    const m = marcas.find(x => x.id === id);
    if (!m) return;
    if (m.n && !confirm('Esta marca tiene una nota escrita. ¿Se quita igual?')) return;
    m.del = true; m.u = ahora();
    guardar(); pintarTodo(); cerrarBarra(); pedirNube();
    sonido('click');
  }

  /* ─────────────── La barra ─────────────── */
  function construirBarra() {
    if (document.getElementById('fmBarra')) return;
    const b = document.createElement('div');
    b.className = 'fm-barra'; b.id = 'fmBarra';
    b.setAttribute('role', 'toolbar');
    b.setAttribute('aria-label', 'Marcar lo seleccionado');
    b.innerHTML =
      '<div class="fm-barra-txt" id="fmBarraTxt"></div>'
      + '<div class="fm-colores">'
      + CATS.map(c =>
          '<button type="button" class="fm-color fm-color-' + c.id + '" data-cat="' + c.id + '"'
          + ' aria-pressed="false" title="' + c.nombre + ': ' + c.ayuda + '">'
          + '<span class="fm-ini" aria-hidden="true">' + c.ini + '</span>'
          + '<span>' + c.nombre + '</span></button>').join('')
      + '</div>'
      + '<div class="fm-acciones">'
      + '<button type="button" class="fm-acc" id="fmBtnNota">✎ Nota</button>'
      + '<button type="button" class="fm-acc fm-acc-quita" id="fmBtnQuita">🗑 Quitar</button>'
      + '<button type="button" class="fm-acc" id="fmBtnCierra">✕ Cerrar</button>'
      + '</div>';
    document.body.appendChild(b);
    b.querySelectorAll('.fm-color').forEach(btn =>
      btn.addEventListener('click', () => marcarCon(btn.dataset.cat)));
    document.getElementById('fmBtnNota').addEventListener('click', abrirNota);
    document.getElementById('fmBtnQuita').addEventListener('click', () => {
      if (editando) quitarMarca(editando); else cerrarBarra();
    });
    document.getElementById('fmBtnCierra').addEventListener('click', () => { cerrarBarra(); limpiarSeleccion(); });
  }

  function abrirBarra(texto, catActual, hayMarca) {
    construirBarra();
    const b = document.getElementById('fmBarra');
    document.getElementById('fmBarraTxt').textContent = '«' + texto.slice(0, 160) + (texto.length > 160 ? '…»' : '»');
    b.querySelectorAll('.fm-color').forEach(btn =>
      btn.setAttribute('aria-pressed', String(btn.dataset.cat === catActual)));
    document.getElementById('fmBtnQuita').style.display = hayMarca ? '' : 'none';
    b.classList.add('fm-abierta');
  }
  function cerrarBarra() {
    const b = document.getElementById('fmBarra');
    if (b) b.classList.remove('fm-abierta');
    seleccion = null; editando = null;
  }
  function limpiarSeleccion() {
    const s = window.getSelection();
    if (s && s.removeAllRanges) s.removeAllRanges();
  }

  /* ─────────────── La nota ─────────────── */
  function construirModal() {
    if (document.getElementById('fmModal')) return;
    const d = document.createElement('div');
    d.className = 'fm-modal'; d.id = 'fmModal';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.setAttribute('aria-labelledby', 'fmModalTit');
    d.innerHTML =
      '<div class="fm-modal-caja">'
      + '<h3 id="fmModalTit" style="font-size:1rem;margin-bottom:2px;">✎ Nota de lectura</h3>'
      + '<div class="fm-modal-cita" id="fmModalCita"></div>'
      + '<textarea id="fmModalTA" placeholder="Lo que quieras acordarte dentro de un mes..." aria-label="Texto de la nota"></textarea>'
      + '<div class="fm-acciones" style="margin-top:10px;">'
      + '<button type="button" class="fm-acc" id="fmNotaGuarda">💾 Guardar</button>'
      + '<button type="button" class="fm-acc" id="fmNotaCancela">✕ Cancelar</button>'
      + '</div></div>';
    document.body.appendChild(d);
    document.getElementById('fmNotaCancela').addEventListener('click', cerrarNota);
    document.getElementById('fmNotaGuarda').addEventListener('click', guardarNota);
    d.addEventListener('click', e => { if (e.target === d) cerrarNota(); });
  }

  let notaPara = null;   /* id de marca, o la selección pendiente */

  function abrirNota() {
    construirModal();
    let texto = '', valor = '';
    if (editando) {
      const m = marcas.find(x => x.id === editando);
      if (!m) return;
      notaPara = { id: m.id }; texto = m.t; valor = m.n || '';
    } else if (seleccion) {
      /* Anotar sin haber elegido color todavía: se marca como Duda, que
         es lo que casi siempre es una nota escrita a bote pronto, y se
         puede cambiar de color después tocándola. */
      notaPara = { pendiente: Object.assign({}, seleccion) }; texto = seleccion.t;
    } else return;
    document.getElementById('fmModalCita').textContent = '«' + texto.slice(0, 300) + (texto.length > 300 ? '…»' : '»');
    const ta = document.getElementById('fmModalTA');
    ta.value = valor;
    document.getElementById('fmModal').classList.add('fm-abierta');
    setTimeout(() => ta.focus(), 60);
  }
  function cerrarNota() {
    const d = document.getElementById('fmModal');
    if (d) d.classList.remove('fm-abierta');
    notaPara = null;
  }
  function guardarNota() {
    const ta = document.getElementById('fmModalTA');
    const valor = ta ? ta.value.trim() : '';
    if (notaPara && notaPara.id) {
      const m = marcas.find(x => x.id === notaPara.id);
      if (m) { m.n = valor; m.u = ahora(); }
    } else if (notaPara && notaPara.pendiente) {
      const s = notaPara.pendiente;
      const cruzadas = vivas().filter(m => m.l === s.l && m.p === s.p && m.i < s.f && m.f > s.i);
      cruzadas.forEach(m => { m.del = true; m.u = ahora(); });
      marcas.push({ id: nuevoId(), l: s.l, p: s.p, i: s.i, f: s.f, t: s.t, c: 'duda',
                    n: valor, fecha: hoy(), u: ahora() });
    }
    guardar(); pintarTodo(); cerrarNota(); cerrarBarra(); limpiarSeleccion(); pedirNube();
    sonido('ok'); aviso('✎ Nota guardada');
  }

  /* ══════════════ LA NUBE ══════════════
     Lo guardado en el aparato es la verdad inmediata; la nube es la
     copia que viaja. Nunca se espera a la nube para pintar ni para
     guardar: si no hay señal, el marcador funciona igual y sube cuando
     la haya.

     El cliente de Supabase es el ÚNICO de la casa, el de js/auth.js
     (window.faroSb). Aquí no se crea otro: la razón, larga y cara, está
     escrita en ese archivo. */
  /* De dónde cuelgan los archivos compartidos, deducido del propio
     script: así el marcador no tiene que saber a qué profundidad está
     la misión que lo cargó. */
  const BASE = (function () {
    const s = document.currentScript;
    return (s && s.src) ? s.src.replace(/lecturas-marcador\.js.*$/, '') : '../../js/';
  })();

  function sb() { return window.faroSb || null; }

  /* ¿Hay una sesión de la casa guardada en este navegador? Supabase la
     deja en una clave «sb-...-auth-token». Se mira sin cargar nada. */
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
      const s = document.createElement('script');
      s.src = url; s.async = false;
      s.onload = ok; s.onerror = () => mal(new Error('no cargó ' + url));
      document.head.appendChild(s);
    });
  }

  /* La nube se trae SOLO cuando hace falta, y esto no es una
     optimización de lujo: si cada misión cargara la puerta al abrirse,
     las treinta y ocho pedirían red nada más entrar, aunque nadie fuera
     a subrayar. Sin señal eso deja la misión esperando, y en el banco de
     pruebas colgaba las sondas que recorren el catálogo entero.
     Con esto, quien no ha entrado no paga nada; quien entró, sincroniza.
     El cliente lo sigue creando js/auth.js, que es el ÚNICO de la casa:
     aquí no se crea otro (la razón, larga y cara, está en ese archivo). */
  let nubePedida = false;
  async function asegurarCliente(forzar) {
    if (window.faroSb) return window.faroSb;
    if (!forzar && !haySesionGuardada()) return null;
    if (nubePedida) return window.faroSb || null;
    nubePedida = true;
    try {
      if (!window.supabase) await cargarScript(BASE + 'supabase.min.js');
      if (!window.faroSb) await cargarScript(BASE + 'auth.js');
    } catch (e) { return null; }
    return window.faroSb || null;
  }

  async function usuarioActual() {
    const c = sb();
    if (!c || !c.auth) return null;
    try {
      const { data } = await c.auth.getSession();
      return (data && data.session && data.session.user) ? data.session.user : null;
    } catch (e) { return null; }
  }

  function aFila(m, uid) {
    return {
      id: m.id, user_id: uid, mision: MISION,
      zona: m.l, parrafo: m.p, ini: m.i, fin: m.f,
      texto: m.t, color: m.c, nota: m.n || '',
      borrada: !!m.del, actualizado: m.u || 0, fecha: m.fecha || null,
    };
  }
  function deFila(f) {
    return {
      id: f.id, l: f.zona, p: f.parrafo, i: f.ini, f: f.fin,
      t: f.texto, c: f.color, n: f.nota || '', del: !!f.borrada,
      u: Number(f.actualizado) || 0, fecha: f.fecha || '',
    };
  }

  /* La fusión. Regla general: gana la versión más reciente. Con UNA
     excepción, que es la que de verdad importa: si las dos versiones
     tienen NOTA y son distintas, las dos notas se conservan juntas en
     vez de que la vieja se pierda. El subrayado se vuelve a hacer en dos
     segundos; lo que alguien escribió con sus palabras, no. */
  function fusionar(local, remota) {
    if (!local) return remota;
    if (!remota) return local;
    const nuevo = (local.u || 0) >= (remota.u || 0) ? Object.assign({}, local) : Object.assign({}, remota);
    const na = (local.n || '').trim(), nb = (remota.n || '').trim();
    if (na && nb && na !== nb) {
      nuevo.n = (nuevo.n === na ? na + '\n' + nb : nb + '\n' + na);
      nuevo.u = Math.max(local.u || 0, remota.u || 0);
    }
    return nuevo;
  }

  let sincronizando = false;
  async function sincronizar(manual) {
    if (sincronizando) return;
    const c = await asegurarCliente(!!manual);
    if (!c) { estadoNube = haySesionGuardada() ? 'error' : 'sin-sesion'; pintarEstado(); return; }
    const u = await usuarioActual();
    if (!u) { estadoNube = 'sin-sesion'; pintarEstado(); return; }
    sincronizando = true;
    estadoNube = 'subiendo'; pintarEstado();
    try {
      /* 1. Bajar lo que hay en la nube para ESTA misión y ESTE usuario.
            Son decenas de filas: se traen todas y se fusiona en el
            aparato, que es más simple y más seguro que llevar la cuenta
            de qué cambió desde cuándo. */
      const { data, error } = await c.from('lecturas_marcas')
        .select('*').eq('mision', MISION).eq('user_id', u.id);
      if (error) throw error;
      const remotas = (data || []).map(deFila);

      /* 2. Fusionar por identificador. */
      const porId = {};
      marcas.forEach(m => { porId[m.id] = m; });
      const subir = [];
      remotas.forEach(r => {
        const l = porId[r.id];
        const f = fusionar(l, r);
        porId[r.id] = f;
        /* Si lo fusionado no es igual que lo que hay arriba, hay que
           volver a subirlo. */
        if (!l || (f.u || 0) > (r.u || 0) || (f.n || '') !== (r.n || '')) subir.push(f);
      });
      /* Lo que solo existe aquí sube entero. */
      Object.keys(porId).forEach(id => {
        if (!remotas.find(r => r.id === id)) subir.push(porId[id]);
      });
      marcas = Object.keys(porId).map(id => porId[id]);

      /* 3. Subir. El upsert usa el mismo identificador que nació en el
            aparato, así que reintentar no duplica nada. */
      if (subir.length) {
        const { error: e2 } = await c.from('lecturas_marcas')
          .upsert(subir.map(m => aFila(m, u.id)), { onConflict: 'id' });
        if (e2) throw e2;
      }
      guardar(); pintarTodo();
      estadoNube = 'al-dia'; ultimaNube = ahora();
      if (manual) aviso('☁️ Marcas sincronizadas');
    } catch (e) {
      estadoNube = 'error';
      if (manual) aviso('⚠️ No se pudo sincronizar: ' + (e && e.message ? e.message : 'sin conexión'));
    } finally {
      sincronizando = false;
      pintarEstado();
    }
  }

  /* Se sincroniza con un respiro después de cada cambio: quien subraya
     tres frases seguidas no debe provocar tres viajes a la nube. */
  function pedirNube() {
    clearTimeout(temporizadorNube);
    temporizadorNube = setTimeout(() => sincronizar(false), 2500);
  }

  function textoEstado() {
    if (estadoNube === 'al-dia')     return '☁️ Guardado también en la nube';
    if (estadoNube === 'subiendo')   return '☁️ Sincronizando...';
    if (estadoNube === 'sin-sesion') return '📴 Solo en este aparato: entra en F.A.R.O para que viaje';
    if (estadoNube === 'error')      return '⚠️ Guardado aquí; la nube no respondió, se reintenta solo';
    return '📴 Solo en este aparato';
  }
  function pintarEstado() {
    const e = document.getElementById('fmEstado');
    if (e) e.textContent = textoEstado();
  }

  /* ─────────────── El panel ─────────────── */
  function leyendaHTML(conCuenta) {
    return '<div class="fm-leyenda">' + CATS.map(c => {
      const n = conCuenta ? vivas().filter(m => m.c === c.id).length : 0;
      return '<span class="fm-ley-item fm-ley-' + c.id + '">'
        + '<span class="fm-ley-muestra" aria-hidden="true">' + c.ini + '</span>'
        + '<span>' + c.nombre + '<span style="opacity:.65;font-weight:600;"> · ' + c.ayuda + '</span></span>'
        + (conCuenta ? '<span class="fm-ley-cuenta">' + n + '</span>' : '')
        + '</span>';
    }).join('') + '</div>';
  }

  function construirPanel() {
    if (document.getElementById('fmPanel')) return;
    const zs = zonas();
    if (!zs.length) return;

    /* La leyenda va ARRIBA, en la primera tarjeta de la primera zona: el
       código de colores hay que conocerlo ANTES de subrayar, no después. */
    const intro = zs[0].raiz.querySelector('.card');
    if (intro && !intro.querySelector('.fm-leyenda')) {
      const caja = document.createElement('div');
      caja.innerHTML =
        '<p style="font-size:0.88rem;margin:10px 0 2px;"><strong>🖍️ Se puede subrayar y anotar.</strong> '
        + 'Selecciona cualquier trozo y elige de qué tipo es. '
        + 'Lo marcado y las notas <strong>se guardan y viajan contigo a cualquier aparato</strong>. '
        + 'Para cambiar o quitar una marca, tócala.</p>'
        + leyendaHTML(false)
        + '<p style="font-size:0.8rem;color:var(--gray,#64748b);margin-top:2px;">'
        + 'Cada marca lleva su color, su trama de subrayado y su inicial volada, las tres cosas: '
        + 'así la hoja se entiende igual fotocopiada en blanco y negro.</p>';
      intro.appendChild(caja);
    }

    const panel = document.createElement('div');
    panel.className = 'card ac-teal'; panel.id = 'fmPanel';
    panel.innerHTML =
      '<h2>🖍️ Mis marcas y mis notas</h2>'
      + '<p class="fm-estado" id="fmEstado">' + textoEstado() + '</p>'
      + '<div id="fmPanelCuerpo"></div>'
      + '<div class="fm-acciones" style="margin-top:10px;">'
      + '<button type="button" class="fm-acc" id="fmBtnImprimeMarcas">🖨️ Imprimir solo mis marcas</button>'
      + '<button type="button" class="fm-acc" id="fmBtnNube">☁️ Sincronizar ahora</button>'
      + '<button type="button" class="fm-acc fm-acc-quita" id="fmBtnVacia">🗑 Borrar todas</button>'
      + '</div>';

    /* Dónde vive el panel: antes de las preguntas de las lecturas si las
       hay (que es donde se repasa), y si no, al final de Recursos, que
       es la última sección de toda misión. */
    const sec = document.getElementById('s-lecturas');
    const preguntas = sec ? [...sec.querySelectorAll('.card')].find(c => /Preguntas de las/i.test(c.textContent)) : null;
    if (preguntas) preguntas.parentNode.insertBefore(panel, preguntas);
    else {
      const rec = document.getElementById('s-recursos');
      if (rec) rec.appendChild(panel);
      else zs[zs.length - 1].raiz.appendChild(panel);
    }

    document.getElementById('fmBtnVacia').addEventListener('click', () => {
      const n = vivas().length;
      if (!n) return aviso('No hay marcas que borrar');
      if (!confirm('Se van a borrar las ' + n + ' marcas y sus notas de esta misión, también en los demás aparatos. Esto no se puede deshacer. ¿Seguro?')) return;
      vivas().forEach(m => { m.del = true; m.u = ahora(); });
      guardar(); pintarTodo(); pedirNube(); aviso('Marcas borradas');
    });
    document.getElementById('fmBtnImprimeMarcas').addEventListener('click', imprimirSoloMarcas);
    document.getElementById('fmBtnNube').addEventListener('click', () => sincronizar(true));
  }

  function pintarPanel() {
    const cuerpo = document.getElementById('fmPanelCuerpo');
    if (!cuerpo) return;
    pintarEstado();
    const lista = vivas();

    if (!lista.length) {
      cuerpo.innerHTML = leyendaHTML(true)
        + '<p class="fm-vacio">Todavía no hay nada marcado. Selecciona un trozo de cualquier texto de esta misión y elige de qué tipo es.</p>';
      return;
    }
    const orden = zonas().map(z => z.clave);
    const titulos = {}; zonas().forEach(z => { titulos[z.clave] = z.titulo; });
    const ordenadas = lista.slice().sort((a, b) =>
      (orden.indexOf(a.l) - orden.indexOf(b.l)) || (a.p - b.p) || (a.i - b.i));

    let html = leyendaHTML(true);
    let zonaActual = null;
    html += '<div class="fm-lista">';
    ordenadas.forEach(m => {
      if (m.l !== zonaActual) {
        zonaActual = m.l;
        html += '<h3 style="font-size:0.9rem;margin-top:8px;">📖 ' + esc(titulos[m.l] || m.l) + '</h3>';
      }
      const c = PORID[m.c] || CATS[0];
      html += '<div class="fm-item fm-item-' + m.c + (m.huerfana ? ' fm-item-huerfana' : '') + '">'
        + '<div class="fm-item-cab"><span>' + c.ini + ' · ' + c.nombre + (m.num ? ' · nota ' + m.num : '') + '</span>'
        + '<span>' + esc(m.fecha || '') + '</span></div>'
        + '<div class="fm-item-txt">«' + esc(m.t) + '»</div>'
        + (m.n ? '<div class="fm-item-nota">✎ ' + esc(m.n) + '</div>' : '')
        + (m.huerfana ? '<div class="fm-item-aviso">⚠️ Este trozo ya no está en el texto (la misión se corrigió). La nota se conserva aquí.</div>' : '')
        + '<div class="fm-item-btns">'
        + (m.huerfana ? '' : '<button type="button" class="fm-mini" data-ir="' + m.id + '">📍 Ir</button>')
        + '<button type="button" class="fm-mini" data-nota="' + m.id + '">✎ ' + (m.n ? 'Editar nota' : 'Añadir nota') + '</button>'
        + '<button type="button" class="fm-mini" data-quita="' + m.id + '">🗑 Quitar</button>'
        + '</div></div>';
    });
    html += '</div>';
    cuerpo.innerHTML = html;

    cuerpo.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => irA(b.dataset.ir)));
    cuerpo.querySelectorAll('[data-nota]').forEach(b => b.addEventListener('click', () => {
      editando = b.dataset.nota; abrirNota();
    }));
    cuerpo.querySelectorAll('[data-quita]').forEach(b => b.addEventListener('click', () => quitarMarca(b.dataset.quita)));
  }

  function irA(id) {
    const mk = document.querySelector('[data-fm-id="' + id + '"]');
    if (!mk) return aviso('Esa marca ya no está en el texto');
    /* En estas misiones cada sección es una pestaña: si la marca está en
       otra, primero hay que cambiar de sección o el desplazamiento no
       lleva a ninguna parte. */
    const sec = mk.closest('.sec');
    if (sec && !sec.classList.contains('active') && typeof go === 'function') {
      try { go(sec.id); } catch (e) {}
    }
    setTimeout(() => {
      mk.scrollIntoView({ behavior: 'smooth', block: 'center' });
      mk.style.outline = '3px solid var(--pri, #2563eb)';
      setTimeout(() => { mk.style.outline = ''; }, 1600);
    }, 120);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ─────────────── Lo que se lleva la impresora ───────────────
     Estas funciones las llaman los impresores de cada misión que tenga
     lecturas. Las demás usan la hoja de repaso de aquí abajo. */

  function cssImpresion() {
    let css = '\n/* Marcador */\n'
      /* Sin esto, el navegador se come los fondos al imprimir y todo el
         subrayado desaparece: es el ajuste que obliga a respetar el
         color. La trama y la inicial siguen valiendo aunque falle. */
      + 'mark.fm-hl{-webkit-print-color-adjust:exact;print-color-adjust:exact;color:#111;padding:0 0.3mm;border-radius:0.5mm;}\n'
      + 'mark.fm-hl-fin::after{content:attr(data-ini);font-size:0.62em;font-weight:bold;vertical-align:super;margin-left:0.3mm;}\n'
      + 'mark.fm-hl-nota.fm-hl-fin::after{content:attr(data-ini) " ✎" attr(data-n);}\n';
    Object.keys(IMPR).forEach(k => {
      css += 'mark.fm-hl-' + k + '{background:' + IMPR[k].bg + ';' + IMPR[k].sub + '}\n'
        + 'mark.fm-hl-' + k + '.fm-hl-fin::after{color:' + IMPR[k].fw + ';}\n';
    });
    css += '.fm-ap{page-break-before:always;}\n'
      + '.fm-ap h2{margin-bottom:2mm;}\n'
      + '.fm-ley{border:0.8pt solid #999;border-radius:1.5mm;padding:2mm 2.5mm;margin-bottom:3mm;font-family:Arial,Helvetica,sans-serif;font-size:8.5pt;line-height:1.5;}\n'
      + '.fm-ley b{display:inline-block;min-width:4mm;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:0 0.6mm;}\n'
      + '.fm-nota{border-left:2pt solid #999;padding:1mm 0 1mm 2.5mm;margin-bottom:2.5mm;font-family:Arial,Helvetica,sans-serif;font-size:9pt;line-height:1.45;}\n'
      + '.fm-nota .fm-cita{font-style:italic;color:#333;}\n'
      + '.fm-nota .fm-txt{margin-top:0.8mm;}\n'
      + '.fm-nota .fm-cab{font-weight:bold;font-size:8pt;text-transform:uppercase;letter-spacing:0.02em;color:#555;}\n';
    return css;
  }

  function leyendaImpresa() {
    return '<div class="fm-ley"><strong>Código de colores de la casa:</strong> '
      + CATS.map(c => '<b style="background:' + IMPR[c.id].bg + ';' + IMPR[c.id].sub + '">'
        + c.ini + '</b> ' + c.nombre + ' (' + c.ayuda + ')').join(' · ')
      + '. Cada marca lleva color, trama de subrayado e inicial volada, para que la hoja se entienda también fotocopiada en blanco y negro.</div>';
  }

  /* Devuelve la hoja final con la leyenda y las notas. `claves` es la
     lista de zonas que se están imprimiendo, o nada para todas. Si no
     hay ninguna marca devuelve cadena vacía, y entonces el documento
     sale exactamente como salía antes de que esto existiera. */
  function impresionExtra(claves) {
    const suyas = vivas().filter(m => !claves || claves.indexOf(m.l) >= 0);
    if (!suyas.length) return '';
    const orden = zonas().map(z => z.clave);
    const titulos = {}; zonas().forEach(z => { titulos[z.clave] = z.titulo; });
    const conNota = suyas.filter(m => m.n).sort((a, b) => (a.num || 0) - (b.num || 0));
    const ordenadas = suyas.slice().sort((a, b) =>
      (orden.indexOf(a.l) - orden.indexOf(b.l)) || (a.p - b.p) || (a.i - b.i));

    let h = '<div class="fm-ap"><h2>🖍️ Mis marcas y mis notas</h2>';
    h += leyendaImpresa();
    h += '<div class="fm-nota"><span class="fm-cab">Resumen</span><div class="fm-txt">'
      + CATS.map(c => {
          const n = suyas.filter(m => m.c === c.id).length;
          return c.ini + ' ' + c.nombre + ': ' + n;
        }).join(' · ')
      + ' · Total: ' + suyas.length + (conNota.length ? ' · Con nota escrita: ' + conNota.length : '')
      + '</div></div>';

    if (conNota.length) {
      h += '<div class="fm-ley" style="border:0;padding:0;margin:4mm 0 2mm;"><strong>Notas escritas</strong> (el número es el que va volado en el texto):</div>';
      conNota.forEach(m => {
        const c = PORID[m.c] || CATS[0];
        h += '<div class="fm-nota"><span class="fm-cab">' + esc(String(m.num)) + '. ' + c.ini + ' ' + c.nombre
          + ' · ' + esc(titulos[m.l] || m.l) + (m.fecha ? ' · ' + esc(m.fecha) : '') + '</span>'
          + '<div class="fm-cita">«' + esc(m.t) + '»</div>'
          + '<div class="fm-txt">' + esc(m.n).replace(/\n/g, '<br>') + '</div></div>';
      });
    }

    const sinNota = ordenadas.filter(m => !m.n);
    if (sinNota.length) {
      h += '<div class="fm-ley" style="border:0;padding:0;margin:4mm 0 2mm;"><strong>Lo subrayado sin nota</strong></div>';
      let zact = null;
      sinNota.forEach(m => {
        if (m.l !== zact) { zact = m.l; h += '<div class="fm-nota" style="border:0;padding-left:0;"><span class="fm-cab">' + esc(titulos[m.l] || m.l) + '</span></div>'; }
        const c = PORID[m.c] || CATS[0];
        h += '<div class="fm-nota"><span class="fm-cab">' + c.ini + ' ' + c.nombre + '</span>'
          + '<div class="fm-cita">«' + esc(m.t) + '»</div></div>';
      });
    }
    return h + '</div>';
  }

  /* Imprimir SOLO las marcas, sin los textos: es la hoja de repaso, la
     que cabe en un bolsillo antes de un examen. Se arma aquí y no en la
     misión porque no necesita nada de ella salvo el nombre, y así vale
     igual para las misiones que no tienen impresores de lecturas. */
  function imprimirSoloMarcas() {
    if (!vivas().length) return aviso('No hay marcas que imprimir');
    sonido('click');
    const titulo = (document.title || 'Misión').split('·')[0].trim();
    const doc = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">'
      + '<title>Mis marcas · ' + esc(titulo) + '</title><style>'
      + '@page{size:letter;margin:16mm 15mm;}*{margin:0;padding:0;box-sizing:border-box;}'
      + 'body{font-family:Georgia,serif;font-size:11pt;line-height:1.5;color:#111;}'
      + 'h1{font-family:Arial,sans-serif;font-size:14pt;margin-bottom:2mm;}'
      + '.sub{font-family:Arial,sans-serif;font-size:9pt;color:#555;border-bottom:1pt solid #999;padding-bottom:1.5mm;margin-bottom:3mm;}'
      + '.fm-ap{page-break-before:auto;}'
      + cssImpresion()
      + '</style></head><body>'
      + '<h1>🖍️ Mis marcas y mis notas</h1>'
      + '<div class="sub">' + esc(titulo) + ' · Hoja de repaso · ' + hoy() + '</div>'
      + impresionExtra(null).replace('page-break-before:always', '')
      + '</body></html>';
    const win = window.open('', '_blank', '');
    if (!win) return aviso('⚠️ Activa las ventanas emergentes para imprimir');
    win.document.write(doc); win.document.close();
    setTimeout(() => win.print(), 400);
  }

  /* ─────────────── Utilidades de la casa ─────────────── */
  function sonido(cual) { try { if (typeof sfx === 'function') sfx(cual); } catch (e) {} }
  function aviso(txt) {
    try { if (typeof showToast === 'function') { showToast(txt); return; } } catch (e) {}
  }

  /* ─────────────── Arranque ─────────────── */
  function iniciar() {
    if (arrancado) return;
    if (!zonas().length) return;   /* misión sin prosa marcable: no estorba */
    arrancado = true;
    MISION = claveDeMision();
    CLAVE = MISION + '_marcas';
    cargar();
    construirPanel();
    reanclar();
    pintarTodo();

    /* La nube, en cuanto se pueda. La sesión de Supabase se restaura de
       forma asíncrona, así que el primer intento va con un respiro y, si
       todavía no hay sesión, se reintenta cuando la haya. */
    setTimeout(() => {
      sincronizar(false).then(() => {
        const c = sb();
        if (c && c.auth && c.auth.onAuthStateChange) {
          c.auth.onAuthStateChange((evento) => {
            if (evento === 'SIGNED_IN' || evento === 'TOKEN_REFRESHED') sincronizar(false);
          });
        }
      });
    }, 1200);
    /* Al volver la señal se sube lo que quedó pendiente. */
    window.addEventListener('online', () => sincronizar(false));

    /* La barra se abre al soltar la selección. Se usa selectionchange
       con un respiro porque en el teléfono la selección se ajusta varias
       veces mientras se arrastran los tiradores, y abrir la barra en
       cada ajuste la haría parpadear. */
    let temporizador = null;
    document.addEventListener('selectionchange', () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => {
        if (editando) return;
        const s = leerSeleccion();
        if (s) { seleccion = s; abrirBarra(s.t, null, false); }
        else if (!editando && seleccion) { seleccion = null; cerrarBarra(); }
      }, 260);
    });

    /* Tocar una marca ya puesta la abre para cambiarle el color, ponerle
       nota o quitarla. */
    document.addEventListener('click', e => {
      const mk = e.target.closest ? e.target.closest('.fm-hl') : null;
      if (mk) {
        e.preventDefault();
        const m = marcas.find(x => x.id === mk.getAttribute('data-fm-id'));
        if (!m) return;
        seleccion = null; editando = m.id;
        abrirBarra(m.t, m.c, true);
        return;
      }
      /* Tocar fuera cierra, salvo que se esté tocando la propia barra. */
      if (!e.target.closest || (!e.target.closest('.fm-barra') && !e.target.closest('.fm-modal'))) {
        if (editando) cerrarBarra();
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { cerrarNota(); cerrarBarra(); }
      /* Con teclado, una marca se abre con Enter igual que con el dedo. */
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('fm-hl')) {
        e.preventDefault(); e.target.click();
      }
    });
  }

  window.FaroMarcador = {
    cssImpresion: cssImpresion,
    impresionExtra: impresionExtra,
    leyendaImpresa: leyendaImpresa,
    categorias: CATS,
    marcas: function () { return vivas().slice(); },
    todas: function () { return marcas.slice(); },
    zonas: function () { return zonas().map(z => ({ clave: z.clave, titulo: z.titulo, parrafos: z.parrafos.length })); },
    estadoNube: function () { return estadoNube; },
    sincronizar: sincronizar,
    repintar: pintarTodo,
    iniciar: iniciar,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
