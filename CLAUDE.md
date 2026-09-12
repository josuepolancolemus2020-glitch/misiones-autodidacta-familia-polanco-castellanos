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

⚠️ **Y esa comprobación va EN VERTICAL, una fila por cosa comprobada.**
El 29 de agosto de 2026 la de `criba.sql` devolvía una fila de ocho
columnas y en la tableta del autor solo se veían **cuatro**: las otras
cuatro —entre ellas las que dicen si la seguridad por fila y las
funciones quedaron puestas— caían fuera de pantalla. Una tabla se
desliza hacia abajo sola; hacia los lados, no. Una comprobación que no
se ve entera es media comprobación, y la mitad que se pierde es siempre
la del final.

⚠️ **Y ojo con contar filas de una tabla que puede no existir:**
PostgreSQL planifica la consulta ENTERA antes de ejecutarla, así que un
`select count(*) from public.lo_que_sea` revienta con «relation does not
exist» **aunque esté dentro de una rama del `case` que nunca se
ejecutaría**. O sea que la comprobación falla justo en el único caso
para el que existe, y deja el error que más despista. Se cuenta con
`query_to_xml('select count(*) …', false, true, '')`, que recibe la
consulta como TEXTO y solo la mira si se llega a ella. Hay un ejemplo
entero en `supabase/sql/criba_comprueba.sql`.

**Y conviene dejar la comprobación en su propio archivo**, aparte del
que crea las cosas: la fila del final sale una sola vez, al pegar, y si
se cierra el editor sin leerla no hay forma de saber si quedó. Volver a
pegar cuatrocientas líneas desde una tableta para leer una fila es una
factura absurda; veinte líneas que solo miran dicen lo mismo.

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

## Normativa: los gastos del día se apuntan desde el Apunte rápido

**Pedido por el autor el 9 de septiembre de 2026**: «que no se dé tantas
vueltas para tomar nota de los egresos e ingresos diarios… que se pueda
anotar los gastos por día, pero que el usuario no tenga tanta carga
cognitiva para hacerlo».

Antes, apuntar un gasto era: el «+», un modal con cuatro pestañas, un
desplegable para el tipo, otro para la categoría, otro para la cuenta, la
fecha, la descripción y «Guardar», que además cerraba el modal: el segundo
gasto del día volvía a empezar de cero. Seis campos para decir «pan, 30».

Ahora el «+» abre **el Apunte rápido** (`finAbrirApunte`, en
`js/finanzas.js`, hoja `#fin-q-overlay` en `index.html`): el monto arriba
con el teclado numérico ya puesto, la categoría de un toque, y la cuenta y
el día ya puestos. Guardar deja la hoja abierta para el siguiente. Desde la
portada, el Acceso Rápido «Apuntar gasto» llega ahí de un toque.

**Diez reglas, y ninguna es de adorno:**

1. ⚠️ **Lo que se sabe seguro se pide primero, y lo que se puede adivinar
   no se pide.** El monto es lo único que hay que escribir. La cuenta se
   recuerda de la última vez (`localStorage`, por contexto), el día es hoy
   y la descripción es opcional. Cada campo que se pide es una decisión, y
   una decisión por gasto son treinta al mes.
2. ⚠️ **La categoría es UN toque y NO se adivina.** Chips con emoji,
   ordenados por lo que más se usa —salen del historial (`_finHistCache`),
   no de una lista fija—. No viene ninguna marcada y **después de guardar
   se limpia**: una categoría que se queda puesta es un gasto mal archivado
   sin ningún error, y eso no lo descubre nadie hasta que las estadísticas
   mienten. Solo se marca sola cuando la descripción coincide con una de
   antes («pan» → 🍚 Alimentación, y se trae también su cuenta), y la
   pantalla lo dice («como la última vez»); si se sigue escribiendo y deja
   de coincidir («pantalón»), se desmarca. Una tocada a mano no se la pisa
   ninguna sugerencia.
3. ⚠️ **El monto escrito se devuelve entendido.** El campo acepta lo que
   sale de un teclado de tableta —«12,50», «1,234», «20+35+12» para la
   lista del mercado— y el botón lleva la cifra («Guardar gasto · L.
   67.00»); con coma o suma, debajo se dice cómo se leyó. «1,234» son mil
   doscientos treinta y cuatro (tres cifras justas tras la coma), no uno
   con veintitrés. Es la regla de la duración de El Rodaje: adivinar
   acierta la mitad de las veces y falla en silencio; enseñar acierta
   siempre.
4. ⚠️ **El foco va DENTRO del mismo toque que abre la hoja**, sin ningún
   `await` delante: es lo que hace que en una tableta salga el teclado
   solo. Lo que llega después (cuentas, historial) se repinta cuando llega,
   sin tocar el monto ni el foco.
5. **Guardar NO cierra la hoja.** Se limpian el monto, la descripción y la
   categoría; se quedan el tipo, el día y la cuenta; y el teclado sigue en
   el monto. Los gastos se apuntan en tanda, al final del día, y volver a
   abrir por cada uno es exactamente la vuelta que el autor pidió quitar.
6. **Lo apuntado del día se ve en la misma hoja, con su suma**, y el último
   de la sesión tiene «↶ Deshacer». Se ve lo que ya está sin salir, y un
   error se quita al momento en vez de buscarlo después en el historial.
7. **El día es un chip: Hoy · Ayer · 📅 Otro día.** Casi todo se apunta hoy
   o se apunta ayer lo de anoche; un selector de fecha para eso es abrir un
   calendario treinta veces al mes. El día elegido se queda mientras la
   hoja esté abierta, para apuntar de una vez todo lo de ayer.
8. **Con una sola cuenta, la cuenta no se pregunta.** Se usa y ya. Con
   varias, chips, con la de la última vez marcada. Sin ninguna, la hoja lo
   dice y ofrece crearla.
9. **Editar es la misma hoja.** Tocar un movimiento la abre con todo puesto
   y «Guardar cambios», y ahí sí se cierra al guardar. Un solo formulario
   para lo mismo: dos se arreglan en uno y se quedan rotos en el otro. El
   modal viejo queda para lo que no es diario —envío familiar, cuenta y
   deuda—, a un toque desde el pie de la hoja.
10. **La lista del panel va POR DÍA, con la suma de cada uno**, y la
    tarjeta de gastos del mes dice lo de hoy. Es lo que el autor pidió con
    «anotar los gastos por día»: verlos por día, no solo escribirlos. Los
    envíos entre cuentas no suman en ningún subtotal, y si el corte de
    filas se llenó, el día más viejo se descarta antes que enseñar un
    subtotal a medias.

11. ⚠️ **SE PUEDE DEJAR FIJADA, y es un interruptor, no el modo por
    defecto.** Ampliación del 9 de septiembre de 2026: «quisiera poder
    activarle que siempre se muestre en la pantalla». Encendido
    (`FIN_FIJO_KEY`), la hoja está puesta al entrar a Finanzas, al volver a
    encender la pantalla y al abrir la aplicación. Cuatro cosas que no se
    negocian:

    - **La ✕ sigue cerrando.** Una hoja fijada que no se pudiera cerrar
      dejaría el saldo y el historial detrás de una ventana que no se quita.
    - **La llave es del APARATO y global**, no de cada presupuesto ni de la
      nube. Es una costumbre de un teléfono: encenderla en el del autor no
      puede abrirle la hoja en la cara a quien solo entra a mirar el saldo, y
      no cambia al pasar de Familia a Escuela.
    - ⚠️ **Se vuelve con `visibilitychange`, nunca con `focus`.** En Android
      el `focus` salta también al abrirse el teclado: la hoja se reabriría
      sola en medio de escribir un monto. Y no se abre nunca por debajo de
      otra ventana ni estando en otra pantalla, porque entonces aparecería al
      cerrar la de arriba, que es el peor momento posible.
    - ⚠️ **Una dirección con `?view=` manda SIEMPRE.** Quien toca la
      notificación de un mensaje del chat quiere el chat; encontrarse las
      finanzas en su lugar es perder el mensaje que venía a leer. Lo vigila
      la comprobación 20 de la sonda.

    Y lo que NO puede hacer, porque ninguna página web puede: salir encima de
    la pantalla de bloqueo ni encenderse sola. Eso es de una aplicación
    nativa con permisos del sistema. Lo más cerca que se llega es esto —estar
    ya puesta al volver— más fijar la aplicación desde el propio Android.

Nada de la base llega a un atributo del HTML: todo con `createElement` y
`textContent`, como en las Sugerencias. Una descripción la escribe alguien
de la casa, pero la hoja vive en el mismo dominio que la Bóveda.

**Antes de publicar un cambio del Apunte rápido:**

```
node _dev/servidor-estatico.js      (en otra terminal)
_dev/probe-finanzas-apunte.html     (en el navegador)
```

La sonda mide los toques con el reloj —el monto, los chips y el botón con
la hoja abierta de verdad— y comprueba que guardar deja el foco en el
monto, que la categoría se limpia, que «1,234» no entra como uno con
veintitrés y que una descripción envenenada sale como texto.

## Normativa: los video-ensayos propios se dirigen desde El Rodaje

**Pedido por el autor el 7 de septiembre de 2026**, para sus video-ensayos
de diez minutos en adelante.

**NO es «Videos M.E.T.A.S», aunque las dos lleven claqueta y estén pegadas
en el Acceso Rápido.** Aquella publica videos AJENOS de YouTube para que un
alumno los vea dentro de su misión; esta escribe el video PROPIO: su
secuencia, su guion, su sonido y sus citas. Se parecen en el icono y en
nada más, y confundirlas es empezar a meter el guion en la tabla
equivocada.

Vive en `js/tools/rodaje.js` y `css/rodaje.css`, con cuatro tablas en
`supabase/sql/rodaje.sql` y su comprobación aparte en
`supabase/sql/rodaje_comprueba.sql`.

Qué resuelve: en un video-ensayo de catorce minutos, lo que se dice a
cámara son cuatro o cinco como mucho; el resto es material de apoyo,
música y rótulos. Eso, llevado en la cabeza o en un cuaderno, sale mal de
tres maneras concretas —se sale demasiado en cámara porque nadie está
midiendo; se mueve un bloque y todos los minutos escritos después pasan a
ser mentira; y se publica con una canción, un clip y tres imágenes sin
decir de dónde salieron—. Las tres las impide la forma de los datos, no la
buena memoria de nadie.

**Dieciocho reglas, y ninguna es de adorno:**

1. ⚠️ **NO SE GUARDA NUNCA EL MINUTO EN QUE EMPIEZA UN BLOQUE.** Se guarda
   cuánto DURA; el minuto de entrada lo suma `rodTiempos()` cada vez que se
   pinta y muere al terminar el pintado. Si estuviera guardado, meter veinte
   segundos en el medio dejaría equivocados todos los tiempos de abajo, sin
   error y sin aviso — y ese fallo no se descubre en la pantalla: se
   descubre grabando, con el guion en la mano. La prueba del SQL lo vigila:
   si alguien añadiera una columna `ini` a `rodaje_bloques`, revienta.
2. ⚠️ **LOS EFECTOS DE SONIDO Y LA MÚSICA CUELGAN DEL BLOQUE, NO DEL
   RELOJ.** Un golpe se guarda como «a los 4 segundos DE ESTE BLOQUE», no
   «en el 3:12». Por lo mismo que arriba: arrastrar el bloque a otro sitio
   se lleva sus señales con él y no hay nada más que tocar. La pestaña
   🔊 **Sonido** suma los dos números y enseña la lógica del audio del video
   entero en el orden en que suena, que es lo que el autor pidió ver y lo
   único que dice si el audio tiene sentido de principio a fin.
3. ⚠️ **LA CITA ES UNA FILA, NO UN TEXTO SUELTO.** Una película que sale en
   seis bloques se escribe UNA vez y los seis apuntan a ella. Así el rótulo
   que ve el espectador es el mismo las seis veces y la bibliografía no
   puede llevar dos versiones del mismo dato. Es lo que convierte «citar
   todo absolutamente» en algo que se puede cumplir sin acordarse.
4. ⚠️ **«GENERADO CON IA» NO ENTRA SIN DECIR CON QUÉ SE HIZO.** Las cinco
   clases `ia_` exigen `herramienta` («Google MusicFX», «Google Veo») y
   licencia `generado_ia`, y eso lo muerde un `check` de la base
   (`rodaje_fuentes_ia_declarada`), no una pantalla. Con el espejo puesto:
   `generado_ia` tampoco se le puede poner a un clip de película, que sería
   la puerta de atrás. Y el **prompt** se guarda porque es lo único que hace
   reproducible una pieza generada: es lo que separa «música: IA» —que no
   dice nada— de una cita.
5. ⚠️ **NO SE PUEDE PUBLICAR CON MATERIAL AJENO SIN FUENTE, Y LO PARA LA
   BASE.** El disparador `rodaje_guarda_citas` rechaza poner un proyecto en
   `publicado` mientras quede un bloque de clase `pelicula`, `ia`, `archivo`
   o `musica` sin fuente apuntada, o una fuente marcada para salir en
   pantalla sin rótulo escrito.
   ⚠️ **Y cuenta fuentes que EXISTEN, no elementos de la lista.** `fids` es
   texto dentro de un `jsonb` y ninguna llave ajena lo sostiene, así que un
   guardia que mirara `jsonb_array_length(fids) = 0` dejaría pasar un bloque
   cuyo único `fid` apunta a una fuente ya borrada: el video se publicaría
   «con cita» y la cita no llevaría a ninguna parte. La pantalla limpia los
   bloques al borrar una fuente, pero son dos escrituras separadas sobre la
   red de una tableta, y si la segunda no entra queda el hueco. Un guardia
   que se puede burlar sin querer no es un guardia. `rodRevisar()` mira lo
   mismo, con `rodFuente(x)`: si la pantalla dijera «se puede publicar» y la
   base lo rechazara, el autor se encontraría un error de PostgreSQL que
   habla de otra cosa. **Y el mensaje NOMBRA los bloques que
   faltan**: un «no se puede» a secas obliga a abrir cuarenta bloques uno
   por uno desde una tableta. Las clases `camara`, `grafico`, `pantalla` y
   `titulo` no exigen nada, porque pueden ser enteramente propias: exigir
   donde no toca enseña a rellenar por rellenar, y una casilla rellenada por
   rellenar es peor que una vacía.
6. **El rótulo de pantalla se ARMA, no se escribe.** `rodRotulo()` lo
   construye con los campos, con una forma por clase —una película y un
   artículo no se citan igual, y citarlos igual es no citarlos—. Se puede
   corregir a mano y hay un botón para volver al armado; lo que no puede es
   quedarse sin escribir. Se enseña mientras se escribe, con fondo oscuro y
   barra de color: con la misma pinta que va a tener encima del video.
7. ⚠️ **EL PRESUPUESTO DE CÁMARA SE VE EN TODAS LAS PESTAÑAS.** «Mi
   aparición en la cámara que solo se limite a expresar lo más importante.»
   Un número que solo sale al final llega cuando ya se grabó. Y son **DOS**
   topes: `cam_pct` (cuánto del video entero) y `cam_bloque` (cuánto puede
   durar UNA toma seguida). El segundo es el que de verdad muerde: un video
   con 25 % de cámara puede ser insoportable si ese 25 % es una parrafada de
   tres minutos y medio en el arranque.
