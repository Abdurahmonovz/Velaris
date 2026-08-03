import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.join(__dirname, 'server', 'products_seed.json');
const productsSeed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const catCounts = {};
const genderCounts = {};

productsSeed.forEach(p => {
  catCounts[p.category_slug] = (catCounts[p.category_slug] || 0) + 1;
  genderCounts[p.gender] = (genderCounts[p.gender] || 0) + 1;
});

console.log('Category Slugs in Database:', catCounts);
console.log('Genders in Database:', genderCounts);
