'use strict';
/* ══════════════════════════════════════════════════════════════════
   UN SUPABASE DE MENTIRA, PARA PROBAR LA SINCRONIZACIÓN DE VERDAD
   ══════════════════════════════════════════════════════════════════

   POR QUÉ EXISTE. El marcador guarda lo subrayado en la nube para que
   viaje de un aparato a otro. Eso es exactamente la clase de cosa que
   parece funcionar y no funciona: un nombre de columna cambiado, una
   cabecera que falta, un upsert que en vez de corregir duplica. Y no se
   puede comprobar contra el proyecto de verdad desde el banco de
   pruebas, porque la red de ahí no sale, ni conviene ensuciar la base
   de la casa con marcas de prueba.

   QUÉ HACE. Levanta un servidor que habla el mismo idioma que el
   endpoint REST de Supabase (PostgREST) para la tabla lecturas_marcas,
   y con la MISMA severidad:

     · valida las columnas contra el esquema de
       supabase/sql/lecturas_marcas.sql y devuelve 400 ante una columna
       desconocida, como haría PostgREST;
     · exige la cabecera apikey y un Bearer, como el de verdad;
     · aplica la SEGURIDAD POR FILA a mano: cada quien ve y escribe solo
       lo suyo, que es lo que dicen las cuatro políticas del SQL;
     · hace upsert por clave primaria cuando llega
       «Prefer: resolution=merge-duplicates», que es lo que manda
       supabase-js.

   Así la sonda puede usar la biblioteca supabase-js DE VERDAD, con
   peticiones HTTP DE VERDAD, y lo único fingido es el otro extremo.

   NO ES PARTE DE LA APLICACIÓN: vive en _dev/ y no se publica.

   Uso:  node _dev/postgrest-falso.js [puerto]      (por defecto 8125)
════════════════════════════════════════════════════════════════════ */

const http = require('http');
const PUERTO = Number(process.argv[2]) || 8125;

/* El esquema, copiado del SQL a mano y a propósito: si alguien cambia
   la tabla y se olvida del cliente, esta lista deja de coincidir y la
   sonda lo canta. Un doble que acepte cualquier cosa no prueba nada. */
const COLUMNAS = {
  id: 'text', user_id: 'uuid', mision: 'text', zona: 'text',
  parrafo: 'int', ini: 'int', fin: 'int', texto: 'text',
  color: 'text', nota: 'text', borrada: 'bool', actualizado: 'bigint',
  fecha: 'text', creado_at: 'ts', guardado_at: 'ts',
};
const OBLIGATORIAS = ['id', 'user_id', 'mision', 'zona', 'parrafo', 'ini', 'fin', 'texto', 'color'];
const COLORES = ['dato', 'voz', 'idea', 'contra', 'duda'];

/* La tabla, en memoria. */
const filas = new Map();      /* id -> fila */
let contadorPeticiones = 0;

function json(res, codigo, cuerpo, extra) {
  const cuerpoTxt = JSON.stringify(cuerpo);
  res.writeHead(codigo, Object.assign({
    'Content-Type': 'application/json',
    /* El navegador de la sonda vive en otro puerto, así que sin esto no
       llegaría ni la primera petición. */
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Expose-Headers': 'content-range',
  }, extra || {}));
  res.end(cuerpoTxt);
}
/* El mismo formato de error que devuelve PostgREST, para que el cliente
   lo trate igual que el de verdad. */
function error(res, codigo, mensaje, detalle) {
  json(res, codigo, { message: mensaje, details: detalle || null, hint: null, code: String(codigo) });
}

/* Quién viene. En el de verdad esto sale del JWT; aquí basta con
   leerlo, porque lo que se está probando es el cliente, no la firma. */
function quienEs(req) {
  const auth = req.headers['authorization'] || '';
  const t = auth.replace(/^Bearer\s+/i, '').trim();
  if (!t) return null;
  /* La sonda manda un token con forma «prueba:<user_id>», o un JWT de
     mentira con el user en la carga. */
  if (t.indexOf('prueba:') === 0) return t.slice(7);
  try {
    const carga = JSON.parse(Buffer.from(t.split('.')[1] || '', 'base64').toString('utf8'));
    return carga.sub || null;
  } catch (e) { return null; }
}

