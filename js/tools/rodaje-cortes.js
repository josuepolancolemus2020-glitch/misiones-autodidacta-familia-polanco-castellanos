'use strict';

/* ─────────────────────────────────────────────
   EL RODAJE · ✂️ CORTES · de una grabación larga, un archivo por toma
   ─────────────────────────────────────────────
   Pedido por el autor el 7 de septiembre de 2026, después de estrenar El
   Rodaje: «quiero que haya la opción de cortar alguna pista de audio o
   video para después descargarlos y solo editarlos en otro programa con
   los clip dados».

   El reparto quedó así, y es el que explica todo el archivo: **la cámara
   es aparte**. No se graba aquí. Se llega con una grabación larga hecha
   con la cámara de verdad, y lo que hace falta es partirla en las tomas
   que la secuencia ya tiene escritas — porque el montaje no empieza por
   editar: empieza por buscar en catorce minutos dónde estaba cada frase.

   ══ POR QUÉ ES UN ARCHIVO APARTE ══
   `rodaje.js` no toca ni un aparato del navegador: pinta, suma y guarda.
   Esto toca `AudioContext`, `MediaRecorder`, `captureStream` y descargas,
   y cada uno falla de una manera distinta en cada navegador. Mezclarlo
   con el cuaderno de dirección sería meter en el archivo que SIEMPRE
   funciona un puñado de cosas que en algunos aparatos no existen. Si esto
   no carga, El Rodaje sigue entero: la pestaña lo dice y ya.

   ══ LAS CINCO REGLAS ══

   1. ⚠️ EL ARCHIVO NO SALE DEL APARATO. Nunca. Se abre con un
      `<input type="file">`, se mira con una dirección de objeto local y
      se corta en memoria. No sube a Supabase, no pasa por ninguna red, y
      la pantalla lo dice con todas las letras — porque a nadie se le
      ocurre por su cuenta que no lo hace, y una grabación de catorce
      minutos subiendo sin avisar por la conexión de una tableta sería
      una factura de datos y de tiempo que nadie pidió.

   2. ⚠️ EL AUDIO SE CORTA EXACTO; EL VIDEO SE REPROCESA. No es un
      capricho: en un navegador el audio se puede decodificar entero a
      muestras y cortarlo por la muestra que uno quiera, pero el video no
      se puede recortar sin volver a codificarlo. Se hace lo segundo
      reproduciendo el trozo y grabándolo, que tarda LO QUE DURA EL TROZO
      y pierde algo de calidad. Se dice antes, no después.

   3. ⚠️ Y SIEMPRE, PASE LO QUE PASE, SALEN LOS TIEMPOS. Aunque este
      navegador no pueda cortar nada. El autor dijo que edita en otro
      programa, y ese programa corta mejor que cualquier navegador: sin
      pérdida y al instante. Una lista de entradas y salidas exactas, y
      las órdenes de `ffmpeg` ya escritas, valen más que un recorte
      reprocesado. Es la salida que no depende de nada.

   4. LAS MARCAS SE GUARDAN EN EL APARATO, no en la nube. Van con el
      archivo, y el archivo es de este aparato: subirlas sería prometer
      en la tableta unas marcas de un archivo que allí no está. Se
      guardan con la firma del archivo (nombre y tamaño), así que volver
      a abrir la misma grabación mañana recupera lo marcado.

   5. EL REPRODUCTOR NO SE DESTRUYE AL CAMBIAR DE PESTAÑA. Se guarda el
      nodo y se vuelve a colgar. Si se creara de nuevo en cada pintado,
      mirar las Citas un momento perdería el archivo abierto y habría que
      volver a buscarlo en el aparato — que en una tableta son cinco
      toques y la carpeta equivocada dos veces.
───────────────────────────────────────────── */

const COR_MARCAS = 'FARO_ROD_CORTES_V1';

/* Cuánto se permite abrir sin avisar. Decodificar el audio de un archivo
   lo pone ENTERO en memoria como números de coma flotante: catorce
   minutos en estéreo a 48 kHz son unos 320 MB, que en una tableta es
   pedir que se cierre la aplicación. No se prohíbe —el autor sabrá—,
   pero se dice antes de intentarlo. */
const COR_AVISO_MB = 250;

