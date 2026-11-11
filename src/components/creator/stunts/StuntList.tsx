import React from 'react';
import type { CharacterStunt } from '../../../types/fate';
import { calculateRefresh, countRealStunts } from '../../../utils/fateMath';
import { StuntListItem } from './StuntListItem';

interface StuntListProps {
  stunts: CharacterStunt[];
  freeStunts?: number;
  baseRefresh?: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

function formatStuntsCount(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${count} трюк`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} трюка`;
  }
  return `${count} трюков`;
}

export const StuntList: React.FC<StuntListProps> = ({
  stunts,
  freeStunts = 3,
  baseRefresh = 3,
  onEdit,
  onDelete,
}) => {
  const count = countRealStunts(stunts);
  const refresh = calculateRefresh(count, freeStunts, baseRefresh);
  const isOverLimit = count > freeStunts;

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#1C212B] pb-2">
        <div className="flex items-baseline gap-2">
          <h3 className="font-fantasy text-sm font-semibold text-slate-200">
            Трюки
          </h3>
          <span className="text-xs text-slate-400">
            {formatStuntsCount(count)} · Восстановление{' '}
            <span
              className={
                isOverLimit
                  ? 'font-semibold text-amber-400/90'
                  : 'text-slate-300'
              }
            >
              {refresh}
            </span>
          </span>
        </div>
        {isOverLimit && (
          <span className="text-[11px] text-amber-400/90">
            −1 за каждый трюк сверх трёх
          </span>
        )}
      </div>

      {stunts.length === 0 ? (
        <p className="py-3 text-xs text-slate-500">
          Трюков пока нет. Выберите паттерн выше.
        </p>
      ) : (
        <div>
          {stunts.map((stunt, index) => (
            <StuntListItem
              key={stunt.id || index}
              stunt={stunt}
              index={index}
              onEdit={() => onEdit(index)}
              onDelete={() => onDelete(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
