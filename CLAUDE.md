# Cómo se trabaja en F.A.R.O

Notas para quien retome este proyecto. No son sugerencias: son reglas que
ya se acordaron trabajando.

Lo largo está en otros documentos y aquí solo se apunta dónde:

- **`NORMAS-MISIONES-FARO.md`** — cómo se escribe una misión nueva.
- **`PLAN-FARO-PRIVADO.md`** — el estado de la mudanza a privado y, sobre
  todo, **la lista de SQL que falta correr**.
- **`BUZON-DEL-LECTOR.md`** — el buzón, el QR y sus reglas.
- **`COMPENDIO-RUTA-LEY.md`** — las doce misiones de la Ruta de la Ley y sus
  Grietas, ninguna construida todavía, y **la regla de que en esa ruta no se
  cita ningún artículo de memoria**.

## Normativa: el SQL de Supabase se pega en el chat, SIEMPRE

Los archivos de `supabase/sql/` **no se ejecutan solos**: hay que
abrirlos, copiarlos enteros y pegarlos a mano en el SQL Editor de
Supabase. Y eso lo hace el autor **desde el teléfono o la tableta**, casi
siempre sin el repositorio delante.

Por eso: cuando un cambio necesite correr SQL, **el código va escrito en
la respuesta del chat**, entero y listo para copiar. No vale con decir
«está en `supabase/sql/buzon_lector.sql`»: buscar un archivo dentro de
GitHub desde una tableta es exactamente el paso donde el trabajo se queda
parado una semana.

Con el código van tres cosas más, y las tres hacen falta:

1. **En qué orden** se corre, si son varios archivos.
2. **Si hay que volver a correr algo que ya se corrió**, y por qué. Pasa
   más de lo que parece: añadir la sexta clase al Buzón obligó a
   re-correr los dos archivos, porque la lista de clases que se aceptan
   vive dentro de las funciones.
3. **Cómo se comprueba** que quedó puesto, sin fiarse del «Success» del
   editor.

Se pega **el archivo completo**, no un trozo. Son idempotentes a
propósito: correrlos dos veces no rompe nada, y un recorte pegado a
medias sí.

**Y la trampa que costó una tarde el 27 de agosto de 2026:** el editor
corre TODO el pegado dentro de **una sola transacción**. Si falla una
línea, se deshace el pegado entero, la tabla no se crea, y lo único que
se ve es el error de la línea que falló, que puede hablar de otra cosa.
El rastro que quedó fue «relation ... does not exist» al comprobar, que
es el síntoma más lejano posible de la causa (faltaba una función de la
que dependían las políticas).

Por eso, desde `recursos_enlaces.sql`, todo archivo nuevo hace dos cosas
más:

- **empieza comprobando sus dependencias** con un `do $$ ... raise
  exception ... $$` que dice en una frase qué falta y qué hacer. Ocho
  líneas que ahorran la tarde;
- **termina con un `select` que devuelve una fila** diciendo si quedó
  puesto (columnas, políticas, seguridad por fila). Va el último porque
  el editor enseña el resultado de la última sentencia: así, en vez de un
  «Success. No rows returned» que no distingue entre «quedó» y «se pegó
  a medias», sale escrito qué hay.

**Y el SQL se prueba antes de mandarlo.** En la sesión hay PostgreSQL:
se levanta un servidor con `initdb`, se le pone un Supabase mínimo
(`auth.users`, `auth.uid()`, `familia_miembros`, `es_familia()`, los
roles `anon` y `authenticated`) y se corre el archivo con
`psql -v ON_ERROR_STOP=1 --single-transaction`, que es como lo corre el
editor. Ahí se ve si el archivo falla, si es idempotente de verdad y si
sus `check` muerden. Mandar SQL sin correrlo es mandarle a alguien con
una tableta a depurar por ti.

## Normativa: las Sugerencias de M.E.T.A.S se atienden aquí

Dentro de cada misión de M.E.T.A.S hay un botón **💬 Sugerencias**. Lo
toca un alumno o un maestro cuando encuentra una errata, algo que no
funciona o se le ocurre algo. Esos mensajes caen en F.A.R.O y **este es
el único sitio donde se leen**: la herramienta 💬 **Sugerencias
M.E.T.A.S** del Acceso Rápido (`js/tools/metas-sugerencias.js`, tabla en
`supabase/sql/metas_sugerencias.sql`).

Es el mismo reparto que el Buzón del lector: la pantalla pública vive en
M.E.T.A.S, que es lo que la gente puede abrir, y lo recogido cae en la
aplicación privada, que es donde se atiende. El otro extremo del cable
es `js/metas-sugerencias.js`, en el repositorio de M.E.T.A.S.

