# 📜 La Consigna — el plan entero, para construirla

**Pedido por el autor el 22 de septiembre de 2026:** «necesito otra herramienta
aparte, que se vea en el acceso rápido y sea con el propósito de que me
facilites los mejores formatos tanto para realizar prompt, habilidades skills,
grafo o loop en cuanto a las indicaciones que haga a diferentes inteligencias
artificiales. Tenerlas inventariadas, debes crear toda una lógica de proceso que
me facilite redactarlos con indicaciones programadas, busca la mejor idea
posible para hacer esta herramienta y la ubiques en acceso rápido. Siempre
visualmente atractivo, botones modernos etc.»

---

## ⏸ DÓNDE QUEDÓ, Y CÓMO SE RETOMA

**El trabajo se paró el 22 de septiembre de 2026 a media construcción**, y no
por una avería: se acabó el crédito del modelo en mitad de la tanda. Se retoma
el jueves. Esto es lo que hay que saber para no repetir nada ni perder nada.

### Lo que YA ESTÁ HECHO y comprobado

| Qué | Dónde | Estado |
|---|---|---|
| **El diseño entero** | este archivo, de aquí para abajo | ✅ Terminado. Salió de un taller de tres diseñadores con tres lentes (la tableta, la biblioteca, los formatos), dos jueces que puntuaron, una síntesis y un crítico que encontró 21 faltas, todas cerradas en esta versión. **No hay que volver a diseñar nada.** |
| **La tabla y su puerta** | `supabase/sql/consigna.sql` | ✅ Escrito y **probado contra un PostgreSQL de verdad**: 21 columnas, tres políticas con `es_familia()`, seguridad por fila puesta, sin borrado, sin puerta pública, disparador de la hora. |
| **La comprobación aparte** | `supabase/sql/consigna_comprueba.sql` | ✅ Escrita; devuelve doce filas en vertical. |
| **La prueba del SQL** | `_dev/prueba-consigna-sql.sql` | ✅ **RESULTADO: APRUEBA.** Mira la guardia, la idempotencia, los checks que muerden y la puerta dos veces en el orden bueno. |
| **El vocabulario de bloques** | `js/tools/consigna.js`, líneas 126-464 | ✅ `CSG_EMOJI`, `CSG_LEMA`, `CSG_CLASES`, `CSG_BLOQUES` (los ~50 bloques con su rótulo, su «para qué», su ejemplo escrito y sus cuatro frases hechas) y `CSG_BLOQUES_PROMPT`. Pasa `node --check`. |
| **El núcleo y su prueba** | `js/tools/consigna.js` (parte 1) y `_dev/test-consigna-node.js` | ✅ 23 de septiembre de 2026 (commit `579cf84`): moldes, armado, lector, repaso, poda, fusión y nube. **RESULTADO: APRUEBA**, 648 comprobaciones, el armado comparado carácter por carácter con el apartado 7. |
| **La pantalla** | `js/tools/consigna.js` (parte 2) y `css/consigna.css` | ✅ 23 de septiembre de 2026: el anaquel, el compositor y las tres hojas (ver, usar y pegar). Sin un solo `var(--card`. La prueba de Node sigue en APRUEBA y la de humo pasó sin cabeza en Chromium con el `index.html` entero. |
| **El cableado** | `index.html`, `js/app.js`, `sw.js` | ✅ 23 de septiembre de 2026: el `<link>`, el `<script>`, el botón del Acceso Rápido, las dos vistas y las tres hojas; `initConsigna` en `switchView` y el destello apartado del compositor; `CACHE_NAME` en `faro-app-v128`. El bucle de nombres repetidos devuelve vacío. |

### Lo que FALTA, en este orden

1. **La sonda** `_dev/probe-consigna.html` con las 22 comprobaciones del
   apartado 11, corrida hasta APRUEBA. Los botones se pulsan y las hojas se
   miden con `elementFromPoint`, como en las vecinas.
2. **La documentación** en `CLAUDE.md` (la normativa nueva, antes de la de La
   Voz Prestada) y la entrada del SQL en `PLAN-FARO-PRIVADO.md`.

### Cómo se retoma sin pensarlo

El taller de construcción quedó escrito y guardado en
**`_dev/workflow-consigna.js`**: cinco fases (núcleo y SQL en paralelo,
pantalla, sonda y documentación, cinco revisores adversariales, y el arreglo
final). El SQL ya está hecho, así que al volver a lanzarlo **hay que quitarle
la rama del SQL** y decirle al agente del núcleo que **NO empiece de cero**:
que siga `js/tools/consigna.js` donde se corta. Todo lo que ese taller necesita
saber del repositorio está escrito dentro, en la constante `HECHOS`.

Y **un recorte que manda sobre lo que sigue**: «☑ Elegir» (marcar varias piezas
y moverlas de golpe) NO va en esta primera versión. La barra del anaquel es
`[＋ Nueva] · [📋 Pegar] · | · [🗂 Estantes] · [⇅ Orden] · | · [📋 Exportar]` y
al final las vistas `▦ ☰`.

⚠️ **Y lo que no se puede olvidar al volver:** desde el 23 de septiembre de
2026 `js/tools/consigna.js` **ya está cableado** en `index.html`, y entero. Así
que cualquier cambio en él lo carga la aplicación de verdad: un error de
sintaxis tira la casa entera, porque todos los `<script>` comparten un solo
ámbito. Antes de publicar, `node --check`, la prueba de Node y el bucle de
nombres repetidos de `CLAUDE.md`.

---

# 📜 La Consigna — especificación final (v2)

Espejo de La Voz Prestada: allá se guarda lo que la máquina ESCRIBIÓ; aquí se escriben, con forma, las CONSIGNAS que se le dan (prompts, habilidades, grafos de agentes y bucles), se inventarían y se vuelven a usar a dos toques. Parte del diseño mejor puntuado (La Consigna, lente tableta), con lo que los jueces mandaron robar de los otros dos, con sus errores corregidos y con las 21 faltas del crítico cerradas (el anexo final dice dónde). Donde los jueces discreparon, la decisión va con su porqué en una línea. Se implementa tal cual.

## 1. Nombre, emoji, lema, icono y color

- **Nombre:** La Consigna. «Consigna» es las dos cosas que hace: la orden clara que se le da a alguien y el sitio de la estación donde se deja algo guardado para recogerlo después. «Pliego» es palabra de imprenta que aquí no dice nadie.
- **Emoji:** 📜 (un escrito con una orden). Se cambió del 🧭 de la v1 porque 🧭 ya significa «Ensayo» en `VOZ_GENEROS`, «Guía de estudio» en la repisa de enlaces y es el avatar de la portada, y `fa-compass` es el icono del login: el espejo de La Voz Prestada no puede llevar el emoji de uno de sus géneros. 📜 no lo usa ninguna pantalla de la aplicación (solo aparece dentro de contenido de misiones: un logro del taller y textos de `misiones.js`), y `fa-scroll` no lo usa nada de `index.html`. Vive en `CSG_EMOJI`; la sonda 1 comprueba que no está entre los emojis de `VOZ_GENEROS`.
- **Lema:** «Lo que se le pide a la máquina, con forma, guardado y a dos toques de volver a usarse.»
- **Icono del Acceso Rápido:** `fa-solid fa-scroll` (existe en Font Awesome 6.4.0, la que carga `index.html`). Va PEGADO a La Voz Prestada: entre `data-qa="view-voz"` y `data-qa="view-antena"`.
- **Color de la baldosa:** `.qa-csg { background: linear-gradient(135deg, #3f6212, #a3e635); }` (oliva → lima). Es el único tono que ninguna baldosa vecina roza; se comprobó contra las veinte de `css/app.css`: apunte #dc2626→#f87171, hab #16a34a→#22c55e, red #7c3aed→#a78bfa, pro #2563eb→#60a5fa, inv #0d9488→#2dd4bf, bov slate, asig cian, esc #b45309→#f59e0b, est #db2777→#f472b6, col #64748b→#94a3b8, fam #1e3a7c→#3b82f6, finfam #ea580c→#fb923c, des #d97706→#fbbf24, redac #4f46e5→#818cf8, ant #0369a1→#38bdf8, rutas #0f766e→#2dd4bf, msug #15803d→#4ade80, mvid #b91c1c→#f87171, voz #78350f→#b97a45, crb #175e63→#4db6ac. El fucsia de la v1 se leía igual que Estadísticas a 54 px; el lima no se parece ni al verde de Sugerencias (#15803d, más azulado y dos baldosas más lejos) ni a los ámbares.
- **Botón:** `<button type="button" class="qa-item" data-qa="view-consigna"><span class="qa-icon qa-csg"><i class="fa-solid fa-scroll"></i></span><span class="qa-label">La Consigna</span></button>`. SIN insignia: las insignias son para lo que mandó otro y hay que atender; los propios borradores son ruido y una consulta más al arrancar.
- **Archivos:** `js/tools/consigna.js` (prefijo `csg` en TODAS las funciones globales; hoy no lo usa nadie: `grep -rn "function csg" js` devuelve vacío), `css/consigna.css` (tokens de la aplicación: `--surface`, `--bg`, `--border`, `--text`, `--muted`, `--faint`, `--brand`; **`--card` no existe** y la sonda suspende si el CSS lo nombra), `supabase/sql/consigna.sql`, `supabase/sql/consigna_comprueba.sql`, `_dev/probe-consigna.html`, `_dev/prueba-consigna-sql.sql`. En `index.html`: `<link>` después de `css/redaccion-cuadernos.css`; `<script>` después de `js/tools/voz-adjunto.js` y antes de `js/app.js`; dos vistas `#view-consigna` (anaquel) y `#view-consigna-editor` (compositor) con `header.app-header.compact` y `.view-scroll`; tres hojas `.fin-modal-overlay > .fin-modal` colgadas del `body`, al lado de `#voz-pegar-overlay`: `#csg-ver-overlay` (hoja vertical), `#csg-usar-overlay` (usar) y `#csg-pegar-overlay` (pegar y repartir). En `js/app.js`, dos líneas en `switchView`: `if (id === 'view-consigna' && typeof initConsigna === 'function') initConsigna();` y `'view-consigna-editor'` añadido a la condición que esconde `#destello-fab` (junto a `view-redaccion-editor`). `CACHE_NAME` de `sw.js` sube (hoy `faro-app-v127`). El SQL se apunta en `PLAN-FARO-PRIVADO.md` como pendiente.

## 2. Vocabulario

- **Pieza:** una consigna guardada: clase + molde + título + bloques + material + máquina + estantes + bitácora + versiones. Es la fila de la tabla y la ficha del anaquel.
- **Clase:** qué es para la máquina. Cuatro y fijas (`CSG_CLASES`): 💬 Prompt, 🧰 Habilidad, 🕸 Grafo, 🔁 Bucle. Cada una abre con un molde recomendado.
- **Molde:** un formato con nombre. En `CSG_MOLDES[id]`: `{ clase, nombre, cuando, recomendado?, bloques: [ {id, ob, rotulo?, para_que?, ejemplo?, frases?, inicial?, plantilla?} ], forma?, sinEncabezados?, rotuloMayus?, cabecera?, reordena?, auto?, pseudo?, cierre?, orquestar?, vozPrestada? }`. Una entrada de `bloques` nombra un id del vocabulario y dice si es obligatorio (`ob`); **lo que traiga además (rótulo, para qué, ejemplo, frases, texto inicial, plantilla) SOBRESCRIBE al vocabulario solo dentro de ese molde**. Eso es lo que permite que `formato` se llame «Respuesta» en CO-STAR, `tope` «Rondas» en Careo, `nodos` «Especialistas» en Coordinador o que `ejemplos` traiga frases distintas en cada molde sin tener dos ids. `csgBloqueDef(moldeId, id)` devuelve la mezcla (`Object.assign({}, CSG_BLOQUES[id] || {rotulo: id}, sobreescritura)`), y es lo ÚNICO que consultan el compositor, el armado y el repaso.
- **Bloque:** una parte de la consigna. El vocabulario único `CSG_BLOQUES[id] = { rotulo, para_que, ejemplo, frases, lista?, sistema?, plantilla?, inicial? }` le da a cada id UN significado; un molde solo elige cuáles, en qué orden y con qué palabras. `lista: true` = un renglón por elemento (se arma como lista); `sistema: true` = va en la mitad «sistema» de la forma `xml`; `plantilla` = lo que mete el botón «＋ Otro». Cambiar de molde conserva los bloques con el mismo id; los que no tienen sitio se siguen pintando como BLOQUES LIBRES con su rótulo guardado (id `csgSlugId(rotulo)`: minúsculas sin tildes, `[^a-z0-9]` → `_`, único en la pieza).
- **Equivalencias (`CSG_EQUIVALE`):** para «Duplicar en otro molde» cuando el destino no tiene el id: `rol→[identidad] · identidad→[rol] · tarea→[mision, paso, pregunta, borrador, texto] · mision→[tarea] · paso→[tarea] · pregunta→[tarea] · borrador→[tarea] · texto→[tarea] · reglas→[siempre, limites] · siempre→[reglas] · nunca→[reglas] · limites→[reglas] · objetivo→[meta, tarea] · meta→[objetivo] · responde→[formato] · salida→[formato, fin] · fin→[salida] · estilo→[tono] · verificacion→[comprobacion] · comprobacion→[verificacion]`. Se toma el primer candidato que el destino tenga y esté vacío; dos orígenes al mismo destino se pegan con una línea en blanco; lo demás, bloque libre marcado «traído de «X»: colócalo o quítalo». `comprobacion` es UN solo id en todas las clases (en la v1 había `comprobacion` y `comprobaciones`, y graduar de Encargo a SKILL.md dejaba la comprobación como bloque libre).
- **Frase hecha:** una frase literal del JS que un chip mete de un toque y otro toque quita si sigue idéntica.
- **Variable:** un hueco `{{así}}` (`/\{\{\s*([a-záéíóúñ0-9_]+)\s*\}\}/gi`); se detecta al escribir y se rellena al USAR, nunca en la pieza. Reservadas: `{{maquina}}` (nombre de la máquina elegida), `{{titulo}}` (título de la pieza, o «(sin título)») y `{{hoy}}` (`AAAA-MM-DD` local).
- **Material:** lo que se pega DEBAJO de la consigna (el texto a corregir, el informe). Columna propia, nunca dentro de `bloques`; sale entre marcas; no se repasa.
- **Máquina:** a quién va (`CSG_MAQUINAS`). Decide la forma de salida y la dirección para abrirla.
- **Forma de salida:** `xml` (etiquetas), `md` (encabezados Markdown), `seguida` (párrafos «Rótulo: texto»), `skill` (archivo SKILL.md); más `mermaid` y `plan` (grafos) y `plan` (bucles).
- **Uso:** una entrada de la bitácora `{uid, t, maquina, v, ok, nota}`; `ok` es `null` (sin contestar), `'si'`, `'regular'` o `'no'`; `nota` ≤ 300 caracteres.
- **Bitácora:** la lista de usos. SE PREGUNTA, no se rellena.
- **Versión:** el número que sube al corregir una pieza que ya se usó; la anterior queda con sus bloques y se puede volver a ella.
- **Borrador:** una pieza guardada con algo en rojo en el repaso. Guardar nunca se bloquea; usar sí.
- **Estante:** el rótulo del autor; una pieza está en varios; «Maestría» y «maestria» son el mismo (`csgClave`: NFD sin diacríticos, minúsculas, bordes y espacios dobles fuera).

## 3. Las clases y sus moldes

### 3.0 El vocabulario base (`CSG_BLOQUES`)

id · rótulo base · marcas. Los ids son ASCII sin tildes porque son las etiquetas XML de Claude.

`tarea` Tarea · `formato` Formato de salida · `rol` Rol (sistema) · `contexto` Contexto · `reglas` Reglas (lista, sistema, plantilla «- ») · `ejemplos` Ejemplos (lista, plantilla «{{entrada}} → {{salida}}») · `comprobacion` Cómo se comprueba (lista) · `tono` Tono (sistema) · `objetivo` Objetivo · `estilo` Estilo · `audiencia` Audiencia · `caso` Ahora tú · `pasos` Pasos (lista, plantilla «n. » con el número siguiente) · `responde` Luego responde · `pregunta` Pregunta · `fuentes` Fuentes permitidas · `citas` Reglas de cita · `limites` Límites · `voz` Voz · `genero` Género y largo · `tema` Tema o encargo · `etiqueta` La etiqueta de la casa (inicial: el texto de Voz prestada, §3.1) · `texto` Texto · `nombre` Nombre (name) · `disparador` Descripción y disparador (description) · `recursos` Herramientas y recursos (lista, plantilla «- ») · `identidad` Identidad (sistema) · `mision` Misión (sistema) · `siempre` Siempre (lista, sistema, plantilla «Siempre ») · `nunca` Nunca (lista, sistema, plantilla «Nunca ») · `meta` Meta · `nodos` Nodos, uno por renglón (lista, plantilla «{{nombre}}: recibe {{entrada}}, entrega {{salida}}.») · `aristas` Aristas y condiciones (lista, plantilla «{{a}} → {{b}}.») · `estado` Lo que viaja entre nodos · `fin` Fin y entrega · `coordinador` Coordinador · `reparto` Cómo se reparte · `juntar` Cómo se junta · `paso` Paso que se repite · `parada` Criterio de parada · `tope` Tope · `memoria` Lo que se guarda entre vueltas · `verificacion` Verificación · `salida` Qué sale al final · `borrador` Borrador · `critico` Crítico · `revision` Revisión · `lista` Lista (lista, plantilla «» renglón vacío) · `postura_a` Postura A · `postura_b` Postura B · `juez` Juez.

Cada bloque abajo se escribe **id · Rótulo · ● obligatorio / ○ opcional — para qué — Ej.: — Frases:**. Cuando el rótulo, el para qué, el ejemplo o las frases difieren del vocabulario base, es una sobreescritura de ESA entrada del molde, y se marca «(sobrescribe …)». Las frases de los bloques que no se repiten dentro de un molde viven en el vocabulario; las sobreescritas, en el molde. Los bloques `lista` son UN recuadro con un renglón por elemento y un botón «＋ Otro» que mete la plantilla en un renglón nuevo: quince campos son quince toques en una tableta.