8. **El guion se PEGA de golpe, no se escribe campo por campo.** Catorce
   minutos son treinta bloques, y treinta bloques a mano en una tableta son
   doscientos toques; además el texto casi nunca se inventa aquí. Se lee tal
   como venga —`[CÁMARA 0:30] Título`, `CLIP 3:45 — Título`,
   `## TOMA 1 (0:15) Título`— con las líneas `>` para lo demás.

   ⚠️ **Y una cabecera SIN corchetes necesita su duración.** Es la
   condición que separa una cabecera de la prosa, y sin ella el lector se
   comía el guion: cualquier línea que empezara por una de las palabras que
   nombran una clase —«veo», «yo», «texto», «escena», «clip», «toma»,
   «música»…, o sea media lengua— abría un bloque nuevo. Un párrafo de seis
   líneas entraba como **seis bloques vacíos con el texto convertido en
   títulos**: el guion no se perdía, se descuartizaba, que es peor porque
   parece que funcionó. La forma con corchetes es inequívoca y no necesita
   nada; una pelada necesita corroborarse de una de tres maneras: su
   **duración**, un **`##`** delante, o la palabra de clase **en
   MAYÚSCULAS** —que es como se escribe una cabecera y como no se escribe
   la prosa—.

   ⚠️ **Y las directivas se reconocen ANTES que las cabeceras.** Al revés,
   «Música: entra de fondo» —que es como se escribe sin acordarse del `>`—
   caía en la rama de la cabecera, porque «música» nombra una clase: en vez
   de poner la música del bloque abría un bloque nuevo titulado «entra de
   fondo». Lo mismo con `Rótulo:`, `Toma:` y `Texto:`.
   ⚠️ **Y lo que NO se entiende se queda como guion, nunca se coloca a la
   fuerza en otro campo**: ahí no se ve que está mal. Las citas escritas a
   mano en el texto se crean como fuentes SIN VERIFICAR en vez de perderse:
   ninguna se descarta y ninguna se inventa.
   ⚠️ **Y LAS ETIQUETAS SE ESCRIBEN COMO SE ESCRIBEN DE VERDAD.**
   Ampliación del 7 de septiembre de 2026, después de que el autor pegara
   su primer guion largo: «quiero que haya especificación más precisa de
   qué poner para que no rechace el sistema tanto lo que copio y pego».
   Un guion escrito de verdad no dice `rotulo:`; dice `TEXTO EN PANTALLA:`,
   `AUDIO (Tú - Voz en off):`, `BGM:` y `SONIDOS:`. Ahora:

   - **Una etiqueta puede ser de VARIAS PALABRAS** y llevar un paréntesis
     detrás. Con la tabla de una sola palabra, `TEXTO EN PANTALLA: …`
     entraba por la rama de la cabecera —«TEXTO» nombra una clase y venía
     en mayúsculas— y abría un bloque nuevo titulado «EN PANTALLA: …»:
     o sea que la forma en que la gente escribe era justo la que se
     descuartizaba.
   - ⚠️ **Una clave es SOLO letras y espacios**, y eso es lo que salva a
     las cabeceras. `## MÚSICA 0:30 Respiro` y `[TOMA 0:30] Título` también
     llevan dos puntos —dentro de su duración—; si al comparar se les
     quitaran los dígitos y el corchete, quedarían en «musica» y «toma» y
     se leerían como directivas: el bloque no se abriría y sus líneas se
     irían al anterior. `rodClaveEtiqueta` devuelve vacío en cuanto ve un
     dígito, una almohadilla o un corchete.
   - **`AUDIO:`, `VOZ EN OFF:` y `NARRACIÓN:` van al GUION**, y sin la
     etiqueta delante: leer «Audio:» en voz alta delante de la cámara
     sería el peor final posible.
   - ⚠️ **Lo que no se entiende se NOMBRA, con su número de renglón y con
     el nombre bueno al lado.** Nunca se rechazó nada —esas líneas se
     quedan en el guion, que es lo correcto— pero no se decía cuál ni por
     qué, y un rechazo silencioso se ve desde fuera igual que un rechazo.
     Solo se marca lo que INTENTABA ser una etiqueta (viñeta delante o
     rótulo en mayúsculas): si no, «Su mandamiento fue claro: …» saldría
     marcado y el aviso sería ruido.
   - **La lista que enseña la ventana sale de `ROD_ETIQUETAS`**, no
     escrita a mano en la pantalla. Es la misma regla que las materias de
     Videos M.E.T.A.S: una lista a mano estaría equivocada el día que
     alguien añada una palabra, y quien la lea se fiará. La sonda lo
     comprueba palabra por palabra (comprobación 5-ter).
   - **Y hay un botón «📄 Un ejemplo»** que rellena el recuadro con un
     guion que funciona y lo lee de una vez. Aprender editando algo que ya
     va cuesta un tercio que aprender leyendo cómo debería ser.

   ⚠️ Y en la cabecera **el tiempo se saca ANTES que el número de orden**.
   Al revés, «PELÍCULA 1:15 — La Llegada» perdía el 1 —el quitanúmeros se lo
   comía creyendo que era el «1.» de una lista— y el bloque entraba con 15
   segundos en vez de 75, desplazando todos los minutos de abajo sin dar
   ningún error.
9. ⚠️ **El orden se cambia ARRASTRANDO, con PUNTEROS.** Mismo aparato que la
   repisa de enlaces y los videos de M.E.T.A.S, y aquí importa más que en
   ninguna: mover un bloque cambia los minutos de todos los de abajo. Las
   mismas cuatro reglas: el asa sigue siendo un botón y **las flechas del
   teclado la mueven**; `touch-action: none` en el asa; **al soltar NO se
   repinta** la lista; y solo se escriben las filas cuyo número cambió.

   Y aquí hacen falta tres cosas más que en las otras dos, porque aquí la
   lista es de treinta y no de diez:

   - ⚠️ **Los relojes se REESCRIBEN aunque la lista no se repinte**
     (`rodRefrescarRelojes`, cambiando el texto de los nodos que ya
     existen). Sin eso, la columna de minutos se queda con el orden viejo,
     y esa columna es lo único que se mira para saber dónde cae cada cosa:
     una tarjeta que dice 3:10 cuando ya empieza en 0:15 es exactamente el
     fallo que toda la herramienta existe para impedir.
   - ⚠️ **La lista se desplaza sola en los bordes.** Sin eso, un bloque solo
     se puede mover lo que quepa en la pantalla: dos o tres puestos. La
     función existía y no servía para el caso para el que se hizo, que es
     peor que no tenerla —uno lo intenta, no funciona, y no vuelve a
     intentarlo—.
   - **El botón flotante de Destellos deja de recibir el puntero mientras
     dura el arrastre.** Vive en la esquina de abajo a la derecha, que es
     por donde pasa el dedo al llevar un bloque hacia el final, y se comía
     el gesto sin que se viera por qué.
   **Y la nota que lo explica va FUERA del contenedor que arrastra**, no
   dentro como en los videos de M.E.T.A.S: allí era un hijo que no era una
   fila y el aparato tuvo que aprender a saltárselo. Sacándola, esa clase de
   fallo deja de poder existir.
10. **El reel HEREDA las fuentes de su bloque.** Al elegir de qué bloque
    sale se marcan solas, y se traen también su guion y su título. No es un
    detalle: un corto que enseña tres segundos de una película necesita el
    mismo crédito que el video largo, y al corto lo ve mucha más gente.
11. ⚠️ **EL TELEPROMPTER LLEVA TAMBIÉN LA VOZ EN OFF, no solo lo que se
    dice a cámara.** Un video-ensayo es casi todo «yo hablando SOBRE
    material de archivo». Esa narración va en el `guion` de un bloque de
    clase `archivo` o `grafico` —que es lo correcto para el presupuesto,
    porque esos segundos no son cara hablando—, y la primera versión del
    teleprompter solo leía los de clase `camara`: o sea que el guion narrado
    se escribía, se guardaba, y no se ensayaba nunca. Ahora entra cualquier
    bloque con guion, y cada uno dice si se graba **🎤 A CÁMARA** o
    **🎙️ EN OFF** — leer en off una frase escrita para mirar al lente sale
    forzado, y al revés se nota más.
12. ⚠️ **LO ESCRITO SE MIDE EN PALABRAS, porque `dur` es una adivinanza.**
    Todo el presupuesto descansa sobre un número que una persona escribe a
    ojo, y a ojo se falla siempre por el mismo lado: un bloque con
    cuatrocientas palabras marcado como «0:45» miente, el porcentaje sale
    bonito y el video sale de veintiún minutos. `rodDurGuion()` cuenta a 150
    palabras por minuto —el ritmo de un ensayo hablado en español— y avisa
    en la propia fila y en la revisión. No pretende ser exacta; lo que tiene
    que hacer es cazar el «0:45» de un párrafo de tres minutos, que si no no
    se descubre hasta el montaje.
    ⚠️ **Y avisa en UN SOLO SENTIDO: cuando el texto NO CABE.** Que sobre
    tiempo es una decisión de dirección —un plano respirando sin nadie
    hablando encima— y no un error. La primera versión avisaba de las dos y
    llenaba el panel: ocho avisos de los que ninguno era un problema, y un
    panel lleno de avisos que no importan es un panel que no se lee. Por lo
    mismo, del panel salen **todos** los que PARAN, a la vista, y los que
    solo avisan van **plegados** detrás de su cuenta. Esconder detrás de un
    «y 4 más» justo el que impide publicar sería el peor recorte posible;
    pero dejar treinta avisos abiertos tapaba las pestañas y había que
    barrerlos enteros cada vez que se entraba — entre los treinta, los
    cuatro que sí paran dejaban de verse—. Un panel que no se lee no avisa
    de nada, y uno que tapa la herramienta la esconde.
13. **Nada de la base llega a un atributo del HTML.** Todo con
    `createElement` y `textContent`. Lo único que va a un atributo es una
    dirección, comprobada con `URL()` en `rodEnlace()` y puesta con
    `setAttribute` — no con un grep, que `java\tscript:` y `JavaScript:` lo
    pasan y el navegador los ejecuta igual. Esta aplicación tiene dentro la
    Bóveda, las finanzas, el chat y los teléfonos del Buzón.
14. ⚠️ **UN CORTE DE RED NO SE ENSEÑA COMO UNA SECUENCIA VACÍA.** El
    cliente de Supabase no lanza cuando la petición se cae: devuelve
    `{data: null, error}`. Sin mirar ese error, un corte dejaba la lista en
    cero y la pantalla decía «La secuencia está vacía» con un botón que
    invita a **pegar el guion**: o sea que el camino natural después de una
    mala señal era pegar los treinta bloques encima de los treinta que ya
    estaban. Y lo que hay en memoria **no se tira hasta saber que llegó lo
    nuevo** — solo al cambiar de video, donde sí hay que vaciar—. Lo mismo
    al abrir: `error.code === '42P01'` es «falta el SQL» y lo demás es la
    señal; decir lo primero cuando pasa lo segundo manda a pegar quinientas
    líneas en una base que ya las tiene.
15. **Aquí NO hay puerta pública, y es a propósito.** A diferencia de
    `metas_videos`, no existe ninguna función `security definer` ni política
    para `anon`: no hay nada que nadie de fuera tenga que leer. Con la clave
    publicable no se puede ni mirar la lista de proyectos. La prueba del SQL
    lo vigila: si aparece una `security definer` en `rodaje_*`, suspende.
    Y es **de la casa**, no de cada quien: un video se hace entre varios, y
    una secuencia que solo puede tocar quien la abrió convierte «arréglame
    esa frase» en «pásame tu sesión».

16. ⚠️ **ESTA PANTALLA ES OSCURA, Y NO ES UNA MANÍA DE ESTILO.**
    Rehecha el 7 de septiembre de 2026 porque el autor lo dijo con todas
    las letras: «la interfaz de lo que has realizado es sumamente
    horrible». Y tenía razón por un motivo que se puede escribir: aquí se
    juzgan **imágenes** —un fotograma de película, un rótulo blanco encima
    del video, un cartel de reel, el encuadre de la propia cara—, y sobre
    fondo blanco todo eso se ve más claro de lo que es y los rótulos
    parecen apagados. Es la razón por la que no existe un programa de
    montaje claro. Y se trabaja de noche con la luz apagada para grabar:
    una pantalla blanca a esa hora deslumbra y se refleja en las gafas
    dentro de la propia toma.

    ⚠️ **Se oscurece REDEFINIENDO LOS TOKENS de la aplicación dentro de
    `#view-rodaje`** y de los seis `id` de sus ventanas —que cuelgan del
    `body` y hay que nombrar una por una—, no copiando reglas. Así todo lo
    que hereda de `app.css` (`.fin-modal`, `.msug-vacio`, `.msug-det-head`)
    se pone oscuro solo, y cada arreglo futuro de `app.css` sigue
    llegando aquí. Copiando reglas, esta pantalla se iría quedando vieja
    sola. Y **no se toca ni un token de `:root`**: el resto de F.A.R.O es
    claro y sigue siéndolo. La barra de abajo vive fuera de la vista, así
    que `switchView` le pone `rod-sala` al `body` y se la quita al salir.

    ⚠️ **Y las franjas de color de clase (`.rod-borde-*`) van AL FINAL del
    archivo.** `.rod-card` y `.rod-mon-salto` declaran `border-left: … solid
    var(--border)` —el atajo, que incluye el color— y pesan lo mismo: a
    igualdad de peso gana la que vaya después. Con las franjas arriba, la
    secuencia entera se pintaba gris y llevaba así desde el primer día. No
    daba error, no rompía nada y el HTML estaba bien: es el mismo fallo del
    `var(--card)` de Videos M.E.T.A.S, y se caza igual —mirando el color
    **calculado**, comprobación 15—.

17. ⚠️ **EL MONITOR CORRE EL GUION; NO REPRODUCE NADA.**
    Pestaña 🖥️, pegada a la secuencia. Un 16:9 de verdad que recorre la
    secuencia en tiempo real y enseña qué habrá en pantalla en cada
    segundo: el bloque, la frase que se dice, el rótulo de la fuente en el
    sitio donde va a estar y un destello cuando cruza un golpe de sonido.
    Sirve para lo único que una lista no puede hacer: **oír la duración**.
    Un cartón de tres segundos que no da tiempo a leer, o una parrafada de
    cámara de dos minutos y medio en el arranque, se juzgan sintiéndolos
    pasar; en una tabla son «0:03» y «2:30» y los dos parecen razonables.

    - **El marco es 16:9 EXACTO y no se estira.** Un rótulo que aquí cabe
      y en el video no, no sirve para decidir nada. Lo que se recorta en un
      teléfono es el CONTENIDO, y por orden: la indicación de plano —que se
      lee entera en 🎞️ Secuencia—, después los renglones del rótulo y del
      texto. El título del bloque no se toca nunca.
    - **El rótulo y la frase se APILAN en una columna.** Sueltos se
      pisaban, y lo que quedaba ilegible eran justo las dos cosas que se
      venía a juzgar.
    - **Un bloque que necesita cita y no la tiene lo dice EN EL HUECO DEL
      RÓTULO, en rojo.** Es lo mismo que el disparador de la base no deja
      publicar, enseñado donde de verdad se nota.
    - **Las muescas de la pista salen de `rodSenales()`**, la misma
      función que pinta 🔊 Sonido. Con dos listas, una estaría mal algún
      día y sería la que menos se mira.
    - ⚠️ **Correrlo NO escribe `ini` en ninguna fila.** Es la regla 1
      vista desde otro sitio, y la sonda la vigila aquí también.
    - **El transporte y la velocidad van en DOS renglones.** En un
      teléfono de 320 px los siete mandos en una fila salían a 25 px, y
      estos se tocan mirando el monitor, no el botón.

18. ⚠️ **LA CÁMARA ES UN ESPEJO, Y NADA MÁS.**
    Pedida el 7 de septiembre de 2026 («ponle el espejo de la cámara en el
    teleprompter»). Está en el monitor —para ver el encuadre con la rejilla
    de tercios y el rótulo encima— y en el teleprompter, arriba y
    **centrada**: una ventanita en la esquina hace mirar a la esquina, que
    es el defecto que viene a arreglar.

    - **No graba, no sube nada y no guarda nada, y la pantalla lo dice** en
      verde y sin que nadie lo pregunte. Misma regla que el banco de
      cortes: a nadie se le ocurre por su cuenta que una página que
      enciende la cámara no esté haciendo algo con la imagen.
    - ⚠️ **Se pide `audio: false`.** Pedir el micrófono cambia lo que el
      navegador enseña al dar permiso, y esa frase es la que hace decir
      que no.
    - **Es UNA sola para toda la herramienta.** El monitor y el
      teleprompter cuelgan sus dos `<video>` del mismo flujo; con dos
      peticiones, el segundo se encuentra la cámara ocupada por el primero.
    - ⚠️ **Apagarla PARA LAS PISTAS.** Soltar el `<video>` no apaga nada:
      la luz del aparato se queda encendida detrás del chat o de las
      finanzas, y eso es lo que hace que alguien no vuelva a dar el permiso
      nunca. Se apaga al salir de la vista y en cuanto no la mira nadie.
    - **Va espejada.** Sin espejar, mover el hombro derecho se ve moverse
      al izquierdo y se acaba encuadrando al revés.

⚠️ **Y la descripción de YouTube no lleva dentro las notas del autor.**
Van encima de una raya (`copia de aquí para abajo`) y el botón copia solo
lo de debajo. Ese texto tiene un único destino —la descripción PÚBLICA de
un video— y un «⚠️ SIN VERIFICAR EN EL ORIGINAL» pegado al lado de una
fuente lo lee cualquiera: sería el propio autor declarando en público que
no comprobó sus fuentes.

⚠️ **Y la duración escrita se devuelve entendida, en voz alta.** En el
teclado de una tableta los dos puntos están escondidos, así que lo que se
escribe es «3» — y «3» son tres SEGUNDOS. No se adivina cuál de las dos
quería decir: debajo del campo sale «Se entiende 0:03 (3 segundos)».
Adivinar acierta la mitad de las veces y falla en silencio; enseñar
acierta siempre.

**Lo permanente sale por el chat**, igual que el SQL y que el catálogo de
los videos de M.E.T.A.S, y por lo mismo —el autor trabaja desde la tableta,
sin el repositorio ni el editor de video delante—. Son cuatro
exportaciones: el **plan de rodaje** (la secuencia con sus tiempos, su voz y
sus señales de sonido), los **rótulos de pantalla** (uno por línea, con su
minuto, para tenerlos al lado mientras se montan los cintillos), la
**descripción de YouTube** (agrupada, con lo generado por una máquina en su
propio apartado y el primero, con herramienta y prompt, y con los minutos en
que aparece cada fuente sacados de los bloques) y los **guiones de los
reels**.

