/**
 * Modul 8 — Integrating Multiple Google Services
 *
 * Project ini idealnya dipisah ke beberapa file .gs:
 *   - Main.gs (orchestrator + trigger)
 *   - Sheets.gs, Drive.gs, Docs.gs, Email.gs, Cuti.gs, Utils.gs
 *
 * Untuk demo dan baca lebih mudah, semua disatukan di file ini dengan
 * komentar pemisah.
 *
 * Required Script Properties:
 *   MASTER_SHEET_ID, ONBOARDING_FOLDER_ID, TEMPLATE_DOC_ID,
 *   ADMIN_EMAIL, AUDIT_SHEET_ID
 */


// ============================================================
// Config & helper props
// ============================================================
function _props() { return PropertiesService.getScriptProperties(); }

function CONFIG() {
  return {
    MASTER_SHEET_ID:        _props().getProperty("MASTER_SHEET_ID"),
    ONBOARDING_FOLDER_ID:   _props().getProperty("ONBOARDING_FOLDER_ID"),
    TEMPLATE_DOC_ID:        _props().getProperty("TEMPLATE_DOC_ID"),
    ADMIN_EMAIL:            _props().getProperty("ADMIN_EMAIL") || Session.getActiveUser().getEmail(),
    AUDIT_SHEET_ID:         _props().getProperty("AUDIT_SHEET_ID"),
    WEB_APP_URL:            _props().getProperty("WEB_APP_URL")
  };
}


// ============================================================
// Audit Log
// ============================================================
function audit_log(status, payload) {
  const cfg = CONFIG();
  if (!cfg.AUDIT_SHEET_ID) {
    console.log(`[AUDIT] ${status}: ${JSON.stringify(payload)}`);
    return;
  }

  try {
    const sheet = SpreadsheetApp.openById(cfg.AUDIT_SHEET_ID).getSheetByName("Audit");
    sheet.appendRow([
      new Date(),
      Session.getActiveUser().getEmail(),
      status,
      JSON.stringify(payload).substring(0, 5000)
    ]);
  } catch (err) {
    console.log(`Audit gagal: ${err.message}`);
  }
}


// ============================================================
// Sheets helper
// ============================================================
function sheets_appendKaryawan(data) {
  const sheet = SpreadsheetApp.openById(CONFIG().MASTER_SHEET_ID).getSheetByName("Karyawan-Master");
  sheet.appendRow([
    data.nama,
    data.email,
    data.divisi,
    data.tanggalMulai,
    new Date()
  ]);
}

function sheets_readPipeline() {
  const sheet = SpreadsheetApp.openById(CONFIG().MASTER_SHEET_ID).getSheetByName("Pipeline");
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map((row) => {
    const obj = {};
    headers.forEach((k, i) => { obj[k] = row[i]; });
    return obj;
  });
}


// ============================================================
// Drive helper
// ============================================================
function drive_findOrCreateFolder(parentId, nama) {
  const parent = DriveApp.getFolderById(parentId);
  const cari = parent.getFoldersByName(nama);
  return cari.hasNext() ? cari.next() : parent.createFolder(nama);
}

function drive_createOnboardingFolder(namaKaryawan) {
  const cfg = CONFIG();
  const parent = DriveApp.getFolderById(cfg.ONBOARDING_FOLDER_ID);
  const nama = `Onboarding - ${namaKaryawan}`;
  const cari = parent.getFoldersByName(nama);
  return cari.hasNext() ? cari.next() : parent.createFolder(nama);
}

function drive_exportPDF(doc, folder, fileName) {
  const blob = DriveApp.getFileById(doc.getId()).getAs("application/pdf");
  return folder.createFile(blob).setName(fileName);
}


// ============================================================
// Docs helper
// ============================================================
function docs_generateWelcomeLetter(data, folder) {
  const cfg = CONFIG();
  const copy = DriveApp.getFileById(cfg.TEMPLATE_DOC_ID)
    .makeCopy(`Welcome - ${data.nama}`, folder);
  const doc = DocumentApp.openById(copy.getId());
  const body = doc.getBody();

  Object.keys(data).forEach((k) => {
    body.replaceText(`\\{\\{${k}\\}\\}`, String(data[k]));
  });

  doc.saveAndClose();
  return doc.getUrl();
}


// ============================================================
// Email helper
// ============================================================
function email_sendWelcome(data, docUrl) {
  MailApp.sendEmail({
    to: data.email,
    cc: CONFIG().ADMIN_EMAIL,
    subject: `Welcome aboard, ${data.nama}!`,
    htmlBody: `
      <p>Halo <b>${data.nama}</b>,</p>
      <p>Selamat datang di tim! Berikut beberapa link penting:</p>
      <ul>
        <li>Welcome Letter: <a href="${docUrl}">${docUrl}</a></li>
        <li>Tanggal mulai: ${data.tanggalMulai}</li>
      </ul>
      <p>Sampai jumpa hari pertama!</p>
    `
  });
}


