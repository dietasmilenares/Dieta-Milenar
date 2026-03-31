<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>Chat ao Vivo</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  :root {
    --bg:          #0d0f13;
    --surface:     #161a22;
    --surface2:    #1c2130;
    --border:      #252b38;
    --accent:      #f5a623;
    --text:        #e8eaf0;
    --muted:       #6b7491;
    --online:      #3ecf70;
    --bubble-in:   #1e2433;
    --bubble-out:  #1a3320;
    --bubble-out-b:#25472e;
    --reply-bg:    #252d40;
    --tip-bg:      #1a2a1a;
    --tip-border:  #3ecf70;
    --question:    #1a1e30;
    --question-b:  #4a6fa5;
    --radius:      16px;
  }

  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }

  html, body { height:100%; background:var(--bg); font-family:'DM Sans',sans-serif; color:var(--text); overflow:hidden; }

  #app { display:flex; flex-direction:column; height:100vh; max-height:100dvh; position:relative; }

  /* HEADER */
  .header {
    background:var(--surface); border-bottom:1px solid var(--border);
    padding:10px 14px; display:flex; align-items:center; gap:11px; flex-shrink:0; z-index:20;
  }
  .group-avatar-wrap { position:relative; flex-shrink:0; }
  .group-avatar { width:42px; height:42px; border-radius:50%; background:var(--border); overflow:hidden; }
  .group-avatar img { width:100%; height:100%; object-fit:cover; }
  .online-dot {
    position:absolute; bottom:1px; right:1px; width:11px; height:11px;
    background:var(--online); border-radius:50%; border:2px solid var(--surface);
    animation:pulse 2s infinite;
  }
  @keyframes pulse {
    0%,100%{box-shadow:0 0 0 0 rgba(62,207,112,0.5);}
    50%{box-shadow:0 0 0 4px rgba(62,207,112,0);}
  }
  .header-info { flex:1; min-width:0; }
  .header-title { font-weight:600; font-size:14.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .header-sub { font-size:11px; color:var(--online); margin-top:1px; }
  .online-count-badge {
    background:rgba(62,207,112,0.12); color:var(--online); font-size:11px; font-weight:600;
    padding:3px 9px; border-radius:20px; border:1px solid rgba(62,207,112,0.25); white-space:nowrap; flex-shrink:0;
  }
  .menu-btn {
    background:none; border:none; color:var(--muted); font-size:22px; cursor:pointer;
    padding:4px 6px; border-radius:8px; flex-shrink:0; line-height:1;
    transition:background 0.15s,color 0.15s;
  }
  .menu-btn:hover { background:var(--border); color:var(--text); }

  /* DROPDOWN */
  .dropdown {
    position:fixed; top:62px; right:10px;
    background:var(--surface2); border:1px solid var(--border); border-radius:12px;
    min-width:200px; padding:6px 0; z-index:9999;
    box-shadow:0 8px 30px rgba(0,0,0,0.5); display:none; animation:dropIn 0.15s ease;
  }
  .dropdown.open { display:block; }
  @keyframes dropIn { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:translateY(0);} }
  .dropdown-item {
    display:flex; align-items:center; gap:10px; padding:10px 16px;
    font-size:13.5px; cursor:pointer; color:var(--text); transition:background 0.12s;
  }
  .dropdown-item:hover { background:var(--border); }
  .dropdown-item .di-icon { font-size:16px; width:20px; text-align:center; }
  .dropdown-divider { height:1px; background:var(--border); margin:4px 0; }

  /* FEED */
  #feed {
    flex:1; overflow-y:auto; padding:12px 12px 8px;
    display:flex; flex-direction:column; gap:8px; overscroll-behavior:contain;
  }
  #feed::-webkit-scrollbar { width:3px; }
  #feed::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }

  /* SEPARATORS */
  .date-sep { text-align:center; display:flex; align-items:center; gap:8px; padding:4px 0; flex-shrink:0; }
  .date-sep::before,.date-sep::after { content:''; flex:1; height:1px; background:var(--border); }
  .date-sep span {
    font-size:10.5px; color:var(--muted); background:var(--surface2);
    padding:2px 10px; border-radius:10px; border:1px solid var(--border); white-space:nowrap;
  }
  .block-sep {
    text-align:center; font-size:10px; color:var(--muted); padding:2px 0;
    display:flex; align-items:center; gap:8px; opacity:0.6; flex-shrink:0;
  }
  .block-sep::before,.block-sep::after { content:''; flex:1; height:1px; background:var(--border); }

  /* MESSAGE */
  .msg { display:flex; gap:8px; align-items:flex-end; animation:fadeUp 0.3s ease both; flex-shrink:0; -webkit-user-select:none; user-select:none; }
  .msg .bubble { -webkit-user-select:text; user-select:text; }
  .msg.out { flex-direction:row-reverse; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }

  .msg-avatar { display:none; }
  .msg.out .msg-avatar { display:none; }

  .msg-body { max-width:78%; min-width:60px; font-size:13.5px; }
  .msg.out .msg-body, .msg.visitor-out .msg-body { max-width:78%; }

  /* Reply button */
  .reply-btn {
    background: none; border: none; color: var(--muted); cursor: pointer;
    font-size: 16px; padding: 4px 6px; border-radius: 50%;
    opacity: 0; transition: opacity 0.15s, background 0.15s;
    flex-shrink: 0; align-self: center; line-height: 1;
    display: flex; align-items: center; justify-content: center;
  }
  .msg:hover .reply-btn,
  .msg.show-actions .reply-btn { opacity: 1; }
  .reply-btn:hover { background: var(--border); color: var(--text); }

  .msg-header { display:flex; align-items:baseline; gap:6px; margin-bottom:3px; padding-left:2px; }
  .msg.out .msg-header { justify-content:flex-end; padding-right:2px; }

  .bot-name { font-size:12px; font-weight:600; color:var(--accent); }
  .archetype-tag { font-size:9.5px; color:var(--muted); background:var(--border); padding:1px 5px; border-radius:8px; }

  /* Badge Nutricionista */
  .nutri-badge {
    display:inline-flex; align-items:center; gap:3px;
    font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px;
    background: rgba(62,207,112,0.12); color: var(--online);
    border: 1px solid rgba(62,207,112,0.3);
    margin-left: 4px;
  }
  .admin-badge {
    display:inline-flex; align-items:center; gap:3px;
    font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:10px;
    background: rgba(245,166,35,0.12); color: var(--accent);
    border: 1px solid rgba(245,166,35,0.3);
    margin-left: 4px;
  }

  /* Separador especial Nutricionista */
  .nutri-sep {
    text-align:center; display:flex; align-items:center; gap:8px; padding:6px 0; flex-shrink:0;
  }
  .nutri-sep::before,.nutri-sep::after { content:''; flex:1; height:1px; background: rgba(62,207,112,0.3); }
  .nutri-sep span {
    font-size:10.5px; color: var(--online); background: rgba(62,207,112,0.08);
    padding:3px 12px; border-radius:10px; border:1px solid rgba(62,207,112,0.3); white-space:nowrap;
  }

  /* Bolha Nutricionista */
  .msg.nutri-msg .bubble {
    border-color: rgba(62,207,112,0.25);
    border-left: 3px solid var(--online);
  }
  .msg.nutri-msg .bot-name { color: var(--online); }

  .bubble {
    background:var(--bubble-in); border-radius:4px var(--radius) var(--radius) var(--radius);
    padding:8px 12px 6px; font-size:13.5px; line-height:1.55; word-break:break-word;
    border:1px solid var(--border); position:relative; overflow:hidden;
  }
  /* Quando tem reply dentro, remove padding do topo para o quote ficar grudado na borda */
  .bubble .reply-ref:first-child {
    margin-top: -8px;
    margin-left: -12px;
    margin-right: -12px;
    margin-bottom: 8px;
    border-radius: 0;
    border-left: none;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(0,0,0,0.25);
    padding: 6px 12px;
  }
  .bubble .reply-ref:first-child .reply-name { color: var(--accent); }
  .bubble .reply-ref:first-child .reply-text { color: var(--muted); }
  .msg.out .bubble {
    background:var(--bubble-out); border-color:var(--bubble-out-b);
    border-radius:var(--radius) 4px var(--radius) var(--radius);
  }
  .msg.visitor-out .bubble {
    background:var(--bubble-out); border-color:var(--bubble-out-b);
    border-radius:var(--radius) 4px var(--radius) var(--radius);
  }

  .type-badge {
    display:inline-flex; align-items:center; gap:4px; font-size:9px; padding:2px 7px;
    border-radius:8px; margin-bottom:5px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase;
  }
  .type-badge.tip { background:rgba(62,207,112,0.15); color:var(--online); }
  .type-badge.question,.type-badge.vacuum_question { background:rgba(74,111,165,0.2); color:#7aaae0; }

  .msg.tip .bubble { background:var(--tip-bg); border-color:rgba(62,207,112,0.3); border-left:3px solid var(--tip-border); }
  .msg.question .bubble,.msg.vacuum_question .bubble { background:var(--question); border-color:rgba(74,111,165,0.4); border-left:3px solid var(--question-b); }
  /* reaction = mensagem textual de reação ao que foi dito — usa bolha normal */
  .msg.reaction .bubble { background:var(--bubble-in); border:1px solid var(--border); padding:8px 12px 6px; font-size:13.5px; }

  .reply-ref {
    background: rgba(0,0,0,0.2);
    border-left: 3px solid var(--accent);
    border-radius: 4px;
    padding: 4px 8px;
    margin-bottom: 6px;
    margin-top: -2px;
    cursor: pointer;
    transition: background 0.15s;
    overflow: hidden;
  }
  .reply-ref:hover { background: rgba(0,0,0,0.3); }
  .reply-ref .reply-name { color: var(--accent); font-weight: 700; font-size: 10.5px; margin-bottom: 1px; }
  .reply-ref .reply-text { color: var(--muted); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }

  /* Efeito de destaque ao navegar para mensagem citada */
  @keyframes msgPulse {
    0%   { background: transparent; }
    20%  { background: rgba(245,166,35,0.18); box-shadow: 0 0 0 2px rgba(245,166,35,0.35); border-radius: 12px; }
    60%  { background: rgba(245,166,35,0.10); box-shadow: 0 0 0 2px rgba(245,166,35,0.18); border-radius: 12px; }
    100% { background: transparent; box-shadow: none; }
  }
  .msg-highlight { animation: msgPulse 1.2s ease forwards; }

  .fwd-label { display:flex; align-items:center; gap:4px; font-size:10px; color:var(--muted); margin-bottom:4px; font-style:italic; }

  .bubble-img { max-width:240px; max-height:200px; border-radius:10px; display:block; margin-bottom:4px; cursor:pointer; object-fit:cover; width:100%; }

  .bubble-footer { display:flex; align-items:center; justify-content:flex-end; gap:4px; margin-top:4px; min-height:14px; }
  .msg-time { font-size:10px; color:var(--muted); }
  .ticks { font-size:11px; color:var(--muted); line-height:1; }
  .ticks.delivered { color:var(--online); }

  .reactions-row { display:flex; flex-wrap:wrap; gap:4px; margin-top:6px; }
  .react-pill {
    display:inline-flex; align-items:center; gap:3px; background:rgba(255,255,255,0.07);
    border:1px solid var(--border); border-radius:12px; padding:2px 7px; font-size:13px;
    cursor:pointer; transition:background 0.15s,border-color 0.15s; user-select:none;
  }
  .react-pill:hover { background:rgba(255,255,255,0.13); }
  .react-pill.mine { background:rgba(245,166,35,0.15); border-color:rgba(245,166,35,0.4); }
  .react-pill .react-count { font-size:10.5px; color:var(--muted); }

  /* TYPING / RECORDING */
  .typing-wrap,.recording-wrap { display:flex; gap:8px; align-items:center; animation:fadeUp 0.25s ease; flex-shrink:0; }
  .typing-ava { width:32px; height:32px; border-radius:50%; background:var(--border); overflow:hidden; flex-shrink:0; }
  .typing-ava img { width:100%; height:100%; }
  .typing-bubble,.recording-bubble {
    background:var(--bubble-in); border:1px solid var(--border);
    border-radius:4px var(--radius) var(--radius) var(--radius); padding:8px 13px;
  }
  .recording-bubble { display:flex; align-items:center; gap:8px; }
  .typing-label { font-size:10px; color:var(--muted); margin-bottom:4px; }
  .typing-dots { display:flex; gap:3px; align-items:center; }
  .typing-dots span { width:5px; height:5px; background:var(--muted); border-radius:50%; animation:typDot 1.2s infinite; }
  .typing-dots span:nth-child(2){animation-delay:.2s;} .typing-dots span:nth-child(3){animation-delay:.4s;}
  @keyframes typDot { 0%,60%,100%{transform:translateY(0);opacity:.5;} 30%{transform:translateY(-4px);opacity:1;} }

  .rec-icon { font-size:14px; animation:recPulse 1s infinite; }
  @keyframes recPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
  .rec-label { font-size:12px; color:var(--muted); }
  .rec-wave { display:flex; gap:2px; align-items:center; }
  .rec-wave span { width:3px; background:var(--online); border-radius:2px; animation:recBar 1s infinite ease-in-out; }
  .rec-wave span:nth-child(1){height:6px;animation-delay:.0s;}
  .rec-wave span:nth-child(2){height:12px;animation-delay:.1s;}
  .rec-wave span:nth-child(3){height:8px;animation-delay:.2s;}
  .rec-wave span:nth-child(4){height:14px;animation-delay:.15s;}
  .rec-wave span:nth-child(5){height:6px;animation-delay:.05s;}
  @keyframes recBar { 0%,100%{transform:scaleY(1);} 50%{transform:scaleY(0.4);} }

  /* SCROLL BTN */
  /* Loader histórico anterior */
  #historyLoader {
    text-align:center;
    padding:10px 0 4px;
    color:var(--text-muted, #888);
    font-size:12px;
    cursor:pointer;
    user-select:none;
    display:none;
  }
  #historyLoader:hover { color:var(--text); }
  #historyLoader .hist-spinner {
    display:none;
    width:14px; height:14px;
    border:2px solid rgba(255,255,255,0.15);
    border-top-color:#888;
    border-radius:50%;
    animation:spin 0.7s linear infinite;
    margin:0 auto 4px;
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  #scrollBtn {
    position:absolute; bottom:70px; right:14px;
    background:var(--surface2); color:var(--text); border:1px solid var(--border);
    border-radius:50%; width:36px; height:36px; font-size:16px; cursor:pointer;
    display:none; align-items:center; justify-content:center;
    box-shadow:0 4px 16px rgba(0,0,0,0.4); transition:transform 0.15s; z-index:15;
  }
  #scrollBtn.visible { display:flex; }
  #scrollBtn:hover { transform:scale(1.1); }
  .scroll-badge {
    position:absolute; top:-5px; right:-5px; background:var(--accent); color:#000;
    font-size:9px; font-weight:700; padding:1px 4px; border-radius:10px; min-width:16px; text-align:center;
  }

  /* INPUT AREA */
  .input-area {
    background:var(--surface); border-top:1px solid var(--border);
    padding:8px 10px; flex-shrink:0; z-index:10;
  }
  .emoji-picker {
    display:none; background:var(--surface2); border:1px solid var(--border); border-radius:14px;
    padding:10px; margin-bottom:8px; flex-wrap:wrap; gap:6px; justify-content:center;
  }
  .emoji-picker.open { display:flex; }
  .emoji-picker span { font-size:22px; cursor:pointer; padding:4px; border-radius:8px; transition:background 0.12s; user-select:none; }
  .emoji-picker span:hover { background:var(--border); }

  .img-preview-wrap { display:none; margin-bottom:7px; position:relative; width:fit-content; max-width:160px; }
  .img-preview-wrap.active { display:block; }
  .img-preview-wrap img { border-radius:10px; max-width:160px; max-height:120px; object-fit:cover; display:block; }
  .img-preview-remove {
    position:absolute; top:-6px; right:-6px; background:#ff4757; color:#fff; border:none;
    border-radius:50%; width:20px; height:20px; font-size:12px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
  }

  .reply-preview {
    display: none;
    background: var(--surface2);
    border-left: 3px solid var(--accent);
    border-radius: 6px 6px 0 0;
    padding: 7px 10px 7px 12px;
    margin-bottom: 0;
    font-size: 11.5px;
    border-bottom: 1px solid var(--border);
  }
  .reply-preview.active { display:flex; align-items:flex-start; gap:8px; }
  .reply-preview-content { flex:1; min-width:0; }
  .reply-preview-name { color:var(--accent); font-weight:700; font-size:11px; margin-bottom:2px; }
  .reply-preview-text { color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:11.5px; }
  .reply-cancel { background:none; border:none; color:var(--muted); cursor:pointer; font-size:16px; line-height:1; flex-shrink:0; padding:0 0 0 4px; transition: color 0.15s; }
  .reply-cancel:hover { color: var(--text); }

  /* quando reply ativo, input gruda no quote */
  .reply-preview.active + .input-row .input-box-wrap,
  .reply-active .input-box-wrap {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top-color: transparent;
  }

  .input-row { display:flex; align-items:flex-end; gap:6px; }
  .input-icon-btn {
    background:none; border:none; color:var(--muted); font-size:22px; cursor:pointer;
    padding:6px; border-radius:50%; flex-shrink:0; transition:color 0.15s,background 0.15s;
    line-height:1; display:flex; align-items:center; justify-content:center;
  }
  .input-icon-btn:hover { color:var(--text); background:var(--border); }

  .input-box-wrap {
    flex:1; background:var(--surface2); border:1px solid var(--border); border-radius:22px;
    display:flex; align-items:flex-end; padding:6px 12px; gap:6px; min-height:40px; max-height:120px;
    transition:border-color 0.15s;
  }
  .input-box-wrap:focus-within { border-color:rgba(245,166,35,0.4); }

  #msgInput {
    flex:1; background:none; border:none; outline:none; color:var(--text);
    font-family:inherit; font-size:13.5px; resize:none; max-height:96px; min-height:22px;
    line-height:1.45; overflow-y:auto;
  }
  #msgInput::placeholder { color:var(--muted); }

  .send-btn {
    background:var(--accent); border:none; border-radius:50%; width:34px; height:34px;
    flex-shrink:0; display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:background 0.15s,transform 0.15s,opacity 0.2s;
    color:#000; font-size:16px; opacity:0.5; pointer-events:auto; transform:scale(1);
  }
  .send-btn.visible { opacity:1; }

  /* LOADING */
  #loading { text-align:center; padding:40px 20px; color:var(--muted); font-size:13px; flex-shrink:0; }
  .loading-spinner { width:26px; height:26px; border:2px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 12px; }
  @keyframes spin { to{transform:rotate(360deg);} }

  /* IMG MODAL */
  #imgModal { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9999; align-items:center; justify-content:center; }
  #imgModal.open { display:flex; }
  #imgModal img { max-width:95vw; max-height:90vh; border-radius:12px; object-fit:contain; }
  #imgModal button {
    position:absolute; top:14px; right:14px; background:rgba(255,255,255,0.15);
    border:none; border-radius:50%; width:36px; height:36px; color:#fff; font-size:20px;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
  }
  #fileInput { display:none; }
