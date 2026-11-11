import type { ActionType } from '../types/fate';

export const ACTION_LABELS: Record<ActionType, string> = {
  overcome: 'Преодоление',
  advantage: 'Преимущество',
  attack: 'Атака',
  defend: 'Защита',
};

export const ACTION_HINTS: Record<ActionType, string> = {
  overcome: 'Действовать, когда исход неочевиден: перелезть, убедить, вспомнить.',
  advantage: 'Создать или открыть аспект: найти укрытие, оценить врага, завязать союз.',
  attack: 'Нанести вред: ударить, выстрелить, сломать.',
  defend: 'Противостоять: уклониться, прикрыться, устоять под давлением.',
};

export const ACTION_ORDER: ActionType[] = ['overcome', 'advantage', 'attack', 'defend'];
