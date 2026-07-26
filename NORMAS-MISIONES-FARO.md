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
  tres páginas y pauta de respuestas;
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

## 4. Verificación antes de publicar

Toda misión nueva se mide con una sonda en `_dev/` (Chrome headless a 380 px,
con `_dev/servidor-estatico.js`): secciones completas, bancos con su tamaño,
laboratorio, las dos pruebas generándose con el nombre correcto, la sopa
legible, la ficha respondiendo, y la ruta mostrando la etapa en el mapa.