let _corArchivo = null;    // el File que se abrió
let _corMedio   = null;    // el <video> o <audio>, que sobrevive a los pintados
let _corUrl     = '';      // su dirección de objeto, para soltarla después
let _corEsVideo = false;
let _corBuffer  = null;    // el audio ya decodificado, una sola vez
let _corDecodificando = false;
let _corMarcas  = {};      // { bid: { ini, fin } }
let _corPid     = '';
let _corTrabajando = '';   // qué bloque se está sacando ahora mismo

/* ══════════════ QUÉ PUEDE ESTE NAVEGADOR ══════════════
   Se pregunta y se enseña, en vez de intentarlo y fallar a media faena.
   En el Safari de un iPad no existe `captureStream`, así que el corte de
   video no se puede hacer ahí de ninguna manera — y es mejor saberlo
   antes de marcar cuarenta entradas y salidas. */
function corPuede() {
  const v = document.createElement('video');
  const grab = typeof MediaRecorder !== 'undefined';
  return {
    audio: !!(window.AudioContext || window.webkitAudioContext),
    video: grab && (typeof v.captureStream === 'function' ||
                    typeof v.mozCaptureStream === 'function'),
    descarga: 'download' in document.createElement('a'),
    tipo: grab ? ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus',
                  'video/webm', 'video/mp4'].find(t => MediaRecorder.isTypeSupported(t)) || ''
               : '',
  };
}

/* ══════════════ EL RELOJ ══════════════ */

/* Con milésimas y con horas siempre, que es la forma que entienden ffmpeg
   y todos los programas de montaje. Aquí NO se ahorran las horas como en
   el resto de la herramienta: un «2:05» pegado en un programa de montaje
   se lee como dos horas y cinco minutos en unos y como dos minutos y
   cinco segundos en otros, y esa ambigüedad se paga cortando mal. */
function corRelojMs(s) {
  const t = Math.max(0, Number(s) || 0);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60);
  const g = Math.floor(t % 60), ms = Math.round((t - Math.floor(t)) * 1000);
  const d = (n, c) => String(n).padStart(c || 2, '0');
  return d(h) + ':' + d(m) + ':' + d(g) + '.' + d(ms, 3);
}

/* Y el corto, para la pantalla, donde el sitio manda y no hay ambigüedad
   porque al lado está el nombre del bloque. */
function corReloj(s) {
  const t = Math.max(0, Number(s) || 0);
  const m = Math.floor(t / 60), g = Math.floor(t % 60);
  const d = Math.round((t - Math.floor(t)) * 10);
  return m + ':' + String(g).padStart(2, '0') + '.' + d;
}

/* Un nombre de archivo que aguante en cualquier sistema. Lleva el número
   de orden DELANTE porque así los clips se ordenan solos en la carpeta y
   entran al programa de montaje en la fila del video. */
function corNombre(b, i, ext) {
  const t = String(b.titulo || 'sin titulo')
    /* Sin tildes y sin nada que no sea letra, número, espacio o guion: el
       nombre acaba en la carpeta de otro aparato, y una comilla o un signo
       de interrogación rompen en Windows. El rango de marcas combinantes
       va con escapes: en claro son caracteres invisibles que cualquier
       editor se come al copiar el archivo. */
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
  return String(i + 1).padStart(2, '0') + ' - ' + (t || 'sin titulo') + '.' + ext;
}

/* ══════════════ LAS MARCAS ══════════════ */

/* Con la firma del archivo, no solo con el proyecto: la misma secuencia
   se puede cortar de dos grabaciones distintas (la buena y la repetida),
   y mezclar las marcas de una con la otra saca los trozos equivocados sin
   avisar de nada. */
function corFirma() {
  if (!_corArchivo) return '';
  return _corPid + '|' + _corArchivo.name + '|' + _corArchivo.size;
}
function corCargarMarcas() {
  _corMarcas = {};
  const f = corFirma();
  if (!f) return;
  try {
    const g = JSON.parse(localStorage.getItem(COR_MARCAS) || '{}');
    if (g && g[f]) _corMarcas = g[f];
  } catch (e) {}
}
function corGuardarMarcas() {
  const f = corFirma();
  if (!f) return;
  try {
    const g = JSON.parse(localStorage.getItem(COR_MARCAS) || '{}');
    g[f] = _corMarcas;
    /* Solo las diez grabaciones últimas: esto es una libreta de trabajo,
       no un archivo histórico, y el almacén del navegador es pequeño. */
    const claves = Object.keys(g);
    if (claves.length > 10) claves.slice(0, claves.length - 10).forEach(k => delete g[k]);
    localStorage.setItem(COR_MARCAS, JSON.stringify(g));
  } catch (e) {}
}

