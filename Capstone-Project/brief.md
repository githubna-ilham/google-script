# Capstone Project — Sistem Manajemen Karyawan & Workflow

## Tujuan

Membuktikan bahwa Anda mampu **men-design dan implementasikan otomatisasi end-to-end** menggunakan Google Apps Script dan multiple service Google Workspace, layaknya mini-product internal kantor.

Output dari capstone ini bisa dipakai sebagai **portofolio** atau pondasi untuk otomatisasi nyata di kantor Anda.

---

## Tema: Sistem Manajemen Karyawan Terpadu

Pilih **salah satu** dari tiga tema di bawah, atau ajukan tema sendiri yang setara kompleksitasnya. Tiga tema ini memang dirancang untuk menggabungkan semua modul.

### Tema A — Sistem Manajemen Cuti & Absensi

Karyawan ajukan cuti via Form / web app, manager approve via email, kalender otomatis terisi, sisa kuota tersinkron, laporan bulanan dikirim ke HR.

### Tema B — Sistem Onboarding Karyawan Baru

HR submit form karyawan baru, sistem auto-bikin folder Drive personal, generate Welcome Letter dari template, schedule orientasi di Calendar, tambah ke mailing list, kirim welcome email berisi semua link relevan, audit semua langkah.

### Tema C — Sistem Pengelolaan Aset Kantor

Tracking inventaris (laptop, monitor, dll) dengan request peminjaman via web app, approval workflow, reminder return date, laporan utilisasi mingguan.

> **Boleh** propose tema lain ke instruktur asalkan setara kompleksitasnya — minimal: Form/Web App, 3 Google service, trigger, dan auditing.

---

## Spesifikasi Wajib (semua tema)

Project Anda **wajib** mencakup minimal:

### Service yang dipakai (minimal 5)
- [ ] **Sheets** — sebagai data store utama
- [ ] **Drive** — folder structure terorganisir
- [ ] **Docs / Forms / Calendar** — minimal 1 dari 3
- [ ] **Gmail** — untuk notifikasi
- [ ] **UrlFetchApp / HtmlService Web App** — minimal 1 (integrasi luar atau UI)

### Pattern teknis (minimal 5)
- [ ] **Trigger time-driven atau event-driven** — minimal 1
- [ ] **Custom UI** — sidebar, modal, atau Web App
- [ ] **PropertiesService** untuk simpan config/secret
- [ ] **CacheService** atau **LockService** untuk satu use case yang relevan
- [ ] **Audit logging** ke Sheet `Audit-Log`
- [ ] **Idempotent handler** — workflow aman dijalankan ulang
- [ ] **Modular code** — minimal 3 file `.gs` per concern (Main, Sheets, Email, dll)

### Dokumentasi
- [ ] **README.md** — overview project, arsitektur, cara setup, daftar Script Properties yang harus diisi
- [ ] **Diagram alur** — minimal 1 diagram Mermaid yang menggambarkan workflow utama
- [ ] **Comment kode untuk fungsi non-trivial**

### Demo (untuk submission)
- [ ] **Screenshots/recording** dari workflow utama berjalan end-to-end
- [ ] **Repository GitHub** dengan kode + dokumentasi

---

## Detail Tema A — Sistem Cuti

### Aktor
- **Karyawan**: ajukan cuti.
- **Manager**: approve / reject.
- **HR**: monitor & laporan bulanan.

### Fitur Wajib

**Pengajuan**:
1. Karyawan submit Google Form (jenis cuti, tanggal mulai, tanggal selesai, alasan).
2. Sistem validasi: kuota cukup? tanggal valid? format benar?
3. Kalau valid → simpan ke Sheet, kirim email ke manager dengan link approve/reject.
4. Kalau invalid → email ke karyawan dengan alasan tolak.

**Approval**:
5. Manager klik link approve di email → buka Web App → klik konfirmasi.
6. Sistem update Sheet, bikin event Calendar, kurangi kuota, email karyawan.

**Reporting**:
7. Trigger time-driven setiap **akhir bulan** kirim email ke HR berisi:
   - Total pengajuan bulan ini.
   - Berapa yang approved, rejected, pending.
   - Top 5 karyawan dengan cuti terbanyak.
   - PDF attachment dari Doc laporan.

**Optional bonus**:
- Web App "dashboard cuti" untuk karyawan cek sisa kuota.
- Slack/Telegram notif saat ada pengajuan baru.
- Kalender team-wide yang display siapa cuti kapan.

### Sheet Schema (referensi)

`Karyawan`:
| ID | Nama | Email | Manager Email | Jenis Karyawan |

`Kuota-Cuti`:
| Email | Tahun | Total Kuota | Sisa |

