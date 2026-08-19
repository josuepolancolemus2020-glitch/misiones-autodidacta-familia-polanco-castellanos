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

**Las tres lecturas (📖 Lecturas).** (Desde el 19 de agosto de 2026 son
cinco: ver la norma 5-quinquies.) Tres textos que explican el tema de
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

## 5-quater. Las lecturas se examinan, y se imprimen

**Norma nueva, pedida por el autor el 17 de agosto de 2026**, desde «La
palabra con expediente» (Gafas, etapa 1). Leer no es lo mismo que haber
leído, así que la sección de Lecturas no termina en los tres textos. Cierra
con tres baterías, **dentro de la misma sección** (los paneles siguen siendo
17):

- **15 preguntas de comprensión lectora** (25 desde que las lecturas son
  cinco: norma 5-quinquies), de opción múltiple, **cinco por
  texto**, y cada una dice de qué lectura sale. Se contestan con el texto
  delante: no es un examen de memoria. Se pintan en orden fijo, así que
  **les toca la norma 4** y el banco (`lectComprensionBank`) está en la lista
  de `_dev/reparte-respuestas.js`.
- **10 de completar**, con entrada de texto y la comprobación tolerante del
  motor (tildes y mayúsculas no cuentan).
- **10 de análisis complejo**, abiertas, con su pauta escrita que se tapa y
  se destapa. **Van sin XP a propósito:** una respuesta abierta que se premia
  sola se contesta a la carrera.

Y todo se imprime, con hojas propias de la sección:

- **cada lectura por separado**, con su botón dentro de su propia tarjeta;
- **las tres juntas** en un pliego, cada una arrancando en su hoja;
- **el pliego de preguntas** con las tres secciones y la **pauta en su propia
  hoja al final**, porque las respuestas no se imprimen en la misma página
  que el ejercicio.

**La etiqueta del estatus viaja impresa con el texto, siempre**, en un
recuadro antes de empezar: ejercicio de estilo de la casa, en homenaje, NO
obra de ese autor, y toda obra, fecha y persona de dentro es real y
comprobable. Una hoja suelta se fotocopia y viaja sola, y un pastiche sin
declarar es exactamente la fuente inflada que el Estudio Mayor enseña a
cazar.

⚠️ **Esto no toca la norma 6.** Estas hojas no son fichas: no usan
`fichas/css/ficha.css`, no usan la clase `.pagina`, no viven en `fichas/` y
no se miden con `_dev/mide-ficha-paginas.html`. Se arman en el momento, en
una ventana de impresión, con su propia hoja de estilo. La ficha de diez
páginas sigue siendo lo que la norma 6 dice que es, y se mide igual.

La sonda de cada misión comprueba las tres baterías (tamaño, forma, cinco
preguntas por voz y pauta en las diez de análisis), que se puedan contestar
en pantalla, y **la impresión de verdad**: intercepta `window.open`, corre
los botones y lee el documento que se habría mandado a la impresora,
exigiendo el texto completo, la etiqueta del pastiche y los saltos de página.

## 5-quinquies. Las lecturas son cinco: llegan las dos entrevistas

**Norma nueva, pedida por el autor el 19 de agosto de 2026.** La sección de
Lecturas pasa de tres textos a **cinco**. Rige para toda misión nueva y se
aplicó también, retroactivamente, a las doce misiones del Estudio Mayor que ya
estaban construidas (las dos que no tenían Guion ni Lecturas los recibieron
completos con esta misma pasada). Los dos textos nuevos son entrevistas por
escrito, y el género trae reglas propias:

1. **La entrevista de la casa (lectura 4).** Una entrevista con el personaje
   central de la etapa: el autor o la autora de la obra que la etapa estudia.
   La firma un entrevistador elegido entre **los grandes del idioma**: Joaquín
   Soler Serrano, Eduard Punset, Iñaki Gabilondo, Julio Scherer García, Elena
   Poniatowska, Rosa Montero, Juan Cruz, Ima Sanchís, Jordi Évole, Carmen
   Aristegui, entre otros; se escoge el que mejor case con el entrevistado, y
   la presentación de la pieza dice quién es ese entrevistador DE VERDAD: su
   programa o su medio, sus años y alguna de sus entrevistas reales. Así la
   lectura enseña dos cosas a la vez: el tema de la etapa y un pedazo de la
   historia del periodismo en español. Con los entrevistados muertos, la pieza
   puede acogerse al viejo género radiofónico de las entrevistas imposibles.
2. **La conversación del Loco de la Colina (lectura 5).** Jesús Quintero
   conversa con el poeta Antonio Gala sobre el tema de la etapa. La voz de
   cada uno se respeta con oficio: las preguntas cortas, susurradas y los
   silencios de Quintero (los silencios se escriben entre paréntesis, como
   acotación); el periodo largo, la ironía y la melancolía luminosa de Gala.
   Los datos de la etapa entran por los dos lados y el lector sale sabiendo
   el concepto, no solo entretenido.
