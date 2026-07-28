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
| **Cerrar los datos (paso 2 del SQL)** | ✅ **hecho y comprobado** |
| La clave de servicio en la función de notificaciones | ⚠️ **urgente**: los avisos están rotos |
| Apagar el alta pública de cuentas | ⛔ pendiente |
| Compilar y repartir el APK | ⛔ pendiente |
| Apagar Pages y poner el repositorio en privado | ⛔ pendiente |

**Lo que esto significa hoy:** los datos de la familia están cerrados. Se aplicó
el paso 2 y se comprobó de las dos maneras que hay que comprobarlo: los cuatro
siguen viendo todo lo suyo, y en una ventana de incógnito, sin iniciar sesión,
no sale ni un dato. Antes bastaba con tener la dirección.

**Lo que sigue abierto, y no hay que confundirlo:**

- **El repositorio es público**, así que las dieciséis misiones y todo el código
  se leen desde github.com y desde Pages. Eso lo cierra la tanda 3, no la 2.
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

### 1.2 Los datos de la familia se leen Y se escriben

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

`push_subscriptions` es la peor: con eso se pueden mandar notificaciones a los
teléfonos de la casa. De la tabla del **chat** no se sabe: su seguridad no se
declara en ningún `.sql` del repositorio y hay que mirarla en Supabase.

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

### Tanda 2 · Cerrar los datos (seguridad por fila) · ESCRITA, SIN APLICAR

Está en `supabase/sql/seguridad_familia_2_datos.sql` y **no se ejecuta hasta que
los cuatro hayan entrado**, cada uno en su aparato. No tres.

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

### Tanda 3 · Cerrar la casa (repositorio y Pages)

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
