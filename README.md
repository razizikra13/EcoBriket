# EcoBriket

Katalog, pencari, dan alat produksi **briket bio-arang dari biomassa** (tempurung kelapa, cangkang sawit, sekam, serbuk gergaji, tongkol jagung, pinang, ampas penyulingan pala, dan campuran). Untuk pembeli, pemilik pabrik briket, pemasok biomassa, dan peneliti — di Indonesia maupun luar negeri.

> **Status: prototipe riset.** Nilai mutu briket berasal dari 17 jurnal (halaman *Referensi* di aplikasi) untuk bahan yang sejenis, bukan hasil uji produk di katalog. Profil pabrik, stok, harga, dan kontak adalah data contoh (studi kasus Meukek, Aceh Selatan). Tidak ada produk yang berstatus "Terverifikasi Lab SNI".

## Fitur

- Katalog & **Cari Briket** sesuai kebutuhan tungku (kg/hari, biaya/hari, lama nyala).
- Detail briket: 4 ilustrasi, simulasi nyala, tabel SNI 01-6235-2000 dengan sumber jurnal.
- Produksi 6 tahap, timer jemur, kalkulator formulasi & energi, planner, logbook riset.
- **Akun**: daftar/masuk dengan **email + kata sandi**, **Google**, atau **GitHub**; data lengkap (negara, provinsi/region, kota, kecamatan, desa, kode pos, telepon, usaha, peran, bahasa).
- Data tiap pengguna (favorit, keranjang, pesanan, dll.) tersimpan di server dan ikut ke perangkat lain.
- **3D interaktif** (Three.js, dibundel lokal): hero beranda bisa diputar dengan seret/tombol panah, tab 3D di halaman detail, dan foto katalog berupa render 3D per produk (latar warna per bahan baku). Otomatis kembali ke ilustrasi SVG bila WebGL tidak tersedia.
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
src/eco3d.js        sumber adegan 3D (Three.js) → public/js/eco3d.js
test/*.test.js      uji API & keamanan (node:test)
server/headers.js   header keamanan & CSP
scripts/build-headers.js  menulis vercel.json
vercel.json         header keamanan untuk Vercel
SECURITY.md         kebijakan & pemetaan OWASP
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

## Keamanan

Ringkasan lengkap dan pemetaan ke OWASP Top 10 ada di **[SECURITY.md](SECURITY.md)**. Intinya:

- Kata sandi di-hash **scrypt**, sesi token acak di cookie `HttpOnly` + `SameSite`, rotasi sesi saat login.
- Anti brute force: akun dikunci 15 menit setelah 5 kali salah; batas laju per IP.
- Anti XSS: escape keluaran + Content-Security-Policy berbasis hash (juga di Vercel lewat `vercel.json`).
- Anti CSRF, prototype pollution, CSV injection, path traversal; tidak ada SQL sehingga SQL injection tidak berlaku (aturan parameterized query sudah ditulis untuk migrasi database).
- 21 uji otomatis (`npm test`) termasuk 12 uji keamanan; `npm audit` = 0 celah.

Setelah mengubah `src/eco3d.js`, jalankan `npm run build` (bundel 3D + header). Setelah mengubah `public/index.html`, jalankan `npm run headers` agar hash CSP di `vercel.json` ikut diperbarui (kalau lupa, `npm test` akan gagal).

**Batasan:** belum ada verifikasi email, reset sandi lewat email, 2FA, dan database sungguhan. Untuk publik: pasang HTTPS dan database terkelola. Harga masih dalam Rupiah.

## Lisensi

MIT. Data jurnal tetap milik penulis masing-masing; lihat halaman Referensi.
