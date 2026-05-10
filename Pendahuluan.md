# Pendahuluan

## Tentang Materi Ini

Materi **Google Apps Script for Business Automation** dirancang untuk mengajarkan cara mengotomatisasi pekerjaan sehari-hari menggunakan Google Workspace (Sheets, Gmail, Drive, Docs, Calendar). Setelah menyelesaikan semua modul, Anda akan mampu membuat script yang menghemat waktu berjam-jam menjadi hitungan detik — sekaligus membangun aplikasi internal sederhana yang siap dipakai tim Anda.

### Apa yang Akan Anda Pelajari?

| Tahap | Modul | Topik Utama |
|---|---|---|
| **Pre-class** | Modul 0 | JavaScript Dasar (variabel, kontrol, function, array, object) |
| **Fondasi** | Modul 1–2 | Pengenalan Apps Script, integrasi Drive/Docs/Calendar |
| **Inti** | Modul 3–4 | Otomasi Sheets dan Gmail |
| **Antarmuka** | Modul 5 | UI Forms (sidebar, modal, CRUD) |
| **Otomatisasi** | Modul 6 | Trigger time-driven & event-driven |
| **Integrasi** | Modul 7–8 | Web Apps, API eksternal, multi-service workflow |
| **Penutup** | Capstone | Project end-to-end mandiri |

### Apa yang Akan Anda Hasilkan?

Setelah menuntaskan materi, Anda bisa:
- Membuat script otomasi untuk Google Sheets (laporan, dashboard, data cleaning)
- Mengirim email otomatis dan personalisasi (mail merge, notifikasi, slip gaji)
- Mengelola file Google Drive secara otomatis (backup, organisasi, generate dokumen)
- Membuat workflow approval (pengajuan cuti, reimbursement, onboarding)
- Membuat web app sederhana sebagai portal internal
- Konsumsi & menerima webhook dari layanan luar (Slack, Telegram, dll)
- Menjadwalkan semua proses di atas agar berjalan otomatis

---

## Siapa yang Cocok Mengikuti?

Materi ini ditujukan untuk:

| Target Peserta | Contoh Kebutuhan |
|---|---|
| **Data Analyst** | Otomasi reporting, data cleaning, dashboard |
| **Business Analyst** | Workflow automation, integrasi data |
| **Operations Staff** | Otomasi proses operasional harian |
| **IT Support Staff** | Membuat tools internal, integrasi sistem |
| **Finance / HR / Admin** | Slip gaji otomatis, mail merge, approval workflow |
| **Google Workspace Power Users** | Meningkatkan produktivitas dengan scripting |

**Tidak perlu latar belakang programming.** Materi dimulai dari nol (Modul 0 — JavaScript Dasar) dan dirancang agar mudah diikuti oleh non-developer.

---

## Prerequisites (Prasyarat)

### Yang Wajib Dimiliki

1. **Akun Google** (Gmail atau Google Workspace)
   - Diperlukan untuk mengakses Google Sheets, Drive, Gmail, dan Apps Script editor.
   - Jika menggunakan akun kantor (Google Workspace), pastikan admin tidak memblokir akses ke Apps Script.

2. **Pengalaman menggunakan Google Sheets**
   - Bisa membuat dan mengedit spreadsheet.
   - Familiar dengan konsep: cell, row, column, sheet/tab.
   - Pernah menggunakan formula dasar (`SUM`, `IF`, `VLOOKUP` — tidak harus hafal).

3. **Browser modern**
   - Google Chrome (direkomendasikan), Firefox, atau Edge.
   - Apps Script editor berjalan sepenuhnya di browser.

### Yang Disarankan (Opsional)

4. **Pemahaman dasar spreadsheet formulas**
   - Jika Anda pernah menulis `=IF(A1>100, "Besar", "Kecil")`, Anda sudah punya dasar logika yang cukup.
   - Konsep formula akan membantu memahami function dan struktur kontrol di JavaScript.

5. **Pengetahuan dasar programming**
   - **Tidak wajib** — Modul 0 mengajarkan JavaScript dari nol.
   - Tapi jika Anda pernah menulis kode dalam bahasa apapun (Python, VBA, PHP, dll), Anda akan lebih cepat memahami materi.

---

## Persiapan Sebelum Memulai

### 1. Pastikan Akun Google Anda Aktif

