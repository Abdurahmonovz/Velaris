import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { X, CreditCard, Copy, Check, Upload, Sparkles, ShieldCheck, Loader2, CheckSquare, Clock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  orderId: number;
  totalAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  orderId,
  totalAmount,
  onClose,
  onSuccess,
}) => {
  const { user, refreshOrders, setActiveTab, t } = useApp();

  const cardNumber = '9860 1201 0261 5172';
  const cardHolder = 'Azamat Umarqulov';

  const [copied, setCopied] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isWaitingApproval, setIsWaitingApproval] = useState(false);

  // Real-time polling for admin approval
  useEffect(() => {
    if (!isWaitingApproval || !orderId) return;

    const interval = setInterval(async () => {
      await refreshOrders();
      try {
        const res = await fetch(`/api/orders?user_id=${user?.id || 1}`);
        if (res.ok) {
          const list: Order[] = await res.json();
          const target = list.find((o) => o.id === orderId);
          if (target && target.status !== 'To\'lov kutilmoqda') {
            clearInterval(interval);
            setIsWaitingApproval(false);
            localStorage.removeItem('velaris_pending_order');
            onSuccess();
            setActiveTab('orders');
          }
        }
      } catch (err) {
        console.error('Polling order error:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isWaitingApproval, orderId]);

  if (!isOpen) return null;

  // Waiting for Admin Approval Screen View
  if (isWaitingApproval) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="relative w-full max-w-sm bg-[#12081E] border border-[#D4AF37]/50 rounded-3xl p-6 text-gray-100 text-center space-y-6 shadow-gold-glow-lg animate-in zoom-in-95 duration-200">
          
          {/* Glowing Animated Spinner */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin shadow-gold-glow" />
            <div className="w-16 h-16 rounded-full bg-[#1A0E2B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-serif font-bold text-gray-100 gold-gradient-text">
              Iltimos, kutib turing!
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed max-w-xs mx-auto">
              Admin to'lov chekingizni va o'tkazmani tekshirmoqda... <span className="text-[#D4AF37] font-bold">☑️</span>
            </p>
          </div>

          {/* Status Box */}
          <div className="p-3 bg-[#1A0E2B] rounded-2xl border border-[#D4AF37]/30 text-xs space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span>Buyurtma:</span>
              <span className="font-bold text-[#D4AF37]">#{orderId}</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Status:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Tekshirilmoqda
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setIsWaitingApproval(false);
                onSuccess();
                setActiveTab('orders');
              }}
              className="w-full py-3 bg-[#1E0F30] border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-xl text-xs text-[#D4AF37] font-semibold transition"
            >
              Buyurtmalar bo'limiga o'tish
            </button>
          </div>

        </div>
      </div>
    );
  }

  const handleCopyCard = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptImage) {
      setError('Iltimos, to\'lov cheki (screenshot) rasmini yuklang!');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_receipt_image: receiptImage,
        }),
      });

      if (res.ok) {
        localStorage.removeItem('velaris_pending_order');
        await refreshOrders();
        setIsWaitingApproval(true);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Xatolik yuz berdi!');
      }
    } catch (err: any) {
      setError(err.message || 'Tarmoq xatoligi!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#12081E] border border-[#D4AF37]/40 rounded-3xl p-6 text-gray-100 space-y-5 shadow-gold-glow-lg max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-serif font-bold text-gray-100 gold-gradient-text">
              To'lov Sahifasi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Amount Badge */}
        <div className="p-4 bg-gradient-to-r from-[#26123D] to-[#170928] rounded-2xl border border-[#D4AF37]/30 text-center space-y-1">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
            To'lanishi kerak bo'lgan summa (Buyurtma #{orderId})
          </span>
          <span className="text-2xl font-bold text-[#D4AF37]">
            {totalAmount.toLocaleString('uz-UZ')} <span className="text-sm font-normal text-gray-300">{t('som')}</span>
          </span>
        </div>

        {/* Card Details Box */}
        <div className="p-4 bg-[#1A0E2B] rounded-2xl border border-[#D4AF37]/30 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Karta raqami (Uzcard / Humo):</span>
            <span className="text-[10px] text-[#D4AF37] font-semibold">100% Xavfsiz</span>
          </div>

          {/* Card Number & Copy */}
          <div className="p-3 bg-[#12081E] rounded-xl border border-[#D4AF37]/40 flex items-center justify-between">
            <span className="text-base font-mono font-bold text-[#D4AF37] tracking-wider">
              {cardNumber}
            </span>
            <button
              onClick={handleCopyCard}
              className="px-2.5 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-lg text-xs text-[#D4AF37] font-semibold flex items-center gap-1 hover:bg-[#D4AF37]/30 transition active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Nusxalandi' : 'Nusxa olish'}</span>
            </button>
          </div>

          {/* Cardholder Name */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-gray-400">Karta egasi:</span>
            <span className="font-bold text-gray-100">{cardHolder}</span>
          </div>
        </div>

        {/* Screenshot Upload Form */}
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>To'lov cheki (Screenshot) rasmini yuklang *</span>
            </label>

            {error && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Image Upload Area */}
            <label className="border-2 border-dashed border-[#D4AF37]/40 rounded-2xl p-4 bg-[#1A0E2B]/50 hover:bg-[#1A0E2B] transition flex flex-col items-center justify-center cursor-pointer text-center space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {receiptImage ? (
                <div className="space-y-2">
                  <img
                    src={receiptImage}
                    alt="Chek screenshot"
                    className="w-32 h-32 object-cover rounded-xl border border-[#D4AF37] mx-auto shadow-gold-glow"
                  />
                  <span className="text-[10px] text-emerald-400 font-semibold block">✓ Chek rasmi tanlandi</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-200 block">Rasm faylini tanlang</span>
                    <span className="text-[10px] text-gray-400">To'lov cheki screenshotini yuklang</span>
                  </div>
                </>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 gold-btn rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-gold-glow"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Chek yuborilmoqda...' : 'To\'lov Chekini Yuborish'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