**Lo que entra aquí lo escribió alguien de la calle.** La puerta está
abierta a anónimos a propósito, y la clave publicable va en el código de
M.E.T.A.S, que lee cualquiera: mandar una fila a mano es trivial. Con
eso a la vista, **ningún dato de esta tabla se interpola dentro de un
atributo del HTML**. Una comilla en un `href="…"` cierra el atributo y
lo que siga se convierte en un `onmouseover` de verdad, que correría
DENTRO de F.A.R.O con la sesión de la familia puesta: la Bóveda, las
finanzas, el chat y los teléfonos del Buzón del lector. Y bastaría con
abrir la sugerencia para triarla.

Se para en tres sitios, y los tres hacen falta porque uno solo se
olvida: `msugEsc` escapa también la comilla (como ya hace `redEsc` en
Redacción), la dirección se comprueba con `msugEnlace` y se pone con
`setAttribute`, y **el servidor guarda en `url` solo lo que de verdad es
un camino**. La pantalla no puede fiarse de la base y la base no puede
fiarse de la pantalla.

**Tres reglas más, y ninguna es de adorno:**

1. **Va en el Acceso Rápido y con contador a la vista.** Este botón
   existía desde hacía años y sus mensajes no los leyó nadie nunca: se
   guardaban en el teléfono de quien escribía. Si ahora la bandeja hay
   que acordarse de abrirla, volvemos al mismo sitio con más código. La
   insignia se pinta con una consulta que **no baja ni una fila**, para
   que la portada no arrastre la bandeja entera al arrancar.
2. **Desde la bandeja se va a la misión de un toque.** La sugerencia
   trae la dirección exacta de su página. Sin ese enlace, arreglar una
   errata empieza por buscar la misión entre más de sesenta.
3. **Atender deja apuntado qué se hizo, y quién.** Dentro de un mes
   nadie se acuerda. Y lo atendido se puede devolver a pendientes: a
   veces el arreglo no era tal.

Quien escribe **no necesita identificarse** y muchas veces no lo hace.
Está bien: un «la pregunta 3 tiene mala la respuesta» sin firma vale
exactamente igual, y pedirle credenciales a un niño para avisar de una
errata mata el aviso.

**Antes de publicar un cambio de la bandeja:**

```
node _dev/servidor-estatico.js      (en otra terminal)
_dev/probe-metas-sugerencias.html   (en el navegador)
```

## Normativa: los videos de las misiones de M.E.T.A.S se ponen aquí

**Pedido por el autor el 28 de agosto de 2026**, estrenado en «Las
Fracciones» y con la intención dicha de llevarlo a las demás misiones.

Cada misión de M.E.T.A.S tiene una pestaña **🎬 Videos**. Lo que se ve
ahí sale de F.A.R.O: la herramienta 🎬 **Videos M.E.T.A.S** del Acceso
Rápido (`js/tools/metas-videos.js`, tabla en
`supabase/sql/metas_videos.sql`).

Es el **espejo exacto de las Sugerencias**, y por eso está pegada a
ellas en el Acceso Rápido: allí M.E.T.A.S escribe y aquí se lee; aquí se
escribe y M.E.T.A.S lee. Y no es solo simetría —una sugerencia que dice
«no entiendo esta parte» se contesta pegando un video, y tenerlas a un
toque una de otra cierra ese círculo.

**El alumno no puede poner videos, y eso NO lo decide una pantalla.**
Una comprobación en el navegador se salta con la consola en diez
segundos. Lo que lo sostiene es que con la clave publicable que va en el
código de M.E.T.A.S **no existe una puerta de escritura**: lo único que
se puede llamar es `metas_videos_publicos(mision)`, que lee lo
publicado. Escribir requiere sesión de la familia, aquí, y lo hace
cumplir la seguridad por fila.

**Ocho reglas, y ninguna es de adorno:**

1. ⚠️ **Por la base no viaja NUNCA una dirección: viajan once
   caracteres.** Ese dato acaba dentro del `src` de un `<iframe>` en la
   pantalla de un niño, que es el peor sitio del HTML donde puede acabar
   algo escrito por una persona. En vez de escapar mejor, se le quita al
   dato la capacidad de hacer daño: en `[A-Za-z0-9_-]` no hay comillas,
   ni espacios, ni dos puntos, ni barras, así que **`javascript:` no se
   puede ni escribir**. Lo comprueban tres sitios y los tres hacen falta:
   `mvidId()` aquí, el `check` de la columna `yt_id` allá, y `vmId()` en
   la pantalla de la misión.
2. **Un video nuevo nace SIN publicar.** Se guarda, se mira con
   👁 Comprobar y se publica después. Si naciera publicado, un alumno se
   lo encontraría a medio revisar.
3. **👁 Comprobar abre el MISMO reproductor que usará la misión**, con
   los mismos parámetros. Un ensayo con otro reproductor no prueba nada,
   y lo que se está probando es lo único que no se puede saber de otra
   forma: **si el dueño del video permite incrustarlo**. Un video que no
   se deja incrustar sale en la misión como un cuadro negro con «Ver en
   YouTube», que es exactamente lo que esa sección existe para evitar.
