import fs from 'fs';

const htmlPath = '/Users/macbookair/.gemini/antigravity-ide/brain/b76ec114-29e1-40b4-808b-cff2dc047c3b/.system_generated/steps/222/content.md';
const html = fs.readFileSync(htmlPath, 'utf-8');

console.log('Searching for googleusercontent and drive image URLs in Google Sheet HTML...');

const lh7Matches = html.match(/https?:\/\/[^\s"'<>]*(?:googleusercontent|drive\.google|sheets-images)[^\s"'<>]*/g) || [];
console.log('Total matches found:', lh7Matches.length);

const uniqueUrls = Array.from(new Set(lh7Matches));
console.log('Unique image URLs found:', uniqueUrls.length);

console.log('Sample 10 URLs:\n', uniqueUrls.slice(0, 10).join('\n'));
