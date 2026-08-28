# Plan · F.A.R.O totalmente privado

Qué pidió el autor el 28 de julio de 2026: que **nada** de este proyecto sea
público. Ni el código, ni las misiones, ni la aplicación. Solo los cuatro. Y
además, guardar aquí documentos personales y contraseñas de la familia.

Este documento dice qué hace falta para eso de verdad, en qué orden, y qué se
pierde por el camino.

---

## Dónde vamos (se actualiza al terminar cada paso)

Última revisión: 28 de julio de 2026.

| | estado |
|---|---|
| La librería de Supabase, dentro del repositorio | ✅ hecho |
| Los cuatro usuarios creados en Supabase Auth | ✅ hecho, con correos reales |
| `familia_miembros` creada y sembrada con los cuatro | ✅ hecho (paso 1 del SQL) |
| La pantalla de entrada nueva, publicada en `main` | ✅ hecho |
| Que los cuatro entren de verdad, cada uno en su aparato | ✅ hecho, los cuatro |
| **Cerrar los datos (paso 2 del SQL)** | ✅ **hecho y comprobado de las dos maneras** |
| La Bóveda de documentos | ✅ instalada y probada |
| El sitio privado en Cloudflare, con puerta | ✅ **hecho**: `faro-dq7.pages.dev` tras Access |
| Que los cuatro entren por la dirección nueva | ⏳ falta que prueben Evelyn, Jael y Angelly |
| La mudanza del progreso, aparato por aparato | ⏳ pendiente, y va ANTES de apagar Pages |
| Apagar Pages y poner el repositorio en privado | ⛔ el último paso |
| La clave de servicio en la función de notificaciones | ⚠️ los avisos siguen rotos |
| Apagar el alta pública de cuentas en Supabase | ⛔ pendiente |
| `recursos_enlaces` (la repisa de enlaces de las misiones) | ⏳ pendiente de correr el SQL |
| Compilar y repartir el APK | ⛔ **ya no hace falta**: la PWA se actualiza sola |

## ⏸ PENDIENTE, para retomar

Se pospuso la prueba con las hijas: primero a la noche del 28 de julio y, al no
poder conectarse, a la noche del 29. Nada de lo de abajo caduca por esperar. Lo que queda, **en este orden y sin saltarse ninguno**:

**1. Que entren los otros tres.** Evelyn, Jael y Angelly, cada uno en SU aparato,
en `https://faro-dq7.pages.dev/`. Pasan dos puertas: el código que Cloudflare
manda al correo, y después su contraseña de F.A.R.O. Las dos son normales.

**2. La mudanza del progreso**, aparato por aparato. Va ANTES de apagar nada,
porque necesita que la dirección vieja siga viva:

   · en la dirección VIEJA (la de github.io): abrir `mudanza.html`, «Guardar»;
   · en la NUEVA: `faro-dq7.pages.dev/mudanza.html`, «Restaurar»;
   · comprobar que el XP volvió, e instalar ahí la PWA.

**3. Cerrar la casa vieja**, solo cuando los cuatro estén dentro y con su
progreso: GitHub → Settings → Pages → apagar, y Settings → General → Danger
Zone → Make private.

   ⚠️ Después de ponerlo privado, comprobar que Cloudflare sigue desplegando:
   un cambio pequeño, un empujón, y mirar que el despliegue salga en verde. No
   darlo por hecho.

