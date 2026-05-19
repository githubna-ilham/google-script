# Modul 7 — Web Apps & API Integration

Di Modul 5 kita bikin form, tapi hanya bisa dibuka dari dalam Google Sheet. Di Modul 7 kita buat **halaman yang punya alamat URL sendiri** — bisa dibuka dari HP, laptop, atau perangkat manapun yang punya browser. Sekaligus belajar **menghubungkan script ke layanan luar** lewat API (misal: ambil data cuaca, kirim pesan ke Slack).

---

## 0. Dua Konsep Utama

### Web App

**Web App** adalah halaman yang di-host oleh Apps Script dan punya **URL sendiri** seperti `https://script.google.com/macros/s/AKfy.../exec`. Saat seseorang membuka URL itu di browser, function `doGet(e)` di project Anda akan dijalankan, dan output-nya (HTML atau JSON) ditampilkan di browser pengguna.

Gunakan Web App untuk:
- Halaman publik (dashboard, form pendaftaran, info).
- Endpoint API yang return JSON untuk dipakai sistem lain.
- Antarmuka standalone yang tidak butuh user buka Google Sheet/Doc.

### API (External)

**API** (Application Programming Interface) adalah cara dua sistem saling bertukar data lewat HTTP request. Di Apps Script, kita memanggil API luar pakai `UrlFetchApp.fetch(url)` — script kirim request ke layanan eksternal (cuaca, kurs, Slack, dll), lalu olah response-nya (biasanya JSON).

```mermaid
flowchart LR
    User["Pengguna<br/>(buka URL)"] -->|GET| WebApp["Web App<br/>(doGet)"]:::wa
    WebApp -->|UrlFetchApp.fetch| API["API luar<br/>(cuaca, Slack, dll)"]:::api
    API -->|response JSON| WebApp
    WebApp -->|HTML / JSON| User

    classDef wa fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    classDef api fill:#fee2e2,stroke:#dc2626,stroke-width:2px
```

Sebagian besar modul ini adalah varian dari dua konsep di atas.

---

## 1. Web App Pertama — "Hello World"

Mari langsung praktek. Kita buat halaman paling sederhana yang bisa dibuka di browser.

### 1.1 Tulis kode

Di project Apps Script baru, buat function bernama **`doGet`** (nama ini wajib, jangan diganti):

```javascript
function doGet(e) {
  return HtmlService.createHtmlOutput("<h1>Halo dari Web App!</h1>");
}
```

> **Kenapa namanya `doGet`?** Karena saat browser membuka URL, browser kirim permintaan jenis **GET** ("tolong kasih saya halaman"). Apps Script otomatis mencari function bernama `doGet` untuk menjawab.

### 1.2 Deploy (Publish)

Kode saja belum cukup — Web App harus **di-deploy** terlebih dahulu agar Google memberikan URL publik.

Langkah klik di editor Apps Script:

1. Klik tombol biru **Deploy** (pojok kanan atas).
2. Pilih **New deployment**.
3. Klik ikon ⚙️ di sebelah "Select type", pilih **Web app**.
4. Isi:
   - **Description**: bebas, misal "Test pertama".
   - **Execute as**: pilih **Me (email Anda)**. Artinya: script ini jalan pakai izin akun Anda.
   - **Who has access**: pilih **Anyone**. Artinya: siapapun (bahkan tanpa login Google) bisa buka URL ini.
5. Klik **Deploy**.
6. Pertama kali, Google minta **autorisasi** — klik **Authorize access** → pilih akun Anda → ada warning "Google hasn't verified this app", klik **Advanced → Go to (nama project) (unsafe)** → **Allow**.

> Warning "unsafe" itu **normal** untuk script milik sendiri. Bukan berarti berbahaya — Google cuma belum sempat me-review script personal.

7. Selesai. Akan muncul **Web app URL**. Copy URL itu.

### 1.3 Buka URL

