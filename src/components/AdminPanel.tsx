import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, Category, AdminStats } from '../types';
import { Shield, Package, DollarSign, Users, Plus, Edit, Trash2, CheckCircle, RefreshCw, X, FolderPlus, Layers, LogOut, Clock, TrendingUp, Award, ShoppingBag, Tag } from 'lucide-react';
import { getApiUrl } from '../config';
import { getCleanImageUrl, getProductImages, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils';

// Fast Canvas Image Compressor (Reduces 10MB camera photo to 50KB for instant 50ms upload)
const compressImageFile = (file: File, maxWidth = 800, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const AdminPanel: React.FC = () => {
  const { products, categories, banners, refreshProducts, refreshCategories, refreshBanners, setActiveTab, t } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'stats' | 'products' | 'categories' | 'banners' | 'orders' | 'promos' | 'channel' | 'users'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New / Edit Promo Code state
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null);
  const [promoForm, setPromoForm] = useState({
    code: '',
    discount_percent: 10,
    min_order_amount: 0,
  });

  const fetchUsersList = async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin/users'));
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error('Failed to fetch users list:', err);
    }
  };

  const handleToggleUserRole = async (userId: number, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Foydalanuvchi rolini "${nextRole.toUpperCase()}" darajasiga o'zgartirishni tasdiqlaysizmi?`)) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${userId}/role`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.ok) fetchUsersList();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPromos = async () => {
    try {
      const res = await fetch(getApiUrl('/api/promo-codes'));
      if (res.ok) {
        const data = await res.json();
        setPromos(data);
      }
    } catch (err) {
      console.error('Failed to fetch promo codes:', err);
    }
  };

  const openAddPromoModal = () => {
    setEditingPromoId(null);
    setPromoForm({ code: '', discount_percent: 10, min_order_amount: 0 });
    setIsPromoModalOpen(true);
  };

  const openEditPromoModal = (promo: any) => {
    setEditingPromoId(promo.id);
    setPromoForm({
      code: promo.code,
      discount_percent: promo.discount_percent,
      min_order_amount: promo.min_order_amount,
    });
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.code.trim()) {
      alert('Iltimos, promokod nomini kiriting!');
      return;
    }
    try {
      const url = editingPromoId ? `/api/promo-codes/${editingPromoId}` : '/api/promo-codes';
      const method = editingPromoId ? 'PUT' : 'POST';

      const res = await fetch(getApiUrl(url), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoForm),
      });

      if (res.ok) {
        setIsPromoModalOpen(false);
        setEditingPromoId(null);
        setPromoForm({ code: '', discount_percent: 10, min_order_amount: 0 });
        fetchPromos();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Xatolik yuz berdi!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePromo = async (id: number) => {
    if (!confirm('Promokodni o\'chirishga ishonchingiz komilmi?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/promo-codes/${id}`), { method: 'DELETE' });
      if (res.ok) fetchPromos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePromo = async (id: number) => {
    try {
      const res = await fetch(getApiUrl(`/api/promo-codes/${id}/toggle`), { method: 'PUT' });
      if (res.ok) fetchPromos();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAdminOrders();
    fetchPromos();
    fetchUsersList();
  }, []);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    slug: '',
    name_uz: '',
    name_ru: '',
    image: '',
  });

  // New/Edit banner state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title_uz: '',
    title_ru: '',
    subtitle_uz: '',
    subtitle_ru: '',
    image: '',
    link: '/catalog',
  });

  // New/Edit product state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category_slug: 'bestseller',
    gender: 'unisex',
    price_10g: 150000,
    price_20g: 280000,
    price_30g: 400000,
    price_50g: 650000,
    price_100g: 1200000,
    description_uz: '',
    description_ru: '',
    scent_family_uz: 'Meva-Yog\'ochli',
    scent_family_ru: 'Фруктово-древесный',
    top_notes_uz: 'Bergamot, Limon',
    top_notes_ru: 'Бергамот, Limon',
    heart_notes_uz: 'Yasmik, Roza',
    heart_notes_ru: 'Жасмин, Роза',
    base_notes_uz: 'Musk, Amber',
    base_notes_ru: 'Мускус, Амбра',
    images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'],
    is_bestseller: false,
    is_new: true,
  });

  const fetchStats = async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin/stats'));
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  };

  const fetchAdminOrders = async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin/orders'));
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAdminOrders();
  }, []);

  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title_uz.trim()) {
      alert('Iltimos, banner sarlavhasini kiriting!');
      return;
    }
    if (!bannerForm.image) {
      alert('Iltimos, banner rasmini tanlang yoki rasm havolasini yozing!');
      return;
    }

    setIsSavingBanner(true);
    try {
      const res = await fetch(getApiUrl('/api/banners'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerForm),
      });

      if (res.ok) {
        setIsBannerModalOpen(false);
        setBannerForm({
          title_uz: '',
          title_ru: '',
          subtitle_uz: '',
          subtitle_ru: '',
          image: '',
          link: '/catalog',
        });
        refreshBanners();
        alert('Reklama banneri muvaffaqiyatli qo\'shildi! ✅');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert('Banner saqlashda xatolik: ' + (errData.error || `Server xatosi (${res.status})`));
      }
    } catch (err) {
      console.error('Failed to save banner:', err);
      alert('Tarmoq xatosi: ' + (err as Error).message);
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm('Ushbu reklama bannerini o\'chirishga ishonchingiz komilmi?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/banners/${id}`), { method: 'DELETE' });
      if (res.ok) {
        refreshBanners();
      }
    } catch (err) {
      console.error('Failed to delete banner:', err);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name_uz.trim()) {
      alert('Iltimos, toifa nomini kiriting!');
      return;
    }

    setIsSavingCategory(true);
    try {
      const url = editingCategoryId ? `/api/categories/${editingCategoryId}` : '/api/categories';
      const method = editingCategoryId ? 'PUT' : 'POST';

      const res = await fetch(getApiUrl(url), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });

      if (res.ok) {
        setIsCategoryModalOpen(false);
        setEditingCategoryId(null);
        setCategoryForm({ slug: '', name_uz: '', name_ru: '', image: '' });
        refreshCategories();
        alert(editingCategoryId ? 'Toifa tahrirlandi! ✅' : 'Yangi toifa qo\'shildi! ✅');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert('Toifa saqlashda xatolik: ' + (errData.error || `Server xatosi (${res.status})`));
      }
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Tarmoq xatosi: ' + (err as Error).message);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Ushbu toifani o\'chirishga ishonchingiz komilmi?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/categories/${id}`), { method: 'DELETE' });
      if (res.ok) {
        refreshCategories();
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      slug: cat.slug,
      name_uz: cat.name_uz,
      name_ru: cat.name_ru || '',
      image: cat.image || '',
    });
    setIsCategoryModalOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}/status`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchAdminOrders();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleClearAllOrders = async () => {
    if (!confirm('⚠️ DIQQAT! Barcha buyurtmalar tarixini to\'liq o\'chirib tashlashga ishonchingiz komilmi?')) return;
    try {
      const res = await fetch(getApiUrl('/api/admin/orders'), { method: 'DELETE' });
      if (res.ok) {
        setOrders([]);
        fetchStats();
        alert('Buyurtmalar tarixi muvaffaqiyatli tozalandi! ✅');
      } else {
        alert('Xatolik yuz berdi!');
      }
    } catch (err) {
      console.error('Failed to clear orders:', err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Ushbu atirni o\'chirishga ishonchingiz komilmi?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/products/${id}`), { method: 'DELETE' });
      if (res.ok) {
        refreshProducts();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Iltimos, atir nomini kiriting!');
      return;
    }
    if (!productForm.brand.trim()) {
      alert('Iltimos, atir brendini kiriting!');
      return;
    }

    setIsSavingProduct(true);
    try {
      const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(getApiUrl(url), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });

      if (res.ok) {
        setIsProductModalOpen(false);
        refreshProducts();
        fetchStats();
        alert(editingProductId ? 'Atir muvaffaqiyatli tahrirlandi! ✅' : 'Yangi atir muvaffaqiyatli saqlandi! ✅');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert('Saqlashda xatolik: ' + (errorData.error || `Server xatosi (${res.status})`));
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Tarmoq xatosi: ' + (err as Error).message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      brand: '',
      category_slug: 'bestseller',
      gender: 'unisex',
      price_10g: 150000,
      price_20g: 280000,
      price_30g: 400000,
      price_50g: 650000,
      price_100g: 1200000,
      description_uz: '',
      description_ru: '',
      scent_family_uz: 'Meva-Yog\'ochli',
      scent_family_ru: 'Фруктово-древесный',
      top_notes_uz: 'Bergamot, Limon',
      top_notes_ru: 'Бергамот, Limon',
      heart_notes_uz: 'Yasmik, Roza',
      heart_notes_ru: 'Жасмин, Роза',
      base_notes_uz: 'Musk, Amber',
      base_notes_ru: 'Мускус, Амбра',
      images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'],
      is_bestseller: false,
      is_new: true,
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name,
      brand: p.brand,
      category_slug: p.category_slug,
      gender: p.gender,
      price_10g: p.price_10g,
      price_20g: p.price_20g,
      price_30g: p.price_30g,
      price_50g: p.price_50g,
      price_100g: p.price_100g,
      description_uz: p.description_uz,
      description_ru: p.description_ru,
      scent_family_uz: p.scent_family_uz,
      scent_family_ru: p.scent_family_ru,
      top_notes_uz: p.top_notes_uz,
      top_notes_ru: p.top_notes_ru,
      heart_notes_uz: p.heart_notes_uz,
      heart_notes_ru: p.heart_notes_ru,
      base_notes_uz: p.base_notes_uz,
      base_notes_ru: p.base_notes_ru,
      images: getProductImages(p.images).length > 0 ? getProductImages(p.images) : [FALLBACK_PRODUCT_IMAGE],
      is_bestseller: p.is_bestseller,
      is_new: p.is_new,
    });
    setIsProductModalOpen(true);
  };

  // Analytics calculations
  const uniqueCustomersCount = new Set(orders.map((o) => o.customer_phone || (o as any).phone || o.user_id)).size;
  const unpaidOrders = orders.filter((o) => o.status === 'To\'lov kutilmoqda');
  const processingOrders = orders.filter((o) => o.status === 'Tayyorlanmoqda' || o.status === 'Jo\'natildi');

  // Total Revenue ONLY includes admin-confirmed paid orders
  const confirmedOrders = orders.filter((o) =>
    ['Qabul qilindi', 'Tayyorlanmoqda', 'Jo\'natildi', 'Yetkazildi'].includes(o.status)
  );

  const totalRevenue = confirmedOrders.reduce(
    (sum, o) => sum + (o.total_amount || (o as any).total_price || 0),
    0
  );

  // Calculate Top Selling Perfumes (Only from confirmed orders)
  const perfumeSalesMap: { [key: string]: { name: string; count: number; totalSum: number; image?: string } } = {};

  confirmedOrders.forEach((o) => {
    try {
      const items = Array.isArray(o.items)
        ? o.items
        : typeof o.items === 'string'
        ? JSON.parse(o.items)
        : [];

      items.forEach((item: any) => {
        const key = item.name || 'Parfyum';
        if (!perfumeSalesMap[key]) {
          perfumeSalesMap[key] = {
            name: key,
            count: 0,
            totalSum: 0,
            image: item.image || (item.images && item.images[0]) || '',
          };
        }
        const qty = item.quantity || 1;
        const itemPrice = item.unitPrice || item.item_price || item.price || 0;
        perfumeSalesMap[key].count += qty;
        perfumeSalesMap[key].totalSum += itemPrice * qty;
      });
    } catch {
      // ignore
    }
  });

  const topSellingPerfumesList = Object.values(perfumeSalesMap).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-5 pb-28 pt-2 px-4 max-w-md mx-auto">
      {/* Dedicated Admin Portal Header */}
      <div className="p-4 bg-gradient-to-r from-[#1A0E2B] via-[#150B21] to-[#0A0510] rounded-2xl border border-[#D4AF37]/50 shadow-gold-glow flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-serif font-bold text-gray-100 gold-gradient-text tracking-wider">
              VELARIS ADMIN PORTAL
            </h1>
            <p className="text-[9px] text-gray-400">Boshqaruv va Tahlillar Paneli</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-[10px] text-red-400 font-semibold transition active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Chiqish</span>
        </button>
      </div>

      {/* Admin View Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-[#12081E] p-1.5 rounded-xl border border-white/10 text-[9px] font-semibold">
        <button
          onClick={() => setActiveAdminTab('stats')}
          className={`py-2 rounded-lg transition ${
            activeAdminTab === 'stats' ? 'bg-[#D4AF37] text-black font-bold' : 'text-gray-400'
          }`}
        >
          Statistika
        </button>
        <button
          onClick={() => {
            setActiveAdminTab('users');
            fetchUsersList();
          }}
          className={`py-2 rounded-lg transition ${
            activeAdminTab === 'users' ? 'bg-[#D4AF37] text-black font-bold' : 'text-gray-400'
          }`}
        >
          Userlar ({usersList.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('products')}
          className={`py-2 rounded-lg transition ${
            activeAdminTab === 'products' ? 'bg-[#D4AF37] text-black font-bold' : 'text-gray-400'
          }`}
        >
          Atirlar ({products.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('categories')}
          className={`py-2 rounded-lg transition ${
            activeAdminTab === 'categories' ? 'bg-[#D4AF37] text-black font-bold' : 'text-gray-400'
          }`}
        >
          Toifalar ({categories.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('banners')}
          className={`py-2 rounded-lg transition ${
            activeAdminTab === 'banners' ? 'bg-[#D4AF37] text-black font-bold' : 'text-gray-400'
          }`}
        >
          Banner ({banners.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`py-2 rounded-lg transition ${
            activeAdminTab === 'orders' ? 'bg-[#D4AF37] text-black font-bold' : 'text-gray-400'
          }`}
        >
          Buyurtma ({orders.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('promos')}
          className={`py-2 rounded-lg transition ${
            activeAdminTab === 'promos' ? 'bg-[#D4AF37] text-black font-bold' : 'text-gray-400'
          }`}
        >
          Promo ({promos.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('channel')}
          className={`py-2 rounded-lg transition ${
            activeAdminTab === 'channel' ? 'bg-[#D4AF37] text-black font-bold' : 'text-gray-400'
          }`}
        >
          Kanal 📢
        </button>
      </div>

      {/* 1. STATISTIKA TAB */}
      {activeAdminTab === 'stats' && (
        <div className="space-y-4">
          {/* Main Stat Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Unique Customers Card */}
            <div className="p-3.5 bg-gradient-to-br from-[#1A0E2B] to-[#12081E] rounded-2xl border border-[#D4AF37]/30 space-y-1">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[9px] font-semibold uppercase tracking-wider">Xaridorlar</span>
                <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
              </div>
              <p className="text-lg font-bold text-gray-100">
                {uniqueCustomersCount} <span className="text-xs font-normal text-gray-400">kishi</span>
              </p>
              <span className="text-[9px] text-gray-400 block">Buyurtma qilgan mijozlar</span>
            </div>

            {/* Total Revenue Card */}
            <div className="p-3.5 bg-gradient-to-br from-[#1A0E2B] to-[#12081E] rounded-2xl border border-[#D4AF37]/30 space-y-1">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[9px] font-semibold uppercase tracking-wider">Jami Tushum</span>
                <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" />
              </div>
              <p className="text-sm font-bold text-[#D4AF37] truncate">
                {totalRevenue.toLocaleString('uz-UZ')} <span className="text-[10px] font-normal">so'm</span>
              </p>
              <span className="text-[9px] text-gray-400 block">{orders.length} ta buyurtmadan</span>
            </div>

            {/* Unpaid Pending Orders Card */}
            <div className="p-3.5 bg-gradient-to-br from-[#26123D] to-[#170928] rounded-2xl border border-amber-500/40 space-y-1">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-[9px] font-semibold uppercase tracking-wider">To'lov Kutilmoqda</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-lg font-bold text-amber-300">{unpaidOrders.length} ta</p>
              <span className="text-[9px] text-amber-400/80 block">To'lov cheki kutilayotganlar</span>
            </div>

            {/* Processing Orders Card */}
            <div className="p-3.5 bg-gradient-to-br from-[#121A2B] to-[#0A101E] rounded-2xl border border-blue-500/40 space-y-1">
              <div className="flex items-center justify-between text-blue-400">
                <span className="text-[9px] font-semibold uppercase tracking-wider">Jarayonda</span>
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-lg font-bold text-blue-300">{processingOrders.length} ta</p>
              <span className="text-[9px] text-blue-400/80 block">Tayyorlanmoqda / Jo'natildi</span>
            </div>
          </div>

          {/* Top Selling Perfumes Section */}
          <div className="p-4 bg-[#150B21] rounded-2xl border border-[#D4AF37]/30 space-y-3 shadow-gold-glow">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>Qaysi Parfyumlar Ko'p Sotilmoqda</span>
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">Reyting</span>
            </div>

            {topSellingPerfumesList.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">Hali sotuv ma'lumotlari yo'q</p>
            ) : (
              <div className="space-y-2.5 divide-y divide-white/5">
                {topSellingPerfumesList.map((perfume, idx) => (
                  <div key={idx} className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? 'bg-[#D4AF37] text-black' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-300'
                      }`}>
                        {idx + 1}
                      </span>
                      {perfume.image && (
                        <img src={perfume.image} alt={perfume.name} className="w-8 h-8 object-cover rounded-lg border border-white/10" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-gray-100 block">{perfume.name}</span>
                        <span className="text-[9px] text-gray-400">Jami tushum: {perfume.totalSum.toLocaleString('uz-UZ')} so'm</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-lg border border-[#D4AF37]/20">
                      {perfume.count} ta sotildi
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Unpaid Orders Quick Action Section */}
          {unpaidOrders.length > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>To'lovi Kutilayotgan Buyurtmalar ({unpaidOrders.length})</span>
              </h3>

              <div className="space-y-2">
                {unpaidOrders.map((o) => (
                  <div key={o.id} className="p-3 bg-[#12081E] border border-amber-500/20 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-gray-300">
                      <span className="font-bold text-white">Buyurtma #{o.id} ({o.customer_name || (o as any).user_name || 'Mijoz'})</span>
                      <span className="text-[#D4AF37] font-bold">{(o.total_amount || (o as any).total_price || 0).toLocaleString('uz-UZ')} so'm</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Tel: {o.customer_phone || (o as any).phone || 'Noma\'lum'}</p>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, 'Tayyorlanmoqda')}
                        className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-lg text-[10px] font-bold transition"
                      >
                        ✅ To'lovni Tasdiqlash
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, 'Bekor qilindi')}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-lg text-[10px] font-bold transition"
                      >
                        ❌ Rad etish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. USERLAR TAB */}
      {activeAdminTab === 'users' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              <span>Ro'yxatdan o'tgan foydalanuvchilar ({usersList.length})</span>
            </h3>
            <button
              onClick={fetchUsersList}
              className="text-[10px] text-gray-400 hover:text-[#D4AF37] underline"
            >
              Yangilash 🔄
            </button>
          </div>

          {usersList.length === 0 ? (
            <div className="text-center py-10 bg-[#12081E] rounded-2xl border border-white/10 text-xs text-gray-400">
              Hozircha foydalanuvchilar mavjud emas
            </div>
          ) : (
            <div className="space-y-2.5">
              {usersList.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 bg-[#150B21] border border-white/10 rounded-2xl space-y-2 hover:border-[#D4AF37]/40 transition shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-100">{u.name || 'Nomsiz foydalanuvchi'}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                              : 'bg-white/10 text-gray-400 border border-white/10'
                          }`}
                        >
                          {u.role === 'admin' ? '👑 ADMIN' : '👤 USER'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 font-mono mt-0.5">
                        📞 {u.phone || 'Telefon kiritilmagan'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Telegram ID: <span className="font-mono text-gray-300">{u.telegram_id}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleUserRole(u.id, u.role)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition active:scale-95 ${
                        u.role === 'admin'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                          : 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30 hover:bg-[#D4AF37]/20'
                      }`}
                    >
                      {u.role === 'admin' ? 'User qilish' : 'Admin qilish'}
                    </button>
                  </div>

                  {(u.region || u.district || u.street) && (
                    <div className="pt-1.5 border-t border-white/5 text-[10px] text-gray-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
                      <span className="truncate">
                        {[u.region, u.district, u.mahalla, u.street, u.house].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. PRODUCTS TAB */}
      {activeAdminTab === 'products' && (
        <div className="space-y-3">
          <button
            onClick={openAddModal}
            className="w-full py-3 gold-btn rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addProductBtn')}</span>
          </button>

          <div className="space-y-2">
            {products.map((p) => {
              const images = getProductImages(p.images);
              const mainImg = getCleanImageUrl(images[0]);
              return (
                <div key={p.id} className="p-3 bg-[#150B21] rounded-xl border border-[#D4AF37]/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={mainImg}
                      alt={p.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.dataset.triedFallback) {
                          target.dataset.triedFallback = 'true';
                          target.src = FALLBACK_PRODUCT_IMAGE;
                        }
                      }}
                      className="w-12 h-12 object-cover rounded-lg bg-black"
                    />
                  <div>
                    <span className="text-[9px] text-[#D4AF37] font-semibold block">{p.brand}</span>
                    <h4 className="text-xs font-bold text-gray-100">{p.name}</h4>
                    <span className="text-[10px] text-gray-400">10g: {p.price_10g.toLocaleString('uz-UZ')} so'm</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#D4AF37]"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* 3. CATEGORIES (TOIFALAR / KATALOG) TAB */}
      {activeAdminTab === 'categories' && (
        <div className="space-y-3">
          <button
            onClick={() => {
              setEditingCategoryId(null);
              setCategoryForm({ slug: '', name_uz: '', name_ru: '', image: '' });
              setIsCategoryModalOpen(true);
            }}
            className="w-full py-3 gold-btn rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-gold-glow"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Yangi Toifa / Katalog Bo'limi Qo'shish</span>
          </button>

          <div className="space-y-2.5">
            {categories.map((c) => (
              <div key={c.id} className="p-3 bg-[#150B21] rounded-2xl border border-[#D4AF37]/30 flex items-center justify-between gap-3 shadow-md">
                <img
                  src={c.image}
                  alt={c.name_uz}
                  className="w-12 h-12 object-cover rounded-xl border border-[#D4AF37]/40 bg-black flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-100 truncate">{c.name_uz}</h4>
                  <span className="text-[10px] text-[#D4AF37] font-mono block">slug: {c.slug}</span>
                  {c.name_ru && <span className="text-[9px] text-gray-400 block truncate">{c.name_ru}</span>}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditCategoryModal(c)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#D4AF37]"
                    title="Tahrirlash"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition flex-shrink-0"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. BANNERS (REKLAMA SLIDER) TAB */}
      {activeAdminTab === 'banners' && (
        <div className="space-y-3">
          <button
            onClick={() => setIsBannerModalOpen(true)}
            className="w-full py-3 gold-btn rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-gold-glow"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi Reklama Banneri Qo'shish</span>
          </button>

          <div className="space-y-2.5">
            {banners.map((b) => (
              <div key={b.id} className="p-3 bg-[#150B21] rounded-2xl border border-[#D4AF37]/30 flex items-center justify-between gap-3">
                <img
                  src={b.image}
                  alt={b.title_uz}
                  className="w-20 h-12 object-cover rounded-xl border border-[#D4AF37]/30 bg-black flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-100 truncate">{b.title_uz}</h4>
                  <p className="text-[10px] text-gray-400 truncate">{b.subtitle_uz || 'Subtitr yo\'q'}</p>
                </div>

                <button
                  onClick={() => handleDeleteBanner(b.id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition flex-shrink-0"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ORDERS TAB */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-3">
          {orders.length > 0 && (
            <button
              onClick={handleClearAllOrders}
              className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 mb-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>🗑️ Barcha Buyurtmalar Tarixini Tozalash</span>
            </button>
          )}
          {orders.map((o) => (
            <div key={o.id} className="p-4 bg-[#150B21] rounded-2xl border border-[#D4AF37]/30 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <span className="text-xs font-bold text-[#D4AF37]">Buyurtma #{o.id}</span>
                  <span className="text-[10px] text-gray-400 block">{o.customer_name} ({o.customer_phone})</span>
                </div>
                <span className="text-xs font-bold text-gray-100">{o.total_amount.toLocaleString('uz-UZ')} so'm</span>
              </div>

              <div className="space-y-1">
                {o.items.map((item, idx) => (
                  <div key={idx} className="text-xs text-gray-300 flex justify-between">
                    <span>{item.name} ({item.size}) x {item.quantity}</span>
                    <span>{item.totalPrice.toLocaleString('uz-UZ')} so'm</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons to Change Status */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                {['Qabul qilindi', 'Tayyorlanmoqda', 'Jo\'natildi', 'Yetkazildi', 'Bekor qilindi'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateOrderStatus(o.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                      o.status === st
                        ? 'bg-[#D4AF37] text-black font-bold'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. PROMO CODES TAB */}
      {activeAdminTab === 'promos' && (
        <div className="space-y-3">
          <button
            onClick={openAddPromoModal}
            className="w-full py-3 gold-btn rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-gold-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Promokod Yaratish</span>
          </button>

          {promos.length === 0 ? (
            <div className="text-center py-10 bg-[#150B21] rounded-2xl border border-white/5 space-y-2">
              <Tag className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="text-xs text-gray-400">Hali promokodlar yaratilmagan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {promos.map((p) => (
                <div key={p.id} className="p-3.5 bg-[#150B21] rounded-2xl border border-[#D4AF37]/30 flex items-center justify-between shadow-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#D4AF37] font-mono tracking-wider">{p.code}</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[10px] font-bold text-[#D4AF37]">
                        -{p.discount_percent}% Chegirma
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Minimal buyurtma: {p.min_order_amount > 0 ? `${p.min_order_amount.toLocaleString('uz-UZ')} so'm` : "Cheklovsiz (0 so'm)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditPromoModal(p)}
                      className="p-2 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 border border-[#D4AF37]/30 transition"
                      title="Tahrirlash"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleTogglePromo(p.id)}
                      className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition ${
                        p.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      {p.is_active ? 'Faol' : 'O\'chirilgan'}
                    </button>
                    <button
                      onClick={() => handleDeletePromo(p.id)}
                      className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. TELEGRAM KANAL INTEGRATSIYASI TAB */}
      {activeAdminTab === 'channel' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-[#1E0F30] via-[#150B21] to-[#0A0510] rounded-2xl border border-[#D4AF37]/40 space-y-3 shadow-gold-glow">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-100 gold-gradient-text">
                  Telegram Kanalga Mini App Joylash (Add to Channel)
                </h3>
                <p className="text-[10px] text-gray-400">
                  Bot va Mini App-ni o'zingizning Telegram kanallaringizga ulash va pin qilish
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  const url = 'https://t.me/velaris_parfume_atelier_bot?startchannel=true';
                  if ((window as any).Telegram?.WebApp?.openTelegramLink) {
                    (window as any).Telegram.WebApp.openTelegramLink(url);
                  } else {
                    window.open(url, '_blank');
                  }
                }}
                className="w-full py-3 gold-btn rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-gold-glow active:scale-95 transition"
              >
                <span>➕ Telegram Kanalni Tanlash & Qo'shish</span>
              </button>

              <button
                onClick={() => {
                  const link = 'https://t.me/velaris_parfume_atelier_bot/app';
                  navigator.clipboard.writeText(link);
                  alert(`Mini App havolasi nusxalandi: ${link}\n\nUshbu havolani Telegram kanalingizdagi post pastidagi tugmaga qo'shishingiz mumkin!`);
                }}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-xs font-semibold text-gray-200 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <span>📋 Mini App Direct Linkini Nusxalash</span>
              </button>
            </div>
          </div>

          {/* Guide / Post Template */}
          <div className="p-4 bg-[#150B21] rounded-2xl border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              📌 Kanalda Post Yaratish va Mini App-ni Pin Qilish Yo'riqnomasi
            </h4>
            <ol className="text-[11px] text-gray-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Yuqoridagi <b>"➕ Telegram Kanalni Tanlash & Qo'shish"</b> tugmasini bosing va o'zingiz boshqaradigan kanalni tanlang.</li>
              <li>Kanalingizga parfyumlar haqida post joylang va post havolasiga ushbu Mini App havolasini biriktiring: <code className="text-[#D4AF37] bg-black/40 px-1 py-0.5 rounded">https://t.me/velaris_parfume_atelier_bot/app</code></li>
              <li>Obunachilaringiz postdagi havola yoki tugma orqali bevosita kanaldan chiqmasdan Mini App do'koningizni ochishlari va buyurtma berishlari mumkin!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#12081E] border border-[#D4AF37]/40 rounded-2xl p-5 text-gray-100 max-h-[85vh] overflow-y-auto space-y-4 no-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-[#D4AF37]">
                {editingProductId ? 'Atirni tahrirlash' : 'Yangi atir qo\'shish'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-gray-400">Atir nomi</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400">Brend</label>
                <input
                  type="text"
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  required
                  className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400">Toifa (Category)</label>
                  <select
                    value={productForm.category_slug}
                    onChange={(e) => setProductForm({ ...productForm, category_slug: e.target.value })}
                    className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2 text-xs text-gray-100"
                  >
                    <option value="bestseller">Bestseller (Ommabop)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name_uz} ({cat.slug})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">Gender</label>
                  <select
                    value={productForm.gender}
                    onChange={(e) => setProductForm({ ...productForm, gender: e.target.value as any })}
                    className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2 text-xs"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400">10g narx</label>
                  <input
                    type="number"
                    value={productForm.price_10g}
                    onChange={(e) => setProductForm({ ...productForm, price_10g: Number(e.target.value) })}
                    className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">20g narx</label>
                  <input
                    type="number"
                    value={productForm.price_20g}
                    onChange={(e) => setProductForm({ ...productForm, price_20g: Number(e.target.value) })}
                    className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">30g narx</label>
                  <input
                    type="number"
                    value={productForm.price_30g}
                    onChange={(e) => setProductForm({ ...productForm, price_30g: Number(e.target.value) })}
                    className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400">50g narx</label>
                  <input
                    type="number"
                    value={productForm.price_50g}
                    onChange={(e) => setProductForm({ ...productForm, price_50g: Number(e.target.value) })}
                    className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">100g narx</label>
                  <input
                    type="number"
                    value={productForm.price_100g}
                    onChange={(e) => setProductForm({ ...productForm, price_100g: Number(e.target.value) })}
                    className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400">Tavsif (UZ)</label>
                <textarea
                  value={productForm.description_uz}
                  onChange={(e) => setProductForm({ ...productForm, description_uz: e.target.value })}
                  className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2 text-xs h-16"
                />
              </div>

              {/* Image Upload & URL Input with Live Preview */}
              <div className="space-y-2 p-3 bg-[#1A0E2B] rounded-xl border border-[#D4AF37]/20">
                <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                  Mahsulot Rasmi (Image URL / Fayl tanlash)
                </label>

                {/* Main URL Input */}
                <input
                  type="text"
                  placeholder="https://... rasm havolasini kiriting"
                  value={productForm.images[0] || ''}
                  onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                  className="w-full bg-[#12081E] border border-white/10 rounded-lg p-2 text-xs text-gray-200"
                />

                {/* File picker conversion to base64 */}
                <div className="flex items-center gap-2 pt-1">
                  <label className="px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-lg text-[10px] text-[#D4AF37] font-semibold cursor-pointer hover:bg-[#D4AF37]/30 transition">
                    📁 Fayldan rasm yuklash
                    <input
                      type="file"
                      accept="image/webp, image/png, image/jpeg, image/jpg, image/avif, image/gif, image/*, .webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImageFile(file, 800, 0.75);
                          setProductForm({ ...productForm, images: [compressed] });
                        }
                      }}
                    />
                  </label>
                  <span className="text-[9px] text-gray-400">kompyuter/telefondan tanlash</span>
                </div>

                {/* Live Image Preview */}
                {productForm.images[0] && (
                  <div className="mt-2 text-center">
                    <span className="text-[9px] text-gray-400 block mb-1">Oldindan ko'rish (Preview):</span>
                    <img
                      src={productForm.images[0]}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-xl border-2 border-[#D4AF37] mx-auto shadow-gold-glow"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSavingProduct}
                className="w-full py-3 gold-btn rounded-xl text-xs font-bold shadow-gold-glow disabled:opacity-50"
              >
                {isSavingProduct ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Banner Add Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#12081E] border border-[#D4AF37]/40 rounded-2xl p-5 text-gray-100 space-y-4 shadow-gold-glow">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-[#D4AF37]">Yangi Reklama Banneri Qo'shish</h3>
              <button onClick={() => setIsBannerModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-gray-400">Sarlavha (UZ)</label>
                <input
                  type="text"
                  placeholder="masalan: VELARIS Eksklyuziv Kolleksiyasi"
                  value={bannerForm.title_uz}
                  onChange={(e) => setBannerForm({ ...bannerForm, title_uz: e.target.value })}
                  required
                  className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2.5 text-xs text-gray-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400">Sarlavha (RU)</label>
                <input
                  type="text"
                  placeholder="Заголовок на русском"
                  value={bannerForm.title_ru}
                  onChange={(e) => setBannerForm({ ...bannerForm, title_ru: e.target.value })}
                  className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2.5 text-xs text-gray-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400">Subtitr (Tavsif UZ)</label>
                <input
                  type="text"
                  placeholder="-30% chegirma bilan eksklyuziv parfyumlar"
                  value={bannerForm.subtitle_uz}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle_uz: e.target.value })}
                  className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2.5 text-xs text-gray-100"
                />
              </div>

              {/* Banner Image URL & File Picker */}
              <div className="space-y-2 p-3 bg-[#1A0E2B] rounded-xl border border-[#D4AF37]/20">
                <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                  Banner Rasmi (Image URL / Fayl)
                </label>

                <input
                  type="text"
                  placeholder="https://... rasm havolasi"
                  value={bannerForm.image}
                  onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                  className="w-full bg-[#12081E] border border-white/10 rounded-lg p-2 text-xs text-gray-200"
                />

                <div className="flex items-center gap-2 pt-1">
                  <label className="px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-lg text-[10px] text-[#D4AF37] font-semibold cursor-pointer hover:bg-[#D4AF37]/30 transition">
                    📁 Fayldan rasm yuklash
                    <input
                      type="file"
                      accept="image/webp, image/png, image/jpeg, image/jpg, image/avif, image/gif, image/*, .webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImageFile(file, 1200, 0.8);
                          setBannerForm({ ...bannerForm, image: compressed });
                        }
                      }}
                    />
                  </label>
                  <span className="text-[9px] text-gray-400 font-medium">kompyuter/telefondan yuklash</span>
                </div>

                {bannerForm.image && (
                  <div className="mt-2 text-center">
                    <span className="text-[9px] text-gray-400 block mb-1">Banner Oldindan ko'rish:</span>
                    <img
                      src={bannerForm.image}
                      alt="Banner Preview"
                      className="w-full h-20 object-cover rounded-xl border border-[#D4AF37] mx-auto shadow-gold-glow"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSavingBanner}
                className="w-full py-3 gold-btn rounded-xl text-xs font-bold shadow-gold-glow disabled:opacity-50"
              >
                {isSavingBanner ? 'Saqlanmoqda...' : 'Banner Qo\'shish'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#12081E] border border-[#D4AF37]/40 rounded-2xl p-5 text-gray-100 space-y-4 shadow-gold-glow">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-[#D4AF37]">
                {editingCategoryId ? "Toifani Tahrirlash" : "Yangi Toifa / Katalog Bo'limi Qo'shish"}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-gray-400">Toifa Nomi (UZ) *</label>
                <input
                  type="text"
                  placeholder="masalan: Eksklyuziv Nishe Parfyumlar"
                  value={categoryForm.name_uz}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_uz: e.target.value })}
                  required
                  className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2.5 text-xs text-gray-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400">Toifa Nomi (RU)</label>
                <input
                  type="text"
                  placeholder="Название на русском"
                  value={categoryForm.name_ru}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_ru: e.target.value })}
                  className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2.5 text-xs text-gray-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400">Slug (ID identifier)</label>
                <input
                  type="text"
                  placeholder="masalan: niche-parfume (bo'sh qolsa avtomatik generatsiya bo'ladi)"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full bg-[#1A0E2B] border border-white/10 rounded-lg p-2.5 text-xs text-gray-100 font-mono"
                />
              </div>

              {/* Category Image URL & File Picker */}
              <div className="space-y-2 p-3 bg-[#1A0E2B] rounded-xl border border-[#D4AF37]/20">
                <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                  Toifa Rasmi (Image URL / Fayl)
                </label>

                <input
                  type="text"
                  placeholder="https://... rasm havolasi"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  className="w-full bg-[#12081E] border border-white/10 rounded-lg p-2 text-xs text-gray-200"
                />

                <div className="flex items-center gap-2 pt-1">
                  <label className="px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-lg text-[10px] text-[#D4AF37] font-semibold cursor-pointer hover:bg-[#D4AF37]/30 transition">
                    📁 Fayldan rasm yuklash
                    <input
                      type="file"
                      accept="image/webp, image/png, image/jpeg, image/jpg, image/avif, image/gif, image/*, .webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImageFile(file, 600, 0.75);
                          setCategoryForm({ ...categoryForm, image: compressed });
                        }
                      }}
                    />
                  </label>
                  <span className="text-[9px] text-gray-400 font-medium">kompyuter/telefondan yuklash</span>
                </div>

                {categoryForm.image && (
                  <div className="mt-2 text-center">
                    <span className="text-[9px] text-gray-400 block mb-1">Toifa Oldindan ko'rish:</span>
                    <img
                      src={categoryForm.image}
                      alt="Category Preview"
                      className="w-20 h-20 object-cover rounded-xl border border-[#D4AF37] mx-auto shadow-gold-glow"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSavingCategory}
                className="w-full py-3 gold-btn rounded-xl text-xs font-bold shadow-gold-glow disabled:opacity-50"
              >
                {isSavingCategory ? 'Saqlanmoqda...' : (editingCategoryId ? "Saqlash" : "Toifa Qo'shish")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Promo Code Add / Edit Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#12081E] border border-[#D4AF37]/40 rounded-2xl p-5 text-gray-100 space-y-4 shadow-gold-glow">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                <span>{editingPromoId ? 'Promokodni Tahrirlash' : 'Yangi Promokod Yaratish'}</span>
              </h3>
              <button onClick={() => setIsPromoModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 font-semibold block mb-1">Promokod Nomi (Kodi)</label>
                <input
                  type="text"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  placeholder="Masalan: VELARIS20"
                  required
                  className="w-full bg-[#1A0E2B] border border-[#D4AF37]/30 rounded-xl p-2.5 text-xs text-gray-100 font-mono uppercase tracking-wider focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-semibold block mb-1">Chegirma Foizi (%)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={promoForm.discount_percent}
                  onChange={(e) => setPromoForm({ ...promoForm, discount_percent: Number(e.target.value) })}
                  required
                  className="w-full bg-[#1A0E2B] border border-[#D4AF37]/30 rounded-xl p-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-semibold block mb-1">Minimal Buyurtma Summasi (So'mda, ixtiyoriy)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={promoForm.min_order_amount}
                  onChange={(e) => setPromoForm({ ...promoForm, min_order_amount: Number(e.target.value) })}
                  placeholder="0 = cheklov yo'q"
                  className="w-full bg-[#1A0E2B] border border-[#D4AF37]/30 rounded-xl p-2.5 text-xs text-gray-100 focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[9px] text-gray-400 mt-0.5 block">0 yozilsa, barcha summadagi buyurtmalarga o'tadi.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 gold-btn rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 mt-4 shadow-gold-glow"
              >
                {editingPromoId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingPromoId ? 'O\'zgarishlarni Saqlash' : 'Promokodni Saqlash'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
