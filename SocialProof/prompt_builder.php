<?php
// ============================================================
// prompt_builder.php — Gerador de Prompt para Social Proof
// Integra direto no admin existente via include ou standalone
// ============================================================
require_once __DIR__ . '/includes/config.php';

// Auth
$token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? ($_GET['token'] ?? '');
$adminToken = getSetting('admin_token');
if ($adminToken && $token !== $adminToken) {
    http_response_code(401);
    die(json_encode(['error' => 'Não autorizado']));
}

// Busca salas e arquétipos para popular os selects
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['api'])) {
    header('Content-Type: application/json');

    if ($_GET['api'] === 'rooms') {
        echo json_encode(DB::fetchAll("SELECT id, name, slug, produto_nome, produto_nicho, produto_mecanismo, produto_publico,
            resultado_minimo, resultado_medio, resultado_maximo, beneficios_secundarios, primeiro_resultado_em,
            oferta_preco, oferta_acesso, oferta_garantia, objecoes, quebras_objecao,
            nivel_ceticismo, intensidade_prova, arquetipos_ativos, arquetipos_cetico_id, arquetipos_ancora_id, campos_ativos
            FROM rooms WHERE status != 'inactive' ORDER BY name"));
        exit;
    }

    if ($_GET['api'] === 'archetypes') {
        echo json_encode(DB::fetchAll("SELECT id, name, description, speaking_style, vocabulary_examples, typo_rate, emoji_rate, response_delay_min, response_delay_max FROM archetypes ORDER BY name"));
        exit;
    }

    if ($_GET['api'] === 'blocks' && isset($_GET['room_id'])) {
        echo json_encode(DB::fetchAll("SELECT id, name, topic, is_tips_block, loop_infinite FROM blocks WHERE room_id = ? ORDER BY id", [(int)$_GET['room_id']]));
        exit;
    }
}

// Salva configurações da sala
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['api']) && $_GET['api'] === 'save_room_config') {
    header('Content-Type: application/json');
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = (int)($data['room_id'] ?? 0);
    if (!$id) { echo json_encode(['error' => 'room_id obrigatório']); exit; }

    $fields = ['produto_nome','produto_nicho','produto_mecanismo','produto_publico',
               'resultado_minimo','resultado_medio','resultado_maximo','beneficios_secundarios','primeiro_resultado_em',
               'oferta_preco','oferta_acesso','oferta_garantia','objecoes','quebras_objecao',
               'nivel_ceticismo','intensidade_prova','arquetipos_ativos','arquetipos_cetico_id','arquetipos_ancora_id','campos_ativos'];

    $sets = []; $vals = [];
    foreach ($fields as $f) {
        if (array_key_exists($f, $data)) {
            $sets[] = "`$f` = ?";
            $v = $data[$f];
            if (is_array($v)) $v = json_encode($v, JSON_UNESCAPED_UNICODE);
            if ($v === '' || $v === null || $v === 'null') $v = null;
            $vals[] = $v;
        }
    }
    if (empty($sets)) { echo json_encode(['ok' => true, 'msg' => 'Nada para salvar']); exit; }
    $vals[] = $id;
    DB::query("UPDATE rooms SET " . implode(', ', $sets) . " WHERE id = ?", $vals);
    echo json_encode(['ok' => true]);
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gerador de Prompt — Social Proof Engine</title>
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
}

* { margin:0; padding:0; box-sizing:border-box; }
html,body { background:var(--bg); font-family:'Space Grotesk',sans-serif; color:var(--text); min-height:100vh; }

.wrap { max-width: 900px; margin: 0 auto; padding: 28px 20px 60px; }

h1 { font-size:22px; font-weight:700; color:var(--text); margin-bottom:4px; }
.subtitle { font-size:13px; color:var(--muted); margin-bottom:28px; }

/* ── STEPS ── */
.steps { display:flex; gap:0; margin-bottom:32px; }
.step { flex:1; padding:10px 14px; font-size:12px; font-weight:600; color:var(--muted); border-bottom:2px solid var(--border); cursor:pointer; text-transform:uppercase; letter-spacing:.5px; transition:all .2s; text-align:center; }
.step.active { color:var(--accent); border-color:var(--accent); }
.step.done   { color:var(--green);  border-color:var(--green); }

/* ── PANELS ── */
.panel { display:none; }
.panel.active { display:block; }

/* ── CARD ── */
.card { background:var(--panel); border:1px solid var(--border); border-radius:var(--radius); padding:20px 22px; margin-bottom:16px; }
.card-title { font-size:13px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:.6px; margin-bottom:16px; display:flex; align-items:center; gap:8px; }

/* ── FORM ── */
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
.form-row.single { grid-template-columns:1fr; }
.form-group { display:flex; flex-direction:column; gap:5px; }
.field-header { display:flex; align-items:center; justify-content:space-between; }
label { font-size:12px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:.4px; }
.field-hint { font-size:11px; color:var(--muted); margin-top:3px; font-style:italic; }

input[type=text], input[type=number], textarea, select {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  padding: 9px 12px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color .2s;
  width: 100%;
}
input:focus, textarea:focus, select:focus { outline:none; border-color:var(--accent); }
textarea { min-height:72px; resize:vertical; }
select option { background:var(--surface); }

/* ── TOGGLE (campo ativo/inativo) ── */
.field-toggle { display:flex; align-items:center; gap:8px; }
.toggle { width:32px; height:18px; border-radius:9px; background:var(--border2); position:relative; cursor:pointer; flex-shrink:0; transition:background .2s; }
.toggle.on { background:var(--accent); }
.toggle .knob { position:absolute; top:3px; left:3px; width:12px; height:12px; border-radius:50%; background:#fff; transition:left .2s; }
.toggle.on .knob { left:17px; }

.field-wrap { border:1px solid var(--border); border-radius:10px; padding:14px; margin-bottom:10px; transition:border-color .2s; }
.field-wrap.enabled { border-color:var(--border2); }
.field-wrap.disabled { opacity:.45; }
.field-wrap.disabled input, .field-wrap.disabled textarea, .field-wrap.disabled select { pointer-events:none; }

/* ── OBJEÇÕES ── */
.obj-list { display:flex; flex-direction:column; gap:8px; margin-top:10px; }
.obj-item { display:grid; grid-template-columns:1fr 1fr auto; gap:8px; align-items:start; }
.obj-item input, .obj-item textarea { font-size:12px; }
.btn-rm { background:rgba(255,71,87,.15); border:1px solid rgba(255,71,87,.3); color:var(--red); border-radius:6px; padding:6px 10px; cursor:pointer; font-size:12px; white-space:nowrap; transition:background .2s; }
.btn-rm:hover { background:rgba(255,71,87,.3); }

/* ── ARQUÉTIPOS ── */
.arch-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:10px; margin-top:10px; }
.arch-chip { border:1px solid var(--border); border-radius:8px; padding:10px 12px; cursor:pointer; transition:all .2s; user-select:none; }
.arch-chip:hover { border-color:var(--border2); }
.arch-chip.selected { border-color:var(--accent); background:rgba(245,166,35,.08); }
.arch-chip-name { font-size:12px; font-weight:600; }
.arch-chip-desc { font-size:11px; color:var(--muted); margin-top:2px; }

