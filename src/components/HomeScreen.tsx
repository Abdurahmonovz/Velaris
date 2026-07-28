import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { Search, Sparkles, ChevronRight, Flame, Award } from 'lucide-react';

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

  const bestsellers = products.filter((p) => p.is_bestseller);

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
                src={banner.image}
                alt={banner.title_uz}
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

      {/* 3D Floating Wave & Rotating Gold Ring Category Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
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

        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth">
          {/* All Category Circle */}
          <div
            onClick={() => setSelectedCategory(null)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group animate-category-wave-odd"
          >
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center p-0.5">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#D4AF37]/50 animate-rotate-ring" />
              <div
                className={`w-full h-full rounded-full bg-[#160A26] flex items-center justify-center border transition-all ${
                  selectedCategory === null
                    ? 'border-[#D4AF37] shadow-gold-glow scale-105 bg-[#26123D]'
                    : 'border-white/10 group-hover:border-[#D4AF37]/60'
                }`}
              >
                <span className="text-xs font-bold gold-gradient-text">ALL</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#D4AF37] tracking-tight">
              {t('seeAll')}
            </span>
          </div>

          {/* Category Floating Items */}
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat.slug;
            const waveClass = idx % 2 === 0 ? 'animate-category-wave-odd' : 'animate-category-wave-even';

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.slug)}
                className={`flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group transition-all ${waveClass}`}
              >
                <div className="relative w-16 h-16 rounded-full flex items-center justify-center p-0.5">
                  {/* Rotating Gold Ring Accent */}
                  <div
                    className={`absolute inset-0 rounded-full border-2 border-dashed transition-opacity ${
                      isSelected
                        ? 'border-[#D4AF37] animate-rotate-ring opacity-100'
                        : 'border-[#D4AF37]/40 group-hover:animate-rotate-ring opacity-70'
                    }`}
                  />
                  <div
                    className={`w-full h-full rounded-full overflow-hidden p-0.5 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-tr from-[#FFF0B8] via-[#D4AF37] to-[#AA771C] shadow-gold-glow scale-110'
                        : 'bg-white/10 group-hover:scale-105'
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name_uz}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <span
                  className={`text-[10px] font-medium tracking-tight max-w-[68px] truncate text-center transition-colors ${
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

      {/* Bestsellers Section Horizontal */}
      {bestsellers.length > 0 && !selectedCategory && !searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{t('bestsellersTitle')}</span>
            </h2>
            <button
              onClick={() => setActiveTab('catalog')}
              className="text-[10px] text-gray-400 hover:text-[#D4AF37] flex items-center gap-0.5"
            >
              <span>{t('seeAll')}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {bestsellers.slice(0, 2).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Main Perfume Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.[`name_${language}`]
              : t('allProductsTitle')}
          </h2>
          <span className="text-[10px] text-gray-400">
            {filteredProducts.length} mahsulot
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-[#140921] rounded-2xl border border-white/5 space-y-2">
            <p className="text-xs text-gray-400">Mahsulotlar topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
