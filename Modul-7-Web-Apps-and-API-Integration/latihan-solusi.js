/**
 * Modul 7 — Solusi Latihan
 *
 * File ini berisi jawaban referensi untuk semua soal di latihan.md.
 * Baca solusinya sebagai contoh, JANGAN copy-paste sebelum mencoba sendiri.
 *
 * Setup yang diperlukan (Project Settings → Script Properties):
 *   - PENDAFTAR_SHEET_ID    (wajib, untuk Soal 2, 3, 5, 6)
 *   - WEBHOOK_SHEET_ID      (wajib, untuk Soal 4)
 *   - SLACK_WEBHOOK_URL     (opsional, untuk Soal 7)
 *
 * Struktur Sheet (lihat latihan.md → Persiapan):
 *   Tab "Pendaftar"  : Timestamp | Nama | Email | Kategori
 *   Tab "Webhook-Log": Timestamp | Event | Data
 *   Tab "Kurs"       : Tanggal | Currency | Rate ke IDR
 *   Tab "Cuaca"      : (dibuat otomatis di Soal 5)
 */


/* =========================================================================
 * Helper (dipakai di banyak soal)
 * ========================================================================= */

function _props() {
  return PropertiesService.getScriptProperties();
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/* =========================================================================
 * SOAL 1, 2, 3 — doGet dengan routing
 *
 * Satu doGet melayani 3 halaman lewat ?page=...
 *   .../exec               → home (Soal 1)
 *   .../exec?page=daftar   → form (Soal 2)
 *   .../exec?page=stats    → JSON statistik (Soal 3)
 * ========================================================================= */

function doGet(e) {
  const page = (e && e.parameter && e.parameter.page) || "home";
  const nama = (e && e.parameter && e.parameter.nama) || "Tamu";

  // ----- Soal 3: balas JSON statistik -----
  if (page === "stats") {
    return _statsJson();
  }

  // ----- Soal 2: form pendaftaran -----
  if (page === "daftar") {
    const tmpl = HtmlService.createTemplateFromFile("form-daftar");
    tmpl.user = Session.getActiveUser().getEmail() || "anonymous";
    return tmpl.evaluate()
      .setTitle("Pendaftaran")
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }

  // ----- Soal 1: halaman home -----
  const userEmail = Session.getActiveUser().getEmail() || "anonymous";
  return HtmlService.createHtmlOutput(`
    <html><head><base target="_top"></head>
    <body style="font-family: Arial; max-width: 600px; margin: 30px auto; padding: 0 20px;">
      <h1>Halo, ${nama}!</h1>
      <p>User aktif: <b>${userEmail}</b></p>
      <ul>
        <li><a href="?nama=${encodeURIComponent(nama)}&page=daftar">📝 Form pendaftaran</a></li>
        <li><a href="?page=stats">📊 Stats JSON</a></li>
      </ul>
    </body></html>
  `);
}


/* =========================================================================
 * SOAL 3 — Hitung statistik pendaftar
 *
 * Strategi: baca semua data Sheet → loop, hitung per kategori → balas JSON.
 * ========================================================================= */

function _statsJson() {
  const SHEET_ID = _props().getProperty("PENDAFTAR_SHEET_ID");
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Pendaftar");
  const data = sheet.getDataRange().getValues();   // termasuk header

  // Cari index kolom "Kategori" dari header (lebih robust dari hardcode).
  const header = data[0];
  const idxKategori = header.indexOf("Kategori");

  // Hitung jumlah per kategori.
  const perKategori = {};
  for (let i = 1; i < data.length; i++) {
    const k = data[i][idxKategori];
    perKategori[k] = (perKategori[k] || 0) + 1;
  }

  return _json({
    totalPendaftar: data.length - 1,    // -1 karena baris header tidak dihitung
    perKategori:    perKategori,
    lastUpdate:     new Date().toISOString()
  });
}


/* =========================================================================
 * SOAL 2 — daftarEvent (dipanggil dari form-daftar.html via google.script.run)
 *
 * Tugas:
 *   1. Validasi input.
 *   2. Cek email duplikat.
 *   3. Append ke Sheet.
 *   4. Kirim email konfirmasi.
 *   5. (Soal 7) Notif ke Slack.
 * ========================================================================= */

function daftarEvent(formData) {
  // 1. Validasi
  if (!formData.nama || formData.nama.trim().length < 2) {
    throw new Error("Nama minimal 2 karakter.");
  }
  if (!formData.email || !formData.email.includes("@")) {
    throw new Error("Email tidak valid.");
  }

  const SHEET_ID = _props().getProperty("PENDAFTAR_SHEET_ID");
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Pendaftar");

  // 2. Cek duplikat email (case-insensitive)
  const data = sheet.getDataRange().getValues();
  const idxEmail = data[0].indexOf("Email");
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxEmail]).toLowerCase() === formData.email.toLowerCase()) {
      throw new Error("Email sudah terdaftar.");
    }
  }

  // 3. Simpan ke Sheet
  sheet.appendRow([new Date(), formData.nama, formData.email, formData.kategori || ""]);

  // 4. Kirim konfirmasi
  MailApp.sendEmail({
    to: formData.email,
    subject: `Pendaftaran ${formData.nama} diterima`,
    htmlBody: `
      <p>Halo <b>${formData.nama}</b>,</p>
      <p>Pendaftaran Anda untuk kategori <b>${formData.kategori}</b> sudah kami terima. 🎉</p>
    `
  });

  // 5. Soal 7 — notif Slack (function di bawah; skip kalau URL belum di-set)
  kirimKeSlack(
    `📥 Pendaftar baru\n` +
    `Nama: ${formData.nama}\n` +
    `Email: ${formData.email}\n` +
    `Kategori: ${formData.kategori}`
  );

  return { ok: true, message: `Tersimpan: ${formData.nama}` };
}


