'use strict';

/* ─────────────────────────────────────────────
   DICCIONARIO 📖 · la memoria léxica del corrector

   El corrector de reglas caza errores de norma (tildes con historia,
   dequeísmo, «haber» impersonal…), pero un error de tecleo cualquiera
   («conveza» por «convenza», «filosfía» por «filosofía») no es de
   norma: es una palabra que NO EXISTE. Para cazarlo hace falta saber
   qué palabras existen. Eso es este módulo.

   Usa el diccionario hunspell del español de Honduras (es_HN, del
   proyecto RLA-ES, el mismo de LibreOffice): 56.841 raíces que, con
   sus reglas de prefijos y sufijos, se expanden a más de 570.000
   formas válidas: cada conjugación, cada plural, cada diminutivo.
   Más un complemento local (es_extra.dic) con el léxico de la casa,
   y el diccionario personal de la familia (localStorage), porque
   los apellidos y las palabras propias no son errores.

   Todo corre AQUÍ, en el aparato: ni una palabra del texto sale
   hacia ningún servicio externo. La expansión se hace por trozos
   en segundo plano para no congelar la escritura; tarda unos
   segundos una sola vez por sesión.
───────────────────────────────────────────── */

const DICC_PERSONAL_KEY = 'faro_dicc_personal_v1';
const DICC_RUTAS = {
  aff: 'js/data/dicc/es_HN.aff',
  dic: 'js/data/dicc/es_HN.dic',
  extra: 'js/data/dicc/es_extra.dic',
};

let _diccFormas = null;      // Set con TODAS las formas válidas expandidas
let _diccRep = [];           // tabla REP del .aff: confusiones típicas (b/v, ll/y…)
let _diccTry = 'aeroinsctldumpbgfvhzóíjáqéñxyúükw';   // alfabeto para sugerencias
let _diccEstado = 'apagado'; // apagado | cargando | listo | fallo
let _diccFraccion = 0;       // progreso 0..1 de la expansión
let _diccAvisos = [];        // quién quiere enterarse cuando esté listo
let _diccPersonal = null;    // Set con las palabras que la familia enseñó

/* ── El diccionario personal: lo que la familia le enseña ── */
function diccPersonal() {
  if (_diccPersonal) return _diccPersonal;
  let lista = [];
  try { lista = JSON.parse(localStorage.getItem(DICC_PERSONAL_KEY)) || []; } catch (_) {}
  _diccPersonal = new Set(lista);
  return _diccPersonal;
}
function diccPersonalGuardar() {
  try { localStorage.setItem(DICC_PERSONAL_KEY, JSON.stringify([...diccPersonal()])); } catch (_) {}
}
function diccAprender(palabra) {
  if (!palabra) return;
  diccPersonal().add(palabra);
  diccPersonalGuardar();
}
function diccOlvidar(palabra) {
  diccPersonal().delete(palabra);
  diccPersonalGuardar();
}

/* ── Leer el formato hunspell ──────────────────────────────────────
   El .aff trae las reglas: SFX/PFX (cómo se conjugan y derivan las
   raíces del .dic), REP (confusiones frecuentes de sonido: se usa
   para sugerir) y TRY (el alfabeto ordenado por frecuencia). El .dic
   trae raíz/banderas, una por línea. FLAG UTF-8: cada bandera es un
   carácter. */
