import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'accent', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "font-heading font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "golden-gradient-glow",
    secondary: "bg-black text-[#D4AF37] border border-[#D4AF37] hover:bg-gray-900 shadow-lg shadow-black/50",
    accent: "golden-gradient-glow animate-pulse-slow",
    white: "bg-white text-black hover:bg-gray-100 shadow-lg",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl uppercase tracking-wide",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};