3. **La etiqueta crece con el género.** Las dos entrevistas son **ficticias y
   se declaran**: el encuentro y las palabras son invención de la casa; las
   personas son reales, y toda obra, fecha y cifra que se les pone en la boca
   es real y comprobable. La etiqueta lo dice a la vista en pantalla y viaja
   impresa con cada texto, como manda la norma 5-quater.
4. **Se examinan igual que las otras.** La comprensión lectora sigue siendo de
   **cinco preguntas por texto**, así que con cinco textos son **25**. Las
   etiquetas de voz del banco (`t`) son exactamente: `Borges`, `Cervantes`,
   `Harari`, `Entrevista` y `Quintero y Gala`. Completar sigue en 10 y
   análisis complejo en 10, por sección. Al banco ampliado le toca la norma 4.
5. **Se imprimen igual que las otras.** Cada entrevista con su botón en su
   propia tarjeta, el pliego junto pasa a ser de las cinco (la función se
   llama `imprimirTodasLasLecturas`) y el pliego de preguntas declara 25 de
   comprensión. Las tarjetas nuevas llevan los ids `lect-entrevista` y
   `lect-gala`, iguales en todas las misiones, para que las sondas los
   encuentren sin adivinar.
6. **Sin guion largo ni en el diálogo.** La raya de diálogo está prohibida
   como todos los guiones largos (norma 1-bis): quien habla se marca con su
   nombre en mayúsculas y punto, al estilo de los guiones de teatro.

## 5-sexies. Las lecturas se subrayan, se anotan y eso se imprime

**Norma nueva, pedida por el autor el 19 de agosto de 2026.** La sección
de Lecturas se lee como un libro de verdad: se puede **subrayar con cinco
colores, escribir notas, y todo eso sale impreso con el texto**. Lo hace
un aparato compartido, `js/lecturas-marcador.js` con
`css/lecturas-marcador.css`, que cada misión carga con dos líneas
después de sus propios archivos.

**Es la segunda excepción de la casa a la norma 1** (tres archivos
propios por misión), y por la misma razón que `fichas/css/ficha.css`:
esto no es contenido de una etapa, es un aparato de lectura que tiene
que comportarse igual en todas. Copiado doce veces, a la tercera
corrección ya no coincidirían.

### El código de colores, que es el ejercicio

Un subrayado de un solo color dice «esto importa», y al releer eso no
sirve porque para entonces importa medio texto. Aquí hay que decidir
**qué** es lo que importa, y esa decisión es el ejercicio:

| Color | Inicial | Categoría | Qué se marca |
|---|---|---|---|
| Amarillo | D | **Dato** | cifra, año, capítulo, edición: lo comprobable |
| Verde | V | **Voz** | quién lo dice: autor, obra, fuente |
| Rojo | I | **Idea** | la tesis, el mecanismo, el concepto |
| Azul | C | **Contracita** | la frase que estorba a la tesis, la objeción |
| Morado | ? | **Duda** | no lo entendí, o hay que verificarlo |

El azul no es un color más: **la contracita es la prueba de lectura del
Estudio Mayor**, la frase del mismo autor que apunta al lado contrario.
Con color propio, una lectura sin ninguna marca azul se delata sola.

### Tres señales, no una

Cada marca lleva **color, trama de subrayado e inicial volada**, las tres
a la vez, y con cualquiera de ellas ya se sabe qué es. Porque estas
lecturas se imprimen y se **fotocopian**, y en blanco y negro cinco
colores son cinco grises iguales; y porque quien no distingue bien los
colores tiene derecho a usar esto. Las cinco tramas han de ser
**distintas entre sí** y la sonda lo comprueba comparándolas: dos
subrayados sólidos que solo se diferencian en el grosor no valen, que ya
pasó una vez y lo cazó la sonda, no el ojo.

### Lo demás que es obligatorio

1. **Se guarda en la clave de progreso de la misión**, con el sufijo
   `_marcas`. Ni almacén nuevo ni nube: una nota de lectura es lo más
   privado que escribe un estudiante, y se queda en su aparato.
2. **Marcar no da XP.** Subrayar no es aprender, y un indicador que se
   compra pintando mide recorrido y no dominio, que es la regla de la
   casa para todos sus contadores.
3. **Nunca se pierde una nota.** Si la misión se corrige y el texto se
   mueve, la marca se reancla sola por su texto exacto; si no aparece,
   NO se borra: queda como huérfana, con su nota, y avisa en el panel.
