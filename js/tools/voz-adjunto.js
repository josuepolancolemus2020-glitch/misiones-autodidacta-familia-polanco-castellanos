'use strict';

/* ─────────────────────────────────────────────
   📎 EL ADJUNTO DE LA VOZ PRESTADA
   ─────────────────────────────────────────────
   PARA QUÉ: pedido por el autor el 12 de septiembre de 2026, después de
   pelearse con un informe de investigación pegado a mano: «al adjuntar
   en pdf o en Documentos de Google, o un word, las citas ya están bien
   específicas y con mejor orden, de esta manera el sistema podrá
   interpretar todo de mejor manera, y podrá incluso poner el título».

   Y tiene toda la razón, por un motivo que se puede escribir: cuando se
   COPIA un informe de una pantalla, lo que viaja es texto pelado — los
   títulos pierden su renglón, las tablas se deshacen, los numeritos de
   las citas son dibujos y no llegan, y la lista de fuentes se queda
   donde estaba. Un ARCHIVO no: un .docx lleva dentro, dicho con todas
   las letras, qué párrafo es un título y de qué nivel, qué es una
   tabla y dónde están sus celdas, qué trozo va en superíndice y a qué
   nota al pie apunta, y a dónde lleva cada enlace. Es la misma
   información, pero sin haberla perdido por el camino.

   ⚠️ Y LA REGLA QUE MANDA AQUÍ: ESTO NO ES UN SEGUNDO LECTOR. No
   entiende textos: los ESCRIBE en el mismo alfabeto que `vozLeer` ya
   entiende —«#» y «##» para las cabeceras, «>» para las citas, «- »
   para las listas, tubos para las tablas, «[3]» para las llamadas y
   «[^3]: …» para las notas al pie— y los deja en el recuadro de pegar,
   a la vista, para que la persona vea QUÉ LLEGÓ antes de guardar nada.
   Dos lectores con dos juegos de reglas se irían separando solos, y el
   día que alguien arreglara uno el otro se quedaría roto; y un adjunto
   que se guardara sin enseñarse sería la única parte de esta
   herramienta que hace cosas a espaldas de quien la usa.

   ⚠️ Y VIVE EN SU PROPIO ARCHIVO, como el banco de cortes de El Rodaje
   y por lo mismo: `voz-prestada.js` no toca ni un aparato del
   navegador —lee, reparte y guarda—, mientras que esto toca
   `DecompressionStream`, `DOMParser`, `File` y `ArrayBuffer`, y cada
   uno falla de una manera distinta en cada aparato. SI ESTO NO CARGA,
   LA HOJA DE PEGAR SIGUE ENTERA: el botón lo dice y ya. La sonda lo
   comprueba apagándolo a propósito.

   DE DÓNDE SALE EL ARCHIVO: del selector del propio aparato, que en una
   tableta y en un teléfono YA ofrece Drive, OneDrive y la carpeta de
   descargas como orígenes. No hace falta ninguna cuenta conectada ni
   ninguna clave de nadie, y eso no es una renuncia: meter aquí el
   selector de Google o el de Microsoft sería traer dos identificaciones
   más, dos librerías de fuera y dos cosas que pueden caerse, para
   llegar al mismo archivo al que ya se llega.

   QUÉ SE LEE, Y POR QUÉ ESOS:
     · .docx  — Word, y también lo que sale de Documentos de Google al
                descargarlo como Word. Es el que más información trae.
     · .odt   — el mismo aparato por dentro (un zip con su XML).
     · .html  — Documentos de Google «Descargar como página web».
     · .txt, .md — texto tal cual.
     · .pdf   — NO, y se dice por qué en vez de devolver un revoltijo:
                ver `vadjPdfNo()`.
───────────────────────────────────────────── */

/* El tope. Un informe de cien páginas en .docx no llega a dos megas; lo
   que pase de aquí casi siempre es un archivo con imágenes dentro, y
   descomprimirlo en una tableta la deja parada. */
const VADJ_MAX = 12 * 1024 * 1024;

const VADJ_W  = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const VADJ_R  = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const VADJ_TX = 'urn:oasis:names:tc:opendocument:xmlns:text:1.0';
const VADJ_TB = 'urn:oasis:names:tc:opendocument:xmlns:table:1.0';

