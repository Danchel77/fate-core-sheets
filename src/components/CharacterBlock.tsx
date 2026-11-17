import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Character } from '../data/types';
import { BlockHeader } from './BlockHeader';
import { FatePoints } from './FatePoints';
import { PortraitPlate } from './PortraitPlate';
import '../styles/portrait-plate.css';

/** Подгоняет высоту поля под текст и прячет ползунок, пока текст помещается. */
function resizeField(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  const content = el.scrollHeight;
  const limit = parseFloat(getComputedStyle(el).maxHeight);
  el.style.height = `${content}px`;
  el.style.overflowY = Number.isFinite(limit) && content > limit + 4 ? 'auto' : 'hidden';
}

/** Блок «Персонаж»: портрет слева, имя, жетоны судьбы и описание справа. */
export function CharacterBlock({ character }: { character: Character }) {
  const c = character;
  const [name, setName] = useState(c.name);
  const [description, setDescription] = useState(c.description);
  const nameRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setName(c.name);
    setDescription(c.description);
  }, [c.name, c.description]);

  useLayoutEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    resizeField(el);
  }, [name]);

  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el) return;
    resizeField(el);
  }, [description]);

  return (
    <section className="cblock">
      <BlockHeader title="Персонаж" />
      <div className="cblock__body">
        <div className="cblock__portrait">
          <PortraitPlate src={c.portrait} alt={`Портрет: ${name || 'персонаж'}`} />
        </div>
        <div className="cblock__main">
          <textarea
            ref={nameRef}
            className="cblock__name"
            rows={1}
            value={name}
            aria-label="Имя персонажа"
            placeholder="Имя героя"
            spellCheck={false}
            onChange={(event) => setName(event.target.value)}
          />
          <FatePoints initial={c.fatePoints} refresh={c.refresh} />
          <textarea
            ref={descRef}
            className="cblock__desc"
            rows={3}
            value={description}
            aria-label="Описание персонажа"
            placeholder="Расскажите о герое"
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
