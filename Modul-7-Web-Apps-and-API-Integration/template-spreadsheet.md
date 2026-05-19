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

## Tab `Peserta` (10 kolom, 30 baris data)

Data sengaja banyak & bervariasi supaya dashboard terlihat real — distribusi status seimbang (lulus / sedang berjalan / tidak lulus), beberapa peserta sudah dapat sertifikat, instansi & program berulang untuk demo filter.

| ID Peserta | Tanggal Daftar | Nama              | Email                  | Instansi          | Program | Nilai | Status          | Notif Email      | Link Sertifikat                                              |
|------------|----------------|-------------------|------------------------|-------------------|---------|-------|-----------------|------------------|--------------------------------------------------------------|
| PST-001    | 2026-04-15     | Sari Wulandari    | sari.w@kantor.id       | PT Alpha          | GAS-101 | 88    | Lulus           | 2026-05-04 09:15 | https://docs.google.com/document/d/abc001/edit               |
| PST-002    | 2026-04-15     | Budi Pratama      | budi.p@kantor.id       | PT Beta           | GAS-201 | 72    | Lulus           | 2026-05-11 14:22 | https://docs.google.com/document/d/abc002/edit               |
| PST-003    | 2026-04-16     | Tina Sari Dewi    | tina.s@gamma.co.id     | PT Gamma          | GAS-101 | 95    | Lulus           | 2026-05-04 09:15 | https://docs.google.com/document/d/abc003/edit               |
| PST-004    | 2026-04-17     | Andi Pratama      | andi.p@delta.id        | PT Delta          | GAS-301 | 78    | Lulus           | 2026-05-18 10:30 | https://docs.google.com/document/d/abc004/edit               |
| PST-005    | 2026-04-18     | Rina Wati         | rina.w@epsilon.id      | PT Epsilon        | GAS-101 | 55    | Tidak Lulus     |                  |                                                              |
| PST-006    | 2026-04-18     | Joko Santoso      | joko.s@zeta.id         | PT Zeta           | GAS-201 | 80    | Lulus           | 2026-05-11 14:22 | https://docs.google.com/document/d/abc006/edit               |
| PST-007    | 2026-04-19     | Mira Lestari      | mira.l@kantor.id       | PT Alpha          | GAS-101 | 90    | Lulus           | 2026-05-04 09:15 | https://docs.google.com/document/d/abc007/edit               |
| PST-008    | 2026-04-20     | Dimas Aji         | dimas.a@eta.id         | PT Eta            | GAS-201 | 68    | Tidak Lulus     |                  |                                                              |
| PST-009    | 2026-04-21     | Hana Syifa        | hana.s@theta.id        | PT Theta          | GAS-301 | 78    | Lulus           | 2026-05-18 10:30 | https://docs.google.com/document/d/abc009/edit               |
| PST-010    | 2026-04-22     | Adi Saputra       | adi.s@iota.id          | PT Iota           | GAS-401 |       | Sedang Berjalan |                  |                                                              |
| PST-011    | 2026-04-23     | Putri Anggraini   | putri.a@kantor.id      | PT Alpha          | GAS-201 | 85    | Lulus           | 2026-05-11 14:22 | https://docs.google.com/document/d/abc011/edit               |
| PST-012    | 2026-04-24     | Yusuf Hidayat     | yusuf.h@kappa.id       | PT Kappa          | GAS-101 | 82    | Lulus           | 2026-05-04 09:15 | https://docs.google.com/document/d/abc012/edit               |
| PST-013    | 2026-04-25     | Indah Permata     | indah.p@lambda.id      | PT Lambda         | GAS-301 |       | Sedang Berjalan |                  |                                                              |
| PST-014    | 2026-04-26     | Reza Maulana      | reza.m@beta.id         | PT Beta           | GAS-401 | 92    | Lulus           | 2026-05-25 08:00 | https://docs.google.com/document/d/abc014/edit               |
| PST-015    | 2026-04-27     | Siti Nurhaliza    | siti.n@mu.id           | PT Mu             | GAS-101 | 75    | Lulus           | 2026-05-04 09:15 | https://docs.google.com/document/d/abc015/edit               |
| PST-016    | 2026-04-28     | Galih Pranowo     | galih.p@nu.id          | PT Nu             | GAS-501 |       | Sedang Berjalan |                  |                                                              |
| PST-017    | 2026-04-29     | Diah Kusuma       | diah.k@xi.id           | PT Xi             | GAS-201 | 88    | Lulus           | 2026-05-11 14:22 | https://docs.google.com/document/d/abc017/edit               |
| PST-018    | 2026-04-30     | Faisal Akbar      | faisal.a@omicron.id    | PT Omicron        | GAS-301 | 50    | Tidak Lulus     |                  |                                                              |
| PST-019    | 2026-05-01     | Lina Marlina      | lina.m@kantor.id       | PT Alpha          | GAS-301 | 83    | Lulus           | 2026-05-18 10:30 | https://docs.google.com/document/d/abc019/edit               |
| PST-020    | 2026-05-02     | Bagus Wicaksana   | bagus.w@pi.id          | PT Pi             | GAS-401 | 86    | Lulus           | 2026-05-25 08:00 | https://docs.google.com/document/d/abc020/edit               |
| PST-021    | 2026-05-03     | Ayu Pratiwi       | ayu.p@rho.id           | PT Rho            | GAS-101 | 91    | Lulus           | 2026-05-04 09:15 | https://docs.google.com/document/d/abc021/edit               |
| PST-022    | 2026-05-04     | Doni Setiawan     | doni.s@sigma.id        | PT Sigma          | GAS-201 |       | Sedang Berjalan |                  |                                                              |
| PST-023    | 2026-05-05     | Maya Anggraeni    | maya.a@tau.id          | PT Tau            | GAS-501 | 94    | Lulus           | 2026-06-02 16:45 | https://docs.google.com/document/d/abc023/edit               |
| PST-024    | 2026-05-06     | Eko Wijaya        | eko.w@upsilon.id       | PT Upsilon        | GAS-101 | 65    | Tidak Lulus     |                  |                                                              |
| PST-025    | 2026-05-07     | Nadia Putri       | nadia.p@phi.id         | PT Phi            | GAS-301 |       | Sedang Berjalan |                  |                                                              |
| PST-026    | 2026-05-08     | Rangga Saputra    | rangga.s@chi.id        | PT Chi            | GAS-401 | 89    | Lulus           | 2026-05-25 08:00 | https://docs.google.com/document/d/abc026/edit               |
| PST-027    | 2026-05-09     | Fitri Handayani   | fitri.h@beta.id        | PT Beta           | GAS-101 | 79    | Lulus           | 2026-05-04 09:15 | https://docs.google.com/document/d/abc027/edit               |
| PST-028    | 2026-05-10     | Hendra Gunawan    | hendra.g@psi.id        | PT Psi            | GAS-501 |       | Sedang Berjalan |                  |                                                              |
| PST-029    | 2026-05-11     | Wulan Sari        | wulan.s@kantor.id      | PT Alpha          | GAS-201 | 81    | Lulus           | 2026-05-11 14:22 | https://docs.google.com/document/d/abc029/edit               |
| PST-030    | 2026-05-12     | Bimo Aryanto      | bimo.a@omega.id        | PT Omega          | GAS-301 | 87    | Lulus           | 2026-05-18 10:30 | https://docs.google.com/document/d/abc030/edit               |

