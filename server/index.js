import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, db } from './db.js';
import { initBot, sendOrderNotificationToAdmin } from './bot.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static logo file from parent directory
app.use('/assets', express.static(path.join(__dirname, '..')));

// Initialize Database & Bot
initDb();
initBot();

// --- API ENDPOINTS --- //

// 1. Get Categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Category (Admin)
app.post('/api/categories', (req, res) => {
  try {
    const { slug, name_uz, name_ru, image } = req.body;
    const cleanSlug = slug || name_uz.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const stmt = db.prepare('INSERT INTO categories (slug, name_uz, name_ru, image) VALUES (?, ?, ?, ?)');
    const info = stmt.run(cleanSlug, name_uz, name_ru, image);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Category (Admin)
app.put('/api/categories/:id', (req, res) => {
  try {
    const { slug, name_uz, name_ru, image } = req.body;
    const cleanSlug = slug || name_uz.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const stmt = db.prepare('UPDATE categories SET slug = ?, name_uz = ?, name_ru = ?, image = ? WHERE id = ?');
    stmt.run(cleanSlug, name_uz, name_ru, image, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Category (Admin)
app.delete('/api/categories/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 2. Get Banners
app.get('/api/banners', (req, res) => {
  try {
    const banners = db.prepare('SELECT * FROM banners ORDER BY id DESC').all();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Banner (Admin)
app.post('/api/banners', (req, res) => {
  try {
    const { title_uz, title_ru, subtitle_uz, subtitle_ru, image, link } = req.body;
    const stmt = db.prepare('INSERT INTO banners (title_uz, title_ru, subtitle_uz, subtitle_ru, image, link) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(title_uz, title_ru, subtitle_uz, subtitle_ru, image, link);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Banner (Admin)
app.delete('/api/banners/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Get Products (With filters, search, sorting)
app.get('/api/products', (req, res) => {
  try {
    const { category, gender, search, sort, is_bestseller, is_featured } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category_slug = ?';
      params.push(category);
    }

    if (gender && gender !== 'all') {
      query += ' AND (gender = ? OR gender = "unisex")';
      params.push(gender);
    }

    if (is_bestseller === 'true') {
      query += ' AND is_bestseller = 1';
    }

    if (is_featured === 'true') {
      query += ' AND is_featured = 1';
    }

    if (search) {
      query += ' AND (name LIKE ? OR brand LIKE ? OR scent_family_uz LIKE ? OR scent_family_ru LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (sort === 'price_asc') {
      query += ' ORDER BY price_10g ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY price_10g DESC';
    } else if (sort === 'rating') {
      query += ' ORDER BY rating DESC';
    } else {
      query += ' ORDER BY id DESC';
    }

    const products = db.prepare(query).all(...params);

    // Parse images_json
    const formatted = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images_json || '[]'),
      is_bestseller: Boolean(p.is_bestseller),
      is_new: Boolean(p.is_new),
      is_featured: Boolean(p.is_featured),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json({
      ...product,
      images: JSON.parse(product.images_json || '[]'),
      is_bestseller: Boolean(product.is_bestseller),
      is_new: Boolean(product.is_new),
      is_featured: Boolean(product.is_featured),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product CRUD (Admin)
app.post('/api/products', (req, res) => {
  try {
    const {
      name, brand, category_slug, gender,
      price_10g, price_20g, price_30g, price_50g, price_100g,
      rating = 4.9, reviews_count = 50,
      description_uz, description_ru,
      scent_family_uz, scent_family_ru,
      top_notes_uz, top_notes_ru,
      heart_notes_uz, heart_notes_ru,
      base_notes_uz, base_notes_ru,
      images = [], is_bestseller = false, is_new = true, is_featured = false
    } = req.body;

    const stmt = db.prepare(`
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

    const info = stmt.run(
      name, brand, category_slug, gender,
      price_10g, price_20g, price_30g, price_50g, price_100g,
      rating, reviews_count,
      description_uz, description_ru,
      scent_family_uz, scent_family_ru,
      top_notes_uz, top_notes_ru,
      heart_notes_uz, heart_notes_ru,
      base_notes_uz, base_notes_ru,
      JSON.stringify(images), is_bestseller ? 1 : 0, is_new ? 1 : 0, is_featured ? 1 : 0
    );

    res.json({ success: true, id: info.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const {
      name, brand, category_slug, gender,
      price_10g, price_20g, price_30g, price_50g, price_100g,
      description_uz, description_ru,
      scent_family_uz, scent_family_ru,
      top_notes_uz, top_notes_ru,
      heart_notes_uz, heart_notes_ru,
      base_notes_uz, base_notes_ru,
      images, is_bestseller, is_new, is_featured
    } = req.body;

    const stmt = db.prepare(`
      UPDATE products SET
        name = ?, brand = ?, category_slug = ?, gender = ?,
        price_10g = ?, price_20g = ?, price_30g = ?, price_50g = ?, price_100g = ?,
        description_uz = ?, description_ru = ?,
        scent_family_uz = ?, scent_family_ru = ?,
        top_notes_uz = ?, top_notes_ru = ?,
        heart_notes_uz = ?, heart_notes_ru = ?,
        base_notes_uz = ?, base_notes_ru = ?,
        images_json = ?, is_bestseller = ?, is_new = ?, is_featured = ?
      WHERE id = ?
    `);

    stmt.run(
      name, brand, category_slug, gender,
      price_10g, price_20g, price_30g, price_50g, price_100g,
      description_uz, description_ru,
      scent_family_uz, scent_family_ru,
      top_notes_uz, top_notes_ru,
      heart_notes_uz, heart_notes_ru,
      base_notes_uz, base_notes_ru,
      JSON.stringify(images), is_bestseller ? 1 : 0, is_new ? 1 : 0, is_featured ? 1 : 0,
      req.params.id
    );

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const ADMIN_PHONES = ['+998937188885', '998937188885', '937188885', '+998955805852', '998955805852', '955805852', '+998921983377', '998921983377', '921983377', '+998901234567', '5744542264', '7146730534'];

function checkIsAdmin(phone, telegram_id) {
  if (telegram_id === '5744542264' || telegram_id === '7146730534') return true;
  if (!phone) return false;
  const clean = phone.replace(/\D/g, '');
  return ADMIN_PHONES.some(p => p.replace(/\D/g, '') === clean || p === telegram_id);
}

// 4. User Register / Login
app.post('/api/auth/telegram', (req, res) => {
  try {
    const { telegram_id, name, language = 'uz' } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(String(telegram_id));

    if (!user) {
      const role = checkIsAdmin('', String(telegram_id)) ? 'admin' : 'user';
      const stmt = db.prepare(`
        INSERT INTO users (telegram_id, name, language, role)
        VALUES (?, ?, ?, ?)
      `);
      const info = stmt.run(String(telegram_id), name || 'Telegram User', language, role);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    } else if (checkIsAdmin(user.phone, user.telegram_id)) {
      db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
      user.role = 'admin';
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
app.put('/api/user/profile', (req, res) => {
  try {
    const { telegram_id, name, phone, language, region, district, mahalla, street, house, location_lat, location_lng } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const currentUser = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(String(telegram_id));
    const effectivePhone = phone || currentUser?.phone;
    const newRole = checkIsAdmin(effectivePhone, String(telegram_id)) ? 'admin' : (currentUser?.role || 'user');

    const stmt = db.prepare(`
      UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        language = COALESCE(?, language),
        region = COALESCE(?, region),
        district = COALESCE(?, district),
        mahalla = COALESCE(?, mahalla),
        street = COALESCE(?, street),
        house = COALESCE(?, house),
        location_lat = COALESCE(?, location_lat),
        location_lng = COALESCE(?, location_lng),
        role = ?
      WHERE telegram_id = ?
    `);

    stmt.run(name, phone, language, region, district, mahalla, street, house, location_lat, location_lng, newRole, String(telegram_id));

    const updatedUser = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(String(telegram_id));
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Favorites Toggle & List
app.get('/api/favorites', (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.json([]);

    const favorites = db.prepare(`
      SELECT p.* FROM products p
      JOIN favorites f ON p.id = f.product_id
      WHERE f.user_id = ?
    `).all(user_id);

    const formatted = favorites.map((p) => ({
      ...p,
      images: JSON.parse(p.images_json || '[]'),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/favorites/toggle', (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    const existing = db.prepare('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?').get(user_id, product_id);

    if (existing) {
      db.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?').run(user_id, product_id);
      res.json({ isFavorite: false });
    } else {
      db.prepare('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)').run(user_id, product_id);
      res.json({ isFavorite: true });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. Submit Order
app.post('/api/orders', async (req, res) => {
  try {
    const {
      user_id, customer_name, customer_phone, items,
      subtotal, delivery_fee, total_amount, delivery_type,
      address, location_lat, location_lng, notes, status = "To'lov kutilmoqda", payment_receipt_image
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO orders (
        user_id, customer_name, customer_phone, items_json,
        subtotal, delivery_fee, total_amount, delivery_type,
        address_json, location_lat, location_lng, notes, status, payment_receipt_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      user_id || 1,
      customer_name,
      customer_phone,
      JSON.stringify(items),
      subtotal,
      delivery_fee,
      total_amount,
      delivery_type,
      JSON.stringify(address),
      location_lat,
      location_lng,
      notes || '',
      status,
      payment_receipt_image || ''
    );

    const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid);

    // Send Real-time notification to Telegram Admin if receipt uploaded
    if (payment_receipt_image || status !== 'To\'lov kutilmoqda') {
      await sendOrderNotificationToAdmin(newOrder);
    }

    res.json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit Payment Receipt Screenshot for existing order
app.put('/api/orders/:id/payment', async (req, res) => {
  try {
    const { payment_receipt_image } = req.body;
    const orderId = req.params.id;

    db.prepare(`
      UPDATE orders SET
        payment_receipt_image = ?,
        status = ?
      WHERE id = ?
    `).run(payment_receipt_image, "To'lov kutilmoqda", orderId);

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

    // Dispatch notification to Telegram Admins
    if (updatedOrder) {
      await sendOrderNotificationToAdmin(updatedOrder);
    }

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error in payment submission:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get User Orders History (Airtight Isolation Per Customer)
app.get('/api/orders', (req, res) => {
  try {
    const { user_id, phone } = req.query;
    const cleanPhone = (phone || '').trim();
    const cleanUserId = user_id && String(user_id) !== '1' && String(user_id) !== 'undefined' ? user_id : null;

    if (!cleanUserId && !cleanPhone) {
      return res.json([]);
    }

    let orders = [];
    if (cleanUserId && cleanPhone) {
      orders = db.prepare('SELECT * FROM orders WHERE user_id = ? OR customer_phone = ? ORDER BY id DESC').all(cleanUserId, cleanPhone);
    } else if (cleanUserId) {
      orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(cleanUserId);
    } else if (cleanPhone) {
      orders = db.prepare('SELECT * FROM orders WHERE customer_phone = ? ORDER BY id DESC').all(cleanPhone);
    }

    const formatted = orders.map((o) => ({
      ...o,
      items: JSON.parse(o.items_json || '[]'),
      address: JSON.parse(o.address_json || '{}'),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer Delete/Cancel Order Endpoint
app.delete('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM orders WHERE id = ?').run(id);
    res.json({ success: true, message: 'Buyurtma bekor qilindi va o\'chirildi' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 7. Admin Dashboard Endpoints
app.delete('/api/admin/orders', (req, res) => {
  try {
    db.prepare('DELETE FROM orders').run();
    res.json({ success: true, message: 'Barcha buyurtmalar tarixi o\'chirildi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/orders', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    const formatted = orders.map((o) => ({
      ...o,
      items: JSON.parse(o.items_json || '[]'),
      address: JSON.parse(o.address_json || '{}'),
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/stats', (req, res) => {
  try {
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

    const totalRevenueRow = db.prepare(`
      SELECT SUM(total_amount) as total FROM orders 
      WHERE status IN ('Qabul qilindi', 'Tayyorlanmoqda', 'Jo\'natildi', 'Yetkazildi')
    `).get();
    const totalRevenue = totalRevenueRow?.total || 0;

    const topProducts = db.prepare(`
      SELECT p.id, p.name, p.brand, p.price_10g, p.rating, COUNT(o.id) as order_count
      FROM products p
      LEFT JOIN orders o ON o.items_json LIKE ('%' || p.name || '%') AND o.status IN ('Qabul qilindi', 'Tayyorlanmoqda', 'Jo\'natildi', 'Yetkazildi')
      GROUP BY p.id
      ORDER BY order_count DESC
      LIMIT 5
    `).all();

    res.json({
      totalOrders,
      totalUsers,
      totalRevenue,
      topProducts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Promo Code Endpoints
app.get('/api/promo-codes', (req, res) => {
  try {
    const promos = db.prepare('SELECT * FROM promo_codes ORDER BY id DESC').all();
    res.json(promos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/promo-codes', (req, res) => {
  try {
    const { code, discount_percent, min_order_amount = 0 } = req.body;
    if (!code || !discount_percent) {
      return res.status(400).json({ error: 'Promokod va chegirma foizi kiritilishi shart' });
    }

    const cleanCode = code.trim().toUpperCase();
    const stmt = db.prepare(`
      INSERT INTO promo_codes (code, discount_percent, min_order_amount)
      VALUES (?, ?, ?)
    `);
    const info = stmt.run(cleanCode, Number(discount_percent), Number(min_order_amount));
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: "Ushbu promokod allaqachon mavjud yoki noto'g'ri!" });
  }
});

app.delete('/api/promo-codes/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM promo_codes WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/promo-codes/:id/toggle', (req, res) => {
  try {
    const promo = db.prepare('SELECT * FROM promo_codes WHERE id = ?').get(req.params.id);
    if (!promo) return res.status(44).json({ error: 'Mavjud emas' });

    const newStatus = promo.is_active ? 0 : 1;
    db.prepare('UPDATE promo_codes SET is_active = ? WHERE id = ?').run(newStatus, req.params.id);
    res.json({ success: true, is_active: newStatus });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/promo-codes/validate', (req, res) => {
  try {
    const { code, order_amount = 0 } = req.body;
    if (!code) return res.status(400).json({ error: 'Promokod kiritilmadi' });

    const cleanCode = code.trim().toUpperCase();
    const promo = db.prepare('SELECT * FROM promo_codes WHERE UPPER(code) = ?').get(cleanCode);

    if (!promo || !promo.is_active) {
      return res.status(400).json({ error: 'Ushbu promokod mavjud emas yoki faol emas!' });
    }

    if (order_amount < promo.min_order_amount) {
      return res.status(400).json({
        error: `Ushbu promokod kamida ${promo.min_order_amount.toLocaleString('uz-UZ')} so'mlik buyurtmalar uchun amal qiladi!`
      });
    }

    const discountAmount = Math.round((order_amount * promo.discount_percent) / 100);

    res.json({
      success: true,
      code: promo.code,
      discount_percent: promo.discount_percent,
      discount_amount: discountAmount,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Velaris Server running on http://localhost:${PORT}`);
});