Tempel URL ke tab browser baru → tekan Enter. Akan tampil:

> **Halo dari Web App!**

Selamat 🎉 — itu Web App pertama Anda. URL itu bisa dibuka dari HP, dari laptop teman, dari mana saja.

### 1.4 Update kode → harus re-deploy

Ini bagian yang sering bikin pemula bingung:

> **Setiap kali kode berubah, halaman di URL TIDAK otomatis update.**

Anda harus:
- **Cara cepat (untuk ngetes)**: Deploy → **Test deployments** → copy URL test. URL test selalu pakai versi kode terbaru.
- **Cara resmi**: Deploy → **Manage deployments** → pilih deployment Anda → ikon ✏️ pensil → **Version: New version** → **Deploy**. URL tetap sama, tapi sekarang melayani kode terbaru.

Aturan praktis: **selama development pakai Test URL, kalau sudah jadi baru bikin version resmi**.

---

## 2. Entry Point Web App: `doGet` & `doPost`

Setiap kali ada request ke URL Web App, Apps Script otomatis memanggil salah satu dari dua function entry point berikut:

| Function | Kapan dipanggil |
|---|---|
| **`doGet(e)`** | Saat URL dibuka di browser (HTTP GET request) |
| **`doPost(e)`** | Saat sistem lain mengirim data ke URL (HTTP POST request — webhook, integrasi sistem, dll) |

Parameter **`e`** berisi informasi request: query parameter (`e.parameter`), body request kalau POST (`e.postData`), dan metadata lain. Detail penggunaannya dibahas di section berikutnya.

> Tidak wajib mendefinisikan keduanya. Untuk halaman publik / dashboard cukup `doGet`. Untuk webhook receiver cukup `doPost`.

---

## 3. Membaca Parameter dari URL

URL Web App bisa menerima parameter lewat **query string** — bagian setelah tanda `?`.

Contoh: `https://.../exec?nama=Sari&umur=28`

Bagian `nama=Sari&umur=28` adalah query parameter. Untuk mengaksesnya di server gunakan `e.parameter`:

```javascript
function doGet(e) {
  const nama = e.parameter.nama || "Tamu";     // kalau kosong → "Tamu"
  const umur = e.parameter.umur || "—";

  return HtmlService.createHtmlOutput(`
    <h1>Halo, ${nama}!</h1>
    <p>Umur kamu: ${umur}</p>
  `);
}
```

Coba buka:
- `.../exec` → "Halo, Tamu! Umur kamu: —"
- `.../exec?nama=Budi` → "Halo, Budi! Umur kamu: —"
- `.../exec?nama=Sari&umur=28` → "Halo, Sari! Umur kamu: 28"

> Bagaimana cara mengirim parameter dari form? Lihat Section 6.

---

## 4. Web App Bisa Balas JSON, Bukan Cuma HTML

Kadang Web App tidak dipakai manusia, tapi dipakai **script/aplikasi lain** untuk minta data. Untuk itu, jawab pakai **JSON** (format data standar di internet) — bukan HTML.

```javascript
function doGet(e) {
  const data = {
    waktu:   new Date().toISOString(),
    pesan:   "halo dari API",
    angka:   42
  };

  return ContentService
    .createTextOutput(JSON.stringify(data))    // ubah object → string JSON
    .setMimeType(ContentService.MimeType.JSON); // beritahu browser: ini JSON
}
```

Buka URL → terlihat seperti:

```json
{"waktu":"2026-05-12T03:15:00.000Z","pesan":"halo dari API","angka":42}
```

**Kapan pakai HTML, kapan pakai JSON?**

| Tujuan | Pakai |
|---|---|
| Manusia buka di browser, lihat tampilan | `HtmlService` → HTML |
| Aplikasi/script lain ambil data | `ContentService` → JSON |

---

## 5. Memanggil API Luar — `UrlFetchApp`

