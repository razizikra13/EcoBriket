# SPEC.md — EcoBriket (sebelumnya SulingBriket)

**Katalog, pencari, dan alat produksi briket bio-arang dari biomassa lokal Aceh Selatan (acuan SNI 01-6235-2000)**
Lokasi kasus: Kecamatan Meukek, Kabupaten Aceh Selatan · Versi dokumen: 0.4 (EcoBriket: data jurnal, akun, ekspor/impor) · Status: draf untuk review tim

> **Catatan kejujuran data (v0.4).** Nilai mutu briket (kadar air, abu, zat terbang, nilai kalor, karbon terikat), lama bakar, harga acuan, produksi pala, dan rendemen minyak diambil dari **17 jurnal/laporan (R1–R17)** yang tercantum di halaman Referensi, lengkap dengan tautan. Nilai tersebut adalah nilai **literatur untuk bahan yang sama**, bukan hasil uji produk di katalog. Karena itu badge-nya "Potensi SNI (literatur)", bukan "Terverifikasi". **Tidak ada produk berstatus terverifikasi lab.** Untuk ampas penyulingan pala murni tidak ditemukan jurnal uji briket, sehingga nilainya diberi label *estimasi* dan aplikasi menampilkannya sebagai **celah riset**. Profil pabrik, stok, kontak, dan letak di peta tetap data contoh. Data contoh versi lama (DEMO-LAB fiktif) sudah dihapus.
---

## 1. Tujuan

| # | Tujuan | Ukuran keberhasilan MVP |
|---|---|---|
| T1 | Membantu pemilik penyulingan pala mengubah ampas menjadi briket bio-arang untuk dipakai sendiri di tungku ketel, sehingga kebutuhan kayu bakar berkurang | Pengguna bisa menghitung takaran dan memperkirakan penghematan kayu dalam waktu kurang dari 2 menit |
| T2 | Menstandarkan alur produksi 6 tahap agar mutu briket konsisten dan siap diuji ke laboratorium | Setiap batch bisa dilacak dari tahap 1 sampai 6, dengan tanggal dan beratnya tercatat |
| T3 | Menyediakan instrumen pencatatan riset *mixed methods* (data kuantitatif + kualitatif) untuk pendamping atau peneliti | Logbook bisa diisi, dirangkum, dan diekspor (CSV/JSON) |
| T4 | Memisahkan dengan tegas briket yang **hanya mengikuti panduan takaran mandiri** dari briket yang **sudah terverifikasi lulus uji lab terakreditasi** | Status "Terverifikasi Lab" hanya bisa disimpan jika nomor laporan uji dan nama lab diisi |
| T6 | **(Fokus v0.2)** Menyediakan katalog bio-arang/briket dari berbagai biomassa (ampas pala, tempurung kelapa, cangkang sawit, sekam, serbuk gergaji, tongkol jagung, sabut pinang, campuran) dan membantu pengguna memilih briket sesuai kebutuhan bahan bakarnya | Pengguna mendapat daftar briket terurut beserta kg/hari, biaya/hari, dan frekuensi isi ulang dalam < 1 menit |
| T5 | Menghubungkan pemilik pabrik, sentra briket, pengumpul ampas, dan pengguna bio-arang | Katalog, filter, favorit, dan tombol WhatsApp (mode demo) berfungsi |

## 2. Pengguna & Kebutuhan Utama

| Persona | Kebutuhan | Fitur kunci |
|---|---|---|
| **Pemilik pabrik penyulingan** (literasi digital beragam, akses dari smartphone) | Tahu berapa kayu dan uang yang bisa dihemat; jadwal suling dan briket yang realistis | Kalkulator energi, Planner, Rekomendasi skema |
| **Operator produksi briket** | Panduan langkah demi langkah, timer penjemuran 24 jam, takaran tapioka | Panduan 6 tahap, Tracker batch, Timer, Kalkulator formulasi |
| **Pembeli / mitra UMKM pengguna bio-arang** (ketel suling, industri kecil, usaha makanan, rumah tangga) | Briket yang sesuai tungkunya: berapa lama nyala, berapa kg per hari, berapa biayanya, apakah sudah SNI | Cari Briket, Katalog Briket, detail briket + tabel SNI, WhatsApp demo |
| **Peneliti / pendamping program** | Catat observasi kuantitatif dan wawancara, ekspor data | Logbook mixed methods, Dashboard CRUD, ekspor |

## 3. Daftar Fitur MVP

