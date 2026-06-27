/* ─────────────────────────────────────────────
   COLLAGE DE EVIDENCIAS
───────────────────────────────────────────── */

/* ── Estado ───────────────────────────────── */
let _coPhotos   = [];   // File[]
let _coLogoFile = null; // File | null

// Cache de render (se rellena en coGenerate, se usa en _coRedraw)
let _coImgCache  = [];   // HTMLImageElement[]  — fotos ya cargadas
let _coLogoCache = null; // HTMLImageElement | null
let _coSlots     = [];   // { x,y,w,h }[] — layout calculado
let _coOffsets   = [];   // { dx,dy }[]   — desplazamiento por foto (px canvas)
let _coMeta      = null; // { W,H,bannerH,photoH,text,format }

// Ratios de cuadrícula editables (0–1); se reinician al generar de nuevo
let _coSplits    = null; // objeto según n; ver _coDefaultSplits()

// Estado de arrastre (pan por foto)
let _coDragging  = null; // { idx, startX, startY, startDx, startDy }

// Estado de arrastre de separadores de cuadrícula
let _coSepDrag   = null; // { key, startClient, startRatio, n, W, photoH }

/* Llamada desde switchView() */
function initCollage() {}

/* ══════════════════════════════════════════
   HELPERS CANVAS
══════════════════════════════════════════ */

/**
 * Dibuja `img` con object-fit:cover en el rect (x,y,w,h).
 * dx/dy son desplazamientos en px del canvas:
 *   dx > 0  → la imagen se mueve a la derecha (vemos más de su lado izquierdo)
 *   dy > 0  → la imagen se mueve hacia abajo  (vemos más de su parte superior)
 */
