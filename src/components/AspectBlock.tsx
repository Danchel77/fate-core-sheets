import { useEffect, useRef, useState } from 'react';
import type { Aspect } from '../data/demoCharacter';
import { BlockHeader } from './BlockHeader';
import { Hint, type HintVariant } from './Hint';

const HINTS: Record<string, string> = {
  'Концепция':
    'Одна фраза о том, кто герой и чем живёт. Судьба станет и опорой, и ловушкой.',
  'Проблема':
    'То, что вечно тянет героя в неприятности: клятва, долг, дурная привычка или старый враг.',
  'Первое приключение':
    'С чего началась история. Даёт герою корни, связи и повод снова отправиться в путь.',
  'Переплетение судеб':
    'Узы с другим героем: долг, дружба, соперничество. Судьба связывает крепче клятвы.',
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

  const setValue = (index: number, text: string) => {
    setValues((prev) => prev.map((item, i) => (i === index ? text : item)));
  };

  return (
    <section className="ablock">
      <BlockHeader variant="lozenge" title="Аспекты" />
      <div className="ablock__list">
        {aspects.map((aspect, index) => (
          <div className="aspect" key={`${aspect.label}-${index}`}>
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
      </div>
    </section>
  );
}
