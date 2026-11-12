import React from 'react';
import { SectionRibbon } from './SectionRibbon';
import { CornerFrame } from './CornerFrame';
import { Button } from './Button';
import { StressBox } from './StressBox';

export const UiKit: React.FC = () => (
  <div className="p-8 bg-ink min-h-screen text-text">
    <h1 className="text-2xl text-gold mb-8">UI Kit</h1>
    
    <div className="mb-8">
      <SectionRibbon>Ribbon 1</SectionRibbon>
      <SectionRibbon>Ribbon 2</SectionRibbon>
      <SectionRibbon>Ribbon 3</SectionRibbon>
    </div>

    <div className="mb-8 flex gap-4">
      <CornerFrame>Frame 1</CornerFrame>
      <CornerFrame>Frame 2</CornerFrame>
    </div>

    <div className="mb-8 flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button disabled>Disabled</Button>
    </div>

    <div className="flex gap-1">
      {[...Array(4)].map((_, i) => <StressBox key={i} filled />)}
      {[...Array(4)].map((_, i) => <StressBox key={i} />)}
    </div>
  </div>
);
