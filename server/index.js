import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OAuth2Client } from 'google-auth-library';
import { JsonDB } from './db.js';
import {
  hashPassword, verifyPassword, burnTime, randomToken, sha256, newId,
  rateLimiter, parseCookies, cookie,
} from './security.js';
import { cleanProfile, cleanEmail, passwordProblem, publicUser, isComplete } from './validate.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* .env opsional */ }

const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const SECURE = BASE_URL.startsWith('https://');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const SESSION_DAYS = Number(process.env.SESSION_DAYS) || 30;
const MAX_STATE_BYTES = 2_000_000;
const SID = 'eb_sid';

const db = new JsonDB(process.env.DB_FILE ? path.resolve(ROOT, process.env.DB_FILE) : path.join(ROOT, 'data', 'db.json'));
const google = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;
const authLimit = rateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === '1');

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    // GIS butuh popup yang tetap bisa berkomunikasi dengan halaman ini.
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  });
  next();
});
app.use(express.json({ limit: '3mb' }));

/* ---------------- sesi ---------------- */
function prune() {
  const now = Date.now();
  const before = db.sessions.length;
  db.data.sessions = db.sessions.filter(s => s.exp > now);
  return before !== db.sessions.length;
}
async function startSession(res, user) {
  prune();
  const token = randomToken();
  db.sessions.push({ id: sha256(token), userId: user.id, exp: Date.now() + SESSION_DAYS * 864e5, dibuat: new Date().toISOString() });
  user.terakhirMasuk = new Date().toISOString();
  await db.save();
  res.append('Set-Cookie', cookie(SID, token, { maxAge: SESSION_DAYS * 86400, secure: SECURE }));
}
function currentUser(req) {
  const token = parseCookies(req.headers.cookie)[SID];
  if (!token) return null;
  const s = db.sessions.find(x => x.id === sha256(token) && x.exp > Date.now());
  return s ? db.users.find(u => u.id === s.userId) || null : null;
}
function endSession(req, res) {
  const token = parseCookies(req.headers.cookie)[SID];
  if (token) db.data.sessions = db.sessions.filter(x => x.id !== sha256(token));
  res.append('Set-Cookie', cookie(SID, '', { maxAge: 0, secure: SECURE }));
}

// Lindungi permintaan yang mengubah data dari CSRF: wajib header kustom + Origin sama.
function guard(req, res, next) {
  if (req.get('X-EcoBriket') !== '1') return res.status(403).json({ error: 'Permintaan ditolak (header hilang).' });
  const origin = req.get('Origin');
  if (origin && origin !== BASE_URL && origin !== `${req.protocol}://${req.get('host')}`)
    return res.status(403).json({ error: 'Origin tidak diizinkan.' });
  next();
}
function needUser(req, res, next) {
  req.user = currentUser(req);
  if (!req.user) return res.status(401).json({ error: 'Silakan masuk terlebih dahulu.' });
  next();
}
const ip = req => req.ip || req.socket.remoteAddress || '?';
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ---------------- konfigurasi ---------------- */
app.get('/api/config', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    app: 'ecobriket', version: '0.5.0',
    providers: { password: true, google: GOOGLE_CLIENT_ID || null, github: !!(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) },
    user: publicUser(currentUser(req)),
  });
});

/* ---------------- daftar / masuk dengan kata sandi ---------------- */
app.post('/api/auth/register', guard, wrap(async (req, res) => {
  if (!authLimit('reg:' + ip(req))) return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.' });
  const email = cleanEmail(req.body.email);
  const { data, errors } = cleanProfile(req.body);
  if (!email) errors.email = 'Email tidak valid.';
  const pw = passwordProblem(req.body.password, { nama: data.nama, email });
  if (pw) errors.password = pw;
  if (req.body.password !== req.body.password2) errors.password2 = 'Konfirmasi kata sandi tidak sama.';
  if (req.body.setuju !== true) errors.setuju = 'Anda perlu menyetujui kebijakan privasi.';
  if (email && db.users.some(u => u.email === email)) errors.email = 'Email sudah terdaftar. Silakan masuk.';
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Periksa kembali isian Anda.', fields: errors });

  const user = { id: newId('us'), email, ...data, passwordHash: await hashPassword(req.body.password), metode: ['password'], dibuat: new Date().toISOString(), setujuPada: new Date().toISOString() };
  db.users.push(user);
  await startSession(res, user);
  res.status(201).json({ user: publicUser(user) });
}));

