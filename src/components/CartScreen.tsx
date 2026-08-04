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
              className="p-3.5 bg-gradient-to-r from-[#1A0E2B] to-[#12081E] rounded-2xl border border-[#D4AF37]/20 flex gap-3 items-center relative group"
            >
              {/* Product Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0A0510] border border-[#D4AF37]/30 flex-shrink-0">
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
                    <span className="px-2 py-0.5 rounded-md bg-[#26123D] border border-[#D4AF37]/30 text-[10px] text-[#D4AF37] font-bold">
                      {item.size}
                    </span>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 bg-[#12081E] px-2 py-0.5 rounded-lg border border-white/10">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.size, -1)}
                        className="text-gray-300 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-gray-100 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.size, 1)}
                        className="text-gray-300 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
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

      {/* Cart Summary Card */}
      <div className="p-4 bg-[#1A0E2B] rounded-2xl border border-[#D4AF37]/30 space-y-2.5">
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
