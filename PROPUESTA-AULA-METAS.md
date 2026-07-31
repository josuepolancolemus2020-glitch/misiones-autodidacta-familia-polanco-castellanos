# Propuesta · Cuatro arreglos de lógica en el aula de M.E.T.A.S

Fecha: 31 de julio de 2026. Estado: **propuesta con código listo para pegar**,
nada aplicado todavía.

## Por qué este documento vive en F.A.R.O

Los cuatro arreglos son para **M.E.T.A.S**, que vive en el repositorio
`misiones-educativas_a-policastsapien.com`. La sesión donde se escribió esto
solo tenía acceso a F.A.R.O, así que no se pudo editar ni un archivo de
M.E.T.A.S: el entorno lo rechaza con «repository is not configured for this
session».

Se deja aquí porque F.A.R.O ya guarda las propuestas de la casa
(`PROPUESTA-RUTAS-DEL-ADULTO.md`) y ya guarda el manual de M.E.T.A.S
(`misiones/autocapacitacion-metas/`). Cuando haya acceso al otro repositorio,
este documento se aplica y se borra de aquí.

**Aviso honesto sobre el código de abajo:** está escrito sin haber leído
`index.html`, `js/tools/plan-accion.js` ni `js/tools/registros-admin.js`. Por
eso todo lo nuevo son **piezas autónomas** (un CSS que se añade al final, dos
archivos nuevos en `js/tools/`, un banco nuevo en `js/data/`) y lo que toca
código existente se reduce a **llamadas de una línea** con el punto de anclaje
descrito por texto a buscar. Nada de esto se ejecutó: hay que probarlo en el
teléfono antes de publicar.

Se respeta la norma 1-bis de la casa: sin guiones largos.

---

## 0. Cómo se aplica

1. Pegar los bloques de CSS al final de la hoja común (`css/…` de M.E.T.A.S).
2. Crear los archivos nuevos: `js/tools/inventario-aula.js`,
   `js/tools/formacion-docente.js`, `js/data/formacion-docente.js`,
   `js/tools/plan-accion-ux.js`.
3. Registrarlos en `index.html` junto a las demás herramientas, con `?v=48`.
4. Hacer los tres injertos de una línea que pide el capítulo 2.
5. Subir `sw.js` de `meta-app-v47` a `meta-app-v48` y cambiar todos los `?v=47`
   a `?v=48`. **Sin esto los teléfonos siguen viendo la versión vieja.**
6. Probar en un teléfono real, no solo en el escritorio.

---

## 1. El Asistente de Padres: que el botón se vea y se entienda

### 1.1 Qué pasa hoy

La entrada al asistente es una tarjeta gris al final de la portada, después de
la Misión destacada. Está por debajo del pliegue, tiene el mismo peso visual
que el resto, y su rótulo («Para madres y padres · Vea aquí el avance y los
premios de su hijo o hija») describe una sección en vez de invitar a una
acción. Un padre que entra por primera vez no la ve.

### 1.2 Dónde va

Sube a **justo encima de «Explorar por materia»**, pegada a la rejilla de
«¿Qué quieres hacer hoy?». Es el primer punto de la portada donde la vista ya
descansó una vez y todavía no se fue a las materias.

Orden nuevo de la portada:

1. Saludo
2. Frase del prócer
3. ¿Qué quieres hacer hoy? (Misiones, Rutas, Mi Progreso, Zona Docente)
4. **CTA del Asistente de Padres**  ← nuevo lugar
5. Explorar por materia
6. Misión destacada

### 1.3 Qué dice y por qué

| Pieza | Texto | Por qué |
|---|---|---|
| Antetítulo | Para madres y padres | Dice a quién le habla antes de pedir nada. |
| Título | Vea cómo va su hijo en 30 segundos | *Usted*, que es como se le habla a un padre. «Vea cómo va» presupone que ya hay algo que ver. «30 segundos» pone precio al esfuerzo, y es un precio que nadie regatea. |
| Subtítulo | Sin cuenta y sin instalar nada: solo el nombre de su hijo | Mata las tres objeciones de un golpe (registrarme, ocupar memoria, no sé mi clave). |
| Sello | Actualizado por el maestro | Frescura: lo que hay del otro lado cambió, entrar ahora sirve de algo. |
| Botón | Ver el avance ahora | Verbo en imperativo y sin ambigüedad sobre qué pasa al tocar. |

El contraste hace la mitad del trabajo: es la única tarjeta a color entre
tarjetas blancas. Eso, más el desplazamiento del brillo y la flecha que
respira, crea el hueco de atención que hoy no existe.

### 1.4 HTML

Se borra la tarjeta vieja y se pega esto entre la rejilla de acciones y el
rótulo «Explorar por materia»:

```html
<!-- CTA del Asistente de Padres. Estaba al final de la portada y no lo veia
     nadie: sube aqui, encima de las materias, y pasa de tarjeta gris a
     invitacion. Sigue existiendo la entrada del menu lateral. -->
<button type="button" class="padres-cta" id="btn-padres-cta"
        aria-label="Abrir el Asistente de Padres para ver el avance de su hijo">
  <span class="padres-cta__brillo" aria-hidden="true"></span>

  <span class="padres-cta__top">
    <span class="padres-cta__icono" aria-hidden="true">👨‍👩‍👧</span>
    <span class="padres-cta__head">
      <span class="padres-cta__kicker">Para madres y padres</span>
      <span class="padres-cta__titulo">Vea cómo va su hijo en 30 segundos</span>
    </span>
  </span>

  <span class="padres-cta__sub">
    Sin cuenta y sin instalar nada: solo el nombre de su hijo.
  </span>

  <span class="padres-cta__foot">
    <span class="padres-cta__fresco" id="padres-cta-fresco">
      <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
      Actualizado por el maestro
    </span>
    <span class="padres-cta__pill">
      Ver el avance ahora
      <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
    </span>
  </span>
</button>
```

### 1.5 CSS