Bagian ini membahas arah sebaliknya: script kita yang **memanggil** layanan eksternal lewat HTTP.

Fungsi utamanya adalah `UrlFetchApp.fetch(url)` — equivalen dengan `fetch()` di browser, versi Apps Script.

### 5.1 Contoh paling sederhana — cek cuaca

`wttr.in` adalah layanan cuaca gratis, tanpa daftar, tanpa API key. Cocok untuk latihan.

```javascript
function cekCuaca() {
  const url = "https://wttr.in/Jakarta?format=j1";
  const respon = UrlFetchApp.fetch(url);          // 1. panggil
  const data = JSON.parse(respon.getContentText()); // 2. ubah teks JSON → object

  const suhu = data.current_condition[0].temp_C;
  const kondisi = data.current_condition[0].weatherDesc[0].value;

  console.log(`Jakarta: ${suhu}°C, ${kondisi}`);
}
```

Run → lihat Executions log:

```
Jakarta: 30°C, Partly cloudy
```

### 5.2 Apa yang baru saja terjadi?

```mermaid
sequenceDiagram
    participant S as Script kita
    participant W as wttr.in
    S->>W: GET /Jakarta?format=j1
    W-->>S: { current_condition: [...], ... }
    S->>S: JSON.parse → ambil data.current_condition[0].temp_C
```

Tiga langkah selalu sama setiap kali panggil API:
1. **Kirim request** dengan `UrlFetchApp.fetch(url)`.
2. **Ambil teks balasan** dengan `.getContentText()`.
3. **Parse JSON** kalau jawabannya JSON: `JSON.parse(...)`.

### 5.3 Kalau API perlu kirim data (POST)

```javascript
function kirimKeSlack(pesan) {
  const opsi = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ text: pesan })
  };
  UrlFetchApp.fetch("https://hooks.slack.com/services/AAA/BBB/CCC", opsi);
}
```

Bedanya dengan GET: kita kasih **opsi kedua** ke `fetch()` berisi method `"post"` dan `payload` (data yang dikirim).

### 5.4 Kalau API perlu password/token

Banyak API butuh "kunci" supaya tahu siapa yang manggil. Biasanya berupa token panjang di header **Authorization**.

```javascript
const opsi = {
  method: "get",
  headers: {
    "Authorization": "Bearer xxxxxxxxxxxxxxxxxxxx"
  }
};
UrlFetchApp.fetch("https://api.contoh.com/data", opsi);
```

### 5.5 ⚠️ Jangan tulis token langsung di kode!

Token = password. Kalau Anda copy-paste kode ke GitHub atau share ke orang, token ikut bocor.

Cara aman: simpan di **Script Properties**.

```javascript
// Set sekali, dari editor (Run function ini sekali):
function simpanToken() {
  PropertiesService.getScriptProperties()
    .setProperty("SLACK_TOKEN", "xoxb-rahasia-banget-jangan-bocor");
}

// Pakai di mana-mana:
function panggilSlack() {
  const token = PropertiesService.getScriptProperties().getProperty("SLACK_TOKEN");
  // ... pakai token
}
```

Atau dari menu: **Project Settings ⚙️ → Script Properties → Add property**.

---

## 6. Dashboard Pelatihan — Web App Read-only

Studi kasus paling jelas: bikin **dashboard publik** yang menampilkan data peserta & program lembaga pelatihan, bisa di-share via link. Stakeholder (manajemen, klien, calon peserta) tinggal buka URL → lihat statistik & daftar program tanpa perlu akses Sheet.

### 6.1 Yang akan kita bangun

```mermaid
flowchart LR
    Browser["Browser user<br/>buka URL Web App"] -->|doGet| GAS["Apps Script"]
    GAS -->|kirim HTML| Browser
    Browser -->|google.script.run.bacaDataDashboard| Server["bacaDataDashboard"]
    Server -->|read| Sheet["Sheet:<br/>tab Peserta<br/>tab Program"]
    Sheet -->|data| Server
    Server -->|JSON| Browser
    Browser -->|render statistik + tabel| User["Tampilan dashboard"]
```