/* =========================================================================
 * SOAL 4 — Webhook Receiver (doPost)
 *
 * Test:
 *   curl -X POST <URL> -H "Content-Type: application/json" \
 *     -d '{"event":"alert","data":{"message":"Server down"}}'
 * ========================================================================= */

function doPost(e) {
  // 1. Parse JSON (handle error supaya tidak crash)
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return _json({ ok: false, error: "Invalid JSON" });
  }

  // 2. Validasi field wajib
  if (!payload.event || !payload.data) {
    return _json({ ok: false, error: "Field 'event' dan 'data' wajib ada." });
  }

  // 3. Append ke Sheet
  const SHEET_ID = _props().getProperty("WEBHOOK_SHEET_ID");
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Webhook-Log");
  sheet.appendRow([new Date(), payload.event, JSON.stringify(payload.data)]);

  // 4. Kalau event = "alert", kirim email ke admin
  if (payload.event === "alert") {
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: `[ALERT] ${payload.data.message || "(tanpa pesan)"}`,
      body: JSON.stringify(payload, null, 2)
    });
  }

  // 5. Balas JSON dengan nomor row sebagai "ID"
  return _json({ ok: true, eventId: sheet.getLastRow() });
}


/* =========================================================================
 * SOAL 5 — Update Cuaca dari wttr.in
 *
 * Strategi:
 *   - Loop 5 kota.
 *   - Untuk setiap kota: fetch → parse → append baris.
 *   - Tab "Cuaca" dibuat otomatis kalau belum ada.
 * ========================================================================= */

function updateCuacaSheet() {
  const SHEET_ID = _props().getProperty("PENDAFTAR_SHEET_ID");
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // Buat tab "Cuaca" kalau belum ada
  let sheet = ss.getSheetByName("Cuaca");
  if (!sheet) {
    sheet = ss.insertSheet("Cuaca");
    sheet.appendRow(["Tanggal", "Kota", "Temp (°C)", "Kondisi", "Kelembaban"]);
  }

  const daftarKota = ["Jakarta", "Surabaya", "Bandung", "Medan", "Makassar"];
  const rows = [];

  daftarKota.forEach((kota) => {
    try {
      const r = UrlFetchApp.fetch(
        `https://wttr.in/${encodeURIComponent(kota)}?format=j1`,
        { muteHttpExceptions: true, headers: { "User-Agent": "GAS" } }
      );

      if (r.getResponseCode() === 200) {
        const data = JSON.parse(r.getContentText());
        const c = data.current_condition[0];
        rows.push([
          new Date(),
          kota,
          parseFloat(c.temp_C),
          c.weatherDesc[0].value,
          c.humidity + "%"
        ]);
      } else {
        console.log(`${kota} → status ${r.getResponseCode()}, skip`);
      }
    } catch (err) {
      console.log(`Gagal ${kota}: ${err.message}`);
    }
  });

  // Tulis sekaligus (lebih cepat dari banyak appendRow)
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 5).setValues(rows);
  }
  console.log(`${rows.length} kota di-update.`);
}