**Distribusi data (untuk verifikasi setelah copy):**

| Status          | Jumlah |
|---|---|
| Lulus           | 20 |
| Sedang Berjalan | 6 |
| Tidak Lulus     | 4 |
| **Total**       | **30** |

| Program | Jumlah Peserta |
|---|---|
| GAS-101 | 9 |
| GAS-201 | 7 |
| GAS-301 | 8 |
| GAS-401 | 3 |
| GAS-501 | 3 |

| Instansi top-3 | Jumlah |
|---|---|
| PT Alpha | 4 |
| PT Beta  | 3 |
| (lainnya — 1–2 peserta per instansi) |  |

**Format kolom**:
- `Tanggal Daftar`: Format → Number → Date (yyyy-mm-dd).
- `Nilai`: Number biasa (0–100); biarkan kosong untuk peserta yang `Sedang Berjalan` (belum dinilai).
- `Status`: salah satu dari `Lulus`, `Sedang Berjalan`, `Tidak Lulus`. Dashboard render warna badge sesuai status (hijau / kuning / merah).
- `Notif Email`: timestamp `yyyy-MM-dd HH:mm` — diisi otomatis saat email sertifikat terkirim (Modul 3 Soal 3).
- `Link Sertifikat`: URL ke Google Doc Surat Keterangan Lulus — diisi otomatis saat Doc digenerate (Modul 3 Soal 2).

> **Catatan**: kolom `Notif Email` & `Link Sertifikat` tidak ditampilkan di dashboard, tapi diisi di sample data ini untuk simulasi **kondisi nyata setelah workflow Modul 3 selesai dijalankan**. Boleh dikosongkan kalau Anda hanya fokus ke dashboard.

---

