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
- **sección de Recursos** que enlaza su ficha y sus fuentes reales, y que
  lleva la **repisa de enlaces** con las herramientas de estudio hechas con
  máquina (ver norma 6-bis);
- **color propio** en `--pri` y `--sec` de su CSS.

Al copiar el molde de otra misión hay que revisar **cuatro** cosas: los
rótulos de las pruebas impresas (traen el nombre de la misión anterior), los
guiones largos del motor, la pieza inicial del laboratorio, y **que estén
todos los archivos que la página pide**. La cuarta se añadió el 20 de agosto
de 2026, después de publicar una misión sin `js/html2canvas.min.js`: cada
misión lleva su propia copia de esa librería en su carpeta, el andamio copió
el motor y no la librería, y el diploma se habría quedado sin imagen sin que
nadie se enterara. **Ninguna sonda miraba los enlaces internos**, así que la
sonda de cada misión nueva comprueba ahora que todo `src` y `href` propio
responda de verdad.

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
5. ~~**La barra de marcar va anclada abajo**~~ → **la barra se abre
   pegada a lo que se acaba de seleccionar** (corregido el 20 de agosto
   de 2026, ver la norma 5-nonies). Los dos motivos de la decisión vieja
   eran buenos y siguen resueltos, pero resolviéndolos en vez de
   esquivarlos: la barra se pega al borde antes que salirse, se prueba
   primero **debajo** de la selección (donde el menú del sistema casi
   nunca se pone) y, si no cabe ni arriba ni abajo, **vuelve a anclarse
   al pie**, que es la garantía vieja y sigue estando. Los botones
   siguen siendo de 46 px, que eso no era el problema.
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

Las reglas, y cada una viene de un fallo que se probó de verdad:

- **Cada quien tiene su cajón en el aparato.** La clave local lleva la
  misión Y quién entró. En esta casa las tabletas se comparten, y con un
  solo cajón por misión lo que subrayaba una hija se lo encontraba el
  padre al entrar, y encima se subía a la cuenta de él. Lo marcado antes
  de identificarse se muda al primero que entra, y solo una vez.
- **Borrar deja una lápida, no un hueco.** Si el teléfono borrara la fila
  sin más, la tableta que aún tiene su copia la volvería a subir y la
  marca resucitaría sola. La lápida se barre a los 180 días, y lo que
  solo vive en la nube no se vuelve a subir: si se subiera, ninguna
  lápida llegaría nunca a los 180 días.
- **Antes de fusionar se mira la descendencia.** Cada marca recuerda qué
  versión suya quedó en la nube. Si lo de arriba es justo eso, lo de aquí
  es una corrección MÍA y manda sin más: sin esta comprobación, corregir
  una nota le pegaba debajo su propia versión vieja, y ni siquiera hacía
  falta un segundo aparato para verlo.
- **En un choque de verdad no se pierde nada escrito.** Si las dos traen
  nota, se conservan las dos, unidas por líneas y sin repetir, con las
  del que gana primero: así fusionar dos veces da lo mismo que fusionar
  una y la nota no crece en cada viaje. Si solo una trae nota, esa se
  conserva, porque el otro nunca llegó a verla y por tanto no la borró.
  Y **una nota que el que borró no conocía gana al borrado**: la marca
  vuelve con ella en vez de quedar enterrada. El reloj que ordena es el
  del aparato, que puede estar mal, y por eso lo irremplazable no se
  descarta nunca.
- **Sin sesión no se descarga la nube, ni aunque se pulse el botón.**
  Traerse Supabase entero para acabar diciendo «entra primero» es cobrarle
  a alguien datos por una respuesta que ya se sabía. Y al revés: con
  sesión guardada pero sin señal, el panel dice que falló la nube, nunca
  que hay que entrar, porque mandar a alguien a pelear con una contraseña
  que no hacía falta es el peor aviso posible.
- **El panel nunca miente sobre dónde está lo escrito.** Hay un estado
  para lo que se acaba de marcar y todavía no ha subido; decir «guardado
  también en la nube» con algo sin subir es lo que hace que alguien
  cierre tranquilo y pierda su trabajo. Y lo que se marque mientras hay
  una sincronización en vuelo se apunta y se sube al terminar, en vez de
  perderse hasta el siguiente cambio.