```css
/* ===== CTA del Asistente de Padres (portada) ===== */
.padres-cta{
  display:block; width:100%; margin:4px 0 22px; padding:16px 18px 14px;
  border:0; border-radius:20px; text-align:left; cursor:pointer;
  font-family:inherit; color:#fff; position:relative; overflow:hidden;
  background:linear-gradient(135deg,#15764a 0%,#22a366 48%,#4fd18f 100%);
  box-shadow:0 10px 26px rgba(21,118,74,.30), 0 2px 6px rgba(21,118,74,.20);
  -webkit-tap-highlight-color:transparent;
  transition:transform .16s ease, box-shadow .16s ease;
}
.padres-cta:active{ transform:scale(.985); box-shadow:0 5px 14px rgba(21,118,74,.28); }
.padres-cta:focus-visible{ outline:3px solid #0b3d27; outline-offset:3px; }

/* El brillo cruza cada 6 segundos: suficiente para captar el ojo, no tanto
   como para volverse ruido en una portada que se abre a diario. */
.padres-cta__brillo{
  position:absolute; top:0; left:-60%; width:45%; height:100%;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.28),transparent);
  animation:padresBrillo 6s ease-in-out infinite; pointer-events:none;
}
@keyframes padresBrillo{ 0%,72%{left:-60%} 100%{left:130%} }

.padres-cta__top{ display:flex; align-items:center; gap:13px; }
.padres-cta__icono{
  flex:0 0 auto; width:46px; height:46px; border-radius:14px;
  display:flex; align-items:center; justify-content:center; font-size:25px;
  background:rgba(255,255,255,.18); box-shadow:inset 0 0 0 1px rgba(255,255,255,.25);
  animation:padresLatido 2.8s ease-in-out infinite;
}
@keyframes padresLatido{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }

.padres-cta__head{ min-width:0; }
.padres-cta__kicker{
  display:block; font-size:11px; font-weight:700; letter-spacing:.10em;
  text-transform:uppercase; opacity:.88; margin-bottom:2px;
}
.padres-cta__titulo{
  display:block; font-size:17px; font-weight:800; line-height:1.22;
  text-shadow:0 1px 2px rgba(0,0,0,.13);
}
.padres-cta__sub{
  display:block; margin:9px 0 12px; font-size:13px; line-height:1.4; opacity:.94;
}

.padres-cta__foot{
  display:flex; align-items:center; justify-content:space-between;
  gap:10px; flex-wrap:wrap;
}
.padres-cta__fresco{
  font-size:11.5px; font-weight:600; opacity:.92;
  display:inline-flex; align-items:center; gap:5px;
}
.padres-cta__pill{
  display:inline-flex; align-items:center; gap:8px;
  background:#fff; color:#12603d;
  padding:10px 16px; border-radius:999px;
  font-size:13.5px; font-weight:800; white-space:nowrap;
  box-shadow:0 3px 10px rgba(0,0,0,.16);
}
.padres-cta__pill i{ animation:padresFlecha 1.6s ease-in-out infinite; }
@keyframes padresFlecha{ 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }

/* Pantallas angostas de verdad (360 px): el boton toma el ancho completo para
   no quedar apretado contra el sello de frescura. */
@media (max-width:360px){
  .padres-cta__pill{ width:100%; justify-content:center; }
}

/* Nadie se marea por culpa de una portada. */
@media (prefers-reduced-motion:reduce){
  .padres-cta__brillo,
  .padres-cta__icono,
  .padres-cta__pill i{ animation:none; }
}
```

Nota: el área táctil del botón entero pasa de 48 px de alto de sobra, y el
blanco sobre el verde `#15764a` da contraste AA.

### 1.6 JS

En `js/app.js`, donde se enganchan los botones de la portada:

```js
// El CTA de padres abre la misma vista que abria la tarjeta vieja. Se deja el
// respaldo a padres.html por si se toca desde una pagina satelite.
document.getElementById('btn-padres-cta')?.addEventListener('click', function () {
  if (typeof switchView === 'function') switchView('view-padre');
  else window.location.href = 'padres.html';
});

// Sello de frescura: si se sabe cuando publico el maestro por ultima vez, se
// dice. Si no se sabe, se deja la frase generica en vez de inventar una fecha.
(function () {
  var sello = document.getElementById('padres-cta-fresco');
  if (!sello) return;
  var ultima = localStorage.getItem('METAS_ULTIMA_PUBLICACION'); // ISO, la escribe el Plan de Accion
  if (!ultima) return;
  var dias = Math.floor((Date.now() - new Date(ultima).getTime()) / 86400000);
  var texto = dias <= 0 ? 'Actualizado hoy por el maestro'
            : dias === 1 ? 'Actualizado ayer por el maestro'
            : dias <= 14 ? ('Actualizado hace ' + dias + ' dias')
            : 'Actualizado por el maestro';
  sello.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> ' + texto;
})();
```

---

## 2. El Plan de Acción: que se vea el estado

### 2.1 Los cuatro problemas

1. Se cargan los resultados de una prueba, se guarda, y los alumnos siguen en
   pantalla igual que antes. **Nada dice que ya se subió**, así que o se sube
   dos veces o no se sube nunca.
2. Terminado un análisis, el formulario queda en un limbo: no se sabe si sigue
   vivo, si hay que borrarlo a mano o si tocar «guardar» otra vez lo duplica.
3. El botón de **códigos para imprimir** está aquí y también en Mi aula. Dos
   puertas al mismo cuarto, en dos herramientas distintas, confunden.
4. **«Traer mi lista de Mi aula» está al final**, cuando es lo primero que hay
   que hacer. Puesto abajo parece un extra, y el maestro termina escribiendo a
   mano 23 nombres que el sistema ya tenía.

### 2.2 El flujo nuevo, numerado

```
1 · Traer mi lista de Mi aula      (arriba, grande, con contador)
2 · Cargar los resultados de la prueba
3 · Publicar para el Asistente de Padres
       └─ recibo: que se subio, cuando, y que ve el padre
       └─ ¿otra prueba?  [Analizar otra prueba]  [Terminar por ahora]
```

Numerar los tres pasos es lo que hace que la lógica se explique sola. Hoy hay
tres bloques sin jerarquía y el orden real está al revés del orden visual.

### 2.3 Paso 1 arriba: HTML

Va como **primer hijo** del contenido de `view-plan-accion`, antes de todo lo
demás. El bloque que hoy dice «Traer mi lista de Mi aula» al final se borra.

```html
<!-- PASO 1. Estaba al final y por eso el maestro escribia los nombres a mano
     teniendo la lista cargada en Mi aula. Sube al primer lugar y dice en que
     estado esta: con lista traida o sin ella. -->
<div class="plan-paso" id="plan-paso-1">
  <div class="plan-paso__num">1</div>
  <div class="plan-paso__cuerpo">
    <h3 class="plan-paso__titulo">Traiga su lista de Mi aula</h3>
    <p class="plan-paso__texto" id="plan-lista-estado">
      Aún no ha traído la lista. Sus alumnos ya están en Mi aula: tráigalos
      aquí y no tendrá que escribir ningún nombre.
    </p>
    <button type="button" class="plan-cta" id="btn-traer-lista">
      <i class="fa-solid fa-people-group" aria-hidden="true"></i>
      <span id="btn-traer-lista-texto">Traer mis alumnos de Mi aula</span>
    </button>
    <button type="button" class="plan-link" id="btn-lista-manual">
      o escribir los nombres a mano
    </button>
  </div>
</div>
```

### 2.4 Paso 3: el recibo y la pregunta

Va inmediatamente después del bloque de captura de resultados. Nace oculto.

