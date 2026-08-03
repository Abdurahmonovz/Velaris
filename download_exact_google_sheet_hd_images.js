import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = '/Users/macbookair/.gemini/antigravity-ide/brain/b76ec114-29e1-40b4-808b-cff2dc047c3b/.system_generated/steps/222/content.md';
const html = fs.readFileSync(htmlPath, 'utf-8');

const trMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

const publicDir = path.join(__dirname, 'public', 'perfumes');
fs.mkdirSync(publicDir, { recursive: true });

// Extract exact row items from sheet HTML
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
        brand: textVals[3],
        imgSrc
      });
    }
  }
});

console.log(`Found ${items.length} perfumes in Google Sheet. Downloading exact HD (=s800) images...`);

async function downloadExactSheetHD() {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const filename = `perfume_${item.index}.jpg`;
    const localPath = path.join(publicDir, filename);

    if (item.imgSrc) {
      // Replace low-res thumbnail (=w124-h106) with High-Res (=s800)
      const hdUrl = item.imgSrc.replace(/=w\d+-h\d+/, '=s800');

      try {
        const res = await fetch(hdUrl);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          if (buffer.length > 500) {
            fs.writeFileSync(localPath, buffer);
          }
        }
      } catch (err) {
        console.error(`Error downloading HD image for item ${item.index} (${item.name}):`, err.message);
      }
    }

    if ((i + 1) % 30 === 0 || i === items.length - 1) {
      console.log(`Downloaded ${i + 1}/${items.length} exact Google Sheet HD images...`);
    }
  }

  // Update products_seed.json
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

  // Update SQLite database velaris.db
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

  console.log('Successfully updated all 212 perfumes with exact High-Definition Google Sheet images!');
}

downloadExactSheetHD();
