import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const API = '/api';
async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem('auth_token') || '';
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...(options?.headers || {}) },
  });
  if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); throw new Error(e.error || res.statusText); }
  return res.json();
}
import { PricingPlan } from '../types';
import { Edit, Trash2, Plus, X, EyeOff, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Planos desativados ────────────────────────────────────────────────────────
const InactivePlans: React.FC<{
  onDelete: (id: string) => Promise<void>;
  onReactivated: () => void;
  refreshKey?: number;
}> = ({ onDelete, onReactivated, refreshKey = 0 }) => {
  const [inactive, setInactive] = React.useState<any[]>([]);
  const [loading, setLoading]   = React.useState(true);

  const [fetchError, setFetchError] = React.useState('');

  const fetchInactive = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await apiFetch('/plans/inactive');
      setInactive(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setFetchError(e.message || 'Erro ao carregar');
      setInactive([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchInactive(); }, [refreshKey]);

  const reactivate = async (plan: any) => {
    try {
      await apiFetch(`/plans/${plan.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...plan, active: 1, features: plan.features || [] }),
      });
      setInactive(p => p.filter(x => x.id !== plan.id));
      onReactivated();
      toast.success('Plano reativado!');
    } catch (e: any) { toast.error('Erro ao reativar: ' + e.message); }
  };

  if (loading) return <p className="text-gray-500 text-sm text-center py-6">Carregando...</p>;
  if (fetchError) return <p className="text-red-400 text-sm text-center py-6">{fetchError}</p>;
  if (inactive.length === 0) return <p className="text-gray-500 text-sm text-center py-6">Nenhum plano desativado.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {inactive.map((plan: any) => (
        <div key={plan.id} className="bg-black rounded-lg border border-gray-700 overflow-hidden opacity-60">
          <div className="p-4">
            <h3 className="text-gray-400 font-bold">{plan.name}</h3>
            <div className="text-lg font-bold text-gray-500 mt-1">
              R$ {Number(plan.price).toFixed(2)} <span className="text-xs font-normal">/{plan.period}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-gray-800">
            <button
              onClick={() => reactivate(plan)}
              className="flex items-center justify-center gap-1 py-2 text-[11px] text-green-400 font-semibold border-r border-gray-800 hover:bg-gray-800 transition-colors"
            >
              🟢 Reativar
            </button>
            <button
              onClick={async () => {
                if (!window.confirm('Deletar permanentemente? Esta ação não pode ser desfeita.')) return;
                try {
                  await onDelete(plan.id);
                  setInactive(p => p.filter(x => x.id !== plan.id));
                } catch { toast.error('Erro ao excluir.'); }
              }}
              className="flex items-center justify-center gap-1 py-2 text-[11px] text-red-400 font-semibold hover:bg-gray-800 transition-colors"
            >
              <Trash2 size={11} /> Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── PlansManager principal ────────────────────────────────────────────────────
export const PlansManager: React.FC = () => {
  const { plans, addPlan, updatePlan, deletePlan, refreshPlans } = useData();
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [isAdding, setIsAdding]     = useState(false);
  const [formData, setFormData]     = useState<Partial<PricingPlan>>({});
  const [saving, setSaving]         = useState(false);
  const [showInactive, setShowInactive]     = useState(false);
  const [inactiveRefreshKey, setInactiveRefreshKey] = useState(0);

  // Planos ativos vêm direto do contexto (já sincronizado com GET /api/plans?active=1)
  const activePlans = plans.filter(p => p.active !== false);

  const handleDeactivate = async (planId: string) => {
    if (!window.confirm('Desativar este plano? Ele ficará oculto para os visitantes.')) return;
    try {
      await deletePlan(planId);
      setInactiveRefreshKey(k => k + 1);
      toast.success('Plano desativado!');
    } catch { toast.error('Erro ao desativar.'); }
  };

  const handleEdit = (plan: PricingPlan) => {
    setEditingId(plan.id);
    setFormData({ ...plan });
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ name: '', price: 0, oldPrice: 0, period: 'único', features: [], isPopular: false, active: true });
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) { toast.error('Preencha o nome do plano.'); return; }
    setSaving(true);
    try {
      if (isAdding) {
        await addPlan(formData as PricingPlan);
        toast.success('Plano criado!');
      } else if (editingId) {
        await updatePlan(editingId, formData);
        toast.success('Plano atualizado!');
      }
      setEditingId(null); setIsAdding(false); setFormData({});
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + (err?.message || 'Tente novamente'));
    } finally { setSaving(false); }
  };

  const handleCancel = () => { setEditingId(null); setIsAdding(false); setFormData({}); };

  const handleFeatureChange = (index: number, value: string) => {
    const f = [...(formData.features || [])]; f[index] = value; setFormData({ ...formData, features: f });
  };

  const isOpen = !!(editingId || isAdding);

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-lg font-bold text-white shrink-0">Gerenciar Planos</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {showInactive ? (
              <button onClick={() => setShowInactive(false)} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-600 bg-gray-700 text-white transition-colors flex items-center gap-1">
                <ChevronLeft size={13} /> Voltar
              </button>
            ) : (
              <>
                <button onClick={() => setShowInactive(true)} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-colors flex items-center gap-1">
                  <EyeOff size={13} /> Desativados
                </button>
                <button onClick={handleAdd} className="bg-[#D4AF37] text-black px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-[#B8962E] transition-colors text-xs">
                  <Plus size={14} /> Novo
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showInactive ? (
            activePlans.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Nenhum plano ativo.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePlans.map(plan => (
                  <div key={plan.id} className={`bg-black rounded-lg border ${plan.isPopular ? 'border-[#D4AF37]' : 'border-gray-800'} overflow-hidden`}>
                    <div className="p-4 relative">
                      {plan.isPopular && (
                        <span className="absolute top-3 right-3 text-[#D4AF37] text-[10px] font-bold border border-[#D4AF37] px-2 py-0.5 rounded-full">POPULAR</span>
                      )}
                      <h3 className="text-white font-bold">{plan.name}</h3>
                      <div className="text-xl font-bold text-[#D4AF37] mt-1">
                        R$ {plan.price.toFixed(2)} <span className="text-xs text-gray-500 font-normal">/{plan.period}</span>
                      </div>
                      {plan.oldPrice > 0 && (
                        <p className="text-gray-600 text-xs line-through">R$ {plan.oldPrice.toFixed(2)}</p>
                      )}
                      <ul className="mt-3 space-y-1">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="text-xs text-gray-400 truncate">• {f}</li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-xs text-gray-500 italic">+ {plan.features.length - 3} benefícios</li>
                        )}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 border-t border-gray-800">
                      <button onClick={() => handleEdit(plan)} className="flex items-center justify-center gap-1 py-2 text-[11px] text-white font-semibold border-r border-gray-800 hover:bg-gray-800 transition-colors">
                        <Edit size={11} /> Editar
                      </button>
                      <button onClick={() => handleDeactivate(plan.id)} className="flex items-center justify-center gap-1 py-2 text-[11px] text-gray-400 font-semibold hover:bg-gray-800 transition-colors">
                        🔴 Desativar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <InactivePlans
              key={inactiveRefreshKey}
              refreshKey={inactiveRefreshKey}
              onDelete={async (id) => {
                const token = localStorage.getItem('auth_token') || '';
                const res = await fetch(`/api/plans/${id}/permanent`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) throw new Error();
                toast.success('Plano excluído permanentemente!');
              }}
              onReactivated={() => {
                setInactiveRefreshKey(k => k + 1);
                refreshPlans();
              }}
            />
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{isAdding ? '🆕 Novo Plano' : '🛠️ Editar Plano'}</h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Nome do Plano</label>
                <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Preço (R$)</label>
                  <input type="number" min="0" step="0.01" value={formData.price ?? 0} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Preço Antigo (R$)</label>
                  <input type="number" min="0" step="0.01" value={formData.oldPrice ?? 0} onChange={e => setFormData({...formData, oldPrice: parseFloat(e.target.value) || 0})} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Período</label>
                <input type="text" value={formData.period || ''} onChange={e => setFormData({...formData, period: e.target.value})} placeholder="ex: mês, ano, único" className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white" />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!formData.isPopular} onChange={e => setFormData({...formData, isPopular: e.target.checked})} className="rounded" />
                  <span className="text-sm text-gray-300">Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.active !== false} onChange={e => setFormData({...formData, active: e.target.checked})} className="rounded" />
                  <span className="text-sm text-gray-300">Ativo</span>
                </label>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-2">Benefícios</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.features?.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input type="text" value={feature} onChange={e => handleFeatureChange(index, e.target.value)} className="flex-1 bg-black border border-gray-800 rounded-lg p-2 text-sm text-white" />
                      <button onClick={() => { const f = [...(formData.features||[])]; f.splice(index,1); setFormData({...formData,features:f}); }} className="text-red-400 hover:text-red-300 flex-shrink-0"><X size={16} /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setFormData({...formData, features: [...(formData.features||[]), '']})} className="text-xs text-[#D4AF37] mt-2 hover:underline flex items-center gap-1">
                  <Plus size={12} /> Adicionar Benefício
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg hover:bg-[#B8962E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : 'Salvar Plano'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