/* ══════════════ CORTAR EL AUDIO ══════════════ */

/* El audio SÍ se corta exacto, y por eso es la salida de la que uno se
   puede fiar: se decodifica el archivo entero a muestras y se copia el
   trozo que se quiere. No hay recodificación, no hay pérdida y no tarda
   lo que dura el trozo: tarda lo que tarda copiar memoria.

   Se decodifica UNA VEZ y se guarda: cuarenta tomas de la misma grabación
   son cuarenta cortes y una sola decodificación. Al revés, cada toma
   volvería a masticar los catorce minutos enteros. */
async function corDecodificar(alAvisar) {
  if (_corBuffer) return _corBuffer;
  if (_corDecodificando) return null;
  if (!_corArchivo) return null;
  _corDecodificando = true;
  try {
    if (alAvisar) alAvisar('⏳ Leyendo el sonido del archivo…');
    const datos = await _corArchivo.arrayBuffer();
    const C = new (window.AudioContext || window.webkitAudioContext)();
    _corBuffer = await C.decodeAudioData(datos);
    try { C.close(); } catch (e) {}
    return _corBuffer;
  } catch (e) {
    /* Que un video no suelte su audio es normal y no es un fallo de nadie:
       depende del códec y del navegador. Se dice qué queda, que es lo que
       importa —los tiempos siguen saliendo—, en vez de un «error». */
    if (alAvisar) {
      alAvisar('⚠️ Este navegador no supo leer el sonido de este archivo (' +
               (e && e.message ? e.message : 'sin detalle') + '). ' +
               'Los tiempos y las órdenes de ffmpeg siguen funcionando.');
    }
    return null;
  } finally {
    _corDecodificando = false;
  }
}

/* De muestras a un WAV de 16 bits. Se escribe a mano porque un WAV son
   cuarenta y cuatro bytes de cabecera y los números detrás: traerse una
   biblioteca para esto sería añadir una dependencia a un repositorio que
   no compila nada.

   Sale WAV y no algo comprimido a propósito: es lo que entra sin discutir
   en cualquier programa de montaje, y como el archivo va a durar lo que
   dura una toma, el tamaño no es el problema. */
function corWavDe(buf, ini, fin) {
  const sr = buf.sampleRate;
  const a = Math.max(0, Math.floor(ini * sr));
  const b = Math.min(buf.length, Math.ceil(fin * sr));
  const n = Math.max(0, b - a);
  const ch = Math.min(2, buf.numberOfChannels);
  const bytes = 44 + n * ch * 2;
  const ab = new ArrayBuffer(bytes);
  const v = new DataView(ab);
  const txt = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };

  txt(0, 'RIFF');  v.setUint32(4, bytes - 8, true);  txt(8, 'WAVE');
  txt(12, 'fmt '); v.setUint32(16, 16, true);        v.setUint16(20, 1, true);
  v.setUint16(22, ch, true);      v.setUint32(24, sr, true);
  v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
  txt(36, 'data'); v.setUint32(40, n * ch * 2, true);

  const canales = [];
  for (let c = 0; c < ch; c++) canales.push(buf.getChannelData(c));
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < ch; c++) {
      let s = canales[c][a + i];
      s = s < -1 ? -1 : s > 1 ? 1 : s;
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}

/* ══════════════ CORTAR EL VIDEO ══════════════ */

/* ⚠️ ESTO REPRODUCE EL TROZO Y LO GRABA, o sea que TARDA LO QUE DURA y
   vuelve a codificar la imagen. No hay otra manera en un navegador sin
   arrastrar veinticinco megas de biblioteca a un repositorio que no
   compila nada — y esos veinticinco megas se bajarían en la tableta, con
   la señal de la tableta, para hacer algo que el programa de montaje del
   autor hace mejor.

   Por eso la pantalla lo dice antes de empezar y la salida de los tiempos
   sigue estando ahí al lado: para un trozo de cuarenta segundos esto vale
   la pena; para cortar catorce minutos en treinta tomas, no. */
