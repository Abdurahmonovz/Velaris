import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe, Shield, Sun, Moon, Megaphone, ArrowLeft } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme, user, activeTab, setActiveTab } = useApp();

  const toggleLang = () => {
    setLanguage(language === 'uz' ? 'ru' : 'uz');
  };

  const handleAddToChannel = () => {
    const url = 'https://t.me/velaris_parfume_atelier_bot?startchannel=true';
    if ((window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  if (activeTab === 'admin') {
    return (
      <header className="sticky top-0 z-40 bg-[#0A0510]/95 light:bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D4AF37]/20 px-3 sm:px-4 py-2.5 pt-[calc(env(safe-area-inset-top,0px)+0.6rem)] shadow-md transition-all">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className="p-1.5 px-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#1E0F30] light:bg-[#F0E8D8] text-[#D4AF37] hover:border-[#D4AF37] transition active:scale-95 flex items-center justify-center gap-1.5 text-xs font-semibold"
              title="Do'konga qaytish"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
              <span>Bosh sahifa</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-bold gold-gradient-text">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span>Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl border border-[#D4AF37]/30 bg-[#1E0F30] light:bg-[#F0E8D8] text-[#D4AF37] hover:border-[#D4AF37] transition active:scale-95 flex items-center justify-center"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </button>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-[#D4AF37]/30 bg-[#1E0F30] light:bg-[#F0E8D8] text-[11px] font-bold text-[#D4AF37] hover:border-[#D4AF37] transition active:scale-95"
            >
              <Globe className="w-3 h-3 text-[#D4AF37]" />
              <span>{language.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0A0510]/95 light:bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D4AF37]/20 px-3 sm:px-4 py-2.5 pt-[calc(env(safe-area-inset-top,0px)+0.6rem)] shadow-md transition-all">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* Brand logo & title */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 cursor-pointer group shrink-0 min-w-0"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#D4AF37]/50 shadow-gold-glow flex items-center justify-center bg-[#150B21] light:bg-white shrink-0">
            <img
              src="/velaris-logo.jpg"
              alt="Velaris Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=200&q=80';
              }}
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-serif font-bold tracking-wider gold-gradient-text leading-none truncate">
              VELARIS
            </h1>
            <p className="text-[8px] sm:text-[9px] text-[#D4AF37] tracking-[0.18em] uppercase font-light truncate">
              PARFUME ATELIER
            </p>
          </div>
        </div>

        {/* Right action tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Add to Channel Button */}
          <button
            onClick={handleAddToChannel}
            className="w-8 h-8 rounded-xl border border-[#D4AF37]/40 bg-[#1E0F30] light:bg-[#F0E8D8] text-[#D4AF37] hover:border-[#D4AF37] transition active:scale-95 flex items-center justify-center shrink-0"
            title="Kanalga Mini App-ni Qo'shish (Add to Channel)"
          >
            <Megaphone className="w-3.5 h-3.5 text-[#D4AF37]" />
          </button>

          {/* Admin Panel Button (Visible ONLY to verified Admin users) */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-[#D4AF37]/40 bg-gradient-to-r from-[#26123D] to-[#170928] light:from-[#F5EAD6] light:to-[#EAD9B8] text-[11px] font-bold text-[#D4AF37] hover:shadow-gold-glow transition active:scale-95 shrink-0"
              title="Admin Panel"
            >
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl border border-[#D4AF37]/30 bg-[#1E0F30] light:bg-[#F0E8D8] text-[#D4AF37] hover:border-[#D4AF37] transition active:scale-95 flex items-center justify-center shrink-0"
            title={theme === 'dark' ? 'Kunduzgi rejim (Light Mode)' : 'Tungi rejim (Dark Mode)'}
          >
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-[#D4AF37]/30 bg-[#1E0F30] light:bg-[#F0E8D8] text-[11px] font-bold text-[#D4AF37] hover:border-[#D4AF37] transition active:scale-95 shrink-0"
            title="Tilni o'zgartirish"
          >
            <Globe className="w-3 h-3 text-[#D4AF37]" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