**4. Sueltos que no bloquean nada pero siguen ahí:**

   · ⚠️ **Correr `supabase/sql/redaccion_papelera.sql`** en el SQL Editor. Son
     dos columnas en `redaccion_notas` y nada más: no toca ninguna otra tabla ni
     la seguridad por fila. Hasta que se corran, «Eliminar» una nota en
     Redacción sigue borrando de verdad, y la aplicación lo avisa antes de
     hacerlo en vez de fingir que hay red debajo. Después, borrar solo aparta:
     la nota espera en la papelera hasta que se restaure.
   · ⚠️ **Correr `supabase/sql/buzon_lector.sql`** en el SQL Editor. Crea las
     dos tablas del Buzón del lector y su única puerta pública, con la
     seguridad por fila cerrada. Hasta que se corra, Redacción funciona igual
     y el chip 📬 Buzón no aparece (está probado que la falta de las tablas no
     rompe nada), pero lo que manda la gente desde el QR de la revista no
     tiene dónde caer. **Y detrás, `supabase/sql/buzon_editar.sql`**, que es
     el que deja al lector corregir lo que mandó sin dejar dos envíos casi
     iguales en la bandeja. El porqué de todo, en `BUZON-DEL-LECTOR.md`.
   · ⚠️ **Correr `supabase/sql/metas_sugerencias.sql`** en el SQL Editor. Es un
     solo archivo, no depende de ningún otro salvo de `es_familia()` —que ya
     está— y crea la tabla donde caen las sugerencias que la gente escribe
     dentro de las misiones de M.E.T.A.S, con su única puerta pública, que solo
     escribe. Hasta que se corra, la herramienta 💬 **Sugerencias M.E.T.A.S**
     del Acceso Rápido dice que falta instalarla y la insignia de la portada no
     aparece (está probado que la falta de la tabla no rompe nada), pero **lo
     que la gente escriba desde las misiones se queda esperando en su teléfono
     y no llega**. El archivo trae al final las seis comprobaciones para pegar
     después, y la quinta es la que importa: desde la calle la tabla tiene que
     devolver **cero filas**.
   · ⚠️ **Correr `supabase/sql/recursos_enlaces.sql`** en el SQL Editor. Es un
     solo archivo y no depende de ningún otro salvo de `es_familia()`, que ya
     está. **Si ya se corrió antes del 27 de agosto por la tarde, HAY QUE
     VOLVER A CORRERLO**: el archivo creció con dos columnas (`opciones` y
     `orden`) y las añade con `add column if not exists`, así que correrlo otra
     vez no borra nada y deja la tabla al día. Sin ellas, las opciones con las
     que se generó cada recurso y el orden de las tarjetas se quedan en el
     aparato y no viajan. Crea la tabla de la repisa de enlaces de las misiones: las
     herramientas de estudio que salen de NotebookLM (el resumen en audio, el
     video, el mapa mental) para que estén en TODOS los aparatos de la casa y
     no solo en el que las pegó. Pedido por el autor el 27 de agosto de 2026.
     Hasta que se corra, la repisa funciona igual pero **los enlaces se quedan
     en el aparato donde se pegaron**, y la propia repisa lo dice a la vista
     («📴 Solo en este aparato»): no finge que viajan. Es la única tabla de la
     casa que se VE entera entre los cuatro y se ESCRIBE solo por quien puso
     cada fila, así que la comprobación 3 del archivo importa más que de
     costumbre: el `select` tiene que ser la única política sin `auth.uid()`.
     El archivo **se para solo** si falta `es_familia()`, con una frase que dice
     qué hacer: sin ese guardia, el fallo llegaba disfrazado de «la tabla no
     existe», porque el editor deshace el pegado entero cuando una línea falla.
     Y **termina con un `select` que devuelve una fila** diciendo si quedó
     puesto: si al correrlo no sale `✅ recursos_enlaces puesta` con 15
     columnas y 4 políticas, no quedó, por mucho que ponga «Success».
     El archivo trae además las cinco comprobaciones para pegar después, y la
     cuarta es la que de verdad prueba la defensa: un `insert` con
     `javascript:` en la dirección TIENE que fallar.
   · ✅ **CORRIDO** — `supabase/sql/metas_videos.sql`, el 28 de agosto de
     2026, con la columna `preguntas` incluida (se corrió dos veces: la
     primera versión y después la ampliada, y la re-corrida no borró el
     video que ya había). La comprobación del final devolvió lo que tenía
     que devolver: `columnas=16, politicas=1, seguridad_por_fila=t,
     puerta_publica=t` y `videos_guardados=1`. Se comprobó además a mano
     que un video en `borrador` NO sale por la puerta pública y que las
     preguntas SÍ viajan con lo publicado.
     Crea la tabla de los videos de las misiones de M.E.T.A.S: los que el
     alumno ve dentro de la misión, en su pestaña 🎬 Videos.
     ⚠️ **Si el archivo vuelve a crecer, hay que volver a correrlo**, y
     lleva un `drop function` delante que no se puede saltar: PostgreSQL
     no deja cambiarle el tipo devuelto a una función con
     `create or replace`, y como el editor corre todo el pegado en una
     transacción, ese error deshace el archivo entero con un mensaje que
     habla de otra cosa.

   · ⚠️ **Confirmar si `supabase/sql/lecturas_marcas.sql` se corrió.** No consta
     en esta lista (se instaló sin apuntarlo aquí), así que no se sabe. Es la
     tabla de lo que cada quien subraya y anota en las misiones. Se comprueba
     en un minuto: `select count(*) from public.lecturas_marcas;` responde si
     existe, y falla si no.
   · ⚠️ **Ponerle freno a `faro_buzon_retirar` y `faro_buzon_mio`.** Salió al
     revisar la seguridad del buzón el 8 de agosto de 2026, y está desde el
     primer archivo. `faro_buzon_enviar` sí tiene freno (cinco al día por
     teléfono); esas dos no.

     Qué se puede hacer con eso: el folio son cuatro caracteres de un
     alfabeto de 31, o sea 923.521 combinaciones. Quien ya conozca el
     teléfono de un lector —que es lo fácil— puede probar folios uno tras
     otro hasta dar con el suyo, y entonces LEER o BORRAR lo que esa
     persona mandó. No toca a la familia ni a la revista: la seguridad por
     fila sigue cerrada y se comprobó. Pero si lo que se borra es una
     denuncia, y quien la borra es el denunciado, eso es justo lo que el
     buzón existía para evitar.

     Se tapa con unos pocos intentos fallidos por hora, como el freno del
     envío. Mientras tanto el riesgo real es casi nulo: el QR todavía no
     está impreso en ningún número y no hay envíos de verdad que perder.

   · Las notificaciones del chat están rotas y en silencio. Se arregla volviendo
     a desplegar `send-chat-push`, que en el repositorio ya usa la clave de
     servicio. Después, cada quien abre la aplicación una vez para volver a
     suscribirse.
   · Apagar el alta pública de cuentas en Supabase (Authentication → Providers →
     Email). La función es_familia() ya detiene a quien se registre, pero la
     puerta no debería estar abierta.

