'use strict';
/* ══════════════════════════════════════════════════════════════════
   EL TALLER DE LA MEMORIA · aparato compartido de las misiones
   ══════════════════════════════════════════════════════════════════

   Pedido por el autor el 22 de agosto de 2026 sobre la etapa 2 de la
   Ruta del Expediente Dorado, y con la intención dicha en voz alta de
   llevarlo después a las cuarenta y tantas misiones. Por eso vive aquí
   y no en `misiones/…/js/fallas-maquina.js`: es la CUARTA excepción de
   la casa a la norma 1 (tres archivos propios por misión), por el mismo
   motivo que `js/lecturas.js` y el marcador. Un aparato copiado a
   cuarenta misiones es un aparato que se arregla en una y se queda roto
   en treinta y nueve.

   ── QUÉ ARREGLA ──
   Las misiones ya enseñaban bien y ya premiaban con XP. Lo que no
   hacían era pelearse con la manera en que se olvida:

     1. El XP era FIJO. Un premio que se sabe de antemano deja de ser
        premio a la tercera vez: el cerebro solo suelta dopamina cuando
        el resultado NO coincide con lo que esperaba (error de
        predicción de recompensa). Aquí el premio se sortea, y por eso
        la ruleta tarda un segundo en decidirse: sin esa espera no hay
        predicción que fallar.
     2. Se leía y se releía. Releer se siente productivo y casi no deja
        memoria; recordar con la caja cerrada deja mucha. De ahí el
        CIERRE DE CUADERNO, que tapa lo leído y pide escribirlo.
     3. Se estudiaba una vez. La curva del olvido no se pelea repitiendo
        el mismo día, sino volviendo a los 3 días, a las 2 semanas y al
        mes. De ahí el REPASO ESPACIADO.
     4. Se practicaba por bloques: todos los casos de una falla juntos,
        que es donde se acierta sin diagnosticar porque ya se sabe la
        respuesta. De ahí EL TALLER MEZCLADO.
     5. Y la trampa que las cuatro comparten: cuando todo fluye, se
        confunde la familiaridad con el dominio. De ahí el ESPEJO y la
        DIFICULTAD DESEABLE.

   ── CÓMO SE MONTA EN UNA MISIÓN NUEVA ──
   Tres cosas, y ninguna toca este archivo:

     a. En el HTML, después del CSS de la misión:
          <link rel="stylesheet" href="../../css/taller-neuro.css">
        y al final, DESPUÉS del JS de la misión:
          <script src="../../js/taller-neuro.js"></script>
     b. Al final del JS de la misión, el contenido propio en
        `window.TALLER_NEURO` (la clave de la misión, la jerga que hay
        que cazar en el modo Feynman, los casos del taller mezclado y
        las tarjetas de etapas anteriores que se intercalan).
     c. En el HTML, los bloques declarativos: `.cierre-cuaderno` con sus
        pautas, `.tn-feynman` con su ejemplo de la casa, y los botones
        con `data-tn-despliega`. El aparato les pone el comportamiento;
        el TEXTO es de cada misión y se escribe con su voz.

   ── LO QUE NO HACE, A PROPÓSITO ──
   No toca el XP de la barra de arriba más que sumándole por la puerta
   de siempre (`pts`), no toca las seis lecturas, no toca el marcador y
   no guarda nada fuera de este aparato. Si `window.TALLER_NEURO` no
   existe, el archivo se carga y no hace nada.
   ══════════════════════════════════════════════════════════════════ */

