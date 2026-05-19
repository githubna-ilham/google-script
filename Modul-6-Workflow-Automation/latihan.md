# Latihan Modul 6 — Workflow Automation

**Konteks**: Lanjutan studi kasus admin **lembaga pelatihan** dari Modul 3 & 5. Sekarang script harus jalan **otomatis** tanpa intervensi admin: kirim reminder peserta H-3, auto-email saat status Lulus, proses pendaftaran via Google Form, dll.

**Persiapan**:

1. Buat Sheet `Latihan-M6` (atau pakai Sheet `Latihan-M5` yang sudah ada) dengan dua tab:

   **Tab `Peserta`** (10 kolom — sama dengan Modul 3 & 5):

   | ID Peserta | Tanggal Daftar | Nama | Email | Instansi | Program | Nilai | Status | Notif Email | Link Sertifikat |

   Isi minimal 5 baris dummy. Pastikan ada beberapa baris dengan email Anda sendiri (untuk test).

   **Tab `Program`** (7 kolom):

   | Kode | Nama Program | Kapasitas | Biaya | Tanggal Mulai | Tanggal Selesai | Lokasi |

   Isi minimal 3 program. **Set salah satu `Tanggal Mulai` = 3 hari dari sekarang** untuk test reminder H-3 di Soal 4 & 7.

2. Project Apps Script bisa container-bound (lebih nyaman) atau standalone (set `SHEET_ID`).
3. **Setelah selesai latihan, hapus semua trigger**: panggil `hapusSemuaTrigger()`. Kuota trigger max 20 per user.

---

## Soal 1 — Custom Menu Workflow

Tambah ke menu Pelatihan (atau bikin menu baru `"Workflow"`) minimal 4 item:

1. Pasang trigger harian reminder → memanggil `pasangReminderPelatihan()`.
2. Pasang trigger onEdit → memanggil `pasangTriggerEditPeserta()`.
3. Hapus semua trigger → memanggil `hapusSemuaTrigger()`.
4. List trigger aktif (log ke Execution log) → memanggil `listTrigger()`.

> Hint: `ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));` untuk hapus semua.

---

## Soal 2 — onEdit: Auto-Highlight Status Peserta (Installable)

Buat function `onEditPeserta(e)` (installable trigger), pasang via `pasangTriggerEditPeserta()`.

Aturan di tab `Peserta` — saat kolom `Status` diedit:
- `Lulus` → background seluruh baris **hijau muda** (`#dcfce7`) + auto-isi `Nilai` ke `Sheet.getRange(..., colNilai).getValue()` kalau kosong (default 70).
- `Tidak Lulus` → background **merah muda** (`#fee2e2`).
- `Sedang Berjalan` → reset format (white background).
- Selain itu → tidak ada perubahan.

**Kenapa installable, bukan simple onEdit?** Karena di Soal 3 kita extend: saat `Lulus` → kirim email peserta (`MailApp`). Simple onEdit tidak bisa panggil MailApp.

> Test: edit kolom Status di tab Peserta → row langsung berubah warna sesuai aturan.

---

## Soal 3 — Auto-Email saat Status Berubah jadi Lulus

Lanjutan Soal 2: extend `onEditPeserta(e)` supaya saat user set `Status = "Lulus"`, otomatis:

1. Baca data baris itu: `Nama`, `Email`, `Program`, `Nilai`.
2. Kirim email ke peserta:
   - **Subject**: `Selamat, {Nama} — Anda LULUS pelatihan {Program}`.
   - **Body**: ucapan selamat + nilai akhir.
3. Set kolom `Notif Email` baris itu jadi timestamp (`yyyy-MM-dd HH:mm`).
4. **Idempotent**: kalau `Notif Email` sudah terisi → skip email, jangan kirim duplikat. (User bisa saja iseng ubah Status `Lulus → Sedang Berjalan → Lulus` lagi.)

> Test: edit Status salah satu baris ke `Lulus` → cek email Anda → kolom `Notif Email` terisi. Edit jadi `Sedang Berjalan` lalu balik `Lulus` → tidak boleh kirim email kedua.

---

## Soal 4 — Time-Driven: Reminder Pelatihan H-3

Buat function `kirimReminderPelatihan()` yang dijalankan tiap pagi jam 7 (`pasangReminderPelatihan()` untuk install trigger).

Logic:
1. Hitung tanggal target = hari ini + 3 hari.
2. Dari tab `Program`, cari program yang `Tanggal Mulai` = tanggal target.
3. Dari tab `Peserta`, ambil peserta yang **terdaftar di program itu** DAN kolom `Notif Email` masih kosong.
4. Kirim email reminder ke tiap peserta:
   - **Subject**: `Reminder: Pelatihan {Nama Program} dimulai 3 hari lagi`.
   - **Body**: nama peserta + nama program + tanggal mulai + lokasi.