// Trigger 6-jam-an. Jalankan SEKALI untuk pasang.
function pasangCuacaTrigger() {
  // Hapus trigger lama dengan handler sama (anti duplikat)
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "updateCuacaSheet")
    .forEach((t) => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger("updateCuacaSheet")
    .timeBased()
    .everyHours(6)
    .create();

  console.log("Trigger 6-jam terpasang.");
}


/* =========================================================================
 * SOAL 6 — Kurs IDR (idempotent)
 *
 * Idempotent = aman dijalankan berkali-kali tanpa bikin duplikat.
 * Strategi: sebelum append, cek apakah tanggal hari ini sudah ada.
 * ========================================================================= */

function updateKursIDR() {
  const SHEET_ID = _props().getProperty("PENDAFTAR_SHEET_ID");
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Kurs");

  const tz = Session.getScriptTimeZone();
  const hariIni = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");

  // Cek apakah hari ini sudah ada
  const data = sheet.getDataRange().getValues();
  const sudahAda = data.slice(1).some((row) => {
    const t = row[0];
    const tStr = t instanceof Date
      ? Utilities.formatDate(t, tz, "yyyy-MM-dd")
      : String(t);
    return tStr === hariIni;
  });

  if (sudahAda) {
    console.log("Kurs hari ini sudah ada. Skip.");
    return;
  }

  // Panggil API
  const r = UrlFetchApp.fetch(
    "https://api.exchangerate-api.com/v4/latest/USD",
    { muteHttpExceptions: true }
  );
  if (r.getResponseCode() !== 200) {
    console.log("API gagal:", r.getResponseCode());
    return;
  }

  const apiData = JSON.parse(r.getContentText());
  const idrPerUsd = apiData.rates.IDR;

  // Hitung nilai 1 unit currency dalam IDR.
  // - Untuk USD: langsung apiData.rates.IDR.
  // - Untuk currency lain X: 1 X = (1 / apiData.rates.X) USD = (1 / rates.X) * idrPerUsd IDR.
  const currencies = ["USD", "EUR", "SGD", "JPY"];
  const rows = currencies.map((cur) => {
    const rateToUsd = apiData.rates[cur] || 1;
    const rateToIdr = cur === "USD" ? idrPerUsd : idrPerUsd / rateToUsd;
    return [new Date(), cur, Math.round(rateToIdr * 100) / 100];   // bulatkan 2 desimal
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 3).setValues(rows);
  console.log(`${rows.length} kurs ditulis.`);
}


/* =========================================================================
 * SOAL 7 — Helper Slack
 *
 * Function ini sudah dipanggil dari daftarEvent (Soal 2).
 * Aman dipanggil meskipun SLACK_WEBHOOK_URL belum di-set (akan diam-diam skip).
 * ========================================================================= */

function kirimKeSlack(text) {
  const URL = _props().getProperty("SLACK_WEBHOOK_URL");
  if (!URL) {
    console.log("SLACK_WEBHOOK_URL belum di-set, skip notif.");
    return;
  }

  UrlFetchApp.fetch(URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ text: text }),
    muteHttpExceptions: true
  });
}


/* =========================================================================
 * SOAL 8 — Dashboard Status Layanan (dengan cache 5 menit)
 *
 * Cara akses: tambahkan rute baru di doGet:
 *
 *     if (page === "dashboard") return dashboardStatus();
 *
 * lalu buka .../exec?page=dashboard
 * ========================================================================= */

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

  // Coba pakai cache kalau masih segar (<5 menit)
  let results;
  if (cached) {
    const c = JSON.parse(cached);
    if (now - c.ts < 5 * 60 * 1000) {
      results = c.results;
      console.log("Pakai cache.");
    }
  }

  // Tidak ada cache → fetch ulang
  if (!results) {
    results = targets.map((url) => {
      const start = Date.now();
      try {
        const r = UrlFetchApp.fetch(url, {
          muteHttpExceptions: true,
          followRedirects: true
        });
        return { url, status: r.getResponseCode(), ms: Date.now() - start };
      } catch (err) {
        return { url, status: 0, ms: Date.now() - start, error: err.message };
      }
    });
    props.setProperty(cacheKey, JSON.stringify({ ts: now, results }));
  }

  // Render baris tabel HTML
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
      <h2>📡 Dashboard Status Layanan</h2>
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