| ID | Fitur | Deskripsi fungsional | Prioritas |
|---|---|---|---|
| F01 | Landing page edukasi | Hero, masalah kayu bakar, diagram alur sirkular (ampas → briket → tungku → abu kembali ke kebun), 6 tahap singkat, acuan parameter SNI 01-6235-2000, CTA ke kalkulator | Wajib |
| F02 | Katalog pabrik/sentra | Minimal 12 profil contoh di gampong Meukek; kartu berisi ilustrasi, kategori, gampong, kapasitas ampas, kebutuhan kayu, status briket | Wajib |
| F03 | Kategori operasional | `penyulingan-mandiri`, `sentra-briket`, `pengumpul-ampas`, `mitra-pengguna` | Wajib |
| F04 | Detail pabrik | Ilustrasi, deskripsi, kapasitas suling, gampong, estimasi ampas/hari, fasilitas tungku dan mesin cetak, status briket SNI, label "data contoh / belum diverifikasi", tautan Google Maps, favorit, WhatsApp demo | Wajib |
| F05 | Panduan + tracker 6 tahap | Panduan per tahap (tujuan, langkah, indikator selesai, keselamatan). Tracker batch: maju/mundur tahap, riwayat waktu per tahap, progress bar | Wajib |
| F06 | Timer jemur 24 jam + cuaca simulasi | Mulai/jeda/reset, persisten setelah reload; mode percepat (×60, ×360); cuaca simulasi per jam (cerah/berawan/hujan) dengan faktor efektivitas; menampilkan "jam jemur efektif" | Wajib |
| F07 | Kalkulator formulasi briket | Input: berat ampas basah, kadar air awal dan setelah jemur, rendemen karbonisasi, susut giling, % tapioka, rasio air lem, kadar air akhir. Output: berat setelah jemur, arang, bubuk, tapioka, air lem, adonan, briket kering, rendemen total. Simpan riwayat, terapkan ke batch | Wajib |
| F08 | Kalkulator energi & penghematan kayu | Input: kayu per siklus (m³), siklus/bulan, harga kayu, densitas, nilai kalor kayu dan briket, % substitusi, biaya briket/kg, faktor emisi, fNRB. Output: kayu dihemat (m³, kg), briket dibutuhkan (kg), biaya kayu dihemat, biaya briket, selisih biaya, estimasi CO₂ dihindari | Wajib |
| F09 | Katalog Briket Bio-Arang (v0.2) | Kartu menampilkan bahan baku biomassa, bentuk, **lama bakar (menit/butir + berat butir)**, nilai kalor (berlabel estimasi bila bukan uji lab), tingkat asap, harga/kg, stok, status mutu, dan badge DEMO. Filter: teks, bahan baku, penggunaan, status SNI, **lama bakar minimum**, gampong. Sort: nama, lama bakar terlama, nilai kalor tertinggi, harga, stok. Produk UMKM non-briket (minyak pala, manisan) dihapus dari katalog | Wajib |
| F20 | **Cari Briket sesuai kebutuhan bahan bakar** | Input: penggunaan (ketel suling, industri kecil, tungku usaha, bakar ikan/sate, rumah tangga), jam pemakaian/hari, jumlah tungku, stok untuk N hari, minimal lama nyala per butir, anggaran/hari, bahan baku pilihan; syarat **wajib**: asap rendah, terverifikasi lab SNI. Output per produk: kg/hari, biaya/hari, total N hari, isi ulang tiap ± menit, skor kecocokan berbobot, checklist alasan; produk yang gagal syarat wajib dipisah | Wajib |
| F21 | **Detail briket + spesifikasi SNI** | Deskripsi briket, bahan baku, ukuran & berat, lama bakar, nilai kalor, asap, cocok untuk, cara pakai, produsen, harga, stok. Tabel SNI 01-6235-2000: parameter, batas, nilai, ✓/✗, sumber nilai (estimasi / literatur + ref / uji mandiri / lab), nomor laporan, lab, tanggal uji. Kalkulator kebutuhan mini (kg/hari, biaya, laju bakar, butir/jam) | Wajib |
| F10 | Pencarian, filter, sorting | Teks bebas (nama/deskripsi/gampong), filter gampong, filter kategori/bentuk, filter status, sort (nama, kapasitas, kebutuhan kayu, harga) | Wajib |
| F11 | Peta ilustratif SVG | Siluet pesisir Meukek (ilustratif), titik pabrik berwarna sesuai kategori, klik titik → ringkasan + tautan Google Maps `maps/search/?api=1&query=…` (tanpa API key) | Wajib |
| F12 | Favorit / pantauan | Toggle di kartu dan detail (pabrik dan produk), halaman Favorit, tersimpan di localStorage | Wajib |
| F13 | Production & Distillation Planner | 1–7 hari: pilih pabrik, tanggal mulai, siklus suling/hari, % substitusi target; keluaran jadwal harian (suling, jemur awal, karbonisasi, giling, campur, cetak, jemur akhir), ampas masuk, briket siap, kayu tersubstitusi; simpan rencana | Wajib |
| F14 | Rekomendasi skema (rule-based) | Input: kapasitas ketel, siklus/minggu, target pengurangan kayu, ketersediaan mesin cetak, tenaga kerja. Aturan menyaring `SkemaPemanfaatan` dan menampilkan alasan lolos/gagal setiap aturan | Wajib |
| F15 | Logbook riset mixed methods | Kuantitatif: % pengurangan kayu, rendemen briket, suhu tungku. Kualitatif: catatan wawancara, kendala lapangan, kode tema. Ringkasan statistik (n, rata-rata, min/max), frekuensi tema, ekspor CSV/JSON | Wajib |
| F16 | WhatsApp mode demo | Modal pratinjau pesan; membuka `https://wa.me/?text=…` **tanpa nomor** agar tidak mengirim ke nomor nyata yang kebetulan cocok | Wajib |
| F17 | Bahasa ID/EN | Semua label antarmuka, navigasi, kategori, dan status diterjemahkan. Konten deskriptif data contoh tetap berbahasa Indonesia di MVP | Wajib |
| F18 | Dashboard CRUD | Tab Pabrik, Batch, Produk, Logbook, Skema: tambah/ubah/hapus, validasi wajib isi, aturan status SNI, reset data demo, ekspor/impor JSON | Wajib |
| F19 | Persistensi localStorage | Kunci `ecobriket:v1` berisi seluruh koleksi + pengaturan (bahasa, timer, riwayat kalkulasi, rencana) | Wajib |

### 3.1 Aturan status mutu (berlaku di seluruh aplikasi)

| Kode | Label ID | Arti | Syarat simpan |
|---|---|---|---|
| `mandiri` | Panduan Mandiri — belum diuji lab | Dibuat mengikuti takaran panduan aplikasi | — |
| `proses-uji` | Sampel sedang/akan diuji lab | Sampel sudah atau akan dikirim ke lab | Nama lab tujuan diisi |
| `terverifikasi` | Terverifikasi Lab SNI 01-6235-2000 | Ada laporan uji dari lab terakreditasi | **Nomor laporan uji + nama lab wajib diisi**; badge menampilkan sumbernya |

