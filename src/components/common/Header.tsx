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

  return (
    <header className="sticky top-0 z-40 border-b border-[#1C212B] bg-[#0B0E14] py-3.5 transition">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <button
            onClick={() => selectChar(null)}
            className="group flex min-w-0 items-center gap-3 text-left transition"
            title="К списку персонажей"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#242C38] bg-[#141820] text-slate-300 transition group-hover:border-slate-500 group-hover:text-white">
              <Shield className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="block truncate font-fantasy text-base font-bold tracking-wide text-white transition group-hover:text-slate-200 sm:text-2xl">
              Fate Core Sheets
            </span>
          </button>

          {activeCharacter && (
            <div className="hidden items-center gap-2 border-l border-[#1C212B] pl-4 text-xs sm:flex">
              <button
                onClick={() => selectChar(null)}
                className="flex items-center gap-1.5 text-slate-400 transition hover:text-slate-200"
              >
                <Layers className="h-3.5 w-3.5" />
                Мои персонажи
              </button>
              <span className="text-slate-600">/</span>
              <span className="max-w-[200px] truncate font-medium text-slate-200">
                {activeCharacter.name || 'Безымянный герой'}
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <a
            href="https://fate-srd.com/fate-core"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-[#242C38] bg-[#12161E] px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-600 hover:bg-[#18202A] hover:text-white md:flex"
            title="Открыть официальные правила Fate SRD"
          >
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <span>Правила</span>
          </a>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#242C38] bg-[#12161E] px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-slate-600 hover:bg-[#18202A] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
            title="Настройки"
          >
            <Settings className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Настройки</span>
          </button>

          {activeCharacter && (
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#B9C9DC] bg-[#B9C9DC] px-2.5 py-1.5 text-xs font-semibold text-[#0B0E14] transition hover:border-[#CAD8E8] hover:bg-[#CAD8E8] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-wait disabled:opacity-60"
              title="Скачать PDF"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{isExporting ? 'Экспорт...' : 'Скачать PDF'}</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2 border-l border-[#1C212B] pl-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-7 w-7 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#242C38] bg-[#141820] text-xs text-slate-400">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
              )}
              <button
                onClick={signOut}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                title="Выйти из аккаунта"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 rounded-lg border border-[#242C38] bg-[#12161E] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-[#18202A] sm:px-3.5"
            >
              <LogIn className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Войти</span>
            </button>
          )}
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};
