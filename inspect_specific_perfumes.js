import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.join(__dirname, 'server', 'products_seed.json');
const productsSeed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const targetNames = ['coeur', 'pacific', 'battant', 'chill'];

const found = productsSeed.filter(p => {
  const nameLower = p.name.toLowerCase();
  return targetNames.some(t => nameLower.includes(t));
});

console.log('Found matching products:', found.length);
console.log(JSON.stringify(found.map((p, idx) => ({
  indexInSeed: productsSeed.indexOf(p) + 1,
  name: p.name,
  brand: p.brand,
  img: JSON.parse(p.images_json)[0]
})), null, 2));
