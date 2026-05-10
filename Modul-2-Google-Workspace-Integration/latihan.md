# Latihan Modul 2 — Google Workspace Integration

**Petunjuk umum**:
1. Buat project Apps Script baru, beri nama `Latihan-Modul-2`.
2. **Persiapan Drive**: bikin satu folder kosong di My Drive bernama `Latihan-M2`. Copy ID folder dari URL (`https://drive.google.com/drive/folders/<ID>`).
3. **Persiapan Doc template**: bikin satu Google Doc bernama `Template-Surat`. Isi minimal:
   ```
   Kepada: {{nama}}
   Tanggal: {{tanggal}}

   Dengan ini kami informasikan nominal sebesar {{nominal}}.
   ```
   Copy ID Doc dari URL.
4. Set kedua ID sebagai konstanta di awal kode Anda:
   ```javascript
   const FOLDER_ID = "1AbcXyz...";
   const TEMPLATE_ID = "1MnoPqr...";
   ```
5. Coba mandiri minimal 15 menit per soal sebelum buka `latihan-solusi.js`.

---

## Soal 1 — Eksplorasi Folder

Buat function `inventarisFolder()` yang:
1. Mengambil folder `Latihan-M2` dengan `FOLDER_ID`.
2. Membuat 3 sub-folder: `Input`, `Output`, `Arsip`.
3. Membuat 1 file teks (`.txt`) di tiap sub-folder dengan isi nama sub-folder tersebut.
4. Log struktur akhir dengan format:
   ```
   Latihan-M2/
     Input/  → 1 file
     Output/ → 1 file
     Arsip/  → 1 file
   ```

> Hint: pakai `folder.createFolder(...)` dan `subFolder.createFile(name, content, mimeType)`.

---

## Soal 2 — Audit File Lama

Buat function `auditFileLama(thresholdHari)` yang menerima jumlah hari sebagai parameter, lalu:
1. Mencari semua file di **My Drive** yang **terakhir di-modify lebih dari `thresholdHari` hari yang lalu**.
2. Membatasi maksimal 20 hasil pertama (untuk test, hindari list ribuan file).
3. Log: nama file, MIME type, tanggal terakhir update.

Test dengan `auditFileLama(180)` (file yang tidak diupdate > 6 bulan).

> Hint: pakai `DriveApp.searchFiles("modifiedDate < '<tanggal>'")`. Tanggal harus format `yyyy-MM-dd`. Konstruksi tanggalnya pakai `Utilities.formatDate`.

---

## Soal 3 — Generator Surat Massal

Diberikan data:
```javascript
const peserta = [
  { nama: "Sari Wulandari", nominal: "Rp 5.000.000" },
  { nama: "Budi Santoso",   nominal: "Rp 3.500.000" },
  { nama: "Tina Permata",   nominal: "Rp 7.200.000" }
];
```

Buat function `generateSuratMassal()` yang:
1. Untuk setiap peserta, copy `Template-Surat` ke folder `Latihan-M2`.
2. Beri nama hasil: `Surat - <nama peserta>`.
3. Replace `{{nama}}`, `{{tanggal}}` (hari ini), dan `{{nominal}}` dengan data peserta.
4. Log URL setiap surat yang berhasil dibuat.

Verifikasi: cek folder `Latihan-M2` di Drive — harus ada 3 file Doc.

---

## Soal 4 — Doc Laporan dari Data

Buat function `bikinLaporanHarian()` yang menerima array data berikut:
```javascript
const transaksi = [
  { id: "T001", customer: "PT Alpha", nilai: 5000000 },
  { id: "T002", customer: "PT Beta",  nilai: 3500000 },
  { id: "T003", customer: "PT Gamma", nilai: 7200000 }
];
```

