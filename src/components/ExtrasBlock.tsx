import { useEffect, useRef, useState } from 'react';
import { BlockHeader } from './BlockHeader';
import '../styles/extras-block.css';

type Props = {
  initial: [string, string];
  initialTitles?: [string, string];
  /** Оба поля и их заголовки: лист сохраняет правку сразу. */
  onChange?: (extras: [string, string], titles: [string, string]) => void;
};

type GrowingAreaProps = {
  index: number;
  title: string;
  value: string;
  onTitleChange: (value: string) => void;
  onChange: (value: string) => void;
  placeholder: string;
};

const DEFAULT_TITLES: [string, string] = ['Заметки I', 'Заметки II'];

/** Свободное поле «Дополнений»: начинается с четырёх строк и растёт под текст. */
function GrowingArea({
  index,
  title,
  value,
  onTitleChange,
  onChange,
  placeholder,
}: GrowingAreaProps) {
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
      <input
        className="ext__index"
        type="text"
        value={title}
        maxLength={40}
        aria-label={`Заголовок поля ${index}`}
        placeholder={DEFAULT_TITLES[index - 1]}
        onChange={(event) => onTitleChange(event.target.value)}
        onBlur={() => {
          if (!title.trim()) onTitleChange(DEFAULT_TITLES[index - 1]);
        }}
      />
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
export function ExtrasBlock({ initial, initialTitles, onChange }: Props) {
  const [values, setValues] = useState<[string, string]>(initial);
  const [titles, setTitles] = useState<[string, string]>(initialTitles ?? DEFAULT_TITLES);

  const setValue = (index: 0 | 1, next: string) => {
    const updated: [string, string] = [...values];
    updated[index] = next;
    setValues(updated);
    onChange?.(updated, titles);
  };

  const setTitle = (index: 0 | 1, next: string) => {
    const updated: [string, string] = [...titles];
    updated[index] = next;
    setTitles(updated);
    onChange?.(values, updated);
  };

  return (
    <section className="ext">
      <BlockHeader title="Дополнения" />
      <div className="ext__fields">
        <GrowingArea
          index={1}
          title={titles[0]}
          value={values[0]}
          onTitleChange={(next) => setTitle(0, next)}
          onChange={(next) => setValue(0, next)}
          placeholder="Заметки, снаряжение, связи…"
        />
        <GrowingArea
          index={2}
          title={titles[1]}
          value={values[1]}
          onTitleChange={(next) => setTitle(1, next)}
          onChange={(next) => setValue(1, next)}
          placeholder="Продолжение…"
        />
      </div>
    </section>
  );
}