(function () {

  const CFG = window.TALLER_NEURO;
  if (!CFG) return;

  const MIS = CFG.mision || 'mision';
  const K_XP = 'metas_xp_' + MIS;      /* el total de la forja, sin tope */
  const K_REV = 'metas_reviews';       /* compartida entre misiones a propósito */
  const K_TAL = 'metas_taller_' + MIS; /* huecos, cierres, feynman, mezcla */

  /* ─────────── El almacén, siempre entre paños ───────────
     localStorage revienta en modo privado de algunos navegadores y en
     iframes con cookies de terceros bloqueadas. Las sondas corren la
     misión DENTRO de un iframe, así que esto no es hipotético. */
  function leer(clave, porDefecto) {
    try {
      const s = localStorage.getItem(clave);
      if (!s) return porDefecto;
      const v = JSON.parse(s);
      return (v === null || v === undefined) ? porDefecto : v;
    } catch (e) { return porDefecto; }
  }
  function escribir(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); return true; }
    catch (e) { return false; }
  }

  const DIA = 86400000;
  const hoy = () => Date.now();
  const diasDesde = t => Math.floor((hoy() - t) / DIA);
  const fechaCorta = t => new Date(t).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });

  /* El estado del taller, con todos sus cajones creados de entrada: un
     `taller.huecos.push` sobre un cajón que no existe rompe la página
     entera, y pasa justo cuando alguien estrena la misión. */
  const taller = Object.assign({
    huecos: [],       /* {texto, tema, fecha}: los «me atascaba en» */
    cierres: [],      /* marcas de tiempo de cada cierre de cuaderno */
    feynman: {},      /* {idCaso: texto} */
    mezcla: { hechas: 0, aciertos: 0, racha: 0, mejor: 0 },
    bloques: 0,       /* respuestas de práctica POR TIPO (para el índice) */
    adivinadas: [],   /* tarjetas marcadas «la adiviné» */
    tiempo: 0,        /* milisegundos de estudio acumulados */
    hoja: {},         /* la hoja de la falla, llenada a mano */
    ciego: false,
  }, leer(K_TAL, {}));
  taller.mezcla = Object.assign({ hechas: 0, aciertos: 0, racha: 0, mejor: 0 }, taller.mezcla || {});
  ['huecos', 'cierres', 'adivinadas'].forEach(k => { if (!Array.isArray(taller[k])) taller[k] = []; });
  if (typeof taller.feynman !== 'object' || !taller.feynman) taller.feynman = {};
  if (typeof taller.hoja !== 'object' || !taller.hoja) taller.hoja = {};

  function guardaTaller() { escribir(K_TAL, taller); }

  /* ════════════════════════════════════════════════════════════════
     1 · EL XP VARIABLE
     ════════════════════════════════════════════════════════════════
     Por qué la ruleta tarda: la dopamina no marca el premio, marca la
     DIFERENCIA entre el premio y lo que se esperaba. Con un +5 fijo esa
     diferencia es cero desde la segunda vez y el premio se vuelve
     mobiliario. Con el premio sorteado, y sobre todo con el segundo de
     espera en que todavía no está decidido, cada actividad vuelve a
     tener un resultado que no se sabía. Esa es toda la mecánica, y es
     la misma de las máquinas tragamonedas: aquí se usa para que alguien
     vuelva a abrir la misión mañana. */
  const RAREZAS = [
    { p: 0.70, mult: 1, clase: 'tn-r1', rotulo: n => '⭐ +' + n + ' XP' },
    { p: 0.20, mult: 2, clase: 'tn-r2', rotulo: n => '⭐⭐ ¡Doble recompensa! +' + n + ' XP' },
    { p: 0.08, mult: 3, clase: 'tn-r3', rotulo: n => '🔥 ¡Racha dorada! +' + n + ' XP' },
    { p: 0.02, mult: 5, clase: 'tn-r5', rotulo: n => '⚡ ¡GOLPE DE SUERTE! +' + n + ' XP · La máquina te sonrió' },
  ];

  function tirada() {
    let r = Math.random(), acum = 0;
    for (let i = 0; i < RAREZAS.length; i++) {
      acum += RAREZAS[i].p;
      if (r < acum) return RAREZAS[i];
    }
    return RAREZAS[0];
  }

  /* Los niveles de herrero suben cada 100 XP de la forja. El séptimo no
     es el último: a partir de ahí se cuentan vueltas, porque una misión
     que se repasa durante meses pasa de 700 y quedarse clavado en el
     último rótulo es decirle a alguien que ya no avanza. */
  const NIVELES = [
    'Aprendiz de taller 🔩', 'Oficial de banco 🔧', 'Maestro de yunque 🔨',
    'Perito de la máquina ⚙️', 'Auditor de la letra pequeña 📜',
    'Herrero mayor 🛠️', 'Guarda del expediente 🗂️',
  ];
  const forja = () => leer(K_XP, { total: 0, nivel: 1 });
  function nivelDe(total) { return Math.floor(total / 100) + 1; }
  function nombreNivel(n) {
    if (n <= NIVELES.length) return 'Nivel ' + n + ' · ' + NIVELES[n - 1];
    const vuelta = n - NIVELES.length + 1;
    return 'Nivel ' + n + ' · ' + NIVELES[NIVELES.length - 1] + ' (vuelta ' + vuelta + ')';
  }

  let elMedidor = null, elNivel = null, elTotal = null, elFill = null;

  function montaMedidor() {
    if (document.querySelector('.tn-medidor')) return;
    const m = document.createElement('div');
    m.className = 'tn-medidor';
    m.setAttribute('role', 'status');
    m.setAttribute('aria-label', 'Medidor de la máquina: XP acumulado y nivel de herrero');
    m.innerHTML =
      '<span class="tn-med-icono" aria-hidden="true">🔨</span>' +
      /* El interruptor del modo difícil vive en la sección de Estructura, y
         sus efectos se notan en Flashcards y en el Reto. Sin este aviso, se
         enciende, se cambia de pantalla y ya no hay manera de saber por qué
         el reto dura veinte segundos ni dónde se apaga. */
      '<button type="button" class="tn-med-dif" hidden aria-pressed="true" title="El modo difícil está encendido. Toca para apagarlo.">🔥</button>' +
      '<div class="tn-med-centro">' +
      '  <div class="tn-med-fila"><span class="tn-med-nivel"></span><span class="tn-med-total"></span></div>' +
      '  <div class="tn-med-track" aria-hidden="true"><div class="tn-med-fill"></div></div>' +
      '</div>' +
      '<button type="button" class="tn-med-btn" aria-haspopup="dialog">📊 Mi Taller</button>';
    document.body.appendChild(m);
    document.body.classList.add('tn-con-medidor');
    elMedidor = m;
    elNivel = m.querySelector('.tn-med-nivel');
    elTotal = m.querySelector('.tn-med-total');
    elFill = m.querySelector('.tn-med-fill');
    m.querySelector('.tn-med-btn').addEventListener('click', abrirPanel);
    m.querySelector('.tn-med-dif').addEventListener('click', () => alternaDificultad(document.querySelector('[data-tn-dificultad]')));
    pintaMedidor();
  }

  function pintaMedidor() {
    if (!elNivel) return;
    const f = forja();
    const n = nivelDe(f.total);
    elNivel.textContent = nombreNivel(n);
    elTotal.textContent = '⭐ ' + f.total + ' XP';
    elFill.style.width = (f.total % 100) + '%';
  }

  function sumaForja(xp) {
    const f = forja();
    const antes = nivelDe(f.total);
    f.total += xp;
    f.nivel = nivelDe(f.total);
    escribir(K_XP, f);
    pintaMedidor();
    if (f.nivel > antes) asciende(f.nivel);
    return f;
  }

  function asciende(n) {
    if (elMedidor) {
      elMedidor.classList.remove('tn-asciende');
      void elMedidor.offsetWidth;   /* reinicia la animación; sin esto, el segundo ascenso no se ve */
      elMedidor.classList.add('tn-asciende');
    }
    aviso('🔨 Sube de nivel: ' + nombreNivel(n) + '. El taller te queda pequeño.');
    if (typeof window.sfx === 'function') window.sfx('up');
    if (typeof window.launchConfetti === 'function') window.launchConfetti();
  }

  /* Se usa el avisador de la misión si lo hay, porque ya está estilado y
     porque dos sistemas de avisos encima uno de otro es lo que hace que
     nadie lea ninguno. */
  function aviso(msg) {
    if (typeof window.showToast === 'function') { window.showToast(msg); return; }
    console.log(msg);
  }

  let laRuleta = null;
  function montaRuleta() {
    if (laRuleta) return laRuleta;
    const r = document.createElement('div');
    r.className = 'tn-ruleta';
    r.setAttribute('role', 'status');
    r.setAttribute('aria-live', 'polite');
    r.innerHTML = '<span class="tn-ruleta-num" aria-hidden="true">⭐</span><span class="tn-ruleta-txt"></span>';
    document.body.appendChild(r);
    laRuleta = r;
    return r;
  }

  const reducido = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let girando = null, tic = null, ocultar = null, enVuelo = null;

  /* Cobra la tirada que estuviera en el aire, venga porque se cumplió el
     segundo o porque llegó otra actividad antes de tiempo.
     Que exista aparte de premia() no es limpieza: en el reto de treinta
     segundos se acierta VARIAS VECES POR SEGUNDO, y la primera versión
     cancelaba la tirada anterior al empezar la siguiente. El resultado
     era que de veinte aciertos seguidos se pagaba uno. Aquí, cuando entra
     una tirada nueva, la anterior se cobra en el acto y se ve un segundo
     menos; no se pierde ninguna. */
  function cierraTirada() {
    if (!enVuelo) return;
    const t = enVuelo.t, total = enVuelo.total, motivo = enVuelo.motivo;
    enVuelo = null;
    clearInterval(tic); tic = null;
    clearTimeout(girando); girando = null;
    clearTimeout(ocultar);

    const r = montaRuleta();
    r.className = 'tn-ruleta tn-visible ' + t.clase;
    r.querySelector('.tn-ruleta-num').textContent = '+' + total;
    r.querySelector('.tn-ruleta-txt').textContent = t.rotulo(total);
    if (t.mult >= 5) chispas(r);
    if (typeof window.sfx === 'function') window.sfx(t.mult > 1 ? 'up' : 'ok');
    sumaForja(total, motivo);
    if (typeof window.pts === 'function') window.pts(total);
    ocultar = setTimeout(() => { if (!enVuelo) r.classList.remove('tn-visible'); }, t.mult > 1 ? 2600 : 1600);
  }

  /* premia() es la única puerta del XP variable. Devuelve el total ya
     decidido (para quien lo necesite), pero lo SUMA un segundo después:
     el suspense es la mitad del mecanismo y sumar antes lo anula. */
  function premia(base, motivo) {
    cierraTirada();
    const t = tirada();
    const total = Math.max(1, Math.round((base || 1) * t.mult));
    enVuelo = { t: t, total: total, motivo: motivo };

    const r = montaRuleta();
    const num = r.querySelector('.tn-ruleta-num');
    r.className = 'tn-ruleta tn-visible tn-girando';
    r.querySelector('.tn-ruleta-txt').textContent = 'La máquina decide…';
    num.textContent = '+' + base;

    if (!reducido()) {
      tic = setInterval(() => { num.textContent = '+' + (1 + Math.floor(Math.random() * 25)); }, 70);
    }
    girando = setTimeout(cierraTirada, 1000);
    return total;
  }

  function chispas(desde) {
    if (reducido()) return;
    const caja = desde.getBoundingClientRect();
    const colores = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#fff'];
    for (let i = 0; i < 14; i++) {
      const c = document.createElement('span');
      c.className = 'tn-chispa';
      c.style.left = (caja.left + caja.width / 2) + 'px';
      c.style.top = (caja.top + caja.height / 2) + 'px';
      c.style.background = colores[i % colores.length];
      c.style.setProperty('--tn-dx', (Math.random() * 200 - 100) + 'px');
      c.style.setProperty('--tn-dy', (Math.random() * -160 - 30) + 'px');
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 950);
    }
  }

  /* ════════════════════════════════════════════════════════════════
     2 · EL CIERRE DE CUADERNO (recordar con la caja cerrada)
     ════════════════════════════════════════════════════════════════
     El bloque lo escribe cada misión en su HTML, con sus preguntas y
     sus pautas, porque el texto es contenido y no aparato. Aquí solo se
     le pone el cronómetro, el botón de la pauta, el renglón del hueco y
     el premio. La pauta NO se valida a máquina a propósito: corregir un
     texto libre a golpe de comparación de cadenas enseña a copiar la
     pauta, que es exactamente lo contrario de lo que se busca. Quien
     compara su respuesta con la pauta al lado está haciendo el trabajo;
     un semáforo verde se lo haría por él. */
  function montaCierres() {
    document.querySelectorAll('.cierre-cuaderno').forEach(caja => {
      if (caja.dataset.tnMontado) return;
      caja.dataset.tnMontado = '1';
      const tema = caja.dataset.tema || 'tema';
      const nombre = caja.dataset.nombre || tema;

      /* Las pautas viajan en data-pauta de cada <li> y se pintan
         escondidas: así el HTML sigue siendo legible y la pauta no se
         puede leer sin pedirla. */
      const items = [...caja.querySelectorAll('.cc-preguntas > li')];
      items.forEach(li => {
        if (!li.dataset.pauta) return;
        const p = document.createElement('div');
        p.className = 'cc-pauta';
        p.hidden = true;
        p.textContent = li.dataset.pauta;
        li.appendChild(p);
      });

      const barra = document.createElement('div');
      barra.className = 'cc-barra';

      const bPauta = document.createElement('button');
      bPauta.type = 'button';
      bPauta.className = 'cc-btn';
      bPauta.textContent = '👁️ Revelar pauta';
      bPauta.setAttribute('aria-expanded', 'false');

      const bCrono = document.createElement('button');
      bCrono.type = 'button';
      bCrono.className = 'cc-btn';
      bCrono.textContent = '⏱️ Tres minutos';

      const crono = document.createElement('span');
      crono.className = 'cc-crono';
      crono.textContent = '03:00';
      crono.setAttribute('role', 'timer');
      crono.setAttribute('aria-live', 'off');

      const bCerrar = document.createElement('button');
      bCerrar.type = 'button';
      bCerrar.className = 'cc-btn cc-btn-pri';
      bCerrar.textContent = '📓 Cerrar el cuaderno';

      /* «Sin mirar atrás» hay que poder cumplirlo: con la explicación
         justo encima, la mitad de los renglones se copian sin querer.
         Este botón tapa la tarjeta de la falla que acaba de leerse,
         que es lo que convierte el ejercicio en recordar y no en
         copiar. Se busca hacia arriba y no por un id: así el bloque se
         pega detrás de cualquier tarjeta, en esta misión y en las que
         vengan. */
      const arriba = caja.previousElementSibling;
      const bTapa = document.createElement('button');
      if (arriba && arriba.classList.contains('card')) {
        bTapa.type = 'button';
        bTapa.className = 'cc-btn';
        bTapa.textContent = '🙈 Tapar lo leído';
        bTapa.setAttribute('aria-expanded', 'true');
        bTapa.setAttribute('aria-controls', arriba.id || (arriba.id = 'tn-leido-' + tema));
        bTapa.addEventListener('click', () => {
          const tapado = arriba.hidden;
          arriba.hidden = !tapado;
          bTapa.setAttribute('aria-expanded', String(tapado));
          bTapa.textContent = tapado ? '🙈 Tapar lo leído' : '👀 Destapar lo leído';
          if (typeof window.sfx === 'function') window.sfx('click');
        });
        barra.appendChild(bTapa);
      }
      barra.appendChild(bPauta);
      barra.appendChild(bCrono);
      barra.appendChild(bCerrar);
      barra.appendChild(crono);

      const hueco = document.createElement('div');
      hueco.className = 'cc-hueco';
      const idH = 'cc-hueco-' + tema;
      hueco.innerHTML = '<label for="' + idH + '">🕳️ Me atascaba en:</label>' +
        '<textarea id="' + idH + '" rows="2" placeholder="Lo que no salió. Escríbelo aunque sea feo: el hueco es el mapa."></textarea>';

      const hechos = document.createElement('p');
      hechos.className = 'cc-hechos';

      caja.appendChild(barra);
      caja.appendChild(hueco);
      caja.appendChild(hechos);

      bPauta.addEventListener('click', () => {
        const abierto = bPauta.getAttribute('aria-expanded') === 'true';
        caja.querySelectorAll('.cc-pauta').forEach(p => { p.hidden = abierto; });
        bPauta.setAttribute('aria-expanded', String(!abierto));
        bPauta.textContent = abierto ? '👁️ Revelar pauta' : '🙈 Tapar la pauta';
        if (typeof window.sfx === 'function') window.sfx('click');
      });

      let seg = 180, marcha = null;
      bCrono.addEventListener('click', () => {
        if (marcha) {
          clearInterval(marcha); marcha = null;
          bCrono.textContent = '⏱️ Tres minutos';
          seg = 180; crono.textContent = '03:00'; crono.classList.remove('cc-poco');
          return;
        }
        bCrono.textContent = '⏹️ Parar el reloj';
        crono.setAttribute('aria-live', 'off');
        marcha = setInterval(() => {
          seg--;
          crono.textContent = String(Math.floor(seg / 60)).padStart(2, '0') + ':' + String(seg % 60).padStart(2, '0');
          if (seg <= 30) crono.classList.add('cc-poco');
          if (seg <= 0) {
            clearInterval(marcha); marcha = null;
            bCrono.textContent = '⏱️ Tres minutos';
            aviso('⏱️ Se acabaron los tres minutos de ' + nombre + '. Lo que no salió es el hueco.');
          }
        }, 1000);
      });

      bCerrar.addEventListener('click', () => {
        const respuestas = [...caja.querySelectorAll('.cc-preguntas textarea')].map(t => t.value.trim());
        const escritas = respuestas.filter(Boolean).length;
        if (!escritas) {
          hechos.textContent = '⚠️ Sin nada escrito no hay cierre: releer no es recordar. Escribe aunque no estés seguro.';
          return;
        }
        if (marcha) { clearInterval(marcha); marcha = null; bCrono.textContent = '⏱️ Tres minutos'; }
        /* Lo tapado se destapa al cerrar: quien deja la página con la
           explicación escondida vuelve mañana y cree que se perdió. */
        if (arriba && arriba.hidden) { arriba.hidden = false; bTapa.setAttribute('aria-expanded', 'true'); bTapa.textContent = '🙈 Tapar lo leído'; }

        const txtHueco = hueco.querySelector('textarea').value.trim();
        if (txtHueco) {
          taller.huecos.unshift({ texto: txtHueco, tema: nombre, fecha: hoy() });
          taller.huecos = taller.huecos.slice(0, 40);
        }
        taller.cierres.unshift(hoy());
        taller.cierres = taller.cierres.slice(0, 120);
        guardaTaller();

        /* El cierre es lo que enciende el reloj del repaso espaciado, y
           se lleva sus propias preguntas dentro: si mañana cambia el
           HTML de la misión, el repaso de la semana que viene tiene que
           seguir preguntando lo mismo que se estudió. */
        registrarRepaso(tema, nombre, items.map(li => ({
          q: (li.querySelector('label') || {}).textContent || '',
          p: li.dataset.pauta || '',
        })));

        hechos.textContent = '✅ Cuaderno cerrado con ' + escritas + ' de ' + items.length +
          ' renglones escritos. El reloj del repaso queda puesto: 3 días, 2 semanas y 1 mes.';
        premia(5, 'cierre:' + tema);
        pintaPanel();
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     3 · EL REPASO ESPACIADO
     ════════════════════════════════════════════════════════════════
     Los tres hitos (3 días, 2 semanas, 1 mes) no son redondeos bonitos:
     son los tres puntos donde la curva del olvido cae lo suficiente
     como para que reconstruir cueste, y donde reconstruir aplana la
     curva de verdad. Repasar antes es releer; repasar mucho después es
     volver a estudiar de cero.
     La clave `metas_reviews` NO lleva el nombre de la misión a
     propósito: es la agenda de toda la casa, y una misión tiene que
     poder avisar de que hay algo pendiente en otra. */
  const HITOS = [
    { k: 'd3', dias: 3, rotulo: '3 días' },
    { k: 'd14', dias: 14, rotulo: '2 semanas' },
    { k: 'd30', dias: 30, rotulo: '1 mes' },
  ];

  const agenda = () => { const a = leer(K_REV, []); return Array.isArray(a) ? a : []; };
  const guardaAgenda = a => escribir(K_REV, a);

  function registrarRepaso(tema, nombre, preguntas) {
    const clave = MIS + ':' + tema;
    const a = agenda();
    let e = a.find(x => x.clave === clave);
    if (!e) { e = { clave: clave, mision: MIS }; a.push(e); }
    e.tema = tema;
    e.nombre = nombre;
    e.url = location.pathname + location.search;
    e.titulo = document.title;
    e.inicio = hoy();
    e.hitos = { d3: false, d14: false, d30: false };
    if (preguntas && preguntas.length) e.preguntas = preguntas;
    guardaAgenda(a);
    pintaPanel();
    return e;
  }

  /* Devuelve el repaso MÁS vencido de esta misión, o null. Solo uno: un
     banderín por pantalla se atiende; tres se ignoran los tres. */
  function repasoVencido() {
    let mejor = null, mejorDias = -1;
    agenda().forEach(e => {
      if (e.mision !== MIS || !e.inicio) return;
      const d = diasDesde(e.inicio);
      for (let i = HITOS.length - 1; i >= 0; i--) {
        const h = HITOS[i];
        if (d >= h.dias && !(e.hitos || {})[h.k]) {
          if (d > mejorDias) { mejor = { entrada: e, hito: h, dias: d }; mejorDias = d; }
          break;
        }
      }
    });
    return mejor;
  }

  function montaAviso() {
    const v = repasoVencido();
    const viejo = document.querySelector('.tn-aviso-repaso');
    if (viejo) viejo.remove();
    if (!v) return;

    const b = document.createElement('div');
    b.className = 'tn-aviso-repaso';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Repaso espaciado pendiente');
    const cuerpo = document.createElement('div');
    cuerpo.className = 'tn-aviso-cuerpo';
    /* Nada de innerHTML con el nombre del tema dentro: viene de
       localStorage, que es del aparato pero también de cualquiera que
       abra la consola. La regla de la casa vale igual aquí. */
    const t1 = document.createElement('strong');
    t1.textContent = '⏰ Revisión espaciada activada';
    const t2 = document.createElement('div');
    t2.textContent = 'Hace ' + v.dias + (v.dias === 1 ? ' día' : ' días') +
      ' cerraste el cuaderno de «' + (v.entrada.nombre || v.entrada.tema) +
      '». La curva del olvido dice que justo ahora es el momento de reconstruirlo. ¿Te la juegas sin mirar?';
    cuerpo.appendChild(t1);
    cuerpo.appendChild(t2);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tn-btn';
    btn.textContent = '🔁 Reconstruir ahora';
    btn.addEventListener('click', () => abrirRepaso(v));

    const luego = document.createElement('button');
    luego.type = 'button';
    luego.className = 'tn-btn tn-btn-hueco';
    luego.style.background = 'transparent';
    luego.style.color = '#fff';
    luego.style.borderColor = 'rgba(255,255,255,0.5)';
    luego.textContent = 'Ahora no';
    luego.addEventListener('click', () => b.remove());

    b.appendChild(cuerpo);
    b.appendChild(btn);
    b.appendChild(luego);

    const ancla = document.querySelector('header.hero');
    if (ancla && ancla.parentNode) ancla.parentNode.insertBefore(b, ancla);
    else document.body.insertBefore(b, document.body.firstChild);
  }

  /* La reconstrucción se autocalifica, y eso es deliberado. Son
     respuestas escritas: compararlas a máquina con la pauta obligaría a
     escribirlas igual que la pauta, que es copiar. Quien se miente aquí
     se miente solo, y el hueco que no declare se lo encuentra en la
     evaluación. */
  function abrirRepaso(v) {
    const preguntas = (v.entrada.preguntas || []).slice(0, 3);
    if (!preguntas.length) { marcaHito(v, true); aviso('Este repaso no guardó preguntas; queda marcado.'); return; }

    const fondo = document.createElement('div');
    fondo.className = 'tn-modal-fondo';
    const caja = document.createElement('div');
    caja.className = 'tn-modal';
    caja.setAttribute('role', 'dialog');
    caja.setAttribute('aria-modal', 'true');
    caja.setAttribute('aria-label', 'Reconstruir sin mirar');

    const h = document.createElement('h3');
    h.textContent = '🔁 Reconstruir «' + (v.entrada.nombre || v.entrada.tema) + '» · ' + v.hito.rotulo + ' después';
    caja.appendChild(h);

    const lead = document.createElement('p');
    lead.className = 'cc-lead';
    lead.textContent = 'Sin subir a mirar. Escribe lo que quede, y después marca honradamente si salió o si lo reconociste al verlo. Reconocer no es recordar.';
    caja.appendChild(lead);

    const ol = document.createElement('ol');
    ol.className = 'cc-preguntas';
    const marcas = [];
    preguntas.forEach((p, i) => {
      const li = document.createElement('li');
      const lab = document.createElement('label');
      lab.textContent = p.q || ('Pregunta ' + (i + 1));
      lab.setAttribute('for', 'tn-rep-' + i);
      const ta = document.createElement('textarea');
      ta.id = 'tn-rep-' + i;
      ta.rows = 2;
      const pauta = document.createElement('div');
      pauta.className = 'cc-pauta';
      pauta.hidden = true;
      pauta.textContent = p.p || '';
      const fila = document.createElement('div');
      fila.className = 'tn-marca-fila';
      fila.hidden = true;
      const si = document.createElement('button');
      si.type = 'button'; si.className = 'tn-marca'; si.textContent = '✅ Me salió';
      si.setAttribute('aria-pressed', 'false');
      const no = document.createElement('button');
      no.type = 'button'; no.className = 'tn-marca'; no.textContent = '❌ No salió';
      no.setAttribute('aria-pressed', 'false');
      si.addEventListener('click', () => { si.setAttribute('aria-pressed', 'true'); no.setAttribute('aria-pressed', 'false'); marcas[i] = true; });
      no.addEventListener('click', () => { no.setAttribute('aria-pressed', 'true'); si.setAttribute('aria-pressed', 'false'); marcas[i] = false; });
      fila.appendChild(si); fila.appendChild(no);
      li.appendChild(lab); li.appendChild(ta); li.appendChild(pauta); li.appendChild(fila);
      ol.appendChild(li);
    });
    caja.appendChild(ol);

    const barra = document.createElement('div');
    barra.className = 'cc-barra';
    const bVer = document.createElement('button');
    bVer.type = 'button'; bVer.className = 'cc-btn'; bVer.textContent = '👁️ Ver la pauta y calificarme';
    const bList = document.createElement('button');
    bList.type = 'button'; bList.className = 'cc-btn cc-btn-pri'; bList.textContent = '✔️ Listo'; bList.hidden = true;
    const bSalir = document.createElement('button');
    bSalir.type = 'button'; bSalir.className = 'cc-btn'; bSalir.textContent = 'Cerrar';
    barra.appendChild(bVer); barra.appendChild(bList); barra.appendChild(bSalir);
    caja.appendChild(barra);

    bVer.addEventListener('click', () => {
      caja.querySelectorAll('.cc-pauta').forEach(p => { p.hidden = false; });
      caja.querySelectorAll('.tn-marca-fila').forEach(f => { f.hidden = false; });
      bVer.hidden = true; bList.hidden = false;
    });

    bList.addEventListener('click', () => {
      const salieron = marcas.filter(x => x === true).length;
      const todas = salieron === preguntas.length;
      marcaHito(v, todas);
      if (todas) {
        premia(6, 'repaso:' + v.entrada.tema);
        aviso('🔁 Reconstruido entero a los ' + v.dias + ' días. Eso es memoria, no familiaridad.');
      } else {
        const faltaron = preguntas.length - salieron;
        taller.huecos.unshift({
          texto: 'Repaso de ' + (v.entrada.nombre || v.entrada.tema) + ': ' + faltaron + ' de ' + preguntas.length + ' no salieron.',
          tema: v.entrada.nombre || v.entrada.tema, fecha: hoy(),
        });
        guardaTaller();
        premia(2, 'repaso-parcial');
        aviso('🕳️ Quedó hueco: ' + faltaron + ' de ' + preguntas.length + '. El repaso sigue puesto.');
      }
      cerrar();
      montaAviso();
      pintaPanel();
    });

    function cerrar() { fondo.remove(); document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') cerrar(); }
    bSalir.addEventListener('click', cerrar);
    fondo.addEventListener('click', e => { if (e.target === fondo) cerrar(); });
    document.addEventListener('keydown', esc);

    fondo.appendChild(caja);
    document.body.appendChild(fondo);
    const primera = caja.querySelector('textarea');
    if (primera) primera.focus();
  }

  function marcaHito(v, cumplido) {
    const a = agenda();
    const e = a.find(x => x.clave === v.entrada.clave);
    if (!e) return;
    e.hitos = e.hitos || {};
    /* Si no salió entero, el hito se marca igual pero se deja anotado:
       si no se marcara, el mismo aviso volvería a salir en cada carga y
       se acabaría cerrando sin leerlo. */
    e.hitos[v.hito.k] = true;
    e.ultimo = hoy();
    e.ultimoEntero = !!cumplido;
    guardaAgenda(a);
  }

  /* ════════════════════════════════════════════════════════════════
     4 · EL TALLER MEZCLADO (práctica intercalada)
     ════════════════════════════════════════════════════════════════
     Practicar «todos los casos de externalidad, luego todos los de
     monopsonio» se siente mucho mejor y enseña mucho menos: quien ya
     sabe que toca externalidad no está diagnosticando, está rellenando.
     Mezclados, cada caso obliga a la pregunta entera otra vez, y esa
     pregunta es la vara de la etapa. Se acierta menos aquí y se
     recuerda más después; el aviso de la casa lo dice en voz alta
     porque si no, la sensación de ir peor hace abandonar el modo que
     funciona. */
  const F_FALLAS = [
    { k: 'externalidad', n: '🌊 Externalidad' },
    { k: 'poder', n: '🏭 Poder de mercado' },
    { k: 'informacion', n: '🍋 Información asimétrica' },
    { k: 'dinamica', n: '🎈 Falla dinámica' },
  ];
  const F_SUPUESTOS = [
    { k: 'completos', n: 'Mercados completos' },
    { k: 'perfecta', n: 'Información perfecta' },
    { k: 'nadie', n: 'Nadie con poder' },
    { k: 'terceros', n: 'Nada sobre terceros' },
  ];

  let mezOrden = [], mezIdx = 0, mezRacha = 0;

  function barajar(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; }

  function montaMezcla() {
    const caja = document.getElementById('tnMezcla');
    if (!caja || !Array.isArray(CFG.mezcla) || !CFG.mezcla.length) return;
    mezOrden = barajar(CFG.mezcla);
    mezIdx = 0;
    mezRacha = 0;
    pintaMezcla();
  }

  function pintaMezcla() {
    const caja = document.getElementById('tnMezcla');
    if (!caja) return;
    caja.textContent = '';

    const cab = document.createElement('div');
    cab.className = 'tn-mezcla-cab';
    const prog = document.createElement('span');
    prog.className = 'tn-caso-num';
    prog.setAttribute('aria-live', 'polite');
    const racha = document.createElement('span');
    racha.className = 'tn-racha' + (mezRacha >= 3 ? ' tn-racha-viva' : '');
    racha.textContent = '🔗 Racha de diagnóstico: ' + mezRacha + (taller.mezcla.mejor ? ' · mejor: ' + taller.mezcla.mejor : '');
    const bRe = document.createElement('button');
    bRe.type = 'button'; bRe.className = 'tn-btn tn-btn-hueco'; bRe.textContent = '🔀 Volver a mezclar';
    bRe.addEventListener('click', montaMezcla);
    cab.appendChild(prog); cab.appendChild(racha); cab.appendChild(bRe);
    caja.appendChild(cab);

    if (mezIdx >= mezOrden.length) {
      prog.textContent = 'Los ' + mezOrden.length + ' casos, mezclados';
      const fin = document.createElement('div');
      fin.className = 'tn-veredicto';
      fin.textContent = '🏁 Se acabaron los ' + mezOrden.length + ' casos. Aciertos de todas las vueltas: ' +
        taller.mezcla.aciertos + ' de ' + taller.mezcla.hechas + '. Vuelve a mezclar: el orden nuevo es medio ejercicio.';
      caja.appendChild(fin);
      if (typeof window.fin === 'function') window.fin('s-mezclado');
      return;
    }

    const c = mezOrden[mezIdx];
    prog.textContent = 'Caso ' + (mezIdx + 1) + ' de ' + mezOrden.length + ' · sin agrupar por tipo';

    const art = document.createElement('article');
    art.className = 'tn-caso';
    const desc = document.createElement('p');
    desc.className = 'tn-caso-desc';
    desc.textContent = c.desc;
    art.appendChild(desc);

    let elegidaFalla = null, elegidoSup = null;
    const grupoFalla = campoOpciones('1 · ¿Cuál de las cuatro fallas es?', F_FALLAS, k => { elegidaFalla = k; });
    const grupoSup = campoOpciones('2 · ¿Qué supuesto del teorema se rompió?', F_SUPUESTOS, k => { elegidoSup = k; });
    art.appendChild(grupoFalla.el);
    art.appendChild(grupoSup.el);

    const campoRegla = document.createElement('div');
    campoRegla.className = 'tn-campo';
    const idR = 'tn-regla-' + mezIdx;
    const lblR = document.createElement('span');
    lblR.className = 'tn-lbl';
    lblR.textContent = '3 · Una regla que lo corregiría, y lo que costaría';
    const ta = document.createElement('textarea');
    ta.id = idR;
    ta.rows = 2;
    ta.setAttribute('aria-label', 'Una regla que lo corregiría, y lo que costaría');
    ta.placeholder = 'Quién la aplica, cómo se comprueba, y a quién le cuesta.';
    campoRegla.appendChild(lblR); campoRegla.appendChild(ta);
    art.appendChild(campoRegla);

    const barra = document.createElement('div');
    barra.className = 'cc-barra';
    const bVer = document.createElement('button');
    bVer.type = 'button'; bVer.className = 'tn-btn'; bVer.textContent = '🔧 Diagnosticar';
    const bSig = document.createElement('button');
    bSig.type = 'button'; bSig.className = 'tn-btn tn-btn-hueco'; bSig.textContent = 'Siguiente caso ▶'; bSig.hidden = true;
    barra.appendChild(bVer); barra.appendChild(bSig);
    art.appendChild(barra);

    const ver = document.createElement('div');
    ver.className = 'tn-veredicto';
    ver.hidden = true;
    ver.setAttribute('role', 'alert');
    art.appendChild(ver);

    bVer.addEventListener('click', () => {
      if (!elegidaFalla || !elegidoSup) {
        ver.hidden = false;
        ver.className = 'tn-veredicto tn-v-mal';
        ver.textContent = 'Falta escoger la falla y el supuesto. El diagnóstico no se entrega a medias.';
        return;
      }
      bVer.hidden = true; bSig.hidden = false;
      const bienFalla = elegidaFalla === c.falla;
      const bienSup = elegidoSup === c.supuesto;
      grupoFalla.marca(c.falla, elegidaFalla);
      grupoSup.marca(c.supuesto, elegidoSup);

      const entero = bienFalla && bienSup;
      taller.mezcla.hechas++;
      if (entero) {
        taller.mezcla.aciertos++;
        mezRacha++;
        if (mezRacha > (taller.mezcla.mejor || 0)) taller.mezcla.mejor = mezRacha;
      } else { mezRacha = 0; }
      taller.mezcla.racha = mezRacha;
      guardaTaller();

      ver.hidden = false;
      ver.className = 'tn-veredicto' + (entero ? '' : ' tn-v-mal');
      ver.textContent = '';
      const l1 = document.createElement('div');
      l1.textContent = (entero ? '✅ Diagnóstico completo. ' : '🔧 Casi. ') +
        'Es ' + (F_FALLAS.find(f => f.k === c.falla) || {}).n +
        ', y el supuesto roto es «' + (F_SUPUESTOS.find(s => s.k === c.supuesto) || {}).n + '».';
      const l2 = document.createElement('div');
      l2.style.marginTop = '0.4rem';
      l2.textContent = c.porque;
      const l3 = document.createElement('div');
      l3.style.marginTop = '0.4rem';
      const fuerte = document.createElement('strong');
      fuerte.textContent = 'La regla de la pauta, con su factura: ';
      l3.appendChild(fuerte);
      l3.appendChild(document.createTextNode(c.regla));
      ver.appendChild(l1); ver.appendChild(l2); ver.appendChild(l3);

      const mia = ta.value.trim();
      if (mia) {
        const l4 = document.createElement('div');
        l4.style.marginTop = '0.4rem';
        l4.textContent = '📝 Lo que escribiste queda al lado para compararlo, no para calificarlo: «' + mia + '»';
        ver.appendChild(l4);
      }
      premia(entero ? 5 : 2, 'mezcla');
      pintaPanel();
    });

    bSig.addEventListener('click', () => { mezIdx++; pintaMezcla(); });

    caja.appendChild(art);

    if (!document.querySelector('#tnMezcla .tn-nota-casa')) {
      const nota = document.createElement('div');
      nota.className = 'tn-nota-casa';
      const s = document.createElement('strong');
      s.textContent = '🧠 Nota de la casa: ';
      nota.appendChild(s);
      nota.appendChild(document.createTextNode(
        'mezclar los casos cuesta más que practicarlos por tipo, y aquí se va a acertar menos que en las otras pantallas. ' +
        'Esa dificultad no es un defecto del ejercicio: es la señal de que el cerebro está construyendo una memoria que dura. ' +
        'Lo cómodo enseña poco.'));
      caja.appendChild(nota);
    }
  }

  function campoOpciones(rotulo, lista, alElegir) {
    const el = document.createElement('div');
    el.className = 'tn-campo';
    const lbl = document.createElement('span');
    lbl.className = 'tn-lbl';
    lbl.textContent = rotulo;
    const ops = document.createElement('div');
    ops.className = 'tn-ops';
    ops.setAttribute('role', 'group');
    ops.setAttribute('aria-label', rotulo);
    const botones = {};
    lista.forEach(o => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tn-op';
      b.textContent = o.n;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        Object.values(botones).forEach(x => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        alElegir(o.k);
        if (typeof window.sfx === 'function') window.sfx('click');
      });
      botones[o.k] = b;
      ops.appendChild(b);
    });
    el.appendChild(lbl); el.appendChild(ops);
    return {
      el: el,
      marca: function (correcta, elegida) {
        Object.entries(botones).forEach(([k, b]) => {
          b.disabled = true;
          if (k === correcta) b.classList.add('tn-ok');
          else if (k === elegida) b.classList.add('tn-mal');
        });
      },
    };
  }

  /* ════════════════════════════════════════════════════════════════
     5 · MODO FEYNMAN (explicárselo a Jael, de once años)
     ════════════════════════════════════════════════════════════════
     Quien no puede explicarlo sin la palabra técnica no lo entendió:
     todavía tiene la etiqueta, no el mecanismo. El cazador de jerga no
     corrige el texto ni lo puntúa; solo señala dónde se escondió una
     palabra grande, que es donde suele estar el hueco. */
  /* Se normaliza CARÁCTER A CARÁCTER, no la cadena entera: normalizar
     de golpe cambia la longitud (una «á» se parte en dos) y entonces las
     posiciones que se calculan sobre el texto normalizado ya no sirven
     para cortar el texto original, que es justo lo que hay que hacer
     para pintar el resaltado sin tocar lo que la persona escribió. */
  const sinTilde = c => {
    const n = c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return n.length === 1 ? n : c.toLowerCase();
  };
  function normalizaChars(texto) {
    const chars = [...texto];
    return { chars: chars, norm: chars.map(sinTilde).join('') };
  }
  const esLetra = c => !!c && /[0-9a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(c);

  function cazaJerga(texto, jerga) {
    const { chars, norm } = normalizaChars(texto);
    const marcas = new Array(chars.length).fill(false);
    jerga.forEach(pal => {
      const p = [...pal].map(sinTilde).join('');
      if (!p) return;
      let i = norm.indexOf(p);
      while (i !== -1) {
        /* La palabra tiene que empezar donde no hay letra antes, y puede
           terminar en plural: «externalidades» cuenta igual que
           «externalidad». */
        const antes = i > 0 ? norm[i - 1] : '';
        let fin = i + p.length;
        if (norm.slice(fin, fin + 2) === 'es') fin += 2;
        else if (norm[fin] === 's') fin += 1;
        const despues = norm[fin] || '';
        if (!esLetra(antes) && !esLetra(despues)) { for (let k = i; k < fin; k++) marcas[k] = true; }
        i = norm.indexOf(p, i + 1);
      }
    });
    return { chars: chars, marcas: marcas };
  }

  /* Se pinta con nodos, NUNCA con innerHTML: el texto lo escribió una
     persona y va a volver de localStorage. Es la misma regla que el
     Buzón del lector y las Sugerencias de M.E.T.A.S, y aquí vale
     aunque el texto sea del propio dueño del aparato: la costumbre de
     escapar se pierde en cuanto se hace una excepción. */
  function pintaRevision(destino, texto, jerga) {
    destino.textContent = '';
    const { chars, marcas } = cazaJerga(texto, jerga);
    let i = 0, cuenta = 0;
    while (i < chars.length) {
      const estado = marcas[i];
      let j = i;
      while (j < chars.length && marcas[j] === estado) j++;
      const trozo = chars.slice(i, j).join('');
      if (estado) {
        const m = document.createElement('mark');
        m.className = 'tn-jerga';
        m.title = '⚠️ Esto es jerga. Jael no lo entiende.';
        m.textContent = trozo;
        destino.appendChild(m);
        cuenta++;
      } else {
        destino.appendChild(document.createTextNode(trozo));
      }
      i = j;
    }
    return cuenta;
  }

  const JERGA = Array.isArray(CFG.jerga) ? CFG.jerga : [];
  const PROMPT_FEY = CFG.feynmanPrompt ||
    'Explícaselo a alguien de once años, sin ninguna de las palabras grandes. Solo palabras que se usen en la calle.';

  function montaFeynman() {
    document.querySelectorAll('.tn-feynman').forEach(caja => {
      if (caja.dataset.tnMontado) return;
      caja.dataset.tnMontado = '1';
      const id = caja.dataset.caso || ('caso-' + Math.random().toString(36).slice(2, 7));
      const modelo = caja.querySelector('.tn-fey-modelo');
      if (modelo) modelo.hidden = true;

      const abrir = document.createElement('button');
      abrir.type = 'button';
      abrir.className = 'tn-btn tn-btn-hueco';
      abrir.textContent = '🎓 Modo Feynman';
      abrir.setAttribute('aria-expanded', 'false');

      const panel = document.createElement('div');
      panel.className = 'tn-fey-panel';
      panel.hidden = true;

      const prompt = document.createElement('p');
      prompt.className = 'tn-fey-prompt';
      prompt.textContent = caja.dataset.prompt || PROMPT_FEY;
      panel.appendChild(prompt);

      const idTa = 'tn-fey-' + id;
      const lab = document.createElement('label');
      lab.setAttribute('for', idTa);
      lab.className = 'tn-lbl';
      lab.textContent = '📝 Mi versión Feynman';
      const ta = document.createElement('textarea');
      ta.id = idTa;
      ta.value = taller.feynman[id] || '';
      panel.appendChild(lab);
      panel.appendChild(ta);

      const barra = document.createElement('div');
      barra.className = 'tn-fey-barra';
      const bJerga = document.createElement('button');
      bJerga.type = 'button'; bJerga.className = 'tn-btn'; bJerga.textContent = '🔍 Revisar mi jerga';
      const bGuarda = document.createElement('button');
      bGuarda.type = 'button'; bGuarda.className = 'tn-btn tn-btn-hueco'; bGuarda.textContent = '📓 Guardar en mi cuaderno';
      const bModelo = document.createElement('button');
      bModelo.type = 'button'; bModelo.className = 'tn-btn tn-btn-hueco'; bModelo.textContent = '🏠 Ver ejemplo de la casa';
      bModelo.setAttribute('aria-expanded', 'false');
      barra.appendChild(bJerga); barra.appendChild(bGuarda);
      if (modelo) barra.appendChild(bModelo);
      panel.appendChild(barra);

      const revision = document.createElement('div');
      revision.className = 'tn-fey-revision';
      revision.hidden = true;
      revision.setAttribute('role', 'status');
      panel.appendChild(revision);

      const guardado = document.createElement('p');
      guardado.className = 'tn-guardado';
      if (taller.feynman[id]) guardado.textContent = '📓 Hay una versión guardada en este aparato.';
      panel.appendChild(guardado);

      if (modelo) panel.appendChild(modelo);

      caja.appendChild(abrir);
      caja.appendChild(panel);

      abrir.addEventListener('click', () => {
        const ab = abrir.getAttribute('aria-expanded') === 'true';
        panel.hidden = ab;
        abrir.setAttribute('aria-expanded', String(!ab));
        if (!ab) ta.focus();
        if (typeof window.sfx === 'function') window.sfx('click');
      });

      bJerga.addEventListener('click', () => {
        const t = ta.value.trim();
        revision.hidden = false;
        if (!t) { revision.textContent = 'Todavía no hay nada que revisar. Escribe primero, aunque salga torcido.'; return; }
        const cuantas = pintaRevision(revision, t, JERGA);
        const pie = document.createElement('p');
        pie.className = 'tn-guardado';
        pie.textContent = cuantas
          ? '⚠️ ' + cuantas + (cuantas === 1 ? ' palabra grande' : ' palabras grandes') + ' en rojo. Cámbialas por lo que pasa, no por su nombre.'
          : '✅ Ni una palabra grande. Si además se entiende, eso es entenderlo.';
        revision.appendChild(pie);
      });

      bGuarda.addEventListener('click', () => {
        taller.feynman[id] = ta.value;
        guardaTaller();
        guardado.textContent = '📓 Guardado ' + fechaCorta(hoy()) + ' en este aparato.';
        if (ta.value.trim()) premia(3, 'feynman');
        pintaPanel();
      });

      if (modelo) bModelo.addEventListener('click', () => {
        const ab = bModelo.getAttribute('aria-expanded') === 'true';
        modelo.hidden = ab;
        bModelo.setAttribute('aria-expanded', String(!ab));
        bModelo.textContent = ab ? '🏠 Ver ejemplo de la casa' : '🏠 Tapar el ejemplo';
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     6 · DESPLEGABLES (los usa el espejo, y cualquiera que los pida)
     ════════════════════════════════════════════════════════════════ */
  function montaDesplegables() {
    document.querySelectorAll('[data-tn-despliega]').forEach(b => {
      if (b.dataset.tnMontado) return;
      b.dataset.tnMontado = '1';
      const destino = document.getElementById(b.dataset.tnDespliega);
      if (!destino) return;
      destino.hidden = true;
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-controls', b.dataset.tnDespliega);
      const abierto = b.dataset.tnAbierto || b.textContent;
      const cerrado = b.textContent;
      b.addEventListener('click', () => {
        const ab = b.getAttribute('aria-expanded') === 'true';
        destino.hidden = ab;
        b.setAttribute('aria-expanded', String(!ab));
        b.textContent = ab ? cerrado : abierto;
        if (typeof window.sfx === 'function') window.sfx('click');
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     7 · LA DIFICULTAD DESEABLE
     ════════════════════════════════════════════════════════════════
     Tres tuercas apretadas a la vez, y las tres empeoran la sensación
     de estudiar: las tarjetas se mezclan con las de la etapa anterior,
     el reto pierde diez segundos, y las palabras clave de las
     instrucciones se tapan hasta que se las toca. La fluidez baja; la
     memoria sube. La casa lo dice al encenderlo porque un modo que se
     siente peor se apaga a los dos minutos si nadie explica por qué. */
  let dificultad = false;

  function alternaDificultad(btn) {
    dificultad = !dificultad;
    window.tnDificultad = dificultad;
    document.body.classList.toggle('tn-dificultad', dificultad);
    const chivato = document.querySelector('.tn-med-dif');
    if (chivato) chivato.hidden = !dificultad;
    if (btn) {
      btn.setAttribute('aria-pressed', String(dificultad));
      btn.textContent = dificultad ? '🔥 Apagar el modo difícil' : '🔥 Encender el modo difícil';
    }
    tapaClaves(dificultad);
    if (typeof window.tallerIntercalaFlash === 'function') {
      window.tallerIntercalaFlash(dificultad ? (CFG.intercaladas || []) : null);
    }
    /* La misión repinta su reto: los segundos están escritos también en su
       título y en su reloj parado, y el aparato no sabe dónde. */
    if (typeof window.tallerRepintaReto === 'function') window.tallerRepintaReto();
    aviso(dificultad
      ? '🔥 La casa no te pide comodidad. Te pide memoria. Este modo cuesta más ahora, y esa es la señal de que está funcionando.'
      : '🔥 Modo difícil apagado. Las tarjetas vuelven a ser solo las de esta etapa.');
  }

  function tapaClaves(on) {
    const zonas = CFG.zonasDificiles || [];
    zonas.forEach(sel => {
      document.querySelectorAll(sel).forEach(z => {
        z.querySelectorAll('strong').forEach(s => {
          if (on) {
            s.classList.add('oculta-clave');
            if (!s.dataset.tnTapada) {
              s.dataset.tnTapada = '1';
              s.tabIndex = 0;
              s.setAttribute('role', 'button');
              s.setAttribute('aria-label', 'Palabra tapada: toca para revelarla');
              const revelar = () => s.classList.add('tn-revelada');
              s.addEventListener('click', revelar);
              s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); revelar(); } });
            }
          } else {
            s.classList.remove('oculta-clave', 'tn-revelada');
          }
        });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     8 · MI TALLER (el panel de medidas)
     ════════════════════════════════════════════════════════════════
     Lo que se mide aquí NO es cuánto se estudió, que es la medida que
     engaña, sino cómo: cuántas veces se recordó con la caja cerrada,
     cuánta práctica fue mezclada y no por bloques, cuándo toca volver,
     y qué huecos quedaron escritos. Un panel que solo dijera «llevas
     340 XP» premiaría exactamente el rato de estudio cómodo que esta
     misión intenta desmontar. */
  let panel = null, fondoPanel = null;

  function montaPanel() {
    if (panel) return;
    fondoPanel = document.createElement('div');
    fondoPanel.className = 'tn-panel-fondo';
    fondoPanel.addEventListener('click', cerrarPanel);

    panel = document.createElement('aside');
    panel.className = 'tn-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Mi Taller: medidas del estudio');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<div class="tn-panel-cab"><span aria-hidden="true">📊</span><h2>Mi Taller</h2>' +
      '<button type="button" class="tn-panel-x" aria-label="Cerrar Mi Taller">✕</button></div>' +
      '<div class="tn-panel-cuerpo"></div>';
    panel.querySelector('.tn-panel-x').addEventListener('click', cerrarPanel);
    document.body.appendChild(fondoPanel);
    document.body.appendChild(panel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('tn-abierto')) cerrarPanel(); });
    pintaPanel();
  }

  function abrirPanel() {
    montaPanel();
    pintaPanel();
    panel.classList.add('tn-abierto');
    fondoPanel.classList.add('tn-abierto');
    panel.setAttribute('aria-hidden', 'false');
    panel.querySelector('.tn-panel-x').focus();
    if (typeof window.sfx === 'function') window.sfx('click');
  }
  function cerrarPanel() {
    if (!panel) return;
    panel.classList.remove('tn-abierto');
    fondoPanel.classList.remove('tn-abierto');
    panel.setAttribute('aria-hidden', 'true');
  }

  function bloque(titulo) {
    const b = document.createElement('div');
    b.className = 'tn-bloque';
    const h = document.createElement('h3');
    h.textContent = titulo;
    b.appendChild(h);
    return b;
  }
  function pie(b, texto) {
    const p = document.createElement('p');
    p.className = 'tn-pie';
    p.textContent = texto;
    b.appendChild(p);
    return p;
  }
  function cifra(b, texto) {
    const c = document.createElement('div');
    c.className = 'tn-cifra';
    c.textContent = texto;
    b.appendChild(c);
    return c;
  }

  function pintaPanel() {
    if (!panel) return;
    const cuerpo = panel.querySelector('.tn-panel-cuerpo');
    cuerpo.textContent = '';

    /* ·· XP y nivel de herrero ·· */
    const f = forja();
    const bXP = bloque('🔨 La forja');
    cifra(bXP, f.total + ' XP');
    const barra = document.createElement('div');
    barra.className = 'tn-barra-nivel';
    const dentro = document.createElement('div');
    dentro.style.width = (f.total % 100) + '%';
    barra.appendChild(dentro);
    bXP.appendChild(barra);
    pie(bXP, nombreNivel(nivelDe(f.total)) + ' · faltan ' + (100 - (f.total % 100)) + ' XP para el siguiente.');
    cuerpo.appendChild(bXP);

    /* ·· Racha de recuerdo con la caja cerrada ·· */
    const semana = taller.cierres.filter(t => hoy() - t < 7 * DIA).length;
    const bR = bloque('📓 Cierres de cuaderno');
    cifra(bR, semana + ' esta semana');
    pie(bR, 'En total, ' + taller.cierres.length + '. Recordar con la caja cerrada es lo único de esta lista que se parece a la evaluación.');
    cuerpo.appendChild(bR);

    /* ·· La curva del olvido, con los repasos puestos ·· */
    const bC = bloque('📉 La curva del olvido');
    bC.appendChild(curvaSVG());
    const pendientes = agenda().filter(e => e.mision === MIS).map(e => {
      const d = diasDesde(e.inicio || hoy());
      const h = HITOS.find(x => !(e.hitos || {})[x.k]);
      return h ? (e.nombre || e.tema) + ': ' + (h.dias - d > 0 ? 'en ' + (h.dias - d) + ' días' : 'vencido hace ' + (d - h.dias) + ' días') : null;
    }).filter(Boolean);
    pie(bC, pendientes.length ? pendientes.join(' · ') : 'Todavía no hay ningún cuaderno cerrado. El reloj arranca con el primero.');
    cuerpo.appendChild(bC);

    /* ·· El índice de práctica mezclada ·· */
    const mez = taller.mezcla.hechas || 0;
    const blo = taller.bloques || 0;
    const tot = mez + blo;
    const bI = bloque('🔀 Índice de práctica mezclada');
    cifra(bI, tot ? Math.round((mez / tot) * 100) + '%' : 'sin datos');
    pie(bI, tot
      ? mez + ' respuestas mezcladas contra ' + blo + ' por bloques. Aciertos en mezclado: ' + (taller.mezcla.aciertos || 0) + ' de ' + mez + '. Mejor racha: ' + (taller.mezcla.mejor || 0) + '.'
      : 'Aún no hay práctica contada. El Taller Mezclado es el que sube este número.');
    cuerpo.appendChild(bI);

    /* ·· Los huecos, que son el mapa ·· */
    const bH = bloque('🕳️ Huecos registrados');
    if (!taller.huecos.length) {
      pie(bH, 'Ninguno escrito todavía. Un cuaderno sin huecos anotados casi siempre significa que no se cerró la caja.');
    } else {
      const ul = document.createElement('ul');
      ul.className = 'tn-lista-huecos';
      taller.huecos.slice(0, 20).forEach(h => {
        const li = document.createElement('li');
        const fecha = document.createElement('span');
        fecha.className = 'tn-fecha';
        fecha.textContent = fechaCorta(h.fecha) + ' · ' + (h.tema || '');
        li.appendChild(fecha);
        li.appendChild(document.createTextNode(h.texto));
        ul.appendChild(li);
      });
      bH.appendChild(ul);
    }
    cuerpo.appendChild(bH);

    /* ·· Las tarjetas que se adivinaron ·· */
    if (taller.adivinadas.length) {
      const bA = bloque('🃏 Tarjetas que se adivinaron');
      cifra(bA, taller.adivinadas.length);
      pie(bA, 'Marcadas para volver. Reconocer la respuesta al verla no es recordarla: son las que hay que repetir primero.');
      cuerpo.appendChild(bA);
    }

    /* ·· El tiempo, el último y a propósito ·· */
    const bT = bloque('⏱️ Tiempo en el taller');
    const min = Math.floor((taller.tiempo + sesion()) / 60000);
    cifra(bT, min < 60 ? min + ' min' : Math.floor(min / 60) + ' h ' + (min % 60) + ' min');
    pie(bT, 'Va el último de la lista a propósito: es la medida que más se parece a estudiar y la que menos dice sobre lo que quedó.');
    cuerpo.appendChild(bT);
  }

  /* La curva se dibuja a mano y sin biblioteca: son doce líneas de path
     y meter una biblioteca de gráficos en una misión que se abre desde
     un teléfono en datos móviles sería cambiar el problema por otro
     peor. */
  function curvaSVG() {
    const ns = 'http://www.w3.org/2000/svg';
    const W = 320, H = 120, ML = 26, MB = 22, MR = 8, MT = 8;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('class', 'tn-curva');
    svg.setAttribute('role', 'img');

    const DIAS = 35;
    const x = d => ML + (d / DIAS) * (W - ML - MR);
    const y = v => MT + (1 - v) * (H - MT - MB);
    const decae = d => Math.exp(-d / 5.5);

    function linea(x1, y1, x2, y2, color, guion) {
      const l = document.createElementNS(ns, 'line');
      l.setAttribute('x1', x1); l.setAttribute('y1', y1);
      l.setAttribute('x2', x2); l.setAttribute('y2', y2);
      l.setAttribute('stroke', color); l.setAttribute('stroke-width', '1');
      if (guion) l.setAttribute('stroke-dasharray', guion);
      svg.appendChild(l);
      return l;
    }
    function texto(px, py, s, color, anclaje) {
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', px); t.setAttribute('y', py);
      t.setAttribute('font-size', '8');
      t.setAttribute('fill', color);
      t.setAttribute('font-family', 'Fredoka, sans-serif');
      if (anclaje) t.setAttribute('text-anchor', anclaje);
      t.textContent = s;
      svg.appendChild(t);
    }

    const tinta = getComputedStyle(document.documentElement).getPropertyValue('--gray').trim() || '#636e72';
    const pri = getComputedStyle(document.documentElement).getPropertyValue('--pri').trim() || '#164e63';
    const sec = getComputedStyle(document.documentElement).getPropertyValue('--sec').trim() || '#991b1b';

    linea(ML, y(0), W - MR, y(0), tinta);
    linea(ML, y(0), ML, y(1), tinta);
    texto(ML - 4, y(1) + 4, '100%', tinta, 'end');
    texto(ML - 4, y(0), '0', tinta, 'end');

    let d = 'M ' + x(0) + ' ' + y(1);
    for (let i = 1; i <= DIAS; i++) d += ' L ' + x(i) + ' ' + y(decae(i));
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', sec);
    p.setAttribute('stroke-width', '2');
    svg.appendChild(p);

    /* Los tres hitos, y encima el estado real de esta misión: verde el
       que ya se reconstruyó, hueco el que falta. */
    const entradas = agenda().filter(e => e.mision === MIS);
    HITOS.forEach(h => {
      linea(x(h.dias), y(0), x(h.dias), y(1), tinta, '2,3');
      texto(x(h.dias), H - 6, h.rotulo, tinta, 'middle');
      const hecho = entradas.length && entradas.every(e => (e.hitos || {})[h.k]);
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', x(h.dias));
      c.setAttribute('cy', y(decae(h.dias)));
      c.setAttribute('r', '4');
      c.setAttribute('fill', hecho ? pri : 'none');
      c.setAttribute('stroke', pri);
      c.setAttribute('stroke-width', '2');
      svg.appendChild(c);
    });

    if (entradas.length) {
      const dHoy = Math.min(DIAS, diasDesde(Math.max(...entradas.map(e => e.inicio || hoy()))));
      linea(x(dHoy), y(0), x(dHoy), y(1), pri, '');
      texto(x(dHoy) + 3, y(1) + 8, 'hoy', pri, 'start');
    }

    const t = document.createElementNS(ns, 'title');
    t.textContent = 'Curva del olvido con los tres repasos marcados a los 3 días, 2 semanas y 1 mes.';
    svg.appendChild(t);
    return svg;
  }

  /* ════════════════════════════════════════════════════════════════
     9 · EL RELOJ DE SESIÓN
     ════════════════════════════════════════════════════════════════
     Solo cuenta con la pestaña delante: una misión abierta y olvidada
     tres horas en una pestaña de atrás no son tres horas de estudio, y
     contarlas convierte el único número honesto del panel en el más
     mentiroso. */
  let desde = hoy(), corriendo = true;
  const sesion = () => corriendo ? (hoy() - desde) : 0;
  /* El vuelco escribe SOLO el reloj, y sobre lo que haya en el almacén en
     ese momento, no sobre la copia que este marco tiene en memoria. Con
     dos pestañas de la misma misión abiertas, la vieja se descarga la
     última y guardaba su estado entero encima: se perdía un hueco recién
     escrito en la otra pestaña, que es justo lo que este aparato existe
     para no perder. */
  function vuelca() {
    if (!corriendo) return;
    const trozo = hoy() - desde;
    desde = hoy();
    const guardado = leer(K_TAL, null);
    if (guardado && typeof guardado === 'object') {
      /* Se SUMA el trozo al total guardado, en vez de escribir el total
         que este marco lleva en memoria: así dos pestañas suman las dos
         en vez de pisarse, y el número sigue siendo el tiempo real. */
      guardado.tiempo = (guardado.tiempo || 0) + trozo;
      taller.tiempo = guardado.tiempo;
      escribir(K_TAL, guardado);
    } else {
      taller.tiempo += trozo;
      guardaTaller();
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { vuelca(); corriendo = false; }
    else { desde = hoy(); corriendo = true; }
  });
  /* Al cerrar la pestaña se cobra lo que estuviera girando: si no, quien
     acierta y cierra pierde ese XP y no entiende por qué. */
  window.addEventListener('pagehide', () => { cierraTirada(); vuelca(); });
  setInterval(vuelca, 20000);

  /* ════════════════════════════════════════════════════════════════
     10 · LOS GANCHOS DE LAS PANTALLAS QUE YA EXISTÍAN
     ════════════════════════════════════════════════════════════════ */

  /* ·· Flashcards: ¿me salió o la adiviné? ··
     Voltear una tarjeta y pensar «ah, sí, claro» es familiaridad, no
     recuerdo, y es exactamente la trampa que hace creer que un tema
     está estudiado. Preguntarlo en voz alta convierte la trampa en un
     dato: las adivinadas se quedan apuntadas y vuelven. */
  let honestidad = null;
  function montaHonestidad() {
    const nav = document.querySelector('.fc-nav');
    if (!nav || honestidad) return;
    honestidad = document.createElement('div');
    honestidad.className = 'tn-honestidad';
    honestidad.hidden = true;
    const lbl = document.createElement('span');
    lbl.className = 'tn-lbl';
    lbl.textContent = '🧠 ¿Me salió o la adiviné?';
    const bSalio = document.createElement('button');
    bSalio.type = 'button'; bSalio.className = 'tn-btn'; bSalio.textContent = '✅ Me salió de verdad';
    const bAdiv = document.createElement('button');
    bAdiv.type = 'button'; bAdiv.className = 'tn-btn tn-btn-hueco'; bAdiv.textContent = '🤔 La adiviné';
    const aviso2 = document.createElement('p');
    aviso2.className = 'tn-guardado';
    aviso2.style.width = '100%';

    const bVolver = document.createElement('button');
    bVolver.type = 'button'; bVolver.className = 'tn-btn tn-btn-hueco';
    bVolver.hidden = true;

    honestidad.appendChild(lbl);
    honestidad.appendChild(bSalio);
    honestidad.appendChild(bAdiv);
    honestidad.appendChild(bVolver);
    honestidad.appendChild(aviso2);
    nav.parentNode.insertBefore(honestidad, nav.nextSibling);

    function pintaVolver() {
      bVolver.hidden = !taller.adivinadas.length;
      bVolver.textContent = '🔁 Repasar las que adiviné (' + taller.adivinadas.length + ')';
    }
    pintaVolver();

    bSalio.addEventListener('click', () => {
      const i = idxFlash();
      taller.adivinadas = taller.adivinadas.filter(x => x !== i);
      guardaTaller();
      aviso2.textContent = '✅ Anotada como recordada. Esa ya no vuelve a la fila de adelante.';
      pintaVolver(); pintaPanel();
      premia(1, 'flash-honesta');
    });
    bAdiv.addEventListener('click', () => {
      const i = idxFlash();
      if (!taller.adivinadas.includes(i)) taller.adivinadas.push(i);
      guardaTaller();
      aviso2.textContent = '🤔 Apuntada. Reconocer no es recordar, y esta vuelve.';
      pintaVolver(); pintaPanel();
    });
    let vueltaIdx = 0;
    bVolver.addEventListener('click', () => {
      if (!taller.adivinadas.length || typeof window.tallerFlashIr !== 'function') return;
      vueltaIdx = vueltaIdx % taller.adivinadas.length;
      window.tallerFlashIr(taller.adivinadas[vueltaIdx]);
      vueltaIdx++;
      aviso2.textContent = '🔁 De las adivinadas. Contéstala antes de voltear.';
    });
  }

  function idxFlash() { return typeof window.tallerFlashActual === 'function' ? window.tallerFlashActual() : 0; }

  function alVoltearFlash(volteada) {
    montaHonestidad();
    if (honestidad) honestidad.hidden = !volteada;
  }

  /* ·· Quiz ciego ··
     Ver las opciones antes de pensar convierte la pregunta en un
     reconocimiento: se descarta lo raro y se acierta sin haber
     recordado nada. Tapadas, hay que sacar la respuesta de la cabeza
     primero, que es lo que la evaluación va a pedir. */
  let ciegoCaja = null, ciegoBtn = null;
  function montaCiego() {
    const opts = document.getElementById('qzOpts');
    if (!opts || ciegoCaja) return;

    const alterna = document.createElement('button');
    alterna.type = 'button';
    alterna.className = 'tn-btn tn-btn-hueco';
    alterna.textContent = '🙈 Quiz ciego';
    alterna.setAttribute('aria-pressed', String(!!taller.ciego));
    alterna.style.marginBottom = '0.6rem';

    ciegoCaja = document.createElement('div');
    ciegoCaja.className = 'tn-ciego-caja';
    ciegoCaja.hidden = true;
    const lbl = document.createElement('label');
    lbl.className = 'tn-lbl';
    lbl.setAttribute('for', 'tnCiegoTa');
    lbl.textContent = '✍️ Contesta de memoria antes de ver las opciones:';
    const ta = document.createElement('textarea');
    ta.id = 'tnCiegoTa';
    ta.rows = 2;
    ciegoBtn = document.createElement('button');
    ciegoBtn.type = 'button';
    ciegoBtn.className = 'tn-btn';
    ciegoBtn.textContent = '👁️ Ya lo pensé: mostrar opciones';
    ciegoBtn.style.marginTop = '0.5rem';
    ciegoCaja.appendChild(lbl);
    ciegoCaja.appendChild(ta);
    ciegoCaja.appendChild(ciegoBtn);

    opts.parentNode.insertBefore(alterna, opts);
    opts.parentNode.insertBefore(ciegoCaja, opts);

    alterna.addEventListener('click', () => {
      taller.ciego = !taller.ciego;
      guardaTaller();
      alterna.setAttribute('aria-pressed', String(taller.ciego));
      document.body.classList.toggle('tn-quiz-ciego', taller.ciego);
      alPintarQuiz();
      aviso(taller.ciego
        ? '🙈 Quiz ciego encendido: primero la respuesta de la cabeza, después las opciones.'
        : '👁️ Quiz ciego apagado.');
    });

    ciegoBtn.addEventListener('click', () => {
      const opts2 = document.getElementById('qzOpts');
      if (opts2) opts2.classList.add('tn-destapado');
      ciegoBtn.disabled = true;
      ciegoBtn.textContent = '👁️ Opciones a la vista';
    });

    document.body.classList.toggle('tn-quiz-ciego', !!taller.ciego);
    alPintarQuiz();
  }

  function alPintarQuiz() {
    montaCiego();
    const opts = document.getElementById('qzOpts');
    if (!opts || !ciegoCaja) return;
    const hayPregunta = opts.children.length > 0;
    ciegoCaja.hidden = !(taller.ciego && hayPregunta);
    opts.classList.remove('tn-destapado');
    if (ciegoBtn) { ciegoBtn.disabled = false; ciegoBtn.textContent = '👁️ Ya lo pensé: mostrar opciones'; }
    const ta = document.getElementById('tnCiegoTa');
    if (ta) ta.value = '';
  }

  /* ════════════════════════════════════════════════════════════════
     11 · LA PUERTA DEL XP VARIABLE PARA EL JS DE LA MISIÓN
     ════════════════════════════════════════════════════════════════
     El JS de cada misión llama a ptsVar(base, motivo) donde antes
     llamaba a pts(base). El motivo no es decorativo: es lo que permite
     saber después qué parte de la práctica fue mezclada y qué parte fue
     por bloques, que es la medida del panel. */
  const POR_BLOQUES = ['quiz', 'clasifica', 'identifica', 'completa', 'reto', 'widget', 'neurona', 'sopa'];
  window.ptsVar = function (base, motivo) {
    if (POR_BLOQUES.indexOf(motivo) !== -1) { taller.bloques = (taller.bloques || 0) + 1; guardaTaller(); }
    return premia(base, motivo);
  };

  /* ════════════════════════════════════════════════════════════════
     12 · ARRANQUE
     ════════════════════════════════════════════════════════════════ */
  function iniciar() {
    montaMedidor();
    montaCierres();
    montaFeynman();
    montaDesplegables();
    montaMezcla();
    montaPanel();
    montaHonestidad();
    montaCiego();
    montaAviso();

    document.querySelectorAll('[data-tn-dificultad]').forEach(b => {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => alternaDificultad(b));
    });
    document.querySelectorAll('[data-tn-panel]').forEach(b => b.addEventListener('click', abrirPanel));
  }

  window.FaroTaller = {
    /* Puerta del XP variable y su sorteo suelto, para las sondas. */
    premia: premia,
    tirada: function () { const t = tirada(); return { mult: t.mult, clase: t.clase }; },
    rarezas: RAREZAS.map(r => ({ p: r.p, mult: r.mult })),

    abrirPanel: abrirPanel,
    cerrarPanel: cerrarPanel,
    alPintarQuiz: alPintarQuiz,
    alVoltearFlash: alVoltearFlash,
    registrarRepaso: registrarRepaso,
    repasoVencido: repasoVencido,
    montaAviso: montaAviso,
    /* Devuelve cuántas PALABRAS grandes hay, no cuántas letras: se
       cuentan los tramos marcados, que es lo mismo que acaba pintando la
       revisión. */
    cazaJerga: function (texto) {
      const r = cazaJerga(texto, JERGA);
      let n = 0;
      for (let i = 0; i < r.marcas.length; i++) if (r.marcas[i] && !r.marcas[i - 1]) n++;
      return n;
    },
    dificultad: () => dificultad,
    alternaDificultad: alternaDificultad,

    /* El estado, en crudo, para las sondas y para depurar de verdad. */
    estado: function () {
      return {
        mision: MIS, forja: forja(), nivel: nivelDe(forja().total),
        cierres: taller.cierres.length, huecos: taller.huecos.length,
        mezcla: taller.mezcla, bloques: taller.bloques || 0,
        adivinadas: taller.adivinadas.length, feynman: Object.keys(taller.feynman).length,
        agenda: agenda().filter(e => e.mision === MIS),
        tiempo: taller.tiempo + sesion(), ciego: !!taller.ciego, dificultad: dificultad,
      };
    },

    /* Adelantar el reloj es la ÚNICA manera de probar a máquina un
       aparato cuyo primer hito son tres días. Mueve hacia atrás las
       fechas guardadas, no la hora del aparato. */
    adelantarReloj: function (dias) {
      const a = agenda();
      a.forEach(e => { if (e.inicio) e.inicio -= dias * DIA; });
      guardaAgenda(a);
      montaAviso();
      pintaPanel();
      return a;
    },

    /* Borrar el taller de esta misión, sin tocar el XP de la barra de
       arriba ni el progreso de la misión. */
    olvidar: function () {
      try {
        localStorage.removeItem(K_TAL);
        localStorage.removeItem(K_XP);
        const a = agenda().filter(e => e.mision !== MIS);
        guardaAgenda(a);
      } catch (e) {}
      location.reload();
    },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();

})();
