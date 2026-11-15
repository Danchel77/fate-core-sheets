import { useLayoutEffect, useRef, useState } from 'react';
import { demoCharacter } from '../data/demoCharacter';
import { BlockHeader } from './BlockHeader';
import { FatePoints } from './FatePoints';
import { PortraitPlate } from './PortraitPlate';
import '../styles/portrait-plate.css';

/** Блок «Персонаж»: портрет слева, имя, жетоны судьбы и описание справа. */
export function CharacterBlock() {
  const c = demoCharacter;
  const [name, setName] = useState(c.name);
  const [description, setDescription] = useState(c.description);
  const nameRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [name]);

  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
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
            placeholder="Расскажите о герое…"
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
