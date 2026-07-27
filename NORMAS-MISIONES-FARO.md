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
**Casos del proyecto** (ver norma 3) y Recursos.

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

## 6. La ficha va en diez páginas, y llenas

**Norma nueva, pedida por el autor el 26 de julio de 2026.** Toda ficha de
F.A.R.O tiene **exactamente 10 páginas tamaño carta**. Ni menos, porque estas
fichas no son un resumen: son el material de estudio de la familia y el tema se
explica completo, con casos reales y la pauta de todo lo que se propone. Ni más,
porque una ficha que se estira pierde el hilo.

Y llenas: **cada página va entre 190 y 226 mm** de alto. Los 226 son lo que de
verdad cabe en una carta (Chrome deja unos 228 útiles), y por debajo de 190 la
hoja se ve a medio usar, que fue justo lo que se vio al imprimir la ficha de las
palancas. La única que puede ir más corta es la última.

Se mide, no se calcula a ojo:

```
node _dev/servidor-estatico.js
_dev/mide-ficha-paginas.html?f=<ficha>.html     (Chrome headless, --dump-dom)
```

La herramienta carga la ficha con las reglas de `@media print` aplicadas (en
pantalla la hoja lleva otro relleno y otra letra, así que medir en pantalla
engaña) y falla si alguna página desborda, si alguna queda floja o si no son 10.

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