### 3.1 💬 Prompt — un encargo de una vez

Abre con **Rápido**. Moldes: Rápido · Encargo completo · CO-STAR · Con ejemplos · Razonado · Investigación con fuentes · Voz prestada · Libre.

**Rápido** (`rapido`, recomendado, `sinEncabezados`) — cuando sabes qué quieres y no se va a reusar. Un solo obligatorio: un «rápido» con dos obligatorios no es rápido (regla 1 del Apunte rápido).
- `tarea` · Tarea · ● — Qué tiene que hacer, en una frase que empiece por un verbo; el único bloque sin el que no existe un prompt. — Ej.: «Resume este informe de la OCDE en diez puntos, cada uno con su dato y la página de donde sale.» — Frases: «Resume {{texto}} en diez puntos, uno por renglón.» · «Corrige la ortografía y el estilo de lo que va abajo sin cambiar el sentido.» · «Explícame {{tema}} como a alguien que lo oye por primera vez.» · «Dame cinco títulos para {{pieza}}, de menos de sesenta caracteres.» · «Compara {{a}} y {{b}} en una tabla de tres columnas.»
- `formato` · Formato de salida · ○ — Cómo se quiere ver la respuesta; sin esto la máquina elige por ti, y elige párrafos con introducción y despedida. — Ej.: «Lista numerada. Cada punto: dato · fuente · página. Sin introducción ni cierre.» — Frases: «En una lista de puntos, sin introducción ni despedida.» · «En una tabla con estas columnas: {{columnas}}.» · «En español de Honduras, tuteando.» · «Máximo {{n}} palabras.» · «En Markdown, con un encabezado por sección.» · «Solo el texto pedido: nada de comentarios sobre lo que hiciste.» · «Primero el resultado; debajo, la lista de cambios.»

**Encargo completo** (`encargo`) — cuando importa el resultado o se va a reusar. Abre con Tarea y Formato abiertos y los otros seis plegados.
- `rol` · Rol · ○ — Quién es la máquina mientras contesta: cambia el nivel, el vocabulario y lo que da por sabido. — Ej.: «Eres un editor de una revista de divulgación en español, riguroso con las fuentes y alérgico a las frases hechas.» — Frases: «Eres un editor de textos en español, riguroso con las fuentes.» · «Eres un maestro de secundaria que explica con ejemplos de la vida diaria.» · «Eres un investigador que distingue lo que sabe de lo que supone.» · «Eres un corrector de estilo: no cambias el sentido, solo la forma.» · «Eres un guionista de video-ensayos de diez minutos.»
- `contexto` · Contexto · ○ — Lo que la máquina no puede saber: para quién es, de dónde sale, qué ya se hizo. — Ej.: «Esto va en la revista de la casa, que leen cuatro personas de entre 12 y 50 años. Ya tengo el borrador; lo que falta es apretar el arranque.» — Frases: «Es para {{destino}}, que lee {{quien}}.» · «Ya tengo esto hecho: {{lo_hecho}}. No lo repitas.» · «El material está abajo, entre las marcas ===.» · «Lo voy a pegar tal cual, sin retocar, así que cuida el formato.» · «El texto es mío; puedes ser duro.»
- `tarea` · Tarea · ● — (vocabulario). — Ej.: «Reescribe los tres primeros párrafos para que el dato más fuerte salga en la primera frase.» — Frases (sobrescribe): «Reescribe {{que}} para que {{objetivo}}.» · «Resume {{texto}} en diez puntos, uno por renglón.» · «Escribe {{pieza}} de {{n}} palabras sobre {{tema}}.» · «Revisa {{texto}} y señala lo que no se sostiene.» · «Convierte {{texto}} en {{forma}}.»
- `reglas` · Reglas · ○ — Lo que no se negocia; escrito aparte de la tarea se cumple, mezclado se pierde. Una por renglón. — Ej.: «No inventes datos; si no lo sabes, dilo.» / «Cita cada fuente con su dirección.» / «No uses «además» más de una vez.» — Frases: «No inventes datos; si no lo sabes, dilo.» · «Cita cada fuente con su dirección; sin dirección no vale.» · «No cambies los nombres propios ni las cifras.» · «Si la instrucción es ambigua, pregunta antes de hacer.» · «Sin adornos: ni «en resumen», ni «es importante destacar».» · «Responde en español de Honduras.»
- `formato` · Formato de salida · ● — (vocabulario; aquí obligatorio: es lo que convierte una respuesta en material pegable). — Ej.: «Los tres párrafos reescritos, y debajo una lista de qué cambiaste y por qué, un cambio por renglón.»
- `ejemplos` · Ejemplos · ○ — Una muestra vale más que tres reglas: la máquina imita antes que obedece. Pares «entrada → salida», uno por renglón. — Ej.: «El PIB creció 3 %. → El PIB creció 3 % (BCH, 2025, p. 4).» — Frases: «{{entrada}} → {{salida}}» · «Así quiero que salga: {{ejemplo_bueno}}» · «Así NO: {{ejemplo_malo}}» · «Copia el tono de este párrafo: {{parrafo}}»
- `comprobacion` · Cómo se comprueba · ○ — Qué mira la máquina antes de entregar; es lo que la hace revisar en vez de soltar lo primero. — Ej.: «Cuenta los puntos: deben ser diez.» / «Mira que cada uno lleve página.» / «Borra cualquier frase que empiece por «es importante».» — Frases: «Antes de entregar, revisa que cumples cada regla y corrige lo que no.» · «Cuenta: tienen que ser exactamente {{n}}.» · «Si una fuente no tiene dirección, quítala y dilo.» · «Al final, di en una línea qué no pudiste cumplir y por qué.»
- `tono` · Tono · ○ — Cómo suena; si no se dice, sale el tono de manual de electrodoméstico. — Ej.: «Directo y sin adornos, como quien explica a un amigo listo.» — Frases: «Directo y sin adornos.» · «Cercano, tuteando, sin condescender.» · «Técnico y preciso, para quien ya sabe del tema.» · «Como una conversación, no como un informe.»

**CO-STAR** (`costar`) — cuando el problema no es qué hacer sino para quién y con qué efecto. Seis bloques en el orden de la sigla; el orden no se cambia porque el nombre ES el orden.
- `contexto` · Contexto · ○ — (vocabulario). — Ej.: «Es la columna de apertura del número de octubre de la revista de la casa; el tema del número es la memoria.» — Frases (sobrescribe): las de Contexto más «Ya se publicó {{lo_anterior}}; esto es lo que sigue.»
- `objetivo` · Objetivo · ● — Qué tiene que LOGRAR la respuesta, no qué tiene que hacer. — Ej.: «Que un lector que no conoce el tema entienda por qué importa en los dos primeros párrafos.» — Frases: «Que {{quien}} entienda {{que}} sin haber leído nada antes.» · «Convencer a {{quien}} de {{que}} con datos, no con adjetivos.» · «Dejar una lista de decisiones que se puedan tomar hoy.» · «Que sirva de guion para hablar tres minutos.»
- `estilo` · Estilo · ○ — A qué se parece la escritura. — Ej.: «Periodístico: frases cortas, el dato primero, sin jerga.» — Frases: «Periodístico: frases cortas, dato primero.» · «Académico, con citas en APA.» · «Como un manual: pasos numerados y nada más.» · «Como un ensayo: una idea por párrafo, con transiciones.»
- `tono` · Tono · ○ — (vocabulario). — Ej.: «Cercano y con algo de humor, sin perder la seriedad del dato.»
- `audiencia` · Audiencia · ● — Quién lo va a leer. — Ej.: «Un estudiante de sexto grado que lee bien pero no sabe nada de economía.» — Frases: «Un niño de {{edad}} años que lee bien.» · «Un adulto sin formación en el tema.» · «Un colega que ya sabe del tema y quiere lo nuevo.» · «Un maestro que lo va a explicar en clase.»
- `formato` · Respuesta · ● (sobrescribe rótulo, ejemplo y frases) — La forma exacta: largo, estructura, idioma. — Ej.: «600 palabras, cuatro párrafos, sin subtítulos, en español de Honduras.» — Frases: «{{n}} palabras en {{k}} párrafos, sin subtítulos.» · «En una lista de puntos, sin introducción ni despedida.» · «En español de Honduras, tuteando.» · «Solo el texto pedido: nada de comentarios sobre lo que hiciste.»

**Con ejemplos** (`ejemplos`, `reordena: caso al final`) — cuando es más fácil enseñar tres casos que explicar la regla. El repaso avisa con menos de dos pares.
- `tarea` · Tarea · ● — Qué hay que hacer con cada entrada. — Ej.: «Convierte cada cita suelta a la forma (Autor, año, p.).» — Frases (sobrescribe): «Convierte cada {{entrada}} a {{forma}}.» · «Clasifica cada renglón en una de estas clases: {{clases}}.» · «Extrae de cada texto: {{datos}}.» · «Reescribe cada frase siguiendo el patrón de los ejemplos.»
- `ejemplos` · Ejemplos · ● — Pares entrada → salida, al menos dos y que cubran casos distintos. — Ej.: «Harari 2014 página 45 → (Harari, 2014, p. 45)» / «Informe del BID de 2023, p. 12 → (BID, 2023, p. 12)» — Frases (sobrescribe): «{{entrada}} → {{salida}}» · «Un caso difícil: {{entrada_dificil}} → {{salida}}» · «Así NO: {{ejemplo_malo}}» · «Un ejemplo por clase, para que ninguna quede sin enseñar.»
- `caso` · Ahora tú · ● — La entrada nueva; va aparte para que no se confunda con un ejemplo más, y SIEMPRE sale la última del texto armado. — Ej.: «Ahora haz lo mismo con cada renglón de lo que va abajo.» — Frases: «Ahora haz lo mismo con esto: {{entrada}}» · «Ahora haz lo mismo con cada renglón de lo que va abajo.» · «Sigue exactamente el patrón de los ejemplos.» · «Si una entrada no encaja en el patrón, dilo en vez de forzarla.»
- `formato` · Formato de salida · ○ (sobrescribe para qué, ejemplo y frases) — Solo si la salida tiene que diferir de los ejemplos. — Ej.: «Un renglón por caso: «caso → clase», sin nada más.» — Frases: «Un renglón por caso, con la misma flecha que los ejemplos.» · «Solo la salida, sin repetir la entrada.» · «En una tabla de dos columnas: entrada y salida.» · «Sin explicaciones salvo en los casos dudosos, y ahí en una frase.»

**Razonado** (`razonado`) — cálculos, decisiones, análisis con varios caminos; NO para textos creativos (el «cuándo» lo dice).
- `tarea` · Tarea · ● — La pregunta o el problema, con sus datos. — Ej.: «Decide si conviene pasar el presupuesto de la casa de mensual a quincenal, con estos datos: …» — Frases (sobrescribe): «Decide si {{opcion_a}} o {{opcion_b}}, con estos datos: {{datos}}.» · «Calcula {{que}} a partir de {{datos}}.» · «Analiza {{situacion}} y di qué harías.» · «Encuentra el error en {{razonamiento}}.»
- `pasos` · Cómo pensarlo · ● (sobrescribe rótulo, para qué, ejemplo y frases) — Los pasos en orden, escritos por quien sabe hacerlo: lo que separa «piensa paso a paso» de un método. — Ej.: «1. Separa premisas de conclusión.» / «2. Comprueba si la conclusión se sigue aunque las premisas sean falsas.» / «3. Solo entonces mira si las premisas son verdad.» — Frases: «Antes de responder, razona paso a paso y muéstralo.» · «Primero {{paso1}}; después {{paso2}}; solo al final {{paso3}}.» · «Considera al menos dos caminos y di por qué eliges uno.» · «Si un paso depende de un dato que no tienes, márcalo.»
- `responde` · Luego responde · ● — Separar razonamiento y respuesta, para copiar solo la respuesta. — Ej.: «Después del razonamiento, pon «RESPUESTA:» y debajo solo el resultado.» — Frases: «Después, bajo el rótulo RESPUESTA:, solo el resultado.» · «La respuesta final en una sola frase.» · «Separa razonamiento y respuesta con una raya ---.» · «Si el razonamiento cambia tu primera idea, dilo.»
- `comprobacion` · Cómo se comprueba · ○ — Ej.: «Vuelve a hacer la cuenta por otro camino y mira que dé lo mismo.» — Frases (sobrescribe): «Vuelve a hacerlo por otro camino y mira que dé lo mismo.» · «Comprueba cada cifra contra los datos que te di.» · «Di qué pasaría si la suposición {{n}} fuera falsa.» · «Al final, di en una línea qué no pudiste comprobar.»

**Investigación con fuentes** (`fuentes`, `reordena: en perplexity fuentes, citas, pregunta, formato, limites`, `vozPrestada`) — cuando la respuesta va a acabar en La Voz Prestada como ensayo con bibliografía, en Redacción o en un video-ensayo. Es el molde de la casa: ninguna fuente entra sin su etiqueta.
- `pregunta` · Pregunta · ● — Una sola pregunta, concreta y con su alcance; dos preguntas son dos prompts. — Ej.: «¿Qué efecto tuvo la jornada extendida en Honduras entre 2015 y 2024 sobre la deserción escolar?» — Frases: «¿Qué se sabe de {{tema}} en {{lugar}} entre {{desde}} y {{hasta}}?» · «¿Qué evidencia hay a favor y en contra de {{afirmacion}}?» · «¿Quiénes son los tres autores más citados sobre {{tema}} y en qué discrepan?» · «¿Qué cambió en {{tema}} desde {{anio}}?»
- `fuentes` · Fuentes permitidas · ● — De dónde puede sacar y de dónde no. — Ej.: «Solo informes de organismos (BID, Banco Mundial, UNESCO), revistas con revisión por pares y prensa nacional con fecha. Nada de blogs ni de resúmenes de terceros.» — Frases: «Solo fuentes con autor, fecha y dirección.» · «Prefiere informes de organismos y revistas con revisión por pares.» · «Nada de blogs, foros ni resúmenes de otras IA.» · «Si la fuente está en inglés, cita el original y traduce la cita.» · «Usa solo las fuentes del cuaderno.»
- `citas` · Reglas de cita · ● — Cómo se cita cada dato, para que el lector de La Voz Prestada case las llamadas con la bibliografía. — Ej.: «Cada dato con (Autor, año, p.) pegado a la frase, y al final un apartado «## Referencias» con una entrada por renglón: autor, año, título, dirección.» — Frases: «Cada dato con (Autor, año, página) pegado a la frase.» · «Al final, un apartado «## Referencias» con una entrada por renglón y su dirección.» · «Marca ⚠️ SIN VERIFICAR lo que no puedas comprobar.» · «No mezcles dos fuentes en una misma cita.» · «Numera las referencias y usa [n] en el texto.»
- `formato` · Formato de salida · ● (sobrescribe ejemplo y frases) — Ej.: «Un ensayo de 1.500 palabras con subtítulos «## », en español de Honduras.» — Frases: «Un ensayo de {{n}} palabras con subtítulos «## ».» · «Una tabla con un renglón por hallazgo: dato · fuente · año.» · «Primero lo que se sabe seguro; después lo discutido; al final lo que nadie ha medido.» · «Encabeza con Título:, Voz: y Máquina:, una por renglón.»
- `limites` · Límites · ○ — Qué queda fuera, cuánto, hasta cuándo. — Ej.: «Máximo 1.500 palabras. No entres en la parte legal. Solo hasta 2024.» — Frases: «Máximo {{n}} palabras.» · «Deja fuera {{tema_fuera}}.» · «Solo hasta {{anio}}.» · «Si no hay evidencia suficiente, dilo y para.»
- Salida: en NotebookLM, si Fuentes está vacío se arma «Fuentes permitidas: Usa solo las fuentes del cuaderno.»; el repaso avisa en Perplexity si Citas no pide la dirección.

**Voz prestada** (`voz`, `vozPrestada`) — un cuento, ensayo, poema o carta «a la manera de» alguien. Lo que devuelva va derecho a La Voz Prestada, y por eso pide a la máquina que lo entregue con la etiqueta de la casa puesta.
- `voz` · Voz · ● — A quién imita, con una pista de qué de esa voz. — Ej.: «Juan Rulfo: frases cortas, pueblo seco, muertos que hablan, ningún adjetivo que sobre.» — Frases: «Escribe a la manera de {{autor}}: {{rasgos}}.» · «Imita la voz de {{autor}} sin copiar ninguna frase suya.» · «Con el ritmo de {{autor}} pero con un tema de hoy: {{tema}}.» · «Como lo contaría {{autor}} en una entrevista imaginada.»
- `genero` · Género y largo · ● — Con la palabra de la lista de La Voz Prestada (cuento, ensayo, poema, carta, entrevista…). — Ej.: «Un cuento de unas 1.200 palabras, en tres capítulos.» — Frases: «Un cuento de {{n}} palabras en {{k}} capítulos.» · «Un ensayo de {{n}} palabras con subtítulos.» · «Un poema de {{n}} versos, respetando los saltos de renglón.» · «Una carta de una página.»
- `tema` · Tema o encargo · ● — De qué va y lo que tiene que pasar sí o sí. — Ej.: «Un hombre vuelve a su pueblo a cobrar una deuda y descubre que el deudor murió hace diez años.» — Frases: «Tiene que pasar esto: {{hecho}}.» · «Tiene que aparecer {{elemento}}.» · «Ambientado en {{lugar}} en {{epoca}}.» · «Termina sin resolverlo todo.»
- `etiqueta` · La etiqueta de la casa · ● — Pedir a la máquina que encabece con las etiquetas que entiende la hoja de pegar de La Voz Prestada (`VOZ_ETIQUETAS`: Título, Voz, Máquina, Género, y «Consigna» → su campo `encargo`). Viene RELLENO (`inicial`, en el vocabulario): «Encabeza el texto con estas líneas, una por renglón y nada más antes: «Título:» y el título que le pongas; «Voz:» y a quién imitas; «Máquina: {{maquina}}»; «Género:» y el género en una palabra (cuento, ensayo, poema, carta, entrevista); «Consigna: {{titulo}}». Los capítulos con «## » y su nombre; los subtítulos con «### »; las citas con «> ». Termina con FIN solo en su renglón.» — Frases: «Encabeza con Título:, Voz:, Máquina: y Género:, una por renglón.» · «Los capítulos con «## » y su nombre; los subtítulos con «### ».» · «Las citas con «> » y las listas con «- ».» · «Termina con la palabra FIN sola en su renglón.» · «Si hay bibliografía, al final bajo «## Referencias», una entrada por renglón.»