// ============================================================
// Calendar helper
// ============================================================
function calendar_createOrientation(data) {
  const cal = CalendarApp.getDefaultCalendar();
  const mulai = new Date(data.tanggalMulai);
  mulai.setHours(9, 0, 0, 0);
  const selesai = new Date(mulai.getTime() + 2 * 60 * 60 * 1000);

  const event = cal.createEvent(`First Day Orientation - ${data.nama}`, mulai, selesai, {
    description: "Orientasi karyawan baru",
    guests: data.email,
    sendInvites: true
  });
  return event.getId();
}


// ============================================================
// Orchestrator: Onboarding
// ============================================================
function onboardingHandler(data) {
  const ctx = { stage: "init", data };

  try {
    ctx.stage = "sheet";
    sheets_appendKaryawan(data);

    ctx.stage = "drive";
    const folder = drive_createOnboardingFolder(data.nama);

    ctx.stage = "docs";
    const docUrl = docs_generateWelcomeLetter(data, folder);

    ctx.stage = "calendar";
    const eventId = calendar_createOrientation(data);

    ctx.stage = "email";
    email_sendWelcome(data, docUrl);

    audit_log("onboarding-success", { ...ctx, docUrl, eventId });
    console.log(`Onboarding selesai untuk ${data.nama}.`);
  } catch (err) {
    audit_log("onboarding-failed", { ...ctx, error: err.message });
    throw err;
  }
}


// Demo: jalankan onboarding manual dengan dummy data
function ujiOnboarding() {
  onboardingHandler({
    nama:          "Sari Wulandari",
    email:         Session.getActiveUser().getEmail(),
    divisi:        "Finance",
    tanggalMulai:  "2026-06-01"
  });
}


// ============================================================
// Form submit handler (idempotent)
// ============================================================
function pasangTriggerOnboarding() {
  const FORM_ID = _props().getProperty("ONBOARDING_FORM_ID");
  if (!FORM_ID) {
    console.log("Set ONBOARDING_FORM_ID dulu.");
    return;
  }

  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "onFormSubmitOnboarding")
    .forEach((t) => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger("onFormSubmitOnboarding")
    .forForm(FormApp.openById(FORM_ID))
    .onFormSubmit().create();

  console.log("Trigger onboarding dipasang.");
}

function onFormSubmitOnboarding(e) {
  const responseId = e.response.getId();
  const cache = CacheService.getScriptCache();

  if (cache.get(`onboard:${responseId}`)) {
    console.log("Sudah diproses. Skip.");
    return;
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    console.log("Gagal dapat lock.");
    return;
  }

  try {
    if (cache.get(`onboard:${responseId}`)) return;

    const items = e.response.getItemResponses();
    const data = {};
    items.forEach((item) => {
      const title = item.getItem().getTitle();
      data[title.toLowerCase().replace(/\s+/g, "")] = item.getResponse();
    });

    onboardingHandler(data);
    cache.put(`onboard:${responseId}`, "1", 21600);
  } finally {
    lock.releaseLock();
  }
}


// ============================================================
// CacheService demo
// ============================================================
function ambilDataKursCached() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("kurs");
  if (cached) {
    console.log("Cache hit");
    return JSON.parse(cached);
  }

  console.log("Cache miss, fetching...");
  const r = UrlFetchApp.fetch("https://api.exchangerate-api.com/v4/latest/USD", {
    muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) return null;
  const data = JSON.parse(r.getContentText());

  cache.put("kurs", JSON.stringify(data), 3600);
  return data;
}


// ============================================================
// Mini-Project: Sistem Cuti
// ============================================================
function pengajuanCutiHandler(e) {
  const items = e.response.getItemResponses();
  const data = {};
  items.forEach((item) => {
    data[item.getItem().getTitle()] = item.getResponse();
  });

  const ctx = { stage: "init", data };

  try {
    // 1. Validasi kuota
    ctx.stage = "validasi";
    const sisa = cuti_cekKuota(data["Email"]);
    const dibutuhkan = cuti_hitungJumlahHari(data["Tanggal Mulai"], data["Tanggal Selesai"]);
    if (sisa < dibutuhkan) {
      MailApp.sendEmail({
        to: data["Email"],
        subject: "Cuti ditolak — kuota tidak cukup",
        body: `Sisa kuota: ${sisa} hari. Kebutuhan: ${dibutuhkan} hari.`
      });
      audit_log("cuti-ditolak-kuota", ctx);
      return;
    }

    // 2. Append ke Sheet Cuti
    ctx.stage = "sheet";
    const cutiId = cuti_appendPengajuan(data);

    // 3. Email ke manager dengan link approve/reject
    ctx.stage = "notif-manager";
    const cfg = CONFIG();
    const linkApprove = `${cfg.WEB_APP_URL}?action=approve&id=${cutiId}`;
    const linkReject  = `${cfg.WEB_APP_URL}?action=reject&id=${cutiId}`;

    MailApp.sendEmail({
      to: cfg.ADMIN_EMAIL,
      subject: `[Approval Cuti] ${data["Nama"]} — ${dibutuhkan} hari`,
      htmlBody: `
        <p><b>${data["Nama"]}</b> mengajukan cuti.</p>
        <ul>
          <li>Jenis: ${data["Jenis Cuti"]}</li>
          <li>Tanggal: ${data["Tanggal Mulai"]} — ${data["Tanggal Selesai"]}</li>
          <li>Alasan: ${data["Alasan"] || "(tidak diisi)"}</li>
        </ul>
        <p>
          <a href="${linkApprove}" style="background: #16a34a; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">✓ Approve</a>
          &nbsp;
          <a href="${linkReject}" style="background: #dc2626; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">✗ Reject</a>
        </p>
      `
    });

    audit_log("cuti-pending-approval", { cutiId, ...ctx });
  } catch (err) {
    audit_log("cuti-failed", { ...ctx, error: err.message });
    throw err;
  }
}