```html
<!-- PASO 3. El recibo: lo que faltaba. Sin esto el maestro no sabe si subio. -->
<div class="plan-recibo" id="plan-recibo" hidden>
  <div class="plan-recibo__check" aria-hidden="true">✅</div>
  <h3 class="plan-recibo__titulo" id="plan-recibo-titulo">Publicado</h3>
  <p class="plan-recibo__linea" id="plan-recibo-detalle"></p>

  <div class="plan-recibo__que">
    <strong>Esto es lo que verán las madres y los padres:</strong>
    <ul>
      <li>El resultado de su hijo en esta prueba.</li>
      <li>Los temas donde salió bien y donde necesita apoyo.</li>
      <li>Qué hacer en casa esta semana.</li>
    </ul>
    <p class="plan-recibo__nota">
      Cada familia ve solo a su hijo. Nadie ve la lista completa.
    </p>
  </div>

  <div class="plan-recibo__botones">
    <button type="button" class="plan-cta plan-cta--otra" id="btn-otra-prueba">
      <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
      Analizar otra prueba
    </button>
    <button type="button" class="plan-cta plan-cta--fin" id="btn-terminar">
      Terminar por ahora
    </button>
  </div>
</div>

<!-- Los codigos ya no se imprimen desde aqui: se imprimen en Mi aula. Se deja
     el letrero para que quien los buscaba aqui sepa a donde ir. -->
<p class="plan-nota-codigos">
  <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
  Los códigos de los alumnos se imprimen desde
  <button type="button" class="plan-link" id="ir-a-mi-aula">Mi aula</button>.
</p>
```

### 2.5 El módulo: `js/tools/plan-accion-ux.js`

Archivo nuevo y autónomo. El `plan-accion.js` que ya existe solo tiene que
hacerle **tres llamadas**.

```js
/* js/tools/plan-accion-ux.js
   Solo estado y avisos del Plan de Accion. No calcula ni guarda nada: de eso
   sigue encargandose plan-accion.js. Aqui vive lo que el maestro ve. */
(function (global) {
  'use strict';

  var LLAVE_PUBLICACION = 'METAS_ULTIMA_PUBLICACION';

  function $(id) { return document.getElementById(id); }

  function hora(d) {
    var h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
    var ampm = h < 12 ? 'a.m.' : 'p.m.';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + m + ' ' + ampm;
  }

  /* PASO 1. Se llama cada vez que cambia el numero de alumnos cargados. */
  function listaCargada(n) {
    var estado = $('plan-lista-estado');
    var boton  = $('btn-traer-lista-texto');
    var paso   = $('plan-paso-1');
    var manual = $('btn-lista-manual');
    if (!estado || !boton) return;

    if (n > 0) {
      paso && paso.classList.add('plan-paso--listo');
      estado.innerHTML = '<strong>Lista traída: ' + n + ' alumnos.</strong> ' +
        'Ya puede cargar los resultados de la prueba.';
      boton.textContent = 'Volver a traer la lista (' + n + ')';
      manual && (manual.hidden = true);
    } else {
      paso && paso.classList.remove('plan-paso--listo');
      estado.textContent = 'Aún no ha traído la lista. Sus alumnos ya están ' +
        'en Mi aula: tráigalos aquí y no tendrá que escribir ningún nombre.';
      boton.textContent = 'Traer mis alumnos de Mi aula';
      manual && (manual.hidden = false);
    }
  }

  /* PASO 3. Se llama cuando la subida a la nube salio bien. */
  function publicado(datos) {
    datos = datos || {};
    var n      = datos.alumnos || 0;
    var prueba = datos.prueba || 'la prueba';
    var ahora  = new Date();

    var recibo = $('plan-recibo');
    if (!recibo) return;

    var t = $('plan-recibo-titulo');
    var d = $('plan-recibo-detalle');
    if (t) t.textContent = n + ' alumnos analizados y publicados';
    if (d) {
      d.innerHTML = 'Los resultados de <strong>' + prueba + '</strong> ya ' +
        'están en el <strong>Asistente de Padres</strong>. ' +
        'Publicado hoy a las ' + hora(ahora) + '.';
    }

    recibo.hidden = false;
    recibo.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // El bloque de captura queda marcado como publicado. No se borra: los
    // alumnos siguen ahi, pero ya no parece que falta hacer algo con ellos.
    document.querySelectorAll('[data-plan-captura]').forEach(function (el) {
      el.classList.add('plan-captura--publicada');
    });

    // Lo lee el sello de frescura del CTA de padres en la portada.
    try { localStorage.setItem(LLAVE_PUBLICACION, ahora.toISOString()); } catch (e) {}
  }

  /* Vuelve al paso 2 con el formulario limpio, conservando el grupo. */
  function otraPrueba(alLimpiar) {
    var recibo = $('plan-recibo');
    if (recibo) recibo.hidden = true;
    document.querySelectorAll('[data-plan-captura]').forEach(function (el) {
      el.classList.remove('plan-captura--publicada');
    });
    if (typeof alLimpiar === 'function') alLimpiar();
    var paso2 = document.querySelector('[data-plan-captura]');
    paso2 && paso2.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function terminar() {
    var recibo = $('plan-recibo');
    if (recibo) recibo.hidden = true;
    if (typeof switchView === 'function') switchView('view-perfil');
  }

  global.PlanAccionUX = {
    listaCargada: listaCargada,
    publicado: publicado,
    otraPrueba: otraPrueba,
    terminar: terminar
  };
})(window);
```

### 2.6 Los tres injertos en `plan-accion.js`

Se busca el texto de la izquierda y se añade la línea de la derecha.

| Dónde | Qué se añade |
|---|---|
| Al final de la función que trae la lista desde Mi aula (después de pintar los alumnos) | `PlanAccionUX.listaCargada(alumnos.length);` |
| Dentro del `then` o del `await` de la subida, en la rama de éxito | `PlanAccionUX.publicado({ alumnos: alumnos.length, prueba: nombrePrueba });` |
| Al arrancar la vista | enganchar `btn-otra-prueba` a `PlanAccionUX.otraPrueba(limpiarFormulario)` y `btn-terminar` a `PlanAccionUX.terminar` |

Además:

- Añadir `data-plan-captura` al `div` que envuelve el bloque de resultados.
- **Borrar** el botón de códigos para imprimir de esta vista. Está duplicado en
  Mi aula, y esa es la copia que se queda.
- Enganchar `ir-a-mi-aula` a `switchView('view-admin')`.

### 2.7 CSS del Plan de Acción

