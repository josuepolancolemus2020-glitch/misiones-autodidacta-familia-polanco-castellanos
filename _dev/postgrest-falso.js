'use strict';
/* ══════════════════════════════════════════════════════════════════
   UN SUPABASE DE MENTIRA, PARA PROBAR LA SINCRONIZACIÓN DE VERDAD
   ══════════════════════════════════════════════════════════════════

   POR QUÉ EXISTE. El marcador guarda lo subrayado en la nube para que
   viaje de un aparato a otro, y desde el 27 de agosto de 2026 la repisa
   de enlaces hace lo mismo con las herramientas de estudio. Eso es
   exactamente la clase de cosa que parece funcionar y no funciona: un
   nombre de columna cambiado, una cabecera que falta, un upsert que en
   vez de corregir duplica. Y no se puede comprobar contra el proyecto
   de verdad desde el banco de pruebas, porque la red de ahí no sale, ni
   conviene ensuciar la base de la casa con filas de prueba.

   QUÉ HACE. Levanta un servidor que habla el mismo idioma que el
   endpoint REST de Supabase (PostgREST) para las tablas de abajo, y con
   la MISMA severidad:

     · valida las columnas contra el esquema del SQL correspondiente y
       devuelve 400 ante una columna desconocida, como haría PostgREST;
     · exige la cabecera apikey y un Bearer, como el de verdad;
     · aplica la SEGURIDAD POR FILA a mano, tabla por tabla, tal como
       dicen sus políticas;
     · hace upsert por clave primaria cuando llega
       «Prefer: resolution=merge-duplicates», que es lo que manda
       supabase-js;
     · atiende maybeSingle() con su 406 y su PGRST116, que es como
       PostgREST dice «no hay ninguna fila».

   Así la sonda puede usar la biblioteca supabase-js DE VERDAD, con
   peticiones HTTP DE VERDAD, y lo único fingido es el otro extremo.

   ── LAS DOS SEGURIDADES POR FILA NO SON LA MISMA, Y ESO ES EL PUNTO ──
   `lecturas_marcas` es de cada quien: lo que subraya una hija no lo ve
   el padre. `recursos_enlaces` es de la casa: los cuatro ven todos los
   enlaces, pero quitar o corregir es solo de quien lo puso. Un doble
   que tratara las dos igual dejaría pasar justo el error que importa,
   así que cada tabla trae escrito quién ve y quién escribe.

   NO ES PARTE DE LA APLICACIÓN: vive en _dev/ y no se publica.

   Uso:  node _dev/postgrest-falso.js [puerto]      (por defecto 8125)
════════════════════════════════════════════════════════════════════ */

const http = require('http');
const PUERTO = Number(process.argv[2]) || 8125;

/* Los esquemas, copiados del SQL a mano y a propósito: si alguien cambia
   una tabla y se olvida del cliente, esta lista deja de coincidir y la
   sonda lo canta. Un doble que acepte cualquier cosa no prueba nada. */
