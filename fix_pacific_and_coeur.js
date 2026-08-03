import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public', 'perfumes');

const targets = [
  {
    idx: 20,
    name: 'Pacific Chill',
    url: 'https://docs.google.com/sheets-images-rt/ADAzV4QMffIL9Hnf91I1eNe6RJCfXWYb9x1gvuZZNs9BK8GV2j8S_prT54Fc8oGXRh6sWETnuo2EYhXZ9G2p3NutDfAdqXT0e0rsi5jE5SACeq3QlA_jWlMm4509IH94_Bzqe8wFYECs5srzvpPJoa9oek3lUh8_KFXbr9w5OpAtdA=s800'
  },
  {
    idx: 204,
    name: 'Coeur Battant',
    url: 'https://docs.google.com/sheets-images-rt/ADAzV4RfUxWV6v7sseXrMlvvZ3jDM-uyVx_9AKDBzQIv0ZThjfJ8A4IB1aOL5vmY_5GidZG7x0vryw5Mdy3xTAR7aE1nfEv2lXtLKoMOAibOQDbSe-Wf5qiLC7Jaoe2bQh2NEB4o3fIPSe8WeBF6nsCTI_Y0wmH9T8S8_qtaWpo=s800'
  },
  {
    idx: 205,
    name: 'Coeur Battant',
    url: 'https://docs.google.com/sheets-images-rt/ADAzV4RfUxWV6v7sseXrMlvvZ3jDM-uyVx_9AKDBzQIv0ZThjfJ8A4IB1aOL5vmY_5GidZG7x0vryw5Mdy3xTAR7aE1nfEv2lXtLKoMOAibOQDbSe-Wf5qiLC7Jaoe2bQh2NEB4o3fIPSe8WeBF6nsCTI_Y0wmH9T8S8_qtaWpo=s800'
  }
];

async function fixSpecific() {
  for (const t of targets) {
    const filePath = path.join(publicDir, `perfume_${t.idx}.jpg`);
    try {
      const res = await fetch(t.url);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        console.log(`Successfully restored exact sheet image for ${t.name} (perfume_${t.idx}.jpg, ${buffer.length} bytes)`);
      }
    } catch (e) {
      console.error(`Error downloading for ${t.name}:`, e.message);
    }
  }
}

fixSpecific();
