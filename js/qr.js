'use strict';

/* ─────────────────────────────────────────────────────────────────────
   CÓDIGO QR 📷 · generador propio, sin librerías

   Está escrito a mano y no traído de un CDN por dos razones que aquí
   pesan más que la comodidad:

     · La aplicación vive detrás de una puerta con contraseña y se usa
       sin conexión. Un <script src="…cdn…"> es justo lo que no carga
       cuando hace falta, y este QR se necesita el día que se cierra la
       revista, no el día que hay buen internet.
     · El QR del buzón se IMPRIME. Se genera una vez, se pega en la
       revista y se queda en papel durante años. No puede depender de
       que un servicio de fuera siga existiendo, ni de mandarle la
       dirección del buzón a un tercero para que la dibuje.

   Qué hace y qué no: modo BYTE (vale para cualquier texto en UTF-8,
   que es lo que son las direcciones web), versiones 1 a 40, los cuatro
   niveles de corrección. No hace modo numérico ni alfanumérico: para
   una dirección corta no ahorran una sola versión y son doscientas
   líneas más que mantener.

   Se comprueba contra una implementación de referencia (segno) módulo
   a módulo en _dev/verifica-qr.js. Un QR mal dibujado no «se ve raro»:
   se ve perfecto y no lleva a ninguna parte, y eso se descubre con la
   revista ya impresa.
───────────────────────────────────────────────────────────────────── */

