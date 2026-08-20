'use strict';
/* ══════════════════════════════════════════════════════════════════
   EL APARATO DE LECTURAS · plegar, elegir, y examinarse en cada texto
   ══════════════════════════════════════════════════════════════════

   Aparato COMPARTIDO por las misiones del Estudio Mayor, como el
   marcador. Se carga ANTES de `js/lecturas-marcador.js` (que necesita el
   documento ya montado para saber cuáles son sus zonas) y DESPUÉS del JS
   de la misión (que es quien declara los bancos de preguntas).

   ── QUÉ ARREGLA, Y POR QUÉ ES UN APARATO Y NO CÓDIGO DE CADA MISIÓN ──
   Pedido por el autor el 20 de agosto de 2026, con las lecturas ya en
   seis por misión:

     1. «Que al haber tantas lecturas estas tengan la manera de
        desplegarse, que uno al abrirse estén sin desplegar y que uno
        pueda elegir una de las seis.» Seis textos largos abiertos de
        golpe son una sección de veinte pantallas de alto en un teléfono,
        y elegir uno era desplazarse a ciegas.
     2. «Que cada lectura tenga sus actividades de comprensión,
        completación y demás, que no estén al final de las seis sino en
        cada una.» Antes las tres baterías vivían juntas al final: quien
        acababa el cuento tenía que bajar hasta el fondo, buscar cuáles
        de las veinticinco preguntas eran las suyas y volver.

   Es la TERCERA excepción de la casa a la norma 1 (tres archivos propios
   por misión), y por el mismo motivo que `fichas/css/ficha.css` y que el
   marcador: esto no es contenido de una etapa, es un aparato de lectura
   que tiene que comportarse igual en todas. Copiado trece veces, a la
   tercera corrección ya no coincidirían.

   ── LO QUE CADA MISIÓN TIENE QUE PONER (y no es más que esto) ──────
     · sus tarjetas de lectura con id `lect-borges`, `lect-cervantes`,
       `lect-harari`, `lect-entrevista`, `lect-gala` y `lect-debate`,
       cada una con su <h2>, su <p class="lect-nota"> y sus
       <p class="lect-p">;
     · los tres bancos con la etiqueta `t` de la voz en CADA pregunta:
       `lectComprensionBank` (5 por voz), `lectCompletarBank` (2 por voz)
       y `lectAnalisisBank` (2 por voz).
   Todo lo demás (el plegado, el índice, las actividades de cada texto y
   las hojas impresas de sus preguntas) lo monta este archivo.
══════════════════════════════════════════════════════════════════ */

