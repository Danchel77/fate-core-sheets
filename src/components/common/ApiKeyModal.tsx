import React, { useState } from 'react';
import { Key, Sparkles, X, Check } from 'lucide-react';
import { getLocalGeminiApiKey, setLocalGeminiApiKey } from '../../services/storage';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [key, setKey] = useState(getLocalGeminiApiKey());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setLocalGeminiApiKey(key);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#161B22] border border-[#2E3440] rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-fantasy text-amber-400">Настройка Gemini AI</h3>
            <p className="text-xs text-slate-400">Ключ для генерации аспектов и трюков</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          Для работы встроенного ИИ-ассистента введите ваш персональный API ключ Google AI Studio. 
          Он сохраняется только локально в вашем браузере.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Google Gemini API Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#0B0E14] border border-[#2E3440] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-amber-400/80 hover:text-amber-300 underline mt-1.5 inline-block"
            >
              Получить бесплатный ключ в Google AI Studio ↗
            </a>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black flex items-center gap-2 shadow-lg shadow-amber-900/30 transition"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Сохранено!
                </>
              ) : (
                'Сохранить ключ'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
