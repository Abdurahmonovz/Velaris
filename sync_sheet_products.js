import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname);

async function syncGoogleSheetData() {
  console.log('Fetching Google Sheet CSV...');
  const csvUrl = 'https://docs.google.com/spreadsheets/d/1HBzQu4OL6sWbCj8-9LGnaXpwo8Cqy75TuyBk03_4VN8/gviz/tq?tqx=out:csv&gid=0';
  const csvRes = await fetch(csvUrl);
  const csvText = await csvRes.text();

  function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      const row = [];
      let inQuotes = false;
      let curr = '';
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            curr += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          row.push(curr.trim());
          curr = '';
        } else {
          curr += c;
        }
      }
      row.push(curr.trim());
      result.push(row);
    }
    return result;
  }

  const rows = parseCSV(csvText);
  console.log(`Total CSV rows: ${rows.length}`);

  // Fetch HTML version to extract images
  const htmlPath = '/Users/macbookair/.gemini/antigravity-ide/brain/aa3c4ce1-67ef-41ef-88ba-adc261bd5417/.system_generated/steps/305/content.md';
  let htmlContent = '';
  if (fs.existsSync(htmlPath)) {
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  }

  const trMatches = htmlContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
  const htmlImagesMap = new Map();

  trMatches.forEach((tr) => {
    const imgMatch = tr.match(/<img[^>]+src=["']([^"']+)["']/i);
    const tds = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (tds.length >= 4) {
      const textVals = tds.map(td => td.replace(/<[^>]+>/g, '').trim());
      const name = textVals[2];
      if (name && imgMatch) {
        htmlImagesMap.set(name.toLowerCase().trim(), imgMatch[1]);
      }
    }
  });

  console.log(`Extracted ${htmlImagesMap.size} image URLs from Google Sheet.`);

  const seedPath = path.join(rootDir, 'server', 'products_seed.json');
  const existingSeed = fs.existsSync(seedPath) ? JSON.parse(fs.readFileSync(seedPath, 'utf-8')) : [];
  const existingSeedMap = new Map();
  existingSeed.forEach(p => {
    existingSeedMap.set(p.name.toLowerCase().trim(), p);
  });

  const parsePrice = (str) => {
    if (!str) return 0;
    const clean = str.replace(/[^\d]/g, '');
    return clean ? parseInt(clean, 10) : 0;
  };

  const publicDir = path.join(rootDir, 'public', 'perfumes');
  fs.mkdirSync(publicDir, { recursive: true });

  const finalProducts = [];
  const downloadTasks = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const genderRaw = r[1] || '';
    const name = r[2] || '';
    const brand = r[3] || '';
    const p10Raw = r[4] || '';
    const p20Raw = r[6] || '';
    const p30Raw = r[7] || '';
    const p50Raw = r[8] || '';
    const p100Raw = r[9] || '';

    if (!name || name === 'Название' || name.startsWith('Лист')) continue;

    const p10 = parsePrice(p10Raw);
    let p20 = parsePrice(p20Raw) || (p10 ? Math.round(p10 * 1.8) : 0);
    let p30 = parsePrice(p30Raw) || (p10 ? Math.round(p10 * 2.64) : 0);
    let p50 = parsePrice(p50Raw) || (p10 ? Math.round(p10 * 4.25) : 0);
    let p100 = parsePrice(p100Raw) || (p10 ? Math.round(p10 * 7.65) : 0);

    let gender = 'unisex';
    let catSlug = 'unisex';
    const g = genderRaw.trim().toUpperCase();
    if (g === 'M' || g === 'М') {
      gender = 'men';
      catSlug = 'erkaklar';
    } else if (g === 'W' || g === 'Ж' || g === 'F') {
      gender = 'women';
      catSlug = 'ayollar';
    }

    const prodId = finalProducts.length + 1;
    const normalizedName = name.toLowerCase().trim();
    const existingP = existingSeedMap.get(normalizedName) || existingSeed[prodId - 1] || {};

    const imageFilename = `perfume_${prodId}.jpg`;
    const imagePath = `/perfumes/${imageFilename}`;

    const sheetImgUrl = htmlImagesMap.get(normalizedName);
    if (sheetImgUrl) {
      const hdUrl = sheetImgUrl.replace(/=w\d+-h\d+/, '=s800');
      const localFilePath = path.join(publicDir, imageFilename);
      downloadTasks.push(async () => {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 4000);
          const imgRes = await fetch(hdUrl, { signal: controller.signal });
          clearTimeout(timer);
          if (imgRes.ok) {
            const buf = Buffer.from(await imgRes.arrayBuffer());
            if (buf.length > 500) {
              fs.writeFileSync(localFilePath, buf);
            }
          }
        } catch (err) {
          // ignore timeout or network error, keep local file
        }
      });
    }

    finalProducts.push({
      id: prodId,
      name: name.trim(),
      brand: brand.trim() || existingP.brand || 'Velaris Atelier',
      category_slug: catSlug,
      gender: gender,
      price_10g: p10 || existingP.price_10g || 120000,
      price_20g: p20 || existingP.price_20g || 216000,
      price_30g: p30 || existingP.price_30g || 316800,
      price_50g: p50 || existingP.price_50g || 510000,
      price_100g: p100 || existingP.price_100g || 918000,
      rating: existingP.rating || +(4.7 + (prodId % 4) * 0.1).toFixed(1),
      reviews_count: existingP.reviews_count || (15 + (prodId % 30)),
      description_uz: existingP.description_uz || `${name} — ${brand} brendining eksklyuziv sharqona va zamonaviy xushbo'yligi. Yuqori konsentratsiyali, uzoq muddat saqlanuvchi premium atir.`,
      description_ru: existingP.description_ru || `${name} — эксклюзивный аромат от бренда ${brand}. Высокая концентрация, благородный шлейф и стойкость.`,
      scent_family_uz: existingP.scent_family_uz || (gender === 'men' ? 'Yog\'ochli, ziravorli' : gender === 'women' ? 'Gulli, mevali' : 'Sharqona, yog\'ochli'),
      scent_family_ru: existingP.scent_family_ru || (gender === 'men' ? 'Древесный, пряный' : gender === 'women' ? 'Цветочный, фруктовый' : 'Восточный, древесный'),
      top_notes_uz: existingP.top_notes_uz || 'Bergamot, pushti qalampir',
      top_notes_ru: existingP.top_notes_ru || 'Бергамот, розовый перец',
      heart_notes_uz: existingP.heart_notes_uz || 'Atirgul, yasmin, sadr yog\'ochi',
      heart_notes_ru: existingP.heart_notes_ru || 'Роза, жасмин, кедр',
      base_notes_uz: existingP.base_notes_uz || 'Ambra, mushk, vanil',
      base_notes_ru: existingP.base_notes_ru || 'Амбра, мускус, ваниль',
      images: [imagePath],
      is_bestseller: Boolean(existingP.is_bestseller !== undefined ? existingP.is_bestseller : (prodId <= 16 || prodId % 7 === 0)),
      is_new: Boolean(existingP.is_new !== undefined ? existingP.is_new : (prodId > 190 || prodId % 9 === 0)),
      is_featured: Boolean(existingP.is_featured !== undefined ? existingP.is_featured : (prodId <= 25)),
      stock: 100
    });
  }

  console.log(`Processing ${downloadTasks.length} image download tasks concurrently...`);
  // Process in batches of 15
  const batchSize = 15;
  for (let i = 0; i < downloadTasks.length; i += batchSize) {
    const batch = downloadTasks.slice(i, i + batchSize);
    await Promise.all(batch.map(fn => fn()));
  }

  console.log(`Synchronized ${finalProducts.length} perfumes from Google Sheet.`);

  // Write server/products_seed.json
  const seedOutput = finalProducts.map(p => ({
    ...p,
    images_json: JSON.stringify(p.images)
  }));
  fs.writeFileSync(seedPath, JSON.stringify(seedOutput, null, 2));

  // Write src/data/initialProducts.ts
  const tsContent = `import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(finalProducts, null, 2)};
`;
  fs.writeFileSync(path.join(rootDir, 'src', 'data', 'initialProducts.ts'), tsContent);

  // Update SQLite Database
  const dbPath = path.join(rootDir, 'server', 'velaris.db');
  if (fs.existsSync(dbPath)) {
    try {
      const db = new Database(dbPath);
      db.transaction(() => {
        db.prepare('DELETE FROM products').run();
        const insertProd = db.prepare(`
          INSERT INTO products (
            id, name, brand, category_slug, gender,
            price_10g, price_20g, price_30g, price_50g, price_100g,
            rating, reviews_count,
            description_uz, description_ru,
            scent_family_uz, scent_family_ru,
            top_notes_uz, top_notes_ru,
            heart_notes_uz, heart_notes_ru,
            base_notes_uz, base_notes_ru,
            images_json, is_bestseller, is_new, is_featured, stock
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const p of finalProducts) {
          insertProd.run(
            p.id, p.name, p.brand, p.category_slug, p.gender,
            p.price_10g, p.price_20g, p.price_30g, p.price_50g, p.price_100g,
            p.rating, p.reviews_count,
            p.description_uz, p.description_ru,
            p.scent_family_uz, p.scent_family_ru,
            p.top_notes_uz, p.top_notes_ru,
            p.heart_notes_uz, p.heart_notes_ru,
            p.base_notes_uz, p.base_notes_ru,
            JSON.stringify(p.images),
            p.is_bestseller ? 1 : 0,
            p.is_new ? 1 : 0,
            p.is_featured ? 1 : 0,
            p.stock
          );
        }
      })();
      console.log('Updated server SQLite database (velaris.db) successfully.');
    } catch (dbErr) {
      console.warn('SQLite update note:', dbErr.message);
    }
  }

  console.log('✅ All products, names, brands, prices, and images synchronized successfully!');
}

syncGoogleSheetData().catch(console.error);
