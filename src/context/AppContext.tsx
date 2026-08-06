import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, User, Product, Category, Banner, CartItem, DecantSize, Order } from '../types';
import { translations } from '../locales/translations';
import { getApiUrl } from '../config';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_BANNERS, INITIAL_CATEGORIES } from '../data/initialBanners';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  t: (key: keyof typeof translations['uz']) => string;
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  isFirstLaunch: boolean;
  setIsFirstLaunch: (val: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, size: DecantSize, quantity: number) => void;
  updateCartQuantity: (productId: number, size: DecantSize, delta: number) => void;
  removeFromCart: (productId: number, size: DecantSize) => void;
  clearCart: () => void;
  favorites: number[];
  toggleFavorite: (productId: number) => void;
  selectedProductModal: Product | null;
  setSelectedProductModal: (p: Product | null) => void;
  products: Product[];
  categories: Category[];
  banners: Banner[];
  orders: Order[];
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshBanners: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('velaris_lang') as Language) || 'uz';
  });

  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('velaris_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    localStorage.setItem('velaris_theme', next);
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(() => {
    return !localStorage.getItem('velaris_lang');
  });

  const [user, setUser] = useState<User | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('velaris_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('velaris_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Translation helper
  const t = (key: keyof typeof translations['uz']): string => {
    return translations[language]?.[key] || translations['uz']?.[key] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('velaris_lang', lang);
  };

  // Sync cart & favorites with LocalStorage
  useEffect(() => {
    localStorage.setItem('velaris_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('velaris_favs', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch initial data
  const refreshProducts = async () => {
    try {
      const res = await fetch(getApiUrl('/api/products'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(getApiUrl('/api/categories'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch(getApiUrl('/api/banners'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    }
  };

  const refreshOrders = async () => {
    if (!user) return;
    try {
      const endpoint = user.role === 'admin' ? '/api/admin/orders' : `/api/orders?user_id=${user.id}`;
      const res = await fetch(getApiUrl(endpoint), {
        headers: { 'x-telegram-id': user.telegram_id || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  // Real-time automatic background polling for live order status updates every 3 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  // Authenticate user with Telegram WebApp SDK or fallback
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      await Promise.all([refreshProducts(), fetchCategories(), fetchBanners()]);

      // Telegram WebApp detection
      let tgId = '';
      let tgName = 'Foydalanuvchi';

      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        tgId = String(tgUser.id);
        tgName = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || tgUser.username || 'Telegram User';
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      } else {
        // Standard Web Browser Visitor - retrieve or generate unique guest ID
        let guestId = localStorage.getItem('velaris_guest_id');
        if (!guestId) {
          guestId = 'guest_' + Math.random().toString(36).substring(2, 10);
          localStorage.setItem('velaris_guest_id', guestId);
        }
        tgId = guestId;
      }

      try {
        const res = await fetch(getApiUrl('/api/auth/telegram'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegram_id: tgId,
            name: tgName,
            language: language,
          }),
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);

          // Check if onboarding phone & location are missing
          if (!userData.phone || !userData.location_lat) {
            setIsOnboardingOpen(true);
          }
        }
      } catch (err) {
        console.error('Auth error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  useEffect(() => {
    if (user) {
      refreshOrders();
    }
  }, [user]);

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const res = await fetch(getApiUrl('/api/user/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: user.telegram_id,
          ...data,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  // Cart operations
  const addToCart = (product: Product, size: DecantSize, quantity: number) => {
    const unitPrice =
      size === '10g' ? product.price_10g :
      size === '20g' ? product.price_20g :
      size === '30g' ? product.price_30g :
      size === '50g' ? product.price_50g : product.price_100g;

    setCart((prev) => {
      const index = prev.findIndex((item) => item.productId === product.id && item.size === size);
      if (index > -1) {
        const updated = [...prev];
        const newQty = updated[index].quantity + quantity;
        updated[index] = {
          ...updated[index],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            product,
            size,
            quantity,
            unitPrice,
            totalPrice: quantity * unitPrice,
          },
        ];
      }
    });
  };

  const updateCartQuantity = (productId: number, size: DecantSize, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId && item.size === size) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: number, size: DecantSize) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.size === size)));
  };

  const clearCart = () => setCart([]);

  // Favorites operation
  const toggleFavorite = async (productId: number) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });

    if (user) {
      try {
        await fetch('/api/favorites/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, product_id: productId }),
        });
      } catch (err) {
        console.error('Failed to sync favorite:', err);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme: setThemeState,
        toggleTheme,
        t,
        user,
        setUser,
        updateUserProfile,
        isFirstLaunch,
        setIsFirstLaunch,
        isOnboardingOpen,
        setIsOnboardingOpen,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        favorites,
        toggleFavorite,
        selectedProductModal,
        setSelectedProductModal,
        products,
        categories,
        banners,
        orders,
        refreshProducts,
        refreshOrders,
        refreshBanners: fetchBanners,
        refreshCategories: fetchCategories,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
