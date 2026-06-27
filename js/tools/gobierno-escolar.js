/* ─────────────────────────────────────────────
   GOBIERNO ESCOLAR 2026 LOGIC
───────────────────────────────────────────── */

const KEY_GE = 'meta_ge_v2';

/* Estado en memoria — no depende de localStorage para la UI */
let _GE = {
  mode: 'config',
  p1: { planilla: '', name: '', img: '', votes: 0 },
  p2: { planilla: '', name: '', img: '', votes: 0 },
  usedCodes: []
};
let _geCurrentCode = null;

function geLoadFromStorage() {
  try {
    const raw = localStorage.getItem(KEY_GE);
    if (raw) _GE = JSON.parse(raw);
  } catch (_) {}
  if (!_GE.usedCodes) _GE.usedCodes = [];
  if (!_GE.p1) _GE.p1 = { planilla: '', name: '', img: '', votes: 0 };
  if (!_GE.p2) _GE.p2 = { planilla: '', name: '', img: '', votes: 0 };
}

function geSave() {
  try { localStorage.setItem(KEY_GE, JSON.stringify(_GE)); } catch (_) {}
}

/* Mostrar un panel y ocultar los demás */
function geShowPanel(panelId) {
  ['ge-config-view','ge-code-view','ge-voting-view','ge-results-view'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === panelId) {
      el.removeAttribute('hidden');
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
}

function geVal(id) {
  return (document.getElementById(id) || {}).value || '';
}

function handleImageUpload(e, previewId) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const b64 = ev.target.result;
    // Miniatura junto al botón
    const thumb = document.getElementById(previewId);
    if (thumb) { thumb.src = b64; thumb.style.display = ''; thumb._b64 = b64; }
    // Vista previa grande
    const num = previewId === 'ge-preview-1' ? '1' : '2';
    const bigImg  = document.getElementById('ge-big-preview-' + num);
    const bigCard = document.getElementById('ge-prev-' + num);
    if (bigImg)  bigImg.src = b64;
    if (bigCard) bigCard.style.display = '';
    // Nombre en la vista previa (planilla o candidato)
    const nameEl = document.getElementById('ge-big-name-' + num);
    if (nameEl) {
      const label = (document.getElementById('ge-planilla-' + num) || {}).value
                 || (document.getElementById('ge-name-' + num)     || {}).value
                 || ('Planilla ' + num);
      nameEl.textContent = label;
    }
    // Mostrar sección previa
    const section = document.getElementById('ge-preview-section');
    if (section) section.style.display = '';
  };
  reader.readAsDataURL(file);
}

/* Llamada desde switchView() */
function renderGobiernoEscolar() {
  geLoadFromStorage();
  if (_GE.mode === 'config') {
    geShowPanel('ge-config-view');
    const el = id => document.getElementById(id);
    if (el('ge-planilla-1')) el('ge-planilla-1').value = _GE.p1.planilla || '';
    if (el('ge-planilla-2')) el('ge-planilla-2').value = _GE.p2.planilla || '';
    if (el('ge-name-1'))     el('ge-name-1').value     = _GE.p1.name || '';
    if (el('ge-name-2'))     el('ge-name-2').value     = _GE.p2.name || '';
    const p1 = el('ge-preview-1'), p2 = el('ge-preview-2');
    if (_GE.p1.img && p1) { p1.src = _GE.p1.img; p1.style.display = ''; p1._b64 = _GE.p1.img; }
    if (_GE.p2.img && p2) { p2.src = _GE.p2.img; p2.style.display = ''; p2._b64 = _GE.p2.img; }

  } else if (_GE.mode === 'voting') {
    _geCurrentCode = null;
    geShowPanel('ge-code-view');
    const ci = document.getElementById('ge-code-input');
    const ce = document.getElementById('ge-code-error');
    if (ci) ci.value = '';
    if (ce) ce.style.display = 'none';

  } else if (_GE.mode === 'results') {
    geShowPanel('ge-results-view');
    const n1 = _GE.p1.planilla || _GE.p1.name || 'Planilla 1';
    const n2 = _GE.p2.planilla || _GE.p2.name || 'Planilla 2';
    const el = id => document.getElementById(id);
    if (el('ge-res-name-1'))  el('ge-res-name-1').textContent  = n1;
    if (el('ge-res-votes-1')) el('ge-res-votes-1').textContent = _GE.p1.votes + ' votos (esta urna)';
    if (el('ge-res-name-2'))  el('ge-res-name-2').textContent  = n2;
    if (el('ge-res-votes-2')) el('ge-res-votes-2').textContent = _GE.p2.votes + ' votos (esta urna)';
    if (el('ge-total-label-1')) el('ge-total-label-1').textContent = 'Total ' + n1;
    if (el('ge-total-label-2')) el('ge-total-label-2').textContent = 'Total ' + n2;
    if (el('ge-urna-lbl-p1'))   el('ge-urna-lbl-p1').textContent  = n1.substring(0, 10);
    if (el('ge-urna-lbl-p2'))   el('ge-urna-lbl-p2').textContent  = n2.substring(0, 10);
    calcTotalGE();
  }
}

