# Propuesta · La Criba 🪶

El espacio informativo personal de Josué dentro de F.A.R.O: un lugar donde
cae, solo, lo que de verdad importa de lo que se publica en el mundo sobre
las materias que estudia.

Fecha: 29 de agosto de 2026. Estado: **propuesta, nada construido todavía**.
Esto es la **Fase 0**: la puerta. Qué entra y qué no.

**Por qué se llama Criba y no «feed»:** una criba tiene fondo. Lo que pasa,
pasa; lo que no, no. Un feed no tiene fondo, y en este mismo repositorio hay
un `js/tools/redes-sociales.js` que limita el tiempo de pantalla y guarda
acuerdos familiares. Construir aquí dentro un pozo sin fondo sería
contradecir a la casa en su propio idioma. **La Criba publica una edición
que empieza y se acaba.**

---

## 0. De dónde salió esta lista

No la inventé. Salió de lo que ya está escrito en este repositorio:

- las **28 rutas del Estudio Mayor** (`js/data/misiones.js`, `color: 'mayor'`),
- las **6 rutas del adulto** de `PROPUESTA-RUTAS-DEL-ADULTO.md`.

Ahí está tu perfil de intereses, escrito por ti y sin adivinar nada. La
lista de fuentes de abajo es el reflejo de esas 34 rutas, no de lo que yo
crea que deberías leer.

**Y la lista se saca del catálogo, no de aquí.** Igual que la cuenta de
misiones de M.E.T.A.S: si mañana abres una ruta nueva, La Criba tiene que
enterarse sola. Este documento es la propuesta; el recolector leerá el
catálogo.

---

## 1. Los siete racimos

Tus 34 rutas no son 34 temas sueltos. Se agrupan en siete, y **el racimo es
la unidad**, porque una fuente sirve a varias rutas a la vez.

| # | Racimo | Rutas que alimenta |
|---|---|---|
| A | 🧠 **Mente y decisión** | Metacognición, Sesgo cognitivo, Toma de decisiones, Neuroplasticidad, Procrastinación, Psicología de masas, Persuasión |
| B | 🗣️ **Argumento y lenguaje** | Falacias, Lógica del argumento, Retórica, Oratoria, Estratagemas, Semiótica y cine |
| C | 💰 **Economía y poder** | Crítica al Capitalismo, Crítica al Marxismo, Economía política, Educación Financiera, Geopolítica, Ideologías, Poder Económico, Poder Político, Marca |
| D | 🧬 **Vida y cerebro** | Epigenética, Neuroplasticidad |
| E | 🤖 **Máquinas** | El futuro de la IA, La singularidad, Predicción algorítmica, Inteligencia Artificial, Ciberseguridad |
| F | 📖 **Relato, religión y cultura** | El Talmud, Teología, Mitología (Campbell), Literatura, Semiótica y cine |
| G | 🔬 **Método y metaciencia** | La tesis y sus negocios, Materialismo Filosófico, y **transversal a todo** |

El racimo **G no es una materia más: es el que da la calidad**. Si La Criba
sabe distinguir una revisión sistemática de una nota de prensa, los otros
seis racimos mejoran de golpe. Va primero en la Fase 1.

---

## 2. La base: cuatro fuentes que sirven a los siete racimos

Estas cuatro son el esqueleto. Todo lo demás son afinados encima.

| Fuente | Qué da | Clave | Coste |
|---|---|---|---|
| **OpenAlex** | Catálogo abierto de casi toda la producción científica, filtrable por tema y por fecha. El caballo de carga. | No, solo un correo de cortesía | Gratis |
| **Crossref** | Metadatos de DOI de prácticamente todas las editoriales. Y —importante— **la base de retractaciones de Retraction Watch**, que Crossref aloja en abierto. | No, correo de cortesía | Gratis |
| **Semantic Scholar** | Resúmenes, número de citas, y su `TLDR` de una línea. Sirve para ordenar sin IA propia. | Opcional (sube el límite) | Gratis |
| **Europe PMC** | Biomedicina y ciencias de la vida, con preprints incluidos. Mejor puerta que la de NCBI para esto. | No | Gratis |