/* ── RADIO GROUP ── */
.radio-group { display:flex; gap:8px; flex-wrap:wrap; margin-top:6px; }
.radio-opt { border:1px solid var(--border); border-radius:8px; padding:8px 14px; font-size:12px; font-weight:600; cursor:pointer; transition:all .2s; }
.radio-opt:hover { border-color:var(--border2); }
.radio-opt.selected { border-color:var(--accent); color:var(--accent); background:rgba(245,166,35,.08); }

/* ── MODO ── */
.modo-cards { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px; }
.modo-card { border:2px solid var(--border); border-radius:12px; padding:20px; cursor:pointer; transition:all .2s; }
.modo-card:hover { border-color:var(--border2); }
.modo-card.selected { border-color:var(--accent); background:rgba(245,166,35,.06); }
.modo-card-title { font-size:15px; font-weight:700; margin-bottom:6px; }
.modo-card-desc  { font-size:12px; color:var(--muted); line-height:1.5; }
.modo-card-icon  { font-size:28px; margin-bottom:10px; }

/* ── PROMPT OUTPUT ── */
.prompt-box { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:16px; font-family:'JetBrains Mono',monospace; font-size:11.5px; line-height:1.7; color:#c9d1e0; white-space:pre-wrap; word-break:break-word; max-height:520px; overflow-y:auto; margin-bottom:14px; }
.prompt-section { color:var(--accent); font-weight:700; }
.prompt-label   { color:var(--blue); }
.prompt-value   { color:#c9d1e0; }

/* ── BTNS ── */
.btn { display:inline-flex; align-items:center; gap:6px; border:none; border-radius:8px; padding:9px 18px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .2s; }
.btn-primary  { background:var(--accent); color:#000; }
.btn-primary:hover { background:#e8961a; }
.btn-secondary { background:var(--surface); color:var(--text); border:1px solid var(--border); }
.btn-secondary:hover { border-color:var(--border2); }
.btn-green { background:var(--green); color:#000; }
.btn-green:hover { background:#32b85e; }
.btn-blue { background:rgba(74,158,255,.15); color:var(--blue); border:1px solid rgba(74,158,255,.3); }
.btn-sm { padding:6px 12px; font-size:12px; }

.btn-row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }

/* ── ROOM SELECT ── */
.room-select-wrap { margin-bottom:24px; }
.room-select-wrap label { display:block; margin-bottom:6px; font-size:12px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:.4px; }

/* ── TOAST ── */
#toast { position:fixed; bottom:24px; right:24px; background:var(--green); color:#000; border-radius:10px; padding:12px 20px; font-weight:600; font-size:13px; opacity:0; transform:translateY(10px); transition:all .3s; z-index:9999; pointer-events:none; }
#toast.show { opacity:1; transform:translateY(0); }
#toast.error { background:var(--red); color:#fff; }

/* ── SECTION HEADER ── */
.section-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
.section-bar-title { font-size:16px; font-weight:700; }

/* ── BLOCO TIMELINE ── */
.block-row { display:grid; grid-template-columns:1fr 1fr auto; gap:10px; align-items:start; margin-bottom:8px; }
.block-row input, .block-row textarea { font-size:12px; }

@media(max-width:600px) {
  .form-row { grid-template-columns:1fr; }
  .modo-cards { grid-template-columns:1fr; }
  .obj-item { grid-template-columns:1fr; }
  .block-row { grid-template-columns:1fr; }
}
</style>
</head>
<body>
<div class="wrap">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
    <span style="font-size:24px">🧠</span>
    <h1>Gerador de Prompt</h1>
  </div>
  <div class="subtitle">Preencha as informações do produto → gere o prompt → cole em qualquer IA → importe o SQL</div>

  <!-- SELEÇÃO DE SALA -->
  <div class="room-select-wrap card">
    <div class="card-title">🏠 Sala de Destino</div>
    <div class="form-row">
      <div class="form-group">
        <label>Selecione a Sala</label>
        <select id="sel-room" onchange="onRoomChange()">
          <option value="">— Carregando... —</option>
        </select>
      </div>
      <div class="form-group" style="justify-content:flex-end;align-items:flex-end">
        <button class="btn btn-secondary btn-sm" onclick="saveRoomConfig()">💾 Salvar Configurações</button>
        <button class="btn btn-secondary btn-sm" onclick="lsClear()" style="color:var(--muted)">🗑 Limpar Cache</button>
      </div>
    </div>
  </div>

  <!-- STEPS -->
  <div class="steps">
    <div class="step active" data-step="1" onclick="goStep(1)">1. Produto</div>
    <div class="step"        data-step="2" onclick="goStep(2)">2. Resultados</div>
    <div class="step"        data-step="3" onclick="goStep(3)">3. Oferta</div>
    <div class="step"        data-step="4" onclick="goStep(4)">4. Timeline</div>
    <div class="step"        data-step="5" onclick="goStep(5)">5. Gerar</div>
  </div>

  <!-- ════════════════════════════════════ STEP 1 — PRODUTO ════════════════════════════════════ -->
  <div class="panel active" id="panel-1">
    <div class="card">
      <div class="card-title">🏷️ Identidade do Produto</div>

      <?php
      $campos = [
        ['produto_nome',      'Nome do Produto',   'text',     'Ex: Protocolo Egípcio, Método Árabe, Fórmula X',
         'Nome exato como aparece na página de vendas.'],
        ['produto_nicho',     'Nicho',             'select',   '',
         'Mercado onde o produto atua.'],
        ['produto_mecanismo', 'Mecanismo Único',   'textarea', 'Ex: combina alimentos em horários específicos sem cortar nada da dieta',
         'O que faz esse produto diferente — não é o benefício, é o POR QUE funciona.'],
        ['produto_publico',   'Público-Alvo',      'textarea', 'Ex: mulheres de 35 a 55 anos, que já tentaram outras dietas e não mantiveram',
         'Quem compra: idade, gênero, situação de vida.'],
      ];
      foreach ($campos as [$id, $label, $type, $ph, $hint]): ?>
      <div class="field-wrap enabled" id="wrap-<?= $id ?>">
        <div class="field-header" style="margin-bottom:8px">
          <div class="field-toggle">
            <div class="toggle on" id="toggle-<?= $id ?>" onclick="toggleField('<?= $id ?>')">
              <div class="knob"></div>
            </div>
            <label style="margin:0;cursor:pointer" onclick="toggleField('<?= $id ?>')"><?= $label ?></label>
          </div>
          <span style="font-size:10px;color:var(--green)">IA usa este campo</span>
        </div>
        <?php if ($type === 'textarea'): ?>
          <textarea id="<?= $id ?>" placeholder="<?= $ph ?>"></textarea>
        <?php elseif ($type === 'select' && $id === 'produto_nicho'): ?>
          <select id="<?= $id ?>">
            <option value="dietas">🥗 Dietas e Emagrecimento</option>
            <option value="fitness">💪 Fitness e Musculação</option>
            <option value="renda_extra">💰 Renda Extra e Finanças</option>
            <option value="relacionamento">❤️ Relacionamento e Sedução</option>
            <option value="espiritualidade">🔮 Espiritualidade e Bem-estar</option>
            <option value="produtividade">⚡ Produtividade e Mentalidade</option>
            <option value="saude">🏥 Saúde e Medicina Natural</option>
            <option value="beleza">💅 Beleza e Estética</option>
            <option value="outro">📦 Outro</option>
          </select>
        <?php else: ?>
          <input type="<?= $type ?>" id="<?= $id ?>" placeholder="<?= $ph ?>">
        <?php endif; ?>
        <div class="field-hint"><?= $hint ?></div>
      </div>
      <?php endforeach; ?>
    </div>
    <div class="btn-row" style="justify-content:flex-end">
      <button class="btn btn-primary" onclick="goStep(2)">Próximo →</button>
    </div>
  </div>

  <!-- ════════════════════════════════════ STEP 2 — RESULTADOS ════════════════════════════════════ -->
  <div class="panel" id="panel-2">
    <div class="card">
      <div class="card-title">📊 Resultados e Prova Social</div>

      <?php
      $campos2 = [
        ['resultado_minimo',       'Resultado Mínimo',            'text',     'Ex: 3kg em 3 semanas',
         'Menor resultado que uma pessoa comum consegue. Com número e prazo.'],
        ['resultado_medio',        'Resultado Médio',             'text',     'Ex: 7kg em 30 dias',
         'O que a maioria alcança. Com número e prazo.'],
        ['resultado_maximo',       'Resultado Máximo Relatado',   'text',     'Ex: 15kg em 60 dias',
         'Melhor caso documentado. Com número e prazo.'],
        ['beneficios_secundarios', 'Benefícios Secundários',      'textarea', 'Ex: mais disposição, menos inchaço, melhor sono, roupas antigas servindo',
         'Efeitos além do resultado principal que as pessoas relatam.'],
        ['primeiro_resultado_em',  'Primeiro Resultado Visível',  'text',     'Ex: entre 3 e 7 dias',
         'Quando a pessoa começa a sentir diferença.'],
      ];
      foreach ($campos2 as [$id, $label, $type, $ph, $hint]): ?>
      <div class="field-wrap enabled" id="wrap-<?= $id ?>">
        <div class="field-header" style="margin-bottom:8px">
          <div class="field-toggle">
            <div class="toggle on" id="toggle-<?= $id ?>" onclick="toggleField('<?= $id ?>')">
              <div class="knob"></div>
            </div>
            <label style="margin:0;cursor:pointer" onclick="toggleField('<?= $id ?>')"><?= $label ?></label>
          </div>
          <span style="font-size:10px;color:var(--green)">IA usa este campo</span>
        </div>
        <?php if ($type === 'textarea'): ?>
          <textarea id="<?= $id ?>" placeholder="<?= $ph ?>"></textarea>
        <?php else: ?>
          <input type="text" id="<?= $id ?>" placeholder="<?= $ph ?>">
        <?php endif; ?>
        <div class="field-hint"><?= $hint ?></div>
      </div>
      <?php endforeach; ?>
    </div>
    <div class="btn-row" style="justify-content:flex-end">
      <button class="btn btn-secondary" onclick="goStep(1)">← Anterior</button>
      <button class="btn btn-primary" onclick="goStep(3)">Próximo →</button>
    </div>
  </div>

  <!-- ════════════════════════════════════ STEP 3 — OFERTA ════════════════════════════════════ -->
  <div class="panel" id="panel-3">
    <div class="card">
      <div class="card-title">💰 Oferta e Objeções</div>

      <!-- Campos simples -->
      <?php
      $campos3 = [
        ['oferta_preco',    'Preço do Produto',  'text', 'Ex: R$147',                       'Valor exato.'],
        ['oferta_acesso',   'Tipo de Acesso',    'text', 'Ex: vitalício, assinatura mensal', 'Como o produto é entregue.'],
        ['oferta_garantia', 'Garantia',          'text', 'Ex: 30 dias, reembolso total',     'Quantos dias e o que cobre.'],
      ];
      foreach ($campos3 as [$id, $label, $type, $ph, $hint]): ?>
      <div class="field-wrap enabled" id="wrap-<?= $id ?>">
        <div class="field-header" style="margin-bottom:8px">
          <div class="field-toggle">
            <div class="toggle on" id="toggle-<?= $id ?>" onclick="toggleField('<?= $id ?>')">
              <div class="knob"></div>
            </div>
            <label style="margin:0;cursor:pointer" onclick="toggleField('<?= $id ?>')"><?= $label ?></label>
          </div>
          <span style="font-size:10px;color:var(--green)">IA usa este campo</span>
        </div>
        <input type="text" id="<?= $id ?>" placeholder="<?= $ph ?>">
        <div class="field-hint"><?= $hint ?></div>
      </div>
      <?php endforeach; ?>

      <!-- Objeções dinâmicas -->
      <div class="field-wrap enabled" id="wrap-objecoes">
        <div class="field-header" style="margin-bottom:8px">
          <div class="field-toggle">
            <div class="toggle on" id="toggle-objecoes" onclick="toggleField('objecoes')">
              <div class="knob"></div>
            </div>
            <label style="margin:0;cursor:pointer" onclick="toggleField('objecoes')">Objeções do Nicho</label>
          </div>
          <span style="font-size:10px;color:var(--green)">IA usa este campo</span>
        </div>
        <div class="field-hint" style="margin-bottom:10px">As desculpas e medos que impedem a compra. Preencha a objeção e como o produto a quebra.</div>
        <div class="obj-list" id="obj-list">
          <!-- Itens adicionados via JS -->
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="addObjecao()">+ Adicionar Objeção</button>
      </div>
    </div>
    <div class="btn-row" style="justify-content:flex-end">
      <button class="btn btn-secondary" onclick="goStep(2)">← Anterior</button>
      <button class="btn btn-primary" onclick="goStep(4)">Próximo →</button>
    </div>
  </div>

  <!-- ════════════════════════════════════ STEP 4 — TIMELINE ════════════════════════════════════ -->
  <div class="panel" id="panel-4">

    <!-- MODO: bloco único ou timeline completa -->
    <div class="card">
      <div class="card-title">🎬 Modo de Geração</div>
      <div class="modo-cards">
        <div class="modo-card selected" id="modo-bloco" onclick="setModo('bloco')">
          <div class="modo-card-icon">📦</div>
          <div class="modo-card-title">Bloco Único</div>
          <div class="modo-card-desc">Gera um assunto específico. Você escolhe o bloco existente ou descreve o tema.</div>
        </div>
        <div class="modo-card" id="modo-completa" onclick="setModo('completa')">
          <div class="modo-card-icon">🎞️</div>
          <div class="modo-card-title">Timeline Completa</div>
          <div class="modo-card-desc">Gera múltiplos blocos encadeados do aquecimento ao fechamento. Você define ou usa os blocos da sala.</div>
        </div>
      </div>

      <!-- Bloco único -->
      <div id="config-bloco">
        <div class="form-group" style="margin-bottom:12px">
          <label>Bloco da Sala (opcional)</label>
          <select id="sel-block">
            <option value="">— Selecione ou descreva manualmente —</option>
          </select>
        </div>
        <div class="form-group">
          <label>Tema / Assunto do Bloco</label>
          <textarea id="bloco-tema" placeholder="Ex: Pessoas compartilhando quanto perderam, como se sentem, comparações" style="min-height:60px"></textarea>
          <div class="field-hint">Preenchido automaticamente ao selecionar um bloco da sala.</div>
        </div>
        <div class="form-group" style="margin-top:12px">
          <label>Quantidade de Mensagens</label>
          <input type="number" id="bloco-qtd" value="20" min="5" max="60">
        </div>
      </div>

      <!-- Timeline completa -->
      <div id="config-completa" style="display:none">
        <div style="font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:10px">Blocos da Timeline</div>
        <div class="field-hint" style="margin-bottom:12px">Defina os blocos em ordem. Deixe em branco para usar os blocos existentes da sala.</div>
        <div id="blocos-timeline">
          <!-- populado via JS -->
        </div>
        <button class="btn btn-secondary btn-sm" onclick="addBlocoTimeline()">+ Adicionar Bloco</button>
        <div class="form-group" style="margin-top:14px">
          <label>Mensagens por Bloco</label>
          <input type="number" id="completa-qtd" value="15" min="5" max="40">
        </div>
      </div>
    </div>

    <!-- NARRATIVA -->
    <div class="card">
      <div class="card-title">🎭 Configuração Narrativa</div>

      <div style="margin-bottom:16px">
        <label style="display:block;margin-bottom:8px">Nível de Ceticismo</label>
        <div class="radio-group">
          <div class="radio-opt" data-group="ceticismo" data-val="baixo" onclick="selectRadio(this,'ceticismo')">Baixo — quase todos concordam</div>
          <div class="radio-opt selected" data-group="ceticismo" data-val="medio" onclick="selectRadio(this,'ceticismo')">Médio — um ou dois questionam</div>
          <div class="radio-opt" data-group="ceticismo" data-val="alto" onclick="selectRadio(this,'ceticismo')">Alto — debate real antes de aceitar</div>
        </div>
      </div>

      <div style="margin-bottom:16px">
        <label style="display:block;margin-bottom:8px">Intensidade da Prova Social</label>
        <div class="radio-group">
          <div class="radio-opt" data-group="prova" data-val="sutil" onclick="selectRadio(this,'prova')">Sutil — resultados aparecem naturalmente</div>
          <div class="radio-opt selected" data-group="prova" data-val="moderada" onclick="selectRadio(this,'prova')">Moderada — compartilhados com frequência</div>
          <div class="radio-opt" data-group="prova" data-val="intensa" onclick="selectRadio(this,'prova')">Intensa — números o tempo todo</div>
        </div>
      </div>
    </div>

    <!-- ARQUÉTIPOS -->
    <div class="card">
      <div class="card-title">🎭 Arquétipos na Conversa</div>
      <div class="field-hint" style="margin-bottom:12px">Selecione quais arquétipos participam dessa timeline. Clique para ativar/desativar.</div>
      <div class="arch-grid" id="arch-grid">
        <!-- populado via JS -->
      </div>

      <div class="form-row" style="margin-top:16px">
        <div class="form-group">
          <label>Arquétipo Cético</label>
          <select id="sel-cetico">
            <option value="">— Automático —</option>
          </select>
          <div class="field-hint">Quem representa resistência e dúvida antes de aceitar.</div>
        </div>
        <div class="form-group">
          <label>Arquétipo Âncora</label>
          <select id="sel-ancora">
            <option value="">— Automático —</option>
          </select>
          <div class="field-hint">Quem conduz e quebra objeções com autoridade.</div>
        </div>
      </div>
    </div>

    <div class="btn-row" style="justify-content:flex-end">
      <button class="btn btn-secondary" onclick="goStep(3)">← Anterior</button>
      <button class="btn btn-primary" onclick="gerarPrompt()">🧠 Gerar Prompt →</button>
    </div>
  </div>

  <!-- ════════════════════════════════════ STEP 5 — OUTPUT ════════════════════════════════════ -->
  <div class="panel" id="panel-5">
    <div class="card">
      <div class="section-bar">
        <div class="section-bar-title">📋 Prompt Gerado</div>
        <div class="btn-row">
          <button class="btn btn-blue btn-sm" onclick="copyPrompt()">📋 Copiar Prompt</button>
          <button class="btn btn-secondary btn-sm" onclick="goStep(4)">← Editar</button>
        </div>
      </div>
      <div class="prompt-box" id="prompt-output">Aguardando geração...</div>
    </div>

    <div class="card">
      <div class="card-title">📥 Importar SQL da IA</div>
      <div class="field-hint" style="margin-bottom:12px">Cole aqui o SQL retornado pela IA e execute direto no seu banco de dados.</div>
      <textarea id="sql-input" style="min-height:200px;font-family:'JetBrains Mono',monospace;font-size:12px" placeholder="Cole o SQL aqui..."></textarea>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn btn-green" onclick="copySql()">📋 Copiar SQL</button>
        <span style="font-size:12px;color:var(--muted)">Execute no phpMyAdmin, DBeaver ou linha de comando</span>
      </div>
    </div>
  </div>

</div>

<div id="toast"></div>

<script>
// ── CONFIG ──
const BASE = (function() {
  const p = window.location.pathname.replace(/\/admin(\/[^\/]+)?$/, '').replace(/\/+$/, '');
  return window.location.origin + p;
})();

// ── STATE ──
let allRooms      = [];
let allArchetypes = [];
let allBlocks     = [];
let activeFields  = new Set();
let selectedArchetypes = new Set();
let currentModo   = 'bloco';
let objecoesCount = 0;
let blocosCount   = 0;

// ── LOCALSTORAGE PERSISTENCE ──
const LS_KEY = 'pb_state_v2';


function lsClear() {
  if (confirm('Limpar estado salvo e recarregar?')) {
    localStorage.removeItem(LS_KEY);
    location.reload();
  }
}

function lsSave() {
  try {
    const state = {
      room_id: document.getElementById('sel-room').value,
      produto_nome: val('produto_nome'),
      produto_nicho: val('produto_nicho'),
      produto_mecanismo: val('produto_mecanismo'),
      produto_publico: val('produto_publico'),
      resultado_minimo: val('resultado_minimo'),
      resultado_medio: val('resultado_medio'),
      resultado_maximo: val('resultado_maximo'),
      beneficios_secundarios: val('beneficios_secundarios'),
      primeiro_resultado_em: val('primeiro_resultado_em'),
      oferta_preco: val('oferta_preco'),
      oferta_acesso: val('oferta_acesso'),
      oferta_garantia: val('oferta_garantia'),
      objecoes: getObjecoes(),
      ceticismo: getRadioVal('ceticismo') || 'medio',
      prova: getRadioVal('prova') || 'moderada',
      archetypes: [...selectedArchetypes],
      cetico_id: val('sel-cetico'),
      ancora_id: val('sel-ancora'),
      activeFields: [...activeFields],
      modo: currentModo,
      bloco_tema: val('bloco-tema'),
      bloco_qtd: val('bloco-qtd'),
      completa_qtd: val('completa-qtd'),
      blocos: getBlocosTimeline(),
      step: currentStep,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch(e) {}
}

function lsLoad() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch(e) { return null; }
}

function applyState(state) {
  if (!state) return;
  // Campos simples
  const simple = ['produto_nome','produto_nicho','produto_mecanismo','produto_publico',
    'resultado_minimo','resultado_medio','resultado_maximo','beneficios_secundarios',
    'primeiro_resultado_em','oferta_preco','oferta_acesso','oferta_garantia'];
  simple.forEach(id => { if (state[id] != null) fillField(id, state[id], id === 'produto_nicho' ? 'select' : 'input'); });

  // Radio
  if (state.ceticismo) selectRadioByVal('ceticismo', state.ceticismo);
  if (state.prova)     selectRadioByVal('prova',     state.prova);

  // Objeções
  if (state.objecoes && state.objecoes.length) {
    document.getElementById('obj-list').innerHTML = '';
    objecoesCount = 0;
    state.objecoes.forEach(o => addObjecao(o.objecao || '', o.quebra || ''));
  }

  // Arquétipos
  if (state.archetypes && state.archetypes.length) {
    selectedArchetypes = new Set(state.archetypes.map(String));
    renderArchGrid();
  }
  if (state.cetico_id) setTimeout(() => document.getElementById('sel-cetico').value = state.cetico_id, 100);
  if (state.ancora_id) setTimeout(() => document.getElementById('sel-ancora').value = state.ancora_id, 100);

  // campos ativos
  if (state.activeFields && state.activeFields.length) {
    activeFields = new Set(state.activeFields);
    document.querySelectorAll('[id^="toggle-"]').forEach(t => {
      const fid = t.id.replace('toggle-','');
      setToggleState(fid, activeFields.has(fid));
    });
  }

  // Modo
  if (state.modo) setModo(state.modo);
  if (state.bloco_tema) { const el = document.getElementById('bloco-tema'); if(el) el.value = state.bloco_tema; }
  if (state.bloco_qtd)  { const el = document.getElementById('bloco-qtd');  if(el) el.value = state.bloco_qtd; }
  if (state.completa_qtd) { const el = document.getElementById('completa-qtd'); if(el) el.value = state.completa_qtd; }

  // Blocos timeline
  if (state.blocos && state.blocos.length) {
    document.getElementById('blocos-timeline').innerHTML = '';
    blocosCount = 0;
    state.blocos.forEach(b => addBlocoTimeline(b.nome || '', b.topico || ''));
  }

  // Step
  if (state.step) goStep(state.step);
}

// Auto-save em qualquer mudança
function attachAutoSave() {
  document.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('change', lsSave);
    el.addEventListener('input', lsSave);
  });
}

// ── INIT ──
(async function init() {
  try {
    const token = localStorage.getItem('admin_token') || '';
    const [rooms, archs] = await Promise.all([
      fetch(`${BASE}/prompt_builder.php?api=rooms`, { headers: { 'X-Admin-Token': token } }).then(r => r.json()),
      fetch(`${BASE}/prompt_builder.php?api=archetypes`, { headers: { 'X-Admin-Token': token } }).then(r => r.json()),
    ]);
    allRooms      = rooms;
    allArchetypes = archs;

    // Popula select de salas
    const sel = document.getElementById('sel-room');
    sel.innerHTML = '<option value="">— Selecione a sala —</option>' +
      rooms.map(r => `<option value="${r.id}">${esc(r.name)}</option>`).join('');

    // Popula arquétipos no grid e selects
    renderArchGrid();
    renderArchSelects();

    // Tenta restaurar estado do localStorage
    const saved = lsLoad();
    if (saved) {
      // Restaura sala no select
      if (saved.room_id) {
        sel.value = saved.room_id;
        // Carrega blocos da sala em background
        try {
          const blks = await fetch(`${BASE}/prompt_builder.php?api=blocks&room_id=${saved.room_id}`, {
            headers: { 'X-Admin-Token': token }
          }).then(r => r.json());
          allBlocks = blks;
          const selBlock = document.getElementById('sel-block');
          if (selBlock) selBlock.innerHTML = '<option value="">— Selecione ou descreva manualmente —</option>' +
            blks.map(b => `<option value="${b.id}" data-topic="${esc(b.topic)}">${esc(b.name || b.topic.slice(0,40))}</option>`).join('');
        } catch(e) {}
      }
      applyState(saved);
    } else {
      // Sem estado salvo: padrões
      addObjecao(); addObjecao();
      addBlocoTimeline(); addBlocoTimeline(); addBlocoTimeline();
    }

    // Attach auto-save após renderizar tudo
    setTimeout(attachAutoSave, 500);

  } catch(e) { toast('Erro ao carregar dados: ' + e.message, 'error'); }
})();

// ── ROOM CHANGE ──
async function onRoomChange() {
  const roomId = document.getElementById('sel-room').value;
  if (!roomId) return;

  const room = allRooms.find(r => r.id == roomId);
  if (!room) return;

  // Preenche campos com dados salvos
  fillField('produto_nome',       room.produto_nome);
  fillField('produto_nicho',      room.produto_nicho, 'select');
  fillField('produto_mecanismo',  room.produto_mecanismo);
  fillField('produto_publico',    room.produto_publico);
  fillField('resultado_minimo',   room.resultado_minimo);
  fillField('resultado_medio',    room.resultado_medio);
  fillField('resultado_maximo',   room.resultado_maximo);
  fillField('beneficios_secundarios', room.beneficios_secundarios);
  fillField('primeiro_resultado_em', room.primeiro_resultado_em);
  fillField('oferta_preco',       room.oferta_preco);
  fillField('oferta_acesso',      room.oferta_acesso);
  fillField('oferta_garantia',    room.oferta_garantia);

  // Objeções
  if (room.objecoes) {
    const objs  = tryParse(room.objecoes, []);
    const queb  = tryParse(room.quebras_objecao, []);
    document.getElementById('obj-list').innerHTML = '';
    objecoesCount = 0;
    objs.forEach((o, i) => addObjecao(o, queb[i] || ''));
  }

  // Configurações narrativas
  if (room.nivel_ceticismo)   selectRadioByVal('ceticismo', room.nivel_ceticismo);
  if (room.intensidade_prova) selectRadioByVal('prova',     room.intensidade_prova);

  // Arquétipos
  if (room.arquetipos_ativos) {
    const ids = tryParse(room.arquetipos_ativos, []);
    selectedArchetypes = new Set(ids.map(String));
    renderArchGrid();
  }
  if (room.arquetipos_cetico_id) document.getElementById('sel-cetico').value = room.arquetipos_cetico_id;
  if (room.arquetipos_ancora_id) document.getElementById('sel-ancora').value = room.arquetipos_ancora_id;

  // Campos ativos
  if (room.campos_ativos) {
    const ativos = tryParse(room.campos_ativos, []);
    activeFields = new Set(ativos);
    // Sincroniza toggles
    document.querySelectorAll('[id^="toggle-"]').forEach(t => {
      const fieldId = t.id.replace('toggle-','');
      const isOn = activeFields.has(fieldId) || ativos.length === 0;
      setToggleState(fieldId, isOn);
    });
  }

  // Blocos
  try {
    const token = localStorage.getItem('admin_token') || '';
    allBlocks = await fetch(`${BASE}/prompt_builder.php?api=blocks&room_id=${roomId}`, {
      headers: { 'X-Admin-Token': token }
    }).then(r => r.json());

    const selBlock = document.getElementById('sel-block');
    selBlock.innerHTML = '<option value="">— Selecione ou descreva manualmente —</option>' +
      allBlocks.map(b => `<option value="${b.id}" data-topic="${esc(b.topic)}">${esc(b.name || b.topic.slice(0,40))}</option>`).join('');
    selBlock.onchange = function() {
      const opt = this.options[this.selectedIndex];
      if (opt.value) document.getElementById('bloco-tema').value = opt.dataset.topic || '';
    };

    // Timeline completa: preenche blocos da sala
    if (allBlocks.length) {
      document.getElementById('blocos-timeline').innerHTML = '';
      blocosCount = 0;
      allBlocks.filter(b => !b.is_tips_block && !b.loop_infinite)
        .forEach(b => addBlocoTimeline(b.name || '', b.topic || ''));
    }
  } catch(e) {}
}

function fillField(id, val, type = 'input') {
  if (!val) return;
  const el = document.getElementById(id);
  if (!el) return;
  if (type === 'select') {
    for (let i = 0; i < el.options.length; i++) {
      if (el.options[i].value === val) { el.selectedIndex = i; break; }
    }
  } else {
    el.value = val;
  }
}

// ── SAVE ROOM CONFIG ──
async function saveRoomConfig() {
  const roomId = document.getElementById('sel-room').value;
  if (!roomId) return toast('Selecione uma sala primeiro', 'error');

  const objs  = getObjecoes();
  const token = localStorage.getItem('admin_token') || '';

  const payload = {
    room_id:             parseInt(roomId),
    produto_nome:        val('produto_nome'),
    produto_nicho:       val('produto_nicho'),
    produto_mecanismo:   val('produto_mecanismo'),
    produto_publico:     val('produto_publico'),
    resultado_minimo:    val('resultado_minimo'),
    resultado_medio:     val('resultado_medio'),
    resultado_maximo:    val('resultado_maximo'),
    beneficios_secundarios: val('beneficios_secundarios'),
    primeiro_resultado_em:  val('primeiro_resultado_em'),
    oferta_preco:        val('oferta_preco'),
    oferta_acesso:       val('oferta_acesso'),
    oferta_garantia:     val('oferta_garantia'),
    objecoes:            JSON.stringify(objs.map(o => o.objecao)),
    quebras_objecao:     JSON.stringify(objs.map(o => o.quebra)),
    nivel_ceticismo:     getRadioVal('ceticismo') || 'medio',
    intensidade_prova:   getRadioVal('prova') || 'moderada',
    arquetipos_ativos:   JSON.stringify([...selectedArchetypes]),
    arquetipos_cetico_id: val('sel-cetico') || null,
    arquetipos_ancora_id: val('sel-ancora') || null,
    campos_ativos:       JSON.stringify([...activeFields]),
  };

  try {
    const res = await fetch(`${BASE}/prompt_builder.php?api=save_room_config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.ok) toast('Configurações salvas!');
    else toast(data.error || 'Erro ao salvar', 'error');
  } catch(e) { toast('Erro: ' + e.message, 'error'); }
}

// ── TOGGLE FIELD ──
const allFields = ['produto_nome','produto_nicho','produto_mecanismo','produto_publico',
  'resultado_minimo','resultado_medio','resultado_maximo','beneficios_secundarios','primeiro_resultado_em',
  'oferta_preco','oferta_acesso','oferta_garantia','objecoes'];

// Init: todos ativos por padrão
allFields.forEach(f => activeFields.add(f));

function toggleField(id) {
  const isOn = activeFields.has(id);
  if (isOn) { activeFields.delete(id); setToggleState(id, false); }
  else       { activeFields.add(id);   setToggleState(id, true);  }
  lsSave();
}

function setToggleState(id, on) {
  const toggle = document.getElementById('toggle-' + id);
  const wrap   = document.getElementById('wrap-' + id);
  const hint   = wrap ? wrap.querySelector('[style*="green"]') : null;
  if (!toggle) return;
  if (on) {
    toggle.classList.add('on');
    if (wrap)  { wrap.classList.remove('disabled'); wrap.classList.add('enabled'); }
    if (hint)  hint.textContent = 'IA usa este campo';
  } else {
    toggle.classList.remove('on');
    if (wrap)  { wrap.classList.add('disabled'); wrap.classList.remove('enabled'); }
    if (hint)  { hint.textContent = 'IA improvisa'; hint.style.color = 'var(--muted)'; }
  }
}

// ── OBJEÇÕES ──
function addObjecao(objecao = '', quebra = '') {
  objecoesCount++;
  const n   = objecoesCount;
  const el  = document.createElement('div');
  el.className = 'obj-item';
  el.id = 'obj-' + n;
  el.innerHTML = `
    <div class="form-group">
      <label style="font-size:10px">Objeção ${n}</label>
      <input type="text" id="obj-text-${n}" value="${esc(objecao)}" placeholder="Ex: Já tentei e não funcionou">
    </div>
    <div class="form-group">
      <label style="font-size:10px">Como o produto quebra</label>
      <input type="text" id="obj-quebra-${n}" value="${esc(quebra)}" placeholder="Ex: Não exige restrição, por isso não abandona">
    </div>
    <button class="btn-rm" onclick="document.getElementById('obj-${n}').remove()">✕</button>
  `;
  document.getElementById('obj-list').appendChild(el);
}

function getObjecoes() {
  const items = [];
  document.querySelectorAll('[id^="obj-text-"]').forEach(el => {
    const n = el.id.replace('obj-text-','');
    const o = el.value.trim();
    const q = document.getElementById('obj-quebra-' + n)?.value.trim() || '';
    if (o) items.push({ objecao: o, quebra: q });
  });
  return items;
}

// ── BLOCOS TIMELINE ──
function addBlocoTimeline(nome = '', tema = '') {
  blocosCount++;
  const n   = blocosCount;
  const el  = document.createElement('div');
  el.className = 'block-row';
  el.id = 'bloco-row-' + n;
  el.innerHTML = `
    <div class="form-group">
      <label style="font-size:10px">Nome do Bloco ${n}</label>
      <input type="text" id="bloco-nome-${n}" value="${esc(nome)}" placeholder="Ex: Resultados e Transformações">
    </div>
    <div class="form-group">
      <label style="font-size:10px">Tema</label>
      <textarea id="bloco-topico-${n}" style="min-height:44px" placeholder="Descreva o assunto...">${esc(tema)}</textarea>
    </div>
    <button class="btn-rm" onclick="document.getElementById('bloco-row-${n}').remove()">✕</button>
  `;
  document.getElementById('blocos-timeline').appendChild(el);
}

function getBlocosTimeline() {
  const items = [];
  document.querySelectorAll('[id^="bloco-nome-"]').forEach(el => {
    const n = el.id.replace('bloco-nome-','');
    const nome  = el.value.trim();
    const topico = document.getElementById('bloco-topico-' + n)?.value.trim() || '';
    if (nome || topico) items.push({ nome, topico });
  });
  return items;
}

// ── MODO ──
function setModo(modo) {
  currentModo = modo;
  setTimeout(lsSave, 100);
  document.getElementById('modo-bloco').classList.toggle('selected', modo === 'bloco');
  document.getElementById('modo-completa').classList.toggle('selected', modo === 'completa');
  document.getElementById('config-bloco').style.display    = modo === 'bloco'    ? 'block' : 'none';
  document.getElementById('config-completa').style.display = modo === 'completa' ? 'block' : 'none';
}

// ── RADIO ──
function selectRadio(el, group) {
  document.querySelectorAll(`[data-group="${group}"]`).forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  lsSave();
}
function selectRadioByVal(group, val) {
  const el = document.querySelector(`[data-group="${group}"][data-val="${val}"]`);
  if (el) selectRadio(el, group);
}
function getRadioVal(group) {
  const el = document.querySelector(`[data-group="${group}"].selected`);
  return el ? el.dataset.val : null;
}

// ── ARCH GRID ──
function renderArchGrid() {
  const grid = document.getElementById('arch-grid');
  if (!allArchetypes.length) { grid.innerHTML = '<span style="color:var(--muted);font-size:12px">Nenhum arquétipo cadastrado.</span>'; return; }

  // Default: todos selecionados se set vazio
  if (selectedArchetypes.size === 0) allArchetypes.forEach(a => selectedArchetypes.add(String(a.id)));

  grid.innerHTML = allArchetypes.map(a => `
    <div class="arch-chip ${selectedArchetypes.has(String(a.id)) ? 'selected' : ''}" onclick="toggleArch(${a.id})">
      <div class="arch-chip-name">${esc(a.name)}</div>
      <div class="arch-chip-desc">${esc((a.description||'').slice(0,40))}</div>
    </div>
  `).join('');
}

function renderArchSelects() {
  const opts = '<option value="">— Automático —</option>' + allArchetypes.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join('');
  document.getElementById('sel-cetico').innerHTML = opts;
  document.getElementById('sel-ancora').innerHTML = opts;
}

function toggleArch(id) {
  const sid = String(id);
  if (selectedArchetypes.has(sid)) selectedArchetypes.delete(sid);
  else selectedArchetypes.add(sid);
  renderArchGrid();
}

// ── STEPS ──
let currentStep = 1;
function goStep(n) {
  document.querySelectorAll('.panel').forEach((p, i) => p.classList.toggle('active', i+1 === n));
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.remove('active','done');
    if (i+1 === n) s.classList.add('active');
    else if (i+1 < n) s.classList.add('done');
  });
  currentStep = n;
  lsSave();
  if (n === 5 && document.getElementById('prompt-output').textContent === 'Aguardando geração...') gerarPrompt();
}

// ── GERAR PROMPT ──
function gerarPrompt() {
  const room = allRooms.find(r => r.id == document.getElementById('sel-room').value);
  const roomName = room ? room.name : '(Sala não selecionada)';

  // Arquétipos selecionados
  const archetypesUsados = allArchetypes.filter(a => selectedArchetypes.has(String(a.id)));
  const archetiposCeticoId = val('sel-cetico');
  const archetipoCetico = archetypesUsados.find(a => a.id == archetiposCeticoId);
  const archetipoCeticoNome = archetipoCetico ? archetipoCetico.name : 'o mais analítico disponível';
  const archetiposAncoraId = val('sel-ancora');
  const archetipoAncora = archetypesUsados.find(a => a.id == archetiposAncoraId);
  const archetipoAncoraId = archetipoAncora ? archetipoAncora.name : 'o mais técnico disponível';

  const ceticismo   = getRadioVal('ceticismo') || 'medio';
  const prova       = getRadioVal('prova')     || 'moderada';
  const objs        = getObjecoes();
  const modo        = currentModo;

  // Mapa de ceticismo → instrução
  const ceticismoInstr = {
    baixo:  'A maioria concorda e elogia. No máximo um arquétipo questiona brevemente antes de aceitar.',
    medio:  'Um ou dois arquétipos questionam com ceticismo moderado antes de ser convencidos pelos dados ou relatos dos outros.',
    alto:   'Há um debate real. O arquétipo cético resiste bastante, exige evidências e só aceita depois de argumentação consistente dos outros membros.'
  };

  const provaInstr = {
    sutil:    'Resultados aparecem naturalmente no meio de outras conversas, sem destaque excessivo.',
    moderada: 'Resultados são compartilhados com frequência, celebrados pelo grupo, com números e prazos específicos.',
    intensa:  'Múltiplos membros compartilham números, prazos e comparações em quase todas as mensagens. Alta concentração de prova social.'
  };

  // Constrói seções condicionais
  let secaoProduto = '';
  if (activeFields.has('produto_nome')      && val('produto_nome'))      secaoProduto += `  Nome do produto: ${val('produto_nome')}\n`;
  if (activeFields.has('produto_nicho')     && val('produto_nicho'))     secaoProduto += `  Nicho: ${val('produto_nicho')}\n`;
  if (activeFields.has('produto_mecanismo') && val('produto_mecanismo')) secaoProduto += `  Mecanismo único: ${val('produto_mecanismo')}\n`;
  if (activeFields.has('produto_publico')   && val('produto_publico'))   secaoProduto += `  Público-alvo: ${val('produto_publico')}\n`;
  if (!secaoProduto) secaoProduto = '  [IA deve inferir o produto com base no tema da conversa]\n';

  let secaoResultados = '';
  if (activeFields.has('resultado_minimo') && val('resultado_minimo')) secaoResultados += `  Mínimo: ${val('resultado_minimo')}\n`;
  if (activeFields.has('resultado_medio')  && val('resultado_medio'))  secaoResultados += `  Médio: ${val('resultado_medio')}\n`;
  if (activeFields.has('resultado_maximo') && val('resultado_maximo')) secaoResultados += `  Máximo relatado: ${val('resultado_maximo')}\n`;
  if (activeFields.has('beneficios_secundarios') && val('beneficios_secundarios')) secaoResultados += `  Benefícios secundários: ${val('beneficios_secundarios')}\n`;
  if (activeFields.has('primeiro_resultado_em')  && val('primeiro_resultado_em'))  secaoResultados += `  Primeiro resultado visível: ${val('primeiro_resultado_em')}\n`;
  if (!secaoResultados) secaoResultados = '  [IA deve criar resultados realistas e específicos para o nicho]\n';

  let secaoOferta = '';
  if (activeFields.has('oferta_preco')    && val('oferta_preco'))    secaoOferta += `  Preço: ${val('oferta_preco')}\n`;
  if (activeFields.has('oferta_acesso')   && val('oferta_acesso'))   secaoOferta += `  Tipo de acesso: ${val('oferta_acesso')}\n`;
  if (activeFields.has('oferta_garantia') && val('oferta_garantia')) secaoOferta += `  Garantia: ${val('oferta_garantia')}\n`;
  if (!secaoOferta) secaoOferta = '  [IA deve inferir preço e garantia compatíveis com o nicho]\n';

  let secaoObjecoes = '';
  if (activeFields.has('objecoes') && objs.length) {
    objs.forEach((o, i) => {
      secaoObjecoes += `  ${i+1}. OBJEÇÃO: "${o.objecao}"\n`;
      if (o.quebra) secaoObjecoes += `     QUEBRA: ${o.quebra}\n`;
    });
  } else {
    secaoObjecoes = '  [IA deve identificar e quebrar as objeções clássicas do nicho organicamente]\n';
  }

  let secaoArquetipos = '';
  archetypesUsados.forEach(a => {
    secaoArquetipos += `  - ${a.name}:\n`;
    secaoArquetipos += `      Estilo: ${a.speaking_style}\n`;
    if (a.vocabulary_examples) secaoArquetipos += `      Exemplos: ${a.vocabulary_examples}\n`;
    secaoArquetipos += `      Erros de digitação: ${a.typo_rate}% | Emojis: ${a.emoji_rate}%\n`;
    secaoArquetipos += `      Delay entre mensagens: ${a.response_delay_min}s a ${a.response_delay_max}s\n`;
  });
  if (!secaoArquetipos) secaoArquetipos = '  [Nenhum arquétipo selecionado — IA deve criar personagens variados]\n';

  // Tipos de mensagem
  const tiposMensagem = `
  - statement: afirmação/comentário geral
  - question: pergunta ao grupo
  - answer: resposta a uma mensagem anterior (inclua reply_to_sequence)
  - tip: dica ou conselho prático
  - reaction: reação emocional curta (uau, que isso!, mano..., etc.)
  - vacuum_question: pergunta que NINGUÉM vai responder — deixe em aberto`;

  // Bloco único ou timeline
  let secaoTarefa = '';
  if (modo === 'bloco') {
    const tema = val('bloco-tema') || '(tema não definido)';
    const qtd  = val('bloco-qtd') || '20';
    secaoTarefa = `MODO: Bloco Único
TEMA DO BLOCO: ${tema}
QUANTIDADE DE MENSAGENS: ${qtd}

Gere exatamente ${qtd} mensagens sobre o tema acima.`;
  } else {
    const blocos = getBlocosTimeline();
    const qtd    = val('completa-qtd') || '15';
    secaoTarefa = `MODO: Timeline Completa
QUANTIDADE DE MENSAGENS POR BLOCO: ${qtd}

BLOCOS (em ordem narrativa):
${blocos.map((b, i) => `  BLOCO ${i+1}: ${b.nome || 'Bloco ' + (i+1)}\n  TEMA: ${b.topico || '(não definido)'}`).join('\n\n')}

Gere ${qtd} mensagens para CADA bloco acima.`;
  }

  // PROMPT FINAL
  const prompt = `═══════════════════════════════════════════════════════
INSTRUÇÃO DO SISTEMA
═══════════════════════════════════════════════════════
Você é um especialista em comportamento humano e comunicação digital.
Sua tarefa é criar conversas de chat que simulem membros reais de uma
comunidade de produto conversando entre si — com naturalidade total.

REGRA ABSOLUTA: Esses personagens JÁ COMPRARAM e JÁ USAM o produto.
Ninguém pergunta "o que é isso" ou "como comprar". As conversas são
sobre experiências de uso, resultados, comparações, dúvidas de praticante.
O visitante da página ASSISTE a conversa — não participa.

═══════════════════════════════════════════════════════
DADOS DO PRODUTO
═══════════════════════════════════════════════════════
SALA / COMUNIDADE: ${roomName}

PRODUTO:
${secaoProduto}
RESULTADOS REAIS:
${secaoResultados}
OFERTA:
${secaoOferta}
OBJEÇÕES E QUEBRAS:
${secaoObjecoes}

═══════════════════════════════════════════════════════
ARQUÉTIPOS DISPONÍVEIS
═══════════════════════════════════════════════════════
${secaoArquetipos}
ARQUÉTIPO CÉTICO: ${archetipoCeticoNome}
→ Começa desconfiante, exige dados, só aceita com evidências.

ARQUÉTIPO ÂNCORA: ${archetipoAncoraId}
→ Conduz os momentos mais importantes, quebra objeções com autoridade.

═══════════════════════════════════════════════════════
CONFIGURAÇÃO NARRATIVA
═══════════════════════════════════════════════════════
NÍVEL DE CETICISMO: ${ceticismo.toUpperCase()}
→ ${ceticismoInstr[ceticismo]}

INTENSIDADE DE PROVA SOCIAL: ${prova.toUpperCase()}
→ ${provaInstr[prova]}

═══════════════════════════════════════════════════════
REGRAS DE HUMANIZAÇÃO (OBRIGATÓRIAS)
═══════════════════════════════════════════════════════
1. Respeite RIGIDAMENTE o estilo de fala de cada arquétipo
2. Aplique erros de digitação na taxa definida por arquétipo
3. Aplique emojis na taxa definida por arquétipo
4. Varie o tamanho das mensagens: algumas curtas (1 linha), outras longas (3-4 linhas)
5. Nem todos respondem a tudo — algumas perguntas ficam sem resposta (vacuum_question)
6. Pelo menos UM microconflito ou discordância leve na conversa
7. Delays variáveis entre mensagens conforme delay_min/max de cada arquétipo
8. Resultados citados devem ser específicos: número + prazo (nunca genéricos)
9. NUNCA use linguagem de marketing ou corporativa — é chat de grupo informal
10. A conversa deve fluir naturalmente, com referências ao que foi dito antes

═══════════════════════════════════════════════════════
TAREFA
═══════════════════════════════════════════════════════
${secaoTarefa}

TIPOS DE MENSAGEM DISPONÍVEIS:
${tiposMensagem}

═══════════════════════════════════════════════════════
FORMATO DE SAÍDA — RETORNE APENAS SQL VÁLIDO
═══════════════════════════════════════════════════════
Retorne EXCLUSIVAMENTE um bloco SQL de INSERT INTO timeline_messages,
sem explicações, sem markdown, sem comentários fora do SQL.

O SQL deve inserir diretamente na tabela timeline_messages do banco.
Use archetype_id correspondente ao arquétipo de cada mensagem.
O campo block_id deve ser preenchido com o ID correto do bloco.

ESTRUTURA DA TABELA:
  timeline_messages (
    block_id        INT,      -- ID do bloco desta mensagem
    archetype_id    INT,      -- ID do arquétipo que fala
    message_type    ENUM('statement','question','answer','tip','reaction','vacuum_question'),
    content         TEXT,     -- Texto da mensagem
    reply_to_id     INT NULL, -- ID da timeline_message que esta responde (ou NULL)
    sequence_order  INT,      -- Ordem sequencial dentro do bloco (1, 2, 3...)
    delay_after_prev INT      -- Segundos de delay após a mensagem anterior
  )

EXEMPLO DE SAÍDA ESPERADA:
INSERT INTO timeline_messages (block_id, archetype_id, message_type, content, reply_to_id, sequence_order, delay_after_prev) VALUES
(2, 1, 'statement', 'Meninas, completei 30 dias hoje!! Menos 7kg 🎉', NULL, 1, 5),
(2, 3, 'reaction', 'CARAAAAI 7kg em 30 dias?? Tô começando hoje mesmo mano', NULL, 2, 8),
(2, 4, 'statement', 'Parabéns! 7kg em 30 dias é possível e saudável com retenção hídrica inicial envolvida.', NULL, 3, 25);

ATENÇÃO:
- Escape aspas simples no conteúdo com \\'
- sequence_order começa em 1 para cada bloco
- reply_to_id referencia o sequence_order (não o id) — use NULL se não for resposta direta
- Gere mensagens variadas, humanas, fiéis aos arquétipos
═══════════════════════════════════════════════════════`;

  document.getElementById('prompt-output').textContent = prompt;
  goStep(5);
}

// ── COPY ──
function copyPrompt() {
  const text = document.getElementById('prompt-output').textContent;
  navigator.clipboard.writeText(text).then(() => toast('Prompt copiado!')).catch(() => fallbackCopy(text));
}
function copySql() {
  const text = document.getElementById('sql-input').value;
  if (!text.trim()) return toast('Cole o SQL primeiro', 'error');
  navigator.clipboard.writeText(text).then(() => toast('SQL copiado!')).catch(() => fallbackCopy(text));
}
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select(); document.execCommand('copy');
  document.body.removeChild(ta); toast('Copiado!');
}

// ── UTILS ──
function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function esc(s)  { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function tryParse(str, def) { try { return JSON.parse(str); } catch(e) { return def; } }

function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show' + (type === 'error' ? ' error' : '');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = '', type === 'error' ? 5000 : 3000);
}
</script>
</body>
</html>
