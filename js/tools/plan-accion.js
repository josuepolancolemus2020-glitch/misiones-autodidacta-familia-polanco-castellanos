/* ─────────────────────────────────────────────
   PLAN DE ACCIÓN — ANÁLISIS DE CALIFICACIONES
───────────────────────────────────────────── */

const PA_CATS = [
  { key:'avanzado',       label:'Avanzado',       min:95,  max:100, color:'#16a34a', bg:'#dcfce7' },
  { key:'muyBueno',       label:'Muy Bueno',      min:80,  max:94,  color:'#0891b2', bg:'#cffafe' },
  { key:'satisfactorio',  label:'Satisfactorio',  min:70,  max:79,  color:'#a16207', bg:'#fef9c3' },
  { key:'debeMejorar',    label:'Debe Mejorar',   min:60,  max:69,  color:'#ea580c', bg:'#ffedd5' },
  { key:'insatisfactorio',label:'Insatisfactorio',min:0,   max:59,  color:'#dc2626', bg:'#fee2e2' },
];
const PA_SUGS = {
  avanzado:       'Excelente comprensión. Retarlos con ejercicios de nivel superior y tutorías entre pares.',
  muyBueno:       'Dominan el tema teóricamente. Proporcionarles actividades de aplicación práctica.',
  satisfactorio:  'Comprensión básica. Usar recursos visuales y reglas mnemotécnicas para afianzar.',
  debeMejorar:    'Confunden conceptos. Actividades lúdicas y trabajo con pares más avanzados.',
  insatisfactorio:'ALERTA: Atención inmediata. Regresar a conceptos fundamentales con material simplificado.',
};

let _paInitDone = false;
let _paStudents = [];

function paGradeColors(g) {
  if (typeof g !== 'number') return { bg:'#e5e7eb', txt:'#374151' };
  if (g >= 95) return { bg:'#22c55e', txt:'#fff' };
  if (g >= 80) return { bg:'#22d3ee', txt:'#000' };
  if (g >= 70) return { bg:'#fef08a', txt:'#000' };
  if (g >= 60) return { bg:'#f97316', txt:'#fff' };
  return { bg:'#ef4444', txt:'#fff' };
}

function paAddRow(num, name = '', grade = '') {
  const list = document.getElementById('pa-students-list');
  if (!list) return;
  const row = document.createElement('div');
  row.className = 'pa-student-row';
  row.innerHTML = `
    <span class="pa-row-num">${num}</span>
    <input type="text" class="pa-inp-field pa-inp-name" placeholder="Nombre…" value="${name}">
    <input type="text" class="pa-inp-grade-cell" placeholder="0-100 / NSP" value="${grade}" maxlength="3">
    <button class="pa-del-row" title="Eliminar"><i class="fa-solid fa-xmark"></i></button>`;
  row.querySelector('.pa-del-row').addEventListener('click', () => {
    row.remove();
    document.querySelectorAll('.pa-student-row').forEach((r, i) => {
      const n = r.querySelector('.pa-row-num'); if (n) n.textContent = i + 1;
    });
  });
  list.appendChild(row);
}

function paCollect() {
  return Array.from(document.querySelectorAll('.pa-student-row')).map((row, i) => {
    const name  = row.querySelector('.pa-inp-name')?.value.trim() || `#${i + 1}`;
    const raw   = row.querySelector('.pa-inp-grade-cell')?.value.trim().toUpperCase() || '';
    const grade = raw === 'NSP' ? 'NSP' : (raw === '' ? null : (parseFloat(raw) || 0));
    return { id: i + 1, name, grade };
  }).filter(s => s.grade !== null);
}

