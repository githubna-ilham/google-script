# Modul 7 — Web Apps & API Integration

Di Modul 5 kita bikin form, tapi cuma bisa dibuka dari dalam Google Sheet. Di Modul 7 kita buat **halaman yang punya alamat URL sendiri** — bisa dibuka dari HP, dari laptop teman, dari mana saja. Dan kita juga belajar **menyambungkan script kita ke layanan luar** seperti cuaca, kurs mata uang, atau Slack.

---

## 0. Dua Konsep Utama (Pakai Analogi)

Sebelum masuk kode, dua kata yang akan terus muncul:

### 🏠 Web App = Warung yang Punya Alamat

Bayangkan Anda buka warung. Warung itu punya **alamat** (misal: Jl. Mawar 12). Siapapun yang tahu alamatnya bisa datang dan pesan.

**Web App** = warung versi internet. Alamatnya bukan Jl. Mawar, tapi URL panjang seperti `https://script.google.com/macros/s/AKfy.../exec`. Siapapun yang buka URL itu di browser, akan "dilayani" oleh script kita.

### 📞 API = Telepon Order ke Warung Lain

Kadang warung kita butuh bahan dari warung sebelah. Kita angkat telepon, pesan, terima barang.

**API** (Application Programming Interface) = cara script kita "menelepon" layanan lain di internet. Misal: telepon ke **wttr.in** untuk minta info cuaca, telepon ke **Slack** untuk titip pesan ke channel.

```mermaid
flowchart LR
    User["👤 Pengguna<br/>(buka URL)"] -->|GET| WebApp["🏠 Web App kita<br/>(doGet)"]:::wa
    WebApp -->|UrlFetchApp.fetch| API["📞 API luar<br/>(cuaca, slack, dll)"]:::api
    API -->|jawaban JSON| WebApp
    WebApp -->|HTML / JSON| User

    classDef wa fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    classDef api fill:#fee2e2,stroke:#dc2626,stroke-width:2px
```

Itu inti modul ini. Sisanya cuma detail teknis.

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

### 1.2 Deploy (Publish) — Pelan-pelan

Tulisan kode saja belum cukup. Kita harus **deploy** supaya Google memberi kita URL.

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

## 2. Bagaimana Apps Script Tahu Apa yang Dipanggil?

Setiap kali ada yang buka URL Web App, Apps Script otomatis panggil salah satu dari dua function ini:

| Function | Kapan dipanggil |
|---|---|
| **`doGet(e)`** | Saat URL dibuka di browser (GET request) |
| **`doPost(e)`** | Saat ada yang mengirim data ke URL (POST request, biasanya dari script/webhook lain) |

Parameter **`e`** itu objek berisi info request — siapa yang manggil, parameter apa yang dikirim, body request kalau POST, dll. Kita akan pakai `e` di bagian berikutnya.

> Tidak harus bikin keduanya. Kalau cuma butuh tampilan, cukup `doGet`. Kalau cuma menerima webhook, cukup `doPost`.

---

## 3. Membaca Parameter dari URL

URL bisa membawa "titipan" lewat **query string** — bagian setelah tanda `?`.

Contoh: `https://.../exec?nama=Sari&umur=28`

Bagian `nama=Sari&umur=28` itu titipan. Kita ambil pakai `e.parameter`:

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

## 5. Menelepon API Luar — `UrlFetchApp`

Sekarang sisi sebaliknya: script kita yang **memanggil** layanan luar.

Fungsi utamanya: **`UrlFetchApp.fetch(url)`**. Anggap saja seperti `fetch()` di browser, tapi versi Apps Script.

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

## 6. Web App + Form HTML (Kombinasi)

Ini pola yang paling sering dipakai di dunia nyata: bikin form, user isi, data masuk ke Sheet.

### 6.1 File HTML terpisah

Di editor: ikon **+** sebelah "Files" → **HTML** → kasih nama `form` (tanpa `.html`).

`form.html`:
```html
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 400px; margin: 40px auto;">
  <h2>Pendaftaran</h2>
  <input id="nama"  placeholder="Nama"  style="width:100%; padding:8px; margin:4px 0;">
  <input id="email" placeholder="Email" style="width:100%; padding:8px; margin:4px 0;">
  <button onclick="kirim()" style="padding:8px 16px;">Daftar</button>
  <p id="status"></p>

  <script>
    function kirim() {
      const data = {
        nama:  document.getElementById("nama").value,
        email: document.getElementById("email").value
      };
      document.getElementById("status").innerText = "Mengirim...";

      google.script.run
        .withSuccessHandler(r => document.getElementById("status").innerText = "✅ " + r.pesan)
        .withFailureHandler(e => document.getElementById("status").innerText = "❌ " + e.message)
        .simpanPendaftar(data);
    }
  </script>
</body>
</html>
```

### 6.2 File Code.gs

```javascript
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("form")
    .setTitle("Pendaftaran")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function simpanPendaftar(data) {
  const sheet = SpreadsheetApp.openById("ID_SHEET_ANDA").getSheetByName("Pendaftar");
  sheet.appendRow([new Date(), data.nama, data.email]);
  return { pesan: "Pendaftaran berhasil!" };
}
```

### 6.3 Cara kerjanya

```mermaid
flowchart LR
    Browser["📱 Browser user"] -->|buka URL| DoGet["doGet"]
    DoGet -->|kirim HTML| Browser
    Browser -->|user klik Daftar<br/>google.script.run| Simpan["simpanPendaftar"]
    Simpan -->|appendRow| Sheet["📊 Sheet"]
    Simpan -->|return| Browser
```

`google.script.run.namaFunction(arg)` adalah jembatan sihir Apps Script yang memanggil function server dari client. Mirip `fetch()` tapi otomatis aman dan tidak perlu URL.

---

## 7. Menerima Webhook — `doPost(e)`

**Webhook** = "API tapi terbalik": layanan luar yang **mengirim data ke kita** saat ada kejadian. Contoh: setiap kali ada pembelian di toko, Stripe kirim notifikasi ke URL kita.

URL kita harus siap menerima. Caranya: bikin `doPost(e)`.

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

### Test pakai curl (dari Terminal)

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"event":"signup","email":"alice@example.com"}' \
  https://script.google.com/macros/s/.../exec
```

Buka Sheet → ada baris baru. 🎉

> Belum punya layanan luar? Pakai **webhook.site** untuk simulasi, atau langsung test pakai curl seperti di atas.

---

## 8. Pengaturan Akses (Penting!)

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
