import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { Search, Sparkles, ChevronRight, Flame, Award } from 'lucide-react';
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
    let matchesCategory = true;
    if (selectedCategory) {
      if (selectedCategory === 'erkaklar') {
        matchesCategory = (p.category_slug === 'erkaklar' || p.gender === 'men') && p.gender !== 'women';
      } else if (selectedCategory === 'ayollar') {
        matchesCategory = (p.category_slug === 'ayollar' || p.gender === 'women') && p.gender !== 'men';
      } else if (selectedCategory === 'unisex') {
        matchesCategory = p.category_slug === 'unisex' || p.gender === 'unisex';
      } else if (selectedCategory === 'yangi') {
        matchesCategory = p.is_new;
      } else if (selectedCategory === 'bestseller') {
        matchesCategory = p.is_bestseller;
      } else if (selectedCategory === 'premium') {
        matchesCategory = p.category_slug === 'premium' || p.price_10g >= 120000;
      } else {
        matchesCategory = p.category_slug === selectedCategory;
      }
    }

    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.scent_family_uz && p.scent_family_uz.toLowerCase().includes(q)) ||
        (p.scent_family_ru && p.scent_family_ru.toLowerCase().includes(q)) ||
        (p.top_notes_uz && p.top_notes_uz.toLowerCase().includes(q)) ||
        (p.heart_notes_uz && p.heart_notes_uz.toLowerCase().includes(q)) ||
        (p.base_notes_uz && p.base_notes_uz.toLowerCase().includes(q));
    }

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


      {/* Hero Luxury Promo Banner Slider */}
      {banners.length > 0 && !searchQuery && (
        <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden border border-[#D4AF37]/40 shadow-2xl group bg-[#0A0A0E]">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                activeBannerIdx === idx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent p-4 sm:p-5 flex flex-col justify-end">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[9px] font-bold text-[#D4AF37] tracking-widest uppercase shadow">
                    <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                    <span>VELARIS ATELIER</span>
                  </div>

                  <h2 className="text-base sm:text-lg font-serif font-bold text-gray-100 gold-gradient-text line-clamp-1 leading-snug">
                    {language === 'uz' ? banner.title_uz : banner.title_ru}
                  </h2>

                  <p className="text-[11px] text-gray-300 line-clamp-1">
                    {language === 'uz' ? banner.subtitle_uz : banner.subtitle_ru}
                  </p>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-lg shadow-sm">
                      Kolleksiyani ko'rish →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Dots Indicator */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBannerIdx(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeBannerIdx === idx ? 'w-5 bg-gradient-to-r from-[#FFF0B8] to-[#D4AF37]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category Section with smooth horizontal scrolling */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
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

        <div className="w-full py-1">
          <div className="flex items-center gap-3 px-0.5 overflow-x-auto no-scrollbar scroll-smooth">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(isSelected ? null : cat.slug);
                  }}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group transition-all active:scale-95 text-center focus:outline-none"
                >
                  <div
                    className={`w-12 h-12 rounded-full transition-all duration-300 relative ${
                      isSelected
                        ? 'p-[2px] bg-gradient-to-tr from-[#FFF0B8] via-[#D4AF37] to-[#AA771C] shadow-sm scale-105'
                        : 'p-[1px] bg-white/20 group-hover:bg-[#D4AF37]/50'
                    }`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#111116] flex items-center justify-center p-0.5">
                      <img
                        src={getCleanImageUrl(cat.image)}
                        alt={cat.name_uz}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                        }}
                        className={`w-full h-full object-cover rounded-full transition-transform duration-300 ${
                          isSelected ? 'scale-105' : 'group-hover:scale-105'
                        }`}
                      />
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-medium tracking-tight max-w-[62px] truncate ${
                      isSelected ? 'text-[#D4AF37] font-bold' : 'text-gray-300 group-hover:text-white'
                    }`}
                  >
                    {language === 'uz' ? cat.name_uz : cat.name_ru}
                  </span>
                </button>
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
