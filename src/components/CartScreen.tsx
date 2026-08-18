import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckoutModal } from './CheckoutModal';
import { PaymentModal } from './PaymentModal';
import { Order } from '../types';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { getCleanImageUrl, getProductImages, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils';

interface CartScreenProps {
  onOpenPayment?: (order: Order) => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onOpenPayment }) => {
  const { cart, updateCartQuantity, removeFromCart, setActiveTab, t } = useApp();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    if (onOpenPayment) {
      onOpenPayment(order);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-5 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-[#160A26] border border-[#D4AF37]/30 flex items-center justify-center text-gray-400">
          <ShoppingBag className="w-9 h-9 text-[#D4AF37]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold text-gray-100">{t('emptyCart')}</h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            {t('emptyCartDesc')}
          </p>
        </div>
        <button
          onClick={() => setActiveTab('catalog')}
          className="py-3 px-6 gold-btn rounded-xl text-xs font-bold flex items-center gap-2 shadow-gold-glow"
        >
          <span>{t('goToCatalog')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-28 pt-2 px-4 max-w-md mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-serif font-bold text-gray-100 gold-gradient-text">
          {t('cartTitle')}
        </h1>
        <span className="text-xs text-gray-400">
          {cart.length} mahsulot
        </span>
      </div>

      {/* Cart Item Cards */}
      <div className="space-y-3">
        {cart.map((item) => {
          const images = getProductImages(item.product.images);
          const mainImg = getCleanImageUrl(images[0]);

          return (
            <div
              key={`${item.productId}-${item.size}`}
              className="p-3.5 bg-gradient-to-r from-[#14141B] to-[#0E0E14] rounded-2xl border border-[#D4AF37]/20 flex gap-3 items-center relative group"
            >
              {/* Product Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0E0E14] border border-[#D4AF37]/30 flex-shrink-0">
                <img
                  src={mainImg}
                  alt={item.product.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = 'true';
                      target.src = FALLBACK_PRODUCT_IMAGE;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <span className="text-[9px] text-[#D4AF37] uppercase tracking-wider font-semibold block">
                      {item.product.brand}
                    </span>
                    <h3 className="text-xs font-serif font-bold text-gray-100 truncate">
                      {item.product.name}
                    </h3>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.size)}
                    className="text-gray-400 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#1E1E28] border border-[#D4AF37]/30 text-[10px] text-[#D4AF37] font-bold">
                      {item.size}
                    </span>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 bg-[#14141B] px-2 py-0.5 rounded-lg border border-white/10">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.size, -1)}
                        className="text-gray-300 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-gray-100 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.size, 1)}
                        className="text-gray-300 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#D4AF37]">
                    {item.totalPrice.toLocaleString('uz-UZ')} <span className="text-[9px] font-normal text-gray-400">{t('som')}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Free Delivery Threshold Tracker (500,000+ UZS) */}
      <div className="p-3.5 bg-gradient-to-r from-[#1A1A24] to-[#111116] rounded-2xl border border-[#D4AF37]/30 space-y-2">
        <div className="flex items-center justify-between text-xs">
          {subtotal >= 500000 ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              🎉 Tabriklaymiz! Sizga yetkazib berish BEPUL!
            </span>
          ) : (
            <span className="text-gray-300 font-medium text-[11px]">
              🚚 Bepul yetkazib berish uchun yana <strong className="text-[#D4AF37]">{(500000 - subtotal).toLocaleString('uz-UZ')} so'm</strong> xarid qiling!
            </span>
          )}
          <span className="text-[10px] font-bold text-[#D4AF37]">
            {Math.min(100, Math.round((subtotal / 500000) * 100))}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#0A0A0E] rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#FFF0B8] via-[#D4AF37] to-[#AA771C] rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(100, Math.round((subtotal / 500000) * 100))}%` }}
          />
        </div>
      </div>

      {/* Cart Summary Card */}
      <div className="p-4 bg-[#14141B] rounded-2xl border border-[#D4AF37]/30 space-y-2.5">
        <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
          {t('cartSummary')}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-300">
          <span>{t('subtotal')}</span>
          <span>{subtotal.toLocaleString('uz-UZ')} {t('som')}</span>
        </div>
        <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between font-bold text-sm">
          <span className="text-gray-100">{t('totalPrice')}</span>
          <span className="text-[#D4AF37] text-base">{subtotal.toLocaleString('uz-UZ')} {t('som')}</span>
        </div>

        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="w-full py-4 gold-btn rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-2 shadow-gold-glow"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('checkoutBtn')}</span>
        </button>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleOrderSuccess}
      />
    </div>
  );
};