async function corVideoTrozo(ini, fin, alAvanzar) {
  const v = _corMedio;
  if (!v) throw new Error('no hay archivo abierto');
  const hacer = v.captureStream ? 'captureStream' : (v.mozCaptureStream ? 'mozCaptureStream' : '');
  if (!hacer) throw new Error('este navegador no sabe capturar el reproductor');

  const p = corPuede();
  const flujo = v[hacer]();
  const rec = new MediaRecorder(flujo, p.tipo ? { mimeType: p.tipo } : undefined);
  const trozos = [];
  rec.ondataavailable = e => { if (e.data && e.data.size) trozos.push(e.data); };
  const parado = new Promise(r => { rec.onstop = r; });

  /* Sin silenciar: al silenciar el elemento, algunos navegadores dejan de
     poner la pista de sonido en la captura y el trozo sale mudo — que es
     el fallo que menos se nota hasta que ya está en el montaje. Suena, y
     se avisa. */
  const vol = v.volume;
  v.muted = false;
  v.currentTime = ini;
  await new Promise(r => { v.addEventListener('seeked', r, { once: true }); });

  rec.start();
  await v.play();

  /* Se vigila con el reloj de la pantalla y no con `timeupdate`, que solo
     avisa cuatro veces por segundo: con él, el final del trozo se pasaba
     hasta un cuarto de segundo. */
  await new Promise(r => {
    const mira = () => {
      if (!v.paused && v.currentTime < fin && !v.ended) {
        if (alAvanzar) alAvanzar((v.currentTime - ini) / Math.max(0.001, fin - ini));
        requestAnimationFrame(mira);
      } else r();
    };
    requestAnimationFrame(mira);
  });

  v.pause();
  rec.stop();
  await parado;
  v.volume = vol;
  return new Blob(trozos, { type: (p.tipo || 'video/webm').split(';')[0] });
}

/* ══════════════ BAJAR ══════════════ */

function corBajar(blob, nombre) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', u);
  a.setAttribute('download', nombre);
  document.body.appendChild(a);
  a.click();
  a.remove();
  /* La dirección se suelta un poco después: soltarla en el mismo instante
     le quita el archivo al navegador antes de que empiece a guardarlo. */
  setTimeout(() => URL.revokeObjectURL(u), 20000);
}

/* ══════════════ LO QUE SALE POR EL CHAT ══════════════ */

function corTiempos(bloques) {
  const L = [];
  L.push('CORTES · ' + (_corArchivo ? _corArchivo.name : 'sin archivo'));
  L.push('');
  L.push('Entrada y salida de cada toma dentro de la grabación, en');
  L.push('horas:minutos:segundos.milésimas — la forma que entienden todos');
  L.push('los programas de montaje sin ambigüedad.');
  L.push('');
  let n = 0;
  bloques.forEach((b, i) => {
    const m = _corMarcas[b.bid];
    if (!m || m.fin <= m.ini) return;
    n++;
    L.push(corRelojMs(m.ini) + '  →  ' + corRelojMs(m.fin) +
           '   (' + corReloj(m.fin - m.ini) + ')   ' + corNombre(b, i, '').replace(/\.$/, ''));
  });
  if (!n) L.push('(todavía no hay ni una toma marcada)');
  return L.join('\n');
}

/* Las órdenes ya escritas. Van DOS por toma y con la diferencia explicada,
   porque son dos cosas distintas y elegir mal cuesta: la primera no toca
   la imagen —instantánea y sin pérdida— pero empieza en el fotograma
   clave más cercano, que puede caer hasta un segundo antes; la segunda
   cae donde se dijo, pero vuelve a codificar. */
function corFfmpeg(bloques) {
  const L = [];
  const ent = _corArchivo ? _corArchivo.name : 'grabacion.mp4';
  L.push('# CORTES CON ffmpeg · ' + ent);
  L.push('#');
  if (_corEsVideo) {
    /* La advertencia va en UNA línea y no partida en tres: esto se lee en
       un recuadro estrecho de una tableta, y una frase cortada por la
       mitad se salta. Y es la que decide entre dos órdenes distintas. */
    L.push('# Van DOS órdenes por toma, y no hacen lo mismo:');
    L.push('#   · la primera no vuelve a codificar: es instantánea y la imagen queda');
    L.push('#     intacta, pero empieza en el fotograma clave más cercano y puede');
    L.push('#     adelantarse hasta un segundo.');
    L.push('#   · la segunda cae exactamente donde dice, pero vuelve a codificar.');
    L.push('#');
    L.push('# Prueba la primera: casi siempre basta, y no toca la imagen.');
  } else {
    L.push('# Es audio, así que no hay fotograma clave que valga: el corte cae');
    L.push('# donde dice y sin volver a codificar nada.');
  }
  L.push('');
  let n = 0;
  bloques.forEach((b, i) => {
    const m = _corMarcas[b.bid];
    if (!m || m.fin <= m.ini) return;
    n++;
    const ext = _corEsVideo ? 'mp4' : 'wav';
    const sal = corNombre(b, i, ext);
    L.push('# ' + (i + 1) + '. ' + (b.titulo || 'sin título'));
    L.push('ffmpeg -ss ' + corRelojMs(m.ini) + ' -to ' + corRelojMs(m.fin) +
           ' -i "' + ent + '" -c copy "' + sal + '"');
    if (_corEsVideo) {
      L.push('# exacta:');
      L.push('ffmpeg -ss ' + corRelojMs(m.ini) + ' -to ' + corRelojMs(m.fin) +
             ' -i "' + ent + '" -c:v libx264 -preset veryfast -crf 18 -c:a aac "' + sal + '"');
    }
    L.push('');
  });
  if (!n) L.push('# (todavía no hay ni una toma marcada)');
  return L.join('\n');
}

