# Latihan Modul 8 — Sistem Cuti

Materi sudah berbentuk langkah praktek. **Latihan ini adalah pengembangan dari sistem cuti yang sudah Anda bangun di `materi.md`.**

Pastikan sistem dasar (Langkah 0–6 di materi.md) sudah jalan sebelum mengerjakan latihan ini.

---

## Soal 1 — Validasi Tanggal

Karyawan kadang iseng mengajukan cuti untuk tanggal yang sudah lewat, atau tanggal selesai sebelum tanggal mulai. Tambah validasi di `pengajuanCutiHandler`:

1. **Tanggal Mulai harus ≥ hari ini.** Kalau tidak → tolak dengan email yang menjelaskan alasan.
2. **Tanggal Selesai harus ≥ Tanggal Mulai.** Kalau tidak → tolak.
3. **Maksimal 14 hari per pengajuan.** Kalau lebih → tolak.

Audit semua kasus tolak ini dengan aksi `tolak-validasi`.

> 💡 **Hint**: bandingkan tanggal pakai `new Date(...) < new Date()`. Untuk membandingkan "tanggal saja" tanpa jam, normalisasi dulu dengan `.setHours(0,0,0,0)`.

---

## Soal 2 — Halaman Status Pribadi

Tambah rute Web App `?page=status&email=...` yang menampilkan tabel HTML berisi riwayat pengajuan cuti karyawan tersebut dari tab `Pengajuan-Cuti`.

Kolom yang ditampilkan: Tanggal Mulai | Tanggal Selesai | Jenis | Status.

Tambahkan baris terakhir di halaman: **"Sisa kuota Anda: X hari"**.

> 💡 **Hint**: di `doGet`, tambah cabang `if (e.parameter.page === "status")` sebelum logika approve/reject yang sekarang.

---

## Soal 3 — Reminder Cuti Besok

Buat function `reminderCutiBesok()` yang dijalankan **setiap hari pukul 17:00** dan:

1. Baca tab `Pengajuan-Cuti`, filter Status = `Approved`.
2. Cari yang `Tanggal Mulai` = besok.
3. Untuk tiap pengajuan tersebut → kirim email reminder ke karyawan dan CC ke manager dengan subject `[Reminder] Cuti dimulai besok — <nama>`.

Pasang trigger time-driven via function `pasangReminderTrigger()`.

> 💡 **Hint**: "besok" = `new Date(Date.now() + 24*60*60*1000)`. Bandingkan dengan format `yyyy-MM-dd` pakai `Utilities.formatDate`.

---

## Soal 4 — Reset Kuota Tahunan

Buat function `resetKuotaTahunan()` yang men-set kolom `Sisa` di tab `Kuota-Cuti` jadi `12` untuk semua karyawan.

Tambahkan **konfirmasi sebelum eksekusi**: function harus throw error kalau dijalankan di luar bulan Januari, kecuali ada parameter `paksa = true`.

> 💡 **Hint**: `new Date().getMonth()` → 0 untuk Januari, 11 untuk Desember.

---

## Soal 5 — Bonus: Dashboard HR

Buat rute `?page=dashboard` yang menampilkan halaman HTML berisi:

1. **Total pengajuan bulan ini** (count baris dengan Timestamp di bulan ini).
2. **Breakdown status**: Pending / Approved / Rejected (count masing-masing).
3. **Top 3 jenis cuti** yang paling sering diajukan.
4. **Tabel pending approval** — semua pengajuan status Pending, dengan tombol approve/reject inline.

Bonus level 2: tambah autentikasi sederhana — cuma email yang ada di Script Property `HR_EMAILS` (comma-separated) yang boleh akses. Cek `Session.getActiveUser().getEmail()`.

> 💡 Untuk Web App yang butuh login, deploy ulang dengan **Who has access: Anyone with Google account**.

---

## Checklist Selesai

- [ ] Sistem dasar dari materi.md sudah berfungsi end-to-end.
- [ ] Validasi tanggal sudah aktif (Soal 1).
- [ ] Karyawan bisa cek riwayat sendiri (Soal 2).
- [ ] Reminder otomatis sudah jalan (Soal 3).
- [ ] Function reset tahunan sudah ada (Soal 4).
- [ ] (Bonus) Dashboard HR berfungsi.

Setelah semua tercentang, Anda sudah bisa menerapkan pola yang sama untuk **sistem internal apa pun** — pengadaan barang, request lembur, klaim reimburse, dll. 🎉