Komponen dashboard:
1. **Kartu statistik** — total peserta, jumlah Lulus (+ persentase), Sedang Berjalan, rata-rata nilai.
2. **Tabel Program** — kode, nama, kapasitas, terisi, jadwal, lokasi, biaya.
3. **Tabel Peserta** — dengan filter client-side: search teks, dropdown program, dropdown status.
4. **Tombol Refresh** — re-fetch data tanpa reload halaman.

### 6.2 Server side — function `bacaDataDashboard()`

Function ini dipanggil dari client lewat `google.script.run`. Tugasnya: baca tab `Peserta` & `Program`, hitung statistik, return semua sebagai satu object JSON.

```javascript
function bacaDataDashboard() {
  const SHEET_ID = PropertiesService.getScriptProperties().getProperty("DASHBOARD_SHEET_ID");
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const tz = Session.getScriptTimeZone();

  // ----- Tab Program → array of object -----
  const shProgram = ss.getSheetByName("Program");
  const dataProg = shProgram.getDataRange().getValues();
  const hProg = dataProg[0];

  const program = dataProg.slice(1).map((r) => ({
    kode:         r[hProg.indexOf("Kode")],
    nama:         r[hProg.indexOf("Nama Program")],
    kapasitas:    r[hProg.indexOf("Kapasitas")],
    biaya:        r[hProg.indexOf("Biaya")],
    tanggalMulai: Utilities.formatDate(r[hProg.indexOf("Tanggal Mulai")], tz, "yyyy-MM-dd"),
    lokasi:       r[hProg.indexOf("Lokasi")]
  })).filter((p) => p.kode);

  // ----- Tab Peserta → array of object -----
  const shPeserta = ss.getSheetByName("Peserta");
  const dataPst = shPeserta.getDataRange().getValues();
  const hPst = dataPst[0];

  const peserta = dataPst.slice(1).map((r) => ({
    id:       r[hPst.indexOf("ID Peserta")],
    nama:     r[hPst.indexOf("Nama")],
    instansi: r[hPst.indexOf("Instansi")],
    program:  r[hPst.indexOf("Program")],
    nilai:    r[hPst.indexOf("Nilai")],
    status:   r[hPst.indexOf("Status")]
  })).filter((p) => p.id);

  // ----- Hitung statistik -----
  const total = peserta.length;
  const lulus = peserta.filter((p) => p.status === "Lulus").length;
  const sedangBerjalan = peserta.filter((p) => p.status === "Sedang Berjalan").length;
  const tidakLulus = peserta.filter((p) => p.status === "Tidak Lulus").length;

  const nilaiList = peserta.map((p) => p.nilai).filter((n) => typeof n === "number");
  const rataNilai = nilaiList.length > 0
    ? nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length
    : null;

  return {
    statistik: { total, lulus, sedangBerjalan, tidakLulus, rataNilai },
    program,
    peserta
  };
}
```

**Mengapa baca semua sekaligus, bukan per-tabel?**
- Satu round-trip ke server lebih cepat dari dua.
- Statistik di-hitung di server supaya konsisten — kalau di-hitung di client, bisa terjadi race kalau data diubah saat user lagi filter.

### 6.3 doGet — serve halaman dashboard

```javascript
function doGet(e) {
  const page = (e && e.parameter && e.parameter.page) || "dashboard";

  if (page === "api-data") {
    // Optional: expose data sebagai API JSON (untuk dipakai sistem lain)
    return _json(bacaDataDashboard());
  }

  // Default: tampilkan dashboard HTML
  return HtmlService.createHtmlOutputFromFile("dashboard")
    .setTitle("Dashboard Pelatihan")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}
```

`createHtmlOutputFromFile("dashboard")` → ambil isi file `dashboard.html` di project, render ke browser. Nama tanpa ekstensi.