/* ══════════════ LA PANTALLA ══════════════ */

function corRender(cuerpo, bloques, pid, ayuda) {
  _corPid = pid || '';
  const p = corPuede();

  /* ── Lo primero de todo, y sin que nadie lo pregunte ── */
  const aviso = document.createElement('div');
  aviso.className = 'rod-intro';
  aviso.appendChild(Object.assign(document.createElement('div'),
    { className: 'rod-intro-t', textContent: '✂️ De una grabación larga, un archivo por toma' }));
  aviso.appendChild(Object.assign(document.createElement('p'), {
    className: 'rod-intro-p',
    textContent: 'Abre aquí la grabación que hiciste con tu cámara y marca dónde cae cada toma ' +
                 'de la secuencia. La lista de la derecha es la misma que la de Secuencia, así que ' +
                 'no hay que acordarse de nada.',
  }));
  aviso.appendChild(Object.assign(document.createElement('p'), {
    className: 'rod-intro-p rod-cor-privado',
    textContent: '🔒 El archivo NO sale de este aparato. No sube a la nube, no pasa por ninguna red ' +
                 'y no se guarda en ningún sitio: se abre, se mira y se corta aquí mismo.',
  }));
  cuerpo.appendChild(aviso);

  /* ── Qué puede este navegador, dicho antes de marcar nada ── */
  const cap = document.createElement('div');
  cap.className = 'rod-cor-cap' + (p.video ? '' : ' rod-cor-cap-medio');
  const capL = document.createElement('ul');
  capL.className = 'rod-revision-l';
  [
    [p.audio, 'Cortar AUDIO exacto y bajarlo en WAV', 'Este navegador no sabe leer sonido: no podrá cortar audio'],
    [p.video, 'Cortar VIDEO (reproduciendo el trozo: tarda lo que dura y vuelve a codificar)',
              'Este navegador NO puede cortar video (le falta captureStream, como el Safari del iPad)'],
    [true, 'Sacar los tiempos exactos y las órdenes de ffmpeg — esto funciona siempre', ''],
  ].forEach(([si, bien, mal]) => {
    const li = document.createElement('li');
    li.textContent = (si ? '✅ ' : '⛔ ') + (si ? bien : mal);
    if (!si) li.className = 'rod-rev-para';
    capL.appendChild(li);
  });
  cap.appendChild(capL);
  cuerpo.appendChild(cap);

  /* ── Abrir el archivo ── */
  const barra = document.createElement('div');
  barra.className = 'rod-barra';
  const ent = document.createElement('input');
  ent.type = 'file';
  ent.id = 'rod-cor-archivo';
  ent.setAttribute('accept', 'video/*,audio/*');
  ent.className = 'rod-cor-oculto';
  const btn = rodBoton(_corArchivo ? '📂 Abrir otra grabación' : '📂 Abrir la grabación',
                       () => ent.click(), 'rod-b-pri');
  ent.addEventListener('change', () => {
    if (ent.files && ent.files[0]) corAbrir(ent.files[0], ayuda);
  });
  barra.appendChild(btn);
  barra.appendChild(ent);
  if (_corArchivo) {
    barra.appendChild(rodBoton('📋 Los tiempos', () => rodTextoAbrir('Cortes · los tiempos', corTiempos(bloques))));
    barra.appendChild(rodBoton('📋 Órdenes de ffmpeg', () => rodTextoAbrir('Cortes · ffmpeg', corFfmpeg(bloques))));
  }
  cuerpo.appendChild(barra);

  if (!_corArchivo) {
    cuerpo.appendChild(rodVacio('🎞️', 'Ninguna grabación abierta.',
      'Toca «📂 Abrir la grabación» y elige el archivo de tu cámara. Si es largo, la primera vez ' +
      'que cortes audio tardará un poco en leerlo: se lee una sola vez y luego cada toma sale al instante.'));
    return;
  }

  /* ── El archivo abierto ── */
  const ficha = document.createElement('div');
  ficha.className = 'rod-cor-ficha';
  ficha.appendChild(Object.assign(document.createElement('div'),
    { className: 'rod-tit', textContent: _corArchivo.name }));
  const mb = _corArchivo.size / 1048576;
  ficha.appendChild(Object.assign(document.createElement('div'), {
    className: 'rod-sub',
    textContent: (_corEsVideo ? '🎬 Video' : '🎵 Audio') + ' · ' + mb.toFixed(1) + ' MB' +
                 (mb > COR_AVISO_MB ? ' · ⚠️ es grande: leer su sonido puede cerrar la aplicación en una tableta' : ''),
  }));
  cuerpo.appendChild(ficha);

  /* El reproductor se CUELGA, no se crea: es el mismo nodo de siempre, con
     su archivo y su posición. Ver otra pestaña un momento no puede costar
     volver a buscar el archivo en el aparato. */
  const caja = document.createElement('div');
  caja.className = 'rod-cor-caja';
  caja.appendChild(_corMedio);
  cuerpo.appendChild(caja);

  /* ── El mando ── */
  const reloj = document.createElement('div');
  reloj.className = 'rod-cor-reloj';
  reloj.id = 'rod-cor-reloj';
  reloj.textContent = corRelojMs(_corMedio.currentTime);
  cuerpo.appendChild(reloj);

  /* Siete botones caben en una tableta, pero en un teléfono estrecho se
     quedan en 38 px de ancho — por debajo de los 44 que la casa exige—.
     Los de ±5 s llevan su clase y desaparecen ahí: son los únicos que se
     pueden hacer de otra manera, arrastrando el deslizador del propio
     reproductor. Los de una décima no: esos son la razón de que exista
     este mando, porque cortar en el segundo entero te come la primera
     sílaba o te deja la respiración de antes. */
  const mando = document.createElement('div');
  mando.className = 'rod-cor-mando';
  mando.appendChild(rodBoton('⏮', () => corSaltar(-5), 'rod-b-min rod-cor-salto5'));
  [['◀◀', -1], ['◀', -0.1]].forEach(([t, d]) =>
    mando.appendChild(rodBoton(t, () => corSaltar(d), 'rod-b-min')));
  mando.appendChild(rodBoton('▶ / ⏸', () => {
    if (_corMedio.paused) _corMedio.play(); else _corMedio.pause();
  }, 'rod-b-pri'));
  [['▶', 0.1], ['▶▶', 1]].forEach(([t, d]) =>
    mando.appendChild(rodBoton(t, () => corSaltar(d), 'rod-b-min')));
  mando.appendChild(rodBoton('⏭', () => corSaltar(5), 'rod-b-min rod-cor-salto5'));
  cuerpo.appendChild(mando);

  const nota = document.createElement('p');
  nota.className = 'rod-ayuda';
  nota.textContent = 'Lleva el reproductor al principio de una toma y toca «⏱ Entrada» en su fila. ' +
                     'Después, al final, «⏱ Salida». Los botones de ◀ ▶ mueven una décima, que es ' +
                     'lo que hace falta para no cortarte la primera sílaba.';
  cuerpo.appendChild(nota);

  /* ── Las tomas ── */
  const lista = document.createElement('div');
  lista.id = 'rod-cor-lista';
  bloques.forEach((b, i) => lista.appendChild(corFila(b, i, bloques, ayuda)));
  cuerpo.appendChild(lista);
}

