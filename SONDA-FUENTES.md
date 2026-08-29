# Sonda de fuentes · La Criba 🪶

**2026-08-29** · 28 fuentes, 72 direcciones candidatas probadas.

> ℹ️ Sin `CRIBA_MAILTO`: no se usó la cola educada de Crossref y OpenAlex. Funciona igual, con menos prioridad.

**Este archivo lo escribe `_dev/sonda-fuentes.js`. No se edita a mano** — se
vuelve a correr. Lo que dice es lo que las fuentes devolvieron de verdad, no
lo que se esperaba de ellas.

## Veredicto

| | |
|---|---|
| ✅ Sirven | **14** |
| ⚠️ Responden pero sin canal | **8** |
| ❌ No responden | **6** |

«Sin canal» **no** es «no existe»: la institución está en pie pero no
publica un RSS/Atom/API que se pueda leer. Eso no las descarta — las manda a
la lista de las que hay que leer de otra forma, y eso es trabajo, no un
descarte.

## Lo que devolvió cada una

### Fase 1

| Fuente | Racimo | Formato | Ítems | Resumen | DOI | Idioma | Ritmo |
|---|---|---|---|---|---|---|---|
| The Conversation (español) | A·C·G | `atom` | 32 | · | ✅ | en | 17.1/día |
| Agencia SINC | A·G | **⚠️ sin canal** | · | · | · | · | · |
| Nada es Gratis (FEDEA) | C | `rss` | 15 | · | · | es | 0.8/día |
| SciELO | A·C | `json` | 36 | · | · | es~ | ? |
| Redalyc | A·C | **⚠️ sin canal** | · | · | · | · | · |
| Dialnet | A·C·G | **⚠️ sin canal** | · | · | · | · | · |
| CEPAL | C | **⚠️ sin canal** | · | · | · | · | · |
| BID · Banco Interamericano de Desarrollo | C | **❌ no responde** | · | · | · | · | · |
| SIECA | C | `rss` | 10 | ✅ | · | es | 0.9/día |
| Banco Central de Honduras | C·HN | **⚠️ sin canal** | · | · | · | · | · |
| CNBS · Comisión Nacional de Bancos y Seguros | C·HN | `rss` | 10 | ✅ | · | es | 0.1/día |
| INE Honduras | C·HN | **❌ no responde** | · | · | · | · | · |
| COHEP | C·HN | **⚠️ sin canal** | · | · | · | · | · |
| FOSDEH | C·HN | **❌ no responde** | · | · | · | · | · |
| Bolsa Centroamericana de Valores | C·HN | `rss` | 10 | ✅ | · | en | 1.1/día |

### Fase 2

| Fuente | Racimo | Formato | Ítems | Resumen | DOI | Idioma | Ritmo |
|---|---|---|---|---|---|---|---|
| OpenAlex | todos | `json` | 5 | ✅ | ✅ | en | ? |
| Crossref | todos | `json` | 5 | · | · | es~ | ? |
| Semantic Scholar | todos | **❌ no responde** | · | · | · | · | · |
| Europe PMC | A·D | `json` | 5 | ✅ | ✅ | en | ? |
| Cochrane Library | A | **❌ no responde** | · | · | · | · | · |
| Nature Human Behaviour | A | `rss1` | 8 | ✅ | ✅ | en~ | 2/día |
| NEP · New Economics Papers | C | **⚠️ sin canal** | · | · | · | · | · |
| NBER Working Papers | C | `rss` | 26 | · | · | en~ | ? |
| Retraction Watch | G | `rss` | 10 | · | ✅ | en | 0.9/día |
| Data Colada | G | `rss` | 50 | · | · | en | 0/día |
| Royal Society Open Science | G | **❌ no responde** | · | · | · | · | · |
| World Inequality Lab | C | `rss` | 1 | · | · | en | 2024-08-23 |
| Judgment and Decision Making | A | **⚠️ sin canal** | · | · | · | · | · |

**Ritmo** es ítems por día, calculado del propio canal. Es lo que dice si una
fuente cabe en una edición diaria o la ahoga.
**Idioma** con `~` es a ojo (el canal no lo declara): es una pista, no un dato.

## Las que no sirvieron, con lo que se probó