### ✂️ El banco de cortes: de una grabación larga, un archivo por toma

**Pedido por el autor el 7 de septiembre de 2026**, al estrenar la
herramienta: «quiero que haya la opción de cortar alguna pista de audio o
video para después descargarlos y solo editarlos en otro programa con los
clip dados».

**El reparto que lo explica todo: la cámara es aparte.** Aquí NO se graba.
Se llega con la grabación hecha con la cámara de verdad, y lo que hace
falta es partirla en las tomas que la secuencia ya tiene escritas —porque
el montaje no empieza por editar: empieza por buscar en catorce minutos
dónde estaba cada frase—. La lista de tomas es la misma de 🎞️ Secuencia,
así que no hay que acordarse de nada ni escribirla dos veces.

Vive en **`js/tools/rodaje-cortes.js`**, aparte de `rodaje.js`, y eso no es
manía de ordenar: `rodaje.js` no toca ni un aparato del navegador —pinta,
suma y guarda—, mientras que esto toca `AudioContext`, `MediaRecorder`,
`captureStream` y descargas, y cada uno falla de una manera distinta en
cada aparato. **Si el banco no carga, El Rodaje sigue entero**: la pestaña
lo dice y ya. La sonda lo comprueba apagándolo a propósito.

**Cinco reglas más, y ninguna es de adorno:**

1. ⚠️ **EL ARCHIVO NO SALE DEL APARATO, Y LA PANTALLA LO DICE.** No sube a
   Supabase, no pasa por ninguna red y no se guarda en ningún sitio. Se
   dice en verde y sin que nadie lo pregunte, porque **a nadie se le
   ocurre por su cuenta que un sitio web NO sube el archivo que le das**, y
   una grabación de catorce minutos subiendo sin avisar por la conexión de
   una tableta sería una factura de datos y de tiempo que nadie pidió.
2. ⚠️ **EL AUDIO SE CORTA EXACTO; EL VIDEO SE REPROCESA.** No es una
   decisión: en un navegador el audio se decodifica entero a muestras y se
   corta por la muestra que uno quiera —sale un WAV, sin pérdida y al
   instante—, pero el video no se puede recortar sin volver a codificarlo.
   Se hace reproduciendo el trozo y grabándolo, o sea que **tarda lo que
   dura el trozo, suena, y pierde algo de calidad**. Se dice ANTES, en el
   propio botón, no después.
3. ⚠️ **Y PASE LO QUE PASE, SALEN LOS TIEMPOS.** Aunque el aparato no
   pueda cortar nada. El autor edita en otro programa, y ese programa
   corta mejor que cualquier navegador: sin pérdida y al instante. Una
   lista de entradas y salidas exactas —y las órdenes de `ffmpeg` ya
   escritas— vale más que un recorte reprocesado. Es la salida que no
   depende de nada, y por eso la pestaña dice lo que este navegador puede
   y lo que no **antes** de que nadie marque cuarenta entradas: en el
   Safari de un iPad no existe `captureStream` y el video no se puede
   cortar de ninguna manera.
   Los tiempos van en `00:02:05.500`, **con horas siempre y con
   milésimas**: un «2:05» pegado en un programa de montaje se lee como dos
   horas en unos y como dos minutos en otros, y esa ambigüedad se paga
   cortando mal.
4. **Las marcas se guardan en el APARATO, no en la nube, y con la firma
   del archivo** (nombre y tamaño). Van con el archivo, y el archivo es de
   este aparato: subirlas sería prometer en la tableta las marcas de una
   grabación que allí no está. Y con la firma porque la misma secuencia se
   corta de dos grabaciones —la buena y la repetida—: mezclar las marcas de
   una con la otra saca los trozos equivocados sin avisar de nada.
5. **El reproductor no se destruye al cambiar de pestaña.** Se guarda el
   nodo y se vuelve a colgar. Creándolo de nuevo en cada pintado, mirar las
   Citas un momento perdería el archivo abierto — y volver a buscarlo en una
   tableta son cinco toques y la carpeta equivocada dos veces.

Dos detalles que salieron de medirlo, no de pensarlo: el clip sale con **el
número de orden delante** (`01 - La flecha rota.wav`), para que los clips se
ordenen solos en la carpeta y entren al montaje en la fila del video; y el
mando de transporte **no baja de línea** —envuelto, el botón de +5 s caía
justo debajo del botón flotante de Destellos, que se lo comía—, así que por
debajo de 400 px se retiran los saltos de ±5 s, que son los únicos que se
pueden hacer de otra manera arrastrando el deslizador. Los de una décima no
tienen sustituto: cortar en el segundo entero se come la primera sílaba.

**Antes de publicar un cambio de El Rodaje:**

```
node _dev/servidor-estatico.js      (en otra terminal)
_dev/probe-rodaje.html              (en el navegador)
_dev/probe-rodaje-cortes.html       (el banco de cortes)
```

La sonda de los cortes **fabrica un WAV de verdad dentro del navegador** y
lo corta: es la única manera de comprobar que el corte cae donde se dijo, y
se comprueba contando los BYTES del archivo que sale. Si estuviera corrido,
lo que llega al montaje está corrido y no se descubre hasta ahí. También
mide el mando con el reloj en la mano —una fila, 44 px— porque eso es de
pantalla y de pantalla no se sabe nada leyendo el código.

La comprobación **5-bis** le pega un párrafo entero de prosa que empieza
por siete palabras de clase distintas, y exige que salga UN bloque con sus
siete líneas dentro: es el fallo más caro que tuvo el lector y el que menos
se ve, porque descuartizar un guion parece haber funcionado.

La comprobación **8** mueve un bloque **con eventos de puntero de verdad**,
no llamando por dentro a la función: lo que puede fallar ahí es de pantalla
—un asa que el dedo no alcanza, un `touch-action` que le regala el gesto al
desplazamiento— y nada de eso se ve llamando funciones. Y comprueba lo que
justifica la regla 2: que el golpe de sonido del bloque movido suene en su
sitio nuevo sin haber tocado nada. Para medir, abre la vista de verdad
(`switchView`) y enseña `#app-container`: con el panel escondido las
tarjetas miden 0×0 y la sonda aprobaría un arrastre que en la tableta no
funciona.

Y el SQL, contra un PostgreSQL de verdad, que es donde se ve si el `check`
muerde y si el guardia de las citas para:

```
createdb rodajetest
psql -v ON_ERROR_STOP=1 -d rodajetest -f _dev/prueba-rodaje-sql.sql
```

⚠️ Esa prueba **reparte los permisos de tabla como los reparte Supabase**
(`grant all` a `anon` y `authenticated` sobre todo `public`) antes de probar
la puerta. Sin esa línea aprobaría por el motivo equivocado —rebotaría por
falta de permiso de tabla— y no habría probado la seguridad por fila, que es
lo único que de verdad guarda esto en la base de verdad.

## Normativa: los textos de encargo se leen en La Voz Prestada

**Pedido por el autor el 10 de septiembre de 2026:** «necesito una nueva
herramienta para poder leer como en formato epub, algunos cuentos que le pido a
esta IA que me redacte con las voces de otros escritores». **Y ampliado ese
mismo día:** que sirva, «lo más profesional» posible, para leer en línea con
ese formato cuentos, ensayos y textos importantes «de diferentes géneros».
**Y otra vez ese día, después de probarla en el teléfono:** «hace falta poder
seleccionar texto para remarcarlo según el código de colores que está en las
lecturas de las misiones», «el cuento de muestra no se puede eliminar», «no
aparece leer deslizando para abajo», «no está leer con la simulación que pase
la página… tal como un libro», y «ver los libros en cuadrícula, en lista, en
detalle y poder moverlos, hacer una clasificación por voces de autores». Son
las reglas 21 a 25.

Vive en `js/tools/voz-prestada.js` y `css/voz-prestada.css`, con su tabla en
`supabase/sql/voz_prestada.sql` y la comprobación aparte en
`supabase/sql/voz_prestada_comprueba.sql`. Va en el Acceso Rápido **pegada a
Redacción**: allí se escribe lo propio y aquí se lee lo que escribió una
máquina con la voz de otro. Y no es lo mismo, que es justo lo que esta
herramienta se pasa el día recordando.

**NO es Redacción y NO es la repisa de enlaces**, aunque las tres guarden
texto. Redacción escribe lo de la casa; la repisa cuelga material de repaso
dentro de una misión; esta guarda **piezas escritas por una máquina imitando
una voz ajena** —cuentos, ensayos, poemas, cartas, discursos—, que es un objeto
con un problema propio y por eso tiene herramienta propia.

Qué resuelve: un texto de encargo vivía dentro de una ventana de chat, o sea
que a los tres días no existía —no se encontraba, no se sabía por dónde iba uno
y no había forma de leerlo sin perder el sitio en cada arranque—. Y traía un
segundo problema, más caro y más lento de aparecer, que es el que manda en todo
el diseño.

**Treinta y dos reglas, y ninguna es de adorno:**

1. ⚠️ **LA ETIQUETA NO SE APAGA, Y ES LA HERRAMIENTA ENTERA.**
   Un cuento escrito por una máquina «al modo de» Rulfo **no es de Rulfo**.
   Leído seis meses después en una tableta, sin la ventana del chat alrededor,
   **no hay absolutamente nada que lo distinga de uno que sí lo fuera**: así
   nace una atribución falsa, sin mala fe y por olvido. Y cuanto mejor le sale
   a la máquina, más falta hace la etiqueta.

   Por eso `voz` (a quién se imita) y `maquina` (qué lo escribió) viajan
   pegadas al texto **en cuatro sitios, y los cuatro hacen falta**: la ficha
   del anaquel, la **portada** —que es la primera página de todo texto y no se
   puede quitar—, el pie de todas las páginas, y **dentro de lo que copia el
   botón 📋 y de lo que manda el botón 📤 de compartir**. No existe ningún botón
   que saque el texto pelado. La portada dice además el género con su nombre
   («Ensayo escrito por Claude.»), para que un ensayo no salga rotulado como
   cuento.

   Es la regla de oro del Estudio Mayor («ninguna fuente entra sin su
   etiqueta») y la de la repisa («lo que hace la máquina va etiquetado»),
   aplicadas donde más falta hacen: aquí el material no es un resumen que se
   nota automático a la tercera línea, es prosa que imita a un escritor a
   propósito. **Y el nombre de la herramienta es el recordatorio**: se llama
   así para que no se pueda abrir sin acordarse.

   ⚠️ **Y lo para la BASE, no una pantalla.** El `check`
   `voz_prestada_etiqueta` exige las dos, en el `insert` **y en el `update`**:
   sin lo segundo la regla se saltaría guardando bien y vaciando el campo
   después, que es el camino que de verdad tomaría alguien con prisa. Es el
   equivalente exacto de `rodaje_fuentes_ia_declarada`. La pantalla también lo
   para, y **nombra lo que falta**: un «no se puede» a secas obliga a mirar
   cinco campos desde una tableta.

2. ⚠️ **EL COPIADO LLEVA LA ETIQUETA DENTRO, Y ESO ES EL REVÉS EXACTO DE LA
   REGLA DE EL RODAJE.** Allí las notas del autor van encima de una raya y el
   botón copia solo lo de debajo, porque ese texto tiene un único destino —la
   descripción pública de un video— y una nota interna pegada ahí sería el
   autor confesando en público lo que no comprobó. Aquí el destino es
   cualquiera: otro chat, un correo, la carpeta de alguien, WhatsApp desde la
   hoja de compartir. Y por eso mismo la etiqueta tiene que ir **delante y
   dentro**: un texto que sale de aquí sin ella es, a partir del siguiente
   reenvío, un texto atribuido a esa persona. Quien conozca la regla de El
   Rodaje va a querer «arreglar» esta al revés; está escrito en el código para
   que no lo haga.

3. ⚠️ **EL TEXTO SE PEGA DE GOLPE, Y LO QUE NO SE ENTIENDE SE QUEDA COMO
   PROSA.** Misma regla que el guion de El Rodaje y las preguntas de los
   videos, y por lo mismo: el texto ya viene escrito en otra ventana y
   trocearlo a mano en una tableta son doscientos toques.

   ⚠️ **Y aquí la asimetría manda sobre todas las expresiones regulares del
   archivo, así que va escrita antes de tocar ninguna:**

   > equivocarse hacia «esto es prosa» cuesta un índice;
   > equivocarse hacia «esto es un título» **PARTE EL TEXTO**.

   Lo primero se arregla leyendo —el texto se lee igual de bien de corrido—.
   Lo segundo mete un salto de página en mitad de una frase **y parece que
   funcionó**: sale su índice, salen sus páginas, todo. Solo se descubre
   leyendo el texto entero, que es cuando ya no se está mirando la
   herramienta. Es el fallo del lector de guiones de El Rodaje, mordiendo el
   doble.

   Por eso una línea pelada solo asciende a cabecera si se corrobora —la
   palabra «Capítulo» con su número u ordinal, un número o un romano **a
   solas o con su título corto** («I. El pozo»), un rótulo **EN MAYÚSCULAS**,
   o una **negrita sola, corta y sin punto final**—, y casi siempre tiene que
   estar sola entre blancos. Las almohadillas (`##`) son inequívocas y no
   necesitan nada. Ante la duda, prosa: siempre.

   **Lo que entiende, porque es lo que una máquina escribe de verdad**, y se
   añadió el 10 de septiembre de 2026 al abrir la herramienta a los ensayos:
   `> cita` para las citas (y una cita antes del primer capítulo es el
   **epígrafe**, que va en su propia página entre la portada y el capítulo
   uno, como en un libro); `- `, `* `, `• ` y `1. ` para las **listas**; `###`
   para los **subtítulos** de dentro de un capítulo; `---` arriba y abajo de
   las etiquetas como cerca de cabecera y no como salto de escena; **«FIN»**
   a solas como marca del final y no como un capítulo con cero párrafos; y la
   **primera línea pelada como título si debajo vienen las etiquetas**.
   ⚠️ **El nivel de almohadilla más alto que use el texto es el de
   capítulo**, y lo más hondo es subtítulo: un ensayo con `##` secciones y
   `###` subsecciones no sale con veinte capítulos. Y un `###` suelto en un
   texto que trae sus capítulos pelados («Capítulo 1:», «II») es subtítulo,
   no capítulo. **Dos negritas en serie son dos capítulos**; una sola, sin
   nada delante, es el título: un título es único y los capítulos vienen en
   serie (`vozHaySiguienteIgual`).
   ⚠️ **Y con varios capítulos y sin título, el título se queda vacío y la
   hoja lo pide**: ponerle al libro el nombre de su primer capítulo sin
   decirlo se descubre a los seis meses. Con un solo capítulo que sí lo
   traiga, ese es el título y se le quita al capítulo para que no salga dos
   veces.

   ⚠️ **LOS VERSOS SON LA ÚNICA EXCEPCIÓN A LA ASIMETRÍA, Y POR UN MOTIVO
   CONCRETO: JUNTARLOS DESTRUYE EL POEMA SIN AVISAR Y SIN VUELTA ATRÁS**,
   porque el texto crudo no se guarda. Tres o más renglones cortos seguidos se
   quedan con sus saltos (`vozParecenVersos`); si eran prosa a un renglón por
   frase salen feos pero enteros, y se arreglan desde ✏️. Lo que separa una
   cosa de otra es el punto: renglones que son **frases** —casi todos acaban
   en punto y no son brevísimos— son prosa; la sonda lo vigila con el mismo
   párrafo de siete renglones de la comprobación 2. Un `Género: poema` y el
   interruptor «Respetar los saltos de línea» fuerzan los versos en todo el
   texto, hasta con renglones largos.

4. ⚠️ **Y LAS ETIQUETAS SE MIRAN ANTES QUE LAS CABECERAS.** Al revés, «Nota:
   se escribió de un tirón» —que es como se escribe sin acordarse de nada—
   caería en la rama de las mayúsculas y abriría un capítulo fantasma. Misma
   lección que las directivas de El Rodaje.
   ⚠️ **Y una clave es SOLO letras y espacios**: `## Capítulo 1: La casa`
   también lleva dos puntos, y si al comparar se le quitaran la almohadilla y
   el dígito quedaría en «capitulo» y se leería como etiqueta —el capítulo no
   se abriría y sus líneas se irían al anterior—. `vozClaveEtiqueta` devuelve
   vacío en cuanto ve un dígito, una almohadilla o un corchete.
   **Las etiquetas solo valen ARRIBA**, hasta el primer párrafo de prosa, para
   que un «Nota:» dicho por un personaje no se salga del cuento. Valen también
   con viñeta delante (`- **Voz:** Rulfo`), que es como las escribe una
   máquina que hace listas de todo, y `Género:` es una de ellas.
   ⚠️ **Y lo que intentaba ser una etiqueta y no se entendió se NOMBRA**, con
   su renglón, y se queda dentro del texto: un rechazo callado se ve desde
   fuera igual que un rechazo, y el autor vuelve a pegar. Solo se marca lo que
   lo intentaba: un rótulo en mayúsculas, o una o dos palabras con dos puntos
   **entre otras etiquetas que sí se entendieron**; una frase de la prosa con
   dos puntos no.
   La lista de etiquetas sale de `VOZ_ETIQUETAS`, **nunca escrita a mano en la
   ventana de ayuda**: una copia estaría equivocada el día que alguien añada
   una palabra, y quien la lea se fiará. La sonda la comprueba una por una.

