import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);
const KEYLEN = 64;
// OWASP Password Storage Cheat Sheet: scrypt N=2^15, r=8, p=3 (±32 MiB per hash).
const PARAMS = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

// Format: scrypt$N$r$p$saltB64$hashB64
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password.normalize('NFKC'), salt, KEYLEN, PARAMS);
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64'), hash.toString('base64')].join('$');
}

export async function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !stored.startsWith('scrypt$')) return false;
  const [, N, r, p, saltB64, hashB64] = stored.split('$');
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scrypt(password.normalize('NFKC'), Buffer.from(saltB64, 'base64'), expected.length, { N: +N, r: +r, p: +p, maxmem: PARAMS.maxmem });
  return crypto.timingSafeEqual(expected, actual);
}

// True bila hash dibuat dengan parameter lama → dihitung ulang saat login berhasil.
export function needsRehash(stored) {
  const [, N, r, p] = String(stored).split('$');
  return +N !== PARAMS.N || +r !== PARAMS.r || +p !== PARAMS.p;
}

// Hash dummy agar waktu respons login sama untuk email yang tidak terdaftar.
let dummyHash = null;
export async function burnTime(password) {
  dummyHash ??= await hashPassword('dummy-password-for-timing');
  await verifyPassword(password || 'x', dummyHash).catch(() => false);
}

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');
export const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');
export const newId = prefix => prefix + '_' + crypto.randomBytes(9).toString('base64url');

// Batas percobaan sederhana di memori: maks `limit` kali per `windowMs` per kunci.
export function rateLimiter({ limit = 10, windowMs = 15 * 60 * 1000 } = {}) {
  const hits = new Map();
  const fn = key => {
    const now = Date.now();
    const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
    arr.push(now);
    hits.set(key, arr);
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k);
    return arr.length <= limit;
  };
  fn.count = key => (hits.get(key) || []).filter(t => Date.now() - t < windowMs).length;
  fn.reset = key => hits.delete(key);
  return fn;
}

// Hapus kunci berbahaya dari JSON masuk (prototype pollution).
export const safeReviver = (k, v) => (k === '__proto__' || k === 'constructor' || k === 'prototype' ? undefined : v);

// Log kejadian keamanan tanpa data rahasia; email disamarkan.
export function secLog(event, info = {}) {
  const mask = e => (e ? String(e).replace(/^(.).*(@.*)$/, '$1***$2') : undefined);
  console.warn(JSON.stringify({ t: new Date().toISOString(), sec: event, ...info, email: mask(info.email) }));
}

export function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (k) out[k] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function cookie(name, value, { maxAge, secure, httpOnly = true, sameSite = 'Lax', path = '/' } = {}) {
  if (!/^[\w-]+$/.test(name)) throw new Error('nama cookie tidak valid');
  let c = `${name}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;
  if (httpOnly) c += '; HttpOnly';
  if (secure) c += '; Secure';
  if (maxAge != null) c += `; Max-Age=${Math.floor(maxAge)}`;
  return c;
}
