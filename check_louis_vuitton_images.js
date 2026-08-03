import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.join(__dirname, 'server', 'products_seed.json');
const productsSeed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const lvProducts = productsSeed.filter(p => p.brand.toLowerCase().includes('loui') || p.name.toLowerCase().includes('vuitton'));
console.log('Found Louis Vuitton products:', lvProducts.length);
console.log(JSON.stringify(lvProducts.map(p => ({ name: p.name, brand: p.brand, img: JSON.parse(p.images_json)[0] })), null, 2));