Coba buka [Google Sheets](https://sheets.google.com) dan [Google Drive](https://drive.google.com). Jika bisa diakses, Anda siap.

### 2. Cek Akses ke Apps Script Editor

1. Buka [https://script.google.com](https://script.google.com) di browser.
2. Klik **+ New project**.
3. Jika editor terbuka dengan file `Code.gs` → Anda siap.
4. Jika muncul error "access denied" → hubungi admin IT Anda untuk mengaktifkan Apps Script.

### 3. Buat Folder Kerja di Drive

Buat folder di Google Drive untuk menyimpan semua file latihan:

```
Google Drive/
  └── Pelatihan Apps Script/
       ├── Latihan-M0/
       ├── Latihan-M2/
       ├── Latihan-M3/
       └── ...
```

### 4. (Opsional) Setup `clasp` untuk push lokal

Kalau Anda nyaman dengan terminal dan ingin mengembangkan kode di editor lokal (VS Code), install [clasp](https://github.com/google/clasp). Dengan clasp, kode di file `.js` di komputer bisa di-push ke Apps Script project.

```bash
npm install -g @google/clasp
clasp login
```

> **Tidak wajib.** Semua materi bisa diselesaikan langsung di editor browser di [script.google.com](https://script.google.com).

### 5. Mulai dari Modul 0

Apapun latar belakang Anda, mulailah dari **Modul 0 — JavaScript Dasar**. Bahkan jika Anda sudah familiar dengan JavaScript, modul ini singkat dan memastikan Anda nyaman dengan environment Apps Script Editor sebelum masuk ke modul-modul yang lebih kompleks.

---

## Struktur Materi

Setiap modul terdiri dari **4 file**:

| Komponen | File | Keterangan |
|---|---|---|
| **Materi pengantar** | `materi.md` | Penjelasan konsep + diagram Mermaid + contoh kode di setiap topik |
| **Kode contoh** | `contoh.js` | Function siap-jalan untuk di-copy ke Apps Script editor |
| **Latihan** | `latihan.md` | Soal latihan + pseudocode hint |
| **Solusi referensi** | `latihan-solusi.js` | Solusi referensi (gunakan setelah mencoba sendiri) |

Beberapa modul juga menyertakan file `.html` (template HTML untuk email atau UI form).

### Daftar Modul

| # | Modul | Fokus |
|---|---|---|
| 0 | [JavaScript Dasar](./Modul-0-JavaScript-Dasar/materi.md) | Variabel, kontrol, function, array, object |
| 1 | [Introduction to Google Apps Script](./Modul-1-Introduction-to-Google-Apps-Script/materi.md) | Editor, project pertama, peta service, console.log |
| 2 | [Google Workspace Integration](./Modul-2-Google-Workspace-Integration/materi.md) | Drive (file/folder), Docs (template), Calendar (event) |
| 3 | [Google Sheets Automation](./Modul-3-Google-Sheets-Automation/materi.md) | Range, batch operations, custom function, dashboard |
| 4 | [Gmail Automation](./Modul-4-Gmail-Automation/materi.md) | Kirim email, HTML template, attachment, search inbox |
| 5 | [Building UI Forms for Data Input](./Modul-5-Building-UI-Forms/materi.md) | Sidebar, modal, CRUD, `google.script.run` |
| 6 | [Workflow Automation](./Modul-6-Workflow-Automation/materi.md) | Trigger time-driven & event, PropertiesService, LockService |
| 7 | [Web Apps & API Integration](./Modul-7-Web-Apps-and-API-Integration/materi.md) | doGet/doPost, UrlFetchApp, webhook, bot |
| 8 | [Integrating Multiple Google Services](./Modul-8-Integrating-Multiple-Google-Services/materi.md) | Arsitektur multi-service, audit, idempotency |
| ⭐ | [Capstone Project](./Capstone-Project/brief.md) | Project end-to-end mandiri (Cuti / Onboarding / Aset) |

### Urutan Belajar yang Disarankan

```
Modul 0 → Modul 1 → Modul 2 → Modul 3 → Modul 4
                                            ↓
              Capstone ← Modul 8 ← Modul 7 ← Modul 6 ← Modul 5
```

Modul 0–4 berurutan, masing-masing membangun di atas sebelumnya. Modul 5–8 boleh dipilih sesuai kebutuhan, tapi **disarankan tetap berurutan** karena Modul 8 mengintegrasikan semua pattern dari modul-modul sebelumnya.

---

## Metodologi Belajar

| Komponen | Porsi | Keterangan |
|---|---|---|
| Konsep (`materi.md`) | 30% | Penjelasan teori, diagram, dan cara kerja |
| Hands-on (`contoh.js`) | 50% | Praktik langsung menjalankan kode contoh |
| Latihan (`latihan.md`) | 15% | Mengerjakan soal latihan secara mandiri |
| Refleksi & eksplorasi | 5% | Memahami pseudocode hint, baca dokumentasi |

### Cara Belajar yang Efektif

1. **Ketik sendiri, jangan copy-paste** — Mengetik kode membantu memahami struktur dan menghafal syntax.
2. **Jalankan setiap contoh** — Jangan hanya dibaca; jalankan dan lihat hasilnya di Execution log.
3. **Eksperimen** — Setelah menjalankan contoh, ubah nilai/parameter dan jalankan lagi. Apa yang terjadi?
4. **Baca pseudocode hint dulu** — Pseudocode di latihan membantu Anda memahami struktur sebelum tergoda lihat solusi.
5. **Coba minimal 15 menit per soal** — Kalau benar-benar stuck, baru buka `latihan-solusi.js`.
6. **Baca error message** — Pesan error di Execution log biasanya informatif dan menunjukkan letak masalah.
7. **Audit log adalah teman** — Sejak Modul 6, biasakan menyimpan log eksekusi ke Sheet — sangat berguna untuk debug workflow yang berjalan otomatis.

---

## Konvensi Kode di Materi Ini

| Konvensi | Alasan |
|---|---|
| `const` default, `let` kalau perlu, **tanpa** `var` | Sintaks modern (ES6+), lebih aman dari bug closure |
| `===` selalu, **bukan** `==` | Hindari hasil mengejutkan dari konversi tipe otomatis |
| **Template literal** untuk gabung string | Lebih ringkas dan mudah dibaca |
| **Arrow function** untuk callback | Lebih ringkas, cocok untuk `forEach/map/filter` |
| `console.log` (bukan `Logger.log`) | Lebih modern, support level severity (info/warn/error) |
| **Pseudocode bahasa Indonesia** untuk hint | Membantu pemula memahami struktur tanpa kebingungan syntax |

---

## Referensi Resmi

| Resource | URL |
|---|---|
| Apps Script Reference | [developers.google.com/apps-script/reference](https://developers.google.com/apps-script/reference) |
| SpreadsheetApp | [developers.google.com/apps-script/reference/spreadsheet](https://developers.google.com/apps-script/reference/spreadsheet) |
| GmailApp / MailApp | [developers.google.com/apps-script/reference/gmail](https://developers.google.com/apps-script/reference/gmail) |
| DriveApp | [developers.google.com/apps-script/reference/drive](https://developers.google.com/apps-script/reference/drive) |
| DocumentApp | [developers.google.com/apps-script/reference/document](https://developers.google.com/apps-script/reference/document) |
| CalendarApp | [developers.google.com/apps-script/reference/calendar](https://developers.google.com/apps-script/reference/calendar) |
| FormApp | [developers.google.com/apps-script/reference/forms](https://developers.google.com/apps-script/reference/forms) |
| UrlFetchApp | [developers.google.com/apps-script/reference/url-fetch](https://developers.google.com/apps-script/reference/url-fetch) |
| HtmlService | [developers.google.com/apps-script/reference/html](https://developers.google.com/apps-script/reference/html) |
| Script Quotas | [developers.google.com/apps-script/guides/services/quotas](https://developers.google.com/apps-script/guides/services/quotas) |
| Guides & Tutorial | [developers.google.com/apps-script/overview](https://developers.google.com/apps-script/overview) |

---

## Cara Menjalankan Kode Contoh

1. Buka [https://script.google.com](https://script.google.com) di browser.
2. Klik **+ New project**.
3. Beri nama project (misal: `Latihan-Modul-1`).
4. Buka file `contoh.js` dari modul yang sedang dipelajari, copy isinya ke `Code.gs` di project.
5. Save (Ctrl/Cmd + S).
6. Pilih function di dropdown **Select function**, lalu klik **Run** ▶.
7. Pertama kali menjalankan, klik **Review Permissions** → **Allow** untuk autorisasi.
8. Lihat output di panel **Execution log** (bawah editor).

> Beberapa modul (Modul 5 dan sebagian Modul 3) memerlukan project yang **container-bound** ke sebuah Sheet. Cara: buka Sheet → menu **Extensions → Apps Script** → editor terbuka. Container-bound memberi akses ke `getActiveSpreadsheet()` dan trigger `onEdit/onOpen`.

---

**Selamat belajar! Mulai dari:** [Modul 0 — JavaScript Dasar](./Modul-0-JavaScript-Dasar/materi.md)
