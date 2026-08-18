import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DeliveryType, Order } from '../types';
import { X, MapPin, Phone, User as UserIcon, Truck, Store, CheckCircle2, Sparkles, Tag } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getApiUrl } from '../config';
import { formatPhoneNumber } from '../utils/phoneUtils';

// Fix leaflet marker icon path issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

// Location Marker Component for Leaflet Map
const LocationMarker: React.FC<{
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}> = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return <Marker position={position} />;
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, cart, clearCart, updateUserProfile, t } = useApp();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone ? formatPhoneNumber(user.phone) : '+998 ');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('courier');

  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [mahalla, setMahalla] = useState('');
  const [street, setStreet] = useState(user?.street || '');
  const [house, setHouse] = useState(user?.house || '');

  const [mapPos, setMapPos] = useState<[number, number]>([
    user?.location_lat || 41.2995,
    user?.location_lng || 69.2401,
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Promocode state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount_percent: number; discount_amount: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const isFreeDeliveryQualified = subtotal >= 500000;
  const isFreeDelivery = isFreeDeliveryQualified || appliedPromo !== null;
  const deliveryFee = deliveryType === 'courier' ? (isFreeDelivery ? 0 : 25000) : 0;
  const discountAmount = appliedPromo ? appliedPromo.discount_amount : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount) + deliveryFee;

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoError('');
    setIsValidatingPromo(true);

    try {
      const res = await fetch(getApiUrl('/api/promo-codes/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCodeInput,
          order_amount: subtotal,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAppliedPromo(data);
        setPromoError('');
      } else {
        const err = await res.json();
        setPromoError(err.error || 'Promokod xato!');
        setAppliedPromo(null);
      }
    } catch {
      setPromoError('Tarmoq xatoligi!');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setError(t('requiredFieldsWarning'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    const address = {
      region,
      district,
      mahalla,
      street,
      house,
    };

    const items = cart.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      image: item.product.images?.[0] || '',
    }));

    try {
      // Save updated user address profile
      await updateUserProfile({
        name: customerName,
        phone: customerPhone,
        region,
        district,
        mahalla,
        street,
        house,
        location_lat: mapPos[0],
        location_lng: mapPos[1],
      });

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 1,
          customer_name: customerName,
          customer_phone: customerPhone,
          items,
          subtotal,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          delivery_type: deliveryType,
          address,
          location_lat: mapPos[0],
          location_lng: mapPos[1],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('velaris_pending_order', JSON.stringify(data.order));
        clearCart();
        onSuccess(data.order);
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#111116] border border-[#D4AF37]/40 rounded-t-3xl sm:rounded-3xl shadow-sm text-gray-100 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#14141B]">
          <h2 className="text-lg font-serif font-bold text-gray-100 gold-gradient-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('checkoutTitle')}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="overflow-y-auto flex-1 p-5 space-y-5 no-scrollbar pb-24">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          {/* Delivery Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              {t('deliveryType')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('courier')}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all text-left ${
                  deliveryType === 'courier'
                    ? 'border-[#D4AF37] bg-gradient-to-r from-[#20202B] to-[#14141B] shadow-sm'
                    : 'border-white/10 bg-[#14141B]'
                }`}
              >
                <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-100">{t('courierDelivery')}</span>
                  {isFreeDeliveryQualified ? (
                    <span className="block text-[10px] text-emerald-400 font-bold">
                      0 so'm (500k+ Bepul)
                    </span>
                  ) : appliedPromo ? (
                    <span className="block text-[10px] text-emerald-400 font-semibold">
                      0 so'm (Promokod: Bepul)
                    </span>
                  ) : (
                    <span className="block text-[10px] text-[#D4AF37]">25,000 so'm</span>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all text-left ${
                  deliveryType === 'pickup'
                    ? 'border-[#D4AF37] bg-gradient-to-r from-[#20202B] to-[#14141B] shadow-sm'
                    : 'border-white/10 bg-[#14141B]'
                }`}
              >
                <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-100">{t('pickupDelivery')}</span>
                  <span className="block text-[10px] text-emerald-400 font-semibold">{t('freeDelivery')}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Customer Personal Details */}
          <div className="space-y-3 bg-[#14141B]/80 p-4 rounded-2xl border border-[#D4AF37]/15">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              Shaxsiy ma'lumotlar
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400 flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-[#D4AF37]" />
                <span>Ismingiz</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full bg-[#161620] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#D4AF37]" />
                <span>Telefon raqami</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(formatPhoneNumber(e.target.value))}
                onFocus={() => {
                  if (!customerPhone || customerPhone === '') setCustomerPhone('+998 ');
                }}
                required
                className="w-full bg-[#161620] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Delivery Address Fields */}
          {deliveryType === 'courier' && (
            <div className="space-y-3 bg-[#14141B]/80 p-4 rounded-2xl border border-[#D4AF37]/15">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{t('addressInfo')}</span>
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-gray-400">{t('region')}</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-[#161620] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">{t('district')}</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#161620] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400">{t('mahalla')}</label>
                  <input
                    type="text"
                    value={mahalla}
                    onChange={(e) => setMahalla(e.target.value)}
                    className="w-full bg-[#161620] border border-[#D4AF37]/30 rounded-xl px-2.5 py-2 text-xs text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">{t('street')}</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-[#161620] border border-[#D4AF37]/30 rounded-xl px-2.5 py-2 text-xs text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">{t('house')}</label>
                  <input
                    type="text"
                    value={house}
                    onChange={(e) => setHouse(e.target.value)}
                    className="w-full bg-[#161620] border border-[#D4AF37]/30 rounded-xl px-2.5 py-2 text-xs text-gray-100"
                  />
                </div>
              </div>

              {/* Interactive Map Pin Selection */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-300">{t('pinMapTitle')}</span>
                  <span className="text-[9px] text-[#D4AF37]">
                    {mapPos[0].toFixed(4)}, {mapPos[1].toFixed(4)}
                  </span>
                </div>

                <div className="h-44 w-full rounded-2xl overflow-hidden border border-[#D4AF37]/30 z-10 relative">
                  <MapContainer
                    center={mapPos}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={mapPos} setPosition={setMapPos} />
                  </MapContainer>
                </div>
              </div>
            </div>
          )}

          {/* Promo Code Input Field */}
          <div className="p-3.5 bg-[#14141B] rounded-2xl border border-[#D4AF37]/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#D4AF37]">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Promokod bormi?</span>
              </span>
              {appliedPromo && (
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ✅ -{appliedPromo.discount_percent}% Chegirma + 🚚 Bepul yetkazib berish
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={promoCodeInput}
                onChange={(e) => {
                  setPromoCodeInput(e.target.value.toUpperCase());
                  setPromoError('');
                }}
                placeholder="Masalan: VELARIS10"
                className="flex-1 bg-[#161620] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-gray-100 placeholder-gray-500 font-mono tracking-wider focus:outline-none uppercase"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={isValidatingPromo || !promoCodeInput.trim()}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B8952B] disabled:opacity-50 text-black font-bold text-xs rounded-xl transition"
              >
                {isValidatingPromo ? '...' : 'Qo\'llash'}
              </button>
            </div>

            {promoError && (
              <p className="text-[10px] text-red-400 font-semibold">{promoError}</p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="p-4 bg-[#14141B] rounded-2xl border border-[#D4AF37]/20 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>{t('subtotal')}</span>
              <span>{subtotal.toLocaleString('uz-UZ')} {t('som')}</span>
            </div>
            {appliedPromo && (
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>Promokod chegirmasi (-{appliedPromo.discount_percent}%)</span>
                <span>-{appliedPromo.discount_amount.toLocaleString('uz-UZ')} {t('som')}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>{t('deliveryFee')}</span>
              <span className={deliveryType === 'pickup' || isFreeDelivery ? 'text-emerald-400 font-semibold' : ''}>
                {deliveryType === 'pickup'
                  ? t('freeDelivery')
                  : isFreeDeliveryQualified
                  ? "0 so'm (500k+ Aksiya: Bepul)"
                  : appliedPromo
                  ? "0 so'm (Promokod: Bepul)"
                  : `${deliveryFee.toLocaleString('uz-UZ')} ${t('som')}`}
              </span>
            </div>
            <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between font-bold text-sm">
              <span className="text-gray-100">{t('totalPrice')}</span>
              <span className="text-[#D4AF37] text-base">{totalAmount.toLocaleString('uz-UZ')} {t('som')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 gold-btn rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSubmitting ? 'Buyurtma berilmoqda...' : t('confirmOrderBtn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