</style>
</head>
<body>

<div id="app">

  <!-- HEADER -->
  <div class="header">
    <div class="group-avatar-wrap">
      <div class="group-avatar">
        <img id="groupAvatarImg" src="https://api.dicebear.com/7.x/identicon/svg?seed=group" alt="Grupo">
      </div>
      <div class="online-dot"></div>
    </div>
    <div class="header-info">
      <div class="header-title" id="roomTitle">Chat ao Vivo</div>
      <div class="header-sub" id="roomSub">Comunidade ao Vivo</div>
    </div>
    <div class="online-count-badge" id="onlineCount">• • •</div>
    <button onclick="fetchMessages()" style="background:none;border:none;cursor:pointer;font-size:16px;padding:4px 6px;color:var(--online);opacity:0.8" title="Atualizar chat">🔄</button>
    <button class="menu-btn" id="menuBtn" onclick="toggleMenu(event)">⋮</button>
  </div>

  <!-- DROPDOWN -->
  <div class="dropdown" id="menuDropdown">
    <div class="dropdown-item" onclick="menuAction('close')" style="color:#ff4757">
      <span class="di-icon">✖</span> Fechar chat
    </div>
  </div>

  <!-- FEED -->
  <div id="historyLoader" onclick="loadHistory()">
    <div class="hist-spinner" id="histSpinner"></div>
    <span id="histText">↑ Carregar mensagens anteriores</span>
  </div>

  <div id="feed">
    <div id="loading">
      <div class="loading-spinner"></div>
      Carregando conversa...
    </div>
  </div>

  <!-- SCROLL BTN -->
  <button id="scrollBtn" onclick="scrollToBottom(true)">
    ↓
    <span class="scroll-badge" id="newMsgBadge" style="display:none">0</span>
  </button>

  <!-- INPUT -->
  <div class="input-area">
    <div class="emoji-picker" id="emojiPicker">
      <span onclick="insertEmoji('😀')">😀</span>
      <span onclick="insertEmoji('😂')">😂</span>
      <span onclick="insertEmoji('🥰')">🥰</span>
      <span onclick="insertEmoji('😍')">😍</span>
      <span onclick="insertEmoji('🤩')">🤩</span>
      <span onclick="insertEmoji('👏')">👏</span>
      <span onclick="insertEmoji('🙌')">🙌</span>
      <span onclick="insertEmoji('💪')">💪</span>
      <span onclick="insertEmoji('🔥')">🔥</span>
      <span onclick="insertEmoji('❤️')">❤️</span>
      <span onclick="insertEmoji('💯')">💯</span>
      <span onclick="insertEmoji('✅')">✅</span>
      <span onclick="insertEmoji('🎉')">🎉</span>
      <span onclick="insertEmoji('🤔')">🤔</span>
      <span onclick="insertEmoji('😮')">😮</span>
      <span onclick="insertEmoji('👍')">👍</span>
    </div>

    <div class="img-preview-wrap" id="imgPreviewWrap">
      <img id="imgPreviewEl" src="" alt="">
      <button class="img-preview-remove" onclick="clearImage()">✕</button>
    </div>

    <div class="reply-preview" id="replyPreview">
      <div class="reply-preview-content">
        <div class="reply-preview-name" id="replyPreviewName"></div>
        <div class="reply-preview-text" id="replyPreviewText"></div>
      </div>
      <button class="reply-cancel" onclick="cancelReply()">✕</button>
    </div>

    <div class="input-row">
      <button class="input-icon-btn" onclick="toggleEmojiPicker()" title="Emoji">
        <span style="font-size:22px">🙂</span>
      </button>
      <div class="input-box-wrap">
        <textarea id="msgInput" rows="1" placeholder="Mensagem..." maxlength="500"></textarea>
      </div>
      <button class="input-icon-btn" onclick="document.getElementById('fileInput').click()" title="Foto">
        <span style="font-size:20px">📎</span>
      </button>
      <input type="file" id="fileInput" accept="image/*" onchange="handleFileSelect(event)">
      <button class="send-btn" id="sendBtn" onclick="sendMessage()" title="Enviar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  </div>
