# Template Spreadsheet — Modul 7

File ini adalah **referensi bentuk spreadsheet** yang dipakai untuk Dashboard Pelatihan dan form pendaftaran di Modul 7. Tujuan: peserta tidak menebak-nebak struktur — semua tab, header, dan sample data sudah disepakati di sini.

> Tab & struktur **identik dengan Modul 3 & 5** — Anda bisa pakai Sheet `Latihan-M3` atau `Latihan-M5` yang sudah ada, atau bikin Sheet baru.

---

## Cara Setup Cepat

1. Buka [https://sheets.google.com](https://sheets.google.com), klik **Blank** untuk Sheet baru.
2. Rename Sheet jadi **"Latihan-M7-Dashboard"** (atau pakai Sheet existing dari modul sebelumnya).
3. Bikin **dua tab**: `Peserta` dan `Program`. Klik **+** di kiri bawah untuk tab baru.
4. Copy header dan sample data dari tabel di bawah ke tab masing-masing.
5. Copy **ID Sheet** dari URL — bagian setelah `/d/` dan sebelum `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/  <-- ID DI SINI -->  /edit
   ```
6. Di Apps Script editor: **Project Settings → Script Properties → Add script property**:
   - Property: `DASHBOARD_SHEET_ID`
   - Value: ID Sheet yang barusan di-copy.

> **Tip format**: kolom `Biaya` dan `Nilai` di-set **Number → Number** (bukan Currency). Format Rupiah ditangani oleh dashboard HTML supaya output-nya konsisten.

---

## Tab `Peserta` (10 kolom)

| ID Peserta | Tanggal Daftar | Nama          | Email             | Instansi   | Program | Nilai | Status          | Notif Email | Link Sertifikat |
|------------|----------------|---------------|-------------------|------------|---------|-------|-----------------|-------------|------------------|
| PST-001    | 2026-05-01     | Sari Wulan    | sari@kantor.id    | PT Alpha   | GAS-101 | 88    | Lulus           |             |                  |
| PST-002    | 2026-05-02     | Budi Pratama  | budi@kantor.id    | PT Beta    | GAS-201 | 72    | Lulus           |             |                  |
| PST-003    | 2026-05-02     | Tina Sari     | tina@kantor.id    | PT Gamma   | GAS-101 | 95    | Lulus           |             |                  |
| PST-004    | 2026-05-03     | Andi Pratama  | andi@kantor.id    | PT Delta   | GAS-301 |       | Sedang Berjalan |             |                  |
| PST-005    | 2026-05-04     | Rina Wati     | rina@kantor.id    | PT Epsilon | GAS-101 | 55    | Tidak Lulus     |             |                  |
| PST-006    | 2026-05-05     | Joko Santoso  | joko@kantor.id    | PT Zeta    | GAS-201 | 80    | Lulus           |             |                  |
| PST-007    | 2026-05-06     | Mira Lestari  | mira@kantor.id    | PT Alpha   | GAS-101 | 90    | Lulus           |             |                  |
| PST-008    | 2026-05-07     | Dimas Aji     | dimas@kantor.id   | PT Eta     | GAS-201 |       | Sedang Berjalan |             |                  |
| PST-009    | 2026-05-08     | Hana Syifa    | hana@kantor.id    | PT Theta   | GAS-301 | 78    | Lulus           |             |                  |
| PST-010    | 2026-05-09     | Adi Saputra   | adi@kantor.id     | PT Iota    | GAS-401 |       | Sedang Berjalan |             |                  |

**Format kolom**:
- `Tanggal Daftar`: Format → Number → Date (yyyy-mm-dd).
- `Nilai`: Number biasa (0–100); biarkan kosong untuk peserta yang belum dinilai.
- `Status`: salah satu dari `Lulus`, `Sedang Berjalan`, `Tidak Lulus`. Dashboard render warna badge sesuai status.
- `Email`: bebas — untuk dashboard read-only tidak perlu email Anda. Untuk form pendaftaran (page=form), pastikan tidak duplikat saat test.
- `Notif Email` & `Link Sertifikat`: tidak dipakai oleh dashboard, biarkan kosong (atau isi kalau sudah dipakai di modul sebelumnya).

---

## Tab `Program` (7 kolom)

| Kode    | Nama Program                    | Kapasitas | Biaya    | Tanggal Mulai | Tanggal Selesai | Lokasi          |
|---------|---------------------------------|-----------|----------|---------------|-----------------|-----------------|
| GAS-101 | Google Apps Script Fundamental  | 30        | 1500000  | 2026-06-01    | 2026-06-03      | Online (Meet)   |
| GAS-201 | Sheets & Gmail Automation       | 25        | 2000000  | 2026-06-08    | 2026-06-10      | Online (Meet)   |
| GAS-301 | Web Apps & API Integration      | 20        | 2500000  | 2026-06-15    | 2026-06-17      | Jakarta (Onsite)|
| GAS-401 | Multi-Service Integration       | 15        | 3000000  | 2026-06-22    | 2026-06-24      | Jakarta (Onsite)|
| GAS-501 | Capstone & Mentoring            | 10        | 5000000  | 2026-06-29    | 2026-07-01      | Online (Meet)   |

**Format kolom**:
- `Tanggal Mulai`, `Tanggal Selesai`: **Format → Number → Date**. Wajib sebagai Date — dashboard format ulang via `Utilities.formatDate()`.
- `Biaya`: Number biasa.
- `Kode`: format `GAS-XXX` — harus match dengan kolom `Program` di tab Peserta.

---

## CSV Format (Alternatif Import)

Kalau lebih cepat **File → Import → Upload → Replace current sheet** ketimbang copy-paste manual:

### `Peserta.csv`

```csv
ID Peserta,Tanggal Daftar,Nama,Email,Instansi,Program,Nilai,Status,Notif Email,Link Sertifikat
PST-001,2026-05-01,Sari Wulan,sari@kantor.id,PT Alpha,GAS-101,88,Lulus,,
PST-002,2026-05-02,Budi Pratama,budi@kantor.id,PT Beta,GAS-201,72,Lulus,,
PST-003,2026-05-02,Tina Sari,tina@kantor.id,PT Gamma,GAS-101,95,Lulus,,
PST-004,2026-05-03,Andi Pratama,andi@kantor.id,PT Delta,GAS-301,,Sedang Berjalan,,
PST-005,2026-05-04,Rina Wati,rina@kantor.id,PT Epsilon,GAS-101,55,Tidak Lulus,,
PST-006,2026-05-05,Joko Santoso,joko@kantor.id,PT Zeta,GAS-201,80,Lulus,,
PST-007,2026-05-06,Mira Lestari,mira@kantor.id,PT Alpha,GAS-101,90,Lulus,,
PST-008,2026-05-07,Dimas Aji,dimas@kantor.id,PT Eta,GAS-201,,Sedang Berjalan,,
PST-009,2026-05-08,Hana Syifa,hana@kantor.id,PT Theta,GAS-301,78,Lulus,,
PST-010,2026-05-09,Adi Saputra,adi@kantor.id,PT Iota,GAS-401,,Sedang Berjalan,,
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

## Tampilan Dashboard yang Diharapkan

Setelah deploy Web App dengan data di atas, dashboard akan menampilkan:

**Kartu statistik (atas):**

| Total Peserta | Lulus | Sedang Berjalan | Rata-rata Nilai |
|---|---|---|---|
| **10** | **6** (60% dari total) | **3** | **79.7** |

**Tabel Program (5 baris):**

| Kode | Nama Program | Kapasitas | Terisi | Tanggal Mulai | Lokasi | Biaya |
|---|---|---|---|---|---|---|
| GAS-101 | Google Apps Script Fundamental | 30 | 4 | 2026-06-01 | Online (Meet) | Rp 1.500.000 |
| GAS-201 | Sheets & Gmail Automation | 25 | 3 | 2026-06-08 | Online (Meet) | Rp 2.000.000 |
| GAS-301 | Web Apps & API Integration | 20 | 2 | 2026-06-15 | Jakarta (Onsite) | Rp 2.500.000 |
| GAS-401 | Multi-Service Integration | 15 | 1 | 2026-06-22 | Jakarta (Onsite) | Rp 3.000.000 |
| GAS-501 | Capstone & Mentoring | 10 | 0 | 2026-06-29 | Online (Meet) | Rp 5.000.000 |

Kolom **Terisi** dihitung otomatis dari jumlah peserta di tab Peserta yang ber-kolom `Program` = kode tersebut.

**Tabel Peserta** (dengan filter di atas):
- Default tampil 10 baris (semua peserta).
- Ketik `"Alpha"` di kolom search → tinggal 2 baris (Sari Wulan + Mira Lestari).
- Pilih dropdown Program = `GAS-101` → tinggal 4 baris.
- Pilih dropdown Status = `Lulus` → tinggal baris yang Status-nya Lulus.

---

## Checklist Setup

- [ ] Sheet `Latihan-M7-Dashboard` (atau Sheet existing) sudah dibuat.
- [ ] Tab `Peserta` (10 baris data, 10 kolom).
- [ ] Tab `Program` (5 baris data, 7 kolom).
- [ ] Kolom tanggal di-format **Date**.
- [ ] Script Properties `DASHBOARD_SHEET_ID` = ID Sheet sudah di-set.
- [ ] `bacaDataDashboard()` jalan tanpa error saat di-Run manual (log hasilnya valid JSON).
- [ ] Deploy → Web app → Anyone → Web App URL didapat.
- [ ] URL Web App dibuka di browser → dashboard tampil sesuai contoh di atas.

---

## FAQ

**Q: Apakah saya harus bikin Sheet baru, atau bisa pakai Sheet dari Modul 3/5?**
A: Boleh pakai yang sudah ada — tab `Peserta` & `Program` struktur-nya identik. Cukup set `DASHBOARD_SHEET_ID` ke ID Sheet yang dipakai.

**Q: Apakah peserta yang akses dashboard bisa edit Sheet?**
A: Tidak. Dashboard ini **read-only** — server hanya `getValues()`, tidak ada `setValues()`. Walau di-share publik, viewer hanya bisa lihat data. Sheet asli tetap aman.

**Q: Bagaimana kalau saya ubah data di Sheet — apakah dashboard auto-update?**
A: Tidak otomatis. Dashboard punya tombol **Refresh** — klik untuk re-fetch data terbaru. Atau reload halaman.

**Q: Bisa dipakai untuk Sheet yang isinya lebih dari 10–100 peserta?**
A: Bisa, tapi pertimbangkan: dashboard sekarang load **semua** peserta sekaligus ke client. Untuk > 500 baris, browser bisa lambat saat render tabel. Solusi: tambah paginasi di client, atau server function yang return data per-page.

**Q: Kapasitas vs Terisi — apakah dihitung dari Sheet?**
A: `Kapasitas` baca langsung dari kolom Sheet. `Terisi` dihitung client-side dari jumlah peserta yang `Program`-nya match dengan kode program — supaya selalu match dengan tabel peserta.

**Q: Dashboard menampilkan "0" untuk semua statistik. Kenapa?**
A: Tab `Peserta` kosong atau `DASHBOARD_SHEET_ID` salah. Cek Execution log saat Web App di-load — kalau ada error, biasanya soal Sheet ID atau tab tidak ditemukan.
