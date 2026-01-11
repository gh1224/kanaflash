
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false
}) => {
  const baseStyles = "px-6 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md",
    secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-md",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md",
    outline: "border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