</div>

<!-- IMG MODAL -->
<div id="imgModal" onclick="closeImgModal()">
  <img id="imgModalSrc" src="" alt="">
  <button onclick="closeImgModal()">✕</button>
</div>

<script>
// CONFIG
const params   = new URLSearchParams(location.search);
const ROOM     = params.get('room') || 'default';
const _wbase   = window.location.pathname.replace(/\/widget(\/index\.php)?$/, '').replace(/\/+$/, '');
// Suporte a servidores sem mod_rewrite
const _apiRaw = params.get('api') || (window.location.origin + (_wbase || '') + '/api');
const API_BASE = _apiRaw.endsWith('/api') ? _apiRaw.replace(/\/api$/, '/api/index.php?path=') : _apiRaw;

// Helper para montar URL compatível
function apiUrl(path) {
  if (API_BASE.includes('index.php?path=')) {
    const parts = path.split('?');
    return API_BASE + parts[0] + (parts[1] ? '&' + parts[1] : '');
  }
  return API_BASE + '/' + path;
}
const POLL_MS       = 6000;  // polling normal
const POLL_FAST_MS  = 800;   // polling acelerado durante disparo em massa
const REACT_POLL_MS = 15000;

// Polling adaptativo — acelera quando detecta muitas mensagens chegando
let _pollTimer      = null;
let _fastModeCount  = 0; // quantas rodadas consecutivas vieram com muitas msgs

