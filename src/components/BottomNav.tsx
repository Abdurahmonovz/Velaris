import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Grid, ShoppingBag, Package, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cart, orders, t } = useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'Yetkazildi' && o.status !== 'Bekor qilindi').length;

  const navItems = [
    { id: 'home', label: t('navHome'), icon: Home },
    { id: 'catalog', label: t('navCatalog'), icon: Grid },
    { id: 'cart', label: t('navCart'), icon: ShoppingBag, badge: totalCartCount },
    { id: 'orders', label: t('navOrders'), icon: Package, badge: activeOrdersCount },
    { id: 'profile', label: t('navProfile'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0510]/95 backdrop-blur-xl border-t border-[#D4AF37]/20 px-2 py-2 max-w-md mx-auto shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#D4AF37] font-semibold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {/* Active ambient bar */}
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#997A15] rounded-full shadow-gold-glow" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />

                {/* Badge for Cart or Active Orders */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-[#0A0510] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#0A0510] animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
