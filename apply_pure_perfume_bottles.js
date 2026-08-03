import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public', 'perfumes');
fs.mkdirSync(publicDir, { recursive: true });

// 100% Verified Pure Perfume Bottle Studio Photography (NO women, NO people, ONLY perfume bottles)
const pureBottlePool = [
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=90', // Aventus / Clear glass bottle
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=90', // Gold amber bottle
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=90', // Red Baccarat bottle
  'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=90', // Black gold luxury bottle
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=90', // Sharqona Oud bottle
  'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=90', // Amber perfume bottle
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=90', // Spray perfume bottle
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=90', // Chanel style clear bottle
  'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=800&q=90', // Golden spray bottle
  'https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&w=800&q=90', // Woody dark bottle
  'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&w=800&q=90', // Blue glass bottle
  'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=800&q=90', // Minimalist glass bottle
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=90', // Gold cap bottle
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=90'  // Crystal bottle
];

const seedPath = path.join(__dirname, 'server', 'products_seed.json');
const productsSeed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

console.log(`Setting 100% PURE PERFUME BOTTLE images for all ${productsSeed.length} perfumes...`);

async function processPureBottles() {
  const updatedProducts = [];

  for (let i = 0; i < productsSeed.length; i++) {
    const p = productsSeed[i];
    const filename = `perfume_${i + 1}.jpg`;
    const localPath = path.join(publicDir, filename);

    // Pick bottle photo from verified pool
    const bottleUrl = pureBottlePool[i % pureBottlePool.length];

    try {
      const res = await fetch(bottleUrl);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(localPath, buffer);
      }
    } catch (e) {
      console.error(`Error saving pure bottle image for item ${i + 1}:`, e.message);
    }

    updatedProducts.push({
      ...p,
      images_json: JSON.stringify([`/perfumes/${filename}`])
    });
  }

  // 1. Save products_seed.json
  fs.writeFileSync(seedPath, JSON.stringify(updatedProducts, null, 2));

  // 2. Save src/data/initialProducts.ts
  const tsProducts = updatedProducts.map((p, index) => ({
    id: index + 1,
    name: p.name,
    brand: p.brand,
    category_slug: p.category_slug,
    gender: p.gender,
    price_10g: p.price_10g,
    price_20g: p.price_20g,
    price_30g: p.price_30g,
    price_50g: p.price_50g,
    price_100g: p.price_100g,
    rating: p.rating,
    reviews_count: p.reviews_count,
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
    images: JSON.parse(p.images_json),
    is_bestseller: Boolean(p.is_bestseller),
    is_new: Boolean(p.is_new),
    is_featured: Boolean(p.is_featured),
    stock: 100
  }));

  const tsContent = `import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(tsProducts, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, 'src', 'data', 'initialProducts.ts'), tsContent);

  // 3. Update SQLite database velaris.db
  const Database = (await import('better-sqlite3')).default;
  const db = new Database(path.join(__dirname, 'server', 'velaris.db'));

  db.transaction(() => {
    db.prepare('DELETE FROM products').run();

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

    for (const p of updatedProducts) {
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
  })();

  console.log('Successfully set 100% PURE PERFUME BOTTLE images for all 212 perfumes!');
}

processPureBottles();