/* Lo que el selector del aparato deja elegir. El PDF va incluido A
   PROPÓSITO aunque no se lea: si no estuviera, quien lo intente se
   encuentra un archivo que no se puede ni seleccionar y sin ninguna
   explicación, que es la peor de las dos maneras de decir que no. */
const VADJ_ACEPTA = '.docx,.odt,.html,.htm,.md,.markdown,.txt,.text,.pdf';

function vadjPuede() {
  return typeof DecompressionStream === 'function' && typeof DOMParser === 'function';
}

/* ══════════════ EL ZIP ══════════════
   Un .docx y un .odt son carpetas comprimidas. No hace falta traer una
   librería para abrirlas: el navegador sabe descomprimir desde hace
   años (`DecompressionStream`), y lo único que hay que escribir es el
   índice del zip, que son treinta líneas. Una librería de fuera aquí
   sería un archivo más que cargar en el arranque —el que costó quince
   segundos— para hacer algo que ya viene puesto. */
function vadjZipAbrir(buf) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf);
  /* El final del directorio se busca desde atrás: el comentario del zip
     puede medir hasta 64 KB y va después. */
  let fin = -1;
  for (let i = u8.length - 22; i >= 0 && i > u8.length - 66000; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { fin = i; break; }
  }
  if (fin < 0) throw new Error('no-es-zip');
  const n = dv.getUint16(fin + 10, true);
  let p = dv.getUint32(fin + 16, true);
  const entradas = new Map();
  const td = new TextDecoder('utf-8');
  for (let k = 0; k < n && p + 46 <= u8.length; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const metodo  = dv.getUint16(p + 10, true);
    const comp    = dv.getUint32(p + 20, true);
    const largoN  = dv.getUint16(p + 28, true);
    const largoE  = dv.getUint16(p + 30, true);
    const largoC  = dv.getUint16(p + 32, true);
    const local   = dv.getUint32(p + 42, true);
    entradas.set(td.decode(u8.subarray(p + 46, p + 46 + largoN)), { metodo, comp, local });
    p += 46 + largoN + largoE + largoC;
  }
  return { dv, u8, entradas };
}

/* ⚠️ Los tamaños se leen del DIRECTORIO, no de la cabecera de cada
   archivo: Word escribe ceros en la cabecera y pone el tamaño en un
   descriptor DETRÁS de los datos, así que quien se fíe de la cabecera
   lee cero bytes y se encuentra un documento vacío sin ningún error. */
async function vadjZipSacar(zip, nombre) {
  const e = zip.entradas.get(nombre);
  if (!e) return null;
  const { dv, u8 } = zip;
  if (dv.getUint32(e.local, true) !== 0x04034b50) return null;
  const ini = e.local + 30 + dv.getUint16(e.local + 26, true) + dv.getUint16(e.local + 28, true);
  const datos = u8.slice(ini, ini + e.comp);
  if (e.metodo === 0) return new TextDecoder('utf-8').decode(datos);
  const flujo = new Blob([datos]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return await new Response(flujo).text();
}

function vadjXml(txt) {
  const d = new DOMParser().parseFromString(txt, 'application/xml');
  if (d.getElementsByTagName('parsererror').length) throw new Error('xml-roto');
  return d;
}

/* ══════════════ WORD (.docx) ══════════════ */

/* El nivel de cabecera de un párrafo. El identificador del estilo es el
   mismo en cualquier idioma de Word («Heading1»), pero Documentos de
   Google y LibreOffice escriben el suyo, así que se miran los dos, y de
   respaldo el `outlineLvl`, que es el nivel de verdad y no depende de
   cómo se llame el estilo. */
function vadjNivelCabecera(p) {
  const pPr = [...p.children].find(x => x.localName === 'pPr');
  if (!pPr) return 0;
  const estilo = [...pPr.children].find(x => x.localName === 'pStyle');
  const id = estilo ? (estilo.getAttributeNS(VADJ_W, 'val') || '') : '';
  const s = id.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s/g, '');
  if (/^(title|titulo|ttulo|subtitle|subtitulo)$/.test(s)) return /sub/.test(s) ? 2 : 1;
  let m = s.match(/^(heading|titulo|ttulo|titre|berschrift|encabezado)(\d)$/);
  if (m) return Math.min(6, parseInt(m[2], 10) + 1);
  const ol = [...pPr.children].find(x => x.localName === 'outlineLvl');
  if (ol) {
    const v = parseInt(ol.getAttributeNS(VADJ_W, 'val') || '', 10);
    if (!isNaN(v) && v < 9) return Math.min(6, v + 2);
  }
  return 0;
}

