import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { CatalogScreen } from './components/CatalogScreen';
import { CartScreen } from './components/CartScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminPanel } from './components/AdminPanel';
import { PaymentModal } from './components/PaymentModal';
import { PendingOrderAlertModal } from './components/PendingOrderAlertModal';
import { Order } from './types';

const MainLayout: React.FC = () => {
  const { isFirstLaunch, activeTab, isLoading, orders, user } = useApp();
  const [pendingOrderAlert, setPendingOrderAlert] = useState<Order | null>(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState<Order | null>(null);

  // Auto-detect pending un-paid order with 1-second delay for current customer only
  useEffect(() => {
    // Never show top alert banner to admins
    if (user?.role === 'admin') {
      setPendingOrderAlert(null);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const savedPending = localStorage.getItem('velaris_pending_order');
        if (savedPending) {
          const orderData = JSON.parse(savedPending) as Order;
          const realTimeOrder = orders.find((o) => o.id === orderData.id);
          
          if (realTimeOrder) {
            if (realTimeOrder.status !== 'To\'lov kutilmoqda') {
              localStorage.removeItem('velaris_pending_order');
              setPendingOrderAlert(null);
            } else {
              setPendingOrderAlert(realTimeOrder);
            }
          } else {
            setPendingOrderAlert(orderData);
          }
        } else if (user) {
          const pending = orders.find(
            (o) => o.status === 'To\'lov kutilmoqda' && (o.user_id === user.id || o.customer_phone === user.phone)
          );
          if (pending) {
            setPendingOrderAlert(pending);
          } else {
            setPendingOrderAlert(null);
          }
        } else {
          setPendingOrderAlert(null);
        }
      } catch {
        // ignore
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [orders, activeTab, user]);

  if (isFirstLaunch) {
    return <WelcomeScreen />;
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0A0510] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden z-50">
        {/* Ambient background glows */}
        <div className="absolute w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20 animate-pulse" />
        <div className="absolute w-96 h-96 bg-[#7832C8]/15 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20 animate-pulse" />

        {/* Central Luxury Insignia / Spinner */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer rotating dashed ring */}
          <div className="absolute w-32 h-32 rounded-full border-2 border-dashed border-[#D4AF37]/30 animate-spin-slow pointer-events-none" />
          
          {/* Middle counter-rotating ring with gold dots */}
          <div className="absolute w-28 h-28 rounded-full border border-[#D4AF37]/40 animate-spin-reverse-slow pointer-events-none flex items-center justify-between p-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-gold-glow" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-gold-glow" />
          </div>

          {/* Pulsing aura ring */}
          <div className="absolute w-24 h-24 rounded-full bg-[#D4AF37]/15 animate-pulse-ring pointer-events-none" />

          {/* Logo container with breathing glow */}
          <div className="relative w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-[#FFF0B8] via-[#D4AF37] to-[#AA771C] shadow-gold-glow animate-breathe-glow flex items-center justify-center z-10">
            <div className="w-full h-full rounded-[14px] bg-[#0A0510] overflow-hidden p-0.5 border border-[#D4AF37]/40 flex items-center justify-center">
              <img
                src="/velaris-logo.jpg"
                alt="Velaris"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=200&q=80';
                }}
              />
            </div>
          </div>
        </div>

        {/* Brand Name & Luxury Slogan */}
        <div className="space-y-1.5 z-10">
          <div className="flex items-center justify-center gap-1.5 text-[#D4AF37]">
            <span className="text-[10px] tracking-[0.3em] font-semibold uppercase">
              ✦ HAUTE PARFUMERIE ✦
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-100 gold-gradient-text tracking-widest leading-none">
            VELARIS
          </h1>

          <p className="text-[9px] sm:text-[10px] text-[#D4AF37]/90 tracking-[0.25em] uppercase font-light">
            PARFUME ATELIER
          </p>
        </div>

        {/* Shimmering Gold Progress Line */}
        <div className="w-48 h-1 bg-[#1E0F30] rounded-full overflow-hidden relative my-6 border border-[#D4AF37]/20 z-10">
          <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-gold-shimmer rounded-full" />
        </div>

        {/* Dynamic Loading Subtitle */}
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
          <span className="text-[11px] text-gray-300">
            Profil va kolleksiya yuklanmoqda...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0510] text-gray-100 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Top Sticky Header */}
      <Header />

      {/* Main Tab Screen Content */}
      <main className="animate-in fade-in duration-200">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'catalog' && <CatalogScreen />}
        {activeTab === 'cart' && <CartScreen onOpenPayment={(order) => setActivePaymentOrder(order)} />}
        {activeTab === 'orders' && <OrdersScreen onOpenPayment={(order) => setActivePaymentOrder(order)} />}
        {activeTab === 'profile' && <ProfileScreen />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Persistent Bottom Floating Navigation */}
      <BottomNav />

      {/* Product Inspector Detail Modal */}
      <ProductDetailModal />

      {/* Mandatory Gating Onboarding Modal (Phone & Location) */}
      <OnboardingModal />

      {/* Pending Unpaid Order Alert Modal (Suppressed while Payment Modal is active) */}
      {!activePaymentOrder && (
        <PendingOrderAlertModal
          pendingOrder={pendingOrderAlert}
          onOpenPayment={(order) => {
            setPendingOrderAlert(null);
            setActivePaymentOrder(order);
          }}
          onDismiss={() => setPendingOrderAlert(null)}
        />
      )}

      {/* Payment Modal for Pending Order */}
      {activePaymentOrder && (
        <PaymentModal
          isOpen={!!activePaymentOrder}
          orderId={activePaymentOrder.id}
          totalAmount={activePaymentOrder.total_amount}
          onClose={() => setActivePaymentOrder(null)}
          onSuccess={() => setActivePaymentOrder(null)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