### 6.4 Client side — `dashboard.html`

File HTML di-bagi tiga: **CSS untuk styling**, **markup HTML untuk struktur**, **`<script>` untuk fetch data & filter**. Struktur ringkas (kode lengkap di `dashboard.html`):

```html
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>/* ... CSS card, tabel, badge status, dll ... */</style>
</head>
<body>
  <h1>Dashboard Pelatihan</h1>

  <!-- 1. Kartu statistik -->
  <div class="stats">
    <div class="stat">
      <div class="stat-label">Total Peserta</div>
      <div class="stat-value" id="stat-total">0</div>
    </div>
    <!-- ... 3 kartu lain: Lulus, Sedang Berjalan, Rata-rata Nilai ... -->
  </div>

  <!-- 2. Tabel Program -->
  <div class="card">
    <table>
      <thead><tr><th>Kode</th><th>Nama</th>...</tr></thead>
      <tbody id="tbl-program"></tbody>
    </table>
  </div>

  <!-- 3. Tabel Peserta dengan filter -->
  <div class="card">
    <div class="filters">
      <input id="filter-search" placeholder="Cari...">
      <select id="filter-program"></select>
      <select id="filter-status"></select>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Nama</th>...</tr></thead>
      <tbody id="tbl-peserta"></tbody>
    </table>
  </div>

  <script>
    let semuaPeserta = [], semuaProgram = [];

    document.addEventListener("DOMContentLoaded", muatData);

    function muatData() {
      google.script.run
        .withSuccessHandler(onDataMuat)
        .withFailureHandler((err) => alert("Error: " + err.message))
        .bacaDataDashboard();
    }

    function onDataMuat(data) {
      semuaPeserta = data.peserta;
      semuaProgram = data.program;

      // Render statistik ke kartu
      document.getElementById("stat-total").innerText = data.statistik.total;
      // ... isi kartu lainnya

      renderProgram();
      renderPeserta();
    }

    function renderPeserta() {
      // Filter di client-side berdasar input search + dropdown
      const hasil = semuaPeserta.filter((p) => {
        // ... cek search teks, program, status
      });
      // Build <tr> HTML dari hasil filter
    }

    // Filter listeners
    document.getElementById("filter-search").addEventListener("input", renderPeserta);
    document.getElementById("filter-program").addEventListener("change", renderPeserta);
    document.getElementById("filter-status").addEventListener("change", renderPeserta);
  </script>
</body>
</html>
```

### 6.5 Persiapan & Deploy

Sebelum deploy, set Script Properties supaya server tahu Sheet mana yang dipakai:

```javascript
function setupDashboard() {
  PropertiesService.getScriptProperties()
    .setProperty("DASHBOARD_SHEET_ID", "1AbCdEf...ID_SHEET_PELATIHAN");
}
```

Jalankan `setupDashboard()` sekali manual. Lalu:

1. **Deploy → New deployment → Type: Web app**.
2. **Execute as: Me** (script jalan atas nama Anda — akses Sheet pakai izin Anda).
3. **Who has access: Anyone** (publik) atau **Anyone with Google account** (login Google saja).
4. Deploy → Authorize → copy URL → buka di browser baru → dashboard muncul.

### 6.6 Pola Penting yang Muncul

1. **Read-only dashboard**: server hanya `read` Sheet (`getValues`), tidak ada `write`. Aman untuk dibagikan publik karena viewer tidak bisa modify data — Sheet asli tetap aman.

2. **Filter di client, bukan server**: setelah `bacaDataDashboard()` selesai, semua data ada di variabel JS `semuaPeserta` & `semuaProgram`. Saat user ketik di kolom search atau pilih dropdown filter, `renderPeserta()` filter array in-memory tanpa panggil server lagi. Lebih responsif & hemat quota.