function vadjEsLista(p) {
  const pPr = [...p.children].find(x => x.localName === 'pPr');
  return !!(pPr && [...pPr.children].some(x => x.localName === 'numPr'));
}

function vadjEsCita(p) {
  const pPr = [...p.children].find(x => x.localName === 'pPr');
  if (!pPr) return false;
  const estilo = [...pPr.children].find(x => x.localName === 'pStyle');
  const id = estilo ? (estilo.getAttributeNS(VADJ_W, 'val') || '').toLowerCase() : '';
  return /quote|cita/.test(id);
}

function vadjEsSuper(r) {
  const rPr = [...r.children].find(x => x.localName === 'rPr');
  if (!rPr) return false;
  const va = [...rPr.children].find(x => x.localName === 'vertAlign');
  return !!(va && va.getAttributeNS(VADJ_W, 'val') === 'superscript');
}

/* El texto de un párrafo de Word, con lo que importa convertido al
   alfabeto del lector. Aquí es donde se gana de verdad frente a copiar
   y pegar:

   ⚠️ UN SUPERÍNDICE DE DÍGITOS SE CONVIERTE EN «[3]». Eso es
   exactamente lo que el autor echaba en falta: al copiar la pantalla de
   un informe, los numeritos de las citas no son letras y no viajan; en
   el archivo SÍ están, dichos como superíndice, y aquí se escriben como
   una llamada que el lector entiende.

   ⚠️ Y UNA NOTA AL PIE SE CONVIERTE EN «[^3]», con su texto al final.
   En un trabajo académico es donde vive la mitad de las citas. */
function vadjTextoP(p, ctx) {
  let out = '';
  const rec = (nodo) => {
    for (const h of nodo.children) {
      const ln = h.localName;
      if (ln === 'rPr' || ln === 'pPr' || ln === 'sectPr') continue;
      if (ln === 't') { out += h.textContent; continue; }
      if (ln === 'tab') { out += ' '; continue; }
      if (ln === 'br' || ln === 'cr') { out += '\n'; continue; }
      if (ln === 'noBreakHyphen') { out += '-'; continue; }
      if (ln === 'footnoteReference' || ln === 'endnoteReference') {
        const id = h.getAttributeNS(VADJ_W, 'id');
        if (id && id !== '-1' && id !== '0' && id !== '1') {
          const clave = (ln === 'endnoteReference' ? 'e' : 'n') + id;
          ctx.notasUsadas.add(clave);
          out += '[^' + ctx.numeroNota(clave) + ']';
        }
        continue;
      }
      if (ln === 'r') {
        if (vadjEsSuper(h)) {
          const t = [...h.getElementsByTagName('*')].filter(x => x.localName === 't')
            .map(x => x.textContent).join('').trim();
          /* Solo los dígitos: un superíndice que dice «er» («1.er») o un
             asterisco no es una llamada a nada, y convertirlo en «[er]»
             sería inventarse una cita. */
          if (/^\d{1,3}(\s*[,;]\s*\d{1,3})*$/.test(t)) {
            t.split(/[,;]/).forEach(x => { out += '[' + x.trim() + ']'; });
            continue;
          }
          out += t;
          continue;
        }
        rec(h);
        continue;
      }
      if (ln === 'hyperlink') {
        const antes = out.length;
        rec(h);
        const texto = out.slice(antes);
        const id = h.getAttributeNS(VADJ_R, 'id');
        const url = id ? ctx.rels.get(id) : '';
        /* La dirección se escribe al lado del texto del enlace, que es
           lo que deja que una entrada de bibliografía acabe teniendo su
           🔗. Pero NO detrás de un texto cortísimo: en un informe
           exportado, las llamadas de las citas son enlaces de uno o dos
           caracteres, y ponerles la dirección detrás llenaría los
           párrafos de direcciones en mitad de la frase. */
        if (url && texto.trim().length >= 5 && out.indexOf(url) < 0) out += ' (' + url + ')';
        continue;
      }
      rec(h);
    }
  };
  rec(p);
  return out.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
}

