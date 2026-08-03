import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, Star, ShoppingBag, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, favorites, toggleFavorite, setSelectedProductModal, addToCart, t } = useApp();

  const isFav = favorites.includes(product.id);
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80';

  const handleCardClick = () => {
    setSelectedProductModal(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, '10g', 1);
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-gradient-to-b from-[#1A0E2B]/80 to-[#10071C]/90 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 overflow-hidden shadow-lg hover:shadow-gold-glow transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Badges & Like Button */}
      <div className="relative aspect-square w-full bg-[#12081E] overflow-hidden p-2 flex items-center justify-center">
        <img
          src={mainImage}
          alt={product.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80';
          }}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md"
          loading="lazy"
        />

        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10071C]/80 via-transparent to-black/20 pointer-events-none" />

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavClick}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:border-[#D4AF37] transition active:scale-90"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFav ? 'fill-red-500 text-red-500' : 'text-gray-300 group-hover:text-[#D4AF37]'
            }`}
          />
        </button>

        {/* Badges: Bestseller / New */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.is_bestseller && (
            <span className="px-2 py-0.5 rounded-md bg-[#D4AF37] text-black text-[9px] font-bold uppercase tracking-wider shadow">
              Bestseller
            </span>
          )}
          {product.is_new && (
            <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[9px] font-bold uppercase tracking-wider shadow">
              NEW
            </span>
          )}
        </div>

        {/* Rating Pill */}
        <div className="absolute bottom-2 left-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#D4AF37]/30 text-[10px] text-gray-200">
          <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
          <span className="font-semibold">{product.rating}</span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <span className="text-[10px] text-[#D4AF37] tracking-widest uppercase font-medium block">
            {product.brand}
          </span>
          <h3 className="text-sm font-serif font-bold text-gray-100 line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
            {product.name}
          </h3>
          <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
            {language === 'uz' ? product.scent_family_uz : product.scent_family_ru}
          </p>
        </div>

        {/* Price & Quick Add */}
        <div className="pt-1 flex items-center justify-between border-t border-[#D4AF37]/15">
          <div>
            <span className="text-[9px] text-gray-400 block">{t('fromPrice')} 10 ml</span>
            <span className="text-sm font-bold text-[#D4AF37]">
              {product.price_10g.toLocaleString('uz-UZ')} <span className="text-[10px] font-normal text-gray-300">{t('som')}</span>
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            className="p-2 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#D4AF37]/40 transition active:scale-95 shadow"
            title={t('addToCart')}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