**Libre** (`libre`, `sinEncabezados`) — donde cae lo pegado que no se entiende como bloques y lo escrito de un tirón. Solo en Prompt (un «Libre» en Grafo sería una clase cuya exportación no existe; lo pegado que no se entiende cae aquí y el chip propone la clase).
- `texto` · Texto · ● — La consigna tal cual. — Ej.: «Corrige este texto sin cambiar el sentido y devuélvelo entero, en español de Honduras: {{texto}}» — Frases: «No inventes datos; si no lo sabes, dilo.» · «Responde en español de Honduras.» · «Devuelve solo el resultado.» · «Si algo es ambiguo, pregunta antes.»

### 3.2 🧰 Habilidad — lo que sabrá hacer siempre

Abre con **SKILL.md**. Moldes: SKILL.md · Instrucción de sistema · Receta corta.

**SKILL.md** (`skill`, recomendado, `forma: 'skill'`) — el formato de las Agent Skills: frontmatter `name`/`description`, que es lo que la máquina lee para decidir si la usa. Un frontmatter mal hecho no da error: la habilidad no carga nunca; por eso el repaso PARA el uso si `name` no cumple `^[a-z0-9]+(-[a-z0-9]+)*$` con 1..64 o si `description` va vacía o pasa de 1024.
- `nombre` · Nombre (name) · ● — Minúsculas, números y guiones; nombre de la carpeta y con el que se invoca. Se propone desde el título (`csgSlug`) sin pisar lo escrito (`_csgAuto`). — Ej.: «corrector-revista-casa» — Frases: «corregir-{{que}}» · «revisar-{{que}}» · «escribir-{{que}}» · «resumir-{{que}}»
- `disparador` · Descripción y disparador (description) · ● — Qué hace Y cuándo se usa, en tercera persona, con las palabras que dice la persona y para qué NO sirve. — Ej.: «Corrige ortografía y estilo de notas en español de Honduras y devuelve el texto corregido más la lista de cambios con su norma. Úsala cuando pidan «corrige», «revisa el estilo» o peguen una nota para la revista. No la uses para traducir.» — Frases: «Úsala cuando pidan {{palabras}}.» · «Úsala cuando peguen {{tipo_de_texto}}.» · «No la uses para {{caso_fuera}}; para eso está {{otra_habilidad}}.» · «Se dispara aunque no la nombren, si la tarea es {{tarea}}.»
- `pasos` · Pasos · ● — Lo que hace, en orden y numerado; un paso, una acción. — Ej.: «1. Lee el texto entero antes de tocar nada.» / «2. Marca las erratas.» / «3. Marca el estilo, con la norma al lado.» / «4. Devuelve el texto corregido y la lista de cambios.» — Frases: «1. Lee todo antes de tocar nada.» · «Pregunta {{dato}} si no viene.» · «Devuelve primero el resultado y después la lista de cambios.» · «Si algo no encaja en los pasos, para y dilo.»
- `recursos` · Herramientas y recursos · ○ — Qué puede usar y qué no. — Ej.: «Usa la lista de reglas de estilo que va debajo. No busques en internet.» — Frases: «Usa solo lo que va en este archivo.» · «Puede buscar en internet solo para {{que}}.» · «Lee primero {{archivo}} antes de empezar.» · «No ejecutes nada: solo escribe.»
- `comprobacion` · Comprobaciones · ● (sobrescribe rótulo, para qué, ejemplo y frases) — Lo que revisa antes de dar por hecha la tarea; lo que separa una habilidad de un prompt largo. — Ej.: «Ningún nombre propio cambiado.» / «Ninguna cifra tocada.» / «Cada cambio con su norma.» — Frases: «Antes de entregar, revisa que cumpliste cada paso.» · «Ningún dato del original cambiado.» · «Cuenta lo pedido: tienen que ser {{n}}.» · «Si una comprobación falla, corrige y vuelve a revisar, hasta {{n}} veces.»
- `ejemplos` · Ejemplos · ○ (sobrescribe para qué, ejemplo y frases) — Un pedido real y lo que hace con él, y uno en que NO se activa. — Ej.: «Pedido: «Arréglame esta nota» + texto pegado → corrige y devuelve las dos partes.» / «No se activa: «Hazme un post de esta nota».» — Frases: «Pedido: «{{pedido}}» → {{que_hace}}.» · «{{entrada}} → {{salida}}» · «Caso en que NO se activa: «{{pedido}}» → {{otra_habilidad}}.» · «Un caso corto vale más que tres reglas.»
- Salida: el archivo SKILL.md (§7) por 📋 Copiar y ⬇ Descargar (Blob del aparato; la pantalla dice dónde va: `.claude/skills/<name>/SKILL.md` en Claude Code, o Ajustes → Capacidades → Habilidades en claude.ai), y «📋 Copiar como instrucción de sistema» (los mismos bloques en forma `seguida`).

**Instrucción de sistema** (`sistema`, `forma: 'seguida'`, `rotuloMayus`) — para un Gem, un GPT, un Proyecto de Claude o el «system prompt» de cualquier máquina.
- `identidad` · Identidad · ● — Quién es, de dónde, en qué idioma. — Ej.: «Eres el corrector de la revista de la familia Polanco Castellanos. Hablas español de Honduras y no cambias el sentido de nada.» — Frases: «Eres {{rol}} de {{lugar}}.» · «Hablas español de Honduras, tuteando.» · «Tu prioridad es {{prioridad}}.» · «No eres un asistente general: solo haces {{que}}.»
- `mision` · Misión · ● — Para qué existe; lo que hace cuando nadie le dice nada más. — Ej.: «Recibir textos y devolverlos corregidos con la lista de cambios y su norma.» — Frases: «Recibir {{entrada}} y devolver {{salida}}.» · «Ayudar a {{quien}} a {{que}}.» · «Si no te dan nada, pregunta por {{dato}}.» · «Cuando termines, ofrece {{siguiente}}.»
- `siempre` · Siempre · ● — Las reglas fijas. — Ej.: «Siempre responde en español de Honduras.» / «Siempre di qué no pudiste cumplir.» — Frases: «Siempre responde en español de Honduras.» · «Siempre cita la fuente con su dirección.» · «Siempre di qué no pudiste cumplir.» · «Siempre pregunta antes de suponer un dato.»
- `nunca` · Nunca · ● — Lo prohibido, aparte de lo obligatorio. — Ej.: «Nunca inventes datos.» / «Nunca cambies nombres propios ni cifras.» — Frases: «Nunca inventes datos.» · «Nunca cambies nombres propios ni cifras.» · «Nunca uses «en resumen» ni «es importante destacar».» · «Nunca respondas fuera de tu misión: di que no es lo tuyo.»
- `formato` · Formato de siempre · ○ (sobrescribe rótulo, ejemplo y frases) — Cómo entrega cada vez. — Ej.: «Primero el texto corregido; debajo «Cambios:» con uno por renglón y su norma.» — Frases: «Primero el resultado; debajo, la lista de cambios.» · «En Markdown, con un encabezado por sección.» · «Máximo {{n}} palabras salvo que pidan más.» · «Solo el texto pedido: nada de comentarios sobre lo que hiciste.»
- `ejemplos` · Ejemplos de conversación · ○ (sobrescribe rótulo, para qué, ejemplo y frases) — Cómo responde ante lo típico y ante lo que se sale del tema. — Ej.: «Usuario: «corrige esto: …» → Tú: el texto corregido + «Cambios: …».» / «Usuario: «hazme un poema» → Tú: «Eso no es lo mío; pídeselo a otro chat.»» — Frases: «Usuario: {{pide}} → Tú: {{respondes}}» · «Si el usuario pide {{x}}, responde {{y}}.» · «Si el usuario se sale del tema, di: {{frase}}.» · «Empieza siempre con {{saludo_o_nada}}.»
- Salida: texto seguido SIEMPRE, aunque la máquina sea Claude (los recuadros de instrucciones son planos), cada bloque un párrafo que empieza por su rótulo en mayúsculas («SIEMPRE: …»). Un solo botón Copiar: toda la pieza ES el sistema. Duplicar en SKILL.md usa `CSG_EQUIVALE` (identidad → rol → libre; mision → tarea → libre; siempre/nunca → reglas → libre; y el compositor lo enseña marcado); `formato` y `ejemplos` van a su sitio.

**Receta corta** (`receta`, `forma: 'seguida'`, `cabecera: 'Regla para esta conversación:'`) — cinco renglones que valen toda la charla.
- `disparador` · Cuándo · ● (sobrescribe rótulo, para qué, ejemplo y frases) — En qué momentos de la conversación se aplica. — Ej.: «Cada vez que te pegue un texto entre marcas ===.» — Frases: «Cada vez que te pegue {{que}}.» · «Cuando te pida {{palabras}}.» · «Durante toda esta conversación.» · «Solo cuando lo pida con la palabra {{clave}}.»
- `pasos` · Qué haces · ● (sobrescribe rótulo y ejemplo) — Ej.: «1. Corriges ortografía.» / «2. Señalas estilo con su norma.» / «3. Devuelves el texto y la lista.» — Frases: las del vocabulario.
- `comprobacion` · Qué revisas · ● (sobrescribe rótulo y ejemplo) — Ej.: «Que no cambiaste ningún nombre ni cifra.» — Frases: las del vocabulario.
- Salida: «Regla para esta conversación:», línea en blanco, y tres párrafos «Cuándo: …», «Qué haces: …», «Qué revisas: …». Cambiar el molde a SKILL.md conserva los tres (mismos ids) y propone `name` desde el título.

### 3.3 🕸 Grafo — varios que se pasan el trabajo

Abre con **Cadena**. Moldes: Cadena · Coordinador y especialistas. Cada grafo sale de tres formas: Mermaid para verlo, plan para leerlo y un «prompt para un solo chat» que hace que un chat interprete los nodos por turnos. El Careo NO es un grafo (dos voces a rondas con juez es un bucle): vive en Bucle. «Orquestador» se llama «Coordinador» para no chocar con la exportación que sale de todos los grafos. Los nodos se escriben en PROSA con dos puntos —«Nombre: recibe X, entrega Y»—, nunca con tubos `|`: esa tecla no está en el teclado de una tableta.

**Cadena** (`cadena`, recomendado, `orquestar: 'cadena'`).
- `meta` · Meta · ● — Qué existe al final de todo, en una frase. — Ej.: «Un video-ensayo de doce minutos con guion en bloques, fuentes verificadas y rótulos.» — Frases: «Al final tiene que existir {{resultado}}.» · «Se da por terminado cuando {{condicion}}.» · «El resultado va a {{destino}}.» · «Si un nodo falla, el resultado es {{que_pasa}}.»
- `nodos` · Nodos, uno por renglón · ● — Nombre, qué recibe y qué entrega; el nombre va delante de los dos puntos y es el que usan las aristas (se proponen como chips al escribirlas). — Ej.: «Investigador: recibe el tema, entrega diez fuentes con dirección.» / «Guionista: recibe las fuentes, entrega el guion en bloques.» / «Verificador: recibe el guion, entrega la lista de citas que no cuadran.» / «Editor: recibe el guion aprobado, entrega la versión final.» — Frases: «{{nombre}}: recibe {{entrada}}, entrega {{salida}}.» · «Investigador: recibe el tema, entrega fuentes con dirección.» · «Redactor: recibe el material, entrega el borrador.» · «Verificador: recibe el borrador, entrega lo que no cuadra.» · «Editor: recibe todo, entrega la versión final.»
- `aristas` · Aristas y condiciones · ● — Quién pasa a quién y con qué condición, con la flecha → (o `->`); `FIN` es un nodo que existe siempre. Una arista a un nodo que no existe PARA el uso nombrándola. — Ej.: «Investigador → Guionista.» / «Guionista → Verificador.» / «Verificador → Guionista si hay citas malas (máximo 2 vueltas); si no → Editor.» / «Editor → FIN.» — Frases: «{{a}} → {{b}}.» · «{{a}} → {{b}} si {{condicion}}; si no → {{c}}.» · «{{a}} → {{b}} como máximo {{n}} veces.» · «{{a}} → FIN si {{condicion}}.»
- `estado` · Lo que viaja entre nodos · ○ — Qué se conserva de un nodo al siguiente. — Ej.: «Viaja: el tema, la lista de fuentes y el guion actual. No viaja: el razonamiento interno de cada uno.» — Frases: «Viaja: {{lo_que_viaja}}.» · «No viaja: el razonamiento interno de cada nodo.» · «Cada nodo añade su parte al mismo documento; no lo reescribe.» · «Cada nodo firma lo suyo con su nombre.»
- `fin` · Fin y entrega · ● — Cómo se sabe que terminó y en qué forma se entrega; con una arista de vuelta y sin tope aquí ni en la arista, el repaso PARA el uso. — Ej.: «Termina cuando el Verificador no encuentra citas malas, o a la segunda vuelta. El Editor entrega el guion en bloques [CÁMARA 0:30] para El Rodaje.» — Frases: «Termina cuando {{condicion}}.» · «Como mucho {{n}} vueltas; después se entrega lo que haya.» · «Entrega en la forma: {{formato}}.» · «Entrega también una lista de lo que cada nodo decidió.»

**Coordinador y especialistas** (`coordinador`, `orquestar: 'coordinador'`).
- `coordinador` · Coordinador · ● — El que reparte y junta; no hace el trabajo. — Ej.: «Coordinador: recibe el encargo, lo parte en tareas, se las da a los especialistas y junta lo que devuelven.» — Frases: «Recibe {{encargo}} y lo parte en tareas.» · «No hace ninguna tarea: solo reparte y junta.» · «Si un especialista devuelve algo incompleto, se lo devuelve con lo que falta.» · «Al final entrega {{resultado}} con lo que cada uno hizo.»
- `nodos` · Especialistas, uno por renglón · ● (sobrescribe rótulo, para qué, ejemplo, frases y plantilla «{{nombre}}: {{tema}}, con fuente.») — Cada uno con su nombre y su tema. — Ej.: «Historiador: fechas y contexto, con fuente.» / «Economista: cifras con fuente y año.» / «Editor: la forma final.» — Frases: «{{nombre}}: {{tema}}, con fuente.» · «Historiador: fechas y contexto.» · «Economista: cifras con fuente y año.» · «Verificador: lo que no cuadra entre los demás.»
- `reparto` · Cómo se reparte · ● — Ej.: «Por tema: lo que tenga cifras al Economista, lo que tenga fechas al Historiador; lo que no encaje, el Coordinador pregunta antes de repartir.» — Frases: «Por tema: {{criterio}}.» · «Cada tarea a un solo especialista.» · «Si una tarea no encaja en ninguno, el coordinador pregunta.» · «Lo urgente primero.»
- `juntar` · Cómo se junta · ● — Ej.: «El Coordinador pega las partes en el orden de la meta, quita lo repetido y marca lo que se contradice.» — Frases: «Juntar en el orden de {{orden}}.» · «Quitar lo repetido y marcar lo que se contradice.» · «Si dos especialistas se contradicen, gana el que trae fuente.» · «Entregar con un apartado por especialista.»
- `fin` · Fin y entrega · ● (sobrescribe ejemplo y frases) — Ej.: «Termina cuando todos entregaron y el Coordinador no encuentra contradicciones. Entrega un informe con un apartado por especialista y una bibliografía única.» — Frases: «Termina cuando {{condicion}}.» · «Entrega en la forma: {{formato}}.» · «Con una bibliografía única al final.» · «Si alguien no entrega, se dice qué falta y se entrega igual.»

### 3.4 🔁 Bucle — un paso que se repite hasta que salga

Abre con **Repite hasta**. Moldes: Repite hasta · Borrador y crítica · Por lotes · Careo. Sale como plan y como «auto-bucle» (un prompt que le dice al chat que haga, revise, repita y pare). **Sin tope no se puede USAR** (se guarda como borrador con el tope en rojo).

**Repite hasta** (`hasta`, recomendado).
- `paso` · Paso que se repite · ● — Lo que hace en cada vuelta, en una frase; escribirlo para UNA vuelta es lo que hace el bucle ejecutable. — Ej.: «Escribe el primer párrafo del ensayo.» — Frases: «Escribe {{que}}.» · «Mejora el resultado anterior en {{aspecto}}.» · «Busca una fuente más sobre {{tema}}.» · «Resuelve el siguiente elemento de la lista.»
- `parada` · Criterio de parada · ● — Algo comprobable, no «cuando quede bien». — Ej.: «Para cuando el párrafo tenga menos de 80 palabras, empiece con un dato y no lleve ningún adverbio en -mente.» — Frases: «Para cuando {{condicion_comprobable}}.» · «Para cuando ya no encuentres nada que cambiar.» · «Para cuando tengas {{n}} elementos.» · «Para cuando dos vueltas seguidas no cambien nada.»
- `tope` · Tope · ● — Máximo de vueltas y qué hace al llegar. — Ej.: «Máximo 5 vueltas. Si llegas al tope, entrega lo mejor que tengas y di por qué no paró.» — Frases: «Máximo {{n}} vueltas.» · «Máximo 5 vueltas.» · «Si llegas al tope, entrega lo mejor que tengas y di por qué no paró.» · «Cuenta las vueltas en voz alta: «Vuelta 3 de 5».»
- `memoria` · Lo que se guarda entre vueltas · ○ — Sin esto cada vuelta repite los errores ya corregidos. — Ej.: «Se guarda: la última versión y la lista de lo que ya se corrigió. Se descarta: las versiones anteriores.» — Frases: «Guarda la última versión y la lista de lo ya corregido.» · «Guarda solo lo que cumplió; descarta lo demás.» · «Numera cada vuelta y di qué cambió.» · «No repitas un cambio que ya se hizo.»
- `verificacion` · Verificación · ○ — Cómo se comprueba cada vuelta; sin esto el criterio es una opinión. — Ej.: «Después de cada vuelta, comprueba las tres condiciones una por una y di cuál falla y en qué frase.» — Frases: «Después de cada vuelta, comprueba las reglas una por una y di cuáles fallan.» · «Cuenta: ¿el número de fallos bajó?» · «Compara con el ejemplo bueno: ¿se parece más o menos que antes?» · «Verifica con un dato que no usaste para escribir.»
- `salida` · Qué sale al final · ● — Ej.: «La versión final y, debajo, en un renglón por vuelta, qué cambió.» — Frases: «Solo la versión final.» · «La versión final y, debajo, qué cambió en cada vuelta.» · «Todas las vueltas, numeradas.» · «La final y la primera, para comparar.»

