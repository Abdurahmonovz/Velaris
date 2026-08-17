import React from 'react';
import { useApp } from '../context/AppContext';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, MapPin, CreditCard, Trash2 } from 'lucide-react';
import { OrderStatus, Order } from '../types';
import { getApiUrl } from '../config';

interface OrdersScreenProps {
  onOpenPayment?: (order: Order) => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ onOpenPayment }) => {
  const { orders, refreshOrders, t } = useApp();

  const handleDeleteOrder = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Ushbu buyurtmani (#${orderId}) bekor qilishni va o'chirishni istaysizmi?`)) return;

    try {
      const res = await fetch(getApiUrl(`/api/orders/${orderId}`), { method: 'DELETE' });
      if (res.ok) {
        try {
          const saved = localStorage.getItem('velaris_pending_order');
          if (saved && JSON.parse(saved).id === orderId) {
            localStorage.removeItem('velaris_pending_order');
          }
        } catch {
          // ignore
        }
        refreshOrders();
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const getStatusStep = (status: OrderStatus): number => {
    switch (status) {
      case 'To\'lov kutilmoqda': return 1;
      case 'Qabul qilindi': return 1;
      case 'Tayyorlanmoqda': return 2;
      case 'Jo\'natildi': return 3;
      case 'Yetkazildi': return 4;
      case 'Bekor qilindi': return -1;
      default: return 1;
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-2 px-4 max-w-md mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-serif font-bold text-gray-100 gold-gradient-text">
          {t('ordersTitle')}
        </h1>
        <button
          onClick={() => refreshOrders()}
          className="text-xs text-[#D4AF37] hover:underline"
        >
          Yangilash
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-[#13131A] rounded-2xl border border-white/5 space-y-3">
          <Package className="w-10 h-10 text-gray-500 mx-auto" />
          <p className="text-xs text-gray-400">{t('noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const step = getStatusStep(order.status as OrderStatus);
            const isCancelled = step === -1;
            const isUnpaid = order.status === "To'lov kutilmoqda";

            return (
              <div
                key={order.id}
                onClick={() => isUnpaid && onOpenPayment?.(order)}
                className={`p-4 bg-gradient-to-br from-[#14141B] to-[#0E0E14] rounded-2xl border space-y-3 shadow-lg transition ${
                  isUnpaid
                    ? 'border-[#D4AF37] shadow-gold-glow cursor-pointer hover:scale-[1.01]'
                    : 'border-[#D4AF37]/25'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 block">{t('orderId')}</span>
                      <span className="text-sm font-bold text-[#D4AF37]">#{order.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">{order.created_at?.slice(0, 10)}</span>
                      <span className="text-xs font-semibold text-gray-200">
                        {order.total_amount.toLocaleString('uz-UZ')} {t('som')}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteOrder(order.id, e)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition active:scale-95 shrink-0"
                      title="Buyurtmani bekor qilish / o'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Unpaid Warning Banner & Action Button */}
                {isUnpaid && (
                  <div className="space-y-2 pt-1">
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span>To'lov kutilmoqda</span>
                      </div>
                      <span className="text-[10px] text-gray-400">Chek yuklanmagan</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPayment?.(order);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-[#0A0510] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-gold-glow active:scale-95 transition"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>💳 Hozir To'lov Qilish (Chek Yuklash)</span>
                    </button>
                  </div>
                )}

                {/* Progress Status Bar */}
                {!isCancelled && !isUnpaid && (
                  <div className="py-2 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className={step >= 1 ? 'text-[#D4AF37] flex items-center gap-0.5' : 'text-gray-500'}>
                        Qabul qilindi
                      </span>
                      <span className={step >= 2 ? 'text-[#D4AF37] font-bold animate-pulse' : 'text-gray-500'}>
                        {step === 2 ? "⚙️ Tayyorlanmoqda" : "Tayyorlanmoqda"}
                      </span>
                      <span className={step >= 3 ? 'text-[#D4AF37] font-bold animate-pulse' : 'text-gray-500'}>
                        {step === 3 ? "🚚 Jo'natildi" : "Jo'natildi"}
                      </span>
                      <span className={step >= 4 ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                        {step === 4 ? "✅ Yetkazildi" : "Yetkazildi"}
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="relative w-full h-2.5 bg-[#0E0E14] rounded-full overflow-hidden border border-[#D4AF37]/30">
                      <div
                        className="h-full bg-gradient-to-r from-[#F5E4A0] via-[#D4AF37] to-[#A37F1D] transition-all duration-700 ease-out shadow-gold-glow"
                        style={{
                          width: `${step === 1 ? '25%' : step === 2 ? '50%' : step === 3 ? '75%' : '100%'}`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {isCancelled && (
                  <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Buyurtma bekor qilindi</span>
                  </div>
                )}

                {/* Items Summary */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-gray-400 font-medium uppercase">Mahsulotlar:</span>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-gray-300 bg-[#13131A] px-2.5 py-1.5 rounded-lg border border-white/5">
                        <span className="truncate max-w-[200px]">
                          {item.name} ({item.size})
                        </span>
                        <span className="font-semibold text-[#D4AF37]">
                          {item.quantity} dona x {item.unitPrice.toLocaleString('uz-UZ')} {t('som')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address info */}
                <div className="text-[10px] text-gray-400 flex items-center gap-1 pt-1">
                  <MapPin className="w-3 h-3 text-[#D4AF37]" />
                  <span className="truncate">
                    {order.address.region}, {order.address.district}, {order.address.street}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
