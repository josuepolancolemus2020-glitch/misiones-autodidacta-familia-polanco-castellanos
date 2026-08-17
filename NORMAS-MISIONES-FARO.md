# Normas de las misiones de F.A.R.O.

Documento corto y obligatorio: lo que toda misión nueva de F.A.R.O debe
cumplir. Equivale a `PLANTILLA-MISIONES.md` de M.E.T.A.S, pero para la
aplicación familiar. Fecha: 26 de julio de 2026.

---

## 1. El molde

Cada misión vive en `misiones/<carpeta>/` con tres archivos propios
(`<mision>.html`, `js/<mision>.js`, `css/<mision>.css`) y se registra en
`js/data/misiones.js` con su `id`, `materia`, `ruta`, `etapa`, `xp` e `icon`.
Sin entrada en el catálogo, la misión no existe para la aplicación.

Secciones, en este orden: Aprende, Estructura, Laboratorio, Flashcards, Quiz,
Clasifica, Identifica, Completa, Widgets, Reto, Sopa, Tareas, Evaluación,
**Casos del proyecto** (ver norma 3), **Guion de video** y **Lecturas**
(ver norma 5, desde «El acero antes del juicio» en adelante) y Recursos.

Cada misión lleva además:

- **clave de progreso propia** en `SAVE_KEY` (nunca compartida con otra misión);
- **ficha imprimible** en `fichas/`, con la hoja común `fichas/css/ficha.css`,
  **diez páginas** y pauta completa (ver norma 6);
- **sección de Recursos** que enlaza su ficha y sus fuentes reales;
- **color propio** en `--pri` y `--sec` de su CSS.

Al copiar el molde de otra misión hay que revisar tres cosas que se arrastran:
los rótulos de las pruebas impresas (traen el nombre de la misión anterior),
los guiones largos del motor, y la pieza inicial del laboratorio.

## 2. Norma 1-bis: sin guiones largos

Ninguna misión, ficha o texto publicable lleva guion largo. Parejas de rayas
que abren aclaración pasan a paréntesis; las que introducen, a dos puntos; los
separadores de título, a punto medio. El `—` del desplegable de pareados es
interfaz y pasa a `?`. Se comprueba con un grep antes de publicar.

## 3. Los casos salen del propio proyecto

**Norma nueva, pedida por el autor el 26 de julio de 2026.** Las misiones de
las rutas del adulto (💰 Poder, 🧠 Persuasión, 📈 Marca, 🏗️ Ingeniería del
Sistema) usan como base de sus casos **situaciones hipotéticas sobre
M.E.T.A.S y su futuro**, no ejemplos genéricos de manual.

Por qué: los conceptos se estudian para decidir, y las decisiones que van a
llegar son sobre este proyecto. Un caso inventado se olvida; una oferta que
puede tocar la puerta el mes que viene, no.

Cómo se construye un caso:

1. **La oferta**, con números realistas en lempiras aunque sean inventados.
2. **Qué mete** (el activo, la tracción, la legitimidad).
3. **Qué saca** (horas recurrentes, obligaciones, espacio de marca, confianza).
4. **La pregunta que decide**, y una **condición** con la que sí se aceptaría.

Regla de fondo que sale de los casos: casi ninguna oferta se acepta o se
rechaza completa; se acepta **con condiciones**, y las condiciones se piensan
en frío, no con alguien enfrente esperando una firma.

Los casos de la etapa 1 (ONG que regala equipo, adopción por la Secretaría,
inversionista por porcentaje, editorial y las fichas, político y el
Campeonísimo, cobro por aula, patrocinio local, anuncios en el APK) quedan como
molde de tono y de forma para las etapas siguientes.

## 4. Las respuestas correctas se reparten entre a, b, c y d

**Norma nueva, 26 de julio de 2026.** El quiz, la evaluación final y «completa
la oración» se pintan en **orden fijo**: el motor no baraja esas opciones (sí
baraja los widgets). Si al escribir el banco la correcta queda siempre en la
misma letra, se aprueba sin leer y la misión no mide nada.

Ninguna letra puede concentrar más del **40%** de las respuestas de un banco.
Se revisa y se corrige con una sola herramienta:

```
node _dev/reparte-respuestas.js --revisar   (informa y falla si hay sesgo)
node _dev/reparte-respuestas.js             (reparte y renumera los prefijos)
```

