/**
 * Modul 7 — Solusi Latihan
 *
 * Setup Script Properties dulu via menu:
 *   Project Settings → Script Properties → Add property
 *
 * Required keys:
 *   PENDAFTAR_SHEET_ID, WEBHOOK_SHEET_ID
 * Optional:
 *   SLACK_WEBHOOK_URL, TELEGRAM_BOT_TOKEN, WEB_APP_URL
 */

function _props() { return PropertiesService.getScriptProperties(); }
function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/* ----- Soal 1 + 2 + 3: doGet routing ----- */
function doGet(e) {
  const page = (e && e.parameter && e.parameter.page) || "home";
  const nama = (e && e.parameter && e.parameter.nama) || "Tamu";

  if (page === "stats") {
    return _statsJson();
  }

  if (page === "daftar") {
    const tmpl = HtmlService.createTemplateFromFile("form-daftar");
    tmpl.user = Session.getActiveUser().getEmail() || "anonymous";
    return tmpl.evaluate().setTitle("Pendaftaran")
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }

  // Home
  const userEmail = Session.getActiveUser().getEmail() || "anonymous";
  return HtmlService.createHtmlOutput(`
    <html><head><base target="_top"></head>
    <body style="font-family: Arial; max-width: 600px; margin: 30px auto; padding: 0 20px;">
      <h1>Halo, ${nama}!</h1>
      <p>User aktif: <b>${userEmail}</b></p>
      <ul>
        <li><a href="?nama=${encodeURIComponent(nama)}&page=daftar">Form pendaftaran</a></li>
        <li><a href="?page=stats">Stats JSON</a></li>
      </ul>
    </body></html>
  `);
}

function _statsJson() {
  const SHEET_ID = _props().getProperty("PENDAFTAR_SHEET_ID");
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Pendaftar");
  const data = sheet.getDataRange().getValues();
  const h = data[0];
  const cKategori = h.indexOf("Kategori");

  const perKategori = {};
  for (let i = 1; i < data.length; i++) {
    const k = data[i][cKategori];
    perKategori[k] = (perKategori[k] || 0) + 1;
  }

  return _json({
    totalPendaftar: data.length - 1,
    perKategori:    perKategori,
    lastUpdate:     new Date().toISOString()
  });
}


/* ----- Soal 2: daftarEvent server function ----- */
function daftarEvent(formData) {
  if (!formData.nama || formData.nama.trim().length < 2) {
    throw new Error("Nama minimal 2 karakter.");
  }
  if (!formData.email || !formData.email.includes("@")) {
    throw new Error("Email tidak valid.");
  }

  const SHEET_ID = _props().getProperty("PENDAFTAR_SHEET_ID");
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Pendaftar");

  // Cek duplikat email
  const data = sheet.getDataRange().getValues();
  const cEmail = data[0].indexOf("Email");
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][cEmail]).toLowerCase() === formData.email.toLowerCase()) {
      throw new Error("Email sudah terdaftar.");
    }
  }

  sheet.appendRow([new Date(), formData.nama, formData.email, formData.kategori || ""]);

  // Kirim konfirmasi
  MailApp.sendEmail({
    to: formData.email,
    subject: `Pendaftaran ${formData.nama} diterima`,
    htmlBody: `
      <p>Halo <b>${formData.nama}</b>,</p>
      <p>Pendaftaran Anda untuk kategori <b>${formData.kategori}</b> sudah kami terima.</p>
    `
  });

  // Slack (Soal 7)
  kirimKeSlack(`📥 Pendaftar baru\nNama: ${formData.nama}\nEmail: ${formData.email}\nKategori: ${formData.kategori}`);

  return { ok: true, message: `Tersimpan: ${formData.nama}` };
}


/* ----- Soal 4: Webhook Receiver ----- */
function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return _json({ ok: false, error: "Invalid JSON" });
  }

  if (!payload.event || !payload.data) {
    return _json({ ok: false, error: "Field 'event' dan 'data' wajib." });
  }

  const SHEET_ID = _props().getProperty("WEBHOOK_SHEET_ID");
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Webhook-Log");
  sheet.appendRow([new Date(), payload.event, JSON.stringify(payload.data)]);

  if (payload.event === "alert") {
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: `[ALERT] ${payload.data.message || "(no message)"}`,
      body: JSON.stringify(payload, null, 2)
    });
  }

  return _json({ ok: true, eventId: sheet.getLastRow() });
}


/* ----- Soal 5: Cuaca ----- */
function updateCuacaSheet() {
  const SHEET_ID = _props().getProperty("PENDAFTAR_SHEET_ID");   // pakai sheet sama
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("Cuaca");
  if (!sheet) {
    sheet = ss.insertSheet("Cuaca");
    sheet.appendRow(["Tanggal", "Kota", "Temp (°C)", "Kondisi", "Kelembaban"]);
  }

  const kota = ["Jakarta", "Surabaya", "Bandung", "Medan", "Makassar"];
  const rows = [];

  kota.forEach((k) => {
    try {
      const r = UrlFetchApp.fetch(`https://wttr.in/${encodeURIComponent(k)}?format=j1`, {
        muteHttpExceptions: true,
        headers: { "User-Agent": "GAS" }
      });
      if (r.getResponseCode() === 200) {
        const data = JSON.parse(r.getContentText());
        const c = data.current_condition[0];
        rows.push([new Date(), k, parseFloat(c.temp_C), c.weatherDesc[0].value, c.humidity + "%"]);
      }
    } catch (err) {
      Logger.log(`Gagal ${k}: ${err.message}`);
    }
  });

  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 5).setValues(rows);
  }
  Logger.log(`${rows.length} kota di-update.`);
}

function pasangCuacaTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "updateCuacaSheet")
    .forEach((t) => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger("updateCuacaSheet")
    .timeBased().everyHours(6).create();
}


/* ----- Soal 6: Kurs IDR ----- */
function updateKursIDR() {
  const SHEET_ID = _props().getProperty("PENDAFTAR_SHEET_ID");
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Kurs");

  const today = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"
  );

  // Cek duplikat hari ini
  const data = sheet.getDataRange().getValues();
  const cTanggal = 0;
  const todayExists = data.slice(1).some((row) => {
    const t = row[cTanggal];
    const tStr = t instanceof Date
      ? Utilities.formatDate(t, Session.getScriptTimeZone(), "yyyy-MM-dd")
      : String(t);
    return tStr === today;
  });
  if (todayExists) {
    Logger.log("Sudah update hari ini. Skip.");
    return;
  }

  // Pakai exchangerate-api free tier
  const r = UrlFetchApp.fetch("https://api.exchangerate-api.com/v4/latest/USD", {
    muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) {
    Logger.log("API fail.");
    return;
  }

  const data2 = JSON.parse(r.getContentText());
  const idrPerUsd = data2.rates.IDR;

  // Hitung rate ke IDR untuk currency lain
  const currencies = ["USD", "EUR", "SGD", "JPY"];
  const rows = currencies.map((cur) => {
    const rateToUsd = data2.rates[cur] || 1;
    const rateToIdr = cur === "USD" ? idrPerUsd : idrPerUsd / rateToUsd;
    return [new Date(), cur, Math.round(rateToIdr * 100) / 100];
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 3).setValues(rows);
  Logger.log(`${rows.length} kurs di-update.`);
}


/* ----- Soal 7: Slack helper ----- */
function kirimKeSlack(text) {
  const URL = _props().getProperty("SLACK_WEBHOOK_URL");
  if (!URL) {
    Logger.log("SLACK_WEBHOOK_URL belum di-set, skip notif.");
    return;
  }

  UrlFetchApp.fetch(URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ text }),
    muteHttpExceptions: true
  });
}


/* ----- Soal 8: Dashboard Status ----- */
function dashboardStatus() {
  const targets = [
    "https://www.google.com",
    "https://api.github.com",
    "https://wttr.in/Jakarta?format=3"
  ];

  const props = _props();
  const cacheKey = "STATUS_CACHE";
  const cached = props.getProperty(cacheKey);
  const now = Date.now();

  let results;
  if (cached) {
    const c = JSON.parse(cached);
    if (now - c.ts < 5 * 60 * 1000) {
      results = c.results;
    }
  }

  if (!results) {
    results = targets.map((url) => {
      const start = Date.now();
      try {
        const r = UrlFetchApp.fetch(url, {
          muteHttpExceptions: true,
          followRedirects: true
        });
        return {
          url,
          status: r.getResponseCode(),
          ms:     Date.now() - start
        };
      } catch (err) {
        return { url, status: 0, ms: Date.now() - start, error: err.message };
      }
    });
    props.setProperty(cacheKey, JSON.stringify({ ts: now, results }));
  }

  const rows = results.map((r) => {
    const ok = r.status >= 200 && r.status < 400;
    const bg = ok ? "" : "background: #fee2e2;";
    return `
      <tr style="${bg}">
        <td style="padding: 6px 12px; border: 1px solid #d1d5db;">${r.url}</td>
        <td style="padding: 6px 12px; border: 1px solid #d1d5db;">${r.status || "ERR"}</td>
        <td style="padding: 6px 12px; border: 1px solid #d1d5db;">${r.ms}</td>
        <td style="padding: 6px 12px; border: 1px solid #d1d5db;">${new Date().toLocaleTimeString("id-ID")}</td>
      </tr>
    `;
  }).join("");

  return HtmlService.createHtmlOutput(`
    <html><head><base target="_top"></head>
    <body style="font-family: Arial; max-width: 800px; margin: 30px auto; padding: 0 20px;">
      <h2>Dashboard Status Layanan</h2>
      <p><a href="?page=dashboard"><button>🔄 Refresh</button></a></p>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 6px 12px; border: 1px solid #d1d5db; text-align: left;">Endpoint</th>
            <th style="padding: 6px 12px; border: 1px solid #d1d5db;">Status</th>
            <th style="padding: 6px 12px; border: 1px solid #d1d5db;">Time (ms)</th>
            <th style="padding: 6px 12px; border: 1px solid #d1d5db;">Last Check</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>
  `);
}
