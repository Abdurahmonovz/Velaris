import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Globe } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { setLanguage, setIsFirstLaunch, t } = useApp();

  const handleSelectLanguage = (lang: 'uz' | 'ru') => {
    setLanguage(lang);
    setIsFirstLaunch(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0A0510] text-gray-100 p-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-900/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-60 h-60 bg-[#D4AF37]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top spacer */}
      <div className="w-full flex justify-end pt-4">
        <div className="flex items-center gap-1.5 text-xs text-[#D4AF37]/80 glass-panel px-3 py-1.5 rounded-full border border-[#D4AF37]/30">
          <Globe className="w-3.5 h-3.5" />
          <span>VELARIS ATELIER</span>
        </div>
      </div>

      {/* Center Branding Content */}
      <div className="flex flex-col items-center text-center max-w-sm my-auto space-y-6">
        {/* Logo Container */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFF0B8] to-[#AA771C] opacity-40 blur transition duration-500 group-hover:opacity-75" />
          <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 bg-[#150B21] flex items-center justify-center p-2 shadow-gold-glow">
            <img
              src="/velaris-logo.jpg"
              alt="Velaris Logo"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>
        </div>

        {/* Title & Slogan */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-serif tracking-wider gold-gradient-text">
            VELARIS
          </h1>
          <p className="text-[#D4AF37] text-sm tracking-[0.25em] font-light uppercase">
            PARFUME ATELIER
          </p>
          <p className="text-gray-400 text-xs mt-3 leading-relaxed px-4">
            {t('welcomeDesc')}
          </p>
        </div>
      </div>

      {/* Bottom Language Selection Buttons */}
      <div className="w-full max-w-sm space-y-4 mb-6">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{t('selectLanguage')}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSelectLanguage('uz')}
            className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#1E0F30] to-[#12081E] hover:border-[#D4AF37] hover:shadow-gold-glow transition-all active:scale-95 group"
          >
            <span className="text-2xl">🇺🇿</span>
            <div className="text-left">
              <span className="block text-sm font-semibold text-gray-100 group-hover:text-[#D4AF37]">
                O'zbekcha
              </span>
              <span className="block text-[10px] text-gray-400">O'zbek tili</span>
            </div>
          </button>

          <button
            onClick={() => handleSelectLanguage('ru')}
            className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#1E0F30] to-[#12081E] hover:border-[#D4AF37] hover:shadow-gold-glow transition-all active:scale-95 group"
          >
            <span className="text-2xl">🇷🇺</span>
            <div className="text-left">
              <span className="block text-sm font-semibold text-gray-100 group-hover:text-[#D4AF37]">
                Русский
              </span>
              <span className="block text-[10px] text-gray-400">Русский язык</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
