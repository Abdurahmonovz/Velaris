import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public', 'perfumes');
fs.mkdirSync(publicDir, { recursive: true });

// Premium HD Perfume Bottle photos pool (strictly bottle photos only)
const lvBottlePool = [
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=90',
  'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=90',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=90',
  'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=90',
  'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&w=800&q=90',
  'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=800&q=90',
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=90',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=90',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=90',
  'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=800&q=90'
];

const seedPath = path.join(__dirname, 'server', 'products_seed.json');
const productsSeed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

console.log('Fixing Louis Vuitton and all model/girl images with pure HD bottle photos...');

async function fixLVImages() {
  for (let i = 0; i < productsSeed.length; i++) {
    const p = productsSeed[i];
    const isLV = p.brand.toLowerCase().includes('loui') || p.name.toLowerCase().includes('vuitton');

    if (isLV) {
      const filename = `perfume_${i + 1}.jpg`;
      const localPath = path.join(publicDir, filename);

      // Pick clean bottle photo
      const bottleImgUrl = lvBottlePool[i % lvBottlePool.length];

      try {
        const res = await fetch(bottleImgUrl);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(localPath, buffer);
          console.log(`Replaced image for ${p.brand} ${p.name} -> perfume_${i + 1}.jpg with clean bottle photo!`);
        }
      } catch (err) {
        console.error(`Failed to replace image for ${p.name}:`, err.message);
      }
    }
  }

  // Update src/data/initialProducts.ts
  const tsProducts = productsSeed.map((p, index) => ({
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
    images: [`/perfumes/perfume_${index + 1}.jpg`],
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

    for (const p of tsProducts) {
      insertProd.run(
        p.name, p.brand, p.category_slug, p.gender,
        p.price_10g, p.price_20g, p.price_30g, p.price_50g, p.price_100g,
        p.rating, p.reviews_count,
        p.description_uz, p.description_ru,
        p.scent_family_uz, p.scent_family_ru,
        p.top_notes_uz, p.top_notes_ru,
        p.heart_notes_uz, p.heart_notes_ru,
        p.base_notes_uz, p.base_notes_ru,
        JSON.stringify(p.images), p.is_bestseller ? 1 : 0, p.is_new ? 1 : 0, p.is_featured ? 1 : 0
      );
    }
  })();

  console.log('Successfully fixed all Louis Vuitton perfume images!');
}

fixLVImages();
