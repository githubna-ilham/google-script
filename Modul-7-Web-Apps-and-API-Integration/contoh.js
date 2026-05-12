/**
 * Modul 7 — Contoh Lengkap (Versi Ramah Pemula)
 *
 * File ini disusun dari yang PALING SEDERHANA ke yang lebih advanced.
 * Setiap bagian bisa dijalankan terpisah, jadi tidak perlu paham semua sekaligus.
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ Urutan belajar yang disarankan:                              │
 * │                                                              │
 * │   Bagian 1  → Web App "Halo Dunia"          ⭐ Mulai di sini │
 * │   Bagian 2  → Baca query string                              │
 * │   Bagian 3  → Balas JSON                                     │
 * │   Bagian 4  → Panggil API luar (cuaca)                       │
 * │   Bagian 5  → Form + simpan ke Sheet                         │
 * │   Bagian 6  → Terima webhook (doPost)                        │
 * │   Bagian 7  → Kirim notif ke Slack                           │
 * │   Bagian 8  → Bot Telegram (BONUS, opsional)                 │
 * │                                                              │
 * └──────────────────────────────────────────────────────────────┘
 *
 * CARA DEPLOY (lakukan setelah save):
 *   1. Klik Deploy → New deployment
 *   2. Type: Web app
 *   3. Execute as: Me
 *   4. Who has access: Anyone
 *   5. Deploy → Authorize → copy URL
 *
 * Setiap perubahan kode → Deploy → Manage deployments → Edit ✏️ → New version.
 * Atau pakai "Test deployments" untuk URL development.
 */


/* =========================================================================
 * BAGIAN 1 — Web App paling sederhana
 *
 * Buka URL Web App di browser → muncul "Halo dari Web App!".
 *
 * (Jangan ganti nama function 'doGet' — Apps Script otomatis cari nama itu
 *  saat URL Web App dibuka di browser.)
 * ========================================================================= */

function doGet_sederhana(e) {
  // CATATAN: nama function di atas saya beri suffix '_sederhana' supaya
  // tidak bentrok dengan doGet utama di Bagian 2. Untuk dipakai sebagai
  // doGet sungguhan, rename jadi 'doGet'.
  return HtmlService.createHtmlOutput("<h1>Halo dari Web App!</h1>");
}


/* =========================================================================
 * BAGIAN 2 — doGet utama dengan "routing" lewat ?page=
 *
 * Satu Web App bisa melayani banyak halaman dengan trik: lihat parameter
 * '?page=...' di URL → pilih konten yang dikembalikan.
 *
 * Coba buka:
 *   .../exec                        → halaman home
 *   .../exec?nama=Sari              → home dengan nama
 *   .../exec?page=json              → balas JSON
 *   .../exec?page=form              → buka form pendaftaran
 * ========================================================================= */

function doGet(e) {
  // 'e.parameter' = isi query string. Pakai '||' untuk kasih nilai default.
  const page = (e && e.parameter && e.parameter.page) || "home";
  const nama = (e && e.parameter && e.parameter.nama) || "Tamu";

  // ----- Rute 1: balas JSON (lihat Bagian 3 untuk detail) -----
  if (page === "json") {
    return _json({
      timestamp: new Date().toISOString(),
      user:      Session.getActiveUser().getEmail() || "anonymous",
      pesan:     "Ini balasan JSON dari Web App"
    });
  }

  // ----- Rute 2: buka form (file HTML terpisah, lihat Bagian 5) -----
  if (page === "form") {
    const tmpl = HtmlService.createTemplateFromFile("page-form");
    tmpl.user = Session.getActiveUser().getEmail() || "Tamu";
    return tmpl.evaluate()
      .setTitle("Form Pendaftaran")
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }

  // ----- Rute default: halaman home dengan link ke rute lain -----
  return HtmlService.createHtmlOutput(`
    <html>
      <head><base target="_top"><title>Demo Web App</title></head>
      <body style="font-family: Arial; padding: 20px; max-width: 600px;">
        <h1>Halo, ${nama}!</h1>
        <p>Web App Apps Script sederhana. Coba klik link di bawah:</p>
        <ul>
          <li><a href="?nama=${encodeURIComponent(nama)}&page=form">📝 Form Pendaftaran</a></li>
          <li><a href="?page=json">📦 JSON Endpoint</a></li>
        </ul>
        <p><small>Server time: ${new Date().toString()}</small></p>
      </body>
    </html>
  `);
}


