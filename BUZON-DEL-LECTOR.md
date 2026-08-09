# El Buzón del lector

Cómo funciona la puerta por la que entra en la revista lo que escribe
gente de fuera, y por qué está montada así. Agosto de 2026.

---

## Qué es

La revista sale cada quince días y hasta ahora todo lo que entraba en
ella lo escribían cuatro personas. El buzón abre la otra puerta: quien
lee la revista escanea un **código QR impreso en sus páginas** y manda

- 📝 una **nota o un dato** — algo que pasó y merece contarse;
- 💬 una **opinión** — su carta al director, con su nombre;
- ⚠️ una **denuncia** — algo que está mal y debería saberse;
- 💡 una **sugerencia** — para que la revista salga mejor;
- 🏫 una petición de **cobertura** para la sección **Aulas en acción**.

Con una o dos fotos. Lo que manda cae en Redacción, en su propia
bandeja (📬 Buzón), y desde ahí se convierte en nota de la edición que
toca.

## Las tres piezas, y dónde vive cada una

| pieza | dónde | qué hace |
|---|---|---|
| La pantalla del lector | **`buzon.html` del repositorio de M.E.T.A.S** | recoge el envío |
| Las tablas y su única puerta | `supabase/sql/buzon_lector.sql` | lo guarda |
| La bandeja y el QR | `js/tools/redaccion.js` + `js/qr.js` | lo atiende |

**Por qué la pantalla del lector está en el otro repositorio.** Esta
aplicación es privada y vive detrás de una puerta con contraseña
(Cloudflare Access): no puede recibir visitas de la calle. M.E.T.A.S es
público, tiene dominio propio y ya se reparte por WhatsApp. Los datos,
en cambio, se quedan aquí: la página escribe en ESTE proyecto de
Supabase, por una función que **solo sabe escribir**.

**La página no nombra a la revista.** Se pidió expreso. El enlace anda
suelto en grupos de cientos de personas y la pantalla se presenta sola,
sin explicar de quién es. Lo comprueban las dos sondas.

## Antes de que funcione: correr el SQL

```
Supabase → SQL Editor → pegar supabase/sql/buzon_lector.sql → Run
Supabase → SQL Editor → pegar supabase/sql/buzon_editar.sql → Run
```

Son **dos archivos y en ese orden**. El segundo es el que deja al lector
corregir lo que mandó; sin él el buzón funciona, pero quien se equivoca en
un dato solo puede retirar lo suyo y escribirlo todo otra vez.

Es idempotente. Mientras no se corra, Redacción funciona igual y el
chip 📬 Buzón sencillamente no aparece: se comprueba con una sonda que
la falta de las tablas no rompe nada.

## Las reglas que no se tocan

1. **El enlace no lleva código y no caduca.** La convocatoria de
   M.E.T.A.S sí lo lleva (`?c=R4TP`) porque pregunta por una salida y se
   acaba con ella. Este va **impreso en papel**, y el papel se guarda:
   el número del año pasado seguiría en una gaveta con un QR muerto. La
   dirección es una sola y para siempre. Vive en `RED_BUZON_URL`, y si
   cambia, cambia ahí: de ahí salen el QR, el enlace que se copia y el
   mensaje de WhatsApp.

2. **El teléfono del lector NO viaja a la nota.** Se le prometió en la
   misma pantalla en la que escribió. La nota se exporta a Markdown y se
   pega entera en el programa de maquetación: un teléfono metido en el
   cuerpo acaba impreso, y de ahí no se quita. A la nota pasan **el
   texto y la firma** («— Ana López, madre, Comayagua»), que es lo que
   se publica. El contacto se queda en el buzón, a un toque de WhatsApp,
   que es donde hace falta. `_dev/probe-buzon.html` lo comprueba sobre
   la nota guardada **y sobre la exportación de verdad**.

3. **La bandeja no arrastra las fotos.** Son data URL de casi un mega y
   la lista se pinta cada vez que se abre la herramienta. Viven en
   `buzon_fotos`, aparte, y se piden **al abrir un envío**. La cuenta
   («📷 2») se guarda repetida en la fila del mensaje justo para poder
   enseñarla sin ir a buscarlas.

4. **Nadie se queda sin respuesta.** Abrir un envío lo pasa a *leído*;
   convertirlo, a *atendido* y apuntado a su nota. Mientras esté en
   *nuevo* o *leído* cuenta como pendiente y el chip lo grita. Descartar
   **no borra**: guarda la razón, por si el lector vuelve a escribir o
   llama preguntando.

5. **El lector corrige lo suyo, pero no después de que se apruebe.**
   Con su folio y su teléfono recupera lo que mandó y lo cambia sobre la
   MISMA fila: mismo folio, un solo envío en la bandeja. Mandarlo de
   nuevo no servía —la huella lleva dentro el principio del texto, así
   que al cambiar la primera línea entra como envío nuevo y quedan dos
   casi iguales.

   Se puede mientras esté en *nuevo* o *leído*. En cuanto pasa a
   *atendido* ya es una nota: alguien lo leyó, llamó y lo comprobó. Si a
   partir de ahí el texto pudiera cambiar por debajo, **lo verificado y
   lo impreso dejarían de ser lo mismo**, y bastaría con mandar algo
   inofensivo, esperar a que lo aprueben y cambiarlo después. Esa puerta
   se cierra en el servidor, no en la pantalla.

   Corregir uno ya leído lo **devuelve a la cola como sin leer**, y la
   bandeja lo marca con ✏️ y avisa si el cambio fue después de que
   alguien lo leyera: quien lo leyó el lunes tiene los datos viejos en la
   cabeza y llamaría a preguntar por algo que el texto ya no dice.

   El teléfono no se puede cambiar: es la mitad de la llave con la que el
   lector demuestra que el envío es suyo.