function corSaltar(d) {
  if (!_corMedio) return;
  const t = Math.max(0, Math.min(_corMedio.duration || 1e9, _corMedio.currentTime + d));
  _corMedio.currentTime = t;
  corPintarReloj();
}
function corPintarReloj() {
  const e = document.getElementById('rod-cor-reloj');
  if (e && _corMedio) e.textContent = corRelojMs(_corMedio.currentTime);
}

function corFila(b, i, bloques, ayuda) {
  const m = _corMarcas[b.bid] || {};
  const hay = m.fin > m.ini;
  const c = rodClase(b.clase);

  const card = document.createElement('div');
  card.className = 'rod-cor-fila' + (hay ? ' rod-cor-fila-lista' : '');
  card.setAttribute('data-cor-bid', b.bid);

  const cab = document.createElement('div');
  cab.className = 'rod-tira';
  cab.appendChild(rodChip(String(i + 1).padStart(2, '0'), 'rod-p-' + c.col));
  cab.appendChild(rodChip(c.ic + ' ' + c.n, 'rod-p-' + c.col));
  cab.appendChild(rodChip('previsto ' + rodReloj(b.dur)));
  card.appendChild(cab);

  card.appendChild(Object.assign(document.createElement('div'),
    { className: 'rod-tit', textContent: b.titulo || '(sin título)' }));

  const marcas = document.createElement('div');
  marcas.className = 'rod-cor-marcas';
  marcas.appendChild(Object.assign(document.createElement('span'), {
    className: 'rod-cor-m' + (m.ini != null ? ' rod-cor-m-si' : ''),
    textContent: '⏱ ' + (m.ini != null ? corReloj(m.ini) : '—'),
  }));
  marcas.appendChild(Object.assign(document.createElement('span'),
    { className: 'rod-cor-flecha', textContent: '→' }));
  marcas.appendChild(Object.assign(document.createElement('span'), {
    className: 'rod-cor-m' + (m.fin != null ? ' rod-cor-m-si' : ''),
    textContent: (m.fin != null ? corReloj(m.fin) : '—'),
  }));
  if (hay) {
    /* Lo marcado frente a lo previsto. Es el número que dice si te
       equivocaste de toma al marcar: una que tenía que durar 0:30 y te
       sale de 2:10 casi nunca es que hablaras despacio. */
    const d = (m.fin - m.ini) - Number(b.dur || 0);
    marcas.appendChild(Object.assign(document.createElement('span'), {
      className: 'rod-cor-dif' + (Math.abs(d) > Math.max(10, b.dur * 0.6) ? ' rod-cor-dif-ojo' : ''),
      textContent: 'dura ' + corReloj(m.fin - m.ini) +
                   (Math.abs(d) > Math.max(10, b.dur * 0.6) ? ' · ¿es esta toma?' : ''),
    }));
  }
  card.appendChild(marcas);

  const btns = document.createElement('div');
  btns.className = 'rod-btns';
  btns.appendChild(rodBoton('⏱ Entrada', () => corMarcar(b, 'ini', bloques, ayuda)));
  btns.appendChild(rodBoton('⏱ Salida', () => corMarcar(b, 'fin', bloques, ayuda)));
  if (hay) {
    btns.appendChild(rodBoton('▶ Probar', () => corProbar(b)));
    btns.appendChild(rodBoton('⬇ Audio', () => corBajarAudio(b, i, ayuda)));
    if (_corEsVideo && corPuede().video) {
      btns.appendChild(rodBoton('⬇ Video', () => corBajarVideo(b, i, ayuda)));
    }
    btns.appendChild(rodBoton('✕', () => {
      delete _corMarcas[b.bid];
      corGuardarMarcas();
      corRepintar(bloques, ayuda);
    }, 'rod-b-min'));
  }
  card.appendChild(btns);
  return card;
}