- **Agencia SINC** — sin canal
  - `https://www.agenciasinc.es/rss` → 404 · html · 0 ítems
  - `https://www.agenciasinc.es/rss/Noticias` → 404 · html · 0 ítems
  - `https://www.agenciasinc.es/feed` → 200 · rss · 0 ítems
- **Redalyc** — sin canal
  - `https://www.redalyc.org/oai?verb=Identify` → 404 · text/html · 0 ítems
  - `https://www.redalyc.org/rss.oa` → 404 · text/html · 0 ítems
  - `https://www.redalyc.org/` → 200 · html · 0 ítems
- **Dialnet** — sin canal
  - `https://dialnet.unirioja.es/oai/OAIHandler?verb=Identify` → 200 · oai-pmh · 0 ítems
  - `https://dialnet.unirioja.es/rss/` → 404 · html · 0 ítems
  - `https://dialnet.unirioja.es/` → 200 · html · 0 ítems
- **CEPAL** — sin canal
  - `https://repositorio.cepal.org/oai/request?verb=Identify` → 400 · html · 0 ítems
  - `https://www.cepal.org/es/rss.xml` → 404 · html · 0 ítems
  - `https://www.cepal.org/es/publicaciones/rss` → 404 · html · 0 ítems
  - `https://www.cepal.org/es` → 200 · html · 0 ítems
- **BID · Banco Interamericano de Desarrollo** — no responde
  - `https://blogs.iadb.org/feed/` → 403 · html · 0 ítems
  - `https://publications.iadb.org/es/rss` → 403 · html · 0 ítems
  - `https://publications.iadb.org/oai/request?verb=Identify` → 403 · html · 0 ítems
- **Banco Central de Honduras** — sin canal
  - `https://www.bch.hn/rss` → 404 · html · 0 ítems
  - `https://www.bch.hn/feed` → 404 · html · 0 ítems
  - `https://www.bch.hn/estadisticas-y-publicaciones-economicas` → 200 · html · 0 ítems
  - `https://www.bch.hn/` → 200 · html · 0 ítems
- **INE Honduras** — no responde
  - `https://www.ine.gob.hn/feed/` → 403 · html · 0 ítems
  - `https://ine.gob.hn/feed/` → 403 · html · 0 ítems
  - `https://www.ine.gob.hn/` → 403 · html · 0 ítems
- **COHEP** — sin canal
  - `https://cohep.com/feed/` → 200 · html · 0 ítems
  - `https://cohep.com/rss` → 200 · html · 0 ítems
  - `https://cohep.com/` → 200 · html · 0 ítems
- **FOSDEH** — no responde
  - `https://fosdeh.com/feed/` → ⚠️ fetch failed
  - `https://www.fosdeh.com/feed/` → ⚠️ fetch failed
  - `https://fosdeh.com/` → ⚠️ fetch failed
- **Semantic Scholar** — no responde
  - `https://api.semanticscholar.org/graph/v1/paper/search?query=decision%20making&limit=5&fields=title,abstract,externalIds,year,publicationDate` → 429 · json · 0 ítems
- **Cochrane Library** — no responde
  - `https://www.cochranelibrary.com/rss/cdsr/reviews` → 404 · html · 0 ítems
  - `https://www.cochranelibrary.com/en/rss` → 412 · html · 0 ítems
  - `https://www.cochranelibrary.com/` → 412 · html · 0 ítems
- **NEP · New Economics Papers** — sin canal
  - `https://nep.repec.org/rss/nep-dev.xml` → 404 · html · 0 ítems
  - `https://nep.repec.org/rss/nep-pol.xml` → 404 · html · 0 ítems
  - `https://nep.repec.org/` → 200 · html · 0 ítems
- **Royal Society Open Science** — no responde
  - `https://royalsocietypublishing.org/action/showFeed?ui=0&mi=0&ai=2b4&jc=rsos&type=etoc&feed=rss` → 403 · html · 0 ítems
  - `https://royalsocietypublishing.org/rss/rsos.xml` → 404 · html · 0 ítems
- **Judgment and Decision Making** — sin canal
  - `https://www.cambridge.org/core/rss/product/id/8B0BBF4B9D4C4A2B3B2F0D4E4B9D4C4A` → 403 · html · 0 ítems
  - `https://journal.sjdm.org/rss.xml` → 404 · html · 0 ítems
  - `https://journal.sjdm.org/` → 200 · html · 0 ítems

---
Generado por `node _dev/sonda-fuentes.js` · 2026-08-29
