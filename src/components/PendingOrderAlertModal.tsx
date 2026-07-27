import React from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { AlertCircle, CreditCard, X, ChevronRight, Sparkles } from 'lucide-react';

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
  if (!pendingOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#150B21] border border-[#D4AF37]/50 rounded-3xl p-6 text-gray-100 space-y-4 shadow-gold-glow-lg animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <AlertCircle className="w-5 h-5 animate-pulse" />
            <h3 className="text-sm font-serif font-bold text-gray-100 gold-gradient-text">
              To'lanmagan Buyurtma Mavjud
            </h3>
          </div>
          <button onClick={onDismiss} className="text-gray-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-gray-300 leading-relaxed">
          Sizda to'lovi tugallanmagan <b>Buyurtma #{pendingOrder.id}</b> mavjud. Uni rasmiylashtirishni (to'lov qilishni) xohlaysizmi?
        </p>

        {/* Payment Summary Box */}
        <div className="p-3 bg-[#1E0F30] rounded-2xl border border-[#D4AF37]/30 space-y-2 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>Karta raqami:</span>
            <span className="font-mono font-bold text-[#D4AF37]">9860 1201 0261 5172</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Karta egasi:</span>
            <span className="font-bold text-gray-200">Azamat Umarqulov</span>
          </div>
          <div className="flex justify-between text-gray-200 pt-1 border-t border-white/10 font-bold">
            <span>Jami summa:</span>
            <span className="text-[#D4AF37]">{pendingOrder.total_amount.toLocaleString('uz-UZ')} so'm</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => onOpenPayment(pendingOrder)}
            className="w-full py-3.5 gold-btn rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-gold-glow"
          >
            <CreditCard className="w-4 h-4" />
            <span>💳 Hozir To'lov Qilish (Chek Yuklash)</span>
          </button>

          <button
            onClick={onDismiss}
            className="w-full py-2.5 rounded-xl border border-white/10 text-xs text-gray-400 hover:text-gray-200"
          >
            Keyinroq to'lash
          </button>
        </div>

      </div>
    </div>
  );
};
