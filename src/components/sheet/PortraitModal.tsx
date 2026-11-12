import React from 'react';
import { Image as ImageIcon, Shield, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface PortraitModalProps {
  isOpen: boolean;
  avatar: string | null;
  characterName: string;
  onClose: () => void;
  onReplace: () => void;
  onRemove: () => void;
}

/**
 * Портрет — это кнопка в паспорте. Никаких дополнительных иконок на листе:
 * замена и удаление живут внутри этого диалога.
 */
export const PortraitModal: React.FC<PortraitModalProps> = ({
  isOpen,
  avatar,
  characterName,
  onClose,
  onReplace,
  onRemove,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Портрет" maxWidthClass="max-w-sm">
    <div className="flex flex-col gap-4">
      <p className="font-sans text-xs leading-relaxed text-text-muted">
        Квадратное изображение лучше всего смотрится на листе.
      </p>

      <div className="mx-auto flex aspect-square w-full max-w-[220px] items-center justify-center overflow-hidden border border-line bg-ink-raised">
        {avatar ? (
          <img src={avatar} alt={characterName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-muted">
            <Shield className="size-10" strokeWidth={1.25} aria-hidden="true" />
            <span className="font-sans text-xs uppercase tracking-wider">Нет портрета</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={onReplace} className="flex w-full items-center justify-center gap-2">
          <ImageIcon className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          {avatar ? 'Заменить изображение' : 'Загрузить изображение'}
        </Button>

        {avatar ? (
          <Button
            variant="secondary"
            onClick={onRemove}
            className="flex w-full items-center justify-center gap-2 !border-danger !text-danger"
          >
            <Trash2 className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
            Удалить портрет
          </Button>
        ) : null}

        <Button variant="secondary" onClick={onClose} className="w-full">
          Отмена
        </Button>
      </div>
    </div>
  </Modal>
);