## Tab `Program` (7 kolom, 5 baris)

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
PST-001,2026-04-15,Sari Wulandari,sari.w@kantor.id,PT Alpha,GAS-101,88,Lulus,2026-05-04 09:15,https://docs.google.com/document/d/abc001/edit
PST-002,2026-04-15,Budi Pratama,budi.p@kantor.id,PT Beta,GAS-201,72,Lulus,2026-05-11 14:22,https://docs.google.com/document/d/abc002/edit
PST-003,2026-04-16,Tina Sari Dewi,tina.s@gamma.co.id,PT Gamma,GAS-101,95,Lulus,2026-05-04 09:15,https://docs.google.com/document/d/abc003/edit
PST-004,2026-04-17,Andi Pratama,andi.p@delta.id,PT Delta,GAS-301,78,Lulus,2026-05-18 10:30,https://docs.google.com/document/d/abc004/edit
PST-005,2026-04-18,Rina Wati,rina.w@epsilon.id,PT Epsilon,GAS-101,55,Tidak Lulus,,
PST-006,2026-04-18,Joko Santoso,joko.s@zeta.id,PT Zeta,GAS-201,80,Lulus,2026-05-11 14:22,https://docs.google.com/document/d/abc006/edit
PST-007,2026-04-19,Mira Lestari,mira.l@kantor.id,PT Alpha,GAS-101,90,Lulus,2026-05-04 09:15,https://docs.google.com/document/d/abc007/edit
PST-008,2026-04-20,Dimas Aji,dimas.a@eta.id,PT Eta,GAS-201,68,Tidak Lulus,,
PST-009,2026-04-21,Hana Syifa,hana.s@theta.id,PT Theta,GAS-301,78,Lulus,2026-05-18 10:30,https://docs.google.com/document/d/abc009/edit
PST-010,2026-04-22,Adi Saputra,adi.s@iota.id,PT Iota,GAS-401,,Sedang Berjalan,,
PST-011,2026-04-23,Putri Anggraini,putri.a@kantor.id,PT Alpha,GAS-201,85,Lulus,2026-05-11 14:22,https://docs.google.com/document/d/abc011/edit
PST-012,2026-04-24,Yusuf Hidayat,yusuf.h@kappa.id,PT Kappa,GAS-101,82,Lulus,2026-05-04 09:15,https://docs.google.com/document/d/abc012/edit
PST-013,2026-04-25,Indah Permata,indah.p@lambda.id,PT Lambda,GAS-301,,Sedang Berjalan,,
PST-014,2026-04-26,Reza Maulana,reza.m@beta.id,PT Beta,GAS-401,92,Lulus,2026-05-25 08:00,https://docs.google.com/document/d/abc014/edit
PST-015,2026-04-27,Siti Nurhaliza,siti.n@mu.id,PT Mu,GAS-101,75,Lulus,2026-05-04 09:15,https://docs.google.com/document/d/abc015/edit
PST-016,2026-04-28,Galih Pranowo,galih.p@nu.id,PT Nu,GAS-501,,Sedang Berjalan,,
PST-017,2026-04-29,Diah Kusuma,diah.k@xi.id,PT Xi,GAS-201,88,Lulus,2026-05-11 14:22,https://docs.google.com/document/d/abc017/edit
PST-018,2026-04-30,Faisal Akbar,faisal.a@omicron.id,PT Omicron,GAS-301,50,Tidak Lulus,,
PST-019,2026-05-01,Lina Marlina,lina.m@kantor.id,PT Alpha,GAS-301,83,Lulus,2026-05-18 10:30,https://docs.google.com/document/d/abc019/edit
PST-020,2026-05-02,Bagus Wicaksana,bagus.w@pi.id,PT Pi,GAS-401,86,Lulus,2026-05-25 08:00,https://docs.google.com/document/d/abc020/edit
PST-021,2026-05-03,Ayu Pratiwi,ayu.p@rho.id,PT Rho,GAS-101,91,Lulus,2026-05-04 09:15,https://docs.google.com/document/d/abc021/edit
PST-022,2026-05-04,Doni Setiawan,doni.s@sigma.id,PT Sigma,GAS-201,,Sedang Berjalan,,
PST-023,2026-05-05,Maya Anggraeni,maya.a@tau.id,PT Tau,GAS-501,94,Lulus,2026-06-02 16:45,https://docs.google.com/document/d/abc023/edit
PST-024,2026-05-06,Eko Wijaya,eko.w@upsilon.id,PT Upsilon,GAS-101,65,Tidak Lulus,,
PST-025,2026-05-07,Nadia Putri,nadia.p@phi.id,PT Phi,GAS-301,,Sedang Berjalan,,
PST-026,2026-05-08,Rangga Saputra,rangga.s@chi.id,PT Chi,GAS-401,89,Lulus,2026-05-25 08:00,https://docs.google.com/document/d/abc026/edit
PST-027,2026-05-09,Fitri Handayani,fitri.h@beta.id,PT Beta,GAS-101,79,Lulus,2026-05-04 09:15,https://docs.google.com/document/d/abc027/edit
PST-028,2026-05-10,Hendra Gunawan,hendra.g@psi.id,PT Psi,GAS-501,,Sedang Berjalan,,
PST-029,2026-05-11,Wulan Sari,wulan.s@kantor.id,PT Alpha,GAS-201,81,Lulus,2026-05-11 14:22,https://docs.google.com/document/d/abc029/edit
PST-030,2026-05-12,Bimo Aryanto,bimo.a@omega.id,PT Omega,GAS-301,87,Lulus,2026-05-18 10:30,https://docs.google.com/document/d/abc030/edit
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
| **30** | **20** (67% dari total) | **6** | **80.5** |

