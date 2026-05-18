# Latihan Modul 3 — Google Sheets Automation

**Konteks**: Anda mengelola data peserta sebuah **lembaga pelatihan**. Tiga latihan di bawah fokus pada **integrasi Sheets dengan service Workspace lain** yang sudah dipelajari di Modul 2:

| Soal | Integrasi |
|---|---|
| Soal 1 | Sheets ↔ **Gmail** (mail merge sertifikat) |
| Soal 2 | Sheets ↔ **Google Docs** (generate Surat Keterangan Lulus) |
| Soal 3 | Sheets ↔ **Calendar** (jadwal pelatihan + undang peserta) |

**Persiapan**:

1. Buat satu Google Sheet baru, beri nama `Latihan-M3`. Copy ID-nya.
2. Buat **dua tab**: `Peserta` dan `Program`.
3. Buat **satu folder** di Drive bernama `Latihan-M3-Output` (untuk menampung Doc yang digenerate di Soal 2). Copy ID folder dari URL-nya.

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
- `Tanggal Daftar`: **Format → Number → Date** (yyyy-mm-dd).
- `Nilai`: Number biasa (0–100); biarkan kosong untuk peserta yang belum dinilai.
- `Email`: minimal **2 baris** harus email Anda sendiri (untuk Soal 1).
- `Notif Email` & `Link Sertifikat`: kosongkan — akan diisi otomatis oleh script.

### Tab `Program`

| Kode    | Nama Program                    | Kapasitas | Biaya    | Tanggal Mulai | Tanggal Selesai | Lokasi          |
|---------|---------------------------------|-----------|----------|---------------|-----------------|-----------------|
| GAS-101 | Google Apps Script Fundamental  | 30        | 1500000  | 2026-06-01    | 2026-06-03      | Online (Meet)   |
| GAS-201 | Sheets & Gmail Automation       | 25        | 2000000  | 2026-06-08    | 2026-06-10      | Online (Meet)   |
| GAS-301 | Web Apps & API Integration      | 20        | 2500000  | 2026-06-15    | 2026-06-17      | Jakarta (Onsite)|
| GAS-401 | Multi-Service Integration       | 15        | 3000000  | 2026-06-22    | 2026-06-24      | Jakarta (Onsite)|
| GAS-501 | Capstone & Mentoring            | 10        | 5000000  | 2026-06-29    | 2026-07-01      | Online (Meet)   |

**Format kolom**:
- `Tanggal Mulai` & `Tanggal Selesai`: **Format → Number → Date**.
- `Biaya`: Number biasa.

4. Set `SHEET_ID` dan `FOLDER_ID` di awal kode Anda.

---

## Soal 1 — Sheets ↔ Gmail: Mail Merge Sertifikat

Buat function `kirimSertifikatEmail()` yang:

1. Baca tab `Peserta` dan tab `Program`. Bikin Map `kode → namaProgram` dari tab `Program` untuk lookup.
2. Untuk setiap baris dengan `Status = Lulus` **DAN** `Notif Email` masih kosong:
   - Kirim email via `MailApp.sendEmail({...})` ke `Email` peserta:
     - **Subject**: `[Sertifikat] {Nama Program} — {Nama Peserta}`
     - **Body**: ucapan selamat + ringkasan (Nama, Program, Nilai).
   - Isi `Notif Email` dengan timestamp (`yyyy-MM-dd HH:mm`).
3. Tulis ulang kolom `Notif Email` ke Sheet **dalam 1× `setValues`** untuk seluruh kolom.
4. Log jumlah email yang dikirim.

**Test idempotent**:
- Run pertama → kirim email ke semua baris `Lulus`.
- Run kedua **tanpa ganti apa-apa** → log `"0 email dikirim"`.

> Kuota Gmail gratis: 100 email/hari. Untuk testing aman dengan 4–5 baris `Lulus` di sample data.

---

## Soal 2 — Sheets ↔ Google Docs: Generate Surat Keterangan Lulus

Buat function `generateSuratKeterangan()` yang:

