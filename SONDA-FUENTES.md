# Sonda de fuentes · La Criba 🪶

**2026-08-30** · 15 fuentes, 38 direcciones candidatas probadas.

> ℹ️ Sin `CRIBA_MAILTO`: no se usó la cola educada de Crossref y OpenAlex. Funciona igual, con menos prioridad.

**Este archivo lo escribe `_dev/sonda-fuentes.js`. No se edita a mano** — se
vuelve a correr. Lo que dice es lo que las fuentes devolvieron de verdad, no
lo que se esperaba de ellas.

## Veredicto

| | | Qué significa |
|---|---|---|
| ✅ Sirven | **12** | Hay canal y trae artículos |
| ⁉️ Dudosas | **0** | Responden con ítems, pero sin fecha, sin DOI y sin resumen: casi seguro **no son artículos** |
| ⚠️ Sin canal | **1** | La institución está en pie y no publica canal legible |
| 🚫 Rechazan | **1** | 403: rechazan recolectores a propósito |
| ⏳ Limitadas | **0** | 429: hay cola. Se puede, más despacio o con clave |
| ❌ Mudas | **1** | No contestan |

Ninguna de las cinco últimas es «no existe», y la diferencia es lo que importa:
**«sin canal» y «rechaza» son trabajo pendiente; «muda» es una fuente muerta.**

## Lo que devolvió cada una

**Ritmo** es ítems por día, calculado del propio canal. Es lo que dice si una
fuente cabe en una edición diaria o la ahoga.
**Idioma** con `~` es a ojo (el canal no lo declara): es una pista, no un dato.

## Las que no sirvieron, con lo que se probó

- **Nueva Sociedad** — no responde
  - `https://nuso.org/rss/` → 500 · html · 0 ítems
  - `https://nuso.org/feed/` → 500 · html · 0 ítems
  - `https://nuso.org/rss.xml` → 500 · html · 0 ítems
- **CTXT · Contexto y Acción** — rechaza
  - `https://ctxt.es/rss/` → 403 · html · 0 ítems
  - `https://ctxt.es/es/rss` → 403 · html · 0 ítems
  - `https://ctxt.es/feed` → 403 · html · 0 ítems
- **Agencia SINC** — sin canal
  - `https://www.agenciasinc.es/rss` → 404 · html · 0 ítems
  - `https://www.agenciasinc.es/rss/todas` → 404 · html · 0 ítems
  - `https://www.agenciasinc.es/rss/noticias` → 404 · html · 0 ítems
  - `https://www.agenciasinc.es/feed` → 200 · rss · 0 ítems

---
Generado por `node _dev/sonda-fuentes.js` · 2026-08-30
