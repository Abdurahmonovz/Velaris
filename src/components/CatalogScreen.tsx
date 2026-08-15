import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { Gender } from '../types';
import { SlidersHorizontal, Search, Sparkles } from 'lucide-react';
import { getCleanImageUrl, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils';

export const CatalogScreen: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    language,
    t,
  } = useApp();

  const [selectedGender, setSelectedGender] = useState<Gender>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'rating'>('default');

  const getCategoryProductCount = (catSlug: string) => {
    return products.filter((p) => {
      if (catSlug === 'erkaklar') return p.category_slug === 'erkaklar' || p.gender === 'men';
      if (catSlug === 'ayollar') return p.category_slug === 'ayollar' || p.gender === 'women';
      if (catSlug === 'unisex') return p.category_slug === 'unisex' || p.gender === 'unisex';
      if (catSlug === 'yangi') return p.is_new;
      if (catSlug === 'bestseller') return p.is_bestseller;
      return p.category_slug === catSlug;
    }).length;
  };

  const filteredProducts = products
    .filter((p) => {
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
        } else {
          matchesCategory = p.category_slug === selectedCategory;
        }
      }

      let matchesGender = true;
      if (selectedGender !== 'all') {
        if (selectedGender === 'women') {
          matchesGender = p.gender === 'women' || (p.category_slug === 'ayollar' && p.gender !== 'men');
        } else if (selectedGender === 'men') {
          matchesGender = p.gender === 'men' || (p.category_slug === 'erkaklar' && p.gender !== 'women');
        } else if (selectedGender === 'unisex') {
          matchesGender = p.gender === 'unisex';
        }
      }

      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesGender && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price_10g - b.price_10g;
      if (sortBy === 'price_desc') return b.price_10g - a.price_10g;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.id - a.id;
    });

  return (
    <div className="space-y-4 pb-24 pt-2 px-4 max-w-md mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-serif font-bold text-gray-100 gold-gradient-text">
          {t('navCatalog')}
        </h1>
        <span className="text-xs text-[#D4AF37] font-semibold bg-[#1E0F30] px-3 py-1 rounded-full border border-[#D4AF37]/30">
          {filteredProducts.length} atir
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-[#160A26] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-2xl py-3 pl-10 pr-4 text-xs text-gray-100 placeholder-gray-400 focus:outline-none"
        />
        <Search className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Gender Filters Pills */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#12081E] rounded-xl border border-white/10 text-xs">
        <button
          onClick={() => setSelectedGender('all')}
          className={`py-2 rounded-lg font-semibold transition ${
            selectedGender === 'all'
              ? 'bg-[#D4AF37] text-black shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {t('seeAll')}
        </button>
        <button
          onClick={() => setSelectedGender('men')}
          className={`py-2 rounded-lg font-semibold transition ${
            selectedGender === 'men'
              ? 'bg-[#D4AF37] text-black shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Erkaklar
        </button>
        <button
          onClick={() => setSelectedGender('women')}
          className={`py-2 rounded-lg font-semibold transition ${
            selectedGender === 'women'
              ? 'bg-[#D4AF37] text-black shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Ayollar
        </button>
        <button
          onClick={() => setSelectedGender('unisex')}
          className={`py-2 rounded-lg font-semibold transition ${
            selectedGender === 'unisex'
              ? 'bg-[#D4AF37] text-black shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Unisex
        </button>
      </div>

      {/* Visual Category Cards Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Katalog Bo'limlari</span>
          </span>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[10px] text-[#D4AF37] hover:underline font-bold"
            >
              Barcha toifalar
            </button>
          )}
        </div>

        <div className="w-full relative rounded-2xl bg-[#12081E]/40 border border-[#D4AF37]/15 overflow-hidden">
          {/* Side Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#0A0510] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-[#0A0510] to-transparent z-10 pointer-events-none" />

          <div className="flex items-center gap-3 px-3 py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const catProductCount = getCategoryProductCount(cat.slug);

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.slug)}
                  className={`flex-shrink-0 w-28 p-2 rounded-2xl border transition-all cursor-pointer text-center space-y-1.5 relative overflow-hidden group active:scale-95 ${
                    isSelected
                      ? 'border-[#D4AF37] bg-gradient-to-b from-[#26123D] to-[#160A26] shadow-gold-glow scale-105'
                      : 'border-white/10 bg-[#12081E] hover:border-[#D4AF37]/50'
                  }`}
                >
                  <div className="w-full h-14 rounded-xl overflow-hidden border border-[#D4AF37]/30 bg-black relative">
                    <img
                      src={getCleanImageUrl(cat.image)}
                      alt={cat.name_uz}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                      }}
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 text-[8px] font-bold text-[#D4AF37] border border-[#D4AF37]/30">
                      {catProductCount}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold block truncate ${isSelected ? 'text-[#D4AF37]' : 'text-gray-200 group-hover:text-[#D4AF37]'}`}>
                    {language === 'uz' ? cat.name_uz : cat.name_ru}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sorting bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Saralash:</span>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-[#160A26] border border-[#D4AF37]/30 text-xs text-[#D4AF37] rounded-xl px-2.5 py-1.5 focus:outline-none"
        >
          <option value="default">Odatiy</option>
          <option value="price_asc">Narx: Arzondan qimmatga</option>
          <option value="price_desc">Narx: Qimmatdan arzonga</option>
          <option value="rating">Yuqori reytingli</option>
        </select>
      </div>

      {/* Perfumes Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-[#140921] rounded-2xl border border-white/5 space-y-2">
          <p className="text-xs text-gray-400">Hech qanday parfyum topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