function schedulePoll(fast) {
  clearTimeout(_pollTimer);
  _pollTimer = setTimeout(async function() {
    if (typeof _lastPollAt !== "undefined") _lastPollAt = Date.now();
    const before = lastId;
    await fetchMessages();
    const newMsgs = lastId - before;
    if (newMsgs >= 3) {
      // Muitas mensagens chegando — mantém modo rápido
      _fastModeCount = Math.min(_fastModeCount + 1, 20);
      schedulePoll(true);
    } else if (_fastModeCount > 0) {
      // Ainda em modo rápido mas diminuindo
      _fastModeCount--;
      schedulePoll(_fastModeCount > 0);
    } else {
      schedulePoll(false);
    }
  }, fast ? POLL_FAST_MS : POLL_MS);
}

// Visitor fingerprint
let visitorFp = sessionStorage.getItem('_spfp');
if (!visitorFp) {
  visitorFp = Math.random().toString(36).slice(2) + Date.now().toString(36);
  sessionStorage.setItem('_spfp', visitorFp);
}

// HISTÓRICO FALSO
const FAKE_HISTORY = [
  { name:'Fernanda R.', text:'Alguém mais sentiu o inchaço sumir nos primeiros dias? Parece mágica', time:'08:14' },
  { name:'Rodrigo M.', text:'Sim!! Perdi 2kg só de retenção na primeira semana', time:'08:17' },
  { name:'Claudia B.', text:'O protocolo é simples mas precisa de disciplina. Vale cada segundo', time:'08:21' },
  { name:'Marcelo T.', text:'Comecei há 3 semanas. -6kg. Minha esposa quer começar também', time:'08:25' },
  { name:'Fatima N.', text:'Eu tinha medo que fosse restritivo mas como de tudo, só mudo a ordem', time:'08:29' },
  { name:'Eduardo S.', text:'A fome sumiu no 4º dia. Nunca tinha acontecido em nenhuma dieta', time:'08:33' },
  { name:'Patricia V.', text:'Meu médico ficou impressionado com os exames depois de 30 dias 😊', time:'08:38' },
  { name:'Guilherme A.', text:'R$29,90 com acesso vitalício foi a melhor compra que fiz esse ano', time:'08:42' },
  { name:'Sonia K.', text:'Já indiquei para 4 pessoas da família. Todas com resultado', time:'08:47' },
  { name:'Lucas F.', text:'Quem aqui perdeu acima de 15kg? Quero saber se é possível', time:'08:51' },
  { name:'Renata P.', text:'Eu!! -18kg em 45 dias. Choro toda vez que lembro onde estava', time:'08:54' },
  { name:'Thiago C.', text:'Cara isso é incrível. Parabéns Renata!! 🙌', time:'08:56' },
  { name:'Mariana L.', text:'A sequência alimentar faz toda diferença. Parece simples mas é ciência', time:'09:02' },
  { name:'Roberto H.', text:'Tentei low carb, jejum, tudo. Só o protocolo funcionou de verdade', time:'09:07' },
  { name:'Juliana W.', text:'Fibra primeiro muda tudo. A glicose nem sobe mais depois das refeições', time:'09:11' },
  { name:'Carlos E.', text:'Meu smartwatch registrou metabolismo 18% mais alto depois de 2 semanas', time:'09:15' },
  { name:'Vera M.', text:'Para quem tem mais de 50: funciona igual. Minha mãe tem 63 e -9kg', time:'09:19' },
  { name:'Anderson J.', text:'SLC cara -7kg e a única coisa que mudei foi a ordem do prato', time:'09:23' },
  { name:'Camila O.', text:'Roupas que não usava há 3 anos servindo de novo. Que sensação boa', time:'09:28' },
  { name:'Paulo R.', text:'Tirei a camisa na praia pela primeira vez em anos. Valeu demais', time:'09:33' },
  { name:'Beatriz S.', text:'O protocolo funciona em restaurante também. Só pedir salada primeiro', time:'09:37' },
  { name:'Felipe N.', text:'Colesterol LDL caiu 20 pontos sem remédio. Médico surpreso', time:'09:41' },
  { name:'Adriana C.', text:'Gente vocês viram o grupo crescendo? Cada vez mais gente chegando', time:'09:46' },
  { name:'Marcos T.', text:'É porque funciona mesmo. Resultado fala mais alto que propaganda', time:'09:49' },
  { name:'Lucia F.', text:'Comecei ontem. Ansiosa para ver os resultados!! 🤩', time:'09:52' },
  { name:'Sandra B.', text:'Primeira semana: -3,5kg e a barriga já desinchando. Impressionante', time:'10:03' },
  { name:'Diego L.', text:'Papo reto: homem tem resultado mais rápido mesmo. -9kg em 5 semanas', time:'10:08' },
  { name:'Tatiana R.', text:'A fome da tarde que me matava simplesmente sumiu. Sem fazer nada diferente', time:'10:13' },
  { name:'Bruno K.', text:'Minha namorada não me reconheceu numa foto de 40 dias atrás kkkkk', time:'10:18' },
  { name:'Elaine M.', text:'Quem falou que ia ser difícil estava errado. É mais fácil que qualquer dieta', time:'10:22' },
  { name:'Rafael C.', text:'Bioimpedância hoje: -4,2% gordura corporal em 3 semanas. Dados reais', time:'10:27' },
  { name:'Simone P.', text:'Meu marido entrou no protocolo depois de ver meu resultado. Que orgulho', time:'10:31' },
  { name:'Henrique A.', text:'Acima de 15kg é possível sim. Estou em -22kg e ainda continuo', time:'10:35' },
  { name:'Vanessa O.', text:'Gente a pressão arterial normalizou. Parece que o corpo inteiro agradeceu', time:'10:39' },
  { name:'Leandro S.', text:'Não precisei cortar nada. Como arroz, frango, ovo. Só mudei a ordem', time:'10:44' },
  { name:'Priscila T.', text:'Calça 44 voltou a fechar!! Estava guardada há 2 anos 😭❤️', time:'10:48' },
  { name:'Gustavo F.', text:'O acesso vitalício é o diferencial. Qualquer dúvida que tiver no futuro', time:'10:52' },
  { name:'Daniela H.', text:'Semana 4: -11kg. Minha meta era 10 e já ultrapassei. Continuando!', time:'10:57' },
  { name:'Fábio N.', text:'Esse grupo é incrível. Motivação todo dia aqui dentro', time:'11:02' },
  { name:'Aline C.', text:'Pra quem tá começando: não desiste na primeira semana. O 4º dia é mágico', time:'11:07' },
  { name:'Ricardo B.', text:'Era cético total. Hoje sou o maior divulgador. Os dados não mentem', time:'11:12' },
  { name:'Monica L.', text:'Filha, marido e eu. Família toda no protocolo. Resultado em todo mundo', time:'11:16' },
  { name:'Wagner M.', text:'Quem tem diabetes tipo 2: glicemia em jejum caiu 23 pontos. Consulte seu médico', time:'11:21' },
  { name:'Cristina R.', text:'O biquíni que comprei como meta serviu 2 semanas antes do prazo que imaginei', time:'11:25' },
  { name:'Alexandre P.', text:'Boto fé que quem começou hoje vai aparecer aqui daqui 30 dias com resultado', time:'11:29' },
  { name:'Natalia S.', text:'Joelho parou de doer, humor melhorou, sono melhor. Não é só emagrecimento', time:'11:33' },
  { name:'Cesar O.', text:'-8kg e a melhor parte: sem fome, sem sofrimento, sem academia', time:'11:38' },
  { name:'Isabela M.', text:'Gratidão. Mudou mais do que o meu corpo. Mudou minha relação com comida', time:'11:42' },
  { name:'Vitor L.', text:'Quem pegou na época que estava R$29,90 fez o negócio da vida. Valor enorme', time:'11:47' },
];