**5. Un aviso de Supabase que llego tarde, y que hay que confirmar.** El 28 de
julio entro un correo de Supabase avisando de «Table publicly accessible ·
rls_disabled_in_public». Esta fechado **«Issues as of 26 Jul 2026»**, o sea que
describe el estado ANTERIOR al cierre de datos del 28. Casi seguro esta
resuelto, pero se comprueba en el panel (Advisors) o con la consulta que lista
todas las tablas con su estado, y no se da por bueno sin mirar.

Se guarda como caso para la etapa 3 de Ciberseguridad, porque enseña tres cosas:
que el agujero existio de verdad y lo detecto un sistema automatico; que el
aviso tardo dos dias en llegar, y en esa ventana se esta expuesto; y que si ese
mismo correo vuelve cuando ya esta arreglado, enseña a ignorar los avisos, que
es donde empieza el problema siguiente.

**Lo que NO hace falta hacer:** compilar y repartir el APK. Con el sitio privado
en Cloudflare, la PWA se actualiza con cada `git push` y nadie tiene que
reinstalar nada.

---

**Lo que esto significa hoy:** los datos de la familia están cerrados, y esta
vez comprobado de las dos maneras, que son distintas y hacen falta las dos:

1. **Que la familia no perdiera nada.** Los cuatro entraron y siguen viendo sus
   destellos, su inventario, su chat y sus finanzas.
2. **Que un extraño no vea nada.** Pedirle los datos al servidor directamente,
   con la clave pública y sin sesión, devuelve `[]`. Esa misma petición, hasta
   el 28 de julio de 2026, devolvía todo.

La segunda es la que cuenta, y es fácil hacerla mal: abrir la aplicación en
incógnito **e iniciar sesión** no prueba nada, porque entonces se entra como
familia. Se probó así primero y se dio por buena por error. La prueba es la
petición cruda:

    https://<proyecto>.supabase.co/rest/v1/destellos?select=*&apikey=<clave>

Se comprobó sobre `destellos`. Las otras ocho tablas de acceso común recibieron
la política idéntica en la misma transacción, así que están igual, pero repetir
la prueba cambiando el nombre de la tabla cuesta diez segundos y no sobra.

**Lo que sigue abierto, y no hay que confundirlo:**

- **El repositorio sigue público**, así que las dieciséis misiones y todo el
  código se leen desde github.com. La copia de Cloudflare ya no: quedó detrás de
  la puerta. Falta apagar GitHub Pages y cambiar la visibilidad.
