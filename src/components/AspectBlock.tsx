import { useEffect, useRef, useState } from 'react';
import type { Aspect } from '../data/demoCharacter';
import { BlockHeader } from './BlockHeader';
import { Hint, type HintVariant } from './Hint';

/**
 * Как разделить два подписанных якоря и три свободных поля внутри ОДНОГО блока.
 * marks — приём из списков с ромбами, оставлен как заготовка для будущих списков.
 */
export type AspectVariant = 'strong' | 'double' | 'gap' | 'marks';

const HINTS: Record<string, string> = {
  'Концепция':
    'Одна фраза о том, кто герой и чем живёт. Судьба станет и опорой, и ловушкой.',
  'Проблема':
    'То, что вечно тянет героя в неприятности: клятва, долг, дурная привычка или старый враг.',
};

const PLACEHOLDERS: Record<string, string> = {
  'Концепция': 'Кто вы одной фразой?',
  'Проблема': 'Что вечно втягивает вас в беду?',
};

const FREE_PLACEHOLDERS = [
  'Серебряный меч отца',
  'Мясник из Блавикена',
  'Долг перед Гильдией',
];

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
      className="arow__text"
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
  variant: AspectVariant;
};

/** Блок «Аспекты»: один блок, два якоря с подписями и три свободные строки. */
export function AspectBlock({ aspects, hintVariant, variant }: Props) {
  const [values, setValues] = useState(aspects.map((aspect) => aspect.text));

  const setValue = (index: number, text: string) => {
    setValues((prev) => prev.map((item, i) => (i === index ? text : item)));
  };

  const anchors = aspects.slice(0, 2);
  const free = aspects.slice(2);
  const hasDivider = variant !== 'marks';

  return (
    <section className={`ablock ablock--${variant}`}>
      <BlockHeader variant="lozenge" title="Аспекты" />
      <div className="ablock__list">
        {anchors.map((aspect, index) => (
          <div
            className={`arow arow--anchor${
              hasDivider && index === anchors.length - 1 ? ' arow--last-anchor' : ''
            }`}
            key={`${aspect.label}-${index}`}
          >
            <Hint
              variant={hintVariant}
              title={aspect.label}
              text={HINTS[aspect.label] ?? ''}
            >
              {aspect.label}
            </Hint>
            <AutoTextarea
              value={values[index]}
              onChange={(text) => setValue(index, text)}
              placeholder={PLACEHOLDERS[aspect.label]}
              label={aspect.label}
            />
          </div>
        ))}

        {hasDivider && (
          <div className="ablock__divider" aria-hidden="true">
            <span />
          </div>
        )}

        <div className="ablock__free">
          {free.map((_, index) => (
            <div className="arow arow--free" key={`free-${index}`}>
              {variant === 'marks' && <span className="arow__mark" aria-hidden="true" />}
              <AutoTextarea
                value={values[index + 2]}
                onChange={(text) => setValue(index + 2, text)}
                placeholder={FREE_PLACEHOLDERS[index % FREE_PLACEHOLDERS.length]}
                label={`Свободный аспект ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