app.post('/api/auth/login', guard, wrap(async (req, res) => {
  const email = cleanEmail(req.body.email);
  if (!authLimit('login:' + ip(req) + ':' + email)) return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.' });
  const user = email && db.users.find(u => u.email === email);
  const ok = user && user.passwordHash ? await verifyPassword(String(req.body.password || ''), user.passwordHash) : (await burnTime(req.body.password), false);
  if (!ok) {
    const hint = user && !user.passwordHash ? ' Akun ini dibuat lewat ' + (user.googleId ? 'Google' : 'GitHub') + '.' : '';
    return res.status(401).json({ error: 'Email atau kata sandi salah.' + hint });
  }
  await startSession(res, user);
  res.json({ user: publicUser(user) });
}));

app.post('/api/auth/logout', guard, wrap(async (req, res) => {
  endSession(req, res);
  await db.save();
  res.json({ ok: true });
}));

app.get('/api/auth/me', (req, res) => { res.set('Cache-Control', 'no-store'); res.json({ user: publicUser(currentUser(req)) }); });

/* ---------------- profil ---------------- */
app.put('/api/auth/profile', guard, needUser, wrap(async (req, res) => {
  const { data, errors } = cleanProfile(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Periksa kembali isian Anda.', fields: errors });
  Object.assign(req.user, data, { diubah: new Date().toISOString() });
  if (req.body.setuju === true && !req.user.setujuPada) req.user.setujuPada = new Date().toISOString();
  await db.save();
  res.json({ user: publicUser(req.user) });
}));

app.put('/api/auth/password', guard, needUser, wrap(async (req, res) => {
  const u = req.user;
  if (u.passwordHash && !(await verifyPassword(String(req.body.lama || ''), u.passwordHash)))
    return res.status(400).json({ error: 'Kata sandi lama salah.', fields: { lama: 'Kata sandi lama salah.' } });
  const p = passwordProblem(req.body.baru, { email: u.email });
  if (p) return res.status(400).json({ error: p, fields: { baru: p } });
  u.passwordHash = await hashPassword(req.body.baru);
  if (!u.metode.includes('password')) u.metode.push('password');
  // Keluarkan sesi lain setelah kata sandi diganti.
  const token = parseCookies(req.headers.cookie)[SID];
  db.data.sessions = db.sessions.filter(s => s.userId !== u.id || s.id === sha256(token));
  await db.save();
  res.json({ user: publicUser(u) });
}));

app.delete('/api/auth/account', guard, needUser, wrap(async (req, res) => {
  const u = req.user;
  if (u.passwordHash && !(await verifyPassword(String(req.body.password || ''), u.passwordHash)))
    return res.status(400).json({ error: 'Kata sandi salah.', fields: { password: 'Kata sandi salah.' } });
  db.data.users = db.users.filter(x => x.id !== u.id);
  db.data.sessions = db.sessions.filter(s => s.userId !== u.id);
  delete db.states[u.id];
  endSession(req, res);
  await db.save();
  res.json({ ok: true });
}));

/* ---------------- login pihak ketiga ---------------- */
async function upsertOAuth({ provider, providerId, email, emailVerified, nama }) {
  const key = provider + 'Id';
  let user = db.users.find(u => u[key] === providerId);
  if (!user && email && emailVerified) {
    // Tautkan ke akun yang sudah ada hanya jika email terverifikasi oleh penyedia.
    user = db.users.find(u => u.email === email);
    if (user) { user[key] = providerId; if (!user.metode.includes(provider)) user.metode.push(provider); }
  }
  if (!user) {
    if (!email) throw Object.assign(new Error('Penyedia tidak memberikan email terverifikasi.'), { status: 400 });
    user = { id: newId('us'), email, nama: nama || email.split('@')[0], [key]: providerId, metode: [provider], dibuat: new Date().toISOString(), bahasa: 'id' };
    db.users.push(user);
  }
  return user;
}

app.post('/api/auth/google', guard, wrap(async (req, res) => {
  if (!google) return res.status(501).json({ error: 'Masuk dengan Google belum dikonfigurasi (GOOGLE_CLIENT_ID kosong).' });
  if (!authLimit('g:' + ip(req))) return res.status(429).json({ error: 'Terlalu banyak percobaan.' });
  let payload;
  try {
    const ticket = await google.verifyIdToken({ idToken: String(req.body.credential || ''), audience: GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: 'Token Google tidak valid atau kedaluwarsa.' });
  }
  const user = await upsertOAuth({ provider: 'google', providerId: payload.sub, email: (payload.email || '').toLowerCase(), emailVerified: payload.email_verified === true, nama: payload.name });
  await startSession(res, user);
  res.json({ user: publicUser(user), baru: !isComplete(user) });
}));

app.get('/api/auth/github', (req, res) => {
  if (!GITHUB_CLIENT_ID) return res.redirect('/#/akun?err=github-off');
  const state = randomToken(16);
  res.append('Set-Cookie', cookie('eb_gh', state, { maxAge: 600, secure: SECURE }));
  const u = new URL('https://github.com/login/oauth/authorize');
  u.search = new URLSearchParams({ client_id: GITHUB_CLIENT_ID, redirect_uri: BASE_URL + '/api/auth/github/callback', scope: 'read:user user:email', state, allow_signup: 'true' });
  res.redirect(u.toString());
});

app.get('/api/auth/github/callback', wrap(async (req, res) => {
  const expected = parseCookies(req.headers.cookie).eb_gh;
  res.append('Set-Cookie', cookie('eb_gh', '', { maxAge: 0, secure: SECURE }));
  if (!expected || req.query.state !== expected || !req.query.code) return res.redirect('/#/akun?err=github-state');
  try {
    const tk = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code: req.query.code, redirect_uri: BASE_URL + '/api/auth/github/callback' }),
    }).then(r => r.json());
    if (!tk.access_token) throw new Error('no token');
    const h = { Authorization: 'Bearer ' + tk.access_token, Accept: 'application/vnd.github+json', 'User-Agent': 'EcoBriket' };
    const [gu, emails] = await Promise.all([
      fetch('https://api.github.com/user', { headers: h }).then(r => r.json()),
      fetch('https://api.github.com/user/emails', { headers: h }).then(r => r.json()).catch(() => []),
    ]);
    const primary = Array.isArray(emails) ? emails.find(e => e.primary && e.verified) || emails.find(e => e.verified) : null;
    const user = await upsertOAuth({ provider: 'github', providerId: String(gu.id), email: primary ? primary.email.toLowerCase() : '', emailVerified: !!primary, nama: gu.name || gu.login });
    await startSession(res, user);
    res.redirect('/#/akun' + (isComplete(user) ? '' : '?lengkapi=1'));
  } catch (e) {
    console.error('[github]', e.message);
    res.redirect('/#/akun?err=github');
  }
}));