function diccParseAff(textoAff) {
  const sfx = {}, pfx = {}, cruza = {}, rep = [];
  let tryLinea = _diccTry;
  for (const linea of textoAff.split(/\r?\n/)) {
    const p = linea.split(/\s+/);
    if (p[0] === 'TRY' && p[1]) { tryLinea = p[1]; continue; }
    if (p[0] === 'REP' && p[1] && p[2]) { rep.push([p[1], p[2]]); continue; }
    if (p[0] !== 'SFX' && p[0] !== 'PFX') continue;
    const tabla = p[0] === 'SFX' ? sfx : pfx;
    if (p[3] !== undefined && /^\d+$/.test(p[3]) && (p[2] === 'Y' || p[2] === 'N')) {
      tabla[p[1]] = tabla[p[1]] || [];
      cruza[p[0] + p[1]] = p[2] === 'Y';
    } else if (p[1] !== undefined && p[3] !== undefined) {
      let re = null;
      if (p[4] && p[4] !== '.') {
        try { re = new RegExp((p[0] === 'SFX' ? p[4] + '$' : '^' + p[4]), 'u'); } catch (_) {}
      }
      const [pone, cont] = (p[3] === '0' ? '' : p[3]).split('/');
      (tabla[p[1]] = tabla[p[1]] || []).push({
        quita: p[2] === '0' ? '' : p[2],
        pone,
        /* Banderas de continuación: «SFX N ca quilla/S ca» dice que el
           derivado en -quilla admite A SU VEZ el plural S. Ignorarlas
           costaba 1.398 formas legítimas (rosquillas, pastelillos…)
           que luego se acusaban como tecleo. Hunspell solo permite un
           nivel de continuación, así que con uno basta. */
        cont: cont || '',
        cond: re,
      });
    }
  }
  return { sfx, pfx, cruza, rep, tryLinea };
}

/* Expande UNA línea del .dic a todas sus formas dentro del Set */
function diccExpandeLinea(linea, aff, formas) {
  const limpia = linea.trim();
  if (!limpia || limpia.startsWith('#') || /^\d+$/.test(limpia)) return;
  const barra = limpia.indexOf('/');
  const palabra = barra < 0 ? limpia : limpia.slice(0, barra);
  const banderas = barra < 0 ? '' : limpia.slice(barra + 1);
  formas.add(palabra);
  if (!banderas) return;
  const conSufijo = [];
  for (const f of banderas) {
    const entradas = aff.sfx[f];
    if (!entradas) continue;
    for (const e of entradas) {
      if (e.quita && !palabra.endsWith(e.quita)) continue;
      if (e.cond && !e.cond.test(palabra)) continue;
      const forma = (e.quita ? palabra.slice(0, -e.quita.length) : palabra) + e.pone;
      formas.add(forma);
      if (aff.cruza['SFX' + f]) conSufijo.push(forma);
      /* Un nivel de continuación: rosca→rosquilla→rosquillas */
      for (const f2 of e.cont) {
        const entradas2 = aff.sfx[f2];
        if (!entradas2) continue;
        for (const e2 of entradas2) {
          if (e2.quita && !forma.endsWith(e2.quita)) continue;
          if (e2.cond && !e2.cond.test(forma)) continue;
          formas.add((e2.quita ? forma.slice(0, -e2.quita.length) : forma) + e2.pone);
        }
      }
    }
  }
  for (const f of banderas) {
    const entradas = aff.pfx[f];
    if (!entradas) continue;
    for (const e of entradas) {
      if (e.cond && !e.cond.test(palabra)) continue;
      formas.add(e.pone + palabra.slice(e.quita.length));
      if (aff.cruza['PFX' + f]) for (const s of conSufijo) formas.add(e.pone + s.slice(e.quita.length));
    }
  }
}

/* El complemento local, con la guardia puesta: si lo que llegó no
   parece una lista de palabras (HTML de un portal cautivo, un error
   del servidor), NADA de eso entra al diccionario: una línea basura
   admitida es un tecleo que nunca más se avisaría. */
function diccExtraFormas(textoExtra, formas) {
  const texto = textoExtra || '';
  if (texto.trimStart().startsWith('<')) return;   // eso es HTML, no un diccionario
  for (const linea of texto.split(/\r?\n/)) {
    const w = linea.trim();
    if (!w || w.startsWith('#')) continue;
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’-]+$/u.test(w)) continue;
    formas.add(w);
  }
}

/* Carga completa desde textos ya en mano (síncrona: la usan las
   pruebas de Node y el tramo final de la carga del navegador). */
function diccCargarDesdeTexto(textoAff, textoDic, textoExtra) {
  const aff = diccParseAff(textoAff);
  _diccRep = aff.rep;
  _diccTry = aff.tryLinea.toLowerCase();
  const formas = new Set();
  for (const linea of textoDic.split(/\r?\n/)) diccExpandeLinea(linea, aff, formas);
  diccExtraFormas(textoExtra, formas);
  _diccFormas = formas;
  _diccEstado = 'listo';
  _diccFraccion = 1;
  return formas.size;
}