let historyPage = 0;

async function loadHistory() {
  const spinner = document.getElementById('histSpinner');
  const histText = document.getElementById('histText');

  if (historyPage >= 2) {
    histText.style.display = 'none';
    spinner.style.display = 'block';
    setTimeout(function() {
      spinner.style.display = 'none';
      histText.style.display = 'block';
      histText.textContent = 'Não foi possível carregar. Tente novamente.';
    }, 3500);
    return;
  }

  histText.style.display = 'none';
  spinner.style.display = 'block';

  await new Promise(function(r) { setTimeout(r, 1200); });

  var feed = document.getElementById('feed');
  var oldHeight = feed.scrollHeight;
  var start = historyPage === 0 ? 25 : 0;
  var end   = historyPage === 0 ? 50 : 25;
  var msgs  = FAKE_HISTORY.slice(start, end);

  var frag = document.createDocumentFragment();
  msgs.forEach(function(m) {
    var div = document.createElement('div');
    div.className = 'msg-wrap';
    div.style.opacity = '0.85';
    div.innerHTML = '<div class="msg-avatar"><img src="' + avatarUrl(m.name) + '" alt=""></div>' +
      '<div class="msg-body">' +
      '<div class="msg-header"><span class="bot-name">' + escHtml(m.name) + '</span></div>' +
      '<div class="bubble"><div class="msg-text">' + escHtml(m.text) + '</div>' +
      '<div class="bubble-footer"><span class="msg-time">' + m.time + '</span></div></div></div>';
    frag.appendChild(div);
  });

  feed.insertBefore(frag, feed.firstChild);
  feed.scrollTop += feed.scrollHeight - oldHeight;

  historyPage++;
  spinner.style.display = 'none';
  histText.style.display = 'block';
  histText.textContent = '↑ Carregar mensagens anteriores';
}

function showHistoryLoader() {
  document.getElementById('historyLoader').style.display = 'block';
}

// STATE
// Persistência: restaura lastId da sessão para não perder mensagens no F5
let lastId       = parseInt(sessionStorage.getItem('_sp_lastId_' + ROOM) || '0');
let isBottom     = true;
let initialized  = false;
let newMsgCount  = 0;
let lastDateStr  = '';
let lastBlockName= '';
let knownBots    = [];
const msgMap     = {};
let replyToId    = null;
let pendingImg   = null;
let emojiOpen    = false;
let menuOpen     = false;
let muted        = false;
let reactions    = {};
let myReactions  = {};
const EMOJIS_REACT = ['👍','❤️','😂','😮','😢','🔥','🙌','💯'];

