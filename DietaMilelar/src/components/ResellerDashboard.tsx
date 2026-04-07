import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, DollarSign, Users, Link as LinkIcon, AlertCircle, CreditCard, FileText, Download, BarChart2, TrendingUp, Wrench, Menu, LogOut, X } from 'lucide-react';
import { ToolsModal } from './ToolsModal';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';

type ResellerTab = 'overview' | 'withdrawals' | 'materials' | 'reports';

export const ResellerDashboard: React.FC = () => {
  const { currentUser, getResellerStats, notifications, updatePixKey, requestWithdrawal, withdrawals, bonuses, transactions, logout } = useData();
  const [activeTab, setActiveTab] = useState<ResellerTab>('overview');
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Withdrawal State
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  
  // Pix Key State
  const [pixKey, setPixKey] = useState(currentUser?.pixKey || '');
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'email' | 'phone' | 'random'>(currentUser?.pixKeyType || 'email');

  if (!currentUser || currentUser.role !== 'REVENDA') return null;

  const stats = getResellerStats(currentUser.id);
  const myNotifications = notifications.filter(n => n.userId === currentUser.id);
  const myWithdrawals = withdrawals.filter(w => w.userId === currentUser.id);
  const myBonuses = bonuses.filter(b => b.active && b.targetAudience === 'REVENDA');
  
  // Calculate conversion rate (Mock clicks for now)
  const mockClicks = Math.floor(stats.totalSales * 12 + 50);
  const conversionRate = mockClicks > 0 ? ((stats.referrals.length / mockClicks) * 100).toFixed(1) : '0.0';

  const handleSavePix = () => {
    updatePixKey(currentUser.id, pixKey, pixKeyType);
    toast.success('Chave Pix salva com sucesso!');
  };

  const handleRequestWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) return toast.error('Valor inválido');
    if (amount > (currentUser.walletBalance || 0)) return toast.error('Saldo insuficiente');
    if (!currentUser.pixKey) return toast.error('Cadastre uma chave Pix antes de solicitar saque');

    requestWithdrawal(currentUser.id, amount);
    setWithdrawalAmount('');
    toast.success('Solicitação de saque enviada!');
  };

  const copyLink = () => {
    const link = `${window.location.origin}?ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!');
  };

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Stats Cards */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-gray-400 text-xs font-medium mb-1">Saldo Disponível</h3>
          <p className="text-2xl font-bold text-green-400">R$ {currentUser.walletBalance?.toFixed(2) || '0.00'}</p>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-gray-400 text-xs font-medium mb-1">Vendas Totais</h3>
          <p className="text-2xl font-bold text-white">R$ {stats.totalSales.toFixed(2)}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-gray-400 text-xs font-medium mb-1">Indicações</h3>
          <p className="text-2xl font-bold text-purple-400">{stats.referrals.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Link */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LinkIcon className="text-[#D4AF37]" size={20} />
            Seu Link de Indicação
          </h2>
          <div className="flex items-center gap-2 bg-black p-2 rounded border border-gray-700">
            <code className="text-gray-300 text-xs flex-1 truncate px-2">
              {window.location.origin}?ref={currentUser.referralCode}
            </code>
            <button 
              onClick={copyLink}
              className="bg-[#D4AF37] text-black text-xs font-bold px-3 py-1.5 rounded hover:bg-[#b5952f] transition-colors"
            >
              COPIAR
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="text-[#D4AF37]" size={20} />
            Últimas Notificações
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {myNotifications.length === 0 ? (
              <p className="text-gray-500 text-xs">Nenhuma notificação.</p>
            ) : (
              myNotifications.slice(0, 5).map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-2.5 rounded border ${
                    notification.type === 'commission' 
                      ? 'bg-green-900/20 border-green-900 text-green-200' 
                      : 'bg-red-900/20 border-red-900 text-red-200'
                  }`}
                >
                  <p className="text-xs">{notification.message}</p>
                  <span className="text-[9px] opacity-70 block mt-0.5">
                    {new Date(notification.date).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderWithdrawals = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Request Withdrawal */}
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CreditCard className="text-[#D4AF37]" /> Dados Bancários (Pix)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo de Chave</label>
              <select 
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value as any)}
                className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm"
              >
                <option value="email">E-mail</option>
                <option value="cpf">CPF/CNPJ</option>
                <option value="phone">Telefone</option>
                <option value="random">Chave Aleatória</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Chave Pix</label>
              <input 
                type="text" 
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm"
                placeholder="Digite sua chave Pix..."
              />
            </div>
            <button 
              onClick={handleSavePix}
              className="w-full bg-gray-800 text-white font-bold py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Salvar Chave Pix
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="text-[#D4AF37]" /> Solicitar Saque
          </h2>
          <div className="space-y-4">
            <div className="bg-black p-4 rounded-lg border border-gray-800 flex justify-between items-center">
              <span className="text-gray-400 text-sm">Disponível:</span>
              <span className="text-green-400 font-bold text-lg">R$ {currentUser.walletBalance?.toFixed(2) || '0.00'}</span>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Valor do Saque (R$)</label>
              <input 
                type="number" 
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm"
                placeholder="0.00"
                min="1"
              />
            </div>
            <button 
              onClick={handleRequestWithdrawal}
              disabled={!currentUser.walletBalance || currentUser.walletBalance <= 0}
              className="w-full bg-[#D4AF37] text-black font-bold py-2 rounded hover:bg-[#b5952f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Solicitar Saque
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="text-[#D4AF37]" /> Histórico Financeiro
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[500px]">
          <table className="w-full text-left">
            <thead className="bg-black/50 text-gray-400 text-xs uppercase sticky top-0">
              <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {/* Combine Withdrawals and Commissions */}
              {[
                ...myWithdrawals.map(w => ({ ...w, type: 'withdrawal' })),
                ...notifications.filter(n => n.userId === currentUser.id && n.type === 'commission').map(n => ({
                  id: n.id,
                  date: n.date,
                  amount: 0, // Need to parse amount from message or store it separately. For now, 0.
                  status: 'completed',
                  type: 'commission',
                  message: n.message
                }))
              ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item: any) => (
                <tr key={item.id} className="text-sm hover:bg-gray-800/50">
                  <td className="p-4 text-gray-400">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    {item.type === 'withdrawal' ? (
                      <span className="text-red-400 flex items-center gap-1"><DollarSign size={12} /> Saque</span>
                    ) : (
                      <span className="text-green-400 flex items-center gap-1"><TrendingUp size={12} /> Comissão</span>
                    )}
                  </td>
                  <td className={`p-4 font-mono font-bold ${item.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                    {item.type === 'withdrawal' ? '-' : '+'} R$ {item.amount ? item.amount.toFixed(2) : '---'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                      item.status === 'approved' || item.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                      item.status === 'requested' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-red-900/20 text-red-400'
                    }`}>
                      {item.status === 'approved' ? 'Pago' : item.status === 'requested' ? 'Solicitado' : item.status === 'completed' ? 'Recebido' : 'Rejeitado'}
                    </span>
                  </td>
                </tr>
              ))}
              {myWithdrawals.length === 0 && notifications.filter(n => n.userId === currentUser.id).length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Nenhuma movimentação registrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMaterials = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {myBonuses.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-500">
          Nenhum material de marketing disponível no momento.
        </div>
      ) : (
        myBonuses.map(bonus => (
          <div key={bonus.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg group">
            <div className="relative aspect-video overflow-hidden">
              <img src={bonus.coverImage} alt={bonus.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-2">{bonus.title}</h3>
              <div 
                className="text-sm text-gray-400 mb-4 line-clamp-3 prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: bonus.description }}
              />
              {bonus.downloadUrl && (
                <a 
                  href={bonus.downloadUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-[#D4AF37] text-black font-bold py-2 rounded hover:bg-[#b5952f] transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Baixar Material
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderReports = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BarChart2 className="text-[#D4AF37]" /> Funil de Conversão
        </h2>
        <div className="space-y-6">
          <div className="relative pt-6">
            <div className="flex justify-between mb-2 text-sm text-gray-400">
              <span>Cliques no Link</span>
              <span>{mockClicks}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-full" />
            </div>
          </div>

          <div className="relative">
            <div className="flex justify-between mb-2 text-sm text-gray-400">
              <span>Vendas Realizadas</span>
              <span>{stats.referrals.length}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm mb-1">Taxa de Conversão</p>
            <p className="text-4xl font-bold text-white">{conversionRate}%</p>
            <p className="text-xs text-gray-500 mt-2">A cada {Math.round(100 / (parseFloat(conversionRate) || 1))} cliques, você faz 1 venda.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview' as ResellerTab, label: 'Visão Geral' },
    { id: 'withdrawals' as ResellerTab, label: 'Financeiro' },
    { id: 'materials' as ResellerTab, label: 'Marketing' },
    { id: 'reports' as ResellerTab, label: 'Relatórios' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <ToolsModal isOpen={isToolsModalOpen} onClose={() => setIsToolsModalOpen(false)} />

      {/* Fixed Top Nav Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-gray-800 flex items-center overflow-hidden">
        {/* Hamburger */}
        <div className="relative z-50 bg-black py-3 pr-4 flex items-center border-r border-gray-800/50 shadow-[20px_0_25px_-10px_rgba(0,0,0,0.9)]">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg text-[#D4AF37] transition-colors"
          >
            <Menu size={24} />
          </button>
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 left-0 bottom-0 w-80 bg-gray-900 border-r border-gray-800 z-[60] flex flex-col shadow-2xl"
                >
                  <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <span className="font-heading font-bold text-[#D4AF37] text-xl">Menu</span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
                      <p className="text-white font-bold">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                      <span className="inline-block mt-2 text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                        REVENDA
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 px-2">Navegação</p>
                      {tabs.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }}
                          className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-800">
                    <button
                      onClick={() => { logout(); window.location.href = '/'; }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-900/20 text-red-500 hover:bg-red-900/30 transition-colors font-bold justify-center"
                    >
                      <LogOut size={18} /> Sair
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-4 py-4 px-4 flex-1 whitespace-nowrap snap-x">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-bold uppercase tracking-wider transition-all snap-start shrink-0 pb-1 ${activeTab === tab.id ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ferramentas */}
        <div className="pr-3 shrink-0">
          <button
            onClick={() => setIsToolsModalOpen(true)}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-[#D4AF37] transition-colors"
            title="Ferramentas"
          >
            <Wrench size={20} />
          </button>
        </div>
      </div>

      <div className="pt-16 px-4 pb-12">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'withdrawals' && renderWithdrawals()}
            {activeTab === 'materials' && renderMaterials()}
            {activeTab === 'reports' && renderReports()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
