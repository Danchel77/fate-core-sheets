import { useCallback, useEffect, useRef, useState } from 'react';
import { IconChevronDown, IconSparkles } from './icons';
import { openAuthDialog, useAuth } from '../firebase/authStore';
import { reviewElement, reviewErrorMessage, type ReviewInput, type ReviewResult } from '../ai/review';
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

const DAILY_LIMIT = 10;

function limitKey(uid: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return `fate-ai-reviews:${uid}:${day}`;
}

function usedToday(uid: string): number {
  try {
    const raw = localStorage.getItem(limitKey(uid));
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function countCheck(uid: string): void {
  try {
    localStorage.setItem(limitKey(uid), String(usedToday(uid) + 1));
  } catch {
    /* приватный режим — лимит не сохранится */
  }
}

function capitalise(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
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
  const pendingAuth = useRef(false);
  const filled = text.trim().length > 0;

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
    if (usedToday(user.uid) >= DAILY_LIMIT) {
      setState({ status: 'error', message: 'На сегодня проверки закончились. Попробуйте завтра.' });
      return;
    }
    setState({ status: 'loading' });
    try {
      const result = await reviewElement({ kind, setting, text, concept, trouble, aspects });
      countCheck(user.uid);
      setState({ status: 'ready', result });
    } catch (error) {
      setState({ status: 'error', message: reviewErrorMessage(error) });
    }
  }, [aspects, concept, filled, kind, setting, text, trouble, user]);

  useEffect(() => {
    setState({ status: 'idle' });
    pendingAuth.current = false;
  }, [text, concept, trouble, aspects]);

  useEffect(() => {
    if (ready && user && pendingAuth.current) {
      pendingAuth.current = false;
      void run();
    }
  }, [ready, run, user]);

  const busy = state.status === 'loading';

  return (
    <div className="ai-review-wrap">
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

      {state.status === 'error' && (
        <p className="ai-review__error" role="alert">
          {state.message}
        </p>
      )}

      {state.status === 'ready' && <ReviewCard result={state.result} />}
    </div>
  );
}