4. **Retirar NO borra la fila: la marca `oculto`.** Si el video está
   también escrito en el catálogo del repositorio de M.E.T.A.S, borrar
   la fila aquí lo dejaría vivo allá y seguiría en la pantalla del
   alumno. Con `oculto`, la puerta pública devuelve una lápida y la
   misión lo quita. Es la misma razón por la que la repisa de enlaces
   borra con lápida.
5. **Lo permanente sigue yendo al catálogo.** La nube pone los videos en
   los aparatos hoy; el catálogo (`js/data/videos-misiones.js`, en
   M.E.T.A.S) los deja escritos en el repositorio, con su historial y
   sin depender de que Supabase siga en pie. El botón 📋 escupe el bloque
   listo para pegar **en el chat**. Mismo reparto que el SQL, y por lo
   mismo: el autor trabaja desde la tableta.
6. **Las misiones salen del catálogo público de M.E.T.A.S, traído por
   la red, no de una lista escrita aquí.** Hoy son 57 y siguen entrando:
   una copia en este archivo estaría equivocada la semana que viene. Si
   no llega, se usa la guardada y, si tampoco, se escribe a mano.
7. **Recortar el video (`ini`/`fin`) es la defensa más barata contra los
   anuncios** y contra los minutos de careta del canal. Los anuncios NO
   se pueden quitar —no existe un parámetro de YouTube que lo haga— y la
   pantalla del alumno no lo finge: avisa de Brave, que es un **navegador**
   (no un buscador) que sí los bloquea.
8. **El `vid` nace en el aparato, no en la base.** El guardado se
   reintenta y sin un identificador propio el segundo intento dejaría un
   gemelo; y es la llave con la que la nube pisa al catálogo.

   ⚠️ **El orden se cambia ARRASTRANDO la tarjeta, no con flechas.**
   Pedido por el autor el 28 de agosto de 2026. Había dos flechas ↑ ↓ en
   cada fila y con diez videos en una misión poner el sexto en primer
   lugar eran **cinco toques y cinco repintados**, con la fila
   moviéndose bajo la vista entre uno y otro. Ahora es un gesto y se ve
   a dónde va mientras se hace.

   Con PUNTEROS, nunca con el `draggable` del navegador: ese es de ratón
   y en el navegador de casi ninguna tableta existe —y esto se usa desde
   la tableta—. Es el mismo aparato que mueve las tarjetas de la repisa
   de enlaces, con las mismas cuatro reglas:

   - **el asa sigue siendo un botón, y las flechas del teclado la
     mueven**: el arrastre de precisión en una tableta falla lo bastante
     como para que una función que solo se pueda usar arrastrando sea
     una función que a veces no existe;
   - **`touch-action: none` en el asa**, sin el cual el navegador se
     queda el gesto para desplazar la página y el arrastre no arranca;
   - **al soltar NO se repinta** (es la lección de la barra de grupos de
     M.E.T.A.S: repintar le arranca de debajo del dedo el elemento que
     iba a recibir el toque siguiente). Se numera 1, 2, 3… y **solo se
     escriben las filas cuyo número cambió**: cada escritura es un viaje
     a la nube y la señal es la de una tableta;
   - **se explica con palabras encima de la lista.** Las flechas se
     explicaban solas; un asa con puntos, no —y lo que se ordena tampoco
     es evidente: es la fila en que el alumno los ve dentro de la
     misión—.
9. **Las misiones se buscan por MATERIA, no en una lista plana.** Hoy son
   66 en 8 materias y siguen entrando: un desplegable plano son varios
   metros de barrido en una tableta. Van chips de materia con su cuenta
   —y un punto verde con cuántas ya tienen video, que es lo que enseña
   por dónde va el trabajo—, buscador, y el desplegable agrupado con
   `optgroup`. Las materias salen del catálogo, nunca de una lista
   escrita aquí. **El buscador entiende «sexto» además de «6º»**: en un
   teclado de tableta el símbolo de ordinal está escondido, y obligar a
   escribirlo es cerrarle el buscador a quien lo va a usar.

   Tres cosas de esa fila, y las tres salieron de usarla:

   - ⚠️ **«Sin video» es el segundo chip, y es el que de verdad se usa.**
     El trabajo del administrador no es «ver las de matemáticas»: es
     saber CUÁLES LE FALTAN. Sin ese filtro hay que abrir materia por
     materia contando puntos verdes.
   - ⚠️ **Los chips NO bajan de línea: se deslizan** (`flex-wrap:nowrap`
     y `overflow-x:auto`). Es la excepción a la regla del `flex-wrap`, y
     tiene motivo: con ocho materias más «Todas» y «Sin video»,
     envueltos ocupaban TRES renglones y empujaban el desplegable de la
     misión fuera de la pantalla, así que para elegir misión había que
     deslizar la página entera. No contradice la regla 8 de los juegos
     3D: allí lo que se salía eran botones de RESPONDER, que si no se
     ven no se puede seguir. El degradado del borde dice que hay más, y
     el chip tocado se trae a la vista solo.
   - **Si el catálogo no llega, se DICE**, con su botón de reintentar.
     Se trae por la red del sitio público de M.E.T.A.S y puede fallar;
     antes, en ese caso, no salía nada y el desplegable se quedaba vacío
     sin explicar por qué: parecía la herramienta rota.
