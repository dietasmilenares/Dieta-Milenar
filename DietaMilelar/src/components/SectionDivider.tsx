import React from 'react';

export const SectionDivider: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center w-full py-8 overflow-hidden ${className}`}>
      <div className="relative flex items-center w-full max-w-4xl px-4">
        {/* Left Lines */}
        <div className="flex-1 h-[1px] bg-[#D4AF37] opacity-80"></div>
        <div className="absolute left-1/4 w-1/4 h-[1px] bg-[#D4AF37] -top-1 opacity-50"></div>
        <div className="absolute left-1/4 w-1/4 h-[1px] bg-[#D4AF37] -bottom-1 opacity-50"></div>

        {/* Center Geometric Pattern */}
        <div className="flex items-center mx-4 gap-1">
          {/* Left Arrow-like lines */}
          <div className="flex gap-0.5">
            <div className="w-1 h-6 border-l-2 border-t-2 border-[#D4AF37] rotate-45 -mr-1 opacity-80"></div>
            <div className="w-1 h-6 border-l-2 border-t-2 border-[#D4AF37] rotate-45 opacity-60"></div>
          </div>

          {/* Center Diamond */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-[#D4AF37] rotate-45"></div>
            <div className="absolute inset-1.5 border border-[#D4AF37] rotate-45 opacity-50"></div>
            <div className="w-2 h-2 bg-[#D4AF37] rotate-45 shadow-[0_0_10px_#D4AF37]"></div>
          </div>

          {/* Right Arrow-like lines */}
          <div className="flex gap-0.5">
            <div className="w-1 h-6 border-r-2 border-b-2 border-[#D4AF37] rotate-45 opacity-60"></div>
            <div className="w-1 h-6 border-r-2 border-b-2 border-[#D4AF37] rotate-45 -ml-1 opacity-80"></div>
          </div>
        </div>

        {/* Right Lines */}
        <div className="flex-1 h-[1px] bg-[#D4AF37] opacity-80"></div>
        <div className="absolute right-1/4 w-1/4 h-[1px] bg-[#D4AF37] -top-1 opacity-50"></div>
        <div className="absolute right-1/4 w-1/4 h-[1px] bg-[#D4AF37] -bottom-1 opacity-50"></div>
        
        {/* End Diamonds */}
        <div className="absolute left-0 w-2 h-2 bg-[#D4AF37] rotate-45 opacity-40"></div>
        <div className="absolute right-0 w-2 h-2 bg-[#D4AF37] rotate-45 opacity-40"></div>
      </div>
    </div>
  );
};