- **Un repintado no puede llevarse una selección.** Lo que llega de la
  nube espera a que se cierre la barra de marcar, y no se repinta nada si
  la sincronización no trajo ningún cambio.
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

## 5-octies. El marcador también en las fichas, sin tocar las diez hojas

**Norma nueva, pedida por el autor el 19 de agosto de 2026.** Las
**37 fichas imprimibles** llevan el marcador: se subrayan y se anotan en
la pantalla, y **lo subrayado sale impreso con la ficha**. Cada hoja de
la ficha es una zona (`hoja-1`, `hoja-2`...) y se marca la prosa: los
párrafos sin clase, también los de dentro de las cajas, y los puntos de
las listas, que en estas hojas son los objetivos y los pasos.

### La regla que manda aquí: la norma 6 no se toca

Una ficha son **diez hojas exactas**, y la hoja más apretada del
proyecto va a **0,4 mm del corte**. Cualquier cosa que añada alto al
imprimir parte esa hoja y deja once. De ahí tres decisiones que no son
negociables:

1. **Al imprimir, el subrayado no añade ni un píxel.** El color de fondo
   y la trama se dibujan encima del texto y no lo mueven. La **inicial
   volada se calla en el papel**: es un carácter más, y un carácter
   puede empujar una línea, y una línea puede partir una hoja. Quedan
   las otras dos señales, que ya distinguen las cinco categorías hasta
   fotocopiadas.
2. **El panel va fuera de las diez hojas**, al final del documento, y no
   se imprime. Metido dentro de la décima la desbordaría.
3. **Las notas escritas no se meten en la ficha.** Salen en su propia
   **hoja de repaso**, que se arma aparte con su botón. Una ficha con
   notas dentro dejaría de ser una ficha de diez hojas.

### Cada ficha guarda lo suyo

La clave sale del **nombre del archivo** (`ficha-atomos-contra-miedo` →
`faro_ficha-atomos-contra-miedo`), porque una ficha no declara
`SAVE_KEY`. Sin eso, las treinta y siete compartirían cajón y las marcas
de una saldrían en otra. Lo demás es igual que en las misiones: cajón
por usuario y viaje a la nube por la misma tabla, sin SQL nuevo.

### Cómo se comprueba, y no basta con mirar

`_dev/probe-marcador-fichas.html` mide el alto de las diez hojas **con
las reglas de impresión puestas y en el ancho real del papel** (194 mm,
igual que el medidor de la norma 6, y con `min-height: 0`, que es lo que
deja ver el alto del contenido y no el mínimo forzado). Subraya unos
cuarenta trozos repartidos por toda la ficha y exige que **ninguna hoja
cambie de alto**.

Y como manda la norma 6, **el PDF es el único juez**: se imprimió a PDF
la ficha más apretada, con marcas y sin ellas, y las dos veces salieron
**diez páginas**. Se hace con un perfil de navegador sembrado:

```
node _dev/servidor-estatico.js
chrome --user-data-dir=PERFIL ...   (primero se siembran las marcas)
chrome --user-data-dir=PERFIL --print-to-pdf=...  fichas/<ficha>.html
```

## 5-nonies. Seis lecturas, plegadas, y cada una con sus preguntas dentro

**Norma nueva, pedida por el autor el 20 de agosto de 2026**, con cinco
cambios de una vez sobre la sección de Lecturas. Rige para toda misión
nueva y se aplica hacia atrás a las trece del Estudio Mayor.

### 1. Llega la sexta lectura: **el careo**

A las cinco de la norma 5-quinquies se le suma un **debate**, para leer
las dos posturas de una disputa con sus objeciones y sus refutaciones.
Su tarjeta es `lect-debate` y su etiqueta de banco es `Debate`.

El careo tiene **seis partes obligatorias y siempre en este orden**:

1. **La pregunta en disputa**, una sola y clara.
2. **La postura A en su mejor versión.**
3. **La postura B en su mejor versión.**
4. **Las réplicas**: A contesta a B y B contesta a A.
5. **El terreno común**: qué aceptan las dos, que casi siempre es más de
   lo que parece desde fuera.
6. **Lo que sigue en disputa, y qué dato lo resolvería.**

Y trae **reglas propias que no comparte con las otras cinco**:

