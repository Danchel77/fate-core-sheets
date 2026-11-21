import { useEffect, useRef, useState } from 'react';
import type { CharacterPatch, Consequence, StressMarks } from '../data/types';
import { BlockHeader } from './BlockHeader';
import { Hint } from './Hint';

type Props = {
  physical: number;
  mental: number;
  consequences: Consequence[];
  /** Отметки ячеек, сохранённые в листе. */
  marks?: StressMarks;
  /** Правка отметок и последствий: лист сохраняет её сразу. */
  onChange?: (patch: CharacterPatch) => void;
};

const STRESS_HINTS: Record<string, string> = {
  Физический:
    'Сколько ударов и усталости герой выдерживает. За удар отмечают одну ячейку: её номер — сколько сдвигов она поглощает; когда все заняты, удар уходит в последствия. Число ячеек зависит от Телосложения.',
  Ментальный:
    'Сколько страха и давления выдерживает психика. За удар отмечают одну ячейку: её номер — сколько сдвигов она поглощает; когда все заняты, удар уходит в последствия. Число ячеек зависит от Воли.',
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
        <span className="str__track-label">
          <Hint title={`${label} стресс`} text={STRESS_HINTS[label]}>
            {label}
          </Hint>
        </span>
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
            <span className="str__box-num">{index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConsequenceSlot({
  consequence,
  value,
  onChange,
}: {
  consequence: Consequence;
  value: string;
  onChange: (text: string) => void;
}) {
  const lineRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;

    const grow = () => {
      line.style.height = 'auto';
      line.style.height = `${line.scrollHeight}px`;
    };

    grow();
    window.addEventListener('resize', grow);
    return () => window.removeEventListener('resize', grow);
  }, [value]);

  return (
    <div className="str__slot">
      <div className="str__slot-head">
        <span className="str__slot-value">{consequence.value}</span>
        <span className="str__slot-kind">{consequence.kind}</span>
      </div>
      <textarea
        ref={lineRef}
        className="str__slot-line"
        rows={1}
        value={value}
        aria-label={`Последствие: ${consequence.kind}, ${consequence.value}`}
        placeholder="Аспект…"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/** Ячейки всегда считаются из навыков; сохранённые отметки добиваем пустыми. */
function fillMarks(count: number, saved: boolean[] | undefined): boolean[] {
  return Array.from({ length: count }, (_, index) => saved?.[index] ?? false);
}

/** Блок «Стресс и последствия»: две короткие дорожки и три поля для аспектов. */
export function StressBlock({ physical, mental, consequences, marks, onChange }: Props) {
  const [physicalMarks, setPhysicalMarks] = useState<boolean[]>(() =>
    fillMarks(physical, marks?.physical),
  );
  const [mentalMarks, setMentalMarks] = useState<boolean[]>(() =>
    fillMarks(mental, marks?.mental),
  );
  const [texts, setTexts] = useState(() => consequences.map((item) => item.text ?? ''));

  const toggle = (kind: 'physical' | 'mental', index: number) => {
    // Ячеек может стать больше, чем сохранённых отметок: добиваем дорожку до нужной длины.
    const current =
      kind === 'physical' ? fillMarks(physical, physicalMarks) : fillMarks(mental, mentalMarks);
    const next = current.map((marked, i) => (i === index ? !marked : marked));
    const nextPhysical = kind === 'physical' ? next : physicalMarks;
    const nextMental = kind === 'mental' ? next : mentalMarks;

    if (kind === 'physical') setPhysicalMarks(next);
    else setMentalMarks(next);

    onChange?.({
      marks: {
        physical: fillMarks(physical, nextPhysical),
        mental: fillMarks(mental, nextMental),
      },
    });
  };

  const setText = (index: number, text: string) => {
    const next = texts.map((item, i) => (i === index ? text : item));
    setTexts(next);
    onChange?.({
      consequences: consequences.map((item, i) => ({ ...item, text: next[i] ?? item.text })),
    });
  };

  return (
    <section className="str">
      <BlockHeader title="Стресс и последствия" />
      <div className="str__body">
        <div className="str__tracks">
          <Track
            label="Физический"
            skill="Телосложение"
            count={physical}
            marks={physicalMarks}
            onToggle={(index) => toggle('physical', index)}
          />
          <Track
            label="Ментальный"
            skill="Воля"
            count={mental}
            marks={mentalMarks}
            onToggle={(index) => toggle('mental', index)}
          />
        </div>

        <div className="str__slots" role="group" aria-label="Последствия">
          {consequences.map((consequence, index) => (
            <ConsequenceSlot
              key={`${consequence.kind}-${consequence.value}-${index}`}
              consequence={consequence}
              value={texts[index]}
              onChange={(text) => setText(index, text)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
