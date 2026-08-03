import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ultra-High Definition, Crystal-Clear Luxury Perfume Photography Pool
const hdImagesByBrand = {
  creed: [
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=90',
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=90'
  ],
  'louis vuitton': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=90',
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=90'
  ],
  roja: [
    'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1000&q=90'
  ],
  'tom ford': [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=90',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=90'
  ],
  dior: [
    'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1000&q=90'
  ],
  chanel: [
    'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=1000&q=90'
  ],
  boadicea: [
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=90'
  ],
  kilian: [
    'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=1000&q=90'
  ],
  xerjoff: [
    'https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&w=1000&q=90'
  ],
  armani: [
    'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&w=1000&q=90'
  ],
  versace: [
    'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1000&q=90'
  ],
  'clive christian': [
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=90'
  ]
};

const hdGeneralPool = [
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=90'
];

const seedPath = path.join(__dirname, 'server', 'products_seed.json');
const productsSeed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const updatedSeed = productsSeed.map((p, idx) => {
  const brandLower = p.brand.toLowerCase();
  let selectedImg = null;

  for (const [key, imgs] of Object.entries(hdImagesByBrand)) {
    if (brandLower.includes(key)) {
      selectedImg = imgs[idx % imgs.length];
      break;
    }
  }

  if (!selectedImg) {
    selectedImg = hdGeneralPool[idx % hdGeneralPool.length];
  }

  return {
    ...p,
    images_json: JSON.stringify([selectedImg])
  };
});

fs.writeFileSync(seedPath, JSON.stringify(updatedSeed, null, 2));

// Update initialProducts.ts
const tsProducts = updatedSeed.map((p, index) => ({
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

// Update SQLite database
const dbPath = path.join(__dirname, 'server', 'velaris.db');
const db = new Database(dbPath);

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

  for (const p of updatedSeed) {
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

console.log('Successfully applied Ultra-HD crystal clear images to all 212 perfumes!');
