<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Social Proof Engine — Admin</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg:       #090c12;
  --panel:    #0f1420;
  --surface:  #141926;
  --border:   #1e2738;
  --border2:  #2a3550;
  --accent:   #f5a623;
  --accent2:  #ff6b35;
  --blue:     #4a9eff;
  --green:    #3ecf70;
  --red:      #ff4757;
  --purple:   #9b59b6;
  --text:     #dde3f0;
  --muted:    #5a6480;
  --radius:   12px;
  --sidebar-w: 220px;
}

* { margin:0; padding:0; box-sizing:border-box; }
html,body { height:100%; background:var(--bg); font-family:'Space Grotesk',sans-serif; color:var(--text); }

/* ── LAYOUT ── */
.app { display:flex; height:100vh; overflow:hidden; }

.sidebar {
  width: var(--sidebar-w);
  background: var(--panel);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.25s ease;
  z-index: 50;
}

.main {
  flex: 1;
  overflow-y: auto;
  background: var(--bg);
  min-width: 0;
}

/* ── SIDEBAR ── */
.logo {
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-title {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.logo-sub { font-size: 10px; color: var(--muted); margin-top: 2px; letter-spacing: 1px; text-transform: uppercase; }

/* Botão fechar sidebar (mobile) */
.sidebar-close {
  display: none;
  background: none;
  border: none;
  color: var(--muted);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

nav { padding: 12px 0; flex: 1; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 18px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  border-left: 3px solid transparent;
  transition: all 0.15s;
  user-select: none;
}

.nav-item:hover { background: var(--surface); color: var(--text); }
.nav-item.active { color: var(--accent); border-left-color: var(--accent); background: rgba(245,166,35,0.06); }
.nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }

/* ── TOPBAR MOBILE ── */
.topbar {
  display: none;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 40;
}

.topbar-title {
  font-size: 15px;
  font-weight: 700;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  flex: 1;
}

.menu-btn {
  background: none;
  border: none;
  color: var(--text);
  font-size: 22px;
  cursor: pointer;
  padding: 2px 4px;
  line-height: 1;
}

/* Overlay escuro quando sidebar abre no mobile */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 49;
}

.sidebar-overlay.open { display: block; }

/* ── MAIN CONTENT ── */
.page { display: none; padding: 24px 28px; animation: fadeIn 0.2s ease; }
.page.active { display: block; }

@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }

.page-header { margin-bottom: 20px; }
.page-header-row { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.page-title  { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
.page-sub    { font-size: 13px; color: var(--muted); margin-top: 4px; }

/* ── CARDS / GRID ── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
}

.stat-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 18px;
}

.stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; }
.stat-value { font-size: 26px; font-weight: 700; margin-top: 6px; }
.stat-value.green  { color: var(--green); }
.stat-value.accent { color: var(--accent); }
.stat-value.blue   { color: var(--blue); }

.stat-card-link {
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}
.stat-card-link:hover {
  border-color: var(--border2);
  transform: translateY(-2px);
}

/* ── TABLE ── */
.table-wrap { overflow-x: auto; margin-top: 14px; -webkit-overflow-scrolling: touch; }

table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 480px; }
th { text-align:left; padding:10px 12px; color:var(--muted); font-weight:600; font-size:11px;
     text-transform:uppercase; letter-spacing:0.6px; border-bottom:1px solid var(--border); white-space:nowrap; }
td { padding:10px 12px; border-bottom:1px solid var(--border); vertical-align:middle; }
tr:hover td { background: var(--surface); }
tr:last-child td { border-bottom:none; }

/* ── BUTTONS ── */
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-primary   { background: var(--accent); color: #000; }
.btn-primary:hover { filter: brightness(1.1); }
.btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border2); }
.btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
.btn-danger    { background: rgba(255,71,87,0.15); color: var(--red); border: 1px solid rgba(255,71,87,0.3); }
.btn-danger:hover { background: rgba(255,71,87,0.25); }
.btn-success   { background: rgba(62,207,112,0.15); color: var(--green); border: 1px solid rgba(62,207,112,0.3); }
.btn-success:hover { background: rgba(62,207,112,0.25); }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.btn-xs { padding: 4px 9px; font-size: 11px; border-radius: 6px; }

/* ── FORMS ── */
.form-group { margin-bottom: 14px; }
label { display:block; font-size:12px; font-weight:600; color:var(--muted); margin-bottom:6px; letter-spacing:0.4px; text-transform:uppercase; }

input[type=text], input[type=number], input[type=password],
textarea, select {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 8px;
  padding: 9px 13px;
  color: var(--text);
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: border 0.15s;
  -webkit-appearance: none;
}

input:focus, textarea:focus, select:focus { border-color: var(--accent); }
textarea { resize: vertical; min-height: 80px; }
select option { background: var(--surface); }
input[type=range] { accent-color: var(--accent); cursor: pointer; width: 100%; }

/* ── MODAL ── */
.modal-bg {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(4px);
  z-index: 100;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.modal-bg.open { display: flex; }

.modal {
  background: var(--panel);
  border: 1px solid var(--border2);
  border-radius: 16px;
  padding: 24px;
  width: min(560px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  animation: modalIn 0.2s ease;
}

@keyframes modalIn { from { transform:scale(0.94); opacity:0; } to { transform:scale(1); opacity:1; } }

.modal-title { font-size: 17px; font-weight: 700; margin-bottom: 20px; }
.modal-footer { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; border-top:1px solid var(--border); padding-top:16px; flex-wrap:wrap; }

/* ── BADGE / STATUS ── */
.badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge-active   { background:rgba(62,207,112,0.15); color:var(--green); }
.badge-paused   { background:rgba(255,165,0,0.15);  color:#ffaa00; }
.badge-inactive { background:rgba(90,100,128,0.2);  color:var(--muted); }
.badge-running  { background:rgba(74,158,255,0.15); color:var(--blue); animation: glowBlue 2s infinite; }
.badge-pending  { background:rgba(90,100,128,0.2);  color:var(--muted); }
.badge-done     { background:rgba(62,207,112,0.1);  color:#5ad890; }

@keyframes glowBlue { 0%,100% { box-shadow:none; } 50% { box-shadow:0 0 8px rgba(74,158,255,0.5); } }

/* ── IFRAME CODE ── */
.iframe-code {
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: 8px;
  padding: 12px 14px;
  padding-right: 70px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--green);
  word-break: break-all;
  position: relative;
}

.copy-btn {
  position: absolute;
  top: 8px; right: 8px;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 6px;
  color: var(--muted);
  font-size: 11px;
  padding: 3px 8px;
  cursor: pointer;
  white-space: nowrap;
}
.copy-btn:hover { color: var(--accent); border-color: var(--accent); }

/* ── TOAST ── */
#toast {
  position: fixed;
  bottom: 20px; right: 16px;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  color: var(--text);
  z-index: 999;
  transform: translateY(80px);
  opacity: 0;
  transition: all 0.3s;
  max-width: calc(100vw - 32px);
}
#toast.show { transform: translateY(0); opacity: 1; }
#toast.success { border-color: var(--green); color: var(--green); }
#toast.error   { border-color: var(--red);   color: var(--red);   }

/* ── BOT GRID ── */
.bot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-top: 14px; }

.bot-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  transition: border-color 0.2s;
}
.bot-card:hover { border-color: var(--border2); }
.bot-card .avatar { width:48px; height:48px; border-radius:50%; margin:0 auto 8px; overflow:hidden; background:var(--border); }
.bot-card .avatar img { width:100%; height:100%; }
.bot-card .bot-name { font-size:13px; font-weight:600; }
.bot-card .bot-arch  { font-size:11px; color:var(--muted); margin-top:2px; }
.bot-card .bot-actions { margin-top:10px; display:flex; gap:6px; justify-content:center; }

/* Bot selector */
.bot-select-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:8px; max-height:200px; overflow-y:auto; }
.bot-select-item { display:flex; align-items:center; gap:8px; padding:8px 10px; background:var(--surface); border:1px solid var(--border); border-radius:8px; cursor:pointer; font-size:12px; }
.bot-select-item input { accent-color:var(--accent); cursor:pointer; flex-shrink:0; }
.bot-select-item:hover { border-color:var(--border2); }

/* Progress */
.progress-bar { background:var(--border); border-radius:20px; overflow:hidden; height:6px; margin:10px 0; }
.progress-fill { height:100%; background:linear-gradient(90deg,var(--accent),var(--accent2)); border-radius:20px; transition:width 0.4s; }

