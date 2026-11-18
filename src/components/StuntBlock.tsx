import { useCallback, useState } from 'react';
import type { Stunt } from '../data/types';
import { BlockHeader } from './BlockHeader';
import { BlockMenu } from './BlockMenu';
import { StuntModal } from './StuntModal';
import '../styles/stunt-block.css';

const MAX_STUNTS = 5;

type StuntItem = Stunt & { id: string };

type Editor = { mode: 'new' } | { mode: 'edit'; id: string };

type Props = {
  stunts: Stunt[];
  baseRefresh?: number;
  /** Блок сообщает о правках, чтобы лист их сразу сохранил. */
  onChange?: (stunts: Stunt[]) => void;
};

let nextId = 0;
const makeId = () => `stunt-${nextId++}`;

/**
 * Блок «Трюки»: карточки героя.
 * Карточка открывает окно правки, меню в углу блока добавляет новый трюк.
 */
export function StuntBlock({ stunts, baseRefresh = 3, onChange }: Props) {
  const [items, setItems] = useState<StuntItem[]>(() =>
    stunts.map((stunt) => ({ ...stunt, id: makeId() })),
  );
  const [editor, setEditor] = useState<Editor | null>(null);

  const closeEditor = useCallback(() => setEditor(null), []);

  const commit = (next: StuntItem[]) => {
    setItems(next);
    onChange?.(next.map(({ name, text }) => ({ name, text })));
  };
  const atLimit = items.length >= MAX_STUNTS;

  const current = editor?.mode === 'edit' ? items.find((item) => item.id === editor.id) : undefined;

  const save = (value: { name: string; text: string }) => {
    if (!editor) return;

    if (editor.mode === 'new') {
      if (items.length >= MAX_STUNTS) {
        setEditor(null);
        return;
      }
      commit([...items, { id: makeId(), ...value }]);
    } else {
      commit(items.map((item) => (item.id === editor.id ? { ...item, ...value } : item)));
    }

    setEditor(null);
  };

  const remove = () => {
    if (!editor || editor.mode !== 'edit') return;
    commit(items.filter((item) => item.id !== editor.id));
    setEditor(null);
  };

  return (
    <section className="stk">
      <BlockHeader
        title="Трюки"
        aside={
          <BlockMenu
            label="Действия с трюками"
            items={[
              {
                label: 'Добавить трюк',
                onSelect: () => setEditor({ mode: 'new' }),
                disabled: atLimit,
                title: atLimit ? 'Все пять трюков записаны' : undefined,
              },
            ]}
          />
        }
      />

      {items.length > 0 ? (
        <div className="stk__cards">
          {items.map((item) => (
            <article className="stk__card" key={item.id}>
              <h3 className="stk__card-name">{item.name}</h3>
              <p className="stk__card-text">{item.text}</p>
              <button
                type="button"
                className="stk__card-hit"
                aria-label={`Изменить трюк «${item.name}»`}
                onClick={() => setEditor({ mode: 'edit', id: item.id })}
              />
            </article>
          ))}
        </div>
      ) : (
        <p className="stk__empty">Пока пусто. Открой меню из трёх точек в углу блока и выбери «Добавить трюк».</p>
      )}

      {atLimit && (
        <p className="stk__limit">Все пять трюков записаны — больше добавить нельзя.</p>
      )}

      {editor && (editor.mode === 'new' || current) && (
        <StuntModal
          key={editor.mode === 'edit' ? editor.id : 'new'}
          mode={editor.mode}
          initial={current ? { name: current.name, text: current.text } : { name: '', text: '' }}
          count={items.length}
          baseRefresh={baseRefresh}
          onSave={save}
          onDelete={editor.mode === 'edit' ? remove : undefined}
          onClose={closeEditor}
        />
      )}
    </section>
  );
}
