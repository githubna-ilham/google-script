# Latihan Modul 4 — Gmail Automation

**Persiapan**:
1. Project Apps Script baru, beri nama `Latihan-Modul-4`.
2. Tambah file HTML `template-konfirmasi` (klik + di sidebar → HTML), copy isi dari folder ini.
3. Untuk soal yang melibatkan Sheets, bikin Sheet `Latihan-M4` dengan tab sesuai kebutuhan soal.

---

## Soal 1 — Email Pertama

Buat function `kirimSalamPribadi()` yang:
- Mengambil email + nama (sebelum `@`) user aktif.
- Mengirim email ke diri sendiri dengan subject `Halo, <nama>!` dan body HTML berisi salam + jam saat ini.

---

## Soal 2 — Cek Quota dan Pengaman

Buat function `kirimAman(daftarEmail, subject, htmlBody)` yang menerima array email penerima. Sebelum kirim:
1. Cek `MailApp.getRemainingDailyQuota()`.
2. Kalau quota < panjang `daftarEmail`, log warning dan **tidak mengirim apapun**.
3. Kalau cukup, kirim ke semua dan log "Sukses: N email terkirim".

Test dengan `kirimAman([emailAndaSendiri], "Test", "<p>Hai</p>")`.

---

## Soal 3 — Newsletter HTML dari Template

1. Tambahkan file HTML `template-newsletter.html` di project. Buat layout newsletter dengan judul, paragraf, dan footer.
2. Buat function `kirimNewsletter(daftarPenerima)` yang merender template dengan data dinamis (judul, isi, namaProgram) lalu kirim ke semua penerima.

Test dengan daftar yang isinya cuma email Anda sendiri.

---

## Soal 4 — Attachment Multi-File

Buat function `kirimDenganLampiran()` yang:
1. Bikin **2 attachment**:
   - Attachment 1: blob TXT dengan nama `info.txt`, isi `"Dibuat <tanggal>"`.
   - Attachment 2: blob CSV `data.csv` berisi 3 baris dummy.
2. Kirim ke email Anda sendiri dengan kedua attachment sekaligus.

Verifikasi: cek inbox — email harus masuk dengan **2 attachment** tampak di icon paper-clip.

---

## Soal 5 — Inbox Audit Mingguan

Buat function `auditInbox7Hari()` yang:
1. Cari semua thread dalam **7 hari terakhir** (`newer_than:7d`) yang belum dibaca.
2. Kelompokkan berdasarkan domain pengirim (`@gmail.com`, `@kantor.id`, dll). Cara ambil domain: `email.split("@")[1]`.
3. Log: total per domain, sorted descending.

Output sample:
```
@kantor.id     : 12 email
@gmail.com     : 5 email
@partner.com   : 2 email
```

---

## Soal 6 — Auto-Save Attachment

Buat function `simpanLampiranKePDF()` yang:
1. Cari thread dengan `has:attachment subject:invoice newer_than:30d` dan **belum punya label** `Saved-Invoice`.
2. Untuk tiap attachment yang **PDF**:
   - Simpan ke folder Drive `Invoices/<bulan-tahun>` (bikin folder kalau belum ada).
   - Beri nama: `<tanggal>-<nama-asli>.pdf`.
3. Setelah selesai 1 thread, beri label `Saved-Invoice` ke thread tersebut.

> Hint: cek MIME type attachment dengan `att.getContentType()`. PDF = `application/pdf`.

---

## Soal 7 — Mini-Project: Auto-Reply Pengaduan + Eskalasi

Skenario: Sheet `Pengaduan` memiliki kolom `Email | Judul | Deskripsi | Prioritas | Status | Auto-Reply Time | Tim PIC`. Prioritas bisa: `Rendah`, `Sedang`, `Tinggi`.

Buat function `prosesPengaduan()` yang untuk tiap baris dengan `Status = Baru`:
1. Kirim email konfirmasi ke `Email` (HTML, pakai template).
2. Set `Status = Auto-Replied`, isi `Auto-Reply Time`.
3. **Eskalasi**:
   - Prioritas `Tinggi` → kirim email tambahan ke `escalation@team.id` (atau email Anda untuk testing) dengan subject `[ESKALASI TINGGI] <judul>`, isi seluruh data baris.
   - Sekaligus isi `Tim PIC = "Manager"` di kolom yang sama.
   - Prioritas `Sedang` → `Tim PIC = "Senior CS"`.
   - Prioritas `Rendah` → `Tim PIC = "CS Junior"`.

Tulis kembali Sheet dalam **1 round-trip**.

---

## Checklist Sebelum Lanjut

- [ ] Bisa kirim email plain & HTML dengan opsi lengkap.
- [ ] Bisa pakai HtmlService template untuk maintainability.
- [ ] Bisa lampirkan file dari Drive, CSV blob, dan PDF dari Doc.
- [ ] Bisa search dan iterasi thread/message Gmail.
- [ ] Bisa simpan attachment ke Drive dengan label idempotent.
- [ ] Paham pola eskalasi conditional logic untuk auto-reply.

**Selanjutnya: Modul 5 — Building UI Forms for Data Input.**
