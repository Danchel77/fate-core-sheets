import React from 'react';

export const Button: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary'; 
  disabled?: boolean 
}> = ({ children, variant = 'primary', disabled }) => (
  <button 
    data-kit="buttons" 
    data-btn={variant}
    disabled={disabled}
    className={`px-4 py-2 uppercase ${disabled ? 'bg-gray text-slate-500' : (variant === 'primary' ? 'bg-gold text-ink' : 'bg-ink text-gold border border-gold')}`}
  >
    {children}
  </button>
);
