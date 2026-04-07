import React, { useState } from 'react';
import { useContent } from '../hooks/useContent';
import { X, Save, RotateCcw, LogOut } from 'lucide-react';

export const AdminPanel = ({ onClose }: { onClose: () => void }) => {
  const { content, updateContent, resetContent, isAdmin, login, logout } = useContent();
  const [password, setPassword] = useState('');
  const [jsonInput, setJsonInput] = useState(JSON.stringify(content, null, 2));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setError('');
    } else {
      setError('Senha incorreta');
    }
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      updateContent(parsed);
      setSuccess(content.admin.successMessage);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('JSON inválido');
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza? Isso restaurará o conteúdo original.')) {
      resetContent();
      setJsonInput(JSON.stringify(content, null, 2)); // This might need a refresh or effect to sync
      window.location.reload();
    }
  };

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-gold/20 p-8 rounded-lg max-w-md w-full relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X />
          </button>
          <h2 className="text-2xl font-heading text-gold mb-6 text-center">{content.admin.loginTitle}</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={content.admin.passwordPlaceholder}
              className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-gold outline-none"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-gold text-black font-bold py-3 rounded hover:bg-yellow-600 transition">
              {content.admin.loginButton}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading text-gold">Painel Administrativo</h2>
        <div className="flex gap-4">
          <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white">
            <LogOut size={18} /> {content.admin.logoutButton}
          </button>
          <button onClick={onClose} className="text-white hover:text-gold">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex gap-2 mb-2">
          <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            <Save size={18} /> {content.admin.saveButton}
          </button>
          <button onClick={handleReset} className="flex items-center gap-2 bg-red-900/50 text-red-200 px-4 py-2 rounded hover:bg-red-900">
            <RotateCcw size={18} /> {content.admin.resetButton}
          </button>
        </div>

        {success && <div className="bg-green-900/30 text-green-400 p-3 rounded border border-green-900">{success}</div>}
        {error && <div className="bg-red-900/30 text-red-400 p-3 rounded border border-red-900">{error}</div>}

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-4 font-mono text-sm text-gray-300 focus:border-gold outline-none resize-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
