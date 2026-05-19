# Latihan Modul 7 — Web Apps & API Integration

> Latihan ini dipecah jadi **3 tingkat**. Kerjakan urut. Tidak perlu memaksakan diri ke Lanjutan kalau Pemanasan masih terasa berat — **lebih baik paham 3 soal daripada bingung 8 soal**.
>
> - **Pemanasan** (Soal 1–3) — wajib bisa.
> - **Inti** (Soal 4–6) — wajib bisa sebelum lanjut Modul 8.
> - **Lanjutan / Bonus** (Soal 7–8) — kerjakan kalau punya waktu.

**Konteks**: Lanjutan studi kasus lembaga pelatihan dari Modul 3, 5, 6. Sekarang admin ingin Web App publik untuk: (a) form pendaftaran peserta yang bisa dishare lewat link, (b) dashboard read-only yang bisa dilihat manajemen/klien, (c) endpoint API untuk integrasi sistem lain.

---

## Persiapan (sekali di awal)

1. Buat project Apps Script baru, beri nama `Latihan-Modul-7`.
2. Bikin (atau pakai existing) Spreadsheet dengan **dua tab**:
   - `Peserta` (10 kolom — sama persis dengan Modul 3 & 5)
   - `Program` (7 kolom)

   Struktur lengkap + sample data 30 baris ada di [`template-spreadsheet.md`](./template-spreadsheet.md).

3. Buat tab baru untuk webhook log:
   - `Webhook-Log` dengan header: `Timestamp | Event | Data`

4. Copy **Sheet ID**, lalu di editor Apps Script: **Project Settings → Script Properties → Add property**:
   - `DASHBOARD_SHEET_ID` = Sheet ID (untuk Soal 2, 3, 4, 5, 7, 8).
   - `WEBHOOK_SHEET_ID` = Sheet ID yang sama (untuk Soal 5).
   - (Optional, Soal 7) `SLACK_WEBHOOK_URL` = URL webhook Slack.

5. **Setelah selesai latihan**: hapus deployment lewat **Manage deployments** supaya URL tidak public lagi.

> **Tip**: kalau bingung di tengah jalan, lihat `contoh.js` & `dashboard.html` — banyak pola yang langsung bisa diadaptasi.

---

# PEMANASAN

## Soal 1 — Halaman Greeting + Routing

**Tujuan**: paham `doGet`, deploy, baca query parameter.

Buat `doGet(e)` yang menampilkan halaman HTML berisi:
- Heading **"Halo, {nama}!"** — ambil `nama` dari `?nama=...`. Default `"Tamu"`.
- Paragraf "Login sebagai: {email}" — dari `Session.getActiveUser().getEmail()` atau `"anonymous"`.
- Tiga link navigasi:
  - `?page=daftar` → form pendaftaran (Soal 2)
  - `?page=stats` → JSON statistik (Soal 3)
  - `?page=dashboard` → dashboard (Soal 4)

**Test**:
- Buka URL `.../exec` → "Halo, Tamu!"
- Buka URL `.../exec?nama=Sari` → "Halo, Sari!"

> Hint: pola routing `?page=...` ada di `contoh.js` Bagian 2.

---

## Soal 2 — Form Pendaftaran Peserta

**Tujuan**: paham kombinasi HTML file + `google.script.run` untuk write data.

Buat file HTML baru `form-daftar.html` dengan field:
- **Nama** (text, required)
- **Email** (email, required)
- **Instansi** (text, required)
- **Program** (dropdown — isi dengan kode dari tab `Program`, hardcoded boleh untuk soal ini)
- Tombol **Daftar**

Buat function server `daftarPeserta(formData)` yang:
1. Validasi: semua field tidak kosong + email valid (regex).
2. **Cek email duplikat** di tab `Peserta` → kalau sudah ada, throw error.
3. Generate `ID Peserta` (`PST-XXX` dari `getLastRow()`).
4. Append ke tab `Peserta` 6 kolom pertama: ID, Tanggal Daftar (sekarang), Nama, Email, Instansi, Program.
5. Return `{ ok: true, message: "Terdaftar: PST-XXX — Nama", idBaru: "PST-XXX" }`.

Di `doGet`, tambah rute `?page=daftar` yang serve form HTML ini (pakai `HtmlService.createHtmlOutputFromFile`).

**Test**: buka `?page=daftar` → isi form → klik Daftar → cek baris baru muncul di tab `Peserta` + tampil status sukses di form.

---

## Soal 3 — JSON Endpoint Statistik

