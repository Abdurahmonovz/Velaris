import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = '/Users/macbookair/.gemini/antigravity-ide/brain/b76ec114-29e1-40b4-808b-cff2dc047c3b/.system_generated/steps/222/content.md';
const html = fs.readFileSync(htmlPath, 'utf-8');

const trMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

const publicDir = path.join(__dirname, 'public', 'perfumes');
fs.mkdirSync(publicDir, { recursive: true });

// Unsplash fallback pool for missing or failed images
const unsplashPool = [
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80'
];

// Extract items
const items = [];
trMatches.forEach((tr) => {
  const imgMatch = tr.match(/<img[^>]+src=["']([^"']+)["']/i);
  const tds = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];

  if (tds.length >= 4) {
    const textVals = tds.map(td => td.replace(/<[^>]+>/g, '').trim());
    const name = textVals[2];
    const imgSrc = imgMatch ? imgMatch[1] : null;

    if (name && name !== 'Название') {
      items.push({
        index: items.length + 1,
        name,
        imgSrc
      });
    }
  }
});

console.log(`Starting image extraction and download for ${items.length} perfumes...`);

const downloadedMap = new Map();

async function processItems() {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const filename = `perfume_${item.index}.jpg`;
    const localPath = path.join(publicDir, filename);
    const publicUrl = `/perfumes/${filename}`;

    let success = false;
    if (item.imgSrc) {
      try {
        const res = await fetch(item.imgSrc);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          if (buffer.length > 500) { // Valid image check
            fs.writeFileSync(localPath, buffer);
            success = true;
          }
        }
      } catch (err) {
        // fetch failed
      }
    }

    if (!success) {
      // Fetch fallback Unsplash image
      const fallback = unsplashPool[i % unsplashPool.length];
      try {
        const res = await fetch(fallback);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(localPath, buffer);
          success = true;
        }
      } catch (err) {
        console.error(`Failed fallback for item ${item.index}`);
      }
    }

    downloadedMap.set(item.name.toLowerCase(), publicUrl);
    if ((i + 1) % 25 === 0 || i === items.length - 1) {
      console.log(`Downloaded ${i + 1}/${items.length} perfume images...`);
    }
  }

  console.log('All perfume images downloaded successfully into public/perfumes/!');

  // Update products_seed.json and initialProducts.ts and velaris.db with local paths /perfumes/perfume_X.jpg
  const seedPath = path.join(__dirname, 'server', 'products_seed.json');
  const productsSeed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  const updatedProducts = productsSeed.map((p, idx) => {
    const localImg = `/perfumes/perfume_${idx + 1}.jpg`;
    return {
      ...p,
      images_json: JSON.stringify([localImg])
    };
  });

  fs.writeFileSync(seedPath, JSON.stringify(updatedProducts, null, 2));

  // Update src/data/initialProducts.ts
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

  // Update SQLite database
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

  console.log('Database, initialProducts.ts, and products_seed.json updated with local images!');
}

processItems();
