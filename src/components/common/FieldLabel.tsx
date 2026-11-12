import React from 'react';

export const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label data-kit="field-label" className="font-sans text-xs uppercase tracking-wider text-text-muted">{children}</label>
);
