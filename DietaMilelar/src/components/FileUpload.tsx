import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  folder?: string;
  accept?: string;
  label?: string;
  categorySlug?: string;
  subcategorySlug?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  accept = '.pdf',
  label = 'Upload PDF',
  categorySlug,
  subcategorySlug,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inputId] = useState(() => `file-upload-${Math.random().toString(36).substr(2, 9)}`);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (categorySlug) formData.append('category_slug', categorySlug);
      if (subcategorySlug) formData.append('subcategory_slug', subcategorySlug);

      const token = localStorage.getItem('auth_token');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload/ebook');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          onUploadComplete(data.url);
          setSuccess(true);
        } else {
          setError('Erro ao fazer upload.');
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setError('Erro de conexão.');
        setUploading(false);
      };

      xhr.send(formData);
    } catch (err) {
      setError('Erro inesperado.');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className={`flex items-center justify-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors text-xs font-bold ${
            uploading ? 'bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed' :
            success ? 'bg-green-500/10 border-green-500/40 text-green-400' :
            error ? 'bg-red-500/10 border-red-500/40 text-red-400' :
            'bg-gray-900 border-gray-700 hover:border-[#D4AF37]/50 text-gray-400 hover:text-[#D4AF37]'
          }`}
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>{progress}% Enviando...</span></>
          ) : success ? (
            <><CheckCircle className="w-4 h-4" /><span>Enviado!</span></>
          ) : error ? (
            <><XCircle className="w-4 h-4" /><span>{error}</span></>
          ) : (
            <><Upload className="w-4 h-4" /><span>{label}</span></>
          )}
        </label>
      </div>
      {uploading && (
        <div className="w-full bg-gray-800 rounded-full h-1">
          <div
            className="bg-[#D4AF37] h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
