import { useEffect, useRef, useState } from 'react';
import type { Aspect } from '../data/demoCharacter';
import { BlockHeader } from './BlockHeader';
import { HintPanel, HintWord, type HintVariant } from './HintWord';

const HINTS: Record<string, string> = {
  'Концепция':
    'Профессия плюс яркая черта. Должна и помогать, и мешать: «Ведьмак, который не берёт денег с бедных».',
  'Проблема': 'То, что постоянно втягивает героя в неприятности. Мешает жить, но не парализует.',
  'Первое приключение':
    'Случай, с которого началась история героя. Даёт ему связь с миром и повод в него вернуться.',
  'Переплетение судеб':
    'Связь с другим героем: дружба, долг, соперничество. Можно взять дважды.',
};

const PLACEHOLDERS: Record<string, string> = {
  'Концепция': 'Кто вы одной фразой?',
  'Проблема': 'Что вечно втягивает вас в беду?',
  'Первое приключение': 'С чего началась ваша история?',
  'Переплетение судеб': 'Кто связан с вами судьбой?',
};

type AutoTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
};

function AutoTextarea({ value, onChange, placeholder, label }: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      className="aspect__text"
      value={value}
      rows={1}
      aria-label={label}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

type Props = {
  aspects: Aspect[];
  hintVariant: HintVariant;
};

/** Блок «Аспекты»: подписи-подсказки сверху, редактируемый текст на линии. */
export function AspectBlock({ aspects, hintVariant }: Props) {
  const [values, setValues] = useState(aspects.map((aspect) => aspect.text));
  const [openHint, setOpenHint] = useState<number | null>(null);

  const setValue = (index: number, text: string) => {
    setValues((prev) => prev.map((item, i) => (i === index ? text : item)));
  };

  return (
    <section className="ablock">
      <BlockHeader variant="lozenge" title="Аспекты" />
      <div className="ablock__list">
        {aspects.map((aspect, index) => {
          const open = openHint === index;
          const panelId = `${hintVariant}-aspect-hint-${index}`;
          return (
            <div className={`aspect${open ? ' aspect--open' : ''}`} key={`${aspect.label}-${index}`}>
              <HintWord
                variant={hintVariant}
                title={aspect.label}
                open={open}
                controls={panelId}
                onToggle={() => setOpenHint(open ? null : index)}
              />
              <AutoTextarea
                value={values[index]}
                onChange={(text) => setValue(index, text)}
                placeholder={PLACEHOLDERS[aspect.label]}
                label={aspect.label}
              />
              {open && (
                <HintPanel
                  id={panelId}
                  variant={hintVariant}
                  title={aspect.label}
                  text={HINTS[aspect.label] ?? ''}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
