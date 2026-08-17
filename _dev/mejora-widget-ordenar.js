/* Mejora el widget de ordenar («Ordena: los pasos de principio a fin») en las
   misiones que se le pasen: arrastre con el dedo, hueco visible mientras se
   arrastra, y una LINTERNA 🔦 que enseña el número que le toca a cada tarjeta.

   Uso:  node _dev/mejora-widget-ordenar.js <carpeta>/<archivo-base> [...]
   Ej.:  node _dev/mejora-widget-ordenar.js ruta-atomos-contra-miedo/atomos-miedo

   Por qué el arrastre: las flechas ▲▼ funcionan, pero mover un paso de la
   posición 6 a la 1 son cinco toques y la vista se pierde; con el dedo es un
   gesto. Se hace con eventos de puntero (no con el arrastre de HTML5, que en
   teléfono no responde) y con touch-action:none, para que arrastrar la tarjeta
   no arrastre la página.

   Por qué la linterna cuesta: revela el orden correcto, así que la secuencia
   iluminada deja de dar XP y se dice en pantalla. Es la misma regla que la
   casa aplica a todos sus indicadores: un XP ganado con la respuesta delante
   mide recorrido, no dominio, y quien engaña la barra se engaña.

   De paso arregla un fallo heredado del molde: se invocan tres logros que
   ningún banco define (nivel3, nivel5 y widgets_master), y como
   unlockAchievement leía ACHIEVEMENTS[id].icon sin comprobar, al llegar a 55
   XP la barra se rompía a media actualización. Ahora ignora los logros que no
   existen en vez de reventar.                                              */

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

const objetivos = process.argv.slice(2);
if (!objetivos.length) {
  console.log('Uso: node _dev/mejora-widget-ordenar.js <carpeta>/<base> [...]');
  process.exit(1);
}

/* ---------- el JS nuevo del widget, línea por línea ---------- */
const JS = {
  'let currentRouteIdx=': "let currentRouteIdx=0,routeItems=[],routeLinternaOn=false,routeConLuz=new Set(),_rDrag=null;",

  'function buildRoute(){': "function buildRoute(){routeItems=_shuffle([...routeSets[currentRouteIdx].steps]);routeLinternaOn=false;_pintaBtnLinterna();renderRoute();const fbEl=document.getElementById('fbRoute');if(fbEl)fbEl.classList.remove('show');}",

  'function renderRoute(){': "function renderRoute(){const list=document.getElementById('routeList');if(!list)return;list.innerHTML='';const correcto=routeSets[currentRouteIdx].steps;routeItems.forEach((step,i)=>{const div=document.createElement('div');div.className='sort-item';div.dataset.idx=i;div.innerHTML=`<span class=\"sort-grip\" aria-hidden=\"true\">⠿</span><div class=\"sort-arrows\"><button class=\"sort-arrow\" onclick=\"routeMove(${i},-1)\"${i===0?' disabled':''} aria-label=\"Subir un lugar\">▲</button><button class=\"sort-arrow\" onclick=\"routeMove(${i},1)\"${i===routeItems.length-1?' disabled':''} aria-label=\"Bajar un lugar\">▼</button></div><div class=\"sort-step-num\">${i+1}.</div><div class=\"sort-item-txt\">${step}</div>`;if(routeLinternaOn){const debe=correcto.indexOf(step)+1;const enSitio=debe===i+1;div.classList.add(enSitio?'sort-luz-ok':'sort-luz-no');const chip=document.createElement('span');chip.className='sort-luz-chip';chip.textContent=(enSitio?'✔ ':'→ ')+debe;div.appendChild(chip);}div.addEventListener('pointerdown',ev=>routeAgarra(ev,i));list.appendChild(div);});}",

  'function routeMove(': "function routeMove(idx,dir){sfx('click');const ni=idx+dir;if(ni<0||ni>=routeItems.length)return;[routeItems[idx],routeItems[ni]]=[routeItems[ni],routeItems[idx]];renderRoute();}",

  'function checkRoute(){': "function checkRoute(){const correct=routeSets[currentRouteIdx].steps;const isOk=routeItems.every((s,i)=>s===correct[i]);const conLuz=routeConLuz.has(currentRouteIdx);if(isOk){if(conLuz){fb('fbRoute','¡Orden correcto! Pero salió con la linterna encendida, así que esta secuencia no suma XP. Prueba otra a oscuras.',true);}else{fb('fbRoute','¡Perfecto! Orden correcto. +4 XP',true);if(!xpTracker.wgt.has('route_'+currentRouteIdx)){xpTracker.wgt.add('route_'+currentRouteIdx);pts(4);}}sfx('fan');fin('s-widgets');unlockAchievement('widgets_master');}else{fb('fbRoute','Hay pasos fuera de orden. Arrástralos con el dedo o usa las flechas; si te trabas, enciende la 🔦 linterna.',false);sfx('no');}}",

  'function nextRoute(){': "function nextRoute(){sfx('click');currentRouteIdx=(currentRouteIdx+1)%routeSets.length;buildRoute();showToast('🔄 Secuencia: '+routeSets[currentRouteIdx].label);}",

  /* ── el fallo heredado: logros invocados que ningún banco define ── */
  'function unlockAchievement(': "function unlockAchievement(id){if(!ACHIEVEMENTS[id])return;if(unlockedAch.includes(id))return;unlockedAch.push(id);sfx('ach');showToast(ACHIEVEMENTS[id].icon+' ¡Logro desbloqueado! '+ACHIEVEMENTS[id].label);launchConfetti();renderAchPanel();saveProgress();}",
};