Con solo estas cuatro ya tienes un espacio informativo científico real. **Las
demás son mejoras, no requisitos.**

---

## 3. Las fuentes por racimo

### A · 🧠 Mente y decisión

| Fuente | Qué da | Nota |
|---|---|---|
| **PsyArXiv / OSF Preprints** | Preprints de psicología. Es donde primero aparece casi todo. | ⚠️ Preprint: sin revisar por pares. **Entra etiquetado.** |
| **Nature Human Behaviour** (RSS) | Lo mejor revisado en conducta y decisión. | Resúmenes libres, texto de pago |
| **Psychological Science** (RSS) | La revista de referencia. Y la que protagonizó la crisis de replicación, lo cual la hace doblemente instructiva. | |
| **Judgment and Decision Making** | Abierta y entera. Directamente tu Ruta de la Apuesta Medida. | Gratis, texto completo |
| **Behavioral and Brain Sciences** | Artículo + comentarios de veinte especialistas en contra. Es un careo, que es el formato de tus lecturas. | |
| **Cochrane** (RSS) | Revisiones sistemáticas. El escalón más alto de evidencia que existe. | Gratis |

### B · 🗣️ Argumento y lenguaje

| Fuente | Qué da | Nota |
|---|---|---|
| **PhilPapers / PhilArchive** | Filosofía, incluida lógica y argumentación. Cosecha estándar (OAI-PMH). | Gratis |
| **Stanford Encyclopedia of Philosophy** | Entradas nuevas y revisadas. Es enciclopedia, no novedad: **entra como fondo, no como noticia.** | Gratis |
| **Argumentation** (Springer) | La revista específica de teoría de la argumentación. | |
| **Informal Logic** | Abierta y entera. Falacias y lógica informal. | Gratis |

### C · 💰 Economía y poder

Este es el racimo mejor servido de todos, y con diferencia.

| Fuente | Qué da | Nota |
|---|---|---|
| ⭐ **NEP (New Economics Papers)** | **Unos noventa boletines por especialidad, con editor humano que elige.** Es curación de verdad, no algoritmo. Para tu racimo C es la mejor fuente que existe y es gratis. | RSS por especialidad |
| **RePEc / IDEAS** | El catálogo detrás de NEP: documentos de trabajo de economía de todo el mundo. | Gratis |
| **NBER** | Documentos de trabajo, por programa. Donde se publica primero la economía académica estadounidense. | RSS |
| **BIS · FMI · Banco Mundial · BCE · Fed** | Documentos de trabajo de banca central. Para Poder Económico y Geopolítica es material primario. | RSS |
| **VoxEU / CEPR** | Los mismos economistas, escribiendo para que se entienda. | RSS |
| **World Inequality Lab** | Piketty y su equipo. Directo a la Ruta del Expediente Dorado. | |
| **FRED (St. Louis Fed)** | Series de datos económicos, no artículos. Para poner una cifra al lado de una afirmación. | ⚠️ **Requiere clave gratuita** |
| **Crisis Group · SIPRI** | Geopolítica y conflicto armado, con método declarado. | RSS |

⚠️ **Falta decidir el país.** Para lo económico local (banco central, instituto
de estadística, ministerio de hacienda) necesito que me digas de dónde.

### D · 🧬 Vida y cerebro