/* ── La carga del navegador: por trozos, sin congelar nada ── */
function diccPausa() {
  return new Promise(r => {
    if (typeof requestIdleCallback === 'function') requestIdleCallback(() => r(), { timeout: 200 });
    else setTimeout(r, 0);
  });
}

async function diccArrancar() {
  if (_diccEstado === 'cargando' || _diccEstado === 'listo') return;
  _diccEstado = 'cargando';
  _diccFraccion = 0;
  try {
    const [rAff, rDic, rExtra] = await Promise.all([
      fetch(DICC_RUTAS.aff), fetch(DICC_RUTAS.dic), fetch(DICC_RUTAS.extra),
    ]);
    if (!rAff.ok || !rDic.ok) throw new Error('descarga del diccionario: ' + rAff.status + '/' + rDic.status);
    const [tAff, tDic, tExtra] = await Promise.all([
      rAff.text(), rDic.text(), rExtra.ok ? rExtra.text() : Promise.resolve(''),
    ]);
    const aff = diccParseAff(tAff);
    _diccRep = aff.rep;
    _diccTry = aff.tryLinea.toLowerCase();
    const lineas = tDic.split(/\r?\n/);
    const formas = new Set();
    const TROZO = 1500;
    for (let i = 0; i < lineas.length; i += TROZO) {
      for (let j = i; j < Math.min(i + TROZO, lineas.length); j++) {
        diccExpandeLinea(lineas[j], aff, formas);
      }
      _diccFraccion = Math.min(0.99, (i + TROZO) / lineas.length);
      await diccPausa();
    }
    diccExtraFormas(tExtra, formas);
    /* La prueba del algodón: ¿esto ES un diccionario? Si la descarga
       vino envenenada (la pantalla de la puerta de Cloudflare, un
       error en HTML, un servidor bromista), el resultado no sabe ni
       «casa»: usarlo acusaría TODAS las palabras del texto. Mejor
       ningún diccionario que uno falso. Mismo criterio que
       sePuedeGuardar() en sw.js. */
    if (formas.size < 100000 || !formas.has('casa') || !formas.has('educación')) {
      throw new Error('la descarga no parece un diccionario');
    }
    _diccFormas = formas;
    _diccEstado = 'listo';
    _diccFraccion = 1;
  } catch (e) {
    /* Sin red y sin caché la primera vez, o navegador sin lookbehind:
       el corrector sigue funcionando con sus reglas, solo que sin la
       caza de palabras desconocidas. Nada revienta. */
    _diccEstado = 'fallo';
  }
  const avisos = _diccAvisos.splice(0);
  avisos.forEach(cb => { try { cb(_diccEstado === 'listo'); } catch (_) {} });
}

function diccListo() { return _diccEstado === 'listo'; }
function diccEstado() { return _diccEstado; }
function diccProgreso() { return _diccFraccion; }
function diccAlTerminar(cb) {
  if (_diccEstado === 'listo' || _diccEstado === 'fallo') cb(_diccEstado === 'listo');
  else _diccAvisos.push(cb);
}

/* ── ¿Existe esta palabra? ─────────────────────────────────────────
   Con cabeza para las mayúsculas: «Fue» al inicio de oración vale
   porque «fue» existe; «aristóteles» vale porque «Aristóteles» está
   en el diccionario (escribirlo en minúscula será falta de mayúscula,
   no de tecleo); «ADN» vale tal cual. Y con oído hondureño: el voseo
   y los diminutivos son español legítimo aunque es_HN no los liste. */

/* El voseo, por derivación. es_HN trae algunas formas voseantes
   (sabés, decí, mirá) pero no todas (jugás, pensés, andá), y no trae
   vosotros. La pariente fiable es el TUTEO, deshaciendo el detalle
   de que el voseo no diptonga la raíz: jugás~juegas, pensés~pienses,
   podés~puedes, andá~anda. Solo se acepta lo que esa vía confirma:
   «no hagás ruido» pasa, «hagáz» no. */
