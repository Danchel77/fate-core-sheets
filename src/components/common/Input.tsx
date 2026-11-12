import React from 'react';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="w-full bg-ink-raised border border-line px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold" />
);
