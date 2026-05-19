/**
 * Modul 7 — Solusi Latihan (Konteks Pelatihan)
 *
 * File ini berisi jawaban referensi untuk semua soal di latihan.md.
 * Baca solusinya sebagai contoh, JANGAN copy-paste sebelum mencoba sendiri.
 *
 * Setup yang diperlukan (Project Settings → Script Properties):
 *   - DASHBOARD_SHEET_ID    (wajib, untuk Soal 2, 3, 4, 5, 7, 8)
 *   - WEBHOOK_SHEET_ID      (wajib, untuk Soal 5)
 *   - SLACK_WEBHOOK_URL     (opsional, untuk Soal 7)
 *
 * Struktur Sheet (lihat template-spreadsheet.md):
 *   Tab "Peserta"     : ID Peserta | Tanggal Daftar | Nama | Email | Instansi | Program | Nilai | Status | Notif Email | Link Sertifikat
 *   Tab "Program"     : Kode | Nama Program | Kapasitas | Biaya | Tanggal Mulai | Tanggal Selesai | Lokasi
 *   Tab "Webhook-Log" : Timestamp | Event | Data
 *
 * Deploy:
 *   1. Klik Deploy → New deployment
 *   2. Type: Web app
 *   3. Execute as: Me
 *   4. Who has access: Anyone
 *   5. Deploy → Authorize → copy URL
 */


/* =========================================================================
 * Helper umum
 * ========================================================================= */

