'use strict';
/* ══════════════════════════════════════════════════════════════════
   EL MARCADOR DE LECTURAS · subrayar, anotar y que salga impreso
   ══════════════════════════════════════════════════════════════════

   Aparato COMPARTIDO por todas las misiones que tienen sección de
   Lecturas (norma 5-quinquies). Se carga después del JS de la misión y
   se engancha solo: no hay que configurarlo por misión, porque lee del
   documento lo que necesita (las tarjetas «lect-*» y sus párrafos) y
   guarda con la clave de progreso de la misión, que ya es única.

   POR QUÉ EXISTE. Las cinco lecturas de cada etapa son textos largos
   que se estudian, no que se hojean, y hasta hoy la única manera de
   marcarlas era imprimirlas y sacar el lápiz. Quien lee en el teléfono
   se quedaba sin subrayar, es decir sin la mitad del oficio de leer.

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
   y una lectura sin ninguna marca azul se delata sola.

   POR QUÉ CADA MARCA LLEVA ADEMÁS TRAMA E INICIAL. Porque esto se
   imprime y se fotocopia, y en blanco y negro cinco colores son cinco
   grises iguales. Con la trama del subrayado y la inicial volada, la
   hoja fotocopiada sigue diciendo qué es cada cosa. Vale igual para
   quien no distingue bien los colores.
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
     de la aplicación, así que necesita sus valores dentro. */
  /* `sub` es la declaración entera del subrayado, no solo su grosor,
     porque las cinco tramas tienen que ser DISTINTAS entre sí y no todas
     caben en un border-bottom: Idea va ondulada. Cinco tramas iguales de
     dos en dos convierten la fotocopia en un adivinanza. */
  const IMPR = {
    dato:   { bg: '#fef08a', fw: '#a16207', sub: 'border-bottom:1pt solid #a16207;' },
    voz:    { bg: '#bbf7d0', fw: '#15803d', sub: 'border-bottom:2.4pt double #15803d;' },
    idea:   { bg: '#fecaca', fw: '#b91c1c', sub: 'text-decoration:underline wavy #b91c1c;text-underline-offset:2px;' },
    contra: { bg: '#bfdbfe', fw: '#1d4ed8', sub: 'border-bottom:1.4pt dotted #1d4ed8;' },
    duda:   { bg: '#e9d5ff', fw: '#7e22ce', sub: 'border-bottom:1.4pt dashed #7e22ce;' },
  };

  let CLAVE = 'faro_lecturas';      /* clave de localStorage */
  let marcas = [];                  /* el modelo entero */
  let ORIG = new Map();             /* HTML original de cada párrafo */
  let seleccion = null;             /* selección viva, aún sin marcar */
  let editando = null;              /* id de la marca que se está tocando */
  let arrancado = false;

  /* ─────────────── Guardado ───────────────
     Se usa la MISMA clave de progreso de la misión con un sufijo, que es
     como guarda todo lo demás la casa: ni un almacén nuevo ni una base
     de datos. Las marcas son del aparato donde se leyó, igual que el
     progreso, y no viajan a la nube a propósito: una nota de lectura es
     lo más privado que escribe un estudiante. */
  function claveDeMision() {
    try { if (typeof SAVE_KEY !== 'undefined' && SAVE_KEY) return SAVE_KEY + '_marcas'; } catch (e) {}
    return 'faro_lecturas_marcas';
  }
  function cargar() {
    try {
      const c = JSON.parse(localStorage.getItem(CLAVE));
      marcas = Array.isArray(c) ? c : [];
    } catch (e) { marcas = []; }
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(marcas)); }
    catch (e) { aviso('⚠️ No se pudo guardar la marca'); }
  }
  function nuevoId() {
    return 'm' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }

  /* ─────────────── El documento ─────────────── */
  function lecturas() {
    return [...document.querySelectorAll('#s-lecturas .card[id^="lect-"]')].map(card => ({
      clave: card.id.replace(/^lect-/, ''),
      titulo: tituloDe(card),
      card: card,
      parrafos: [...card.querySelectorAll('.lect-p')],
    }));
  }
  function tituloDe(card) {
    const h = card.querySelector('h2');
    if (!h) return card.id;
    /* El h2 trae «🌀 Lectura 1 · «Los subrayados de mi padre» (cuento,
       a la manera de Borges)». Para el panel y para el papel basta el
       título entre comillas, que es como la llama quien la leyó. */
    const m = h.textContent.match(/«([^»]+)»/);
    return m ? m[1] : h.textContent.replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ]+/, '').trim();
  }
  function lecturaDe(clave) { return lecturas().find(l => l.clave === clave) || null; }

  /* ─────────────── Pintado ───────────────
     Se repinta SIEMPRE desde el HTML original del párrafo y se vuelven a
     aplicar todas sus marcas. Es más trabajo que ir quitando y poniendo
     etiquetas sueltas, y es la única manera de que no queden restos
     cuando dos marcas se tocan: el estado de la pantalla sale del
     modelo, nunca al revés. */
  function pintarTodo() {
    renumerarNotas();
    lecturas().forEach(l => {
      l.parrafos.forEach((p, i) => {
        if (!ORIG.has(p)) ORIG.set(p, p.innerHTML);
        p.innerHTML = ORIG.get(p);
        const texto = p.textContent;
        const suyas = marcas
          .filter(m => m.l === l.clave && m.p === i && !m.huerfana)
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
    const orden = lecturas().map(l => l.clave);
    let n = 0;
    marcas
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
    lecturas().forEach(l => {
      const textos = l.parrafos.map(p => p.textContent);
      marcas.filter(m => m.l === l.clave).forEach(m => {
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
    const p = nodo && nodo.closest ? nodo.closest('.lect-p') : null;
    if (!p) return null;
    const card = p.closest('.card[id^="lect-"]');
    if (!card) return null;
    const l = lecturaDe(card.id.replace(/^lect-/, ''));
    if (!l) return null;
    const idx = l.parrafos.indexOf(p);
    if (idx < 0) return null;
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
    return { l: l.clave, p: idx, i: ini, f: ini + texto.length, t: texto };
  }

  /* ─────────────── Crear, cambiar, borrar ─────────────── */
  function marcarCon(cat) {
    if (editando) {
      const m = marcas.find(x => x.id === editando);
      if (m) { m.c = cat; guardar(); pintarTodo(); }
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
    const cruzadas = marcas.filter(m => m.l === s.l && m.p === s.p && m.i < s.f && m.f > s.i);
    const notaHeredada = cruzadas.map(m => m.n).filter(Boolean).join('\n');
    marcas = marcas.filter(m => cruzadas.indexOf(m) < 0);
    marcas.push({ id: nuevoId(), l: s.l, p: s.p, i: s.i, f: s.f, t: s.t, c: cat,
                  n: notaHeredada, fecha: hoy() });
    guardar(); pintarTodo(); cerrarBarra(); limpiarSeleccion();
    sonido('ok');
    aviso(PORID[cat].ini + ' ' + PORID[cat].nombre + ': marcado');
  }

  function quitarMarca(id) {
    const m = marcas.find(x => x.id === id);
    if (m && m.n && !confirm('Esta marca tiene una nota escrita. ¿Se quita igual?')) return;
    marcas = marcas.filter(x => x.id !== id);
    guardar(); pintarTodo(); cerrarBarra();
    sonido('click');
  }

  function hoy() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
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

  let notaPara = null;   /* id de marca, o el objeto de selección pendiente */

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
      if (m) m.n = valor;
    } else if (notaPara && notaPara.pendiente) {
      const s = notaPara.pendiente;
      const cruzadas = marcas.filter(m => m.l === s.l && m.p === s.p && m.i < s.f && m.f > s.i);
      marcas = marcas.filter(m => cruzadas.indexOf(m) < 0);
      marcas.push({ id: nuevoId(), l: s.l, p: s.p, i: s.i, f: s.f, t: s.t, c: 'duda',
                    n: valor, fecha: hoy() });
    }
    guardar(); pintarTodo(); cerrarNota(); cerrarBarra(); limpiarSeleccion();
    sonido('ok'); aviso('✎ Nota guardada');
  }

  /* ─────────────── El panel ─────────────── */
  function leyendaHTML(conCuenta) {
    return '<div class="fm-leyenda">' + CATS.map(c => {
      const n = conCuenta ? marcas.filter(m => m.c === c.id).length : 0;
      return '<span class="fm-ley-item fm-ley-' + c.id + '">'
        + '<span class="fm-ley-muestra" aria-hidden="true">' + c.ini + '</span>'
        + '<span>' + c.nombre + '<span style="opacity:.65;font-weight:600;"> · ' + c.ayuda + '</span></span>'
        + (conCuenta ? '<span class="fm-ley-cuenta">' + n + '</span>' : '')
        + '</span>';
    }).join('') + '</div>';
  }

  function construirPanel() {
    if (document.getElementById('fmPanel')) return;
    const sec = document.getElementById('s-lecturas');
    if (!sec) return;

    /* La leyenda va ARRIBA, dentro de la tarjeta de presentación: el
       código de colores hay que conocerlo ANTES de subrayar, no después.
       El panel con lo marcado va abajo, junto a las preguntas, que es
       donde se repasa. */
    const intro = sec.querySelector('.card');
    if (intro && !intro.querySelector('.fm-leyenda')) {
      const caja = document.createElement('div');
      caja.innerHTML =
        '<p style="font-size:0.88rem;margin:10px 0 2px;"><strong>🖍️ Se puede subrayar y anotar.</strong> '
        + 'Selecciona cualquier trozo de las lecturas y elige de qué tipo es. '
        + 'Lo marcado y las notas <strong>se guardan en este aparato y salen impresos</strong> con el texto. '
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
      + '<div id="fmPanelCuerpo"></div>'
      + '<div class="fm-acciones" style="margin-top:10px;">'
      + '<button type="button" class="fm-acc" id="fmBtnImprimeMarcas">🖨️ Imprimir solo mis marcas</button>'
      + '<button type="button" class="fm-acc fm-acc-quita" id="fmBtnVacia">🗑 Borrar todas</button>'
      + '</div>';
    /* Antes de la tarjeta de preguntas si existe; si no, al final. */
    const preguntas = [...sec.querySelectorAll('.card')].find(c => /Preguntas de las/i.test(c.textContent));
    if (preguntas) sec.insertBefore(panel, preguntas); else sec.appendChild(panel);

    document.getElementById('fmBtnVacia').addEventListener('click', () => {
      if (!marcas.length) return aviso('No hay marcas que borrar');
      if (!confirm('Se van a borrar las ' + marcas.length + ' marcas y sus notas de esta misión. Esto no se puede deshacer. ¿Seguro?')) return;
      marcas = []; guardar(); pintarTodo(); aviso('Marcas borradas');
    });
    document.getElementById('fmBtnImprimeMarcas').addEventListener('click', imprimirSoloMarcas);
  }

  function pintarPanel() {
    const cuerpo = document.getElementById('fmPanelCuerpo');
    if (!cuerpo) return;
    const intro = document.querySelector('#s-lecturas .card .fm-leyenda');
    if (intro) intro.outerHTML = leyendaHTML(false);   /* la de arriba nunca lleva cuenta */

    if (!marcas.length) {
      cuerpo.innerHTML = leyendaHTML(true)
        + '<p class="fm-vacio">Todavía no hay nada marcado. Selecciona un trozo de cualquiera de las cinco lecturas y elige de qué tipo es.</p>';
      return;
    }
    const orden = lecturas().map(l => l.clave);
    const titulos = {}; lecturas().forEach(l => { titulos[l.clave] = l.titulo; });
    const ordenadas = marcas.slice().sort((a, b) =>
      (orden.indexOf(a.l) - orden.indexOf(b.l)) || (a.p - b.p) || (a.i - b.i));

    let html = leyendaHTML(true);
    let lecturaActual = null;
    html += '<div class="fm-lista">';
    ordenadas.forEach(m => {
      if (m.l !== lecturaActual) {
        lecturaActual = m.l;
        html += '<h3 style="font-size:0.9rem;margin-top:8px;">📖 ' + esc(titulos[m.l] || m.l) + '</h3>';
      }
      const c = PORID[m.c] || CATS[0];
      html += '<div class="fm-item fm-item-' + m.c + (m.huerfana ? ' fm-item-huerfana' : '') + '">'
        + '<div class="fm-item-cab"><span>' + c.ini + ' · ' + c.nombre + (m.num ? ' · nota ' + m.num : '') + '</span>'
        + '<span>' + esc(m.fecha || '') + '</span></div>'
        + '<div class="fm-item-txt">«' + esc(m.t) + '»</div>'
        + (m.n ? '<div class="fm-item-nota">✎ ' + esc(m.n) + '</div>' : '')
        + (m.huerfana ? '<div class="fm-item-aviso">⚠️ Este trozo ya no está en la lectura (la misión se corrigió). La nota se conserva aquí.</div>' : '')
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
    mk.scrollIntoView({ behavior: 'smooth', block: 'center' });
    mk.style.transition = 'outline-color .2s';
    mk.style.outline = '3px solid var(--pri, #2563eb)';
    setTimeout(() => { mk.style.outline = ''; }, 1600);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ─────────────── Lo que se lleva la impresora ───────────────
     Estas tres funciones las llaman los impresores de cada misión. Se
     exponen en window.FaroMarcador porque el documento que se imprime
     se arma en el JS de la misión, no aquí. */

  function cssImpresion() {
    let css = '\n/* Marcador de lecturas */\n'
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
     lista de lecturas que se están imprimiendo, o nada para todas. Si no
     hay ninguna marca devuelve cadena vacía, y entonces el documento
     sale exactamente como salía antes de que esto existiera. */
  function impresionExtra(claves) {
    const suyas = marcas.filter(m => !claves || claves.indexOf(m.l) >= 0);
    if (!suyas.length) return '';
    const orden = lecturas().map(l => l.clave);
    const titulos = {}; lecturas().forEach(l => { titulos[l.clave] = l.titulo; });
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
      let lact = null;
      sinNota.forEach(m => {
        if (m.l !== lact) { lact = m.l; h += '<div class="fm-nota" style="border:0;padding-left:0;"><span class="fm-cab">' + esc(titulos[m.l] || m.l) + '</span></div>'; }
        const c = PORID[m.c] || CATS[0];
        h += '<div class="fm-nota"><span class="fm-cab">' + c.ini + ' ' + c.nombre + '</span>'
          + '<div class="fm-cita">«' + esc(m.t) + '»</div></div>';
      });
    }
    return h + '</div>';
  }

  /* Imprimir SOLO las marcas, sin los textos: es la hoja de repaso, la
     que cabe en un bolsillo antes de un examen. Se arma aquí y no en la
     misión porque no necesita nada de ella salvo el nombre. */
  function imprimirSoloMarcas() {
    if (!marcas.length) return aviso('No hay marcas que imprimir');
    sonido('click');
    const titulo = (document.title || 'Lecturas').split('·')[0].trim();
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
    if (!document.getElementById('s-lecturas')) return;   /* misión sin lecturas: no estorba */
    arrancado = true;
    CLAVE = claveDeMision();
    cargar();
    construirPanel();
    reanclar();
    pintarTodo();

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
    marcas: function () { return marcas.slice(); },
    repintar: pintarTodo,
    iniciar: iniciar,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