function validaFila(f) {
  for (const k of Object.keys(f)) {
    if (!COLUMNAS[k]) return 'no existe la columna «' + k + '» en lecturas_marcas';
  }
  for (const k of OBLIGATORIAS) {
    if (f[k] === undefined || f[k] === null) return 'falta la columna obligatoria «' + k + '»';
  }
  if (COLORES.indexOf(f.color) < 0) return 'el color «' + f.color + '» no pasa el check de la tabla';
  for (const k of ['parrafo', 'ini', 'fin']) {
    if (typeof f[k] !== 'number' || !isFinite(f[k])) return 'la columna «' + k + '» tiene que ser un entero';
  }
  if (f.actualizado !== undefined && typeof f.actualizado !== 'number') return 'la columna «actualizado» tiene que ser un número';
  if (f.borrada !== undefined && typeof f.borrada !== 'boolean') return 'la columna «borrada» tiene que ser booleana';
  return null;
}

/* Traduce los filtros de PostgREST que usa el marcador: campo=eq.valor */
function filtros(url) {
  const out = {};
  for (const [k, v] of url.searchParams.entries()) {
    if (k === 'select' || k === 'limit' || k === 'order' || k === 'on_conflict') continue;
    const m = /^eq\.(.*)$/.exec(v);
    if (m) out[k] = m[1];
  }
  return out;
}

const servidor = http.createServer((req, res) => {
  contadorPeticiones++;
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'OPTIONS') return json(res, 204, {});

  /* Una puerta de servicio para que la sonda pueda mirar y sembrar la
     «base de datos» sin pasar por el cliente. */
  if (url.pathname === '/__prueba/estado') {
    return json(res, 200, { filas: [...filas.values()], peticiones: contadorPeticiones });
  }
  if (url.pathname === '/__prueba/reiniciar') {
    filas.clear(); contadorPeticiones = 0;
    return json(res, 200, { ok: true });
  }

  if (url.pathname !== '/rest/v1/lecturas_marcas') {
    return error(res, 404, 'no existe esa tabla o ese camino: ' + url.pathname);
  }
  /* El de verdad exige la clave publicable en TODAS las peticiones. */
  if (!req.headers['apikey']) return error(res, 401, 'falta la cabecera apikey');

  const uid = quienEs(req);
  /* Sin sesión, la seguridad por fila no deja ver nada: es lo que dice
     la política, que exige es_familia() y user_id = auth.uid(). */
  if (!uid) {
    if (req.method === 'GET') return json(res, 200, []);
    return error(res, 401, 'new row violates row-level security policy for table "lecturas_marcas"');
  }

  if (req.method === 'GET') {
    const f = filtros(url);
    const salida = [...filas.values()].filter(fila => {
      if (fila.user_id !== uid) return false;          /* seguridad por fila */
      return Object.keys(f).every(k => String(fila[k]) === f[k]);
    });
    return json(res, 200, salida, { 'Content-Range': '0-' + Math.max(0, salida.length - 1) + '/' + salida.length });
  }

  if (req.method === 'POST') {
    let cuerpo = '';
    req.on('data', d => { cuerpo += d; });
    req.on('end', () => {
      let datos;
      try { datos = JSON.parse(cuerpo || '[]'); } catch (e) { return error(res, 400, 'JSON inválido'); }
      const lista = Array.isArray(datos) ? datos : [datos];
      const upsert = /merge-duplicates/.test(req.headers['prefer'] || '');
      for (const f of lista) {
        const mal = validaFila(f);
        if (mal) return error(res, 400, mal);
        /* La política de escritura: solo se escriben filas propias. */
        if (f.user_id !== uid) {
          return error(res, 403, 'new row violates row-level security policy for table "lecturas_marcas"');
        }
        const previa = filas.get(f.id);
        if (previa && !upsert) return error(res, 409, 'duplicate key value violates unique constraint "lecturas_marcas_pkey"');
        if (previa && previa.user_id !== uid) return error(res, 403, 'row-level security');
        filas.set(f.id, Object.assign({}, previa || {}, f, {
          creado_at: (previa && previa.creado_at) || new Date().toISOString(),
          guardado_at: new Date().toISOString(),
        }));
      }
      /* supabase-js manda «Prefer: return=minimal» en el upsert por
         defecto, y entonces el de verdad contesta 201 sin cuerpo. */
      const minimal = /return=minimal/.test(req.headers['prefer'] || '');
      return json(res, 201, minimal ? null : lista);
    });
    return;
  }

  return error(res, 405, 'método no admitido: ' + req.method);
});

servidor.listen(PUERTO, () => {
  console.log('Supabase de mentira escuchando en http://localhost:' + PUERTO);
  console.log('  tabla:   /rest/v1/lecturas_marcas');
  console.log('  estado:  /__prueba/estado     reinicio: /__prueba/reiniciar');
});