10. **El quiz del propio video.** Hasta **diez** preguntas por video
   (eran tres hasta el 28 de agosto de 2026), con sus opciones y el
   círculo de la correcta PEGADO a cada una —un
   desplegable aparte de «cuál es la buena» se rellena mirando arriba y
   abajo, y ahí es donde se marca la que no era—. `ok` es el ÍNDICE,
   nunca el texto. Una pregunta a medias **no se guarda en silencio**: la
   pantalla lo dice, porque guardar lo que se acaba de tirar es la forma
   más rápida de que alguien crea que puso un quiz y no lo puso.
11. **Las preguntas se PEGAN de golpe, no se escriben campo por campo.**
   Tres preguntas con sus cuatro opciones son quince campos tocados de
   uno en uno en una tableta, y el texto casi nunca se inventa aquí: ya
   viene escrito con la forma de siempre («1.» la pregunta, «A) B) C) D)»
   las opciones). Se pega tal como venga —numeradas o no, con letra o con
   viñeta, con las rayas «---» de en medio— y el lector lo reparte.

   ⚠️ **Y si el texto no dice cuál es la correcta, NO se marca ninguna.**
   Es la regla que no se negocia. Dar por buena la A acierta una de cada
   cuatro veces, y un quiz publicado con la respuesta cambiada no lo
   descubre nadie hasta que un niño acierta y la pantalla le dice que
   falló. Sin marcar, la pregunta se ve en **ámbar**, lo dice con
   palabras y **el guardado se para** nombrando cuál falta. Si el texto
   sí lo dice —✅, negrita, «(correcta)», «Respuesta: C» o una lista
   final «Respuestas: 1-C, 2-A»— se marca sola.

   ⚠️ **El tope de preguntas vive en TRES sitios y los tres tienen que
   decir lo mismo:** `MVID_MAX_PREG` aquí, el `check` de
   `supabase/sql/metas_videos.sql` y el tope de `vmPreguntas` en
   M.E.T.A.S. Si uno se queda corto no salta ningún error: las de más se
   pierden por el camino —o rebotan con un mensaje de PostgreSQL que
   habla de un `check`— y se descubre mirando la pantalla de un niño.
   Subirlo obliga a **volver a correr el SQL a mano**, y por eso el
   archivo tira el tope y lo vuelve a poner en vez de añadirlo «si no
   existe»: con `if not exists`, re-correrlo diría «Success» y dejaría
   el número viejo. La comprobación del final del archivo lo enseña
   (`tope_preguntas`).

   Dos cosas más que salieron de pegar de verdad: las opciones son
   **cuatro y no tres** (el A) B) C) D) es la forma en que viene
   cualquier prueba, y con tres se perdía la D —que es la correcta una de
   cada cuatro veces—; la pantalla del alumno ya pintaba hasta cuatro),
   y el enunciado y las opciones son **recuadros que crecen**, porque lo
   siguiente que hay que hacer es leerlas para marcar la buena y dos
   opciones cortadas a los treinta caracteres se distinguen mal.

**Antes de publicar un cambio de los videos:**

```
node _dev/servidor-estatico.js      (en otra terminal)
_dev/probe-videos-metas.html        (en el navegador)
```

La comprobación **14** mueve una tarjeta **con eventos de puntero de
verdad**, no llamando por dentro a la función: lo que puede fallar ahí es
de pantalla —un asa que el dedo no alcanza, un `touch-action` que le
regala el gesto al desplazamiento, una fila que tapa a la de debajo—, y
nada de eso se ve llamando funciones. Es la misma lección que la sonda de
la barra de grupos de M.E.T.A.S. Para medir, abre la vista de verdad
(`switchView`) y enseña `#app-container`: con el panel escondido las
tarjetas miden 0×0 y la sonda aprobaría un arrastre que en la tableta no
funciona.

Y el SQL, contra un PostgreSQL de verdad, que es donde se ve si el
`check` muerde:

```
createdb videostest
psql -v ON_ERROR_STOP=1 -d videostest -f _dev/prueba-videos-sql.sql
```

## El mapa de rutas se explora por materia, no en lista