function vadjTablaDocx(tbl, ctx) {
  const filas = [...tbl.children].filter(x => x.localName === 'tr').map(tr =>
    [...tr.children].filter(x => x.localName === 'tc').map(tc =>
      [...tc.children].filter(x => x.localName === 'p')
        .map(p => vadjTextoP(p, ctx)).join(' ').replace(/\s+/g, ' ').replace(/\|/g, '/').trim()));
  return vadjTablaEnTubos(filas);
}

/* Una tabla en el alfabeto del lector: la primera fila es la cabecera y
   debajo va el renglón de guiones, que es lo único que la hace
   inequívoca (regla 28). */
function vadjTablaEnTubos(filas) {
  const buenas = filas.filter(f => f.length);
  if (buenas.length < 2) return [];
  let ancho = 0;
  buenas.forEach(f => { if (f.length > ancho) ancho = f.length; });
  const cuadra = f => { const c = f.slice(); while (c.length < ancho) c.push(''); return c; };
  const L = ['| ' + cuadra(buenas[0]).join(' | ') + ' |',
             '|' + new Array(ancho).fill('---').join('|') + '|'];
  buenas.slice(1).forEach(f => L.push('| ' + cuadra(f).join(' | ') + ' |'));
  return L;
}

async function vadjLeerDocx(buf) {
  const zip = vadjZipAbrir(buf);
  const xml = await vadjZipSacar(zip, 'word/document.xml');
  if (!xml) throw new Error('no-docx');

  const rels = new Map();
  const relsXml = await vadjZipSacar(zip, 'word/_rels/document.xml.rels');
  if (relsXml) {
    for (const r of vadjXml(relsXml).getElementsByTagName('*')) {
      if (r.localName !== 'Relationship') continue;
      const destino = r.getAttribute('Target') || '';
      if (/^https?:/i.test(destino)) rels.set(r.getAttribute('Id'), destino);
    }
  }

  /* Las notas se numeran de nuevo, 1, 2, 3…, por el orden en que
     aparecen: los identificadores de Word saltan y empiezan donde les
     parece, y una bibliografía que empieza en la nota 7 se lee como si
     faltaran seis. */
  const mapaNotas = new Map();
  const ctx = {
    rels: rels,
    notasUsadas: new Set(),
    numeroNota: clave => {
      if (!mapaNotas.has(clave)) mapaNotas.set(clave, mapaNotas.size + 1);
      return mapaNotas.get(clave);
    },
  };

  const doc = vadjXml(xml);
  const cuerpo = [...doc.getElementsByTagName('*')].find(x => x.localName === 'body');
  if (!cuerpo) throw new Error('no-docx');

  const bloques = [];
  const cuenta = { cabeceras: 0, tablas: 0, listas: 0, notas: 0, citas: 0 };
  let h1 = 0, primerH1 = -1;
  const parrafos = [];
  for (const hijo of cuerpo.children) {
    if (hijo.localName === 'p') {
      const nivel = vadjNivelCabecera(hijo);
      if (nivel === 2) { h1++; if (primerH1 < 0) primerH1 = parrafos.length; }
      parrafos.push({ tipo: 'p', el: hijo, nivel: nivel });
    } else if (hijo.localName === 'tbl') {
      parrafos.push({ tipo: 'tbl', el: hijo });
    }
  }
  /* Sin estilo «Título» y con UN solo «Título 1» al principio, ese es el
     título del documento: es como encabeza quien no usa el estilo de
     título, y al lector hay que dárselo con una sola almohadilla. */
  const soloUnH1 = (h1 === 1 && primerH1 <= 1 && !parrafos.some(x => x.nivel === 1));

  parrafos.forEach((x, i) => {
    if (x.tipo === 'tbl') {
      const L = vadjTablaDocx(x.el, ctx);
      if (L.length) { cuenta.tablas++; bloques.push(''); L.forEach(l => bloques.push(l)); bloques.push(''); }
      return;
    }
    const t = vadjTextoP(x.el, ctx);
    if (!t) { bloques.push(''); return; }
    if (x.nivel) {
      const nivel = (soloUnH1 && x.nivel === 2 && i === primerH1) ? 1 : x.nivel;
      cuenta.cabeceras++;
      bloques.push('');
      bloques.push('#'.repeat(Math.min(3, nivel)) + ' ' + t.replace(/\n/g, ' '));
      bloques.push('');
      return;
    }
    if (vadjEsCita(x.el)) { cuenta.citas++; t.split('\n').forEach(l => bloques.push('> ' + l)); return; }
    if (vadjEsLista(x.el)) { cuenta.listas++; bloques.push('- ' + t.replace(/\n/g, ' ')); return; }
    bloques.push(t);
    bloques.push('');
  });

  /* Las notas al pie, al final y renumeradas, en la forma que el lector
     recoge sola («[^3]: …» → capítulo «Notas»). */
  const notas = [];
  for (const [archivo, letra, raiz] of [['word/footnotes.xml', 'n', 'footnote'], ['word/endnotes.xml', 'e', 'endnote']]) {
    const nx = await vadjZipSacar(zip, archivo);
    if (!nx) continue;
    for (const nodo of vadjXml(nx).getElementsByTagName('*')) {
      if (nodo.localName !== raiz) continue;
      const id = nodo.getAttributeNS(VADJ_W, 'id');
      const clave = letra + id;
      if (!ctx.notasUsadas.has(clave)) continue;
      const t = [...nodo.children].filter(x => x.localName === 'p')
        .map(p => vadjTextoP(p, ctx)).join(' ').replace(/\s+/g, ' ').trim();
      if (t) notas.push({ n: ctx.numeroNota(clave), t: t });
    }
  }
  notas.sort((a, b) => a.n - b.n);
  cuenta.notas = notas.length;
  if (notas.length) {
    bloques.push('');
    notas.forEach(x => bloques.push('[^' + x.n + ']: ' + x.t));
  }

  return { texto: vadjJuntar(bloques), cuenta: cuenta };
}

