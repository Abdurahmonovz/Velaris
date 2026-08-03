import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Extract image URLs from HTML step 222
const htmlPath = '/Users/macbookair/.gemini/antigravity-ide/brain/b76ec114-29e1-40b4-808b-cff2dc047c3b/.system_generated/steps/222/content.md';
const html = fs.readFileSync(htmlPath, 'utf-8');

const trMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
const sheetMap = new Map();

trMatches.forEach((tr) => {
  const imgMatch = tr.match(/<img[^>]+src=["']([^"']+)["']/i);
  const tds = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
  
  if (tds.length >= 4) {
    const textVals = tds.map(td => td.replace(/<[^>]+>/g, '').trim());
    const name = textVals[2];
    const imgSrc = imgMatch ? imgMatch[1] : null;

    if (name && name !== 'Название' && imgSrc) {
      // Normalize Google Sheet image URL to higher resolution if possible or use clean URL
      const highResImg = imgSrc.replace(/=w\d+-h\d+/, '=w800-h800');
      sheetMap.set(name.toLowerCase(), highResImg);
    }
  }
});

console.log('Extracted sheet images map count:', sheetMap.size);

// 2. Read products_seed.json and assign exact sheet image URL
const seedPath = path.join(__dirname, 'server', 'products_seed.json');
const productsSeed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

let matchCount = 0;
const fallbackImg = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80';

const updatedSeed = productsSeed.map((p) => {
  const sheetImg = sheetMap.get(p.name.toLowerCase());
  let imageList = [];

  if (sheetImg) {
    matchCount++;
    imageList = [sheetImg];
  } else {
    // try partial match
    let foundImg = null;
    for (const [key, val] of sheetMap.entries()) {
      if (key.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(key)) {
        foundImg = val;
        break;
      }
    }
    if (foundImg) {
      matchCount++;
      imageList = [foundImg];
    } else {
      imageList = [fallbackImg];
    }
  }

  return {
    ...p,
    images_json: JSON.stringify(imageList)
  };
});

console.log(`Matched ${matchCount} / ${updatedSeed.length} perfumes with exact Google Sheet images!`);

// Save updated server/products_seed.json
fs.writeFileSync(seedPath, JSON.stringify(updatedSeed, null, 2));

// 3. Update SQLite Database velaris.db
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

console.log('Successfully updated velaris.db SQLite database!');

// 4. Update src/data/initialProducts.ts
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
console.log('Successfully updated src/data/initialProducts.ts with sheet images!');
