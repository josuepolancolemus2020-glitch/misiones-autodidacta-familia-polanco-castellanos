function compartirMision(){const url=window.location.href;const texto=`🚀 *Misión Asignada* 🚀\n\nEstudia la vida y obra de Karl Popper y sobresale en Filosofía. 🏆\n\nDesbloquea *todos los logros* y envía a tu profesor la *constancia de logro* cuando hayas culminado. 📋\n\n_Incluye evaluación conceptual y prueba de pensamiento crítico._ ✍️\n\n🔗 *Enlace:* ${url}`;window.open('https://wa.me/?text='+encodeURIComponent(texto),'_blank');}
function toggleLetra(){document.body.classList.toggle('letra-grande');if(typeof sfx==='function')sfx('click');localStorage.setItem('preferenciaLetra',document.body.classList.contains('letra-grande'));}
window.addEventListener('DOMContentLoaded',()=>{if(localStorage.getItem('preferenciaLetra')==='true')document.body.classList.add('letra-grande');});

// ===================== UTILIDADES =====================
const _pick=(arr,n)=>[...arr].sort(()=>Math.random()-0.5).slice(0,n);
const _shuffle=(arr)=>[...arr].sort(()=>Math.random()-0.5);
function fb(id,msg,isOk){const el=document.getElementById(id);if(el){el.textContent=msg;el.className='fb show '+(isOk?'ok':'err');}}

// ===================== VARIABLES GLOBALES =====================
const SAVE_KEY='karl_popper_v1';
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
  primer_quiz:{icon:'🧠',label:'Primer quiz sobre Popper superado'},
  flash_master:{icon:'🃏',label:'Todas las flashcards de Popper exploradas'},
  clasif_pro:{icon:'🗂️',label:'Clasificador de conceptos popperianos experto'},
  id_master:{icon:'🔍',label:'Identificador de conceptos clave maestro'},
  reto_hero:{icon:'🏆',label:'Héroe del reto de clasificación rápida'},
  nivel3:{icon:'💡',label:'¡Conjeturador! Nivel 3'},
  nivel5:{icon:'🦉',label:'¡Epistemólogo! Nivel 6'},
  widgets_master:{icon:'🧩',label:'Widgets de Karl Popper dominados'}
};
function unlockAchievement(id){if(unlockedAch.includes(id))return;unlockedAch.push(id);sfx('ach');showToast(ACHIEVEMENTS[id].icon+' ¡Logro desbloqueado! '+ACHIEVEMENTS[id].label);launchConfetti();renderAchPanel();saveProgress();}
function renderAchPanel(){const list=document.getElementById('achList');list.innerHTML='';Object.entries(ACHIEVEMENTS).forEach(([id,a])=>{const div=document.createElement('div');div.className='ach-item'+(unlockedAch.includes(id)?'':' locked');div.innerHTML=`<span class="ach-icon">${a.icon}</span><span>${a.label}</span>`;list.appendChild(div);});}
function toggleAchPanel(){sfx('click');document.getElementById('achPanel').classList.toggle('open');}
function showToast(msg){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);}t.textContent=msg;t.style.display='block';clearTimeout(t._tid);t._tid=setTimeout(()=>t.style.display='none',3200);}
function launchConfetti(){const colors=['#3b3a86','#5b5ac9','#b8860b','#d4a017','#00b894'];for(let i=0;i<60;i++){const c=document.createElement('div');c.className='confetti-piece';c.style.cssText=`left:${Math.random()*100}vw;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${0.8+Math.random()*1.5}s;animation-delay:${Math.random()*0.4}s;width:${6+Math.random()*6}px;height:${6+Math.random()*6}px;border-radius:${Math.random()>0.5?'50%':'2px'};`;document.body.appendChild(c);c.addEventListener('animationend',()=>c.remove());}}

// ===================== XP =====================
const lvls=[{t:0,n:'Aprendiz ✏️'},{t:25,n:'Lector Crítico 📖'},{t:55,n:'Conjeturador 💡'},{t:90,n:'Refutador 🎯'},{t:130,n:'Racionalista Crítico 🧭'},{t:165,n:'Epistemólogo 🦉'},{t:190,n:'Maestro Popperiano 🏆'}];
function pts(n){xp=Math.max(0,Math.min(MXP,xp+n));updateXPBar();saveProgress();}
function updateXPBar(){const pct=Math.round((xp/MXP)*100);document.getElementById('xpFill').style.width=pct+'%';const el=document.getElementById('xpPts');el.textContent='⭐ '+xp;el.style.transform='scale(1.3)';setTimeout(()=>el.style.transform='',300);let lv=0;for(let i=0;i<lvls.length;i++)if(xp>=lvls[i].t)lv=i;document.getElementById('xpLvl').textContent=lvls[lv].n;if(lv!==prevLevel){if(lv>=2)unlockAchievement('nivel3');if(lv>=5)unlockAchievement('nivel5');prevLevel=lv;}}
function resetXP(){sfx('click');xp=0;updateXPBar();showToast('🔄 XP reiniciado a 0');}
function fin(id,showFX=true){if(!done.has(id)){done.add(id);const b=document.querySelector(`[data-s="${id}"]`);if(b)b.classList.add('done');if(showFX){sfx('up');launchConfetti();}saveProgress();}}
function getProgress(){return Math.round((done.size/TOTAL_SECTIONS)*100);}

// ===================== NAV =====================
function go(id){sfx('click');document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));document.querySelectorAll('.nav-t[role="tab"]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false');});document.getElementById(id).classList.add('active');const btn=document.querySelector(`[data-s="${id}"]`);if(btn){btn.classList.add('active');btn.setAttribute('aria-selected','true');}window.scrollTo({top:0,behavior:'smooth'});if(id==='s-sopa'){setTimeout(buildSopa,50);}if(id==='s-widgets'){setTimeout(buildRoute,50);}}

// ===================== FLASHCARD DATA =====================
const fcData=[
  {w:'Karl Popper',a:'🦢 Filósofo austro-británico (1902–1994). Propuso la <strong>falsabilidad</strong> como criterio de demarcación científica y defendió la <strong>sociedad abierta</strong> frente al totalitarismo.'},
  {w:'Falsabilidad (falsacionismo)',a:'🎯 Una teoría es científica si puede, en principio, ser <strong>refutada</strong> por la experiencia. No basta con que explique los hechos: debe arriesgar predicciones que podrían fallar.'},
  {w:'Conjeturas y refutaciones',a:'🔁 El conocimiento avanza proponiendo <strong>hipótesis audaces</strong> (conjeturas) y sometiéndolas a intentos serios de <strong>refutación</strong>, no de confirmación.'},
  {w:'Problema de la inducción',a:'🦢 Ningún número de cisnes blancos observados prueba que "todos los cisnes son blancos". Popper concluye que la <strong>inducción no puede justificar</strong> leyes universales.'},
  {w:'Criterio de demarcación',a:'🚧 La línea que separa la <strong>ciencia</strong> de la <strong>pseudociencia</strong>: no es la verdad ni la utilidad, sino si la teoría es falsable.'},
  {w:'Racionalismo crítico',a:'🧭 Actitud que acepta que toda creencia puede estar equivocada y que progresamos mediante la <strong>crítica</strong>, no buscando certezas definitivas.'},
  {w:'Falibilismo',a:'⚠️ Todo conocimiento humano es <strong>provisional</strong> y corregible. "No sabemos, solo conjeturamos."'},
  {w:'Círculo de Viena',a:'🏛️ Grupo de filósofos positivistas lógicos (Schlick, Carnap, Neurath) con quienes Popper dialogó sin pertenecer a él. Se llamó a sí mismo "la <strong>oposición oficial</strong>".'},
  {w:'Verificacionismo',a:'✅ Postura del Círculo de Viena: una afirmación es significativa solo si puede <strong>verificarse</strong>. Popper la rechazó: lo importante no es verificar, sino poder refutar.'},
  {w:'La sociedad abierta y sus enemigos (1945)',a:'📖 Obra escrita en Nueva Zelanda durante la guerra. Defiende la <strong>democracia liberal</strong> y critica a Platón, Hegel y Marx como precursores del totalitarismo.'},
  {w:'Sociedad abierta',a:'🔓 Sociedad donde los individuos <strong>critican y cambian</strong> sus instituciones y gobernantes de forma pacífica y racional.'},
  {w:'Sociedad cerrada',a:'🔒 Sociedad <strong>tribal y dogmática</strong>, gobernada por tabúes incuestionables y la obediencia a una autoridad o doctrina única.'},
  {w:'Paradoja de la tolerancia',a:'⚖️ "La tolerancia ilimitada conduce a la desaparición de la tolerancia." Una sociedad abierta no debe tolerar a quienes buscan <strong>destruirla</strong> por la fuerza.'},
  {w:'Historicismo',a:'📉 La idea de que la historia obedece <strong>leyes inevitables</strong> que predicen su curso futuro. Popper la critica como pseudociencia y germen de totalitarismo.'},
  {w:'Ingeniería social gradual',a:'🔧 Reformar la sociedad mediante <strong>cambios pequeños, reversibles y comprobables</strong>, en vez de planes utópicos que rehacen todo de golpe.'},
  {w:'Los Tres Mundos',a:'🌐 Mundo 1 (objetos físicos), Mundo 2 (mente y experiencias subjetivas) y <strong>Mundo 3</strong> (teorías, problemas y conocimiento objetivo, independiente de quien lo piense).'},
];
let fcIdx=0;
function upFC(){document.getElementById('fcInner').classList.remove('flipped');document.getElementById('fcW').textContent=fcData[fcIdx].w;document.getElementById('fcA').innerHTML=fcData[fcIdx].a;document.getElementById('fcCtr').textContent=(fcIdx+1)+' / '+fcData.length;}
function flipCard(){sfx('flip');document.getElementById('fcInner').classList.toggle('flipped');if(!xpTracker.fc.has(fcIdx)){xpTracker.fc.add(fcIdx);pts(1);}if(xpTracker.fc.size===fcData.length){fin('s-flash');unlockAchievement('flash_master');}}
function nextFC(){sfx('click');fcIdx=(fcIdx+1)%fcData.length;upFC();}
function prevFC(){sfx('click');fcIdx=(fcIdx-1+fcData.length)%fcData.length;upFC();}

