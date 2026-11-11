import React from 'react';
import { ACTION_LABELS, ACTION_ORDER } from '../../../config/skillActions';
import type { ActionType } from '../../../types/fate';

interface SkillActionBadgesProps {
  actions?: ActionType[];
}

export const SkillActionBadges: React.FC<SkillActionBadgesProps> = ({ actions }) => {
  if (!actions || actions.length === 0) return null;

  const presentActions = ACTION_ORDER.filter((action) => actions.includes(action));
  if (presentActions.length === 0) return null;

  return (
    <span className="text-[10px] uppercase tracking-wide text-slate-500">
      {presentActions.map((action, index) => (
        <React.Fragment key={action}>
          {index > 0 && <span aria-hidden="true"> · </span>}
          {ACTION_LABELS[action]}
        </React.Fragment>
      ))}
    </span>
  );
};