5. Set kolom `Notif Email` jadi timestamp setelah kirim.
6. Log: `"N email reminder dikirim."`.

**Idempotent**: pakai kolom `Notif Email` sebagai marker. Run kedua di hari yang sama → log "0 email dikirim".

> Test: pastikan ada salah satu program dengan `Tanggal Mulai` = H+3 dari hari ini. Run manual `kirimReminderPelatihan()` → cek email + tab Peserta.

---

## Soal 5 — onFormSubmit: Pendaftaran Peserta via Google Form

Buat **Google Form pendaftaran pelatihan** dengan 4 pertanyaan minimum:
- Nama (short text, required)
- Email (short text, validation email)
- Instansi (short text)
- Program (dropdown — isi manual dengan kode program di tab `Program`)

Hubungkan Form ke Sheet (Form → titik tiga → Settings → Link to Sheets — boleh pakai Sheet yang sama atau bikin response sheet baru).

Buat function `pasangTriggerForm()` yang pasang `onFormSubmit` ke form tersebut, memanggil `prosesPendaftaranPeserta(e)`.

`prosesPendaftaranPeserta(e)` harus:
1. Baca jawaban form jadi object (key = judul pertanyaan).
2. **Validasi server**: cek email belum terdaftar di tab `Peserta` (kalau duplikat → kirim email error ke admin + return tanpa append).
3. Generate `ID Peserta` (`PST-XXX` dari `getLastRow()`).
4. Append ke tab `Peserta` dengan 6 kolom: ID, Tanggal Daftar (sekarang), Nama, Email, Instansi, Program. Sisanya kosong.
5. Kirim email konfirmasi ke peserta dengan ID baru.
6. Kirim notif ke admin (email Anda) dengan info pendaftar baru.

> Test: submit form 2× dengan email sama → percobaan kedua harus di-reject (tidak masuk tab Peserta, admin dapat email warning).

---

## Soal 6 — LockService untuk Sync Berat

Skenario: function `syncEksternalPeserta()` ambil 20+ detik (anggap baca data dari API eksternal yang lambat), dipanggil oleh trigger `everyMinutes(5)`. Jangan sampai eksekusi #2 mulai sebelum #1 selesai → bisa double-process.

Buat `syncEksternalPesertaAman()` yang:
1. Pakai `LockService.getScriptLock().tryLock(5000)`.
2. Kalau tidak dapat lock → log `"Sync lain sedang jalan. Skip."` + return.
3. Kalau dapat lock → simulasi `Utilities.sleep(20000)` (proses berat) → release lock di `finally`.

Pasang trigger `everyMinutes(5)` ke `syncEksternalPesertaAman`, biarkan jalan 15 menit, lalu cek **Executions sidebar** — beberapa eksekusi harus log skip.

---

## Soal 7 — Audit Log Trigger ke Sheet

Buat tab baru `Audit-Trigger` dengan header: `Timestamp | Handler | Status | Message | Durasi (ms)`.

Buat helper `auditExec(handlerName, status, message, durasiMs)` yang append baris ke tab itu.

**Bungkus** function dari Soal 3 (`onEditPeserta` saat kirim email), Soal 4 (`kirimReminderPelatihan`), dan Soal 5 (`prosesPendaftaranPeserta`) dengan try/catch + audit:

```javascript
function kirimReminderPelatihan() {
  const t0 = Date.now();
  try {
    // ... logic asli
    _audit("kirimReminderPelatihan", "OK", `${terkirim} email dikirim`, Date.now() - t0);
  } catch (err) {
    _audit("kirimReminderPelatihan", "ERROR", err.message, Date.now() - t0);
    throw err;
  }
}
```

Manfaat: kalau besok pagi reminder tidak terkirim, admin tinggal buka tab `Audit-Trigger` → lihat row dengan `Status = ERROR` + `Message` apa.

---

## Checklist Sebelum Lanjut

- [ ] Bisa pasang time-driven trigger lewat kode dengan idempotent (hapus dulu trigger lama dengan nama function yang sama).
- [ ] Bisa pasang event trigger (onEdit installable, onFormSubmit) lewat kode.
- [ ] Bisa baca event object `e` (range, value, response, dll) di handler.
- [ ] Paham kapan butuh installable trigger (untuk akses MailApp/UrlFetchApp/dll).
- [ ] Bisa pakai marker idempotent (`Notif Email` di tab Peserta) supaya trigger tidak kirim duplikat.
- [ ] Bisa pakai `LockService` untuk hindari race condition di trigger yang bisa overlap.
- [ ] Bisa list & hapus trigger via `ScriptApp.getProjectTriggers()`.
- [ ] Bisa log eksekusi ke Sheet untuk audit / debugging.

**Selanjutnya: Modul 7 — Web Apps & API Integration.**
