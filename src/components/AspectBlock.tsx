import { useEffect, useRef, useState } from 'react';
import type { Aspect } from '../data/demoCharacter';
import { BlockHeader } from './BlockHeader';

const HINTS: Record<string, string> = {
  'Концепция': 'Профессия плюс яркая черта. Должна и помогать, и мешать: «Ведьмак, который не берёт денег с бедных».',
  'Проблема': 'То, что постоянно втягивает героя в неприятности. Мешает жить, но не парализует.',
  'Первое приключение': 'Случай, с которого началась история героя. Даёт ему связь с миром и повод в него вернуться.',
  'Переплетение судеб': 'Связь с другим героем: дружба, долг, соперничество. Можно взять дважды.',
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
  className?: string;
};

function AutoTextarea({ value, onChange, placeholder, label, className }: AutoTextareaProps) {
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
      className={className}
      value={value}
      rows={1}
      aria-label={label}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export type AspectVariant = 'rows' | 'cards' | 'print';

type Props = {
  variant: AspectVariant;
  aspects: Aspect[];
};

/** Блок «Аспекты»: пять редактируемых карточек с подсказками. */
export function AspectBlock({ variant, aspects }: Props) {
  const [values, setValues] = useState(aspects.map((aspect) => aspect.text));
  const [openHint, setOpenHint] = useState<number | null>(null);

  const setValue = (index: number, text: string) => {
    setValues((prev) => prev.map((item, i) => (i === index ? text : item)));
  };

  return (
    <section className={`ablock ablock--${variant}`}>
      <BlockHeader variant="lozenge" title="Аспекты" />
      <div className="ablock__list">
        {aspects.map((aspect, index) => (
          <div className="aspect" key={`${aspect.label}-${index}`}>
            <div className="aspect__head">
              <span className="aspect__label">{aspect.label}</span>
              <button
                type="button"
                className="aspect__help"
                aria-expanded={openHint === index}
                aria-label={`Подсказка: ${aspect.label}`}
                onClick={() => setOpenHint(openHint === index ? null : index)}
              >
                ?
              </button>
            </div>
            <AutoTextarea
              className="aspect__text"
              label={aspect.label}
              value={values[index]}
              placeholder={PLACEHOLDERS[aspect.label]}
              onChange={(text) => setValue(index, text)}
            />
            {openHint === index && <p className="aspect__hint">{HINTS[aspect.label]}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