/* ══════════════ OPENDOCUMENT (.odt) ══════════════ */
async function vadjLeerOdt(buf) {
  const zip = vadjZipAbrir(buf);
  const xml = await vadjZipSacar(zip, 'content.xml');
  if (!xml) throw new Error('no-odt');
  const doc = vadjXml(xml);
  const cuerpo = [...doc.getElementsByTagName('*')].find(x => x.localName === 'text');
  if (!cuerpo) throw new Error('no-odt');
  const bloques = [];
  const cuenta = { cabeceras: 0, tablas: 0, listas: 0, notas: 0, citas: 0 };

  const texto = el => String(el.textContent || '').replace(/\s+/g, ' ').trim();
  const recorre = (nodo, enLista) => {
    for (const h of nodo.children) {
      const ln = h.localName;
      if (ln === 'h') {
        const n = parseInt(h.getAttributeNS(VADJ_TX, 'outline-level') || '1', 10) || 1;
        const t = texto(h);
        if (t) { cuenta.cabeceras++; bloques.push(''); bloques.push('#'.repeat(Math.min(3, n)) + ' ' + t); bloques.push(''); }
      } else if (ln === 'p') {
        const t = texto(h);
        if (!t) { bloques.push(''); continue; }
        if (enLista) { cuenta.listas++; bloques.push('- ' + t); }
        else { bloques.push(t); bloques.push(''); }
      } else if (ln === 'list') {
        recorre(h, true);
      } else if (ln === 'list-item') {
        recorre(h, true);
      } else if (ln === 'table') {
        const filas = [...h.children].filter(x => x.localName === 'table-row').map(tr =>
          [...tr.children].filter(x => x.localName === 'table-cell').map(td => texto(td).replace(/\|/g, '/')));
        const L = vadjTablaEnTubos(filas);
        if (L.length) { cuenta.tablas++; bloques.push(''); L.forEach(l => bloques.push(l)); bloques.push(''); }
      } else {
        recorre(h, enLista);
      }
    }
  };
  recorre(cuerpo, false);
  void VADJ_TB;
  return { texto: vadjJuntar(bloques), cuenta: cuenta };
}

