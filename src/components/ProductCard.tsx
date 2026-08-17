import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { getCleanImageUrl, getProductImages, handleImageError } from '../utils/imageUtils';

// Product IDs whose images have dark/black backgrounds (use screen blend mode instead of multiply)
const DARK_BG_PRODUCT_IDS = new Set([10, 13, 23, 59, 71, 105, 200, 201, 202, 203, 204, 205, 207, 208, 209, 210]);


interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, favorites, toggleFavorite, setSelectedProductModal, addToCart, t } = useApp();

  const isFav = favorites.includes(product.id);
  const images = getProductImages(product.images);
  const mainImage = getCleanImageUrl(images[0]);
  const isDarkBg = DARK_BG_PRODUCT_IDS.has(product.id);


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
      className="group relative product-luxury-card rounded-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden active:scale-[0.98]"
    >
      {/* Top Badges & Like Button */}
      <div className="relative aspect-square w-full bg-white rounded-t-2xl overflow-hidden p-3 flex items-center justify-center border-b border-[#D4AF37]/20">
        <img
          src={mainImage}
          alt={product.name}
          onError={handleImageError}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-108"
          loading="eager"
        />

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavClick}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:border-[#D4AF37] transition active:scale-90 shadow-sm z-10"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isFav ? 'fill-red-500 text-red-500' : 'text-white group-hover:text-[#D4AF37]'
            }`}
          />
        </button>

        {/* Badges: Bestseller / New */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.is_bestseller && (
            <span className="px-2 py-0.5 rounded-md bg-[#D4AF37] text-black text-[8px] font-black uppercase tracking-wider shadow">
              Bestseller
            </span>
          )}
          {product.is_new && (
            <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[8px] font-black uppercase tracking-wider shadow">
              NEW
            </span>
          )}
        </div>

        {/* Rating Pill */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#D4AF37]/40 text-[10px] text-white shadow-sm z-10">
          <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
          <span className="font-bold">{product.rating}</span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <span className="text-[10px] text-[#D4AF37] tracking-widest uppercase font-bold block truncate">
            {product.brand}
          </span>
          <h3 className="text-sm font-serif font-bold product-card-title text-gray-100 line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
            {product.name}
          </h3>
          <p className="text-[10px] product-card-sub text-gray-400 line-clamp-1 mt-0.5">
            {language === 'uz' ? product.scent_family_uz : product.scent_family_ru}
          </p>
        </div>

        {/* Price & Quick Add */}
        <div className="pt-1.5 flex items-center justify-between border-t border-[#D4AF37]/15">
          <div>
            <span className="text-[9px] product-card-sub text-gray-400 block">{t('fromPrice')} 10 ml</span>
            <span className="text-sm font-bold text-[#D4AF37]">
              {product.price_10g.toLocaleString('uz-UZ')}{' '}
              <span className="text-[10px] font-normal product-card-sub text-gray-300">{t('som')}</span>
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