function _coCover(ctx, img, x, y, w, h, dx = 0, dy = 0) {
  const iA = img.naturalWidth / img.naturalHeight;
  const sA = w / h;
  let sx, sy, sw, sh;

  if (iA > sA) {
    // Imagen más ancha → desbordamiento horizontal
    sh = img.naturalHeight;
    sw = sh * sA;
    const maxSlide = img.naturalWidth - sw;
    const srcPxPerCanvasPx = sw / w;          // cuántos px fuente por px canvas
    sx = maxSlide / 2 - dx * srcPxPerCanvasPx;
    sx = Math.max(0, Math.min(maxSlide, sx));
    sy = 0;
  } else {
    // Imagen más alta → desbordamiento vertical
    sw = img.naturalWidth;
    sh = sw / sA;
    const maxSlide = img.naturalHeight - sh;
    const srcPxPerCanvasPx = sh / h;
    sy = maxSlide / 2 - dy * srcPxPerCanvasPx;
    sy = Math.max(0, Math.min(maxSlide, sy));
    sx = 0;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

// Rectángulo redondeado compatible con todos los navegadores
function _coRR(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function _coLoadImg(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload  = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Imagen inválida')); };
    img.src = url;
  });
}

/* ══════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════ */

/** Valores por defecto de ratios (coinciden con el layout clásico). */
function _coDefaultSplits(n) {
  switch (n) {
    case 2: return { v: 0.5 };
    case 3: return { hTop: 0.58, vBot: 0.5 };
    case 4: return { vx: 0.5, hy: 0.5 };
    case 5: return { row: 0.5, topV: 0.5, bf0: 1 / 3, bf1: 1 / 3 };
    case 6: return { f0: 1 / 3, f1: 1 / 3, row: 0.5 };
    default: return {};
  }
}

function _coCloneSplits(n) {
  const d = _coDefaultSplits(n);
  return JSON.parse(JSON.stringify(d));
}

const _coG = 6;
const _coClamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Layout de slots (zona de fotos) según n, tamaño y ratios arrastrables.
 * W,H son px de la zona de fotos (no incluye leyenda).
 */
function _coLayoutWithSplits(n, W, H, splits) {
  const G = _coG;
  const f = v => Math.floor(v);
  const innerW = W - G;
  const innerW3 = W - 2 * G;
  const innerH  = H - G;
  const minFrac = 0.08;

  if (n === 1) return [{ x: 0, y: 0, w: W, h: H }];

  if (n === 2) {
    const v = _coClamp(splits.v ?? 0.5, minFrac, 1 - minFrac);
    const w = f(innerW * v);
    const w2 = W - w - G;
    return [
      { x: 0,     y: 0, w,     h: H },
      { x: w + G, y: 0, w: w2, h: H },
    ];
  }

  if (n === 3) {
    const ht = _coClamp(splits.hTop ?? 0.58, 0.22, 0.78);
    const tH = f(H * ht);
    const bH = H - tH - G;
    const vb = _coClamp(splits.vBot ?? 0.5, minFrac, 1 - minFrac);
    const w = f(innerW * vb);
    return [
      { x: 0,     y: 0,      w: W,         h: tH },
      { x: 0,     y: tH + G, w,           h: bH },
      { x: w + G, y: tH + G, w: W - w - G, h: bH },
    ];
  }

  if (n === 4) {
    const vx = _coClamp(splits.vx ?? 0.5, minFrac, 1 - minFrac);
    const hy = _coClamp(splits.hy ?? 0.5, minFrac, 1 - minFrac);
    const w = f(innerW * vx);
    const h = f(innerH * hy);
    return [
      { x: 0,     y: 0,     w,           h },
      { x: w + G, y: 0,     w: W - w - G, h },
      { x: 0,     y: h + G, w,           h: H - h - G },
      { x: w + G, y: h + G, w: W - w - G, h: H - h - G },
    ];
  }

  if (n === 5) {
    const row = _coClamp(splits.row ?? 0.5, 0.22, 0.78);
    const h1 = f(H * row);
    const h2 = H - h1 - G;
    const topV = _coClamp(splits.topV ?? 0.5, minFrac, 1 - minFrac);
    const w2 = f(innerW * topV);
    const b0 = _coClamp(splits.bf0 ?? 1 / 3, minFrac, 1 - 2 * minFrac);
    const b1 = _coClamp(splits.bf1 ?? 1 / 3, minFrac, 1 - b0 - minFrac);
    const w3a = f(innerW3 * b0);
    const w3b = f(innerW3 * b1);
    const w3c = innerW3 - w3a - w3b;
    return [
      { x: 0,            y: 0,      w: w2,           h: h1 },
      { x: w2 + G,       y: 0,      w: W - w2 - G,   h: h1 },
      { x: 0,            y: h1 + G, w: w3a,          h: h2 },
      { x: w3a + G,      y: h1 + G, w: w3b,          h: h2 },
      { x: w3a + G + w3b + G, y: h1 + G, w: w3c,   h: h2 },
    ];
  }

  if (n === 6) {
    const row = _coClamp(splits.row ?? 0.5, minFrac, 1 - minFrac);
    const hTop = f(innerH * row);
    const hBot = H - hTop - G;
    const f0 = _coClamp(splits.f0 ?? 1 / 3, minFrac, 1 - 2 * minFrac);
    const f1 = _coClamp(splits.f1 ?? 1 / 3, minFrac, 1 - f0 - minFrac);
    const w0 = f(innerW3 * f0);
    const w1 = f(innerW3 * f1);
    const w2 = innerW3 - w0 - w1;
    const slots = [];
    for (let c = 0; c < 3; c++) {
      const w = c === 0 ? w0 : c === 1 ? w1 : w2;
      const x = c === 0 ? 0 : c === 1 ? w0 + G : w0 + G + w1 + G;
      slots.push({ x, y: 0, w, h: hTop });
    }
    for (let c = 0; c < 3; c++) {
      const w = c === 0 ? w0 : c === 1 ? w1 : w2;
      const x = c === 0 ? 0 : c === 1 ? w0 + G : w0 + G + w1 + G;
      slots.push({ x, y: hTop + G, w, h: hBot });
    }
    return slots;
  }
  return [];
}

/* ══════════════════════════════════════════
   RENDER
══════════════════════════════════════════ */

/**
 * Divide un texto en líneas que no superen maxWidth (px canvas).
 * maxLines alto = leyenda dinámica con texto largo; tope de seguridad anti-bucle.
 */
function _coWrapText(ctx, text, maxWidth, maxLines = 14) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    if (lines.length >= maxLines) break;
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

/** Altura mínima de leyenda (logo + acento + márgenes) */
function _coMinBannerHeight(format, hasLogo) {
  const isVert = format === 'vertical';
  const LOGO_D = isVert ? 130 : 106;
  const ACCENT = 5;
  const padV   = 36;
  return ACCENT + (hasLogo ? LOGO_D + padV : 56) + 28;
}

/**
 * Calcula altura del banner según texto envuelto (wrap) y logo.
 * Mantiene el tamaño de fuente actual; solo crece el rectángulo de leyenda.
 */
function _coMeasureBannerHeight(text, format, hasLogo, canvasW) {
  const isVert = format === 'vertical';
  const PAD    = 26;
  const LOGO_D = isVert ? 130 : 106;
  const LOGO_R = LOGO_D / 2;
  const logoCX = PAD + LOGO_R;
  const textLeft  = hasLogo ? logoCX + LOGO_R + 26 : PAD;
  const textRight = canvasW - PAD;
  const maxW      = Math.max(80, textRight - textLeft);

  const FONT_SIZE   = isVert ? 60 : 52;
  const LINE_HEIGHT = Math.round(FONT_SIZE * 1.38);
  const ACCENT      = 5;
  const padTextV    = 28;

  const m = document.createElement('canvas').getContext('2d');
  m.font = `700 ${FONT_SIZE}px Arial, sans-serif`;

  let textBlockH = 0;
  if (text && text.trim()) {
    const lines = _coWrapText(m, text.trim(), maxW, 16);
    textBlockH = lines.length * LINE_HEIGHT + padTextV;
  }

  const logoBand = hasLogo ? LOGO_D + 32 : 0;
  const innerNeed = Math.max(logoBand, textBlockH || (hasLogo ? 0 : 44));
  const minB = _coMinBannerHeight(format, hasLogo);
  return Math.max(minB, ACCENT + innerNeed + 20);
}

// Dibuja banner, logo circular (object-fit:cover) y texto con word-wrap
function _coDrawOverlays(ctx, W, H) {
  if (!_coMeta) return;
  const { bannerH, text, format } = _coMeta;
  const bannerY = H - bannerH;
  const isVert  = format === 'vertical';

  // ── Cintillo oscuro ──────────────────────────────────────────────
  ctx.fillStyle = 'rgba(10,18,40,0.87)';
  ctx.fillRect(0, bannerY, W, bannerH);
  // Borde de acento
  ctx.fillStyle = '#1e3a7c';
  ctx.fillRect(0, bannerY, W, 5);

  // ── Logo circular — object-fit: cover (sin bordes blancos) ────────
  const LOGO_D = isVert ? 130 : 106;
  const LOGO_R = LOGO_D / 2;
  const PAD    = 26;
  const logoCX = PAD + LOGO_R;
  const logoCY = bannerY + bannerH / 2;

  if (_coLogoCache) {
    ctx.save();

    // Aro blanco exterior
    ctx.beginPath();
    ctx.arc(logoCX, logoCY, LOGO_R + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();

    // Clip al círculo exacto
    ctx.beginPath();
    ctx.arc(logoCX, logoCY, LOGO_R, 0, Math.PI * 2);
    ctx.clip();

    // object-fit: cover → la imagen llena el círculo completo sin huecos.
    // La dimensión más pequeña de la imagen escala hasta LOGO_D;
    // la más grande desborda y queda recortada por el clip.
    const iA = _coLogoCache.naturalWidth / _coLogoCache.naturalHeight;
    let drawW, drawH;
    if (iA >= 1) {
      // Imagen más ancha que alta → escalar por altura
      drawH = LOGO_D;
      drawW = LOGO_D * iA;
    } else {
      // Imagen más alta que ancha → escalar por anchura
      drawW = LOGO_D;
      drawH = LOGO_D / iA;
    }
    ctx.drawImage(_coLogoCache, logoCX - drawW / 2, logoCY - drawH / 2, drawW, drawH);

    ctx.restore();
  }

  // ── Texto con word-wrap (máx. 3 líneas) ─────────────────────────
  if (text) {
    const textLeft  = _coLogoCache ? logoCX + LOGO_R + 26 : PAD;
    const textRight = W - PAD;
    const maxW      = textRight - textLeft;
    const textCX    = textLeft + maxW / 2;

    const FONT_SIZE   = isVert ? 60 : 52;
    const LINE_HEIGHT = Math.round(FONT_SIZE * 1.38);

    ctx.fillStyle    = '#ffffff';
    ctx.font         = `700 ${FONT_SIZE}px Arial, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Hasta 16 líneas: leyenda crece con el texto; el alto del banner ya se reservó al generar
    const lines   = _coWrapText(ctx, text, maxW, 16);
    const totalH  = lines.length * LINE_HEIGHT;
    // Centrar verticalmente el bloque de texto en el banner
    const startY  = bannerY + (bannerH - totalH) / 2 + LINE_HEIGHT / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, textCX, startY + i * LINE_HEIGHT, maxW);
    });
  }

  // ── Marca de agua discreta ──────────────────────────────────────
  ctx.fillStyle    = 'rgba(255,255,255,0.25)';
  ctx.font         = `500 ${isVert ? 22 : 18}px Arial, sans-serif`;
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('M.E.T.A.S.', W - 16, H - 10);
}

// Redibujo rápido usando imágenes ya cargadas (sin I/O)
function _coRedraw() {
  if (!_coImgCache.length || !_coMeta) return;
  const canvas = document.getElementById('collage-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const { W, H } = _coMeta;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  _coSlots.forEach((s, i) => {
    if (_coImgCache[i]) {
      const { dx, dy } = _coOffsets[i] || { dx: 0, dy: 0 };
      _coCover(ctx, _coImgCache[i], s.x, s.y, s.w, s.h, dx, dy);
    }
  });

  _coDrawOverlays(ctx, W, H);
}

/**
 * Redibujado público (p. ej. tras mover separadores de cuadrícula).
 * Alias pensado para lectura clara desde los gestores de layout.
 */
function redrawCanvas() {
  _coRedraw();
}

/**
 * Construye la lista de separadores visuales (posiciones % sobre el canvas completo).
 */
function _coSeparatorSpecs(n, W, H, bannerH, slots) {
  const G = _coG;
  const pctX = x => (x / W) * 100;
  const pctY = y => (y / H) * 100;
  const ph = H - bannerH;
  const list = [];

  if (n === 2) {
    const gx = slots[0].w + G / 2;
    list.push({ clazz: 'grid-separator-v', key: 'v', leftPct: pctX(gx), topPct: 0, heightPct: (ph / H) * 100 });
  } else if (n === 3) {
    const gy = slots[0].y + slots[0].h + G / 2;
    list.push({ clazz: 'grid-separator-h', key: 'hTop', leftPct: 0, topPct: pctY(gy), widthPct: 100 });
    const gx = slots[1].w + G / 2;
    const y0 = slots[1].y;
    list.push({
      clazz: 'grid-separator-v', key: 'vBot', leftPct: pctX(gx), topPct: pctY(y0), heightPct: (slots[1].h / H) * 100,
    });
  } else if (n === 4) {
    const gx = slots[0].w + G / 2;
    const gy = slots[0].y + slots[0].h + G / 2;
    list.push({ clazz: 'grid-separator-v', key: 'vx', leftPct: pctX(gx), topPct: 0, heightPct: (ph / H) * 100 });
    list.push({ clazz: 'grid-separator-h', key: 'hy', leftPct: 0, topPct: pctY(gy), widthPct: 100 });
  } else if (n === 5) {
    const gy = slots[0].y + slots[0].h + G / 2;
    list.push({ clazz: 'grid-separator-h', key: 'row', leftPct: 0, topPct: pctY(gy), widthPct: 100 });
    const gxt = slots[0].w + G / 2;
    list.push({
      clazz: 'grid-separator-v', key: 'topV', leftPct: pctX(gxt), topPct: pctY(0), heightPct: (slots[0].h / H) * 100,
    });
    const gx1 = slots[2].w + G / 2;
    const yb = slots[2].y;
    list.push({
      clazz: 'grid-separator-v', key: 'bf0', leftPct: pctX(gx1), topPct: pctY(yb), heightPct: (slots[2].h / H) * 100,
    });
    const gx2 = slots[2].x + slots[2].w + G / 2;
    list.push({
      clazz: 'grid-separator-v', key: 'bf1', leftPct: pctX(gx2), topPct: pctY(yb), heightPct: (slots[2].h / H) * 100,
    });
  } else if (n === 6) {
    const gy = slots[0].y + slots[0].h + G / 2;
    list.push({ clazz: 'grid-separator-h', key: 'row', leftPct: 0, topPct: pctY(gy), widthPct: 100 });
    const gx1 = slots[0].w + G / 2;
    const gx2 = slots[0].x + slots[0].w + G + slots[1].w + G / 2;
    list.push({ clazz: 'grid-separator-v', key: 'f0', leftPct: pctX(gx1), topPct: 0, heightPct: (ph / H) * 100 });
    list.push({ clazz: 'grid-separator-v', key: 'f1', leftPct: pctX(gx2), topPct: 0, heightPct: (ph / H) * 100 });
  }
  return list;
}

function _coRebuildGridSeparators() {
  const overlay = document.getElementById('co-grid-overlay');
  if (!overlay || !_coMeta || !_coSlots.length) {
    if (overlay) overlay.innerHTML = '';
    return;
  }
  const n = _coImgCache.length;
  if (n < 2) {
    overlay.innerHTML = '';
    return;
  }
  const { W, H, bannerH } = _coMeta;
  const specs = _coSeparatorSpecs(n, W, H, bannerH, _coSlots);
  overlay.innerHTML = '';
  for (const s of specs) {
    const el = document.createElement('div');
    el.className = s.clazz;
    el.dataset.split = s.key;
    el.style.left = `${s.leftPct}%`;
    el.style.top = `${s.topPct}%`;
    if (s.widthPct != null) el.style.width = `${s.widthPct}%`;
    if (s.heightPct != null) el.style.height = `${s.heightPct}%`;
    overlay.appendChild(el);
  }
}

const _coMinF = 0.08;

/** Actualiza _coSplits según coordenadas de puntero en el canvas (px internos). */
function _coApplySplitDrag(key, canvasX, canvasY) {
  if (!_coMeta || !_coSplits) return;
  const n = _coImgCache.length;
  const W = _coMeta.W;
  const photoH = _coMeta.photoH ?? (_coMeta.H - _coMeta.bannerH);
  const G = _coG;
  const innerW = W - G;
  const innerW3 = W - 2 * G;
  const innerH = photoH - G;

  if (n === 2 && key === 'v') {
    const leftW = _coClamp(canvasX - G / 2, innerW * _coMinF, innerW * (1 - _coMinF));
    _coSplits.v = leftW / innerW;
  } else if (n === 3) {
    if (key === 'hTop') {
      const tH = _coClamp(canvasY - G / 2, photoH * 0.15, photoH * 0.85);
      _coSplits.hTop = tH / photoH;
    } else if (key === 'vBot') {
      const w = _coClamp(canvasX - G / 2, innerW * _coMinF, innerW * (1 - _coMinF));
      _coSplits.vBot = w / innerW;
    }
  } else if (n === 4) {
    if (key === 'vx') {
      const w = _coClamp(canvasX - G / 2, innerW * _coMinF, innerW * (1 - _coMinF));
      _coSplits.vx = w / innerW;
    } else if (key === 'hy') {
      const h = _coClamp(canvasY - G / 2, innerH * _coMinF, innerH * (1 - _coMinF));
      _coSplits.hy = h / innerH;
    }
  } else if (n === 5) {
    if (key === 'row') {
      const h1 = _coClamp(canvasY - G / 2, photoH * 0.15, photoH * 0.85);
      _coSplits.row = h1 / photoH;
    } else if (key === 'topV') {
      const w = _coClamp(canvasX - G / 2, innerW * _coMinF, innerW * (1 - _coMinF));
      _coSplits.topV = w / innerW;
    } else if (key === 'bf0') {
      const w = _coClamp(canvasX - G / 2, innerW3 * _coMinF, innerW3 * (1 - _coSplits.bf1 - _coMinF));
      _coSplits.bf0 = w / innerW3;
    } else if (key === 'bf1') {
      // Fracción de la 2.ª columna respecto a innerW3; el borde derecho acumulado sigue al puntero
      const cum = _coClamp((canvasX - G / 2) / innerW3, (_coSplits.bf0 ?? 1 / 3) + _coMinF, 1 - _coMinF);
      _coSplits.bf1 = cum - (_coSplits.bf0 ?? 1 / 3);
    }
  } else if (n === 6) {
    if (key === 'row') {
      const h = _coClamp(canvasY - G / 2, innerH * _coMinF, innerH * (1 - _coMinF));
      _coSplits.row = h / innerH;
    } else if (key === 'f0') {
      const f0 = _coClamp((canvasX - G / 2) / innerW3, _coMinF, 1 - (_coSplits.f1 ?? 1 / 3) - _coMinF);
      _coSplits.f0 = f0;
    } else if (key === 'f1') {
      const f0 = _coSplits.f0 ?? 1 / 3;
      const cum = _coClamp((canvasX - G / 2) / innerW3, f0 + _coMinF, 1 - _coMinF);
      _coSplits.f1 = cum - f0;
    }
  }

  if (n === 5 && _coSplits.bf0 != null && _coSplits.bf1 != null) {
    _coSplits.bf0 = _coClamp(_coSplits.bf0, _coMinF, 1 - 2 * _coMinF);
    _coSplits.bf1 = _coClamp(_coSplits.bf1, _coMinF, 1 - _coSplits.bf0 - _coMinF);
  }
  if (n === 6 && _coSplits.f0 != null && _coSplits.f1 != null) {
    _coSplits.f0 = _coClamp(_coSplits.f0, _coMinF, 1 - 2 * _coMinF);
    _coSplits.f1 = _coClamp(_coSplits.f1, _coMinF, 1 - _coSplits.f0 - _coMinF);
  }

  _coSlots = _coLayoutWithSplits(n, W, photoH, _coSplits);
  redrawCanvas();
  _coRebuildGridSeparators();
}

/** Convierte cliente → px del bitmap del canvas. */
function _coClientToCanvas(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  return {
    cx: (clientX - rect.left) * sx,
    cy: (clientY - rect.top) * sy,
  };
}

/**
 * Gestión unificada de puntero/táctil sobre #co-grid-overlay (separadores).
 * No interfiere con el pan de fotos en el canvas (el overlay captura solo los handles).
 */
function _coInitGridOverlay() {
  const overlay = document.getElementById('co-grid-overlay');
  const canvas = document.getElementById('collage-canvas');
  if (!overlay || !canvas || overlay._coSepInit) return;
  overlay._coSepInit = true;

  const onMove = e => {
    if (!_coSepDrag) return;
    const { cx, cy } = _coClientToCanvas(canvas, e.clientX, e.clientY);
    _coApplySplitDrag(_coSepDrag.key, cx, cy);
    e.preventDefault();
  };

  const onUp = e => {
    if (!_coSepDrag) return;
    const pid = _coSepDrag.pointerId;
    overlay.querySelectorAll('.is-dragging').forEach(el => el.classList.remove('is-dragging'));
    _coSepDrag = null;
    try { overlay.releasePointerCapture(pid); } catch (_) {}
    overlay.removeEventListener('pointermove', onMove);
    overlay.removeEventListener('pointerup', onUp);
    overlay.removeEventListener('pointercancel', onUp);
  };

  overlay.addEventListener('pointerdown', e => {
    const handle = e.target.closest('.grid-separator-v, .grid-separator-h');
    if (!handle || !handle.dataset.split) return;
    if (!_coMeta || !_coSplits) return;

    handle.classList.add('is-dragging');
    _coSepDrag = { key: handle.dataset.split, pointerId: e.pointerId };
    overlay.setPointerCapture(e.pointerId);
    // Con pointer capture los movimientos llegan al overlay, no a window
    overlay.addEventListener('pointermove', onMove, { passive: false });
    overlay.addEventListener('pointerup', onUp);
    overlay.addEventListener('pointercancel', onUp);

    e.preventDefault();
    e.stopPropagation();
  });
}

/* ══════════════════════════════════════════
   DRAG-TO-PAN
══════════════════════════════════════════ */

function _coInitDrag(canvas) {

  // ─ Identificar slot bajo un punto (en coords canvas) ─
  const slotAt = (cx, cy) =>
    _coSlots.findIndex(s =>
      cx >= s.x && cx <= s.x + s.w &&
      cy >= s.y && cy <= s.y + s.h
    );

  // ─ Convertir coords del evento a coords del canvas interno ─
  const toCanvas = e => {
    const rect  = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;   // px-canvas por px-pantalla
    return {
      cx: (e.clientX - rect.left) * scale,
      cy: (e.clientY - rect.top)  * scale,
    };
  };

  canvas.addEventListener('pointerdown', e => {
    const { cx, cy } = toCanvas(e);
    const idx = slotAt(cx, cy);
    if (idx === -1) return;

    canvas.setPointerCapture(e.pointerId);
    _coDragging = {
      idx,
      startX:  e.clientX,
      startY:  e.clientY,
      startDx: (_coOffsets[idx] || { dx: 0 }).dx,
      startDy: (_coOffsets[idx] || { dy: 0 }).dy,
    };
    canvas.style.cursor = 'grabbing';
    e.preventDefault();
  });

  canvas.addEventListener('pointermove', e => {
    if (!_coDragging) {
      // Cambiar cursor según posición
      const { cx, cy } = toCanvas(e);
      canvas.style.cursor = slotAt(cx, cy) !== -1 ? 'grab' : 'default';
      return;
    }

    e.preventDefault();

    const rect   = canvas.getBoundingClientRect();
    const scale  = canvas.width / rect.width;
    const ddx    = (e.clientX - _coDragging.startX) * scale;
    const ddy    = (e.clientY - _coDragging.startY) * scale;

    _coOffsets[_coDragging.idx] = {
      dx: _coDragging.startDx + ddx,
      dy: _coDragging.startDy + ddy,
    };

    _coRedraw();
  }, { passive: false });

  const stopDrag = () => {
    if (!_coDragging) return;
    _coDragging = null;
    canvas.style.cursor = 'grab';
  };

  canvas.addEventListener('pointerup',     stopDrag);
  canvas.addEventListener('pointercancel', stopDrag);
}

/* ══════════════════════════════════════════
   GENERAR (entrada principal)
══════════════════════════════════════════ */

async function coGenerate() {
  if (!_coPhotos.length) { toast('Selecciona al menos 1 fotografía'); return; }

  const btn = document.getElementById('co-generate-btn');
  if (btn) {
    btn.disabled    = true;
    btn.innerHTML   = '<i class="fa-solid fa-spinner fa-spin"></i> Generando…';
  }

  try {
    const format   = document.querySelector('input[name="co-format"]:checked')?.value || 'square';
    const text     = (document.getElementById('co-text')?.value || '').trim();
    const canvas = document.getElementById('collage-canvas');

    const CW = 1080;
    const CH = format === 'vertical' ? 1920 : 1080;

    canvas.width  = CW;
    canvas.height = CH;

    // Cargar imágenes primero (logo afecta ancho útil del texto y altura mínima del banner)
    const photoImgs = await Promise.all(_coPhotos.slice(0, 6).map(_coLoadImg));
    const logoImg   = _coLogoFile
      ? await _coLoadImg(_coLogoFile).catch(() => null)
      : null;

    _coImgCache  = photoImgs;
    _coLogoCache = logoImg;

    const n = photoImgs.length;
    // Leyenda: medir wrap con la fuente final y reservar alto; el área de fotos se reduce acorde
    const bannerH = _coMeasureBannerHeight(text, format, !!logoImg, CW);
    const photoH  = CH - bannerH;

    _coSplits   = _coCloneSplits(n);
    _coSlots    = _coLayoutWithSplits(n, CW, photoH, _coSplits);
    _coOffsets   = photoImgs.map(() => ({ dx: 0, dy: 0 }));
    _coMeta      = { W: CW, H: CH, bannerH, photoH, text, format };

    // Primer render + handles de cuadrícula encima del canvas
    _coRedraw();
    _coRebuildGridSeparators();

    // Registrar drag de fotos (solo una vez por canvas)
    if (!canvas._coDragReady) {
      _coInitDrag(canvas);
      canvas._coDragReady = true;
    }
    canvas.style.cursor = 'grab';

    _coInitGridOverlay();

    // Mostrar sección de vista previa (canvas + overlay + botón descarga permanecen visibles)
    const wrap = document.getElementById('co-preview-wrap');
    if (wrap) {
      wrap.style.display = '';
      wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    toast('Arrastra cada foto para encuadre; usa las rayas para el tamaño de las celdas 📐');

  } catch (err) {
    toast('Error al procesar imágenes. Intenta de nuevo.');
    console.error('[Collage]', err);
  } finally {
    if (btn) {
      btn.disabled  = false;
      btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generar Collage';
    }
  }
}

/* ══════════════════════════════════════════
   MINIATURAS
══════════════════════════════════════════ */

function _coRenderThumbs() {
  const grid  = document.getElementById('co-photos-thumbs');
  const count = document.getElementById('co-photo-count');
  if (!grid) return;
  if (count) count.textContent = `${_coPhotos.length} / 6`;

  // Liberar Object URLs previas
  grid.querySelectorAll('img[data-obj]').forEach(img => URL.revokeObjectURL(img.dataset.obj));
  grid.innerHTML = '';

  _coPhotos.forEach((file, i) => {
    const url  = URL.createObjectURL(file);
    const item = document.createElement('div');
    item.className = 'co-thumb';
    item.innerHTML = `
      <img src="${url}" data-obj="${url}" alt="Foto ${i + 1}">
      <button class="co-thumb-remove" aria-label="Quitar foto ${i + 1}">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <span class="co-thumb-num">${i + 1}</span>`;

    item.querySelector('.co-thumb-remove').addEventListener('click', () => {
      URL.revokeObjectURL(url);
      _coPhotos.splice(i, 1);
      _coRenderThumbs();
      // Invalidar cache y ocultar preview
      _coImgCache = []; _coSlots = []; _coOffsets = []; _coMeta = null;
      _coSplits = null;
      const ov = document.getElementById('co-grid-overlay');
      if (ov) ov.innerHTML = '';
      const wrap = document.getElementById('co-preview-wrap');
      if (wrap) wrap.style.display = 'none';
    });

    grid.appendChild(item);
  });
}

/* ══════════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navegación ──────────────────────────
  document.getElementById('goto-collage-btn')
    ?.addEventListener('click', () => switchView('view-collage'));
  document.getElementById('collage-back-btn')
    ?.addEventListener('click', () => switchView('view-perfil'));

  // ── Logo ────────────────────────────────
  document.getElementById('co-logo-input')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    _coLogoFile = file;
    const url  = URL.createObjectURL(file);
    const img  = document.getElementById('co-logo-img');
    const prev = document.getElementById('co-logo-preview');
    if (img)  img.src = url;
    if (prev) prev.style.display = '';
  });

  document.getElementById('co-logo-remove')?.addEventListener('click', () => {
    _coLogoFile = null;
    const el = id => document.getElementById(id);
    if (el('co-logo-img'))   el('co-logo-img').src = '';
    if (el('co-logo-preview')) el('co-logo-preview').style.display = 'none';
    if (el('co-logo-input')) el('co-logo-input').value = '';
  });

  // ── Fotos ────────────────────────────────
  document.getElementById('co-photos-input')?.addEventListener('change', e => {
    const files = Array.from(e.target.files);
    const spare = 6 - _coPhotos.length;
    if (spare <= 0) { toast('Ya tienes 6 fotos. Elimina alguna para agregar más.'); return; }
    if (files.length > spare) toast(`Solo se añaden ${spare} foto(s) (límite 6)`);
    _coPhotos.push(...files.slice(0, spare));
    e.target.value = ''; // permite re-seleccionar los mismos archivos
    _coRenderThumbs();
    // Ocultar preview anterior al cambiar el set de fotos
    _coImgCache = []; _coSlots = []; _coOffsets = []; _coMeta = null;
    _coSplits = null;
    const ov = document.getElementById('co-grid-overlay');
    if (ov) ov.innerHTML = '';
    const wrap = document.getElementById('co-preview-wrap');
    if (wrap) wrap.style.display = 'none';
  });

  // ── Generar ──────────────────────────────
  document.getElementById('co-generate-btn')
    ?.addEventListener('click', coGenerate);

  // ── Descargar / Compartir ────────────────────────────────────────
  document.getElementById('co-download-btn')?.addEventListener('click', async () => {
    const canvas = document.getElementById('collage-canvas');
    if (!canvas || !_coMeta) { toast('Genera el collage primero'); return; }

    const btn = document.getElementById('co-download-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando…'; }

    let dataUrl = '';
    try {
      // 1. Obtener la imagen
      dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      // Detectar si estamos en un dispositivo móvil con Capacitor
      const cap = window.Capacitor;
      if (cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins?.Filesystem && cap.Plugins?.Share) {
        // 2. Extraer solo la data base64 (sin el encabezado data:image/jpeg;base64,)
        const base64Data = dataUrl.split(',')[1];
        const fileName   = 'evidencia-' + Date.now() + '.jpg';

        // 3. Escribir el archivo en la caché del dispositivo
        const result = await cap.Plugins.Filesystem.writeFile({
          path:      fileName,
          data:      base64Data,
          directory: 'CACHE',
        });

        // 4. Compartir el archivo físico con su URI real
        await cap.Plugins.Share.share({
          url:         result.uri,
          dialogTitle: 'Guardar/Compartir Collage',
        });
      } else {
        throw new Error('Capacitor no disponible, usando fallback web');
      }
    } catch (e) {
      console.warn('[Collage] Usando fallback web:', e);
      // Fallback para PC (Chrome / Edge) o cuando Capacitor no está presente
      if (!dataUrl) dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const a  = document.createElement('a');
      a.href   = dataUrl;
      a.download = 'evidencia-metas.jpg';
      a.click();
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-download"></i> Descargar / Guardar Imagen'; }
    }
  });

  _coInitGridOverlay();
});

window.initCollage = initCollage;
