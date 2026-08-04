import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Globe, Shield, Sun, Moon, Megaphone } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme, user, activeTab, setActiveTab, t } = useApp();

  if (activeTab === 'admin') return null;

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

  return (
    <header className="sticky top-0 z-40 bg-[#0A0510]/90 backdrop-blur-md border-b border-[#D4AF37]/20 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Brand logo & title */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#D4AF37]/50 shadow-gold-glow flex items-center justify-center bg-[#150B21]">
            <img
              src="/velaris-logo.jpg"
              alt="Velaris Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                // If failed, fallback
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=200&q=80';
              }}
            />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold tracking-wider gold-gradient-text leading-none">
              VELARIS
            </h1>
            <p className="text-[9px] text-[#D4AF37] tracking-[0.2em] uppercase font-light">
              PARFUME ATELIER
            </p>
          </div>
        </div>

        {/* Right action tools */}
        <div className="flex items-center gap-2">
          {/* Add to Channel Button */}
          <button
            onClick={handleAddToChannel}
            className="p-1.5 rounded-full border border-[#D4AF37]/40 bg-[#1E0F30] text-xs font-semibold text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 transition active:scale-95 flex items-center justify-center"
            title="Kanalga Mini App-ni Qo'shish (Add to Channel)"
          >
            <Megaphone className="w-3.5 h-3.5 text-[#D4AF37]" />
          </button>

          {/* Admin Panel Button (Visible ONLY to verified Admin users) */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#D4AF37]/40 bg-gradient-to-r from-[#26123D] to-[#170928] text-xs font-bold text-[#D4AF37] hover:shadow-gold-glow transition active:scale-95 animate-pulse"
              title="Admin Panel"
            >
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Admin</span>
            </button>
          )}

          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full border border-[#D4AF37]/30 bg-[#1E0F30] text-xs font-semibold text-[#D4AF37] hover:border-[#D4AF37] transition active:scale-95"
            title={theme === 'dark' ? 'Kunduzgi rejim (Light Mode)' : 'Tungi rejim (Dark Mode)'}
          >
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#D4AF37]/30 bg-[#1E0F30] text-xs font-semibold text-[#D4AF37] hover:border-[#D4AF37] transition active:scale-95"
          >
            <Globe className="w-3 h-3 text-[#D4AF37]" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