4. **Al imprimir sale todo**: el subrayado dentro del texto (con la
   orden `print-color-adjust` para que el navegador no se coma los
   fondos), la leyenda del código de colores, y una hoja final con las
   notas numeradas, donde el número es el mismo que va volado en el
   texto. Hay además una **hoja de repaso** con solo lo marcado.
5. **La barra de marcar va anclada abajo**, a todo el ancho y con
   botones de 46 px: en un teléfono de 380 px una barra flotante se sale
   de la pantalla o la tapa el menú de copiar del sistema.
6. La sonda `_dev/probe-lecturas-marcador.html` comprueba el aparato
   entero (marcar, anotar, recordar tras recargar, imprimir de verdad
   interceptando `window.open`) **y que las doce misiones lo traigan
   enganchado**.

## 5-septies. El marcador va en TODA misión, y lo marcado viaja

**Norma nueva, pedida por el autor el 19 de agosto de 2026.** El marcador
de la norma 5-sexies deja de ser cosa del Estudio Mayor: va en **las 38
misiones del catálogo**, y **lo subrayado y lo anotado se guarda de modo
que aparezca al cambiar de aparato**.

### Dónde se subraya en una misión sin Lecturas

Las rutas del adulto no tienen sección de Lecturas, pero tienen tanta
prosa de estudio como ellas. El marcador mira el documento y decide solo,
sin nada que configurar por misión:

- si hay lecturas, las zonas son las **cinco tarjetas** de lectura;
- si no, son las secciones de prosa: **Aprende, Estructura, Casos y
  Guion**.

Y dentro de una zona se puede subrayar la prosa: los párrafos sueltos de
las tarjetas, el cuerpo de los avisos `.tip` (donde suele estar la regla
de la etapa dicha en una frase) y las cajas `.ex-box`. **Nunca un trozo
que lleve dentro un botón, un campo o un elemento con `id`**: al pintar
una marca se rehace el HTML de ese trozo, y rehacer un trozo con un botón
lo dejaría sin su manejador, es decir rompería la misión en silencio.

### Lo marcado viaja, y cómo

Esto **cambia la decisión anterior** de la norma 5-sexies, que dejaba las
notas en el aparato. Ahora se guardan **dos veces**:

1. **En el aparato**, primero y siempre. Es lo que hace que funcione al
   instante y sin señal. La nube va por encima, nunca en lugar de esto.
2. **En la nube de la casa**, tabla `lecturas_marcas`
   (`supabase/sql/lecturas_marcas.sql`), con seguridad por fila. La llave
   es **el usuario que entró, no el aparato**: los cuatro comparten
   tabletas y las notas de una hija no tienen por qué salirle al padre.

Cuatro reglas que no son de adorno, y cada una viene de un fallo posible:

- **Borrar deja una lápida, no un hueco.** Si el teléfono borrara la fila
  sin más, la tableta que aún tiene su copia la volvería a subir y la
  marca resucitaría sola. La lápida se barre a los 180 días.
- **Al chocar dos versiones, gana la más reciente; pero si las dos traen
  NOTA escrita y son distintas, se conservan LAS DOS**, una debajo de la
  otra. Un subrayado se rehace en dos segundos; lo que alguien escribió
  con sus palabras, no. El reloj que ordena es el del aparato, que puede
  estar mal, y por eso lo irremplazable no se descarta nunca.
- **La nube se carga sola y solo si hace falta.** El marcador trae
  `supabase.min.js` y `js/auth.js` **únicamente si ya hay sesión guardada
  en ese navegador**. Cargarlos siempre haría que las 38 misiones pidieran
  red al abrirse aunque nadie fuera a subrayar. El cliente lo sigue
  creando `js/auth.js`, que es el ÚNICO de la casa.
- **El panel dice a la vista si viajó o no**: «☁️ Guardado también en la
  nube» o «📴 Solo en este aparato». Quien escribe una nota tiene derecho
  a saberlo sin abrir nada.

### Dónde vive el panel

Antes de las preguntas de las lecturas si las hay; si no, **al final de
Recursos**, que es la última sección de toda misión. La leyenda del código
de colores va arriba del todo, en la primera tarjeta de la primera zona:
hay que conocer el código **antes** de subrayar.

### Verificación

`_dev/probe-lecturas-marcador.html` comprueba, además de lo suyo, que las
**38 misiones del catálogo** traigan el marcador y su hoja en orden y
**sin cargar la nube de más**, y prueba la sincronización con un cliente
falso: que suba, que baje lo de otro aparato, que el borrado viaje como
lápida y que **al chocar dos notas distintas se conserven las dos**. Las
38 se miran leyendo su HTML y tres se abren de verdad, una de cada clase:
abrir treinta y ocho misiones con su motor completo cuelga el banco de
pruebas antes de la décima.

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
