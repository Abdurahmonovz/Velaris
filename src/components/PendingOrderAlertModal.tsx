import React, { useState } from 'react';
import { Order } from '../types';
import { CreditCard, X, ChevronRight } from 'lucide-react';

interface PendingOrderAlertModalProps {
  pendingOrder: Order | null;
  onOpenPayment: (order: Order) => void;
  onDismiss: () => void;
}

export const PendingOrderAlertModal: React.FC<PendingOrderAlertModalProps> = ({
  pendingOrder,
  onOpenPayment,
  onDismiss,
}) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  if (!pendingOrder) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeOffset) > 60) {
      onDismiss();
    }
    setTouchStartX(null);
    setSwipeOffset(0);
  };

  return (
    <div
      className="fixed top-3 left-3 right-3 z-50 max-w-md mx-auto animate-in slide-in-from-top-5 duration-300"
      style={{
        transform: `translateX(${swipeOffset}px)`,
        opacity: 1 - Math.abs(swipeOffset) / 200,
        transition: touchStartX === null ? 'all 0.2s ease-out' : 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        onClick={() => onOpenPayment(pendingOrder)}
        className="relative bg-gradient-to-r from-[#1A0E2B] via-[#150B21] to-[#0D0517] border border-[#D4AF37]/60 rounded-2xl p-3.5 shadow-gold-glow-lg text-gray-100 flex items-center justify-between gap-3 cursor-pointer hover:border-[#D4AF37] transition active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 animate-pulse">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#D4AF37] truncate">
              Rasmiylashtirilmagan buyurtma bor!
            </h4>
            <p className="text-[10px] text-gray-300 truncate">
              Buyurtma #{pendingOrder.id} • To'lov qilish uchun bosing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition"
            title="Yopish"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
