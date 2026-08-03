import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'velaris.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDb() {
  // Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name_uz TEXT NOT NULL,
      name_ru TEXT NOT NULL,
      image TEXT NOT NULL
    );
  `);

  // Banners
  db.exec(`
    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_uz TEXT NOT NULL,
      title_ru TEXT NOT NULL,
      subtitle_uz TEXT,
      subtitle_ru TEXT,
      image TEXT NOT NULL,
      link TEXT
    );
  `);

  // Products (Perfumes)
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      gender TEXT NOT NULL, -- 'men', 'women', 'unisex'
      price_10g INTEGER NOT NULL,
      price_20g INTEGER NOT NULL,
      price_30g INTEGER NOT NULL,
      price_50g INTEGER NOT NULL,
      price_100g INTEGER NOT NULL,
      rating REAL DEFAULT 4.9,
      reviews_count INTEGER DEFAULT 128,
      description_uz TEXT NOT NULL,
      description_ru TEXT NOT NULL,
      scent_family_uz TEXT NOT NULL,
      scent_family_ru TEXT NOT NULL,
      top_notes_uz TEXT NOT NULL,
      top_notes_ru TEXT NOT NULL,
      heart_notes_uz TEXT NOT NULL,
      heart_notes_ru TEXT NOT NULL,
      base_notes_uz TEXT NOT NULL,
      base_notes_ru TEXT NOT NULL,
      images_json TEXT NOT NULL, -- JSON array of URLs
      is_bestseller INTEGER DEFAULT 0,
      is_new INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      stock INTEGER DEFAULT 100
    );
  `);

  // Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE,
      name TEXT,
      phone TEXT,
      language TEXT DEFAULT 'uz',
      region TEXT,
      district TEXT,
      mahalla TEXT,
      street TEXT,
      house TEXT,
      location_lat REAL,
      location_lng REAL,
      role TEXT DEFAULT 'user', -- 'user', 'admin'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Favorites
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );
  `);

  // Orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      items_json TEXT NOT NULL, -- Array of { productId, name, size, quantity, unitPrice, totalPrice, image }
      subtotal INTEGER NOT NULL,
      delivery_fee INTEGER NOT NULL,
      total_amount INTEGER NOT NULL,
      delivery_type TEXT NOT NULL, -- 'courier', 'pickup'
      address_json TEXT NOT NULL, -- { region, district, mahalla, street, house }
      location_lat REAL,
      status TEXT DEFAULT 'To''lov kutilmoqda',
      payment_receipt_image TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safely add column if upgrading existing DB
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN payment_receipt_image TEXT;`);
  } catch (e) {
    // Column already exists
  }

  // Promo Codes
  db.exec(`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_percent INTEGER NOT NULL,
      min_order_amount INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default promo codes if empty
  const promoCount = db.prepare('SELECT COUNT(*) as count FROM promo_codes').get().count;
  if (promoCount === 0) {
    const insertPromo = db.prepare(`
      INSERT INTO promo_codes (code, discount_percent, min_order_amount, is_active)
      VALUES (?, ?, ?, 1)
    `);
    insertPromo.run('VELARIS10', 10, 0);
    insertPromo.run('LUXURY15', 15, 300000);
  }

  // Seed Categories if empty
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (catCount === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (slug, name_uz, name_ru, image) VALUES (?, ?, ?, ?)
    `);

    const categories = [
      { slug: 'erkaklar', uz: 'Erkaklar', ru: 'Мужские', img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80' },
      { slug: 'ayollar', uz: 'Ayollar', ru: 'Женские', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80' },
      { slug: 'unisex', uz: 'Unisex', ru: 'Унисекс', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80' },
      { slug: 'arab-atirlari', uz: 'Arab atirlari', ru: 'Aрабские', img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=400&q=80' },
      { slug: 'premium', uz: 'Premium', ru: 'Премиум', img: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=400&q=80' },
      { slug: 'yangi', uz: 'Yangi kolleksiya', ru: 'Новая коллекция', img: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=400&q=80' },
      { slug: 'bestseller', uz: 'Bestseller', ru: 'Бестселлеры', img: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80' },
    ];

    for (const c of categories) {
      insertCat.run(c.slug, c.uz, c.ru, c.img);
    }
  }

  // Seed Banners if empty
  const bannerCount = db.prepare('SELECT COUNT(*) as count FROM banners').get().count;
  if (bannerCount === 0) {
    const insertBanner = db.prepare(`
      INSERT INTO banners (title_uz, title_ru, subtitle_uz, subtitle_ru, image, link) VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertBanner.run(
      'VELARIS Eksklyuziv Kolleksiyasi',
      'Эксклюзивная Коллекция VELARIS',
      'Fransiyaning eng sara va noyob aromatlari -30% chegirma bilan',
      'Самые редкие ароматы Франции со скидкой -30%',
      'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1200&q=80',
      '/catalog?category=premium'
    );

    insertBanner.run(
      'Baccarat Rouge 540 Special Edition',
      'Baccarat Rouge 540 Special Edition',
      'Sizning individualligingizni alohida ajratib turuvchi shohona aromat',
      'Королевский аромат, подчеркивающий вашу индивидуальность',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80',
      '/product/2'
    );

    insertBanner.run(
      'Arabian Luxury Oud & Amber',
      'Arabian Luxury Oud & Amber',
      'Sharqning eng boy va jozibador ud aromatlari kolleksiyasi',
      'Самая богатая коллекция уд и амбра востока',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=80',
      '/catalog?category=arab-atirlari'
    );
  }

  // Seed Products if empty
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (prodCount === 0) {
    const seedPath = path.join(__dirname, 'products_seed.json');
    if (fs.existsSync(seedPath)) {
      const productsData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
      const insertProd = db.prepare(`
        INSERT INTO products (
          name, brand, category_slug, gender,
          price_10g, price_20g, price_30g, price_50g, price_100g,
          rating, reviews_count,
          description_uz, description_ru,
          scent_family_uz, scent_family_ru,
          top_notes_uz, top_notes_ru,
          heart_notes_uz, heart_notes_ru,
          base_notes_uz, base_notes_ru,
          images_json, is_bestseller, is_new, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const p of productsData) {
        insertProd.run(
          p.name, p.brand, p.category_slug, p.gender,
          p.price_10g, p.price_20g, p.price_30g, p.price_50g, p.price_100g,
          p.rating, p.reviews_count,
          p.description_uz, p.description_ru,
          p.scent_family_uz, p.scent_family_ru,
          p.top_notes_uz, p.top_notes_ru,
          p.heart_notes_uz, p.heart_notes_ru,
          p.base_notes_uz, p.base_notes_ru,
          p.images_json, p.is_bestseller, p.is_new, p.is_featured
        );
      }
    }
  }

  // Create default admin users if not existing
  const adminPhones = ['+998937188885', '+998955805852', '+998921983377', '+998901234567'];
  for (const phone of adminPhones) {
    const check = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!check) {
      db.prepare(`
        INSERT INTO users (telegram_id, name, phone, language, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(`admin_${phone.replace(/\D/g, '')}`, `Admin (${phone})`, phone, 'uz', 'admin');
    } else {
      db.prepare("UPDATE users SET role = 'admin' WHERE phone = ?").run(phone);
    }
  }

  // Ensure telegram_ids 5744542264 and 7146730534 are admin
  db.prepare("UPDATE users SET role = 'admin' WHERE telegram_id IN ('5744542264', '7146730534')").run();

  console.log('Database initialized successfully with luxury products and admin seeds!');
}

export { db };