Lalu:
1. Bikin Google Doc baru bernama `Laporan-<tanggal-hari-ini>`.
2. Heading 1: "Laporan Transaksi Harian".
3. Paragraf info: tanggal dan total transaksi.
4. **Tabel** dengan kolom: ID | Customer | Nilai (format Rp).
5. Paragraf akhir: total nilai semua transaksi.
6. Pindah Doc ke folder `Latihan-M2`.
7. Log URL Doc.

> Hint untuk tabel: `body.appendTable([["header1","header2"], ["row1col1","row1col2"], ...])`.

---

## Soal 5 — Export ke PDF

Lanjutan Soal 4: buat function `bikinLaporanDanPDF()` yang:
1. Menjalankan logika Soal 4 (bikin Doc).
2. Setelah Doc selesai, export ke PDF dengan nama `Laporan-<tanggal>.pdf`.
3. Simpan PDF di folder yang sama.
4. Log URL PDF.

---

## Soal 6 — Reminder Hari Libur

Buat function `bikinLibur()` yang membuat **3 event all-day** di kalender default Anda untuk simulasi hari libur:
- Tanggal 1 bulan depan: "Liburan Demo A"
- Tanggal 5 bulan depan: "Liburan Demo B"
- Tanggal 10 bulan depan: "Liburan Demo C"

Tiap event punya deskripsi `"Dibuat otomatis lewat Apps Script"`.

> Hint: gunakan `Date` object, `setDate()`, `setMonth()`. Untuk bulan depan: ambil bulan sekarang +1.

---

## Soal 7 — Cek Bentrok Jadwal

Buat function `cekBentrok(mulaiISO, selesaiISO)` yang:
1. Menerima dua string ISO datetime (mulai & selesai event yang ingin dibuat).
2. Cek apakah di rentang waktu itu sudah ada event lain di kalender default.
3. Return:
   - `true` kalau bentrok (return juga daftar judul event yang bentrok via `console.log`).
   - `false` kalau bebas.

Test:
```javascript
console.log(cekBentrok("2026-05-15T10:00:00+07:00", "2026-05-15T11:00:00+07:00"));
```

> Hint: `cal.getEvents(mulai, selesai)` mengembalikan array event yang **overlap** dengan rentang itu.

---

## Soal 8 — Mini-Project: Sistem Booking Ruang Rapat

Skenario: setiap hari Senin pagi, kita ingin auto-create event "Standup Tim" di kalender, **tapi hanya kalau belum ada event judul sama di slot tersebut** (idempotent).

Buat function `bookingStandup(judul, mulaiISO, selesaiISO)` yang:
1. Cek apakah sudah ada event dengan **judul persis** sama yang overlap rentang waktu yang diminta.
2. Kalau **sudah ada**: log "Sudah ada event: <judul>" — tidak bikin duplikat.
3. Kalau **belum ada**: bikin event baru, log "Berhasil booking: <id>".
4. Plus: bikin Doc "Notulen — <judul> — <tanggal>" di folder `Latihan-M2/Notulen` (bikin folder kalau belum ada), tempelkan link Doc ke deskripsi event.

Test panggilan dua kali:
```javascript
bookingStandup("Standup Demo", "2026-05-25T09:00:00+07:00", "2026-05-25T09:30:00+07:00");
bookingStandup("Standup Demo", "2026-05-25T09:00:00+07:00", "2026-05-25T09:30:00+07:00"); // harus skip
```

---

## Checklist Sebelum Lanjut ke Modul Berikutnya

- [ ] Saya berhasil menjalankan minimal 6 dari 8 soal.
- [ ] Saya nyaman dengan pola iterator (`hasNext`/`next`) di Drive.
- [ ] Saya bisa template Doc dengan `replaceText`.
- [ ] Saya tahu beda iterator Drive vs array Calendar.
- [ ] Saya bisa export Doc ke PDF dan menyimpannya di Drive.
- [ ] Saya tahu konsep "cek-lalu-buat" (idempotent) dan kenapa itu penting.

**Selanjutnya: Modul 3 — Google Sheets Automation.**
