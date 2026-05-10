# Latihan Modul 6 — Workflow Automation

**Persiapan**:
1. Buat Sheet `Latihan-M6` dengan tab:
   - **Tugas**: kolom `Nama | Deskripsi | Deadline | Status | Prioritas` (isi 5 baris dummy)
   - **Kontrak**: kolom `Nama Klien | Email | Tanggal Berakhir | Reminded H-30`
2. Project Apps Script bisa container-bound (lebih nyaman) atau standalone (set `SHEET_ID`).
3. **Setelah selesai latihan, hapus semua trigger**: panggil `hapusSemuaTrigger()`.

---

## Soal 1 — onOpen Custom Menu

Buat function `onOpen()` yang menambah menu **"⚡ Workflow"** dengan minimal 4 item:
1. Pasang trigger harian
2. Pasang trigger Senin pagi
3. Hapus semua trigger
4. List trigger aktif (log)

---

## Soal 2 — Trigger Harian + Idempotent

Buat function `pasangReminderTugas()` yang memasang trigger time-driven **tiap hari jam 6 sore**, memanggil function `reminderTugasBesok()`.

`reminderTugasBesok()` harus:
- Cari semua tugas dengan `Status != "Selesai"` dan `Deadline = besok`.
- Kirim email ke email Anda dengan list tugas (HTML, ada bullet).
- Kalau tidak ada tugas besok → tidak mengirim email apa-apa.

**Idempotent**: kalau dipanggil 2× di hari yang sama, tidak boleh kirim email duplikat.
Pakai `PropertiesService` untuk simpan tanggal terakhir kirim.

---

## Soal 3 — onEdit Auto-Format

Buat function `onEditAutoFormat(e)` (installable trigger), pasang via `pasangTriggerEdit()`.

Aturan:
- Di tab `Tugas`, kalau kolom `Status` (kolom 4) diset `Selesai` → background seluruh baris jadi hijau, font strike-through.
- Kalau diset `Cancel` → background merah muda.
- Kalau diset `Diproses` → background kuning.
- Kalau diset selain itu → reset format (white background, no strike).

---

## Soal 4 — Notif via Form Submit

Buat **Google Form** dengan 3 pertanyaan:
- Nama (short text)
- Email (short text, validation email)
- Pertanyaan (paragraph)

Hubungkan ke Sheet (Form → menu titik tiga → Settings → Link to Sheets).

Buat function `pasangTriggerForm()` yang memasang `onFormSubmit` ke form tersebut, memanggil `prosesPertanyaan(e)`.

`prosesPertanyaan(e)` harus:
- Kirim email konfirmasi ke pengirim (HTML, isi pertanyaan disertakan).
- Kirim notif ke admin (email Anda) dengan seluruh data submission.

Test: submit form → cek 2 email masuk.

---

## Soal 5 — LockService

Skenario: `syncBerat()` adalah function yang ambil 30+ detik, dan dipanggil oleh trigger `everyMinutes(1)` (untuk simulasi cepat-cepatan).

Buat versi `syncBeratAman()` yang:
1. Pakai `LockService.getScriptLock().tryLock(5000)`.
2. Kalau tidak dapat lock → log skip & return.
3. Kalau dapat lock → jalankan simulasi `Utilities.sleep(20000)`, lalu release.

Pasang trigger `everyMinutes(1)` ke `syncBeratAman`, biarkan jalan 5 menit, lalu cek di **Executions**: harus ada eksekusi yang skip karena lock.

---

## Soal 6 — Audit Log Trigger ke Sheet

Skenario: kita mau tracking eksekusi semua trigger ke sheet `Audit-Trigger` untuk review.

Buat function `auditExec(handlerName, status, message)` yang append baris:
| Timestamp | Handler | Status | Message |

Modifikasi `kirimLaporanHarian` & `reminderTugasBesok` di soal-soal sebelumnya — bungkus dengan try/catch, panggil `auditExec(..., "OK", ...)` di success, `auditExec(..., "ERROR", err.message)` di catch.

---

## Soal 7 — Mini-Project: Reminder Kontrak Berlapis (H-30, H-7, H-1)

Lanjutan mini-project di materi.md:

Buat function `reminderKontrak()` yang:
1. Untuk setiap baris di `Kontrak`:
   - Hitung `selisihHari = (Tanggal Berakhir - hari ini) dalam hari`.
   - Kalau `selisihHari` ≤ 30 dan kolom `Reminded H-30` kosong → kirim reminder H-30, set kolom `Reminded H-30 = ✓`.
   - Kalau `selisihHari` ≤ 7 dan kolom `Reminded H-7` kosong → kirim reminder H-7, set kolom `Reminded H-7 = ✓`.
   - Kalau `selisihHari` ≤ 1 dan kolom `Reminded H-1` kosong → kirim reminder H-1 + cc ke manager, set kolom `Reminded H-1 = ✓`.
2. Tulis kembali Sheet 1× round-trip.
3. Pasang sebagai trigger harian jam 7 pagi.

Tambah kolom `Reminded H-7` dan `Reminded H-1` di Sheet sebelum mulai.

---

## Checklist Sebelum Lanjut

- [ ] Bisa pasang time-driven trigger lewat kode dengan idempotent (hapus dulu yang lama).
- [ ] Bisa pasang event trigger (onEdit, onFormSubmit) lewat kode.
- [ ] Bisa pakai PropertiesService untuk state.
- [ ] Bisa pakai LockService untuk hindari race.
- [ ] Bisa list & hapus trigger via API.
- [ ] Paham trigger-trigger jangan overlapping > 6 menit.
- [ ] Paham trigger jadwal tidak presisi detik (window beberapa menit).

**Selanjutnya: Modul 7 — Web Apps & API Integration.**
