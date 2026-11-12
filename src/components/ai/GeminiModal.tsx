import React, { useEffect, useState } from 'react';
import { Sparkles, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { askGeminiForAspect, askGeminiForStunt, GeminiSuggestion } from '../../services/gemini';
import { Character } from '../../types/character';
import { getLocalGeminiApiKey } from '../../services/storage';
import { Button } from '../common/Button';
import { FieldLabel } from '../common/FieldLabel';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { SettingsModal } from '../common/SettingsModal';

interface GeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'aspect' | 'stunt';
  aspectKind?: 'high_concept' | 'trouble' | 'other';
  skillName?: string;
  character: Character;
  onSelectSuggestion: (title: string, description?: string) => void;
  onOpenApiKeySettings: () => void;
}

export const GeminiModal: React.FC<GeminiModalProps> = ({
  isOpen,
  onClose,
  type,
  aspectKind = 'other',
  skillName = '',
  character,
  onSelectSuggestion,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<GeminiSuggestion[]>([]);
  const [notes, setNotes] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Демо-режим (?mock=1) работает без ключа: сборка с VITE_GEMINI_API_KEY не
  // должна делать демонстрационный лист зависимым от сети и внешней квоты.
  const isDemoMode =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mock') === '1';
  const hasApiKey = !isDemoMode && Boolean(getLocalGeminiApiKey());

  useEffect(() => {
    if (!isOpen) setSettingsOpen(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!hasApiKey) {
      setSettingsOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let results: GeminiSuggestion[] = [];
      if (type === 'aspect') {
        results = await askGeminiForAspect(
          aspectKind,
          character.name,
          character.setting,
          character.aspects,
          notes
        );
      } else {
        results = await askGeminiForStunt(
          character.name,
          character.setting,
          skillName,
          character.aspects,
          notes
        );
      }
      setSuggestions(results);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error && err.message === 'NO_API_KEY') {
        setError('Пожалуйста, укажите Gemini API ключ в настройках.');
      } else {
        setError('Не удалось получить ответ от Gemini. Проверьте правильность API ключа или подключение.');
      }
    } finally {
      setLoading(false);
    }
  };

  const titleText = type === 'aspect'
    ? aspectKind === 'high_concept' ? 'ИИ-помощь: Главная концепция'
      : aspectKind === 'trouble' ? 'ИИ-помощь: Проблема персонажа'
      : 'ИИ-помощь: Свободный аспект'
    : `ИИ-генератор трюка (${skillName || 'Трюк'})`;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Gemini"
        level={1}
        maxWidthClass="max-w-xl"
        footer={
          <Button variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center border border-gold-dim bg-ink-raised text-gold">
              <Sparkles className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="font-fantasy text-lg text-gold-light">{titleText}</h3>
              <p className="font-sans text-xs text-text-muted">
                Генерация вариантов с учётом сеттинга и правил Fate Core
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Ваши пожелания или детали идеи (необязательно)</FieldLabel>
            <Input
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Например: бывший ведьмак Школы Кота, циничный, любит деньги..."
            />
          </div>

          {suggestions.length === 0 && !loading ? (
            <div className="border border-dashed border-line bg-ink-raised/40 p-4 text-center">
              <p className="mx-auto mb-3 max-w-sm font-sans text-xs leading-relaxed text-text-muted">
                Нажмите кнопку ниже, и Gemini 3.5 предложит 3 выразительных варианта с пояснениями.
              </p>
              <Button onClick={handleGenerate} className="mx-auto flex items-center gap-2">
                <Sparkles className="size-4" strokeWidth={1.5} aria-hidden="true" />
                Сгенерировать 3 варианта
              </Button>
            </div>
          ) : null}

          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto mb-3 size-8 animate-spin text-gold" strokeWidth={1.5} aria-hidden="true" />
              <p className="font-fantasy text-sm text-gold-light">Совет старейшин формулирует судьбу...</p>
              <p className="mt-1 font-sans text-xs text-text-muted">
                Ожидание ответа от Gemini Flash-lite (~1-2 сек)
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="flex items-center gap-3 border border-danger bg-wine p-3 font-sans text-xs text-danger">
              <AlertCircle className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <div className="flex-1">{error}</div>
              <Button
                variant="secondary"
                onClick={() => setSettingsOpen(true)}
                className="shrink-0 !border-danger !px-2 !py-1 !text-danger"
              >
                Настроить
              </Button>
            </div>
          ) : null}

          {suggestions.length > 0 && !loading ? (
            <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto pr-1">
              {suggestions.map((item, idx) => (
                <div key={idx} className="flex flex-col border border-line bg-ink-raised p-3">
                  <h4 className="font-fantasy text-sm text-gold-light">«{item.title}»</h4>
                  <p className="mt-1 font-sans text-xs leading-relaxed text-text-muted">
                    {item.description}
                  </p>
                  <Button
                    onClick={() => {
                      onSelectSuggestion(item.title, item.description);
                      onClose();
                    }}
                    className="mt-2 flex items-center gap-1.5 self-end !px-3 !py-1 !text-xs"
                  >
                    <Check className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                    Применить
                  </Button>
                </div>
              ))}

              <Button
                variant="secondary"
                onClick={handleGenerate}
                className="flex w-full items-center justify-center gap-1.5"
              >
                <RefreshCw className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                Сгенерировать другие варианты
              </Button>
            </div>
          ) : null}
        </div>
      </Modal>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} level={2} />
    </>
  );
};
