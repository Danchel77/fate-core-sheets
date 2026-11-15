import { useEffect, useRef, useState } from 'react';
import type { Character } from '../data/demoCharacter';
import { BlockHeader } from './BlockHeader';

export type StressVariant = 'rows' | 'cards' | 'board';

type Consequence = Character['consequences'][number];

type Props = {
  variant: StressVariant;
  physical: number;
  mental: number;
  consequences: Consequence[];
};

type TrackProps = {
  label: string;
  skill: string;
  count: number;
  marks: boolean[];
  onToggle: (index: number) => void;
};

function Track({ label, skill, count, marks, onToggle }: TrackProps) {
  return (
    <div className="str__track">
      <div className="str__track-head">
        <span className="str__track-label">{label}</span>
        <span className="str__track-skill">{skill}</span>
      </div>
      <div className="str__boxes" role="group" aria-label={`Стресс: ${label.toLowerCase()}`}>
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            className={`str__box${marks[index] ? ' is-filled' : ''}`}
            aria-pressed={marks[index]}
            aria-label={`${label}: ячейка ${index + 1}`}
            title={`Отметить или снять ячейку ${index + 1}`}
            onClick={() => onToggle(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConsequenceSlot({
  consequence,
  extra,
  value,
  onChange,
}: {
  consequence: Consequence;
  extra: boolean;
  value: string;
  onChange: (text: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="str__slot">
      <div className="str__slot-head">
        <span className="str__slot-value">{consequence.value}</span>
        <span className="str__slot-kind">
          {consequence.kind}
          {extra ? ' (доп.)' : ''}
        </span>
      </div>
      <textarea
        ref={ref}
        className="str__slot-line"
        rows={1}
        value={value}
        aria-label={`Последствие: ${consequence.kind}${extra ? ', дополнительное' : ''}`}
        placeholder="Что случилось?"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/** Блок «Стресс и последствия»: две дорожки стресса и четыре слота последствий. */
export function StressBlock({ variant, physical, mental, consequences }: Props) {
  const [physicalMarks, setPhysicalMarks] = useState<boolean[]>(() => Array(physical).fill(false));
  const [mentalMarks, setMentalMarks] = useState<boolean[]>(() => Array(mental).fill(false));
  const [texts, setTexts] = useState(() => consequences.map((item) => item.text ?? ''));

  const toggle = (
    marks: boolean[],
    setMarks: (next: boolean[]) => void,
    index: number,
  ) => {
    setMarks(marks.map((marked, i) => (i === index ? !marked : marked)));
  };

  return (
    <section className={`str str--${variant}`}>
      <BlockHeader title="Стресс и последствия" />
      <div className="str__body">
        <div className="str__tracks">
          <Track
            label="Физический"
            skill="Телосложение"
            count={physical}
            marks={physicalMarks}
            onToggle={(index) => toggle(physicalMarks, setPhysicalMarks, index)}
          />
          <Track
            label="Ментальный"
            skill="Воля"
            count={mental}
            marks={mentalMarks}
            onToggle={(index) => toggle(mentalMarks, setMentalMarks, index)}
          />
        </div>

        <div className="str__consequences">
          <p className="str__subhead">Последствия</p>
          <div className="str__slots">
            {consequences.map((consequence, index) => (
              <ConsequenceSlot
                key={`${consequence.kind}-${consequence.value}-${index}`}
                consequence={consequence}
                extra={
                  consequence.kind === 'лёгкое' &&
                  consequences.slice(0, index).some((item) => item.kind === 'лёгкое')
                }
                value={texts[index]}
                onChange={(text) => setTexts((prev) => prev.map((item, i) => (i === index ? text : item)))}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