(function (global) {

  /* Los cuatro niveles de corrección de errores. `bits` es lo que va
     escrito en la propia imagen (no es 0,1,2,3: lo dice la norma). */
  const NIVELES = {
    L: { bits: 1, i: 0 },   // recupera el 7% dañado
    M: { bits: 0, i: 1 },   // 15%
    Q: { bits: 3, i: 2 },   // 25%  ← el del buzón: va impreso y se fotocopia
    H: { bits: 2, i: 3 },   // 30%
  };

  /* Cuántos códigos de corrección lleva cada bloque, por nivel y
     versión (1 a 40). Y en cuántos bloques se parte el mensaje. Son
     las tablas de la norma ISO/IEC 18004: no se deducen, se COPIAN, y
     por eso las comprueba _dev/verifica-qr.js una por una contra la
     tabla oficial.
     No es celo de más: una sola cifra mal (un 5 donde iba un 6, en la
     versión 8 con corrección alta) daba un código perfectamente
     dibujado que ningún lector conseguía leer. A ojo no se ve, y solo
     falla en las versiones que usan esa casilla. */
  const EC_POR_BLOQUE = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  ];
  const BLOQUES = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
  ];

  /* ── Aritmética del cuerpo finito GF(256) ──────────────────────────
     La corrección de errores (Reed-Solomon) no se hace con los números
     de siempre: se hace en un cuerpo de 256 elementos donde sumar es
     un XOR y multiplicar es esto. El polinomio 0x11D es el que fija la
     norma para QR. */
  function gfMul(a, b) {
    let r = 0;
    for (let i = 7; i >= 0; i--) {
      r = (r << 1) ^ ((r >>> 7) * 0x11D);
      r ^= ((b >>> i) & 1) * a;
    }
    return r & 0xFF;
  }

  /* El polinomio generador de grado n: (x−α⁰)(x−α¹)…(x−αⁿ⁻¹) */
  function generador(grado) {
    const g = new Uint8Array(grado);
    g[grado - 1] = 1;
    let raiz = 1;
    for (let i = 0; i < grado; i++) {
      for (let j = 0; j < grado; j++) {
        g[j] = gfMul(g[j], raiz);
        if (j + 1 < grado) g[j] ^= g[j + 1];
      }
      raiz = gfMul(raiz, 0x02);
    }
    return g;
  }

  /* Los códigos de corrección de un bloque: el resto de dividir el
     bloque (desplazado) entre el generador. */
  function corregir(datos, grado) {
    const g = generador(grado);
    const resto = new Uint8Array(grado);
    for (const b of datos) {
      const factor = b ^ resto[0];
      resto.copyWithin(0, 1);
      resto[grado - 1] = 0;
      for (let i = 0; i < grado; i++) resto[i] ^= gfMul(g[i], factor);
    }
    return resto;
  }

  /* ── Cuánto cabe ───────────────────────────────────────────────────
     Módulos que quedan para datos+corrección en una versión, ya
     descontados los dibujos fijos (localizadores, tiempos, alineación,
     formato y versión). */
  function modulosCrudos(ver) {
    let r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      const n = Math.floor(ver / 7) + 2;
      r -= (25 * n - 10) * n - 55;
      if (ver >= 7) r -= 36;
    }
    return r;
  }
  function codigosDeDatos(ver, nivel) {
    const i = NIVELES[nivel].i;
    return Math.floor(modulosCrudos(ver) / 8) - EC_POR_BLOQUE[i][ver] * BLOQUES[i][ver];
  }

  /* Dónde van los cuadritos de alineación de esta versión */
  function posicionesAlineacion(ver) {
    if (ver === 1) return [];
    const n = Math.floor(ver / 7) + 2;
    const paso = (ver === 32) ? 26 : Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
    const res = [6];
    for (let p = ver * 4 + 17 - 7; res.length < n; p -= paso) res.splice(1, 0, p);
    return res;
  }

  /* ── El texto, a bits ──────────────────────────────────────────────
     Cabecera de modo byte (0100), cuántos bytes vienen, y los bytes en
     UTF-8. El campo de la cuenta mide 8 bits hasta la versión 9 y 16 a
     partir de la 10: es la norma, y equivocarse aquí da un código que
     se dibuja precioso y no se lee. */
  function aBits(bytes, ver) {
    const bits = [];
    const empuja = (valor, cuantos) => {
      for (let i = cuantos - 1; i >= 0; i--) bits.push((valor >>> i) & 1);
    };
    empuja(0b0100, 4);
    empuja(bytes.length, ver <= 9 ? 8 : 16);
    for (const b of bytes) empuja(b, 8);
    return bits;
  }

  /* Los códigos finales: relleno hasta llenar y los bloques
     entrelazados como manda la norma (así un borrón que se come varios
     códigos seguidos reparte el daño entre bloques distintos, y cada
     uno puede repararse). */
  function codigos(bytes, ver, nivel) {
    const capacidad = codigosDeDatos(ver, nivel) * 8;
    const bits = aBits(bytes, ver);

    // Terminador y cuadre a byte
    for (let i = 0; i < 4 && bits.length < capacidad; i++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);
    // Relleno alterno 11101100 / 00010001, también de la norma
    for (let relleno = 0xEC; bits.length < capacidad; relleno ^= 0xEC ^ 0x11) {
      for (let i = 7; i >= 0; i--) bits.push((relleno >>> i) & 1);
    }

    const datos = new Uint8Array(bits.length / 8);
    bits.forEach((b, i) => { datos[i >>> 3] |= b << (7 - (i & 7)); });

    const i = NIVELES[nivel].i;
    const nBloques = BLOQUES[i][ver];
    const nEc = EC_POR_BLOQUE[i][ver];
    const total = Math.floor(modulosCrudos(ver) / 8);
    const cortos = nBloques - (total % nBloques);          // bloques con un byte menos
    const largoCorto = Math.floor(total / nBloques) - nEc;

    const bloques = [];
    for (let b = 0, k = 0; b < nBloques; b++) {
      const largo = largoCorto + (b < cortos ? 0 : 1);
      const trozo = datos.slice(k, k + largo);
      k += largo;
      bloques.push({ datos: trozo, ec: corregir(trozo, nEc) });
    }

    const salida = [];
    for (let j = 0; j < largoCorto + 1; j++) {
      bloques.forEach((bl, b) => {
        // El byte de más de los bloques largos va al final de la ronda
        if (j !== largoCorto || b >= cortos) salida.push(bl.datos[j]);
      });
    }
    for (let j = 0; j < nEc; j++) bloques.forEach(bl => salida.push(bl.ec[j]));
    return salida;
  }

  /* ── El dibujo ─────────────────────────────────────────────────────
     `m` es la cuadrícula (true = negro) y `fijo` marca lo que NO se
     puede tapar con datos ni enmascarar. */
  function nuevoLienzo(ver) {
    const n = ver * 4 + 17;
    const m = [], fijo = [];
    for (let y = 0; y < n; y++) {
      m.push(new Array(n).fill(false));
      fijo.push(new Array(n).fill(false));
    }
    return { n, m, fijo };
  }

  function pon(L, x, y, negro) {
    if (x < 0 || y < 0 || x >= L.n || y >= L.n) return;
    L.m[y][x] = negro;
    L.fijo[y][x] = true;
  }

  function dibujaFijos(L, ver, nivel) {
    // Localizadores: los tres cuadrados de las esquinas
    [[0, 0], [L.n - 7, 0], [0, L.n - 7]].forEach(([ox, oy]) => {
      for (let dy = -1; dy <= 7; dy++) {
        for (let dx = -1; dx <= 7; dx++) {
          const x = ox + dx, y = oy + dy;
          const d = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
          pon(L, x, y, d !== 2 && d <= 3);
        }
      }
    });

    // Tiempos: la línea de puntos que da la escala al lector
    for (let i = 0; i < L.n; i++) {
      if (!L.fijo[6][i]) pon(L, i, 6, i % 2 === 0);
      if (!L.fijo[i][6]) pon(L, 6, i, i % 2 === 0);
    }

    // Alineación: los cuadritos del interior, menos donde chocan con
    // los localizadores
    const pos = posicionesAlineacion(ver);
    pos.forEach((cy, i) => pos.forEach((cx, j) => {
      const esquina = (i === 0 && j === 0) || (i === 0 && j === pos.length - 1) ||
                      (i === pos.length - 1 && j === 0);
      if (esquina) return;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          pon(L, cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }));

    // Sitio del formato. Se pinta ya, con una máscara cualquiera, solo
    // para APARTARLO: lo que importa aquí es marcar esos módulos como
    // fijos antes de repartir los datos. El valor bueno se escribe al
    // final, cuando ya se sabe qué máscara ganó.
    //
    // Se aparta llamando a la misma función que lo escribirá de verdad,
    // y no con un bucle propio, porque el sitio del formato NO es un
    // rectángulo: se salta la fila y la columna 6, que son las de los
    // tiempos. Un bucle «de 0 a 8» las pisa, y el código sale con dos
    // módulos en blanco que deberían ser negros. Se lee igual en un
    // teléfono nuevo y falla en uno viejo o con mala luz, que es la
    // peor manera de fallar: la que no se ve al probar.
    ponFormato(L, nivel, 0);

    // Versión (solo de la 7 en adelante)
    if (ver >= 7) {
      let r = ver;
      for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
      const bits = (ver << 12) | r;
      for (let i = 0; i < 18; i++) {
        const b = ((bits >>> i) & 1) === 1;
        pon(L, Math.floor(i / 3), L.n - 11 + (i % 3), b);
        pon(L, L.n - 11 + (i % 3), Math.floor(i / 3), b);
      }
    }
  }

  function ponFormato(L, nivel, mascara) {
    const datos = (NIVELES[nivel].bits << 3) | mascara;
    let r = datos;
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const bits = ((datos << 10) | r) ^ 0x5412;
    const b = i => ((bits >>> i) & 1) === 1;

    for (let i = 0; i <= 5; i++) pon(L, 8, i, b(i));
    pon(L, 8, 7, b(6));
    pon(L, 8, 8, b(7));
    pon(L, 7, 8, b(8));
    for (let i = 9; i < 15; i++) pon(L, 14 - i, 8, b(i));

    for (let i = 0; i < 8; i++) pon(L, L.n - 1 - i, 8, b(i));
    for (let i = 8; i < 15; i++) pon(L, 8, L.n - 15 + i, b(i));
    pon(L, 8, L.n - 8, true);
  }

  /* Los datos se pasean por el código en zigzag, de abajo a la derecha
     hacia arriba, en columnas de dos y saltando la columna 6 (la de
     los tiempos). */
  function ponDatos(L, codigos) {
    let i = 0;
    for (let der = L.n - 1; der >= 1; der -= 2) {
      if (der === 6) der = 5;
      for (let v = 0; v < L.n; v++) {
        for (let j = 0; j < 2; j++) {
          const x = der - j;
          const subiendo = ((der + 1) & 2) === 0;
          const y = subiendo ? L.n - 1 - v : v;
          if (L.fijo[y][x]) continue;
          L.m[y][x] = i < codigos.length * 8
            ? ((codigos[i >>> 3] >>> (7 - (i & 7))) & 1) === 1
            : false;
          i++;
        }
      }
    }
  }

  const MASCARAS = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => (x * y) % 2 + (x * y) % 3 === 0,
    (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0,
    (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0,
  ];

  function aplicaMascara(L, k) {
    const f = MASCARAS[k];
    for (let y = 0; y < L.n; y++) {
      for (let x = 0; x < L.n; x++) {
        if (!L.fijo[y][x] && f(x, y)) L.m[y][x] = !L.m[y][x];
      }
    }
  }

  /* ── Cuál de las ocho máscaras ─────────────────────────────────────
     La norma puntúa cada resultado y gana el de MENOS puntos. No es
     cosmética: castiga las rachas largas, los cuadrados de un solo
     color, los dibujos que se parecen a un localizador (y despistan al
     lector) y el desequilibrio entre negro y blanco. */
  function castigo(L) {
    const n = L.n;
    let p = 0;

    // Reglas 1 y 3, línea por línea: las rachas largas y el dibujo que
    // se confunde con un localizador. Se recorren filas y columnas.
    for (const enFila of [true, false]) {
      for (let i = 0; i < n; i++) {
        const dime = j => (enFila ? L.m[i][j] : L.m[j][i]);
        let color = false, racha = 0;
        const historia = [0, 0, 0, 0, 0, 0, 0];
        for (let j = 0; j < n; j++) {
          if (dime(j) === color) {
            racha++;
            if (racha === 5) p += 3; else if (racha > 5) p += 1;
          } else {
            apuntaRacha(racha, historia, n);
            if (!color) p += 40 * cuentaBuscadores(historia);
            color = dime(j);
            racha = 1;
          }
        }
        p += 40 * cierraLinea(color, racha, historia, n);
      }
    }

    // Regla 2: cuadrados de 2×2 del mismo color
    for (let y = 0; y < n - 1; y++) {
      for (let x = 0; x < n - 1; x++) {
        const c = L.m[y][x];
        if (c === L.m[y][x + 1] && c === L.m[y + 1][x] && c === L.m[y + 1][x + 1]) p += 3;
      }
    }

    // Regla 4: desequilibrio de negro. Cada 5% de desvío sobre la
    // mitad, 10 puntos.
    let negros = 0;
    for (const fila of L.m) for (const c of fila) if (c) negros++;
    p += (Math.ceil(Math.abs(negros * 20 - n * n * 10) / (n * n)) - 1) * 10;
    return p;
  }

  /* Las siete últimas rachas de la línea. La primera se alarga con el
     ancho del código entero porque fuera del dibujo hay papel blanco:
     un localizador pegado al borde izquierdo TIENE su margen claro, y
     sin este apaño no se contaría. */
  function apuntaRacha(largo, historia, n) {
    if (historia[0] === 0) largo += n;
    historia.pop();
    historia.unshift(largo);
  }

  function cierraLinea(color, largo, historia, n) {
    if (color) { apuntaRacha(largo, historia, n); largo = 0; }
    apuntaRacha(largo + n, historia, n);   // el papel blanco del otro borde
    return cuentaBuscadores(historia);
  }

  /* El dibujo que confunde: oscuro-claro-oscuro largo-claro-oscuro en
     proporción 1:1:3:1:1, con cuatro veces esa medida en claro a un
     lado o al otro. Es el que el lector toma por localizador, y por eso
     la norma lo castiga con 40 puntos: donde parece haber una esquina
     que no lo es, el teléfono se pierde. */
  function cuentaBuscadores(h) {
    const u = h[1];
    const centro = u > 0 && h[2] === u && h[3] === u * 3 && h[4] === u && h[5] === u;
    return (centro && h[0] >= u * 4 && h[6] >= u ? 1 : 0)
         + (centro && h[6] >= u * 4 && h[0] >= u ? 1 : 0);
  }

  /* ── La puerta de la calle ─────────────────────────────────────────
     matriz(texto) devuelve { n, m, version, nivel }: `m` es la
     cuadrícula de true/false, sin margen. El margen (la «zona
     tranquila» de cuatro módulos que el lector necesita para
     encontrarlo) lo ponen los pintores de abajo. */
  function matriz(texto, opciones) {
    const o = opciones || {};
    const nivel = NIVELES[o.nivel] ? o.nivel : 'Q';
    const bytes = new TextEncoder().encode(String(texto == null ? '' : texto));

    let ver = o.version || 0;
    if (!ver) {
      for (ver = 1; ver <= 40; ver++) {
        const cabecera = 4 + (ver <= 9 ? 8 : 16);
        if (cabecera + bytes.length * 8 <= codigosDeDatos(ver, nivel) * 8) break;
      }
      if (ver > 40) throw new Error('El texto no cabe en un código QR');
    }

    const cods = codigos(bytes, ver, nivel);
    const L = nuevoLienzo(ver);
    dibujaFijos(L, ver, nivel);
    ponDatos(L, cods);

    let mejor = o.mascara != null ? o.mascara : -1;
    if (mejor < 0) {
      let mejorP = Infinity;
      for (let k = 0; k < 8; k++) {
        aplicaMascara(L, k); ponFormato(L, nivel, k);
        const p = castigo(L);
        if (p < mejorP) { mejorP = p; mejor = k; }
        aplicaMascara(L, k);   // aplicar dos veces deshace
      }
    }
    aplicaMascara(L, mejor);
    ponFormato(L, nivel, mejor);

    return { n: L.n, m: L.m, version: ver, nivel, mascara: mejor };
  }

  /* Lo pinta en un <canvas>, listo para verse o descargarse.
     `escala` son los píxeles de cada módulo: para imprimir hace falta
     grande, y agrandar la imagen después es lo que emborrona los
     bordes y hace que el teléfono no lo lea. */
  function aCanvas(canvas, texto, opciones) {
    const o = opciones || {};
    const q = matriz(texto, o);
    const margen = o.margen == null ? 4 : o.margen;
    const escala = o.escala || 8;
    const lado = (q.n + margen * 2) * escala;

    canvas.width = lado;
    canvas.height = lado;
    const ctx = canvas.getContext('2d');
    // El fondo va BLANCO y opaco, nunca transparente: un QR con fondo
    // transparente pegado sobre un color oscuro en el programa de
    // maquetación deja de leerse, y eso no se ve hasta que está impreso.
    ctx.fillStyle = o.fondo || '#ffffff';
    ctx.fillRect(0, 0, lado, lado);
    ctx.fillStyle = o.tinta || '#000000';
    for (let y = 0; y < q.n; y++) {
      for (let x = 0; x < q.n; x++) {
        if (q.m[y][x]) {
          ctx.fillRect((x + margen) * escala, (y + margen) * escala, escala, escala);
        }
      }
    }
    return q;
  }

  function aPNG(texto, opciones) {
    const c = document.createElement('canvas');
    aCanvas(c, texto, opciones);
    return c.toDataURL('image/png');
  }

  global.QR = { matriz, aCanvas, aPNG };

})(typeof window !== 'undefined' ? window : globalThis);

/* Para poder probarlo en node desde _dev/ sin navegador */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = (typeof window !== 'undefined' ? window : globalThis).QR;
}