/* Las funciones nuevas van juntas, después de nextRoute. Arrastre con eventos
   de puntero: sirve igual para dedo y para ratón, y el navegador no se lleva
   la página mientras se mueve la tarjeta. */
const NUEVAS = `
/* Arrastrar para ordenar (dedo o ratón) y linterna que revela el orden.
   El paso entre filas se MIDE del propio maquetado (dos filas seguidas), en
   vez de suponerlo: con la letra grande activada las filas crecen y un valor
   fijo dejaría el hueco donde no es. */
function routeAgarra(ev,idx){
  if(ev.target.closest('.sort-arrow'))return;
  const list=document.getElementById('routeList');if(!list)return;
  const filas=[...list.children];const fila=filas[idx];if(!fila)return;
  const paso=filas.length>1?(filas[1].getBoundingClientRect().top-filas[0].getBoundingClientRect().top):(fila.getBoundingClientRect().height+7);
  _rDrag={idx,y0:ev.clientY,paso,filas,salto:0};
  fila.classList.add('sort-arrastrando');
  try{fila.setPointerCapture(ev.pointerId);}catch(e){}
  fila.addEventListener('pointermove',routeArrastra);
  fila.addEventListener('pointerup',routeSuelta);
  fila.addEventListener('pointercancel',routeSuelta);
  ev.preventDefault();
  if(typeof sfx==='function')sfx('click');
}
function routeArrastra(ev){
  if(!_rDrag)return;
  const {idx,y0,paso,filas}=_rDrag;
  const dy=ev.clientY-y0;
  let salto=Math.round(dy/paso);
  salto=Math.max(-idx,Math.min(filas.length-1-idx,salto));
  _rDrag.salto=salto;
  filas[idx].style.transform='translateY('+dy+'px)';
  filas.forEach((f,j)=>{
    if(j===idx)return;
    let d=0;
    if(salto>0&&j>idx&&j<=idx+salto)d=-paso;
    else if(salto<0&&j<idx&&j>=idx+salto)d=paso;
    f.style.transform=d?('translateY('+d+'px)'):'';
    f.classList.toggle('sort-corrido',!!d);
  });
}
function routeSuelta(ev){
  if(!_rDrag)return;
  const {idx,salto,filas}=_rDrag;
  const fila=filas[idx];
  filas.forEach(f=>{f.style.transform='';f.classList.remove('sort-arrastrando','sort-corrido');});
  try{fila.releasePointerCapture(ev.pointerId);}catch(e){}
  fila.removeEventListener('pointermove',routeArrastra);
  fila.removeEventListener('pointerup',routeSuelta);
  fila.removeEventListener('pointercancel',routeSuelta);
  _rDrag=null;
  if(salto){
    const [movida]=routeItems.splice(idx,1);
    routeItems.splice(idx+salto,0,movida);
    if(typeof sfx==='function')sfx('flip');
    renderRoute();
  }
}
function _pintaBtnLinterna(){
  const b=document.getElementById('btnLinterna');
  if(b)b.textContent=routeLinternaOn?'🔦 Apagar linterna':'🔦 Linterna';
}
function linternaRoute(){
  routeLinternaOn=!routeLinternaOn;
  if(routeLinternaOn)routeConLuz.add(currentRouteIdx);
  _pintaBtnLinterna();
  renderRoute();
  if(typeof sfx==='function')sfx(routeLinternaOn?'up':'click');
  if(routeLinternaOn)showToast('🔦 Cada tarjeta enseña el número que le toca. Con la luz encendida, esta secuencia ya no da XP.');
}
`;

