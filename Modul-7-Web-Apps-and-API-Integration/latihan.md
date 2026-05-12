# Latihan Modul 7 — Web Apps & API Integration

> Latihan ini dipecah jadi **3 tingkat**. Kerjakan urut. Tidak perlu memaksakan diri ke Lanjutan kalau Pemanasan masih terasa berat — **lebih baik paham 3 soal daripada bingung 8 soal**.
>
> - 🟢 **Pemanasan** (Soal 1–3) — wajib bisa.
> - 🟡 **Inti** (Soal 4–6) — wajib bisa sebelum lanjut Modul 8.
> - 🔴 **Lanjutan / Bonus** (Soal 7–8) — kerjakan kalau punya waktu.

---

## Persiapan (sekali di awal)

1. Buat project Apps Script baru, beri nama `Latihan-Modul-7`.
2. Buat Spreadsheet baru bernama `Latihan-M7`, lalu **buat tab-tab berikut**:

   | Nama tab | Header (baris 1) |
   |---|---|
   | `Pendaftar` | `Timestamp \| Nama \| Email \| Kategori` |
   | `Webhook-Log` | `Timestamp \| Event \| Data` |
   | `Kurs` | `Tanggal \| Currency \| Rate ke IDR` |

3. Copy **Sheet ID** (potongan URL antara `/d/` dan `/edit`).
4. Di editor Apps Script: **⚙️ Project Settings → Script Properties → Add property**:
   - `PENDAFTAR_SHEET_ID` = Sheet ID di atas
   - `WEBHOOK_SHEET_ID`  = Sheet ID di atas (sama)
   - (Optional, untuk Soal 7–8) `SLACK_WEBHOOK_URL`

5. **Setelah selesai latihan**: hapus deployment lewat **Manage deployments** supaya URL tidak public lagi.

> 💡 **Tip**: kalau bingung di tengah jalan, lihat `contoh.js` — banyak pola yang langsung bisa diadaptasi.

---

# 🟢 PEMANASAN

## Soal 1 — Halaman Greeting

**Tujuan**: paham `doGet`, deploy, baca query parameter.

Buat `doGet(e)` yang menampilkan halaman HTML berisi:
- Heading **"Halo, {nama}!"** — ambil `nama` dari `?nama=...`. Kalau kosong, pakai `"Tamu"`.
- Paragraf yang menampilkan email user (atau `"anonymous"` kalau tidak login).
- Sebuah link `<a>` yang mengarah ke `?nama={nama}&page=daftar` (untuk Soal 2 nanti).

**Test**:
- Buka URL `.../exec` → "Halo, Tamu!"
- Buka URL `.../exec?nama=Sari` → "Halo, Sari!"

> 💡 **Hint**: lihat `contoh.js` Bagian 2 untuk pola routing `?page=...`.

---

## Soal 2 — Form Pendaftaran Sederhana

**Tujuan**: paham kombinasi HTML file + `google.script.run`.

Buat file HTML baru bernama `form-daftar.html` dengan field:
- **Nama** (text)
- **Email** (email)
- **Kategori** (dropdown: Webinar / Workshop / Bootcamp)
- Tombol **Daftar**

Buat function server `daftarEvent(formData)` yang:
1. Validasi: nama tidak kosong, email mengandung `@`.
2. Append baris ke tab `Pendaftar`: `[timestamp, nama, email, kategori]`.
3. Return `{ ok: true, message: "..." }`.

Di `doGet`, tambahkan rute `?page=daftar` yang membuka form ini.

**Test**: buka `?page=daftar` → isi form → klik Daftar → cek baris baru muncul di Sheet.

> 💡 **Hint**: lihat `page-form.html` di folder ini — strukturnya bisa ditiru.

---

## Soal 3 — Endpoint JSON Public

**Tujuan**: paham `ContentService` untuk balas JSON.

Tambahkan rute `?page=stats` di `doGet` yang return JSON statistik pendaftar:

```json
{
  "totalPendaftar": 12,
  "perKategori": {
    "Webinar": 5,
    "Workshop": 4,
    "Bootcamp": 3
  },
  "lastUpdate": "2026-05-12T..."
}
```

**Test**:
- Buka `.../exec?page=stats` di browser → tampil JSON.
- Atau test pakai curl:
  ```bash
  curl "https://script.google.com/macros/s/.../exec?page=stats"
  ```

> 💡 **Hint**: baca semua baris Sheet dengan `getDataRange().getValues()`, hitung per kategori pakai object `{ Webinar: 0, Workshop: 0, ... }`.

---

# 🟡 INTI

## Soal 4 — Webhook Receiver

**Tujuan**: paham `doPost`, baca body request, validasi.

Implementasikan `doPost(e)` yang:
1. **Parse JSON** dari `e.postData.contents`. Kalau gagal → return `{ ok: false, error: "..." }`.
2. **Validasi**: payload harus punya field `event` dan `data`. Kalau tidak → return error.
3. **Append** ke tab `Webhook-Log`: `[timestamp, event, JSON.stringify(data)]`.
4. **Kalau `event === "alert"`** → kirim email ke email Anda sendiri dengan subject `[ALERT] {data.message}`.
5. Return `{ ok: true, eventId: <nomor row terakhir> }`.

