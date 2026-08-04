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
      <div className="fixed inset-0 bg-[#0A0510] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl border-2 border-[#D4AF37] p-1 animate-spin shadow-gold-glow">
          <img src="/velaris-logo.jpg" alt="Logo" className="w-full h-full rounded-xl object-cover" />
        </div>
        <span className="text-xs text-[#D4AF37] tracking-widest font-serif uppercase animate-pulse">
          VELARIS PARFUME ATELIER
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0510] text-gray-100 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Maintenance Notice Banner */}
      <div className="bg-gradient-to-r from-[#D4AF37] via-[#FFF5D1] to-[#D4AF37] text-black font-semibold text-xs py-2.5 px-4 text-center shadow-lg flex items-center justify-center space-x-2 border-b border-[#D4AF37]/30 z-50 sticky top-0">
        <span className="animate-pulse text-base">🛠️</span>
        <span className="tracking-wider uppercase font-extrabold text-sm">TEXNIK ISHLAR OLIB BORILMOQDA</span>
        <span className="opacity-80 text-[11px] hidden sm:inline">(Tizim yangilanmoqda)</span>
      </div>

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