1. Untuk setiap baris dengan `Status = Lulus` **DAN** `Link Sertifikat` masih kosong:
   - Bikin Doc baru via `DocumentApp.create("Surat Keterangan - {Nama Peserta}")`.
   - Isi body Doc dengan template berikut (pakai `body.appendParagraph` / `setHeading`):

     ```
     SURAT KETERANGAN LULUS                         ← Heading 1, centered

     Nomor: SKL/{ID Peserta}/{tahun-bulan}

     Dengan ini menyatakan bahwa:

     Nama         : {Nama Peserta}
     Instansi     : {Instansi}
     Program      : {Nama Program}
     Periode      : {Tanggal Mulai} s.d. {Tanggal Selesai}
     Nilai Akhir  : {Nilai}

     telah dinyatakan LULUS dan berhak mendapatkan sertifikat.

     Jakarta, {tanggal hari ini}
     Penyelenggara Pelatihan
     ```
   - Pindahkan Doc tersebut ke folder `Latihan-M3-Output` (`DriveApp.getFileById(doc.getId()).moveTo(folder)`).
   - Tulis URL Doc (`doc.getUrl()`) ke kolom `Link Sertifikat` baris peserta tersebut.
2. Tulis ulang kolom `Link Sertifikat` ke Sheet **dalam 1× `setValues`**.
3. Log: `N Doc dibuat di folder Latihan-M3-Output.`

**Test idempotent**: run kedua tanpa ganti apa-apa → log `"0 Doc dibuat"`.

> Hint: `body.getParagraphs()[0].setHeading(DocumentApp.ParagraphHeading.HEADING1)`. Untuk nomor surat pakai `Utilities.formatDate(new Date(), tz, "yyyy-MM")`.

---

## Soal 3 — Sheets ↔ Calendar: Jadwal Pelatihan + Undangan Peserta

Buat function `buatJadwalPelatihan()` yang:

1. Baca tab `Program` dan tab `Peserta`.
2. Untuk setiap program di tab `Program`:
   - Kumpulkan **daftar email peserta** yang terdaftar di program itu **DAN** status-nya bukan `Tidak Lulus` (jadi: `Lulus` + `Sedang Berjalan`).
   - Bikin event di kalender default (`CalendarApp.getDefaultCalendar().createEvent(...)`):
     - **Title**: `{Kode} — {Nama Program}`
     - **Start**: `Tanggal Mulai` jam 09:00 (waktu lokal).
     - **End**: `Tanggal Selesai` jam 17:00.
     - **Description**: `"Lokasi: {Lokasi}\nBiaya: Rp {biaya}"`.
     - **Guests**: daftar email peserta (di-join koma).
     - **sendInvites**: `true`.
   - Tambahkan kolom `Event ID` di tab `Program` (kalau belum ada) dan isi dengan `event.getId()`.
3. **Idempotent**: kalau kolom `Event ID` di baris program sudah terisi, **skip** program itu (jangan duplikat event).
4. Log jumlah event baru yang dibuat.

> Hint: `CalendarApp.createEvent(title, start, end, { description, guests, sendInvites })`. Untuk set jam: `new Date(tanggal.getFullYear(), tanggal.getMonth(), tanggal.getDate(), 9, 0)`.
>
> ⚠️ **Hati-hati saat test**: `sendInvites: true` akan benar-benar kirim undangan ke email peserta. Untuk latihan, ganti dulu email peserta dengan email Anda sendiri (minimal 1 program), atau set `sendInvites: false` saat test pertama.

---

## Checklist Sebelum Lanjut ke Modul Berikutnya

- [ ] Saya bisa kirim email mail-merge dari data Sheet (`MailApp.sendEmail`).
- [ ] Saya bisa generate Google Doc dari data Sheet dan simpan ke folder Drive.
- [ ] Saya bisa bikin Calendar event dengan guest yang di-lookup dari data Sheet.
- [ ] Saya selalu pakai `getValues`/`setValues` (bukan loop per-cell) dan pola Header→Object.
- [ ] Saya paham pola **idempotent marker** untuk hindari duplikat email/Doc/event saat re-run.

**Selanjutnya: Modul 4 — Gmail Automation.**
