import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DecantSize } from '../types';
import { X, Star, Heart, Plus, Minus, ShoppingBag, Zap, Sparkles, Droplets, Wind, ShieldCheck } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductModal,
    setSelectedProductModal,
    language,
    favorites,
    toggleFavorite,
    addToCart,
    setActiveTab,
    t,
  } = useApp();

  const [selectedSize, setSelectedSize] = useState<DecantSize>('10g');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  if (!selectedProductModal) return null;

  const product = selectedProductModal;
  const isFav = favorites.includes(product.id);
  const images = product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'];

  const decantPrices: { size: DecantSize; price: number }[] = [
    { size: '10g', price: product.price_10g },
    { size: '20g', price: product.price_20g },
    { size: '30g', price: product.price_30g },
    { size: '50g', price: product.price_50g },
    { size: '100g', price: product.price_100g },
  ];

  const currentUnitPrice =
    selectedSize === '10g' ? product.price_10g :
    selectedSize === '20g' ? product.price_20g :
    selectedSize === '30g' ? product.price_30g :
    selectedSize === '50g' ? product.price_50g : product.price_100g;

  const totalPrice = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setSelectedProductModal(null);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, quantity);
    setSelectedProductModal(null);
    setActiveTab('cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="relative w-full max-w-lg bg-[#12081E] border border-[#D4AF37]/30 rounded-t-3xl sm:rounded-3xl shadow-gold-glow-lg text-gray-100 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Top Header Actions */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <button
            onClick={() => toggleFavorite(product.id)}
            className="pointer-events-auto p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:border-[#D4AF37] transition active:scale-90"
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-200'}`} />
          </button>

          <button
            onClick={() => setSelectedProductModal(null)}
            className="pointer-events-auto p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:border-[#D4AF37] transition active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 no-scrollbar space-y-6 pb-24">
          
          {/* Main Image Slider with Zoom Toggle */}
          <div className="relative w-full aspect-[4/3] bg-[#0A0510] overflow-hidden">
            <img
              src={images[activeImageIdx]}
              alt={product.name}
              onClick={() => setIsZoomed(!isZoomed)}
              className={`w-full h-full object-cover transition-transform duration-300 cursor-zoom-in ${
                isZoomed ? 'scale-150 cursor-zoom-out' : ''
              }`}
            />
            
            {/* Image Thumbnails if multiple */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      activeImageIdx === idx ? 'bg-[#D4AF37] w-6' : 'bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="px-5 space-y-5">
            {/* Brand, Title & Rating */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#D4AF37] tracking-widest uppercase">
                  {product.brand}
                </span>
                <div className="flex items-center gap-1 bg-[#1E0F30] px-2.5 py-1 rounded-full border border-[#D4AF37]/30 text-xs">
                  <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="font-bold text-gray-100">{product.rating}</span>
                  <span className="text-gray-400 text-[10px]">({product.reviews_count})</span>
                </div>
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-100 gold-gradient-text">
                {product.name}
              </h2>
              <p className="text-xs text-gray-400">
                {language === 'uz' ? product.scent_family_uz : product.scent_family_ru}
              </p>
            </div>

            {/* Scent Pyramid Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('scentPyramid')}</span>
              </h3>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-[#1A0E2B] border border-[#D4AF37]/20 rounded-xl space-y-1">
                  <span className="text-[10px] text-gray-400 block font-medium uppercase">{t('topNotes')}</span>
                  <p className="text-xs text-gray-200 font-semibold line-clamp-2">
                    {language === 'uz' ? product.top_notes_uz : product.top_notes_ru}
                  </p>
                </div>
                <div className="p-3 bg-[#1A0E2B] border border-[#D4AF37]/20 rounded-xl space-y-1">
                  <span className="text-[10px] text-gray-400 block font-medium uppercase">{t('heartNotes')}</span>
                  <p className="text-xs text-gray-200 font-semibold line-clamp-2">
                    {language === 'uz' ? product.heart_notes_uz : product.heart_notes_ru}
                  </p>
                </div>
                <div className="p-3 bg-[#1A0E2B] border border-[#D4AF37]/20 rounded-xl space-y-1">
                  <span className="text-[10px] text-gray-400 block font-medium uppercase">{t('baseNotes')}</span>
                  <p className="text-xs text-gray-200 font-semibold line-clamp-2">
                    {language === 'uz' ? product.base_notes_uz : product.base_notes_ru}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">{t('description')}</h3>
              <p className="text-xs text-gray-300 leading-relaxed bg-[#1A0E2B]/50 p-3 rounded-xl border border-white/5">
                {language === 'uz' ? product.description_uz : product.description_ru}
              </p>
            </div>

            {/* Decant Volume Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{t('selectDecant')}</span>
                </h3>
                <span className="text-[11px] text-emerald-400 font-medium">✓ {t('inStock')}</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {decantPrices.map((item) => {
                  const isActive = selectedSize === item.size;
                  return (
                    <button
                      key={item.size}
                      onClick={() => setSelectedSize(item.size)}
                      className={`p-2.5 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-between ${
                        isActive
                          ? 'border-[#D4AF37] bg-gradient-to-b from-[#26123D] to-[#170928] shadow-gold-glow scale-105'
                          : 'border-white/10 bg-[#160A26] hover:border-[#D4AF37]/40'
                      }`}
                    >
                      <span className={`text-xs font-bold ${isActive ? 'text-[#D4AF37]' : 'text-gray-200'}`}>
                        {item.size}
                      </span>
                      <span className="text-[9px] text-gray-400 mt-1">
                        {(item.price / 1000).toFixed(0)}k
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Controls & Dynamic Total */}
            <div className="flex items-center justify-between bg-[#1A0E2B] p-3.5 rounded-2xl border border-[#D4AF37]/20">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase">{t('quantity')}</span>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-[#26123D] hover:bg-[#341852] border border-[#D4AF37]/30 flex items-center justify-center text-gray-100 active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-bold text-[#D4AF37] w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-[#26123D] hover:bg-[#341852] border border-[#D4AF37]/30 flex items-center justify-center text-gray-100 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase">{t('totalPrice')}</span>
                <span className="text-lg font-bold text-[#D4AF37]">
                  {totalPrice.toLocaleString('uz-UZ')} <span className="text-xs font-normal text-gray-300">{t('som')}</span>
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Fixed Bottom Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0D0517]/95 backdrop-blur-md border-t border-[#D4AF37]/20 grid grid-cols-2 gap-3 z-30">
          <button
            onClick={handleAddToCart}
            className="py-3.5 px-4 rounded-xl border border-[#D4AF37]/40 bg-[#1E0F30] hover:bg-[#281440] text-[#D4AF37] font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('addToCart')}</span>
          </button>

          <button
            onClick={handleBuyNow}
            className="py-3.5 px-4 gold-btn rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-gold-glow"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{t('buyNow')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