`Pengajuan`:
| ID | Timestamp | Email Karyawan | Jenis | Tanggal Mulai | Tanggal Selesai | Alasan | Status | Approver Email | Timestamp Approval |

`Audit-Log`:
| Timestamp | User | Handler | Status | Payload |

---

## Detail Tema B — Sistem Onboarding

### Fitur Wajib

1. **Form pendaftaran karyawan baru** (HR submit): nama, email, divisi, manager, tanggal mulai, posisi.
2. **Auto-create folder Drive** "Onboarding/<nama>" — bagi-pakai dengan karyawan & manager.
3. **Generate Welcome Letter** dari Doc template, isi `{{nama}}`, `{{posisi}}`, `{{tanggal_mulai}}`, `{{manager}}`. Simpan di folder.
4. **Buat event Calendar**: orientasi hari ke-1, lunch dengan tim hari ke-2, 1-on-1 dengan manager hari ke-7.
5. **Email welcome ke karyawan baru** dengan semua link relevan (folder, Doc, calendar invite).
6. **Notif ke manager** dengan checklist persiapan equipment.
7. **Trigger H+30**: kirim email follow-up ke karyawan dengan link survey kepuasan.
8. **Audit log** semua langkah.

---

## Detail Tema C — Pengelolaan Aset

### Fitur Wajib

1. **Sheet master aset** dengan kolom: Kode, Nama, Kategori, Tahun, Nilai, Status (Available/Loaned), Peminjam, Tanggal Pinjam, Tanggal Return.
2. **Web App "Request Pinjam"** — karyawan login lihat list available, klik request → masuk pending approval admin.
3. **Approval admin** (lewat email atau Web App admin) → ubah status, set peminjam, set tanggal pinjam dan return target.
4. **Reminder time-driven**: H-3 sebelum tanggal return, kirim reminder ke peminjam + cc admin.
5. **Auto-return overdue**: kalau tanggal return lewat 7 hari tanpa konfirmasi return, log ke `Audit-Log` & email eskalasi.
6. **Laporan utilisasi mingguan** (Senin pagi): kirim ke admin berisi total pinjam-aktif, top borrower, aset paling sering dipinjam, daftar overdue.

---

## Penilaian (rubrik)

| Aspek | Bobot |
|---|---|
| Fungsionalitas — workflow utama jalan end-to-end tanpa error | 30% |
| Kelengkapan service & pattern teknis sesuai checklist wajib | 25% |
| Code quality — modular, naming, error handling, idempotency | 20% |
| Dokumentasi — README, diagram, comment | 15% |
| Demo — screenshot/recording yang jelas | 10% |

**Bonus +10%** untuk:
- Web App UI yang sangat polished (responsive, animasi).
- Integrasi 3rd party (Slack/Telegram/WhatsApp Business API).
- Test/validation script (function `_test_xxx` yang verifikasi behavior).

---

## Timeline & Submission

**Durasi**: 1 minggu setelah modul 8 selesai (timeline disesuaikan).

**Yang di-submit**:
1. **GitHub repository** berisi seluruh source code (file `.gs`, `.html`, README, diagram).
2. **Sheet template** (kosongan) yang menggambarkan struktur tab + header.
3. **Demo recording 3-5 menit** menunjukkan workflow utama berjalan.
4. **Reflection 1 halaman** (tulis di README): apa yang menantang, apa yang dipelajari, apa yang akan ditambah jika punya waktu lebih.

---

## Tip & Strategi

1. **Mulai dari skeleton** — bikin trigger + 1 stub function yang Logger.log sukses, baru iterasi tambah fitur.
2. **Testing sebagai diri sendiri** — pakai email Anda sebagai semua role (karyawan, manager, admin) supaya gampang verifikasi.
3. **Audit log dari awal** — bikin `audit_log()` sejak commit pertama, jangan tinggalkan untuk akhir.
4. **Idempotent dari awal** — kalau Anda bisa run handler dua kali tanpa duplikat, debugging jadi gampang.
5. **Commit sering** — git commit per fitur kecil. Jangan tunggu sempurna.
6. **Capek → break** — Apps Script editor bisa stale setelah lama coding. Refresh browser membantu.

---

## Daftar Service & Modul Referensi

| Service | Modul referensi |
|---|---|
| JavaScript dasar | Modul 0 |
| Editor & deployment | Modul 1 |
| Drive / Docs / Calendar | Modul 2 |
| Sheets | Modul 3 |
| Gmail | Modul 4 |
| UI Forms | Modul 5 |
| Triggers | Modul 6 |
| Web Apps & API | Modul 7 |
| Multi-service integration | Modul 8 |

**Selamat mengerjakan! Hasil akhir Anda akan jadi bukti konkrit kemampuan otomatisasi Google Workspace.**
