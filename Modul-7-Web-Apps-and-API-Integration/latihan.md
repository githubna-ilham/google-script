# Latihan Modul 7 — Web Apps & API Integration

**Persiapan**:
1. Buat project Apps Script `Latihan-Modul-7`.
2. Buat Sheet `Latihan-M7` dengan tab:
   - **Pendaftar**: `Timestamp | Nama | Email | Kategori`
   - **Webhook-Log**: `Timestamp | Payload | Type`
   - **Kurs**: `Tanggal | Currency | Rate ke IDR`
3. Set `Script Properties` (Project Settings → Script Properties):
   - `PENDAFTAR_SHEET_ID` = ID Sheet Latihan-M7
   - `WEBHOOK_SHEET_ID` = ID Sheet Latihan-M7
   - (Opsional) `SLACK_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN` untuk soal lanjutan.
4. **Setelah testing**: archive deployment supaya URL tidak public lagi.

---

## Soal 1 — Halaman Greeting

Buat `doGet(e)` yang return halaman HTML berisi:
- Heading "Halo, {nama}!" — `nama` diambil dari `?nama=...`. Default: "Tamu".
- Paragraf yang tampilkan email user aktif (atau "anonymous" kalau tidak login).
- Link ke `?nama=...&page=daftar` ke halaman form (Soal 2).

---

## Soal 2 — Form Pendaftaran via Web App

Buat halaman form (HTML file `form-daftar.html`) dengan field:
- Nama (text)
- Email (email)
- Kategori (dropdown: Webinar/Workshop/Bootcamp)
- Tombol Daftar

Server function `daftarEvent(formData)`:
- Validasi server-side (nama ≥ 2 karakter, email format valid).
- Cek duplikat email — kalau sudah ada, throw error.
- Append ke tab `Pendaftar`.
- Kirim email konfirmasi ke pendaftar.
- Return `{ ok, message }`.

Client harus tampilkan status sukses/error.

---

## Soal 3 — Endpoint JSON Public

Buat handler `?page=stats` yang return JSON:
```json
{
  "totalPendaftar": 12,
  "perKategori": {
    "Webinar": 5,
    "Workshop": 4,
    "Bootcamp": 3
  },
  "lastUpdate": "2026-05-10T..."
}
```

Test dengan curl atau buka langsung di browser.

---

## Soal 4 — Webhook Receiver

Implementasikan `doPost(e)` yang:
1. Parse JSON dari `e.postData.contents`.
2. Validasi: harus ada field `event` dan `data`.
3. Append ke tab `Webhook-Log`: `Timestamp | event | JSON.stringify(data)`.
4. Kalau `event === "alert"` → kirim email ke email Anda dengan subject `[ALERT] <data.message>`.
5. Return JSON `{ ok, eventId }` (eventId = nomor row).

Test dengan curl:
```bash
curl -X POST <URL> -H "Content-Type: application/json" \
  -d '{"event":"alert","data":{"message":"Server down","severity":"high"}}'
```

---

## Soal 5 — Konsumsi API Cuaca

Buat function `updateCuacaSheet()` yang:
1. Untuk 5 kota: Jakarta, Surabaya, Bandung, Medan, Makassar.
2. Panggil API `https://wttr.in/<kota>?format=j1`.
3. Tulis hasil ke tab baru `Cuaca` dengan kolom: `Tanggal | Kota | Temp (°C) | Kondisi | Kelembaban`.

Tambahkan: pasang trigger time-driven untuk jalan **tiap 6 jam**. (Hapus trigger setelah selesai latihan.)

---

## Soal 6 — Currency Rate ke Sheet

Buat function `updateKursIDR()` yang:
1. Panggil API publik open exchange rates (mis. `https://api.exchangerate-api.com/v4/latest/USD`).
2. Ambil rate USD, EUR, SGD, JPY ke IDR.
3. Append ke tab `Kurs` dengan kolom: `Tanggal | Currency | Rate ke IDR`.

Idempotent: kalau hari ini sudah ada record, **skip** (tidak append duplikat).

---

## Soal 7 — Slack Notif Saat Form Submit

Skenario: setiap kali ada baris baru di tab `Pendaftar` (dari Web App Soal 2), kirim notif ke Slack channel.

1. Setup Slack incoming webhook di workspace Anda (atau pakai test webhook). Set ke `Script Properties` (`SLACK_WEBHOOK_URL`).
2. Modifikasi `daftarEvent()` Soal 2 — setelah append sukses, panggil `kirimKeSlack(text)` dengan format:
   ```
   📥 Pendaftar baru
   Nama: <nama>
   Email: <email>
   Kategori: <kategori>
   ```
3. Test: daftar lewat form → notif harus muncul di Slack channel.

---

## Soal 8 — Mini-Project: Dashboard Status Layanan

Buat Web App yang menampilkan **dashboard sederhana** (server-rendered HTML):
1. Cek 3 endpoint publik (mis. https://www.google.com, https://api.github.com, https://wttr.in/Jakarta).
2. Untuk tiap endpoint: ukur response time, status code.
3. Render tabel: `Endpoint | Status | Response Time (ms) | Last Check`.
4. Kalau status code != 200 → row warna merah.
5. Tambah tombol "Refresh" yang reload halaman.

Bonus: cache hasil di `PropertiesService` selama 5 menit supaya tidak hammer endpoint terlalu sering.

---

## Checklist Sebelum Lanjut

- [ ] Bisa deploy Web App dan akses URL public.
- [ ] Bisa baca query string dan POST body.
- [ ] Bisa return HTML dan JSON sesuai konteks.
- [ ] Bisa panggil API eksternal pakai UrlFetchApp dengan auth.
- [ ] Paham PropertiesService untuk simpan secret.
- [ ] Bisa terima webhook dari layanan luar.
- [ ] Paham bedanya Execute as Me vs User, Anyone vs Logged In.
- [ ] Bisa bangun integrasi 2-arah lengkap.

**Selanjutnya: Modul 8 — Integrating Multiple Google Services.**
