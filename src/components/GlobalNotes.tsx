import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardList, CheckSquare, Square, Trash2, 
  Copy, Check, GripVertical, 
  Target, Crosshair, X, Maximize2, Upload,
  Eye, ArrowRight, PlusCircle, 
  Smartphone, Monitor, Tablet, Plus, Layers
} from 'lucide-react';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface NoteItem {
  id: string;
  text: string;
  context: string;
  timestamp: number;
  isCompleted: boolean;
  deviceType: DeviceType; 
  domSelector?: string; 
  elementPreview?: string;
  destinationSelector?: string; 
  destinationPreview?: string;
}

interface GlobalNotesProps {
  forcedContext?: string; 
  storageKey?: string;    
  onHide?: () => void;    
}

// ── FIX 2: chaves renomeadas ──────────────────────────────────────────────────
const TRIGGER_POS_KEY = 'gn_trigger_pos';
const PANEL_POS_KEY   = 'gn_panel_pos';
const STORAGE_KEY_BASE = 'gn_anotations';

const PANEL_WIDTH  = 380;
const PANEL_HEIGHT = 520;

// ── threshold de drag — mínimo 6px antes de considerar drag ──────────────────
const DRAG_THRESHOLD = 6;

const getCurrentDevice = (): DeviceType => {
  const width = window.innerWidth;
  if (width < 768)  return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const getFriendlySelector = (el: HTMLElement): { selector: string; preview: string } => {
  let path: string[] = [];
  let current: HTMLElement | null = el;
  while (current && current !== document.body && current !== document.documentElement) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${CSS.escape(current.id)}`;
      path.unshift(selector);
      break;
    } else {
      const cn = current.className;
      if (typeof cn === 'string' && cn.trim()) {
        const fc = cn.trim().split(/\s+/)[0];
        if (fc) selector += `.${CSS.escape(fc)}`;
      }
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children);
        if (siblings.length > 1) selector += `:nth-child(${siblings.indexOf(current) + 1})`;
      }
      path.unshift(selector);
    }
    current = current.parentElement;
  }
  const fullSelector = path.join(' > ');
  let cnPart = '';
  if (typeof el.className === 'string' && el.className.trim()) {
    cnPart = '.' + el.className.trim().split(/\s+/)[0];
  }
  const preview = `${el.tagName.toLowerCase()}${cnPart.length > 15 ? cnPart.substring(0, 15) + '...' : cnPart}`;
  return { selector: fullSelector, preview };
};

// ── Constrói árvore de camadas de um elemento ────────────────────────────────
interface LayerNode {
  el: HTMLElement;
  selector: string;
  preview: string;
  tag: string;
  classes: string;
  rect: DOMRect;
  depth: number;
}

const buildLayerTree = (clicked: HTMLElement): LayerNode[] => {
  const layers: LayerNode[] = [];
  let current: HTMLElement | null = clicked;
  let depth = 0;
  while (current && current !== document.body && depth < 8) {
    if (!current.closest('.layout-notes-ui')) {
      const { selector, preview } = getFriendlySelector(current);
      layers.push({
        el: current,
        selector,
        preview,
        tag: current.tagName.toLowerCase(),
        classes: typeof current.className === 'string' ? current.className.trim().split(/\s+/).slice(0, 3).join(' ') : '',
        rect: current.getBoundingClientRect(),
        depth,
      });
    }
    current = current.parentElement;
    depth++;
  }
  return layers;
};

// Renderiza clone real do elemento no modal
const LayerPreview: React.FC<{ layer: LayerNode }> = ({ layer }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    const clone = layer.el.cloneNode(true) as HTMLElement;
    clone.style.position = 'relative';
    clone.style.left     = '';
    clone.style.top      = '';
    clone.style.right    = '';
    clone.style.bottom   = '';
    clone.style.zIndex   = '';
    clone.style.margin   = '0';
    clone.style.pointerEvents = 'none';
    ref.current.appendChild(clone);
  }, [layer]);
  return (
    <div className="mx-4 mt-4 mb-2 rounded-xl border-2 border-[#D4AF37]/40 bg-black/40 flex items-center justify-center overflow-hidden" style={{ minHeight: 80, padding: 16 }}>
      <div ref={ref} className="flex items-center justify-center" />
    </div>
  );
};

export const GlobalNotes: React.FC<GlobalNotesProps> = ({ forcedContext, storageKey }) => {
  const { isGlobalNotesEnabled } = useData();
  const [isOpen, setIsOpen]       = useState(false);
  const [copied, setCopied]       = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectMode, setInspectMode]   = useState<'source' | 'destination'>('source');
  const [inspectCoords, setInspectCoords] = useState({ x: 0, y: 0 });
  const [inspectData, setInspectData]     = useState<{ tag: string; classes: string; w: number; h: number } | null>(null);
  const [isImporting, setIsImporting]     = useState(false);
  const [importText, setImportText]       = useState('');

  // ── FIX 5: modal de camadas ──────────────────────────────────────────────
  const [layerModal, setLayerModal] = useState<{
    open: boolean;
    layers: LayerNode[];
    selected: number;
    mode: 'source' | 'destination';
  }>({ open: false, layers: [], selected: 0, mode: 'source' });

  const [focusMode, setFocusMode] = useState<{
    active: boolean;
    id: string | null;
    text: string;
    selector?: string;
    preview?: string;
    destSelector?: string;
    destPreview?: string;
    device?: DeviceType;
  }>({ active: false, id: null, text: '' });

  const [triggerPos, setTriggerPos] = useState(() => {
    const saved = localStorage.getItem(TRIGGER_POS_KEY);
    return saved ? JSON.parse(saved) : { x: 16, y: 100 };
  });

  const [panelPos, setPanelPos] = useState(() => {
    const saved = localStorage.getItem(PANEL_POS_KEY);
    if (saved) return JSON.parse(saved);
    const x = typeof window !== 'undefined' ? window.innerWidth / 2 - PANEL_WIDTH / 2 : 20;
    const y = typeof window !== 'undefined' ? window.innerHeight / 2 - PANEL_HEIGHT / 2 : 100;
    return { x, y };
  });

  const [isDraggingTrigger, setIsDraggingTrigger] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel]     = useState(false);
  const [isDragEnabled, setIsDragEnabled]         = useState(false);
  const dragOffset    = useRef({ x: 0, y: 0 });
  const dragStartPos  = useRef({ x: 0, y: 0 });  // FIX 1: threshold
  const didDrag       = useRef(false);
  const focusInputRef = useRef<HTMLTextAreaElement>(null);

  const currentContext     = forcedContext || 'Global';
  const effectiveStorageKey = storageKey || `${STORAGE_KEY_BASE}_${currentContext}`;

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(effectiveStorageKey);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: '1',  text: 'Configurações Globais:\nAlterar logo, cores do sistema e textos legais (Termos de Uso) diretamente pelo painel, sem mexer no código.', context: 'Global', timestamp: Date.now(), isCompleted: true,  deviceType: 'desktop' },
      { id: '3',  text: 'Painel Membro: Persistência de Anotações\nAs notas digitadas no player atualmente somem ao recarregar a página (precisam ser salvas no banco de dados).', context: 'Global', timestamp: Date.now(), isCompleted: false, deviceType: 'desktop' },
      { id: '4',  text: 'Painel Membro: Downloads Reais na Aba Bônus\nOs botões de "Baixar PDF" e "MP3" são visuais. É necessário conectar a arquivos reais hospedados (AWS S3, Google Drive, etc).', context: 'Global', timestamp: Date.now(), isCompleted: false, deviceType: 'desktop' },
      { id: '5',  text: 'Painel Membro: Player de Vídeo Real\nSubstituir o ícone de "Play" por uma integração real (YouTube, Vimeo, PandaVideo ou Bunny.net).', context: 'Global', timestamp: Date.now(), isCompleted: false, deviceType: 'desktop' },
      { id: '6',  text: 'Painel Membro: Perfil do Usuário\nTela para o aluno alterar senha, foto de perfil e dados cadastrais.', context: 'Global', timestamp: Date.now(), isCompleted: false, deviceType: 'desktop' },
      { id: '7',  text: 'Painel Membro: Certificado de Conclusão\nGeração automática de certificado em PDF quando a barra de progresso atingir 100%.', context: 'Global', timestamp: Date.now(), isCompleted: false, deviceType: 'desktop' },
      { id: '8',  text: 'Painel Membro: Chat de Suporte Integrado\nConectar os botões de suporte a uma API real de WhatsApp ou sistema de tickets (Zendesk/Intercom).', context: 'Global', timestamp: Date.now(), isCompleted: false, deviceType: 'desktop' },
      { id: '9',  text: 'Painel Revenda: Solicitação de Saque\nImplementar o fluxo onde o revendedor clica em "Sacar", insere o valor e o admin recebe o pedido.', context: 'Global', timestamp: Date.now(), isCompleted: false, deviceType: 'desktop' },
      { id: '10', text: 'Painel Revenda: Dados Bancários/Pix\nFormulário para o revendedor cadastrar sua chave Pix para recebimento.', context: 'Global', timestamp: Date.now(), isCompleted: false, deviceType: 'desktop' },
      { id: '11', text: 'Painel Revenda: Extrato Detalhado (Statement)\nUma tabela mostrando linha a linha: "Venda X (+R$ 50,00)", "Saque Y (-R$ 100,00)". Atualmente só mostra o saldo total.', context: 'Global', timestamp: Date.now(), isCompleted: false, deviceType: 'desktop' },
      { id: '12', text: 'Painel Revenda: Materiais de Marketing (Media Kit)\nUma seção com banners, vídeos e textos (copys) prontos para o revendedor baixar e usar nas redes sociais.', context: 'Global', timestamp: Date.now(), isCompleted: false, deviceType: 'desktop' },
      { id: '13', text: 'Painel Revenda: Gráficos de Conversão\nMostrar quantos cliques o link teve versus quantas vendas foram realizadas (Taxa de Conversão).', context: 'Global', timestamp: Date.now(), isCompleted: false, deviceType: 'desktop' },
      { id: '14', text: 'Admin: Editor de Produtos (CRUD Completo)\nA aba "Produtos" hoje apenas lista os itens. Falta a tela para Adicionar Novo Produto, Criar Módulos, Subir Aulas e Definir Preços.', context: 'Global', timestamp: Date.now(), isCompleted: true,  deviceType: 'desktop' },
      { id: '15', text: 'Admin: Configuração de Checkout & Integrações\nCampos para inserir chaves de API (Stripe, Mercado Pago), Pixels de Rastreamento e Order Bumps.', context: 'Global', timestamp: Date.now(), isCompleted: true,  deviceType: 'desktop' },
      { id: '16', text: 'Admin: Editor Fino do Social Proof\nHoje criamos a "Timeline" e o "Bot". Falta a interface para escrever as mensagens específicas de cada bloco.', context: 'Global', timestamp: Date.now(), isCompleted: true,  deviceType: 'desktop' },
      { id: '17', text: 'Admin: Gestão de Usuários\nPoder banir usuários, reenviar senhas ou mudar permissões manualmente.', context: 'Global', timestamp: Date.now(), isCompleted: true,  deviceType: 'desktop' },
      { id: '18', text: 'Admin: Gestão de Saques\nUma tela para ver quem pediu saque e marcar como "Pago" após realizar o Pix.', context: 'Global', timestamp: Date.now(), isCompleted: true,  deviceType: 'desktop' },
      { id: '19', text: 'Admin: Configurações Globais\nAlterar logo, cores do sistema e textos legais (Termos de Uso) diretamente pelo painel, sem mexer no código.', context: 'Global', timestamp: Date.now(), isCompleted: true,  deviceType: 'desktop' },
    ];
  });

  useEffect(() => {
    localStorage.setItem(effectiveStorageKey, JSON.stringify(notes));
  }, [notes, effectiveStorageKey]);

  // ── FIX 1: drag com threshold ────────────────────────────────────────────
  useEffect(() => {
    if (!isDraggingTrigger && !isDraggingPanel) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = Math.abs(clientX - dragStartPos.current.x);
      const dy = Math.abs(clientY - dragStartPos.current.y);
      if (!didDrag.current && dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
      didDrag.current = true;
      if (isDraggingTrigger) setTriggerPos({ x: clientX - dragOffset.current.x, y: clientY - dragOffset.current.y });
      else if (isDraggingPanel) setPanelPos({ x: clientX - dragOffset.current.x, y: clientY - dragOffset.current.y });
    };
    const handleEnd = () => {
      if (isDraggingTrigger) localStorage.setItem(TRIGGER_POS_KEY, JSON.stringify(triggerPos));
      if (isDraggingPanel)   localStorage.setItem(PANEL_POS_KEY,   JSON.stringify(panelPos));
      setIsDraggingTrigger(false);
      setIsDraggingPanel(false);
      didDrag.current = false;
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingTrigger, isDraggingPanel, triggerPos, panelPos]);

  const startDraggingTrigger = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX, y: clientY };
    dragOffset.current   = { x: clientX - triggerPos.x, y: clientY - triggerPos.y };
    didDrag.current = false;
    setIsDraggingTrigger(true);
  };

  const startDraggingPanel = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, label')) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX, y: clientY };
    dragOffset.current   = { x: clientX - panelPos.x, y: clientY - panelPos.y };
    didDrag.current = false;
    setIsDraggingPanel(true);
  };

  // ── FIX 5: ao clicar no inspect, abre modal de camadas ───────────────────
  useEffect(() => {
    if (!isInspecting) return;
    const handleMouseOver = (e: MouseEvent) => {
      let target = e.target as HTMLElement;
      if (target.closest('.layout-notes-ui')) return;
      const container = target.closest('button, a, input, select, textarea, [role="button"]');
      if (container) target = container as HTMLElement;
      const color = inspectMode === 'source' ? '#D4AF37' : '#10b981';
      target.style.outline      = `3px solid ${color}`;
      target.style.outlineOffset = '4px';
      const rect = target.getBoundingClientRect();
      setInspectData({ tag: target.tagName.toLowerCase(), classes: target.className.toString().split(' ')[0] || '', w: Math.round(rect.width), h: Math.round(rect.height) });
    };
    const handleMouseOut = (e: MouseEvent) => {
      let target = e.target as HTMLElement;
      const container = target.closest('button, a, input, select, textarea');
      if (container) target = container as HTMLElement;
      target.style.outline      = '';
      target.style.outlineOffset = '';
    };
    const handleMouseMove = (e: MouseEvent) => setInspectCoords({ x: e.clientX, y: e.clientY });
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (target.closest('.layout-notes-ui')) return;
      // limpar outline
      (target as HTMLElement).style.outline = '';
      const layers = buildLayerTree(target);
      setLayerModal({ open: true, layers, selected: 0, mode: inspectMode });
      setIsInspecting(false);
    };
    document.addEventListener('mouseover',  handleMouseOver);
    document.addEventListener('mouseout',   handleMouseOut);
    document.addEventListener('mousemove',  handleMouseMove);
    document.addEventListener('click',      handleClick, { capture: true });
    return () => {
      document.removeEventListener('mouseover',  handleMouseOver);
      document.removeEventListener('mouseout',   handleMouseOut);
      document.removeEventListener('mousemove',  handleMouseMove);
      document.removeEventListener('click',      handleClick, { capture: true });
    };
  }, [isInspecting, inspectMode]);

  const confirmLayerSelection = () => {
    const layer = layerModal.layers[layerModal.selected];
    if (!layer) return;
    const device = getCurrentDevice();
    if (layerModal.mode === 'source') {
      setFocusMode(prev => ({ ...prev, selector: layer.selector, preview: layer.preview, device }));
    } else {
      setFocusMode(prev => ({ ...prev, destSelector: layer.selector, destPreview: layer.preview, device }));
    }
    setLayerModal(p => ({ ...p, open: false }));
    setIsOpen(true);
  };

  const saveFocusNote = () => {
    const text   = focusMode.text.trim();
    const device = focusMode.device || getCurrentDevice();
    if (!text && !focusMode.id) { setFocusMode({ active: false, id: null, text: '' }); return; }
    if (focusMode.id) {
      setNotes(prev => prev.map(n => n.id === focusMode.id ? { ...n, text, deviceType: device, domSelector: focusMode.selector, elementPreview: focusMode.preview, destinationSelector: focusMode.destSelector, destinationPreview: focusMode.destPreview } : n));
    } else {
      setNotes(prev => [{ id: Date.now().toString(), text, context: currentContext, deviceType: device, timestamp: Date.now(), isCompleted: false, domSelector: focusMode.selector, elementPreview: focusMode.preview, destinationSelector: focusMode.destSelector, destinationPreview: focusMode.destPreview }, ...prev]);
    }
    setFocusMode({ active: false, id: null, text: '' });
  };

  const handleCopyNotes = async () => {
    let report = `** RELATÓRIO DE EDIÇÃO TÉCNICA - CONTEXTO: ${currentContext} **\n\n`;
    notes.forEach((note, index) => {
      const status = note.isCompleted ? 'x' : ' ';
      report += `- [${status}] ${note.text}\n`;
      if (note.domSelector)       report += `TARGET: ${note.domSelector}\n`;
      if (note.destinationSelector) report += `DESTINATION: ${note.destinationSelector}\n`;
      report += `DEVICE: ${note.deviceType.toUpperCase()}\n`;
      if (index < notes.length - 1) report += `\n---\n\n`;
    });
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportNotes = () => {
    if (!importText.trim()) return;
    try {
      const importedContext = 'Global';
      const regex = /-\s*\[([ xX])\]\s*(.*?)(?=\n-\s*\[|$)/gs;
      const newNotes: NoteItem[] = [];
      let match;
      while ((match = regex.exec(importText)) !== null) {
        const isCompleted = match[1].toLowerCase() === 'x';
        const fullText    = match[2].trim();
        if (fullText) newNotes.push({ id: `${Date.now()}-${newNotes.length}`, text: fullText, isCompleted, context: importedContext, deviceType: getCurrentDevice(), timestamp: Date.now() });
      }
      if (newNotes.length > 0) { setNotes(prev => [...newNotes, ...prev]); setIsImporting(false); setImportText(''); }
      else toast.error('Não foi possível identificar o formato. Use "- [ ] Título" seguido da descrição.');
    } catch (e) { toast.error('Erro ao processar o relatório.'); }
  };

  const startEditingNote = (note: NoteItem) => {
    setFocusMode({ active: true, id: note.id, text: note.text, device: note.deviceType, selector: note.domSelector, preview: note.elementPreview, destSelector: note.destinationSelector, destPreview: note.destinationPreview });
    setIsOpen(true);
  };

  // ── FIX 4: highlight sem pointer-events:none ─────────────────────────────
  const jumpToElement = (selector: string, type: 'source' | 'destination') => {
    try {
      const el = document.querySelector(selector) as HTMLElement;
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          const cls = type === 'source' ? 'animate-target-flash-red' : 'animate-target-flash-green';
          el.classList.remove('animate-target-flash-red', 'animate-target-flash-green');
          void el.offsetWidth;
          el.classList.add(cls);
          setTimeout(() => el.classList.remove(cls), 4000);
        }, 300);
        return true;
      } else {
        const clean = selector.length > 50 ? selector.substring(0, 50) + '...' : selector;
        toast.error(`⚠ Elemento não encontrado na tela atual.\nSeletor: ${clean}\n\nVerifique se está na página correta ou se o elemento é visível.`);
      }
    } catch (e) { console.error('Erro ao buscar elemento:', e); }
    return false;
  };

  // ── FIX 3: mensagem de dispositivo mais clara ────────────────────────────
  const navigateToTarget = async (note: NoteItem) => {
    const currentDevice = getCurrentDevice();
    if (note.deviceType !== currentDevice) {
      const deviceName = { mobile: 'celular', tablet: 'tablet', desktop: 'computador' };
      if (!confirm(
        `Esta anotação foi criada no ${deviceName[note.deviceType] || note.deviceType.toUpperCase()}, ` +
        `mas você está no ${deviceName[currentDevice] || currentDevice.toUpperCase()}.\n\n` +
        `O elemento pode estar em posição diferente ou não estar visível neste dispositivo.\n\n` +
        `Deseja tentar localizar mesmo assim?`
      )) return;
    }
    setIsOpen(false);
    if (note.domSelector) {
      jumpToElement(note.domSelector, 'source');
      if (note.destinationSelector) await new Promise(r => setTimeout(r, 2000));
    }
    if (note.destinationSelector) jumpToElement(note.destinationSelector, 'destination');
  };

  const DeviceIcon = ({ type, size = 10 }: { type: DeviceType; size?: number }) => {
    if (type === 'mobile') return <Smartphone size={size} />;
    if (type === 'tablet') return <Tablet size={size} />;
    return <Monitor size={size} />;
  };

  if (!isGlobalNotesEnabled) return null;

  return (
    <>
      <style>{`
        @keyframes flash-red {
          0%, 100% { outline: 5px solid #D4AF37; outline-offset: 4px; box-shadow: 0 0 20px rgba(212,175,55,0.6); }
          50%       { outline: 2px solid transparent; outline-offset: 10px; box-shadow: none; }
        }
        @keyframes flash-green {
          0%, 100% { outline: 5px solid #10b981; outline-offset: 4px; box-shadow: 0 0 20px rgba(16,185,129,0.6); }
          50%       { outline: 2px solid transparent; outline-offset: 10px; box-shadow: none; }
        }
        .animate-target-flash-red   { animation: flash-red   0.6s ease-in-out 5; position: relative; z-index: 10000; }
        .animate-target-flash-green { animation: flash-green 0.6s ease-in-out 5; position: relative; z-index: 10000; }
      `}</style>

      {/* cursor flutuante durante inspeção */}
      {isInspecting && (
        <div className="fixed z-[100000] pointer-events-none flex flex-col items-center layout-notes-ui" style={{ left: inspectCoords.x, top: inspectCoords.y - 80, transform: 'translateX(-50%)' }}>
          <div className={`bg-gray-950/90 backdrop-blur-xl border-2 rounded-2xl p-4 shadow-2xl min-w-[180px] ${inspectMode === 'source' ? 'border-[#D4AF37]' : 'border-green-500'}`}>
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <Maximize2 className={`w-3 h-3 ${inspectMode === 'source' ? 'text-[#D4AF37]' : 'text-green-500'}`} />
                <span className="text-white font-black text-xs uppercase tracking-tighter">{inspectData?.tag || '---'}</span>
              </div>
              <span className="text-[9px] font-mono text-gray-500">{inspectData?.w} x {inspectData?.h}px</span>
            </div>
            <div className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[9px] font-mono text-gray-300 flex items-center gap-2">
              <DeviceIcon type={getCurrentDevice()} />
              {inspectMode === 'source' ? 'MARCANDO ORIGEM' : 'MARCANDO DESTINO'}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Crosshair className={`w-4 h-4 ${inspectMode === 'source' ? 'text-[#D4AF37]' : 'text-green-500'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest animate-pulse ${inspectMode === 'source' ? 'text-[#D4AF37]' : 'text-green-500'}`}>Clique para selecionar</span>
            </div>
          </div>
          <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] mt-1 ${inspectMode === 'source' ? 'border-t-[#D4AF37]' : 'border-t-green-500'}`} />
        </div>
      )}

      {/* ── Modal de camadas com preview visual via iframe ─────────────────── */}
      {layerModal.open && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center layout-notes-ui">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setLayerModal(p => ({ ...p, open: false })); setIsOpen(true); }} />
          <div className="relative z-10 bg-gray-900 border-2 border-[#D4AF37] rounded-2xl shadow-2xl w-[95vw] max-w-md flex flex-col overflow-hidden max-h-[85vh]">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#D4AF37]" />
                <h3 className="text-white font-black text-sm uppercase tracking-tight">Qual elemento?</h3>
              </div>
              <button onClick={() => { setLayerModal(p => ({ ...p, open: false })); setIsOpen(true); }} className="text-gray-400 hover:text-white p-1"><X size={16} /></button>
            </div>
            <p className="text-gray-500 text-xs px-5 py-3 border-b border-gray-800">
              Selecione o componente que deseja referenciar. O preview mostra cada nível real.
            </p>

            {/* Preview: clone real do elemento */}
            {layerModal.layers[layerModal.selected] && (
              <LayerPreview layer={layerModal.layers[layerModal.selected]} />
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {layerModal.layers.map((layer, i) => {
                const isSelected = layerModal.selected === i;
                const rect = layer.rect;
                return (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'}`}
                    onMouseEnter={() => {
                      layer.el.style.outline = '3px solid #D4AF37';
                      layer.el.style.outlineOffset = '2px';
                    }}
                    onMouseLeave={() => {
                      if (layerModal.selected !== i) {
                        layer.el.style.outline = '';
                        layer.el.style.outlineOffset = '';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="layer"
                      checked={isSelected}
                      onChange={() => {
                        // Limpar outline anterior
                        layerModal.layers.forEach((l, j) => {
                          if (j !== i) { l.el.style.outline = ''; l.el.style.outlineOffset = ''; }
                        });
                        layer.el.style.outline = '3px solid #D4AF37';
                        layer.el.style.outlineOffset = '2px';
                        setLayerModal(p => ({ ...p, selected: i }));
                      }}
                      className="accent-[#D4AF37] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono font-bold text-xs ${isSelected ? 'text-[#D4AF37]' : 'text-gray-300'}`}>{layer.tag}</span>
                        {i === 0 && <span className="text-[9px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded font-bold">clicado</span>}
                        <span className="text-gray-600 text-[9px]">{Math.round(rect.width)}×{Math.round(rect.height)}px</span>
                      </div>
                      {layer.classes && <p className="text-gray-500 text-[10px] font-mono truncate mt-0.5">{layer.classes}</p>}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-800 flex gap-3">
              <button
                onClick={() => {
                  layerModal.layers.forEach(l => { l.el.style.outline = ''; l.el.style.outlineOffset = ''; });
                  setLayerModal(p => ({ ...p, open: false }));
                  setIsOpen(true);
                }}
                className="flex-1 py-2.5 bg-gray-800 text-white font-bold rounded-xl text-xs uppercase"
              >Cancelar</button>
              <button
                onClick={() => {
                  layerModal.layers.forEach(l => { l.el.style.outline = ''; l.el.style.outlineOffset = ''; });
                  confirmLayerSelection();
                }}
                className="flex-1 py-2.5 bg-[#D4AF37] text-black font-black rounded-xl text-xs uppercase shadow-lg"
              >Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* editor de nota */}
      {isOpen && focusMode.active && (
        <div className="fixed inset-0 z-[10000] flex flex-col justify-end layout-notes-ui">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFocusMode(p => ({ ...p, active: false }))} />
          <div className="relative z-10 bg-gray-900 border-t-2 border-[#D4AF37] p-6 shadow-2xl">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-white font-black uppercase tracking-tighter text-sm flex items-center gap-2">
                    <Crosshair className="text-[#D4AF37] w-4 h-4" />
                    {focusMode.id ? 'Editar Registro' : 'Novo Registro'}
                  </h3>
                  <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                    {(['mobile', 'tablet', 'desktop'] as DeviceType[]).map(d => {
                      const isSelected = (focusMode.device || getCurrentDevice()) === d;
                      return (
                        <button key={d} onClick={() => setFocusMode(p => ({ ...p, device: d }))} className={`p-1.5 rounded-lg transition-all ${isSelected ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`} title={d.toUpperCase()}>
                          <DeviceIcon type={d} size={14} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {focusMode.selector && (
                    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1 rounded-lg flex items-center gap-2">
                      <span className="text-[10px] text-[#E5C158] font-mono font-bold truncate max-w-[120px]">S: {focusMode.preview}</span>
                      <button onClick={() => setFocusMode(p => ({ ...p, selector: undefined, preview: undefined }))} className="text-red-400 hover:text-red-300"><X size={12} /></button>
                    </div>
                  )}
                  {focusMode.destSelector && (
                    <div className="bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-lg flex items-center gap-2">
                      <span className="text-[10px] text-green-400 font-mono font-bold truncate max-w-[120px]">D: {focusMode.destPreview}</span>
                      <button onClick={() => setFocusMode(p => ({ ...p, destSelector: undefined, destPreview: undefined }))} className="text-red-400 hover:text-red-300"><X size={12} /></button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <textarea ref={focusInputRef} value={focusMode.text} onChange={e => setFocusMode(p => ({ ...p, text: e.target.value }))} placeholder="O que deve ser alterado?" className="flex-1 w-full bg-gray-950 rounded-xl p-4 text-white font-bold text-lg border border-gray-800 focus:border-[#D4AF37] outline-none resize-none h-20" />
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => { setIsInspecting(true); setInspectMode('source');      setIsOpen(false); }} className="flex-1 md:flex-none h-12 px-4 bg-gray-800 hover:bg-gray-700 text-[#E5C158] rounded-xl flex items-center justify-center gap-2 border border-[#D4AF37]/30 transition-all"><Target size={18} /><span className="text-[10px] font-black uppercase">Origem</span></button>
                  <button onClick={() => { setIsInspecting(true); setInspectMode('destination'); setIsOpen(false); }} className="flex-1 md:flex-none h-12 px-4 bg-gray-800 hover:bg-gray-700 text-green-400 rounded-xl flex items-center justify-center gap-2 border border-green-500/30 transition-all"><PlusCircle size={18} /><span className="text-[10px] font-black uppercase">Destino</span></button>
                  <button onClick={saveFocusNote} className="h-12 px-6 bg-[#B5952F] hover:bg-[#D4AF37] text-white rounded-xl shadow-lg transition-transform active:scale-95"><Check size={24} strokeWidth={3} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* botão flutuante trigger */}
      <div className={`fixed z-[9999] layout-notes-ui transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ left: triggerPos.x, top: triggerPos.y }}>
        <div className="relative group flex flex-col items-center gap-2">
          <div onMouseDown={startDraggingTrigger} onTouchStart={startDraggingTrigger} className="w-8 h-4 bg-[#D4AF37]/20 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical size={12} className="text-[#D4AF37] rotate-90" />
          </div>
          <div onClick={() => !didDrag.current && setIsOpen(true)} className="w-12 h-12 bg-gray-900 text-[#D4AF37] border-2 border-[#D4AF37] rounded-xl flex items-center justify-center shadow-2xl transition-all cursor-pointer">
            <ClipboardList size={24} strokeWidth={2.5} />
            {notes.filter(n => !n.isCompleted).length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                {notes.filter(n => !n.isCompleted).length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* painel de notas */}
      {isOpen && !focusMode.active && (
        <div className="layout-notes-ui">
          <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
          <div onMouseDown={isDragEnabled ? startDraggingPanel : undefined} onTouchStart={isDragEnabled ? startDraggingPanel : undefined} className="fixed z-[9999] w-[95vw] md:w-[380px] bg-gray-900 rounded-2xl shadow-2xl border-2 border-[#D4AF37] flex flex-col overflow-hidden h-[520px]" style={{ left: panelPos.x, top: panelPos.y }}>
            <div className="px-6 py-4 flex items-center justify-between bg-gray-800 border-b border-[#D4AF37]/30 cursor-move">
              <div className="flex items-center gap-2"><ClipboardList className="text-[#D4AF37]" size={18} /><h2 className="text-white font-black uppercase tracking-tighter text-xs">Ajustes Técnicos</h2></div>
              <div className="flex gap-2">
                <button onClick={() => setIsImporting(!isImporting)} className={`p-2 rounded-lg transition-all ${isImporting ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'}`} title="Importar"><Upload size={18} /></button>
                <button onClick={handleCopyNotes} className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'hover:bg-gray-700 text-gray-400'}`} title="Copiar">{copied ? <Check size={18} /> : <Copy size={18} />}</button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-red-500"><X size={18} /></button>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden flex flex-col">
              {isImporting ? (
                <div className="flex-1 p-6 flex flex-col bg-gray-950">
                  <h3 className="text-blue-400 font-black text-xs uppercase mb-4 flex items-center gap-2"><Upload size={14} /> Importar Backup</h3>
                  <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Cole o relatório aqui..." className="flex-1 w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-xs font-mono text-gray-300 focus:border-blue-500 outline-none resize-none mb-4" />
                  <div className="flex gap-3">
                    <button onClick={() => setIsImporting(false)} className="flex-1 py-3 bg-gray-800 text-white font-bold rounded-xl text-[10px] uppercase">Cancelar</button>
                    <button onClick={handleImportNotes} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl text-[10px] uppercase shadow-lg">Processar</button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {notes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 uppercase font-black text-xs">Nenhum registro.</div>
                  ) : notes.map(note => (
                    <div key={note.id} className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${note.isCompleted ? 'bg-gray-950 border-gray-800 opacity-40' : 'bg-gray-800/50 border-gray-700 hover:border-[#D4AF37]/50'}`}>
                      <div className="flex items-start gap-3">
                        <button onClick={e => { e.stopPropagation(); setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isCompleted: !n.isCompleted } : n)); }} className={`mt-1 ${note.isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                          {note.isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                        <div className="flex-1 min-w-0" onClick={() => startEditingNote(note)}>
                          <p className={`text-xs font-bold text-white leading-snug mb-2 whitespace-pre-wrap ${note.isCompleted ? 'line-through opacity-50' : ''}`}>{note.text}</p>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-1 text-[8px] font-mono text-gray-400 bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
                              <DeviceIcon type={note.deviceType} size={8} /> {note.deviceType.toUpperCase()}
                            </div>
                            {note.domSelector && (
                              <button onClick={e => { e.stopPropagation(); jumpToElement(note.domSelector!, 'source'); setIsOpen(false); }} className="flex items-center gap-1 text-[8px] font-mono text-[#E5C158] bg-[#D4AF37]/5 px-1.5 py-0.5 rounded border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-colors">
                                <Target size={8} /> {note.elementPreview}
                              </button>
                            )}
                            {note.destinationSelector && (
                              <button onClick={e => { e.stopPropagation(); jumpToElement(note.destinationSelector!, 'destination'); setIsOpen(false); }} className="flex items-center gap-1 text-[8px] font-mono text-green-400 bg-green-500/5 px-1.5 py-0.5 rounded border border-green-500/20 hover:bg-green-500/20 transition-colors">
                                <ArrowRight size={8} /> {note.destinationPreview}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button onClick={e => { e.stopPropagation(); navigateToTarget(note); }} className="p-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black rounded-lg border border-[#D4AF37]/30 transition-all flex items-center justify-center">
                            <Eye size={14} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); setNotes(prev => prev.filter(n => n.id !== note.id)); }} className="p-1.5 text-gray-600 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isImporting && (
              <div className="p-4 bg-gray-950 border-t border-gray-800">
                <button onClick={() => setFocusMode({ active: true, id: null, text: '', device: getCurrentDevice() })} className="w-full py-3 bg-[#B5952F] hover:bg-[#D4AF37] text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-xs font-bold">
                  <Plus size={14} /> Novo Ajuste
                </button>
              </div>
            )}
          </div>

          {/* Botão toggle de arraste — abaixo do painel */}
          <div className="fixed z-[9999] layout-notes-ui flex justify-center" style={{ left: panelPos.x, top: panelPos.y + 524, width: '95vw', maxWidth: 380 }}>
            <button
              onClick={() => setIsDragEnabled(p => !p)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all shadow-lg ${isDragEnabled ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-gray-900 text-gray-500 border-gray-700 hover:border-gray-500'}`}
            >
              <GripVertical size={12} />
              {isDragEnabled ? 'Arraste ativo — toque para desativar' : 'Mover painel'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