**Borrador y crítica** (`critica`).
- `borrador` · Borrador · ● — Ej.: «Escribe un resumen de 150 palabras de lo que va abajo.» — Frases: «Escribe {{que}} de {{n}} palabras.» · «Haz un primer borrador sin pulir.» · «Usa solo lo que va abajo, entre las marcas ===.» · «Empieza por {{que}}.»
- `critico` · Crítico · ● — OTRO rol, con nombre, sin elogios y sin reescribir. — Ej.: «Como editor exigente, señala tres fallos concretos con su renglón: uno de datos, uno de forma, uno de claridad. Nada de elogios. Si no hay fallos graves, di solo «APROBADO».» — Frases: «Como {{rol_critico}}, señala {{n}} fallos concretos con su renglón.» · «Nada de elogios: solo lo que falla.» · «Revisa contra esta lista: {{lista}}.» · «Si no hay fallos graves, di «APROBADO» y nada más.»
- `revision` · Revisión · ● — Ej.: «Corrige solo lo que señaló el crítico; no toques lo demás. Cada corrección con su porqué en un renglón.» — Frases: «Corrige solo lo señalado; no toques lo demás.» · «Cada corrección con su porqué en un renglón.» · «Si no estás de acuerdo con el crítico, dilo y no cambies.» · «Devuelve la pieza entera, no solo los cambios.»
- `parada` · Criterio de parada · ● (sobrescribe ejemplo y frases) — Ej.: «Para cuando el crítico diga APROBADO.» — Frases: «Para cuando el crítico diga APROBADO.» · «Para si dos vueltas seguidas no cambian nada.» · «Para cuando el crítico encuentre menos de {{n}} problemas.» · «Si el crítico repite la misma crítica dos veces, para y dilo.»
- `tope` · Tope · ● (sobrescribe ejemplo) — Ej.: «Máximo 4 vueltas. Al tope, entrega la última y la lista de lo que quedó.»
- `salida` · Qué sale al final · ● (sobrescribe ejemplo y frases) — Ej.: «La versión aprobada y, debajo, las críticas de cada vuelta.» — Frases: «Solo la versión aprobada.» · «La aprobada y, debajo, las críticas de cada vuelta.» · «La primera y la última, para comparar.» · «La aprobada y lo que el crítico nunca dejó de señalar.»

**Por lotes** (`lotes`).
- `lista` · Lista · ● — Los elementos, uno por renglón; si es larga va en 📎 Material y aquí se dice «lo que va abajo». El repaso cuenta los renglones («12 elementos») y avisa si la lista y el Material están vacíos. — Ej.: «Fracciones» / «Decimales» / «Porcentajes» / «Proporciones» — Frases: «Uno por renglón: {{lista}}» · «Los elementos van abajo, entre las marcas ===.» · «Trata cada renglón como un elemento, sin juntar dos.» · «Si un renglón está vacío, sáltalo y dilo.»
- `paso` · Paso por elemento · ● (sobrescribe rótulo, para qué, ejemplo y frases) — Qué se hace con cada uno, con el mismo formato para todos. — Ej.: «Para cada tema: tres preguntas de selección con cuatro opciones y la correcta marcada con ✅.» — Frases: «Para cada uno: {{que}}.» · «Mismo formato para todos, sin variar.» · «No mezcles un elemento con otro.» · «Si uno no se puede, pon «NO SE PUDO» y sigue con el siguiente.»
- `memoria` · Acumulado · ○ (sobrescribe rótulo, para qué, ejemplo y frases) — Qué se lleva de un elemento al siguiente. — Ej.: «Lleva la cuenta: no repitas una pregunta ya hecha para otro tema.» — Frases: «No repitas nada ya hecho para otro elemento.» · «Numera seguido de principio a fin.» · «Cada elemento empieza de cero.» · «Lleva una lista de lo que no se pudo.»
- `tope` · Tope · ● (sobrescribe para qué e inicial) — Aquí el tope es la propia lista. Viene RELLENO: «Un elemento por vuelta; termina al acabar la lista y nunca pasa de {{n}} elementos.» — Frases: las del vocabulario.
- `salida` · Salida · ● (sobrescribe rótulo, ejemplo y frases) — Ej.: «Todo junto, con un encabezado ## por tema y las preguntas numeradas seguidas.» — Frases: «Todo junto, un encabezado por elemento.» · «Una tabla con un renglón por elemento.» · «Solo los que salieron; los fallidos en una lista aparte.» · «Entrega por partes de {{n}} elementos.»

**Careo** (`careo`, `vozPrestada`) — dos posturas a rondas con un juez: la forma de las lecturas «careo» de las misiones; lo que devuelve va a La Voz Prestada como género entrevista.
- `postura_a` · Postura A · ● — Ej.: «Defiende que la jornada extendida reduce la deserción, con datos de 2015-2024.» — Frases: «Defiende que {{tesis}} con datos.» · «Habla como {{autor}} defendería {{tesis}}.» · «No concede nada sin una fuente en contra.» · «Máximo {{n}} palabras por turno.»
- `postura_b` · Postura B · ● — Ej.: «Defiende que la deserción bajó por otras causas y que la jornada extendida se lleva el mérito sin evidencia.» — Frases: «Defiende lo contrario: {{antitesis}}.» · «Busca el punto más débil de A.» · «Habla como {{autor}}.» · «Máximo {{n}} palabras por turno.»
- `juez` · Juez · ● — Sin juez, el careo termina en empate por cansancio. — Ej.: «Puntúa cada ronda por evidencia y no por retórica; nombra cada falacia que veas.» — Frases: «Puntúa por evidencia, no por retórica.» · «Nombra cada falacia que veas.» · «No decide hasta la última ronda.» · «Resume lo mejor de cada lado antes de fallar.»
- `tope` · Rondas · ● (sobrescribe rótulo, para qué, ejemplo y frases) — Cuántas, de qué son y cuánto dura cada turno. — Ej.: «Tres rondas: apertura, réplica y cierre. Cada turno, 150 palabras.» — Frases: «{{n}} rondas: apertura, réplica y cierre.» · «Cada turno de {{n}} palabras.» · «En la réplica solo se responde a lo dicho; nada nuevo.» · «El juez interviene solo entre rondas.»
- `etiqueta` · Veredicto y etiqueta · ● (sobrescribe rótulo, para qué, inicial y frases) — Qué entrega el juez y la etiqueta de la casa. Inicial: «Al final, un veredicto de 200 palabras con la postura que gana, por qué, y las tres mejores pruebas de cada lado. Escribe el careo entero encabezado con estas líneas, una por renglón: «Título:» y un título; «Voz: A y B»; «Máquina: {{maquina}}»; «Género: entrevista»; «Consigna: {{titulo}}». Cada turno empieza en su propio renglón por A:, B: o JUEZ:. Termina con FIN solo en su renglón.» — Frases: «Veredicto de {{n}} palabras con quién gana y por qué.» · «Las tres mejores pruebas de cada lado.» · «Lo que ninguno probó.» · «Encabeza con Título:, Voz:, Máquina: y Género: entrevista, una por renglón.»

## 4. Las máquinas

`CSG_MAQUINAS` es una lista en el JS, nunca en la base. Cada entrada: `{ id, nombre, forma, abrir, prefill, donde, nota }`. Son las cuatro de `VOZ_MAQUINAS` más NotebookLM y «Otra»; Copilot y Claude Code quedan fuera a propósito (nadie de la casa los nombró; el SKILL.md sale por Claude); añadirlos es una línea con `abrir` vacío.

| id | Nombre | Forma y por qué | Abrir | Texto en la dirección |
|---|---|---|---|---|
| `claude` | Claude | `xml`: cada bloque en su etiqueta; es la forma que mejor sigue y separa instrucción de material. Con bloques `sistema` salen «📋 Copiar sistema» (lo que va en las instrucciones de un Proyecto) y «📋 Copiar encargo». Admite SKILL.md. | `https://claude.ai/new` | `?q=` |
| `chatgpt` | ChatGPT | `md`: «## » por bloque, reglas como lista. El sistema va a «instrucciones personalizadas» o a un GPT. | `https://chatgpt.com/` | `?q=` |
| `gemini` | Gemini | `md`. El sistema va a un Gem. | `https://gemini.google.com/app` | no: se abre con el texto copiado |
| `perplexity` | Perplexity | `md` corto; en Investigación, Fuentes y Citas van primero; el repaso avisa si Citas no pide la dirección. Nota: «pídele las direcciones; las trae». | `https://www.perplexity.ai/search` | `?q=` |
| `notebooklm` | NotebookLM | `seguida`: párrafos «Rótulo: texto», sin almohadillas, etiquetas ni asteriscos (su recuadro enseña el texto crudo y el cuaderno ya es el contexto). El repaso avisa si hay `<etiquetas>`. | `https://notebooklm.google.com/`, o la dirección del cuaderno ligado (§8) | no |
| `otra` | Otra | `md`. Solo Copiar y Compartir. | — | — |

Cómo se abre, y no se negocia: **se copia primero, siempre** (regla 12 de Redes); la dirección base es un LITERAL; el texto va con `encodeURIComponent` solo si cabe en **1.500 caracteres codificados** (`CSG_PREFILL_MAX`: una dirección larga se corta sin avisar y lo que se pierde es el Formato, que va al final); por encima se abre pelada y el botón dice «↗ Abrir Claude (copiado: pega ahí)». `window.open(url, '_blank', 'noopener,noreferrer')`; si el navegador bloquea la ventana, un aviso que nombra `donde`. La última máquina se recuerda en `faro_consigna_maquina_v1`.

## 5. El compositor

Todo a 390 px, con el pulgar, contando toques. El compositor es una VISTA (`#view-consigna-editor`), no una hoja. Nada de lo escrito llega a un atributo ni a `innerHTML`: `csgEl(tag, cls, texto)` con `textContent`, como `rcuEl`.

**Paso 1 — «¿Qué le vas a pedir?»** (＋ Nueva). Hoja vertical (`#csg-ver-overlay` en modo `clase`): primer renglón, 44 px y teñido, «📋 Pegar lo que ya tengo» (→ 1-bis). Debajo, cuatro baldosas en `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;` con `min-height: 88px` y `min-width: 0` (nunca un ancho fijo: 2×160 más el canal y las orillas no caben en 320 px; la sonda 17 lo mide): 💬 Prompt «un encargo de una vez» · 🧰 Habilidad «lo que sabrá hacer siempre» · 🕸 Grafo «varios que se pasan el trabajo» · 🔁 Bucle «un paso que se repite hasta que salga». Un toque abre DIRECTO el compositor con el molde recomendado.

**Paso 1-bis — Pegar y repartir** (`#csg-pegar-overlay`): un recuadro y «Leer». `csgLeer(texto)` devuelve `{ clase, molde, titulo, bloques, material, variables, avisos: [{renglon, texto, sugerencia}] }`, en este orden y sin descartar nada:

0. Normaliza: `\r\n` → `\n`, tabulaciones y NBSP → espacio.
1. **Frontmatter** (`---` en el primer renglón, un `name:` y el cierre `---` dentro de las 30 primeras líneas) → Habilidad · SKILL.md: `name` → `nombre`, `description` → `disparador`; el cuerpo por encabezados con `CSG_SINONIMOS` («Cuándo usarla»/«When to use» se pega al disparador tras una línea en blanco); el `# Título` → título; encabezados desconocidos → bloques libres.
2. **Material**: lo que hay entre `=== Material ===` y `=== Fin del material ===`, o entre `<material>` y `</material>`, o desde un renglón que es exactamente `===` hasta el final → `material`, y se quita del texto antes de seguir.
3. **Etiquetas XML** `<tag>…</tag>` con `tag` en `^[a-z_]{2,30}$`, sin anidar: id = `CSG_SINONIMOS[tag]` si existe, el propio `tag` si es un id del vocabulario, o bloque libre con ese rótulo; `<ejemplos>` con `<ejemplo><entrada/><salida/></ejemplo>` → pares «a → b». Lo de fuera de las etiquetas sigue al paso 4.
4. **Encabezados y rótulos**, renglón a renglón. Es rótulo: (a) `^#{1,6}\s+(.+)$`; (b) `^\*\*([^*]{2,40})\*\*:?\s*$` (negrita sola); (c) `^([\p{L} ]{2,30}):\s*(.*)$` con 1–3 palabras antes de los dos puntos Y su clave en `CSG_SINONIMOS` (lo que siga es el primer renglón del bloque); (d) `^[\p{Lu} ]{3,30}$` (MAYÚSCULAS solas) con clave en `CSG_SINONIMOS`. `csgClaveEtiqueta(s)` devuelve vacío en cuanto ve un dígito, `[]{}()#` o `→`; si no, NFD sin diacríticos, minúsculas, espacios colapsados. Con (a) o (b) y clave desconocida → bloque LIBRE con ese rótulo (la almohadilla y la negrita son inequívocas). Con (c) o (d) y clave desconocida → NO es rótulo: el renglón se queda como prosa en el bloque en curso y se NOMBRA («renglón 12: «Notas:» no es un bloque; se quedó en Tarea. ¿Querías Contexto?», sugerencia = la clave conocida a distancia de Levenshtein ≤ 2, si la hay). El texto anterior al primer rótulo → `tarea` (o `texto` si no se reconoce ningún bloque). Un renglón de prosa que empiece por una palabra de bloque sin dos puntos nunca asciende: (c) exige los dos puntos y ≤ 3 palabras.
5. **Aristas** (`csgEsArista`), SOLO si no se reconoció un bloque `ejemplos` y SOLO sobre los renglones que siguen en `tarea`/`texto` o en un bloque `aristas`: el renglón no contiene `{{`; casa con `^([^:→>-]{1,40}?)\s*(→|->)\s*(.+)$`; el lado izquierdo son 1–3 palabras de letras, dígitos y espacios, sin punto; el derecho empieza por 1–3 palabras así o por `FIN`, y puede seguir con una condición. Con **dos o más** renglones así → van a `aristas`, sus nombres a `nodos` si no estaban («Nombre» solo), y se PROPONE Grafo · Cadena. Un «a → b» dentro de un bloque `ejemplos`, o un «{{entrada}} → {{salida}}», es un par y nunca una arista.
6. **Bucle y lotes** (`CSG_SINONIMOS.bucle`), SOLO sobre los renglones que siguen en `tarea`/`texto` y SOLO si en el paso 4 no se reconoció NINGÚN bloque de prompt (rol, contexto, tarea, reglas, formato, ejemplos, comprobacion, tono, objetivo, estilo, audiencia, pregunta, fuentes, citas, voz, genero, tema): patrones → bloque: `parada`: `/^(para|parar|detente|termina)\b.*\b(cuando|que)\b/i`, `/\bhasta (que|conseguir|tener|lograr)\b/i`, `/^(until|stop when)\b/i`; `tope`: `/\b(m[aá]ximo|como mucho|no m[aá]s de|hasta)\s+\d+\s*(vueltas?|veces|intentos?|iteraci[oó]n(es)?|rondas?)\b/i`, `/\bmax(imum)?\s+\d+\s+(iterations?|attempts?|rounds?|loops?)\b/i`; `paso`: `/^(repite|rep[ií]telo|vuelve a|en cada (vuelta|iteraci[oó]n|ronda)|cada vuelta)\b/i`, `/^(repeat|each iteration|loop)\b/i`; `memoria`: `/^(guarda|lleva|conserva|recuerda)\b/i`, `/\bentre (vuelta y vuelta|vueltas)\b/i`; `lotes`: `/^(para|por) cada (uno|rengl[oó]n|elemento|tema|cap[ií]tulo|autor|caso|l[ií]nea|fila)\b/i`, `/^for each\b/i`, `/\buno por rengl[oó]n\b/i`. Con patrones de DOS clases distintas entre parada/tope/paso → Bucle · Repite hasta (cada renglón a su bloque, el resto a `paso`). Con un renglón `lotes` y una tanda de ≥ 3 renglones cortos seguidos (≤ 60 caracteres, sin punto final) → Bucle · Por lotes (el renglón → `paso`, la tanda → `lista`). Si el paso 4 SÍ reconoció bloques de prompt, no hay propuesta de bucle: la clase sigue Prompt, «Repite esto para cada tema» se queda en su bloque, y el repaso AVISA «parece que se repite (renglón 9): ¿un Bucle · Por lotes? · Duplicar en ese molde».
7. Variables detectadas; título = el `# h1` (si no es palabra de bloque) o vacío (el compositor lo propone desde Tarea).
8. Propuesta con chip «Parece un {clase} · {molde} · {n} de {m} bloques · cambiar», nunca impuesta. Molde en Prompt: `objetivo`+`audiencia` → CO-STAR; `ejemplos` con ≥ 2 pares o `caso` → Con ejemplos; `pregunta`/`fuentes`/`citas` → Investigación; `voz`/`genero`/`etiqueta` → Voz prestada; `pasos`+`responde` → Razonado; solo `tarea` (y `formato`) → Rápido; nada → Libre; lo demás → Encargo completo. Habilidad: frontmatter → SKILL.md; `identidad`/`mision`/`siempre`/`nunca` → Instrucción; `disparador`+`pasos` sin `nombre` → Receta. Grafo: `coordinador`/`reparto`/`juntar` → Coordinador, si no Cadena. Bucle: `borrador`/`critico` → Borrador y crítica; `lista` → Por lotes; `postura_a` → Careo; si no, Repite hasta.
9. Nada se descarta: la sonda cuenta las palabras de entrada y las de salida (bloques + material + título) y exige que coincidan.

