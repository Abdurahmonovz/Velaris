import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { Gender } from '../types';
import {
  SlidersHorizontal,
  Search,
  Sparkles,
  Flame,
  Star,
  RotateCcw,
  X,
  Award,
  Crown,
} from 'lucide-react';
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
  const [fastFilter, setFastFilter] = useState<'all' | 'bestseller' | 'new' | 'top_rated' | 'premium'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'rating'>('default');

  const getCategoryProductCount = (catSlug: string) => {
    return products.filter((p) => {
      if (catSlug === 'erkaklar') return p.category_slug === 'erkaklar' || p.gender === 'men';
      if (catSlug === 'ayollar') return p.category_slug === 'ayollar' || p.gender === 'women';
      if (catSlug === 'unisex') return p.category_slug === 'unisex' || p.gender === 'unisex';
      if (catSlug === 'yangi') return p.is_new;
      if (catSlug === 'bestseller') return p.is_bestseller;
      if (catSlug === 'premium') return p.category_slug === 'premium' || p.price_10g >= 120000;
      return p.category_slug === catSlug;
    }).length;
  };

  const hasActiveFilters =
    selectedCategory !== null ||
    selectedGender !== 'all' ||
    fastFilter !== 'all' ||
    searchQuery.trim() !== '' ||
    sortBy !== 'default';

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedGender('all');
    setFastFilter('all');
    setSearchQuery('');
    setSortBy('default');
  };

  const filteredProducts = products
    .filter((p) => {
      // 1. Category Matching
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

      // 2. Gender Matching
      let matchesGender = true;
      if (selectedGender !== 'all') {
        if (selectedGender === 'women') {
          matchesGender = p.gender === 'women' || (p.category_slug === 'ayollar' && p.gender !== 'men');
        } else if (selectedGender === 'men') {
          matchesGender = p.gender === 'men' || (p.category_slug === 'erkaklar' && p.gender !== 'women');
        } else if (selectedGender === 'unisex') {
          matchesGender = p.gender === 'unisex' || p.category_slug === 'unisex';
        }
      }

      // 3. Fast Filter Matching
      let matchesFast = true;
      if (fastFilter === 'bestseller') {
        matchesFast = p.is_bestseller;
      } else if (fastFilter === 'new') {
        matchesFast = p.is_new;
      } else if (fastFilter === 'top_rated') {
        matchesFast = p.rating >= 4.8;
      } else if (fastFilter === 'premium') {
        matchesFast = p.category_slug === 'premium' || p.price_10g >= 120000;
      }

      // 4. Search Matching (Deep search across name, brand, scent notes, scent family)
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

      return matchesCategory && matchesGender && matchesFast && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price_10g - b.price_10g;
      if (sortBy === 'price_desc') return b.price_10g - a.price_10g;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.id - a.id;
    });

  return (
    <div className="space-y-4 pb-24 pt-2 px-4 max-w-md mx-auto">
      {/* Title & Count Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-[#D4AF37]" />
          <h1 className="text-xl font-serif font-bold text-gray-100 gold-gradient-text">
            {t('navCatalog')}
          </h1>
        </div>
        <span className="text-xs text-[#D4AF37] font-semibold bg-[#1E0F30] px-3 py-1 rounded-full border border-[#D4AF37]/30 shadow">
          {filteredProducts.length} {language === 'uz' ? 'atir' : 'аромат'}
        </span>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-[#160A26] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-2xl py-3 pl-10 pr-10 text-xs text-gray-100 placeholder-gray-400 focus:outline-none transition shadow-inner"
        />
        <Search className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 text-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Gender Filter Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#12081E] rounded-2xl border border-white/10 text-xs">
        <button
          onClick={() => setSelectedGender('all')}
          className={`py-2 rounded-xl font-semibold transition active:scale-95 ${
            selectedGender === 'all'
              ? 'bg-[#D4AF37] text-black shadow-gold-glow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {t('genderAll')}
        </button>
        <button
          onClick={() => setSelectedGender('men')}
          className={`py-2 rounded-xl font-semibold transition active:scale-95 ${
            selectedGender === 'men'
              ? 'bg-[#D4AF37] text-black shadow-gold-glow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {t('genderMen')}
        </button>
        <button
          onClick={() => setSelectedGender('women')}
          className={`py-2 rounded-xl font-semibold transition active:scale-95 ${
            selectedGender === 'women'
              ? 'bg-[#D4AF37] text-black shadow-gold-glow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {t('genderWomen')}
        </button>
        <button
          onClick={() => setSelectedGender('unisex')}
          className={`py-2 rounded-xl font-semibold transition active:scale-95 ${
            selectedGender === 'unisex'
              ? 'bg-[#D4AF37] text-black shadow-gold-glow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {t('genderUnisex')}
        </button>
      </div>

      {/* Quick Filter Chips (Bestseller, New, 4.8+, Premium) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setFastFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 border ${
            fastFilter === 'all'
              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
              : 'bg-[#160A26] border-white/10 text-gray-400 hover:text-gray-200'
          }`}
        >
          {t('seeAll')}
        </button>

        <button
          onClick={() => setFastFilter(fastFilter === 'bestseller' ? 'all' : 'bestseller')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition active:scale-95 border ${
            fastFilter === 'bestseller'
              ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-sm'
              : 'bg-[#160A26] border-white/10 text-gray-400 hover:text-gray-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Bestseller</span>
        </button>

        <button
          onClick={() => setFastFilter(fastFilter === 'new' ? 'all' : 'new')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition active:scale-95 border ${
            fastFilter === 'new'
              ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-sm'
              : 'bg-[#160A26] border-white/10 text-gray-400 hover:text-gray-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Yangi</span>
        </button>

        <button
          onClick={() => setFastFilter(fastFilter === 'top_rated' ? 'all' : 'top_rated')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition active:scale-95 border ${
            fastFilter === 'top_rated'
              ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-sm'
              : 'bg-[#160A26] border-white/10 text-gray-400 hover:text-gray-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span>4.8+ Reyting</span>
        </button>

        <button
          onClick={() => setFastFilter(fastFilter === 'premium' ? 'all' : 'premium')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition active:scale-95 border ${
            fastFilter === 'premium'
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
              : 'bg-[#160A26] border-white/10 text-gray-400 hover:text-gray-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>Premium</span>
        </button>
      </div>

      {/* Visual Category Cards Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t('categoriesTitle')}</span>
          </span>
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
              const catProductCount = getCategoryProductCount(cat.slug);

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.slug)}
                  className={`flex-shrink-0 w-28 p-2 rounded-2xl border transition-all cursor-pointer text-center space-y-1.5 relative overflow-hidden group active:scale-95 focus:outline-none ${
                    isSelected
                      ? 'border-[#D4AF37] bg-[#1E1E28] shadow-sm scale-105'
                      : 'border-white/10 bg-[#13131A] hover:border-[#D4AF37]/50'
                  }`}
                >
                  <div className="w-full h-14 rounded-xl overflow-hidden border border-[#D4AF37]/20 bg-[#0E0E14] relative">
                    <img
                      src={getCleanImageUrl(cat.image)}
                      alt={cat.name_uz}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                      }}
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 text-[8px] font-bold text-[#D4AF37] border border-[#D4AF37]/30">
                      {catProductCount}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold block truncate ${
                      isSelected ? 'text-[#D4AF37]' : 'text-gray-200 group-hover:text-[#D4AF37]'
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

      {/* Sorting & Filter Reset Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t('sortBy')}:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#160A26] border border-[#D4AF37]/30 text-xs text-[#D4AF37] rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="default">{t('sortDefault')}</option>
            <option value="price_asc">{t('sortPriceAsc')}</option>
            <option value="price_desc">{t('sortPriceDesc')}</option>
            <option value="rating">{t('sortRating')}</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1 text-[11px] text-[#D4AF37] hover:text-[#FFF0B8] bg-[#1E0F30] border border-[#D4AF37]/30 px-2.5 py-1.5 rounded-xl transition active:scale-95"
            title="Barcha filtrlarni tozalash"
          >
            <RotateCcw className="w-3 h-3 text-[#D4AF37]" />
            <span>{t('clearFilters')}</span>
          </button>
        )}
      </div>

      {/* Perfumes Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-gradient-to-b from-[#160A26] to-[#10071C] rounded-3xl border border-[#D4AF37]/20 space-y-3 shadow-inner">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto text-[#D4AF37]">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-200 gold-gradient-text">
              {t('noProductsFound')}
            </h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              {t('noProductsFoundDesc')}
            </p>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-xl gold-btn text-xs font-bold shadow transition active:scale-95 inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('clearFilters')}</span>
          </button>
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