«Mis Rutas» agrupa las rutas **por materia**, y todo arranca **plegado**. Es
una decisión de escala, no de gusto: hoy son 38 rutas y 39 misiones y esto
solo crece; una lista plana de 38 tarjetas son varios metros de barrido
aunque cada una esté cerrada. Once materias plegadas caben en pantalla y
media.

Tres reglas que hay que respetar al tocar esa pantalla:

1. **Nada se abre solo.** El criterio viejo (abrir la ruta que ya tuviera una
   etapa construida) se pensó con cuatro rutas; con 38 significa abrir casi
   todo y devolver el problema.
2. **Una materia de una sola ruta abre directo sus etapas.** Diez de las once
   la tienen, y cobrarles un toque por un nivel que ahí no separa nada es
   peor que no agrupar. El nivel de en medio solo lo necesita el Estudio
   Mayor, con sus 28.
3. **Todo se pinta en el DOM y se esconde con `hidden`**, nunca se crea al
   abrir. Hay **38 sondas** que buscan las tarjetas de ruta en el documento
   para contar sus etapas: si el contenido naciera al desplegar, dejarían de
   encontrar nada sin que nadie hubiera roto la pantalla.

Y el buscador de esa pantalla mira materia, nombre de ruta, lema **y título
de cada etapa**: quien quiere estudiar algo se sabe el nombre del tema, no en
qué ruta cayó.

## Las sondas declaran su veredicto en el título

Cada sonda termina poniendo **APRUEBA** o **SUSPENDE** en `document.title`,
con el veredicto DELANTE (el rótulo viejo «SONDA-APRUEBA» ya se retiró).
No es decoración: es lo que se lee al correrlas en tanda. Once sondas
antiguas no lo hacían, y en la auditoría del 20 de agosto de 2026
aparecieron **veintinueve más**; hoy lo hacen las ochenta y cinco. La
única excepción es `probe-alto-util.html`, que no es una sonda sino un
instrumento de medida y se titula INSTRUMENTO. La cuenta no se escribe de
memoria (esta línea ya se quedó vieja una vez): sale de
`grep -L APRUEBA _dev/probe-*.html`, que tiene que devolver solo el
instrumento. Dos sondas
(`probe-tiempos-push-sesion` y `probe-verif-dosclientes-reales`) hablan
con el Supabase real y por eso SUSPENDEN en las sesiones de Claude Code,
donde el proxy bloquea `supabase.co`: en el aparato del autor aprueban.

Y las cuentas que dependen del catálogo **se sacan del catálogo**, no se
escriben a mano. Tres sondas de la Casa Cerrada esperaban una, dos y tres
etapas construidas; la ruta creció a cuatro y las tres suspendían sin que
hubiera nada roto.

## Qué misión se construye después: se nivela, no se profundiza

**Acordado con el autor el 20 de agosto de 2026.** El Estudio Mayor son 28
rutas y 177 etapas, y va muy desigual: cuando se fijó esta regla había 15
construidas, cinco de ellas en una sola ruta, y **21 de las 28 rutas en cero**.

La regla es: **la siguiente misión es la etapa 1 de una ruta que esté en cero**,
hasta que ninguna quede muerta en el mapa. Profundizar la ruta que ya va por la
quinta etapa cuesta lo mismo y deja el mapa igual de desequilibrado; abrir una
ruta nueva convierte una materia inexistente en una materia empezada.

Las cuentas **se sacan del catálogo**, nunca de memoria:

```
node -e "const fs=require('fs');const s=fs.readFileSync('js/data/misiones.js','utf8');
const g={};new Function('g','with(g){'+s+'; g.M=MISSIONS; g.R=RUTAS;}')(g);
Object.entries(g.R).filter(([k,r])=>r.color==='mayor')
  .map(([k,r])=>({k,m:r.materia,n:g.M.filter(x=>x.ruta===k).length,t:r.etapas}))
  .sort((a,b)=>a.n-b.n).forEach(f=>console.log(f.n+'/'+f.t, f.m, '|', f.k));"
```

Y **quien construya recomienda la siguiente** al terminar, con esa cuenta
delante y agrupando por afinidad: entre las que están en cero se prefiere la
que se apoya en lo ya construido (las falacias y la lógica del argumento se
sostienen sobre la toma de decisiones; la geopolítica y la economía política
dialogan con la crítica al capitalismo). Nivelar no es repartir al azar: es
abrir puertas que la casa ya puede cruzar.

## El taller de la memoria: aparato compartido, no copiado

**Pedido por el autor el 22 de agosto de 2026**, sobre la etapa 2 de la Ruta
del Expediente Dorado y con la intención dicha en voz alta de llevarlo
después a las cuarenta y dos misiones. Por eso vive en `js/taller-neuro.js`
y `css/taller-neuro.css`, y **no dentro de la misión**: es la cuarta
excepción de la casa a la norma 1 (tres archivos propios por misión), por el
mismo motivo que `js/lecturas.js`, el marcador y `fichas/css/ficha.css`. Un
aparato copiado a cuarenta misiones se arregla en una y se queda roto en
treinta y nueve.