// ===================== QUIZ DATA =====================
const qzData=[
  {q:'¿Qué criterio propuso Popper para distinguir la ciencia de la pseudociencia?',o:['a) La utilidad práctica','b) La falsabilidad','c) La antigüedad de la teoría','d) El consenso de los expertos'],c:1},
  {q:'Según Popper, ¿qué problema tiene la inducción?',o:['a) Es demasiado lenta','b) Ningún número de casos particulares prueba una ley universal','c) Solo sirve en matemáticas','d) Fue inventada por Marx'],c:1},
  {q:'¿Qué representa el "cisne negro" en la epistemología de Popper?',o:['a) Una metáfora sobre la suerte','b) Un caso que refuta una generalización aceptada','c) Un símbolo del Círculo de Viena','d) Una teoría científica'],c:1},
  {q:'¿Cuál es la relación de Popper con el Círculo de Viena?',o:['a) Fue su fundador','b) Fue miembro activo toda su vida','c) Dialogó con ellos pero nunca fue miembro, y se opuso a su verificacionismo','d) Nunca tuvo contacto con ellos'],c:2},
  {q:'¿Qué obra escribió Popper durante su exilio en Nueva Zelanda?',o:['a) El Capital','b) La sociedad abierta y sus enemigos','c) Así habló Zaratustra','d) El origen de las especies'],c:1},
  {q:'¿Qué es la "paradoja de la tolerancia"?',o:['a) Tolerar todo sin excepción','b) No tolerar nunca a nadie','c) La tolerancia ilimitada puede destruir la tolerancia misma','d) Una contradicción lógica sin solución'],c:2},
  {q:'Para Popper, ¿por qué el psicoanálisis freudiano es un ejemplo de pseudociencia?',o:['a) Porque es muy antiguo','b) Porque puede explicar cualquier conducta sin arriesgar predicciones falsables','c) Porque no usa matemáticas','d) Porque fue rechazado por la medicina'],c:1},
  {q:'¿Qué propone la "ingeniería social gradual" frente al cambio utópico?',o:['a) No cambiar nada nunca','b) Reformas pequeñas, reversibles y comprobables','c) Una revolución total e inmediata','d) Dejar el cambio al azar'],c:1},
  {q:'¿Qué es el "Mundo 3" en la filosofía tardía de Popper?',o:['a) Un planeta hipotético','b) El mundo de los objetos físicos','c) El mundo de las experiencias subjetivas','d) El mundo del conocimiento objetivo: teorías, problemas, libros'],c:3},
  {q:'¿Qué institución académica acogió a Popper desde 1946 hasta su retiro?',o:['a) La Universidad de Viena','b) Harvard','c) La London School of Economics (LSE)','d) La Sorbona'],c:2},
];
let qzIdx=0,qzSel=-1,qzDone=false;
function buildQz(){qzIdx=0;qzSel=-1;qzDone=false;showQz();}
function showQz(){if(qzIdx>=qzData.length){document.getElementById('qzQ').textContent='🎉 ¡Quiz completado!';document.getElementById('qzOpts').innerHTML='';fin('s-quiz');unlockAchievement('primer_quiz');return;}const q=qzData[qzIdx];document.getElementById('qzProg').textContent=`Pregunta ${qzIdx+1} de ${qzData.length}`;document.getElementById('qzQ').textContent=q.q;const opts=document.getElementById('qzOpts');opts.innerHTML='';q.o.forEach((o,i)=>{const b=document.createElement('button');b.className='qz-opt';b.textContent=o;b.onclick=()=>{if(qzDone)return;document.querySelectorAll('.qz-opt').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');qzSel=i;sfx('click');};opts.appendChild(b);});qzDone=false;}
function checkQz(){if(qzSel<0)return fb('fbQz','Selecciona una respuesta.',false);qzDone=true;const opts=document.querySelectorAll('.qz-opt');if(qzSel===qzData[qzIdx].c){opts[qzSel].classList.add('correct');fb('fbQz','¡Correcto! +5 XP',true);if(!xpTracker.qz.has(qzIdx)){xpTracker.qz.add(qzIdx);pts(5);}sfx('ok');}else{opts[qzSel].classList.add('wrong');opts[qzData[qzIdx].c].classList.add('correct');fb('fbQz','Incorrecto. Revisa la respuesta correcta.',false);sfx('no');}setTimeout(()=>{qzIdx++;qzSel=-1;showQz();},1600);}
function resetQz(){sfx('click');qzIdx=0;qzSel=-1;qzDone=false;showQz();document.getElementById('fbQz').classList.remove('show');}

// ===================== CLASIFICACIÓN =====================
const classGroups=[
  {label:['Ciencia','Pseudociencia'],headA:'✅ Ciencia',headB:'❌ Pseudociencia',colA:'ciencia',colB:'pseudo',
   words:[{w:'Teoría de la relatividad (Einstein)',t:'ciencia'},{w:'Psicoanálisis freudiano',t:'pseudo'},{w:'Evolución por selección natural',t:'ciencia'},{w:'Psicología individual de Adler',t:'pseudo'},{w:'Ley de gravitación de Newton',t:'ciencia'},{w:'Astrología',t:'pseudo'},{w:'Teoría heliocéntrica (Kepler/Copérnico)',t:'ciencia'},{w:'Historicismo marxista (ley histórica inevitable)',t:'pseudo'}]},
  {label:['Sociedad abierta','Sociedad cerrada'],headA:'🔓 Sociedad abierta',headB:'🔒 Sociedad cerrada',colA:'abierta',colB:'cerrada',
   words:[{w:'Permite el cambio pacífico de gobierno',t:'abierta'},{w:'Se basa en tabúes incuestionables',t:'cerrada'},{w:'Fomenta la crítica racional de las instituciones',t:'abierta'},{w:'Exige obediencia absoluta a un líder o partido',t:'cerrada'},{w:'Los individuos deciden por sí mismos',t:'abierta'},{w:'Persigue a quienes disienten',t:'cerrada'},{w:'Acepta el pluralismo de ideas',t:'abierta'},{w:'Impone una "verdad histórica" única e incuestionable',t:'cerrada'}]},
  {label:['Inducción','Falsacionismo'],headA:'📈 Inducción',headB:'🎯 Falsacionismo',colA:'induccion',colB:'falsacion',
   words:[{w:'Busca acumular observaciones que confirmen la teoría',t:'induccion'},{w:'Busca pruebas severas que puedan refutar la teoría',t:'falsacion'},{w:'Cree que más casos confirmados "prueban" la teoría',t:'induccion'},{w:'Basta un solo contraejemplo para refutar la teoría',t:'falsacion'},{w:'"Todos los cisnes que vi son blancos, luego todos son blancos"',t:'induccion'},{w:'Un cisne negro refuta "todos los cisnes son blancos"',t:'falsacion'},{w:'Método que Popper atribuye al verificacionismo',t:'induccion'},{w:'Método que Popper propone como criterio de demarcación',t:'falsacion'}]},
  {label:['Mundo 1','Mundo 3'],headA:'🪨 Mundo 1 (físico)',headB:'📚 Mundo 3 (conocimiento objetivo)',colA:'m1',colB:'m3',
   words:[{w:'Una neurona dentro del cerebro',t:'m1'},{w:'El teorema de Pitágoras',t:'m3'},{w:'Las páginas de papel de un libro',t:'m1'},{w:'El argumento que contiene ese libro',t:'m3'},{w:'Una computadora física',t:'m1'},{w:'Un programa o algoritmo como idea',t:'m3'},{w:'El sonido de una sinfonía en el aire',t:'m1'},{w:'La partitura como obra musical objetiva',t:'m3'}]},
];
let currentClassGroupIdx=0,clsSelectedWord=null;
function buildClass(){const group=classGroups[currentClassGroupIdx];document.getElementById('col-left-head').textContent=group.headA;document.getElementById('col-right-head').textContent=group.headB;const bank=document.getElementById('clsBank');bank.innerHTML='';clsSelectedWord=null;document.getElementById('items-left').innerHTML='';document.getElementById('items-right').innerHTML='';_shuffle([...group.words]).forEach(w=>{const el=document.createElement('div');el.className='wb-item';el.textContent=w.w;el.dataset.t=w.t;el.onclick=()=>{document.querySelectorAll('.wb-item').forEach(i=>i.classList.remove('sel-word'));el.classList.add('sel-word');clsSelectedWord=el;sfx('click');};bank.appendChild(el);});['col-left','col-right'].forEach(colId=>{const col=document.getElementById(colId);col.onclick=(e)=>{if(!clsSelectedWord||e.target.classList.contains('drop-item'))return;const targetId=colId==='col-left'?'items-left':'items-right';const wordsCol=document.getElementById(targetId);const item=document.createElement('div');item.className='drop-item';item.textContent=clsSelectedWord.textContent;item.dataset.t=clsSelectedWord.dataset.t;const original=clsSelectedWord;item.onclick=(ev)=>{ev.stopPropagation();if(clsSelectedWord!==null){col.click();}else{document.getElementById('clsBank').appendChild(original);original.classList.remove('sel-word');item.remove();if(typeof sfx==='function')sfx('click');}};wordsCol.appendChild(item);clsSelectedWord.remove();clsSelectedWord=null;sfx('click');};});}
function checkClass(){const remaining=document.querySelectorAll('#clsBank .wb-item').length;if(remaining>0){fb('fbCls','Mueve todas las palabras a las columnas primero.',false);return;}const group=classGroups[currentClassGroupIdx];let allOk=true;document.querySelectorAll('#items-left .drop-item,#items-right .drop-item').forEach(el=>{const inLeft=el.parentElement.id==='items-left';const expectedType=inLeft?group.colA:group.colB;if(el.dataset.t===expectedType){el.classList.add('cls-ok');}else{el.classList.add('cls-no');allOk=false;}});if(!xpTracker.cls.has(currentClassGroupIdx)){xpTracker.cls.add(currentClassGroupIdx);pts(5);}if(allOk){fb('fbCls','¡Perfecto! +5 XP',true);sfx('fan');fin('s-clasifica');unlockAchievement('clasif_pro');}else{fb('fbCls','Hay errores. Marcados en rojo.',false);sfx('no');}}
function nextClassGroup(){sfx('click');currentClassGroupIdx=(currentClassGroupIdx+1)%classGroups.length;buildClass();document.getElementById('fbCls').classList.remove('show');showToast('🔄 Grupo: '+classGroups[currentClassGroupIdx].label[0]+' vs '+classGroups[currentClassGroupIdx].label[1]);}
function resetClass(){sfx('click');buildClass();document.getElementById('fbCls').classList.remove('show');}

// ===================== IDENTIFICAR =====================
const idData=[
  {s:['Popper','propuso','la','falsabilidad','como','criterio','de','demarcación.'],c:3,art:'Criterio para distinguir ciencia de pseudociencia'},
  {s:['Toda','conjetura','científica','debe','arriesgar','una','predicción','comprobable.'],c:1,art:'Hipótesis explicativa audaz'},
  {s:['Una','sola','refutación','basta','para','descartar','una','teoría.'],c:2,art:'Prueba que muestra que la teoría es falsa'},
  {s:['Según','el','falibilismo,','todo','conocimiento','humano','es','provisional.'],c:2,art:'Toda creencia puede estar equivocada'},
  {s:['La','sociedad','abierta','permite','la','crítica','racional','de','sus','instituciones.'],c:2,art:'Sociedad basada en la libre crítica y el cambio pacífico'},
  {s:['La','paradoja','de','la','tolerancia','advierte','sobre','los','enemigos','de','la','libertad.'],c:4,art:'Límite necesario para proteger la libertad misma'},
  {s:['El','racionalismo','crítico','exige','estar','dispuesto','a','cambiar','de','opinión.'],c:2,art:'Actitud abierta a la crítica y el error'},
  {s:['El','llamado','Mundo','3','contiene','el','conocimiento','objetivo.'],c:6,art:'Contenido objetivo del pensamiento humano (teorías, libros, problemas)'},
];
let idIdx=0,idDone=false;
function showId(){idDone=false;if(idIdx>=idData.length){document.getElementById('idSent').innerHTML='🎉 ¡Completado!';fin('s-identifica');unlockAchievement('id_master');return;}const d=idData[idIdx];document.getElementById('idProg').textContent=`Oración ${idIdx+1} de ${idData.length}`;document.getElementById('idInfo').textContent=`Busca: ${d.art}`;const sent=document.getElementById('idSent');sent.innerHTML='';d.s.forEach((w,i)=>{const span=document.createElement('span');span.className='id-word';span.textContent=w+' ';span.onclick=()=>checkId(i,span);sent.appendChild(span);});}
function checkId(i,span){if(idDone)return;document.querySelectorAll('.id-word').forEach(s=>s.classList.remove('selected'));span.classList.add('selected');if(i===idData[idIdx].c){idDone=true;span.classList.add('id-ok');fb('fbId','¡Correcto! +5 XP',true);if(!xpTracker.id.has(idIdx)){xpTracker.id.add(idIdx);pts(5);}sfx('ok');}else{span.classList.add('id-no');fb('fbId','Ese no es el término solicitado.',false);sfx('no');}}
function nextId(){sfx('click');idIdx++;showId();document.getElementById('fbId').classList.remove('show');}
function resetId(){sfx('click');idIdx=0;showId();document.getElementById('fbId').classList.remove('show');}

// ===================== COMPLETA =====================
const cmpData=[
  {s:'El criterio de ___ separa la ciencia de la pseudociencia.',opts:['verificación','falsabilidad','popularidad'],c:1},
  {s:'Para Popper, ninguna teoría científica puede ser ___ con certeza absoluta, solo refutada o corroborada.',opts:['probada','inventada','memorizada'],c:0},
  {s:'El método científico avanza mediante conjeturas y ___.',opts:['repeticiones','refutaciones','votaciones'],c:1},
  {s:'Popper rechazó la ___ como base lógica de la ciencia, pues ningún número de casos confirma una ley universal.',opts:['inducción','deducción','intuición'],c:0},
  {s:'En 1919, el eclipse que puso a prueba la teoría de ___ se convirtió en el modelo de ciencia para Popper.',opts:['Freud','Einstein','Marx'],c:1},
  {s:'Una sociedad ___ permite el cambio pacífico de gobierno mediante la crítica racional.',opts:['cerrada','abierta','tribal'],c:1},
  {s:'La paradoja de la ___ sostiene que no se debe tolerar a quien busca destruir la tolerancia misma.',opts:['libertad','tolerancia','igualdad'],c:1},
  {s:"En su obra 'Conocimiento objetivo', Popper describe el Mundo 3 como el reino del conocimiento ___.",opts:['secreto','objetivo','heredado'],c:1},
];
let cmpIdx=0,cmpSel=-1,cmpDone=false;
function showCmp(){if(cmpIdx>=cmpData.length){document.getElementById('cmpSent').innerHTML='🎉 ¡Completado!';document.getElementById('cmpOpts').innerHTML='';fin('s-completa');return;}const d=cmpData[cmpIdx];document.getElementById('cmpProg').textContent=`Oración ${cmpIdx+1} de ${cmpData.length}`;document.getElementById('cmpSent').innerHTML=d.s.replace('___','<span class="blank">___</span>');const opts=document.getElementById('cmpOpts');opts.innerHTML='';cmpSel=-1;cmpDone=false;d.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='cmp-opt';b.textContent=o;b.onclick=()=>{if(cmpDone)return;document.querySelectorAll('.cmp-opt').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');cmpSel=i;sfx('click');};opts.appendChild(b);});}
function checkCmp(){if(cmpSel<0)return fb('fbCmp','Selecciona una opción.',false);cmpDone=true;const opts=document.querySelectorAll('.cmp-opt');if(cmpSel===cmpData[cmpIdx].c){opts[cmpSel].classList.add('correct');document.getElementById('cmpSent').innerHTML=cmpData[cmpIdx].s.replace('___',`<span class="blank" style="color:var(--jade);border-color:var(--jade)">${opts[cmpSel].textContent}</span>`);fb('fbCmp','¡Correcto! +5 XP',true);if(!xpTracker.cmp.has(cmpIdx)){xpTracker.cmp.add(cmpIdx);pts(5);}sfx('ok');}else{opts[cmpSel].classList.add('wrong');opts[cmpData[cmpIdx].c].classList.add('correct');fb('fbCmp','Incorrecto. Revisa bien la respuesta.',false);sfx('no');}setTimeout(()=>{cmpIdx++;document.getElementById('fbCmp').classList.remove('show');showCmp();},1600);}

// ===================== RETO FINAL =====================
const retoPairs=[
  {label:['Ciencia','Pseudociencia'],btnA:'✅ Ciencia',btnB:'❌ Pseudociencia',colA:'ciencia',colB:'pseudo',
   words:[{w:'Relatividad de Einstein',t:'ciencia'},{w:'Psicoanálisis freudiano',t:'pseudo'},{w:'Evolución por selección natural',t:'ciencia'},{w:'Astrología',t:'pseudo'},{w:'Gravitación de Newton',t:'ciencia'},{w:'Psicología de Adler',t:'pseudo'},{w:'Heliocentrismo de Kepler',t:'ciencia'},{w:'Historicismo marxista',t:'pseudo'},{w:'Genética mendeliana',t:'ciencia'},{w:'Numerología',t:'pseudo'}]},
  {label:['Sociedad abierta','Sociedad cerrada'],btnA:'🔓 Abierta',btnB:'🔒 Cerrada',colA:'abierta',colB:'cerrada',
   words:[{w:'Elecciones libres',t:'abierta'},{w:'Tabú incuestionable',t:'cerrada'},{w:'Crítica racional',t:'abierta'},{w:'Obediencia al líder',t:'cerrada'},{w:'Pluralismo de ideas',t:'abierta'},{w:'Persecución del disidente',t:'cerrada'},{w:'Cambio pacífico de gobierno',t:'abierta'},{w:'Verdad histórica única',t:'cerrada'},{w:'Prensa libre',t:'abierta'},{w:'Partido único',t:'cerrada'}]},
  {label:['Inducción','Falsacionismo'],btnA:'📈 Inducción',btnB:'🎯 Falsacionismo',colA:'induccion',colB:'falsacion',
   words:[{w:'Acumula confirmaciones',t:'induccion'},{w:'Busca refutar la teoría',t:'falsacion'},{w:'"Más casos, más prueba"',t:'induccion'},{w:'Un contraejemplo basta',t:'falsacion'},{w:'Cisnes blancos observados',t:'induccion'},{w:'Aparece un cisne negro',t:'falsacion'},{w:'Método del Círculo de Viena',t:'induccion'},{w:'Criterio de demarcación de Popper',t:'falsacion'},{w:'Generalizar desde casos',t:'induccion'},{w:'Prueba severa y arriesgada',t:'falsacion'}]},
];
let currentRetoPairIdx=0,retoPool=[],retoOk=0,retoErr=0,retoTimerInt=null,retoSec=30,retoRunning=false,retoCurrent=null;
function updateRetoButtons(){const pair=retoPairs[currentRetoPairIdx];document.querySelectorAll('.reto-btns .btn')[0].textContent=pair.btnA;document.querySelectorAll('.reto-btns .btn')[1].textContent=pair.btnB;document.querySelectorAll('.reto-btns .btn')[0].onclick=()=>ansReto(pair.colA);document.querySelectorAll('.reto-btns .btn')[1].onclick=()=>ansReto(pair.colB);}
function startReto(){if(retoRunning)return;sfx('click');retoRunning=true;retoOk=0;retoErr=0;retoSec=30;retoPool=_shuffle([...retoPairs[currentRetoPairIdx].words,...retoPairs[currentRetoPairIdx].words]);showRetoWord();retoTimerInt=setInterval(()=>{retoSec--;sfx('tick');document.getElementById('retoTimer').textContent='⏱ '+retoSec;if(retoSec<=10)document.getElementById('retoTimer').style.color='var(--red)';if(retoSec<=0){clearInterval(retoTimerInt);endReto();}},1000);}
function showRetoWord(){if(retoPool.length===0)retoPool=_shuffle([...retoPairs[currentRetoPairIdx].words,...retoPairs[currentRetoPairIdx].words]);retoCurrent=retoPool.pop();document.getElementById('retoWord').textContent=retoCurrent.w;}
function ansReto(t){if(!retoRunning||!retoCurrent)return;const firstPlay=!xpTracker.reto.has(currentRetoPairIdx);if(t===retoCurrent.t){sfx('ok');retoOk++;if(firstPlay)pts(1);}else{sfx('no');retoErr++;if(firstPlay)pts(-1);}document.getElementById('retoScore').textContent=`✅ ${retoOk} correctas | ❌ ${retoErr} errores`;showRetoWord();}
function endReto(){retoRunning=false;document.getElementById('retoWord').textContent='🏁 ¡Tiempo!';document.getElementById('retoTimer').style.color='var(--pri)';xpTracker.reto.add(currentRetoPairIdx);const total=retoOk+retoErr;const pct=total>0?Math.round((retoOk/total)*100):0;fb('fbReto',`Resultado: ${retoOk}/${total} (${pct}%) ¡Bien hecho!`,true);fin('s-reto');sfx('fan');unlockAchievement('reto_hero');}
function nextRetoPair(){sfx('click');clearInterval(retoTimerInt);retoRunning=false;retoSec=30;retoOk=0;retoErr=0;currentRetoPairIdx=(currentRetoPairIdx+1)%retoPairs.length;updateRetoButtons();document.getElementById('retoTimer').textContent='⏱ 30';document.getElementById('retoTimer').style.color='var(--pri)';document.getElementById('retoWord').textContent='¡Prepárate!';document.getElementById('retoScore').textContent='✅ 0 correctas | ❌ 0 errores';document.getElementById('fbReto').classList.remove('show');showToast(`🔄 Pareja: ${retoPairs[currentRetoPairIdx].label[0]} vs ${retoPairs[currentRetoPairIdx].label[1]}`);}
function resetReto(){sfx('click');clearInterval(retoTimerInt);retoRunning=false;retoSec=30;retoOk=0;retoErr=0;document.getElementById('retoTimer').textContent='⏱ 30';document.getElementById('retoTimer').style.color='var(--pri)';document.getElementById('retoWord').textContent='¡Prepárate!';document.getElementById('retoScore').textContent='✅ 0 correctas | ❌ 0 errores';document.getElementById('fbReto').classList.remove('show');}

// ===================== WIDGETS =====================
// Widget 1: Ordenar secuencias
const routeSets=[
  {label:'Cronología de su vida',steps:['Nace en Viena (1902)','Ruptura con el marxismo dogmático (1919)','Doctorado en Filosofía (1928)','Emigra a Nueva Zelanda (1937)','Se traslada a Londres, LSE (1946)','Es nombrado Sir Karl Popper (1965)','Muere en Londres (1994)']},
  {label:'El método de conjeturas y refutaciones',steps:['Problema u observación','Conjetura audaz','Predicción falsable','Intento severo de refutación','Corroboración provisional o refutación']},
  {label:'Orden de publicación de sus obras',steps:['La lógica de la investigación científica (1934)','La miseria del historicismo (1944)','La sociedad abierta y sus enemigos (1945)','Conjeturas y refutaciones (1963)','Conocimiento objetivo (1972)']},
];
let currentRouteIdx=0,routeItems=[];
function buildRoute(){routeItems=_shuffle([...routeSets[currentRouteIdx].steps]);renderRoute();const fbEl=document.getElementById('fbRoute');if(fbEl)fbEl.classList.remove('show');}
function renderRoute(){const list=document.getElementById('routeList');if(!list)return;list.innerHTML='';routeItems.forEach((step,i)=>{const div=document.createElement('div');div.className='sort-item';div.innerHTML=`<div class="sort-arrows"><button class="sort-arrow" onclick="routeMove(${i},-1)"${i===0?' disabled':''}>▲</button><button class="sort-arrow" onclick="routeMove(${i},1)"${i===routeItems.length-1?' disabled':''}>▼</button></div><div class="sort-step-num">${i+1}.</div><div class="sort-item-txt">${step}</div>`;list.appendChild(div);});}
function routeMove(idx,dir){sfx('click');const ni=idx+dir;if(ni<0||ni>=routeItems.length)return;[routeItems[idx],routeItems[ni]]=[routeItems[ni],routeItems[idx]];renderRoute();}
function checkRoute(){const correct=routeSets[currentRouteIdx].steps;const isOk=routeItems.every((s,i)=>s===correct[i]);if(isOk){fb('fbRoute','¡Perfecto! Orden correcto. +4 XP',true);if(!xpTracker.wgt.has('route_'+currentRouteIdx)){xpTracker.wgt.add('route_'+currentRouteIdx);pts(4);}sfx('fan');fin('s-widgets');unlockAchievement('widgets_master');}else{fb('fbRoute','Hay pasos fuera de orden. Revisa el arreglo.',false);sfx('no');}}
function nextRoute(){sfx('click');currentRouteIdx=(currentRouteIdx+1)%routeSets.length;buildRoute();showToast('🔄 Secuencia: '+routeSets[currentRouteIdx].label);}

// Widget 2: Identifica el concepto
const neuronPartes=[
  {desc:'Criterio que permite distinguir una teoría científica de una pseudociencia',ans:'Falsabilidad',opts:['Falsabilidad','Verificación','Inducción','Verosimilitud']},
  {desc:'Hipótesis explicativa audaz que arriesga predicciones comprobables',ans:'Conjetura',opts:['Conjetura','Dogma','Axioma','Paradigma']},
  {desc:'Actitud filosófica de apertura permanente a la crítica y al error propio',ans:'Racionalismo crítico',opts:['Racionalismo crítico','Dogmatismo','Escepticismo radical','Empirismo ingenuo']},
  {desc:'Idea de que la historia obedece leyes inevitables que permiten predecir su curso futuro',ans:'Historicismo',opts:['Historicismo','Falibilismo','Holismo','Determinismo biológico']},
  {desc:'Sociedad donde los individuos pueden criticar y cambiar pacíficamente sus instituciones',ans:'Sociedad abierta',opts:['Sociedad abierta','Sociedad cerrada','Estado utópico','Tecnocracia']},
  {desc:'Reforma de la sociedad mediante cambios pequeños, reversibles y comprobables',ans:'Ingeniería social gradual',opts:['Ingeniería social gradual','Revolución total','Planificación utópica','Determinismo histórico']},
  {desc:'Reino del conocimiento objetivo (teorías, problemas, libros) independiente de quien lo piense',ans:'Mundo 3',opts:['Mundo 3','Mundo 1','Mundo 2','Inconsciente colectivo']},
  {desc:'Principio de que todo conocimiento humano es provisional y corregible',ans:'Falibilismo',opts:['Falibilismo','Relativismo','Nihilismo epistémico','Positivismo lógico']},
];
let neuronIdx=0,neuronDone=false;
function showNeuron(){neuronDone=false;if(neuronIdx>=neuronPartes.length){const el=document.getElementById('neuronDesc');if(el)el.textContent='🎉 ¡Todos los conceptos identificados!';const opts=document.getElementById('neuronOpts');if(opts)opts.innerHTML='';fin('s-widgets');return;}const d=neuronPartes[neuronIdx];const prog=document.getElementById('neuronProg');if(prog)prog.textContent=`Concepto ${neuronIdx+1} de ${neuronPartes.length}`;const desc=document.getElementById('neuronDesc');if(desc)desc.textContent=d.desc;const opts=document.getElementById('neuronOpts');if(!opts)return;opts.innerHTML='';_shuffle([...d.opts]).forEach(opt=>{const b=document.createElement('button');b.className='cmp-opt';b.textContent=opt;b.onclick=()=>checkNeuron(opt,b,d);opts.appendChild(b);});const fbEl=document.getElementById('fbNeuron');if(fbEl)fbEl.classList.remove('show');}
function checkNeuron(opt,btn,d){if(neuronDone)return;neuronDone=true;document.querySelectorAll('#neuronOpts .cmp-opt').forEach(b=>{if(b.textContent===d.ans)b.classList.add('correct');else if(b===btn&&b.textContent!==d.ans)b.classList.add('wrong');});const isOk=opt===d.ans;if(isOk){fb('fbNeuron','¡Correcto! +3 XP',true);if(!xpTracker.wgt.has('neuron_'+neuronIdx)){xpTracker.wgt.add('neuron_'+neuronIdx);pts(3);}sfx('ok');}else{fb('fbNeuron','La respuesta correcta es: '+d.ans,false);sfx('no');}}
function nextNeuron(){sfx('click');neuronIdx++;showNeuron();}
function resetNeuron(){sfx('click');neuronIdx=0;showNeuron();}

// Widget 3: Obra → Idea principal
const neuroPairs=[
  {trans:'La lógica de la investigación científica',func:'Presenta el falsacionismo como criterio de demarcación científica',opts:['Presenta el falsacionismo como criterio de demarcación científica','Defiende la democracia liberal frente al totalitarismo','Critica la idea de que la historia sigue leyes inevitables','El conocimiento avanza por ensayo y eliminación del error']},
  {trans:'La sociedad abierta y sus enemigos',func:'Defiende la democracia liberal frente al totalitarismo',opts:['Presenta el falsacionismo como criterio de demarcación científica','Defiende la democracia liberal frente al totalitarismo','Presenta la teoría de los Tres Mundos','El conocimiento avanza por ensayo y eliminación del error']},
  {trans:'La miseria del historicismo',func:'Critica la idea de que la historia sigue leyes inevitables',opts:['Critica la idea de que la historia sigue leyes inevitables','Defiende la democracia liberal frente al totalitarismo','Presenta la teoría de los Tres Mundos','Presenta el falsacionismo como criterio de demarcación científica']},
  {trans:'Conjeturas y refutaciones',func:'El conocimiento avanza por ensayo y eliminación del error',opts:['Presenta la teoría de los Tres Mundos','Critica la idea de que la historia sigue leyes inevitables','El conocimiento avanza por ensayo y eliminación del error','Defiende la democracia liberal frente al totalitarismo']},
  {trans:'Conocimiento objetivo',func:'Presenta la teoría de los Tres Mundos',opts:['Presenta la teoría de los Tres Mundos','El conocimiento avanza por ensayo y eliminación del error','Presenta el falsacionismo como criterio de demarcación científica','Critica la idea de que la historia sigue leyes inevitables']},
];
let neuroIdx=0,neuroDone=false;
function showNeuro(){neuroDone=false;if(neuroIdx>=neuroPairs.length){const el=document.getElementById('neuroTrans');if(el)el.textContent='🎉 ¡Completado!';const opts=document.getElementById('neuroOpts');if(opts)opts.innerHTML='';return;}const d=neuroPairs[neuroIdx];const prog=document.getElementById('neuroProg');if(prog)prog.textContent=`${neuroIdx+1} de ${neuroPairs.length}`;const trans=document.getElementById('neuroTrans');if(trans)trans.textContent=d.trans;const opts=document.getElementById('neuroOpts');if(!opts)return;opts.innerHTML='';_shuffle([...d.opts]).forEach(opt=>{const b=document.createElement('button');b.className='qz-opt';b.textContent=opt;b.onclick=()=>checkNeuro(opt,b,d);opts.appendChild(b);});const fbEl=document.getElementById('fbNeuro');if(fbEl)fbEl.classList.remove('show');}
function checkNeuro(opt,btn,d){if(neuroDone)return;neuroDone=true;document.querySelectorAll('#neuroOpts .qz-opt').forEach(b=>{if(b.textContent===d.func)b.classList.add('correct');else if(b===btn&&b.textContent!==d.func)b.classList.add('wrong');});const isOk=opt===d.func;if(isOk){fb('fbNeuro','¡Correcto! +3 XP',true);if(!xpTracker.wgt.has('neuro_'+neuroIdx)){xpTracker.wgt.add('neuro_'+neuroIdx);pts(3);}sfx('ok');}else{fb('fbNeuro','Correcto: '+d.func,false);sfx('no');}setTimeout(()=>{neuroIdx++;showNeuro();},1800);}
function resetNeuro(){sfx('click');neuroIdx=0;showNeuro();}

// Widget 4: Pensadores y escuelas → crítica de Popper
const enfermedadData=[
  {disease:'Marxismo (historicismo)',characteristic:'Predice un futuro histórico inevitable; en su forma dogmática no es falsable',opts:['Predice un futuro histórico inevitable; en su forma dogmática no es falsable','Puede explicar cualquier conducta a posteriori; carece de poder predictivo arriesgado','Defiende un Estado ideal gobernado por una élite que reprime la crítica','Confunde significado con verificación']},
  {disease:'Psicoanálisis (Freud)',characteristic:'Puede explicar cualquier conducta a posteriori; carece de poder predictivo arriesgado',opts:['Predice un futuro histórico inevitable; en su forma dogmática no es falsable','Puede explicar cualquier conducta a posteriori; carece de poder predictivo arriesgado','"Lo explicaba todo"; no arriesga predicciones que puedan fallar','Ve la Historia como el despliegue necesario de una Idea']},
  {disease:'Psicología individual (Adler)',characteristic:'"Lo explicaba todo"; no arriesga predicciones que puedan fallar',opts:['"Lo explicaba todo"; no arriesga predicciones que puedan fallar','Defiende un Estado ideal gobernado por una élite que reprime la crítica','Confunde significado con verificación','Ve la Historia como el despliegue necesario de una Idea']},
  {disease:'Platón (La República)',characteristic:'Defiende un Estado ideal gobernado por una élite que reprime la crítica y el cambio',opts:['Predice un futuro histórico inevitable; en su forma dogmática no es falsable','Defiende un Estado ideal gobernado por una élite que reprime la crítica y el cambio','"Lo explicaba todo"; no arriesga predicciones que puedan fallar','Confunde significado con verificación']},
  {disease:'Círculo de Viena (verificacionismo)',characteristic:'Confunde significado con verificación; Popper propone la falsabilidad en su lugar',opts:['Confunde significado con verificación; Popper propone la falsabilidad en su lugar','Ve la Historia como el despliegue necesario de una Idea','Defiende un Estado ideal gobernado por una élite que reprime la crítica','Puede explicar cualquier conducta a posteriori'],},
  {disease:'Hegel',characteristic:'Ve la Historia como el despliegue necesario de una Idea; base filosófica del historicismo',opts:['Ve la Historia como el despliegue necesario de una Idea; base filosófica del historicismo','Confunde significado con verificación','"Lo explicaba todo"; no arriesga predicciones que puedan fallar','Predice un futuro histórico inevitable; en su forma dogmática no es falsable']},
];
let enferIdx=0,enferDone=false;
function showEnfer(){enferDone=false;if(enferIdx>=enfermedadData.length){const el=document.getElementById('enferDisease');if(el)el.textContent='🎉 ¡Completado!';const opts=document.getElementById('enferOpts');if(opts)opts.innerHTML='';return;}const d=enfermedadData[enferIdx];const prog=document.getElementById('enferProg');if(prog)prog.textContent=`${enferIdx+1} de ${enfermedadData.length}`;const dis=document.getElementById('enferDisease');if(dis)dis.textContent=d.disease;const opts=document.getElementById('enferOpts');if(!opts)return;opts.innerHTML='';_shuffle([...d.opts]).forEach(opt=>{const b=document.createElement('button');b.className='qz-opt';b.textContent=opt;b.onclick=()=>checkEnfer(opt,b,d);opts.appendChild(b);});const fbEl=document.getElementById('fbEnfer');if(fbEl)fbEl.classList.remove('show');}
function checkEnfer(opt,btn,d){if(enferDone)return;enferDone=true;document.querySelectorAll('#enferOpts .qz-opt').forEach(b=>{if(b.textContent===d.characteristic)b.classList.add('correct');else if(b===btn&&b.textContent!==d.characteristic)b.classList.add('wrong');});const isOk=opt===d.characteristic;if(isOk){fb('fbEnfer','¡Correcto! +3 XP',true);if(!xpTracker.wgt.has('enfer_'+enferIdx)){xpTracker.wgt.add('enfer_'+enferIdx);pts(3);}sfx('ok');}else{fb('fbEnfer','Correcto: '+d.characteristic,false);sfx('no');}setTimeout(()=>{enferIdx++;showEnfer();},1800);}
function resetEnfer(){sfx('click');enferIdx=0;showEnfer();}

// ===================== TASK GENERATOR =====================
const identifyTaskDB=[
  {s:'Einstein predijo la curvatura de la luz, una predicción arriesgada y comprobable.',type:'Ciencia (predicción falsable)'},
  {s:'El psicoanálisis explica cualquier conducta después de que ocurre.',type:'Pseudociencia (no falsable)'},
  {s:'Una sociedad permite el cambio pacífico de sus gobernantes mediante elecciones.',type:'Sociedad abierta'},
  {s:'Un régimen exige obediencia absoluta a una doctrina incuestionable.',type:'Sociedad cerrada'},
  {s:'Un solo cisne negro basta para refutar "todos los cisnes son blancos".',type:'Falsacionismo'},
  {s:'Cuantas más confirmaciones tenga una teoría, más segura parece (aunque Popper lo cuestiona).',type:'Inducción / verificacionismo'},
  {s:'Las teorías, los problemas y los libros existen como contenido objetivo del pensamiento.',type:'Mundo 3 (conocimiento objetivo)'},
  {s:'No se debe tolerar a quien busca destruir la tolerancia misma.',type:'Paradoja de la tolerancia'},
  {s:'Las reformas sociales deben hacerse poco a poco y de forma reversible.',type:'Ingeniería social gradual'},
  {s:'Toda teoría científica es provisional y puede ser revisada.',type:'Falibilismo'},
];
const classifyTaskDB=[
  {w:'Falsabilidad',gen:'Criterio epistemológico',n:'Propuesto en 1934',g:'Epistemología',t:'Distingue ciencia de pseudociencia'},
  {w:'Sociedad abierta',gen:'Concepto político',n:'Acuñado en 1945',g:'Filosofía política',t:'Permite la crítica racional y el cambio pacífico'},
  {w:'Conjetura',gen:'Paso del método científico',n:'Debe ser audaz y arriesgada',g:'Metodología científica',t:'Hipótesis explicativa sometida a prueba severa'},
  {w:'Mundo 3',gen:'Categoría ontológica',n:'Presentado en 1972',g:'Ontología del conocimiento',t:'Contenido objetivo del pensamiento humano'},
  {w:'La sociedad abierta y sus enemigos',gen:'Obra (libro)',n:'Escrita en el exilio, Nueva Zelanda',g:'Filosofía política (1945)',t:'Defensa de la democracia liberal'},
  {w:'La lógica de la investigación científica',gen:'Obra (libro)',n:'Publicada originalmente en alemán',g:'Filosofía de la ciencia (1934)',t:'Presenta el falsacionismo'},
  {w:'Paradoja de la tolerancia',gen:'Concepto político',n:'Formulada como advertencia',g:'Filosofía política',t:'Límite de la tolerancia ante el totalitarismo'},
  {w:'Verosimilitud',gen:'Concepto epistemológico',n:'Mide la cercanía a la verdad',g:'Epistemología',t:'Compara teorías rivales aunque ninguna sea "verdadera"'},
];
const completeTaskDB=[
  {s:'El criterio de ___ separa la ciencia de la pseudociencia.',opts:['verificación','falsabilidad','popularidad'],ans:'falsabilidad'},
  {s:'El método científico avanza mediante conjeturas y ___.',opts:['repeticiones','refutaciones','votaciones'],ans:'refutaciones'},
  {s:'Popper rechazó la ___ como base lógica de la ciencia.',opts:['inducción','deducción','intuición'],ans:'inducción'},
  {s:'Una sociedad ___ permite el cambio pacífico de gobierno.',opts:['cerrada','abierta','tribal'],ans:'abierta'},
  {s:'La paradoja de la ___ limita la tolerancia ante el totalitarismo.',opts:['libertad','tolerancia','igualdad'],ans:'tolerancia'},
  {s:'El ___ sostiene que todo conocimiento humano es provisional.',opts:['dogmatismo','falibilismo','escepticismo total'],ans:'falibilismo'},
  {s:'En el Mundo ___ habitan las teorías, los problemas y los libros.',opts:['1','2','3'],ans:'3'},
  {s:'Popper enseñó en la London School of ___ desde 1946.',opts:['Medicine','Economics','Arts'],ans:'Economics'},
];
const explainQuestions=[
  {q:'¿Por qué Popper considera que la inducción no puede justificar leyes universales?',ans:'Porque ningún número finito de observaciones particulares garantiza lógicamente una ley universal; siempre es posible una excepción futura (el problema de Hume).'},
  {q:'Explica el criterio de demarcación de Popper entre ciencia y pseudociencia.',ans:'Una teoría es científica si es falsable, es decir, si puede en principio ser refutada por la experiencia; si "explica" todo y no arriesga nada, es pseudociencia.'},
  {q:'¿Qué es la paradoja de la tolerancia?',ans:'Tolerar sin límites a quienes buscan destruir la tolerancia conduce a su desaparición; por eso una sociedad abierta no debe tolerar al totalitarismo intolerante.'},
  {q:'Describe la diferencia entre sociedad abierta y sociedad cerrada.',ans:'La sociedad abierta permite la crítica racional y el cambio pacífico de gobierno; la cerrada se basa en tabúes incuestionables y el sometimiento a una autoridad o doctrina.'},
  {q:'¿Qué relación tuvo Popper con el Círculo de Viena?',ans:'Dialogó con sus miembros pero nunca perteneció al grupo; se opuso a su criterio de verificación y propuso en su lugar la falsabilidad, por lo que se autodenominó "la oposición oficial" del Círculo.'},
];
let ansVisible=false;
function genTask(){sfx('click');const type=document.getElementById('tgType').value;const count=parseInt(document.getElementById('tgCount').value);ansVisible=false;const out=document.getElementById('tgOut');out.innerHTML='';if(type==='identify')genIdentifyTask(out,count);else if(type==='classify')genClassifyTask(out,count);else if(type==='complete')genCompleteTask(out,count);else if(type==='explain')genExplainTask(out,count);fin('s-tareas');}
function _instrBlock(out,title,lines){const ib=document.createElement('div');ib.className='tg-instruction-block';ib.innerHTML=`<h4>📋 ${title}</h4>`+lines.map(l=>`<p>${l}</p>`).join('');out.appendChild(ib);}
function genIdentifyTask(out,count){_instrBlock(out,'Instrucción',['Copia en tu cuaderno; subraya, colorea o encierra el concepto popperiano ilustrado en cada oración. Escribe al lado de qué concepto se trata.','<strong>Ejemplo:</strong> Un solo contraejemplo basta para refutar una ley. → <span style="color:var(--jade);font-weight:700;">Falsacionismo</span>']);_pick(identifyTaskDB,Math.min(count,identifyTaskDB.length)).forEach((item,i)=>{const div=document.createElement('div');div.className='tg-task';div.innerHTML=`<div class="tg-task-num">${i+1}</div><div class="tg-task-content"><strong>${item.s}</strong><div style="border-bottom:1.5px solid var(--border);min-width:220px;margin-top:0.5rem;height:1.3rem;">&nbsp;</div><div class="tg-answer">✅ ${item.type}</div></div>`;out.appendChild(div);});}
function genClassifyTask(out,count){_instrBlock(out,'Instrucción',['Copia la siguiente tabla en tu cuaderno. Para cada elemento, completa su tipo, características, ámbito y función.']);const items=_pick(classifyTaskDB,Math.min(count,classifyTaskDB.length));const wrap=document.createElement('div');wrap.style.overflowX='auto';const th=(t,extra='')=>`<th style="padding:0.3rem 0.4rem;border:1px solid var(--border);font-size:0.72rem;text-align:center;${extra}">${t}</th>`;let html=`<table style="width:100%;border-collapse:collapse;font-size:0.78rem;min-width:520px;"><thead><tr style="background:var(--pri-gl);">${th('Elemento','text-align:left;')}${th('Tipo')}${th('Características')}${th('Ámbito')}${th('Función')}</tr></thead><tbody>`;items.forEach(it=>{html+=`<tr><td style="padding:0.4rem 0.5rem;border:1px solid var(--border);font-weight:600;">${it.w}</td>`+Array(4).fill(`<td style="padding:0.4rem;border:1px solid var(--border);min-width:50px;"></td>`).join('')+'</tr>';});html+='</tbody></table>';wrap.innerHTML=html;out.appendChild(wrap);const ans=document.createElement('div');ans.className='tg-answer';ans.style.marginTop='0.8rem';ans.innerHTML='<strong>✅ Respuestas:</strong><br>'+items.map(it=>`<strong>${it.w}:</strong> Tipo: ${it.gen} | Características: ${it.n} | Ámbito: ${it.g} | Función: ${it.t}`).join('<br>');out.appendChild(ans);}
function genCompleteTask(out,count){_instrBlock(out,'Instrucción',['Copia y resuelve en tu cuaderno. Cada oración tiene un espacio ___. Elige y escribe la opción correcta.']);const pool=_shuffle([...completeTaskDB]);for(let i=0;i<count;i++){const item=pool[i%pool.length];const div=document.createElement('div');div.className='tg-task';const sent=item.s.replace('___','<span class="tg-blank" style="min-width:90px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');div.innerHTML=`<div class="tg-task-num">${i+1}</div><div class="tg-task-content"><strong>${sent}</strong><div style="margin-top:0.4rem;font-size:0.82rem;color:var(--gray);">📝 Opciones: <strong>${item.opts.join(' | ')}</strong></div><div class="tg-answer">✅ ${item.ans}</div></div>`;out.appendChild(div);}}
function genExplainTask(out,count){_instrBlock(out,'Instrucción',['Copia las siguientes preguntas en tu cuaderno y responde cada una de forma clara y argumentada.']);const pool=_shuffle([...explainQuestions]);for(let i=0;i<count;i++){const item=pool[i%pool.length];const div=document.createElement('div');div.className='tg-task';div.innerHTML=`<div class="tg-task-num">${i+1}</div><div class="tg-task-content"><strong>${item.q}</strong><div style="border-bottom:1.5px solid var(--border);min-width:200px;margin-top:0.5rem;height:1.3rem;">&nbsp;</div><div style="border-bottom:1.5px solid var(--border);min-width:200px;margin-top:0.3rem;height:1.3rem;">&nbsp;</div><div class="tg-answer">✅ ${item.ans}</div></div>`;out.appendChild(div);}}
function toggleAns(){ansVisible=!ansVisible;document.querySelectorAll('.tg-answer').forEach(el=>el.style.display=ansVisible?'block':'none');sfx('click');}

// ===================== SOPA DE LETRAS =====================
const sopaSets=[
  {size:10,grid:[
    ['P','O','P','P','E','R','Q','W','X','Z'],
    ['V','I','E','N','A','K','L','M','T','Y'],
    ['C','I','S','N','E','B','D','F','G','H'],
    ['F','A','L','S','A','C','I','O','N','Q'],
    ['C','O','N','J','E','T','U','R','A','W'],
    ['R','E','F','U','T','A','C','I','O','N'],
    ['X','Q','Z','W','K','Y','J','V','B','M'],
    ['L','T','R','S','D','G','H','F','N','P'],
    ['A','E','I','O','U','A','E','I','O','U'],
    ['B','C','D','F','G','H','J','K','L','M']
  ],words:[
    {w:'POPPER',cells:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5]]},
    {w:'VIENA',cells:[[1,0],[1,1],[1,2],[1,3],[1,4]]},
    {w:'CISNE',cells:[[2,0],[2,1],[2,2],[2,3],[2,4]]},
    {w:'FALSACION',cells:[[3,0],[3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8]]},
    {w:'CONJETURA',cells:[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8]]},
    {w:'REFUTACION',cells:[[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[5,7],[5,8],[5,9]]}
  ]},
  {size:11,grid:[
    ['T','O','L','E','R','A','N','C','I','A','Q'],
    ['L','O','N','D','R','E','S','W','X','Y','Z'],
    ['A','B','I','E','R','T','A','K','M','N','P'],
    ['C','R','I','T','I','C','A','D','F','G','H'],
    ['D','E','M','A','R','C','A','C','I','O','N'],
    ['F','A','L','I','B','I','L','I','S','M','O'],
    ['X','Q','Z','W','K','Y','J','V','B','M','T'],
    ['L','T','R','S','D','G','H','F','N','P','C'],
    ['A','E','I','O','U','A','E','I','O','U','B'],
    ['B','C','D','F','G','H','J','K','L','M','S'],
    ['Y','U','I','O','P','A','S','D','F','G','H']
  ],words:[
    {w:'TOLERANCIA',cells:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9]]},
    {w:'LONDRES',cells:[[1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6]]},
    {w:'ABIERTA',cells:[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6]]},
    {w:'CRITICA',cells:[[3,0],[3,1],[3,2],[3,3],[3,4],[3,5],[3,6]]},
    {w:'DEMARCACION',cells:[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9],[4,10]]},
    {w:'FALIBILISMO',cells:[[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[5,7],[5,8],[5,9],[5,10]]}
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

// ===================== EVALUACIÓN FINAL (CONCEPTUAL) =====================
const evalTFBank=[
  {q:'Popper considera que la falsabilidad es el criterio que distingue la ciencia de la pseudociencia.',a:true},
  {q:'Para Popper, cuantas más observaciones confirmen una teoría, más "probada" queda esta de forma definitiva.',a:false},
  {q:'Popper fue miembro oficial del Círculo de Viena.',a:false},
  {q:'"La sociedad abierta y sus enemigos" fue escrita durante el exilio de Popper en Nueva Zelanda.',a:true},
  {q:'Según Popper, una sola observación contraria puede refutar una ley universal.',a:true},
  {q:'El falibilismo sostiene que el conocimiento humano es absolutamente cierto.',a:false},
  {q:'La paradoja de la tolerancia advierte que tolerar sin límites puede destruir la propia tolerancia.',a:true},
  {q:'Popper defendía la ingeniería social utópica como la mejor forma de mejorar la sociedad.',a:false},
  {q:'El "Mundo 3" de Popper se refiere al contenido objetivo del pensamiento, como teorías y problemas.',a:true},
  {q:'Popper trabajó como profesor en la London School of Economics.',a:true},
  {q:'Para Popper, el psicoanálisis freudiano cumple perfectamente el criterio de falsabilidad.',a:false},
  {q:'El racionalismo crítico propone estar siempre abierto a la crítica y dispuesto a corregir errores.',a:true},
  {q:'Popper nació en Londres y nunca vivió en Viena.',a:false},
  {q:'La obra "La lógica de la investigación científica" fue publicada originalmente en alemán en 1934.',a:true},
  {q:'Según Popper, la historia humana sigue leyes inevitables que se pueden predecir con certeza.',a:false},
];
const evalMCBank=[
  {q:'¿Qué criterio propuso Popper para distinguir la ciencia de la pseudociencia?',o:['a) La utilidad práctica','b) La falsabilidad','c) La antigüedad de la teoría','d) El consenso de los expertos'],a:1},
  {q:'Según Popper, ¿qué problema tiene la inducción?',o:['a) Es demasiado lenta','b) Ningún número de casos particulares prueba una ley universal','c) Solo sirve en matemáticas','d) Fue inventada por Marx'],a:1},
  {q:'¿Qué representa el "cisne negro" en la epistemología de Popper?',o:['a) Una metáfora sobre la suerte','b) Un caso que refuta una generalización aceptada','c) Un símbolo del Círculo de Viena','d) Una teoría científica'],a:1},
  {q:'¿Cuál es la relación de Popper con el Círculo de Viena?',o:['a) Fue su fundador','b) Fue miembro activo toda su vida','c) Dialogó con ellos pero nunca fue miembro, y se opuso a su verificacionismo','d) Nunca tuvo contacto con ellos'],a:2},
  {q:'¿Qué obra escribió Popper durante su exilio en Nueva Zelanda?',o:['a) El Capital','b) La sociedad abierta y sus enemigos','c) Así habló Zaratustra','d) El origen de las especies'],a:1},
  {q:'¿Qué es la "paradoja de la tolerancia"?',o:['a) Tolerar todo sin excepción','b) No tolerar nunca a nadie','c) La tolerancia ilimitada puede destruir la tolerancia misma','d) Una contradicción lógica sin solución'],a:2},
  {q:'Para Popper, ¿por qué el psicoanálisis freudiano es un ejemplo de pseudociencia?',o:['a) Porque es muy antiguo','b) Porque puede explicar cualquier conducta sin arriesgar predicciones falsables','c) Porque no usa matemáticas','d) Porque fue rechazado por la medicina'],a:1},
  {q:'¿Qué propone la "ingeniería social gradual" frente al cambio utópico?',o:['a) No cambiar nada nunca','b) Reformas pequeñas, reversibles y comprobables','c) Una revolución total e inmediata','d) Dejar el cambio al azar'],a:1},
  {q:'¿Qué es el "Mundo 3" en la filosofía tardía de Popper?',o:['a) Un planeta hipotético','b) El mundo de los objetos físicos','c) El mundo de las experiencias subjetivas','d) El mundo del conocimiento objetivo: teorías, problemas, libros'],a:3},
  {q:'¿Qué institución académica acogió a Popper desde 1946 hasta su retiro?',o:['a) La Universidad de Viena','b) Harvard','c) La London School of Economics (LSE)','d) La Sorbona'],a:2},
  {q:'¿Qué significa "verosimilitud" en la filosofía de Popper?',o:['a) Que una teoría es absolutamente verdadera','b) La cercanía relativa de una teoría a la verdad','c) Un sinónimo de falsabilidad','d) Un tipo de prueba experimental'],a:1},
  {q:'¿Qué propone el "racionalismo crítico" de Popper?',o:['a) Buscar certezas absolutas','b) Estar abierto a la crítica y dispuesto a revisar nuestras creencias','c) Rechazar toda forma de razón','d) Aceptar solo lo que dicen las autoridades'],a:1},
  {q:'¿Qué crítica hace Popper al historicismo?',o:['a) Que es una ciencia exacta','b) Que predice el futuro de la historia humana como si siguiera leyes inevitables, sin poder ser puesto a prueba','c) Que fue inventado por Einstein','d) Que solo se aplica a la biología'],a:1},
  {q:'¿En qué año fue nombrado "Sir" Karl Popper?',o:['a) 1934','b) 1945','c) 1965','d) 1994'],a:2},
  {q:'¿Qué evento de 1919 marcó el modelo de "buena ciencia" para Popper?',o:['a) La revolución rusa','b) La prueba experimental de la teoría de la relatividad de Einstein durante un eclipse','c) La publicación de El Capital','d) El fin de la Primera Guerra Mundial'],a:1},
];
const evalCPBank=[
  {q:'El criterio de ___ separa la ciencia de la pseudociencia.',a:'falsabilidad'},
  {q:'El conocimiento científico avanza mediante conjeturas y ___.',a:'refutaciones'},
  {q:'Popper rechazó la ___ como base lógica y propuso en su lugar la falsabilidad.',a:'inducción'},
  {q:'Un solo ___ negro basta para refutar "todos los cisnes son blancos".',a:'cisne'},
  {q:'Popper se autodenominó "la oposición oficial" del Círculo de ___.',a:'Viena'},
  {q:'"La sociedad abierta y sus enemigos" fue escrita durante el exilio de Popper en Nueva ___.',a:'Zelanda'},
  {q:'Desde 1946, Popper enseñó en la London School of ___.',a:'Economics'},
  {q:'La paradoja de la ___ advierte sobre los límites necesarios de la tolerancia.',a:'tolerancia'},
  {q:'El ___ sostiene que todo conocimiento humano es provisional y corregible.',a:'falibilismo'},
  {q:'En el Mundo ___, según Popper, habitan las teorías, los problemas y los libros.',a:'3'},
  {q:'La ingeniería social ___ propone reformas pequeñas y reversibles.',a:'gradual'},
  {q:'Popper consideraba que el ___ freudiano no es falsable y por tanto es pseudociencia.',a:'psicoanálisis'},
  {q:'Una sociedad ___ permite el cambio pacífico de gobierno mediante la crítica racional.',a:'abierta'},
  {q:'El ___ es la idea de que la historia sigue leyes inevitables y predecibles.',a:'historicismo'},
  {q:'Popper murió en ___ en 1994.',a:'Londres'},
];
const evalPRBank=[
  {term:'Falsabilidad',def:'Criterio para distinguir ciencia de pseudociencia'},
  {term:'Conjetura',def:'Hipótesis explicativa audaz y arriesgada'},
  {term:'Refutación',def:'Prueba que muestra que una teoría es falsa'},
  {term:'Inducción',def:'Generalizar a partir de casos observados (criticada por Popper)'},
  {term:'Falibilismo',def:'Todo conocimiento humano es provisional y corregible'},
  {term:'Racionalismo crítico',def:'Actitud de apertura permanente a la crítica'},
  {term:'Sociedad abierta',def:'Permite la crítica racional y el cambio pacífico de gobierno'},
  {term:'Sociedad cerrada',def:'Se basa en tabúes incuestionables y la obediencia ciega'},
  {term:'Paradoja de la tolerancia',def:'No tolerar a quien busca destruir la tolerancia misma'},
  {term:'Historicismo',def:'Idea de que la historia sigue leyes inevitables y predecibles'},
  {term:'Ingeniería social gradual',def:'Reformas pequeñas, reversibles y comprobables'},
  {term:'Mundo 3',def:'Conocimiento objetivo: teorías, problemas y libros'},
  {term:'Verosimilitud',def:'Cercanía relativa de una teoría a la verdad'},
  {term:'Círculo de Viena',def:'Grupo de positivistas lógicos con quienes Popper debatió'},
  {term:'Demarcación',def:'Línea que separa la ciencia de la pseudociencia'},
];

function genEval(){sfx('click');const cf=evalFormNum;window._currentEvalForm=cf;evalFormNum=(evalFormNum%10)+1;saveProgress();document.getElementById('eval-screen-title').textContent=`🎓 Evaluación Final · Forma ${cf} · Karl Popper`;evalAnsVisible=false;const out=document.getElementById('evalOut');out.innerHTML='';const bar=document.createElement('div');bar.className='eval-score-bar';bar.innerHTML=`<div><div class="esb-title">📊 Distribución de puntaje · 100 puntos</div><div class="esb-dist">Cada sección vale 25 puntos (5 preguntas × 5 pts)</div></div><div style="display:flex;gap:0.4rem;flex-wrap:wrap;"><span class="eval-score-pill esp-cp">Completar 25 pts</span><span class="eval-score-pill esp-tf">V/F 25 pts</span><span class="eval-score-pill esp-mc">Selección 25 pts</span><span class="eval-score-pill esp-pr">Pareados 25 pts</span></div>`;out.appendChild(bar);const cpItems=_pick(evalCPBank,5);const s1=document.createElement('div');s1.innerHTML='<div class="eval-section-title">I. Completar el espacio <span class="eval-pts">25 pts · 5 pts c/u</span></div>';cpItems.forEach((item,i)=>{const d=document.createElement('div');d.className='eval-item eval-auto-item';d.dataset.evalType='cp';d.dataset.evalIndex=i;const qHtml=item.q.replace('___',`<input class="eval-cp-input" type="text" data-cp="${i}" autocomplete="off">`);d.innerHTML=`<div class="eval-q"><span class="eval-num">${i+1}</span><span class="eval-q-text">${qHtml}</span></div><div class="eval-answer">${item.a}</div><div class="eval-item-feedback" id="evalFbCp${i}" aria-live="polite"></div>`;s1.appendChild(d);});out.appendChild(s1);const tfItems=_pick(evalTFBank,5);const s2=document.createElement('div');s2.innerHTML='<div class="eval-section-title">II. Verdadero o Falso <span class="eval-pts">25 pts · 5 pts c/u</span></div>';tfItems.forEach((item,i)=>{const d=document.createElement('div');d.className='eval-item eval-auto-item';d.dataset.evalType='tf';d.dataset.evalIndex=i;d.innerHTML=`<div class="eval-q"><span class="eval-num">${i+6}</span><span class="eval-q-text">${item.q}</span></div><div class="eval-tf-opts"><label class="eval-tf-opt"><input type="radio" name="tf${i}" value="true"> Verdadero</label><label class="eval-tf-opt"><input type="radio" name="tf${i}" value="false"> Falso</label></div><div class="eval-answer">${item.a?'Verdadero':'Falso'}</div><div class="eval-item-feedback" id="evalFbTf${i}" aria-live="polite"></div>`;s2.appendChild(d);});out.appendChild(s2);const mcItems=_pick(evalMCBank,5);const s3=document.createElement('div');s3.innerHTML='<div class="eval-section-title">III. Selección Múltiple <span class="eval-pts">25 pts · 5 pts c/u</span></div>';mcItems.forEach((item,i)=>{const d=document.createElement('div');d.className='eval-item eval-auto-item';d.dataset.evalType='mc';d.dataset.evalIndex=i;const optsHtml=item.o.map((op,oi)=>`<label class="eval-mc-opt"><input type="radio" name="mc${i}" value="${oi}"> ${op}</label>`).join('');d.innerHTML=`<div class="eval-q"><span class="eval-num">${i+11}</span><span class="eval-q-text">${item.q}</span></div><div class="eval-mc-opts">${optsHtml}</div><div class="eval-answer">${item.o[item.a]}</div><div class="eval-item-feedback" id="evalFbMc${i}" aria-live="polite"></div>`;s3.appendChild(d);});out.appendChild(s3);const prItems=_pick(evalPRBank,5);const shuffledDefs=[...prItems].sort(()=>Math.random()-0.5);const letters=['A','B','C','D','E'];const s4=document.createElement('div');s4.innerHTML='<div class="eval-section-title">IV. Términos Pareados <span class="eval-pts">25 pts · 5 pts c/u</span></div>';const matchCard=document.createElement('div');matchCard.className='eval-item';let colLeft='<div class="eval-match-col"><h4>📌 Términos</h4>';prItems.forEach((item,i)=>{colLeft+=`<div class="eval-match-item"><span class="eval-match-letter">${i+16}.</span> <select class="eval-match-select" data-pr="${i}" aria-label="Respuesta pareada ${i+16}"><option value="">—</option>${letters.map(l=>`<option value="${l}">${l}</option>`).join('')}</select> ${item.term}</div>`;});colLeft+='</div>';let colRight='<div class="eval-match-col"><h4>🔑 Definiciones</h4>';shuffledDefs.forEach((item,i)=>{colRight+=`<div class="eval-match-item"><span class="eval-match-letter">${letters[i]}.</span> ${item.def}</div>`;});colRight+='</div>';const ansKey=prItems.map((item,i)=>{const letter=letters[shuffledDefs.findIndex(d=>d.def===item.def)];return`${i+16}→${letter}`;}).join(' · ');matchCard.innerHTML=`<div class="eval-match-grid">${colLeft}${colRight}</div><div class="eval-answer" style="display:none;">${ansKey}</div><div class="eval-item-feedback" id="evalFbPr" aria-live="polite"></div>`;s4.appendChild(matchCard);out.appendChild(s4);window._evalPrintData={tf:tfItems,mc:mcItems,cp:cpItems,pr:{terms:prItems,shuffledDefs,letters}};const autoPanel=document.createElement('div');autoPanel.id='evalAutoResult';autoPanel.className='eval-auto-result';autoPanel.innerHTML='<strong>🧮 Evaluación interactiva:</strong> responde en pantalla y presiona <em>Calificar prueba</em>. La impresión conserva el formato original sin respuestas digitadas.';out.appendChild(autoPanel);fin('s-evaluacion');}
function toggleEvalAns(){evalAnsVisible=!evalAnsVisible;document.querySelectorAll('#evalOut .eval-answer').forEach(el=>el.style.display=evalAnsVisible?'block':'none');sfx('click');}
function normalizeEvalAnswer(v){return(v||'').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').replace(/[()]/g,'').trim();}
function isCpCorrect(student,expected){const s=normalizeEvalAnswer(student);const e=normalizeEvalAnswer(expected);if(!s)return false;const variants=new Set([e]);if(e.includes(' '))e.split(' ').forEach(x=>x&&variants.add(x));return variants.has(s)||e.replace(/[^a-z0-9]/g,'')===s.replace(/[^a-z0-9]/g,'');}
function setEvalFeedback(id,ok,msg){const el=document.getElementById(id);if(!el)return;el.textContent=msg;el.className='eval-item-feedback '+(ok?'eval-ok':'eval-no');}
function gradeEval(){if(!window._evalPrintData){showToast('⚠️ Genera una evaluación primero');return;}sfx('click');const d=window._evalPrintData;let total=0;const detail={cp:0,tf:0,mc:0,pr:0};d.cp.forEach((it,i)=>{const input=document.querySelector(`[data-cp="${i}"]`);const ok=isCpCorrect(input?input.value:'',it.a);if(input){input.classList.toggle('eval-input-ok',ok);input.classList.toggle('eval-input-no',!ok);}if(ok){detail.cp++;total+=5;}setEvalFeedback('evalFbCp'+i,ok,ok?'Correcto. +5 pts':'Revisar. Respuesta esperada: '+it.a);});d.tf.forEach((it,i)=>{const selected=document.querySelector(`input[name="tf${i}"]:checked`);const ok=!!selected&&(selected.value==='true')===it.a;if(ok){detail.tf++;total+=5;}setEvalFeedback('evalFbTf'+i,ok,ok?'Correcto. +5 pts':'Revisar. Respuesta esperada: '+(it.a?'Verdadero':'Falso'));});d.mc.forEach((it,i)=>{const selected=document.querySelector(`input[name="mc${i}"]:checked`);const ok=!!selected&&Number(selected.value)===it.a;if(ok){detail.mc++;total+=5;}setEvalFeedback('evalFbMc'+i,ok,ok?'Correcto. +5 pts':'Revisar. Respuesta esperada: '+it.o[it.a]);});const expectedLetters=d.pr.terms.map(it=>d.pr.letters[d.pr.shuffledDefs.findIndex(df=>df.def===it.def)]);expectedLetters.forEach((letter,i)=>{const sel=document.querySelector(`[data-pr="${i}"]`);const ok=!!sel&&sel.value===letter;if(sel){sel.classList.toggle('eval-input-ok',ok);sel.classList.toggle('eval-input-no',!ok);}if(ok){detail.pr++;total+=5;}});const prMsg=`Pareados: ${detail.pr}/5 correctos. ${detail.pr===5?'Excelente. +25 pts':'Clave: '+expectedLetters.map((l,i)=>(i+16)+'→'+l).join(' · ')}`;setEvalFeedback('evalFbPr',detail.pr===5,prMsg);const result=document.getElementById('evalAutoResult');if(result){result.className='eval-auto-result '+(total>=70?'eval-auto-pass':'eval-auto-risk');result.innerHTML=`<strong>Resultado automático: ${total}/100 puntos</strong><br><span>Completar: ${detail.cp*5}/25 · V/F: ${detail.tf*5}/25 · Selección: ${detail.mc*5}/25 · Pareados: ${detail.pr*5}/25</span><br><em>Este resultado es solo para revisión en pantalla; la impresión conserva el formato limpio para papel.</em>`;}if(total>=70){pts(8);showToast('🎯 Evaluación calificada: '+total+'/100');}else showToast('🧮 Evaluación calificada: '+total+'/100. Revisa las respuestas marcadas.');}
function printEval(){if(!window._evalPrintData){showToast('⚠️ Genera una evaluación primero');return;}sfx('click');const forma=window._currentEvalForm||1;const d=window._evalPrintData;let s1=`<div class="sec-title"><span>I. Completar el espacio</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 25%</span></div></div>`;d.cp.forEach((it,i)=>{const q=it.q.replace('___','<span class="cp-blank"></span>');s1+=`<div class="cp-row"><span class="qn">${i+1}.</span><span class="cp-text">${q}</span></div>`;});let s2=`<div class="sec-title"><span>II. Verdadero o Falso</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 25%</span></div></div>`;d.tf.forEach((it,i)=>{s2+=`<div class="tf-row"><span class="qn">${i+6}.</span><span class="tf-blank"></span><span class="tf-text">${it.q}</span></div>`;});let s3=`<div class="sec-title"><span>III. Selección Múltiple</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 25%</span></div></div><div class="mc-grid">`;d.mc.forEach((it,i)=>{const opts=it.o.map((op,oi)=>`<label class="mc-opt"><input type="radio" name="mcp${i}"> ${op}</label>`).join('');s3+=`<div class="mc-item"><div class="mc-q"><span class="qn">${i+11}.</span><span>${it.q}</span></div><div class="mc-opts">${opts}</div></div>`;});s3+=`</div>`;let colL='<div class="pr-col"><div class="pr-head">📌 Términos</div>';d.pr.terms.forEach((it,i)=>{colL+=`<div class="pr-item"><span class="pr-num">${i+16}.</span><span class="pr-line"></span>${it.term}</div>`;});colL+='</div>';let colR='<div class="pr-col"><div class="pr-head">🔑 Definiciones</div>';d.pr.shuffledDefs.forEach((it,i)=>{colR+=`<div class="pr-item"><span class="pr-num">${d.pr.letters[i]}.</span>${it.def}</div>`;});colR+='</div>';let s4=`<div class="pr-section"><div class="sec-title"><span>IV. Términos Pareados</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 25%</span></div></div><div class="pr-grid">${colL}${colR}</div></div>`;let pR='';pR+=`<div class="p-sec"><div class="p-ttl">I. Completar</div><table class="p-tbl">`;d.cp.forEach((it,i)=>{pR+=`<tr><td class="pn">${i+1}.</td><td class="pa">${it.a}</td></tr>`;});pR+=`</table></div><div class="p-sec"><div class="p-ttl">II. V o F</div><table class="p-tbl">`;d.tf.forEach((it,i)=>{pR+=`<tr><td class="pn">${i+6}.</td><td class="pa">${it.a?'V':'F'}</td></tr>`;});pR+=`</table></div><div class="p-sec"><div class="p-ttl">III. Selección</div><table class="p-tbl">`;d.mc.forEach((it,i)=>{pR+=`<tr><td class="pn">${i+11}.</td><td class="pa">${it.o[it.a]}</td></tr>`;});pR+=`</table></div><div class="p-sec"><div class="p-ttl">IV. Pareados</div><table class="p-tbl">`;d.pr.terms.forEach((it,i)=>{const l=d.pr.letters[d.pr.shuffledDefs.findIndex(df=>df.def===it.def)];pR+=`<tr><td class="pn">${i+16}.</td><td class="pa">${i+16}→${l}</td></tr>`;});pR+=`</table></div>`;const doc=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Evaluación Karl Popper · Forma ${forma}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#111;background:#fff;padding:1mm 5mm;}.ph{margin-bottom:0.3rem;}.ph h2{font-size:11pt;font-weight:700;text-align:center;margin-bottom:0.2rem;}.ph-line{display:flex;align-items:baseline;gap:5px;margin-bottom:3px;}.ph-fill{flex:1;border-bottom:1px solid #555;min-height:12px;display:block;}.ph-m{display:inline-block;min-width:80px;border-bottom:1px solid #555;}.ph-s{display:inline-block;min-width:52px;border-bottom:1px solid #555;}.ph-xs{display:inline-block;min-width:36px;border-bottom:1px solid #555;}.ph-crit{font-size:9.5pt;text-align:center;color:#555;margin-top:0.1rem;}.sec-title{font-size:10.5pt;font-weight:700;padding:0.12rem 0.4rem;margin:0.22rem 0 0.1rem;display:flex;justify-content:space-between;align-items:center;border-left:4px solid #3b3a86;background:#ece9fb;color:#3b3a86;}.obt-row{display:flex;align-items:baseline;gap:4px;font-size:9.5pt;font-weight:700;font-style:italic;color:#3b3a86;}.obt-lbl{white-space:nowrap;}.obt-line{display:inline-block;min-width:58px;border-bottom:1.5px solid #3b3a86;height:12px;}.obt-pct{white-space:nowrap;}.qn{font-weight:700;min-width:22px;flex-shrink:0;}.tf-row{display:flex;align-items:baseline;gap:0.3rem;font-size:10.5pt;line-height:1.3;padding:0.13rem 0.2rem;border-bottom:1px solid #eee;}.tf-blank{display:inline-block;min-width:40px;border-bottom:1.5px solid #111;flex-shrink:0;margin:0 0.18rem;}.tf-text{flex:1;}.mc-item{border:1px solid #ddd;border-radius:4px;padding:0.14rem 0.35rem;margin-bottom:0.1rem;break-inside:avoid;page-break-inside:avoid;}.mc-q{font-size:10.5pt;line-height:1.3;display:flex;gap:0.28rem;margin-bottom:0.07rem;}.mc-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.1rem 0.5rem;}.mc-opts{display:grid;grid-template-columns:repeat(4,1fr);gap:0.04rem 0.15rem;margin-left:0.8rem;}.mc-opt{font-size:9pt;display:flex;align-items:center;gap:0.15rem;}.mc-opt input{width:10px;height:10px;flex-shrink:0;}.cp-row{display:flex;align-items:baseline;gap:0.3rem;font-size:10.5pt;line-height:1.3;padding:0.13rem 0.2rem;border-bottom:1px solid #eee;}.cp-text{flex:1;}.cp-blank{display:inline-block;min-width:150px;border-bottom:1.5px solid #111;margin:0 0.12rem;}.pr-section{margin-top:0.1rem;}.pr-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.08rem 0.4rem;margin-top:0.08rem;}.pr-head{font-size:9pt;font-weight:700;color:#555;margin-bottom:0.1rem;}.pr-item{font-size:10.5pt;padding:0.1rem 0.28rem;background:#ece9fb;border-radius:3px;margin-bottom:0.07rem;display:flex;align-items:center;gap:0.2rem;line-height:1.2;break-inside:avoid;page-break-inside:avoid;}.pr-num{font-weight:700;color:#3b3a86;min-width:19px;flex-shrink:0;}.pr-line{display:inline-block;min-width:19px;border-bottom:1.5px solid #111;margin-right:0.14rem;flex-shrink:0;}.total-row{display:flex;align-items:baseline;justify-content:flex-start;margin-left:20%;gap:7px;font-size:11pt;font-weight:700;font-style:italic;margin-top:0.22rem;padding:0.15rem 0;page-break-before:avoid;break-before:avoid;color:#3b3a86;}.total-row .obt-line{min-width:80px;border-bottom:1.5px solid #3b3a86;}.pauta-wrap{page-break-before:always;padding-top:0.4rem;}.p-head{border-bottom:2px solid #333;padding-bottom:0.3rem;margin-bottom:0.4rem;text-align:center;}.p-main{font-size:9.5pt;font-weight:700;}.p-sub{font-size:7pt;color:#c00;font-weight:700;margin:0.08rem 0;}.p-meta{font-size:7pt;color:#555;}.p-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.4rem 0.9rem;}.p-sec{border:1px solid #ccc;border-radius:4px;padding:0.25rem 0.4rem;}.p-ttl{font-size:8pt;font-weight:700;border-bottom:1px solid #ddd;padding-bottom:0.1rem;margin-bottom:0.15rem;}.p-tbl{width:100%;border-collapse:collapse;font-size:7.5pt;}.p-tbl tr{border-bottom:1px dotted #ddd;}.p-tbl td{padding:0.07rem 0.12rem;vertical-align:top;}.pn{font-weight:700;width:16px;color:#555;}.pa{color:#007a00;font-weight:600;}.forma-tag{position:fixed;bottom:5mm;right:6mm;font-size:7pt;color:#555;border:1px solid #bbb;padding:1px 5px;border-radius:3px;background:white;}@media print{@page{size:letter portrait;margin:12.7mm;}}</style></head><body><div class="ph"><h2>Evaluación Final · Karl Popper · Filosofía de la Ciencia</h2><div class="ph-line"><strong>Nombre:</strong><span class="ph-fill">&nbsp;</span><strong>Fecha:</strong><span class="ph-m">&nbsp;</span></div><div class="ph-line"><strong>Instituto:</strong><span class="ph-fill">&nbsp;</span><strong>Grado y Sección:</strong><span class="ph-s">&nbsp;</span><strong>Nº Lista:</strong><span class="ph-xs">&nbsp;</span></div><p class="ph-crit">Valor total: 100 puntos · Cada respuesta vale 5 puntos</p></div>${s1}${s2}${s3}${s4}<div class="total-row"><span>Total, obtenido</span><span class="obt-line"></span><span>de 100%</span></div><div class="pauta-wrap"><div class="p-head"><div class="p-main">✅ PAUTA — Evaluación Final · Karl Popper · Forma ${forma}</div><div class="p-sub">Documento exclusivo del docente · No distribuir al estudiante</div><div class="p-meta">Valor total: 100 pts | 4 secciones × 5 preguntas × 5 pts c/u</div></div><div class="p-grid">${pR}</div></div><div class="forma-tag">Forma ${forma}</div></body></html>`;const win=window.open('','_blank','');if(!win){showToast('⚠️ Activa las ventanas emergentes para imprimir');return;}win.document.write(doc);win.document.close();setTimeout(()=>win.print(),400);}

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
  {txt:'Mateo afirma que tiene un amigo invisible que le susurra en sueños los números ganadores de la lotería; cuando no acierta, dice que "esta vez el amigo se equivocó".'},
  {txt:'Una vendedora asegura que su brazalete magnético cura cualquier dolor; cuando un cliente dice que no le funcionó, responde que "no lo usó con la fe suficiente".'},
  {txt:'Un astrólogo predice que "tendrás un día con altibajos emocionales"; pase lo que pase, el cliente siente que la predicción se cumplió.'},
  {txt:'Una curandera dice que cualquier mejora del paciente prueba que su remedio funciona, y cualquier empeoramiento se debe a que "el cuerpo todavía se está limpiando".'},
  {txt:'Un vendedor de un "detector de mentiras" casero afirma que el aparato siempre tiene razón: si coincide con lo que la gente ya pensaba, lo confirma; si no coincide, dice que "la persona mentía sobre su propia sinceridad".'},
  {txt:'Un profesor asegura que su método de estudio funciona siempre; cuando un alumno reprueba después de usarlo, dice que "seguramente no lo aplicó correctamente".'},
];
const critCaseQuestions=[
  '1. ¿La afirmación central del caso es falsable? Justifica tu respuesta.',
  '2. ¿Qué observación o resultado debería bastar para refutar la afirmación? ¿Por qué la persona del caso no lo acepta como una refutación?',
  '3. ¿Qué estrategia usa la persona del caso para "salvar" su afirmación de cualquier refutación posible?',
  '4. Según el criterio de demarcación de Popper, ¿esto es ciencia, pseudociencia o ninguna de las dos? Explica con tus palabras.',
];
const critCaseGuides=[
  'No es falsable tal como se presenta: cualquier resultado (acierto o fallo, mejora o empeoramiento) se reinterpreta para que la afirmación siga pareciendo verdadera.',
  'Cualquier resultado contrario (el fallo, la falta de mejora) debería contar como refutación, pero la persona lo reinterpreta con una excusa ad hoc ("se equivocó esta vez", "no tuvo suficiente fe") en vez de aceptar que su afirmación falló.',
  'Usa una explicación adicional introducida después del hecho (una "cláusula de escape" o hipótesis ad hoc) que protege la afirmación original de cualquier refutación posible.',
  'Es pseudociencia en el sentido de Popper: no porque sea necesariamente falsa, sino porque está formulada de manera que ninguna observación posible podría refutarla.',
];

const critErrorBank=[
  {txt:'"El criterio de Popper para la ciencia es la verificación: una teoría es científica si puede ser confirmada por suficientes observaciones. Por eso el psicoanálisis es claramente científico, ya que explica todos los casos clínicos."',
   g1:'El criterio de Popper no es la verificación sino la falsabilidad: una teoría es científica si puede ser refutada, no si puede confirmarse.',
   g2:'Que el psicoanálisis "explique todos los casos" es justamente la razón por la que Popper lo considera pseudociencia, no ciencia: no arriesga ninguna predicción que pueda fallar.'},
  {txt:'"Popper perteneció toda su vida al Círculo de Viena y defendió su principio de verificación como la mejor forma de demarcar la ciencia."',
   g1:'Popper nunca fue miembro del Círculo de Viena; dialogó con sus integrantes pero se consideró "la oposición oficial".',
   g2:'Popper no defendió el principio de verificación: lo rechazó y propuso en su lugar la falsabilidad.'},
  {txt:'"Según Popper, una sociedad cerrada es aquella que permite la crítica racional y el cambio pacífico de sus gobernantes, mientras que la sociedad abierta se basa en tabúes incuestionables."',
   g1:'Es al revés: la sociedad abierta es la que permite la crítica racional y el cambio pacífico de gobierno.',
   g2:'La sociedad cerrada es la que se basa en tabúes incuestionables y la obediencia a una autoridad única.'},
  {txt:'"El historicismo es el método que Popper recomienda para las ciencias sociales, pues permite predecir con certeza el curso futuro de la historia humana."',
   g1:'Popper no recomienda el historicismo: lo critica duramente, especialmente en su libro "La miseria del historicismo".',
   g2:'Popper sostiene que el futuro del conocimiento humano —y por tanto de la historia— no puede predecirse con certeza, porque no podemos conocer hoy lo que todavía no hemos descubierto.'},
  {txt:'"La inducción, según Popper, es un método lógicamente válido, porque cuantas más observaciones confirmen una teoría, más probada queda esta de forma definitiva."',
   g1:'Popper argumenta que la inducción NO es lógicamente válida: ningún número finito de observaciones puede probar de forma definitiva una ley universal.',
   g2:'Ninguna teoría queda "probada de forma definitiva"; en el mejor de los casos queda corroborada provisionalmente, siempre abierta a una futura refutación.'},
  {txt:'"La paradoja de la tolerancia de Popper afirma que una sociedad abierta debe tolerar absolutamente todas las ideas, incluidas las que buscan destruirla por la fuerza, para mantenerse siempre abierta."',
   g1:'Es lo contrario: Popper advierte que la tolerancia ilimitada hacia los intolerantes puede destruir la tolerancia misma.',
   g2:'Una sociedad abierta debe poner límites a quienes buscan destruirla por la fuerza, precisamente para poder seguir siendo tolerante.'},
];

const critDecisionBank=[
  'Un alcalde quiere reducir la inseguridad en su ciudad y, inspirado por una ideología, decide rediseñar de inmediato todas las instituciones de gobierno según un plan ideal único, sin pruebas previas ni posibilidad de dar marcha atrás.',
  'Un ministro de educación quiere mejorar el aprendizaje de matemáticas en todo el país y ordena implementar, de un día para otro y en todas las escuelas a la vez, un método de enseñanza nunca antes probado.',
  'Una empresa quiere mejorar la satisfacción de sus empleados y decide imponer, sin consulta ni prueba previa, un cambio total e irreversible en la estructura de toda la organización.',
  'Un gobierno, convencido de tener la "verdad histórica" sobre cómo debe organizarse la sociedad, elimina de inmediato todas las instituciones existentes para reemplazarlas por su modelo ideal.',
  'Una universidad quiere reducir la deserción estudiantil y decide cambiar de golpe, para todas las carreras y sin evaluación posterior, el sistema completo de evaluación académica.',
];
const critDecisionGuide='Según Popper, lo correcto es aplicar ingeniería social gradual (piecemeal): introducir el cambio a pequeña escala y de forma reversible (por ejemplo, en una zona, una escuela o un departamento piloto), medir sus resultados, estar dispuesto a corregirlo o revertirlo si falla, y solo extenderlo gradualmente si la evidencia lo respalda — en vez de imponer de golpe un plan utópico e irreversible para toda la sociedad u organización.';

const critCompareBank=[
  {a:'Una teoría predice que, si es correcta, un satélite debería detectar una señal específica el próximo mes; si no aparece, los científicos la abandonarán.',b:'Una corriente de pensamiento sostiene que cualquier crisis económica confirma su teoría, y cualquier período de bonanza se explica como una fase temporal antes de la crisis inevitable.',
   ga:'Caso A — Ciencia: arriesga una predicción precisa y temporal que podría no cumplirse, y sus autores aceptan que eso la refutaría.',
   gb:'Caso B — Pseudociencia (en el sentido popperiano): reinterpreta cualquier evento, favorable o desfavorable, como confirmación, sin arriesgar nunca una predicción que pueda fallar.',
   gr:'No son el mismo caso: uno expone su teoría a un resultado que podría refutarla (ciencia) y el otro inmuniza su teoría contra cualquier resultado posible (pseudociencia).'},
  {a:'Un biólogo predice que, si su hipótesis sobre una mutación es correcta, deberían encontrarse fósiles con una característica específica en una capa geológica determinada.',b:'Un vendedor de un suplemento asegura que "fortalece las defensas del cuerpo" sin especificar qué significaría que esto fallara ni cómo podría comprobarse.',
   ga:'Caso A — Ciencia: la predicción es específica y comprobable; si los fósiles no aparecen donde se esperaba, la hipótesis quedaría debilitada o refutada.',
   gb:'Caso B — Pseudociencia: la afirmación es tan vaga que ninguna observación podría contradecirla.',
   gr:'No son el mismo caso: uno ofrece un criterio claro de refutación (encontrar o no los fósiles esperados) y el otro no ofrece ningún criterio posible de refutación.'},
  {a:'Una sociedad permite que los ciudadanos voten y reemplacen pacíficamente a su gobierno cuando consideran que ha fallado.',b:'Un régimen sostiene que su líder representa una verdad histórica incuestionable y prohíbe cualquier crítica pública a sus decisiones.',
   ga:'Caso A — Sociedad abierta: las instituciones permiten la crítica racional y el cambio pacífico de gobierno.',
   gb:'Caso B — Sociedad cerrada: impone una verdad única y reprime la crítica, rasgo del totalitarismo que Popper combate.',
   gr:'No son el mismo caso: uno institucionaliza la posibilidad de corregir errores políticos sin violencia, y el otro hace imposible cualquier corrección pacífica.'},
  {a:'Un gobierno prueba una reforma educativa primero en algunas escuelas piloto, evalúa los resultados durante dos años y decide si la extiende, la ajusta o la cancela.',b:'Un gobierno impone de inmediato una reforma educativa radical en todo el país, sin evaluación previa y sin posibilidad de revertirla.',
   ga:'Caso A — Ingeniería social gradual: cambio pequeño, reversible, evaluado con evidencia antes de generalizarse.',
   gb:'Caso B — Ingeniería social utópica/holística: cambio total e irreversible impuesto sin pruebas previas, el tipo de planificación que Popper asocia con el riesgo totalitario.',
   gr:'No son el mismo caso: uno permite corregir el error si la reforma falla, y el otro no deja margen para detectar ni corregir un fracaso a tiempo.'},
];

const critCauseBank=[
  {cause:'Un investigador diseña su teoría de modo que cualquier resultado experimental, sin importar cuál sea, pueda interpretarse como una confirmación.',guide:'La teoría se vuelve pseudocientífica: pierde su capacidad de ser puesta a prueba y, por tanto, su valor explicativo real, aunque parezca muy persuasiva.'},
  {cause:'Un gobierno impone de golpe un cambio institucional total inspirado en una ideología que se considera la "verdad histórica" definitiva.',guide:'Aumenta el riesgo de derivar en una sociedad cerrada y, en casos extremos, en totalitarismo, porque se elimina la posibilidad de corregir errores mediante la crítica.'},
  {cause:'Una persona se acostumbra a buscar siempre evidencia que confirme lo que ya cree, evitando las pruebas que podrían contradecirlo.',guide:'Cae en un sesgo de confirmación incompatible con el racionalismo crítico, que exige buscar activamente las pruebas que podrían refutar nuestras propias creencias.'},
];
const critEffectBank=[
  {effect:'Una teoría científica que durante un siglo resistió múltiples intentos serios de refutación es reemplazada al encontrarse un solo experimento que contradice sus predicciones.',guide:'Esto ocurre porque, para Popper, ninguna teoría está probada de forma definitiva: basta una observación contraria sólida para refutarla, sin importar cuántas confirmaciones previas tuviera.'},
  {effect:'Un grupo político pierde el poder en una elección y lo entrega pacíficamente sin violencia.',guide:'Esto es posible porque viven en una sociedad abierta, donde las instituciones permiten el cambio de gobierno mediante la crítica racional y el voto, no mediante la fuerza.'},
  {effect:'Una reforma social fallida pudo corregirse rápidamente, con poco daño, antes de afectar a todo el país.',guide:'Esto ocurre cuando se aplica ingeniería social gradual: el cambio se probó primero a pequeña escala y de forma reversible, lo que permitió detectar y corregir el error a tiempo.'},
];

function genEvalCrit(){
  sfx('click');
  const cf=evalCritFormNum;window._currentEvalCritForm=cf;evalCritFormNum=(evalCritFormNum%10)+1;saveProgress();
  document.getElementById('evalcrit-screen-title').textContent=`🧠 Pensamiento Crítico · Forma ${cf} · Karl Popper`;
  evalCritAnsVisible=false;
  const out=document.getElementById('evalCritOut');out.innerHTML='';

  const kase=_pick(critCaseBank,1)[0];
  const s1=document.createElement('div');
  s1.innerHTML=`<div class="eval-section-title">I. Caso de análisis: razonamiento falsacionista <span class="eval-pts">20 pts</span></div><div class="eval-item"><div class="crit-scenario">${kase.txt}</div>${critCaseQuestions.map((q,i)=>`<div class="crit-q-block"><div class="crit-q-label">${q}</div><textarea class="crit-textarea" rows="2" aria-label="${q}"></textarea><div class="crit-pauta">${critCaseGuides[i]}</div></div>`).join('')}<div class="crit-selfscore"><label for="critScore0">Obtenido:</label><input type="number" id="critScore0" class="crit-score-input" data-score="0" min="0" max="20" value="0"> <span>de 20 pts</span></div></div>`;
  out.appendChild(s1);

  const err=_pick(critErrorBank,1)[0];
  const s2=document.createElement('div');
  s2.innerHTML=`<div class="eval-section-title">II. Corrige el error <span class="eval-pts">20 pts</span></div><div class="eval-item"><div class="crit-scenario">${err.txt}</div><p style="font-size:0.85rem;margin-bottom:0.5rem;">Identifica <strong>dos errores</strong> y corrígelos con tus propias palabras:</p><div class="crit-q-block"><div class="crit-q-label">Error 1 y su corrección:</div><textarea class="crit-textarea" rows="2" aria-label="Error 1 y su corrección"></textarea><div class="crit-pauta">${err.g1}</div></div><div class="crit-q-block"><div class="crit-q-label">Error 2 y su corrección:</div><textarea class="crit-textarea" rows="2" aria-label="Error 2 y su corrección"></textarea><div class="crit-pauta">${err.g2}</div></div><div class="crit-selfscore"><label for="critScore1">Obtenido:</label><input type="number" id="critScore1" class="crit-score-input" data-score="1" min="0" max="20" value="0"> <span>de 20 pts</span></div></div>`;
  out.appendChild(s2);

  const dec=_pick(critDecisionBank,1)[0];
  const s3=document.createElement('div');
  s3.innerHTML=`<div class="eval-section-title">III. Toma de decisiones: ingeniería social <span class="eval-pts">20 pts</span></div><div class="eval-item"><div class="crit-scenario">${dec}</div><div class="crit-q-block"><div class="crit-q-label">¿Qué le recomendarías hacer según el enfoque de Popper sobre el cambio social, y por qué sería mejor que el plan descrito?</div><textarea class="crit-textarea" rows="4" aria-label="Recomendación y justificación"></textarea><div class="crit-pauta">${critDecisionGuide}</div></div><div class="crit-selfscore"><label for="critScore2">Obtenido:</label><input type="number" id="critScore2" class="crit-score-input" data-score="2" min="0" max="20" value="0"> <span>de 20 pts</span></div></div>`;
  out.appendChild(s3);

  const cmp=_pick(critCompareBank,1)[0];
  const s4=document.createElement('div');
  s4.innerHTML=`<div class="eval-section-title">IV. Comparación razonada <span class="eval-pts">20 pts</span></div><div class="eval-item"><div class="crit-compare-grid"><div class="crit-compare-box"><h5>Caso A</h5>${cmp.a}</div><div class="crit-compare-box"><h5>Caso B</h5>${cmp.b}</div></div><div class="crit-q-block"><div class="crit-q-label">1. ¿Cómo calificarías cada caso según los conceptos de Popper? 2. ¿Por qué no son el mismo caso?</div><textarea class="crit-textarea" rows="4" aria-label="Comparación razonada de los casos A y B"></textarea><div class="crit-pauta">Caso A: ${cmp.ga} · Caso B: ${cmp.gb} · ${cmp.gr}</div></div><div class="crit-selfscore"><label for="critScore3">Obtenido:</label><input type="number" id="critScore3" class="crit-score-input" data-score="3" min="0" max="20" value="0"> <span>de 20 pts</span></div></div>`;
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
  let s1=`<div class="sec-title"><span>I. Caso de análisis: razonamiento falsacionista</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 20</span></div></div><p class="crit-print-scenario">${d.kase.txt}</p>`;
  critCaseQuestions.forEach(q=>{s1+=`<p class="crit-print-q">${q}</p>${lines(1)}`;});
  let s2=`<div class="sec-title"><span>II. Corrige el error</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 20</span></div></div><p class="crit-print-scenario">${d.err.txt}</p><p class="crit-print-q">Identifica dos errores y corrígelos con tus propias palabras:</p><p class="crit-print-q"><strong>Error 1:</strong></p>${lines(1)}<p class="crit-print-q"><strong>Error 2:</strong></p>${lines(1)}`;
  let s3=`<div class="sec-title"><span>III. Toma de decisiones: ingeniería social</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 20</span></div></div><p class="crit-print-scenario">${d.dec}</p><p class="crit-print-q">¿Qué le recomendarías hacer según el enfoque de Popper, y por qué sería mejor que el plan descrito?</p>${lines(2)}`;
  let s4=`<div class="sec-title"><span>IV. Comparación razonada</span><div class="obt-row"><span class="obt-lbl">Obtenido:</span><span class="obt-line"></span><span class="obt-pct">de 20</span></div></div><div class="crit-compare-print-grid"><div class="crit-compare-print-box"><strong>Caso A:</strong> ${d.cmp.a}</div><div class="crit-compare-print-box"><strong>Caso B:</strong> ${d.cmp.b}</div></div><p class="crit-print-q">1. ¿Cómo calificarías cada caso según los conceptos de Popper? 2. ¿Por qué no son el mismo caso?</p>${lines(2)}`;
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
  const doc=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Pensamiento Crítico Karl Popper · Forma ${forma}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#111;background:#fff;padding:1mm 5mm;}.ph{margin-bottom:0.3rem;}.ph h2{font-size:11pt;font-weight:700;text-align:center;margin-bottom:0.2rem;}.ph-line{display:flex;align-items:baseline;gap:5px;margin-bottom:3px;}.ph-fill{flex:1;border-bottom:1px solid #555;min-height:12px;display:block;}.ph-m{display:inline-block;min-width:80px;border-bottom:1px solid #555;}.ph-s{display:inline-block;min-width:52px;border-bottom:1px solid #555;}.ph-xs{display:inline-block;min-width:36px;border-bottom:1px solid #555;}.ph-crit{font-size:9.5pt;text-align:center;color:#555;margin-top:0.1rem;}.sec-title{font-size:10.5pt;font-weight:700;padding:0.1rem 0.4rem;margin:0.2rem 0 0.1rem;display:flex;justify-content:space-between;align-items:center;border-left:4px solid #3b3a86;background:#ece9fb;color:#3b3a86;}.obt-row{display:flex;align-items:baseline;gap:4px;font-size:9.5pt;font-weight:700;font-style:italic;color:#3b3a86;}.obt-lbl{white-space:nowrap;}.obt-line{display:inline-block;min-width:50px;border-bottom:1.5px solid #3b3a86;height:12px;}.obt-pct{white-space:nowrap;}.crit-print-scenario{font-size:10.5pt;background:#ece9fb;border-left:3px solid #3b3a86;padding:0.2rem 0.5rem;margin:0.1rem 0 0.2rem;line-height:1.3;}.crit-print-q{font-size:10pt;font-weight:600;margin:0.15rem 0 0.08rem;line-height:1.25;}.ln{border-bottom:1px solid #111;min-height:12px;margin-bottom:2px;}.crit-compare-print-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin:0.15rem 0;}.crit-compare-print-box{font-size:9.5pt;background:#ece9fb;border-radius:4px;padding:0.25rem 0.4rem;line-height:1.25;}.crit-print-tbl{width:100%;border-collapse:collapse;font-size:9.5pt;margin-top:0.15rem;}.crit-print-tbl th,.crit-print-tbl td{border:1px solid #999;padding:0.3rem 0.45rem;text-align:left;height:30px;vertical-align:middle;}.crit-print-tbl th{background:#ece9fb;}.pauta-wrap{page-break-before:always;padding-top:0.4rem;}.p-head{border-bottom:2px solid #333;padding-bottom:0.3rem;margin-bottom:0.4rem;text-align:center;}.p-main{font-size:9.5pt;font-weight:700;}.p-sub{font-size:7pt;color:#c00;font-weight:700;margin:0.08rem 0;}.p-meta{font-size:7pt;color:#555;}.p-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.4rem 0.9rem;}.p-sec{border:1px solid #ccc;border-radius:4px;padding:0.3rem 0.45rem;}.p-ttl{font-size:8pt;font-weight:700;border-bottom:1px solid #ddd;padding-bottom:0.1rem;margin-bottom:0.18rem;}.p-crit-line{font-size:7.5pt;color:#007a00;margin-bottom:0.18rem;line-height:1.35;}.total-row{display:flex;align-items:baseline;justify-content:flex-start;margin-left:20%;gap:7px;font-size:11pt;font-weight:700;font-style:italic;margin-top:0.2rem;padding:0.1rem 0;color:#3b3a86;}.total-row .obt-line{min-width:80px;border-bottom:1.5px solid #3b3a86;}.forma-tag{position:fixed;bottom:5mm;right:6mm;font-size:7pt;color:#555;border:1px solid #bbb;padding:1px 5px;border-radius:3px;background:white;}@media print{@page{size:letter portrait;margin:12.7mm;}}</style></head><body><div class="ph"><h2>Evaluación Competencial · Pensamiento Crítico · Karl Popper · Filosofía de la Ciencia</h2><div class="ph-line"><strong>Nombre:</strong><span class="ph-fill">&nbsp;</span><strong>Fecha:</strong><span class="ph-m">&nbsp;</span></div><div class="ph-line"><strong>Institución:</strong><span class="ph-fill">&nbsp;</span><strong>Grado y Sección:</strong><span class="ph-s">&nbsp;</span><strong>Nº Lista:</strong><span class="ph-xs">&nbsp;</span></div><p class="ph-crit">Valor total: 100 puntos · 5 secciones de 20 puntos</p></div>${s1}${s2}${s3}${s4}${s5}<div class="total-row"><span>Total, obtenido</span><span class="obt-line"></span><span>de 100</span></div><div class="pauta-wrap"><div class="p-head"><div class="p-main">✅ PAUTA — Pensamiento Crítico · Karl Popper · Forma ${forma}</div><div class="p-sub">Documento exclusivo del docente · No distribuir al estudiante</div><div class="p-meta">Valor total: 100 pts | 5 secciones × 20 pts c/u — respuesta abierta, usar como guía de corrección</div></div><div class="p-grid">${pR}</div></div><div class="forma-tag">Forma ${forma}</div></body></html>`;
  const win=window.open('','_blank','');
  if(!win){showToast('⚠️ Activa las ventanas emergentes para imprimir');return;}
  win.document.write(doc);win.document.close();setTimeout(()=>win.print(),400);
}

// ===================== LÍNEA DE TIEMPO INTERACTIVA =====================
const timelineData=[
  {y:'1902',icon:'🍼',label:'Nace en Viena',text:'<strong>28 de julio de 1902:</strong> nace en Viena, Austria-Hungría, en una familia de origen judío convertida al protestantismo. Su padre, abogado, le transmite el amor por los libros y las ideas.'},
  {y:'1919',icon:'⚡',label:'Ruptura con el marxismo',text:'Tras presenciar un episodio violento ligado al marxismo, Popper se distancia de esta doctrina. Compara el dogmatismo de Marx y Adler con el riesgo real que asumió Einstein al predecir la curvatura de la luz: nace la semilla de la falsabilidad.'},
  {y:'1928',icon:'🎓',label:'Doctorado en Filosofía',text:'Obtiene su doctorado en la Universidad de Viena con una tesis sobre metodología de la psicología cognitiva.'},
  {y:'1934',icon:'📘',label:'Lógica de la investigación científica',text:'Publica en Viena <em>Logik der Forschung</em>. Dialoga con el Círculo de Viena sin pertenecer a él; se autodenomina "la oposición oficial" frente al verificacionismo de sus miembros.'},
  {y:'1937',icon:'🚢',label:'Exilio en Nueva Zelanda',text:'Ante el avance del nazismo y su ascendencia judía, emigra a Christchurch (Nueva Zelanda) para enseñar filosofía en el Canterbury University College.'},
  {y:'1945',icon:'🏛️',label:'La sociedad abierta y sus enemigos',text:'Escribe esta defensa de la democracia liberal durante la guerra. Critica el historicismo de Platón, Hegel y Marx como germen del totalitarismo.'},
  {y:'1946',icon:'🇬🇧',label:'Se traslada a Londres',text:'Gracias al apoyo de Friedrich Hayek, se incorpora a la London School of Economics (LSE), donde será profesor de Lógica y Método Científico.'},
  {y:'1963',icon:'📚',label:'Conjeturas y refutaciones',text:'Publica esta influyente colección de ensayos: "no somos estudiantes de una materia, sino estudiantes de problemas". Resume su visión del conocimiento como ensayo y eliminación de errores.'},
  {y:'1965',icon:'🗡️',label:'Es nombrado Sir',text:'La reina Isabel II le otorga el título de caballero: a partir de entonces, Sir Karl Popper.'},
  {y:'1972',icon:'🌐',label:'Conocimiento objetivo',text:'Presenta su teoría de los <strong>Tres Mundos</strong>: el mundo físico, el mundo mental y el "Mundo 3" del conocimiento objetivo (teorías, problemas, libros).'},
  {y:'1994',icon:'🕊️',label:'Muere en Londres',text:'Fallece el 17 de septiembre de 1994, dejando una de las filosofías de la ciencia y la política más influyentes del siglo XX.'}
];
function initTimeline(){const track=document.getElementById('timelineTrack');if(!track)return;timelineData.forEach((d,i)=>{const b=document.createElement('button');b.className='tl-node';b.type='button';b.dataset.idx=i;b.innerHTML=`<span class="tl-dot">${d.icon}</span><span class="tl-year">${d.y}</span><span class="tl-label">${d.label}</span>`;b.onclick=()=>showTimeline(i);track.appendChild(b);});}
function showTimeline(i){const d=timelineData[i];document.querySelectorAll('.tl-node').forEach(n=>n.classList.remove('tl-active'));document.querySelector(`.tl-node[data-idx="${i}"]`).classList.add('tl-active');document.getElementById('tlInfoIcon').textContent=d.icon;document.getElementById('tlInfoText').innerHTML=`<strong>${d.y} — ${d.label}.</strong> ${d.text}`;document.getElementById('tlInfo').classList.add('show');sfx('click');}

// ===================== SIMULACIÓN: MÉTODO DE POPPER =====================
let methodRunning=false;
function startMethod(){if(methodRunning)return;methodRunning=true;sfx('click');document.getElementById('methodBtn').style.display='none';document.getElementById('methodBranch').classList.remove('show');document.getElementById('methodResult').innerHTML='';const steps=['ms1','ms2','ms3','ms4'];const arrows=['ma1','ma2','ma3'];steps.forEach(s=>document.getElementById(s).classList.remove('active','done'));arrows.forEach(a=>document.getElementById(a).classList.remove('active'));let i=0;function next(){if(i>0){document.getElementById(steps[i-1]).classList.remove('active');document.getElementById(steps[i-1]).classList.add('done');}if(i<steps.length){if(i>0)document.getElementById(arrows[i-1]).classList.add('active');document.getElementById(steps[i]).classList.add('active');sfx('ok');i++;setTimeout(next,900);}else{document.getElementById('methodBranch').classList.add('show');}}next();}
function resolveMethod(corroborada){sfx(corroborada?'ok':'no');document.getElementById('methodBranch').classList.remove('show');document.getElementById('ms4').classList.remove('active');document.getElementById('ms4').classList.add('done');const r=document.getElementById('methodResult');if(corroborada){r.innerHTML=`<div class="method-step done" style="opacity:1;"><span class="ms-num">5</span><span class="ms-icon">✅</span><span class="ms-text"><strong>Corroborada (no probada):</strong> la teoría resistió el intento de refutación. Sigue siendo válida de forma provisional, nunca definitiva.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🔁</span><span class="ms-text"><strong>Nueva conjetura:</strong> el conocimiento sigue avanzando con teorías cada vez más audaces y mejor probadas.</span></div>`;}else{r.innerHTML=`<div class="method-step done" style="opacity:1;border-color:var(--red);background:var(--red-gl);"><span class="ms-num">5</span><span class="ms-icon">❌</span><span class="ms-text"><strong>Refutada (falsada):</strong> apareció un "cisne negro" — un hecho que la teoría no puede explicar. Se descarta o se modifica.</span></div><div class="method-arrow active" style="margin:0.4rem 0;">⬇️</div><div class="method-step done" style="opacity:1;"><span class="ms-num">6</span><span class="ms-icon">🔁</span><span class="ms-text"><strong>Nueva conjetura:</strong> se propone una teoría mejor que sí explique el caso que refutó a la anterior.</span></div>`;}methodRunning=false;document.getElementById('methodBtn').style.display='inline-flex';document.getElementById('methodBtn').textContent='🔄 Repetir simulación';sfx('fan');}

// ===================== LABORATORIO DE CONCEPTOS =====================
const parteData={
  falsabilidad:{
    nombre:'Falsabilidad',icon:'🎯',
    estructura:{title:'Definición',info:'• Criterio propuesto por Popper para distinguir la <strong>ciencia</strong> de la <strong>pseudociencia</strong><br>• Una teoría es científica si, en principio, puede ser <strong>refutada</strong> por la experiencia<br>• No exige que la teoría sea verdadera, sino que <strong>arriesgue</strong> algo comprobable<br>• Reemplaza el criterio de <strong>verificación</strong> del Círculo de Viena<br>• Presentado en <em>La lógica de la investigación científica</em> (1934)'},
    funcion:{title:'Argumento clave',info:'• El contraste de 1919: Einstein arriesgó una predicción precisa (curvatura de la luz) que <strong>podía fallar</strong><br>• Freud y Adler, en cambio, podían explicar <strong>cualquier</strong> conducta humana después de que ocurriera<br>• Cuanto más arriesgada y precisa la predicción, <strong>más científica</strong> es la teoría si resiste la prueba<br>• Las teorías nunca se prueban del todo: solo quedan <strong>corroboradas provisionalmente</strong>'},
    enfermedades:{title:'Objeciones y críticas',info:'• Algunos filósofos (como Quine) señalan que casi cualquier teoría puede <strong>salvarse</strong> con hipótesis auxiliares ad hoc<br>• Thomas Kuhn argumentó que la ciencia real avanza por <strong>paradigmas</strong>, no solo por refutaciones puntuales<br>• El propio Popper dudó durante años si el darwinismo era estrictamente falsable, aunque luego lo aceptó como científico<br>• Definir con precisión qué cuenta como una "refutación severa" no siempre es sencillo'},
    cuidados:{title:'Ejemplo aplicado',info:'• "Todos los cisnes son blancos" es falsable: basta <strong>un cisne negro</strong> para refutarla<br>• "La vida siempre te da lo que necesitas" no es falsable: cualquier hecho puede encajar en ella<br>• Un horóscopo vago ("tendrás un día de altibajos") no arriesga nada comprobable<br>• Una vacuna cuyo efecto puede medirse contra un placebo sí es falsable'}
  },
  sociedad_abierta:{
    nombre:'Sociedad abierta',icon:'🔓',
    estructura:{title:'Definición',info:'• Concepto presentado en <em>La sociedad abierta y sus enemigos</em> (1945)<br>• Sociedad donde los individuos pueden <strong>criticar y cambiar pacíficamente</strong> sus instituciones<br>• Se opone a la <strong>sociedad cerrada</strong>: tribal, dogmática, basada en tabúes incuestionables<br>• Defiende la <strong>democracia liberal</strong> como sistema que permite corregir errores sin violencia'},
    funcion:{title:'Argumento clave',info:'• Popper critica el <strong>historicismo</strong> de Platón, Hegel y Marx: la idea de que la historia sigue leyes inevitables<br>• Una sociedad abierta no necesita conocer el "sentido de la historia": solo necesita <strong>poder corregirse</strong><br>• El valor central no es alcanzar una utopía, sino poder <strong>reemplazar pacíficamente</strong> a quienes gobiernan mal<br>• La <strong>paradoja de la tolerancia</strong>: no tolerar a quien busca destruir la tolerancia misma'},
    enfermedades:{title:'Objeciones y críticas',info:'• Se le ha acusado de simplificar el pensamiento de Platón y Hegel para construir un "enemigo" claro<br>• Algunos critican que el modelo liberal que defiende no resuelve por sí solo la desigualdad económica<br>• La "paradoja de la tolerancia" puede usarse, si no se aplica con cuidado, para justificar la censura<br>• Pensadores comunitaristas cuestionan si el individualismo de Popper subestima los lazos sociales y culturales'},
    cuidados:{title:'Ejemplo aplicado',info:'• Un país donde una elección perdida significa una <strong>entrega pacífica</strong> del poder es una sociedad abierta<br>• Un régimen que prohíbe toda crítica pública a su líder se acerca a una <strong>sociedad cerrada</strong><br>• Permitir medios de prensa independientes es un mecanismo típico de <strong>autocorrección</strong> social<br>• Negarse a tolerar partidos que buscan abolir las elecciones por la fuerza ilustra la paradoja de la tolerancia'}
  },
  racionalismo_critico:{
    nombre:'Racionalismo crítico',icon:'🧭',
    estructura:{title:'Definición',info:'• Actitud filosófica que acepta que <strong>toda creencia puede estar equivocada</strong> (falibilismo)<br>• Propone avanzar mediante la <strong>crítica</strong> y la disposición a corregir el error, no buscando certezas absolutas<br>• Se opone al <strong>dogmatismo</strong> (aferrarse a una idea sin importar la evidencia) y al relativismo extremo<br>• Aplica tanto a la ciencia como a la <strong>política</strong> y a la vida cotidiana'},
    funcion:{title:'Argumento clave',info:'• "No sabemos, solo conjeturamos": todo conocimiento es <strong>provisional</strong><br>• La ciencia no busca certeza, busca <strong>eliminar errores</strong> mediante pruebas severas<br>• Ser racional no es tener razón, sino estar <strong>dispuesto a escuchar la crítica</strong> y cambiar de opinión<br>• "Somos estudiantes de problemas, no de materias" (<em>Conjeturas y refutaciones</em>, 1963)'},
    enfermedades:{title:'Objeciones y críticas',info:'• Críticos señalan que el racionalismo crítico no explica del todo <strong>cómo elegir</strong> entre teorías igualmente no refutadas<br>• Algunos lo consideran difícil de aplicar a decisiones morales o estéticas, donde no hay "refutación" clara<br>• Otros argumentan que ningún científico abandona una teoría apreciada tras <strong>una sola</strong> anomalía, como Popper idealiza'},
    cuidados:{title:'Ejemplo aplicado',info:'• Un estudiante que defiende su respuesta pero <strong>revisa su trabajo</strong> al encontrar un error, en vez de ignorarlo<br>• Un científico que publica resultados que <strong>contradicen</strong> su propia hipótesis favorita<br>• Un debate público donde ambas partes aceptan cambiar de postura si se presenta <strong>mejor evidencia</strong><br>• Lo opuesto sería repetir un dogma político sin aceptar nunca ninguna objeción'}
  },
  tres_mundos:{
    nombre:'Los Tres Mundos',icon:'🌐',
    estructura:{title:'Definición',info:'• Teoría presentada en <em>Conocimiento objetivo</em> (1972)<br>• <strong>Mundo 1</strong>: los objetos y procesos físicos (átomos, cerebros, el papel de un libro)<br>• <strong>Mundo 2</strong>: los estados mentales y experiencias subjetivas (pensamientos, dolores, recuerdos)<br>• <strong>Mundo 3</strong>: el conocimiento objetivo (teorías, problemas, argumentos, obras), independiente de quien lo piense'},
    funcion:{title:'Argumento clave',info:'• El Mundo 3 existe de forma <strong>autónoma</strong>: un teorema matemático tiene consecuencias que nadie ha descubierto todavía<br>• Una vez creada, una teoría puede <strong>"escapar" a las intenciones</strong> de su autor y generar nuevos problemas<br>• Esto explica por qué el conocimiento puede <strong>crecer objetivamente</strong>, más allá de lo que contiene un solo cerebro (Mundo 2)<br>• Un libro destruido sigue perteneciendo al Mundo 3 si su contenido sobrevive en otras copias o mentes'},
    enfermedades:{title:'Objeciones y críticas',info:'• Se le critica ser una postura <strong>metafísicamente</strong> cargada: ¿en qué sentido "existen" las ideas si nadie las piensa?<br>• Algunos filósofos materialistas rechazan que el Mundo 3 sea una categoría separada y no solo una forma de hablar del Mundo 1 y 2<br>• La relación exacta entre los tres mundos (cómo interactúan entre sí) sigue siendo discutida'},
    cuidados:{title:'Ejemplo aplicado',info:'• El <strong>teorema de Pitágoras</strong> (Mundo 3) es distinto de cualquier libro de texto que lo imprime (Mundo 1) o de que alguien lo entienda (Mundo 2)<br>• Una sinfonía como <strong>partitura y estructura musical</strong> objetiva (Mundo 3) es distinta del sonido físico (Mundo 1) o de la emoción al escucharla (Mundo 2)<br>• Un programa de computadora como <strong>algoritmo</strong> (Mundo 3) es distinto del disco duro que lo almacena (Mundo 1)'}
  }
};
let labParte='falsabilidad',labAspecto='estructura';
function labShowParte(parteKey){labParte=parteKey;updateLabDisplay();document.querySelectorAll('.lab-cont-btn').forEach(b=>b.classList.remove('active-pri'));const btn=document.querySelector(`[data-parte="${parteKey}"]`);if(btn)btn.classList.add('active-pri');if(typeof sfx==='function')sfx('click');}
function labShowAspecto(aspectoKey){labAspecto=aspectoKey;updateLabDisplay();document.querySelectorAll('.lab-asp-btn').forEach(b=>b.classList.remove('active-sec'));const btn=document.querySelector(`[data-aspecto="${aspectoKey}"]`);if(btn)btn.classList.add('active-sec');if(typeof sfx==='function')sfx('click');}
function updateLabDisplay(){const data=parteData[labParte];const asp=data[labAspecto];document.getElementById('lab-sentence').innerHTML=`🦉 Explorando: <strong>${data.nombre}</strong> → <strong>${asp.title}</strong>`;document.getElementById('lab-display').innerHTML=`<div class="lab-cont-header">${data.icon} ${data.nombre}</div><div class="lab-asp-title">${asp.title}</div><div class="lab-asp-info">${asp.info}</div>`;}

// ===================== DIPLOMA =====================
function _diplPct(){return xp>=MXP?100:Math.round((xp/MXP)*100);}
function openDiploma(){sfx('fan');const pct=_diplPct();document.getElementById('diplPct').textContent=pct+'%';document.getElementById('diplBar').style.width=pct+'%';document.getElementById('diplDate').textContent='Fecha: '+new Date().toLocaleDateString('es-HN',{year:'numeric',month:'long',day:'numeric'});const msgs=['¡Sigue aprendiendo!','¡Muy buen trabajo!','¡Excelente racionalista crítico!','¡Eres un experto en epistemología popperiana!','¡Maestro Popperiano!'];document.getElementById('diplMsg').textContent=msgs[Math.min(Math.floor(pct/25),4)];const stars=['⭐','⭐⭐','⭐⭐⭐'];document.getElementById('diplStars').textContent=stars[Math.min(Math.floor(pct/40),2)];const achTxt=unlockedAch.map(id=>ACHIEVEMENTS[id].icon+' '+ACHIEVEMENTS[id].label).join(' · ');document.getElementById('diplAch').textContent=achTxt||'Sigue completando secciones para desbloquear logros';document.getElementById('diplomaOverlay').classList.add('open');launchConfetti();}
function closeDiploma(){document.getElementById('diplomaOverlay').classList.remove('open');}
function updateDiplomaName(v){document.getElementById('diplName').textContent=v||'Estudiante';}
function shareWA(){const name=document.getElementById('diplName').textContent||'Estudiante';const pct=_diplPct();const msg=`🦢 ¡${name} completó la Misión "Karl Popper"! 🏅 Progreso: ${pct}% · 🦉 policastsapien.com`;window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');}
async function captureDiploma(){if(typeof html2canvas==='undefined'){showToast('⚠️ Cargando... intenta de nuevo');return;}sfx('click');const card=document.querySelector('.diploma-card');const btn=document.querySelector('.diploma-actions .btn-pri');const toHide=[card.querySelector('.diploma-input'),card.querySelector('.diploma-actions'),card.querySelector('hr')];if(btn){btn.disabled=true;btn.textContent='⏳ Capturando...';}toHide.forEach(el=>{if(el)el.style.display='none';});let dataUrl='';try{const canvas=await html2canvas(card,{scale:2,useCORS:true,backgroundColor:'#ffffff'});toHide.forEach(el=>{if(el)el.style.display='';});dataUrl=canvas.toDataURL('image/png');const name=(document.getElementById('diplName').textContent||'Estudiante').replace(/\s+/g,'-');const fileName='constancia-'+name+'.png';const cap=window.Capacitor;if(cap&&cap.isNativePlatform&&cap.isNativePlatform()&&cap.Plugins?.Filesystem&&cap.Plugins?.Share){const base64Data=dataUrl.split(',')[1];const result=await cap.Plugins.Filesystem.writeFile({path:fileName,data:base64Data,directory:'CACHE'});await cap.Plugins.Share.share({url:result.uri,dialogTitle:'Guardar / Compartir Constancia'});}else{const a=document.createElement('a');a.href=dataUrl;a.download=fileName;a.click();}}catch(e){toHide.forEach(el=>{if(el)el.style.display='';});if(e.name!=='AbortError')showToast('⚠️ No se pudo guardar la constancia');}finally{if(btn){btn.disabled=false;btn.textContent='📷 Guardar foto';}}}

// ===================== INIT =====================
window.addEventListener('DOMContentLoaded',()=>{
  initTheme();
  loadProgress();
  initTimeline();
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
  document.querySelector('[data-parte="falsabilidad"]')?.classList.add('active-pri');
  document.querySelector('[data-aspecto="estructura"]')?.classList.add('active-sec');
  renderAchPanel();
});