```css
/* ===== Plan de Accion: pasos numerados, recibo y estados ===== */
.plan-paso{ display:flex; gap:13px; padding:16px; margin:0 0 18px;
  background:#fff; border:2px solid #dbe4f0; border-radius:16px;
  box-shadow:0 2px 10px rgba(30,58,124,.06); }
.plan-paso--listo{ border-color:#39b56a; background:#f5fdf8; }
.plan-paso__num{ flex:0 0 auto; width:32px; height:32px; border-radius:50%;
  background:#1e3a7c; color:#fff; font-weight:800; font-size:16px;
  display:flex; align-items:center; justify-content:center; }
.plan-paso--listo .plan-paso__num{ background:#39b56a; }
.plan-paso__cuerpo{ min-width:0; flex:1; }
.plan-paso__titulo{ margin:2px 0 6px; font-size:16px; font-weight:800; color:#1e3a7c; }
.plan-paso__texto{ margin:0 0 12px; font-size:13.5px; line-height:1.45; color:#4a5568; }

.plan-cta{ display:inline-flex; align-items:center; justify-content:center;
  gap:9px; width:100%; min-height:50px; padding:13px 18px; border:0;
  border-radius:14px; font-family:inherit; font-size:14.5px; font-weight:800;
  color:#fff; cursor:pointer; background:linear-gradient(135deg,#1e3a7c,#3b6fd4);
  box-shadow:0 5px 15px rgba(30,58,124,.26); transition:transform .15s ease; }
.plan-cta:active{ transform:scale(.98); }
.plan-cta--otra{ background:linear-gradient(135deg,#15764a,#22a366);
  box-shadow:0 5px 15px rgba(21,118,74,.26); }
.plan-cta--fin{ background:#eef2f8; color:#4a5568; box-shadow:none; }

.plan-link{ background:none; border:0; padding:8px 0 0; font-family:inherit;
  font-size:12.5px; color:#3b6fd4; text-decoration:underline; cursor:pointer; }

/* Publicado: no se borra nada, se apaga. Los alumnos siguen visibles pero ya
   no gritan "haz algo conmigo". */
.plan-captura--publicada{ opacity:.62; position:relative; }
.plan-captura--publicada::after{ content:'PUBLICADO'; position:absolute;
  top:10px; right:10px; background:#39b56a; color:#fff; font-size:10px;
  font-weight:800; letter-spacing:.09em; padding:4px 9px; border-radius:999px; }

.plan-recibo{ margin:18px 0; padding:20px 18px; border-radius:18px;
  background:linear-gradient(160deg,#f2fbf6,#e6f7ee);
  border:2px solid #39b56a; text-align:center; }
.plan-recibo__check{ font-size:38px; line-height:1; margin-bottom:6px; }
.plan-recibo__titulo{ margin:0 0 6px; font-size:18px; font-weight:800; color:#12603d; }
.plan-recibo__linea{ margin:0 0 14px; font-size:13.5px; line-height:1.45; color:#2f4f3f; }
.plan-recibo__que{ text-align:left; background:#fff; border-radius:13px;
  padding:14px 16px; font-size:13px; line-height:1.5; color:#33475b; }
.plan-recibo__que ul{ margin:8px 0 8px 18px; padding:0; }
.plan-recibo__que li{ margin-bottom:4px; }
.plan-recibo__nota{ margin:8px 0 0; font-size:12px; color:#6b7c93; font-style:italic; }
.plan-recibo__botones{ display:grid; gap:10px; margin-top:16px; }

.plan-nota-codigos{ margin:14px 0 0; padding:11px 14px; background:#f7f9fc;
  border-radius:11px; font-size:12.5px; color:#6b7c93; }
```

---

## 3. Inventario del aula: qué es del maestro y qué es de la escuela

### 3.1 El problema real

El maestro compra con su dinero: papel, marcadores, una impresora, un
ventilador. A veces le pagan y a veces no. Pasan los años, cambia el director,
y ya nadie recuerda qué salió del bolsillo de quién. Al final el maestro se va
y deja lo suyo, o se lleva algo de la escuela sin saberlo. Las dos cosas son
malas y las dos se evitan con lo mismo: **un papel firmado a tiempo**.

### 3.2 Dónde va

Dentro de **Mi aula** (`view-admin`, la herramienta `registros-admin.js`), como
pestaña propia junto a lista, asistencia, notas, conducta y colectas.

Ese es el lugar correcto y no otro por tres razones: Mi aula ya es donde el
maestro administra lo material del grupo (las colectas viven ahí), ya está
detrás de la cuenta docente, y el inventario necesita la lista del grupo y el
nombre del director que Mi aula ya tiene. Ponerlo en Ajustes o en una vista
nueva lo dejaría huérfano.

### 3.3 Los tres estados de propiedad

| Estado | Qué significa | Color |
|---|---|---|
| `maestro` | Lo compró el maestro y **no le han pagado**. Es suyo. Si deja el aula, se lo lleva. | 🟠 naranja |
| `escuela` | Bien de la escuela que el maestro usa y cuida. No es suyo. | 🔵 azul |
| `reembolsado` | Lo compró el maestro y ya le devolvieron el dinero. Desde la fecha de reembolso es de la escuela. | 🟢 verde |

El tercer estado es el que evita el pleito: deja constancia de que hubo un
adelanto y de que se pagó, con fecha. Sin él, un bien reembolsado se ve igual
que uno donado.

Y arriba del bloque naranja, el número que importa: **cuánto le debe la escuela
al maestro en este momento**.

### 3.4 El acta

Botón «Generar acta de inventario»: hoja imprimible con el periodo, las dos
tablas con sus totales, la declaración de propiedad y **tres bloques de firma:
Maestro, Director(a) y Directiva de Padres de Familia**. Cada acta generada
queda guardada con su fecha, así que el historial mismo es la prueba de que se
firmó cada periodo.

### 3.5 HTML (pestaña dentro de Mi aula)

```html
<div class="inv-aula" id="inv-aula">
  <div class="inv-aula__intro">
    <h3>Inventario del aula</h3>
    <p>
      Aquí queda claro qué cosas del aula son suyas y cuáles son de la escuela.
      Al final de cada periodo se genera el acta y la firman usted, la dirección
      y la directiva de padres.
    </p>
  </div>

  <div class="inv-deuda" id="inv-deuda" hidden>
    <span class="inv-deuda__rotulo">La escuela le debe</span>
    <span class="inv-deuda__monto" id="inv-deuda-monto">L 0.00</span>
    <span class="inv-deuda__nota" id="inv-deuda-nota"></span>
  </div>

  <button type="button" class="plan-cta" id="inv-agregar">
    <i class="fa-solid fa-plus" aria-hidden="true"></i> Agregar un artículo
  </button>

  <div id="inv-bloques"></div>

  <div class="inv-actas">
    <button type="button" class="plan-cta plan-cta--otra" id="inv-acta">
      <i class="fa-solid fa-file-signature" aria-hidden="true"></i>
      Generar acta de inventario
    </button>
    <div id="inv-historial" class="inv-historial"></div>
  </div>
</div>
```

### 3.6 `js/tools/inventario-aula.js`