function corMarcar(b, cual, bloques, ayuda) {
  if (!_corMedio) return;
  const m = _corMarcas[b.bid] || (_corMarcas[b.bid] = {});
  m[cual] = _corMedio.currentTime;
  /* Si al poner la entrada todavía no hay salida, se propone la duración
     prevista: casi siempre está cerca y se ajusta con dos toques, que es
     mejor que escribirla desde cero. Nunca pisa una salida ya puesta. */
  if (cual === 'ini' && m.fin == null && Number(b.dur) > 0) {
    m.fin = m.ini + Number(b.dur);
  }
  corGuardarMarcas();
  corRepintar(bloques, ayuda);
}

function corProbar(b) {
  const m = _corMarcas[b.bid];
  if (!m || !_corMedio) return;
  _corMedio.currentTime = m.ini;
  _corMedio.play();
  const para = () => {
    if (_corMedio.currentTime >= m.fin || _corMedio.paused) {
      _corMedio.pause();
      corPintarReloj();
      return;
    }
    requestAnimationFrame(para);
  };
  requestAnimationFrame(para);
}

async function corBajarAudio(b, i, ayuda) {
  if (_corTrabajando) return;
  const m = _corMarcas[b.bid];
  if (!m || m.fin <= m.ini) return;
  _corTrabajando = b.bid;
  try {
    const buf = await corDecodificar(ayuda);
    if (!buf) return;
    if (ayuda) ayuda('✂️ Cortando el audio de «' + (b.titulo || 'sin título') + '»…');
    const blob = corWavDe(buf, m.ini, m.fin);
    corBajar(blob, corNombre(b, i, 'wav'));
    if (ayuda) ayuda('⬇ ' + corNombre(b, i, 'wav') + ' · ' +
                     (blob.size / 1048576).toFixed(1) + ' MB');
  } finally {
    _corTrabajando = '';
  }
}

