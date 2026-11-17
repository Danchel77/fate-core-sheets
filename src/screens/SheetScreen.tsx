import { useEffect, useState } from 'react';
import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { SkillsEditor } from '../components/SkillsEditor';
import { StuntBlock } from '../components/StuntBlock';
import { StressBlock } from '../components/StressBlock';
import { ExtrasBlock } from '../components/ExtrasBlock';
import { IconArrowLeft } from '../components/icons';
import { PortraitDialog } from '../components/PortraitDialog';
import type { Character } from '../data/types';
import '../styles/sheet.css';
import '../styles/character-block.css';
import '../styles/aspect-block.css';
import '../styles/skills-editor.css';
import '../styles/hint.css';

/** Собранный веб-лист: единственный источник правды. */
export default function SheetScreen({ character }: { character: Character }) {
  const level = character.ladder[0]?.value ?? 1;
  const [portrait, setPortrait] = useState(character.portrait ?? '');
  const [portraitOpen, setPortraitOpen] = useState(false);

  useEffect(() => {
    setPortrait(character.portrait ?? '');
  }, [character.portrait]);

  return (
    <div className="table">
      <nav className="sheet-nav">
        <a href="#/">
          <IconArrowLeft />
          Мои персонажи
        </a>
      </nav>
      <main className="book" aria-label="Лист персонажа">
        <article className="page page--left">
          <CharacterBlock
            character={character}
            portrait={portrait}
            onPortraitClick={() => setPortraitOpen(true)}
          />
          <StressBlock
            physical={character.physicalStress}
            mental={character.mentalStress}
            consequences={character.consequences}
          />
          <AspectBlock aspects={character.aspects} />
        </article>

        <article className="page page--right">
          <SkillsEditor initial={character.ladder} initialLevel={level} />
          <StuntBlock stunts={character.stunts} baseRefresh={character.refresh} />
          <ExtrasBlock initial={character.extras} />
        </article>
      </main>
      {portraitOpen && (
        <PortraitDialog
          src={portrait}
          alt={`Портрет: ${character.name || 'персонаж'}`}
          onClose={() => setPortraitOpen(false)}
          onChange={setPortrait}
        />
      )}
    </div>
  );
}
