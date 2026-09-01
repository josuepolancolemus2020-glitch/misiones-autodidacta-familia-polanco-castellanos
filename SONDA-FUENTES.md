# Sonda de fuentes · La Criba 🪶

**2026-09-01** · 43 fuentes, 116 direcciones candidatas probadas.

> ℹ️ Sin `CRIBA_MAILTO`: no se usó la cola educada de Crossref y OpenAlex. Funciona igual, con menos prioridad.

**Este archivo lo escribe `_dev/sonda-fuentes.js`. No se edita a mano** — se
vuelve a correr. Lo que dice es lo que las fuentes devolvieron de verdad, no
lo que se esperaba de ellas.

## Veredicto

| | | Qué significa |
|---|---|---|
| ✅ Sirven | **27** | Hay canal y trae artículos |
| ⁉️ Dudosas | **0** | Responden con ítems, pero sin fecha, sin DOI y sin resumen: casi seguro **no son artículos** |
| ⚠️ Sin canal | **6** | La institución está en pie y no publica canal legible |
| 🚫 Rechazan | **6** | 403: rechazan recolectores a propósito |
| ⏳ Limitadas | **1** | 429: hay cola. Se puede, más despacio o con clave |
| ❌ Mudas | **3** | No contestan |

Ninguna de las cinco últimas es «no existe», y la diferencia es lo que importa:
**«sin canal» y «rechaza» son trabajo pendiente; «muda» es una fuente muerta.**

## Lo que devolvió cada una

### Fase 1

| Fuente | Racimo | Formato | Ítems | Resumen | DOI | Idioma | Ritmo |
|---|---|---|---|---|---|---|---|
| The Conversation (español) | A·C·G | `atom` | 34 | ✅ | ✅ | en⚠es | 16.2/día |
| Agencia SINC | A·G | **⚠️ sin canal** | · | · | · | · | · |
| Nada es Gratis (FEDEA) | C | `rss` | 15 | ✅ | · | es | 0.8/día |
| SciELO | A·C | **🚫 rechaza recolectores** | · | · | · | · | · |
| Redalyc | A·C | **⚠️ sin canal** | · | · | · | · | · |
| Dialnet | A·C·G | `oai-pmh` | 100 | ✅ | · | es~ | ? |
| CEPAL | C | **⚠️ sin canal** | · | · | · | · | · |
| BID · Banco Interamericano de Desarrollo | C | **🚫 rechaza recolectores** | · | · | · | · | · |
| SIECA | C | `rss` | 10 | ✅ | · | es | 0.7/día |
| Banco Central de Honduras | C·HN | **⚠️ sin canal** | · | · | · | · | · |
| CNBS · Comisión Nacional de Bancos y Seguros | C·HN | `rss` | 10 | ✅ | · | es | 0.1/día |
| INE Honduras | C·HN | **🚫 rechaza recolectores** | · | · | · | · | · |
| COHEP | C·HN | `rss` | 10 | ✅ | · | es | 0/día |
| FOSDEH | C·HN | **❌ no responde** | · | · | · | · | · |
| Bolsa Centroamericana de Valores | C·HN | `rss` | 10 | ✅ | · | en⚠es | 0.9/día |

### Fase 2

| Fuente | Racimo | Formato | Ítems | Resumen | DOI | Idioma | Ritmo |
|---|---|---|---|---|---|---|---|
| OpenAlex | todos | `json` | 5 | ✅ | ✅ | en | ? |
| Crossref | todos | `json` | 5 | · | ✅ | es~ | ? |
| Semantic Scholar | todos | **⏳ limitada (429)** | · | · | · | · | · |
| Europe PMC | A·D | `json` | 5 | ✅ | ✅ | en | ? |
| Cochrane Library | A | **❌ no responde** | · | · | · | · | · |
| Nature Human Behaviour | A | `rss1` | 8 | ✅ | ✅ | en~ | 1.3/día |
| NEP · New Economics Papers | C | **⚠️ sin canal** | · | · | · | · | · |
| NBER Working Papers | C | `rss` | 31 | ✅ | · | en~ | ? |
| Retraction Watch | G | `rss` | 10 | ✅ | ✅ | en | 0.9/día |
| Data Colada | G | `rss` | 50 | ✅ | · | en | 0/día |
| Royal Society Open Science | G | **🚫 rechaza recolectores** | · | · | · | · | · |
| World Inequality Lab | C | `rss` | 1 | · | · | en | 2024-08-23 |
| Judgment and Decision Making | A | **🚫 rechaza recolectores** | · | · | · | · | · |

**Ritmo** es ítems por día, calculado del propio canal. Es lo que dice si una
fuente cabe en una edición diaria o la ahoga.
**Idioma** con `~` es a ojo (el canal no lo declara): es una pista, no un dato.

## Las que no sirvieron, con lo que se probó

