import { useCallback, useEffect, useRef, useState } from 'react';
import { IconChevronDown, IconCopy, IconSparkles } from './icons';
import { openAuthDialog, useAuth } from '../firebase/authStore';
import {
  buildManualPrompt,
  QuotaError,
  reviewElement,
  reviewErrorMessage,
  type ReviewInput,
  type ReviewResult,
} from '../ai/review';
import { setQuotaUntil, useQuotaUntil } from '../ai/quota';
import '../styles/ai-review.css';

type Props = {
  kind: ReviewInput['kind'];
  setting: ReviewInput['setting'];
  label: string;
  text: string;
  concept: string;
  trouble: string;
  aspects: string[];
};

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; result: ReviewResult }
  | { status: 'error'; message: string };

function capitalise(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

async function writeClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* ниже — запасной способ */
    }
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(area);
  if (!copied) throw new Error('clipboard');
}

function ReviewCard({ result }: { result: ReviewResult }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <article className={`ai-review${collapsed ? ' is-collapsed' : ''}`}>
      <button
        type="button"
        className="ai-review__head"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((value) => !value)}
      >
        <span className="ai-review__score">
          <strong>{result.score}</strong>
          <span>/5</span>
        </span>
        <span className="ai-review__verdict">{capitalise(result.verdict)}</span>
        <IconChevronDown className="ai-review__chev" />
      </button>

      {!collapsed && (
        <div className="ai-review__body">
          <div className="ai-review__block">
            <h4>Что хорошо</h4>
            <ul>
              {result.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="ai-review__block">
            <h4>Что усилить</h4>
            <ul>
              {result.advice.map((item) => (
                <li key={`${item.what}-${item.how}`}>
                  <b>{item.what}</b> {item.how}
                </li>
              ))}
            </ul>
          </div>

          {result.overlap && <p className="ai-review__overlap">{result.overlap}</p>}

          {result.example && (
            <p className="ai-review__example">
              <span>Пример</span> {result.example}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export function AiReview({ kind, setting, label, text, concept, trouble, aspects }: Props) {
  const { ready, user } = useAuth();
  const [state, setState] = useState<State>({ status: 'idle' });
  const quotaUntil = useQuotaUntil();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const pendingAuth = useRef(false);
  const copiedTimer = useRef<number | null>(null);
  const filled = text.trim().length > 0;
  const quotaActive = quotaUntil !== null && quotaUntil > Date.now();

  useEffect(() => {
    return () => {
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
    };
  }, []);

  const run = useCallback(async () => {
    if (!user) {
      pendingAuth.current = true;
      openAuthDialog();
      return;
    }
    if (!filled) {
      setState({ status: 'error', message: 'Сначала заполните поле.' });
      return;
    }
    if (quotaUntil !== null && quotaUntil > Date.now()) return;
    setState({ status: 'loading' });
    setCopied(false);
    setCopyError(null);
    try {
      const result = await reviewElement({ kind, setting, text, concept, trouble, aspects });
      setState({ status: 'ready', result });
    } catch (error) {
      if (error instanceof QuotaError) {
        setQuotaUntil(error.resetAt);
        setState({ status: 'idle' });
        return;
      }
      setState({ status: 'error', message: reviewErrorMessage(error) });
    }
  }, [aspects, concept, filled, kind, setting, text, trouble, user, quotaUntil]);

  const copyPrompt = useCallback(async () => {
    if (!filled) return;
    setCopyError(null);
    try {
      await writeClipboard(buildManualPrompt({ kind, setting, text, concept, trouble, aspects }));
      setCopied(true);
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 4000);
    } catch {
      setCopyError('Не удалось скопировать. Попробуйте ещё раз.');
    }
  }, [aspects, concept, filled, kind, setting, text, trouble]);

  useEffect(() => {
    setState({ status: 'idle' });
    setCopied(false);
    setCopyError(null);
    pendingAuth.current = false;
  }, [text, concept, trouble, aspects]);

  useEffect(() => {
    if (ready && user && pendingAuth.current) {
      pendingAuth.current = false;
      void run();
    }
  }, [ready, run, user]);

  const busy = state.status === 'loading';
  const copyLabel = copied ? 'Скопировано' : 'Скопировать промпт';

  return (
    <div className="ai-review-wrap">
      <div className="ai-review__actions">
        {!quotaActive && (
          <button
            type="button"
            className="ai-review__check"
            onClick={() => void run()}
            disabled={busy || !filled}
            aria-label={`${label}: проверить`}
          >
            <IconSparkles />
            {busy ? 'Проверяем…' : 'Проверить'}
          </button>
        )}
        <button
          type="button"
          className={`ai-review__copy${quotaActive ? ' ai-review__copy--primary' : ''}`}
          onClick={() => void copyPrompt()}
          disabled={!filled}
          aria-label={`${label}: скопировать промпт для нейросети`}
        >
          <IconCopy />
          {copyLabel}
        </button>
      </div>

      {copied && (
        <p className="ai-review__copied" role="status">
          Промпт скопирован. Вставьте его в Gemini или другой чат.
        </p>
      )}

      {copyError && (
        <p className="ai-review__error" role="alert">
          {copyError}
        </p>
      )}

      {state.status === 'error' && (
        <p className="ai-review__error" role="alert">
          {state.message}
        </p>
      )}

      {state.status === 'ready' && <ReviewCard result={state.result} />}
    </div>
  );
}