function diccVoseoRaices(raiz) {
  const out = [raiz];
  /* la última vocal de la raíz diptonga en tuteo: jug→jueg, pens→piens */
  const m = raiz.match(/^(.*?)([eiou])([^aeiouáéíóúü]*)$/u);
  if (m) {
    const dip = { o: 'ue', u: 'ue', e: 'ie', i: 'ie' }[m[2]];
    if (dip) out.push(m[1] + dip + m[3]);
  }
  return out;
}
function diccVoseo(bajo) {
  if (bajo.length < 4) return [];
  const out = [];
  if (bajo.endsWith('ás')) {
    for (const r of diccVoseoRaices(bajo.slice(0, -2))) out.push(r + 'as');
  } else if (bajo.endsWith('és')) {
    for (const r of diccVoseoRaices(bajo.slice(0, -2))) out.push(r + 'es');
  } else {
    const fin = { 'á': 'a', 'é': 'e' }[bajo.slice(-1)];   // imperativo: andá→anda, comé→come
    if (fin) for (const r of diccVoseoRaices(bajo.slice(0, -1))) out.push(r + fin);
    /* el imperativo en -í (subí, escribí) coincide con el pretérito
       (yo subí), que ya está en el diccionario: no necesita vía. */
  }
  return out;
}

/* Los diminutivos, por derivación: -ito/-ita (con sus formas -cito,
   -ecito y el plural) es productivo en español y el diccionario no
   puede listarlos todos. Se le quita el traje de diminutivo y se
   pregunta por la base: abuelita→abuela, cafecito→café, pancito→pan,
   amiguito→amigo (gu→g), cerquita→cerca (qu→c), abracito→abrazo
   (c→z), lapicito→lápiz. Dos vueltas para el cariño doble
   (poquitito→poquito→poco). */
function diccBasesDiminutivo(bajo) {
  const m = bajo.match(/^(.{2,})(?:it[oa]s?)$/u);
  if (!m) return [];
  const r = m[1];
  const bases = [r + 'o', r + 'a', r + 'e', r + 'os', r + 'as', r + 'es'];
  if (r.endsWith('qu')) { const t = r.slice(0, -2) + 'c'; bases.push(t + 'o', t + 'a', t + 'os', t + 'as'); }
  if (r.endsWith('gu')) { const t = r.slice(0, -2) + 'g'; bases.push(t + 'o', t + 'a', t + 'os', t + 'as'); }
  if (r.endsWith('c')) {
    const t = r.slice(0, -1);
    bases.push(t, t + 'z', t + 'o', t + 'a', t + 'e', t + 'n');   // pancito→pan, abracito→abrazo, cafecito→café (vía tilde)
  }
  return bases;
}

function diccMiembro(cand) {
  if (_diccFormas.has(cand) || diccPersonal().has(cand)) return true;
  const cap = cand.charAt(0).toUpperCase() + cand.slice(1);
  if (_diccFormas.has(cap)) return true;
  /* La base puede llevar tilde que el diminutivo perdió: cafe→café */
  for (const v of diccVariantesTilde(cand)) if (_diccFormas.has(v)) return true;
  return false;
}

function diccConoce(palabra) {
  if (!_diccFormas || !palabra) return true;   // sin diccionario no se acusa a nadie
  const p = diccPersonal();
  if (_diccFormas.has(palabra) || p.has(palabra)) return true;
  const bajo = palabra.toLowerCase();
  if (bajo !== palabra && (_diccFormas.has(bajo) || p.has(bajo))) return true;
  const cap = bajo.charAt(0).toUpperCase() + bajo.slice(1);
  if (cap !== palabra && _diccFormas.has(cap)) return true;
  for (const v of diccVoseo(bajo)) if (_diccFormas.has(v)) return true;
  for (const b of diccBasesDiminutivo(bajo)) {
    if (diccMiembro(b)) return true;
    const otra = diccBasesDiminutivo(b);   // poquitito→poquito→poco
    for (const b2 of otra) if (diccMiembro(b2)) return true;
  }
  return false;
}