- **Las notificaciones del chat están rotas desde este momento**, y en silencio.
  La función send-chat-push lee push_subscriptions con la clave anon, y esa
  clave ya no ve ninguna fila. No da error: devuelve cero. Hay que cambiarla a
  la clave de servicio.
- **Todos tienen que volver a suscribirse** a las notificaciones abriendo la
  aplicación: el paso 2 borró las suscripciones viejas, que no tenían dueño y
  por eso nadie podía verlas ni borrarlas.

---

## 0. Lo que hay que entender antes de tocar nada

F.A.R.O se diseñó como **sitio estático publicado en GitHub Pages**. Esa
decisión fue buena para lo que era (una aplicación de la casa, gratis, que abre
en cualquier teléfono) pero es **incompatible con «totalmente privado»**, y no
por un descuido que se pueda parchar: es la premisa del diseño.

GitHub Pages, en cualquier plan que no sea Enterprise, publica **un sitio web
público**. Siempre. Pagar el plan Pro (unos 4 dólares al mes) solo consigue que
el **repositorio** sea privado mientras el **sitio** sigue abierto a cualquiera
con la dirección. Y como en F.A.R.O las misiones **son** los archivos del sitio,
pagar no cierra nada de lo que importa.

Conclusión, sin rodeos: **Pages se apaga.** Y entonces hay que resolver por
dónde entran los cuatro, porque hoy entran por una dirección web.

---

## 1. Lo que está abierto hoy

Tres agujeros distintos. Solo el segundo permite daño a datos reales.

### 1.1 El código y las misiones se leen

El repositorio es público. Las dieciséis misiones, sus fichas y todo el texto de
las rutas del adulto se leen desde github.com y desde el sitio de Pages. El
sello `familiar` y el candado 🔒 de las tarjetas son decorativos mientras eso sea
así, tal y como avisaba el capítulo 0 de `PROPUESTA-RUTAS-DEL-ADULTO.md`.

### 1.2 Los datos de la familia se leen Y se escriben · ✅ CERRADO

`js/chat.js` lleva la clave de Supabase. **La clave está bien**: es del tipo
`sb_publishable_`, diseñado para vivir en el navegador. El problema es que la
seguridad por fila está **apagada** en seis tablas, y con eso esa clave basta
para leer y escribir sin abrir la aplicación siquiera:

| tabla | qué guarda |
|---|---|
| `destellos` | ideas y apuntes |
| `inventario` | el inventario de la casa |
| `redaccion_ediciones` | la revista |
| `redaccion_notas` | las notas |
| `redaccion_config` | su configuración |
| `push_subscriptions` | a qué teléfonos llegan las notificaciones |

`push_subscriptions` era la peor: con eso se pueden mandar notificaciones a los
teléfonos de la casa.

Ya está cerrado. Al ir a aplicarlo aparecieron cuatro tablas más que la lista
original no traía y que habrían quedado abiertas justo después de dar la casa
por cerrada: `mensajes` (el chat familiar entero), `cuentas`, `transacciones` y
`deudas`. Se encontraron leyendo qué tablas nombra el código de verdad, en vez
de fiarse de los `.sql` del repositorio, que solo dicen lo que se pensó.
Lección para la próxima: la lista se saca del código y se confirma con la
consulta que lista TODAS las tablas con su estado.

### 1.3 Cualquiera con la dirección abre la aplicación · ✅ CERRADO

Así estaba: `js/auth.js` no autenticaba, guardaba en `localStorage` cuál perfil
se había elegido, y los **cuatro PIN estaban escritos en texto plano** en ese
archivo, dentro de un repositorio público.

Ya no. La puerta pide contraseña de verdad contra Supabase Auth, y los PIN se
borraron del código.

> **Los cuatro PIN viejos siguen quemados**, aunque ya no estén en el archivo.
> Estuvieron publicados y un repositorio público se copia, se indexa y se
> conserva. No se reutilizan en ningún otro sitio, nunca.

**Ojo con la confusión fácil:** que la puerta esté cerrada no cierra 1.2. Son
cosas distintas y el agujero de los datos sigue abierto hasta el paso 2 del SQL,
porque las tablas no preguntan por la puerta: preguntan por la clave, y esa la
lleva cualquiera que abra el código.