const TABLAS = {

  /* supabase/sql/lecturas_marcas.sql */
  lecturas_marcas: {
    dueno: 'user_id',
    /* Las cuatro políticas exigen user_id = auth.uid() también para
       mirar: cada quien ve las suyas y solo las suyas. */
    verTodo: false,
    columnas: {
      id: 'text', user_id: 'uuid', mision: 'text', zona: 'text',
      parrafo: 'int', ini: 'int', fin: 'int', texto: 'text',
      color: 'text', nota: 'text', borrada: 'bool', actualizado: 'bigint',
      fecha: 'text', creado_at: 'ts', guardado_at: 'ts',
    },
    obligatorias: ['id', 'user_id', 'mision', 'zona', 'parrafo', 'ini', 'fin', 'texto', 'color'],
    valida(f) {
      const COLORES = ['dato', 'voz', 'idea', 'contra', 'duda'];
      if (COLORES.indexOf(f.color) < 0) return 'el color «' + f.color + '» no pasa el check de la tabla';
      for (const k of ['parrafo', 'ini', 'fin']) {
        if (typeof f[k] !== 'number' || !isFinite(f[k])) return 'la columna «' + k + '» tiene que ser un entero';
      }
      if (f.actualizado !== undefined && typeof f.actualizado !== 'number') return 'la columna «actualizado» tiene que ser un número';
      if (f.borrada !== undefined && typeof f.borrada !== 'boolean') return 'la columna «borrada» tiene que ser booleana';
      return null;
    },
  },

  /* supabase/sql/recursos_enlaces.sql */
  recursos_enlaces: {
    dueno: 'anadido_por',
    /* La política de select lleva SOLO es_familia(): la repisa es de la
       casa. Escribir sigue siendo de quien lo puso. */
    verTodo: true,
    columnas: {
      id: 'text', mision: 'text', tipo: 'text', titulo: 'text', url: 'text',
      descripcion: 'text', fuente: 'text', origen: 'text', dura: 'text',
      anadido_por: 'uuid', miembro: 'text', borrado: 'bool',
      actualizado: 'bigint', creado_at: 'ts', guardado_at: 'ts',
    },
    obligatorias: ['id', 'mision', 'titulo', 'url', 'anadido_por'],
    valida(f) {
      /* El check de la dirección, el mismo del SQL. Es la defensa de la
         casa y por eso el doble la aplica igual de duro: esa dirección
         acaba dentro de un href de la misión, y la misión vive en el
         dominio de la Bóveda. */
      const u = String(f.url || '');
      if (!/^https?:\/\//.test(u)) return 'la url «' + u + '» no pasa el check: tiene que empezar por http o https';
      if (u.length > 2000) return 'la url pasa de 2000 caracteres';
      if (/\s/.test(u)) return 'la url no puede llevar espacios (check de la tabla)';
      for (const c of ['"', "'", '<', '>', '\\']) {
        if (u.indexOf(c) >= 0) return 'la url no puede llevar «' + c + '» (check de la tabla)';
      }
      if (!f.titulo || String(f.titulo).length > 200) return 'el titulo tiene que medir entre 1 y 200';
      if (f.descripcion !== undefined && String(f.descripcion).length > 400) return 'la descripcion pasa de 400';
      if (f.fuente !== undefined && String(f.fuente).length > 80) return 'la fuente pasa de 80';
      if (f.dura !== undefined && String(f.dura).length > 40) return 'dura pasa de 40';
      if (f.miembro !== undefined && String(f.miembro).length > 40) return 'miembro pasa de 40';
      if (f.origen !== undefined && ['maquina', 'casa'].indexOf(f.origen) < 0) {
        return 'el origen «' + f.origen + '» no pasa el check de la tabla';
      }
      if (f.actualizado !== undefined && typeof f.actualizado !== 'number') return 'la columna «actualizado» tiene que ser un número';
      if (f.borrado !== undefined && typeof f.borrado !== 'boolean') return 'la columna «borrado» tiene que ser booleana';
      return null;
    },
  },

  /* supabase/sql/seguridad_familia_1_puerta.sql
     Solo se lee, y solo la fila propia: nadie puede nombrarse a sí
     mismo, que es justo lo que dice el comentario de ese archivo. */
  familia_miembros: {
    dueno: 'user_id',
    verTodo: false,
    soloLectura: true,
    columnas: { user_id: 'uuid', miembro: 'text', creado: 'ts' },
    obligatorias: ['user_id', 'miembro'],
    valida() { return null; },
  },
};

/* La «base de datos», en memoria: una tabla de filas por nombre. */
const datos = {};
Object.keys(TABLAS).forEach(t => { datos[t] = new Map(); });
let contadorPeticiones = 0;
/* Las peticiones que de verdad hace el APARATO: sin los OPTIONS que el
   navegador manda solo por delante (el preflight de CORS dobla cada
   llamada y no lo decide la aplicación) y sin las de la puerta de
   servicio de las sondas. Es lo único con lo que se puede afirmar «esto
   le cuesta una petición»: contando todo, una sonda honesta acusa a la
   aplicación de un gasto que es del navegador. */
let peticionesApp = 0;

/* La clave primaria de cada tabla. familia_miembros la lleva en user_id. */
function clavePrimaria(tabla) { return tabla === 'familia_miembros' ? 'user_id' : 'id'; }

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
function error(res, codigo, mensaje, detalle, code) {
  json(res, codigo, { message: mensaje, details: detalle || null, hint: null, code: code || String(codigo) });
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

function validaFila(tabla, f) {
  const T = TABLAS[tabla];
  for (const k of Object.keys(f)) {
    if (!T.columnas[k]) return 'no existe la columna «' + k + '» en ' + tabla;
  }
  for (const k of T.obligatorias) {
    if (f[k] === undefined || f[k] === null) return 'falta la columna obligatoria «' + k + '»';
  }
  return T.valida(f);
}

/* Traduce los filtros de PostgREST que usan los aparatos: campo=eq.valor */
function filtros(url) {
  const out = {};
  for (const [k, v] of url.searchParams.entries()) {
    if (k === 'select' || k === 'limit' || k === 'order' || k === 'on_conflict') continue;
    const m = /^eq\.(.*)$/.exec(v);
    if (m) out[k] = m[1];
  }
  return out;
}

/* maybeSingle() y single() piden el cuerpo como objeto en vez de lista.
   PostgREST contesta 406 con PGRST116 cuando no hay exactamente una
   fila, y supabase-js convierte ese código en «data: null» sin error.
   Sin esto, preguntar quién entró devolvía una lista y el aparato se
   quedaba sin nombre. */
function quiereObjeto(req) {
  return /vnd\.pgrst\.object/.test(req.headers['accept'] || '');
}

/* Las últimas peticiones, con su método y su camino. No es un lujo: una
   sonda que cuenta peticiones y sale un número por encima no tiene con
   qué saber CUÁL sobra, y eso son horas de mirar código bueno. */
const ultimas = [];

const servidor = http.createServer((req, res) => {
  contadorPeticiones++;
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.indexOf('/__prueba/') !== 0) {
    ultimas.push(req.method + ' ' + url.pathname + url.search);
    if (ultimas.length > 60) ultimas.shift();
    if (req.method !== 'OPTIONS') peticionesApp++;
  }

  if (req.method === 'OPTIONS') return json(res, 204, {});

  /* Una puerta de servicio para que la sonda pueda mirar y sembrar la
     «base de datos» sin pasar por el cliente. */
  if (url.pathname === '/__prueba/estado') {
    const salida = { peticiones: contadorPeticiones, peticionesApp: peticionesApp, ultimas: ultimas.slice(-20), tablas: {} };
    Object.keys(datos).forEach(t => { salida.tablas[t] = [...datos[t].values()]; });
    /* `filas` se queda apuntando a lecturas_marcas: la sonda del
       marcador ya lo usa así y no hay por qué romperla al añadir una
       tabla. */
    salida.filas = salida.tablas.lecturas_marcas;
    return json(res, 200, salida);
  }
  if (url.pathname === '/__prueba/reiniciar') {
    Object.keys(datos).forEach(t => datos[t].clear());
    contadorPeticiones = 0; peticionesApp = 0; ultimas.length = 0;
    return json(res, 200, { ok: true });
  }
  /* Sembrar SALTÁNDOSE la seguridad por fila, que es lo que hace el rol
     de servicio desde el panel. Lo necesita la sonda para poner una fila
     a nombre de OTRA persona de la casa y comprobar desde fuera que se
     ve pero no se puede tocar. */
  if (url.pathname === '/__prueba/sembrar' && req.method === 'POST') {
    let cuerpo = '';
    req.on('data', d => { cuerpo += d; });
    req.on('end', () => {
      let datosEntrantes;
      try { datosEntrantes = JSON.parse(cuerpo || '{}'); } catch (e) { return error(res, 400, 'JSON inválido'); }
      const tabla = datosEntrantes.tabla;
      if (!TABLAS[tabla]) return error(res, 404, 'no existe esa tabla: ' + tabla);
      const pk = clavePrimaria(tabla);
      (datosEntrantes.filas || []).forEach(f => {
        datos[tabla].set(f[pk], Object.assign({
          creado_at: new Date().toISOString(),
          guardado_at: new Date().toISOString(),
        }, f));
      });
      return json(res, 200, { ok: true, filas: datos[tabla].size });
    });
    return;
  }

  const mRest = /^\/rest\/v1\/([a-z_]+)$/.exec(url.pathname);
  if (!mRest || !TABLAS[mRest[1]]) {
    return error(res, 404, 'no existe esa tabla o ese camino: ' + url.pathname);
  }
  const tabla = mRest[1];
  const T = TABLAS[tabla];
  const filas = datos[tabla];
  const pk = clavePrimaria(tabla);

  /* El de verdad exige la clave publicable en TODAS las peticiones. */
  if (!req.headers['apikey']) return error(res, 401, 'falta la cabecera apikey');

  const uid = quienEs(req);
  /* Sin sesión, la seguridad por fila no deja ver nada: todas las
     políticas de estas tablas empiezan por es_familia(), que exige una
     fila en familia_miembros, que exige haber entrado. */
  if (!uid) {
    if (req.method === 'GET') return json(res, 200, []);
    return error(res, 401, 'new row violates row-level security policy for table "' + tabla + '"');
  }

  if (req.method === 'GET') {
    const f = filtros(url);
    const salida = [...filas.values()].filter(fila => {
      /* Aquí está la diferencia entre las dos tablas, y es a propósito:
         la repisa la ve la casa entera; las marcas de lectura, no. */
      if (!T.verTodo && fila[T.dueno] !== uid) return false;
      return Object.keys(f).every(k => String(fila[k]) === f[k]);
    });
    if (quiereObjeto(req)) {
      if (salida.length === 1) return json(res, 200, salida[0]);
      return error(res, 406, 'JSON object requested, multiple (or no) rows returned', null, 'PGRST116');
    }
    return json(res, 200, salida, { 'Content-Range': '0-' + Math.max(0, salida.length - 1) + '/' + salida.length });
  }

  if (req.method === 'POST') {
    if (T.soloLectura) {
      return error(res, 403, 'new row violates row-level security policy for table "' + tabla + '"');
    }
    let cuerpo = '';
    req.on('data', d => { cuerpo += d; });
    req.on('end', () => {
      let entrantes;
      try { entrantes = JSON.parse(cuerpo || '[]'); } catch (e) { return error(res, 400, 'JSON inválido'); }
      const lista = Array.isArray(entrantes) ? entrantes : [entrantes];
      const upsert = /merge-duplicates/.test(req.headers['prefer'] || '');
      for (const f of lista) {
        const mal = validaFila(tabla, f);
        if (mal) return error(res, 400, mal);
        /* La política de escritura: solo se escriben filas propias, en
           las dos tablas. Que la repisa se VEA entera no significa que
           se pueda escribir entera. */
        if (f[T.dueno] !== uid) {
          return error(res, 403, 'new row violates row-level security policy for table "' + tabla + '"');
        }
        const previa = filas.get(f[pk]);
        if (previa && !upsert) return error(res, 409, 'duplicate key value violates unique constraint "' + tabla + '_pkey"');
        /* Corregir la fila de otro se rechaza aunque venga con upsert:
           es lo que dice el `using` de la política de update. */
        if (previa && previa[T.dueno] !== uid) return error(res, 403, 'row-level security');
        filas.set(f[pk], Object.assign({}, previa || {}, f, {
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
  Object.keys(TABLAS).forEach(t => console.log('  tabla:   /rest/v1/' + t));
  console.log('  estado:  /__prueba/estado     reinicio: /__prueba/reiniciar');
  console.log('  sembrar: POST /__prueba/sembrar  {tabla, filas}');
});