/* ══════════════ PÁGINA WEB (.html) ══════════════
   Es lo que sale de Documentos de Google al «Descargar como página
   web», y trae las cabeceras y las tablas puestas.
   ⚠️ Se lee con `DOMParser`, que fabrica un documento APARTE y muerto:
   no corre ni un script, no pide ni una imagen y nada de lo que traiga
   dentro toca a F.A.R.O. De ahí solo se saca `textContent`, nunca se
   cuelga un nodo de esta página. */
async function vadjLeerHtml(txt) {
  const doc = new DOMParser().parseFromString(txt, 'text/html');
  const bloques = [];
  const cuenta = { cabeceras: 0, tablas: 0, listas: 0, notas: 0, citas: 0 };
  const limpio = s => String(s || '').replace(/\s+/g, ' ').trim();

  /* El superíndice de dígitos, a «[3]», igual que en Word: es lo que
     trae las llamadas de las citas de un informe. */
  const conLlamadas = el => {
    let out = '';
    const rec = n => {
      for (const h of n.childNodes) {
        if (h.nodeType === 3) { out += h.nodeValue; continue; }
        if (h.nodeType !== 1) continue;
        const et = h.tagName.toLowerCase();
        if (et === 'sup') {
          const t = limpio(h.textContent);
          if (/^\d{1,3}(\s*[,;]\s*\d{1,3})*$/.test(t)) { t.split(/[,;]/).forEach(x => { out += '[' + x.trim() + ']'; }); continue; }
          out += t;
          continue;
        }
        if (et === 'br') { out += '\n'; continue; }
        if (et === 'script' || et === 'style') continue;
        if (et === 'a') {
          const antes = out.length;
          rec(h);
          const url = h.getAttribute('href') || '';
          const texto = out.slice(antes);
          if (/^https?:/i.test(url) && texto.trim().length >= 5 && out.indexOf(url) < 0) out += ' (' + url + ')';
          continue;
        }
        rec(h);
      }
    };
    rec(el);
    return out.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
  };

  const cuerpo = doc.body || doc.documentElement;
  const recorre = nodo => {
    for (const h of nodo.children) {
      const et = h.tagName.toLowerCase();
      if (/^h[1-6]$/.test(et)) {
        const t = conLlamadas(h).replace(/\n/g, ' ');
        if (t) { cuenta.cabeceras++; bloques.push(''); bloques.push('#'.repeat(Math.min(3, parseInt(et[1], 10))) + ' ' + t); bloques.push(''); }
      } else if (et === 'p') {
        const t = conLlamadas(h);
        if (t) { bloques.push(t); bloques.push(''); } else bloques.push('');
      } else if (et === 'blockquote') {
        const t = conLlamadas(h);
        if (t) { cuenta.citas++; t.split('\n').forEach(l => bloques.push('> ' + l)); bloques.push(''); }
      } else if (et === 'li') {
        const t = conLlamadas(h).replace(/\n/g, ' ');
        if (t) { cuenta.listas++; bloques.push('- ' + t); }
      } else if (et === 'table') {
        const filas = [...h.querySelectorAll('tr')].map(tr =>
          [...tr.children].map(td => limpio(conLlamadas(td)).replace(/\|/g, '/')));
        const L = vadjTablaEnTubos(filas);
        if (L.length) { cuenta.tablas++; bloques.push(''); L.forEach(l => bloques.push(l)); bloques.push(''); }
      } else if (et === 'script' || et === 'style' || et === 'head') {
        continue;
      } else {
        recorre(h);
      }
    }
  };
  recorre(cuerpo);
  return { texto: vadjJuntar(bloques), cuenta: cuenta };
}

/* ══════════════ EL PDF, Y POR QUÉ NO ══════════════
   ⚠️ UN PDF NO GUARDA RENGLONES: guarda trozos de letra con sus
   coordenadas en la página. Sacar texto de ahí es adivinar dónde
   terminaba cada renglón y dónde empezaba cada párrafo, y con dos
   columnas o una tabla se adivina mal. Y hay algo peor que eso: muchos
   PDF llevan las letras con una codificación propia, así que lo que
   sale no es texto equivocado —es un revoltijo de símbolos— y no se ve
   hasta abrirlo.

   Un revoltijo que PARECE haber funcionado es exactamente lo que esta
   casa no manda a nadie. Y no hace falta: el mismo documento, salido
   como Word o como página web, trae sus títulos, sus tablas, sus notas
   al pie y sus enlaces dichos con todas las letras. Así que aquí se
   dice CÓMO conseguir eso, que es la única respuesta útil. */