3. **Statistik dihitung di server**: konsisten dengan source-of-truth (Sheet), client tinggal tampilkan.

4. **Tombol Refresh**: panggil `bacaDataDashboard()` ulang untuk dapat data terbaru dari Sheet. Tidak perlu reload halaman.

5. **Date di-format di server**: kolom Tanggal di Sheet jadi `Date` object di JS. Format ke `"yyyy-MM-dd"` di server pakai `Utilities.formatDate()` supaya client tinggal tampilkan tanpa parsing.

`google.script.run.namaFunction(arg)` adalah mekanisme Apps Script untuk memanggil function server dari client. Asynchronous — pakai `.withSuccessHandler(cb)` & `.withFailureHandler(cb)` untuk handle response & error.

---

## 7. Menerima Webhook — `doPost(e)`

**Webhook** adalah mekanisme di mana **layanan luar yang mengirim data ke Web App kita** saat ada kejadian tertentu. Berbeda dengan API biasa (script kita yang inisiatif kirim request), webhook bersifat inbound: sistem eksternal yang trigger script kita. Contoh: setiap kali ada pembayaran masuk, sistem pembayaran kirim notifikasi POST ke URL Web App kita.

Untuk menerima webhook, Web App harus punya `doPost(e)` yang siap menerima request POST.

```javascript
function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);   // body request dalam bentuk teks JSON
  } catch (err) {
    return _json({ ok: false, error: "Bukan JSON valid" });
  }

  // Log ke Sheet supaya bisa dilihat
  const sheet = SpreadsheetApp.openById("ID_SHEET").getSheetByName("Webhook-Log");
  sheet.appendRow([new Date(), JSON.stringify(payload)]);

  return _json({ ok: true });
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Setelah deploy ulang, kirim POST ke URL Web App dari sistem eksternal. Baris baru akan muncul di tab `Webhook-Log` setiap webhook diterima.

---

## 8. Pengaturan Akses Web App

Saat deploy, ada dua dropdown yang menentukan **siapa yang bisa pakai** dan **dengan izin siapa script jalan**:

### "Execute as"

| Pilihan | Artinya |
|---|---|
| **Me** | Script jalan pakai akun Anda. Bisa akses Sheet/Drive Anda. **Wajib untuk webhook receiver.** |
| **User accessing the web app** | Script jalan pakai akun pengunjung. Pengunjung wajib login Google. |

### "Who has access"

| Pilihan | Cocok untuk |
|---|---|
| **Only myself** | Eksperimen pribadi |
| **Anyone with Google account** | Internal organisasi |
| **Anyone** | Form public, webhook receiver |

> Untuk **webhook**, kombinasi yang benar: **Execute as: Me** + **Who has access: Anyone**. Webhook luar tidak punya akun Google, jadi harus Anonymous.

---

## 9. Batas (Quota)

Apps Script gratis tapi ada batas. Yang perlu diingat untuk modul ini:

- `UrlFetchApp.fetch`: **20.000 panggilan/hari** (gratis), 100.000 (Workspace).
- Eksekusi Web App: maksimal **6 menit per request**.
- Maksimal **30 request bersamaan** per user.

Untuk latihan tidak akan kena. Untuk production yang ramai, perlu hati-hati.

---

## 10. Tips & Pitfall Umum Pemula

| Masalah | Solusi |
|---|---|
| "Kode sudah diubah tapi halaman lama" | Anda lupa re-deploy version baru, atau pakai URL `/exec` lama padahal yang ada perubahan adalah Test URL. |
| "Authorization required" terus muncul | Run function sekali manual dari editor → autorisasi → baru deploy. |
| Webhook dari luar dapat error 401 | Cek "Who has access" — harus **Anyone**, bukan Anyone with Google account. |
| Data Bahasa Indonesia jadi "???" | Pastikan response pakai UTF-8 (default sudah). Untuk JSON, jangan modif mime type. |
| `UrlFetchApp` throw error saat API balas 4xx/5xx | Tambah opsi `muteHttpExceptions: true` supaya bisa handle status code sendiri. |

```javascript
const opsi = { method: "get", muteHttpExceptions: true };
const respon = UrlFetchApp.fetch(url, opsi);
if (respon.getResponseCode() !== 200) {
  console.log("API error:", respon.getContentText());
  return;
}
```

---

## 11. Checklist Sebelum Lanjut

Tandai yang sudah bisa dengan tenang (tidak perlu cepat):

- [ ] Bisa bikin `doGet` yang balas HTML sederhana.
- [ ] Tahu langkah deploy → autorisasi → dapat URL.
- [ ] Paham bedanya Test deployment vs new version.
- [ ] Bisa baca `e.parameter` dari query string.
- [ ] Bisa balas JSON pakai `ContentService`.
- [ ] Bisa panggil API luar pakai `UrlFetchApp.fetch` (GET).
- [ ] Tahu kenapa token harus di `PropertiesService`, bukan di kode.
- [ ] Bisa terima webhook pakai `doPost` dan log ke Sheet.

Kalau ada yang belum jelas, ulangi bagiannya — **lebih baik pelan tapi paham, daripada cepat tapi bingung di Modul 8**.

---

## 12. Bonus — Mini Project: Bot Telegram

> ⚠️ **Bagian opsional.** Skip dulu kalau Section 1–11 masih terasa berat. Boleh balik ke sini nanti.

Skenario: User chat bot di Telegram → bot balas otomatis dari data Sheet kita.

### Langkah singkat

1. **Bikin bot**: chat `@BotFather` di Telegram → `/newbot` → kasih nama → dapat **token** (string panjang).
2. **Simpan token** di Script Properties dengan key `BOT_TOKEN`.
3. **Tulis Web App**:

```javascript
const BOT_TOKEN = PropertiesService.getScriptProperties().getProperty("BOT_TOKEN");