function _props() {
  return PropertiesService.getScriptProperties();
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function _ss() {
  const id = _props().getProperty("DASHBOARD_SHEET_ID");
  if (!id) throw new Error("Set DASHBOARD_SHEET_ID di Script Properties.");
  return SpreadsheetApp.openById(id);
}


/* =========================================================================
 * doGet — routing untuk semua page (Soal 1, 2, 3, 4, 8)
 * ========================================================================= */

function doGet(e) {
  const page = (e && e.parameter && e.parameter.page) || "home";
  const nama = (e && e.parameter && e.parameter.nama) || "Tamu";

  // ===== Soal 3: JSON stats =====
  if (page === "stats") {
    return _json(_buildStats());
  }

  // ===== Soal 8: API endpoints =====
  if (page === "api/programs") {
    return _json(_cachedApi("cache_programs", _apiPrograms));
  }
  if (page === "api/program") {
    const kode = e.parameter.kode;
    if (!kode) return _json({ error: "Param 'kode' wajib" });
    return _json(_cachedApi(`cache_program_${kode}`, () => _apiProgram(kode)));
  }
  if (page === "api/stats") {
    return _json(_cachedApi("cache_stats", _buildStats));
  }
  if (page === "api/docs") {
    return HtmlService.createHtmlOutput(_apiDocsHtml());
  }

  // ===== Soal 2: form pendaftaran =====
  if (page === "daftar") {
    const tmpl = HtmlService.createTemplateFromFile("form-daftar");
    tmpl.user = Session.getActiveUser().getEmail() || "Tamu";
    return tmpl.evaluate()
      .setTitle("Pendaftaran Pelatihan")
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }

  // ===== Soal 4: dashboard =====
  if (page === "dashboard") {
    return HtmlService.createHtmlOutputFromFile("dashboard")
      .setTitle("Dashboard Pelatihan")
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }

  // ===== Soal 1: halaman home (default) =====
  const email = Session.getActiveUser().getEmail() || "anonymous";
  return HtmlService.createHtmlOutput(`
    <html>
      <head><base target="_top"><title>Web App Pelatihan</title></head>
      <body style="font-family: Arial; padding: 24px; max-width: 600px; color: #1f2937;">
        <h1>Halo, ${nama}!</h1>
        <p style="color: #6b7280;">Login sebagai: ${email}</p>
        <ul style="line-height: 2;">
          <li><a href="?page=daftar">Form Pendaftaran Peserta</a></li>
          <li><a href="?page=stats">JSON Statistik</a></li>
          <li><a href="?page=dashboard">Dashboard Pelatihan</a></li>
          <li><a href="?page=api/docs">API Documentation</a></li>
        </ul>
      </body>
    </html>
  `);
}


/* =========================================================================
 * Soal 2 — daftarPeserta (dipanggil dari form-daftar.html)
 * ========================================================================= */

function daftarPeserta(formData) {
  if (!formData.nama || !formData.email || !formData.instansi || !formData.program) {
    throw new Error("Semua field wajib diisi.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    throw new Error("Format email tidak valid.");
  }

  const sheet = _ss().getSheetByName("Peserta");

  const data = sheet.getDataRange().getValues();
  const cEmail = data[0].indexOf("Email");
  const sudahAda = data.slice(1).some((r) => r[cEmail] === formData.email);
  if (sudahAda) {
    throw new Error(`Email ${formData.email} sudah terdaftar.`);
  }

  const idBaru = `PST-${String(sheet.getLastRow()).padStart(3, "0")}`;
  sheet.appendRow([
    idBaru,
    new Date(),
    formData.nama,
    formData.email,
    formData.instansi,
    formData.program
  ]);

  // Soal 7: kirim notif Slack (kalau URL tersedia) — fail silent
  try {
    _notifSlackPendaftarBaru({ idBaru, ...formData });
  } catch (err) {
    console.log("Slack notif gagal: " + err.message);
  }

  return { ok: true, message: `Terdaftar: ${idBaru} — ${formData.nama}`, idBaru };
}


/* =========================================================================
 * Soal 3 — Build stats
 * ========================================================================= */

function _buildStats() {
  const ss = _ss();
  const peserta = _bacaPeserta(ss);
  const program = _bacaProgram(ss);

  const perStatus = {};
  const perProgram = {};
  const nilaiList = [];

  peserta.forEach((p) => {
    if (p.status) perStatus[p.status] = (perStatus[p.status] || 0) + 1;
    if (p.program) perProgram[p.program] = (perProgram[p.program] || 0) + 1;
    if (typeof p.nilai === "number") nilaiList.push(p.nilai);
  });

  const rataNilai = nilaiList.length > 0
    ? nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length
    : null;

  return {
    totalPeserta: peserta.length,
    totalProgram: program.length,
    perStatus,
    perProgram,
    rataNilai: rataNilai != null ? +rataNilai.toFixed(2) : null,
    lastUpdate: new Date().toISOString()
  };
}


/* =========================================================================
 * Soal 4 — Dashboard: bacaDataDashboard (dipanggil dari dashboard.html)
 * ========================================================================= */

function bacaDataDashboard() {
  const ss = _ss();
  const peserta = _bacaPeserta(ss);
  const program = _bacaProgramWithCuaca(ss);   // Soal 6: include cuaca

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

function _bacaPeserta(ss) {
  const sheet = ss.getSheetByName("Peserta");
  const data = sheet.getDataRange().getValues();
  const h = data[0];
  return data.slice(1).map((r) => ({
    id:       r[h.indexOf("ID Peserta")],
    nama:     r[h.indexOf("Nama")],
    instansi: r[h.indexOf("Instansi")],
    program:  r[h.indexOf("Program")],
    nilai:    r[h.indexOf("Nilai")],
    status:   r[h.indexOf("Status")]
  })).filter((p) => p.id);
}

function _bacaProgram(ss) {
  const sheet = ss.getSheetByName("Program");
  const data = sheet.getDataRange().getValues();
  const h = data[0];
  const tz = Session.getScriptTimeZone();

  return data.slice(1).map((r) => {
    const tgl = r[h.indexOf("Tanggal Mulai")];
    return {
      kode:         r[h.indexOf("Kode")],
      nama:         r[h.indexOf("Nama Program")],
      kapasitas:    r[h.indexOf("Kapasitas")],
      biaya:        r[h.indexOf("Biaya")],
      tanggalMulai: tgl instanceof Date
                      ? Utilities.formatDate(tgl, tz, "yyyy-MM-dd")
                      : tgl,
      lokasi:       r[h.indexOf("Lokasi")]
    };
  }).filter((p) => p.kode);
}


/* =========================================================================
 * Soal 5 — doPost: webhook receiver
 * ========================================================================= */

function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return _json({ ok: false, error: "Body bukan JSON valid" });
  }

  if (!payload.event || !payload.data) {
    return _json({ ok: false, error: "Field 'event' dan 'data' wajib" });
  }

  // Log ke Webhook-Log
  const webhookSheetId = _props().getProperty("WEBHOOK_SHEET_ID");
  let eventId = null;

  if (webhookSheetId) {
    const shLog = SpreadsheetApp.openById(webhookSheetId).getSheetByName("Webhook-Log");
    if (shLog) {
      shLog.appendRow([new Date(), payload.event, JSON.stringify(payload.data)]);
      eventId = shLog.getLastRow();
    }
  }

  // Handler khusus: payment.success → update Status peserta jadi Sedang Berjalan
  if (payload.event === "payment.success" && payload.data.peserta_id) {
    const updated = _updateStatusPeserta(payload.data.peserta_id, "Sedang Berjalan");
    if (updated) {
      console.log(`Status ${payload.data.peserta_id} updated → Sedang Berjalan`);
    }
  }

  return _json({ ok: true, eventId });
}

function _updateStatusPeserta(idPeserta, statusBaru) {
  const sheet = _ss().getSheetByName("Peserta");
  const data = sheet.getDataRange().getValues();
  const h = data[0];
  const cId     = h.indexOf("ID Peserta");
  const cStatus = h.indexOf("Status");

  for (let i = 1; i < data.length; i++) {
    if (data[i][cId] === idPeserta) {
      sheet.getRange(i + 1, cStatus + 1).setValue(statusBaru);
      return true;
    }
  }
  return false;
}


/* =========================================================================
 * Soal 6 — Cuaca lokasi pelatihan (UrlFetchApp + cache 1 jam)
 * ========================================================================= */

function _bacaProgramWithCuaca(ss) {
  const program = _bacaProgram(ss);

  program.forEach((p) => {
    const match = (p.lokasi || "").match(/(Jakarta|Bandung|Surabaya|Medan|Makassar)/);
    if (match) {
      const cuaca = _ambilCuacaCached(match[1]);
      p.cuaca = cuaca ? `${cuaca.temp}°C, ${cuaca.kondisi}` : "Cuaca tidak tersedia";
    } else {
      p.cuaca = "—";    // online → tidak perlu cuaca
    }
  });

  return program;
}

function _ambilCuacaCached(kota) {
  const key = `cuaca_${kota}`;
  const cached = _props().getProperty(key);

  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.ts < 3600000) {   // 1 jam
      return parsed.data;
    }
  }

  try {
    const respon = UrlFetchApp.fetch(`https://wttr.in/${encodeURIComponent(kota)}?format=j1`, {
      muteHttpExceptions: true,
      headers: { "User-Agent": "GAS-WebApp" }
    });
    if (respon.getResponseCode() !== 200) return null;

    const json = JSON.parse(respon.getContentText());
    const data = {
      temp:    json.current_condition[0].temp_C,
      kondisi: json.current_condition[0].weatherDesc[0].value
    };
    _props().setProperty(key, JSON.stringify({ ts: Date.now(), data }));
    return data;
  } catch (err) {
    console.log(`Gagal ambil cuaca ${kota}: ${err.message}`);
    return null;
  }
}