async function corBajarVideo(b, i, ayuda) {
  if (_corTrabajando) return;
  const m = _corMarcas[b.bid];
  if (!m || m.fin <= m.ini) return;
  const dur = m.fin - m.ini;
  if (!confirm('Cortar el video reproduce el trozo entero para volver a grabarlo: va a tardar ' +
               corReloj(dur) + ' y va a sonar. Además vuelve a codificar la imagen.\n\n' +
               'Si tienes ffmpeg a mano, «📋 Órdenes de ffmpeg» lo hace al instante y sin pérdida. ' +
               '¿Seguir aquí?')) return;
  _corTrabajando = b.bid;
  try {
    const blob = await corVideoTrozo(m.ini, m.fin, pct => {
      if (ayuda) ayuda('🎬 Grabando el trozo… ' + Math.round(pct * 100) + '%');
    });
    const ext = (blob.type || '').indexOf('mp4') >= 0 ? 'mp4' : 'webm';
    corBajar(blob, corNombre(b, i, ext));
    if (ayuda) ayuda('⬇ ' + corNombre(b, i, ext) + ' · ' + (blob.size / 1048576).toFixed(1) + ' MB');
  } catch (e) {
    if (ayuda) ayuda('⚠️ No se pudo cortar el video: ' + (e && e.message) +
                     '. Los tiempos y las órdenes de ffmpeg siguen ahí.');
  } finally {
    _corTrabajando = '';
  }
}

function corAbrir(file, ayuda) {
  if (_corUrl) { try { URL.revokeObjectURL(_corUrl); } catch (e) {} }
  _corArchivo = file;
  _corBuffer = null;                     // otro archivo, otro sonido
  _corEsVideo = /^video\//.test(file.type) || /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(file.name);
  _corUrl = URL.createObjectURL(file);

  _corMedio = document.createElement(_corEsVideo ? 'video' : 'audio');
  _corMedio.className = 'rod-cor-medio';
  _corMedio.setAttribute('controls', '');
  _corMedio.setAttribute('playsinline', '');
  _corMedio.setAttribute('preload', 'metadata');
  _corMedio.setAttribute('src', _corUrl);
  _corMedio.addEventListener('timeupdate', corPintarReloj);
  _corMedio.addEventListener('seeked', corPintarReloj);

  corCargarMarcas();
  if (ayuda) ayuda('📂 ' + file.name + ' · el archivo no sale de este aparato');
  if (window.FaroCortes && window.FaroCortes.alAbrir) window.FaroCortes.alAbrir();
}

/* Repintar la pestaña sin perder el reproductor: lo saca del documento
   antes de vaciar y lo vuelve a colgar. Es lo mismo que hace el resto de
   la herramienta con los relojes, y por lo mismo. */
function corRepintar(bloques, ayuda) {
  if (window.FaroCortes && window.FaroCortes.alRepintar) window.FaroCortes.alRepintar();
}

/* Lo de dentro se saca para la sonda. Son las cuentas que se pueden
   comprobar sin una cámara y sin un archivo de verdad, que es justo lo
   que una sonda puede hacer. */
window.FaroCortes = {
  version: 1,
  puede: corPuede,
  relojMs: corRelojMs,
  reloj: corReloj,
  nombre: corNombre,
  wavDe: corWavDe,
  tiempos: corTiempos,
  ffmpeg: corFfmpeg,
  render: corRender,
  abrir: corAbrir,
  /* Para que la sonda pueda sembrar marcas sin tocar la pantalla. */
  _marcas: () => _corMarcas,
  _ponMarcas: m => { _corMarcas = m; },
  _ponArchivo: (nombre, tam, esVideo) => {
    _corArchivo = { name: nombre, size: tam };
    _corEsVideo = !!esVideo;
  },
  alAbrir: null,
  alRepintar: null,
};
