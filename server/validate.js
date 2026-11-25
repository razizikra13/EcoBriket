export const ROLES = ['pembeli', 'pabrik', 'produsen', 'peneliti'];
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,63}$/;
const PHONE_RE = /^\+?[0-9][0-9 ()-]{5,19}$/;
const ISO2_RE = /^[A-Z]{2}$/;

// Buang karakter kontrol & normalisasi Unicode. Encoding keluaran tetap dilakukan di browser (esc()).
const str = (v, max) => (typeof v === 'string' ? v.normalize('NFKC').replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E]/g, '').trim().slice(0, max) : '');
// Pertahanan berlapis terhadap XSS/HTML injection: teks profil tidak boleh berisi markup.
const MARKUP = /[<>]|javascript:|data:text\/html|on\w+\s*=/i;
const TEXT_FIELDS = ['nama', 'provinsi', 'kota', 'kecamatan', 'desa', 'alamat', 'org'];
const COMMON = new Set(['password1','password123','12345678','123456789','1234567890','qwerty123','qwertyuiop','iloveyou1','admin123','welcome1','abc12345','11111111','00000000','sayang123','bismillah1','indonesia1','rahasia123','katasandi1','passw0rd','p@ssw0rd','letmein1','football1','monkey123','dragon123','aceh12345','briket123','ecobriket1']);

// Mengembalikan {data, errors}. `partial` untuk melengkapi profil OAuth/ubah profil.
export function cleanProfile(body = {}, { requireAll = true } = {}) {
  const d = {
    nama: str(body.nama, 80),
    negara: str(body.negara, 3).toUpperCase(),
    provinsi: str(body.provinsi, 80),
    kota: str(body.kota, 80),
    kecamatan: str(body.kecamatan, 80),
    desa: str(body.desa, 80),
    alamat: str(body.alamat, 200),
    kodePos: str(body.kodePos, 12),
    telepon: str(body.telepon, 24),
    peran: str(body.peran, 20),
    org: str(body.org, 100),
    jenisUsaha: str(body.jenisUsaha, 60),
    bahasa: body.bahasa === 'en' ? 'en' : 'id',
    zonaWaktu: str(body.zonaWaktu, 60),
  };
  const e = {};
  if (d.nama.length < 2) e.nama = 'Nama minimal 2 karakter.';
  if (!ISO2_RE.test(d.negara)) e.negara = 'Pilih negara.';
  if (!d.provinsi) e.provinsi = 'Isi provinsi / negara bagian / region.';
  if (!d.kota) e.kota = 'Isi kabupaten / kota.';
  if (!ROLES.includes(d.peran)) e.peran = 'Pilih peran.';
  if (d.telepon && !PHONE_RE.test(d.telepon)) e.telepon = 'Format telepon tidak valid. Contoh: +62 812 3456 7890';
  if (d.kodePos && !/^[A-Za-z0-9 -]{3,12}$/.test(d.kodePos)) e.kodePos = 'Kode pos tidak valid.';
  for (const k of TEXT_FIELDS) if (d[k] && MARKUP.test(d[k])) e[k] = 'Tidak boleh berisi tanda < > atau kode.';
  if (!requireAll) for (const k of Object.keys(e)) if (!body[k]) delete e[k];
  return { data: d, errors: e };
}

export function cleanEmail(v) {
  const s = typeof v === 'string' ? v.trim().toLowerCase().slice(0, 254) : '';
  return EMAIL_RE.test(s) ? s : '';
}

export function passwordProblem(pw, { nama = '', email = '' } = {}) {
  if (typeof pw !== 'string') return 'Kata sandi tidak valid.';
  if (pw.length < 8) return 'Kata sandi minimal 8 karakter.';
  if (pw.length > 128) return 'Kata sandi maksimal 128 karakter.';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Kata sandi harus memuat huruf dan angka.';
  const low = pw.toLowerCase();
  if (COMMON.has(low)) return 'Kata sandi ini termasuk yang paling sering dipakai. Pilih yang lain.';
  const local = email.split('@')[0];
  if ((local && local.length >= 4 && low.includes(local)) || ['password', '12345678', 'qwerty12', 'ecobriket'].some(w => low.includes(w)))
    return 'Kata sandi terlalu mudah ditebak.';
  return '';
}

export const isComplete = u => !!(u.nama && u.negara && u.provinsi && u.kota && ROLES.includes(u.peran));

// Bentuk user yang aman dikirim ke browser (tanpa hash kata sandi).
export function publicUser(u) {
  if (!u) return null;
  const { passwordHash, googleId, githubId, ...rest } = u;
  return { ...rest, punyaSandi: !!passwordHash, google: !!googleId, github: !!githubId, profilLengkap: isComplete(u) };
}