**Tujuan**: paham `ContentService` untuk balas JSON (Web App sebagai API).

Tambahkan rute `?page=stats` di `doGet` yang return JSON statistik peserta:

```json
{
  "totalPeserta": 30,
  "perStatus": {
    "Lulus": 20,
    "Sedang Berjalan": 6,
    "Tidak Lulus": 4
  },
  "perProgram": {
    "GAS-101": 9,
    "GAS-201": 7,
    "GAS-301": 8,
    "GAS-401": 3,
    "GAS-501": 3
  },
  "rataNilai": 80.5,
  "lastUpdate": "2026-05-20T..."
}
```

**Test**:
- Buka `.../exec?page=stats` di browser → tampil JSON.
- Atau pakai curl:
  ```bash
  curl "https://script.google.com/macros/s/.../exec?page=stats"
  ```

> Hint: baca tab `Peserta` dengan `getDataRange().getValues()`, lalu reduce ke object hitungan per kategori.

---

# INTI

## Soal 4 — Dashboard Pelatihan (Read-only)

**Tujuan**: praktik Web App + HTML interaktif + `google.script.run` untuk read data.

Buat dashboard publik yang menampilkan:

1. **Kartu statistik** di atas: Total Peserta, Lulus, Sedang Berjalan, Rata-rata Nilai.
2. **Tabel Program** (dari tab `Program`): Kode, Nama, Kapasitas, Terisi (count peserta per program), Tanggal Mulai, Lokasi, Biaya.
3. **Tabel Peserta** (dari tab `Peserta`): ID, Nama, Instansi, Program, Nilai, Status (dengan badge warna sesuai status).
4. **Filter client-side** di atas tabel peserta:
   - Input search (cari di Nama, Instansi, atau ID).
   - Dropdown filter Program.
   - Dropdown filter Status.
5. **Tombol Refresh** untuk re-fetch data tanpa reload halaman.

Server function `bacaDataDashboard()`:
- Baca tab `Peserta` + `Program`.
- Hitung statistik di server.
- Return object: `{ statistik, program, peserta }`.

Tambah rute `?page=dashboard` di `doGet` (atau jadikan default).

**Test**: buka URL → lihat dashboard penuh. Coba filter & search → harus responsif tanpa loading.

> Hint: file `dashboard.html` di folder modul sudah ada referensi lengkap — Anda boleh contek strukturnya, tapi pahami dulu sebelum copy.

---

## Soal 5 — Webhook Receiver (Notifikasi dari Sistem Luar)

**Tujuan**: paham `doPost`, baca body request, validasi, integrasi 1-arah dari luar.

Skenario: sistem pembayaran pihak ke-3 (mock) akan POST ke Web App kita setiap kali ada peserta yang bayar — kita catat ke log dan auto-update status peserta jadi `Sedang Berjalan`.

Implementasikan `doPost(e)` yang:
1. Parse JSON dari `e.postData.contents`. Kalau gagal → return `{ ok: false, error: "..." }`.
2. Validasi: payload harus punya field `event` dan `data`. Kalau tidak → return error.
3. Append ke tab `Webhook-Log`: `[new Date(), event, JSON.stringify(data)]`.
4. **Kalau `event === "payment.success"`** dan `data.peserta_id` ada:
   - Cari baris di tab `Peserta` dengan `ID Peserta = data.peserta_id`.
   - Update kolom `Status` jadi `"Sedang Berjalan"`.
5. Return `{ ok: true, eventId: <row terakhir di Webhook-Log> }`.

**Test pakai curl** (ganti URL):
```bash
# Test event biasa
curl -X POST "https://script.google.com/macros/s/.../exec" \
  -H "Content-Type: application/json" \
  -d '{"event":"signup","data":{"email":"a@b.com"}}'

# Test payment success → harus update Status di tab Peserta
curl -X POST "https://script.google.com/macros/s/.../exec" \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.success","data":{"peserta_id":"PST-010"}}'
```

> Hint: deploy ulang dengan `doPost` baru wajib **New version**, bukan cuma save.

---

## Soal 6 — Auto-Lookup Lokasi Pelatihan via API

**Tujuan**: paham `UrlFetchApp.fetch` untuk panggil API luar + integrasi data eksternal ke dashboard.

Tambah kolom **"Cuaca Lokasi"** di card setiap program di dashboard — menampilkan cuaca terkini kota lokasi pelatihan onsite (dari API publik).

