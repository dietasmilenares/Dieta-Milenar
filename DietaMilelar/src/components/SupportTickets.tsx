import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Plus, Send, ChevronLeft, Clock,
  CheckCircle, AlertCircle, XCircle, Loader2, RefreshCw, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ticket {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'user' | 'admin';
  message: string;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  aberto:         { label: 'Aberto',         color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', icon: <AlertCircle size={11} /> },
  em_atendimento: { label: 'Em Atendimento', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',     icon: <Clock size={11} /> },
  resolvido:      { label: 'Resolvido',       color: 'text-green-400 bg-green-500/10 border-green-500/30',  icon: <CheckCircle size={11} /> },
  fechado:        { label: 'Fechado',         color: 'text-gray-400 bg-gray-500/10 border-gray-500/30',     icon: <XCircle size={11} /> },
};

const CAT: Record<string, string> = {
  acesso: 'Acesso', pagamento: 'Pagamento', conteudo: 'Conteúdo', tecnico: 'Técnico', outro: 'Outro',
};

const PRI: Record<string, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: 'text-gray-400' },
  media: { label: 'Média', color: 'text-yellow-400' },
  alta:  { label: 'Alta',  color: 'text-red-400' },
};

const fmt = (d: string) =>
  new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

const getToken = () => localStorage.getItem('auth_token') || '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ─── API calls ────────────────────────────────────────────────────────────────

