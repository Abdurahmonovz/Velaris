import { Banner, Category } from '../types';

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 1,
    title_uz: 'VELARIS Eksklyuziv Kolleksiyasi',
    title_ru: 'Эксклюзивная Коллекция VELARIS',
    subtitle_uz: 'Fransiyaning eng sara va noyob aromatlari -30% chegirma bilan',
    subtitle_ru: 'Самые редкие ароматы Франции со скидкой -30%',
    image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1200&q=80',
    link: '/catalog?category=premium'
  },
  {
    id: 2,
    title_uz: 'Baccarat Rouge 540 Special Edition',
    title_ru: 'Baccarat Rouge 540 Special Edition',
    subtitle_uz: 'Sizning individualligingizni alohida ajratib turuvchi shohona aromat',
    subtitle_ru: 'Королевский аромат, подчеркивающий вашу индивидуальность',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80',
    link: '/product/2'
  },
  {
    id: 3,
    title_uz: 'Arabian Luxury Oud & Amber',
    title_ru: 'Arabian Luxury Oud & Amber',
    subtitle_uz: 'Sharqning eng boy va jozibador ud aromatlari kolleksiyasi',
    subtitle_ru: 'Самая богатая коллекция уд и амбра востока',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=80',
    link: '/catalog?category=arab-atirlari'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    "id": 1,
    "slug": "erkaklar",
    "name_uz": "Erkaklar",
    "name_ru": "Мужские",
    "image": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80"
  },
  {
    "id": 2,
    "slug": "ayollar",
    "name_uz": "Ayollar",
    "name_ru": "Женские",
    "image": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80"
  },
  {
    "id": 3,
    "slug": "unisex",
    "name_uz": "Unisex",
    "name_ru": "Унисекс",
    "image": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80"
  },
  {
    "id": 4,
    "slug": "arab-atirlari",
    "name_uz": "Arab atirlari",
    "name_ru": "Aрабские",
    "image": "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=400&q=80"
  },
  {
    "id": 5,
    "slug": "premium",
    "name_uz": "Premium",
    "name_ru": "Премиум",
    "image": "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=400&q=80"
  },
  {
    "id": 6,
    "slug": "yangi",
    "name_uz": "Yangi kolleksiya",
    "name_ru": "Новая коллекция",
    "image": "https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=400&q=80"
  },
  {
    "id": 7,
    "slug": "bestseller",
    "name_uz": "Bestseller",
    "name_ru": "Бестселлеры",
    "image": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80"
  }
];