Produk hanya bisa disimpan sebagai `terverifikasi` bila: `uji.sumber` = `lab`, nomor laporan dan nama lab terisi, keempat parameter SNI terisi, **dan semua nilainya memenuhi batas SNI**. Jika ada parameter yang gagal, penyimpanan ditolak.

Pabrik hanya bisa berstatus `terverifikasi` bila memiliki minimal satu batch berstatus `lulus-lab` yang `refUjiLab`-nya terisi.

Sejak v0.4 tidak ada produk `terverifikasi` di data contoh; `uji.sumber` hanya bisa `estimasi`, `literatur`, `uji-mandiri`, atau `lab`, dan hanya `lab` yang membuka status terverifikasi. Aplikasi tidak pernah menghitung "lulus SNI" secara otomatis. Kalkulator hanya menampilkan "target parameter" sebagai panduan.

**Parameter acuan SNI 01-6235-2000 (Briket Arang Kayu)** — harus diverifikasi ulang tim pada dokumen BSN sebelum dikutip di proposal [kemungkinan besar]: kadar air ≤ 8%, bagian hilang pada pemanasan 950 °C (zat terbang) ≤ 15%, kadar abu ≤ 8%, nilai kalor ≥ 5.000 kal/g.

## 4. Data Model

Semua `id` berupa string (`pb-001`, `bt-…`). Tanggal disimpan dalam format ISO 8601. Field bertanda ➕ adalah tambahan di luar brief, dibuat untuk memenuhi batasan kejujuran data.

### PabrikPenyulingan
| Field | Tipe | Keterangan |
|---|---|---|
| id | string | |
| nama | string | Diawali "Contoh:" untuk data seed |
| kategori | enum | `penyulingan-mandiri` \| `sentra-briket` \| `pengumpul-ampas` \| `mitra-pengguna` |
| gampong | string | Salah satu gampong di Meukek |
| deskripsi | string | |
| imageUrl | string | Path lokal atau kosong; jika kosong dirender ilustrasi SVG |
| alamat | string | |
| mapsUrl | string | `https://www.google.com/maps/search/?api=1&query=…` |
| kapasitasAmpasKg | number | Ampas per hari (kg), simulasi |
| kebutuhanKayuKubik | number | m³ kayu per bulan, simulasi |
| fasilitasProduksi | string[] | mis. `ketel-suling`, `tungku-drum`, `penggiling`, `cetak-manual`, `cetak-mesin`, `rak-jemur` |
| statusBriketSni | enum | `belum` \| `mandiri` \| `proses-uji` \| `terverifikasi` |
| unggulan | boolean | |
| ➕ statusData | enum | `contoh` \| `belum-diverifikasi` \| `terverifikasi-lapangan` |
| ➕ petaX, petaY | number | Posisi 0–100 di peta ilustratif |
| ➕ kontak | string | Nomor demo; tidak dipakai sebagai tujuan WA |

### BatchProduksi
| Field | Tipe | Keterangan |
|---|---|---|
| id, pabrikId | string | FK → PabrikPenyulingan |
| tanggalMulai | date | |
| beratAmpasBasahKg | number | > 0 |
| durasiJemurAwalJam | number | Target 24 |
| beratArangKarbonisasiKg | number | |
| takaranTapiokaKg | number | |
| jumlahBriketJadiKg | number | |
| tahapSaatIni | int 1–6 | 7 = selesai |
| statusLolosSni | enum | `belum-diuji` \| `proses-uji` \| `lulus-lab` \| `tidak-lulus-lab` |
| ➕ refUjiLab | string | Wajib bila `lulus-lab` atau `tidak-lulus-lab` |
| ➕ riwayatTahap | {tahap, waktu}[] | Jejak waktu tiap tahap |

### ProdukBriket (v0.2)
| Field | Tipe | Keterangan |
|---|---|---|
| id, nama | string | |
| ➕ bahanBaku | enum | `ampas-pala` \| `tempurung-kelapa` \| `cangkang-sawit` \| `sekam-padi` \| `serbuk-gergaji` \| `tongkol-jagung` \| `kulit-pinang` \| `campuran` |
| kategoriBentuk | enum | `silinder-berlubang` \| `kubus` \| `bantal` \| `heksagonal` \| `curah-arang` |
| gampong | string | |
| ➕ produsenId | string? | FK → PabrikPenyulingan |
| hargaPerKg | number | Simulasi |
| ➕ stokKg | number | |
| ➕ beratButirGram | number | Wajib, > 0 (curah = 1000 per isian) |
| ➕ ukuran | string | |
| ➕ lamaBakarMenit | number | Wajib; lama nyala 1 butir sampai habis (estimasi/klaim, **tidak diatur SNI**) |
| ➕ tingkatAsap | enum | `rendah` \| `sedang` \| `tinggi` |
| ➕ cocokUntuk | enum[] | `ketel-suling` \| `industri-kecil` \| `tungku-usaha` \| `bbq` \| `rumah-tangga` |
| ➕ deskripsi, caraPakai | text | |
| imageUrl | string | |
| statusStandarSni | enum | `mandiri` \| `proses-uji` \| `terverifikasi` |
| sumberVerifikasi | string | Wajib bila `proses-uji` |
| ➕ uji | object | `{kadarAir, kadarAbu, zatTerbang, nilaiKalor, karbonTerikat, sumber, noLaporan, lab, tanggal}`; `sumber` = `estimasi` \| `literatur` \| `uji-mandiri` \| `lab`; `refId` menunjuk ke R1–R17; `nilaiKalor` wajib (boleh estimasi) |
| kontak | string | Demo |

### SkemaPemanfaatan
| Field | Tipe | Keterangan |
|---|---|---|
| id, nama, deskripsi | string | |
| durasiSiklusHari | number | |
| daftarPabrik | string[] | FK; diisi otomatis dari pabrik yang cocok dengan aturan |
| estimasiHematKayu | number | % (simulasi) |
| ➕ aturan | object | `{minKapasitasKg, maxKapasitasKg, minTarget, maxTarget, butuhMesinCetak, minTenagaKerja}` |