function paGenerate() {
  const students = paCollect();
  if (!students.length) { toast('Agrega al menos un estudiante con nombre'); return; }
  _paStudents = students;

  const numeric   = students.filter(s => typeof s.grade === 'number');
  const nsp       = students.filter(s => s.grade === 'NSP');
  const total     = students.length;
  const avg       = numeric.length ? (numeric.reduce((a, s) => a + s.grade, 0) / numeric.length) : 0;
  const passing   = numeric.filter(s => s.grade >= 70).length;
  const pRate     = numeric.length ? Math.round((passing / numeric.length) * 100) : 0;
  const toRecover = numeric.filter(s => s.grade <= 65);

  const cats = {};
  PA_CATS.forEach(c => { cats[c.key] = numeric.filter(s => s.grade >= c.min && s.grade <= c.max).length; });
  const maxCat = Math.max(...Object.values(cats), 1);

  const grado     = document.getElementById('pa-grado')?.value    || '—';
  const seccion   = document.getElementById('pa-seccion')?.value  || '—';
  const docente   = document.getElementById('pa-docente')?.value  || '—';
  const evaluacion= document.getElementById('pa-evaluacion')?.value || 'Evaluación';

  const avgColor = avg >= 70 ? '#16a34a' : avg >= 60 ? '#d97706' : '#dc2626';

  const dash = document.getElementById('pa-dashboard');
  if (!dash) return;

  // Grade grid — 3 columns of 15 students each
  const ngSlices = [students.slice(0, 15), students.slice(15, 30), students.slice(30, 45)];
  const ngGridHtml = ngSlices.filter(s => s.length > 0).map(slice => {
    const rows = slice.map(s => {
      const c = paGradeColors(s.grade);
      return `<div class="pa-ng-row"><span class="pa-ng-num">#${s.id}</span><span class="pa-ng-chip" style="background:${c.bg};color:${c.txt}">${s.grade}</span></div>`;
    }).join('');
    return `<div class="pa-ng-col">${rows}</div>`;
  }).join('');

  dash.innerHTML = `
    <div class="pa-dash-head">
      <div>
        <div class="pa-dash-title">ANÁLISIS Y PLAN DE ACCIÓN</div>
        <div class="pa-dash-sub">📌 ${evaluacion}</div>
      </div>
      <div class="pa-dash-meta">
        <span><b>Grado:</b> ${grado}</span>
        <span><b>Sección:</b> ${seccion}</span>
        <span><b>Docente:</b> ${docente}</span>
      </div>
    </div>

    <div class="pa-tabs-out">
      <button class="pa-otab pa-otab-active" data-otab="overview">📊 Dashboard</button>
      <button class="pa-otab" data-otab="planilla">📋 Planilla</button>
    </div>

    <div id="pa-out-overview">
      <div class="pa-stats-grid">
        <div class="pa-stat-card"><div class="pa-stat-ic" style="background:#3b82f6">👥</div><div class="pa-stat-info"><div class="pa-stat-lbl">En Lista</div><div class="pa-stat-val">${total}</div></div></div>
        <div class="pa-stat-card"><div class="pa-stat-ic" style="background:#8b5cf6">📈</div><div class="pa-stat-info"><div class="pa-stat-lbl">Promedio</div><div class="pa-stat-val" style="color:${avgColor}">${avg.toFixed(1)}</div></div></div>
        <div class="pa-stat-card"><div class="pa-stat-ic" style="background:#22c55e">🏆</div><div class="pa-stat-info"><div class="pa-stat-lbl">Aprobación</div><div class="pa-stat-val">${pRate}%</div><div class="pa-stat-sub">≥ 70%</div></div></div>
        <div class="pa-stat-card"><div class="pa-stat-ic" style="background:#ef4444">⚠️</div><div class="pa-stat-info"><div class="pa-stat-lbl">Recuperación</div><div class="pa-stat-val">${toRecover.length}</div><div class="pa-stat-sub">nota ≤ 65</div></div></div>
      </div>

      <div class="pa-two-col">
        <div class="pa-card">
          <div class="pa-card-title">📊 Distribución</div>
          ${PA_CATS.map(c => `
            <div class="pa-dist-row">
              <div class="pa-dist-info"><span class="pa-dist-lbl">${c.label}</span><span class="pa-dist-cnt">${cats[c.key]}</span></div>
              <div class="pa-dist-track"><div class="pa-dist-fill" style="width:${Math.round((cats[c.key]/maxCat)*100)}%;background:${c.color}"></div></div>
            </div>`).join('')}
        </div>
        <div class="pa-card">
          <div class="pa-card-title">💡 Sugerencias</div>
          ${PA_CATS.filter(c => cats[c.key] > 0).map(c => `
            <div class="pa-sug-item" style="border-left:4px solid ${c.color};background:${c.bg}">
              <div class="pa-sug-head"><span class="pa-sug-title" style="color:${c.color}">${c.label}</span><span class="pa-sug-cnt">${cats[c.key]}</span></div>
              <p class="pa-sug-text">${PA_SUGS[c.key]}</p>
            </div>`).join('')}
        </div>
      </div>

      <div class="pa-card pa-plan-card">
        <div class="pa-card-title">📅 Plan de Acción — Recuperación y NSP</div>
        <div class="pa-plan-grid">
          <div>
            <div class="pa-plan-sub">⚠️ Lista de Recuperación (${toRecover.length} alumnos)</div>
            <p class="pa-plan-note">Irán a recuperación una semana después de la entrega del primer examen.</p>
            <ul class="pa-recup-list">
              ${toRecover.length ? toRecover.map(s => `
                <li class="pa-recup-item">
                  <span class="pa-recup-name">#${s.id} ${s.name}</span>
                  <span class="pa-grade-chip" style="background:${s.grade<=55?'#ef4444':'#f97316'};color:#fff">${s.grade}</span>
                </li>`).join('') : '<li class="pa-empty-msg">Sin alumnos a recuperación ✅</li>'}
            </ul>
          </div>
          <div>
            <div class="pa-plan-sub">📋 Prueba Pendiente — NSP (${nsp.length})</div>
            <p class="pa-plan-note">Harán la prueba el mismo día que los alumnos en recuperación.</p>
            <ul class="pa-recup-list">
              ${nsp.length ? nsp.map(s => `
                <li class="pa-recup-item">
                  <span class="pa-recup-name">#${s.id} ${s.name}</span>
                  <span class="pa-grade-chip" style="background:#d1d5db;color:#374151">NSP</span>
                </li>`).join('') : '<li class="pa-empty-msg">Sin alumnos NSP ✅</li>'}
            </ul>
          </div>
        </div>
      </div>

      <div class="pa-card pa-ng-card" id="pa-ng-capture">
        <div class="pa-ng-titulo">${evaluacion}</div>
        <div class="pa-card-title">📋 Calificaciones según número de Lista</div>
        <div class="pa-ng-grid">${ngGridHtml}</div>
        <div class="pa-ng-msg">"La excelencia es la consecuencia natural de una sola causa: la disciplina. Disciplina para estudiar cada día, cumplir cada tarea y <strong>usar el teléfono exclusivamente como herramienta de aprendizaje</strong>. Quien lo practique alcanzará la calificación más alta."</div>
        <div class="pa-ng-actions">
          <button onclick="paCaptureGrilla()" class="pa-ng-capture-btn"><i class="fa-solid fa-camera"></i> Capturar / Compartir</button>
        </div>
      </div>
    </div>

    <div id="pa-out-planilla" style="display:none;">
      <div class="pa-card" style="padding:0;overflow:hidden;">
        <table class="pa-table">
          <thead><tr><th>#</th><th>Nombre</th><th>${evaluacion}</th></tr></thead>
          <tbody>
            ${students.map(s => {
              const c = paGradeColors(s.grade);
              return `<tr><td class="pa-td-n">${s.id}</td><td class="pa-td-name">${s.name}</td><td class="pa-td-g" style="background:${c.bg};color:${c.txt}">${s.grade ?? '—'}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <button onclick="paPrint()" class="pa-print-btn">
      <i class="fa-solid fa-print"></i> Imprimir / Guardar PDF
    </button>`;

  // Tab switching
  dash.querySelectorAll('.pa-otab').forEach(tab => {
    tab.addEventListener('click', () => {
      dash.querySelectorAll('.pa-otab').forEach(t => t.classList.remove('pa-otab-active'));
      tab.classList.add('pa-otab-active');
      document.getElementById('pa-out-overview').style.display  = tab.dataset.otab === 'overview'  ? '' : 'none';
      document.getElementById('pa-out-planilla').style.display  = tab.dataset.otab === 'planilla'  ? '' : 'none';
    });
  });

  dash.style.display = '';
  dash.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function paPrint() {
  const students = _paStudents;
  if (!students || !students.length) { toast('Genera el análisis primero'); return; }

  const numeric    = students.filter(s => typeof s.grade === 'number');
  const nsp        = students.filter(s => s.grade === 'NSP');
  const avg        = numeric.length ? (numeric.reduce((a,s) => a + s.grade, 0) / numeric.length) : 0;
  const passing    = numeric.filter(s => s.grade >= 70).length;
  const pRate      = numeric.length ? Math.round((passing / numeric.length) * 100) : 0;
  const toRecover  = numeric.filter(s => s.grade <= 65);
  const cats       = {};
  PA_CATS.forEach(c => { cats[c.key] = numeric.filter(s => s.grade >= c.min && s.grade <= c.max).length; });
  const maxCatV    = Math.max(...Object.values(cats), 1);

  const grado      = document.getElementById('pa-grado')?.value     || '—';
  const seccion    = document.getElementById('pa-seccion')?.value   || '—';
  const docente    = document.getElementById('pa-docente')?.value   || '—';
  const evaluacion = document.getElementById('pa-evaluacion')?.value || 'Evaluación';
  const fecha      = new Date().toLocaleDateString('es-HN', { year:'numeric', month:'long', day:'numeric' });

  const avgColor   = avg >= 70 ? '#16a34a' : avg >= 60 ? '#d97706' : '#dc2626';

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Plan de Acción — ${evaluacion}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Arial,sans-serif;font-size:12px;color:#111;background:#fff;}
.page{max-width:190mm;margin:0 auto;padding:12mm 15mm;}
.head{background:#1e3a7c;color:#fff;padding:14px 18px;border-radius:8px;margin-bottom:14px;}
.head-title{font-size:16px;font-weight:900;letter-spacing:.8px;}
.head-sub{font-size:11px;opacity:.85;margin-top:3px;}
.head-meta{display:flex;flex-wrap:wrap;gap:14px;margin-top:8px;font-size:10px;background:rgba(255,255,255,.15);padding:7px 10px;border-radius:6px;}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;page-break-inside:avoid;}
.stat{border:1px solid #e2e8f0;border-radius:7px;padding:10px;text-align:center;}
.stat-lbl{font-size:9px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.4px;}
.stat-val{font-size:22px;font-weight:900;color:#1e3a7c;margin:3px 0;}
.stat-sub{font-size:9px;color:#94a3b8;}
.sec-title{font-size:12px;font-weight:800;color:#1e3a7c;border-bottom:2px solid #e2e8f0;padding-bottom:5px;margin-bottom:10px;}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;page-break-inside:avoid;}
.card{border:1px solid #e2e8f0;border-radius:7px;padding:12px;page-break-inside:avoid;}
.dist-row{margin-bottom:7px;}
.dist-info{display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px;}
.dist-bar{height:6px;background:#f1f5f9;border-radius:4px;overflow:hidden;}
.dist-fill{height:100%;border-radius:4px;}
.sug-item{border-left:4px solid;padding:7px 9px;border-radius:4px;margin-bottom:7px;page-break-inside:avoid;}
.sug-head{display:flex;justify-content:space-between;margin-bottom:3px;}
.sug-title{font-size:10px;font-weight:800;}
.sug-cnt{font-size:9px;background:rgba(0,0,0,.12);padding:1px 6px;border-radius:6px;}
.sug-text{font-size:10px;color:#374151;line-height:1.4;}
.plan-box{border:1px solid #fecaca;border-left:4px solid #ef4444;border-radius:7px;padding:12px;margin-bottom:14px;}
.plan-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;}
.plan-sub{font-size:11px;font-weight:800;margin-bottom:5px;}
.plan-note{font-size:9px;color:#64748b;background:#f8fafc;padding:5px 7px;border-radius:5px;margin-bottom:6px;line-height:1.4;}
.rlist{list-style:none;}
.ritem{display:flex;justify-content:space-between;align-items:center;padding:3px 7px;border:1px solid #e2e8f0;border-radius:5px;margin-bottom:3px;font-size:10px;page-break-inside:avoid;}
.chip{font-weight:700;padding:2px 7px;border-radius:5px;font-size:9px;}
table{width:100%;border-collapse:collapse;font-size:11px;}
thead tr{background:#eff6ff;page-break-inside:avoid;}
th{color:#1e3a7c;font-weight:700;padding:7px 10px;text-align:left;border:1px solid #e2e8f0;font-size:9px;text-transform:uppercase;letter-spacing:.4px;}
td{padding:5px 10px;border:1px solid #e2e8f0;}
tr{page-break-inside:avoid;}
tbody tr:nth-child(even){background:#f8fafc;}
.td-n{text-align:center;font-weight:700;color:#94a3b8;width:30px;}
.td-g{text-align:center;font-weight:800;width:80px;}
.footer{font-size:9px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:8px;margin-top:14px;}
.pb{page-break-before:always;}
@media print{body{padding:0;}.page{padding:8mm 12mm;}}
</style></head><body><div class="page">

<div class="head">
  <div class="head-title">ANÁLISIS Y PLAN DE ACCIÓN</div>
  <div class="head-sub">📌 ${evaluacion}</div>
  <div class="head-meta">
    <span><b>Grado:</b> ${grado}</span><span><b>Sección:</b> ${seccion}</span>
    <span><b>Docente:</b> ${docente}</span><span><b>Fecha:</b> ${fecha}</span>
  </div>
</div>

<div class="stats">
  <div class="stat"><div class="stat-lbl">En Lista</div><div class="stat-val">${students.length}</div></div>
  <div class="stat"><div class="stat-lbl">Promedio</div><div class="stat-val" style="color:${avgColor}">${avg.toFixed(1)}</div></div>
  <div class="stat"><div class="stat-lbl">Aprobación</div><div class="stat-val">${pRate}%</div><div class="stat-sub">≥ 70%</div></div>
  <div class="stat"><div class="stat-lbl">Recuperación</div><div class="stat-val">${toRecover.length}</div><div class="stat-sub">nota ≤ 65</div></div>
</div>

<div class="two-col">
  <div class="card">
    <div class="sec-title">Distribución</div>
    ${PA_CATS.map(c => `<div class="dist-row"><div class="dist-info"><span>${c.label}</span><span>${cats[c.key]} alum.</span></div><div class="dist-bar"><div class="dist-fill" style="width:${Math.round((cats[c.key]/maxCatV)*100)}%;background:${c.color}"></div></div></div>`).join('')}
  </div>
  <div class="card">
    <div class="sec-title">Sugerencias Pedagógicas</div>
    ${PA_CATS.filter(c => cats[c.key] > 0).map(c => `<div class="sug-item" style="border-left-color:${c.color};background:${c.bg}"><div class="sug-head"><span class="sug-title" style="color:${c.color}">${c.label}</span><span class="sug-cnt">${cats[c.key]}</span></div><p class="sug-text">${PA_SUGS[c.key]}</p></div>`).join('')}
  </div>
</div>

<div class="plan-box">
  <div class="sec-title">Plan de Acción — Recuperación y NSP</div>
  <div class="plan-grid">
    <div>
      <div class="plan-sub">⚠️ Lista de Recuperación (${toRecover.length})</div>
      <div class="plan-note">Irán a recuperación una semana después de la entrega del primer examen.</div>
      <ul class="rlist">${toRecover.length ? toRecover.map(s => `<li class="ritem"><span>#${s.id} ${s.name}</span><span class="chip" style="background:${s.grade<=55?'#ef4444':'#f97316'};color:#fff">${s.grade}</span></li>`).join('') : '<li style="font-size:10px;color:#64748b;font-style:italic">Sin alumnos ✅</li>'}</ul>
    </div>
    <div>
      <div class="plan-sub">📋 NSP — Prueba Pendiente (${nsp.length})</div>
      <div class="plan-note">Harán la prueba el mismo día que los alumnos en recuperación.</div>
      <ul class="rlist">${nsp.length ? nsp.map(s => `<li class="ritem"><span>#${s.id} ${s.name}</span><span class="chip" style="background:#d1d5db;color:#374151">NSP</span></li>`).join('') : '<li style="font-size:10px;color:#64748b;font-style:italic">Sin alumnos ✅</li>'}</ul>
    </div>
  </div>
</div>

<div class="pb"></div>
<div class="sec-title" style="margin-bottom:10px;">Planilla de Calificaciones</div>
<table>
  <thead><tr><th class="td-n">#</th><th>Nombre del Estudiante</th><th class="td-g">${evaluacion}</th></tr></thead>
  <tbody>
    ${students.map(s => { const c = paGradeColors(s.grade); return `<tr><td class="td-n">${s.id}</td><td>${s.name}</td><td class="td-g" style="background:${c.bg};color:${c.txt}">${s.grade ?? '—'}</td></tr>`; }).join('')}
  </tbody>
</table>

<div class="footer">Generado con M.E.T.A.S. — Misiones Educativas Tecnológicas Asincrónicas y Sincrónicas · ${fecha}</div>
</div>
</body></html>`;

  const printWin = window.open('', '_blank');
  if (!printWin) {
    toast('Activa las ventanas emergentes para imprimir');
    return;
  }
  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => printWin.print(), 700);
}
window.paPrint = paPrint;

async function paCaptureGrilla() {
  if (typeof html2canvas === 'undefined') { toast('⚠️ Cargando... intenta de nuevo'); return; }
  const card = document.getElementById('pa-ng-capture');
  const btn  = card?.querySelector('.pa-ng-capture-btn');
  const acts = card?.querySelector('.pa-ng-actions');
  if (!card) return;
  if (btn)  { btn.disabled = true; btn.innerHTML = '⏳ Capturando...'; }
  if (acts) acts.style.display = 'none';
  try {
    const canvas = await html2canvas(card, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    if (acts) acts.style.display = '';
    const dataUrl   = canvas.toDataURL('image/png');
    const grado     = document.getElementById('pa-grado')?.value    || 'grado';
    const seccion   = document.getElementById('pa-seccion')?.value  || 'seccion';
    const fileName  = `calificaciones-${grado}-${seccion}.png`.replace(/\s+/g, '-');
    const cap = window.Capacitor;
    if (cap && cap.isNativePlatform?.() && cap.Plugins?.Filesystem && cap.Plugins?.Share) {
      const result = await cap.Plugins.Filesystem.writeFile({ path: fileName, data: dataUrl.split(',')[1], directory: 'CACHE' });
      await cap.Plugins.Share.share({ url: result.uri, dialogTitle: 'Guardar / Compartir Calificaciones' });
    } else {
      const a = document.createElement('a');
      a.href = dataUrl; a.download = fileName; a.click();
    }
  } catch(e) {
    if (acts) acts.style.display = '';
    if (e.name !== 'AbortError') toast('⚠️ No se pudo capturar la imagen');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-camera"></i> Capturar / Compartir'; }
  }
}
window.paCaptureGrilla = paCaptureGrilla;

function paInit() {
  if (_paInitDone) return;
  _paInitDone = true;
  for (let i = 1; i <= 20; i++) paAddRow(i);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('goto-plan-btn')?.addEventListener('click', () => { switchView('view-plan-accion'); paInit(); });
  document.getElementById('plan-back-btn')?.addEventListener('click', () => switchView('view-perfil'));

  document.getElementById('pa-add-student-btn')?.addEventListener('click', () => {
    paAddRow(document.querySelectorAll('.pa-student-row').length + 1);
  });

  document.getElementById('pa-generate-btn')?.addEventListener('click', paGenerate);

  // Entry tab switching
  document.querySelectorAll('.pa-etab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pa-etab').forEach(t => t.classList.remove('pa-etab-active'));
      tab.classList.add('pa-etab-active');
      document.getElementById('pa-entry-manual').style.display = tab.dataset.etab === 'manual' ? '' : 'none';
      document.getElementById('pa-entry-pegar').style.display  = tab.dataset.etab === 'pegar'  ? '' : 'none';
    });
  });

  // Import from paste
  document.getElementById('pa-import-btn')?.addEventListener('click', () => {
    const text = document.getElementById('pa-paste-area')?.value.trim();
    if (!text) return;
    const lines = text.split('\n').filter(l => l.trim());
    const list = document.getElementById('pa-students-list');
    if (list) list.innerHTML = '';
    lines.forEach((line, i) => {
      const parts = line.split(',');
      const name  = (parts[0] || '').trim();
      const grade = (parts[1] || '').trim();
      if (name) paAddRow(i + 1, name, grade);
    });
    // switch to manual tab to show
    document.querySelectorAll('.pa-etab').forEach(t => t.classList.remove('pa-etab-active'));
    document.querySelector('.pa-etab[data-etab="manual"]')?.classList.add('pa-etab-active');
    document.getElementById('pa-entry-manual').style.display = '';
    document.getElementById('pa-entry-pegar').style.display  = 'none';
    toast(`✅ ${lines.length} estudiantes importados`);
  });
});