Reparte con semilla fija, mueve la opción correcta a su nueva posición y
renumera los prefijos «a) b) c) d)» del texto. No cambia enunciados, ni
opciones, ni cuál es la respuesta correcta. Al copiar el molde de otra misión
hay que correrlo, porque el sesgo se hereda con los bancos.

## 5. El guion de video y las tres lecturas

**Norma nueva, pedida por el autor el 17 de agosto de 2026.** Toda misión
nueva, desde «El acero antes del juicio» (Expediente Rojo, etapa 1), lleva
dos secciones más entre Casos y Recursos. Las misiones anteriores quedan
como están.

**El guion de video (🎬 Guion).** Un guion listo para grabar (6 a 8
minutos) que cuente el concepto de la etapa CON HISTORIA, no con
definiciones. La estructura obligatoria, que la propia sección enseña
desarmada en una tabla: gancho en frío antes de todo logo, un personaje
que quiere algo, el espejo (la historia salta a la vida del público), el
giro que desmonta lo que el público creía, la herramienta (el concepto,
ya ganado por la historia), la objeción del público concedida y
contestada, y el cierre que aterriza en una acción de esta semana con el
nombre de la misión. Cada escena lleva VOZ, IMAGEN y TEXTO EN PANTALLA.
Nada de definiciones antes del minuto dos.

**Las tres lecturas (📖 Lecturas).** Tres textos que explican el tema de
la etapa por tres puertas distintas, escritos por la casa como ejercicios
de estilo:

1. un **cuento a la manera de Jorge Luis Borges**, pero SIN su costumbre
   de las citas apócrifas: la voz, los espejos y la ironía se quedan; la
   erudición del cuento es real (obras, fechas y personas comprobables).
   El cuento debe ser atrapante y sencillo, no un laberinto;
2. un **capítulo a la manera de Miguel de Cervantes Saavedra** (el
   «Donde se cuenta...», el periodo largo, la venta, los refranes de
   Sancho), con el humor y la reflexión cervantinos al frente: si no
   hace sonreír al menos una vez, se reescribe;
3. un **ensayo a la manera de Yuval Noah Harari** (la escala de especie,
   la frase corta y sencilla, el zoom histórico y el aterrizaje en el
   presente), con datos reales: estudios, años y cifras verificables.

Regla de fondo, pedida por el autor el 17 de agosto de 2026: **toda
obra, fecha, persona o cifra citada DENTRO de las lecturas debe ser real
y comprobable; el único artificio permitido es la voz.** Los tres textos
deben ENSEÑAR el tema (que quien los lea salga sabiendo el concepto, no
solo entretenido) y llevar SIEMPRE, a la vista, la etiqueta de la regla
del estatus: **ejercicio de estilo de la casa, en homenaje; no obra de
esos autores**. Pastiche sin declarar, o pastiche con erudición
inventada, es exactamente el tipo de fuente inflada que el Estudio Mayor
enseña a cazar. La sonda de cada misión comprueba las dos secciones: 17
paneles en total, el guion con su estructura y las tres lecturas con su
etiqueta y sus anclas reales.

## 5-bis. El widget de ordenar se arrastra, y la linterna cuesta

**Norma nueva, pedida por el autor el 17 de agosto de 2026**, después de
verlo en el teléfono. En el ejercicio de ordenar pasos, las flechas ▲▼
solas no bastan: mover un paso del sexto lugar al primero son cinco
toques y la vista se pierde. Toda misión lleva por tanto:

- **Arrastre con el dedo**, hecho con eventos de puntero (no con el
  arrastre de HTML5, que en teléfono no responde) y con
  `touch-action: none` en la tarjeta, que es lo único que impide que el
  gesto se lo lleve la página. Mientras se arrastra, las demás tarjetas
  **abren el hueco** para que se vea dónde va a caer. Las flechas se
  quedan: son la vía accesible y la del ratón.
- **Linterna 🔦**, que enseña a cada tarjeta el número que le toca y
  marca en verde las que ya están en su sitio. **Y cuesta:** la
  secuencia iluminada deja de dar XP, y se avisa en pantalla. Es la
  misma regla que la casa aplica a todos sus indicadores: un XP ganado
  con la respuesta delante mide recorrido, no dominio.

Se aplica con `node _dev/mejora-widget-ordenar.js <carpeta>/<base>`, que
sirve para cualquier misión. La sonda comprueba las dos cosas y además
**simula el arrastre** (tomar la primera tarjeta y soltarla tres lugares
más abajo) para que no se rompa en silencio.

## 5-ter. La banda del encabezado es de cada misión

