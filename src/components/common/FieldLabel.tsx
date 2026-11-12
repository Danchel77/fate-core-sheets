import React from 'react';

export const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-xs text-gold uppercase tracking-wider">{children}</label>
);