`CSG_SINONIMOS` (clave → id, español e inglés): rol, role, persona, eres → `rol`; contexto, context, background, situacion → `contexto`; tarea, task, instruccion, instrucciones, instruction, goal, pedido, encargo → `tarea`; objetivo, objective → `objetivo`; reglas, rules, constraints, restricciones, guidelines, no hagas → `reglas`; formato, formato de salida, format, output, output format, respuesta, response → `formato`; ejemplos, examples, few-shot → `ejemplos`; comprobacion, comprobaciones, checks, verification, validation, como se comprueba, que revisas → `comprobacion`; tono, tone → `tono`; estilo, style → `estilo`; audiencia, audience, publico → `audiencia`; ahora tu, ahora, caso, caso nuevo, now → `caso`; pasos, steps, como pensarlo, que haces → `pasos`; luego responde, responde, answer → `responde`; pregunta, question, research question → `pregunta`; fuentes, fuentes permitidas, sources → `fuentes`; citas, reglas de cita, citations → `citas`; limites, limits, scope → `limites`; voz, voice → `voz`; genero, genre, genero y largo → `genero`; tema, topic, tema o encargo → `tema`; etiqueta, etiqueta de la casa → `etiqueta`; nombre, name → `nombre`; description, descripcion, cuando se dispara, cuando, when, trigger, cuando usarla, when to use → `disparador`; recursos, resources, herramientas, tools → `recursos`; identidad, identity → `identidad`; mision, mission → `mision`; siempre, always → `siempre`; nunca, never → `nunca`; meta, goal final → `meta`; nodos, nodes, agentes, agents, especialistas → `nodos`; aristas, edges, flujo, flow, pasos y condiciones → `aristas`; estado, state, lo que viaja → `estado`; fin, fin y entrega, end, salida del grafo → `fin`; coordinador, orquestador, orchestrator → `coordinador`; reparto, como se reparte → `reparto`; juntar, como se junta → `juntar`; paso, paso que se repite, step, vuelta → `paso`; parada, criterio de parada, stop, para cuando → `parada`; tope, rondas, max, limit → `tope`; memoria, memory, acumulado, entre vueltas → `memoria`; verificacion, verify → `verificacion`; salida, que sale al final, deliverable → `salida`; borrador, draft → `borrador`; critico, critic → `critico`; revision, revise → `revision`; lista, list, elementos → `lista`; postura a → `postura_a`; postura b → `postura_b`; juez, judge → `juez`; texto, text, prompt → `texto`.

**Paso 2 — el compositor.** Cabecera compacta: ‹ · el título (campo con marca de agua «Título»; se propone con las primeras siete palabras de Tarea/Pregunta/Nombre/Meta/Paso/Borrador mientras la persona no lo toque, `_csgAuto`) · [👁] vista previa. Primera fila, deslizable: chip «Molde: Rápido ▾» (hoja vertical con los moldes de la clase, 44 px cada uno, nombre + «cuándo», el recomendado primero; cambiar de molde conserva los bloques con el mismo id y dice cuáles quedan como bloques libres), y dentro de esa hoja el renglón «❓ ¿Cuál elijo?» con tres preguntas de sí/no (¿tienes ejemplos de cómo quieres la salida? → Con ejemplos; ¿tiene que calcular o decidir entre opciones? → Razonado; ¿se va a quedar puesta en un Proyecto o Gem? → Instrucción de sistema; nada → Encargo completo); después los chips de máquina con la última usada marcada; después los chips de estante del autor y «＋ estante» (cada estante ≤ 40 caracteres, máximo 12 por pieza: el JSON tiene tope y el botón lo dice al llegar).

Debajo, los BLOQUES apilados, cada uno una tarjeta: rótulo con su punto (● / ○), el «para qué» en una línea gris (se pliegan todos con el interruptor de aparato «Sin explicaciones»), un recuadro que crece (`csgCrecer`, como `rcuCrecer`) con letra de 16 px (a menos de 16 el iPad hace zoom al enfocar), el EJEMPLO como placeholder (literal del JS) y, mientras el recuadro está vacío, un enlace «📄 usar el ejemplo» que lo copia para editarlo (con texto escrito no sale: el ejemplo se ve mientras hace falta y no pisa nada). Los bloques con `inicial` nacen con ese texto puesto (la etiqueta de Voz prestada y Careo, el tope de Por lotes). DEBAJO del recuadro, la fila de FRASES HECHAS: chips `nowrap` deslizables de 40 px, y al final «{ } Variable», que mete `{{ }}` con el cursor dentro. Los obligatorios ABIERTOS; los opcionales PLEGADOS a un renglón «○ Rol · ＋». Al enfocar, `scrollIntoView({block:'center'})`; el foco va dentro del mismo toque, sin `await`.

Los chips: un toque mete la frase donde está el cursor, en su propio renglón, con `setRangeText` y un `input` disparado a mano; el chip se marca; otro toque quita EXACTAMENTE esa frase si sigue idéntica; editada, el chip se desmarca y no se toca nada. `pointerdown` cancelado en el chip. Los bloques `lista` llevan «＋ Otro» (mete la plantilla en un renglón nuevo).

Bajo el último bloque: «Variables: {{tema}} · {{n}}» (o «sin variables»); un contador «N de 60.000 caracteres» solo cuando los bloques pasan de 50.000; y «📎 Material», siempre el último y plegado: un recuadro con `maxlength` de 20.000 que dice «se guarda con la pieza hasta 20.000 caracteres» y, si lo pegado lo pasa, NO se recorta ni se guarda: se queda en el borrador del compositor y en la hoja de Usar, y el bloque dice «📎 material de 31.000 caracteres: no se guarda con la pieza; pégalo al usar» (nada se descarta en silencio, y la pieza es la consigna, no el informe).

Barra inferior FIJA (`position: fixed; bottom: calc(var(--nav-h) + env(safe-area-inset-bottom, 0px)); z-index: 60`, y el `.view-scroll` con relleno de abajo): [👁 Vista previa] neutro · [💾 Guardar] lleno · [▶ Usar] teñido; los tres con `flex: 1 1 0; min-width: 0; min-height: 44px`, así caben en 320 px (la sonda 18 lo mide). Aquí no hay FAB.

Cada tecla guarda el compositor a medio escribir en `faro_consigna_borrador_v1` (pieza entera, material incluido aunque pase de 20.000); al abrir con algo ahí: «tenías una consigna a medio escribir · Seguir · Descartar».

**Paso 3 — Vista previa** (cambia el cuerpo del compositor). Arriba, los chips de máquina: cambiar uno re-arma al instante. Debajo, el texto armado en `<pre class="csg-pre">` con `textContent` y `white-space: pre-wrap; overflow-wrap: anywhere; font-size: 16px; font-family: ui-monospace, Menlo, Consolas, monospace` (un `<pre>` sin `pre-wrap` se desliza a los lados con un renglón de 300 caracteres, y es el recuadro que queda seleccionable como respaldo del portapapeles: 16 px como todo lo que se enfoca), con las variables sin rellenar en ámbar y los obligatorios vacíos en rojo; en el grafo tres pestañas (Mermaid · Plan · Prompt para un chat), en el bucle dos (Plan · Auto-bucle). Debajo, el REPASO `csgRevisar(pieza, maquina) → { para: [{bloque, msg, arreglo?}], avisa: [...], palabras, tokens, cabe }`: ● rojo lo que PARA el usar, a la vista; ▲ ámbar lo que avisa, plegado tras su cuenta; y «≈ 320 palabras (≈ 450 tokens, a ojo) · cabe en la dirección de Claude» o «no cabe: se abre sin texto y va copiado». Cada aviso que se arregla con una frase trae el chip que la mete.

PARA: obligatorio vacío (nombrado, con un toque que lleva a él); variable sin nombre (`{{}}`); bucle sin tope; arista a un nodo que no existe; arista de vuelta sin tope ni en la arista ni en Fin; SKILL.md con `name` fuera de `^[a-z0-9]+(-[a-z0-9]+)*$` o de 64, o `description` vacía o mayor de 1024; Con ejemplos con menos de dos pares; bloques que no caben en la nube (JSON > 60.000: «recorta N caracteres»). AVISA: sin Formato; bloque hecho SOLO de frases hechas; teléfono, correo o nombre de `MIEMBROS` dentro de un bloque («esto viaja a la nube y a la máquina: ¿un {{hueco}}?», con el chip que lo convierte); Perplexity sin regla de citar con dirección; NotebookLM con etiquetas en el texto; mismo título normalizado que otra pieza (enlace a abrirla); más de 1.500 palabras; Por lotes con lista y Material vacíos; pasos sin numerar en una habilidad; variable repetida con otra mayúscula; «parece que se repite» (paso 6 del lector).

**Paso 4 — Usar** (`#csg-usar-overlay`; también desde ▶ de la ficha). Si hay variables: un renglón de 44 px por variable con el ÚLTIMO valor que se le puso a ESA pieza y, debajo, como chips, los tres últimos (`faro_consigna_vars_v1`, por identificador de pieza); debajo, el texto armado que se rellena en vivo (`<pre class="csg-pre">`); debajo, plegado, «📎 Material» con lo guardado (o lo que quedó en el borrador si no cabía), editable y no guardado. Pie fijo: [📋 Copiar] lleno · [📤 Compartir] (solo con `navigator.share`) · [↗ Abrir Claude] teñido, que copia primero SIEMPRE. Con bloques `sistema` en forma `xml`, salen «📋 Copiar sistema» y «📋 Copiar encargo» pequeños; en SKILL.md, «⬇ Descargar SKILL.md»; en Grafo, «⬇ grafo.mmd». Con una variable vacía, Copiar se para y la nombra; «Copiar con huecos» es un segundo botón explícito. El copiado va dentro del toque (`navigator.clipboard.writeText` sin `await` delante); si falla, el texto queda seleccionado en el `<pre>` con «mantén pulsado para copiar». Al copiar o abrir, `csgApuntarUso(pieza, maquina)`: `usos++`, `ultima = Date.now()`, una entrada `{uid, t, maquina, v, ok: null, nota: ''}`; nada se pregunta ahí. Si el molde lleva `vozPrestada`, debajo del pie sale «📖 Guardar lo que devolvió»: `switchView('view-voz'); vozAbrirPegar(null);` (dos funciones que ya existen; ni una línea en `voz-prestada.js`).

**Paso 5 — Guardar.** Siempre se puede: una pieza a medias es un borrador, no un error. Local al instante (`faro_consigna_v1`), nube con respiro de dos segundos (`csgSubirLuego`). Si `usos > 0` y el texto armado en `md` cambió, nace la versión n+1 y la n queda en `versiones`. Si el título normalizado ya existe en otra pieza viva: «Ya hay una «Resumen de informe» · abrirla · guardar igual».

La cuenta: un prompt Rápido bueno son 7 toques y una frase escrita (Acceso Rápido · ＋ · Prompt · escribir la Tarea · un chip de Formato · Usar · Copiar). Volver a usar una pieza son 2 (▶ · Copiar), o 3 con una variable que cambia.

## 6. La lógica de proceso

1. **ENTRAR.** Desde el Acceso Rápido. Si hay un compositor a medio escribir, se ofrece seguir. Si hay un uso de los últimos 7 días sin contestar, debajo de los chips y de los filtros puestos sale UN renglón de bitácora (§8).
2. **ELEGIR O PEGAR.** Una baldosa abre el molde recomendado; «📋 Pegar lo que ya tengo» reparte y PROPONE clase y molde. La herramienta sola: bloques, variables, material y clase; nombra lo que no entendió. Se pregunta: nada, salvo confirmar con un chip.
3. **RELLENAR GUIADO.** Obligatorio abierto, opcional plegado; para qué, ejemplo y chips; título propuesto; variables detectadas. Se hace solo: título, máquina (la última), slug de la habilidad, `{{maquina}}`, `{{titulo}}`, `{{hoy}}`.
4. **ARMAR Y REPASAR.** `csgArmar` en la forma de la máquina; `csgRevisar` en el aparato, sin red, separando lo que PARA de lo que AVISA (regla 12 de El Rodaje).
5. **GUARDAR.** Nunca se bloquea. Local primero, nube después, upsert por id del aparato, versión n+1 si ya se usó y cambió.
6. **USAR.** Variables con su último valor por pieza; copiar, compartir, abrir copiando primero. Apunta `usos`, `ultima` y un uso con `ok: null`.
7. **RENDIR CUENTA, DE UN TOQUE Y DESPUÉS.** La bitácora se PREGUNTA (robado de El Pliego biblioteca: el «¿Cómo salió?» inmediato preguntaba antes de que la máquina contestara, y una bitácora que hay que acordarse de escribir no la escribe nadie). En la siguiente apertura del anaquel, el renglón «Usaste «Resumen de informe» en Claude hace 2 h · ¿sirvió? ✅ 〰 ❌ ✕» pregunta por UN uso, el más reciente, solo de los últimos 7 días. Un toque guarda `ok` (`'si'|'regular'|'no'`) y abre, sin obligar, un campo de una línea «qué pasó» (`maxlength=300`). ✕ deja ese uso sin contestar para siempre y pasa al siguiente. Ignorado en tres aperturas seguidas (`faro_consigna_pregunta_v1`), se pliega a «3 usos sin contestar ▸». Nunca se inventa un resultado.
8. **CORREGIR CON VERSIÓN.** ✎ abre el mismo compositor. Cada uso lleva `v`. ⋯ → Versiones (v, fecha, «usada N veces», 👍/👎 de esa versión) y «Volver a esta», que crea una versión nueva copiando la vieja. Se guardan 10 con bloques; las demás se pliegan a `{vid, v, t}` (§9) y se dice.
9. **CAMBIAR DE FORMA SIN REESCRIBIR.** ⋯ → «Duplicar en otro molde» abre el compositor con una pieza nueva SIN guardar: los ids conocidos en su sitio, `CSG_EQUIVALE` para los demás, y lo que no encontró sitio como bloque libre marcado. La ficha de un prompt usado tres veces en treinta días enseña «⚠ 3 usos este mes ▸» y ese toque hace exactamente esto hacia Habilidad · Instrucción de sistema. Las tres graduaciones del diseño de partida quedan fuera: un solo mecanismo, a la vista.
10. **ARCHIVAR Y VOLVER.** Estantes, clase, máquina; «🟡 Borradores» y «⏳ Sin probar» a la vista; retirar con lápida, dos toques, sin `confirm()`. Orden por defecto «última usada». 📋 Exportar saca el inventario entero en texto.

## 7. Las salidas

Todas salen de `csgArmar(pieza, maquina, valores, opciones) → { principal, sistema, encargo, skill, mermaid, plan }`, función pura sin DOM; vista previa y botones usan la MISMA salida, y la sonda compara carácter por carácter.

**Algoritmo común.**
1. `molde = CSG_MOLDES[pieza.molde]`; si el JS ya no lo conoce, todos los bloques guardados en su orden con su rótulo guardado. Cada bloque se resuelve con `csgBloqueDef(molde, id)`: rótulo, `lista`, `sistema` (los bloques libres: rótulo guardado, `lista: false`).
2. Bloques armables = los del molde en su orden con su texto (`trim`, se saltan los vacíos), más los libres al final. Reordenes: `reordena` del molde (Investigación en Perplexity: fuentes, citas, pregunta, formato, limites; Con ejemplos: `caso` último); NotebookLM + Investigación con `fuentes` vacío → se inyecta «Usa solo las fuentes del cuaderno.».
3. Variables: `csgRellena(t)`: `{{maquina}}` → nombre de la máquina; `{{titulo}}` → título o «(sin título)»; `{{hoy}}` → `AAAA-MM-DD`; `{{x}}` → `valores.x` si no está vacío; lo demás se deja `{{x}}`.
4. Cuerpo de un bloque (`csgCuerpo(b, forma)`): texto normal → tal cual. `lista` → renglones no vacíos, cada uno con «- » delante salvo que ya empiece por «- », «• » o `\d+[.)] ` (los pasos numerados se respetan). `ejemplos` → cada renglón con « → » (o « -> ») es un par; el resto, renglón de lista.
5. La forma la decide `molde.forma` si existe (`skill`, `seguida`); si no, `CSG_MAQUINAS[maquina].forma`.
   - **`xml`**: cada bloque `<id>\n{cuerpo}\n</id>`, separados por una línea en blanco, en el orden del paso 2; los pares de `ejemplos` como `<ejemplo>\n<entrada>a</entrada>\n<salida>b</salida>\n</ejemplo>`; bloque libre: `<{id}>`. Material al final: `<material>\n…\n</material>`. `sistema` = solo los bloques con `sistema: true`, en el mismo orden y forma; `encargo` = los demás; `principal` = todos. NO hay ninguna línea «SISTEMA:» ni ningún «; » que junte reglas: cada bloque tiene una sola regla de escritura, la suya.
   - **`md`**: `## {Rótulo}\n{cuerpo}`, bloques separados por una línea en blanco; pares de `ejemplos` como `**Entrada:** a\n**Salida:** b`, pares separados por línea en blanco. Material: `=== Material ===\n…\n=== Fin del material ===`. Con `sinEncabezados` (Rápido, Libre): el primer bloque va pelado y los siguientes como `{Rótulo}: {cuerpo}`.
   - **`seguida`**: un párrafo por bloque, `{Rótulo}: {frase}`, separados por línea en blanco; `lista` y `ejemplos` → cada renglón sin viñeta («- », «• » fuera; los números se quedan), con «.» al final si no termina en `.!?:…`, unidos por un espacio (los pares se escriben «a → b.»); `rotuloMayus` pone el rótulo en mayúsculas; `cabecera` va delante con una línea en blanco. Material como en `md`.
   - **`skill`** (SKILL.md con cualquier máquina): ver ejemplo; `description` va SIEMPRE entre comillas dobles con `\` y `"` escapadas y los saltos de renglón como espacio; `name` pelado.
   - **Grafo**: `mermaid`, `plan` y `principal` (el prompt para un chat, en la forma de la máquina). **Bucle**: `plan` y `principal` (auto-bucle).

