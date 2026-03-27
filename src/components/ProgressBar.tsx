import React from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

export const ProgressBar: React.FC = () => {
  const progress = useScrollProgress();

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-50 bg-gray-900">
      <div 
        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] transition-all duration-100 ease-out shadow-[0_0_10px_rgba(212,175,55,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};