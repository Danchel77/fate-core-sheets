import React, { useState, useMemo } from 'react';
import { Plus, Sparkles, UserPlus, Sword, Compass } from 'lucide-react';
import { useCharacters } from '../../context/CharacterContext';
import { CharacterCard } from './CharacterCard';
import { SettingType } from '../../types/character';
import { POWER_PRESETS, PowerPresetKey } from '../../config/presets';
import { SAMPLE_CHARACTERS } from '../../config/sampleCharacters';

export const CharacterList: React.FC = () => {
  const { characters, selectChar, createChar, duplicateChar, deleteChar, updateChar } = useCharacters();
  const [filter, setFilter] = useState<'all' | SettingType>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [power, setPower] = useState<PowerPresetKey>('start');

  const witcherCount = useMemo(() => characters.filter(c => c.setting === 'witcher').length, [characters]);
  const universalCount = useMemo(() => characters.filter(c => c.setting === 'universal').length, [characters]);

  const filteredCharacters = useMemo(() => {
    if (filter === 'all') return characters;
    return characters.filter(c => c.setting === filter);
  }, [characters, filter]);

  const handleCreate = async (setting: SettingType) => {
    setIsCreateModalOpen(false);
    const defaultName = setting === 'witcher' ? 'Новый ведьмак' : 'Новый искатель приключений';
    await createChar(setting, defaultName, power);
  };

  const handleLoadSamples = () => {
    SAMPLE_CHARACTERS.forEach(char => updateChar(char));
  };

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top Bar: Title on Left, Equal-width Filters Aligned to Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-baseline gap-2.5">
            <span>Мои персонажи</span>
            <span className="text-lg sm:text-xl font-medium text-slate-400 tabular-nums">
              ({characters.length})
            </span>
          </h1>
        </div>

        {/* Filter Tabs: Equal Width, Right-Aligned */}
        <div className="flex items-center self-end sm:self-auto bg-[#141820] border border-[#242C38] p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`w-24 sm:w-28 py-1.5 rounded-lg text-xs font-medium text-center transition ${
              filter === 'all'
                ? 'bg-[#252E3E] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('witcher')}
            className={`w-24 sm:w-28 py-1.5 rounded-lg text-xs font-medium text-center transition ${
              filter === 'witcher'
                ? 'bg-[#252E3E] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ведьмак {witcherCount > 0 && <span className="text-slate-400 ml-1">({witcherCount})</span>}
          </button>
          <button
            onClick={() => setFilter('universal')}
            className={`w-24 sm:w-28 py-1.5 rounded-lg text-xs font-medium text-center transition ${
              filter === 'universal'
                ? 'bg-[#252E3E] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fate Core {universalCount > 0 && <span className="text-slate-400 ml-1">({universalCount})</span>}
          </button>
        </div>
      </div>

      {/* Grid of Characters with Dedicated "+" Card placed at the END */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Existing Character Cards */}
        {filteredCharacters.map((char) => (
          <CharacterCard
            key={char.id}
            character={char}
            onSelect={() => selectChar(char.id)}
            onDuplicate={() => duplicateChar(char.id)}
            onDelete={() => deleteChar(char.id)}
          />
        ))}

        {/* Large "+" Card Button at the END of the list */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="group min-h-[104px] sm:min-h-[112px] p-3.5 sm:p-4 rounded-xl border border-dashed border-[#2B3545] hover:border-slate-400 bg-[#12161F]/60 hover:bg-[#161C27] flex items-center justify-center gap-3 transition-all cursor-pointer text-left"
        >
          <div className="w-9 h-9 rounded-lg bg-[#18202C] border border-[#2D384A] flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-slate-400 transition">
            <Plus className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="font-medium text-sm sm:text-base text-slate-300 group-hover:text-white transition">
            Создать персонажа
          </span>
        </button>
      </div>

      {/* Empty State when no characters match */}
      {filteredCharacters.length === 0 && characters.length === 0 && (
        <div className="mt-8 rounded-2xl border border-[#242C38] bg-[#12161E]/50 p-10 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-[#1A222F] border border-[#2C384A] text-slate-400 mx-auto flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            У вас пока нет персонажей
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Создайте нового героя или загрузите примеры готовых персонажей для быстрого старта.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Создать героя</span>
            </button>
            <button
              onClick={handleLoadSamples}
              className="px-4 py-2 rounded-xl border border-[#2E3A4C] bg-[#161D27] hover:bg-[#1E2734] text-slate-300 hover:text-white text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Загрузить примеры</span>
            </button>
          </div>
        </div>
      )}

      {/* Setting Choice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#171D27] border border-[#2B3648] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-semibold text-lg text-slate-100 mb-1">
              Выберите сеттинг персонажа
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Сеттинг задает список адаптированных навыков и характер генерации ИИ-помощника.
            </p>

            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Сила кампании
                </span>
                <span className="text-[10px] text-slate-500">домашняя настройка</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(POWER_PRESETS) as PowerPresetKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPower(key)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition cursor-pointer ${
                      power === key
                        ? 'border-slate-400 bg-[#252E3E] text-white'
                        : 'border-[#252E3E] bg-[#10141C] text-slate-400 hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {POWER_PRESETS[key].label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                {POWER_PRESETS[power].description} Обновление {POWER_PRESETS[power].refresh}, потолок навыка +{POWER_PRESETS[power].skillCap}.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {/* Witcher Option */}
              <button
                onClick={() => handleCreate('witcher')}
                className="w-full text-left p-3.5 rounded-xl bg-[#10141C] border border-[#252E3E] hover:border-slate-500 hover:bg-[#151B25] transition group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-[#1D2533] text-amber-400 border border-white/5">
                    <Sword className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-slate-100 group-hover:text-white transition">
                      Ведьмак / Тёмное фэнтези
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Рекомендуемый сеттинг
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-11 leading-relaxed">
                  Адаптированные навыки: Фехтование, Знаки и Магия, Алхимия, Чутьё, Верховая езда.
                </p>
              </button>

              {/* Universal Fate Core Option */}
              <button
                onClick={() => handleCreate('universal')}
                className="w-full text-left p-3.5 rounded-xl bg-[#10141C] border border-[#252E3E] hover:border-slate-500 hover:bg-[#151B25] transition group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-[#1D2533] text-indigo-400 border border-white/5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-slate-100 group-hover:text-white transition">
                      Классический Fate Core
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Универсальная система
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-11 leading-relaxed">
                  Официальный список из 18 стандартных навыков Fate Core для любых жанров.
                </p>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#252E3E] transition cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