- **Agencia SINC** — sin canal
  - `https://www.agenciasinc.es/rss/todas` → 404 · html · 0 ítems
  - `https://www.agenciasinc.es/rss/Noticias/` → 404 · html · 0 ítems
  - `https://www.agenciasinc.es/feed` → 200 · rss · 0 ítems
  - `https://www.agenciasinc.es/` → 200 · html · 0 ítems
- **SciELO** — rechaza
  - `https://search.scielo.org/?q=*&lang=es&output=rss` → 403 · html · 0 ítems
  - `https://www.scielo.org/php/index.php?lang=es&format=rss` → 200 · html · 0 ítems
  - `https://blog.scielo.org/es/feed/` → 403 · html · 0 ítems
  - `https://articlemeta.scielo.org/api/v1/article/identifiers/?collection=scl&limit=10` → 200 · json · 0 ítems
- **Redalyc** — sin canal
  - `https://www.redalyc.org/oai?verb=ListRecords&metadataPrefix=oai_dc` → 404 · text/html · 0 ítems
  - `https://www.redalyc.org/oai/?verb=ListRecords&metadataPrefix=oai_dc` → 404 · text/html · 0 ítems
  - `https://www.redalyc.org/` → 200 · html · 0 ítems
- **CEPAL** — sin canal
  - `https://repositorio.cepal.org/oai/request?verb=ListRecords&metadataPrefix=oai_dc` → 400 · html · 0 ítems
  - `https://repositorio.cepal.org/oai/request?verb=Identify` → 400 · html · 0 ítems
  - `https://www.cepal.org/es/rss/publicaciones` → 404 · html · 0 ítems
  - `https://www.cepal.org/es` → 200 · html · 0 ítems
- **BID · Banco Interamericano de Desarrollo** — rechaza
  - `https://blogs.iadb.org/es/feed/` → 403 · html · 0 ítems
  - `https://blogs.iadb.org/feed/` → 403 · html · 0 ítems
  - `https://publications.iadb.org/es/rss` → 403 · html · 0 ítems
- **Banco Central de Honduras** — sin canal
  - `https://www.bch.hn/rss` → 404 · html · 0 ítems
  - `https://www.bch.hn/feed` → 404 · html · 0 ítems
  - `https://www.bch.hn/?feed=rss2` → 200 · html · 0 ítems
  - `https://www.bch.hn/publicaciones-y-estadisticas` → 404 · html · 0 ítems
  - `https://www.bch.hn/` → 200 · html · 0 ítems
- **INE Honduras** — rechaza
  - `https://www.ine.gob.hn/?feed=rss2` → 403 · html · 0 ítems
  - `https://www.ine.gob.hn/feed/` → 403 · html · 0 ítems
  - `https://ine.gob.hn/feed/` → 403 · html · 0 ítems
  - `https://www.ine.gob.hn/` → 403 · html · 0 ítems
- **FOSDEH** — no responde
  - `https://fosdeh.net/feed/` → ⚠️ fetch failed
  - `https://www.fosdeh.net/feed/` → ⚠️ fetch failed
  - `https://fosdeh.com/feed/` → ⚠️ fetch failed
  - `https://fosdeh.org/feed/` → ⚠️ fetch failed
- **Semantic Scholar** — limitada
  - `https://api.semanticscholar.org/graph/v1/paper/search?query=decision%20making&limit=5&fields=title,abstract,externalIds,year,publicationDate` → 429 · json · 0 ítems
- **Cochrane Library** — no responde
  - `https://www.cochranelibrary.com/rss/cdsr/reviews` → 404 · html · 0 ítems
  - `https://www.cochranelibrary.com/en/rss` → 412 · html · 0 ítems
  - `https://www.cochranelibrary.com/` → 412 · html · 0 ítems
- **NEP · New Economics Papers** — sin canal
  - `https://nep.repec.org/rss/nep-dev.rss` → 404 · html · 0 ítems
  - `https://nep.repec.org/rss/nep-dev.xml` → 404 · html · 0 ítems
  - `https://nep.repec.org/nep-dev.html` → 200 · html · 0 ítems
  - `https://nep.repec.org/` → 200 · html · 0 ítems
- **Royal Society Open Science** — rechaza
  - `https://royalsocietypublishing.org/action/showFeed?ui=0&mi=0&ai=2b4&jc=rsos&type=etoc&feed=rss` → 403 · html · 0 ítems
  - `https://royalsocietypublishing.org/rss/rsos.xml` → 404 · html · 0 ítems
- **Judgment and Decision Making** — rechaza
  - `https://www.cambridge.org/core/rss/product/id/8B0BBF4B9D4C4A2B3B2F0D4E4B9D4C4A` → 403 · html · 0 ítems
  - `https://journal.sjdm.org/rss.xml` → 404 · html · 0 ítems
  - `https://journal.sjdm.org/` → 200 · html · 0 ítems
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
Generado por `node _dev/sonda-fuentes.js` · 2026-09-01
