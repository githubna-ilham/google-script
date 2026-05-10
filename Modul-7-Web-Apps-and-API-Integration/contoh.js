/**
 * Modul 7 — Web Apps & API Integration
 *
 * Cara deploy Web App:
 *   1. Save semua file.
 *   2. Deploy → New deployment → Type: Web app
 *   3. Execute as: Me, Who has access: Anyone (untuk eksperimen)
 *   4. Copy URL deployment, test di browser/curl.
 */


/* =========================================================================
 * BAGIAN 1 — Web App halaman sederhana
 * ========================================================================= */

function doGet(e) {
  // Routing sederhana via query param ?page=
  const page = (e && e.parameter && e.parameter.page) || "home";

  if (page === "json") {
    return _json({
      timestamp: new Date().toISOString(),
      user:      Session.getActiveUser().getEmail() || "anonymous",
      page:      "json"
    });
  }

  if (page === "form") {
    const tmpl = HtmlService.createTemplateFromFile("page-form");
    tmpl.user = Session.getActiveUser().getEmail() || "Tamu";
    return tmpl.evaluate()
      .setTitle("Form Pendaftaran")
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }

  // Default: home
  const nama = (e && e.parameter && e.parameter.nama) || "Tamu";
  return HtmlService.createHtmlOutput(`
    <html>
      <head><base target="_top"><title>Demo Web App</title></head>
      <body style="font-family: Arial; padding: 20px; max-width: 600px;">
        <h1>Halo, ${nama}!</h1>
        <p>Web App Apps Script sederhana.</p>
        <ul>
          <li><a href="?nama=${encodeURIComponent(nama)}&page=form">Form Pendaftaran</a></li>
          <li><a href="?page=json">JSON Endpoint</a></li>
        </ul>
        <p><small>Server: ${new Date().toString()}</small></p>
      </body>
    </html>
  `);
}


/* =========================================================================
 * BAGIAN 2 — doPost: terima JSON
 * ========================================================================= */

function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return _json({ ok: false, error: "Invalid JSON" });
  }

  // Log ke Sheet (set SHEET_ID dulu)
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
 * BAGIAN 3 — Function dipanggil dari client (page-form.html)
 * ========================================================================= */

function daftarEvent(formData) {
  if (!formData.nama || !formData.email) {
    throw new Error("Nama dan email wajib.");
  }

  const SHEET_ID = PropertiesService.getScriptProperties().getProperty("PENDAFTAR_SHEET_ID");
  if (!SHEET_ID) {
    throw new Error("Set PENDAFTAR_SHEET_ID di Script Properties.");
  }

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Pendaftar");
  sheet.appendRow([new Date(), formData.nama, formData.email, formData.kategori || ""]);

  return { ok: true, message: `Terdaftar: ${formData.nama}` };
}


/* =========================================================================
 * BAGIAN 4 — UrlFetchApp: panggil API eksternal
 * ========================================================================= */

function ambilCuaca(kota) {
  // Service publik, no auth (bisa fail kalau provider down)
  const url = `https://wttr.in/${encodeURIComponent(kota)}?format=j1`;

  const r = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { "User-Agent": "GAS-WebApp" }
  });

  if (r.getResponseCode() !== 200) {
    console.log(`Failed: ${r.getResponseCode()}`);
    return null;
  }

  const data = JSON.parse(r.getContentText());
  const cuaca = data.current_condition[0];
  console.log(`${kota}: ${cuaca.temp_C}°C, ${cuaca.weatherDesc[0].value}`);
  return cuaca;
}

function ujiCuaca() {
  ambilCuaca("Jakarta");
  ambilCuaca("Surabaya");
}


/* =========================================================================
 * BAGIAN 5 — Webhook ke Slack
 * ========================================================================= */

function kirimKeSlack(text) {
  const URL = PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL");
  if (!URL) {
    console.log("Set SLACK_WEBHOOK_URL di Script Properties dulu.");
    return;
  }

  const r = UrlFetchApp.fetch(URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ text }),
    muteHttpExceptions: true
  });

  console.log(`Slack response: ${r.getResponseCode()}`);
}


/* =========================================================================
 * BAGIAN 6 — Bot Telegram
 *
 * Setup:
 *   1. Bikin bot via @BotFather, dapat BOT_TOKEN.
 *   2. Set di Script Properties: TELEGRAM_BOT_TOKEN = <token>
 *   3. Deploy Web App, copy URL.
 *   4. Run setTelegramWebhook() sekali untuk daftarkan ke Telegram.
 *   5. Kirim /start ke bot — bot harus balas.
 * ========================================================================= */

function _telegramToken() {
  return PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
}

function setTelegramWebhook() {
  const TOKEN = _telegramToken();
  if (!TOKEN) {
    console.log("Set TELEGRAM_BOT_TOKEN dulu.");
    return;
  }
  const WEB_APP_URL = PropertiesService.getScriptProperties().getProperty("WEB_APP_URL");
  if (!WEB_APP_URL) {
    console.log("Set WEB_APP_URL dulu (URL deployment Web App).");
    return;
  }

  const r = UrlFetchApp.fetch(
    `https://api.telegram.org/bot${TOKEN}/setWebhook?url=${encodeURIComponent(WEB_APP_URL)}`
  );
  console.log(r.getContentText());
}

function kirimPesanTelegram(chatId, text) {
  const TOKEN = _telegramToken();
  UrlFetchApp.fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ chat_id: chatId, text: text })
  });
}

// Letakkan logika bot di doPost. Untuk demo ini, doPost umum di Bagian 2 sudah
// cocok untuk webhook generic. Untuk Telegram, implementasi handler khusus:

function handleTelegramUpdate(update) {
  if (!update.message) return;
  const chatId = update.message.chat.id;
  const text   = (update.message.text || "").trim();

  let reply;
  if (text.startsWith("/start")) {
    reply = "Halo! Ketik /menu untuk daftar perintah.";
  } else if (text.startsWith("/menu")) {
    reply = "/menu - daftar perintah\n/info - info tim\n/cuaca <kota> - cek cuaca";
  } else if (text.startsWith("/info")) {
    reply = "Tim Otomasi Workspace v1.0";
  } else if (text.startsWith("/cuaca ")) {
    const kota = text.replace("/cuaca ", "").trim();
    const c = ambilCuaca(kota);
    reply = c ? `${kota}: ${c.temp_C}°C, ${c.weatherDesc[0].value}` : `Tidak bisa ambil cuaca ${kota}`;
  } else {
    reply = `Pesan diterima: "${text}"`;
  }

  kirimPesanTelegram(chatId, reply);
}


/* =========================================================================
 * Helper
 * ========================================================================= */

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function setSemuaProperties() {
  // Helper sekali pakai untuk setup awal.
  // Edit nilai sebelum jalankan.
  PropertiesService.getScriptProperties().setProperties({
    "WEB_APP_URL":         "https://script.google.com/macros/s/.../exec",
    "WEBHOOK_SHEET_ID":    "GANTI_SHEET_ID",
    "PENDAFTAR_SHEET_ID":  "GANTI_SHEET_ID",
    "TELEGRAM_BOT_TOKEN":  "GANTI_TOKEN",
    "SLACK_WEBHOOK_URL":   "GANTI_URL"
  });
  console.log("Properties tersimpan.");
}
