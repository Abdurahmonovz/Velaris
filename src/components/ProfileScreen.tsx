import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { User as UserIcon, Heart, Globe, Shield, Phone, MapPin, Sparkles, ChevronRight, Key, X } from 'lucide-react';

const AdminLoginButton: React.FC = () => {
  const { updateUserProfile, setActiveTab } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPhone) return;

    await updateUserProfile({ phone: adminPhone });

    // Check if phone matches admin numbers
    const clean = adminPhone.replace(/\D/g, '');
    const isAdmin = ['998937188885', '937188885', '998955805852', '955805852', '998921983377', '921983377', '998901234567'].includes(clean);

    if (isAdmin) {
      setIsOpen(false);
      setActiveTab('admin');
    } else {
      setErrorMsg('Ushbu telefon raqami admin sifatida ro\'yxatdan o\'tmagan!');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-3 rounded-2xl border border-white/10 bg-[#150B21] text-gray-300 hover:text-[#D4AF37] text-xs font-semibold flex items-center justify-between transition"
      >
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[#D4AF37]" />
          <span>Admin sifatida kirish</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xs bg-[#150B21] border border-[#D4AF37]/40 rounded-2xl p-5 text-gray-100 space-y-4 shadow-gold-glow">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-bold text-[#D4AF37] uppercase flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Admin Tekshiruvi</span>
              </h4>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-gray-300">
              Admin huquqiga ega bo'lgan telefon raqamingizni kiriting:
            </p>

            {errorMsg && (
              <p className="text-[10px] text-red-400 bg-red-500/10 p-2 rounded-lg text-center">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleAdminVerify} className="space-y-3">
              <input
                type="tel"
                placeholder="+998 9X XXX XX XX"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full bg-[#1E0F30] border border-[#D4AF37]/30 rounded-xl px-3 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#D4AF37]"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 gold-btn rounded-xl text-xs font-bold shadow-gold-glow"
              >
                Kirishni tasdiqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export const ProfileScreen: React.FC = () => {
  const { user, language, setLanguage, favorites, products, setActiveTab, t } = useApp();

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="space-y-6 pb-28 pt-2 px-4 max-w-md mx-auto">
      {/* Profile Card Header */}
      <div className="relative p-5 bg-gradient-to-br from-[#1E0F30] via-[#150B21] to-[#0A0510] rounded-3xl border border-[#D4AF37]/40 shadow-gold-glow overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#26123D] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-gold-glow flex-shrink-0">
            <UserIcon className="w-8 h-8" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-serif font-bold text-gray-100 gold-gradient-text truncate">
              {user?.name || 'Velaris Customer'}
            </h2>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-[#D4AF37]" />
              <span>{user?.phone || '+998 -- --- -- --'}</span>
            </p>
            {user?.region && (
              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#D4AF37]" />
                <span className="truncate">{user.region}, {user.district}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Admin Panel Shortcut if Admin */}
      {user?.role === 'admin' ? (
        <button
          onClick={() => setActiveTab('admin')}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFF0B8] to-[#AA771C] text-black font-bold text-xs flex items-center justify-between shadow-gold-glow transition active:scale-95 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>{t('adminPanelLink')}</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <AdminLoginButton />
      )}

      {/* Quick Settings List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Sozlamalar</h3>

        <div className="bg-[#150B21] border border-[#D4AF37]/20 rounded-2xl divide-y divide-white/5 overflow-hidden">
          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'uz' ? 'ru' : 'uz')}
            className="w-full p-3.5 flex items-center justify-between text-xs text-gray-200 hover:bg-[#1E0F30] transition"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('changeLanguage')}</span>
            </div>
            <span className="text-[#D4AF37] font-bold uppercase">{language === 'uz' ? "🇺🇿 O'zbekcha" : '🇷🇺 Русский'}</span>
          </button>
        </div>
      </div>

      {/* Favorites Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            <span>{t('favoritesTitle')}</span>
          </h3>
          <span className="text-xs text-gray-400">{favoriteProducts.length} mahsulot</span>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="text-center py-10 bg-[#140921] rounded-2xl border border-white/5 space-y-2">
            <Heart className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-xs text-gray-400">{t('noFavorites')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
