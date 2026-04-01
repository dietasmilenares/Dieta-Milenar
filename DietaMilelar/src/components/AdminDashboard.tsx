import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Check, X, Shield, Users, DollarSign, MessageSquare, Box, BarChart, Settings, Plus, Play, Pause, Trash2, Edit, Save, Image as ImageIcon, CreditCard, Lock, Key, Gift, Wrench, BookOpen, Layers, EyeOff, RefreshCw, ChevronLeft, Search, UserCheck, UserX, Clock, Palette, FileText, Eye, AlertCircle, ZoomIn } from 'lucide-react';
import { useData } from '../context/DataContext';
import { DashboardHeader } from './DashboardHeader';
import { Product, UserRole, BonusItem, BonusCategory, BonusItem_2, Category, Subcategory, Ebook } from '../types';
import { ToolsModal } from './ToolsModal';
import { PlansManager } from './PlansManager';
import FileUpload from './FileUpload';
import { EbookFilePicker } from './EbookFilePicker';
import { Footer } from './Footer';

type AdminTab = 'dashboard' | 'products' | 'bonuses' | 'affiliates' | 'social_proof' | 'settings' | 'settings_checkout' | 'settings_support' | 'settings_theme' | 'settings_legal' | 'users' | 'vip_users' | 'visitantes' | 'all_members' | 'withdrawals' | 'plans' | 'library';

