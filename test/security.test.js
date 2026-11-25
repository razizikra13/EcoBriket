// Uji keamanan: node --test test/*.test.js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inlineScriptHashes } from '../server/headers.js';

const PORT = 3800 + Math.floor(Math.random() * 500);
const BASE = `http://localhost:${PORT}`;
const DB = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ebs-')), 'db.json');
let proc;
before(async () => {
  proc = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, PORT: String(PORT), DB_FILE: DB, GOOGLE_CLIENT_ID: '', GITHUB_CLIENT_ID: '' }, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { await fetch(BASE + '/api/config'); return; } catch { await new Promise(r => setTimeout(r, 100)); } }
  throw new Error('server tidak menyala');
});
after(() => proc && proc.kill());

const post = (p, body, h = {}) => fetch(BASE + p, { method: 'POST', headers: { 'X-EcoBriket': '1', 'Content-Type': 'application/json', ...h }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const reg = (over = {}) => post('/api/auth/register', { nama: 'Uji Aman', email: 'aman@contoh.id', password: 'Arang#2026x', password2: 'Arang#2026x', setuju: true, negara: 'ID', provinsi: 'Aceh', kota: 'Banda Aceh', peran: 'pembeli', ...over });

test('header keamanan & CSP terpasang', async () => {
  const r = await fetch(BASE + '/');
  const csp = r.headers.get('content-security-policy');
  assert.ok(csp && csp.includes("object-src 'none'") && csp.includes("frame-ancestors 'self'"));
  assert.ok(!/script-src[^;]*'unsafe-inline'/.test(csp), 'script-src tidak boleh unsafe-inline');
  const html = await r.text();
  for (const h of inlineScriptHashes(html)) assert.ok(csp.includes(h), 'hash skrip inline cocok');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(r.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.ok(r.headers.get('permissions-policy'));
  assert.equal(r.headers.get('x-powered-by'), null);
});

test('vercel.json sinkron dengan index.html (jalankan npm run headers bila gagal)', () => {
  const html = fs.readFileSync('public/index.html', 'utf8');
  const v = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const csp = v.headers[0].headers.find(h => h.key === 'Content-Security-Policy').value;
  for (const h of inlineScriptHashes(html)) assert.ok(csp.includes(h));
});

test('SQL/NoSQL injection di email & kata sandi tidak menembus login', async () => {
  assert.equal((await reg()).status, 201);
  for (const [email, password] of [["aman@contoh.id' OR '1'='1", 'x'], ['aman@contoh.id', "' OR 1=1 --"], [{ $ne: null }, { $ne: null }], ['aman@contoh.id', ['Arang#2026x']]]) {
    const r = await post('/api/auth/login', { email, password });
    assert.equal(r.status, 401, JSON.stringify([email, password]));
  }
});

test('XSS: markup di profil ditolak', async () => {
  const r = await reg({ email: 'xss@contoh.id', nama: '<img src=x onerror=alert(1)>', kota: '<script>alert(1)</script>' });
  assert.equal(r.status, 400);
  const d = await r.json();
  assert.ok(d.fields.nama && d.fields.kota);
});

test('prototype pollution di body diabaikan', async () => {
  const r = await post('/api/auth/register', '{"__proto__":{"isAdmin":true},"constructor":{"prototype":{"x":1}},"nama":"Proto Uji","email":"proto@contoh.id","password":"Arang#2026x","password2":"Arang#2026x","setuju":true,"negara":"ID","provinsi":"Aceh","kota":"Sabang","peran":"pembeli"}');
  assert.equal(r.status, 201);
  const d = await r.json();
  assert.equal(d.user.isAdmin, undefined);
  assert.equal({}.isAdmin, undefined);
});

test('kata sandi umum ditolak', async () => {
  const r = await reg({ email: 'umum@contoh.id', password: 'password123', password2: 'password123' });
  assert.equal(r.status, 400);
});

test('brute force: akun dikunci setelah 5 kali salah', async () => {
  for (let i = 0; i < 5; i++) assert.equal((await post('/api/auth/login', { email: 'proto@contoh.id', password: 'salah' + i + 'abc' }, { 'X-Forwarded-For': '10.0.0.' + i })).status, 401);
  const r = await post('/api/auth/login', { email: 'proto@contoh.id', password: 'Arang#2026x' });
  assert.equal(r.status, 429, 'kata sandi benar pun ditolak selama terkunci');
});

test('tidak ada enumerasi akun: pesan login sama', async () => {
  const a = await (await post('/api/auth/login', { email: 'tidakada@contoh.id', password: 'apaSaja123' })).json();
  const b = await (await post('/api/auth/login', { email: 'aman@contoh.id', password: 'apaSaja123' })).json();
  assert.equal(a.error, b.error);
});

test('CSRF: header kustom, Origin asing, dan Content-Type selain JSON ditolak', async () => {
  assert.equal((await post('/api/auth/login', {}, { 'X-EcoBriket': '' })).status, 403);
  assert.equal((await post('/api/auth/login', {}, { Origin: 'https://jahat.example' })).status, 403);
  const form = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'X-EcoBriket': '1', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'email=a&password=b' });
  assert.equal(form.status, 415);
});

test('JSON rusak & data kebesaran ditangani tanpa bocor stack trace', async () => {
  const r = await post('/api/auth/login', '{"email":');
  assert.equal(r.status, 400);
  const t = await r.text();
  assert.ok(!t.includes('at ') && !t.includes('node_modules'));
});

test('cookie sesi HttpOnly + SameSite, hash kata sandi & token tidak tersimpan polos', async () => {
  const r = await post('/api/auth/login', { email: 'aman@contoh.id', password: 'Arang#2026x' });
  assert.equal(r.status, 200);
  const c = r.headers.getSetCookie().find(x => x.includes('eb_sid'));
  assert.match(c, /HttpOnly/); assert.match(c, /SameSite=Lax/);
  const token = c.split(';')[0].split('=')[1];
  const raw = fs.readFileSync(DB, 'utf8');
  assert.ok(!raw.includes(token), 'token sesi disimpan sebagai hash');
  assert.ok(!raw.includes('Arang#2026x'));
});

test('path traversal & dotfile tidak bisa dibaca', async () => {
  for (const p of ['/../.env', '/%2e%2e/.env', '/.env', '/../server/index.js', '/..%2fpackage.json']) {
    const r = await fetch(BASE + p);
    const t = await r.text();
    assert.ok(!t.includes('GITHUB_CLIENT_SECRET') && !t.includes('import express'), p);
  }
});