| Fuente | Qué da | Nota |
|---|---|---|
| **bioRxiv** (canal `genomics`, `neuroscience`) | Preprints. | ⚠️ Etiquetado |
| **Europe PMC** | Ya está en la base. Cubre casi todo este racimo. | |
| **Nature Reviews Neuroscience / Genetics** | Revisiones. Para epigenética y neuroplasticidad, mejor que artículos sueltos. | |
| ⚠️ **Nota de la casa** | Epigenética y neuroplasticidad son **dos de los campos con más exageración divulgativa que existen**. Aquí la regla 4 de abajo (la nota de prensa no es el artículo) no es burocracia: es lo que impide que La Criba se llene de «tus traumas cambian tus genes». | |

### E · 🤖 Máquinas

| Fuente | Qué da | Nota |
|---|---|---|
| **arXiv** (`cs.AI`, `cs.LG`, `cs.CY`, `stat.ML`) | Todo el campo pasa por aquí primero. Mucho volumen: hay que cribar duro. | ⚠️ Preprint |
| **CISA KEV** | Vulnerabilidades que **se están explotando de verdad ahora**, no las 30.000 teóricas del año. Para Ciberseguridad es la única lista que se puede leer entera. | Gratis, API |
| **Schneier on Security** | Criptografía y seguridad con criterio, treinta años de archivo. | RSS |
| **AI Index (Stanford HAI)** | Cifras anuales en vez de opiniones. Para la Ruta del Umbral Anunciado. | |
| **Alignment Forum / LessWrong** | Donde se discute la singularidad en serio. | ⚠️ Foro, no revisión por pares. **Etiquetado.** |

### F · 📖 Relato, religión y cultura

| Fuente | Qué da | Nota |
|---|---|---|
| ⭐ **Sefaria** | El Talmud entero, con su API abierta y sus comentaristas enlazados. No es un feed de noticias: es **una fuente primaria consultable**, y para tu Ruta de la Página que Discute es exactamente lo que hace falta. | Gratis |
| **JSTOR Daily** | Artículo divulgativo + el paper académico enlazado debajo. Formato ideal para tu casa. | RSS |
| **Aeon / Psyche** | Ensayo largo de filosofía y humanidades. | RSS |
| **Journal of Biblical Literature / Numen** | Teología y estudio de religiones con método académico, no devocional. | |
| **Journal of Folklore Research** | Mitología comparada. Campbell tiene críticos serios y conviene leerlos. | |

### G · 🔬 Método y metaciencia — **el que da la calidad**

| Fuente | Qué da | Nota |
|---|---|---|
| ⭐ **Retraction Watch** (vía Crossref) | **Qué se retractó.** Es la fuente que convierte a La Criba en algo distinto de un lector de noticias: lo que leíste hace tres meses puede haberse caído, y aquí te lo dice. | Gratis |
| **Metascience / Center for Open Science** | Cómo se estropea y cómo se arregla la ciencia. Transversal a los siete racimos. | |
| **Royal Society Open Science** | Publica replicaciones y resultados negativos, que casi nadie publica. | Gratis |
| **Data Colada** | Detección de fraude estadístico, con los casos desmontados paso a paso. Es la Ruta de la Máquina que Verifica en versión adulta. | RSS |

---

## 4. Las reglas de la puerta

Estas son el producto. Sin ellas, esto es un lector de RSS más.

1. ⚠️ **Todo entra con su nivel de evidencia a la vista, y no se puede
   apagar.** Revisión sistemática › artículo revisado por pares › preprint ›
   documento de trabajo › nota de prensa › comentario. Es la misma regla de
   oro que ya rige la repisa de enlaces («la etiqueta de máquina no se
   apaga») aplicada a la ciencia. Un preprint pintado igual que un artículo
   revisado es la forma más rápida de que La Criba te enseñe algo falso con
   cara de verdad.

2. ⚠️ **La nota de prensa NO es el artículo, y sin DOI no entra.** Las notas
   de prensa universitarias exageran de forma sistemática y medida. Si un
   ítem es nota de prensa, tiene que traer el DOI del trabajo real; si no lo
   trae, se queda fuera. Esta sola regla te quita la mitad de la basura.