// HELPERS
function avatarUrl(seed) {
  return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(seed) + '&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf';
}
function groupAvatarUrl(seed) {
  return 'https://api.dicebear.com/7.x/identicon/svg?seed=' + encodeURIComponent(seed) + '&backgroundColor=1e2433';
}
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
}
function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const ymd = s => s.toDateString();
  if (ymd(d) === ymd(now)) return 'Hoje';
  const yest = new Date(now); yest.setDate(now.getDate()-1);
  if (ymd(d) === ymd(yest)) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
}
function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function scrollToBottom(force) {
  const feed = document.getElementById('feed');
  if (force || isBottom) {
    feed.scrollTo({ top:feed.scrollHeight, behavior: force ? 'smooth' : 'auto' });
    newMsgCount = 0; updateScrollBadge();
  }
}
function updateScrollBadge() {
  const badge = document.getElementById('newMsgBadge');
  if (newMsgCount > 0 && !isBottom) {
    badge.textContent = newMsgCount > 99 ? '99+' : newMsgCount;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

// HEADER
function setRoomInfo(roomData) {
  if (!roomData) return;
  document.getElementById('roomTitle').textContent = roomData.name || 'Chat ao Vivo';
  const img = document.getElementById('groupAvatarImg');
  img.src = roomData.avatar_url || groupAvatarUrl(roomData.name || ROOM);
}

// MENU
function toggleMenu(e) {
  e.stopPropagation();
  menuOpen = !menuOpen;
  document.getElementById('menuDropdown').classList.toggle('open', menuOpen);
}
function menuAction(action) {
  menuOpen = false;
  document.getElementById('menuDropdown').classList.remove('open');
  if (action === 'mute') {
    muted = !muted;
    alert(muted ? 'Notificações silenciadas.' : 'Notificações ativadas.');
  } else if (action === 'last') {
    scrollToBottom(true);
  } else if (action === 'members') {
    const names = knownBots.map(b => b.name).slice(0,10).join('\n') || 'Nenhum ainda';
    alert('Membros ativos:\n' + names);
  } else if (action === 'close') {
    if (window.parent !== window) window.parent.postMessage('close-chat','*');
    else document.getElementById('app').style.display = 'none';
  }
}
document.addEventListener('click', function(e) {
  if (menuOpen && !e.target.closest('#menuDropdown') && !e.target.closest('#menuBtn')) {
    menuOpen = false;
    document.getElementById('menuDropdown').classList.remove('open');
  }
  if (emojiOpen && !e.target.closest('#emojiPicker') && !e.target.closest('.input-icon-btn')) {
    emojiOpen = false;
    document.getElementById('emojiPicker').classList.remove('open');
  }
});

// SEPARATORS
function addDateSeparator(iso) {
  const label = formatDate(iso);
  if (label === lastDateStr) return;
  lastDateStr = label;
  const feed = document.getElementById('feed');
  const el = document.createElement('div');
  el.className = 'date-sep';
  el.innerHTML = '<span>' + label + '</span>';
  feed.appendChild(el);
}
function addBlockSeparator(name) {
  const el = document.createElement('div');
  el.className = 'block-sep';
  el.textContent = name;
  document.getElementById('feed').appendChild(el);
}

// RENDER
function renderMessage(msg, isVisitor) {
  const feed = document.getElementById('feed');
  addDateSeparator(msg.posted_at);

  if (!isVisitor && msg.block_name && msg.block_name !== lastBlockName) {
    lastBlockName = msg.block_name;
  }

  const el = document.createElement('div');
  const isOut = isVisitor;
  el.id = 'msg-' + msg.id;
  el.className = 'msg ' + msg.message_type + (isOut ? ' out visitor-out' : '');

  const timeStr = formatTime(msg.posted_at);

  // Reply
  let replyHtml = '';
  if (msg.reply_to_room_msg_id && msgMap[msg.reply_to_room_msg_id]) {
    const parent = msgMap[msg.reply_to_room_msg_id];
    const pName  = parent.data.bot_name || 'Alguém';
    // Extrai texto limpo sem footer/reactions
    const bubbleEl = parent.el.querySelector('.bubble');
    let pText = '';
    if (bubbleEl) {
      const clone = bubbleEl.cloneNode(true);
      clone.querySelectorAll('.reply-ref,.bubble-footer,.reactions-row,.type-badge,.fwd-label').forEach(function(e){ e.remove(); });
      pText = clone.textContent.trim().slice(0, 60);
    }
    replyHtml = '<div class="reply-ref" onclick="scrollToMsg(' + msg.reply_to_room_msg_id + ')">' +
      '<div class="reply-name">' + escHtml(pName) + '</div>' +
      '<div class="reply-text">' + escHtml(pText) + (pText.length >= 60 ? '…' : '') + '</div></div>';
  }

  // Detecta Nutricionista (archetype_id=4)
  const isNutri = (parseInt(msg.archetype_id) === 4) || (msg.archetype_name === 'Nutricionista');
  if (isNutri) el.classList.add('nutri-msg');

  // Badge 💡 Dica antes do conteúdo em msgs tip
  const badgeHtml = (msg.message_type === 'tip')
    ? '<div class="type-badge tip">💡 Dica</div>'
    : '';

  // Fwd
  const fwdHtml = msg.forwarded ? '<div class="fwd-label">↪ Encaminhada</div>' : '';

  // Content
  let contentHtml = '';
  if (msg._imgSrc) {
    contentHtml = '<img class="bubble-img" src="' + msg._imgSrc + '" onclick="openImgModal(this.src)" loading="lazy">';
    if (msg.content) contentHtml += '<div>' + escHtml(msg.content) + '</div>';
  } else {
    contentHtml = escHtml(msg.content);
  }

  // Ticks
  const ticksHtml = isVisitor ? '<span class="ticks delivered" title="Entregue">✓✓</span>' : '';

  // Avatar removido das mensagens
  const avatarHtml = '';

  // Header com badges Nutricionista
  let headerHtml = '';
  if (!isOut) {
    const nutriBadges = isNutri
      ? '<span class="nutri-badge">📏 Nutricionista</span><span class="admin-badge">👑 Admin</span>'
      : '';
    headerHtml = '<div class="msg-header"><span class="bot-name">' + escHtml(msg.bot_name) + '</span>' + nutriBadges + '</div>';
  }

  // Reply button
  const replyBtnHtml = !isVisitor
    ? '<button class="reply-btn" onclick="setReply(' + msg.id + ')" title="Responder">↩</button>'
    : '';

  if (!isOut) {
    el.innerHTML =
      '<div class="msg-body">' +
        headerHtml +
        '<div class="bubble">' +
          replyHtml + fwdHtml + badgeHtml + contentHtml +
          '<div class="bubble-footer"><span class="msg-time">' + timeStr + '</span>' + ticksHtml + '</div>' +
          '<div class="reactions-row" id="react-row-' + msg.id + '"></div>' +
        '</div>' +
      '</div>' +
      replyBtnHtml;
  } else {
    el.innerHTML =
      replyBtnHtml +
      '<div class="msg-body">' +
        headerHtml +
        '<div class="bubble">' +
          replyHtml + fwdHtml + badgeHtml + contentHtml +
          '<div class="bubble-footer"><span class="msg-time">' + timeStr + '</span>' + ticksHtml + '</div>' +
          '<div class="reactions-row" id="react-row-' + msg.id + '"></div>' +
        '</div>' +
      '</div>';
  }

  // Long press para reagir — previne seleção de texto
  if (!isVisitor) {
    el.addEventListener('contextmenu', function(e) { e.preventDefault(); showReactPicker(e, msg.id); });
    let pressTimer;
    let moved = false;
    el.addEventListener('touchstart', function(e) {
      moved = false;
      pressTimer = setTimeout(function() {
        if (!moved) {
          // Previne seleção de texto
          if (window.getSelection) window.getSelection().removeAllRanges();
          el.classList.add('show-actions');
          showReactPicker(null, msg.id, el);
        }
      }, 500);
    });
    el.addEventListener('touchend', function() { clearTimeout(pressTimer); });
    el.addEventListener('touchmove', function() { moved = true; clearTimeout(pressTimer); });
  }

  msgMap[msg.id] = { el: el, data: msg };
  feed.appendChild(el);
  if (reactions[msg.id]) renderReactions(msg.id);
  return el;
}

function scrollToMsg(id) {
  if (!msgMap[id]) return;
  var el = msgMap[id].el;
  el.scrollIntoView({ behavior:'smooth', block:'center' });
  setTimeout(function() {
    el.classList.add('msg-highlight');
    setTimeout(function() { el.classList.remove('msg-highlight'); }, 1200);
  }, 400);
}

// REACT PICKER
let reactPickerEl = null;
function showReactPicker(e, msgId, targetEl) {
  removeReactPicker();
  const picker = document.createElement('div');
  picker.id = 'reactPicker';
  picker.style.cssText = 'position:fixed;background:var(--surface2);border:1px solid var(--border);border-radius:30px;padding:8px 12px;display:flex;gap:8px;z-index:9000;box-shadow:0 8px 24px rgba(0,0,0,0.5);';
  EMOJIS_REACT.forEach(function(emoji) {
    const span = document.createElement('span');
    span.textContent = emoji;
    span.style.cssText = 'font-size:22px;cursor:pointer;';
    span.onclick = function() { toggleReact(msgId, emoji); removeReactPicker(); };
    picker.appendChild(span);
  });
  document.body.appendChild(picker);
  reactPickerEl = picker;
  if (e) {
    var top = e.clientY - 55, left = e.clientX - 20;
    if (left + 280 > window.innerWidth) left = window.innerWidth - 290;
    if (top < 8) top = 8;
    picker.style.top = top + 'px'; picker.style.left = left + 'px';
  } else if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    picker.style.top = Math.max(8, rect.top - 55) + 'px';
    picker.style.left = '50%'; picker.style.transform = 'translateX(-50%)';
  }
  setTimeout(function() { document.addEventListener('click', removeReactPickerOnClick); }, 10);
}
function removeReactPickerOnClick(e) {
  if (reactPickerEl && !reactPickerEl.contains(e.target)) removeReactPicker();
}
function removeReactPicker() {
  if (reactPickerEl) { reactPickerEl.remove(); reactPickerEl = null; }
  // Remove highlight de long press de todas as mensagens
  document.querySelectorAll('.msg.show-actions').forEach(function(el) { el.classList.remove('show-actions'); });
  document.removeEventListener('click', removeReactPickerOnClick);
}

// REACTIONS
async function toggleReact(msgId, emoji) {
  const key = msgId + ':' + emoji;

  // Atualização otimista — aparece imediatamente sem esperar a API
  if (!reactions[msgId]) reactions[msgId] = [];
  const existing = reactions[msgId].find(function(r) { return r.emoji === emoji; });
  const wasMine = !!myReactions[key];
  if (existing) {
    existing.count = wasMine ? existing.count - 1 : existing.count + 1;
    if (existing.count <= 0) reactions[msgId] = reactions[msgId].filter(function(r) { return r.emoji !== emoji; });
  } else {
    reactions[msgId].push({ emoji: emoji, count: 1 });
  }
  myReactions[key] = !wasMine;
  renderReactions(msgId);

  // Sincroniza com a API em background
  try {
    const res = await fetch(apiUrl('chat/react'), {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ room:ROOM, message_id:msgId, emoji:emoji, fp:visitorFp })
    });
    const data = await res.json();
    if (data.ok) {
      // Corrige com o valor real do servidor
      const r = reactions[msgId] && reactions[msgId].find(function(r) { return r.emoji === emoji; });
      if (r) { r.count = data.count; if (r.count <= 0) reactions[msgId] = reactions[msgId].filter(function(x) { return x.emoji !== emoji; }); }
      else if (data.toggled) { if (!reactions[msgId]) reactions[msgId] = []; reactions[msgId].push({ emoji:emoji, count:data.count }); }
      myReactions[key] = data.toggled;
      renderReactions(msgId);
    }
  } catch(e) { /* mantém atualização local */ }
}
function renderReactions(msgId) {
  const row = document.getElementById('react-row-' + msgId);
  if (!row) return;
  const reacts = reactions[msgId] || [];
  row.innerHTML = reacts.filter(function(r){ return r.count > 0; }).map(function(r) {
    const key  = msgId + ':' + r.emoji;
    const mine = myReactions[key] ? ' mine' : '';
    return '<div class="react-pill' + mine + '" onclick="toggleReact(' + msgId + ',\'' + r.emoji + '\')">' +
      r.emoji + '<span class="react-count">' + r.count + '</span></div>';
  }).join('');
}
async function fetchReactions() {
  try {
    const ids = Object.keys(msgMap).map(Number).filter(function(n){ return !isNaN(n); });
    if (ids.length === 0) return;
    const minId = Math.min.apply(null, ids);
    const res  = await fetch(apiUrl('chat/reactions?room=') + encodeURIComponent(ROOM) + '&since_id=' + (minId - 1));
    const data = await res.json();
    if (data.reactions) {
      Object.keys(data.reactions).forEach(function(id) {
        reactions[parseInt(id)] = data.reactions[id];
        renderReactions(parseInt(id));
      });
    }
  } catch(e) {}
}