(function () {

  /* De la tarjeta a la etiqueta del banco. Se puede sobrescribir por
     tarjeta con data-voz, para el día que una misión traiga otra voz. */
  const VOZ = {
    borges: 'Borges',
    cervantes: 'Cervantes',
    harari: 'Harari',
    entrevista: 'Entrevista',
    gala: 'Quintero y Gala',
    debate: 'Debate',
  };

  /* Cuánto vale cada acierto. El análisis complejo va SIN XP a propósito
     (norma 5-quater): una respuesta abierta que se premia sola se
     contesta a la carrera, que es lo contrario de lo que se enseña. */
  const XP_ACIERTO = 2;

  const estado = new Map();   /* clave de lectura -> estado de sus tres baterías */
  let montado = false;

  /* ─────────────── Utilidades ─────────────── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function sonido(cual) { try { if (typeof sfx === 'function') sfx(cual); } catch (e) {} }
  function aviso(t) { try { if (typeof showToast === 'function') showToast(t); } catch (e) {} }
  function daXP(n) { try { if (typeof pts === 'function') pts(n); } catch (e) {} }
  function logro(id) { try { if (typeof unlockAchievement === 'function') unlockAchievement(id); } catch (e) {} }
  /* Los bancos son `const` del script de la misión: no cuelgan de window,
     pero sí están en el ámbito global, así que se leen por nombre con
     typeof delante. Si una misión no los trae, el aparato no estorba. */
  function banco(nombre) {
    try { return eval('typeof ' + nombre + ' !== "undefined" ? ' + nombre + ' : null') || []; }
    catch (e) { return []; }
  }
  function sinNumero(t) { return String(t == null ? '' : t).replace(/^\s*\d+\.\s*/, ''); }
  function normaliza(v) {
    return (v || '').toString().toLowerCase().normalize('NFD')
      .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/gi, '').trim();
  }

  function tarjetas() {
    return [...document.querySelectorAll('#s-lecturas .card[id^="lect-"]')];
  }
  function vozDe(card) {
    return card.dataset.voz || VOZ[card.id.replace(/^lect-/, '')] || card.id.replace(/^lect-/, '');
  }
  function tituloDe(card) {
    const h = card.querySelector('h2');
    if (!h) return card.id;
    const m = h.textContent.match(/«([^»]+)»/);
    return m ? m[1] : h.textContent.replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ¿]+/, '').trim();
  }
  function preguntasDe(card) {
    const v = vozDe(card);
    return {
      c: banco('lectComprensionBank').filter(q => q.t === v),
      f: banco('lectCompletarBank').filter(q => q.t === v),
      a: banco('lectAnalisisBank').filter(q => q.t === v),
    };
  }

  /* ─────────────── El plegado ───────────────
     Todas cerradas al abrir la sección, y en acordeón: abrir una cierra
     la anterior. Con seis textos largos, dejar varias abiertas devuelve
     el problema que esto viene a resolver. */
  function plegar(card, i, total) {
    if (card.querySelector('.lect-cuerpo')) return;
    const h2 = card.querySelector('h2');
    if (!h2) return;
    const clave = card.id.replace(/^lect-/, '');

    const cuerpo = document.createElement('div');
    cuerpo.className = 'lect-cuerpo';
    cuerpo.id = 'lect-cuerpo-' + clave;
    cuerpo.hidden = true;
    let n = h2.nextSibling;
    while (n) { const sig = n.nextSibling; cuerpo.appendChild(n); n = sig; }
    card.appendChild(cuerpo);

    const p = preguntasDe(card);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lect-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', cuerpo.id);
    btn.innerHTML =
      '<span class="lect-chevron" aria-hidden="true">▸</span>'
      + '<span class="lect-tit">' + h2.innerHTML + '</span>'
      + '<span class="lect-meta"><span class="lect-meta-n">' + (i + 1) + ' de ' + total + '</span>'
      + '<span class="lect-meta-p" data-cuenta="' + esc(clave) + '">'
      + (p.c.length + p.f.length + p.a.length) + ' preguntas</span></span>';
    h2.innerHTML = '';
    h2.className = (h2.className + ' lect-h2').trim();
    h2.appendChild(btn);
    btn.addEventListener('click', () => alternar(clave));

    montarActividades(card, cuerpo, clave, p);
  }

  function abrir(clave, silencio) {
    const card = document.getElementById('lect-' + clave) || document.getElementById(clave);
    if (!card) return false;
    tarjetas().forEach(otra => {
      if (otra === card) return;
      const c = otra.querySelector('.lect-cuerpo');
      const b = otra.querySelector('.lect-toggle');
      if (c) c.hidden = true;
      if (b) { b.setAttribute('aria-expanded', 'false'); otra.classList.remove('lect-abierta'); }
    });
    const cuerpo = card.querySelector('.lect-cuerpo');
    const btn = card.querySelector('.lect-toggle');
    if (!cuerpo || !btn) return false;
    cuerpo.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    card.classList.add('lect-abierta');
    if (!silencio) sonido('click');
    marcarIndice();
    return true;
  }
  function cerrar(clave) {
    const card = document.getElementById('lect-' + clave);
    if (!card) return;
    const cuerpo = card.querySelector('.lect-cuerpo');
    const btn = card.querySelector('.lect-toggle');
    if (cuerpo) cuerpo.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
    card.classList.remove('lect-abierta');
    marcarIndice();
  }
  function alternar(clave) {
    const card = document.getElementById('lect-' + clave);
    const cuerpo = card && card.querySelector('.lect-cuerpo');
    if (!cuerpo) return;
    if (cuerpo.hidden) { abrir(clave); irA(clave); } else cerrar(clave);
  }
  function irA(clave) {
    const card = document.getElementById('lect-' + clave);
    if (!card) return;
    setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  /* ─────────────── El índice ───────────────
     Seis botones y el de volver donde uno iba. Va antes de la primera
     lectura, que es donde se elige, no al final. */
  function montarIndice() {
    const sec = document.getElementById('s-lecturas');
    const cards = tarjetas();
    if (!sec || !cards.length || document.getElementById('lectIndice')) return;
    const panel = document.createElement('div');
    panel.className = 'card ac-gold'; panel.id = 'lectIndice';
    panel.innerHTML =
      '<h2>📚 Elige una lectura</h2>'
      + '<p style="font-size:0.88rem;margin-bottom:0.6rem;">Las ' + cards.length
      + ' están plegadas para que la sección quepa en una pantalla. Toca la que vayas a leer: '
      + 'se abre con <strong>su texto y sus propias preguntas</strong> debajo, y se cierra la anterior.</p>'
      + '<div class="lect-indice" role="list">'
      + cards.map((c, i) => {
          const clave = c.id.replace(/^lect-/, '');
          const p = preguntasDe(c);
          return '<button type="button" class="lect-ind-btn" role="listitem" data-va="' + esc(clave) + '">'
            + '<span class="lect-ind-n">' + (i + 1) + '</span>'
            + '<span class="lect-ind-t">' + esc(tituloDe(c)) + '</span>'
            + '<span class="lect-ind-v">' + esc(vozDe(c)) + ' · ' + (p.c.length + p.f.length + p.a.length) + ' preguntas</span>'
            + '</button>';
        }).join('')
      + '</div>'
      + '<div class="lect-ind-pie">'
      + '<button type="button" class="fm-acc fm-acc-lugar" id="lectBtnLugar">🔖 Seguir donde iba</button>'
      + '<button type="button" class="fm-acc" id="lectBtnCierra">🗂️ Plegarlas todas</button>'
      + '</div>';
    sec.insertBefore(panel, cards[0]);
    panel.querySelectorAll('[data-va]').forEach(b =>
      b.addEventListener('click', () => { abrir(b.dataset.va); irA(b.dataset.va); }));
    document.getElementById('lectBtnCierra').addEventListener('click', () => {
      tarjetas().forEach(c => cerrar(c.id.replace(/^lect-/, '')));
      sonido('click');
    });
    document.getElementById('lectBtnLugar').addEventListener('click', () => {
      if (window.FaroMarcador && FaroMarcador.irAlLugar) FaroMarcador.irAlLugar();
      else aviso('Todavía no hay marca de lectura');
    });
  }
  function marcarIndice() {
    document.querySelectorAll('.lect-ind-btn').forEach(b => {
      const card = document.getElementById('lect-' + b.dataset.va);
      const abierta = card && card.classList.contains('lect-abierta');
      b.classList.toggle('lect-ind-activa', !!abierta);
      b.setAttribute('aria-current', abierta ? 'true' : 'false');
    });
  }

  /* ─────────────── Las actividades de CADA lectura ───────────────
     Las tres baterías de la norma 5-quater, pero dentro del texto que
     examinan y filtradas por su voz. Se pintan con clases y no con id:
     hay seis juegos en la misma página y los id se pisarían.

     Los aciertos se apuntan en memoria, como hacía el motor viejo: el XP
     de la casa mide recorrido y ya se guarda en la clave de progreso de
     la misión, así que aquí solo hace falta no pagar dos veces lo mismo
     dentro de la sesión. */
  function montarActividades(card, cuerpo, clave, p) {
    if (!p.c.length && !p.f.length && !p.a.length) return;
    estado.set(clave, { c: 0, f: 0, a: 0, pagadas: new Set(), aciertos: 0, pauta: false });

    const caja = document.createElement('div');
    caja.className = 'lect-act';
    caja.innerHTML =
      '<h3 class="lect-act-tit">🧐 Preguntas de esta lectura</h3>'
      + '<p class="lect-act-sub">Se contestan <strong>con el texto arriba</strong>: no es un examen de memoria, '
      + 'es un examen de lectura. Las de análisis van sin XP a propósito.</p>'
      + (p.c.length ? bloque('c', '📖 Comprensión', p.c.length, 'Pregunta') : '')
      + (p.f.length ? bloque('f', '✏️ Completar', p.f.length, 'Oración') : '')
      + (p.a.length ? bloque('a', '🧠 Análisis complejo', p.a.length, 'Pregunta') : '')
      + '<div class="lect-act-btns">'
      + '<button type="button" class="fm-acc lect-imprime">🖨️ Imprimir esta lectura con sus preguntas</button>'
      + '</div>';
    cuerpo.appendChild(caja);

    caja.querySelector('.lect-imprime').addEventListener('click', () => {
      if (typeof imprimirLectura === 'function') imprimirLectura(clave);
      else aviso('Esta misión todavía no imprime sus lecturas');
    });
    pintaC(card, clave); pintaF(card, clave); pintaA(card, clave);
  }

  function bloque(b, titulo, n, palabra) {
    return '<div class="lect-bloque" data-b="' + b + '">'
      + '<h4>' + titulo + ' (' + n + ')</h4>'
      + '<p class="lect-prog" aria-live="polite">' + palabra + ' 1 de ' + n + '</p>'
      + '<div class="lect-enun"></div>'
      + '<div class="lect-opts" role="group"></div>'
      + '<div class="lect-btns"></div>'
      + '<div class="lect-fb" role="alert"></div>'
      + '</div>';
  }
  function bloqueDe(card, b) { return card.querySelector('.lect-bloque[data-b="' + b + '"]'); }
  function fb(card, b, msg, ok) {
    const el = bloqueDe(card, b).querySelector('.lect-fb');
    el.textContent = msg;
    el.className = 'lect-fb lect-fb-' + (ok ? 'ok' : 'no');
  }

  /* ── I. Comprensión: cuatro opciones, orden fijo (norma 4) ── */
  function pintaC(card, clave) {
    const caja = bloqueDe(card, 'c'); if (!caja) return;
    const banco = preguntasDe(card).c, st = estado.get(clave);
    const enun = caja.querySelector('.lect-enun'), opts = caja.querySelector('.lect-opts');
    if (st.c >= banco.length) {
      caja.querySelector('.lect-prog').textContent = 'Terminada';
      enun.innerHTML = '🎉 <strong>Las ' + banco.length + ' de esta lectura, contestadas.</strong>';
      opts.innerHTML = '';
      caja.querySelector('.lect-btns').innerHTML = '<button type="button" class="fm-acc lect-reinicia">🔄 Reiniciar</button>';
      caja.querySelector('.lect-reinicia').addEventListener('click', () => {
        st.c = 0; caja.querySelector('.lect-fb').textContent = ''; pintaC(card, clave);
      });
      return;
    }
    const q = banco[st.c];
    caja.querySelector('.lect-prog').textContent = 'Pregunta ' + (st.c + 1) + ' de ' + banco.length;
    enun.textContent = q.q;
    opts.innerHTML = q.o.map((o, i) =>
      '<button type="button" class="lect-opt" data-i="' + i + '">' + esc(o) + '</button>').join('');
    caja.querySelector('.lect-btns').innerHTML =
      '<button type="button" class="fm-acc lect-verifica">✔ Verificar</button>'
      + '<button type="button" class="fm-acc lect-reinicia">🔄 Reiniciar</button>';
    let sel = -1, hecha = false;
    opts.querySelectorAll('.lect-opt').forEach(b => b.addEventListener('click', () => {
      if (hecha) return;
      sel = +b.dataset.i;
      opts.querySelectorAll('.lect-opt').forEach(x => x.classList.remove('lect-opt-sel'));
      b.classList.add('lect-opt-sel');
    }));
    caja.querySelector('.lect-verifica').addEventListener('click', () => {
      if (hecha) return;
      if (sel < 0) return fb(card, 'c', 'Selecciona una respuesta.', false);
      hecha = true;
      const bs = [...opts.querySelectorAll('.lect-opt')];
      bs[q.c].classList.add('lect-opt-ok');
      if (sel !== q.c) bs[sel].classList.add('lect-opt-no');
      const llave = clave + ':c:' + st.c;
      if (sel === q.c) {
        fb(card, 'c', '✅ Correcto.', true);
        if (!st.pagadas.has(llave)) { st.pagadas.add(llave); st.aciertos++; daXP(XP_ACIERTO); }
        sonido('ok');
      } else { fb(card, 'c', '❌ La correcta es la marcada en verde.', false); sonido('no'); }
      setTimeout(() => { st.c++; pintaC(card, clave); revisaLogro(); }, 1100);
    });
    caja.querySelector('.lect-reinicia').addEventListener('click', () => {
      st.c = 0; caja.querySelector('.lect-fb').textContent = ''; pintaC(card, clave);
    });
  }

  /* ── II. Completar: entrada de texto, comprobación tolerante ── */
  function pintaF(card, clave) {
    const caja = bloqueDe(card, 'f'); if (!caja) return;
    const banco = preguntasDe(card).f, st = estado.get(clave);
    const enun = caja.querySelector('.lect-enun'), opts = caja.querySelector('.lect-opts');
    if (st.f >= banco.length) {
      caja.querySelector('.lect-prog').textContent = 'Terminada';
      enun.innerHTML = '🎉 <strong>Completadas las ' + banco.length + ' de esta lectura.</strong>';
      opts.innerHTML = '';
      caja.querySelector('.lect-btns').innerHTML = '<button type="button" class="fm-acc lect-reinicia">🔄 Reiniciar</button>';
      caja.querySelector('.lect-reinicia').addEventListener('click', () => {
        st.f = 0; caja.querySelector('.lect-fb').textContent = ''; pintaF(card, clave);
      });
      return;
    }
    const q = banco[st.f];
    caja.querySelector('.lect-prog').textContent = 'Oración ' + (st.f + 1) + ' de ' + banco.length;
    enun.textContent = q.q;
    opts.innerHTML = '<input type="text" class="lect-input" placeholder="Escribe tu respuesta..." aria-label="Respuesta">';
    caja.querySelector('.lect-btns').innerHTML =
      '<button type="button" class="fm-acc lect-verifica">✔ Verificar</button>'
      + '<button type="button" class="fm-acc lect-reinicia">🔄 Reiniciar</button>';
    const input = opts.querySelector('.lect-input');
    const comprueba = () => {
      const dado = normaliza(input.value), bueno = normaliza(q.a);
      if (!dado) return fb(card, 'f', 'Escribe algo primero.', false);
      const llave = clave + ':f:' + st.f;
      if (dado === bueno || (bueno.length > 4 && dado.indexOf(bueno) >= 0)) {
        fb(card, 'f', '✅ Correcto: ' + q.a, true);
        if (!st.pagadas.has(llave)) { st.pagadas.add(llave); st.aciertos++; daXP(XP_ACIERTO); }
        sonido('ok');
        setTimeout(() => { st.f++; pintaF(card, clave); revisaLogro(); }, 1100);
      } else { fb(card, 'f', '❌ Todavía no. La respuesta está en el texto de arriba.', false); sonido('no'); }
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); comprueba(); } });
    caja.querySelector('.lect-verifica').addEventListener('click', comprueba);
    caja.querySelector('.lect-reinicia').addEventListener('click', () => {
      st.f = 0; caja.querySelector('.lect-fb').textContent = ''; pintaF(card, clave);
    });
  }

  /* ── III. Análisis complejo: se escribe y se compara con la pauta ──
     Sin XP a propósito (norma 5-quater), y la pauta empieza tapada: verla
     antes de escribir convierte el ejercicio en una lectura más. */
  function pintaA(card, clave) {
    const caja = bloqueDe(card, 'a'); if (!caja) return;
    const banco = preguntasDe(card).a, st = estado.get(clave);
    const q = banco[st.a];
    if (!q) return;
    caja.querySelector('.lect-prog').textContent = 'Pregunta ' + (st.a + 1) + ' de ' + banco.length + ' · sin XP';
    caja.querySelector('.lect-enun').textContent = sinNumero(q.q);
    caja.querySelector('.lect-opts').innerHTML =
      '<textarea class="lect-ta" rows="5" placeholder="Escribe aquí, o en tu cuaderno..." aria-label="Respuesta de análisis"></textarea>'
      + '<div class="lect-pauta"' + (st.pauta ? '' : ' hidden') + '><strong>Pauta:</strong> ' + esc(q.guia) + '</div>';
    caja.querySelector('.lect-btns').innerHTML =
      '<button type="button" class="fm-acc lect-ant">◀ Anterior</button>'
      + '<button type="button" class="fm-acc lect-sig">Siguiente ▶</button>'
      + '<button type="button" class="fm-acc lect-vp">' + (st.pauta ? '🙈 Ocultar pauta' : '👁 Ver pauta') + '</button>';
    caja.querySelector('.lect-ant').addEventListener('click', () => {
      st.a = (st.a - 1 + banco.length) % banco.length; pintaA(card, clave); sonido('click');
    });
    caja.querySelector('.lect-sig').addEventListener('click', () => {
      st.a = (st.a + 1) % banco.length; pintaA(card, clave); sonido('click');
    });
    caja.querySelector('.lect-vp').addEventListener('click', () => {
      st.pauta = !st.pauta; pintaA(card, clave); sonido('click');
    });
  }

  /* El logro de las lecturas se gana cuando se han acertado TODAS las de
     comprensión de las seis, que es lo que el nombre promete. */
  function revisaLogro() {
    const total = banco('lectComprensionBank').length;
    if (!total) return;
    let hechas = 0;
    estado.forEach(st => st.pagadas.forEach(k => { if (k.indexOf(':c:') > 0) hechas++; }));
    if (hechas >= total) logro('lect_master');
  }

  /* ─────────────── La etiqueta del careo, en papel ───────────────
     El careo NO imita a nadie, así que no puede salir impreso con la
     etiqueta del pastiche («este texto NO es obra de ese autor»): sería
     mentira, y encima de las caras, porque justo esa etiqueta es la que
     esta casa usa para declarar lo que no es suyo.

     Vive aquí, en el aparato compartido, y no en cada misión, por una
     razón que se vio al intentar lo contrario: las trece misiones del
     Estudio Mayor arman esa etiqueta de SEIS maneras distintas (una
     función `_etiquetaImpresa`, otra `_etiquetaLectura`, una tabla
     `LECTURAS_ETIQ`, un ternario con `esEntrevista`, otro con
     `meta.ficcion`, y dos campos distintos dentro de `meta`). Trece
     misiones y seis formas de hacer lo mismo es exactamente el motivo
     por el que este archivo existe. Así que en vez de parchear seis
     veces, cada misión pasa por aquí el cuerpo ya armado y aquí se le
     cambia la etiqueta a la del careo, sea cual sea la forma en que la
     haya construido. */
  const ETIQ_CAREO = '<div class="etiqueta"><strong>⚖️ Careo escrito por la casa sobre una disputa real.</strong> '
    + 'Los turnos los firman los <strong>papeles</strong> (moderación, defensa, objeción) y no personas: '
    + 'aquí no se le pone a nadie una palabra en la boca. Los investigadores se citan en tercera persona '
    + 'como fuentes, <strong>toda obra, revista, fecha y cifra es real y comprobable</strong>, y cada postura '
    + 'va escrita en su mejor versión, no en la que sería fácil de tumbar.</div>';
  function etiquetaCareo(clave, cuerpo) {
    if (String(clave).replace(/^lect-/, '') !== 'debate') return cuerpo;
    const c = String(cuerpo || '');
    /* Si la misión ya puso la del careo, no se toca. Si puso otra, se
       sustituye la PRIMERA, que es la del texto (las de más abajo, si
       las hubiera, son de otra cosa). Y si no puso ninguna, se antepone. */
    if (c.indexOf('Careo escrito por la casa') >= 0) return c;
    if (/<div class="etiqueta">/.test(c)) return c.replace(/<div class="etiqueta">[\s\S]*?<\/div>/, ETIQ_CAREO);
    return ETIQ_CAREO + c;
  }

  /* ─────────────── Las preguntas, en papel ───────────────
     Lo que la misión pega al final de la hoja de UNA lectura. La pauta va
     en su propia hoja (norma 5-quater): las respuestas no se imprimen en
     la misma página que el ejercicio. */
  function preguntasImpresas(clave) {
    const card = document.getElementById('lect-' + clave);
    if (!card) return '';
    const p = preguntasDe(card);
    if (!p.c.length && !p.f.length && !p.a.length) return '';
    const lineas = (n) => Array(n).fill('<div class="ln-alta"></div>').join('');
    let h = '<div style="page-break-before:always;"></div>'
      + '<div class="sec">🧐 Preguntas de esta lectura</div>'
      + '<div class="idline"><span>Nombre:</span><span class="r"></span>'
      + '<span>Fecha:</span><span class="r" style="max-width:35mm"></span></div>';
    if (p.c.length) {
      h += '<div class="sec">I. Comprensión lectora (' + p.c.length + ')</div>';
      p.c.forEach((q, i) => {
        h += '<div class="q"><span class="n">' + (i + 1) + '.</span> ' + esc(q.q) + '</div>';
        q.o.forEach(o => { h += '<div class="op">' + esc(o) + '</div>'; });
      });
    }
    if (p.f.length) {
      h += '<div class="sec">II. Completa la oración (' + p.f.length + ')</div>';
      p.f.forEach((q, i) => {
        h += '<div class="q"><span class="n">' + (i + 1) + '.</span> '
          + esc(q.q).replace('___', '_______________') + '</div>';
      });
    }
    if (p.a.length) {
      h += '<div class="sec">III. Análisis complejo (' + p.a.length + ')</div>';
      p.a.forEach((q, i) => {
        h += '<div class="q"><span class="n">' + (i + 1) + '.</span> ' + esc(sinNumero(q.q)) + '</div>' + lineas(3);
      });
    }
    h += '<div class="pauta"><div class="sec">✅ Pauta de esta lectura</div>';
    if (p.c.length) h += '<div class="pl"><strong>I.</strong> ' + p.c.map((q, i) => (i + 1) + ') ' + 'abcd'[q.c]).join(' · ') + '</div>';
    if (p.f.length) h += '<div class="pl"><strong>II.</strong> ' + p.f.map((q, i) => (i + 1) + ') ' + esc(q.a)).join(' · ') + '</div>';
    p.a.forEach((q, i) => { h += '<div class="pl"><strong>III.' + (i + 1) + '.</strong> ' + esc(q.guia) + '</div>'; });
    h += '</div>';
    return h;
  }

  /* ─────────────── Arranque ─────────────── */
  function iniciar() {
    if (montado) return;
    const cards = tarjetas();
    if (!cards.length) return;      /* misión sin lecturas: no estorba */
    montado = true;
    cards.forEach((c, i) => plegar(c, i, cards.length));
    montarIndice();
    marcarIndice();
  }

  window.FaroLecturas = {
    iniciar: iniciar,
    abrir: function (clave) { return abrir(String(clave).replace(/^lect-/, ''), true); },
    cerrar: cerrar,
    preguntasImpresas: preguntasImpresas,
    etiquetaCareo: etiquetaCareo,
    /* Para las sondas: qué voces hay montadas y cuántas preguntas tiene
       cada una. Sin esto, una lectura sin preguntas se publica sin que
       nadie lo note hasta que un alumno abre la tarjeta y no hay nada. */
    voces: function () {
      return tarjetas().map(c => {
        const p = preguntasDe(c);
        return { clave: c.id.replace(/^lect-/, ''), voz: vozDe(c), titulo: tituloDe(c),
                 comprension: p.c.length, completar: p.f.length, analisis: p.a.length,
                 abierta: c.classList.contains('lect-abierta') };
      });
    },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
