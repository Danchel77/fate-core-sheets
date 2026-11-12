import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Layers,
  LogIn,
  LogOut,
  Settings,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCharacters } from '../../context/CharacterContext';
import { exportCharacterToPdf } from '../../services/pdfExport';
import { SettingsModal } from './SettingsModal';

export const Header: React.FC = () => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const { activeCharacter, selectChar } = useCharacters();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!activeCharacter || isExporting) return;

    setIsExporting(true);
    try {
      await exportCharacterToPdf('printable-character-sheet', activeCharacter.name);
    } catch (error) {
      console.error('PDF export failed', error);
      window.alert('Не удалось создать PDF. Попробуйте ещё раз.');
    } finally {
      setIsExporting(false);
    }
  };

  const quietButton =
    'cursor-pointer items-center gap-1.5 border border-line bg-transparent px-2.5 py-1.5 text-xs text-text-muted transition-colors duration-150 hover:border-gold-dim hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light';

  return (
    <header className="sticky top-0 z-40 border-b border-gold-dim bg-ink py-2.5">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <button
            onClick={() => selectChar(null)}
            className="group flex min-w-0 items-center gap-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
            title="К списку персонажей"
          >
            <Shield className="size-5 shrink-0 text-gold-light" strokeWidth={1.5} aria-hidden="true" />
            <span
              data-brand
              className="truncate font-fantasy text-base text-gold-light [font-variant-caps:small-caps] tracking-wide transition-colors duration-150 group-hover:text-gold sm:text-xl"
            >
              Fate Core Sheets
            </span>
          </button>

          {activeCharacter && (
            <div className="hidden items-center gap-2 border-l border-line pl-4 text-xs sm:flex">
              <button
                onClick={() => selectChar(null)}
                className="flex items-center gap-1.5 text-text-muted transition-colors duration-150 hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
              >
                <Layers className="size-3.5 text-gold-dim" strokeWidth={1.5} aria-hidden="true" />
                Мои персонажи
              </button>
              <span aria-hidden="true" className="h-3 w-px rotate-[20deg] bg-gold-dim" />
              <span className="max-w-[200px] truncate text-text">
                {activeCharacter.name || 'Безымянный герой'}
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <a
            href="https://fate-srd.com/fate-core"
            target="_blank"
            rel="noreferrer"
            className={`group hidden md:flex ${quietButton}`}
            title="Открыть официальные правила Fate SRD"
          >
            <BookOpen
              className="size-3.5 text-gold-dim transition-colors duration-150 group-hover:text-gold-light"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>Правила</span>
          </a>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className={`group flex ${quietButton}`}
            title="Настройки"
          >
            <Settings
              className="size-3.5 text-gold-dim transition-colors duration-150 group-hover:text-gold-light"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="hidden md:inline">Настройки</span>
          </button>

          {activeCharacter && (
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="flex cursor-pointer items-center gap-1.5 border border-gold bg-transparent px-2.5 py-1.5 text-xs text-gold-light transition-colors duration-150 hover:bg-gold hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light disabled:cursor-wait disabled:opacity-60"
              title="Скачать PDF"
            >
              <Download className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span className="hidden md:inline">{isExporting ? 'Экспорт…' : 'Скачать PDF'}</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2 border-l border-line pl-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-7 w-7 border border-line object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center border border-line bg-ink-frame text-text-muted">
                  <UserIcon className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                </div>
              )}
              <button
                onClick={signOut}
                className="cursor-pointer p-1.5 text-text-muted transition-colors duration-150 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                title="Выйти из аккаунта"
              >
                <LogOut className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className={`group flex ${quietButton}`}
              title="Войти через Google"
            >
              <LogIn
                className="size-3.5 text-gold-dim transition-colors duration-150 group-hover:text-gold-light"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Войти</span>
            </button>
          )}
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};