**Encargo completo en `xml` (Claude):**
```
<rol>
Eres un editor de una revista de divulgación en español, riguroso con las fuentes y alérgico a las frases hechas.
</rol>

<contexto>
Esto va en la revista de la casa, que leen cuatro personas de entre 12 y 50 años.
</contexto>

<tarea>
Reescribe los tres primeros párrafos para que el dato más fuerte salga en la primera frase.
</tarea>

<reglas>
- No inventes datos; si no lo sabes, dilo.
- Cita cada fuente con su dirección; sin dirección no vale.
</reglas>

<formato>
Primero el resultado; debajo, la lista de cambios.
</formato>

<comprobacion>
- Al final, di en una línea qué no pudiste cumplir y por qué.
</comprobacion>

<tono>
Directo y sin adornos.
</tono>

<material>
(el texto pegado)
</material>
```
«📋 Copiar sistema» copia `<rol>`, `<reglas>` y `<tono>` (con sus líneas en blanco); «📋 Copiar encargo», el resto; «📋 Copiar», todo.

**El mismo Encargo en `md` (ChatGPT, Gemini, Otra):**
```
## Rol
Eres un editor de una revista de divulgación en español, riguroso con las fuentes y alérgico a las frases hechas.

## Contexto
Esto va en la revista de la casa, que leen cuatro personas de entre 12 y 50 años.

## Tarea
Reescribe los tres primeros párrafos para que el dato más fuerte salga en la primera frase.

## Reglas
- No inventes datos; si no lo sabes, dilo.
- Cita cada fuente con su dirección; sin dirección no vale.

## Formato de salida
Primero el resultado; debajo, la lista de cambios.

## Cómo se comprueba
- Al final, di en una línea qué no pudiste cumplir y por qué.

## Tono
Directo y sin adornos.

=== Material ===
(el texto pegado)
=== Fin del material ===
```

**El mismo Encargo en `seguida` (NotebookLM):**
```
Rol: Eres un editor de una revista de divulgación en español, riguroso con las fuentes y alérgico a las frases hechas.

Contexto: Esto va en la revista de la casa, que leen cuatro personas de entre 12 y 50 años.

Tarea: Reescribe los tres primeros párrafos para que el dato más fuerte salga en la primera frase.

Reglas: No inventes datos; si no lo sabes, dilo. Cita cada fuente con su dirección; sin dirección no vale.

Formato de salida: Primero el resultado; debajo, la lista de cambios.

Cómo se comprueba: Al final, di en una línea qué no pudiste cumplir y por qué.

Tono: Directo y sin adornos.

=== Material ===
(el texto pegado)
=== Fin del material ===
```

**SKILL.md de ejemplo** (`skill`; secciones fijas en este orden, cada una solo si su bloque tiene texto salvo Cuándo usarla y Pasos; los bloques libres se añaden al final como `## {rótulo}`; los pasos sin número se numeran):
```
---
name: corrector-revista-casa
description: "Corrige ortografía y estilo de notas en español de Honduras y devuelve el texto corregido más la lista de cambios con su norma. Úsala cuando pidan «corrige», «revisa el estilo» o peguen una nota para la revista. No la uses para traducir."
---

# corrector-revista-casa

## Cuándo usarla
Corrige ortografía y estilo de notas en español de Honduras y devuelve el texto corregido más la lista de cambios con su norma. Úsala cuando pidan «corrige», «revisa el estilo» o peguen una nota para la revista. No la uses para traducir.

## Pasos
1. Lee el texto entero antes de tocar nada.
2. Marca las erratas.
3. Marca el estilo, con la norma al lado.
4. Devuelve el texto corregido y la lista de cambios.

## Recursos
- Usa la lista de reglas de estilo que va debajo. No busques en internet.

## Comprobaciones
- Ningún nombre propio cambiado.
- Ninguna cifra tocada.
- Cada cambio con su norma.

## Ejemplos
- Pedido: «Arréglame esta nota» + texto pegado → corrige y devuelve las dos partes.
- No se activa: «Hazme un post de esta nota».
```

