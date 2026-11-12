import React from 'react';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="bg-ink border border-gold p-2 text-text w-full focus:outline-none" />
);