---

## 2. Por qué la seguridad por fila no se puede arreglar sola

Para escribir una política de seguridad por fila hace falta **una identidad que
comprobar**: la base de datos tiene que poder preguntar «¿quién es este?». Hoy
no hay quién. El «login» elige perfil en el teléfono y la base de datos nunca se
entera.

Por eso el orden importa y no se puede alterar:

```
autenticación de verdad  →  seguridad por fila  →  bóveda de documentos
```

Encender la seguridad por fila antes de tener autenticación deja la aplicación
muerta: todas las consultas se rechazan y no hay con qué autorizarlas.

---

## 3. El plan, en cuatro tandas

### Tanda 1 · La puerta de verdad (autenticación) · ✅ HECHA

Se cambió el «login» de perfil por **Supabase Auth**. Cómo quedó, que difiere de
lo que se había planeado aquí y conviene que quede escrito:

- **Se entra con el correo**, no eligiendo el nombre de una lista. El
  desplegable obligaba a llevar los cuatro correos escritos en el código, y el
  código lo lee cualquiera.
- **Quién es cada quien lo dice la tabla `familia_miembros`**, no el código ni
  los metadatos del usuario (que el propio usuario puede reescribir).
- Los correos de la familia **no están en el repositorio**. Se escribieron una
  vez en el editor de Supabase, que es privado.

Lo que se planeó originalmente y quedó obsoleto:

1. Crear los cuatro usuarios en Supabase. Contraseñas nuevas, no los PIN viejos.
2. Reescribir `js/auth.js`: `signInWithPassword`, sesión de Supabase en vez de
   `localStorage`, y renovación de sesión para que no pida contraseña cada día.
3. Que las hijas puedan entrar fácil: sesión larga en su propio teléfono, para
   que en la práctica escriban la contraseña una vez y no cada vez.
4. Borrar `FARO_USERS` y sus PIN del código.

### Tanda 2 · Cerrar los datos (seguridad por fila) · ✅ HECHA

Está en `supabase/sql/seguridad_familia_2_datos.sql`. Se ejecutó el 28 de julio,
después de que los cuatro entraran cada uno en su aparato, y se comprobó que
nadie perdió datos y que en incógnito no sale nada.

Cubre diez tablas, no seis: a las de la casa se sumaron `mensajes` (el chat
entero), `cuentas`, `transacciones` y `deudas`, que en la primera versión se
habían dejado «para mirar a mano» y eso las dejaba abiertas justo después de
creer que la casa quedaba cerrada.

La política, con la identidad ya disponible:

```sql
-- El molde, tabla por tabla. Nada de anon: solo los cuatro de la casa.
alter table public.destellos enable row level security;

create policy destellos_familia on public.destellos
  for all
  to authenticated
  using (public.es_familia())
  with check (public.es_familia());
```

⚠️ **La primera versión de este plan escribía `using (true)`, y estaba mal.**
Lo encontró la revisión adversaria y merece quedar escrito, porque es un error
que parece correcto: `to authenticated` **no** significa «uno de los cuatro»,
significa «cualquiera con una sesión iniciada en este proyecto». Y como la clave
publicable va en el navegador (correctamente), cualquiera podía registrarse con
su propio correo, recibir un permiso válido y leer y escribir todo, sin abrir
siquiera la aplicación. La política que parecía cerrar la casa la dejaba abierta
a quien supiera pedir una cuenta.

Por eso existe `es_familia()`, que pregunta si quien consulta tiene fila en
`familia_miembros`. Es decir: **los cuatro pueden todo; cualquier otro, nada,
tenga cuenta o no.** Para una familia de cuatro eso es suficiente y es mucho
mejor que hilar fino y equivocarse. Después, si hace falta, se afina (que las
finanzas solo las vean los padres, por ejemplo).

`push_subscriptions` lleva una política más estrecha: cada quien ve y borra
**solo su propia suscripción**, comparando con `auth.uid()`. Una suscripción
ajena en malas manos es poder mandar notificaciones al teléfono de otro.

Y hay que revisar tabla por tabla en Supabase, no en el repositorio, porque lo
declarado y lo aplicado pueden no coincidir. El propio archivo del paso 2
termina con la consulta que lo dice.

### Tanda 3 · Cerrar la casa (repositorio y Pages) · EN CURSO