function doPost(e) {
  const update = JSON.parse(e.postData.contents);
  if (!update.message) return _json({ ok: true });

  const chatId = update.message.chat.id;
  const text   = (update.message.text || "").trim();

  let balasan;
  if (text === "/start") {
    balasan = "Halo! Ketik /menu untuk lihat perintah.";
  } else if (text === "/menu") {
    balasan = "/menu — daftar perintah\n/info — info bot";
  } else if (text === "/info") {
    balasan = "Bot demo Modul 7 ✨";
  } else {
    balasan = `Saya menerima: "${text}"`;
  }

  kirimPesan(chatId, balasan);
  return _json({ ok: true });
}

function kirimPesan(chatId, text) {
  UrlFetchApp.fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ chat_id: chatId, text: text })
  });
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. **Deploy** sebagai Web App (Anyone, Execute as Me) → copy URL.
5. **Daftarkan webhook** ke Telegram (run sekali dari editor):

```javascript
function pasangWebhook() {
  const URL = "https://script.google.com/macros/s/.../exec"; // URL Web App Anda
  const r = UrlFetchApp.fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(URL)}`
  );
  console.log(r.getContentText()); // harus berisi {"ok":true,...}
}
```

6. **Coba**: chat bot Anda di Telegram → bot membalas. 🎉

Inilah inti integrasi 2-arah:
- Telegram → script kita (webhook lewat `doPost`).
- Script kita → Telegram (UrlFetchApp ke `sendMessage`).

---

## 13. Penutup

Yang sudah Anda kuasai:
- Membuat halaman web sendiri yang bisa diakses dari URL public.
- Menerima data dari form (manusia) maupun dari webhook (mesin).
- Memanggil layanan luar (API) untuk ambil/kirim data.
- Menyimpan rahasia dengan aman lewat PropertiesService.

**Selanjutnya — Modul 8: Integrating Multiple Google Services** (menggabungkan Sheet + Gmail + Drive + Calendar dalam satu alur otomatis).