/* La forma «canónica» con la que el diccionario conoce a una
   candidata, o null: sirve para que las sugerencias salgan con su
   mayúscula de diccionario («aristoteles» → «Aristóteles»). */
function diccForma(candidata) {
  if (_diccFormas.has(candidata) || diccPersonal().has(candidata)) return candidata;
  const cap = candidata.charAt(0).toUpperCase() + candidata.slice(1);
  if (_diccFormas.has(cap)) return cap;
  return null;
}

/* ── Sugerencias: ¿qué quiso escribir? ─────────────────────────────
   Cuatro cañas de pescar, de la más certera a la más ancha:
   1. Tildes: la misma palabra con la tilde quitada, puesta o movida
      («filosfía» no entra aquí, pero «filósofico» → «filosófico» sí).
   2. La tabla REP del diccionario: confusiones de sonido documentadas
      (b/v, ll/y, s/c/z, g/j, h que sobra o falta…).
   3. Distancia de edición 1: una letra quitada, sobrante, cambiada o
      bailada («conveza» +n→ «convenza», «ovbio» → «obvio»).
   4. Partirla en dos palabras que existan («detodo» → «de todo»):
      al final, porque casi cualquier cosa se puede partir y las
      buenas sugerencias no deben quedar detrás de «con veza».
   Se devuelven sin repetir, mejores primero. */
const DICC_TILDE = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
const DICC_DESTILDE = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };

function diccVariantesTilde(w) {
  const sin = w.replace(/[áéíóú]/g, c => DICC_DESTILDE[c]);
  const out = [];
  if (sin !== w) out.push(sin);
  for (let i = 0; i < sin.length; i++) {
    const con = DICC_TILDE[sin[i]];
    if (!con) continue;
    const v = sin.slice(0, i) + con + sin.slice(i + 1);
    if (v !== w) out.push(v);
  }
  return out;
}

function diccSugerencias(palabra, max) {
  if (!_diccFormas) return [];
  max = max || 5;
  const bajo = palabra.toLowerCase();
  const vistas = new Set([bajo, palabra]);
  const out = [];
  const prueba = c => {
    if (c.length < 1 || vistas.has(c)) return;
    vistas.add(c);
    const forma = diccForma(c);
    if (forma && !out.includes(forma)) out.push(forma);
  };

  for (const v of diccVariantesTilde(bajo)) prueba(v);

  for (const [de, a] of _diccRep) {
    let idx = bajo.indexOf(de);
    while (idx >= 0) {
      prueba(bajo.slice(0, idx) + a + bajo.slice(idx + de.length));
      idx = bajo.indexOf(de, idx + 1);
    }
  }

  if (out.length < max) {
    const AL = [...new Set((_diccTry + 'áéíóúñü').replace(/[^a-záéíóúñü]/g, ''))];
    for (let i = 0; i <= bajo.length; i++) {
      if (i < bajo.length) prueba(bajo.slice(0, i) + bajo.slice(i + 1));                          // quitada
      if (i < bajo.length - 1) prueba(bajo.slice(0, i) + bajo[i + 1] + bajo[i] + bajo.slice(i + 2)); // bailada
      for (const c of AL) {
        if (i < bajo.length && c !== bajo[i]) prueba(bajo.slice(0, i) + c + bajo.slice(i + 1));   // cambiada
        prueba(bajo.slice(0, i) + c + bajo.slice(i));                                             // sobrante
      }
      if (out.length >= max * 3) break;
    }
  }

  if (out.length < max) {
    for (let i = 2; i <= bajo.length - 2; i++) {
      const a = bajo.slice(0, i), b = bajo.slice(i);
      if (diccForma(a) && diccForma(b)) {
        const junta = a + ' ' + b;
        if (!out.includes(junta)) out.push(junta);
      }
    }
  }
  return out.slice(0, max);
}

/* ── Para las pruebas de Node ── */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    diccCargarDesdeTexto, diccConoce, diccSugerencias, diccListo,
    diccAprender, diccOlvidar, diccEstado, diccParseAff,
  };
}
