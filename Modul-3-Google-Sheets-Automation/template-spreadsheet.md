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

Latihan Modul 3 menggunakan konteks **lembaga pelatihan**: data peserta + data program. Tiga soal latihan fokus ke integrasi Sheets dengan Gmail, Docs, dan Calendar.

> 📁 **Selain Sheet**, latihan butuh **satu folder Drive** bernama `Latihan-M3-Output` (untuk menampung Doc yang digenerate Soal 2). Copy ID folder dari URL setelah `/folders/`.

### Tab `Peserta`

| ID Peserta | Tanggal Daftar | Nama          | Email             | Instansi   | Program | Nilai | Status          | Notif Email | Link Sertifikat |
|------------|----------------|---------------|-------------------|------------|---------|-------|-----------------|-------------|------------------|
| PST-001    | 2026-05-01     | Sari Wulan    | sari@kantor.id    | PT Alpha   | GAS-101 | 88    | Lulus           |             |                  |
| PST-002    | 2026-05-02     | Budi Pratama  | budi@kantor.id    | PT Beta    | GAS-201 | 72    | Lulus           |             |                  |
| PST-003    | 2026-05-02     | Tina Sari     | tina@kantor.id    | PT Gamma   | GAS-101 | 95    | Lulus           |             |                  |
| PST-004    | 2026-05-03     | Andi Pratama  | andi@kantor.id    | PT Delta   | GAS-301 |       | Sedang Berjalan |             |                  |
| PST-005    | 2026-05-04     | Rina Wati     | (email Anda)      | PT Epsilon | GAS-101 | 55    | Tidak Lulus     |             |                  |
| PST-006    | 2026-05-05     | Joko Santoso  | (email Anda)      | PT Zeta    | GAS-201 | 80    | Lulus           |             |                  |
| PST-007    | 2026-05-06     | Mira Lestari  | mira@kantor.id    | PT Alpha   | GAS-101 | 90    | Lulus           |             |                  |
| PST-008    | 2026-05-07     | Dimas Aji     | dimas@kantor.id   | PT Eta     | GAS-201 |       | Sedang Berjalan |             |                  |

**Format kolom**:
- `Tanggal Daftar`: Format → Number → Date (yyyy-mm-dd).
- `Nilai`: Number biasa (0–100); biarkan kosong untuk peserta yang belum dinilai.
- `Email`: minimal **2 baris** harus email Anda sendiri — supaya email sertifikat (Soal 1) & undangan Calendar (Soal 3) bisa diverifikasi tanpa spam orang lain.
- `Notif Email`, `Link Sertifikat`: kosongkan — diisi otomatis oleh script.

### Tab `Program`

| Kode    | Nama Program                    | Kapasitas | Biaya    | Tanggal Mulai | Tanggal Selesai | Lokasi          |
|---------|---------------------------------|-----------|----------|---------------|-----------------|-----------------|
| GAS-101 | Google Apps Script Fundamental  | 30        | 1500000  | 2026-06-01    | 2026-06-03      | Online (Meet)   |
| GAS-201 | Sheets & Gmail Automation       | 25        | 2000000  | 2026-06-08    | 2026-06-10      | Online (Meet)   |
| GAS-301 | Web Apps & API Integration      | 20        | 2500000  | 2026-06-15    | 2026-06-17      | Jakarta (Onsite)|
| GAS-401 | Multi-Service Integration       | 15        | 3000000  | 2026-06-22    | 2026-06-24      | Jakarta (Onsite)|
| GAS-501 | Capstone & Mentoring            | 10        | 5000000  | 2026-06-29    | 2026-07-01      | Online (Meet)   |

**Format kolom**:
- `Tanggal Mulai`, `Tanggal Selesai`: Format → Number → Date. **Wajib** sebagai Date — Soal 3 cek `instanceof Date` sebelum bikin event.
- `Biaya`: Number biasa.
- Solusi Soal 3 akan menambah kolom `Event ID` di sebelah `Lokasi` secara otomatis (tidak perlu disiapkan manual).

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

### `Peserta.csv`

