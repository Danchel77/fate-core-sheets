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
      <header className="sticky top-0 z-40 bg-[#0F141C]/95 backdrop-blur-md border-b border-[#222A38] px-4 lg:px-8 py-3.5 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => selectChar(null)}
              className="flex items-center gap-3 group text-left transition"
            >
              <div className="w-9 h-9 rounded-lg bg-[#18202C] border border-[#2B3648] flex items-center justify-center text-slate-300 group-hover:border-slate-500 group-hover:text-white transition">
                <Shield className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <span className="font-semibold text-sm text-slate-100 tracking-tight block group-hover:text-white transition">
                  Fate Core Sheets
                </span>
                <span className="text-[11px] text-slate-400 block font-normal">
                  Листы персонажей & ИИ-помощник
                </span>
              </div>
            </button>

            {/* Breadcrumb if character active */}
            {activeCharacter && (
              <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-[#222A38] text-xs">
                <button
                  onClick={() => selectChar(null)}
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Пул персонажей
                </button>
                <span className="text-slate-600">/</span>
                <span className="text-slate-200 font-medium truncate max-w-[200px]">
                  {activeCharacter.name || 'Безымянный герой'}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            {/* Guide link */}
            <a
              href="https://fate-srd.com/fate-core"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#252E3E] bg-[#141A23] hover:bg-[#1A2230] hover:border-slate-600 text-xs text-slate-300 hover:text-white transition"
              title="Открыть официальные правила Fate SRD"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Правила Fate Core</span>
            </a>

            {/* Gemini API Key */}
            <button
              onClick={() => setIsApiKeyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#252E3E] bg-[#141A23] hover:bg-[#1A2230] hover:border-slate-600 text-xs text-slate-300 hover:text-white transition"
              title="Настроить Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400/90" />
              <span className="hidden sm:inline">Gemini AI</span>
            </button>

            {/* User Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#222A38]">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#18202C] border border-[#2B3648] flex items-center justify-center text-slate-400 text-xs">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                  title="Выйти из аккаунта"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#252E3E] bg-[#141A23] hover:bg-[#1A2230] hover:border-slate-600 text-xs text-slate-200 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>Войти</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* API Key Modal */}
      <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} />
    </>
  );
};
