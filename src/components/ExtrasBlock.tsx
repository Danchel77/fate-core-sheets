import { useEffect, useRef, useState } from 'react';
import { BlockHeader } from './BlockHeader';
import '../styles/extras-block.css';

type Props = {
  initial: [string, string];
};

type GrowingAreaProps = {
  index: number;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

/** Свободное поле «Дополнений»: начинается с четырёх строк и растёт под текст. */
function GrowingArea({ index, value, onChange, placeholder }: GrowingAreaProps) {
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;

    const grow = () => {
      area.style.height = 'auto';
      area.style.height = `${area.scrollHeight}px`;
    };

    grow();
    window.addEventListener('resize', grow);
    return () => window.removeEventListener('resize', grow);
  }, [value]);

  return (
    <div className="ext__field">
      <span className="ext__index" aria-hidden="true">
        {index === 1 ? 'I' : 'II'}
      </span>
      <textarea
        ref={areaRef}
        className="ext__area"
        rows={4}
        value={value}
        aria-label={`Дополнение, поле ${index}`}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/** Блок «Дополнения»: два свободных поля для заметок, снаряжения и связей. */
export function ExtrasBlock({ initial }: Props) {
  const [values, setValues] = useState<[string, string]>(initial);

  const setValue = (index: 0 | 1, next: string) => {
    setValues((current) => {
      const updated: [string, string] = [...current];
      updated[index] = next;
      return updated;
    });
  };

  return (
    <section className="ext">
      <BlockHeader title="Дополнения" />
      <div className="ext__fields">
        <GrowingArea
          index={1}
          value={values[0]}
          onChange={(next) => setValue(0, next)}
          placeholder="Заметки, снаряжение, связи…"
        />
        <GrowingArea
          index={2}
          value={values[1]}
          onChange={(next) => setValue(1, next)}
          placeholder="Продолжение…"
        />
      </div>
    </section>
  );
}