/* Timeline */
.timeline-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: var(--surface);
  border-radius: 8px;
  border-left: 3px solid var(--border);
  font-size: 12px;
  margin-bottom: 8px;
}
.timeline-item.tip            { border-left-color: var(--green); }
.timeline-item.question,
.timeline-item.vacuum_question { border-left-color: var(--blue); }
.timeline-item.answer         { border-left-color: var(--purple); }
.timeline-item.reaction       { border-left-color: var(--accent2); }

/* ── BLOCO CARD ── */
.block-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.block-card-info { flex: 1; min-width: 200px; }
.block-card-actions { display:flex; gap:6px; flex-wrap:wrap; }

/* ── ROOM GRID ── */
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  margin-top: 4px;
}

.room-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.15s;
}
.room-card:hover { border-color: var(--border2); }

.room-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.room-card-title {
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.room-card-title:hover { color: var(--accent); }

.room-card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.room-card-actions .btn {
  width: 100%;
  justify-content: center;
  padding: 7px 0;
  font-size: 12px;
}

/* ── ROOM INFO TOOLTIP ── */
.room-info-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.room-info-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  line-height: 1;
  padding: 2px 4px;
  color: var(--muted);
}
.room-info-btn:hover { color: var(--blue); }

.room-tooltip {
  display: none;
  position: fixed;
  background: var(--panel);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 12px 16px;
  min-width: 210px;
  z-index: 9999;
  box-shadow: 0 12px 32px rgba(0,0,0,0.6);
  font-size: 12px;
  white-space: nowrap;
}
.room-tooltip.open { display: block; }
.room-tooltip-row { display: flex; gap: 8px; align-items: center; padding: 4px 0; }
.room-tooltip-label { color: var(--muted); min-width: 70px; }
.room-tooltip-val   { color: var(--text); font-weight: 500; }
.room-tooltip-val code { font-family:'JetBrains Mono',monospace; color: var(--blue); font-size:11px; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  /* Mostra topbar mobile, esconde sidebar fixa */
  .topbar { display: flex; }
  .sidebar-close { display: block; }

  /* Sidebar vira drawer lateral */
  .sidebar {
    position: fixed;
    top: 0; left: 0;
    height: 100vh;
    transform: translateX(-100%);
    box-shadow: 4px 0 24px rgba(0,0,0,0.5);
  }
  .sidebar.open { transform: translateX(0); }

  /* Main ocupa tudo */
  .app { flex-direction: column; height: auto; min-height: 100vh; overflow: auto; }
  .main { overflow-y: visible; height: auto; }

  .page { padding: 16px; }

  /* Grids colapsam para 1 coluna */
  .grid-2, .grid-3 { grid-template-columns: 1fr; gap: 10px; }

  /* Tabela scroll horizontal */
  .table-wrap { margin: 0 -16px; padding: 0 16px; }

  /* Page header empilha */
  .page-header-row { flex-direction: column; align-items: flex-start; }
  .page-header-row .btn { width: 100%; justify-content: center; }

  /* Modal ocupa mais tela */
  .modal { padding: 18px; border-radius: 12px; }
  .modal-footer { flex-direction: column-reverse; }
  .modal-footer .btn { width: 100%; justify-content: center; }

  /* Grid de bots */
  .bot-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }

  /* Toast centralizado */
  #toast { right: 12px; left: 12px; max-width: none; text-align: center; }

  /* Block card empilha */
  .block-card { flex-direction: column; align-items: flex-start; }
  .block-card-actions { width: 100%; }
  .block-card-actions .btn { flex: 1; justify-content: center; }

  /* Bot selector em 2 colunas no mobile */
  .bot-select-grid { grid-template-columns: 1fr 1fr; }

  /* Grid-2 no modal de blocos fica em 1 coluna */
  .modal .grid-2 { grid-template-columns: 1fr; }
}

@media (max-width: 400px) {
  .bot-grid { grid-template-columns: 1fr 1fr; }
  .bot-select-grid { grid-template-columns: 1fr; }
}
</style>
</head>
<body>

<!-- TOPBAR MOBILE -->
<div class="topbar">
  <button class="menu-btn" onclick="toggleSidebar()">☰</button>
  <div class="topbar-title">SocialProof</div>
</div>

<!-- OVERLAY -->
<div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

<div class="app">

  <!-- SIDEBAR -->
  <div class="sidebar" id="sidebar">
    <div class="logo">
      <div>
        <div class="logo-title">SocialProof</div>
        <div class="logo-sub">Engine v1.0</div>
      </div>
      <button class="sidebar-close" onclick="toggleSidebar()">✕</button>
    </div>
    <nav>
      <div class="nav-item active" onclick="showPage('dashboard')">
        <span class="nav-icon">📊</span> Dashboard
      </div>
      <div class="nav-item" onclick="showPage('rooms')">
        <span class="nav-icon">🏠</span> Salas
      </div>
      <div class="nav-item" onclick="showPage('bots')">
        <span class="nav-icon">🤖</span> Bots
      </div>
      <div class="nav-item" onclick="showPage('archetypes')">
        <span class="nav-icon">🎭</span> Arquétipos
      </div>
      <div class="nav-item" onclick="showPage('settings')">
        <span class="nav-icon">⚙️</span> Configurações
      </div>
    </nav>
  </div>

  <!-- MAIN -->
  <div class="main">

    <!-- DASHBOARD -->
    <div id="page-dashboard" class="page active">
      <div class="page-header">
        <div class="page-title">Dashboard</div>
        <div class="page-sub">Visão geral do sistema</div>
      </div>
      <div class="grid-2" id="dashStats">
        <div class="stat-card stat-card-link" onclick="showPage('rooms')" title="Ver salas"><div class="stat-label">Salas Ativas</div><div class="stat-value green" id="ds-rooms">—</div></div>
        <div class="stat-card stat-card-link" onclick="showPage('bots')" title="Ver bots"><div class="stat-label">Bots Criados</div><div class="stat-value accent" id="ds-bots">—</div></div>
        <div class="stat-card stat-card-link" onclick="showPage('rooms')" title="Ver salas"><div class="stat-label">Mensagens Postadas</div><div class="stat-value blue" id="ds-msgs">—</div></div>
        <div class="stat-card stat-card-link" onclick="showStoppedRooms()" title="Ver salas paradas"><div class="stat-label">Salas Paradas</div><div class="stat-value" id="ds-stopped" style="color:var(--red)">—</div></div>
      </div>
    </div>

    <!-- ROOMS -->
    <div id="page-rooms" class="page">
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <div class="page-title">Salas</div>
            <div class="page-sub">Crie e gerencie suas salas de chat</div>
          </div>
          <button class="btn btn-primary" onclick="openModal('modalRoom')">+ Nova Sala</button>
        </div>
      </div>
      <div id="roomsTable">Carregando...</div>
    </div>

    <!-- BOTS -->
    <div id="page-bots" class="page">
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <div class="page-title">Bots</div>
            <div class="page-sub">Gerencie os participantes do chat</div>
          </div>
          <button class="btn btn-primary" onclick="openModal('modalBot')">+ Novo Bot</button>
        </div>
      </div>
      <div id="botGrid">Carregando...</div>
    </div>

    <!-- ARCHETYPES -->
    <div id="page-archetypes" class="page">
      <div class="page-header">
        <div class="page-header-row">
          <div>
            <div class="page-title">Arquétipos</div>
            <div class="page-sub">Defina o jeito de falar de cada tipo de usuário</div>
          </div>
          <button class="btn btn-primary" onclick="openModal('modalArchetype')">+ Novo Arquétipo</button>
        </div>
      </div>
      <div id="archetypesTable">Carregando...</div>
    </div>

    <!-- SETTINGS -->
    <div id="page-settings" class="page">
      <div class="page-header">
        <div class="page-title">Configurações</div>
        <div class="page-sub">Chaves de API e configurações do sistema</div>
      </div>
      <div class="card" style="max-width:560px">
        <div class="form-group">
          <label>Claude API Key</label>
          <input type="password" id="cfg-claude-key" placeholder="sk-ant-...">
        </div>
        <div class="form-group">
          <label>Modelo Claude</label>
          <select id="cfg-claude-model">
            <option value="claude-opus-4-5">claude-opus-4-5 (recomendado)</option>
            <option value="claude-sonnet-4-5">claude-sonnet-4-5 (mais rápido)</option>
            <option value="claude-haiku-4-5">claude-haiku-4-5 (econômico)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Token Admin (protege a API)</label>
          <input type="text" id="cfg-admin-token" placeholder="Token secreto...">
        </div>
        <div class="form-group">
          <label>Token Cron</label>
          <input type="text" id="cfg-cron-token" placeholder="Token para cron job...">
        </div>
        <button class="btn btn-primary" onclick="saveSettings()">Salvar Configurações</button>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border)">
          <div style="font-size:12px;font-weight:600;color:var(--muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:.6px">Setup Cron Job</div>
          <div class="iframe-code" id="cronCode">
            <span id="cronCodeText"></span>
            <button class="copy-btn" onclick="copyText('cronCode')">copiar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- ======================================================== MODALS ======================================================== -->

