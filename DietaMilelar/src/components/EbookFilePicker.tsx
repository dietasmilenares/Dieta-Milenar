import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, FileText, ChevronLeft, Loader2, Check } from 'lucide-react';

interface FileNode {
  type: 'folder' | 'file';
  name: string;
  path: string;
  children?: FileNode[];
}

interface EbookFilePickerProps {
  value: string;
  onChange: (path: string) => void;
}

export const EbookFilePicker: React.FC<EbookFilePickerProps> = ({ value, onChange }) => {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [stack, setStack] = useState<{ name: string; nodes: FileNode[] }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token') || '';
    fetch('/api/ebooks-files', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: FileNode[]) => {
        setTree(data);
        setStack([{ name: 'e-books', nodes: data }]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const current = stack[stack.length - 1];

  const enterFolder = (node: FileNode) => {
    if (node.type === 'folder' && node.children) {
      setStack(s => [...s, { name: node.name, nodes: node.children! }]);
    }
  };

  const goBack = () => {
    if (stack.length > 1) setStack(s => s.slice(0, -1));
  };

  const selectFile = (node: FileNode) => {
    onChange(node.path);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm py-3">
        <Loader2 size={15} className="animate-spin" /> Carregando arquivos...
      </div>
    );
  }

  const folders = current.nodes.filter(n => n.type === 'folder');
  const files   = current.nodes.filter(n => n.type === 'file');

  return (
    <div className="space-y-2">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-500 flex-wrap">
        {stack.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-gray-700">/</span>}
            <span className={i === stack.length - 1 ? 'text-[#D4AF37] font-bold' : 'text-gray-500'}>{s.name}</span>
          </React.Fragment>
        ))}
      </div>

      {/* Browser */}
      <div className="bg-black border border-gray-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
        {/* Back button */}
        {stack.length > 1 && (
          <button
            onClick={goBack}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-gray-400 hover:bg-gray-900 hover:text-white transition-colors text-sm border-b border-gray-800"
          >
            <ChevronLeft size={15} /> Voltar
          </button>
        )}

        {/* Folders */}
        {folders.map(node => (
          <button
            key={node.path}
            onClick={() => enterFolder(node)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-gray-300 hover:bg-gray-900 hover:text-white transition-colors text-sm border-b border-gray-800/50"
          >
            <Folder size={15} className="text-[#D4AF37] flex-shrink-0" />
            <span className="truncate text-left">{node.name}</span>
          </button>
        ))}

        {/* HTML files */}
        {files.map(node => {
          const isSelected = value === node.path;
          return (
            <button
              key={node.path}
              onClick={() => selectFile(node)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 transition-colors text-sm border-b border-gray-800/50 ${
                isSelected
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-l-[#D4AF37]'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <FileText size={15} className={isSelected ? 'text-[#D4AF37]' : 'text-gray-600'} />
              <span className="truncate text-left flex-1">{node.name}</span>
              {isSelected && <Check size={14} className="flex-shrink-0" />}
            </button>
          );
        })}

        {folders.length === 0 && files.length === 0 && (
          <div className="px-3 py-6 text-center text-gray-600 text-sm">Pasta vazia</div>
        )}
      </div>

      {/* Selected file */}
      {value && (
        <div className="flex items-center gap-2 text-[10px] text-green-400">
          <Check size={11} />
          <span className="truncate">{value}</span>
        </div>
      )}
    </div>
  );
};