5. ⚠️ **SE PAGINA DE VERDAD, CON COLUMNAS, Y NO ES UN ADORNO.** El texto lleva
   columnas del ancho exacto de la página, así que el navegador lo reparte en
   páginas y se avanza moviendo `scrollLeft`. Es el aparato de los lectores de
   epub y es del navegador: no hay que medir renglones ni cortar palabras.
   Hace falta por dos cosas concretas: en una tableta, un texto que se desplaza
   **pierde el sitio** cada vez que cambia el alto de la ventana —al salir el
   teclado, al esconderse la barra, al girar—; y «te quedan cuatro páginas» es
   lo único que le dice a alguien si termina el capítulo antes de dormirse.

   ⚠️ **LA ÚLTIMA PÁGINA SALÍA CORRIDA, Y COSTÓ VERLO.** La primera versión
   ponía los márgenes como `padding` de la caja y dejaba que las columnas se
   salieran de `#voz-texto` por la derecha. El navegador NO cuenta el margen
   derecho detrás de una columna que se sale, así que el desplazamiento máximo
   se quedaba corto en lo que medía el margen: **la última página de todos los
   capítulos** salía movida a la derecha con la cola de la anterior asomando
   por el borde izquierdo. El número de página era correcto, el texto era el
   mismo; solo estaba mal puesto, y solo en la última, que es la que la sonda
   no medía. Ahora `#voz-hoja` es un `flex` con dos hijos: el texto, al que
   `vozPaginar()` le pone un **ancho explícito** igual a todas sus páginas
   juntas (medidas en una primera pasada), y una **cola** (`#voz-cola`) del
   ancho del margen. Así el desplazamiento cubre exactamente lo que hay, sin
   depender de cómo cuente cada navegador el relleno de la derecha. La
   comprobación **6** mide el margen del texto en la primera página, en dos de
   en medio **y en la última**, y que el desplazamiento llega justo.

   **En pantalla ancha, dos páginas como un libro abierto.** En «Auto», a
   partir de 860 px de caja el texto va a dos columnas por página (el paso
   sigue siendo el ancho de la caja más el canal, así que nada más cambia), y
   el ajuste «Páginas» permite forzar una o dos. Un renglón de treinta
   palabras se pierde al volver al margen: es la razón por la que los libros
   no se imprimen a lo ancho de un monitor. Comprobación **19**.

6. ⚠️ **LA POSICIÓN SE GUARDA POR PÁRRAFO Y FRACCIÓN, NUNCA POR NÚMERO DE
   PÁGINA.** Es la regla que parece de más y es la que sostiene la anterior.
   El número de páginas depende del tamaño de letra, del ancho de la pantalla
   y de si el aparato está de pie o acostado: guardar «iba por la página 12» y
   volver con la letra un punto más grande deja al lector **en otra frase**. Y
   **no da ningún error**: la aplicación abre, la página existe, el texto es
   del mismo cuento. Es la misma familia que el minuto guardado de El Rodaje
   —un número correcto que deja de serlo cuando cambia lo de al lado—.

   ⚠️ **Y LA FRACCIÓN HACE FALTA POR LOS ENSAYOS.** Un párrafo de página y
   media con la letra grande deja páginas enteras sin ningún párrafo que
   empiece en ellas; con solo el índice, la posición guardada sería «el
   párrafo siguiente» y al volver se saltaría media página de lectura, sin
   error. Se guarda el último bloque que empieza en la página o antes, y **en
   qué parte de él va uno** (`sub`), medido con sus fragmentos
   (`getClientRects`, uno por columna). La fracción apunta al **centro** de la
   porción vista —en la segunda página de un párrafo de tres vale 0,5—, para
   que `floor(fracción × páginas)` caiga en la misma página aunque la fracción
   se haya redondeado, y en la proporcional si el párrafo ahora ocupa más.
   Comprobación **7**: se va a una página en mitad de un párrafo, se cierra la
   sala y al volver a abrir cae en esa misma página.

   ⚠️ **Y el párrafo se RECUERDA al pasar página, no se mide al repaginar.**
   Medirlo en el momento de repaginar da el párrafo equivocado **siempre**,
   porque para entonces la caja ya cambió y las posiciones que se leen son las
   nuevas mientras el desplazamiento todavía es el viejo: la función que existe
   para no perder el sitio sería la que lo pierde. Por lo mismo, la referencia
   es la página en que estamos y **no `scrollLeft`**, que durante el
   desplazamiento suave todavía enseña de dónde veníamos.

   **La última página del último capítulo se apunta como «leído»** (`fin`),
   y el avance de la ficha y de la barra se calcula sobre las palabras de
   verdad del cuerpo, no sobre la columna `palabras`: un texto con esa
   columna descuadrada salía al 107 % y se archivaba como leído a medias. La
   barra de la sala es del texto **entero**, con una muesca donde empieza
   cada capítulo, y el pie dice cuánto queda en minutos.

7. ⚠️ **EL PASO DE PÁGINA MUEVE `scrollLeft` A PELO; LO SUAVE LO PONE EL CSS.**
   `scrollTo({behavior:'smooth'})` no existe en los Safari anteriores a 2022 y
   allí **no da error: sencillamente no pasa la página**. Un lector que no pasa
   página en la tableta de alguien es un lector roto, y roto en silencio. Con
   `scroll-behavior` en la hoja, el navegador que no lo conozca pasa la página
   de golpe: peor que suave y muchísimo mejor que nada.

8. **El toque en el borde pasa página y el del centro apaga los mandos, pero
   NO es la única forma:** hay dos botones a la vista en el pie, las flechas
   del teclado (y espacio, inicio y fin) y **la rueda del ratón** funcionan.
   Misma regla que el asa de arrastre de la repisa: un gesto que sea la única
   manera de hacer algo es algo que a veces no se puede hacer —con el dedo
   mojado, con funda, con la mano llena—.
   ⚠️ **El centro NO es una zona encima del texto: es la propia hoja.** Las
   zonas de los bordes cogen el puntero y el contenedor no (`pointer-events:
   none`), así que una frase se puede seleccionar y copiar, que es lo primero
   que se hace con un ensayo. Y un arrastre **con texto seleccionado no pasa
   página**: quien está copiando no quiere que la página se le vaya de debajo
   del dedo. Comprobación **8** lo mide con eventos de puntero de verdad.
   ⚠️ **Y el modo desnudo APAGA los mandos, no los quita del sitio.** Sacarlos
   del flujo haría más alta la caja y **repaginaría el texto debajo del dedo
   del lector**: la página que estaba mirando pasaría a ser otra.
   ⚠️ **Desde el 10 de septiembre de 2026 los apaga A CERO, y volver cuesta
   un toque DOBLE.** El autor lo pidió con la captura de las barras rayadas
   en rojo: «pueda desaparecer esas barras, con un sutil toque de dos o tres
   aparezcan». La asimetría es a propósito: esconderlas cuesta UN toque (es
   la puerta de entrada y una puerta de dos toques no la encuentra nadie);
   devolverlas cuesta DOS seguidos, porque leyendo a página limpia el dedo
   roza el centro sin querer y un solo toque las devolvería a cada rato. Y
   tras cada cambio hay un respiro de medio segundo que se traga el toque de
   más: por eso «dos o tres» hacen lo mismo, tal como se pidió. Escape las
   devuelve sin cerrar la sala, salir de pantalla completa también, y la
   sala siempre ABRE con sus barras. Comprobación **27**.
   ⚠️ Las zonas llevan `touch-action: pan-y pinch-zoom`, no `none`: se le quita
   al navegador el gesto horizontal —que es el nuestro— y se le deja el de
   acercar, porque quitarle el de acercar a una pantalla de lectura es
   quitarle la letra grande a quien la necesita.

9. ⚠️ **LA SALA REDEFINE LOS TOKENS DENTRO DE SÍ MISMA; EL ANAQUEL NO.**
   `#voz-lector` declara `--bg`, `--surface`, `--text`, `--muted` y `--border`
   en tres juegos (papel, sepia, noche), y **`#view-voz` se queda en el mundo
   claro de la aplicación**. Los tres papeles no son manía: un texto se lee de
   noche en la cama —donde una pantalla blanca deslumbra y despierta— y a
   mediodía en un patio —donde el gris no se ve—. Y en noche el texto **no es
   blanco puro**, que deja estela al pasar la vista.
   Todo lo de la sala (los paneles y el aviso incluidos) cuelga **dentro** de
   `#voz-lector`, así que se tiñe solo: por eso aquí no hay que nombrar seis
   `id` uno por uno como en El Rodaje. **Y no se toca ni un token de `:root`.**
   ⚠️ Y `--card` **no existe** en la aplicación: el fondo blanco es
   `--surface`. Y las franjas de color van **al final del archivo**, porque
   `.voz-ficha` declara el atajo `border: 1px solid var(--border)` y a igualdad
   de peso gana la que vaya después. Los dos fallan igual: sin error, sin
   romper la página y sin que se entere ninguna sonda que mire el HTML. Se
   miran con el color **calculado** (comprobación 10).
   ⚠️ **Y LAS LETRAS DE LIBRO (Literata, Atkinson Hyperlegible) NO SE TRAEN CON
   `@import`.** Un `@import` en la hoja de estilo bloquea el pintado de la
   aplicación entera hasta que Google Fonts conteste —o falle, que con mala
   señal tarda lo mismo—: devuelve la espera de quince segundos que costó
   quitar del arranque. Las pide `vozCargarLetras()` con un `<link>` la
   primera vez que se abre la sala; mientras llegan se lee en Georgia, y
   cuando llegan la sala se repagina sola (`document.fonts`).

10. ⚠️ **NADA DE LA BASE NI DEL PEGADO LLEGA A UN ATRIBUTO NI A `innerHTML`.**
   Todo con `createElement` y `textContent`. Aquí entra el texto **más largo de
   toda la aplicación**, pegado desde otra ventana, y F.A.R.O tiene dentro la
   Bóveda, las finanzas, el chat y los teléfonos del Buzón del lector. Las
   cursivas y las negritas (`*así*`, `**así**`) se pintan troceando y colgando
   nodos `<em>`/`<strong>`; **el resaltado del buscador también**, troceando
   los nodos de texto y colgando `<mark>`. Un `innerHTML` aquí para pintar una
   cursiva sería la puerta más ancha de la casa por el motivo más tonto.
   Comprobación **9** lo prueba con veneno en un párrafo, una cita, una lista
   y el resaltado.

11. ⚠️ **UN CORTE DE RED NO SE ENSEÑA COMO UN ANAQUEL VACÍO**, y lo que hay en
   memoria no se tira hasta saber que llegó lo nuevo. Si un corte dejara el
   anaquel en cero, la pantalla diría «todavía no hay textos» con un botón que
   invita a **pegar**, y el camino natural después de una mala señal sería
   pegar encima los que ya estaban. `error.code === '42P01'` es «falta el SQL»
   y lo demás es la señal; decir lo primero cuando pasa lo segundo manda a
   pegar trescientas líneas en una base que ya las tiene.

   ⚠️ **Y LA PETICIÓN LLEVA RELOJ PROPIO, PORQUE EL CLIENTE NO LO TRAE.**
   Medido con la sonda el 10 de septiembre de 2026: cuando la petición **no
   vuelve** —no cuando falla: cuando no vuelve— el cliente de Supabase no
   devuelve `{data:null,error}` ni lanza, **se queda pendiente para siempre**.
   O sea que la rama que existe para decir «no hay señal» no llegaría a correr
   nunca y el anaquel se quedaría en «Mirando la nube…» hasta cerrar la
   aplicación. Ocho segundos, y el reloj **no cancela** la petición.

   ⚠️ **Y LA BASE DEL ESTRENO, SIN LA COLUMNA `genero`, NO ES NI «SIN SEÑAL»
   NI «FALTA EL SQL».** La tabla se creó el 10 de septiembre sin esa columna;
   con el archivo nuevo sin volver a correr, PostgREST rebota la consulta
   entera con `42703` (`column … does not exist`). La herramienta la vuelve a
   pedir **sin la columna**, sigue funcionando con el género solo en el
   aparato, **no manda la columna al guardar** (también rebotaría) y la barra
   dice exactamente qué archivo volver a correr («la base va vieja»).
   Comprobación **17**.

12. **Es de la casa, se retira con lápida, y funciona sin nube diciéndolo.**
   Los cuatro leen todos los textos; corregir y retirar es solo de quien lo
   puso, y eso lo hace cumplir la seguridad por fila. **No hay política de
   `delete`**: si un aparato borrara la fila, la tableta que todavía tiene su
   copia la subiría otra vez y el texto resucitaría solo. Y mientras nadie
   haya corrido el SQL la herramienta funciona entera con la copia del aparato
   y **lo dice a la vista** («📴 Solo en este aparato»), que es lo contrario de
   fingir que viaja.
   ⚠️ **Y la lápida se queda en el aparato aunque se vuelva a guardar el
   anaquel.** La primera versión de `vozGuardaLocal()` escribía solo los textos
   vivos, así que la lápida duraba hasta el siguiente guardado; si la subida
   había fallado por la señal, en el arranque siguiente la nube devolvía el
   texto viejo, no había lápida que lo parara, y el cuento resucitaba. Es la
   mitad escondida de «el cuento de muestra no se puede eliminar» (regla 22).
   Ahora las lápidas se conservan seis meses, como en `lecturas_marcas`.
   ⚠️ **Los ajustes de lectura, la posición y los marcadores son DEL
   APARATO**, no de la nube. La letra es una costumbre de unos ojos; y la
   posición parece que debería viajar y **no debe**, porque en esta casa el
   mismo texto lo leen cuatro personas: una posición común significa que la
   hija abre el cuento por donde iba el padre y el marcador de los dos se
   pierde a la vez.

13. ⚠️ **LA FILA VA FIRMADA, Y LAS DOS MITADES SE PRUEBAN JUNTAS.**
   `puesto_por` es `not null` y la política de escritura exige que sea quien
   entró, así que **una fila sin firmar no entra**. El aparato la manda
   (`vozYo()`, desde la sesión) y la base tiene el respaldo puesto
   (`default auth.uid()`): si algún día otro cliente se olvida, la firma ella.

   Está escrito aquí porque el fallo ya pasó, el 10 de septiembre de 2026, el
   mismo día de estrenarla: el aparato no mandaba `puesto_por` y **el síntoma
   no se parecía en nada a la causa**. El cuento se guardaba, se veía en el
   aparato donde se pegó, y no aparecía nunca en el otro. Desde fuera eso es
   un problema de señal; en realidad la escritura llegaba y la base la
   rechazaba. La mitad visible funcionaba perfectamente.

   ⚠️ **Y la lección que vale para toda la casa, no solo para aquí: las dos
   mitades estaban bien y la costura entre ellas no la probó nadie.** La
   prueba del SQL escribía `puesto_por` a mano —así que la tabla aprobaba— y
   la base de mentira de la sonda aceptaba cualquier escritura y devolvía
   201 —así que la pantalla aprobaba—. Cada doble era complaciente justo en
   el sitio donde el otro no miraba. Por eso ahora **la base de mentira
   exige lo mismo que la de verdad**: sin `puesto_por` devuelve 23502, con
   uno ajeno devuelve 42501, y sin la columna `genero` rebota como PostgREST.
   Un doble complaciente no prueba la costura: la esconde. Es la misma regla
   que el `grant all` de la prueba del SQL y que `postgrest-falso.js`, y se
   comprueba de la única manera que vale: **quitando el arreglo y viendo que
   la sonda suspende**.

   Del mismo día y de la misma clase: el botón ✏️ de la ficha llamaba a una
   función que no existía y **habría reventado al tocarlo**. No lo cazó
   nadie porque la sonda abría la hoja llamando a la función por dentro. Lo
   que no se toca, no se prueba: la comprobación 16 **pulsa el botón**, y
   comprueba además que el texto devuelto al recuadro de corregir **se vuelve
   a leer igual** (mismos capítulos y bloques): el alfabeto de ida es el de
   vuelta, o corregir una coma cambiaría la estructura.