- **No imita a nadie**, así que **no lleva la etiqueta de pastiche**:
  lleva la suya. Los turnos los firman los **papeles** en mayúsculas y
  con punto (`MODERACIÓN.`, `LA DEFENSA.`, `LA OBJECIÓN.`), y las
  personas reales se citan **en tercera persona como fuentes, nunca como
  hablantes**. Las entrevistas de la norma 5-quinquies pueden prestarle
  voz a un muerto porque lo declaran; ponerle palabras inventadas en la
  boca a un investigador vivo es otra cosa, y aquí no se hace.
- **La disputa tiene que existir de verdad**, con dos lados que alguien
  sostiene en la literatura y sus fuentes citadas por autor y año. Un
  dilema inventado para la ocasión no es un careo, es un ejercicio de
  redacción.
- Manda **la regla del acero antes del juicio** (Expediente Rojo, etapa
  1): cada postura se escribe como la escribiría su mejor defensor. Un
  lado redactado para perder invalida la lectura entera.
- Sigue rigiendo, como en las otras cinco, que **toda obra, fecha, cifra
  y persona citada dentro es real y comprobable**.

### 2. Las seis se pliegan, y se elige una

Seis textos largos abiertos de golpe son veinte pantallas de alto en un
teléfono. Al entrar en la sección **las seis están plegadas** y arriba
hay un **índice** con las seis, su voz y cuántas preguntas trae cada
una. Abrir una **cierra la anterior** (acordeón): dejar varias abiertas
devuelve el problema que esto viene a resolver.

### 3. Cada lectura lleva sus preguntas DENTRO

Las tres baterías de la norma 5-quater dejan de vivir juntas al final de
la sección y pasan a estar **dentro de cada texto**, filtradas por su
voz. Antes, quien acababa el cuento tenía que bajar hasta el fondo,
buscar cuáles de las veinticinco preguntas eran las suyas y volver.

El reparto por lectura es **5 de comprensión, 2 de completar y 2 de
análisis**, así que con seis textos los bancos quedan en **30, 12 y 12**
(54 preguntas). **Cada pregunta de los tres bancos lleva su etiqueta `t`
con la voz**, también las de análisis, que antes no la tenían.

Al imprimir, **cada lectura sale con sus preguntas detrás y su pauta en
hoja aparte**, para que una hoja suelta sirva sola. El pliego con las 54
juntas se queda como estaba.

### 4. La marca de lectura: dónde se quedó uno

Estos textos son largos y se leen en varias sentadas, así que hace falta
un punto de libro. **Lo pone el lector**, no el aparato: se selecciona la
palabra donde uno lo deja y se pulsa **🔖 Aquí me quedé** en la misma
barra con la que se subraya. Al volver, la marca está pegada a esas
palabras, y **se quita tocándola**: un dedo encima y ya, sin menús y sin
confirmar nada. Volver a leer es entonces un solo gesto.

Va en la barra de marcar, y no en un botón aparte, porque es el mismo
gesto que subrayar: se elige un trozo y se decide qué hacer con él. Un
botón en otro sitio obligaría a soltar el texto, buscarlo y volver.

**La primera versión la ponía sola** (un observador miraba qué párrafo
estaba en la franja central de la pantalla y le pegaba una cinta en el
margen izquierdo) y el autor la mandó quitar el mismo día que se
publicó. El razonamiento para automatizarla era el de siempre en esta
casa (lo que hay que acordarse de pulsar no se pulsa, como enseñó el
Buzón), y aun así estaba mal: **una raya que se mueve al lado del texto
desconcentra justo mientras se lee**, que es cuando menos falta hace, y
encima señalaba párrafos que uno solo estaba cruzando. La lección que
queda es que la regla del Buzón vale para lo que hay que **recoger**, no
para lo que hay que **decidir**: dónde se dejó de leer lo sabe el lector
y nadie más.

**Se queda en el aparato**, que es una decisión y no un olvido: meterla
en la nube obligaría a tocar la tabla `lecturas_marcas` y a correr SQL
nuevo a mano desde la tableta, para algo que casi siempre es distinto en
cada aparato (en el teléfono se lee en la fila del banco, en la tableta
de noche). **El panel lo dice a la vista**, porque el resto del marcador
sí viaja y callarlo sería el aviso deshonesto que la casa tiene
prohibido.