<!-- Modal: Nova Sala -->
<!-- Modal: Editar Sala -->
<div class="modal-bg" id="modalEditRoom">
  <div class="modal">
    <div class="modal-title">✏️ Editar Sala</div>
    <input type="hidden" id="edit-room-id">
    <div class="form-group"><label>Nome</label><input type="text" id="edit-room-name"></div>
    <div class="form-group"><label>Descrição</label><textarea id="edit-room-desc" style="min-height:60px"></textarea></div>
    <div class="form-group">
      <label>Status</label>
      <select id="edit-room-status">
        <option value="inactive">Inativa</option>
        <option value="active">Ativa</option>
        <option value="paused">Pausada</option>
      </select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modalEditRoom')">Cancelar</button>
      <button class="btn btn-primary" onclick="saveRoom()">💾 Salvar</button>
    </div>
  </div>
</div>

<div class="modal-bg" id="modalRoom">
  <div class="modal">
    <div class="modal-title">Nova Sala</div>
    <div class="form-group"><label>Nome da Sala</label><input type="text" id="room-name" placeholder="Ex: Comunidade Dieta Egípcia"></div>
    <div class="form-group"><label>Descrição</label><textarea id="room-desc" placeholder="Descrição opcional..."></textarea></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modalRoom')">Cancelar</button>
      <button class="btn btn-primary" onclick="createRoom()">Criar Sala</button>
    </div>
  </div>
</div>

<!-- Modal: Blocos da Sala -->
<div class="modal-bg" id="modalBlocks">
  <div class="modal" style="width:min(780px,100%)">
    <div class="modal-title" id="modalBlocksTitle">Blocos da Sala</div>
    <div style="margin-bottom:18px">
      <div style="font-size:12px;font-weight:600;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.6px">Código Embed</div>
      <div class="iframe-code" id="embedCode">—<button class="copy-btn" onclick="copyText('embedCode')">copiar</button></div>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:14px">
      <div style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--accent)">Adicionar Bloco</div>
      <div class="grid-2">
        <div class="form-group"><label>Nome do Bloco</label><input type="text" id="block-name" placeholder="Ex: Low Carb"></div>
        <div class="form-group"><label>Tema / Assunto</label><textarea id="block-topic" style="min-height:60px" placeholder="Descreva o assunto..."></textarea></div>
      </div>
      <div class="form-group" style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <label style="margin:0;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">
          <div id="tips-toggle-new" onclick="toggleTipsUI('new')"
            style="width:36px;height:20px;border-radius:10px;background:var(--border);position:relative;cursor:pointer;transition:background .2s;flex-shrink:0">
            <div id="tips-knob-new" style="position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#fff;transition:left .2s"></div>
          </div>
          💡 Bloco de Dicas
        </label>
        <input type="hidden" id="block-is-tips" value="0">
      </div>
      <button class="btn btn-primary btn-sm" onclick="addBlock()">+ Adicionar Bloco</button>
    </div>
    <div id="blocksList">Carregando...</div>
    <div class="modal-footer" style="justify-content:space-between">

      <button class="btn btn-secondary" onclick="closeModal('modalBlocks')">Fechar</button>
    </div>
  </div>
</div>

<!-- Modal: Editar Bloco -->
<div class="modal-bg" id="modalEditBlock">
  <div class="modal" style="width:min(500px,100%)">
    <div class="modal-title">✏️ Editar Bloco</div>
    <input type="hidden" id="edit-block-id">
    <div class="form-group"><label>Nome do Bloco</label><input type="text" id="edit-block-name"></div>
    <div class="form-group"><label>Tema / Assunto</label><textarea id="edit-block-topic" style="min-height:80px"></textarea></div>
    <div class="form-group" style="display:flex;align-items:center;gap:10px">
      <label style="margin:0;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">
        <div id="tips-toggle-edit" onclick="toggleTipsUI('edit')"
          style="width:36px;height:20px;border-radius:10px;background:var(--border);position:relative;cursor:pointer;transition:background .2s;flex-shrink:0">
          <div id="tips-knob-edit" style="position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#fff;transition:left .2s"></div>
        </div>
        💡 Bloco de Dicas
      </label>
      <input type="hidden" id="edit-block-is-tips" value="0">
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modalEditBlock')">Cancelar</button>
      <button class="btn btn-primary" onclick="saveEditBlock()">Salvar</button>
    </div>
  </div>
</div>

<!-- Modal: Prompt Builder -->
<div class="modal-bg" id="modalGenerate">
  <div class="modal" style="width:min(520px,100%)">
    <div class="modal-title">🧠 Gerador de Prompt</div>
    <div style="font-size:13px;color:var(--muted);margin-bottom:20px" id="generateBlockInfo">—</div>

    <div style="background:rgba(245,166,35,0.06);border:1px solid rgba(245,166,35,0.2);border-radius:10px;padding:16px;margin-bottom:20px">
      <div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:8px">Como funciona o novo fluxo:</div>
      <div style="font-size:12px;color:var(--text);line-height:1.8">
        1️⃣ <b>Abra o Prompt Builder</b> para configurar o produto e gerar o prompt<br>
        2️⃣ <b>Copie o prompt</b> e cole em qualquer IA (ChatGPT, Gemini, etc.)<br>
        3️⃣ <b>Copie o SQL</b> retornado pela IA<br>
        4️⃣ <b>Importe o SQL</b> diretamente no painel abaixo
      </div>
    </div>

    <div class="modal-footer" style="gap:10px;flex-wrap:wrap">
      <button class="btn btn-secondary" onclick="closeModal('modalGenerate')">Fechar</button>
      <button class="btn btn-primary" onclick="openPromptBuilder()">🧠 Abrir Prompt Builder</button>
      <button class="btn" style="background:rgba(62,207,112,0.15);color:var(--green);border:1px solid rgba(62,207,112,0.3)" onclick="closeModal('modalGenerate');openModal('modalImportSQL')">📥 Importar SQL</button>
    </div>
  </div>
</div>

<!-- Modal: Importar SQL -->
<div class="modal-bg" id="modalImportSQL" style="z-index:300">
  <div class="modal" style="width:min(620px,100%)">
    <div class="modal-title">📥 Importar SQL da Timeline</div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:14px">Cole aqui o SQL gerado pela IA e clique em Importar.</div>
    <div class="form-group">
      <label>SQL gerado pela IA</label>
      <textarea id="import-sql-text" style="min-height:180px;font-family:'Courier New',monospace;font-size:11px" placeholder="Cole aqui o INSERT INTO timeline_messages (...) VALUES ..."></textarea>
    </div>
    <div id="import-sql-status" style="font-size:12px;min-height:18px;margin-bottom:10px"></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modalImportSQL')">Cancelar</button>
      <button class="btn btn-primary" onclick="importSQL()">📥 Importar</button>
    </div>
  </div>
</div>