### LogbookRiset
| Field | Tipe | Keterangan |
|---|---|---|
| id, namaResponden | string | Gunakan kode responden (R01), bukan nama asli |
| gampong | string | |
| tanggalObservasi | date | |
| penguranganKayuPersen | number 0–100 | |
| suhuTungkuCelcius | number | |
| catatanKualitatif | text | |
| kendalaLapangan | text | |
| ➕ rendemenBriketPersen | number | Diminta brief di modul logbook |
| ➕ kodeTema | enum[] | `teknis`, `cuaca`, `ekonomi`, `tenaga-kerja`, `pasar`, `sosial` |

### Favorit
`id, itemId, tipeItem ('pabrik'|'produk'), tanggalDitambahkan`

### Rumus kalkulator (semua hasil diberi label *simulasi*)
```
Formulasi
  kering          = basah × (1 − KA_awal)
  setelahJemur    = kering / (1 − KA_jemur)
  arang           = kering × rendemenKarbonisasi
  bubuk           = arang × (1 − susutGiling)
  tapioka         = bubuk × %tapioka
  airLem          = tapioka × rasioAir
  adonan          = bubuk + tapioka + airLem
  briketKering    = (bubuk + tapioka) / (1 − KA_akhir)
  rendemenTotal   = briketKering / basah

Kebutuhan briket (Cari Briket)
  lajuAcuan[penggunaan] = ketel 6 · industri kecil 3 · tungku usaha 1,5 · bakar ikan 1 · rumah tangga 0,6   (kg/jam/tungku, briket 5.000 kal/g) [menebak]
  lajuProduk      = lajuAcuan × 5000 / nilaiKalorProduk
  kgHari          = lajuProduk × jam × jumlahTungku
  biayaHari       = kgHari × hargaPerKg
  butirPerJam     = lajuProduk × 1000 / beratButirGram
  skor            = Σ bobot syarat terpenuhi / Σ bobot  (cocok penggunaan 3, lama nyala 2, anggaran 2, stok 1, bahan baku 1)

Energi (per bulan)
  kayuKg          = m3PerSiklus × siklus × densitas
  energiKayu      = kayuKg × NK_kayu                 (MJ)
  kayuHemat_m3    = m3PerSiklus × siklus × %substitusi
  briketPerlu_kg  = energiKayu × %substitusi / NK_briket
  hematBiaya      = kayuHemat_m3 × hargaKayu − briketPerlu_kg × biayaBriket
  CO2dihindari    = kayuHemat_kg × EF_kayu × fNRB    (kg CO₂)
```
Nilai bawaan seperti KA awal ampas 55%, rendemen karbonisasi 30%, tapioka 5%, densitas tumpukan kayu 400 kg/m³, NK kayu 15 MJ/kg, NK briket 20 MJ/kg, EF 1,6 kg CO₂/kg, dan fNRB 0,5 adalah **tebakan awal** yang harus diganti dengan hasil uji lapangan atau literatur yang disepakati tim.

## 5. Nonfunctional Requirements

| Kategori | Persyaratan |
|---|---|
| Portabilitas | Prototype berupa satu file HTML yang bisa dibuka langsung (`file://`) tanpa server, tanpa CDN, tanpa font eksternal |
| Performa | Muat awal < 1 detik di laptop standar; interaksi filter < 100 ms untuk ≤ 500 item |
| Responsif | Breakpoint 360, 768, 1024 px; navigasi menjadi menu lipat di bawah 900 px; target sentuh ≥ 44 px |
| Aksesibilitas | Kontras teks ≥ 4.5:1, label pada semua input, fokus keyboard terlihat, `aria-live` pada hasil kalkulator, gambar memakai `alt`/`role="img"` |
| Privasi | Tanpa backend, tanpa login palsu, tanpa analitik; logbook memakai kode responden; data hanya di localStorage perangkat |
| Keamanan | Tidak ada API key; semua teks pengguna di-escape sebelum dirender (mencegah XSS lewat impor JSON); impor JSON divalidasi bentuknya |
| Ketahanan | Jika localStorage penuh atau rusak → fallback ke data seed + notifikasi; skema data berversi (`v1`) |
| Kejujuran data | Banner "Data simulasi" pada kalkulator, katalog, peta, kontak; badge status mutu konsisten di semua tampilan |
| Pemeliharaan | Versi produksi: Vite + JS vanilla dengan modul `data/`, `views/`, `lib/` (lihat §9); prototype mengikuti struktur logis yang sama dalam satu file |
| i18n | Kamus `{id, en}`; tidak ada string antarmuka yang di-hardcode di luar kamus |

## 6. Risiko

| # | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R1 | **Nilai bawaan kalkulator (KA ampas, rendemen karbonisasi, NK) belum diukur untuk ampas pala Meukek** | Angka penghematan bisa meleset jauh dan menyesatkan proposal | Semua parameter bisa diubah, diberi label "tebakan awal"; isi ulang dari uji 1 pabrik percontohan |
| R2 | Pengguna menganggap "mengikuti takaran" = "lulus SNI" | Klaim mutu palsu ke pembeli, risiko reputasi atau hukum | Tiga tingkat status, syarat bukti untuk status lab, tidak ada otomatisasi "lulus" |
| R3 | Data pabrik contoh dikira data nyata | Salah kutip dalam laporan atau lomba | Awalan "Contoh:", badge `statusData`, banner di katalog |
| R4 | Nomor WA demo kebetulan milik orang nyata | Pesan nyasar ke pihak ketiga | wa.me tanpa nomor; nomor hanya tampil sebagai teks demo |
| R5 | localStorage terhapus (ganti perangkat/browser, mode privat) | Logbook riset hilang | Tombol ekspor JSON/CSV menonjol; pengingat ekspor setiap 10 entri baru |
| R6 | Cuaca simulasi dianggap prakiraan nyata | Keputusan jemur salah | Label "simulasi"; versi lanjut bisa membaca BMKG (di luar MVP) |
| R7 | Tech stack brief (Vite) bertentangan dengan permintaan prototype tanpa instalasi | Kebingungan saat serah terima | Prototype = 1 HTML; SPEC §9 menjelaskan pemecahan ke modul Vite tanpa mengubah logika |
| R8 | Literasi digital pemilik pabrik rendah | Fitur tidak dipakai | Kalkulator 1 layar dengan nilai bawaan, ikon tahap, bahasa sederhana; pendamping mengisi logbook |
| R10 | **Tiga produk "contoh SNI" memakai hasil uji fiktif** | Bila tangkapan layar dipakai di proposal tanpa label, itu sama dengan memalsukan data uji | Badge merah "CONTOH TAMPILAN — hasil uji fiktif" di kartu, detail, dan hasil pencarian; nomor laporan berakhiran "(fiktif)"; ganti dengan hasil lab sungguhan sebelum dipublikasikan |
| R11 | Lama bakar dan laju bakar acuan tidak punya standar uji (tidak diatur SNI 01-6235-2000) | Rekomendasi kg/hari bisa meleset 2–3× tergantung tungku | Label simulasi + catatan; tetapkan protokol uji nyala sederhana (berat butir, jenis tungku, durasi sampai abu) untuk semua produsen |
| R12 | Pengguna menganggap skor kecocokan tinggi = produk bermutu | Salah pilih | Skor hanya mengukur kecocokan kebutuhan; status mutu tetap ditampilkan terpisah |
| R9 | Karbonisasi drum berisiko api dan asap | Keselamatan operator | Panduan tahap 2 memuat poin APD, jarak aman, dan pemadaman |

## 7. Out-of-Scope (MVP)

- Backend, sinkronisasi multi-perangkat, akun/login, dan peran pengguna
- Pembayaran, keranjang, atau transaksi nyata
- Integrasi Google Maps JS API, GIS nyata, atau koordinat survei
- Data cuaca nyata (BMKG/API) dan IoT/sensor suhu (memang diputuskan tidak dipakai)
- Penerbitan sertifikat, kalkulasi "lulus SNI" otomatis, atau perhitungan kredit karbon resmi
- Terjemahan konten data (deskripsi pabrik/produk) ke bahasa Inggris
- Upload foto ke server (gambar memakai ilustrasi SVG/lokal)

## 8. Acceptance Criteria (uji manual)

