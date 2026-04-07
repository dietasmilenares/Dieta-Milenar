import React, { useState } from 'react';
import { Plus, Edit, Layers, EyeOff, ChevronLeft, X, Trash2, BookOpen } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Subcategory, Ebook } from '../types';
import FileUpload from './FileUpload';
import toast from 'react-hot-toast';

const InactiveSubcategories: React.FC<{ categoryId: string; onReactivated: () => void }> = ({ categoryId, onReactivated }) => {
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

  const deletePermanent = async (id: string) => {
    if (!window.confirm('Deletar permanentemente?')) return;
    const token = localStorage.getItem('auth_token') || '';
    await fetch(`/api/subcategories/${id}/permanent`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setInactive(p => p.filter(s => s.id !== id));
    toast.success('Subcategoria excluída permanentemente!');
  };

  if (loading) return <p className="text-gray-500 text-sm text-center py-6">Carregando...</p>;
  if (inactive.length === 0) return <p className="text-gray-500 text-sm text-center py-6">Nenhuma subcategoria desativada.</p>;

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory gap-3" style={{ scrollbarWidth: 'none' }}>
      {inactive.map((sub: any) => (
        <div key={sub.id} className="flex-none w-full snap-start bg-black rounded-lg border border-gray-700 overflow-hidden opacity-60">
          <div className="p-4">
            <h3 className="text-gray-400 font-bold">{sub.name}</h3>
            <p className="text-gray-600 text-xs mt-0.5">{sub.description}</p>
          </div>
          <div className="grid grid-cols-2 border-t border-gray-800">
            <button onClick={() => reactivate(sub)} className="flex items-center justify-center py-2 text-[11px] text-green-400 font-semibold border-r border-gray-800 hover:bg-gray-800 transition-colors">
              🟢 Reativar
            </button>
            <button onClick={() => deletePermanent(sub.id)} className="flex items-center justify-center gap-1 py-2 text-[11px] text-red-400 font-semibold hover:bg-gray-800 transition-colors">
              <Trash2 size={11} /> Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

interface LibrarySubcategoriesProps {
  categoryId: string | null;
  onClose: () => void;
  onOpenEbookEditor: (subcategoryId: string, categoryId: string) => void;
  onOpenEbookList: (subcategoryId: string) => void;
}

export const LibrarySubcategories: React.FC<LibrarySubcategoriesProps> = ({
  categoryId, onClose, onOpenEbookEditor, onOpenEbookList
}) => {
  const { categories, subcategories, ebooks, addSubcategory, updateSubcategory, deleteSubcategory, refreshCategories, refreshSubcategories } = useData();
  const [showInactive, setShowInactive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSub, setEditingSub] = useState<Partial<Subcategory>>({});
  const [availableImages, setAvailableImages] = useState<string[]>([]);

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token') || '';
    fetch('/api/available-images', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setAvailableImages).catch(() => {});
  }, []);

  if (!categoryId) return null;

  const cat = categories.find(c => c.id === categoryId);
  const catSubs = subcategories.filter(s => s.categoryId === categoryId).sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-800 flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 shrink-0">
              <Layers className="text-[#D4AF37]" size={18} /> Subs — {cat?.name}
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
                    onClick={() => { setEditingSub({ id: Math.random().toString(), categoryId, name: '', description: '', order: catSubs.length + 1, dripDays: 0, active: true }); setIsEditing(true); }}
                    className="bg-[#D4AF37] text-black px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-[#B8962E] transition-colors text-xs"
                  >
                    <Plus size={14} /> Nova
                  </button>
                </>
              )}
              <button onClick={onClose} className="text-gray-400 hover:text-white ml-1"><X size={18} /></button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto">
            {!showInactive ? (
              <div className="relative overflow-hidden rounded-xl">
                <div className="flex overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none', overscrollBehaviorX: 'contain' }}>
                  {catSubs.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-6 w-full">Nenhuma subcategoria nesta categoria.</p>
                  ) : catSubs.map(sub => (
                    <div key={sub.id} className="flex-none w-full snap-start bg-black rounded-lg border border-gray-800 overflow-hidden group hover:border-[#D4AF37]/30 transition-colors" style={{ scrollSnapStop: 'always' }}>
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                        <img src={(sub as any).coverImage || '/img/capa.png'} alt={sub.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={e => { (e.target as HTMLImageElement).src = '/img/capa.png'; }} />
                        <button onClick={() => { setEditingSub(sub); setIsEditing(true); }} className="absolute top-2 left-2 p-1.5 bg-black/70 rounded-lg text-white hover:bg-[#D4AF37] hover:text-black transition-colors" title="Editar">
                          <Edit size={12} />
                        </button>
                        <button onClick={async () => { await deleteSubcategory(sub.id); await refreshSubcategories(); toast.success('Subcategoria desativada!'); }} className="absolute bottom-2 right-2 p-1.5 bg-black/70 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors" title="Desativar">
                          🔴
                        </button>
                        {sub.dripDays ? <span className="absolute top-2 right-2 bg-blue-500/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Drip {sub.dripDays}d</span> : null}
                      </div>
                      <div className="p-3">
                        <h3 className="text-white font-bold text-xs truncate">{sub.name}</h3>
                        <p className="text-gray-500 text-[10px] line-clamp-2 mt-0.5">{sub.description}</p>
                        <p className="text-gray-600 text-[10px] mt-1">{ebooks.filter(e => e.subcategoryId === sub.id).length} e-books</p>
                      </div>
                      <div className="grid grid-cols-2 border-t border-gray-800">
                        <button onClick={() => { onClose(); onOpenEbookEditor(sub.id, sub.categoryId); }} className="flex items-center justify-center gap-1 py-2 text-[10px] text-white font-semibold border-r border-gray-800 hover:bg-gray-800 transition-colors">
                          <Plus size={10} /> E-book
                        </button>
                        <button onClick={() => { onClose(); onOpenEbookList(sub.id); }} className="flex items-center justify-center gap-1 py-2 text-[10px] text-gray-400 font-semibold hover:bg-gray-800 transition-colors">
                          <BookOpen size={10} /> Ver
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <InactiveSubcategories categoryId={categoryId} onReactivated={() => refreshSubcategories()} />
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{subcategories.find(s => s.id === editingSub.id) ? '🛠️' : '🆕'} Subcategoria</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Nome</label>
                <input type="text" value={editingSub.name || ''} onChange={e => setEditingSub({...editingSub, name: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Descrição</label>
                <textarea value={editingSub.description || ''} onChange={e => setEditingSub({...editingSub, description: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white h-20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Ordem</label>
                  <input type="number" value={editingSub.order || 1} onChange={e => setEditingSub({...editingSub, order: parseInt(e.target.value)})} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Drip (Dias)</label>
                  <input type="number" value={editingSub.dripDays || 0} onChange={e => setEditingSub({...editingSub, dripDays: parseInt(e.target.value)})} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Imagem</label>
                <div className="flex items-center gap-3">
                  <img src={(editingSub as any).coverImage || '/img/capa.png'} alt="Preview" className="w-12 h-16 object-cover rounded border border-gray-700 flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = '/img/capa.png'; }} />
                  <div className="flex-1 space-y-2">
                    <FileUpload onUploadComplete={(url) => setEditingSub({...editingSub, coverImage: url} as any)} folder="subcategories" accept="image/*" label="Upload Imagem" />
                    <input type="text" value={(editingSub as any).coverImage || ''} onChange={e => setEditingSub({...editingSub, coverImage: e.target.value} as any)} placeholder="Ou cole uma URL..." className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white text-xs" />
                    {availableImages.length > 0 && (
                      <select value={(editingSub as any).coverImage || ''} onChange={e => setEditingSub({...editingSub, coverImage: e.target.value} as any)} className="w-full bg-black border border-gray-800 rounded-lg p-2 text-white text-xs">
                        <option value="">Selecionar do sistema...</option>
                        {availableImages.map(img => <option key={img} value={img}>{img.split('/').pop()}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  const isNew = !subcategories.find(s => s.id === editingSub.id);
                  try {
                    if (isNew) { await addSubcategory(editingSub as Subcategory); toast.success('Subcategoria criada!'); }
                    else { await updateSubcategory(editingSub.id!, editingSub); toast.success('Subcategoria atualizada!'); }
                    setIsEditing(false);
                  } catch { toast.error('Erro ao salvar.'); }
                }}
                className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg"
              >
                Salvar Subcategoria
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
