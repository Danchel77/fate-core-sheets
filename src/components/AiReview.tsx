import { useCallback, useEffect, useRef, useState } from 'react';
import { IconChevronDown, IconCopy, IconSparkles } from './icons';
import { openAuthDialog, useAuth } from '../firebase/authStore';
import {
  buildManualPrompt,
  QuotaError,
  reviewBatch,
  reviewElement,
  reviewErrorMessage,
  type BatchResult,
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
  items: string[];
};

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; review: ReviewResult }
  | { status: 'batch'; batch: BatchResult }
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

function CardHead({
  score,
  verdict,
  collapsed,
  onToggle,
}: {
  score: number;
  verdict: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" className="ai-review__head" aria-expanded={!collapsed} onClick={onToggle}>
      <span className="ai-review__score">
        <strong>{score}</strong>
        <span>/5</span>
      </span>
      <span className="ai-review__verdict">{capitalise(verdict)}</span>
      <IconChevronDown className="ai-review__chev" />
    </button>
  );
}

function ReviewCard({ result }: { result: ReviewResult }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <article className={`ai-review${collapsed ? ' is-collapsed' : ''}`}>
      <CardHead
        score={result.score}
        verdict={result.verdict}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

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

          <div className="ai-review__block ai-review__block--issues">
            <h4>Что не так</h4>
            <ul>
              {result.issues.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="ai-review__block ai-review__block--better">
            <h4>Как будет лучше</h4>
            <ul>
              {result.variants.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {result.overlap && <p className="ai-review__overlap">{result.overlap}</p>}
        </div>
      )}
    </article>
  );
}

/** Разбор трёх аспектов или трёх трюков: по строке на поле и общий блок правок. */
function BatchCard({
  batch,
  noun,
  genitive,
  items,
}: {
  batch: BatchResult;
  noun: string;
  genitive: string;
  items: string[];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const fixes = batch.slots.filter((slot) => slot.variants.length > 0);

  return (
    <article className={`ai-review${collapsed ? ' is-collapsed' : ''}`}>
      <CardHead
        score={batch.score}
        verdict={batch.verdict}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      {!collapsed && (
        <div className="ai-review__body">
          <div className="ai-review__block">
            <h4>Разбор</h4>
            <ul>
              {batch.slots.map((slot) => {
                const text = items[slot.slot]?.trim();
                return (
                  <li key={slot.slot}>
                    <b>
                      {noun} {slot.slot + 1}.
                    </b>{' '}
                    <span className="ai-review__slot-text">{text ? `«${text}»` : '(пусто)'}</span>
                    <span className="ai-review__slot-note">{slot.note}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {fixes.length > 0 && (
            <div className="ai-review__block ai-review__block--better">
              <h4>Что предлагаю</h4>
              <ul>
                {fixes.map((slot) => (
                  <li key={slot.slot}>
                    {items[slot.slot]?.trim()
                      ? `Вместо ${genitive} ${slot.slot + 1}`
                      : `Для пустого поля ${slot.slot + 1}`}{' '}
                    — {slot.variants.join(' / ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function AiReview({ kind, setting, label, text, concept, trouble, items }: Props) {
  const { ready, user } = useAuth();
  const [state, setState] = useState<State>({ status: 'idle' });
  const quotaUntil = useQuotaUntil();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const pendingAuth = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const copiedTimer = useRef<number | null>(null);
  const batch = kind === 'aspects' || kind === 'stunts';
  const noun = kind === 'stunts' ? 'Трюк' : 'Аспект';
  const genitive = kind === 'stunts' ? 'трюка' : 'аспекта';
  const filled = batch ? items.some((value) => value.trim().length > 0) : text.trim().length > 0;
  const quotaActive = quotaUntil !== null && quotaUntil > Date.now();

  useEffect(() => {
    return () => {
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
    };
  }, []);

  /* Меню закрывается кликом мимо и по Esc; Esc не закрывает окно конструктора. */
  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (moreRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [menuOpen]);

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
    const input: ReviewInput = { kind, setting, text, concept, trouble, items };
    try {
      if (batch) {
        setState({ status: 'batch', batch: await reviewBatch(input) });
      } else {
        setState({ status: 'ready', review: await reviewElement(input) });
      }
    } catch (error) {
      if (error instanceof QuotaError) {
        setQuotaUntil(error.resetAt);
        setState({ status: 'idle' });
        return;
      }
      setState({ status: 'error', message: reviewErrorMessage(error) });
    }
  }, [items, batch, concept, filled, kind, setting, text, trouble, user, quotaUntil]);

  const copyPrompt = useCallback(async () => {
    if (!filled) return;
    setCopyError(null);
    try {
      await writeClipboard(buildManualPrompt({ kind, setting, text, concept, trouble, items }));
      setCopied(true);
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 4000);
    } catch {
      setCopyError('Не удалось скопировать. Попробуйте ещё раз.');
    }
  }, [items, concept, filled, kind, setting, text, trouble]);

  useEffect(() => {
    setState({ status: 'idle' });
    setCopied(false);
    setCopyError(null);
    pendingAuth.current = false;
  }, [text, concept, trouble, items]);

  useEffect(() => {
    if (ready && user && pendingAuth.current) {
      pendingAuth.current = false;
      void run();
    }
  }, [ready, run, user]);

  const busy = state.status === 'loading';

  return (
    <div className="ai-review-wrap">
      <div className="ai-review__actions">
        {quotaActive ? (
          /* Лимит кончился: единственное действие — скопировать промпт. */
          <button
            type="button"
            className="ai-review__copy ai-review__copy--primary"
            onClick={() => void copyPrompt()}
            disabled={!filled}
            aria-label={`${label}: скопировать промпт для нейросети`}
          >
            <IconCopy />
            {copied ? 'Скопировано' : 'Промпт'}
          </button>
        ) : (
          <>
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
            <button
              type="button"
              ref={moreRef}
              className="ai-review__caret"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Скопировать промпт для нейросети"
              title="Скопировать промпт"
              onClick={() => setMenuOpen((value) => !value)}
              disabled={!filled}
            >
              <IconChevronDown />
            </button>
          </>
        )}

        {menuOpen && (
          <div className="ai-review__menu" role="menu" ref={menuRef}>
            <button
              type="button"
              role="menuitem"
              className="ai-review__menuitem"
              autoFocus
              onClick={() => {
                setMenuOpen(false);
                void copyPrompt();
              }}
            >
              <IconCopy />
              Промпт
            </button>
          </div>
        )}
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

      {state.status === 'ready' && <ReviewCard result={state.review} />}
      {state.status === 'batch' && (
        <BatchCard batch={state.batch} noun={noun} genitive={genitive} items={items} />
      )}
    </div>
  );
}