3. **Lo retractado vuelve.** Un artículo que ya leíste y luego se retracta
   tiene que poder reaparecer diciéndolo. Es lo contrario de lo que hace
   cualquier red social, y es media razón para construir esto.

4. **Las fuentes pesan, y el peso se ve.** Cochrane no vale lo mismo que un
   foro. Pero el foro entra —el Alignment Forum es donde se discute la
   singularidad— con su peso escrito, no escondido en el orden.

5. **Lo que no llega, se dice.** Una revista cambia su canal y esa fuente se
   queda muda sin avisar. Tiene que haber un «de aquí no cae nada desde el
   martes» a la vista, con su botón de reintentar. Es la lección 6 del
   filtro de materias de Videos M.E.T.A.S: si el catálogo no llega, se dice,
   porque si no parece la herramienta rota.

6. ⚠️ **Lo que entra lo escribió un desconocido.** Títulos, resúmenes y
   nombres de autor de la internet abierta, pintados dentro de F.A.R.O con
   la sesión de la familia puesta: la Bóveda, las finanzas, el chat, los
   teléfonos del Buzón. Es **exactamente** el riesgo ya escrito en
   `CLAUDE.md` para las Sugerencias de M.E.T.A.S, pero peor, porque aquí el
   100% del contenido es ajeno. Se para igual y en los mismos tres sitios:
   nada dentro de un atributo del HTML, `createElement` y `textContent`,
   direcciones comprobadas con `URL()`, y solo `http`/`https`.

7. **La edición tiene fondo.** Un número al día, finito, que se acaba. No
   hay scroll infinito. Si sobra material, sobra para mañana.

---

## 5. Lo que dejo fuera, y por qué

- **Google Scholar** — no tiene puerta abierta y bloquea a los recolectores.
  Lo cubre OpenAlex.
- **SSRN** — mucho de Economía y Derecho, pero sin puerta decente. Lo que
  importa suele llegar igual por NEP o RePEc.
- **X / Twitter, Reddit, LinkedIn** — es lo que estás intentando dejar de
  leer. Meterlos aquí sería reconstruir el problema con otro nombre.
- **Agregadores de noticias generales** — el ciclo de noticias no es tu
  materia. Si una noticia importa para Geopolítica, llegará por Crisis Group
  con método declarado.
- **Revistas depredadoras** — hace falta una lista negra desde el día uno.
  DOAJ sirve de lista blanca para el acceso abierto.

---

## 6. Lo que NO pude comprobar, y hay que comprobar

**Honestidad primero:** desde esta sesión no pude probar ni una sola de estas
fuentes. El proxy de las sesiones de Claude Code devolvió **403 en las cinco**
que intenté (arXiv, OpenAlex, Crossref, Nature, PubMed) — es el mismo bloqueo
que `CLAUDE.md` ya tiene apuntado para `github.io`.

Así que **la Fase 1 empieza sondando cada fuente una vez** y apuntando en una
tabla qué devolvió de verdad: si responde, en qué formato, cuántos ítems al
día, si trae resumen, si trae DOI, y si pide clave. Esa tabla es el primer
entregable de la Fase 1, antes de escribir el recolector. Lo de arriba es una
lista candidata razonada, **no una lista verificada**.

---

## 7. Lo que decides tú

1. **Tacha y añade.** ¿Cuáles de los siete racimos te importan de verdad
   ahora y cuáles pueden esperar? No hace falta arrancar con los siete.
2. **El país** para lo económico local (banco central, estadística oficial).
3. **El idioma.** ¿Solo lo que esté en español, o también en inglés? Casi
   toda la ciencia de arriba está en inglés. Si quieres español, la Fase 3
   (el resumen hecho por máquina) deja de ser opcional.
4. **Cada cuánto.** ¿Una edición al día, o una a la semana? Empezaría por
   una al día y bajaría si abruma.
5. **El nombre.** «La Criba» es una propuesta. Es tuyo.
