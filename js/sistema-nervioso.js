function compartirMision(){const url=window.location.href;const texto=`🚀 *Misión Asignada* 🚀\n\nPractica sobre este tema y sobresale en ser de los mejores alumnos. 🏆\n\nDesbloquea *todos los logros* y envía a tu maestro la *constancia de logro* cuando hayas culminado. 📋\n\n_Se te hará prueba escrita y serás excelente estudiante en Ciencias Naturales._ ✍️\n\n🔗 *Enlace:* ${url}`;window.open('https://wa.me/?text='+encodeURIComponent(texto),'_blank');}
function toggleLetra(){document.body.classList.toggle('letra-grande');if(typeof sfx==='function')sfx('click');localStorage.setItem('preferenciaLetra',document.body.classList.contains('letra-grande'));}
window.addEventListener('DOMContentLoaded',()=>{if(localStorage.getItem('preferenciaLetra')==='true')document.body.classList.add('letra-grande');});

// ===================== UTILIDADES =====================
const _pick=(arr,n)=>[...arr].sort(()=>Math.random()-0.5).slice(0,n);
const _shuffle=(arr)=>[...arr].sort(()=>Math.random()-0.5);
function fb(id,msg,isOk){const el=document.getElementById(id);if(el){el.textContent=msg;el.className='fb show '+(isOk?'ok':'err');}}

// ===================== VARIABLES GLOBALES =====================
const SAVE_KEY='sistema_nervioso_v1';
let xp=0,MXP=200,done=new Set(),evalAnsVisible=false;
let evalFormNum=1,unlockedAch=[],darkMode=false,prevLevel=0;
let evalCritFormNum=1,evalCritAnsVisible=false;
const TOTAL_SECTIONS=13;
const xpTracker={fc:new Set(),qz:new Set(),cls:new Set(),id:new Set(),cmp:new Set(),reto:new Set(),sopa:new Set(),wgt:new Set()};

// ===================== SONIDO =====================
let sndOn=true;let AC=null;
function getAC(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}return AC;}
function sfx(t){if(!sndOn)return;try{const ac=getAC();if(!ac)return;const g=ac.createGain();g.connect(ac.destination);const o=ac.createOscillator();o.connect(g);if(t==='click'){o.type='sine';o.frequency.setValueAtTime(800,ac.currentTime);o.frequency.linearRampToValueAtTime(1200,ac.currentTime+0.1);g.gain.setValueAtTime(0.2,ac.currentTime);g.gain.linearRampToValueAtTime(0,ac.currentTime+0.12);o.start();o.stop(ac.currentTime+0.12);}else if(t==='ok'){[523,659,784].forEach((f,i)=>{const o2=ac.createOscillator();const g2=ac.createGain();o2.connect(g2);g2.connect(ac.destination);o2.type='triangle';o2.frequency.value=f;g2.gain.setValueAtTime(0.15,ac.currentTime+i*0.1);g2.gain.linearRampToValueAtTime(0,ac.currentTime+i*0.1+0.15);o2.start(ac.currentTime+i*0.1);o2.stop(ac.currentTime+i*0.1+0.15);});}else if(t==='no'){o.type='square';o.frequency.setValueAtTime(200,ac.currentTime);o.frequency.linearRampToValueAtTime(100,ac.currentTime+0.2);g.gain.setValueAtTime(0.15,ac.currentTime);g.gain.linearRampToValueAtTime(0,ac.currentTime+0.2);o.start();o.stop(ac.currentTime+0.2);}else if(t==='up'){[523,659,784,1047].forEach((f,i)=>{const o2=ac.createOscillator();const g2=ac.createGain();o2.connect(g2);g2.connect(ac.destination);o2.type='triangle';o2.frequency.value=f;g2.gain.setValueAtTime(0.18,ac.currentTime+i*0.12);g2.gain.linearRampToValueAtTime(0,ac.currentTime+i*0.12+0.18);o2.start(ac.currentTime+i*0.12);o2.stop(ac.currentTime+i*0.12+0.18);});}else if(t==='fan'){[523,587,659,698,784,1047].forEach((f,i)=>{const o2=ac.createOscillator();const g2=ac.createGain();o2.connect(g2);g2.connect(ac.destination);o2.type='triangle';o2.frequency.value=f;g2.gain.setValueAtTime(0.15,ac.currentTime+i*0.1);g2.gain.linearRampToValueAtTime(0,ac.currentTime+i*0.1+0.2);o2.start(ac.currentTime+i*0.1);o2.stop(ac.currentTime+i*0.1+0.2);});}else if(t==='flip'){o.type='sine';o.frequency.setValueAtTime(400,ac.currentTime);o.frequency.linearRampToValueAtTime(900,ac.currentTime+0.15);g.gain.setValueAtTime(0.12,ac.currentTime);g.gain.linearRampToValueAtTime(0,ac.currentTime+0.18);o.start();o.stop(ac.currentTime+0.18);}else if(t==='tick'){o.type='sine';o.frequency.value=1000;g.gain.setValueAtTime(0.1,ac.currentTime);g.gain.linearRampToValueAtTime(0,ac.currentTime+0.05);o.start();o.stop(ac.currentTime+0.05);}else if(t==='ach'){[880,1047,1319].forEach((f,i)=>{const o2=ac.createOscillator();const g2=ac.createGain();o2.connect(g2);g2.connect(ac.destination);o2.type='triangle';o2.frequency.value=f;g2.gain.setValueAtTime(0.2,ac.currentTime+i*0.12);g2.gain.linearRampToValueAtTime(0,ac.currentTime+i*0.12+0.22);o2.start(ac.currentTime+i*0.12);o2.stop(ac.currentTime+i*0.12+0.22);});}}catch(e){}}
function toggleSnd(){sndOn=!sndOn;document.getElementById('sndBtn').textContent=sndOn?'🔊 Sonido':'🔇 Sonido';}

// ===================== DARK MODE =====================
function toggleTheme(){darkMode=!darkMode;document.documentElement.setAttribute('data-theme',darkMode?'dark':'light');document.getElementById('themeBtn').textContent=darkMode?'☀️ Tema':'🌙 Tema';localStorage.setItem(SAVE_KEY+'_theme',darkMode?'dark':'light');sfx('click');}
function initTheme(){const s=localStorage.getItem(SAVE_KEY+'_theme');const sys=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;darkMode=(s==='dark')||(s===null&&sys);if(darkMode){document.documentElement.setAttribute('data-theme','dark');document.getElementById('themeBtn').textContent='☀️ Tema';}}

// ===================== LOCALSTORAGE =====================
function saveProgress(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({doneSections:Array.from(done),unlockedAch,evalFormNum,evalCritFormNum,xp}));}catch(e){}}
function loadProgress(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(!s)return;if(s.doneSections&&Array.isArray(s.doneSections))s.doneSections.forEach(id=>{done.add(id);const b=document.querySelector(`[data-s="${id}"]`);if(b)b.classList.add('done');});if(s.unlockedAch&&Array.isArray(s.unlockedAch))unlockedAch=s.unlockedAch.filter(id=>ACHIEVEMENTS[id]!==undefined);if(s.evalFormNum)evalFormNum=s.evalFormNum;if(s.evalCritFormNum)evalCritFormNum=s.evalCritFormNum;if(s.xp!==undefined){xp=s.xp;updateXPBar();}}catch(e){}}

// ===================== ACHIEVEMENTS =====================
const ACHIEVEMENTS={
  primer_quiz:{icon:'🧠',label:'Primera prueba del sistema nervioso superada'},
  flash_master:{icon:'🃏',label:'Todas las flashcards del sistema nervioso exploradas'},
  clasif_pro:{icon:'🗂️',label:'Clasificador de estructuras nerviosas experto'},
  id_master:{icon:'🔍',label:'Identificador de conceptos nerviosos maestro'},
  reto_hero:{icon:'🏆',label:'Héroe del reto de clasificación nerviosa'},
  nivel3:{icon:'🔬',label:'¡Neurólogo! Nivel 3'},
  nivel5:{icon:'🥇',label:'¡Maestro del Sistema Nervioso! Nivel 6'},
  widgets_master:{icon:'🧩',label:'Widgets del sistema nervioso dominados'}
};
function unlockAchievement(id){if(unlockedAch.includes(id))return;unlockedAch.push(id);sfx('ach');showToast(ACHIEVEMENTS[id].icon+' ¡Logro desbloqueado! '+ACHIEVEMENTS[id].label);launchConfetti();renderAchPanel();saveProgress();}
function renderAchPanel(){const list=document.getElementById('achList');list.innerHTML='';Object.entries(ACHIEVEMENTS).forEach(([id,a])=>{const div=document.createElement('div');div.className='ach-item'+(unlockedAch.includes(id)?'':' locked');div.innerHTML=`<span class="ach-icon">${a.icon}</span><span>${a.label}</span>`;list.appendChild(div);});}
function toggleAchPanel(){sfx('click');document.getElementById('achPanel').classList.toggle('open');}
function showToast(msg){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);}t.textContent=msg;t.style.display='block';clearTimeout(t._tid);t._tid=setTimeout(()=>t.style.display='none',3200);}
function launchConfetti(){const colors=['#6c5ce7','#a29bfe','#0984e3','#74b9ff','#00b894'];for(let i=0;i<60;i++){const c=document.createElement('div');c.className='confetti-piece';c.style.cssText=`left:${Math.random()*100}vw;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${0.8+Math.random()*1.5}s;animation-delay:${Math.random()*0.4}s;width:${6+Math.random()*6}px;height:${6+Math.random()*6}px;border-radius:${Math.random()>0.5?'50%':'2px'};`;document.body.appendChild(c);c.addEventListener('animationend',()=>c.remove());}}

// ===================== XP =====================
const lvls=[{t:0,n:'Aprendiz 🌱'},{t:25,n:'Explorador 🔬'},{t:55,n:'Neurólogo 🧪'},{t:90,n:'Neurocientífico 🧠'},{t:130,n:'Investigador 🔭'},{t:165,n:'Neuroespecialista 🏅'},{t:190,n:'Maestro del S. Nervioso 🏆'}];
function pts(n){xp=Math.max(0,Math.min(MXP,xp+n));updateXPBar();saveProgress();}
function updateXPBar(){const pct=Math.round((xp/MXP)*100);document.getElementById('xpFill').style.width=pct+'%';const el=document.getElementById('xpPts');el.textContent='⭐ '+xp;el.style.transform='scale(1.3)';setTimeout(()=>el.style.transform='',300);let lv=0;for(let i=0;i<lvls.length;i++)if(xp>=lvls[i].t)lv=i;document.getElementById('xpLvl').textContent=lvls[lv].n;if(lv!==prevLevel){if(lv>=2)unlockAchievement('nivel3');if(lv>=5)unlockAchievement('nivel5');prevLevel=lv;}}
function resetXP(){sfx('click');xp=0;updateXPBar();showToast('🔄 XP reiniciado a 0');}
function fin(id,showFX=true){if(!done.has(id)){done.add(id);const b=document.querySelector(`[data-s="${id}"]`);if(b)b.classList.add('done');if(showFX){sfx('up');launchConfetti();}saveProgress();}}
function getProgress(){return Math.round((done.size/TOTAL_SECTIONS)*100);}

// ===================== NAV =====================
function go(id){sfx('click');document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));document.querySelectorAll('.nav-t[role="tab"]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false');});document.getElementById(id).classList.add('active');const btn=document.querySelector(`[data-s="${id}"]`);if(btn){btn.classList.add('active');btn.setAttribute('aria-selected','true');}window.scrollTo({top:0,behavior:'smooth'});if(id==='s-sopa'){setTimeout(buildSopa,50);}if(id==='s-widgets'){setTimeout(buildRoute,50);}}

// ===================== FLASHCARD DATA =====================
const fcData=[
  {w:'Sistema Nervioso',a:'⚡ Sistema de <strong>control y comunicación</strong> del cuerpo. Recibe estímulos, los procesa y envía respuestas a músculos y glándulas. Formado por el <strong>encéfalo, la médula espinal</strong> y los nervios periféricos.'},
  {w:'Neurona',a:'🔬 Unidad estructural y funcional del sistema nervioso. Tiene <strong>soma</strong> (cuerpo), <strong>dendritas</strong> (reciben) y <strong>axón</strong> (transmite). Velocidad del impulso: hasta <strong>120 m/s</strong>. El cerebro tiene ~86,000 millones.'},
  {w:'SNC — Sistema Nervioso Central',a:'🧠 Formado por el <strong>encéfalo</strong> (cerebro, cerebelo, tronco) y la <strong>médula espinal</strong>. Centro de procesamiento de todos los estímulos. Protegido por el <strong>cráneo y la columna vertebral</strong>.'},
  {w:'SNP — Sistema Nervioso Periférico',a:'🔌 Red de nervios fuera del SNC. Incluye <strong>12 pares de nervios craneales</strong> y <strong>31 pares espinales</strong>. Se divide en somático (voluntario) y autónomo (involuntario).'},
  {w:'Cerebro',a:'🧠 Parte más grande del encéfalo (~1,400 g). Dos hemisferios unidos por el <strong>cuerpo calloso</strong>. Controla el pensamiento, la <strong>memoria, el lenguaje</strong> y el movimiento voluntario.'},
  {w:'Cerebelo',a:'⚖️ Ubicado en la parte posterior del encéfalo. Coordina el <strong>equilibrio, la postura y los movimientos finos</strong>. No inicia movimientos; los <strong>afina y corrige</strong>. Su daño produce ataxia.'},
  {w:'Médula espinal',a:'🦴 Cordón nervioso de ~<strong>45 cm</strong> dentro de la columna vertebral. Conduce impulsos entre el encéfalo y el cuerpo, y procesa <strong>reflejos medulares</strong> sin intervención del cerebro.'},
  {w:'Tronco encefálico',a:'🔗 Une el cerebro con la médula espinal. Controla funciones vitales: <strong>respiración, frecuencia cardíaca y presión arterial</strong>. Incluye mesencéfalo, protuberancia y <strong>bulbo raquídeo</strong>.'},
  {w:'Sinapsis',a:'⚡ Espacio entre dos neuronas. En la sinapsis <strong>química</strong>, el botón sináptico libera <strong>neurotransmisores</strong> que activan la neurona siguiente. Es la base de toda comunicación nerviosa.'},
  {w:'Mielina',a:'🔵 Vaina <strong>lipídica</strong> que recubre el axón de algunas neuronas. Acelera la conducción mediante <strong>saltos entre nodos de Ranvier</strong> (conducción saltatoria). Su daño causa <strong>esclerosis múltiple</strong>.'},
  {w:'Arco reflejo',a:'⚡ Respuesta <strong>involuntaria rápida</strong> que no requiere al cerebro. Ruta: <strong>receptor → neurona sensorial → médula → neurona motora → efector</strong>. Ejemplo: retirar la mano al quemarse.'},
  {w:'Neurotransmisores',a:'💊 Sustancias químicas de la sinapsis. <strong>Dopamina</strong>: movimiento y placer (su pérdida causa Parkinson). <strong>Serotonina</strong>: estado de ánimo. <strong>Acetilcolina</strong>: músculos. <strong>GABA</strong>: inhibición.'},
  {w:'Alzheimer',a:'🧩 Enfermedad <strong>neurodegenerativa</strong> progresiva. Destruye neuronas y sinapsis. Principal causa de <strong>demencia</strong>. Afecta memoria, lenguaje y personalidad. Sin cura conocida actualmente.'},
  {w:'Neurona motora (eferente)',a:'💪 Conduce órdenes del <strong>SNC hacia los músculos y glándulas</strong>. También llamada neurona eferente. Su daño causa parálisis o debilidad muscular. Se opone a la neurona sensorial (aferente).'},
];
let fcIdx=0;
function upFC(){document.getElementById('fcInner').classList.remove('flipped');document.getElementById('fcW').textContent=fcData[fcIdx].w;document.getElementById('fcA').innerHTML=fcData[fcIdx].a;document.getElementById('fcCtr').textContent=(fcIdx+1)+' / '+fcData.length;}
function flipCard(){sfx('flip');document.getElementById('fcInner').classList.toggle('flipped');if(!xpTracker.fc.has(fcIdx)){xpTracker.fc.add(fcIdx);pts(1);}if(xpTracker.fc.size===fcData.length){fin('s-flash');unlockAchievement('flash_master');}}
function nextFC(){sfx('click');fcIdx=(fcIdx+1)%fcData.length;upFC();}
function prevFC(){sfx('click');fcIdx=(fcIdx-1+fcData.length)%fcData.length;upFC();}