6. **Antes de publicar, se llama.** Está escrito dentro del envío, en
   naranja, delante de quien decide: confirmar lo que cuenta, y si
   señala a alguien —persona o institución— darle la oportunidad de dar
   su versión. No es celo periodístico de manual: al lector se le dijo,
   en la misma pantalla en la que escribió, que se le podría contactar
   para conocer más detalles antes de publicar.

   Ese texto se suavizó a propósito. Decía «se la va a buscar para que
   dé su versión», y se lee como que van a ir a por alguien: en una
   pantalla donde la gente está a punto de poner una denuncia con su
   nombre y su teléfono, esa frase asusta y hace que no la ponga. La
   obligación de la redacción no cambió; cambió cómo se cuenta.

7. **Lo que aceptó queda firmado con su versión** (`etica_version`). Si
   mañana cambian los requisitos, la fila sigue diciendo cuáles firmó
   **ese** lector. Un reclamo dentro de un año se resuelve mirando el
   dato en vez de la memoria de alguien.

## El código QR se genera aquí, sin librerías

`js/qr.js` es un codificador de QR escrito a mano: modo byte, las 40
versiones, los cuatro niveles de corrección. No viene de un CDN por dos
razones que aquí pesan más que la comodidad:

- la aplicación vive detrás de una puerta y se usa sin conexión, y este
  QR se necesita **el día que cierra la revista**, no el día que hay
  buen internet;
- el QR se **imprime**: se genera una vez y se queda en papel durante
  años. No puede depender de que un servicio de fuera siga existiendo,
  ni de mandarle a un tercero la dirección del buzón para que la dibuje.

Se usa en corrección **Q** (aguanta un 25% dañado) porque acaba
fotocopiado, doblado y leído con mala luz, y no se imprime a menos de
**2,5 cm** de lado, con su margen blanco alrededor.

**Un QR mal generado no se ve mal**: se ve perfecto, cuadrado y limpio,
y no lleva a ninguna parte. El error se descubre con la tirada ya
impresa. Por eso se comprueba por tres lados, y no a ojo:

```
pip install segno zxing-cpp numpy
node _dev/verifica-qr.js
```

- **Las tablas** de capacidad, casilla por casilla contra la oficial.
  Ahí se cazó el fallo que costó la tarde: un `5` donde iba un `6` en la
  versión 8 con corrección alta. Pasaba todas las demás pruebas.
- **Los muebles** (localizadores, tiempos, alineación, formato y
  versión) contra segno: 1.144.288 módulos, en las 40 versiones × 4
  correcciones × 8 máscaras.
- **El mensaje**: los códigos se pintan y los **decodifica zxing**. Que
  un lector independiente devuelva exactamente la dirección que se
  quería poner es la única prueba que de verdad importa. Se hace con los
  textos reales y con las 40 versiones llenas hasta el borde.

Nota para quien vuelva: segno mete un códigoword de relleno de más
(`8 - (largo % 8)` en vez de `(8 - largo % 8) % 8`), así que las
cuadrículas enteras **no** coinciden con las suyas aunque todo esté
bien. Se persiguió un rato como si fuera un fallo propio.

## Antes de publicar un cambio del buzón

```
node _dev/verifica-qr.js                 → el código QR, por tres lados
node _dev/servidor-estatico.js      (en otra terminal)
abrir  http://localhost:8124/_dev/probe-buzon.html
```

Y si se toca el SQL, con un PostgreSQL cualquiera a mano (**nunca sobre
la base de verdad**: siembra envíos de mentira):

```
createdb buzontest
psql -d buzontest -f _dev/prueba-buzon-sql.sql
```

Prueba lo que el navegador no puede ver porque pasa dentro del
servidor: que la puerta pública deje pasar lo que debe y pare lo que
debe (texto corto, sin nombre, sin aceptar los requisitos, teléfono
inventado), el freno de cinco al día, el retiro con folio y teléfono,
el tope de las fotos… y sobre todo **que desde la calle no se lea ni
una fila**. Esa última reproduce a mano los permisos de tabla que
Supabase le da al rol `anon`; sin ellos la prueba pasaría por el motivo
equivocado —por falta de permisos— y no probaría la seguridad por fila,
que es lo único que de verdad guarda las denuncias.

La sonda ejecuta el `index.html` de verdad con una base de datos de
mentira a nivel de `fetch`: el cliente de Supabase es el auténtico y
arma sus consultas de verdad; lo único falso es quién contesta. Vigila
las cinco cosas de arriba, y además que **una base vieja** —sin el SQL
corrido— siga funcionando entera.

La otra mitad, la pantalla del lector, tiene su propia comprobación en
el repositorio de M.E.T.A.S:

```
node _dev/verifica-buzon.js
```