Lo que pone: **XP variable** (la ruleta tarda un segundo a propósito: sin esa
espera no hay predicción que fallar, y sin predicción fallada no hay
dopamina), **cierre de cuaderno** (recordar con la caja cerrada, no releer),
**repaso espaciado** a 3 días, 2 semanas y 1 mes, **taller mezclado**
(práctica intercalada), **modo Feynman** con cazador de jerga, **espejo**
metacognitivo, **dificultad deseable** y el panel **Mi Taller**.

### Cómo se monta en una misión nueva

Tres cosas, y ninguna toca el aparato:

1. En el HTML, **después** del CSS de la misión (se tiñe del `--pri` y del
   `--sec` que la misión acaba de declarar, así que el orden importa):
   `<link rel="stylesheet" href="../../css/taller-neuro.css">`, y al final,
   **después** del JS de la misión y del marcador:
   `<script src="../../js/taller-neuro.js"></script>`.
2. Al final del JS de la misión, `window.TALLER_NEURO` con lo suyo: la clave
   de la misión, la jerga que hay que cazar, los doce casos del taller
   mezclado, las tarjetas de la etapa anterior que se intercalan y los
   párrafos que se tapan en modo difícil.
3. En el HTML, los bloques declarativos: `.cierre-cuaderno` con sus pautas
   en `data-pauta`, `.tn-feynman` con su ejemplo de la casa, los botones con
   `data-tn-despliega`, `data-tn-dificultad` y `data-tn-panel`, y un
   `<div id="tnMezcla">` donde se pinte el taller mezclado.

Y en el JS de la misión, cuatro ganchos: `ptsVar(base, motivo)` en cada sitio
donde antes se llamaba a `pts(base)`, la llamada a
`FaroTaller.alVoltearFlash` al voltear una tarjeta, la llamada a
`FaroTaller.alPintarQuiz` al pintar una pregunta, y
`tallerSegundosReto()` en vez del 30 escrito a mano del reto.

**El contenido no vive en el aparato.** Las pautas, los casos y los ejemplos
de la casa se escriben en cada misión y con su voz; el aparato solo les pone
el comportamiento. Un aparato con textos dentro sería el mismo texto en
cuarenta y dos misiones, que es lo contrario de lo que esta casa escribe.

**Y si el aparato no está, la misión sigue entera:** `ptsVar` cae en el `pts`
de siempre y el XP vuelve a ser fijo. Se comprueba con
`_dev/probe-taller-neuro.html`.

## La repisa de enlaces: lo que hace la máquina va etiquetado

**Pedido por el autor el 27 de agosto de 2026**, como piloto en la etapa 1 de
la Ruta del Hilo que Tira («La cadena y el hueco») y con la intención dicha de
replicarlo después. Vive en `js/recursos-enlaces.js` y `css/recursos-enlaces.css`:
es la **quinta excepción de la casa a la norma 1**, por el mismo motivo que
`js/lecturas.js`, el marcador, `fichas/css/ficha.css` y el taller de la
memoria.

Qué resuelve: el autor le da una misión entera a NotebookLM y la máquina le
devuelve resúmenes en audio, videos, mapas mentales y guías. Eso vivía en el
teléfono de quien lo generó, o sea que no existía para nadie más. Ahora vive
en la sección de Recursos de la misión que resume.

Cómo se monta y el formato completo de cada enlace están en la **norma 6-bis**
de `NORMAS-MISIONES-FARO.md`. Lo que hay que saber para no romperlo:

1. **La etiqueta de máquina no se apaga.** Es la regla de oro del Estudio
   Mayor: ninguna fuente entra sin su etiqueta. Un resumen automático es
   material de **repaso**, no una fuente, y puede equivocarse en un dato con
   el mismo tono seguro con el que dice los buenos. Colgarlo al lado de
   Forster sin distinguirlo, en una ruta que enseña a cazar fuentes infladas,
   sería el chiste malo.
2. **La dirección va dentro de un `href` de la misión, y la misión vive en el
   dominio de la Bóveda.** Por eso aquí no se arma HTML con datos, punto:
   todo con `createElement` y `textContent`, y la dirección comprobada con
   `URL()` (no con un grep: `java\tscript:` y `JavaScript:` pasan un grep
   ingenuo y el navegador los ejecuta igual). Solo `http` y `https`.