function calcTotalGE() {
  const v = id => parseInt((document.getElementById(id) || {}).value) || 0;
  const t1 = _GE.p1.votes + v('ge-u2-p1') + v('ge-u3-p1') + v('ge-u4-p1');
  const t2 = _GE.p2.votes + v('ge-u2-p2') + v('ge-u3-p2') + v('ge-u4-p2');
  const el = id => document.getElementById(id);
  if (el('ge-total-1')) el('ge-total-1').textContent = t1;
  if (el('ge-total-2')) el('ge-total-2').textContent = t2;
  const wrap = el('ge-winner-wrap');
  if (wrap) {
    const n1 = _GE.p1.planilla || _GE.p1.name || 'Planilla 1';
    const n2 = _GE.p2.planilla || _GE.p2.name || 'Planilla 2';
    if (t1 + t2 > 0) {
      const msg = t1 > t2 ? `🏆 Ganador: <strong>${n1}</strong>`
                : t2 > t1 ? `🏆 Ganador: <strong>${n2}</strong>`
                : '🤝 Empate técnico';
      wrap.innerHTML = `<div class="ge-winner">${msg}</div>`;
    } else {
      wrap.innerHTML = '';
    }
  }
  const vc = el('ge-votes-count');
  if (vc) vc.textContent = `Estudiantes que votaron: ${_GE.usedCodes.length}  ·  Votos contados: ${t1 + t2}`;
}

function geValidateCode(raw) {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false, msg: 'Escribe tu código de votación.' };
  // Formato: [1-6][A|B][1-99]  ej: 4B26
  if (!/^[1-6][AB]\d{1,2}$/.test(code))
    return { ok: false, msg: 'Código inválido. Formato: Grado(1-6) + Sección(A/B) + NºLista(1-99). Ej: 4B26' };
  const lista = parseInt(code.slice(2));
  if (lista < 1 || lista > 99)
    return { ok: false, msg: 'El número de lista debe estar entre 1 y 99.' };
  if (_GE.usedCodes.includes(code))
    return { ok: false, msg: '⚠️ Código ya usado. Cada estudiante solo vota una vez.' };
  return { ok: true, code };
}

function geShowBallot(code) {
  _geCurrentCode = code;
  const n1 = _GE.p1.planilla || _GE.p1.name || 'Planilla 1';
  const n2 = _GE.p2.planilla || _GE.p2.name || 'Planilla 2';
  const el = id => document.getElementById(id);

  const voterEl = el('ge-ballot-voter-code');
  if (voterEl) { voterEl.textContent = `Votante: ${code}`; voterEl.style.display = 'block'; }

  const img1 = el('ge-vote-img-1'), em1 = el('ge-vote-emoji-1');
  const img2 = el('ge-vote-img-2'), em2 = el('ge-vote-emoji-2');

  if (_GE.p1.img) {
    if (img1) { img1.src = _GE.p1.img; img1.style.display = 'block'; }
    if (em1) em1.style.display = 'none';
  } else {
    if (img1) img1.style.display = 'none';
    if (em1) em1.style.display = '';
  }
  if (_GE.p2.img) {
    if (img2) { img2.src = _GE.p2.img; img2.style.display = 'block'; }
    if (em2) em2.style.display = 'none';
  } else {
    if (img2) img2.style.display = 'none';
    if (em2) em2.style.display = '';
  }

  if (el('ge-vote-planilla-1')) el('ge-vote-planilla-1').textContent = n1;
  if (el('ge-vote-planilla-2')) el('ge-vote-planilla-2').textContent = n2;
  if (el('ge-vote-name-1'))     el('ge-vote-name-1').textContent     = _GE.p1.name || '';
  if (el('ge-vote-name-2'))     el('ge-vote-name-2').textContent     = _GE.p2.name || '';

  const fb = el('ge-vote-feedback');
  if (fb) fb.style.display = 'none';

  geShowPanel('ge-voting-view');
}

