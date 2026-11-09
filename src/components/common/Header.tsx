import React, { useState } from 'react';
import { Shield, Sparkles, LogIn, LogOut, User as UserIcon, BookOpen, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCharacters } from '../../context/CharacterContext';
import { ApiKeyModal } from './ApiKeyModal';

export const Header: React.FC = () => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const { activeCharacter, selectChar } = useCharacters();
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#2E3440] px-4 lg:px-8 py-3 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => selectChar(null)}
              className="flex items-center gap-3 group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center border border-amber-500/50 shadow-lg shadow-amber-900/40 group-hover:scale-105 transition">
                <Shield className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <span className="font-fantasy font-extrabold text-lg text-amber-400 tracking-wider block group-hover:text-amber-300 transition">
                  FATE CORE SHEETS
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-medium">
                  Witcher & Universal Hub
                </span>
              </div>
            </button>

            {/* Breadcrumb if character active */}
            {activeCharacter && (
              <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-800 text-sm">
                <button
                  onClick={() => selectChar(null)}
                  className="text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition"
                >
                  <Layers className="w-4 h-4" />
                  Пул героев
                </button>
                <span className="text-slate-600">/</span>
                <span className="text-amber-300 font-medium truncate max-w-[200px]">
                  {activeCharacter.name || 'Безымянный герой'}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Guide link */}
            <a
              href="https://fate-srd.com/fate-core"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2E3440] hover:border-slate-600 text-xs text-slate-300 hover:text-white transition"
              title="Открыть официальные правила Fate SRD"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Правила Fate</span>
            </a>

            {/* Gemini API Key */}
            <button
              onClick={() => setIsApiKeyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-400 transition"
              title="Настроить Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gemini AI</span>
            </button>

            {/* User Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-amber-500/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                  title="Выйти из аккаунта"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2E3440] hover:border-amber-500/50 bg-[#161B22] text-xs text-slate-200 hover:text-white transition"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Войти через Google</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} />
    </>
  );
};