<!-- Modal: Editar Mensagem da Timeline -->
<div class="modal-bg" id="modalEditMsg" style="z-index:200">
  <div class="modal" style="width:min(520px,100%)">
    <div class="modal-title">✏️ Editar Mensagem</div>
    <input type="hidden" id="edit-msg-id">
    <div class="form-group">
      <label>Conteúdo</label>
      <textarea id="edit-msg-content" style="min-height:100px"></textarea>
    </div>
    <div class="grid-2">
      <div class="form-group">
        <label>Arquétipo</label>
        <select id="edit-msg-archetype">
          <option value="">Carregando...</option>
        </select>
      </div>
      <div class="form-group" style="position:relative">
        <label style="display:flex;align-items:center;gap:6px">
          Tipo
          <span id="tipo-info-btn" onclick="toggleTipoTooltip(event)" style="cursor:pointer;font-size:14px;line-height:1;color:var(--muted);user-select:none">ℹ️</span>
        </label>
        <div id="tipo-tooltip" style="display:none;position:absolute;top:28px;left:0;z-index:9999;background:var(--panel);border:1px solid var(--border2);border-radius:10px;padding:12px 14px;font-size:11.5px;line-height:1.7;color:var(--text);box-shadow:0 8px 24px rgba(0,0,0,0.4);width:280px">
          <div style="font-weight:700;margin-bottom:6px;color:var(--accent)">Tipos de mensagem</div>
          <div><b>💬 Declaração</b> — Comentário solto, relato, observação. Sem direção específica.</div>
          <div style="margin-top:5px"><b>❓ Dúvida</b> — Pergunta que já tem uma resposta programada vinculada.</div>
          <div style="margin-top:5px"><b>🌀 Vácuo</b> — Pergunta que fica no ar sem resposta. Gera engajamento.</div>
          <div style="margin-top:5px"><b>↩️ Resposta</b> — Resposta direta a outra mensagem.</div>
          <div style="margin-top:5px"><b>💡 Dica</b> — Conselho prático. Entregue sempre pela Nutricionista.</div>
          <div style="margin-top:5px"><b>😄 Reação</b> — Comentário reativo ao que foi dito antes.</div>
        </div>
        <select id="edit-msg-type">
          <option value="statement">💬 Declaração</option>
          <option value="question">❓ Dúvida</option>
          <option value="vacuum_question">🌀 Vácuo</option>
          <option value="answer">↩️ Resposta</option>
          <option value="tip">💡 Dica</option>
          <option value="reaction">😄 Reação</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Delay após mensagem anterior (segundos)</label>
      <input type="number" id="edit-msg-delay" min="1" max="3600">
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modalEditMsg')">Cancelar</button>
      <button class="btn btn-primary" onclick="saveEditMsg()">Salvar</button>
    </div>
  </div>
</div>

<!-- Modal: Ver Timeline -->
<div class="modal-bg" id="modalTimeline">
  <div class="modal" style="width:min(700px,100%)">
    <div class="modal-title" id="timelineTitle">Timeline</div>
    <div id="timelineContent" style="max-height:50vh;overflow-y:auto">Carregando...</div>
    <div class="modal-footer">
      <button class="btn btn-danger btn-sm" onclick="clearTimeline()">🗑 Limpar</button>
      <button class="btn btn-secondary" onclick="closeModal('modalTimeline')">Fechar</button>
    </div>
  </div>
</div>

<!-- Modal: Novo Bot -->
<div class="modal-bg" id="modalBot">
  <div class="modal">
    <div class="modal-title">Novo Bot</div>
    <div class="form-group"><label>Nome</label><input type="text" id="bot-name" placeholder="Ex: Maria Silva"></div>
    <div class="form-group">
      <label>Arquétipo</label>
      <select id="bot-archetype"><option value="">Carregando...</option></select>
    </div>
    <div class="form-group">
      <label>Gênero</label>
      <select id="bot-gender">
        <option value="F">Feminino</option>
        <option value="M">Masculino</option>
        <option value="N">Neutro</option>
      </select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modalBot')">Cancelar</button>
      <button class="btn btn-primary" onclick="createBot()">Criar Bot</button>
    </div>
  </div>
</div>

<!-- Modal: Novo Arquétipo -->
<div class="modal-bg" id="modalArchetype">
  <div class="modal" style="width:min(600px,100%)">
    <div class="modal-title">Novo Arquétipo</div>
    <div class="grid-2">
      <div class="form-group"><label>Nome</label><input type="text" id="arch-name" placeholder="Ex: Influencer Fitness"></div>
      <div class="form-group"><label>Descrição</label><input type="text" id="arch-desc" placeholder="Breve descrição"></div>
    </div>
    <div class="form-group">
      <label>Estilo de Fala (instrução para IA)</label>
      <textarea id="arch-style" style="min-height:90px" placeholder="Descreva como essa pessoa fala, gírias, ritmo, erros comuns..."></textarea>
    </div>
    <div class="form-group">
      <label>Exemplos de Vocabulário</label>
      <textarea id="arch-vocab" placeholder="Frases separadas por /: cara que loco! / mano acredita?"></textarea>
    </div>
    <div class="grid-2">
      <div class="form-group">
        <label>Erros de Digitação: <span id="typo-val">10</span>%</label>
        <input type="range" id="arch-typo" min="0" max="60" value="10" oninput="document.getElementById('typo-val').textContent=this.value">
      </div>
      <div class="form-group">
        <label>Taxa de Emojis: <span id="emoji-val">20</span>%</label>
        <input type="range" id="arch-emoji" min="0" max="80" value="20" oninput="document.getElementById('emoji-val').textContent=this.value">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modalArchetype')">Cancelar</button>
      <button class="btn btn-primary" onclick="createArchetype()">Criar Arquétipo</button>
    </div>
  </div>
</div>

<!-- Modal: Salas Paradas -->
<div class="modal-bg" id="modalStoppedRooms">
  <div class="modal" style="width:min(480px,100%)">
    <div class="modal-title">⏸ Salas Paradas</div>
    <div id="stoppedRoomsList" style="max-height:55vh;overflow-y:auto"></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modalStoppedRooms')">Fechar</button>
    </div>
  </div>
</div>

<!-- Modal: Progresso do Disparo -->
<div class="modal-bg" id="modalDisparo" style="z-index:400">
  <div class="modal" style="width:min(460px,100%)">
    <div class="modal-title">⚡ Disparando Mensagens</div>
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:8px">
        <span id="disparo-status">Preparando...</span>
        <span id="disparo-counter">0 / 0</span>
      </div>
      <div style="background:var(--border);border-radius:99px;height:10px;overflow:hidden">
        <div id="disparo-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--accent),#ff6b35);border-radius:99px;transition:width 0.3s ease"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:6px">
        <span id="disparo-tempo">Calculando tempo restante...</span>
        <span id="disparo-pct" style="color:var(--accent);font-weight:700">0%</span>
      </div>
    </div>
    <div id="disparo-log" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px;max-height:160px;overflow-y:auto;font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--muted);line-height:1.8"></div>
    <div class="modal-footer" style="margin-top:14px">
      <button class="btn btn-danger btn-sm" id="disparo-cancel-btn" onclick="cancelarDisparo()">✕ Cancelar</button>
      <button class="btn btn-secondary btn-sm" id="disparo-close-btn" style="display:none" onclick="closeModal('modalDisparo')">Fechar</button>
    </div>
  </div>
</div>

<div id="toast"></div>

<!-- ======================================================== SCRIPTS ======================================================== -->
<script>
// ── CONFIG — URL dinâmica: funciona na raiz (/) e em qualquer subpasta ──
(function() {
  const p = window.location.pathname
    .replace(/\/admin(\/index\.php)?$/, '')
    .replace(/\/+$/, '');
  window._BASE = window.location.origin + p;
})();
const API = window._BASE + '/api';

// ── STATE ──
let currentRoomId   = null;
let currentBlockId  = null;
let allBots         = [];
let allArchetypes   = [];
let timelineMsgData = {};
let allRooms       = [];

// ── API HELPER ──
async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': (localStorage.getItem('admin_token') || '').replace(/[^\x00-\x7F]/g, '') }
  };
  if (body !== null) opts.body = JSON.stringify(body);
  // Suporte a servidores sem mod_rewrite
  const baseUrl = window._BASE + '/api/index.php';
  const urlParts = path.split('?');
  const pathOnly = urlParts[0]; // NÃO encode as barras — PHP precisa delas literais
  const extra = urlParts[1] ? '&' + urlParts[1] : '';
  const res  = await fetch(`${baseUrl}?path=${encodeURIComponent(pathOnly).replace(/%2F/gi,'/')}${extra}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

// ── TOAST ──
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = '', type === 'error' ? 6000 : 3000);
  if (type === 'error') console.error('[SocialProof]', msg);
}

// ── SIDEBAR MOBILE ──
function toggleSidebar() {
  const sb  = document.getElementById('sidebar');
  const ov  = document.getElementById('sidebarOverlay');
  const open = sb.classList.toggle('open');
  ov.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

// ── NAVIGATION ──
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${id}`).classList.add('active');
  document.querySelector(`.nav-item[onclick="showPage('${id}')"]`).classList.add('active');
  // Fecha sidebar no mobile ao navegar
  const sb = document.getElementById('sidebar');
  if (sb.classList.contains('open')) toggleSidebar();
  if (id === 'dashboard')  loadDashboard();
  if (id === 'rooms')      loadRooms();
  if (id === 'bots')       loadBots();
  if (id === 'archetypes') loadArchetypes();
  if (id === 'settings')   loadSettings();
}

