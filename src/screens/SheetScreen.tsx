import { useEffect, useState } from 'react';
import { AspectBlock } from '../components/AspectBlock';
import { CharacterBlock } from '../components/CharacterBlock';
import { SkillsEditor } from '../components/SkillsEditor';
import { StuntBlock } from '../components/StuntBlock';
import { StressBlock } from '../components/StressBlock';
import { ExtrasBlock } from '../components/ExtrasBlock';
import { IconArrowLeft } from '../components/icons';
import { PortraitDialog } from '../components/PortraitDialog';
import { physicalStress, mentalStress } from '../data/characters';
import type { Character, CharacterPatch } from '../data/types';
import '../styles/sheet.css';
import '../styles/character-block.css';
import '../styles/aspect-block.css';
import '../styles/skills-editor.css';
import '../styles/hint.css';

type Props = {
  character: Character;
  /** Правка листа уходит в хранилище сразу, без кнопки «Сохранить». */
  onPatch?: (patch: CharacterPatch) => void;
};

/** Собранный веб-лист: единственный источник правды. */
export default function SheetScreen({ character, onPatch }: Props) {
  const [portrait, setPortrait] = useState(character.portrait);
  const [portraitOpen, setPortraitOpen] = useState(false);

  useEffect(() => {
    setPortrait(character.portrait);
  }, [character.portrait]);

  const changePortrait = (next: string) => {
    setPortrait(next);
    onPatch?.({ portrait: next });
  };

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
            physical={physicalStress(character)}
            mental={mentalStress(character)}
            consequences={character.consequences}
          />
          <AspectBlock aspects={character.aspects} />
        </article>

        <article className="page page--right">
          <SkillsEditor initial={character.ladder} initialLevel={character.level} />
          <StuntBlock stunts={character.stunts} baseRefresh={character.refresh} />
          <ExtrasBlock initial={character.extras} />
        </article>
      </main>
      {portraitOpen && (
        <PortraitDialog
          src={portrait}
          alt={`Портрет: ${character.name || 'персонаж'}`}
          onClose={() => setPortraitOpen(false)}
          onChange={changePortrait}
        />
      )}
    </div>
  );
}
