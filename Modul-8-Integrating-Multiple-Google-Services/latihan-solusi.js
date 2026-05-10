/**
 * Modul 8 — Solusi Latihan
 *
 * Untuk Soal 1 (modularisasi), bagi file ini menjadi beberapa .gs di
 * project Apps Script Anda — tapi function-nya tetap sama. Apps Script
 * tidak punya import; semua function di project sama bisa saling memanggil.
 */


/* ----- CONFIG ----- */
function _props() { return PropertiesService.getScriptProperties(); }
function CONFIG() {
  return {
    MASTER_SHEET_ID:        _props().getProperty("MASTER_SHEET_ID"),
    ONBOARDING_FOLDER_ID:   _props().getProperty("ONBOARDING_FOLDER_ID"),
    REPORTS_FOLDER_ID:      _props().getProperty("REPORTS_FOLDER_ID"),
    TEMPLATE_DOC_ID:        _props().getProperty("TEMPLATE_DOC_ID"),
    ADMIN_EMAIL:            _props().getProperty("ADMIN_EMAIL") || Session.getActiveUser().getEmail(),
    AUDIT_SHEET_ID:         _props().getProperty("AUDIT_SHEET_ID"),
    WEB_APP_URL:            _props().getProperty("WEB_APP_URL")
  };
}


/* ----- AUDIT ----- */
function audit_log(handler, status, payload) {
  const cfg = CONFIG();
  if (!cfg.AUDIT_SHEET_ID) return;
  try {
    const sheet = SpreadsheetApp.openById(cfg.AUDIT_SHEET_ID).getSheetByName("Audit");
    sheet.appendRow([
      new Date(),
      Session.getActiveUser().getEmail(),
      handler + " - " + status,
      JSON.stringify(payload).substring(0, 5000)
    ]);
  } catch (err) {
    Logger.log("Audit gagal: " + err.message);
  }
}


/* ----- Soal 2: Idempotent wrapper ----- */
function onboardingIdempotent(responseId, data) {
  const cache = CacheService.getScriptCache();
  if (cache.get(`onboard:${responseId}`)) {
    Logger.log(`Skip: ${responseId} sudah diproses.`);
    return { skipped: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error("Tidak dapat lock.");
  }

  try {
    if (cache.get(`onboard:${responseId}`)) return { skipped: true };

    onboardingHandler(data);

    cache.put(`onboard:${responseId}`, "1", 21600);
    return { processed: true };
  } finally {
    lock.releaseLock();
  }
}


/* ----- Soal 3: Daily Pipeline Report ----- */
function pasangPipelineReportTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "dailyPipelineReport")
    .forEach((t) => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger("dailyPipelineReport")
    .timeBased().atHour(7).everyDays(1).create();

  Logger.log("Trigger pipeline report dipasang.");
}

function dailyPipelineReport() {
  const ctx = { stage: "init" };
  const cfg = CONFIG();

  try {
    // 1. Baca pipeline
    ctx.stage = "read";
    const ss = SpreadsheetApp.openById(cfg.MASTER_SHEET_ID);
    const sheet = ss.getSheetByName("Pipeline");
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();

    const cStat   = headers.indexOf("Status");
    const cId     = headers.indexOf("Deal ID");
    const cCust   = headers.indexOf("Customer");
    const cNilai  = headers.indexOf("Nilai");
    const cUpdate = headers.indexOf("Tanggal Update");

    const open = data.filter((r) => r[cStat] === "Open");
    const totalNilai = open.reduce((sum, r) => sum + (Number(r[cNilai]) || 0), 0);

    // 2. Doc
    ctx.stage = "doc";
    const tanggal = Utilities.formatDate(
      new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"
    );
    const bulanLabel = Utilities.formatDate(
      new Date(), Session.getScriptTimeZone(), "MMM-yyyy"
    );

    const doc = DocumentApp.create(`Pipeline Report — ${tanggal}`);
    const body = doc.getBody();
    body.appendParagraph(`Pipeline Report — ${tanggal}`)
        .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph(`Total Open Deal: ${open.length}`);
    body.appendParagraph(`Total Pipeline Value: Rp ${totalNilai.toLocaleString("id-ID")}`);
    body.appendParagraph("");

    // Tabel
    const tableData = [["Deal ID", "Customer", "Nilai", "Last Update"]];
    open.forEach((r) => {
      const upd = r[cUpdate] instanceof Date
        ? r[cUpdate].toLocaleDateString("id-ID")
        : String(r[cUpdate]);
      tableData.push([
        String(r[cId]),
        String(r[cCust]),
        "Rp " + Number(r[cNilai]).toLocaleString("id-ID"),
        upd
      ]);
    });
    body.appendTable(tableData);
    doc.saveAndClose();

    // 3. Pindah ke folder bulan
    ctx.stage = "drive-move";
    const reportsFolder = DriveApp.getFolderById(cfg.REPORTS_FOLDER_ID);
    const cariBulan = reportsFolder.getFoldersByName(bulanLabel);
    const folder = cariBulan.hasNext() ? cariBulan.next() : reportsFolder.createFolder(bulanLabel);
    DriveApp.getFileById(doc.getId()).moveTo(folder);

    // 4. Export PDF
    ctx.stage = "pdf";
    const pdfBlob = DriveApp.getFileById(doc.getId()).getAs("application/pdf");
    const pdfFile = folder.createFile(pdfBlob).setName(doc.getName() + ".pdf");

    // 5. Email
    ctx.stage = "email";
    MailApp.sendEmail({
      to: cfg.ADMIN_EMAIL,
      subject: `Pipeline Report — ${tanggal}`,
      body: `Total Open Deal: ${open.length}\nTotal Value: Rp ${totalNilai.toLocaleString("id-ID")}\n\nPDF terlampir.`,
      attachments: [pdfFile.getBlob()]
    });

    audit_log("dailyPipelineReport", "success", {
      ...ctx, openCount: open.length, totalNilai, pdfUrl: pdfFile.getUrl()
    });
  } catch (err) {
    audit_log("dailyPipelineReport", "failed", { ...ctx, error: err.message });
    throw err;
  }
}


