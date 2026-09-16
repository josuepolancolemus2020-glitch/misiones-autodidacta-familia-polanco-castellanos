// ════════════════════════════════════════════════════════════════════
// voz-actividades-ia · verifica.ts
// ════════════════════════════════════════════════════════════════════
// LO QUE INTERPRETA Y LIMPIA LO QUE DEVUELVE CLAUDE. Sin red y sin base,
// a propósito: es la parte que puede salir torcida, y así se prueba
// entera desde Node, sin Deno:
//   node --experimental-strip-types _dev/prueba-voz-actividades-ia.mjs
//
// ⚠️ LA REGLA QUE SOSTIENE TODO ESTO: NINGUNA ACTIVIDAD ENTRA SIN UNA
// CITA LITERAL DEL TEXTO QUE LA RESPALDE. A la máquina se le pide que
// copie, tal cual, el fragmento del que sale cada respuesta; aquí se
// comprueba que ese fragmento ESTÉ en el texto, y la que no lo tenga se
// descarta y se cuenta. Es la única manera de que «el sistema genera las
// actividades» no signifique «el sistema se inventa las respuestas»: una
// pregunta con la respuesta cambiada no la descubre nadie hasta que
// alguien acierta y la pantalla le dice que falló (regla 35 de La Voz
// Prestada). El aparato vuelve a comprobarlo antes de guardar: la
// pantalla no puede fiarse de la base y la base no puede fiarse de la
// pantalla.
// ════════════════════════════════════════════════════════════════════

export type Tipo = "flash" | "pares" | "opcion" | "completar" | "abierta";
export const TIPOS: Tipo[] = ["flash", "pares", "opcion", "completar", "abierta"];

export type Nivel = "dato" | "termino" | "idea" | "tesis" | "relacion" | "juicio";
export const NIVELES: Nivel[] = ["dato", "termino", "idea", "tesis", "relacion", "juicio"];

/* La forma PLANA en que se le pide a la máquina cada actividad. Todos
   los campos van siempre, y los que no aplican van vacíos (cadena vacía,
   lista vacía, -1): un esquema sin campos opcionales es el que menos
   sorpresas da al validar la salida estructurada. */
export interface ItemPlano {
  k: string;
  nivel: string;
  donde: string;
  cita: string;
  q: string;
  a: string;
  o: string[];
  ok: number;
  ps: { a: string; b: string }[];
  guia: string;
}

/* La forma de la casa, tal como la guarda el taller (js/tools/voz-prestada.js,
   VOZ_ACT_TIPOS): tarjeta {f, r}, completar {q, a}, selección {q, o, ok},
   emparejar {q, ps: [[a, b], …]}, abierta {q, guia}. */
export interface ItemCasa {
  id: string;
  k: Tipo;
  q?: string;
  f?: string;
  r?: string;
  a?: string;
  o?: string[];
  ok?: number;
  ps?: [string, string][];
  guia?: string;
  cita: string;
  donde: string;
  nivel: Nivel;
  via: "ia";
  auto: 1;
}

export interface Descartada { motivo: string; q: string }

/* Sin tildes, sin mayúsculas, con las comillas y las rayas unificadas y
   los blancos aplastados. Es lo que hace que «El pozo —dijo— se secó» y
   «el pozo - dijo - se seco» sean la misma cadena: una máquina copia bien
   las letras y mal la tipografía, y una cita que se cae por una comilla
   curva sería un falso rechazo. */