// ── MODAL ──
async function openModal(id) {
  if (id === 'modalBot') {
    try {
      if (!allArchetypes.length) allArchetypes = await api('archetypes');
      if (!allArchetypes.length) {
        toast('Crie um arquétipo antes de criar bots', 'error');
        return;
      }
      const sel = document.getElementById('bot-archetype');
      sel.innerHTML = allArchetypes.map(a => `<option value="${a.id}">${escHtml(a.name)}</option>`).join('');
    } catch(e) { toast('Erro ao carregar arquétipos: ' + e.message, 'error'); return; }
  }
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-bg').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
});

// ── COPY ──
function copyText(elId) {
  const el   = document.getElementById(elId);
  const text = el.innerText.replace(/copiar$/, '').trim();
  navigator.clipboard.writeText(text).then(() => toast('Copiado!')).catch(() => {
    // Fallback para mobile que bloqueia clipboard
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('Copiado!');
  });
}

// ── AVATAR ──
function avatarUrl(seed) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

// ── BADGE ──
function badge(status) {
  const labels = { active:'Ativa', paused:'Pausada', inactive:'Inativa', running:'Rodando', pending:'Pendente', done:'Concluído' };
  return `<span class="badge badge-${status}">${labels[status] || status}</span>`;
}

// ── UTILS ──
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escJ(s) { return String(s).replace(/'/g,"\\'").replace(/\n/g,' '); }

// ================================================================
// DASHBOARD
// ================================================================
async function loadDashboard() {
  try {
    const [rooms, bots] = await Promise.all([api('rooms'), api('bots')]);
    const activeRooms  = rooms.filter(r => r.status === 'active').length;
    const stoppedRooms = rooms.filter(r => r.status !== 'active').length;
    const totalMsgs    = rooms.reduce((s, r) => s + parseInt(r.msg_count||0), 0);
    document.getElementById('ds-rooms').textContent   = activeRooms;
    document.getElementById('ds-bots').textContent    = bots.length;
    document.getElementById('ds-msgs').textContent    = totalMsgs.toLocaleString('pt-BR');
    document.getElementById('ds-stopped').textContent = stoppedRooms;
    window._dashRooms = rooms;
  } catch(e) {
    toast('Erro ao carregar dashboard: ' + e.message, 'error');
  }
}

// ================================================================
// ROOMS
// ================================================================
async function loadRooms() {
  try {
    allRooms = await api('rooms');
    const el = document.getElementById('roomsTable');
    if (!allRooms.length) {
      el.innerHTML = '<div class="card" style="color:var(--muted);text-align:center;padding:32px">Nenhuma sala. Crie a primeira!</div>';
      return;
    }
    el.innerHTML = `<div class="rooms-grid">${allRooms.map(r => `
      <div class="room-card">
        <div class="room-card-header">
          <span class="room-card-title" onclick="openBlocks(${r.id},'${escJ(r.name)}','${r.slug}')">${escHtml(r.name)}</span>
          ${badge(r.status)}
          <div class="room-info-wrap">
            <button class="room-info-btn" onclick="toggleTooltip(event,'tip-${r.id}')">ℹ️</button>
            <div class="room-tooltip" id="tip-${r.id}">
              <div class="room-tooltip-row"><span class="room-tooltip-label">Slug</span><span class="room-tooltip-val"><code>${r.slug}</code></span></div>
              <div class="room-tooltip-row"><span class="room-tooltip-label">Blocos</span><span class="room-tooltip-val">${r.block_count}</span></div>
              <div class="room-tooltip-row"><span class="room-tooltip-label">Mensagens</span><span class="room-tooltip-val">${parseInt(r.msg_count||0).toLocaleString('pt-BR')}</span></div>
            </div>
          </div>
        </div>
        <div class="room-card-actions">
          <button class="btn btn-xs btn-secondary" onclick="editRoom(${r.id},'${escJ(r.name)}','${escJ(r.description||'')}')">✏️ Editar</button>
          ${r.status === 'active'
            ? `<button class="btn btn-xs btn-danger" onclick="setRoomStatus(${r.id},'paused')">⏸ Pausar</button>`
            : `<button class="btn btn-xs btn-success" onclick="setRoomStatus(${r.id},'active')">▶ Ativar</button>`}
          <button class="btn btn-xs" style="background:rgba(74,158,255,0.15);color:var(--blue);border:1px solid rgba(74,158,255,0.3)" onclick="restartAllTimelinesById(${r.id})">🔄 Reiniciar</button>
          <button class="btn btn-xs btn-danger" onclick="deleteRoom(${r.id})">🗑 Excluir</button>
        </div>
        <div style="text-align:center;margin-top:8px">
          <button class="btn btn-xs" style="background:rgba(255,165,0,0.15);color:#ffa500;border:1px solid rgba(255,165,0,0.4);width:90%" onclick="dispararTodas(${r.id},'${escJ(r.name)}')">⚡ Disparar Todas</button>
        </div>
      </div>`).join('')}</div>`;
  } catch(e) { toast(e.message, 'error'); }
}

function toggleTooltip(e, id) {
  e.stopPropagation();
  const btn   = e.currentTarget;
  const tip   = document.getElementById(id);
  const isOpen = tip.classList.contains('open');
  // Fecha todos
  document.querySelectorAll('.room-tooltip.open').forEach(t => t.classList.remove('open'));
  if (!isOpen) {
    const rect = btn.getBoundingClientRect();
    tip.style.top  = (rect.bottom + 6) + 'px';
    tip.style.left = Math.min(rect.left, window.innerWidth - 230) + 'px';
    tip.classList.add('open');
  }
}

document.addEventListener('click', () => {
  document.querySelectorAll('.room-tooltip.open').forEach(t => t.classList.remove('open'));
});

function showStoppedRooms() {
  const rooms   = window._dashRooms || [];
  const stopped = rooms.filter(r => r.status !== 'active');
  const el      = document.getElementById('stoppedRoomsList');
  if (!stopped.length) {
    el.innerHTML = '<div style="color:var(--muted);text-align:center;padding:24px">Nenhuma sala parada. 🎉</div>';
  } else {
    el.innerHTML = stopped.map(r => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 0;border-bottom:1px solid var(--border);flex-wrap:wrap">
        <div>
          <div style="font-weight:600;font-size:13px">${escHtml(r.name)}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px"><code>${r.slug}</code></div>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          ${badge(r.status)}
          <button class="btn btn-xs btn-success" onclick="setRoomStatus(${r.id},'active');closeModal('modalStoppedRooms')">▶ Ativar</button>
        </div>
      </div>`).join('');
  }
  document.getElementById('modalStoppedRooms').classList.add('open');
  document.body.style.overflow = 'hidden';
}

async function createRoom() {
  const name = document.getElementById('room-name').value.trim();
  const desc = document.getElementById('room-desc').value.trim();
  if (!name) return toast('Nome obrigatório', 'error');
  try {
    await api('rooms', 'POST', { name, description: desc });
    closeModal('modalRoom');
    toast('Sala criada!');
    document.getElementById('room-name').value = '';
    document.getElementById('room-desc').value = '';
    loadRooms();
    loadDashboard();
  } catch(e) { toast(e.message, 'error'); }
}

async function setRoomStatus(id, status) {
  try {
    await api(`rooms/${id}/status`, 'PUT', { status });
    toast(`Sala ${status === 'active' ? 'ativada' : 'pausada'}!`);
    loadRooms(); loadDashboard();
  } catch(e) { toast(e.message, 'error'); }
}

async function editRoom(id, name, desc) {
  document.getElementById('edit-room-id').value   = id;
  document.getElementById('edit-room-name').value = name;
  document.getElementById('edit-room-desc').value = desc;
  // Busca status atual
  const room = allRooms.find(r => r.id == id);
  if (room) document.getElementById('edit-room-status').value = room.status || 'inactive';
  openModal('modalEditRoom');
}

async function saveRoom() {
  const id     = document.getElementById('edit-room-id').value;
  const name   = document.getElementById('edit-room-name').value.trim();
  const desc   = document.getElementById('edit-room-desc').value.trim();
  const status = document.getElementById('edit-room-status').value;
  if (!name) return toast('Nome obrigatório', 'error');
  try {
    await api(`rooms/${id}`, 'PUT', { name, description: desc, status });
    toast('Sala atualizada!');
    closeModal('modalEditRoom');
    loadRooms(); loadDashboard();
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteRoom(id) {
  if (!confirm('Excluir esta sala e todo seu conteúdo? Esta ação não pode ser desfeita.')) return;
  try {
    await api(`rooms/${id}`, 'DELETE');
    toast('Sala excluída!');
    loadRooms(); loadDashboard();
  } catch(e) { toast(e.message, 'error'); }
}

// ================================================================
// BLOCKS
// ================================================================
async function openBlocks(roomId, roomName, slug) {
  currentRoomId = roomId;
  document.getElementById('modalBlocksTitle').textContent = `Blocos — ${roomName}`;
  // URL do widget dinâmica
  const widgetUrl = window._BASE + '/widget/index.php';
  const iframeCode = `<iframe src="${widgetUrl}?room=${slug}" width="400" height="600" frameborder="0" style="border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,0.3)"></iframe>`;
  document.getElementById('embedCode').innerHTML = escHtml(iframeCode) + '<button class="copy-btn" onclick="copyText(\'embedCode\')">copiar</button>';
  openModal('modalBlocks');
  await loadBlocks();
}

async function loadBlocks() {
  const el = document.getElementById('blocksList');
  try {
    const blocks = await api(`blocks?room_id=${currentRoomId}`);
    if (!blocks.length) {
      el.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:16px">Nenhum bloco. Adicione o primeiro acima.</div>';
      return;
    }
    el.innerHTML = blocks.map(b => `
      <div class="block-card">
        <div class="block-card-info">
          <div style="font-weight:600;font-size:13px">${escHtml(b.name)}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">${escHtml(b.topic.slice(0,80))}...</div>
          <div style="margin-top:6px;font-size:11px">
            ${badge(b.status)}
            <span style="color:var(--muted);margin-left:8px">${b.msg_count} msgs • ${b.posted_count} postadas</span>
          </div>
        </div>
        <div class="block-card-actions">
          <button class="btn btn-xs btn-secondary" onclick="openEditBlock(${b.id},'${escJ(b.name)}','${escJ(b.topic)}',${b.is_tips_block||0})">✏️ Editar</button>
          <button class="btn btn-xs btn-secondary" onclick="openGenerate(${b.id},'${escJ(b.name)}','${escJ(b.topic)}')">🧠 Gerar Prompt</button>
          <button class="btn btn-xs btn-secondary" onclick="viewTimeline(${b.id},'${escJ(b.name)}')">👁 Ver</button>
          ${b.status === 'running'
            ? `<button class="btn btn-xs btn-danger" onclick="setBlockStatus(${b.id},'paused')">⏸ Pausar</button>`
            : b.status !== 'done'
              ? `<button class="btn btn-xs btn-success" onclick="setBlockStatus(${b.id},'running')">▶ Iniciar</button>`
              : '<span style="font-size:11px;color:var(--muted)">✓ Concluído</span>'}
          <button class="btn btn-xs" style="background:rgba(74,158,255,0.15);color:var(--blue);border:1px solid rgba(74,158,255,0.3)" onclick="restartTimeline(${b.id})" title="Reseta posted_at e reinicia o bloco do zero">🔄 Reiniciar</button>
          <button class="btn btn-xs ${b.loop_infinite ? 'btn-success' : ''}" style="${b.loop_infinite ? '' : 'background:rgba(155,89,182,0.15);color:#c07fe0;border:1px solid rgba(155,89,182,0.3)'}" onclick="toggleLoop(${b.id},${b.loop_infinite ? 1 : 0})" title="Quando o bloco terminar, reinicia automaticamente">∞ Loop</button>
          <button class="btn btn-xs btn-danger" onclick="deleteBlock(${b.id},'${escJ(b.name)}')" title="Remover bloco e todas as suas mensagens">🗑 Remover</button>
        </div>
      </div>
    `).join('');
  } catch(e) { el.innerHTML = `<div style="color:var(--red)">${e.message}</div>`; }
}

async function addBlock() {
  const name    = document.getElementById('block-name').value.trim();
  const topic   = document.getElementById('block-topic').value.trim();
  const isTips  = parseInt(document.getElementById('block-is-tips').value || '0');
  if (!name || !topic) return toast('Nome e tema obrigatórios', 'error');
  if (!currentRoomId)  return toast('Nenhuma sala selecionada', 'error');
  try {
    await api('blocks', 'POST', { room_id: currentRoomId, name, topic, is_tips_block: isTips });
    toast('Bloco adicionado!');
    document.getElementById('block-name').value  = '';
    document.getElementById('block-topic').value = '';
    document.getElementById('block-is-tips').value = '0';
    // Reset toggle visual
    document.getElementById('tips-toggle-new').style.background = 'var(--border)';
    document.getElementById('tips-knob-new').style.left = '3px';
    await loadBlocks();
  } catch(e) { toast(e.message, 'error'); }
}

async function setBlockStatus(id, status) {
  try {
    await api(`blocks/${id}/status`, 'PUT', { status });
    toast(`Bloco ${status === 'running' ? 'iniciado' : 'pausado'}!`);
    await loadBlocks();
  } catch(e) { toast(e.message, 'error'); }
}

let _disparoCancelado = false;

function disparo_log(msg) {
  const el = document.getElementById('disparo-log');
  el.innerHTML += msg + '<br>';
  el.scrollTop = el.scrollHeight;
}

async function dispararTodas(roomId, roomName) {
  if (!confirm(`Disparar TODAS as mensagens de "${roomName}"?\nIsso reiniciará o chat.`)) return;

  _disparoCancelado = false;
  document.getElementById('disparo-status').textContent  = 'Iniciando...';
  document.getElementById('disparo-counter').textContent = '0 / ?';
  document.getElementById('disparo-bar').style.width     = '0%';
  document.getElementById('disparo-pct').textContent     = '0%';
  document.getElementById('disparo-tempo').textContent   = 'Aguarde...';
  document.getElementById('disparo-log').innerHTML       = '';
  document.getElementById('disparo-cancel-btn').style.display = 'inline-flex';
  document.getElementById('disparo-close-btn').style.display  = 'none';
  openModal('modalDisparo');

  try {
    let offset   = 0;
    const limit  = 50;
    let total    = null;
    let inserted = 0;
    const inicio = Date.now();

    while (true) {
      if (_disparoCancelado) {
        disparo_log('⛔ Cancelado pelo usuário.');
        break;
      }

      const data = await api(`rooms/${roomId}/bulk_dispatch`, 'POST', { offset, limit });
      disparo_log(`🔍 lote: inserted=${data.inserted} offset=${data.offset} total=${data.total} done=${data.done}`);

      if (!data.ok) {
        disparo_log(`❌ Erro: ${data.error}`);
        break;
      }

      if (total === null) {
        total = data.total;
        disparo_log(`⚡ ${total} mensagens encontradas. Enviando de ${limit} em ${limit}...`);
      }

      inserted += data.inserted;
      offset    = data.offset;

      const pct      = total ? Math.round((inserted / total) * 100) : 0;
      const elapsed  = (Date.now() - inicio) / 1000;
      const restante = inserted > 0 ? Math.round((elapsed / inserted) * (total - inserted)) : null;
      const tempoStr = restante !== null ? (restante > 60 ? `~${Math.ceil(restante/60)} min` : `~${restante}s`) : '...';

      document.getElementById('disparo-bar').style.width     = pct + '%';
      document.getElementById('disparo-pct').textContent     = pct + '%';
      document.getElementById('disparo-counter').textContent = `${inserted} / ${total}`;
      document.getElementById('disparo-tempo').textContent   = tempoStr + ' restantes';
      document.getElementById('disparo-status').textContent  = 'Disparando...';
      disparo_log(`📨 ${inserted}/${total} inseridas...`);

      if (data.done) {
        document.getElementById('disparo-bar').style.width     = '100%';
        document.getElementById('disparo-pct').textContent     = '100%';
        document.getElementById('disparo-tempo').textContent   = 'Concluído!';
        document.getElementById('disparo-status').textContent  = `✅ ${inserted} mensagens postadas`;
        document.getElementById('disparo-counter').textContent = `${inserted} / ${total}`;
        disparo_log(`✅ Concluído! ${inserted} mensagens inseridas.`);
        break;
      }
    }

  } catch(e) {
    disparo_log(`❌ Erro: ${e.message}`);
    document.getElementById('disparo-status').textContent = 'Erro durante o disparo.';
  }

  document.getElementById('disparo-cancel-btn').style.display = 'none';
  document.getElementById('disparo-close-btn').style.display  = 'inline-flex';
}

async function restartAllTimelinesById(roomId) {
  if (!confirm('Reiniciar TODOS os blocos desta sala? Isso apagará as mensagens do chat e reiniciará do zero.')) return;
  try {
    await api(`rooms/${roomId}/clear_messages`, 'DELETE');
    const blocks = await api(`blocks?room_id=${roomId}`);
    for (const b of blocks) {
      await api(`blocks/${b.id}/status`, 'PUT', { status: 'pending' });
    }
    toast('Todos os blocos reiniciados!');
  } catch(e) { toast(e.message, 'error'); }
}

async function restartAllTimelines() {
  if (!confirm('Reiniciar TODOS os blocos desta sala? Isso apagará as mensagens do chat e reiniciará do zero.')) return;
  try {
    await api(`rooms/${currentRoomId}/clear_messages`, 'DELETE');
    const blocks = await api(`blocks?room_id=${currentRoomId}`);
    for (const b of blocks) {
      await api(`blocks/${b.id}/status`, 'PUT', { status: 'pending' });
    }
    toast('Todos os blocos reiniciados! Use ▶ Iniciar em cada um.');
    await loadBlocks();
  } catch(e) { toast(e.message, 'error'); }
}

async function restartTimeline(id) {
  if (!confirm('Reiniciar timeline? Isso apagará as mensagens deste bloco no chat e reiniciará do zero.')) return;
  try {
    await api(`blocks/${id}/clear_messages`, 'DELETE');
    await api(`blocks/${id}/status`, 'PUT', { status: 'pending' });
    toast('Timeline reiniciada! Use ▶ Iniciar para rodar novamente.');
    await loadBlocks();
  } catch(e) { toast(e.message, 'error'); }
}

async function toggleLoop(id, currentLoop) {
  try {
    const newLoop = currentLoop ? 0 : 1;
    await api(`blocks/${id}`, 'PUT', { loop_infinite: newLoop });
    toast(newLoop ? '∞ Loop infinito ativado!' : 'Loop desativado.');
    await loadBlocks();
  } catch(e) { toast(e.message, 'error'); }
}

async function toggleTipsBlock(id, current) {
  try {
    const newVal = current ? 0 : 1;
    await api(`blocks/${id}`, 'PUT', { is_tips_block: newVal });
    toast(newVal ? '💡 Bloco de Dicas ativado!' : 'Bloco de Dicas desativado.');
    await loadBlocks();
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteBlock(id, name) {
  if (!confirm(`Remover o bloco "${name}"?\n\nIsso apagará todas as mensagens da timeline e do feed associadas a este bloco.`)) return;
  try {
    await api(`blocks/${id}`, 'DELETE');
    toast('Bloco removido.');
    await loadBlocks();
  } catch(e) { toast(e.message, 'error'); }
}

function toggleTipsUI(suffix) {
  const hidden  = document.getElementById(`${suffix === 'new' ? 'block' : 'edit-block'}-is-tips`);
  const toggle  = document.getElementById(`tips-toggle-${suffix}`);
  const knob    = document.getElementById(`tips-knob-${suffix}`);
  const active  = hidden.value === '1';
  hidden.value  = active ? '0' : '1';
  toggle.style.background = active ? 'var(--border)' : 'var(--green, #3ecf70)';
  knob.style.left = active ? '3px' : '19px';
}

function openEditBlock(id, name, topic, isTips) {
  document.getElementById('edit-block-id').value    = id;
  document.getElementById('edit-block-name').value  = name;
  document.getElementById('edit-block-topic').value = topic;
  const hidden  = document.getElementById('edit-block-is-tips');
  const toggle  = document.getElementById('tips-toggle-edit');
  const knob    = document.getElementById('tips-knob-edit');
  hidden.value  = isTips ? '1' : '0';
  toggle.style.background = isTips ? 'var(--green, #3ecf70)' : 'var(--border)';
  knob.style.left = isTips ? '19px' : '3px';
  openModal('modalEditBlock');
}

async function saveEditBlock() {
  const id      = document.getElementById('edit-block-id').value;
  const name    = document.getElementById('edit-block-name').value.trim();
  const topic   = document.getElementById('edit-block-topic').value.trim();
  const isTips  = parseInt(document.getElementById('edit-block-is-tips').value);
  if (!name || !topic) return toast('Nome e tema obrigatórios', 'error');
  try {
    await api(`blocks/${id}`, 'PUT', { name, topic, is_tips_block: isTips });
    toast('Bloco salvo!');
    closeModal('modalEditBlock');
    await loadBlocks();
  } catch(e) { toast(e.message, 'error'); }
}

// ================================================================
// PROMPT BUILDER / GENERATE
// ================================================================
async function openGenerate(blockId, blockName, blockTopic) {
  currentBlockId = blockId;
  document.getElementById('generateBlockInfo').textContent = `Bloco selecionado: ${blockName} — ${blockTopic.slice(0,60)}...`;
  openModal('modalGenerate');
}

function openPromptBuilder() {
  const token = localStorage.getItem('admin_token') || '';
  const url   = window._BASE + '/prompt_builder.php' + (token ? '?token=' + encodeURIComponent(token) : '');
  window.open(url, '_blank');
}

async function importSQL() {
  const sql = document.getElementById('import-sql-text').value.trim();
  const status = document.getElementById('import-sql-status');
  if (!sql) return (status.style.color = 'var(--red)', status.textContent = '❌ Cole o SQL antes de importar');
  status.style.color = 'var(--muted)';
  status.textContent = 'Importando...';
  try {
    const result = await api('import_sql', 'POST', { sql });
    if (result.ok) {
      status.style.color = 'var(--green)';
      status.textContent = `✅ ${result.rows_inserted} mensagens importadas!`;
      toast(`${result.rows_inserted} mensagens importadas com sucesso!`);
      document.getElementById('import-sql-text').value = '';
      setTimeout(() => { closeModal('modalImportSQL'); closeModal('modalGenerate'); loadBlocks(); }, 1800);
    } else {
      status.style.color = 'var(--red)';
      status.textContent = '❌ ' + (result.error || 'Erro ao importar');
    }
  } catch(e) {
    status.style.color = 'var(--red)';
    status.textContent = '❌ ' + e.message;
  }
}

// ================================================================
// TIMELINE VIEWER
// ================================================================
async function viewTimeline(blockId, blockName) {
  currentBlockId = blockId;
  document.getElementById('timelineTitle').textContent = `Timeline: ${blockName}`;
  openModal('modalTimeline');
  await loadTimelineMsgs(blockId);
}

async function loadTimelineMsgs(blockId) {
  const el = document.getElementById('timelineContent');
  el.innerHTML = 'Carregando...';
  try {
    const msgs = await api(`timeline?block_id=${blockId}`);
    if (!msgs.length) {
      el.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px">Timeline vazia. Use 🧠 Gerar Prompt para criar mensagens.</div>';
      return;
    }
    timelineMsgData = {};
    msgs.forEach(m => { timelineMsgData[m.id] = m; });
    const icons  = { statement:'💬', question:'❓', answer:'↩️', tip:'💡', reaction:'😄', vacuum_question:'🌀' };
    const labels = { statement:'Declaração', question:'Dúvida', vacuum_question:'Vácuo', answer:'Resposta', tip:'Dica', reaction:'Reação' };
    el.innerHTML = msgs.map(m => `
      <div class="timeline-item ${m.message_type}">
        <div style="color:var(--muted);font-size:11px;min-width:22px;text-align:center;padding-top:2px">${m.sequence_order}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">
            <span style="font-weight:600;font-size:12px">${escHtml(m.bot_name)}</span>
            <span style="font-size:10px;color:var(--muted)">${escHtml(m.archetype_name)}</span>
            <span style="font-size:10px;color:var(--muted)">${icons[m.message_type]||'💬'} ${labels[m.message_type]||m.message_type}</span>
            <span style="font-size:10px;color:var(--muted);margin-left:auto">+${m.delay_after_prev}s</span>
            ${m.posted_at ? '<span style="color:var(--green);font-size:10px">✓</span>' : ''}
          </div>
          <div style="font-size:12.5px;line-height:1.5">${escHtml(m.content)}</div>
          ${m.reply_to_id ? `<div style="font-size:10px;color:var(--muted);margin-top:4px">↩ responde #${m.reply_to_id}</div>` : ''}
          <div style="margin-top:8px;display:flex;gap:6px">
            <button class="btn btn-xs btn-secondary" data-msg-id="${m.id}" onclick="openEditMsg(this)">✏️ Editar</button>
            <button class="btn btn-xs btn-danger" onclick="deleteTimelineMsg(${m.id})">🗑</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch(e) { el.innerHTML = `<div style="color:var(--red)">${e.message}</div>`; }
}

async function clearTimeline() {
  if (!confirm('Apagar TODAS as mensagens da timeline deste bloco?')) return;
  try {
    await api(`timeline/${currentBlockId}`, 'DELETE');
    toast('Timeline limpa!');
    closeModal('modalTimeline');
    await loadBlocks();
  } catch(e) { toast(e.message, 'error'); }
}

function toggleTipoTooltip(e) {
  e.stopPropagation();
  const tt = document.getElementById('tipo-tooltip');
  tt.style.display = tt.style.display === 'none' ? 'block' : 'none';
  if (tt.style.display === 'block') {
    setTimeout(() => document.addEventListener('click', function hide() {
      tt.style.display = 'none';
      document.removeEventListener('click', hide);
    }), 0);
  }
}

async function openEditMsg(btn) {
  const msgId = parseInt(btn.dataset.msgId);
  const m = timelineMsgData[msgId];
  if (!m) return toast('Dados da mensagem não encontrados', 'error');

  document.getElementById('edit-msg-id').value      = m.id;
  document.getElementById('edit-msg-content').value = m.content;
  document.getElementById('edit-msg-delay').value   = m.delay_after_prev;

  // Carrega arquétipos se ainda não carregou
  if (!allArchetypes.length) allArchetypes = await api('archetypes');
  const sel = document.getElementById('edit-msg-archetype');
  sel.innerHTML = '<option value="">— Manter atual —</option>' +
    allArchetypes.map(a => `<option value="${a.id}" ${a.id == (m.archetype_id||0) ? 'selected' : ''}>${escHtml(a.name)}</option>`).join('');

  document.getElementById('edit-msg-type').value = m.message_type;

  openModal('modalEditMsg');
}

async function saveEditMsg() {
  const id          = document.getElementById('edit-msg-id').value;
  const content     = document.getElementById('edit-msg-content').value.trim();
  const archetypeId = document.getElementById('edit-msg-archetype').value;
  const type        = document.getElementById('edit-msg-type').value;
  const delay       = document.getElementById('edit-msg-delay').value;
  if (!content) return toast('Conteúdo obrigatório', 'error');
  try {
    const payload = { content, message_type: type, delay_after_prev: parseInt(delay) };
    if (archetypeId) payload.archetype_id = parseInt(archetypeId);
    await api(`timeline/${id}`, 'PUT', payload);
    toast('Mensagem salva!');
    closeModal('modalEditMsg');
    // Recarrega a lista de mensagens dentro do modal de timeline (sem fechar)
    const blockName = document.getElementById('timelineTitle').textContent.replace('Timeline: ', '');
    await loadTimelineMsgs(currentBlockId);
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteTimelineMsg(msgId) {
  if (!confirm('Excluir esta mensagem da timeline?')) return;
  try {
    await api(`timeline/${currentBlockId}/msg/${msgId}`, 'DELETE');
    toast('Mensagem excluída!');
    await loadTimelineMsgs(currentBlockId);
  } catch(e) { toast(e.message, 'error'); }
}

// ================================================================
// BOTS
// ================================================================
async function loadBots() {
  const el = document.getElementById('botGrid');
  try {
    if (!allArchetypes.length) allArchetypes = await api('archetypes');
    allBots = await api('bots');
    if (!allBots.length) {
      el.innerHTML = '<div class="card" style="text-align:center;color:var(--muted);padding:32px">Nenhum bot. Crie o primeiro!</div>';
      return;
    }
    el.innerHTML = `<div class="bot-grid">
      ${allBots.map(b => `
        <div class="bot-card">
          <div class="avatar"><img src="${avatarUrl(b.name)}" alt="${escHtml(b.name)}" loading="lazy"></div>
          <div class="bot-name">${escHtml(b.name)}</div>
          <div class="bot-arch">${escHtml(b.archetype_name)}</div>
          <div class="bot-actions">
            <button class="btn btn-xs btn-danger" onclick="deleteBot(${b.id})">🗑 Remover</button>
          </div>
        </div>`).join('')}
    </div>`;
    const sel = document.getElementById('bot-archetype');
    sel.innerHTML = allArchetypes.map(a => `<option value="${a.id}">${escHtml(a.name)}</option>`).join('');
  } catch(e) { toast(e.message, 'error'); }
}

async function createBot() {
  const name = document.getElementById('bot-name').value.trim();
  const arch = document.getElementById('bot-archetype').value;
  const gen  = document.getElementById('bot-gender').value;
  if (!name) return toast('Nome obrigatório', 'error');
  if (!arch || isNaN(parseInt(arch))) return toast('Selecione um arquétipo', 'error');
  try {
    await api('bots', 'POST', { name, archetype_id: parseInt(arch), gender: gen });
    closeModal('modalBot');
    toast('Bot criado!');
    document.getElementById('bot-name').value = '';
    allBots = [];
    await loadBots();
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteBot(id) {
  if (!confirm('Remover este bot?')) return;
  try {
    await api(`bots/${id}`, 'DELETE');
    toast('Bot removido');
    allBots = [];
    await loadBots();
  } catch(e) { toast(e.message, 'error'); }
}

// ================================================================
// ARCHETYPES
// ================================================================
async function loadArchetypes() {
  const el = document.getElementById('archetypesTable');
  try {
    allArchetypes = await api('archetypes');
    el.innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>Nome</th><th>Descrição</th><th>Erros</th><th>Emojis</th><th>Delay</th></tr></thead>
      <tbody>${allArchetypes.map(a => `<tr>
        <td><strong>${escHtml(a.name)}</strong></td>
        <td style="font-size:12px;color:var(--muted)">${escHtml((a.description||'').slice(0,60))}...</td>
        <td>${a.typo_rate}%</td>
        <td>${a.emoji_rate}%</td>
        <td>${a.response_delay_min}–${a.response_delay_max}s</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  } catch(e) { toast(e.message, 'error'); }
}

async function createArchetype() {
  const archName = document.getElementById('arch-name').value.trim();
  const data = {
    name:                archName,
    description:         document.getElementById('arch-desc').value.trim(),
    speaking_style:      document.getElementById('arch-style').value.trim(),
    vocabulary_examples: document.getElementById('arch-vocab').value.trim(),
    typo_rate:           parseInt(document.getElementById('arch-typo').value),
    emoji_rate:          parseInt(document.getElementById('arch-emoji').value),
    response_delay_min:  3,
    response_delay_max:  30,
    avatar_seed:         archName || 'arch' + Date.now()
  };
  if (!data.name || !data.speaking_style) return toast('Nome e estilo obrigatórios', 'error');
  try {
    await api('archetypes', 'POST', data);
    closeModal('modalArchetype');
    toast('Arquétipo criado!');
    // Limpa campos
    ['arch-name','arch-desc','arch-style','arch-vocab'].forEach(id => document.getElementById(id).value = '');
    allArchetypes = [];
    await loadArchetypes();
  } catch(e) { toast(e.message, 'error'); }
}

// ================================================================
// SETTINGS
// ================================================================
function updateCronCode(cronToken) {
  const token  = cronToken || 'SEU_TOKEN';
  const el     = document.getElementById('cronCodeText');
  if (el) el.textContent = `*/5 * * * * curl -s "${window._BASE}/api/cron?token=${token}" > /dev/null`;
}

async function loadSettings() {
  try {
    const s = await api('settings');
    document.getElementById('cfg-claude-key').placeholder = s.claude_api_key ? '••••••••••' : 'sk-ant-...';
    document.getElementById('cfg-claude-model').value     = s.claude_model   || 'claude-opus-4-5';
    document.getElementById('cfg-admin-token').value = s.admin_token    || '';
    document.getElementById('cfg-cron-token').value  = s.cron_token     || '';
    updateCronCode(s.cron_token);
  } catch(e) { toast('Erro ao carregar configurações: ' + e.message, 'error'); }
}

async function saveSettings() {
  const key   = document.getElementById('cfg-claude-key').value.trim();
  const model = document.getElementById('cfg-claude-model').value;
  const token = document.getElementById('cfg-admin-token').value.trim();
  const cron  = document.getElementById('cfg-cron-token').value.trim();
  const data  = { claude_model: model };
  if (key   && key !== '••••••••••') data.claude_api_key = key;
  if (token) { data.admin_token = token; localStorage.setItem('admin_token', token); }
  if (cron)  { data.cron_token  = cron;  updateCronCode(cron); }
  try {
    await api('settings', 'POST', data);
    toast('Configurações salvas!');
  } catch(e) { toast(e.message, 'error'); }
}

// ── INIT ──
(async function init() {
  try {
    await loadDashboard();
  } catch(e) {
    toast('Erro ao conectar com a API', 'error');
  }
})();
</script>
</body>
</html>