**Tabel Program (5 baris dengan kolom Terisi otomatis dihitung):**

| Kode | Nama Program | Kapasitas | Terisi | Tanggal Mulai | Lokasi | Biaya |
|---|---|---|---|---|---|---|
| GAS-101 | Google Apps Script Fundamental | 30 | 9 | 2026-06-01 | Online (Meet) | Rp 1.500.000 |
| GAS-201 | Sheets & Gmail Automation | 25 | 7 | 2026-06-08 | Online (Meet) | Rp 2.000.000 |
| GAS-301 | Web Apps & API Integration | 20 | 8 | 2026-06-15 | Jakarta (Onsite) | Rp 2.500.000 |
| GAS-401 | Multi-Service Integration | 15 | 3 | 2026-06-22 | Jakarta (Onsite) | Rp 3.000.000 |
| GAS-501 | Capstone & Mentoring | 10 | 3 | 2026-06-29 | Online (Meet) | Rp 5.000.000 |

**Tabel Peserta** dengan demo filter:

| Aksi | Hasil |
|---|---|
| Default tampil | 30 dari 30 peserta |
| Ketik `"Alpha"` di search | 4 peserta (semua dari PT Alpha) |
| Pilih dropdown Program = `GAS-101` | 9 peserta |
| Pilih dropdown Status = `Lulus` | 20 peserta |
| Kombinasi: Program `GAS-101` + Status `Lulus` | 7 peserta |
| Ketik `"Sari"` di search | 3 peserta (Sari Wulandari, Tina Sari Dewi, Wulan Sari) |

---

## Checklist Setup

- [ ] Sheet `Latihan-M7-Dashboard` (atau Sheet existing) sudah dibuat.
- [ ] Tab `Peserta` (30 baris data, 10 kolom).
- [ ] Tab `Program` (5 baris data, 7 kolom).
- [ ] Kolom tanggal di-format **Date**.
- [ ] Script Properties `DASHBOARD_SHEET_ID` = ID Sheet sudah di-set.
- [ ] `bacaDataDashboard()` jalan tanpa error saat di-Run manual (log hasilnya valid JSON dengan 30 peserta + 5 program).
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

**Q: Bisa dipakai untuk Sheet yang isinya lebih dari 30 peserta?**
A: Sample data ini 30 baris untuk demo. Dashboard tested lancar sampai ~500 baris di browser modern. Lebih dari itu pertimbangkan paginasi atau lazy-load.

**Q: Kapasitas vs Terisi — apakah dihitung dari Sheet?**
A: `Kapasitas` baca langsung dari kolom Sheet. `Terisi` dihitung client-side dari jumlah peserta yang `Program`-nya match dengan kode program — supaya selalu sinkron dengan tabel peserta.

**Q: Dashboard menampilkan "0" untuk semua statistik. Kenapa?**
A: Tab `Peserta` kosong atau `DASHBOARD_SHEET_ID` salah. Cek Execution log saat Web App di-load — kalau ada error, biasanya soal Sheet ID atau tab tidak ditemukan.

**Q: Kolom `Notif Email` dan `Link Sertifikat` kelihatannya tidak muncul di dashboard. Buat apa diisi?**
A: Dashboard di modul ini tidak menampilkan dua kolom itu. Tapi keduanya **muncul di Modul 3** (untuk email sertifikat & generate Doc). Sample data di atas menyertakan keduanya supaya konsisten dengan workflow penuh — kalau Anda mau lihat dashboard yang juga menampilkan kolom-kolom ini, tinggal tambah kolom di tabel `dashboard.html`.
