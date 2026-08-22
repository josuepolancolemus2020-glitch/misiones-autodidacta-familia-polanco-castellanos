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
aparecieron **veintinueve más**; hoy lo hacen las sesenta y ocho. La
única excepción es `probe-alto-util.html`, que no es una sonda sino un
instrumento de medida y se titula INSTRUMENTO. Dos sondas
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