Solo cuando las tandas 1 y 2 estén probadas, porque este paso corta la entrada
actual:

1. **Compilar y repartir el APK** a los cuatro. `capacitor.config.json` no tiene
   bloque `server`, así que el APK empaqueta los archivos y funciona sin red:
   es la única puerta que no exige un sitio público.
2. **Apagar GitHub Pages** de este repositorio.
3. **Poner el repositorio en privado**: Settings → General → Danger Zone →
   Change repository visibility → Make private.

Lo que se pierde: abrir F.A.R.O escribiendo una dirección en el navegador. A
partir de aquí se entra por la aplicación instalada. Es el precio de que no haya
nada público, y no hay forma de evitarlo sin pagar Enterprise.

### Tanda 4 · La bóveda de documentos

Ya con la casa cerrada, guardar documentos personales de la familia (partidas,
identidades, títulos, recibos). Diseño propuesto:

- Supabase Storage con un depósito **privado**, nunca público.
- Subida y descarga solo con sesión iniciada, por enlaces firmados que caducan.
- Cada documento con su fila en una tabla: qué es, de quién, cuándo caduca (los
  documentos caducan: pasaportes, licencias) y quién lo subió.
- Aviso cuando algo esté por vencer, que es la mitad de la utilidad de tener esto.

---

## 4. Las contraseñas: lo que recomiendo, y por qué

Pediste guardar también **las contraseñas de la familia**. Aquí la recomendación
es no hacerlo en F.A.R.O, y conviene que quede escrito el porqué:

1. Un gestor de contraseñas mal hecho es **peor que no tener ninguno**, porque
   concentra todo en un sitio y da la sensación de estar protegido.
2. Hacerlo bien no es guardar el texto: es **cifrado del lado del cliente**, con
   una clave maestra que **nunca** llega al servidor, derivación de clave con
   coste alto, y un plan de recuperación para el día que alguien la olvide. Cada
   una de esas cuatro cosas mal hecha lo tira todo.
3. Ya existen hechos y auditados. **Bitwarden** tiene plan gratuito, funciona en
   los cuatro teléfonos y tiene organización familiar. **KeePass** es gratis y
   ni siquiera sube nada: el archivo vive donde tú digas.
4. El tiempo de construir eso está mejor puesto en las etapas 3 de las rutas.

**Si aun así se quiere en F.A.R.O**, el mínimo aceptable, sin excepciones:

- Cifrado en el teléfono con una clave maestra que no se guarda en ninguna parte
  ni viaja al servidor.
- El servidor guarda **solo texto cifrado**. Una fuga completa de la base de
  datos no debe revelar ni una contraseña.
- Sin recuperación mágica: si se olvida la clave maestra, se pierde. Cualquier
  «recuperar contraseña» que funcione es una puerta trasera.

Eso es una tanda entera por sí sola, y va después de la 4, nunca antes.

---

## 5. Lo que hay que hacer y quién lo hace

| # | qué | quién |
|---|---|---|
| 1 | Cambiar los cuatro PIN quemados donde se hayan reutilizado | el autor, hoy |
| 2 | Revisar en Supabase qué tablas tienen la seguridad apagada de verdad | el autor o Claude con acceso de lectura |
| 3 | Crear los cuatro usuarios de Supabase Auth | el autor |
| 4 | Reescribir `js/auth.js` y probar la entrada de los cuatro | Claude |
| 5 | Las políticas de seguridad por fila, tabla por tabla | Claude escribe, el autor aplica |
| 6 | Compilar y repartir el APK | el autor (hace falta Android SDK) |
| 7 | Apagar Pages y poner el repositorio en privado | el autor |
| 8 | La bóveda de documentos | Claude |

---

## 6. Lo que este plan no resuelve

- **Supabase sigue siendo un tercero.** Los datos están en su servidor. Privado
  frente a extraños no es privado frente al proveedor. Para una familia es un
  trato razonable, pero conviene saberlo y no confundirlo.
- **El APK se comparte por archivo.** Quien reciba el APK tiene la aplicación,
  aunque sin contraseña no vea ningún dato: por eso la tanda 1 va primera.
- **Las copias de seguridad son parte de la privacidad.** Perder los datos
  también es perderlos. Eso es la etapa 5 de la Ruta de la Casa Cerrada, y aquí
  deja de ser materia de estudio para ser tarea.