async function apiGetTickets(): Promise<Ticket[]> {
  const res = await fetch('/api/tickets', { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function apiCreateTicket(payload: { subject: string; category: string; priority: string; message: string }) {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function apiGetMessages(ticketId: string): Promise<{ ticket: Ticket; messages: Message[] }> {
  const res = await fetch(`/api/tickets/${ticketId}/messages`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  // Suporta tanto array direto quanto objeto {messages, ticket}
  if (Array.isArray(data)) {
    return { messages: data, ticket: { id: ticketId } as Ticket };
  }
  return { messages: data.messages || [], ticket: data.ticket || {} };
}

async function apiSendMessage(ticketId: string, message: string) {
  const res = await fetch(`/api/tickets/${ticketId}/messages`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiChangeStatus(ticketId: string, status: string) {
  const res = await fetch(`/api/tickets/${ticketId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── NewTicketForm ────────────────────────────────────────────────────────────

const NewTicketForm: React.FC<{ onCreated: () => void; onCancel: () => void }> = ({ onCreated, onCancel }) => {
  const [subject, setSubject]   = useState('');
  const [category, setCategory] = useState('outro');
  const [priority, setPriority] = useState('media');
  const [message, setMessage]   = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Preencha o assunto e a mensagem.');
      return;
    }
    setLoading(true);
    try {
      await apiCreateTicket({ subject: subject.trim(), category, priority, message: message.trim() });
      toast.success('Ticket aberto com sucesso!');
      onCreated();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao criar ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Plus size={16} className="text-[#D4AF37]" /> Novo Ticket
        </h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-white text-sm transition-colors">Cancelar</button>
      </div>

      <div>
        <label className="block text-[10px] text-gray-500 uppercase mb-1">Assunto *</label>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} maxLength={200}
          placeholder="Descreva brevemente o problema..."
          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-gray-500 uppercase mb-1">Categoria</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:outline-none">
            <option value="acesso">Acesso</option>
            <option value="pagamento">Pagamento</option>
            <option value="conteudo">Conteúdo</option>
            <option value="tecnico">Técnico</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 uppercase mb-1">Prioridade</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:outline-none">
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] text-gray-500 uppercase mb-1">Mensagem *</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
          placeholder="Descreva detalhadamente o problema..."
          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-[#D4AF37]/50" />
      </div>

      <button onClick={submit} disabled={loading}
        className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b5952f] transition-colors disabled:opacity-50">
        {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
        {loading ? 'Enviando...' : 'Abrir Ticket'}
      </button>
    </motion.div>
  );
};

// ─── TicketChat ───────────────────────────────────────────────────────────────

const TicketChat: React.FC<{
  ticket: Ticket;
  isAdmin: boolean;
  onBack: () => void;
  onStatusChange: (id: string, status: string) => void;
}> = ({ ticket, isAdmin, onBack, onStatusChange }) => {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [text, setText]               = useState('');
  const [loading, setLoading]         = useState(true);
  const [sending, setSending]         = useState(false);
  const [status, setStatus]           = useState(ticket.status || 'aberto');
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const data = await apiGetMessages(ticket.id);
      setMessages(data.messages);
      if (data.ticket?.status) setStatus(data.ticket.status);
    } catch (e: any) {
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, [ticket.id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await apiSendMessage(ticket.id, text.trim());
      setText('');
      await loadMessages();
    } catch {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (newStatus: string) => {
    try {
      await apiChangeStatus(ticket.id, newStatus);
      setStatus(newStatus);
      onStatusChange(ticket.id, newStatus);
      toast.success('Status atualizado!');
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const cfg = STATUS[status] || STATUS.aberto;
  const closed = status === 'resolvido' || status === 'fechado';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800 flex-shrink-0 bg-gray-900/50">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{ticket.subject}</p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
            <span className="text-[10px] text-gray-500">{CAT[ticket.category] || ticket.category}</span>
            <span className={`text-[10px] font-bold ${PRI[ticket.priority]?.color || 'text-gray-400'}`}>
              ● {PRI[ticket.priority]?.label || ticket.priority}
            </span>
            {isAdmin && ticket.user_name && (
              <span className="text-[10px] text-gray-500">{ticket.user_name}</span>
            )}
          </div>
        </div>
        {isAdmin && (
          <select value={status} onChange={e => changeStatus(e.target.value)}
            className="bg-black border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white flex-shrink-0 focus:outline-none">
            <option value="aberto">Aberto</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="resolvido">Resolvido</option>
            <option value="fechado">Fechado</option>
          </select>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-600" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-600 text-sm py-12">Nenhuma mensagem ainda.</p>
        ) : messages.map(msg => {
          const isAdminMsg = msg.sender_role === 'admin';
          return (
            <div key={msg.id} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isAdminMsg
                ? 'bg-[#D4AF37] text-black rounded-tr-sm'
                : 'bg-gray-800 text-white rounded-tl-sm'}`}>
                <p className={`text-[10px] font-bold mb-1 ${isAdminMsg ? 'text-black/50' : 'text-gray-400'}`}>
                  {isAdminMsg ? 'Suporte' : (msg.sender_name || 'Usuário')}
                </p>
                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isAdminMsg ? 'text-black/40' : 'text-gray-500'}`}>
                  {fmt(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!closed ? (
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Digite sua mensagem... (Enter para enviar)"
              rows={2}
              className="flex-1 bg-black border border-gray-700 rounded-xl p-3 text-white text-sm resize-none focus:outline-none focus:border-[#D4AF37]/50"
            />
            <button onClick={send} disabled={sending || !text.trim()}
              className="bg-[#D4AF37] text-black p-3 rounded-xl hover:bg-[#b5952f] transition-colors disabled:opacity-40 flex-shrink-0">
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-gray-800 text-center flex-shrink-0">
          <p className="text-gray-500 text-sm">Este ticket está {cfg.label.toLowerCase()}.</p>
        </div>
      )}
    </div>
  );
};

// ─── SupportTickets (main) ────────────────────────────────────────────────────

export const SupportTickets: React.FC<{ isAdmin?: boolean }> = ({ isAdmin = false }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [active, setActive]   = useState<Ticket | null>(null);
  const [filter, setFilter]   = useState('all');

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetTickets();
      setTickets(data);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleStatusChange = (id: string, newStatus: string) =>
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  if (active) {
    return (
      <div className="flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden" style={{ height: '70vh' }}>
        <TicketChat
          ticket={active}
          isAdmin={isAdmin}
          onBack={() => { setActive(null); loadTickets(); }}
          onStatusChange={handleStatusChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-[#D4AF37]" />
          {isAdmin ? 'Central de Tickets' : 'Meus Tickets'}
          {tickets.length > 0 && (
            <span className="bg-gray-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">{tickets.length}</span>
          )}
        </h2>
        <div className="flex gap-2">
          <button onClick={loadTickets}
            className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
            <RefreshCw size={15} />
          </button>
          {!isAdmin && (
            <button onClick={() => setShowNew(s => !s)}
              className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#b5952f] transition-colors">
              <Plus size={15} /> Novo Ticket
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNew && !isAdmin && (
          <NewTicketForm
            onCreated={() => { setShowNew(false); loadTickets(); }}
            onCancel={() => setShowNew(false)}
          />
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'aberto', 'em_atendimento', 'resolvido', 'fechado'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              filter === s
                ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
            }`}>
            {s === 'all'
              ? `Todos (${tickets.length})`
              : `${STATUS[s]?.label} (${tickets.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          Erro: {error} — <button onClick={loadTickets} className="underline">Tentar novamente</button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-gray-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
          <MessageSquare size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">
            {filter === 'all' ? 'Nenhum ticket ainda.' : `Nenhum ticket ${STATUS[filter]?.label?.toLowerCase()}.`}
          </p>
          {!isAdmin && filter === 'all' && (
            <button onClick={() => setShowNew(true)} className="text-[#D4AF37] text-sm font-bold hover:underline">
              Abrir primeiro ticket
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => {
            const cfg = STATUS[t.status] || STATUS.aberto;
            return (
              <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setActive(t)}
                className="bg-gray-900 rounded-xl border border-gray-800 p-4 cursor-pointer hover:border-[#D4AF37]/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-200 truncate mb-1">{t.subject}</p>
                    {isAdmin && t.user_name && (
                      <p className="text-gray-500 text-xs truncate mb-1">{t.user_name} · {t.user_email}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className="text-[10px] text-gray-600">{CAT[t.category] || t.category}</span>
                      <span className={`text-[10px] font-bold ${PRI[t.priority]?.color || 'text-gray-400'}`}>
                        ● {PRI[t.priority]?.label || t.priority}
                      </span>
                      <span className="text-[10px] text-gray-600">{fmt(t.updated_at)}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-600 flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