```js
/* js/tools/inventario-aula.js
   Inventario del aula dentro de Mi aula. Separa lo que es del maestro de lo
   que es de la escuela, lleva la cuenta de lo que no le han pagado, y genera
   el acta que firman maestro, direccion y directiva de padres. */
(function (global) {
  'use strict';

  var LLAVE_ITEMS = 'METAS_INV_AULA_v1';
  var LLAVE_ACTAS = 'METAS_INV_ACTAS_v1';

  var BLOQUES = [
    { id:'maestro', icono:'🟠', clase:'inv-b--maestro',
      rotulo:'Propiedad del maestro (no reembolsado)',
      nota:'Estos bienes los compró el maestro con su dinero y no le han sido pagados. Son suyos: si deja el aula, se los lleva.' },
    { id:'escuela', icono:'🔵', clase:'inv-b--escuela',
      rotulo:'Propiedad de la escuela (bajo resguardo)',
      nota:'Bienes de la escuela que el maestro usa y cuida. No son suyos: al terminar el resguardo se devuelven.' },
    { id:'reembolsado', icono:'🟢', clase:'inv-b--reemb',
      rotulo:'Comprado por el maestro y ya reembolsado',
      nota:'El maestro adelantó el dinero y ya le fue devuelto. Desde la fecha de reembolso el bien es de la escuela.' }
  ];

  function leer(llave){ try{ return JSON.parse(localStorage.getItem(llave)) || []; }catch(e){ return []; } }
  function guardar(llave,v){ try{ localStorage.setItem(llave, JSON.stringify(v)); }catch(e){} }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function lps(n){ return 'L ' + (Number(n)||0).toLocaleString('es-HN',{minimumFractionDigits:2, maximumFractionDigits:2}); }
  function hoyISO(){ return new Date().toISOString().slice(0,10); }
  function fechaLarga(iso){
    var M=['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
           'septiembre','octubre','noviembre','diciembre'];
    var p=String(iso||hoyISO()).slice(0,10).split('-');
    return Number(p[2]) + ' de ' + M[Number(p[1])-1] + ' de ' + p[0];
  }

  var items = leer(LLAVE_ITEMS);
  var actas = leer(LLAVE_ACTAS);

  function delBloque(id){ return items.filter(function(i){ return i.propiedad === id; }); }
  function totalDe(lista){ return lista.reduce(function(s,i){ return s + (Number(i.valor)||0)*(Number(i.cantidad)||1); }, 0); }

  /* ---------- pintar ---------- */
  function pintar(){
    var cont = document.getElementById('inv-bloques');
    if (!cont) return;

    cont.innerHTML = BLOQUES.map(function(b){
      var lista = delBloque(b.id);
      if (!lista.length && b.id === 'reembolsado') return '';   // no se muestra vacio
      return '<section class="inv-b ' + b.clase + '">' +
        '<header class="inv-b__head">' +
          '<span class="inv-b__punto" aria-hidden="true">' + b.icono + '</span>' +
          '<h4>' + esc(b.rotulo) + '</h4>' +
          '<span class="inv-b__total">' + lps(totalDe(lista)) + '</span>' +
        '</header>' +
        '<p class="inv-b__nota">' + esc(b.nota) + '</p>' +
        (lista.length
          ? '<ul class="inv-lista">' + lista.map(fila).join('') + '</ul>'
          : '<p class="inv-vacio">Todavía no hay artículos en este bloque.</p>') +
      '</section>';
    }).join('');

    cont.querySelectorAll('[data-borrar]').forEach(function(b){
      b.addEventListener('click', function(){ borrar(b.dataset.borrar); });
    });
    cont.querySelectorAll('[data-reembolsar]').forEach(function(b){
      b.addEventListener('click', function(){ reembolsar(b.dataset.reembolsar); });
    });

    pintarDeuda();
    pintarHistorial();
  }

  function fila(i){
    var sub = lps((Number(i.valor)||0) * (Number(i.cantidad)||1));
    return '<li class="inv-item">' +
      '<div class="inv-item__cab">' +
        '<strong>' + esc(i.descripcion) + '</strong>' +
        '<span class="inv-item__sub">' + sub + '</span>' +
      '</div>' +
      '<div class="inv-item__meta">' +
        'Cantidad: ' + (Number(i.cantidad)||1) +
        ' · ' + esc(fechaLarga(i.fecha)) +
        (i.fechaReembolso ? ' · reembolsado el ' + esc(fechaLarga(i.fechaReembolso)) : '') +
      '</div>' +
      '<div class="inv-item__acc">' +
        (i.propiedad === 'maestro'
          ? '<button type="button" class="inv-mini" data-reembolsar="' + esc(i.id) + '">Ya me pagaron</button>'
          : '') +
        '<button type="button" class="inv-mini inv-mini--rojo" data-borrar="' + esc(i.id) + '">Quitar</button>' +
      '</div>' +
    '</li>';
  }

  function pintarDeuda(){
    var caja = document.getElementById('inv-deuda');
    if (!caja) return;
    var lista = delBloque('maestro');
    var total = totalDe(lista);
    if (!total){ caja.hidden = true; return; }
    caja.hidden = false;
    document.getElementById('inv-deuda-monto').textContent = lps(total);
    document.getElementById('inv-deuda-nota').textContent =
      lista.length + (lista.length === 1 ? ' artículo comprado' : ' artículos comprados') +
      ' por usted y todavía sin reembolsar.';
  }

  function pintarHistorial(){
    var h = document.getElementById('inv-historial');
    if (!h) return;
    if (!actas.length){
      h.innerHTML = '<p class="inv-vacio">Todavía no se ha firmado ningún acta.</p>';
      return;
    }
    h.innerHTML = '<h5>Actas generadas (' + actas.length + ')</h5><ul>' +
      actas.slice().reverse().map(function(a){
        return '<li>' + esc(a.periodo) + ' · ' + esc(fechaLarga(a.fecha)) +
               ' · ' + esc(a.items) + ' artículos · ' + lps(a.deuda) + ' pendientes</li>';
      }).join('') + '</ul>';
  }

  /* ---------- acciones ---------- */
  function agregar(datos){
    items.push({
      id: 'inv' + Date.now() + Math.floor(Math.random()*1000),
      descripcion: datos.descripcion,
      cantidad: Number(datos.cantidad) || 1,
      valor: Number(datos.valor) || 0,
      propiedad: datos.propiedad === 'escuela' ? 'escuela' : 'maestro',
      fecha: datos.fecha || hoyISO(),
      fechaReembolso: null
    });
    guardar(LLAVE_ITEMS, items);
    pintar();
  }

  function reembolsar(id){
    var it = items.filter(function(i){ return i.id === id; })[0];
    if (!it) return;
    it.propiedad = 'reembolsado';
    it.fechaReembolso = hoyISO();      // queda la fecha: eso es lo auditable
    guardar(LLAVE_ITEMS, items);
    pintar();
  }

  function borrar(id){
    items = items.filter(function(i){ return i.id !== id; });
    guardar(LLAVE_ITEMS, items);
    pintar();
  }

  /* ---------- el acta ---------- */
  function tabla(bloqueId){
    var b = BLOQUES.filter(function(x){ return x.id === bloqueId; })[0];
    var lista = delBloque(bloqueId);
    if (!lista.length) return '';
    return '<h3>' + esc(b.rotulo) + '</h3>' +
      '<p class="nota">' + esc(b.nota) + '</p>' +
      '<table><thead><tr><th>Descripción</th><th>Cant.</th><th>Valor unit.</th>' +
      '<th>Subtotal</th><th>Fecha</th></tr></thead><tbody>' +
      lista.map(function(i){
        return '<tr><td>' + esc(i.descripcion) + '</td>' +
          '<td>' + (Number(i.cantidad)||1) + '</td>' +
          '<td>' + lps(i.valor) + '</td>' +
          '<td>' + lps((Number(i.valor)||0)*(Number(i.cantidad)||1)) + '</td>' +
          '<td>' + esc(fechaLarga(i.fecha)) + '</td></tr>';
      }).join('') +
      '</tbody><tfoot><tr><td colspan="3">Total</td><td colspan="2">' +
      lps(totalDe(lista)) + '</td></tr></tfoot></table>';
  }

  function generarActa(datos){
    datos = datos || {};
    var periodo = datos.periodo || 'Periodo sin nombre';
    var escuela = datos.escuela || '';
    var maestro = datos.maestro || '';
    var grado   = datos.grado || '';
    var deuda   = totalDe(delBloque('maestro'));

    var html =
    '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
    '<title>Acta de inventario · ' + esc(periodo) + '</title><style>' +
    'body{font-family:Georgia,serif;max-width:760px;margin:28px auto;padding:0 22px;color:#1a1a1a;line-height:1.5}' +
    'h1{font-size:19px;text-align:center;margin:0 0 4px}' +
    'h2{font-size:13px;text-align:center;font-weight:400;margin:0 0 22px;color:#555}' +
    'h3{font-size:14px;margin:22px 0 4px;border-bottom:2px solid #333;padding-bottom:4px}' +
    '.nota{font-size:11px;color:#444;font-style:italic;margin:0 0 8px}' +
    'table{width:100%;border-collapse:collapse;font-size:11.5px;margin-bottom:6px}' +
    'th,td{border:1px solid #999;padding:5px 7px;text-align:left}' +
    'th{background:#eee}tfoot td{font-weight:bold;background:#f5f5f5}' +
    '.decl{margin:26px 0;padding:13px 15px;border:1px solid #333;font-size:12px}' +
    '.firmas{display:flex;gap:22px;margin-top:52px}' +
    '.firma{flex:1;text-align:center;font-size:11px}' +
    '.firma .linea{border-top:1px solid #111;margin-bottom:5px;height:1px}' +
    '@media print{body{margin:0}}' +
    '</style></head><body>' +

    '<h1>ACTA DE INVENTARIO DEL AULA</h1>' +
    '<h2>' + esc(escuela) + (grado ? ' · ' + esc(grado) : '') + '<br>' +
      'Periodo: ' + esc(periodo) + ' · Fecha: ' + esc(fechaLarga(hoyISO())) + '</h2>' +

    tabla('maestro') + tabla('escuela') + tabla('reembolsado') +

    '<div class="decl"><strong>Declaración.</strong> Los bienes listados en el ' +
    'primer cuadro fueron adquiridos por el docente ' + esc(maestro) + ' con ' +
    'recursos propios y a la fecha de esta acta <strong>no le han sido ' +
    'reembolsados</strong>, por un monto de <strong>' + lps(deuda) + '</strong>. ' +
    'En consecuencia son de su propiedad y no forman parte del patrimonio de la ' +
    'escuela. Los bienes del segundo cuadro son propiedad de la escuela y se ' +
    'encuentran bajo el resguardo del docente, quien responde por su cuidado y ' +
    'los devuelve al concluir el resguardo. Los del tercer cuadro fueron ' +
    'adelantados por el docente y ya reembolsados, por lo que a partir de la ' +
    'fecha de reembolso pertenecen a la escuela.</div>' +

    '<div class="firmas">' +
      '<div class="firma"><div class="linea"></div>Docente del aula<br>' + esc(maestro) + '</div>' +
      '<div class="firma"><div class="linea"></div>Director(a)</div>' +
      '<div class="firma"><div class="linea"></div>Directiva de Padres de Familia</div>' +
    '</div>' +

    '</body></html>';

    actas.push({ fecha: hoyISO(), periodo: periodo, items: items.length, deuda: deuda });
    guardar(LLAVE_ACTAS, actas);
    pintarHistorial();

    var v = window.open('', '_blank');
    if (!v) return;                       // el navegador bloqueo la ventana
    v.document.write(html);
    v.document.close();
    v.focus();
    v.print();
  }

  global.InventarioAula = {
    iniciar: pintar,
    agregar: agregar,
    generarActa: generarActa,
    deuda: function(){ return totalDe(delBloque('maestro')); }
  };
})(window);
```

