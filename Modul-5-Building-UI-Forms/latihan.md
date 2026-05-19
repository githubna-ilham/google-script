# Latihan Modul 5 — Building UI Forms

**Konteks**: Lanjutan studi kasus admin **lembaga pelatihan** dari Modul 3. Sekarang admin yang tidak menulis kode butuh **antarmuka** untuk mengelola data — bukan run function manual di editor. Anda akan bikin custom menu, sidebar, modal, dan wizard yang manipulasi tab `Peserta` & `Program` lewat UI.

**Persiapan**:

1. Buat Google Sheet baru, beri nama `Latihan-M5`.
2. Buka **Extensions → Apps Script** dari dalam Sheet (script jadi container-bound).
3. Buat **dua tab** dengan struktur yang sama persis dengan latihan Modul 3:

   **Tab `Peserta`** (10 kolom):

   | ID Peserta | Tanggal Daftar | Nama | Email | Instansi | Program | Nilai | Status | Notif Email | Link Sertifikat |

   Isi 4–5 baris dummy (atau copy dari Sheet `Latihan-M3`).

   **Tab `Program`** (7 kolom):

   | Kode | Nama Program | Kapasitas | Biaya | Tanggal Mulai | Tanggal Selesai | Lokasi |

   Isi 3–4 program (mis. `GAS-101`, `GAS-201`, `GAS-301`, `GAS-401`).

4. Pastikan kolom tanggal di-format **Date** (Format → Number → Date).
5. Tambah file HTML di project sesuai instruksi tiap soal.

> Mau lebih cepat? **File → Make a copy** dari Sheet `Latihan-M3` Anda → rename ke `Latihan-M5`. Data sudah siap pakai.

---

## Soal 1 — Custom Menu Admin Pelatihan

Buat function `onOpen` yang membuat **dua menu side-by-side** di toolbar:

**Menu 1 — "Menu Pelatihan"** (versi flat, semua item di satu level):
1. Tambah peserta cepat (prompt) → `tambahPesertaCepat`
2. Konfirmasi hapus (alert) → `konfirmasiHapus`
3. Separator
4. Form Peserta (sidebar) → `bukaSidebarPeserta`
5. Form Program (modal) → `bukaModalProgram`
6. CRUD Peserta → `bukaSidebarCRUD`
7. Import Peserta dari Excel → `bukaUpload`

**Menu 2 — "Admin Pelatihan"** (versi bertingkat dengan sub-menu):
- Sub-menu **Peserta** → 3 item: Tambah cepat (prompt), Form (sidebar), Buka CRUD.
- Sub-menu **Program** → 2 item: Form tambah program, Lihat semua program.
- Separator + item: Import Excel.

Reload Sheet setelah save. Kedua menu harus muncul di toolbar.

> Hint: dua kali `ui.createMenu(...).addToUi()` dalam satu `onOpen()` bikin dua menu terpisah. Sub-menu pakai `addSubMenu(menuObject)`.

---

## Soal 2 — Form Tambah Peserta (Prompt 4 Step)

Buat function `tambahPesertaCepat()` yang **memakai `ui.prompt()` 4 kali** secara berurutan untuk mengumpulkan: Nama, Email, Instansi, Kode Program. Setelah semua input terkumpul → append baris baru ke tab `Peserta`.

Rules:
- ID Peserta auto-generate dengan format `PST-XXX` (3 digit, padding nol). Pakai `sheet.getLastRow()` sebagai sumber nomor.
- Tanggal Daftar auto = `new Date()`.
- Kalau user **Cancel di langkah manapun** → batalkan keseluruhan (tidak boleh ada baris setengah-jadi di Sheet).
- Hanya isi 6 kolom pertama (ID, Tanggal, Nama, Email, Instansi, Program). Kolom Nilai/Status/Notif Email/Link Sertifikat dibiarkan kosong.
- Setelah sukses, tampilkan alert konfirmasi: `"Peserta PST-009 (Nama) tersimpan."`.

> Hint: bikin helper kecil `tanya(judul, label)` yang bungkus `ui.prompt(...)` agar tidak repetitif.

---

## Soal 3 — Form Tambah Peserta (Sidebar) + Validasi Server

Tambah file HTML `ui-form-peserta` di project. Form berisi:
- Nama (text, required)
- Email (email, required)
- Instansi (text, required)
- Program (select — dropdown 3 program: `GAS-101`, `GAS-201`, `GAS-301`)
- Tombol Simpan

Buat function server:
- `bukaSidebarPeserta()` → tampilkan sidebar (lebar 320px).
- `simpanPeserta(formData)` → validasi server-side, append ke tab `Peserta`, return `{ ok, message, idBaru }`.

