# Latihan Modul 8 — Integrating Multiple Google Services

Latihan ini lebih sedikit jumlahnya tapi lebih besar scope-nya — fokus ke design integrasi end-to-end.

**Persiapan**:
1. Buat Google Sheet `Latihan-M8` dengan tab:
   - **Karyawan-Master**: `Nama | Email | Divisi | Tanggal Mulai | Tanggal Daftar`
   - **Pipeline**: `Deal ID | Customer | Nilai | Status | Tanggal Update` (isi 5–10 baris dummy, mix Open/Closed)
   - **Kuota-Cuti**: `Email | Sisa`
   - **Pengajuan-Cuti**: `ID | Timestamp | Nama | Email | Jenis Cuti | Tanggal Mulai | Tanggal Selesai | Alasan | Status`
   - **Audit**: `Timestamp | User | Status | Payload`
2. Buat folder Drive `Onboarding` (parent) — copy ID.
3. Buat Google Doc "Welcome Letter Template" dengan placeholder `{{nama}}`, `{{divisi}}`, `{{tanggalMulai}}` — copy ID.
4. Set Script Properties: `MASTER_SHEET_ID`, `ONBOARDING_FOLDER_ID`, `TEMPLATE_DOC_ID`, `ADMIN_EMAIL`, `AUDIT_SHEET_ID`.

---

## Soal 1 — Modularisasi

Ambil function `onboardingHandler` dari `contoh.js`. Refactor jadi minimal **3 file `.gs`**:
- `Main.gs` — orchestrator + trigger
- `Sheets.gs` — semua helper Sheets
- `Drive.gs` + `Docs.gs` + `Email.gs` + `Calendar.gs` (boleh disatukan kalau singkat)
- `Utils.gs` — audit_log, format helper

Tambah satu file `Config.gs` yang ekspor `function CONFIG() { ... }` mengembalikan object dari Script Properties.

Test: jalankan `ujiOnboarding()` dengan dummy data Anda sendiri. Verifikasi:
- Baris masuk ke Karyawan-Master.
- Folder Onboarding/<nama> terbentuk.
- Welcome Doc tergenerate.
- Email diterima.
- Event Calendar muncul.
- Audit log mencatat.

---

## Soal 2 — Idempotent Layer

Tambahkan wrapper `onboardingIdempotent(responseId, data)` yang:
1. Cek `CacheService.getScriptCache().get('onboard:' + responseId)` — kalau ada → skip.
2. Lock dengan `LockService` 10 detik.
3. Double-check cache.
4. Panggil `onboardingHandler(data)`.
5. Set cache `onboard:<responseId> = "1"` dengan TTL 6 jam.

Test: panggil 2× berturut dengan responseId yang sama → eksekusi kedua harus skip.

---

## Soal 3 — Daily Pipeline Report

Buat workflow lengkap `dailyPipelineReport()` yang dijalankan tiap pagi 07:00:

1. Baca tab `Pipeline`, filter `Status = Open`.
2. Bikin Google Doc "Pipeline Report — <tanggal>" berisi:
   - Heading dengan tanggal.
   - Total Open Deal (count).
   - Total Pipeline Value (sum Nilai).
   - Tabel: Deal ID | Customer | Nilai | Status | Last Update.
3. Pindah Doc ke folder Drive `Reports/<bulan-tahun>` (bikin folder kalau belum ada).
4. Export Doc ke PDF, simpan di folder yang sama.
5. Kirim email ke `ADMIN_EMAIL` dengan PDF sebagai attachment.
6. Audit log.

Pasang sebagai trigger time-driven `atHour(7).everyDays(1)`.

---

## Soal 4 — Cache Layer

Buat function `getKursCached()` yang:
1. Baca `CacheService` key `kurs-idr` — kalau ada, return.
2. Kalau tidak: panggil API kurs publik, simpan ke cache (TTL 1 jam), return.

Lalu buat function `tampilKurs()` yang panggil `getKursCached()` 3× berturut. Dari log, harus terlihat: 1× cache miss, 2× cache hit.

---

## Soal 5 — Mini-Project: Sistem Cuti Lengkap

Implementasikan sistem cuti seperti di materi.md §9:

1. Buat **Google Form** dengan field: Nama, Email, Jenis Cuti, Tanggal Mulai, Tanggal Selesai, Alasan.
2. Pasang trigger `onFormSubmit` ke `pengajuanCutiHandler` (sudah ada di contoh.js).
3. Implementasi `doGet` dengan routing:
   - `?action=approve&id=<cuti-id>` → approve flow (update status, bikin event, kurangi kuota, email karyawan).
   - `?action=reject&id=<cuti-id>` → reject flow (update status, email karyawan).
4. Test end-to-end:
   - Submit form
   - Cek email manager masuk dengan link approve/reject
   - Klik approve → cek tab Pengajuan-Cuti, kuota di-update, event Calendar muncul, email ke karyawan masuk
   - Submit lagi dengan kuota tidak cukup → harus email tolak otomatis

Bonus:
- Tambah validasi tanggal mulai harus > hari ini.
- Tambah batas hari cuti per pengajuan (mis. max 14 hari).
- Tambah notif Slack ke channel HR (kalau Modul 7 sudah set).

---

## Soal 6 — Pickle: Diagnosa Workflow Bermasalah

Skenario: workflow `dailyPipelineReport` (Soal 3) di production tiba-tiba gagal, tapi tidak ada error eksplisit di log. Email tidak masuk, PDF tidak terbuat.

Buat function `diagnose()` yang:
1. Baca tab `Audit`, ambil 10 entry terakhir untuk handler `dailyPipelineReport`.
2. Tampilkan ringkasan: stage terakhir, error message (kalau ada).
3. Cek apakah trigger masih terpasang (`ScriptApp.getProjectTriggers()`).
4. Cek apakah Drive folder `Reports/<bulan-tahun>` masih bisa diakses.
5. Cek kuota email (`MailApp.getRemainingDailyQuota()`).
6. Print ringkasan ke log dan kirim ke `ADMIN_EMAIL` kalau ada anomali.

---

## Checklist Selesai Modul 8

- [ ] Project saya termodularisasi dengan baik (Main + helper per service).
- [ ] Saya pakai PropertiesService untuk config & secret.
- [ ] Saya pakai CacheService untuk data sementara.
- [ ] Saya pakai LockService untuk operasi yang bisa overlap.
- [ ] Audit log saya lengkap dengan stage tracking.
- [ ] Saya bisa men-design end-to-end workflow seperti onboarding atau cuti.
- [ ] Saya tahu cara mendiagnosa workflow yang bermasalah.

**Selanjutnya: Capstone Project (folder `Capstone-Project`).**
