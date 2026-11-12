import React, { useEffect, useState } from 'react';
import { Check, ExternalLink, Sparkles } from 'lucide-react';
import { getLocalGeminiApiKey, setLocalGeminiApiKey } from '../../services/storage';
import { Button } from './Button';
import { FieldLabel } from './FieldLabel';
import { Input } from './Input';
import { Modal } from './Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 1 — обычное окно, 2 — вложенное поверх окна Gemini. */
  level?: 1 | 2;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, level = 1 }) => {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKey(getLocalGeminiApiKey());
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    setLocalGeminiApiKey(key.trim());
    setSaved(true);
    window.setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Настройки"
      level={level}
      maxWidthClass="max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            {saved ? (
              <>
                <Check className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                Сохранено
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="font-sans text-xs text-text-muted">Параметры листа и ИИ-помощника</p>

        <div className="flex flex-wrap items-center gap-2 border-b border-line pb-2">
          <span className="font-sans text-xs uppercase tracking-wider text-gold-light">Gemini AI</span>
          <span className="font-sans text-xs text-text-muted">Аспекты, трюки и подсказки</span>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 font-fantasy text-lg text-text">
            <Sparkles className="size-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
            Ключ Google AI Studio
          </h3>
          <p className="font-sans text-xs leading-relaxed text-text-muted">
            Ключ нужен для генерации аспектов и трюков. Он сохраняется только в этом браузере и не
            отправляется на сервер проекта.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel>API-ключ</FieldLabel>
          <Input
            id="gemini-key"
            type="password"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="AIzaSy..."
            autoComplete="off"
            spellCheck={false}
          />
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-sans text-xs text-gold-light underline decoration-gold-dim underline-offset-2 transition-colors duration-150 hover:text-gold"
          >
            Получить ключ в Google AI Studio
            <ExternalLink className="size-3" strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>
      </div>
    </Modal>
  );
};