**Descubierto el 17 de agosto de 2026 por el autor, mirando su teléfono.**
El encabezado lleva una banda de palabras que corre de fondo, y vive en
un `::before` del CSS: como no está en el texto de la página, **ninguna
sonda la miraba y se arrastró desde la misión de Popper** hasta tres
misiones del Estudio Mayor, que anunciaban «SOCIEDAD ABIERTA ·
RACIONALISMO CRÍTICO» detrás de títulos que no tenían nada que ver.

Cada misión escribe su propia banda con el vocabulario de su etapa, y la
sonda la lee con `getComputedStyle(hero, '::before')`, que es la única
manera de verla. Lección general: **lo que no está en el texto también se
copia**, y lo que ninguna sonda mira, tarde o temprano miente.

## 6. La ficha va en diez páginas, y llenas

**Norma nueva, pedida por el autor el 26 de julio de 2026.** Toda ficha de
F.A.R.O tiene **exactamente 10 páginas tamaño carta**. Ni menos, porque estas
fichas no son un resumen: son el material de estudio de la familia y el tema se
explica completo, con casos reales y la pauta de todo lo que se propone. Ni más,
porque una ficha que se estira pierde el hilo.

Y llenas: **cada página va entre 215 y 252 mm** de alto, con la letra de
impresión en **10 pt**. Los 252 son lo que de verdad se puede poner dentro de una
hoja de esta plantilla, medido con el PDF en la mano. La única que puede ir más
corta es la última.

⚠️ **De dónde salen los 252, porque el número equivocado costó dos vueltas.** La
carta mide 279,4 mm y la hoja declara 11 mm de margen, así que el papel deja
257,4. Pero con `min-height: 257mm` **cada hoja salía partida en dos** (19 en vez
de 10), porque el margen del primer bloque de la sección se suma por fuera. Con
252 salen las diez justas. Y el valor anterior, 226, era peor: es la carta menos
una pulgada por lado, o sea el margen **por defecto de Chrome**, no el que
declara esta hoja; por creerlo se desperdiciaban 26 mm por página y la ficha se
veía llena a dos tercios, con la letra encogida a 9,5 pt para que «cupiera».

Se mide, no se calcula a ojo, y se confirma imprimiendo:

```
node _dev/servidor-estatico.js
_dev/mide-ficha-paginas.html?f=<ficha>.html              (mide las páginas)
_dev/mide-ficha-paginas.html?f=<ficha>.html&cortes=1     (propone los 10 cortes)
node _dev/repagina-ficha.js fichas/<ficha>.html          (los aplica)
chrome --headless --print-to-pdf=... http://localhost:8124/fichas/<ficha>.html
```

El medidor carga la ficha con las reglas de `@media print` aplicadas (en pantalla
la hoja lleva otro relleno y otra letra, así que medir en pantalla engaña) y falla
si alguna página desborda, si alguna queda floja o si no son 10. **El PDF es el
único juez**: si al contar sus hojas no salen 10, la medida estaba mintiendo.

Dos cosas que se aprendieron repartiendo: el contenido no puede pasar del **91%**
de la capacidad (unos 2.290 mm en total), porque cada hoja cierra donde termina un
bloque y sobra lo que ese bloque no alcanzaba a llenar; y los **bloques grandes hay
que partirlos** (una pauta de 140 mm no se reparte, una caja por ejercicio sí).

Cómo se llenan diez páginas sin relleno: el tema por dentro (mecanismo, no solo
definición), **casos de estudio reales** con su fuente, un guion de qué decir,
ejercicios para lápiz y la **pauta completa**, sin dejar ninguno a medias. Las
respuestas de un ejercicio nunca se imprimen en la misma página que el
ejercicio: van en la pauta del final.

## 7. Verificación antes de publicar

Toda misión nueva se mide con una sonda en `_dev/` (Chrome headless a 380 px,
con `_dev/servidor-estatico.js`): secciones completas, bancos con su tamaño,
laboratorio, las dos pruebas generándose con el nombre correcto, la sopa
legible, la ficha respondiendo, y la ruta mostrando la etapa en el mapa.

Además, dos comprobaciones que valen para TODAS las misiones a la vez:

- `node _dev/reparte-respuestas.js --revisar`: el reparto de las letras.
- `_dev/probe-quiz-todas.html`: carga las seis misiones y comprueba que el
  quiz funcione, que la opción marcada como correcta sea la del banco y que
  ninguna letra pase del 40%.
