# Keamanan EcoBriket

Dokumen ini memetakan langkah keamanan EcoBriket ke **OWASP Top 10 (2021)** dan **OWASP ASVS**. Semua butir yang ditandai ✅ dibuktikan oleh uji otomatis di `test/security.test.js` dan `test/api.test.js` (`npm test`).

## Melaporkan celah

Jangan buka *issue* publik. Kirim email ke pengelola repo (lihat profil GitHub) dengan langkah reproduksi. Kami usahakan membalas dalam 7 hari.

## Ringkasan perlindungan

| Risiko (OWASP) | Perlindungan | Bukti uji |
|---|---|---|
| **A03 Injection — SQL/NoSQL** | Aplikasi **tidak memakai SQL**; data disimpan sebagai objek JSON dan dicari dengan perbandingan nilai (`===`), bukan query string. Input dicek tipenya (string saja), sehingga payload seperti `' OR 1=1 --` atau `{"$ne": null}` hanya dianggap teks biasa. **Aturan bila nanti pindah ke PostgreSQL/MySQL: wajib parameterized query** (`pool.query('... WHERE email = $1', [email])`), dilarang menyambung string. | ✅ SQL/NoSQL injection |
| **A03 Injection — XSS** | Semua data pengguna di-escape (`esc()`) sebelum masuk HTML; server menolak `<`, `>`, `javascript:`, `on…=` pada isian profil; **Content-Security-Policy** tanpa `'unsafe-inline'` untuk skrip (pakai hash SHA-256), `object-src 'none'`, `base-uri 'self'`. | ✅ XSS, ✅ header CSP |
| **A03 Injection — CSV/formula** | Ekspor CSV memberi awalan `'` pada sel yang diawali `= + - @` agar Excel tidak menjalankan rumus. | — (UI) |
| **A01 Broken Access Control** | Data tiap pengguna disimpan per `userId` dan hanya bisa dibaca pemilik sesi; endpoint sensitif wajib sesi (`needUser`); file statis menolak dotfile & path traversal. | ✅ data terpisah, ✅ path traversal |
| **A01 CSRF** | Cookie `SameSite=Lax`; permintaan yang mengubah data wajib header `X-EcoBriket: 1`, `Content-Type: application/json`, Origin sama, dan bukan `Sec-Fetch-Site: cross-site`. | ✅ CSRF |
| **A02 Cryptographic Failures** | Kata sandi di-hash **scrypt** (N=2¹⁵, r=8, p=3, salt 16 byte acak), dibandingkan dengan `timingSafeEqual`; hash lama dihitung ulang otomatis. Token sesi 256-bit acak, disimpan di server sebagai SHA-256. HSTS + cookie `Secure`/`__Host-` saat HTTPS. | ✅ hash & token tidak polos |
| **A04 Insecure Design** | Penguncian akun 5× salah/15 menit; batas laju per IP (login 30/15 mnt, daftar 10/15 mnt, API 300/5 mnt); pesan login sama untuk email tak terdaftar & sandi salah (anti enumerasi); daftar kata sandi umum ditolak. | ✅ brute force, ✅ enumerasi, ✅ sandi umum |
| **A05 Security Misconfiguration** | Header: CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-*`; `X-Powered-By` dimatikan; error tidak menampilkan stack trace; JSON rusak/terlalu besar dijawab 400/413. Header yang sama berlaku di Vercel lewat `vercel.json`. | ✅ header, ✅ error |
| **A06 Vulnerable Components** | Hanya 2 dependensi langsung; `npm audit` = 0 celah saat rilis. Jalankan `npm run audit` berkala. | `npm audit` |
| **A07 Identification & Auth** | Sandi min. 8 karakter berisi huruf + angka, maks. 128; rotasi sesi saat login (anti session fixation); ganti sandi mengeluarkan sesi lain; tombol "Keluar dari semua perangkat"; Google ID token diverifikasi di server (audience + email terverifikasi); OAuth GitHub memakai parameter `state`. | ✅ |
| **A08 Data Integrity** | Body JSON dibuang kuncinya `__proto__`/`constructor`/`prototype` (anti prototype pollution); hanya field yang dikenal yang disimpan. | ✅ prototype pollution |
| **A09 Logging & Monitoring** | Kejadian keamanan (login gagal, akun terkunci, CSRF ditolak, ganti sandi, hapus akun) dicatat sebagai JSON tanpa kata sandi, email disamarkan. | log server |
| **A10 SSRF** | Server hanya memanggil URL tetap milik Google/GitHub; tidak ada URL dari input pengguna. | — |

## Yang **belum** dilindungi (jujur)

- **Versi Vercel saat ini statis**: server tidak berjalan di sana, jadi perlindungan login/CSRF/penguncian di atas baru aktif saat dijalankan dengan `npm start`. Yang aktif di Vercel: header keamanan & CSP (`vercel.json`), escape XSS, dan perlindungan CSV.
- Belum ada verifikasi email, reset kata sandi lewat email, dan 2FA.
- Batas laju disimpan di memori: hilang saat restart dan tidak dibagi antar-instance.
- `data/db.json` tidak terenkripsi. Untuk produksi: database terkelola dengan enkripsi at-rest dan cadangan rutin.
- Data di mode lokal (tanpa server) tersimpan di `localStorage` browser tanpa enkripsi.
- Belum ada uji penetrasi oleh pihak ketiga.

## Checklist sebelum rilis

```bash
npm run headers   # perbarui hash CSP di vercel.json setelah mengubah index.html
npm test          # uji fungsi + keamanan
npm run audit     # cek celah dependensi
```

Pastikan `.env` dan `data/*.json` tidak ikut di-commit (`git status`).