Y **no puede ocupar ni un píxel**, ni de alto ni de ancho. Esto se midió
tres veces y las dos primeras estaban mal: el 🔖 volado como la inicial
de los subrayados empujaba el párrafo 2,33 px (un emoji trae la caja más
alta que una letra), y en caja de alto cero seguía ocupando **ancho**,
con lo que en un párrafo de última línea casi llena hacía saltar una
palabra de renglón: 18 px, una línea entera. Va **fuera del flujo**,
colgado del final de la marca. En una ficha de diez hojas a 0,4 mm del
corte, un renglón de más es una hoja de más (norma 5-octies).

### 5. La barra de marcar se abre junto a la selección

Ver la corrección del punto 5 de la norma 5-sexies. En resumen: se abre
**pegada al trozo**, se pega al borde antes que salirse, prueba primero
**debajo** de la selección, y si no cabe ni arriba ni abajo vuelve a
anclarse al pie. Va en **coordenadas del documento** y no de la pantalla,
para que al desplazar el texto viaje con el trozo al que pertenece en vez
de quedarse señalando otra cosa.

### Dónde vive todo esto

En **`js/lecturas.js` con `css/lecturas.css`** (el plegado, el índice y
las preguntas de cada lectura) y en `js/lecturas-marcador.js` (la barra y
la marca de lectura). Es la **tercera excepción de la casa a la norma 1**
y por el mismo motivo que las otras dos: esto no es contenido de una
etapa, es un aparato de lectura que tiene que comportarse igual en las
trece misiones. Copiado trece veces, a la tercera corrección ya no
coincidirían.

Cada misión solo pone **sus seis tarjetas** (con `lect-nota` y `lect-p`)
y **sus tres bancos etiquetados**. El aparato se carga con dos líneas,
**antes** del marcador, porque el marcador necesita el documento ya
montado para saber cuáles son sus zonas subrayables.

### Verificación

La sonda de cada misión comprueba las seis lecturas, el careo con sus
seis partes y sus anclas reales, que las seis empiezan plegadas **con el
alto calculado y no solo con el atributo** (que ya falló una vez en «Mis
Rutas»), que abrir una cierra la anterior, que cada lectura trae sus tres
baterías y suma XP donde debe, que **la barra se abre cerca del trozo y
sin salirse en 380 px**, y que la marca de lectura **no se pone sola**,
se pone desde la barra, se guarda, se quita al tocarla y devuelve a su
sitio. La de la ficha cuenta además **las diez hojas con la marca
puesta**, que es la única prueba que vale de que no ocupa sitio.

### Cuatro trampas de esta norma, que ya costaron una tarde

Las cuatro salen de meter las preguntas dentro de cada lectura, y
ninguna se ve leyendo el código: se ven cuando una sonda suspende sin
que haya nada roto.

1. **El texto de los bancos ahora está en la página.** Antes las
   baterías se pintaban al pulsar un botón; ahora el aparato las monta al
   cargar, así que `document.body.textContent` incluye las 54 preguntas
   con sus opciones y sus guías. Toda comprobación que barra la página
   entera (la de **cero partidismo hondureño actual**, la del temario de
   la misión molde, la del guion largo) empieza a contar palabras que
   viven en el banco. Cuando salte, la salida sana casi siempre es
   **cambiar la palabra del banco**, no ablandar el guardián: una guía
   que dice «la regla candidata» se escribe «la regla que se propone» y
   el guardián sigue sirviendo para lo que se puso.
2. **La hoja impresa lleva lo subrayado.** Si la sonda marca un trozo
   antes de imprimir (y lo hace, porque hay que comprobar la barra), el
   `<mark>` parte la frase por dentro: «biblio</mark>teca». Una sonda que
   busque prosa en la hoja tiene que mirarla **sin etiquetas**; las
   comprobaciones de estructura siguen mirando el HTML tal cual.
3. **`[id^="lect-"]` cuenta doce, no seis.** El aparato envuelve el
   cuerpo de cada tarjeta en un `div` con `id="lect-cuerpo-…"` para poder
   plegarlo. Para contar tarjetas se cuenta **`.card[id^="lect-"]`**.
4. **Los enunciados de análisis no llevan número de cabeza.** El número
   era el del banco global de veinticinco; con dos preguntas por lectura
   ya no dice nada, y en el pliego de las 54 sale **dos veces**
   («1. 1. Don Aciar…»), porque la hoja antepone su propio contador. En
   pantalla no se nota, porque el aparato lo quita al pintar: es un
   defecto que **solo aparece en el papel**, que es donde nadie mira
   hasta que ya se fotocopió.

