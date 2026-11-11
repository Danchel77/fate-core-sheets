import React, { useState } from 'react';
import type { Character } from '../../../types/character';
import {
  evaluateStunt,
  suggestStunts,
  type StuntContext,
  type StuntEvaluation,
  type StuntSuggestionInput,
} from '../../../services/geminiStunts';
import { buildStuntDescription } from '../../../utils/stuntPhrase';
import type { StuntForm } from './StuntConstructor';
import { StuntEvaluationView } from './StuntEvaluationView';
import { StuntSuggestions } from './StuntSuggestions';

interface CharacterSkillOption {
  id: string;
  name: string;
  rating: number;
}

interface GeminiStuntPanelProps {
  draft: Character;
  form: StuntForm;
  isConstructorOpen: boolean;
  placedSkills: CharacterSkillOption[];
  skillNames: Record<string, string>;
  onApplySuggestion: (suggestion: StuntSuggestionInput) => void;
  onOpenApiKeySettings: () => void;
}

type PanelStatus = 'idle' | 'loading' | 'evaluation' | 'suggestions' | 'error' | 'no-key';

export const GeminiStuntPanel: React.FC<GeminiStuntPanelProps> = ({
  draft,
  form,
  isConstructorOpen,
  placedSkills,
  skillNames,
  onApplySuggestion,
  onOpenApiKeySettings,
}) => {
  const [status, setStatus] = useState<PanelStatus>('idle');
  const [evaluation, setEvaluation] = useState<StuntEvaluation | null>(null);
  const [suggestions, setSuggestions] = useState<StuntSuggestionInput[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastAction, setLastAction] = useState<(() => Promise<void>) | null>(null);

  // Кнопка «Оценить» активна, если конструктор открыт и заполнен хотя бы наполовину (имя + навык / ключевое поле)
  const canEvaluate =
    isConstructorOpen &&
    Boolean(form.name.trim()) &&
    (form.template === 'bonus'
      ? Boolean(form.skillId)
      : form.template === 'swap'
        ? Boolean(form.swapFromSkillId || form.swapToSkillId)
        : Boolean(form.trigger.trim() || form.effect.trim()));

  const canSuggest = placedSkills.length > 0;
  const isLoading = status === 'loading';

  const buildContext = (): StuntContext => ({
    characterName: draft.name || 'Безымянный',
    setting: draft.setting,
    skills: placedSkills.map((s) => ({ name: s.name, rating: s.rating })),
    stunts: draft.stunts
      .filter((s) => s.name.trim() || s.description.trim())
      .map((s) => (s.description ? `${s.name}: ${s.description}` : s.name)),
  });

  const buildDraftInput = (): StuntSuggestionInput => ({
    name: form.name.trim(),
    description: buildStuntDescription(form, skillNames) || form.name.trim(),
    template: form.template,
    skillId:
      form.template === 'bonus'
        ? form.skillId
        : form.template === 'swap'
          ? form.swapFromSkillId
          : undefined,
    action: form.template === 'bonus' ? form.action : undefined,
    situation:
      form.template === 'bonus' || form.template === 'swap'
        ? form.situation.trim()
        : undefined,
  });

  const handleEvaluate = async () => {
    setStatus('loading');
    setLastAction(() => handleEvaluate);
    try {
      const res = await evaluateStunt(buildDraftInput(), buildContext());
      setEvaluation(res);
      setStatus('evaluation');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'NO_API_KEY' || msg.includes('NO_API_KEY')) {
        setStatus('no-key');
      } else {
        setErrorMessage(msg);
        setStatus('error');
      }
    }
  };

  const handleSuggest = async () => {
    setStatus('loading');
    setLastAction(() => handleSuggest);
    try {
      const draftInput = canEvaluate ? buildDraftInput() : null;
      const res = await suggestStunts(buildContext(), draftInput, 3);
      setSuggestions(res);
      setStatus('suggestions');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'NO_API_KEY' || msg.includes('NO_API_KEY')) {
        setStatus('no-key');
      } else {
        setErrorMessage(msg);
        setStatus('error');
      }
    }
  };

  const renderError = () => {
    const isAuthError = errorMessage.includes('ключ не подходит') || errorMessage.includes('лимит');
    return (
      <div className="space-y-2 rounded-lg border border-[#3A2222] bg-[#180F11] p-3">
        <p className="text-xs text-red-400/90">{errorMessage}</p>
        <div className="flex gap-2">
          {isAuthError ? (
            <button
              type="button"
              onClick={onOpenApiKeySettings}
              className="cursor-pointer rounded-md border border-[#4A2D2D] px-2.5 py-1 text-xs text-red-200 transition hover:bg-[#2A1719] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30"
            >
              Настроить Gemini
            </button>
          ) : (
            lastAction && (
              <button
                type="button"
                onClick={() => lastAction()}
                className="cursor-pointer rounded-md border border-[#4A2D2D] px-2.5 py-1 text-xs text-red-200 transition hover:bg-[#2A1719] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30"
              >
                Повторить
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-fantasy text-xs font-semibold uppercase tracking-wider text-slate-300">
          Оценка трюка
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleEvaluate}
            disabled={!canEvaluate || isLoading}
            className="cursor-pointer rounded-lg border border-[#B9C9DC] bg-[#B9C9DC] px-3 py-1.5 text-xs font-semibold text-[#0B0E14] transition hover:border-[#CAD8E8] hover:bg-[#CAD8E8] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Оценить
          </button>
          <button
            type="button"
            onClick={handleSuggest}
            disabled={!canSuggest || isLoading}
            className="cursor-pointer rounded-lg border border-[#2A3444] px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Предложить три варианта
          </button>
        </div>
      </div>

      {status === 'idle' && (
        <p className="text-xs text-slate-500">
          Заполните трюк для оценки или запросите готовые варианты.
        </p>
      )}

      {status === 'loading' && (
        <div
          aria-busy="true"
          className="flex items-center gap-2 rounded-lg border border-[#202734] bg-[#0B0E14] p-3 text-xs text-slate-400"
        >
          <span className="inline-block h-2 w-2 animate-ping rounded-full bg-slate-400" />
          <span>Gemini думает…</span>
        </div>
      )}

      {status === 'no-key' && (
        <div className="space-y-2 rounded-lg border border-[#202734] bg-[#0B0E14] p-3 text-center">
          <p className="text-xs text-slate-400">Gemini не подключён</p>
          <button
            type="button"
            onClick={onOpenApiKeySettings}
            className="cursor-pointer rounded-md border border-[#2A3444] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30"
          >
            Настроить Gemini
          </button>
        </div>
      )}

      {status === 'error' && renderError()}

      {status === 'evaluation' && evaluation && (
        <StuntEvaluationView evaluation={evaluation} />
      )}

      {status === 'suggestions' && suggestions && (
        <StuntSuggestions
          suggestions={suggestions}
          onApply={onApplySuggestion}
        />
      )}
    </div>
  );
};