3. **La repisa VIAJA, y es de la casa.** Ampliación del mismo día: lo que se
   pega sube a `recursos_enlaces` y está en todos los aparatos donde haya
   F.A.R.O. Los cuatro ven todos los enlaces de una misión; quitar o corregir
   es solo de quien lo puso, y eso lo hace cumplir la seguridad por fila, no
   la pantalla. **El SQL hay que correrlo a mano**
   (`supabase/sql/recursos_enlaces.sql`, apuntado en `PLAN-FARO-PRIVADO.md`):
   hasta entonces la repisa funciona igual y **dice a la vista que no viaja**
   («📴 Solo en este aparato»), que es lo contrario de fingir que sí.
   El cliente es el único de la casa (`window.faroSb`) y se trae perezosamente,
   solo con sesión ya guardada, por lo mismo que el marcador.
4. **Y lo permanente sigue yendo al catálogo.** La nube lo pone en los
   aparatos de la casa hoy; el catálogo lo deja escrito en el repositorio y
   visible también para quien no entró por la puerta. El botón 📋 de cada
   tarjeta escupe el bloque listo para pegar **en el chat**, que es como se
   hace ese ascenso. Mismo reparto que el SQL de Supabase, y por la misma
   razón: el autor trabaja desde el teléfono, sin el repositorio delante.
5. **Las tres tarjetas de muestra se van solas** al entrar el primer enlace
   real. Si hubiera que acordarse de borrarlas, alguna misión se publicaría
   con tres tarjetas de mentira dentro.
6. **La clave del almacén es de cada misión.** Al copiar el molde se hereda, y
   dos misiones acabarían compartiendo repisa. La sonda de la misión lo mira.
7. **Se borra con lápida.** Si el aparato borrara la fila, la tableta que
   todavía tiene su copia la subiría otra vez y el enlace resucitaría solo.
8. **Las opciones de cada tipo viven en el aparato, no en la base.** La
   columna es un objeto libre (`opciones`, jsonb) y la lista de ajustes está
   en `RE_FACETAS`. Añadir un estilo tiene que ser una línea en un archivo, no
   una migración que alguien pega desde una tableta.
9. **El orden es de cada quien.** La seguridad por fila solo deja escribir la
   fila propia, así que un orden común de la casa es imposible sin poder
   escribir las filas ajenas. Lo tuyo viaja por la columna `orden`; lo que
   coloques de los demás se queda en ese aparato. Fingir lo contrario sería un
   arrastre que parece guardarse y no se guarda.
10. **El arrastre va con punteros, no con `draggable`**, que no funciona en el
    navegador de casi ningún teléfono. Y el asa mueve también con las flechas:
    en una tableta el arrastre de precisión falla lo bastante como para que
    una función que solo se puede usar arrastrando sea una función que a veces
    no existe.

**Antes de publicar un cambio de la repisa:**

```
node _dev/servidor-estatico.js         (en una terminal)
node _dev/postgrest-falso.js 8125      (en otra)
_dev/probe-recursos-enlaces.html       (la repisa, sin nube)
_dev/probe-recursos-enlaces-nube.html  (la repisa entre dos aparatos)
```

`_dev/postgrest-falso.js` sirve ahora DOS tablas (`lecturas_marcas` y
`recursos_enlaces`) y aplica las políticas de cada una, que no son las mismas:
las marcas son de cada quien y la repisa es de la casa. Un doble que las
tratara igual dejaría pasar justo el error que importa.

## El kit de escritura a mano: papel, y se mide en hojas

**Pedido por el autor el 22 de agosto de 2026**, después del taller de la
memoria: lo mismo, pero en papel, para quien estudia delante de la
computadora y quiere escribir a mano mientras lee. Son **ocho archivos** en
`misiones/…/imprimibles/` y una hoja compartida, `css/kit-mano.css`.

**No son fichas y la norma 6 no las toca.** Es el mismo permiso que ya
tienen las hojas sueltas de las lecturas: no viven en `fichas/`, no usan
`fichas/css/ficha.css`, no usan la clase `.pagina` y no se miden con
`_dev/mide-ficha-paginas.html`. Usan `.hoja` y su propio medidor.

**Y las hojas se MIDEN, no se calculan.** El alto útil de una carta con
15 mm de margen es 249,4 mm, pero el margen del primer bloque se suma **por
fuera** (la misma trampa que ya está escrita en `fichas/css/ficha.css`), así
que una hoja calculada a ojo sale partida en dos sin que nadie lo note hasta
que la imprime. Se comprueba con `_dev/probe-kit-mano.html`, que saca las
reglas de impresión **del propio `kit-mano.css`** y mide con ellas, en vez de
llevar una copia que se queda vieja.

Dos cosas que parecen detalle y no lo son:

1. **`print-color-adjust: exact` es obligatorio.** Los renglones se dibujan
   con degradados, o sea con fondos, y los navegadores quitan los fondos al
   imprimir. Sin esa línea el kit entero sale como preguntas sin renglones.
2. **El rótulo de hojas del bloque de Recursos tiene que decir la verdad.**
   La misión anuncia «3 hojas», «4 hojas»: si alguien parte una hoja y no
   toca el rótulo, la misión miente, y la sonda lo caza.

