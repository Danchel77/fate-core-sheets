import React from 'react';

export const CornerFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-kit="frames" data-frame className="relative p-4">
    <div data-corner className="absolute top-0 left-0 size-3.5 border-t border-l border-gold-dim" />
    <div data-corner className="absolute top-0 right-0 size-3.5 border-t border-r border-gold-dim" />
    <div data-corner className="absolute bottom-0 left-0 size-3.5 border-b border-l border-gold-dim" />
    <div data-corner className="absolute bottom-0 right-0 size-3.5 border-b border-r border-gold-dim" />
    {children}
  </div>
);
