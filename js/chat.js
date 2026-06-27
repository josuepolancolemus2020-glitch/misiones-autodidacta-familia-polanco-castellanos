'use strict';

const SUPABASE_URL = 'https://bzrnjvalpwlcnpszvwim.supabase.co';
const SUPABASE_KEY = 'sb_publishable_74mJW5LoxPZOWtIi7YrBEw_0y9JjSfM';
const CHAT_TABLE   = 'mensajes';

const _sb = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

let _chatChannel = null;

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

function chatScrollToBottom() {
  const scroll = document.getElementById('chat-scroll');
  if (scroll) scroll.scrollTop = scroll.scrollHeight;
}

async function chatLoadHistory() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  if (!_sb) {
    container.innerHTML = '<div class="chat-empty">No se pudo conectar con el chat.</div>';
    return;
  }

  const { data, error } = await _sb
    .from(CHAT_TABLE)
    .select('*')
    .order('creado_at', { ascending: false })
    .limit(25);

  if (error) {
    console.error('[Chat] Error cargando mensajes:', error);
    container.innerHTML = '<div class="chat-empty">No se pudieron cargar los mensajes.</div>';
    return;
  }

  container.innerHTML = '';
  if (!data || !data.length) {
    container.innerHTML = '<div class="chat-empty" id="chat-empty">Aún no hay mensajes. ¡Sé el primero en escribir!</div>';
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
  });

  if (error) {
    console.error('[Chat] Error enviando mensaje:', error);
    if (typeof toast === 'function') toast('No se pudo enviar el mensaje');
  }
}

function chatSubscribe() {
  if (_chatChannel || !_sb) return;
  _chatChannel = _sb
    .channel('mensajes-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: CHAT_TABLE }, payload => {
      const container = document.getElementById('chat-messages');
      if (!container) return;
      document.getElementById('chat-empty')?.remove();
      container.appendChild(_chatRenderMessage(payload.new));
      chatScrollToBottom();
    })
    .subscribe();
}

document.addEventListener('DOMContentLoaded', () => {
  chatLoadHistory();
  chatSubscribe();

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
