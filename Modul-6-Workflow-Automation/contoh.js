/**
 * Modul 6 — Workflow Automation (Triggers)
 *
 * Cara aman bereksperimen:
 *   - Mulai dari Run manual di editor untuk validasi function.
 *   - Pasang trigger pakai pasangXxx().
 *   - Cek hasil di sidebar Executions.
 *   - HAPUS trigger setelah selesai latihan: hapusSemuaTrigger().
 */


/* =========================================================================
 * BAGIAN 1 — Manajemen trigger
 * ========================================================================= */

function listTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  Logger.log(`Total trigger aktif: ${triggers.length}`);
  triggers.forEach((t) => {
    Logger.log(`  ${t.getHandlerFunction()} | ${t.getTriggerSource()} | ${t.getEventType()}`);
  });
}

function hapusSemuaTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((t) => ScriptApp.deleteTrigger(t));
  Logger.log(`${triggers.length} trigger dihapus.`);
}

function hapusTriggerBernama(handlerName) {
  let count = 0;
  ScriptApp.getProjectTriggers().forEach((t) => {
    if (t.getHandlerFunction() === handlerName) {
      ScriptApp.deleteTrigger(t);
      count++;
    }
  });
  Logger.log(`${count} trigger '${handlerName}' dihapus.`);
}


/* =========================================================================
 * BAGIAN 2 — Time-driven triggers
 * ========================================================================= */

function pasangTriggerHarian() {
  hapusTriggerBernama("kirimLaporanHarian");
  ScriptApp.newTrigger("kirimLaporanHarian")
    .timeBased()
    .atHour(7)
    .everyDays(1)
    .create();
  Logger.log("Trigger harian jam 7 dipasang.");
}

function pasangTriggerTiap15Menit() {
  hapusTriggerBernama("checkInbox");
  ScriptApp.newTrigger("checkInbox")
    .timeBased()
    .everyMinutes(15)
    .create();
  Logger.log("Trigger tiap 15 menit dipasang.");
}

function pasangTriggerSenin() {
  hapusTriggerBernama("laporanMingguan");
  ScriptApp.newTrigger("laporanMingguan")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();
  Logger.log("Trigger Senin jam 8 dipasang.");
}


/* =========================================================================
 * BAGIAN 3 — Function yang dipanggil oleh trigger
 * ========================================================================= */

function kirimLaporanHarian() {
  const me = Session.getActiveUser().getEmail();
  const tanggal = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), "dd MMMM yyyy"
  );

  MailApp.sendEmail({
    to: me,
    subject: `Laporan Harian — ${tanggal}`,
    body: "Ini laporan harian otomatis."
  });

  Logger.log("Laporan harian dikirim.");
}

function checkInbox() {
  const threads = GmailApp.search("is:unread newer_than:30m", 0, 5);
  Logger.log(`[${new Date().toISOString()}] ${threads.length} email baru.`);
}

function laporanMingguan() {
  Logger.log(`[${new Date().toISOString()}] Laporan mingguan jalan.`);
}


/* =========================================================================
 * BAGIAN 4 — Event-driven triggers
 * ========================================================================= */

function pasangTriggerEdit() {
  hapusTriggerBernama("onEditWithMail");
  ScriptApp.newTrigger("onEditWithMail")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
  Logger.log("Trigger onEdit dipasang.");
}

function onEditWithMail(e) {
  // e.range, e.value, e.oldValue
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  const col   = e.range.getColumn();

  // Kalau kolom 5 di sheet "Tugas" diset URGENT, kirim notif ke diri sendiri
  if (sheet.getName() === "Tugas" && col === 5 && e.value === "URGENT") {
    const baris = e.range.getRow();
    MailApp.sendEmail(
      Session.getActiveUser().getEmail(),
      `Item URGENT di baris ${baris}`,
      `Sheet ${sheet.getName()} baris ${baris} di-flag URGENT.`
    );
  }
}


/* =========================================================================
 * BAGIAN 5 — PropertiesService (state antar eksekusi)
 * ========================================================================= */

function syncIncremental() {
  const props = PropertiesService.getScriptProperties();
  const lastRun = props.getProperty("lastSyncTime");
  const now = new Date();

  Logger.log(`Last sync: ${lastRun || "(belum pernah)"}`);
  Logger.log(`Sync sekarang: ${now.toISOString()}`);

  // Simulasi proses (ganti dengan logic asli — query Gmail since lastRun, dll)
  // ...

  props.setProperty("lastSyncTime", now.toISOString());
}

function resetState() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log("State direset.");
}


/* =========================================================================
 * BAGIAN 6 — LockService
 * ========================================================================= */

function syncAman() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    Logger.log("Sync lain sedang berjalan. Skip.");
    return;
  }

  try {
    Logger.log("Mulai sync...");
    Utilities.sleep(2000);   // simulasi pekerjaan
    Logger.log("Sync selesai.");
  } finally {
    lock.releaseLock();
  }
}


/* =========================================================================
 * BAGIAN 7 — Mini-project: Reminder Kontrak (Time-driven)
 *
 * PRASYARAT: Sheet bernama "Kontrak" dengan kolom:
 *   Nama Klien | Email | Tanggal Berakhir | Reminded H-30
 *
 * Pasang dengan: pasangTriggerKontrak()
 * ========================================================================= */

function pasangTriggerKontrak() {
  hapusTriggerBernama("reminderKontrakHarian");
  ScriptApp.newTrigger("reminderKontrakHarian")
    .timeBased()
    .atHour(7)
    .everyDays(1)
    .create();
  Logger.log("Trigger kontrak harian dipasang.");
}

function reminderKontrakHarian() {
  const SHEET_ID = "GANTI_DENGAN_ID_SHEET_KONTRAK";
  const MANAGER_EMAIL = Session.getActiveUser().getEmail();

  if (SHEET_ID === "GANTI_DENGAN_ID_SHEET_KONTRAK") {
    Logger.log("Set SHEET_ID dulu.");
    return;
  }

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Kontrak");
  if (!sheet) return;

  const range = sheet.getDataRange();
  const data  = range.getValues();
  const h = data[0];
  const cNama  = h.indexOf("Nama Klien");
  const cEmail = h.indexOf("Email");
  const cTgl   = h.indexOf("Tanggal Berakhir");
  const cFlag  = h.indexOf("Reminded H-30");

  const sekarang = new Date();
  const batas = new Date(sekarang.getTime() + 30 * 24 * 60 * 60 * 1000);

  let kirim = 0;
  for (let i = 1; i < data.length; i++) {
    const tgl = data[i][cTgl] instanceof Date ? data[i][cTgl] : new Date(data[i][cTgl]);
    const sudah = data[i][cFlag];

    if (!sudah && tgl >= sekarang && tgl <= batas) {
      const tglStr = tgl.toLocaleDateString("id-ID");
      const nama = data[i][cNama];

      // Email klien
      MailApp.sendEmail({
        to: data[i][cEmail],
        subject: `Reminder: Kontrak ${nama} berakhir ${tglStr}`,
        body: `Halo ${nama},\n\nKontrak Anda akan berakhir pada ${tglStr}. Silakan hubungi kami untuk perpanjangan.\n\nTerima kasih.`
      });

      // Notif manager
      MailApp.sendEmail({
        to: MANAGER_EMAIL,
        subject: `[Internal] ${nama} — kontrak berakhir ${tglStr}`,
        body: `Reminder telah dikirim ke ${data[i][cEmail]} untuk klien ${nama}.`
      });

      data[i][cFlag] = "✓";
      kirim++;
    }
  }

  range.setValues(data);
  Logger.log(`${kirim} reminder dikirim.`);
}
