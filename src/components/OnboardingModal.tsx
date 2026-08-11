import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, MapPin, CheckCircle, ShieldCheck, Sparkles, Navigation } from 'lucide-react';
import { formatPhoneNumber } from '../utils/phoneUtils';

export const OnboardingModal: React.FC = () => {
  const { user, updateUserProfile, isOnboardingOpen, setIsOnboardingOpen, t } = useApp();

  const [phone, setPhone] = useState(user?.phone ? formatPhoneNumber(user.phone) : '+998 ');
  const [region, setRegion] = useState(user?.region || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [locationLat, setLocationLat] = useState<number | undefined>(user?.location_lat || 41.2995);
  const [locationLng, setLocationLng] = useState<number | undefined>(user?.location_lng || 69.2401);
  const [errorMsg, setErrorMsg] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  if (!isOnboardingOpen) return null;

  const handleShareContact = () => {
    const tg = (window as any).Telegram?.WebApp;

    // Check Telegram WebApp initDataUnsafe user phone
    const tgUser = tg?.initDataUnsafe?.user;
    if (tgUser?.phone_number) {
      const num = tgUser.phone_number;
      setPhone(formatPhoneNumber(num));
      setErrorMsg('');
      return;
    }

    if (tg && typeof tg.requestContact === 'function') {
      try {
        tg.requestContact((sent: boolean, response: any) => {
          if (sent && (response?.responseUnsafe?.contact?.phone_number || response?.contact?.phone_number)) {
            const num = response?.responseUnsafe?.contact?.phone_number || response?.contact?.phone_number;
            setPhone(formatPhoneNumber(num));
            setErrorMsg('');
          } else {
            // If contact sharing was denied or unavailable, set +998 prefix & focus
            if (!phone || phone === '') {
              setPhone('+998 ');
            }
            const el = document.getElementById('onboarding-phone-input');
            if (el) el.focus();
          }
        });
        return;
      } catch (err) {
        console.warn('Telegram requestContact failed:', err);
      }
    }

    // Fallback if not inside Telegram or requestContact fails
    if (!phone || phone === '') {
      setPhone('+998 ');
    }
    const el = document.getElementById('onboarding-phone-input');
    if (el) el.focus();
  };

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationLat(pos.coords.latitude);
          setLocationLng(pos.coords.longitude);
          setIsGettingLocation(false);
        },
        (err) => {
          console.warn('Geolocation denied, fallback to Tashkent center:', err);
          setLocationLat(41.2995);
          setLocationLng(69.2401);
          setIsGettingLocation(false);
        }
      );
    } else {
      setLocationLat(41.2995);
      setLocationLng(69.2401);
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 9) {
      setErrorMsg(t('requiredFieldsWarning'));
      return;
    }

    await updateUserProfile({
      phone,
      region,
      district,
      location_lat: locationLat || 41.2995,
      location_lng: locationLng || 69.2401,
    });

    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#150B21] border border-[#D4AF37]/40 rounded-2xl p-6 shadow-gold-glow-lg text-gray-100 space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#D4AF37]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-100 gold-gradient-text">
            {t('onboardingTitle')}
          </h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            {t('onboardingSubtitle')}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>{t('phoneLabel')} *</span>
            </label>
            <div className="flex gap-2">
              <input
                id="onboarding-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                onFocus={() => {
                  if (!phone || phone === '') setPhone('+998 ');
                }}
                className="flex-1 bg-[#1E0F30] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-[#D4AF37]"
                required
              />
              <button
                type="button"
                onClick={handleShareContact}
                className="px-3 py-2 bg-[#28153D] hover:bg-[#341C4F] border border-[#D4AF37]/30 rounded-xl text-xs text-[#D4AF37] font-medium transition active:scale-95 whitespace-nowrap"
              >
                📱 TG Contact
              </button>
            </div>
          </div>

          {/* Region & District Quick Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400">{t('region')}</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-[#1E0F30] border border-[#D4AF37]/30 rounded-xl px-3 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400">{t('district')}</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#1E0F30] border border-[#D4AF37]/30 rounded-xl px-3 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Location Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('locationLabel')} *</span>
            </label>
            <div className="p-3 bg-[#1E0F30] border border-[#D4AF37]/30 rounded-xl flex items-center justify-between">
              <div className="text-xs text-gray-300">
                {locationLat && locationLng ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{locationLat.toFixed(4)}, {locationLng.toFixed(4)}</span>
                  </span>
                ) : (
                  <span className="text-gray-400">Lokatsiya tanlanmagan</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="px-3 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-lg text-xs text-[#D4AF37] font-medium flex items-center gap-1.5 transition active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isGettingLocation ? 'Aniqlanmoqda...' : 'GPS'}</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 gold-btn rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('continueBtn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