function geRecordVote(planilla) {
  if (!_geCurrentCode) return;
  if (planilla === 1) _GE.p1.votes++; else _GE.p2.votes++;
  _GE.usedCodes.push(_geCurrentCode);
  geSave();
  _geCurrentCode = null;

  const fb = document.getElementById('ge-vote-feedback');
  if (fb) { fb.style.display = 'block'; }

  setTimeout(() => {
    if (fb) fb.style.display = 'none';
    const ci = document.getElementById('ge-code-input');
    const ce = document.getElementById('ge-code-error');
    if (ci) { ci.value = ''; try { ci.focus(); } catch(_){} }
    if (ce) ce.style.display = 'none';
    geShowPanel('ge-code-view');
  }, 2200);
}

document.addEventListener('DOMContentLoaded', () => {

  // Navegación
  document.getElementById('goto-gobierno-btn')?.addEventListener('click', () => {
    switchView('view-gobierno');
  });
  document.getElementById('gobierno-back-btn')?.addEventListener('click', () => {
    switchView('view-perfil');
  });

  document.getElementById('ge-img-1')?.addEventListener('change', e => handleImageUpload(e, 'ge-preview-1'));
  document.getElementById('ge-img-2')?.addEventListener('change', e => handleImageUpload(e, 'ge-preview-2'));

  /* ── GUARDAR Y HABILITAR URNA ── */
  const saveBtn = document.getElementById('ge-save-config-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const raw1  = geVal('ge-planilla-1');
      const raw2  = geVal('ge-planilla-2');
      const cand1 = geVal('ge-name-1');
      const cand2 = geVal('ge-name-2');
      _GE.p1.planilla = raw1 || cand1 || 'Planilla 1';
      _GE.p2.planilla = raw2 || cand2 || 'Planilla 2';
      _GE.p1.name     = cand1;
      _GE.p2.name     = cand2;
      _GE.p1.votes    = 0;
      _GE.p2.votes    = 0;
      _GE.usedCodes   = [];
      _GE.mode        = 'voting';
      const p1img = document.getElementById('ge-preview-1');
      const p2img = document.getElementById('ge-preview-2');
      if (p1img && p1img._b64) _GE.p1.img = p1img._b64;
      if (p2img && p2img._b64) _GE.p2.img = p2img._b64;
      geSave();
      /* Transición directa al panel de código */
      _geCurrentCode = null;
      const ci = document.getElementById('ge-code-input');
      const ce = document.getElementById('ge-code-error');
      if (ci) ci.value = '';
      if (ce) ce.style.display = 'none';
      geShowPanel('ge-code-view');
      toast('✅ ¡Urna habilitada! Ingresa el código para votar.');
    });
  }

  /* ── VALIDAR CÓDIGO ── */
  const validateBtn = document.getElementById('ge-validate-code-btn');
  if (validateBtn) {
    validateBtn.addEventListener('click', () => {
      const input   = document.getElementById('ge-code-input');
      const errorEl = document.getElementById('ge-code-error');
      const result  = geValidateCode(input ? input.value : '');
      if (result.ok) {
        if (errorEl) errorEl.style.display = 'none';
        geShowBallot(result.code);
      } else {
        if (errorEl) { errorEl.textContent = result.msg; errorEl.style.display = 'block'; }
        else toast(result.msg);
      }
    });
  }

  document.getElementById('ge-code-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('ge-validate-code-btn')?.click();
  });

  /* ── FINALIZAR VOTACIÓN (secretario) ── */
  document.getElementById('ge-end-voting-btn')?.addEventListener('click', () => {
    const pin = prompt('PIN del secretario de mesa para cerrar la urna (por defecto: 1234):');
    if (pin === '1234') {
      _GE.mode = 'results';
      geSave();
      renderGobiernoEscolar();
    } else if (pin !== null) {
      toast('PIN incorrecto');
    }
  });

  /* ── VOTAR ── */
  document.getElementById('ge-vote-1')?.addEventListener('click', () => geRecordVote(1));
  document.getElementById('ge-vote-2')?.addEventListener('click', () => geRecordVote(2));

  /* ── REINICIAR ── */
  document.getElementById('ge-reset-btn')?.addEventListener('click', () => {
    if (confirm('¿Reiniciar la elección? Se borrarán todos los votos y la configuración.')) {
      localStorage.removeItem(KEY_GE);
      _GE = { mode: 'config', p1: { planilla:'', name:'', img:'', votes:0 }, p2: { planilla:'', name:'', img:'', votes:0 }, usedCodes:[] };
      renderGobiernoEscolar();
      toast('Elección reiniciada');
    }
  });

  /* ── SUMAR URNAS ── */
  ['ge-u2-p1','ge-u2-p2','ge-u3-p1','ge-u3-p2','ge-u4-p1','ge-u4-p2'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', calcTotalGE);
  });
});
