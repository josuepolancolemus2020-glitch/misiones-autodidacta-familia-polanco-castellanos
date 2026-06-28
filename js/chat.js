'use strict';

const SUPABASE_URL = 'https://bzrnjvalpwlcnpszvwim.supabase.co';
const SUPABASE_KEY = 'sb_publishable_74mJW5LoxPZOWtIi7YrBEw_0y9JjSfM';
const CHAT_TABLE   = 'mensajes';

const _sb = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

let _chatChannel = null;
let _chatSendTopic   = 'General'; // tema con el que se etiqueta el próximo mensaje a enviar
let _chatFilterTopic = '';        // '' = Todas; si no, filtra el historial por ese tema

function _chatTopicClass(tema) {
  if (!tema || tema === 'General') return '';
  return 'tema-' + tema.toLowerCase();
}

function _chatCurrentMemberName() {
  const session = (typeof verificarSesion === 'function') ? verificarSesion() : null;
  if (session) return session.nombre;
  if (typeof load === 'function' && typeof getMember === 'function') {
    const s = load();
    return getMember(s.currentMember).short;
  }
  return 'Familia';
}

function _chatFormatTime(iso) {
  const d   = new Date(iso);
  const hoy = new Date();
  const hora = d.toLocaleTimeString('es-HN', { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === hoy.toDateString()) return hora;
  const fecha = d.toLocaleDateString('es-HN', { day: 'numeric', month: 'short' });
  return `${fecha}, ${hora}`;
}

function _chatRenderMessage(msg) {
  const esMio = msg.usuario === _chatCurrentMemberName();

  const wrap = document.createElement('div');
  wrap.className = 'chat-msg' + (esMio ? ' mine' : '');
  wrap.dataset.msgId = msg.id;
  wrap.dataset.msgTema = msg.tema || 'General';

  const topicClass = _chatTopicClass(msg.tema);
  if (topicClass) {
    const tema = document.createElement('div');
    tema.className = 'chat-msg-tema ' + topicClass;
    tema.textContent = msg.tema;
    wrap.appendChild(tema);
  }

  const author = document.createElement('div');
  author.className = 'chat-msg-author';
  author.textContent = msg.usuario;

  const text = document.createElement('div');
  text.className = 'chat-msg-text';
  text.textContent = msg.mensaje;

  const time = document.createElement('div');
  time.className = 'chat-msg-time';
  time.textContent = _chatFormatTime(msg.creado_at);

  wrap.append(author, text, time);
  return wrap;
}

/* ─────────────────────────────────────────────
   SONIDO DE ALERTA (mientras la app está abierta)
   No hay forma de elegir/subir el volumen del sistema desde un sitio
   web; esto suena tan fuerte como el volumen actual del dispositivo
   lo permita. Se genera con Web Audio (sin archivo externo) para
   poder controlar tono y duración.
───────────────────────────────────────────── */

let _chatAudioCtx = null;

function _chatEnsureAudioCtx() {
  if (_chatAudioCtx) return _chatAudioCtx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  _chatAudioCtx = new AudioCtx();
  return _chatAudioCtx;
}

// "Desbloquea" el audio en el primer toque del usuario, para que el
// aviso pueda sonar después aunque llegue sin interacción directa.
document.addEventListener('click', () => {
  const ctx = _chatEnsureAudioCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}, { once: true, capture: true });

function _chatPlayAlertSound() {
  const ctx = _chatEnsureAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const beep = (startTime, freq, duration) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square'; // más penetrante que una onda sinusoidal
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(1, startTime + 0.02);
    gain.gain.setValueAtTime(1, startTime + duration - 0.03);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  try {
    const now = ctx.currentTime;
    beep(now,        1100, 0.18);
    beep(now + 0.22, 1100, 0.18);
    beep(now + 0.44, 1500, 0.28);
  } catch (e) {
    console.error('[Chat] No se pudo reproducir el sonido de alerta:', e);
  }
}

function chatScrollToBottom() {
  const scroll = document.getElementById('chat-scroll');
  if (scroll) scroll.scrollTop = scroll.scrollHeight;
}

function _chatIsNearBottom() {
  const scroll = document.getElementById('chat-scroll');
  if (!scroll) return true;
  return scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 120;
}

function _chatShowNewMessageBadge() {
  const badge = document.getElementById('chat-new-msg-badge');
  if (badge) badge.style.display = 'flex';
}

function _chatHideNewMessageBadge() {
  const badge = document.getElementById('chat-new-msg-badge');
  if (badge) badge.style.display = 'none';
}

async function chatLoadHistory() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  if (!_sb) {
    container.innerHTML = '<div class="chat-empty">No se pudo conectar con el chat.</div>';
    return;
  }

  let query = _sb.from(CHAT_TABLE).select('*');
  if (_chatFilterTopic) query = query.eq('tema', _chatFilterTopic);
  const { data, error } = await query.order('creado_at', { ascending: false }).limit(25);

  if (error) {
    console.error('[Chat] Error cargando mensajes:', error);
    container.innerHTML = '<div class="chat-empty">No se pudieron cargar los mensajes.</div>';
    return;
  }

  container.innerHTML = '';
  if (!data || !data.length) {
    container.innerHTML = _chatEmptyStateHTML();
    return;
  }

  // Supabase devuelve del más nuevo al más viejo; se muestra en orden cronológico
  data.reverse().forEach(msg => container.appendChild(_chatRenderMessage(msg)));
  chatScrollToBottom();
}