14. ⚠️ **LO QUE NO SUBIÓ SE REINTENTA DE VERDAD, Y LOS AVISOS DICEN LA CAUSA.**
   La primera versión decía «subirá cuando vuelva la señal» y **nada lo
   volvía a intentar nunca**. Prometer un reintento que no existe es peor que
   decir que falló, porque quien lo lee deja de vigilarlo. Ahora
   `vozSubirPendientes()` corre al abrir, después de saber qué hay en la
   nube, y sube lo propio que allá falte o esté más viejo — solo lo PROPIO,
   porque una fila ajena la rechaza la seguridad por fila y reintentarla
   sería insistir cada vez para nada.
   Y el aviso nombra el motivo, que son cuatro y se arreglan distinto: falta
   correr el SQL, no hay sesión, no hay señal, o el texto es de otro. Un
   aviso que se equivoca de causa manda a mirar donde no está el problema.
   Por lo mismo, **corregir y retirar solo funcionan en lo propio**, y en lo
   ajeno los botones salen **apagados y avisan al tocarlos** («lo puso otra
   persona de la casa»): lo impide la seguridad por fila, y enseñar un botón
   vivo que la base va a rechazar es prometer algo que no se puede hacer;
   pero quitarlo sin más parece un fallo de la pantalla, y un fallo de
   pantalla se «arregla» reinstalando. Un botón apagado que explica es lo
   único que no manda a nadie a buscar donde no está el problema.
   ⚠️ **Y los avisos se VEN.** La aplicación tiene `toast()` (js/app.js), no
   `showToast()`, que era lo que llamaba la primera versión: ningún aviso de
   guardado salió nunca en F.A.R.O y el de copiar caía en un `alert`. Y con
   la sala abierta el aviso de la aplicación tampoco serviría —vive por
   debajo de ella—, así que `vozAviso()` pinta uno **dentro de la sala**, que
   además se tiñe con el papel puesto.

15. ⚠️ **LOS GÉNEROS VIVEN EN EL APARATO, NO EN LA BASE.** `VOZ_GENEROS`
   (cuento, ensayo, poema, crónica, carta, discurso, artículo, novela corta,
   texto) es una lista en `voz-prestada.js`; la columna `genero` guarda una
   palabra corta y su `check` **solo mira el largo**. Añadir un género tiene
   que ser una línea en un archivo, no una migración que alguien pega desde
   una tableta: es la regla 8 de la repisa de enlaces. El género se elige con
   un chip (un toque, no un desplegable de nueve), lo trae la etiqueta
   `Género:` si el texto la lleva, y un texto que es casi todo verso se
   propone solo como poema. Es el ÚNICO campo con lista cerrada, y lo que no
   se reconoce cae en «texto», nunca en «cuento»: un ensayo archivado como
   cuento se descubre a los seis meses.

16. **Marcadores y buscador, en el mismo panel que el índice.** Son tres
   cosas que en un lector de libros van juntas porque hacen lo mismo: ir a
   un sitio del texto. El marcador es el párrafo de la página con su
   fracción, igual que la posición, y por lo mismo sobrevive a un cambio de
   letra; son del aparato, como la posición. **El buscador busca en el texto
   guardado, no en la pantalla** (en la pantalla solo está el capítulo
   abierto), sin tildes y sin mayúsculas —quien busca «corazon» en una
   tableta no escribe la tilde—, y el resaltado en el original se hace con un
   mapa de posiciones entre el texto sin tildes y el texto de verdad, porque
   `normalize('NFD')` cambia los largos. Comprobación **18**.

17. ⚠️ **LA PANTALLA NO SE APAGA MIENTRAS SE LEE.** Una tableta se apaga sola
   al minuto y medio sin que la toquen, y leyendo una página larga no se la
   toca. Es el mismo permiso que pide el teleprompter de El Rodaje; puede no
   existir o negarse, y si falla no pasa nada más que lo de antes. **Se
   suelta al cerrar la sala** —un permiso que se queda puesto detrás del chat
   es una batería que se acaba a las tres de la tarde— y se vuelve a pedir al
   volver de otra aplicación (`visibilitychange`).
   ⚠️ **Y la variable se suelta ANTES de esperar al permiso.** Cerrar y volver
   a abrir la sala en el mismo tirón encontraba la variable ocupada por el
   permiso viejo que aún se estaba soltando, no pedía uno nuevo, y la
   pantalla se apagaba leyendo. La sonda lo cazó (comprobación 7) porque
   cuenta los permisos pedidos y soltados con un doble.
   Y la pantalla completa tiene **acceso directo: el ⛶ de la barra de la
   sala** (pedido por el autor el 10 de septiembre de 2026; el ajuste
   existía, pero enterrado en Aa → Pantalla, y un acceso de tres toques no
   es un acceso). Un toque pone pantalla completa Y esconde las barras; se
   enseña solo donde el navegador lo permite, se sale sola al cerrar la
   sala, y salir por donde sea devuelve las barras.

18. ⚠️ **EL RELLENO AUTOMÁTICO NO PISA LO TOCADO A MANO, Y RECUERDA QUÉ
   RELLENÓ ÉL.** La primera versión rellenaba el título con «Cuento sin
   título» al abrir la hoja vacía, así que cuando después se pegaba un texto
   con su `# Título` el campo ya no estaba vacío y **el título de verdad no
   entraba nunca**. Se veía en cada pegado, y parecía que el lector no sacaba
   el título. Ahora `_vozAuto` guarda lo que puso el lector, y solo se pisa
   eso; lo que la persona escribió no se toca. Igual con el género (un chip
   tocado no se lo pisa ninguna etiqueta) y con el interruptor de versos.
   Comprobación **4**: se abre la hoja vacía, se pega DESPUÉS un texto con
   `# Título`, y el campo tiene que traerlo.

19. **La hoja de pegar avisa de lo que va a pasar antes de guardar**: cuántos
   capítulos, subtítulos, citas, estrofas y listas entendió; qué renglones
   parecían etiquetas y no se entendieron; y **si ya hay un texto con ese
   título en el anaquel**, porque casi siempre es el mismo pegado dos veces
   (no se para el guardado: dos cuentos pueden llamarse igual, pero se dice).

20. **«Sigue leyendo» arriba del anaquel, y chips de género y de voz.** Es lo
   primero que hace un lector de libros al abrirse, y lo que evita buscar
   entre treinta fichas el que se estaba leyendo. La tarjeta se esconde con
   un filtro o una búsqueda puestos, y los chips —sacados de los textos,
   nunca de una lista escrita— se esconden cuando no separan nada.

21. ⚠️ **LOS SUBRAYADOS SON LOS CINCO COLORES DE LA CASA Y VIAJAN POR LA
   TABLA DE LAS MISIONES.** Pedido por el autor el 10 de septiembre de 2026.
   Son los mismos cinco del marcador de las misiones (`js/lecturas-marcador.js`):
   D dato, V voz, I idea, C contracita, ? duda, con la misma trama —cada color
   lleva además su raya distinta, para la fotocopia en gris y para quien no
   separa el rojo del verde— y con la letra al final del trozo. Y van por la
   MISMA tabla, `lecturas_marcas`, con `mision = 'voz:<cid>'` y `zona =
   'cap<N>'`: no se inventa una segunda tabla de subrayados para el mismo
   gesto. Son de CADA QUIEN (la tabla lleva seguridad por fila con el usuario
   que entró), a diferencia del texto, que es de la casa. Si esa tabla no está
   corrida, el panel lo dice («falta correr lecturas_marcas.sql») y los
   subrayados viven en el aparato hasta entonces.
   Cómo se hace: se selecciona un trozo —el centro de la hoja es texto de
   verdad, regla 8— y al soltar sale la barra con los cinco colores pegada al
   trozo; un toque marca. Tocar una marca la abre para cambiarle el color,
   ponerle nota o quitarla. **Quitar deja lápida** (`del`), por lo mismo que
   los textos. La marca se guarda por **capítulo, párrafo y desplazamiento de
   caracteres sobre el TEXTO del bloque, no sobre su HTML**: así una marca
   sigue valiendo aunque el bloque ya tenga otras pintadas encima, y sobrevive
   a un cambio de letra porque se repinta con el texto. Si el texto se corrige
   y el trozo ya no está donde estaba, se reancla **solo si aparece una vez**:
   con dos apariciones, adivinar es peor que no pintar.
   ⚠️ **La marca se pinta troceando nodos de texto y colgando `<mark>`**, nunca
   con `innerHTML`, y el `::after` con la letra sale de un `data-ini` que
   ponemos nosotros. Una nota con HTML dentro se guarda como texto y se pinta
   como texto. Comprobación **21**: marca, cambio de letra, nota con veneno,
   color calculado en papel y en noche, la subida FIRMADA a `lecturas_marcas`
   con la base de mentira exigiendo lo que exige la de verdad, y la lápida.
   ⚠️ **Y los tokens `--fm-*` se declaran por papel dentro de `#voz-lector`**:
   en noche los mismos amarillos deslumbran, así que van traslúcidos, como en
   el modo oscuro de las misiones. Ni uno en `:root`.
   ⚠️ **MIENTRAS SE SELECCIONA, LA BARRA NO ESTÁ.** Pedido por el autor el
   12 de septiembre de 2026, con la captura de su tableta al lado: salía a
   los 260 ms de que la selección dejara de moverse, y en una tableta eso
   es MIENTRAS se selecciona —los tiradores se arrastran a tirones, con
   pausas para mirar dónde va el borde, y cada pausa de un cuarto de
   segundo plantaba la barra **encima del párrafo**, tapando justo lo que
   hay que ver para elegir el trozo; y encima Android pone su propia barra
   de copiar, así que quedaban dos—. Ahora cada movimiento de la selección
   la cierra al instante y solo se abre cuando la selección lleva
   **tres segundos quieta** (`VOZ_SUB_ESPERA`).
   ⚠️ **Y escribir en la propia barra no cuenta como seleccionar.** Tocar
   «✎ Nota» lleva el foco al recuadro y el navegador recoge la selección
   del texto al hacerlo: sin esa guarda, abrir la nota **cerraba la barra
   que acababa de abrirla** —el recuadro aparecía y se iba en el mismo
   gesto— y la nota no se guardaba nunca. El fallo ya existía antes, pero
   solo dentro de la ventana de 260 ms, así que unas veces pasaba y otras
   no; poner los tres segundos lo hizo determinista y la sonda lo cazó.
   ⚠️ **Y con el RATÓN no se espera**, porque ahí SÍ existe un gesto que
   dice «ya terminé»: soltar el botón. Con el dedo no existe —los
   tiradores son del sistema y no nos avisan de nada—, y por eso allí hay
   que adivinarlo por el reloj. Tres segundos delante de una computadora,
   donde el gesto es inequívoco, serían tiempo muerto por nada.

   ⚠️ **La barra de una selección NUEVA trae también «✎ Nota», «🔖 Aquí me
   quedé» y «✕ Cerrar»**, calcada de la barra de las misiones (pedido del
   autor el 10 de septiembre de 2026, con su captura al lado): es el mismo
   gesto —se selecciona y se decide qué hacer con lo seleccionado— y en un
   botón aparte habría que soltar el texto, buscarlo y volver. «Nota» sin
   color elegido marca como DUDA, que es lo que casi siempre es una nota a
   bote pronto, y se recolorea tocándola. «Aquí me quedé» pone el marcador
   de lectura EN EL PÁRRAFO seleccionado —no en la página, que cambia con
   la letra—, con el trozo como extracto, pisando el que ese párrafo ya
   tuviera. Sobre una marca ya puesta «Aquí me quedé» se esconde —no hay
   trozo nuevo al que llevar el marcador— y sale «Quitar». La comprobación
   21 pulsa las tres.

22. ⚠️ **RETIRAR ESTÁ A LA VISTA, ES DE DOS TOQUES EN EL MISMO SITIO, Y NO
   PASA POR `confirm()`.** «El cuento de muestra que está al principio no se
   puede eliminar» (el autor, 10 de septiembre de 2026). Fallaban tres cosas a
   la vez y ninguna daba error: el botón solo estaba al FONDO de la hoja de
   corregir; pasaba por `window.confirm`, que en la aplicación instalada en el
   teléfono puede no salir nunca —el botón parecía muerto—; y la lápida se
   perdía al volver a guardar el anaquel (regla 12), así que aunque se
   retirara, resucitaba desde la nube en el siguiente arranque. Ahora el 🗑
   está en la ficha, en el ⋯ de la lista y de la cuadrícula, y al pie de la
   hoja de corregir; un toque abre **«Sí, retirar · No» al lado**, sin diálogo
   del navegador, y nada se retira con un solo toque. La comprobación **22**
   pulsa los botones de verdad, cuenta las llamadas a `confirm`, y vuelve a
   arrancar con la nube devolviendo todavía el texto viejo: la lápida tiene
   que ganar y volver a subirse sola.

23. **LEER DESLIZANDO ES OTRO MODO, NO OTRA PANTALLA.** «No aparece leer
   deslizando para abajo.» Es el primer ajuste de la sala (📖 En páginas ·
   ↕️ Deslizando): en desplazamiento se pinta el texto ENTERO seguido —portada,
   epígrafe y todos los capítulos, cada bloque con su `data-cap`—, sin columnas
   ni alto fijo, y la caja se desliza hacia abajo. Todo lo que puso la
   paginación se quita uno por uno (`vozColocarScroll`), para que cambiar de
   modo a mitad de lectura no deje una columna de dos metros.
   ⚠️ **Las zonas de toque de los bordes se ESCONDEN en este modo.** Son
   hermanas de la caja, no hijas, y un dedo que empezara a deslizar encima de
   una zona no desplazaría la caja de debajo: el navegador desplaza al
   antepasado del elemento tocado. Cuarenta por ciento de la pantalla sin
   poder deslizar sería un modo de desplazamiento roto en silencio.
   ⚠️ **La posición se apunta al parar de deslizar, por párrafo y fracción**,
   con el mismo formato que en páginas (regla 6): el bloque que cruza el borde
   de arriba y cuánto de él ya pasó. Por eso se puede cambiar de modo sin
   perder el sitio, y por eso vuelve al mismo sitio al abrir. Comprobación
   **23**: overflow calculado, sin columnas, zonas escondidas, párrafo
   apuntado, vuelta al sitio, y el mismo párrafo a la vista al volver a
   páginas.

24. **HOJEAR ES UNA INSTANTÁNEA QUE SE PLIEGA, Y SIGUE AL DEDO.** «No está
   leer con la simulación que pase la página cuando se pasa la hoja tal como
   un libro.» Ajuste «Pasar página»: Deslizar · 📄 Hojear · De golpe. Al pasar,
   `vozInstantanea()` clona `#voz-texto` recortado a la página que se va, se
   cambia por debajo a la de destino, y el clon gira en 3D alrededor del lomo
   —hacia adelante sobre su borde izquierdo, hacia atrás sobre el derecho— con
   una sombra que crece con el giro. Con el dedo (o el lápiz) **la hoja sigue
   al dedo** mientras se arrastra y al soltar termina de pasar o vuelve, según
   cuánto se llevó (`vozVueltaEmpieza/Mueve/Suelta`). Con el ratón no: un
   arrastre de ratón es una selección.
   ⚠️ **El clon PIERDE el `id`**: dos `#voz-texto` en el documento romperían
   la paginación, el buscador y la posición. Se queda con la clase
   `.voz-texto`, y por eso la tipografía de la hoja vive en la CLASE y no en
   el `id`: si viviera en el `id`, la hoja que se pliega saldría en Times a
   16 px. ⚠️ **Es un clon del DOM, no una imagen**: así lleva la misma letra y
   los mismos subrayados sin pintar nada en un lienzo. Y `.voz-l-mid` recorta
   con `overflow: hidden`, porque girada en perspectiva la hoja crece por el
   borde cercano y se salía por encima de la barra. Comprobación **24**: la
   hoja existe con su clon sin `id`, no recibe el puntero, lleva la misma
   letra calculada, desaparece al terminar; con eventos de puntero de tipo
   `touch` sigue al dedo y decide al soltar; con `mouse` no pliega; y «De
   golpe» pasa al instante.

