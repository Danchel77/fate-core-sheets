import { useEffect, useRef, useState } from 'react';
import type { Character } from '../data/demoCharacter';
import { BlockHeader } from './BlockHeader';
import { Hint } from './Hint';
import '../styles/stress-block.css';

type Consequence = Character['consequences'][number];

type Props = {
  physical: number;
  mental: number;
  consequences: Consequence[];
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
        <span className="str__slot-kind">{consequence.kind}</span>
        <span className="str__slot-value">{consequence.value}</span>
      </div>
      <textarea
        ref={lineRef}
        className="str__slot-line"
        rows={1}
        value={value}
        aria-label={`Последствие: ${consequence.kind}, ${consequence.value}`}
        placeholder="Аспект"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/** Блок «Стресс и последствия»: две короткие дорожки и три поля для аспектов. */
export function StressBlock({ physical, mental, consequences }: Props) {
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
    <section className="str">
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

        <div className="str__slots" role="group" aria-label="Последствия">
          {consequences.map((consequence, index) => (
            <ConsequenceSlot
              key={`${consequence.kind}-${consequence.value}-${index}`}
              consequence={consequence}
              value={texts[index]}
              onChange={(text) => setTexts((prev) => prev.map((item, i) => (i === index ? text : item)))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
