export type Language = 'uz' | 'ru';
export type DecantSize = '10g' | '20g' | '30g' | '50g' | '100g';
export type Gender = 'men' | 'women' | 'unisex' | 'all';
export type OrderStatus = 'To\'lov kutilmoqda' | 'Qabul qilindi' | 'Tayyorlanmoqda' | 'Jo\'natildi' | 'Yetkazildi' | 'Bekor qilindi';
export type DeliveryType = 'courier' | 'pickup';

declare global {
  interface Window {
    Telegram?: any;
  }
}


export interface Category {
  id: number;
  slug: string;
  name_uz: string;
  name_ru: string;
  image: string;
}

export interface Banner {
  id: number;
  title_uz: string;
  title_ru: string;
  subtitle_uz?: string;
  subtitle_ru?: string;
  image: string;
  link?: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category_slug: string;
  gender: Gender;
  price_10g: number;
  price_20g: number;
  price_30g: number;
  price_50g: number;
  price_100g: number;
  rating: number;
  reviews_count: number;
  description_uz: string;
  description_ru: string;
  scent_family_uz: string;
  scent_family_ru: string;
  top_notes_uz: string;
  top_notes_ru: string;
  heart_notes_uz: string;
  heart_notes_ru: string;
  base_notes_uz: string;
  base_notes_ru: string;
  images: string[];
  is_bestseller: boolean;
  is_new: boolean;
  is_featured: boolean;
  stock?: number;
}

export interface User {
  id: number;
  telegram_id: string;
  name: string;
  phone: string;
  language: Language;
  region?: string;
  district?: string;
  mahalla?: string;
  street?: string;
  house?: string;
  location_lat?: number;
  location_lng?: number;
  role: 'user' | 'admin';
}

export interface CartItem {
  productId: number;
  product: Product;
  size: DecantSize;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderAddress {
  region: string;
  district: string;
  mahalla: string;
  street: string;
  house: string;
}

export interface Order {
  id: number;
  user_id: number;
  customer_name: string;
  customer_phone: string;
  items: {
    productId: number;
    name: string;
    size: DecantSize;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: string;
  }[];
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  delivery_type: DeliveryType;
  address: OrderAddress;
  location_lat?: number;
  location_lng?: number;
  status: OrderStatus;
  payment_receipt_image?: string;
  notes?: string;
  created_at: string;
}

export interface AdminStats {
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  topProducts: {
    id: number;
    name: string;
    brand: string;
    price_10g: number;
    rating: number;
    order_count: number;
  }[];
}