/* =========================================================================
 * BAGIAN 3 — Helper balas JSON
 *
 * Saat Web App dipakai sebagai "API" (bukan halaman manusia), balasannya
 * harus JSON. Helper ini dipakai berkali-kali, jadi disimpan terpisah.
 * ========================================================================= */

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))         // ubah object → string JSON
    .setMimeType(ContentService.MimeType.JSON);    // beritahu: ini JSON
}


/* =========================================================================
 * BAGIAN 4 — Panggil API luar pakai UrlFetchApp
 *
 * Pola umum panggil API:
 *   1. UrlFetchApp.fetch(url)     → kirim request
 *   2. .getContentText()          → ambil teks jawaban
 *   3. JSON.parse(...)            → kalau jawaban berupa JSON
 *
 * Run 'ujiCuaca' untuk test (lihat hasil di Executions log).
 * ========================================================================= */

function ambilCuaca(kota) {
  const url = `https://wttr.in/${encodeURIComponent(kota)}?format=j1`;

  // 'muteHttpExceptions: true' = jangan error meledak kalau API balas 4xx/5xx,
  // biar kita yang handle status code-nya sendiri.
  const respon = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { "User-Agent": "GAS-WebApp" }
  });

  if (respon.getResponseCode() !== 200) {
    console.log(`Gagal ambil cuaca ${kota}: status ${respon.getResponseCode()}`);
    return null;
  }

  const data = JSON.parse(respon.getContentText());
  const cuaca = data.current_condition[0];
  console.log(`${kota}: ${cuaca.temp_C}°C, ${cuaca.weatherDesc[0].value}`);
  return cuaca;
}

function ujiCuaca() {
  ambilCuaca("Jakarta");
  ambilCuaca("Surabaya");
}


/* =========================================================================
 * BAGIAN 5 — Function yang dipanggil dari form (page-form.html)
 *
 * Saat user klik tombol "Daftar" di form, browser memanggil
 * 'google.script.run.daftarEvent(data)' — yang sebenarnya memanggil
 * function di bawah ini di sisi server.
 *
 * Sebelum jalan, set Script Properties:
 *   PENDAFTAR_SHEET_ID = (ID Sheet dengan tab "Pendaftar")
 * ========================================================================= */

function daftarEvent(formData) {
  // Validasi sederhana — kalau gagal, throw → client dapat error.
  if (!formData.nama || !formData.email) {
    throw new Error("Nama dan email wajib diisi.");
  }

  const SHEET_ID = PropertiesService.getScriptProperties().getProperty("PENDAFTAR_SHEET_ID");
  if (!SHEET_ID) {
    throw new Error("Belum set PENDAFTAR_SHEET_ID di Script Properties.");
  }

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Pendaftar");
  sheet.appendRow([
    new Date(),
    formData.nama,
    formData.email,
    formData.kategori || ""
  ]);

  // Object yang di-return akan diterima di 'withSuccessHandler' di client.
  return { ok: true, message: `Terdaftar: ${formData.nama}` };
}


/* =========================================================================
 * BAGIAN 6 — doPost: menerima data dari luar (webhook)
 *
 * Function ini dipanggil saat ada yang kirim POST ke URL Web App.
 * Test pakai curl:
 *
 *   curl -X POST -H "Content-Type: application/json" \
 *     -d '{"event":"signup","email":"a@b.com"}' \
 *     https://script.google.com/macros/s/.../exec
 *
 * Hasilnya tercatat di tab "Webhook-Log" (jika WEBHOOK_SHEET_ID di-set).
 * ========================================================================= */

function doPost(e) {
  // Body request mentah ada di e.postData.contents (berupa string).
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return _json({ ok: false, error: "Body bukan JSON valid" });
  }

  // Log ke Sheet kalau SHEET_ID tersedia.
  const SHEET_ID = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SHEET_ID");
  if (SHEET_ID) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Webhook-Log");
    if (sheet) {
      sheet.appendRow([new Date(), JSON.stringify(payload), e.postData.type || ""]);
    }
  }

  return _json({ ok: true, received: payload });
}