async function chatSendMessage(texto) {
  const trimmed = texto.trim();
  if (!trimmed || !_sb) return;

  const { error } = await _sb.from(CHAT_TABLE).insert({
    usuario: _chatCurrentMemberName(),
    mensaje: trimmed,
    tema:    _chatSendTopic,
  });

  if (error) {
    console.error('[Chat] Error enviando mensaje:', error);
    if (typeof toast === 'function') toast('No se pudo enviar el mensaje');
  }
}

function _chatEmptyStateHTML() {
  return '<div class="chat-empty" id="chat-empty">Aún no hay mensajes' +
    (_chatFilterTopic ? ` en "${_chatFilterTopic}"` : '') + '. ¡Sé el primero en escribir!</div>';
}

function _chatShowEmptyStateIfNeeded() {
  const container = document.getElementById('chat-messages');
  if (container && !container.querySelector('.chat-msg')) {
    container.innerHTML = _chatEmptyStateHTML();
  }
}

async function chatDeleteMessage(id) {
  if (!_sb) return;
  const ok = confirm('¿Eliminar este mensaje? Esta acción no se puede deshacer.');
  if (!ok) return;

  const { error } = await _sb.from(CHAT_TABLE).delete().eq('id', id);
  if (error) {
    console.error('[Chat] Error eliminando mensaje:', error);
    if (typeof toast === 'function') toast('No se pudo eliminar el mensaje');
    return;
  }

  document.querySelector(`.chat-msg[data-msg-id="${id}"]`)?.remove();
  _chatShowEmptyStateIfNeeded();
}

async function chatAssignTopic(id, tema) {
  if (!_sb) return;
  const { error } = await _sb.from(CHAT_TABLE).update({ tema }).eq('id', id);
  if (error) {
    console.error('[Chat] Error asignando tema:', error);
    if (typeof toast === 'function') toast('No se pudo cambiar el tema');
    return;
  }
  if (typeof toast === 'function') toast(`Movido a "${tema}"`);
}

/* ─────────────────────────────────────────────
   MENÚ DE ACCIONES AL TOCAR UN MENSAJE
───────────────────────────────────────────── */

let _chatActionMsgId = null;

function chatOpenMsgActions(id, temaActual) {
  _chatActionMsgId = id;
  document.querySelectorAll('#chat-msg-actions-overlay .chat-topic-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.tema === (temaActual || 'General'));
  });
  const overlay = document.getElementById('chat-msg-actions-overlay');
  if (overlay) overlay.style.display = 'flex';
}

function chatCloseMsgActions() {
  _chatActionMsgId = null;
  const overlay = document.getElementById('chat-msg-actions-overlay');
  if (overlay) overlay.style.display = 'none';
}

