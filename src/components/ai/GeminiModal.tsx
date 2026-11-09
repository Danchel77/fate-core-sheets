import React, { useState } from 'react';
import { Sparkles, X, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { askGeminiForAspect, askGeminiForStunt, GeminiSuggestion } from '../../services/gemini';
import { Character } from '../../types/character';
import { getLocalGeminiApiKey } from '../../services/storage';

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
  onOpenApiKeySettings,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<GeminiSuggestion[]>([]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const hasApiKey = Boolean(getLocalGeminiApiKey());

  const handleGenerate = async () => {
    if (!hasApiKey) {
      onOpenApiKeySettings();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#161B22] border border-[#2E3440] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-fantasy font-bold text-lg text-amber-400">
              {titleText}
            </h3>
            <p className="text-xs text-slate-400">
              Генерация вариантов с учётом сеттинга и правил Fate Core
            </p>
          </div>
        </div>

        {/* Optional notes input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Ваши пожелания или детали идеи (необязательно)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Например: бывший ведьмак Школы Кота, циничный, любит деньги..."
            className="w-full bg-[#0B0E14] border border-[#2E3440] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Generate Trigger */}
        {suggestions.length === 0 && !loading && (
          <div className="text-center py-6 border border-[#2E3440] border-dashed rounded-xl mb-4 bg-[#0B0E14]/40">
            <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
              Нажмите кнопку ниже, и Gemini 3.5 предложит 3 выразительных варианта с пояснениями.
            </p>
            <button
              onClick={handleGenerate}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold text-sm shadow-lg shadow-amber-900/30 transition flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              Сгенерировать 3 варианта
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-fantasy text-amber-300">
              Совет старейшин формулирует судьбу...
            </p>
            <p className="text-xs text-slate-500 mt-1">Ожидание ответа от Gemini Flash-lite (~1-2 сек)</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-300 text-xs mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              onClick={onOpenApiKeySettings}
              className="underline text-red-200 hover:text-white"
            >
              Настроить
            </button>
          </div>
        )}

        {/* Suggestions List */}
        {suggestions.length > 0 && !loading && (
          <div className="space-y-3 mb-4 max-h-[360px] overflow-y-auto pr-1">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0B0E14] border border-[#2E3440] hover:border-amber-500/70 transition group flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-fantasy font-bold text-sm text-amber-300 group-hover:text-amber-200">
                    «{item.title}»
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onSelectSuggestion(item.title, item.description);
                    onClose();
                  }}
                  className="mt-3 self-end px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 border border-amber-500/30 hover:border-amber-500 text-amber-400 hover:text-black font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  Применить
                </button>
              </div>
            ))}

            <button
              onClick={handleGenerate}
              className="w-full py-2 border border-[#2E3440] hover:border-slate-600 rounded-lg text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Сгенерировать другие варианты
            </button>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
