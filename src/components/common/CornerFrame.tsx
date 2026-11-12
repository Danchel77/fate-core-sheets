import React from 'react';

export const CornerFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-kit="frames" data-frame className="relative border border-gold p-4">
    <div data-corner className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-gold" />
    <div data-corner className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-gold" />
    <div data-corner className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-gold" />
    <div data-corner className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-gold" />
    {children}
  </div>
);