25. **EL ANAQUEL TIENE TRES VISTAS, SEIS ÓRDENES Y DOS AGRUPACIONES, Y LA
   ETIQUETA VA EN LAS TRES.** «Ver los libros en cuadrícula, en lista, en
   detalle y poder moverlos, hacer una clasificación por voces de autores.»
   ▦ cuadrícula (portadas de 2:3 con el color de la voz), ☰ lista (una fila
   por texto, con ⋯ para lo demás) y ▤ detalle (las fichas). Orden: recientes,
   **manual**, título, voz, género, a medias primero. Agrupar: por voz o por
   género, con el lomo del color de la voz y la cuenta de cada grupo.
   ⚠️ **La etiqueta —voz y máquina— está en las tres vistas y en el menú ⋯.**
   Una vista compacta que la perdiera sería la forma más barata de romper la
   regla 1; la sonda mira las tres.
   ⚠️ **La vista, el orden, la agrupación y el orden a mano son DEL APARATO**
   (`faro_voz_anaquel_v1`), nunca de la nube. Es la regla 9 de la repisa de
   enlaces: la seguridad por fila solo deja escribir la fila propia, así que
   un orden común de la casa es imposible sin escribir filas ajenas, y fingir
   lo contrario sería un arrastre que parece guardarse y no se guarda. El chip
   lo dice: «Manual (este aparato)».
   ⚠️ **El orden a mano se cambia ARRASTRANDO EL ASA, con PUNTEROS**, con las
   mismas cuatro reglas que la repisa, los videos de M.E.T.A.S y El Rodaje: el
   asa es un botón y **las flechas del teclado la mueven**; `touch-action:
   none` en el asa y solo en el asa (en toda la tarjeta, la lista dejaría de
   deslizarse); **al soltar NO se repinta** (el nodo se mueve, no se vuelve a
   crear); y se explica con palabras encima de la lista. En la cuadrícula el
   destino se decide por la mitad izquierda o derecha de la tarjeta de debajo
   si el dedo va en su misma fila, y por la mitad de arriba o abajo si no.
   Comprobación **25**: las tres vistas con su etiqueta, el color calculado de
   la portada, los grupos coherentes, el orden por título, ↑ con el teclado, un
   arrastre con eventos de puntero de verdad, que no escribió nada en la nube,
   y que el orden sobrevive a volver a abrir. Se prueba en la vista de lista,
   porque `elementFromPoint` —que es lo que usa el arrastre— no ve nada fuera
   de la ventana del marco.

26. **LAS LECTURAS DE LAS MISIONES ENTRAN POR UN PUENTE, Y EL PUENTE ES UNA
   COLA DEL APARATO.** Pedido por el autor el 10 de septiembre de 2026: que
   las lecturas «a la manera de» que viven dentro de las misiones (Borges,
   Cervantes, Harari, las entrevistas imaginadas, los careos) se puedan
   mandar aquí «para que se ubiquen allí». Encajan sin torcer nada: son
   exactamente el objeto de esta herramienta —prosa escrita por una máquina
   imitando una voz ajena—, así que viajan CON la etiqueta puesta: la voz
   sale del propio rótulo de la tarjeta («…, a la manera de Borges)») y la
   máquina es «la casa (ejercicio de estilo)», que es como las presenta la
   lect-nota de cada una.
   El botón vive en `js/lecturas.js` —el aparato compartido: se pone una vez
   y sale en las trece misiones con Lecturas— y **NO habla con Supabase**:
   deja la lectura en la cola `faro_voz_entrantes_v1` (localStorage;
   misiones y aplicación comparten origen) y `vozTraerEntrantes()` la recoge
   al abrir la herramienta. La ficha se crea **SIN `puesto_por` a
   propósito**: esa ausencia es la misma marca que `vozSubirPendientes()` ya
   usa para «esto falta en la nube», así que la firma, la subida y el
   reintento son los de siempre y no hay un segundo camino que mantener. Un
   cliente de Supabase propio en la misión lo prohíbe la regla del cliente
   único.
   ⚠️ **El identificador es ESTABLE** (`lect-<SAVE_KEY>-<lectura>`): mandarla
   dos veces —o desde dos aparatos— cae en la MISMA ficha del anaquel, y el
   toque REEMPLAZA su entrada en la cola en vez de añadir otra. Si dos
   personas mandan la misma lectura, la primera que sube firma la fila y la
   otra rebota por la seguridad por fila sin ruido: el contenido es idéntico.
   ⚠️ **Los párrafos viajan YA REPARTIDOS** (capítulo único con bloques
   `k:'p'`), nunca como texto para el lector de pegado: el DOM de la tarjeta
   ya es la estructura, y pasarle a ese lector un careo lleno de turnos en
   negrita sería darle la oportunidad de descuartizarse en capítulos.
   ⚠️ **Y tres reglas con dueño:** un texto VIVO del anaquel con el mismo
   identificador NO se pisa (puede llevar una corrección hecha a mano aquí,
   y el puente no sabe más que la misión); una LÁPIDA solo revive si el
   envío es MÁS NUEVO que ella (retirado ayer y mandado hoy, vuelve; mandado
   ayer y retirado hoy, no); y sin etiqueta no entra nada, tampoco por el
   puente. La cola se vacía entera en cada recogida: cada entrada entró o se
   descartó a propósito. El género sale de la pista del rótulo, y para las
   entrevistas y los careos se añadió `entrevista` a VOZ_GENEROS (regla 15:
   añadir un género es una línea en un archivo).

27. ⚠️ **UNA CITA NO SE QUITA DEL TEXTO: SE LE PONE UN BOTÓN.**
   Pedido por el autor el 12 de septiembre de 2026, al empezar a pegar aquí
   sus ensayos de investigación: «que las citas me las puedas crear para que
   el usuario pueda seleccionarlas y consultarlas desde el formato de la
   lectura que se presenta».

   Ni se mueve, ni se acorta, ni se cambia por un numerito: un «(Harari,
   2014, p. 45)» se queda escrito tal cual y ADEMÁS se puede tocar. Es la
   asimetría de la regla 3, y aquí muerde más fuerte —equivocarse hacia
   «esto no era una cita» cuesta un botón que no sale, y la cita se sigue
   leyendo donde está; equivocarse hacia «esto sí lo era» **borra palabras
   de un ensayo y parece que funcionó**, porque la página sigue llena—.
   Tiene además una consecuencia que no se ve y que es la que de verdad la
   sostiene: el texto plano del párrafo sigue siendo **carácter por
   carácter** el mismo de antes, así que **los subrayados ya puestos no se
   mueven ni uno** (se guardan por desplazamiento de caracteres, regla 21).
   Un marcador que cambiara «[3]» por «³» los desplazaría todos, sin error
   y sin aviso. La sonda lo compara carácter por carácter.

   ⚠️ **Y CONSULTAR UNA FUENTE NO MUEVE LA LECTURA.** La ficha sale
   ENCIMA, pegada a la llamada, con la misma maquinaria que la barra de
   subrayar (`vozColocarFlotante`, una sola función para las dos), y al
   cerrarla uno sigue en la misma frase. Llevar al lector hasta la
   bibliografía y devolverlo es, en un lector paginado, perder la página:
   es exactamente lo que se pidió evitar con «consultarlas DESDE el formato
   de la lectura».

   ⚠️ **Y LA BIBLIOGRAFÍA ES UN CAPÍTULO DEL ENSAYO, NO UNA TABLA NUEVA.**
   Un capítulo final llamado «Referencias», «Bibliografía», «Fuentes»,
   «Obras citadas» o «Notas» pasa a `ref` y sus entradas a bloques
   `k:'fuente'` dentro de `capitulos`, que ya es un objeto libre: **esto no
   pide ni una columna nueva ni volver a correr el SQL desde una tableta**.
   Es la regla 15 (los géneros viven en el aparato) y la 21 (no se inventa
   una segunda tabla para el mismo gesto), otra vez. Se pide que esté AL
   FINAL —los dos últimos capítulos— porque un ensayo puede ABRIR con una
   «Nota» del autor, y eso es prosa. El número de la entrada se guarda
   aparte del texto, igual que la viñeta de un ítem de lista, para que el
   que exporta lo escriba una sola vez y no dos.

   ⚠️ **Y dentro de un capítulo de bibliografía, CADA RENGLÓN ES UNA
   ENTRADA.** Es la excepción a «renglones seguidos son un párrafo», y se
   permite porque el rótulo del capítulo la corrobora sin ninguna duda: una
   bibliografía se pega casi siempre así —una entrada por renglón y sin
   blancos en medio, porque en el original iban con sangría francesa— y
   juntarlas dejaría las cuarenta en UNA sola fuente kilométrica, que ni se
   cita, ni se consulta, ni se ve que esté mal. La lista para esto es la
   **estricta** (`vozEsTituloBibliografia`) y **no lleva «notas»** dentro:
   una «Nota del autor» al principio de un ensayo es prosa de verdad y
   partirla renglón a renglón sería el fallo de la regla 3.
   Y con los capítulos en `##`, un «REFERENCIAS» pelado al final entra
   como **subtítulo** (regla 3), no como capítulo: se caza también ahí, y
   entonces **la bibliografía se queda en su propio capítulo** —para que el
   índice de la sala lleve a ella, que es lo que más se consulta de un
   ensayo, y para que la ida y vuelta del recuadro de corregir sea estable—.

   Se casan las dos formas que se usan de verdad, y ninguna más: la
   **numérica** —`[3]`, `[^3]`, `³`— contra el número de la entrada, y la
   de **autor y año** —`(Harari, 2014, p. 45)`, `Harari (2014)`, y varias
   en un mismo paréntesis separadas por `;`— por apellido en la cabeza de
   la entrada más el año. ⚠️ **Y una bibliografía sin números NO se numera sola**: sería
   fácil contar 1, 2, 3 por el orden de la lista y casar así los «[2]» del
   cuerpo, y sería adivinar —en una bibliografía en APA el orden es
   alfabético, así que ese «[2]» apuntaría a quien no es y la ficha
   enseñaría a OTRO autor, sin que nadie tuviera por qué dudarlo: una
   atribución falsa, que es exactamente contra lo que existe esta
   herramienta—. Sin número escrito, la llamada se queda como texto y el
   repaso la cuenta entre las que no tienen fuente, que es lo que dice qué
   hay que arreglar en vez de taparlo. Y el apellido de FUERA del
   paréntesis solo vale cuando dentro no hay ninguno (la forma narrativa):
   sumándolo siempre, un «(Smith, 2014)» en una frase que empezaba por
   «Harari» podría casar con la entrada de Harari.
   Sin bibliografía que las respalde **no se toca ni
   un carácter**: un ensayo lleno de paréntesis se lee igual que antes de
   que esto existiera. Las notas al pie escritas `[^3]: …` son lo ÚNICO
   que el lector mueve de sitio —se juntan en un capítulo «Notas» al
   final—, y se permite porque esa forma no se escribe por accidente ni
   una vez.

   ⚠️ **Y LAS ZONAS DE PASAR PÁGINA NO SE COMEN LA LLAMADA.** Cubren los
   bordes de la hoja y van ENCIMA del texto, así que una llamada —o un
   subrayado— cerca del margen sería intocable y nadie entendería por qué
   ese botón sí y ese no. `vozBajoLaZona()` apaga un instante el puntero de
   las zonas, mira qué hay debajo y le manda el toque. Sin eso,
   `elementFromPoint` devuelve siempre la zona.

   **El panel 📚 Fuentes es el camino de vuelta**, y solo sale cuando el
   texto trae bibliografía (una pestaña que se abre vacía se lee como una
   pestaña rota, igual que el chip de «dos páginas»). Cada entrada dice en
   qué párrafos se la cita y lleva a cada uno de un toque. **Y dice las dos
   cosas que no cuadran**, que en un trabajo de investigación son errores y
   no adornos: la fuente que está en la bibliografía y no se cita en
   ninguna parte, y la llamada del texto que no tiene fuente. El repaso del
   pegado las cuenta **antes de guardar**, que es cuando el texto todavía
   está en el recuadro. Encontrarlas después, releyendo cuarenta páginas,
   es tanto como no encontrarlas.

   Y lo de siempre: la dirección de una fuente se comprueba con `URL()` y
   no con un grep (`java\tscript:` y `JavaScript:` pasan un grep ingenuo y
   el navegador los ejecuta igual), solo `http` y `https`, y se pone con
   `setAttribute`.

28. ⚠️ **UNA TABLA SE LEE POR SU RENGLÓN DE GUIONES, Y SI NO CABE SE MIDE.**
   «Que cuando hayan tablas se pueda ver lo mejor posible» (el autor, 12 de
   septiembre de 2026).

   Se leen las de tubos (`| a | b |`), que es como las escribe cualquier
   máquina, y **solo con su renglón de guiones debajo** (`|---|---:|:--:|`,
   que además dice cómo va alineada cada columna: los números de un ensayo
   se leen mal a la izquierda). Ese renglón es lo único que las hace
   inequívocas: sin pedirlo, tres frases con un tubo dentro se convertirían
   en una tabla de tres filas, que es el fallo de la regla 3 con otra cara.
   El rótulo («Tabla 2: Deuda externa») sale del renglón de encima. Las
   filas se cuadran al ancho de la más ancha: a una fila corta la tabla le
   sale escalonada, y recortar a la larga le perdería un dato.

   ⚠️ **Y SI NO CABE, SE MIDE; NO SE ADIVINA.** Es la lección de las hojas
   del kit de escritura a mano. Se mira el ancho REAL de la tabla contra el
   de su caja, **después de pintar y con las columnas ya puestas** —una
   tabla mide lo que mide la columna de la página, y pasarla a fichas le
   cambia el alto, así que midiendo después de contar las páginas el número
   de páginas sería el de la tabla que ya no está—. Con una tabla que cabe
   no sale ningún mando: un botón que no hace falta estorba en mitad de una
   página de lectura.

   Y cuando no cabe hay **dos salidas de verdad**, no una letra encogida
   hasta que no se lea: **en fichas** —una por fila, con el nombre de su
   columna al lado de cada dato, que es lo único que se lee de corrido en
   un teléfono y no pierde ni un dato—, que es además donde empieza sola si
   la caja es estrecha y la tabla trae tres columnas o más; y **entera**, a
   pantalla completa, que se desliza a lo ancho con la cabecera y la
   primera columna clavadas, que es lo que hace falta para comparar la
   primera fila con la última.

   ⚠️ **Y UNA TABLA MÁS ALTA QUE LA PÁGINA NO PUEDE PEDIR QUE NO LA
   PARTAN: DESAPARECE.** `break-inside: avoid` hay que pedirlo mientras la
   tabla QUEPA; cuando no cabe, el navegador no puede cumplirlo y lo que
   hace en una caja de columnas con alto fijo es **recortarla**: queda el
   rótulo solo con media página en blanco debajo y las filas no están en
   ninguna parte. No da error, la página no se rompe y el número de
   páginas sigue saliendo bien.

   ⚠️ **Y debajo hay una segunda trampa, que es la que costó encontrar:
   UNA CAJA QUE SE DESLIZA NO SE PARTE NUNCA.** Un `overflow` distinto de
   `visible` hace la caja indivisible para el navegador, así que la caja
   que le da a la tabla su deslizamiento a lo ancho no se puede repartir
   entre dos páginas por mucho `break-inside: auto` que se le ponga. De ahí
   que las dos vistas se traten distinto: las **fichas** no necesitan
   deslizarse a lo ancho, así que no llevan caja y se parten solas entre
   páginas (con cada ficha entera); la **tabla** sí la necesita, así que se
   le pone **tope de alto** y se desliza también hacia abajo dentro de su
   caja, con el botón de verla entera al lado. Y el alto se mide **en la
   caja, no en la figura**: una figura que el navegador ya repartió entre
   dos columnas dice medir lo que mide la columna, así que preguntarle a
   ella contesta «sí cabe» justo en el caso en que no.

   ⚠️ **Y el toque en un mando de la tabla se para con `stopPropagation`.**
   Estos botones **se rehacen dentro de su propia respuesta** —cambia la
   vista y los mandos se vuelven a pintar—, así que cuando el aviso llega
   arriba el botón ya está suelto, sin padres, y el «¿cuelga esto de la
   tabla?» del toque al centro contesta que no: cambiar de vista escondía
   además las barras de la sala.

   ⚠️ **Y SE PINTA UNA VISTA CADA VEZ, NUNCA LAS DOS ESCONDIENDO UNA.** Con
   las dos en el documento el texto del bloque saldría DUPLICADO, y sobre
   ese texto se miden los subrayados (regla 21) y el avance de la lectura
   (regla 6): cada tabla contaría el doble de lo que hay. La sonda cuenta
   las apariciones de un dato.

   `break-inside: avoid` para que la paginación por columnas no parta una
   tabla por la mitad: media al final de una página y media al principio de
   la otra no se lee, y en un ensayo eso son los datos. Se mira
   **calculado**, como el color de las franjas.

   Y lo que hay dentro de una tabla **cuenta y se busca**: `vozTextoDeBloque`
   da el texto de cualquier bloque, y con él cuentan las palabras (si no,
   media página de datos contaría cero y el avance daría un salto al
   cruzarla) y busca el buscador —una cifra dentro de una tabla es justo lo
   que se busca en un ensayo de investigación—.

   Y la ida y vuelta: **corregir un ensayo no le puede deshacer las tablas
   ni la bibliografía.** Lo que vuelve al recuadro de corregir sale con sus
   tubos y su renglón de guiones, y con las fuentes como vinieron; es la
   comprobación 16 aplicada a lo nuevo, y la sonda compara las dos formas.