En `registros-admin.js` basta con llamar a `InventarioAula.iniciar()` al abrir
la pestaña, y enganchar `inv-agregar` a un formulario (o al diálogo común de
`metas-dialogos.js`) que llame a `InventarioAula.agregar({...})`, y `inv-acta`
a `InventarioAula.generarActa({ periodo, escuela, maestro, grado })`.

### 3.7 CSS del inventario

```css
/* ===== Inventario del aula ===== */
.inv-aula__intro h3{ margin:0 0 6px; font-size:17px; color:#1e3a7c; }
.inv-aula__intro p{ margin:0 0 16px; font-size:13px; line-height:1.5; color:#5a6a80; }

.inv-deuda{ background:linear-gradient(135deg,#fff4e6,#ffe8cc);
  border:2px solid #f0952b; border-radius:15px; padding:15px 17px;
  margin-bottom:16px; text-align:center; }
.inv-deuda__rotulo{ display:block; font-size:11.5px; font-weight:700;
  letter-spacing:.08em; text-transform:uppercase; color:#9a5b09; }
.inv-deuda__monto{ display:block; font-size:27px; font-weight:800; color:#b3600a; margin:3px 0; }
.inv-deuda__nota{ display:block; font-size:12px; color:#8a6234; }

.inv-b{ border-radius:15px; padding:14px 15px; margin:16px 0; border:2px solid; }
.inv-b--maestro{ background:#fffaf3; border-color:#f0952b; }
.inv-b--escuela{ background:#f4f8ff; border-color:#3b6fd4; }
.inv-b--reemb{   background:#f4fbf6; border-color:#39b56a; }
.inv-b__head{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.inv-b__head h4{ margin:0; font-size:14px; font-weight:800; flex:1; min-width:150px; }
.inv-b__total{ font-size:15px; font-weight:800; }
.inv-b__nota{ margin:6px 0 12px; font-size:12px; line-height:1.45;
  color:#5a6a80; font-style:italic; }

.inv-lista{ list-style:none; margin:0; padding:0; }
.inv-item{ background:#fff; border-radius:11px; padding:11px 13px; margin-bottom:9px;
  box-shadow:0 1px 4px rgba(0,0,0,.07); }
.inv-item__cab{ display:flex; justify-content:space-between; gap:10px; font-size:14px; }
.inv-item__sub{ font-weight:800; white-space:nowrap; }
.inv-item__meta{ font-size:11.5px; color:#7b8a9e; margin-top:3px; }
.inv-item__acc{ display:flex; gap:7px; margin-top:9px; }
.inv-mini{ background:#eef2f8; border:0; border-radius:8px; padding:6px 11px;
  font-family:inherit; font-size:11.5px; font-weight:700; color:#3b6fd4; cursor:pointer; }
.inv-mini--rojo{ color:#c0392b; }
.inv-vacio{ font-size:12.5px; color:#95a3b5; margin:4px 0 0; }

.inv-actas{ margin-top:22px; padding-top:16px; border-top:2px dashed #dbe4f0; }
.inv-historial{ margin-top:13px; font-size:12.5px; color:#5a6a80; }
.inv-historial h5{ margin:0 0 6px; font-size:13px; color:#1e3a7c; }
.inv-historial ul{ margin:0; padding-left:18px; }
.inv-historial li{ margin-bottom:3px; }
```