/* =========================================================================
 * BAGIAN 7 — Kirim notif ke Slack
 *
 * Persiapan:
 *   1. Di workspace Slack: Apps → buat "Incoming Webhook" → copy URL.
 *   2. Simpan URL di Script Properties dengan key SLACK_WEBHOOK_URL.
 *   3. Run 'ujiSlack' untuk test.
 * ========================================================================= */

function kirimKeSlack(text) {
  const URL = PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL");
  if (!URL) {
    console.log("SLACK_WEBHOOK_URL belum di-set. Skip kirim.");
    return;
  }

  const respon = UrlFetchApp.fetch(URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ text: text }),    // Slack expect: { "text": "..." }
    muteHttpExceptions: true
  });

  console.log(`Slack respon: ${respon.getResponseCode()}`);
}

function ujiSlack() {
  kirimKeSlack("Halo dari Apps Script 👋");
}


/* =========================================================================
 * BAGIAN 8 — BONUS: Bot Telegram
 *
 * ⚠️ Skip dulu kalau Bagian 1–7 belum lancar.
 *
 * Setup:
 *   1. Chat @BotFather di Telegram → /newbot → dapat BOT_TOKEN.
 *   2. Set Script Properties:
 *        TELEGRAM_BOT_TOKEN = <token>
 *        WEB_APP_URL        = (URL Web App setelah deploy)
 *   3. Run 'pasangTelegramWebhook' sekali.
 *   4. Pastikan doPost di Bagian 6 memanggil 'handleTelegramUpdate(payload)'.
 *   5. Chat bot Anda di Telegram → bot harus membalas.
 * ========================================================================= */

function _telegramToken() {
  return PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
}

function pasangTelegramWebhook() {
  const TOKEN = _telegramToken();
  const WEB_APP_URL = PropertiesService.getScriptProperties().getProperty("WEB_APP_URL");

  if (!TOKEN)       { console.log("Set TELEGRAM_BOT_TOKEN dulu."); return; }
  if (!WEB_APP_URL) { console.log("Set WEB_APP_URL dulu.");        return; }

  const r = UrlFetchApp.fetch(
    `https://api.telegram.org/bot${TOKEN}/setWebhook?url=${encodeURIComponent(WEB_APP_URL)}`
  );
  console.log(r.getContentText());   // Harus berisi {"ok":true,...}
}

function kirimPesanTelegram(chatId, text) {
  const TOKEN = _telegramToken();
  UrlFetchApp.fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ chat_id: chatId, text: text })
  });
}

// Handler untuk pesan dari Telegram. Panggil dari dalam doPost kalau
// Anda mau Web App ini sekaligus jadi bot Telegram.
function handleTelegramUpdate(update) {
  if (!update.message) return;

  const chatId = update.message.chat.id;
  const text   = (update.message.text || "").trim();

  let reply;
  if (text.startsWith("/start")) {
    reply = "Halo! Ketik /menu untuk daftar perintah.";
  } else if (text.startsWith("/menu")) {
    reply = "/menu — daftar perintah\n/info — info tim\n/cuaca <kota> — cek cuaca";
  } else if (text.startsWith("/info")) {
    reply = "Tim Otomasi Workspace v1.0";
  } else if (text.startsWith("/cuaca ")) {
    const kota = text.replace("/cuaca ", "").trim();
    const c = ambilCuaca(kota);
    reply = c
      ? `${kota}: ${c.temp_C}°C, ${c.weatherDesc[0].value}`
      : `Maaf, tidak bisa ambil cuaca ${kota}`;
  } else {
    reply = `Pesan diterima: "${text}"`;
  }

  kirimPesanTelegram(chatId, reply);
}


/* =========================================================================
 * UTILITY — Set semua Script Properties sekaligus (sekali pakai)
 *
 * Edit nilai di bawah, run sekali, lalu HAPUS isinya supaya rahasia
 * tidak ada di kode.
 * ========================================================================= */

function setSemuaProperties() {
  PropertiesService.getScriptProperties().setProperties({
    "WEB_APP_URL":        "https://script.google.com/macros/s/.../exec",
    "WEBHOOK_SHEET_ID":   "GANTI_SHEET_ID",
    "PENDAFTAR_SHEET_ID": "GANTI_SHEET_ID",
    "SLACK_WEBHOOK_URL":  "GANTI_URL_SLACK",
    "TELEGRAM_BOT_TOKEN": "GANTI_TOKEN"
  });
  console.log("Properties tersimpan. Sekarang hapus isinya dari kode!");
}
