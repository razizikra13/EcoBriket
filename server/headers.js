// Header keamanan HTTP — satu sumber untuk server Express dan vercel.json.
// Mengikuti OWASP Secure Headers Project.
import crypto from 'node:crypto';
import fs from 'node:fs';

// Hash SHA-256 untuk setiap <script> inline agar CSP tidak perlu 'unsafe-inline'.
export function inlineScriptHashes(html) {
  const out = [];
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) out.push(`'sha256-${crypto.createHash('sha256').update(m[1], 'utf8').digest('base64')}'`);
  return out;
}

const GIS = 'https://accounts.google.com/gsi/';

export function contentSecurityPolicy(hashes) {
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')} ${GIS}client`,
    // Atribut style= dipakai luas oleh SVG/tata letak; tidak bisa menjalankan skrip.
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${GIS}style`,
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src 'self' ${GIS}`,
    `frame-src ${GIS}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}

export function securityHeaders(hashes, { https = true } = {}) {
  const h = {
    'Content-Security-Policy': contentSecurityPolicy(hashes),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    // GIS membuka popup yang harus bisa membalas ke halaman ini.
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Permitted-Cross-Domain-Policies': 'none',
  };
  if (https) h['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  else h['Content-Security-Policy'] = h['Content-Security-Policy'].replace('; upgrade-insecure-requests', '');
  return h;
}

export const headersForFile = (file, opts) => securityHeaders(inlineScriptHashes(fs.readFileSync(file, 'utf8')), opts);