// TYPING / RECORDING
// ================================================================
// SISTEMA DE TYPING REALISTA
// - Duração proporcional ao tamanho da mensagem
// - Simula pausas (pensando/apagando) em mensagens longas
// - Raramente duas pessoas digitando ao mesmo tempo
// ================================================================

var typingTimers   = [];   // timers ativos do typing
var typingActive   = 0;    // quantas pessoas digitando agora
var pendingMsgs    = [];   // mensagens aguardando exibição após typing
var isProcessing   = false;

// Estima duração de digitação baseado no tamanho do texto
function typingDuration(text) {
  if (!text) return 2000;
  var chars = text.length;
  // ~18 chars/s — ritmo de pessoa comum no celular
  var base = (chars / 18) * 1000;
  // Pausa simulando pensamento: maior em msgs longas
  var pause = chars > 60
    ? Math.random() * 3500 + 1500   // 1.5s a 5s extra em msgs longas
    : Math.random() * 1500 + 500;   // 0.5s a 2s em msgs curtas
  // Limita entre 3s e 12s
  return Math.min(Math.max(base + pause, 3000), 12000);
}

function showTyping(botName, seed, type) {
  removeTypingFor(botName);
  const feed = document.getElementById('feed');
  const el   = document.createElement('div');
  el.id      = 'typing-' + botName.replace(/\s/g,'_');
  el.className = type === 'recording' ? 'recording-wrap' : 'typing-wrap';
  const ava  = '<div class="typing-ava"><img src="' + avatarUrl(seed) + '" style="width:100%;height:100%;border-radius:50%"></div>';
  if (type === 'recording') {
    el.innerHTML = ava + '<div><div class="typing-label">' + escHtml(botName) + '</div>' +
      '<div class="recording-bubble"><span class="rec-icon">🎙️</span><span class="rec-label">Gravando áudio...</span>' +
      '<div class="rec-wave"><span></span><span></span><span></span><span></span><span></span></div></div></div>';
  } else {
    el.innerHTML = ava + '<div><div class="typing-label">' + escHtml(botName) + '</div>' +
      '<div class="typing-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div></div>';
  }
  feed.appendChild(el);
  if (isBottom) feed.scrollTop = feed.scrollHeight;
  typingActive++;
}

function removeTypingFor(botName) {
  var id = 'typing-' + botName.replace(/\s/g,'_');
  var el = document.getElementById(id);
  if (el) { el.remove(); typingActive = Math.max(0, typingActive - 1); }
}

function removeTyping() {
  // Compatibilidade — remove todos
  document.querySelectorAll('[id^="typing-"]').forEach(function(el){ el.remove(); });
  typingActive = 0;
}

// Agenda typing para uma mensagem específica antes de exibi-la
function scheduleTypingForMsg(msg, onDone) {
  if (knownBots.length === 0) { onDone(); return; }

  // Escolhe o bot que vai "digitar" — preferência pelo remetente da mensagem
  var bot = knownBots.find(function(b){ return b.name === msg.bot_name; });
  if (!bot) bot = knownBots[Math.floor(Math.random() * knownBots.length)];

  // Raramente (5%) segunda pessoa digita junto
  var doubleTyping = typingActive === 0 && Math.random() < 0.05 && knownBots.length > 1;

  var duration = typingDuration(msg.content || '');

  // Simula pausa no meio (pensando) em 30% dos casos em msgs longas
  var doPause = (msg.content || '').length > 80 && Math.random() < 0.30;

  showTyping(bot.name, bot.seed, 'typing');

  var bot2 = null;
  if (doubleTyping) {
    var others = knownBots.filter(function(b){ return b.name !== bot.name; });
    bot2 = others[Math.floor(Math.random() * others.length)];
    var t2 = setTimeout(function(){ showTyping(bot2.name, bot2.seed, 'typing'); }, Math.random() * 600 + 200);
    typingTimers.push(t2);
  }

  if (doPause) {
    // Para de digitar no meio, volta depois
    var pauseAt  = duration * (0.4 + Math.random() * 0.3);
    var pauseLen = Math.random() * 1200 + 600;
    var t3 = setTimeout(function(){
      removeTypingFor(bot.name);
      var t4 = setTimeout(function(){
        showTyping(bot.name, bot.seed, 'typing');
      }, pauseLen);
      typingTimers.push(t4);
    }, pauseAt);
    typingTimers.push(t3);
  }

  var tFinal = setTimeout(function(){
    removeTypingFor(bot.name);
    if (bot2) removeTypingFor(bot2.name);
    onDone();
  }, duration);
  typingTimers.push(tFinal);
}

function clearTypingTimers() {
  typingTimers.forEach(clearTimeout);
  typingTimers = [];
}

// ================================================================
// POLLING — recebe mensagens e exibe com typing realista
// ================================================================
async function fetchMessages() {
  try {
    const res = await fetch(apiUrl('chat/messages?room=') + encodeURIComponent(ROOM) + '&last_id=' + lastId);
    if (!res.ok) {
      if (!initialized) document.getElementById('loading').innerHTML = '<div style="color:#ff4757;font-size:12px">Sala não encontrada ou inativa.</div>';
      schedulePoll(false);
      return;
    }
    const data = await res.json();
    if (!initialized) {
      var loading = document.getElementById('loading');
      if (loading) loading.remove();
      initialized = true;
        showHistoryLoader();
    }
    if (data.room) setRoomInfo(data.room);
    if (data.stats) document.getElementById('onlineCount').textContent = data.stats.online_count.toLocaleString('pt-BR') + ' online';

    if (data.messages && data.messages.length > 0) {
      var isInitial = (lastId === 0);
      data.messages.forEach(function(msg) {
        if (msg.bot_name && !knownBots.find(function(b){ return b.name === msg.bot_name; })) {
          knownBots.push({ name:msg.bot_name, seed:msg.avatar_seed || msg.bot_name });
        }
        // Atualiza lastId imediatamente — garante que F5 não perde mensagens
        lastId = Math.max(lastId, msg.id);
        sessionStorage.setItem('_sp_lastId_' + ROOM, lastId);
        if (!msgMap[msg.id]) {
          // Mensagens iniciais (carga do F5) renderizam direto sem typing
          if (isInitial) {
            renderMessage(msg, false);
          } else {
            pendingMsgs.push(msg);
          }
          if (!isBottom) { newMsgCount++; updateScrollBadge(); }
        }
      });
      scrollToBottom(false);
      processPendingMsgs();
    }
  } catch(e) { console.warn('Poll error:', e); schedulePoll(false); }
}

