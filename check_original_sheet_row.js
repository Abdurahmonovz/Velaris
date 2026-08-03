import fs from 'fs';

const htmlPath = '/Users/macbookair/.gemini/antigravity-ide/brain/b76ec114-29e1-40b4-808b-cff2dc047c3b/.system_generated/steps/222/content.md';
const html = fs.readFileSync(htmlPath, 'utf-8');

const trMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

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

const targets = [20, 204, 205];
targets.forEach(idx => {
  const item = items[idx - 1];
  console.log(`Index ${idx}:`, item);
});