## Sellar la versión en cada cambio

El aparato guarda la aplicación en caché y se queda con la versión vieja.
En **todo** cambio de HTML, CSS o JS hay que subir `CACHE_NAME` en
`sw.js`. Si no se sella, el despliegue existe y nadie lo ve.

## Empujar no es publicar: se comprueba el despliegue

`git push` dice que el commit llegó al repositorio. **No dice que el
sitio lo esté sirviendo.** El 20 de agosto de 2026 se dio por publicado
un cambio que nadie podía ver: el push había ido bien y la construcción
de GitHub Pages para ese commit había fallado con un **500 del propio
GitHub** («Server error, is githubstatus.com reporting a Pages outage?
Please re-run the deployment at a later time»). El sitio siguió sirviendo
el commit anterior durante una hora, y el fallo lo encontró el autor
mirando el teléfono, no quien hizo el cambio.

La aplicación se sirve desde **GitHub Pages, rama `main` y raíz**, sin
archivo de flujo de trabajo propio: Pages construye sola en cada push.
Así que antes de decir que algo está publicado hay que mirar cómo quedó
esa construcción:

```
https://api.github.com/repos/<usuario>/<repo>/actions/runs
```

y comprobar que la ejecución llamada **`pages build and deployment`** con
el `head_sha` del commit está en `completed / success`. Sirve sin
credenciales porque el repositorio es público.

⚠️ **Y el service worker tiene que REVALIDAR, no solo «ir a la red
primero».** El 28 de agosto de 2026 F.A.R.O sirvió el HTML nuevo con el
JavaScript viejo: el rótulo MATERIA del filtro de videos salía y debajo
no había ni un chip. La rama de archivos propios de `sw.js` hacía
`fetch(event.request)` sin `{ cache: 'no-cache' }`, así que la petición
la seguía atendiendo la **caché HTTP del navegador** —hasta diez
minutos— y el service worker ni se enteraba.

Es el peor fallo de caché porque no lo parece: la pantalla enseña los
huecos de lo nuevo y el código que los llena es el de antes. M.E.T.A.S ya
tenía la línea con esta misma nota; aquí faltaba. Se delató por el texto
de un desplegable, que era el de la versión anterior.

⚠️ **Y hay que buscar el `head_sha`, no mirar la primera fila.** El 28
de agosto de 2026 el listado por omisión enseñaba `completed / success`
arriba del todo… del commit ANTERIOR. El nuevo no tenía ejecución
ninguna: Pages no la había encolado siquiera, quince minutos después del
push. Mirar la primera fila habría dado el cambio por publicado.

Y en la cola hay **zombis**: ejecuciones paradas del 3 de julio y del 6
de agosto en M.E.T.A.S, y la del 20 de agosto en F.A.R.O que cuenta el
párrafo de arriba. No estorban a las nuevas —no es que la cola esté
ocupada—, pero `?status=queued` las devuelve y confunden al que mire por
ahí buscando la suya.

La comprobación buena es esta, y devuelve algo solo si existe:

```
https://api.github.com/repos/<usuario>/<repo>/actions/runs?per_page=20
```
y buscar el `head_sha` del commit propio. Si no está, **no hay
construcción**, que no es lo mismo que una construcción fallida.

Cuando falle:

1. **Relanzarla** (`rerun_failed_jobs`). Un 500 de Pages suele ser
   pasajero.
2. Si el relanzamiento **se queda en cola sin arrancar**, está muerto: no
   se puede cancelar («Cannot cancel a workflow re-run that has not yet
   queued») y no va a arrancar solo. La salida es **empujar un commit
   nuevo**, que arranca una construcción limpia.

Y un aviso para quien lo compruebe desde una sesión de Claude Code: el
proxy de esas sesiones **bloquea `github.io` y `githubstatus.com`**, así
que el sitio en vivo no se puede pedir con `curl` desde ahí. `api.github.com`
sí responde, y por eso la comprobación va por la API.

## Comentarios en el código

En español, y explicando **por qué** está así, no qué hace la línea. Casi
todo comentario de este proyecto nace de un problema real; contarlo evita
que alguien lo «arregle» de vuelta al problema.

## Detalles del repositorio

- Sin framework ni compilación: HTML, CSS y JS planos que se sirven tal
  cual. La aplicación se publica en Cloudflare Pages, detrás de una puerta
  con contraseña (Cloudflare Access).
- **Un solo cliente de Supabase en toda la aplicación**, el de `js/auth.js`
  (`window.faroSb`). No se crea otro: la razón, larga y cara, está escrita
  en ese archivo.
- Para revisar en el navegador: `node _dev/servidor-estatico.js`
  (http://localhost:8124) y abrir las sondas de `_dev/`. Cada una termina
  poniendo **APRUEBA** o **SUSPENDE** en el título de la pestaña.
