# EcoBriket

Katalog, pencari, dan alat produksi **briket bio-arang dari biomassa** (tempurung kelapa, cangkang sawit, sekam, serbuk gergaji, tongkol jagung, pinang, ampas penyulingan pala, dan campuran). Untuk pembeli, pemilik pabrik briket, pemasok biomassa, dan peneliti — di Indonesia maupun luar negeri.

> **Status: prototipe riset.** Nilai mutu briket berasal dari 17 jurnal (halaman *Referensi* di aplikasi) untuk bahan yang sejenis, bukan hasil uji produk di katalog. Profil pabrik, stok, harga, dan kontak adalah data contoh (studi kasus Meukek, Aceh Selatan). Tidak ada produk yang berstatus "Terverifikasi Lab SNI".

## Fitur

- Katalog & **Cari Briket** sesuai kebutuhan tungku (kg/hari, biaya/hari, lama nyala).
- Detail briket: 4 ilustrasi, simulasi nyala, tabel SNI 01-6235-2000 dengan sumber jurnal.
- Produksi 6 tahap, timer jemur, kalkulator formulasi & energi, planner, logbook riset.
- **Akun**: daftar/masuk dengan **email + kata sandi**, **Google**, atau **GitHub**; data lengkap (negara, provinsi/region, kota, kecamatan, desa, kode pos, telepon, usaha, peran, bahasa).
- Data tiap pengguna (favorit, keranjang, pesanan, dll.) tersimpan di server dan ikut ke perangkat lain.
- Ekspor/impor JSON & CSV, ID/EN.

## Menjalankan di localhost

Butuh **Node.js 20.12 atau lebih baru** ([nodejs.org](https://nodejs.org)).

```bash
git clone https://github.com/<akun-anda>/ecobriket.git
cd ecobriket
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm start
```

Buka **http://localhost:3000**. Daftar dengan email langsung bisa dipakai tanpa pengaturan tambahan.

Perintah lain: `npm run dev` (restart otomatis saat file berubah), `npm test` (uji API).

> Tanpa server, `public/index.html` juga bisa dibuka langsung di browser. Mode ini memakai profil lokal tanpa kata sandi; tombol Google/GitHub tidak aktif.

## Mengaktifkan masuk dengan Google (opsional)

1. Buka [Google Cloud Console](https://console.cloud.google.com/) → buat/pilih project.
2. **APIs & Services → OAuth consent screen**: isi nama aplikasi & email, tipe *External*, tambahkan diri Anda sebagai *test user*.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. *Authorized JavaScript origins*: `http://localhost:3000`
5. Salin **Client ID** ke `.env`: `GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com`, lalu restart `npm start`.

Client ID Google tidak rahasia, tetapi tetap simpan di `.env` agar mudah diganti per lingkungan.

## Mengaktifkan masuk dengan GitHub (opsional)

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. *Homepage URL*: `http://localhost:3000`
3. *Authorization callback URL*: `http://localhost:3000/api/auth/github/callback`
4. Salin **Client ID** dan buat **Client secret**, isi ke `.env` (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`), lalu restart.

**Client secret bersifat rahasia.** File `.env` sudah masuk `.gitignore`, jadi tidak ikut ter-push.

## Push ke GitHub

```bash
# sekali saja: buat repo kosong bernama "ecobriket" di github.com/new (tanpa README)
git init                      # lewati jika folder sudah repo git
git add .
git commit -m "EcoBriket v0.5"
git branch -M main
git remote add origin https://github.com/<akun-anda>/ecobriket.git
git push -u origin main
```

Sebelum push, pastikan `git status` **tidak** menampilkan `.env` atau `data/db.json`.

## Struktur

```
server/index.js     Express: API akun, OAuth, sinkron data, file statis
server/security.js  hash scrypt, token sesi, rate limit, cookie
server/validate.js  validasi profil & kata sandi
server/db.js        penyimpanan JSON atomik (data/db.json)
public/index.html   aplikasi (HTML/CSS/JS tanpa build)
test/api.test.js    uji API (node:test)
```

## API

| Metode | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/config` | penyedia login yang aktif + pengguna saat ini |
| POST | `/api/auth/register` | daftar email + kata sandi + profil |
| POST | `/api/auth/login` · `/logout` | masuk / keluar |
| POST | `/api/auth/google` | verifikasi ID token Google |
| GET | `/api/auth/github` | alur OAuth GitHub |
| PUT | `/api/auth/profile` · `/password` | ubah profil / kata sandi |
| DELETE | `/api/auth/account` | hapus akun & datanya |
| GET/PUT | `/api/state` | data aplikasi milik pengguna |

Permintaan yang mengubah data wajib membawa header `X-EcoBriket: 1` (perlindungan CSRF bersama cookie `SameSite=Lax`).

## Keamanan & batasan

- Kata sandi di-hash dengan **scrypt** + salt acak; sesi memakai token acak di cookie `HttpOnly`, disimpan sebagai hash SHA-256.
- Batas percobaan masuk/daftar: 10 kali per 15 menit.
- **Belum ada**: reset kata sandi lewat email, verifikasi email, 2FA, dan database sungguhan. `data/db.json` cocok untuk prototipe satu server, bukan untuk ribuan pengguna.
- Untuk dipakai publik: pasang HTTPS (ubah `BASE_URL` ke `https://…`, cookie otomatis `Secure`), ganti penyimpanan ke PostgreSQL/SQLite, dan cadangkan data rutin.
- Harga ditampilkan dalam Rupiah; belum ada konversi mata uang untuk pengguna luar negeri.

## Lisensi

MIT. Data jurnal tetap milik penulis masing-masing; lihat halaman Referensi.