// Processa fila de mensagens pendentes com typing entre elas
function processPendingMsgs() {
  if (isProcessing || pendingMsgs.length === 0) return;

  // Muitas mensagens acumuladas — renderiza tudo direto sem typing
  if (pendingMsgs.length > 10) {
    while (pendingMsgs.length > 0) {
      var m = pendingMsgs.shift();
      renderMessage(m, false);
    }
    scrollToBottom(false);
    return;
  }

  isProcessing = true;

  var msg = pendingMsgs.shift();

  scheduleTypingForMsg(msg, function() {
    removeTyping();
    renderMessage(msg, false);
    scrollToBottom(false);
    isProcessing = false;
    // Pequena pausa antes da próxima (simula intervalo natural)
    if (pendingMsgs.length > 0) {
      var gap = Math.random() * 800 + 200;
      setTimeout(processPendingMsgs, gap);
    }
  });
}

// SEND — bloqueado para visitantes
function sendMessage() {
  const input  = document.getElementById('msgInput');
  const text   = input.value.trim();
  const hasImg = !!pendingImg;
  if (!text && !hasImg) return;
  // Limpar input e mostrar modal de bloqueio
  input.value = '';
  input.style.height = 'auto';
  document.getElementById('sendBtn').classList.remove('visible');
  clearImage();
  cancelReply();
  closeEmojiPicker();
  showBlockedModal();
}

// INPUT
var msgInput = document.getElementById('msgInput');
msgInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 96) + 'px';
  document.getElementById('sendBtn').classList.toggle('visible', this.value.trim().length > 0 || !!pendingImg);
});
msgInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// EMOJI
function toggleEmojiPicker() {
  emojiOpen = !emojiOpen;
  document.getElementById('emojiPicker').classList.toggle('open', emojiOpen);
}
function closeEmojiPicker() {
  emojiOpen = false;
  document.getElementById('emojiPicker').classList.remove('open');
}
function insertEmoji(emoji) {
  const inp = document.getElementById('msgInput');
  const start = inp.selectionStart, end = inp.selectionEnd;
  inp.value = inp.value.slice(0, start) + emoji + inp.value.slice(end);
  inp.selectionStart = inp.selectionEnd = start + emoji.length;
  inp.focus();
  inp.dispatchEvent(new Event('input'));
  closeEmojiPicker();
}

// FILE
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    pendingImg = ev.target.result;
    document.getElementById('imgPreviewEl').src = pendingImg;
    document.getElementById('imgPreviewWrap').classList.add('active');
    document.getElementById('sendBtn').classList.add('visible');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}
function clearImage() {
  pendingImg = null;
  document.getElementById('imgPreviewWrap').classList.remove('active');
  document.getElementById('imgPreviewEl').src = '';
  if (!document.getElementById('msgInput').value.trim())
    document.getElementById('sendBtn').classList.remove('visible');
}

// REPLY
function setReply(msgId) {
  const entry = msgMap[msgId];
  if (!entry) return;
  replyToId = msgId;

  const name = entry.data.bot_name || 'Mensagem';
  const bubbleEl = entry.el.querySelector('.bubble');
  // Pega só o texto do conteúdo, ignorando reply-ref e bubble-footer internos
  let txt = '';
  if (bubbleEl) {
    // Clona e remove elementos filhos que não são o texto principal
    const clone = bubbleEl.cloneNode(true);
    clone.querySelectorAll('.reply-ref, .bubble-footer, .reactions-row, .type-badge, .fwd-label').forEach(function(el) { el.remove(); });
    txt = clone.textContent.trim().slice(0, 80);
  }

  document.getElementById('replyPreviewName').textContent = name;
  document.getElementById('replyPreviewText').textContent = txt;
  document.getElementById('replyPreview').classList.add('active');

  // Adiciona classe no input-area para grudar visualmente
  document.querySelector('.input-area').classList.add('reply-active');

  document.getElementById('msgInput').focus();
}

function cancelReply() {
  replyToId = null;
  document.getElementById('replyPreview').classList.remove('active');
  document.querySelector('.input-area').classList.remove('reply-active');
}

// IMG MODAL
function openImgModal(src) {
  document.getElementById('imgModalSrc').src = src;
  document.getElementById('imgModal').classList.add('open');
}
function closeImgModal() {
  document.getElementById('imgModal').classList.remove('open');
}

// SCROLL
document.getElementById('feed').addEventListener('scroll', function() {
  const atBottom = this.scrollHeight - this.scrollTop - this.clientHeight < 80;
  isBottom = atBottom;
  document.getElementById('scrollBtn').classList.toggle('visible', !atBottom);
  if (atBottom) { newMsgCount = 0; updateScrollBadge(); }
}, { passive:true });

var scrollTracked = false;
document.getElementById('feed').addEventListener('scroll', function() {
  if (!scrollTracked && this.scrollTop > 100) {
    fetch(apiUrl('chat/track'), {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ room:ROOM, event:'scroll', meta:{ ts:Date.now() } })
    }).catch(function(){});
    scrollTracked = true;
  }
}, { passive:true });

// INIT
fetchMessages();
fetch(apiUrl('chat/track'), {
  method:'POST', headers:{'Content-Type':'application/json'},
  body: JSON.stringify({ room:ROOM, event:'embed_load', meta:{ ts:Date.now() } })
}).catch(function(){});

schedulePoll(false);
setInterval(fetchReactions, REACT_POLL_MS);

// Watchdog — reinicia polling se travar por mais de 20s
let _lastPollAt = Date.now();
const _origSchedulePoll = schedulePoll;
setInterval(function() {
  if (Date.now() - _lastPollAt > 20000) {
    console.warn('Watchdog: reiniciando polling...');
    _lastPollAt = Date.now();
    schedulePoll(false);
  }
}, 5000);
</script>

<!-- MODAL RECURSO BLOQUEADO -->
<div id="blockedModal" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);align-items:center;justify-content:center;">
  <div style="background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:40px 32px;max-width:320px;width:90%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,0.6);">
    <div style="width:72px;height:72px;background:linear-gradient(135deg,#ff4757,#c0392b);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 8px 24px rgba(255,71,87,0.4);">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
    </div>
    <div style="margin-bottom:8px;">
      <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">RECURSO</span>
      <span style="font-size:22px;font-weight:800;color:#ff4757;letter-spacing:0.5px;"> BLOQUEADO</span>
    </div>
    <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.6;margin:12px 0 24px;">
      Você só poderá acessar esse recurso dentro do painel de membros após adquirir sua dieta.
    </p>
    <button onclick="document.getElementById('blockedModal').style.display='none'" style="background:linear-gradient(135deg,#ff4757,#c0392b);color:white;border:none;border-radius:12px;padding:12px 32px;font-size:14px;font-weight:700;cursor:pointer;width:100%;letter-spacing:0.5px;">
      ENTENDI
    </button>
  </div>
</div>
<script>
function showBlockedModal() {
  document.getElementById('blockedModal').style.display = 'flex';
}
</script>

</body>
</html>
