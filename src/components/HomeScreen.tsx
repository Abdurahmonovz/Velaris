import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { Search, Sparkles, ChevronRight, Flame, Award, Megaphone } from 'lucide-react';
import { getCleanImageUrl, FALLBACK_PRODUCT_IMAGE, getProductImages, preloadImages } from '../utils/imageUtils';

export const HomeScreen: React.FC = () => {
  const {
    banners,
    categories,
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    language,
    t,
  } = useApp();

  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Preload top featured product images for instant zero-lag rendering
  useEffect(() => {
    if (!products || products.length === 0) return;
    const topUrls = products.slice(0, 16).map((p) => {
      const imgs = getProductImages(p.images);
      return imgs[0];
    });
    preloadImages(topUrls);
  }, [products]);

  // Auto slide banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners]);

  // Filter products by search & selected category
  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.category_slug === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Auto rotate 8 famous perfumes every 20 seconds
  const [popularOffset, setPopularOffset] = useState(0);

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setPopularOffset((prev) => (prev + 8) % Math.max(1, products.length));
    }, 20000); // 20,000 ms = 20 seconds

    return () => clearInterval(interval);
  }, [products.length]);

  const getFamous8 = () => {
    const famousPool = products.filter((p) => p.is_bestseller || p.is_featured || p.rating >= 4.7);
    const pool = famousPool.length >= 8 ? famousPool : products;
    if (pool.length === 0) return [];

    const result = [];
    for (let i = 0; i < 8; i++) {
      const idx = (popularOffset + i) % pool.length;
      result.push(pool[idx]);
    }
    return result;
  };

  const famous8 = getFamous8();

  return (
    <div className="space-y-6 pb-24 pt-2 px-4 max-w-md mx-auto">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-[#160A26] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-2xl py-3.5 pl-11 pr-4 text-xs text-gray-100 placeholder-gray-400 focus:outline-none shadow-gold-glow transition-all"
        />
        <Search className="w-4 h-4 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs bg-white/10 w-5 h-5 rounded-full flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* Add to Channel Banner Bar */}
      {!searchQuery && (
        <div
          onClick={() => {
            const url = 'https://t.me/velaris_parfume_atelier_bot?startchannel=true';
            if ((window as any).Telegram?.WebApp?.openTelegramLink) {
              (window as any).Telegram.WebApp.openTelegramLink(url);
            } else {
              window.open(url, '_blank');
            }
          }}
          className="p-3 rounded-2xl bg-gradient-to-r from-[#1A0E2B] via-[#12081E] to-[#1A0E2B] border border-[#D4AF37]/30 flex items-center justify-between gap-2 cursor-pointer hover:border-[#D4AF37]/60 shadow-md transition active:scale-98"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] flex-shrink-0">
              <Megaphone className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-gray-100 block gold-gradient-text truncate">
                Mini App-ni Telegram Kanalga Qo'shing 📢
              </span>
              <span className="text-[10px] text-gray-400 block truncate">
                Kanalingizga qo'shib, obunachilaringizga ulashing
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-[#D4AF37] text-black font-bold text-[10px] flex-shrink-0 shadow">
            Qo'shish
          </span>
        </div>
      )}

      {/* Hero Banner Slider */}
      {banners.length > 0 && !searchQuery && (
        <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-gold-glow group">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                activeBannerIdx === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={getCleanImageUrl(banner.image)}
                alt={banner.title_uz}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end">
                <span className="text-[10px] text-[#D4AF37] tracking-widest uppercase font-bold">
                  VELARIS EXCLUSIVE
                </span>
                <h2 className="text-base font-serif font-bold text-gray-100 gold-gradient-text line-clamp-1">
                  {language === 'uz' ? banner.title_uz : banner.title_ru}
                </h2>
                <p className="text-[10px] text-gray-300 line-clamp-1 mt-0.5">
                  {language === 'uz' ? banner.subtitle_uz : banner.subtitle_ru}
                </p>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-2 right-3 z-20 flex gap-1.5">
            {banners.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setActiveBannerIdx(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeBannerIdx === idx ? 'w-5 bg-[#D4AF37]' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Right-Sliding Infinite Marquee Category Carousel */}
      <div className="space-y-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t('categoriesTitle')}</span>
          </h2>

          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[10px] text-[#D4AF37] hover:underline font-bold"
            >
              {t('seeAll')}
            </button>
          )}
        </div>

        <div className="w-full overflow-hidden py-2 relative rounded-2xl bg-[#12081E]/40 border border-[#D4AF37]/15">
          {/* Side Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#0A0510] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#0A0510] to-transparent z-10 pointer-events-none" />

          <div className="animate-infinite-marquee flex items-center gap-4 px-2">
            {/* Duplicated list for seamless right-sliding infinite loop */}
            {[...categories, ...categories].map((cat, idx) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <div
                  key={`${cat.id}-${idx}`}
                  onClick={() => {
                    setSelectedCategory(isSelected ? null : cat.slug);
                  }}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group transition-transform active:scale-95"
                >
                  <div
                    className={`w-16 h-16 rounded-full p-0.5 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-tr from-[#FFF0B8] via-[#D4AF37] to-[#AA771C] shadow-gold-glow scale-105'
                        : 'bg-white/10 group-hover:border-[#D4AF37]/60'
                    }`}
                  >
                    <img
                      src={getCleanImageUrl(cat.image)}
                      alt={cat.name_uz}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                      }}
                      className="w-full h-full object-cover rounded-full border border-[#D4AF37]/20 group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium tracking-tight max-w-[68px] truncate text-center ${
                      isSelected ? 'text-[#D4AF37] font-bold' : 'text-gray-300 group-hover:text-[#D4AF37]'
                    }`}
                  >
                    {language === 'uz' ? cat.name_uz : cat.name_ru}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Famous Perfumes Section (8 items, auto-refreshes every 20s) */}
      {!selectedCategory && !searchQuery ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{t('bestsellersTitle')}</span>
            </h2>
            <button
              onClick={() => setPopularOffset((prev) => (prev + 8) % Math.max(1, products.length))}
              className="text-[10px] text-gray-400 hover:text-[#D4AF37] flex items-center gap-1 font-medium"
            >
              <span>{t('seeAll')}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Exactly 8 Famous Perfumes Grid */}
          <div className="grid grid-cols-2 gap-3 transition-all duration-500">
            {famous8.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        /* Filtered Search or Category Results Grid (limited to 8 items on Home page) */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)?.[`name_${language}`]
                : t('allProductsTitle')}
            </h2>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="text-[10px] text-[#D4AF37] hover:underline font-bold"
            >
              Filtni tozalash ✕
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-[#140921] rounded-2xl border border-white/5 space-y-2">
              <p className="text-xs text-gray-400">Mahsulotlar topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Button to view all in Catalog - ALWAYS VISIBLE AT BOTTOM OF HOME SCREEN */}
      <div className="pt-4">
        <button
          onClick={() => setActiveTab('catalog')}
          className="w-full py-4 px-4 bg-gradient-to-r from-[#1E0F33] via-[#2A1547] to-[#1E0F33] hover:from-[#2A1547] hover:to-[#2A1547] border border-[#D4AF37]/50 hover:border-[#D4AF37] text-[#D4AF37] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-gold-glow transition-all active:scale-98"
        >
          <span>Barcha atirlarni ko'rish (Katalog)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