---

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

**Segunda vuelta, 20 de agosto de 2026.** La banda de Popper no estaba en
tres misiones: estaba en **veinticuatro más**, todas las rutas del adulto
y los dos módulos de autocapacitación, porque el molde viajó de misión en
misión con la banda dentro. Cada una lleva ya la suya, y la sonda de
enlaces y catálogo lee ahora la banda de las cuarenta de una pasada y
**suspende si dos misiones comparten banda**: el duplicado, que es la
huella del arrastre, ya no puede volver a pasar inadvertido.

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

## 6-bis. La repisa de enlaces: las herramientas de estudio de máquina

**Norma nueva, pedida por el autor el 27 de agosto de 2026**, estrenada como
piloto en «La cadena y el hueco» (Hilo que Tira, etapa 1) y pensada desde el
primer día para llevarse a las demás misiones.

El autor le da una misión entera a NotebookLM y la máquina le devuelve
material de repaso: un resumen en audio, un video, un mapa mental, una guía,
una línea de tiempo. Ese material vivía en el teléfono de quien lo generó, o
sea que no existía para nadie más. La **repisa** le da sitio dentro de la
sección de Recursos de la misión que resume, que es el único lugar donde
alguien lo va a buscar.

Es un **aparato compartido**, `js/recursos-enlaces.js` con
`css/recursos-enlaces.css`, y por tanto **la quinta excepción a la norma 1**
(tres archivos propios por misión), por el mismo motivo que `js/lecturas.js`,
el marcador, `fichas/css/ficha.css` y el taller de la memoria: un aparato
copiado a cuarenta misiones se arregla en una y se queda roto en treinta y
nueve.

### Cómo se monta en una misión

Tres cosas, y ninguna toca el aparato:

1. En el HTML, **después** del CSS de la misión (se tiñe de su `--pri`):
   `<link rel="stylesheet" href="../../css/recursos-enlaces.css">`, y al
   final, **después** del JS de la misión:
   `<script src="../../js/recursos-enlaces.js"></script>`.
2. En el HTML, dentro de Recursos, el bloque declarativo `.re-caja` con
   `data-re-repisa`: el rótulo, el párrafo de presentación, el recuadro
   `.re-aviso`, el `<div class="re-rejilla">` donde se pintan las tarjetas, el
   formulario y sus dos botones. **Los textos son de cada misión y se
   escriben con su voz**; el aparato solo les pone el comportamiento.
3. Al final del JS de la misión, `window.RECURSOS_ENLACES` con su `mision`
   (clave de almacén **propia**, nunca heredada del molde) y sus `enlaces`.

### El formato de cada enlace

| Campo | Qué es |
|---|---|
| `tipo` | `audio`, `video`, `mapa`, `guia`, `informe`, `preguntas`, `linea`, `tarjetas` o `web`. Decide el icono y el color |
| `titulo` | lo que se lee grande. Que diga QUÉ es y DE QUÉ, no «Resumen 1» |
| `url` | `http` o `https`. Sin esto la tarjeta sale de muestra, sin enlazar |
| `desc` | dos líneas: **qué trae y qué NO** |
| `fuente` | quién lo hizo (NotebookLM, Gemini, la casa). Sale en el pie |
| `origen` | `maquina` (por defecto) o `casa`. Es la etiqueta de estatus |
| `dura` | «14 min», «6 páginas». Opcional |

**La descripción es el campo que decide si la repisa sirve**, y por eso el
formulario la exige. «Resumen del tema» no dice nada y obliga a abrir los seis
enlaces para saber cuál era; «los dos conceptos con ejemplos de cine, sin la
prueba del conector» ahorra cinco. Es la misma regla con la que se escriben
las fuentes de la misión, aplicada a lo que hizo una máquina.

### Las cuatro reglas de la repisa, y ninguna es de adorno

1. **Lo que hizo una máquina lo dice.** Es la regla de oro del Estudio Mayor:
   ninguna fuente entra sin su etiqueta. Un resumen automático es material de
   **repaso** de lo que ya está en la misión, no una fuente: puede equivocarse
   en un dato y lo dice con el mismo tono seguro con el que dice los buenos.
   El recuadro va a la vista, siempre, y no se puede apagar desde la misión.
   Colgar resúmenes automáticos al lado de Forster sin distinguirlos, en una
   ruta que enseña a cazar fuentes infladas, sería el chiste malo.
