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

**Pseudocode**:
```
FUNCTION salamSesuaiJam():
    jam ← ambil jam sekarang (0-23)
    email ← ambil email user aktif

    JIKA jam antara 4 dan 11 MAKA salam ← "Selamat pagi"
    SELAIN ITU JIKA jam antara 11 dan 15 MAKA salam ← "Selamat siang"
    SELAIN ITU JIKA jam antara 15 dan 18 MAKA salam ← "Selamat sore"
    SELAIN ITU salam ← "Selamat malam"

    cetak (salam + ", " + email)
END FUNCTION
```

---

## Soal 2 — Email ke Diri Sendiri dengan Konten Dinamis

Buat function `kirimRingkasanHari()` yang mengirim email ke diri sendiri (alamat user aktif) dengan:
- **Subject**: `Ringkasan: <tanggal hari ini, format dd MMM yyyy>`
- **Body** berisi minimal 3 baris: salam, kalimat motivasi, tanda tangan.

Pakai `Utilities.formatDate` untuk tanggal dan `Session.getScriptTimeZone()` untuk timezone.

Verifikasi: cek inbox — email harus masuk dalam < 30 detik.

**Pseudocode**:
```
FUNCTION kirimRingkasanHari():
    email ← ambil email user aktif
    timezone ← ambil timezone script
    tanggal ← format tanggal hari ini sebagai "dd MMM yyyy"

    subject ← "Ringkasan: " + tanggal
    body ← gabungan baris berikut:
        "Halo,"
        ""
        "Hari ini adalah hari yang produktif. Lanjutkan!"
        ""
        "Salam,"
        "Bot Apps Script"

    kirim email (ke: email, subject: subject, body: body)
    cetak konfirmasi terkirim
END FUNCTION
```

---

## Soal 3 — Komposisi Function

Buat function-function kecil:
- `getJamSapaan()` → mengembalikan kata sapaan ("pagi", "siang", "sore", "malam") sesuai jam saat ini.
- `getNamaUser()` → mengembalikan nama user (dari email, ambil sebelum `@`).
- `bangunSapaan()` → menggabungkan keduanya jadi: `"Selamat <jam>, <nama>!"`.

Lalu function `tampilSapaan()` yang memanggil `bangunSapaan()` dan log hasilnya.

**Pseudocode**:
```
FUNCTION getJamSapaan():
    jam ← ambil jam sekarang
    JIKA jam antara 4 dan 11 KEMBALIKAN "pagi"
    JIKA jam antara 11 dan 15 KEMBALIKAN "siang"
    JIKA jam antara 15 dan 18 KEMBALIKAN "sore"
    KEMBALIKAN "malam"
END FUNCTION

FUNCTION getNamaUser():
    email ← ambil email user aktif
    bagian ← pecah email pakai "@"
    KEMBALIKAN bagian[0]    // ambil sebelum @
END FUNCTION

FUNCTION bangunSapaan():
    KEMBALIKAN "Selamat " + getJamSapaan() + ", " + getNamaUser() + "!"
END FUNCTION

FUNCTION tampilSapaan():
    cetak bangunSapaan()
END FUNCTION
```

---

## Soal 4 — Try/Catch Practice

Buat function `bagi(a, b)` yang mengembalikan `a / b`. Tambahkan validasi: kalau `b === 0`, **lempar error** dengan pesan `"Tidak bisa membagi dengan nol"`.

Buat function `ujiBagi()` yang memanggil `bagi(10, 2)` dan `bagi(10, 0)` di dalam blok `try/catch`. Untuk panggilan yang error, log pesan errornya tanpa menghentikan eksekusi.

> Hint: `throw new Error("...")`.

**Pseudocode**:
```
FUNCTION bagi(a, b):
    JIKA b sama dengan 0:
        LEMPAR Error("Tidak bisa membagi dengan nol")
    KEMBALIKAN a / b
END FUNCTION

FUNCTION ujiBagi():
    daftarKasus ← [(10, 2), (10, 0), (9, 3), (5, 0)]

    UNTUK SETIAP (a, b) DI daftarKasus:
        COBA:
            hasil ← bagi(a, b)
            cetak (a + " / " + b + " = " + hasil)
        TANGKAP error:
            cetak (a + " / " + b + " → ERROR: " + pesan error)
        // eksekusi tetap lanjut ke iterasi berikutnya
END FUNCTION
```

---

## Soal 5 — Mini-Project: Pencatat Aktivitas

Buat function `catatAktivitas(deskripsi)` yang:

1. Menerima parameter `deskripsi` (String).
2. Membuat object `{ waktu, user, deskripsi }`:
   - `waktu` = timestamp sekarang (format `yyyy-MM-dd HH:mm:ss`)
   - `user` = email user aktif
   - `deskripsi` = parameter input
3. Mencetak object tersebut sebagai JSON ke log.
4. Mengirim email konfirmasi ke user dengan subject `[Log Aktivitas] <deskripsi>` dan body berisi seluruh detail object.

Test dengan: `catatAktivitas("Selesai mengerjakan latihan Modul 1")`.

**Pseudocode**:
```
FUNCTION catatAktivitas(deskripsi):
    waktu ← format tanggal sekarang sebagai "yyyy-MM-dd HH:mm:ss"
    user  ← ambil email user aktif

    entry ← object {
        waktu:     waktu,
        user:      user,
        deskripsi: deskripsi
    }

    cetak entry sebagai JSON (rapi dengan indent)

    body ← gabungan baris:
        "Aktivitas tercatat:"
        ""
        "Waktu     : " + entry.waktu
        "User      : " + entry.user
        "Deskripsi : " + entry.deskripsi

    kirim email (
        ke:      user,
        subject: "[Log Aktivitas] " + deskripsi,
        body:    body
    )
END FUNCTION

FUNCTION ujiCatatAktivitas():
    catatAktivitas("Selesai mengerjakan latihan Modul 1")
END FUNCTION
```

**Service & method yang akan dipakai**:
- `Utilities.formatDate(date, timezone, pattern)` → format tanggal
- `Session.getActiveUser().getEmail()` → email user
- `Session.getScriptTimeZone()` → timezone
- `JSON.stringify(obj, null, 2)` → format JSON dengan indent 2 spasi
- `MailApp.sendEmail({ to, subject, body })` → kirim email

---

## Checklist Sebelum Lanjut ke Modul Berikutnya

- [ ] Saya berhasil menjalankan minimal 5 dari 7 soal di atas.
- [ ] Saya sudah menerima email dari script saya sendiri di inbox.
- [ ] Saya tahu cara melihat histori eksekusi di sidebar Executions.
- [ ] Saya bisa menulis function yang memanggil function lain.
- [ ] Saya tahu cara pakai `console.log`, `.info`, `.warn`, `.error`.
- [ ] Saya bisa menyebut minimal 5 nama service Apps Script.

**Selanjutnya: Modul 2 — Google Workspace Integration (Drive, Docs, Calendar).**
