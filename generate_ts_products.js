import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.join(__dirname, 'server', 'products_seed.json');
const productsSeed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const tsProducts = productsSeed.map((p, index) => {
  return {
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
  };
});

const fileContent = `import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(tsProducts, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'initialProducts.ts'), fileContent);
console.log('Successfully generated src/data/initialProducts.ts with', tsProducts.length, 'products');