/* =========================================================================
 * Soal 7 — Slack notif saat ada pendaftar baru
 * ========================================================================= */

function _notifSlackPendaftarBaru(p) {
  const URL = _props().getProperty("SLACK_WEBHOOK_URL");
  if (!URL) return;   // skip kalau belum di-set

  const text = [
    `*Pendaftar baru*`,
    `ID: ${p.idBaru}`,
    `Nama: ${p.nama}`,
    `Email: ${p.email}`,
    `Instansi: ${p.instansi}`,
    `Program: ${p.program}`
  ].join("\n");

  UrlFetchApp.fetch(URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ text }),
    muteHttpExceptions: true
  });
}


/* =========================================================================
 * Soal 8 — Public API endpoints dengan cache (5 menit)
 * ========================================================================= */

function _cachedApi(key, fn) {
  const cached = _props().getProperty(key);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.ts < 5 * 60 * 1000) {
      return { ...parsed.data, cached: true, cachedAt: new Date(parsed.ts).toISOString() };
    }
  }

  const fresh = fn();
  _props().setProperty(key, JSON.stringify({ ts: Date.now(), data: fresh }));
  return { ...fresh, cached: false, cachedAt: new Date().toISOString() };
}

function _apiPrograms() {
  const ss = _ss();
  const peserta = _bacaPeserta(ss);
  const program = _bacaProgram(ss);

  const terisi = {};
  peserta.forEach((p) => { terisi[p.program] = (terisi[p.program] || 0) + 1; });

  return {
    programs: program.map((p) => ({ ...p, terisi: terisi[p.kode] || 0 }))
  };
}

function _apiProgram(kode) {
  const ss = _ss();
  const peserta = _bacaPeserta(ss);
  const program = _bacaProgram(ss).find((p) => p.kode === kode);

  if (!program) return { error: `Program ${kode} tidak ditemukan` };

  const pesertaProgram = peserta.filter((p) => p.program === kode);
  return {
    program,
    terisi: pesertaProgram.length,
    peserta: pesertaProgram
  };
}

function _apiDocsHtml() {
  return `<!DOCTYPE html>
<html>
<head><base target="_top"><title>API Documentation</title>
<style>
  body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1f2937; line-height: 1.6; }
  h1, h2 { color: #1e40af; }
  code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
  pre { background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 6px; overflow-x: auto; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th, td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; }
  th { background: #f9fafb; }
</style>
</head>
<body>
  <h1>API Dokumentasi — Pelatihan</h1>
  <p>Public API untuk akses data peserta &amp; program. Semua endpoint return JSON. Hasil di-cache 5 menit.</p>

  <h2>Endpoints</h2>
  <table>
    <tr><th>Endpoint</th><th>Method</th><th>Deskripsi</th></tr>
    <tr><td><code>?page=api/programs</code></td><td>GET</td><td>Daftar semua program + jumlah terisi</td></tr>
    <tr><td><code>?page=api/program&amp;kode=GAS-101</code></td><td>GET</td><td>Detail 1 program + daftar peserta-nya</td></tr>
    <tr><td><code>?page=api/stats</code></td><td>GET</td><td>Statistik global (total, per status, per program, rata-rata nilai)</td></tr>
  </table>

  <h2>Contoh response — <code>api/stats</code></h2>
  <pre>{
  "totalPeserta": 30,
  "perStatus": { "Lulus": 20, "Sedang Berjalan": 6, "Tidak Lulus": 4 },
  "perProgram": { "GAS-101": 9, "GAS-201": 7 },
  "rataNilai": 80.5,
  "lastUpdate": "2026-05-20T...",
  "cached": false,
  "cachedAt": "2026-05-20T..."
}</pre>

  <p><a href="?page=home">← Kembali ke home</a></p>
</body>
</html>`;
}
