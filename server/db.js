import Database from 'better-sqlite3';
import path from 'path';
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

  // Seed Categories if empty
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (catCount === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (slug, name_uz, name_ru, image) VALUES (?, ?, ?, ?)
    `);

    const categories = [
      { slug: 'erkaklar', uz: 'Erkaklar', ru: 'Мужские', img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80' },
      { slug: 'ayollar', uz: 'Ayollar', ru: 'Женские', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80' },
      { slug: 'unisex', uz: 'Unisex', ru: 'Унисекс', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80' },
      { slug: 'arab-atirlari', uz: 'Arab atirlari', ru: 'Aрабские', img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=400&q=80' },
      { slug: 'premium', uz: 'Premium', ru: 'Премиум', img: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=400&q=80' },
      { slug: 'yangi', uz: 'Yangi kolleksiya', ru: 'Новая коллекция', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80' },
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
      INSERT INTO Banners (title_uz, title_ru, subtitle_uz, subtitle_ru, image, link) VALUES (?, ?, ?, ?, ?, ?)
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

    const products = [
      {
        name: 'Aventus',
        brand: 'Creed',
        category_slug: 'bestseller',
        gender: 'men',
        price_10g: 180000,
        price_20g: 340000,
        price_30g: 480000,
        price_50g: 750000,
        price_100g: 1350000,
        rating: 4.95,
        reviews_count: 245,
        desc_uz: 'Creed Aventus - bu kuch, muvaffaqiyat va nafosat timsoli. Zamonaviy erkakning o\'ziga bo\'lgan ishonchini va olijanobligini namoyon etadi.',
        desc_ru: 'Creed Aventus — воплощение силы, успеха и утонченности. Подчеркивает уверенность и благородство современного мужчины.',
        family_uz: 'Meva-Yog\'ochli, Shipr',
        family_ru: 'Фруктово-древесный, Шипровый',
        top_uz: 'Ananas, Bergamot, Qora smorodina, Olma',
        top_ru: 'Ананас, Бергамот, Черная смородина, Яблоко',
        heart_uz: 'Qayin yog\'och, Pachuli, Yasmik, Roza',
        heart_ru: 'Береза, Пачули, Жасмин, Роза',
        base_uz: 'Eman moxi, Musk, Ambergris, Vanil',
        base_ru: 'Дубовый мох, Мускус, Серая амбра, Ваниль',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
        ]),
        is_bestseller: 1,
        is_new: 0,
        is_featured: 1
      },
      {
        name: 'Baccarat Rouge 540 Extrait',
        brand: 'Maison Francis Kurkdjian',
        category_slug: 'premium',
        gender: 'unisex',
        price_10g: 220000,
        price_20g: 410000,
        price_30g: 590000,
        price_50g: 920000,
        price_100g: 1650000,
        rating: 4.98,
        reviews_count: 312,
        desc_uz: 'Baccarat Rouge 540 - bu haqiqiy parfyumeriya shohasari. Zafaron, ambroksan va kedr yog\'ochining sehrli uyg\'unligi.',
        desc_ru: 'Baccarat Rouge 540 — настоящий парфюмерный шедевр. Магическое сочетание шафрана, амброксана и кедра.',
        family_uz: 'Sharqona, Gul-Ambroksan',
        family_ru: 'Восточный, Цветочно-амбровый',
        top_uz: 'Zafaron, Misr Yasmini',
        top_ru: 'Шафран, Египетский жасмин',
        heart_uz: 'Achchiq bodom, Kedr yog\'ochi',
        heart_ru: 'Горький миндаль, Кедр',
        base_uz: 'Ambergris, Yog\'och notalari, Musk',
        base_ru: 'Серая амбра, Древесные ноты, Мускус',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80'
        ]),
        is_bestseller: 1,
        is_new: 1,
        is_featured: 1
      },
      {
        name: 'Lost Cherry',
        brand: 'Tom Ford',
        category_slug: 'ayollar',
        gender: 'women',
        price_10g: 195000,
        price_20g: 370000,
        price_30g: 520000,
        price_50g: 820000,
        price_100g: 1480000,
        rating: 4.91,
        reviews_count: 189,
        desc_uz: 'Tom Ford Lost Cherry - shirin olcha, achchiq bodom va shirin likyorning jozibali va shahvoniy tarkibi.',
        desc_ru: 'Tom Ford Lost Cherry — соблазнительная композиция спелой вишни, горького миндаля и сладкого ликера.',
        family_uz: 'Meva-Sharqona',
        family_ru: 'Фруктово-восточный',
        top_uz: 'Qora olcha, Olcha likyori, Achchiq bodom',
        top_ru: 'Черная вишня, Вишневый ликер, Горький миндаль',
        heart_uz: 'Olcha sharbati, Turkiy roza, Yasmik',
        heart_ru: 'Вишневый сок, Турецкая роза, Жасмин',
        base_uz: 'Peru balzami, Tonka loviyasi, Sandal, Vanil',
        base_ru: 'Перуанский бальзам, Бобы тонка, Сандал, Ваниль',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
        ]),
        is_bestseller: 1,
        is_new: 0,
        is_featured: 1
      },
      {
        name: 'Erba Pura',
        brand: 'Xerjoff',
        category_slug: 'unisex',
        gender: 'unisex',
        price_10g: 170000,
        price_20g: 320000,
        price_30g: 450000,
        price_50g: 710000,
        price_100g: 1280000,
        rating: 4.88,
        reviews_count: 164,
        desc_uz: 'Sitsiliya apelsinlari va sitrus mevalarining yorqin portlashi hamda oq muskning uzoq saqlanuvchi shohona hidi.',
        desc_ru: 'Яркий взрыв сицилийских цитрусов и безупречный шлейф белого мускуса и сицилийского апельсина.',
        family_uz: 'Meva-Sitrus, Musk',
        family_ru: 'Цитрусово-фруктовый, Мускусный',
        top_uz: 'Sitsiliya Apelsini, Bergamot, Sitsiliya Limoni',
        top_ru: 'Сицилийский апельсин, Бергамот, Лимон',
        heart_uz: 'O\'rta dengiz mevalari savati',
        heart_ru: 'Корзина средиземноморских фруктов',
        base_uz: 'Oq musk, Amber, Madagaskar vanili',
        base_ru: 'Белый мускус, Амбра, Мадагаскарская ваниль',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80'
        ]),
        is_bestseller: 0,
        is_new: 1,
        is_featured: 1
      },
      {
        name: 'Oud Royal Velvet',
        brand: 'Velaris Private Blend',
        category_slug: 'arab-atirlari',
        gender: 'unisex',
        price_10g: 210000,
        price_20g: 390000,
        price_30g: 560000,
        price_50g: 880000,
        price_100g: 1590000,
        rating: 4.99,
        reviews_count: 98,
        desc_uz: 'Velaris uyining maxsus sharqona ud to\'plami. Tabiiy Kambodja udi va zafaron aralashmasidan tayyorlangan oliy navli aromat.',
        desc_ru: 'Эксклюзивный восточный уд от дома Velaris. Высший сорт натурального камбоджийского уда и шафрана.',
        family_uz: 'Sharqiy-Ud, Qahramoniy',
        family_ru: 'Восточно-удовый, Роскошный',
        top_uz: 'Kambodja Udi, Eron Zafaroni',
        top_ru: 'Камбоджийский уд, Иранский шафран',
        heart_uz: 'Dovud Roza, Zirmir',
        heart_ru: 'Дамасская роза, Мирра',
        base_uz: 'Qora Ud, Amber, Tutunli yog\'och',
        base_ru: 'Черный уд, Амбра, Дымная древесина',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80'
        ]),
        is_bestseller: 1,
        is_new: 1,
        is_featured: 1
      },
      {
        name: 'Delina Exclusive',
        brand: 'Parfums de Marly',
        category_slug: 'ayollar',
        gender: 'women',
        price_10g: 185000,
        price_20g: 350000,
        price_30g: 490000,
        price_50g: 780000,
        price_100g: 1400000,
        rating: 4.93,
        reviews_count: 176,
        desc_uz: 'Parfums de Marly Delina - nafis va jozibali ayollar uchun atirgul va lichi mevasining tengsiz ifori.',
        desc_ru: 'Parfums de Marly Delina — несравненный аромат розы и личи для элегантных женщин.',
        family_uz: 'Gul-Meva',
        family_ru: 'Цветочно-фруктовый',
        top_uz: 'Lichi, Rhabarber, Bergamot, Muskat yong\'og\'i',
        top_ru: 'Личи, Ревень, Бергамот, Мускатный орех',
        heart_uz: 'Turk rozasi, Piona, Petaliya, Vanil',
        heart_ru: 'Турецкая роза, Пион, Петалия, Ваниль',
        base_uz: 'Kashmir yog\'ochi, Kedr, Incense, Musk',
        base_ru: 'Кашемировое дерево, Кедр, Ладан, Мускус',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
        ]),
        is_bestseller: 1,
        is_new: 0,
        is_featured: 1
      },
      {
        name: 'Sauvage Elixir',
        brand: 'Dior',
        category_slug: 'erkaklar',
        gender: 'men',
        price_10g: 175000,
        price_20g: 330000,
        price_30g: 460000,
        price_50g: 730000,
        price_100g: 1300000,
        rating: 4.92,
        reviews_count: 210,
        desc_uz: 'Dior Sauvage Elixir - konsentatsiyalangan achchiq va yangi yog\'och notalarining nihoyatda o\'tkir va jozibador aralashmasi.',
        desc_ru: 'Dior Sauvage Elixir — невероятно концентрированный и пряный древесный эликсир.',
        family_uz: 'Achchiq-Yog\'ochli, Fuzher',
        family_ru: 'Пряно-древесный, Фужерный',
        top_uz: 'Dolchin, Muskat yong\'og\'i, Kardamon, Greypfrut',
        top_ru: 'Корица, Мускатный орех, Кардамон, Грейпфрут',
        heart_uz: 'Lavanda',
        heart_ru: 'Лаванда',
        base_uz: 'Lishaynik, Sandal, Ambergris, Pachuli',
        base_ru: 'Лакричник, Сандал, Амбра, Пачули',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
        ]),
        is_bestseller: 1,
        is_new: 0,
        is_featured: 0
      },
      {
        name: 'Elysium Pour Homme',
        brand: 'Roja Parfums',
        category_slug: 'premium',
        gender: 'men',
        price_10g: 230000,
        price_20g: 430000,
        price_30g: 620000,
        price_50g: 980000,
        price_100g: 1750000,
        rating: 4.97,
        reviews_count: 142,
        desc_uz: 'Roja Parfums Elysium - elit parfyumeriyaning cho\'qqisi. Yangi sitruslar va asil vetiver yog\'ochining super lyuks versiyasi.',
        desc_ru: 'Roja Parfums Elysium — вершина элитной парфюмерии. Свежие цитрусы и благородный ветивер.',
        family_uz: 'Sitrus-Yog\'ochli, Fuzher',
        family_ru: 'Цитрусово-древесный',
        top_uz: 'Greypfrut, Limon, Bergamot, Lavanda, Taym',
        top_ru: 'Грейпфрут, Лимон, Бергамот, Лаванда, Тимьян',
        heart_uz: 'Olma, Qora smorodina, Yasmik, Roza',
        heart_ru: 'Яблоко, Черная смородина, Жасмин, Роза',
        base_uz: 'Vetiver, Ambergris, Kedr, Kozha, Vanil',
        base_ru: 'Ветивер, Серая амбра, Кедр, Кожа, Ваниль',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
        ]),
        is_bestseller: 0,
        is_new: 1,
        is_featured: 1
      }
    ];

    for (const p of products) {
      insertProd.run(
        p.name, p.brand, p.category_slug, p.gender,
        p.price_10g, p.price_20g, p.price_30g, p.price_50g, p.price_100g,
        p.rating, p.reviews_count,
        p.desc_uz, p.desc_ru,
        p.family_uz, p.family_ru,
        p.top_uz, p.top_ru,
        p.heart_uz, p.heart_ru,
        p.base_uz, p.base_ru,
        p.images, p.is_bestseller, p.is_new, p.is_featured
      );
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
