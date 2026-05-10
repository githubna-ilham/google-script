# Latihan Modul 5 — Building UI Forms

**Persiapan**:
1. Buat Google Sheet baru, beri nama `Latihan-M5`.
2. Buka **Extensions → Apps Script** dari dalam Sheet (script jadi container-bound).
3. Buat tab `Karyawan` dengan header: `Nama | Divisi | Gaji | Tanggal Daftar`.
4. Buat tab `Aset` (untuk soal 5–7) dengan header: `Kode | Nama Aset | Kategori | Tahun | Nilai`.
5. Tambah file HTML di project sesuai instruksi tiap soal.

---

## Soal 1 — Custom Menu

Buat function `onOpen` yang membuat menu **"⚡ Otomasi M5"** dengan minimal 4 item:
1. Halo (alert sederhana — cuma tampil "Halo")
2. Tambah Cepat (prompt input nama, append ke Karyawan)
3. Refresh Tanggal (untuk semua baris di Karyawan, isi kolom Tanggal Daftar dengan hari ini)
4. Buka Form (sidebar — soal 2)

Reload sheet setelah save. Menu harus muncul di toolbar.

---

## Soal 2 — Form Tambah Karyawan (Sidebar)

Tambah file HTML `form-karyawan` di project. Form berisi:
- Nama (text, required)
- Divisi (select: Finance/Marketing/IT/HR/Ops)
- Gaji (number, min 0)
- Tombol Simpan

Buat function:
- `bukaFormKaryawan()` → tampilkan sidebar.
- `tambahKaryawan(formData)` → validasi server-side, append ke tab Karyawan, return `{ ok, message }`.

Validasi server:
- Nama minimal 2 karakter.
- Divisi harus salah satu dari list di atas.
- Gaji ≥ 0 dan ≤ 100.000.000.

Form harus tampilkan status sukses/error setelah submit.

---

## Soal 3 — Validasi Nama Unik

Lanjutan Soal 2: tambahkan validasi server **"Nama tidak boleh duplikat"**. Throw error kalau nama sudah ada di Sheet.

Test: coba tambah karyawan dengan nama yang sudah ada → harus muncul pesan error di form.

---

## Soal 4 — Form Pre-fill Daftar Divisi

Buat function `bukaFormDinamis()` yang membuka sidebar dengan dropdown Divisi yang isinya **diambil dari kolom Divisi tab Karyawan** (unique values), bukan hardcoded.

Pakai template HTML (`HtmlService.createTemplateFromFile`) dan injek list divisi dari server.

> Hint: ambil unique values dengan `[...new Set(arr)]`.

---

## Soal 5 — CRUD Sidebar untuk Aset

Bikin sidebar lengkap untuk tab `Aset` dengan kemampuan:
1. List semua aset (refresh button).
2. Klik Edit → form pre-fill, submit update.
3. Klik Delete → konfirmasi, hapus baris.
4. Tombol "Tambah baru" → form kosong, submit append.

Server function yang dibutuhkan:
- `bacaSemuaAset()` → array of object dengan `_row`.
- `simpanAset(record)` → kalau `_row` ada → update; kalau tidak → append baru.
- `hapusAset(rowNumber)` → deleteRow.

---

## Soal 6 — Filter & Search di Sidebar

Lanjutan Soal 5: tambahkan **input search** di atas list Aset.
- Saat user mengetik, filter list **di client-side** (tanpa panggil server) berdasarkan match di kolom Nama Aset atau Kode (case-insensitive).
- Setelah selesai filter, tampilkan jumlah hasil di status bar.

---

## Soal 7 — Wizard Modal 3 Step

Buat **modal dialog** (bukan sidebar) untuk import aset dengan flow:

**Step 1**: Upload data (paste CSV ke textarea, format: `kode,nama,kategori,tahun,nilai`).
**Step 2**: Preview data yang di-parse — tampil sebagai tabel HTML, user bisa cek.
**Step 3**: Konfirmasi → server `bulkInsertAset(rows)` → tutup modal & log jumlah row yang masuk.

UI: 3 panel di dalam satu modal, navigasi Next/Back. Server function `bulkInsertAset` harus memvalidasi tiap baris (error kalau ada baris invalid, tampilkan di Step 2).

---

## Checklist Sebelum Lanjut

- [ ] Bisa bikin custom menu via `onOpen`.
- [ ] Bisa tampil dialog dan sidebar HTML.
- [ ] Paham `google.script.run` dengan success/failure handler.
- [ ] Bisa pre-fill form pakai template + variable injection.
- [ ] Bisa CRUD lengkap dari sidebar (read/update/delete/create).
- [ ] Validasi server-side mandatory; client-side untuk UX.
- [ ] Bisa bikin wizard multi-step di satu modal.

**Selanjutnya: Modul 6 — Workflow Automation (Triggers).**