| ID | Langkah | Hasil yang diharapkan |
|---|---|---|
| AC01 | Buka file HTML langsung di Chrome/Firefox tanpa internet | Semua halaman tampil; tidak ada error di konsol |
| AC02 | Katalog Pabrik → ketik "Kuta" | Tampil 4 dari 12: tiga di Kuta Baro/Kuta Buloh, plus satu yang deskripsinya mengandung "peng**kuta**n" (pencocokan substring, tidak peka huruf besar/kecil); penghitung hasil diperbarui |
| AC03 | Pilih filter gampong "Ie Dingen" | Hanya pabrik di Ie Dingen yang tampil; kombinasi dengan pencarian bekerja (AND) |
| AC04 | Pilih kategori "Sentra Briket SNI" | Hanya kategori `sentra-briket` yang tampil |
| AC05 | Sort "Kapasitas ampas (terbesar)" | Urutan menurun berdasarkan `kapasitasAmpasKg` |
| AC06 | Katalog minimal 12 profil, ≥ 7 gampong berbeda | Terhitung di halaman katalog |
| AC07 | Kalkulator formulasi: 100 kg basah, KA 55%→15%, rendemen 30%, susut 5%, tapioka 5%, rasio air 10, KA akhir 8% | Kering 45 kg; setelah jemur ≈ 52,94 kg; arang 13,5 kg; bubuk 12,83 kg; tapioka ≈ 0,64 kg; air lem ≈ 6,41 kg; briket kering ≈ 14,64 kg; rendemen ≈ 14,6% |
| AC08 | Kalkulator energi: 2 m³/siklus, 8 siklus, Rp250.000/m³, 400 kg/m³, 15 & 20 MJ/kg, substitusi 40%, biaya briket Rp1.500/kg, EF 1,6, fNRB 0,5 | Kayu dihemat 6,4 m³ (2.560 kg); briket perlu 1.920 kg; biaya kayu dihemat Rp1.600.000; biaya briket Rp2.880.000; selisih −Rp1.280.000 (ditandai merah sebagai "belum hemat"); CO₂ 2.048 kg |
| AC09 | Buat batch baru → tekan "Tahap berikutnya" 6 kali | Tahap bergerak 1→6→Selesai; riwayat mencatat 6 cap waktu; reload tetap di tahap terakhir |
| AC10 | Timer: Mulai, mode ×360, tunggu ±4 detik, reload halaman | Waktu simulasi terus berjalan setelah reload; cuaca berganti per jam simulasi; jam efektif ≤ jam berlalu |
| AC11 | Tekan ♥ pada 2 pabrik dan 1 produk → buka Favorit → reload | 3 item tampil dan tetap ada setelah reload; hapus 1 → tersisa 2 |
| AC12 | Logbook: tambah entri (R01, Drien Jalo, 35%, rendemen 14%, 620 °C, catatan, kendala, tema "cuaca") | Muncul di daftar; ringkasan n bertambah; rata-rata diperbarui; frekuensi tema "cuaca" bertambah; ekspor CSV mengunduh file |
| AC13 | Klik tombol EN | Navigasi, judul, label form, kategori, dan status berbahasa Inggris; pilihan tersimpan setelah reload |
| AC14 | Rekomendasi: kapasitas 150 kg, target 25%, tanpa mesin cetak, tenaga kerja 2 | Skema untuk kapasitas kecil tanpa mesin cetak muncul di urutan teratas; skema yang butuh mesin cetak menampilkan alasan gagal |
| AC15 | Dashboard → Pabrik → Tambah → simpan dengan nama kosong | Ditolak dengan pesan validasi |
| AC16 | Dashboard → Produk → ubah status ke "Terverifikasi Lab" tanpa nomor laporan | Ditolak: sumber nilai harus lab, nomor laporan & nama lab wajib, nilai uji wajib lengkap |
| AC16b | Dashboard → Produk sekam padi → status Terverifikasi, sumber lab, laporan & lab diisi, kadar air 6, zat terbang 12 (abu 22, NK 3.800 sudah ada) | Ditolak: "Hasil uji tidak memenuhi SNI…: Kadar abu, Nilai kalor" |
| AC17 | Dashboard → edit nama pabrik → buka katalog | Nama baru tampil; hapus pabrik → hilang dari katalog, peta, dan favorit |
| AC18 | Peta → klik titik | Muncul ringkasan dan tautan Google Maps yang membuka tab baru dengan query nama gampong + Meukek |
| AC19 | Planner 3 hari, 2 siklus/hari → Buat rencana → Simpan → reload | Tabel 3 hari dengan aktivitas suling, jemur, karbonisasi, dll.; rencana tersimpan |
| AC20 | Klik WhatsApp di detail produk | Modal pratinjau dengan label "mode demo"; tombol membuka `wa.me/?text=` tanpa nomor |
| AC21 | Dashboard → Reset data demo | Kembali ke 12 pabrik seed; favorit dan logbook dikosongkan setelah konfirmasi |
| AC23 | Beranda → klik kartu "Tempurung kelapa" di bagian biomassa | Katalog Briket terbuka dengan filter bahan baku = tempurung kelapa (2 produk) |
| AC24 | Katalog Briket → lama bakar min 150 | Tampil 4 produk dengan lama bakar ≥ 150 menit/butir; setiap kartu menampilkan lama bakar & berat butir |
| AC25 | Katalog Briket → Penggunaan "Ketel suling" | 4 produk; sort "Lama bakar (terlama)" menaruh briket tempurung silinder industri (270 menit) di atas |
| AC26 | Cari Briket → Ketel suling, 8 jam, 1 tungku, centang "Wajib terverifikasi lab SNI" | "3 briket memenuhi syarat wajib"; tiap kartu menampilkan kg/hari, biaya/hari, total 7 hari, isi ulang tiap ± menit, dan checklist; produk lain ada di bagian "Tidak memenuhi syarat wajib" |
| AC27 | Buka detail briket contoh SNI (pr-03) | Tabel SNI: 4 parameter dengan batas, nilai, ✓; karbon terikat sebagai info; sumber nilai "Contoh tampilan — fiktif"; banner merah DEMO; kalkulator kebutuhan menghitung kg/hari saat input diubah |
| AC28 | Detail briket sekam padi (pr-06) | Kadar abu 22% ditandai ✗ (estimasi), nilai kalor 3.800 ✗ (estimasi), catatan bahwa estimasi bukan hasil uji |
| AC22 | Lebar layar 375 px | Tidak ada scroll horizontal; menu lipat berfungsi; kartu satu kolom |

## 9. Implementation Plan per Iterasi

Struktur target versi Vite (prototype HTML tunggal mengikuti pembagian logis yang sama):
```
src/
  main.js            router hash + bootstrap
  lib/store.js       localStorage, versi skema, seed, ekspor/impor
  lib/i18n.js        kamus id/en, t()
  lib/calc.js        formulasi, energi (fungsi murni → mudah diuji)
  lib/rules.js       rekomendasi skema
  data/seed.js       12 pabrik, produk, skema
  views/*.js         home, katalog, detail, produksi, kalkulator, stok, peta, planner, rekomendasi, logbook, favorit, dashboard
  styles/*.css       token warna, komponen
```

| Iterasi | Durasi | Lingkup | Selesai bila |
|---|---|---|---|
| **I0 — Fondasi** | 1 hari | Token desain, layout, router hash, store + seed, i18n dasar | AC01, AC13 lulus |
| **I1 — Katalog & Peta** | 2 hari | F02–F04, F10–F12, F16 | AC02–AC06, AC11, AC18, AC20 |
| **I2 — Produksi** | 2 hari | F05–F07, batch tracker, timer + cuaca simulasi | AC07, AC09, AC10 |
| **I3 — Energi & Perencanaan** | 2 hari | F08, F13, F14 | AC08, AC14, AC19 |
| **I4 — Riset & Admin** | 2 hari | F15, F18, ekspor/impor, validasi status SNI | AC12, AC15–AC17, AC21 |
| **I4b — Katalog bio-arang (v0.2)** | 2 hari | F09 baru, F20, F21, validasi SNI berbasis nilai | AC16b, AC23–AC28 |
| **I5 — Polishing & Uji** | 1–2 hari | Responsif, aksesibilitas, pengujian lintas browser, unit test `calc.js` dan `rules.js` (Vitest), migrasi ke Vite | AC22 + seluruh AC diulang |
| **I6 — Validasi lapangan** (pascalomba) | — | Ganti nilai bawaan dengan data uji 1 pabrik percontohan; tandai pabrik `terverifikasi-lapangan` setelah kunjungan | Parameter tebakan berkurang |

---

## 10. Pembaruan v0.3 — Gaya organik, interaksi, dan aset visual briket

**Gaya:** Organic Biophilic (hasil rekomendasi skill UI/UX), mengikuti referensi e-commerce organik. Latar terang hijau mint, kartu putih membulat 18–28 px, banner hijau tua, ikon garis SVG (tanpa emoji), animasi reveal saat scroll yang menghormati `prefers-reduced-motion`. Font memakai Space Grotesk/Inter bila terpasang, dengan fallback font sistem agar tetap bisa dibuka offline.