export function normaliza(s: string): string {
  return String(s ?? "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[«»“”„‟"]/g, '"')
    .replace(/[‘’‚‛']/g, "'")
    .replace(/[–—‑]/g, "-")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

/* Y sin puntuación ninguna: la segunda vuelta de la comprobación, para
   cuando la máquina se comió una coma. Se deja como función aparte para
   que el texto entero se convierta UNA vez y no una por actividad. */
export function sinPuntuacion(s: string): string {
  return normaliza(s).replace(/[^\p{L}\p{N} ]+/gu, " ").replace(/\s+/g, " ").trim();
}

export const CITA_MIN = 15;
export const CITA_MAX = 300;

/* ¿Está esta cita en el texto? `textoNorm` y `textoSinP` vienen ya
   convertidos (ver `preparaTexto`). Una cita más corta que CITA_MIN no
   prueba nada —«el pozo» está en cualquier cuento— y se rechaza. */
export function citaEnTexto(cita: string, textoNorm: string, textoSinP: string): boolean {
  const c = normaliza(cita);
  if (c.length < CITA_MIN) return false;
  if (textoNorm.includes(c)) return true;
  const cp = sinPuntuacion(cita);
  return cp.length >= CITA_MIN && textoSinP.includes(cp);
}

export function preparaTexto(texto: string): { norm: string; sinP: string; palabras: number } {
  const norm = normaliza(texto);
  return { norm, sinP: sinPuntuacion(texto), palabras: norm ? norm.split(" ").length : 0 };
}

/* Cuántas actividades pedir. Un cuento de seiscientas palabras no da
   para treinta preguntas sin repetirse; un ensayo de ocho mil sí. */
export function cuentaObjetivo(palabras: number): number {
  if (palabras < 800) return 10;
  if (palabras < 3000) return 18;
  if (palabras < 8000) return 26;
  return 32;
}

/* Un identificador ESTABLE por actividad: sale del tipo y del enunciado,
   así que volver a generar el mismo texto reemplaza en vez de duplicar. */
export function idDe(k: string, q: string): string {
  let h = 5381;
  const s = k + "|" + normaliza(q);
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return "ia-" + (h >>> 0).toString(36);
}

const recorta = (s: unknown, max: number) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/* Limpia lo que devolvió la máquina y lo pasa a la forma de la casa.
   Lo que no cumple se DESCARTA Y SE CUENTA, con su motivo: un rechazo
   callado se ve desde fuera igual que un rechazo. */
export function limpia(crudo: unknown, texto: string, tope = 40): { items: ItemCasa[]; descartadas: Descartada[] } {
  const items: ItemCasa[] = [];
  const descartadas: Descartada[] = [];
  const vistos = new Set<string>();
  const T = preparaTexto(texto);
  const lista = Array.isArray(crudo) ? crudo : [];

  for (const x of lista) {
    const it = (x && typeof x === "object" ? x : {}) as Partial<ItemPlano>;
    const k = String(it.k ?? "").trim() as Tipo;
    const q = recorta(it.q, 600);
    const tira = (motivo: string) => descartadas.push({ motivo, q: q.slice(0, 80) });

    if (!TIPOS.includes(k)) { tira("tipo desconocido «" + String(it.k ?? "").slice(0, 20) + "»"); continue; }
    if (!q) { tira("sin enunciado"); continue; }

    const cita = recorta(it.cita, CITA_MAX);
    if (!citaEnTexto(cita, T.norm, T.sinP)) { tira("la cita no está en el texto"); continue; }

    const nivel = (NIVELES.includes(it.nivel as Nivel) ? it.nivel : "idea") as Nivel;
    const donde = recorta(it.donde, 120);
    const base = { cita, donde, nivel, via: "ia" as const, auto: 1 as const };
    const a = recorta(it.a, 400);
    const guia = recorta(it.guia, 900);

    if (k === "flash") {
      if (!a) { tira("tarjeta sin reverso"); continue; }
      const id = idDe(k, q);
      if (vistos.has(id)) { tira("repetida"); continue; }
      vistos.add(id);
      items.push({ id, k, f: q, r: a, ...base });
    } else if (k === "completar") {
      if (!/___/.test(q)) { tira("completar sin hueco ___"); continue; }
      if (!a) { tira("completar sin respuesta"); continue; }
      if (a.split(" ").length > 8) { tira("la respuesta del hueco es demasiado larga"); continue; }
      /* Y lo que va en el hueco tiene que estar en la cita: es lo que se
         está preguntando, y si la cita dice otra cosa, la respuesta se
         la inventó. */
      if (!sinPuntuacion(cita).includes(sinPuntuacion(a))) { tira("la respuesta del hueco no está en su cita"); continue; }
      const id = idDe(k, q);
      if (vistos.has(id)) { tira("repetida"); continue; }
      vistos.add(id);
      items.push({ id, k, q, a, ...base });
    } else if (k === "opcion") {
      const o = (Array.isArray(it.o) ? it.o : []).map((s) => recorta(s, 200)).filter(Boolean);
      const ok = Number.isInteger(it.ok) ? Number(it.ok) : -1;
      if (o.length < 2 || o.length > 6) { tira("selección con " + o.length + " opciones"); continue; }
      if (ok < 0 || ok >= o.length) { tira("selección sin correcta válida"); continue; }
      if (new Set(o.map(normaliza)).size !== o.length) { tira("selección con opciones repetidas"); continue; }
      if (o.some((s) => /todas las anteriores|ninguna de las anteriores/i.test(s))) { tira("«todas/ninguna de las anteriores»"); continue; }
      const id = idDe(k, q);
      if (vistos.has(id)) { tira("repetida"); continue; }
      vistos.add(id);
      items.push({ id, k, q, o, ok, ...base });
    } else if (k === "pares") {
      const ps = (Array.isArray(it.ps) ? it.ps : [])
        .map((p) => [recorta(p && (p as { a?: string }).a, 120), recorta(p && (p as { b?: string }).b, 160)] as [string, string])
        .filter((p) => p[0] && p[1]);
      if (ps.length < 2 || ps.length > 8) { tira("emparejar con " + ps.length + " parejas"); continue; }
      if (new Set(ps.map((p) => normaliza(p[0]))).size !== ps.length) { tira("emparejar con lados repetidos"); continue; }
      const id = idDe(k, q + "|" + ps.map((p) => p[0]).join("|"));
      if (vistos.has(id)) { tira("repetida"); continue; }
      vistos.add(id);
      items.push({ id, k, q, ps, ...base });
    } else {
      if (!guia) { tira("abierta sin pauta"); continue; }
      const id = idDe(k, q);
      if (vistos.has(id)) { tira("repetida"); continue; }
      vistos.add(id);
      items.push({ id, k, q, guia, ...base });
    }
    if (items.length >= tope) break;
  }
  return { items, descartadas };
}

/* Un resumen legible de lo descartado, para el aviso: «3 por no citar el
   texto, 1 repetida». Agrupado por motivo, porque veinte renglones
   iguales no dicen más que uno con su cuenta. */
export function resumeDescartes(d: Descartada[]): string {
  const cuenta = new Map<string, number>();
  d.forEach((x) => cuenta.set(x.motivo, (cuenta.get(x.motivo) ?? 0) + 1));
  return [...cuenta.entries()].map(([m, n]) => n + " · " + m).join("; ");
}