/* ---------------- data aplikasi per pengguna ---------------- */
app.get('/api/state', needUser, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(db.states[req.user.id] || { json: null, updated: 0 });
});

app.put('/api/state', guard, needUser, wrap(async (req, res) => {
  const json = req.body && typeof req.body.json === 'string' ? req.body.json : '';
  if (!json) return res.status(400).json({ error: 'Data kosong.' });
  if (Buffer.byteLength(json) > MAX_STATE_BYTES) return res.status(413).json({ error: 'Data terlalu besar (maks. 2 MB).' });
  try { JSON.parse(json); } catch { return res.status(400).json({ error: 'JSON tidak valid.' }); }
  db.states[req.user.id] = { json, updated: Number(req.body.updated) || Date.now() };
  await db.save();
  res.json({ ok: true });
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.' }));

/* ---------------- berkas statis ---------------- */
app.use(express.static(path.join(ROOT, 'public'), { extensions: ['html'], maxAge: 0 }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Terjadi kesalahan di server.' });
});

if (prune()) db.save();
app.listen(PORT, () => {
  console.log(`\n  EcoBriket berjalan di ${BASE_URL}`);
  console.log(`  Masuk Google : ${GOOGLE_CLIENT_ID ? 'aktif' : 'belum dikonfigurasi (isi GOOGLE_CLIENT_ID di .env)'}`);
  console.log(`  Masuk GitHub : ${GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET ? 'aktif' : 'belum dikonfigurasi (isi GITHUB_CLIENT_ID/SECRET di .env)'}`);
  console.log(`  Data         : ${db.file}\n`);
});

export default app;
