import React, { useEffect, useState } from 'react';
import { Check, ExternalLink, Key, Settings, Sparkles, X } from 'lucide-react';
import { getLocalGeminiApiKey, setLocalGeminiApiKey } from '../../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKey(getLocalGeminiApiKey());
      setSaved(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    setLocalGeminiApiKey(key.trim());
    setSaved(true);
    window.setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-[#2A3444] bg-[#10141C] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#202734] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2A3444] bg-[#161C26] text-slate-300">
              <Settings className="h-4 w-4" />
            </span>
            <div>
              <h2 id="settings-title" className="font-fantasy text-lg font-semibold text-white">
                Настройки
              </h2>
              <p className="text-[11px] text-slate-500">Параметры листа и ИИ-помощника</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-[#1A202C] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
            aria-label="Закрыть настройки"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-5 flex items-center gap-2 border-b border-[#202734] pb-3">
            <span className="rounded-md border border-[#2A3444] bg-[#161C26] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
              Gemini AI
            </span>
            <span className="text-[11px] text-slate-500">Аспекты, трюки и подсказки</span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2A3444] bg-[#161C26] text-slate-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Ключ Google AI Studio</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Ключ нужен для генерации аспектов и трюков. Он сохраняется только в этом браузере
                и не отправляется на сервер проекта.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="gemini-key"
              className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"
            >
              API-ключ
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                id="gemini-key"
                type="password"
                value={key}
                onChange={(event) => setKey(event.target.value)}
                placeholder="AIzaSy..."
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-lg border border-[#2A3444] bg-[#0B0E14] py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-600 transition focus:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30"
              />
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-400 underline decoration-slate-600 underline-offset-2 transition hover:text-slate-200"
            >
              Получить ключ в Google AI Studio
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#B9C9DC] bg-[#B9C9DC] px-4 py-2 text-xs font-semibold text-[#0B0E14] transition hover:border-[#CAD8E8] hover:bg-[#CAD8E8] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              {saved ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Сохранено
                </>
              ) : (
                'Сохранить'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
