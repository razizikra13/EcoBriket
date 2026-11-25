// Menulis ulang vercel.json agar header keamanan (termasuk hash CSP) cocok dengan public/index.html.
// Jalankan setiap kali index.html diubah: npm run headers
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { headersForFile } from '../server/headers.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const h = headersForFile(path.join(ROOT, 'public', 'index.html'), { https: true });
const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  outputDirectory: 'public',
  cleanUrls: true,
  headers: [
    { source: '/(.*)', headers: Object.entries(h).map(([key, value]) => ({ key, value })) },
    { source: '/', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
  ],
};
fs.writeFileSync(path.join(ROOT, 'vercel.json'), JSON.stringify(config, null, 2) + '\n');
console.log('vercel.json diperbarui. CSP script hash:', h['Content-Security-Policy'].match(/'sha256-[^']+'/g).join(' '));
