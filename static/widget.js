(function () {
  'use strict';

  // Prevent double-initialisation if the script is loaded more than once
  if (document.getElementById('rcs-chat-btn')) return;

  // Update this URL if you later configure a custom domain for the chatbot
  var API_URL = 'https://rosebudcloud-chat.azurewebsites.net/chat';

  var PURPLE = '#8B2FC9';

  // ── Styles ──────────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#rcs-chat-btn{position:fixed;bottom:24px;right:24px;z-index:2147483646;',
    'width:56px;height:56px;border-radius:50%;background:' + PURPLE + ';',
    'border:none;cursor:pointer;box-shadow:0 4px 16px rgba(139,47,201,.4);',
    'display:flex;align-items:center;justify-content:center;',
    'transition:background .2s,transform .2s;}',
    '#rcs-chat-btn:hover{background:#7020b0;transform:scale(1.08);}',
    '#rcs-chat-btn svg{width:26px;height:26px;fill:#fff;}',

    '#rcs-chat-panel{position:fixed;bottom:92px;right:24px;z-index:2147483647;',
    'width:360px;height:520px;background:#111;border:1px solid #2a2a2a;',
    'border-radius:16px;display:flex;flex-direction:column;overflow:hidden;',
    'box-shadow:0 8px 32px rgba(0,0,0,.5);font-family:"Segoe UI",sans-serif;',
    'transition:opacity .2s,transform .2s;}',
    '#rcs-chat-panel.rcs-hidden{opacity:0;pointer-events:none;transform:translateY(12px);}',

    '#rcs-panel-header{display:flex;align-items:center;justify-content:space-between;',
    'padding:14px 18px;background:#1a1a1a;border-bottom:1px solid ' + PURPLE + ';}',
    '#rcs-panel-title{color:#fff;font-size:.95rem;font-weight:600;font-family:"Segoe UI",sans-serif;}',
    '#rcs-panel-status{color:#7ed957;font-size:.7rem;font-family:"Segoe UI",sans-serif;}',
    '#rcs-panel-close{background:none;border:none;color:#888;font-size:1.4rem;',
    'cursor:pointer;line-height:1;padding:0 4px;}',
    '#rcs-panel-close:hover{color:#fff;}',

    '#rcs-panel-msgs{flex:1;overflow-y:auto;padding:16px;',
    'display:flex;flex-direction:column;gap:12px;background:#111;}',
    '#rcs-panel-msgs::-webkit-scrollbar{width:4px;}',
    '#rcs-panel-msgs::-webkit-scrollbar-thumb{background:#333;border-radius:2px;}',

    '.rcs-msg{max-width:85%;font-size:.875rem;line-height:1.55;',
    'padding:10px 14px;box-sizing:border-box;word-wrap:break-word;}',
    '.rcs-user{align-self:flex-end;background:' + PURPLE + ';color:#fff;',
    'border-radius:16px 16px 4px 16px;}',
    '.rcs-bot{align-self:flex-start;background:#1e1e1e;color:#e0e0e0;',
    'border-radius:16px 16px 16px 4px;border:1px solid #2a2a2a;}',

    '#rcs-panel-foot{display:flex;gap:8px;padding:12px 16px;',
    'background:#1a1a1a;border-top:1px solid #2a2a2a;}',
    '#rcs-panel-input{flex:1;background:#111;border:1px solid #333;',
    'border-radius:8px;padding:9px 12px;color:#fff;font-size:.875rem;',
    'outline:none;font-family:"Segoe UI",sans-serif;',
    'transition:border-color .2s;box-sizing:border-box;}',
    '#rcs-panel-input:focus{border-color:' + PURPLE + ';}',
    '#rcs-panel-send{background:' + PURPLE + ';color:#fff;border:none;',
    'border-radius:8px;padding:9px 16px;font-size:.875rem;font-weight:600;',
    'cursor:pointer;font-family:"Segoe UI",sans-serif;transition:background .2s;}',
    '#rcs-panel-send:hover{background:#7020b0;}',
    '#rcs-panel-send:disabled,#rcs-panel-input:disabled{opacity:.6;cursor:not-allowed;}',

    '@media(max-width:420px){',
    '#rcs-chat-panel{width:calc(100vw - 16px);right:8px;bottom:88px;}}',
  ].join('');
  document.head.appendChild(style);

  // ── Chat bubble button ───────────────────────────────────────────────────────
  var btn = document.createElement('button');
  btn.id = 'rcs-chat-btn';
  btn.setAttribute('aria-label', 'Open RCS chat assistant');
  btn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>' +
    '</svg>';
  document.body.appendChild(btn);

  // ── Chat panel ───────────────────────────────────────────────────────────────
  var panel = document.createElement('div');
  panel.id = 'rcs-chat-panel';
  panel.className = 'rcs-hidden';
  panel.innerHTML =
    '<div id="rcs-panel-header">' +
      '<div>' +
        '<div id="rcs-panel-title">RCS Assistant</div>' +
        '<div id="rcs-panel-status">&#9679; Online</div>' +
      '</div>' +
      '<button id="rcs-panel-close" aria-label="Close chat">&times;</button>' +
    '</div>' +
    '<div id="rcs-panel-msgs"></div>' +
    '<div id="rcs-panel-foot">' +
      '<input id="rcs-panel-input" type="text"' +
        ' placeholder="Ask about our services\u2026" autocomplete="off" />' +
      '<button id="rcs-panel-send">Send</button>' +
    '</div>';
  document.body.appendChild(panel);

  var msgs    = document.getElementById('rcs-panel-msgs');
  var input   = document.getElementById('rcs-panel-input');
  var sendBtn = document.getElementById('rcs-panel-send');
  var closeBtn = document.getElementById('rcs-panel-close');

  var history = [];
  var isOpen  = false;

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function addMsg(role, text) {
    var div = document.createElement('div');
    div.className = 'rcs-msg ' + (role === 'user' ? 'rcs-user' : 'rcs-bot');
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function toggle() {
    isOpen = !isOpen;
    panel.classList.toggle('rcs-hidden', !isOpen);
    if (isOpen) {
      if (!msgs.children.length) {
        addMsg('bot', 'Hi! I\u2019m the Rosebud Cloud Solutions assistant. ' +
          'I can help you understand our cloud, AI, and automation services. ' +
          'What can I help you with today?');
      }
      input.focus();
    }
  }

  function send() {
    var text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    addMsg('user', text);
    history.push({ role: 'user', content: text });

    var typing = addMsg('bot', '\u2026');

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      typing.remove();
      if (data.reply) {
        addMsg('bot', data.reply);
        history.push({ role: 'assistant', content: data.reply });
      } else {
        addMsg('bot', 'Sorry, something went wrong. Please try again.');
        history.pop();
      }
    })
    .catch(function () {
      typing.remove();
      addMsg('bot', 'Connection error. Please try again.');
      history.pop();
    })
    .finally(function () {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    });
  }

  // ── Event listeners ──────────────────────────────────────────────────────────
  btn.addEventListener('click', toggle);
  closeBtn.addEventListener('click', toggle);
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
})();
