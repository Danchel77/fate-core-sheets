import { createContext, useContext, type ReactNode } from 'react';
import type { BlockId } from '../../data/groups';

/** Короткая справка о заметках блока для закладки и подсказки. */
export type NotePeek = { count: number; author: string; text: string };

export type NotesApi = {
  peek: (blockId: BlockId) => NotePeek | null;
  open: (blockId: BlockId) => void;
};

const NotesContext = createContext<NotesApi | null>(null);

export function useNotes(): NotesApi | null {
  return useContext(NotesContext);
}

/** Закладки заметок появляются только там, где лист открыт внутри группы. */
export function NotesProvider({ api, children }: { api: NotesApi; children: ReactNode }) {
  return <NotesContext.Provider value={api}>{children}</NotesContext.Provider>;
}
