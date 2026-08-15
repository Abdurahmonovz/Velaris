import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DecantSize } from '../types';
import {
  X,
  Star,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  Sparkles,
  Droplets,
  Wind,
  ShieldCheck,
  Award,
  Clock,
  Share2,
  Check,
  Compass,
  Layers,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { getCleanImageUrl, getProductImages, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils';

const DARK_BG_PRODUCT_IDS = new Set([10, 13, 23, 59, 71, 105, 200, 201, 202, 203, 204, 205, 207, 208, 209, 210]);


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
  const [copied, setCopied] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  if (!selectedProductModal) return null;

  const product = selectedProductModal;
  const isFav = favorites.includes(product.id);
  const isDarkBg = DARK_BG_PRODUCT_IDS.has(product.id);
  const parsedImages = getProductImages(product.images);

  const rawImages = parsedImages.length > 0 ? parsedImages : [FALLBACK_PRODUCT_IMAGE];
  const images = rawImages.map(getCleanImageUrl);

  const decantPrices: { size: DecantSize; price: number; isBestValue?: boolean }[] = [
    { size: '10g', price: product.price_10g },
    { size: '20g', price: product.price_20g },
    { size: '30g', price: product.price_30g },
    { size: '50g', price: product.price_50g, isBestValue: true },
    { size: '100g', price: product.price_100g, isBestValue: true },
  ];

  const currentUnitPrice =
    selectedSize === '10g'
      ? product.price_10g
      : selectedSize === '20g'
      ? product.price_20g
      : selectedSize === '30g'
      ? product.price_30g
      : selectedSize === '50g'
      ? product.price_50g
      : product.price_100g;

  const totalPrice = currentUnitPrice * quantity;

  const handleShare = () => {
    const shareText = `💎 ${product.brand} - ${product.name}\n🌟 Velaris Parfume Atelier\nNarxi: ${product.price_10g.toLocaleString('uz-UZ')} so'm dan\nhttps://t.me/velaris_parfume_atelier_bot?start=prod_${product.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      setSelectedProductModal(null);
    }, 450);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, quantity);
    setSelectedProductModal(null);
    setActiveTab('cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      {/* Toast feedback */}
      {addedToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-[#1E0F30] border border-[#D4AF37] text-[#D4AF37] px-4 py-2.5 rounded-2xl shadow-gold-glow flex items-center gap-2 text-xs font-bold animate-in fade-in zoom-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
          <span>{t('addedToCartToast')}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="relative w-full max-w-lg product-modal-container bg-[#12081E] border border-[#D4AF37]/30 rounded-t-3xl sm:rounded-3xl shadow-gold-glow-lg text-gray-100 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Top Floating Action Bar */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(product.id)}
              className="p-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:border-[#D4AF37] transition active:scale-90 shadow-md"
              title="Sevimli qilish"
            >
              <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-200'}`} />
            </button>

            {/* Share / Copy Link Button */}
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:border-[#D4AF37] transition active:scale-90 shadow-md flex items-center gap-1.5"
              title="Ulashish"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[10px] font-bold text-[#D4AF37] pr-1">{t('copied')}</span>
                </>
              ) : (
                <Share2 className="w-4 h-4 text-gray-200" />
              )}
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setSelectedProductModal(null)}
            className="pointer-events-auto p-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:border-[#D4AF37] transition active:scale-90 shadow-md"
            title="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 no-scrollbar space-y-5 pb-28">
          
          {/* Main Image Slider with Zoom Toggle & Badges */}
          <div className={`relative w-full aspect-[4/3] product-modal-image-frame${isDarkBg ? ' dark-bg' : ''} overflow-hidden flex items-center justify-center border-b border-[#D4AF37]/15`}>
            <img
              src={images[activeImageIdx]}
              alt={product.name}
              onClick={() => setIsZoomed(!isZoomed)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.triedFallback) {
                  target.dataset.triedFallback = 'true';
                  target.src = FALLBACK_PRODUCT_IMAGE;
                }
              }}
              className={`w-full h-full object-contain p-4 transition-transform duration-300 ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
            />

            {/* Zoom Toggle Button */}
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 hover:text-[#D4AF37] transition active:scale-90"
              title={isZoomed ? 'Kichraytirish' : 'Kattalashtirish'}
            >
              {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
            </button>

            {/* Extrait de Parfum Badge */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#D4AF37]/30 text-[10px] text-[#D4AF37] font-semibold shadow">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>Extrait de Parfum (35%)</span>
            </div>
            
            {/* Image Thumbnails / Dots if multiple */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-2 rounded-full transition-all ${
                      activeImageIdx === idx ? 'bg-[#D4AF37] w-5' : 'bg-gray-500 w-2'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="px-4 space-y-5">
            {/* Brand, Title, Rating & Stock */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase">
                    {product.brand}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#1E0F30] px-2.5 py-1 rounded-full border border-[#D4AF37]/30 text-xs">
                  <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="font-bold text-gray-100">{product.rating}</span>
                  <span className="text-gray-400 text-[10px]">({product.reviews_count || 12})</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-100 gold-gradient-text leading-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-300 bg-[#1A0E2B] px-2.5 py-1 rounded-lg border border-white/10">
                  <Compass className="w-3 h-3 text-[#D4AF37]" />
                  <span>{language === 'uz' ? product.scent_family_uz : product.scent_family_ru}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{t('inStock')}</span>
                </span>
              </div>
            </div>

            {/* 4 Luxury Spec Cards Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-2xl bg-[#160A26] border border-[#D4AF37]/15 flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
                  <Droplets className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-gray-400 block uppercase font-medium">
                    {t('concentration')}
                  </span>
                  <span className="text-[11px] font-bold text-gray-200 truncate block">
                    Sof parfyum moyi
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#160A26] border border-[#D4AF37]/15 flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-gray-400 block uppercase font-medium">
                    {t('longevity')}
                  </span>
                  <span className="text-[11px] font-bold text-gray-200 truncate block">
                    {t('longevityValue')}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#160A26] border border-[#D4AF37]/15 flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
                  <Wind className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-gray-400 block uppercase font-medium">
                    {t('sillage')}
                  </span>
                  <span className="text-[11px] font-bold text-gray-200 truncate block">
                    {t('sillageValue')}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#160A26] border border-[#D4AF37]/15 flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-gray-400 block uppercase font-medium">
                    Kafolat
                  </span>
                  <span className="text-[11px] font-bold text-gray-200 truncate block">
                    100% Original
                  </span>
                </div>
              </div>
            </div>

            {/* Olfactory Scent Pyramid Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('scentPyramid')}</span>
              </h3>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-gradient-to-b from-[#1A0E2B] to-[#12081E] border border-[#D4AF37]/20 rounded-2xl space-y-1">
                  <div className="flex items-center justify-center gap-1 text-[9px] text-[#D4AF37] font-bold uppercase">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    <span>{t('topNotes')}</span>
                  </div>
                  <p className="text-[11px] text-gray-200 font-semibold line-clamp-2">
                    {language === 'uz' ? product.top_notes_uz : product.top_notes_ru}
                  </p>
                </div>

                <div className="p-2.5 bg-gradient-to-b from-[#1A0E2B] to-[#12081E] border border-[#D4AF37]/20 rounded-2xl space-y-1">
                  <div className="flex items-center justify-center gap-1 text-[9px] text-[#D4AF37] font-bold uppercase">
                    <Layers className="w-3 h-3 text-[#D4AF37]" />
                    <span>{t('heartNotes')}</span>
                  </div>
                  <p className="text-[11px] text-gray-200 font-semibold line-clamp-2">
                    {language === 'uz' ? product.heart_notes_uz : product.heart_notes_ru}
                  </p>
                </div>

                <div className="p-2.5 bg-gradient-to-b from-[#1A0E2B] to-[#12081E] border border-[#D4AF37]/20 rounded-2xl space-y-1">
                  <div className="flex items-center justify-center gap-1 text-[9px] text-[#D4AF37] font-bold uppercase">
                    <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                    <span>{t('baseNotes')}</span>
                  </div>
                  <p className="text-[11px] text-gray-200 font-semibold line-clamp-2">
                    {language === 'uz' ? product.base_notes_uz : product.base_notes_ru}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                {t('description')}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed bg-[#160A26] p-3 rounded-2xl border border-white/5">
                {language === 'uz' ? product.description_uz : product.description_ru}
              </p>
            </div>

            {/* Decant Volume Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{t('selectDecant')}</span>
                </h3>
                <span className="text-[10px] text-gray-400">
                  1g ≈ 1.2 ml
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {decantPrices.map((item) => {
                  const isActive = selectedSize === item.size;
                  return (
                    <button
                      key={item.size}
                      onClick={() => setSelectedSize(item.size)}
                      className={`p-2 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-between relative ${
                        isActive
                          ? 'border-[#D4AF37] bg-gradient-to-b from-[#26123D] to-[#170928] shadow-gold-glow scale-105 z-10'
                          : 'border-white/10 bg-[#160A26] hover:border-[#D4AF37]/40'
                      }`}
                    >
                      {item.isBestValue && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-[#D4AF37] text-black text-[7px] font-black uppercase tracking-wider shadow">
                          {t('bestValue')}
                        </span>
                      )}
                      <span className={`text-xs font-bold ${isActive ? 'text-[#D4AF37]' : 'text-gray-200'}`}>
                        {item.size.replace('g', ' ml')}
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
            <div className="flex items-center justify-between bg-gradient-to-r from-[#1E0F30] via-[#160A26] to-[#1E0F30] p-3.5 rounded-2xl border border-[#D4AF37]/25 shadow-md">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-medium">
                  {t('quantity')}
                </span>
                <div className="flex items-center gap-2.5 mt-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-xl bg-[#26123D] hover:bg-[#341852] border border-[#D4AF37]/30 flex items-center justify-center text-gray-100 active:scale-95 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-base font-bold text-[#D4AF37] w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-[#26123D] hover:bg-[#341852] border border-[#D4AF37]/30 flex items-center justify-center text-gray-100 active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase font-medium">
                  {t('totalPrice')}
                </span>
                <span className="text-lg font-bold text-[#D4AF37]">
                  {totalPrice.toLocaleString('uz-UZ')}{' '}
                  <span className="text-xs font-normal text-gray-300">{t('som')}</span>
                </span>
              </div>
            </div>

            {/* Atelier Trust Badges Bar */}
            <div className="grid grid-cols-3 gap-2 pt-1 pb-2 text-center text-[10px] text-gray-300">
              <div className="p-2 rounded-xl bg-[#160A26]/80 border border-white/5 space-y-1">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] mx-auto" />
                <span className="block font-medium leading-tight">100% Original</span>
              </div>
              <div className="p-2 rounded-xl bg-[#160A26]/80 border border-white/5 space-y-1">
                <Droplets className="w-4 h-4 text-[#D4AF37] mx-auto" />
                <span className="block font-medium leading-tight">Shisha atomayzer</span>
              </div>
              <div className="p-2 rounded-xl bg-[#160A26]/80 border border-white/5 space-y-1">
                <Award className="w-4 h-4 text-[#D4AF37] mx-auto" />
                <span className="block font-medium leading-tight">Yuqori sifat</span>
              </div>
            </div>

          </div>
        </div>

        {/* Fixed Bottom Action Buttons Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5 bg-[#0D0517]/95 backdrop-blur-md border-t border-[#D4AF37]/25 grid grid-cols-2 gap-2.5 z-30">
          <button
            onClick={handleAddToCart}
            className="py-3 px-3 rounded-2xl border border-[#D4AF37]/40 bg-[#1E0F30] hover:bg-[#281440] text-[#D4AF37] font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('addToCart')}</span>
          </button>

          <button
            onClick={handleBuyNow}
            className="py-3 px-3 gold-btn rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-gold-glow"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{t('buyNow')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