---

## 4. Formación docente: la estructura antes que las misiones

### 4.1 Qué se hace ahora y qué no

**Ahora:** la tarjeta, la rejilla de ejes, las insignias de «Pronto», el modal
con las temáticas propuestas y el candado de sesión docente.

**Ahora no:** ninguna misión. Cuando nazca la primera, se cambia
`estado:'proximamente'` por `estado:'lista'` y se apunta a su carpeta. Nada más.

### 4.2 Quién la ve

Solo el maestro con sesión PROF-XXXX, con la misma guardia que ya usan las
demás herramientas de aula. Un alumno que entra con código de aula no debe ver
siquiera la tarjeta: no es contenido para él, y verla ocupando espacio le
enseña que hay cosas de la app que no le sirven.

### 4.3 Los ocho ejes

```js
/* js/data/formacion-docente.js
   Los ejes de actualizacion del maestro. Todavia sin misiones: esto es el
   plano. Cuando una este construida se le cambia el estado y se le pone la
   ruta de su carpeta. */
const FORMACION_DOCENTE = [
  {
    id:'leyes', icono:'⚖️', color:'#8e44ad', estado:'proximamente',
    titulo:'Leyes y normativa educativa',
    resumen:'Lo que la ley le exige y lo que la ley le garantiza. Saberlo antes de necesitarlo.',
    temas:[
      'Ley Fundamental de Educación: lo que cambia en el aula',
      'Estatuto del Docente: deberes, derechos y estabilidad',
      'El expediente y el debido proceso: qué hacer si le abren uno',
      'Normativa de evaluación y promoción: aplazar y promover con la ley en la mano',
      'Jornada, permisos y licencias: lo que se pide por escrito'
    ]
  },
  {
    id:'dcnb', icono:'📘', color:'#1e3a7c', estado:'proximamente',
    titulo:'Currículo Nacional (DCNB)',
    resumen:'Leer el DCNB sin ahogarse y convertirlo en la clase del lunes.',
    temas:[
      'Leer el DCNB por estándar, no por página',
      'De estándar a tarea: la cadena completa',
      'Los bloques por área y cómo se reparten en el año',
      'Adecuación curricular: el mismo estándar, otro camino',
      'La programación mensual que sí se cumple'
    ]
  },
  {
    id:'evaluacion', icono:'📊', color:'#c0392b', estado:'proximamente',
    titulo:'Evaluación de los aprendizajes',
    resumen:'Evaluar para enseñar mejor, no solo para llenar la boleta.',
    temas:[
      'Formativa y sumativa: cuál sirve para qué',
      'Rúbricas que sí se usan (de una página, no de cinco)',
      'El error como dato: qué le dice cada respuesta mala',
      'Retroalimentación en 30 segundos por alumno',
      'Una boleta que la familia entienda sin explicación'
    ]
  },
  {
    id:'estrategias', icono:'🎯', color:'#16a085', estado:'proximamente',
    titulo:'Estrategias de aula',
    resumen:'Lo que funciona con 35 alumnos, poco material y una sola voz.',
    temas:[
      'Aula multigrado: tres grados y un solo maestro',
      'Lectura comprensiva en cualquier materia, no solo en Español',
      'Enseñar a resolver problemas, no a copiar el procedimiento',
      'Trabajo cooperativo de verdad: roles, no solo mesas juntas',
      'Manejo del aula sin gritar: rutinas que sostienen la clase'
    ]
  },
  {
    id:'diversidad', icono:'🤝', color:'#e67e22', estado:'proximamente',
    titulo:'Atención a la diversidad',
    resumen:'El que se atrasa casi nunca es el que no quiere.',
    temas:[
      'Inclusión y ajustes razonables: qué significa en la práctica',
      'Detección temprana de dificultades de lectura',
      'El alumno que se atrasó: plan de recuperación de cuatro semanas',
      'Señales de salud mental que un maestro sí puede ver',
      'Cuándo referir y a quién'
    ]
  },
  {
    id:'familia', icono:'👨‍👩‍👧', color:'#39b56a', estado:'proximamente',
    titulo:'Familia y comunidad',
    resumen:'La reunión de padres es una herramienta, no un trámite.',
    temas:[
      'Una reunión de padres que sirva para algo',
      'Comunicar una mala nota sin romper la relación',
      'El rol de la directiva de padres y sus límites',
      'Gobierno escolar: para qué existe de verdad',
      'Acuerdos con la familia que se cumplen'
    ]
  },
  {
    id:'digital', icono:'💻', color:'#3b6fd4', estado:'proximamente',
    titulo:'Docente digital',
    resumen:'La tecnología del aula, incluyendo esta aplicación.',
    temas:[
      'M.E.T.A.S a fondo: todo lo que la app ya hace y usted no usa',
      'Datos del aula para decidir: leer el Plan de Acción',
      'Privacidad de los datos de menores: lo que nunca se sube',
      'La IA como asistente y no como autor',
      'Clase con un solo teléfono y sin internet'
    ]
  },
  {
    id:'etica', icono:'🕊️', color:'#7f8c8d', estado:'proximamente',
    titulo:'Ética y desarrollo profesional',
    resumen:'La carrera larga: cómo no quemarse y cómo dejar constancia.',
    temas:[
      'Deontología docente: los límites que se ponen solos',
      'Portafolio de evidencias: qué guardar y cómo',
      'Plan de mejora personal por año',
      'Investigación-acción: convertir un problema del aula en estudio',
      'Desgaste docente: reconocerlo a tiempo'
    ]
  }
];
```

### 4.4 HTML (dentro de Herramientas de aula)

```html
<div class="form-doc" id="form-doc" hidden>
  <header class="form-doc__head">
    <h3><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i> Mi Formación Docente</h3>
    <p>
      Misiones para usted, no para sus alumnos: estrategias, leyes educativas y
      currículo. Se están construyendo. Toque un eje para ver qué traerá.
    </p>
  </header>
  <div class="form-doc__grid" id="form-doc-grid"></div>
</div>

<div class="form-doc__modal" id="form-doc-modal" hidden role="dialog"
     aria-modal="true" aria-labelledby="form-doc-modal-titulo">
  <div class="form-doc__caja">
    <button type="button" class="form-doc__x" id="form-doc-cerrar" aria-label="Cerrar">&times;</button>
    <div class="form-doc__micono" id="form-doc-modal-icono" aria-hidden="true"></div>
    <h4 id="form-doc-modal-titulo"></h4>
    <p class="form-doc__mres" id="form-doc-modal-resumen"></p>
    <h5>Temas que traerá</h5>
    <ul id="form-doc-modal-temas"></ul>
    <p class="form-doc__aviso">
      <i class="fa-solid fa-hammer" aria-hidden="true"></i>
      En construcción. Le avisamos aquí mismo cuando la primera esté lista.
    </p>
  </div>
</div>
```