29. ⚠️ **LA BIBLIOGRAFÍA DE UN INFORME NO VIENE DENTRO DEL TEXTO, Y POR
   ESO TIENE CAJA PROPIA.**
   Descubierto el 12 de septiembre de 2026, con el primer informe de
   investigación que el autor pegó tal cual desde Gemini: la herramienta le
   dijo «una llamada del texto no tiene fuente» y él había copiado todo lo
   que se podía copiar. **Y era verdad las dos cosas.**

   Un informe así guarda sus fuentes en **otro sitio de la pantalla**
   —plegadas bajo un «Fuentes usadas en el informe»— y las llamadas son
   **numeritos dibujados, no letras**. Al copiar el informe no viene ni la
   lista ni los numeritos: de ochomil palabras llegó UNA sola llamada, la
   única escrita a mano dentro de una frase («(TALIS 2018)»), y ninguna
   fuente. **Ninguna regla de lectura puede arreglar eso, porque lo que
   falta no está en el texto**; lo único que lo arregla es una caja donde
   pegar la lista, y eso es `#voz-f-fuentes` en la hoja de pegar.

   **Un renglón, una fuente.** Y un renglón que es **solo un dominio**
   (`publications.iadb.org`) no es una fuente: es el rótulo que esos
   informes ponen encima del título, y se junta con el de debajo —el
   título delante, que es por donde se busca el apellido, y el dominio
   detrás, que es de donde sale el enlace—. Separados serían dos entradas
   y ninguna de las dos diría nada.

   ⚠️ **Y el enlace se perdía al corregir.** Juntado con su título, el
   dominio ya no es «solo un dominio», así que al releer la caja se
   quedaba sin `url` y **todas las fuentes perdían su 🔗 sin dar ningún
   error**. Por eso `vozDominioAlFinal()` mira el ÚLTIMO trozo de la
   entrada y solo si está **todo en minúsculas**, que es como se escribe
   un dominio y como no se escribe el final de una frase («Debate.» y
   «Melville House.» no llevan punto dentro de una palabra, y «S.A.» va en
   mayúsculas). Dentro de la prosa no se busca nada: ahí «informe.pdf»
   tendría la misma pinta. Y las terminaciones de archivo se descartan a
   mano, como las palabras que no son apellidos.

   **Al corregir, cada cosa vuelve a su caja**: el cuerpo sin la
   bibliografía dentro (`vozTextoCuerpo(c, {sinFuentes:true})`) y las
   entradas en la suya. Revolverlas en el mismo recuadro obligaría a
   separarlas a mano en cada corrección.

   ⚠️ **Y sin NINGUNA bibliografía, el aviso dice qué hacer, no lo que
   falta.** Decirle a alguien «una llamada del texto no tiene fuente»
   cuando el texto no trae ni una se lee como un reproche y no como una
   instrucción —él copió todo lo que se podía copiar—: el aviso nombra la
   caja donde se pega la lista.

   ⚠️ **Y EL INTERRUPTOR DE VERSOS NO SE RETROALIMENTA.** Volvía encendido
   con que el texto tuviera **una** estrofa, y encendido fuerza el verso en
   TODO el texto: un ensayo de ochomil palabras al que cinco trozos se le
   habían leído como verso —una tabla, una lista— volvía en modo verso, al
   guardar salían más estrofas, y a la siguiente corrección más. Un
   interruptor que se retroalimenta destroza la prosa en tres vueltas y
   ninguna da error. Ahora vuelve encendido solo si el género es poema o
   si el verso es **la mitad o más** de los bloques (`vozVersosMandan`).

30. ⚠️ **ADJUNTAR UN ARCHIVO ES MEJOR QUE PEGAR, Y NO ES UNA COMODIDAD.**
   Pedido por el autor el 12 de septiembre de 2026: «podrías poner adjuntar
   ya sea de Drive, de OneDrive… al adjuntar en pdf o en Documentos de
   Google, o un word, las citas ya están bien específicas y con mejor
   orden». Y tiene razón por un motivo que se puede escribir: **copiar una
   pantalla pierde información y un archivo no.** Al copiar, los títulos
   pierden su renglón —el de su informe llegó pegado a la frase
   siguiente—, las tablas se deshacen, los numeritos de las citas son
   dibujos y no viajan, y la lista de fuentes se queda donde estaba. En un
   `.docx` todo eso está dicho con todas las letras: qué párrafo es título
   y de qué nivel, dónde empieza cada celda, qué trozo va en superíndice y
   a qué nota al pie apunta, y a dónde lleva cada enlace.

   ⚠️ **Y ESTO NO ES UN SEGUNDO LECTOR.** No entiende textos: los ESCRIBE
   en el mismo alfabeto que `vozLeer` ya entiende (`#`, `>`, `- `, tubos,
   `[3]`, `[^3]: …`) y los deja **en el recuadro, a la vista**. Dos
   lectores con dos juegos de reglas se irían separando solos y el día que
   alguien arreglara uno el otro se quedaría roto; y un adjunto que se
   guardara sin enseñarse sería la única parte de esta herramienta que
   hace cosas a espaldas de quien la usa, y encima con lo que más puede
   salir torcido. Tampoco **pisa lo que ya había escrito**: se añade
   debajo.

   ⚠️ **DE DRIVE Y DE ONEDRIVE SE ADJUNTA SIN CONECTAR NINGUNA CUENTA:**
   el selector de archivos del propio aparato ya los ofrece como orígenes.
   Meter aquí el selector de Google o el de Microsoft sería traer dos
   identificaciones más, dos librerías de fuera y dos cosas que pueden
   caerse —en una aplicación que tiene dentro la Bóveda— para llegar al
   mismo archivo al que ya se llega con un toque.

   **Vive en `js/tools/voz-adjunto.js`, aparte**, por la misma razón que el
   banco de cortes de El Rodaje: `voz-prestada.js` no toca ni un aparato
   del navegador, y esto toca `DecompressionStream`, `DOMParser`, `File` y
   `ArrayBuffer`. **Si no carga, la hoja de pegar sigue entera** y el botón
   lo dice; la sonda lo comprueba apagándolo a propósito.

   ⚠️ **Un `.docx` se abre sin librerías, y con una trampa dentro:** el
   navegador ya sabe descomprimir (`DecompressionStream('deflate-raw')`) y
   el índice del zip son treinta líneas — traer una librería sería un
   archivo más en el arranque que costó quince segundos quitar. **Y los
   tamaños se leen del DIRECTORIO CENTRAL, nunca de la cabecera de cada
   archivo:** Word escribe ceros ahí y pone el bueno en un descriptor
   DETRÁS de los datos, así que quien se fíe de la cabecera lee cero bytes
   y se encuentra **un documento vacío sin ningún error**.

   ⚠️ **EL SELECTOR NO FILTRA POR FORMATO, Y ESO NO ES DEJADEZ: ES LO
   ÚNICO QUE DEJA ELEGIR UN DOCUMENTO DE GOOGLE.** Descubierto el 12 de
   septiembre de 2026, con la captura de la carpeta de Drive del autor:
   sus tareas de la maestría están en Documentos de Google y el selector
   no le dejaba tocarlas —solo los Word—. El motivo es que **un Documento
   de Google no es un archivo**: no tiene bytes, vive en el servidor, y el
   aparato lo enseña como un archivo «virtual» de clase
   `application/vnd.google-apps.document`; los formatos de verdad (.docx,
   .html, .txt) son EXPORTACIONES que se fabrican al elegirlo. Con una
   lista de formatos puesta, el selector compara la clase con la lista, no
   encuentra ninguna y lo deja **apagado**: desde fuera parece que la
   aplicación no los admite. Filtrar por el nombre no servía de nada de
   todas formas —los selectores de Android se saltan la lista la mitad de
   las veces—, así que la comprobación de verdad siempre estuvo en
   `vadjLeer`, mirando lo que hay DENTRO.

   Y como el aparato decide solo a qué formato exporta —unas veces un
   `.docx`, otras un PDF, otras nada—, los cuatro finales están
   contemplados y **los tres malos nombran el mismo camino de dos toques**
   (`vadjGoogleComo`, en un solo sitio): un archivo **vacío** (la
   exportación falló), un **`.gdoc`** (que es solo un atajo con la
   dirección dentro, no el documento), un **PDF**, y una exportación que
   llega bien pero **sin nombre de formato** — esa se reconoce por lo que
   trae dentro, no por cómo se llama.

   ⚠️ **Y EL PDF SE RECHAZA A PROPÓSITO, DICIENDO QUÉ HACER.** Un PDF no
   guarda renglones: guarda letras con sus coordenadas, y muchos llevan
   codificaciones propias, así que lo que se saca no es texto equivocado
   —es un revoltijo de símbolos— y no se ve hasta leerlo. **Un revoltijo
   que parece haber funcionado es lo peor que puede salir de aquí**, y no
   hace falta: el mismo documento, descargado como Word, trae todo dicho.
   Y se puede elegir igual —el selector no filtra—, así que la explicación
   siempre llega.

   Detalles que salieron de probarlo: el superíndice de dígitos se escribe
   como `[3]` **solo si son dígitos** (un «1.er» no es una cita); la
   dirección de un enlace se pone al lado del texto **solo si ese texto
   tiene cinco caracteres o más**, porque en un informe exportado las
   llamadas de las citas SON enlaces de uno o dos caracteres y el párrafo
   se llenaría de direcciones; y las notas al pie **se renumeran desde 1**,
   porque los identificadores de Word saltan y una bibliografía que empieza
   en la nota 7 se lee como si faltaran seis.

31. **LA VOZ Y LA MÁQUINA SE ELIGEN CON UN TOQUE, Y LAS SUGERENCIAS SALEN
   DEL HISTORIAL.** Pedido por el autor el 12 de septiembre de 2026, con
   la hoja de pegar en pantalla y los ejemplos rodeados a mano: «necesito
   que allí pongas para poder seleccionar: Gemini, Perplexity, Claude».

   Son los dos campos que HACEN FALTA para guardar, o sea los dos que se
   escriben en **cada** texto, y siempre son los mismos tres o cuatro
   valores. Escribirlos a mano en una tableta no es solo lento: **se
   escriben mal**, y en el anaquel de esta casa hay un «Gemeni» de eso —
   que parte en dos el montón del chip que agrupa por máquina, sin dar
   ningún error y sin que nadie lo mire.

   ⚠️ **Las voces salen del historial, nunca de una lista escrita**: la
   voz que se imita es de cada casa —«Rulfo», «un narrador de pueblo», «un
   informe de investigación»— y ninguna lista fija la puede adivinar. Es
   la regla 2 del Apunte rápido. La **máquina** sí lleva lista
   (`VOZ_MAQUINAS`), porque son cuatro y son las mismas para todo el
   mundo; van detrás de las ya usadas y solo las que no estén.

   ⚠️ **Y un nombre que se diferencia en UNA letra de uno bueno no se
   propone**: un chip con «Gemeni» dentro reparte la errata en vez de
   pararla, y con los dos a la vista nadie los distingue de un vistazo.
   Una letra y no dos: a dos ya caben cosas distintas de verdad («Claude»
   y «Claude 3»). Al texto viejo no se le toca nada por detrás; lo que
   cambia es lo que se guarde de ahora en adelante.

   Escribir a mano se sigue pudiendo —un chip que fuera la única manera
   de rellenar el campo dejaría fuera la primera vez que se usa una voz
   nueva—, el chip que coincide se marca solo al escribir, tocarlo otra
   vez lo quita, y el aviso de «falta…» se apaga **en el momento**, no al
   guardar.

   ⚠️ **Y LA ERRATA QUE YA ESTÁ EN EL ANAQUEL SE ARREGLA DESDE EL
   ANAQUEL, NO DESDE EL REPOSITORIO.** «Corrige el Gemeni del anaquel a
   Gemini» (el autor, 12 de septiembre de 2026): esa errata vive DENTRO
   de sus textos, y la única mano que puede escribir esas filas es la
   suya —la seguridad por fila no deja otra—, así que lo que se pone es
   el arreglo a un toque: el anaquel avisa de la máquina que está **a una
   letra** de una buena y ofrece cambiarla en todos sus textos de una vez
   (`vozMaquinasTorcidas`, `vozUnificarMaquina`). Sube por `vozSubir`, el
   camino de siempre, que ya sabe reintentar y distinguir los motivos:
   **aquí no se abre un segundo camino a la nube**, porque uno de los dos
   se quedaría viejo. De los textos **ajenos se avisa pero no se ofrece
   el botón** —lo rechazaría la base, y enseñarlo sería prometer lo que
   no se puede hacer—, y a dos letras no se ofrece nada, que ahí ya caben
   cosas distintas de verdad.

32. 🗂 **LOS ESTANTES SON DEL DUEÑO, Y SON UN EJE APARTE DEL GÉNERO.**
   Pedido por el autor el 12 de septiembre de 2026: «poder editar las
   categorías de los textos para ubicarlos en los anaqueles según mis
   criterios y no que me los den predeterminados».

   ⚠️ **Y son un eje aparte a propósito.** El género dice QUÉ ES el texto
   —un ensayo, un poema— y por eso sale en su portada («Ensayo escrito por
   Gemini»): es parte de la etiqueta, la regla 1, y renombrarlo a gusto
   haría que esa frase dejara de decir lo que tiene que decir. El estante
   dice DÓNDE LO PONE SU DUEÑO y no significa nada fuera de su anaquel.
   Hacían falta porque el género no sirve para esto: los veintiún textos
   del autor son casi todos «Ensayo», así que agrupar por género le daba un
   solo montón. Lo que de verdad los separa es la materia, y eso no se
   puede adivinar desde aquí ni meter en una lista fija.

   ⚠️ **Un texto está en VARIOS estantes, y al agrupar sale en cada uno.**
   Un ensayo de la maestría sobre burocracia está en «Maestría» y en
   «Burocracia»; enseñarlo solo en el primero lo escondería del montón
   donde alguien lo va a buscar. Los que no están en ninguno van juntos y
   al final («Sin estante»), que es además el filtro que dice qué falta por
   archivar. **Y filtrando por un estante sale solo ese montón**: con el
   mismo texto en dos, enseñar también el otro contesta a una pregunta que
   nadie hizo.

   ⚠️ **VIAJAN, y por eso están en la base y no en el aparato**: un estante
   es una propiedad del TEXTO, y el texto es de la casa. Es lo contrario
   del orden a mano (regla 25), que es del aparato porque la seguridad por
   fila no deja escribir las filas ajenas; aquí cada quien escribe los
   suyos, que es justo lo que esa seguridad permite. **Pide correr el SQL**
   (`estantes jsonb`), y hasta entonces funcionan igual guardados en el
   aparato y la barra lo dice — la regla de la repisa de enlaces.

   ⚠️ **Y CON DOS COLUMNAS NUEVAS, LA QUE FALTA SE QUITA UNA A UNA.**
   PostgREST rebota la consulta ENTERA por una sola columna que no exista,
   y la maquinaria de «la base va vieja» estaba escrita para una:
   `VOZ_COLS_NUEVAS` las lista, y `vozBajar` va quitando **la que el propio
   error nombra**. Quitarlas todas de golpe dejaría el género en el aparato
   en una base que sí lo tiene, sin dar ningún error. Añadir una columna
   nueva es ponerla en esa lista y en el SQL; la maquinaria ya no se toca.

   Se ponen en **dos sitios con una sola función** (`vozPintarEstantes`):
   la hoja de pegar —se guardan con el texto— y el menú **⋯** —se guardan
   al tocarlos—, que es lo que hace llevadero archivar veinte textos que ya
   estaban, porque la hoja de corregir devuelve el ensayo entero a un
   recuadro. Y «Maestría», «maestria» y « MAESTRÍA » son **el mismo
   estante**: si no, el anaquel saldría con tres montones iguales.

**Antes de publicar un cambio de La Voz Prestada:**

```
node _dev/servidor-estatico.js      (en otra terminal)
_dev/probe-voz-prestada.html        (en el navegador)
_dev/probe-voz-adjunto.html         (el lector de archivos)
```

Y el SQL, contra un PostgreSQL de verdad. ⚠️ En esta sesión Postgres no
corre como root, así que va con su propio usuario:

```
mkdir -p /tmp/pg && chown postgres:postgres /tmp/pg
su postgres -c "initdb -D /tmp/pg/data -U postgres --auth=trust"
su postgres -c "pg_ctl -D /tmp/pg/data -o '-k /tmp/pg -p 55432 -c listen_addresses=' -l /tmp/pg/log start"
createdb -h /tmp/pg -p 55432 -U postgres voztest
psql -h /tmp/pg -p 55432 -U postgres -v ON_ERROR_STOP=1 -d voztest -f _dev/prueba-voz-prestada-sql.sql
```

⚠️ La sonda del adjunto **fabrica un `.docx` de verdad dentro del
navegador** —con su zip, su CRC32 y su `deflate-raw`— y lo lee, en vez de
darle a las funciones un XML ya descomprimido. Es la misma lección que la
sonda del banco de cortes, que se fabrica un WAV y lo corta: lo que puede
fallar aquí es el FORMATO, y eso no se ve nunca llamando funciones. Y
escribe los tamaños de la cabecera **en cero, como los escribe Word**,
que es la trampa que deja un documento vacío sin dar ningún error.

La comprobación **2** le pega un párrafo de prosa cuyos siete renglones
empiezan por siete palabras que nombran una parte de un libro, y exige que
salga **un** capítulo con **un** párrafo **de prosa** dentro: es el fallo más
caro del lector y el que menos se ve, porque descuartizar un texto parece
haber funcionado. Es la hermana de la 5-bis de El Rodaje. Y su contraria: un
poema de cuatro renglones tiene que salir con sus cuatro versos.

