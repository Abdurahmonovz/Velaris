import fs from 'fs';

const htmlPath = '/Users/macbookair/.gemini/antigravity-ide/brain/b76ec114-29e1-40b4-808b-cff2dc047c3b/.system_generated/steps/222/content.md';
const html = fs.readFileSync(htmlPath, 'utf-8');

const trMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
console.log('Total TR rows:', trMatches.length);

const results = [];
trMatches.forEach((tr, idx) => {
  const imgMatch = tr.match(/<img[^>]+src=["']([^"']+)["']/i);
  const tds = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
  
  if (tds.length >= 4) {
    const textVals = tds.map(td => td.replace(/<[^>]+>/g, '').trim());
    const gender = textVals[1];
    const name = textVals[2];
    const brand = textVals[3];
    const imgSrc = imgMatch ? imgMatch[1] : null;

    if (name && name !== 'Название') {
      results.push({
        idx: results.length + 1,
        gender,
        name,
        brand,
        imgSrc
      });
    }
  }
});

console.log('Total extracted perfume rows:', results.length);
console.log('Rows with actual images:', results.filter(r => r.imgSrc !== null).length);
console.log('Sample first 10:', JSON.stringify(results.slice(0, 10), null, 2));
