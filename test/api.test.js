// Uji API: node --test test/
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PORT = 3200 + Math.floor(Math.random() * 500);
const BASE = `http://localhost:${PORT}`;
const DB = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'eb-')), 'db.json');
let proc;

before(async () => {
  proc = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, PORT: String(PORT), DB_FILE: DB, GOOGLE_CLIENT_ID: '', GITHUB_CLIENT_ID: '' }, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { await fetch(BASE + '/api/config'); return; } catch { await new Promise(r => setTimeout(r, 100)); } }
  throw new Error('server tidak menyala');
});
after(() => proc && proc.kill());

const jar = () => { let c = ''; return {
  async req(p, method = 'GET', body, headers = {}) {
    const r = await fetch(BASE + p, { method, redirect: 'manual', headers: { 'X-EcoBriket': '1', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(c ? { Cookie: c } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.getSetCookie?.() || [];
    for (const x of sc) { const [kv] = x.split(';'); const [k, v] = kv.split('='); if (k === 'eb_sid') c = v ? `eb_sid=${v}` : ''; }
    let data = null; try { data = await r.json(); } catch {}
    return { status: r.status, data };
  } }; };

const profile = { nama: 'Siti Aminah', negara: 'ID', provinsi: 'Aceh', kota: 'Aceh Selatan', kecamatan: 'Meukek', peran: 'pabrik', telepon: '+62 812 3456 7890' };

test('daftar dengan kata sandi lalu sesi aktif', async () => {
  const a = jar();
  const r = await a.req('/api/auth/register', 'POST', { ...profile, email: 'Siti@Contoh.id', password: 'briket2026', password2: 'briket2026', setuju: true });
  assert.equal(r.status, 201);
  assert.equal(r.data.user.email, 'siti@contoh.id');
  assert.equal(r.data.user.passwordHash, undefined, 'hash tidak boleh bocor');
  assert.equal(r.data.user.profilLengkap, true);
  const me = await a.req('/api/auth/me');
  assert.equal(me.data.user.nama, 'Siti Aminah');
  const raw = fs.readFileSync(DB, 'utf8');
  assert.ok(!raw.includes('briket2026'), 'kata sandi tidak boleh tersimpan polos');
  assert.match(raw, /scrypt\$/);
});

test('validasi pendaftaran menolak isian buruk', async () => {
  const r = await jar().req('/api/auth/register', 'POST', { nama: 'A', email: 'bukan-email', password: 'pendek', password2: 'lain', negara: 'XX1', peran: 'raja' });
  assert.equal(r.status, 400);
  for (const k of ['nama', 'email', 'password', 'password2', 'setuju', 'negara', 'provinsi', 'kota', 'peran']) assert.ok(r.data.fields[k], 'harus ada error ' + k);
});

test('email ganda ditolak', async () => {
  const r = await jar().req('/api/auth/register', 'POST', { ...profile, email: 'siti@contoh.id', password: 'briket2026', password2: 'briket2026', setuju: true });
  assert.equal(r.status, 400);
  assert.ok(r.data.fields.email);
});

test('pengguna luar negeri dengan region bebas diterima', async () => {
  const r = await jar().req('/api/auth/register', 'POST', { nama: 'Ahmad Razak', email: 'ahmad@contoh.my', password: 'arang12345', password2: 'arang12345', setuju: true, negara: 'MY', provinsi: 'Selangor', kota: 'Shah Alam', peran: 'pembeli', bahasa: 'en' });
  assert.equal(r.status, 201);
  assert.equal(r.data.user.negara, 'MY');
  assert.equal(r.data.user.bahasa, 'en');
});

test('masuk, salah kata sandi, keluar', async () => {
  const a = jar();
  assert.equal((await a.req('/api/auth/login', 'POST', { email: 'siti@contoh.id', password: 'salah12345' })).status, 401);
  const ok = await a.req('/api/auth/login', 'POST', { email: 'SITI@contoh.id', password: 'briket2026' });
  assert.equal(ok.status, 200);
  assert.equal((await a.req('/api/auth/logout', 'POST', {})).status, 200);
  assert.equal((await a.req('/api/auth/me')).data.user, null);
});

test('CSRF: tanpa header kustom ditolak', async () => {
  const r = await jar().req('/api/auth/login', 'POST', { email: 'siti@contoh.id', password: 'briket2026' }, { 'X-EcoBriket': '' });
  assert.equal(r.status, 403);
});

test('data aplikasi per pengguna tersimpan dan terpisah', async () => {
  const a = jar(), b = jar();
  await a.req('/api/auth/login', 'POST', { email: 'siti@contoh.id', password: 'briket2026' });
  await b.req('/api/auth/login', 'POST', { email: 'ahmad@contoh.my', password: 'arang12345' });
  assert.equal((await a.req('/api/state', 'PUT', { json: JSON.stringify({ v: 3, favorit: ['pr-01'] }), updated: 5 })).status, 200);
  const sa = await a.req('/api/state'); assert.deepEqual(JSON.parse(sa.data.json).favorit, ['pr-01']);
  const sb = await b.req('/api/state'); assert.equal(sb.data.json, null);
  assert.equal((await jar().req('/api/state')).status, 401);
});

test('ubah profil, ganti kata sandi, hapus akun', async () => {
  const a = jar();
  await a.req('/api/auth/login', 'POST', { email: 'ahmad@contoh.my', password: 'arang12345' });
  const p = await a.req('/api/auth/profile', 'PUT', { nama: 'Ahmad R.', negara: 'MY', provinsi: 'Johor', kota: 'Johor Bahru', peran: 'produsen' });
  assert.equal(p.data.user.provinsi, 'Johor');
  assert.equal((await a.req('/api/auth/password', 'PUT', { lama: 'keliru999', baru: 'baru12345' })).status, 400);
  assert.equal((await a.req('/api/auth/password', 'PUT', { lama: 'arang12345', baru: 'baru12345' })).status, 200);
  assert.equal((await a.req('/api/auth/account', 'DELETE', { password: 'arang12345' })).status, 400);
  assert.equal((await a.req('/api/auth/account', 'DELETE', { password: 'baru12345' })).status, 200);
  assert.equal((await jar().req('/api/auth/login', 'POST', { email: 'ahmad@contoh.my', password: 'baru12345' })).status, 401);
});

test('Google & GitHub menjawab jujur saat belum dikonfigurasi', async () => {
  const g = await jar().req('/api/auth/google', 'POST', { credential: 'x' });
  assert.equal(g.status, 501);
  const gh = await jar().req('/api/auth/github');
  assert.equal(gh.status, 302);
});