La comprobación **6** mide el margen del texto en la primera página y **en la
última**: la última salió corrida durante todo el primer día sin que la sonda
lo viera, porque medía la 0, la 1 y la 3 de quince.

La comprobación **7** abre la sala de verdad, se va a la página 3, sube la
letra a 30 px y comprueba que **el mismo párrafo sigue a la vista**; después
sube a 34 px, se pone en mitad de un párrafo partido entre páginas, cierra y
vuelve a abrir, y exige caer en **esa** página. Eso no se ve llamando
funciones: hay que medir la pantalla. Y para medir se abre la vista con
`switchView` y se enseña `#app-container`, porque con el panel escondido la
caja mide 0×0 y la sonda aprobaría una paginación que en la tableta no existe.

La comprobación **15** es la que faltaba el día del estreno y la que hay que
entender antes de tocar la subida: **no basta con que el texto aparezca en el
anaquel**. Eso es la copia del aparato, y se ve igual de bien cuando la subida
rebotó. Hay que mirar lo que RECIBIÓ la nube, que llegó firmado y con su
género.

La comprobación **19** ensancha el marco a 1000 px para ver el libro abierto
a dos páginas, y mide ahí también la última página.

La comprobación **26** es el puente desde las misiones: siembra la cola,
arranca la herramienta y exige que lo mandado entre con su etiqueta y su
género, que un texto vivo no se pise, que una lápida más nueva gane, que
sin etiqueta no entre nada, que la cola quede vacía y que la subida llegue
FIRMADA. La otra mitad del puente —el botón dentro de la misión— la vigila
`_dev/probe-lecturas-marcador.html`, pulsándolo de verdad y contando los
párrafos que viajan.

Las comprobaciones **28** y **29** son las citas y las tablas. La 28
compara el texto pintado con el guardado **carácter por carácter** —que es
lo que impide que poner los botones desplace los subrayados ya hechos—,
comprueba que consultar no mueve la página, que una llamada sin fuente no
se toca, que una dirección `javascript:` de la bibliografía no llega a
ningún `href`, y **dispara el toque sobre la zona de pasar página** para
ver que la llamada de debajo lo recibe. La 29 pulsa los botones de la
tabla de verdad, mira `break-inside` y el `position: sticky` **calculados**,
exige que solo haya UNA vista en el documento —con las dos, el texto del
bloque sale duplicado— y da la vuelta al texto para ver que corregir no
deshace las tablas.

La comprobación **30** es el informe de investigación pegado tal como
llega: sin sus fuentes dentro, con la lista pegada aparte (con el dominio
en su propio renglón, como se copia), y con la ida y vuelta de corregir,
que es donde el enlace se perdía. Y vigila que el interruptor de versos no
vuelva encendido en un ensayo con una estrofa suelta.

La comprobación **27** es la lectura a página limpia: el ⛶ de la barra
(con una pantalla completa de mentira, que en un Chromium sin cabeza no hay
de verdad), la opacidad CALCULADA en cero, el roce que no devuelve, el
doble y el triple que sí, el respiro que se traga el toque de más, Escape,
y que salir de pantalla completa con el gesto del sistema nunca deja una
pantalla sin mandos.

Las comprobaciones **21 a 25** son las de la segunda ronda (subrayados,
retirar, deslizar, hojear y el anaquel) y comparten una regla: **los botones
se pulsan y los gestos se hacen con eventos de puntero**, no llamando por
dentro a la función. El 🗑 que no retiraba, la zona que tapaba el
desplazamiento y el arrastre que no arrancaba son fallos de pantalla, y de
pantalla no se sabe nada llamando funciones. Y la base de mentira sirve
también `lecturas_marcas`, exigiendo lo mismo que la de verdad (firma, misión,
color de los cinco): un doble complaciente esconde la costura.

⚠️ Las comprobaciones de la nube (13, 17 y 14) reutilizan **el mismo marco**,
cambiándole la base de mentira, en vez de abrir un segundo `index.html`: un
segundo marco del mismo origen se queda colgado y la sonda no llega a poner
su veredicto en el título — y en tanda solo se lee el título, así que una
sonda sin veredicto se lee igual que una que nadie corrió.

Y el SQL, contra un PostgreSQL de verdad, que es donde se ve si el `check`
muerde y si la puerta cierra:

```
createdb voztest
psql -v ON_ERROR_STOP=1 -d voztest -f _dev/prueba-voz-prestada-sql.sql
```

⚠️ Esa prueba **empieza dejando la tabla como quedó el día del estreno, sin
la columna `genero`**, y solo después corre el archivo: es el camino que de
verdad va a recorrer la base del autor, y un `create table if not exists` no
toca una tabla que ya existe. Arrancando con la base vacía aprobaría sin haber
probado la migración. Y **reparte los permisos como los reparte Supabase**
—`grant all` sobre `public` a `anon` y `authenticated`, **y `grant usage on
schema auth`**— antes de probar la puerta. Sin lo primero aprobaría por el
motivo equivocado (rebotaría por falta de permiso de tabla, sin haber probado
la seguridad por fila); sin lo segundo revienta con «permission denied for
schema auth» en la primera escritura hecha como usuario de la casa, que es un
fallo **de la prueba** disfrazado de fallo de la tabla y manda a buscar el
error en el archivo bueno.

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
aparecieron **veintinueve más**; hoy lo hacen las noventa y cinco. La
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

## La aplicación abre al instante, y eso son DOS esperas distintas

**Pedido por el autor el 9 de septiembre de 2026:** «cuando inicio la
aplicación me queda mucho tiempo esperando, como 15 segundos, debes dejarla
que abra al instante». Eran dos esperas apiladas, y quien toque el arranque
tiene que saber que son dos, porque arreglar una sola deja la mitad del
problema con la misma pinta.

**La primera espera: los archivos.** `index.html` carga **32 archivos
propios** (dos megas), y hasta la v91 `sw.js` iba a la **red primero** para
cada uno, y encima revalidando (`cache: 'no-cache'`). Son 32 viajes completos
al servidor antes de pintar nada. En una computadora no se nota; con la señal
de un teléfono son los quince segundos.

Ahora los archivos propios se sirven **de la copia guardada, sin tocar la
red**. La red solo se toca cuando el archivo no está guardado.

⚠️ **Y esto NO devuelve el fallo del 28 de agosto de 2026** (HTML nuevo con
JavaScript viejo), que es lo primero que hay que comprobar antes de tocar
`sw.js`. Aquel fallo salió de **mezclar dos orígenes**: el HTML venía de la
red y el JavaScript de la caché HTTP del navegador. Aquí no puede pasar por
construcción: todo sale del **mismo caché**, y el caché lleva la versión en
el nombre (`CACHE_NAME`). Un despliegue nuevo crea un caché nuevo entero y al
activarse borra el viejo de una vez: **o toda la versión anterior o toda la
nueva, media versión no existe**.

De ahí se siguen tres reglas que no se negocian:

1. ⚠️ **El que SIRVE no revalida.** Escribir lo nuevo dentro del caché de la
   versión vieja es exactamente cómo se fabrica esa media versión. Lo nuevo
   entra por `install`, que llena su propio caché aparte, y ahí sí se
   revalida.
2. **La lista del arranque sale de `index.html`, no escrita en `sw.js`.** La
   instalación se trae el HTML, saca de él los `src` y `href` propios y los
   guarda. Una lista a mano estaría equivocada el día que alguien añada un
   `<script>`, y el síntoma sería que la aplicación vuelve a abrir lenta, que
   es justo el fallo que no se ve. Misma regla que las materias de Videos
   M.E.T.A.S.
3. **Se pre-cachea todo el arranque al instalar**, en segundo plano y
   mientras la copia anterior sigue sirviendo al instante. Así el primer
   arranque después de publicar también es instantáneo, en vez de ser el
   lento de siempre.

**Y cómo llega entonces una versión nueva**, que es lo que se paga por servir
de la copia guardada: el navegador comprueba `sw.js` al abrir; si cambió, el
worker nuevo se instala, llena su caché, se activa, borra el viejo y toma el
mando. La página que ya está corriendo lleva los archivos de antes, así que
`index.html` escucha `controllerchange` y **recarga una vez, solo si la
aplicación acaba de abrir** (menos de diez segundos). Pasado ese rato ya hay
alguien trabajando y recargarle la pantalla encima le borraría el monto a
medio escribir: esa versión la estrenará en el siguiente arranque. Publicar
no vale una pantalla que se recarga sola en las manos de alguien.

**La segunda espera: la pantalla.** `js/auth.js` no enseñaba **nada** (ni el
login ni la aplicación) hasta terminar dos viajes a la red: renovar el token
y preguntarle a `familia_miembros` quién entró. Con mala señal eso es una
pantalla en blanco de varios segundos, y una pantalla en blanco no se lee
como «cargando»: se lee como «se rompió», y la gente vuelve a tocar el icono.

Ahora **se pinta con lo recordado en el aparato y se comprueba por detrás**
(`AUTH_MIEMBRO_KEY`).

⚠️ **Y esto NO abre ninguna puerta**, que es lo que parece a primera vista y
por eso está escrito aquí. Lo recordado decide **qué se dibuja** mientras se
comprueba; no da acceso a ni un dato. Quien manda sobre los datos es la
**seguridad por fila**, que mira el token de verdad en cada consulta: sin
sesión buena las tablas devuelven vacío aunque la pantalla esté pintada. Por
eso se puede adelantar el dibujo sin adelantar el permiso. Y si la
comprobación dice que no, se cierra la sesión, se borra el recuerdo y se
manda al login. Del recuerdo se guarda **solo el identificador**, nunca el
nombre: el nombre se vuelve a sacar de `MIEMBROS`, así que retocar esa llave
a mano no sirve ni para ponerse otro nombre en la pantalla.

⚠️ **Y lo que dependa de otros módulos va aplazado un turno.** `auth.js` es
el PRIMERO de los `<script>`, así que su `DOMContentLoaded` corre antes que
el de `finanzas.js` y el de `app.js`. Desde que la aplicación se pinta sin
esperar a la red, `faroArranqueApunteFijo()` puede alcanzar a `finanzas.js`
antes de que enganche los botones: la hoja saldría abierta y con los chips
muertos. Va con un `setTimeout` de cero, y no rompe la regla del foco porque
en un arranque no hay ningún toque del que colgarse.

**Antes de publicar un cambio del arranque:**

```
node _dev/servidor-estatico.js      (en otra terminal)
_dev/probe-sw-arranque.html         (en el navegador)
_dev/probe-sw-puerta.html           (el filtro de la puerta)
```

`probe-sw-arranque` corre el código de `sw.js` con un `caches` y un `fetch`
de mentira y **le cuenta los viajes a la red**: si servir un archivo guardado
vuelve a tocar la red, suspende. Y abre el `index.html` de verdad con un
miembro recordado para medir en milisegundos cuándo se pinta.

⚠️ Ese caché de mentira **normaliza las direcciones** como el `CacheStorage`
de verdad (`cache.put('./js/app.js', …)` se guarda bajo la dirección
completa). Sin eso comparaba «./js/app.js» con «https://…/js/app.js», no
casaban nunca, y la sonda suspendía diciendo que el worker iba a la red: un
fallo de la sonda que se lee exactamente igual que el fallo de verdad.

⚠️ Y las sondas **no se pegan a la forma del código**. La de la puerta exigía
ver `STATIC_ASSETS.map`, que era cómo estaba escrita la instalación aquel
día; al cambiarla suspendió sin que el filtro se hubiera tocado. Ahora busca
**cada `cache.put` y comprueba que tiene su `sePuedeGuardar` delante**, que es
lo que de verdad hay que sostener. Una sonda pegada a la forma avisa de los
cambios, no de las averías, y la que avisa de todo acaba ignorada.

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

## Dos paletas, y no se mezclan

⚠️ **La aplicación y las misiones son dos mundos de CSS distintos**, y
usar un token del otro no da ningún error: se resuelve a nada.

| | La aplicación (`index.html`) | Las misiones |
|---|---|---|
| Hojas | `app.css` + `criba.css` + `rodaje.css` + `voz-prestada.css` | la de la misión + `taller-neuro.css` + `recursos-enlaces.css` |
| Tokens | `--brand`, `--surface`, `--bg`, `--border`, `--text`, `--muted`, `--faint`, `--accent` | `--pri`, `--sec`, `--card`, `--dark`, `--gray`… |
| Tipografía | Outfit | Nunito / Fredoka |

⚠️ **`--card` NO EXISTE en la aplicación.** El fondo blanco de una tarjeta
o de un campo es **`--surface`**. Y el 7 de septiembre de 2026 se
descubrió que tres reglas de Videos M.E.T.A.S —el campo de texto, la
tarjeta del video y el chip de materia— llevaban `background: var(--card)`
sin respaldo: se resolvían a nada, y «nada» en un `background` es
**transparente**. Los campos y las tarjetas llevaban meses saliendo sin
fondo, con el gris de la página detrás.

Es el peor tipo de fallo de CSS y por eso está escrito aquí: **no da
error, no rompe la página, y no lo caza ninguna sonda que mire el HTML,
porque el HTML está bien.** Hay que mirar el color CALCULADO. La
comprobación **12-bis** de `probe-videos-metas.html` lo hace ahora, con la
vista abierta de verdad —con el panel escondido los elementos no existen y
la comprobación aprobaría sola—.

Si se copia una regla del mundo de las misiones, se le cambia el token al
copiarla. Y si se quiere un respaldo, se escribe: `var(--card, #fff)`,
como ya hacen las reglas de Asignaciones.

⚠️ **Y hay dos pantallas que son la excepción, con la misma técnica y
motivos distintos: El Rodaje y la sala de lectura de La Voz Prestada.**
La segunda (`#voz-lector`, en `css/voz-prestada.css`) redefine los mismos
tokens en **tres** juegos —papel, sepia y noche— porque un texto se lee de
noche en la cama y a mediodía en un patio. Todo lo suyo cuelga DENTRO de
`#voz-lector`, así que ahí no hay que nombrar ventanas sueltas una por una; su
anaquel (`#view-voz`) se queda en el mundo claro de la casa. Y lo de siempre:
ni un token en `:root`.

⚠️ **La primera es El Rodaje.**
`css/rodaje.css` **redefine** `--bg`, `--surface`, `--border`, `--text`,
`--muted`, `--faint`, `--brand` y `--accent` en oscuro, pero **solo dentro
de `#view-rodaje` y de los seis `id` de sus ventanas**. No es un tercer
mundo de tokens: son los mismos nombres con otros valores, así que todo lo
que hereda de `app.css` se oscurece solo y los arreglos de `app.css`
siguen llegando. Lo que no se puede hacer nunca es redefinirlos en
`:root`: eso teñiría la casa entera.

⚠️ **Y el mismo cuidado con los ATAJOS.** `background: linear-gradient(…)`
deja el `background-color` en transparente, y `border-left: 3px solid
var(--border)` pisa el color que otra clase pusiera antes. Los dos fallan
igual que el `var(--card)`: sin error, sin romper la página y sin que
ninguna sonda que mire el HTML se entere. Se miran con el color
**calculado**, y en `#view-rodaje` el color liso va escrito aparte del
degradado por eso mismo.

## Detalles del repositorio

- Sin framework ni compilación: HTML, CSS y JS planos que se sirven tal
  cual. La aplicación se publica en Cloudflare Pages, detrás de una puerta
  con contraseña (Cloudflare Access).
- **Los iconos se generan con el navegador, no a mano.** En la sesión no hay
  ImageMagick, ni ffmpeg, ni Pillow, pero sí Chromium: se carga el original en
  un lienzo y se exporta con `toDataURL`. El maestro a resolución completa vive
  en `img/faro-icono-fuente.png`, y de él salen `icon-192`, `icon-512` y
  `icon-maskable-512`.
  ⚠️ **El `maskable` es un archivo APARTE y no es un capricho:** Android
  recorta ese icono en círculo, así que el fondo tiene que llegar al borde y el
  dibujo quedarse dentro del 76 % central. Usando el icono normal, que trae su
  baldosa redondeada con esquinas blancas, el recorte se comía la palabra
  «F.A.R.O» y encima dejaba un marco blanco. Las medidas (la caja de color del
  original y el radio de su esquina) **se sacan leyendo los píxeles**, no a
  ojo, y el dibujo se pinta un 4 % más grande que el recorte para que su borde
  suavizado no deje una costura clara sobre el azul.
- **Un solo cliente de Supabase en toda la aplicación**, el de `js/auth.js`
  (`window.faroSb`). No se crea otro: la razón, larga y cara, está escrita
  en ese archivo.
- Para revisar en el navegador: `node _dev/servidor-estatico.js`
  (http://localhost:8124) y abrir las sondas de `_dev/`. Cada una termina
  poniendo **APRUEBA** o **SUSPENDE** en el título de la pestaña.