/* ----- Soal 4: Cache Layer ----- */
function getKursCached() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("kurs-idr");
  if (cached) {
    Logger.log("Cache hit");
    return JSON.parse(cached);
  }

  Logger.log("Cache miss, fetching...");
  const r = UrlFetchApp.fetch("https://api.exchangerate-api.com/v4/latest/USD", {
    muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) return null;

  const data = JSON.parse(r.getContentText());
  cache.put("kurs-idr", JSON.stringify(data), 3600);
  return data;
}

function tampilKurs() {
  for (let i = 0; i < 3; i++) {
    const data = getKursCached();
    Logger.log(`Run #${i + 1}: USD/IDR = ${data ? data.rates.IDR : "n/a"}`);
  }
}


/* ----- Soal 5: Sistem Cuti — sudah lengkap di contoh.js ----- */
// Lihat contoh.js untuk: pengajuanCutiHandler, doGet, cuti_processApproval, dll.
// Soal 5 adalah test integrasi end-to-end manual.


/* ----- Soal 6: Diagnose ----- */
function diagnose() {
  const cfg = CONFIG();
  const out = [];
  let anomaly = false;

  // 1. Audit history untuk dailyPipelineReport
  if (cfg.AUDIT_SHEET_ID) {
    const sheet = SpreadsheetApp.openById(cfg.AUDIT_SHEET_ID).getSheetByName("Audit");
    const data = sheet.getDataRange().getValues();
    const last10 = data.slice(-11, -1)   // skip header
      .filter((r) => String(r[2]).startsWith("dailyPipelineReport"));

    out.push(`=== Audit history (${last10.length} entry) ===`);
    last10.forEach((r) => {
      out.push(`${r[0].toLocaleString("id-ID")} - ${r[2]} - ${String(r[3]).substring(0, 200)}`);
    });

    if (last10.some((r) => String(r[2]).includes("failed"))) {
      anomaly = true;
    }
  }

  // 2. Trigger
  const triggers = ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "dailyPipelineReport");
  out.push(`\n=== Trigger ===`);
  out.push(`Trigger pipeline report aktif: ${triggers.length > 0 ? "YA" : "TIDAK"}`);
  if (triggers.length === 0) anomaly = true;

  // 3. Folder
  out.push(`\n=== Folder Reports ===`);
  try {
    const folder = DriveApp.getFolderById(cfg.REPORTS_FOLDER_ID);
    out.push(`Folder accessible: YA (${folder.getName()})`);
  } catch (err) {
    out.push(`Folder error: ${err.message}`);
    anomaly = true;
  }

  // 4. Quota email
  const sisa = MailApp.getRemainingDailyQuota();
  out.push(`\n=== Quota ===`);
  out.push(`Sisa email hari ini: ${sisa}`);
  if (sisa < 10) anomaly = true;

  const report = out.join("\n");
  Logger.log(report);

  if (anomaly) {
    MailApp.sendEmail({
      to: cfg.ADMIN_EMAIL,
      subject: "[Diagnose] Anomali terdeteksi",
      body: report
    });
    Logger.log("Anomali → email ke admin.");
  }
}