function vadjPdfNo() {
  return 'Un PDF no guarda el texto en renglones, sino letras con sus coordenadas: lo que se saca de ahí sale revuelto y no se ve hasta leerlo. ' +
         'Ese mismo documento sirve perfecto en otro formato: en Documentos de Google, «Archivo → Descargar → Word (.docx)», y adjunta ese. ' +
         'Un .docx trae los títulos, las tablas, las notas al pie y los enlaces dichos con todas las letras.';
}

/* ══════════════ LA PUERTA ══════════════ */
function vadjJuntar(bloques) {
  return bloques.join('\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function vadjExtension(nombre) {
  const m = String(nombre || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

/* Lee un archivo y devuelve texto en el alfabeto del lector. Nunca
   lanza hacia fuera: devuelve `{ error }` con una frase que se pueda
   leer, porque el que llama la pinta tal cual. */
async function vadjLeer(file) {
  try {
    if (!file) return { error: 'No llegó ningún archivo.' };
    if (file.size > VADJ_MAX) {
      return { error: 'El archivo pesa ' + Math.round(file.size / 1048576) + ' MB y el tope son ' +
                      Math.round(VADJ_MAX / 1048576) + '. Casi siempre es por las imágenes de dentro, que aquí no se usan.' };
    }
    const ext = vadjExtension(file.name);
    if (ext === 'pdf') return { error: vadjPdfNo() };
    if (ext === 'doc') return { error: 'Ese es un Word antiguo (.doc). Ábrelo y guárdalo como .docx, que es el que se lee.' };
    if (ext === 'txt' || ext === 'text' || ext === 'md' || ext === 'markdown') {
      const t = await file.text();
      return { texto: t.replace(/\r\n?/g, '\n'), cuenta: null, formato: ext };
    }
    if (ext === 'html' || ext === 'htm') {
      const r = await vadjLeerHtml(await file.text());
      return { texto: r.texto, cuenta: r.cuenta, formato: 'html' };
    }
    if (!vadjPuede()) {
      return { error: 'Este navegador no sabe abrir archivos comprimidos, así que no puede leer un .docx. ' +
                      'Guarda el documento como .txt o como página web (.html) y adjunta ese.' };
    }
    const buf = await file.arrayBuffer();
    if (ext === 'odt') {
      const r = await vadjLeerOdt(buf);
      return { texto: r.texto, cuenta: r.cuenta, formato: 'odt' };
    }
    if (ext === 'docx') {
      const r = await vadjLeerDocx(buf);
      return { texto: r.texto, cuenta: r.cuenta, formato: 'docx' };
    }
    /* Sin extensión conocida: si empieza por «PK» es un zip, y casi
       siempre un .docx al que alguien le cambió el nombre. */
    const cabeza = new Uint8Array(buf.slice(0, 5));
    if (cabeza[0] === 0x50 && cabeza[1] === 0x4b) {
      const r = await vadjLeerDocx(buf);
      return { texto: r.texto, cuenta: r.cuenta, formato: 'docx' };
    }
    if (String.fromCharCode.apply(null, cabeza) === '%PDF-') return { error: vadjPdfNo() };
    return { error: 'No sé leer un archivo «.' + (ext || '?') + '». Sirven .docx, .odt, .html, .md y .txt.' };
  } catch (e) {
    return { error: 'No se pudo abrir el archivo (' + ((e && e.message) || 'sin detalle') + '). ' +
                    'Si es un .docx, ábrelo y vuelve a guardarlo; si no, guárdalo como .txt.' };
  }
}

window.VozAdjunto = {
  puede: vadjPuede,
  acepta: VADJ_ACEPTA,
  leer: vadjLeer,
  /* Para la sonda y para quien quiera probar las piezas por separado. */
  _partes: { vadjZipAbrir, vadjZipSacar, vadjLeerDocx, vadjLeerOdt, vadjLeerHtml, vadjTablaEnTubos, vadjPdfNo },
};
