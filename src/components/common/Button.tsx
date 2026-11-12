import React from 'react';

export const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}> = ({ children, variant = 'primary', disabled, onClick, type = 'button', className = '' }) => (
  <button
    type={type}
    data-kit="buttons"
    data-btn={variant}
    disabled={disabled}
    onClick={onClick}
    className={`rounded-none px-4 py-2 font-fantasy uppercase tracking-wider transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed ${
      disabled
        ? 'bg-ink-frame text-text-muted'
        : variant === 'primary'
          ? 'bg-gold text-ink hover:bg-gold-light'
          : 'border border-gold bg-transparent text-gold-light hover:bg-wine'
    } ${className}`}
  >
    {children}
  </button>
);