**Validasi server (wajib semua):**
1. Nama minimal 3 karakter.
2. Email harus berformat valid (regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
3. Program harus salah satu dari kode yang ada di tab `Program` (lookup, bukan hardcoded — kalau admin tambah program baru di tab `Program`, validator harus tetap jalan).
4. Email tidak boleh duplikat dengan email yang sudah ada di tab `Peserta`.

Kalau salah satu validasi gagal → `throw new Error(...)`. Form harus tampilkan pesan error di status bar (lewat `withFailureHandler`).

Test:
- Submit dengan email format salah → error muncul.
- Submit dengan email yang sudah ada → error muncul.
- Submit valid → status "Peserta PST-010 tersimpan", form reset.

---

## Soal 4 — Pre-fill Dropdown Program dari Tab `Program`

Lanjutan Soal 3: ubah dropdown **Program** dari hardcoded jadi **dinamis** — isinya diambil dari tab `Program`.

Tambah file HTML baru `ui-form-peserta-prefill` yang pakai **template scriptlet** (`<? ... ?>` dan `<?= ... ?>`). Server pakai `HtmlService.createTemplateFromFile(...)` dan injek `daftarProgram`.

Format option dropdown: `"{Kode} — {Nama Program}"`, value = kode saja (mis. `<option value="GAS-101">GAS-101 — Google Apps Script Fundamental</option>`).

Test: tambah program baru di tab `Program` → reload sidebar → dropdown otomatis update tanpa ubah kode.

> Hint: bikin helper server `_ambilDaftarProgram()` yang baca tab `Program` → return `[{kode, nama}, ...]`.

---

## Soal 5 — Konfirmasi Hapus Peserta (Alert)

Buat function `konfirmasiHapus()` yang bisa dipanggil dari menu. Flow:

1. Cek user lagi di tab `Peserta` (kalau bukan → alert "Pilih dulu baris di tab Peserta", return).
2. Ambil row yang sedang dipilih (`sheet.getActiveRange().getRow()`).
3. Validasi: row 1 (header) atau row di luar data → tampilkan alert sesuai.
4. Baca `ID Peserta` dan `Nama` di baris itu → tampilkan di **alert konfirmasi YES/NO** sebagai preview: `"Yakin mau menghapus peserta ini?\n\nPST-005 — Rina Wati (baris 6)"`.
5. Kalau YES → `sheet.deleteRow(row)` + alert sukses.
6. Kalau NO → tidak terjadi apa-apa.

> Test: pindah ke tab `Program`, run → harus muncul alert "Pilih dulu...". Pilih row 1 di Peserta → alert "Tidak bisa hapus header". Pilih row valid → konfirmasi muncul dengan info benar.

---

## Soal 6 — CRUD Sidebar untuk Peserta

Bikin sidebar lengkap (`bukaSidebarCRUD`) untuk tab `Peserta` dengan kemampuan:

1. **List** semua peserta dalam tabel HTML (kolom: ID, Nama, Email, Program, Status). Refresh button di atas.
2. Tombol **Edit** per baris → form pre-fill (Nama, Email, Instansi, Program dropdown, Nilai, Status dropdown). Submit → update baris di Sheet.
3. Tombol **Delete** per baris → `confirm()` dialog → hapus baris.
4. Tombol **+ Tambah baru** → buka form kosong (bisa pakai logic dari Soal 3).

Server function:
- `bacaSemuaPeserta()` → array of object dengan field `_row` (nomor baris di Sheet), supaya client tahu baris mana yang akan di-update saat edit.
- `simpanPeserta(record)` → kalau `record._row` ada → update; kalau tidak → append baru.
- `hapusPeserta(rowNumber)` → `sheet.deleteRow(rowNumber)`.

Validasi server di Soal 3 tetap jalan saat update.

---

## Soal 7 — Import Peserta dari Excel

Bikin sidebar `bukaUpload` dengan input `<input type="file" accept=".xlsx,.xls">` + tombol Import. Server function `importExcel(base64, fileName, mimeType)` melakukan:

1. Decode base64 → Blob.
2. Upload ke Drive sebagai Google Sheet (`Drive.Files.create({ mimeType: MimeType.GOOGLE_SHEETS }, blob)`) — auto-convert dari xlsx.
3. Baca isi Sheet hasil convert.
4. Validasi header: `Nama`, `Email`, `Instansi`, `Program` wajib ada.
5. **Mapping by header name** — file Excel hanya punya 4 kolom, tapi tab `Peserta` punya 10 kolom. Tiap nilai harus ditaruh di kolom yang **benar** di target, bukan dump dari kolom A.
6. **Auto-generate** `ID Peserta` (`PST-XXX`) dan `Tanggal Daftar` (sekarang) untuk tiap baris import.
7. `setValues` 1 round-trip ke tab `Peserta`.
8. **Cleanup**: hapus file Sheet temp di Drive (pakai `finally` block).

**Prasyarat**: enable **Advanced Drive Service** (Editor → Services → + → Drive API → v3).

**Format file Excel yang diharapkan** (baris 1 = header):

| Nama          | Email             | Instansi   | Program |
|---------------|-------------------|------------|---------|
| Sari Wulan    | sari@kantor.id    | PT Alpha   | GAS-101 |
| Budi Pratama  | budi@kantor.id    | PT Beta    | GAS-201 |

> Test: bikin file Excel kecil dengan 3 baris data → upload → cek tab Peserta. Data harus masuk ke kolom yang BENAR (Nama di kolom Nama, dst.), dan kolom ID Peserta + Tanggal Daftar terisi otomatis.

---

## Checklist Sebelum Lanjut

- [ ] Bisa bikin **dua menu** dalam satu `onOpen` (flat + bertingkat dengan sub-menu).
- [ ] Bisa pakai `ui.prompt()` berurutan untuk mengumpulkan beberapa input.
- [ ] Bisa bikin sidebar HTML dengan form, kirim ke server via `google.script.run`.
- [ ] Paham success/failure handler untuk tampilkan status sukses/error.
- [ ] Bisa pre-fill dropdown dari data Sheet pakai template scriptlet.
- [ ] Bisa konfirmasi destructive action (delete) dengan preview info baris.
- [ ] Bisa CRUD lengkap (list/edit/delete/add) dari sidebar untuk tab `Peserta`.
- [ ] Validasi server-side mandatory: format email, lookup program, cek duplikat.
- [ ] Bisa import xlsx via Advanced Drive Service dengan mapping kolom by header.

**Selanjutnya: Modul 6 — Workflow Automation (Triggers).**
