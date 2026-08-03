import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = [
  { id: 1, slug: 'erkaklar', name_uz: 'Erkaklar', name_ru: 'Мужские', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80' },
  { id: 2, slug: 'ayollar', name_uz: 'Ayollar', name_ru: 'Женские', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80' },
  { id: 3, slug: 'unisex', name_uz: 'Unisex', name_ru: 'Унисекс', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80' },
  { id: 4, slug: 'arab-atirlari', name_uz: 'Arab atirlari', name_ru: 'Aрабские', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=400&q=80' },
  { id: 5, slug: 'premium', name_uz: 'Premium', name_ru: 'Премиум', image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=400&q=80' },
  { id: 6, slug: 'yangi', name_uz: 'Yangi kolleksiya', name_ru: 'Новая коллекция', image: 'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=400&q=80' },
  { id: 7, slug: 'bestseller', name_uz: 'Bestseller', name_ru: 'Бестселлеры', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80' },
];

// Update SQLite database categories table
const dbPath = path.join(__dirname, 'server', 'velaris.db');
const db = new Database(dbPath);

db.transaction(() => {
  db.prepare('DELETE FROM categories').run();

  const insert = db.prepare('INSERT INTO categories (id, slug, name_uz, name_ru, image) VALUES (?, ?, ?, ?, ?)');
  for (const c of categories) {
    insert.run(c.id, c.slug, c.name_uz, c.name_ru, c.image);
  }
})();

console.log('Successfully updated SQLite categories table with 7 distinct pure perfume bottle images!');

// Update src/data/initialBanners.ts
const bannersPath = path.join(__dirname, 'src', 'data', 'initialBanners.ts');
let bannersContent = fs.readFileSync(bannersPath, 'utf-8');

const newCatTs = `export const INITIAL_CATEGORIES: Category[] = ${JSON.stringify(categories, null, 2)};`;

bannersContent = bannersContent.replace(/export const INITIAL_CATEGORIES: Category\[\] = \[[\s\S]*?\];/, newCatTs);
fs.writeFileSync(bannersPath, bannersContent);

console.log('Successfully updated src/data/initialBanners.ts!');