2. **Toda tarjeta dice a dónde lleva antes de tocarla.** El dominio va escrito
   en el pie, y el origen también.
3. **Ningún dato se interpola dentro de un atributo.** Aquí se va más lejos
   que en las Sugerencias de M.E.T.A.S: no se arma HTML con datos, punto.
   Todo con `createElement` y `textContent`, y la dirección comprobada con
   `reEnlace` antes de ponerla con `setAttribute`. Solo `http` y `https`, y la
   comprobación es con `URL()` y no con una expresión sobre el texto pelado,
   porque `java\tscript:` y `JavaScript:` pasan un grep ingenuo y el navegador
   los ejecuta igual. La misión vive en el mismo dominio que la Bóveda, las
   finanzas y el chat.
4. **Lo que se añade desde la pantalla se queda en ese aparato.** El
   formulario existe para pegar un enlace desde la tableta, verlo puesto y
   decidir; no sube nada a Supabase y la tarjeta lo dice con su insignia. Para
   que un enlace lo vea toda la casa hay que llevarlo al catálogo, y de eso se
   encarga el botón 📋 de cada tarjeta, que escupe el bloque de código listo
   para pegar en el chat. Es el mismo reparto que el SQL de Supabase.

### Las tarjetas de muestra se van solas

Una misión recién montada trae en su catálogo tres enlaces con `ejemplo: true`
y sin `url`: se ven enteros, para saber cómo queda la repisa, y no enlazan a
ninguna parte. **El aparato deja de pintarlos en cuanto entra el primer enlace
real**, propio o de catálogo. Si hubiera que acordarse de borrarlos, alguna
misión se publicaría con tres tarjetas de mentira dentro.

### Antes de publicar un cambio de la repisa

```
node _dev/servidor-estatico.js      (en otra terminal)
_dev/probe-recursos-enlaces.html    (en el navegador)
```

Y la sonda de la propia misión comprueba que la lleve puesta, que la clave del
almacén sea la suya (al copiar el molde se hereda, y dos misiones acabarían
compartiendo repisa) y que la etiqueta de máquina esté a la vista.

## 7. Verificación antes de publicar

Toda misión nueva se mide con una sonda en `_dev/` (Chrome headless a 380 px,
con `_dev/servidor-estatico.js`): secciones completas, bancos con su tamaño,
laboratorio, las dos pruebas generándose con el nombre correcto, la sopa
legible, la ficha respondiendo, y la ruta mostrando la etapa en el mapa.

Además, cuatro comprobaciones que valen para TODAS las misiones a la vez:

- `node _dev/reparte-respuestas.js --revisar`: el reparto de las letras.
- `_dev/probe-quiz-todas.html`: carga las seis misiones y comprueba que el
  quiz funcione, que la opción marcada como correcta sea la del banco y que
  ninguna letra pase del 40%.
- `node _dev/cuadra-catalogo.js`: que el catálogo cuadre con el disco (ids y
  urls sin repetir, rutas y etapas que existen y no chocan, ninguna etapa
  construida siguiendo anunciada como «por construir», ninguna carpeta
  huérfana, ninguna ficha que nadie enlace, ninguna clave de progreso
  compartida y ningún archivo pedido que falte).
- `_dev/probe-enlaces-y-catalogo.html`: pide por HTTP, uno por uno, **los más
  de setecientos archivos** que piden las misiones, las fichas y la portada.

**Por qué estas dos últimas existen.** El 20 de agosto de 2026 se publicó una
misión que pedía `js/html2canvas.min.js` sin llevarlo: cada misión guarda su
propia copia en su carpeta y el andamio copió el motor pero no la librería. El
diploma se habría quedado sin imagen, en silencio. El barrido que lo encontró
destapó además siete infografías que la misión del Sistema Nervioso pedía y
que nunca llegaron al repositorio, y una etapa recién construida que seguía
anunciada como por construir. **Diecinueve sondas en verde y tres cosas
rotas**, porque ninguna miraba si los archivos existen ni si el catálogo
cuadra. Van separadas a propósito: los enlaces se piden por HTTP desde el
navegador, y lo que hay que leer del disco (carpetas huérfanas, fichas
sueltas) no puede hacerlo un navegador, porque el servidor de `_dev` no lista
directorios.
