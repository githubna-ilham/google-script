# Latihan Modul 1 — Introduction to Google Apps Script

**Petunjuk umum**:
1. Buat project baru di [script.google.com](https://script.google.com), beri nama `Latihan-Modul-1`.
2. Tiap soal = 1 function. Beri nama function persis seperti yang diminta.
3. Verifikasi hasil di Execution log atau inbox email Anda.
4. Coba mandiri dulu **minimal 15 menit per soal** sebelum buka `latihan-solusi.js`.

---

## Soal 1 — Salam Berdasarkan Waktu

Buat function `salamSesuaiJam()` yang mengambil jam saat ini lalu mencetak ke log:
- Jam 4–11 → "Selamat pagi"
- Jam 11–15 → "Selamat siang"
- Jam 15–18 → "Selamat sore"
- Jam 18–4 → "Selamat malam"

Diakhiri dengan email user yang sedang menjalankan script.
Contoh output: `Selamat pagi, ilham@example.com`

> Hint: `new Date().getHours()`, `Session.getActiveUser().getEmail()`.

---

## Soal 2 — Email ke Diri Sendiri dengan Konten Dinamis

Buat function `kirimRingkasanHari()` yang mengirim email ke diri sendiri (alamat user aktif) dengan:
- **Subject**: `Ringkasan: <tanggal hari ini, format dd MMM yyyy>`
- **Body** berisi minimal 3 baris: salam, kalimat motivasi, tanda tangan.

Pakai `Utilities.formatDate` untuk tanggal dan `Session.getScriptTimeZone()` untuk timezone.

Verifikasi: cek inbox — email harus masuk dalam < 30 detik.

---

## Soal 3 — Helper Function untuk Format Rupiah

Buat function `formatRupiah(angka)` yang mengembalikan string rupiah Indonesia.
Contoh: `formatRupiah(2500000)` → `"Rp 2.500.000"`.

Lalu buat function `ujiFormatRupiah()` yang menguji 5 nilai berbeda dan mencetak hasilnya.

> Hint: `angka.toLocaleString("id-ID")`.

---

## Soal 4 — Komposisi Function

Buat function-function kecil:
- `getJamSapaan()` → mengembalikan kata sapaan ("pagi", "siang", "sore", "malam") sesuai jam saat ini.
- `getNamaUser()` → mengembalikan nama user (dari email, ambil sebelum `@`).
- `bangunSapaan()` → menggabungkan keduanya jadi: `"Selamat <jam>, <nama>!"`.

Lalu function `tampilSapaan()` yang memanggil `bangunSapaan()` dan log hasilnya.

---

## Soal 5 — Try/Catch Practice

Buat function `bagi(a, b)` yang mengembalikan `a / b`. Tambahkan validasi: kalau `b === 0`, **lempar error** dengan pesan `"Tidak bisa membagi dengan nol"`.

Buat function `ujiBagi()` yang memanggil `bagi(10, 2)` dan `bagi(10, 0)` di dalam blok `try/catch`. Untuk panggilan yang error, log pesan errornya tanpa menghentikan eksekusi.

> Hint: `throw new Error("...")`.

---

## Soal 6 — Eksplorasi Service

Tanpa melihat dokumentasi resmi, **berdasarkan intuisi nama**, tebak service apa yang Anda pakai untuk:

1. Membuat folder baru di Drive — `____.createFolder("Folder Baru")`
2. Mengirim email — `____.sendEmail(...)`
3. Membaca isi cell A1 di sebuah Sheet — `____...getRange("A1").getValue()`
4. Membuat event di Calendar besok jam 10 pagi — `____.createEvent(...)`
5. Memanggil API cuaca eksternal lewat HTTP — `____.fetch(url)`

Tulis jawaban sebagai komentar di kode Anda. Cek di tabel Modul 1 §4 untuk verifikasi.

---

## Soal 7 — Mini-Project: Pencatat Aktivitas

Buat function `catatAktivitas(deskripsi)` yang:

1. Menerima parameter `deskripsi` (String).
2. Membuat object `{ waktu, user, deskripsi }`:
   - `waktu` = timestamp sekarang (format `yyyy-MM-dd HH:mm:ss`)
   - `user` = email user aktif
   - `deskripsi` = parameter input
3. Mencetak object tersebut sebagai JSON ke log.
4. Mengirim email konfirmasi ke user dengan subject `[Log Aktivitas] <deskripsi>` dan body berisi seluruh detail object.

Test dengan: `catatAktivitas("Selesai mengerjakan latihan Modul 1")`.

---

## Checklist Sebelum Lanjut ke Modul Berikutnya

- [ ] Saya berhasil menjalankan minimal 5 dari 7 soal di atas.
- [ ] Saya sudah menerima email dari script saya sendiri di inbox.
- [ ] Saya tahu cara melihat histori eksekusi di sidebar Executions.
- [ ] Saya bisa menulis function yang memanggil function lain.
- [ ] Saya tahu cara pakai `console.log`, `.info`, `.warn`, `.error`.
- [ ] Saya bisa menyebut minimal 5 nama service Apps Script.

**Selanjutnya: Modul 2 — Google Workspace Integration (Drive, Docs, Calendar).**