const InactiveEbooks: React.FC<{ categoryId: string; onDelete: (id: string) => void; onReactivated: () => void }> = ({ categoryId, onDelete, onReactivated }) => {
  const [inactive, setInactive] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token') || '';
    setLoading(true);
    fetch('/api/ebooks/inactive', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setInactive(data.filter((e: any) => e.category_id === categoryId)); setLoading(false); })
      .catch(() => { setInactive([]); setLoading(false); });
  }, [categoryId]);

  const reactivate = async (ebook: any) => {
    const token = localStorage.getItem('auth_token') || '';
    try {
      const res = await fetch(`/api/ebooks/${ebook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: ebook.title, description: ebook.description, cover_image: ebook.cover_image, content: ebook.content, download_url: ebook.download_url || null, sort_order: ebook.sort_order ?? 0, drip_days: ebook.drip_days ?? 0, active: 1 })
      });
      if (!res.ok) throw new Error();
      setInactive(p => p.filter(e => e.id !== ebook.id));
      onReactivated();
      toast.success('E-book reativado!');
    } catch { toast.error('Erro ao reativar.'); }
  };

  if (loading) return <p className="text-gray-500 text-xs text-center py-4">Carregando...</p>;
  if (inactive.length === 0) return <p className="text-gray-500 text-xs text-center py-4">Nenhum e-book desativado nesta categoria.</p>;

  return (
    <div className="space-y-2">
      {inactive.map((ebook: any) => (
        <div key={ebook.id} className="bg-black p-3 rounded-lg border border-gray-700 opacity-60 flex items-center gap-3">
          <img src={ebook.cover_image || '/img/capa.png'} alt={ebook.title} className="w-10 h-12 object-cover rounded" />
          <div className="flex-1 min-w-0">
            <h5 className="text-gray-400 font-bold text-xs truncate">{ebook.title}</h5>
            <p className="text-gray-600 text-[10px]">Desativado</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => reactivate(ebook)} title="Reativar">🟢</button>
            <button onClick={() => { if (!window.confirm('Deletar permanentemente? Esta ação não pode ser desfeita.')) return; onDelete(ebook.id); setInactive(p => p.filter(e => e.id !== ebook.id)); }} className="text-gray-400 hover:text-red-500" title="Deletar permanentemente"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

const InactiveBonusItems: React.FC<{ categoryId: string; onDelete: (id: string) => void; onReactivated: () => void }> = ({ categoryId, onDelete, onReactivated }) => {
  const [inactive, setInactive] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token') || '';
    setLoading(true);
    fetch('/api/bonus-items/inactive', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setInactive(data.filter((i: any) => i.bonus_category_id === categoryId)); setLoading(false); })
      .catch(() => { setInactive([]); setLoading(false); });
  }, [categoryId]);

  const reactivate = async (item: any) => {
    const token = localStorage.getItem('auth_token') || '';
    try {
      const res = await fetch(`/api/bonus-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: item.title, description: item.description, cover_image: item.cover_image, content: item.content, download_url: item.download_url || null, sort_order: item.sort_order ?? 0, drip_days: item.drip_days ?? 0, active: 1 })
      });
      if (!res.ok) throw new Error();
      setInactive(p => p.filter(i => i.id !== item.id));
      onReactivated();
      toast.success('Item reativado!');
    } catch { toast.error('Erro ao reativar.'); }
  };

  if (loading) return <p className="text-gray-500 text-xs text-center py-4">Carregando...</p>;
  if (inactive.length === 0) return <p className="text-gray-500 text-xs text-center py-4">Nenhum item desativado nesta categoria.</p>;

  return (
    <div className="space-y-2">
      {inactive.map((item: any) => (
        <div key={item.id} className="bg-black p-3 rounded-lg border border-gray-700 opacity-60 flex items-center gap-3">
          <img src={item.cover_image || '/img/capa.png'} alt={item.title} className="w-10 h-12 object-cover rounded" />
          <div className="flex-1 min-w-0">
            <h5 className="text-gray-400 font-bold text-xs truncate">{item.title}</h5>
            <p className="text-gray-600 text-[10px]">Desativado</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => reactivate(item)} title="Reativar">🟢</button>
            <button onClick={() => { if (!window.confirm('Deletar permanentemente? Esta ação não pode ser desfeita.')) return; onDelete(item.id); setInactive(p => p.filter(i => i.id !== item.id)); }} className="text-gray-400 hover:text-red-500" title="Deletar permanentemente"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

const InactiveBonusCategories: React.FC<{ onDelete: (id: string) => void; onReactivated: () => void }> = ({ onDelete, onReactivated }) => {
  const [inactive, setInactive] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchInactive = () => {
    const token = localStorage.getItem('auth_token') || '';
    setLoading(true);
    fetch('/api/bonus-categories/inactive', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setInactive(data); setLoading(false); })
      .catch(() => { setInactive([]); setLoading(false); });
  };

  React.useEffect(() => { fetchInactive(); }, []);

  const reactivate = async (cat: any) => {
    const token = localStorage.getItem('auth_token') || '';
    try {
      const res = await fetch(`/api/bonus-categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: cat.name, description: cat.description, sort_order: cat.sort_order ?? 0, is_mandatory: cat.is_mandatory ?? 0, drip_days: cat.drip_days ?? 0, active: 1 })
      });
      if (!res.ok) throw new Error();
      setInactive(p => p.filter(c => c.id !== cat.id));
      onReactivated();
      toast.success('Categoria reativada!');
    } catch { toast.error('Erro ao reativar.'); }
  };

  if (loading) return <p className="text-gray-500 text-sm text-center py-6">Carregando...</p>;
  if (inactive.length === 0) return <p className="text-gray-500 text-sm text-center py-6">Nenhuma categoria desativada.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {inactive.map((cat: any) => (
        <div key={cat.id} className="bg-black p-4 rounded-lg border border-gray-700 opacity-60 flex justify-between items-start">
          <div>
            <h3 className="text-gray-400 font-bold">{cat.name}</h3>
            <p className="text-gray-600 text-xs">{cat.description}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => reactivate(cat)} title="Reativar">🟢</button>
            <button onClick={() => { if (!window.confirm('Deletar permanentemente? Esta ação não pode ser desfeita.')) return; onDelete(cat.id); setInactive(p => p.filter(c => c.id !== cat.id)); }} className="text-gray-400 hover:text-red-500" title="Deletar permanentemente"><Trash2 size={15} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

const InactiveCategories: React.FC<{ onDelete: (id: string) => void; onReactivated: () => void }> = ({ onDelete, onReactivated }) => {
  const [inactive, setInactive] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchInactive = () => {
    const token = localStorage.getItem('auth_token') || '';
    setLoading(true);
    fetch('/api/categories/inactive', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setInactive(data); setLoading(false); })
      .catch(() => { setInactive([]); setLoading(false); });
  };

  React.useEffect(() => { fetchInactive(); }, []);

  const reactivate = async (cat: any) => {
    const token = localStorage.getItem('auth_token') || '';
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: cat.name, description: cat.description, sort_order: cat.sort_order ?? 0, is_mandatory: cat.is_mandatory ?? 0, drip_days: cat.drip_days ?? 0, active: 1 })
      });
      if (!res.ok) throw new Error('Falha na API');
      setInactive(p => p.filter(c => c.id !== cat.id));
      onReactivated();
      toast.success('Categoria reativada! Clique em Voltar para ver.');
    } catch (e) {
      toast.error('Erro ao reativar. Tente novamente.');
    }
  };

  if (loading) return <p className="text-gray-500 text-sm text-center py-6">Carregando...</p>;
  if (inactive.length === 0) return <p className="text-gray-500 text-sm text-center py-6">Nenhuma categoria desativada.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {inactive.map((cat: any) => (
        <div key={cat.id} className="bg-black p-4 rounded-lg border border-gray-700 opacity-60 flex justify-between items-start">
          <div>
            <h3 className="text-gray-400 font-bold">{cat.name}</h3>
            <p className="text-gray-600 text-xs">{cat.description}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => reactivate(cat)} title="Reativar">🟢</button>
            <button onClick={async () => { if (!window.confirm('Deletar permanentemente? Esta ação não pode ser desfeita.')) return; await onDelete(cat.id); setInactive(p => p.filter(c => c.id !== cat.id)); }} className="text-gray-400 hover:text-red-500" title="Deletar permanentemente"><Trash2 size={15} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

const InactiveSubcategories: React.FC<{ categoryId: string; onDelete: (id: string) => void; onReactivated: () => void }> = ({ categoryId, onDelete, onReactivated }) => {
  const [inactive, setInactive] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchInactive = () => {
    const token = localStorage.getItem('auth_token') || '';
    setLoading(true);
    fetch('/api/subcategories/inactive', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setInactive(data.filter((s: any) => s.category_id === categoryId)); setLoading(false); })
      .catch(() => { setInactive([]); setLoading(false); });
  };

  React.useEffect(() => { fetchInactive(); }, [categoryId]);

  const reactivate = async (sub: any) => {
    const token = localStorage.getItem('auth_token') || '';
    try {
      const res = await fetch(`/api/subcategories/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category_id: sub.category_id, name: sub.name, description: sub.description, sort_order: sub.sort_order ?? 0, drip_days: sub.drip_days ?? 0, active: 1 })
      });
      if (!res.ok) throw new Error();
      setInactive(p => p.filter(s => s.id !== sub.id));
      onReactivated();
      toast.success('Subcategoria reativada!');
    } catch { toast.error('Erro ao reativar.'); }
  };

  if (loading) return <p className="text-gray-500 text-xs text-center py-4">Carregando...</p>;
  if (inactive.length === 0) return <p className="text-gray-500 text-xs text-center py-4">Nenhuma subcategoria desativada.</p>;

  return (
    <div className="space-y-2">
      {inactive.map((sub: any) => (
        <div key={sub.id} className="bg-black p-3 rounded-lg border border-gray-700 opacity-60 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h5 className="text-gray-400 font-bold text-xs truncate">{sub.name}</h5>
            <p className="text-gray-600 text-[10px]">Ordem: {sub.sort_order}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => reactivate(sub)} title="Reativar">🟢</button>
            <button onClick={async () => { if (!window.confirm('Deletar permanentemente? Esta ação não pode ser desfeita.')) return; await onDelete(sub.id); setInactive(p => p.filter(s => s.id !== sub.id)); }} className="text-gray-400 hover:text-red-500" title="Deletar permanentemente"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

const InactiveEbooksBySub: React.FC<{ subcategoryId: string; onDelete: (id: string) => void; onReactivated: () => void }> = ({ subcategoryId, onDelete, onReactivated }) => {
  const [inactive, setInactive] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchInactive = () => {
    const token = localStorage.getItem('auth_token') || '';
    setLoading(true);
    fetch('/api/ebooks/inactive', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setInactive(data.filter((e: any) => e.subcategory_id === subcategoryId)); setLoading(false); })
      .catch(() => { setInactive([]); setLoading(false); });
  };

  React.useEffect(() => { fetchInactive(); }, [subcategoryId]);

  const reactivate = async (ebook: any) => {
    const token = localStorage.getItem('auth_token') || '';
    try {
      const res = await fetch(`/api/ebooks/${ebook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: ebook.title, description: ebook.description, cover_image: ebook.cover_image, content: ebook.content, download_url: ebook.download_url || null, sort_order: ebook.sort_order ?? 0, drip_days: ebook.drip_days ?? 0, active: 1 })
      });
      if (!res.ok) throw new Error();
      setInactive(p => p.filter(e => e.id !== ebook.id));
      onReactivated();
      toast.success('E-book reativado!');
    } catch { toast.error('Erro ao reativar.'); }
  };

  if (loading) return <p className="text-gray-500 text-xs text-center py-4">Carregando...</p>;
  if (inactive.length === 0) return <p className="text-gray-500 text-xs text-center py-4">Nenhum e-book desativado nesta subcategoria.</p>;

  return (
    <div className="space-y-2">
      {inactive.map((ebook: any) => (
        <div key={ebook.id} className="bg-black p-3 rounded-lg border border-gray-700 opacity-60 flex items-center gap-3">
          <img src={ebook.cover_image || '/img/capa.png'} alt={ebook.title} className="w-8 h-10 object-cover rounded flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h5 className="text-gray-400 font-bold text-xs truncate">{ebook.title}</h5>
            <p className="text-gray-600 text-[10px]">Desativado</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => reactivate(ebook)} title="Reativar">🟢</button>
            <button onClick={async () => { if (!window.confirm('Deletar permanentemente? Esta ação não pode ser desfeita.')) return; await onDelete(ebook.id); setInactive(p => p.filter(e => e.id !== ebook.id)); }} className="text-gray-400 hover:text-red-500" title="Deletar permanentemente"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { 
    transactions, updateTransactionStatus, users, products, bonuses,
    bonusCategories, bonusItems, addBonusCategory, updateBonusCategory, deleteBonusCategory, refreshBonusCategories,
    addBonusItem2, updateBonusItem2, deleteBonusItem2, refreshBonusItems,
    bots, timelines, 
    addBot, addTimeline, toggleTimeline, addProduct, updateProduct, deleteProduct,
    updateUserRole, toggleUserStatus, addBonus, updateBonus, deleteBonus,
    globalSettings, updateGlobalSettings, withdrawals, updateWithdrawalStatus,
    categories, addCategory, updateCategory, deleteCategory, refreshCategories, refreshSubcategories,
    subcategories, addSubcategory, updateSubcategory, deleteSubcategory,
    ebooks, addEbook, updateEbook, deleteEbook, refreshEbooks
  } = useData();
  
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const saved = localStorage.getItem('admin_active_tab') as AdminTab | null;
    if (saved) { localStorage.removeItem('admin_active_tab'); return saved; }
    return 'dashboard';
  });
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [resellerRequests, setResellerRequests] = useState<any[]>([]);
  const [pendingProofs, setPendingProofs] = useState<any[]>([]);
  const [proofModal, setProofModal] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [proofAction, setProofAction] = useState<'idle' | 'loading'>('idle');
  const [rejectConfirmModal, setRejectConfirmModal] = useState<string | null>(null);
  const [rejectObservation, setRejectObservation] = useState('');
  const [allMembersSearch, setAllMembersSearch] = useState('');
  const [allMembersFilterRole, setAllMembersFilterRole] = useState<string>('ALL');
  const [allMembersSortBy, setAllMembersSortBy] = useState<'hierarchy' | 'email' | 'name'>('name');

  // PIX Global — estado local para evitar campo travado
  const [localPixKey, setLocalPixKey] = useState('');
  const [localPixKeyType, setLocalPixKeyType] = useState('random');
  useEffect(() => {
    setLocalPixKey(globalSettings.pixKey || '');
    setLocalPixKeyType(globalSettings.pixKeyType || 'random');
  }, [globalSettings.pixKey, globalSettings.pixKeyType]);

  // Formatação automática da chave PIX conforme o tipo selecionado
  const formatPixKey = (value: string, type: string): string => {
    const digits = value.replace(/\D/g, '');
    if (type === 'cpf') {
      // 000.000.000-00
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0,3)}.${digits.slice(3)}`;
      if (digits.length <= 9) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
      return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9,11)}`;
    }
    if (type === 'phone') {
      // (00) 00000-0000
      if (digits.length <= 2) return digits.length ? `(${digits}` : '';
      if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
      return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
    }
    // email e random: sem formatação
    return value;
  };

  const handlePixKeyChange = (raw: string) => {
    setLocalPixKey(formatPixKey(raw, localPixKeyType));
  };

  const handlePixKeyTypeChange = (newType: string) => {
    setLocalPixKeyType(newType);
    // Limpa o campo ao trocar o tipo para evitar valor incompatível
    setLocalPixKey('');
  };

  const pixKeyInputProps = (): React.InputHTMLAttributes<HTMLInputElement> => {
    if (localPixKeyType === 'cpf') return { type: 'text', inputMode: 'numeric', maxLength: 14, placeholder: '000.000.000-00' };
    if (localPixKeyType === 'phone') return { type: 'text', inputMode: 'numeric', maxLength: 16, placeholder: '(00) 00000-0000' };
    if (localPixKeyType === 'email') return { type: 'email', inputMode: 'email', placeholder: 'seu@email.com' };
    return { type: 'text', placeholder: 'Chave aleatória (UUID)' };
  };

  // Configurações Globais — estado local
  const [localAppName, setLocalAppName] = useState('');
  const [localLogoUrl, setLocalLogoUrl] = useState('');
  const [localHeroVideoUrl, setLocalHeroVideoUrl] = useState('');
  useEffect(() => {
    setLocalAppName(globalSettings.appName || '');
    setLocalLogoUrl(globalSettings.logoUrl || '');
    setLocalHeroVideoUrl((globalSettings as any).heroVideoUrl || '');
  }, [globalSettings.appName, globalSettings.logoUrl, (globalSettings as any).heroVideoUrl]);

  // Canais de Suporte — estado local
  const [localSupportWhatsapp, setLocalSupportWhatsapp] = useState('');
  const [localSupportEmail, setLocalSupportEmail] = useState('');
  useEffect(() => {
    setLocalSupportWhatsapp((globalSettings as any).supportWhatsapp || '');
    setLocalSupportEmail((globalSettings as any).supportEmail || '');
  }, [(globalSettings as any).supportWhatsapp, (globalSettings as any).supportEmail]);

  // Tema — estado local
  const [localPrimaryColor, setLocalPrimaryColor] = useState('#D4AF37');
  useEffect(() => {
    setLocalPrimaryColor(globalSettings.primaryColor || '#D4AF37');
  }, [globalSettings.primaryColor]);

  // Textos Legais — estado local
  const [localTermsOfUse, setLocalTermsOfUse] = useState('');
  useEffect(() => {
    setLocalTermsOfUse((globalSettings as any).termsOfUse || '');
  }, [(globalSettings as any).termsOfUse]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token') || '';
    fetch('/api/reseller-requests', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: any) => setResellerRequests(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch('/api/orders/pending-proofs', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: any) => setPendingProofs(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleResellerRequest = async (id: string, status: 'approved' | 'rejected') => {
    const token = localStorage.getItem('auth_token') || '';
    try {
      await fetch(`/api/reseller-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      setResellerRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success(status === 'approved' ? 'Aprovado! Usuário promovido a Revendedor.' : 'Solicitação rejeitada.');
    } catch {
      toast.error('Erro ao processar solicitação');
    }
  };

  const handleProofAction = async (orderId: string, action: 'approved' | 'rejected', observation?: string) => {
    setProofAction('loading');
    try {
      await updateTransactionStatus(orderId, action, action === 'rejected' ? (observation || '') : undefined);
      setPendingProofs(prev => prev.filter(p => p.id !== orderId));
      setProofModal(null);
      setRejectionReason('');
      setRejectConfirmModal(null);
      setRejectObservation('');
      toast.success(action === 'approved' ? 'Pagamento aprovado! Acesso liberado.' : 'Comprovante rejeitado.');
    } catch {
      toast.error('Erro ao processar. Tente novamente.');
    } finally {
      setProofAction('idle');
    }
  };

  // Product Editor State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});

  // Bonus Editor State
  const [isEditingBonus, setIsEditingBonus] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Partial<BonusItem>>({});
  // Novo sistema bônus
  const [editingBonusCat, setEditingBonusCat] = useState<Partial<BonusCategory>>({});
  const [isEditingBonusCat, setIsEditingBonusCat] = useState(false);
  const [editingBonusItem, setEditingBonusItem] = useState<Partial<BonusItem_2>>({});
  const [isEditingBonusItem, setIsEditingBonusItem] = useState(false);
  const [showInactiveBonusCats, setShowInactiveBonusCats] = useState(false);
  const [showInactiveBonusItems, setShowInactiveBonusItems] = useState(false);

  // Library Editor State
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({});
  const [isEditingSubcategory, setIsEditingSubcategory] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Partial<Subcategory>>({});
  const [isEditingEbook, setIsEditingEbook] = useState(false);

  const [availableImages, setAvailableImages] = useState<string[]>([]);

  React.useEffect(() => {
    fetch('/api/images')
      .then(res => res.json())
      .then(data => setAvailableImages(data))
      .catch(err => console.error('Erro ao carregar imagens:', err));
  }, []);
  const [editingEbook, setEditingEbook] = useState<Partial<Ebook>>({});
  const [showInactiveCategories, setShowInactiveCategories] = useState(false);
  const [showInactiveEbooks, setShowInactiveEbooks] = useState(false);
  const [showInactiveSubcategories, setShowInactiveSubcategories] = useState(false);
  const [listingSubsForCategory, setListingSubsForCategory] = useState<string | null>(null);
  const [listingEbooksForSub, setListingEbooksForSub] = useState<string | null>(null);
  const [showInactiveEbooksModal, setShowInactiveEbooksModal] = useState(false);
  const [showInactiveEbooksBySub, setShowInactiveEbooksBySub] = useState(false);
  const [listingBonusItemsForCat, setListingBonusItemsForCat] = useState<string | null>(null);
  const [showInactiveBonusItemsModal, setShowInactiveBonusItemsModal] = useState(false);

  // User Roles State
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const resellers = users.filter(u => u.role === 'REVENDA');

  // ... (Existing handlers for Bots/Timelines) ...
  const [newBotName, setNewBotName] = useState('');
  const [newTimelineName, setNewTimelineName] = useState('');

  const handleCreateBot = () => {
    if (!newBotName) return;
    addBot({
      id: Math.random().toString(),
      name: newBotName,
      avatar: `https://i.pravatar.cc/150?u=${newBotName}`,
      isActive: true,
      role: 'Support', // Legacy
      isOnline: true   // Legacy
    });
    setNewBotName('');
    toast.success('Bot criado com sucesso!');
  };

  const handleCreateTimeline = () => {
    if (!newTimelineName) return;
    addTimeline({
      id: Math.random().toString(),
      name: newTimelineName,
      botId: bots[0]?.id || '1',
      isActive: false,
      blocks: [],
      pageRoute: '/', // Legacy
      trigger: 'onLoad' // Legacy
    });
    setNewTimelineName('');
    toast.success('Cronograma criado com sucesso!');
  };

  const renderAffiliates = () => (
    <div className="space-y-6">

      {/* Solicitações de Revenda */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Clock size={18} className="text-yellow-400" /> Solicitações de Revenda
          </h2>
          {resellerRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
              {resellerRequests.filter(r => r.status === 'pending').length} pendente{resellerRequests.filter(r => r.status === 'pending').length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {resellerRequests.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">Nenhuma solicitação recebida ainda.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {resellerRequests.map(req => (
              <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{req.name}</p>
                  <p className="text-gray-500 text-xs truncate">{req.email}</p>
                  {req.phone && <p className="text-gray-500 text-xs">{req.phone}</p>}
                  <p className="text-[10px] text-gray-600 mt-1">{new Date(req.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {req.status === 'pending' ? (
                    <>
                      <button onClick={() => handleResellerRequest(req.id, 'approved')}
                        className="flex items-center gap-1.5 bg-green-900/30 text-green-400 border border-green-900/50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-900/50 transition-colors">
                        <UserCheck size={13} /> Aceitar
                      </button>
                      <button onClick={() => handleResellerRequest(req.id, 'rejected')}
                        className="flex items-center gap-1.5 bg-red-900/20 text-red-400 border border-red-900/30 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-900/40 transition-colors">
                        <UserX size={13} /> Rejeitar
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${req.status === 'approved' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                      {req.status === 'approved' ? '✓ Aprovado' : '✗ Rejeitado'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revendedores Ativos */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-[#D4AF37]" /> Gestão de Afiliados
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-black p-4 rounded-lg border border-gray-800">
              <p className="text-gray-500 text-xs uppercase">Total de Afiliados</p>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'REVENDA').length}</p>
            </div>
            <div className="bg-black p-4 rounded-lg border border-gray-800">
              <p className="text-gray-500 text-xs uppercase">Comissões Pagas</p>
              <p className="text-2xl font-bold text-[#D4AF37]">R$ 0,00</p>
            </div>
            <div className="bg-black p-4 rounded-lg border border-gray-800">
              <p className="text-gray-500 text-xs uppercase">Cliques Totais</p>
              <p className="text-2xl font-bold text-blue-400">0</p>
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-4">Revendedores Ativos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-black/50 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Saldo</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.filter(u => u.role === 'REVENDA').map(user => (
                  <tr key={user.id} className="text-sm hover:bg-gray-800/50">
                    <td className="p-4 text-white font-bold">{user.name}</td>
                    <td className="p-4 text-gray-400">{user.email}</td>
                    <td className="p-4 text-[#D4AF37] font-mono">R$ {user.walletBalance?.toFixed(2) || '0.00'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${user.status === 'active' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                        {user.status || 'Ativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Product Handlers
  const handleNewProduct = () => {
    setEditingProduct({
      id: Math.random().toString(),
      name: '',
      slug: '',
      description: '',
      price: 0,
      offerPrice: 0,
      coverImage: '/img/capa.png',
      active: true,
      dripEnabled: false,
      paymentLink: '',
      useCustomPix: false,
      pixKey: '',
      pixKeyType: 'random',
      modules: []
    });
    setIsEditingProduct(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditingProduct(true);
  };

  const handleSaveProduct = async () => {
    if (editingProduct.id && editingProduct.name) {
      const isExisting = products.some(p => p.id === editingProduct.id);
      const snapshot = { ...editingProduct };
      setIsEditingProduct(false);
      setEditingProduct({});
      if (isExisting) {
        await updateProduct(snapshot.id!, snapshot);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await addProduct(snapshot as Product);
        toast.success('Produto criado com sucesso!');
      }
    } else {
      toast.error('Preencha os campos obrigatórios.');
    }
  };

  // Bonus Handlers
  const handleNewBonus = () => {
    setEditingBonus({
      id: Math.random().toString(),
      title: '',
      description: '',
      coverImage: '/img/capa.png',
      downloadUrl: '',
      targetAudience: 'MEMBRO',
      active: true
    });
    setIsEditingBonus(true);
  };

  const handleEditBonus = (bonus: BonusItem) => {
    setEditingBonus(bonus);
    setIsEditingBonus(true);
  };

  const handleSaveBonus = () => {
    if (editingBonus.id && editingBonus.title) {
      if (bonuses.some(b => b.id === editingBonus.id)) {
        updateBonus(editingBonus.id, editingBonus);
        toast.success('Bônus atualizado com sucesso!');
      } else {
        addBonus(editingBonus as BonusItem);
        toast.success('Bônus criado com sucesso!');
      }
      setIsEditingBonus(false);
    } else {
      toast.error('Preencha os campos obrigatórios.');
    }
  };

  const renderProductEditor = () => {
    if (!editingProduct || !editingProduct.id) return null;
    return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            Produtos — {products.find(p => p.id === editingProduct.id) ? '🛠️' : '🆕'} Produto
          </h3>
          <button onClick={() => setIsEditingProduct(false)} className="text-gray-400 hover:text-white"><X /></button>
        </div>
        <div className="space-y-4">

          {/* Nome + Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Nome</label>
              <input
                type="text"
                value={editingProduct.name || ''}
                onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Slug</label>
              <input
                type="text"
                value={editingProduct.slug || ''}
                onChange={e => setEditingProduct({...editingProduct, slug: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                placeholder="ex: membro-vip-mensal"
              />
            </div>
          </div>

          {/* Preço + Preço Oferta */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Preço (R$)</label>
              <input
                type="number"
                value={editingProduct.price || 0}
                onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Preço Oferta (R$)</label>
              <input
                type="number"
                value={editingProduct.offerPrice ?? 0}
                onChange={e => setEditingProduct({...editingProduct, offerPrice: parseFloat(e.target.value) || 0})}
                className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Descrição</label>
            <textarea
              value={editingProduct.description || ''}
              onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
              className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white h-20"
              placeholder="Aceita HTML, vídeos (iframe), imagens e scripts..."
            />
          </div>

          {/* Capa */}
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Capa do Produto</label>
            <div className="flex items-center gap-3">
              {editingProduct.coverImage && (
                <img src={editingProduct.coverImage} alt="Capa" className="w-16 h-20 object-cover rounded border border-gray-700" />
              )}
              <select
                value={editingProduct.coverImage || ''}
                onChange={e => setEditingProduct({...editingProduct, coverImage: e.target.value})}
                className="flex-1 bg-black border border-gray-800 rounded-lg p-2 text-white"
              >
                <option value="">Selecione uma imagem...</option>
                {availableImages.map(img => (
                  <option key={img} value={img}>{img.split('/').pop()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Link de Pagamento */}
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Link de Pagamento</label>
            <input
              type="text"
              value={editingProduct.paymentLink || ''}
              onChange={e => setEditingProduct({...editingProduct, paymentLink: e.target.value})}
              className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
              placeholder="https://..."
            />
          </div>

          {/* Chave PIX */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-black/40 border border-gray-800 rounded-lg px-3 py-2.5">
              <div>
                <p className="text-xs text-gray-300 font-bold">Chave PIX personalizada</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Por padrão usa a chave PIX global do sistema</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct({
                  ...editingProduct,
                  useCustomPix: !editingProduct.useCustomPix,
                  pixKey: !editingProduct.useCustomPix ? (editingProduct.pixKey || '') : '',
                })}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  editingProduct.useCustomPix ? 'bg-[#D4AF37]' : 'bg-gray-700'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  editingProduct.useCustomPix ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {editingProduct.useCustomPix && (
              <div className="grid grid-cols-2 gap-4 pl-1">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Chave PIX</label>
                  <input
                    type="text"
                    value={editingProduct.pixKey || ''}
                    onChange={e => setEditingProduct({...editingProduct, pixKey: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white text-xs"
                    placeholder="CPF, e-mail, telefone ou aleatória"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Tipo da Chave</label>
                  <select
                    value={editingProduct.pixKeyType || 'random'}
                    onChange={e => setEditingProduct({...editingProduct, pixKeyType: e.target.value as any})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Aleatória</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="productActive"
                checked={editingProduct.active || false}
                onChange={e => setEditingProduct({...editingProduct, active: e.target.checked})}
              />
              <label htmlFor="productActive" className="text-sm text-gray-300">Produto Ativo</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="productDrip"
                checked={editingProduct.dripEnabled || false}
                onChange={e => setEditingProduct({...editingProduct, dripEnabled: e.target.checked})}
              />
              <label htmlFor="productDrip" className="text-sm text-gray-300">Drip Ativado</label>
            </div>
          </div>

          <button
            onClick={handleSaveProduct}
            className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2"
          >
            <Save size={18} /> Salvar Produto
          </button>
        </div>
      </div>
    </div>
    );
  }

  const renderBonusEditor = () => (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Gift className="text-[#D4AF37]" />
          {editingBonus.id && bonuses.some(b => b.id === editingBonus.id) ? 'Editar Bônus' : 'Novo Bônus'}
        </h2>
        <button onClick={() => setIsEditingBonus(false)} className="text-gray-400 hover:text-white"><X /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Título do Bônus</label>
            <input 
              type="text" 
              value={editingBonus.title || ''} 
              onChange={e => setEditingBonus({...editingBonus, title: e.target.value})}
              className="w-full bg-black border border-gray-700 rounded p-2 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Descrição</label>
            <textarea 
              value={editingBonus.description || ''} 
              onChange={e => setEditingBonus({...editingBonus, description: e.target.value})}
              className="w-full bg-black border border-gray-700 rounded p-2 text-white h-24 font-mono text-sm"
              placeholder="Aceita HTML, Vídeos (iframe), Imagens e Scripts..."
            />
            <p className="text-[10px] text-gray-500 mt-1">
              * Aceita formatação HTML (b, i, u), Links (a), Imagens (img), Vídeos (iframe) e Scripts (js).
            </p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Link de Download</label>
            <input 
              type="text" 
              value={editingBonus.downloadUrl || ''} 
              onChange={e => setEditingBonus({...editingBonus, downloadUrl: e.target.value})}
              className="w-full bg-black border border-gray-700 rounded p-2 text-white"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Upload de Arquivo (Opcional)</label>
            <FileUpload 
              onUploadComplete={(url) => setEditingBonus({...editingBonus, downloadUrl: url})}
              folder="bonuses"
              label="Selecione o arquivo do bônus"
              accept="*"
            />
            {editingBonus.downloadUrl && (
              <p className="text-[10px] text-green-500 mt-1 truncate">Arquivo Vinculado: {editingBonus.downloadUrl}</p>
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Público Alvo</label>
              <select 
                value={editingBonus.targetAudience || 'MEMBRO'}
                onChange={e => setEditingBonus({...editingBonus, targetAudience: e.target.value as 'MEMBRO' | 'REVENDA' | 'VIP'})}
                className="w-full bg-black border border-gray-700 rounded p-2 text-white"
              >
                <option value="MEMBRO">Membro</option>
                <option value="VIP">Membro VIP</option>
                <option value="REVENDA">Revenda</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={editingBonus.active || false}
                  onChange={e => setEditingBonus({...editingBonus, active: e.target.checked})}
                  className="rounded bg-gray-800 border-gray-600 text-[#D4AF37]"
                />
                <span className="text-sm text-gray-300">Bônus Ativo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Capa do Bônus</label>
            <select 
              value={editingBonus.coverImage || ''} 
              onChange={e => setEditingBonus({...editingBonus, coverImage: e.target.value})}
              className="w-full bg-black border border-gray-700 rounded p-2 text-white"
            >
              <option value="">Selecione uma imagem...</option>
              {availableImages.map(img => (
                <option key={img} value={img}>{img.split('/').pop()}</option>
              ))}
            </select>
          </div>
          {editingBonus.coverImage && (
            <div className="aspect-[3/4] rounded-lg overflow-hidden border border-gray-700 w-1/2 mx-auto">
              <img src={editingBonus.coverImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end gap-3">
        <button onClick={() => setIsEditingBonus(false)} className="px-4 py-2 rounded text-gray-400 hover:text-white">Cancelar</button>
        <button onClick={handleSaveBonus} className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded hover:bg-[#b5952f] flex items-center gap-2">
          <Save size={18} /> Salvar Bônus
        </button>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="space-y-6">
      {!listingSubsForCategory && (
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
            <Layers className="text-[#D4AF37]" size={18} /> Categorias
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {showInactiveCategories ? (
              <button
                onClick={() => setShowInactiveCategories(false)}
                className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-600 bg-gray-700 text-white transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={13} /> Voltar
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setShowInactiveCategories(true)}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <EyeOff size={13} /> Desativadas
                </button>
                <button 
                  onClick={() => {
                    setEditingCategory({ id: Math.random().toString(), name: '', description: '', order: categories.length + 1, active: true });
                    setIsEditingCategory(true);
                  }}
                  className="bg-[#D4AF37] text-black px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-[#B8962E] transition-colors text-xs"
                >
                  <Plus size={14} /> Nova
                </button>
              </>
            )}
          </div>
        </div>
        <div className="p-6">
          {!showInactiveCategories ? (
            <div className="relative overflow-hidden rounded-xl">
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', overscrollBehaviorX: 'contain' }}>
              {categories.map(cat => (
                <div key={cat.id} className="flex-none w-full snap-start bg-black rounded-lg border border-gray-800 overflow-hidden group hover:border-[#D4AF37]/30 transition-colors" style={{ scrollSnapStop: 'always' }}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                    <img
                      src={cat.coverImage || '/img/capa.png'}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={e => { (e.target as HTMLImageElement).src = '/img/capa.png'; }}
                    />
                    <button
                      onClick={() => { setEditingCategory(cat); setIsEditingCategory(true); }}
                      className="absolute top-2 left-2 p-1.5 bg-black/70 rounded-lg text-white hover:bg-[#D4AF37] hover:text-black transition-colors"
                      title="Editar"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={async () => { await deleteCategory(cat.id); await refreshCategories(); toast.success('Categoria desativada!'); }}
                      className="absolute top-10 left-2 p-1.5 bg-black/70 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      title="Desativar"
                    >
                      <EyeOff size={12} />
                    </button>
                    <div className="absolute top-2 right-2 flex gap-1">
                      {cat.isMandatory && <span className="bg-red-500/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Obrigatória</span>}
                      {cat.dripDays ? <span className="bg-blue-500/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Drip {cat.dripDays}d</span> : null}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-white font-bold text-xs truncate">{cat.name}</h3>
                    <p className="text-gray-500 text-[10px] line-clamp-2 mt-0.5">{cat.description}</p>
                  </div>
                  <div className="grid grid-cols-2 border-t border-gray-800">
                    <button
                      onClick={() => {
                        setEditingSubcategory({ id: Math.random().toString(), categoryId: cat.id, name: '', description: '', order: subcategories.filter(s => s.categoryId === cat.id).length + 1, dripDays: 0, active: true });
                        setIsEditingSubcategory(true);
                      }}
                      className="flex items-center justify-center gap-1 py-2 text-[10px] text-white font-semibold border-r border-gray-800 hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={10} /> Sub
                    </button>
                    <button
                      onClick={() => { setListingSubsForCategory(cat.id); setShowInactiveSubcategories(false); }}
                      className="flex items-center justify-center gap-1 py-2 text-[10px] text-gray-400 font-semibold hover:bg-gray-800 transition-colors"
                    >
                      <Layers size={10} /> Ver Subs
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>
          ) : (
            <InactiveCategories
              onDelete={async (id) => {
                const token = localStorage.getItem('auth_token') || '';
                await fetch(`/api/categories/${id}/permanent`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                toast.success('Categoria excluída permanentemente!');
              }}
              onReactivated={() => refreshCategories()}
            />
          )}
        </div>
      </div>
      )}

      {/* Subcategories Section — shown when Ver Subs is clicked */}
      {listingSubsForCategory && (() => {
        const cat = categories.find(c => c.id === listingSubsForCategory);
        return (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex flex-wrap justify-between items-center gap-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
                <Layers className="text-[#D4AF37]" size={18} /> Subs — {cat?.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {showInactiveSubcategories ? (
                  <button onClick={() => setShowInactiveSubcategories(false)} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-600 bg-gray-700 text-white transition-colors flex items-center gap-1">
                    <ChevronLeft size={13} /> Voltar
                  </button>
                ) : (
                  <>
                    <button onClick={() => setShowInactiveSubcategories(true)} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-colors flex items-center gap-1">
                      <EyeOff size={13} /> Desativadas
                    </button>
                    <button
                      onClick={() => {
                        setEditingSubcategory({ id: Math.random().toString(), categoryId: listingSubsForCategory!, name: '', description: '', order: subcategories.filter(s => s.categoryId === listingSubsForCategory).length + 1, dripDays: 0, active: true });
                        setIsEditingSubcategory(true);
                      }}
                      className="bg-[#D4AF37] text-black px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-[#B8962E] transition-colors text-xs"
                    >
                      <Plus size={14} /> Nova
                    </button>
                  </>
                )}
                <button onClick={() => { setListingSubsForCategory(null); setShowInactiveSubcategories(false); }} className="text-gray-400 hover:text-white ml-1"><X size={18} /></button>
              </div>
            </div>
            <div className="p-4">
              {!showInactiveSubcategories ? (
                <div className="relative overflow-hidden rounded-xl">
                  <div className="flex overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none', overscrollBehaviorX: 'contain' }}>
                    {subcategories.filter(s => s.categoryId === listingSubsForCategory).length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-6 w-full">Nenhuma subcategoria nesta categoria.</p>
                    ) : (
                      subcategories.filter(s => s.categoryId === listingSubsForCategory)
                        .sort((a, b) => a.order - b.order)
                        .map(sub => (
                          <div key={sub.id} className="flex-none w-full snap-start bg-black rounded-lg border border-gray-800 overflow-hidden group hover:border-[#D4AF37]/30 transition-colors" style={{ scrollSnapStop: 'always' }}>
                            <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                              <img
                                src={sub.coverImage || '/img/capa.png'}
                                alt={sub.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={e => { (e.target as HTMLImageElement).src = '/img/capa.png'; }}
                              />
                              <button
                                onClick={() => { setEditingSubcategory(sub); setIsEditingSubcategory(true); }}
                                className="absolute top-2 left-2 p-1.5 bg-black/70 rounded-lg text-white hover:bg-[#D4AF37] hover:text-black transition-colors"
                                title="Editar"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={async () => { await deleteSubcategory(sub.id); await refreshSubcategories(); toast.success('Subcategoria desativada!'); }}
                                className="absolute top-10 left-2 p-1.5 bg-black/70 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                title="Desativar"
                              >
                                <EyeOff size={12} />
                              </button>
                              {sub.dripDays ? <span className="absolute top-2 right-2 bg-blue-500/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Drip {sub.dripDays}d</span> : null}
                            </div>
                            <div className="p-3">
                              <h3 className="text-white font-bold text-xs truncate">{sub.name}</h3>
                              <p className="text-gray-500 text-[10px] line-clamp-2 mt-0.5">{sub.description}</p>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {sub.dripDays ? <span className="bg-blue-500/20 text-blue-500 text-[9px] px-1.5 py-0.5 rounded">Drip {sub.dripDays}d</span> : null}
                                <span className="bg-gray-800 text-gray-500 text-[9px] px-1.5 py-0.5 rounded">Ordem: {sub.order}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 border-t border-gray-800">
                              <button
                                onClick={() => {
                                  setEditingEbook({ id: Math.random().toString(), title: '', description: '', categoryId: sub.categoryId, subcategoryId: sub.id, coverImage: '/img/capa.png', order: ebooks.filter(e => e.subcategoryId === sub.id).length + 1, active: true, content: '' });
                                  setIsEditingEbook(true);
                                }}
                                className="flex items-center justify-center gap-1 py-2 text-[10px] text-white font-semibold border-r border-gray-800 hover:bg-gray-800 transition-colors"
                              >
                                <Plus size={10} /> E-book
                              </button>
                              <button
                                onClick={() => { setListingEbooksForSub(sub.id); setShowInactiveEbooksModal(false); }}
                                className="flex items-center justify-center gap-1 py-2 text-[10px] text-gray-400 font-semibold hover:bg-gray-800 transition-colors"
                              >
                                <BookOpen size={10} /> Ver
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              ) : (
                <InactiveSubcategories
                  categoryId={listingSubsForCategory}
                  onDelete={async (id) => {
                    const token = localStorage.getItem('auth_token') || '';
                    await fetch(`/api/subcategories/${id}/permanent`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                    toast.success('Subcategoria excluída permanentemente!');
                  }}
                  onReactivated={() => refreshSubcategories()}
                />
              )}
            </div>
          </div>
        );
      })()}

      {/* Category Editor Modal */}
      {isEditingCategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Biblioteca - {categories.find(c => c.id === editingCategory.id) ? "🛠️" : "🆕"} Categoria</h3>
              <button onClick={() => setIsEditingCategory(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Settings */}
              <div className="space-y-4">
                <h4 className="text-[#D4AF37] font-bold border-b border-gray-800 pb-2">Configurações da Categoria</h4>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Nome</label>
                  <input 
                    type="text" 
                    value={editingCategory.name} 
                    onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Descrição</label>
                  <textarea 
                    value={editingCategory.description} 
                    onChange={e => setEditingCategory({...editingCategory, description: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white h-20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Ordem</label>
                    <input 
                      type="number" 
                      value={editingCategory.order} 
                      onChange={e => setEditingCategory({...editingCategory, order: parseInt(e.target.value)})}
                      className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Drip (Dias)</label>
                    <input 
                      type="number" 
                      value={editingCategory.dripDays || 0} 
                      onChange={e => setEditingCategory({...editingCategory, dripDays: parseInt(e.target.value)})}
                      className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={editingCategory.isMandatory} 
                    onChange={e => setEditingCategory({...editingCategory, isMandatory: e.target.checked})}
                    id="isMandatory"
                  />
                  <label htmlFor="isMandatory" className="text-sm text-gray-300">Categoria Obrigatória (Detox)</label>
                </div>

                {/* Imagem da Categoria */}
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Imagem da Categoria</label>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={editingCategory.coverImage || '/img/capa.png'}
                      alt="Preview"
                      className="w-16 h-20 object-cover rounded border border-gray-700 flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = '/img/capa.png'; }}
                    />
                    <div className="flex-1 space-y-2">
                      <FileUpload
                        onUploadComplete={(url) => setEditingCategory({...editingCategory, coverImage: url})}
                        folder="categories"
                        accept="image/*"
                        label="Upload Imagem"
                      />
                      <input
                        type="text"
                        value={editingCategory.coverImage || ''}
                        onChange={e => setEditingCategory({...editingCategory, coverImage: e.target.value})}
                        placeholder="Ou cole uma URL de imagem..."
                        className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white text-xs"
                      />
                      <select
                        value={editingCategory.coverImage || ''}
                        onChange={e => setEditingCategory({...editingCategory, coverImage: e.target.value})}
                        className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white text-xs"
                      >
                        <option value="">Selecionar imagem do sistema...</option>
                        {availableImages.map(img => (
                          <option key={img} value={img}>{img.split('/').pop()}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const isNew = !categories.find(c => c.id === editingCategory.id);
                    const data = { ...editingCategory, coverImage: editingCategory.coverImage || '/img/capa.png' };
                    if (!isNew) {
                      updateCategory(data.id!, data);
                      toast.success('Categoria atualizada com sucesso!');
                      setIsEditingCategory(false);
                    } else {
                      addCategory(data as Category);
                      toast.success('Categoria criada! Agora crie uma subcategoria.');
                      setEditingSubcategory({
                        id: Math.random().toString(),
                        categoryId: data.id,
                        name: '',
                        description: '',
                        order: 1,
                        dripDays: 0,
                        active: true,
                      });
                      setIsEditingCategory(false);
                      setIsEditingSubcategory(true);
                    }
                  }}
                  className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg mt-4"
                >
                  Salvar Categoria
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Listar E-books Modal */}
      {listingEbooksForSub && (() => {
        const sub = subcategories.find(s => s.id === listingEbooksForSub);
        const cat = categories.find(c => c.id === sub?.categoryId);
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-800 flex flex-wrap justify-between items-center gap-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
                  <Layers className="text-[#D4AF37]" size={18} /> E-books — {sub?.name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {showInactiveEbooksModal ? (
                    <button onClick={() => setShowInactiveEbooksModal(false)} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-600 bg-gray-700 text-white transition-colors flex items-center gap-1">
                      <ChevronLeft size={13} /> Voltar
                    </button>
                  ) : (
                    <button onClick={() => setShowInactiveEbooksModal(true)} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-colors flex items-center gap-1">
                      <EyeOff size={13} /> Desativados
                    </button>
                  )}
                  <button onClick={() => setListingEbooksForSub(null)} className="text-gray-400 hover:text-white ml-1"><X size={18} /></button>
                </div>
              </div>
              {/* Grid */}
              <div className="p-6 overflow-y-auto">
                {!showInactiveEbooksModal ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ebooks.filter(e => e.subcategoryId === listingEbooksForSub).length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-6 col-span-2">Nenhum e-book nesta subcategoria.</p>
                    ) : (
                      ebooks.filter(e => e.subcategoryId === listingEbooksForSub)
                        .sort((a, b) => a.order - b.order)
                        .map(eb => (
                          <div key={eb.id} className="bg-black rounded-lg border border-gray-800 overflow-hidden">
                            <div className="p-4 flex justify-between items-start">
                              <div className="flex items-start gap-3 min-w-0">
                                <img src={eb.coverImage || '/img/capa.png'} alt={eb.title} className="w-10 h-12 object-cover rounded flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <h3 className="text-white font-bold">{eb.title}</h3>
                                  <p className="text-gray-500 text-xs line-clamp-2 mt-0.5">{eb.description}</p>
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    {eb.dripDays ? <span className="bg-blue-500/20 text-blue-500 text-[10px] px-2 py-0.5 rounded">Drip: {eb.dripDays}d</span> : null}
                                    <span className="bg-gray-800 text-gray-500 text-[10px] px-2 py-0.5 rounded">Ordem: {eb.order}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => { setEditingEbook(eb); setListingEbooksForSub(null); setIsEditingEbook(true); }} className="text-gray-400 hover:text-white"><Edit size={16} /></button>
                                <button onClick={async () => { await updateEbook(eb.id, { ...eb, active: false }); await refreshEbooks(); toast.success('E-book desativado!'); }} title="Desativar">🔴</button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                ) : (
                  <InactiveEbooksBySub
                    subcategoryId={listingEbooksForSub}
                    onDelete={async (id) => {
                      const token = localStorage.getItem('auth_token') || '';
                      await fetch(`/api/ebooks/${id}/permanent`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                      toast.success('E-book excluído permanentemente!');
                    }}
                    onReactivated={() => refreshEbooks()}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Subcategory Editor Modal */}
      {isEditingSubcategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Biblioteca — {categories.find(c => c.id === editingSubcategory.categoryId)?.name || 'Categoria'} — {subcategories.find(s => s.id === editingSubcategory.id) ? '🛠️' : '🆕'} Subcategoria
              </h3>
              <button onClick={() => setIsEditingSubcategory(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[#D4AF37] font-bold border-b border-gray-800 pb-2">Configurações da Subcategoria</h4>

              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Categoria</label>
                <select
                  value={editingSubcategory.categoryId || categories[0]?.id || ''}
                  onChange={e => setEditingSubcategory({...editingSubcategory, categoryId: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Nome</label>
                <input
                  type="text"
                  value={editingSubcategory.name || ''}
                  onChange={e => setEditingSubcategory({...editingSubcategory, name: e.target.value})}
                  placeholder="Ex: Saga Detox"
                  className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Descrição</label>
                <textarea
                  value={editingSubcategory.description || ''}
                  onChange={e => setEditingSubcategory({...editingSubcategory, description: e.target.value})}
                  placeholder="Descrição da subcategoria..."
                  className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Ordem</label>
                  <input
                    type="number"
                    value={editingSubcategory.order || 1}
                    onChange={e => setEditingSubcategory({...editingSubcategory, order: parseInt(e.target.value)})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Drip (Dias)</label>
                  <input
                    type="number"
                    value={editingSubcategory.dripDays || 0}
                    onChange={e => setEditingSubcategory({...editingSubcategory, dripDays: parseInt(e.target.value)})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Imagem da Subcategoria */}
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Imagem da Subcategoria</label>
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={editingSubcategory.coverImage || '/img/capa.png'}
                    alt="Preview"
                    className="w-16 h-20 object-cover rounded border border-gray-700 flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = '/img/capa.png'; }}
                  />
                  <div className="flex-1 space-y-2">
                    <FileUpload
                      onUploadComplete={(url) => setEditingSubcategory({...editingSubcategory, coverImage: url})}
                      folder="subcategories"
                      accept="image/*"
                      label="Upload Imagem"
                    />
                    <input
                      type="text"
                      value={editingSubcategory.coverImage || ''}
                      onChange={e => setEditingSubcategory({...editingSubcategory, coverImage: e.target.value})}
                      placeholder="Ou cole uma URL de imagem..."
                      className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white text-xs"
                    />
                    <select
                      value={editingSubcategory.coverImage || ''}
                      onChange={e => setEditingSubcategory({...editingSubcategory, coverImage: e.target.value})}
                      className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white text-xs"
                    >
                      <option value="">Selecionar imagem do sistema...</option>
                      {availableImages.map(img => (
                        <option key={img} value={img}>{img.split('/').pop()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ebooks desta Subcategoria */}
              {subcategories.find(s => s.id === editingSubcategory.id) && (
                <div className="space-y-3 mt-2">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2 gap-2 flex-wrap">
                    <h4 className="text-[#D4AF37] font-bold text-sm">E-books</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowInactiveEbooksBySub(p => !p)}
                        className="text-[10px] bg-gray-800 text-gray-400 px-2 py-1 rounded hover:bg-gray-700"
                      >
                        {showInactiveEbooksBySub ? 'Ver ativos' : 'Ver desativados'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingEbook({
                            id: Math.random().toString(),
                            title: '',
                            description: '',
                            categoryId: editingSubcategory.categoryId,
                            subcategoryId: editingSubcategory.id,
                            coverImage: '/img/capa.png',
                            order: ebooks.filter(e => e.subcategoryId === editingSubcategory.id).length + 1,
                            active: true,
                            content: '',
                          });
                          setIsEditingSubcategory(false);
                          setIsEditingEbook(true);
                        }}
                        className="text-[10px] bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-700 flex items-center gap-1"
                      >
                        <Plus size={12} /> Novo E-book
                      </button>
                    </div>
                  </div>
                  {!showInactiveEbooksBySub ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {ebooks.filter(e => e.subcategoryId === editingSubcategory.id).length === 0 ? (
                        <p className="text-gray-500 text-xs text-center py-4">Nenhum e-book nesta subcategoria.</p>
                      ) : (
                        ebooks
                          .filter(e => e.subcategoryId === editingSubcategory.id)
                          .sort((a, b) => a.order - b.order)
                          .map(eb => (
                            <div key={eb.id} className="bg-black p-3 rounded-lg border border-gray-800 flex items-center gap-3">
                              <img src={eb.coverImage || '/img/capa.png'} alt={eb.title} className="w-8 h-10 object-cover rounded flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-white font-bold text-xs truncate">{eb.title}</h5>
                                <p className="text-gray-500 text-[10px]">Ordem: {eb.order}</p>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={() => { setEditingEbook(eb); setIsEditingSubcategory(false); setIsEditingEbook(true); }}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={async () => { await updateEbook(eb.id, { ...eb, active: false }); await refreshEbooks(); toast.success('E-book desativado!'); }}
                                  title="Desativar"
                                >
                                  🔴
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  ) : (
                    <InactiveEbooksBySub
                      subcategoryId={editingSubcategory.id!}
                      onDelete={async (id) => {
                        const token = localStorage.getItem('auth_token') || '';
                        await fetch(`/api/ebooks/${id}/permanent`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                        toast.success('E-book excluído permanentemente!');
                      }}
                      onReactivated={() => refreshEbooks()}
                    />
                  )}
                </div>
              )}

              <button
                onClick={async () => {
                  try {
                    const isNew = !subcategories.find(s => s.id === editingSubcategory.id);
                    const data = { ...editingSubcategory, coverImage: editingSubcategory.coverImage || '/img/capa.png' };
                    if (isNew) {
                      await addSubcategory(data as any);
                      toast.success('Subcategoria criada! Agora adicione um e-book.');
                      setEditingEbook({
                        id: Math.random().toString(),
                        title: '',
                        description: '',
                        categoryId: data.categoryId,
                        subcategoryId: data.id,
                        coverImage: '/img/capa.png',
                        order: ebooks.filter(e => e.subcategoryId === data.id).length + 1,
                        active: true,
                        content: '',
                      });
                      setIsEditingSubcategory(false);
                      setIsEditingEbook(true);
                    } else {
                      await updateSubcategory(data.id!, data);
                      toast.success('Subcategoria atualizada!');
                    }
                  } catch (err: any) {
                    toast.error('Erro ao salvar subcategoria: ' + (err?.message || 'Tente novamente'));
                  }
                }}
                className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg mt-4"
              >
                Salvar Subcategoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ebook Editor Modal */}
      {isEditingEbook && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Biblioteca - {categories.find(c => c.id === editingEbook.categoryId)?.name || "Categoria"} - {ebooks.find(e => e.id === editingEbook.id) ? "🛠️" : "🆕"} E-book</h3>
              <button onClick={() => setIsEditingEbook(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Título</label>
                <input
                  type="text"
                  value={editingEbook.title}
                  onChange={e => setEditingEbook({...editingEbook, title: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Categoria</label>
                  <select
                    value={editingEbook.categoryId || categories[0]?.id || ''}
                    onChange={e => setEditingEbook({ ...editingEbook, categoryId: e.target.value, subcategoryId: undefined })}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Subcategoria</label>
                  <select
                    value={editingEbook.subcategoryId || ''}
                    onChange={e => {
                      const sub = subcategories.find(s => s.id === e.target.value);
                      setEditingEbook({ ...editingEbook, subcategoryId: e.target.value, categoryId: sub?.categoryId ?? editingEbook.categoryId });
                    }}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                    disabled={!editingEbook.categoryId && !categories[0]?.id}
                  >
                    <option value="">Selecione...</option>
                    {subcategories
                      .filter(s => s.categoryId === (editingEbook.categoryId || categories[0]?.id))
                      .map(s => <option key={s.id} value={s.id}>{s.name}{!s.active ? ' (inativa)' : ''}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-gray-500 uppercase">Descrição <span className="text-gray-600 normal-case">(texto curto — aparece nos cards)</span></label>
                  <span className={`text-[10px] font-mono ${(editingEbook.description?.length || 0) > 140 ? 'text-red-400' : 'text-gray-600'}`}>{editingEbook.description?.length || 0}/160</span>
                </div>
                <textarea 
                  value={editingEbook.description} 
                  onChange={e => setEditingEbook({...editingEbook, description: e.target.value.slice(0, 160)})}
                  className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white h-16 resize-none"
                  placeholder="Resumo breve exibido nos cards da biblioteca..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Arquivo HTML (E-book)</label>
                <EbookFilePicker
                  value={editingEbook.downloadUrl || ''}
                  onChange={(path) => setEditingEbook({...editingEbook, downloadUrl: path})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Capa do E-book</label>
                <div className="flex items-center gap-3">
                  {editingEbook.coverImage && (
                    <img src={editingEbook.coverImage} alt="Capa" className="w-16 h-20 object-cover rounded border border-gray-700" />
                  )}
                  <select 
                    value={editingEbook.coverImage || ''}
                    onChange={e => setEditingEbook({...editingEbook, coverImage: e.target.value})}
                    className="flex-1 bg-black border border-gray-800 rounded-lg p-2 text-white"
                  >
                    <option value="">Selecione uma imagem...</option>
                    {availableImages.map(img => (
                      <option key={img} value={img}>{img.split('/').pop()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Conteúdo HTML</label>
                <textarea 
                  value={editingEbook.content} 
                  onChange={e => setEditingEbook({...editingEbook, content: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white h-40 font-mono text-xs"
                  placeholder="<p>Seu conteúdo aqui...</p>"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Drip (Dias)</label>
                  <input 
                    type="number" 
                    value={editingEbook.dripDays || 0} 
                    onChange={e => setEditingEbook({...editingEbook, dripDays: parseInt(e.target.value)})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Ordem</label>
                  <input 
                    type="number" 
                    value={editingEbook.order} 
                    onChange={e => setEditingEbook({...editingEbook, order: parseInt(e.target.value)})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <button 
                onClick={async () => {
                  try {
                    if (ebooks.find(e => e.id === editingEbook.id)) {
                      await updateEbook(editingEbook.id!, editingEbook);
                      toast.success('E-book atualizado com sucesso!');
                    } else {
                      await addEbook(editingEbook as Ebook);
                      toast.success('E-book criado com sucesso!');
                    }
                    setIsEditingEbook(false);
                  } catch (err: any) {
                    toast.error('Erro ao salvar: ' + (err?.message || 'Tente novamente'));
                  }
                }}
                className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg mt-4"
              >
                Salvar E-book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBonuses = () => (
    <div className="space-y-6">
      {/* Bonus Categories Section */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
            <Gift className="text-[#D4AF37]" size={18} /> Categorias de Bônus
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {showInactiveBonusCats ? (
              <button
                onClick={() => setShowInactiveBonusCats(false)}
                className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-600 bg-gray-700 text-white transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={13} /> Voltar
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowInactiveBonusCats(true)}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <EyeOff size={13} /> Desativadas
                </button>
                <button
                  onClick={() => {
                    setEditingBonusCat({ id: Math.random().toString(), name: '', description: '', order: bonusCategories.length + 1, active: true, dripDays: 0, isMandatory: false });
                    setIsEditingBonusCat(true);
                  }}
                  className="bg-[#D4AF37] text-black px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-[#B8962E] transition-colors text-xs"
                >
                  <Plus size={14} /> Nova
                </button>
              </>
            )}
          </div>
        </div>
        <div className="p-6">
          {!showInactiveBonusCats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bonusCategories.map(cat => (
                <div key={cat.id} className="bg-black rounded-lg border border-gray-800 overflow-hidden">
                  <div className="p-4 flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-bold">{cat.name}</h3>
                      <p className="text-gray-500 text-xs">{cat.description}</p>
                      <div className="flex gap-2 mt-2">
                        {cat.isMandatory && <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded">Obrigatória</span>}
                        {cat.dripDays ? <span className="bg-blue-500/20 text-blue-500 text-[10px] px-2 py-0.5 rounded">Drip: {cat.dripDays}d</span> : null}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingBonusCat(cat); setIsEditingBonusCat(true); }} className="text-gray-400 hover:text-white"><Edit size={16} /></button>
                      <button onClick={() => { deleteBonusCategory(cat.id); toast.success('Categoria desativada!'); }} title="Desativar">🔴</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 border-t border-gray-800">
                    <button
                      onClick={() => {
                        setEditingBonusItem({
                          id: Math.random().toString(),
                          title: '',
                          description: '',
                          bonusCategoryId: cat.id,
                          coverImage: '/img/capa.png',
                          order: bonusItems.filter(bi => bi.bonusCategoryId === cat.id).length + 1,
                          active: true,
                          content: ''
                        });
                        setIsEditingBonusItem(true);
                      }}
                      className="flex items-center justify-center gap-1 py-2 text-[11px] text-white font-semibold border-r border-gray-800 hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={11} /> Add Item
                    </button>
                    <button
                      onClick={() => { setListingBonusItemsForCat(cat.id); setShowInactiveBonusItemsModal(false); }}
                      className="flex items-center justify-center gap-1 py-2 text-[11px] text-gray-400 font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Listar Itens
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <InactiveBonusCategories
              onDelete={async (id) => {
                const token = localStorage.getItem('auth_token') || '';
                await fetch(`/api/bonus-categories/${id}/permanent`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                toast.success('Categoria excluída permanentemente!');
              }}
              onReactivated={() => refreshBonusCategories()}
            />
          )}
        </div>
      </div>

      {/* Bonus Category Editor Modal */}
      {isEditingBonusCat && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Bônus - {bonusCategories.find(c => c.id === editingBonusCat.id) ? "🛠️" : "🆕"} Categoria</h3>
              <button onClick={() => setIsEditingBonusCat(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Settings */}
              <div className="space-y-4">
                <h4 className="text-[#D4AF37] font-bold border-b border-gray-800 pb-2">Configurações da Categoria</h4>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Nome</label>
                  <input
                    type="text"
                    value={editingBonusCat.name || ''}
                    onChange={e => setEditingBonusCat({...editingBonusCat, name: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Descrição</label>
                  <textarea
                    value={editingBonusCat.description || ''}
                    onChange={e => setEditingBonusCat({...editingBonusCat, description: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white h-20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Ordem</label>
                    <input
                      type="number"
                      value={editingBonusCat.order || 0}
                      onChange={e => setEditingBonusCat({...editingBonusCat, order: parseInt(e.target.value)})}
                      className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Drip (Dias)</label>
                    <input
                      type="number"
                      value={editingBonusCat.dripDays || 0}
                      onChange={e => setEditingBonusCat({...editingBonusCat, dripDays: parseInt(e.target.value)})}
                      className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!editingBonusCat.isMandatory}
                    onChange={e => setEditingBonusCat({...editingBonusCat, isMandatory: e.target.checked})}
                    id="isBonusMandatory"
                  />
                  <label htmlFor="isBonusMandatory" className="text-sm text-gray-300">Liberado imediatamente para todos</label>
                </div>
                <button
                  onClick={() => {
                    if (bonusCategories.find(c => c.id === editingBonusCat.id)) {
                      updateBonusCategory(editingBonusCat.id!, editingBonusCat);
                      toast.success('Categoria atualizada!');
                    } else {
                      addBonusCategory(editingBonusCat as BonusCategory);
                      toast.success('Categoria criada!');
                    }
                    setIsEditingBonusCat(false);
                  }}
                  className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg mt-4"
                >
                  Salvar Categoria
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Listar Itens Modal */}
      {listingBonusItemsForCat && (() => {
        const cat = bonusCategories.find(c => c.id === listingBonusItemsForCat);
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-800 flex flex-wrap justify-between items-center gap-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
                  <Gift className="text-[#D4AF37]" size={18} /> Itens — {cat?.name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {showInactiveBonusItemsModal ? (
                    <button onClick={() => setShowInactiveBonusItemsModal(false)} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-600 bg-gray-700 text-white transition-colors flex items-center gap-1">
                      <ChevronLeft size={13} /> Voltar
                    </button>
                  ) : (
                    <button onClick={() => setShowInactiveBonusItemsModal(true)} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-colors flex items-center gap-1">
                      <EyeOff size={13} /> Desativados
                    </button>
                  )}
                  <button onClick={() => setListingBonusItemsForCat(null)} className="text-gray-400 hover:text-white ml-1"><X size={18} /></button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto">
                {!showInactiveBonusItemsModal ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bonusItems.filter(bi => bi.bonusCategoryId === listingBonusItemsForCat).length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-6 col-span-2">Nenhum item nesta categoria.</p>
                    ) : (
                      bonusItems.filter(bi => bi.bonusCategoryId === listingBonusItemsForCat)
                        .sort((a, b) => a.order - b.order)
                        .map(item => (
                          <div key={item.id} className="bg-black rounded-lg border border-gray-800 overflow-hidden">
                            <div className="p-4 flex justify-between items-start">
                              <div className="flex items-start gap-3 min-w-0">
                                <img src={item.coverImage || '/img/capa.png'} alt={item.title} className="w-10 h-12 object-cover rounded flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <h3 className="text-white font-bold">{item.title}</h3>
                                  <p className="text-gray-500 text-xs line-clamp-2 mt-0.5">{item.description}</p>
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    {item.dripDays ? <span className="bg-blue-500/20 text-blue-500 text-[10px] px-2 py-0.5 rounded">Drip: {item.dripDays}d</span> : null}
                                    <span className="bg-gray-800 text-gray-500 text-[10px] px-2 py-0.5 rounded">Ordem: {item.order}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => { setEditingBonusItem(item); setListingBonusItemsForCat(null); setIsEditingBonusItem(true); }} className="text-gray-400 hover:text-white"><Edit size={16} /></button>
                                <button onClick={() => { deleteBonusItem2(item.id); toast.success('Item desativado!'); }} title="Desativar">🔴</button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                ) : (
                  <InactiveBonusItems
                    categoryId={listingBonusItemsForCat}
                    onDelete={async (id) => {
                      const token = localStorage.getItem('auth_token') || '';
                      await fetch(`/api/bonus-items/${id}/permanent`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                      toast.success('Item excluído permanentemente!');
                    }}
                    onReactivated={() => refreshBonusItems()}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bonus Item Editor Modal */}
      {isEditingBonusItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Bônus - {bonusCategories.find(c => c.id === editingBonusItem.bonusCategoryId)?.name || "Categoria"} - {bonusItems.find(i => i.id === editingBonusItem.id) ? "🛠️" : "🆕"} Item</h3>
              <button onClick={() => setIsEditingBonusItem(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Título</label>
                  <input
                    type="text"
                    value={editingBonusItem.title || ''}
                    onChange={e => setEditingBonusItem({...editingBonusItem, title: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Categoria</label>
                  <select
                    value={editingBonusItem.bonusCategoryId || ''}
                    onChange={e => setEditingBonusItem({...editingBonusItem, bonusCategoryId: e.target.value})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                  >
                    {bonusCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Descrição</label>
                <textarea
                  value={editingBonusItem.description || ''}
                  onChange={e => setEditingBonusItem({...editingBonusItem, description: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white h-20"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Arquivo HTML (E-book)</label>
                <EbookFilePicker
                  value={editingBonusItem.downloadUrl || ''}
                  onChange={(path) => setEditingBonusItem({...editingBonusItem, downloadUrl: path})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Capa do Item</label>
                <div className="flex items-center gap-3">
                  {editingBonusItem.coverImage && (
                    <img src={editingBonusItem.coverImage} alt="Capa" className="w-16 h-20 object-cover rounded border border-gray-700" />
                  )}
                  <select
                    value={editingBonusItem.coverImage || ''}
                    onChange={e => setEditingBonusItem({...editingBonusItem, coverImage: e.target.value})}
                    className="flex-1 bg-black border border-gray-800 rounded-lg p-2 text-white"
                  >
                    <option value="">Selecione uma imagem...</option>
                    {availableImages.map(img => (
                      <option key={img} value={img}>{img.split('/').pop()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Conteúdo HTML</label>
                <textarea
                  value={editingBonusItem.content || ''}
                  onChange={e => setEditingBonusItem({...editingBonusItem, content: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white h-40 font-mono text-xs"
                  placeholder="<p>Seu conteúdo aqui...</p>"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Drip (Dias)</label>
                  <input
                    type="number"
                    value={editingBonusItem.dripDays || 0}
                    onChange={e => setEditingBonusItem({...editingBonusItem, dripDays: parseInt(e.target.value)})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Ordem</label>
                  <input
                    type="number"
                    value={editingBonusItem.order || 1}
                    onChange={e => setEditingBonusItem({...editingBonusItem, order: parseInt(e.target.value)})}
                    className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    if (bonusItems.find(i => i.id === editingBonusItem.id)) {
                      await updateBonusItem2(editingBonusItem.id!, editingBonusItem);
                      toast.success('Item atualizado!');
                    } else {
                      await addBonusItem2(editingBonusItem as BonusItem_2);
                      toast.success('Item criado!');
                    }
                    setIsEditingBonusItem(false);
                  } catch (err: any) {
                    toast.error('Erro ao salvar: ' + (err?.message || 'Tente novamente'));
                  }
                }}
                className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg mt-4"
              >
                Salvar Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const roleBadgeColor = (role: string) => ({ VISITANTE: 'bg-gray-700 text-gray-300', MEMBRO: 'bg-blue-900/50 text-blue-300', VIP: 'bg-yellow-900/50 text-yellow-300', REVENDA: 'bg-purple-900/50 text-purple-300', ADMIN: 'bg-red-900/50 text-red-300' }[role] || 'bg-gray-700 text-gray-300');
  const roleLabel = (role: string) => ({ VISITANTE: 'Visitante', MEMBRO: 'Membro', VIP: 'Membro VIP', REVENDA: 'Revenda', ADMIN: 'Admin' }[role] || role);

  const renderAllMembers = () => {
    const ROLE_ORDER: Record<string, number> = { ADMIN: 0, VIP: 1, REVENDA: 2, MEMBRO: 3, VISITANTE: 4 };

    const filtered = users
      .filter(u => {
        const matchRole = allMembersFilterRole === 'ALL' || u.role === allMembersFilterRole;
        const q = allMembersSearch.toLowerCase();
        const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        return matchRole && matchSearch;
      })
      .sort((a, b) => {
        if (allMembersSortBy === 'hierarchy') return (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9);
        if (allMembersSortBy === 'email') return a.email.localeCompare(b.email);
        return a.name.localeCompare(b.name);
      });

    const ROLES = [
      { value: 'ALL',       label: 'Todos' },
      { value: 'MEMBRO',    label: 'Usuários' },
      { value: 'VIP',       label: 'Membros VIP' },
      { value: 'VISITANTE', label: 'Visitantes' },
      { value: 'REVENDA',   label: 'Revendedores' },
      { value: 'ADMIN',     label: 'Administradores' },
    ];

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-[#D4AF37]" /> Todos os Membros
          </h2>
          <span className="text-xs text-gray-500 bg-gray-900 border border-gray-800 px-3 py-1 rounded-full">
            {filtered.length} de {users.length} membros
          </span>
        </div>

        {/* Controles */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Busca */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={allMembersSearch}
              onChange={e => setAllMembersSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full bg-black border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          {/* Filtro por hierarquia */}
          <div className="relative">
            <select
              value={allMembersFilterRole}
              onChange={e => setAllMembersFilterRole(e.target.value)}
              className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white appearance-none pr-8 focus:outline-none focus:border-[#D4AF37]/50 w-full sm:w-auto"
            >
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <ChevronLeft size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 -rotate-90 pointer-events-none" />
          </div>
        </div>

        {/* Lista */}
        {renderUserCards(filtered, 'Nenhum membro encontrado.')}
      </div>
    );
  };

  const renderUserCards = (list: typeof users, emptyMsg: string) => (
    list.length === 0 ? (
      <div className="text-center py-12 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">{emptyMsg}</div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {list.map(user => (
          <div key={user.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-[#D4AF37]/30 transition-colors">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-black text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} title={user.status === 'active' ? 'Ativo' : 'Bloqueado'} />
            </div>
            <p className="text-white font-bold text-xs leading-tight w-full truncate">{user.name}</p>
            <p className="text-gray-500 text-[10px] w-full truncate">{user.email}</p>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${roleBadgeColor(user.role)}`}>{roleLabel(user.role)}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${user.status === 'active' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{user.status === 'active' ? 'Ativo' : 'Bloqueado'}</span>
            </div>
            <select
              value={user.role}
              onChange={(e) => { const newRole = e.target.value as UserRole; if (newRole !== user.role) { updateUserRole(user.id, newRole); toast.success('Salvo automaticamente!'); } }}
              className="bg-black border border-gray-700 rounded px-1 py-1 text-[10px] text-white w-full"
            >
              <option value="VISITANTE">Visitante</option>
              <option value="MEMBRO">Membro</option>
              <option value="VIP">Membro VIP</option>
              <option value="REVENDA">Revenda</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <div className="flex gap-2 mt-1 w-full justify-center">
              <button onClick={() => setEditingUser(user)} className="p-1.5 rounded-lg border bg-yellow-900/20 text-yellow-400 border-yellow-900/30 hover:bg-yellow-900/40 transition-colors" title="Editar Usuário"><Edit size={13} /></button>
              <button onClick={() => { toggleUserStatus(user.id); toast.success('Status atualizado!'); }} className={`p-1.5 rounded-lg border transition-colors ${user.status === 'active' ? 'bg-red-900/20 text-red-400 border-red-900/30 hover:bg-red-900/40' : 'bg-green-900/20 text-green-400 border-green-900/30 hover:bg-green-900/40'}`} title={user.status === 'active' ? 'Bloquear' : 'Desbloquear'}><Lock size={13} /></button>
              <button onClick={async () => { try { await fetch(`/api/users/${user.id}/reset-password`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } }); toast.success('Senha redefinida para 123456'); } catch { toast.error('Erro ao redefinir senha'); } }} className="p-1.5 rounded-lg border bg-blue-900/20 text-blue-400 border-blue-900/30 hover:bg-blue-900/40 transition-colors" title="Resetar Senha"><Key size={13} /></button>
              <button onClick={async () => { if (!confirm(`Excluir ${user.name}? Esta ação não pode ser desfeita.`)) return; try { await fetch(`/api/users/${user.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } }); toast.success('Usuário excluído!'); setTimeout(() => window.location.reload(), 800); } catch { toast.error('Erro ao excluir usuário'); } }} className="p-1.5 rounded-lg border bg-gray-800 text-gray-500 border-gray-700 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/30 transition-colors" title="Excluir Usuário"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    )
  );

  const renderUsers = () => {
    const membroUsers = users.filter(u => u.role === 'MEMBRO');
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="text-[#D4AF37]" /> Usuários</h2>
          <span className="text-xs text-gray-500 bg-gray-900 border border-gray-800 px-3 py-1 rounded-full">{membroUsers.length} usuário{membroUsers.length !== 1 ? 's' : ''}</span>
        </div>
        {renderUserCards(membroUsers, 'Nenhum usuário cadastrado.')}
      </div>
    );
  };

  const renderVipUsers = () => {
    const vipUsers = users.filter(u => u.role === 'VIP');
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Key className="text-[#D4AF37]" /> Membros VIP</h2>
          <span className="text-xs text-gray-500 bg-gray-900 border border-gray-800 px-3 py-1 rounded-full">{vipUsers.length} membro{vipUsers.length !== 1 ? 's' : ''}</span>
        </div>
        {renderUserCards(vipUsers, 'Nenhum membro VIP cadastrado.')}
      </div>
    );
  };

  const renderVisitantes = () => {
    const visitanteUsers = users.filter(u => u.role === 'VISITANTE');
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><EyeOff className="text-[#D4AF37]" /> Visitantes</h2>
          <span className="text-xs text-gray-500 bg-gray-900 border border-gray-800 px-3 py-1 rounded-full">{visitanteUsers.length} visitante{visitanteUsers.length !== 1 ? 's' : ''}</span>
        </div>
        {renderUserCards(visitanteUsers, 'Nenhum visitante cadastrado.')}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Settings className="text-[#D4AF37]" /> Configurações Globais
      </h2>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nome da Aplicação</label>
          <input
            type="text"
            value={localAppName}
            onChange={e => setLocalAppName(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded p-2 text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">URL do Logo</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={localLogoUrl}
              onChange={e => setLocalLogoUrl(e.target.value)}
              className="flex-1 bg-black border border-gray-700 rounded p-2 text-white"
              placeholder="https://..."
            />
            <div className="relative">
              <FileUpload
                onUploadComplete={(url) => { setLocalLogoUrl(url); updateGlobalSettings({ logoUrl: url }); }}
                folder="settings"
                accept="image/*"
                label=""
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">URL do Vídeo/Iframe da Hero</label>
          <input
            type="text"
            value={localHeroVideoUrl}
            onChange={e => setLocalHeroVideoUrl(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded p-2 text-white"
            placeholder="URL do YouTube ou código <iframe>..."
          />
        </div>
        <button onClick={async () => { await updateGlobalSettings({ appName: localAppName, logoUrl: localLogoUrl, heroVideoUrl: localHeroVideoUrl } as any); toast.success('Configurações salvas!'); }} className="w-full bg-[#D4AF37] text-black font-bold py-2 rounded hover:bg-[#b5952f] mt-4">
          Salvar Configurações
        </button>
      </div>
    </div>
  );

  const renderSettingsCheckout = () => (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <CreditCard className="text-[#D4AF37]" /> Integrações de Checkout
      </h2>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Stripe Secret Key</label>
          <input
            type="password"
            value={globalSettings.stripeKey}
            onChange={e => updateGlobalSettings({ stripeKey: e.target.value })}
            placeholder="sk_live_..."
            className="w-full bg-black border border-gray-700 rounded p-2 text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Facebook Pixel ID</label>
          <input
            type="text"
            value={globalSettings.pixelId}
            onChange={e => updateGlobalSettings({ pixelId: e.target.value })}
            placeholder="1234567890"
            className="w-full bg-black border border-gray-700 rounded p-2 text-white"
          />
        </div>

        {/* ── Chave PIX Global ── */}
        <div className="border-t border-gray-700 pt-4">
          <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-3">Pagamento via PIX</p>
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Tipo da Chave</label>
              <select
                value={localPixKeyType}
                onChange={e => handlePixKeyTypeChange(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm"
              >
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone</option>
                <option value="random">Chave Aleatória</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Chave PIX</label>
            <input
              {...pixKeyInputProps()}
              value={localPixKey}
              onChange={e => handlePixKeyChange(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded p-2 text-white font-mono text-sm"
            />
            <p className="text-[10px] text-gray-600 mt-1">Esta chave será exibida no checkout para os compradores.</p>
          </div>
        </div>

        <button
          onClick={async () => {
            await updateGlobalSettings({ pixKey: localPixKey, pixKeyType: localPixKeyType });
            toast.success('Integrações salvas!');
          }}
          className="w-full bg-[#D4AF37] text-black font-bold py-2 rounded hover:bg-[#b5952f] mt-4"
        >
          Salvar Integrações
        </button>
      </div>
    </div>
  );

  const renderSettingsSupport = () => (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageSquare className="text-[#D4AF37]" /> Canais de Suporte
      </h2>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-xs text-gray-500 mb-1">WhatsApp (apenas números)</label>
          <input
            type="text"
            value={localSupportWhatsapp}
            onChange={e => setLocalSupportWhatsapp(e.target.value)}
            placeholder="5511999999999"
            className="w-full bg-black border border-gray-700 rounded p-2 text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">E-mail de Suporte</label>
          <input
            type="email"
            value={localSupportEmail}
            onChange={e => setLocalSupportEmail(e.target.value)}
            placeholder="suporte@exemplo.com"
            className="w-full bg-black border border-gray-700 rounded p-2 text-white"
          />
        </div>
        <button onClick={async () => { await updateGlobalSettings({ supportWhatsapp: localSupportWhatsapp, supportEmail: localSupportEmail } as any); toast.success('Canais salvos!'); }} className="w-full bg-[#D4AF37] text-black font-bold py-2 rounded hover:bg-[#b5952f] mt-4">
          Salvar Canais
        </button>
      </div>
    </div>
  );

  const renderSettingsTheme = () => (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Palette className="text-[#D4AF37]" /> Tema
      </h2>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Cor Primária (Hex)</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={localPrimaryColor}
              onChange={e => setLocalPrimaryColor(e.target.value)}
              className="h-10 w-10 rounded cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={localPrimaryColor}
              onChange={e => setLocalPrimaryColor(e.target.value)}
              className="flex-1 bg-black border border-gray-700 rounded p-2 text-white uppercase"
            />
          </div>
        </div>
        <button onClick={async () => { await updateGlobalSettings({ primaryColor: localPrimaryColor }); toast.success('Tema salvo!'); }} className="w-full bg-[#D4AF37] text-black font-bold py-2 rounded hover:bg-[#b5952f] mt-4">
          Salvar Tema
        </button>
      </div>
    </div>
  );

  const renderSettingsLegal = () => (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <FileText className="text-[#D4AF37]" /> Textos Legais
      </h2>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Termos de Uso e Privacidade</label>
          <textarea
            value={localTermsOfUse}
            onChange={e => setLocalTermsOfUse(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded p-2 text-white h-48"
            placeholder="Cole aqui os termos de uso..."
          />
        </div>
        <button onClick={async () => { await updateGlobalSettings({ termsOfUse: localTermsOfUse } as any); toast.success('Textos salvos!'); }} className="w-full bg-[#D4AF37] text-black font-bold py-2 rounded hover:bg-[#b5952f] mt-4">
          Salvar Textos
        </button>
      </div>
    </div>
  );

  const renderWithdrawals = () => (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <DollarSign className="text-[#D4AF37]" /> Solicitações de Saque
        </h2>
      </div>
      <div className="p-6">
        {withdrawals.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhuma solicitação de saque no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(withdrawal => {
              const user = users.find(u => u.id === withdrawal.userId);
              return (
                <div key={withdrawal.id} className="bg-black p-4 rounded-lg border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">{user?.name || 'Usuário Desconhecido'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                        withdrawal.status === 'approved' ? 'bg-green-900/20 text-green-400' :
                        withdrawal.status === 'rejected' ? 'bg-red-900/20 text-red-400' :
                        'bg-yellow-900/20 text-yellow-400'
                      }`}>
                        {withdrawal.status === 'approved' ? 'Aprovado' : withdrawal.status === 'rejected' ? 'Rejeitado' : 'Solicitado'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{new Date(withdrawal.date).toLocaleString()}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <p className="text-gray-400">Valor: <span className="text-white font-bold">R$ {withdrawal.amount.toFixed(2)}</span></p>
                      <p className="text-gray-400">Chave Pix: <span className="text-white font-mono">{withdrawal.pixKey}</span></p>
                    </div>
                  </div>
                  
                  {withdrawal.status === 'requested' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { updateWithdrawalStatus(withdrawal.id, 'approved'); toast.success('Saque aprovado!'); }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold text-xs flex items-center gap-1"
                      >
                        <Check size={14} /> Aprovar
                      </button>
                      <button 
                        onClick={() => { updateWithdrawalStatus(withdrawal.id, 'rejected'); toast.error('Saque rejeitado!'); }}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold text-xs flex items-center gap-1"
                      >
                        <X size={14} /> Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">

      {/* ── Comprovantes Pendentes ── */}
      {pendingProofs.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-yellow-500/30 overflow-hidden">
          <div className="p-4 border-b border-yellow-500/20 flex items-center justify-between bg-yellow-500/5">
            <h2 className="text-white font-bold flex items-center gap-2">
              <AlertCircle size={18} className="text-yellow-400" />
              Comprovantes Aguardando Revisão
            </h2>
            <span className="bg-yellow-500 text-black text-xs font-black px-2 py-0.5 rounded-full">
              {pendingProofs.length}
            </span>
          </div>
          <div className="divide-y divide-gray-800">
            {pendingProofs.map(proof => (
              <div key={proof.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-gray-800/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{proof.user_name || 'Usuário'}</p>
                  <p className="text-gray-500 text-xs truncate">{proof.user_email}</p>
                  <p className="text-gray-600 text-[10px] mt-0.5">
                    {proof.product_name || proof.plan_name} · R$ {parseFloat(proof.total_amount).toFixed(2)} · {new Date(proof.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => { setProofModal(proof); setRejectionReason(''); }}
                  className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-500/30 transition-colors flex-shrink-0"
                >
                  <ZoomIn size={13} /> Revisar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resellers Overview */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="text-[#D4AF37]" />
          Top Revendedores
        </h2>
        <div className="space-y-4">
          {resellers.slice(0, 5).map(reseller => (
            <div key={reseller.id} className="bg-black p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <p className="text-white font-bold text-sm">{reseller.name}</p>
                <p className="text-[10px] text-gray-500">{reseller.email}</p>
              </div>
              <div className="text-right">
                <p className="text-[#D4AF37] font-bold text-sm">R$ {reseller.walletBalance?.toFixed(2)}</p>
                <p className="text-[10px] text-gray-500">Comissão</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSocialProof = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Bots Manager */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <MessageSquare className="text-[#D4AF37]" />
          Exército de Bots
        </h2>
        
        <div className="flex gap-2 mb-6">
          <input 
            type="text" 
            placeholder="Nome do Bot" 
            className="flex-1 bg-black border border-gray-700 rounded p-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
            value={newBotName}
            onChange={(e) => setNewBotName(e.target.value)}
          />
          <button 
            onClick={handleCreateBot}
            className="bg-[#D4AF37] text-black px-3 py-1.5 rounded text-sm font-bold hover:bg-[#b5952f] flex items-center gap-1"
          >
            <Plus size={16} /> Criar
          </button>
        </div>

        <div className="space-y-3">
          {bots.map(bot => (
            <div key={bot.id} className="bg-black p-3 rounded-lg border border-gray-800 flex items-center gap-3">
              <img src={bot.avatar} alt={bot.name} className="w-8 h-8 rounded-full" />
              <div>
                <p className="text-white font-bold text-sm">{bot.name}</p>
                <p className="text-[10px] text-gray-500">{bot.role}</p>
              </div>
              <div className={`ml-auto w-2 h-2 rounded-full ${bot.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Timelines Manager */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Play className="text-[#D4AF37]" />
          Timelines de Conversão
        </h2>

        <div className="flex gap-2 mb-6">
          <input 
            type="text" 
            placeholder="Nome da Timeline" 
            className="flex-1 bg-black border border-gray-700 rounded p-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
            value={newTimelineName}
            onChange={(e) => setNewTimelineName(e.target.value)}
          />
          <button 
            onClick={handleCreateTimeline}
            className="bg-[#D4AF37] text-black px-3 py-1.5 rounded text-sm font-bold hover:bg-[#b5952f] flex items-center gap-1"
          >
            <Plus size={16} /> Criar
          </button>
        </div>

        <div className="space-y-3">
          {timelines.map(timeline => (
            <div key={timeline.id} className="bg-black p-3 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-sm">{timeline.name}</span>
                <button 
                  onClick={() => { 
                    toggleTimeline(timeline.id); 
                    toast.success(timeline.isActive ? 'Cronograma pausado!' : 'Cronograma ativado!'); 
                  }}
                  className={`p-1 rounded ${timeline.isActive ? 'text-green-500 bg-green-900/20' : 'text-gray-500 bg-gray-800'}`}
                >
                  {timeline.isActive ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-500">Rota: {timeline.pageRoute}</p>
              <div className="mt-2 flex gap-1">
                {timeline.blocks.map((_, idx) => (
                  <div key={idx} className="w-1.5 h-1.5 bg-gray-700 rounded-full" />
                ))}
                <span className="text-[10px] text-gray-600 ml-1">{timeline.blocks.length} blocos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Modal Revisão de Comprovante ── */}
      {proofModal && (
        <div className="fixed inset-0 bg-black/90 z-[80] flex items-center justify-center p-4" onClick={() => setProofModal(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div>
                <h3 className="text-white font-bold text-lg flex items-center gap-2"><Eye size={18} className="text-yellow-400" /> Comprovante</h3>
                <p className="text-gray-500 text-xs mt-0.5">{proofModal.user_name} · {proofModal.user_email}</p>
              </div>
              <button onClick={() => setProofModal(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-black rounded-xl border border-gray-700 p-3 space-y-1 text-sm">
                <p className="text-gray-400">Produto: <span className="text-white font-bold">{proofModal.product_name || proofModal.plan_name}</span></p>
                <p className="text-gray-400">Valor: <span className="text-[#D4AF37] font-bold font-mono">R$ {parseFloat(proofModal.total_amount).toFixed(2)}</span></p>
                <p className="text-gray-400">Data: <span className="text-white">{new Date(proofModal.created_at).toLocaleString('pt-BR')}</span></p>
              </div>

              {proofModal.proof_url && (
                proofModal.proof_url.toLowerCase().endsWith('.pdf') ? (
                  <a href={proofModal.proof_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-blue-900/20 text-blue-400 border border-blue-900/30 py-3 rounded-xl text-sm font-bold hover:bg-blue-900/30 transition-colors">
                    <Eye size={16} /> Abrir PDF
                  </a>
                ) : (
                  <a href={proofModal.proof_url} target="_blank" rel="noopener noreferrer">
                    <img src={proofModal.proof_url} alt="Comprovante" className="w-full rounded-xl border border-gray-700 object-contain max-h-64" />
                  </a>
                )
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setRejectConfirmModal(proofModal.id); setRejectObservation(''); }}
                  disabled={proofAction === 'loading'}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-900/30 text-red-400 border border-red-900/50 py-3 rounded-xl text-sm font-bold hover:bg-red-900/50 transition-colors disabled:opacity-50"
                >
                  <X size={16} /> Rejeitar
                </button>
                <button
                  onClick={() => handleProofAction(proofModal.id, 'approved')}
                  disabled={proofAction === 'loading'}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-900/30 text-green-400 border border-green-900/50 py-3 rounded-xl text-sm font-bold hover:bg-green-900/50 transition-colors disabled:opacity-50"
                >
                  <Check size={16} /> Aprovar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação de Rejeição */}
      {rejectConfirmModal && (
        <div className="fixed inset-0 bg-black/90 z-[90] flex items-center justify-center p-4" onClick={() => setRejectConfirmModal(null)}>
          <div className="bg-gray-900 border border-red-900/50 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <X size={18} className="text-red-400" /> Rejeitar Comprovante
              </h3>
              <button onClick={() => setRejectConfirmModal(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-gray-400 text-sm">Deseja adicionar uma mensagem de observação para o membro?</p>
              <textarea
                value={rejectObservation}
                onChange={e => setRejectObservation(e.target.value)}
                placeholder="Ex: Comprovante ilegível, valor incorreto, aguardamos novo envio..."
                className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white text-sm h-24 resize-none focus:outline-none focus:border-red-700/50 placeholder-gray-600"
              />
              <p className="text-gray-600 text-xs">Opcional — se não preencher, o membro receberá apenas a notificação padrão de rejeição.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectConfirmModal(null)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 border border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleProofAction(rejectConfirmModal, 'rejected', rejectObservation.trim() || undefined)}
                  disabled={proofAction === 'loading'}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-900/30 text-red-400 border border-red-900/50 py-3 rounded-xl text-sm font-bold hover:bg-red-900/50 transition-colors disabled:opacity-50"
                >
                  <X size={16} /> Confirmar Rejeição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className="bg-black overflow-x-hidden overflow-y-hidden" style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* Modal Editar Usuário */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg flex items-center gap-2"><Edit size={18} className="text-[#D4AF37]" /> Editar Usuário</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nome</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">E-mail</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nova Senha (deixe vazio para não alterar)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  onChange={e => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Role</label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="VISITANTE">Visitante</option>
                  <option value="MEMBRO">Membro</option>
                  <option value="VIP">Membro VIP</option>
                  <option value="REVENDA">Revenda</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditingUser(null)} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm transition-colors">Cancelar</button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('auth_token') || '';
                    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
                    const original = users.find(u => u.id === editingUser.id);
                    // Salva nome e e-mail
                    await fetch(`/api/users/${editingUser.id}`, { method: 'PUT', headers, body: JSON.stringify({ name: editingUser.name, email: editingUser.email }) });
                    // Atualiza role se mudou
                    if (editingUser.role !== original?.role) {
                      await fetch(`/api/users/${editingUser.id}/role`, { method: 'PATCH', headers, body: JSON.stringify({ role: editingUser.role }) });
                    }
                    // Atualiza senha se preenchida
                    if (editingUser.newPassword) {
                      await fetch(`/api/users/${editingUser.id}/password`, { method: 'PATCH', headers, body: JSON.stringify({ password: editingUser.newPassword }) });
                    }
                    toast.success('Usuário atualizado!');
                    setEditingUser(null);
                    localStorage.setItem('admin_active_tab', 'users');
                    setTimeout(() => window.location.reload(), 600);
                  } catch { toast.error('Erro ao salvar alterações'); }
                }}
                className="flex-1 py-2 rounded-lg bg-[#D4AF37] text-black font-bold text-sm hover:bg-[#b5952f] transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      <DashboardHeader title="Centro de Comando" icon={<Shield className="text-[#D4AF37]" />} onTabChange={(tab) => setActiveTab(tab as AdminTab)} activeTab={activeTab}>
        <button
          onClick={() => setIsToolsModalOpen(true)}
          className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-[#D4AF37] transition-colors"
          title="Ferramentas"
        >
          <Wrench size={20} />
        </button>
      </DashboardHeader>
      
      <ToolsModal isOpen={isToolsModalOpen} onClose={() => setIsToolsModalOpen(false)} />

      <div className="flex-1 overflow-y-auto pt-20 px-4 pb-0">
        <div className="container mx-auto max-w-7xl">

          {/* Content Area */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'library' && renderLibrary()}
            {activeTab === 'social_proof' && renderSocialProof()}
            {activeTab === 'all_members' && renderAllMembers()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'vip_users' && renderVipUsers()}
            {activeTab === 'visitantes' && renderVisitantes()}
            {activeTab === 'withdrawals' && renderWithdrawals()}
            {activeTab === 'affiliates' && renderAffiliates()}
            {activeTab === 'plans' && <PlansManager />}
            {activeTab === 'products' && (
              <>
                {isEditingProduct && !!editingProduct.id && renderProductEditor()}
                <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
                  <div className="flex justify-between items-center mb-8">
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Box className="text-[#D4AF37]" />
                        Catálogo de Produtos
                      </h2>
                      <p className="text-gray-400 text-sm mt-1">Gerencie seus produtos, preços e entregáveis.</p>
                    </div>
                    <button 
                      onClick={handleNewProduct}
                      className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#b5952f] flex items-center gap-2 text-sm"
                    >
                      <Plus size={18} /> Novo Produto
                    </button>
                  </div>

                  <div className="flex overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', overscrollBehaviorX: 'contain' }}>
                    {products.map(product => (
                      <div key={product.id} className="bg-black rounded-lg border border-gray-800 overflow-hidden flex-shrink-0 snap-start w-full" style={{ scrollSnapStop: 'always' }}>
                        <div className="relative w-full overflow-hidden" style={{aspectRatio: '3/4'}}>
                          <img src={product.coverImage || product.image || '/img/capa.png'} alt={product.name} className="w-full h-full object-cover object-center" />
                          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${product.active ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                            {product.active ? 'Ativo' : 'Inativo'}
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="text-white font-bold text-xs truncate">{product.name}</h3>
                          <p className="text-gray-500 text-[10px] line-clamp-2 mt-0.5">{product.description || product.slug}</p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            <span className="text-[#D4AF37] font-bold text-xs">R$ {product.price.toFixed(2)}</span>
                            {product.dripEnabled ? <span className="bg-blue-500/20 text-blue-500 text-[10px] px-1.5 py-0.5 rounded">Drip</span> : null}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 border-t border-gray-800">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="flex items-center justify-center gap-1 py-2 text-[10px] text-white font-semibold border-r border-gray-800 hover:bg-gray-800 transition-colors"
                          >
                            <Edit size={10} /> Editar
                          </button>
                          <button
                            onClick={() => { if (!window.confirm('Excluir este produto?')) return; deleteProduct(product.id); toast.success('Produto excluído!'); }}
                            className="flex items-center justify-center gap-1 py-2 text-[10px] text-red-400 font-semibold hover:bg-gray-800 transition-colors"
                          >
                            <Trash2 size={10} /> Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {activeTab === 'bonuses' && renderBonuses()}
                        {activeTab === 'affiliates' && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Users className="text-[#D4AF37]" />
                  Gestão de Revendedores
                </h2>

                <div className="space-y-3">
                  {resellers.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">Nenhum revendedor cadastrado.</p>
                  ) : (
                    resellers.map(reseller => (
                      <div key={reseller.id} className="bg-black p-4 rounded-lg border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold">{reseller.name}</span>
                            <span className="bg-purple-900/50 text-purple-200 text-[10px] px-2 py-0.5 rounded border border-purple-800">
                              {reseller.referralCode}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{reseller.email}</p>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Saldo</p>
                            <span className="text-green-400 font-bold font-mono">R$ {reseller.walletBalance?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Indicados</p>
                            <span className="text-white font-bold">{users.filter(u => u.referredBy === reseller.id).length}</span>
                          </div>
                          <button className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded transition-colors">
                            Detalhes
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'settings_checkout' && renderSettingsCheckout()}
            {activeTab === 'settings_support' && renderSettingsSupport()}
            {activeTab === 'settings_theme' && renderSettingsTheme()}
            {activeTab === 'settings_legal' && renderSettingsLegal()}
          </motion.div>
        </div>
        <Footer />
      </div>
    </div>
    </>
  );
};