1. Untuk tiap program yang `Lokasi`-nya mengandung "Jakarta", "Bandung", atau "Surabaya":
   - Panggil `https://wttr.in/<kota>?format=j1`.
   - Ambil `temp_C` dan `weatherDesc[0].value`.
2. Cache hasil per kota di `PropertiesService` selama **1 jam** — jangan hit API tiap user buka dashboard.
3. Tampilkan info cuaca di card program (atau di tabel program kolom baru).

Untuk program online, tampilkan `"—"` (tidak perlu cek cuaca).

**Bonus**: handle error dari API dengan `muteHttpExceptions: true` — kalau gagal, tampilkan "Cuaca tidak tersedia" daripada crash.

> Hint:
> - Extract kota dari `Lokasi`: `const kota = lokasi.match(/(Jakarta|Bandung|Surabaya)/)?.[1];`
> - Cache pattern: simpan `{ ts, data }` JSON, cek `Date.now() - ts < 3600000` sebelum fetch ulang.

---

# LANJUTAN / BONUS

## Soal 7 — Slack Notif Saat Ada Pendaftar Baru

**Tujuan**: integrasi 2-way (form → Sheet → Slack).

1. Setup **Incoming Webhook** di Slack workspace. Simpan URL di Script Properties sebagai `SLACK_WEBHOOK_URL`.
2. Modifikasi `daftarPeserta` (Soal 2) — setelah `appendRow` sukses, kirim pesan ke Slack:
   ```
   Pendaftar baru
   ID: <PST-XXX>
   Nama: <nama>
   Email: <email>
   Instansi: <instansi>
   Program: <program>
   ```
3. Pakai pola `kirimKeSlack(text)` dari `contoh.js` Bagian 7.
4. Jangan biarkan failure di Slack mengganggu pendaftaran — bungkus dengan try/catch, log error ke console kalau gagal, tapi return success ke client (peserta tetap terdaftar).

**Test**: daftar lewat form → cek (a) peserta masuk Sheet, (b) notif muncul di Slack channel.

---

## Soal 8 — Mini-Project: Public API Endpoint Lengkap

**Tujuan**: gabungan rute Web App + cache + dokumentasi mini.

Buat **public API** untuk data pelatihan dengan 3 endpoint JSON:

| Endpoint | Return |
|---|---|
| `?page=api/programs` | Array semua program: `[{ kode, nama, kapasitas, terisi, biaya, ... }]` |
| `?page=api/program&kode=GAS-101` | Detail 1 program + daftar peserta-nya |
| `?page=api/stats` | Statistik global (sama dengan Soal 3, tapi lebih lengkap) |

Aturan:
1. Semua response pakai `ContentService.createTextOutput(JSON.stringify(...)).setMimeType(JSON)`.
2. **Cache hasil di PropertiesService selama 5 menit** — supaya kalau sistem lain hit endpoint sering, tidak hammer Sheet terus.
3. Cache **per-endpoint** (kunci `cache_programs`, `cache_program_<kode>`, `cache_stats`).
4. Setiap endpoint return field `cached: true/false` + `cachedAt: timestamp` supaya consumer tahu freshness data.

**Test**:
- `curl ".../exec?page=api/programs"` → JSON array.
- `curl ".../exec?page=api/program&kode=GAS-101"` → detail + array peserta.
- Hit endpoint 2x cepat → field `cached: true` di response kedua.

**Bonus**: bikin halaman `?page=api/docs` (HTML) yang dokumentasikan 3 endpoint di atas dengan contoh response — supaya sistem lain tahu cara pakai.

---

## Checklist Sebelum Lanjut

Centang yang sudah bisa dengan tenang (boleh masih perlu cek catatan):

- [ ] Bisa deploy Web App dan akses URL public.
- [ ] Bisa baca query string (`e.parameter`) dan POST body (`e.postData.contents`).
- [ ] Bisa balas HTML (untuk manusia) dan JSON (untuk script lain).
- [ ] Bisa bikin form HTML yang submit ke server lewat `google.script.run`.
- [ ] Bisa bikin dashboard read-only dengan statistik + tabel + filter client-side.
- [ ] Bisa panggil API luar pakai `UrlFetchApp.fetch` dengan cache pattern.
- [ ] Bisa terima webhook dengan `doPost` dan update Sheet berdasar payload.
- [ ] Paham bedanya **Execute as: Me** vs **User**, dan **Anyone** vs **Logged-in**.

Sudah dicentang minimal Soal 1–6? **Anda siap masuk Modul 8 — Integrating Multiple Google Services.**