**Grafo: cómo se leen nodos y aristas.** Nodo: `Nombre: resto` → nombre = lo anterior a los primeros dos puntos; sin dos puntos, el renglón entero es el nombre. Arista: el renglón se parte por «;» en cláusulas; la primera es `Origen → Destino [condición]`; el destino es el nombre de nodo conocido más largo que case al principio del lado derecho (sin tildes ni mayúsculas; `FIN` siempre conocido); si ninguno casa, el destino son las palabras hasta « si », « cuando », « como máximo », «(» o «.» (desconocido → punteado y PARA); la condición es lo que sigue, sin el punto final. Una cláusula «si no → C» o «si no, → C» hereda el origen y lleva la condición «si no». `csgMmdId(nombre)`: NFD sin diacríticos, `[^A-Za-z0-9_]` → `_`, `_` repetidos colapsados, `n` delante si empieza por dígito, `_` detrás si es una palabra reservada de Mermaid (`end`, `graph`, `subgraph`, `style`, `class`, `click`, `flowchart`), único por diagrama. `csgMmdTexto(s)`: `"` → `#quot;`, `|` → `/`, `<` → `#lt;`, `>` → `#gt;`, saltos → espacio, y un punto final se quita.

**Mermaid de ejemplo (Cadena):**
```
flowchart TD
  Investigador["Investigador: recibe el tema, entrega diez fuentes con dirección"]
  Guionista["Guionista: recibe las fuentes, entrega el guion en bloques"]
  Verificador["Verificador: recibe el guion, entrega la lista de citas que no cuadran"]
  Editor["Editor: recibe el guion aprobado, entrega la versión final"]
  FIN((FIN))
  Investigador --> Guionista
  Guionista --> Verificador
  Verificador -->|si hay citas malas (máximo 2 vueltas)| Guionista
  Verificador -->|si no| Editor
  Editor --> FIN
```

**Mermaid en estrella (Coordinador):** el coordinador es el nombre antes de los dos puntos del bloque `coordinador` (o «Coordinador»); por cada especialista, una arista `reparte` de ida y una `entrega` de vuelta; al final `Coordinador --> FIN`:
```
flowchart TD
  Coordinador["Coordinador: recibe el encargo, lo parte en tareas, se las da a los especialistas y junta lo que devuelven"]
  Historiador["Historiador: fechas y contexto, con fuente"]
  Economista["Economista: cifras con fuente y año"]
  Editor["Editor: la forma final"]
  FIN((FIN))
  Coordinador -->|reparte| Historiador
  Historiador -->|entrega| Coordinador
  Coordinador -->|reparte| Economista
  Economista -->|entrega| Coordinador
  Coordinador -->|reparte| Editor
  Editor -->|entrega| Coordinador
  Coordinador --> FIN
```

**Plan de un grafo** (`plan`, texto): `Meta: …`, línea en blanco, `Nodos:` y los renglones numerados «n. renglón» (en Coordinador, el coordinador es el 1), línea en blanco, `Pasos:` y una arista por renglón como `- A → B` o `- A → B si condición` (en Coordinador: `- Coordinador → Historiador (reparte)`, `- Historiador → Coordinador (entrega)`…), y después, cada uno en su párrafo y solo si tienen texto: `Cómo se reparte: …`, `Cómo se junta: …`, `Lo que viaja: …`, `Termina cuando: …` (el bloque `fin`).

**Prompt para un solo chat** (`principal`): los bloques del molde, más un bloque sintético `como` (rótulo «Cómo hacerlo en este chat») al final, todo en la forma de la máquina. Texto de `como` en Cadena (`CSG_TEXTOS.orquestarCadena(primero)`, primero = el primer nodo): «Vas a hacer tú solo, por turnos, el papel de cada nodo. Empieza por {primero}. En cada turno escribe NODO: y su nombre en su propio renglón, haz lo suyo con lo que recibe, y pasa al siguiente según las aristas y sus condiciones; lo que viaja entre nodos es lo único que el siguiente ve. No inventes nodos ni te saltes aristas. Termina cuando se llegue a FIN o se cumpla lo dicho en «Fin y entrega», y entonces entrega lo que allí se pide.» En Coordinador: «Vas a hacer tú solo, por turnos, el papel del coordinador y de cada especialista. Empieza por {coordinador}, que reparte según «Cómo se reparte». Cada especialista hace su turno en su propio renglón, empezando por NODO: y su nombre, y devuelve al coordinador, que junta según «Cómo se junta». No inventes especialistas. Termina como dice «Fin y entrega» y entrega lo que allí se pide.» Ejemplo completo, Cadena en `md`:
```
## Meta
Un video-ensayo de doce minutos con guion en bloques, fuentes verificadas y rótulos.

## Nodos, uno por renglón
- Investigador: recibe el tema, entrega diez fuentes con dirección.
- Guionista: recibe las fuentes, entrega el guion en bloques.
- Verificador: recibe el guion, entrega la lista de citas que no cuadran.
- Editor: recibe el guion aprobado, entrega la versión final.

## Aristas y condiciones
- Investigador → Guionista.
- Guionista → Verificador.
- Verificador → Guionista si hay citas malas (máximo 2 vueltas); si no → Editor.
- Editor → FIN.

## Lo que viaja entre nodos
Viaja: el tema, la lista de fuentes y el guion actual. No viaja: el razonamiento interno de cada uno.

## Fin y entrega
Termina cuando el Verificador no encuentra citas malas, o a la segunda vuelta. El Editor entrega el guion en bloques [CÁMARA 0:30] para El Rodaje.

## Cómo hacerlo en este chat
Vas a hacer tú solo, por turnos, el papel de cada nodo. Empieza por Investigador. En cada turno escribe NODO: y su nombre en su propio renglón, haz lo suyo con lo que recibe, y pasa al siguiente según las aristas y sus condiciones; lo que viaja entre nodos es lo único que el siguiente ve. No inventes nodos ni te saltes aristas. Termina cuando se llegue a FIN o se cumpla lo dicho en «Fin y entrega», y entonces entrega lo que allí se pide.
```

**Bucles.** `plan` = renglones numerados `n. {Rótulo}: {texto}` por cada bloque no vacío en el orden del molde (los `lista`, con sus renglones unidos por « / »), y al final el `cierre` del molde. `principal` = los bloques del molde en la forma de la máquina más el bloque sintético `como` («Cómo hacerlo en este chat») con el texto `auto` del molde; en `md` y solo en `md`, debajo de ese texto, una línea en blanco y el `pseudo` del molde en un bloque de código con `{N}` = el primer entero del bloque `tope` (o «N»).

Textos de los moldes: **Repite hasta** — auto: «Hazlo tú solo, por vueltas y numerando cada una como VUELTA n. En cada vuelta: haz el paso; comprueba el criterio de parada, condición por condición, y di cuál falla; si cumple, para; si no, vuelve a hacer el paso con lo que falló en cuenta y con lo que se guarda entre vueltas. Al cumplir el criterio o al llegar al tope, entrega lo que dice «Qué sale al final».» — pseudo: «VUELTA 1..{N}:\n  hacer el paso\n  comprobar el criterio de parada, condición por condición\n  si cumple: parar y entregar\n  si no: apuntar qué falló y volver a hacer el paso con eso en cuenta\nal llegar al tope: entregar lo mejor y decir por qué no paró» — cierre: «Repite «Paso que se repite» hasta que se cumpla «Criterio de parada» o se llegue al «Tope», numerando cada vuelta como VUELTA n.» **Borrador y crítica** — auto: «Haz las dos voces tú solo, por turnos y en este orden. Primero, como REDACTOR: escribe el borrador. Después, como CRÍTICO: revísalo con la lista y señala los fallos, o di solo APROBADO. Después, como REDACTOR otra vez: corrige solo lo señalado. Repite CRÍTICO y REDACTOR hasta que el crítico diga APROBADO o se llegue al tope, numerando cada vuelta como VUELTA n. Al terminar, entrega lo que dice «Qué sale al final».» — pseudo: «VUELTA 1..{N}:\n  REDACTOR: escribir (vuelta 1) o corregir solo lo señalado\n  CRÍTICO: revisar y listar fallos, o decir APROBADO\n  si APROBADO: parar y entregar\nal llegar al tope: entregar la última versión y lo que quedó señalado» — cierre: «Repite «Crítico» y «Revisión» hasta «Criterio de parada» o hasta el «Tope», numerando cada vuelta como VUELTA n.» **Por lotes** — auto: «Recorre la lista tú solo, un renglón por vuelta y en orden, sin juntar dos ni saltarte ninguno. En cada vuelta aplica el paso a ese elemento con el mismo formato, lleva el acumulado, y si uno no se puede, escribe NO SE PUDO y sigue. Al terminar la lista, entrega lo que dice «Salida».» — pseudo: «PARA CADA renglón de la lista, en orden:\n  hacer el paso con ese elemento\n  llevar el acumulado\nal terminar la lista: entregar» — cierre: «Aplica «Paso por elemento» a cada renglón de «Lista», en orden, hasta acabarla.» **Careo** — auto: «Escribe el careo entero tú solo, haciendo las tres voces por turnos. Cada turno empieza en su propio renglón por A:, B: o JUEZ:. Respeta las rondas y el largo de cada turno. Al terminar la última ronda, el JUEZ da el veredicto. Encabeza todo con la etiqueta de la casa y termina con FIN solo en su renglón.» — pseudo: «RONDA 1..{N}:\n  A: turno\n  B: turno\n  JUEZ: puntúa la ronda\nal terminar las rondas: JUEZ da el veredicto y se escribe el careo entero con su etiqueta» — cierre: «Alterna A, B y JUEZ durante las «Rondas» y cierra con «Veredicto y etiqueta».»

**Repite hasta, `plan` de ejemplo:**
```
1. Paso que se repite: Escribe el primer párrafo del ensayo.
2. Criterio de parada: Para cuando el párrafo tenga menos de 80 palabras, empiece con un dato y no lleve ningún adverbio en -mente.
3. Tope: Máximo 5 vueltas. Si llegas al tope, entrega lo mejor que tengas y di por qué no paró.
4. Lo que se guarda entre vueltas: Se guarda: la última versión y la lista de lo que ya se corrigió. Se descarta: las versiones anteriores.
5. Qué sale al final: La versión final y, debajo, en un renglón por vuelta, qué cambió.
Repite «Paso que se repite» hasta que se cumpla «Criterio de parada» o se llegue al «Tope», numerando cada vuelta como VUELTA n.
```

**Repite hasta, auto-bucle en `md`:**
~~~
## Paso que se repite
Escribe el primer párrafo del ensayo.

## Criterio de parada
Para cuando el párrafo tenga menos de 80 palabras, empiece con un dato y no lleve ningún adverbio en -mente.

## Tope
Máximo 5 vueltas. Si llegas al tope, entrega lo mejor que tengas y di por qué no paró.

## Lo que se guarda entre vueltas
Se guarda: la última versión y la lista de lo que ya se corrigió. Se descarta: las versiones anteriores.

## Qué sale al final
La versión final y, debajo, en un renglón por vuelta, qué cambió.

## Cómo hacerlo en este chat
Hazlo tú solo, por vueltas y numerando cada una como VUELTA n. En cada vuelta: haz el paso; comprueba el criterio de parada, condición por condición, y di cuál falla; si cumple, para; si no, vuelve a hacer el paso con lo que falló en cuenta y con lo que se guarda entre vueltas. Al cumplir el criterio o al llegar al tope, entrega lo que dice «Qué sale al final».

```
VUELTA 1..5:
  hacer el paso
  comprobar el criterio de parada, condición por condición
  si cumple: parar y entregar
  si no: apuntar qué falló y volver a hacer el paso con eso en cuenta
al llegar al tope: entregar lo mejor y decir por qué no paró
```
~~~
En `xml`, los mismos bloques en `<paso>`, `<parada>`, `<tope>`, `<memoria>`, `<salida>` y `<como>` con el texto `auto` (sin el bloque de código).

**Borrador y crítica, auto-bucle en `md`:**
~~~
## Borrador
Escribe un resumen de 150 palabras de lo que va abajo.

## Crítico
Como editor exigente, señala tres fallos concretos con su renglón: uno de datos, uno de forma, uno de claridad. Nada de elogios. Si no hay fallos graves, di solo «APROBADO».

## Revisión
Corrige solo lo que señaló el crítico; no toques lo demás. Cada corrección con su porqué en un renglón.

## Criterio de parada
Para cuando el crítico diga APROBADO.

## Tope
Máximo 4 vueltas. Al tope, entrega la última y la lista de lo que quedó.

## Qué sale al final
La versión aprobada y, debajo, las críticas de cada vuelta.

## Cómo hacerlo en este chat
Haz las dos voces tú solo, por turnos y en este orden. Primero, como REDACTOR: escribe el borrador. Después, como CRÍTICO: revísalo con la lista y señala los fallos, o di solo APROBADO. Después, como REDACTOR otra vez: corrige solo lo señalado. Repite CRÍTICO y REDACTOR hasta que el crítico diga APROBADO o se llegue al tope, numerando cada vuelta como VUELTA n. Al terminar, entrega lo que dice «Qué sale al final».

```
VUELTA 1..4:
  REDACTOR: escribir (vuelta 1) o corregir solo lo señalado
  CRÍTICO: revisar y listar fallos, o decir APROBADO
  si APROBADO: parar y entregar
al llegar al tope: entregar la última versión y lo que quedó señalado
```

=== Material ===
(el texto pegado)
=== Fin del material ===
~~~

**Careo, auto-bucle en `md`** (con «Voz: A y B», «Máquina: ChatGPT» y «Consigna: Careo jornada extendida» ya rellenados por las reservadas):
~~~
## Postura A
Defiende que la jornada extendida reduce la deserción, con datos de 2015-2024.

## Postura B
Defiende que la deserción bajó por otras causas y que la jornada extendida se lleva el mérito sin evidencia.

## Juez
Puntúa cada ronda por evidencia y no por retórica; nombra cada falacia que veas.

## Rondas
Tres rondas: apertura, réplica y cierre. Cada turno, 150 palabras.

## Veredicto y etiqueta
Al final, un veredicto de 200 palabras con la postura que gana, por qué, y las tres mejores pruebas de cada lado. Escribe el careo entero encabezado con estas líneas, una por renglón: «Título:» y un título; «Voz: A y B»; «Máquina: ChatGPT»; «Género: entrevista»; «Consigna: Careo jornada extendida». Cada turno empieza en su propio renglón por A:, B: o JUEZ:. Termina con FIN solo en su renglón.

## Cómo hacerlo en este chat
Escribe el careo entero tú solo, haciendo las tres voces por turnos. Cada turno empieza en su propio renglón por A:, B: o JUEZ:. Respeta las rondas y el largo de cada turno. Al terminar la última ronda, el JUEZ da el veredicto. Encabeza todo con la etiqueta de la casa y termina con FIN solo en su renglón.

```
RONDA 1..3:
  A: turno
  B: turno
  JUEZ: puntúa la ronda
al terminar las rondas: JUEZ da el veredicto y se escribe el careo entero con su etiqueta
```
~~~

**Export del inventario** (📋 Exportar, `csgExportarTexto`), texto para un chat o un respaldo, no un formato que se importe:
```
F.A.R.O · La Consigna · 2026-09-22 · 12 piezas
── Estante: Revista ──
📜 Resumen de informe · 💬 Prompt · Encargo completo · Claude · v3 · usada 7 veces · 👍 5 · 👎 1 · última 2026-09-20
Variables: {{tema}}
## Rol
…
## Tarea
…
— Bitácora —
2026-09-20 · Claude · v3 · ✅ · «salió con páginas»
2026-09-14 · Gemini · v3 · ❌ · «inventó una fuente»
```
Cada pieza sale en forma `md` sin material; las piezas en varios estantes salen una vez bajo el primero y «también en: …»; «Sin estante» al final.

## 8. El inventario (el anaquel)

La forma de Cuadernos, con dos vistas y no tres.

- **Cabecera compacta:** ‹ · «📜 La Consigna» · [＋]. Sin bloque de presentación mientras haya piezas: la cuenta la dicen los chips y solo ellos (en la v1 se decía dos veces; es lo que la regla 11 de Cuadernos quitó).
- **La barra:** UNA fila `nowrap` deslizable con degradado (`.csg-barra`, calcada de `.rcu-barra`), botones PRIMERO con icono en baldosa y palabra (crear lleno, traer teñido, mirar neutro, sacar ámbar): [＋ Nueva] · [📋 Pegar] · | · [🗂 Estantes] · [⇅ Orden] · [☑ Elegir] · | · [📋 Exportar] · y al final las vistas ▦ ☰. La sonda 18 mide a 320 px que ☑ Elegir queda dentro del borde (comprobación 34 de La Voz Prestada).
- **El buscador** (sin tildes ni mayúsculas; título, bloques, estantes, variables, máquina, notas de bitácora) con el único mando de la lista al lado (▾ Abrir todos / ▴ Cerrar todos, solo con grupos).
- **Chips de clase con su cuenta**, una fila `nowrap`: «Todas 12» · «🟡 Borradores 2» · «⏳ Sin probar 4» · «💬 Prompt 7» · «🧰 Habilidad 3» · «🕸 Grafo 1» · «🔁 Bucle 1». «Sin probar» (ningún uso con `ok`) va tercero: el trabajo no es ver los prompts, es saber cuáles faltan por probar. El chip tocado se trae a la vista.
- **Los filtros puestos**, cada uno con su ✕, y al final de esa misma fila la cuenta «3 de 12»; sin ninguno, la fila no existe.
- **El renglón de la bitácora** (`.csg-pregunta`, 44 px medidos, `display: flex`, texto con elipsis y cuatro botones de 36 px): va DEBAJO de los chips y de los filtros puestos y ENCIMA de la primera ficha o grupo, solo cuando hay un uso de los últimos 7 días sin contestar. Cuenta como «lo que está puesto»: antes de la primera ficha hay como máximo cinco cosas —barra, buscador, chips, filtros puestos, renglón de bitácora—, y las dos últimas solo existen cuando tienen contenido. La sonda 13 cuenta los hijos y mide el renglón.
- **🗂 Estantes** (`#csg-ver-overlay`, renglones `.csg-ver-fila` de 44 px con su cuenta, como `rcuVerFila`): «Todas», los ESTANTES con su tono, «Sin estante», las MÁQUINAS, «🟡 Borradores», «⏳ Sin probar». Elegir uno cierra la hoja. Crear un estante nuevo se hace dentro.
- **⇅ Orden** (`faro_consigna_anaquel_v1`): 🕘 Última usada (por defecto) · 🔥 Más usadas · 👍 Mejor valoradas (✅ menos ❌; con menos de dos usos contestados, al final y «pocos usos») · 🔤 Título · 🆕 Recientes. **Agrupar:** ☰ Sin agrupar (por defecto) · 🗂 Por estante · 💬 Por clase · 🤖 Por máquina. Grupos PLEGADOS con las cuatro reglas del anaquel; `.csg-grupo[hidden] { display: none !important; }` mirado calculado; lo abierto con el eje delante (`estante:maestria`). Plegado, el rótulo enseña los emojis de clase de lo que hay dentro, pegados a la cuenta.
- **Tonos:** por CLASE, fijos: `.csg-clase-prompt { --csg-t: #1d4ed8; --csg-tf: #eff6ff; --csg-tb: #bfdbfe; }` (azul), `.csg-clase-habilidad { --csg-t: #15803d; --csg-tf: #f0fdf4; --csg-tb: #bbf7d0; }` (verde), `.csg-clase-grafo { --csg-t: #7e22ce; --csg-tf: #faf5ff; --csg-tb: #e9d5ff; }` (violeta), `.csg-clase-bucle { --csg-t: #b45309; --csg-tf: #fffbeb; --csg-tb: #fde68a; }` (ámbar). Estantes con `csgTono` (copia de `rcuTono`, ocho tonos `.csg-tono-0..7` en el CSS); máquinas y «Sin estante» en gris. Todo fondo de chip y de ficha es `var(--surface)` o un `--csg-tf`, nunca `--card`.
- **La ficha** (`▦`, `grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); align-items: start`, vertical): (1) baldosa con el emoji de la clase en su tono + título; (2) UNA sola línea corrida `.csg-ficha-meta`: «Encargo completo · Claude · v3 · 7 usos · 👍 5 · 👎 1 · hace 3 d», con un token delante solo cuando toca: «🟡 borrador: falta Formato» (ámbar) o «⚠ 3 usos este mes ▸» (tocable; nunca los dos, borrador manda); (3) chips de los OTROS estantes, solo si hay; (4) el primer bloque obligatorio en dos líneas grises; (5) al pie, sin hueco: [▶ Usar] lleno del tono de la clase · [✎ Corregir] neutro · [⋯]. Copiar vive en Usar y en ⋯: cuatro botones eran las cajitas que el autor rechazó. Con ratón, `@media (hover: hover)`.
- **☰ Lista:** una fila de 44 px por pieza: punto de color, título, máquina, «hace 3 d», ▶ y ⋯.
- **El menú ⋯:** Usar · Copiar (texto armado para su máquina; con huecos los deja y lo dice) · Corregir · Duplicar en otro molde… · Versiones · Bitácora · Estantes · 📓 Ligar al cuaderno (lee `rcuVivos()` si existe; guarda `id` en `cuaderno` y el título en `notas`; con él, ↗ de NotebookLM abre ESE cuaderno por su dirección comprobada con `URL()`; desde Cuadernos no se enseña nada) · Retirar (dos toques «Sí, retirar · No», sin `confirm()`). Las retiradas al final, en un `<details>`, y desde ahí se devuelven.
- **☑ Elegir:** un toque marca; barra `position: sticky; bottom: 0` con 🗂 Mover a estante (interruptor sobre varios, «crear estante» dentro), 🤖 Cambiar la máquina, 🗑 Retirar (dos toques). Mientras se elige, el toque elige y nada más; `body.csg-eligiendo #destello-fab { display: none !important; }`.
- **La nube:** franja `.csg-nube-no` SOLO con algo que arreglar («📴 Solo en este aparato: falta correr consigna.sql», «sin sesión: se firmará al entrar», «sin señal · reintentar», «la base va vieja: vuelve a correr consigna.sql», «“X” no cabe en la nube: recorta N caracteres»); si va bien, un renglón discreto al pie.
- **Vista vacía:** el bloque de presentación (`msug-intro`) y una tarjeta con 📜 grande: «Todavía no hay consignas. Cada consigna es lo que le pides a una máquina, con forma: un prompt, una habilidad, un grafo de agentes o un bucle. Se escribe una vez, se guarda y se vuelve a usar en dos toques.» con [＋ Nueva] y [📋 Pegar una que ya tengas].

## 9. Datos

**Tabla `public.consigna_piezas`** (`supabase/sql/consigna.sql`, idempotente; guardia `do $guardia$` que exige `es_familia()` nombrando `seguridad_familia_1_puerta.sql`; comprobación EN VERTICAL al final; `consigna_comprueba.sql` solo mira, con `query_to_xml` para las cuentas). 21 columnas:

| columna | tipo y tope |
|---|---|
| `id` | `text primary key check (length(id) between 4 and 60)` — `csg-<Date.now() en base 36>-<6 al azar>`; llave del upsert |
| `clase` | `text not null check (length(clase) between 1 and 20)` — sin lista |
| `molde` | `text not null check (length(molde) between 1 and 30)` — sin lista |
| `titulo` | `text not null check (length(btrim(titulo)) between 1 and 200)` |
| `maquina` | `text not null default '' check (length(maquina) <= 40)` |
| `bloques` | `jsonb not null default '[]' check (jsonb_typeof(bloques) = 'array' and length(bloques::text) <= 60000)` — `{id, rotulo, t}` en el orden del molde; sin variables ni material |
| `material` | `text not null default '' check (length(material) <= 20000)` |
| `estantes` | `jsonb not null default '[]' check (jsonb_typeof(estantes) = 'array' and length(estantes::text) <= 1000)` |
| `cuaderno` | `text not null default '' check (length(cuaderno) <= 80)` |
| `notas` | `text not null default '' check (length(notas) <= 4000)` |
| `bitacora` | `jsonb not null default '[]' check (jsonb_typeof(bitacora) = 'array' and length(bitacora::text) <= 60000)` — `{uid, t, maquina, v, ok, nota}` |
| `versiones` | `jsonb not null default '[]' check (jsonb_typeof(versiones) = 'array' and length(versiones::text) <= 200000)` — `{vid, v, t, bloques?}` |
| `version` | `integer not null default 1 check (version between 1 and 100000)` |
| `usos` | `integer not null default 0 check (usos >= 0)` |
| `ultima` | `bigint not null default 0` |
| `autor` | `text not null default '' check (length(autor) <= 40)` — el identificador del miembro (`josue`, `evelyn`…), como en Redes y Cuadernos |
| `eliminado` | `boolean not null default false` |
| `eliminado_at` | `timestamptz` |
| `actualizado` | `bigint not null default 0` — reloj del aparato; manda en la fusión |
| `creado_at` | `timestamptz not null default now()` |
| `actualizado_at` | `timestamptz not null default now()` con el disparador `consigna_piezas_touch` (`set search_path = public`) |

Índice `consigna_piezas_actualizado_idx on (eliminado, actualizado desc)`. RLS: `enable row level security`; `consigna_piezas_select/insert/update` para `authenticated` con `public.es_familia()`; ninguna de delete; `revoke all … from anon; revoke all … from authenticated; grant select, insert, update … to authenticated`. Sin `security definer`. La comprobación final devuelve en vertical: tabla, columnas (21), políticas (3), RLS, disparador (1), delete (0), puerta anon (0).

**Topes en UN sitio (`CSG_TOPES`)** con los mismos números que los `check`: `{ bloques: 60000, material: 20000, estantes: 1000, notas: 4000, bitacora: 60000, versiones: 200000, nota_uso: 300, estante: 40, estantes_n: 12 }`. La sonda 14 los lee del propio `consigna.sql` (`length\((\w+)(?:::text)?\)\s*<=\s*(\d+)`) y suspende si alguno difiere.

**Poda por bytes (`csgPodar(p)`)**, antes de guardar en el aparato y antes de cada upsert:
1. `bitacora`: por `t` descendente; cada `nota` cortada a 300; se quedan 200 como máximo; mientras `JSON.stringify(bitacora).length > 58000`, se quita el más viejo con `ok === null`, y si no queda ninguno, el más viejo.
2. `versiones`: solo las 10 más recientes conservan `bloques`; las demás quedan `{vid, v, t}`; mientras `JSON.stringify(versiones).length > 198000`, se le quitan los `bloques` a la más vieja que aún los tenga, y si ninguna los tiene, se descarta la más vieja; la pantalla dice «se plegaron N versiones viejas». Diez versiones con bloques de 60.000 no caben en 200.000, y por eso manda el byte y no la cuenta.
3. `bloques`: NUNCA se recortan (es el texto de la persona). Si `JSON.stringify(bloques).length > 60000`, la pieza se guarda en el aparato con `noCabe: true`, no se sube, el repaso PARA y la franja de la nube nombra la pieza y los caracteres que sobran.
4. `material`: con más de 20.000 caracteres no se guarda (ni local ni nube): queda en el borrador del compositor y en la hoja de Usar.
5. `estantes`: ≤ 12 de ≤ 40 caracteres; `notas`: `maxlength` 4.000.

**`csgAutor()`**: `verificarSesion()?.user` → si no, el `user` guardado en `localStorage['faro.miembro']` (`AUTH_MIEMBRO_KEY`, que guarda solo el identificador) → si no, `''`. Una pieza con `autor === ''` se guarda en el aparato pero NO se sube: queda pendiente con motivo «sin sesión» (la franja lo dice) y `csgSubirPendientes` la firma y la sube en cuanto `csgAutor()` devuelve algo. Así ninguna fila viaja sin firma y nadie tiene que enterarse después.

**Fusión (`csgFusiona(local, nube)`)**: los escalares (título, bloques, material, estantes, máquina, notas, cuaderno, version, ultima, usos, eliminado) los gana el `actualizado` más nuevo; **`bitacora` y `versiones` se fusionan por UNIÓN de `uid`/`vid`**, y un uso con `ok` puesto gana a uno con `null` del mismo `uid`; `usos` = el mayor de los dos y nunca menor que el largo de la bitácora.

**En el aparato:** `faro_consigna_v1` (piezas con lápidas seis meses), `faro_consigna_anaquel_v1` (vista, orden, agrupar, abiertos, filtro, `sinExplicaciones`), `faro_consigna_vars_v1` (`{ [id]: { [nombre]: [tres últimos] } }`), `faro_consigna_maquina_v1`, `faro_consigna_borrador_v1`, `faro_consigna_pregunta_v1`. `CSG_COLUMNAS` es la lista con la que se pide; `42P01` es «falta correr consigna.sql»; `42703` es «la base va vieja: vuelve a correr consigna.sql» (se quita la columna que el error nombra y se sigue); todo lo demás es la señal, con reloj propio de ocho segundos (`csgConReloj`, código `FARO_RELOJ`, como `rcuConReloj`). Subida: upsert por `id` con `onConflict: 'id'`; `csgSubirPendientes` al abrir y al `online`, en UN viaje.

## 10. Reglas no negociables

1. ⚠️ **LO QUE SE COPIA ES LO QUE SE VE, CARÁCTER POR CARÁCTER.** Vista previa y botones salen del mismo `csgArmar`. Un prompt que sale distinto de como se vio se descubre leyendo lo que la máquina devolvió, sin saber por qué.
2. ⚠️ **LA PIEZA SON BLOQUES; LA FORMA ES DE LA MÁQUINA.** Nunca se guarda un texto armado; `csgArmar` es pura y sin DOM.
3. ⚠️ **UN VOCABULARIO ÚNICO; CADA MOLDE ES UNA LISTA DE IDS CON SUS SOBREESCRITURAS DECLARADAS.** Un id tiene un significado; el molde solo cambia las palabras (`rotulo`, `para_que`, `ejemplo`, `frases`, `inicial`, `plantilla`) y la obligatoriedad, y lo hace en su propia entrada. `comprobacion` es un solo id en las cuatro clases; `CSG_EQUIVALE` está escrito y es lo único que «Duplicar en otro molde» consulta además del id.
4. ⚠️ **LAS LISTAS CERRADAS VIVEN EN EL APARATO; LOS TOPES EN UN SITIO.** Clases, moldes, bloques, frases, sinónimos, máquinas y `CSG_TOPES` en el JS; la base guarda texto con tope y sin lista, y sus `check` dicen los mismos números que `CSG_TOPES` (la sonda lo comprueba leyendo el SQL).
5. ⚠️ **GUARDAR NUNCA SE BLOQUEA; USAR SÍ.** Borrador con lo que falte nombrado; lo que no cabe en la nube se guarda aquí y se dice cuánto sobra.
6. ⚠️ **UNA VARIABLE VACÍA NO SE COPIA EN SILENCIO.** «Copiar con huecos» es otro botón. Últimos valores POR PIEZA y del aparato.
7. ⚠️ **LOS CHIPS INSERTAN Y QUITAN SU FRASE EXACTA; NUNCA REESCRIBEN.** `setRangeText`, `input` a mano, `pointerdown` cancelado.
8. ⚠️ **PEGAR RESPETA LA ASIMETRÍA.** Solo asciende a rótulo lo corroborado; la clave es solo letras y espacios; una flecha solo es arista fuera de `ejemplos` y entre nombres cortos; un bucle solo se propone sin bloques de prompt reconocidos; lo que no se entiende se queda en Tarea y se NOMBRA con su renglón; nada se descarta; la clase se propone con un chip.
9. ⚠️ **LA BITÁCORA SE PREGUNTA, NO SE RELLENA, Y NUNCA SE INVENTA UN RESULTADO.** Un renglón, un uso cada vez, siete días, plegado si se ignora tres veces.
10. ⚠️ **EL 👍 VA ATADO A LA VERSIÓN Y A LA MÁQUINA, Y NADA REESCRIBE EL HISTORIAL.** Corregir una pieza usada crea versión; «volver a la v2» crea la v5. Las versiones se PODAN POR BYTES antes de que el tope rebote con un mensaje que habla de otra cosa.
11. ⚠️ **USOS Y VERSIONES SE FUSIONAN POR UNIÓN DE SU ID, NUNCA POR FILA ENTERA.**
12. ⚠️ **EL BUCLE NO SE USA SIN TOPE, NI EL GRAFO CON VUELTA ATRÁS SIN FIN, NI CON UNA ARISTA A NINGUNA PARTE.**
13. ⚠️ **EL REPASO MIRA LO QUE CADA FORMATO EXIGE Y AVISA EN UN SOLO SENTIDO.** `name` y `description` del SKILL.md, Mermaid escapado, pares de Con ejemplos, Perplexity sin citar, NotebookLM con etiquetas, bloque solo de frases hechas; lo que PARA a la vista, lo que avisa plegado.
14. ⚠️ **LA ETIQUETA VIAJA EN LA IDA.** Voz prestada y Careo llevan `etiqueta` obligatoria y rellena con Título:, Voz:, Máquina: {{maquina}}, Género: y Consigna: {{titulo}}, que `VOZ_ETIQUETAS` entiende («consigna» cae en `encargo`); «📖 Guardar lo que devolvió» usa `switchView('view-voz')` y `vozAbrirPegar(null)`, sin tocar `voz-prestada.js`.
15. ⚠️ **NADA DE LO ESCRITO LLEGA A UN ATRIBUTO NI A `innerHTML`.** `createElement` y `textContent` en todo, `<pre>` incluido; direcciones literales; `encodeURIComponent`; `window.open(…, 'noopener,noreferrer')`; el cuaderno ligado con `URL()` y `setAttribute`.
16. ⚠️ **ABRIR LA MÁQUINA COPIA PRIMERO, SIEMPRE, Y EL TEXTO EN LA DIRECCIÓN TIENE TOPE (1.500 codificados).**
17. ⚠️ **EL REPASO AVISA DE DATOS DE LA CASA DENTRO DE UNA PIEZA** y propone un `{{hueco}}` de un toque.
18. ⚠️ **LOCAL PRIMERO, NUBE DESPUÉS, Y LA CAUSA SE NOMBRA:** `42P01`, `42703`, `FARO_RELOJ`, «sin sesión», «no cabe». Ninguna fila viaja sin `autor`; el que no tiene firma espera a tenerla. Retirar deja lápida, dos toques, sin `confirm()`.
19. ⚠️ **EL COMPOSITOR A MEDIO ESCRIBIR SE GUARDA EN CADA TECLA** y se ofrece al volver; el material que no cabe vive ahí.
20. ⚠️ **LA HERRAMIENTA GUÍA, NO LLAMA.** Ninguna petición de red obligatoria ni ningún botón que le pida a una IA que escriba el prompt.
21. ⚠️ **PANTALLA A 390 PX Y UNA COSA CADA VEZ:** una fila de botones que se desliza con los botones primero; renglones de 44 px; letra de 16 px en todo recuadro y en el `<pre>`; `<pre>` con `pre-wrap`; baldosas de clase con `1fr`; barra fija con `safe-area` y tres botones que caben en 320 px; antes de la primera ficha, como máximo barra, buscador, chips, filtros puestos y el renglón de la bitácora, los dos últimos solo con contenido. La sonda mide en píxeles y mira los colores CALCULADOS.
22. ⚠️ **EL PREFIJO ES `csg` Y NINGUNA FUNCIÓN REPITE NOMBRE DE OTRO ARCHIVO.** El bucle de `grep` de CLAUDE.md devuelve vacío; la sonda abre `index.html` entero.

## 11. La sonda (`_dev/probe-consigna.html`)

Abre el `index.html` de verdad en UN marco de 390 px (y lo ensancha o estrecha a 320 y 1000 con `iframe.style.width` cuando mide), con una base de mentira a nivel de `fetch` (`42P01` en modo sin tabla; `42703` ante una columna que no esté en la lista sacada del propio `consigna.sql`; `201` guardando el cuerpo en modo puesta; `23502` sin `autor`), `w.open` apuntado, portapapeles apuntado, `confirm` contado y `verificarSesion` de mentira. **Reutiliza el mismo marco al cambiar la base** (`modo = 'puesta'` y `initConsigna()` otra vez), nunca abre un segundo `index.html`. PULSA los botones. Termina con APRUEBA o SUSPENDE en `document.title`:

1. Veneno en título, bloque, nota de bitácora y estante: se ve como texto; ningún `href` ni `src` nuevo; `CSG_EMOJI` no está entre los emojis de `VOZ_GENEROS`; `css/consigna.css` no contiene `var(--card`.
2. Armado exacto: el Encargo completo de §7 en `xml`, `md` y `seguida` carácter por carácter contra los tres textos de §7; Rápido sin encabezados en `md`; Material entre marcas; Perplexity con Fuentes y Citas delante; «Ahora tú» último; los 17 moldes armados con todos sus bloques llenos en las tres formas sin perder ningún bloque; `sistema` + `encargo` = exactamente los bloques de `principal`.
3. SKILL.md: frontmatter con `description` entre comillas y escapada, seis encabezados; «Corrector Revista» → `corrector-revista`; `name` con mayúscula o de 65 y `description` de 1025 apagan USAR nombrándolo.
4. Mermaid: nodo con `"` y `|` escapado; arista a nodo inexistente PARA; `FIN` siempre; la estrella del Coordinador tiene ida y vuelta por especialista; la Cadena de §7 sale carácter por carácter.
5. Variables: detección al teclear; Copiar con hueco vacío se para; «Copiar con huecos» copia las llaves; `{{maquina}}`, `{{titulo}}` y `{{hoy}}` rellenos (`{{hoy}}` = la fecha de hoy en `AAAA-MM-DD`); últimos valores por pieza y no en otra pieza.
6. Chips: mete, quita idéntica, editada no toca; `pointerdown` cancelado; «{ } Variable»; «＋ Otro» mete la plantilla; los `inicial` de Voz prestada, Careo y Por lotes están puestos al abrir el molde.
7. Pegar y repartir: un CO-STAR en XML → seis bloques; encabezados en inglés y español; frontmatter → SKILL.md; **un prompt de Con ejemplos con tres pares «a → b» → Prompt · Con ejemplos, NUNCA Grafo, con los pares en `ejemplos`**; renglones «Investigador → Guionista» sin `ejemplos` → Grafo · Cadena; **«Para cuando… / Máximo 4 vueltas / Repite…» sin bloques de prompt → Bucle · Repite hasta con `parada`, `tope` y `paso`; «## Tarea … Repite esto para cada tema» → Prompt · Encargo, la frase en su bloque y el aviso «parece que se repite»**; siete renglones que empiezan por siete palabras de bloque sin dos puntos → UN bloque Tarea; lo no entendido nombrado con su renglón; palabras de entrada = palabras de salida.
8. Plegado: `display` CALCULADO `none`; nada se abre solo; buscando se abre y no se guarda; un solo montón sin mando; rótulos pulsados de 44 px; «⏳ Sin probar» cuenta bien.
9. Nube: con `42P01` la barra dice «falta correr consigna.sql»; al pasar a puesta sube en UN upsert con `onConflict` por `id`, la pieza con `autor: 'josue'` (la sesión de mentira) y `actualizado`; con `verificarSesion` en `null` y sin `faro.miembro`, nada sube y la barra dice «sin sesión»; al volver la sesión, `csgSubirPendientes` la sube firmada; `42703` dice «vuelve a correr» y la columna; `FARO_RELOJ` no vacía la lista.
10. Fusión: unión por `uid`/`vid`; `ok` gana a `null`; escalares por `actualizado`.
11. Lápida: dos toques, `confirm` 0 veces, `eliminado: true` en el upsert, y la lápida gana al arrancar con la nube devolviendo la pieza vieja.
12. Usar: ▶ → hoja medida con `elementFromPoint` sobre los tres botones del pie a 390 y 320 px; Copiar apunta `usos`, `ultima` y un uso con `ok: null`; ↗ Abrir: portapapeles ANTES de `w.open`, dirección = literal + `encodeURIComponent(armado)`, `noopener,noreferrer`; con 1.501 codificados se abre pelada y el botón lo dice; Gemini pelada siempre.
13. Bitácora preguntada: al reabrir sale UN renglón `.csg-pregunta` de 44 px medidos, debajo de los chips y filtros y encima de la primera ficha; los hijos antes de la primera ficha son ≤ 5 y sin uso pendiente ≤ 4; ✅ escribe `ok: 'si'` y `v`; ✕ deja `null` y no vuelve a preguntar; ignorado tres veces se pliega; un uso de hace 8 días no se pregunta; la nota se corta a 300.
14. Topes: `CSG_TOPES` coincide con los `check` leídos de `consigna.sql` (si no se puede leer el archivo, SUSPENDE); una pieza con 11 versiones de 30.000 caracteres queda por debajo de 200.000 con las viejas plegadas; 250 usos → 200; bloques de 60.001 no viajan y la franja lo dice; **un Material de 20.001 caracteres NO viaja en el upsert** y el bloque lo dice; uno de 19.000 sí viaja en `material`.
15. Borrador: sin Tarea se guarda, la ficha dice «🟡 borrador: falta Tarea» en su única línea corrida, USAR se para; bucle sin tope igual; título repetido avisa con enlace.
16. Repaso: teléfono y correo → aviso y chip a `{{hueco}}`; solo frases hechas → aviso; Perplexity sin dirección → aviso; NotebookLM con `<tarea>` → aviso; plegado tras su cuenta.
17. Compositor a 320 px: las cuatro baldosas de clase con `getBoundingClientRect().right <= hoja.right` y ancho ≥ 120; baldosa 💬 abre Rápido con la Tarea enfocada dentro del toque; título propuesto sin pisar; «Sin explicaciones» pliega; cambiar a Encargo conserva Tarea y Formato; «Duplicar en otro molde» de Encargo a SKILL.md deja `comprobacion` EN su sitio y `rol` como libre marcado; borrador a medio escribir recuperado tras recargar.
18. Píxeles y colores: los tres botones de la barra fija caben en 320 px (cada `right <= barra.right`, ancho ≥ 44); en la barra del anaquel ☑ Elegir tiene `right <= 320`; el `<pre>` con un renglón de 300 caracteres tiene `scrollWidth <= clientWidth + 1` y `font-size` calculado 16 px; el fondo CALCULADO de un `.csg-chip`, una `.csg-ficha` y una `.csg-ver-fila` no es transparente; en cada `.csg-clase-*` el `--csg-t` calculado no está vacío y la baldosa tiene un `background-color` calculado distinto de `rgba(0, 0, 0, 0)`; `csgTono('maestria')` devuelve una clase cuyo `--csg-t` calculado existe; `#destello-fab` está `display: none` calculado en `view-consigna-editor` y en modo elegir.
19. Las tres hojas por encima: `#csg-ver-overlay`, `#csg-usar-overlay` y `#csg-pegar-overlay` abiertas desde `view-consigna` y desde `view-consigna-editor` (con la barra fija puesta) devuelven en `elementFromPoint` del centro de la hoja un nodo de dentro de la hoja.
20. «📖 Guardar lo que devolvió» solo en Voz prestada, Careo e Investigación; pulsado, `view-voz` activa y `#voz-pegar-overlay` visible; `vozAbrirPegar.toString()` igual antes y después de cargar `consigna.js`.
21. Export: todas las piezas vivas agrupadas por estante con bloques y bitácora; ninguna lápida.
22. Choque de nombres: el bucle de `grep` de CLAUDE.md devuelve vacío; `typeof initConsigna === 'function'`.

**Y el SQL**, contra el PostgreSQL de la sesión (`_dev/prueba-consigna-sql.sql`, con el servidor levantado como dice el apartado de La Voz Prestada). Empieza con el Supabase mínimo de las pruebas vecinas: los roles `anon` y `authenticated`, `grant usage on schema public to anon, authenticated;`, `create schema if not exists auth;`, **`grant usage on schema auth to anon, authenticated;`** (sin él la primera escritura como usuario de la casa revienta con «permission denied for schema auth», un fallo de la prueba disfrazado de fallo de la tabla), `auth.users`, `auth.uid()`, `familia_miembros` y `es_familia()`. Después: la guardia para NOMBRANDO `seguridad_familia_1_puerta.sql`; el archivo corre dos veces sin duplicar políticas ni disparador; los checks muerden (sin título, `clase` de 21, `bloques` que no es lista, `bitacora` de 60.001, `versiones` de 200.001, `material` de 20.001, `id` de dos letras, `version` 0); el disparador pone la hora; la puerta DOS VECES Y EN ESTE ORDEN: primero que el `revoke` le quitó a `anon` el permiso de tabla y que `authenticated` no tiene delete; después `grant all` como Supabase, para probar que la RLS sigue dejando fuera a `anon` y a un usuario con sesión que no es de la casa, y que uno de la casa lee, inserta y corrige. Termina con «RESULTADO: APRUEBA».

## 12. Lo que NO hace, y por qué

- No llama a ninguna IA para escribir, mejorar ni puntuar un prompt: una herramienta cuyo trabajo principal depende de una clave, una función desplegada y la señal no está terminada.
- No ejecuta grafos ni bucles ni orquesta agentes: los exporta para que los corra un chat o una herramienta de agentes.
- No guarda lo que la máquina devolvió: eso es La Voz Prestada o Redacción.
- No pinta el Mermaid ni lo importa.
- No importa el export: lo que se quiera traer entra por «Pegar», pieza a pieza.
- No funde gemelas ni calcula huellas: avisa del mismo título antes de guardar. Con treinta piezas el duplicado se ve; la maquinaria de cien no.
- No gradúa con tres mecanismos ni en silencio: un solo «Duplicar en otro molde», a la vista y sin guardar.
- No trae chips «Tuyas» ni pares de frases contrarias.
- No cuenta tokens de verdad: da un estimado a ojo y lo dice.
- No tiene permisos por persona: es de la casa.
- No admite adjuntos: el Material es texto, y el que pasa de 20.000 caracteres no se guarda con la pieza.
- No pone insignia en el Acceso Rápido.
- No toca `voz-prestada.js`, `redaccion.js` ni `redaccion-redes.js`.
- No corrige los bloques con el corrector de la revista: un prompt lleva etiquetas, llaves y nombres de nodos que marcaría como errata.
- No trae Copilot ni Claude Code como máquinas: nadie de la casa los nombró; añadir uno es una línea.

## Anexo: dónde se cierra cada falta del crítico

1. 📜 y `fa-scroll` en lugar de 🧭 y `fa-compass` (§1; sonda 1). 2. Oliva → lima (#3f6212 → #a3e635), comprobado contra las veinte baldosas (§1). 3. `CSG_MOLDES[...].bloques` lleva `{id, ob, rotulo?, para_que?, ejemplo?, frases?, inicial?, plantilla?}`; `csgBloqueDef` mezcla; §3 marca cada sobreescritura (§2, §3.0, §7 paso 1). 4. Un solo id `comprobacion` en las cuatro clases y `CSG_EQUIVALE` declarado (§2, §3.2; sonda 17). 5. Regla de aristas: fuera de `ejemplos`, sin `{{`, nombres cortos, dos renglones o más (§5 paso 5; sonda 7). 6. Patrones de bucle y de lotes en `CSG_SINONIMOS.bucle`, con la separación entre Encargo con «para cada» y Bucle (§5 paso 6; sonda 7). 7. El auto-bucle en `md` usa los rótulos de §3.4 y el `plan` va aparte (§7). 8. En `xml` no hay «SISTEMA:» ni «; »: cada bloque en su etiqueta, `sistema`/`encargo` son subconjuntos (§7). 9. Ejemplos completos de `seguida`, del prompt para un chat, del auto-bucle de Borrador y crítica, del Careo, del `plan` y de la estrella (§7). 10. `CSG_TOPES`, `versiones` a 200.000 y poda por bytes; sonda 14 lee los `check` del SQL (§9). 11. `material` en columna propia de 20.000; `nota` ≤ 300 (§5, §9). 12. `csgAutor()` con sus tres fuentes y la pieza sin firma que espera; sonda 9 escribe `autor: 'josue'` (§9). 13. La cuenta solo en los chips; sin bloque de presentación con piezas (§8). 14. Ficha de cinco elementos, una sola línea corrida con estado, resumen y versión, tres botones (§8). 15. Baldosas con `repeat(2, minmax(0, 1fr))`; sonda 17 mide a 320 px (§5). 16. `<pre>` con `pre-wrap`, `overflow-wrap: anywhere` y 16 px (§5; sonda 18). 17. Colores calculados de chips, fichas, filas, tonos de clase y `csgTono`, y `--card` prohibido (sonda 1 y 18). 18. Barra fija en 320, ☑ Elegir dentro del borde, hijos antes de la primera ficha, Material de 20.001 que no viaja, `{{hoy}}`, `inicial` al abrir (sondas 6, 13, 14, 18). 19. Las tres hojas medidas con `elementFromPoint` desde las dos vistas y el mismo marco al cambiar la base (§11; sonda 19). 20. `grant usage on schema auth to anon, authenticated` en la prueba del SQL (§11). 21. El renglón de la bitácora cuenta como «lo que está puesto», va debajo de chips y filtros y encima de la primera ficha, y la sonda 13 cuenta los hijos (§8, regla 21).