# Template Spreadsheet — Modul 3

File ini adalah **referensi bentuk spreadsheet** yang dipakai di seluruh Modul 3, baik di `contoh.js` maupun di soal-soal `latihan.md`. Tujuan: peserta tidak menebak-nebak struktur — semua tab, header, dan sample data sudah disepakati di sini.

> Apps Script bekerja dengan **Google Sheet native**. Langkah Anda: bikin 1 Sheet baru, bikin tab sesuai daftar di bawah, copy header & sample data, lalu copy ID Sheet untuk set ke `SHEET_ID` di kode.

---

## Cara Setup Cepat

1. Buka [https://sheets.google.com](https://sheets.google.com), klik **Blank** untuk Sheet baru.
2. Rename Sheet jadi **"Modul-3-Sheets-Automation"**.
3. Bikin tab sesuai daftar di **Bagian A** (untuk `contoh.js`) dan **Bagian B** (untuk latihan). Klik **+** di kiri bawah untuk tab baru.
4. Copy header dan sample data dari tabel di bawah ke tab masing-masing.
5. Copy ID Sheet dari URL:
   ```
   https://docs.google.com/spreadsheets/d/  <-- ID DI SINI -->  /edit
   ```
6. Set ID itu sebagai `SHEET_ID` di `contoh.js` dan `latihan-solusi.js`.

> **Tips**: Format kolom seperti `Gaji` dan `Nilai` sebagai **angka biasa** (Format → Number → Number). Jangan format sebagai Currency dulu — script kita yang akan handle format Rupiah supaya outputnya terkontrol.

---

## Bagian A — Tab untuk `contoh.js`

### Tab `Karyawan`

| Nama  | Divisi    | Gaji    | Status |
|-------|-----------|---------|--------|
| Sari  | Finance   | 8000000 |        |
| Budi  | Marketing | 7500000 |        |
| Tina  | Finance   | 9000000 |        |
| Andi  | IT        | 9500000 |        |
| Rina  | HR        | 6500000 |        |

**Catatan**:
- Kolom **Status** sengaja kosong — akan diisi oleh `contoh05_tulisBatch()` dan `contoh09_cariBaris()`.
- Untuk testing trigger `onEdit` di Modul 6, tambah karyawan baru via prompt akan masuk ke baris 7+.

### Tab `Pesanan`

| Nomor Pesanan | Email Customer    | Status     | Notif Terkirim |
|---------------|-------------------|------------|----------------|
| PSN-001       | (email Anda)      | Selesai    |                |
| PSN-002       | (email Anda)      | Selesai    |                |
| PSN-003       | (email Anda)      | Diproses   |                |
| PSN-004       | (email Anda)      | Dibatalkan |                |

**Catatan**:
- **Wajib ganti `(email Anda)`** dengan email Anda sendiri untuk testing — supaya email notifikasi masuk ke inbox Anda, bukan ke alamat random.
- Kolom **Notif Terkirim** kosong — `contoh12_kirimNotifPesananSelesai()` akan mengisinya dengan timestamp setelah email terkirim.

---

## Bagian B — Tab untuk `latihan.md`

### Tab `Penjualan`

| ID Transaksi | Tanggal     | Customer    | Email Customer    | Produk    | Qty | Harga Satuan | Status        | Notif Terkirim |
|--------------|-------------|-------------|-------------------|-----------|-----|--------------|---------------|----------------|
| TRX-001      | 2026-05-01  | PT Alpha    | alpha@kantor.id   | Mouse     | 3   | 150000       | Selesai       |                |
| TRX-002      | 2026-05-02  | PT Beta     | beta@kantor.id    | Keyboard  | 5   | 350000       | Diproses      |                |
| TRX-003      | 2026-05-02  | PT Gamma    | gamma@kantor.id   | Monitor   | 2   | 2500000      | Selesai       |                |
| TRX-004      | 2026-05-03  | PT Delta    | delta@kantor.id   | Headset   | 4   | 450000       | Dibatalkan    |                |
| TRX-005      | 2026-05-04  | PT Epsilon  | (email Anda)      | Mouse     | 10  | 150000       | Selesai       |                |
| TRX-006      | 2026-05-05  | PT Zeta     | zeta@kantor.id    | Webcam    | 2   | 800000       | Diproses      |                |
| TRX-007      | 2026-05-06  | PT Alpha    | alpha@kantor.id   | Monitor   | 1   | 2500000      | Selesai       |                |
| TRX-008      | 2026-05-07  | PT Eta      | eta@kantor.id     | Keyboard  | 3   | 350000       | Selesai       |                |

**Format kolom**:
- `Tanggal`: Format → Number → Date (yyyy-mm-dd).
- `Qty`, `Harga Satuan`: Number biasa, jangan currency.
- `Email Customer`: minimal 1 baris harus email Anda (untuk Soal 6 — notif email).

### Tab `Produk`

| Kode | Nama Produk | Stok | Harga    |
|------|-------------|------|----------|
| P001 | Mouse       | 50   | 150000   |
| P002 | Keyboard    | 30   | 350000   |
| P003 | Monitor     | 8    | 2500000  |
| P004 | Headset     | 25   | 450000   |
| P005 | Webcam      | 12   | 800000   |

**Catatan**:
- Stok awal sengaja dibikin **lebih kecil dari beberapa total Qty di Penjualan**, supaya Soal 3 (Validasi Stok) ada baris yang gagal karena stok kurang.
- Test cepat: TRX-005 minta `Mouse × 10` → stok awal 50, akan jadi 40 setelah validasi.

---

## CSV Format (Alternatif Import)

Kalau Anda lebih cepat **import CSV** daripada copy-paste manual, ini versi CSV-nya. Copy isinya ke file `.csv` lokal, lalu di Google Sheet: **File → Import → Upload → Replace current sheet** (untuk tab yang sesuai).

### `Karyawan.csv`

```csv
Nama,Divisi,Gaji,Status
Sari,Finance,8000000,
Budi,Marketing,7500000,
Tina,Finance,9000000,
Andi,IT,9500000,
Rina,HR,6500000,
```

### `Pesanan.csv`

```csv
Nomor Pesanan,Email Customer,Status,Notif Terkirim
PSN-001,GANTI@EMAIL.ANDA,Selesai,
PSN-002,GANTI@EMAIL.ANDA,Selesai,
PSN-003,GANTI@EMAIL.ANDA,Diproses,
PSN-004,GANTI@EMAIL.ANDA,Dibatalkan,
```

### `Penjualan.csv`

```csv
ID Transaksi,Tanggal,Customer,Email Customer,Produk,Qty,Harga Satuan,Status,Notif Terkirim
TRX-001,2026-05-01,PT Alpha,alpha@kantor.id,Mouse,3,150000,Selesai,
TRX-002,2026-05-02,PT Beta,beta@kantor.id,Keyboard,5,350000,Diproses,
TRX-003,2026-05-02,PT Gamma,gamma@kantor.id,Monitor,2,2500000,Selesai,
TRX-004,2026-05-03,PT Delta,delta@kantor.id,Headset,4,450000,Dibatalkan,
TRX-005,2026-05-04,PT Epsilon,GANTI@EMAIL.ANDA,Mouse,10,150000,Selesai,
TRX-006,2026-05-05,PT Zeta,zeta@kantor.id,Webcam,2,800000,Diproses,
TRX-007,2026-05-06,PT Alpha,alpha@kantor.id,Monitor,1,2500000,Selesai,
TRX-008,2026-05-07,PT Eta,eta@kantor.id,Keyboard,3,350000,Selesai,
```

### `Produk.csv`

```csv
Kode,Nama Produk,Stok,Harga
P001,Mouse,50,150000
P002,Keyboard,30,350000
P003,Monitor,8,2500000
P004,Headset,25,450000
P005,Webcam,12,800000
```

---

## Checklist Setup

- [ ] Sheet bernama `Modul-3-Sheets-Automation` sudah dibuat.
- [ ] Tab `Karyawan` (5 baris data) — untuk `contoh.js`.
- [ ] Tab `Pesanan` (4 baris data, email diganti email Anda) — untuk mini-project di `contoh.js`.
- [ ] Tab `Penjualan` (8 baris data, minimal 1 baris email Anda) — untuk `latihan.md`.
- [ ] Tab `Produk` (5 baris data) — untuk `latihan.md`.
- [ ] ID Sheet sudah di-copy dan di-set sebagai `SHEET_ID` di kode.
- [ ] Pertama kali Run script, autorisasi sudah di-Allow.

---

## FAQ

**Q: Apakah saya harus bikin Sheet baru, atau bisa pakai yang sudah ada?**
A: Boleh pakai yang sudah ada, **asalkan** Anda bikin tab baru dengan nama persis seperti tabel di atas (`Karyawan`, `Pesanan`, dst). Script kita pakai `getSheetByName(...)` jadi nama tab harus match.

**Q: Kenapa email saya yang dipakai untuk customer?**
A: Supaya saat script kirim "email notifikasi pesanan selesai" ke customer, emailnya masuk ke inbox Anda — Anda bisa verifikasi langsung tanpa minta bantuan customer asli. Di production nanti tinggal ganti pakai email customer beneran.

**Q: Bisa pakai container-bound (script di-bind ke Sheet) atau standalone?**
A: Dua-duanya bisa.
- **Container-bound**: buka Sheet → **Extensions → Apps Script**. Tidak perlu set `SHEET_ID` (otomatis pakai `getActiveSpreadsheet()`).
- **Standalone**: bikin project di [script.google.com](https://script.google.com). Wajib set `SHEET_ID` di kode.
Helper `_getSpreadsheet()` di `contoh.js` sudah handle dua mode ini.

**Q: Format `Tanggal` yang muncul aneh saat di-read pakai `getValues()` — angka serial seperti `45413`?**
A: Itu raw Sheet date number. Kalau cell di-format sebagai Date, `getValues()` mengembalikan **object Date** JavaScript. Kalau di-format sebagai Number/Text, hasilnya beda. Pastikan kolom Tanggal di-format **Date** di Sheet.