**Test pakai curl** (ganti URL dengan URL Web App Anda):
```bash
# Test normal
curl -X POST "https://script.google.com/macros/s/.../exec" \
  -H "Content-Type: application/json" \
  -d '{"event":"signup","data":{"email":"a@b.com"}}'

# Test alert (cek inbox setelahnya)
curl -X POST "https://script.google.com/macros/s/.../exec" \
  -H "Content-Type: application/json" \
  -d '{"event":"alert","data":{"message":"Server down"}}'
```

> 💡 **Hint**: ingat — saat deploy ulang dengan `doPost` baru, harus **New version**, bukan cuma save. Test deployment URL juga boleh.

---

## Soal 5 — Konsumsi API Cuaca

**Tujuan**: paham `UrlFetchApp.fetch` untuk panggil API luar.

Buat function `updateCuacaSheet()` yang:
1. Untuk 5 kota: Jakarta, Surabaya, Bandung, Medan, Makassar.
2. Panggil `https://wttr.in/<kota>?format=j1` untuk masing-masing.
3. Buat tab baru `Cuaca` (kalau belum ada) dengan header: `Tanggal | Kota | Temp (°C) | Kondisi | Kelembaban`.
4. Tulis hasil ke tab `Cuaca`.

**Bonus**: pasang **trigger time-driven** untuk jalan setiap 6 jam. (Lihat Modul 6 untuk trigger.) Setelah selesai latihan, hapus trigger-nya.

> 💡 **Hint**: gunakan loop `forEach` atas array kota. Pakai `muteHttpExceptions: true` supaya 1 kota gagal tidak menghentikan yang lain.

---

## Soal 6 — Kurs Mata Uang Harian

**Tujuan**: praktek API + idempotent (tidak duplikat).

Buat function `updateKursIDR()` yang:
1. Panggil `https://api.exchangerate-api.com/v4/latest/USD`.
2. Ambil rate untuk **USD, EUR, SGD, JPY** ke **IDR**.
3. Append ke tab `Kurs` dengan format: `[tanggal, currency, rate]`.
4. **Idempotent**: kalau hari ini sudah ada record di tab `Kurs`, **skip** (tidak menambah duplikat).

**Test**: run 2x berturut-turut → log harus bilang "sudah update hari ini" di run kedua.

> 💡 **Hint**:
> - Format tanggal jadi string `yyyy-MM-dd` pakai `Utilities.formatDate()`.
> - Loop data Sheet, cek apakah ada baris dengan tanggal sama.

---

# 🔴 LANJUTAN / BONUS

## Soal 7 — Slack Notif Saat Ada Pendaftar Baru

**Tujuan**: integrasi 2 arah (form → Sheet → Slack).

1. Setup **Incoming Webhook** di Slack workspace (atau pakai test webhook). Simpan URL-nya di Script Properties sebagai `SLACK_WEBHOOK_URL`.
2. Modifikasi function `daftarEvent` (Soal 2) — setelah `appendRow` sukses, panggil `kirimKeSlack(...)` dengan pesan:
   ```
   📥 Pendaftar baru
   Nama: <nama>
   Email: <email>
   Kategori: <kategori>
   ```
3. Test: daftar lewat form → notif harus muncul di Slack channel.

> 💡 **Hint**: lihat `contoh.js` Bagian 7 untuk function `kirimKeSlack`.

---

## Soal 8 — Mini-Project: Dashboard Status Layanan

**Tujuan**: gabungan UrlFetchApp + HtmlService + cache.

Buat Web App yang menampilkan **dashboard sederhana**:
1. Cek 3 endpoint publik (misal: `https://www.google.com`, `https://api.github.com`, `https://wttr.in/Jakarta`).
2. Untuk tiap endpoint: ukur **response time** (ms) dan **status code**.
3. Render tabel HTML: `Endpoint | Status | Response Time | Last Check`.
4. **Kalau status code bukan 200 → baris berwarna merah** (`background: #fee2e2`).
5. Tambah tombol **Refresh** yang reload halaman.

**Bonus level 2**: cache hasil di `PropertiesService` selama 5 menit, supaya kalau ada banyak yang refresh tidak hammer endpoint terus.

> 💡 **Hint**:
> - Ukur waktu: `const start = Date.now(); ... const ms = Date.now() - start;`
> - Cache: simpan `{ ts, results }` JSON, cek selisih waktu sebelum fetch ulang.

---

## Checklist Sebelum Lanjut

Centang yang sudah bisa dengan tenang (boleh masih perlu cek catatan):

- [ ] Bisa deploy Web App dan akses URL public.
- [ ] Bisa baca query string (`e.parameter`) dan POST body (`e.postData.contents`).
- [ ] Bisa balas HTML (untuk manusia) dan JSON (untuk script lain).
- [ ] Bisa panggil API luar pakai `UrlFetchApp.fetch` (GET dan POST).
- [ ] Paham kenapa secret/token wajib di `PropertiesService`.
- [ ] Bisa terima webhook dengan `doPost` dan log ke Sheet.
- [ ] Paham bedanya **Execute as: Me** vs **User**, dan **Anyone** vs **Logged-in**.

Sudah dicentang minimal Soal 1–6? **Anda siap masuk Modul 8 — Integrating Multiple Google Services.** 🎉
