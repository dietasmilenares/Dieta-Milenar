import React, { useState } from 'react';
import { Plus, Edit, Layers, EyeOff, ChevronLeft, X, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Category, Subcategory } from '../types';
import FileUpload from './FileUpload';
import toast from 'react-hot-toast';

const InactiveCategories: React.FC<{ onReactivated: () => void }> = ({ onReactivated }) => {
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
      if (!res.ok) throw new Error();
      setInactive(p => p.filter(c => c.id !== cat.id));
      onReactivated();
      toast.success('Categoria reativada!');
    } catch { toast.error('Erro ao reativar.'); }
  };

  const deletePermanent = async (id: string) => {
    if (!window.confirm('Deletar permanentemente? Esta ação não pode ser desfeita.')) return;
    const token = localStorage.getItem('auth_token') || '';
    await fetch(`/api/categories/${id}/permanent`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setInactive(p => p.filter(c => c.id !== id));
    toast.success('Categoria excluída permanentemente!');
  };

  if (loading) return <p className="text-gray-500 text-sm text-center py-6">Carregando...</p>;
  if (inactive.length === 0) return <p className="text-gray-500 text-sm text-center py-6">Nenhuma categoria desativada.</p>;

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory gap-3" style={{ scrollbarWidth: 'none' }}>
      {inactive.map((cat: any) => (
        <div key={cat.id} className="flex-none w-full snap-start bg-black rounded-lg border border-gray-700 overflow-hidden opacity-60">
          <div className="p-4">
            <h3 className="text-gray-400 font-bold">{cat.name}</h3>
            <p className="text-gray-600 text-xs mt-0.5">{cat.description}</p>
          </div>
          <div className="grid grid-cols-2 border-t border-gray-800">
            <button onClick={() => reactivate(cat)} className="flex items-center justify-center py-2 text-[11px] text-green-400 font-semibold border-r border-gray-800 hover:bg-gray-800 transition-colors">
              🟢 Reativar
            </button>
            <button onClick={() => deletePermanent(cat.id)} className="flex items-center justify-center gap-1 py-2 text-[11px] text-red-400 font-semibold hover:bg-gray-800 transition-colors">
              <Trash2 size={11} /> Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const LibraryCategories: React.FC = () => {
  const { categories, subcategories, addCategory, updateCategory, deleteCategory, refreshCategories } = useData();
  const [showInactive, setShowInactive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<Category>>({});
  const [availableImages, setAvailableImages] = useState<string[]>([]);

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token') || '';
    fetch('/api/available-images', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setAvailableImages).catch(() => {});
  }, []);

  return (
    <>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
            <Layers className="text-[#D4AF37]" size={18} /> Categorias
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {showInactive ? (
              <button onClick={() => setShowInactive(false)} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-600 bg-gray-700 text-white transition-colors flex items-center gap-1">
                <ChevronLeft size={13} /> Voltar
              </button>
            ) : (
              <>
                <button onClick={() => setShowInactive(true)} className="text-xs px-3 py-1.5 rounded-lg font-bold border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-colors flex items-center gap-1">
                  <EyeOff size={13} /> Desativadas
                </button>
                <button
                  onClick={() => { setEditingCat({ id: Math.random().toString(), name: '', description: '', order: categories.length + 1, active: true }); setIsEditing(true); }}
                  className="bg-[#D4AF37] text-black px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-[#B8962E] transition-colors text-xs"
                >
                  <Plus size={14} /> Nova
                </button>
              </>
            )}
          </div>
        </div>
        <div className="p-6">
          {!showInactive ? (
            <div className="relative overflow-hidden rounded-xl">
              <div className="flex overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none', overscrollBehaviorX: 'contain' }}>
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6 w-full">Nenhuma categoria cadastrada.</p>
                ) : categories.map(cat => (
                  <div key={cat.id} className="flex-none w-full snap-start bg-black rounded-lg border border-gray-800 overflow-hidden group hover:border-[#D4AF37]/30 transition-colors" style={{ scrollSnapStop: 'always' }}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                      <img src={cat.coverImage || '/img/capa.png'} alt={cat.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={e => { (e.target as HTMLImageElement).src = '/img/capa.png'; }} />
                      <button onClick={() => { setEditingCat(cat); setIsEditing(true); }} className="absolute top-2 left-2 p-1.5 bg-black/70 rounded-lg text-white hover:bg-[#D4AF37] hover:text-black transition-colors" title="Editar">
                        <Edit size={12} />
                      </button>
                      <button onClick={async () => { await deleteCategory(cat.id); await refreshCategories(); toast.success('Categoria desativada!'); }} className="absolute bottom-2 right-2 p-1.5 bg-black/70 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors" title="Desativar">
                        🔴
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
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <InactiveCategories onReactivated={() => refreshCategories()} />
          )}
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{categories.find(c => c.id === editingCat.id) ? '🛠️' : '🆕'} Categoria</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Nome</label>
                <input type="text" value={editingCat.name || ''} onChange={e => setEditingCat({...editingCat, name: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Descrição</label>
                <textarea value={editingCat.description || ''} onChange={e => setEditingCat({...editingCat, description: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white h-20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Ordem</label>
                  <input type="number" value={editingCat.order || 0} onChange={e => setEditingCat({...editingCat, order: parseInt(e.target.value)})} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Drip (Dias)</label>
                  <input type="number" value={editingCat.dripDays || 0} onChange={e => setEditingCat({...editingCat, dripDays: parseInt(e.target.value)})} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={!!editingCat.isMandatory} onChange={e => setEditingCat({...editingCat, isMandatory: e.target.checked})} id="lc-isMandatory" />
                <label htmlFor="lc-isMandatory" className="text-sm text-gray-300">Categoria Obrigatória</label>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Imagem</label>
                <div className="flex items-center gap-3">
                  <img src={editingCat.coverImage || '/img/capa.png'} alt="Preview" className="w-12 h-16 object-cover rounded border border-gray-700 flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = '/img/capa.png'; }} />
                  <div className="flex-1 space-y-2">
                    <FileUpload onUploadComplete={(url) => setEditingCat({...editingCat, coverImage: url})} folder="categories" accept="image/*" label="Upload Imagem" />
                    <input type="text" value={editingCat.coverImage || ''} onChange={e => setEditingCat({...editingCat, coverImage: e.target.value})} placeholder="Ou cole uma URL..." className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white text-xs" />
                    {availableImages.length > 0 && (
                      <select value={editingCat.coverImage || ''} onChange={e => setEditingCat({...editingCat, coverImage: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white text-xs">
                        <option value="">Selecionar do sistema...</option>
                        {availableImages.map(img => <option key={img} value={img}>{img.split('/').pop()}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  const isNew = !categories.find(c => c.id === editingCat.id);
                  const data = { ...editingCat, coverImage: editingCat.coverImage || '/img/capa.png' };
                  try {
                    if (isNew) { await addCategory(data as Category); toast.success('Categoria criada!'); }
                    else { await updateCategory(data.id!, data); toast.success('Categoria atualizada!'); }
                    setIsEditing(false);
                  } catch { toast.error('Erro ao salvar.'); }
                }}
                className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg"
              >
                Salvar Categoria
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