| ID | Fitur | Keterangan |
|---|---|---|
| F22 | Beranda gaya e-commerce | Hero dengan ilustrasi kemasan + briket, baris kepercayaan, kategori biomassa (8 ilustrasi bahan), briket unggulan, banner Cari Briket, penggunaan, simulasi nyala, carousel "nyala terlama", alasan memilih, 3 artikel edukasi (termasuk keselamatan karbon monoksida), band produsen, footer 4 kolom |
| F23 | Generator ilustrasi briket | Setiap produk punya 4 tampilan SVG yang dibangkitkan dari bentuk + dimensi (`lebarMm`, `tinggiMm`): **Produk** (di atas nampan + bahan asalnya), **Kemasan** (pouch kraft berlabel), **Ukuran** (skala nyata dengan garis ukur + koin Rp1.000 Ø ±24 mm), **Menyala** (bara + api beranimasi). Diberi label "ilustrasi, bukan foto" |
| F24 | Simulasi nyala interaktif | Putar/jeda/geser waktu; fase penyalaan → bara stabil → meredup → abu; waktu disesuaikan `lamaBakarMenit`; penanda isi ulang ±60%. Pembagian fase adalah asumsi dan diberi label |
| F25 | Pesanan (keranjang demo) | Tambah dari kartu/detail/quick view, stepper kg, total harga, akumulasi jam nyala, kirim sebagai pesan WhatsApp tanpa nomor tujuan |
| F26 | Bandingkan (maks. 3) | Bar mengambang, halaman perbandingan dengan nilai terbaik per baris, biaya per jam nyala dihitung ulang sesuai penggunaan |
| F27 | Lihat cepat & pencarian global | Modal quick view dengan 4 tampilan; pencarian produk + produsen dari ikon kaca pembesar (Enter membuka hasil pertama) |

**Sengaja tidak ditiru dari referensi:** rating bintang, testimoni pelanggan, dan kode diskon. Tanpa data nyata, ketiganya sama dengan mengarang ulasan. Penggantinya adalah meter lama bakar, artikel edukasi, dan banner Cari Briket.

| ID | Langkah | Hasil |
|---|---|---|
| AC29 | Beranda → "Lihat cepat" pada kartu → tombol "Menyala" | Modal terbuka; gambar berganti ke tampilan bara |
| AC30 | Tambah 2 produk → ikon tas → tombol + pada item pertama | Badge tas = 2; kg item pertama = 2; total diperbarui |
| AC31 | Pesanan → Kirim via WhatsApp | Tautan `wa.me/?text=` tanpa nomor, berisi daftar item dan total |
| AC32 | Katalog → tekan ikon bandingkan di 4 kartu | Kartu ke-4 ditolak (maks. 3); halaman Bandingkan menandai nilai terbaik |
| AC33 | Detail pr-05 → tab Ukuran | Silinder Ø 70 × 120 mm digambar berdampingan dengan koin Rp1.000 pada skala yang sama |
| AC34 | Detail → Simulasi → geser ke 70% | Fase "Meredup"; waktu = 0,7 × lama bakar |
| AC35 | Lebar 375 px di semua halaman utama | Tanpa scroll horizontal; menu lipat menampilkan semua tautan |

---

## 11. Pembaruan v0.4 — EcoBriket: app siap pakai, data jurnal, akun, ekspor/impor

**Ganti nama:** SulingBriket → **EcoBriket**, tagline "Bio-arang biomassa lokal · Aceh Selatan". Fokusnya bergeser dari satu bahan (ampas pala) ke briket dari berbagai biomassa; ampas pala tetap jadi bahan unggulan lokal.

### 11.1 Fitur baru

| ID | Fitur | Keterangan |
|---|---|---|
| F28 | Data Jurnal | Grafik batang per parameter (KA, abu, zat terbang, nilai kalor, karbon terikat, lama bakar) untuk 8 bahan, dengan garis batas SNI. Klik batang untuk melihat sumber, urutkan, tabel ringkas. Ada estimator residu Meukek: produksi pala × % ampas × rendemen → potensi briket/tahun |
| F29 | Referensi | 17 sumber (R1–R17): penulis, topik, data yang dipakai, tautan. Cari, sorot via `?id=`, salin sitasi, ekspor CSV |
| F30 | Potensi SNI (literatur) | Badge dihitung dari nilai literatur bahan yang sama. Teksnya selalu menyebut "literatur", bukan verifikasi produk |
| F31 | Akun / profil | Daftar (nama, peran, gampong, email opsional, persetujuan), masuk dengan memilih profil, ubah profil, ekspor data saya, hapus profil. Data pribadi (favorit, keranjang, bandingkan, pesanan) dipisah per profil. **Tanpa kata sandi**, dan ini dinyatakan di layar |
| F32 | Sinkron cloud (opsional) | Bila dibuka di Claude dan sudah masuk, data disimpan privat di `data/users/<id>/app`; ada indikator status. Bila tidak tersedia, aplikasi tetap jalan dengan localStorage |
| F33 | Pusat Ekspor/Impor | Cadangan JSON penuh beserta pratinjau restore; ekspor CSV per tabel (pabrik, batch, produk, logbook, skema, pesanan, referensi); impor CSV dengan templat, tempel atau unggah, pratinjau, validasi per baris, mode tambah atau ganti |
| F34 | Riwayat pesanan | Status (draf → dikirim → diproses → selesai/batal), pesan ulang, kirim ulang WhatsApp tanpa nomor, ekspor CSV |
| F35 | Aktivitas & tur | Lonceng aktivitas (batch, CRUD, rencana, logbook beserta pelakunya); tur 3 langkah untuk pengguna baru; pintasan sesuai peran di beranda; tombol `/` untuk pencarian |
| F36 | Dialog dalam halaman | `confirm/alert` diganti modal sendiri, unduhan memakai cadangan salin-teks, sehingga berfungsi di sandbox artefak |

