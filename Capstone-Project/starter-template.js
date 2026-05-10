/**
 * Capstone Project — Starter Template
 *
 * File ini sebagai titik mulai. Kosongkan dan implementasi sesuai tema yang
 * Anda pilih. Struktur di bawah memenuhi syarat wajib (modular, audit log,
 * config, idempotent wrapper).
 *
 * Disarankan dipisah ke beberapa file .gs di project Apps Script Anda:
 *   - Main.gs           ← yang ini (orchestrator + trigger)
 *   - Config.gs         ← CONFIG()
 *   - Sheets.gs         ← helper Sheets
 *   - Drive.gs, Docs.gs, Email.gs, Calendar.gs ← helper service masing-masing
 *   - Utils.gs          ← audit_log, format helper, dll
 */


// ============================================================
// Config — semua dari Script Properties
// ============================================================
function CONFIG() {
  const props = PropertiesService.getScriptProperties();
  return {
    MASTER_SHEET_ID:   props.getProperty("MASTER_SHEET_ID"),
    AUDIT_SHEET_ID:    props.getProperty("AUDIT_SHEET_ID"),
    DRIVE_FOLDER_ID:   props.getProperty("DRIVE_FOLDER_ID"),
    TEMPLATE_DOC_ID:   props.getProperty("TEMPLATE_DOC_ID"),
    ADMIN_EMAIL:       props.getProperty("ADMIN_EMAIL") || Session.getActiveUser().getEmail(),
    WEB_APP_URL:       props.getProperty("WEB_APP_URL"),
    SLACK_WEBHOOK_URL: props.getProperty("SLACK_WEBHOOK_URL")
  };
}


// ============================================================
// Audit log — sheet "Audit-Log"
// ============================================================
function audit_log(handler, status, payload) {
  const cfg = CONFIG();
  if (!cfg.AUDIT_SHEET_ID) {
    Logger.log(`[AUDIT] ${handler} - ${status}: ${JSON.stringify(payload)}`);
    return;
  }

  try {
    const sheet = SpreadsheetApp.openById(cfg.AUDIT_SHEET_ID).getSheetByName("Audit-Log");
    sheet.appendRow([
      new Date(),
      Session.getActiveUser().getEmail(),
      handler,
      status,
      JSON.stringify(payload).substring(0, 5000)
    ]);
  } catch (err) {
    Logger.log(`Audit gagal: ${err.message}`);
  }
}


// ============================================================
// Idempotent wrapper — pakai untuk semua handler webhook/trigger
// ============================================================
function withIdempotency(key, handler) {
  const cache = CacheService.getScriptCache();
  if (cache.get(`idempo:${key}`)) {
    Logger.log(`Skip: ${key}`);
    return { skipped: true };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error("Tidak dapat lock.");

  try {
    if (cache.get(`idempo:${key}`)) return { skipped: true };
    const result = handler();
    cache.put(`idempo:${key}`, "1", 21600);
    return { processed: true, result };
  } finally {
    lock.releaseLock();
  }
}


// ============================================================
// Orchestrator template
// ============================================================
function workflowUtama(input) {
  const ctx = { stage: "init", input };

  try {
    ctx.stage = "step-1";
    // ... step 1

    ctx.stage = "step-2";
    // ... step 2

    ctx.stage = "step-3";
    // ... step 3

    audit_log("workflowUtama", "success", ctx);
  } catch (err) {
    audit_log("workflowUtama", "failed", { ...ctx, error: err.message });
    throw err;
  }
}


// ============================================================
// Trigger setup — pasang lewat function ini, bukan UI
// ============================================================
function pasangSemuaTrigger() {
  // Hapus dulu trigger lama dengan handler yang sama
  const handlers = ["workflowUtama", "harianReport"];
  ScriptApp.getProjectTriggers().forEach((t) => {
    if (handlers.includes(t.getHandlerFunction())) {
      ScriptApp.deleteTrigger(t);
    }
  });

  // Pasang baru
  ScriptApp.newTrigger("harianReport")
    .timeBased().atHour(7).everyDays(1).create();

  Logger.log("Trigger dipasang.");
}

function hapusSemuaTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((t) => ScriptApp.deleteTrigger(t));
  Logger.log(`${triggers.length} trigger dihapus.`);
}


// ============================================================
// Web App handler
// ============================================================
function doGet(e) {
  // Routing: ?action=...
  const action = (e && e.parameter && e.parameter.action) || "home";

  if (action === "approve") {
    return _handleApprove(e.parameter.id);
  }
  if (action === "reject") {
    return _handleReject(e.parameter.id);
  }

  // Default: home page
  return HtmlService.createHtmlOutput(`
    <html><body style="font-family: Arial; max-width: 600px; margin: 30px auto; padding: 0 20px;">
      <h1>Sistem [Nama Capstone]</h1>
      <p>Selamat datang.</p>
    </body></html>
  `);
}

function doPost(e) {
  // Untuk webhook receiver
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return _json({ ok: false, error: "Invalid JSON" });
  }

  // ... proses payload
  audit_log("webhook", "received", payload);
  return _json({ ok: true });
}

function _handleApprove(id) {
  // ... implementasi approve
  return HtmlService.createHtmlOutput("<h2>Approved.</h2>");
}

function _handleReject(id) {
  return HtmlService.createHtmlOutput("<h2>Rejected.</h2>");
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// Helper: validate config saat onboarding
// ============================================================
function validasiConfig() {
  const cfg = CONFIG();
  const wajib = ["MASTER_SHEET_ID", "AUDIT_SHEET_ID", "ADMIN_EMAIL"];

  const missing = wajib.filter((k) => !cfg[k]);
  if (missing.length > 0) {
    throw new Error(`Property belum diset: ${missing.join(", ")}`);
  }

  // Test akses
  try {
    SpreadsheetApp.openById(cfg.MASTER_SHEET_ID);
  } catch (err) {
    throw new Error(`MASTER_SHEET_ID tidak bisa dibuka: ${err.message}`);
  }

  Logger.log("✓ Config valid.");
}
