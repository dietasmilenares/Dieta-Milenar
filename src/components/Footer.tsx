import React, { useState } from 'react';
import { Instagram, Facebook, Youtube, Mail, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { AnimatePresence, motion } from 'motion/react';

export const Footer: React.FC = () => {
  const { globalSettings } = useData();

  return (
    <>
    <footer id="main-footer" className="bg-black text-gray-400 pt-8 pb-4 border-t border-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-8">
          {/* Logo & Tagline */}
          <div className="text-center md:text-left">
            <h3 className="text-white text-lg font-bold font-heading mb-0 md:mb-2">
              {globalSettings?.appName ? (
                <>
                  {globalSettings.appName.split(' ')[0]}<span className="text-golden-gradient">{globalSettings.appName.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>DIETAS<span className="text-golden-gradient">MILENARES</span></>
              )}
            </h3>
          </div>
          
          {/* Copyright Info */}
          <div className="text-center md:text-right flex flex-col justify-center">
            <p className="text-[10px] text-white font-medium tracking-widest uppercase">
              &copy; <span className="text-golden-gradient">2023</span> - <span className="text-golden-gradient">2026</span> Dieta <span className="text-golden-gradient">Milenar</span>
            </p>
            <p className="text-[9px] text-white mt-1 uppercase tracking-[0.2em]">Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};