function cuti_cekKuota(email) {
  const sheet = SpreadsheetApp.openById(CONFIG().MASTER_SHEET_ID).getSheetByName("Kuota-Cuti");
  const data = sheet.getDataRange().getValues();
  const cEmail = data[0].indexOf("Email");
  const cSisa  = data[0].indexOf("Sisa");
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][cEmail]).toLowerCase() === email.toLowerCase()) {
      return Number(data[i][cSisa]) || 0;
    }
  }
  return 0;
}

function cuti_hitungJumlahHari(tanggalMulai, tanggalSelesai) {
  const m = new Date(tanggalMulai);
  const s = new Date(tanggalSelesai);
  return Math.round((s - m) / (24 * 60 * 60 * 1000)) + 1;
}

function cuti_appendPengajuan(data) {
  const sheet = SpreadsheetApp.openById(CONFIG().MASTER_SHEET_ID).getSheetByName("Pengajuan-Cuti");
  const id = "CUT-" + Date.now();
  sheet.appendRow([
    id,
    new Date(),
    data["Nama"],
    data["Email"],
    data["Jenis Cuti"],
    data["Tanggal Mulai"],
    data["Tanggal Selesai"],
    data["Alasan"] || "",
    "Pending"
  ]);
  return id;
}


// Web App handler untuk approve/reject
function doGet(e) {
  const action = e.parameter.action;
  const id     = e.parameter.id;

  if (!action || !id) {
    return HtmlService.createHtmlOutput("Parameter action & id wajib.");
  }

  const result = cuti_processApproval(id, action);

  return HtmlService.createHtmlOutput(`
    <html><body style="font-family: Arial; padding: 30px; max-width: 500px;">
      <h2>${result.ok ? "✅ Berhasil" : "❌ Gagal"}</h2>
      <p>${result.message}</p>
    </body></html>
  `);
}

function cuti_processApproval(id, action) {
  if (action !== "approve" && action !== "reject") {
    return { ok: false, message: "Action tidak valid." };
  }

  const sheet = SpreadsheetApp.openById(CONFIG().MASTER_SHEET_ID).getSheetByName("Pengajuan-Cuti");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const cId = headers.indexOf("ID");
  const cStatus = headers.indexOf("Status");

  for (let i = 1; i < data.length; i++) {
    if (data[i][cId] === id) {
      if (data[i][cStatus] !== "Pending") {
        return { ok: false, message: `Sudah diproses sebelumnya: ${data[i][cStatus]}.` };
      }

      const status = action === "approve" ? "Approved" : "Rejected";
      sheet.getRange(i + 1, cStatus + 1).setValue(status);

      const email = data[i][headers.indexOf("Email")];
      const nama  = data[i][headers.indexOf("Nama")];
      const mulai = data[i][headers.indexOf("Tanggal Mulai")];
      const sel   = data[i][headers.indexOf("Tanggal Selesai")];

      // Email ke karyawan
      MailApp.sendEmail({
        to: email,
        subject: `Cuti Anda di-${status.toLowerCase()}`,
        htmlBody: `<p>Halo ${nama}, pengajuan cuti Anda telah <b>${status}</b>.</p>`
      });

      if (action === "approve") {
        // Bikin event Calendar all-day
        const cal = CalendarApp.getDefaultCalendar();
        cal.createAllDayEventSeries(
          `Cuti — ${nama}`,
          new Date(mulai),
          new Date(new Date(sel).getTime() + 24 * 60 * 60 * 1000),
          CalendarApp.newRecurrence().addDailyRule().until(new Date(sel))
        );

        // Kurangi kuota
        const jumlah = cuti_hitungJumlahHari(mulai, sel);
        cuti_kurangiKuota(email, jumlah);
      }

      audit_log("cuti-" + action, { id, nama, email });
      return { ok: true, message: `Cuti ${nama} berhasil di-${status.toLowerCase()}.` };
    }
  }

  return { ok: false, message: "ID tidak ditemukan." };
}

function cuti_kurangiKuota(email, jumlah) {
  const sheet = SpreadsheetApp.openById(CONFIG().MASTER_SHEET_ID).getSheetByName("Kuota-Cuti");
  const data = sheet.getDataRange().getValues();
  const cEmail = data[0].indexOf("Email");
  const cSisa  = data[0].indexOf("Sisa");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][cEmail]).toLowerCase() === email.toLowerCase()) {
      sheet.getRange(i + 1, cSisa + 1).setValue((data[i][cSisa] || 0) - jumlah);
      return;
    }
  }
}
