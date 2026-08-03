import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = '/Users/macbookair/.gemini/antigravity-ide/brain/b76ec114-29e1-40b4-808b-cff2dc047c3b/.system_generated/steps/5/content.md';
const content = fs.readFileSync(csvPath, 'utf-8');

const lines = content.split('\n');
const headerIdx = lines.findIndex(l => l.includes('Пол') && l.includes('Название'));
const productLines = lines.slice(headerIdx + 1).filter(l => l.trim().length > 0);

function parseNum(str) {
  if (!str) return 0;
  const clean = str.replace(/[^\d]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

const imagesPool = [
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80'
];

const products = [];

productLines.forEach((line, idx) => {
  const parts = line.split(',').map(p => p.trim());
  const genderCode = (parts[1] || '').toUpperCase();
  const name = parts[2] || '';
  const brand = parts[3] || '';

  if (!name) return;

  let gender = 'unisex';
  if (genderCode === 'M') gender = 'men';
  else if (genderCode === 'W') gender = 'women';

  let price_10g = parseNum(parts[4]);
  if (!price_10g) price_10g = 150000;

  let price_20g = parseNum(parts[5]);
  if (!price_20g) price_20g = Math.round(price_10g * 1.8);

  let price_30g = parseNum(parts[6]);
  if (!price_30g) price_30g = Math.round(price_10g * 2.64);

  let price_50g = parseNum(parts[7]);
  if (!price_50g) price_50g = Math.round(price_10g * 4.25);

  let price_100g = Math.round(price_10g * 7.5);

  let category_slug = 'unisex';
  const brandLower = brand.toLowerCase();
  const nameLower = name.toLowerCase();

  if (brandLower.includes('boadicea') || brandLower.includes('louis vuitton') || brandLower.includes('roja') || brandLower.includes('clive christian') || brandLower.includes('creed') || price_10g >= 240000) {
    category_slug = 'premium';
  } else if (brandLower.includes('montale') || nameLower.includes('oud') || nameLower.includes('arabian') || nameLower.includes('sultan')) {
    category_slug = 'arab-atirlari';
  } else if (gender === 'men') {
    category_slug = 'erkaklar';
  } else if (gender === 'women') {
    category_slug = 'ayollar';
  }

  const primaryImg = imagesPool[idx % imagesPool.length];
  const secondaryImg = imagesPool[(idx + 3) % imagesPool.length];

  products.push({
    name,
    brand,
    category_slug,
    gender,
    price_10g,
    price_20g,
    price_30g,
    price_50g,
    price_100g,
    rating: Number((4.7 + (idx % 30) * 0.01).toFixed(2)),
    reviews_count: 50 + (idx * 7) % 250,
    description_uz: `${brand} ${name} - yuqori sifatli va uzoq saqlanuvchi original parfyum. Fransiyaning eng sara komponentlaridan tayyorlangan nafis va jozibali aromat.`,
    description_ru: `${brand} ${name} - изысканный и стойкий оригинальный парфюм премиум качества. Создан из лучших ингредиентов.`,
    scent_family_uz: gender === 'men' ? 'Yog\'ochli, Fuzher' : gender === 'women' ? 'Gul-Meva, Shirin' : 'Sharqona, Amber-Musk',
    scent_family_ru: gender === 'men' ? 'Древесно-фужерный' : gender === 'women' ? 'Цветочно-фруктовый' : 'Восточно-амбровый',
    top_notes_uz: 'Bergamot, Sitrus, Qora smorodina',
    top_notes_ru: 'Бергамот, Цитрус, Черная смородина',
    heart_notes_uz: 'Yasmik, Roza, Kedr yog\'ochi',
    heart_notes_ru: 'Жасмин, Роза, Кедр',
    base_notes_uz: 'Amber, Musk, Sandal, Vanil',
    base_notes_ru: 'Амбра, Мускус, Сандал, Ваниль',
    images_json: JSON.stringify([primaryImg, secondaryImg]),
    is_bestseller: idx % 8 === 0 ? 1 : 0,
    is_new: idx % 6 === 0 ? 1 : 0,
    is_featured: idx % 5 === 0 ? 1 : 0
  });
});

fs.writeFileSync(path.join(__dirname, 'products_seed.json'), JSON.stringify(products, null, 2));
console.log('Saved server/products_seed.json with', products.length, 'items');