### 4.5 `js/tools/formacion-docente.js`

```js
/* js/tools/formacion-docente.js
   Solo la estructura: rejilla de ejes con insignia de Pronto y un modal que
   dice que traera cada uno. Ninguna mision construida todavia. */
(function (global) {
  'use strict';

  function esDocente(){
    // Se apoya en la guardia que ya existe. Si no la encuentra, no muestra
    // nada: es preferible ocultar de mas que ensenar de mas.
    if (global.MetasRegistro && typeof MetasRegistro.esDocente === 'function') {
      return MetasRegistro.esDocente();
    }
    return !!localStorage.getItem('METAS_SESION_DOCENTE');
  }

  function pintar(){
    var caja = document.getElementById('form-doc');
    var grid = document.getElementById('form-doc-grid');
    if (!caja || !grid || typeof FORMACION_DOCENTE === 'undefined') return;

    if (!esDocente()){ caja.hidden = true; return; }
    caja.hidden = false;

    grid.innerHTML = FORMACION_DOCENTE.map(function (e) {
      return '<button type="button" class="fd-card" data-eje="' + e.id + '" ' +
        'style="--fd:' + e.color + '">' +
        '<span class="fd-card__pronto">Pronto</span>' +
        '<span class="fd-card__icono" aria-hidden="true">' + e.icono + '</span>' +
        '<span class="fd-card__titulo">' + e.titulo + '</span>' +
        '<span class="fd-card__n">' + e.temas.length + ' temas</span>' +
      '</button>';
    }).join('');

    grid.querySelectorAll('[data-eje]').forEach(function (b) {
      b.addEventListener('click', function(){ abrir(b.dataset.eje); });
    });
  }

  function abrir(id){
    var e = FORMACION_DOCENTE.filter(function(x){ return x.id === id; })[0];
    if (!e) return;
    document.getElementById('form-doc-modal-icono').textContent   = e.icono;
    document.getElementById('form-doc-modal-titulo').textContent  = e.titulo;
    document.getElementById('form-doc-modal-resumen').textContent = e.resumen;
    document.getElementById('form-doc-modal-temas').innerHTML =
      e.temas.map(function(t){ return '<li>' + t + '</li>'; }).join('');
    document.getElementById('form-doc-modal').hidden = false;
  }

  function cerrar(){
    var m = document.getElementById('form-doc-modal');
    if (m) m.hidden = true;
  }

  document.addEventListener('click', function (ev) {
    if (ev.target && (ev.target.id === 'form-doc-cerrar' || ev.target.id === 'form-doc-modal')) cerrar();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') cerrar();
  });

  global.FormacionDocente = { iniciar: pintar };
})(window);
```

### 4.6 CSS

```css
/* ===== Mi Formacion Docente ===== */
.form-doc{ margin-top:24px; padding-top:18px; border-top:2px dashed #dbe4f0; }
.form-doc__head h3{ margin:0 0 5px; font-size:16px; color:#1e3a7c; }
.form-doc__head p{ margin:0 0 14px; font-size:12.5px; line-height:1.5; color:#5a6a80; }
.form-doc__grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(146px,1fr)); gap:11px; }

.fd-card{ position:relative; display:flex; flex-direction:column; align-items:flex-start;
  gap:5px; padding:15px 13px 13px; border:2px solid var(--fd); border-radius:15px;
  background:#fff; font-family:inherit; text-align:left; cursor:pointer;
  transition:transform .15s ease, box-shadow .15s ease; }
.fd-card:active{ transform:scale(.975); }
.fd-card:hover{ box-shadow:0 5px 15px color-mix(in srgb, var(--fd) 26%, transparent); }
.fd-card__pronto{ position:absolute; top:8px; right:8px; background:var(--fd);
  color:#fff; font-size:9px; font-weight:800; letter-spacing:.09em;
  text-transform:uppercase; padding:3px 8px; border-radius:999px; }
.fd-card__icono{ font-size:26px; line-height:1; }
.fd-card__titulo{ font-size:13px; font-weight:800; color:var(--fd); line-height:1.28; }
.fd-card__n{ font-size:11px; color:#8b98ab; }

.form-doc__modal{ position:fixed; inset:0; background:rgba(15,25,45,.55);
  display:flex; align-items:center; justify-content:center; padding:18px; z-index:900; }
.form-doc__modal[hidden]{ display:none; }
.form-doc__caja{ position:relative; background:#fff; border-radius:19px;
  padding:24px 21px 20px; max-width:420px; width:100%;
  max-height:82vh; overflow-y:auto; }
.form-doc__x{ position:absolute; top:9px; right:13px; background:none; border:0;
  font-size:28px; line-height:1; color:#95a3b5; cursor:pointer; }
.form-doc__micono{ font-size:40px; line-height:1; margin-bottom:6px; }
.form-doc__caja h4{ margin:0 0 6px; font-size:17px; color:#1e3a7c; }
.form-doc__mres{ margin:0 0 15px; font-size:13px; line-height:1.5; color:#5a6a80; }
.form-doc__caja h5{ margin:0 0 7px; font-size:12px; letter-spacing:.07em;
  text-transform:uppercase; color:#8b98ab; }
.form-doc__caja ul{ margin:0 0 15px; padding-left:19px; font-size:13px; line-height:1.62; }
.form-doc__aviso{ margin:0; padding:11px 13px; background:#f7f9fc; border-radius:11px;
  font-size:12px; color:#6b7c93; }
```

---

## 5. Antes de publicar

- [ ] El CTA de padres queda encima de «Explorar por materia» y la tarjeta
      vieja del final se borró (no quedan las dos).
- [ ] El botón de códigos para imprimir ya no está en el Plan de Acción, y sí
      sigue en Mi aula.
- [ ] «Traer mi lista» es el paso 1 y muestra el contador de alumnos.
- [ ] Al publicar aparece el recibo con la hora, y los alumnos siguen en
      pantalla marcados como publicados.
- [ ] «Analizar otra prueba» limpia el formulario sin perder el grupo.
- [ ] El acta de inventario imprime las tres firmas y el monto pendiente.
- [ ] La tarjeta de Formación Docente **no** se ve con sesión de alumno.
- [ ] `sw.js` subido a `meta-app-v48` y todos los `?v=47` cambiados a `?v=48`.
- [ ] Probado en un teléfono real, no solo en el escritorio.
- [ ] Sin guiones largos en ningún texto visible.