### 11.2 Tambahan data model

`User {id, nama, peran: pembeli|pabrik|produsen|peneliti, gampong, email?, dibuat}`, `Order {id, by, items[{id,kg}], total, status, dibuat}`, `Activity {t, by, msg}`, `Ref {id, a, topik, url, data}`, `uji.refId` pada ProdukBriket, `udata[userId]` untuk koleksi pribadi.

### 11.3 Acceptance criteria tambahan

| ID | Langkah | Hasil |
|---|---|---|
| AC36 | Akun → Daftar tanpa nama atau tanpa centang persetujuan | Ditolak dengan pesan di field |
| AC37 | Daftar 2 profil, tambah favorit di profil A, pindah ke B | Favorit B kosong; kembali ke A, favorit muncul lagi |
| AC38 | Ekspor/Impor → unduh templat CSV produk → impor 1 baris valid + 1 baris tanpa nama | 1 diterima, 1 ditolak dengan nomor baris |
| AC39 | Cadangan JSON → reset demo → pulihkan | Data kembali sama seperti sebelum reset |
| AC40 | Data Jurnal → parameter Nilai kalor | Garis SNI 5.000 kal/g tampil; sekam (2.789) di bawah garis, sawit (6.674) di atas |
| AC41 | Detail produk tempurung → tabel SNI | Kolom sumber menulis "literatur" dengan tautan R2; tidak ada kata "terverifikasi" |
| AC42 | Dashboard → ubah produk ke terverifikasi dengan sumber literatur | Penyimpanan ditolak; hanya sumber `lab` + no. laporan + nilai lulus yang diterima |
| AC43 | Checkout keranjang | Pesanan baru di Riwayat pesanan berstatus draf; WhatsApp tanpa nomor |
| AC44 | Lebar 375, 1280, 1366, 1440 px | Tanpa scroll horizontal; header muat |

### 11.4 Batasan yang tetap berlaku

- Tidak ada backend sendiri dan tidak ada login berpassword. Profil lokal hanya pemisah data di satu perangkat.
- Sinkron cloud hanya aktif saat dibuka di Claude oleh pengguna yang sudah masuk.
- Lama bakar per produk: sebagian dari jurnal (tempurung 141–146 menit, serbuk 108 menit, campuran 116 menit), sisanya estimasi berlabel.
- Ampas penyulingan pala: belum ada data uji, jadi harus diuji (proksimat + bom kalorimeter) sebelum diklaim memenuhi SNI.

---

## 12. Pembaruan v0.5 — Server localhost, akun berkata sandi & OAuth, cakupan luas

- **Arsitektur:** Node.js + Express (`server/`), aplikasi tetap satu file `public/index.html`. Tanpa server, aplikasi jatuh ke mode lokal (profil tanpa kata sandi) atau mode Claude (sinkron akun Claude).
- **Akun:** daftar/masuk email + kata sandi (scrypt, sesi cookie HttpOnly), Google Identity Services (ID token diverifikasi di server), GitHub OAuth. Tombol OAuth tampil nonaktif dengan keterangan bila kunci belum diisi di `.env`. Akun OAuth baru diarahkan ke "Lengkapi profil".
- **Data pendaftaran internasional:** nama, email, negara (±249 kode ISO, nama dari `Intl.DisplayNames`), provinsi (38 provinsi Indonesia sebagai pilihan; isian bebas untuk negara lain), kabupaten/kota, kecamatan/distrik, desa/kelurahan, kode pos, alamat, telepon (kode negara terisi otomatis untuk 34 negara), nama & jenis usaha, peran, bahasa, zona waktu, persetujuan privasi.
- **Peran:** Pembeli · **Pemilik pabrik briket** (sebelumnya pemilik penyulingan pala) · **Pemasok biomassa** (sebelumnya produsen UMKM, diganti agar tidak tumpang tindih) · Peneliti.
- **Cakupan:** teks aplikasi diubah dari "Aceh Selatan" menjadi untuk pengguna di mana pun; Meukek tetap sebagai studi kasus data contoh.

| ID | Langkah | Hasil |
|---|---|---|
| AC45 | `npm install && npm start`, buka localhost:3000 → Akun → Daftar dengan isian lengkap | Akun dibuat, langsung masuk, profil tampil |
| AC46 | Pilih negara Indonesia lalu Malaysia | Provinsi berubah dari dropdown 38 provinsi menjadi isian bebas; kode telepon menyesuaikan |
| AC47 | Tambah favorit → keluar → masuk lagi | Setelah keluar, data browser kosong; setelah masuk, favorit kembali dari server |
| AC48 | Masuk dengan kata sandi salah | Ditolak "Email atau kata sandi salah" |
| AC49 | `.env` tanpa GOOGLE_CLIENT_ID | Tombol Google nonaktif berlabel "belum dikonfigurasi"; endpoint menjawab 501 |
| AC50 | `git status` setelah menjalankan aplikasi | `.env` dan `data/db.json` tidak muncul |

---

## 13. Pembaruan v0.6 — Pengamanan (OWASP Top 10)

Detail di `SECURITY.md`. Tambahan: CSP berbasis hash + header keamanan (Express & `vercel.json`), scrypt N=2¹⁵ r=8 p=3 dengan rehash otomatis, penguncian akun 5×/15 menit, batas laju API, anti enumerasi, rotasi sesi, keluar dari semua perangkat, cek tipe input (perbaikan *type confusion* kata sandi berupa array), anti prototype pollution, penolakan markup di profil, daftar kata sandi umum, anti CSV injection, log kejadian keamanan, `npm audit` 0 celah (google-auth-library 11). 12 uji keamanan baru di `test/security.test.js`.