/* ---------- el CSS nuevo ---------- */
const CSS = `
/* ── Ordenar: arrastre y linterna ──
   touch-action:none es lo que impide que arrastrar la tarjeta arrastre la
   página en el teléfono; sin eso el gesto se lo lleva el navegador. */
.sort-item{position:relative;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none;transition:transform 0.18s ease,background 0.2s,box-shadow 0.2s,border-color 0.2s;}
.sort-grip{font-size:1.15rem;line-height:1;letter-spacing:-3px;color:var(--gray);flex-shrink:0;opacity:0.75;}
.sort-item.sort-arrastrando{cursor:grabbing;z-index:30;transition:none;border-color:var(--pri);background:var(--pri-gl);box-shadow:0 10px 24px var(--shadow-md);}
.sort-item.sort-corrido{opacity:0.9;}
.sort-item.sort-luz-ok{border-color:var(--jade);background:var(--jade-gl);}
.sort-item.sort-luz-no{border-color:var(--amber);background:var(--amber-gl);}
.sort-luz-chip{font-family:'Fredoka',sans-serif;font-size:0.8rem;font-weight:700;padding:0.12rem 0.55rem;border-radius:999px;background:var(--card);border:1.5px solid currentColor;flex-shrink:0;}
.sort-item.sort-luz-ok .sort-luz-chip{color:var(--jade);}
.sort-item.sort-luz-no .sort-luz-chip{color:var(--amber);}
`;

/* ---------- el HTML: la instrucción y el botón ---------- */
const INSTR_VIEJA = /<p style="font-size:0\.85rem;margin-bottom:0\.8rem;">Usa las flechas <strong>▲ ▼<\/strong> para poner los pasos en el orden correcto de principio a fin:<\/p>/;
const INSTR_NUEVA = '<p style="font-size:0.85rem;margin-bottom:0.8rem;"><strong>Arrastra las tarjetas</strong> con el dedo (o usa las flechas <strong>▲ ▼</strong>) para ponerlas en orden de principio a fin. Si te trabas, enciende la <strong>🔦 linterna</strong>: enseña el número que le toca a cada una, y esa secuencia deja de dar XP.</p>';
const BTN_VIEJO = /<button class="btn btn-pri" onclick="nextRoute\(\)">🔄 Nueva secuencia<\/button>/;
const BTN_NUEVO = '<button class="btn btn-pri" onclick="nextRoute()">🔄 Nueva secuencia</button>\n      <button class="btn btn-d" id="btnLinterna" onclick="linternaRoute()">🔦 Linterna</button>';

let totalOk = 0;
for (const objetivo of objetivos) {
  const carpeta = path.dirname(objetivo), base = path.basename(objetivo);
  const fJs = path.join(RAIZ, 'misiones', carpeta, 'js', base + '.js');
  const fCss = path.join(RAIZ, 'misiones', carpeta, 'css', base + '.css');
  const fHtml = path.join(RAIZ, 'misiones', carpeta, base + '.html');
  const avisos = [];

  /* JS: se reemplaza línea por línea, que es como el molde guarda cada
     función, y así el guion se puede correr dos veces sin duplicar nada. */
  let js = fs.readFileSync(fJs, 'utf8');
  const lineas = js.split(/\r?\n/);
  for (const [prefijo, nueva] of Object.entries(JS)) {
    const idx = lineas.findIndex(l => l.startsWith(prefijo));
    if (idx === -1) { avisos.push('no encontré ' + prefijo); continue; }
    lineas[idx] = nueva;
  }
  js = lineas.join('\n');
  if (!js.includes('function routeAgarra')) {
    js = js.replace(/(function nextRoute\(\)\{[^\n]*\n)/, '$1' + NUEVAS);
    if (!js.includes('function routeAgarra')) avisos.push('no pude insertar las funciones nuevas');
  }
  fs.writeFileSync(fJs, js, 'utf8');

  let css = fs.readFileSync(fCss, 'utf8');
  if (!css.includes('sort-luz-chip')) { css += CSS; fs.writeFileSync(fCss, css, 'utf8'); }

  let html = fs.readFileSync(fHtml, 'utf8');
  if (INSTR_VIEJA.test(html)) html = html.replace(INSTR_VIEJA, INSTR_NUEVA);
  else if (!html.includes('Arrastra las tarjetas')) avisos.push('no encontré la instrucción del widget');
  if (BTN_VIEJO.test(html) && !html.includes('btnLinterna')) html = html.replace(BTN_VIEJO, BTN_NUEVO);
  else if (!html.includes('btnLinterna')) avisos.push('no encontré el botón de nueva secuencia');
  fs.writeFileSync(fHtml, html, 'utf8');

  console.log((avisos.length ? '⚠️  ' : '✔ ') + objetivo + (avisos.length ? ': ' + avisos.join(' · ') : ''));
  if (!avisos.length) totalOk++;
}
console.log('\nMisiones con el widget mejorado: ' + totalOk + ' de ' + objetivos.length);