// ===================== QUIZ DATA =====================
const qzData=[
  {q:'¿Qué parte del encéfalo controla el equilibrio y la coordinación de movimientos?',o:['a) Cerebro','b) Cerebelo','c) Tronco encefálico','d) Médula espinal'],c:1},
  {q:'¿Cómo se llama la vaina que recubre el axón y acelera la transmisión del impulso nervioso?',o:['a) Dendrita','b) Sinapsis','c) Mielina','d) Soma'],c:2},
  {q:'¿Cuántos pares de nervios craneales forman parte del Sistema Nervioso Periférico?',o:['a) 8 pares','b) 10 pares','c) 12 pares','d) 31 pares'],c:2},
  {q:'¿Qué neurotransmisor está relacionado con el movimiento y el placer, y su pérdida causa Parkinson?',o:['a) GABA','b) Acetilcolina','c) Serotonina','d) Dopamina'],c:3},
  {q:'¿Qué tipo de neurona lleva información desde los receptores sensoriales hacia el SNC?',o:['a) Motora','b) Interneurona','c) Sensorial','d) Eferente'],c:2},
  {q:'¿Cuántos centímetros mide aproximadamente la médula espinal en un adulto?',o:['a) 25 cm','b) 35 cm','c) 45 cm','d) 60 cm'],c:2},
  {q:'¿Qué enfermedad se caracteriza por pérdida de dopamina y temblores involuntarios?',o:['a) Alzheimer','b) Parkinson','c) Epilepsia','d) Meningitis'],c:1},
  {q:'¿Qué estructura conecta los dos hemisferios del cerebro?',o:['a) Tronco encefálico','b) Cuerpo calloso','c) Cerebelo','d) Bulbo raquídeo'],c:1},
  {q:'¿A qué velocidad máxima puede viajar un impulso nervioso en fibras mielinizadas?',o:['a) 30 m/s','b) 60 m/s','c) 90 m/s','d) 120 m/s'],c:3},
];
let qzIdx=0,qzSel=-1,qzDone=false;
function buildQz(){qzIdx=0;qzSel=-1;qzDone=false;showQz();}
function showQz(){if(qzIdx>=qzData.length){document.getElementById('qzQ').textContent='🎉 ¡Quiz completado!';document.getElementById('qzOpts').innerHTML='';fin('s-quiz');unlockAchievement('primer_quiz');return;}const q=qzData[qzIdx];document.getElementById('qzProg').textContent=`Pregunta ${qzIdx+1} de ${qzData.length}`;document.getElementById('qzQ').textContent=q.q;const opts=document.getElementById('qzOpts');opts.innerHTML='';q.o.forEach((o,i)=>{const b=document.createElement('button');b.className='qz-opt';b.textContent=o;b.onclick=()=>{if(qzDone)return;document.querySelectorAll('.qz-opt').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');qzSel=i;sfx('click');};opts.appendChild(b);});qzDone=false;}
function checkQz(){if(qzSel<0)return fb('fbQz','Selecciona una respuesta.',false);qzDone=true;const opts=document.querySelectorAll('.qz-opt');if(qzSel===qzData[qzIdx].c){opts[qzSel].classList.add('correct');fb('fbQz','¡Correcto! +5 XP',true);if(!xpTracker.qz.has(qzIdx)){xpTracker.qz.add(qzIdx);pts(5);}sfx('ok');}else{opts[qzSel].classList.add('wrong');opts[qzData[qzIdx].c].classList.add('correct');fb('fbQz','Incorrecto. Revisa la respuesta correcta.',false);sfx('no');}setTimeout(()=>{qzIdx++;qzSel=-1;showQz();},1600);}
function resetQz(){sfx('click');qzIdx=0;qzSel=-1;qzDone=false;showQz();document.getElementById('fbQz').classList.remove('show');}

// ===================== CLASIFICACIÓN =====================
const classGroups=[
  {label:['SNC','SNP'],headA:'🧠 Sistema Nervioso Central',headB:'🔌 Sistema Nervioso Periférico',colA:'snc',colB:'snp',
   words:[{w:'Cerebro',t:'snc'},{w:'Nervio ciático',t:'snp'},{w:'Cerebelo',t:'snc'},{w:'Nervio óptico',t:'snp'},{w:'Médula espinal',t:'snc'},{w:'Ganglio nervioso',t:'snp'},{w:'Tronco encefálico',t:'snc'},{w:'Plexo braquial',t:'snp'},{w:'Corteza cerebral',t:'snc'},{w:'Nervio facial',t:'snp'}]},
  {label:['Voluntario','Involuntario'],headA:'✋ Voluntario',headB:'💓 Involuntario',colA:'vol',colB:'inv',
   words:[{w:'Caminar',t:'vol'},{w:'Latido cardíaco',t:'inv'},{w:'Escribir',t:'vol'},{w:'Digestión',t:'inv'},{w:'Hablar',t:'vol'},{w:'Reflejo patelar',t:'inv'},{w:'Saltar',t:'vol'},{w:'Respiración automática',t:'inv'},{w:'Dibujar',t:'vol'},{w:'Control de pupila',t:'inv'}]},
  {label:['Neurona Sensorial','Neurona Motora'],headA:'👁️ Neurona Sensorial',headB:'💪 Neurona Motora',colA:'sen',colB:'mot',
   words:[{w:'Detecta la luz',t:'sen'},{w:'Contrae músculo',t:'mot'},{w:'Capta el dolor',t:'sen'},{w:'Activa glándulas',t:'mot'},{w:'Impulso aferente',t:'sen'},{w:'Impulso eferente',t:'mot'},{w:'Receptor táctil',t:'sen'},{w:'Efector nervioso',t:'mot'},{w:'Sentido del frío',t:'sen'},{w:'Mueve el brazo',t:'mot'}]},
  {label:['Encéfalo','Médula/SNP'],headA:'🧠 Encéfalo',headB:'🔌 Médula / SNP',colA:'ence',colB:'med',
   words:[{w:'Lóbulo frontal',t:'ence'},{w:'Nervio espinal',t:'med'},{w:'Corteza cerebral',t:'ence'},{w:'Arco reflejo',t:'med'},{w:'Cerebelo',t:'ence'},{w:'Ganglio dorsal',t:'med'},{w:'Bulbo raquídeo',t:'ence'},{w:'Plexo lumbar',t:'med'},{w:'Hipocampo',t:'ence'},{w:'Par craneal VII',t:'med'}]},
];
let currentClassGroupIdx=0,clsSelectedWord=null;
function buildClass(){const group=classGroups[currentClassGroupIdx];document.getElementById('col-left-head').textContent=group.headA;document.getElementById('col-right-head').textContent=group.headB;const bank=document.getElementById('clsBank');bank.innerHTML='';clsSelectedWord=null;document.getElementById('items-left').innerHTML='';document.getElementById('items-right').innerHTML='';_shuffle([...group.words]).forEach(w=>{const el=document.createElement('div');el.className='wb-item';el.textContent=w.w;el.dataset.t=w.t;el.onclick=()=>{document.querySelectorAll('.wb-item').forEach(i=>i.classList.remove('sel-word'));el.classList.add('sel-word');clsSelectedWord=el;sfx('click');};bank.appendChild(el);});['col-left','col-right'].forEach(colId=>{const col=document.getElementById(colId);col.onclick=(e)=>{if(!clsSelectedWord||e.target.classList.contains('drop-item'))return;const targetId=colId==='col-left'?'items-left':'items-right';const wordsCol=document.getElementById(targetId);const item=document.createElement('div');item.className='drop-item';item.textContent=clsSelectedWord.textContent;item.dataset.t=clsSelectedWord.dataset.t;const original=clsSelectedWord;item.onclick=(ev)=>{ev.stopPropagation();if(clsSelectedWord!==null){col.click();}else{document.getElementById('clsBank').appendChild(original);original.classList.remove('sel-word');item.remove();if(typeof sfx==='function')sfx('click');}};wordsCol.appendChild(item);clsSelectedWord.remove();clsSelectedWord=null;sfx('click');};});}
function checkClass(){const remaining=document.querySelectorAll('#clsBank .wb-item').length;if(remaining>0){fb('fbCls','Mueve todas las palabras a las columnas primero.',false);return;}const group=classGroups[currentClassGroupIdx];let allOk=true;document.querySelectorAll('#items-left .drop-item,#items-right .drop-item').forEach(el=>{const inLeft=el.parentElement.id==='items-left';const expectedType=inLeft?group.colA:group.colB;if(el.dataset.t===expectedType){el.classList.add('cls-ok');}else{el.classList.add('cls-no');allOk=false;}});if(!xpTracker.cls.has(currentClassGroupIdx)){xpTracker.cls.add(currentClassGroupIdx);pts(5);}if(allOk){fb('fbCls','¡Perfecto! +5 XP',true);sfx('fan');fin('s-clasifica');unlockAchievement('clasif_pro');}else{fb('fbCls','Hay errores. Marcados en rojo.',false);sfx('no');}}
function nextClassGroup(){sfx('click');currentClassGroupIdx=(currentClassGroupIdx+1)%classGroups.length;buildClass();document.getElementById('fbCls').classList.remove('show');showToast('🔄 Grupo: '+classGroups[currentClassGroupIdx].label[0]+' vs '+classGroups[currentClassGroupIdx].label[1]);}
function resetClass(){sfx('click');buildClass();document.getElementById('fbCls').classList.remove('show');}

// ===================== IDENTIFICAR =====================
const idData=[
  {s:['El','axón','transmite','el','impulso','nervioso','hacia','otras','células.'],c:1,art:'Parte de la neurona que transmite el impulso'},
  {s:['La','mielina','acelera','la','conducción','del','impulso','nervioso.'],c:1,art:'Vaina que recubre y acelera el axón'},
  {s:['El','cerebelo','coordina','el','equilibrio','y','los','movimientos','finos.'],c:1,art:'Parte del encéfalo que regula la coordinación'},
  {s:['La','sinapsis','es','el','espacio','entre','dos','neuronas.'],c:1,art:'Unión funcional entre neuronas'},
  {s:['El','reflejo','no','requiere','procesamiento','del','cerebro.'],c:1,art:'Respuesta involuntaria rápida de la médula'},
  {s:['La','dopamina','regula','el','movimiento','y','el','placer.'],c:1,art:'Neurotransmisor del movimiento'},
  {s:['El','Alzheimer','destruye','neuronas','y','afecta','la','memoria.'],c:1,art:'Enfermedad neurodegenerativa progresiva'},
  {s:['La','médula','espinal','procesa','reflejos','sin','el','cerebro.'],c:1,art:'Estructura que procesa reflejos medulares'},
];
let idIdx=0,idDone=false;
function showId(){idDone=false;if(idIdx>=idData.length){document.getElementById('idSent').innerHTML='🎉 ¡Completado!';fin('s-identifica');unlockAchievement('id_master');return;}const d=idData[idIdx];document.getElementById('idProg').textContent=`Oración ${idIdx+1} de ${idData.length}`;document.getElementById('idInfo').textContent=`Busca: ${d.art}`;const sent=document.getElementById('idSent');sent.innerHTML='';d.s.forEach((w,i)=>{const span=document.createElement('span');span.className='id-word';span.textContent=w+' ';span.onclick=()=>checkId(i,span);sent.appendChild(span);});}
function checkId(i,span){if(idDone)return;document.querySelectorAll('.id-word').forEach(s=>s.classList.remove('selected'));span.classList.add('selected');if(i===idData[idIdx].c){idDone=true;span.classList.add('id-ok');fb('fbId','¡Correcto! +5 XP',true);if(!xpTracker.id.has(idIdx)){xpTracker.id.add(idIdx);pts(5);}sfx('ok');}else{span.classList.add('id-no');fb('fbId','Ese no es el término solicitado.',false);sfx('no');}}
function nextId(){sfx('click');idIdx++;showId();document.getElementById('fbId').classList.remove('show');}
function resetId(){sfx('click');idIdx=0;showId();document.getElementById('fbId').classList.remove('show');}

// ===================== COMPLETA =====================
const cmpData=[
  {s:'La ___ es la vaina que acelera la conducción del impulso nervioso.',opts:['mielina','dopamina','sinapsis'],c:0},
  {s:'El ___ coordina el equilibrio y la coordinación de movimientos.',opts:['cerebro','cerebelo','tronco'],c:1},
  {s:'La información viaja del receptor al SNC por la neurona ___.',opts:['motora','interneurona','sensorial'],c:2},
  {s:'El espacio entre dos neuronas donde se transmiten impulsos se llama ___.',opts:['axón','sinapsis','dendrita'],c:1},
  {s:'El arco reflejo es procesado principalmente en la ___ espinal.',opts:['corteza','médula','sinapsis'],c:1},
  {s:'La enfermedad que destruye la mielina afectando la conducción nerviosa es ___.',opts:['Parkinson','Alzheimer','esclerosis múltiple'],c:2},
  {s:'El ___ rige las funciones vitales de respiración y latido cardíaco.',opts:['cerebelo','cerebro','tronco encefálico'],c:2},
  {s:'Los impulsos viajan desde el ___ hasta los músculos por neuronas motoras.',opts:['receptor','SNC','ganglio'],c:1},
];
let cmpIdx=0,cmpSel=-1,cmpDone=false;
function showCmp(){if(cmpIdx>=cmpData.length){document.getElementById('cmpSent').innerHTML='🎉 ¡Completado!';document.getElementById('cmpOpts').innerHTML='';fin('s-completa');return;}const d=cmpData[cmpIdx];document.getElementById('cmpProg').textContent=`Oración ${cmpIdx+1} de ${cmpData.length}`;document.getElementById('cmpSent').innerHTML=d.s.replace('___','<span class="blank">___</span>');const opts=document.getElementById('cmpOpts');opts.innerHTML='';cmpSel=-1;cmpDone=false;d.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='cmp-opt';b.textContent=o;b.onclick=()=>{if(cmpDone)return;document.querySelectorAll('.cmp-opt').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');cmpSel=i;sfx('click');};opts.appendChild(b);});}
function checkCmp(){if(cmpSel<0)return fb('fbCmp','Selecciona una opción.',false);cmpDone=true;const opts=document.querySelectorAll('.cmp-opt');if(cmpSel===cmpData[cmpIdx].c){opts[cmpSel].classList.add('correct');document.getElementById('cmpSent').innerHTML=cmpData[cmpIdx].s.replace('___',`<span class="blank" style="color:var(--jade);border-color:var(--jade)">${opts[cmpSel].textContent}</span>`);fb('fbCmp','¡Correcto! +5 XP',true);if(!xpTracker.cmp.has(cmpIdx)){xpTracker.cmp.add(cmpIdx);pts(5);}sfx('ok');}else{opts[cmpSel].classList.add('wrong');opts[cmpData[cmpIdx].c].classList.add('correct');fb('fbCmp','Incorrecto. Revisa bien la respuesta.',false);sfx('no');}setTimeout(()=>{cmpIdx++;document.getElementById('fbCmp').classList.remove('show');showCmp();},1600);}

// ===================== WIDGETS =====================
// Widget 1: Ordenar Ruta del Impulso
const routeSets=[
  {label:'Ruta del Impulso Nervioso',steps:['Receptor sensorial','Neurona sensorial','SNC (médula o encéfalo)','Neurona motora','Efector (músculo)']},
  {label:'Arco Reflejo',steps:['Estímulo externo','Receptor nervioso','Neurona sensorial','Médula espinal','Neurona motora','Efector (músculo)']},
  {label:'Transmisión Sináptica',steps:['Potencial de acción en el axón','Botón sináptico activado','Liberación de neurotransmisor','Cruce del espacio sináptico','Receptor postsináptico activado']},
];
let currentRouteIdx=0,routeItems=[];
function buildRoute(){routeItems=_shuffle([...routeSets[currentRouteIdx].steps]);renderRoute();const fbEl=document.getElementById('fbRoute');if(fbEl)fbEl.classList.remove('show');}
function renderRoute(){const list=document.getElementById('routeList');if(!list)return;list.innerHTML='';routeItems.forEach((step,i)=>{const div=document.createElement('div');div.className='sort-item';div.innerHTML=`<div class="sort-arrows"><button class="sort-arrow" onclick="routeMove(${i},-1)"${i===0?' disabled':''}>▲</button><button class="sort-arrow" onclick="routeMove(${i},1)"${i===routeItems.length-1?' disabled':''}>▼</button></div><div class="sort-step-num">${i+1}.</div><div class="sort-item-txt">${step}</div>`;list.appendChild(div);});}
function routeMove(idx,dir){sfx('click');const ni=idx+dir;if(ni<0||ni>=routeItems.length)return;[routeItems[idx],routeItems[ni]]=[routeItems[ni],routeItems[idx]];renderRoute();}
function checkRoute(){const correct=routeSets[currentRouteIdx].steps;const isOk=routeItems.every((s,i)=>s===correct[i]);if(isOk){fb('fbRoute','¡Perfecto! Orden correcto. +4 XP',true);if(!xpTracker.wgt.has('route_'+currentRouteIdx)){xpTracker.wgt.add('route_'+currentRouteIdx);pts(4);}sfx('fan');fin('s-widgets');unlockAchievement('widgets_master');}else{fb('fbRoute','Hay pasos fuera de orden. Revisa el arreglo.',false);sfx('no');}}
function nextRoute(){sfx('click');currentRouteIdx=(currentRouteIdx+1)%routeSets.length;buildRoute();showToast('🔄 Ruta: '+routeSets[currentRouteIdx].label);}

// Widget 2: Partes de la Neurona
const neuronPartes=[
  {desc:'Contiene el núcleo y el citoplasma de la neurona',ans:'Soma',opts:['Soma','Dendrita','Axón','Mielina']},
  {desc:'Recibe impulsos de otras neuronas',ans:'Dendrita',opts:['Soma','Dendrita','Axón','Nodo de Ranvier']},
  {desc:'Transmite el impulso nervioso hacia otras células',ans:'Axón',opts:['Dendrita','Soma','Axón','Sinapsis']},
  {desc:'Vaina lipídica que acelera la conducción del impulso',ans:'Mielina',opts:['Axón','Mielina','Soma','Sinapsis']},
  {desc:'Espacio entre nodos donde el impulso "salta" (conducción saltatoria)',ans:'Nodo de Ranvier',opts:['Axón','Mielina','Nodo de Ranvier','Dendrita']},
  {desc:'Zona donde se liberan los neurotransmisores hacia la sinapsis',ans:'Botón sináptico',opts:['Soma','Botón sináptico','Axón','Dendrita']},
  {desc:'Neurona que lleva información de los receptores sensoriales al SNC',ans:'Neurona sensorial',opts:['Neurona motora','Interneurona','Neurona sensorial','Neurona eferente']},
  {desc:'Neurona que lleva órdenes del SNC hacia músculos y glándulas',ans:'Neurona motora',opts:['Neurona sensorial','Neurona motora','Interneurona','Soma']},
];
let neuronIdx=0,neuronDone=false;
function showNeuron(){neuronDone=false;if(neuronIdx>=neuronPartes.length){const el=document.getElementById('neuronDesc');if(el)el.textContent='🎉 ¡Todas las partes identificadas!';const opts=document.getElementById('neuronOpts');if(opts)opts.innerHTML='';fin('s-widgets');return;}const d=neuronPartes[neuronIdx];const prog=document.getElementById('neuronProg');if(prog)prog.textContent=`Parte ${neuronIdx+1} de ${neuronPartes.length}`;const desc=document.getElementById('neuronDesc');if(desc)desc.textContent=d.desc;const opts=document.getElementById('neuronOpts');if(!opts)return;opts.innerHTML='';_shuffle([...d.opts]).forEach(opt=>{const b=document.createElement('button');b.className='cmp-opt';b.textContent=opt;b.onclick=()=>checkNeuron(opt,b,d);opts.appendChild(b);});const fbEl=document.getElementById('fbNeuron');if(fbEl)fbEl.classList.remove('show');}
function checkNeuron(opt,btn,d){if(neuronDone)return;neuronDone=true;document.querySelectorAll('#neuronOpts .cmp-opt').forEach(b=>{if(b.textContent===d.ans)b.classList.add('correct');else if(b===btn&&b.textContent!==d.ans)b.classList.add('wrong');});const isOk=opt===d.ans;if(isOk){fb('fbNeuron','¡Correcto! +3 XP',true);if(!xpTracker.wgt.has('neuron_'+neuronIdx)){xpTracker.wgt.add('neuron_'+neuronIdx);pts(3);}sfx('ok');}else{fb('fbNeuron','La respuesta correcta es: '+d.ans,false);sfx('no');}}
function nextNeuron(){sfx('click');neuronIdx++;showNeuron();}
function resetNeuron(){sfx('click');neuronIdx=0;showNeuron();}

// Widget 3: Neurotransmisores → Función
const neuroPairs=[
  {trans:'Dopamina',func:'Movimiento y placer; su pérdida causa Parkinson',opts:['Movimiento y placer; su pérdida causa Parkinson','Estado de ánimo y bienestar','Contracción muscular voluntaria','Inhibición nerviosa']},
  {trans:'Serotonina',func:'Estado de ánimo y bienestar',opts:['Movimiento y placer; su pérdida causa Parkinson','Estado de ánimo y bienestar','Contracción muscular voluntaria','Activación del sistema simpático']},
  {trans:'GABA',func:'Inhibición nerviosa',opts:['Inhibición nerviosa','Estado de ánimo y bienestar','Movimiento y placer; su pérdida causa Parkinson','Contracción muscular voluntaria']},
  {trans:'Acetilcolina',func:'Contracción muscular voluntaria',opts:['Inhibición nerviosa','Estado de ánimo y bienestar','Movimiento y placer; su pérdida causa Parkinson','Contracción muscular voluntaria']},
  {trans:'Noradrenalina',func:'Activación del sistema simpático (lucha o huye)',opts:['Activación del sistema simpático (lucha o huye)','Estado de ánimo y bienestar','Movimiento y placer; su pérdida causa Parkinson','Inhibición nerviosa']},
];
let neuroIdx=0,neuroDone=false;
function showNeuro(){neuroDone=false;if(neuroIdx>=neuroPairs.length){const el=document.getElementById('neuroTrans');if(el)el.textContent='🎉 ¡Completado!';const opts=document.getElementById('neuroOpts');if(opts)opts.innerHTML='';return;}const d=neuroPairs[neuroIdx];const prog=document.getElementById('neuroProg');if(prog)prog.textContent=`${neuroIdx+1} de ${neuroPairs.length}`;const trans=document.getElementById('neuroTrans');if(trans)trans.textContent=d.trans;const opts=document.getElementById('neuroOpts');if(!opts)return;opts.innerHTML='';_shuffle([...d.opts]).forEach(opt=>{const b=document.createElement('button');b.className='qz-opt';b.textContent=opt;b.onclick=()=>checkNeuro(opt,b,d);opts.appendChild(b);});const fbEl=document.getElementById('fbNeuro');if(fbEl)fbEl.classList.remove('show');}
function checkNeuro(opt,btn,d){if(neuroDone)return;neuroDone=true;document.querySelectorAll('#neuroOpts .qz-opt').forEach(b=>{if(b.textContent===d.func)b.classList.add('correct');else if(b===btn&&b.textContent!==d.func)b.classList.add('wrong');});const isOk=opt===d.func;if(isOk){fb('fbNeuro','¡Correcto! +3 XP',true);if(!xpTracker.wgt.has('neuro_'+neuroIdx)){xpTracker.wgt.add('neuro_'+neuroIdx);pts(3);}sfx('ok');}else{fb('fbNeuro','Correcto: '+d.func,false);sfx('no');}setTimeout(()=>{neuroIdx++;showNeuro();},1800);}
function resetNeuro(){sfx('click');neuroIdx=0;showNeuro();}

// Widget 4: Enfermedades → Característica principal
const enfermedadData=[
  {disease:'Alzheimer',characteristic:'Destruye neuronas y sinapsis; principal causa de demencia',opts:['Destruye neuronas y sinapsis; principal causa de demencia','Destruye la vaina de mielina','Pérdida de dopamina con temblores involuntarios','Descargas eléctricas anormales en el cerebro']},
  {disease:'Parkinson',characteristic:'Pérdida de dopamina con temblores involuntarios',opts:['Destruye neuronas y sinapsis; principal causa de demencia','Destruye la vaina de mielina','Pérdida de dopamina con temblores involuntarios','Descargas eléctricas anormales en el cerebro']},
  {disease:'Esclerosis múltiple',characteristic:'Destruye la vaina de mielina afectando la conducción',opts:['Destruye neuronas y sinapsis; principal causa de demencia','Destruye la vaina de mielina afectando la conducción','Pérdida de dopamina con temblores involuntarios','Compresión de nervios en la muñeca']},
  {disease:'Epilepsia',characteristic:'Descargas eléctricas anormales en el cerebro',opts:['Destruye neuronas y sinapsis; principal causa de demencia','Destruye la vaina de mielina afectando la conducción','Pérdida de dopamina con temblores involuntarios','Descargas eléctricas anormales en el cerebro']},
  {disease:'Meningitis',characteristic:'Inflamación de las meninges que rodean el SNC',opts:['Inflamación de las meninges que rodean el SNC','Destruye la vaina de mielina afectando la conducción','Pérdida de dopamina con temblores involuntarios','Descargas eléctricas anormales en el cerebro']},
  {disease:'ACV (Derrame cerebral)',characteristic:'Obstrucción o ruptura de vasos cerebrales',opts:['Inflamación de las meninges que rodean el SNC','Destruye la vaina de mielina afectando la conducción','Obstrucción o ruptura de vasos cerebrales','Descargas eléctricas anormales en el cerebro']},
];
let enferIdx=0,enferDone=false;
function showEnfer(){enferDone=false;if(enferIdx>=enfermedadData.length){const el=document.getElementById('enferDisease');if(el)el.textContent='🎉 ¡Completado!';const opts=document.getElementById('enferOpts');if(opts)opts.innerHTML='';return;}const d=enfermedadData[enferIdx];const prog=document.getElementById('enferProg');if(prog)prog.textContent=`${enferIdx+1} de ${enfermedadData.length}`;const dis=document.getElementById('enferDisease');if(dis)dis.textContent=d.disease;const opts=document.getElementById('enferOpts');if(!opts)return;opts.innerHTML='';_shuffle([...d.opts]).forEach(opt=>{const b=document.createElement('button');b.className='qz-opt';b.textContent=opt;b.onclick=()=>checkEnfer(opt,b,d);opts.appendChild(b);});const fbEl=document.getElementById('fbEnfer');if(fbEl)fbEl.classList.remove('show');}
function checkEnfer(opt,btn,d){if(enferDone)return;enferDone=true;document.querySelectorAll('#enferOpts .qz-opt').forEach(b=>{if(b.textContent===d.characteristic)b.classList.add('correct');else if(b===btn&&b.textContent!==d.characteristic)b.classList.add('wrong');});const isOk=opt===d.characteristic;if(isOk){fb('fbEnfer','¡Correcto! +3 XP',true);if(!xpTracker.wgt.has('enfer_'+enferIdx)){xpTracker.wgt.add('enfer_'+enferIdx);pts(3);}sfx('ok');}else{fb('fbEnfer','Correcto: '+d.characteristic,false);sfx('no');}setTimeout(()=>{enferIdx++;showEnfer();},1800);}
function resetEnfer(){sfx('click');enferIdx=0;showEnfer();}

// ===================== RETO FINAL =====================
const retoPairs=[
  {label:['SNC','SNP'],btnA:'🧠 SNC',btnB:'🔌 SNP',colA:'snc',colB:'snp',
   words:[{w:'Cerebro',t:'snc'},{w:'Nervio ciático',t:'snp'},{w:'Cerebelo',t:'snc'},{w:'Nervio óptico',t:'snp'},{w:'Médula espinal',t:'snc'},{w:'Ganglio nervioso',t:'snp'},{w:'Tronco encefálico',t:'snc'},{w:'Plexo braquial',t:'snp'},{w:'Corteza cerebral',t:'snc'},{w:'Nervio facial',t:'snp'}]},
  {label:['Voluntario','Involuntario'],btnA:'✋ Voluntario',btnB:'💓 Involuntario',colA:'vol',colB:'inv',
   words:[{w:'Caminar',t:'vol'},{w:'Latido cardíaco',t:'inv'},{w:'Escribir',t:'vol'},{w:'Digestión',t:'inv'},{w:'Hablar',t:'vol'},{w:'Reflejo patelar',t:'inv'},{w:'Saltar',t:'vol'},{w:'Respiración auto.',t:'inv'},{w:'Dibujar',t:'vol'},{w:'Control de pupila',t:'inv'}]},
  {label:['Sensorial','Motora'],btnA:'👁️ Sensorial',btnB:'💪 Motora',colA:'sen',colB:'mot',
   words:[{w:'Detecta la luz',t:'sen'},{w:'Contrae músculo',t:'mot'},{w:'Capta el dolor',t:'sen'},{w:'Activa glándulas',t:'mot'},{w:'Impulso aferente',t:'sen'},{w:'Impulso eferente',t:'mot'},{w:'Receptor táctil',t:'sen'},{w:'Efector nervioso',t:'mot'},{w:'Sentido del frío',t:'sen'},{w:'Mueve el brazo',t:'mot'}]},
];
let currentRetoPairIdx=0,retoPool=[],retoOk=0,retoErr=0,retoTimerInt=null,retoSec=30,retoRunning=false,retoCurrent=null;
function updateRetoButtons(){const pair=retoPairs[currentRetoPairIdx];document.querySelectorAll('.reto-btns .btn')[0].textContent=pair.btnA;document.querySelectorAll('.reto-btns .btn')[1].textContent=pair.btnB;document.querySelectorAll('.reto-btns .btn')[0].onclick=()=>ansReto(pair.colA);document.querySelectorAll('.reto-btns .btn')[1].onclick=()=>ansReto(pair.colB);}
function startReto(){if(retoRunning)return;sfx('click');retoRunning=true;retoOk=0;retoErr=0;retoSec=30;retoPool=_shuffle([...retoPairs[currentRetoPairIdx].words,...retoPairs[currentRetoPairIdx].words]);showRetoWord();retoTimerInt=setInterval(()=>{retoSec--;sfx('tick');document.getElementById('retoTimer').textContent='⏱ '+retoSec;if(retoSec<=10)document.getElementById('retoTimer').style.color='var(--red)';if(retoSec<=0){clearInterval(retoTimerInt);endReto();}},1000);}
function showRetoWord(){if(retoPool.length===0)retoPool=_shuffle([...retoPairs[currentRetoPairIdx].words,...retoPairs[currentRetoPairIdx].words]);retoCurrent=retoPool.pop();document.getElementById('retoWord').textContent=retoCurrent.w;}
function ansReto(t){if(!retoRunning||!retoCurrent)return;const firstPlay=!xpTracker.reto.has(currentRetoPairIdx);if(t===retoCurrent.t){sfx('ok');retoOk++;if(firstPlay)pts(1);}else{sfx('no');retoErr++;if(firstPlay)pts(-1);}document.getElementById('retoScore').textContent=`✅ ${retoOk} correctas | ❌ ${retoErr} errores`;showRetoWord();}
function endReto(){retoRunning=false;document.getElementById('retoWord').textContent='🏁 ¡Tiempo!';document.getElementById('retoTimer').style.color='var(--pri)';xpTracker.reto.add(currentRetoPairIdx);const total=retoOk+retoErr;const pct=total>0?Math.round((retoOk/total)*100):0;fb('fbReto',`Resultado: ${retoOk}/${total} (${pct}%) ¡Bien hecho!`,true);fin('s-reto');sfx('fan');unlockAchievement('reto_hero');}
function nextRetoPair(){sfx('click');clearInterval(retoTimerInt);retoRunning=false;retoSec=30;retoOk=0;retoErr=0;currentRetoPairIdx=(currentRetoPairIdx+1)%retoPairs.length;updateRetoButtons();document.getElementById('retoTimer').textContent='⏱ 30';document.getElementById('retoTimer').style.color='var(--pri)';document.getElementById('retoWord').textContent='¡Prepárate!';document.getElementById('retoScore').textContent='✅ 0 correctas | ❌ 0 errores';document.getElementById('fbReto').classList.remove('show');showToast(`🔄 Pareja: ${retoPairs[currentRetoPairIdx].label[0]} vs ${retoPairs[currentRetoPairIdx].label[1]}`);}
function resetReto(){sfx('click');clearInterval(retoTimerInt);retoRunning=false;retoSec=30;retoOk=0;retoErr=0;document.getElementById('retoTimer').textContent='⏱ 30';document.getElementById('retoTimer').style.color='var(--pri)';document.getElementById('retoWord').textContent='¡Prepárate!';document.getElementById('retoScore').textContent='✅ 0 correctas | ❌ 0 errores';document.getElementById('fbReto').classList.remove('show');}

// ===================== TASK GENERATOR =====================
const identifyTaskDB=[
  {s:'La neurona es la unidad estructural y funcional del sistema nervioso. Puede conectarse con hasta 10,000 neuronas a través de sinapsis.',type:'Unidad funcional del sistema nervioso'},
  {s:'El SNC está formado por el encéfalo (cerebro, cerebelo, tronco) y la médula espinal. Es el centro de procesamiento de todos los estímulos.',type:'Sistema Nervioso Central (SNC)'},
  {s:'La mielina es la vaina que recubre el axón y acelera la conducción del impulso mediante saltos entre nodos de Ranvier.',type:'Función de la vaina de mielina'},
  {s:'El arco reflejo es la respuesta más rápida del cuerpo. No requiere cerebro: va del receptor a la médula espinal y regresa al efector.',type:'Arco reflejo: respuesta sin cerebro'},
  {s:'La dopamina es un neurotransmisor cuya pérdida en la sustancia negra del cerebro causa los temblores del Parkinson.',type:'Dopamina y enfermedad de Parkinson'},
  {s:'El cerebelo se ubica en la parte posterior del encéfalo y coordina el equilibrio, la postura y los movimientos precisos.',type:'Función del cerebelo'},
  {s:'El Alzheimer destruye progresivamente las neuronas y sus sinapsis. Es la causa más común de demencia en mayores de 65 años.',type:'Alzheimer: enfermedad neurodegenerativa'},
  {s:'El SNP incluye todos los nervios fuera del SNC: 12 pares craneales y 31 pares espinales que conectan el SNC con el resto del cuerpo.',type:'Sistema Nervioso Periférico (SNP)'},
  {s:'Los neurotransmisores son moléculas que cruzan el espacio sináptico: dopamina, serotonina, acetilcolina y GABA son los principales.',type:'Neurotransmisores en la sinapsis'},
  {s:'La médula espinal mide ~45 cm en adultos. Conduce impulsos entre el encéfalo y el cuerpo y procesa reflejos medulares.',type:'Médula espinal: conducción y reflejos'},
];
const classifyTaskDB=[
  {w:'Neurona',gen:'Unidad nerviosa',n:'86,000M en cerebro',g:'Todo el S. Nervioso',t:'Recibe, procesa y transmite impulsos eléctricos'},
  {w:'Cerebro',gen:'Parte del encéfalo',n:'~1,400 g',g:'Encéfalo (SNC)',t:'Pensamiento, memoria, lenguaje y movimiento voluntario'},
  {w:'Cerebelo',gen:'Parte del encéfalo',n:'Posterior al cerebro',g:'Encéfalo (SNC)',t:'Equilibrio, postura y movimientos finos'},
  {w:'Médula espinal',gen:'Parte del SNC',n:'~45 cm',g:'Columna vertebral',t:'Conduce impulsos y procesa reflejos medulares'},
  {w:'Mielina',gen:'Estructura neuronal',n:'Recubre el axón',g:'Neurona',t:'Acelera la conducción del impulso (conducción saltatoria)'},
  {w:'Sinapsis',gen:'Unión neuronal',n:'Entre 2 neuronas',g:'Todo el S. Nervioso',t:'Transmite el impulso mediante neurotransmisores'},
  {w:'Dopamina',gen:'Neurotransmisor',n:'En sustancia negra',g:'Cerebro (SNC)',t:'Movimiento y placer; su pérdida causa Parkinson'},
  {w:'Arco reflejo',gen:'Respuesta nerviosa',n:'Sin procesamiento cerebral',g:'Médula espinal',t:'Respuesta rápida e involuntaria a estímulos'},
];
const completeTaskDB=[
  {s:'La ___ es la unidad estructural y funcional del sistema nervioso.',opts:['sinapsis','neurona','mielina'],ans:'neurona'},
  {s:'El ___ coordina el equilibrio y los movimientos finos.',opts:['cerebro','tronco encefálico','cerebelo'],ans:'cerebelo'},
  {s:'La vaina de ___ acelera la conducción del impulso nervioso.',opts:['axón','sinapsis','mielina'],ans:'mielina'},
  {s:'El arco reflejo es procesado en la ___ espinal.',opts:['corteza','médula','sinapsis'],ans:'médula'},
  {s:'Las neuronas ___ llevan señales del SNC a los músculos.',opts:['sensoriales','interneuronas','motoras'],ans:'motoras'},
  {s:'El Alzheimer destruye ___ y sinapsis afectando la memoria.',opts:['neuronas','mielinas','ganglios'],ans:'neuronas'},
  {s:'La ___ es la sustancia que cruza el espacio sináptico.',opts:['mielina','hormona','dopamina'],ans:'dopamina'},
  {s:'El SNC está formado por el encéfalo y la ___ espinal.',opts:['corteza','médula','columna'],ans:'médula'},
];
const explainQuestions=[
  {q:'¿Cuáles son las principales partes del sistema nervioso? Describe el SNC y el SNP.',ans:'SNC: encéfalo (cerebro, cerebelo, tronco encefálico) y médula espinal. SNP: 12 pares craneales y 31 pares espinales que conectan el SNC con órganos, músculos y receptores.'},
  {q:'¿Cómo viaja el impulso nervioso desde un receptor hasta la respuesta muscular? Describe la ruta completa.',ans:'Receptor sensorial → Neurona sensorial → Médula espinal / Encéfalo → Interneurona → Neurona motora → Efector (músculo o glándula) → Respuesta.'},
  {q:'¿Qué es la sinapsis y cuál es el papel de los neurotransmisores en la transmisión del impulso?',ans:'La sinapsis es el espacio entre dos neuronas. Los neurotransmisores (dopamina, serotonina, acetilcolina) son liberados al espacio sináptico para activar la neurona siguiente.'},
  {q:'¿Cuáles son tres enfermedades del sistema nervioso y cómo afectan al organismo?',ans:'Alzheimer: destruye neuronas, causa demencia. Parkinson: pérdida de dopamina, temblores. Esclerosis múltiple: daña la mielina, altera la conducción. Epilepsia: descargas eléctricas anormales.'},
  {q:'¿Por qué es importante cuidar el sistema nervioso? Menciona al menos cuatro hábitos de cuidado.',ans:'Dormir 8-9 h (consolida memoria), ejercicio aeróbico (BDNF neuroprotector), lectura/aprendizaje (fortalece redes neuronales), evitar alcohol y drogas (neurotóxicos), usar casco (previene trauma craneal).'},
];
let ansVisible=false;
function genTask(){sfx('click');const type=document.getElementById('tgType').value;const count=parseInt(document.getElementById('tgCount').value);ansVisible=false;const out=document.getElementById('tgOut');out.innerHTML='';if(type==='identify')genIdentifyTask(out,count);else if(type==='classify')genClassifyTask(out,count);else if(type==='complete')genCompleteTask(out,count);else if(type==='explain')genExplainTask(out,count);fin('s-tareas');}
function _instrBlock(out,title,lines){const ib=document.createElement('div');ib.className='tg-instruction-block';ib.innerHTML=`<h4>📋 ${title}</h4>`+lines.map(l=>`<p>${l}</p>`).join('');out.appendChild(ib);}
function genIdentifyTask(out,count){_instrBlock(out,'Instrucción',['Copia en tu cuaderno; subraya, colorea o encierra el concepto del sistema nervioso indicado en cada oración. Escribe al lado qué tipo de elemento es.','<strong>Ejemplo:</strong> La dopamina regula el movimiento. → <span style="color:var(--jade);font-weight:700;">Neurotransmisor</span>']);_pick(identifyTaskDB,Math.min(count,identifyTaskDB.length)).forEach((item,i)=>{const div=document.createElement('div');div.className='tg-task';div.innerHTML=`<div class="tg-task-num">${i+1}</div><div class="tg-task-content"><strong>${item.s}</strong><div style="border-bottom:1.5px solid var(--border);min-width:220px;margin-top:0.5rem;height:1.3rem;">&nbsp;</div><div class="tg-answer">✅ ${item.type}</div></div>`;out.appendChild(div);});}
function genClassifyTask(out,count){_instrBlock(out,'Instrucción',['Copia la siguiente tabla en tu cuaderno. Para cada elemento del sistema nervioso, completa su tipo, características, ubicación y función.']);const items=_pick(classifyTaskDB,Math.min(count,classifyTaskDB.length));const wrap=document.createElement('div');wrap.style.overflowX='auto';const th=(t,extra='')=>`<th style="padding:0.3rem 0.4rem;border:1px solid var(--border);font-size:0.72rem;text-align:center;${extra}">${t}</th>`;let html=`<table style="width:100%;border-collapse:collapse;font-size:0.78rem;min-width:520px;"><thead><tr style="background:var(--pri-gl);">${th('Elemento','text-align:left;')}${th('Tipo')}${th('Características')}${th('Ubicación')}${th('Función')}</tr></thead><tbody>`;items.forEach(it=>{html+=`<tr><td style="padding:0.4rem 0.5rem;border:1px solid var(--border);font-weight:600;">${it.w}</td>`+Array(4).fill(`<td style="padding:0.4rem;border:1px solid var(--border);min-width:50px;"></td>`).join('')+'</tr>';});html+='</tbody></table>';wrap.innerHTML=html;out.appendChild(wrap);const ans=document.createElement('div');ans.className='tg-answer';ans.style.marginTop='0.8rem';ans.innerHTML='<strong>✅ Respuestas:</strong><br>'+items.map(it=>`<strong>${it.w}:</strong> Tipo: ${it.gen} | Características: ${it.n} | Ubicación: ${it.g} | Función: ${it.t}`).join('<br>');out.appendChild(ans);}
function genCompleteTask(out,count){_instrBlock(out,'Instrucción',['Copia y resuelve en tu cuaderno. Cada oración tiene un espacio ___. Elige y escribe la opción correcta.']);const pool=_shuffle([...completeTaskDB]);for(let i=0;i<count;i++){const item=pool[i%pool.length];const div=document.createElement('div');div.className='tg-task';const sent=item.s.replace('___','<span class="tg-blank" style="min-width:90px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');div.innerHTML=`<div class="tg-task-num">${i+1}</div><div class="tg-task-content"><strong>${sent}</strong><div style="margin-top:0.4rem;font-size:0.82rem;color:var(--gray);">📝 Opciones: <strong>${item.opts.join(' | ')}</strong></div><div class="tg-answer">✅ ${item.ans}</div></div>`;out.appendChild(div);}}
function genExplainTask(out,count){_instrBlock(out,'Instrucción',['Copia las siguientes preguntas en tu cuaderno y responde cada una de forma clara y completa.']);const pool=_shuffle([...explainQuestions]);for(let i=0;i<count;i++){const item=pool[i%pool.length];const div=document.createElement('div');div.className='tg-task';div.innerHTML=`<div class="tg-task-num">${i+1}</div><div class="tg-task-content"><strong>${item.q}</strong><div style="border-bottom:1.5px solid var(--border);min-width:200px;margin-top:0.5rem;height:1.3rem;">&nbsp;</div><div style="border-bottom:1.5px solid var(--border);min-width:200px;margin-top:0.3rem;height:1.3rem;">&nbsp;</div><div class="tg-answer">✅ ${item.ans}</div></div>`;out.appendChild(div);}}
function toggleAns(){ansVisible=!ansVisible;document.querySelectorAll('.tg-answer').forEach(el=>el.style.display=ansVisible?'block':'none');sfx('click');}

// ===================== SOPA DE LETRAS =====================
const sopaSets=[
  {size:10,grid:[
    ['N','U','E','R','O','N','A','X','Y','A'],
    ['P','Q','R','S','T','U','V','W','Z','X'],
    ['B','C','D','E','F','G','H','I','J','O'],
    ['C','E','R','E','B','R','O','K','L','N'],
    ['M','N','O','P','Q','R','S','T','U','V'],
    ['S','I','N','A','P','S','I','S','W','X'],
    ['Y','Z','A','B','C','D','E','F','G','H'],
    ['D','E','N','D','R','I','T','A','I','J'],
    ['K','L','M','N','O','P','Q','R','S','T'],
    ['M','I','E','L','I','N','A','U','V','W']
  ],words:[
    {w:'NEURONA',cells:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]]},
    {w:'AXON',cells:[[0,9],[1,9],[2,9],[3,9]]},
    {w:'CEREBRO',cells:[[3,0],[3,1],[3,2],[3,3],[3,4],[3,5],[3,6]]},
    {w:'SINAPSIS',cells:[[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[5,7]]},
    {w:'DENDRITA',cells:[[7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7]]},
    {w:'MIELINA',cells:[[9,0],[9,1],[9,2],[9,3],[9,4],[9,5],[9,6]]}
  ]},
  {size:10,grid:[
    ['C','E','R','E','B','E','L','O','Y','M'],
    ['Z','A','B','C','D','E','F','G','H','E'],
    ['I','J','K','L','M','N','O','P','Q','D'],
    ['N','E','R','V','I','O','R','S','T','U'],
    ['W','X','Y','Z','A','B','C','D','E','L'],
    ['R','E','F','L','E','J','O','F','G','A'],
    ['H','I','J','K','L','M','N','O','P','Q'],
    ['R','E','C','E','P','T','O','R','R','S'],
    ['T','U','V','W','X','Y','Z','A','B','C'],
    ['I','M','P','U','L','S','O','D','E','F']
  ],words:[
    {w:'CEREBELO',cells:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7]]},
    {w:'MEDULA',cells:[[0,9],[1,9],[2,9],[3,9],[4,9],[5,9]]},
    {w:'NERVIO',cells:[[3,0],[3,1],[3,2],[3,3],[3,4],[3,5]]},
    {w:'REFLEJO',cells:[[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6]]},
    {w:'RECEPTOR',cells:[[7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7]]},
    {w:'IMPULSO',cells:[[9,0],[9,1],[9,2],[9,3],[9,4],[9,5],[9,6]]}
  ]}
];
let currentSopaSetIdx=0,sopaFoundWords=new Set();
let sopaFirstClickCell=null,sopaPointerStartCell=null,sopaPointerMoved=false,sopaSelectedCells=[];
function getSopaCellSize(){const container=document.getElementById('sopaGrid');if(!container||!container.parentElement)return 28;const avail=container.parentElement.clientWidth-16;const set=sopaSets[currentSopaSetIdx];return Math.max(20,Math.min(32,Math.floor(avail/set.size)));}
function buildSopa(){const set=sopaSets[currentSopaSetIdx];const grid=document.getElementById('sopaGrid');grid.innerHTML='';const sz=getSopaCellSize();grid.style.gridTemplateColumns=`repeat(${set.size},${sz}px)`;grid.style.gridTemplateRows=`repeat(${set.size},${sz}px)`;sopaFirstClickCell=null;sopaSelectedCells=[];for(let r=0;r<set.size;r++)for(let c=0;c<set.size;c++){const cell=document.createElement('div');cell.className='sopa-cell';cell.style.width=sz+'px';cell.style.height=sz+'px';cell.style.fontSize=Math.max(11,sz-10)+'px';cell.textContent=set.grid[r][c];cell.dataset.row=r;cell.dataset.col=c;const alreadyFound=set.words.find(w=>sopaFoundWords.has(w.w)&&w.cells.some(([wr,wc])=>wr===r&&wc===c));if(alreadyFound)cell.classList.add('sopa-found');grid.appendChild(cell);}setupSopaEvents();const wl=document.getElementById('sopaWords');wl.innerHTML='';set.words.forEach(wObj=>{const sp=document.createElement('span');sp.className='sopa-w'+(sopaFoundWords.has(wObj.w)?' found':'');sp.id='sw-'+wObj.w;sp.textContent=wObj.w;wl.appendChild(sp);});}
function setupSopaEvents(){const grid=document.getElementById('sopaGrid');grid.onpointerdown=e=>{const cell=e.target.closest('.sopa-cell');if(!cell)return;e.preventDefault();grid.setPointerCapture(e.pointerId);sopaPointerStartCell=cell;sopaPointerMoved=false;cell.classList.add('sopa-sel');sopaSelectedCells=[cell];};grid.onpointermove=e=>{if(!sopaPointerStartCell)return;e.preventDefault();const el=document.elementFromPoint(e.clientX,e.clientY);const cell=el?el.closest('.sopa-cell'):null;if(!cell)return;const sr=parseInt(sopaPointerStartCell.dataset.row),sc=parseInt(sopaPointerStartCell.dataset.col);const er=parseInt(cell.dataset.row),ec=parseInt(cell.dataset.col);if(sr!==er||sc!==ec)sopaPointerMoved=true;document.querySelectorAll('.sopa-cell.sopa-sel').forEach(c=>c.classList.remove('sopa-sel'));sopaSelectedCells=[];getSopaPath(sr,sc,er,ec).forEach(([r,c])=>{const pc=document.querySelector(`#sopaGrid [data-row="${r}"][data-col="${c}"]`);if(pc){pc.classList.add('sopa-sel');sopaSelectedCells.push(pc);}});};grid.onpointerup=e=>{if(!sopaPointerStartCell)return;e.preventDefault();grid.releasePointerCapture(e.pointerId);if(sopaPointerMoved&&sopaSelectedCells.length>1){checkSopaSelection();}else{const cell=sopaPointerStartCell;document.querySelectorAll('.sopa-cell.sopa-sel').forEach(c=>c.classList.remove('sopa-sel'));sopaSelectedCells=[];if(!sopaFirstClickCell){sopaFirstClickCell=cell;cell.classList.add('sopa-start');}else if(sopaFirstClickCell===cell){cell.classList.remove('sopa-start');sopaFirstClickCell=null;}else{const sr=parseInt(sopaFirstClickCell.dataset.row),sc=parseInt(sopaFirstClickCell.dataset.col);const er=parseInt(cell.dataset.row),ec=parseInt(cell.dataset.col);sopaFirstClickCell.classList.remove('sopa-start');sopaFirstClickCell=null;getSopaPath(sr,sc,er,ec).forEach(([r,c])=>{const pc=document.querySelector(`#sopaGrid [data-row="${r}"][data-col="${c}"]`);if(pc){pc.classList.add('sopa-sel');sopaSelectedCells.push(pc);}});checkSopaSelection();}}sopaPointerStartCell=null;sopaPointerMoved=false;};}
function getSopaPath(r1,c1,r2,c2){const dr=Math.sign(r2-r1),dc=Math.sign(c2-c1);const lr=Math.abs(r2-r1),lc=Math.abs(c2-c1);if(lr!==0&&lc!==0&&lr!==lc)return[[r1,c1]];const len=Math.max(lr,lc);const path=[];for(let i=0;i<=len;i++)path.push([r1+dr*i,c1+dc*i]);return path;}
function checkSopaSelection(){const set=sopaSets[currentSopaSetIdx];const word=sopaSelectedCells.map(c=>c.textContent).join('');const wordRev=word.split('').reverse().join('');const found=set.words.find(wObj=>!sopaFoundWords.has(wObj.w)&&(wObj.w===word||wObj.w===wordRev));if(found){sopaFoundWords.add(found.w);found.cells.forEach(([r,c])=>{const cell=document.querySelector(`#sopaGrid [data-row="${r}"][data-col="${c}"]`);if(cell){cell.classList.remove('sopa-sel','sopa-start');cell.classList.add('sopa-found');}});const sp=document.getElementById('sw-'+found.w);if(sp)sp.classList.add('found');if(!xpTracker.sopa.has(found.w)){xpTracker.sopa.add(found.w);pts(1);}sfx('ok');if(sopaFoundWords.size===set.words.length){fin('s-sopa');sfx('fan');showToast('🎉 ¡Todas las palabras encontradas!');}else showToast('✅ ¡Encontraste: '+found.w+'!');}else sfx('no');document.querySelectorAll('.sopa-cell.sopa-sel').forEach(c=>c.classList.remove('sopa-sel'));sopaSelectedCells=[];}
function nextSopaSet(){sfx('click');sopaFoundWords=new Set();currentSopaSetIdx=(currentSopaSetIdx+1)%sopaSets.length;buildSopa();showToast('🔄 Nueva sopa cargada');}
let _sopaResizeTimer=null;
window.addEventListener('resize',()=>{clearTimeout(_sopaResizeTimer);_sopaResizeTimer=setTimeout(()=>{if(document.getElementById('s-sopa').classList.contains('active'))buildSopa();},200);});

// ===================== EVALUACIÓN FINAL =====================
const evalTFBank=[
  {q:'El cerebelo controla la memoria y el lenguaje.',a:false},
  {q:'La mielina acelera la conducción del impulso nervioso.',a:true},
  {q:'La médula espinal mide aproximadamente 45 cm en adultos.',a:true},
  {q:'El Sistema Nervioso Central está formado por el encéfalo y la médula espinal.',a:true},
  {q:'El arco reflejo pasa siempre por el cerebro antes de generar respuesta.',a:false},
  {q:'La dopamina es un neurotransmisor relacionado con el movimiento y el placer.',a:true},
  {q:'El SNP está formado por 12 pares de nervios craneales y 31 pares espinales.',a:true},
  {q:'La esclerosis múltiple destruye la vaina de mielina.',a:true},
  {q:'El tronco encefálico controla principalmente el equilibrio y la postura.',a:false},
  {q:'El Alzheimer es la principal causa de demencia a nivel mundial.',a:true},
  {q:'Las dendritas transmiten el impulso nervioso hacia otras células.',a:false},
  {q:'El cerebro humano contiene aproximadamente 86,000 millones de neuronas.',a:true},
  {q:'El sistema nervioso autónomo controla funciones voluntarias como caminar.',a:false},
  {q:'La epilepsia se caracteriza por descargas eléctricas anormales en el cerebro.',a:true},
  {q:'Las neuronas sensoriales llevan información del SNC hacia los músculos.',a:false},
];
const evalMCBank=[
  {q:'¿Qué parte del encéfalo controla el equilibrio y la coordinación?',o:['a) Cerebro','b) Médula espinal','c) Cerebelo','d) Tronco encefálico'],a:2},
  {q:'¿Cómo se llama la vaina que acelera la conducción del impulso nervioso?',o:['a) Sinapsis','b) Dendrita','c) Axón','d) Mielina'],a:3},
  {q:'¿Cuántos pares de nervios craneales tiene el Sistema Nervioso Periférico?',o:['a) 8 pares','b) 10 pares','c) 12 pares','d) 31 pares'],a:2},
  {q:'¿Qué neurotransmisor se relaciona con el movimiento y el placer?',o:['a) GABA','b) Serotonina','c) Acetilcolina','d) Dopamina'],a:3},
  {q:'¿Qué tipo de neurona lleva impulsos del SNC a los músculos?',o:['a) Sensorial','b) Interneurona','c) Motora','d) Aferente'],a:2},
  {q:'¿Qué enfermedad se caracteriza por pérdida de dopamina y temblores?',o:['a) Alzheimer','b) Parkinson','c) Epilepsia','d) Meningitis'],a:1},
  {q:'¿Qué estructura conecta los dos hemisferios del cerebro?',o:['a) Cerebelo','b) Tronco encefálico','c) Cuerpo calloso','d) Médula espinal'],a:2},
  {q:'¿A qué velocidad máxima viajan los impulsos en fibras mielinizadas?',o:['a) 30 m/s','b) 60 m/s','c) 90 m/s','d) 120 m/s'],a:3},
  {q:'¿Qué parte del encéfalo controla la respiración y el latido cardíaco?',o:['a) Cerebro','b) Cerebelo','c) Hipocampo','d) Tronco encefálico'],a:3},
  {q:'¿Cuántos pares de nervios espinales tiene el SNP?',o:['a) 12 pares','b) 21 pares','c) 31 pares','d) 42 pares'],a:2},
  {q:'¿Qué enfermedad daña la vaina de mielina afectando la conducción nerviosa?',o:['a) Alzheimer','b) Parkinson','c) Esclerosis múltiple','d) Epilepsia'],a:2},
  {q:'¿Qué es la sinapsis?',o:['a) Parte del axón','b) Espacio entre neuronas','c) Tipo de neurona','d) Vaina del axón'],a:1},
  {q:'¿Cuál es la unidad estructural y funcional del sistema nervioso?',o:['a) Sinapsis','b) Mielina','c) Neurona','d) Dendrita'],a:2},
  {q:'¿Qué parte del encéfalo controla el pensamiento y el lenguaje?',o:['a) Cerebelo','b) Tronco encefálico','c) Médula espinal','d) Cerebro'],a:3},
  {q:'¿Cuál es el tipo de neurona que recibe estímulos y los envía al SNC?',o:['a) Motora','b) Sensorial','c) Interneurona','d) Eferente'],a:1},
];
const evalCPBank=[
  {q:'La ___ es la unidad estructural y funcional del sistema nervioso.',a:'neurona'},
  {q:'La vaina de ___ acelera la conducción del impulso nervioso.',a:'mielina'},
  {q:'El SNP está formado por ___ pares de nervios craneales.',a:'12'},
  {q:'El ___ coordina el equilibrio y los movimientos finos.',a:'cerebelo'},
  {q:'La sinapsis química libera ___ para transmitir el impulso.',a:'neurotransmisores'},
  {q:'El arco reflejo es procesado en la ___ espinal.',a:'médula'},
  {q:'El Alzheimer destruye ___ y afecta la memoria progresivamente.',a:'neuronas'},
  {q:'El ___ es el neurotransmisor asociado al movimiento y el placer.',a:'dopamina'},
  {q:'Las neuronas ___ llevan información desde los receptores al SNC.',a:'sensoriales'},
  {q:'El tronco encefálico controla funciones vitales como la ___.',a:'respiración'},
  {q:'La esclerosis múltiple afecta la vaina de ___.',a:'mielina'},
  {q:'El sistema nervioso ___ controla funciones involuntarias.',a:'autónomo'},
  {q:'El cerebro está dividido en dos ___ separados por el cuerpo calloso.',a:'hemisferios'},
  {q:'La neurona tiene tres partes: soma, dendrita y ___.',a:'axón'},
  {q:'El Parkinson se produce por pérdida del neurotransmisor ___.',a:'dopamina'},
];
const evalPRBank=[
  {term:'Neurona',def:'Unidad estructural y funcional del sistema nervioso'},
  {term:'Sinapsis',def:'Espacio entre dos neuronas donde se transmite el impulso'},
  {term:'Mielina',def:'Vaina lipídica que acelera la conducción del impulso nervioso'},
  {term:'Cerebelo',def:'Coordina el equilibrio, la postura y los movimientos finos'},
  {term:'Arco reflejo',def:'Respuesta involuntaria rápida procesada en la médula espinal'},
  {term:'Dopamina',def:'Neurotransmisor del movimiento y el placer; su pérdida causa Parkinson'},
  {term:'SNC',def:'Sistema Nervioso Central: encéfalo más médula espinal'},
  {term:'SNP',def:'Sistema Nervioso Periférico: 12 pares craneales y 31 pares espinales'},
  {term:'Tronco encefálico',def:'Controla respiración, latido y presión arterial; une cerebro y médula'},
  {term:'Alzheimer',def:'Enfermedad neurodegenerativa progresiva; principal causa de demencia'},
  {term:'Axón',def:'Prolongación de la neurona que transmite el impulso hacia otras células'},
  {term:'Neurona sensorial',def:'Lleva impulsos aferentes desde los receptores hacia el SNC'},
  {term:'Médula espinal',def:'Conduce impulsos entre encéfalo y cuerpo; procesa reflejos medulares'},
  {term:'Esclerosis múltiple',def:'Enfermedad autoinmune que destruye la vaina de mielina'},
  {term:'Neurotransmisores',def:'Sustancias químicas de la sinapsis: dopamina, serotonina, acetilcolina'},
];

function genEval(){sfx('click');const cf=evalFormNum;window._currentEvalForm=cf;evalFormNum=(evalFormNum%10)+1;saveProgress();document.getElementById('eval-screen-title').textContent=`🎓 Evaluación Final · Forma ${cf} · El Sistema Nervioso`;evalAnsVisible=false;const out=document.getElementById('evalOut');out.innerHTML='';const bar=document.createElement('div');bar.className='eval-score-bar';bar.innerHTML=`<div><div class="esb-title">📊 Distribución de puntaje · 100 puntos</div><div class="esb-dist">Cada sección vale 25 puntos (5 preguntas × 5 pts)</div></div><div style="display:flex;gap:0.4rem;flex-wrap:wrap;"><span class="eval-score-pill esp-cp">Completar 25 pts</span><span class="eval-score-pill esp-tf">V/F 25 pts</span><span class="eval-score-pill esp-mc">Selección 25 pts</span><span class="eval-score-pill esp-pr">Pareados 25 pts</span></div>`;out.appendChild(bar);const cpItems=_pick(evalCPBank,5);const s1=document.createElement('div');s1.innerHTML='<div class="eval-section-title">I. Completar el espacio <span class="eval-pts">25 pts · 5 pts c/u</span></div>';cpItems.forEach((item,i)=>{const d=document.createElement('div');d.className='eval-item eval-auto-item';d.dataset.evalType='cp';d.dataset.evalIndex=i;const qHtml=item.q.replace('___',`<input class="eval-cp-input" type="text" data-cp="${i}" autocomplete="off">`);d.innerHTML=`<div class="eval-q"><span class="eval-num">${i+1}</span><span class="eval-q-text">${qHtml}</span></div><div class="eval-answer">${item.a}</div><div class="eval-item-feedback" id="evalFbCp${i}" aria-live="polite"></div>`;s1.appendChild(d);});out.appendChild(s1);const tfItems=_pick(evalTFBank,5);const s2=document.createElement('div');s2.innerHTML='<div class="eval-section-title">II. Verdadero o Falso <span class="eval-pts">25 pts · 5 pts c/u</span></div>';tfItems.forEach((item,i)=>{const d=document.createElement('div');d.className='eval-item eval-auto-item';d.dataset.evalType='tf';d.dataset.evalIndex=i;d.innerHTML=`<div class="eval-q"><span class="eval-num">${i+6}</span><span class="eval-q-text">${item.q}</span></div><div class="eval-tf-opts"><label class="eval-tf-opt"><input type="radio" name="tf${i}" value="true"> Verdadero</label><label class="eval-tf-opt"><input type="radio" name="tf${i}" value="false"> Falso</label></div><div class="eval-answer">${item.a?'Verdadero':'Falso'}</div><div class="eval-item-feedback" id="evalFbTf${i}" aria-live="polite"></div>`;s2.appendChild(d);});out.appendChild(s2);const mcItems=_pick(evalMCBank,5);const s3=document.createElement('div');s3.innerHTML='<div class="eval-section-title">III. Selección Múltiple <span class="eval-pts">25 pts · 5 pts c/u</span></div>';mcItems.forEach((item,i)=>{const d=document.createElement('div');d.className='eval-item eval-auto-item';d.dataset.evalType='mc';d.dataset.evalIndex=i;const optsHtml=item.o.map((op,oi)=>`<label class="eval-mc-opt"><input type="radio" name="mc${i}" value="${oi}"> ${op}</label>`).join('');d.innerHTML=`<div class="eval-q"><span class="eval-num">${i+11}</span><span class="eval-q-text">${item.q}</span></div><div class="eval-mc-opts">${optsHtml}</div><div class="eval-answer">${item.o[item.a]}</div><div class="eval-item-feedback" id="evalFbMc${i}" aria-live="polite"></div>`;s3.appendChild(d);});out.appendChild(s3);const prItems=_pick(evalPRBank,5);const shuffledDefs=[...prItems].sort(()=>Math.random()-0.5);const letters=['A','B','C','D','E'];const s4=document.createElement('div');s4.innerHTML='<div class="eval-section-title">IV. Términos Pareados <span class="eval-pts">25 pts · 5 pts c/u</span></div>';const matchCard=document.createElement('div');matchCard.className='eval-item';let colLeft='<div class="eval-match-col"><h4>📌 Términos</h4>';prItems.forEach((item,i)=>{colLeft+=`<div class="eval-match-item"><span class="eval-match-letter">${i+16}.</span> <select class="eval-match-select" data-pr="${i}" aria-label="Respuesta pareada ${i+16}"><option value="">—</option>${letters.map(l=>`<option value="${l}">${l}</option>`).join('')}</select> ${item.term}</div>`;});colLeft+='</div>';let colRight='<div class="eval-match-col"><h4>🔑 Definiciones</h4>';shuffledDefs.forEach((item,i)=>{colRight+=`<div class="eval-match-item"><span class="eval-match-letter">${letters[i]}.</span> ${item.def}</div>`;});colRight+='</div>';const ansKey=prItems.map((item,i)=>{const letter=letters[shuffledDefs.findIndex(d=>d.def===item.def)];return`${i+16}→${letter}`;}).join(' · ');matchCard.innerHTML=`<div class="eval-match-grid">${colLeft}${colRight}</div><div class="eval-answer" style="display:none;">${ansKey}</div><div class="eval-item-feedback" id="evalFbPr" aria-live="polite"></div>`;s4.appendChild(matchCard);out.appendChild(s4);window._evalPrintData={tf:tfItems,mc:mcItems,cp:cpItems,pr:{terms:prItems,shuffledDefs,letters}};const autoPanel=document.createElement('div');autoPanel.id='evalAutoResult';autoPanel.className='eval-auto-result';autoPanel.innerHTML='<strong>🧮 Evaluación interactiva:</strong> responde en pantalla y presiona <em>Calificar prueba</em>. La impresión conserva el formato original sin respuestas digitadas.';out.appendChild(autoPanel);fin('s-evaluacion');}
function toggleEvalAns(){evalAnsVisible=!evalAnsVisible;document.querySelectorAll('#evalOut .eval-answer').forEach(el=>el.style.display=evalAnsVisible?'block':'none');sfx('click');}
function normalizeEvalAnswer(v){return(v||'').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').replace(/[()]/g,'').trim();}
function isCpCorrect(student,expected){const s=normalizeEvalAnswer(student);const e=normalizeEvalAnswer(expected);if(!s)return false;const variants=new Set([e]);if(e.includes(' '))e.split(' ').forEach(x=>x&&variants.add(x));return variants.has(s)||e.replace(/[^a-z0-9]/g,'')===s.replace(/[^a-z0-9]/g,'');}
function setEvalFeedback(id,ok,msg){const el=document.getElementById(id);if(!el)return;el.textContent=msg;el.className='eval-item-feedback '+(ok?'eval-ok':'eval-no');}
function gradeEval(){if(!window._evalPrintData){showToast('⚠️ Genera una evaluación primero');return;}sfx('click');const d=window._evalPrintData;let total=0;const detail={cp:0,tf:0,mc:0,pr:0};d.cp.forEach((it,i)=>{const input=document.querySelector(`[data-cp="${i}"]`);const ok=isCpCorrect(input?input.value:'',it.a);if(input){input.classList.toggle('eval-input-ok',ok);input.classList.toggle('eval-input-no',!ok);}if(ok){detail.cp++;total+=5;}setEvalFeedback('evalFbCp'+i,ok,ok?'Correcto. +5 pts':'Revisar. Respuesta esperada: '+it.a);});d.tf.forEach((it,i)=>{const selected=document.querySelector(`input[name="tf${i}"]:checked`);const ok=!!selected&&(selected.value==='true')===it.a;if(ok){detail.tf++;total+=5;}setEvalFeedback('evalFbTf'+i,ok,ok?'Correcto. +5 pts':'Revisar. Respuesta esperada: '+(it.a?'Verdadero':'Falso'));});d.mc.forEach((it,i)=>{const selected=document.querySelector(`input[name="mc${i}"]:checked`);const ok=!!selected&&Number(selected.value)===it.a;if(ok){detail.mc++;total+=5;}setEvalFeedback('evalFbMc'+i,ok,ok?'Correcto. +5 pts':'Revisar. Respuesta esperada: '+it.o[it.a]);});const expectedLetters=d.pr.terms.map(it=>d.pr.letters[d.pr.shuffledDefs.findIndex(df=>df.def===it.def)]);expectedLetters.forEach((letter,i)=>{const sel=document.querySelector(`[data-pr="${i}"]`);const ok=!!sel&&sel.value===letter;if(sel){sel.classList.toggle('eval-input-ok',ok);sel.classList.toggle('eval-input-no',!ok);}if(ok){detail.pr++;total+=5;}});const prMsg=`Pareados: ${detail.pr}/5 correctos. ${detail.pr===5?'Excelente. +25 pts':'Clave: '+expectedLetters.map((l,i)=>(i+16)+'→'+l).join(' · ')}`;setEvalFeedback('evalFbPr',detail.pr===5,prMsg);const result=document.getElementById('evalAutoResult');if(result){result.className='eval-auto-result '+(total>=70?'eval-auto-pass':'eval-auto-risk');result.innerHTML=`<strong>Resultado automático: ${total}/100 puntos</strong><br><span>Completar: ${detail.cp*5}/25 · V/F: ${detail.tf*5}/25 · Selección: ${detail.mc*5}/25 · Pareados: ${detail.pr*5}/25</span><br><em>Este resultado es solo para revisión en pantalla; la impresión conserva el formato limpio para papel.</em>`;}if(total>=70){pts(8);showToast('🎯 Evaluación calificada: '+total+'/100');}else showToast('🧮 Evaluación calificada: '+total+'/100. Revisa las respuestas marcadas.');}
function printEval(){if(!window._evalPrintData){showToast('⚠️ Genera una evaluación primero');return;}sfx('click');const forma=window._currentEvalForm||1;const d=window._evalPrintData;let s1=`<div class="sec-title"><span>I. Completar el espacio</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 25%</span></div></div>`;d.cp.forEach((it,i)=>{const q=it.q.replace('___','<span class="cp-blank"></span>');s1+=`<div class="cp-row"><span class="qn">${i+1}.</span><span class="cp-text">${q}</span></div>`;});let s2=`<div class="sec-title"><span>II. Verdadero o Falso</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 25%</span></div></div>`;d.tf.forEach((it,i)=>{s2+=`<div class="tf-row"><span class="qn">${i+6}.</span><span class="tf-blank"></span><span class="tf-text">${it.q}</span></div>`;});let s3=`<div class="sec-title"><span>III. Selección Múltiple</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 25%</span></div></div><div class="mc-grid">`;d.mc.forEach((it,i)=>{const opts=it.o.map((op,oi)=>`<label class="mc-opt"><input type="radio" name="mcp${i}"> ${op}</label>`).join('');s3+=`<div class="mc-item"><div class="mc-q"><span class="qn">${i+11}.</span><span>${it.q}</span></div><div class="mc-opts">${opts}</div></div>`;});s3+=`</div>`;let colL='<div class="pr-col"><div class="pr-head">📌 Términos</div>';d.pr.terms.forEach((it,i)=>{colL+=`<div class="pr-item"><span class="pr-num">${i+16}.</span><span class="pr-line"></span>${it.term}</div>`;});colL+='</div>';let colR='<div class="pr-col"><div class="pr-head">🔑 Definiciones</div>';d.pr.shuffledDefs.forEach((it,i)=>{colR+=`<div class="pr-item"><span class="pr-num">${d.pr.letters[i]}.</span>${it.def}</div>`;});colR+='</div>';let s4=`<div class="pr-section"><div class="sec-title"><span>IV. Términos Pareados</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 25%</span></div></div><div class="pr-grid">${colL}${colR}</div></div>`;let pR='';pR+=`<div class="p-sec"><div class="p-ttl">I. Completar</div><table class="p-tbl">`;d.cp.forEach((it,i)=>{pR+=`<tr><td class="pn">${i+1}.</td><td class="pa">${it.a}</td></tr>`;});pR+=`</table></div><div class="p-sec"><div class="p-ttl">II. V o F</div><table class="p-tbl">`;d.tf.forEach((it,i)=>{pR+=`<tr><td class="pn">${i+6}.</td><td class="pa">${it.a?'V':'F'}</td></tr>`;});pR+=`</table></div><div class="p-sec"><div class="p-ttl">III. Selección</div><table class="p-tbl">`;d.mc.forEach((it,i)=>{pR+=`<tr><td class="pn">${i+11}.</td><td class="pa">${it.o[it.a]}</td></tr>`;});pR+=`</table></div><div class="p-sec"><div class="p-ttl">IV. Pareados</div><table class="p-tbl">`;d.pr.terms.forEach((it,i)=>{const l=d.pr.letters[d.pr.shuffledDefs.findIndex(df=>df.def===it.def)];pR+=`<tr><td class="pn">${i+16}.</td><td class="pa">${i+16}→${l}</td></tr>`;});pR+=`</table></div>`;const doc=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Evaluación El Sistema Nervioso · Forma ${forma}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#111;background:#fff;padding:1mm 5mm;}.ph{margin-bottom:0.3rem;}.ph h2{font-size:11pt;font-weight:700;text-align:center;margin-bottom:0.2rem;}.ph-line{display:flex;align-items:baseline;gap:5px;margin-bottom:3px;}.ph-fill{flex:1;border-bottom:1px solid #555;min-height:12px;display:block;}.ph-m{display:inline-block;min-width:80px;border-bottom:1px solid #555;}.ph-s{display:inline-block;min-width:52px;border-bottom:1px solid #555;}.ph-xs{display:inline-block;min-width:36px;border-bottom:1px solid #555;}.ph-crit{font-size:9.5pt;text-align:center;color:#555;margin-top:0.1rem;}.sec-title{font-size:10.5pt;font-weight:700;padding:0.12rem 0.4rem;margin:0.22rem 0 0.1rem;display:flex;justify-content:space-between;align-items:center;border-left:4px solid #27ae60;background:#e8f8f5;color:#27ae60;}.obt-row{display:flex;align-items:baseline;gap:4px;font-size:9.5pt;font-weight:700;font-style:italic;color:#27ae60;}.obt-lbl{white-space:nowrap;}.obt-line{display:inline-block;min-width:58px;border-bottom:1.5px solid #27ae60;height:12px;}.obt-pct{white-space:nowrap;}.qn{font-weight:700;min-width:22px;flex-shrink:0;}.tf-row{display:flex;align-items:baseline;gap:0.3rem;font-size:10.5pt;line-height:1.3;padding:0.13rem 0.2rem;border-bottom:1px solid #eee;}.tf-blank{display:inline-block;min-width:40px;border-bottom:1.5px solid #111;flex-shrink:0;margin:0 0.18rem;}.tf-text{flex:1;}.mc-item{border:1px solid #ddd;border-radius:4px;padding:0.14rem 0.35rem;margin-bottom:0.1rem;break-inside:avoid;page-break-inside:avoid;}.mc-q{font-size:10.5pt;line-height:1.3;display:flex;gap:0.28rem;margin-bottom:0.07rem;}.mc-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.1rem 0.5rem;}.mc-opts{display:grid;grid-template-columns:repeat(4,1fr);gap:0.04rem 0.15rem;margin-left:0.8rem;}.mc-opt{font-size:9pt;display:flex;align-items:center;gap:0.15rem;}.mc-opt input{width:10px;height:10px;flex-shrink:0;}.cp-row{display:flex;align-items:baseline;gap:0.3rem;font-size:10.5pt;line-height:1.3;padding:0.13rem 0.2rem;border-bottom:1px solid #eee;}.cp-text{flex:1;}.cp-blank{display:inline-block;min-width:150px;border-bottom:1.5px solid #111;margin:0 0.12rem;}.pr-section{margin-top:0.1rem;}.pr-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.08rem 0.4rem;margin-top:0.08rem;}.pr-head{font-size:9pt;font-weight:700;color:#555;margin-bottom:0.1rem;}.pr-item{font-size:10.5pt;padding:0.1rem 0.28rem;background:#e8f8f5;border-radius:3px;margin-bottom:0.07rem;display:flex;align-items:center;gap:0.2rem;line-height:1.2;break-inside:avoid;page-break-inside:avoid;}.pr-num{font-weight:700;color:#27ae60;min-width:19px;flex-shrink:0;}.pr-line{display:inline-block;min-width:19px;border-bottom:1.5px solid #111;margin-right:0.14rem;flex-shrink:0;}.total-row{display:flex;align-items:baseline;justify-content:flex-start;margin-left:20%;gap:7px;font-size:11pt;font-weight:700;font-style:italic;margin-top:0.22rem;padding:0.15rem 0;page-break-before:avoid;break-before:avoid;color:#27ae60;}.total-row .obt-line{min-width:80px;border-bottom:1.5px solid #27ae60;}.pauta-wrap{page-break-before:always;padding-top:0.4rem;}.p-head{border-bottom:2px solid #333;padding-bottom:0.3rem;margin-bottom:0.4rem;text-align:center;}.p-main{font-size:9.5pt;font-weight:700;}.p-sub{font-size:7pt;color:#c00;font-weight:700;margin:0.08rem 0;}.p-meta{font-size:7pt;color:#555;}.p-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.4rem 0.9rem;}.p-sec{border:1px solid #ccc;border-radius:4px;padding:0.25rem 0.4rem;}.p-ttl{font-size:8pt;font-weight:700;border-bottom:1px solid #ddd;padding-bottom:0.1rem;margin-bottom:0.15rem;}.p-tbl{width:100%;border-collapse:collapse;font-size:7.5pt;}.p-tbl tr{border-bottom:1px dotted #ddd;}.p-tbl td{padding:0.07rem 0.12rem;vertical-align:top;}.pn{font-weight:700;width:16px;color:#555;}.pa{color:#007a00;font-weight:600;}.forma-tag{position:fixed;bottom:5mm;right:6mm;font-size:7pt;color:#555;border:1px solid #bbb;padding:1px 5px;border-radius:3px;background:white;}@media print{@page{size:letter portrait;margin:12.7mm;}}</style></head><body><div class="ph"><h2>Evaluación Final · El Sistema Nervioso · II y III Ciclo · Ciencias Naturales</h2><div class="ph-line"><strong>Nombre:</strong><span class="ph-fill">&nbsp;</span><strong>Fecha:</strong><span class="ph-m">&nbsp;</span></div><div class="ph-line"><strong>Instituto:</strong><span class="ph-fill">&nbsp;</span><strong>Grado y Sección:</strong><span class="ph-s">&nbsp;</span><strong>Nº Lista:</strong><span class="ph-xs">&nbsp;</span></div><p class="ph-crit">Valor total: 100 puntos · Cada respuesta vale 5 puntos</p></div>${s1}${s2}${s3}${s4}<div class="total-row"><span>Total, obtenido</span><span class="obt-line"></span><span>de 100%</span></div><div class="pauta-wrap"><div class="p-head"><div class="p-main">✅ PAUTA — Evaluación Final · El Sistema Nervioso · Forma ${forma}</div><div class="p-sub">Documento exclusivo del docente · No distribuir al estudiante</div><div class="p-meta">Valor total: 100 pts | 4 secciones × 5 preguntas × 5 pts c/u</div></div><div class="p-grid">${pR}</div></div><div class="forma-tag">Forma ${forma}</div></body></html>`;const win=window.open('','_blank','');if(!win){showToast('⚠️ Activa las ventanas emergentes para imprimir');return;}win.document.write(doc);win.document.close();setTimeout(()=>win.print(),400);}

// ===================== PRUEBA DE PENSAMIENTO CRÍTICO =====================
function evalSwitchMode(mode){
  sfx('click');
  const cWrap=document.getElementById('evalConceptWrap'),critWrap=document.getElementById('evalCritWrap');
  const cBtn=document.getElementById('evalModeBtnConcept'),critBtn=document.getElementById('evalModeBtnCrit');
  if(mode==='crit'){
    cWrap.style.display='none';critWrap.style.display='block';
    cBtn.classList.remove('active');cBtn.setAttribute('aria-selected','false');
    critBtn.classList.add('active');critBtn.setAttribute('aria-selected','true');
    if(!window._evalCritData)genEvalCrit();
  }else{
    critWrap.style.display='none';cWrap.style.display='block';
    critBtn.classList.remove('active');critBtn.setAttribute('aria-selected','false');
    cBtn.classList.add('active');cBtn.setAttribute('aria-selected','true');
  }
}

const critCaseBank=[
  {txt:'Daniela toca accidentalmente una taza muy caliente y retira la mano de inmediato, antes de pensar conscientemente en lo ocurrido.'},
  {txt:'Carlos pisa sin darse cuenta un vidrio roto y levanta el pie de inmediato, antes de sentir el dolor por completo.'},
  {txt:'A Sofía le llega de golpe una luz muy brillante a los ojos y parpadea rápidamente sin proponérselo.'},
  {txt:'Luis toca por error una plancha caliente mientras dobla la ropa y retira la mano al instante, antes de darse cuenta del calor.'},
  {txt:'El médico golpea suavemente la rodilla de Mario con un martillo de reflejos y su pierna se extiende sola, sin que él lo decida.'},
  {txt:'Ana se acerca demasiado a una olla con agua hirviendo y aparta la mano apenas siente el vapor caliente sobre su piel.'},
];
const critCaseQuestions=[
  '1. Explica qué ocurrió en su sistema nervioso desde el estímulo hasta la respuesta.',
  '2. ¿Por qué reaccionó antes de "pensarlo" conscientemente?',
  '3. ¿Qué partes del sistema nervioso participaron en esta respuesta?',
  '4. ¿Qué habría pasado si la médula espinal no pudiera enviar la respuesta correctamente?',
];
const critCaseGuides=[
  'El estímulo activa un receptor sensorial → la neurona sensorial lleva el impulso a la médula espinal → una interneurona lo procesa y lo envía por una neurona motora → el músculo (efector) se contrae y aleja la parte del cuerpo.',
  'Porque es un reflejo: la respuesta se procesa directamente en la médula espinal sin esperar a que el cerebro interprete la sensación, lo que la hace mucho más rápida que una respuesta consciente.',
  'Receptor sensorial, neurona sensorial, médula espinal (con interneurona), neurona motora y efector (músculo).',
  'No habría reflejo: la señal tendría que viajar hasta el cerebro y regresar, lo cual es más lento, así que el cuerpo permanecería en contacto con el estímulo dañino más tiempo y la lesión sería mayor.',
];

const critErrorBank=[
  {txt:'"El cerebro controla todos los reflejos del cuerpo. Cuando una persona se quema, primero piensa en el dolor y luego la médula espinal decide mover la mano."',
   g1:'No todos los reflejos pasan por el cerebro: el arco reflejo se procesa directamente en la médula espinal.',
   g2:'El orden está invertido: primero la médula espinal genera la respuesta motora (retirar la mano) y solo después el cerebro percibe el dolor.'},
  {txt:'"Las neuronas motoras llevan la información de los sentidos hacia el cerebro, mientras que las neuronas sensoriales llevan las órdenes hacia los músculos."',
   g1:'Las funciones están invertidas: las neuronas sensoriales (aferentes) llevan la información de los sentidos hacia el SNC.',
   g2:'Las neuronas motoras (eferentes) son las que llevan las órdenes del SNC hacia los músculos, no al revés.'},
  {txt:'"El cerebelo es el encargado de pensar, recordar y tomar decisiones, mientras que el cerebro solo se encarga de mantener el equilibrio."',
   g1:'El cerebro (corteza cerebral) es el que controla el pensamiento, la memoria y la toma de decisiones, no el cerebelo.',
   g2:'El cerebelo es el que coordina el equilibrio, la postura y los movimientos finos, no el cerebro.'},
  {txt:'"La médula espinal forma parte del Sistema Nervioso Periférico, y los nervios craneales pertenecen al Sistema Nervioso Central."',
   g1:'La médula espinal es parte del Sistema Nervioso Central (SNC), junto con el encéfalo.',
   g2:'Los nervios craneales son parte del Sistema Nervioso Periférico (SNP), no del SNC.'},
  {txt:'"El sistema nervioso simpático calma el cuerpo después de una situación de estrés, mientras que el parasimpático lo activa en momentos de peligro."',
   g1:'El sistema simpático es el que activa al cuerpo ante el peligro o el estrés ("lucha o huye"), no lo calma.',
   g2:'El sistema parasimpático es el que calma y restaura al cuerpo después del estrés ("descanso y digestión"), no lo activa.'},
  {txt:'"La falta de acetilcolina causa la enfermedad de Parkinson, y la dopamina es la encargada de contraer los músculos esqueléticos."',
   g1:'El Parkinson es causado por la pérdida de dopamina, no por la falta de acetilcolina.',
   g2:'La acetilcolina es el neurotransmisor encargado de la contracción muscular voluntaria, no la dopamina.'},
];

const critDecisionBank=[
  'Un estudiante duerme poco, pasa muchas horas con videojuegos, no desayuna bien y casi no hace ejercicio. En clase se muestra distraído, irritable y con dificultad para recordar.',
  'Un joven pasa todo el día frente al celular, se acuesta muy tarde, no practica ningún deporte y consume muchas bebidas energizantes. Se queja de dolores de cabeza frecuentes y falta de concentración.',
  'Una persona anda en bicicleta sin casco todos los días, fuma cigarrillos de forma ocasional y rara vez duerme las horas necesarias. Sus amigos notan que reacciona más lento de lo normal.',
  'Un estudiante trasnocha estudiando la noche antes de los exámenes, no hace pausas activas durante el día y casi no lee. Le cuesta mantener la atención en clase.',
  'Una persona trabaja muchas horas frente a la computadora sin descansos, no hace ejercicio físico y duerme menos de 5 horas cada noche. Presenta cambios de humor frecuentes.',
];
const critDecisionGuide='Debe proponer 3 cambios concretos relacionados con los hábitos de cuidado del sistema nervioso (dormir 8–9 h, hacer ejercicio físico, alimentarse bien, leer/aprender, evitar el exceso de pantallas, evitar alcohol/drogas/estimulantes, usar casco, manejar el estrés) y explicar con sus palabras por qué cada cambio ayuda a la salud del sistema nervioso.';

const critCompareBank=[
  {a:'Una persona olvida nombres, lugares y conversaciones recientes, y su confusión empeora con el tiempo.',b:'Una persona tiene temblores en reposo, rigidez muscular y dificultad para iniciar movimientos.',
   ga:'Alzheimer — afecta principalmente la memoria y las funciones cognitivas (destruye neuronas y sinapsis).',
   gb:'Parkinson — afecta principalmente el movimiento, por la pérdida de dopamina en el cerebro.',
   gr:'No son el mismo problema porque afectan funciones distintas del sistema nervioso (memoria/cognición vs. control motor) y tienen causas diferentes (degeneración relacionada con la memoria vs. falta de dopamina).'},
  {a:'Una persona sufre descargas eléctricas anormales en el cerebro que producen convulsiones repentinas.',b:'Una persona presenta debilidad muscular progresiva y problemas de visión por daño a la vaina de mielina.',
   ga:'Epilepsia — afecta la actividad eléctrica normal de las neuronas cerebrales.',
   gb:'Esclerosis múltiple — afecta la conducción del impulso nervioso al dañar la mielina.',
   gr:'No son el mismo problema: una altera la actividad eléctrica del cerebro (descargas anormales) y la otra daña la estructura que acelera la conducción del impulso (la mielina).'},
  {a:'Una persona presenta fiebre alta, rigidez de cuello y dolor de cabeza intenso por inflamación de las meninges.',b:'Una persona presenta pérdida progresiva de la memoria y confusión que empeora con los años.',
   ga:'Meningitis — es una infección/inflamación de las meninges que rodean el SNC.',
   gb:'Alzheimer — es una enfermedad neurodegenerativa que destruye neuronas relacionadas con la memoria.',
   gr:'No son el mismo problema: una es una infección aguda que inflama las membranas del SNC y la otra es una degeneración progresiva y crónica de las neuronas.'},
  {a:'Una persona tiene temblor en reposo y mucha dificultad para iniciar sus movimientos.',b:'Una persona sufre episodios breves de pérdida de conciencia acompañados de movimientos involuntarios.',
   ga:'Parkinson — afecta el control del movimiento por falta de dopamina.',
   gb:'Epilepsia — afecta la actividad eléctrica normal del cerebro.',
   gr:'No son el mismo problema: uno es un trastorno progresivo del movimiento por falta de un neurotransmisor, y el otro es un trastorno episódico causado por descargas eléctricas anormales.'},
];

const critCauseBank=[
  {cause:'Una persona duerme pocas horas varios días seguidos.',guide:'Bajo rendimiento, falta de concentración, irritabilidad y dificultad para consolidar la memoria (el sistema nervioso no logra descansar ni repararse).'},
  {cause:'Una persona anda en bicicleta sin casco y cae fuertemente.',guide:'Riesgo de traumatismo craneal y posible daño al tejido cerebral.'},
  {cause:'Una persona consume alcohol en exceso de forma constante.',guide:'Daño a las neuronas (especialmente del cerebelo), pérdida de coordinación y deterioro cognitivo progresivo.'},
  {cause:'Una persona pasa muchas horas frente a pantallas sin descanso.',guide:'Fatiga visual, dolores de cabeza y alteración del sueño, lo que afecta el descanso del sistema nervioso.'},
];
const critEffectBank=[
  {effect:'Retira la mano rápidamente.',guide:'Tocó algo muy caliente o doloroso: se activó un arco reflejo ante un estímulo nocivo.'},
  {effect:'Tiene dificultad para mantener el equilibrio.',guide:'Posible daño o mal funcionamiento del cerebelo.'},
  {effect:'Olvida conversaciones y nombres recientes.',guide:'Degeneración de neuronas relacionadas con la memoria, como ocurre en el Alzheimer.'},
  {effect:'Sufre convulsiones repentinas e involuntarias.',guide:'Descargas eléctricas anormales en el cerebro, como ocurre en la epilepsia.'},
];

function genEvalCrit(){
  sfx('click');
  const cf=evalCritFormNum;window._currentEvalCritForm=cf;evalCritFormNum=(evalCritFormNum%10)+1;saveProgress();
  document.getElementById('evalcrit-screen-title').textContent=`🧠 Pensamiento Crítico · Forma ${cf} · El Sistema Nervioso`;
  evalCritAnsVisible=false;
  const out=document.getElementById('evalCritOut');out.innerHTML='';

  const kase=_pick(critCaseBank,1)[0];
  const s1=document.createElement('div');
  s1.innerHTML=`<div class="eval-section-title">I. Caso de análisis: el reflejo nervioso <span class="eval-pts">20 pts</span></div><div class="eval-item"><div class="crit-scenario">${kase.txt}</div>${critCaseQuestions.map((q,i)=>`<div class="crit-q-block"><div class="crit-q-label">${q}</div><textarea class="crit-textarea" rows="2" aria-label="${q}"></textarea><div class="crit-pauta">${critCaseGuides[i]}</div></div>`).join('')}<div class="crit-selfscore"><label for="critScore0">Obtenido:</label><input type="number" id="critScore0" class="crit-score-input" data-score="0" min="0" max="20" value="0"> <span>de 20 pts</span></div></div>`;
  out.appendChild(s1);

  const err=_pick(critErrorBank,1)[0];
  const s2=document.createElement('div');
  s2.innerHTML=`<div class="eval-section-title">II. Corrige el error <span class="eval-pts">20 pts</span></div><div class="eval-item"><div class="crit-scenario">${err.txt}</div><p style="font-size:0.85rem;margin-bottom:0.5rem;">Identifica <strong>dos errores</strong> y corrígelos con tus propias palabras:</p><div class="crit-q-block"><div class="crit-q-label">Error 1 y su corrección:</div><textarea class="crit-textarea" rows="2" aria-label="Error 1 y su corrección"></textarea><div class="crit-pauta">${err.g1}</div></div><div class="crit-q-block"><div class="crit-q-label">Error 2 y su corrección:</div><textarea class="crit-textarea" rows="2" aria-label="Error 2 y su corrección"></textarea><div class="crit-pauta">${err.g2}</div></div><div class="crit-selfscore"><label for="critScore1">Obtenido:</label><input type="number" id="critScore1" class="crit-score-input" data-score="1" min="0" max="20" value="0"> <span>de 20 pts</span></div></div>`;
  out.appendChild(s2);

  const dec=_pick(critDecisionBank,1)[0];
  const s3=document.createElement('div');
  s3.innerHTML=`<div class="eval-section-title">III. Toma de decisiones: cuidar el sistema nervioso <span class="eval-pts">20 pts</span></div><div class="eval-item"><div class="crit-scenario">${dec}</div><div class="crit-q-block"><div class="crit-q-label">¿Qué tres cambios recomendarías para cuidar mejor su sistema nervioso? Explica por qué ayudaría cada cambio.</div><textarea class="crit-textarea" rows="4" aria-label="Tres cambios recomendados y su justificación"></textarea><div class="crit-pauta">${critDecisionGuide}</div></div><div class="crit-selfscore"><label for="critScore2">Obtenido:</label><input type="number" id="critScore2" class="crit-score-input" data-score="2" min="0" max="20" value="0"> <span>de 20 pts</span></div></div>`;
  out.appendChild(s3);

  const cmp=_pick(critCompareBank,1)[0];
  const s4=document.createElement('div');
  s4.innerHTML=`<div class="eval-section-title">IV. Comparación razonada <span class="eval-pts">20 pts</span></div><div class="eval-item"><div class="crit-compare-grid"><div class="crit-compare-box"><h5>Caso A</h5>${cmp.a}</div><div class="crit-compare-box"><h5>Caso B</h5>${cmp.b}</div></div><div class="crit-q-block"><div class="crit-q-label">1. ¿Qué enfermedad podría relacionarse con cada caso? 2. ¿Qué función del sistema nervioso parece afectada en cada uno? 3. ¿Por qué no son el mismo problema?</div><textarea class="crit-textarea" rows="4" aria-label="Comparación razonada de los casos A y B"></textarea><div class="crit-pauta">Caso A: ${cmp.ga} · Caso B: ${cmp.gb} · ${cmp.gr}</div></div><div class="crit-selfscore"><label for="critScore3">Obtenido:</label><input type="number" id="critScore3" class="crit-score-input" data-score="3" min="0" max="20" value="0"> <span>de 20 pts</span></div></div>`;
  out.appendChild(s4);

  const causes=_pick(critCauseBank,2),effects=_pick(critEffectBank,3);
  let ceRows='';
  causes.forEach((it,i)=>{ceRows+=`<div class="crit-ce-item"><div class="crit-ce-row"><div class="crit-ce-cell crit-ce-given"><span class="crit-ce-tag">Causa</span>${it.cause}</div><div class="crit-ce-cell"><span class="crit-ce-tag">Efecto</span><textarea class="crit-textarea" rows="2" aria-label="Efecto de: ${it.cause}" placeholder="Escribe el efecto..."></textarea></div></div><div class="crit-pauta">${it.guide}</div></div>`;});
  effects.forEach((it,i)=>{ceRows+=`<div class="crit-ce-item"><div class="crit-ce-row"><div class="crit-ce-cell"><span class="crit-ce-tag">Causa</span><textarea class="crit-textarea" rows="2" aria-label="Causa de: ${it.effect}" placeholder="Escribe la causa..."></textarea></div><div class="crit-ce-cell crit-ce-given"><span class="crit-ce-tag">Efecto</span>${it.effect}</div></div><div class="crit-pauta">${it.guide}</div></div>`;});
  const s5=document.createElement('div');
  s5.innerHTML=`<div class="eval-section-title">V. Análisis de causas y efectos <span class="eval-pts">20 pts</span></div><div class="eval-item">${ceRows}<div class="crit-selfscore"><label for="critScore4">Obtenido:</label><input type="number" id="critScore4" class="crit-score-input" data-score="4" min="0" max="20" value="0"> <span>de 20 pts</span></div></div>`;
  out.appendChild(s5);

  window._evalCritData={kase,err,dec,cmp,causes,effects};
  const totalPanel=document.createElement('div');totalPanel.id='evalCritTotalResult';totalPanel.className='crit-total-panel';totalPanel.innerHTML='<strong>🧮 Autoevaluación:</strong> responde cada sección, compara con la <em>Pauta</em> y anota tu puntaje (0–20) en cada casilla. Luego presiona <em>Calcular Total</em>.';out.appendChild(totalPanel);
  fin('s-evaluacion');
}
function toggleEvalCritAns(){evalCritAnsVisible=!evalCritAnsVisible;document.querySelectorAll('#evalCritOut .crit-pauta').forEach(el=>el.style.display=evalCritAnsVisible?'block':'none');sfx('click');}
function calcCritTotal(){
  if(!window._evalCritData){showToast('⚠️ Genera una prueba primero');return;}
  sfx('click');
  let total=0;
  document.querySelectorAll('#evalCritOut .crit-score-input').forEach(inp=>{let v=parseInt(inp.value)||0;v=Math.max(0,Math.min(20,v));inp.value=v;total+=v;});
  const panel=document.getElementById('evalCritTotalResult');
  if(panel){panel.className='crit-total-panel '+(total>=70?'eval-auto-pass':'eval-auto-risk');panel.innerHTML=`<strong>Puntaje total autoevaluado: ${total}/100</strong><br><em>Compara siempre tus respuestas con la Pauta antes de anotar el puntaje de cada sección.</em>`;}
  const formKey='crit_'+(window._currentEvalCritForm||1);
  if(total>=70){if(!xpTracker.wgt.has(formKey)){xpTracker.wgt.add(formKey);pts(8);}showToast('🎯 Pensamiento crítico: '+total+'/100');}
  else showToast('🧮 Puntaje registrado: '+total+'/100. ¡Sigue practicando!');
}
function printEvalCrit(){
  if(!window._evalCritData){showToast('⚠️ Genera una prueba primero');return;}
  sfx('click');
  const forma=window._currentEvalCritForm||1;const d=window._evalCritData;
  const lines=(n)=>Array(n).fill('<div class="ln"></div>').join('');
  let s1=`<div class="sec-title"><span>I. Caso de análisis: el reflejo nervioso</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 20</span></div></div><p class="crit-print-scenario">${d.kase.txt}</p>`;
  critCaseQuestions.forEach(q=>{s1+=`<p class="crit-print-q">${q}</p>${lines(1)}`;});
  let s2=`<div class="sec-title"><span>II. Corrige el error</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 20</span></div></div><p class="crit-print-scenario">${d.err.txt}</p><p class="crit-print-q">Identifica dos errores y corrígelos con tus propias palabras:</p><p class="crit-print-q"><strong>Error 1:</strong></p>${lines(1)}<p class="crit-print-q"><strong>Error 2:</strong></p>${lines(1)}`;
  let s3=`<div class="sec-title"><span>III. Toma de decisiones: cuidar el sistema nervioso</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 20</span></div></div><p class="crit-print-scenario">${d.dec}</p><p class="crit-print-q">¿Qué tres cambios recomendarías para cuidar mejor su sistema nervioso? Explica por qué cada cambio ayudaría.</p>${lines(2)}`;
  let s4=`<div class="sec-title"><span>IV. Comparación razonada</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 20</span></div></div><div class="crit-compare-print-grid"><div class="crit-compare-print-box"><strong>Caso A:</strong> ${d.cmp.a}</div><div class="crit-compare-print-box"><strong>Caso B:</strong> ${d.cmp.b}</div></div><p class="crit-print-q">1. ¿Qué enfermedad podría relacionarse con cada caso? 2. ¿Qué función del sistema nervioso parece afectada en cada uno? 3. ¿Por qué no son el mismo problema?</p>${lines(2)}`;
  let ceTbl='<table class="crit-print-tbl"><tr><th>Causa</th><th>Efecto</th></tr>';
  d.causes.forEach(it=>{ceTbl+=`<tr><td>${it.cause}</td><td></td></tr>`;});
  d.effects.forEach(it=>{ceTbl+=`<tr><td></td><td>${it.effect}</td></tr>`;});
  ceTbl+='</table>';
  let s5=`<div class="sec-title"><span>V. Análisis de causas y efectos</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 20</span></div></div>${ceTbl}`;
  let pR='';
  pR+=`<div class="p-sec"><div class="p-ttl">I. Caso</div>${critCaseQuestions.map((q,i)=>`<div class="p-crit-line"><strong>${i+1}.</strong> ${critCaseGuides[i]}</div>`).join('')}</div>`;
  pR+=`<div class="p-sec"><div class="p-ttl">II. Corrige el error</div><div class="p-crit-line"><strong>Error 1:</strong> ${d.err.g1}</div><div class="p-crit-line"><strong>Error 2:</strong> ${d.err.g2}</div></div>`;
  pR+=`<div class="p-sec"><div class="p-ttl">III. Toma de decisiones</div><div class="p-crit-line">${critDecisionGuide}</div></div>`;
  pR+=`<div class="p-sec"><div class="p-ttl">IV. Comparación</div><div class="p-crit-line"><strong>Caso A:</strong> ${d.cmp.ga}</div><div class="p-crit-line"><strong>Caso B:</strong> ${d.cmp.gb}</div><div class="p-crit-line">${d.cmp.gr}</div></div>`;
  pR+=`<div class="p-sec" style="grid-column:1/-1;"><div class="p-ttl">V. Causas y efectos</div>${d.causes.map(it=>`<div class="p-crit-line"><strong>Causa:</strong> ${it.cause} → <strong>Efecto:</strong> ${it.guide}</div>`).join('')}${d.effects.map(it=>`<div class="p-crit-line"><strong>Efecto:</strong> ${it.effect} → <strong>Causa:</strong> ${it.guide}</div>`).join('')}</div>`;
  const doc=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Pensamiento Crítico El Sistema Nervioso · Forma ${forma}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#111;background:#fff;padding:1mm 5mm;}.ph{margin-bottom:0.3rem;}.ph h2{font-size:11pt;font-weight:700;text-align:center;margin-bottom:0.2rem;}.ph-line{display:flex;align-items:baseline;gap:5px;margin-bottom:3px;}.ph-fill{flex:1;border-bottom:1px solid #555;min-height:12px;display:block;}.ph-m{display:inline-block;min-width:80px;border-bottom:1px solid #555;}.ph-s{display:inline-block;min-width:52px;border-bottom:1px solid #555;}.ph-xs{display:inline-block;min-width:36px;border-bottom:1px solid #555;}.ph-crit{font-size:9.5pt;text-align:center;color:#555;margin-top:0.1rem;}.sec-title{font-size:10.5pt;font-weight:700;padding:0.1rem 0.4rem;margin:0.2rem 0 0.1rem;display:flex;justify-content:space-between;align-items:center;border-left:4px solid #27ae60;background:#e8f8f5;color:#27ae60;}.obt-row{display:flex;align-items:baseline;gap:4px;font-size:9.5pt;font-weight:700;font-style:italic;color:#27ae60;}.obt-lbl{white-space:nowrap;}.obt-line{display:inline-block;min-width:50px;border-bottom:1.5px solid #27ae60;height:12px;}.obt-pct{white-space:nowrap;}.crit-print-scenario{font-size:10.5pt;background:#e8f8f5;border-left:3px solid #27ae60;padding:0.2rem 0.5rem;margin:0.1rem 0 0.2rem;line-height:1.3;}.crit-print-q{font-size:10pt;font-weight:600;margin:0.15rem 0 0.08rem;line-height:1.25;}.ln{border-bottom:1px solid #111;min-height:12px;margin-bottom:2px;}.crit-compare-print-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin:0.15rem 0;}.crit-compare-print-box{font-size:9.5pt;background:#e8f8f5;border-radius:4px;padding:0.25rem 0.4rem;line-height:1.25;}.crit-print-tbl{width:100%;border-collapse:collapse;font-size:9.5pt;margin-top:0.15rem;}.crit-print-tbl th,.crit-print-tbl td{border:1px solid #999;padding:0.3rem 0.45rem;text-align:left;height:30px;vertical-align:middle;}.crit-print-tbl th{background:#e8f8f5;}.pauta-wrap{page-break-before:always;padding-top:0.4rem;}.p-head{border-bottom:2px solid #333;padding-bottom:0.3rem;margin-bottom:0.4rem;text-align:center;}.p-main{font-size:9.5pt;font-weight:700;}.p-sub{font-size:7pt;color:#c00;font-weight:700;margin:0.08rem 0;}.p-meta{font-size:7pt;color:#555;}.p-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.4rem 0.9rem;}.p-sec{border:1px solid #ccc;border-radius:4px;padding:0.3rem 0.45rem;}.p-ttl{font-size:8pt;font-weight:700;border-bottom:1px solid #ddd;padding-bottom:0.1rem;margin-bottom:0.18rem;}.p-crit-line{font-size:7.5pt;color:#007a00;margin-bottom:0.18rem;line-height:1.35;}.total-row{display:flex;align-items:baseline;justify-content:flex-start;margin-left:20%;gap:7px;font-size:11pt;font-weight:700;font-style:italic;margin-top:0.2rem;padding:0.1rem 0;color:#27ae60;}.total-row .obt-line{min-width:80px;border-bottom:1.5px solid #27ae60;}.forma-tag{position:fixed;bottom:5mm;right:6mm;font-size:7pt;color:#555;border:1px solid #bbb;padding:1px 5px;border-radius:3px;background:white;}@media print{@page{size:letter portrait;margin:12.7mm;}}</style></head><body><div class="ph"><h2>Evaluación Competencial · Pensamiento Crítico · El Sistema Nervioso · II y III Ciclo · Ciencias Naturales</h2><div class="ph-line"><strong>Nombre:</strong><span class="ph-fill">&nbsp;</span><strong>Fecha:</strong><span class="ph-m">&nbsp;</span></div><div class="ph-line"><strong>Institución:</strong><span class="ph-fill">&nbsp;</span><strong>Grado y Sección:</strong><span class="ph-s">&nbsp;</span><strong>Nº Lista:</strong><span class="ph-xs">&nbsp;</span></div><p class="ph-crit">Valor total: 100 puntos · 5 secciones de 20 puntos</p></div>${s1}${s2}${s3}${s4}${s5}<div class="total-row"><span>Total, obtenido</span><span class="obt-line"></span><span>de 100</span></div><div class="pauta-wrap"><div class="p-head"><div class="p-main">✅ PAUTA — Pensamiento Crítico · El Sistema Nervioso · Forma ${forma}</div><div class="p-sub">Documento exclusivo del docente · No distribuir al estudiante</div><div class="p-meta">Valor total: 100 pts | 5 secciones × 20 pts c/u — respuesta abierta, usar como guía de corrección</div></div><div class="p-grid">${pR}</div></div><div class="forma-tag">Forma ${forma}</div></body></html>`;
  const win=window.open('','_blank','');
  if(!win){showToast('⚠️ Activa las ventanas emergentes para imprimir');return;}
  win.document.write(doc);win.document.close();setTimeout(()=>win.print(),400);
}

// ===================== LABORATORIO DEL SISTEMA NERVIOSO =====================
const parteData={
  cerebro:{
    nombre:'Cerebro',icon:'🧠',
    estructura:{title:'Estructura',info:'• <strong>Dos hemisferios</strong> separados por el cuerpo calloso<br>• <strong>Corteza cerebral</strong>: capa externa (sustancia gris) con lóbulos frontal, parietal, temporal y occipital<br>• <strong>Sustancia blanca</strong>: fibras mielinizadas internas<br>• <strong>Hipocampo</strong>: clave para la formación de memorias<br>• <strong>Amígdala</strong>: regula emociones y respuesta al miedo<br>• Peso adulto: ~1,400 g'},
    funcion:{title:'Función',info:'• Lóbulo <strong>frontal</strong>: personalidad, razonamiento, planificación y movimiento voluntario<br>• Lóbulo <strong>parietal</strong>: integra información táctil y espacial<br>• Lóbulo <strong>temporal</strong>: memoria, audición y lenguaje<br>• Lóbulo <strong>occipital</strong>: procesamiento visual<br>• <strong>Hipocampo</strong>: formación de nuevos recuerdos a largo plazo<br>• <strong>Córtex motor</strong>: controla todos los movimientos voluntarios del cuerpo'},
    enfermedades:{title:'Enfermedades',info:'• <strong>Alzheimer</strong>: pérdida de neuronas y sinapsis; demencia progresiva<br>• <strong>ACV (derrame cerebral)</strong>: obstrucción o ruptura de vasos cerebrales<br>• <strong>Tumor cerebral</strong>: crecimiento anormal de células en el tejido nervioso<br>• <strong>Traumatismo craneal</strong>: golpe que lesiona el tejido nervioso<br>• <strong>Epilepsia</strong>: descargas eléctricas anormales en la corteza cerebral'},
    cuidados:{title:'Cuidados',info:'• <strong>Dormir 8–9 h</strong>: el sueño consolida la memoria y elimina desechos<br>• <strong>Ejercicio aeróbico</strong>: libera BDNF, promueve la neurogénesis<br>• <strong>Dieta equilibrada</strong>: omega-3, antioxidantes y vitaminas del grupo B<br>• <strong>Aprendizaje continuo</strong>: fortalece la plasticidad neuronal<br>• <strong>Evitar alcohol y drogas</strong>: son directamente neurotóxicos<br>• <strong>Control del estrés</strong>: el cortisol crónico daña el hipocampo'}
  },
  cerebelo:{
    nombre:'Cerebelo',icon:'⚖️',
    estructura:{title:'Estructura',info:'• Ubicado en la <strong>fosa craneal posterior</strong>, debajo del cerebro<br>• Dividido en dos hemisferios cerebelosos y el <strong>vermis</strong> central<br>• <strong>Corteza cerebelosa</strong>: tres capas con células de Purkinje<br>• Sustancia blanca con forma de "árbol de la vida"<br>• Conectado al tronco encefálico por tres pares de <strong>pedúnculos cerebelosos</strong>'},
    funcion:{title:'Función',info:'• <strong>Coordinación motora</strong>: afina y sincroniza cada movimiento<br>• <strong>Equilibrio y postura</strong>: integra señales del oído interno y músculos<br>• <strong>Aprendizaje motor</strong>: automatiza movimientos (escribir, andar en bici)<br>• No inicia movimientos: <strong>corrige errores en tiempo real</strong><br>• Recibe información de la corteza cerebral y la devuelve corregida al cuerpo'},
    enfermedades:{title:'Enfermedades',info:'• <strong>Ataxia</strong>: pérdida de coordinación y marcha inestable<br>• <strong>Disartria cerebelosa</strong>: habla irregular y entrecortada<br>• <strong>Temblor de intención</strong>: aparece al acercar la mano a un objeto<br>• <strong>Tumores</strong>: meduloblastoma (más frecuente en niños)<br>• <strong>Alcoholismo</strong>: el alcohol es especialmente tóxico para las células de Purkinje'},
    cuidados:{title:'Cuidados',info:'• <strong>Evitar el alcohol</strong>: daña directamente las células del cerebelo<br>• <strong>Deportes de equilibrio</strong>: gimnasia, yoga, natación, baile<br>• <strong>Proteger la cabeza</strong>: casco en bicicleta, moto y deportes de contacto<br>• <strong>Fisioterapia</strong>: recupera la coordinación tras lesiones cerebelosas<br>• <strong>Diagnóstico temprano</strong> de ataxia para intervención rehabilitadora rápida'}
  },
  medula:{
    nombre:'Médula espinal',icon:'🦴',
    estructura:{title:'Estructura',info:'• <strong>Longitud</strong>: ~45 cm en adultos; del bulbo a la 2ª vértebra lumbar<br>• Sección en "H": sustancia gris central (neuronas) rodeada de sustancia blanca (fibras)<br>• <strong>Astas anteriores</strong>: neuronas motoras (eferentes)<br>• <strong>Astas posteriores</strong>: neuronas sensoriales (aferentes)<br>• Envuelta por las tres meninges: duramadre, aracnoides y piamadre<br>• <strong>31 pares de nervios espinales</strong> salen por los forámenes vertebrales'},
    funcion:{title:'Función',info:'• <strong>Conducción ascendente</strong>: lleva impulsos sensoriales del cuerpo al encéfalo<br>• <strong>Conducción descendente</strong>: lleva órdenes motoras del encéfalo a los músculos<br>• <strong>Reflejos medulares</strong>: respuestas rápidas sin intervención cerebral<br>• Ejemplo: retirar la mano al quemarse; reflejo rotuliano (patelar)<br>• Centro de integración para funciones autónomas básicas'},
    enfermedades:{title:'Enfermedades',info:'• <strong>Lesión medular</strong>: paraplejía (piernas) o cuadriplejía (brazos y piernas)<br>• <strong>ELA (Esclerosis Lateral Amiotrófica)</strong>: destruye neuronas motoras<br>• <strong>Hernia discal</strong>: comprime nervios espinales causando dolor irradiado<br>• <strong>Poliomielitis</strong>: virus que destruye neuronas motoras del asta anterior<br>• <strong>Mielitis transversa</strong>: inflamación del cordón medular'},
    cuidados:{title:'Cuidados',info:'• <strong>Postura correcta</strong>: evitar curvaturas excesivas de la columna vertebral<br>• <strong>Casco y cinturón de seguridad</strong>: el trauma es la causa más frecuente de lesión<br>• <strong>Ejercicio de fortalecimiento</strong>: músculos que sostienen y protegen la columna<br>• <strong>Ergonomía</strong>: pantalla al nivel de los ojos; silla con respaldo lumbar<br>• <strong>No saltar de cabeza</strong> en aguas poco profundas: riesgo de fractura cervical'}
  },
  snp:{
    nombre:'Sistema Nervioso Periférico (SNP)',icon:'🔌',
    estructura:{title:'Estructura',info:'• <strong>12 pares de nervios craneales</strong>: olfatorio, óptico, oculomotor, troclear, trigémino, abducens, facial, vestibulococlear, glosofaríngeo, vago, accesorio, hipogloso<br>• <strong>31 pares de nervios espinales</strong>: 8 cervicales, 12 torácicos, 5 lumbares, 5 sacros, 1 coccígeo<br>• <strong>Ganglios nerviosos</strong>: acúmulos de cuerpos neuronales fuera del SNC<br>• División <strong>somática</strong>: músculos esqueléticos (voluntaria)<br>• División <strong>autónoma</strong>: simpática (activa) y parasimpática (calma)'},
    funcion:{title:'Función',info:'• <strong>Nervios aferentes</strong>: llevan información sensorial al SNC (dolor, temperatura, tacto, vista, oído…)<br>• <strong>Nervios eferentes</strong>: llevan órdenes del SNC a los efectores<br>• <strong>Simpático</strong>: "lucha o huye" — acelera corazón, dilata pupilas, inhibe digestión<br>• <strong>Parasimpático</strong>: "descanso y digestión" — calma corazón, estimula digestión<br>• Regula también reflejos autónomos: micción, secreción de glándulas'},
    enfermedades:{title:'Enfermedades',info:'• <strong>Neuropatía periférica</strong>: daño a nervios periféricos; hormigueo, ardor, debilidad<br>• <strong>Síndrome del túnel carpiano</strong>: compresión del nervio mediano en la muñeca<br>• <strong>Neuralgia del trigémino</strong>: dolor facial intenso por irritación del V par craneal<br>• <strong>Guillain-Barré</strong>: enfermedad autoinmune que destruye mielina de nervios periféricos<br>• <strong>Herpes zóster</strong>: reactiva el virus varicela en ganglios espinales'},
    cuidados:{title:'Cuidados',info:'• <strong>Control de la diabetes</strong>: la glucemia alta daña los nervios periféricos<br>• <strong>Evitar posiciones compresivas</strong> prolongadas (cruzar piernas, apoyar codo)<br>• <strong>Nutrición</strong>: vitaminas B1, B6 y B12 son esenciales para la salud nerviosa<br>• <strong>Vacunación</strong>: vacuna contra herpes zóster en mayores de 50 años<br>• <strong>Ejercicio regular</strong>: mejora la circulación y la conducción nerviosa periférica'}
  }
};
let labParte='cerebro',labAspecto='estructura';
function labShowParte(parteKey){labParte=parteKey;updateLabDisplay();document.querySelectorAll('.lab-cont-btn').forEach(b=>b.classList.remove('active-pri'));const btn=document.querySelector(`[data-parte="${parteKey}"]`);if(btn)btn.classList.add('active-pri');if(typeof sfx==='function')sfx('click');}
function labShowAspecto(aspectoKey){labAspecto=aspectoKey;updateLabDisplay();document.querySelectorAll('.lab-asp-btn').forEach(b=>b.classList.remove('active-sec'));const btn=document.querySelector(`[data-aspecto="${aspectoKey}"]`);if(btn)btn.classList.add('active-sec');if(typeof sfx==='function')sfx('click');}
function updateLabDisplay(){const data=parteData[labParte];const asp=data[labAspecto];document.getElementById('lab-sentence').innerHTML=`🧠 Explorando: <strong>${data.nombre}</strong> → <strong>${asp.title}</strong>`;document.getElementById('lab-display').innerHTML=`<div class="lab-cont-header">${data.icon} ${data.nombre}</div><div class="lab-asp-title">${asp.title}</div><div class="lab-asp-info">${asp.info}</div>`;}

// ===================== DIPLOMA =====================
function _diplPct(){return xp>=MXP?100:Math.round((xp/MXP)*100);}
function openDiploma(){sfx('fan');const pct=_diplPct();document.getElementById('diplPct').textContent=pct+'%';document.getElementById('diplBar').style.width=pct+'%';document.getElementById('diplDate').textContent='Fecha: '+new Date().toLocaleDateString('es-HN',{year:'numeric',month:'long',day:'numeric'});const msgs=['¡Sigue aprendiendo!','¡Muy buen trabajo!','¡Excelente neurocientífico!','¡Eres un experto en neurociencia!','¡Maestro del Sistema Nervioso!'];document.getElementById('diplMsg').textContent=msgs[Math.min(Math.floor(pct/25),4)];const stars=['⭐','⭐⭐','⭐⭐⭐'];document.getElementById('diplStars').textContent=stars[Math.min(Math.floor(pct/40),2)];const achTxt=unlockedAch.map(id=>ACHIEVEMENTS[id].icon+' '+ACHIEVEMENTS[id].label).join(' · ');document.getElementById('diplAch').textContent=achTxt||'Sigue completando secciones para desbloquear logros';document.getElementById('diplomaOverlay').classList.add('open');launchConfetti();}
function closeDiploma(){document.getElementById('diplomaOverlay').classList.remove('open');}
function updateDiplomaName(v){document.getElementById('diplName').textContent=v||'Estudiante';}
function shareWA(){const name=document.getElementById('diplName').textContent||'Estudiante';const pct=_diplPct();const msg=`🧠 ¡${name} completó la Misión "El Sistema Nervioso"! 🏅 Progreso: ${pct}% · 🔬 policastsapien.com`;window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');}
async function captureDiploma(){if(typeof html2canvas==='undefined'){showToast('⚠️ Cargando... intenta de nuevo');return;}sfx('click');const card=document.querySelector('.diploma-card');const btn=document.querySelector('.diploma-actions .btn-pri');const toHide=[card.querySelector('.diploma-input'),card.querySelector('.diploma-actions'),card.querySelector('hr')];if(btn){btn.disabled=true;btn.textContent='⏳ Capturando...';}toHide.forEach(el=>{if(el)el.style.display='none';});let dataUrl='';try{const canvas=await html2canvas(card,{scale:2,useCORS:true,backgroundColor:'#ffffff'});toHide.forEach(el=>{if(el)el.style.display='';});dataUrl=canvas.toDataURL('image/png');const name=(document.getElementById('diplName').textContent||'Estudiante').replace(/\s+/g,'-');const fileName='constancia-'+name+'.png';const cap=window.Capacitor;if(cap&&cap.isNativePlatform&&cap.isNativePlatform()&&cap.Plugins?.Filesystem&&cap.Plugins?.Share){const base64Data=dataUrl.split(',')[1];const result=await cap.Plugins.Filesystem.writeFile({path:fileName,data:base64Data,directory:'CACHE'});await cap.Plugins.Share.share({url:result.uri,dialogTitle:'Guardar / Compartir Constancia'});}else{const a=document.createElement('a');a.href=dataUrl;a.download=fileName;a.click();}}catch(e){toHide.forEach(el=>{if(el)el.style.display='';});if(e.name!=='AbortError')showToast('⚠️ No se pudo guardar la constancia');}finally{if(btn){btn.disabled=false;btn.textContent='📷 Guardar foto';}}}

// ===================== INIT =====================
window.addEventListener('DOMContentLoaded',()=>{
  initTheme();
  loadProgress();
  upFC();
  buildQz();
  showQz();
  buildClass();
  showId();
  showCmp();
  updateRetoButtons();
  buildRoute();
  showNeuron();
  showNeuro();
  showEnfer();
  updateLabDisplay();
  document.querySelector('[data-parte="cerebro"]')?.classList.add('active-pri');
  document.querySelector('[data-aspecto="estructura"]')?.classList.add('active-sec');
  renderAchPanel();
});