function chatSubscribe() {
  if (_chatChannel || !_sb) return;
  _chatChannel = _sb
    .channel('mensajes-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: CHAT_TABLE }, payload => {
      const coincideFiltro = !_chatFilterTopic || payload.new.tema === _chatFilterTopic;
      const esMio = payload.new.usuario === _chatCurrentMemberName();
      const container = document.getElementById('chat-messages');

      if (container && coincideFiltro) {
        // Igual que WhatsApp: si estás leyendo mensajes viejos arriba, no te
        // saltamos hasta abajo — solo avisamos con una insignia discreta.
        const debeBajar = esMio || _chatIsNearBottom();
        document.getElementById('chat-empty')?.remove();
        container.appendChild(_chatRenderMessage(payload.new));
        if (debeBajar) {
          chatScrollToBottom();
        } else {
          _chatShowNewMessageBadge();
        }
      }
      if (!esMio) {
        _chatPlayAlertSound();
      }
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: CHAT_TABLE }, payload => {
      document.querySelector(`.chat-msg[data-msg-id="${payload.old.id}"]`)?.remove();
      _chatShowEmptyStateIfNeeded();
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: CHAT_TABLE }, payload => {
      const el = document.querySelector(`.chat-msg[data-msg-id="${payload.new.id}"]`);
      if (!el) return;
      const coincideFiltro = !_chatFilterTopic || payload.new.tema === _chatFilterTopic;
      if (!coincideFiltro) {
        el.remove();
        _chatShowEmptyStateIfNeeded();
      } else {
        el.replaceWith(_chatRenderMessage(payload.new));
      }
    })
    .subscribe();
}

document.addEventListener('DOMContentLoaded', () => {
  chatLoadHistory();
  chatSubscribe();

  document.getElementById('chat-new-msg-badge')?.addEventListener('click', () => {
    chatScrollToBottom();
    _chatHideNewMessageBadge();
  });

  // Tocar cualquier mensaje (propio o ajeno) abre el menú de mover/eliminar
  document.getElementById('chat-messages')?.addEventListener('click', e => {
    const msgEl = e.target.closest('.chat-msg');
    if (msgEl && msgEl.dataset.msgId) chatOpenMsgActions(msgEl.dataset.msgId, msgEl.dataset.msgTema);
  });

  document.getElementById('chat-msg-actions-close')?.addEventListener('click', chatCloseMsgActions);
  document.getElementById('chat-msg-actions-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'chat-msg-actions-overlay') chatCloseMsgActions();
  });

  document.querySelector('#chat-msg-actions-overlay .chat-msg-actions-topics')?.addEventListener('click', e => {
    const chip = e.target.closest('.chat-topic-chip');
    if (!chip || !_chatActionMsgId) return;
    chatAssignTopic(_chatActionMsgId, chip.dataset.tema);
    chatCloseMsgActions();
  });

  document.getElementById('chat-msg-delete-btn')?.addEventListener('click', () => {
    if (!_chatActionMsgId) return;
    const id = _chatActionMsgId;
    chatCloseMsgActions();
    chatDeleteMessage(id);
  });

  document.getElementById('chat-scroll')?.addEventListener('scroll', () => {
    if (_chatIsNearBottom()) _chatHideNewMessageBadge();
  }, { passive: true });

  // Chips de filtro: qué tema mostrar en el historial
  document.getElementById('chat-filter-topics')?.addEventListener('click', e => {
    const chip = e.target.closest('.chat-topic-chip');
    if (!chip) return;
    document.querySelectorAll('#chat-filter-topics .chat-topic-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    _chatFilterTopic = chip.dataset.tema;
    chatLoadHistory();
  });

  // Chips de envío: con qué tema se etiqueta el próximo mensaje
  document.getElementById('chat-send-topics')?.addEventListener('click', e => {
    const chip = e.target.closest('.chat-topic-chip');
    if (!chip) return;
    document.querySelectorAll('#chat-send-topics .chat-topic-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    _chatSendTopic = chip.dataset.tema;
  });

  const form  = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');

  if (form && input) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const texto = input.value;
      if (!texto.trim()) return;

      const btn = form.querySelector('.chat-send-btn');
      input.value = '';
      if (btn) btn.disabled = true;

      await chatSendMessage(texto);

      if (btn) btn.disabled = false;
      input.focus();
    });
  }
});