```csv
ID Peserta,Tanggal Daftar,Nama,Email,Instansi,Program,Nilai,Status,Notif Email,Link Sertifikat
PST-001,2026-05-01,Sari Wulan,sari@kantor.id,PT Alpha,GAS-101,88,Lulus,,
PST-002,2026-05-02,Budi Pratama,budi@kantor.id,PT Beta,GAS-201,72,Lulus,,
PST-003,2026-05-02,Tina Sari,tina@kantor.id,PT Gamma,GAS-101,95,Lulus,,
PST-004,2026-05-03,Andi Pratama,andi@kantor.id,PT Delta,GAS-301,,Sedang Berjalan,,
PST-005,2026-05-04,Rina Wati,GANTI@EMAIL.ANDA,PT Epsilon,GAS-101,55,Tidak Lulus,,
PST-006,2026-05-05,Joko Santoso,GANTI@EMAIL.ANDA,PT Zeta,GAS-201,80,Lulus,,
PST-007,2026-05-06,Mira Lestari,mira@kantor.id,PT Alpha,GAS-101,90,Lulus,,
PST-008,2026-05-07,Dimas Aji,dimas@kantor.id,PT Eta,GAS-201,,Sedang Berjalan,,
```

### `Program.csv`

```csv
Kode,Nama Program,Kapasitas,Biaya,Tanggal Mulai,Tanggal Selesai,Lokasi
GAS-101,Google Apps Script Fundamental,30,1500000,2026-06-01,2026-06-03,Online (Meet)
GAS-201,Sheets & Gmail Automation,25,2000000,2026-06-08,2026-06-10,Online (Meet)
GAS-301,Web Apps & API Integration,20,2500000,2026-06-15,2026-06-17,Jakarta (Onsite)
GAS-401,Multi-Service Integration,15,3000000,2026-06-22,2026-06-24,Jakarta (Onsite)
GAS-501,Capstone & Mentoring,10,5000000,2026-06-29,2026-07-01,Online (Meet)
```

---

## Checklist Setup

- [ ] Sheet bernama `Modul-3-Sheets-Automation` sudah dibuat.
- [ ] Tab `Karyawan` (5 baris data) — untuk `contoh.js`.
- [ ] Tab `Pesanan` (4 baris data, email diganti email Anda) — untuk mini-project di `contoh.js`.
- [ ] Tab `Peserta` (8 baris data, minimal 2 baris email Anda) — untuk `latihan.md`.
- [ ] Tab `Program` (5 baris data, `Tanggal Mulai`/`Tanggal Selesai` di-format **Date**) — untuk `latihan.md`.
- [ ] Folder Drive `Latihan-M3-Output` sudah dibuat (untuk Soal 2).
- [ ] ID Sheet di-set sebagai `SHEET_ID` dan ID folder sebagai `FOLDER_ID` di kode.
- [ ] Pertama kali Run script, autorisasi sudah di-Allow.

---

## FAQ

**Q: Apakah saya harus bikin Sheet baru, atau bisa pakai yang sudah ada?**
A: Boleh pakai yang sudah ada, **asalkan** Anda bikin tab baru dengan nama persis seperti tabel di atas (`Karyawan`, `Pesanan`, `Peserta`, `Program`). Script kita pakai `getSheetByName(...)` jadi nama tab harus match.

**Q: Kenapa email saya yang dipakai untuk customer/peserta?**
A: Supaya saat script kirim email sertifikat (Soal 1 latihan) atau undangan Calendar (Soal 3 latihan), emailnya masuk ke inbox Anda — bisa langsung diverifikasi tanpa spam orang lain. Di production tinggal ganti pakai email peserta asli.

**Q: Bisa pakai container-bound (script di-bind ke Sheet) atau standalone?**
A: Dua-duanya bisa.
- **Container-bound**: buka Sheet → **Extensions → Apps Script**. Tidak perlu set `SHEET_ID` (otomatis pakai `getActiveSpreadsheet()`).
- **Standalone**: bikin project di [script.google.com](https://script.google.com). Wajib set `SHEET_ID` di kode.
Helper `_getSpreadsheet()` di `contoh.js` sudah handle dua mode ini.

**Q: Format `Tanggal` yang muncul aneh saat di-read pakai `getValues()` — angka serial seperti `45413`?**
A: Itu raw Sheet date number. Kalau cell di-format sebagai Date, `getValues()` mengembalikan **object Date** JavaScript. Kalau di-format sebagai Number/Text, hasilnya beda. Pastikan kolom Tanggal di-format **Date** di Sheet.
